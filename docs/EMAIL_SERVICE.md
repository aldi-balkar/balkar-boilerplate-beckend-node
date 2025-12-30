# Email Service Documentation

## Overview

The email service provides flexible email sending capabilities with support for 3 different providers:
1. **SMTP** - Own email server (e.g., Gmail, Outlook, self-hosted)
2. **Email Service** - Separate microservice for centralized email handling
3. **Third-Party** - SaaS providers (Resend, SendGrid, Mailgun)

## Features

✅ **Multi-Provider Support** - Switch between SMTP, Email Service, or Third-Party providers via environment variables  
✅ **Auto-Routing** - Automatically routes emails based on `EMAIL_PROVIDER` setting  
✅ **Email Templates** - Pre-built templates for common use cases (welcome, password reset, verification, notification)  
✅ **Rich Content** - Support for HTML and plain text emails  
✅ **Attachments** - Send files with emails  
✅ **CC/BCC** - Send copies to multiple recipients  
✅ **Permission-Based** - Admin-only access with `email.send` and `email.view` permissions  

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# Email Provider Configuration
EMAIL_PROVIDER=smtp                    # Options: smtp, service, third_party
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Your App Name

# SMTP Configuration (if EMAIL_PROVIDER=smtp)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email Service Configuration (if EMAIL_PROVIDER=service)
EMAIL_SERVICE_URL=https://email.yourdomain.com
EMAIL_SERVICE_API_KEY=your-email-service-api-key

# Third-Party Provider (if EMAIL_PROVIDER=third_party)
EMAIL_THIRD_PARTY_PROVIDER=resend      # Options: resend, sendgrid, mailgun
EMAIL_THIRD_PARTY_API_KEY=your-api-key
```

### Provider Setup

#### 1. SMTP (Own Server)

**Gmail Example:**
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Use App Password, not regular password
```

**Steps for Gmail:**
1. Enable 2FA on your Google account
2. Go to Security → App Passwords
3. Generate app password for "Mail"
4. Use generated password in `SMTP_PASS`

#### 2. Email Service (Microservice)

```env
EMAIL_PROVIDER=service
EMAIL_SERVICE_URL=https://email-service.yourdomain.com
EMAIL_SERVICE_API_KEY=your-secret-key
```

Expected API endpoint: `POST /api/email/send`

Request format:
```json
{
  "from": { "email": "noreply@yourdomain.com", "name": "Your App" },
  "to": [{ "email": "user@example.com", "name": "John Doe" }],
  "subject": "Welcome!",
  "html": "<h1>Welcome!</h1>",
  "text": "Welcome!",
  "cc": [],
  "bcc": [],
  "replyTo": "support@yourdomain.com",
  "attachments": []
}
```

#### 3. Third-Party (Resend)

```env
EMAIL_PROVIDER=third_party
EMAIL_THIRD_PARTY_PROVIDER=resend
EMAIL_THIRD_PARTY_API_KEY=re_123abc...
```

**Steps for Resend:**
1. Sign up at https://resend.com
2. Verify your domain
3. Create API key
4. Use API key in environment variable

## API Endpoints

### 1. Send Custom Email

```http
POST /api/v1/email/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "to": "user@example.com",  // or { "email": "user@example.com", "name": "John" }
  "subject": "Hello World",
  "html": "<h1>Hello</h1><p>This is a test email</p>",
  "text": "Hello\n\nThis is a test email",
  "cc": [{ "email": "manager@example.com", "name": "Manager" }],
  "bcc": ["admin@example.com"],
  "replyTo": "support@example.com"
}
```

**Response:**
```json
{
  "responCode": "01000001",
  "responMessage": "Email sent successfully",
  "status": "OK",
  "data": {
    "messageId": "abc123xyz",
    "provider": "smtp"
  }
}
```

### 2. Send Templated Email

```http
POST /api/v1/email/send-template
Authorization: Bearer {token}
Content-Type: application/json

{
  "to": "user@example.com",
  "templateType": "welcome",
  "data": {
    "name": "John Doe",
    "appName": "My App"
  }
}
```

**Available Templates:**
- `welcome` - Welcome email for new users
- `password_reset` - Password reset with link
- `verification` - Email verification link
- `notification` - Generic notification

### 3. Get Email Provider Info

```http
GET /api/v1/email/provider-info
Authorization: Bearer {token}
```

**Response:**
```json
{
  "responCode": "01000001",
  "responMessage": "Email provider info retrieved successfully",
  "status": "OK",
  "data": {
    "provider": "smtp",
    "from": "noreply@yourdomain.com",
    "fromName": "Your App",
    "smtpConfigured": true,
    "resendConfigured": false
  }
}
```

### 4. Verify SMTP Connection

```http
GET /api/v1/email/verify-smtp
Authorization: Bearer {token}
```

**Response:**
```json
{
  "responCode": "01000001",
  "responMessage": "SMTP connection verified",
  "status": "OK",
  "data": {
    "connected": true
  }
}
```

### 5. Get Available Templates

```http
GET /api/v1/email/templates
Authorization: Bearer {token}
```

**Response:**
```json
{
  "responCode": "01000001",
  "responMessage": "Available email templates",
  "status": "OK",
  "data": {
    "templates": [
      {
        "type": "welcome",
        "description": "Welcome email for new users"
      },
      {
        "type": "password_reset",
        "description": "Password reset email with link"
      }
    ]
  }
}
```

## Permissions

The email service requires specific permissions:

- `email.send` - Send emails (custom or templated)
- `email.view` - View provider info and verify connections

By default:
- **ADMIN** role has both permissions
- **USER** role has no email permissions

## Email Templates

### 1. Welcome Template

```javascript
{
  "templateType": "welcome",
  "data": {
    "name": "John Doe",
    "appName": "My App"  // optional
  }
}
```

### 2. Password Reset Template

```javascript
{
  "templateType": "password_reset",
  "data": {
    "name": "John Doe",
    "resetLink": "https://yourapp.com/reset?token=abc123",
    "appName": "My App"  // optional
  }
}
```

### 3. Verification Template

```javascript
{
  "templateType": "verification",
  "data": {
    "name": "John Doe",
    "verificationLink": "https://yourapp.com/verify?token=abc123",
    "appName": "My App"  // optional
  }
}
```

### 4. Notification Template

```javascript
{
  "templateType": "notification",
  "data": {
    "title": "New Message",
    "message": "You have a new message from support team",
    "actionText": "View Message",  // optional
    "actionLink": "https://yourapp.com/messages",  // optional
    "appName": "My App"  // optional
  }
}
```

## Usage in Code

### Sending Email Programmatically

```typescript
import { emailService } from './services/email.service';
import { EmailPayload } from './types/email.types';

// Send custom email
const payload: EmailPayload = {
  to: { email: 'user@example.com', name: 'John Doe' },
  subject: 'Test Email',
  html: '<h1>Hello</h1>',
  text: 'Hello',
};

const result = await emailService.sendEmail(payload);
if (result.success) {
  console.log('Email sent:', result.messageId);
} else {
  console.error('Email failed:', result.error);
}

// Send with template
import { EmailTemplates } from './templates/email.templates';
import { EmailTemplateType } from './types/email.types';

const template = EmailTemplates.getTemplate(EmailTemplateType.WELCOME, {
  name: 'John Doe',
  appName: 'My App',
});

const templatePayload: EmailPayload = {
  to: { email: 'user@example.com', name: 'John Doe' },
  subject: template.subject,
  html: template.html,
  text: template.text,
};

await emailService.sendEmail(templatePayload);
```

## Architecture

### File Structure

```
src/
├── services/
│   └── email.service.ts       # Main email service with provider routing
├── controllers/
│   └── email.controller.ts    # API endpoints for email operations
├── routes/
│   └── email.routes.ts        # Email API routes
├── types/
│   └── email.types.ts         # TypeScript interfaces
├── templates/
│   └── email.templates.ts     # Email template builder
└── config/
    └── env.ts                 # Email configuration
```

### How It Works

1. **Provider Initialization:**
   - On startup, `EmailService` initializes the configured provider
   - SMTP creates nodemailer transporter
   - Resend creates Resend client
   - Email Service stores URL and API key

2. **Email Sending Flow:**
   ```
   Controller → EmailService.sendEmail() → Auto-route based on EMAIL_PROVIDER
   ├── SMTP → nodemailer.sendMail()
   ├── Service → axios.post() to email service
   └── Third-Party → Resend/SendGrid/Mailgun API
   ```

3. **Provider Switching:**
   - Change `EMAIL_PROVIDER` in `.env`
   - Restart server
   - All emails automatically routed to new provider
   - No code changes needed!

## Error Handling

The email service handles errors gracefully:

- **SMTP Connection Failed:** Returns error with connection details
- **API Rate Limit:** Returns 429 error with retry info
- **Invalid Email:** Returns validation error
- **Provider Down:** Logs error and returns failure response

## Testing

### Test SMTP Connection

```bash
curl -X GET http://localhost:9005/api/v1/email/verify-smtp \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Send Test Email

```bash
curl -X POST http://localhost:9005/api/v1/email/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1>",
    "text": "Test"
  }'
```

## Troubleshooting

### SMTP Authentication Failed

**Problem:** Gmail/Outlook rejects login  
**Solution:** Use App Password instead of regular password

### Emails Not Sending

1. Check provider configuration in `.env`
2. Verify SMTP connection: `GET /api/v1/email/verify-smtp`
3. Check server logs for error details
4. Test with curl/Postman

### Rate Limiting

- SMTP: No rate limit (depends on your email provider)
- Resend: Free tier = 100 emails/day, 3,000 emails/month
- SendGrid: Free tier = 100 emails/day

## Best Practices

1. **Use Email Templates** - Don't send raw HTML in API calls
2. **Queue Long Tasks** - For bulk emails, use a queue system
3. **Monitor Failures** - Log failed emails for retry
4. **Respect Opt-outs** - Check user email preferences
5. **Test Before Production** - Always test with real email addresses

## Future Enhancements

- [ ] Email queue system for bulk sending
- [ ] Email delivery tracking
- [ ] Email bounce handling
- [ ] SendGrid integration
- [ ] Mailgun integration
- [ ] Email analytics dashboard
- [ ] Scheduled emails
- [ ] Email templates editor

## Support

For issues or questions:
- Check logs: Server logs show detailed error messages
- Test connection: Use `/api/v1/email/verify-smtp` endpoint
- Review configuration: Ensure all required env variables are set

## Dependencies

- `nodemailer` - SMTP email sending
- `resend` - Resend API client
- `axios` - HTTP requests for Email Service provider
