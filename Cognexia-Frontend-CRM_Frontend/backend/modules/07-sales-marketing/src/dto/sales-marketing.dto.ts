// Industry 5.0 ERP Backend - Sales & Marketing Module
// Sales & Marketing DTOs - Data Transfer Objects for advanced sales and marketing operations
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
  IsUUID,
  IsDate,
  ValidateNested,
  Min,
  Max,
  Length,
  IsNotEmpty,
  IsInt,
  ArrayMinSize,
  ArrayMaxSize,
  IsDateString,
  IsEmail,
  IsPhoneNumber,
  IsUrl,
  IsJSON,
  Matches,
  IsNumberString,
  IsPositive,
  ArrayNotEmpty,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// ============== ENUMS ==============

export enum CustomerStatus {
  PROSPECT = 'prospect',
  LEAD = 'lead',
  OPPORTUNITY = 'opportunity',
  CUSTOMER = 'customer',
  CHURNED = 'churned',
  WIN_BACK = 'win_back'
}

export enum CampaignType {
  EMAIL = 'email',
  SOCIAL_MEDIA = 'social_media',
  CONTENT_MARKETING = 'content_marketing',
  PPC = 'ppc',
  SEO = 'seo',
  INFLUENCER = 'influencer',
  EVENT = 'event',
  DIRECT_MAIL = 'direct_mail',
  QUANTUM_PERSONALIZED = 'quantum_personalized',
  AI_GENERATED = 'ai_generated',
  NEURAL_OPTIMIZED = 'neural_optimized'
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  QUANTUM_OPTIMIZING = 'quantum_optimizing'
}

export enum ContentType {
  BLOG_POST = 'blog_post',
  VIDEO = 'video',
  INFOGRAPHIC = 'infographic',
  PODCAST = 'podcast',
  WEBINAR = 'webinar',
  EBOOK = 'ebook',
  WHITEPAPER = 'whitepaper',
  CASE_STUDY = 'case_study',
  SOCIAL_POST = 'social_post',
  EMAIL_TEMPLATE = 'email_template',
  AD_COPY = 'ad_copy',
  LANDING_PAGE = 'landing_page',
  AI_GENERATED_CONTENT = 'ai_generated_content',
  QUANTUM_PERSONALIZED_CONTENT = 'quantum_personalized_content'
}

export enum LeadScore {
  COLD = 'cold',
  WARM = 'warm',
  HOT = 'hot',
  QUALIFIED = 'qualified',
  UNQUALIFIED = 'unqualified'
}

export enum PersonalityType {
  ANALYTICAL = 'analytical',
  DRIVER = 'driver',
  EXPRESSIVE = 'expressive',
  AMIABLE = 'amiable'
}

export enum CommunicationPreference {
  EMAIL = 'email',
  PHONE = 'phone',
  SMS = 'sms',
  SOCIAL_MEDIA = 'social_media',
  VIDEO_CALL = 'video_call',
  IN_PERSON = 'in_person',
  CHATBOT = 'chatbot',
  AI_ASSISTANT = 'ai_assistant'
}

export enum OptimizationObjective {
  MAXIMIZE_CONVERSION = 'maximize_conversion',
  MINIMIZE_COST = 'minimize_cost',
  MAXIMIZE_ENGAGEMENT = 'maximize_engagement',
  INCREASE_BRAND_AWARENESS = 'increase_brand_awareness',
  CUSTOMER_RETENTION = 'customer_retention',
  LEAD_GENERATION = 'lead_generation'
}

// ============== BASE DTOs ==============

export class AIPersonalityProfileDto {
  @ApiProperty({ description: 'Core personality traits based on Big Five model' })
  @IsObject()
  @ValidateNested()
  @Type(() => CoreTraitsDto)
  coreTraits: CoreTraitsDto;

  @ApiProperty({ description: 'Communication style preferences' })
  @IsObject()
  @ValidateNested()
  @Type(() => CommunicationStyleDto)
  communicationStyle: CommunicationStyleDto;

  @ApiProperty({ description: 'Decision making patterns' })
  @IsObject()
  @ValidateNested()
  @Type(() => DecisionMakingPatternDto)
  decisionMakingPattern: DecisionMakingPatternDto;

  @ApiProperty({ description: 'Motivational drivers and demotivators' })
  @IsObject()
  @ValidateNested()
  @Type(() => MotivationalDriversDto)
  motivationalDrivers: MotivationalDriversDto;

  @ApiProperty({ description: 'AI confidence score for profile accuracy', minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  aiConfidenceScore: number;
}

export class CoreTraitsDto {
  @ApiProperty({ description: 'Openness to experience', minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  openness: number;

  @ApiProperty({ description: 'Conscientiousness', minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  conscientiousness: number;

  @ApiProperty({ description: 'Extraversion', minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  extraversion: number;

  @ApiProperty({ description: 'Agreeableness', minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  agreeableness: number;

  @ApiProperty({ description: 'Neuroticism', minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  neuroticism: number;
}

export class CommunicationStyleDto {
  @ApiProperty({ description: 'Communication preference', enum: ['formal', 'casual', 'technical', 'creative'] })
  @IsEnum(['formal', 'casual', 'technical', 'creative'])
  preference: 'formal' | 'casual' | 'technical' | 'creative';

  @ApiProperty({ description: 'Response speed preference', enum: ['immediate', 'quick', 'considered', 'slow'] })
  @IsEnum(['immediate', 'quick', 'considered', 'slow'])
  responseSpeed: 'immediate' | 'quick' | 'considered' | 'slow';

  @ApiProperty({ description: 'Preferred communication channels', type: [String] })
  @IsArray()
  @IsString({ each: true })
  channelPreference: string[];

  @ApiProperty({ description: 'Preferred content formats', type: [String] })
  @IsArray()
  @IsString({ each: true })
  contentFormat: string[];
}

export class DecisionMakingPatternDto {
  @ApiProperty({ description: 'Decision making style', enum: ['analytical', 'intuitive', 'collaborative', 'decisive'] })
  @IsEnum(['analytical', 'intuitive', 'collaborative', 'decisive'])
  style: 'analytical' | 'intuitive' | 'collaborative' | 'decisive';

  @ApiProperty({ description: 'Factors that influence decisions', type: [String] })
  @IsArray()
  @IsString({ each: true })
  influenceFactors: string[];

  @ApiProperty({ description: 'Risk tolerance level', minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  riskTolerance: number;

  @ApiProperty({ description: 'Price sensitivity', minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  priceSensitivity: number;
}

export class MotivationalDriversDto {
  @ApiProperty({ description: 'Primary motivational factors', type: [String] })
  @IsArray()
  @IsString({ each: true })
  primary: string[];

  @ApiProperty({ description: 'Secondary motivational factors', type: [String] })
  @IsArray()
  @IsString({ each: true })
  secondary: string[];

  @ApiProperty({ description: 'Demotivating factors', type: [String] })
  @IsArray()
  @IsString({ each: true })
  demotivators: string[];
}

export class QuantumBehaviorSignatureDto {
  @ApiProperty({ description: 'Digital footprint analytics' })
  @IsObject()
  digitalFootprint: {
    websiteInteractions: number;
    emailEngagement: number;
    socialMediaActivity: number;
    mobileAppUsage: number;
    contentConsumption: {
      video: number;
      articles: number;
      infographics: number;
      podcasts: number;
      webinars: number;
    };
  };

  @ApiProperty({ description: 'Purchasing behavior patterns' })
  @IsObject()
  purchasingBehavior: {
    averageOrderValue: number;
    purchaseFrequency: number;
    seasonalPatterns: any[];
    brandLoyalty: number;
    priceElasticity: number;
    churnProbability: number;
  };

  @ApiProperty({ description: 'Quantum behavioral states' })
  @IsObject()
  quantumStates: {
    currentEngagementState: string;
    probabilityDistribution: any;
    coherenceLevel: number;
    entanglementFactors: string[];
  };

  @ApiProperty({ description: 'Neural network weights', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  neuralNetworkWeights: number[];
}

// ============== NEURAL CUSTOMER DTOs ==============

export class CreateNeuralCustomerDto {
  @ApiProperty({ description: 'First name', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  firstName: string;

  @ApiProperty({ description: 'Last name', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  lastName: string;

  @ApiProperty({ description: 'Email address', maxLength: 255 })
  @IsEmail()
  @Length(1, 255)
  email: string;

  @ApiPropertyOptional({ description: 'Phone number', maxLength: 50 })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  phone?: string;

  @ApiPropertyOptional({ description: 'Company name', maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  company?: string;

  @ApiPropertyOptional({ description: 'Job title', maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  jobTitle?: string;

  @ApiPropertyOptional({ description: 'Industry', maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  industry?: string;

  @ApiPropertyOptional({ description: 'AI personality profile' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AIPersonalityProfileDto)
  aiPersonalityProfile?: AIPersonalityProfileDto;

  @ApiPropertyOptional({ description: 'Quantum behavior signature' })
  @IsOptional()
  @ValidateNested()
  @Type(() => QuantumBehaviorSignatureDto)
  quantumBehaviorSignature?: QuantumBehaviorSignatureDto;

  @ApiPropertyOptional({ description: 'Enable AI profiling' })
  @IsOptional()
  @IsBoolean()
  enableAIProfiling?: boolean;

  @ApiPropertyOptional({ description: 'Enable quantum analysis' })
  @IsOptional()
  @IsBoolean()
  enableQuantumAnalysis?: boolean;
}

export class UpdateNeuralCustomerDto extends PartialType(CreateNeuralCustomerDto) {
  @ApiPropertyOptional({ description: 'Customer status', enum: CustomerStatus })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @ApiPropertyOptional({ description: 'Lead score', enum: LeadScore })
  @IsOptional()
  @IsEnum(LeadScore)
  leadScore?: LeadScore;

  @ApiPropertyOptional({ description: 'Neural network retraining flag' })
  @IsOptional()
  @IsBoolean()
  triggerNeuralRetraining?: boolean;
}

export class NeuralCustomerQueryDto {
  @ApiPropertyOptional({ description: 'Customer status filter', enum: CustomerStatus })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @ApiPropertyOptional({ description: 'Lead score filter', enum: LeadScore })
  @IsOptional()
  @IsEnum(LeadScore)
  leadScore?: LeadScore;

  @ApiPropertyOptional({ description: 'Industry filter' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ description: 'Company filter' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ description: 'Minimum engagement score' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  minEngagementScore?: number;

  @ApiPropertyOptional({ description: 'Search by name or email' })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiPropertyOptional({ description: 'Include AI analysis' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeAIAnalysis?: boolean;

  @ApiPropertyOptional({ description: 'Include quantum data' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeQuantumData?: boolean;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

// ============== QUANTUM CAMPAIGN DTOs ==============

export class CreateQuantumCampaignDto {
  @ApiProperty({ description: 'Campaign name', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  campaignName: string;

  @ApiProperty({ description: 'Campaign type', enum: CampaignType })
  @IsEnum(CampaignType)
  campaignType: CampaignType;

  @ApiProperty({ description: 'Campaign objective', enum: OptimizationObjective })
  @IsEnum(OptimizationObjective)
  objective: OptimizationObjective;

  @ApiPropertyOptional({ description: 'Campaign description', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiProperty({ description: 'Target audience criteria' })
  @IsObject()
  targetAudience: {
    demographics?: {
      ageRange: [number, number];
      gender?: string[];
      income?: [number, number];
      education?: string[];
      location?: string[];
    };
    psychographics?: {
      interests: string[];
      values: string[];
      lifestyle: string[];
      personalityTraits: string[];
    };
    behavioral?: {
      purchaseHistory: any;
      engagementPatterns: any;
      deviceUsage: string[];
      contentPreferences: string[];
    };
    quantumFilters?: {
      engagementProbability: [number, number];
      conversionLikelihood: [number, number];
      brandAffinity: [number, number];
    };
  };

  @ApiProperty({ description: 'Campaign budget' })
  @IsNumber()
  @IsPositive()
  budget: number;

  @ApiProperty({ description: 'Campaign start date', type: String, format: 'date-time' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Campaign end date', type: String, format: 'date-time' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Quantum optimization parameters' })
  @IsOptional()
  @IsObject()
  quantumParameters?: {
    optimizationAlgorithm: 'quantum_annealing' | 'variational_quantum' | 'quantum_approximate';
    coherenceTime: number;
    entanglementDegree: number;
    measurementStrategy: string;
  };

  @ApiPropertyOptional({ description: 'AI content generation settings' })
  @IsOptional()
  @IsObject()
  aiContentSettings?: {
    generateContent: boolean;
    contentTypes: ContentType[];
    tone: string;
    language: string[];
    personalizationLevel: 'basic' | 'advanced' | 'quantum';
  };

  @ApiPropertyOptional({ description: 'Channel distribution strategy' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  channels?: string[];
}

export class UpdateQuantumCampaignDto extends PartialType(CreateQuantumCampaignDto) {
  @ApiPropertyOptional({ description: 'Campaign status', enum: CampaignStatus })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiPropertyOptional({ description: 'Actual spend' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualSpend?: number;

  @ApiPropertyOptional({ description: 'Performance metrics' })
  @IsOptional()
  @IsObject()
  performanceMetrics?: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversionRate: number;
    roas: number;
    cpa: number;
  };

  @ApiPropertyOptional({ description: 'Trigger quantum optimization' })
  @IsOptional()
  @IsBoolean()
  triggerQuantumOptimization?: boolean;
}

export class QuantumCampaignQueryDto {
  @ApiPropertyOptional({ description: 'Campaign type filter', enum: CampaignType })
  @IsOptional()
  @IsEnum(CampaignType)
  campaignType?: CampaignType;

  @ApiPropertyOptional({ description: 'Campaign status filter', enum: CampaignStatus })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiPropertyOptional({ description: 'Objective filter', enum: OptimizationObjective })
  @IsOptional()
  @IsEnum(OptimizationObjective)
  objective?: OptimizationObjective;

  @ApiPropertyOptional({ description: 'Start date filter', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @ApiPropertyOptional({ description: 'End date filter', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  endDateTo?: string;

  @ApiPropertyOptional({ description: 'Minimum budget filter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minBudget?: number;

  @ApiPropertyOptional({ description: 'Maximum budget filter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxBudget?: number;

  @ApiPropertyOptional({ description: 'Search by campaign name' })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiPropertyOptional({ description: 'Include performance metrics' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeMetrics?: boolean;

  @ApiPropertyOptional({ description: 'Include quantum analysis' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeQuantumAnalysis?: boolean;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

// ============== AI CONTENT GENERATION DTOs ==============

export class ContentGenerationRequestDto {
  @ApiProperty({ description: 'Type of content to generate', enum: ContentType })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiProperty({ description: 'Target audience description' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  targetAudience: string;

  @ApiPropertyOptional({ description: 'Content language', default: 'en' })
  @IsOptional()
  @IsString()
  @Length(2, 10)
  language?: string;

  @ApiPropertyOptional({ description: 'Content tone' })
  @IsOptional()
  @IsEnum(['professional', 'casual', 'friendly', 'authoritative', 'humorous', 'empathetic'])
  tone?: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'humorous' | 'empathetic';

  @ApiPropertyOptional({ description: 'Keywords to include', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  keywords?: string[];

  @ApiPropertyOptional({ description: 'Product/service information' })
  @IsOptional()
  @IsObject()
  productInfo?: {
    name: string;
    description: string;
    features: string[];
    benefits: string[];
    pricing: any;
  };

  @ApiPropertyOptional({ description: 'Content length preference' })
  @IsOptional()
  @IsEnum(['short', 'medium', 'long', 'custom'])
  contentLength?: 'short' | 'medium' | 'long' | 'custom';

  @ApiPropertyOptional({ description: 'Custom word count for content' })
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(10000)
  customWordCount?: number;

  @ApiPropertyOptional({ description: 'Generate multiple variations' })
  @IsOptional()
  @IsBoolean()
  generateVariations?: boolean;

  @ApiPropertyOptional({ description: 'Number of variations to generate' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  variationCount?: number;

  @ApiPropertyOptional({ description: 'Include SEO optimization' })
  @IsOptional()
  @IsBoolean()
  includeSEO?: boolean;

  @ApiPropertyOptional({ description: 'Include A/B test suggestions' })
  @IsOptional()
  @IsBoolean()
  includeABTestSuggestions?: boolean;
}

export class ContentOptimizationRequestDto {
  @ApiProperty({ description: 'Existing content ID' })
  @IsString()
  @IsNotEmpty()
  contentId: string;

  @ApiProperty({ description: 'Optimization goals', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  optimizationGoals: string[];

  @ApiPropertyOptional({ description: 'Performance data for optimization' })
  @IsOptional()
  @IsObject()
  performanceData?: {
    views: number;
    engagement: number;
    conversions: number;
    bounceRate: number;
    timeOnPage: number;
  };

  @ApiPropertyOptional({ description: 'Target demographic shifts' })
  @IsOptional()
  @IsObject()
  targetDemographicShifts?: any;

  @ApiPropertyOptional({ description: 'Quantum optimization level' })
  @IsOptional()
  @IsEnum(['basic', 'advanced', 'quantum'])
  quantumOptimizationLevel?: 'basic' | 'advanced' | 'quantum';
}

// ============== VIDEO AVATAR DTOs ==============

export class VideoAvatarCreationDto {
  @ApiProperty({ description: 'Video script content', maxLength: 5000 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 5000)
  script: string;

  @ApiPropertyOptional({ description: 'Avatar type' })
  @IsOptional()
  @IsEnum(['professional_presenter', 'casual_spokesperson', 'technical_expert', 'friendly_assistant'])
  avatarType?: 'professional_presenter' | 'casual_spokesperson' | 'technical_expert' | 'friendly_assistant';

  @ApiPropertyOptional({ description: 'Voice type' })
  @IsOptional()
  @IsEnum(['neutral_professional', 'warm_friendly', 'authoritative', 'conversational'])
  voiceType?: 'neutral_professional' | 'warm_friendly' | 'authoritative' | 'conversational';

  @ApiPropertyOptional({ description: 'Language for avatar', default: 'en-US' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Personalization settings' })
  @IsOptional()
  @IsObject()
  personalization?: {
    customerName?: string;
    companyName?: string;
    specificContent?: string;
  };

  @ApiPropertyOptional({ description: 'Customer data for personalization' })
  @IsOptional()
  @IsObject()
  customerData?: {
    demographics?: any;
    preferences?: any;
    history?: any;
  };

  @ApiPropertyOptional({ description: 'Background setting' })
  @IsOptional()
  @IsString()
  background?: string;

  @ApiPropertyOptional({ description: 'Branding settings' })
  @IsOptional()
  @IsObject()
  branding?: {
    enabled: boolean;
    logo?: string;
    colors?: string[];
    fonts?: string[];
  };

  @ApiPropertyOptional({ description: 'Video specifications' })
  @IsOptional()
  @IsObject()
  videoSpecs?: {
    resolution?: '720p' | '1080p' | '4K';
    duration?: number;
    format?: 'mp4' | 'avi' | 'mov';
  };
}

export class VoiceCloneRequestDto {
  @ApiProperty({ description: 'Reference voice sample URL' })
  @IsUrl()
  referenceVoiceUrl: string;

  @ApiProperty({ description: 'Text to be spoken with cloned voice', maxLength: 2000 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 2000)
  textToSpeak: string;

  @ApiPropertyOptional({ description: 'Voice characteristics to enhance' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enhanceCharacteristics?: string[];

  @ApiPropertyOptional({ description: 'Emotional tone to apply' })
  @IsOptional()
  @IsEnum(['neutral', 'happy', 'excited', 'calm', 'authoritative', 'empathetic'])
  emotionalTone?: 'neutral' | 'happy' | 'excited' | 'calm' | 'authoritative' | 'empathetic';
}

// ============== PREDICTIVE ANALYTICS DTOs ==============

export class PredictiveAnalyticsRequestDto {
  @ApiProperty({ description: 'Analysis type' })
  @IsEnum(['customer_ltv', 'churn_prediction', 'sales_forecast', 'campaign_performance', 'market_trends'])
  analysisType: 'customer_ltv' | 'churn_prediction' | 'sales_forecast' | 'campaign_performance' | 'market_trends';

  @ApiPropertyOptional({ description: 'Customer ID for customer-specific analysis' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Time horizon for predictions (days)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1825) // 5 years max
  timeHorizonDays?: number;

  @ApiPropertyOptional({ description: 'Include confidence intervals' })
  @IsOptional()
  @IsBoolean()
  includeConfidenceIntervals?: boolean;

  @ApiPropertyOptional({ description: 'Data filters' })
  @IsOptional()
  @IsObject()
  filters?: {
    dateRange?: [string, string];
    segments?: string[];
    products?: string[];
    channels?: string[];
  };

  @ApiPropertyOptional({ description: 'Use quantum algorithms for prediction' })
  @IsOptional()
  @IsBoolean()
  useQuantumAlgorithms?: boolean;
}

// ============== PERSONALIZATION DTOs ==============

export class PersonalizationRequestDto {
  @ApiProperty({ description: 'Customer ID for personalization' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ description: 'Content to personalize' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Personalization level' })
  @IsOptional()
  @IsEnum(['basic', 'advanced', 'quantum'])
  personalizationLevel?: 'basic' | 'advanced' | 'quantum';

  @ApiPropertyOptional({ description: 'Context information' })
  @IsOptional()
  @IsObject()
  context?: {
    currentPage?: string;
    sessionData?: any;
    deviceInfo?: any;
    location?: string;
    timeOfDay?: string;
  };

  @ApiPropertyOptional({ description: 'Personalization goals' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goals?: string[];
}

// ============== SOCIAL MEDIA DTOs ==============

export class SocialListeningRequestDto {
  @ApiProperty({ description: 'Keywords to monitor', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  keywords: string[];

  @ApiPropertyOptional({ description: 'Social platforms to monitor' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  platforms?: string[];

  @ApiPropertyOptional({ description: 'Monitoring time range (days)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  timeRangeDays?: number;

  @ApiPropertyOptional({ description: 'Language filters' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({ description: 'Geographic filters' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  geoFilters?: string[];

  @ApiPropertyOptional({ description: 'Sentiment analysis level' })
  @IsOptional()
  @IsEnum(['basic', 'advanced', 'quantum'])
  sentimentAnalysisLevel?: 'basic' | 'advanced' | 'quantum';

  @ApiPropertyOptional({ description: 'Include influencer analysis' })
  @IsOptional()
  @IsBoolean()
  includeInfluencerAnalysis?: boolean;
}

// ============== MARKET INTELLIGENCE DTOs ==============

export class MarketAnalysisRequestDto {
  @ApiProperty({ description: 'Industry or market to analyze' })
  @IsString()
  @IsNotEmpty()
  industry: string;

  @ApiPropertyOptional({ description: 'Geographic scope' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  geographicScope?: string[];

  @ApiPropertyOptional({ description: 'Competitor analysis depth' })
  @IsOptional()
  @IsEnum(['surface', 'comprehensive', 'deep_quantum'])
  competitorAnalysisDepth?: 'surface' | 'comprehensive' | 'deep_quantum';

  @ApiPropertyOptional({ description: 'Specific competitors to analyze' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specificCompetitors?: string[];

  @ApiPropertyOptional({ description: 'Analysis focus areas' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  focusAreas?: string[];

  @ApiPropertyOptional({ description: 'Time horizon for trends (months)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  trendHorizonMonths?: number;
}

// ============== LEAD MANAGEMENT DTOs ==============

export class LeadScoringRequestDto {
  @ApiProperty({ description: 'Lead ID to score' })
  @IsString()
  @IsNotEmpty()
  leadId: string;

  @ApiPropertyOptional({ description: 'Scoring model to use' })
  @IsOptional()
  @IsEnum(['traditional', 'ai_enhanced', 'quantum_optimized'])
  scoringModel?: 'traditional' | 'ai_enhanced' | 'quantum_optimized';

  @ApiPropertyOptional({ description: 'Additional data for scoring' })
  @IsOptional()
  @IsObject()
  additionalData?: {
    recentInteractions?: any[];
    behaviorMetrics?: any;
    externalData?: any;
  };

  @ApiPropertyOptional({ description: 'Real-time scoring' })
  @IsOptional()
  @IsBoolean()
  realTimeScoring?: boolean;
}

export class LeadNurturingRequestDto {
  @ApiProperty({ description: 'Lead ID for nurturing campaign' })
  @IsString()
  @IsNotEmpty()
  leadId: string;

  @ApiProperty({ description: 'Nurturing campaign type' })
  @IsEnum(['welcome_series', 'education_series', 'product_demo', 'case_study', 'custom'])
  campaignType: 'welcome_series' | 'education_series' | 'product_demo' | 'case_study' | 'custom';

  @ApiPropertyOptional({ description: 'Personalization level' })
  @IsOptional()
  @IsEnum(['basic', 'advanced', 'quantum'])
  personalizationLevel?: 'basic' | 'advanced' | 'quantum';

  @ApiPropertyOptional({ description: 'Nurturing timeline (days)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  timelineDays?: number;

  @ApiPropertyOptional({ description: 'Channel preferences' })
  @IsOptional()
  @IsArray()
  @IsEnum(CommunicationPreference, { each: true })
  channelPreferences?: CommunicationPreference[];

  @ApiPropertyOptional({ description: 'Custom content for nurturing' })
  @IsOptional()
  @IsObject()
  customContent?: {
    emails?: any[];
    videos?: any[];
    documents?: any[];
  };
}

// ============== RESPONSE DTOs ==============

export class NeuralCustomerResponseDto {
  @ApiProperty({ description: 'Customer ID' })
  id: string;

  @ApiProperty({ description: 'Full name' })
  fullName: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiPropertyOptional({ description: 'Company name' })
  company?: string;

  @ApiProperty({ description: 'Customer status', enum: CustomerStatus })
  status: CustomerStatus;

  @ApiProperty({ description: 'Lead score', enum: LeadScore })
  leadScore: LeadScore;

  @ApiProperty({ description: 'Engagement score (0-100)' })
  engagementScore: number;

  @ApiPropertyOptional({ description: 'AI personality profile summary' })
  personalityProfile?: {
    primaryTraits: string[];
    communicationPreference: string;
    decisionMakingStyle: string;
  };

  @ApiPropertyOptional({ description: 'Quantum behavior insights' })
  quantumInsights?: {
    currentEngagementState: string;
    conversionProbability: number;
    optimalContactTime: string;
  };

  @ApiProperty({ description: 'Creation date', type: String, format: 'date-time' })
  createdAt: string;

  @ApiProperty({ description: 'Last updated date', type: String, format: 'date-time' })
  updatedAt: string;
}

export class QuantumCampaignResponseDto {
  @ApiProperty({ description: 'Campaign ID' })
  id: string;

  @ApiProperty({ description: 'Campaign name' })
  campaignName: string;

  @ApiProperty({ description: 'Campaign type', enum: CampaignType })
  campaignType: CampaignType;

  @ApiProperty({ description: 'Campaign status', enum: CampaignStatus })
  status: CampaignStatus;

  @ApiProperty({ description: 'Budget allocated' })
  budget: number;

  @ApiProperty({ description: 'Actual spend' })
  actualSpend: number;

  @ApiProperty({ description: 'Performance metrics' })
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversionRate: number;
    roas: number;
  };

  @ApiProperty({ description: 'Quantum optimization score (0-1)' })
  quantumOptimizationScore: number;

  @ApiProperty({ description: 'Target audience size' })
  targetAudienceSize: number;

  @ApiProperty({ description: 'Campaign dates' })
  campaignDates: {
    startDate: string;
    endDate: string;
  };

  @ApiProperty({ description: 'Creation date', type: String, format: 'date-time' })
  createdAt: string;
}

// ============== BULK OPERATIONS & UTILITIES ==============

export class BulkOperationDto {
  @ApiProperty({ description: 'IDs to operate on', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsString({ each: true })
  ids: string[];

  @ApiProperty({ description: 'Operation type' })
  @IsEnum(['update', 'delete', 'export', 'tag', 'score', 'nurture', 'analyze'])
  operation: 'update' | 'delete' | 'export' | 'tag' | 'score' | 'nurture' | 'analyze';

  @ApiPropertyOptional({ description: 'Operation parameters' })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Execute asynchronously' })
  @IsOptional()
  @IsBoolean()
  async?: boolean;
}

export class SalesMarketingDashboardDto {
  @ApiProperty({ description: 'Active campaigns count' })
  activeCampaigns: number;

  @ApiProperty({ description: 'Total leads count' })
  totalLeads: number;

  @ApiProperty({ description: 'Conversion rate percentage' })
  conversionRate: number;

  @ApiProperty({ description: 'Revenue this month' })
  monthlyRevenue: number;

  @ApiProperty({ description: 'Average customer lifetime value' })
  averageLTV: number;

  @ApiProperty({ description: 'Quantum optimization usage percentage' })
  quantumOptimizationUsage: number;

  @ApiProperty({ description: 'AI content generation count this month' })
  aiContentGenerationCount: number;

  @ApiProperty({ description: 'Top performing campaigns', type: [String] })
  topPerformingCampaigns: string[];
}
