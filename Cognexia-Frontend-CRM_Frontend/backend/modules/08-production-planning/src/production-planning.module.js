"use strict";
// Industry 5.0 ERP Backend - Production Planning Module
// Advanced production planning with AI optimization and demand forecasting
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionPlanningModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
// Controllers
const production_planning_controller_1 = require("./controllers/production-planning.controller");
const demand_forecasting_controller_1 = require("./controllers/demand-forecasting.controller");
const capacity_planning_controller_1 = require("./controllers/capacity-planning.controller");
const resource_planning_controller_1 = require("./controllers/resource-planning.controller");
const scheduling_controller_1 = require("./controllers/scheduling.controller");
const planning_analytics_controller_1 = require("./controllers/planning-analytics.controller");
// Services
const production_planning_service_1 = require("./services/production-planning.service");
const demand_forecasting_service_1 = require("./services/demand-forecasting.service");
const capacity_planning_service_1 = require("./services/capacity-planning.service");
const resource_planning_service_1 = require("./services/resource-planning.service");
const scheduling_optimization_service_1 = require("./services/scheduling-optimization.service");
const planning_analytics_service_1 = require("./services/planning-analytics.service");
const scenario_analysis_service_1 = require("./services/scenario-analysis.service");
const production_constraint_service_1 = require("./services/production-constraint.service");
const ai_planning_service_1 = require("./services/ai-planning.service");
const advanced_scheduling_service_1 = require("./services/advanced-scheduling.service");
const planning_optimization_service_1 = require("./services/planning-optimization.service");
const demand_sensing_service_1 = require("./services/demand-sensing.service");
const supply_chain_planning_service_1 = require("./services/supply-chain-planning.service");
const quantum_planning_service_1 = require("./services/quantum-planning.service");
// Entities
const ProductionPlan_1 = require("./entities/ProductionPlan");
const DemandForecast_1 = require("./entities/DemandForecast");
const CapacityPlan_1 = require("./entities/CapacityPlan");
const ResourcePlan_1 = require("./entities/ResourcePlan");
const ProductionSchedule_1 = require("./entities/ProductionSchedule");
const PlanningScenario_1 = require("./entities/PlanningScenario");
const ProductionConstraint_1 = require("./entities/ProductionConstraint");
const PlanningKPI_1 = require("./entities/PlanningKPI");
const DemandPattern_1 = require("./entities/DemandPattern");
const PlanningAlert_1 = require("./entities/PlanningAlert");
const ResourceAllocation_1 = require("./entities/ResourceAllocation");
const PlanningAnalytics_1 = require("./entities/PlanningAnalytics");
const ForecastAccuracy_1 = require("./entities/ForecastAccuracy");
const PlanningOptimization_1 = require("./entities/PlanningOptimization");
const ScenarioComparison_1 = require("./entities/ScenarioComparison");
const PlanningAudit_1 = require("./entities/PlanningAudit");
const QuantumPlanningJob_1 = require("./entities/QuantumPlanningJob");
const AIModelPerformance_1 = require("./entities/AIModelPerformance");
// Guards and Middleware
const production_planning_guard_1 = require("./guards/production-planning.guard");
const capacity_access_guard_1 = require("./guards/capacity-access.guard");
const scheduling_approval_guard_1 = require("./guards/scheduling-approval.guard");
const critical_planning_guard_1 = require("./guards/critical-planning.guard");
// Utilities and Providers
const planning_utilities_1 = require("./utilities/planning.utilities");
const forecasting_algorithm_service_1 = require("./utilities/forecasting-algorithm.service");
const optimization_algorithm_service_1 = require("./utilities/optimization-algorithm.service");
const planning_validation_service_1 = require("./utilities/planning-validation.service");
const planning_reporting_service_1 = require("./utilities/planning-reporting.service");
let ProductionPlanningModule = class ProductionPlanningModule {
};
exports.ProductionPlanningModule = ProductionPlanningModule;
exports.ProductionPlanningModule = ProductionPlanningModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                ProductionPlan_1.ProductionPlan,
                DemandForecast_1.DemandForecast,
                CapacityPlan_1.CapacityPlan,
                ResourcePlan_1.ResourcePlan,
                ProductionSchedule_1.ProductionSchedule,
                PlanningScenario_1.PlanningScenario,
                ProductionConstraint_1.ProductionConstraint,
                PlanningKPI_1.PlanningKPI,
                DemandPattern_1.DemandPattern,
                PlanningAlert_1.PlanningAlert,
                ResourceAllocation_1.ResourceAllocation,
                PlanningAnalytics_1.PlanningAnalytics,
                ForecastAccuracy_1.ForecastAccuracy,
                PlanningOptimization_1.PlanningOptimization,
                ScenarioComparison_1.ScenarioComparison,
                PlanningAudit_1.PlanningAudit,
                QuantumPlanningJob_1.QuantumPlanningJob,
                AIModelPerformance_1.AIModelPerformance,
            ]),
        ],
        controllers: [
            production_planning_controller_1.ProductionPlanningController,
            demand_forecasting_controller_1.DemandForecastingController,
            capacity_planning_controller_1.CapacityPlanningController,
            resource_planning_controller_1.ResourcePlanningController,
            scheduling_controller_1.SchedulingController,
            planning_analytics_controller_1.PlanningAnalyticsController,
        ],
        providers: [
            // Core Services
            production_planning_service_1.ProductionPlanningService,
            demand_forecasting_service_1.DemandForecastingService,
            capacity_planning_service_1.CapacityPlanningService,
            resource_planning_service_1.ResourcePlanningService,
            scheduling_optimization_service_1.SchedulingOptimizationService,
            planning_analytics_service_1.PlanningAnalyticsService,
            // Advanced Planning Services
            scenario_analysis_service_1.ScenarioAnalysisService,
            production_constraint_service_1.ProductionConstraintService,
            ai_planning_service_1.AIPlanningService,
            advanced_scheduling_service_1.AdvancedSchedulingService,
            planning_optimization_service_1.PlanningOptimizationService,
            demand_sensing_service_1.DemandSensingService,
            supply_chain_planning_service_1.SupplyChainPlanningService,
            // Industry 5.0 Quantum Services
            quantum_planning_service_1.QuantumPlanningService,
            // Guards
            production_planning_guard_1.ProductionPlanningGuard,
            capacity_access_guard_1.CapacityAccessGuard,
            scheduling_approval_guard_1.SchedulingApprovalGuard,
            critical_planning_guard_1.CriticalPlanningGuard,
            // Utilities
            planning_utilities_1.PlanningUtilities,
            forecasting_algorithm_service_1.ForecastingAlgorithmService,
            optimization_algorithm_service_1.OptimizationAlgorithmService,
            planning_validation_service_1.PlanningValidationService,
            planning_reporting_service_1.PlanningReportingService,
        ],
        exports: [
            production_planning_service_1.ProductionPlanningService,
            demand_forecasting_service_1.DemandForecastingService,
            capacity_planning_service_1.CapacityPlanningService,
            resource_planning_service_1.ResourcePlanningService,
            scheduling_optimization_service_1.SchedulingOptimizationService,
            planning_analytics_service_1.PlanningAnalyticsService,
            scenario_analysis_service_1.ScenarioAnalysisService,
            production_constraint_service_1.ProductionConstraintService,
            ai_planning_service_1.AIPlanningService,
            advanced_scheduling_service_1.AdvancedSchedulingService,
            planning_optimization_service_1.PlanningOptimizationService,
            demand_sensing_service_1.DemandSensingService,
            supply_chain_planning_service_1.SupplyChainPlanningService,
            quantum_planning_service_1.QuantumPlanningService,
            planning_utilities_1.PlanningUtilities,
            forecasting_algorithm_service_1.ForecastingAlgorithmService,
            optimization_algorithm_service_1.OptimizationAlgorithmService,
            planning_validation_service_1.PlanningValidationService,
            planning_reporting_service_1.PlanningReportingService,
        ],
    })
], ProductionPlanningModule);
//# sourceMappingURL=production-planning.module.js.map