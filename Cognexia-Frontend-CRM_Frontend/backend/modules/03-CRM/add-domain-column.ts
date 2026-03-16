import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function addDomainColumn() {
  console.log('🔧 Adding domain column to organization table...\n');

  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME || 'cognexia_crm',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Read SQL file
    const sqlPath = path.join(__dirname, 'add-domain-column.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Executing SQL script...\n');
    
    // Execute SQL
    await client.query(sql);
    
    console.log('✅ Domain column added successfully!\n');
    
    // Check columns in organization table
    const checkColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'organization'
      ORDER BY ordinal_position
    `);

    console.log('📋 Organization table columns:');
    checkColumns.rows.forEach(row => {
      console.log(`   • ${row.column_name} (${row.data_type})`);
    });

    await client.end();
    console.log('\n✅ Done!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    await client.end();
    process.exit(1);
  }
}

addDomainColumn();
