import { NestFactory } from '@nestjs/core';
import { CRMModule } from './src/crm.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  console.log('🔍 Checking Database Tables...\n');

  const app = await NestFactory.createApplicationContext(CRMModule);
  const dataSource = app.get(DataSource);

  try {
    // Check connection
    console.log('📡 Database Connection:');
    console.log('   Type:', dataSource.options.type);
    console.log('   Host:', (dataSource.options as any).host || 'N/A');
    console.log('   Database:', (dataSource.options as any).database || 'N/A');
    console.log('   Connected:', dataSource.isInitialized);
    console.log('');

    // Check if key tables exist
    console.log('🔍 Checking for key tables...\n');
    
    const requiredTables = [
      'organization',
      'user',
      'customer',
      'lead',
      'opportunity',
      'marketing_campaign',
      'support_ticket',
      'contract',
      'product'
    ];

    const existingTables: string[] = [];
    const missingTables: string[] = [];

    for (const table of requiredTables) {
      try {
        const result = await dataSource.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          ) as exists
        `, [table]);

        if (result[0].exists) {
          existingTables.push(table);
          console.log(`   ✅ ${table} - EXISTS`);
        } else {
          missingTables.push(table);
          console.log(`   ❌ ${table} - MISSING`);
        }
      } catch (error) {
        missingTables.push(table);
        console.log(`   ❌ ${table} - ERROR: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log(`📊 Summary: ${existingTables.length}/${requiredTables.length} key tables exist`);
    console.log('='.repeat(80));

    if (missingTables.length > 0) {
      console.log('\n⚠️  Missing tables detected!');
      console.log('\n🔧 Creating missing tables...');
      
      try {
        console.log('   Running TypeORM synchronize...');
        await dataSource.synchronize();
        console.log('   ✅ Database synchronized successfully!');
        
        // Verify tables were created
        console.log('\n🔍 Verifying table creation...');
        let allCreated = true;
        for (const table of missingTables) {
          const result = await dataSource.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = $1
            ) as exists
          `, [table]);

          if (result[0].exists) {
            console.log(`   ✅ ${table} - NOW EXISTS`);
          } else {
            console.log(`   ❌ ${table} - STILL MISSING`);
            allCreated = false;
          }
        }

        if (allCreated) {
          console.log('\n🎉 All tables created successfully!');
        } else {
          console.log('\n⚠️  Some tables could not be created. Check entity definitions.');
        }

      } catch (syncError) {
        console.error('\n❌ Synchronization failed:', syncError.message);
        console.error('   Stack:', syncError.stack);
      }
    } else {
      console.log('\n✅ All key tables exist!');
    }

    // Show total table count
    console.log('\n📊 Total tables in database:');
    const allTables = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`   ${allTables.length} total tables found\n`);
    
    if (allTables.length > 0) {
      console.log('📋 All tables:');
      allTables.forEach((table: any, index: number) => {
        console.log(`   ${(index + 1).toString().padStart(3, ' ')}. ${table.table_name}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ DATABASE CHECK COMPLETE');
    console.log('='.repeat(80));
    console.log('\n💡 Next step: Run "npx ts-node create-test-user-org.ts" to create test user\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await app.close();
  }
}

bootstrap().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
