import { config } from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';

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

async function cleanup() {
  try {
    await AppDataSource.initialize();
    
    console.log('🧹 Cleaning up test data...\n');
    
    // Delete audit logs for test org
    await AppDataSource.query(`
      DELETE FROM audit_logs WHERE organization_id IN (
        SELECT id FROM organizations WHERE name = 'Test Company Inc'
      )
    `);
    console.log('✓ Deleted audit logs');
    
    // Delete test user
    await AppDataSource.query(`
      DELETE FROM users WHERE email = 'test@example.com'
    `);
    console.log('✓ Deleted test user');
    
    // Delete test organization
    await AppDataSource.query(`
      DELETE FROM organizations WHERE name = 'Test Company Inc'
    `);
    console.log('✓ Deleted test organization');
    
    console.log('\n✅ Cleanup complete!\n');
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanup();
