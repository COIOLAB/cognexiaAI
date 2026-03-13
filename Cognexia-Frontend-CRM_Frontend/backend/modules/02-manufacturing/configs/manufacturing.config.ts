import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

// Manufacturing Module Entities
import { WorkCenter } from '../../modules/manufacturing/entities/WorkCenter';
import { ProductionLine } from '../../modules/manufacturing/entities/ProductionLine';
import { BillOfMaterials } from '../../modules/manufacturing/entities/BillOfMaterials';
import { BOMComponent } from '../../modules/manufacturing/entities/BOMComponent';
import { ProductionOrder } from '../../modules/manufacturing/entities/ProductionOrder';
import { WorkOrder } from '../../modules/manufacturing/entities/WorkOrder';
import { IoTDevice } from '../../modules/manufacturing/entities/IoTDevice';
import { DigitalTwin } from '../../modules/manufacturing/entities/DigitalTwin';
import { Routing } from '../../modules/manufacturing/entities/Routing';
import { RoutingOperation } from '../../modules/manufacturing/entities/RoutingOperation';
import { QualityCheck } from '../../modules/manufacturing/entities/QualityCheck';
import { EquipmentMaintenance } from '../../modules/manufacturing/entities/EquipmentMaintenance';
import { OperationLog } from '../../modules/manufacturing/entities/OperationLog';

export const createManufacturingDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('MANUFACTURING_DB_HOST', 'localhost'),
  port: configService.get('MANUFACTURING_DB_PORT', 5432),
  username: configService.get('MANUFACTURING_DB_USERNAME', 'postgres'),
  password: configService.get('MANUFACTURING_DB_PASSWORD', 'password'),
  database: configService.get('MANUFACTURING_DB_NAME', 'industry5_manufacturing'),
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
  synchronize: configService.get('NODE_ENV') !== 'production',
  logging: configService.get('NODE_ENV') === 'development',
  migrations: ['dist/database/migrations/manufacturing/*.js'],
  migrationsTableName: 'manufacturing_migrations',
  migrationsRun: false,
  ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
  maxQueryExecutionTime: 5000,
  extra: {
    connectionLimit: 20,
    acquireTimeout: 60000,
    timeout: 60000,
  },
});

// Test Database Configuration
export const createTestManufacturingDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('TEST_MANUFACTURING_DB_HOST', 'localhost'),
  port: configService.get('TEST_MANUFACTURING_DB_PORT', 5433),
  username: configService.get('TEST_MANUFACTURING_DB_USERNAME', 'test_user'),
  password: configService.get('TEST_MANUFACTURING_DB_PASSWORD', 'test_password'),
  database: configService.get('TEST_MANUFACTURING_DB_NAME', 'industry5_manufacturing_test'),
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
  dropSchema: configService.get('NODE_ENV') === 'test',
  logging: false,
  migrations: [],
  migrationsRun: false,
});
