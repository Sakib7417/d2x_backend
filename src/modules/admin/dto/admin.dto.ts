import { UserRole } from '@prisma/client';

export interface UserActionDTO {
  userId: string;
  action: 'BAN' | 'UNBAN' | 'ACTIVATE' | 'SUSPEND';
  reason?: string;
}

export interface ListQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: UserRole;
}

export interface UpdateConfigDTO {
  key: string;
  value: string;
  description?: string;
}

export interface TradeTimeDTO {
  hour: number;
  minute: number;
  time: string;
}

export interface TradeScheduleDTO {
  morning: TradeTimeDTO;
}
