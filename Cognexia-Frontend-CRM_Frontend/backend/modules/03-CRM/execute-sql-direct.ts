import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function executeSQLDirect() {
  console.log('🔧 Connecting to PostgreSQL directly...\n');

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
    const sqlPath = path.join(__dirname, 'create-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Executing SQL script...\n');
    
    // Execute SQL
    const result = await client.query(sql);
    
    console.log('✅ SQL executed successfully!\n');
    
    // Check if tables exist now
    const checkTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('organization', 'user', 'organizations', 'users')
      ORDER BY table_name
    `);

    console.log('📋 Tables found:');
    checkTables.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name}`);
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

executeSQLDirect();
