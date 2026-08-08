import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const enabled = process.env.EMAIL_ENABLED === 'true';
    if (!enabled) return;

    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const enabled = process.env.EMAIL_ENABLED === 'true';
    if (!enabled) {
      console.log(`[EMAIL] Skipped sending password reset to ${email}: email disabled`);
      return;
    }

    const from = `${process.env.EMAIL_NAME || 'MLM Platform'} <${process.env.EMAIL_FROM || 'noreply@mlmplatform.com'}>`;
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    await this.transporter!.sendMail({
      from,
      to: email,
      subject: 'Password Reset Request',
      text: `Use the following link to reset your password: ${resetUrl}`,
      html: `<p>Use the following link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
    });
  }
}

export const emailService = new EmailService();
