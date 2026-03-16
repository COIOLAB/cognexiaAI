// Industry 5.0 ERP Backend - Supply Chain Module
// Advanced supply chain management with AI optimization, IoT integration, and blockchain traceability
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Controllers
import { SupplyChainController } from './controllers/supply-chain.controller';
import { InventoryController } from './controllers/inventory.controller';
import { WarehouseController } from './controllers/warehouse.controller';
import { LogisticsController } from './controllers/logistics.controller';
import { SupplierManagementController } from './controllers/supplier-management.controller';
import { SupplyChainAnalyticsController } from './controllers/supply-chain-analytics.controller';
import { AdvancedLogisticsController } from './controllers/advanced-logistics.controller';

// Services
import { SupplyChainService } from './services/supply-chain.service';
import { InventoryManagementService } from './services/inventory-management.service';
import { WarehouseManagementService } from './services/warehouse-management.service';
import { LogisticsCoordinationService } from './services/logistics-coordination.service';
import { SupplierManagementService } from './services/supplier-management.service';
import { SupplyChainAnalyticsService } from './services/supply-chain-analytics.service';
import { AISupplyChainOptimizationService } from './services/ai-supply-chain-optimization.service';
import { BlockchainTraceabilityService } from './services/blockchain-traceability.service';
import { IoTIntegrationService } from './services/iot-integration.service';
import { RiskManagementService } from './services/risk-management.service';
import { DemandPlanningService } from './services/demand-planning.service';
import { SupplyChainVisibilityService } from './services/supply-chain-visibility.service';
import { SustainabilityTrackingService } from './services/sustainability-tracking.service';
import { ComplianceManagementService } from './services/compliance-management.service';
import { SupplyChainOptimizationEngine } from './services/SupplyChainOptimizationEngine.service';
import { RealTimeTrackingService } from './services/RealTimeTrackingService.service';

// Entities
import { InventoryItem } from './entities/InventoryItem';
import { Warehouse } from './entities/Warehouse';
import { SupplierNetwork } from './entities/SupplierNetwork';
import { LogisticsRoute } from './entities/LogisticsRoute';
import { SupplyChainAlert } from './entities/SupplyChainAlert';
import { TraceabilityRecord } from './entities/TraceabilityRecord';
import { SupplyChainMetric } from './entities/SupplyChainMetric';
import { DemandForecast } from './entities/DemandForecast';
import { RiskAssessment } from './entities/RiskAssessment';
import { SupplyChainAnalytics } from './entities/SupplyChainAnalytics';
import { ComplianceRecord } from './entities/ComplianceRecord';
import { SustainabilityMetric } from './entities/SustainabilityMetric';
import { SupplierPerformance } from './entities/SupplierPerformance';
import { InventoryTransaction } from './entities/InventoryTransaction';
import { WarehouseOperation } from './entities/WarehouseOperation';
import { LogisticsShipment } from './entities/LogisticsShipment';
import { SupplyChainKPI } from './entities/SupplyChainKPI';
import { IoTSensorData } from './entities/IoTSensorData';

// Guards and Middleware
import { SupplyChainSecurityGuard } from './guards/supply-chain-security.guard';
import { InventoryAccessGuard } from './guards/inventory-access.guard';
import { WarehouseOperationGuard } from './guards/warehouse-operation.guard';
import { SupplierDataGuard } from './guards/supplier-data.guard';

// Middleware
import { SupplyChainErrorHandlerMiddleware, SupplyChainGlobalErrorHandler } from './middleware/supply-chain-error-handler.middleware';

// Utilities and Providers
import { SupplyChainUtilities } from './utilities/supply-chain.utilities';
import { InventoryCalculatorService } from './utilities/inventory-calculator.service';
import { LogisticsOptimizationService } from './utilities/logistics-optimization.service';
import { SupplyChainValidationService } from './utilities/supply-chain-validation.service';
import { SupplyChainReportingService } from './utilities/supply-chain-reporting.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 3,
    }),
    TypeOrmModule.forFeature([
      InventoryItem,
      Warehouse,
      SupplierNetwork,
      LogisticsRoute,
      SupplyChainAlert,
      TraceabilityRecord,
      SupplyChainMetric,
      DemandForecast,
      RiskAssessment,
      SupplyChainAnalytics,
      ComplianceRecord,
      SustainabilityMetric,
      SupplierPerformance,
      InventoryTransaction,
      WarehouseOperation,
      LogisticsShipment,
      SupplyChainKPI,
      IoTSensorData,
    ]),
  ],
  controllers: [
    SupplyChainController,
    InventoryController,
    WarehouseController,
    LogisticsController,
    SupplierManagementController,
    SupplyChainAnalyticsController,
    AdvancedLogisticsController,
  ],
  providers: [
    // Core Services
    SupplyChainService,
    InventoryManagementService,
    WarehouseManagementService,
    LogisticsCoordinationService,
    SupplierManagementService,
    SupplyChainAnalyticsService,
    
    // Advanced Industry 5.0 Services
    AISupplyChainOptimizationService,
    BlockchainTraceabilityService,
    IoTIntegrationService,
    RiskManagementService,
    DemandPlanningService,
    SupplyChainVisibilityService,
    SustainabilityTrackingService,
    ComplianceManagementService,
    SupplyChainOptimizationEngine,
    RealTimeTrackingService,
    
    // Error Handling
    SupplyChainGlobalErrorHandler,
    
    // Guards
    SupplyChainSecurityGuard,
    InventoryAccessGuard,
    WarehouseOperationGuard,
    SupplierDataGuard,
    
    // Utilities
    SupplyChainUtilities,
    InventoryCalculatorService,
    LogisticsOptimizationService,
    SupplyChainValidationService,
    SupplyChainReportingService,
  ],
  exports: [
    // New Services
    SupplyChainOptimizationEngine,
    RealTimeTrackingService,
    SupplyChainGlobalErrorHandler,
    
    // Existing Services
    SupplyChainService,
    InventoryManagementService,
    WarehouseManagementService,
    LogisticsCoordinationService,
    SupplierManagementService,
    SupplyChainAnalyticsService,
    AISupplyChainOptimizationService,
    BlockchainTraceabilityService,
    IoTIntegrationService,
    RiskManagementService,
    DemandPlanningService,
    SupplyChainVisibilityService,
    SustainabilityTrackingService,
    ComplianceManagementService,
    SupplyChainUtilities,
    InventoryCalculatorService,
    LogisticsOptimizationService,
    SupplyChainValidationService,
    SupplyChainReportingService,
  ],
})
export class SupplyChainModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SupplyChainErrorHandlerMiddleware)
      .forRoutes(
        { path: 'supply-chain/*', method: RequestMethod.ALL },
        { path: 'supply-chain/advanced-logistics/*', method: RequestMethod.ALL }
      );
  }
}
