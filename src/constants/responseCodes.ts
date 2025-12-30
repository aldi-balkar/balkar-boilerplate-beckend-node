/**
 * Standard Response Codes
 * Format: 2-digit code yang akan dikombinasikan dengan SERVICE_CODE
 * 
 * Format lengkap response code: [ResponseCode][ServiceCode]
 * Contoh: 01 (Success) + 0001 (Service) = 010001
 */

export enum ResponseCode {
  // Success Codes (01-09)
  SUCCESS = '01',
  CREATED = '02',
  UPDATED = '03',
  DELETED = '04',
  
  // Client Error Codes (10-49)
  BAD_REQUEST = '10',
  UNAUTHORIZED = '11',
  FORBIDDEN = '12',
  NOT_FOUND = '13',
  VALIDATION_ERROR = '14',
  DUPLICATE_ENTRY = '15',
  INVALID_TOKEN = '16',
  TOKEN_EXPIRED = '17',
  INVALID_CREDENTIALS = '18',
  ACCOUNT_LOCKED = '19',
  
  // Server Error Codes (50-99)
  INTERNAL_ERROR = '50',
  SERVICE_UNAVAILABLE = '51',
  DATABASE_ERROR = '52',
  EXTERNAL_SERVICE_ERROR = '53',
}

export const ResponseMessage: Record<ResponseCode, string> = {
  // Success Messages
  [ResponseCode.SUCCESS]: 'Operation successful',
  [ResponseCode.CREATED]: 'Resource created successfully',
  [ResponseCode.UPDATED]: 'Resource updated successfully',
  [ResponseCode.DELETED]: 'Resource deleted successfully',
  
  // Client Error Messages
  [ResponseCode.BAD_REQUEST]: 'Invalid request parameters',
  [ResponseCode.UNAUTHORIZED]: 'Authentication required',
  [ResponseCode.FORBIDDEN]: 'Access denied',
  [ResponseCode.NOT_FOUND]: 'Resource not found',
  [ResponseCode.VALIDATION_ERROR]: 'Validation failed',
  [ResponseCode.DUPLICATE_ENTRY]: 'Resource already exists',
  [ResponseCode.INVALID_TOKEN]: 'Invalid token provided',
  [ResponseCode.TOKEN_EXPIRED]: 'Token has expired',
  [ResponseCode.INVALID_CREDENTIALS]: 'Invalid email or password',
  [ResponseCode.ACCOUNT_LOCKED]: 'Account has been locked',
  
  // Server Error Messages
  [ResponseCode.INTERNAL_ERROR]: 'Internal server error',
  [ResponseCode.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
  [ResponseCode.DATABASE_ERROR]: 'Database operation failed',
  [ResponseCode.EXTERNAL_SERVICE_ERROR]: 'External service error',
};

// HTTP Status Code mapping untuk setiap Response Code
export const HttpStatusCode: Record<ResponseCode, number> = {
  // Success HTTP Codes
  [ResponseCode.SUCCESS]: 200,
  [ResponseCode.CREATED]: 201,
  [ResponseCode.UPDATED]: 200,
  [ResponseCode.DELETED]: 200,
  
  // Client Error HTTP Codes
  [ResponseCode.BAD_REQUEST]: 400,
  [ResponseCode.UNAUTHORIZED]: 401,
  [ResponseCode.FORBIDDEN]: 403,
  [ResponseCode.NOT_FOUND]: 404,
  [ResponseCode.VALIDATION_ERROR]: 422,
  [ResponseCode.DUPLICATE_ENTRY]: 409,
  [ResponseCode.INVALID_TOKEN]: 401,
  [ResponseCode.TOKEN_EXPIRED]: 401,
  [ResponseCode.INVALID_CREDENTIALS]: 401,
  [ResponseCode.ACCOUNT_LOCKED]: 403,
  
  // Server Error HTTP Codes
  [ResponseCode.INTERNAL_ERROR]: 500,
  [ResponseCode.SERVICE_UNAVAILABLE]: 503,
  [ResponseCode.DATABASE_ERROR]: 500,
  [ResponseCode.EXTERNAL_SERVICE_ERROR]: 502,
};
