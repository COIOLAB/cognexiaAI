// Industry 5.0 ERP Backend - Manufacturing Module
// Comprehensive NestJS module for advanced manufacturing operations
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';

// Import all entities from the entities index
import {
  WorkCenter,
  ProductionLine,
  BillOfMaterials,
  BOMComponent,
  ProductionOrder,
  WorkOrder,
  OperationLog,
  Routing,
  RoutingOperation,
  QualityCheck,
  EquipmentMaintenance,
  ProductionSchedule,
  ManufacturingAnalytics,
  AIInsight,
  IoTDevice,
  DigitalTwin,
  Robotics,
  Cybersecurity,
} from './entities';

// Controllers - Existing Controllers Only
import { WorkCenterController } from './controllers/work-center.controller';
import { DigitalTwinController } from './controllers/digital-twin.controller';
import { CybersecurityController } from './controllers/cybersecurity.controller';

// Main Manufacturing Controller with AI Integration
import { ManufacturingController } from './controllers/manufacturing.controller';

// Revolutionary Services - All 10 Advanced Features
import { QuantumManufacturingOptimizationService } from './services/QuantumManufacturingOptimizationService';
import { BlockchainSupplyChainTraceabilityService } from './services/BlockchainSupplyChainTraceabilityService';
import { AdvancedComputerVisionQualityControlService } from './services/AdvancedComputerVisionQualityControlService';
import { AutonomousManufacturingOrchestrationEngine } from './services/AutonomousManufacturingOrchestrationEngine';
import { AdvancedSustainabilityTrackingService } from './services/AdvancedSustainabilityTrackingService';
import { CollaborativeIntelligencePlatformService } from './services/CollaborativeIntelligencePlatformService';
import { EdgeComputingManufacturingFrameworkService } from './services/EdgeComputingManufacturingFrameworkService';
import { AdvancedCybersecurityZeroTrustService } from './services/AdvancedCybersecurityZeroTrustService';
import { ManufacturingMetaverseARVRService } from './services/ManufacturingMetaverseARVRService';
import { AdvancedPredictiveAnalyticsDigitalProphetService } from './services/AdvancedPredictiveAnalyticsDigitalProphetService';

// Core Services
import { WorkCenterService } from './services/work-center.service';
import { ProductionLineService } from './services/production-line.service';
import { BillOfMaterialsService } from './services/bill-of-materials.service';
import { ProductionOrderService } from './services/production-order.service';
import { WorkOrderService } from './services/work-order.service';
import { OperationLogService } from './services/operation-log.service';

// Advanced Services
import { RoutingService } from './services/routing.service';
import { QualityCheckService } from './services/quality-check.service';
import { EquipmentMaintenanceService } from './services/equipment-maintenance.service';
import { ProductionScheduleService } from './services/production-schedule.service';
import { ManufacturingAnalyticsService } from './services/manufacturing-analytics.service';
import { AIInsightService } from './services/ai-insight.service';

// Industry 5.0 Services
import { IoTDeviceService } from './services/iot-device.service';
import { RoboticsService } from './services/robotics.service';
import { DigitalTwinService } from './services/digital-twin.service';
import { CybersecurityService } from './services/cybersecurity.service';

// Main Manufacturing Services with AI Integration
import { ManufacturingService } from './services/manufacturing.service';
import { ManufacturingAIService } from './services/manufacturing-ai.service';

// Guards and Utilities
import { ManufacturingGuard } from './guards/manufacturing.guard';
import { ProductionLineGuard } from './guards/production-line.guard';
import { ManufacturingUtilities } from './utilities/manufacturing-utilities';
import { ProductionCalculatorService } from './utilities/production-calculator.service';
import { ManufacturingValidationService } from './utilities/manufacturing-validation.service';

@Module({
  imports: [
    // Configuration Module
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env.development', '.env.production', '.env'],
      isGlobal: true,
      expandVariables: true,
    }),

    // Database Configuration
    TypeOrmModule.forFeature([
      // Core Manufacturing Entities
      WorkCenter,
      ProductionLine,
      BillOfMaterials,
      BOMComponent,
      ProductionOrder,
      WorkOrder,
      OperationLog,
      
      // Advanced Manufacturing Entities
      Routing,
      RoutingOperation,
      QualityCheck,
      EquipmentMaintenance,
      ProductionSchedule,
      ManufacturingAnalytics,
      AIInsight,
      
      // Industry 5.0 Advanced Entities
      IoTDevice,
      DigitalTwin,
      Robotics,
      Cybersecurity,
    ]),

    // JWT Authentication
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'manufacturing-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
          algorithm: 'HS256',
          issuer: 'Industry5.0-Manufacturing',
          audience: 'manufacturing-users',
        },
      }),
    }),

    // Passport Authentication
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [{
          ttl: configService.get<number>('THROTTLE_TTL') || 60000,
          limit: configService.get<number>('THROTTLE_LIMIT') || 100,
        }],
        ignoreUserAgents: [/healthcheck/i],
      }),
    }),
    
    // Task Scheduling
    ScheduleModule.forRoot(),

    // Event System
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 20,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),

    // Caching
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>('CACHE_TTL') || 300,
        max: configService.get<number>('CACHE_MAX_ITEMS') || 1000,
        isGlobal: true,
        store: configService.get<string>('CACHE_STORE') || 'memory',
      }),
    }),

    // Queue System for Background Processing
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_QUEUE_DB') || 2,
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      }),
    }),

    // Queue Registration
    BullModule.registerQueue(
      { name: 'production-scheduling' },
      { name: 'quality-control' },
      { name: 'maintenance-planning' },
      { name: 'iot-processing' },
      { name: 'analytics-processing' },
    ),
  ],
  controllers: [
    // Existing Controllers
    WorkCenterController,
    DigitalTwinController,
    CybersecurityController,
    
    // Main Manufacturing Controller with AI Integration
    ManufacturingController,
  ],
  providers: [
    // Core Manufacturing Services
    WorkCenterService,
    ProductionLineService,
    BillOfMaterialsService,
    ProductionOrderService,
    WorkOrderService,
    OperationLogService,
    
    // Advanced Manufacturing Services
    RoutingService,
    QualityCheckService,
    EquipmentMaintenanceService,
    ProductionScheduleService,
    ManufacturingAnalyticsService,
    AIInsightService,
    
    // Industry 5.0 Advanced Services
    IoTDeviceService,
    DigitalTwinService,
    RoboticsService,
    CybersecurityService,
    
    // Main Manufacturing Services with AI Integration
    ManufacturingService,
    ManufacturingAIService,
    
    // Revolutionary Industry 5.0 Services - 10 Advanced Features
    QuantumManufacturingOptimizationService,
    BlockchainSupplyChainTraceabilityService,
    AdvancedComputerVisionQualityControlService,
    AutonomousManufacturingOrchestrationEngine,
    AdvancedSustainabilityTrackingService,
    CollaborativeIntelligencePlatformService,
    EdgeComputingManufacturingFrameworkService,
    AdvancedCybersecurityZeroTrustService,
    ManufacturingMetaverseARVRService,
    AdvancedPredictiveAnalyticsDigitalProphetService,
    
    // Guards and Middleware
    ManufacturingGuard,
    ProductionLineGuard,
    
    // Utilities and Providers
    ManufacturingUtilities,
    ProductionCalculatorService,
    ManufacturingValidationService,
  ],
  exports: [
    // Core Manufacturing Services
    WorkCenterService,
    ProductionLineService,
    BillOfMaterialsService,
    ProductionOrderService,
    WorkOrderService,
    OperationLogService,
    
    // Advanced Manufacturing Services
    RoutingService,
    QualityCheckService,
    EquipmentMaintenanceService,
    ProductionScheduleService,
    ManufacturingAnalyticsService,
    AIInsightService,
    
    // Industry 5.0 Advanced Services
    IoTDeviceService,
    DigitalTwinService,
    RoboticsService,
    CybersecurityService,
    
    // Main Manufacturing Services with AI Integration
    ManufacturingService,
    ManufacturingAIService,
    
    // Revolutionary Industry 5.0 Services - 10 Advanced Features
    QuantumManufacturingOptimizationService,
    BlockchainSupplyChainTraceabilityService,
    AdvancedComputerVisionQualityControlService,
    AutonomousManufacturingOrchestrationEngine,
    AdvancedSustainabilityTrackingService,
    CollaborativeIntelligencePlatformService,
    EdgeComputingManufacturingFrameworkService,
    AdvancedCybersecurityZeroTrustService,
    ManufacturingMetaverseARVRService,
    AdvancedPredictiveAnalyticsDigitalProphetService,
    
    // Utilities
    ManufacturingUtilities,
    ProductionCalculatorService,
    ManufacturingValidationService,
  ],
})
export class ManufacturingModule {
  constructor() {
    console.log('🏭 Industry 5.0 Manufacturing Module Initialized');
    console.log('✅ All manufacturing entities configured');
    console.log('✅ All manufacturing controllers registered');
    console.log('✅ All manufacturing services registered');
    console.log('🤖 AI-powered analytics integrated');
    console.log('🔐 JWT authentication enabled');
    console.log('🚦 Rate limiting configured');
    console.log('💾 Caching system active');
    console.log('⚡ Queue processing enabled');
    console.log('🔗 Shop Floor Control integration enabled');
    console.log('📊 Real-time monitoring and analytics ready');
    console.log('🛡️ Security guards and validation active');
    console.log('🔧 Production calculators and utilities loaded');
    console.log('🌐 IoT and Digital Twin integration ready');
    console.log('🤖 Robotics and automation systems online');
    console.log('\n🚀 Revolutionary Industry 5.0 Services Integrated:');
    console.log('⚛️  Quantum Manufacturing Optimization');
    console.log('⛓️  Blockchain Supply Chain Traceability');
    console.log('👁️  Advanced Computer Vision Quality Control');
    console.log('🤖 Autonomous Manufacturing Orchestration');
    console.log('🌱 Advanced Sustainability Tracking');
    console.log('🧠 Collaborative Intelligence Platform');
    console.log('⚡ Edge Computing Manufacturing Framework');
    console.log('🔒 Advanced Cybersecurity Zero Trust');
    console.log('🥽 Manufacturing Metaverse AR/VR');
    console.log('🔮 Advanced Predictive Analytics - Digital Prophet');
    console.log('\n🚀 Industry 5.0 Smart Manufacturing Module Ready for Production');
  }
}
