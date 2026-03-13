// Industry 5.0 ERP Backend - Shop Floor Control Module
// Production Line DTOs - Data Transfer Objects for production line operations
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
  ProductionLineType,
  ProductionLineStatus,
  QualityStandard,
  LineCapabilities,
  ProductionSchedule,
  QualityMetrics,
  ProductionMetrics,
  ThroughputOptimization,
} from '../entities/production-line.entity';

// ============== Capabilities DTOs ==============

export class LineCapabilitiesDto {
  @ApiProperty({ description: 'Maximum throughput (parts/hour)' })
  @IsNumber()
  @Min(0)
  maxThroughput: number;

  @ApiProperty({ description: 'Minimum batch size' })
  @IsInt()
  @Min(1)
  minBatchSize: number;

  @ApiProperty({ description: 'Maximum batch size' })
  @IsInt()
  @Min(1)
  maxBatchSize: number;

  @ApiProperty({ description: 'Supported product types' })
  @IsArray()
  productTypes: string[];

  @ApiProperty({ description: 'Quality levels' })
  @IsArray()
  qualityLevels: string[];

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

  @ApiProperty({ description: 'Adaptive scheduling available' })
  @IsBoolean()
  hasAdaptiveScheduling: boolean;

  @ApiProperty({ description: 'Quality prediction available' })
  @IsBoolean()
  hasQualityPrediction: boolean;

  @ApiProperty({ description: 'Predictive maintenance available' })
  @IsBoolean()
  hasPredictiveMaintenance: boolean;

  @ApiProperty({ description: 'Digital twin available' })
  @IsBoolean()
  hasDigitalTwin: boolean;

  @ApiProperty({ description: 'Real-time optimization available' })
  @IsBoolean()
  hasRealTimeOptimization: boolean;

  @ApiProperty({ description: 'Quantum optimization available' })
  @IsBoolean()
  hasQuantumOptimization: boolean;

  @ApiProperty({ description: 'Sustainable production support' })
  @IsBoolean()
  supportsSustainableProduction: boolean;
}

// ============== Scheduling DTOs ==============

export class ScheduledProductDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Product name' })
  @IsString()
  productName: string;

  @ApiProperty({ description: 'Quantity to produce' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Priority (1-10)', minimum: 1, maximum: 10 })
  @IsInt()
  @Min(1)
  @Max(10)
  priority: number;

  @ApiProperty({ description: 'Scheduled start time' })
  @IsDate()
  @Type(() => Date)
  scheduledStart: Date;

  @ApiProperty({ description: 'Estimated duration (minutes)' })
  @IsNumber()
  @Min(1)
  estimatedDuration: number;

  @ApiProperty({ description: 'Required work cell IDs', type: [String] })
  @IsArray()
  @IsUUID(undefined, { each: true })
  requiredWorkCells: string[];

  @ApiPropertyOptional({ description: 'Quality requirements' })
  @IsOptional()
  @IsObject()
  qualityRequirements?: any;
}

export class ChangeoverDto {
  @ApiProperty({ description: 'From product' })
  @IsString()
  fromProduct: string;

  @ApiProperty({ description: 'To product' })
  @IsString()
  toProduct: string;

  @ApiProperty({ description: 'Scheduled time' })
  @IsDate()
  @Type(() => Date)
  scheduledTime: Date;

  @ApiProperty({ description: 'Estimated duration (minutes)' })
  @IsNumber()
  @Min(1)
  estimatedDuration: number;
}

export class ProductionScheduleDto {
  @ApiProperty({ description: 'Scheduled products', type: [ScheduledProductDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduledProductDto)
  scheduledProducts: ScheduledProductDto[];

  @ApiPropertyOptional({ description: 'Upcoming changeovers', type: [ChangeoverDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChangeoverDto)
  upcomingChangeovers?: ChangeoverDto[];
}

// ============== Main DTOs ==============

export class CreateProductionLineDto {
  @ApiProperty({ description: 'Name', maxLength: 255 })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiPropertyOptional({ description: 'Display name', maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  displayName?: string;

  @ApiProperty({ description: 'Type', enum: ProductionLineType })
  @IsEnum(ProductionLineType)
  type: ProductionLineType;

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

  @ApiPropertyOptional({ description: 'Floor', maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  floor?: string;

  @ApiPropertyOptional({ description: 'Building', maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  building?: string;

  @ApiPropertyOptional({ description: 'Physical location', maxLength: 255 })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  physicalLocation?: string;

  @ApiProperty({ description: 'Line capabilities' })
  @ValidateNested()
  @Type(() => LineCapabilitiesDto)
  capabilities: LineCapabilitiesDto;

  @ApiPropertyOptional({ description: 'Production schedule' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductionScheduleDto)
  productionSchedule?: ProductionScheduleDto;

  @ApiPropertyOptional({ description: 'Tags' })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Active flag', default: true })
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

  @ApiPropertyOptional({ description: 'Is Autonomous', default: false })
  @IsOptional()
  @IsBoolean()
  isAutonomous?: boolean;

  @ApiPropertyOptional({ description: 'Supports Lean Manufacturing', default: false })
  @IsOptional()
  @IsBoolean()
  supportsLeanManufacturing?: boolean;

  @ApiPropertyOptional({ description: 'Supports Sustainable Production', default: false })
  @IsOptional()
  @IsBoolean()
  supportsSustainableProduction?: boolean;

  @ApiPropertyOptional({ description: 'Custom configuration' })
  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;
}

export class UpdateProductionLineDto extends PartialType(CreateProductionLineDto) {
  @ApiPropertyOptional({ description: 'Status', enum: ProductionLineStatus })
  @IsOptional()
  @IsEnum(ProductionLineStatus)
  status?: ProductionLineStatus;

  @ApiPropertyOptional({ description: 'Current throughput (parts/hour)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentThroughput?: number;

  @ApiPropertyOptional({ description: 'Needs maintenance' })
  @IsOptional()
  @IsBoolean()
  needsMaintenance?: boolean;

  @ApiPropertyOptional({ description: 'Has quality issues' })
  @IsOptional()
  @IsBoolean()
  hasQualityIssues?: boolean;

  @ApiPropertyOptional({ description: 'Next maintenance date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  nextMaintenanceDate?: Date;

  @ApiPropertyOptional({ description: 'Next quality check date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  nextQualityCheck?: Date;
}

export class ProductionLineQueryDto {
  @ApiPropertyOptional({ description: 'Type', enum: ProductionLineType })
  @IsOptional()
  @IsEnum(ProductionLineType)
  type?: ProductionLineType;

  @ApiPropertyOptional({ description: 'Status', enum: ProductionLineStatus })
  @IsOptional()
  @IsEnum(ProductionLineStatus)
  status?: ProductionLineStatus;

  @ApiPropertyOptional({ description: 'Facility' })
  @IsOptional()
  @IsString()
  facility?: string;

  @ApiPropertyOptional({ description: 'Department' })
  @IsOptional()
  @IsString()
  department?: string;

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

  @ApiPropertyOptional({ description: 'Is flexible' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isFlexible?: boolean;

  @ApiPropertyOptional({ description: 'Is autonomous' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isAutonomous?: boolean;

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

export class StartProductionLineDto {
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

  @ApiPropertyOptional({ description: 'Target throughput (parts/hour)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetThroughput?: number;
}

export class IncrementLineProgressDto {
  @ApiPropertyOptional({ description: 'Increment amount', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  amount?: number;
}

export class SetLineProgressDto {
  @ApiProperty({ description: 'Current batch progress' })
  @IsInt()
  @Min(0)
  progress: number;
}

// ============== Metrics DTOs ==============

export class UpdateProductionMetricsDto {
  @ApiPropertyOptional({ description: 'Actual throughput (parts/hour)' })
  @IsOptional()
  @IsNumber()
  actualThroughput?: number;

  @ApiPropertyOptional({ description: 'Target throughput (parts/hour)' })
  @IsOptional()
  @IsNumber()
  targetThroughput?: number;

  @ApiPropertyOptional({ description: 'Throughput efficiency (%)' })
  @IsOptional()
  @IsNumber()
  throughputEfficiency?: number;

  @ApiPropertyOptional({ description: 'Cycle time (minutes)' })
  @IsOptional()
  @IsNumber()
  cycleTime?: number;

  @ApiPropertyOptional({ description: 'Takt time (minutes)' })
  @IsOptional()
  @IsNumber()
  taktTime?: number;

  @ApiPropertyOptional({ description: 'Lead time (minutes)' })
  @IsOptional()
  @IsNumber()
  leadTime?: number;

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

  @ApiPropertyOptional({ description: 'TEEP' })
  @IsOptional()
  @IsNumber()
  teep?: number;

  @ApiPropertyOptional({ description: 'Line utilization (%)' })
  @IsOptional()
  @IsNumber()
  lineUtilization?: number;

  @ApiPropertyOptional({ description: 'Equipment utilization (%)' })
  @IsOptional()
  @IsNumber()
  equipmentUtilization?: number;

  @ApiPropertyOptional({ description: 'Labor utilization (%)' })
  @IsOptional()
  @IsNumber()
  laborUtilization?: number;

  @ApiPropertyOptional({ description: 'Cost per unit' })
  @IsOptional()
  @IsNumber()
  costPerUnit?: number;

  @ApiPropertyOptional({ description: 'Total production cost' })
  @IsOptional()
  @IsNumber()
  totalProductionCost?: number;

  @ApiPropertyOptional({ description: 'Efficiency savings' })
  @IsOptional()
  @IsNumber()
  efficiencySavings?: number;

  @ApiPropertyOptional({ description: 'Energy consumption (kWh)' })
  @IsOptional()
  @IsNumber()
  energyConsumption?: number;

  @ApiPropertyOptional({ description: 'Carbon footprint (kg CO2)' })
  @IsOptional()
  @IsNumber()
  carbonFootprint?: number;

  @ApiPropertyOptional({ description: 'Water usage (liters)' })
  @IsOptional()
  @IsNumber()
  waterUsage?: number;

  @ApiPropertyOptional({ description: 'Waste generated (kg)' })
  @IsOptional()
  @IsNumber()
  wasteGenerated?: number;

  @ApiPropertyOptional({ description: 'Material utilization (%)' })
  @IsOptional()
  @IsNumber()
  materialUtilization?: number;

  @ApiPropertyOptional({ description: 'Predicted downtime (hours)' })
  @IsOptional()
  @IsNumber()
  predictedDowntime?: number;

  @ApiPropertyOptional({ description: 'Maintenance score (0-100)' })
  @IsOptional()
  @IsNumber()
  maintenanceScore?: number;

  @ApiPropertyOptional({ description: 'Performance trend', enum: ['improving', 'stable', 'declining'] })
  @IsOptional()
  @IsEnum(['improving', 'stable', 'declining'])
  performanceTrend?: 'improving' | 'stable' | 'declining';
}

export class UpdateQualityMetricsDto {
  @ApiPropertyOptional({ description: 'Overall quality rate (%)' })
  @IsOptional()
  @IsNumber()
  overallQualityRate?: number;

  @ApiPropertyOptional({ description: 'First pass yield (%)' })
  @IsOptional()
  @IsNumber()
  firstPassYield?: number;

  @ApiPropertyOptional({ description: 'Defect rate (%)' })
  @IsOptional()
  @IsNumber()
  defectRate?: number;

  @ApiPropertyOptional({ description: 'Rework rate (%)' })
  @IsOptional()
  @IsNumber()
  reworkRate?: number;

  @ApiPropertyOptional({ description: 'Scrap rate (%)' })
  @IsOptional()
  @IsNumber()
  scrapRate?: number;

  @ApiPropertyOptional({ description: 'Total defects' })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalDefects?: number;

  @ApiPropertyOptional({ description: 'Critical defects' })
  @IsOptional()
  @IsInt()
  @Min(0)
  criticalDefects?: number;

  @ApiPropertyOptional({ description: 'Major defects' })
  @IsOptional()
  @IsInt()
  @Min(0)
  majorDefects?: number;

  @ApiPropertyOptional({ description: 'Minor defects' })
  @IsOptional()
  @IsInt()
  @Min(0)
  minorDefects?: number;

  @ApiPropertyOptional({ description: 'Quality trend', enum: ['improving', 'stable', 'declining'] })
  @IsOptional()
  @IsEnum(['improving', 'stable', 'declining'])
  qualityTrend?: 'improving' | 'stable' | 'declining';

  @ApiPropertyOptional({ description: 'Defect trend', enum: ['decreasing', 'stable', 'increasing'] })
  @IsOptional()
  @IsEnum(['decreasing', 'stable', 'increasing'])
  defectTrend?: 'decreasing' | 'stable' | 'increasing';

  @ApiPropertyOptional({ description: 'CPK (Process capability index)' })
  @IsOptional()
  @IsNumber()
  cpk?: number;

  @ApiPropertyOptional({ description: 'CP (Process capability)' })
  @IsOptional()
  @IsNumber()
  cp?: number;

  @ApiPropertyOptional({ description: 'Sigma level' })
  @IsOptional()
  @IsNumber()
  sigma?: number;

  @ApiPropertyOptional({ description: 'Compliance standards', enum: QualityStandard, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(QualityStandard, { each: true })
  complianceStandards?: QualityStandard[];

  @ApiPropertyOptional({ description: 'Compliance score (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  complianceScore?: number;
}

// ============== Optimization DTOs ==============

export class BottleneckDto {
  @ApiProperty({ description: 'Work cell ID' })
  @IsUUID()
  workCellId: string;

  @ApiProperty({ description: 'Work cell name' })
  @IsString()
  workCellName: string;

  @ApiProperty({ description: 'Bottleneck severity (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  bottleneckSeverity: number;

  @ApiProperty({ description: 'Suggested actions' })
  @IsArray()
  suggestedActions: string[];
}

export class OptimizationRecommendationDto {
  @ApiProperty({ description: 'Action to take' })
  @IsString()
  action: string;

  @ApiProperty({ description: 'Expected improvement (%)' })
  @IsNumber()
  expectedImprovement: number;

  @ApiProperty({ description: 'Implementation cost' })
  @IsNumber()
  implementationCost: number;

  @ApiProperty({ description: 'Payback period (months)' })
  @IsNumber()
  paybackPeriod: number;
}

export class UpdateThroughputOptimizationDto {
  @ApiPropertyOptional({ description: 'Current optimization level (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  currentOptimizationLevel?: number;

  @ApiPropertyOptional({ description: 'Potential improvement (%)' })
  @IsOptional()
  @IsNumber()
  potentialImprovement?: number;

  @ApiPropertyOptional({ description: 'Bottlenecks', type: [BottleneckDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BottleneckDto)
  bottlenecks?: BottleneckDto[];

  @ApiPropertyOptional({ description: 'Optimization recommendations', type: [OptimizationRecommendationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptimizationRecommendationDto)
  optimizationRecommendations?: OptimizationRecommendationDto[];
}

// ============== Work Cell Management DTOs ==============

export class AssignWorkCellsDto {
  @ApiProperty({ description: 'Work cell IDs', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  workCellIds: string[];
}

export class AlertDto {
  @ApiProperty({ description: 'Alert message' })
  @IsString()
  message: string;
}

export class QualityAlertDto {
  @ApiProperty({ description: 'Quality alert message' })
  @IsString()
  message: string;
}

export class IssueDto {
  @ApiProperty({ description: 'Issue description' })
  @IsString()
  description: string;
}

// ============== Bulk Operations DTOs ==============

export class BulkProductionLineOperationDto {
  @ApiProperty({ description: 'Production line IDs', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsUUID(undefined, { each: true })
  productionLineIds: string[];

  @ApiProperty({ description: 'Operation', enum: ['START', 'PAUSE', 'RESUME', 'COMPLETE', 'EMERGENCY_STOP', 'RESET', 'OPTIMIZE'] })
  @IsEnum(['START', 'PAUSE', 'RESUME', 'COMPLETE', 'EMERGENCY_STOP', 'RESET', 'OPTIMIZE'])
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

export class ProductionLineSummaryDto {
  @ApiProperty({ description: 'ID' })
  id: string;
  @ApiProperty({ description: 'Name' })
  name: string;
  @ApiProperty({ description: 'Type', enum: ProductionLineType })
  type: ProductionLineType;
  @ApiProperty({ description: 'Status', enum: ProductionLineStatus })
  status: ProductionLineStatus;
  @ApiProperty({ description: 'Facility' })
  facility: string;
  @ApiProperty({ description: 'Department' })
  department: string;
  @ApiProperty({ description: 'Health score' })
  healthScore: number;
  @ApiProperty({ description: 'Efficiency' })
  efficiency: number;
  @ApiProperty({ description: 'OEE' })
  oee: number;
  @ApiProperty({ description: 'TEEP' })
  teep: number;
  @ApiProperty({ description: 'Quality rate' })
  qualityRate: number;
  @ApiProperty({ description: 'Throughput efficiency' })
  throughputEfficiency: number;
  @ApiProperty({ description: 'Line utilization' })
  lineUtilization: number;
  @ApiProperty({ description: 'Assigned work cells' })
  assignedWorkCells: number;
  @ApiProperty({ description: 'Active work cells' })
  activeWorkCells: number;
  @ApiProperty({ description: 'Is available' })
  isAvailable: boolean;
  @ApiPropertyOptional({ description: 'Current product' })
  currentProduct?: string;
  @ApiProperty({ description: 'Batch progress (%)' })
  batchProgress: number;
  @ApiProperty({ description: 'Total parts produced' })
  totalPartsProduced: number;
  @ApiProperty({ description: 'Total batches completed' })
  totalBatchesCompleted: number;
}

export class ProductionLineDashboardDto {
  @ApiProperty({ description: 'Total production lines' })
  total: number;
  @ApiProperty({ description: 'Operational lines' })
  operational: number;
  @ApiProperty({ description: 'Idle lines' })
  idle: number;
  @ApiProperty({ description: 'Lines in maintenance' })
  maintenance: number;
  @ApiProperty({ description: 'Lines with errors' })
  errors: number;
  @ApiProperty({ description: 'Emergency stopped lines' })
  emergencyStopped: number;
  @ApiProperty({ description: 'Average OEE' })
  avgOEE: number;
  @ApiProperty({ description: 'Average TEEP' })
  avgTEEP: number;
  @ApiProperty({ description: 'Average efficiency' })
  avgEfficiency: number;
  @ApiProperty({ description: 'Average quality rate' })
  avgQualityRate: number;
  @ApiProperty({ description: 'Total throughput (parts/hour)' })
  totalThroughput: number;
  @ApiProperty({ description: 'Lines needing maintenance' })
  needsMaintenance: number;
  @ApiProperty({ description: 'Lines with quality issues' })
  qualityIssues: number;
  @ApiProperty({ description: 'Optimized lines' })
  optimizedLines: number;
}
