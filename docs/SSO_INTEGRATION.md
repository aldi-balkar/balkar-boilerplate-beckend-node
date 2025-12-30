# SSO (Single Sign-On) Integration

## Overview
Sistem autentikasi yang mendukung **2 metode login**:
1. **Manual Login** - Username/email + password (traditional)
2. **SSO Login** - Single Sign-On menggunakan token dari SSO Service

## Features

### ✅ Dual Authentication Methods
- Manual authentication tetap berfungsi
- SSO authentication untuk centralized login
- Automatic user provisioning dari SSO
- Seamless integration dengan existing system

### ✅ Token Verification
- Verify SSO token via API call ke SSO Service
- Verify SSO token via JWT (shared secret)
- Fallback mechanism jika SSO service down

### ✅ Security
- Token validation sebelum create session
- Role mapping dari SSO ke aplikasi
- Audit logging untuk semua SSO activities
- Rate limiting pada SSO endpoints

---

## Configuration

### Environment Variables

```env
# SSO Configuration
SSO_ENABLED=true
SSO_SERVICE_URL=https://sso.yourdomain.com
SSO_CLIENT_ID=your-client-id
SSO_CLIENT_SECRET=your-super-secret-sso-client-secret-min-32-chars
SSO_VERIFY_URL=https://sso.yourdomain.com/api/v1/verify
SSO_TOKEN_EXPIRATION=1h
```

### Configuration Options

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SSO_ENABLED` | No | Enable/disable SSO | `true` |
| `SSO_SERVICE_URL` | Yes* | URL SSO service | `https://sso.yourdomain.com` |
| `SSO_CLIENT_ID` | Yes* | Client ID dari SSO | `my-app-client-id` |
| `SSO_CLIENT_SECRET` | Yes* | Secret untuk verify token | `your-secret-key-min-32-chars` |
| `SSO_VERIFY_URL` | Yes* | Endpoint untuk verify token | `https://sso.yourdomain.com/api/v1/verify` |
| `SSO_TOKEN_EXPIRATION` | No | Token expiration | `1h` |

\* Required jika SSO_ENABLED=true

---

## Authentication Flow

### 1. Manual Login (Traditional)

```
Client → POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

↓

Server validates credentials
↓

Server generates JWT tokens
↓

Response:
{
  "responCode": "01000001",
  "responMessage": "Login successful",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": { ... }
  }
}
```

### 2. SSO Login Flow

```
Step 1: User login di SSO Service
Client → SSO Service Login
↓
SSO Service returns SSO Token

Step 2: Client kirim SSO token ke aplikasi
Client → POST /api/v1/auth/sso/login
{
  "ssoToken": "eyJhbGc...",
  "clientId": "optional-client-id"
}

↓

Step 3: Server verify token dengan SSO Service
Server → SSO Service Verify API
  or
Server → Verify JWT signature (if shared secret)

↓

Step 4: Check/Create user di database
- If user exists: Use existing user
- If user not exists: Auto-provision (create user)

↓

Step 5: Generate aplikasi tokens
Server generates JWT tokens

↓

Response:
{
  "responCode": "01000001",
  "responMessage": "SSO login successful",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": { ... }
  }
}
```

---

## API Endpoints

### 1. Manual Authentication

#### POST `/api/v1/auth/register`
Register user baru (manual)

**Request:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

#### POST `/api/v1/auth/login`
Login dengan email/password (manual)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "responCode": "01000001",
  "responMessage": "Login successful",
  "status": "Operation completed successfully",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "role": "USER"
    }
  }
}
```

---

### 2. SSO Authentication

#### POST `/api/v1/auth/sso/login`
Login menggunakan SSO token

**Request:**
```json
{
  "ssoToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "clientId": "optional-client-id"
}
```

**Response (Success):**
```json
{
  "responCode": "01000001",
  "responMessage": "SSO login successful",
  "status": "Operation completed successfully",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "role": "USER"
    }
  }
}
```

**Response (Error - Invalid Token):**
```json
{
  "responCode": "16210001",
  "responMessage": "Invalid SSO token",
  "status": "Authentication failed"
}
```

**Response (Error - SSO Disabled):**
```json
{
  "responCode": "16210001",
  "responMessage": "SSO authentication is disabled",
  "status": "Authentication failed"
}
```

#### POST `/api/v1/auth/sso/verify`
Verify apakah SSO token valid (tanpa login)

**Request:**
```json
{
  "ssoToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Valid):**
```json
{
  "responCode": "01000001",
  "responMessage": "SSO token is valid",
  "status": "Operation completed successfully",
  "data": {
    "valid": true,
    "user": {
      "id": "sso-user-id",
      "email": "user@example.com",
      "username": "username",
      "role": "USER",
      "permissions": ["user.profile", "post.create"]
    }
  }
}
```

**Response (Invalid):**
```json
{
  "responCode": "16210001",
  "responMessage": "Invalid SSO token",
  "status": "Authentication failed"
}
```

#### GET `/api/v1/auth/sso/info`
Get SSO configuration info

**Response:**
```json
{
  "responCode": "01000001",
  "responMessage": "SSO configuration retrieved",
  "status": "Operation completed successfully",
  "data": {
    "enabled": true,
    "serviceUrl": "https://sso.yourdomain.com",
    "hasVerifyUrl": true,
    "hasClientId": true,
    "configured": true
  }
}
```

---

## SSO Token Format

### Method 1: API Verification
SSO token bisa dalam format apapun. Server akan call SSO Service API untuk verify.

**SSO Service API Response:**
```json
{
  "valid": true,
  "user": {
    "id": "sso-user-id",
    "email": "user@example.com",
    "username": "username",
    "fullName": "User Full Name",
    "role": "USER",
    "permissions": ["user.profile", "post.create"],
    "metadata": {}
  }
}
```

### Method 2: JWT Verification (Shared Secret)
Jika SSO service menggunakan JWT dengan shared secret:

**JWT Payload:**
```json
{
  "userId": "sso-user-id",
  "email": "user@example.com",
  "username": "username",
  "fullName": "User Full Name",
  "role": "USER",
  "permissions": ["user.profile", "post.create"],
  "iat": 1640000000,
  "exp": 1640003600,
  "iss": "sso-service",
  "aud": "your-client-id"
}
```

**Required Fields:**
- `userId` - User ID dari SSO
- `email` - Email user
- `role` - Role user (ADMIN | USER)

**Optional Fields:**
- `username` - Username (default: email prefix)
- `fullName` - Nama lengkap
- `permissions` - Array of permission codes
- `aud` - Audience validation
- `iss` - Issuer validation

---

## Auto-Provisioning

Ketika user login via SSO untuk pertama kali:

1. **Check user exists** - Cek berdasarkan email
2. **If not exists** - Create user baru otomatis
3. **User data** - Ambil dari SSO token
4. **Password** - Empty string (SSO users tidak butuh password)
5. **Role** - Dari SSO token atau default 'USER'
6. **Audit log** - Record user creation dari SSO

**Database Entry:**
```typescript
{
  id: "uuid-generated",
  email: "user@example.com",
  username: "username-from-sso",
  password: "", // Empty untuk SSO users
  role: "USER", // Dari SSO
  isActive: true,
  createdAt: "2025-12-30T...",
  updatedAt: "2025-12-30T..."
}
```

---

## Testing

### Test Manual Login
```bash
curl -X POST http://localhost:9005/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

### Test SSO Login (with mock JWT)
```bash
# Generate test SSO token dengan jwt.io atau:
# Header: {"alg": "HS256", "typ": "JWT"}
# Payload: {"userId": "test-123", "email": "ssouser@example.com", "username": "ssouser", "role": "USER"}
# Secret: nilai dari SSO_CLIENT_SECRET

curl -X POST http://localhost:9005/api/v1/auth/sso/login \
  -H "Content-Type: application/json" \
  -d '{
    "ssoToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### Test SSO Token Verification
```bash
curl -X POST http://localhost:9005/api/v1/auth/sso/verify \
  -H "Content-Type: application/json" \
  -d '{
    "ssoToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### Test SSO Info
```bash
curl -X GET http://localhost:9005/api/v1/auth/sso/info
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `01000001` | Success | Login berhasil |
| `16210001` | Invalid token | SSO token tidak valid |
| `16220001` | Token expired | SSO token sudah expired |
| `16210001` | SSO disabled | SSO tidak diaktifkan |
| `16210001` | SSO not configured | SSO belum dikonfigurasi |
| `12210001` | Forbidden | User inactive atau tidak ada akses |
| `17210001` | Service error | SSO service tidak tersedia |

---

## Integration dengan SSO Service

### SSO Service Requirements

SSO Service harus provide salah satu dari:

1. **Verify API Endpoint**
   - Endpoint untuk verify token
   - Accept token + clientId
   - Return user data jika valid

2. **JWT dengan Shared Secret**
   - Sign token dengan shared secret
   - Include required user fields
   - Set proper expiration

### Example SSO Service Verify API

**Request:**
```http
POST https://sso.yourdomain.com/api/v1/verify
Content-Type: application/json
Authorization: Bearer {SSO_CLIENT_SECRET}

{
  "token": "user-sso-token",
  "clientId": "your-client-id"
}
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "sso-user-id",
    "email": "user@example.com",
    "username": "username",
    "fullName": "User Full Name",
    "role": "USER",
    "permissions": []
  }
}
```

---

## Security Considerations

### ✅ Token Validation
- Always verify token dengan SSO service atau signature
- Check token expiration
- Validate audience jika ada

### ✅ User Provisioning
- Email sebagai unique identifier
- Auto-provision hanya untuk valid SSO tokens
- Set appropriate default role

### ✅ Rate Limiting
- SSO login endpoints menggunakan loginLimiter
- Prevent brute force attacks

### ✅ Audit Logging
- Log semua SSO login attempts
- Log user auto-provisioning
- Track SSO vs manual logins

### ✅ Fallback
- Manual login tetap available jika SSO down
- Graceful error handling
- Clear error messages

---

## Troubleshooting

### SSO Login Gagal

**Problem:** SSO token tidak valid
```json
{
  "responCode": "16210001",
  "responMessage": "Invalid SSO token"
}
```

**Solutions:**
1. Check SSO token belum expired
2. Verify SSO_CLIENT_SECRET sesuai dengan SSO service
3. Check SSO_VERIFY_URL benar
4. Test token di jwt.io jika menggunakan JWT

---

**Problem:** SSO service tidak available
```json
{
  "responCode": "17210001",
  "responMessage": "SSO service is unavailable"
}
```

**Solutions:**
1. Check SSO_SERVICE_URL reachable
2. Check network connectivity
3. Verify SSO service running
4. Use manual login sebagai fallback

---

**Problem:** User tidak bisa login setelah SSO
```json
{
  "responCode": "12210001",
  "responMessage": "User account is inactive"
}
```

**Solutions:**
1. Check user.isActive = true di database
2. Admin dapat activate user
3. Check audit logs untuk detail

---

## Migration Strategy

### Phase 1: Setup SSO (Current)
- ✅ Configure SSO env variables
- ✅ Deploy SSO endpoints
- ✅ Test dengan SSO service

### Phase 2: Gradual Rollout
- Enable SSO untuk pilot users
- Monitor SSO login success rate
- Keep manual login available

### Phase 3: Full SSO
- All users use SSO
- Manual login for emergency only
- Deprecate manual registration

---

## Best Practices

1. **Always validate SSO token** - Jangan trust client input
2. **Use audit logs** - Track all authentication activities
3. **Set token expiration** - Short-lived SSO tokens recommended
4. **Implement retry logic** - Handle SSO service downtime
5. **Keep manual login** - Emergency access jika SSO down
6. **Monitor metrics** - Track SSO vs manual login ratio
7. **Regular security audit** - Review SSO integration security

---

## Summary

### Authentication Methods

| Method | Endpoint | Use Case |
|--------|----------|----------|
| **Manual Login** | `/auth/login` | Traditional username/password |
| **SSO Login** | `/auth/sso/login` | Single Sign-On dengan SSO service |
| **SSO Verify** | `/auth/sso/verify` | Verify SSO token validity |
| **SSO Info** | `/auth/sso/info` | Get SSO configuration |

### Benefits

1. ✅ **Centralized Authentication** - Single login untuk semua apps
2. ✅ **Better UX** - User login sekali saja
3. ✅ **Easier Management** - User management di satu tempat
4. ✅ **Security** - Centralized security policies
5. ✅ **Flexibility** - Support manual login sebagai fallback
6. ✅ **Auto-Provisioning** - User otomatis dibuat saat first login

**Result:** Aplikasi support 2 metode login dengan secure integration ke SSO service! 🚀
