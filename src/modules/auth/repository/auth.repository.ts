import { PrismaClient, User, RefreshToken, PasswordResetToken } from '@prisma/client';
import { SignupDTO } from '../types/auth.types';

const prisma = new PrismaClient();

export class AuthRepository {
  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
      include: {
        sponsor: true,
      },
    });
  }

  /**
   * Find user by referral code
   */
  async findByReferralCode(referralCode: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { referralCode },
    });
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        sponsor: true,
      },
    });
  }

  /**
   * Create new user
   */
  async createUser(data: SignupDTO, hashedPassword: string, referralCode: string): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        country: data.country,
        referralCode,
        sponsorId: data.referralCode ? (await this.findByReferralCode(data.referralCode))?.id : null,
        walletAddress: data.walletAddress,
        govIdType: data.govIdType,
        govIdFrontUrl: data.govIdFrontUrl,
        govIdBackUrl: data.govIdBackUrl,
      },
      include: {
        sponsor: true,
      },
    });
  }

  /**
   * Update user last login
   */
  async updateLastLogin(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, hashedPassword: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  /**
   * Create refresh token
   */
  async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  /**
   * Find refresh token by token string
   */
  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: true,
      },
    });
  }

  /**
   * Revoke refresh token
   */
  async revokeRefreshToken(tokenId: string, reason?: string): Promise<RefreshToken> {
    return prisma.refreshToken.update({
      where: { id: tokenId },
      data: {
        revokedAt: new Date(),
        revokedReason: reason,
      },
    });
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserTokens(userId: string, reason?: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
        revokedReason: reason || 'Logout',
      },
    });
  }

  /**
   * Delete expired refresh tokens
   */
  async deleteExpiredRefreshTokens(): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  /**
   * Create password reset token
   */
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  /**
   * Find password reset token
   */
  async findPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
    return prisma.passwordResetToken.findUnique({
      where: { token },
      include: {
        user: true,
      },
    });
  }

  /**
   * Mark password reset token as used
   */
  async markPasswordResetTokenUsed(tokenId: string): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: {
        usedAt: new Date(),
      },
    });
  }

  /**
   * Delete expired password reset tokens
   */
  async deleteExpiredPasswordResetTokens(): Promise<void> {
    await prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}

export const authRepository = new AuthRepository();
