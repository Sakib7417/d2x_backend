import { rankRepository } from '../repository/rank.repository';
import { RANK_DEFINITIONS, RANK_ORDER } from '../constants/rank.constants';
import { NotFoundError } from '../../../utils/errors';
import { walletService } from '../../wallet/service/wallet.service';
import { ledgerService } from '../../ledger/service/ledger.service';
import prisma from '../../../config/database';
import { RankLevel, WalletType, LedgerType, ReferenceType } from '@prisma/client';

export class RankService {
  /**
   * Evaluate rank for a user and trigger parent sponsor re-evaluations up the tree
   */
  async evaluateUserRank(userId: string): Promise<RankLevel> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const currentRank = user.rank;

    // Gather statistics
    const directReferralCount = await prisma.user.count({ where: { sponsorId: userId } });
    const qualifyingDirectCount = await rankRepository.countQualifyingDirectReferrals(userId, 300);
    const directLv1Count = await rankRepository.countDirectReferralsWithMinRank(userId, RankLevel.LV1);
    const teamSize = await rankRepository.countTeamSize(userId);

    // Evaluate target rank from LV7 down to LV1. Defaults to the current
    // rank so a NONE user who doesn't qualify for LV1 stays NONE.
    let targetRank: RankLevel = currentRank;

    for (let i = RANK_ORDER.length - 1; i >= 0; i--) {
      const levelKey = RANK_ORDER[i];
      const def = RANK_DEFINITIONS[levelKey];

      let isEligible = false;
      if (levelKey === RankLevel.LV1) {
        isEligible = qualifyingDirectCount >= def.directReferralCount;
      } else {
        isEligible = directLv1Count >= def.directLv1Count && teamSize >= def.teamSize;
      }

      if (isEligible) {
        targetRank = levelKey;
        break;
      }
    }

    const currentIndex = RANK_ORDER.indexOf(currentRank);
    const targetIndex = RANK_ORDER.indexOf(targetRank);

    // Rule: Never downgrade rank
    if (targetIndex > currentIndex) {
      const newRank = targetRank;
      const rankBonus = RANK_DEFINITIONS[newRank].rankBonus;

      // 1. Update user model rank
      await prisma.user.update({
        where: { id: userId },
        data: { rank: newRank },
      });

      // 2. Check if this level was already achieved before (e.g. user was
      // corrected down and re-qualified) — rank bonus pays only once per level
      const alreadyAchieved = await prisma.rankHistory.findFirst({
        where: { userId, newLevel: newRank },
        select: { id: true },
      });

      // 3. Upsert Rank record
      await rankRepository.upsertUserRank({
        userId,
        level: newRank,
        directReferrals: directReferralCount,
        teamSize,
        directLv1Count,
        achievedAt: new Date(),
        rankBonusEarned: alreadyAchieved ? 0 : rankBonus,
      });

      // 4. Create RankHistory record
      await rankRepository.createRankHistory({
        userId,
        previousLevel: currentRank,
        newLevel: newRank,
        changeReason: `Upgraded to ${newRank}`,
      });

      // 5. Credit Rank Bonus Wallet
      if (rankBonus > 0 && !alreadyAchieved) {
        const creditResult = await walletService.creditWallet(userId, WalletType.RANK_BONUS, rankBonus);
        await ledgerService.createEntry({
          userId,
          walletId: creditResult.wallet.id,
          type: LedgerType.RANK_BONUS,
          credit: rankBonus,
          debit: 0,
          beforeBalance: creditResult.beforeBalance,
          afterBalance: creditResult.afterBalance,
          description: `Rank Bonus achieved for ${newRank}`,
          referenceType: ReferenceType.RANK,
        });
      }
    }

    // Re-evaluate sponsor up the chain on every evaluation — a downline's
    // deposit may qualify the sponsor even when this user didn't upgrade.
    if (user.sponsorId) {
      this.evaluateUserRank(user.sponsorId).catch((err) => {
        console.error(`Error re-evaluating sponsor ${user.sponsorId}:`, err);
      });
    }

    return targetIndex > currentIndex ? targetRank : currentRank;
  }

  /**
   * Get rank info and history for a user
   */
  async getUserRankInfo(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const [
      rankRecord,
      referralRecord,
      history,
      qualifyingTeamSize,
      qualifyingDirectCount,
      directLv1Count,
    ] = await Promise.all([
      rankRepository.findByUserId(userId),
      prisma.referral.findUnique({ where: { userId } }),
      rankRepository.findHistoryByUserId(userId),
      rankRepository.countTeamSize(userId),
      rankRepository.countQualifyingDirectReferrals(userId, RANK_DEFINITIONS[RankLevel.LV1].minDirectDeposit),
      rankRepository.countDirectReferralsWithMinRank(userId, RankLevel.LV1),
    ]);

    // Rank records are only written when a promotion happens, so for users
    // with no achieved rank rankDetails is null — and even when present its
    // counts are a stale snapshot. Overlay live counts so the UI always shows
    // the user's actual team numbers. teamSize counts only members with an
    // approved deposit, matching the rank eligibility rule.
    const rankDetails = rankRecord
      ? {
          ...rankRecord,
          directReferrals: referralRecord?.directReferralCount ?? rankRecord.directReferrals,
          teamSize: qualifyingTeamSize,
        }
      : {
          level: user.rank,
          directReferrals: referralRecord?.directReferralCount ?? 0,
          teamSize: qualifyingTeamSize,
        };

    // Per-level progress towards each rank — used by the UI to show how
    // much is left to unlock the next level.
    const currentIndex = RANK_ORDER.indexOf(user.rank); // NONE → -1
    const progress = RANK_ORDER.map((level, index) => {
      const def = RANK_DEFINITIONS[level];
      const requirements =
        level === RankLevel.LV1
          ? [
              {
                key: 'qualifyingDirects',
                label: `Directs with ${def.minDirectDeposit}+ deposit`,
                required: def.directReferralCount,
                current: qualifyingDirectCount,
              },
            ]
          : [
              {
                key: 'directLv1',
                label: 'Directs ranked LV1 or above',
                required: def.directLv1Count,
                current: directLv1Count,
              },
              {
                key: 'teamSize',
                label: 'Deposited team members',
                required: def.teamSize,
                current: qualifyingTeamSize,
              },
            ];

      return {
        level,
        name: def.name,
        achieved: index <= currentIndex,
        isNext: index === currentIndex + 1,
        requirements: requirements.map((r) => ({ ...r, met: r.current >= r.required })),
        rankBonus: def.rankBonus,
        cycleBonus: def.cycleBonus,
      };
    });

    return {
      currentRank: user.rank,
      rankDetails,
      progress,
      history,
    };
  }
}

export const rankService = new RankService();
export default rankService;
