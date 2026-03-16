import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject, IsBoolean, IsNumber, IsArray, ValidateNested, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ProductionOrderType {
  STANDARD = 'standard',
  BATCH = 'batch',
  CONTINUOUS = 'continuous',
  MAKE_TO_ORDER = 'make_to_order',
  MAKE_TO_STOCK = 'make_to_stock',
  ASSEMBLE_TO_ORDER = 'assemble_to_order',
  ENGINEER_TO_ORDER = 'engineer_to_order',
  REWORK = 'rework',
  PROTOTYPE = 'prototype',
  TRIAL = 'trial'
}

export enum ProductionOrderStatus {
  DRAFT = 'draft',
  PLANNED = 'planned',
  RELEASED = 'released',
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

export enum UnitOfMeasure {
  PIECES = 'pieces',
  KILOGRAMS = 'kilograms',
  LITERS = 'liters',
  METERS = 'meters',
  HOURS = 'hours',
  TONS = 'tons',
  GALLONS = 'gallons'
}

class MaterialRequirement {
  @ApiProperty({ description: 'Material item code' })
  @IsString()
  @IsNotEmpty()
  itemCode: string;

  @ApiProperty({ description: 'Material item name' })
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @ApiProperty({ description: 'Required quantity' })
  @IsNumber()
  @Min(0)
  requiredQuantity: number;

  @ApiProperty({ 
    description: 'Unit of measure',
    enum: UnitOfMeasure
  })
  @IsEnum(UnitOfMeasure)
  unitOfMeasure: UnitOfMeasure;

  @ApiPropertyOptional({ description: 'Allocated quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  allocatedQuantity?: number;

  @ApiPropertyOptional({ description: 'Consumed quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  consumedQuantity?: number;

  @ApiPropertyOptional({ description: 'Material availability date' })
  @IsOptional()
  @IsDateString()
  availabilityDate?: string;

  @ApiPropertyOptional({ description: 'Material warehouse location' })
  @IsOptional()
  @IsString()
  warehouseLocation?: string;

  @ApiPropertyOptional({ description: 'Batch/Lot number' })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiPropertyOptional({ description: 'Material notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

class QualityRequirement {
  @ApiProperty({ description: 'Quality parameter name' })
  @IsString()
  @IsNotEmpty()
  parameter: string;

  @ApiProperty({ description: 'Target value' })
  @IsString()
  @IsNotEmpty()
  targetValue: string;

  @ApiPropertyOptional({ description: 'Tolerance' })
  @IsOptional()
  @IsString()
  tolerance?: string;

  @ApiPropertyOptional({ description: 'Test method' })
  @IsOptional()
  @IsString()
  testMethod?: string;

  @ApiPropertyOptional({ description: 'Inspection frequency' })
  @IsOptional()
  @IsString()
  inspectionFrequency?: string;

  @ApiPropertyOptional({ description: 'Is critical quality parameter' })
  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;
}

class ProductionSchedule {
  @ApiProperty({ description: 'Planned start date' })
  @IsDateString()
  plannedStartDate: string;

  @ApiProperty({ description: 'Planned end date' })
  @IsDateString()
  plannedEndDate: string;

  @ApiPropertyOptional({ description: 'Actual start date' })
  @IsOptional()
  @IsDateString()
  actualStartDate?: string;

  @ApiPropertyOptional({ description: 'Actual end date' })
  @IsOptional()
  @IsDateString()
  actualEndDate?: string;

  @ApiPropertyOptional({ description: 'Estimated duration in hours' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDuration?: number;

  @ApiPropertyOptional({ description: 'Actual duration in hours' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualDuration?: number;

  @ApiPropertyOptional({ description: 'Production shift' })
  @IsOptional()
  @IsString()
  shift?: string;

  @ApiPropertyOptional({ description: 'Scheduling constraints' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  constraints?: string[];
}

class CostTracking {
  @ApiPropertyOptional({ description: 'Planned material cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  plannedMaterialCost?: number;

  @ApiPropertyOptional({ description: 'Actual material cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualMaterialCost?: number;

  @ApiPropertyOptional({ description: 'Planned labor cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  plannedLaborCost?: number;

  @ApiPropertyOptional({ description: 'Actual labor cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualLaborCost?: number;

  @ApiPropertyOptional({ description: 'Planned overhead cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  plannedOverheadCost?: number;

  @ApiPropertyOptional({ description: 'Actual overhead cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualOverheadCost?: number;

  @ApiPropertyOptional({ description: 'Total planned cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalPlannedCost?: number;

  @ApiPropertyOptional({ description: 'Total actual cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalActualCost?: number;

  @ApiPropertyOptional({ description: 'Cost variance' })
  @IsOptional()
  @IsNumber()
  costVariance?: number;

  @ApiPropertyOptional({ description: 'Cost variance percentage' })
  @IsOptional()
  @IsNumber()
  costVariancePercentage?: number;
}

export class CreateProductionOrderDto {
  @ApiProperty({ description: 'Production order number (unique identifier)' })
  @IsString()
  @IsNotEmpty()
  orderNumber: string;

  @ApiProperty({ description: 'Production order name' })
  @IsString()
  @IsNotEmpty()
  orderName: string;

  @ApiProperty({ 
    description: 'Production order type',
    enum: ProductionOrderType
  })
  @IsEnum(ProductionOrderType)
  orderType: ProductionOrderType;

  @ApiProperty({ 
    description: 'Production order status',
    enum: ProductionOrderStatus
  })
  @IsEnum(ProductionOrderStatus)
  status: ProductionOrderStatus;

  @ApiProperty({ 
    description: 'Order priority',
    enum: Priority
  })
  @IsEnum(Priority)
  priority: Priority;

  @ApiPropertyOptional({ description: 'Production order description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Product code to be manufactured' })
  @IsString()
  @IsNotEmpty()
  productCode: string;

  @ApiProperty({ description: 'Product name to be manufactured' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ description: 'Planned quantity to produce' })
  @IsNumber()
  @Min(0.01)
  plannedQuantity: number;

  @ApiProperty({ 
    description: 'Unit of measure for quantity',
    enum: UnitOfMeasure
  })
  @IsEnum(UnitOfMeasure)
  unitOfMeasure: UnitOfMeasure;

  @ApiPropertyOptional({ description: 'Actual quantity produced' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualQuantity?: number;

  @ApiPropertyOptional({ description: 'Good quantity (within specification)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  goodQuantity?: number;

  @ApiPropertyOptional({ description: 'Rejected quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rejectedQuantity?: number;

  @ApiPropertyOptional({ description: 'Scrap quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  scrapQuantity?: number;

  @ApiPropertyOptional({ description: 'Rework quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reworkQuantity?: number;

  @ApiProperty({ description: 'Bill of Materials ID' })
  @IsString()
  @IsNotEmpty()
  bomId: string;

  @ApiPropertyOptional({ description: 'BOM version' })
  @IsOptional()
  @IsString()
  bomVersion?: string;

  @ApiPropertyOptional({ description: 'Production routing ID' })
  @IsOptional()
  @IsString()
  routingId?: string;

  @ApiPropertyOptional({ description: 'Work center ID' })
  @IsOptional()
  @IsString()
  workCenterId?: string;

  @ApiPropertyOptional({ description: 'Production line ID' })
  @IsOptional()
  @IsString()
  productionLineId?: string;

  @ApiPropertyOptional({ description: 'Customer order reference' })
  @IsOptional()
  @IsString()
  customerOrderRef?: string;

  @ApiPropertyOptional({ description: 'Sales order line reference' })
  @IsOptional()
  @IsString()
  salesOrderLineRef?: string;

  @ApiProperty({ 
    description: 'Production schedule',
    type: ProductionSchedule
  })
  @ValidateNested()
  @Type(() => ProductionSchedule)
  schedule: ProductionSchedule;

  @ApiPropertyOptional({ 
    description: 'Material requirements',
    type: [MaterialRequirement]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialRequirement)
  materialRequirements?: MaterialRequirement[];

  @ApiPropertyOptional({ 
    description: 'Quality requirements',
    type: [QualityRequirement]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualityRequirement)
  qualityRequirements?: QualityRequirement[];

  @ApiPropertyOptional({ description: 'Cost tracking' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CostTracking)
  costTracking?: CostTracking;

  @ApiPropertyOptional({ description: 'Production instructions' })
  @IsOptional()
  @IsString()
  productionInstructions?: string;

  @ApiPropertyOptional({ description: 'Special instructions' })
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @ApiPropertyOptional({ description: 'Safety requirements' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  safetyRequirements?: string[];

  @ApiPropertyOptional({ description: 'Environmental requirements' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  environmentalRequirements?: string[];

  @ApiPropertyOptional({ description: 'Required certifications' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredCertifications?: string[];

  @ApiPropertyOptional({ description: 'Lot/Batch number' })
  @IsOptional()
  @IsString()
  lotNumber?: string;

  @ApiPropertyOptional({ description: 'Serial number range' })
  @IsOptional()
  @IsString()
  serialNumberRange?: string;

  @ApiPropertyOptional({ description: 'Manufacturing engineer' })
  @IsOptional()
  @IsString()
  manufacturingEngineer?: string;

  @ApiPropertyOptional({ description: 'Production supervisor' })
  @IsOptional()
  @IsString()
  productionSupervisor?: string;

  @ApiPropertyOptional({ description: 'Quality engineer' })
  @IsOptional()
  @IsString()
  qualityEngineer?: string;

  @ApiPropertyOptional({ description: 'Parent production order (for sub-orders)' })
  @IsOptional()
  @IsString()
  parentOrderId?: string;

  @ApiPropertyOptional({ description: 'Child production orders' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  childOrderIds?: string[];

  @ApiPropertyOptional({ description: 'Order completion percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  completionPercentage?: number;

  @ApiPropertyOptional({ description: 'Order progress notes' })
  @IsOptional()
  @IsString()
  progressNotes?: string;

  @ApiPropertyOptional({ description: 'Customer delivery date' })
  @IsOptional()
  @IsDateString()
  customerDeliveryDate?: string;

  @ApiPropertyOptional({ description: 'Whether order is rush/urgent' })
  @IsOptional()
  @IsBoolean()
  isRush?: boolean;

  @ApiPropertyOptional({ description: 'Whether order requires special handling' })
  @IsOptional()
  @IsBoolean()
  requiresSpecialHandling?: boolean;

  @ApiPropertyOptional({ description: 'Order attachments (file URLs)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional({ description: 'Order metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
