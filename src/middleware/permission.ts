import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { ResponseHelper } from '../helpers/response.helper';
import { StatusCode } from '../constants/statusCodes';
import { ResponseCode } from '../constants/responseCodes';
import { prisma } from '../config/database';

/**
 * Verify All Role - Mengizinkan semua user yang terautentikasi
 * Mirip dengan verifyAllRole() di kode lama
 */
export const verifyAllRole = () => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Sudah terautentikasi dari middleware authenticate
    if (!req.user) {
      ResponseHelper.unauthorized(res, 'Authentication required');
      return;
    }

    // User authenticated, lanjutkan
    next();
  };
};

/**
 * Verify Token with Permission Scope
 * Check apakah user punya permission untuk mengakses resource tertentu
 * @param scope - Array of permission codes yang diperlukan
 */
export const verifyToken = (...scope: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      ResponseHelper.unauthorized(res, 'Authentication required');
      return;
    }

    // Jika tidak ada scope yang ditentukan, izinkan akses
    if (!scope || scope.length === 0) {
      next();
      return;
    }

    try {
      // Check apakah user role punya permission yang diminta
      const userPermissions = await prisma.rolePermission.findMany({
        where: {
          role: req.user.role as any,
        },
        select: {
          permission: {
            select: {
              code: true,
            },
          },
        },
      });

      // Extract permission codes
      const permissionCodes = userPermissions.map((rp) => rp.permission.code);

      // Check apakah ada permission yang cocok
      const hasPermission = scope.some((requiredPermission) =>
        permissionCodes.includes(requiredPermission)
      );

      if (!hasPermission) {
        ResponseHelper.forbidden(res, 'Access not permitted!');
        return;
      }

      next();
    } catch (error) {
      ResponseHelper.error(
        res,
        ResponseCode.INTERNAL_ERROR,
        'Permission check failed',
        undefined,
        StatusCode.OK
      );
    }
  };
};

/**
 * Helper function to check if user has specific permissions
 * @param userId - User ID
 * @param role - User role
 * @param permissionCodes - Array of permission codes to check
 */
export const hasPermissions = async (
  role: string,
  permissionCodes: string[]
): Promise<boolean> => {
  try {
    const count = await prisma.rolePermission.count({
      where: {
        role: role as any,
        permission: {
          code: {
            in: permissionCodes,
          },
        },
      },
    });

    return count > 0;
  } catch (error) {
    return false;
  }
};

/**
 * Get all permissions for a role
 * @param role - User role
 */
export const getRolePermissions = async (role: string): Promise<string[]> => {
  try {
    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        role: role as any,
      },
      select: {
        permission: {
          select: {
            code: true,
          },
        },
      },
    });

    return rolePermissions.map((rp) => rp.permission.code);
  } catch (error) {
    return [];
  }
};
