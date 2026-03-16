import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'Akshita@19822',
  database: 'cognexia_crm',
  synchronize: false,
  logging: true,
});

async function fixSuperAdminUsers() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Hash passwords
    const password1Hash = await bcrypt.hash('Test@1234', 10);
    const password2Hash = await bcrypt.hash('Akshita@19822', 10);

    // Check if users exist
    const user1 = await AppDataSource.query(
      'SELECT id, email FROM users WHERE email = $1',
      ['superadmin@cognexiaai.com']
    );

    const user2 = await AppDataSource.query(
      'SELECT id, email FROM users WHERE email = $1',
      ['admin@cognexiaai.com']
    );

    // Get or create demo organization
    let demoOrg = await AppDataSource.query(
      'SELECT id FROM organizations WHERE name = $1',
      ['CognexiaAI HQ']
    );

    if (demoOrg.length === 0) {
      await AppDataSource.query(
        `INSERT INTO organizations (id, name, email, status, "subscriptionStatus", "isActive", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), 'CognexiaAI HQ', 'hq@cognexiaai.com', 'active', 'active', true, NOW(), NOW())
         RETURNING id`
      );
      demoOrg = await AppDataSource.query(
        'SELECT id FROM organizations WHERE name = $1',
        ['CognexiaAI HQ']
      );
    }

    const orgId = demoOrg[0].id;

    // User 1: superadmin@cognexiaai.com
    if (user1.length === 0) {
      console.log('Creating superadmin@cognexiaai.com...');
      await AppDataSource.query(
        `INSERT INTO users (
          id, email, "passwordHash", "firstName", "lastName", "userType", 
          "organizationId", "isActive", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), $1, $2, 'Super', 'Admin', 'super_admin', 
          $3, true, NOW(), NOW()
        )`,
        ['superadmin@cognexiaai.com', password1Hash, orgId]
      );
      console.log('✅ Created superadmin@cognexiaai.com with password: Test@1234');
    } else {
      console.log('Updating superadmin@cognexiaai.com...');
      await AppDataSource.query(
        `UPDATE users SET 
          "passwordHash" = $1, 
          "userType" = 'super_admin',
          "isActive" = true,
          "organizationId" = $2
         WHERE email = $3`,
        [password1Hash, orgId, 'superadmin@cognexiaai.com']
      );
      console.log('✅ Updated superadmin@cognexiaai.com with password: Test@1234');
    }

    // User 2: admin@cognexiaai.com
    if (user2.length === 0) {
      console.log('Creating admin@cognexiaai.com...');
      await AppDataSource.query(
        `INSERT INTO users (
          id, email, "passwordHash", "firstName", "lastName", "userType", 
          "organizationId", "isActive", role, "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), $1, $2, 'Admin', 'User', 'super_admin', 
          $3, true, 'super_admin', NOW(), NOW()
        )`,
        ['admin@cognexiaai.com', password2Hash, orgId]
      );
      console.log('✅ Created admin@cognexiaai.com with password: Akshita@19822');
    } else {
      console.log('Updating admin@cognexiaai.com...');
      await AppDataSource.query(
        `UPDATE users SET 
          "passwordHash" = $1, 
          "userType" = 'super_admin',
          "isActive" = true,
          "organizationId" = $2
         WHERE email = $3`,
        [password2Hash, orgId, 'admin@cognexiaai.com']
      );
      console.log('✅ Updated admin@cognexiaai.com with password: Akshita@19822');
    }

    // Set organization status
    await AppDataSource.query(
      `UPDATE organizations SET 
        status = 'active',
        "subscriptionStatus" = 'active',
        "isActive" = true
       WHERE id = $1`,
      [orgId]
    );

    console.log('\n✅ All done! Both super admin users are ready.');
    console.log('\nLogin Credentials:');
    console.log('1. superadmin@cognexiaai.com / Test@1234');
    console.log('2. admin@cognexiaai.com / Akshita@19822');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixSuperAdminUsers();
