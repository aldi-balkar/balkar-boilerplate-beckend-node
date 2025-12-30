import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { config } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { ResponseHelper, ValidationError } from '../helpers/response.helper';
import { ResponseCode } from '../constants/responseCodes';
import { StatusCode } from '../constants/statusCodes';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error
  logger.error({
    err,
    req: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
    },
  }, 'Error occurred');

  // Handle ApiError
  if (err instanceof ApiError) {
    const { responseCode, statusCode } = mapStatusToResponseCode(err.statusCode);
    ResponseHelper.error(
      res,
      responseCode,
      err.message,
      err.errors as ValidationError[] | string | undefined,
      statusCode,
      config.app.isDevelopment ? { stack: err.stack } : undefined
    );
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as unknown as { code: string; meta?: Record<string, unknown> };
    
    if (prismaError.code === 'P2002') {
      const field = prismaError.meta?.target as string[] | undefined;
      const fieldName = field ? field.join(', ') : 'field';
      ResponseHelper.duplicateEntry(res, fieldName);
      return;
    }

    if (prismaError.code === 'P2025') {
      ResponseHelper.notFound(res, 'Record');
      return;
    }

    ResponseHelper.databaseError(res);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    ResponseHelper.invalidToken(res);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    ResponseHelper.tokenExpired(res);
    return;
  }

  // Generic error response (sanitized in production)
  const message = config.app.isProduction ? 'Internal server error' : err.message;
  ResponseHelper.error(
    res,
    ResponseCode.INTERNAL_ERROR,
    message,
    undefined,
    StatusCode.OK,
    config.app.isDevelopment ? { stack: err.stack } : undefined
  );
};

/**
 * Map HTTP status code to ResponseCode and StatusCode enums
 */
function mapStatusToResponseCode(httpStatusCode: number): { responseCode: ResponseCode; statusCode: StatusCode } {
  const statusMap: Record<number, { responseCode: ResponseCode; statusCode: StatusCode }> = {
    400: { responseCode: ResponseCode.BAD_REQUEST, statusCode: StatusCode.VALIDATION_FAILED },
    401: { responseCode: ResponseCode.UNAUTHORIZED, statusCode: StatusCode.AUTH_FAILED },
    403: { responseCode: ResponseCode.FORBIDDEN, statusCode: StatusCode.AUTH_FAILED },
    404: { responseCode: ResponseCode.NOT_FOUND, statusCode: StatusCode.RESOURCE_NOT_FOUND },
    409: { responseCode: ResponseCode.DUPLICATE_ENTRY, statusCode: StatusCode.RESOURCE_CONFLICT },
    422: { responseCode: ResponseCode.VALIDATION_ERROR, statusCode: StatusCode.VALIDATION_FAILED },
    500: { responseCode: ResponseCode.INTERNAL_ERROR, statusCode: StatusCode.OK },
    502: { responseCode: ResponseCode.EXTERNAL_SERVICE_ERROR, statusCode: StatusCode.NETWORK_ERROR },
    503: { responseCode: ResponseCode.SERVICE_UNAVAILABLE, statusCode: StatusCode.SERVICE_UNAVAILABLE },
  };

  return statusMap[httpStatusCode] || { responseCode: ResponseCode.INTERNAL_ERROR, statusCode: StatusCode.OK };
}

