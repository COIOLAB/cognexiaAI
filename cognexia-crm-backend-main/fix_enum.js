const { Client } = require('pg');

async function run() {
  const client = new Client('postgresql://postgres:postgres@localhost:5432/cognexia_crm');
  try {
    await client.connect();
    
    console.log('--- Fixing enum by recreating ---');
    await client.query('BEGIN');
    
    // Rename old type
    await client.query('ALTER TYPE import_jobs_import_type_enum RENAME TO import_jobs_type_old');
    
    // Create new type with 5 values
    await client.query("CREATE TYPE import_jobs_import_type_enum AS ENUM ('customer', 'lead', 'contact', 'opportunity', 'product')");
    
    // Change column type
    await client.query('ALTER TABLE import_jobs ALTER COLUMN import_type TYPE import_jobs_import_type_enum USING import_type::text::import_jobs_import_type_enum');
    
    // Drop old type
    await client.query('DROP TYPE import_jobs_type_old');
    
    await client.query('COMMIT');
    console.log('--- Recreated enum successfully ---');
    
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('Error fixing enum:', err);
  } finally {
    if (client) await client.end();
  }
}

run();
