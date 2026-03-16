// Industry 5.0 ERP Backend - Equipment Controller
// Advanced equipment management with IoT integration and predictive analytics
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

import { EquipmentService } from '../services/equipment.service';
import { EquipmentAccessGuard } from '../guards/equipment-access.guard';

// DTOs for equipment operations
export class CreateEquipmentDto {
  equipmentCode: string;
  name: string;
  description?: string;
  equipmentType: 'PRODUCTION_MACHINE' | 'ROBOT' | 'CONVEYOR' | 'HVAC' | 'POWER_SYSTEM' | 'SAFETY_SYSTEM' | 'MEASURING_DEVICE' | 'TOOL';
  manufacturer: string;
  model: string;
  serialNumber: string;
  facilityId: string;
  workCellId?: string;
  productionLineId?: string;
  criticalityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  installationDate: string;
  warrantyExpiry?: string;
  acquisitionCost?: number;
  replacementCost?: number;
  specifications?: any;
  operationalLimits?: any;
  maintenanceParameters?: any;
  iotConfiguration?: any;
  digitalTwinConfiguration?: any;
  location?: any;
  documentation?: any;
}

export class UpdateEquipmentDto {
  name?: string;
  description?: string;
  status?: 'OPERATIONAL' | 'MAINTENANCE' | 'DOWN' | 'STANDBY' | 'DECOMMISSIONED';
  workCellId?: string;
  productionLineId?: string;
  operatingHours?: number;
  totalCycles?: number;
  currentEfficiency?: number;
  availability?: number;
  operationalLimits?: any;
  maintenanceParameters?: any;
  iotConfiguration?: any;
  digitalTwinConfiguration?: any;
  healthScore?: number;
  riskFactors?: any[];
  location?: any;
}

@ApiTags('Equipment Management')
@Controller('maintenance/equipment')
@UseGuards(EquipmentAccessGuard)
@ApiBearerAuth()
export class EquipmentController {
  private readonly logger = new Logger(EquipmentController.name);

  constructor(
    private readonly equipmentService: EquipmentService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all equipment',
    description: 'Retrieve equipment with filtering, pagination, and health status',
  })
  @ApiQuery({ name: 'facilityId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'equipmentType', required: false })
  @ApiQuery({ name: 'criticalityLevel', required: false })
  @ApiQuery({ name: 'healthThreshold', required: false, description: 'Filter by health score threshold' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Equipment retrieved successfully',
    schema: {
      example: {
        equipment: [
          {
            id: 'eq_001',
            equipmentCode: 'PROD_LINE_A_001',
            name: 'Production Line A - Main Assembly',
            equipmentType: 'PRODUCTION_MACHINE',
            status: 'OPERATIONAL',
            criticalityLevel: 'HIGH',
            healthScore: 87.5,
            currentEfficiency: 0.94,
            availability: 0.96,
            nextScheduledMaintenance: '2024-03-15T08:00:00Z',
            riskLevel: 'MEDIUM',
            isOverdue: false
          }
        ],
        total: 45,
        operational: 38,
        maintenance: 4,
        down: 2,
        decommissioned: 1
      }
    }
  })
  async getAllEquipment(
    @Query('facilityId') facilityId?: string,
    @Query('status') status?: string,
    @Query('equipmentType') equipmentType?: string,
    @Query('criticalityLevel') criticalityLevel?: string,
    @Query('healthThreshold') healthThreshold?: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    try {
      const equipment = await this.equipmentService.findAll({
        facilityId,
        status,
        equipmentType,
        criticalityLevel,
        healthThreshold,
        limit,
        offset,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Equipment retrieved successfully',
        data: equipment,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve equipment: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new HttpException(
        'Failed to retrieve equipment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get equipment by ID',
    description: 'Retrieve detailed equipment information including sensors, maintenance history, and analytics',
  })
  @ApiParam({ name: 'id', description: 'Equipment ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Equipment details retrieved',
    schema: {
      example: {
        id: 'eq_001',
        equipmentCode: 'PROD_LINE_A_001',
        name: 'Production Line A - Main Assembly',
        specifications: {
          power: 150, // kW
          voltage: 480, // V
          dimensions: { length: 12, width: 8, height: 3 }
        },
        currentMetrics: {
          efficiency: 0.94,
          availability: 0.96,
          operatingHours: 15420,
          totalCycles: 245600,
          healthScore: 87.5
        },
        maintenanceStatus: {
          lastMaintenance: '2024-02-15T08:00:00Z',
          nextScheduled: '2024-03-15T08:00:00Z',
          isOverdue: false,
          upcomingTasks: 3
        },
        sensors: [
          { type: 'TEMPERATURE', currentValue: 68.5, unit: '°C', status: 'OK' },
          { type: 'VIBRATION', currentValue: 0.03, unit: 'mm/s', status: 'OK' }
        ],
        riskFactors: [
          { factor: 'Temperature trending up', severity: 'MEDIUM', probability: 0.3 }
        ]
      }
    }
  })
  async getEquipmentById(@Param('id') id: string) {
    try {
      const equipment = await this.equipmentService.findById(id);
      
      if (!equipment) {
        throw new HttpException('Equipment not found', HttpStatus.NOT_FOUND);
      }
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Equipment details retrieved successfully',
        data: equipment,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve equipment: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to retrieve equipment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Create new equipment',
    description: 'Add new equipment to the maintenance system',
  })
  @ApiBody({ type: CreateEquipmentDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Equipment created successfully' 
  })
  async createEquipment(@Body() createDto: CreateEquipmentDto) {
    try {
      this.logger.log(`Creating equipment: ${createDto.equipmentCode}`);
      
      const equipment = await this.equipmentService.create(createDto);
      
      this.logger.log(`Equipment created successfully: ${equipment.id}`);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Equipment created successfully',
        data: equipment,
      };
    } catch (error) {
      this.logger.error(`Failed to create equipment: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new HttpException(
        'Failed to create equipment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update equipment',
    description: 'Update equipment information and configuration',
  })
  @ApiParam({ name: 'id', description: 'Equipment ID' })
  @ApiBody({ type: UpdateEquipmentDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Equipment updated successfully' 
  })
  async updateEquipment(
    @Param('id') id: string,
    @Body() updateDto: UpdateEquipmentDto,
  ) {
    try {
      const updatedEquipment = await this.equipmentService.update(id, updateDto);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Equipment updated successfully',
        data: updatedEquipment,
      };
    } catch (error) {
      this.logger.error(`Failed to update equipment: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new HttpException(
        'Failed to update equipment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/health')
  @ApiOperation({
    summary: 'Get equipment health assessment',
    description: 'Retrieve comprehensive health analysis including predictive insights',
  })
  @ApiParam({ name: 'id', description: 'Equipment ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Equipment health assessment retrieved',
    schema: {
      example: {
        equipmentId: 'eq_001',
        overallHealthScore: 87.5,
        healthTrend: 'STABLE',
        componentHealth: {
          'motor': { score: 92, status: 'GOOD' },
          'bearings': { score: 78, status: 'FAIR' },
          'sensors': { score: 95, status: 'EXCELLENT' }
        },
        predictiveInsights: {
          failureProbability: 0.15,
          estimatedRemainingLife: 180, // days
          recommendedActions: [
            'Schedule bearing inspection in 30 days',
            'Monitor vibration levels closely'
          ]
        },
        riskAssessment: {
          currentRiskLevel: 'MEDIUM',
          riskFactors: ['Bearing wear', 'Operating temperature variance'],
          mitigationStrategies: ['Preventive maintenance', 'Condition monitoring']
        }
      }
    }
  })
  async getEquipmentHealth(@Param('id') id: string) {
    try {
      const healthAssessment = await this.equipmentService.getHealthAssessment(id);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Equipment health assessment retrieved',
        data: healthAssessment,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve health assessment: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new HttpException(
        'Failed to retrieve health assessment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics/performance')
  @ApiOperation({
    summary: 'Get equipment performance analytics',
    description: 'Analyze equipment performance trends and efficiency metrics',
  })
  @ApiQuery({ name: 'facilityId', required: false })
  @ApiQuery({ name: 'period', required: false, description: 'Analysis period (7d, 30d, 90d, 1y)' })
  @ApiQuery({ name: 'equipmentType', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Equipment performance analytics retrieved',
    schema: {
      example: {
        overallPerformance: {
          averageEfficiency: 0.89,
          averageAvailability: 0.94,
          totalDowntime: 24.5, // hours
          mtbf: 720, // hours
          mttr: 2.5, // hours
        },
        topPerformers: [
          { equipmentId: 'eq_003', efficiency: 0.97, availability: 0.99 },
          { equipmentId: 'eq_007', efficiency: 0.95, availability: 0.98 }
        ],
        underperformers: [
          { equipmentId: 'eq_012', efficiency: 0.76, availability: 0.85, issues: ['High downtime', 'Frequent breakdowns'] }
        ],
        trends: {
          efficiencyTrend: 'improving',
          downtimeTrend: 'decreasing',
          maintenanceCostTrend: 'stable'
        }
      }
    }
  })
  async getPerformanceAnalytics(
    @Query('facilityId') facilityId?: string,
    @Query('period') period?: string,
    @Query('equipmentType') equipmentType?: string,
  ) {
    try {
      const analytics = await this.equipmentService.getPerformanceAnalytics({
        facilityId,
        period,
        equipmentType,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Performance analytics retrieved successfully',
        data: analytics,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new HttpException(
        'Failed to retrieve analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
