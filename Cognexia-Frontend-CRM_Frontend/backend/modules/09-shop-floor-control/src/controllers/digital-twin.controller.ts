// Industry 5.0 ERP Backend - Digital Twin Controller
// Advanced digital twin management and simulation for shop floor
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

import { DigitalTwinIntegrationService } from '../services/digital-twin-integration.service';
import { ShopFloorSecurityGuard } from '../guards/shop-floor-security.guard';

export class CreateDigitalTwinDto {
  physicalAssetId: string;
  assetType: 'MACHINE' | 'ROBOT' | 'PRODUCTION_LINE' | 'WORK_CELL' | 'FACILITY';
  name: string;
  description?: string;
  modelParameters: {
    geometry?: any;
    physicalProperties?: any;
    operationalLimits?: any;
    performanceBaseline?: any;
  };
  dataSourceMappings: {
    sensorId: string;
    parameter: string;
    updateFrequency: number; // Hz
  }[];
  simulationConfig?: {
    enabled: boolean;
    scenarios: string[];
    accuracyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA_HIGH';
  };
}

export class SimulationScenarioDto {
  scenarioName: string;
  description: string;
  parameters: {
    parameter: string;
    value: any;
    variationRange?: { min: any; max: any };
  }[];
  duration: number; // minutes
  objectives: string[];
}

@ApiTags('Digital Twin')
@Controller('shop-floor/digital-twin')
@UseGuards(ShopFloorSecurityGuard)
@ApiBearerAuth()
export class DigitalTwinController {
  private readonly logger = new Logger(DigitalTwinController.name);

  constructor(
    private readonly digitalTwinService: DigitalTwinIntegrationService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all digital twins',
    description: 'Retrieve all digital twins with their current status and synchronization',
  })
  @ApiQuery({ name: 'assetType', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Digital twins retrieved',
    schema: {
      example: {
        digitalTwins: [
          {
            id: 'dt_001',
            name: 'Assembly Line A Digital Twin',
            physicalAssetId: 'line_a_001',
            assetType: 'PRODUCTION_LINE',
            status: 'SYNCHRONIZED',
            lastSync: '2024-03-01T14:30:00Z',
            accuracy: 0.96,
            dataPoints: 156,
            simulationStatus: 'RUNNING'
          }
        ],
        total: 8,
        synchronized: 7,
        outOfSync: 1,
        simulationsActive: 3
      }
    }
  })
  async getAllDigitalTwins(
    @Query('assetType') assetType?: string,
    @Query('status') status?: string,
  ) {
    try {
      const twins = await this.digitalTwinService.getDigitalTwins({
        assetType,
        status,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Digital twins retrieved successfully',
        data: twins,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve digital twins: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve digital twins',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Create digital twin',
    description: 'Create a new digital twin for a physical asset',
  })
  @ApiBody({ type: CreateDigitalTwinDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Digital twin created',
    schema: {
      example: {
        id: 'dt_001',
        physicalAssetId: 'machine_001',
        status: 'INITIALIZING',
        syncProgress: 0.15,
        estimatedSyncCompletion: '2024-03-01T15:00:00Z',
        calibrationRequired: true
      }
    }
  })
  async createDigitalTwin(@Body() createDto: CreateDigitalTwinDto) {
    try {
      this.logger.log(`Creating digital twin for asset: ${createDto.physicalAssetId}`);
      
      const twin = await this.digitalTwinService.createDigitalTwin(createDto);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Digital twin created successfully',
        data: twin,
      };
    } catch (error) {
      this.logger.error(`Failed to create digital twin: ${error.message}`);
      throw new HttpException(
        'Failed to create digital twin',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/state')
  @ApiOperation({
    summary: 'Get digital twin current state',
    description: 'Retrieve real-time state and data of a digital twin',
  })
  @ApiParam({ name: 'id', description: 'Digital Twin ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Digital twin state retrieved',
    schema: {
      example: {
        id: 'dt_001',
        physicalAssetId: 'machine_001',
        currentState: {
          operational: true,
          efficiency: 0.92,
          temperature: 68.5,
          vibration: 0.03,
          position: { x: 100, y: 200, z: 50 },
          workload: 0.78
        },
        predictedState: {
          nextHour: { efficiency: 0.94, temperature: 69.2 },
          maintenanceWindow: '2024-03-15T08:00:00Z',
          riskFactors: ['temperature_trending_up']
        },
        synchronization: {
          accuracy: 0.96,
          lastUpdate: '2024-03-01T14:30:00Z',
          dataLatency: 150 // ms
        }
      }
    }
  })
  async getDigitalTwinState(@Param('id') id: string) {
    try {
      const state = await this.digitalTwinService.getDigitalTwinState(id);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Digital twin state retrieved successfully',
        data: state,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve digital twin state: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve digital twin state',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/simulations')
  @ApiOperation({
    summary: 'Run simulation scenario',
    description: 'Execute a simulation scenario on the digital twin',
  })
  @ApiParam({ name: 'id', description: 'Digital Twin ID' })
  @ApiBody({ type: SimulationScenarioDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Simulation started',
    schema: {
      example: {
        simulationId: 'sim_001',
        digitalTwinId: 'dt_001',
        scenarioName: 'Peak Load Test',
        status: 'RUNNING',
        progress: 0.0,
        estimatedCompletion: '2024-03-01T15:30:00Z',
        realTimeResults: {
          currentStep: 1,
          totalSteps: 100,
          intermediateResults: []
        }
      }
    }
  })
  async runSimulation(
    @Param('id') twinId: string,
    @Body() scenarioDto: SimulationScenarioDto,
  ) {
    try {
      this.logger.log(`Starting simulation for digital twin: ${twinId}`);
      
      const simulation = await this.digitalTwinService.runSimulation(twinId, scenarioDto);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Simulation started successfully',
        data: simulation,
      };
    } catch (error) {
      this.logger.error(`Failed to start simulation: ${error.message}`);
      throw new HttpException(
        'Failed to start simulation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics/insights')
  @ApiOperation({
    summary: 'Get digital twin insights',
    description: 'Analyze digital twin performance and predictive insights',
  })
  @ApiQuery({ name: 'twinId', required: false })
  @ApiQuery({ name: 'assetType', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Digital twin insights retrieved',
    schema: {
      example: {
        overallAccuracy: 0.94,
        predictionReliability: 0.89,
        anomaliesDetected: 2,
        optimizationOpportunities: [
          {
            twinId: 'dt_001',
            opportunity: 'Reduce idle time by 12%',
            potentialSavings: '€2,500/month',
            implementation: 'Adjust scheduling algorithm'
          }
        ],
        trendAnalysis: {
          efficiency: 'improving',
          maintenance: 'on_schedule',
          performance: 'stable'
        }
      }
    }
  })
  async getDigitalTwinInsights(
    @Query('twinId') twinId?: string,
    @Query('assetType') assetType?: string,
  ) {
    try {
      const insights = await this.digitalTwinService.getInsights({
        twinId,
        assetType,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Digital twin insights retrieved successfully',
        data: insights,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve insights: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve insights',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
