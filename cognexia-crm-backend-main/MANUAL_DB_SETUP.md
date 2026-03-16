# Manual PostgreSQL Database Setup

Your PostgreSQL 18 is installed and running! Now let's create the database manually.

## Step 1: Add PostgreSQL to PATH (This Session)

Run this command first:
```powershell
$env:Path += ";C:\Program Files\PostgreSQL\18\bin"
```

## Step 2: Connect to PostgreSQL

Open a new PowerShell window and run:
```powershell
psql -U postgres
```

It will prompt for your password. Enter the password you set during PostgreSQL installation.

## Step 3: Create the Database

Once connected to PostgreSQL (you'll see `postgres=#`), run:
```sql
CREATE DATABASE cognexia_crm;
```

You should see: `CREATE DATABASE`

## Step 4: Verify Database Creation

Still in psql, list all databases:
```sql
\l
```

You should see `cognexia_crm` in the list.

## Step 5: Exit psql

```sql
\q
```

## Step 6: Update .env File

If your PostgreSQL password is NOT `postgres`, update the `.env` file:

Open `.env` and change this line:
```env
DATABASE_PASSWORD=postgres
```

To:
```env
DATABASE_PASSWORD=your_actual_password
```

Also update the DATABASE_URL line:
```env
DATABASE_URL=postgresql://postgres:your_actual_password@localhost:5432/cognexia_crm
```

## Step 7: Start the CRM Server

Now run:
```powershell
npm run start:dev
```

## Alternative: One-Line Setup (If you know your password)

Replace `YOUR_PASSWORD` with your actual password:

```powershell
$env:Path += ";C:\Program Files\PostgreSQL\18\bin"
$env:PGPASSWORD = "YOUR_PASSWORD"
psql -U postgres -c "CREATE DATABASE cognexia_crm;"
psql -U postgres -c "\l"
```

## Troubleshooting

### Forgot PostgreSQL Password?

1. Open `pg_hba.conf` file:
   ```
   C:\Program Files\PostgreSQL\18\data\pg_hba.conf
   ```

2. Find this line:
   ```
   host    all             all             127.0.0.1/32            scram-sha-256
   ```

3. Change `scram-sha-256` to `trust`:
   ```
   host    all             all             127.0.0.1/32            trust
   ```

4. Restart PostgreSQL service:
   ```powershell
   Restart-Service postgresql-x64-18
   ```

5. Connect without password:
   ```powershell
   psql -U postgres
   ```

6. Set new password:
   ```sql
   ALTER USER postgres WITH PASSWORD 'postgres';
   ```

7. Change `pg_hba.conf` back to `scram-sha-256` and restart service again.

## Quick Commands Reference

```powershell
# Add PostgreSQL to PATH (temporary)
$env:Path += ";C:\Program Files\PostgreSQL\18\bin"

# Test PostgreSQL version
psql --version

# Connect to PostgreSQL
psql -U postgres

# Create database (in psql)
CREATE DATABASE cognexia_crm;

# List databases (in psql)
\l

# Connect to specific database (in psql)
\c cognexia_crm

# Exit psql
\q
```

## Once Database is Created

Just run:
```powershell
npm run start:dev
```

The server will:
- Connect to PostgreSQL
- Auto-create all tables (DB_SYNCHRONIZE=true)
- Start on http://localhost:3003
- Show API docs at http://localhost:3003/api/docs
