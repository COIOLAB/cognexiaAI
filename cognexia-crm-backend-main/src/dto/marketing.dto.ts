import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsObject,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export enum CampaignType {
  EMAIL = 'email',
  SMS = 'sms',
  SOCIAL_MEDIA = 'social_media',
  DISPLAY_ADS = 'display_ads',
  CONTENT_MARKETING = 'content_marketing',
  WEBINAR = 'webinar',
  MIXED = 'mixed',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum SegmentCriteria {
  DEMOGRAPHIC = 'demographic',
  BEHAVIORAL = 'behavioral',
  GEOGRAPHIC = 'geographic',
  PSYCHOGRAPHIC = 'psychographic',
  TRANSACTIONAL = 'transactional',
  ENGAGEMENT = 'engagement',
}

export class CreateCampaignDto {
  @ApiProperty({ description: 'Campaign name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Campaign description' })
  @IsString()
  description: string;

  @ApiProperty({ enum: CampaignType, description: 'Campaign type' })
  @IsEnum(CampaignType)
  type: CampaignType;

  @ApiProperty({ description: 'Campaign start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Campaign end date' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: 'Campaign budget' })
  @IsNumber()
  @Min(0)
  budget: number;

  @ApiPropertyOptional({ description: 'Target audience segments' })
  @IsOptional()
  @IsArray()
  targetSegments?: string[];

  @ApiPropertyOptional({ description: 'Campaign objectives' })
  @IsOptional()
  @IsObject()
  objectives?: {
    reach?: number;
    engagement?: number;
    conversions?: number;
    roi?: number;
  };

  @ApiPropertyOptional({ description: 'Campaign content' })
  @IsOptional()
  @IsObject()
  content?: {
    subject?: string;
    body?: string;
    images?: string[];
    ctaText?: string;
    ctaLink?: string;
  };
}

export class UpdateCampaignDto {
  @ApiPropertyOptional({ description: 'Campaign name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Campaign description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: CampaignStatus, description: 'Campaign status' })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiPropertyOptional({ description: 'Campaign budget' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @ApiPropertyOptional({ description: 'Campaign objectives' })
  @IsOptional()
  @IsObject()
  objectives?: {
    reach?: number;
    engagement?: number;
    conversions?: number;
    roi?: number;
  };
}

export class CreateCustomerSegmentDto {
  @ApiProperty({ description: 'Segment name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Segment description' })
  @IsString()
  description: string;

  @ApiProperty({ enum: SegmentCriteria, description: 'Segmentation criteria' })
  @IsEnum(SegmentCriteria)
  criteria: SegmentCriteria;

  @ApiProperty({ description: 'Segment conditions' })
  @IsArray()
  conditions: {
    field: string;
    operator: string;
    value: any;
  }[];

  @ApiPropertyOptional({ description: 'Segment tags' })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Is segment active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class EmailTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email subject' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Email body HTML' })
  @IsString()
  bodyHtml: string;

  @ApiPropertyOptional({ description: 'Email body text' })
  @IsOptional()
  @IsString()
  bodyText?: string;

  @ApiPropertyOptional({ description: 'Template category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Template tags' })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Is template active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateEmailTemplateDto extends PartialType(EmailTemplateDto) {}

export class SendEmailCampaignDto {
  @ApiProperty({ description: 'Campaign ID' })
  @IsString()
  campaignId: string;

  @ApiProperty({ description: 'Email template ID' })
  @IsString()
  templateId: string;

  @ApiProperty({ description: 'Target segment IDs' })
  @IsArray()
  segmentIds: string[];

  @ApiPropertyOptional({ description: 'Schedule send time' })
  @IsOptional()
  @IsDateString()
  scheduledTime?: string;

  @ApiPropertyOptional({ description: 'A/B test configuration' })
  @IsOptional()
  @IsObject()
  abTestConfig?: {
    enabled: boolean;
    testPercentage: number;
    variants: {
      subject?: string;
      content?: string;
    }[];
  };
}

export class MarketingAnalyticsRequestDto {
  @ApiProperty({ description: 'Start date for analytics' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date for analytics' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Campaign IDs to analyze' })
  @IsOptional()
  @IsArray()
  campaignIds?: string[];

  @ApiPropertyOptional({ description: 'Metrics to include' })
  @IsOptional()
  @IsArray()
  metrics?: string[];

  @ApiPropertyOptional({ description: 'Segment IDs to analyze' })
  @IsOptional()
  @IsArray()
  segmentIds?: string[];

  @ApiPropertyOptional({ description: 'Group results by' })
  @IsOptional()
  @IsEnum(['day', 'week', 'month', 'campaign', 'segment'])
  groupBy?: string;
}

export class LeadScoringConfigDto {
  @ApiProperty({ description: 'Scoring model name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Scoring criteria' })
  @IsObject()
  criteria: {
    demographic: { weight: number; factors: any };
    behavioral: { weight: number; factors: any };
    engagement: { weight: number; factors: any };
    firmographic: { weight: number; factors: any };
  };

  @ApiPropertyOptional({ description: 'Scoring thresholds' })
  @IsOptional()
  @IsObject()
  thresholds?: {
    hot: number;
    warm: number;
    cold: number;
  };

  @ApiPropertyOptional({ description: 'Auto-assignment rules' })
  @IsOptional()
  @IsObject()
  autoAssignment?: {
    enabled: boolean;
    rules: {
      scoreRange: { min: number; max: number };
      assignTo: string;
    }[];
  };
}

export class MarketingAutomationWorkflowDto {
  @ApiProperty({ description: 'Workflow name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Workflow description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Trigger conditions' })
  @IsObject()
  trigger: {
    type: string;
    conditions: any[];
  };

  @ApiProperty({ description: 'Workflow steps' })
  @IsArray()
  steps: {
    id: string;
    type: string;
    action: any;
    delay?: number;
    conditions?: any[];
  }[];

  @ApiPropertyOptional({ description: 'Is workflow active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Workflow tags' })
  @IsOptional()
  @IsArray()
  tags?: string[];
}
