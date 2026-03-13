import { NestFactory } from '@nestjs/core';
import { CRMModule } from './src/crm.module';
import { DataSource } from 'typeorm';

async function syncDatabase() {
  console.log('🔄 Starting database synchronization...\n');
  
  try {
    // Create NestJS application context
    const app = await NestFactory.create(CRMModule, {
      logger: ['error', 'warn'],
    });

    // Get DataSource from the application
    const dataSource = app.get(DataSource);
    
    console.log('📊 Database Info:');
    console.log(`   Host: ${dataSource.options['host']}`);
    console.log(`   Database: ${dataSource.options['database']}`);
    console.log(`   Type: ${dataSource.options.type}\n`);

    if (!dataSource.isInitialized) {
      console.log('⚠️  DataSource not initialized, initializing now...');
      await dataSource.initialize();
    }

    // Run synchronization
    console.log('🔨 Synchronizing database schema...');
    await dataSource.synchronize(false); // false = don't drop existing tables
    
    console.log('✅ Database synchronization complete!\n');

    // Query to check tables
    const tables = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`📋 Total tables in database: ${tables.length}`);
    
    // Check for key CRM tables
    const keyTables = [
      'organizations', 'users', 'crm_customers', 'crm_leads', 
      'crm_opportunities', 'marketing_campaigns', 'support_tickets',
      'crm_contracts', 'products'
    ];
    
    console.log('\n🔍 Key CRM Tables Check:');
    for (const table of keyTables) {
      const exists = tables.some((t: any) => t.table_name === table);
      console.log(`   ${exists ? '✅' : '❌'} ${table}`);
    }

    await app.close();
    console.log('\n✅ Database sync completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during database synchronization:', error);
    process.exit(1);
  }
}

syncDatabase();
