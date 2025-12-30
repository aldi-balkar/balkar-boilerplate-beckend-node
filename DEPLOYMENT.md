# 🚀 DEPLOYMENT GUIDE

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Environment
- [ ] Set `NODE_ENV=production`
- [ ] Generate strong JWT secrets (min 64 chars)
- [ ] Configure production DATABASE_URL
- [ ] Set production CORS_ORIGIN
- [ ] Adjust rate limiting if needed
- [ ] Set appropriate LOG_LEVEL (warn/error)

### ✅ Security
- [ ] JWT secrets are strong and unique
- [ ] Database credentials are secure
- [ ] .env file is NOT committed to git
- [ ] CORS origins are properly restricted
- [ ] Rate limits are configured for production traffic

### ✅ Database
- [ ] PostgreSQL database is created
- [ ] Database is accessible from production server
- [ ] Backup strategy is in place
- [ ] Connection pool is configured

### ✅ Code
- [ ] All tests passing (if applicable)
- [ ] No console.log in production code
- [ ] Error handling is complete
- [ ] TypeScript compiles without errors

---

## 🏗️ DEPLOYMENT OPTIONS

## Option 1: Railway (Recommended - Easiest)

### 1. Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up with GitHub

### 2. Deploy Database
```bash
# In Railway Dashboard
1. Click "New Project"
2. Select "Provision PostgreSQL"
3. Copy DATABASE_URL from Variables tab
```

### 3. Deploy Application
```bash
# Connect GitHub repo or use Railway CLI
railway login
railway init
railway up
```

### 4. Set Environment Variables
```bash
# In Railway Dashboard → Variables
NODE_ENV=production
PORT=3000
API_VERSION=v1
DATABASE_URL=<from-railway-postgres>
JWT_ACCESS_SECRET=<your-secret>
JWT_REFRESH_SECRET=<your-secret>
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
CORS_ORIGIN=https://yourfrontend.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
LOG_LEVEL=warn
```

### 5. Run Migrations
```bash
railway run npm run prisma:migrate:prod
```

---

## Option 2: Render

### 1. Create Render Account
- Go to [render.com](https://render.com)
- Sign up with GitHub

### 2. Create PostgreSQL Database
```
1. Dashboard → New PostgreSQL
2. Choose Free or Paid plan
3. Copy Internal Database URL
```

### 3. Create Web Service
```
1. Dashboard → New Web Service
2. Connect GitHub repo
3. Configure:
   - Name: your-app-name
   - Environment: Node
   - Build Command: npm install && npm run build && npm run prisma:generate
   - Start Command: npm run prisma:migrate:prod && npm start
```

### 4. Add Environment Variables
```
Same as Railway above
```

---

## Option 3: DigitalOcean App Platform

### 1. Create Account
- [digitalocean.com](https://digitalocean.com)

### 2. Create Database
```
1. Create → Databases → PostgreSQL
2. Copy connection string
```

### 3. Deploy App
```
1. Create → Apps
2. Connect GitHub
3. Configure build:
   - Build Command: npm run build
   - Run Command: npm start
```

### 4. Environment Variables
Add all required env vars in Settings

---

## Option 4: VPS (Ubuntu 20.04/22.04)

### 1. Initial Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2
sudo npm install -g pm2
```

### 2. Setup PostgreSQL
```bash
sudo -u postgres psql

# In PostgreSQL shell:
CREATE DATABASE your_db_name;
CREATE USER your_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE your_db_name TO your_user;
\q
```

### 3. Clone & Setup Application
```bash
# Clone repository
git clone https://github.com/your-username/your-repo.git
cd your-repo

# Install dependencies
npm install

# Create .env file
nano .env
# Add all environment variables

# Build application
npm run build

# Run migrations
npm run prisma:migrate:prod

# Seed database (optional)
npm run prisma:seed
```

### 4. Start with PM2
```bash
# Start application
pm2 start dist/server.js --name backend-api

# Save PM2 configuration
pm2 save

# Setup auto-start on reboot
pm2 startup
```

### 5. Setup Nginx (Optional but Recommended)
```bash
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/backend-api

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/backend-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Setup SSL with Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## Option 5: Docker

### 1. Create Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build
RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
```

### 2. Create docker-compose.yml
```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
    depends_on:
      - db

volumes:
  postgres_data:
```

### 3. Deploy
```bash
docker-compose up -d
```

---

## 🔍 POST-DEPLOYMENT VERIFICATION

### 1. Health Check
```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "status": "ok",
    "database": "connected",
    ...
  }
}
```

### 2. Test Authentication
```bash
# Register
curl -X POST https://your-domain.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"test","password":"Test1234!"}'

# Login
curl -X POST https://your-domain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'
```

### 3. Check Logs
```bash
# Railway: View in dashboard
# Render: View in dashboard
# PM2: pm2 logs backend-api
# Docker: docker-compose logs -f app
```

---

## 🔧 TROUBLESHOOTING

### Database Connection Issues
```bash
# Check DATABASE_URL format
postgresql://user:password@host:port/database?schema=public

# Test connection
npm run prisma:studio
```

### Migration Errors
```bash
# Reset migrations (CAUTION: Data loss!)
npx prisma migrate reset

# Deploy migrations
npm run prisma:migrate:prod
```

### Port Already in Use
```bash
# Change PORT in .env
# Or kill process: lsof -ti:3000 | xargs kill
```

### JWT Errors
```bash
# Regenerate secrets
openssl rand -base64 64
```

---

## 📊 MONITORING

### Recommended Tools
- **Uptime**: [UptimeRobot](https://uptimerobot.com)
- **Logging**: [Logtail](https://logtail.com), [Papertrail](https://papertrailapp.com)
- **APM**: [New Relic](https://newrelic.com), [DataDog](https://datadoghq.com)
- **Error Tracking**: [Sentry](https://sentry.io)

### Basic Monitoring Setup
```bash
# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🔄 CI/CD Setup (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 🎉 DEPLOYMENT COMPLETE!

Your backend is now live and ready for production traffic!

### Next Steps:
1. ✅ Monitor application logs
2. ✅ Setup alerting
3. ✅ Configure backups
4. ✅ Document API for frontend team
5. ✅ Setup staging environment

**🚀 Happy Deploying!**
