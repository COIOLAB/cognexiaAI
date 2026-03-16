const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'cognexia_crm',
  user: 'postgres',
  password: 'Akshita@19822'
});

async function fixAdmin() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Update admin user to set isEmailVerified to true
    const result = await client.query(
      'UPDATE "users" SET "isEmailVerified" = true WHERE email = $1 RETURNING id, email, "isEmailVerified"',
      ['admin@cognexiaai.com']
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Admin user email verified successfully');
      console.log('  ID:', result.rows[0].id);
      console.log('  Email:', result.rows[0].email);
      console.log('  Is Email Verified:', result.rows[0].isEmailVerified);
    } else {
      console.log('❌ Admin user not found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

fixAdmin();
