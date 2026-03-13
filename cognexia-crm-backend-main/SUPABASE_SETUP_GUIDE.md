# SUPABASE SETUP GUIDE - MULTI-TENANT CRM SYSTEM

**Module**: backend/modules/03-crm  
**Database**: Supabase (PostgreSQL)  
**Multi-Tenancy Strategy**: Row-Level Security (RLS)  
**Target Scale**: 100,000+ concurrent clients  
**Last Updated**: January 6, 2026

---

## TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Step 1: Create Supabase Project](#step-1-create-supabase-project)
3. [Step 2: Configure Database Schema](#step-2-configure-database-schema)
4. [Step 3: Enable Row-Level Security (RLS)](#step-3-enable-row-level-security-rls)
5. [Step 4: Configure Connection Pooling](#step-4-configure-connection-pooling)
6. [Step 5: Setup Storage Buckets](#step-5-setup-storage-buckets)
7. [Step 6: Configure Backups](#step-6-configure-backups)
8. [Step 7: Environment Variables](#step-7-environment-variables)
9. [Step 8: Testing](#step-8-testing)
10. [Troubleshooting](#troubleshooting)

---

## PREREQUISITES

Before starting, ensure you have:

- [ ] Supabase account (sign up at https://supabase.com)
- [ ] Credit card for billing (Free tier: $0/month for 500MB database)
- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] PostgreSQL client (psql) for testing
- [ ] Access to this CRM codebase

**Estimated Setup Time**: 45-60 minutes  
**Estimated Monthly Cost** (for 100,000 users):
- Pro Plan: $25/month base
- Compute: ~$100-500/month (based on usage)
- Storage: ~$50-100/month
- **Total**: $200-700/month

---

## STEP 1: CREATE SUPABASE PROJECT

### 1.1 Sign Up/Login to Supabase

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub, Google, or Email

### 1.2 Create New Project

1. Click "New Project" in dashboard
2. Fill in project details:
   - **Project Name**: `industry50-crm-production` (or your preferred name)
   - **Database Password**: Generate a strong password (save this securely!)
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
   - **Pricing Plan**: Pro Plan ($25/month) - Required for production

3. Click "Create new project"
4. Wait 2-3 minutes for provisioning

### 1.3 Get Project Credentials

1. Once project is ready, go to **Settings** → **API**
2. Save the following credentials (you'll need these for .env file):
   ```
   Project URL: https://[PROJECT_REF].supabase.co
   anon/public key: eyJhbG... (starts with eyJ)
   service_role key: eyJhbG... (different from anon key)
   ```

3. Go to **Settings** → **Database** and save:
   ```
   Host: db.[PROJECT_REF].supabase.co
   Database name: postgres
   Port: 5432 (direct) or 6543 (pooled)
   User: postgres
   Password: [Your database password from step 1.2]
   ```

---

## STEP 2: CONFIGURE DATABASE SCHEMA

### 2.1 Run TypeORM Migrations

Our CRM module uses TypeORM for database management. All entities are already defined in `src/entities/`.

**Option A: Automatic Migration (Recommended)**

```bash
cd backend/modules/03-crm

# Set environment variables first (or use .env file)
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres"

# Generate migration from entities
npm run migration:generate -- -n InitialSchema

# Run migration
npm run migration:run
```

**Option B: Manual SQL Execution**

If you prefer manual control, connect to Supabase SQL Editor:

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the SQL schema (see Section 2.2)
4. Click "Run"

### 2.2 Database Schema Overview

Our CRM system has 32 tables:

**Core CRM Tables** (12):
- `customers` - Customer profiles
- `leads` - Sales leads
- `opportunities` - Sales opportunities
- `contacts` - Contact information
- `accounts` - Account hierarchy
- `sales_pipelines` - Pipeline stages
- `customer_interactions` - Interaction history
- `sales_quotes` - Quotations
- `customer_segments` - Segmentation
- `marketing_campaigns` - Campaigns
- `email_templates` - Email templates
- `marketing_analytics` - Analytics

**Security & Access Control** (6):
- `users` - System users
- `roles` - User roles
- `permissions` - Granular permissions
- `security_audit_logs` - Audit trail
- `security_policies` - Security rules
- `compliance_records` - Compliance tracking

**Support & Service** (5):
- `support_tickets` - Customer support tickets
- `slas` - SLA policies
- `knowledge_base_articles` - Knowledge base
- `workflows` - Workflow automation
- `business_rules` - Business rules engine

**Advanced Features** (9):
- `customer_experiences` - CX tracking
- `holographic_sessions` - AR/VR sessions
- `customer_insights` - AI insights
- `customer_digital_twins` - AI behavioral models
- `dashboards` - Dashboard configuration
- (Additional Industry 5.0 tables...)

### 2.3 Verify Schema Creation

```bash
# Connect to database
psql "postgresql://postgres:YOUR_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres"

# List all tables
\dt

# Verify organizationId column exists in all tables
SELECT table_name 
FROM information_schema.columns 
WHERE column_name = 'organizationId';

# Should return 32 rows (all our tables)
```

---

## STEP 3: ENABLE ROW-LEVEL SECURITY (RLS)

**CRITICAL FOR MULTI-TENANCY** - This ensures organizations can only access their own data.

### 3.1 Enable RLS on All Tables

```sql
-- Enable RLS on all 32 tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE holographic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE slas ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_digital_twins ENABLE ROW LEVEL SECURITY;
-- Repeat for all 32 tables...
```

### 3.2 Create RLS Policies

**Template Policy for Each Table:**

```sql
-- Example for 'customers' table
-- Repeat this pattern for all 32 tables

-- Policy 1: Users can only SELECT their organization's data
CREATE POLICY customers_select_policy
ON customers FOR SELECT
USING (
  organizationId = current_setting('app.current_organizationId', true)::uuid
);

-- Policy 2: Users can only INSERT into their organization
CREATE POLICY customers_insert_policy
ON customers FOR INSERT
WITH CHECK (
  organizationId = current_setting('app.current_organizationId', true)::uuid
);

-- Policy 3: Users can only UPDATE their organization's data
CREATE POLICY customers_update_policy
ON customers FOR UPDATE
USING (
  organizationId = current_setting('app.current_organizationId', true)::uuid
)
WITH CHECK (
  organizationId = current_setting('app.current_organizationId', true)::uuid
);

-- Policy 4: Users can only DELETE their organization's data
CREATE POLICY customers_delete_policy
ON customers FOR DELETE
USING (
  organizationId = current_setting('app.current_organizationId', true)::uuid
);

-- Service role bypass (for backend operations)
CREATE POLICY customers_service_role_policy
ON customers FOR ALL
USING (auth.role() = 'service_role');
```

### 3.3 Automated RLS Policy Creator

For convenience, we've created a script. In Supabase SQL Editor:

```sql
-- This creates RLS policies for all tables automatically
DO $$ 
DECLARE 
    table_name TEXT;
BEGIN
    FOR table_name IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'customers', 'leads', 'opportunities', -- ... all 32 tables
        )
    LOOP
        -- Select policy
        EXECUTE format('
            CREATE POLICY %I_select_policy
            ON %I FOR SELECT
            USING (organizationId = current_setting(''app.current_organizationId'', true)::uuid)
        ', table_name, table_name);
        
        -- Insert policy
        EXECUTE format('
            CREATE POLICY %I_insert_policy
            ON %I FOR INSERT
            WITH CHECK (organizationId = current_setting(''app.current_organizationId'', true)::uuid)
        ', table_name, table_name);
        
        -- Update policy
        EXECUTE format('
            CREATE POLICY %I_update_policy
            ON %I FOR UPDATE
            USING (organizationId = current_setting(''app.current_organizationId'', true)::uuid)
            WITH CHECK (organizationId = current_setting(''app.current_organizationId'', true)::uuid)
        ', table_name, table_name);
        
        -- Delete policy
        EXECUTE format('
            CREATE POLICY %I_delete_policy
            ON %I FOR DELETE
            USING (organizationId = current_setting(''app.current_organizationId'', true)::uuid)
        ', table_name, table_name);
        
        -- Service role bypass
        EXECUTE format('
            CREATE POLICY %I_service_role_policy
            ON %I FOR ALL
            USING (auth.role() = ''service_role'')
        ', table_name, table_name);
    END LOOP;
END $$;
```

### 3.4 Test RLS Policies

```sql
-- Set organization context
SET app.current_organizationId = '123e4567-e89b-12d3-a456-426614174000';

-- Try to query customers
SELECT * FROM customers;
-- Should only return rows where organizationId matches

-- Try to insert with wrong organizationId
INSERT INTO customers (id, organizationId, company_name, ...) 
VALUES (gen_random_uuid(), '999e4567-e89b-12d3-a456-426614174000', 'Test', ...);
-- Should fail with RLS violation
```

---

## STEP 4: CONFIGURE CONNECTION POOLING

**CRITICAL FOR 100,000+ CONCURRENT CLIENTS**

### 4.1 Understanding Connection Modes

Supabase uses **PgBouncer** for connection pooling. Three modes available:

1. **Session Mode** (Port 5432) - One connection per client session
   - ❌ NOT suitable for 100,000+ users
   - Max connections: ~1,000

2. **Transaction Mode** (Port 6543) - ✅ **RECOMMENDED**
   - Connection released after each transaction
   - Max connections: 100,000+
   - Best for API/web applications

3. **Statement Mode** (Port 6543) - Connection released after each statement
   - ⚠️ Not compatible with all features

### 4.2 Configure Transaction Mode

**In .env file:**

```bash
# Direct connection (for migrations only)
DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres

# Pooled connection (for application runtime) - USE THIS
DATABASE_POOL_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:6543/postgres?pgbouncer=true

# Pool settings
DATABASE_POOL_MODE=transaction
DATABASE_POOL_MIN=10
DATABASE_POOL_MAX=100
```

**In TypeORM configuration:**

```typescript
// Update your TypeORM config
{
  type: 'postgres',
  url: process.env.DATABASE_POOL_URL, // Use pooled URL
  extra: {
    max: 100, // Maximum pool size
    min: 10,  // Minimum pool size
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  },
}
```

### 4.3 Monitor Connection Pool

In Supabase Dashboard:
1. Go to **Reports** → **Database**
2. Monitor "Active Connections" graph
3. Adjust pool size if hitting limits

---

## STEP 5: SETUP STORAGE BUCKETS

### 5.1 Create Storage Buckets

1. In Supabase dashboard, go to **Storage**
2. Click "Create a new bucket"
3. Create the following buckets:

| Bucket Name | Public Access | Purpose |
|-------------|---------------|---------|
| `crm-documents` | Private | Customer documents, contracts |
| `crm-avatars` | Public | User/customer profile pictures |
| `crm-email-attachments` | Private | Email attachments |
| `crm-exports` | Private | Data export files |

### 5.2 Configure Bucket Policies

For each private bucket, create RLS policy:

```sql
-- Example for crm-documents bucket
CREATE POLICY "Users can access their organization's documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'crm-documents'
  AND (storage.foldername(name))[1] = current_setting('app.current_organizationId', true)
);

CREATE POLICY "Users can upload to their organization's folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'crm-documents'
  AND (storage.foldername(name))[1] = current_setting('app.current_organizationId', true)
);
```

### 5.3 Update Environment Variables

```bash
STORAGE_PROVIDER=supabase
STORAGE_BUCKET_NAME=crm-documents
STORAGE_PUBLIC_BUCKET=crm-avatars
STORAGE_MAX_FILE_SIZE=10485760
```

---

## STEP 6: CONFIGURE BACKUPS

### 6.1 Enable Automated Backups

1. In Supabase dashboard, go to **Settings** → **Database**
2. Scroll to "Backup and Restore"
3. Enable **Point-in-Time Recovery (PITR)**
   - Pro Plan: 7-day retention
   - Enterprise: 30-day retention

### 6.2 Configure Manual Backups

```bash
# Backup database to file
pg_dump "postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres" > backup.sql

# Upload to S3 (optional)
aws s3 cp backup.sql s3://your-backup-bucket/crm-backup-$(date +%Y%m%d).sql
```

### 6.3 Setup Automated Backup Script

Create a cron job or GitHub Actions workflow:

```yaml
name: Database Backup
on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup Database
        run: |
          pg_dump "$DATABASE_URL" > backup.sql
          aws s3 cp backup.sql s3://backups/$(date +%Y%m%d).sql
```

---

## STEP 7: ENVIRONMENT VARIABLES

### 7.1 Copy Template

```bash
cd backend/modules/03-crm
cp .env.example .env
```

### 7.2 Fill in Supabase Credentials

Update `.env` with values from Step 1.3:

```bash
# Supabase Configuration
SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
SUPABASE_PROJECT_REF=[YOUR_PROJECT_REF]
SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]

# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
DATABASE_POOL_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:6543/postgres?pgbouncer=true
DATABASE_HOST=db.[PROJECT_REF].supabase.co
DATABASE_PORT=6543
DATABASE_NAME=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=[YOUR_DATABASE_PASSWORD]
```

### 7.3 Verify Configuration

```bash
# Test database connection
npm run typeorm -- query "SELECT NOW()"

# Should output current timestamp
```

---

## STEP 8: TESTING

### 8.1 Test RLS Policies

```typescript
// test-rls.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testRLS() {
  // Set organization context
  await supabase.rpc('set_config', {
    setting: 'app.current_organizationId',
    value: '123e4567-e89b-12d3-a456-426614174000'
  });

  // Try to fetch customers
  const { data, error } = await supabase
    .from('customers')
    .select('*');

  console.log('Data:', data);
  console.log('Error:', error);
}

testRLS();
```

### 8.2 Load Testing

```bash
# Install k6 for load testing
brew install k6  # macOS
# or download from https://k6.io

# Create load test script
cat > load-test.js << EOF
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 1000, // 1000 virtual users
  duration: '5m',
};

export default function () {
  const res = http.get('https://your-api-url/api/v1/customers');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
EOF

# Run load test
k6 run load-test.js
```

### 8.3 Monitor Performance

1. In Supabase dashboard, go to **Reports**
2. Monitor:
   - Database CPU usage
   - Database memory usage
   - Active connections
   - Query performance
3. Set up alerts for:
   - CPU > 80%
   - Connections > 90% of limit
   - Slow queries > 1s

---

## TROUBLESHOOTING

### Common Issues & Solutions

#### Issue 1: "Cannot connect to database"

**Solution:**
```bash
# Check if IP is whitelisted
# Go to Supabase Dashboard → Settings → Database → Connection Pooling
# Add your server IP to allowlist
```

#### Issue 2: "RLS policy violation"

**Solution:**
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check if organizationId is set
SHOW app.current_organizationId;

-- Manually set for testing
SET app.current_organizationId = 'your-org-id';
```

#### Issue 3: "Too many connections"

**Solution:**
```bash
# Switch to pooled connection (port 6543)
DATABASE_POOL_URL=postgresql://...@db.PROJECT_REF.supabase.co:6543/postgres?pgbouncer=true

# Increase pool size in Supabase dashboard (Pro Plan)
# Settings → Database → Connection Pooling
```

#### Issue 4: "Slow query performance"

**Solution:**
```sql
-- Add indexes on frequently queried columns
CREATE INDEX idx_customers_organizationId ON customers(organizationId);
CREATE INDEX idx_leads_organizationId ON leads(organizationId);
-- Repeat for all tables with organizationId

-- Add composite indexes for common queries
CREATE INDEX idx_customers_org_created ON customers(organizationId, created_at DESC);
```

#### Issue 5: "Storage bucket access denied"

**Solution:**
```sql
-- Verify storage RLS policies
SELECT * FROM storage.buckets WHERE id = 'crm-documents';

-- Re-create policies if missing (see Section 5.2)
```

---

## PERFORMANCE OPTIMIZATION

### Indexing Strategy

```sql
-- Organization-based queries (CRITICAL for multi-tenancy)
CREATE INDEX CONCURRENTLY idx_customers_org_id ON customers(organizationId);
CREATE INDEX CONCURRENTLY idx_leads_org_id ON leads(organizationId);
CREATE INDEX CONCURRENTLY idx_opportunities_org_id ON opportunities(organizationId);
-- Repeat for all 32 tables...

-- Date-based queries
CREATE INDEX CONCURRENTLY idx_interactions_created ON customer_interactions(created_at DESC);
CREATE INDEX CONCURRENTLY idx_tickets_created ON support_tickets(created_at DESC);

-- Status-based queries
CREATE INDEX CONCURRENTLY idx_leads_status ON leads(status);
CREATE INDEX CONCURRENTLY idx_opportunities_stage ON opportunities(stage);

-- Full-text search
CREATE INDEX CONCURRENTLY idx_customers_search ON customers USING GIN(to_tsvector('english', company_name));
```

### Query Optimization

```sql
-- Enable query plan analysis
EXPLAIN ANALYZE SELECT * FROM customers WHERE organizationId = 'xxx';

-- Look for "Seq Scan" (bad) vs "Index Scan" (good)
```

---

## MONITORING & ALERTS

### Setup Monitoring

1. **Supabase Dashboard**
   - Navigate to Reports → Database
   - Set up alerts for:
     - CPU usage > 80%
     - Memory usage > 90%
     - Connection count > 90% of pool
     - Query duration > 1s

2. **External Monitoring** (Recommended)
   - DataDog, New Relic, or Prometheus
   - Monitor application-level metrics
   - Alert on API errors, slow responses

3. **Backup Verification**
   - Test restore monthly
   - Verify backup integrity

---

## SECURITY BEST PRACTICES

1. ✅ **Never expose service_role key** in frontend
2. ✅ **Rotate database password** every 90 days
3. ✅ **Use environment variables** for all secrets
4. ✅ **Enable SSL/TLS** for all connections
5. ✅ **Audit RLS policies** quarterly
6. ✅ **Monitor security logs** daily
7. ✅ **Implement rate limiting** on API
8. ✅ **Use strong passwords** (20+ chars, mixed case, numbers, symbols)
9. ✅ **Enable 2FA** on Supabase account
10. ✅ **Review access logs** weekly

---

## COST OPTIMIZATION

### Estimated Monthly Costs (100,000 users)

| Resource | Usage | Cost |
|----------|-------|------|
| Database (Pro Plan) | Base | $25 |
| Compute (2GB RAM, 2 CPU) | ~720 hours | $100-200 |
| Storage (50GB) | Data + Backups | $50 |
| Bandwidth (500GB) | API traffic | $100 |
| Connection Pooling | Included | $0 |
| **TOTAL** | | **$275-375/month** |

### Cost Reduction Tips:

1. **Use connection pooling** (saves 70% on compute)
2. **Optimize queries** (reduce CPU usage)
3. **Implement caching** (reduce database hits)
4. **Compress storage** (reduce storage costs)
5. **CDN for static assets** (reduce bandwidth)

---

## CONCLUSION

You've successfully configured Supabase for your multi-tenant CRM system! 

### Next Steps:

1. ✅ Verify all tables have RLS enabled
2. ✅ Test multi-tenant isolation
3. ✅ Run load tests
4. ✅ Setup monitoring alerts
5. ✅ Configure automated backups
6. ✅ Deploy application to staging
7. ✅ Perform security audit
8. ✅ Deploy to production

### Support Resources:

- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: https://github.com/supabase/supabase/issues

---

**Document Version**: 1.0  
**Last Updated**: January 6, 2026  
**Maintained By**: CRM Development Team

