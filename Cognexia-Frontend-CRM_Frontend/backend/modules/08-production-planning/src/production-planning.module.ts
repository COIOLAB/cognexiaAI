// Industry 5.0 ERP Backend - Production Planning Module
// Advanced production planning with AI optimization and demand forecasting
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { ProductionPlanningController } from './controllers/ProductionPlanningController';
import { DemandForecastingController } from './controllers/demand-forecasting.controller';
import { CapacityPlanningController } from './controllers/capacity-planning.controller';
import { ResourcePlanningController } from './controllers/resource-planning.controller';
import { SchedulingController } from './controllers/scheduling.controller';
import { PlanningAnalyticsController } from './controllers/planning-analytics.controller';

// Services
import { ProductionPlanningService } from './services/production-planning.service';
import { DemandForecastingService } from './services/demand-forecasting.service';
import { CapacityPlanningService } from './services/capacity-planning.service';
import { ResourcePlanningService } from './services/resource-planning.service';
import { SchedulingOptimizationService } from './services/scheduling-optimization.service';
import { PlanningAnalyticsService } from './services/planning-analytics.service';
import { ScenarioAnalysisService } from './services/scenario-analysis.service';
import { ProductionConstraintService } from './services/production-constraint.service';
import { AIPlanningService } from './services/ai-planning.service';
import { AdvancedSchedulingService } from './services/advanced-scheduling.service';
import { PlanningOptimizationService } from './services/planning-optimization.service';
import { DemandSensingService } from './services/demand-sensing.service';
import { SupplyChainPlanningService } from './services/supply-chain-planning.service';
import { QuantumPlanningService } from './services/quantum-planning.service';

// Entities
import { ProductionPlan } from './entities/ProductionPlan';
import { DemandForecast } from './entities/DemandForecast';
import { CapacityPlan } from './entities/CapacityPlan';
import { ResourcePlan } from './entities/ResourcePlan';
import { ProductionSchedule } from './entities/ProductionSchedule';
import { PlanningScenario } from './entities/PlanningScenario';
import { ProductionConstraint } from './entities/ProductionConstraint';
import { PlanningKPI } from './entities/PlanningKPI';
import { DemandPattern } from './entities/DemandPattern';
import { PlanningAlert } from './entities/PlanningAlert';
import { ResourceAllocation } from './entities/ResourceAllocation';
import { PlanningAnalytics } from './entities/PlanningAnalytics';
import { ForecastAccuracy } from './entities/ForecastAccuracy';
import { PlanningOptimization } from './entities/PlanningOptimization';
import { ScenarioComparison } from './entities/ScenarioComparison';
import { PlanningAudit } from './entities/PlanningAudit';
import { QuantumPlanningJob } from './entities/QuantumPlanningJob';
import { AIModelPerformance } from './entities/AIModelPerformance';

// Guards and Middleware
import { ProductionPlanningGuard } from './guards/production-planning.guard';
import { CapacityAccessGuard } from './guards/capacity-access.guard';
import { SchedulingApprovalGuard } from './guards/scheduling-approval.guard';
import { CriticalPlanningGuard } from './guards/critical-planning.guard';

// Utilities and Providers
import { PlanningUtilities } from './utilities/planning.utilities';
import { ForecastingAlgorithmService } from './utilities/forecasting-algorithm.service';
import { OptimizationAlgorithmService } from './utilities/optimization-algorithm.service';
import { PlanningValidationService } from './utilities/planning-validation.service';
import { PlanningReportingService } from './utilities/planning-reporting.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductionPlan,
      DemandForecast,
      CapacityPlan,
      ResourcePlan,
      ProductionSchedule,
      PlanningScenario,
      ProductionConstraint,
      PlanningKPI,
      DemandPattern,
      PlanningAlert,
      ResourceAllocation,
      PlanningAnalytics,
      ForecastAccuracy,
      PlanningOptimization,
      ScenarioComparison,
      PlanningAudit,
      QuantumPlanningJob,
      AIModelPerformance,
    ]),
  ],
  controllers: [
    ProductionPlanningController,
    DemandForecastingController,
    CapacityPlanningController,
    ResourcePlanningController,
    SchedulingController,
    PlanningAnalyticsController,
  ],
  providers: [
    // Core Services
    ProductionPlanningService,
    DemandForecastingService,
    CapacityPlanningService,
    ResourcePlanningService,
    SchedulingOptimizationService,
    PlanningAnalyticsService,
    
    // Advanced Planning Services
    ScenarioAnalysisService,
    ProductionConstraintService,
    AIPlanningService,
    AdvancedSchedulingService,
    PlanningOptimizationService,
    DemandSensingService,
    SupplyChainPlanningService,
    
    // Industry 5.0 Quantum Services
    QuantumPlanningService,
    
    // Guards
    ProductionPlanningGuard,
    CapacityAccessGuard,
    SchedulingApprovalGuard,
    CriticalPlanningGuard,
    
    // Utilities
    PlanningUtilities,
    ForecastingAlgorithmService,
    OptimizationAlgorithmService,
    PlanningValidationService,
    PlanningReportingService,
  ],
  exports: [
    ProductionPlanningService,
    DemandForecastingService,
    CapacityPlanningService,
    ResourcePlanningService,
    SchedulingOptimizationService,
    PlanningAnalyticsService,
    ScenarioAnalysisService,
    ProductionConstraintService,
    AIPlanningService,
    AdvancedSchedulingService,
    PlanningOptimizationService,
    DemandSensingService,
    SupplyChainPlanningService,
    QuantumPlanningService,
    PlanningUtilities,
    ForecastingAlgorithmService,
    OptimizationAlgorithmService,
    PlanningValidationService,
    PlanningReportingService,
  ],
})
export class ProductionPlanningModule {}
