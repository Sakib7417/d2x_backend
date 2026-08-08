import { z } from 'zod';
import { WalletType } from '@prisma/client';

export const transferSchema = z.object({
  fromWalletType: z.nativeEnum(WalletType),
  toWalletType: z.nativeEnum(WalletType),
  amount: z.string().refine((val) => parseFloat(val) > 0, 'Amount must be greater than zero'),
});

export const getWalletSchema = z.object({
  type: z.nativeEnum(WalletType).optional(),
});

export type TransferInput = z.infer<typeof transferSchema>;
export type GetWalletInput = z.infer<typeof getWalletSchema>;
