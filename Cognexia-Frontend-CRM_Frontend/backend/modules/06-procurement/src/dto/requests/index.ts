import { 
  IsString, 
  IsNumber, 
  IsArray, 
  IsOptional, 
  IsEnum, 
  IsBoolean, 
  IsDate, 
  IsUUID, 
  ValidateNested, 
  Min, 
  Max, 
  Length,
  IsEmail,
  IsPhoneNumber,
  IsUrl,
  ArrayMinSize,
  ArrayMaxSize,
  IsObject,
  IsNumberString,
  Matches,
  IsJSON,
  IsNotEmpty,
  IsPositive,
  MinLength,
  MaxLength,
  IsDecimal,
  IsISO8601
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  SupplierStatus, 
  SupplierType, 
  RiskLevel as SupplierRiskLevel 
} from '../../entities/supplier.entity';
import { 
  OrderStatus, 
  OrderType, 
  Priority as OrderPriority 
} from '../../entities/purchase-order.entity';
import { 
  ContractStatus, 
  ContractType, 
  RiskLevel as ContractRiskLevel 
} from '../../entities/contract.entity';
import { 
  RFQStatus, 
  RFQType 
} from '../../entities/rfq.entity';

// ============================================================================
// SUPPLIER MANAGEMENT DTOs
// ============================================================================

export class SupplierSearchFiltersDto {
  @ApiPropertyOptional({ enum: SupplierStatus })
  @IsOptional()
  @IsEnum(SupplierStatus)
  status?: SupplierStatus;

  @ApiPropertyOptional({ enum: SupplierType })
  @IsOptional()
  @IsEnum(SupplierType)
  type?: SupplierType;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ enum: SupplierRiskLevel })
  @IsOptional()
  @IsEnum(SupplierRiskLevel)
  riskLevel?: SupplierRiskLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 100)
  region?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  searchText?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 1000, default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  limit?: number = 50;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;
}

export class ContactInfoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 100)
  position?: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 50)
  department?: string;
}

export class AddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(5, 200)
  street: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  city: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 100)
  state?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(2, 20)
  postalCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  country: string;
}

export class SupplierOnboardingDataDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(2, 200)
  name: string;

  @ApiProperty({ enum: SupplierType })
  @IsEnum(SupplierType)
  type: SupplierType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(2, 200)
  description: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  categories: string[];

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty({ type: [ContactInfoDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ContactInfoDto)
  contactInfo: ContactInfoDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(5, 50)
  taxId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(5, 50)
  businessLicense?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  capabilities?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  qualityStandards?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  sustainabilityMetrics?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  financialInfo?: Record<string, any>;
}

export class SupplierDiscoveryRequirementsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  categories: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsString({ each: true })
  capabilities: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  regions: string[];

  @ApiProperty({ type: 'object', additionalProperties: { type: 'number' } })
  @IsObject()
  qualityRequirements: Record<string, number>;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'number' } })
  @IsObject()
  deliveryRequirements: Record<string, number>;

  @ApiPropertyOptional({ type: 'object', additionalProperties: { type: 'number' } })
  @IsOptional()
  @IsObject()
  sustainabilityRequirements?: Record<string, number>;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => BudgetConstraintsDto)
  budgetConstraints?: BudgetConstraintsDto;
}

export class BudgetConstraintsDto {
  @ApiProperty({ minimum: 0.01 })
  @IsNumber()
  @IsPositive()
  maxPrice: number;

  @ApiProperty({ minimum: 1, maximum: 365 })
  @IsNumber()
  @Min(1)
  @Max(365)
  paymentTerms: number;
}

// ============================================================================
// CONTRACT MANAGEMENT DTOs
// ============================================================================

export class ContractSearchFiltersDto {
  @ApiPropertyOptional({ enum: ContractStatus })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @ApiPropertyOptional({ enum: ContractType })
  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ enum: ContractRiskLevel })
  @IsOptional()
  @IsEnum(ContractRiskLevel)
  riskLevel?: ContractRiskLevel;

  @ApiPropertyOptional({ minimum: 1, maximum: 365 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  @Type(() => Number)
  expiringInDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  searchText?: string;
}

export class ContractTermDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  key: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  value: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;
}

export class ContractCreationDataDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(5, 200)
  title: string;

  @ApiProperty({ enum: ContractType })
  @IsEnum(ContractType)
  contractType: ContractType;

  @ApiProperty()
  @IsUUID()
  supplierId: string;

  @ApiProperty({ minimum: 0.01 })
  @IsNumber()
  @IsPositive()
  totalValue: number;

  @ApiProperty()
  @IsISO8601()
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @ApiProperty()
  @IsISO8601()
  @Transform(({ value }) => new Date(value))
  endDate: Date;

  @ApiProperty({ type: [ContractTermDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ContractTermDto)
  terms: ContractTermDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

export class ContractRenewalDataDto {
  @ApiProperty()
  @IsISO8601()
  @Transform(({ value }) => new Date(value))
  newEndDate: Date;

  @ApiProperty({ minimum: 0.01 })
  @IsNumber()
  @IsPositive()
  totalValue: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(5, 500)
  renewalReason: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  renewedBy: string;

  @ApiProperty()
  @IsISO8601()
  @Transform(({ value }) => new Date(value))
  effectiveDate: Date;
}

export class BlockchainConfigDto {
  @ApiProperty({ enum: ['ethereum', 'hyperledger', 'polygon', 'binance'] })
  @IsEnum(['ethereum', 'hyperledger', 'polygon', 'binance'])
  platform: 'ethereum' | 'hyperledger' | 'polygon' | 'binance';

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  immutableClauses: string[];

  @ApiProperty({ type: [Object] })
  @IsArray()
  @IsObject({ each: true })
  autoExecutionRules: any[];
}

// ============================================================================
// PURCHASE ORDER DTOs
// ============================================================================

export class LineItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(2, 200)
  description: string;

  @ApiProperty({ minimum: 1 })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ minimum: 0.01 })
  @IsNumber()
  @IsPositive()
  unitPrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 100)
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  @Transform(({ value }) => new Date(value))
  requiredDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;
}

export class AutoPORequestDto {
  @ApiProperty({ type: [LineItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  items: LineItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  preferredSupplierId?: string;

  @ApiProperty({ enum: OrderPriority })
  @IsEnum(OrderPriority)
  priority: OrderPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 100)
  department?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 100)
  requestedBy?: string;

  @ApiPropertyOptional({ minimum: 0.01 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  budgetLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  @Transform(({ value }) => new Date(value))
  requiredBy?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  deliveryInstructions?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  approvalMatrix?: Record<string, any>;
}

// ============================================================================
// ANALYTICS AND REPORTING DTOs
// ============================================================================

export class ReportConfigDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(5, 200)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  description?: string;

  @ApiProperty({ enum: ['financial', 'operational', 'supplier', 'contract', 'risk', 'sustainability'] })
  @IsEnum(['financial', 'operational', 'supplier', 'contract', 'risk', 'sustainability'])
  category: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsString({ each: true })
  metrics: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  filters?: string[];

  @ApiPropertyOptional({ enum: ['daily', 'weekly', 'monthly', 'quarterly'] })
  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly', 'quarterly'])
  schedule?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  recipients?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  customSettings?: Record<string, any>;
}

export class ExportOptionsDto {
  @ApiProperty({ enum: ['excel', 'pdf', 'csv', 'json'] })
  @IsEnum(['excel', 'pdf', 'csv', 'json'])
  format: 'excel' | 'pdf' | 'csv' | 'json';

  @ApiPropertyOptional({ enum: ['day', 'week', 'month', 'quarter', 'year'] })
  @IsOptional()
  @IsEnum(['day', 'week', 'month', 'quarter', 'year'])
  timeframe?: 'day' | 'week' | 'month' | 'quarter' | 'year';

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sections?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeCharts?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  template?: string;
}

// ============================================================================
// COMMON QUERY DTOs
// ============================================================================

export class PaginationDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 1000, default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  limit?: number = 50;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;
}

export class DateRangeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  @Transform(({ value }) => new Date(value))
  startDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  @Transform(({ value }) => new Date(value))
  endDate?: Date;
}

export class TimeframeDto {
  @ApiPropertyOptional({ enum: ['day', 'week', 'month', 'quarter', 'year'] })
  @IsOptional()
  @IsEnum(['day', 'week', 'month', 'quarter', 'year'])
  timeframe?: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month';
}

export class FilterDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  departments?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  refreshCache?: boolean;
}

// ============================================================================
// AI AND OPTIMIZATION DTOs
// ============================================================================

export class OptimizationStrategyDto {
  @ApiPropertyOptional({ enum: ['aggressive', 'balanced', 'conservative'] })
  @IsOptional()
  @IsEnum(['aggressive', 'balanced', 'conservative'])
  strategy?: 'aggressive' | 'balanced' | 'conservative' = 'balanced';
}

export class AIAnalysisOptionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeForecasting?: boolean = false;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includePriceAnalysis?: boolean = true;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeSupplierAnalysis?: boolean = true;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeRiskAssessment?: boolean = true;
}

export class ForecastOptionsDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 60, default: 12 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  @Type(() => Number)
  months?: number = 12;

  @ApiPropertyOptional({ enum: ['short', 'medium', 'long'] })
  @IsOptional()
  @IsEnum(['short', 'medium', 'long'])
  timeHorizon?: 'short' | 'medium' | 'long' = 'medium';
}

// Export all DTOs for easy importing
export * from './supplier.dto';
export * from './contract.dto';
export * from './purchase-order.dto';
export * from './analytics.dto';
