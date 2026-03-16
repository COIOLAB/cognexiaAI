require('dotenv').config();
const { DataSource } = require('typeorm');

async function testBackendDB() {
  console.log('\n🧪 Testing Backend Database Connection');
  console.log('======================================\n');

  const useSupabase = process.env.USE_SUPABASE === 'true';
  console.log(`📍 Mode: ${useSupabase ? 'SUPABASE' : 'LOCAL'}`);
  console.log(`🔗 URL: ${process.env.SUPABASE_DATABASE_URL?.substring(0, 50)}...`);
  console.log('');

  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    synchronize: false,
    logging: false,
  });

  try {
    console.log('📡 Initializing DataSource...');
    await dataSource.initialize();
    console.log('✅ DataSource initialized!\n');

    console.log('📊 Testing query...');
    const result = await dataSource.query('SELECT NOW() as current_time, version() as db_version');
    console.log('✅ Query successful!');
    console.log(`   Time: ${result[0].current_time}`);
    console.log(`   DB: ${result[0].db_version.substring(0, 60)}...\n`);

    console.log('📋 Checking existing tables...');
    const tables = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
      LIMIT 10
    `);
    console.log(`   Found ${tables.length} table(s)`);
    if (tables.length > 0) {
      tables.forEach(t => console.log(`   - ${t.table_name}`));
    } else {
      console.log('   (Database is empty - tables will be created on first backend start)');
    }
    console.log('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SUCCESS! Backend can connect to database!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await dataSource.destroy();
  } catch (err) {
    console.error(`❌ Connection failed: ${err.message}\n`);
    console.log('Stack:', err.stack);
  }
}

testBackendDB();
