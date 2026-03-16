# ⚡ **QUICK START GUIDE - 5 Minutes to Launch**

Get your complete Super Admin Portal with all 33 features running in 5 minutes!

**Choose your database:**
- [Option 1: Automated Setup Scripts](#-option-1-automated-setup-scripts-recommended) ⭐ **Recommended**
- [Option 2: Local PostgreSQL (Manual)](#-option-2-local-postgresql-manual)
- [Option 3: Supabase (Manual)](#-option-3-supabase-manual)

---

## 🚀 **OPTION 1: Automated Setup Scripts** ⭐ **Recommended**

### **For Local PostgreSQL:**

**Linux/macOS:**
```bash
chmod +x setup-local-postgresql.sh
./setup-local-postgresql.sh
```

**Windows:**
```cmd
setup-local-postgresql.bat
```

### **For Supabase:**

**Linux/macOS:**
```bash
chmod +x setup-supabase.sh
./setup-supabase.sh
```

**Windows:**
```cmd
setup-supabase.bat
```

**That's it!** The script handles everything:
- ✅ Database creation
- ✅ Running migrations
- ✅ Installing dependencies
- ✅ Creating configuration files
- ✅ Verifying setup

**After the script completes, jump to [Step 4: Start Services](#step-4-start-services)**

---

## 🐘 **OPTION 2: Local PostgreSQL (Manual)**

### **Prerequisites:**
```bash
# Check PostgreSQL is installed and running
psql --version
pg_isready

# If not installed:
# macOS:   brew install postgresql && brew services start postgresql
# Ubuntu:  sudo apt-get install postgresql && sudo systemctl start postgresql
# Windows: Download from https://www.postgresql.org/download/
```

### **Step 1: Database Setup (2 minutes)**

```bash
# Create database
psql -U postgres -c "CREATE DATABASE cognexia_crm;"

# Run both migrations
cd backend/modules/03-CRM
psql -U postgres -d cognexia_crm -f database/migrations/super-admin-features-migration.sql
psql -U postgres -d cognexia_crm -f database/migrations/advanced-features-19-33-migration.sql

# Verify tables created
psql -U postgres -d cognexia_crm -c "\dt" | grep -E "(churn|invoice|anomaly)"
```

### **Step 2: Backend Configuration**

```bash
cd backend/modules/03-CRM

# Create .env file
cat > .env << 'EOF'
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=cognexia_crm
JWT_SECRET=change-this-to-a-secure-random-string-in-production
JWT_EXPIRATION=24h
API_PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000
EOF

# Install dependencies
npm install
```

### **Step 3: Frontend Configuration**

```bash
cd frontend/super-admin-portal

# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3000/api/crm
NEXT_PUBLIC_DB_TYPE=local
EOF

# Install dependencies
npm install
```

---

## ☁️ **OPTION 3: Supabase (Manual)**

### **Prerequisites:**
1. Create a Supabase project at https://supabase.com
2. Get your credentials from: Dashboard > Settings > API
3. Whitelist your IP: Dashboard > Settings > Database

### **Step 1: Collect Supabase Credentials**

You'll need:
- **Project URL**: `https://xxxxx.supabase.co`
- **Database Host**: `db.xxxxx.supabase.co`
- **Database Password**: From your project settings
- **Anon Key**: From API settings
- **Service Role Key**: From API settings

### **Step 2: Run Migrations on Supabase**

```bash
# Set your Supabase password
export SUPABASE_PASSWORD="your-supabase-password"
export SUPABASE_HOST="db.xxxxx.supabase.co"

# Run migrations
cd backend/modules/03-CRM
psql "postgresql://postgres:$SUPABASE_PASSWORD@$SUPABASE_HOST:5432/postgres" \
  -f database/migrations/super-admin-features-migration.sql

psql "postgresql://postgres:$SUPABASE_PASSWORD@$SUPABASE_HOST:5432/postgres" \
  -f database/migrations/advanced-features-19-33-migration.sql

# Verify tables
psql "postgresql://postgres:$SUPABASE_PASSWORD@$SUPABASE_HOST:5432/postgres" \
  -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
```

### **Step 3: Backend Configuration**

```bash
cd backend/modules/03-CRM

# Create .env file with Supabase credentials
cat > .env << EOF
DATABASE_HOST=db.xxxxx.supabase.co
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your-supabase-password
DATABASE_NAME=postgres

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRATION=24h
API_PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000
EOF

# Install dependencies
npm install
```

### **Step 4: Frontend Configuration**

```bash
cd frontend/super-admin-portal

# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3000/api/crm
NEXT_PUBLIC_DB_TYPE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EOF

# Install dependencies
npm install
```

---

## 🚀 **Step 4: Start Services**

### **Terminal 1: Start Backend**

```bash
cd backend/modules/03-CRM
npm run start:dev
```

**Expected output:**
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] LOG [RoutesResolver] CRMController {/api/crm}:
[Nest] LOG [NestApplication] Nest application successfully started
```

**Backend running:** http://localhost:3000

### **Terminal 2: Start Frontend**

```bash
cd frontend/super-admin-portal
npm run dev
```

**Expected output:**
```
- Local:        http://localhost:3001
- Network:      http://192.168.x.x:3001

✓ Ready in 2.5s
```

**Frontend running:** http://localhost:3001

---

## ✅ **Step 5: Verify Installation**

---

## ✅ **Verify Installation**

### **Quick Test:**

1. **Backend Health:**
   ```bash
   curl http://localhost:3000/health
   # Expected: {"status":"ok"}
   ```

2. **Frontend Access:**
   - Open: http://localhost:3001
   - Should see dashboard with 33 features in sidebar

3. **API Documentation:**
   - Open: http://localhost:3000/api/docs
   - Should see Swagger UI with all endpoints

---

## 🎯 **First Steps After Launch**

### **1. Explore the Features:**

Navigate through all 12 sections in the sidebar:

- **Core** (4): Dashboard, Organizations, Users, Billing
- **Analytics** (4): Platform Analytics, Revenue, Health, Feature Usage
- **AI** (5): Predictions, Recommendations, NL Query, Anomalies, Health v2
- **Management** (1): User Impersonation
- **Security** (1): Security Center
- **Operations** (3): Tickets, Communication, Workflows
- **Configuration** (3): System Config, API Management, White-Label
- **Advanced** (6): Reports, Regions, Onboarding, KPIs, A/B, Mobile
- **Infrastructure** (4): DB Console, Audit, Performance, DR
- **Financial** (2): Financial Analytics, Invoices
- **Success** (2): CS Milestones, Support Analytics
- **Developer** (2): Dev Portal, Releases

### **2. Try Key Features:**

**AI-Powered Predictions:**
```bash
# Generate churn prediction
curl -X POST http://localhost:3000/api/crm/predictive-analytics/predict-churn/org-id
```

**Smart Recommendations:**
```bash
# Get recommendations
curl http://localhost:3000/api/crm/recommendations
```

**Anomaly Detection:**
```bash
# View anomaly dashboard
curl http://localhost:3000/api/crm/anomalies/dashboard
```

### **3. Create Test Data:**

Use the demo data service to populate with sample data:
```bash
curl -X POST http://localhost:3000/api/crm/demo/seed
```

---

## 🐛 **Troubleshooting**

### **Backend won't start:**
```bash
# Check database connection
psql -U postgres -d cognexia_crm -c "SELECT 1;"

# Check if port 3000 is available
lsof -i :3000

# View logs
cd backend/modules/03-CRM
npm run start:dev 2>&1 | tee error.log
```

### **Frontend won't start:**
```bash
# Check if port 3001 is available
lsof -i :3001

# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

### **Database connection errors:**
```bash
# Verify PostgreSQL is running
pg_isready

# Test connection
psql -U postgres -d cognexia_crm -c "SELECT version();"

# Check .env file
cat backend/modules/03-CRM/.env
```

### **API 404 errors:**
- Verify backend is running on port 3000
- Check NEXT_PUBLIC_API_URL in frontend/.env.local
- Ensure CORS is configured correctly

---

## 📚 **Next Steps**

1. **Read Full Documentation:**
   - `SUPER_ADMIN_FEATURES_COMPLETE_GUIDE.md` - Features 1-18
   - `ADVANCED_FEATURES_19-33_COMPLETE_IMPLEMENTATION.md` - Features 19-33
   - `DEPLOYMENT_CHECKLIST.md` - Production deployment

2. **Configure Your System:**
   - Set up authentication
   - Configure email notifications
   - Set up backup schedules
   - Configure monitoring

3. **Customize:**
   - Add your branding (White-Label feature)
   - Configure system settings
   - Set up user roles and permissions
   - Configure integrations

---

## 🎉 **You're All Set!**

You now have a **world-class Super Admin Portal** with:

✅ **33 Enterprise Features**  
✅ **150+ API Endpoints**  
✅ **AI-Powered Intelligence**  
✅ **Real-time Monitoring**  
✅ **Complete Audit Trail**  
✅ **Advanced Analytics**  
✅ **Developer Tools**  

**Time to explore and enjoy your new super-powered admin portal!** 🚀

---

## 💡 **Pro Tips**

1. **Use the Natural Language Query** to ask questions about your data in plain English
2. **Set up Anomaly Detection alerts** to catch issues before they become problems
3. **Enable AI Churn Predictions** to proactively retain customers
4. **Use the Developer Sandbox** to test integrations safely
5. **Review Audit Logs regularly** for security and compliance

---

## 📞 **Need Help?**

- **Documentation:** See `/docs` folder
- **API Reference:** http://localhost:3000/api/docs
- **Community:** [Your community link]
- **Support:** [Your support email]

**Happy Admin-ing! 🎊**
