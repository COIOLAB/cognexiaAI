// Industry 5.0 ERP Backend - Resource Planning Controller
// Advanced resource planning with intelligent allocation and optimization
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

import { ResourcePlanningService } from '../services/resource-planning.service';
import { ProductionPlanningGuard } from '../guards/production-planning.guard';

// DTOs for resource planning
export class CreateResourcePlanDto {
  projectId: string;
  planningPeriod: { startDate: string; endDate: string };
  resourceRequirements: {
    resourceType: 'HUMAN' | 'MACHINE' | 'MATERIAL' | 'TOOL' | 'SPACE';
    resourceId: string;
    quantityRequired: number;
    skillLevel?: string;
    timeframe: { start: string; end: string };
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }[];
  constraints?: {
    budgetLimit?: number;
    availabilityWindows?: { start: string; end: string }[];
    qualityRequirements?: string[];
  };
}

export class UpdateResourcePlanDto {
  allocatedResources?: {
    resourceId: string;
    allocatedQuantity: number;
    allocationStatus: 'PENDING' | 'CONFIRMED' | 'IN_USE' | 'COMPLETED';
  }[];
  status?: 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

@ApiTags('Resource Planning')
@Controller('production-planning/resource-planning')
@UseGuards(ProductionPlanningGuard)
@ApiBearerAuth()
export class ResourcePlanningController {
  private readonly logger = new Logger(ResourcePlanningController.name);

  constructor(
    private readonly resourcePlanningService: ResourcePlanningService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create new resource plan',
    description: 'Generate comprehensive resource allocation plan with intelligent optimization',
  })
  @ApiBody({ type: CreateResourcePlanDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Resource plan created successfully',
    schema: {
      example: {
        id: 'res_plan_123',
        projectId: 'PROJ_001',
        planningPeriod: '2024-Q1',
        totalResources: 45,
        allocatedResources: 38,
        allocationRate: 0.84,
        conflicts: 2,
        optimizationScore: 0.91
      }
    }
  })
  async createResourcePlan(@Body() createDto: CreateResourcePlanDto) {
    try {
      this.logger.log(`Creating resource plan for project: ${createDto.projectId}`);
      
      const plan = await this.resourcePlanningService.createResourcePlan(createDto);
      
      this.logger.log(`Resource plan created successfully: ${plan.id}`);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Resource plan created successfully',
        data: plan,
      };
    } catch (error) {
      this.logger.error(`Failed to create resource plan: ${error.message}`);
      throw new HttpException(
        'Failed to create resource plan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get resource plans',
    description: 'Retrieve resource plans with filtering and pagination',
  })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'resourceType', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Resource plans retrieved successfully' 
  })
  async getResourcePlans(@Query() query: any) {
    try {
      this.logger.log('Retrieving resource plans with filters');
      
      const result = await this.resourcePlanningService.getResourcePlans(query);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Resource plans retrieved successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve resource plans: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve resource plans',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get resource plan by ID',
    description: 'Retrieve detailed resource plan information',
  })
  @ApiParam({ name: 'id', description: 'Resource plan ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resource plan details retrieved' 
  })
  async getResourcePlanById(@Param('id') id: string) {
    try {
      this.logger.log(`Retrieving resource plan: ${id}`);
      
      const plan = await this.resourcePlanningService.getResourcePlanById(id);
      
      if (!plan) {
        throw new HttpException('Resource plan not found', HttpStatus.NOT_FOUND);
      }
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Resource plan retrieved successfully',
        data: plan,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve resource plan: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to retrieve resource plan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update resource plan',
    description: 'Update resource allocations and plan status',
  })
  @ApiParam({ name: 'id', description: 'Resource plan ID' })
  @ApiBody({ type: UpdateResourcePlanDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Resource plan updated successfully' 
  })
  async updateResourcePlan(
    @Param('id') id: string,
    @Body() updateDto: UpdateResourcePlanDto,
  ) {
    try {
      this.logger.log(`Updating resource plan: ${id}`);
      
      const updatedPlan = await this.resourcePlanningService.updateResourcePlan(id, updateDto);
      
      this.logger.log(`Resource plan updated successfully: ${id}`);
      return {
        statusCode: HttpStatus.OK,
        message: 'Resource plan updated successfully',
        data: updatedPlan,
      };
    } catch (error) {
      this.logger.error(`Failed to update resource plan: ${error.message}`);
      throw new HttpException(
        'Failed to update resource plan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete resource plan',
    description: 'Remove resource plan from the system',
  })
  @ApiParam({ name: 'id', description: 'Resource plan ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resource plan deleted successfully' 
  })
  async deleteResourcePlan(@Param('id') id: string) {
    try {
      this.logger.log(`Deleting resource plan: ${id}`);
      
      await this.resourcePlanningService.deleteResourcePlan(id);
      
      this.logger.log(`Resource plan deleted successfully: ${id}`);
      return {
        statusCode: HttpStatus.OK,
        message: 'Resource plan deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to delete resource plan: ${error.message}`);
      throw new HttpException(
        'Failed to delete resource plan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/optimize')
  @ApiOperation({
    summary: 'Optimize resource allocation',
    description: 'Run AI optimization to improve resource allocation efficiency',
  })
  @ApiParam({ name: 'id', description: 'Resource plan ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resource optimization completed',
    schema: {
      example: {
        planId: 'res_plan_123',
        originalEfficiency: 0.84,
        optimizedEfficiency: 0.93,
        improvements: {
          costSavings: '18%',
          utilizationIncrease: '11%',
          conflictsResolved: 5
        },
        recommendations: [
          'Reallocate Machine-A to Project-X',
          'Adjust shift patterns for better coverage',
          'Cross-train operators for flexibility'
        ]
      }
    }
  })
  async optimizeResourcePlan(@Param('id') id: string) {
    try {
      this.logger.log(`Optimizing resource plan: ${id}`);
      
      const optimization = await this.resourcePlanningService.optimizeResourcePlan(id);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Resource optimization completed',
        data: optimization,
      };
    } catch (error) {
      this.logger.error(`Failed to optimize resource plan: ${error.message}`);
      throw new HttpException(
        'Failed to optimize resource plan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics/utilization')
  @ApiOperation({
    summary: 'Get resource utilization analytics',
    description: 'Analyze resource utilization patterns and efficiency metrics',
  })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'resourceType', required: false })
  @ApiQuery({ name: 'facilityId', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Resource utilization analytics retrieved',
    schema: {
      example: {
        overallUtilization: 0.87,
        resourceBreakdown: {
          'HUMAN': { utilization: 0.91, efficiency: 0.88 },
          'MACHINE': { utilization: 0.85, efficiency: 0.92 },
          'MATERIAL': { utilization: 0.78, efficiency: 0.85 }
        },
        trends: {
          utilizationTrend: 'increasing',
          efficiencyTrend: 'stable'
        },
        recommendations: ['Optimize material flow', 'Balance workloads']
      }
    }
  })
  async getResourceUtilizationAnalytics(
    @Query('period') period?: string,
    @Query('resourceType') resourceType?: string,
    @Query('facilityId') facilityId?: string,
  ) {
    try {
      this.logger.log('Retrieving resource utilization analytics');
      
      const analytics = await this.resourcePlanningService.getUtilizationAnalytics({
        period,
        resourceType,
        facilityId,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Resource utilization analytics retrieved successfully',
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
