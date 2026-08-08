# System Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Web App    │  │  Mobile App  │  │ Admin Panel  │  │  External    │  │
│  │              │  │              │  │              │  │  Services    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │                 │           │
└─────────┼─────────────────┼─────────────────┼─────────────────┼───────────┘
          │                 │                 │                 │
          └─────────────────┼─────────────────┼─────────────────┘
                            │
                    ┌───────▼────────┐
                    │  API Gateway   │
                    │  (Express.js)  │
                    └───────┬────────┘
                            │
┌───────────────────────────┼───────────────────────────────────────────────┐
│                      APPLICATION LAYER                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                        MIDDLEWARE LAYER                               │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │ │
│  │  │   Auth   │ │ Validate │ │   Rate   │ │  CORS    │ │  Error   │  │ │
│  │  │          │ │          │ │  Limit   │ │          │ │ Handler  │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                              │                                             │
│  ┌───────────────────────────┼───────────────────────────────────────────┐ │
│  │                           ROUTE LAYER                                  │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │ │
│  │  │   Auth   │ │   User   │ │  Wallet  │ │  Trade   │ │  Admin   │  │ │
│  │  │  Routes  │ │  Routes  │ │  Routes  │ │  Routes  │ │  Routes  │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │ │
│  │  │ Deposit  │ │ Withdraw │ │ Referral │ │   Rank   │ │  Cycle   │  │ │
│  │  │  Routes  │ │  Routes  │ │  Routes  │ │  Routes  │ │  Routes  │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │ │
│  └───────────────────────────┼──────────────────────────────────────────┘ │
│                              │                                             │
│  ┌───────────────────────────┼───────────────────────────────────────────┐ │
│  │                        CONTROLLER LAYER                                │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │ │
│  │  │   Auth   │ │   User   │ │  Wallet  │ │  Trade   │ │  Admin   │  │ │
│  │  │Controller│ │Controller│ │Controller│ │Controller│ │Controller│  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │ │
│  └───────────────────────────┼──────────────────────────────────────────┘ │
│                              │                                             │
│  ┌───────────────────────────┼───────────────────────────────────────────┐ │
│  │                         SERVICE LAYER                                  │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │ │
│  │  │   Auth   │ │   User   │ │  Wallet  │ │  Trade   │ │  Admin   │  │ │
│  │  │  Service │ │  Service │ │  Service │ │  Service │ │  Service │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │ │
│  │  │ Deposit  │ │ Withdraw │ │ Referral │ │   Rank   │ │  Cycle   │  │ │
│  │  │  Service │ │  Service │ │  Service │ │  Service │ │  Service │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │ │
│  │  │  Ledger  │ │Blockchain│ │  Email   │ │  Redis   │ │  Cron    │  │ │
│  │  │  Service │ │  Service │ │  Service │ │  Service │ │  Service │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │ │
│  └───────────────────────────┼──────────────────────────────────────────┘ │
│                              │                                             │
│  ┌───────────────────────────┼───────────────────────────────────────────┐ │
│  │                      REPOSITORY LAYER                                  │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │ │
│  │  │   Auth   │ │   User   │ │  Wallet  │ │  Trade   │ │  Admin   │  │ │
│  │  │   Repo   │ │   Repo   │ │   Repo   │ │   Repo   │ │   Repo   │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │ │
│  │  │ Deposit  │ │ Withdraw │ │ Referral │ │   Rank   │ │  Cycle   │  │ │
│  │  │   Repo   │ │   Repo   │ │   Repo   │ │   Repo   │ │   Repo   │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │ │
│  └───────────────────────────┼──────────────────────────────────────────┘ │
└──────────────────────────────┼────────────────────────────────────────────┘
                               │
┌──────────────────────────────┼────────────────────────────────────────────┐
│                        DATA LAYER                                          │
│  ┌───────────────────────────┼───────────────────────────────────────────┐ │
│  │                         PRISMA ORM                                      │ │
│  └───────────────────────────┼───────────────────────────────────────────┘ │
│                              │                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │ │
│  │  PostgreSQL  │  │    Redis     │  │   Winston    │  │   Events     │  │ │
│  │   Database   │  │    Cache     │  │    Logs      │  │   Emitter    │  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │ │
└─────────────────────────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────┼────────────────────────────────────────────┐
│                    EXTERNAL SERVICES LAYER                                  │
│  ┌───────────────────────────┼───────────────────────────────────────────┐ │
│  │                      BLOCKCHAIN NETWORK                                 │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │              BNB Smart Chain Testnet                             │  │ │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │  │ │
│  │  │  │  USDT Token  │  │  Deposit     │  │  Withdraw    │          │  │ │
│  │  │  │   Contract   │  │  Wallet      │  │  Wallet      │          │  │ │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘          │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────┼───────────────────────────────────────────┘ │
│  ┌───────────────────────────┼───────────────────────────────────────────┐ │
│  │                      EMAIL SERVICE                                     │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │                      Nodemailer                                  │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Module Architecture

### Authentication Module
```
Auth Module
├── Controller: Handles HTTP requests
│   ├── signup()
│   ├── login()
│   ├── logout()
│   ├── refreshToken()
│   ├── forgotPassword()
│   ├── resetPassword()
│   └── changePassword()
├── Service: Business logic
│   ├── generateTokens()
│   ├── verifyToken()
│   ├── hashPassword()
│   ├── comparePassword()
│   └── generateReferralCode()
├── Repository: Data access
│   ├── findByEmail()
│   ├── findByReferralCode()
│   ├── create()
│   └── update()
├── Validator: Input validation
│   ├── signupSchema
│   ├── loginSchema
│   └── passwordResetSchema
└── DTO: Data transfer objects
    ├── SignupDTO
    ├── LoginDTO
    └── TokenDTO
```

### Wallet Module
```
Wallet Module
├── Controller
│   ├── getBalance()
│   ├── getWallets()
│   ├── transferToPrincipal()
│   └── getWalletHistory()
├── Service
│   ├── creditWallet()
│   ├── debitWallet()
│   ├── transferWallet()
│   └── calculateBalance()
├── Repository
│   ├── findByUserId()
│   ├── findByType()
│   └── updateBalance()
└── Types
    ├── WalletType
    └── WalletStatus
```

### Ledger Module
```
Ledger Module
├── Controller
│   ├── getLedger()
│   ├── getLedgerByWallet()
│   └── getLedgerByType()
├── Service
│   ├── createEntry()
│   ├── calculateBalance()
│   └── generateReferenceId()
├── Repository
│   ├── create()
│   ├── findByReference()
│   └── findByWallet()
└── Types
    ├── LedgerType
    └── LedgerStatus
```

### Blockchain Module
```
Blockchain Module
├── Controller
│   ├── verifyTransaction()
│   ├── getBalance()
│   └── getTokenBalance()
├── Service
│   ├── verifyTransfer()
│   ├── parseTransferEvent()
│   ├── checkDuplicateHash()
│   ├── validateNetwork()
│   └── getTransactionReceipt()
├── Repository
│   ├── saveTransaction()
│   ├── findByHash()
│   └── updateStatus()
└── Types
    ├── NetworkType
    └── TransactionStatus
```

### Trading Module
```
Trading Module
├── Controller
│   ├── toggleAutoTrade()
│   ├── getTradeHistory()
│   └── getActiveTrades()
├── Service
│   ├── executeTrade()
│   ├── settleTrade()
│   ├── calculateProfit()
│   ├── distributeProfit()
│   └── validateTradeEligibility()
├── Repository
│   ├── create()
│   ├── findByUserId()
│   ├── findActive()
│   └── update()
└── Types
    ├── TradeStatus
    └── TradeType
```

### Referral Module
```
Referral Module
├── Controller
│   ├── getReferralTree()
│   ├── getReferralStats()
│   └── getReferralHistory()
├── Service
│   ├── calculateBonus()
│   ├── buildTree()
│   ├── getDirectReferrals()
│   └── getTeamSize()
├── Repository
│   ├── findBySponsor()
│   ├── findByUser()
│   └── create()
└── Types
    ├── ReferralLevel
    └── BonusType
```

### Rank Module
```
Rank Module
├── Controller
│   ├── getCurrentRank()
│   ├── getRankHistory()
│   └── getRankRequirements()
├── Service
│   ├── evaluateRank()
│   ├── calculateRequirements()
│   ├── upgradeRank()
│   └── checkEligibility()
├── Repository
│   ├── findByUserId()
│   ├── create()
│   └── update()
└── Types
    ├── RankLevel
    └── RankStatus
```

### Cycle Bonus Module
```
Cycle Bonus Module
├── Controller
│   ├── getCycleHistory()
│   ├── getNextCycleDate()
│   └── getCycleEligibility()
├── Service
│   ├── calculateCycleBonus()
│   ├── distributeCycleBonus()
│   └── checkCycleEligibility()
├── Repository
│   ├── findByUserId()
│   ├── create()
│   └── findActive()
└── Types
    ├── CycleStatus
    └── CycleType
```

## Data Flow

### Deposit Flow
```
User → Submit Deposit → Controller → Validator → Service
→ Blockchain Verification → Repository → Ledger Entry
→ Wallet Credit → Notification → Response
```

### Trading Flow
```
Cron → Trade Service → Check Auto Trade Users
→ Execute Trade (1% Principal) → Wait 2 Minutes
→ Settle Trade → Calculate Profit → Distribute Profit
→ Ledger Entries → Wallet Credits → Notifications
```

### Withdrawal Flow
```
User → Request Withdraw → Controller → Validator → Service
→ Check Balance → Calculate Fee → Check Penalty
→ Create Withdraw Request → Admin Approval
→ Blockchain Transaction → Verification → Ledger Entry
→ Wallet Debit → Notification → Response
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layer                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Helmet  │ │   CORS   │ │ Rate     │ │   XSS    │  │
│  │          │ │          │ │  Limiter │ │ Protect  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │   JWT    │ │  bcrypt  │ │  Zod     │ │  SQL     │  │
│  │  Auth    │ │  Hashing │ │ Validate │ │ Inject   │  │
│  │          │ │          │ │          │ │ Protect  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Cron Job Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Cron Scheduler                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Morning  │ │ Evening  │ │ Trade    │ │ Rank     │  │
│  │  Trade   │ │  Trade   │ │Settlement│ │Evaluation│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Cycle    │ │ Deposit  │ │ Failed   │ │ Daily    │  │
│  │  Bonus   │ │ Verify   │ │ Retry    │ │ Reports  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Database Schema Overview

```
Users
├── id (UUID)
├── email (unique)
├── password (hashed)
├── referralCode (unique)
├── sponsorId (FK)
├── rank
├── autoTradeStatus
└── timestamps

Wallets
├── id (UUID)
├── userId (FK)
├── type (enum)
├── balance
├── totalCredit
├── totalDebit
└── timestamps

Ledgers
├── id (UUID)
├── userId (FK)
├── walletId (FK)
├── type (enum)
├── referenceId
├── credit
├── debit
├── beforeBalance
├── afterBalance
└── timestamps

Deposits
├── id (UUID)
├── userId (FK)
├── amount
├── transactionHash
├── status
├── blockchainData
└── timestamps

Trades
├── id (UUID)
├── userId (FK)
├── amount
├── profit
├── commission
├── status
├── entryTime
├── exitTime
└── timestamps

Referrals
├── id (UUID)
├── userId (FK)
├── sponsorId (FK)
├── level
├── bonusAmount
└── timestamps

Ranks
├── id (UUID)
├── userId (FK)
├── level
├── achievedAt
├── requirements
└── timestamps

CycleBonuses
├── id (UUID)
├── userId (FK)
├── rankLevel
├── amount
├── cycleDate
├── status
└── timestamps

Withdrawals
├── id (UUID)
├── userId (FK)
├── amount
├── fee
├── penalty
├── destinationAddress
├── transactionHash
├── status
└── timestamps
```

## Technology Stack Details

### Backend Framework
- **Node.js**: Latest LTS
- **Express.js**: Web framework
- **TypeScript**: Type safety

### Database & ORM
- **PostgreSQL**: Primary database
- **Prisma ORM**: Database toolkit
- **Redis**: Caching layer

### Authentication & Security
- **JWT**: Access & refresh tokens
- **bcrypt**: Password hashing
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiter**: Request throttling

### Blockchain
- **ethers.js v6**: Blockchain interaction
- **BNB Smart Chain Testnet**: Network
- **USDT Contract**: Token operations

### Validation & Documentation
- **Zod**: Schema validation
- **Swagger/OpenAPI**: API documentation

### Scheduling & Logging
- **node-cron**: Task scheduling
- **Winston**: Logging system

### Email & Notifications
- **Nodemailer**: Email service
- **Event Emitter**: Internal notifications

### Containerization
- **Docker**: Containerization
- **Docker Compose**: Multi-container setup

### Testing
- **Jest**: Testing framework
- **Supertest**: HTTP testing
