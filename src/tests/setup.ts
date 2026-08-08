import { prisma } from '../prisma/client';

afterAll(async () => {
  await prisma.$disconnect();
});
