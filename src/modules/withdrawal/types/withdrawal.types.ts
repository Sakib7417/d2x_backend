import { WithdrawalStatus, WithdrawalWalletType } from '@prisma/client';

export interface CreateWithdrawalDTO {
  amount: string;
  walletAddress: string; // Map to destinationAddress in DB
  walletType: WithdrawalWalletType;
  network?: string;
}

export interface WithdrawalQueryDTO {
  status?: WithdrawalStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}
