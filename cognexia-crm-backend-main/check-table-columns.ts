import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'Akshita@19822',
  database: 'cognexia_crm',
  synchronize: false,
  logging: false,
});

async function checkColumns() {
  try {
    await AppDataSource.initialize();
    
    const result = await AppDataSource.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'support_tickets' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 support_tickets columns:');
    result.forEach((col: any) => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

checkColumns();
