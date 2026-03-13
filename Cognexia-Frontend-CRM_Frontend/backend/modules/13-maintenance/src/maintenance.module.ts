// Industry 5.0 ERP Backend - Maintenance Module
// Advanced predictive maintenance with AI, IoT, and digital twin integration
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { MaintenanceController } from './controllers/maintenance.controller';
import { EquipmentController } from './controllers/equipment.controller';
import { WorkOrderController } from './controllers/work-order.controller';
import { PreventiveMaintenanceController } from './controllers/preventive-maintenance.controller';
import { PredictiveMaintenanceController } from './controllers/predictive-maintenance.controller';
import { MaintenanceAnalyticsController } from './controllers/maintenance-analytics.controller';

// Services
import { MaintenanceService } from './services/maintenance.service';
import { EquipmentService } from './services/equipment.service';
import { WorkOrderService } from './services/work-order.service';
import { PreventiveMaintenanceService } from './services/preventive-maintenance.service';
import { PredictiveMaintenanceService } from './services/predictive-maintenance.service';
import { MaintenanceSchedulingService } from './services/maintenance-scheduling.service';
import { MaintenanceAnalyticsService } from './services/maintenance-analytics.service';
import { SparePartsManagementService } from './services/spare-parts-management.service';
import { ConditionMonitoringService } from './services/condition-monitoring.service';
import { MaintenanceOptimizationService } from './services/maintenance-optimization.service';
import { AIMaintenanceService } from './services/ai-maintenance.service';
import { IoTMaintenanceService } from './services/iot-maintenance.service';
import { DigitalTwinMaintenanceService } from './services/digital-twin-maintenance.service';

// Entities
import { Equipment } from './entities/Equipment';
import { MaintenanceWorkOrder } from './entities/MaintenanceWorkOrder';
import { MaintenanceSchedule } from './entities/MaintenanceSchedule';
import { MaintenanceTask } from './entities/MaintenanceTask';
import { SparePart } from './entities/SparePart';
import { MaintenanceHistory } from './entities/MaintenanceHistory';
import { EquipmentSensor } from './entities/EquipmentSensor';
import { PredictiveModel } from './entities/PredictiveModel';
import { MaintenanceAlert } from './entities/MaintenanceAlert';
import { MaintenanceTechnician } from './entities/MaintenanceTechnician';
import { MaintenanceAnalytics } from './entities/MaintenanceAnalytics';
import { ConditionMonitoringData } from './entities/ConditionMonitoringData';
import { MaintenanceCost } from './entities/MaintenanceCost';
import { EquipmentDowntime } from './entities/EquipmentDowntime';
import { MaintenanceKPI } from './entities/MaintenanceKPI';

// Guards and Middleware
import { MaintenanceGuard } from './guards/maintenance.guard';
import { EquipmentAccessGuard } from './guards/equipment-access.guard';
import { CriticalMaintenanceGuard } from './guards/critical-maintenance.guard';

// Utilities and Providers
import { MaintenanceUtilities } from './utilities/maintenance.utilities';
import { MaintenanceCalculatorService } from './utilities/maintenance-calculator.service';
import { MaintenanceValidationService } from './utilities/maintenance-validation.service';
import { MaintenanceReportingService } from './utilities/maintenance-reporting.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Equipment,
      MaintenanceWorkOrder,
      MaintenanceSchedule,
      MaintenanceTask,
      SparePart,
      MaintenanceHistory,
      EquipmentSensor,
      PredictiveModel,
      MaintenanceAlert,
      MaintenanceTechnician,
      MaintenanceAnalytics,
      ConditionMonitoringData,
      MaintenanceCost,
      EquipmentDowntime,
      MaintenanceKPI,
    ]),
  ],
  controllers: [
    MaintenanceController,
    EquipmentController,
    WorkOrderController,
    PreventiveMaintenanceController,
    PredictiveMaintenanceController,
    MaintenanceAnalyticsController,
  ],
  providers: [
    // Core Services
    MaintenanceService,
    EquipmentService,
    WorkOrderService,
    PreventiveMaintenanceService,
    PredictiveMaintenanceService,
    MaintenanceSchedulingService,
    
    // Analytics and Management
    MaintenanceAnalyticsService,
    SparePartsManagementService,
    ConditionMonitoringService,
    MaintenanceOptimizationService,
    
    // Advanced Industry 5.0 Services
    AIMaintenanceService,
    IoTMaintenanceService,
    DigitalTwinMaintenanceService,
    
    // Guards
    MaintenanceGuard,
    EquipmentAccessGuard,
    CriticalMaintenanceGuard,
    
    // Utilities
    MaintenanceUtilities,
    MaintenanceCalculatorService,
    MaintenanceValidationService,
    MaintenanceReportingService,
  ],
  exports: [
    MaintenanceService,
    EquipmentService,
    WorkOrderService,
    PreventiveMaintenanceService,
    PredictiveMaintenanceService,
    MaintenanceSchedulingService,
    MaintenanceAnalyticsService,
    SparePartsManagementService,
    ConditionMonitoringService,
    MaintenanceOptimizationService,
    AIMaintenanceService,
    IoTMaintenanceService,
    DigitalTwinMaintenanceService,
    MaintenanceUtilities,
    MaintenanceCalculatorService,
    MaintenanceValidationService,
    MaintenanceReportingService,
  ],
})
export class MaintenanceModule {}
