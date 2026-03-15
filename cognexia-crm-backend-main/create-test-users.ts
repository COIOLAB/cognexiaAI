import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as bcrypt from 'bcryptjs';

config();

async function createTestUsers() {
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

    const hashedPassword = await bcrypt.hash('Test@12345', 10);

    // Create or update super admin user
    console.log('1. Creating Super Admin user...');
    await dataSource.query(`
      INSERT INTO users (
        id, email, "passwordHash", "firstName", "lastName", 
        "userType", "isActive", "organizationId", "createdAt", "updatedAt"
      ) VALUES (
        '00000000-0000-0000-0000-000000000010',
        'superadmin@cognexiaai.com',
        $1,
        'Super',
        'Admin',
        'super_admin',
        true,
        '00000000-0000-0000-0000-000000000001',
        NOW(),
        NOW()
      )
      ON CONFLICT (email) 
      DO UPDATE SET 
        "passwordHash" = $1,
        "userType" = 'super_admin',
        "isActive" = true;
    `, [hashedPassword]);
    console.log('   ✅ Super Admin created/updated');
    console.log('      Email: superadmin@cognexiaai.com');
    console.log('      Password: Test@12345\n');

    // Create or update client admin user
    console.log('2. Creating Client Admin user...');
    await dataSource.query(`
      INSERT INTO users (
        id, email, "passwordHash", "firstName", "lastName", 
        "userType", "isActive", "organizationId", "createdAt", "updatedAt"
      ) VALUES (
        '00000000-0000-0000-0000-000000000020',
        'admin@cognexiaai.com',
        $1,
        'Client',
        'Admin',
        'org_admin',
        true,
        '00000000-0000-0000-0000-000000000001',
        NOW(),
        NOW()
      )
      ON CONFLICT (email) 
      DO UPDATE SET 
        "passwordHash" = $1,
        "userType" = 'org_admin',
        "isActive" = true;
    `, [hashedPassword]);
    console.log('   ✅ Client Admin created/updated');
    console.log('      Email: admin@cognexiaai.com');
    console.log('      Password: Test@12345\n');

    // Ensure demo organization exists
    console.log('3. Ensuring demo organization exists...');
    await dataSource.query(`
      INSERT INTO organizations (
        id, name, status, "subscriptionStatus", 
        tier, "createdAt", "updatedAt"
      ) VALUES (
        '00000000-0000-0000-0000-000000000001',
        'CognexiaAI Demo Organization',
        'active',
        'active',
        'enterprise',
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('   ✅ Demo organization ensured\n');

    console.log('🎉 Test users created successfully!');
    console.log('\n=== Login Credentials ===');
    console.log('Super Admin:');
    console.log('  Email: superadmin@cognexiaai.com');
    console.log('  Password: Test@12345');
    console.log('\nClient Admin:');
    console.log('  Email: admin@cognexiaai.com');
    console.log('  Password: Test@12345\n');

    await dataSource.destroy();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error);
    process.exit(1);
  }
}

createTestUsers();
