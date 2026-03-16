# 🗄️ **Database Setup Guide - Choose Your Option**

## **Two Database Options Available**

Choose between **Local PostgreSQL** or **Supabase** based on your needs.

---

## 📊 **Comparison: Local PostgreSQL vs Supabase**

| Feature | Local PostgreSQL | Supabase |
|---------|-----------------|----------|
| **Cost** | Free (self-hosted) | Free tier available, paid plans for scale |
| **Setup Time** | 5 minutes | 5 minutes + account creation |
| **Scalability** | Manual scaling | Auto-scaling |
| **Backup** | Manual | Automated |
| **Maintenance** | Self-managed | Fully managed |
| **Performance** | Local = fastest | Cloud = network dependent |
| **Security** | Self-managed | Enterprise-grade |
| **Real-time** | Custom implementation | Built-in real-time |
| **Best For** | Development, small deployments | Production, scaling needs |

---

## 🎯 **Which Should You Choose?**

### **Choose Local PostgreSQL if:**
✅ You're developing locally  
✅ You want complete control  
✅ You don't want external dependencies  
✅ You're familiar with PostgreSQL administration  
✅ You're building a proof-of-concept  
✅ You prefer self-hosted solutions  

**Recommended for:** Development, testing, small deployments

### **Choose Supabase if:**
✅ You want fully managed database  
✅ You need automatic backups  
✅ You want real-time features  
✅ You're deploying to production  
✅ You want to scale automatically  
✅ You prefer cloud-based solutions  
✅ You need built-in authentication  

**Recommended for:** Production, scaling applications, teams

---

## 🚀 **Quick Start Commands**

### **Option 1: Local PostgreSQL**

**Automated (Recommended):**
```bash
# Linux/macOS
./setup-local-postgresql.sh

# Windows
setup-local-postgresql.bat
```

**Manual:**
See [QUICK_START.md](./QUICK_START.md#-option-2-local-postgresql-manual)

### **Option 2: Supabase**

**Prerequisites:**
1. Create account at https://supabase.com
2. Create new project
3. Get credentials from Dashboard > Settings > API

**Automated (Recommended):**
```bash
# Linux/macOS
./setup-supabase.sh

# Windows
setup-supabase.bat
```

**Manual:**
See [QUICK_START.md](./QUICK_START.md#-option-3-supabase-manual)

---

## 🔄 **Switching Between Databases**

You can switch between Local PostgreSQL and Supabase anytime:

### **From Local to Supabase:**

1. **Export your data:**
   ```bash
   pg_dump -U postgres cognexia_crm > backup.sql
   ```

2. **Run Supabase setup:**
   ```bash
   ./setup-supabase.sh
   ```

3. **Import your data:**
   ```bash
   psql "postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres" < backup.sql
   ```

4. **Update .env files** to use Supabase credentials

### **From Supabase to Local:**

1. **Export from Supabase:**
   ```bash
   pg_dump "postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres" > backup.sql
   ```

2. **Run Local setup:**
   ```bash
   ./setup-local-postgresql.sh
   ```

3. **Import your data:**
   ```bash
   psql -U postgres cognexia_crm < backup.sql
   ```

4. **Update .env files** to use local credentials

---

## 📁 **Configuration Files**

### **Backend (.env)**

**Local PostgreSQL:**
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=cognexia_crm
```

**Supabase:**
```env
DATABASE_HOST=db.xxxxx.supabase.co
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your-supabase-password
DATABASE_NAME=postgres
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### **Frontend (.env.local)**

**Local PostgreSQL:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/crm
NEXT_PUBLIC_DB_TYPE=local
```

**Supabase:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/crm
NEXT_PUBLIC_DB_TYPE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🔐 **Security Considerations**

### **Local PostgreSQL:**
- Change default password
- Configure firewall rules
- Enable SSL/TLS for production
- Regular backups
- Keep PostgreSQL updated

### **Supabase:**
- Never commit service role key
- Whitelist IPs in production
- Enable Row Level Security (RLS)
- Configure proper authentication
- Monitor usage in dashboard

---

## 🛠️ **Troubleshooting**

### **Local PostgreSQL Issues:**

**Can't connect:**
```bash
# Check if running
pg_isready

# Check password
psql -U postgres -d cognexia_crm -c "SELECT 1;"

# Reset password (if needed)
# macOS/Linux: sudo -u postgres psql
# ALTER USER postgres PASSWORD 'newpassword';
```

**Port already in use:**
```bash
# Find process on port 5432
lsof -i :5432  # macOS/Linux
netstat -ano | findstr :5432  # Windows

# Stop PostgreSQL
# macOS: brew services stop postgresql
# Linux: sudo systemctl stop postgresql
# Windows: Services -> postgresql -> Stop
```

### **Supabase Issues:**

**Can't connect:**
1. Verify password is correct
2. Check IP whitelist in Supabase Dashboard
3. Verify database host format: `db.xxxxx.supabase.co`
4. Check if project is paused (free tier)

**Slow queries:**
1. Enable connection pooling
2. Check database usage in dashboard
3. Upgrade plan if needed
4. Add indexes to tables

**Connection limit reached:**
1. Go to Dashboard > Settings > Database
2. Enable connection pooling
3. Use pooler connection string

---

## 📊 **Performance Tips**

### **Local PostgreSQL:**
```bash
# Optimize for development
# Add to postgresql.conf:
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

### **Supabase:**
1. **Enable Connection Pooling:**
   - Dashboard > Settings > Database > Connection Pooling
   
2. **Use Transaction Mode for APIs:**
   - Use pooler connection string for API calls
   
3. **Monitor Usage:**
   - Dashboard > Reports
   - Check for slow queries
   
4. **Upgrade if needed:**
   - Free tier: 500MB database
   - Pro tier: 8GB database

---

## 🎯 **Recommended Setup by Use Case**

### **Development:**
```
✅ Local PostgreSQL
- Faster (no network latency)
- Full control
- No external dependencies
```

### **Small Production (< 100 users):**
```
✅ Local PostgreSQL OR Supabase Free Tier
- Local: If you have infrastructure
- Supabase: If you want managed solution
```

### **Medium Production (100-10,000 users):**
```
✅ Supabase Pro
- Automated backups
- Better performance
- Monitoring included
```

### **Large Production (10,000+ users):**
```
✅ Supabase Pro/Enterprise OR Self-hosted cluster
- Scale based on needs
- Consider read replicas
- Load balancing
```

---

## 📞 **Need Help?**

### **Local PostgreSQL:**
- Official Docs: https://www.postgresql.org/docs/
- Community: https://www.postgresql.org/community/

### **Supabase:**
- Official Docs: https://supabase.com/docs
- Community: https://github.com/supabase/supabase/discussions
- Discord: https://discord.supabase.com

---

## ✅ **Next Steps**

After choosing and setting up your database:

1. **Verify setup:**
   ```bash
   # Check tables created
   psql -U postgres -d cognexia_crm -c "\dt"  # Local
   # OR
   psql "postgresql://postgres:PASS@db.xxx.supabase.co:5432/postgres" -c "\dt"  # Supabase
   ```

2. **Start services:**
   - Follow [QUICK_START.md](./QUICK_START.md#step-4-start-services)

3. **Open portal:**
   - http://localhost:3001

4. **Explore features:**
   - All 33 features available!

---

**Choose your database and get started!** 🚀
