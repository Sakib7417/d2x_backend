import { PrismaClient, Rank, RankHistory, RankLevel } from '@prisma/client';
import prisma from '../../../config/database';
import { RANK_ORDER } from '../constants/rank.constants';

export class RankRepository {
  /**
   * Find rank record for user
   */
  async findByUserId(userId: string): Promise<Rank | null> {
    return prisma.rank.findUnique({
      where: { userId },
      include: { user: true },
    });
  }

  /**
   * Upsert user rank record
   */
  async upsertUserRank(data: {
    userId: string;
    level: RankLevel;
    directReferrals: number;
    teamSize: number;
    directLv1Count: number;
    achievedAt: Date;
    rankBonusEarned?: number;
  }): Promise<Rank> {
    return prisma.rank.upsert({
      where: { userId: data.userId },
      create: {
        userId: data.userId,
        level: data.level,
        directReferrals: data.directReferrals,
        teamSize: data.teamSize,
        directLv1Count: data.directLv1Count,
        achievedAt: data.achievedAt,
        totalRankBonusEarned: data.rankBonusEarned || 0,
      },
      update: {
        level: data.level,
        directReferrals: data.directReferrals,
        teamSize: data.teamSize,
        directLv1Count: data.directLv1Count,
        ...(data.rankBonusEarned && {
          totalRankBonusEarned: {
            increment: data.rankBonusEarned,
          },
        }),
      },
      include: { user: true },
    });
  }

  /**
   * Record rank history
   */
  async createRankHistory(data: {
    userId: string;
    previousLevel?: RankLevel;
    newLevel: RankLevel;
    changeReason?: string;
  }): Promise<RankHistory> {
    return prisma.rankHistory.create({
      data: {
        userId: data.userId,
        previousLevel: data.previousLevel,
        newLevel: data.newLevel,
        changeReason: data.changeReason || 'Rank Qualification Evaluated',
        changedAt: new Date(),
      },
    });
  }

  /**
   * Find user's rank history
   */
  async findHistoryByUserId(userId: string): Promise<RankHistory[]> {
    return prisma.rankHistory.findMany({
      where: { userId },
      orderBy: { changedAt: 'desc' },
    });
  }

  /**
   * Count direct referrals with deposit >= minAmount
   */
  async countQualifyingDirectReferrals(userId: string, minDeposit: number): Promise<number> {
    const directReferrals = await prisma.user.findMany({
      where: { sponsorId: userId },
      select: { id: true },
    });

    if (directReferrals.length === 0) return 0;

    let count = 0;
    for (const ref of directReferrals) {
      const depositSum = await prisma.deposit.aggregate({
        where: {
          userId: ref.id,
          status: 'APPROVED',
        },
        _sum: { amount: true },
      });

      if (Number(depositSum._sum.amount || 0) >= minDeposit) {
        count++;
      }
    }

    return count;
  }

  /**
   * Count direct referrals with rank >= minRank
   */
  async countDirectReferralsWithMinRank(userId: string, minRank: RankLevel): Promise<number> {
    const qualifyingRanks = RANK_ORDER.slice(RANK_ORDER.indexOf(minRank));

    return prisma.user.count({
      where: {
        sponsorId: userId,
        rank: { in: qualifyingRanks },
      },
    });
  }

  /**
   * Count team size across all downline levels (only members who have
   * at least one APPROVED deposit — non-depositing members don't count)
   */
  async countTeamSize(userId: string): Promise<number> {
    let teamCount = 0;
    let currentLevelUserIds = [userId];

    while (currentLevelUserIds.length > 0) {
      const nextLevelUsers = await prisma.user.findMany({
        where: {
          sponsorId: { in: currentLevelUserIds },
        },
        select: {
          id: true,
          deposits: {
            where: { status: 'APPROVED' },
            select: { id: true },
            take: 1,
          },
        },
      });

      if (nextLevelUsers.length === 0) break;
      teamCount += nextLevelUsers.filter((u) => u.deposits.length > 0).length;
      currentLevelUserIds = nextLevelUsers.map((u) => u.id);
    }

    return teamCount;
  }
}

export const rankRepository = new RankRepository();
export default rankRepository;
