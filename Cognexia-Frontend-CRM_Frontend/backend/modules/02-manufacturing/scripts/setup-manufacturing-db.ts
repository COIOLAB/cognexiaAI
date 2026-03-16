#!/usr/bin/env ts-node

/**
 * Manufacturing Database Setup Script
 * Creates and initializes the manufacturing database with proper schema
 */

import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Manufacturing Module Entities
import { WorkCenter } from '../src/entities/WorkCenter';
import { ProductionLine } from '../src/entities/ProductionLine';
import { BillOfMaterials } from '../src/entities/BillOfMaterials';
import { BOMComponent } from '../src/entities/BOMComponent';
import { ProductionOrder } from '../src/entities/ProductionOrder';
import { WorkOrder } from '../src/entities/WorkOrder';
import { IoTDevice } from '../src/entities/IoTDevice';
import { DigitalTwin } from '../src/entities/DigitalTwin';
import { Routing } from '../src/entities/Routing';
import { RoutingOperation } from '../src/entities/RoutingOperation';
import { QualityCheck } from '../src/entities/QualityCheck';
import { EquipmentMaintenance } from '../src/entities/EquipmentMaintenance';
import { OperationLog } from '../src/entities/OperationLog';

const configService = new ConfigService();

// Development Database Configuration
const developmentDataSource = new DataSource({
  type: 'postgres',
  host: process.env.MANUFACTURING_DB_HOST || 'localhost',
  port: parseInt(process.env.MANUFACTURING_DB_PORT || '5432'),
  username: process.env.MANUFACTURING_DB_USERNAME || 'postgres',
  password: process.env.MANUFACTURING_DB_PASSWORD || 'password',
  database: process.env.MANUFACTURING_DB_NAME || 'industry5_manufacturing',
  entities: [
    WorkCenter,
    ProductionLine,
    BillOfMaterials,
    BOMComponent,
    ProductionOrder,
    WorkOrder,
    IoTDevice,
    DigitalTwin,
    Routing,
    RoutingOperation,
    QualityCheck,
    EquipmentMaintenance,
    OperationLog,
  ],
  synchronize: true,
  logging: true,
});

// Test Database Configuration
const testDataSource = new DataSource({
  type: 'postgres',
  host: process.env.TEST_MANUFACTURING_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_MANUFACTURING_DB_PORT || '5433'),
  username: process.env.TEST_MANUFACTURING_DB_USERNAME || 'test_user',
  password: process.env.TEST_MANUFACTURING_DB_PASSWORD || 'test_password',
  database: process.env.TEST_MANUFACTURING_DB_NAME || 'industry5_manufacturing_test',
  entities: [
    WorkCenter,
    ProductionLine,
    BillOfMaterials,
    BOMComponent,
    ProductionOrder,
    WorkOrder,
    IoTDevice,
    DigitalTwin,
    Routing,
    RoutingOperation,
    QualityCheck,
    EquipmentMaintenance,
    OperationLog,
  ],
  synchronize: true,
  dropSchema: true,
  logging: false,
});

async function createDatabase(dataSource: DataSource, name: string) {
  try {
    console.log(`🚀 Setting up ${name} database...`);
    
    await dataSource.initialize();
    console.log(`✅ ${name} database connected successfully`);
    
    // Synchronize schema
    await dataSource.synchronize();
    console.log(`✅ ${name} database schema synchronized`);
    
    await dataSource.destroy();
    console.log(`✅ ${name} database setup completed\n`);
    
  } catch (error) {
    console.error(`❌ Error setting up ${name} database:`, error.message);
    throw error;
  }
}

async function createIndexes(dataSource: DataSource) {
  await dataSource.initialize();
  
  const queryRunner = dataSource.createQueryRunner();
  
  try {
    // Additional indexes for performance optimization
    console.log('📊 Creating additional performance indexes...');
    
    // Work Centers indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_work_centers_status_type 
      ON work_centers(status, type);
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_work_centers_efficiency 
      ON work_centers(efficiency) WHERE efficiency > 0;
    `);
    
    // Production Orders indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_production_orders_status_priority 
      ON production_orders(status, priority);
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_production_orders_dates 
      ON production_orders(scheduled_start_date, scheduled_end_date);
    `);
    
    // Work Orders indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_work_orders_status_workCenter 
      ON work_orders(status, work_center_id);
    `);
    
    // IoT Devices indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_iot_devices_status_type 
      ON iot_devices(status, device_type);
    `);
    
    // Quality Checks indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_quality_checks_result_date 
      ON quality_checks(result, completed_at);
    `);
    
    // JSONB indexes for better performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_work_centers_industry_specific 
      ON work_centers USING GIN(industry_specific);
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_iot_devices_sensor_data 
      ON iot_devices USING GIN(current_data);
    `);
    
    console.log('✅ Performance indexes created successfully');
    
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

async function seedSampleData(dataSource: DataSource) {
  await dataSource.initialize();
  
  try {
    console.log('🌱 Seeding sample manufacturing data...');
    
    // Create sample work center
    const workCenterRepo = dataSource.getRepository(WorkCenter);
    const sampleWorkCenter = workCenterRepo.create({
      code: 'WC001',
      name: 'Assembly Line A',
      description: 'Main assembly line for electronic components',
      type: 'assembly' as any,
      status: 'active' as any,
      location: 'Building A, Floor 1',
      hourlyCapacity: 100,
      dailyCapacity: 800,
      efficiency: 85.5,
      utilization: 78.2,
      setupTime: 30,
      teardownTime: 15,
      hourlyRate: 85.00,
      operatorCost: 25.00,
      overheadCost: 15.00,
      requiredOperators: 3,
      currentOperators: 3,
      capabilities: ['assembly', 'testing', 'packaging'],
      industryType: 'electronics',
    });
    
    await workCenterRepo.save(sampleWorkCenter);
    
    // Create sample production line
    const productionLineRepo = dataSource.getRepository(ProductionLine);
    const sampleProductionLine = productionLineRepo.create({
      name: 'Electronics Assembly Line',
      description: 'Complete electronics assembly and testing line',
      capacity: 1000,
      currentLoad: 750,
      efficiency: 88.5,
      status: 'active' as any,
      lineSpeed: 120,
      setupTime: 45,
      operatingHours: 16,
    });
    
    await productionLineRepo.save(sampleProductionLine);
    
    // Create sample BOM
    const bomRepo = dataSource.getRepository(BillOfMaterials);
    const sampleBOM = bomRepo.create({
      bomNumber: 'BOM-ELEC-001',
      name: 'Electronic Device Assembly',
      description: 'Complete BOM for electronic device manufacturing',
      productId: 'PROD-001',
      productSku: 'ELEC-DEV-001',
      productName: 'Smart Electronic Device',
      type: 'manufacturing' as any,
      status: 'active' as any,
      version: '1.0',
      revisionStatus: 'current' as any,
      effectiveDate: new Date(),
      baseQuantity: 1,
      baseUnit: 'EA',
      totalCost: 125.50,
      materialCost: 85.30,
      laborCost: 25.20,
      overheadCost: 15.00,
    });
    
    await bomRepo.save(sampleBOM);
    
    // Create sample IoT device
    const iotRepo = dataSource.getRepository(IoTDevice);
    const sampleIoT = iotRepo.create({
      deviceId: 'IOT-001',
      deviceName: 'Temperature Sensor A1',
      deviceType: 'sensor' as any,
      manufacturer: 'Industry5.0 Sensors',
      model: 'TEMP-5000',
      location: 'Work Center A, Position 1',
      workCenterId: sampleWorkCenter.id,
      status: 'active' as any,
      connectionType: 'wifi' as any,
      dataFormat: 'json' as any,
      samplingRate: 1000,
      lastPing: new Date(),
      currentData: {
        temperature: 23.5,
        humidity: 45.2,
        timestamp: new Date(),
      },
    });
    
    await iotRepo.save(sampleIoT);
    
    console.log('✅ Sample data seeded successfully');
    
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || 'development';
  
  console.log('🏭 Industry 5.0 Manufacturing Database Setup');
  console.log('============================================\n');
  
  try {
    if (environment === 'development' || environment === 'all') {
      await createDatabase(developmentDataSource, 'Development');
      await createIndexes(developmentDataSource);
      await seedSampleData(developmentDataSource);
    }
    
    if (environment === 'test' || environment === 'all') {
      await createDatabase(testDataSource, 'Test');
      await createIndexes(testDataSource);
    }
    
    console.log('🎉 Manufacturing database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Run tests: npm test');
    console.log('2. Start the application: npm run start:dev');
    console.log('3. Access manufacturing endpoints at /api/manufacturing');
    
  } catch (error) {
    console.error('💥 Database setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  main();
}

export { developmentDataSource, testDataSource };
