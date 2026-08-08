import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authRepository } from '../repository/auth.repository';
import { emailService } from '../../email/service/email.service';
import { referralService } from '../../referral/service/referral.service';
import { walletService } from '../../wallet/service/wallet.service';
import { AUTH_ERRORS, REFERRAL_CODE_LENGTH, REFERRAL_CODE_CHARS } from '../constants/auth.constants';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../../../utils/errors';
import { SignupDTO, LoginDTO, AuthResponse, TokenPayload, RefreshTokenPayload } from '../types/auth.types';
import { UserRole } from '@prisma/client';

export class AuthService {
  /**
   * Generate unique referral code
   */
  private generateReferralCode(): string {
    let code = '';
    for (let i = 0; i < REFERRAL_CODE_LENGTH; i++) {
      code += REFERRAL_CODE_CHARS.charAt(Math.floor(Math.random() * REFERRAL_CODE_CHARS.length));
    }
    return code;
  }

  /**
   * Ensure unique referral code
   */
  private async ensureUniqueReferralCode(): Promise<string> {
    let code = this.generateReferralCode();
    let exists = await authRepository.findByReferralCode(code);
    while (exists) {
      code = this.generateReferralCode();
      exists = await authRepository.findByReferralCode(code);
    }
    return code;
  }

  /**
   * Hash password
   */
  async hashPassword(password: string): Promise<string> {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
    return bcrypt.hash(password, rounds);
  }

  /**
   * Compare password
   */
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate access token
   */
  private generateAccessToken(payload: TokenPayload): string {
    const secret = process.env.JWT_ACCESS_SECRET || 'default_access_secret';
    const expiresIn = (process.env.JWT_ACCESS_EXPIRY || '15m') as any;
    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(payload: RefreshTokenPayload): string {
    const secret = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret';
    const expiresIn = (process.env.JWT_REFRESH_EXPIRY || '7d') as any;
    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): TokenPayload {
    const secret = process.env.JWT_ACCESS_SECRET || 'default_access_secret';
    return jwt.verify(token, secret) as unknown as TokenPayload;
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): RefreshTokenPayload {
    const secret = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret';
    return jwt.verify(token, secret) as unknown as RefreshTokenPayload;
  }

  /**
   * Generate tokens
   */
  async generateTokens(user: any): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.generateAccessToken(payload);

    const refreshTokenString = this.generateRefreshToken({
      ...payload,
      tokenId: '', // Will be set after creating in DB
    });

    // Store refresh token in database
    const expiresIn = process.env.JWT_REFRESH_EXPIRY || '7d';
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const refreshToken = await authRepository.createRefreshToken(
      user.id,
      refreshTokenString,
      expiresAt
    );

    // Regenerate refresh token with tokenId
    const finalRefreshToken = this.generateRefreshToken({
      ...payload,
      tokenId: refreshToken.id,
    });

    return {
      accessToken,
      refreshToken: finalRefreshToken,
    };
  }

  /**
   * Signup user
   */
  async signup(data: SignupDTO): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await authRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError(AUTH_ERRORS.USER_ALREADY_EXISTS);
    }

    // Validate referral code if provided
    if (data.referralCode) {
      const sponsor = await authRepository.findByReferralCode(data.referralCode);
      if (!sponsor) {
        throw new BadRequestError(AUTH_ERRORS.INVALID_REFERRAL_CODE);
      }
    }

    // Generate unique referral code
    const referralCode = await this.ensureUniqueReferralCode();

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Create user
    const user = await authRepository.createUser(data, hashedPassword, referralCode);

    // Initialize default wallets for the new user
    await walletService.initializeWallets(user.id);

    // Create referral relationship if a sponsor was provided
    if (user.sponsorId) {
      try {
        await referralService.createReferral(user.id, user.sponsorId);
      } catch (error) {
        console.error(`Failed to create referral relationship for user ${user.id}:`, error);
      }
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        referralCode: user.referralCode,
        rank: user.rank,
        autoTradeStatus: user.autoTradeStatus,
        status: user.status,
        govIdType: user.govIdType,
        govIdFrontUrl: user.govIdFrontUrl,
        govIdBackUrl: user.govIdBackUrl,
      },
      tokens,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginDTO): Promise<AuthResponse> {
    // Find user by email
    const user = await authRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    // Check account status
    if (user.status === 'INACTIVE') {
      throw new ForbiddenError(AUTH_ERRORS.ACCOUNT_INACTIVE);
    }
    if (user.status === 'SUSPENDED') {
      throw new ForbiddenError(AUTH_ERRORS.ACCOUNT_SUSPENDED);
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    // Update last login
    await authRepository.updateLastLogin(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        referralCode: user.referralCode,
        rank: user.rank,
        autoTradeStatus: user.autoTradeStatus,
        status: user.status,
        govIdType: user.govIdType,
        govIdFrontUrl: user.govIdFrontUrl,
        govIdBackUrl: user.govIdBackUrl,
      },
      tokens,
    };
  }

  /**
   * Refresh tokens
   */
  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify refresh token
    let payload: RefreshTokenPayload;
    try {
      payload = this.verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new UnauthorizedError(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
    }

    // Find refresh token in database
    const tokenRecord = await authRepository.findRefreshToken(refreshToken);
    if (!tokenRecord) {
      throw new UnauthorizedError(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
    }

    // Check if token is revoked
    if (tokenRecord.revokedAt) {
      throw new UnauthorizedError(AUTH_ERRORS.REFRESH_TOKEN_REVOKED);
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedError(AUTH_ERRORS.TOKEN_EXPIRED);
    }

    // Find user
    const user = await authRepository.findById(payload.userId);
    if (!user) {
      throw new NotFoundError(AUTH_ERRORS.USER_NOT_FOUND);
    }

    // Revoke old refresh token
    await authRepository.revokeRefreshToken(tokenRecord.id, 'Token refresh');

    // Generate new tokens
    return this.generateTokens(user);
  }

  /**
   * Logout user
   */
  async logout(userId: string): Promise<void> {
    await authRepository.revokeAllUserTokens(userId, 'Logout');
  }

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists for security
      return;
    }

    // Generate password reset token
    const token = this.generateReferralCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    await authRepository.createPasswordResetToken(user.id, token, expiresAt);

    // Email sending is optional; disabled by default via EMAIL_ENABLED
    emailService.sendPasswordReset(user.email, token).catch((error) => {
      console.error('Failed to send password reset email:', error);
    });
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Find password reset token
    const tokenRecord = await authRepository.findPasswordResetToken(token);
    if (!tokenRecord) {
      throw new BadRequestError(AUTH_ERRORS.PASSWORD_RESET_TOKEN_INVALID);
    }

    // Check if token is already used
    if (tokenRecord.usedAt) {
      throw new BadRequestError(AUTH_ERRORS.PASSWORD_RESET_TOKEN_USED);
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      throw new BadRequestError(AUTH_ERRORS.PASSWORD_RESET_TOKEN_INVALID);
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update user password
    await authRepository.updatePassword(tokenRecord.userId, hashedPassword);

    // Mark token as used
    await authRepository.markPasswordResetTokenUsed(tokenRecord.id);

    // Revoke all refresh tokens for security
    await authRepository.revokeAllUserTokens(tokenRecord.userId, 'Password reset');
  }

  /**
   * Change password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    // Find user
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(AUTH_ERRORS.USER_NOT_FOUND);
    }

    // Verify old password
    const isPasswordValid = await this.comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError(AUTH_ERRORS.PASSWORD_MISMATCH);
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update user password
    await authRepository.updatePassword(userId, hashedPassword);

    // Revoke all refresh tokens for security
    await authRepository.revokeAllUserTokens(userId, 'Password change');
  }
}

export const authService = new AuthService();
