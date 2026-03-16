import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject, IsBoolean, IsNumber, IsArray, ValidateNested, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum WorkOrderType {
  PRODUCTION = 'production',
  MAINTENANCE = 'maintenance',
  SETUP = 'setup',
  CHANGEOVER = 'changeover',
  INSPECTION = 'inspection',
  CALIBRATION = 'calibration',
  CLEANING = 'cleaning',
  REWORK = 'rework',
  EMERGENCY = 'emergency'
}

export enum WorkOrderStatus {
  CREATED = 'created',
  PLANNED = 'planned',
  READY = 'ready',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  CLOSED = 'closed'
}

export enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

class WorkInstruction {
  @ApiProperty({ description: 'Instruction sequence number' })
  @IsNumber()
  @Min(1)
  sequence: number;

  @ApiProperty({ description: 'Instruction description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'Estimated time in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedTime?: number;

  @ApiPropertyOptional({ description: 'Required skills' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];

  @ApiPropertyOptional({ description: 'Required tools' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredTools?: string[];

  @ApiPropertyOptional({ description: 'Safety precautions' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  safetyPrecautions?: string[];

  @ApiPropertyOptional({ description: 'Quality checks' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  qualityChecks?: string[];

  @ApiPropertyOptional({ description: 'Instruction attachments' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional({ description: 'Is instruction completed' })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiPropertyOptional({ description: 'Actual time taken in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualTime?: number;

  @ApiPropertyOptional({ description: 'Completion notes' })
  @IsOptional()
  @IsString()
  completionNotes?: string;
}

class ResourceRequirement {
  @ApiProperty({ description: 'Resource type' })
  @IsString()
  @IsNotEmpty()
  resourceType: string;

  @ApiProperty({ description: 'Resource identifier' })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({ description: 'Resource name' })
  @IsString()
  @IsNotEmpty()
  resourceName: string;

  @ApiProperty({ description: 'Required quantity' })
  @IsNumber()
  @Min(0)
  requiredQuantity: number;

  @ApiPropertyOptional({ description: 'Allocated quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  allocatedQuantity?: number;

  @ApiPropertyOptional({ description: 'Availability date' })
  @IsOptional()
  @IsDateString()
  availabilityDate?: string;

  @ApiPropertyOptional({ description: 'Resource cost per unit' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPerUnit?: number;

  @ApiPropertyOptional({ description: 'Total resource cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalCost?: number;

  @ApiPropertyOptional({ description: 'Is resource critical' })
  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;

  @ApiPropertyOptional({ description: 'Alternative resources' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alternatives?: string[];
}

class TimeTracking {
  @ApiPropertyOptional({ description: 'Planned start time' })
  @IsOptional()
  @IsDateString()
  plannedStartTime?: string;

  @ApiPropertyOptional({ description: 'Planned end time' })
  @IsOptional()
  @IsDateString()
  plannedEndTime?: string;

  @ApiPropertyOptional({ description: 'Actual start time' })
  @IsOptional()
  @IsDateString()
  actualStartTime?: string;

  @ApiPropertyOptional({ description: 'Actual end time' })
  @IsOptional()
  @IsDateString()
  actualEndTime?: string;

  @ApiPropertyOptional({ description: 'Estimated duration in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDuration?: number;

  @ApiPropertyOptional({ description: 'Actual duration in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualDuration?: number;

  @ApiPropertyOptional({ description: 'Break time in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  breakTime?: number;

  @ApiPropertyOptional({ description: 'Delay time in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  delayTime?: number;

  @ApiPropertyOptional({ description: 'Delay reasons' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  delayReasons?: string[];
}

export class CreateWorkOrderDto {
  @ApiProperty({ description: 'Work order number (unique identifier)' })
  @IsString()
  @IsNotEmpty()
  workOrderNumber: string;

  @ApiProperty({ description: 'Work order title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ 
    description: 'Work order type',
    enum: WorkOrderType
  })
  @IsEnum(WorkOrderType)
  type: WorkOrderType;

  @ApiProperty({ 
    description: 'Work order status',
    enum: WorkOrderStatus
  })
  @IsEnum(WorkOrderStatus)
  status: WorkOrderStatus;

  @ApiProperty({ 
    description: 'Work order priority',
    enum: Priority
  })
  @IsEnum(Priority)
  priority: Priority;

  @ApiPropertyOptional({ description: 'Work order description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Parent production order ID' })
  @IsOptional()
  @IsString()
  productionOrderId?: string;

  @ApiPropertyOptional({ description: 'Operation sequence number' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  operationSequence?: number;

  @ApiPropertyOptional({ description: 'Work center ID' })
  @IsOptional()
  @IsString()
  workCenterId?: string;

  @ApiPropertyOptional({ description: 'Production line ID' })
  @IsOptional()
  @IsString()
  productionLineId?: string;

  @ApiPropertyOptional({ description: 'Equipment ID' })
  @IsOptional()
  @IsString()
  equipmentId?: string;

  @ApiPropertyOptional({ description: 'Routing operation ID' })
  @IsOptional()
  @IsString()
  routingOperationId?: string;

  @ApiProperty({ 
    description: 'Work instructions',
    type: [WorkInstruction]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkInstruction)
  workInstructions: WorkInstruction[];

  @ApiPropertyOptional({ 
    description: 'Resource requirements',
    type: [ResourceRequirement]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceRequirement)
  resourceRequirements?: ResourceRequirement[];

  @ApiPropertyOptional({ description: 'Time tracking' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeTracking)
  timeTracking?: TimeTracking;

  @ApiPropertyOptional({ description: 'Assigned operator ID' })
  @IsOptional()
  @IsString()
  assignedOperator?: string;

  @ApiPropertyOptional({ description: 'Assigned team IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assignedTeam?: string[];

  @ApiPropertyOptional({ description: 'Supervisor ID' })
  @IsOptional()
  @IsString()
  supervisorId?: string;

  @ApiPropertyOptional({ description: 'Required skills' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];

  @ApiPropertyOptional({ description: 'Required certifications' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredCertifications?: string[];

  @ApiPropertyOptional({ description: 'Safety requirements' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  safetyRequirements?: string[];

  @ApiPropertyOptional({ description: 'Quality standards' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  qualityStandards?: string[];

  @ApiPropertyOptional({ description: 'Environmental conditions' })
  @IsOptional()
  @IsObject()
  environmentalConditions?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Completion percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  completionPercentage?: number;

  @ApiPropertyOptional({ description: 'Quantity to process' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantityToProcess?: number;

  @ApiPropertyOptional({ description: 'Quantity completed' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantityCompleted?: number;

  @ApiPropertyOptional({ description: 'Unit of measure' })
  @IsOptional()
  @IsString()
  unitOfMeasure?: string;

  @ApiPropertyOptional({ description: 'Quality score' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore?: number;

  @ApiPropertyOptional({ description: 'Efficiency score' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  efficiencyScore?: number;

  @ApiPropertyOptional({ description: 'Cost estimate' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costEstimate?: number;

  @ApiPropertyOptional({ description: 'Actual cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualCost?: number;

  @ApiPropertyOptional({ description: 'Customer order reference' })
  @IsOptional()
  @IsString()
  customerOrderRef?: string;

  @ApiPropertyOptional({ description: 'Special instructions' })
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @ApiPropertyOptional({ description: 'Predecessor work orders' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  predecessors?: string[];

  @ApiPropertyOptional({ description: 'Successor work orders' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  successors?: string[];

  @ApiPropertyOptional({ description: 'Dependencies' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependencies?: string[];

  @ApiPropertyOptional({ description: 'Issue tracking' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  issues?: string[];

  @ApiPropertyOptional({ description: 'Progress notes' })
  @IsOptional()
  @IsString()
  progressNotes?: string;

  @ApiPropertyOptional({ description: 'Completion notes' })
  @IsOptional()
  @IsString()
  completionNotes?: string;

  @ApiPropertyOptional({ description: 'Work order attachments' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional({ description: 'Is emergency work order' })
  @IsOptional()
  @IsBoolean()
  isEmergency?: boolean;

  @ApiPropertyOptional({ description: 'Requires approval' })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiPropertyOptional({ description: 'Approved by' })
  @IsOptional()
  @IsString()
  approvedBy?: string;

  @ApiPropertyOptional({ description: 'Approval date' })
  @IsOptional()
  @IsDateString()
  approvalDate?: string;

  @ApiPropertyOptional({ description: 'Work order metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
