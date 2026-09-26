import { z } from 'zod';

export const userActionSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(['BAN', 'UNBAN', 'ACTIVATE', 'SUSPEND', 'DELETE']),
  reason: z.string().max(500).optional(),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  role: z.enum(['ADMIN', 'USER']).optional(),
});

export const updateConfigSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().min(1).max(1000),
  description: z.string().max(500).optional(),
});

const timeStringSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM 24-hour format');

export const updateTradeScheduleSchema = z.object({
  morning: timeStringSchema,
});

export const toggleTradingSchema = z.object({
  enabled: z.boolean(),
});

export const addTradeExclusionSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

// ADMIN_COMMISSION is excluded — rewards go to user wallets only
export const giveRewardSchema = z.object({
  userId: z.string().uuid(),
  amount: z.coerce.number().positive().max(1_000_000),
  walletType: z.enum([
    'PRINCIPAL',
    'DEPOSIT_BONUS',
    'REFERRAL',
    'TRADING_PROFIT',
    'RANK_BONUS',
    'POOL_BONUS',
  ]),
  reason: z.string().min(1).max(500),
});

export type UserActionInput = z.infer<typeof userActionSchema>;
export type AdminListQueryInput = z.infer<typeof listQuerySchema>;
export type UpdateConfigInput = z.infer<typeof updateConfigSchema>;
export type UpdateTradeScheduleInput = z.infer<typeof updateTradeScheduleSchema>;
export type ToggleTradingInput = z.infer<typeof toggleTradingSchema>;
export type AddTradeExclusionInput = z.infer<typeof addTradeExclusionSchema>;
export type GiveRewardInput = z.infer<typeof giveRewardSchema>;
