/**
 * SSO (Single Sign-On) Types
 * Types and interfaces untuk integrasi dengan SSO Service
 */

export interface SSOUserData {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  role: 'ADMIN' | 'USER';
  permissions?: string[];
  metadata?: Record<string, any>;
}

export interface SSOTokenPayload {
  userId: string;
  email: string;
  username: string;
  fullName?: string;
  role: 'ADMIN' | 'USER';
  permissions?: string[];
  iat?: number;
  exp?: number;
  iss?: string; // Issuer (SSO Service)
  aud?: string; // Audience (This Service)
}

export interface SSOLoginRequest {
  ssoToken: string; // Token dari SSO service
  clientId?: string; // Optional client ID untuk validation
}

export interface SSOVerifyResponse {
  valid: boolean;
  user?: SSOUserData;
  error?: string;
  message?: string;
}

export interface SSOLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    fullName?: string;
    role: string;
  };
}

export interface SSOConfig {
  enabled: boolean;
  serviceUrl?: string;
  clientId?: string;
  clientSecret?: string;
  verifyUrl?: string;
  tokenExpiration: string;
}

export enum SSOProvider {
  INTERNAL = 'INTERNAL', // SSO service internal
  GOOGLE = 'GOOGLE',
  MICROSOFT = 'MICROSOFT',
  GITHUB = 'GITHUB',
}

export interface SSOUser {
  ssoId: string;
  provider: SSOProvider;
  email: string;
  username: string;
  fullName?: string;
  role: 'ADMIN' | 'USER';
  metadata?: Record<string, any>;
}
