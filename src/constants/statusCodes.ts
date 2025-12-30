/**
 * Standard Status Codes
 * Format: 2-digit code yang menunjukkan status detail dari operasi
 * 
 * Status code akan dikombinasikan dengan ResponseCode dan ServiceCode
 * Format lengkap: [ResponseCode][StatusCode][ServiceCode]
 * Contoh: 01 (Success) + 00 (OK) + 0001 (Service) = 01000001
 */

export enum StatusCode {
  // General Status (00-09)
  OK = '00',
  PENDING = '01',
  PROCESSING = '02',
  COMPLETED = '03',
  PARTIALLY_COMPLETED = '04',
  
  // Database Status (10-19)
  DB_CONNECTED = '10',
  DB_DISCONNECTED = '11',
  DB_QUERY_ERROR = '12',
  DB_TIMEOUT = '13',
  DB_CONSTRAINT_VIOLATION = '14',
  
  // Authentication Status (20-29)
  AUTH_SUCCESS = '20',
  AUTH_FAILED = '21',
  AUTH_EXPIRED = '22',
  AUTH_REVOKED = '23',
  AUTH_SUSPENDED = '24',
  
  // Validation Status (30-39)
  VALIDATION_SUCCESS = '30',
  VALIDATION_FAILED = '31',
  MISSING_REQUIRED_FIELD = '32',
  INVALID_FORMAT = '33',
  OUT_OF_RANGE = '34',
  
  // Resource Status (40-49)
  RESOURCE_AVAILABLE = '40',
  RESOURCE_NOT_FOUND = '41',
  RESOURCE_LOCKED = '42',
  RESOURCE_EXPIRED = '43',
  RESOURCE_CONFLICT = '44',
  
  // Service Status (50-59)
  SERVICE_HEALTHY = '50',
  SERVICE_DEGRADED = '51',
  SERVICE_UNAVAILABLE = '52',
  SERVICE_MAINTENANCE = '53',
  SERVICE_TIMEOUT = '54',
  
  // Network Status (60-69)
  NETWORK_OK = '60',
  NETWORK_ERROR = '61',
  NETWORK_TIMEOUT = '62',
  CONNECTION_REFUSED = '63',
  CONNECTION_RESET = '64',
  
  // Rate Limit Status (70-79)
  RATE_LIMIT_OK = '70',
  RATE_LIMIT_EXCEEDED = '71',
  RATE_LIMIT_WARNING = '72',
  
  // Cache Status (80-89)
  CACHE_HIT = '80',
  CACHE_MISS = '81',
  CACHE_EXPIRED = '82',
  CACHE_INVALID = '83',
  
  // Custom/Other Status (90-99)
  CUSTOM_STATUS = '90',
  UNKNOWN = '99',
}

export const StatusCodeDescription: Record<StatusCode, string> = {
  // General Status
  [StatusCode.OK]: 'Operation completed successfully',
  [StatusCode.PENDING]: 'Operation pending',
  [StatusCode.PROCESSING]: 'Operation in progress',
  [StatusCode.COMPLETED]: 'Operation completed',
  [StatusCode.PARTIALLY_COMPLETED]: 'Operation partially completed',
  
  // Database Status
  [StatusCode.DB_CONNECTED]: 'Database connected',
  [StatusCode.DB_DISCONNECTED]: 'Database disconnected',
  [StatusCode.DB_QUERY_ERROR]: 'Database query error',
  [StatusCode.DB_TIMEOUT]: 'Database timeout',
  [StatusCode.DB_CONSTRAINT_VIOLATION]: 'Database constraint violation',
  
  // Authentication Status
  [StatusCode.AUTH_SUCCESS]: 'Authentication successful',
  [StatusCode.AUTH_FAILED]: 'Authentication failed',
  [StatusCode.AUTH_EXPIRED]: 'Authentication expired',
  [StatusCode.AUTH_REVOKED]: 'Authentication revoked',
  [StatusCode.AUTH_SUSPENDED]: 'Authentication suspended',
  
  // Validation Status
  [StatusCode.VALIDATION_SUCCESS]: 'Validation successful',
  [StatusCode.VALIDATION_FAILED]: 'Validation failed',
  [StatusCode.MISSING_REQUIRED_FIELD]: 'Missing required field',
  [StatusCode.INVALID_FORMAT]: 'Invalid format',
  [StatusCode.OUT_OF_RANGE]: 'Value out of range',
  
  // Resource Status
  [StatusCode.RESOURCE_AVAILABLE]: 'Resource available',
  [StatusCode.RESOURCE_NOT_FOUND]: 'Resource not found',
  [StatusCode.RESOURCE_LOCKED]: 'Resource locked',
  [StatusCode.RESOURCE_EXPIRED]: 'Resource expired',
  [StatusCode.RESOURCE_CONFLICT]: 'Resource conflict',
  
  // Service Status
  [StatusCode.SERVICE_HEALTHY]: 'Service is healthy',
  [StatusCode.SERVICE_DEGRADED]: 'Service is degraded',
  [StatusCode.SERVICE_UNAVAILABLE]: 'Service unavailable',
  [StatusCode.SERVICE_MAINTENANCE]: 'Service under maintenance',
  [StatusCode.SERVICE_TIMEOUT]: 'Service timeout',
  
  // Network Status
  [StatusCode.NETWORK_OK]: 'Network connection OK',
  [StatusCode.NETWORK_ERROR]: 'Network error',
  [StatusCode.NETWORK_TIMEOUT]: 'Network timeout',
  [StatusCode.CONNECTION_REFUSED]: 'Connection refused',
  [StatusCode.CONNECTION_RESET]: 'Connection reset',
  
  // Rate Limit Status
  [StatusCode.RATE_LIMIT_OK]: 'Rate limit OK',
  [StatusCode.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
  [StatusCode.RATE_LIMIT_WARNING]: 'Rate limit warning',
  
  // Cache Status
  [StatusCode.CACHE_HIT]: 'Cache hit',
  [StatusCode.CACHE_MISS]: 'Cache miss',
  [StatusCode.CACHE_EXPIRED]: 'Cache expired',
  [StatusCode.CACHE_INVALID]: 'Cache invalid',
  
  // Custom/Other Status
  [StatusCode.CUSTOM_STATUS]: 'Custom status',
  [StatusCode.UNKNOWN]: 'Unknown status',
};
