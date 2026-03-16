import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { SecurityModule } from './security/security.module';
import { ComplianceModule } from './compliance/compliance.module';
import { ZeroTrustModule } from './zero-trust/zero-trust.module';

// Legacy Controllers and Services (preserved for backward compatibility)
import { InventoryController } from './controllers/InventoryController';
import { InventoryService } from './services/InventoryService';

// Legacy Entities (preserved for backward compatibility)
import {
  StockTransaction,
  StockLocation,
  CycleCount,
  InventoryAdjustment,
  InventoryAlert,
  ReorderPoint
} from './entities';

// Industry 5.0 Enhanced Entities
import { InventoryItem } from './entities/InventoryItem.entity';
import { StockMovement } from './entities/StockMovement.entity';
import { InventoryLocation } from './entities/InventoryLocation.entity';

// Industry 5.0 Advanced Services
import { InventoryIntelligenceService } from './services/inventory-intelligence.service';
import { RealTimeTrackingService } from './services/real-time-tracking.service';
import { QuantumOptimizationService } from './services/quantum-optimization.service';
import { AutonomousInventoryService } from './services/autonomous-inventory.service';
import { AdvancedWarehouseService } from './services/advanced-warehouse.service';
import { AnalyticsReportingService } from './services/analytics-reporting.service';
import { SecurityComplianceService } from './services/security-compliance.service';

@Module({
  imports: [
    // Database Configuration
    TypeOrmModule.forFeature([
      // Legacy entities (preserved for backward compatibility)
      StockTransaction,
      StockLocation,
      CycleCount,
      InventoryAdjustment,
      InventoryAlert,
      ReorderPoint,
      
      // Industry 5.0 Enhanced entities
      InventoryItem,
      StockMovement,
      InventoryLocation,
    ]),

    // Event System for real-time operations
    EventEmitterModule,

    // Scheduling for autonomous operations
    ScheduleModule.forRoot(),

    // Queue Management for background processing
    BullModule.registerQueue(
      { name: 'inventory-intelligence' },
      { name: 'real-time-tracking' },
      { name: 'quantum-optimization' },
      { name: 'autonomous-operations' },
      { name: 'warehouse-management' },
      { name: 'analytics-processing' },
      { name: 'security-monitoring' },
      { name: 'compliance-reporting' },
    ),

    // Caching for performance optimization
    CacheModule.register({
      ttl: 300, // 5 minutes default TTL
      max: 1000, // Maximum number of items in cache
    }),

    // Government-grade security features
    SecurityModule,
    
    // Compliance & audit framework
    ComplianceModule,
    
    // Zero-trust security architecture
    ZeroTrustModule,
    
    // Configuration module
    ConfigModule,
  ],
  controllers: [
    // Legacy controller (preserved for backward compatibility)
    InventoryController,
    
    // Additional controllers can be added here when created
    // IntelligenceController,
    // TrackingController,
    // WarehouseController,
    // AnalyticsController,
    // SecurityController,
  ],
  providers: [
    // Legacy service (preserved for backward compatibility)
    InventoryService,
    
    // Industry 5.0 Advanced Services
    InventoryIntelligenceService,
    RealTimeTrackingService,
    QuantumOptimizationService,
    AutonomousInventoryService,
    AdvancedWarehouseService,
    AnalyticsReportingService,
    // SecurityComplianceService now provided by SecurityModule

    // Event Handlers Configuration
    {
      provide: 'INVENTORY_EVENT_HANDLERS',
      useFactory: () => ({
        'item.created': 'onInventoryItemCreated',
        'item.updated': 'onInventoryItemUpdated',
        'item.deleted': 'onInventoryItemDeleted',
        'stock.movement': 'onStockMovement',
        'location.changed': 'onLocationChanged',
        'threshold.violated': 'onThresholdViolated',
        'quality.alert': 'onQualityAlert',
        'security.incident': 'onSecurityIncident',
        'compliance.violation': 'onComplianceViolation',
        'optimization.completed': 'onOptimizationCompleted',
        'autonomous.decision': 'onAutonomousDecision',
        'warehouse.alert': 'onWarehouseAlert',
        'analytics.generated': 'onAnalyticsGenerated',
      }),
    },

    // Queue Processors Configuration
    {
      provide: 'QUEUE_PROCESSORS',
      useFactory: () => ({
        'inventory-intelligence': [
          'processDemandForecasting',
          'processStockOptimization',
          'processABCAnalysis',
          'processQualityPrediction',
          'processMarketAnalysis',
        ],
        'real-time-tracking': [
          'processIoTData',
          'processRFIDUpdates',
          'processBarcodeScans',
          'processLocationUpdates',
          'processAlertGeneration',
        ],
        'quantum-optimization': [
          'processInventoryPlacement',
          'processWarehouseRouting',
          'processMultiWarehouseOptimization',
          'processSlottingOptimization',
          'processCapacityPlanning',
        ],
        'autonomous-operations': [
          'processReorderDecisions',
          'processSafetyStockAdjustments',
          'processInventoryTransfers',
          'processQualityActions',
          'processDemandResponse',
        ],
        'warehouse-management': [
          'processPickOptimization',
          'processPackOptimization',
          'processSlottingOperations',
          'processWaveManagement',
          'processLayoutOptimization',
        ],
        'analytics-processing': [
          'processKPICalculations',
          'processReportGeneration',
          'processPredictiveAnalytics',
          'processDataScience',
          'processVisualization',
        ],
        'security-monitoring': [
          'processSecurityMonitoring',
          'processIncidentResponse',
          'processIntegrityChecks',
          'processPolicyEnforcement',
          'processAnomalyDetection',
        ],
        'compliance-reporting': [
          'processComplianceChecks',
          'processAuditReporting',
          'processRegulatoryReporting',
          'processDataRetention',
          'processPrivacyCompliance',
        ],
      }),
    },

    // Health Checks Configuration
    {
      provide: 'HEALTH_INDICATORS',
      useFactory: () => ({
        database: 'checkDatabaseHealth',
        cache: 'checkCacheHealth',
        queues: 'checkQueueHealth',
        services: 'checkServiceHealth',
        security: 'checkSecurityHealth',
        iot: 'checkIoTConnectivity',
        ai: 'checkAIServices',
        quantum: 'checkQuantumServices',
      }),
    },
  ],
  exports: [
    // Legacy exports (preserved for backward compatibility)
    InventoryService,
    TypeOrmModule,
    
    // Export SecurityModule for use by other modules
    SecurityModule,
    
    // Export ComplianceModule for use by other modules
    ComplianceModule,
    
    // Export ZeroTrustModule for use by other modules
    ZeroTrustModule,
    
    // Industry 5.0 Advanced Services exports
    InventoryIntelligenceService,
    RealTimeTrackingService,
    QuantumOptimizationService,
    AutonomousInventoryService,
    AdvancedWarehouseService,
    AnalyticsReportingService,
    // SecurityComplianceService now provided by SecurityModule
  ],
})
export class InventoryModule {}
