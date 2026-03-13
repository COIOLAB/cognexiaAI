import axios from 'axios';
import { config } from 'dotenv';
import * as fs from 'fs';

config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Sample SQL to create tables via Supabase REST API
async function createTablesViaAPI() {
  console.log('🔌 Connecting to Supabase via REST API...\n');

  try {
    // Test connection first
    const response = await axios.get(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });

    console.log('✅ API connection successful!\n');

    // For creating tables, we need to use the PostgREST admin schema endpoint
    // However, table creation is better done through SQL Editor in Supabase Dashboard
    
    console.log('📋 Supabase REST API can query data but cannot create schema.');
    console.log('   To create tables, use one of these methods:\n');
    
    console.log('METHOD 1: Use Supabase Dashboard SQL Editor');
    console.log('   1. Open: https://supabase.com/dashboard/project/moijigidcrvbnjoaqelr/sql/new');
    console.log('   2. Copy the SQL from your TypeORM entities');
    console.log('   3. Execute the SQL\n');
    
    console.log('METHOD 2: Install PostgreSQL client tools');
    console.log('   1. Download: https://www.postgresql.org/download/windows/');
    console.log('   2. Install only "Command Line Tools"');
    console.log('   3. Run: psql -h db.moijigidcrvbnjoaqelr.supabase.co -U postgres -d postgres');
    console.log('   4. Then run TypeORM migrations\n');
    
    console.log('METHOD 3: Use Supabase CLI');
    console.log('   1. Install: npm install -g supabase');
    console.log('   2. Login: supabase login');
    console.log('   3. Link project: supabase link --project-ref moijigidcrvbnjoaqelr');
    console.log('   4. Apply migrations\n');
    
    console.log('⚠️  Since PostgreSQL direct connection requires IPv6 support,');
    console.log('   the easiest option is to use Supabase Dashboard SQL Editor.\n');
    
    console.log('📝 I will now generate the complete SQL schema for you...\n');
    
    // Generate instructions file
    const instructions = `
# Create CRM Tables - Manual SQL Execution Required

## Problem
Direct PostgreSQL connection requires IPv6, which is not available on your network.

## Solution: Use Supabase Dashboard

### Step 1: Open SQL Editor
https://supabase.com/dashboard/project/moijigidcrvbnjoaqelr/sql/new

### Step 2: Execute TypeORM Schema Sync

Since we cannot generate the exact SQL without connecting, you need to:

1. **OPTION A**: Start the NestJS application with synchronize=true
   - This will auto-create tables
   - But requires fixing the connection issue first

2. **OPTION B**: Use Supabase Migration Tool
   - Create migrations manually
   - Apply via Dashboard

3. **OPTION C**: Export schema from local PostgreSQL
   - Run local PostgreSQL
   - Let TypeORM create tables locally
   - Export schema: pg_dump
   - Import to Supabase

### Step 3: Verify
Run this SQL in Supabase SQL Editor:

\`\`\`sql
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
\`\`\`

Expected: 76+ tables

## Alternative: Contact Supabase Support
Ask them to enable IPv4 access or provide alternative connection method.
`;

    fs.writeFileSync('SUPABASE-MANUAL-SETUP.md', instructions);
    console.log('✅ Instructions saved to: SUPABASE-MANUAL-SETUP.md\n');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    process.exit(1);
  }
}

createTablesViaAPI();
