import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsUrl,
  ArrayMinSize,
  IsNotEmpty,
  IsObject,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { LeadStatus, LeadSource, LeadGrade, SalesStage, QualificationStatus } from '../entities/lead.entity';

// Nested DTOs for Lead
export class LeadContactDto {
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

  @ApiPropertyOptional({ description: 'Job title' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  title?: string;

  @ApiProperty({ description: 'Email address', format: 'email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Mobile phone number' })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional({ description: 'Company name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  company?: string;

  @ApiPropertyOptional({ description: 'Company website URL' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'LinkedIn profile URL' })
  @IsOptional()
  @IsUrl()
  linkedin?: string;
}

export class LeadDemographicsDto {
  @ApiPropertyOptional({ description: 'Industry sector' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @ApiPropertyOptional({ description: 'Company size category' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  companySize?: string;

  @ApiPropertyOptional({ description: 'Annual revenue', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  annualRevenue?: number;

  @ApiPropertyOptional({ description: 'Location/address' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({ description: 'Number of employees', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  employeeCount?: number;

  @ApiPropertyOptional({ description: 'Company founded year', minimum: 1800 })
  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(new Date().getFullYear())
  foundedYear?: number;

  @ApiPropertyOptional({ description: 'Technology stack', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techStack?: string[];
}

export class BehaviorDataDto {
  @ApiProperty({ description: 'Number of website visits', minimum: 0 })
  @IsNumber()
  @Min(0)
  websiteVisits: number;

  @ApiProperty({ description: 'Total page views', minimum: 0 })
  @IsNumber()
  @Min(0)
  pageViews: number;

  @ApiProperty({ description: 'Email opens count', minimum: 0 })
  @IsNumber()
  @Min(0)
  emailOpens: number;

  @ApiProperty({ description: 'Email clicks count', minimum: 0 })
  @IsNumber()
  @Min(0)
  emailClicks: number;

  @ApiProperty({ description: 'Form submissions count', minimum: 0 })
  @IsNumber()
  @Min(0)
  formSubmissions: number;

  @ApiProperty({ description: 'Content downloads count', minimum: 0 })
  @IsNumber()
  @Min(0)
  contentDownloads: number;

  @ApiProperty({ description: 'Demo requests count', minimum: 0 })
  @IsNumber()
  @Min(0)
  demoRequests: number;

  @ApiPropertyOptional({ description: 'Social media interactions', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  socialInteractions?: number;

  @ApiPropertyOptional({ description: 'Video views count', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  videoViews?: number;

  @ApiPropertyOptional({ description: 'Whitepaper downloads', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  whitepaperDownloads?: number;
}

export class LeadScoringDto {
  @ApiProperty({ description: 'Demographic score component', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  demographicScore: number;

  @ApiProperty({ description: 'Behavioral score component', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  behaviorScore: number;

  @ApiProperty({ description: 'Engagement score component', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  engagementScore: number;

  @ApiProperty({ description: 'Total combined score', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  totalScore: number;

  @ApiProperty({ description: 'Last score update timestamp' })
  @IsDateString()
  @IsNotEmpty()
  lastUpdated: string;

  @ApiPropertyOptional({ description: 'Scoring model version' })
  @IsOptional()
  @IsString()
  scoringModel?: string;

  @ApiPropertyOptional({ description: 'Score decay factor', minimum: 0, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  decayFactor?: number;
}

export class QualificationDto {
  @ApiProperty({ description: 'Budget qualification status', enum: QualificationStatus })
  @IsEnum(QualificationStatus)
  budget: QualificationStatus;

  @ApiProperty({ description: 'Authority qualification status', enum: QualificationStatus })
  @IsEnum(QualificationStatus)
  authority: QualificationStatus;

  @ApiProperty({ description: 'Need qualification status', enum: QualificationStatus })
  @IsEnum(QualificationStatus)
  need: QualificationStatus;

  @ApiProperty({ description: 'Timeline qualification status', enum: QualificationStatus })
  @IsEnum(QualificationStatus)
  timeline: QualificationStatus;

  @ApiProperty({ description: 'BANT score (0-100)', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  bantScore: number;

  @ApiPropertyOptional({ description: 'Qualified by user/system' })
  @IsOptional()
  @IsString()
  qualifiedBy?: string;

  @ApiPropertyOptional({ description: 'Qualification date' })
  @IsOptional()
  @IsDateString()
  qualifiedDate?: string;

  @ApiPropertyOptional({ description: 'Qualification notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class NextActionDto {
  @ApiProperty({ description: 'Action type', minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Scheduled date and time' })
  @IsDateString()
  @IsNotEmpty()
  scheduledDate: string;

  @ApiProperty({ description: 'Action description', minLength: 1, maxLength: 500 })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'Action priority level' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  priority?: string;

  @ApiPropertyOptional({ description: 'Set reminder flag' })
  @IsOptional()
  @IsBoolean()
  reminder?: boolean;
}

export class CampaignAttributionDto {
  @ApiPropertyOptional({ description: 'Campaign ID' })
  @IsOptional()
  @IsString()
  campaignId?: string;

  @ApiPropertyOptional({ description: 'Campaign name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  campaignName?: string;

  @ApiPropertyOptional({ description: 'UTM source parameter' })
  @IsOptional()
  @IsString()
  utmSource?: string;

  @ApiPropertyOptional({ description: 'UTM medium parameter' })
  @IsOptional()
  @IsString()
  utmMedium?: string;

  @ApiPropertyOptional({ description: 'UTM campaign parameter' })
  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @ApiPropertyOptional({ description: 'UTM term parameter' })
  @IsOptional()
  @IsString()
  utmTerm?: string;

  @ApiPropertyOptional({ description: 'UTM content parameter' })
  @IsOptional()
  @IsString()
  utmContent?: string;

  @ApiPropertyOptional({ description: 'Landing page URL' })
  @IsOptional()
  @IsUrl()
  landingPage?: string;

  @ApiPropertyOptional({ description: 'Referrer URL' })
  @IsOptional()
  @IsUrl()
  referrer?: string;
}

// Main Lead DTOs
export class CreateLeadDto {
  @ApiPropertyOptional({ description: 'Organization ID (defaults to authenticated user org)' })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiProperty({ description: 'Lead source', enum: LeadSource })
  @IsEnum(LeadSource)
  source: LeadSource;

  @ApiPropertyOptional({ description: 'Initial lead score (0-100)', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number = 0;

  @ApiPropertyOptional({ description: 'Lead grade', enum: LeadGrade })
  @IsOptional()
  @IsEnum(LeadGrade)
  grade?: LeadGrade;

  @ApiProperty({ description: 'Contact information', type: LeadContactDto })
  @ValidateNested()
  @Type(() => LeadContactDto)
  contact: LeadContactDto;

  @ApiProperty({ description: 'Company demographics', type: LeadDemographicsDto })
  @ValidateNested()
  @Type(() => LeadDemographicsDto)
  demographics: LeadDemographicsDto;

  @ApiProperty({ description: 'Behavioral tracking data', type: BehaviorDataDto })
  @ValidateNested()
  @Type(() => BehaviorDataDto)
  behaviorData: BehaviorDataDto;

  @ApiProperty({ description: 'Lead scoring breakdown', type: LeadScoringDto })
  @ValidateNested()
  @Type(() => LeadScoringDto)
  leadScoring: LeadScoringDto;

  @ApiProperty({ description: 'BANT qualification', type: QualificationDto })
  @ValidateNested()
  @Type(() => QualificationDto)
  qualification: QualificationDto;

  @ApiPropertyOptional({ description: 'Assigned sales representative' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Current sales stage', enum: SalesStage })
  @IsOptional()
  @IsEnum(SalesStage)
  salesStage?: SalesStage = SalesStage.PROSPECTING;

  @ApiPropertyOptional({ description: 'Next planned action', type: NextActionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => NextActionDto)
  nextAction?: NextActionDto;

  @ApiPropertyOptional({ description: 'Estimated deal value', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedValue?: number;

  @ApiPropertyOptional({ description: 'Conversion probability (0-100)', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  probability?: number = 0;

  @ApiPropertyOptional({ description: 'Expected close date' })
  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;

  @ApiPropertyOptional({ description: 'Campaign attribution', type: CampaignAttributionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CampaignAttributionDto)
  campaignAttribution?: CampaignAttributionDto;

  @ApiPropertyOptional({ description: 'Lead tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Custom fields' })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Internal notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateLeadDto extends PartialType(CreateLeadDto) {}

export class LeadQueryDto {
  @ApiPropertyOptional({ description: 'Filter by lead status', enum: LeadStatus })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ description: 'Filter by lead source', enum: LeadSource })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiPropertyOptional({ description: 'Minimum lead score', minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @ApiPropertyOptional({ description: 'Filter by assigned sales rep' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Filter by lead grade', enum: LeadGrade })
  @IsOptional()
  @IsEnum(LeadGrade)
  grade?: LeadGrade;

  @ApiPropertyOptional({ description: 'Filter by sales stage', enum: SalesStage })
  @IsOptional()
  @IsEnum(SalesStage)
  salesStage?: SalesStage;

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
}

export class ConvertLeadDto {
  @ApiProperty({ description: 'Conversion value/revenue', minimum: 0 })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ description: 'Conversion notes' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: 'Create opportunity flag' })
  @IsOptional()
  @IsBoolean()
  createOpportunity?: boolean = true;

  @ApiPropertyOptional({ description: 'Opportunity data for creation' })
  @IsOptional()
  @IsObject()
  opportunityData?: any;
}

export class UpdateLeadScoreDto {
  @ApiProperty({ description: 'Demographic score component', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  demographicScore: number;

  @ApiProperty({ description: 'Behavioral score component', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  behaviorScore: number;

  @ApiProperty({ description: 'Engagement score component', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  engagementScore: number;

  @ApiPropertyOptional({ description: 'Reason for score update' })
  @IsOptional()
  @IsString()
  reason?: string;
}
