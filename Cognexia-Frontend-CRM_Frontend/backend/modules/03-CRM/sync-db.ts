import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

// Create data source with explicit configuration
const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  synchronize: true,
  logging: ['query', 'schema', 'error'],
  entities: ['src/entities/**/*.entity.ts'],
  extra: {
    // Force IPv4
    connectionTimeoutMillis: 30000,
  }
});

async function syncDatabase() {
  console.log('🔄 Starting database synchronization...\n');
  
  try {
    console.log('🔌 Connecting to Supabase...');
    await AppDataSource.initialize();
    console.log('✅ Database connected!\n');

    console.log('📊 Creating tables...\n');
    await AppDataSource.synchronize(true); // force drop and recreate
    
    console.log('✅ Schema synchronized!');
    
    // Count tables
    const result = await AppDataSource.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    console.log(`\n📋 Total tables created: ${result[0].count}`);
    
    // List all tables
    const tables = await AppDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('\n📝 Tables:');
    tables.forEach((t: any, i: number) => {
      console.log(`   ${i + 1}. ${t.table_name}`);
    });

    await AppDataSource.destroy();
    console.log('\n✅ Complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

syncDatabase();
