import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsDate,
  IsBoolean,
  ValidateNested,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Enums
export enum CampaignType {
  EMAIL = 'email',
  SOCIAL = 'social',
  DIGITAL = 'digital',
  CONTENT = 'content',
  WEBINAR = 'webinar',
  PPC = 'ppc',
  SEO = 'seo',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ContentType {
  BLOG = 'blog',
  EMAIL = 'email',
  SOCIAL = 'social',
  VIDEO = 'video',
  WHITEPAPER = 'whitepaper',
  CASE_STUDY = 'case_study',
  INFOGRAPHIC = 'infographic',
  WEBINAR = 'webinar',
}

export enum SocialPlatform {
  LINKEDIN = 'linkedin',
  TWITTER = 'twitter',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  YOUTUBE = 'youtube',
  TIKTOK = 'tiktok',
}

// Supporting DTOs
export class TargetAudienceDto {
  @ApiPropertyOptional({ description: 'Target demographics description' })
  @IsOptional()
  @IsString()
  demographics?: string;

  @ApiPropertyOptional({ description: 'Target industries', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  industries?: string[];

  @ApiPropertyOptional({ description: 'Target geographies', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  geography?: string[];

  @ApiPropertyOptional({ description: 'Age range minimum' })
  @IsOptional()
  @IsNumber()
  @Min(18)
  ageMin?: number;

  @ApiPropertyOptional({ description: 'Age range maximum' })
  @IsOptional()
  @IsNumber()
  @Max(100)
  ageMax?: number;

  @ApiPropertyOptional({ description: 'Customer segment' })
  @IsOptional()
  @IsString()
  segment?: string;

  @ApiPropertyOptional({ description: 'Targeting criteria' })
  @IsOptional()
  @IsString()
  criteria?: string;
}

export class CampaignObjectivesDto {
  @ApiProperty({ description: 'Primary campaign objective' })
  @IsString()
  primary: string;

  @ApiPropertyOptional({ description: 'Secondary objectives', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondary?: string[];

  @ApiPropertyOptional({ description: 'Key performance indicators', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  kpis?: string[];
}

export class BudgetDto {
  @ApiProperty({ description: 'Total campaign budget' })
  @IsNumber()
  @Min(0)
  total: number;

  @ApiPropertyOptional({ description: 'Budget allocation by channel' })
  @IsOptional()
  @IsObject()
  allocation?: Record<string, number>;

  @ApiPropertyOptional({ description: 'Daily budget limit' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyLimit?: number;
}

// Main DTOs
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
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ description: 'Campaign end date' })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({ type: BudgetDto, description: 'Campaign budget details' })
  @ValidateNested()
  @Type(() => BudgetDto)
  budget: BudgetDto;

  @ApiProperty({ type: TargetAudienceDto, description: 'Target audience details' })
  @ValidateNested()
  @Type(() => TargetAudienceDto)
  targetAudience: TargetAudienceDto;

  @ApiProperty({ type: CampaignObjectivesDto, description: 'Campaign objectives' })
  @ValidateNested()
  @Type(() => CampaignObjectivesDto)
  objectives: CampaignObjectivesDto;

  @ApiProperty({ description: 'Marketing channels to use', type: [String] })
  @IsArray()
  @IsString({ each: true })
  channels: string[];

  @ApiPropertyOptional({ description: 'Campaign manager ID' })
  @IsOptional()
  @IsString()
  managerId?: string;

  @ApiPropertyOptional({ description: 'Campaign tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Additional campaign metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
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

  @ApiPropertyOptional({ description: 'Campaign end date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({ type: BudgetDto, description: 'Updated budget details' })
  @IsOptional()
  @ValidateNested()
  @Type(() => BudgetDto)
  budget?: BudgetDto;

  @ApiPropertyOptional({ type: TargetAudienceDto, description: 'Updated target audience' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TargetAudienceDto)
  targetAudience?: TargetAudienceDto;

  @ApiPropertyOptional({ description: 'Updated marketing channels', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  channels?: string[];

  @ApiPropertyOptional({ description: 'Campaign tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class ContentGenerationDto {
  @ApiProperty({ enum: ContentType, description: 'Type of content to generate' })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiProperty({ description: 'Content topic or subject' })
  @IsString()
  topic: string;

  @ApiProperty({ description: 'Target audience for the content' })
  @IsString()
  targetAudience: string;

  @ApiProperty({ description: 'Primary keywords for SEO', type: [String] })
  @IsArray()
  @IsString({ each: true })
  keywords: string[];

  @ApiPropertyOptional({ description: 'Content tone (professional, casual, technical)' })
  @IsOptional()
  @IsString()
  tone?: string;

  @ApiPropertyOptional({ description: 'Desired content length (words)' })
  @IsOptional()
  @IsNumber()
  @Min(50)
  length?: number;

  @ApiPropertyOptional({ description: 'Content format (article, list, guide)' })
  @IsOptional()
  @IsString()
  format?: string;

  @ApiPropertyOptional({ description: 'Include call-to-action' })
  @IsOptional()
  @IsBoolean()
  includeCTA?: boolean;

  @ApiPropertyOptional({ description: 'Brand guidelines to follow' })
  @IsOptional()
  @IsString()
  brandGuidelines?: string;

  @ApiPropertyOptional({ description: 'Number of content variations to generate' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  variations?: number;
}

export class EmailCampaignDto {
  @ApiProperty({ description: 'Email campaign name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email subject line' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Email content/body' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Recipient list/segment' })
  @IsString()
  recipientSegment: string;

  @ApiPropertyOptional({ description: 'Sender name' })
  @IsOptional()
  @IsString()
  senderName?: string;

  @ApiPropertyOptional({ description: 'Sender email address' })
  @IsOptional()
  @IsString()
  senderEmail?: string;

  @ApiPropertyOptional({ description: 'Email template ID' })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional({ description: 'Scheduled send time' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  scheduledTime?: Date;

  @ApiPropertyOptional({ description: 'A/B test configuration' })
  @IsOptional()
  @IsObject()
  abTestConfig?: {
    enabled: boolean;
    testSubject?: string;
    splitPercentage?: number;
  };

  @ApiPropertyOptional({ description: 'Email tracking options' })
  @IsOptional()
  @IsObject()
  trackingOptions?: {
    opens: boolean;
    clicks: boolean;
    unsubscribes: boolean;
  };
}

export class SocialMediaCampaignDto {
  @ApiProperty({ description: 'Social media campaign name' })
  @IsString()
  name: string;

  @ApiProperty({ enum: SocialPlatform, description: 'Target platforms', isArray: true })
  @IsArray()
  @IsEnum(SocialPlatform, { each: true })
  platforms: SocialPlatform[];

  @ApiProperty({ description: 'Post content/message' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Media attachments', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @ApiPropertyOptional({ description: 'Hashtags to include', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @ApiPropertyOptional({ description: 'Scheduled posting times', type: [Date] })
  @IsOptional()
  @IsArray()
  @IsDate({ each: true })
  @Type(() => Date)
  scheduledTimes?: Date[];

  @ApiPropertyOptional({ description: 'Target audience for social ads' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TargetAudienceDto)
  targetAudience?: TargetAudienceDto;

  @ApiPropertyOptional({ description: 'Social media campaign budget' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @ApiPropertyOptional({ description: 'Campaign objectives', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objectives?: string[];
}

export class MarketingAnalyticsDto {
  @ApiPropertyOptional({ description: 'Analytics time period' })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiPropertyOptional({ description: 'Campaign IDs to analyze', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  campaignIds?: string[];

  @ApiPropertyOptional({ description: 'Channels to analyze', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  channels?: string[];

  @ApiPropertyOptional({ description: 'Metrics to include', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metrics?: string[];

  @ApiPropertyOptional({ description: 'Include competitor comparison' })
  @IsOptional()
  @IsBoolean()
  includeCompetitors?: boolean;

  @ApiPropertyOptional({ description: 'Include attribution analysis' })
  @IsOptional()
  @IsBoolean()
  includeAttribution?: boolean;

  @ApiPropertyOptional({ description: 'Segment data by customer type' })
  @IsOptional()
  @IsString()
  segmentBy?: string;
}

export class CompetitorAnalysisDto {
  @ApiPropertyOptional({ description: 'Specific competitor to analyze' })
  @IsOptional()
  @IsString()
  competitor?: string;

  @ApiPropertyOptional({ description: 'Analysis metrics', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metrics?: string[];

  @ApiPropertyOptional({ description: 'Industries to analyze', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  industries?: string[];

  @ApiPropertyOptional({ description: 'Geographic regions', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regions?: string[];

  @ApiPropertyOptional({ description: 'Include market share analysis' })
  @IsOptional()
  @IsBoolean()
  includeMarketShare?: boolean;

  @ApiPropertyOptional({ description: 'Include trend analysis' })
  @IsOptional()
  @IsBoolean()
  includeTrends?: boolean;
}

export class CustomerJourneyDto {
  @ApiPropertyOptional({ description: 'Customer segment to analyze' })
  @IsOptional()
  @IsString()
  segment?: string;

  @ApiPropertyOptional({ description: 'Analysis timeframe' })
  @IsOptional()
  @IsString()
  timeframe?: string;

  @ApiPropertyOptional({ description: 'Journey stages to analyze', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  stages?: string[];

  @ApiPropertyOptional({ description: 'Touchpoints to include', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  touchpoints?: string[];

  @ApiPropertyOptional({ description: 'Include conversion path analysis' })
  @IsOptional()
  @IsBoolean()
  includeConversionPaths?: boolean;

  @ApiPropertyOptional({ description: 'Include drop-off analysis' })
  @IsOptional()
  @IsBoolean()
  includeDropoffAnalysis?: boolean;
}

// Response DTOs
export class CampaignResponseDto {
  @ApiProperty({ description: 'Campaign ID' })
  id: string;

  @ApiProperty({ description: 'Campaign name' })
  name: string;

  @ApiProperty({ enum: CampaignType, description: 'Campaign type' })
  type: CampaignType;

  @ApiProperty({ enum: CampaignStatus, description: 'Campaign status' })
  status: CampaignStatus;

  @ApiProperty({ description: 'Campaign performance metrics' })
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    roi: number;
    costPerClick: number;
    conversionRate: number;
  };

  @ApiProperty({ description: 'Campaign budget and spend' })
  budget: {
    total: number;
    spent: number;
    remaining: number;
  };
}

export class ContentResponseDto {
  @ApiProperty({ description: 'Generated content' })
  content: string;

  @ApiProperty({ description: 'Content variations', type: [String] })
  variations: string[];

  @ApiProperty({ description: 'SEO score and recommendations' })
  seoAnalysis: {
    score: number;
    recommendations: string[];
  };

  @ApiProperty({ description: 'Estimated performance metrics' })
  estimatedPerformance: {
    readability: number;
    engagement: number;
    conversionPotential: number;
  };
}

export class AnalyticsResponseDto {
  @ApiProperty({ description: 'Analytics period' })
  period: string;

  @ApiProperty({ description: 'Key performance metrics' })
  metrics: {
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    averageROI: number;
    costPerAcquisition: number;
  };

  @ApiProperty({ description: 'Channel performance breakdown' })
  channelPerformance: Array<{
    channel: string;
    performance: any;
  }>;

  @ApiProperty({ description: 'Trending content and campaigns' })
  trends: Array<{
    item: string;
    metric: string;
    value: number;
    change: number;
  }>;
}
