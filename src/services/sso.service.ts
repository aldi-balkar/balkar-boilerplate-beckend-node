import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import {
  SSOTokenPayload,
  SSOVerifyResponse,
  SSOUserData,
} from '../types/sso.types';

/**
 * SSO Service
 * Handle processing SSO response yang sudah di-forward dari frontend
 * Flow: Frontend -> SSO -> Frontend -> Backend (ini)
 */
export class SSOService {
  /**
   * Process SSO response/token yang dikirim dari frontend
   * Frontend sudah dapat response dari SSO, backend hanya validate dan extract data
   * @param ssoToken - JWT token dari SSO service (via frontend)
   * @returns SSOVerifyResponse
   */
  static async processSSOResponse(ssoToken: string): Promise<SSOVerifyResponse> {
    try {
      // Jika SSO tidak enabled, return error
      if (!config.sso.enabled) {
        return {
          valid: false,
          error: 'SSO_DISABLED',
          message: 'SSO authentication is disabled',
        };
      }

      // Validate dan extract data dari SSO token (JWT)
      if (config.sso.clientSecret) {
        return await this.validateSSOToken(ssoToken);
      }

      return {
        valid: false,
        error: 'SSO_NOT_CONFIGURED',
        message: 'SSO client secret is not configured',
      };
    } catch (error) {
      console.error('SSO processing error:', error);
      return {
        valid: false,
        error: 'SSO_PROCESS_FAILED',
        message: 'Failed to process SSO response',
      };
    }
  }

  /**
   * Validate JWT token dari SSO service
   * Token ini sudah di-sign oleh SSO service dengan shared secret
   * @param ssoToken - JWT token dari SSO service
   */
  private static async validateSSOToken(ssoToken: string): Promise<SSOVerifyResponse> {
    try {
      // Decode dan verify JWT signature
      const decoded = jwt.verify(ssoToken, config.sso.clientSecret!) as SSOTokenPayload;

      // Validate required fields
      if (!decoded.userId || !decoded.email || !decoded.role) {
        return {
          valid: false,
          error: 'INVALID_TOKEN_PAYLOAD',
          message: 'SSO token missing required fields (userId, email, role)',
        };
      }

      // Validate audience (optional) - untuk pastikan token untuk aplikasi ini
      if (config.sso.clientId && decoded.aud && decoded.aud !== config.sso.clientId) {
        return {
          valid: false,
          error: 'INVALID_AUDIENCE',
          message: 'SSO token is not intended for this application',
        };
      }

      // Extract user data dari token
      const user: SSOUserData = {
        id: decoded.userId,
        email: decoded.email,
        username: decoded.username || decoded.email.split('@')[0],
        fullName: decoded.fullName,
        role: decoded.role,
        permissions: decoded.permissions,
      };

      return {
        valid: true,
        user: this.normalizeUserData(user),
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return {
          valid: false,
          error: 'TOKEN_EXPIRED',
          message: 'SSO token has expired',
        };
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return {
          valid: false,
          error: 'INVALID_TOKEN',
          message: 'Invalid SSO token signature',
        };
      }
      throw error;
    }
  }

  /**
   * Normalize user data dari SSO service
   * @param userData - Raw user data dari SSO
   */
  private static normalizeUserData(userData: SSOUserData): SSOUserData {
    return {
      id: userData.id,
      email: userData.email.toLowerCase(),
      username: userData.username || userData.email.split('@')[0],
      fullName: userData.fullName,
      role: userData.role || 'USER',
      permissions: userData.permissions || [],
      metadata: userData.metadata || {},
    };
  }

  /**
   * Get SSO service info
   */
  static getSSOInfo() {
    return {
      enabled: config.sso.enabled,
      serviceUrl: config.sso.serviceUrl,
      hasClientId: !!config.sso.clientId,
      hasClientSecret: !!config.sso.clientSecret,
      configured: !!(config.sso.enabled && config.sso.clientSecret),
      note: 'Backend receives SSO response from frontend, does not call SSO service directly',
    };
  }
}
