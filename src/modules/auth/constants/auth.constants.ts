export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User with this email already exists',
  INVALID_REFERRAL_CODE: 'Invalid referral code',
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
  REFRESH_TOKEN_REVOKED: 'Refresh token has been revoked',
  PASSWORD_MISMATCH: 'Current password is incorrect',
  PASSWORD_RESET_TOKEN_INVALID: 'Invalid or expired password reset token',
  PASSWORD_RESET_TOKEN_USED: 'Password reset token has already been used',
  ACCOUNT_INACTIVE: 'Account is inactive',
  ACCOUNT_SUSPENDED: 'Account has been suspended',
  GOV_ID_TYPE_REQUIRED: 'Government ID type is required',
  GOV_ID_FRONT_REQUIRED: 'Government ID front side photo is required',
  GOV_ID_BACK_REQUIRED: 'Government ID back side photo is required',
} as const;

export const AUTH_SUCCESS = {
  SIGNUP_SUCCESS: 'Account created successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PASSWORD_RESET_EMAIL_SENT: 'Password reset email sent',
  PASSWORD_RESET_SUCCESS: 'Password reset successful',
  PASSWORD_CHANGED_SUCCESS: 'Password changed successfully',
} as const;

export const REFERRAL_CODE_LENGTH = 8;
export const REFERRAL_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const KYC_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
