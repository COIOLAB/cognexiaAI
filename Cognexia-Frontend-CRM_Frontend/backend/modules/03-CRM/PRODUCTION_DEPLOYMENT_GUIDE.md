# 🚀 CRM Module - Production Deployment Guide

**Version:** 1.0.0  
**Last Updated:** January 11, 2026  
**Target:** 100% Production-Ready Deployment

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Application Deployment](#application-deployment)
5. [Security Configuration](#security-configuration)
6. [Data Migration](#data-migration)
7. [Testing & Validation](#testing--validation)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL 14+ (via Supabase)
- Git

### Required Accounts
- Supabase account (database)
- Groq API key (LLM services)
- Email provider (SendGrid/AWS SES)
- Optional: Twilio (SMS), AWS S3 (file storage)

### Required Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Authentication
JWT_SECRET=your_secure_jwt_secret_min_32_chars
JWT_EXPIRATION=1d

# LLM Services
GROQ_API_KEY=your_groq_api_key

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com

# Application
NODE_ENV=production
PORT=3000
APP_URL=https://your-domain.com

# Optional - Storage
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
```

---

## Environment Setup

### Step 1: Clone & Install Dependencies

```bash
cd C:/Users/nshrm/Desktop/CognexiaAI-ERP/backend/modules/03-CRM

# Install all dependencies
npm install

# Install additional MFA/SSO dependencies
npm install speakeasy qrcode passport-saml passport-google-oauth20 @nestjs/platform-express

# Verify installation
npm list
```

### Step 2: Configure Environment Variables

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your production values.

### Step 3: Build Application

```bash
# TypeScript compilation
npm run build

# Verify build
ls dist/
```

---

## Database Configuration

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note down:
   - Project URL
   - Anon key
   - Service role key
   - Database password

### Step 2: Initialize Database Schema

```bash
# Run application to auto-create tables
npm run start:dev
```

**Expected Output:**
- 80+ tables created
- All TypeORM entities synchronized
- Zero compilation errors

**Verify Tables Created:**
```sql
-- In Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'crm_%'
ORDER BY table_name;
```

### Step 3: Enable Row-Level Security

1. Open Supabase SQL Editor
2. Run the RLS script:

```bash
# Copy contents of supabase-rls-policies.sql
# Paste in Supabase SQL Editor
# Execute
```

**Verify RLS Enabled:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE 'crm_%';
```

All tables should show `rowsecurity = true`.

### Step 4: Create Indexes

Indexes are auto-created by TypeORM decorators, but verify:

```sql
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename LIKE 'crm_%'
ORDER BY tablename, indexname;
```

---

## Application Deployment

### Option 1: Docker Deployment (Recommended)

```bash
# Build Docker image
npm run docker:build

# Run container
docker run -p 3000:3000 \
  --env-file .env \
  industry5.0-crm:latest
```

### Option 2: PM2 Deployment

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/main.js --name crm-api

# Save PM2 config
pm2 save

# Setup startup script
pm2 startup
```

### Option 3: Cloud Deployment

**Heroku:**
```bash
heroku create your-crm-api
git push heroku master
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=your_database_url
```

**AWS Elastic Beanstalk:**
```bash
eb init
eb create crm-production
eb deploy
```

### Verify Deployment

```bash
# Health check
curl https://your-api-url/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2026-01-11T...",
  "uptime": 123
}
```

---

## Security Configuration

### Step 1: SSL/HTTPS Setup

**Using Let's Encrypt:**
```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com
```

**Configure Nginx:**
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 2: Configure MFA

MFA service is already implemented. Enable for users:

```typescript
// Example: Enable MFA for user
POST /api/v1/auth/mfa/setup
{
  "method": "TOTP"
}

// Response includes QR code for Google Authenticator
```

### Step 3: Configure Rate Limiting

Already configured in `crm.module.ts`:
- 10 requests per 60 seconds per IP
- Automatically enforced

### Step 4: Security Headers

Already configured via Helmet middleware:
- XSS Protection
- Content Security Policy
- HSTS
- Frame Options

---

## Data Migration

### Step 1: Prepare CSV Import

**Download Template:**
```bash
GET /api/v1/migration/templates/customer
```

**Sample Template:**
```csv
companyName,industry,primaryContact.email,primaryContact.phone,address.city,address.country
Acme Corp,Technology,john@acme.com,+1234567890,New York,USA
```

### Step 2: Import Data

**Via API:**
```bash
curl -X POST https://your-api-url/api/v1/migration/import/csv \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@customers.csv" \
  -F "targetEntity=customer" \
  -F "options={\"skipDuplicates\":true,\"batchSize\":100}"
```

**Response:**
```json
{
  "jobId": "uuid",
  "status": "pending",
  "totalRecords": 0,
  "processedRecords": 0
}
```

### Step 3: Monitor Import Progress

```bash
GET /api/v1/migration/jobs/{jobId}
```

### Step 4: ERP Sync

**Salesforce Sync:**
```bash
POST /api/v1/migration/sync/salesforce
{
  "connectionId": "connection-uuid",
  "targetEntity": "customer",
  "options": {
    "skipDuplicates": true,
    "updateExisting": true
  }
}
```

### Step 5: Rollback (if needed)

```bash
POST /api/v1/migration/jobs/{jobId}/rollback
```

---

## Testing & Validation

### Step 1: API Health Check

```bash
curl https://your-api-url/health
```

### Step 2: Database Connectivity

```bash
# Test query
curl -X GET https://your-api-url/api/v1/customers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Step 3: Authentication Test

```bash
# Login
curl -X POST https://your-api-url/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Step 4: Run Test Suite

```bash
# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Coverage report
npm run test:cov
```

**Expected Coverage:** 90%+

### Step 5: Load Testing

```bash
# Install k6
brew install k6  # or download from k6.io

# Run load test
k6 run load-test.js
```

**Load Test Script (load-test.js):**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 100, // 100 virtual users
  duration: '5m',
};

export default function() {
  let res = http.get('https://your-api-url/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

---

## Monitoring & Maintenance

### Step 1: Setup Monitoring

**Using PM2:**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

**Using DataDog (Recommended):**
```bash
# Install DataDog agent
DD_API_KEY=your_key DD_SITE="datadoghq.com" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"

# Configure APM
npm install dd-trace
```

### Step 2: Configure Alerts

**Health Check Alert:**
- URL: https://your-api-url/health
- Frequency: Every 5 minutes
- Alert if: Status ≠ 200 for 3 consecutive checks

**Database Alert:**
- Monitor connection pool
- Alert if: Connections > 80% capacity

**API Performance Alert:**
- Monitor P95 response time
- Alert if: P95 > 1000ms for 5 minutes

### Step 3: Backup Strategy

**Database Backups:**
```bash
# Supabase auto-backups: Daily
# Manual backup:
pg_dump -h your-supabase-host -U postgres -d postgres > backup-$(date +%Y%m%d).sql
```

**Application Backups:**
```bash
# Backup uploads folder
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz ./uploads/

# Upload to S3
aws s3 cp uploads-backup-*.tar.gz s3://your-bucket/backups/
```

### Step 4: Log Management

**Centralized Logging:**
```bash
# Using Winston (already configured)
# Logs location: ./logs/

# View logs
tail -f logs/combined.log
tail -f logs/error.log
```

### Step 5: Performance Monitoring

**Key Metrics to Track:**
- API response time (P50, P95, P99)
- Database query time
- Error rate (%)
- Request throughput (req/sec)
- CPU usage (%)
- Memory usage (%)
- Active connections

---

## Troubleshooting

### Issue: Application Won't Start

**Solution:**
```bash
# Check logs
cat logs/error.log

# Verify environment variables
npm run validate

# Check database connection
psql $DATABASE_URL -c "SELECT 1"
```

### Issue: 0 TypeScript Errors But Runtime Errors

**Solution:**
```bash
# Rebuild
rm -rf dist/
npm run build

# Check for missing dependencies
npm install

# Verify imports
npx tsc --noEmit
```

### Issue: Database Connection Timeout

**Solution:**
```bash
# Check Supabase status
curl https://status.supabase.com

# Verify connection string
echo $DATABASE_URL

# Test direct connection
psql $DATABASE_URL
```

### Issue: Import Job Fails

**Solution:**
```bash
# Check job logs
GET /api/v1/migration/jobs/{jobId}

# Common issues:
# - Invalid CSV format (check template)
# - Missing required fields
# - Duplicate records (enable skipDuplicates)
# - Invalid data types

# Rollback and retry
POST /api/v1/migration/jobs/{jobId}/rollback
```

### Issue: High Memory Usage

**Solution:**
```bash
# Check Node.js memory
node --max-old-space-size=4096 dist/main.js

# Monitor memory
pm2 monit

# Identify memory leaks
node --inspect dist/main.js
```

---

## Post-Deployment Checklist

- [ ] ✅ All 80+ database tables created
- [ ] ✅ RLS policies enabled
- [ ] ✅ TypeScript compilation: 0 errors
- [ ] ✅ Application starts successfully
- [ ] ✅ Health check returns 200
- [ ] ✅ Authentication working
- [ ] ✅ Database queries execute
- [ ] ✅ HTTPS/SSL configured
- [ ] ✅ Rate limiting active
- [ ] ✅ Monitoring configured
- [ ] ✅ Backups scheduled
- [ ] ✅ Load testing passed
- [ ] ✅ Security audit passed
- [ ] ✅ Documentation complete

---

## Support & Resources

- **Documentation:** See API_DOCUMENTATION.md
- **Migration Guide:** See DATA_MIGRATION_GUIDE.md
- **API Reference:** https://your-api-url/api/docs (Swagger)
- **GitHub Issues:** https://github.com/your-repo/issues
- **Email Support:** support@yourdomain.com

---

**🎉 Congratulations! Your CRM module is now 100% production-ready!**
