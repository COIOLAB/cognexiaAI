#!/usr/bin/env ts-node

import { config } from 'dotenv';
import { DatabaseConnection } from '../connection';
import { logger } from '../../utils/logger';
import { SeedCoreHRData } from './hr/001_seed_core_hr_data';
import { SeedHRAdvancedData } from './hr/002_seed_hr_advanced_data';

// Load environment variables
config();

export class HRSeedRunner {
  
  static async runAllSeeds(): Promise<void> {
    logger.info('🚀 Starting HR Seed Data Generation...');
    
    try {
      // Initialize database connection
      await DatabaseConnection.initialize();
      const dataSource = DatabaseConnection.getPostgresDataSource();
      
      if (!dataSource.isInitialized) {
        throw new Error('Database connection not initialized');
      }

      // Check if database is empty before seeding
      const isEmpty = await this.isDatabaseEmpty(dataSource);
      
      if (!isEmpty) {
        logger.warn('⚠️  Database contains existing data. Do you want to continue? (This may create duplicates)');
        // In a real CLI, you'd prompt the user here
        // For now, we'll proceed but add unique constraints
      }

      logger.info('📊 Database connection verified. Starting seed process...');

      // 1. Seed Core HR Data (Organizations, Departments, Positions, Employees)
      logger.info('🌱 Step 1: Seeding Core HR Data...');
      await SeedCoreHRData.seed(dataSource);
      
      // Wait a moment between seeds
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 2. Seed Advanced HR Data (Compensation, Benefits, Reviews, etc.)
      logger.info('🌱 Step 2: Seeding Advanced HR Data...');
      await SeedHRAdvancedData.seed(dataSource);

      // 3. Generate summary report
      await this.generateSeedSummary(dataSource);

      logger.info('🎉 HR Seed Data Generation Completed Successfully!');
      logger.info('✨ Your HR system is now populated with comprehensive test data.');
      
    } catch (error) {
      logger.error('❌ HR Seed Data Generation Failed:', error);
      throw error;
    } finally {
      // Close database connection
      await DatabaseConnection.close();
    }
  }

  static async clearAllHRData(): Promise<void> {
    logger.warn('🗑️  Starting HR Data Cleanup...');
    
    try {
      await DatabaseConnection.initialize();
      const dataSource = DatabaseConnection.getPostgresDataSource();
      
      const queryRunner = dataSource.createQueryRunner();
      
      try {
        await queryRunner.startTransaction();
        
        // Delete in reverse dependency order
        logger.info('🧹 Cleaning HR performance reviews...');
        await queryRunner.query('DELETE FROM hr_performance_reviews');
        
        logger.info('🧹 Cleaning HR benefits enrollments...');
        await queryRunner.query('DELETE FROM hr_benefits_enrollments');
        
        logger.info('🧹 Cleaning HR employee compensations...');
        await queryRunner.query('DELETE FROM hr_employee_compensation');
        
        logger.info('🧹 Cleaning HR tax rules...');
        await queryRunner.query('DELETE FROM hr_tax_rules');
        
        logger.info('🧹 Cleaning HR benefits plans...');
        await queryRunner.query('DELETE FROM hr_benefits_plans');
        
        logger.info('🧹 Cleaning HR salary structures...');
        await queryRunner.query('DELETE FROM hr_salary_structures');
        
        logger.info('🧹 Cleaning HR compensation plans...');
        await queryRunner.query('DELETE FROM hr_compensation_plans');
        
        logger.info('🧹 Cleaning employees...');
        await queryRunner.query('DELETE FROM employees');
        
        logger.info('🧹 Cleaning positions...');
        await queryRunner.query('DELETE FROM positions');
        
        logger.info('🧹 Cleaning departments...');
        await queryRunner.query('DELETE FROM departments');
        
        logger.info('🧹 Cleaning organizations...');
        await queryRunner.query('DELETE FROM organizations');
        
        await queryRunner.commitTransaction();
        logger.info('✅ HR Data Cleanup Completed Successfully!');
        
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
      
    } catch (error) {
      logger.error('❌ HR Data Cleanup Failed:', error);
      throw error;
    } finally {
      await DatabaseConnection.close();
    }
  }

  static async refreshAllHRData(): Promise<void> {
    logger.info('🔄 Refreshing HR Data (Clear + Seed)...');
    
    try {
      // First clear existing data
      await this.clearAllHRData();
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Then seed new data
      await this.runAllSeeds();
      
      logger.info('🎉 HR Data Refresh Completed Successfully!');
      
    } catch (error) {
      logger.error('❌ HR Data Refresh Failed:', error);
      throw error;
    }
  }

  private static async isDatabaseEmpty(dataSource: any): Promise<boolean> {
    const queryRunner = dataSource.createQueryRunner();
    
    try {
      const result = await queryRunner.query(`
        SELECT COUNT(*) as total FROM (
          SELECT 1 FROM organizations WHERE is_active = true
          UNION ALL
          SELECT 1 FROM employees WHERE is_active = true
        ) as combined
      `);
      
      return parseInt(result[0]?.total || '0') === 0;
      
    } catch (error) {
      // If tables don't exist, database is empty
      return true;
    } finally {
      await queryRunner.release();
    }
  }

  private static async generateSeedSummary(dataSource: any): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();
    
    try {
      logger.info('📋 Generating Seed Data Summary...');
      
      // Get summary data
      const organizations = await queryRunner.query('SELECT COUNT(*) as count FROM organizations WHERE is_active = true');
      const departments = await queryRunner.query('SELECT COUNT(*) as count FROM departments WHERE is_active = true');
      const positions = await queryRunner.query('SELECT COUNT(*) as count FROM positions WHERE is_active = true');
      const employees = await queryRunner.query('SELECT COUNT(*) as count FROM employees WHERE is_active = true');
      const compensationPlans = await queryRunner.query('SELECT COUNT(*) as count FROM hr_compensation_plans WHERE "isActive" = true');
      const salaryStructures = await queryRunner.query('SELECT COUNT(*) as count FROM hr_salary_structures');
      const benefitsPlans = await queryRunner.query('SELECT COUNT(*) as count FROM hr_benefits_plans WHERE "isActive" = true');
      const benefitsEnrollments = await queryRunner.query('SELECT COUNT(*) as count FROM hr_benefits_enrollments WHERE status = \'active\'');
      const employeeCompensations = await queryRunner.query('SELECT COUNT(*) as count FROM hr_employee_compensation WHERE "isActive" = true');
      const taxRules = await queryRunner.query('SELECT COUNT(*) as count FROM hr_tax_rules WHERE "isActive" = true');
      const performanceReviews = await queryRunner.query('SELECT COUNT(*) as count FROM hr_performance_reviews WHERE "isActive" = true');
      
      // Sample data
      const sampleEmployees = await queryRunner.query(`
        SELECT e.employee_number, e.first_name, e.last_name, e.email, d.name as department, p.title as position
        FROM employees e
        JOIN departments d ON e.department_id = d.id
        JOIN positions p ON e.position_id = p.id
        WHERE e.is_active = true
        ORDER BY e.employee_number
        LIMIT 5
      `);

      console.log('\n' + '='.repeat(80));
      console.log('📊 HR SEED DATA SUMMARY REPORT');
      console.log('='.repeat(80));
      
      console.log('\n📋 Core Data:');
      console.log(`  • Organizations: ${organizations[0].count}`);
      console.log(`  • Departments: ${departments[0].count}`);
      console.log(`  • Positions: ${positions[0].count}`);
      console.log(`  • Employees: ${employees[0].count}`);
      
      console.log('\n💰 Compensation & Benefits:');
      console.log(`  • Compensation Plans: ${compensationPlans[0].count}`);
      console.log(`  • Salary Structures: ${salaryStructures[0].count}`);
      console.log(`  • Benefits Plans: ${benefitsPlans[0].count}`);
      console.log(`  • Benefits Enrollments: ${benefitsEnrollments[0].count}`);
      console.log(`  • Employee Compensations: ${employeeCompensations[0].count}`);
      
      console.log('\n📊 Advanced Features:');
      console.log(`  • Tax Rules: ${taxRules[0].count}`);
      console.log(`  • Performance Reviews: ${performanceReviews[0].count}`);
      
      console.log('\n👥 Sample Employees:');
      sampleEmployees.forEach((emp: any, index: number) => {
        console.log(`  ${index + 1}. ${emp.employee_number} - ${emp.first_name} ${emp.last_name}`);
        console.log(`     ${emp.position} | ${emp.department}`);
        console.log(`     📧 ${emp.email}`);
      });
      
      console.log('\n' + '='.repeat(80));
      console.log('🎯 NEXT STEPS:');
      console.log('  1. Run integration tests: npm run test:hr:integration');
      console.log('  2. Start the server: npm run dev');
      console.log('  3. Access HR APIs at: http://localhost:3000/api/hr/*');
      console.log('  4. Check Swagger docs: http://localhost:3000/api-docs');
      console.log('='.repeat(80));
      
    } catch (error) {
      logger.error('Failed to generate seed summary:', error);
    } finally {
      await queryRunner.release();
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  
  console.log('🏭 Industry 5.0 ERP - HR Seed Data Manager');
  console.log('==========================================\n');

  try {
    switch (command) {
      case 'run':
      case 'seed':
        await HRSeedRunner.runAllSeeds();
        break;
        
      case 'clear':
      case 'clean':
        await HRSeedRunner.clearAllHRData();
        break;
        
      case 'refresh':
        await HRSeedRunner.refreshAllHRData();
        break;
        
      default:
        console.log('📖 Available Commands:');
        console.log('  run/seed    - Run all HR seed data generation');
        console.log('  clear/clean - Clear all existing HR data');
        console.log('  refresh     - Clear existing data and re-seed');
        console.log('');
        console.log('💡 Examples:');
        console.log('  npm run seed:hr run');
        console.log('  npm run seed:hr refresh');
        console.log('  ts-node src/database/seeds/hr-seed-runner.ts run');
        process.exit(0);
    }
    
  } catch (error) {
    console.error('\n❌ Operation failed:', error.message);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run CLI if this file is executed directly
if (require.main === module) {
  main();
}

export default HRSeedRunner;
