const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'cognexia_crm',
  user: 'postgres',
  password: 'Akshita@19822'
});

async function checkAdmin() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // First check if user table exists
    const tableCheck = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%user%'`
    );
    console.log('\nTables with "user" in name:', tableCheck.rows.map(r => r.table_name));
    
    const result = await client.query(
      'SELECT id, email, "firstName", "lastName", "userType", "isActive", "isEmailVerified", "passwordHash" FROM "users" WHERE email = $1',
      ['admin@cognexiaai.com']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Admin user does NOT exist');
    } else {
      console.log('✅ Admin user found:');
      console.log('  ID:', result.rows[0].id);
      console.log('  Email:', result.rows[0].email);
      console.log('  Name:', result.rows[0].firstName, result.rows[0].lastName);
      console.log('  User Type:', result.rows[0].userType);
      console.log('  Is Active:', result.rows[0].isActive);
      console.log('  Is Email Verified:', result.rows[0].isEmailVerified);
      console.log('  Has Password:', result.rows[0].passwordHash ? 'Yes' : 'No');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAdmin();
