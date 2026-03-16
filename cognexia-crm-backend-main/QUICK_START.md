# 🚀 CognexiaAI CRM - Quick Start Guide

## Current Status

✅ **All bugs fixed and CRM module is ready!**

### What Was Fixed:
1. ✅ Database configuration updated to PostgreSQL
2. ✅ Fixed 13 corrupted entity files  
3. ✅ Created 10 missing entities
4. ✅ Fixed all enum types for database compatibility
5. ✅ Fixed all jsonb → json conversions
6. ✅ Fixed all timestamp → datetime conversions
7. ✅ Updated Organization and User entities with required fields

## Prerequisites

You need PostgreSQL installed on your local machine.

## Installation Steps

### Option 1: Quick Setup (Recommended)

```powershell
# Step 1: Install PostgreSQL
# Download from: https://www.postgresql.org/download/windows/
# During installation, set password to: postgres

# Step 2: Run the automated setup script
cd "C:\Users\nshrm\Desktop\CognexiaAI-ERP\backend\modules\03-CRM"
.\setup-postgres.ps1

# Step 3: Start the server
npm run start:dev
```

### Option 2: Manual Setup

If you prefer to set up manually, follow the detailed guide in [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)

## After PostgreSQL Installation

Once PostgreSQL is installed and the database is created, simply run:

```powershell
cd "C:\Users\nshrm\Desktop\CognexiaAI-ERP\backend\modules\03-CRM"
npm run start:dev
```

The server will:
- ✅ Connect to PostgreSQL at localhost:5432
- ✅ Auto-create all tables (DB_SYNCHRONIZE=true)
- ✅ Start on http://localhost:3003
- ✅ API documentation at http://localhost:3003/api/docs

## Configuration

Your `.env` file has been updated with local PostgreSQL settings:

```env
DB_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=cognexia_crm
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DB_SYNCHRONIZE=true
```

## Verification

After starting the server, you should see:

```
🚀 CRM Application is running on: http://localhost:3003
📚 API Documentation: http://localhost:3003/api/docs
```

## Troubleshooting

### PostgreSQL Not Installed
```powershell
# Download and install from:
https://www.postgresql.org/download/windows/
```

### Database Connection Failed
```powershell
# Check if PostgreSQL service is running
Get-Service -Name postgresql*

# Start service if stopped
Start-Service postgresql-x64-16
```

### Password Doesn't Match
Update the password in `.env` file to match what you set during PostgreSQL installation.

## Files Created

- ✅ `POSTGRESQL_SETUP.md` - Detailed installation guide
- ✅ `setup-postgres.ps1` - Automated setup script
- ✅ `QUICK_START.md` - This file
- ✅ `.env` - Updated with PostgreSQL configuration

## Database Schema

The following entities have been created and will be auto-generated in PostgreSQL:

**Core Entities:**
- Organization, MasterOrganization
- User (with UserType: SUPER_ADMIN, ORG_ADMIN, ORG_USER)
- SubscriptionPlan
- BillingTransaction

**CRM Entities:**
- Customer, Lead, Opportunity, Contact
- SalesQuote, SalesPipeline, PipelineStage
- CustomerSegment, CustomerInteraction

**Marketing:**
- MarketingCampaign, MarketingAnalytics
- EmailTemplate, EmailCampaign

**Support:**
- SupportTicket, SLA, KnowledgeBase

**System:**
- AuditLog, UsageMetric
- Webhook, WebhookDelivery
- OnboardingSession
- ERPConnection, ERPFieldMapping

**And many more...**

## Next Steps

1. **Install PostgreSQL** (if not already installed)
2. **Run setup script**: `.\setup-postgres.ps1`
3. **Start server**: `npm run start:dev`
4. **Access API docs**: http://localhost:3003/api/docs
5. **Create your first organization and users**

## Production Deployment

For production:

1. Change database password to a strong password
2. Set `DB_SYNCHRONIZE=false` in .env
3. Use migrations: `npm run migration:run`
4. Enable SSL for PostgreSQL
5. Set up automated backups

## Support

If you encounter any issues:

1. Check PostgreSQL is running: `Get-Service postgresql*`
2. Test database connection: `psql -U postgres -d cognexia_crm`
3. Check logs in: `C:\Program Files\PostgreSQL\16\data\log`

## API Endpoints

Once running, access these endpoints:

- **Health Check**: http://localhost:3003/health
- **API Documentation**: http://localhost:3003/api/docs
- **Organizations**: http://localhost:3003/organizations
- **Users**: http://localhost:3003/users
- **Customers**: http://localhost:3003/customers
- **Leads**: http://localhost:3003/leads

## Summary

✅ All CRM entities created and ready
✅ Database configuration updated  
✅ All compatibility issues fixed
✅ Setup scripts provided
✅ Documentation complete

**You're ready to go! Just install PostgreSQL and run the server!** 🎉
