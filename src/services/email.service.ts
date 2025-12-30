import nodemailer, { Transporter } from 'nodemailer';
import { Resend } from 'resend';
import axios from 'axios';
import { config } from '../config/env';
import {
  EmailProvider,
  EmailPayload,
  SendEmailResponse,
  EmailRecipient,
  EmailServiceResponse,
  ThirdPartyEmailProvider,
} from '../types/email.types';
import { logger } from '../config/logger';

class EmailService {
  private smtpTransporter: Transporter | null = null;
  private resendClient: Resend | null = null;

  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize email providers based on configuration
   */
  private initializeProviders(): void {
    try {
      if (config.email.provider === EmailProvider.SMTP) {
        this.smtpTransporter = nodemailer.createTransport({
          host: config.email.smtp.host,
          port: config.email.smtp.port,
          secure: config.email.smtp.secure,
          auth: {
            user: config.email.smtp.user,
            pass: config.email.smtp.pass,
          },
        });
        logger.info({ message: 'SMTP transporter initialized' });
      }

      if (
        config.email.provider === EmailProvider.THIRD_PARTY &&
        config.email.thirdParty.provider === ThirdPartyEmailProvider.RESEND
      ) {
        this.resendClient = new Resend(config.email.thirdParty.apiKey);
        logger.info({ message: 'Resend client initialized' });
      }
    } catch (error) {
      logger.error({ message: 'Failed to initialize email providers', error });
    }
  }

  /**
   * Send email - auto-route based on provider configuration
   */
  async sendEmail(payload: EmailPayload): Promise<SendEmailResponse> {
    try {
      const provider = config.email.provider as EmailProvider;

      logger.info({
        message: `Sending email via ${provider}`,
        to: payload.to,
        subject: payload.subject,
      });

      switch (provider) {
        case EmailProvider.SMTP:
          return await this.sendViaSmtp(payload);
        case EmailProvider.SERVICE:
          return await this.sendViaService(payload);
        case EmailProvider.THIRD_PARTY:
          return await this.sendViaThirdParty(payload);
        default:
          throw new Error(`Unsupported email provider: ${provider}`);
      }
    } catch (error) {
      logger.error({ message: 'Failed to send email', error });
      return {
        success: false,
        provider: config.email.provider as EmailProvider,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send email via SMTP (own email server)
   */
  private async sendViaSmtp(payload: EmailPayload): Promise<SendEmailResponse> {
    if (!this.smtpTransporter) {
      throw new Error('SMTP transporter not initialized');
    }

    try {
      const recipients = this.formatRecipients(payload.to);
      const cc = payload.cc ? this.formatRecipients(payload.cc) : undefined;
      const bcc = payload.bcc ? this.formatRecipients(payload.bcc) : undefined;

      const info = await this.smtpTransporter.sendMail({
        from: `"${config.email.fromName}" <${config.email.from}>`,
        to: recipients,
        cc,
        bcc,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
        replyTo: payload.replyTo,
        attachments: payload.attachments?.map((att) => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
        })),
      });

      logger.info({ message: 'Email sent via SMTP', messageId: info.messageId });

      return {
        success: true,
        messageId: info.messageId,
        provider: EmailProvider.SMTP,
      };
    } catch (error) {
      logger.error({ message: 'SMTP send failed', error });
      throw error;
    }
  }

  /**
   * Send email via separate email service
   */
  private async sendViaService(payload: EmailPayload): Promise<SendEmailResponse> {
    try {
      const response = await axios.post<EmailServiceResponse>(
        `${config.email.service.url}/api/email/send`,
        {
          from: {
            email: config.email.from,
            name: config.email.fromName,
          },
          to: Array.isArray(payload.to) ? payload.to : [payload.to],
          cc: payload.cc,
          bcc: payload.bcc,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
          replyTo: payload.replyTo,
          attachments: payload.attachments,
        },
        {
          headers: {
            Authorization: `Bearer ${config.email.service.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      logger.info({
        message: 'Email sent via email service',
        messageId: response.data.messageId,
      });

      return {
        success: true,
        messageId: response.data.messageId,
        provider: EmailProvider.SERVICE,
      };
    } catch (error) {
      logger.error({ message: 'Email service send failed', error });
      throw error;
    }
  }

  /**
   * Send email via third-party provider (Resend/SendGrid/Mailgun)
   */
  private async sendViaThirdParty(payload: EmailPayload): Promise<SendEmailResponse> {
    const provider = config.email.thirdParty.provider as ThirdPartyEmailProvider;

    switch (provider) {
      case ThirdPartyEmailProvider.RESEND:
        return await this.sendViaResend(payload);
      case ThirdPartyEmailProvider.SENDGRID:
        return await this.sendViaSendGrid(payload);
      case ThirdPartyEmailProvider.MAILGUN:
        return await this.sendViaMailgun(payload);
      default:
        throw new Error(`Unsupported third-party provider: ${provider}`);
    }
  }

  /**
   * Send email via Resend
   */
  private async sendViaResend(payload: EmailPayload): Promise<SendEmailResponse> {
    if (!this.resendClient) {
      throw new Error('Resend client not initialized');
    }

    try {
      const to = Array.isArray(payload.to)
        ? payload.to.map((r) => (r.name ? `${r.name} <${r.email}>` : r.email))
        : [payload.to.name ? `${payload.to.name} <${payload.to.email}>` : payload.to.email];

      const emailOptions: any = {
        from: `${config.email.fromName} <${config.email.from}>`,
        to,
        subject: payload.subject,
        replyTo: payload.replyTo,
      };

      // Resend requires either html or text (not both in some versions)
      if (payload.html) {
        emailOptions.html = payload.html;
      } else if (payload.text) {
        emailOptions.text = payload.text;
      }

      if (payload.attachments) {
        emailOptions.attachments = payload.attachments.map((att) => ({
          filename: att.filename,
          content: att.content instanceof Buffer ? att.content : Buffer.from(att.content),
        }));
      }

      const { data, error } = await this.resendClient.emails.send(emailOptions);

      if (error) {
        throw new Error(error.message);
      }

      logger.info({ message: 'Email sent via Resend', messageId: data?.id });

      return {
        success: true,
        messageId: data?.id,
        provider: EmailProvider.THIRD_PARTY,
      };
    } catch (error) {
      logger.error({ message: 'Resend send failed', error });
      throw error;
    }
  }

  /**
   * Send email via SendGrid (placeholder - implement when needed)
   */
  private async sendViaSendGrid(_payload: EmailPayload): Promise<SendEmailResponse> {
    // TODO: Implement SendGrid integration
    // npm install @sendgrid/mail
    throw new Error('SendGrid integration not implemented yet');
  }

  /**
   * Send email via Mailgun (placeholder - implement when needed)
   */
  private async sendViaMailgun(_payload: EmailPayload): Promise<SendEmailResponse> {
    // TODO: Implement Mailgun integration
    // npm install mailgun.js
    throw new Error('Mailgun integration not implemented yet');
  }

  /**
   * Format recipients for nodemailer
   */
  private formatRecipients(recipients: EmailRecipient | EmailRecipient[]): string {
    const recipientArray = Array.isArray(recipients) ? recipients : [recipients];
    return recipientArray
      .map((r) => (r.name ? `"${r.name}" <${r.email}>` : r.email))
      .join(', ');
  }

  /**
   * Verify SMTP connection
   */
  async verifySmtpConnection(): Promise<boolean> {
    if (!this.smtpTransporter) {
      return false;
    }

    try {
      await this.smtpTransporter.verify();
      logger.info({ message: 'SMTP connection verified' });
      return true;
    } catch (error) {
      logger.error({ message: 'SMTP verification failed', error });
      return false;
    }
  }

  /**
   * Get current email provider configuration
   */
  getProviderInfo() {
    return {
      provider: config.email.provider,
      from: config.email.from,
      fromName: config.email.fromName,
      smtpConfigured: !!this.smtpTransporter,
      resendConfigured: !!this.resendClient,
    };
  }
}

// Export singleton instance
export const emailService = new EmailService();
