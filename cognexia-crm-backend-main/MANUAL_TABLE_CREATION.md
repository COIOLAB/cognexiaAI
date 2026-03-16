# Manual Table Creation Guide for CRM Module

## Problem
Your Windows machine cannot resolve the Supabase hostname `db.moijigidcrvbnjoaqelr.supabase.co` because:
1. The hostname only resolves to an IPv6 address: `2406:da14:271:9916:8171:bacf:d801:66f0`
2. Your network doesn't have IPv6 connectivity (ENETUNREACH error)
3. Node.js pg driver cannot establish connection

## Solution Options

### **OPTION 1: Use Supabase SQL Editor (RECOMMENDED)**

1. Open your browser and go to:
   ```
   https://supabase.com/dashboard/project/moijigidcrvbnjoaqelr/editor
   ```

2. Log in to your Supabase dashboard

3. Click on "SQL Editor" in the left sidebar

4. Run the migration script I'll provide below

5. This will create all 76+ tables needed for the CRM module

---

### **OPTION 2: Fix IPv6 Connectivity**

If you want Node.js to work, you need to either:

#### A. Enable IPv6 on your network
- Contact your ISP to enable IPv6
- Or use a VPN that supports IPv6

#### B. Use a machine with IPv6 support
- Deploy from a Linux server or cloud VM
- Use WSL2 on Windows which has better IPv6 support

---

### **OPTION 3: Install PostgreSQL Client Tools**

Install `psql` command-line tool which might have better IPv6 support:

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Install only the command-line tools
3. Run:
   ```powershell
   $env:PGPASSWORD='Akshita@19822'
   psql -h db.moijigidcrvbnjoaqelr.supabase.co -U postgres -d postgres -p 5432 -f migration.sql
   ```

---

## Quick Start: Generate SQL Migration

Run this command to generate the complete SQL migration file:

```powershell
npm run typeorm schema:sync -- --dataSource=src/database/data-source.ts
```

OR manually execute in Supabase SQL Editor:

I'll generate a comprehensive CREATE TABLE script next that you can copy-paste.

---

## Entity Count: 76+ Tables

The following tables will be created:

### Core CRM (15 tables)
- customers
- leads
- opportunities
- contacts
- accounts
- sales_pipelines
- pipeline_stages
- territories
- customer_segments
- tags
- notes
- tasks
- activities
- events
- reminders

### Marketing (10 tables)
- marketing_campaigns
- email_campaigns
- email_sequences
- email_templates
- email_tracking
- email_logs
- forms
- form_submissions
- form_fields
- marketing_analytics

### Sales (5 tables)
- sales_quotes
- sales_sequences
- sequence_enrollments
- products
- product_categories

### Support (5 tables)
- support_tickets
- portal_tickets
- slas
- knowledge_base_articles
- call_recordings

### Documents (8 tables)
- documents
- document_versions
- document_signatures
- contracts
- templates
- folders
- document_permissions
- document_logs

### Analytics & Reporting (5 tables)
- reports
- report_schedules
- analytics_snapshots
- dashboards
- dashboard_widgets

### Security & Identity (10 tables)
- users
- roles
- permissions
- tenants
- security_audit_logs
- security_policies
- security_incidents
- access_controls
- compliance_records
- data_retention_policies

### Advanced Features (10+ tables)
- customer_digital_twins
- customer_experiences
- holographic_sessions
- customer_insights
- workflows
- workflow_steps
- business_rules
- import_jobs
- export_jobs
- integrations

### Telephony (8 tables)
- calls
- call_queues
- phone_numbers
- ivr_menus
- voicemails
- call_analytics
- call_scripts
- dialer_campaigns

### Mobile & Offline (5 tables)
- mobile_devices
- push_notifications
- offline_syncs
- mobile_settings
- mobile_audit_logs

---

## Next Steps

1. Choose one of the options above
2. Execute the SQL migration
3. Verify table creation with:
   ```sql
   SELECT COUNT(*) as table_count 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_type = 'BASE TABLE';
   ```

4. List all tables:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_type = 'BASE TABLE'
   ORDER BY table_name;
   ```
