"use strict";
// Industry 5.0 ERP Backend - Supply Chain Module
// Advanced supply chain management with AI optimization, IoT integration, and blockchain traceability
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplyChainModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("@nestjs/axios");
// Controllers
const supply_chain_controller_1 = require("./controllers/supply-chain.controller");
const inventory_controller_1 = require("./controllers/inventory.controller");
const warehouse_controller_1 = require("./controllers/warehouse.controller");
const logistics_controller_1 = require("./controllers/logistics.controller");
const supplier_management_controller_1 = require("./controllers/supplier-management.controller");
const supply_chain_analytics_controller_1 = require("./controllers/supply-chain-analytics.controller");
// Services
const supply_chain_service_1 = require("./services/supply-chain.service");
const inventory_management_service_1 = require("./services/inventory-management.service");
const warehouse_management_service_1 = require("./services/warehouse-management.service");
const logistics_coordination_service_1 = require("./services/logistics-coordination.service");
const supplier_management_service_1 = require("./services/supplier-management.service");
const supply_chain_analytics_service_1 = require("./services/supply-chain-analytics.service");
const ai_supply_chain_optimization_service_1 = require("./services/ai-supply-chain-optimization.service");
const blockchain_traceability_service_1 = require("./services/blockchain-traceability.service");
const iot_integration_service_1 = require("./services/iot-integration.service");
const risk_management_service_1 = require("./services/risk-management.service");
const demand_planning_service_1 = require("./services/demand-planning.service");
const supply_chain_visibility_service_1 = require("./services/supply-chain-visibility.service");
const sustainability_tracking_service_1 = require("./services/sustainability-tracking.service");
const compliance_management_service_1 = require("./services/compliance-management.service");
// Entities
const InventoryItem_1 = require("./entities/InventoryItem");
const Warehouse_1 = require("./entities/Warehouse");
const SupplierNetwork_1 = require("./entities/SupplierNetwork");
const LogisticsRoute_1 = require("./entities/LogisticsRoute");
const SupplyChainAlert_1 = require("./entities/SupplyChainAlert");
const TraceabilityRecord_1 = require("./entities/TraceabilityRecord");
const SupplyChainMetric_1 = require("./entities/SupplyChainMetric");
const DemandForecast_1 = require("./entities/DemandForecast");
const RiskAssessment_1 = require("./entities/RiskAssessment");
const SupplyChainAnalytics_1 = require("./entities/SupplyChainAnalytics");
const ComplianceRecord_1 = require("./entities/ComplianceRecord");
const SustainabilityMetric_1 = require("./entities/SustainabilityMetric");
const SupplierPerformance_1 = require("./entities/SupplierPerformance");
const InventoryTransaction_1 = require("./entities/InventoryTransaction");
const WarehouseOperation_1 = require("./entities/WarehouseOperation");
const LogisticsShipment_1 = require("./entities/LogisticsShipment");
const SupplyChainKPI_1 = require("./entities/SupplyChainKPI");
const IoTSensorData_1 = require("./entities/IoTSensorData");
// Guards and Middleware
const supply_chain_security_guard_1 = require("./guards/supply-chain-security.guard");
const inventory_access_guard_1 = require("./guards/inventory-access.guard");
const warehouse_operation_guard_1 = require("./guards/warehouse-operation.guard");
const supplier_data_guard_1 = require("./guards/supplier-data.guard");
// Utilities and Providers
const supply_chain_utilities_1 = require("./utilities/supply-chain.utilities");
const inventory_calculator_service_1 = require("./utilities/inventory-calculator.service");
const logistics_optimization_service_1 = require("./utilities/logistics-optimization.service");
const supply_chain_validation_service_1 = require("./utilities/supply-chain-validation.service");
const supply_chain_reporting_service_1 = require("./utilities/supply-chain-reporting.service");
let SupplyChainModule = class SupplyChainModule {
};
exports.SupplyChainModule = SupplyChainModule;
exports.SupplyChainModule = SupplyChainModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule.register({
                timeout: 30000,
                maxRedirects: 3,
            }),
            typeorm_1.TypeOrmModule.forFeature([
                InventoryItem_1.InventoryItem,
                Warehouse_1.Warehouse,
                SupplierNetwork_1.SupplierNetwork,
                LogisticsRoute_1.LogisticsRoute,
                SupplyChainAlert_1.SupplyChainAlert,
                TraceabilityRecord_1.TraceabilityRecord,
                SupplyChainMetric_1.SupplyChainMetric,
                DemandForecast_1.DemandForecast,
                RiskAssessment_1.RiskAssessment,
                SupplyChainAnalytics_1.SupplyChainAnalytics,
                ComplianceRecord_1.ComplianceRecord,
                SustainabilityMetric_1.SustainabilityMetric,
                SupplierPerformance_1.SupplierPerformance,
                InventoryTransaction_1.InventoryTransaction,
                WarehouseOperation_1.WarehouseOperation,
                LogisticsShipment_1.LogisticsShipment,
                SupplyChainKPI_1.SupplyChainKPI,
                IoTSensorData_1.IoTSensorData,
            ]),
        ],
        controllers: [
            supply_chain_controller_1.SupplyChainController,
            inventory_controller_1.InventoryController,
            warehouse_controller_1.WarehouseController,
            logistics_controller_1.LogisticsController,
            supplier_management_controller_1.SupplierManagementController,
            supply_chain_analytics_controller_1.SupplyChainAnalyticsController,
        ],
        providers: [
            // Core Services
            supply_chain_service_1.SupplyChainService,
            inventory_management_service_1.InventoryManagementService,
            warehouse_management_service_1.WarehouseManagementService,
            logistics_coordination_service_1.LogisticsCoordinationService,
            supplier_management_service_1.SupplierManagementService,
            supply_chain_analytics_service_1.SupplyChainAnalyticsService,
            // Advanced Industry 5.0 Services
            ai_supply_chain_optimization_service_1.AISupplyChainOptimizationService,
            blockchain_traceability_service_1.BlockchainTraceabilityService,
            iot_integration_service_1.IoTIntegrationService,
            risk_management_service_1.RiskManagementService,
            demand_planning_service_1.DemandPlanningService,
            supply_chain_visibility_service_1.SupplyChainVisibilityService,
            sustainability_tracking_service_1.SustainabilityTrackingService,
            compliance_management_service_1.ComplianceManagementService,
            // Guards
            supply_chain_security_guard_1.SupplyChainSecurityGuard,
            inventory_access_guard_1.InventoryAccessGuard,
            warehouse_operation_guard_1.WarehouseOperationGuard,
            supplier_data_guard_1.SupplierDataGuard,
            // Utilities
            supply_chain_utilities_1.SupplyChainUtilities,
            inventory_calculator_service_1.InventoryCalculatorService,
            logistics_optimization_service_1.LogisticsOptimizationService,
            supply_chain_validation_service_1.SupplyChainValidationService,
            supply_chain_reporting_service_1.SupplyChainReportingService,
        ],
        exports: [
            supply_chain_service_1.SupplyChainService,
            inventory_management_service_1.InventoryManagementService,
            warehouse_management_service_1.WarehouseManagementService,
            logistics_coordination_service_1.LogisticsCoordinationService,
            supplier_management_service_1.SupplierManagementService,
            supply_chain_analytics_service_1.SupplyChainAnalyticsService,
            ai_supply_chain_optimization_service_1.AISupplyChainOptimizationService,
            blockchain_traceability_service_1.BlockchainTraceabilityService,
            iot_integration_service_1.IoTIntegrationService,
            risk_management_service_1.RiskManagementService,
            demand_planning_service_1.DemandPlanningService,
            supply_chain_visibility_service_1.SupplyChainVisibilityService,
            sustainability_tracking_service_1.SustainabilityTrackingService,
            compliance_management_service_1.ComplianceManagementService,
            supply_chain_utilities_1.SupplyChainUtilities,
            inventory_calculator_service_1.InventoryCalculatorService,
            logistics_optimization_service_1.LogisticsOptimizationService,
            supply_chain_validation_service_1.SupplyChainValidationService,
            supply_chain_reporting_service_1.SupplyChainReportingService,
        ],
    })
], SupplyChainModule);
//# sourceMappingURL=supply-chain.module.js.map