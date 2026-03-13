# 🚀 CRM MODULE - QUICK START GUIDE

**Last Updated:** January 9, 2026  
**Estimated Setup Time:** 20-30 minutes

---

## 📋 PREREQUISITES

- ✅ Node.js 18+ installed
- ✅ npm installed
- ✅ Internet connection
- ✅ Browser (Chrome, Firefox, Edge)

---

## 🎯 OPTION 1: AUTOMATED SETUP (RECOMMENDED)

### Step 1: Run Setup Script

```powershell
cd C:\Users\nshrm\Desktop\CognexiaAI-ERP\backend\modules\03-CRM
.\setup-supabase.ps1
```

The script will guide you through:
1. Creating Supabase account (if needed)
2. Creating Supabase project
3. Getting credentials
4. Updating .env file
5. Testing connection

### Step 2: Run Migrations

```powershell
npm run migration:run
```

### Step 3: Start Application

```powershell
npm run start:dev
```

✅ **Done!** Your CRM is running at http://localhost:3003

---

## 🛠️ OPTION 2: MANUAL SETUP

### 1. Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub/Google/Email
4. Verify your email

### 2. Create New Project

1. Click "New Project" in Supabase dashboard
2. Fill in:
   - **Name:** `industry50-crm-production`
   - **Password:** Generate strong password ⚠️ **SAVE THIS!**
   - **Region:** `us-east-1` (or closest)
   - **Plan:** Free (testing) or Pro (production)
3. Click "Create new project"
4. Wait 2-3 minutes ⏱️

### 3. Get Your Credentials

#### A. API Credentials
1. Go to **Settings** → **API**
2. Copy these values:
   ```
   SUPABASE_URL: https://[YOUR_PROJECT_REF].supabase.co
   SUPABASE_ANON_KEY: eyJhbG...
   SUPABASE_SERVICE_ROLE_KEY: eyJhbG...
   ```

#### B. Database Credentials
1. Go to **Settings** → **Database**
2. Copy:
   ```
   Host: db.[YOUR_PROJECT_REF].supabase.co
   Database: postgres
   User: postgres
   Password: [Your password from step 2]
   Port: 5432 (direct) or 6543 (pooled)
   ```

### 4. Update .env File

Edit: `C:\Users\nshrm\Desktop\CognexiaAI-ERP\backend\modules\03-CRM\.env`

Replace all `[YOUR_*]` placeholders:

```env
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.abcdefghijklmnop.supabase.co:5432/postgres
DATABASE_PASSWORD=YOUR_PASSWORD
```

### 5. Install Dependencies

```powershell
cd C:\Users\nshrm\Desktop\CognexiaAI-ERP\backend\modules\03-CRM
npm install
```

### 6. Run Migrations

```powershell
npm run migration:run
```

This creates all 75+ database tables.

### 7. Enable Row-Level Security (RLS)

⚠️ **CRITICAL for multi-tenancy!**

Go to Supabase **SQL Editor** and run:

```sql
-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
-- Repeat for all 75 tables...

-- Or use the automated script in SUPABASE_SETUP_GUIDE.md
```

### 8. Start Application

```powershell
npm run start:dev
```

### 9. Verify Setup

Open browser: http://localhost:3003/api/docs

You should see Swagger API documentation.

---

## ✅ VERIFICATION CHECKLIST

- [ ] Supabase account created
- [ ] Project created and provisioned
- [ ] .env file updated with credentials
- [ ] Dependencies installed (`node_modules` exists)
- [ ] Migrations run successfully (75+ tables created)
- [ ] RLS enabled on all tables
- [ ] Application starts without errors
- [ ] Swagger docs accessible

---

## 🔍 TESTING YOUR SETUP

### Test 1: Database Connection

```powershell
npm run health
```

Expected output: `✅ Database connected`

### Test 2: API Health Check

Open browser: http://localhost:3003/health

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "supabase": "connected"
}
```

### Test 3: Create Test Customer

```powershell
curl -X POST http://localhost:3003/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "test-tenant-123",
    "companyName": "Test Company",
    "email": "test@example.com",
    "phone": "555-1234"
  }'
```

---

## 🚨 TROUBLESHOOTING

### Issue 1: "Cannot connect to database"

**Solution:**
```powershell
# Check .env file has correct credentials
cat .env | Select-String "SUPABASE"

# Test connection manually
node -e "const { createClient } = require('@supabase/supabase-js'); const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY); console.log('Connected');"
```

### Issue 2: "Migration failed"

**Solution:**
```powershell
# Check if migrations directory exists
Test-Path .\src\database\migrations

# Run with verbose output
npm run migration:run -- --verbose
```

### Issue 3: "Port 3003 already in use"

**Solution:**
```powershell
# Find process using port
Get-NetTCPConnection -LocalPort 3003

# Change port in .env
# APP_PORT=3004
```

### Issue 4: "Module not found"

**Solution:**
```powershell
# Reinstall dependencies
Remove-Item node_modules -Recurse -Force
npm install
```

---

## 📚 NEXT STEPS AFTER SETUP

### 1. Seed Test Data (Optional)

```powershell
npm run db:seed
```

Creates sample customers, leads, and opportunities.

### 2. Run Tests

```powershell
npm run test
```

### 3. Enable AI Services

Verify in .env:
```env
GROQ_API_KEY=gsk_...
AI_SERVICES_ENABLED=true
```

Test AI endpoint:
```powershell
curl http://localhost:3003/api/v1/ai/customer-insights
```

### 4. Setup Integration Hub

Follow: `backend/modules/03-CRM/docs/INTEGRATION_GUIDE.md`

### 5. Configure Security

- [ ] Enable MFA
- [ ] Setup SSO
- [ ] Run security audit

---

## 🎓 LEARNING RESOURCES

- **Full Setup Guide:** `SUPABASE_SETUP_GUIDE.md` (790 lines, detailed)
- **API Documentation:** http://localhost:3003/api/docs
- **Entity Reference:** Check `src/entities/` directory
- **Supabase Docs:** https://supabase.com/docs

---

## 📞 SUPPORT

### Common Commands

```powershell
# Start dev server
npm run start:dev

# Run migrations
npm run migration:run

# Rollback migration
npm run migration:revert

# Run tests
npm run test

# Check health
npm run health

# View logs
tail -f logs/crm.log
```

### Need Help?

1. Check `COMPREHENSIVE_DEPLOYMENT_AUDIT_2026-01-09.md`
2. Review `PRODUCTION_READINESS_REPORT.md`
3. See Phase completion reports (PHASE1-4.5_*.md files)

---

## ⏱️ ESTIMATED TIMINGS

| Task | Time |
|------|------|
| Create Supabase account | 5 min |
| Create project | 5 min |
| Get credentials | 3 min |
| Update .env | 2 min |
| Install dependencies | 5 min |
| Run migrations | 3 min |
| Enable RLS | 5 min |
| Test setup | 2 min |
| **TOTAL** | **30 min** |

---

## ✅ SUCCESS CRITERIA

Your setup is complete when:

1. ✅ Application starts without errors
2. ✅ http://localhost:3003/health returns "ok"
3. ✅ Swagger docs accessible
4. ✅ Can create/read customers via API
5. ✅ Database has 75+ tables
6. ✅ RLS policies active
7. ✅ AI services respond

---

**🎉 Congratulations! Your CRM module is ready!**

Now proceed with the audit recommendations:
- Write tests (target: 90% coverage)
- Implement MFA/SSO
- Build integration hub
- Run security audit

See: `COMPREHENSIVE_DEPLOYMENT_AUDIT_2026-01-09.md` for full roadmap.
