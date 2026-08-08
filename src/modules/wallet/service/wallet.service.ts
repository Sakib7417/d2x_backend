import { walletRepository } from '../repository/wallet.repository';
import { WALLET_ERRORS, ALLOWED_TRANSFERS } from '../constants/wallet.constants';
import {
  BadRequestError,
  NotFoundError,
} from '../../../utils/errors';
import { WalletType, LedgerType, ReferenceType } from '@prisma/client';
import { ledgerService } from '../../ledger/service/ledger.service';

export class WalletService {
  /**
   * Get wallet by type for user
   */
  async getWallet(userId: string, type?: WalletType) {
    if (type) {
      const wallet = await walletRepository.findByUserIdAndType(userId, type);
      if (!wallet) {
        throw new NotFoundError(WALLET_ERRORS.WALLET_NOT_FOUND);
      }
      return wallet;
    }
    return walletRepository.findByUserId(userId);
  }

  /**
   * Get wallet summary for user
   */
  async getWalletSummary(userId: string) {
    const wallets = await walletRepository.findByUserId(userId);
    
    const summary: Record<string, any> = {};
    let totalBalance = 0;

    wallets.forEach((wallet) => {
      summary[wallet.type.toLowerCase()] = {
        balance: wallet.balance.toString(),
        totalCredit: wallet.totalCredit.toString(),
        totalDebit: wallet.totalDebit.toString(),
      };
      totalBalance += Number(wallet.balance);
    });

    summary.totalBalance = totalBalance.toString();

    return summary;
  }

  /**
   * Initialize wallets for new user
   */
  async initializeWallets(userId: string) {
    return walletRepository.createAllWallets(userId);
  }

  /**
   * Transfer between wallets
   */
  async transfer(userId: string, fromType: WalletType, toType: WalletType, amount: number) {
    // Validate amount
    if (amount <= 0) {
      throw new BadRequestError(WALLET_ERRORS.ZERO_AMOUNT);
    }

    // Check if same wallet type
    if (fromType === toType) {
      throw new BadRequestError(WALLET_ERRORS.TRANSFER_SAME_WALLET);
    }

    // Check if transfer is allowed
    const allowedTransfers = ALLOWED_TRANSFERS[fromType];
    if (!allowedTransfers || !allowedTransfers.includes(toType)) {
      throw new BadRequestError(WALLET_ERRORS.TRANSFER_NOT_ALLOWED);
    }

    // Get wallets
    const fromWallet = await walletRepository.findByUserIdAndType(userId, fromType);
    const toWallet = await walletRepository.findByUserIdAndType(userId, toType);

    if (!fromWallet || !toWallet) {
      throw new NotFoundError(WALLET_ERRORS.WALLET_NOT_FOUND);
    }

    // Check sufficient balance
    if (Number(fromWallet.balance) < amount) {
      throw new BadRequestError(WALLET_ERRORS.INSUFFICIENT_BALANCE);
    }

    // Perform transfer
    const { fromWallet: updatedFromWallet, toWallet: updatedToWallet } = 
      await walletRepository.transferWallet(fromWallet.id, toWallet.id, amount);

    // Create ledger entries
    await ledgerService.createEntry({
      userId,
      walletId: fromWallet.id,
      type: LedgerType.COMPOUND_TRANSFER,
      credit: 0,
      debit: amount,
      beforeBalance: Number(fromWallet.balance),
      afterBalance: Number(updatedFromWallet.balance),
      description: `Transfer from ${fromType} to ${toType}`,
      referenceId: toWallet.id,
      referenceType: ReferenceType.WALLET,
    });

    await ledgerService.createEntry({
      userId,
      walletId: toWallet.id,
      type: LedgerType.COMPOUND_TRANSFER,
      credit: amount,
      debit: 0,
      beforeBalance: Number(toWallet.balance),
      afterBalance: Number(updatedToWallet.balance),
      description: `Transfer from ${fromType} to ${toType}`,
      referenceId: fromWallet.id,
      referenceType: ReferenceType.WALLET,
    });

    return {
      fromWallet: updatedFromWallet,
      toWallet: updatedToWallet,
    };
  }

  /**
   * Credit wallet (internal use)
   */
  async creditWallet(userId: string, type: WalletType, amount: number) {
    const wallet = await walletRepository.findByUserIdAndType(userId, type);
    if (!wallet) {
      throw new NotFoundError(WALLET_ERRORS.WALLET_NOT_FOUND);
    }

    const beforeBalance = Number(wallet.balance);
    const updatedWallet = await walletRepository.creditWallet(wallet.id, amount);

    return {
      wallet: updatedWallet,
      beforeBalance,
      afterBalance: Number(updatedWallet.balance),
    };
  }

  /**
   * Debit wallet (internal use)
   */
  async debitWallet(userId: string, type: WalletType, amount: number) {
    const wallet = await walletRepository.findByUserIdAndType(userId, type);
    if (!wallet) {
      throw new NotFoundError(WALLET_ERRORS.WALLET_NOT_FOUND);
    }

    const beforeBalance = Number(wallet.balance);
    if (beforeBalance < amount) {
      throw new BadRequestError(WALLET_ERRORS.INSUFFICIENT_BALANCE);
    }

    const updatedWallet = await walletRepository.debitWallet(wallet.id, amount);

    return {
      wallet: updatedWallet,
      beforeBalance,
      afterBalance: Number(updatedWallet.balance),
    };
  }

  /**
   * Get wallet balance
   */
  async getBalance(userId: string, type: WalletType) {
    const wallet = await walletRepository.findByUserIdAndType(userId, type);
    if (!wallet) {
      throw new NotFoundError(WALLET_ERRORS.WALLET_NOT_FOUND);
    }
    return Number(wallet.balance);
  }

  async getWalletBalances(userId: string): Promise<Record<string, string>> {
    const wallets = await walletRepository.findByUserId(userId);
    const map: Record<string, string> = {};
    for (const wallet of wallets) {
      map[wallet.type] = wallet.balance.toString();
    }
    return map;
  }
}

export const walletService = new WalletService();
export default walletService;
