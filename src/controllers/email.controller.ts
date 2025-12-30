import { Request, Response, NextFunction } from 'express';
import { emailService } from '../services/email.service';
import { EmailTemplates } from '../templates/email.templates';
import { EmailPayload, EmailTemplateType } from '../types/email.types';
import { logger } from '../config/logger';
import { ResponseHelper } from '../helpers/response.helper';
import { ResponseCode } from '../constants/responseCodes';

/**
 * Send custom email
 */
export const sendCustomEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      to,
      subject,
      html,
      text,
      cc,
      bcc,
      replyTo,
    }: {
      to: string | { email: string; name?: string } | Array<{ email: string; name?: string }>;
      subject: string;
      html?: string;
      text?: string;
      cc?: Array<{ email: string; name?: string }>;
      bcc?: Array<{ email: string; name?: string }>;
      replyTo?: string;
    } = req.body;

    // Validate required fields
    if (!to || !subject) {
      ResponseHelper.error(res, ResponseCode.BAD_REQUEST, 'To and subject are required');
      return;
    }

    if (!html && !text) {
      ResponseHelper.error(res, ResponseCode.BAD_REQUEST, 'Either html or text content is required');
      return;
    }

    // Format recipients
    const formatRecipient = (
      recipient: string | { email: string; name?: string }
    ): { email: string; name?: string } => {
      if (typeof recipient === 'string') {
        return { email: recipient };
      }
      return recipient;
    };

    const payload: EmailPayload = {
      to: Array.isArray(to) ? to.map(formatRecipient) : formatRecipient(to),
      subject,
      html,
      text,
      cc: cc?.map(formatRecipient),
      bcc: bcc?.map(formatRecipient),
      replyTo,
    };

    const result = await emailService.sendEmail(payload);

    if (!result.success) {
      ResponseHelper.error(res, ResponseCode.INTERNAL_ERROR, 'Failed to send email');
      return;
    }

    logger.info({
      message: 'Custom email sent successfully',
      messageId: result.messageId,
      provider: result.provider,
    });

    ResponseHelper.success(res, ResponseCode.SUCCESS, {
      messageId: result.messageId,
      provider: result.provider,
    }, 'Email sent successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Send templated email
 */
export const sendTemplatedEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      to,
      templateType,
      data,
      cc,
      bcc,
    }: {
      to: string | { email: string; name?: string } | Array<{ email: string; name?: string }>;
      templateType: EmailTemplateType;
      data: Record<string, any>;
      cc?: Array<{ email: string; name?: string }>;
      bcc?: Array<{ email: string; name?: string }>;
    } = req.body;

    // Validate required fields
    if (!to || !templateType || !data) {
      ResponseHelper.error(res, ResponseCode.BAD_REQUEST, 'To, templateType, and data are required');
      return;
    }

    // Get template
    const template = EmailTemplates.getTemplate(templateType, data);

    // Format recipients
    const formatRecipient = (
      recipient: string | { email: string; name?: string }
    ): { email: string; name?: string } => {
      if (typeof recipient === 'string') {
        return { email: recipient };
      }
      return recipient;
    };

    const payload: EmailPayload = {
      to: Array.isArray(to) ? to.map(formatRecipient) : formatRecipient(to),
      subject: template.subject,
      html: template.html,
      text: template.text,
      cc: cc?.map(formatRecipient),
      bcc: bcc?.map(formatRecipient),
    };

    const result = await emailService.sendEmail(payload);

    if (!result.success) {
      ResponseHelper.error(res, ResponseCode.INTERNAL_ERROR, 'Failed to send email');
      return;
    }

    logger.info({
      message: 'Templated email sent successfully',
      messageId: result.messageId,
      provider: result.provider,
      templateType,
    });

    ResponseHelper.success(res, ResponseCode.SUCCESS, {
      messageId: result.messageId,
      provider: result.provider,
    }, 'Email sent successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get email provider info
 */
export const getEmailProviderInfo = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const info = emailService.getProviderInfo();
    ResponseHelper.success(res, ResponseCode.SUCCESS, info, 'Email provider info retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Verify SMTP connection
 */
export const verifySmtpConnection = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const isConnected = await emailService.verifySmtpConnection();

    if (!isConnected) {
      ResponseHelper.error(res, ResponseCode.SERVICE_UNAVAILABLE, 'SMTP connection failed');
      return;
    }

    ResponseHelper.success(res, ResponseCode.SUCCESS, { connected: true }, 'SMTP connection verified');
  } catch (error) {
    next(error);
  }
};

/**
 * Get available email templates
 */
export const getAvailableTemplates = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = Object.values(EmailTemplateType).map((type) => ({
      type,
      description: getTemplateDescription(type),
    }));

    ResponseHelper.success(res, ResponseCode.SUCCESS, { templates }, 'Available email templates');
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to get template description
 */
function getTemplateDescription(type: EmailTemplateType): string {
  switch (type) {
    case EmailTemplateType.WELCOME:
      return 'Welcome email for new users';
    case EmailTemplateType.PASSWORD_RESET:
      return 'Password reset email with link';
    case EmailTemplateType.VERIFICATION:
      return 'Email verification email';
    case EmailTemplateType.NOTIFICATION:
      return 'Generic notification email';
    default:
      return 'Unknown template';
  }
}
