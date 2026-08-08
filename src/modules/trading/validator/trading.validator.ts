import { z } from 'zod';
import { TradeType, TradeStatus } from '@prisma/client';

export const triggerTradeSchema = z.object({
  tradeType: z.nativeEnum(TradeType).optional().default(TradeType.MORNING),
});

export const getTradeSchema = z.object({
  status: z.nativeEnum(TradeStatus).optional(),
  tradeType: z.nativeEnum(TradeType).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
});

export type TriggerTradeInput = z.infer<typeof triggerTradeSchema>;
export type GetTradeInput = z.infer<typeof getTradeSchema>;
