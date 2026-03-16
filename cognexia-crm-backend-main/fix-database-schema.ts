import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

async function fixDatabaseSchema() {
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
    console.log('Connected!');

    console.log('Adding missing userTierConfig column...');
    await dataSource.query(`
      ALTER TABLE organizations 
      ADD COLUMN IF NOT EXISTS "userTierConfig" json;
    `);
    console.log('✅ Column added successfully!');

    await dataSource.destroy();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing database schema:', error);
    process.exit(1);
  }
}

fixDatabaseSchema();
