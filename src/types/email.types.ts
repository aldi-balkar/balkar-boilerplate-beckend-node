export enum EmailProvider {
  SMTP = 'smtp',
  SERVICE = 'service',
  THIRD_PARTY = 'third_party',
}

export enum ThirdPartyEmailProvider {
  RESEND = 'resend',
  SENDGRID = 'sendgrid',
  MAILGUN = 'mailgun',
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface EmailPayload {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  html?: string;
  text?: string;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  attachments?: EmailAttachment[];
  replyTo?: string;
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  provider: EmailProvider;
  error?: string;
}

export interface EmailServiceResponse {
  success: boolean;
  messageId: string;
  timestamp: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export enum EmailTemplateType {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  VERIFICATION = 'verification',
  NOTIFICATION = 'notification',
}
