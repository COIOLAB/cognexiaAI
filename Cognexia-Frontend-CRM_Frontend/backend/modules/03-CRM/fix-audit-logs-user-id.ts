import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

async function fixAuditLogsUserId() {
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

    console.log('Making audit_logs.user_id nullable...');
    await dataSource.query(`
      ALTER TABLE audit_logs 
      ALTER COLUMN user_id DROP NOT NULL;
    `);
    console.log('✅ user_id is now nullable\n');

    console.log('Making audit_logs.action nullable (in case it has constraint)...');
    await dataSource.query(`
      ALTER TABLE audit_logs 
      ALTER COLUMN action DROP NOT NULL;
    `);
    console.log('✅ action is now nullable\n');

    console.log('🎉 Audit logs constraints fixed! Login should work now.');

    await dataSource.destroy();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixAuditLogsUserId();
