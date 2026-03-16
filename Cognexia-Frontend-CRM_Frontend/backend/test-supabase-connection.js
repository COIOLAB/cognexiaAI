/**
 * Supabase Connection Test Script
 * Run this to verify your Supabase connection works
 * 
 * Usage:
 * 1. Fill in your credentials below (lines 11-16)
 * 2. Run: node test-supabase-connection.js
 */

// ====================================
// FILL IN YOUR CREDENTIALS HERE
// ====================================
const SUPABASE_URL = 'postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres';

// Alternative: Fill individual fields
const CONFIG = {
  host: 'db.[PROJECT-REF].supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'YOUR_PASSWORD_HERE',
  ssl: { rejectUnauthorized: false }
};

// ====================================
// TEST SCRIPT (Don't modify below)
// ====================================

const { Client } = require('pg');

async function testConnection() {
  console.log('\n🔍 Testing Supabase Connection...\n');

  // Try connection string first
  let client;
  
  if (SUPABASE_URL.includes('[PROJECT-REF]')) {
    console.log('⚠️  Using individual config (connection string not filled)');
    if (CONFIG.host.includes('[PROJECT-REF]')) {
      console.error('\n❌ ERROR: Please fill in your credentials in this file first!');
      console.error('   Edit lines 11-20 with your Supabase details\n');
      process.exit(1);
    }
    client = new Client(CONFIG);
  } else {
    console.log('✅ Using connection string');
    client = new Client({
      connectionString: SUPABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }

  try {
    // Test 1: Connect
    console.log('📡 Connecting to Supabase...');
    await client.connect();
    console.log('✅ Connection established!\n');

    // Test 2: Check server time
    console.log('⏰ Testing query execution...');
    const timeResult = await client.query('SELECT NOW() as current_time, version() as db_version');
    console.log('✅ Query executed successfully!');
    console.log('   Server time:', timeResult.rows[0].current_time);
    console.log('   Database:', timeResult.rows[0].db_version.split(',')[0], '\n');

    // Test 3: Check existing tables
    console.log('📋 Checking existing tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('⚠️  No tables found yet (this is normal for new projects)');
      console.log('   Tables will be created when you run your backend\n');
    } else {
      console.log(`✅ Found ${tablesResult.rows.length} existing tables:`);
      tablesResult.rows.forEach((row, i) => {
        console.log(`   ${i + 1}. ${row.table_name}`);
      });
      console.log('');
    }

    // Test 4: Check connection limit
    console.log('🔌 Checking database info...');
    const infoResult = await client.query(`
      SELECT 
        (SELECT count(*) FROM pg_stat_activity) as active_connections,
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
    `);
    console.log('✅ Database info:');
    console.log(`   Active connections: ${infoResult.rows[0].active_connections}`);
    console.log(`   Max connections: ${infoResult.rows[0].max_connections}\n`);

    // Success summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SUCCESS! Supabase is ready to use!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Next steps:');
    console.log('1. Copy your credentials to backend/.env');
    console.log('2. Set USE_SUPABASE=true in .env');
    console.log('3. Run: npm run start:dev\n');

  } catch (error) {
    console.error('\n❌ CONNECTION FAILED!\n');
    console.error('Error details:', error.message);
    console.error('\nCommon solutions:');
    console.error('1. Check your connection string/credentials');
    console.error('2. Verify database password is correct');
    console.error('3. Try using the Pooler connection string (port 6543)');
    console.error('4. Check if your IP is whitelisted in Supabase settings\n');
    console.error('Full error:', error);
  } finally {
    await client.end();
    console.log('🔌 Connection closed\n');
  }
}

// Run the test
testConnection().catch(console.error);
