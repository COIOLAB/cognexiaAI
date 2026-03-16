import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject, IsBoolean, IsNumber, IsArray, ValidateNested, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ProductionLineType {
  ASSEMBLY = 'assembly',
  MANUFACTURING = 'manufacturing',
  PACKAGING = 'packaging',
  TESTING = 'testing',
  INSPECTION = 'inspection',
  PROCESSING = 'processing',
  MIXING = 'mixing',
  COATING = 'coating',
  WELDING = 'welding',
  MACHINING = 'machining',
  AUTOMATION = 'automation',
  ROBOTICS = 'robotics',
  CONTINUOUS = 'continuous',
  BATCH = 'batch',
  HYBRID = 'hybrid'
}

export enum ProductionLineStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  BREAKDOWN = 'breakdown',
  SETUP = 'setup',
  CHANGEOVER = 'changeover',
  IDLE = 'idle',
  EMERGENCY_STOP = 'emergency_stop'
}

export enum AutomationLevel {
  MANUAL = 'manual',
  SEMI_AUTOMATED = 'semi_automated',
  AUTOMATED = 'automated',
  FULLY_AUTOMATED = 'fully_automated',
  SMART = 'smart',
  AUTONOMOUS = 'autonomous'
}

class QualityRequirements {
  @ApiPropertyOptional({ description: 'Quality standards' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  standards?: string[];

  @ApiPropertyOptional({ description: 'Defect tolerance percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defectTolerance?: number;

  @ApiPropertyOptional({ description: 'Quality control points' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  controlPoints?: string[];

  @ApiPropertyOptional({ description: 'Inspection frequency' })
  @IsOptional()
  @IsString()
  inspectionFrequency?: string;
}

class PerformanceMetrics {
  @ApiPropertyOptional({ description: 'Target throughput per hour' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetThroughput?: number;

  @ApiPropertyOptional({ description: 'Target efficiency percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  targetEfficiency?: number;

  @ApiPropertyOptional({ description: 'Target OEE score' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  targetOee?: number;

  @ApiPropertyOptional({ description: 'Cycle time in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cycleTime?: number;

  @ApiPropertyOptional({ description: 'Setup time in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  setupTime?: number;
}

class Industry40Features {
  @ApiPropertyOptional({ description: 'IoT integration enabled' })
  @IsOptional()
  @IsBoolean()
  iotEnabled?: boolean;

  @ApiPropertyOptional({ description: 'AI/ML capabilities enabled' })
  @IsOptional()
  @IsBoolean()
  aiEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Digital twin integration' })
  @IsOptional()
  @IsBoolean()
  digitalTwinEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Predictive maintenance enabled' })
  @IsOptional()
  @IsBoolean()
  predictiveMaintenanceEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Real-time monitoring enabled' })
  @IsOptional()
  @IsBoolean()
  realTimeMonitoringEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Augmented reality support' })
  @IsOptional()
  @IsBoolean()
  arSupport?: boolean;

  @ApiPropertyOptional({ description: 'Virtual reality training' })
  @IsOptional()
  @IsBoolean()
  vrTraining?: boolean;
}

export class CreateProductionLineDto {
  @ApiProperty({ description: 'Production line code (unique identifier)' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Production line name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    description: 'Production line type',
    enum: ProductionLineType
  })
  @IsEnum(ProductionLineType)
  type: ProductionLineType;

  @ApiProperty({ 
    description: 'Production line status',
    enum: ProductionLineStatus
  })
  @IsEnum(ProductionLineStatus)
  status: ProductionLineStatus;

  @ApiPropertyOptional({ description: 'Production line description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Location of the production line' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Factory or plant identifier' })
  @IsOptional()
  @IsString()
  factory?: string;

  @ApiPropertyOptional({ description: 'Department or division' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ 
    description: 'Automation level',
    enum: AutomationLevel
  })
  @IsOptional()
  @IsEnum(AutomationLevel)
  automationLevel?: AutomationLevel;

  @ApiPropertyOptional({ description: 'Production capacity per hour' })
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

  @ApiPropertyOptional({ description: 'Total downtime in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalDowntime?: number;

  @ApiPropertyOptional({ description: 'Planned downtime in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  plannedDowntime?: number;

  @ApiPropertyOptional({ description: 'Unplanned downtime in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unplannedDowntime?: number;

  @ApiPropertyOptional({ description: 'Whether the production line is operational' })
  @IsOptional()
  @IsBoolean()
  isOperational?: boolean;

  @ApiPropertyOptional({ description: 'Products that can be manufactured' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  products?: string[];

  @ApiPropertyOptional({ description: 'Required skills for operators' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];

  @ApiPropertyOptional({ description: 'Safety certifications required' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  safetyCertifications?: string[];

  @ApiPropertyOptional({ description: 'Environmental compliance status' })
  @IsOptional()
  @IsBoolean()
  environmentalCompliance?: boolean;

  @ApiPropertyOptional({ description: 'Energy efficiency rating' })
  @IsOptional()
  @IsString()
  energyEfficiencyRating?: string;

  @ApiPropertyOptional({ description: 'Carbon footprint (kg CO2 per unit)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  carbonFootprint?: number;

  @ApiPropertyOptional({ description: 'Quality requirements' })
  @IsOptional()
  @ValidateNested()
  @Type(() => QualityRequirements)
  qualityRequirements?: QualityRequirements;

  @ApiPropertyOptional({ description: 'Performance metrics' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PerformanceMetrics)
  performanceMetrics?: PerformanceMetrics;

  @ApiPropertyOptional({ description: 'Industry 4.0 features' })
  @IsOptional()
  @ValidateNested()
  @Type(() => Industry40Features)
  industry40Features?: Industry40Features;

  @ApiPropertyOptional({ description: 'Line-specific configuration' })
  @IsOptional()
  @IsObject()
  lineSpecific?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Work center IDs associated with this line' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workCenterIds?: string[];

  @ApiPropertyOptional({ description: 'Equipment IDs associated with this line' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipmentIds?: string[];

  @ApiPropertyOptional({ description: 'Next maintenance date' })
  @IsOptional()
  @IsDateString()
  nextMaintenanceDate?: string;

  @ApiPropertyOptional({ description: 'Last maintenance date' })
  @IsOptional()
  @IsDateString()
  lastMaintenanceDate?: string;
}
