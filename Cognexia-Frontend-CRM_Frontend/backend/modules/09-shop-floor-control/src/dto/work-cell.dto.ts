// Industry 5.0 ERP Backend - Shop Floor Control Module
// WorkCell DTOs - Data Transfer Objects for work cell operations
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
  IsInt,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  WorkCellType,
  WorkCellStatus,
  WorkCellCapabilities,
  LayoutConfiguration,
  ProductionMetrics,
} from '../entities/work-cell.entity';

// ============== Layout DTOs ==============

export class LayoutRobotPositionDto {
  @ApiPropertyOptional({ description: 'Robot ID' })
  @IsOptional()
  @IsUUID()
  robotId?: string;

  @ApiProperty({ description: 'X coordinate (mm)' })
  @IsNumber()
  x: number;

  @ApiProperty({ description: 'Y coordinate (mm)' })
  @IsNumber()
  y: number;

  @ApiProperty({ description: 'Z coordinate (mm)' })
  @IsNumber()
  z: number;

  @ApiProperty({ description: 'Rotation (degrees)' })
  @IsNumber()
  rotation: number;
}

export class LayoutSafetyZoneDto {
  @ApiProperty({ description: 'Zone ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Zone type', enum: ['restricted', 'collaborative', 'human_only'] })
  @IsEnum(['restricted', 'collaborative', 'human_only'])
  type: 'restricted' | 'collaborative' | 'human_only';

  @ApiProperty({ description: 'Polygon coordinates [ [x,y], ... ]' })
  @IsArray()
  coordinates: number[][];
}

export class LayoutWorkstationDto {
  @ApiProperty({ description: 'Workstation ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Workstation type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Position' })
  @IsObject()
  position: { x: number; y: number; z: number };

  @ApiProperty({ description: 'Capabilities' })
  @IsArray()
  capabilities: string[];
}

export class LayoutConfigurationDto {
  @ApiProperty({ description: 'Dimensions' })
  @IsObject()
  dimensions: { length: number; width: number; height: number };

  @ApiProperty({ description: 'Robot positions', type: [LayoutRobotPositionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LayoutRobotPositionDto)
  robotPositions: LayoutRobotPositionDto[];

  @ApiProperty({ description: 'Safety zones', type: [LayoutSafetyZoneDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LayoutSafetyZoneDto)
  safetyZones: LayoutSafetyZoneDto[];

  @ApiProperty({ description: 'Workstations', type: [LayoutWorkstationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LayoutWorkstationDto)
  workstations: LayoutWorkstationDto[];
}

export class WorkCellCapabilitiesDto {
  @ApiProperty({ description: 'Maximum robots supported' })
  @IsInt()
  @Min(0)
  maxRobots: number;

  @ApiProperty({ description: 'Supported operations' })
  @IsArray()
  supportedOperations: string[];

  @ApiProperty({ description: 'Quality levels' })
  @IsArray()
  qualityLevels: string[];

  @ApiProperty({ description: 'Throughput capacity (parts/hour)' })
  @IsNumber()
  throughputCapacity: number;

  @ApiProperty({ description: 'Energy efficiency (kWh/part)' })
  @IsNumber()
  energyEfficiency: number;

  @ApiProperty({ description: 'Automation level (0-100%)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  automationLevel: number;

  @ApiProperty({ description: 'Flexibility score (0-100%)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  flexibilityScore: number;

  @ApiProperty({ description: 'AI optimization available' })
  @IsBoolean()
  hasAIOptimization: boolean;

  @ApiProperty({ description: 'Adaptive control available' })
  @IsBoolean()
  hasAdaptiveControl: boolean;

  @ApiProperty({ description: 'Digital twin available' })
  @IsBoolean()
  hasDigitalTwin: boolean;

  @ApiProperty({ description: 'Predictive maintenance available' })
  @IsBoolean()
  hasPredictiveMaintenance: boolean;

  @ApiProperty({ description: 'Collaborative features available' })
  @IsBoolean()
  hasCollaborativeFeatures: boolean;

  @ApiProperty({ description: 'Quantum optimization available' })
  @IsBoolean()
  hasQuantumOptimization: boolean;
}

// ============== Main DTOs ==============

export class CreateWorkCellDto {
  @ApiProperty({ description: 'Name', maxLength: 255 })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiPropertyOptional({ description: 'Display name', maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  displayName?: string;

  @ApiProperty({ description: 'Type', enum: WorkCellType })
  @IsEnum(WorkCellType)
  type: WorkCellType;

  @ApiPropertyOptional({ description: 'Description', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiProperty({ description: 'Facility', maxLength: 100 })
  @IsString()
  @Length(1, 100)
  facility: string;

  @ApiProperty({ description: 'Department', maxLength: 100 })
  @IsString()
  @Length(1, 100)
  department: string;

  @ApiProperty({ description: 'Production line', maxLength: 100 })
  @IsString()
  @Length(1, 100)
  productionLine: string;

  @ApiPropertyOptional({ description: 'Floor', maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  floor?: string;

  @ApiPropertyOptional({ description: 'Zone', maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  zone?: string;

  @ApiPropertyOptional({ description: 'Physical location', maxLength: 255 })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  physicalLocation?: string;

  @ApiProperty({ description: 'Capabilities' })
  @ValidateNested()
  @Type(() => WorkCellCapabilitiesDto)
  capabilities: WorkCellCapabilitiesDto;

  @ApiProperty({ description: 'Layout configuration' })
  @ValidateNested()
  @Type(() => LayoutConfigurationDto)
  layoutConfiguration: LayoutConfigurationDto;

  @ApiPropertyOptional({ description: 'Tags' })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Initial active flag', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Has AI', default: false })
  @IsOptional()
  @IsBoolean()
  hasAI?: boolean;

  @ApiPropertyOptional({ description: 'Has Digital Twin', default: false })
  @IsOptional()
  @IsBoolean()
  hasDigitalTwin?: boolean;

  @ApiPropertyOptional({ description: 'Is Collaborative', default: false })
  @IsOptional()
  @IsBoolean()
  isCollaborative?: boolean;

  @ApiPropertyOptional({ description: 'Is Autonomous', default: false })
  @IsOptional()
  @IsBoolean()
  isAutonomous?: boolean;

  @ApiPropertyOptional({ description: 'Custom configuration' })
  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;
}

export class UpdateWorkCellDto extends PartialType(CreateWorkCellDto) {
  @ApiPropertyOptional({ description: 'Status', enum: WorkCellStatus })
  @IsOptional()
  @IsEnum(WorkCellStatus)
  status?: WorkCellStatus;

  @ApiPropertyOptional({ description: 'Next maintenance date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  nextMaintenanceDate?: Date;

  @ApiPropertyOptional({ description: 'Needs maintenance' })
  @IsOptional()
  @IsBoolean()
  needsMaintenance?: boolean;
}

export class WorkCellQueryDto {
  @ApiPropertyOptional({ description: 'Type', enum: WorkCellType })
  @IsOptional()
  @IsEnum(WorkCellType)
  type?: WorkCellType;

  @ApiPropertyOptional({ description: 'Status', enum: WorkCellStatus })
  @IsOptional()
  @IsEnum(WorkCellStatus)
  status?: WorkCellStatus;

  @ApiPropertyOptional({ description: 'Facility' })
  @IsOptional()
  @IsString()
  facility?: string;

  @ApiPropertyOptional({ description: 'Department' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: 'Production line' })
  @IsOptional()
  @IsString()
  productionLine?: string;

  @ApiPropertyOptional({ description: 'Active flag' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Has AI' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  hasAI?: boolean;

  @ApiPropertyOptional({ description: 'Page', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Limit', example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

// ============== Production Control DTOs ==============

export class StartProductionDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Product name' })
  @IsString()
  productName: string;

  @ApiProperty({ description: 'Batch ID' })
  @IsString()
  batchId: string;

  @ApiProperty({ description: 'Batch size' })
  @IsInt()
  @Min(1)
  batchSize: number;
}

export class IncrementProgressDto {
  @ApiPropertyOptional({ description: 'Increment amount', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  amount?: number;
}

export class SetProgressDto {
  @ApiProperty({ description: 'Current batch progress' })
  @IsInt()
  @Min(0)
  progress: number;
}

export class UpdateProductionMetricsDto {
  @ApiPropertyOptional({ description: 'Parts produced today' })
  @IsOptional()
  @IsInt()
  @Min(0)
  partsProducedToday?: number;

  @ApiPropertyOptional({ description: 'Target parts per day' })
  @IsOptional()
  @IsInt()
  @Min(0)
  targetPartsPerDay?: number;

  @ApiPropertyOptional({ description: 'Actual cycle time (s)' })
  @IsOptional()
  @IsNumber()
  actualCycleTime?: number;

  @ApiPropertyOptional({ description: 'Planned cycle time (s)' })
  @IsOptional()
  @IsNumber()
  plannedCycleTime?: number;

  @ApiPropertyOptional({ description: 'Throughput efficiency (%)' })
  @IsOptional()
  @IsNumber()
  throughputEfficiency?: number;

  @ApiPropertyOptional({ description: 'Quality rate (%)' })
  @IsOptional()
  @IsNumber()
  qualityRate?: number;

  @ApiPropertyOptional({ description: 'Defect count' })
  @IsOptional()
  @IsInt()
  @Min(0)
  defectCount?: number;

  @ApiPropertyOptional({ description: 'Rework count' })
  @IsOptional()
  @IsInt()
  @Min(0)
  reworkCount?: number;

  @ApiPropertyOptional({ description: 'Availability (%)' })
  @IsOptional()
  @IsNumber()
  availability?: number;

  @ApiPropertyOptional({ description: 'Performance (%)' })
  @IsOptional()
  @IsNumber()
  performance?: number;

  @ApiPropertyOptional({ description: 'OEE' })
  @IsOptional()
  @IsNumber()
  oee?: number;

  @ApiPropertyOptional({ description: 'Uptime (hours)' })
  @IsOptional()
  @IsNumber()
  uptime?: number;

  @ApiPropertyOptional({ description: 'Downtime (hours)' })
  @IsOptional()
  @IsNumber()
  downtime?: number;

  @ApiPropertyOptional({ description: 'Robot utilization (%)' })
  @IsOptional()
  @IsNumber()
  robotUtilization?: number;

  @ApiPropertyOptional({ description: 'Human utilization (%)' })
  @IsOptional()
  @IsNumber()
  humanUtilization?: number;

  @ApiPropertyOptional({ description: 'Energy consumption (kWh)' })
  @IsOptional()
  @IsNumber()
  energyConsumption?: number;

  @ApiPropertyOptional({ description: 'Material waste (%)' })
  @IsOptional()
  @IsNumber()
  materialWaste?: number;

  @ApiPropertyOptional({ description: 'Operating cost (/hr)' })
  @IsOptional()
  @IsNumber()
  operatingCost?: number;

  @ApiPropertyOptional({ description: 'Maintenance cost (/hr)' })
  @IsOptional()
  @IsNumber()
  maintenanceCost?: number;

  @ApiPropertyOptional({ description: 'Labor cost (/hr)' })
  @IsOptional()
  @IsNumber()
  laborCost?: number;

  @ApiPropertyOptional({ description: 'Environmental metrics' })
  @IsOptional()
  @IsObject()
  environmental?: {
    carbonFootprint?: number;
    waterUsage?: number;
    wasteGenerated?: number;
  };
}

export class AssignRobotsDto {
  @ApiProperty({ description: 'Robot IDs', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  robotIds: string[];
}

export class AlertDto {
  @ApiProperty({ description: 'Alert message' })
  @IsString()
  message: string;
}

export class IssueDto {
  @ApiProperty({ description: 'Issue description' })
  @IsString()
  description: string;
}

// ============== Bulk DTOs ==============

export class BulkWorkCellOperationDto {
  @ApiProperty({ description: 'Work cell IDs', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsUUID(undefined, { each: true })
  workCellIds: string[];

  @ApiProperty({ description: 'Operation', enum: ['START', 'PAUSE', 'RESUME', 'COMPLETE', 'EMERGENCY_STOP', 'RESET', 'UPDATE_LAYOUT'] })
  @IsEnum(['START', 'PAUSE', 'RESUME', 'COMPLETE', 'EMERGENCY_STOP', 'RESET', 'UPDATE_LAYOUT'])
  operation: string;

  @ApiPropertyOptional({ description: 'Parameters' })
  @IsOptional()
  @IsObject()
  parameters?: any;

  @ApiPropertyOptional({ description: 'Parallel execution', default: true })
  @IsOptional()
  @IsBoolean()
  parallel?: boolean;

  @ApiPropertyOptional({ description: 'Continue on error', default: false })
  @IsOptional()
  @IsBoolean()
  continueOnError?: boolean;
}

// ============== Response DTOs ==============

export class WorkCellSummaryDto {
  @ApiProperty({ description: 'ID' })
  id: string;
  @ApiProperty({ description: 'Name' })
  name: string;
  @ApiProperty({ description: 'Type', enum: WorkCellType })
  type: WorkCellType;
  @ApiProperty({ description: 'Status', enum: WorkCellStatus })
  status: WorkCellStatus;
  @ApiProperty({ description: 'Facility' })
  facility: string;
  @ApiProperty({ description: 'Production line' })
  productionLine: string;
  @ApiProperty({ description: 'Health score' })
  healthScore: number;
  @ApiProperty({ description: 'Utilization' })
  utilization: number;
  @ApiProperty({ description: 'OEE' })
  oee: number;
  @ApiProperty({ description: 'Quality rate' })
  qualityRate: number;
  @ApiProperty({ description: 'Throughput efficiency' })
  throughputEfficiency: number;
  @ApiProperty({ description: 'Assigned robots' })
  assignedRobots: number;
  @ApiProperty({ description: 'Is available' })
  isAvailable: boolean;
  @ApiPropertyOptional({ description: 'Current product' })
  currentProduct?: string;
  @ApiProperty({ description: 'Batch progress (%)' })
  batchProgress: number;
  @ApiProperty({ description: 'Total parts produced' })
  totalPartsProduced: number;
}

export class WorkCellDashboardDto {
  @ApiProperty({ description: 'Total work cells' })
  total: number;
  @ApiProperty({ description: 'Operational' })
  operational: number;
  @ApiProperty({ description: 'Idle' })
  idle: number;
  @ApiProperty({ description: 'Maintenance' })
  maintenance: number;
  @ApiProperty({ description: 'Errors' })
  errors: number;
  @ApiProperty({ description: 'Emergency stopped' })
  emergencyStopped: number;
  @ApiProperty({ description: 'Average OEE' })
  avgOEE: number;
  @ApiProperty({ description: 'Average utilization' })
  avgUtilization: number;
  @ApiProperty({ description: 'Cells needing maintenance' })
  needsMaintenance: number;
}

