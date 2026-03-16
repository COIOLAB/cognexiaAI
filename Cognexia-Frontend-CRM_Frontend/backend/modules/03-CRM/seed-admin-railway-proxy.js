// Seed super admin user using Railway public database proxy
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';
const ADMIN_EMAIL = 'superadmin@cognexiaai.com';
const ADMIN_PASSWORD = 'Akshita@19822';

async function main() {
  console.log('========================================');
  console.log('Seeding Super Admin User (Railway Proxy)');
  console.log('========================================\n');

  // Parse DATABASE_URL from Railway
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:pzHOCFplHWvPofZwycStFXPmlsxIWAGC@postgres.railway.internal:5432/railway';
  
  // Replace internal hostname with public proxy
  const publicUrl = databaseUrl.replace('postgres.railway.internal', 'roundhouse.proxy.rlwy.net');
  
  console.log('Connecting to Railway database via public proxy...');
  
  const client = new Client({
    connectionString: publicUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✓ Connected to database');

    // Step 1: Ensure organization exists
    console.log('\n1. Checking organization...');
    const orgCheck = await client.query(
      'SELECT id FROM organization WHERE id = $1',
      [DEFAULT_ORG_ID]
    );

    if (orgCheck.rows.length === 0) {
      console.log('   Creating super admin organization...');
      await client.query(`
        INSERT INTO organization (
          id, name, email, "isActive", status, "subscriptionStatus", 
          "maxUsers", "currentUserCount", metadata, "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
        )
      `, [
        DEFAULT_ORG_ID,
        'CognexiaAI Super Admin Org',
        'superadmin@cognexiaai.com',
        true,
        'active',
        'active',
        999,
        1,
        JSON.stringify({ seeded: true })
      ]);
      console.log('   ✓ Organization created');
    } else {
      console.log('   ✓ Organization already exists');
    }

    // Step 2: Check if super admin user exists
    console.log('\n2. Checking super admin user...');
    const userCheck = await client.query(
      'SELECT id, email FROM "user" WHERE LOWER(email) = LOWER($1)',
      [ADMIN_EMAIL]
    );

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    if (userCheck.rows.length > 0) {
      console.log('   User exists, updating...');
      await client.query(`
        UPDATE "user"
        SET 
          "passwordHash" = $1,
          "userType" = $2,
          "organizationId" = $3,
          roles = $4,
          permissions = $5,
          "isActive" = $6,
          "isEmailVerified" = $7,
          "updatedAt" = NOW()
        WHERE LOWER(email) = LOWER($8)
      `, [
        passwordHash,
        'SUPER_ADMIN',
        DEFAULT_ORG_ID,
        JSON.stringify(['super_admin']),
        JSON.stringify(['*']),
        true,
        true,
        ADMIN_EMAIL
      ]);
      console.log('   ✓ Super admin user updated');
    } else {
      console.log('   Creating new super admin user...');
      await client.query(`
        INSERT INTO "user" (
          email, "firstName", "lastName", "passwordHash", "userType",
          "organizationId", roles, permissions, "isActive", "isEmailVerified",
          metadata, "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
        )
      `, [
        ADMIN_EMAIL.toLowerCase(),
        'Super',
        'Admin',
        passwordHash,
        'SUPER_ADMIN',
        DEFAULT_ORG_ID,
        JSON.stringify(['super_admin']),
        JSON.stringify(['*']),
        true,
        true,
        JSON.stringify({ seeded: true })
      ]);
      console.log('   ✓ Super admin user created');
    }

    console.log('\n✅ Super admin ready!');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Organization ID: ${DEFAULT_ORG_ID}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('\n✓ Database connection closed');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
