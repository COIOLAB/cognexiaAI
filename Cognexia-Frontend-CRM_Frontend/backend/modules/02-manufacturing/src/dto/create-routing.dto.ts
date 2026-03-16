import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject, IsBoolean, IsNumber, IsArray, ValidateNested, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RoutingType {
  STANDARD = 'standard',
  ALTERNATE = 'alternate',
  PREFERRED = 'preferred',
  PROTOTYPE = 'prototype',
  REWORK = 'rework',
  SETUP = 'setup'
}

export enum RoutingStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OBSOLETE = 'obsolete',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved'
}

export enum OperationType {
  SETUP = 'setup',
  MACHINING = 'machining',
  ASSEMBLY = 'assembly',
  INSPECTION = 'inspection',
  TESTING = 'testing',
  PACKAGING = 'packaging',
  TRANSPORT = 'transport',
  QUALITY_CHECK = 'quality_check',
  MAINTENANCE = 'maintenance',
  CHANGEOVER = 'changeover'
}

class RoutingOperation {
  @ApiProperty({ description: 'Operation sequence number' })
  @IsNumber()
  @Min(1)
  operationNumber: number;

  @ApiProperty({ description: 'Operation name' })
  @IsString()
  @IsNotEmpty()
  operationName: string;

  @ApiProperty({ 
    description: 'Operation type',
    enum: OperationType
  })
  @IsEnum(OperationType)
  operationType: OperationType;

  @ApiPropertyOptional({ description: 'Operation description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Work center ID where operation is performed' })
  @IsString()
  @IsNotEmpty()
  workCenterId: string;

  @ApiPropertyOptional({ description: 'Equipment ID required for operation' })
  @IsOptional()
  @IsString()
  equipmentId?: string;

  @ApiProperty({ description: 'Setup time in minutes' })
  @IsNumber()
  @Min(0)
  setupTime: number;

  @ApiProperty({ description: 'Run time per unit in minutes' })
  @IsNumber()
  @Min(0)
  runTime: number;

  @ApiPropertyOptional({ description: 'Teardown time in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  teardownTime?: number;

  @ApiPropertyOptional({ description: 'Wait time before operation in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  waitTime?: number;

  @ApiPropertyOptional({ description: 'Move time to next operation in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  moveTime?: number;

  @ApiPropertyOptional({ description: 'Queue time in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  queueTime?: number;

  @ApiProperty({ description: 'Required labor hours' })
  @IsNumber()
  @Min(0)
  laborHours: number;

  @ApiProperty({ description: 'Machine hours required' })
  @IsNumber()
  @Min(0)
  machineHours: number;

  @ApiPropertyOptional({ description: 'Number of operators required' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  operatorsRequired?: number;

  @ApiPropertyOptional({ description: 'Required skills for operation' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];

  @ApiPropertyOptional({ description: 'Required certifications' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredCertifications?: string[];

  @ApiPropertyOptional({ description: 'Required tools' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredTools?: string[];

  @ApiPropertyOptional({ description: 'Work instructions' })
  @IsOptional()
  @IsString()
  workInstructions?: string;

  @ApiPropertyOptional({ description: 'Quality standards for operation' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  qualityStandards?: string[];

  @ApiPropertyOptional({ description: 'Safety requirements' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  safetyRequirements?: string[];

  @ApiPropertyOptional({ description: 'Standard cost for operation' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  standardCost?: number;

  @ApiPropertyOptional({ description: 'Overhead rate percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  overheadRate?: number;

  @ApiPropertyOptional({ description: 'Scrap percentage expected' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  scrapPercentage?: number;

  @ApiPropertyOptional({ description: 'Whether operation is parallel' })
  @IsOptional()
  @IsBoolean()
  isParallel?: boolean;

  @ApiPropertyOptional({ description: 'Whether operation is critical path' })
  @IsOptional()
  @IsBoolean()
  isCriticalPath?: boolean;

  @ApiPropertyOptional({ description: 'Predecessor operation numbers' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  predecessors?: number[];

  @ApiPropertyOptional({ description: 'Operation notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Operation metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CreateRoutingDto {
  @ApiProperty({ description: 'Routing number (unique identifier)' })
  @IsString()
  @IsNotEmpty()
  routingNumber: string;

  @ApiProperty({ description: 'Routing name' })
  @IsString()
  @IsNotEmpty()
  routingName: string;

  @ApiProperty({ 
    description: 'Routing type',
    enum: RoutingType
  })
  @IsEnum(RoutingType)
  routingType: RoutingType;

  @ApiProperty({ 
    description: 'Routing status',
    enum: RoutingStatus
  })
  @IsEnum(RoutingStatus)
  status: RoutingStatus;

  @ApiPropertyOptional({ description: 'Routing description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Product code this routing applies to' })
  @IsString()
  @IsNotEmpty()
  productCode: string;

  @ApiProperty({ description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ description: 'BOM ID associated with this routing' })
  @IsString()
  @IsNotEmpty()
  bomId: string;

  @ApiProperty({ description: 'Routing version' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({ description: 'Routing revision' })
  @IsString()
  @IsNotEmpty()
  revision: string;

  @ApiProperty({ 
    description: 'Routing operations',
    type: [RoutingOperation]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutingOperation)
  operations: RoutingOperation[];

  @ApiPropertyOptional({ description: 'Base lot size for routing' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  baseLotSize?: number;

  @ApiPropertyOptional({ description: 'Total lead time in hours' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalLeadTime?: number;

  @ApiPropertyOptional({ description: 'Total labor hours' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalLaborHours?: number;

  @ApiPropertyOptional({ description: 'Total machine hours' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalMachineHours?: number;

  @ApiPropertyOptional({ description: 'Total standard cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalStandardCost?: number;

  @ApiPropertyOptional({ description: 'Manufacturing engineer' })
  @IsOptional()
  @IsString()
  manufacturingEngineer?: string;

  @ApiPropertyOptional({ description: 'Process engineer' })
  @IsOptional()
  @IsString()
  processEngineer?: string;

  @ApiPropertyOptional({ description: 'Approved by' })
  @IsOptional()
  @IsString()
  approvedBy?: string;

  @ApiPropertyOptional({ description: 'Approval date' })
  @IsOptional()
  @IsDateString()
  approvalDate?: string;

  @ApiPropertyOptional({ description: 'Effective from date' })
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @ApiPropertyOptional({ description: 'Effective to date' })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiPropertyOptional({ description: 'Whether routing is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Alternative routing IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alternativeRoutings?: string[];

  @ApiPropertyOptional({ description: 'Parent routing for variants' })
  @IsOptional()
  @IsString()
  parentRouting?: string;

  @ApiPropertyOptional({ description: 'Routing category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Routing complexity level' })
  @IsOptional()
  @IsString()
  complexityLevel?: string;

  @ApiPropertyOptional({ description: 'Industry-specific requirements' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  industryRequirements?: string[];

  @ApiPropertyOptional({ description: 'Environmental considerations' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  environmentalConsiderations?: string[];

  @ApiPropertyOptional({ description: 'Routing notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Routing attachments' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional({ description: 'Routing metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
