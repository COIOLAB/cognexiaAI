import { config } from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';

// Load .env file
config({ path: resolve(__dirname, '.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'cognexia_crm',
  synchronize: false,
});

async function clearAuditLogs() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    await AppDataSource.query('TRUNCATE TABLE audit_logs CASCADE');
    console.log('✓ Cleared audit_logs table');

    await AppDataSource.destroy();
    console.log('✅ Done');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearAuditLogs();
