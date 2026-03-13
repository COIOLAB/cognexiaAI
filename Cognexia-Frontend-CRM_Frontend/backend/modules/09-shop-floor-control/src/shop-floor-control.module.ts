// Industry 5.0 ERP Backend - Shop Floor Control Module
// Advanced shop floor automation with robotics, IoT, and human-AI collaboration
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { ShopFloorControlController } from './controllers/shop-floor-control.controller';
import { RoboticsController } from './controllers/robotics.controller';
import { IoTIntegrationController } from './controllers/iot-integration.controller';
import { HumanAICollaborationController } from './controllers/human-ai-collaboration.controller';
import { SafetySystemsController } from './controllers/safety-systems.controller';
import { DigitalTwinController } from './controllers/digital-twin.controller';

// Services
import { ShopFloorControlService } from './services/shop-floor-control.service';
import { HumanAICollaborationService } from './services/human-ai-collaboration.service';
import { AdaptiveManufacturingService } from './services/adaptive-manufacturing.service';
import { IoTIntegrationService } from './services/iot-integration.service';
import { CollaborativeRoboticsService } from './services/collaborative-robotics.service';
import { HumanRobotSafetyService } from './services/human-robot-safety.service';
import { AutonomousRobotCoordinationService } from './services/autonomous-robot-coordination.service';
import { CollaborativeTaskExecutionService } from './services/collaborative-task-execution.service';
import { DigitalTwinIntegrationService } from './services/digital-twin-integration.service';
import { AIRobotLearningService } from './services/ai-robot-learning.service';
import { IndustrialCybersecurityService } from './services/industrial-cybersecurity.service';
import { AdvancedAnalyticsService } from './services/advanced-analytics.service';
import { EdgeComputingService } from './services/edge-computing.service';
import { QuantumOptimizationService } from './services/quantum-optimization.service';

// Entities
import { ShopFloorStation } from './entities/ShopFloorStation';
import { RobotUnit } from './entities/RobotUnit';
import { IoTDevice } from './entities/IoTDevice';
import { CollaborativeTask } from './entities/CollaborativeTask';
import { SafetyIncident } from './entities/SafetyIncident';
import { WorkstationOperator } from './entities/WorkstationOperator';
import { ProductionMetric } from './entities/ProductionMetric';
import { ShopFloorAlert } from './entities/ShopFloorAlert';
import { DigitalTwin } from './entities/DigitalTwin';
import { AILearningModel } from './entities/AILearningModel';
import { RobotMaintenance } from './entities/RobotMaintenance';
import { HumanRobotInteraction } from './entities/HumanRobotInteraction';
import { ShopFloorAnalytics } from './entities/ShopFloorAnalytics';
import { CybersecurityEvent } from './entities/CybersecurityEvent';
import { EdgeComputeNode } from './entities/EdgeComputeNode';
import { QuantumOptimizationJob } from './entities/QuantumOptimizationJob';
import { ShopFloorKPI } from './entities/ShopFloorKPI';
import { RobotPerformance } from './entities/RobotPerformance';

// New Industry 5.0 Entities
import { Robot } from './entities/robot.entity';
import { WorkCell } from './entities/work-cell.entity';
import { RobotTask } from './entities/robot-task.entity';
import { TaskStep } from './entities/task-step.entity';

// Guards and Middleware
import { ShopFloorSecurityGuard } from './guards/shop-floor-security.guard';
import { RoboticsAccessGuard } from './guards/robotics-access.guard';
import { SafetyProtocolGuard } from './guards/safety-protocol.guard';
import { CriticalOperationGuard } from './guards/critical-operation.guard';

// Utilities and Providers
import { ShopFloorUtilities } from './utilities/shop-floor.utilities';
import { RoboticsCalculatorService } from './utilities/robotics-calculator.service';
import { SafetyValidationService } from './utilities/safety-validation.service';
import { ShopFloorReportingService } from './utilities/shop-floor-reporting.service';
import { OptimizationAlgorithmService } from './utilities/optimization-algorithm.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShopFloorStation,
      RobotUnit,
      IoTDevice,
      CollaborativeTask,
      SafetyIncident,
      WorkstationOperator,
      ProductionMetric,
      ShopFloorAlert,
      DigitalTwin,
      AILearningModel,
      RobotMaintenance,
      HumanRobotInteraction,
      ShopFloorAnalytics,
      CybersecurityEvent,
      EdgeComputeNode,
      QuantumOptimizationJob,
      ShopFloorKPI,
      RobotPerformance,
      // New Industry 5.0 Entities
      Robot,
      WorkCell,
      RobotTask,
      TaskStep,
    ]),
  ],
  controllers: [
    ShopFloorControlController,
    RoboticsController,
    IoTIntegrationController,
    HumanAICollaborationController,
    SafetySystemsController,
    DigitalTwinController,
  ],
  providers: [
    // Core Services
    ShopFloorControlService,
    HumanAICollaborationService,
    AdaptiveManufacturingService,
    IoTIntegrationService,
    CollaborativeRoboticsService,
    
    // Advanced Safety and Coordination
    HumanRobotSafetyService,
    AutonomousRobotCoordinationService,
    CollaborativeTaskExecutionService,
    
    // Industry 5.0 AI Services
    DigitalTwinIntegrationService,
    AIRobotLearningService,
    IndustrialCybersecurityService,
    AdvancedAnalyticsService,
    EdgeComputingService,
    QuantumOptimizationService,
    
    // Guards
    ShopFloorSecurityGuard,
    RoboticsAccessGuard,
    SafetyProtocolGuard,
    CriticalOperationGuard,
    
    // Utilities
    ShopFloorUtilities,
    RoboticsCalculatorService,
    SafetyValidationService,
    ShopFloorReportingService,
    OptimizationAlgorithmService,
  ],
  exports: [
    ShopFloorControlService,
    HumanAICollaborationService,
    AdaptiveManufacturingService,
    IoTIntegrationService,
    CollaborativeRoboticsService,
    HumanRobotSafetyService,
    AutonomousRobotCoordinationService,
    CollaborativeTaskExecutionService,
    DigitalTwinIntegrationService,
    AIRobotLearningService,
    IndustrialCybersecurityService,
    AdvancedAnalyticsService,
    EdgeComputingService,
    QuantumOptimizationService,
    ShopFloorUtilities,
    RoboticsCalculatorService,
    SafetyValidationService,
    ShopFloorReportingService,
    OptimizationAlgorithmService,
  ],
})
export class ShopFloorControlModule {}
