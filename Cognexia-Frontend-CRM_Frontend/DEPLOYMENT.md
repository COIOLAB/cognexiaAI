# CognexiaAI ERP - Deployment Guide

> **Quick deploy (Railway + Vercel)**: See [DEPLOYMENT_PRODUCTION.md](./DEPLOYMENT_PRODUCTION.md) for step-by-step Railway (backend) and Vercel (frontend) deployment.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Third-Party Services](#third-party-services)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Rollback Procedures](#rollback-procedures)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **PostgreSQL**: >= 14.0 (or Supabase account)
- **Redis**: >= 6.0 (for caching and sessions)
- **Git**: For version control

### Required Accounts
- **Stripe Account** (for payment processing)
- **SMTP Service** (Gmail, SendGrid, AWS SES, or similar)
- **Supabase Account** (optional, for PostgreSQL hosting)

---

## Environment Configuration

### Backend Environment Variables

Create `.env` file in `backend/modules/03-CRM/`:

```bash
# =============================================================================
# Application Configuration
# =============================================================================
NODE_ENV=production
PORT=3003
APP_URL=https://your-domain.com

# =============================================================================
# Database Configuration
# =============================================================================
DATABASE_URL=postgresql://username:password@host:5432/database
DB_HOST=your-db-host.com
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_secure_password
DB_NAME=cognexiaai_crm
DB_SYNC=false  # NEVER use true in production!
DB_LOGGING=false

# Supabase (if using)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# =============================================================================
# JWT Configuration - GENERATE STRONG SECRETS!
# =============================================================================
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=<your_64_char_random_secret>
JWT_REFRESH_SECRET=<your_64_char_random_secret>
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# =============================================================================
# Email Configuration (SMTP)
# =============================================================================
# Gmail Example:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your_app_specific_password
SMTP_FROM=CognexiaAI <noreply@cognexiaai.com>

# =============================================================================
# Stripe Payment Configuration
# =============================================================================
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret

# =============================================================================
# Redis Configuration
# =============================================================================
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_TTL=3600

# =============================================================================
# Security & Rate Limiting
# =============================================================================
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

### Frontend Environment Variables

Create `.env.local` in `frontend/client-admin-portal/`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# Application
NEXT_PUBLIC_APP_NAME=CognexiaAI ERP
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
```

---

## Database Setup

### 1. Create Database

```bash
# PostgreSQL
createdb cognexiaai_crm

# Or via psql
psql -U postgres
CREATE DATABASE cognexiaai_crm;
```

### 2. Run Migrations

```bash
cd backend/modules/03-CRM
npm run migration:run
```

### 3. Seed Initial Data (Optional)

```bash
npm run db:seed
```

---

## Backend Deployment

### 1. Install Dependencies

```bash
cd backend/modules/03-CRM
npm install --production
```

### 2. Build the Application

```bash
npm run build
```

### 3. Start the Server

#### Option A: Direct Node.js
```bash
NODE_ENV=production npm run start:prod
```

#### Option B: PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start dist/index.js --name "cognexia-crm-api"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Option C: Docker
```bash
# Build Docker image
npm run docker:build

# Run container
docker run -d \
  --name cognexia-crm-api \
  -p 3003:3003 \
  --env-file .env \
  industry5.0-crm:latest
```

### 4. Verify Backend

```bash
curl http://localhost:3003/health
# Should return: {"status":"ok"}
```

---

## Frontend Deployment

### 1. Install Dependencies

```bash
cd frontend/client-admin-portal
npm install
```

### 2. Build for Production

```bash
npm run build
```

### 3. Start Production Server

#### Option A: Next.js Standalone
```bash
npm run start
```

#### Option B: PM2
```bash
pm2 start npm --name "cognexia-crm-frontend" -- start
pm2 save
```

#### Option C: Vercel (Recommended for Next.js)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## Third-Party Services

### Stripe Configuration

1. **Get API Keys**
   - Go to https://dashboard.stripe.com/apikeys
   - Copy Secret Key and Publishable Key
   - Use Test keys for testing, Live keys for production

2. **Configure Webhooks**
   - Go to https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - URL: `https://api.your-domain.com/webhooks/stripe`
   - Events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the Signing Secret to `STRIPE_WEBHOOK_SECRET`

3. **Create Products & Prices**
   - Go to Products section
   - Create subscription products
   - Note the Price IDs for your application

### SMTP Configuration

#### Gmail Setup:
1. Enable 2FA on your Google Account
2. Go to App Passwords: https://myaccount.google.com/apppasswords
3. Create app password for "Mail"
4. Use the generated password in `SMTP_PASSWORD`

#### SendGrid Setup:
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<your_sendgrid_api_key>
```

#### AWS SES Setup:
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=<your_iam_smtp_username>
SMTP_PASSWORD=<your_iam_smtp_password>
```

---

## Post-Deployment Verification

### 1. Health Checks

```bash
# Backend health
curl https://api.your-domain.com/health

# Database connectivity
curl https://api.your-domain.com/health/db

# Redis connectivity
curl https://api.your-domain.com/health/redis
```

### 2. Test Authentication

```bash
# Register new user
curl -X POST https://api.your-domain.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "firstName": "Test",
    "lastName": "User",
    "organizationName": "Test Org"
  }'

# Check email for verification link
# Click verification link

# Login
curl -X POST https://api.your-domain.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

### 3. Test Payment Flow (Stripe Test Mode)

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires Authentication: `4000 0025 0000 3155`

### 4. Verify Email Delivery

- Check spam folder if emails not received
- Verify SMTP credentials
- Check application logs for email errors

### 5. Monitor Logs

```bash
# PM2 logs
pm2 logs cognexia-crm-api --lines 100

# Docker logs
docker logs -f cognexia-crm-api

# Check for errors
grep ERROR /path/to/logs/*.log
```

---

## Rollback Procedures

### 1. Quick Rollback (PM2)

```bash
# List previous deployments
pm2 list

# Restart from previous version
pm2 restart cognexia-crm-api@previous

# Or restore from backup
cd /backup/cognexia-crm-$(date -d yesterday +%Y%m%d)
pm2 restart dist/index.js
```

### 2. Database Rollback

```bash
# Revert last migration
npm run migration:revert

# Restore from backup
psql cognexiaai_crm < backup-YYYY-MM-DD.sql
```

### 3. Full System Rollback

```bash
# 1. Stop current services
pm2 stop all

# 2. Restore code from Git tag
git checkout v1.0.0  # Replace with stable version

# 3. Restore database
psql cognexiaai_crm < backup.sql

# 4. Rebuild and restart
npm install
npm run build
pm2 restart all
```

---

## Troubleshooting

### Issue: Database Connection Failed

**Solution:**
```bash
# Check database is running
pg_isready -h localhost -p 5432

# Test connection
psql -h DB_HOST -U DB_USERNAME -d cognexiaai_crm

# Verify environment variables
echo $DATABASE_URL
```

### Issue: Emails Not Sending

**Solution:**
1. Check SMTP credentials in `.env`
2. Verify SMTP server allows connections from your IP
3. Check logs: `pm2 logs | grep "email"`
4. Test SMTP connection manually:
```bash
npm install -g mailtest
mailtest --smtp-host=smtp.gmail.com --smtp-port=587
```

### Issue: Stripe Webhooks Failing

**Solution:**
1. Verify webhook URL is publicly accessible
2. Check `STRIPE_WEBHOOK_SECRET` is correct
3. Test webhook endpoint:
```bash
stripe listen --forward-to localhost:3003/webhooks/stripe
```
4. Check Stripe dashboard for webhook delivery attempts

### Issue: High Memory Usage

**Solution:**
```bash
# Check memory usage
pm2 monit

# Restart with memory limit
pm2 restart cognexia-crm-api --max-memory-restart 1G

# Enable cluster mode
pm2 start dist/index.js -i max --name cognexia-crm-api
```

### Issue: Frontend Build Fails

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check

# Build with verbose logging
npm run build -- --debug
```

---

## Security Checklist

- [ ] All environment variables use strong, unique values
- [ ] Database backups are automated and tested
- [ ] SSL/TLS certificates are installed and valid
- [ ] CORS is configured for production domains only
- [ ] Rate limiting is enabled
- [ ] SQL injection protection is verified
- [ ] XSS protection headers are set
- [ ] Secrets are not committed to version control
- [ ] API keys are rotated regularly
- [ ] Logs do not contain sensitive information

---

## Monitoring & Maintenance

### Set Up Monitoring

```bash
# Install monitoring tools
npm install -g pm2-monitor

# Enable PM2 monitoring
pm2 install pm2-server-monit

# Setup log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Backup Strategy

```bash
# Daily database backup (add to crontab)
0 2 * * * pg_dump cognexiaai_crm > /backups/db-$(date +\%Y\%m\%d).sql

# Weekly file backup
0 3 * * 0 tar -czf /backups/files-$(date +\%Y\%m\%d).tar.gz /path/to/app

# Backup retention (keep last 30 days)
find /backups -name "*.sql" -mtime +30 -delete
```

---

## Support & Documentation

- **Technical Support**: support@cognexiaai.com
- **API Documentation**: https://api.your-domain.com/docs
- **Status Page**: https://status.your-domain.com
- **GitHub Issues**: https://github.com/your-org/cognexiaai-erp/issues

---

## Version History

- **v1.0.0** (2026-01-14): Initial production release
  - Email verification system
  - Stripe payment integration
  - Complete CRM functionality
  - Multi-tenant support
  - Webhook handling

---

**Last Updated**: January 14, 2026
**Maintained By**: CognexiaAI Development Team
