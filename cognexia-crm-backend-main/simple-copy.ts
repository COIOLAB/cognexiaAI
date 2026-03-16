import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

async function simpleCopy() {
  console.log('🔧 Copying test user to plural tables...\n');

  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME || 'cognexia_crm',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Connected\n');

    const creds = JSON.parse(fs.readFileSync('./test-credentials.json', 'utf8'));
    
    // Get the org from singular table
    const org = await client.query('SELECT * FROM organization WHERE id = $1', [creds.organizationId]);
    if (org.rows.length === 0) {
      console.error('❌ Org not found in organization table');
      process.exit(1);
    }
    
    console.log('✅ Found org in singular table:', org.rows[0].name);
    
    // Check if org already exists in plural table
    const orgExists = await client.query('SELECT id FROM organizations WHERE id = $1', [creds.organizationId]);
    if (orgExists.rows.length === 0) {
      // Insert into plural table
      await client.query(`
        INSERT INTO organizations (id, name, email, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, NOW(), NOW())
      `, [org.rows[0].id, org.rows[0].name + '_test', 'admin@test.com']);
      console.log('✅ Copied org to organizations table\n');
    } else {
      console.log('✅ Org already exists in organizations table\n');
    }
    
    // Get user from singular table
    const user = await client.query('SELECT * FROM "user" WHERE id = $1', [creds.userId]);
    if (user.rows.length === 0) {
      console.error('❌ User not found');
      process.exit(1);
    }
    
    console.log('✅ Found user in singular table:', user.rows[0].email);
    
    // Insert into plural table
    await client.query(`
      INSERT INTO users (id, email, "firstName", "lastName", "passwordHash", roles, "organizationId", "isActive", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, true, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET 
        id = EXCLUDED.id,
        "firstName" = EXCLUDED."firstName",
        "lastName" = EXCLUDED."lastName",
        "passwordHash" = EXCLUDED."passwordHash",
        roles = EXCLUDED.roles,
        "organizationId" = EXCLUDED."organizationId"
    `, [user.rows[0].id, user.rows[0].email, user.rows[0].firstName || 'Test', user.rows[0].lastName || 'Admin', user.rows[0].password, JSON.stringify(user.rows[0].roles), creds.organizationId]);
    
    console.log('✅ Copied user to users table\n');
    
    // Verify
    const orgCheck = await client.query('SELECT COUNT(*) FROM organizations WHERE id = $1', [creds.organizationId]);
    const userCheck = await client.query('SELECT COUNT(*) FROM users WHERE id = $1', [creds.userId]);
    
    console.log('📊 Verification:');
    console.log(`   • organizations: ${orgCheck.rows[0].count} record(s)`);
    console.log(`   • users: ${userCheck.rows[0].count} record(s)`);
    
    await client.end();
    console.log('\n✅ Done!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

simpleCopy();
