import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from external path if needed, otherwise from project root
const envPath = process.env.ENV_PATH || path.join(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),
  API_VERSION: z.string().default('v1'),

  // Database
  DATABASE_URL: z.string().url('Invalid DATABASE_URL'),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().positive()).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().positive()).default('1000'),

  // Logging
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  // Service Code
  SERVICE_CODE: z.string().length(4, 'SERVICE_CODE must be exactly 4 digits').regex(/^\d{4}$/, 'SERVICE_CODE must contain only digits').default('0001'),

  // SSO Configuration
  SSO_ENABLED: z.string().transform((val) => val === 'true').default('true'),
  SSO_SERVICE_URL: z.string().url().optional(),
  SSO_CLIENT_ID: z.string().optional(),
  SSO_CLIENT_SECRET: z.string().min(32).optional(),
  SSO_TOKEN_EXPIRATION: z.string().default('1h'),

  // Asset Service Configuration
  ASSET_SERVICE_ENABLED: z.string().transform((val) => val === 'true').default('false'),
  ASSET_SERVICE_URL: z.string().url().optional(),
  ASSET_SERVICE_API_KEY: z.string().optional(),
  ASSET_SERVICE_MAX_FILE_SIZE: z.string().transform(Number).pipe(z.number().positive()).default('10485760'), // 10MB default
  LOCAL_UPLOAD_PATH: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.string().transform(Number).pipe(z.number().positive()).default('10485760'), // 10MB default
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'),

  // Email Configuration
  EMAIL_PROVIDER: z.enum(['smtp', 'service', 'third_party']).default('smtp'),
  EMAIL_FROM: z.string().email().default('noreply@example.com'),
  EMAIL_FROM_NAME: z.string().default('App Name'),

  // SMTP Configuration (Own Service)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).pipe(z.number().positive()).optional(),
  SMTP_SECURE: z.string().transform((val) => val === 'true').default('true'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // Email Service Configuration (Separate Service)
  EMAIL_SERVICE_URL: z.string().url().optional(),
  EMAIL_SERVICE_API_KEY: z.string().optional(),

  // Third Party Provider Configuration (Resend/SendGrid/etc)
  EMAIL_THIRD_PARTY_PROVIDER: z.enum(['resend', 'sendgrid', 'mailgun']).optional(),
  EMAIL_THIRD_PARTY_API_KEY: z.string().optional(),
});

// Validate and export environment variables
function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error('❌ Environment validation failed:', error);
    }
    process.exit(1);
  }
}

export const env = validateEnv();

// Export parsed config
export const config = {
  app: {
    env: env.NODE_ENV,
    port: env.PORT,
    apiVersion: env.API_VERSION,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },
  database: {
    url: env.DATABASE_URL,
  },
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiration: env.JWT_ACCESS_EXPIRATION,
    refreshExpiration: env.JWT_REFRESH_EXPIRATION,
  },
  cors: {
    origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  logging: {
    level: env.LOG_LEVEL,
  },
  sso: {
    enabled: env.SSO_ENABLED,
    serviceUrl: env.SSO_SERVICE_URL,
    clientId: env.SSO_CLIENT_ID,
    clientSecret: env.SSO_CLIENT_SECRET,
    tokenExpiration: env.SSO_TOKEN_EXPIRATION,
  },
  asset: {
    serviceEnabled: env.ASSET_SERVICE_ENABLED,
    serviceUrl: env.ASSET_SERVICE_URL,
    apiKey: env.ASSET_SERVICE_API_KEY,
    maxFileSize: env.ASSET_SERVICE_MAX_FILE_SIZE,
    localUploadPath: env.LOCAL_UPLOAD_PATH,
    maxLocalFileSize: env.MAX_FILE_SIZE,
    allowedFileTypes: env.ALLOWED_FILE_TYPES.split(',').map((type) => type.trim()),
  },
  email: {
    provider: env.EMAIL_PROVIDER,
    from: env.EMAIL_FROM,
    fromName: env.EMAIL_FROM_NAME,
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    service: {
      url: env.EMAIL_SERVICE_URL,
      apiKey: env.EMAIL_SERVICE_API_KEY,
    },
    thirdParty: {
      provider: env.EMAIL_THIRD_PARTY_PROVIDER,
      apiKey: env.EMAIL_THIRD_PARTY_API_KEY,
    },
  },
} as const;
