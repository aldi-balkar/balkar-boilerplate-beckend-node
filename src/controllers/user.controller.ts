import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { ResponseHelper } from '../helpers/response.helper';
import { ResponseCode } from '../constants/responseCodes';
import { hashPassword } from '../utils/password';
import { AuthRequest } from '../middleware/authenticate';
import { AuditAction } from '@prisma/client';

export class UserController {
  // Get all users with pagination and filters
  async getUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, role, isActive, search } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where = {
        ...(role && { role: role as 'ADMIN' | 'USER' }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
        ...(search && {
          OR: [
            { email: { contains: search as string, mode: 'insensitive' as const } },
            { username: { contains: search as string, mode: 'insensitive' as const } },
          ],
        }),
      };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: Number(limit),
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      ResponseHelper.paginated(
        res,
        users,
        Number(page),
        Number(limit),
        total,
        'Users retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID
  async getUserById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        ResponseHelper.notFound(res, 'User');
        return;
      }

      ResponseHelper.success(res, ResponseCode.SUCCESS, { user }, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Create new user (Admin only)
  async createUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, username, password, role = 'USER' } = req.body;

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
          role,
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          action: AuditAction.CREATE,
          entity: 'User',
          entityId: user.id,
          details: `User created: ${user.email}`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      ResponseHelper.created(res, { user }, 'User created successfully');
    } catch (error) {
      next(error);
    }
  }

  // Update user
  async updateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { email, username, password, role, isActive } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
        select: { id: true, role: true },
      });

      if (!existingUser) {
        ResponseHelper.notFound(res, 'User');
        return;
      }

      // Check if updating own account or admin
      if (req.user?.id !== id && req.user?.role !== 'ADMIN') {
        ResponseHelper.forbidden(res, 'You can only update your own account');
        return;
      }

      // Non-admin cannot change role or isActive
      if (req.user?.role !== 'ADMIN' && (role || isActive !== undefined)) {
        ResponseHelper.forbidden(res, 'Insufficient permissions to update role or status');
        return;
      }

      // Check for duplicate email/username
      if (email || username) {
        const duplicate = await prisma.user.findFirst({
          where: {
            AND: [
              { id: { not: id } },
              {
                OR: [
                  ...(email ? [{ email }] : []),
                  ...(username ? [{ username }] : []),
                ],
              },
            ],
          },
          select: { id: true },
        });

        if (duplicate) {
          ResponseHelper.duplicateEntry(res, 'Email or username');
          return;
        }
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(email && { email }),
          ...(username && { username }),
          ...(password && { password: await hashPassword(password) }),
          ...(role && { role }),
          ...(isActive !== undefined && { isActive }),
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          updatedAt: true,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          action: AuditAction.UPDATE,
          entity: 'User',
          entityId: id,
          details: `User updated: ${updatedUser.email}`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      ResponseHelper.updated(res, { user: updatedUser }, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Delete user (Admin only)
  async deleteUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true },
      });

      if (!user) {
        ResponseHelper.notFound(res, 'User');
        return;
      }

      // Prevent deleting own account
      if (req.user?.id === id) {
        ResponseHelper.error(res, ResponseCode.BAD_REQUEST, 'You cannot delete your own account');
        return;
      }

      // Delete user (cascade will delete related records)
      await prisma.user.delete({
        where: { id },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          action: AuditAction.DELETE,
          entity: 'User',
          entityId: id,
          details: `User deleted: ${user.email}`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      ResponseHelper.deleted(res, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user?.id },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        ResponseHelper.notFound(res, 'User');
        return;
      }

      ResponseHelper.success(res, ResponseCode.SUCCESS, { user }, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
