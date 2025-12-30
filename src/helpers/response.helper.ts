import { Response } from 'express';
import { ResponseCode, ResponseMessage, HttpStatusCode } from '../constants/responseCodes';
import { StatusCode, StatusCodeDescription } from '../constants/statusCodes';
import { env } from '../config/env';

/**
 * Standard API Response Interface
 */
export interface ApiResponse<T = unknown> {
  responCode: string;      // Format: [ResponseCode][StatusCode][ServiceCode] contoh: 01000001
  responMessage: string;   // Pesan response
  status: string;          // Status description
  data?: T;                // Data payload (optional untuk success)
  errors?: ValidationError[] | string; // Error details (optional untuk error)
  meta?: ResponseMeta;     // Metadata tambahan (pagination, dll)
}

/**
 * Validation Error Interface
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Response Metadata Interface
 */
export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  timestamp?: string;
  [key: string]: unknown;
}

/**
 * Response Helper Class
 * Menangani standardisasi response format untuk semua API endpoints
 */
export class ResponseHelper {
  /**
   * Generate full response code (ResponseCode + StatusCode + ServiceCode)
   * @param responseCode - 2-digit response code
   * @param statusCode - 2-digit status code
   * @returns 8-digit combined code (contoh: 01000001)
   */
  private static generateFullCode(responseCode: ResponseCode, statusCode: StatusCode): string {
    return `${responseCode}${statusCode}${env.SERVICE_CODE}`;
  }

  /**
   * Send Success Response
   * @param res - Express Response object
   * @param responseCode - Response code enum
   * @param data - Response data payload
   * @param customMessage - Custom message (optional)
   * @param statusCode - Status code enum (default: OK)
   * @param meta - Additional metadata (optional)
   */
  static success<T>(
    res: Response,
    responseCode: ResponseCode = ResponseCode.SUCCESS,
    data?: T,
    customMessage?: string,
    statusCode: StatusCode = StatusCode.OK,
    meta?: ResponseMeta
  ): Response {
    const fullCode = this.generateFullCode(responseCode, statusCode);
    const message = customMessage || ResponseMessage[responseCode];
    const status = StatusCodeDescription[statusCode];
    const httpStatus = HttpStatusCode[responseCode];

    const response: ApiResponse<T> = {
      responCode: fullCode,
      responMessage: message,
      status,
      data,
    };

    if (meta) {
      response.meta = {
        ...meta,
        timestamp: new Date().toISOString(),
      };
    }

    return res.status(httpStatus).json(response);
  }

  /**
   * Send Error Response
   * @param res - Express Response object
   * @param responseCode - Response code enum
   * @param customMessage - Custom error message (optional)
   * @param errors - Validation errors or error details (optional)
   * @param statusCode - Status code enum (default: OK for generic errors)
   * @param meta - Additional metadata (optional)
   */
  static error(
    res: Response,
    responseCode: ResponseCode = ResponseCode.INTERNAL_ERROR,
    customMessage?: string,
    errors?: ValidationError[] | string,
    statusCode: StatusCode = StatusCode.OK,
    meta?: ResponseMeta
  ): Response {
    const fullCode = this.generateFullCode(responseCode, statusCode);
    const message = customMessage || ResponseMessage[responseCode];
    const status = StatusCodeDescription[statusCode];
    const httpStatus = HttpStatusCode[responseCode];

    const response: ApiResponse = {
      responCode: fullCode,
      responMessage: message,
      status,
    };

    if (errors) {
      response.errors = errors;
    }

    if (meta) {
      response.meta = {
        ...meta,
        timestamp: new Date().toISOString(),
      };
    }

    return res.status(httpStatus).json(response);
  }

  /**
   * Send Validation Error Response
   * @param res - Express Response object
   * @param errors - Array of validation errors
   * @param customMessage - Custom message (optional)
   */
  static validationError(
    res: Response,
    errors: ValidationError[],
    customMessage?: string
  ): Response {
    return this.error(
      res,
      ResponseCode.VALIDATION_ERROR,
      customMessage || ResponseMessage[ResponseCode.VALIDATION_ERROR],
      errors,
      StatusCode.VALIDATION_FAILED
    );
  }

  /**
   * Send Unauthorized Response
   * @param res - Express Response object
   * @param customMessage - Custom message (optional)
   */
  static unauthorized(res: Response, customMessage?: string): Response {
    return this.error(res, ResponseCode.UNAUTHORIZED, customMessage, undefined, StatusCode.AUTH_FAILED);
  }

  /**
   * Send Forbidden Response
   * @param res - Express Response object
   * @param customMessage - Custom message (optional)
   */
  static forbidden(res: Response, customMessage?: string): Response {
    return this.error(res, ResponseCode.FORBIDDEN, customMessage);
  }

  /**
   * Send Not Found Response
   * @param res - Express Response object
   * @param resource - Resource name (optional)
   */
  static notFound(res: Response, resource?: string): Response {
    const message = resource ? `${resource} not found` : ResponseMessage[ResponseCode.NOT_FOUND];
    return this.error(res, ResponseCode.NOT_FOUND, message, undefined, StatusCode.RESOURCE_NOT_FOUND);
  }

  /**
   * Send Created Response
   * @param res - Express Response object
   * @param data - Created resource data
   * @param customMessage - Custom message (optional)
   */
  static created<T>(res: Response, data: T, customMessage?: string): Response {
    return this.success(res, ResponseCode.CREATED, data, customMessage);
  }

  /**
   * Send Updated Response
   * @param res - Express Response object
   * @param data - Updated resource data
   * @param customMessage - Custom message (optional)
   */
  static updated<T>(res: Response, data: T, customMessage?: string): Response {
    return this.success(res, ResponseCode.UPDATED, data, customMessage);
  }

  /**
   * Send Deleted Response
   * @param res - Express Response object
   * @param customMessage - Custom message (optional)
   */
  static deleted(res: Response, customMessage?: string): Response {
    return this.success(
      res,
      ResponseCode.DELETED,
      undefined,
      customMessage || ResponseMessage[ResponseCode.DELETED]
    );
  }

  /**
   * Send Paginated Response
   * @param res - Express Response object
   * @param data - Array of data
   * @param page - Current page
   * @param limit - Items per page
   * @param total - Total items
   * @param customMessage - Custom message (optional)
   */
  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    customMessage?: string
  ): Response {
    const totalPages = Math.ceil(total / limit);

    return this.success(res, ResponseCode.SUCCESS, data, customMessage, StatusCode.OK, {
      page,
      limit,
      total,
      totalPages,
    });
  }

  /**
   * Send Invalid Token Response
   * @param res - Express Response object
   * @param customMessage - Custom message (optional)
   */
  static invalidToken(res: Response, customMessage?: string): Response {
    return this.error(
      res,
      ResponseCode.INVALID_TOKEN,
      customMessage || ResponseMessage[ResponseCode.INVALID_TOKEN],
      undefined,
      StatusCode.AUTH_FAILED
    );
  }

  /**
   * Send Token Expired Response
   * @param res - Express Response object
   * @param customMessage - Custom message (optional)
   */
  static tokenExpired(res: Response, customMessage?: string): Response {
    return this.error(
      res,
      ResponseCode.TOKEN_EXPIRED,
      customMessage || ResponseMessage[ResponseCode.TOKEN_EXPIRED],
      undefined,
      StatusCode.AUTH_EXPIRED
    );
  }

  /**
   * Send Invalid Credentials Response
   * @param res - Express Response object
   * @param customMessage - Custom message (optional)
   */
  static invalidCredentials(res: Response, customMessage?: string): Response {
    return this.error(
      res,
      ResponseCode.INVALID_CREDENTIALS,
      customMessage || ResponseMessage[ResponseCode.INVALID_CREDENTIALS],
      undefined,
      StatusCode.AUTH_FAILED
    );
  }

  /**
   * Send Duplicate Entry Response
   * @param res - Express Response object
   * @param resource - Resource name (optional)
   */
  static duplicateEntry(res: Response, resource?: string): Response {
    const message = resource
      ? `${resource} already exists`
      : ResponseMessage[ResponseCode.DUPLICATE_ENTRY];
    return this.error(res, ResponseCode.DUPLICATE_ENTRY, message, undefined, StatusCode.RESOURCE_CONFLICT);
  }

  /**
   * Send Database Error Response
   * @param res - Express Response object
   * @param customMessage - Custom message (optional)
   */
  static databaseError(res: Response, customMessage?: string): Response {
    return this.error(
      res,
      ResponseCode.DATABASE_ERROR,
      customMessage || ResponseMessage[ResponseCode.DATABASE_ERROR],
      undefined,
      StatusCode.DB_QUERY_ERROR
    );
  }
}
