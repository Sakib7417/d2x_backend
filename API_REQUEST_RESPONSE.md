# API Request / Response Guide

## Standard Response
```json
{ "success": true, "data": ... }
```
### Error
```json
{ "success": false, "message": "..." }
```

## AUTH

### Request Schemas (auth.validator.ts)
```typescript
import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  country: z.string().min(2, 'Country must be at least 2 characters').optional(),
  referralCode: z.string().length(8, 'Referral code must be 8 characters').optional(),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

```

### Endpoints
- **POST /api/v1/auth/signup**
  - Access: Public
  - Request: signupSchema
  - Response: 200 { success: true, data: <service result> }

- **POST /api/v1/auth/login**
  - Access: Public
  - Request: loginSchema
  - Response: 200 { success: true, data: <service result> }

- **POST /api/v1/auth/refresh**
  - Access: Public
  - Request: refreshTokenSchema
  - Response: 200 { success: true, data: <service result> }

- **POST /api/v1/auth/logout**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **POST /api/v1/auth/forgot-password**
  - Access: Public
  - Request: forgotPasswordSchema
  - Response: 200 { success: true, data: <service result> }

- **POST /api/v1/auth/reset-password**
  - Access: Public
  - Request: resetPasswordSchema
  - Response: 200 { success: true, data: <service result> }

- **POST /api/v1/auth/change-password**
  - Access: Authenticated
  - Request: changePasswordSchema
  - Response: 200 { success: true, data: <service result> }

## USERS

### Request Schemas (user.validator.ts)
```typescript
import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(5).max(20).optional(),
  country: z.string().min(2).max(100).optional(),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
});

export const listUsersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.enum(['ADMIN', 'USER']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ListUsersInput = z.infer<typeof listUsersSchema>;

```

### Endpoints
- **GET /api/v1/users/profile**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **PUT /api/v1/users/profile**
  - Access: Authenticated
  - Request: updateProfileSchema
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/users/dashboard**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **POST /api/v1/users/auto-trade/toggle**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/users/**
  - Access: Admin
  - Request: listUsersSchema
  - Response: 200 { success: true, data: <service result> }

## WALLET

### Request Schemas (wallet.validator.ts)
```typescript
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

```

### Endpoints
- **GET /api/v1/wallets/summary**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/wallets/:type**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/wallets/:type/balance**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **POST /api/v1/wallets/transfer**
  - Access: Authenticated
  - Request: transferSchema
  - Response: 200 { success: true, data: <service result> }

## LEDGER

### Request Schemas (ledger.validator.ts)
```typescript
import { z } from 'zod';
import { LedgerType } from '@prisma/client';

export const getLedgerSchema = z.object({
  type: z.nativeEnum(LedgerType).optional(),
  walletId: z.string().uuid().optional(),
  referenceId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
});

export type GetLedgerInput = z.infer<typeof getLedgerSchema>;

```

### Endpoints
- **GET /api/v1/ledgers/**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/ledgers/wallet/:walletId**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/ledgers/:id**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

## DEPOSIT

### Request Schemas (deposit.validator.ts)
```typescript
import { z } from 'zod';
import { DepositStatus } from '@prisma/client';

export const createDepositSchema = z.object({
  amount: z.string().refine((val) => parseFloat(val) >= 50, 'Minimum deposit is 50 USDT'),
  transactionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash'),
  senderAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid sender address'),
  receiverAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid receiver address'),
  tokenContract: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid token contract'),
  network: z.string(),
});

export const getDepositSchema = z.object({
  status: z.nativeEnum(DepositStatus).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
});

export const updateDepositSchema = z.object({
  status: z.nativeEnum(DepositStatus),
  rejectionReason: z.string().optional(),
});

export type CreateDepositInput = z.infer<typeof createDepositSchema>;
export type GetDepositInput = z.infer<typeof getDepositSchema>;
export type UpdateDepositInput = z.infer<typeof updateDepositSchema>;

```

### Endpoints
- **POST /api/v1/deposits/**
  - Access: Authenticated
  - Request: createDepositSchema
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/deposits/**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/deposits/statistics**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/deposits/:id**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **POST /api/v1/deposits/:id/approve**
  - Access: Admin
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **POST /api/v1/deposits/:id/reject**
  - Access: Admin
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/deposits/admin/all**
  - Access: Admin
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

## WITHDRAWAL

### Request Schemas (withdrawal.validator.ts)
```typescript
import { z } from 'zod';
import { WithdrawalStatus } from '@prisma/client';

export const createWithdrawalSchema = z.object({
  amount: z.string().refine((val) => parseFloat(val) >= 10, 'Minimum withdrawal is 10 USDT'),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  walletType: z.string(),
});

export const getWithdrawalSchema = z.object({
  status: z.nativeEnum(WithdrawalStatus).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
});

export type CreateWithdrawalInput = z.infer<typeof createWithdrawalSchema>;
export type GetWithdrawalInput = z.infer<typeof getWithdrawalSchema>;

```

### Endpoints
- **POST /api/v1/withdrawals/**
  - Access: Authenticated
  - Request: createWithdrawalSchema
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/withdrawals/**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/withdrawals/statistics**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/withdrawals/:id**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **POST /api/v1/withdrawals/:id/process**
  - Access: Admin
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **POST /api/v1/withdrawals/:id/reject**
  - Access: Admin
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/withdrawals/admin/all**
  - Access: Admin
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

## TRADING

### Request Schemas (trading.validator.ts)
```typescript
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

```

### Endpoints
- **GET /api/v1/trades/history**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/trades/stats**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/trades/:id**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **POST /api/v1/trades/execute-session**
  - Access: Admin
  - Request: triggerTradeSchema
  - Response: 200 { success: true, data: <service result> }

- **POST /api/v1/trades/settle**
  - Access: Admin
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/trades/admin/all**
  - Access: Admin
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

## REFERRAL

### Request Schemas (referral.validator.ts)
```typescript
import { z } from 'zod';

export const validateReferralCodeSchema = z.object({
  referralCode: z.string().min(6, 'Referral code must be at least 6 characters'),
});

export const getReferralTreeSchema = z.object({
  maxLevel: z.string().optional().transform((val) => val ? parseInt(val) : 5),
});

export const getReferralBonusesSchema = z.object({
  type: z.string().optional(),
  level: z.string().optional().transform((val) => val ? parseInt(val) : undefined),
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
});

export type ValidateReferralCodeInput = z.infer<typeof validateReferralCodeSchema>;
export type GetReferralTreeInput = z.infer<typeof getReferralTreeSchema>;
export type GetReferralBonusesInput = z.infer<typeof getReferralBonusesSchema>;

```

### Endpoints
- **POST /api/v1/referrals/validate**
  - Access: Public
  - Request: validateReferralCodeSchema
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/referrals/tree**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/referrals/referrals**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/referrals/bonuses**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/referrals/statistics**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/referrals/link**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

## RANK

### Request Schemas (rank.validator.ts)
```typescript
import { z } from 'zod';

export const evaluateRankSchema = z.object({
  userId: z.string().uuid().optional(),
});

export const getRanksSchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
});

export type EvaluateRankInput = z.infer<typeof evaluateRankSchema>;
export type GetRanksInput = z.infer<typeof getRanksSchema>;

```

### Endpoints
- **GET /api/v1/ranks/current**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **POST /api/v1/ranks/evaluate**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

## CYCLEBONUS

### Request Schemas (cycleBonus.validator.ts)
```typescript
import { z } from 'zod';
import { CycleBonusStatus } from '@prisma/client';

export const getCycleBonusSchema = z.object({
  status: z.nativeEnum(CycleBonusStatus).optional(),
  cycleNumber: z.string().optional().transform((val) => val ? parseInt(val) : undefined),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
});

export type GetCycleBonusInput = z.infer<typeof getCycleBonusSchema>;

```

### Endpoints
- **GET /api/v1/cycle-bonuses/history**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/cycle-bonuses/:id**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **POST /api/v1/cycle-bonuses/process**
  - Access: Admin
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/cycle-bonuses/admin/all**
  - Access: Admin
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

## BLOCKCHAIN

### Request Schemas (blockchain.validator.ts)
```typescript
import { z } from 'zod';

export const verifyTransactionSchema = z.object({
  transactionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash'),
  fromAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid from address').optional(),
  toAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid to address'),
  amount: z.string().refine((val) => parseFloat(val) > 0, 'Amount must be greater than zero'),
  tokenContract: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid token contract'),
  network: z.string(),
});

export const getBalanceSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  network: z.string().optional(),
});

export const getTokenBalanceSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  tokenContract: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid token contract'),
  network: z.string().optional(),
});

export type VerifyTransactionInput = z.infer<typeof verifyTransactionSchema>;
export type GetBalanceInput = z.infer<typeof getBalanceSchema>;
export type GetTokenBalanceInput = z.infer<typeof getTokenBalanceSchema>;

```

### Endpoints
- **POST /api/v1/blockchain/verify**
  - Access: Authenticated
  - Request: verifyTransactionSchema
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/blockchain/balance**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/blockchain/token-balance**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/blockchain/receipt/:hash**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/blockchain/health**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

## NOTIFICATIONS

### Endpoints
- **GET /api/v1/notifications/**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/notifications/unread-count**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **PUT /api/v1/notifications/:id/read**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **PUT /api/v1/notifications/read-all**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

## SETTINGS

### Request Schemas (settings.validator.ts)
```typescript
import { z } from 'zod';

export const createSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().min(1).max(1000),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
});

export const updateSettingSchema = z.object({
  value: z.string().min(1).max(1000),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
});

export type CreateSettingInput = z.infer<typeof createSettingSchema>;
export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;

```

### Endpoints
- **GET /api/v1/settings/**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/settings/:key**
  - Access: Authenticated
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **POST /api/v1/settings/**
  - Access: Admin
  - Request: createSettingSchema
  - Response: 200 { success: true, data: <service result> }

- **PUT /api/v1/settings/:key**
  - Access: Admin
  - Request: updateSettingSchema
  - Response: 200 { success: true, data: <service result> }

- **POST /api/v1/settings/seed**
  - Access: Admin
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

## ADMIN

### Request Schemas (admin.validator.ts)
```typescript
import { z } from 'zod';

export const userActionSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(['BAN', 'UNBAN', 'ACTIVATE', 'SUSPEND']),
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

export type UserActionInput = z.infer<typeof userActionSchema>;
export type AdminListQueryInput = z.infer<typeof listQuerySchema>;
export type UpdateConfigInput = z.infer<typeof updateConfigSchema>;

```

### Endpoints
- **GET /api/v1/admin/dashboard**
  - Access: Admin
  - Request: None (no body)
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/admin/users**
  - Access: Admin
  - Request: listQuerySchema
  - Response: 200 { success: true, data: <service result> }

- **POST /api/v1/admin/users/action**
  - Access: Admin
  - Request: userActionSchema
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/admin/deposits**
  - Access: Admin
  - Request: listQuerySchema
  - Response: 200 { success: true, data: <service result> }

- **GET /api/v1/admin/withdrawals**
  - Access: Admin
  - Request: listQuerySchema
  - Response: 200 { success: true, data: <service result> }

- **PUT /api/v1/admin/config**
  - Access: Admin
  - Request: updateConfigSchema
  - Response: 200 { success: true, data: <service result> }
