export const DEPOSIT_ERRORS = {
  DEPOSIT_NOT_FOUND: 'Deposit not found',
  INVALID_AMOUNT: 'Invalid deposit amount',
  MINIMUM_DEPOSIT: `Minimum deposit is 50 USDT`,
  INVALID_TRANSACTION_HASH: 'Invalid transaction hash',
  DUPLICATE_TRANSACTION: 'Duplicate transaction hash',
  VERIFICATION_FAILED: 'Deposit verification failed',
  ALREADY_VERIFIED: 'Deposit already verified',
  ALREADY_APPROVED: 'Deposit already approved',
  CANNOT_APPROVE_PENDING: 'Cannot approve rejected or already approved deposit',
  INVALID_STATUS: 'Invalid deposit status',
} as const;

export const DEPOSIT_SUCCESS = {
  DEPOSIT_CREATED: 'Deposit created successfully',
  DEPOSIT_VERIFIED: 'Deposit verified successfully',
  DEPOSIT_APPROVED: 'Deposit approved successfully',
  DEPOSIT_REJECTED: 'Deposit rejected successfully',
} as const;

export const MINIMUM_DEPOSIT = 50;
export const FEE_TOLERANCE_USD = 0.1; // Allow up to $0.10 shortfall due to token fees/slippage
export const DEPOSIT_BONUS_PERCENTAGE = 0.05; // 5%
export const DEPOSIT_BONUS_THRESHOLD = 50;
