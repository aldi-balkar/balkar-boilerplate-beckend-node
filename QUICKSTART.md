# 🚀 QUICK START GUIDE

## 1️⃣ INSTALL DEPENDENCIES

```bash
npm install
```

## 2️⃣ SETUP ENVIRONMENT

```bash
# Copy .env.example
cp .env.example .env

# Generate JWT secrets
openssl rand -base64 64  # Copy untuk JWT_ACCESS_SECRET
openssl rand -base64 64  # Copy untuk JWT_REFRESH_SECRET

# Edit .env dengan editor favorit
nano .env  # atau code .env
```

### Minimal .env Configuration:

```env
NODE_ENV=development
PORT=3000
API_VERSION=v1

DATABASE_URL=postgresql://username:password@localhost:5432/dbname?schema=public

JWT_ACCESS_SECRET=<hasil-generate-di-atas>
JWT_REFRESH_SECRET=<hasil-generate-di-atas>
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

CORS_ORIGIN=http://localhost:3000,http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
LOG_LEVEL=info
```

## 3️⃣ SETUP DATABASE

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and run migrations
npm run prisma:migrate

# (Optional) Seed database with sample data
npm run prisma:seed
```

## 4️⃣ RUN APPLICATION

```bash
# Development mode (with auto-reload)
npm run dev
```

Server akan berjalan di: **http://localhost:3000**

## 5️⃣ TEST API

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Register User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test1234!"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

Response akan berisi `accessToken` dan `refreshToken`.

### Access Protected Endpoint
```bash
curl http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📝 DEFAULT ACCOUNTS (After Seeding)

```
👨‍💼 Admin:
Email: admin@example.com
Password: Admin123!

👤 User:
Email: user@example.com
Password: User123!
```

## 🎯 NEXT STEPS

1. ✅ Customize database schema di `prisma/schema.prisma`
2. ✅ Add your business logic di controllers
3. ✅ Create new routes di `src/routes/`
4. ✅ Add validators di `src/validators/`
5. ✅ Deploy to production!

## 🛠️ USEFUL COMMANDS

```bash
npm run dev              # Development mode
npm run build            # Build for production
npm start                # Run production build
npm run prisma:studio    # Open Prisma Studio (DB GUI)
npm run lint             # Lint code
npm run format           # Format code with Prettier
```

## 📚 DOCUMENTATION

- Full docs: `README.md`
- Structure: `STRUCTURE.md`
- API endpoints: `README.md` → API Endpoints section

## ❓ TROUBLESHOOTING

### Database connection error?
- Pastikan PostgreSQL running
- Check DATABASE_URL di .env
- Test connection: `npm run prisma:studio`

### JWT errors?
- Pastikan JWT secrets sudah di-generate
- Min 32 karakter
- Different secrets untuk access & refresh

### Port already in use?
- Change PORT di .env
- Or kill process: `lsof -ti:3000 | xargs kill`

### TypeScript errors?
- Run: `npm run prisma:generate`
- Check tsconfig.json
- Restart VS Code

## 🎉 YOU'RE READY!

Happy coding! 🚀
