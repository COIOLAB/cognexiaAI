// Industry 5.0 ERP Backend - Production Planning Module
// Production Planning DTOs - Data Transfer Objects for production planning operations
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
  IsDateString,
  IsEmail,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// ============== ENUMS ==============

export enum PlanStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

export enum PlanType {
  MASTER_PRODUCTION_SCHEDULE = 'master_production_schedule',
  MATERIAL_REQUIREMENTS_PLANNING = 'material_requirements_planning',
  CAPACITY_REQUIREMENTS_PLANNING = 'capacity_requirements_planning',
  ROUGH_CUT_CAPACITY_PLANNING = 'rough_cut_capacity_planning',
  FINITE_CAPACITY_SCHEDULING = 'finite_capacity_scheduling'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export enum ForecastMethod {
  MOVING_AVERAGE = 'moving_average',
  EXPONENTIAL_SMOOTHING = 'exponential_smoothing',
  LINEAR_REGRESSION = 'linear_regression',
  ARIMA = 'arima',
  NEURAL_NETWORK = 'neural_network',
  MACHINE_LEARNING = 'machine_learning',
  ENSEMBLE = 'ensemble'
}

export enum OptimizationObjective {
  MINIMIZE_COST = 'minimize_cost',
  MINIMIZE_TIME = 'minimize_time',
  MAXIMIZE_THROUGHPUT = 'maximize_throughput',
  MAXIMIZE_UTILIZATION = 'maximize_utilization',
  MINIMIZE_INVENTORY = 'minimize_inventory',
  MAXIMIZE_CUSTOMER_SERVICE = 'maximize_customer_service'
}

export enum ResourceType {
  MACHINE = 'machine',
  LABOR = 'labor',
  MATERIAL = 'material',
  TOOL = 'tool',
  SPACE = 'space',
  ENERGY = 'energy',
  EQUIPMENT = 'equipment'
}

export enum SchedulingStrategy {
  FORWARD_SCHEDULING = 'forward_scheduling',
  BACKWARD_SCHEDULING = 'backward_scheduling',
  FINITE_CAPACITY = 'finite_capacity',
  INFINITE_CAPACITY = 'infinite_capacity',
  BOTTLENECK_BASED = 'bottleneck_based',
  AI_OPTIMIZED = 'ai_optimized'
}

// ============== BASE DTOs ==============

export class ProductionPlanItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ description: 'Planned quantity' })
  @IsNumber()
  @Min(0)
  plannedQuantity: number;

  @ApiProperty({ description: 'Required date', type: String, format: 'date' })
  @IsDateString()
  requiredDate: string;

  @ApiProperty({ description: 'Priority level', enum: Priority })
  @IsEnum(Priority)
  priority: Priority;

  @ApiPropertyOptional({ description: 'Customer order ID' })
  @IsOptional()
  @IsString()
  customerOrderId?: string;

  @ApiPropertyOptional({ description: 'Work center ID' })
  @IsOptional()
  @IsString()
  workCenterId?: string;

  @ApiPropertyOptional({ description: 'Estimated duration (hours)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDurationHours?: number;

  @ApiPropertyOptional({ description: 'Resource requirements' })
  @IsOptional()
  @IsObject()
  resourceRequirements?: Record<string, any>;
}

export class PlanConstraintDto {
  @ApiProperty({ description: 'Constraint type' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Constraint description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Hard constraint (cannot be violated)' })
  @IsBoolean()
  isHardConstraint: boolean;

  @ApiPropertyOptional({ description: 'Constraint parameters' })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Penalty weight for soft constraints' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  penaltyWeight?: number;
}

export class OptimizationParametersDto {
  @ApiProperty({ description: 'Optimization objectives', enum: OptimizationObjective, isArray: true })
  @IsArray()
  @IsEnum(OptimizationObjective, { each: true })
  objectives: OptimizationObjective[];

  @ApiPropertyOptional({ description: 'Objective weights (sum must equal 1)' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  objectiveWeights?: number[];

  @ApiPropertyOptional({ description: 'Maximum optimization time (seconds)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3600)
  maxOptimizationTimeSeconds?: number;

  @ApiPropertyOptional({ description: 'Use AI-powered optimization' })
  @IsOptional()
  @IsBoolean()
  useAIOptimization?: boolean;

  @ApiPropertyOptional({ description: 'Optimization algorithm preference' })
  @IsOptional()
  @IsString()
  algorithmPreference?: string;
}

// ============== PRODUCTION PLAN DTOs ==============

export class CreateProductionPlanDto {
  @ApiProperty({ description: 'Plan name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  planName: string;

  @ApiProperty({ description: 'Plan type', enum: PlanType })
  @IsEnum(PlanType)
  planType: PlanType;

  @ApiPropertyOptional({ description: 'Plan description' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiProperty({ description: 'Planning start date', type: String, format: 'date' })
  @IsDateString()
  planningStartDate: string;

  @ApiProperty({ description: 'Planning end date', type: String, format: 'date' })
  @IsDateString()
  planningEndDate: string;

  @ApiProperty({ description: 'Facility ID' })
  @IsString()
  @IsNotEmpty()
  facilityId: string;

  @ApiProperty({ description: 'Production plan items', type: [ProductionPlanItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductionPlanItemDto)
  planItems: ProductionPlanItemDto[];

  @ApiPropertyOptional({ description: 'Planning constraints', type: [PlanConstraintDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanConstraintDto)
  constraints?: PlanConstraintDto[];

  @ApiPropertyOptional({ description: 'Optimization parameters' })
  @IsOptional()
  @ValidateNested()
  @Type(() => OptimizationParametersDto)
  optimizationParameters?: OptimizationParametersDto;

  @ApiPropertyOptional({ description: 'Base demand forecast ID' })
  @IsOptional()
  @IsString()
  baseForecastId?: string;

  @ApiPropertyOptional({ description: 'Auto-schedule flag' })
  @IsOptional()
  @IsBoolean()
  autoSchedule?: boolean;

  @ApiPropertyOptional({ description: 'Planning horizon (days)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  planningHorizonDays?: number;

  @ApiPropertyOptional({ description: 'Planning bucket size (hours)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(168)
  bucketSizeHours?: number;
}

export class UpdateProductionPlanDto extends PartialType(CreateProductionPlanDto) {
  @ApiPropertyOptional({ description: 'Plan status', enum: PlanStatus })
  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus;

  @ApiPropertyOptional({ description: 'Approval notes' })
  @IsOptional()
  @IsString()
  approvalNotes?: string;

  @ApiPropertyOptional({ description: 'Approved by user ID' })
  @IsOptional()
  @IsString()
  approvedBy?: string;

  @ApiPropertyOptional({ description: 'Approval date', type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  approvedAt?: string;

  @ApiPropertyOptional({ description: 'Trigger re-optimization' })
  @IsOptional()
  @IsBoolean()
  triggerReoptimization?: boolean;
}

export class ProductionPlanQueryDto {
  @ApiPropertyOptional({ description: 'Plan type filter', enum: PlanType })
  @IsOptional()
  @IsEnum(PlanType)
  planType?: PlanType;

  @ApiPropertyOptional({ description: 'Status filter', enum: PlanStatus })
  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus;

  @ApiPropertyOptional({ description: 'Facility ID filter' })
  @IsOptional()
  @IsString()
  facilityId?: string;

  @ApiPropertyOptional({ description: 'Start date filter', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @ApiPropertyOptional({ description: 'End date filter', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  endDateTo?: string;

  @ApiPropertyOptional({ description: 'Search by plan name' })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

// ============== DEMAND FORECAST DTOs ==============

export class CreateDemandForecastDto {
  @ApiProperty({ description: 'Forecast name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  forecastName: string;

  @ApiProperty({ description: 'Product ID' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Forecast method', enum: ForecastMethod })
  @IsEnum(ForecastMethod)
  forecastMethod: ForecastMethod;

  @ApiProperty({ description: 'Time horizon (days)' })
  @IsNumber()
  @Min(7)
  @Max(730)
  timeHorizonDays: number;

  @ApiProperty({ description: 'Forecast start date', type: String, format: 'date' })
  @IsDateString()
  forecastStartDate: string;

  @ApiPropertyOptional({ description: 'Historical data start date', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  historicalStartDate?: string;

  @ApiPropertyOptional({ description: 'Market segments to consider' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  marketSegments?: string[];

  @ApiPropertyOptional({ description: 'Include seasonal factors' })
  @IsOptional()
  @IsBoolean()
  includeSeasonality?: boolean;

  @ApiPropertyOptional({ description: 'External factors to consider' })
  @IsOptional()
  @IsObject()
  externalFactors?: {
    economicIndicators?: boolean;
    competitorAnalysis?: boolean;
    marketTrends?: boolean;
    promotions?: boolean;
    events?: boolean;
  };

  @ApiPropertyOptional({ description: 'Model parameters' })
  @IsOptional()
  @IsObject()
  modelParameters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Confidence level required (0-1)' })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(0.99)
  confidenceLevel?: number;

  @ApiPropertyOptional({ description: 'Forecast granularity (daily, weekly, monthly)' })
  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly'])
  granularity?: 'daily' | 'weekly' | 'monthly';
}

export class UpdateDemandForecastDto extends PartialType(CreateDemandForecastDto) {
  @ApiPropertyOptional({ description: 'Actual demand for accuracy tracking' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualDemand?: number;

  @ApiPropertyOptional({ description: 'Forecast adjustment factor' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  adjustmentFactor?: number;

  @ApiPropertyOptional({ description: 'Forecast notes' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Forecast accuracy score' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  accuracyScore?: number;
}

export class DemandForecastQueryDto {
  @ApiPropertyOptional({ description: 'Product ID filter' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ description: 'Forecast method filter', enum: ForecastMethod })
  @IsOptional()
  @IsEnum(ForecastMethod)
  forecastMethod?: ForecastMethod;

  @ApiPropertyOptional({ description: 'Start date filter', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'End date filter', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Minimum accuracy filter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  minAccuracy?: number;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

// ============== CAPACITY PLANNING DTOs ==============

export class ResourceCapacityDto {
  @ApiProperty({ description: 'Resource ID' })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({ description: 'Resource type', enum: ResourceType })
  @IsEnum(ResourceType)
  resourceType: ResourceType;

  @ApiProperty({ description: 'Resource name' })
  @IsString()
  @IsNotEmpty()
  resourceName: string;

  @ApiProperty({ description: 'Available capacity (hours/units)' })
  @IsNumber()
  @Min(0)
  availableCapacity: number;

  @ApiPropertyOptional({ description: 'Current utilization (0-1)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  currentUtilization?: number;

  @ApiPropertyOptional({ description: 'Maximum capacity (hours/units)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxCapacity?: number;

  @ApiPropertyOptional({ description: 'Cost per unit/hour' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPerUnit?: number;

  @ApiPropertyOptional({ description: 'Efficiency factor (0-1)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  efficiencyFactor?: number;
}

export class CreateCapacityPlanDto {
  @ApiProperty({ description: 'Capacity plan name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  planName: string;

  @ApiProperty({ description: 'Facility ID' })
  @IsString()
  @IsNotEmpty()
  facilityId: string;

  @ApiProperty({ description: 'Planning horizon (days)' })
  @IsNumber()
  @Min(7)
  @Max(365)
  planningHorizonDays: number;

  @ApiProperty({ description: 'Plan start date', type: String, format: 'date' })
  @IsDateString()
  planStartDate: string;

  @ApiProperty({ description: 'Resource capacities', type: [ResourceCapacityDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ResourceCapacityDto)
  resourceCapacities: ResourceCapacityDto[];

  @ApiPropertyOptional({ description: 'Demand forecast ID for planning' })
  @IsOptional()
  @IsString()
  baseForecastId?: string;

  @ApiPropertyOptional({ description: 'Planning constraints' })
  @IsOptional()
  @IsObject()
  constraints?: {
    maxOvertimeHours?: number;
    minUtilizationRate?: number;
    maxUtilizationRate?: number;
    shiftPatterns?: string[];
    breakSchedule?: any;
  };

  @ApiPropertyOptional({ description: 'Optimization goals', enum: OptimizationObjective, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(OptimizationObjective, { each: true })
  optimizationGoals?: OptimizationObjective[];

  @ApiPropertyOptional({ description: 'Consider maintenance downtime' })
  @IsOptional()
  @IsBoolean()
  considerMaintenanceDowntime?: boolean;
}

export class UpdateCapacityPlanDto extends PartialType(CreateCapacityPlanDto) {
  @ApiPropertyOptional({ description: 'Plan status', enum: PlanStatus })
  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus;

  @ApiPropertyOptional({ description: 'Allocated capacity percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  allocatedCapacityPercentage?: number;

  @ApiPropertyOptional({ description: 'Utilization target' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  utilizationTarget?: number;
}

export class CapacityPlanQueryDto {
  @ApiPropertyOptional({ description: 'Facility ID filter' })
  @IsOptional()
  @IsString()
  facilityId?: string;

  @ApiPropertyOptional({ description: 'Resource type filter', enum: ResourceType })
  @IsOptional()
  @IsEnum(ResourceType)
  resourceType?: ResourceType;

  @ApiPropertyOptional({ description: 'Status filter', enum: PlanStatus })
  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus;

  @ApiPropertyOptional({ description: 'Start date filter', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'End date filter', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Include bottleneck analysis' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeBottlenecks?: boolean;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

// ============== PRODUCTION SCHEDULING DTOs ==============

export class ScheduleTaskDto {
  @ApiProperty({ description: 'Task ID' })
  @IsString()
  @IsNotEmpty()
  taskId: string;

  @ApiProperty({ description: 'Production order ID' })
  @IsString()
  @IsNotEmpty()
  productionOrderId: string;

  @ApiProperty({ description: 'Operation name' })
  @IsString()
  @IsNotEmpty()
  operationName: string;

  @ApiProperty({ description: 'Work center ID' })
  @IsString()
  @IsNotEmpty()
  workCenterId: string;

  @ApiProperty({ description: 'Planned start time', type: String, format: 'date-time' })
  @IsDateString()
  plannedStartTime: string;

  @ApiProperty({ description: 'Planned end time', type: String, format: 'date-time' })
  @IsDateString()
  plannedEndTime: string;

  @ApiProperty({ description: 'Setup duration (minutes)' })
  @IsNumber()
  @Min(0)
  setupDurationMinutes: number;

  @ApiProperty({ description: 'Processing duration (minutes)' })
  @IsNumber()
  @Min(0)
  processingDurationMinutes: number;

  @ApiProperty({ description: 'Priority level', enum: Priority })
  @IsEnum(Priority)
  priority: Priority;

  @ApiPropertyOptional({ description: 'Resource requirements' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceCapacityDto)
  resourceRequirements?: ResourceCapacityDto[];

  @ApiPropertyOptional({ description: 'Predecessor tasks' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  predecessorTasks?: string[];

  @ApiPropertyOptional({ description: 'Successor tasks' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  successorTasks?: string[];
}

export class CreateProductionScheduleDto {
  @ApiProperty({ description: 'Schedule name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  scheduleName: string;

  @ApiProperty({ description: 'Production plan ID' })
  @IsString()
  @IsNotEmpty()
  productionPlanId: string;

  @ApiProperty({ description: 'Scheduling strategy', enum: SchedulingStrategy })
  @IsEnum(SchedulingStrategy)
  schedulingStrategy: SchedulingStrategy;

  @ApiProperty({ description: 'Schedule start date', type: String, format: 'date-time' })
  @IsDateString()
  scheduleStartDate: string;

  @ApiProperty({ description: 'Schedule end date', type: String, format: 'date-time' })
  @IsDateString()
  scheduleEndDate: string;

  @ApiProperty({ description: 'Schedule tasks', type: [ScheduleTaskDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ScheduleTaskDto)
  scheduleTasks: ScheduleTaskDto[];

  @ApiPropertyOptional({ description: 'Scheduling constraints' })
  @IsOptional()
  @IsObject()
  constraints?: {
    workingHours?: { start: string; end: string };
    workingDays?: number[];
    holidays?: string[];
    breakTimes?: Array<{ start: string; end: string }>;
  };

  @ApiPropertyOptional({ description: 'Optimization parameters' })
  @IsOptional()
  @ValidateNested()
  @Type(() => OptimizationParametersDto)
  optimizationParameters?: OptimizationParametersDto;

  @ApiPropertyOptional({ description: 'Allow overtime' })
  @IsOptional()
  @IsBoolean()
  allowOvertime?: boolean;

  @ApiPropertyOptional({ description: 'Maximum overtime hours' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxOvertimeHours?: number;
}

export class UpdateProductionScheduleDto extends PartialType(CreateProductionScheduleDto) {
  @ApiPropertyOptional({ description: 'Schedule status', enum: PlanStatus })
  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus;

  @ApiPropertyOptional({ description: 'Actual start date', type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  actualStartDate?: string;

  @ApiPropertyOptional({ description: 'Actual end date', type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  actualEndDate?: string;

  @ApiPropertyOptional({ description: 'Schedule efficiency score' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  efficiencyScore?: number;
}

export class ScheduleQueryDto {
  @ApiPropertyOptional({ description: 'Production plan ID filter' })
  @IsOptional()
  @IsString()
  productionPlanId?: string;

  @ApiPropertyOptional({ description: 'Work center ID filter' })
  @IsOptional()
  @IsString()
  workCenterId?: string;

  @ApiPropertyOptional({ description: 'Status filter', enum: PlanStatus })
  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus;

  @ApiPropertyOptional({ description: 'Scheduling strategy filter', enum: SchedulingStrategy })
  @IsOptional()
  @IsEnum(SchedulingStrategy)
  strategy?: SchedulingStrategy;

  @ApiPropertyOptional({ description: 'Start date filter', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'End date filter', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

// ============== RESOURCE PLANNING DTOs ==============

export class ResourceRequirementDto {
  @ApiProperty({ description: 'Resource type', enum: ResourceType })
  @IsEnum(ResourceType)
  resourceType: ResourceType;

  @ApiProperty({ description: 'Required quantity' })
  @IsNumber()
  @Min(0)
  requiredQuantity: number;

  @ApiProperty({ description: 'Unit of measurement' })
  @IsString()
  @IsNotEmpty()
  unitOfMeasurement: string;

  @ApiProperty({ description: 'Required date', type: String, format: 'date-time' })
  @IsDateString()
  requiredDate: string;

  @ApiPropertyOptional({ description: 'Resource specifications' })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Alternative resources' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alternatives?: string[];

  @ApiPropertyOptional({ description: 'Critical resource flag' })
  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;
}

export class CreateResourcePlanDto {
  @ApiProperty({ description: 'Resource plan name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  planName: string;

  @ApiProperty({ description: 'Production plan ID' })
  @IsString()
  @IsNotEmpty()
  productionPlanId: string;

  @ApiProperty({ description: 'Planning horizon (days)' })
  @IsNumber()
  @Min(1)
  @Max(365)
  planningHorizonDays: number;

  @ApiProperty({ description: 'Resource requirements', type: [ResourceRequirementDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ResourceRequirementDto)
  resourceRequirements: ResourceRequirementDto[];

  @ApiPropertyOptional({ description: 'Plan priority', enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ description: 'Consider lead times' })
  @IsOptional()
  @IsBoolean()
  considerLeadTimes?: boolean;

  @ApiPropertyOptional({ description: 'Safety stock percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  safetyStockPercentage?: number;
}

export class UpdateResourcePlanDto extends PartialType(CreateResourcePlanDto) {
  @ApiPropertyOptional({ description: 'Plan status', enum: PlanStatus })
  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus;

  @ApiPropertyOptional({ description: 'Resource allocation percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  allocationPercentage?: number;
}

export class ResourcePlanQueryDto {
  @ApiPropertyOptional({ description: 'Production plan ID filter' })
  @IsOptional()
  @IsString()
  productionPlanId?: string;

  @ApiPropertyOptional({ description: 'Resource type filter', enum: ResourceType })
  @IsOptional()
  @IsEnum(ResourceType)
  resourceType?: ResourceType;

  @ApiPropertyOptional({ description: 'Status filter', enum: PlanStatus })
  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus;

  @ApiPropertyOptional({ description: 'Priority filter', enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ description: 'Critical resources only' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  criticalOnly?: boolean;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

// ============== PLANNING ANALYTICS DTOs ==============

export class PlanningAnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'Analysis type' })
  @IsOptional()
  @IsEnum(['performance', 'utilization', 'efficiency', 'bottlenecks', 'forecast_accuracy'])
  analysisType?: 'performance' | 'utilization' | 'efficiency' | 'bottlenecks' | 'forecast_accuracy';

  @ApiPropertyOptional({ description: 'Facility ID filter' })
  @IsOptional()
  @IsString()
  facilityId?: string;

  @ApiPropertyOptional({ description: 'Analysis start date', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Analysis end date', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Time granularity' })
  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly'])
  granularity?: 'daily' | 'weekly' | 'monthly';

  @ApiPropertyOptional({ description: 'Include comparisons' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeComparisons?: boolean;

  @ApiPropertyOptional({ description: 'Include trends' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeTrends?: boolean;
}

// ============== BULK OPERATIONS DTOs ==============

export class BulkPlanOperationDto {
  @ApiProperty({ description: 'Plan IDs to operate on' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsString({ each: true })
  planIds: string[];

  @ApiProperty({ description: 'Operation type' })
  @IsEnum(['approve', 'activate', 'cancel', 'reoptimize', 'update_status'])
  operation: 'approve' | 'activate' | 'cancel' | 'reoptimize' | 'update_status';

  @ApiPropertyOptional({ description: 'Operation parameters' })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Execute in parallel' })
  @IsOptional()
  @IsBoolean()
  parallel?: boolean;

  @ApiPropertyOptional({ description: 'Continue on error' })
  @IsOptional()
  @IsBoolean()
  continueOnError?: boolean;
}

// ============== RESPONSE DTOs ==============

export class PlanSummaryDto {
  @ApiProperty({ description: 'Plan ID' })
  id: string;

  @ApiProperty({ description: 'Plan name' })
  name: string;

  @ApiProperty({ description: 'Plan type', enum: PlanType })
  type: PlanType;

  @ApiProperty({ description: 'Status', enum: PlanStatus })
  status: PlanStatus;

  @ApiProperty({ description: 'Progress percentage (0-1)' })
  progress: number;

  @ApiProperty({ description: 'Total items in plan' })
  totalItems: number;

  @ApiProperty({ description: 'Completed items' })
  completedItems: number;

  @ApiProperty({ description: 'Plan efficiency score (0-1)' })
  efficiencyScore: number;

  @ApiProperty({ description: 'Creation date', type: String, format: 'date-time' })
  createdAt: string;

  @ApiProperty({ description: 'Last updated date', type: String, format: 'date-time' })
  updatedAt: string;
}

export class PlanningDashboardDto {
  @ApiProperty({ description: 'Active plans count' })
  activePlans: number;

  @ApiProperty({ description: 'Pending approvals count' })
  pendingApprovals: number;

  @ApiProperty({ description: 'Completed plans count' })
  completedPlans: number;

  @ApiProperty({ description: 'Overdue plans count' })
  overduePlans: number;

  @ApiProperty({ description: 'Average plan efficiency' })
  avgEfficiency: number;

  @ApiProperty({ description: 'Total resource utilization' })
  resourceUtilization: number;

  @ApiProperty({ description: 'Forecast accuracy average' })
  forecastAccuracy: number;

  @ApiProperty({ description: 'Critical bottlenecks count' })
  criticalBottlenecks: number;
}
