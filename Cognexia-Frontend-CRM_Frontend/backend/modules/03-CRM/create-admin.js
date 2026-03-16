const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function createAdmin() {
  const password = 'Tata@19822';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log('Generated hash:', hashedPassword);
  
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'cognexia_crm',
    user: 'postgres',
    password: 'Akshita@19822',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const query = `
      INSERT INTO "users" (
        id,
        email,
        "passwordHash",
        "firstName",
        "lastName",
        "userType",
        "isActive",
        "emailVerified",
        "createdAt",
        "updatedAt"
      ) VALUES (
        gen_random_uuid(),
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        "passwordHash" = EXCLUDED."passwordHash",
        "userType" = EXCLUDED."userType",
        "isActive" = EXCLUDED."isActive",
        "emailVerified" = EXCLUDED."emailVerified",
        "updatedAt" = NOW()
      RETURNING id, email, "userType";
    `;

    const result = await client.query(query, [
      'admin@cognexiaai.com',
      hashedPassword,
      'Super',
      'Admin',
      'super_admin',
      true,
      true
    ]);

    console.log('Admin user created/updated successfully:');
    console.log(result.rows[0]);
    console.log('\nLogin credentials:');
    console.log('Email: admin@cognexiaai.com');
    console.log('Password: Tata@19822');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

createAdmin();
