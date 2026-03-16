import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, In } from 'typeorm';
import { Robot, RobotStatus, RobotManufacturer, RobotType, RobotCapability } from '../entities/robot.entity';
import { RobotTask, TaskStatus } from '../entities/robot-task.entity';
import {
  CreateRobotDto,
  UpdateRobotDto,
  RobotQueryDto,
  RobotPositionUpdateDto,
  RobotPerformanceUpdateDto,
  RobotDiagnosticsDto,
  RobotCalibrationDto,
  RobotMaintenanceScheduleDto,
  ErrorDto
} from '../dto/robot.dto';
import { RobotCommunicationService } from './robot-communication.service';
import { RobotSafetyService } from './robot-safety.service';
import { RobotKinematicsService } from './robot-kinematics.service';

@Injectable()
export class RobotService {
  private readonly logger = new Logger(RobotService.name);

  constructor(
    @InjectRepository(Robot)
    private readonly robotRepository: Repository<Robot>,
    @InjectRepository(RobotTask)
    private readonly taskRepository: Repository<RobotTask>,
    private readonly communicationService: RobotCommunicationService,
    private readonly safetyService: RobotSafetyService,
    private readonly kinematicsService: RobotKinematicsService
  ) {}

  // CRUD Operations
  async create(createRobotDto: CreateRobotDto): Promise<Robot> {
    try {
      this.logger.log(`Creating robot: ${createRobotDto.name}`);
      
      // Validate manufacturer and model compatibility
      await this.validateRobotConfiguration(createRobotDto);
      
      const robot = this.robotRepository.create(createRobotDto);
      
      // Set default values based on manufacturer and model
      this.setDefaultValues(robot);
      
      const savedRobot = await this.robotRepository.save(robot);
      
      this.logger.log(`Robot created successfully: ${savedRobot.id}`);
      return savedRobot;
    } catch (error) {
      this.logger.error(`Failed to create robot: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(query: RobotQueryDto): Promise<{ data: Robot[]; total: number }> {
    try {
      const {
        manufacturer,
        type,
        status,
        capability,
        location,
        zone,
        fleetId,
        search,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'ASC'
      } = query;

      const queryBuilder = this.robotRepository.createQueryBuilder('robot')
        .leftJoinAndSelect('robot.fleet', 'fleet')
        .leftJoinAndSelect('robot.tasks', 'tasks');

      // Apply filters
      if (manufacturer) {
        queryBuilder.andWhere('robot.manufacturer = :manufacturer', { manufacturer });
      }

      if (type) {
        queryBuilder.andWhere('robot.type = :type', { type });
      }

      if (status) {
        queryBuilder.andWhere('robot.status = :status', { status });
      }

      if (capability) {
        queryBuilder.andWhere(':capability = ANY(robot.capabilities)', { capability });
      }

      if (location) {
        queryBuilder.andWhere('robot.location ILIKE :location', { location: `%${location}%` });
      }

      if (zone) {
        queryBuilder.andWhere('robot.zone ILIKE :zone', { zone: `%${zone}%` });
      }

      if (fleetId) {
        queryBuilder.andWhere('robot.fleetId = :fleetId', { fleetId });
      }

      if (search) {
        queryBuilder.andWhere(
          '(robot.name ILIKE :search OR robot.description ILIKE :search OR robot.serialNumber ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Apply sorting
      queryBuilder.orderBy(`robot.${sortBy}`, sortOrder);

      // Apply pagination
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);

      const [data, total] = await queryBuilder.getManyAndCount();

      return { data, total };
    } catch (error) {
      this.logger.error(`Failed to retrieve robots: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<Robot | null> {
    try {
      const robot = await this.robotRepository.findOne({
        where: { id },
        relations: [
          'fleet',
          'tasks',
          'calibrations',
          'maintenanceRecords',
          'safetyRecords'
        ]
      });
      
      if (robot) {
        // Update heartbeat
        await this.updateHeartbeat(id);
      }
      
      return robot;
    } catch (error) {
      this.logger.error(`Failed to retrieve robot ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateRobotDto: UpdateRobotDto): Promise<Robot | null> {
    try {
      const robot = await this.findOne(id);
      if (!robot) {
        return null;
      }

      // Validate configuration changes
      if (updateRobotDto.manufacturer || updateRobotDto.model) {
        await this.validateRobotConfiguration({
          ...robot,
          ...updateRobotDto
        } as CreateRobotDto);
      }

      Object.assign(robot, updateRobotDto);
      return await this.robotRepository.save(robot);
    } catch (error) {
      this.logger.error(`Failed to update robot ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const robot = await this.findOne(id);
      if (!robot) {
        return false;
      }

      // Ensure robot is not active before deletion
      if (robot.status === RobotStatus.RUNNING) {
        throw new BadRequestException('Cannot delete robot while it is running');
      }

      // Cancel all pending tasks
      await this.taskRepository.update(
        { robotId: id, status: In([TaskStatus.PENDING, TaskStatus.IN_PROGRESS]) },
        { status: TaskStatus.CANCELLED }
      );

      // Disconnect if connected
      if (robot.isConnected) {
        await this.disconnect(id);
      }

      await this.robotRepository.remove(robot);
      this.logger.log(`Robot deleted: ${id}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete robot ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Status Operations
  async updateStatus(id: string, status: RobotStatus, reason?: string): Promise<Robot | null> {
    try {
      const robot = await this.findOne(id);
      if (!robot) {
        return null;
      }

      // Validate status transition
      if (!this.isValidStatusTransition(robot.status, status)) {
        throw new BadRequestException(
          `Invalid status transition from ${robot.status} to ${status}`
        );
      }

      // Perform safety checks
      if (status === RobotStatus.RUNNING) {
        const safetyCheck = await this.safetyService.performSafetyCheck(robot);
        if (!safetyCheck.safe) {
          throw new BadRequestException(`Safety check failed: ${safetyCheck.reason}`);
        }
      }

      robot.status = status;
      robot.updatedAt = new Date();

      // Update operational hours if transitioning from running
      if (robot.status === RobotStatus.RUNNING && status !== RobotStatus.RUNNING) {
        const lastUpdate = robot.updatedAt;
        const now = new Date();
        const hours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
        robot.totalOperatingHours += hours;
      }

      return await this.robotRepository.save(robot);
    } catch (error) {
      this.logger.error(`Failed to update robot status ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async emergencyStop(id: string): Promise<Robot | null> {
    try {
      this.logger.warn(`Emergency stop initiated for robot: ${id}`);
      
      const robot = await this.findOne(id);
      if (!robot) {
        return null;
      }

      // Send emergency stop command to robot
      if (robot.isConnected) {
        await this.communicationService.sendEmergencyStop(robot);
      }

      // Update robot state
      robot.status = RobotStatus.EMERGENCY_STOP;
      robot.emergencyStopActivated = true;
      robot.updatedAt = new Date();

      // Cancel all active tasks
      await this.taskRepository.update(
        { robotId: id, status: TaskStatus.IN_PROGRESS },
        { status: TaskStatus.ABORTED }
      );

      this.logger.warn(`Emergency stop completed for robot: ${id}`);
      return await this.robotRepository.save(robot);
    } catch (error) {
      this.logger.error(`Failed to execute emergency stop for robot ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async reset(id: string): Promise<Robot | null> {
    try {
      const robot = await this.findOne(id);
      if (!robot) {
        return null;
      }

      // Send reset command to robot
      if (robot.isConnected) {
        await this.communicationService.sendReset(robot);
      }

      // Clear error state and reset to idle
      robot.status = RobotStatus.IDLE;
      robot.emergencyStopActivated = false;
      robot.lastError = null;
      robot.connectionRetries = 0;
      robot.updatedAt = new Date();

      return await this.robotRepository.save(robot);
    } catch (error) {
      this.logger.error(`Failed to reset robot ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Position and Movement Operations
  async updatePosition(id: string, positionUpdate: RobotPositionUpdateDto): Promise<Robot | null> {
    try {
      const robot = await this.findOne(id);
      if (!robot) {
        return null;
      }

      // Validate position within workspace limits
      if (robot.workspaceLimit && !this.isPositionInWorkspace(positionUpdate.position, robot.workspaceLimit)) {
        throw new BadRequestException('Position is outside robot workspace limits');
      }

      // Update position and joint states
      robot.currentPosition = positionUpdate.position;
      if (positionUpdate.jointPositions) {
        robot.jointPositions = positionUpdate.jointPositions;
      }
      if (positionUpdate.jointVelocities) {
        robot.jointVelocities = positionUpdate.jointVelocities;
      }
      if (positionUpdate.jointTorques) {
        robot.jointTorques = positionUpdate.jointTorques;
      }
      
      robot.updatedAt = new Date();
      return await this.robotRepository.save(robot);
    } catch (error) {
      this.logger.error(`Failed to update robot position ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async moveToHome(id: string): Promise<Robot | null> {
    try {
      const robot = await this.findOne(id);
      if (!robot) {
        return null;
      }

      if (!robot.isOperational) {
        throw new BadRequestException('Robot is not operational');
      }

      if (!robot.homePosition) {
        throw new BadRequestException('Home position not defined for robot');
      }

      // Send move command to robot
      if (robot.isConnected) {
        await this.communicationService.sendMoveCommand(robot, robot.homePosition);
      }

      // Update current position to home position
      robot.currentPosition = robot.homePosition;
      robot.updatedAt = new Date();

      return await this.robotRepository.save(robot);
    } catch (error) {
      this.logger.error(`Failed to move robot to home ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Performance and Monitoring
  async updatePerformance(id: string, performanceUpdate: RobotPerformanceUpdateDto): Promise<Robot | null> {
    try {
      const robot = await this.findOne(id);
      if (!robot) {
        return null;
      }

      // Update performance metrics
      robot.performance = performanceUpdate.performance;
      if (performanceUpdate.currentUtilization !== undefined) {
        robot.currentUtilization = performanceUpdate.currentUtilization;
        
        // Update average utilization (simple moving average)
        const alpha = 0.1; // Weight for new value
        robot.averageUtilization = (1 - alpha) * robot.averageUtilization + alpha * performanceUpdate.currentUtilization;
      }
      
      if (performanceUpdate.powerConsumption !== undefined) {
        robot.powerConsumption = performanceUpdate.powerConsumption;
      }
      
      if (performanceUpdate.energyEfficiency !== undefined) {
        robot.energyEfficiency = performanceUpdate.energyEfficiency;
      }

      robot.updatedAt = new Date();
      return await this.robotRepository.save(robot);
    } catch (error) {
      this.logger.error(`Failed to update robot performance ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getDiagnostics(id: string): Promise<any> {
    try {
      const robot = await this.findOne(id);
      if (!robot) {
        return null;
      }

      // Get real-time diagnostics if connected
      let realTimeDiagnostics = null;
      if (robot.isConnected) {
        try {
          realTimeDiagnostics = await this.communicationService.getDiagnostics(robot);
        } catch (error) {
          this.logger.warn(`Failed to get real-time diagnostics: ${error.message}`);
        }
      }

      return {
        robotId: id,
        timestamp: new Date(),
        status: robot.status,
        isConnected: robot.isConnected,
        stored: robot.diagnostics,
        realTime: realTimeDiagnostics,
        performance: robot.performance,
        operatingHours: robot.totalOperatingHours,
        totalCycles: robot.totalCycles,
        utilization: robot.currentUtilization,
        powerConsumption: robot.powerConsumption,
        temperature: robot.operatingTemperature,
        lastError: robot.lastError,
        maintenanceStatus: {
          lastMaintenance: robot.lastMaintenanceDate,
          nextMaintenance: robot.nextMaintenanceDate,
          needsMaintenance: robot.needsMaintenance,
          isOverdue: robot.isOverdue
        }
      };
    } catch (error) {
      this.logger.error(`Failed to get robot diagnostics ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateDiagnostics(id: string, diagnosticsUpdate: RobotDiagnosticsDto): Promise<Robot | null> {
    try {
      const robot = await this.findOne(id);
      if (!robot) {
        return null;
      }

      // Update diagnostic data
      robot.diagnostics = diagnosticsUpdate.diagnostics;
      if (diagnosticsUpdate.operatingTemperature !== undefined) {
        robot.operatingTemperature = diagnosticsUpdate.operatingTemperature;
      }
      if (diagnosticsUpdate.humidity !== undefined) {
        robot.humidity = diagnosticsUpdate.humidity;
      }
      if (diagnosticsUpdate.batteryLevel !== undefined) {
        robot.batteryLevel = diagnosticsUpdate.batteryLevel;
      }

      robot.updatedAt = new Date();
      return await this.robotRepository.save(robot);
    } catch (error) {
      this.logger.error(`Failed to update robot diagnostics ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Error Handling
  async reportError(id: string, error: ErrorDto): Promise<Robot | null> {
    try {
      const robot = await this.findOne(id);
      if (!robot) {
        return null;
      }

      robot.lastError = {
        code: error.code,
        message: error.message,
        timestamp: error.timestamp,
        severity: error.severity
      };

      // Update status based on error severity
      if (error.severity === 'critical') {
        robot.status = RobotStatus.ERROR;
      }

      robot.updatedAt = new Date();
      return await this.robotRepository.save(robot);
    } catch (error) {
      this.logger.error(`Failed to report robot error ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async clearError(id: string): Promise<Robot | null> {
    try {
      const robot = await this.findOne(id);
      if (!robot) {
        return null;
      }

      robot.lastError = null;
      if (robot.status === RobotStatus.ERROR) {
        robot.status = RobotStatus.IDLE;
      }

      robot.updatedAt = new Date();
      return await this.robotRepository.save(robot);
    } catch (error) {
      this.logger.error(`Failed to clear robot error ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Maintenance Operations
  async scheduleMaintenance(id: string, maintenanceSchedule: RobotMaintenanceScheduleDto): Promise<Robot | null> {
    try {
      const robot = await this.findOne(id);
      if (!robot) {
        return null;
      }

      robot.nextMaintenanceDate = maintenanceSchedule.nextMaintenanceDate;
      robot.updatedAt = new Date();

      return await this.robotRepository.save(robot);
    } catch (error) {
      this.logger.error(`Failed to schedule maintenance for robot ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async completeMaintenance(id: string): Promise<Robot | null> {
    try {
      const robot = await this.findOne(id);
      if (!robot) {
        return null;
      }

      robot.performMaintenance();
      return await this.robotRepository.save(robot);
    } catch (error) {
      this.logger.error(`Failed to complete maintenance for robot ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Calibration Operations
  async startCalibration(id: string, calibrationDto: RobotCalibrationDto): Promise<Robot | null> {
    try {
      const robot = await this.findOne(id);
      if (!robot) {
        return null;
      }

      // Check if robot is available for calibration
      if (robot.status !== RobotStatus.IDLE) {
        throw new BadRequestException('Robot must be idle to start calibration');
      }

      // Start calibration process
      robot.status = RobotStatus.CALIBRATING;
      robot.calibrationData = calibrationDto.calibrationData;
      robot.updatedAt = new Date();

      // Send calibration command to robot if connected
      if (robot.isConnected) {
        await this.communicationService.startCalibration(robot, calibrationDto);
      }

      return await this.robotRepository.save(robot);
    } catch (error) {
      this.logger.error(`Failed to start calibration for robot ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Connection Operations
  async connect(id: string): Promise<Robot | null> {
    try {
      const robot = await this.findOne(id);
      if (!robot) {
        return null;
      }

      // Attempt connection
      const connected = await this.communicationService.connect(robot);
      
      robot.isConnected = connected;
      robot.lastHeartbeat = connected ? new Date() : null;
      robot.connectionRetries = connected ? 0 : robot.connectionRetries + 1;
      robot.updatedAt = new Date();

      if (connected) {
        robot.status = RobotStatus.IDLE;
        this.logger.log(`Successfully connected to robot: ${id}`);
      } else {
        this.logger.warn(`Failed to connect to robot: ${id}`);
      }

      return await this.robotRepository.save(robot);
    } catch (error) {
      this.logger.error(`Failed to connect to robot ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async disconnect(id: string): Promise<Robot | null> {
    try {
      const robot = await this.findOne(id);
      if (!robot) {
        return null;
      }

      // Disconnect from robot
      if (robot.isConnected) {
        await this.communicationService.disconnect(robot);
      }

      robot.isConnected = false;
      robot.status = RobotStatus.OFFLINE;
      robot.updatedAt = new Date();

      return await this.robotRepository.save(robot);
    } catch (error) {
      this.logger.error(`Failed to disconnect from robot ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Statistics and Analytics
  async getStatistics(): Promise<any> {
    try {
      const totalRobots = await this.robotRepository.count();
      
      const statusCounts = await this.robotRepository
        .createQueryBuilder('robot')
        .select('robot.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('robot.status')
        .getRawMany();

      const manufacturerCounts = await this.robotRepository
        .createQueryBuilder('robot')
        .select('robot.manufacturer', 'manufacturer')
        .addSelect('COUNT(*)', 'count')
        .groupBy('robot.manufacturer')
        .getRawMany();

      const typeCounts = await this.robotRepository
        .createQueryBuilder('robot')
        .select('robot.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .groupBy('robot.type')
        .getRawMany();

      const utilization = await this.robotRepository
        .createQueryBuilder('robot')
        .select('AVG(robot.currentUtilization)', 'average')
        .addSelect('MAX(robot.currentUtilization)', 'maximum')
        .addSelect('MIN(robot.currentUtilization)', 'minimum')
        .getRawOne();

      const operatingHours = await this.robotRepository
        .createQueryBuilder('robot')
        .select('SUM(robot.totalOperatingHours)', 'total')
        .addSelect('AVG(robot.totalOperatingHours)', 'average')
        .getRawOne();

      return {
        overview: {
          total: totalRobots,
          online: statusCounts.find(s => s.status !== 'offline')?.count || 0,
          active: statusCounts.find(s => s.status === 'running')?.count || 0,
          idle: statusCounts.find(s => s.status === 'idle')?.count || 0,
          error: statusCounts.find(s => s.status === 'error')?.count || 0
        },
        statusDistribution: statusCounts,
        manufacturerDistribution: manufacturerCounts,
        typeDistribution: typeCounts,
        performance: {
          averageUtilization: parseFloat(utilization.average) || 0,
          maxUtilization: parseFloat(utilization.maximum) || 0,
          minUtilization: parseFloat(utilization.minimum) || 0,
          totalOperatingHours: parseFloat(operatingHours.total) || 0,
          averageOperatingHours: parseFloat(operatingHours.average) || 0
        },
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error(`Failed to get robot statistics: ${error.message}`, error.stack);
      throw error;
    }
  }

  async performHealthCheck(): Promise<any> {
    try {
      const robots = await this.robotRepository.find({
        where: { status: In([RobotStatus.IDLE, RobotStatus.RUNNING, RobotStatus.ERROR]) }
      });

      const healthResults = await Promise.all(
        robots.map(async robot => {
          const health = {
            robotId: robot.id,
            name: robot.name,
            status: robot.status,
            isConnected: robot.isConnected,
            healthy: true,
            issues: [] as string[],
            recommendations: [] as string[]
          };

          // Check connection
          if (!robot.isConnected) {
            health.healthy = false;
            health.issues.push('Robot is disconnected');
            health.recommendations.push('Check network connection and robot power');
          }

          // Check for errors
          if (robot.lastError) {
            health.healthy = false;
            health.issues.push(`Error: ${robot.lastError.message}`);
            health.recommendations.push('Clear error and investigate root cause');
          }

          // Check maintenance
          if (robot.needsMaintenance) {
            health.healthy = false;
            health.issues.push('Maintenance required');
            health.recommendations.push('Schedule maintenance');
          }

          // Check utilization
          if (robot.currentUtilization > 95) {
            health.issues.push('High utilization detected');
            health.recommendations.push('Consider load balancing');
          }

          // Check temperature
          if (robot.operatingTemperature && robot.maxOperatingTemperature) {
            if (robot.operatingTemperature > robot.maxOperatingTemperature * 0.9) {
              health.healthy = false;
              health.issues.push('High operating temperature');
              health.recommendations.push('Check cooling system');
            }
          }

          return health;
        })
      );

      const healthyCount = healthResults.filter(r => r.healthy).length;
      const unhealthyCount = healthResults.length - healthyCount;

      return {
        summary: {
          total: robots.length,
          healthy: healthyCount,
          unhealthy: unhealthyCount,
          healthScore: robots.length > 0 ? (healthyCount / robots.length) * 100 : 100
        },
        robots: healthResults,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error(`Failed to perform health check: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Private helper methods
  private async validateRobotConfiguration(config: CreateRobotDto): Promise<void> {
    // Validate manufacturer-specific configurations
    const manufacturerLimits = this.getManufacturerLimits(config.manufacturer);
    
    if (config.degreesOfFreedom && config.degreesOfFreedom > manufacturerLimits.maxDoF) {
      throw new BadRequestException(
        `Degrees of freedom (${config.degreesOfFreedom}) exceeds manufacturer limit (${manufacturerLimits.maxDoF})`
      );
    }

    if (config.payload && config.payload > manufacturerLimits.maxPayload) {
      throw new BadRequestException(
        `Payload (${config.payload}kg) exceeds manufacturer limit (${manufacturerLimits.maxPayload}kg)`
      );
    }

    if (config.reach && config.reach > manufacturerLimits.maxReach) {
      throw new BadRequestException(
        `Reach (${config.reach}mm) exceeds manufacturer limit (${manufacturerLimits.maxReach}mm)`
      );
    }
  }

  private setDefaultValues(robot: Robot): void {
    const defaults = this.getManufacturerDefaults(robot.manufacturer);
    
    if (!robot.degreesOfFreedom) {
      robot.degreesOfFreedom = defaults.degreesOfFreedom;
    }
    
    if (!robot.protocol) {
      robot.protocol = defaults.protocol;
    }
    
    if (!robot.port) {
      robot.port = defaults.port;
    }
    
    if (!robot.maintenanceInterval) {
      robot.maintenanceInterval = defaults.maintenanceInterval;
    }
  }

  private getManufacturerLimits(manufacturer: RobotManufacturer) {
    const limits = {
      [RobotManufacturer.UNIVERSAL_ROBOTS]: { maxDoF: 6, maxPayload: 16, maxReach: 1300 },
      [RobotManufacturer.KUKA]: { maxDoF: 7, maxPayload: 1300, maxReach: 3900 },
      [RobotManufacturer.ABB]: { maxDoF: 6, maxPayload: 800, maxReach: 3500 },
      [RobotManufacturer.FANUC]: { maxDoF: 6, maxPayload: 2300, maxReach: 4700 },
      [RobotManufacturer.YASKAWA]: { maxDoF: 7, maxPayload: 1200, maxReach: 2702 },
      [RobotManufacturer.OTHER]: { maxDoF: 12, maxPayload: 10000, maxReach: 10000 }
    };
    
    return limits[manufacturer] || limits[RobotManufacturer.OTHER];
  }

  private getManufacturerDefaults(manufacturer: RobotManufacturer) {
    const defaults = {
      [RobotManufacturer.UNIVERSAL_ROBOTS]: {
        degreesOfFreedom: 6,
        protocol: 'TCP',
        port: 30001,
        maintenanceInterval: 2000
      },
      [RobotManufacturer.KUKA]: {
        degreesOfFreedom: 6,
        protocol: 'KRL',
        port: 7000,
        maintenanceInterval: 3000
      },
      [RobotManufacturer.ABB]: {
        degreesOfFreedom: 6,
        protocol: 'RAPID',
        port: 80,
        maintenanceInterval: 2500
      },
      [RobotManufacturer.OTHER]: {
        degreesOfFreedom: 6,
        protocol: 'TCP',
        port: 502,
        maintenanceInterval: 2000
      }
    };
    
    return defaults[manufacturer] || defaults[RobotManufacturer.OTHER];
  }

  private isValidStatusTransition(from: RobotStatus, to: RobotStatus): boolean {
    const validTransitions: Record<RobotStatus, RobotStatus[]> = {
      [RobotStatus.OFFLINE]: [RobotStatus.IDLE],
      [RobotStatus.IDLE]: [RobotStatus.RUNNING, RobotStatus.MAINTENANCE, RobotStatus.CALIBRATING, RobotStatus.OFFLINE],
      [RobotStatus.RUNNING]: [RobotStatus.IDLE, RobotStatus.PAUSED, RobotStatus.ERROR, RobotStatus.EMERGENCY_STOP],
      [RobotStatus.PAUSED]: [RobotStatus.RUNNING, RobotStatus.IDLE, RobotStatus.EMERGENCY_STOP],
      [RobotStatus.ERROR]: [RobotStatus.IDLE, RobotStatus.MAINTENANCE],
      [RobotStatus.MAINTENANCE]: [RobotStatus.IDLE],
      [RobotStatus.CALIBRATING]: [RobotStatus.IDLE],
      [RobotStatus.EMERGENCY_STOP]: [RobotStatus.IDLE]
    };

    return validTransitions[from]?.includes(to) ?? false;
  }

  private isPositionInWorkspace(position: any, workspace: any): boolean {
    return position.x >= workspace.minX && position.x <= workspace.maxX &&
           position.y >= workspace.minY && position.y <= workspace.maxY &&
           position.z >= workspace.minZ && position.z <= workspace.maxZ;
  }

  private async updateHeartbeat(id: string): Promise<void> {
    try {
      await this.robotRepository.update(id, { lastHeartbeat: new Date() });
    } catch (error) {
      this.logger.warn(`Failed to update heartbeat for robot ${id}: ${error.message}`);
    }
  }
}
