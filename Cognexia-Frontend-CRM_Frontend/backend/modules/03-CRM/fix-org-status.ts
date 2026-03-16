import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

async function fixOrgStatus() {
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

    // First, let's see what organizations exist and their status
    console.log('Checking organizations...');
    const orgs = await dataSource.query(
      `SELECT id, name, status, "subscriptionStatus" FROM organizations`
    );
    
    console.log(`Found ${orgs.length} organization(s):\n`);
    orgs.forEach((org, i) => {
      console.log(`${i + 1}. ${org.name}`);
      console.log(`   ID: ${org.id}`);
      console.log(`   Status: ${org.status || 'NULL'}`);
      console.log(`   Subscription: ${org.subscriptionStatus || 'NULL'}\n`);
    });

    // Activate all organizations
    console.log('Activating all organizations...');
    await dataSource.query(`
      UPDATE organizations 
      SET 
        status = 'active',
        "subscriptionStatus" = 'active'
      WHERE status IS NULL OR status != 'active'
    `);
    console.log('✅ All organizations activated!\n');

    console.log('🎉 Organizations are now active!');

    await dataSource.destroy();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixOrgStatus();
