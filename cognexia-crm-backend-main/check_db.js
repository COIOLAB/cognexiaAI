const { Client } = require('pg');

async function run() {
  const client = new Client('postgresql://postgres:postgres@localhost:5432/cognexia_crm');
  try {
    await client.connect();

    console.log('--- Searching for enum usages ---');
    const res = await client.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE udt_name = 'import_jobs_import_type_enum'
    `);
    console.log('Usages:', res.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
