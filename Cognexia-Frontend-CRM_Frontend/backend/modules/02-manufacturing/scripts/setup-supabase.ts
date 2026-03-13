#!/usr/bin/env ts-node

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs/promises';
import * as path from 'path';

// Main setup function
async function setupSupabase() {
  const logger = new Logger('SupabaseSetup');
  
  try {
    logger.log('🚀 Starting Supabase setup for Manufacturing Module...');

    // Load environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required Supabase environment variables. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    }

    logger.log('📋 Environment variables loaded');
    logger.log(`   Supabase URL: ${supabaseUrl}`);
    logger.log(`   Service Key: ${supabaseServiceKey ? '***configured***' : 'NOT SET'}`);
    logger.log(`   Anon Key: ${supabaseAnonKey ? '***configured***' : 'NOT SET'}`);

    // Create Supabase client with service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Test connection
    logger.log('🔌 Testing Supabase connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('work_centers')
      .select('count')
      .limit(1);

    if (connectionError) {
      logger.warn('⚠️  Initial connection test failed - this is expected if tables don\'t exist yet');
      logger.warn(`   Error: ${connectionError.message}`);
    } else {
      logger.log('✅ Supabase connection successful');
    }

    // Read and execute migration script
    logger.log('📚 Reading migration script...');
    const migrationPath = path.join(__dirname, '../supabase/migration.sql');
    
    let migrationScript: string;
    try {
      migrationScript = await fs.readFile(migrationPath, 'utf-8');
      logger.log('✅ Migration script loaded successfully');
    } catch (error) {
      logger.error('❌ Failed to read migration script');
      throw error;
    }

    // Split migration into individual statements
    const statements = migrationScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    logger.log(`🔧 Executing ${statements.length} migration statements...`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.trim() === '') {
        continue;
      }

      try {
        // Execute each statement using RPC
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        
        if (error) {
          // Some errors are expected (like type already exists)
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist') ||
              error.message.includes('permission denied')) {
            logger.warn(`⚠️  Statement ${i + 1}: ${error.message.substring(0, 100)}...`);
          } else {
            logger.error(`❌ Statement ${i + 1} failed: ${error.message}`);
            errorCount++;
          }
        } else {
          successCount++;
          if (successCount % 10 === 0) {
            logger.log(`   ✅ Executed ${successCount} statements...`);
          }
        }
      } catch (error) {
        logger.error(`❌ Statement ${i + 1} failed:`, error.message);
        errorCount++;
      }
    }

    logger.log(`📊 Migration summary:`);
    logger.log(`   ✅ Successful: ${successCount}`);
    logger.log(`   ❌ Errors: ${errorCount}`);

    // Test table creation
    logger.log('🧪 Testing table creation...');
    const tablesToTest = ['work_centers', 'production_orders', 'work_orders', 'quality_checks'];
    
    for (const table of tablesToTest) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
          
        if (error) {
          logger.error(`❌ Table ${table} test failed: ${error.message}`);
        } else {
          logger.log(`   ✅ Table ${table} is accessible`);
        }
      } catch (error) {
        logger.error(`❌ Table ${table} test error:`, error.message);
      }
    }

    // Setup Row Level Security policies
    logger.log('🔒 Setting up Row Level Security policies...');
    const rlsPolicies = [
      // Work Centers policies
      `CREATE POLICY "manufacturing_select_work_centers" ON work_centers FOR SELECT TO authenticated USING (true);`,
      `CREATE POLICY "manufacturing_insert_work_centers" ON work_centers FOR INSERT TO authenticated WITH CHECK (true);`,
      `CREATE POLICY "manufacturing_update_work_centers" ON work_centers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);`,
      
      // Production Orders policies
      `CREATE POLICY "manufacturing_select_production_orders" ON production_orders FOR SELECT TO authenticated USING (true);`,
      `CREATE POLICY "manufacturing_insert_production_orders" ON production_orders FOR INSERT TO authenticated WITH CHECK (true);`,
      `CREATE POLICY "manufacturing_update_production_orders" ON production_orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);`,
      
      // Work Orders policies
      `CREATE POLICY "manufacturing_select_work_orders" ON work_orders FOR SELECT TO authenticated USING (true);`,
      `CREATE POLICY "manufacturing_insert_work_orders" ON work_orders FOR INSERT TO authenticated WITH CHECK (true);`,
      `CREATE POLICY "manufacturing_update_work_orders" ON work_orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);`,
      
      // Quality Checks policies
      `CREATE POLICY "manufacturing_select_quality_checks" ON quality_checks FOR SELECT TO authenticated USING (true);`,
      `CREATE POLICY "manufacturing_insert_quality_checks" ON quality_checks FOR INSERT TO authenticated WITH CHECK (true);`,
      `CREATE POLICY "manufacturing_update_quality_checks" ON quality_checks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);`
    ];

    let rlsSuccessCount = 0;
    for (const policy of rlsPolicies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy });
        if (error && !error.message.includes('already exists')) {
          logger.warn(`⚠️  RLS Policy warning: ${error.message.substring(0, 100)}...`);
        } else {
          rlsSuccessCount++;
        }
      } catch (error) {
        logger.warn(`⚠️  RLS Policy error: ${error.message}`);
      }
    }
    
    logger.log(`   ✅ RLS policies configured: ${rlsSuccessCount}/${rlsPolicies.length}`);

    // Insert sample data
    logger.log('📝 Inserting sample data...');
    try {
      // Sample work centers
      const { error: workCenterError } = await supabase
        .from('work_centers')
        .upsert([
          {
            name: 'CNC Machine Center 1',
            code: 'CNC001',
            description: 'High precision CNC machining center',
            department: 'Machining',
            capacity_per_hour: 50,
            current_efficiency: 85.5
          },
          {
            name: 'Assembly Line 1',
            code: 'ASM001',
            description: 'Main product assembly line',
            department: 'Assembly',
            capacity_per_hour: 100,
            current_efficiency: 92.0
          }
        ], { onConflict: 'code' });

      if (workCenterError && !workCenterError.message.includes('already exists')) {
        logger.warn(`⚠️  Sample work centers: ${workCenterError.message}`);
      } else {
        logger.log('   ✅ Sample work centers inserted');
      }

      // Sample production lines
      const { error: productionLineError } = await supabase
        .from('production_lines')
        .upsert([
          {
            name: 'Main Production Line',
            code: 'MAIN001',
            description: 'Primary manufacturing production line',
            design_capacity: 1000,
            current_capacity: 850,
            efficiency_target: 85.0,
            current_efficiency: 87.5
          }
        ], { onConflict: 'code' });

      if (productionLineError && !productionLineError.message.includes('already exists')) {
        logger.warn(`⚠️  Sample production lines: ${productionLineError.message}`);
      } else {
        logger.log('   ✅ Sample production lines inserted');
      }

      logger.log('✅ Sample data insertion completed');
    } catch (error) {
      logger.warn('⚠️  Sample data insertion had issues:', error.message);
    }

    // Final connection test with authentication
    logger.log('🔐 Testing authenticated connection...');
    if (supabaseAnonKey) {
      const clientTest = createClient(supabaseUrl, supabaseAnonKey);
      
      try {
        const { data, error } = await clientTest
          .from('work_centers')
          .select('id, name, code')
          .limit(5);

        if (error) {
          logger.warn(`⚠️  Authenticated client test: ${error.message}`);
        } else {
          logger.log(`   ✅ Authenticated client working - found ${data?.length || 0} work centers`);
        }
      } catch (error) {
        logger.warn('⚠️  Authenticated client test failed:', error.message);
      }
    }

    // Generate connection instructions
    logger.log('📋 Setup Summary:');
    logger.log('');
    logger.log('🎉 Supabase setup completed!');
    logger.log('');
    logger.log('Next steps:');
    logger.log('1. Copy the following environment variables to your .env file:');
    logger.log('');
    logger.log('   # Supabase Configuration');
    logger.log(`   SUPABASE_URL=${supabaseUrl}`);
    logger.log(`   SUPABASE_ANON_KEY=${supabaseAnonKey || 'your-supabase-anon-key'}`);
    logger.log(`   SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey ? '***your-service-role-key***' : 'your-supabase-service-role-key'}`);
    logger.log('   SUPABASE_DB_PASSWORD=your-supabase-db-password');
    logger.log('');
    logger.log('2. Update your TypeORM configuration to use Supabase:');
    logger.log('   - Host: db.your-project-id.supabase.co');
    logger.log('   - Port: 5432');
    logger.log('   - Database: postgres');
    logger.log('   - SSL: enabled');
    logger.log('');
    logger.log('3. Test your NestJS application:');
    logger.log('   npm run start:dev');
    logger.log('');
    logger.log('4. Access your Supabase dashboard:');
    logger.log('   https://app.supabase.com/project/your-project-id');
    logger.log('');
    logger.log('🔗 Manufacturing Module Endpoints (after app starts):');
    logger.log('   - GET /manufacturing/work-centers');
    logger.log('   - GET /manufacturing/production-orders');
    logger.log('   - GET /manufacturing/work-orders');
    logger.log('   - GET /manufacturing/quality-checks');
    logger.log('   - GET /manufacturing/dashboard');

  } catch (error) {
    logger.error('❌ Supabase setup failed:', error);
    process.exit(1);
  }
}

// Health check function
async function healthCheck() {
  const logger = new Logger('SupabaseHealthCheck');
  
  try {
    logger.log('🏥 Running Supabase health check...');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test basic connectivity
    const { data, error } = await supabase
      .from('work_centers')
      .select('count')
      .limit(1);

    if (error) {
      logger.error('❌ Health check failed:', error.message);
      return false;
    }

    logger.log('✅ Supabase health check passed');
    return true;
  } catch (error) {
    logger.error('❌ Health check error:', error.message);
    return false;
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'setup':
      await setupSupabase();
      break;
    case 'health':
      await healthCheck();
      break;
    default:
      console.log('Usage:');
      console.log('  npm run setup:supabase        # Full Supabase setup');
      console.log('  npm run health:supabase       # Health check');
      console.log('');
      console.log('Make sure to set your Supabase environment variables first:');
      console.log('  SUPABASE_URL=https://your-project.supabase.co');
      console.log('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
      console.log('  SUPABASE_ANON_KEY=your-anon-key');
      process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

export { setupSupabase, healthCheck };
