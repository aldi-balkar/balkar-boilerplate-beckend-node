# Backend Boilerplate - Enterprise Grade

Backend boilerplate yang production-ready, aman, dan scalable dengan Express.js, TypeScript, Prisma, dan PostgreSQL.

## 🚀 Features

### Core Features
- ✅ **Authentication & Authorization**
  - Register & Login
  - JWT (Access + Refresh Token)
  - Token rotation
  - Password hashing dengan bcrypt
  - Role-based access control (RBAC)

- ✅ **User Management**
  - CRUD operations
  - Admin & User roles
  - Profile management
  - Active/inactive status

- ✅ **CRUD Example (Posts)**
  - Create, Read, Update, Delete
  - Pagination
  - Filtering & Sorting
  - Soft delete

- ✅ **Audit Logging**
  - Catat semua aktivitas penting (Login, Register, Create, Update, Delete)
  - Track IP address & user agent
  - Admin dashboard untuk audit logs

### Security Features
- 🛡️ **Helmet** - Security headers
- 🚦 **Rate Limiting** - Per-endpoint protection
- 🔒 **CORS** - Whitelist configuration
- ✅ **Input Validation** - Zod schema validation
- 🔐 **JWT Secret Validation**
- 💉 **SQL Injection Protection** - Prisma ORM
- 🚫 **Error Sanitization** - No stack trace di production

### Rate Limiting Strategy
| Endpoint | Limit |
|----------|-------|
| Login | 5 requests/minute |
| Register | 3 requests/minute |
| Refresh Token | 10 requests/minute |
| CRUD Operations | 100 requests/minute |
| Global | 1000 requests/15 minutes |

## 📁 Project Structure

```
balkar-boilerplate-beckend-node/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Database seeding
│   └── migrations/            # Database migrations
├── src/
│   ├── config/
│   │   ├── env.ts            # Environment validation
│   │   ├── logger.ts         # Pino logger setup
│   │   └── database.ts       # Prisma client
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── post.controller.ts
│   │   ├── auditLog.controller.ts
│   │   └── health.controller.ts
│   ├── middleware/
│   │   ├── authenticate.ts    # JWT authentication
│   │   ├── authorize.ts       # Role-based access
│   │   ├── validate.ts        # Zod validation
│   │   ├── rateLimiter.ts     # Rate limiting
│   │   ├── errorHandler.ts    # Error handling
│   │   └── logger.ts          # HTTP logging
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── post.routes.ts
│   │   ├── auditLog.routes.ts
│   │   ├── health.routes.ts
│   │   └── index.ts           # Route aggregator
│   ├── utils/
│   │   ├── ApiError.ts        # Custom error class
│   │   ├── ApiResponse.ts     # Standard response
│   │   ├── jwt.ts             # JWT utilities
│   │   └── password.ts        # Password hashing
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── user.validator.ts
│   │   └── post.validator.ts
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── .env.example               # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Tech Stack

- **Runtime**: Node.js (LTS)
- **Framework**: Express.js
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Security**: Helmet, CORS, bcrypt
- **Rate Limiting**: express-rate-limit
- **Logging**: Pino

## 📋 Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL >= 14

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Install dependencies
npm install
```

### 2. Setup Environment

```bash
# Copy .env.example ke .env (di luar project untuk keamanan)
cp .env.example .env

# Edit .env dengan konfigurasi Anda
# PENTING: Generate JWT secrets yang kuat
openssl rand -base64 64  # Untuk JWT_ACCESS_SECRET
openssl rand -base64 64  # Untuk JWT_REFRESH_SECRET
```

### 3. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

### 4. Run Application

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

Server akan berjalan di `http://localhost:3000`

## 📝 Environment Variables

Buat file `.env` dengan variabel berikut:

```env
# Application
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name?schema=public

# JWT Secret (Generate dengan: openssl rand -base64 64)
JWT_ACCESS_SECRET=your-super-secret-access-token-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-min-32-chars

# JWT Expiration
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Logging
LOG_LEVEL=info
```

⚠️ **PENTING**: Jangan commit file `.env` ke repository!

## 🔑 API Endpoints

### Authentication

```bash
# Register
POST /api/v1/auth/register
Body: { email, username, password }

# Login
POST /api/v1/auth/login
Body: { email, password }

# Refresh Token
POST /api/v1/auth/refresh
Body: { refreshToken }

# Logout
POST /api/v1/auth/logout
Body: { refreshToken }
```

### Users (Require Authentication)

```bash
# Get Profile
GET /api/v1/users/profile

# Get All Users (Admin only)
GET /api/v1/users?page=1&limit=10&role=USER&search=john

# Get User by ID (Admin only)
GET /api/v1/users/:id

# Create User (Admin only)
POST /api/v1/users
Body: { email, username, password, role }

# Update User
PUT /api/v1/users/:id
Body: { email?, username?, password?, role?, isActive? }

# Delete User (Admin only)
DELETE /api/v1/users/:id
```

### Posts (Require Authentication)

```bash
# Get All Posts
GET /api/v1/posts?page=1&limit=10&published=true&sortBy=createdAt&sortOrder=desc

# Get Post by ID
GET /api/v1/posts/:id

# Create Post
POST /api/v1/posts
Body: { title, content, published }

# Update Post
PUT /api/v1/posts/:id
Body: { title?, content?, published? }

# Delete Post (Soft Delete)
DELETE /api/v1/posts/:id
```

### Audit Logs (Require Authentication)

```bash
# Get My Audit Logs
GET /api/v1/audit-logs/me?page=1&limit=20

# Get All Audit Logs (Admin only)
GET /api/v1/audit-logs?page=1&limit=50&action=LOGIN&entity=User
```

### Health Check

```bash
# Check API Health
GET /api/health
```

## 🧪 Testing API

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "Test1234!"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Test1234!"
  }'

# Access Protected Endpoint
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔐 Default Users (After Seeding)

```
Admin Account:
Email: admin@example.com
Password: Admin123!

User Account:
Email: user@example.com
Password: User123!
```

## 📊 Database Schema

### User
- id, email, username, password
- role (ADMIN, USER)
- isActive
- timestamps

### Post
- id, title, content, published
- authorId (FK to User)
- isDeleted, deletedAt (soft delete)
- timestamps

### RefreshToken
- id, token, userId (FK to User)
- expiresAt, isRevoked
- timestamps

### AuditLog
- id, userId (FK to User)
- action (LOGIN, REGISTER, CREATE, UPDATE, DELETE, LOGOUT)
- entity, entityId, details
- ipAddress, userAgent
- timestamp

## 🛡️ Security Best Practices

1. **Environment Variables**: Jangan hardcode secrets
2. **JWT**: Secret minimal 32 karakter, gunakan token rotation
3. **Password**: Min 8 karakter, harus ada uppercase, lowercase, angka, dan special character
4. **Rate Limiting**: Lindungi dari brute force attack
5. **Input Validation**: Validasi semua input dengan Zod
6. **Error Handling**: Jangan expose stack trace di production
7. **CORS**: Whitelist origin yang diizinkan
8. **Helmet**: Security headers aktif
9. **Audit Logging**: Track semua aktivitas penting

## 📦 NPM Scripts

```bash
npm run dev              # Run development server
npm run build            # Build production
npm start                # Run production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:migrate:prod  # Run migrations (production)
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database
npm run lint             # Lint code
npm run format           # Format code
```

## 🚀 Deployment

### Production Checklist

1. ✅ Set `NODE_ENV=production`
2. ✅ Generate JWT secrets yang kuat
3. ✅ Setup PostgreSQL production database
4. ✅ Set CORS origin ke domain production
5. ✅ Update rate limiting sesuai kebutuhan
6. ✅ Set `LOG_LEVEL=warn` atau `error`
7. ✅ Run migrations: `npm run prisma:migrate:prod`
8. ✅ Build aplikasi: `npm run build`
9. ✅ Run: `npm start`

### Recommended Hosting
- **VPS**: DigitalOcean, Linode, AWS EC2
- **Platform**: Railway, Render, Fly.io
- **Database**: Railway PostgreSQL, Supabase, AWS RDS

## 📚 API Documentation

Setelah server berjalan, API endpoints tersedia di:
- Base URL: `http://localhost:3000/api/v1`
- Health Check: `http://localhost:3000/api/health`

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License

## 👨‍💻 Author

Backend Boilerplate - Enterprise Grade

---

**⚡ Ready for Production!**

Boilerplate ini sudah siap digunakan untuk:
- SaaS applications
- Internal tools
- Public APIs
- Microservices
- Startup MVPs

**🔒 Security First**: Semua security best practices sudah terimplementasi.
**🚀 Scalable**: Mudah dikembangkan dan di-scale.
**📝 Clean Code**: TypeScript strict, modular architecture, well documented.
