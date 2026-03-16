import { Module, Logger, Type } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamicModule } from '@nestjs/common/interfaces';

// We'll try to import the stable modules progressively
// Excluding Sales & Marketing (07) which has major syntax errors

// Define base type for dynamic modules
type NestModule = Type<any> | DynamicModule | Promise<DynamicModule>;

// Start with support modules first
let HealthModule: NestModule | undefined;
try {
  const { HealthModule: LoadedHealthModule } = require('../modules/21-health/src/health.module');
  HealthModule = LoadedHealthModule;
} catch (error: any) {
  console.warn('Health module import failed:', error?.message);
}

// Try Analytics module
let AnalyticsModule: NestModule | undefined;
try {
  const analyticsModuleImport = require('../modules/17-analytics/src/analytics.module');
  AnalyticsModule = analyticsModuleImport.AnalyticsModule;
} catch (error: any) {
  console.warn('Analytics module import failed:', error?.message);
}

// Try Finance module  
let FinanceModule: NestModule | undefined;
try {
  const financeModuleImport = require('../modules/23-finance-accounting/src/finance.module');
  FinanceModule = financeModuleImport.FinanceModule;
} catch (error: any) {
  console.warn('Finance module import failed:', error?.message);
}

// Try IoT module
let IoTModule: NestModule | undefined;
try {
  const iotModuleImport = require('../modules/14-iot/src/iot.module');
  IoTModule = iotModuleImport.IoTModule;
} catch (error: any) {
  console.warn('IoT module import failed:', error?.message);
}

// Try Maintenance module
let MaintenanceModule: NestModule | undefined;
try {
  const maintenanceModuleImport = require('../modules/13-maintenance/src/maintenance.module');
  MaintenanceModule = maintenanceModuleImport.MaintenanceModule;
} catch (error: any) {
  console.warn('Maintenance module import failed:', error?.message);
}

// Try Quality module
let QualityModule: NestModule | undefined;
try {
  const qualityModuleImport = require('../modules/12-quality/src/quality.module');
  QualityModule = qualityModuleImport.QualityModule;
} catch (error: any) {
  console.warn('Quality module import failed:', error?.message);
}

// Try Robotics module
let ERoboticsModule: NestModule | undefined;
try {
  const roboticsModuleImport = require('../modules/30-e-robotics/src/e-robotics.module');
  ERoboticsModule = roboticsModuleImport.ERoboticsModule;
} catch (error: any) {
  console.warn('Robotics module import failed:', error?.message);
}

// Build the imports array dynamically
const moduleImports: (NestModule | Promise<DynamicModule>)[] = [
  // Configuration module (must be first)
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
    expandVariables: true,
  }),

  // Database connection (SQLite for local development)
  TypeOrmModule.forRootAsync({
    useFactory: () => ({
      type: 'sqlite',
      database: process.env.DB_DATABASE || './database/industry5.db',
      synchronize: true,  // Development only
      logging: process.env.NODE_ENV === 'development',
      entities: [],
      autoLoadEntities: true,
    }),
  }),

  // Health check module
  TerminusModule,
];

// Add working modules dynamically
if (HealthModule) moduleImports.push(HealthModule);
if (AnalyticsModule) moduleImports.push(AnalyticsModule);
if (FinanceModule) moduleImports.push(FinanceModule);
if (IoTModule) moduleImports.push(IoTModule);
if (MaintenanceModule) moduleImports.push(MaintenanceModule);
if (QualityModule) moduleImports.push(QualityModule);
if (ERoboticsModule) moduleImports.push(ERoboticsModule);

@Module({
  imports: moduleImports,
  controllers: [],
  providers: [
    {
      provide: 'APP_LOGGER',
      useFactory: () => {
        const logger = new Logger('ProgressiveAppModule');
        logger.log('🏭 Industry 5.0 ERP Platform - Progressive Module Loading');
        
        const loadedModules = [];
        if (HealthModule) loadedModules.push('Health Monitoring');
        if (AnalyticsModule) loadedModules.push('Analytics & BI');
        if (FinanceModule) loadedModules.push('Finance & Accounting');
        if (IoTModule) loadedModules.push('IoT Platform');
        if (MaintenanceModule) loadedModules.push('Maintenance Management');
        if (QualityModule) loadedModules.push('Quality Management');
        if (ERoboticsModule) loadedModules.push('E-Robotics & Automation');
        
        logger.log(`✅ Successfully loaded ${loadedModules.length} modules:`);
        loadedModules.forEach(module => logger.log(`   - ${module}`));
        
        logger.log('🚫 Excluded problematic modules:');
        logger.log('   - Sales & Marketing (syntax errors)');
        
        logger.log('🚀 Platform ready for progressive expansion');
        return logger;
      },
    },
  ],
})
export class ProgressiveAppModule {
  constructor() {
    const logger = new Logger('ProgressiveAppModule');
    logger.log('🎯 Industry 5.0 ERP Platform - Progressive loading complete');
    logger.log('📈 Ready to add more modules as they are fixed');
  }
}
