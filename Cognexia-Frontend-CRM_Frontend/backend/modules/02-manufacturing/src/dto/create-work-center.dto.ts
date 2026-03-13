import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject, IsBoolean, IsNumber, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum WorkCenterType {
  GENERAL = 'general',
  REACTION = 'reaction',
  SEPARATION = 'separation',
  MIXING = 'mixing',
  HEATING = 'heating',
  COOLING = 'cooling',
  DRYING = 'drying',
  CRYSTALLIZATION = 'crystallization',
  DISTILLATION = 'distillation',
  EXTRACTION = 'extraction',
  FILTRATION = 'filtration',
  CENTRIFUGATION = 'centrifugation',
  TABLETTING = 'tabletting',
  CAPSULE_FILLING = 'capsule_filling',
  COATING = 'coating',
  GRANULATION = 'granulation',
  BLENDING = 'blending',
  STERILIZATION = 'sterilization',
  LYOPHILIZATION = 'lyophilization',
  MICRONIZATION = 'micronization',
  ASSEMBLY = 'assembly',
  MACHINING = 'machining',
  WELDING = 'welding',
  PAINTING = 'painting',
  TESTING = 'testing',
  INSPECTION = 'inspection',
  PACKAGING = 'packaging',
  STAMPING = 'stamping',
  FORGING = 'forging',
  CASTING = 'casting',
  HEAT_TREATMENT = 'heat_treatment',
  SURFACE_TREATMENT = 'surface_treatment',
  CUTTING = 'cutting',
  DRILLING = 'drilling',
  GRINDING = 'grinding',
  POLISHING = 'polishing',
  BLAST_FURNACE = 'blast_furnace',
  ELECTRIC_ARC_FURNACE = 'electric_arc_furnace',
  LADLE_FURNACE = 'ladle_furnace',
  CONTINUOUS_CASTING = 'continuous_casting',
  HOT_ROLLING = 'hot_rolling',
  COLD_ROLLING = 'cold_rolling',
  GALVANIZING = 'galvanizing',
  PICKLING = 'pickling',
  PCB_FABRICATION = 'pcb_fabrication',
  SMT_ASSEMBLY = 'smt_assembly',
  WAVE_SOLDERING = 'wave_soldering',
  REFLOW_SOLDERING = 'reflow_soldering',
  ICT_TESTING = 'ict_testing',
  FUNCTIONAL_TESTING = 'functional_testing',
  SEMICONDUCTOR_FAB = 'semiconductor_fab',
  WAFER_PROCESSING = 'wafer_processing',
  DIE_BONDING = 'die_bonding',
  WIRE_BONDING = 'wire_bonding',
  ENCAPSULATION = 'encapsulation',
  TRANSFORMER_WINDING = 'transformer_winding',
  MOTOR_ASSEMBLY = 'motor_assembly',
  CABLE_MANUFACTURING = 'cable_manufacturing',
  SWITCH_ASSEMBLY = 'switch_assembly',
  PANEL_ASSEMBLY = 'panel_assembly',
  ELECTRICAL_TESTING = 'electrical_testing',
  INSULATION_TESTING = 'insulation_testing',
  APPLIANCE_ASSEMBLY = 'appliance_assembly',
  FURNITURE_ASSEMBLY = 'furniture_assembly',
  WOOD_PROCESSING = 'wood_processing',
  UPHOLSTERY = 'upholstery',
  FINISHING = 'finishing',
  QUALITY_CONTROL = 'quality_control',
  SPINNING = 'spinning',
  WEAVING = 'weaving',
  KNITTING = 'knitting',
  DYEING = 'dyeing',
  PRINTING = 'printing',
  TEXTILE_FINISHING = 'textile_finishing',
  CUTTING_SEWING = 'cutting_sewing',
  EMBROIDERY = 'embroidery',
  AEROSPACE_MACHINING = 'aerospace_machining',
  COMPOSITE_MANUFACTURING = 'composite_manufacturing',
  PRECISION_ASSEMBLY = 'precision_assembly',
  NDT_TESTING = 'ndt_testing',
  FINAL_INSPECTION = 'final_inspection',
  FLIGHT_TESTING = 'flight_testing'
}

export enum IndustryType {
  GENERAL = 'general',
  REFINERY = 'refinery',
  CHEMICAL = 'chemical',
  PHARMACEUTICAL = 'pharmaceutical',
  AUTOMOTIVE = 'automotive',
  DEFENSE = 'defense',
  FMCG = 'fmcg',
  PESTICIDE = 'pesticide',
  STEEL = 'steel',
  ELECTRONICS = 'electronics',
  TELECOMMUNICATIONS = 'telecommunications',
  ELECTRICAL = 'electrical',
  CONSUMER_GOODS = 'consumer_goods',
  TEXTILE = 'textile',
  PAPER = 'paper',
  PLASTICS = 'plastics',
  CEMENT = 'cement',
  GLASS = 'glass',
  RUBBER = 'rubber',
  LEATHER = 'leather',
  MINING = 'mining',
  METALS = 'metals',
  SHIPBUILDING = 'shipbuilding',
  AEROSPACE = 'aerospace',
  RENEWABLE_ENERGY = 'renewable_energy'
}

export enum WorkCenterStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  BREAKDOWN = 'breakdown',
  SETUP = 'setup'
}

class SafetyRequirements {
  @ApiPropertyOptional({ description: 'Explosion proof requirement' })
  @IsOptional()
  @IsBoolean()
  explosionProof?: boolean;

  @ApiPropertyOptional({ description: 'Hazard classifications' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hazardClassification?: string[];

  @ApiPropertyOptional({ description: 'Pressure rating in PSI' })
  @IsOptional()
  @IsNumber()
  pressureRating?: number;

  @ApiPropertyOptional({ description: 'Temperature range' })
  @IsOptional()
  @IsObject()
  temperatureRange?: { min: number; max: number };
}

class ComplianceInfo {
  @ApiPropertyOptional({ description: 'ISO certifications' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  iso?: string[];

  @ApiPropertyOptional({ description: 'Regulatory compliance' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regulations?: string[];

  @ApiPropertyOptional({ description: 'Last audit date' })
  @IsOptional()
  @IsString()
  lastAudit?: string;
}

export class CreateWorkCenterDto {
  @ApiProperty({ description: 'Work center code (unique identifier)' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Work center name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    description: 'Work center type',
    enum: WorkCenterType
  })
  @IsEnum(WorkCenterType)
  type: WorkCenterType;

  @ApiProperty({ 
    description: 'Industry type',
    enum: IndustryType
  })
  @IsEnum(IndustryType)
  industryType: IndustryType;

  @ApiProperty({ 
    description: 'Work center status',
    enum: WorkCenterStatus
  })
  @IsEnum(WorkCenterStatus)
  status: WorkCenterStatus;

  @ApiPropertyOptional({ description: 'Work center description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Location of the work center' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Capacity of the work center' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  capacity?: number;

  @ApiPropertyOptional({ description: 'Current efficiency percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  efficiency?: number;

  @ApiPropertyOptional({ description: 'Current availability percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  availability?: number;

  @ApiPropertyOptional({ description: 'Current quality percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  quality?: number;

  @ApiPropertyOptional({ description: 'Overall Equipment Effectiveness score' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  oeeScore?: number;

  @ApiPropertyOptional({ description: 'Whether the work center is operational' })
  @IsOptional()
  @IsBoolean()
  isOperational?: boolean;

  @ApiPropertyOptional({ description: 'Work center capabilities' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  capabilities?: string[];

  @ApiPropertyOptional({ description: 'Safety compliance status' })
  @IsOptional()
  @IsBoolean()
  safetyCompliance?: boolean;

  @ApiPropertyOptional({ description: 'GMP compliance (pharmaceutical)' })
  @IsOptional()
  @IsBoolean()
  gmpCompliant?: boolean;

  @ApiPropertyOptional({ description: 'HAZMAT compliance (chemical/refinery)' })
  @IsOptional()
  @IsBoolean()
  hazmatCompliant?: boolean;

  @ApiPropertyOptional({ description: 'Safety requirements' })
  @IsOptional()
  @ValidateNested()
  @Type(() => SafetyRequirements)
  safetyRequirements?: SafetyRequirements;

  @ApiPropertyOptional({ description: 'Compliance information' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ComplianceInfo)
  compliance?: ComplianceInfo;

  @ApiPropertyOptional({ description: 'Industry-specific configuration' })
  @IsOptional()
  @IsObject()
  industrySpecific?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
