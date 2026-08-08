export const WALLET_ERRORS = {
  WALLET_NOT_FOUND: 'Wallet not found',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  INVALID_WALLET_TYPE: 'Invalid wallet type',
  TRANSFER_SAME_WALLET: 'Cannot transfer to same wallet type',
  TRANSFER_NOT_ALLOWED: 'Transfer not allowed between these wallet types',
  NEGATIVE_AMOUNT: 'Amount must be positive',
  ZERO_AMOUNT: 'Amount must be greater than zero',
} as const;

export const WALLET_SUCCESS = {
  BALANCE_UPDATED: 'Balance updated successfully',
  TRANSFER_COMPLETED: 'Transfer completed successfully',
  WALLETS_CREATED: 'Wallets created successfully',
} as const;

export const ALLOWED_TRANSFERS: Record<string, string[]> = {
  DEPOSIT_BONUS: ['PRINCIPAL'],
  REFERRAL: ['PRINCIPAL'],
  TRADING_PROFIT: ['PRINCIPAL'],
  RANK_BONUS: ['PRINCIPAL'],
  POOL_BONUS: [],  // Requires admin approval via pool bonus request
  PRINCIPAL: [],
  ADMIN_COMMISSION: [],
};
