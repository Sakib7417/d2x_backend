-- AlterEnum (own migration — new enum value must be committed before use)
ALTER TYPE "RankLevel" ADD VALUE IF NOT EXISTS 'NONE';
