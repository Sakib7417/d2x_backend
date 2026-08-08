import { Request, Response, NextFunction } from 'express';
import { authService } from '../service/auth.service';
import { SignupInput, LoginInput, RefreshTokenInput, ForgotPasswordInput, ResetPasswordInput, ChangePasswordInput } from '../validator/auth.validator';
import { BadRequestError } from '../../../utils/errors';
import { AUTH_ERRORS } from '../constants/auth.constants';
import { uploadToCloudinary, CLOUDINARY_FOLDERS } from '../../../config/cloudinary';

export class AuthController {
  /**
   * Signup user with government ID (front + back photos).
   * Both images are uploaded to Cloudinary and their secure URLs persisted.
   */
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const frontFile = files?.govIdFront?.[0];
      const backFile = files?.govIdBack?.[0];

      if (!frontFile) {
        throw new BadRequestError(AUTH_ERRORS.GOV_ID_FRONT_REQUIRED);
      }
      if (!backFile) {
        throw new BadRequestError(AUTH_ERRORS.GOV_ID_BACK_REQUIRED);
      }

      // Upload both ID images to Cloudinary in parallel.
      const [frontRes, backRes] = await Promise.all([
        uploadToCloudinary(frontFile, CLOUDINARY_FOLDERS.KYC),
        uploadToCloudinary(backFile, CLOUDINARY_FOLDERS.KYC),
      ]);

      const data: SignupInput & { govIdFrontUrl: string; govIdBackUrl: string } = {
        ...req.body,
        govIdFrontUrl: frontRes.secure_url,
        govIdBackUrl: backRes.secure_url,
      };

      const result = await authService.signup(data);
      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: LoginInput = req.body;
      const result = await authService.login(data);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh tokens
   */
  async refreshTokens(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: RefreshTokenInput = req.body;
      const tokens = await authService.refreshTokens(data.refreshToken);
      res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      await authService.logout(userId);
      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: ForgotPasswordInput = req.body;
      await authService.forgotPassword(data.email);
      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: ResetPasswordInput = req.body;
      await authService.resetPassword(data.token, data.newPassword);
      res.status(200).json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const data: ChangePasswordInput = req.body;
      await authService.changePassword(userId, data.oldPassword, data.newPassword);
      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

}

export const authController = new AuthController();
