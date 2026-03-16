import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';

// Controllers
import { RobotController } from './controllers/robot.controller';
import { RobotFleetController } from './controllers/robot-fleet.controller';
import { RobotTaskController } from './controllers/robot-task.controller';
import { RobotCalibrationController } from './controllers/robot-calibration.controller';
import { RobotMaintenanceController } from './controllers/robot-maintenance.controller';
import { RobotSafetyController } from './controllers/robot-safety.controller';
import { RobotVisionController } from './controllers/robot-vision.controller';
import { RobotPathPlanningController } from './controllers/robot-path-planning.controller';
import { RobotSimulationController } from './controllers/robot-simulation.controller';
import { RobotIntegrationController } from './controllers/robot-integration.controller';

// Services
import { RobotService } from './services/robot.service';
import { RobotFleetService } from './services/robot-fleet.service';
import { RobotTaskService } from './services/robot-task.service';
import { RobotCalibrationService } from './services/robot-calibration.service';
import { RobotMaintenanceService } from './services/robot-maintenance.service';
import { RobotSafetyService } from './services/robot-safety.service';
import { RobotVisionService } from './services/robot-vision.service';
import { RobotPathPlanningService } from './services/robot-path-planning.service';
import { RobotSimulationService } from './services/robot-simulation.service';
import { RobotIntegrationService } from './services/robot-integration.service';
import { RobotCommunicationService } from './services/robot-communication.service';
import { RobotKinematicsService } from './services/robot-kinematics.service';
import { RobotMotionControlService } from './services/robot-motion-control.service';
import { RobotForceControlService } from './services/robot-force-control.service';

// Manufacturer-specific services
import { UniversalRobotsService } from './services/manufacturers/universal-robots.service';
import { KukaRobotService } from './services/manufacturers/kuka-robot.service';
import { ABBRobotService } from './services/manufacturers/abb-robot.service';
import { FanucRobotService } from './services/manufacturers/fanuc-robot.service';
import { YaskawaRobotService } from './services/manufacturers/yaskawa-robot.service';
import { OmronRobotService } from './services/manufacturers/omron-robot.service';
import { MitsubishiRobotService } from './services/manufacturers/mitsubishi-robot.service';
import { DensoRobotService } from './services/manufacturers/denso-robot.service';
import { KawasakiRobotService } from './services/manufacturers/kawasaki-robot.service';
import { StaubliRobotService } from './services/manufacturers/staubli-robot.service';
import { DoosanRobotService } from './services/manufacturers/doosan-robot.service';
import { FrankaEmikaService } from './services/manufacturers/franka-emika.service';
import { BostonDynamicsService } from './services/manufacturers/boston-dynamics.service';

// Entities
import { Robot } from './entities/robot.entity';
import { RobotTask } from './entities/robot-task.entity';
import { RobotFleet } from './entities/robot-fleet.entity';
import { RobotCalibration } from './entities/robot-calibration.entity';
import { RobotMaintenance } from './entities/robot-maintenance.entity';
import { RobotSafety } from './entities/robot-safety.entity';
import { RobotVision } from './entities/robot-vision.entity';
import { RobotPathPlanning } from './entities/robot-path-planning.entity';
import { RobotSimulation } from './entities/robot-simulation.entity';
import { RobotIntegration } from './entities/robot-integration.entity';
import { RobotCommunication } from './entities/robot-communication.entity';
import { RobotKinematics } from './entities/robot-kinematics.entity';
import { RobotMotionControl } from './entities/robot-motion-control.entity';
import { RobotForceControl } from './entities/robot-force-control.entity';

// Guards
import { RobotAuthGuard } from './guards/robot-auth.guard';
import { RobotRoleGuard } from './guards/robot-role.guard';
import { RobotSafetyGuard } from './guards/robot-safety.guard';
import { RobotMaintenanceGuard } from './guards/robot-maintenance.guard';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Robot,
      RobotTask,
      RobotFleet,
      RobotCalibration,
      RobotMaintenance,
      RobotSafety,
      RobotVision,
      RobotPathPlanning,
      RobotSimulation,
      RobotIntegration,
      RobotCommunication,
      RobotKinematics,
      RobotMotionControl,
      RobotForceControl
    ]),
    ScheduleModule.forRoot(),
    BullModule.registerQueue(
      { name: 'robot-tasks' },
      { name: 'robot-maintenance' },
      { name: 'robot-calibration' },
      { name: 'robot-simulation' },
      { name: 'robot-path-planning' },
      { name: 'robot-vision' },
      { name: 'robot-fleet-coordination' }
    ),
  ],
  controllers: [
    RobotController,
    RobotFleetController,
    RobotTaskController,
    RobotCalibrationController,
    RobotMaintenanceController,
    RobotSafetyController,
    RobotVisionController,
    RobotPathPlanningController,
    RobotSimulationController,
    RobotIntegrationController
  ],
  providers: [
    // Core Services
    RobotService,
    RobotFleetService,
    RobotTaskService,
    RobotCalibrationService,
    RobotMaintenanceService,
    RobotSafetyService,
    RobotVisionService,
    RobotPathPlanningService,
    RobotSimulationService,
    RobotIntegrationService,
    RobotCommunicationService,
    RobotKinematicsService,
    RobotMotionControlService,
    RobotForceControlService,

    // Manufacturer Services
    UniversalRobotsService,
    KukaRobotService,
    ABBRobotService,
    FanucRobotService,
    YaskawaRobotService,
    OmronRobotService,
    MitsubishiRobotService,
    DensoRobotService,
    KawasakiRobotService,
    StaubliRobotService,
    DoosanRobotService,
    FrankaEmikaService,
    BostonDynamicsService,

    // Guards
    RobotAuthGuard,
    RobotRoleGuard,
    RobotSafetyGuard,
    RobotMaintenanceGuard
  ],
  exports: [
    // Export all services for use in other modules
    RobotService,
    RobotFleetService,
    RobotTaskService,
    RobotCalibrationService,
    RobotMaintenanceService,
    RobotSafetyService,
    RobotVisionService,
    RobotPathPlanningService,
    RobotSimulationService,
    RobotIntegrationService,
    RobotCommunicationService,
    RobotKinematicsService,
    RobotMotionControlService,
    RobotForceControlService,

    // Manufacturer Services
    UniversalRobotsService,
    KukaRobotService,
    ABBRobotService,
    FanucRobotService,
    YaskawaRobotService,
    OmronRobotService,
    MitsubishiRobotService,
    DensoRobotService,
    KawasakiRobotService,
    StaubliRobotService,
    DoosanRobotService,
    FrankaEmikaService,
    BostonDynamicsService
  ]
})
export class ERoboticsModule {}
