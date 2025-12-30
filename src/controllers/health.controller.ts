import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { ResponseHelper } from '../helpers/response.helper';
import { ResponseCode } from '../constants/responseCodes';
import { StatusCode } from '../constants/statusCodes';

export class HealthController {
  async check(_req: Request, res: Response): Promise<void> {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        database: 'connected',
      };

      ResponseHelper.success(
        res,
        ResponseCode.SUCCESS,
        healthData,
        'Service is healthy',
        StatusCode.SERVICE_HEALTHY
      );
    } catch (error) {
      ResponseHelper.error(
        res,
        ResponseCode.SERVICE_UNAVAILABLE,
        'Service unavailable',
        undefined,
        StatusCode.SERVICE_UNAVAILABLE
      );
    }
  }
}
