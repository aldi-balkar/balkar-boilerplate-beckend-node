# 🔐 SECURITY GUIDE

## 🛡️ Security Features Implemented

### ✅ Authentication & Authorization
- JWT with access & refresh tokens
- Token rotation on refresh
- Secure password hashing (bcrypt with salt)
- Role-based access control (RBAC)
- Token expiration strategy

### ✅ Input Validation
- Zod schema validation on all endpoints
- SQL injection protection (Prisma ORM)
- XSS prevention through input sanitization
- Type-safe operations (TypeScript strict mode)

### ✅ Network Security
- Helmet security headers
- CORS with whitelist
- Rate limiting per endpoint
- x-powered-by header disabled

### ✅ Data Security
- Password requirements enforced
- Refresh tokens stored in database
- Soft delete for data retention
- Audit logging for all critical operations

### ✅ Error Handling
- No stack traces in production
- Sanitized error messages
- Centralized error handling
- Proper HTTP status codes

---

## 🔑 Environment Security

### DO ✅
```bash
# Use external .env path
export ENV_PATH=/secure/path/.env

# Strong JWT secrets (64+ chars)
openssl rand -base64 64

# Validate env on startup (already implemented)
# App will crash if mandatory vars missing
```

### DON'T ❌
```bash
# Never commit .env
# Never hardcode secrets
# Never use default passwords
# Never disable validation
```

---

## 🚦 Rate Limiting Strategy

Current implementation:

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| Login | 5 | 1 min | Brute force protection |
| Register | 3 | 1 min | Spam prevention |
| Refresh Token | 10 | 1 min | Token abuse prevention |
| CRUD Operations | 100 | 1 min | API abuse prevention |
| Global API | 1000 | 15 min | DDoS mitigation |

### Adjust for Production
```typescript
// src/middleware/rateLimiter.ts

// For high-traffic APIs
export const crudLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 500, // Increase from 100
});

// For sensitive operations
export const loginLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 3, // Decrease from 5 for more security
});
```

---

## 🔐 Password Security

### Current Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### Customize Requirements
```typescript
// src/validators/auth.validator.ts

password: z
  .string()
  .min(12, 'Password must be at least 12 characters') // Increase from 8
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Must contain uppercase')
  .regex(/[a-z]/, 'Must contain lowercase')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character')
  .regex(/^(?!.*(.)\1{2})/, 'No more than 2 repeated characters')
```

### Password Hashing
```typescript
// src/utils/password.ts
// Currently uses bcrypt with 10 rounds

// For higher security (slower):
const SALT_ROUNDS = 12; // Increase from 10
```

---

## 🎫 JWT Security

### Token Strategy
```
Access Token:  Short-lived (15 min)
Refresh Token: Long-lived (7 days), stored in DB
```

### Token Rotation
When refresh token is used:
1. Old refresh token is revoked
2. New access token generated
3. New refresh token generated
4. Both returned to client

### Customize Expiration
```env
# .env
JWT_ACCESS_EXPIRATION=5m    # More secure (shorter)
JWT_REFRESH_EXPIRATION=1d   # More secure (shorter)
```

### Token Storage (Client-side Recommendations)
```javascript
// ✅ GOOD: httpOnly cookie (backend implementation needed)
// ✅ GOOD: Secure localStorage with encryption
// ❌ BAD: Plain localStorage without encryption
// ❌ BAD: Session storage (lost on tab close)
```

---

## 🌐 CORS Configuration

### Current Setup
```typescript
// src/app.ts
cors({
  origin: config.cors.origin, // From .env
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})
```

### Production Configuration
```env
# .env
# ✅ Specific domains
CORS_ORIGIN=https://app.example.com,https://admin.example.com

# ❌ Avoid wildcards in production
# CORS_ORIGIN=*
```

### Advanced CORS
```typescript
// For dynamic CORS based on subdomain
const allowedOrigins = process.env.CORS_ORIGIN.split(',');

cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
});
```

---

## 📋 Audit Logging

### What's Logged
- User authentication (login/logout)
- User registration
- CRUD operations (create/update/delete)
- IP address
- User agent
- Timestamp

### Access Audit Logs
```bash
# Admin only
GET /api/v1/audit-logs?action=LOGIN&entity=User

# Current user
GET /api/v1/audit-logs/me
```

### Customize Audit Logging
```typescript
// Add to any controller
await prisma.auditLog.create({
  data: {
    userId: req.user?.id,
    action: AuditAction.UPDATE, // or CREATE, DELETE, etc.
    entity: 'EntityName',
    entityId: id,
    details: 'Description of action',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  },
});
```

---

## 🔍 Security Headers (Helmet)

### Current Headers
```
X-DNS-Prefetch-Control: off
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=15552000; includeSubDomains
X-Download-Options: noopen
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
```

### Customize Helmet
```typescript
// src/app.ts
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);
```

---

## 🚨 Common Vulnerabilities Prevention

### ✅ SQL Injection
Protected by Prisma ORM
```typescript
// Safe - parameterized
await prisma.user.findUnique({ where: { email } });

// ❌ Never use raw SQL with user input
// await prisma.$queryRaw`SELECT * FROM users WHERE email = '${email}'`;

// ✅ Use with proper parameters
await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;
```

### ✅ XSS (Cross-Site Scripting)
Protected by:
- Input validation (Zod)
- Content-Type headers
- Helmet CSP headers

### ✅ CSRF (Cross-Site Request Forgery)
Mitigated by:
- JWT tokens (not cookies)
- CORS configuration
- SameSite cookie attributes (if using cookies)

### ✅ DoS (Denial of Service)
Mitigated by:
- Rate limiting
- Request size limits (10MB)
- Database connection pooling

---

## 🔐 Additional Security Measures

### 1. Enable 2FA (Future Enhancement)
```typescript
// Add to user schema
model User {
  // ...
  twoFactorEnabled Boolean @default(false)
  twoFactorSecret  String?
}
```

### 2. IP Whitelisting (If Needed)
```typescript
// Middleware
const ipWhitelist = process.env.IP_WHITELIST?.split(',') || [];

app.use((req, res, next) => {
  if (ipWhitelist.length > 0 && !ipWhitelist.includes(req.ip)) {
    throw new ApiError(403, 'IP not allowed');
  }
  next();
});
```

### 3. API Key Authentication (For Service-to-Service)
```typescript
// Add to request headers
app.use('/api/internal', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    throw new ApiError(401, 'Invalid API key');
  }
  next();
});
```

### 4. Account Lockout (After Failed Attempts)
```typescript
// Add to user schema
model User {
  // ...
  loginAttempts Int @default(0)
  lockedUntil   DateTime?
}

// In login controller
if (user.loginAttempts >= 5) {
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new ApiError(429, 'Account locked. Try again later.');
  }
}
```

---

## 📊 Security Monitoring

### Recommended Tools
- **Snyk**: Dependency vulnerability scanning
- **OWASP ZAP**: Security testing
- **SonarQube**: Code quality & security
- **npm audit**: Check for vulnerable packages

### Regular Security Checks
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Check outdated packages
npm outdated

# Update packages
npm update
```

---

## 🎯 Security Checklist

### Development
- [ ] No secrets in code
- [ ] No console.log with sensitive data
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak info
- [ ] TypeScript strict mode enabled

### Deployment
- [ ] Strong JWT secrets (64+ chars)
- [ ] Production DATABASE_URL
- [ ] CORS restricted to known domains
- [ ] Rate limits configured
- [ ] HTTPS enabled
- [ ] Environment variables secure
- [ ] No .env in repository

### Ongoing
- [ ] Regular dependency updates
- [ ] Security audit (npm audit)
- [ ] Monitor audit logs
- [ ] Review access logs
- [ ] Backup database regularly
- [ ] Test disaster recovery

---

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Prisma Security](https://www.prisma.io/docs/guides/database/advanced-database-tasks/sql-injection)

---

## 🆘 Security Incident Response

### If Compromise Suspected:
1. **Immediate**: Rotate all secrets (JWT, DB password)
2. **Immediate**: Revoke all refresh tokens
3. **Review**: Audit logs for suspicious activity
4. **Notify**: Users if data breach confirmed
5. **Update**: Security measures
6. **Document**: Incident and response

### Contact
- Security issues: security@your-domain.com
- Emergency: Use secure channel

---

**🔐 Security is a continuous process, not a one-time task!**
