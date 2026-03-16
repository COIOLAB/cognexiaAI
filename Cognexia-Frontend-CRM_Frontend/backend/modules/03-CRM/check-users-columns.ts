import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkUsersColumns() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME || 'cognexia_crm',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 users table columns:');
    columns.rows.forEach(row => {
      console.log(`   • ${row.column_name} (${row.data_type})`);
    });
    
    await client.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

checkUsersColumns();
