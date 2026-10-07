/**
 * Re-evaluate every user's rank under the corrected rules and downgrade
 * anyone whose current rank was granted under the old logic (default LV1
 * users counted towards LV2+, all members counted in team size).
 *
 * - Only downgrades; upgrades are left to normal evaluation flow
 * - Rank.level is synced so cycle/pool bonus stops for corrected users
 * - RankHistory records the correction for audit
 * - Idempotent: safe to re-run
 */
import { PrismaClient, RankLevel, UserRole, WalletType, LedgerType, ReferenceType } from '@prisma/client';
import { RANK_DEFINITIONS, RANK_ORDER } from '../src/modules/rank/constants/rank.constants';
import { rankRepository } from '../src/modules/rank/repository/rank.repository';
import { walletService } from '../src/modules/wallet/service/wallet.service';
import { ledgerService } from '../src/modules/ledger/service/ledger.service';

const prisma = new PrismaClient();

const indexOf = (r: RankLevel) => RANK_ORDER.indexOf(r); // NONE → -1

async function eligibleRank(userId: string): Promise<RankLevel> {
  const qualifyingDirects = await rankRepository.countQualifyingDirectReferrals(
    userId,
    RANK_DEFINITIONS[RankLevel.LV1].minDirectDeposit,
  );
  const directLv1Count = await rankRepository.countDirectReferralsWithMinRank(userId, RankLevel.LV1);
  const teamSize = await rankRepository.countTeamSize(userId);

  for (let i = RANK_ORDER.length - 1; i >= 0; i--) {
    const level = RANK_ORDER[i];
    const def = RANK_DEFINITIONS[level];
    const ok =
      level === RankLevel.LV1
        ? qualifyingDirects >= def.directReferralCount
        : directLv1Count >= def.directLv1Count && teamSize >= def.teamSize;
    if (ok) return level;
  }
  return RankLevel.NONE;
}

// Sum of rank bonuses deserved for all levels <= rank
function deservedBonus(rank: RankLevel): number {
  return RANK_ORDER.filter((l) => indexOf(l) <= indexOf(rank)).reduce(
    (sum, l) => sum + RANK_DEFINITIONS[l].rankBonus,
    0,
  );
}

// Reverse unearned rank bonus already credited to RANK_BONUS wallet
async function clawbackUnearnedBonus(userId: string): Promise<number> {
  const rankRec = await prisma.rank.findUnique({ where: { userId } });
  const totalEarned = Number(rankRec?.totalRankBonusEarned ?? 0);
  const deserved = deservedBonus((await prisma.user.findUnique({ where: { id: userId }, select: { rank: true } }))!.rank);
  const toClawback = totalEarned - deserved;
  if (toClawback <= 0) return 0;

  const wallet = await prisma.wallet.findUnique({
    where: { userId_type: { userId, type: WalletType.RANK_BONUS } },
  });
  const available = Number(wallet?.balance ?? 0);
  const debitAmount = Math.min(toClawback, available);

  if (debitAmount > 0 && wallet) {
    const result = await walletService.debitWallet(userId, WalletType.RANK_BONUS, debitAmount);
    await ledgerService.createEntry({
      userId,
      walletId: result.wallet.id,
      type: LedgerType.RANK_BONUS,
      credit: 0,
      debit: debitAmount,
      beforeBalance: result.beforeBalance,
      afterBalance: result.afterBalance,
      description: 'Rank bonus reversed — rank corrected to earned level',
      referenceType: ReferenceType.RANK,
    });
  }

  if (rankRec) {
    await prisma.rank.update({
      where: { id: rankRec.id },
      data: { totalRankBonusEarned: deserved },
    });
  }

  return toClawback;
}

async function main() {
  const users = await prisma.user.findMany({
    where: { deletedAt: null, role: UserRole.USER },
    select: { id: true, email: true, name: true, rank: true },
  });
  console.log(`Checking ${users.length} users...`);

  const corrected: { email: string; from: RankLevel; to: RankLevel }[] = [];
  const clawbacks: { email: string; amount: number }[] = [];

  // Multiple passes: correcting a direct's rank can change the sponsor's
  // eligibility, so iterate until nothing changes (ranks only move down).
  for (let pass = 1; pass <= 10; pass++) {
    let changed = 0;

    for (const u of users) {
      const target = await eligibleRank(u.id);
      if (indexOf(target) < indexOf(u.rank)) {
        await prisma.user.update({ where: { id: u.id }, data: { rank: target } });

        // Sync Rank record so cycle bonus stops for unearned levels
        const rankRec = await prisma.rank.findUnique({ where: { userId: u.id } });
        if (rankRec && rankRec.level !== target) {
          await prisma.rank.update({ where: { id: rankRec.id }, data: { level: target } });
        }

        await prisma.rankHistory.create({
          data: {
            userId: u.id,
            previousLevel: u.rank,
            newLevel: target,
            changeReason: 'Rank corrected to earned level (rank rules fix)',
            changedAt: new Date(),
          },
        });

        if (!corrected.some((c) => c.email === u.email)) {
          corrected.push({ email: u.email, from: u.rank, to: target });
        } else {
          corrected.find((c) => c.email === u.email)!.to = target;
        }
        u.rank = target;
        changed++;
      }
    }

    console.log(`Pass ${pass}: ${changed} corrections`);
    if (changed === 0) break;
  }

  // After ranks stabilise, reverse unearned bonuses (final rank decides
  // how much bonus was truly deserved)
  for (const u of users) {
    const clawed = await clawbackUnearnedBonus(u.id);
    if (clawed > 0) clawbacks.push({ email: u.email, amount: clawed });
  }

  console.log('\nCorrected users:');
  for (const c of corrected) console.log(`  ${c.email}: ${c.from} -> ${c.to}`);
  console.log(`\nTotal corrected: ${corrected.length}`);

  console.log('\nBonus clawbacks:');
  for (const c of clawbacks) console.log(`  ${c.email}: ${c.amount} USDT reversed`);
  console.log(`\nTotal clawed back: ${clawbacks.reduce((s, c) => s + c.amount, 0)} USDT`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
