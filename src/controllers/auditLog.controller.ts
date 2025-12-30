import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { ResponseHelper } from '../helpers/response.helper';
import { AuthRequest } from '../middleware/authenticate';
import { AuditAction } from '@prisma/client';

export class AuditLogController {
  // Get audit logs with pagination and filters (Admin only)
  async getAuditLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        page = 1,
        limit = 50,
        action,
        entity,
        userId,
        startDate,
        endDate,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where = {
        ...(action && { action: action as AuditAction }),
        ...(entity && { entity: entity as string }),
        ...(userId && { userId: userId as string }),
        ...(startDate || endDate
          ? {
              timestamp: {
                ...(startDate && { gte: new Date(startDate as string) }),
                ...(endDate && { lte: new Date(endDate as string) }),
              },
            }
          : {}),
      };

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          skip,
          take: Number(limit),
          select: {
            id: true,
            userId: true,
            action: true,
            entity: true,
            entityId: true,
            details: true,
            ipAddress: true,
            userAgent: true,
            timestamp: true,
            user: {
              select: {
                id: true,
                email: true,
                username: true,
              },
            },
          },
          orderBy: { timestamp: 'desc' },
        }),
        prisma.auditLog.count({ where }),
      ]);

      ResponseHelper.paginated(
        res,
        logs,
        Number(page),
        Number(limit),
        total,
        'Audit logs retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  // Get audit logs for current user
  async getMyAuditLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where: { userId: req.user?.id },
          skip,
          take: Number(limit),
          select: {
            id: true,
            action: true,
            entity: true,
            entityId: true,
            details: true,
            ipAddress: true,
            userAgent: true,
            timestamp: true,
          },
          orderBy: { timestamp: 'desc' },
        }),
        prisma.auditLog.count({ where: { userId: req.user?.id } }),
      ]);

      ResponseHelper.paginated(
        res,
        logs,
        Number(page),
        Number(limit),
        total,
        'Your audit logs retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}
