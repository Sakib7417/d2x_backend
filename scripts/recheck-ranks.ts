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
import { PrismaClient, RankLevel, UserRole } from '@prisma/client';
import { RANK_DEFINITIONS, RANK_ORDER } from '../src/modules/rank/constants/rank.constants';
import { rankRepository } from '../src/modules/rank/repository/rank.repository';

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

async function main() {
  const users = await prisma.user.findMany({
    where: { deletedAt: null, role: UserRole.USER },
    select: { id: true, email: true, name: true, rank: true },
  });
  console.log(`Checking ${users.length} users...`);

  const corrected: { email: string; from: RankLevel; to: RankLevel }[] = [];

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
          },
        });

        if (pass === 1) corrected.push({ email: u.email, from: u.rank, to: target });
        u.rank = target;
        changed++;
      }
    }

    console.log(`Pass ${pass}: ${changed} corrections`);
    if (changed === 0) break;
  }

  console.log('\nCorrected users:');
  for (const c of corrected) console.log(`  ${c.email}: ${c.from} -> ${c.to}`);
  console.log(`\nTotal corrected: ${corrected.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
