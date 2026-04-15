# EpixBox Environment Setup Guide

## Overview
This guide covers complete setup for development, testing, and production deployment of the EpixBox photography platform.

## Quick Start (5 minutes)
```bash
# 1. Install dependencies
npm install

# 2. Setup database
createdb -U postgres photoappp_dev  # or create via PostgreSQL GUI
cd server && npm run db:migrate

# 3. Copy & fill .env
cp .env.example .env
# Edit .env with your local values (see section 3 below)

# 4. Start dev servers (in separate terminals)
npm run dev  # Starts both server and client

# Server: http://localhost:4000
# Client: http://localhost:5173
```

## Prerequisites
- Node.js 20+ LTS
- PostgreSQL 14+ (local or remote)
- Redis 6+ (for job queues)
- AWS S3 account (for photo storage)
- Stripe account (for payments)
- Email service (Mailtrap for dev)

## 1. Database Setup

### Local PostgreSQL Installation

#### Windows (via PostgreSQL installer)
```bash
# Download from https://www.postgresql.org/download/windows/
# Install with default settings (port 5432, user postgres, password postgres)
# Start PostgreSQL: psql -U postgres
psql -U postgres -c "CREATE DATABASE photoapp_dev;"
```

#### macOS (via Homebrew)
```bash
brew install postgresql@14
brew services start postgresql@14
createdb -U postgres photoapp_dev
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get install postgresql-14
sudo -u postgres createdb photoapp_dev
```

### Run Database Migrations
```bash
cd server
npm run db:migrate
```

This will apply all 5 migration phases:
- **Phase 1-3**: 2FA, watermarks, themes, coupons, photo indexing
- **Phase 4**: Product variants and inventory management
- **Phase 5**: Shipping zones and rates
- **Phase 7**: Subdomains, gallery passwords, gallery expiries
- **Phase 8**: API keys, gift cards, subscriptions, payment methods, refunds

### Verify Database
```bash
psql -U postgres -d photoapp_dev -c "\dt"  # List all tables
psql -U postgres -d photoapp_dev -c "\di"  # List all indexes
```

## 2. Redis Setup

### Windows (via WSL or Docker)
```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine

# OR using WSL
wsl --install ubuntu
wsl
sudo apt-get install redis-server
redis-server
```

### macOS (via Homebrew)
```bash
brew install redis
brew services start redis
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

### Verify Redis
```bash
redis-cli ping  # Should respond "PONG"
```

## 3. Environment Configuration

### Server (.env)
Copy `.env.example` to `.env` and fill in these critical values:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=photoapp_dev
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false

# Auth
JWT_ACCESS_SECRET=your_256_bit_secret_here
JWT_REFRESH_SECRET=your_256_bit_secret_here

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=epixbox-photos-dev

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# Email (Mailtrap for testing)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_pass
EMAIL_FROM=noreply@epixbox.dev

# URLs
CLIENT_URL=http://localhost:5173
API_BASE_URL=http://localhost:4000/api/v1

# Redis
REDIS_URL=redis://localhost:6379

# Optional: Monitoring
SENTRY_DSN=your_sentry_dsn_here
VITE_LOGROCKET_APP_ID=your_logrocket_id_here
```

### Client (.env)
The client picks up VITE_ prefixed variables from server .env:
```bash
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_LOGROCKET_APP_ID=your_logrocket_id_here
```

## 4. Getting Credentials

### AWS S3
1. Go to https://console.aws.amazon.com/
2. Create IAM user with S3 permissions
3. Generate access key and secret
4. Create S3 bucket: `epixbox-photos-dev`

### Stripe
1. Sign up at https://stripe.com
2. Go to API Keys section
3. Copy test keys (starts with `sk_test_` and `pk_test_`)
4. In Webhooks, add endpoint: `http://localhost:4000/api/v1/webhooks/stripe`

### Email (Mailtrap)
1. Sign up at https://mailtrap.io
2. Create new inbox
3. Copy SMTP credentials

### Google OAuth (Optional)
1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add `http://localhost:5173` as authorized redirect

## 5. Development Server

### Terminal 1 - Backend
```bash
cd server
npm install
npm run dev
# Server runs on http://localhost:4000
# API docs at http://localhost:4000/api/v1/docs
```

### Terminal 2 - Frontend
```bash
cd client
npm install
npm run dev
# Client runs on http://localhost:5173
```

### Terminal 3 - Redis (if not using docker)
```bash
redis-server
```

## 6. Testing Login
1. Go to http://localhost:5173
2. Sign up with test email
3. Check console for Mailtrap email (won't actually send in test mode)
4. Use test email in database directly if needed

```bash
# Direct DB login setup
psql -U postgres -d photoapp_dev
UPDATE "Users" SET "emailVerified" = true WHERE "email" = 'test@example.com';
```

## 7. Testing Stripe Integration
Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires auth: `4000 0025 0000 3155`

## 8. Troubleshooting

### "database does not exist"
```bash
psql -U postgres -c "CREATE DATABASE photoapp_dev;"
```

### "could not connect to server"
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Restart PostgreSQL
# Windows: Services > PostgreSQL > Restart
# Mac: brew services restart postgresql@14
# Linux: sudo systemctl restart postgresql
```

### "Redis connection refused"
```bash
# Check if Redis is running
redis-cli ping

# Start Redis
redis-server
```

### Migrations failed
```bash
# Undo and retry
cd server
npm run db:migrate:undo:all
npm run db:migrate
```

### Port already in use
```bash
# Change ports in .env
PORT=4001  # Server
# Client via: npm run dev -- --port 5174
```

## 9. Production Deployment

### Environment
Set production-grade credentials and enable SSL:
```bash
NODE_ENV=production
DB_SSL=true  # Enable SSL for production DB
STRIPE_SECRET_KEY=sk_live_...  # Live keys, never test keys
```

### Database
```bash
npm run db:migrate  # Apply migrations to production DB
```

### Build & Deploy
```bash
npm run build
# Deploy to Vercel, Heroku, AWS, etc.
```

## 10. Database Backup & Restore

### Backup
```bash
pg_dump -U postgres photoapp_dev > backup.sql
```

### Restore
```bash
psql -U postgres photoapp_dev < backup.sql
```

## Emergency Procedures

### Reset Development Database
```bash
# ⚠️ WARNING: This deletes all data
psql -U postgres -c "DROP DATABASE photoapp_dev;"
psql -U postgres -c "CREATE DATABASE photoapp_dev;"
npm run db:migrate
```

### Check Migration Status
```bash
cd server
npm run db:migrate  # Will show pending migrations
```

## Notes
- All development uses test/sandbox credentials (Stripe test keys, etc.)
- Never commit real credentials to Git
- `node_modules` should be in `.gitignore`
- Database backups should be automated in production
- Redis is required for job queues and session storage
