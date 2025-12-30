# 📚 API Documentation dengan Swagger

## 🎯 Akses Swagger UI

Setelah server running, buka browser dan akses:

**Swagger UI:** http://localhost:9005/api-docs

**Swagger JSON:** http://localhost:9005/api-docs.json

## ✨ Fitur Swagger UI

### 1. **Persistent Authorization (Keep Token)**
- Token akan tetap tersimpan setelah refresh browser
- Cukup authorize 1x saja

### 2. **Try It Out**
- Setiap endpoint bisa langsung dicoba
- Form input otomatis tersedia
- Response langsung ditampilkan

### 3. **Filter & Search**
- Filter endpoints by tag
- Search API by keyword

### 4. **Response Examples**
- Success response example
- Error response example
- Expected data structure

## 🔐 Cara Authorize di Swagger

### Step 1: Login untuk Mendapatkan Token

1. Expand endpoint **POST /auth/login**
2. Klik **"Try it out"**
3. Isi form:
   ```json
   {
     "email": "admin@example.com",
     "password": "admin123"
   }
   ```
4. Klik **"Execute"**
5. Copy `accessToken` dari response

### Step 2: Authorize dengan Token

1. Klik tombol **"Authorize" 🔒** di pojok kanan atas
2. Paste token di form:
   ```
   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Klik **"Authorize"**
4. Klik **"Close"**

✅ Sekarang semua protected endpoints bisa diakses!

## 📋 API Endpoints

### 🔐 Authentication (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout user |
| POST | `/auth/sso/login` | SSO Login |
| POST | `/auth/sso/verify` | Verify SSO token |
| GET | `/auth/sso/info` | Get SSO configuration |

### 👥 Users (Auth Required)

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/users` | List all users | user.list (Admin) |
| GET | `/users/profile` | Get my profile | user.profile |
| PUT | `/users/profile` | Update my profile | user.profile |
| GET | `/users/{id}` | Get user by ID | user.read (Admin) |
| PUT | `/users/{id}` | Update user | user.update (Admin) |
| DELETE | `/users/{id}` | Delete user | user.delete (Admin) |

### 📝 Posts (Auth Required)

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/posts` | List all posts | post.list |
| POST | `/posts` | Create new post | post.create |
| GET | `/posts/{id}` | Get post by ID | post.read |
| PUT | `/posts/{id}` | Update post | post.update |
| DELETE | `/posts/{id}` | Delete post | post.delete |

### 📁 Files (Auth Required)

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/files` | List all files | file.list |
| POST | `/files` | Upload file | file.create |
| GET | `/files/info` | Get storage info | - |
| GET | `/files/{id}` | Get file metadata | file.read |
| GET | `/files/download/{name}` | Download file | - |
| DELETE | `/files/{id}` | Delete file | file.delete |

### 📧 Email (Admin Only)

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| POST | `/email/send` | Send custom email | email.send |
| POST | `/email/send-template` | Send templated email | email.send |
| GET | `/email/provider-info` | Get provider info | email.view |
| GET | `/email/verify-smtp` | Verify SMTP | email.view |
| GET | `/email/templates` | List templates | email.view |

### 📊 Audit Logs (Auth Required)

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/audit-logs` | List all logs | audit.list (Admin) |
| GET | `/audit-logs/me` | Get my logs | audit.me |
| GET | `/audit-logs/{id}` | Get log by ID | audit.read (Admin) |

## 🧪 Testing di Swagger

### Test 1: Register User

1. Expand **POST /auth/register**
2. Klik **"Try it out"**
3. Isi form:
   ```json
   {
     "email": "test@example.com",
     "password": "password123",
     "name": "Test User"
   }
   ```
4. Klik **"Execute"**
5. Lihat response:
   - ✅ Status 201: Success
   - ❌ Status 400: Validation error
   - ❌ Status 409: Email exists

### Test 2: Login

1. Expand **POST /auth/login**
2. Klik **"Try it out"**
3. Isi credentials:
   ```json
   {
     "email": "admin@example.com",
     "password": "admin123"
   }
   ```
4. Copy `accessToken` dari response

### Test 3: Get Profile (Protected)

1. **Authorize** dengan token (lihat cara di atas)
2. Expand **GET /users/profile**
3. Klik **"Try it out"**
4. Klik **"Execute"**
5. Lihat profile data

### Test 4: Upload File (Multipart Form)

1. **Authorize** dengan token
2. Expand **POST /files**
3. Klik **"Try it out"**
4. Click **"Choose File"** untuk pilih file
5. Set `isPublic`: false
6. Klik **"Execute"**
7. File akan ter-upload!

### Test 5: Send Email (Admin Only)

1. Login sebagai **admin**
2. **Authorize** dengan admin token
3. Expand **POST /email/send**
4. Isi form:
   ```json
   {
     "to": "user@example.com",
     "subject": "Test Email",
     "html": "<h1>Hello from Swagger!</h1>",
     "text": "Hello from Swagger!"
   }
   ```
5. Execute - email akan terkirim!

## 📊 Response Format

Semua API menggunakan format response standar:

### Success Response
```json
{
  "responCode": "01000001",
  "responMessage": "Success",
  "status": "OK",
  "data": {
    // Response data here
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "timestamp": "2025-12-30T22:00:00.000Z"
  }
}
```

### Error Response
```json
{
  "responCode": "02000001",
  "responMessage": "Validation Error",
  "status": "VALIDATION_FAILED",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## 🎨 Response Code Format

Response code format: `[ResponCode][StatusCode][ServiceCode]`

**Example:** `01000001`
- `01` = SUCCESS (ResponCode)
- `00` = OK (StatusCode)
- `0001` = Main Service (ServiceCode)

### Common Response Codes

| Code | Meaning |
|------|---------|
| 01000001 | Success |
| 02000001 | Bad Request |
| 02000002 | Validation Error |
| 04000001 | Unauthorized |
| 05000001 | Forbidden |
| 06000001 | Not Found |
| 07000001 | Internal Server Error |

## 🔧 Swagger Configuration

### Customize Swagger UI

Edit `src/config/swagger.ts`:

```typescript
swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Your API Title',
  swaggerOptions: {
    persistAuthorization: true, // Keep token
    displayRequestDuration: true, // Show duration
    docExpansion: 'none', // Collapse all by default
    filter: true, // Enable search
    tryItOutEnabled: true, // Enable try it out
  },
})
```

### Add New Endpoint Documentation

Edit `src/docs/swagger.docs.ts`:

```typescript
/**
 * @swagger
 * /your/endpoint:
 *   post:
 *     tags: [YourTag]
 *     summary: Your endpoint description
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
```

## 🚀 Features

✅ **Persistent Authorization** - Token tidak hilang setelah refresh  
✅ **Form Input** - Semua input menggunakan form, bukan raw JSON  
✅ **Expected Response** - Setiap endpoint ada contoh response  
✅ **Positive Response** - Success case ditampilkan  
✅ **Negative Response** - Error cases ditampilkan  
✅ **Try It Out** - Langsung test API dari browser  
✅ **File Upload** - Support multipart/form-data  
✅ **Search & Filter** - Mudah cari endpoint  
✅ **Request Duration** - Lihat response time  

## 📱 Mobile Testing

Swagger UI responsive! Bisa diakses dari:
- 💻 Desktop browser
- 📱 Mobile browser
- 🖥️ iPad/Tablet

## 🔒 Security

Swagger UI dilengkapi:
- ✅ Helmet CSP configuration
- ✅ CORS protection
- ✅ Rate limiting
- ✅ JWT authentication

## 💡 Tips

1. **Save Token**: Token akan tersimpan di localStorage browser
2. **Refresh Token**: Jika token expired, login ulang
3. **Copy cURL**: Setiap request bisa di-copy sebagai cURL command
4. **Download Response**: Response bisa di-download sebagai file
5. **Schema Validation**: Swagger otomatis validasi input sesuai schema

## 🐛 Troubleshooting

### Token Tidak Tersimpan
- Clear browser cache
- Pastikan localStorage enabled
- Try incognito/private mode

### CORS Error
- Pastikan frontend URL ada di CORS whitelist
- Check `src/app.ts` CORS configuration

### 401 Unauthorized
- Token sudah expired (default 1 hour)
- Login ulang untuk dapat token baru
- Pastikan format token: `Bearer {token}`

### File Upload Gagal
- Check file size limit (default 10MB)
- Check file type di `ALLOWED_FILE_TYPES`
- Pastikan permission `file.create`

## 📚 Learn More

- [Swagger Documentation](https://swagger.io/docs/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI](https://github.com/swagger-api/swagger-ui)

## 🎉 Summary

Swagger UI sudah ready dengan fitur:
- ✅ Semua endpoints terdokumentasi
- ✅ Form input untuk semua request
- ✅ Expected response examples
- ✅ Positive & negative responses
- ✅ Persistent token (keep token setelah refresh)
- ✅ Try it out untuk test langsung
- ✅ File upload support
- ✅ Search & filter

**Akses sekarang:** http://localhost:9005/api-docs
