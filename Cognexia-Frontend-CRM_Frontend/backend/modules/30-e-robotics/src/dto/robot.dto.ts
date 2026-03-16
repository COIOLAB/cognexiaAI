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
  IsIP,
  IsPort,
  IsDateString,
  ValidateNested,
  Min,
  Max,
  IsNotEmpty,
  ArrayMinSize,
  ArrayMaxSize,
  IsDecimal
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { RobotType, RobotManufacturer, RobotStatus, RobotCapability } from '../entities/robot.entity';

// Position and Joint DTOs
export class PositionDto {
  @ApiProperty({ description: 'X coordinate in millimeters', example: 100.5 })
  @IsNumber({ maxDecimalPlaces: 3 })
  x: number;

  @ApiProperty({ description: 'Y coordinate in millimeters', example: 200.3 })
  @IsNumber({ maxDecimalPlaces: 3 })
  y: number;

  @ApiProperty({ description: 'Z coordinate in millimeters', example: 300.7 })
  @IsNumber({ maxDecimalPlaces: 3 })
  z: number;

  @ApiProperty({ description: 'Rotation around X axis in degrees', example: 0.0 })
  @IsNumber({ maxDecimalPlaces: 3 })
  rx: number;

  @ApiProperty({ description: 'Rotation around Y axis in degrees', example: 0.0 })
  @IsNumber({ maxDecimalPlaces: 3 })
  ry: number;

  @ApiProperty({ description: 'Rotation around Z axis in degrees', example: 90.0 })
  @IsNumber({ maxDecimalPlaces: 3 })
  rz: number;
}

export class WorkspaceLimitDto {
  @ApiProperty({ description: 'Minimum X coordinate', example: -500.0 })
  @IsNumber({ maxDecimalPlaces: 3 })
  minX: number;

  @ApiProperty({ description: 'Maximum X coordinate', example: 500.0 })
  @IsNumber({ maxDecimalPlaces: 3 })
  maxX: number;

  @ApiProperty({ description: 'Minimum Y coordinate', example: -500.0 })
  @IsNumber({ maxDecimalPlaces: 3 })
  minY: number;

  @ApiProperty({ description: 'Maximum Y coordinate', example: 500.0 })
  @IsNumber({ maxDecimalPlaces: 3 })
  maxY: number;

  @ApiProperty({ description: 'Minimum Z coordinate', example: 0.0 })
  @IsNumber({ maxDecimalPlaces: 3 })
  minZ: number;

  @ApiProperty({ description: 'Maximum Z coordinate', example: 800.0 })
  @IsNumber({ maxDecimalPlaces: 3 })
  maxZ: number;
}

export class JointLimitsDto {
  @ApiProperty({ description: 'Minimum joint positions in degrees', example: [-180, -90, -180, -180, -180, -360] })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  min: number[];

  @ApiProperty({ description: 'Maximum joint positions in degrees', example: [180, 90, 180, 180, 180, 360] })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  max: number[];
}

export class ToolOffsetDto {
  @ApiProperty({ description: 'Tool X offset in millimeters', example: 0.0 })
  @IsNumber({ maxDecimalPlaces: 3 })
  x: number;

  @ApiProperty({ description: 'Tool Y offset in millimeters', example: 0.0 })
  @IsNumber({ maxDecimalPlaces: 3 })
  y: number;

  @ApiProperty({ description: 'Tool Z offset in millimeters', example: 100.0 })
  @IsNumber({ maxDecimalPlaces: 3 })
  z: number;

  @ApiProperty({ description: 'Tool RX offset in degrees', example: 0.0 })
  @IsNumber({ maxDecimalPlaces: 3 })
  rx: number;

  @ApiProperty({ description: 'Tool RY offset in degrees', example: 0.0 })
  @IsNumber({ maxDecimalPlaces: 3 })
  ry: number;

  @ApiProperty({ description: 'Tool RZ offset in degrees', example: 0.0 })
  @IsNumber({ maxDecimalPlaces: 3 })
  rz: number;
}

export class PerformanceDto {
  @ApiProperty({ description: 'Average cycle time in seconds', example: 30.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cycleTime: number;

  @ApiProperty({ description: 'Throughput per hour', example: 120 })
  @IsNumber()
  @Min(0)
  throughput: number;

  @ApiProperty({ description: 'Overall efficiency percentage', example: 95.8 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  efficiency: number;

  @ApiProperty({ description: 'Quality rating percentage', example: 99.2 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  quality: number;
}

export class DiagnosticsDto {
  @ApiProperty({ description: 'CPU usage percentage', example: 45.2 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  cpu: number;

  @ApiProperty({ description: 'Memory usage percentage', example: 67.8 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  memory: number;

  @ApiProperty({ description: 'Disk usage percentage', example: 23.4 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  disk: number;

  @ApiProperty({ description: 'Network usage percentage', example: 12.1 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  network: number;

  @ApiPropertyOptional({ description: 'Additional sensor data' })
  @IsOptional()
  @IsObject()
  sensors?: Record<string, any>;
}

export class MaintenanceHistoryEntryDto {
  @ApiProperty({ description: 'Maintenance date', example: '2024-01-15T10:30:00Z' })
  @IsDateString()
  date: Date;

  @ApiProperty({ description: 'Type of maintenance', example: 'preventive' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Maintenance description', example: 'Regular lubrication and calibration check' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Technician responsible', example: 'John Smith' })
  @IsString()
  @IsNotEmpty()
  technician: string;
}

export class ErrorDto {
  @ApiProperty({ description: 'Error code', example: 'E001' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Error message', example: 'Joint 1 position limit exceeded' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: 'Error timestamp', example: '2024-01-15T14:30:00Z' })
  @IsDateString()
  timestamp: Date;

  @ApiProperty({ description: 'Error severity', example: 'critical' })
  @IsString()
  @IsEnum(['info', 'warning', 'error', 'critical'])
  severity: string;
}

// Main Robot DTOs
export class CreateRobotDto {
  @ApiProperty({ description: 'Robot serial number', example: 'UR001-2024-001' })
  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @ApiProperty({ description: 'Robot name', example: 'Assembly Robot 01' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Robot description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Robot manufacturer', enum: RobotManufacturer })
  @IsEnum(RobotManufacturer)
  manufacturer: RobotManufacturer;

  @ApiProperty({ description: 'Robot model', example: 'UR5e' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiPropertyOptional({ description: 'Robot version' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiProperty({ description: 'Robot type', enum: RobotType })
  @IsEnum(RobotType)
  type: RobotType;

  @ApiProperty({ description: 'Robot capabilities', enum: RobotCapability, isArray: true })
  @IsArray()
  @IsEnum(RobotCapability, { each: true })
  capabilities: RobotCapability[];

  @ApiPropertyOptional({ description: 'Degrees of freedom', example: 6 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  degreesOfFreedom?: number;

  @ApiPropertyOptional({ description: 'Reach in millimeters', example: 850.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  reach?: number;

  @ApiPropertyOptional({ description: 'Payload in kilograms', example: 5.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  payload?: number;

  @ApiPropertyOptional({ description: 'Weight in kilograms', example: 20.6 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ description: 'Repeatability in millimeters', example: 0.03 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  repeatability?: number;

  @ApiPropertyOptional({ description: 'Maximum speed in m/s', example: 1.05 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  maxSpeed?: number;

  @ApiPropertyOptional({ description: 'Maximum acceleration in m/s²', example: 15.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  maxAcceleration?: number;

  @ApiPropertyOptional({ description: 'IP address' })
  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'Port number' })
  @IsOptional()
  @IsPort()
  port?: number;

  @ApiPropertyOptional({ description: 'Communication protocol' })
  @IsOptional()
  @IsString()
  protocol?: string;

  @ApiPropertyOptional({ description: 'MAC address' })
  @IsOptional()
  @IsString()
  macAddress?: string;

  @ApiPropertyOptional({ description: 'Home position', type: PositionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PositionDto)
  homePosition?: PositionDto;

  @ApiPropertyOptional({ description: 'Workspace limits', type: WorkspaceLimitDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkspaceLimitDto)
  workspaceLimit?: WorkspaceLimitDto;

  @ApiPropertyOptional({ description: 'Joint limits', type: JointLimitsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => JointLimitsDto)
  jointLimits?: JointLimitsDto;

  @ApiPropertyOptional({ description: 'Tool type' })
  @IsOptional()
  @IsString()
  toolType?: string;

  @ApiPropertyOptional({ description: 'Tool offset', type: ToolOffsetDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ToolOffsetDto)
  toolOffset?: ToolOffsetDto;

  @ApiPropertyOptional({ description: 'Tool weight in kilograms' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  toolWeight?: number;

  @ApiPropertyOptional({ description: 'Safety zones' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  safetyZones?: string[];

  @ApiPropertyOptional({ description: 'Maximum safety speed in m/s' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxSafetySpeed?: number;

  @ApiPropertyOptional({ description: 'Maximum safety force in Newtons' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxSafetyForce?: number;

  @ApiPropertyOptional({ description: 'Maintenance interval in hours' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maintenanceInterval?: number;

  @ApiPropertyOptional({ description: 'Location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Zone' })
  @IsOptional()
  @IsString()
  zone?: string;

  @ApiPropertyOptional({ description: 'Work cell' })
  @IsOptional()
  @IsString()
  workCell?: string;

  @ApiPropertyOptional({ description: 'Production line' })
  @IsOptional()
  @IsString()
  productionLine?: string;

  @ApiPropertyOptional({ description: 'Installation date' })
  @IsOptional()
  @IsDateString()
  installationDate?: Date;

  @ApiPropertyOptional({ description: 'Commissioning date' })
  @IsOptional()
  @IsDateString()
  commissioningDate?: Date;

  @ApiPropertyOptional({ description: 'Firmware version' })
  @IsOptional()
  @IsString()
  firmwareVersion?: string;

  @ApiPropertyOptional({ description: 'Software version' })
  @IsOptional()
  @IsString()
  softwareVersion?: string;

  @ApiPropertyOptional({ description: 'Certifications' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiPropertyOptional({ description: 'Standards' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  standards?: string[];

  @ApiPropertyOptional({ description: 'Integrations' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  integrations?: string[];

  @ApiPropertyOptional({ description: 'Configuration parameters' })
  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Additional parameters' })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Tags for categorization' })
  @IsOptional()
  @IsObject()
  tags?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Fleet ID if part of a fleet' })
  @IsOptional()
  @IsUUID()
  fleetId?: string;
}

export class UpdateRobotDto extends PartialType(CreateRobotDto) {}

export class RobotStatusUpdateDto {
  @ApiProperty({ description: 'New robot status', enum: RobotStatus })
  @IsEnum(RobotStatus)
  status: RobotStatus;

  @ApiPropertyOptional({ description: 'Status change reason' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RobotPositionUpdateDto {
  @ApiProperty({ description: 'New position', type: PositionDto })
  @ValidateNested()
  @Type(() => PositionDto)
  position: PositionDto;

  @ApiPropertyOptional({ description: 'Joint positions in degrees' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  jointPositions?: number[];

  @ApiPropertyOptional({ description: 'Joint velocities in degrees/second' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  jointVelocities?: number[];

  @ApiPropertyOptional({ description: 'Joint torques in Nm' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  jointTorques?: number[];
}

export class RobotPerformanceUpdateDto {
  @ApiProperty({ description: 'Performance metrics', type: PerformanceDto })
  @ValidateNested()
  @Type(() => PerformanceDto)
  performance: PerformanceDto;

  @ApiPropertyOptional({ description: 'Current utilization percentage' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  currentUtilization?: number;

  @ApiPropertyOptional({ description: 'Power consumption in watts' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  powerConsumption?: number;

  @ApiPropertyOptional({ description: 'Energy efficiency percentage' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @Max(100)
  energyEfficiency?: number;
}

export class RobotErrorReportDto {
  @ApiProperty({ description: 'Error details', type: ErrorDto })
  @ValidateNested()
  @Type(() => ErrorDto)
  error: ErrorDto;
}

export class RobotMaintenanceScheduleDto {
  @ApiProperty({ description: 'Next maintenance date', example: '2024-02-15T09:00:00Z' })
  @IsDateString()
  nextMaintenanceDate: Date;

  @ApiPropertyOptional({ description: 'Maintenance type' })
  @IsOptional()
  @IsString()
  maintenanceType?: string;

  @ApiPropertyOptional({ description: 'Maintenance notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RobotDiagnosticsDto {
  @ApiProperty({ description: 'System diagnostics', type: DiagnosticsDto })
  @ValidateNested()
  @Type(() => DiagnosticsDto)
  diagnostics: DiagnosticsDto;

  @ApiPropertyOptional({ description: 'Operating temperature in Celsius' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  operatingTemperature?: number;

  @ApiPropertyOptional({ description: 'Humidity percentage' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  humidity?: number;

  @ApiPropertyOptional({ description: 'Battery level percentage for mobile robots' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  batteryLevel?: number;
}

export class RobotCalibrationDto {
  @ApiProperty({ description: 'Calibration data' })
  @IsObject()
  calibrationData: Record<string, any>;

  @ApiPropertyOptional({ description: 'Calibration type' })
  @IsOptional()
  @IsString()
  calibrationType?: string;

  @ApiPropertyOptional({ description: 'Calibration notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RobotQueryDto {
  @ApiPropertyOptional({ description: 'Filter by manufacturer', enum: RobotManufacturer })
  @IsOptional()
  @IsEnum(RobotManufacturer)
  manufacturer?: RobotManufacturer;

  @ApiPropertyOptional({ description: 'Filter by robot type', enum: RobotType })
  @IsOptional()
  @IsEnum(RobotType)
  type?: RobotType;

  @ApiPropertyOptional({ description: 'Filter by status', enum: RobotStatus })
  @IsOptional()
  @IsEnum(RobotStatus)
  status?: RobotStatus;

  @ApiPropertyOptional({ description: 'Filter by capability', enum: RobotCapability })
  @IsOptional()
  @IsEnum(RobotCapability)
  capability?: RobotCapability;

  @ApiPropertyOptional({ description: 'Filter by location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Filter by zone' })
  @IsOptional()
  @IsString()
  zone?: string;

  @ApiPropertyOptional({ description: 'Filter by fleet ID' })
  @IsOptional()
  @IsUUID()
  fleetId?: string;

  @ApiPropertyOptional({ description: 'Search term for name or description' })
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

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort direction', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

// Response DTOs
export class RobotResponseDto {
  @ApiProperty({ description: 'Robot ID' })
  id: string;

  @ApiProperty({ description: 'Serial number' })
  serialNumber: string;

  @ApiProperty({ description: 'Robot name' })
  name: string;

  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @ApiProperty({ description: 'Manufacturer', enum: RobotManufacturer })
  manufacturer: RobotManufacturer;

  @ApiProperty({ description: 'Model' })
  model: string;

  @ApiPropertyOptional({ description: 'Version' })
  version?: string;

  @ApiProperty({ description: 'Type', enum: RobotType })
  type: RobotType;

  @ApiProperty({ description: 'Status', enum: RobotStatus })
  status: RobotStatus;

  @ApiProperty({ description: 'Capabilities', enum: RobotCapability, isArray: true })
  capabilities: RobotCapability[];

  @ApiProperty({ description: 'Current position', type: PositionDto, nullable: true })
  currentPosition?: PositionDto;

  @ApiProperty({ description: 'Is robot connected' })
  isConnected: boolean;

  @ApiProperty({ description: 'Total operating hours' })
  totalOperatingHours: number;

  @ApiProperty({ description: 'Total cycles completed' })
  totalCycles: number;

  @ApiProperty({ description: 'Current utilization percentage' })
  currentUtilization: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class RobotListResponseDto {
  @ApiProperty({ description: 'List of robots', type: [RobotResponseDto] })
  robots: RobotResponseDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total pages' })
  totalPages: number;
}
