# Supabase Setup Guide - Complete Configuration

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Your Supabase Credentials

1. **Login to Supabase**: https://supabase.com/dashboard
   - Use your email: nirmal.singh@cognexiaai.com
   - Use your password

2. **Create/Select Project**:
   - If no project exists, click "New Project"
   - Name: `cognexia-crm`
   - Database Password: Choose a strong password (save it!)
   - Region: Choose closest to your users

3. **Get Connection Details**:
   - Go to: **Settings > Database**
   - Copy these values:

```
Connection String (URI):
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

Host: db.[PROJECT-REF].supabase.co
Database: postgres
Port: 5432
User: postgres
Password: [YOUR-DB-PASSWORD]
```

4. **Get API Keys**:
   - Go to: **Settings > API**
   - Copy:
     - Project URL: `https://[PROJECT-REF].supabase.co`
     - anon/public key
     - service_role key (keep this SECRET!)

---

## 📝 Step 2: Configure Your Backend

### Create `.env` file (or update existing):

```bash
# Navigate to backend folder
cd C:\Users\nshrm\Desktop\CognexiaAI-ERP\backend

# Copy example to .env
copy .env.example .env

# Edit .env file
notepad .env
```

### Add These Lines to `.env`:

```env
# ==========================================
# SUPABASE CONFIGURATION
# ==========================================

# Option 1: Use ONLY Supabase (Cloud)
USE_SUPABASE=true

SUPABASE_DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-DB-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
SUPABASE_DB_HOST=db.[PROJECT-REF].supabase.co
SUPABASE_DB_PASSWORD=your_actual_password_here
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Option 2: Hybrid Mode (Both Local + Supabase)
# USE_SUPABASE=false
# ENABLE_DUAL_WRITE=true
```

**Replace `[PROJECT-REF]`, `[YOUR-DB-PASSWORD]`, `[REGION]`, and keys with your actual values!**

---

## 🗄️ Step 3: Run Database Migrations

### Option A: Using Supabase SQL Editor

1. Go to: **SQL Editor** in Supabase Dashboard
2. Click: **New Query**
3. Run this to verify connection:

```sql
-- Test connection
SELECT version();

-- Check existing tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Option B: Using TypeORM Migration (Automatic)

Your NestJS app will auto-create tables on first run because `synchronize: true` in development:

```bash
# Navigate to backend
cd C:\Users\nshrm\Desktop\CognexiaAI-ERP\backend

# Install dependencies (if needed)
npm install

# Start backend (will auto-create tables)
npm run start:dev
```

---

## 🔍 Step 4: Verify Setup

### Test Database Connection:

```bash
# Run this command in backend folder
npm run test:db
```

### Or manually test with this script:

```bash
# Create test file
echo "import { Client } from 'pg';" > test-connection.js
echo "" >> test-connection.js
echo "const client = new Client({" >> test-connection.js
echo "  connectionString: process.env.SUPABASE_DATABASE_URL," >> test-connection.js
echo "  ssl: { rejectUnauthorized: false }" >> test-connection.js
echo "});" >> test-connection.js
echo "" >> test-connection.js
echo "client.connect()" >> test-connection.js
echo "  .then(() => console.log('✅ Connected to Supabase!'))" >> test-connection.js
echo "  .then(() => client.query('SELECT NOW()'))" >> test-connection.js
echo "  .then(res => console.log('⏰ Server time:', res.rows[0].now))" >> test-connection.js
echo "  .then(() => client.end())" >> test-connection.js
echo "  .catch(err => console.error('❌ Connection error:', err));" >> test-connection.js

# Run test
node test-connection.js
```

---

## 🔐 Step 5: Security Configuration

### Enable Row Level Security (RLS):

1. Go to: **Authentication > Policies**
2. Enable RLS for all tables
3. Add policy for authenticated users:

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
-- (repeat for all tables)

-- Example policy: Users can only see their organization's data
CREATE POLICY "Users can view their org data" ON public.users
  FOR SELECT
  USING (auth.uid() = id OR organization_id IN (
    SELECT organization_id FROM public.users WHERE id = auth.uid()
  ));
```

---

## 🔄 Step 6: Hybrid Mode Setup (Optional)

To write to BOTH local PostgreSQL AND Supabase:

### Update your `app.module.ts`:

```typescript
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(getDatabaseConfig()),
    // ... other modules
  ],
})
```

### The `database.config.ts` I created will handle:
- ✅ Local-only mode: `USE_SUPABASE=false`
- ✅ Supabase-only mode: `USE_SUPABASE=true`
- ✅ Hybrid mode: `ENABLE_DUAL_WRITE=true`

---

## 🚨 Common Issues & Solutions

### Issue 1: "Connection Timeout"
**Solution**: Use the **Pooler connection string** (port 6543), not direct (port 5432)
```
✅ Good: aws-0-region.pooler.supabase.com:6543
❌ Bad: db.project-ref.supabase.co:5432
```

### Issue 2: "SSL Error"
**Solution**: Add SSL configuration:
```typescript
ssl: { rejectUnauthorized: false }
```

### Issue 3: "Authentication Failed"
**Solution**: 
1. Check password has no special characters that need escaping
2. Use connection string from Supabase Dashboard (copy-paste exactly)
3. Try resetting database password in Supabase settings

### Issue 4: "Too Many Connections"
**Solution**: Reduce connection pool size:
```typescript
extra: {
  max: 5,  // Reduce from 10
  idleTimeoutMillis: 30000,
}
```

### Issue 5: "Table Not Found"
**Solution**: Tables aren't created yet. Either:
1. Set `synchronize: true` in development
2. Or run migrations manually in SQL Editor

---

## ✅ Verification Checklist

- [ ] Can login to Supabase dashboard
- [ ] Project created and database password set
- [ ] Connection string copied to `.env`
- [ ] API keys copied to `.env`
- [ ] Backend starts without database errors
- [ ] Can see tables in Supabase Table Editor
- [ ] Frontend can connect to backend
- [ ] Data persists after server restart

---

## 🎯 Next Steps After Setup

1. **Test the connection**: Run your backend
2. **Import existing data**: Use the Import/Export feature we built
3. **Enable backups**: Supabase > Database > Backups (enable PITR)
4. **Setup monitoring**: Supabase > Reports
5. **Change credentials**: As you mentioned, change password after setup

---

## 📞 Need Help?

If you encounter specific errors, check:

1. **Supabase Dashboard > Logs**: See real-time errors
2. **Backend console**: Check TypeORM connection logs
3. **SQL Editor**: Test queries directly

Common commands:
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- See all tables
\dt

-- Describe a table
\d+ table_name
```

---

## 🔒 IMPORTANT: After Setup Complete

**Change these immediately**:
1. ✅ Supabase password
2. ✅ Enable 2FA on Supabase account  
3. ✅ Rotate API keys
4. ✅ Add team members with proper roles (don't share admin access)
5. ✅ Review access logs

**Never share credentials again** - use environment variables and secrets management!
