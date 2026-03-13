import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from backend root
config({ path: resolve(__dirname, '../../.env') });

async function createTables() {
  console.log('\n🔧 Creating CRM Tables in Supabase');
  console.log('===================================\n');

  const useSupabase = process.env.USE_SUPABASE === 'true';
  const dbUrl = process.env.SUPABASE_DATABASE_URL;

  console.log(`📍 Mode: ${useSupabase ? 'SUPABASE' : 'LOCAL'}`);
  console.log(`🔗 URL: ${dbUrl?.substring(0, 50)}...\n`);

  if (!dbUrl) {
    console.error('❌ SUPABASE_DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  // Create DataSource with all entities
  const AppDataSource = new DataSource({
    type: 'postgres',
    url: dbUrl,
    ssl: { rejectUnauthorized: false },
    entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
    synchronize: false, // Don't auto-sync, we'll do it manually
    logging: ['query', 'error', 'warn', 'schema'],
  });

  try {
    console.log('📡 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Connected to database\n');

    console.log('📋 Found entities:');
    AppDataSource.entityMetadatas.forEach((entity, index) => {
      console.log(`   ${index + 1}. ${entity.tableName} (${entity.name})`);
    });
    console.log(`\n   Total: ${AppDataSource.entityMetadatas.length} entities\n`);

    console.log('🔨 Synchronizing database schema...');
    await AppDataSource.synchronize(false); // false = don't drop existing tables
    console.log('✅ Schema synchronized successfully!\n');

    // Verify tables were created
    console.log('📊 Verifying tables in database...');
    const tables = await AppDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log(`\n✅ Found ${tables.length} tables in database:`);
    tables.forEach((table: any, index: number) => {
      console.log(`   ${index + 1}. ${table.table_name}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SUCCESS! All CRM tables created in Supabase!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error creating tables:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

createTables();
