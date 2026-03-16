// Industry 5.0 ERP Backend - Shop Floor Control Module
// Robot DTOs - Data Transfer Objects for robot operations
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
  IsUUID,
  IsDate,
  ValidateNested,
  Min,
  Max,
  Length,
  IsNotEmpty,
  IsEmail,
  IsUrl,
  IsJSON,
  IsPositive,
  IsInt,
  ArrayMinSize,
  ArrayMaxSize,
  Matches,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  RobotType,
  RobotState,
  OperatingMode,
  SafetyStandard,
  AICapabilities,
  RobotCapabilities,
  RobotPosition,
  PerformanceMetrics,
} from '../entities/robot.entity';

// ==================== BASE DTOs ====================

export class RobotPositionDto {
  @ApiProperty({ 
    description: 'X coordinate position',
    example: 150.5,
    minimum: -1000,
    maximum: 1000
  })
  @IsNumber()
  @Min(-1000)
  @Max(1000)
  x: number;

  @ApiProperty({ 
    description: 'Y coordinate position',
    example: 200.3,
    minimum: -1000,
    maximum: 1000
  })
  @IsNumber()
  @Min(-1000)
  @Max(1000)
  y: number;

  @ApiProperty({ 
    description: 'Z coordinate position',
    example: 75.0,
    minimum: -1000,
    maximum: 1000
  })
  @IsNumber()
  @Min(-1000)
  @Max(1000)
  z: number;

  @ApiPropertyOptional({ 
    description: 'Roll rotation in degrees',
    example: 0.0,
    minimum: -180,
    maximum: 180
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  roll?: number;

  @ApiPropertyOptional({ 
    description: 'Pitch rotation in degrees',
    example: 0.0,
    minimum: -180,
    maximum: 180
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  pitch?: number;

  @ApiPropertyOptional({ 
    description: 'Yaw rotation in degrees',
    example: 90.0,
    minimum: -180,
    maximum: 180
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  yaw?: number;
}

export class RobotCapabilitiesDto {
  @ApiProperty({ 
    description: 'Maximum payload capacity in kg',
    example: 10.5,
    minimum: 0,
    maximum: 1000
  })
  @IsNumber()
  @IsPositive()
  @Max(1000)
  maxPayload: number;

  @ApiProperty({ 
    description: 'Maximum reach distance in mm',
    example: 850,
    minimum: 0,
    maximum: 10000
  })
  @IsNumber()
  @IsPositive()
  @Max(10000)
  maxReach: number;

  @ApiProperty({ 
    description: 'Repeatability in mm',
    example: 0.03,
    minimum: 0,
    maximum: 10
  })
  @IsNumber()
  @IsPositive()
  @Max(10)
  repeatability: number;

  @ApiProperty({ 
    description: 'Speed in mm/s',
    example: 1000,
    minimum: 0,
    maximum: 5000
  })
  @IsNumber()
  @IsPositive()
  @Max(5000)
  speed: number;

  @ApiProperty({ 
    description: 'Number of degrees of freedom',
    example: 6,
    minimum: 1,
    maximum: 12
  })
  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(12)
  degreesOfFreedom: number;

  @ApiPropertyOptional({ 
    description: 'Operating temperature range in Celsius',
    example: { min: -10, max: 50 }
  })
  @IsOptional()
  @IsObject()
  operatingTemperature?: {
    min: number;
    max: number;
  };

  @ApiPropertyOptional({ 
    description: 'IP protection rating',
    example: 'IP54'
  })
  @IsOptional()
  @IsString()
  @Matches(/^IP[0-9][0-9]$/)
  ipRating?: string;
}

export class SafetyConfigurationDto {
  @ApiProperty({ 
    description: 'Safety standard compliance',
    enum: SafetyStandard,
    example: SafetyStandard.ISO_10218
  })
  @IsEnum(SafetyStandard)
  standard: SafetyStandard;

  @ApiProperty({ 
    description: 'Safety zone radius in mm',
    example: 1500,
    minimum: 100,
    maximum: 5000
  })
  @IsNumber()
  @Min(100)
  @Max(5000)
  safetyZoneRadius: number;

  @ApiProperty({ 
    description: 'Maximum operational speed in mm/s',
    example: 250,
    minimum: 1,
    maximum: 1000
  })
  @IsNumber()
  @Min(1)
  @Max(1000)
  maxOperationalSpeed: number;

  @ApiProperty({ 
    description: 'Emergency stop response time in ms',
    example: 50,
    minimum: 10,
    maximum: 500
  })
  @IsNumber()
  @Min(10)
  @Max(500)
  emergencyStopTime: number;

  @ApiProperty({ 
    description: 'Force limiting enabled',
    example: true
  })
  @IsBoolean()
  forceLimitingEnabled: boolean;

  @ApiProperty({ 
    description: 'Maximum contact force in N',
    example: 150,
    minimum: 0,
    maximum: 1000
  })
  @IsNumber()
  @Min(0)
  @Max(1000)
  maxContactForce: number;

  @ApiPropertyOptional({ 
    description: 'Safety sensor configuration'
  })
  @IsOptional()
  @IsObject()
  sensorConfig?: {
    lightCurtains: boolean;
    pressureMats: boolean;
    visionSafety: boolean;
    laserScanners: boolean;
  };
}

export class AIProfileDto {
  @ApiProperty({ 
    description: 'AI capabilities',
    enum: AICapabilities,
    isArray: true,
    example: [AICapabilities.MACHINE_LEARNING, AICapabilities.COMPUTER_VISION]
  })
  @IsArray()
  @IsEnum(AICapabilities, { each: true })
  capabilities: AICapabilities[];

  @ApiProperty({ 
    description: 'Learning model version',
    example: '2.1.0'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+\.\d+\.\d+$/)
  modelVersion: string;

  @ApiProperty({ 
    description: 'Training data size in MB',
    example: 1024,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  trainingDataSize: number;

  @ApiPropertyOptional({ 
    description: 'Last training date'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastTrainingDate?: Date;

  @ApiPropertyOptional({ 
    description: 'Confidence threshold',
    example: 0.85,
    minimum: 0,
    maximum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidenceThreshold?: number;

  @ApiPropertyOptional({ 
    description: 'Learning rate',
    example: 0.001,
    minimum: 0,
    maximum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  learningRate?: number;
}

// ==================== MAIN DTOs ====================

export class CreateRobotDto {
  @ApiProperty({ 
    description: 'Robot serial number',
    example: 'ROB-2024-001',
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  serialNumber: string;

  @ApiProperty({ 
    description: 'Robot name/identifier',
    example: 'Assembly Robot Alpha',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiProperty({ 
    description: 'Robot type',
    enum: RobotType,
    example: RobotType.COLLABORATIVE
  })
  @IsEnum(RobotType)
  type: RobotType;

  @ApiProperty({ 
    description: 'Robot manufacturer',
    example: 'Universal Robots',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  manufacturer: string;

  @ApiProperty({ 
    description: 'Robot model',
    example: 'UR10e',
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  model: string;

  @ApiPropertyOptional({ 
    description: 'Firmware version',
    example: '5.12.1'
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d+\.\d+\.\d+$/)
  firmwareVersion?: string;

  @ApiProperty({ 
    description: 'Robot location on shop floor',
    example: 'Cell A-1',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  location: string;

  @ApiPropertyOptional({ 
    description: 'Work cell ID where robot is assigned'
  })
  @IsOptional()
  @IsUUID()
  workCellId?: string;

  @ApiProperty({ 
    description: 'Robot capabilities configuration'
  })
  @ValidateNested()
  @Type(() => RobotCapabilitiesDto)
  capabilities: RobotCapabilitiesDto;

  @ApiProperty({ 
    description: 'Initial position of the robot'
  })
  @ValidateNested()
  @Type(() => RobotPositionDto)
  position: RobotPositionDto;

  @ApiProperty({ 
    description: 'Safety configuration'
  })
  @ValidateNested()
  @Type(() => SafetyConfigurationDto)
  safetyConfiguration: SafetyConfigurationDto;

  @ApiProperty({ 
    description: 'Operating mode',
    enum: OperatingMode,
    example: OperatingMode.AUTONOMOUS
  })
  @IsEnum(OperatingMode)
  operatingMode: OperatingMode;

  @ApiProperty({ 
    description: 'Robot supports collaborative operations',
    example: true
  })
  @IsBoolean()
  isCollaborative: boolean;

  @ApiProperty({ 
    description: 'Robot has AI capabilities',
    example: true
  })
  @IsBoolean()
  hasAI: boolean;

  @ApiPropertyOptional({ 
    description: 'AI profile configuration (required if hasAI is true)'
  })
  @ValidateNested()
  @Type(() => AIProfileDto)
  @IsOptional()
  aiProfile?: AIProfileDto;

  @ApiPropertyOptional({ 
    description: 'Maintenance schedule interval in hours',
    example: 720,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  maintenanceIntervalHours?: number;

  @ApiPropertyOptional({ 
    description: 'Additional configuration parameters as JSON'
  })
  @IsOptional()
  @IsJSON()
  configurationParameters?: string;

  @ApiPropertyOptional({ 
    description: 'Robot description/notes',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;
}

export class UpdateRobotDto extends PartialType(CreateRobotDto) {
  @ApiPropertyOptional({ 
    description: 'Robot status',
    enum: RobotState
  })
  @IsOptional()
  @IsEnum(RobotState)
  status?: RobotState;

  @ApiPropertyOptional({ 
    description: 'Robot is active',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class RobotQueryDto {
  @ApiPropertyOptional({ 
    description: 'Filter by robot type',
    enum: RobotType
  })
  @IsOptional()
  @IsEnum(RobotType)
  type?: RobotType;

  @ApiPropertyOptional({ 
    description: 'Filter by robot status',
    enum: RobotState
  })
  @IsOptional()
  @IsEnum(RobotState)
  status?: RobotState;

  @ApiPropertyOptional({ 
    description: 'Filter by operating mode',
    enum: OperatingMode
  })
  @IsOptional()
  @IsEnum(OperatingMode)
  operatingMode?: OperatingMode;

  @ApiPropertyOptional({ 
    description: 'Filter by work cell ID'
  })
  @IsOptional()
  @IsUUID()
  workCellId?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by manufacturer name'
  })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by location'
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by active status'
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @ApiPropertyOptional({ 
    description: 'Filter by collaborative capability'
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isCollaborative?: boolean;

  @ApiPropertyOptional({ 
    description: 'Filter by AI capability'
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  hasAI?: boolean;

  @ApiPropertyOptional({ 
    description: 'Filter robots needing maintenance'
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  needsMaintenance?: boolean;

  @ApiPropertyOptional({ 
    description: 'Page number for pagination',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ 
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

// ==================== COMMAND DTOs ====================

export class RobotCommandDto {
  @ApiProperty({ 
    description: 'Command to execute',
    example: 'START',
    enum: ['START', 'STOP', 'PAUSE', 'RESUME', 'RESET', 'CALIBRATE', 'HOME']
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['START', 'STOP', 'PAUSE', 'RESUME', 'RESET', 'CALIBRATE', 'HOME'])
  command: string;

  @ApiPropertyOptional({ 
    description: 'Command parameters as JSON'
  })
  @IsOptional()
  @IsObject()
  parameters?: any;

  @ApiPropertyOptional({ 
    description: 'Command priority level',
    example: 'NORMAL',
    enum: ['LOW', 'NORMAL', 'HIGH', 'EMERGENCY']
  })
  @IsOptional()
  @IsEnum(['LOW', 'NORMAL', 'HIGH', 'EMERGENCY'])
  priority?: string;

  @ApiPropertyOptional({ 
    description: 'Command timeout in seconds',
    example: 30,
    minimum: 1,
    maximum: 3600
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3600)
  timeout?: number;

  @ApiPropertyOptional({ 
    description: 'Reason for the command'
  })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  reason?: string;
}

export class RobotCalibrationDto {
  @ApiProperty({ 
    description: 'Calibration type',
    example: 'FULL',
    enum: ['QUICK', 'FULL', 'CUSTOM']
  })
  @IsEnum(['QUICK', 'FULL', 'CUSTOM'])
  type: string;

  @ApiPropertyOptional({ 
    description: 'Calibration parameters'
  })
  @IsOptional()
  @IsObject()
  parameters?: {
    joints?: number[];
    toolOffset?: RobotPositionDto;
    payloadMass?: number;
    centerOfGravity?: RobotPositionDto;
  };

  @ApiPropertyOptional({ 
    description: 'Reference points for calibration'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RobotPositionDto)
  referencePoints?: RobotPositionDto[];

  @ApiPropertyOptional({ 
    description: 'Tool to calibrate'
  })
  @IsOptional()
  @IsString()
  toolName?: string;
}

// ==================== TASK DTOs ====================

export class RobotTaskAssignmentDto {
  @ApiProperty({ 
    description: 'Task type',
    example: 'PICK_AND_PLACE'
  })
  @IsString()
  @IsNotEmpty()
  taskType: string;

  @ApiProperty({ 
    description: 'Task priority level',
    example: 5,
    minimum: 1,
    maximum: 10
  })
  @IsInt()
  @Min(1)
  @Max(10)
  priority: number;

  @ApiProperty({ 
    description: 'Task parameters and instructions'
  })
  @IsObject()
  @IsNotEmpty()
  parameters: any;

  @ApiPropertyOptional({ 
    description: 'Expected task duration in seconds',
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  estimatedDuration?: number;

  @ApiPropertyOptional({ 
    description: 'Task dependencies (other task IDs)'
  })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  dependencies?: string[];

  @ApiPropertyOptional({ 
    description: 'Scheduled start time'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  scheduledStart?: Date;

  @ApiPropertyOptional({ 
    description: 'Task deadline'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deadline?: Date;

  @ApiPropertyOptional({ 
    description: 'Quality requirements'
  })
  @IsOptional()
  @IsObject()
  qualityRequirements?: {
    accuracy?: number;
    precision?: number;
    tolerance?: number;
    inspectionRequired?: boolean;
  };
}

// ==================== BULK OPERATIONS ====================

export class BulkRobotOperationDto {
  @ApiProperty({ 
    description: 'Robot IDs to perform operation on',
    type: [String]
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsUUID(undefined, { each: true })
  robotIds: string[];

  @ApiProperty({ 
    description: 'Operation to perform',
    example: 'START',
    enum: ['START', 'STOP', 'PAUSE', 'RESUME', 'RESET', 'EMERGENCY_STOP', 'UPDATE_CONFIG']
  })
  @IsEnum(['START', 'STOP', 'PAUSE', 'RESUME', 'RESET', 'EMERGENCY_STOP', 'UPDATE_CONFIG'])
  operation: string;

  @ApiPropertyOptional({ 
    description: 'Operation parameters'
  })
  @IsOptional()
  @IsObject()
  parameters?: any;

  @ApiPropertyOptional({ 
    description: 'Execute operations in parallel',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  parallel?: boolean;

  @ApiPropertyOptional({ 
    description: 'Continue on individual failures',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  continueOnError?: boolean;

  @ApiPropertyOptional({ 
    description: 'Operation timeout per robot in seconds',
    minimum: 1,
    maximum: 300
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(300)
  timeout?: number;
}

// ==================== RESPONSE DTOs ====================

export class RobotResponseDto {
  @ApiProperty({ description: 'Robot ID' })
  id: string;

  @ApiProperty({ description: 'Serial number' })
  serialNumber: string;

  @ApiProperty({ description: 'Robot name' })
  name: string;

  @ApiProperty({ description: 'Robot type', enum: RobotType })
  type: RobotType;

  @ApiProperty({ description: 'Current status', enum: RobotState })
  status: RobotState;

  @ApiProperty({ description: 'Operating mode', enum: OperatingMode })
  operatingMode: OperatingMode;

  @ApiProperty({ description: 'Manufacturer' })
  manufacturer: string;

  @ApiProperty({ description: 'Model' })
  model: string;

  @ApiProperty({ description: 'Location' })
  location: string;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Is collaborative' })
  isCollaborative: boolean;

  @ApiProperty({ description: 'Has AI capabilities' })
  hasAI: boolean;

  @ApiProperty({ description: 'Current position' })
  currentPosition: RobotPosition;

  @ApiProperty({ description: 'Robot capabilities' })
  capabilities: RobotCapabilities;

  @ApiProperty({ description: 'Performance metrics' })
  performanceMetrics: PerformanceMetrics;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

export class RobotPerformanceDto {
  @ApiProperty({ description: 'Overall efficiency percentage' })
  efficiency: number;

  @ApiProperty({ description: 'Uptime percentage' })
  uptime: number;

  @ApiProperty({ description: 'Tasks completed' })
  tasksCompleted: number;

  @ApiProperty({ description: 'Average task completion time in seconds' })
  avgTaskTime: number;

  @ApiProperty({ description: 'Error count' })
  errorCount: number;

  @ApiProperty({ description: 'Maintenance alerts count' })
  maintenanceAlerts: number;

  @ApiProperty({ description: 'Energy consumption in kWh' })
  energyConsumption: number;

  @ApiProperty({ description: 'Performance score (0-100)' })
  performanceScore: number;
}

export class RobotDashboardDto {
  @ApiProperty({ description: 'Total robots count' })
  totalRobots: number;

  @ApiProperty({ description: 'Active robots count' })
  activeRobots: number;

  @ApiProperty({ description: 'Robots by status' })
  robotsByStatus: { [key in RobotState]: number };

  @ApiProperty({ description: 'Robots by type' })
  robotsByType: { [key in RobotType]: number };

  @ApiProperty({ description: 'Overall fleet efficiency' })
  fleetEfficiency: number;

  @ApiProperty({ description: 'Robots needing maintenance' })
  maintenanceRequired: number;

  @ApiProperty({ description: 'Average performance score' })
  avgPerformanceScore: number;

  @ApiProperty({ description: 'Recent alerts count' })
  recentAlerts: number;
}
