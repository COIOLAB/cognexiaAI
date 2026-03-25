const { Client } = require('pg');

async function run() {
  const client = new Client('postgresql://postgres:postgres@localhost:5432/cognexia_crm');
  try {
    await client.connect();
    
    console.log('--- Dropping column and type ---');
    await client.query('BEGIN');
    
    // Drop column
    await client.query('ALTER TABLE import_jobs DROP COLUMN import_type');
    
    // Drop enum type
    await client.query('DROP TYPE IF EXISTS import_jobs_import_type_enum');
    
    await client.query('COMMIT');
    console.log('--- Successfully dropped column and type ---');
    
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
