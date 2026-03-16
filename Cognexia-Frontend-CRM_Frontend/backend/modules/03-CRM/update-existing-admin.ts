import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as bcrypt from 'bcryptjs';

config();

async function updateExistingAdmin() {
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

    // Check if user exists
    console.log('Checking if admin@cognexiaai.com exists...');
    const existingUser = await dataSource.query(
      `SELECT id, email, "firstName", "lastName", "userType" FROM users WHERE email = $1`,
      ['admin@cognexiaai.com']
    );

    const hashedPassword = await bcrypt.hash('Akshita@19822', 10);

    if (existingUser.length > 0) {
      console.log('✅ User found! Updating password...');
      console.log(`   Current user: ${existingUser[0].firstName} ${existingUser[0].lastName}`);
      console.log(`   Current role: ${existingUser[0].userType}`);
      
      await dataSource.query(
        `UPDATE users SET "passwordHash" = $1 WHERE email = $2`,
        [hashedPassword, 'admin@cognexiaai.com']
      );
      console.log('✅ Password updated successfully!\n');
    } else {
      console.log('❌ User not found. Creating new admin user...');
      
      await dataSource.query(`
        INSERT INTO users (
          id, email, "passwordHash", "firstName", "lastName", 
          "userType", "isActive", "organizationId", "createdAt", "updatedAt"
        ) VALUES (
          '00000000-0000-0000-0000-000000000030',
          'admin@cognexiaai.com',
          $1,
          'Admin',
          'User',
          'super_admin',
          true,
          '00000000-0000-0000-0000-000000000001',
          NOW(),
          NOW()
        )
      `, [hashedPassword]);
      console.log('✅ New admin user created!\n');
    }

    console.log('🎉 Admin account ready!');
    console.log('\n=== Login Credentials ===');
    console.log('Email: admin@cognexiaai.com');
    console.log('Password: Akshita@19822\n');

    await dataSource.destroy();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

updateExistingAdmin();
