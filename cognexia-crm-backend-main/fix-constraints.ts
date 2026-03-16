import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

async function fixConstraints() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME || 'postgres',
  });

  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Connected!\n');

    // Fix audit_logs description column - make it nullable
    console.log('1. Making audit_logs.description nullable...');
    await dataSource.query(`
      ALTER TABLE audit_logs 
      ALTER COLUMN description DROP NOT NULL;
    `);
    console.log('   ✅ audit_logs.description is now nullable\n');

    // Check if product_demos_3d table exists and handle foreign key
    console.log('2. Checking product_demos_3d foreign key...');
    const tableExists = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'product_demos_3d'
      );
    `);
    
    if (tableExists[0].exists) {
      console.log('   Table exists, setting CASCADE delete...');
      // Drop existing constraint and recreate with CASCADE
      await dataSource.query(`
        ALTER TABLE product_demos_3d 
        DROP CONSTRAINT IF EXISTS "FK_edb86ff2c3bacf28070185b525a";
      `);
      await dataSource.query(`
        ALTER TABLE product_demos_3d 
        ADD CONSTRAINT "FK_edb86ff2c3bacf28070185b525a" 
        FOREIGN KEY ("productId") 
        REFERENCES products(id) 
        ON DELETE CASCADE;
      `);
      console.log('   ✅ Foreign key updated with CASCADE delete\n');
    } else {
      console.log('   ⚠️  Table does not exist, skipping...\n');
    }

    console.log('🎉 All constraints fixed!');

    await dataSource.destroy();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing constraints:', error);
    process.exit(1);
  }
}

fixConstraints();
