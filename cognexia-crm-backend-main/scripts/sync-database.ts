import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';
import * as glob from 'glob';

// Load environment variables
config();

async function syncDatabase() {
  console.log('🔄 Starting database synchronization...\n');
  
  // Get all entity files
  const entityFiles = glob.sync(path.join(__dirname, '../src/entities/**/*.entity.ts'));
  console.log(`📁 Found ${entityFiles.length} entity files\n`);

  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'db.moijigidcrvbnjoaqelr.supabase.co',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'Nikkisharma@143',
    database: process.env.DATABASE_NAME || 'postgres',
    entities: [path.join(__dirname, '../src/entities/**/*.entity.{ts,js}')],
    synchronize: true,
    logging: ['query', 'schema'],
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🔌 Connecting to Supabase database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully!\n');

    console.log('📊 Synchronizing schema (creating tables)...\n');
    await AppDataSource.synchronize();
    
    console.log('\n✅ Database synchronization completed!');
    console.log(`\n📈 Tables should now exist in Supabase at: ${process.env.DATABASE_HOST || 'db.moijigidcrvbnjoaqelr.supabase.co'}`);
    
    // Get table count
    const tables = await AppDataSource.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    console.log(`\n📋 Total tables in database: ${tables[0].count}`);
    
    // List all tables
    const tableList = await AppDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('\n📝 Tables created:');
    tableList.forEach((table: any, index: number) => {
      console.log(`   ${index + 1}. ${table.table_name}`);
    });

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error synchronizing database:', error);
    process.exit(1);
  }
}

syncDatabase();
