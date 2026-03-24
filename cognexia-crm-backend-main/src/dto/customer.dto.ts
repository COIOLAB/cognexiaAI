import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsObject,
  ValidateNested,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsPhoneNumber,
  IsUrl,
  IsISO8601,
  ArrayMinSize,
  IsNotEmpty,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CustomerType, CustomerStatus, CustomerSize, CustomerTier, RiskLevel, GrowthPotential } from '../entities/customer.entity';

// Base DTOs for nested objects
export class PrimaryContactDto {
  @ApiProperty({ description: 'First name', minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name', minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Job title', minLength: 1, maxLength: 150 })
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Email address', format: 'email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ description: 'Mobile phone number' })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional({ description: 'LinkedIn profile URL' })
  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @ApiPropertyOptional({ description: 'Skype username' })
  @IsOptional()
  @IsString()
  skype?: string;
}

export class AddressDto {
  @ApiProperty({ description: 'Street address', minLength: 1, maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @IsNotEmpty()
  street: string;

  @ApiProperty({ description: 'City', minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({ description: 'State/Province' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiProperty({ description: 'Country', minLength: 2, maxLength: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  country: string;

  @ApiProperty({ description: 'Postal/ZIP code', minLength: 1, maxLength: 20 })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  @IsNotEmpty()
  zipCode: string;

  @ApiProperty({ description: 'Geographic region', minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsNotEmpty()
  region: string;

  @ApiPropertyOptional({ description: 'Latitude coordinate' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude coordinate' })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}

export class DemographicsDto {
  @ApiPropertyOptional({ description: 'Company founded year', minimum: 1800 })
  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(new Date().getFullYear())
  foundedYear?: number;

  @ApiPropertyOptional({ description: 'Number of employees', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  employeeCount?: number;

  @ApiPropertyOptional({ description: 'Annual revenue', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  annualRevenue?: number;

  @ApiPropertyOptional({ description: 'Company website URL' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Tax identification number' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId?: string;

  @ApiPropertyOptional({ description: 'DUNS number' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  duns?: string;

  @ApiPropertyOptional({ description: 'SIC code' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  sicCode?: string;

  @ApiPropertyOptional({ description: 'NAICS code' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  naicsCode?: string;
}

export class PrivacySettingsDto {
  @ApiProperty({ description: 'Data sharing consent' })
  @IsBoolean()
  dataSharing: boolean;

  @ApiProperty({ description: 'Analytics tracking consent' })
  @IsBoolean()
  analytics: boolean;

  @ApiProperty({ description: 'Marketing communications consent' })
  @IsBoolean()
  marketing: boolean;
}

export class PreferencesDto {
  @ApiProperty({ description: 'Preferred language code', minLength: 2, maxLength: 5 })
  @IsString()
  @MinLength(2)
  @MaxLength(5)
  @IsNotEmpty()
  language: string;

  @ApiProperty({ description: 'Preferred currency code', minLength: 3, maxLength: 3 })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ description: 'Timezone identifier' })
  @IsString()
  @IsNotEmpty()
  timezone: string;

  @ApiProperty({ description: 'Preferred communication channels', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  communicationChannels: string[];

  @ApiProperty({ description: 'Marketing opt-in status' })
  @IsBoolean()
  marketingOptIn: boolean;

  @ApiProperty({ description: 'Newsletter subscription status' })
  @IsBoolean()
  newsletterOptIn: boolean;

  @ApiProperty({ description: 'Event invitations opt-in' })
  @IsBoolean()
  eventInvitations: boolean;

  @ApiProperty({ description: 'Privacy settings', type: PrivacySettingsDto })
  @ValidateNested()
  @Type(() => PrivacySettingsDto)
  privacySettings: PrivacySettingsDto;
}

export class SalesMetricsDto {
  @ApiProperty({ description: 'Total customer revenue', minimum: 0 })
  @IsNumber()
  @Min(0)
  totalRevenue: number;

  @ApiPropertyOptional({ description: 'Last order date' })
  @IsOptional()
  @IsDateString()
  lastOrderDate?: string;

  @ApiPropertyOptional({ description: 'Last order value', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lastOrderValue?: number;

  @ApiProperty({ description: 'Average order value', minimum: 0 })
  @IsNumber()
  @Min(0)
  averageOrderValue: number;

  @ApiPropertyOptional({ description: 'Order frequency pattern' })
  @IsOptional()
  @IsString()
  orderFrequency?: string;

  @ApiProperty({ description: 'Payment terms', minLength: 1, maxLength: 50 })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @IsNotEmpty()
  paymentTerms: string;

  @ApiPropertyOptional({ description: 'Credit limit', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @ApiPropertyOptional({ description: 'Outstanding balance', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  outstandingBalance?: number;

  @ApiPropertyOptional({ description: 'Discount rate percentage', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountRate?: number;
}

export class RelationshipMetricsDto {
  @ApiProperty({ description: 'Customer since date' })
  @IsDateString()
  @IsNotEmpty()
  customerSince: string;

  @ApiProperty({ description: 'Loyalty score (0-10)', minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  loyaltyScore: number;

  @ApiProperty({ description: 'Satisfaction score (0-10)', minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  satisfactionScore: number;

  @ApiProperty({ description: 'Net Promoter Score (-100 to 100)', minimum: -100, maximum: 100 })
  @IsNumber()
  @Min(-100)
  @Max(100)
  npsScore: number;

  @ApiPropertyOptional({ description: 'Last interaction date' })
  @IsOptional()
  @IsDateString()
  lastInteractionDate?: string;

  @ApiPropertyOptional({ description: 'Interaction frequency pattern' })
  @IsOptional()
  @IsString()
  interactionFrequency?: string;

  @ApiPropertyOptional({ description: 'Preferred sales representative' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  preferredSalesRep?: string;

  @ApiPropertyOptional({ description: 'Account manager' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  accountManager?: string;

  @ApiPropertyOptional({ description: 'Number of support tickets', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  supportTickets?: number;

  @ApiPropertyOptional({ description: 'Number of escalations', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  escalations?: number;
}

export class SegmentationDto {
  @ApiProperty({ description: 'Customer segment', minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsNotEmpty()
  segment: string;

  @ApiProperty({ description: 'Customer tier', enum: CustomerTier })
  @IsEnum(CustomerTier)
  tier: CustomerTier;

  @ApiProperty({ description: 'Risk level assessment', enum: RiskLevel })
  @IsEnum(RiskLevel)
  riskLevel: RiskLevel;

  @ApiProperty({ description: 'Growth potential assessment', enum: GrowthPotential })
  @IsEnum(GrowthPotential)
  growthPotential: GrowthPotential;

  @ApiPropertyOptional({ description: 'Competitive threats', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  competitiveThreats?: string[];

  @ApiPropertyOptional({ description: 'Strategic value score (0-100)', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  strategicValue?: number;

  @ApiPropertyOptional({ description: 'Churn probability (0-1)', minimum: 0, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  churnProbability?: number;

  @ApiPropertyOptional({ description: 'Upsell probability (0-1)', minimum: 0, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  upsellProbability?: number;

  @ApiPropertyOptional({ description: 'Cross-sell opportunities', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  crosssellOpportunities?: string[];
}

// Main Customer DTOs
export class CreateCustomerDto {
  @ApiProperty({ description: 'Company or individual name', minLength: 1, maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ description: 'Customer type', enum: CustomerType })
  @IsEnum(CustomerType)
  customerType: CustomerType;

  @ApiPropertyOptional({ description: 'Customer status', enum: CustomerStatus, default: CustomerStatus.ACTIVE })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus = CustomerStatus.ACTIVE;

  @ApiProperty({ description: 'Industry sector', minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsNotEmpty()
  industry: string;

  @ApiProperty({ description: 'Company size', enum: CustomerSize })
  @IsEnum(CustomerSize)
  size: CustomerSize;

  @ApiProperty({ description: 'Primary contact information', type: PrimaryContactDto })
  @ValidateNested()
  @Type(() => PrimaryContactDto)
  primaryContact: PrimaryContactDto;

  @ApiProperty({ description: 'Customer address', type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty({ description: 'Customer demographics', type: DemographicsDto })
  @ValidateNested()
  @Type(() => DemographicsDto)
  demographics: DemographicsDto;

  @ApiProperty({ description: 'Customer preferences', type: PreferencesDto })
  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences: PreferencesDto;

  @ApiProperty({ description: 'Sales metrics', type: SalesMetricsDto })
  @ValidateNested()
  @Type(() => SalesMetricsDto)
  salesMetrics: SalesMetricsDto;

  @ApiProperty({ description: 'Relationship metrics', type: RelationshipMetricsDto })
  @ValidateNested()
  @Type(() => RelationshipMetricsDto)
  relationshipMetrics: RelationshipMetricsDto;

  @ApiProperty({ description: 'Customer segmentation', type: SegmentationDto })
  @ValidateNested()
  @Type(() => SegmentationDto)
  segmentation: SegmentationDto;

  @ApiPropertyOptional({ description: 'Customer tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Internal notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}

export class CustomerQueryDto {
  @ApiPropertyOptional({ description: 'Page number for pagination', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by customer segment', enum: CustomerType })
  @IsOptional()
  @IsEnum(CustomerType)
  segment?: CustomerType;

  @ApiPropertyOptional({ description: 'Filter by region' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: 'Filter by industry' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: CustomerStatus })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @ApiPropertyOptional({ description: 'Search query for company name and contacts' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class CustomerSegmentationDto {
  @ApiPropertyOptional({ description: 'Filter by industry' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ description: 'Filter by customer type', enum: CustomerType })
  @IsOptional()
  @IsEnum(CustomerType)
  customerType?: CustomerType;

  @ApiPropertyOptional({ description: 'Minimum revenue threshold', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minRevenue?: number;

  @ApiPropertyOptional({ description: 'Filter by region' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: 'Maximum results to return', minimum: 1, maximum: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 100;
}
