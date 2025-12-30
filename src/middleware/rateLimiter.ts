import { Request, Response } from 'express';
import { rateLimit, RateLimitRequestHandler } from 'express-rate-limit';
import { config } from '../config/env';
import { ApiError } from '../utils/ApiError';

// Rate limiter configuration interface
interface RateLimiterConfig {
  windowMs: number;
  max: number;
  message?: string;
}

// Create custom rate limiter
export const createRateLimiter = (options: RateLimiterConfig): RateLimitRequestHandler => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req: Request, _res: Response) => {
      throw new ApiError(429, options.message || 'Too many requests, please try again later');
    },
    skip: (_req: Request) => {
      // Skip rate limiting in test environment
      return config.app.isTest;
    },
  });
};

// Global rate limiter (1000 requests per 15 minutes)
export const globalLimiter = createRateLimiter({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later',
});

// Login rate limiter (5 requests per minute)
export const loginLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: 'Too many login attempts, please try again after a minute',
});

// Register rate limiter (3 requests per minute)
export const registerLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 3,
  message: 'Too many registration attempts, please try again after a minute',
});

// Refresh token rate limiter (10 requests per minute)
export const refreshTokenLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many token refresh attempts, please try again after a minute',
});

// CRUD operations rate limiter (100 requests per minute)
export const crudLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many requests, please slow down',
});
