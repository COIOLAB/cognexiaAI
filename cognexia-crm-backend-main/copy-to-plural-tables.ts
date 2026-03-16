import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function copyToPluralTables() {
  console.log('🔧 Copying data to plural tables...\n');

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

    const sqlPath = path.join(__dirname, 'copy-to-plural-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Executing SQL script...\n');
    await client.query(sql);
    
    console.log('✅ Data copied successfully!\n');

    // Verify the copy
    console.log('🔍 Verifying data in plural tables...');
    const orgsCount = await client.query('SELECT COUNT(*) FROM organizations');
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    
    console.log(`   • organizations table: ${orgsCount.rows[0].count} record(s)`);
    console.log(`   • users table: ${usersCount.rows[0].count} record(s)`);

    await client.end();
    console.log('\n✅ Done!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    await client.end();
    process.exit(1);
  }
}

copyToPluralTables();
