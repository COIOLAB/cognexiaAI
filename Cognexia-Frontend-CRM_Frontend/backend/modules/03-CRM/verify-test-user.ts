import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

async function verifyTestUser() {
  console.log('🔍 Verifying test user in database...\n');

  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME || 'cognexia_crm',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Read credentials file
    const credentials = JSON.parse(fs.readFileSync('./test-credentials.json', 'utf8'));
    console.log('📋 Test Credentials:');
    console.log('   User ID:', credentials.userId);
    console.log('   Email:', credentials.email);
    console.log('   Org ID:', credentials.organizationId);
    console.log('');

    // Check organization table (singular)
    console.log('🔍 Checking organization table (singular)...');
    const org1 = await client.query('SELECT * FROM organization WHERE id = $1', [credentials.organizationId]);
    console.log(`   Found ${org1.rows.length} record(s)`);
    if (org1.rows.length > 0) {
      console.log('   ✅ Organization exists in "organization" table');
      console.log('      Name:', org1.rows[0].name);
    }

    // Check organizations table (plural)
    console.log('\n🔍 Checking organizations table (plural)...');
    try {
      const org2 = await client.query('SELECT * FROM organizations WHERE id = $1', [credentials.organizationId]);
      console.log(`   Found ${org2.rows.length} record(s)`);
      if (org2.rows.length > 0) {
        console.log('   ✅ Organization exists in "organizations" table');
        console.log('      Name:', org2.rows[0].name);
      }
    } catch (error) {
      console.log('   ⚠️  organizations table does not exist');
    }

    // Check user table (singular)
    console.log('\n🔍 Checking user table (singular)...');
    const user1 = await client.query('SELECT id, email, roles, "organizationId", "isActive" FROM "user" WHERE id = $1', [credentials.userId]);
    console.log(`   Found ${user1.rows.length} record(s)`);
    if (user1.rows.length > 0) {
      console.log('   ✅ User exists in "user" table');
      console.log('      Email:', user1.rows[0].email);
      console.log('      Roles:', user1.rows[0].roles);
      console.log('      Org ID:', user1.rows[0].organizationId);
      console.log('      Active:', user1.rows[0].isActive);
    }

    // Check users table (plural)
    console.log('\n🔍 Checking users table (plural)...');
    try {
      const user2 = await client.query('SELECT id, email, roles, organization_id FROM users WHERE id = $1', [credentials.userId]);
      console.log(`   Found ${user2.rows.length} record(s)`);
      if (user2.rows.length > 0) {
        console.log('   ✅ User exists in "users" table');
        console.log('      Email:', user2.rows[0].email);
      }
    } catch (error) {
      console.log('   ⚠️  users table does not exist');
    }

    // Check what tables actually exist
    console.log('\n📋 All tables in database:');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%user%' OR table_name LIKE '%organization%')
      ORDER BY table_name
    `);
    tables.rows.forEach(row => {
      console.log('   •', row.table_name);
    });

    await client.end();
    console.log('\n✅ Verification complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    await client.end();
    process.exit(1);
  }
}

verifyTestUser();
