# GitHub Codespaces Setup - Create CRM Database Tables

## Quick Setup (2 minutes)

### Step 1: Open in Codespaces
1. Go to your repository on GitHub
2. Click the green **"Code"** button
3. Select **"Codespaces"** tab
4. Click **"Create codespace on main"**

### Step 2: Configure Environment
Once Codespaces opens, run in the terminal:

```bash
cd backend/modules/03-CRM
cp .env.example .env
nano .env
```

### Step 3: Update .env File
Replace these values:
```bash
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaWppZ2lkY3J2Ym5qb2FxZWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MzE1ODYsImV4cCI6MjA4MzUwNzU4Nn0.qMhUyNcux2dJs35w2eEtbmKylFJAwBm-cwCE774LSBs

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaWppZ2lkY3J2Ym5qb2FxZWxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkzMTU4NiwiZXhwIjoyMDgzNTA3NTg2fQ.6CbXFPgHOnFx6WU45n6vSs6uB-dH8-pjCKb5al0yBaA

DATABASE_PASSWORD=Akshita@19822

GROQ_API_KEY=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

OPENROUTER_API_KEY=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

JWT_SECRET=industry5.0-crm-jwt-secret-production-$(openssl rand -hex 32)
```

Save with: `Ctrl+O`, `Enter`, then `Ctrl+X`

### Step 4: Install Dependencies
```bash
npm install
```

### Step 5: Create All 76+ Tables
```bash
npm run start:dev
```

You'll see:
```
✅ Database connection initialized successfully
📊 Synchronizing schema...
✅ Created table: crm_customers
✅ Created table: crm_leads
... (76+ tables)
✅ Schema synchronization complete!
🚀 CRM Application is running
```

### Step 6: Verify Tables
Open: https://supabase.com/dashboard/project/moijigidcrvbnjoaqelr/editor

Run this SQL:
```sql
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
```

Expected: **76+ tables** ✅

---

## That's It!

Once tables are created in Supabase, they're permanent. You can now work locally on your Windows machine - the tables will already exist in the cloud database.

---

## Troubleshooting

If you get connection errors, verify:
1. `.env` file has correct credentials
2. Supabase project is active
3. No typos in DATABASE_PASSWORD

Need help? Just ask! 🚀
