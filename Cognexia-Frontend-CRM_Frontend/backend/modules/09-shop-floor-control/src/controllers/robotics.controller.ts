// Industry 5.0 ERP Backend - Robotics Controller
// Advanced robotics control with AI coordination and human-robot collaboration
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { CollaborativeRoboticsService } from '../services/collaborative-robotics.service';
import { AutonomousRobotCoordinationService } from '../services/autonomous-robot-coordination.service';
import { RoboticsAccessGuard } from '../guards/robotics-access.guard';

// DTOs for robotics operations
export class CreateRobotTaskDto {
  robotId: string;
  taskType: 'ASSEMBLY' | 'WELDING' | 'PAINTING' | 'INSPECTION' | 'MATERIAL_HANDLING' | 'QUALITY_CHECK';
  workCellId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  humanCollaboration?: {
    required: boolean;
    operatorId?: string;
    safetyLevel: 'STANDARD' | 'ENHANCED' | 'MAXIMUM';
  };
  parameters: {
    targetPosition?: { x: number; y: number; z: number };
    targetRotation?: { roll: number; pitch: number; yaw: number };
    force?: number;
    speed?: number;
    precision?: number;
    customParams?: Record<string, any>;
  };
  expectedDuration: number; // minutes
  qualityRequirements?: {
    tolerances: Record<string, number>;
    checkpoints: string[];
    validationRequired: boolean;
  };
}

export class UpdateRobotDto {
  status?: 'IDLE' | 'ACTIVE' | 'MAINTENANCE' | 'ERROR' | 'OFFLINE';
  currentTask?: string;
  operationalParameters?: {
    speed?: number;
    precision?: number;
    safetyLevel?: number;
  };
  maintenanceSchedule?: {
    nextMaintenance: string;
    maintenanceType: 'ROUTINE' | 'PREVENTIVE' | 'EMERGENCY';
  };
}

export class RobotCoordinationDto {
  robotIds: string[];
  coordinationType: 'SEQUENTIAL' | 'PARALLEL' | 'COLLABORATIVE';
  workCellId: string;
  synchronizationPoints?: {
    timestamp: string;
    action: string;
    robots: string[];
  }[];
  contingencyPlans?: {
    trigger: string;
    action: string;
    backupRobots?: string[];
  }[];
}

@ApiTags('Robotics Control')
@Controller('shop-floor/robotics')
@UseGuards(RoboticsAccessGuard)
@ApiBearerAuth()
export class RoboticsController {
  private readonly logger = new Logger(RoboticsController.name);

  constructor(
    private readonly roboticsService: CollaborativeRoboticsService,
    private readonly coordinationService: AutonomousRobotCoordinationService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all robots',
    description: 'Retrieve all robots with their current status and capabilities',
  })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by robot status' })
  @ApiQuery({ name: 'workCellId', required: false, description: 'Filter by work cell' })
  @ApiQuery({ name: 'capability', required: false, description: 'Filter by robot capability' })
  @ApiResponse({ 
    status: 200, 
    description: 'Robots retrieved successfully',
    schema: {
      example: {
        robots: [
          {
            id: 'robot_001',
            name: 'Assembly Robot A1',
            type: 'COLLABORATIVE_ARM',
            status: 'ACTIVE',
            currentTask: 'ASSEMBLY_LINE_1',
            workCellId: 'CELL_001',
            capabilities: ['ASSEMBLY', 'WELDING', 'INSPECTION'],
            performance: {
              efficiency: 0.94,
              uptime: 0.98,
              errorRate: 0.02
            },
            lastMaintenance: '2024-02-15T08:00:00Z'
          }
        ],
        total: 12,
        active: 10,
        maintenance: 1,
        offline: 1
      }
    }
  })
  async getAllRobots(
    @Query('status') status?: string,
    @Query('workCellId') workCellId?: string,
    @Query('capability') capability?: string,
  ) {
    try {
      this.logger.log('Retrieving robots with filters');
      
      const robots = await this.roboticsService.getRobots({
        status,
        workCellId,
        capability,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Robots retrieved successfully',
        data: robots,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve robots: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve robots',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get robot by ID',
    description: 'Retrieve detailed information about a specific robot',
  })
  @ApiParam({ name: 'id', description: 'Robot ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Robot details retrieved',
    schema: {
      example: {
        id: 'robot_001',
        name: 'Assembly Robot A1',
        type: 'COLLABORATIVE_ARM',
        status: 'ACTIVE',
        specifications: {
          reachRadius: 850, // mm
          payload: 10, // kg
          repeatability: 0.1, // mm
          maxSpeed: 2.5, // m/s
          degreesOfFreedom: 6
        },
        currentPosition: { x: 100, y: 200, z: 300 },
        currentTask: {
          id: 'task_123',
          type: 'ASSEMBLY',
          progress: 0.75,
          estimatedCompletion: '2024-03-01T14:30:00Z'
        },
        sensors: [
          { type: 'FORCE', value: 15.2, unit: 'N', status: 'OK' },
          { type: 'VISION', status: 'OK', lastCalibration: '2024-02-28T09:00:00Z' }
        ],
        safetyZones: ['ZONE_A', 'ZONE_B'],
        humanCollaboration: {
          enabled: true,
          currentOperator: 'OP_001',
          safetyLevel: 'ENHANCED'
        }
      }
    }
  })
  async getRobotById(@Param('id') id: string) {
    try {
      this.logger.log(`Retrieving robot details: ${id}`);
      
      const robot = await this.roboticsService.getRobotById(id);
      
      if (!robot) {
        throw new HttpException('Robot not found', HttpStatus.NOT_FOUND);
      }
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Robot details retrieved successfully',
        data: robot,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve robot: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to retrieve robot',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update robot configuration',
    description: 'Update robot status, parameters, or configuration',
  })
  @ApiParam({ name: 'id', description: 'Robot ID' })
  @ApiBody({ type: UpdateRobotDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Robot updated successfully' 
  })
  async updateRobot(
    @Param('id') id: string,
    @Body() updateDto: UpdateRobotDto,
  ) {
    try {
      this.logger.log(`Updating robot: ${id}`);
      
      const updatedRobot = await this.roboticsService.updateRobot(id, updateDto);
      
      this.logger.log(`Robot updated successfully: ${id}`);
      return {
        statusCode: HttpStatus.OK,
        message: 'Robot updated successfully',
        data: updatedRobot,
      };
    } catch (error) {
      this.logger.error(`Failed to update robot: ${error.message}`);
      throw new HttpException(
        'Failed to update robot',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/tasks')
  @ApiOperation({
    summary: 'Assign task to robot',
    description: 'Create and assign a new task to a specific robot',
  })
  @ApiParam({ name: 'id', description: 'Robot ID' })
  @ApiBody({ type: CreateRobotTaskDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Task assigned successfully',
    schema: {
      example: {
        taskId: 'task_123',
        robotId: 'robot_001',
        status: 'QUEUED',
        estimatedStartTime: '2024-03-01T14:00:00Z',
        estimatedCompletion: '2024-03-01T14:30:00Z',
        humanCollaborationRequired: true,
        safetyChecksCompleted: true
      }
    }
  })
  async assignTask(
    @Param('id') robotId: string,
    @Body() taskDto: CreateRobotTaskDto,
  ) {
    try {
      this.logger.log(`Assigning task to robot: ${robotId}`);
      
      const task = await this.roboticsService.assignTask(robotId, taskDto);
      
      this.logger.log(`Task assigned successfully: ${task.id}`);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Task assigned successfully',
        data: task,
      };
    } catch (error) {
      this.logger.error(`Failed to assign task: ${error.message}`);
      throw new HttpException(
        'Failed to assign task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/emergency-stop')
  @ApiOperation({
    summary: 'Emergency stop robot',
    description: 'Immediately stop robot operations for safety reasons',
  })
  @ApiParam({ name: 'id', description: 'Robot ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Emergency stop executed',
    schema: {
      example: {
        robotId: 'robot_001',
        emergencyStopTime: '2024-03-01T12:34:56Z',
        reason: 'Safety protocol triggered',
        safetySystemsActive: true,
        resumeRequiresAuthorization: true
      }
    }
  })
  async emergencyStop(@Param('id') robotId: string) {
    try {
      this.logger.warn(`Emergency stop triggered for robot: ${robotId}`);
      
      const result = await this.roboticsService.emergencyStop(robotId);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Emergency stop executed successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to execute emergency stop: ${error.message}`);
      throw new HttpException(
        'Failed to execute emergency stop',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('coordination')
  @ApiOperation({
    summary: 'Coordinate multiple robots',
    description: 'Set up coordination between multiple robots for collaborative tasks',
  })
  @ApiBody({ type: RobotCoordinationDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Robot coordination established',
    schema: {
      example: {
        coordinationId: 'coord_123',
        robotIds: ['robot_001', 'robot_002', 'robot_003'],
        coordinationType: 'COLLABORATIVE',
        status: 'ACTIVE',
        synchronizationAccuracy: 0.98,
        estimatedCompletion: '2024-03-01T16:00:00Z'
      }
    }
  })
  async coordinateRobots(@Body() coordinationDto: RobotCoordinationDto) {
    try {
      this.logger.log(`Setting up robot coordination for: ${coordinationDto.robotIds.join(', ')}`);
      
      const coordination = await this.coordinationService.establishCoordination(coordinationDto);
      
      this.logger.log(`Robot coordination established: ${coordination.id}`);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Robot coordination established successfully',
        data: coordination,
      };
    } catch (error) {
      this.logger.error(`Failed to coordinate robots: ${error.message}`);
      throw new HttpException(
        'Failed to coordinate robots',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics/performance')
  @ApiOperation({
    summary: 'Get robotics performance analytics',
    description: 'Retrieve comprehensive performance analytics for all robots',
  })
  @ApiQuery({ name: 'period', required: false, description: 'Analysis period (1h, 1d, 1w, 1m)' })
  @ApiQuery({ name: 'workCellId', required: false, description: 'Filter by work cell' })
  @ApiResponse({ 
    status: 200, 
    description: 'Robotics analytics retrieved',
    schema: {
      example: {
        overallPerformance: {
          efficiency: 0.91,
          uptime: 0.95,
          throughput: 245, // units/hour
          errorRate: 0.03
        },
        robotBreakdown: {
          'robot_001': { efficiency: 0.94, uptime: 0.98, tasks: 125 },
          'robot_002': { efficiency: 0.89, uptime: 0.92, tasks: 98 }
        },
        trends: {
          efficiency: 'improving',
          maintenanceNeeded: ['robot_003'],
          recommendations: ['Optimize robot_002 parameters', 'Schedule maintenance for robot_003']
        }
      }
    }
  })
  async getRoboticsAnalytics(
    @Query('period') period?: string,
    @Query('workCellId') workCellId?: string,
  ) {
    try {
      this.logger.log('Retrieving robotics performance analytics');
      
      const analytics = await this.roboticsService.getPerformanceAnalytics({
        period,
        workCellId,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Robotics analytics retrieved successfully',
        data: analytics,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve analytics: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
