# PostgreSQL Local Setup Guide

## Step 1: Download PostgreSQL

1. Visit: https://www.postgresql.org/download/windows/
2. Click on "Download the installer" (by EDB)
3. Download PostgreSQL 16.x for Windows (latest stable version)
4. Run the installer

## Step 2: Install PostgreSQL

During installation:
- **Installation Directory**: Keep default (`C:\Program Files\PostgreSQL\16`)
- **Components**: Select all (PostgreSQL Server, pgAdmin 4, Stack Builder, Command Line Tools)
- **Data Directory**: Keep default
- **Password**: Set password to `postgres` (or update .env with your chosen password)
- **Port**: Keep default `5432`
- **Locale**: Keep default

## Step 3: Verify Installation

Open PowerShell and run:
```powershell
# Check if PostgreSQL service is running
Get-Service -Name postgresql*

# Add PostgreSQL to PATH (if not already added)
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"

# Verify psql is accessible
psql --version
```

## Step 4: Create Database

Open PowerShell as Administrator and run:

```powershell
# Connect to PostgreSQL
psql -U postgres

# Once connected, run these SQL commands:
CREATE DATABASE cognexia_crm;

# Grant privileges (if needed)
GRANT ALL PRIVILEGES ON DATABASE cognexia_crm TO postgres;

# Exit psql
\q
```

## Step 5: Test Connection

```powershell
# Test connection to the new database
psql -U postgres -d cognexia_crm -c "SELECT version();"
```

## Step 6: Update Environment Variables (Already Done)

The `.env` file has been updated with:
```
DB_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=cognexia_crm
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cognexia_crm
```

## Step 7: Start the CRM Server

```powershell
cd "C:\Users\nshrm\Desktop\CognexiaAI-ERP\backend\modules\03-CRM"

# Install dependencies (if not done)
npm install

# Run database migrations (optional - DB_SYNCHRONIZE=true will auto-create tables)
npm run migration:run

# Start the server
npm run start:dev
```

## Alternative: Using Docker (If you prefer)

If you have Docker Desktop installed:

```powershell
# Run PostgreSQL in Docker
docker run --name postgres-crm `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=cognexia_crm `
  -p 5432:5432 `
  -d postgres:16

# Verify it's running
docker ps

# Connect to it
docker exec -it postgres-crm psql -U postgres -d cognexia_crm
```

## Troubleshooting

### Issue: "psql: command not found"
**Solution**: Add PostgreSQL to PATH:
```powershell
# Temporary (current session only)
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"

# Permanent (add to System Environment Variables)
[System.Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\PostgreSQL\16\bin", "Machine")
```

### Issue: "Connection refused"
**Solution**: Check if PostgreSQL service is running:
```powershell
Get-Service -Name postgresql*
Start-Service postgresql-x64-16  # Replace with actual service name
```

### Issue: "Authentication failed"
**Solution**: Update password in .env to match what you set during installation

### Issue: "Database does not exist"
**Solution**: Create the database:
```powershell
psql -U postgres -c "CREATE DATABASE cognexia_crm;"
```

## Useful PostgreSQL Commands

```sql
-- List all databases
\l

-- Connect to database
\c cognexia_crm

-- List all tables
\dt

-- Describe a table
\d table_name

-- Show all users
\du

-- Exit psql
\q
```

## pgAdmin 4 (GUI Tool)

PostgreSQL installation includes pgAdmin 4:
1. Open pgAdmin 4 from Start Menu
2. Connect to localhost
3. Enter your password
4. Navigate to Databases → Create → Database
5. Name it `cognexia_crm`

## Production Recommendations

For production deployment:

1. **Change Password**: Update from `postgres` to a strong password
2. **Create Dedicated User**:
   ```sql
   CREATE USER crm_user WITH PASSWORD 'strong_password';
   GRANT ALL PRIVILEGES ON DATABASE cognexia_crm TO crm_user;
   ```
3. **Update .env** with the new credentials
4. **Enable SSL**: Configure PostgreSQL for SSL connections
5. **Set DB_SYNCHRONIZE=false**: Use migrations instead in production
6. **Backup Strategy**: Set up automated backups
   ```powershell
   pg_dump -U postgres cognexia_crm > backup.sql
   ```

## Next Steps

Once PostgreSQL is installed and running:

1. ✅ .env file is already updated
2. ✅ Run: `npm run start:dev`
3. ✅ Server should start successfully on http://localhost:3003
4. ✅ API docs available at http://localhost:3003/api/docs

## Support

If you encounter issues:
- Check PostgreSQL logs: `C:\Program Files\PostgreSQL\16\data\log`
- Verify service status: `Get-Service postgresql*`
- Test connection: `psql -U postgres -d cognexia_crm`
