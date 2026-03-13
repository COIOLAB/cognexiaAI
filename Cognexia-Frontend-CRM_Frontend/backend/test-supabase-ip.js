require('dotenv').config();
const { Client } = require('pg');

async function testWithIP() {
  console.log('\n🧪 Testing Supabase with IP Address');
  console.log('====================================\n');

  // Use IP address directly to bypass DNS
  const client = new Client({
    host: '13.192.64.40',  // IP from nslookup
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD || 'Akshita@19822',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('📡 Connecting to 13.192.64.40:5432...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    console.log('📊 Running test query...');
    const result = await client.query('SELECT version();');
    console.log('✅ Query successful!');
    console.log(`   PostgreSQL: ${result.rows[0].version.substring(0, 50)}...\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SUCCESS! Supabase database is working!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await client.end();
  } catch (err) {
    console.error(`❌ Connection failed: ${err.message}\n`);
    
    if (err.message.includes('password authentication')) {
      console.log('💡 Password issue - try URL encoding special characters');
      console.log('   @ should be %40 in connection strings\n');
    } else if (err.message.includes('timeout')) {
      console.log('💡 Connection timeout - check firewall/network settings\n');
    } else if (err.message.includes('ECONNREFUSED')) {
      console.log('💡 Connection refused - database may not be accepting connections\n');
    }
  }
}

testWithIP();
