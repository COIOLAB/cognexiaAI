"use strict";
// Industry 5.0 ERP Backend - Maintenance Module
// Advanced predictive maintenance with AI, IoT, and digital twin integration
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
// Controllers
const maintenance_controller_1 = require("./controllers/maintenance.controller");
const equipment_controller_1 = require("./controllers/equipment.controller");
const work_order_controller_1 = require("./controllers/work-order.controller");
const preventive_maintenance_controller_1 = require("./controllers/preventive-maintenance.controller");
const predictive_maintenance_controller_1 = require("./controllers/predictive-maintenance.controller");
const maintenance_analytics_controller_1 = require("./controllers/maintenance-analytics.controller");
// Services
const maintenance_service_1 = require("./services/maintenance.service");
const equipment_service_1 = require("./services/equipment.service");
const work_order_service_1 = require("./services/work-order.service");
const preventive_maintenance_service_1 = require("./services/preventive-maintenance.service");
const predictive_maintenance_service_1 = require("./services/predictive-maintenance.service");
const maintenance_scheduling_service_1 = require("./services/maintenance-scheduling.service");
const maintenance_analytics_service_1 = require("./services/maintenance-analytics.service");
const spare_parts_management_service_1 = require("./services/spare-parts-management.service");
const condition_monitoring_service_1 = require("./services/condition-monitoring.service");
const maintenance_optimization_service_1 = require("./services/maintenance-optimization.service");
const ai_maintenance_service_1 = require("./services/ai-maintenance.service");
const iot_maintenance_service_1 = require("./services/iot-maintenance.service");
const digital_twin_maintenance_service_1 = require("./services/digital-twin-maintenance.service");
// Entities
const Equipment_1 = require("./entities/Equipment");
const MaintenanceWorkOrder_1 = require("./entities/MaintenanceWorkOrder");
const MaintenanceSchedule_1 = require("./entities/MaintenanceSchedule");
const MaintenanceTask_1 = require("./entities/MaintenanceTask");
const SparePart_1 = require("./entities/SparePart");
const MaintenanceHistory_1 = require("./entities/MaintenanceHistory");
const EquipmentSensor_1 = require("./entities/EquipmentSensor");
const PredictiveModel_1 = require("./entities/PredictiveModel");
const MaintenanceAlert_1 = require("./entities/MaintenanceAlert");
const MaintenanceTechnician_1 = require("./entities/MaintenanceTechnician");
const MaintenanceAnalytics_1 = require("./entities/MaintenanceAnalytics");
const ConditionMonitoringData_1 = require("./entities/ConditionMonitoringData");
const MaintenanceCost_1 = require("./entities/MaintenanceCost");
const EquipmentDowntime_1 = require("./entities/EquipmentDowntime");
const MaintenanceKPI_1 = require("./entities/MaintenanceKPI");
// Guards and Middleware
const maintenance_guard_1 = require("./guards/maintenance.guard");
const equipment_access_guard_1 = require("./guards/equipment-access.guard");
const critical_maintenance_guard_1 = require("./guards/critical-maintenance.guard");
// Utilities and Providers
const maintenance_utilities_1 = require("./utilities/maintenance.utilities");
const maintenance_calculator_service_1 = require("./utilities/maintenance-calculator.service");
const maintenance_validation_service_1 = require("./utilities/maintenance-validation.service");
const maintenance_reporting_service_1 = require("./utilities/maintenance-reporting.service");
let MaintenanceModule = class MaintenanceModule {
};
exports.MaintenanceModule = MaintenanceModule;
exports.MaintenanceModule = MaintenanceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                Equipment_1.Equipment,
                MaintenanceWorkOrder_1.MaintenanceWorkOrder,
                MaintenanceSchedule_1.MaintenanceSchedule,
                MaintenanceTask_1.MaintenanceTask,
                SparePart_1.SparePart,
                MaintenanceHistory_1.MaintenanceHistory,
                EquipmentSensor_1.EquipmentSensor,
                PredictiveModel_1.PredictiveModel,
                MaintenanceAlert_1.MaintenanceAlert,
                MaintenanceTechnician_1.MaintenanceTechnician,
                MaintenanceAnalytics_1.MaintenanceAnalytics,
                ConditionMonitoringData_1.ConditionMonitoringData,
                MaintenanceCost_1.MaintenanceCost,
                EquipmentDowntime_1.EquipmentDowntime,
                MaintenanceKPI_1.MaintenanceKPI,
            ]),
        ],
        controllers: [
            maintenance_controller_1.MaintenanceController,
            equipment_controller_1.EquipmentController,
            work_order_controller_1.WorkOrderController,
            preventive_maintenance_controller_1.PreventiveMaintenanceController,
            predictive_maintenance_controller_1.PredictiveMaintenanceController,
            maintenance_analytics_controller_1.MaintenanceAnalyticsController,
        ],
        providers: [
            // Core Services
            maintenance_service_1.MaintenanceService,
            equipment_service_1.EquipmentService,
            work_order_service_1.WorkOrderService,
            preventive_maintenance_service_1.PreventiveMaintenanceService,
            predictive_maintenance_service_1.PredictiveMaintenanceService,
            maintenance_scheduling_service_1.MaintenanceSchedulingService,
            // Analytics and Management
            maintenance_analytics_service_1.MaintenanceAnalyticsService,
            spare_parts_management_service_1.SparePartsManagementService,
            condition_monitoring_service_1.ConditionMonitoringService,
            maintenance_optimization_service_1.MaintenanceOptimizationService,
            // Advanced Industry 5.0 Services
            ai_maintenance_service_1.AIMaintenanceService,
            iot_maintenance_service_1.IoTMaintenanceService,
            digital_twin_maintenance_service_1.DigitalTwinMaintenanceService,
            // Guards
            maintenance_guard_1.MaintenanceGuard,
            equipment_access_guard_1.EquipmentAccessGuard,
            critical_maintenance_guard_1.CriticalMaintenanceGuard,
            // Utilities
            maintenance_utilities_1.MaintenanceUtilities,
            maintenance_calculator_service_1.MaintenanceCalculatorService,
            maintenance_validation_service_1.MaintenanceValidationService,
            maintenance_reporting_service_1.MaintenanceReportingService,
        ],
        exports: [
            maintenance_service_1.MaintenanceService,
            equipment_service_1.EquipmentService,
            work_order_service_1.WorkOrderService,
            preventive_maintenance_service_1.PreventiveMaintenanceService,
            predictive_maintenance_service_1.PredictiveMaintenanceService,
            maintenance_scheduling_service_1.MaintenanceSchedulingService,
            maintenance_analytics_service_1.MaintenanceAnalyticsService,
            spare_parts_management_service_1.SparePartsManagementService,
            condition_monitoring_service_1.ConditionMonitoringService,
            maintenance_optimization_service_1.MaintenanceOptimizationService,
            ai_maintenance_service_1.AIMaintenanceService,
            iot_maintenance_service_1.IoTMaintenanceService,
            digital_twin_maintenance_service_1.DigitalTwinMaintenanceService,
            maintenance_utilities_1.MaintenanceUtilities,
            maintenance_calculator_service_1.MaintenanceCalculatorService,
            maintenance_validation_service_1.MaintenanceValidationService,
            maintenance_reporting_service_1.MaintenanceReportingService,
        ],
    })
], MaintenanceModule);
//# sourceMappingURL=maintenance.module.js.map