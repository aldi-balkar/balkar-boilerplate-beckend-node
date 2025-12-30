# Status Code Reference

## Overview
Status Code adalah 2-digit code yang menunjukkan detail status dari operasi yang dilakukan. Status code dikombinasikan dengan Response Code dan Service Code untuk membentuk response code lengkap (8 digit).

## Format
```
[ResponseCode 2-digit][StatusCode 2-digit][ServiceCode 4-digit]
Contoh: 01 + 00 + 0001 = 01000001
```

## Status Code Categories

### General Status (00-09)

| Code | Name | Description | Usage |
|------|------|-------------|-------|
| 00 | OK | Operation completed successfully | Default success status |
| 01 | PENDING | Operation pending | Async operations |
| 02 | PROCESSING | Operation in progress | Background tasks |
| 03 | COMPLETED | Operation completed | Final status |
| 04 | PARTIALLY_COMPLETED | Operation partially completed | Batch operations |

### Database Status (10-19)

| Code | Name | Description | Usage |
|------|------|-------------|-------|
| 10 | DB_CONNECTED | Database connected | Health checks |
| 11 | DB_DISCONNECTED | Database disconnected | Connection errors |
| 12 | DB_QUERY_ERROR | Database query error | Query failures |
| 13 | DB_TIMEOUT | Database timeout | Slow queries |
| 14 | DB_CONSTRAINT_VIOLATION | Database constraint violation | Foreign key errors |

### Authentication Status (20-29)

| Code | Name | Description | Usage |
|------|------|-------------|-------|
| 20 | AUTH_SUCCESS | Authentication successful | Login success |
| 21 | AUTH_FAILED | Authentication failed | Invalid credentials |
| 22 | AUTH_EXPIRED | Authentication expired | Token expired |
| 23 | AUTH_REVOKED | Authentication revoked | Token revoked |
| 24 | AUTH_SUSPENDED | Authentication suspended | Account suspended |

### Validation Status (30-39)

| Code | Name | Description | Usage |
|------|------|-------------|-------|
| 30 | VALIDATION_SUCCESS | Validation successful | Form validation |
| 31 | VALIDATION_FAILED | Validation failed | Invalid input |
| 32 | MISSING_REQUIRED_FIELD | Missing required field | Required fields |
| 33 | INVALID_FORMAT | Invalid format | Format errors |
| 34 | OUT_OF_RANGE | Value out of range | Range validation |

### Resource Status (40-49)

| Code | Name | Description | Usage |
|------|------|-------------|-------|
| 40 | RESOURCE_AVAILABLE | Resource available | Resource found |
| 41 | RESOURCE_NOT_FOUND | Resource not found | 404 errors |
| 42 | RESOURCE_LOCKED | Resource locked | Concurrent access |
| 43 | RESOURCE_EXPIRED | Resource expired | TTL expired |
| 44 | RESOURCE_CONFLICT | Resource conflict | Duplicate entries |

### Service Status (50-59)

| Code | Name | Description | Usage |
|------|------|-------------|-------|
| 50 | SERVICE_HEALTHY | Service is healthy | Health checks |
| 51 | SERVICE_DEGRADED | Service is degraded | Performance issues |
| 52 | SERVICE_UNAVAILABLE | Service unavailable | Downtime |
| 53 | SERVICE_MAINTENANCE | Service under maintenance | Planned downtime |
| 54 | SERVICE_TIMEOUT | Service timeout | Slow responses |

### Network Status (60-69)

| Code | Name | Description | Usage |
|------|------|-------------|-------|
| 60 | NETWORK_OK | Network connection OK | Connection success |
| 61 | NETWORK_ERROR | Network error | Connection failures |
| 62 | NETWORK_TIMEOUT | Network timeout | Timeout errors |
| 63 | CONNECTION_REFUSED | Connection refused | Port closed |
| 64 | CONNECTION_RESET | Connection reset | Network reset |

### Rate Limit Status (70-79)

| Code | Name | Description | Usage |
|------|------|-------------|-------|
| 70 | RATE_LIMIT_OK | Rate limit OK | Within limits |
| 71 | RATE_LIMIT_EXCEEDED | Rate limit exceeded | Over limits |
| 72 | RATE_LIMIT_WARNING | Rate limit warning | Near limits |

### Cache Status (80-89)

| Code | Name | Description | Usage |
|------|------|-------------|-------|
| 80 | CACHE_HIT | Cache hit | Data from cache |
| 81 | CACHE_MISS | Cache miss | Data from source |
| 82 | CACHE_EXPIRED | Cache expired | Stale cache |
| 83 | CACHE_INVALID | Cache invalid | Invalid cache |

### Custom Status (90-99)

| Code | Name | Description | Usage |
|------|------|-------------|-------|
| 90 | CUSTOM_STATUS | Custom status | Custom scenarios |
| 99 | UNKNOWN | Unknown status | Undefined status |

## Common Combinations

### Success Scenarios

| Scenario | Response Code | Status Code | Full Code | Example |
|----------|---------------|-------------|-----------|---------|
| Successful operation | 01 (SUCCESS) | 00 (OK) | 01000001 | Data retrieved |
| Resource created | 02 (CREATED) | 00 (OK) | 02000001 | User registered |
| Database query OK | 01 (SUCCESS) | 10 (DB_CONNECTED) | 01100001 | Health check |
| Service healthy | 01 (SUCCESS) | 50 (SERVICE_HEALTHY) | 01500001 | Status check |

### Error Scenarios

| Scenario | Response Code | Status Code | Full Code | Example |
|----------|---------------|-------------|-----------|---------|
| Login failed | 18 (INVALID_CREDENTIALS) | 21 (AUTH_FAILED) | 18210001 | Wrong password |
| Token expired | 17 (TOKEN_EXPIRED) | 22 (AUTH_EXPIRED) | 17220001 | Session timeout |
| Resource not found | 13 (NOT_FOUND) | 41 (RESOURCE_NOT_FOUND) | 13410001 | User not found |
| Validation error | 14 (VALIDATION_ERROR) | 31 (VALIDATION_FAILED) | 14310001 | Invalid email |
| Duplicate entry | 15 (DUPLICATE_ENTRY) | 44 (RESOURCE_CONFLICT) | 15440001 | Email exists |
| Database error | 52 (DATABASE_ERROR) | 12 (DB_QUERY_ERROR) | 52120001 | Query failed |
| Service down | 51 (SERVICE_UNAVAILABLE) | 52 (SERVICE_UNAVAILABLE) | 51520001 | Server offline |

## Usage in Code

### Success with Default Status (OK)
```typescript
ResponseHelper.success(res, ResponseCode.SUCCESS, data, 'Success');
// Result: 01000001
```

### Success with Specific Status
```typescript
ResponseHelper.success(
  res,
  ResponseCode.SUCCESS,
  healthData,
  'Service is healthy',
  StatusCode.SERVICE_HEALTHY
);
// Result: 01500001
```

### Error with Auto Status
```typescript
ResponseHelper.invalidCredentials(res);
// Result: 18210001 (INVALID_CREDENTIALS + AUTH_FAILED)
```

### Error with Custom Status
```typescript
ResponseHelper.error(
  res,
  ResponseCode.DATABASE_ERROR,
  'Query timeout',
  undefined,
  StatusCode.DB_TIMEOUT
);
// Result: 52130001
```

## Response Examples

### Health Check Success
```json
{
  "responCode": "01500001",
  "responMessage": "Service is healthy",
  "status": "Service is healthy",
  "data": {
    "status": "healthy",
    "database": "connected",
    "uptime": 12345
  }
}
```

### Login Failed
```json
{
  "responCode": "18210001",
  "responMessage": "Invalid email or password",
  "status": "Authentication failed"
}
```

### Validation Error
```json
{
  "responCode": "14310001",
  "responMessage": "Validation failed",
  "status": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Resource Not Found
```json
{
  "responCode": "13410001",
  "responMessage": "User not found",
  "status": "Resource not found"
}
```

## Best Practices

1. **Choose Appropriate Status Codes**: Pilih status code yang paling sesuai dengan kondisi sebenarnya
2. **Consistency**: Gunakan status code yang sama untuk skenario yang sama
3. **Monitoring**: Track status codes untuk analisis sistem
4. **Documentation**: Dokumentasikan custom status codes jika ditambahkan

## Adding Custom Status Codes

Jika perlu menambahkan status code baru, edit file:
```
src/constants/statusCodes.ts
```

Format:
```typescript
export enum StatusCode {
  // ... existing codes
  YOUR_CUSTOM_CODE = '95',
}

export const StatusCodeDescription: Record<StatusCode, string> = {
  // ... existing descriptions
  [StatusCode.YOUR_CUSTOM_CODE]: 'Your custom description',
};
```
