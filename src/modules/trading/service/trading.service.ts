import { tradingRepository } from '../repository/trading.repository';
import { walletService } from '../../wallet/service/wallet.service';
import { ledgerService } from '../../ledger/service/ledger.service';
import prisma from '../../../config/database';
import { NotFoundError } from '../../../utils/errors';
import { TradeQueryDTO } from '../types/trading.types';
import { NORMAL_TRADE_PROFIT_RATE } from '../constants/trading.constants';
import { TradeStatus, TradeType, WalletType, LedgerType, UserRole } from '@prisma/client';

export class TradingService {
  /**
   * Execute trade session for all eligible auto-trade users
   * Rule: Each trade uses 1% of Principal Wallet. Duration: 2 Minutes.
   */
  async executeTradeSession(tradeType: TradeType = TradeType.MORNING) {
    // Find all users with autoTradeStatus = true
    const eligibleUsers = await prisma.user.findMany({
      where: {
        autoTradeStatus: true,
        status: 'ACTIVE',
      },
    });

    const createdTrades = [];
    const now = new Date();
    const settlementTime = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes later

    for (const user of eligibleUsers) {
      try {
        // Fetch Principal Wallet Balance
        const principalBalance = await walletService.getBalance(user.id, WalletType.PRINCIPAL);

        // Must have positive principal balance to trade
        if (principalBalance <= 0) {
          continue;
        }

        // Calculate 1% of Principal Wallet
        const tradeAmount = Number((principalBalance * 0.01).toFixed(8));
        if (tradeAmount <= 0) {
          continue;
        }

        // Lock/Deduct 1% trade amount from Principal Wallet for 2 mins (or place trade entry)
        const debitResult = await walletService.debitWallet(user.id, WalletType.PRINCIPAL, tradeAmount);

        // Create Ledger Entry for Trade Entry
        await ledgerService.createEntry({
          userId: user.id,
          walletId: debitResult.wallet.id,
          type: LedgerType.TRADE_ENTRY,
          credit: 0,
          debit: tradeAmount,
          beforeBalance: debitResult.beforeBalance,
          afterBalance: debitResult.afterBalance,
          description: `Auto Trade Entry (${tradeType}) - 1% of Principal`,
          referenceType: 'TRADE',
        });

        // Create Trade record in database
        const trade = await tradingRepository.create({
          userId: user.id,
          tradeAmount,
          tradeType,
          status: TradeStatus.PENDING,
          entryTime: now,
          settlementTime,
          metadata: {
            principalAtEntry: principalBalance,
          },
        });

        createdTrades.push(trade);
      } catch (error) {
        console.error(`Failed to execute trade session for user ${user.id}:`, error);
      }
    }

    return {
      totalExecuted: createdTrades.length,
      trades: createdTrades,
    };
  }

  /**
   * Settle all pending trades past settlementTime (2 minutes)
   * Rule: Profit distribution: 60% User (Trading Profit Wallet), 40% Admin (Admin Commission Wallet)
   */
  async settlePendingTrades() {
    const pendingTrades = await tradingRepository.findPendingTradesToSettle();
    const settledResults = [];

    for (const trade of pendingTrades) {
      try {
        const tradeAmount = Number(trade.tradeAmount);

        // Calculate trade profit percentage. Use sponsor trade bonus rate if active,
        // otherwise fall back to the normal 100% return on trade amount.
        const now = new Date();
        const hasActiveBonus = trade.user.sponsorTradeBonusExpiry && trade.user.sponsorTradeBonusExpiry > now;
        const profitRate = hasActiveBonus && trade.user.sponsorTradeBonusRate
          ? trade.user.sponsorTradeBonusRate
          : NORMAL_TRADE_PROFIT_RATE;
        const grossProfit = Number((tradeAmount * profitRate).toFixed(8));

        // 60% User Profit, 40% Admin Commission
        const userProfit = Number((grossProfit * 0.60).toFixed(8));
        const adminCommission = Number((grossProfit * 0.40).toFixed(8));

        // Atomically mark the trade as completed. If another process already
        // settled it (race condition), skip the wallet/ledger side effects.
        const settledTrade = await tradingRepository.settleTrade(trade.id, {
          status: TradeStatus.COMPLETED,
          profit: userProfit,
          commission: adminCommission,
          profitPercentage: profitRate * 100,
          exitTime: new Date(),
        });

        if (!settledTrade) {
          console.log(`[TRADE] Skipping already settled trade ${trade.id}`);
          continue;
        }

        // Return original 1% trade amount back to Principal Wallet
        const creditPrincipal = await walletService.creditWallet(trade.userId, WalletType.PRINCIPAL, tradeAmount);
        await ledgerService.createEntry({
          userId: trade.userId,
          walletId: creditPrincipal.wallet.id,
          type: LedgerType.TRADE_EXIT,
          credit: tradeAmount,
          debit: 0,
          beforeBalance: creditPrincipal.beforeBalance,
          afterBalance: creditPrincipal.afterBalance,
          description: `Return Principal trade entry amount (${trade.tradeType})`,
          referenceId: trade.id,
          referenceType: 'TRADE',
        });

        // 1. Credit 60% profit to User's Trading Profit Wallet
        if (userProfit > 0) {
          const userWalletResult = await walletService.creditWallet(trade.userId, WalletType.TRADING_PROFIT, userProfit);
          await ledgerService.createEntry({
            userId: trade.userId,
            walletId: userWalletResult.wallet.id,
            type: LedgerType.TRADE_PROFIT,
            credit: userProfit,
            debit: 0,
            beforeBalance: userWalletResult.beforeBalance,
            afterBalance: userWalletResult.afterBalance,
            description: `Trading Profit Share (60%) - Trade #${trade.id.substring(0, 8)}`,
            referenceId: trade.id,
            referenceType: 'TRADE',
          });
        }

        // 2. Credit 40% commission to Admin Commission Wallet
        if (adminCommission > 0) {
          // Find system admin user or primary admin
          const adminUser = await prisma.user.findFirst({
            where: { role: UserRole.ADMIN },
          });

          if (adminUser) {
            const adminWalletResult = await walletService.creditWallet(adminUser.id, WalletType.ADMIN_COMMISSION, adminCommission);
            await ledgerService.createEntry({
              userId: adminUser.id,
              walletId: adminWalletResult.wallet.id,
              type: LedgerType.ADMIN_COMMISSION,
              credit: adminCommission,
              debit: 0,
              beforeBalance: adminWalletResult.beforeBalance,
              afterBalance: adminWalletResult.afterBalance,
              description: `Admin Trading Commission Share (40%) - Trade #${trade.id.substring(0, 8)}`,
              referenceId: trade.id,
              referenceType: 'TRADE',
            });
          }
        }

        settledResults.push(settledTrade);
      } catch (error) {
        console.error(`Failed to settle trade ${trade.id}:`, error);
      }
    }

    return {
      settledCount: settledResults.length,
      trades: settledResults,
    };
  }

  /**
   * Get user trades
   */
  async getUserTrades(userId: string, query: TradeQueryDTO) {
    return tradingRepository.findByUserId(userId, {
      status: query.status,
      tradeType: query.tradeType,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 20,
    });
  }

  /**
   * Get all trades (admin)
   */
  async getAllTrades(query: TradeQueryDTO) {
    return tradingRepository.findAll({
      status: query.status,
      tradeType: query.tradeType,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 20,
    });
  }

  /**
   * Get trade by ID
   */
  async getTradeById(id: string) {
    const trade = await tradingRepository.findById(id);
    if (!trade) {
      throw new NotFoundError('Trade not found');
    }
    return trade;
  }

  /**
   * Get trade statistics
   */
  async getStatistics(userId?: string) {
    return tradingRepository.getStatistics(userId);
  }

  /**
   * Get recent completed trades for the public activity feed.
   */
  async getRecentTrades(limit = 20) {
    return tradingRepository.findRecent(limit);
  }
}

export const tradingService = new TradingService();
export default tradingService;
