import { config } from 'dotenv';
import { Client } from 'pg';

config();

// Use Supabase direct connection (not pooler - pooler requires different auth)
const connectionString = 'postgresql://postgres:Akshita%4019822@db.moijigidcrvbnjoaqelr.supabase.co:5432/postgres';

async function createTables() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to Supabase via direct connection...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Get existing table count
    const before = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    console.log(`📊 Tables before: ${before.rows[0].count}\n`);

    await client.end();
    
    // Now use TypeORM
    const { DataSource } = require('typeorm');
    
    const AppDataSource = new DataSource({
      type: 'postgres',
      host: 'db.moijigidcrvbnjoaqelr.supabase.co',
      port: 5432,
      username: 'postgres',
      password: 'Akshita@19822',
      database: 'postgres',
      entities: [__dirname + '/src/entities/**/*.entity.{ts,js}'],
      synchronize: true,
      logging: true,
      ssl: { rejectUnauthorized: false },
    });

    console.log('🔄 Initializing TypeORM...');
    await AppDataSource.initialize();
    console.log('✅ TypeORM initialized!\n');

    console.log('📊 Synchronizing schema (creating tables)...\n');
    await AppDataSource.synchronize();
    
    // Count tables after
    const after = await AppDataSource.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    console.log(`\n✅ COMPLETE! Total tables: ${after[0].count}\n`);
    
    // List all tables
    const tables = await AppDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📝 Created tables:');
    tables.forEach((t: any, i: number) => {
      console.log(`   ${i + 1}. ${t.table_name}`);
    });

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

createTables();
