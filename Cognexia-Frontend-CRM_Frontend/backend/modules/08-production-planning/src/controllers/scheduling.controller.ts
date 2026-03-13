// Industry 5.0 ERP Backend - Scheduling Controller
// Advanced production scheduling with AI optimization and real-time adjustments
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

import { SchedulingOptimizationService } from '../services/scheduling-optimization.service';
import { SchedulingApprovalGuard } from '../guards/scheduling-approval.guard';

// DTOs for scheduling
export class CreateScheduleDto {
  productionPlanId: string;
  schedulingHorizon: number; // days
  priorities: ('COST' | 'TIME' | 'QUALITY' | 'RESOURCE_UTILIZATION')[];
  constraints: {
    capacityLimits?: { resourceType: string; limit: number }[];
    deadlines?: { orderId: string; deadline: string }[];
    dependencies?: { predecessor: string; successor: string }[];
    maintenanceWindows?: { start: string; end: string; equipmentId: string }[];
  };
  optimizationLevel: 'BASIC' | 'ADVANCED' | 'AI_ENHANCED';
}

export class UpdateScheduleDto {
  scheduleItems?: {
    itemId: string;
    startTime?: string;
    endTime?: string;
    resourceAllocation?: { resourceId: string; quantity: number }[];
  }[];
  status?: 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'COMPLETED';
  notes?: string;
}

@ApiTags('Production Scheduling')
@Controller('production-planning/scheduling')
@UseGuards(SchedulingApprovalGuard)
@ApiBearerAuth()
export class SchedulingController {
  private readonly logger = new Logger(SchedulingController.name);

  constructor(
    private readonly schedulingService: SchedulingOptimizationService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create production schedule',
    description: 'Generate optimized production schedule with AI-powered resource allocation',
  })
  @ApiBody({ type: CreateScheduleDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Production schedule created successfully',
    schema: {
      example: {
        id: 'schedule_123',
        productionPlanId: 'plan_001',
        totalTasks: 150,
        scheduledTasks: 147,
        utilizationRate: 0.89,
        makespan: 240, // hours
        optimizationScore: 0.94
      }
    }
  })
  async createSchedule(@Body() createDto: CreateScheduleDto) {
    try {
      this.logger.log(`Creating schedule for plan: ${createDto.productionPlanId}`);
      
      const schedule = await this.schedulingService.createOptimizedSchedule(createDto);
      
      this.logger.log(`Schedule created successfully: ${schedule.id}`);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Production schedule created successfully',
        data: schedule,
      };
    } catch (error) {
      this.logger.error(`Failed to create schedule: ${error.message}`);
      throw new HttpException(
        'Failed to create schedule',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get production schedules',
    description: 'Retrieve production schedules with filtering options',
  })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Schedules retrieved successfully' 
  })
  async getSchedules(@Query() query: any) {
    try {
      const result = await this.schedulingService.getSchedules(query);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Schedules retrieved successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve schedules: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve schedules',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get schedule by ID',
    description: 'Retrieve detailed schedule information',
  })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({ status: 200, description: 'Schedule details retrieved' })
  async getScheduleById(@Param('id') id: string) {
    try {
      const schedule = await this.schedulingService.getScheduleById(id);
      
      if (!schedule) {
        throw new HttpException('Schedule not found', HttpStatus.NOT_FOUND);
      }
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Schedule retrieved successfully',
        data: schedule,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to retrieve schedule',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update production schedule',
    description: 'Update schedule items and status',
  })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiBody({ type: UpdateScheduleDto })
  @ApiResponse({ status: 200, description: 'Schedule updated successfully' })
  async updateSchedule(
    @Param('id') id: string,
    @Body() updateDto: UpdateScheduleDto,
  ) {
    try {
      const updatedSchedule = await this.schedulingService.updateSchedule(id, updateDto);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Schedule updated successfully',
        data: updatedSchedule,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to update schedule',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/reoptimize')
  @ApiOperation({
    summary: 'Reoptimize production schedule',
    description: 'Run AI reoptimization to improve current schedule',
  })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Schedule reoptimization completed',
    schema: {
      example: {
        scheduleId: 'schedule_123',
        originalMakespan: 240,
        optimizedMakespan: 218,
        improvements: {
          timeReduction: '9%',
          utilizationIncrease: '7%',
          costSavings: '12%'
        }
      }
    }
  })
  async reoptimizeSchedule(@Param('id') id: string) {
    try {
      this.logger.log(`Reoptimizing schedule: ${id}`);
      
      const optimization = await this.schedulingService.reoptimizeSchedule(id);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Schedule reoptimization completed',
        data: optimization,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to reoptimize schedule',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics/performance')
  @ApiOperation({
    summary: 'Get scheduling performance analytics',
    description: 'Analyze scheduling efficiency and optimization trends',
  })
  @ApiQuery({ name: 'period', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Scheduling analytics retrieved',
    schema: {
      example: {
        averageMakespan: 225,
        averageUtilization: 0.87,
        onTimeDelivery: 0.94,
        scheduleAdherence: 0.91,
        trends: {
          makespanTrend: 'improving',
          utilizationTrend: 'stable'
        }
      }
    }
  })
  async getSchedulingAnalytics(@Query('period') period?: string) {
    try {
      const analytics = await this.schedulingService.getSchedulingAnalytics({ period });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Scheduling analytics retrieved successfully',
        data: analytics,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
