import { EmailTemplate, EmailTemplateType } from '../types/email.types';

/**
 * Email template builder
 */
export class EmailTemplates {
  /**
   * Get template by type
   */
  static getTemplate(
    type: EmailTemplateType,
    data: Record<string, any>
  ): EmailTemplate {
    switch (type) {
      case EmailTemplateType.WELCOME:
        return this.welcomeTemplate(data as { name: string; appName?: string });
      case EmailTemplateType.PASSWORD_RESET:
        return this.passwordResetTemplate(data as { name: string; resetLink: string; appName?: string });
      case EmailTemplateType.VERIFICATION:
        return this.verificationTemplate(data as { name: string; verificationLink: string; appName?: string });
      case EmailTemplateType.NOTIFICATION:
        return this.notificationTemplate(data as { title: string; message: string; actionText?: string; actionLink?: string; appName?: string });
      default:
        throw new Error(`Unknown template type: ${type}`);
    }
  }

  /**
   * Welcome email template
   */
  private static welcomeTemplate(data: {
    name: string;
    appName?: string;
  }): EmailTemplate {
    const appName = data.appName || 'Our App';

    return {
      subject: `Welcome to ${appName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${appName}!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.name},</p>
              <p>Thank you for joining ${appName}! We're excited to have you on board.</p>
              <p>You can now access all the features and start exploring.</p>
              <p>If you have any questions, feel free to reach out to our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Welcome to ${appName}!\n\nHi ${data.name},\n\nThank you for joining ${appName}! We're excited to have you on board.\n\nYou can now access all the features and start exploring.\n\nIf you have any questions, feel free to reach out to our support team.`,
    };
  }

  /**
   * Password reset email template
   */
  private static passwordResetTemplate(data: {
    name: string;
    resetLink: string;
    appName?: string;
  }): EmailTemplate {
    const appName = data.appName || 'Our App';

    return {
      subject: `Password Reset Request - ${appName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${data.name},</p>
              <p>We received a request to reset your password for your ${appName} account.</p>
              <p>Click the button below to reset your password:</p>
              <p style="text-align: center;">
                <a href="${data.resetLink}" class="button">Reset Password</a>
              </p>
              <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request this, please ignore this email.
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #2196F3;">${data.resetLink}</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Password Reset Request - ${appName}\n\nHi ${data.name},\n\nWe received a request to reset your password for your ${appName} account.\n\nClick this link to reset your password:\n${data.resetLink}\n\n⚠️ Important: This link will expire in 1 hour. If you didn't request this, please ignore this email.`,
    };
  }

  /**
   * Email verification template
   */
  private static verificationTemplate(data: {
    name: string;
    verificationLink: string;
    appName?: string;
  }): EmailTemplate {
    const appName = data.appName || 'Our App';

    return {
      subject: `Verify Your Email - ${appName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 10px 20px; background-color: #FF9800; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email</h1>
            </div>
            <div class="content">
              <p>Hi ${data.name},</p>
              <p>Thank you for signing up for ${appName}!</p>
              <p>Please verify your email address by clicking the button below:</p>
              <p style="text-align: center;">
                <a href="${data.verificationLink}" class="button">Verify Email</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #FF9800;">${data.verificationLink}</p>
              <p>This link will expire in 24 hours.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Verify Your Email - ${appName}\n\nHi ${data.name},\n\nThank you for signing up for ${appName}!\n\nPlease verify your email address by clicking this link:\n${data.verificationLink}\n\nThis link will expire in 24 hours.`,
    };
  }

  /**
   * Generic notification template
   */
  private static notificationTemplate(data: {
    title: string;
    message: string;
    actionText?: string;
    actionLink?: string;
    appName?: string;
  }): EmailTemplate {
    const appName = data.appName || 'Our App';

    const actionButton = data.actionText && data.actionLink
      ? `<p style="text-align: center;">
          <a href="${data.actionLink}" class="button">${data.actionText}</a>
         </p>`
      : '';

    return {
      subject: data.title,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #9C27B0; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 10px 20px; background-color: #9C27B0; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${data.title}</h1>
            </div>
            <div class="content">
              <p>${data.message}</p>
              ${actionButton}
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `${data.title}\n\n${data.message}${data.actionLink ? `\n\n${data.actionText}: ${data.actionLink}` : ''}`,
    };
  }
}
