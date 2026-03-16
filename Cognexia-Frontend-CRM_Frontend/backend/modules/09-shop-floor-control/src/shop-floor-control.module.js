"use strict";
// Industry 5.0 ERP Backend - Shop Floor Control Module
// Advanced shop floor automation with robotics, IoT, and human-AI collaboration
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopFloorControlModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
// Controllers
const shop_floor_control_controller_1 = require("./controllers/shop-floor-control.controller");
const robotics_controller_1 = require("./controllers/robotics.controller");
const iot_integration_controller_1 = require("./controllers/iot-integration.controller");
const human_ai_collaboration_controller_1 = require("./controllers/human-ai-collaboration.controller");
const safety_systems_controller_1 = require("./controllers/safety-systems.controller");
const digital_twin_controller_1 = require("./controllers/digital-twin.controller");
// Services
const shop_floor_control_service_1 = require("./services/shop-floor-control.service");
const human_ai_collaboration_service_1 = require("./services/human-ai-collaboration.service");
const adaptive_manufacturing_service_1 = require("./services/adaptive-manufacturing.service");
const iot_integration_service_1 = require("./services/iot-integration.service");
const collaborative_robotics_service_1 = require("./services/collaborative-robotics.service");
const human_robot_safety_service_1 = require("./services/human-robot-safety.service");
const autonomous_robot_coordination_service_1 = require("./services/autonomous-robot-coordination.service");
const collaborative_task_execution_service_1 = require("./services/collaborative-task-execution.service");
const digital_twin_integration_service_1 = require("./services/digital-twin-integration.service");
const ai_robot_learning_service_1 = require("./services/ai-robot-learning.service");
const industrial_cybersecurity_service_1 = require("./services/industrial-cybersecurity.service");
const advanced_analytics_service_1 = require("./services/advanced-analytics.service");
const edge_computing_service_1 = require("./services/edge-computing.service");
const quantum_optimization_service_1 = require("./services/quantum-optimization.service");
// Entities
const ShopFloorStation_1 = require("./entities/ShopFloorStation");
const RobotUnit_1 = require("./entities/RobotUnit");
const IoTDevice_1 = require("./entities/IoTDevice");
const CollaborativeTask_1 = require("./entities/CollaborativeTask");
const SafetyIncident_1 = require("./entities/SafetyIncident");
const WorkstationOperator_1 = require("./entities/WorkstationOperator");
const ProductionMetric_1 = require("./entities/ProductionMetric");
const ShopFloorAlert_1 = require("./entities/ShopFloorAlert");
const DigitalTwin_1 = require("./entities/DigitalTwin");
const AILearningModel_1 = require("./entities/AILearningModel");
const RobotMaintenance_1 = require("./entities/RobotMaintenance");
const HumanRobotInteraction_1 = require("./entities/HumanRobotInteraction");
const ShopFloorAnalytics_1 = require("./entities/ShopFloorAnalytics");
const CybersecurityEvent_1 = require("./entities/CybersecurityEvent");
const EdgeComputeNode_1 = require("./entities/EdgeComputeNode");
const QuantumOptimizationJob_1 = require("./entities/QuantumOptimizationJob");
const ShopFloorKPI_1 = require("./entities/ShopFloorKPI");
const RobotPerformance_1 = require("./entities/RobotPerformance");
// Guards and Middleware
const shop_floor_security_guard_1 = require("./guards/shop-floor-security.guard");
const robotics_access_guard_1 = require("./guards/robotics-access.guard");
const safety_protocol_guard_1 = require("./guards/safety-protocol.guard");
const critical_operation_guard_1 = require("./guards/critical-operation.guard");
// Utilities and Providers
const shop_floor_utilities_1 = require("./utilities/shop-floor.utilities");
const robotics_calculator_service_1 = require("./utilities/robotics-calculator.service");
const safety_validation_service_1 = require("./utilities/safety-validation.service");
const shop_floor_reporting_service_1 = require("./utilities/shop-floor-reporting.service");
const optimization_algorithm_service_1 = require("./utilities/optimization-algorithm.service");
let ShopFloorControlModule = class ShopFloorControlModule {
};
exports.ShopFloorControlModule = ShopFloorControlModule;
exports.ShopFloorControlModule = ShopFloorControlModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                ShopFloorStation_1.ShopFloorStation,
                RobotUnit_1.RobotUnit,
                IoTDevice_1.IoTDevice,
                CollaborativeTask_1.CollaborativeTask,
                SafetyIncident_1.SafetyIncident,
                WorkstationOperator_1.WorkstationOperator,
                ProductionMetric_1.ProductionMetric,
                ShopFloorAlert_1.ShopFloorAlert,
                DigitalTwin_1.DigitalTwin,
                AILearningModel_1.AILearningModel,
                RobotMaintenance_1.RobotMaintenance,
                HumanRobotInteraction_1.HumanRobotInteraction,
                ShopFloorAnalytics_1.ShopFloorAnalytics,
                CybersecurityEvent_1.CybersecurityEvent,
                EdgeComputeNode_1.EdgeComputeNode,
                QuantumOptimizationJob_1.QuantumOptimizationJob,
                ShopFloorKPI_1.ShopFloorKPI,
                RobotPerformance_1.RobotPerformance,
            ]),
        ],
        controllers: [
            shop_floor_control_controller_1.ShopFloorControlController,
            robotics_controller_1.RoboticsController,
            iot_integration_controller_1.IoTIntegrationController,
            human_ai_collaboration_controller_1.HumanAICollaborationController,
            safety_systems_controller_1.SafetySystemsController,
            digital_twin_controller_1.DigitalTwinController,
        ],
        providers: [
            // Core Services
            shop_floor_control_service_1.ShopFloorControlService,
            human_ai_collaboration_service_1.HumanAICollaborationService,
            adaptive_manufacturing_service_1.AdaptiveManufacturingService,
            iot_integration_service_1.IoTIntegrationService,
            collaborative_robotics_service_1.CollaborativeRoboticsService,
            // Advanced Safety and Coordination
            human_robot_safety_service_1.HumanRobotSafetyService,
            autonomous_robot_coordination_service_1.AutonomousRobotCoordinationService,
            collaborative_task_execution_service_1.CollaborativeTaskExecutionService,
            // Industry 5.0 AI Services
            digital_twin_integration_service_1.DigitalTwinIntegrationService,
            ai_robot_learning_service_1.AIRobotLearningService,
            industrial_cybersecurity_service_1.IndustrialCybersecurityService,
            advanced_analytics_service_1.AdvancedAnalyticsService,
            edge_computing_service_1.EdgeComputingService,
            quantum_optimization_service_1.QuantumOptimizationService,
            // Guards
            shop_floor_security_guard_1.ShopFloorSecurityGuard,
            robotics_access_guard_1.RoboticsAccessGuard,
            safety_protocol_guard_1.SafetyProtocolGuard,
            critical_operation_guard_1.CriticalOperationGuard,
            // Utilities
            shop_floor_utilities_1.ShopFloorUtilities,
            robotics_calculator_service_1.RoboticsCalculatorService,
            safety_validation_service_1.SafetyValidationService,
            shop_floor_reporting_service_1.ShopFloorReportingService,
            optimization_algorithm_service_1.OptimizationAlgorithmService,
        ],
        exports: [
            shop_floor_control_service_1.ShopFloorControlService,
            human_ai_collaboration_service_1.HumanAICollaborationService,
            adaptive_manufacturing_service_1.AdaptiveManufacturingService,
            iot_integration_service_1.IoTIntegrationService,
            collaborative_robotics_service_1.CollaborativeRoboticsService,
            human_robot_safety_service_1.HumanRobotSafetyService,
            autonomous_robot_coordination_service_1.AutonomousRobotCoordinationService,
            collaborative_task_execution_service_1.CollaborativeTaskExecutionService,
            digital_twin_integration_service_1.DigitalTwinIntegrationService,
            ai_robot_learning_service_1.AIRobotLearningService,
            industrial_cybersecurity_service_1.IndustrialCybersecurityService,
            advanced_analytics_service_1.AdvancedAnalyticsService,
            edge_computing_service_1.EdgeComputingService,
            quantum_optimization_service_1.QuantumOptimizationService,
            shop_floor_utilities_1.ShopFloorUtilities,
            robotics_calculator_service_1.RoboticsCalculatorService,
            safety_validation_service_1.SafetyValidationService,
            shop_floor_reporting_service_1.ShopFloorReportingService,
            optimization_algorithm_service_1.OptimizationAlgorithmService,
        ],
    })
], ShopFloorControlModule);
//# sourceMappingURL=shop-floor-control.module.js.map