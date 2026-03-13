import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
  IsUUID,
  IsDateString,
  ValidateNested,
  Min,
  Max,
  IsNotEmpty,
  IsJSON,
  IsUrl,
  IsIn
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Enums
export enum TwinType {
  PRODUCT = 'product',
  PROCESS = 'process',
  PERFORMANCE = 'performance',
  SYSTEM = 'system',
  ASSET = 'asset',
  FACILITY = 'facility',
  PRODUCTION_LINE = 'production_line',
  MACHINE = 'machine',
  ROBOT = 'robot',
  VEHICLE = 'vehicle',
  BUILDING = 'building',
  SUPPLY_CHAIN = 'supply_chain',
  HUMAN_WORKER = 'human_worker',
  COMPOSITE = 'composite',
  OTHER = 'other'
}

export enum TwinStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UPDATING = 'updating',
  SYNCING = 'syncing',
  ERROR = 'error',
  MAINTENANCE = 'maintenance',
  PAUSED = 'paused',
  ARCHIVED = 'archived'
}

export enum SimulationStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  QUEUED = 'queued'
}

export enum DataSourceType {
  SENSOR = 'sensor',
  IOT_DEVICE = 'iot_device',
  SCADA = 'scada',
  MES = 'mes',
  ERP = 'erp',
  HISTORIAN = 'historian',
  API = 'api',
  FILE = 'file',
  DATABASE = 'database',
  MANUAL = 'manual',
  ML_MODEL = 'ml_model',
  SIMULATION = 'simulation',
  OTHER = 'other'
}

export enum VisualizationType {
  TWO_D = '2d',
  THREE_D = '3d',
  AR = 'ar',
  VR = 'vr',
  MIXED_REALITY = 'mixed_reality',
  CHART = 'chart',
  DASHBOARD = 'dashboard',
  GRAPH = 'graph',
  HEATMAP = 'heatmap',
  NETWORK = 'network',
  TIMELINE = 'timeline'
}

export enum IntegrationType {
  REAL_TIME = 'real_time',
  BATCH = 'batch',
  EVENT_DRIVEN = 'event_driven',
  SCHEDULED = 'scheduled',
  ON_DEMAND = 'on_demand'
}

// Base DTOs
export class GeometryDto {
  @ApiProperty({ description: 'Geometry type', example: 'mesh' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Geometry data' })
  @IsObject()
  data: Record<string, any>;

  @ApiPropertyOptional({ description: 'Geometry dimensions' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions?: DimensionsDto;

  @ApiPropertyOptional({ description: 'Material properties' })
  @IsOptional()
  @IsObject()
  materials?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Texture information' })
  @IsOptional()
  @IsObject()
  textures?: Record<string, any>;
}

export class DimensionsDto {
  @ApiProperty({ description: 'Width in meters', example: 10.5 })
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  width: number;

  @ApiProperty({ description: 'Height in meters', example: 3.2 })
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  height: number;

  @ApiProperty({ description: 'Depth in meters', example: 8.7 })
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  depth: number;

  @ApiPropertyOptional({ description: 'Weight in kilograms', example: 1250.5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ description: 'Volume in cubic meters', example: 292.32 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  volume?: number;
}

export class PositionDto {
  @ApiProperty({ description: 'X coordinate', example: 100.5 })
  @IsNumber({ maxDecimalPlaces: 3 })
  x: number;

  @ApiProperty({ description: 'Y coordinate', example: 200.3 })
  @IsNumber({ maxDecimalPlaces: 3 })
  y: number;

  @ApiProperty({ description: 'Z coordinate', example: 50.7 })
  @IsNumber({ maxDecimalPlaces: 3 })
  z: number;

  @ApiPropertyOptional({ description: 'Roll rotation in degrees', example: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  roll?: number;

  @ApiPropertyOptional({ description: 'Pitch rotation in degrees', example: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  pitch?: number;

  @ApiPropertyOptional({ description: 'Yaw rotation in degrees', example: 90 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  yaw?: number;
}

export class DataSourceDto {
  @ApiProperty({ description: 'Data source ID' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Data source type', enum: DataSourceType })
  @IsEnum(DataSourceType)
  type: DataSourceType;

  @ApiProperty({ description: 'Data source name', example: 'Temperature Sensor 001' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Data source description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Connection endpoint or address' })
  @IsOptional()
  @IsString()
  endpoint?: string;

  @ApiPropertyOptional({ description: 'Data mapping configuration' })
  @IsOptional()
  @IsObject()
  mapping?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Update frequency in seconds', example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  updateFrequency?: number;

  @ApiPropertyOptional({ description: 'Data quality threshold (0-100)', example: 95 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityThreshold?: number;

  @ApiPropertyOptional({ description: 'Enable/disable data source' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class SimulationParametersDto {
  @ApiProperty({ description: 'Simulation duration in seconds', example: 3600 })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({ description: 'Time step size in seconds', example: 0.1 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.001)
  timeStep: number;

  @ApiPropertyOptional({ description: 'Simulation speed multiplier', example: 1.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(100)
  speedMultiplier?: number;

  @ApiPropertyOptional({ description: 'Enable real-time execution' })
  @IsOptional()
  @IsBoolean()
  realTime?: boolean;

  @ApiPropertyOptional({ description: 'Enable physics simulation' })
  @IsOptional()
  @IsBoolean()
  enablePhysics?: boolean;

  @ApiPropertyOptional({ description: 'Physics solver configuration' })
  @IsOptional()
  @IsObject()
  physicsSolver?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Initial conditions' })
  @IsOptional()
  @IsObject()
  initialConditions?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Boundary conditions' })
  @IsOptional()
  @IsObject()
  boundaryConditions?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Environment parameters' })
  @IsOptional()
  @IsObject()
  environment?: Record<string, any>;
}

export class VisualizationConfigDto {
  @ApiProperty({ description: 'Visualization type', enum: VisualizationType })
  @IsEnum(VisualizationType)
  type: VisualizationType;

  @ApiPropertyOptional({ description: 'View configuration' })
  @IsOptional()
  @IsObject()
  viewConfig?: {
    camera?: {
      position: PositionDto;
      target: PositionDto;
      fieldOfView?: number;
    };
    lighting?: {
      ambient?: number;
      directional?: any[];
      shadows?: boolean;
    };
    rendering?: {
      quality?: 'low' | 'medium' | 'high' | 'ultra';
      antiAliasing?: boolean;
      postProcessing?: boolean;
    };
  };

  @ApiPropertyOptional({ description: 'UI layout configuration' })
  @IsOptional()
  @IsObject()
  uiLayout?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Interactive controls configuration' })
  @IsOptional()
  @IsObject()
  controls?: {
    enableZoom?: boolean;
    enablePan?: boolean;
    enableRotate?: boolean;
    enableMeasurement?: boolean;
    enableAnnotation?: boolean;
  };

  @ApiPropertyOptional({ description: 'Color scheme configuration' })
  @IsOptional()
  @IsObject()
  colorScheme?: Record<string, any>;
}

// Main DTOs
export class CreateDigitalTwinDto {
  @ApiProperty({ description: 'Digital twin name', example: 'Production Line A - Digital Twin' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Digital twin description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Twin type', enum: TwinType })
  @IsEnum(TwinType)
  type: TwinType;

  @ApiPropertyOptional({ description: 'Physical asset ID that this twin represents' })
  @IsOptional()
  @IsUUID()
  physicalAssetId?: string;

  @ApiPropertyOptional({ description: 'Parent twin ID for hierarchical twins' })
  @IsOptional()
  @IsUUID()
  parentTwinId?: string;

  @ApiPropertyOptional({ description: 'Twin geometry definition', type: GeometryDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => GeometryDto)
  geometry?: GeometryDto;

  @ApiPropertyOptional({ description: 'Twin position in space', type: PositionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PositionDto)
  position?: PositionDto;

  @ApiProperty({ description: 'Data sources for the twin', type: [DataSourceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DataSourceDto)
  dataSources: DataSourceDto[];

  @ApiPropertyOptional({ description: 'Simulation parameters', type: SimulationParametersDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SimulationParametersDto)
  simulationParameters?: SimulationParametersDto;

  @ApiPropertyOptional({ description: 'Visualization configuration', type: VisualizationConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => VisualizationConfigDto)
  visualizationConfig?: VisualizationConfigDto;

  @ApiPropertyOptional({ description: 'AI/ML model configurations' })
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  aiModels?: Array<{
    id: string;
    name: string;
    type: string;
    endpoint?: string;
    parameters?: Record<string, any>;
  }>;

  @ApiPropertyOptional({ description: 'Business logic rules' })
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  businessRules?: Array<{
    id: string;
    name: string;
    condition: string;
    action: string;
    enabled: boolean;
  }>;

  @ApiPropertyOptional({ description: 'Integration configurations' })
  @IsOptional()
  @IsObject()
  integrations?: {
    type: IntegrationType;
    systems: string[];
    webhooks?: string[];
    apiEndpoints?: string[];
  };

  @ApiPropertyOptional({ description: 'Security and access configuration' })
  @IsOptional()
  @IsObject()
  security?: {
    accessLevel: 'public' | 'internal' | 'restricted' | 'confidential';
    requiredRoles: string[];
    encryptionEnabled: boolean;
    auditEnabled: boolean;
  };

  @ApiPropertyOptional({ description: 'Metadata and tags' })
  @IsOptional()
  @IsObject()
  metadata?: {
    tags?: Record<string, string>;
    category?: string;
    owner?: string;
    department?: string;
    project?: string;
    version?: string;
    customFields?: Record<string, any>;
  };

  @ApiPropertyOptional({ description: 'Data retention configuration' })
  @IsOptional()
  @IsObject()
  dataRetention?: {
    historicalDataDays: number;
    simulationResultsDays: number;
    logDataDays: number;
    compressionEnabled: boolean;
    archiveEnabled: boolean;
  };

  @ApiPropertyOptional({ description: 'Performance optimization settings' })
  @IsOptional()
  @IsObject()
  optimization?: {
    levelOfDetail: 'low' | 'medium' | 'high' | 'adaptive';
    updateStrategy: 'continuous' | 'on_change' | 'scheduled';
    cachingEnabled: boolean;
    compressionEnabled: boolean;
  };

  @ApiPropertyOptional({ description: 'Enable/disable the twin' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class UpdateDigitalTwinDto extends PartialType(CreateDigitalTwinDto) {}

export class TwinStatusUpdateDto {
  @ApiProperty({ description: 'New twin status', enum: TwinStatus })
  @IsEnum(TwinStatus)
  status: TwinStatus;

  @ApiPropertyOptional({ description: 'Status change reason' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Additional status information' })
  @IsOptional()
  @IsObject()
  statusInfo?: Record<string, any>;
}

export class SimulationRequestDto {
  @ApiProperty({ description: 'Simulation name', example: 'Stress Test Simulation' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Simulation description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Simulation parameters', type: SimulationParametersDto })
  @ValidateNested()
  @Type(() => SimulationParametersDto)
  parameters: SimulationParametersDto;

  @ApiPropertyOptional({ description: 'Input variables for the simulation' })
  @IsOptional()
  @IsObject()
  inputs?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Scenario configuration' })
  @IsOptional()
  @IsObject()
  scenario?: {
    name: string;
    description?: string;
    variables: Record<string, any>;
    events?: Array<{
      time: number;
      type: string;
      parameters: Record<string, any>;
    }>;
  };

  @ApiPropertyOptional({ description: 'Output requirements' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  outputRequirements?: string[];

  @ApiPropertyOptional({ description: 'Simulation priority', example: 'high' })
  @IsOptional()
  @IsIn(['low', 'normal', 'high', 'critical'])
  priority?: string;

  @ApiPropertyOptional({ description: 'Schedule simulation for later execution' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: Date;
}

export class TwinDataUpdateDto {
  @ApiProperty({ description: 'Data source ID' })
  @IsUUID()
  sourceId: string;

  @ApiProperty({ description: 'Data points' })
  @IsArray()
  @IsObject({ each: true })
  dataPoints: Array<{
    name: string;
    value: any;
    unit?: string;
    timestamp: Date;
    quality?: number;
    metadata?: Record<string, any>;
  }>;

  @ApiPropertyOptional({ description: 'Update timestamp' })
  @IsOptional()
  @IsDateString()
  timestamp?: Date;

  @ApiPropertyOptional({ description: 'Data quality score (0-100)', example: 95 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  quality?: number;
}

export class TwinVisualizationUpdateDto {
  @ApiProperty({ description: 'Visualization configuration', type: VisualizationConfigDto })
  @ValidateNested()
  @Type(() => VisualizationConfigDto)
  config: VisualizationConfigDto;

  @ApiPropertyOptional({ description: 'Custom visualization data' })
  @IsOptional()
  @IsObject()
  customData?: Record<string, any>;
}

export class TwinQueryDto {
  @ApiPropertyOptional({ description: 'Filter by twin type', enum: TwinType })
  @IsOptional()
  @IsEnum(TwinType)
  type?: TwinType;

  @ApiPropertyOptional({ description: 'Filter by twin status', enum: TwinStatus })
  @IsOptional()
  @IsEnum(TwinStatus)
  status?: TwinStatus;

  @ApiPropertyOptional({ description: 'Filter by physical asset ID' })
  @IsOptional()
  @IsUUID()
  physicalAssetId?: string;

  @ApiPropertyOptional({ description: 'Filter by parent twin ID' })
  @IsOptional()
  @IsUUID()
  parentTwinId?: string;

  @ApiPropertyOptional({ description: 'Search term for name or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by owner' })
  @IsOptional()
  @IsString()
  owner?: string;

  @ApiPropertyOptional({ description: 'Filter by department' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: 'Filter by project' })
  @IsOptional()
  @IsString()
  project?: string;

  @ApiPropertyOptional({ description: 'Filter by enabled status' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Filter by tag key' })
  @IsOptional()
  @IsString()
  tagKey?: string;

  @ApiPropertyOptional({ description: 'Filter by tag value' })
  @IsOptional()
  @IsString()
  tagValue?: string;

  @ApiPropertyOptional({ description: 'Include child twins in results' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeChildren?: boolean;

  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', example: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort direction', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

export class SimulationQueryDto {
  @ApiProperty({ description: 'Digital twin ID' })
  @IsUUID()
  twinId: string;

  @ApiPropertyOptional({ description: 'Filter by simulation status', enum: SimulationStatus })
  @IsOptional()
  @IsEnum(SimulationStatus)
  status?: SimulationStatus;

  @ApiPropertyOptional({ description: 'Start date for simulation results' })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'End date for simulation results' })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Search term for simulation name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', example: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

// Response DTOs
export class DigitalTwinResponseDto {
  @ApiProperty({ description: 'Digital twin ID' })
  id: string;

  @ApiProperty({ description: 'Digital twin name' })
  name: string;

  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @ApiProperty({ description: 'Twin type', enum: TwinType })
  type: TwinType;

  @ApiProperty({ description: 'Current status', enum: TwinStatus })
  status: TwinStatus;

  @ApiPropertyOptional({ description: 'Physical asset ID' })
  physicalAssetId?: string;

  @ApiPropertyOptional({ description: 'Parent twin ID' })
  parentTwinId?: string;

  @ApiProperty({ description: 'Number of data sources' })
  dataSourceCount: number;

  @ApiProperty({ description: 'Last update timestamp' })
  lastUpdate: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last modification timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Metadata' })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Twin enabled status' })
  enabled: boolean;
}

export class DigitalTwinListResponseDto {
  @ApiProperty({ description: 'List of digital twins', type: [DigitalTwinResponseDto] })
  twins: DigitalTwinResponseDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total pages' })
  totalPages: number;
}

export class SimulationResponseDto {
  @ApiProperty({ description: 'Simulation ID' })
  id: string;

  @ApiProperty({ description: 'Simulation name' })
  name: string;

  @ApiProperty({ description: 'Digital twin ID' })
  twinId: string;

  @ApiProperty({ description: 'Simulation status', enum: SimulationStatus })
  status: SimulationStatus;

  @ApiProperty({ description: 'Progress percentage (0-100)' })
  progress: number;

  @ApiProperty({ description: 'Simulation start time' })
  startTime: Date;

  @ApiPropertyOptional({ description: 'Simulation end time' })
  endTime?: Date;

  @ApiProperty({ description: 'Simulation results' })
  results?: Record<string, any>;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
}

export class TwinStatisticsResponseDto {
  @ApiProperty({ description: 'Total twins count' })
  totalTwins: number;

  @ApiProperty({ description: 'Active twins count' })
  activeTwins: number;

  @ApiProperty({ description: 'Inactive twins count' })
  inactiveTwins: number;

  @ApiProperty({ description: 'Twins with errors count' })
  errorTwins: number;

  @ApiProperty({ description: 'Total simulations run today' })
  simulationsToday: number;

  @ApiProperty({ description: 'Active simulations count' })
  activeSimulations: number;

  @ApiProperty({ description: 'Twin type distribution' })
  typeDistribution: Record<string, number>;

  @ApiProperty({ description: 'Status distribution' })
  statusDistribution: Record<string, number>;

  @ApiProperty({ description: 'Data quality metrics' })
  dataQuality: {
    averageQuality: number;
    qualityDistribution: Record<string, number>;
  };

  @ApiProperty({ description: 'Performance metrics' })
  performance: {
    averageUpdateLatency: number;
    averageSimulationTime: number;
    systemLoad: number;
  };
}
