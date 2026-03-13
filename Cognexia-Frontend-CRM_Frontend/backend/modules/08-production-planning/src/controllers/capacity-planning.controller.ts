// Industry 5.0 ERP Backend - Capacity Planning Controller
// Advanced capacity planning with resource optimization and bottleneck analysis
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

import { CapacityPlanningService } from '../services/capacity-planning.service';
import { CapacityAccessGuard } from '../guards/capacity-access.guard';

// DTOs for capacity planning
export class CreateCapacityPlanDto {
  facilityId: string;
  planningHorizon: number; // days
  resourceTypes: string[]; // ['MACHINE', 'LABOR', 'MATERIAL', 'SPACE']
  demandForecastId?: string;
  constraints?: {
    maxCapacity?: number;
    minUtilization?: number;
    overtimeAllowed?: boolean;
    shiftPatterns?: string[];
  };
  optimizationGoals?: ('COST_MINIMIZE' | 'UTILIZATION_MAXIMIZE' | 'LEAD_TIME_MINIMIZE')[];
}

export class UpdateCapacityPlanDto {
  allocatedCapacity?: number;
  utilizationTarget?: number;
  notes?: string;
  status?: 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'COMPLETED';
}

export class CapacityAnalysisDto {
  facilityId?: string;
  resourceType?: string;
  dateFrom?: string;
  dateTo?: string;
  includeBottlenecks?: boolean;
  includeOptimization?: boolean;
}

@ApiTags('Capacity Planning')
@Controller('production-planning/capacity-planning')
@UseGuards(CapacityAccessGuard)
@ApiBearerAuth()
export class CapacityPlanningController {
  private readonly logger = new Logger(CapacityPlanningController.name);

  constructor(
    private readonly capacityPlanningService: CapacityPlanningService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create new capacity plan',
    description: 'Generate capacity plan with resource optimization and constraint analysis',
  })
  @ApiBody({ type: CreateCapacityPlanDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Capacity plan created successfully',
    schema: {
      example: {
        id: 'cap_plan_123',
        facilityId: 'FAC_001',
        planningPeriod: '2024-Q1',
        totalCapacity: 8760, // hours
        allocatedCapacity: 7200,
        utilizationRate: 0.82,
        bottlenecks: ['MACHINE_TYPE_A'],
        optimizationScore: 0.89
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid capacity plan parameters' })
  @ApiResponse({ status: 500, description: 'Capacity plan creation failed' })
  async createCapacityPlan(@Body() createDto: CreateCapacityPlanDto) {
    try {
      this.logger.log(`Creating capacity plan for facility: ${createDto.facilityId}`);
      
      const plan = await this.capacityPlanningService.createCapacityPlan(createDto);
      
      this.logger.log(`Capacity plan created successfully: ${plan.id}`);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Capacity plan created successfully',
        data: plan,
      };
    } catch (error) {
      this.logger.error(`Failed to create capacity plan: ${error.message}`);
      throw new HttpException(
        'Failed to create capacity plan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get capacity plans',
    description: 'Retrieve capacity plans with filtering and pagination',
  })
  @ApiQuery({ name: 'facilityId', required: false, description: 'Filter by facility ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by plan status' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results per page' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of results to skip' })
  @ApiResponse({ 
    status: 200, 
    description: 'Capacity plans retrieved successfully',
    schema: {
      example: {
        plans: [
          {
            id: 'cap_plan_123',
            facilityId: 'FAC_001',
            planningPeriod: '2024-Q1',
            totalCapacity: 8760,
            allocatedCapacity: 7200,
            utilizationRate: 0.82,
            status: 'ACTIVE'
          }
        ],
        total: 25,
        page: 1,
        totalPages: 3
      }
    }
  })
  async getCapacityPlans(@Query() query: any) {
    try {
      this.logger.log('Retrieving capacity plans with filters');
      
      const result = await this.capacityPlanningService.getCapacityPlans(query);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Capacity plans retrieved successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve capacity plans: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve capacity plans',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get capacity plan by ID',
    description: 'Retrieve detailed information about a specific capacity plan',
  })
  @ApiParam({ name: 'id', description: 'Capacity plan ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Capacity plan details retrieved',
    schema: {
      example: {
        id: 'cap_plan_123',
        facilityId: 'FAC_001',
        planningPeriod: '2024-Q1',
        totalCapacity: 8760,
        allocatedCapacity: 7200,
        utilizationRate: 0.82,
        resourceBreakdown: {
          machines: { capacity: 4000, allocated: 3500 },
          labor: { capacity: 3200, allocated: 2800 },
          space: { capacity: 1560, allocated: 900 }
        },
        bottlenecks: ['MACHINE_TYPE_A'],
        recommendations: ['Add 2 more Type A machines', 'Optimize shift patterns']
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Capacity plan not found' })
  async getCapacityPlanById(@Param('id') id: string) {
    try {
      this.logger.log(`Retrieving capacity plan: ${id}`);
      
      const plan = await this.capacityPlanningService.getCapacityPlanById(id);
      
      if (!plan) {
        throw new HttpException('Capacity plan not found', HttpStatus.NOT_FOUND);
      }
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Capacity plan retrieved successfully',
        data: plan,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve capacity plan: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to retrieve capacity plan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update capacity plan',
    description: 'Update capacity plan parameters and allocations',
  })
  @ApiParam({ name: 'id', description: 'Capacity plan ID' })
  @ApiBody({ type: UpdateCapacityPlanDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Capacity plan updated successfully' 
  })
  @ApiResponse({ status: 404, description: 'Capacity plan not found' })
  async updateCapacityPlan(
    @Param('id') id: string,
    @Body() updateDto: UpdateCapacityPlanDto,
  ) {
    try {
      this.logger.log(`Updating capacity plan: ${id}`);
      
      const updatedPlan = await this.capacityPlanningService.updateCapacityPlan(id, updateDto);
      
      this.logger.log(`Capacity plan updated successfully: ${id}`);
      return {
        statusCode: HttpStatus.OK,
        message: 'Capacity plan updated successfully',
        data: updatedPlan,
      };
    } catch (error) {
      this.logger.error(`Failed to update capacity plan: ${error.message}`);
      throw new HttpException(
        'Failed to update capacity plan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete capacity plan',
    description: 'Remove a capacity plan from the system',
  })
  @ApiParam({ name: 'id', description: 'Capacity plan ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Capacity plan deleted successfully' 
  })
  @ApiResponse({ status: 404, description: 'Capacity plan not found' })
  async deleteCapacityPlan(@Param('id') id: string) {
    try {
      this.logger.log(`Deleting capacity plan: ${id}`);
      
      await this.capacityPlanningService.deleteCapacityPlan(id);
      
      this.logger.log(`Capacity plan deleted successfully: ${id}`);
      return {
        statusCode: HttpStatus.OK,
        message: 'Capacity plan deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to delete capacity plan: ${error.message}`);
      throw new HttpException(
        'Failed to delete capacity plan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/optimize')
  @ApiOperation({
    summary: 'Optimize capacity plan',
    description: 'Run optimization algorithms to improve capacity allocation and utilization',
  })
  @ApiParam({ name: 'id', description: 'Capacity plan ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Capacity optimization completed',
    schema: {
      example: {
        planId: 'cap_plan_123',
        originalUtilization: 0.82,
        optimizedUtilization: 0.91,
        improvements: {
          costReduction: '15%',
          leadTimeReduction: '8%',
          bottlenecksResolved: 2
        },
        recommendations: [
          'Redistribute workload to Line B',
          'Implement flexible shift patterns',
          'Add buffer capacity for peak periods'
        ]
      }
    }
  })
  async optimizeCapacityPlan(@Param('id') id: string) {
    try {
      this.logger.log(`Optimizing capacity plan: ${id}`);
      
      const optimization = await this.capacityPlanningService.optimizeCapacityPlan(id);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Capacity optimization completed',
        data: optimization,
      };
    } catch (error) {
      this.logger.error(`Failed to optimize capacity plan: ${error.message}`);
      throw new HttpException(
        'Failed to optimize capacity plan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analysis/bottlenecks')
  @ApiOperation({
    summary: 'Analyze capacity bottlenecks',
    description: 'Identify and analyze capacity bottlenecks across facilities and resources',
  })
  @ApiQuery({ name: 'facilityId', required: false, description: 'Filter by facility ID' })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Filter by resource type' })
  @ApiQuery({ name: 'severity', required: false, description: 'Filter by bottleneck severity' })
  @ApiResponse({ 
    status: 200, 
    description: 'Bottleneck analysis completed',
    schema: {
      example: {
        criticalBottlenecks: [
          {
            facilityId: 'FAC_001',
            resourceType: 'MACHINE_TYPE_A',
            severity: 'HIGH',
            utilizationRate: 0.98,
            impactOnProduction: '25%',
            recommendedActions: ['Add 2 more machines', 'Extend operating hours']
          }
        ],
        totalBottlenecks: 8,
        facilitiesAffected: 3,
        averageUtilization: 0.87
      }
    }
  })
  async analyzeBottlenecks(@Query() query: CapacityAnalysisDto) {
    try {
      this.logger.log('Analyzing capacity bottlenecks');
      
      const analysis = await this.capacityPlanningService.analyzeBottlenecks(query);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Bottleneck analysis completed',
        data: analysis,
      };
    } catch (error) {
      this.logger.error(`Failed to analyze bottlenecks: ${error.message}`);
      throw new HttpException(
        'Failed to analyze bottlenecks',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics/utilization')
  @ApiOperation({
    summary: 'Get capacity utilization analytics',
    description: 'Retrieve comprehensive analytics on capacity utilization trends and efficiency',
  })
  @ApiQuery({ name: 'period', required: false, description: 'Analysis period (30d, 90d, 1y)' })
  @ApiQuery({ name: 'facilityId', required: false, description: 'Filter by facility ID' })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Filter by resource type' })
  @ApiResponse({ 
    status: 200, 
    description: 'Utilization analytics retrieved',
    schema: {
      example: {
        overallUtilization: 0.84,
        utilizationTrend: 'increasing',
        facilityBreakdown: {
          'FAC_001': { utilization: 0.89, trend: 'stable' },
          'FAC_002': { utilization: 0.76, trend: 'improving' }
        },
        resourceBreakdown: {
          'machines': { utilization: 0.91, efficiency: 0.87 },
          'labor': { utilization: 0.82, efficiency: 0.89 },
          'space': { utilization: 0.67, efficiency: 0.78 }
        },
        recommendations: ['Optimize space utilization', 'Balance machine workloads']
      }
    }
  })
  async getUtilizationAnalytics(
    @Query('period') period?: string,
    @Query('facilityId') facilityId?: string,
    @Query('resourceType') resourceType?: string,
  ) {
    try {
      this.logger.log('Retrieving capacity utilization analytics');
      
      const analytics = await this.capacityPlanningService.getUtilizationAnalytics({
        period,
        facilityId,
        resourceType,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Utilization analytics retrieved successfully',
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
