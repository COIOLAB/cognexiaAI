import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

async function fixAllMissingColumns() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME || 'postgres',
  });

  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Connected!\n');

    // Fix organizations table
    console.log('1. Fixing organizations table...');
    await dataSource.query(`
      ALTER TABLE organizations 
      ADD COLUMN IF NOT EXISTS "userTierConfig" json;
    `);
    console.log('   ✅ userTierConfig column added\n');

    // Fix audit_logs table
    console.log('2. Fixing audit_logs table...');
    
    await dataSource.query(`
      ALTER TABLE audit_logs 
      ADD COLUMN IF NOT EXISTS "user_email" varchar(255);
    `);
    console.log('   ✅ user_email column added');

    await dataSource.query(`
      ALTER TABLE audit_logs 
      ADD COLUMN IF NOT EXISTS "changes" json;
    `);
    console.log('   ✅ changes column added');

    await dataSource.query(`
      ALTER TABLE audit_logs 
      ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'success';
    `);
    console.log('   ✅ status column added');

    await dataSource.query(`
      ALTER TABLE audit_logs 
      ADD COLUMN IF NOT EXISTS "error_message" text;
    `);
    console.log('   ✅ error_message column added');

    await dataSource.query(`
      ALTER TABLE audit_logs 
      ADD COLUMN IF NOT EXISTS "request_id" uuid;
    `);
    console.log('   ✅ request_id column added\n');

    console.log('🎉 All missing columns added successfully!');

    await dataSource.destroy();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
    process.exit(1);
  }
}

fixAllMissingColumns();
