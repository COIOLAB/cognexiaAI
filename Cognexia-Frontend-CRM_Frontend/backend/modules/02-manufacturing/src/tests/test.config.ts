import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { WorkCenter } from '../entities/WorkCenter';
import { ProductionLine } from '../entities/ProductionLine';
import { BillOfMaterials } from '../entities/BillOfMaterials';
import { BOMComponent } from '../entities/BOMComponent';
import { ProductionOrder } from '../entities/ProductionOrder';
import { WorkOrder } from '../entities/WorkOrder';
import { IoTDevice } from '../entities/IoTDevice';
import { DigitalTwin } from '../entities/DigitalTwin';
import { Routing } from '../entities/Routing';
import { RoutingOperation } from '../entities/RoutingOperation';
import { QualityCheck } from '../entities/QualityCheck';
import { EquipmentMaintenance } from '../entities/EquipmentMaintenance';
import { OperationLog } from '../entities/OperationLog';

/**
 * Test database configuration for manufacturing module
 */
export const testDatabaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '5433'),
  username: process.env.TEST_DB_USERNAME || 'test_user',
  password: process.env.TEST_DB_PASSWORD || 'test_password',
  database: process.env.TEST_DB_NAME || 'manufacturing_test',
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
  logging: process.env.NODE_ENV === 'development',
  migrations: [],
  migrationsRun: false,
};

/**
 * In-memory database configuration for unit tests
 */
export const inMemoryTestConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:',
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
};

/**
 * Jest global setup for manufacturing tests
 */
export const jestGlobalSetup = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/modules/manufacturing/**/*.ts',
    '!src/modules/manufacturing/**/*.spec.ts',
    '!src/modules/manufacturing/**/*.e2e-spec.ts',
    '!src/modules/manufacturing/**/index.ts',
    '!src/modules/manufacturing/tests/**/*.ts',
  ],
  coverageDirectory: 'coverage/manufacturing',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/modules/manufacturing/tests/setup.ts'],
  testTimeout: 10000,
  maxWorkers: 1, // Prevent database conflicts in tests
};

/**
 * Test environment variables
 */
export const testEnvironmentVariables = {
  NODE_ENV: 'test',
  TEST_DB_HOST: 'localhost',
  TEST_DB_PORT: '5433',
  TEST_DB_USERNAME: 'test_user',
  TEST_DB_PASSWORD: 'test_password',
  TEST_DB_NAME: 'manufacturing_test',
  JWT_SECRET: 'test-secret-key',
  REDIS_HOST: 'localhost',
  REDIS_PORT: '6379',
  CACHE_TTL: '300',
};

/**
 * Mock data configuration
 */
export const mockDataConfig = {
  // Default values for test data generation
  defaultWorkCenterCapacity: 1000,
  defaultProductionLineSpeed: 100,
  defaultBOMVersion: '1.0',
  defaultProductionOrderQuantity: 100,
  defaultWorkOrderDuration: 480, // 8 hours in minutes
  defaultQualityCheckCriteria: ['dimensions', 'surface_finish', 'material_composition'],
  
  // Date ranges for test data
  dateRanges: {
    pastDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    futureDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  },
  
  // IoT sensor value ranges
  sensorRanges: {
    temperature: { min: 65, max: 85, alarm: { min: 60, max: 90 } },
    pressure: { min: 95, max: 105, alarm: { min: 85, max: 115 } },
    humidity: { min: 40, max: 60, alarm: { min: 30, max: 70 } },
    vibration: { min: 0.02, max: 0.08, alarm: { min: 0, max: 0.12 } },
    energy_consumption: { min: 100, max: 200, alarm: { min: 0, max: 300 } },
  },
  
  // Quality standards
  qualityStandards: {
    dimensionalTolerance: 0.1, // mm
    surfaceRoughness: 1.6, // Ra value
    materialPurity: 99.5, // percentage
  },
  
  // Performance metrics
  performanceTargets: {
    oeeTarget: 85, // percentage
    efficiencyTarget: 90, // percentage
    availabilityTarget: 95, // percentage
    qualityTarget: 99, // percentage
  },
};

/**
 * Test utilities configuration
 */
export const testUtilities = {
  // Database cleanup utilities
  cleanupSequence: [
    'operation_logs',
    'equipment_maintenance',
    'quality_checks',
    'routing_operations',
    'routings',
    'digital_twins',
    'iot_devices',
    'work_orders',
    'production_orders',
    'bom_components',
    'bills_of_materials',
    'production_lines',
    'work_centers',
  ],
  
  // Test data generation options
  dataGeneration: {
    batchSize: 10,
    maxRecords: 100,
    seedValue: 12345,
  },
  
  // API testing configuration
  apiTesting: {
    baseUrl: '/api/v1/manufacturing',
    timeout: 5000,
    retries: 3,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
  
  // Performance testing thresholds
  performanceThresholds: {
    responseTime: 1000, // ms
    throughput: 100, // requests/second
    memoryUsage: 100, // MB
    cpuUsage: 80, // percentage
  },
  
  // Mock service response delays
  mockDelays: {
    fast: 10, // ms
    medium: 100, // ms
    slow: 500, // ms
  },
};

/**
 * Test validation rules
 */
export const testValidationRules = {
  // Required field validation
  requiredFields: {
    workCenter: ['code', 'name', 'type', 'capacity'],
    productionLine: ['name', 'workCenterId', 'capacity'],
    billOfMaterial: ['productCode', 'productName', 'version'],
    productionOrder: ['orderNumber', 'billOfMaterialId', 'quantity', 'dueDate'],
    workOrder: ['orderNumber', 'productionOrderId', 'workCenterId', 'plannedQuantity'],
    iotDevice: ['deviceId', 'deviceType', 'workCenterId'],
    digitalTwin: ['name', 'type', 'workCenterId'],
    qualityCheck: ['checkType', 'workOrderId', 'criteria'],
  },
  
  // Data format validation
  formats: {
    id: /^[a-z0-9-]+$/,
    code: /^[A-Z0-9-]+$/,
    version: /^\d+\.\d+$/,
    orderNumber: /^[A-Z]{2}-\d{3}$/,
    deviceId: /^[A-Z]{3}-\d{4}$/,
  },
  
  // Value range validation
  ranges: {
    capacity: { min: 1, max: 10000 },
    quantity: { min: 1, max: 100000 },
    duration: { min: 1, max: 10080 }, // 1 minute to 1 week
    efficiency: { min: 0, max: 100 },
    temperature: { min: -50, max: 200 },
    pressure: { min: 0, max: 1000 },
  },
  
  // Business rule validation
  businessRules: {
    dueDateMustBeFuture: true,
    quantityMustBePositive: true,
    efficiencyMustBeBelowHundred: true,
    orderNumberMustBeUnique: true,
    workCenterCodeMustBeUnique: true,
  },
};

/**
 * Export all configurations
 */
export default {
  testDatabaseConfig,
  inMemoryTestConfig,
  jestGlobalSetup,
  testEnvironmentVariables,
  mockDataConfig,
  testUtilities,
  testValidationRules,
};
