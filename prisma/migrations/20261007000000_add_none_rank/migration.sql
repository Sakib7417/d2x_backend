-- AlterEnum
ALTER TYPE "RankLevel" ADD VALUE 'NONE';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "rank" SET DEFAULT 'NONE';
