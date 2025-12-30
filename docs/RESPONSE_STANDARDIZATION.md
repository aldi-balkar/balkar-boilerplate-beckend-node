# API Response Standardization

## Overview
Semua API response menggunakan format standardisasi dengan `ResponseHelper` yang menghasilkan response code gabungan antara **Response Code** (2-digit), **Status Code** (2-digit), dan **Service Code** (4-digit).

## Response Format

### Standard Response Structure
```json
{
  "responCode": "01000001",    // [ResponseCode][StatusCode][ServiceCode] = 8 digits
  "responMessage": "Success",  // Pesan response
  "status": "Operation completed successfully",  // Status description
  "data": {},                  // Data payload (optional)
  "errors": [],                // Error details (optional)
  "meta": {}                   // Metadata (optional, untuk pagination dll)
}
```

### Response Code Breakdown
- **Response Code (2-digit)**: Kategori response (01-99)
- **Status Code (2-digit)**: Detail status operasi (00-99)
- **Service Code (4-digit)**: Identifier service/aplikasi (0001-9999)

**Example:**
```
01 00 0001 = 01000001
││ ││ ││││
││ ││ └└└└─ Service Code (0001)
││ └└────── Status Code (00 = OK)
└└────────  Response Code (01 = SUCCESS)
```

## Response Code Table

### Success Codes (01-09)

| Response Code | HTTP Status | Message | Description |
|--------------|-------------|---------|-------------|
| 01 | 200 | Operation successful | Operasi berhasil |
| 02 | 201 | Resource created successfully | Resource dibuat |
| 03 | 200 | Resource updated successfully | Resource diupdate |
| 04 | 200 | Resource deleted successfully | Resource dihapus |

### Client Error Codes (10-49)

| Response Code | HTTP Status | Message | Description |
|--------------|-------------|---------|-------------|
| 10 | 400 | Invalid request parameters | Bad Request |
| 11 | 401 | Authentication required | Unauthorized |
| 12 | 403 | Access denied | Forbidden |
| 13 | 404 | Resource not found | Not Found |
| 14 | 422 | Validation failed | Validation Error |
| 15 | 409 | Resource already exists | Duplicate Entry |
| 16 | 401 | Invalid token provided | Invalid Token |
| 17 | 401 | Token has expired | Token Expired |
| 18 | 401 | Invalid email or password | Invalid Credentials |
| 19 | 403 | Account has been locked | Account Locked |

### Server Error Codes (50-99)

| Response Code | HTTP Status | Message | Description |
|--------------|-------------|---------|-------------|
| 50 | 500 | Internal server error | Internal Error |
| 51 | 503 | Service temporarily unavailable | Service Unavailable |
| 52 | 500 | Database operation failed | Database Error |
| 53 | 502 | External service error | External Service Error |

## Service Code

Service Code adalah **4-digit identifier** untuk service/aplikasi yang dapat dikonfigurasi melalui environment variable.

**Environment Variable:**
```env
SERVICE_CODE=0001
```

**Kombinasi dengan Response Code:**
- Success: `01` + `0001` = `010001`
- Error Token: `16` + `0001` = `160001`
- Not Found: `13` + `0001` = `130001`

## Usage Examples

### Success Response
```typescript
ResponseHelper.success(res, ResponseCode.SUCCESS, { user }, 'User retrieved successfully');
```

**Output:**
```json
{
  "responCode": "010001",
  "responMessage": "User retrieved successfully",
  "data": {
    "user": {
      "id": "123",
      "email": "user@example.com"
    }
  }
}
```

### Created Response
```typescript
ResponseHelper.created(res, { user }, 'User created successfully');
```

**Output:**
```json
{
  "responCode": "020001",
  "responMessage": "User created successfully",
  "data": {
    "user": {
      "id": "123",
      "email": "user@example.com"
    }
  }
}
```

### Error Response - Unauthorized
```typescript
ResponseHelper.unauthorized(res, 'Authentication required');
```

**Output:**
```json
{
  "responCode": "110001",
  "responMessage": "Authentication required"
}
```

### Error Response - Validation Error
```typescript
const errors = [
  { field: 'email', message: 'Invalid email format' },
  { field: 'password', message: 'Password must be at least 8 characters' }
];
ResponseHelper.validationError(res, errors);
```

**Output:**
```json
{
  "responCode": "140001",
  "responMessage": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### Paginated Response
```typescript
ResponseHelper.paginated(res, users, 1, 10, 50, 'Users retrieved successfully');
```

**Output:**
```json
{
  "responCode": "010001",
  "responMessage": "Users retrieved successfully",
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "timestamp": "2025-12-30T21:30:00.000Z"
  }
}
```

## ResponseHelper Methods

### Success Methods
- `ResponseHelper.success(res, responseCode, data, message, meta?)` - Generic success response
- `ResponseHelper.created(res, data, message?)` - Created response (201)
- `ResponseHelper.updated(res, data, message?)` - Updated response
- `ResponseHelper.deleted(res, message?)` - Deleted response
- `ResponseHelper.paginated(res, data, page, limit, total, message?)` - Paginated response

### Error Methods
- `ResponseHelper.error(res, responseCode, message?, errors?, meta?)` - Generic error response
- `ResponseHelper.unauthorized(res, message?)` - 401 Unauthorized
- `ResponseHelper.forbidden(res, message?)` - 403 Forbidden
- `ResponseHelper.notFound(res, resource?)` - 404 Not Found
- `ResponseHelper.validationError(res, errors, message?)` - 422 Validation Error
- `ResponseHelper.invalidToken(res, message?)` - Invalid Token
- `ResponseHelper.tokenExpired(res, message?)` - Token Expired
- `ResponseHelper.invalidCredentials(res, message?)` - Invalid Credentials
- `ResponseHelper.duplicateEntry(res, resource?)` - Duplicate Entry
- `ResponseHelper.databaseError(res, message?)` - Database Error

## Testing Response Codes

### Login Success
```bash
curl -X POST http://localhost:9005/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

**Expected Response:**
```json
{
  "responCode": "010001",
  "responMessage": "Login successful",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": {...}
  }
}
```

### Invalid Credentials
```bash
curl -X POST http://localhost:9005/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "wrongpassword"
  }'
```

**Expected Response:**
```json
{
  "responCode": "180001",
  "responMessage": "Invalid email or password"
}
```

### Token Expired
```bash
curl -X GET http://localhost:9005/api/v1/users/me \
  -H "Authorization: Bearer expired_token"
```

**Expected Response:**
```json
{
  "responCode": "170001",
  "responMessage": "Token has expired"
}
```

### Validation Error
```bash
curl -X POST http://localhost:9005/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "123"
  }'
```

**Expected Response:**
```json
{
  "responCode": "140001",
  "responMessage": "Validation failed",
  "errors": [
    {
      "field": "body.email",
      "message": "Invalid email"
    },
    {
      "field": "body.password",
      "message": "String must contain at least 8 character(s)"
    }
  ]
}
```

## Customizing Service Code

Untuk mengubah service code sesuai kebutuhan, update file `.env`:

```env
# Service Code (4 digits untuk identifikasi service)
SERVICE_CODE=0002
```

Setelah perubahan, restart server:
```bash
npm run dev
```

Response code akan berubah otomatis:
- Success: `010002`
- Error: `160002`
- dll.

## Notes

1. **Response Code selalu 6 digit**: 2 digit Response Code + 4 digit Service Code
2. **Service Code harus 4 digit**: Divalidasi oleh Zod schema
3. **HTTP Status Code tetap standard**: Mapping otomatis dari Response Code
4. **Custom Message**: Semua method mendukung custom message
5. **Type Safety**: TypeScript strict mode untuk type safety

## Migration dari Old Format

Jika ada code yang masih menggunakan format lama:

**Before:**
```typescript
res.status(200).json(ApiResponse.success('Success', { data }));
```

**After:**
```typescript
ResponseHelper.success(res, ResponseCode.SUCCESS, { data }, 'Success');
```

**Before:**
```typescript
throw new ApiError(401, 'Unauthorized');
```

**After:**
```typescript
ResponseHelper.unauthorized(res, 'Unauthorized');
return;
```
