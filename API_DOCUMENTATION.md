# MLM Platform API Documentation

**Base URL:** `http://localhost:3000/api/v1`

**Authentication:** Bearer JWT token (`Authorization: Bearer <accessToken>`)

**Legend:**
- 🔒 = Requires authentication
- 🛡️ = Requires Admin role

---

## Table of Contents

1. [Auth APIs](#1-auth-apis)
2. [User APIs](#2-user-apis)
3. [Wallet APIs](#3-wallet-apis)
4. [Ledger APIs](#4-ledger-apis)
5. [Deposit APIs](#5-deposit-apis)
6. [Withdrawal APIs](#6-withdrawal-apis)
7. [Trading APIs](#7-trading-apis)
8. [Referral APIs](#8-referral-apis)
9. [Rank APIs](#9-rank-apis)
10. [Cycle Bonus APIs](#10-cycle-bonus-apis)
11. [Blockchain APIs](#11-blockchain-apis)
12. [Notification APIs](#12-notification-apis)
13. [Settings APIs](#13-settings-apis)
14. [Admin APIs](#14-admin-apis)
15. [Health Check](#15-health-check)

---

## 1. Auth APIs

### 1.1 POST `/auth/signup` — Register New User

**Input (Body):**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+919876543210",
  "country": "India",
  "referralCode": "ABCD1234",
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

**Output (201):**

```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "string",
      "name": "string",
      "role": "USER | ADMIN",
      "referralCode": "string",
      "rank": "RankLevel",
      "autoTradeStatus": false,
      "status": "ACTIVE"
    },
    "tokens": {
      "accessToken": "string",
      "refreshToken": "string"
    }
  }
}
```

---

### 1.2 POST `/auth/login` — Login User

**Input (Body):**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Output (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "string",
      "name": "string",
      "role": "USER | ADMIN",
      "referralCode": "string",
      "rank": "RankLevel",
      "autoTradeStatus": false,
      "status": "ACTIVE"
    },
    "tokens": {
      "accessToken": "string",
      "refreshToken": "string"
    }
  }
}
```

---

### 1.3 POST `/auth/refresh` — Refresh Access Token

**Input (Body):**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Output (200):**

```json
{
  "success": true,
  "message": "Tokens refreshed successfully",
  "data": {
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

---

### 1.4 POST `/auth/logout` — Logout User 🔒

**Input:** None (auth token in header)

**Output (200):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 1.5 POST `/auth/forgot-password` — Request Password Reset

**Input (Body):**

```json
{
  "email": "user@example.com"
}
```

**Output (200):**

```json
{
  "success": true,
  "message": "If an account exists with this email, a password reset link has been sent"
}
```

---

### 1.6 POST `/auth/reset-password` — Reset Password with Token

**Input (Body):**

```json
{
  "token": "reset-token-abc123",
  "newPassword": "newpassword123"
}
```

**Output (200):**

```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### 1.7 POST `/auth/change-password` — Change Password 🔒

**Input (Body):**

```json
{
  "oldPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Output (200):**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 2. User APIs

### 2.1 GET `/users/profile` — Get User Profile 🔒

**Input:** None (auth token in header)

**Output (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "phone": "string",
    "country": "string",
    "role": "USER | ADMIN",
    "referralCode": "string",
    "walletAddress": "string",
    "rank": "RankLevel",
    "autoTradeStatus": false,
    "status": "ACTIVE | INACTIVE | SUSPENDED",
    "lastLogin": "ISO date",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

---

### 2.2 PUT `/users/profile` — Update Profile 🔒

**Input (Body):**

```json
{
  "name": "John Doe",
  "phone": "+919876543210",
  "country": "India",
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

**Output (200):**

```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "phone": "string",
    "country": "string",
    "walletAddress": "string",
    "role": "USER | ADMIN",
    "rank": "RankLevel",
    "autoTradeStatus": false,
    "status": "ACTIVE"
  }
}
```

---

### 2.3 GET `/users/dashboard` — Get Dashboard 🔒

**Input:** None (auth token in header)

**Output (200):**

```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "uuid",
      "email": "string",
      "name": "string",
      "phone": "string",
      "country": "string",
      "role": "USER | ADMIN",
      "referralCode": "string",
      "walletAddress": "string",
      "rank": "RankLevel",
      "autoTradeStatus": false,
      "status": "ACTIVE",
      "lastLogin": "ISO date",
      "createdAt": "ISO date"
    },
    "wallets": {
      "PRINCIPAL": "string",
      "TRADING_PROFIT": "string",
      "REFERRAL": "string",
      "DEPOSIT_BONUS": "string",
      "RANK_BONUS": "string",
      "POOL_BONUS": "string",
      "ADMIN_COMMISSION": "string"
    },
    "directReferrals": 0,
    "teamSize": 0,
    "totalDeposits": 0,
    "totalWithdrawals": 0,
    "totalReferrals": 0
  }
}
```

---

### 2.4 POST `/users/auto-trade/toggle` — Toggle Auto-Trade 🔒

**Input:** None (auth token in header)

**Output (200):**

```json
{
  "success": true,
  "data": {
    "autoTradeStatus": true
  }
}
```

---

### 2.5 GET `/users` — List All Users (Admin) 🔒🛡️

**Input (Query):**

```json
{
  "page": 1,
  "limit": 100,
  "search": "search-term",
  "role": "USER",
  "status": "ACTIVE"
}
```

**Output (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "string",
      "name": "string",
      "role": "USER | ADMIN",
      "status": "ACTIVE | INACTIVE | SUSPENDED",
      "referralCode": "string",
      "rank": "RankLevel",
      "autoTradeStatus": false,
      "createdAt": "ISO date"
    }
  ]
}
```

---

## 3. Wallet APIs

### 3.1 GET `/wallets/summary` — Get Wallet Summary 🔒

**Input:** None (auth token in header)

**Output (200):**

```json
{
  "success": true,
  "data": {
    "principal": {
      "balance": "string",
      "totalCredit": "string",
      "totalDebit": "string"
    },
    "trading_profit": {
      "balance": "string",
      "totalCredit": "string",
      "totalDebit": "string"
    },
    "referral": {
      "balance": "string",
      "totalCredit": "string",
      "totalDebit": "string"
    },
    "deposit_bonus": {
      "balance": "string",
      "totalCredit": "string",
      "totalDebit": "string"
    },
    "rank_bonus": {
      "balance": "string",
      "totalCredit": "string",
      "totalDebit": "string"
    },
    "cycle_bonus": {
      "balance": "string",
      "totalCredit": "string",
      "totalDebit": "string"
    },
    "admin_commission": {
      "balance": "string",
      "totalCredit": "string",
      "totalDebit": "string"
    },
    "totalBalance": "string"
  }
}
```

---

### 3.2 GET `/wallets/:type` — Get Specific Wallet 🔒

**Input (Param):**

```json
{
  "type": "PRINCIPAL"
}
```

**Output (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "type": "WalletType",
    "balance": "string",
    "totalCredit": "string",
    "totalDebit": "string",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

---

### 3.3 GET `/wallets/:type/balance` — Get Wallet Balance 🔒

**Input (Param):**

```json
{
  "type": "PRINCIPAL"
}
```

**Output (200):**

```json
{
  "success": true,
  "data": {
    "balance": "string"
  }
}
```

---

### 3.4 POST `/wallets/transfer` — Transfer Between Wallets 🔒

**Input (Body):**

```json
{
  "fromWalletType": "2026-01-01",
  "toWalletType": "2026-01-01",
  "amount": 100
}
```

**Output (200):**

```json
{
  "success": true,
  "message": "Transfer completed successfully",
  "data": {
    "fromWallet": {
      "id": "uuid",
      "type": "WalletType",
      "balance": "string",
      "totalCredit": "string",
      "totalDebit": "string"
    },
    "toWallet": {
      "id": "uuid",
      "type": "WalletType",
      "balance": "string",
      "totalCredit": "string",
      "totalDebit": "string"
    }
  }
}
```

---

## 4. Ledger APIs

### 4.1 GET `/ledgers` — Get User Ledger Entries 🔒

**Input (Query):**

```json
{
  "type": "CREDIT",
  "walletId": 1,
  "referenceId": 1,
  "startDate": "2026-01-01",
  "endDate": "2026-01-01",
  "page": 1,
  "limit": 100
}
```

**Output (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "walletId": "uuid",
      "type": "LedgerType",
      "credit": 0,
      "debit": 0,
      "beforeBalance": 0,
      "afterBalance": 0,
      "description": "string",
      "referenceId": "uuid",
      "referenceType": "string",
      "createdAt": "ISO date"
    }
  ]
}
```

---

### 4.2 GET `/ledgers/wallet/:walletId` — Get Wallet Ledger Entries 🔒

**Input (Param):**

```json
{
  "walletId": 1
}
```

**Input (Query):** Same as `GET /ledgers`

**Output (200):** Same as `GET /ledgers`

---

### 4.3 GET `/ledgers/:id` — Get Ledger by ID 🔒

**Input (Param):**

```json
{
  "id": 1
}
```

**Output (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "walletId": "uuid",
    "type": "LedgerType",
    "credit": 0,
    "debit": 0,
    "beforeBalance": 0,
    "afterBalance": 0,
    "description": "string",
    "referenceId": "uuid",
    "referenceType": "string",
    "createdAt": "ISO date"
  }
}
```

---

## 5. Deposit APIs

### 5.1 POST `/deposits` — Create Deposit Request 🔒

**Input (Body):**

```json
{
  "amount": 100,
  "transactionHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  "senderAddress": "2026-01-01",
  "receiverAddress": "string",
  "tokenContract": "reset-token-abc123",
  "network": "string"
}
```

**Output (201):**

```json
{
  "success": true,
  "message": "Deposit submitted successfully and sent for blockchain verification",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "amount": "number",
    "transactionHash": "string",
    "senderAddress": "string",
    "receiverAddress": "string",
    "tokenContract": "string",
    "network": "string",
    "bonusAmount": "number",
    "status": "PENDING",
    "requiredConfirmations": 12,
    "createdAt": "ISO date"
  }
}
```

---

### 5.2 GET `/deposits` — Get User Deposits 🔒

**Input (Query):**

```json
{
  "status": "ACTIVE",
  "startDate": "2026-01-01",
  "endDate": "2026-01-01",
  "page": 1,
  "limit": 100
}
```

**Output (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "amount": "number",
      "bonusAmount": "number",
      "status": "DepositStatus",
      "transactionHash": "string",
      "senderAddress": "string",
      "receiverAddress": "string",
      "tokenContract": "string",
      "network": "string",
      "verifiedAt": "ISO date",
      "createdAt": "ISO date"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

---

### 5.3 GET `/deposits/statistics` — Get Deposit Statistics 🔒

**Input:** None (auth token in header)

**Output (200):**

```json
{
  "success": true,
  "data": {
    "totalDeposits": 0,
    "totalAmount": 0,
    "pendingCount": 0,
    "approvedCount": 0,
    "rejectedCount": 0
  }
}
```

---

### 5.4 GET `/deposits/:id` — Get Deposit by ID 🔒

**Input (Param):**

```json
{
  "id": 1
}
```

**Output (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "amount": "number",
    "bonusAmount": "number",
    "status": "DepositStatus",
    "transactionHash": "string",
    "senderAddress": "string",
    "receiverAddress": "string",
    "tokenContract": "string",
    "network": "string",
    "blockNumber": "number",
    "confirmations": "number",
    "blockchainData": {},
    "verifiedAt": "ISO date",
    "createdAt": "ISO date"
  }
}
```

---

### 5.5 POST `/deposits/:id/approve` — Approve Deposit (Admin) 🔒🛡️

**Input (Param):**

```json
{
  "id": 1
}
```

**Output (200):**

```json
{
  "success": true,
  "message": "Deposit approved successfully",
  "data": { "...deposit object" }
}
```

---

### 5.6 POST `/deposits/:id/reject` — Reject Deposit (Admin) 🔒🛡️

**Input (Param):**

```json
{
  "id": 1
}
```

**Input (Body):**

```json
{
  "rejectionReason": "string"
}
```

**Output (200):**

```json
{
  "success": true,
  "message": "Deposit rejected successfully",
  "data": { "...deposit object" }
}
```

---

### 5.7 GET `/deposits/admin/all` — Get All Deposits (Admin) 🔒🛡️

**Input (Query):** Same as `GET /deposits`

**Output (200):** Same as `GET /deposits` (all users' deposits)

---

## 6. Withdrawal APIs

### 6.1 POST `/withdrawals` — Create Withdrawal Request 🔒

**Input (Body):**

```json
{
  "amount": 100,
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "walletType": "string"
}
```

**Output (201):**

```json
{
  "success": true,
  "message": "Withdrawal created successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "walletType": "string",
    "amount": "number",
    "fee": "number",
    "penalty": "number",
    "netAmount": "number",
    "destinationAddress": "string",
    "network": "string",
    "status": "PENDING",
    "createdAt": "ISO date"
  }
}
```

---

### 6.2 GET `/withdrawals` — Get User Withdrawals 🔒

**Input (Query):**

```json
{
  "status": "ACTIVE",
  "startDate": "2026-01-01",
  "endDate": "2026-01-01",
  "page": 1,
  "limit": 100
}
```

**Output (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "walletType": "string",
      "amount": "number",
      "fee": "number",
      "penalty": "number",
      "netAmount": "number",
      "destinationAddress": "string",
      "status": "WithdrawalStatus",
      "transactionHash": "string",
      "createdAt": "ISO date"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

---

### 6.3 GET `/withdrawals/statistics` — Get Withdrawal Statistics 🔒

**Input:** None (auth token in header)

**Output (200):**

```json
{
  "success": true,
  "data": {
    "totalWithdrawals": 0,
    "totalAmount": 0,
    "pendingCount": 0,
    "completedCount": 0,
    "rejectedCount": 0
  }
}
```

---

### 6.4 GET `/withdrawals/:id` — Get Withdrawal by ID 🔒

**Input (Param):**

```json
{
  "id": 1
}
```

**Output (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "walletType": "string",
    "amount": "number",
    "fee": "number",
    "penalty": "number",
    "netAmount": "number",
    "destinationAddress": "string",
    "status": "WithdrawalStatus",
    "transactionHash": "string",
    "gasFee": "number",
    "processedAt": "ISO date",
    "createdAt": "ISO date"
  }
}
```

---

### 6.5 POST `/withdrawals/:id/process` — Process Withdrawal (Admin) 🔒🛡️

**Input (Param):**

```json
{
  "id": 1
}
```

**Input (Body):**

```json
{
  "transactionHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
}
```

**Output (200):**

```json
{
  "success": true,
  "message": "Withdrawal processed successfully",
  "data": { "...withdrawal object" }
}
```

---

### 6.6 POST `/withdrawals/:id/reject` — Reject Withdrawal (Admin) 🔒🛡️

**Input (Param):**

```json
{
  "id": 1
}
```

**Input (Body):**

```json
{
  "rejectionReason": "string"
}
```

**Output (200):**

```json
{
  "success": true,
  "message": "Withdrawal rejected successfully",
  "data": { "...withdrawal object" }
}
```

---

### 6.7 GET `/withdrawals/admin/all` — Get All Withdrawals (Admin) 🔒🛡️

**Input (Query):** Same as `GET /withdrawals`

**Output (200):** Same as `GET /withdrawals` (all users)

---

## 7. Trading APIs

### 7.1 GET `/trades/history` — Get User Trade History 🔒

**Input (Query):**

```json
{
  "status": "ACTIVE",
  "tradeType": "string",
  "startDate": "2026-01-01",
  "endDate": "2026-01-01",
  "page": 1,
  "limit": 100
}
```

**Output (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "tradeAmount": "number",
      "tradeType": "MORNING | EVENING",
      "status": "PENDING | COMPLETED",
      "profit": "number",
      "commission": "number",
      "profitPercentage": "number",
      "entryTime": "ISO date",
      "settlementTime": "ISO date",
      "exitTime": "ISO date"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

---

### 7.2 GET `/trades/stats` — Get Trade Statistics 🔒

**Input:** None (auth token in header)

**Output (200):**

```json
{
  "success": true,
  "data": {
    "totalTrades": 0,
    "totalProfit": 0,
    "pendingCount": 0,
    "completedCount": 0
  }
}
```

---

### 7.3 GET `/trades/:id` — Get Trade by ID 🔒

**Input (Param):**

```json
{
  "id": 1
}
```

**Output (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "tradeAmount": "number",
    "tradeType": "MORNING | EVENING",
    "status": "PENDING | COMPLETED",
    "profit": "number",
    "commission": "number",
    "profitPercentage": "number",
    "entryTime": "ISO date",
    "settlementTime": "ISO date",
    "exitTime": "ISO date",
    "metadata": {}
  }
}
```

---

### 7.4 POST `/trades/execute-session` — Trigger Trade Session (Admin) 🔒🛡️

**Input (Body):**

```json
{
  "tradeType": "string"
}
```

**Output (200):**

```json
{
  "success": true,
  "message": "Trade session executed successfully",
  "data": {
    "totalExecuted": 0,
    "trades": [
      {
        "id": "uuid",
        "userId": "uuid",
        "tradeAmount": "number",
        "tradeType": "MORNING | EVENING",
        "status": "PENDING",
        "entryTime": "ISO date",
        "settlementTime": "ISO date"
      }
    ]
  }
}
```

---

### 7.5 POST `/trades/settle` — Settle Pending Trades (Admin) 🔒🛡️

**Input:** None (auth token in header)

**Output (200):**

```json
{
  "success": true,
  "message": "Pending trades settled successfully",
  "data": {
    "settledCount": 0,
    "trades": [ { "...trade object" } ]
  }
}
```

---

### 7.6 GET `/trades/admin/all` — Get All Trades (Admin) 🔒🛡️

**Input (Query):** Same as `GET /trades/history`

**Output (200):** Same as `GET /trades/history` (all users)

---

## 8. Referral APIs

### 8.1 POST `/referrals/validate` — Validate Referral Code

**Input (Body):**

```json
{
  "referralCode": "ABCD1234"
}
```

**Output (200):**

```json
{
  "success": true,
  "data": {
    "valid": true,
    "sponsorId": "uuid",
    "referralCode": "string"
  }
}
```

---

### 8.2 GET `/referrals/tree` — Get Referral Tree 🔒

**Input (Query):**

```json
{
  "maxLevel": 100
}
```

**Output (200):**

```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "level": 0,
    "directReferralCount": 0,
    "teamSize": 0,
    "children": [ { "...nested referral tree" } ]
  }
}
```

---

### 8.3 GET `/referrals/referrals` — Get User Referrals 🔒

**Input:** None (auth token in header)

**Output (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "sponsorId": "uuid",
      "level": 1,
      "directReferralCount": 0,
      "teamSize": 0,
      "totalBonusEarned": 0,
      "createdAt": "ISO date"
    }
  ]
}
```

---

### 8.4 GET `/referrals/bonuses` — Get Referral Bonuses 🔒

**Input (Query):**

```json
{
  "type": "DIRECT",
  "level": 1,
  "page": 1,
  "limit": 100
}
```

**Output (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "referralId": "uuid",
      "userId": "uuid",
      "depositId": "uuid",
      "depositAmount": 0,
      "bonusPercentage": 0,
      "bonusAmount": 0,
      "level": 1,
      "status": "APPROVED"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

---

### 8.5 GET `/referrals/statistics` — Get Referral Statistics 🔒

**Input:** None (auth token in header)

**Output (200):**

```json
{
  "success": true,
  "data": {
    "directReferrals": 0,
    "teamSize": 0,
    "totalBonusEarned": 0,
    "directDepositAmount": 0,
    "teamDepositAmount": 0
  }
}
```

---

### 8.6 GET `/referrals/link` — Get Referral Link 🔒

**Input:** None (auth token in header)

**Output (200):**

```json
{
  "success": true,
  "data": {
    "referralLink": "https://example.com/ref/ABCD1234"
  }
}
```

---

## 9. Rank APIs

### 9.1 GET `/ranks/current` — Get Current Rank & History 🔒

**Input:** None (auth token in header)

**Output (200):**

```json
{
  "success": true,
  "data": {
    "currentRank": "RankLevel (LV1-LV7)",
    "rankDetails": {
      "id": "uuid",
      "userId": "uuid",
      "level": "RankLevel",
      "directReferrals": 0,
      "teamSize": 0,
      "directLv1Count": 0,
      "achievedAt": "ISO date",
      "rankBonusEarned": 0,
      "totalCycleBonusEarned": 0
    },
    "history": [
      {
        "id": "uuid",
        "userId": "uuid",
        "previousLevel": "RankLevel",
        "newLevel": "RankLevel",
        "changeReason": "string",
        "createdAt": "ISO date"
      }
    ]
  }
}
```

---

### 9.2 POST `/ranks/evaluate` — Evaluate Rank 🔒

**Input:** None (auth token in header)

**Output (200):**

```json
{
  "success": true,
  "message": "Rank evaluation complete",
  "data": {
    "currentRank": "RankLevel"
  }
}
```

---

## 10. Cycle Bonus APIs

### 10.1 GET `/cycle-bonuses/history` — Get User Cycle Bonus History 🔒

**Input (Query):**

```json
{
  "page": 1,
  "limit": 100
}
```

**Output (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "rankId": "uuid",
      "rankLevel": "RankLevel",
      "cycleNumber": 1,
      "cycleStartDate": "ISO date",
      "cycleEndDate": "ISO date",
      "rankBonusAmount": 0,
      "cycleBonusAmount": 0,
      "totalAmount": 0,
      "status": "PENDING | CREDITED",
      "createdAt": "ISO date"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

---

### 10.2 GET `/cycle-bonuses/:id` — Get Cycle Bonus by ID 🔒

**Input (Param):**

```json
{
  "id": 1
}
```

**Output (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "rankId": "uuid",
    "rankLevel": "RankLevel",
    "cycleNumber": 1,
    "cycleStartDate": "ISO date",
    "cycleEndDate": "ISO date",
    "rankBonusAmount": 0,
    "cycleBonusAmount": 0,
    "totalAmount": 0,
    "status": "PENDING | CREDITED",
    "eligibilityData": {},
    "createdAt": "ISO date"
  }
}
```

---

### 10.3 POST `/cycle-bonuses/process` — Trigger Cycle Bonus (Admin) 🔒🛡️

**Input:** None (auth token in header)

**Output (200):**

```json
{
  "success": true,
  "message": "10-Day Cycle bonus process completed",
  "data": {
    "processedCount": 0,
    "bonuses": [ { "...cycleBonus object" } ]
  }
}
```

---

### 10.4 GET `/cycle-bonuses/admin/all` — Get All Cycle Bonuses (Admin) 🔒🛡️

**Input (Query):**

```json
{
  "page": 1,
  "limit": 100
}
```

**Output (200):** Same as `GET /cycle-bonuses/history` (all users)

---

## 11. Blockchain APIs

### 11.1 POST `/blockchain/verify` — Verify Blockchain Transaction 🔒

**Input (Body):**

```json
{
  "transactionHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  "fromAddress": "2026-01-01",
  "toAddress": "2026-01-01",
  "amount": 100,
  "tokenContract": "reset-token-abc123",
  "network": "string"
}
```

**Output (200):**

```json
{
  "success": true,
  "message": "Transaction verified successfully",
  "data": {
    "verified": true,
    "transaction": {
      "blockNumber": "number",
      "confirmations": "number"
    },
    "receipt": {}
  }
}
```

---

### 11.2 GET `/blockchain/balance` — Get Native Wallet Balance 🔒

**Input (Query):**

```json
{
  "address": "string",
  "network": "string"
}
```

**Output (200):**

```json
{
  "success": true,
  "data": {
    "balance": "string"
  }
}
```

---

### 11.3 GET `/blockchain/token-balance` — Get Token Balance 🔒

**Input (Query):**

```json
{
  "address": "string",
  "tokenContract": "reset-token-abc123",
  "network": "string"
}
```

**Output (200):**

```json
{
  "success": true,
  "data": {
    "balance": "string"
  }
}
```

---

### 11.4 GET `/blockchain/receipt/:hash` — Get Transaction Receipt 🔒

**Input (Param):**

```json
{
  "hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
}
```

**Input (Query):**

```json
{
  "network": "string"
}
```

**Output (200):**

```json
{
  "success": true,
  "data": { "...transaction receipt object" }
}
```

---

### 11.5 GET `/blockchain/health` — Check Network Health 🔒

**Input (Query):**

```json
{
  "network": "string"
}
```

**Output (200):**

```json
{
  "success": true,
  "data": {
    "healthy": true,
    "network": "bsc-testnet"
  }
}
```

---

## 12. Notification APIs

### 12.1 GET `/notifications` — List Notifications 🔒

**Input (Query):**

```json
{
  "page": 1,
  "limit": 100
}
```

**Output (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "title": "string",
      "message": "string",
      "type": "string",
      "isRead": false,
      "createdAt": "ISO date"
    }
  ]
}
```

---

### 12.2 GET `/notifications/unread-count` — Get Unread Count 🔒

**Input:** None (auth token in header)

**Output (200):**

```json
{
  "success": true,
  "data": {
    "unreadCount": 0
  }
}
```

---

### 12.3 PUT `/notifications/:id/read` — Mark Notification as Read 🔒

**Input (Param):**

```json
{
  "id": 1
}
```

**Output (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "title": "string",
    "message": "string",
    "type": "string",
    "isRead": true,
    "createdAt": "ISO date"
  }
}
```

---

### 12.4 PUT `/notifications/read-all` — Mark All as Read 🔒

**Input:** None (auth token in header)

**Output (200):**

```json
{
  "success": true,
  "data": {
    "count": 0
  }
}
```

---

## 13. Settings APIs

### 13.1 GET `/settings` — Get All Settings 🔒

**Input:** None (auth token in header)

**Output (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "key": "string",
      "value": "string",
      "description": "string",
      "category": "string",
      "createdBy": "uuid",
      "updatedBy": "uuid",
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ]
}
```

---

### 13.2 GET `/settings/:key` — Get Setting by Key 🔒

**Input (Param):**

```json
{
  "key": "string"
}
```

**Output (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "key": "string",
    "value": "string",
    "description": "string",
    "category": "string",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

---

### 13.3 POST `/settings` — Create Setting (Admin) 🔒🛡️

**Input (Body):**

```json
{
  "key": "string",
  "value": 100,
  "description": "string",
  "category": "string"
}
```

**Output (201):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "key": "string",
    "value": "string",
    "description": "string",
    "category": "string",
    "createdBy": "uuid",
    "createdAt": "ISO date"
  }
}
```

---

### 13.4 PUT `/settings/:key` — Update Setting (Admin) 🔒🛡️

**Input (Param):**

```json
{
  "key": "string"
}
```

**Input (Body):**

```json
{
  "value": 100,
  "description": "string",
  "category": "string"
}
```

**Output (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "key": "string",
    "value": "string",
    "description": "string",
    "category": "string",
    "updatedBy": "uuid",
    "updatedAt": "ISO date"
  }
}
```

---

### 13.5 POST `/settings/seed` — Seed Default Settings (Admin) 🔒🛡️

**Input:** None (auth token in header)

**Output (200):**

```json
{
  "success": true,
  "data": { "...seeded settings object" }
}
```

---

## 14. Admin APIs

### 14.1 GET `/admin/dashboard` — Dashboard Stats (Admin) 🔒🛡️

**Input:** None (auth token in header)

**Output (200):**

```json
{
  "success": true,
  "data": {
    "totalUsers": 0,
    "activeUsers": 0,
    "totalDeposits": 0,
    "totalWithdrawals": 0,
    "totalDepositsAmount": 0,
    "totalWithdrawalsAmount": 0
  }
}
```

---

### 14.2 GET `/admin/users` — List Users (Admin) 🔒🛡️

**Input (Query):**

```json
{
  "page": 1,
  "limit": 100,
  "search": "search-term",
  "status": "ACTIVE",
  "role": "USER"
}
```

**Output (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "string",
      "name": "string",
      "role": "USER | ADMIN",
      "status": "ACTIVE | INACTIVE | SUSPENDED",
      "createdAt": "ISO date"
    }
  ]
}
```

---

### 14.3 POST `/admin/users/action` — Manage User (Admin) 🔒🛡️

**Input (Body):**

```json
{
  "userId": 1,
  "action": "string",
  "reason": "string"
}
```

**Output (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "status": "ACTIVE | SUSPENDED",
    "updatedAt": "ISO date"
  }
}
```

---

### 14.4 GET `/admin/deposits` — List Deposits (Admin) 🔒🛡️

**Input (Query):**

```json
{
  "page": 1,
  "limit": 100,
  "search": "search-term",
  "status": "ACTIVE"
}
```

**Output (200):**

```json
{
  "success": true,
  "data": [ { "...deposit objects" } ]
}
```

---

### 14.5 GET `/admin/withdrawals` — List Withdrawals (Admin) 🔒🛡️

**Input (Query):**

```json
{
  "page": 1,
  "limit": 100,
  "search": "search-term",
  "status": "ACTIVE"
}
```

**Output (200):**

```json
{
  "success": true,
  "data": [ { "...withdrawal objects" } ]
}
```

---

### 14.6 PUT `/admin/config` — Update Config (Admin) 🔒🛡️

**Input (Body):**

```json
{
  "key": "string",
  "value": 100,
  "description": "string"
}
```

**Output (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "key": "string",
    "value": "string",
    "description": "string",
    "updatedBy": "uuid",
    "updatedAt": "ISO date"
  }
}
```

---

## 15. Health Check

### 15.1 GET `/health` — Server Health

**Input:** None

**Output (200):**

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

---

## Summary

| # | Module | API Count |
|---|--------|-----------|
| 1 | Auth | 7 |
| 2 | Users | 5 |
| 3 | Wallets | 4 |
| 4 | Ledgers | 3 |
| 5 | Deposits | 7 |
| 6 | Withdrawals | 7 |
| 7 | Trading | 6 |
| 8 | Referrals | 6 |
| 9 | Ranks | 2 |
| 10 | Cycle Bonuses | 4 |
| 11 | Blockchain | 5 |
| 12 | Notifications | 4 |
| 13 | Settings | 5 |
| 14 | Admin | 6 |
| 15 | Health | 1 |
| | **Total** | **57** |
