import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const lv1Users = await prisma.user.findMany({
    where: { rank: 'LV1' },
    include: { ranks: true },
  });

  const toReset = lv1Users.filter((u) => !u.ranks).map((u) => u.id);
  console.log(`LV1 users found: ${lv1Users.length}`);
  console.log(`Without earned Rank record (resetting to NONE): ${toReset.length}`);
  console.log(`With earned Rank record (keeping LV1): ${lv1Users.length - toReset.length}`);

  if (toReset.length > 0) {
    const res = await prisma.user.updateMany({
      where: { id: { in: toReset } },
      data: { rank: 'NONE' },
    });
    console.log(`Reset ${res.count} users to NONE`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
