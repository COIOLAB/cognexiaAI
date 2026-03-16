import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject, IsBoolean, IsNumber, IsArray, ValidateNested, Min, Max, IsDateString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BOMType {
  PRODUCTION = 'production',
  ENGINEERING = 'engineering',
  SALES = 'sales',
  COSTING = 'costing',
  PHANTOM = 'phantom',
  TEMPLATE = 'template',
  VARIANT = 'variant'
}

export enum BOMStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OBSOLETE = 'obsolete',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum ComponentType {
  RAW_MATERIAL = 'raw_material',
  PURCHASED_PART = 'purchased_part',
  MANUFACTURED_PART = 'manufactured_part',
  ASSEMBLY = 'assembly',
  SUBASSEMBLY = 'subassembly',
  CONSUMABLE = 'consumable',
  TOOL = 'tool',
  FIXTURE = 'fixture',
  PACKAGING = 'packaging'
}

export enum UnitOfMeasure {
  PIECES = 'pieces',
  KILOGRAMS = 'kilograms',
  GRAMS = 'grams',
  POUNDS = 'pounds',
  OUNCES = 'ounces',
  LITERS = 'liters',
  MILLILITERS = 'milliliters',
  GALLONS = 'gallons',
  METERS = 'meters',
  CENTIMETERS = 'centimeters',
  INCHES = 'inches',
  FEET = 'feet',
  SQUARE_METERS = 'square_meters',
  SQUARE_FEET = 'square_feet',
  CUBIC_METERS = 'cubic_meters',
  CUBIC_FEET = 'cubic_feet',
  HOURS = 'hours',
  MINUTES = 'minutes'
}

class BOMComponent {
  @ApiProperty({ description: 'Component item code or SKU' })
  @IsString()
  @IsNotEmpty()
  itemCode: string;

  @ApiProperty({ description: 'Component item name' })
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @ApiProperty({ 
    description: 'Component type',
    enum: ComponentType
  })
  @IsEnum(ComponentType)
  componentType: ComponentType;

  @ApiProperty({ description: 'Quantity required' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ 
    description: 'Unit of measure',
    enum: UnitOfMeasure
  })
  @IsEnum(UnitOfMeasure)
  unitOfMeasure: UnitOfMeasure;

  @ApiPropertyOptional({ description: 'Component description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Reference designator' })
  @IsOptional()
  @IsString()
  referenceDesignator?: string;

  @ApiPropertyOptional({ description: 'Unit cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @ApiPropertyOptional({ description: 'Extended cost (quantity * unit cost)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  extendedCost?: number;

  @ApiPropertyOptional({ description: 'Scrap allowance percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  scrapAllowance?: number;

  @ApiPropertyOptional({ description: 'Lead time in days' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  leadTime?: number;

  @ApiPropertyOptional({ description: 'Whether component is critical' })
  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;

  @ApiPropertyOptional({ description: 'Whether component is optional' })
  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;

  @ApiPropertyOptional({ description: 'Supplier information' })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiPropertyOptional({ description: 'Supplier part number' })
  @IsOptional()
  @IsString()
  supplierPartNumber?: string;

  @ApiPropertyOptional({ description: 'Substitute components' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  substitutes?: string[];

  @ApiPropertyOptional({ description: 'Assembly level in BOM hierarchy' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  level?: number;

  @ApiPropertyOptional({ description: 'Operation sequence number' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  operationSequence?: number;

  @ApiPropertyOptional({ description: 'Position in assembly' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ description: 'Engineering change number' })
  @IsOptional()
  @IsString()
  engineeringChange?: string;

  @ApiPropertyOptional({ description: 'Effective from date' })
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @ApiPropertyOptional({ description: 'Effective to date' })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiPropertyOptional({ description: 'Component notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Component metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

class CostBreakdown {
  @ApiPropertyOptional({ description: 'Material cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  materialCost?: number;

  @ApiPropertyOptional({ description: 'Labor cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  laborCost?: number;

  @ApiPropertyOptional({ description: 'Overhead cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  overheadCost?: number;

  @ApiPropertyOptional({ description: 'Subcontractor cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  subcontractorCost?: number;

  @ApiPropertyOptional({ description: 'Total cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalCost?: number;

  @ApiPropertyOptional({ description: 'Cost per unit' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPerUnit?: number;
}

class QualitySpecifications {
  @ApiPropertyOptional({ description: 'Quality standards' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  standards?: string[];

  @ApiPropertyOptional({ description: 'Inspection requirements' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  inspectionRequirements?: string[];

  @ApiPropertyOptional({ description: 'Test procedures' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  testProcedures?: string[];

  @ApiPropertyOptional({ description: 'Acceptance criteria' })
  @IsOptional()
  @IsString()
  acceptanceCriteria?: string;

  @ApiPropertyOptional({ description: 'Quality documentation' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  qualityDocumentation?: string[];
}

export class CreateBillOfMaterialsDto {
  @ApiProperty({ description: 'BOM number (unique identifier)' })
  @IsString()
  @IsNotEmpty()
  bomNumber: string;

  @ApiProperty({ description: 'BOM name' })
  @IsString()
  @IsNotEmpty()
  bomName: string;

  @ApiProperty({ description: 'Product code or SKU for finished item' })
  @IsString()
  @IsNotEmpty()
  productCode: string;

  @ApiProperty({ description: 'Product name for finished item' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ 
    description: 'BOM type',
    enum: BOMType
  })
  @IsEnum(BOMType)
  bomType: BOMType;

  @ApiProperty({ 
    description: 'BOM status',
    enum: BOMStatus
  })
  @IsEnum(BOMStatus)
  status: BOMStatus;

  @ApiPropertyOptional({ description: 'BOM description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'BOM version' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({ description: 'BOM revision' })
  @IsString()
  @IsNotEmpty()
  revision: string;

  @ApiProperty({ description: 'Base quantity for BOM' })
  @IsNumber()
  @Min(0.01)
  baseQuantity: number;

  @ApiProperty({ 
    description: 'Unit of measure for base quantity',
    enum: UnitOfMeasure
  })
  @IsEnum(UnitOfMeasure)
  baseUnitOfMeasure: UnitOfMeasure;

  @ApiProperty({ 
    description: 'BOM components',
    type: [BOMComponent]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BOMComponent)
  components: BOMComponent[];

  @ApiPropertyOptional({ description: 'Manufacturing method' })
  @IsOptional()
  @IsString()
  manufacturingMethod?: string;

  @ApiPropertyOptional({ description: 'Assembly instructions' })
  @IsOptional()
  @IsString()
  assemblyInstructions?: string;

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

  @ApiPropertyOptional({ description: 'Engineering change number' })
  @IsOptional()
  @IsString()
  engineeringChangeNumber?: string;

  @ApiPropertyOptional({ description: 'Design engineer' })
  @IsOptional()
  @IsString()
  designEngineer?: string;

  @ApiPropertyOptional({ description: 'Manufacturing engineer' })
  @IsOptional()
  @IsString()
  manufacturingEngineer?: string;

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

  @ApiPropertyOptional({ description: 'Whether BOM is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Whether BOM is configurable' })
  @IsOptional()
  @IsBoolean()
  isConfigurable?: boolean;

  @ApiPropertyOptional({ description: 'Configuration rules' })
  @IsOptional()
  @IsObject()
  configurationRules?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Cost breakdown' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CostBreakdown)
  costBreakdown?: CostBreakdown;

  @ApiPropertyOptional({ description: 'Quality specifications' })
  @IsOptional()
  @ValidateNested()
  @Type(() => QualitySpecifications)
  qualitySpecifications?: QualitySpecifications;

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

  @ApiPropertyOptional({ description: 'Regulatory compliance' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regulatoryCompliance?: string[];

  @ApiPropertyOptional({ description: 'Manufacturing lead time in days' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  manufacturingLeadTime?: number;

  @ApiPropertyOptional({ description: 'Procurement lead time in days' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  procurementLeadTime?: number;

  @ApiPropertyOptional({ description: 'Yield percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  yieldPercentage?: number;

  @ApiPropertyOptional({ description: 'Scrap rate percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  scrapRate?: number;

  @ApiPropertyOptional({ description: 'Alternative BOMs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alternativeBoms?: string[];

  @ApiPropertyOptional({ description: 'Parent BOM (for sub-assemblies)' })
  @IsOptional()
  @IsString()
  parentBom?: string;

  @ApiPropertyOptional({ description: 'Child BOMs (for sub-assemblies)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  childBoms?: string[];

  @ApiPropertyOptional({ description: 'BOM category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'BOM classification' })
  @IsOptional()
  @IsString()
  classification?: string;

  @ApiPropertyOptional({ description: 'Manufacturing batch size' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  batchSize?: number;

  @ApiPropertyOptional({ description: 'Planning horizon in days' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  planningHorizon?: number;

  @ApiPropertyOptional({ description: 'BOM notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Attachments (file URLs)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional({ description: 'BOM metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
