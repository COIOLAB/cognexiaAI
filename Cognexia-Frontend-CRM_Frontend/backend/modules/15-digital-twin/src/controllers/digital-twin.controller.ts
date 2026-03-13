import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ValidationPipe,
  UsePipes,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { 
  DigitalTwinService, 
  CreateDigitalTwinDto, 
  UpdateDigitalTwinDto, 
  CreateSimulationDto,
  TwinSearchFilters,
  SimulationFilters,
  TwinAnalytics,
  SimulationAnalytics 
} from '../services/digital-twin.service';
import { 
  DigitalTwin, 
  TwinType, 
  TwinStatus, 
  SynchronizationMode, 
  IndustryType 
} from '../entities/digital-twin.entity';
import { 
  DigitalTwinSimulation, 
  SimulationType, 
  SimulationStatus, 
  SimulationPriority,
  ComputeType
} from '../entities/digital-twin-simulation.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { IsOptional, IsEnum, IsString, IsNumber, IsBoolean, IsArray, IsObject, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

// DTOs for request validation
export class CreateTwinRequestDto {
  @IsString()
  twinId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TwinType)
  twinType: TwinType;

  @IsEnum(IndustryType)
  industryType: IndustryType;

  @IsString()
  physicalAssetId: string;

  @IsObject()
  physicalLocation: any;

  @IsObject()
  configuration: any;

  @IsObject()
  physicalSpecs: any;

  @IsObject()
  currentData: any;

  @IsObject()
  historicalSummary: any;

  @IsObject()
  integrations: any;

  @IsObject()
  compliance: any;

  @IsObject()
  performance: any;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTwinRequestDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TwinStatus)
  status?: TwinStatus;

  @IsOptional()
  @IsObject()
  configuration?: any;

  @IsOptional()
  @IsObject()
  currentData?: any;

  @IsOptional()
  @IsObject()
  historicalSummary?: any;

  @IsOptional()
  @IsObject()
  aiInsights?: any;

  @IsOptional()
  @IsObject()
  simulationConfig?: any;

  @IsOptional()
  @IsObject()
  integrations?: any;

  @IsOptional()
  @IsObject()
  performance?: any;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateSimulationRequestDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(SimulationType)
  simulationType: SimulationType;

  @IsOptional()
  @IsEnum(SimulationPriority)
  priority?: SimulationPriority;

  @IsOptional()
  @IsEnum(ComputeType)
  computeType?: ComputeType;

  @IsString()
  twinId: string;

  @IsObject()
  configuration: any;

  @IsObject()
  scenario: any;

  @IsObject()
  modelInfo: any;

  @IsOptional()
  @IsObject()
  quantumInfo?: any;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class TwinSearchQueryDto {
  @IsOptional()
  @IsEnum(TwinType)
  twinType?: TwinType;

  @IsOptional()
  @IsEnum(TwinStatus)
  status?: TwinStatus;

  @IsOptional()
  @IsEnum(IndustryType)
  industryType?: IndustryType;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.split(',').map((tag: string) => tag.trim()))
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  healthyOnly?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  requiresAttention?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasQuantumCapabilities?: boolean;

  @IsOptional()
  @IsEnum(SynchronizationMode)
  syncMode?: SynchronizationMode;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export class SimulationSearchQueryDto {
  @IsOptional()
  @IsEnum(SimulationType)
  simulationType?: SimulationType;

  @IsOptional()
  @IsEnum(SimulationStatus)
  status?: SimulationStatus;

  @IsOptional()
  @IsEnum(SimulationPriority)
  priority?: SimulationPriority;

  @IsOptional()
  @IsEnum(ComputeType)
  computeType?: ComputeType;

  @IsOptional()
  @IsString()
  twinId?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  completedOnly?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  requiresAttention?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export class UpdateTwinDataDto {
  @IsObject()
  data: any;
}

@ApiTags('Digital Twin & Simulation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('digital-twin')
export class DigitalTwinController {
  constructor(private readonly digitalTwinService: DigitalTwinService) {}

  // Digital Twin Management Endpoints
  
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new digital twin' })
  @ApiCreatedResponse({ description: 'Digital twin created successfully', type: DigitalTwin })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createDigitalTwin(
    @Body() createDto: CreateTwinRequestDto,
    @GetUser() user: any,
  ): Promise<DigitalTwin> {
    const dto: CreateDigitalTwinDto = {
      ...createDto,
      createdBy: user.id,
    };
    return this.digitalTwinService.createDigitalTwin(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Search digital twins with advanced filters' })
  @ApiOkResponse({ description: 'Digital twins retrieved successfully' })
  @ApiQuery({ name: 'twinType', required: false, enum: TwinType })
  @ApiQuery({ name: 'status', required: false, enum: TwinStatus })
  @ApiQuery({ name: 'industryType', required: false, enum: IndustryType })
  @ApiQuery({ name: 'tags', required: false, description: 'Comma-separated tags' })
  @ApiQuery({ name: 'healthyOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'requiresAttention', required: false, type: Boolean })
  @ApiQuery({ name: 'hasQuantumCapabilities', required: false, type: Boolean })
  @ApiQuery({ name: 'syncMode', required: false, enum: SynchronizationMode })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchDigitalTwins(@Query() query: TwinSearchQueryDto) {
    const filters: TwinSearchFilters = {
      twinType: query.twinType,
      status: query.status,
      industryType: query.industryType,
      tags: query.tags,
      healthyOnly: query.healthyOnly,
      requiresAttention: query.requiresAttention,
      hasQuantumCapabilities: query.hasQuantumCapabilities,
      syncMode: query.syncMode,
    };

    if (query.startDate && query.endDate) {
      filters.createdDateRange = {
        start: new Date(query.startDate),
        end: new Date(query.endDate),
      };
    }

    return this.digitalTwinService.searchDigitalTwins(filters, query.limit, query.offset);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get digital twin by ID' })
  @ApiParam({ name: 'id', description: 'Digital Twin UUID' })
  @ApiQuery({ name: 'includeSimulations', required: false, type: Boolean })
  @ApiOkResponse({ description: 'Digital twin retrieved successfully', type: DigitalTwin })
  @ApiNotFoundResponse({ description: 'Digital twin not found' })
  async getDigitalTwinById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeSimulations') includeSimulations?: boolean,
  ): Promise<DigitalTwin> {
    return this.digitalTwinService.findDigitalTwinById(id, includeSimulations);
  }

  @Get('twin-id/:twinId')
  @ApiOperation({ summary: 'Get digital twin by twin ID' })
  @ApiParam({ name: 'twinId', description: 'Digital Twin identifier' })
  @ApiQuery({ name: 'includeSimulations', required: false, type: Boolean })
  @ApiOkResponse({ description: 'Digital twin retrieved successfully', type: DigitalTwin })
  @ApiNotFoundResponse({ description: 'Digital twin not found' })
  async getDigitalTwinByTwinId(
    @Param('twinId') twinId: string,
    @Query('includeSimulations') includeSimulations?: boolean,
  ): Promise<DigitalTwin> {
    return this.digitalTwinService.findDigitalTwinByTwinId(twinId, includeSimulations);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update digital twin' })
  @ApiParam({ name: 'id', description: 'Digital Twin UUID' })
  @ApiOkResponse({ description: 'Digital twin updated successfully', type: DigitalTwin })
  @ApiNotFoundResponse({ description: 'Digital twin not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateDigitalTwin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTwinRequestDto,
    @GetUser() user: any,
  ): Promise<DigitalTwin> {
    const dto: UpdateDigitalTwinDto = {
      ...updateDto,
      updatedBy: user.id,
    };
    return this.digitalTwinService.updateDigitalTwin(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete digital twin' })
  @ApiParam({ name: 'id', description: 'Digital Twin UUID' })
  @ApiOkResponse({ description: 'Digital twin deleted successfully' })
  @ApiNotFoundResponse({ description: 'Digital twin not found' })
  async deleteDigitalTwin(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.digitalTwinService.deleteDigitalTwin(id);
  }

  // Real-time Data Management Endpoints

  @Put(':twinId/data')
  @ApiOperation({ summary: 'Update real-time data for digital twin' })
  @ApiParam({ name: 'twinId', description: 'Digital Twin identifier' })
  @ApiOkResponse({ description: 'Twin data updated successfully', type: DigitalTwin })
  @ApiNotFoundResponse({ description: 'Digital twin not found' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateTwinData(
    @Param('twinId') twinId: string,
    @Body() updateDataDto: UpdateTwinDataDto,
    @GetUser() user: any,
  ): Promise<DigitalTwin> {
    return this.digitalTwinService.updateTwinData(twinId, updateDataDto.data, user.id);
  }

  @Post(':twinId/sync')
  @ApiOperation({ summary: 'Synchronize digital twin with external systems' })
  @ApiParam({ name: 'twinId', description: 'Digital Twin identifier' })
  @ApiOkResponse({ description: 'Twin synchronized successfully', type: DigitalTwin })
  @ApiNotFoundResponse({ description: 'Digital twin not found' })
  @ApiBadRequestResponse({ description: 'Twin is already synchronizing' })
  async synchronizeTwin(@Param('twinId') twinId: string): Promise<DigitalTwin> {
    return this.digitalTwinService.synchronizeTwinData(twinId);
  }

  // AI & Analytics Endpoints

  @Get(':twinId/anomalies')
  @ApiOperation({ summary: 'Get anomaly detection results for digital twin' })
  @ApiParam({ name: 'twinId', description: 'Digital Twin identifier' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of anomalies to return' })
  @ApiOkResponse({ description: 'Anomalies retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Digital twin not found' })
  async getAnomalies(
    @Param('twinId') twinId: string,
    @Query('limit') limit?: number,
  ): Promise<any[]> {
    return this.digitalTwinService.getAnomalyDetection(twinId, limit);
  }

  @Get(':twinId/recommendations')
  @ApiOperation({ summary: 'Get AI-powered optimization recommendations' })
  @ApiParam({ name: 'twinId', description: 'Digital Twin identifier' })
  @ApiOkResponse({ description: 'Recommendations retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Digital twin not found' })
  async getOptimizationRecommendations(@Param('twinId') twinId: string): Promise<any[]> {
    return this.digitalTwinService.getOptimizationRecommendations(twinId);
  }

  // Simulation Management Endpoints

  @Post('simulations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new simulation' })
  @ApiCreatedResponse({ description: 'Simulation created successfully', type: DigitalTwinSimulation })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createSimulation(
    @Body() createDto: CreateSimulationRequestDto,
    @GetUser() user: any,
  ): Promise<DigitalTwinSimulation> {
    const dto: CreateSimulationDto = {
      ...createDto,
      createdBy: user.id,
    };
    return this.digitalTwinService.createSimulation(dto);
  }

  @Get('simulations')
  @ApiOperation({ summary: 'Search simulations with filters' })
  @ApiOkResponse({ description: 'Simulations retrieved successfully' })
  @ApiQuery({ name: 'simulationType', required: false, enum: SimulationType })
  @ApiQuery({ name: 'status', required: false, enum: SimulationStatus })
  @ApiQuery({ name: 'priority', required: false, enum: SimulationPriority })
  @ApiQuery({ name: 'computeType', required: false, enum: ComputeType })
  @ApiQuery({ name: 'twinId', required: false, type: String })
  @ApiQuery({ name: 'completedOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'requiresAttention', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchSimulations(@Query() query: SimulationSearchQueryDto) {
    const filters: SimulationFilters = {
      simulationType: query.simulationType,
      status: query.status,
      priority: query.priority,
      computeType: query.computeType,
      twinId: query.twinId,
      completedOnly: query.completedOnly,
      requiresAttention: query.requiresAttention,
    };

    return this.digitalTwinService.searchSimulations(filters, query.limit, query.offset);
  }

  @Post('simulations/:id/run')
  @ApiOperation({ summary: 'Run a simulation' })
  @ApiParam({ name: 'id', description: 'Simulation UUID' })
  @ApiOkResponse({ description: 'Simulation started successfully', type: DigitalTwinSimulation })
  @ApiNotFoundResponse({ description: 'Simulation not found' })
  @ApiBadRequestResponse({ description: 'Simulation is already running' })
  async runSimulation(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: any,
  ): Promise<DigitalTwinSimulation> {
    return this.digitalTwinService.runSimulation(id, user.id);
  }

  @Get('simulations/:id/results')
  @ApiOperation({ summary: 'Get simulation results' })
  @ApiParam({ name: 'id', description: 'Simulation UUID' })
  @ApiOkResponse({ description: 'Simulation results retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Simulation not found' })
  @ApiBadRequestResponse({ description: 'Simulation has not completed yet' })
  async getSimulationResults(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    return this.digitalTwinService.getSimulationResults(id);
  }

  // Analytics and Dashboard Endpoints

  @Get('analytics/twins')
  @ApiOperation({ summary: 'Get digital twin analytics and metrics' })
  @ApiOkResponse({ description: 'Twin analytics retrieved successfully' })
  async getTwinAnalytics(): Promise<TwinAnalytics> {
    return this.digitalTwinService.getTwinAnalytics();
  }

  @Get('analytics/simulations')
  @ApiOperation({ summary: 'Get simulation analytics and metrics' })
  @ApiOkResponse({ description: 'Simulation analytics retrieved successfully' })
  async getSimulationAnalytics(): Promise<SimulationAnalytics> {
    return this.digitalTwinService.getSimulationAnalytics();
  }

  // Industry-Specific Endpoints

  @Get('industry/:industryType')
  @ApiOperation({ summary: 'Get digital twins by industry type' })
  @ApiParam({ name: 'industryType', enum: IndustryType, description: 'Industry type' })
  @ApiOkResponse({ description: 'Industry-specific twins retrieved successfully' })
  async getTwinsByIndustry(@Param('industryType') industryType: IndustryType) {
    const filters: TwinSearchFilters = { industryType };
    return this.digitalTwinService.searchDigitalTwins(filters);
  }

  @Get('quantum/enabled')
  @ApiOperation({ summary: 'Get quantum-enabled digital twins' })
  @ApiOkResponse({ description: 'Quantum-enabled twins retrieved successfully' })
  async getQuantumEnabledTwins() {
    const filters: TwinSearchFilters = { hasQuantumCapabilities: true };
    return this.digitalTwinService.searchDigitalTwins(filters);
  }

  @Get('health/status')
  @ApiOperation({ summary: 'Get overall health status of all digital twins' })
  @ApiOkResponse({ description: 'Health status retrieved successfully' })
  async getHealthStatus() {
    return this.digitalTwinService.getTwinAnalytics();
  }

  @Get('attention/required')
  @ApiOperation({ summary: 'Get digital twins that require attention' })
  @ApiOkResponse({ description: 'Twins requiring attention retrieved successfully' })
  async getTwinsRequiringAttention() {
    const filters: TwinSearchFilters = { requiresAttention: true };
    return this.digitalTwinService.searchDigitalTwins(filters);
  }

  // Real-time Monitoring Endpoints

  @Get('realtime/active')
  @ApiOperation({ summary: 'Get real-time synchronized digital twins' })
  @ApiOkResponse({ description: 'Real-time twins retrieved successfully' })
  async getRealTimeTwins() {
    const filters: TwinSearchFilters = { 
      syncMode: SynchronizationMode.REAL_TIME,
      status: TwinStatus.ACTIVE 
    };
    return this.digitalTwinService.searchDigitalTwins(filters);
  }

  @Get('realtime/:twinId/stream')
  @ApiOperation({ summary: 'Get real-time data stream for a digital twin' })
  @ApiParam({ name: 'twinId', description: 'Digital Twin identifier' })
  @ApiOkResponse({ description: 'Real-time data stream retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Digital twin not found' })
  async getRealTimeDataStream(@Param('twinId') twinId: string): Promise<any> {
    const digitalTwin = await this.digitalTwinService.findDigitalTwinByTwinId(twinId);
    
    return {
      twinId: digitalTwin.twinId,
      timestamp: digitalTwin.currentData.timestamp,
      isRealTime: digitalTwin.isRealTimeSync(),
      currentData: digitalTwin.currentData,
      performance: digitalTwin.performance,
      healthScore: digitalTwin.getHealthScore(),
      efficiency: digitalTwin.getOverallEffectiveness(),
      requiresAttention: digitalTwin.requiresAttention(),
    };
  }

  // Advanced Features

  @Post(':twinId/maintenance/predict')
  @ApiOperation({ summary: 'Trigger predictive maintenance analysis' })
  @ApiParam({ name: 'twinId', description: 'Digital Twin identifier' })
  @ApiOkResponse({ description: 'Predictive maintenance analysis started' })
  @ApiNotFoundResponse({ description: 'Digital twin not found' })
  async triggerPredictiveMaintenance(
    @Param('twinId') twinId: string,
    @GetUser() user: any,
  ): Promise<DigitalTwinSimulation> {
    const digitalTwin = await this.digitalTwinService.findDigitalTwinByTwinId(twinId);

    const simulationDto: CreateSimulationDto = {
      name: `Predictive Maintenance - ${digitalTwin.name}`,
      description: 'AI-powered predictive maintenance analysis',
      simulationType: SimulationType.PREDICTIVE_MAINTENANCE,
      priority: SimulationPriority.HIGH,
      computeType: ComputeType.CLASSICAL,
      twinId: digitalTwin.id,
      configuration: {
        timeHorizon: 168, // 1 week
        timeStep: 3600, // 1 hour
        accuracy: 'high',
        modelComplexity: 'complex',
        enableUncertainty: true,
        parallelization: true,
        realTimeData: true,
        variables: [
          { name: 'vibration', type: 'input' },
          { name: 'temperature', type: 'input' },
          { name: 'failure_probability', type: 'output' },
        ],
        objectives: [
          { name: 'minimize_failure_risk', type: 'minimize', weight: 1.0 },
        ],
        constraints: [],
      },
      scenario: {
        name: 'Predictive Maintenance Scenario',
        baseline: digitalTwin.currentData,
        variations: [],
        externalFactors: [],
        businessRules: [],
        kpis: [
          {
            name: 'failure_risk',
            formula: 'failure_probability * impact_severity',
            target: 0.1,
            threshold: { warning: 0.3, critical: 0.5 },
          },
        ],
      },
      modelInfo: {
        type: 'machine_learning',
        version: '1.0',
        framework: 'tensorflow',
        algorithms: ['random_forest', 'neural_network'],
        complexity: 8,
        validationStatus: 'validated',
        limitations: ['Requires historical failure data'],
        assumptions: ['Equipment degradation follows predictable patterns'],
        dataRequirements: [
          { dataset: 'sensor_data', required: true, frequency: 'hourly', quality: 'high' },
          { dataset: 'maintenance_history', required: true, frequency: 'daily', quality: 'medium' },
        ],
        performance: {
          computationTime: 300,
          memoryUsage: 2048,
          scalability: 'high',
          reliability: 0.95,
        },
      },
      tags: ['predictive-maintenance', 'ai-analysis', 'critical'],
      createdBy: user.id,
    };

    const simulation = await this.digitalTwinService.createSimulation(simulationDto);
    return this.digitalTwinService.runSimulation(simulation.id, user.id);
  }

  @Post(':twinId/optimize')
  @ApiOperation({ summary: 'Trigger process optimization simulation' })
  @ApiParam({ name: 'twinId', description: 'Digital Twin identifier' })
  @ApiOkResponse({ description: 'Process optimization simulation started' })
  @ApiNotFoundResponse({ description: 'Digital twin not found' })
  async triggerProcessOptimization(
    @Param('twinId') twinId: string,
    @GetUser() user: any,
  ): Promise<DigitalTwinSimulation> {
    const digitalTwin = await this.digitalTwinService.findDigitalTwinByTwinId(twinId);

    const simulationDto: CreateSimulationDto = {
      name: `Process Optimization - ${digitalTwin.name}`,
      description: 'AI-powered process parameter optimization',
      simulationType: SimulationType.PROCESS_OPTIMIZATION,
      priority: SimulationPriority.MEDIUM,
      computeType: digitalTwin.hasQuantumCapabilities() ? ComputeType.QUANTUM : ComputeType.CLASSICAL,
      twinId: digitalTwin.id,
      configuration: {
        timeHorizon: 24, // 1 day
        timeStep: 900, // 15 minutes
        accuracy: 'high',
        modelComplexity: 'complex',
        enableUncertainty: true,
        parallelization: true,
        realTimeData: true,
        variables: [
          { name: 'temperature', type: 'input', range: { min: 20, max: 100 } },
          { name: 'pressure', type: 'input', range: { min: 50, max: 200 } },
          { name: 'efficiency', type: 'output' },
          { name: 'quality', type: 'output' },
        ],
        objectives: [
          { name: 'maximize_efficiency', type: 'maximize', weight: 0.6 },
          { name: 'maximize_quality', type: 'maximize', weight: 0.4 },
        ],
        constraints: [
          { name: 'temperature_limit', expression: 'temperature <= 90', type: 'inequality' },
          { name: 'pressure_limit', expression: 'pressure <= 180', type: 'inequality' },
        ],
      },
      scenario: {
        name: 'Process Optimization Scenario',
        baseline: digitalTwin.currentData,
        variations: [
          {
            name: 'high_efficiency',
            description: 'Parameters optimized for maximum efficiency',
            parameters: { temperature: 75, pressure: 120 },
          },
          {
            name: 'high_quality',
            description: 'Parameters optimized for maximum quality',
            parameters: { temperature: 65, pressure: 100 },
          },
        ],
        externalFactors: [
          { factor: 'ambient_temperature', impact: 'medium', variability: 0.1 },
        ],
        businessRules: [
          { rule: 'quality_threshold', condition: 'quality >= 90', action: 'continue', priority: 1 },
        ],
        kpis: [
          {
            name: 'overall_performance',
            formula: '0.6 * efficiency + 0.4 * quality',
            target: 85,
            threshold: { warning: 75, critical: 65 },
          },
        ],
      },
      modelInfo: {
        type: 'optimization',
        version: '2.1',
        framework: 'scipy',
        algorithms: ['genetic_algorithm', 'particle_swarm'],
        complexity: 7,
        validationStatus: 'validated',
        limitations: ['Local optima possible'],
        assumptions: ['Process parameters are independent'],
        dataRequirements: [
          { dataset: 'process_data', required: true, frequency: 'realtime', quality: 'high' },
        ],
        performance: {
          computationTime: 600,
          memoryUsage: 1024,
          scalability: 'medium',
          reliability: 0.92,
        },
      },
      tags: ['optimization', 'performance', 'efficiency'],
      createdBy: user.id,
    };

    if (digitalTwin.hasQuantumCapabilities()) {
      simulationDto.quantumInfo = {
        processor: 'IBM_Q_System',
        qubits: 127,
        gateCount: 10000,
        circuitDepth: 100,
        errorRate: 0.001,
        coherenceTime: 100,
        algorithms: ['QAOA', 'VQE'],
      };
    }

    const simulation = await this.digitalTwinService.createSimulation(simulationDto);
    return this.digitalTwinService.runSimulation(simulation.id, user.id);
  }

  @Get(':twinId/compliance/status')
  @ApiOperation({ summary: 'Get compliance status for digital twin' })
  @ApiParam({ name: 'twinId', description: 'Digital Twin identifier' })
  @ApiOkResponse({ description: 'Compliance status retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Digital twin not found' })
  async getComplianceStatus(@Param('twinId') twinId: string): Promise<any> {
    const digitalTwin = await this.digitalTwinService.findDigitalTwinByTwinId(twinId);
    return digitalTwin.getComplianceStatus();
  }

  @Get(':twinId/energy/efficiency')
  @ApiOperation({ summary: 'Get energy efficiency metrics for digital twin' })
  @ApiParam({ name: 'twinId', description: 'Digital Twin identifier' })
  @ApiOkResponse({ description: 'Energy efficiency metrics retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Digital twin not found' })
  async getEnergyEfficiency(@Param('twinId') twinId: string): Promise<any> {
    const digitalTwin = await this.digitalTwinService.findDigitalTwinByTwinId(twinId);
    
    return {
      twinId: digitalTwin.twinId,
      energyEfficiency: digitalTwin.getEnergyEfficiency(),
      currentEnergyUsage: digitalTwin.currentData.operationalData.energy,
      industrySpecificMetrics: digitalTwin.getIndustrySpecificMetrics(),
      optimizationEnabled: digitalTwin.configuration.energyOptimization,
      recommendations: digitalTwin.getOptimizationOpportunities().filter(
        opt => opt.area === 'energy' || opt.type === 'energy_optimization'
      ),
    };
  }

  @Get(':twinId/industry-metrics')
  @ApiOperation({ summary: 'Get industry-specific metrics for digital twin' })
  @ApiParam({ name: 'twinId', description: 'Digital Twin identifier' })
  @ApiOkResponse({ description: 'Industry-specific metrics retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Digital twin not found' })
  async getIndustrySpecificMetrics(@Param('twinId') twinId: string): Promise<any> {
    const digitalTwin = await this.digitalTwinService.findDigitalTwinByTwinId(twinId);
    
    return {
      twinId: digitalTwin.twinId,
      industryType: digitalTwin.industryType,
      metrics: digitalTwin.getIndustrySpecificMetrics(),
      benchmarks: this.getIndustryBenchmarks(digitalTwin.industryType),
      performanceGrade: this.calculatePerformanceGrade(digitalTwin),
    };
  }

  // Helper methods
  private getIndustryBenchmarks(industryType: IndustryType): any {
    const benchmarks = {
      [IndustryType.AUTOMOTIVE]: {
        cycleTime: 60, // seconds
        defectPPM: 100,
        oee: 85,
      },
      [IndustryType.PHARMACEUTICALS]: {
        batchYield: 95,
        contaminationLevel: 0.001,
        complianceScore: 99,
      },
      [IndustryType.CHEMICALS]: {
        reactionEfficiency: 90,
        safetyScore: 98,
        environmentalImpact: 'low',
      },
    };

    return benchmarks[industryType] || {};
  }

  private calculatePerformanceGrade(digitalTwin: DigitalTwin): string {
    const overall = digitalTwin.getOverallEffectiveness();
    
    if (overall >= 90) return 'A+';
    if (overall >= 85) return 'A';
    if (overall >= 80) return 'B+';
    if (overall >= 75) return 'B';
    if (overall >= 70) return 'C+';
    if (overall >= 65) return 'C';
    if (overall >= 60) return 'D';
    return 'F';
  }
}
