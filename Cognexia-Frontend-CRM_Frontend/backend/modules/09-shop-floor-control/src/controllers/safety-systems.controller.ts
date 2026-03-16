// Industry 5.0 ERP Backend - Safety Systems Controller
// Advanced safety monitoring and incident management for shop floor
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Controller,
  Get,
  Post,
  Put,
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

import { HumanRobotSafetyService } from '../services/human-robot-safety.service';
import { SafetyProtocolGuard } from '../guards/safety-protocol.guard';

export class SafetyIncidentDto {
  incidentType: 'COLLISION' | 'EXPOSURE' | 'MALFUNCTION' | 'PROTOCOL_VIOLATION' | 'EMERGENCY_STOP';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: {
    workCellId: string;
    zone: string;
    coordinates?: { x: number; y: number; z: number };
  };
  involvedPersonnel?: string[];
  involvedEquipment?: string[];
  description: string;
  immediateActions?: string[];
}

@ApiTags('Safety Systems')
@Controller('shop-floor/safety')
@UseGuards(SafetyProtocolGuard)
@ApiBearerAuth()
export class SafetySystemsController {
  private readonly logger = new Logger(SafetySystemsController.name);

  constructor(
    private readonly safetyService: HumanRobotSafetyService,
  ) {}

  @Get('status')
  @ApiOperation({
    summary: 'Get safety system status',
    description: 'Retrieve overall safety system status and active monitors',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Safety status retrieved',
    schema: {
      example: {
        overallStatus: 'SAFE',
        activeSafetySystems: 24,
        safetyZones: {
          total: 12,
          secure: 11,
          warning: 1,
          critical: 0
        },
        emergencyStops: {
          available: 8,
          triggered: 0
        },
        personnel: {
          onFloor: 15,
          inSafeZones: 15,
          alerts: 0
        }
      }
    }
  })
  async getSafetyStatus() {
    try {
      const status = await this.safetyService.getOverallSafetyStatus();
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Safety status retrieved successfully',
        data: status,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve safety status: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve safety status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('incidents')
  @ApiOperation({
    summary: 'Report safety incident',
    description: 'Report and log a safety incident for investigation',
  })
  @ApiBody({ type: SafetyIncidentDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Safety incident reported',
    schema: {
      example: {
        incidentId: 'INC_001',
        reportedAt: '2024-03-01T14:30:00Z',
        status: 'UNDER_INVESTIGATION',
        responseTeam: ['SAFETY_001', 'SUPERVISOR_002'],
        estimatedResolution: '2024-03-01T16:00:00Z'
      }
    }
  })
  async reportIncident(@Body() incidentDto: SafetyIncidentDto) {
    try {
      this.logger.warn(`Safety incident reported: ${incidentDto.incidentType}`);
      
      const incident = await this.safetyService.reportIncident(incidentDto);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Safety incident reported successfully',
        data: incident,
      };
    } catch (error) {
      this.logger.error(`Failed to report incident: ${error.message}`);
      throw new HttpException(
        'Failed to report incident',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics/trends')
  @ApiOperation({
    summary: 'Get safety analytics',
    description: 'Analyze safety trends and performance metrics',
  })
  @ApiQuery({ name: 'period', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Safety analytics retrieved',
    schema: {
      example: {
        safetyScore: 0.96,
        incidentTrends: {
          total: 3,
          thisMonth: 1,
          lastMonth: 2,
          trend: 'improving'
        },
        riskAreas: [
          { zone: 'ZONE_A', riskLevel: 'MEDIUM', incidents: 2 }
        ],
        compliance: {
          protocolAdherence: 0.98,
          trainingCompliance: 0.94,
          equipmentCertification: 1.0
        }
      }
    }
  })
  async getSafetyAnalytics(@Query('period') period?: string) {
    try {
      const analytics = await this.safetyService.getSafetyAnalytics({ period });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Safety analytics retrieved successfully',
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
