/**
 * Supabase Connection Diagnostic & Fix
 * This will test and fix common Supabase connection issues
 */

require('dotenv').config();
const { Client } = require('pg');

// Read from .env
const connectionString = process.env.SUPABASE_DATABASE_URL;
const projectRef = 'moijigidcrvbnjoaqelr';

console.log('\n🔍 Supabase Connection Diagnostic');
console.log('=================================\n');

async function diagnoseConnection() {
  // Test 1: Direct connection (bypassing pooler)
  console.log('📡 Test 1: Testing direct connection...');
  
  const directClient = new Client({
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await directClient.connect();
    console.log('✅ Direct connection successful!\n');
    
    // Check database version
    const versionResult = await directClient.query('SELECT version()');
    console.log('Database:', versionResult.rows[0].version.split(',')[0]);
    
    // Check if public schema exists
    const schemaCheck = await directClient.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'public'
    `);
    console.log('✅ Public schema exists:', schemaCheck.rows.length > 0);
    
    // Check existing tables
    const tablesResult = await directClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`\n📋 Existing tables: ${tablesResult.rows.length}`);
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach((row, i) => {
        console.log(`   ${i + 1}. ${row.table_name}`);
      });
    } else {
      console.log('   (No tables yet - this is normal for a new project)');
    }
    
    await directClient.end();
    
  } catch (error) {
    console.error('❌ Direct connection failed:', error.message);
    await directClient.end().catch(() => {});
  }

  // Test 2: Pooler connection
  console.log('\n📡 Test 2: Testing pooler connection...');
  
  const poolerClient = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await poolerClient.connect();
    console.log('✅ Pooler connection successful!');
    
    const result = await poolerClient.query('SELECT NOW() as time');
    console.log('   Server time:', result.rows[0].time);
    
    await poolerClient.end();
    
  } catch (error) {
    console.error('❌ Pooler connection failed:', error.message);
    
    if (error.message.includes('Tenant or user not found')) {
      console.log('\n💡 Solution: This error is common. Try these fixes:');
      console.log('   1. Use direct connection instead of pooler');
      console.log('   2. Wait a few minutes for Supabase to fully initialize');
      console.log('   3. Check if project is still being set up in dashboard');
    }
    
    await poolerClient.end().catch(() => {});
  }

  // Test 3: Check Supabase API
  console.log('\n📡 Test 3: Testing Supabase API...');
  
  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY
      }
    });
    
    if (response.ok || response.status === 404) {
      console.log('✅ Supabase API is reachable');
    } else {
      console.log('⚠️  Supabase API returned status:', response.status);
    }
  } catch (error) {
    console.error('❌ Supabase API test failed:', error.message);
  }

  // Recommendations
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 RECOMMENDATIONS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('The "Tenant or user not found" error is usually caused by:');
  console.log('1. Using the pooler connection too early (try direct connection)');
  console.log('2. Project still initializing (wait 2-3 minutes)');
  console.log('3. Password with special characters (try resetting)\n');
  
  console.log('✅ RECOMMENDED FIX:');
  console.log('Update your .env to use DIRECT connection:\n');
  console.log('Change this line:');
  console.log('  SUPABASE_DATABASE_URL=postgresql://postgres.moijigidcrvbnjoaqelr:Akshita@19822@aws-0-us-east-1.pooler.supabase.com:6543/postgres');
  console.log('\nTo this:');
  console.log('  SUPABASE_DATABASE_URL=postgresql://postgres:Akshita@19822@db.moijigidcrvbnjoaqelr.supabase.co:5432/postgres');
  console.log('\nOr update database.config.ts to use individual connection params instead of URL\n');
}

diagnoseConnection().catch(console.error);
