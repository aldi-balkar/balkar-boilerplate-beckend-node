import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { ResponseHelper } from '../helpers/response.helper';
import { ResponseCode } from '../constants/responseCodes';
import { StatusCode } from '../constants/statusCodes';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AuditAction } from '@prisma/client';
import { SSOService } from '../services/sso.service';
import { SSOLoginRequest } from '../types/sso.types';

export class AuthController {
  // Register new user
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, username, password } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
        select: { id: true },
      });

      if (existingUser) {
        ResponseHelper.duplicateEntry(res, 'Email or username');
        return;
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          role: 'USER',
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: AuditAction.REGISTER,
          entity: 'User',
          entityId: user.id,
          details: `User registered: ${user.email}`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      ResponseHelper.created(res, { user }, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  // Login user
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          username: true,
          password: true,
          role: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        ResponseHelper.invalidCredentials(res);
        return;
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        ResponseHelper.invalidCredentials(res);
        return;
      }

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Calculate expiration date (7 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Save refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: AuditAction.LOGIN,
          entity: 'User',
          entityId: user.id,
          details: `User logged in: ${user.email}`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      ResponseHelper.success(res, ResponseCode.SUCCESS, {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  // Refresh access token
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      try {
        verifyRefreshToken(refreshToken);
      } catch (error) {
        ResponseHelper.tokenExpired(res, 'Invalid or expired refresh token');
        return;
      }

      // Check if refresh token exists in database and is not revoked
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        select: {
          id: true,
          token: true,
          isRevoked: true,
          expiresAt: true,
          userId: true,
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
        },
      });

      if (!storedToken || storedToken.isRevoked) {
        ResponseHelper.invalidToken(res, 'Invalid or revoked refresh token');
        return;
      }

      if (new Date() > storedToken.expiresAt) {
        ResponseHelper.tokenExpired(res);
        return;
      }

      if (!storedToken.user.isActive) {
        ResponseHelper.forbidden(res, 'User is inactive');
        return;
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken({
        userId: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role,
      });

      const newRefreshToken = generateRefreshToken({
        userId: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role,
      });

      // Revoke old refresh token and create new one (token rotation)
      await prisma.$transaction([
        prisma.refreshToken.update({
          where: { id: storedToken.id },
          data: { isRevoked: true },
        }),
        prisma.refreshToken.create({
          data: {
            token: newRefreshToken,
            userId: storedToken.user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          },
        }),
      ]);

      ResponseHelper.success(res, ResponseCode.SUCCESS, {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      }, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  // Logout user
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        // Revoke refresh token
        await prisma.refreshToken.updateMany({
          where: { token: refreshToken },
          data: { isRevoked: true },
        });
      }

      ResponseHelper.success(res, ResponseCode.SUCCESS, undefined, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  // SSO Login - Terima token dari SSO service (via frontend)
  async ssoLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ssoToken }: SSOLoginRequest = req.body;

      // Process SSO token yang sudah dikirim frontend
      // Frontend flow: Frontend -> SSO Service -> dapat token -> kirim ke backend ini
      const processResult = await SSOService.processSSOResponse(ssoToken);

      if (!processResult.valid || !processResult.user) {
        ResponseHelper.error(
          res,
          ResponseCode.UNAUTHORIZED,
          processResult.message || 'Invalid SSO token',
          undefined,
          StatusCode.AUTH_FAILED
        );
        return;
      }

      const ssoUser = processResult.user;

      // Check apakah user sudah ada di database berdasarkan email
      let user = await prisma.user.findUnique({
        where: { email: ssoUser.email },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
        },
      });

      // Jika user belum ada, create user baru (auto-provisioning)
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: ssoUser.email,
            username: ssoUser.username,
            password: '', // Empty password untuk SSO users
            role: ssoUser.role || 'USER',
            isActive: true,
          },
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            isActive: true,
          },
        });

        // Audit log untuk user baru dari SSO
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: AuditAction.REGISTER,
            entity: 'User',
            entityId: user.id,
            details: `SSO user auto-provisioned: ${user.email}`,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
          },
        });
      }

      // Check if user is active
      if (!user.isActive) {
        ResponseHelper.forbidden(res, 'User account is inactive');
        return;
      }

      // Generate tokens untuk aplikasi ini
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Calculate expiration date (7 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Save refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt,
        },
      });

      // Create audit log untuk SSO login
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: AuditAction.LOGIN,
          entity: 'User',
          entityId: user.id,
          details: `SSO login successful: ${user.email}`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      ResponseHelper.success(
        res,
        ResponseCode.SUCCESS,
        {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
          },
        },
        'SSO login successful',
        StatusCode.OK
      );
    } catch (error) {
      next(error);
    }
  }

  // Verify SSO Token - Untuk check apakah SSO token valid (tanpa create session)
  async verifySSOToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ssoToken } = req.body;

      if (!ssoToken) {
        ResponseHelper.error(
          res,
          ResponseCode.BAD_REQUEST,
          'SSO token is required',
          undefined,
          StatusCode.VALIDATION_FAILED
        );
        return;
      }

      // Process SSO token
      const processResult = await SSOService.processSSOResponse(ssoToken);

      if (!processResult.valid) {
        ResponseHelper.error(
          res,
          ResponseCode.UNAUTHORIZED,
          processResult.message || 'Invalid SSO token',
          undefined,
          StatusCode.AUTH_FAILED
        );
        return;
      }

      ResponseHelper.success(
        res,
        ResponseCode.SUCCESS,
        {
          valid: true,
          user: processResult.user,
        },
        'SSO token is valid',
        StatusCode.OK
      );
    } catch (error) {
      next(error);
    }
  }

  // Get SSO Configuration Info
  async getSSOInfo(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ssoInfo = SSOService.getSSOInfo();

      ResponseHelper.success(
        res,
        ResponseCode.SUCCESS,
        ssoInfo,
        'SSO configuration retrieved',
        StatusCode.OK
      );
    } catch (error) {
      next(error);
    }
  }
}
