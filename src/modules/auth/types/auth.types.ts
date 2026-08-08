import { UserRole, UserStatus, GovIdType } from '@prisma/client';

export interface SignupDTO {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  country?: string;
  referralCode?: string;
  walletAddress?: string;
  govIdType: GovIdType;
  govIdFrontUrl: string;
  govIdBackUrl: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
}

export interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    referralCode: string;
    rank: string;
    autoTradeStatus: boolean;
    status: UserStatus;
    govIdType: GovIdType | null;
    govIdFrontUrl: string | null;
    govIdBackUrl: string | null;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface RefreshTokenPayload extends TokenPayload {
  tokenId: string;
}
