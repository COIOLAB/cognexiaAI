import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';

// Import existing services
import { AISalesMarketingService } from '../services/ai-sales-marketing.service';
import { AIContentGenerationService } from '../services/ai-content-generation.service';
import { MarketingAttributionService } from '../services/marketing-attribution.service';
import { SocialMediaIntelligenceService } from '../services/social-media-intelligence.service';
import { EmailMarketingIntelligenceService } from '../services/email-marketing-intelligence.service';
import { CompetitorIntelligenceService } from '../services/competitor-intelligence.service';
import { CustomerJourneyIntelligenceService } from '../services/customer-journey-intelligence.service';

// DTOs
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  MarketingAnalyticsDto,
  ContentGenerationDto,
  EmailCampaignDto,
  SocialMediaCampaignDto,
} from '../dto/marketing.dto';

@ApiTags('Marketing Management')
@Controller('marketing')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MarketingController {
  private readonly logger = new Logger(MarketingController.name);

  constructor(
    private readonly aiMarketingService: AISalesMarketingService,
    private readonly contentService: AIContentGenerationService,
    private readonly attributionService: MarketingAttributionService,
    private readonly socialMediaService: SocialMediaIntelligenceService,
    private readonly emailService: EmailMarketingIntelligenceService,
    private readonly competitorService: CompetitorIntelligenceService,
    private readonly journeyService: CustomerJourneyIntelligenceService,
  ) {}

  // =================== CAMPAIGNS MANAGEMENT ===================

  @Get('campaigns')
  @ApiOperation({
    summary: 'Get all marketing campaigns',
    description: 'Retrieve all marketing campaigns with performance metrics',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'active', 'paused', 'completed', 'cancelled'] })
  @ApiQuery({ name: 'type', required: false, enum: ['email', 'social', 'digital', 'content', 'webinar'] })
  @ApiQuery({ name: 'channel', required: false })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved successfully' })
  @Roles('admin', 'marketing_manager', 'marketing_specialist', 'viewer')
  async getAllCampaigns(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('channel') channel?: string,
  ) {
    try {
      this.logger.log('Fetching marketing campaigns with filters');
      
      return {
        success: true,
        data: {
          campaigns: [
            {
              id: 'CAMP-001',
              name: 'Industry 5.0 Product Launch',
              type: 'digital',
              status: 'active',
              startDate: new Date('2024-01-01'),
              endDate: new Date('2024-03-31'),
              budget: 150000,
              spent: 89500,
              channels: ['email', 'social', 'content', 'webinar'],
              targetAudience: {
                demographics: 'Manufacturing professionals, 30-55 years',
                industries: ['Manufacturing', 'Industrial Automation', 'Robotics'],
                geography: ['North America', 'Europe', 'Asia-Pacific'],
              },
              objectives: [
                'Increase brand awareness by 25%',
                'Generate 500 qualified leads',
                'Drive 15% increase in website traffic',
              ],
              performance: {
                impressions: 2500000,
                clicks: 125000,
                clickThroughRate: 5.0,
                conversions: 1250,
                conversionRate: 1.0,
                costPerClick: 0.72,
                costPerConversion: 71.60,
                roi: 185.5,
              },
              manager: {
                id: 'MGR-001',
                name: 'Sarah Marketing',
                email: 'sarah.marketing@company.com',
              },
            },
            {
              id: 'CAMP-002',
              name: 'Customer Retention Email Series',
              type: 'email',
              status: 'active',
              startDate: new Date('2024-02-01'),
              endDate: new Date('2024-04-30'),
              budget: 25000,
              spent: 8300,
              channels: ['email'],
              targetAudience: {
                segment: 'Existing customers',
                criteria: 'Last purchase > 90 days ago',
              },
              objectives: [
                'Reduce churn by 10%',
                'Increase repeat purchases by 20%',
                'Improve customer satisfaction score',
              ],
              performance: {
                emailsSent: 15000,
                openRate: 28.5,
                clickThroughRate: 4.2,
                unsubscribeRate: 0.8,
                conversions: 420,
                conversionRate: 2.8,
                roi: 245.0,
              },
            },
          ],
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(12 / limit),
            totalItems: 12,
            itemsPerPage: limit,
          },
          summary: {
            totalCampaigns: 12,
            activeCampaigns: 8,
            totalBudget: 500000,
            totalSpent: 285000,
            avgROI: 198.5,
          },
        },
        message: 'Marketing campaigns retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error fetching campaigns:', error);
      throw new HttpException('Failed to fetch campaigns', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('campaigns')
  @ApiOperation({
    summary: 'Create new marketing campaign',
    description: 'Create a new marketing campaign with AI-powered optimization suggestions',
  })
  @ApiResponse({ status: 201, description: 'Campaign created successfully' })
  @Roles('admin', 'marketing_manager', 'marketing_specialist')
  async createCampaign(@Body() campaignDto: CreateCampaignDto) {
    try {
      this.logger.log('Creating new marketing campaign');
      
      // Use AI service for campaign optimization
      const optimizedCampaign = await this.aiMarketingService.optimizeCampaign(campaignDto);
      
      return {
        success: true,
        data: {
          campaignId: 'CAMP-' + Date.now(),
          name: campaignDto.name,
          status: 'draft',
          optimizations: optimizedCampaign.suggestions,
          estimatedPerformance: optimizedCampaign.estimatedMetrics,
          createdAt: new Date(),
        },
        message: 'Marketing campaign created successfully',
      };
    } catch (error) {
      this.logger.error('Error creating campaign:', error);
      throw new HttpException('Failed to create campaign', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Get campaign details by ID' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign details retrieved successfully' })
  @Roles('admin', 'marketing_manager', 'marketing_specialist', 'viewer')
  async getCampaign(@Param('id') id: string) {
    try {
      this.logger.log(`Fetching campaign details: ${id}`);
      
      // Get detailed campaign performance from attribution service
      const attribution = await this.attributionService.getCampaignAttribution(id);
      
      return {
        success: true,
        data: {
          // Campaign details with attribution data
          attribution: attribution.touchpoints,
          customerJourney: attribution.journeyMetrics,
        },
        message: 'Campaign details retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error fetching campaign:', error);
      throw new HttpException('Campaign not found', HttpStatus.NOT_FOUND);
    }
  }

  @Put('campaigns/:id')
  @ApiOperation({ summary: 'Update marketing campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign updated successfully' })
  @Roles('admin', 'marketing_manager', 'marketing_specialist')
  async updateCampaign(@Param('id') id: string, @Body() updateDto: UpdateCampaignDto) {
    try {
      this.logger.log(`Updating campaign: ${id}`);
      
      return {
        success: true,
        data: { campaignId: id, updatedAt: new Date() },
        message: 'Campaign updated successfully',
      };
    } catch (error) {
      this.logger.error('Error updating campaign:', error);
      throw new HttpException('Failed to update campaign', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== CONTENT MANAGEMENT ===================

  @Post('content/generate')
  @ApiOperation({
    summary: 'Generate AI-powered marketing content',
    description: 'Generate marketing content using AI based on campaign objectives and audience',
  })
  @ApiResponse({ status: 200, description: 'Content generated successfully' })
  @Roles('admin', 'marketing_manager', 'marketing_specialist')
  async generateContent(@Body() contentDto: ContentGenerationDto) {
    try {
      this.logger.log('Generating AI-powered content');
      
      const generatedContent = await this.contentService.generateContent(contentDto);
      
      return {
        success: true,
        data: {
          content: generatedContent.content,
          variations: generatedContent.variations,
          seoScore: generatedContent.seoAnalysis.score,
          recommendations: generatedContent.optimizationSuggestions,
          estimatedPerformance: generatedContent.performancePrediction,
        },
        message: 'Marketing content generated successfully',
      };
    } catch (error) {
      this.logger.error('Error generating content:', error);
      throw new HttpException('Failed to generate content', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('content/performance')
  @ApiOperation({ summary: 'Get content performance analytics' })
  @ApiQuery({ name: 'period', required: false, enum: ['7d', '30d', '90d', '1y'] })
  @ApiQuery({ name: 'contentType', required: false, enum: ['blog', 'email', 'social', 'video', 'whitepaper'] })
  @ApiResponse({ status: 200, description: 'Content performance retrieved successfully' })
  @Roles('admin', 'marketing_manager', 'marketing_specialist', 'viewer')
  async getContentPerformance(
    @Query('period') period: string = '30d',
    @Query('contentType') contentType?: string,
  ) {
    try {
      this.logger.log(`Fetching content performance for period: ${period}`);
      
      return {
        success: true,
        data: {
          period,
          overview: {
            totalContent: 145,
            totalViews: 285000,
            totalEngagements: 42000,
            avgEngagementRate: 14.7,
            topPerformingType: 'video',
          },
          byType: [
            { type: 'blog', count: 45, views: 120000, engagementRate: 12.5 },
            { type: 'video', count: 25, views: 95000, engagementRate: 18.2 },
            { type: 'social', count: 60, views: 55000, engagementRate: 8.9 },
            { type: 'email', count: 15, views: 15000, engagementRate: 25.6 },
          ],
          trending: [
            { title: 'Industry 5.0: The Future of Manufacturing', views: 12500, engagements: 1850 },
            { title: 'AI in Production Planning', views: 8900, engagements: 1340 },
          ],
        },
        message: 'Content performance retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error fetching content performance:', error);
      throw new HttpException('Failed to fetch content performance', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== SOCIAL MEDIA MANAGEMENT ===================

  @Get('social/analytics')
  @ApiOperation({ summary: 'Get social media analytics and insights' })
  @ApiQuery({ name: 'platform', required: false, enum: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'] })
  @ApiQuery({ name: 'period', required: false, enum: ['7d', '30d', '90d'] })
  @ApiResponse({ status: 200, description: 'Social media analytics retrieved successfully' })
  @Roles('admin', 'marketing_manager', 'marketing_specialist', 'viewer')
  async getSocialMediaAnalytics(
    @Query('platform') platform?: string,
    @Query('period') period: string = '30d',
  ) {
    try {
      this.logger.log(`Fetching social media analytics: ${platform || 'all platforms'}`);
      
      const analytics = await this.socialMediaService.getAnalytics({
        platform,
        period,
        includeCompetitorData: true,
      });
      
      return {
        success: true,
        data: {
          period,
          platform: platform || 'all',
          metrics: analytics.metrics,
          engagement: analytics.engagement,
          audience: analytics.audienceInsights,
          competitorComparison: analytics.competitorBenchmark,
          recommendations: analytics.optimizationSuggestions,
        },
        message: 'Social media analytics retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error fetching social media analytics:', error);
      throw new HttpException('Failed to fetch social analytics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('social/schedule')
  @ApiOperation({
    summary: 'Schedule social media posts',
    description: 'Schedule social media posts with AI-powered content optimization',
  })
  @ApiResponse({ status: 201, description: 'Social media posts scheduled successfully' })
  @Roles('admin', 'marketing_manager', 'marketing_specialist')
  async scheduleSocialPosts(@Body() campaignDto: SocialMediaCampaignDto) {
    try {
      this.logger.log('Scheduling social media posts');
      
      const optimizedPosts = await this.socialMediaService.optimizePosts(campaignDto);
      
      return {
        success: true,
        data: {
          scheduledPosts: optimizedPosts.posts.length,
          platforms: optimizedPosts.platforms,
          scheduledTimes: optimizedPosts.optimalTimes,
          estimatedReach: optimizedPosts.estimatedMetrics.reach,
          estimatedEngagement: optimizedPosts.estimatedMetrics.engagement,
        },
        message: 'Social media posts scheduled successfully',
      };
    } catch (error) {
      this.logger.error('Error scheduling social posts:', error);
      throw new HttpException('Failed to schedule social posts', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== EMAIL MARKETING ===================

  @Get('email/campaigns')
  @ApiOperation({ summary: 'Get email marketing campaigns' })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'scheduled', 'sent', 'paused'] })
  @ApiResponse({ status: 200, description: 'Email campaigns retrieved successfully' })
  @Roles('admin', 'marketing_manager', 'marketing_specialist', 'viewer')
  async getEmailCampaigns(@Query('status') status?: string) {
    try {
      this.logger.log('Fetching email marketing campaigns');
      
      const campaigns = await this.emailService.getCampaigns({ status });
      
      return {
        success: true,
        data: campaigns,
        message: 'Email campaigns retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error fetching email campaigns:', error);
      throw new HttpException('Failed to fetch email campaigns', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('email/campaigns')
  @ApiOperation({
    summary: 'Create email marketing campaign',
    description: 'Create email campaign with AI-powered content optimization and send time optimization',
  })
  @ApiResponse({ status: 201, description: 'Email campaign created successfully' })
  @Roles('admin', 'marketing_manager', 'marketing_specialist')
  async createEmailCampaign(@Body() emailDto: EmailCampaignDto) {
    try {
      this.logger.log('Creating email marketing campaign');
      
      const optimizedCampaign = await this.emailService.createCampaign(emailDto);
      
      return {
        success: true,
        data: {
          campaignId: optimizedCampaign.id,
          optimizations: optimizedCampaign.optimizations,
          estimatedPerformance: optimizedCampaign.estimatedMetrics,
          optimalSendTime: optimizedCampaign.optimalSendTime,
        },
        message: 'Email campaign created successfully',
      };
    } catch (error) {
      this.logger.error('Error creating email campaign:', error);
      throw new HttpException('Failed to create email campaign', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== COMPETITOR INTELLIGENCE ===================

  @Get('competitor/analysis')
  @ApiOperation({ summary: 'Get competitor intelligence and market analysis' })
  @ApiQuery({ name: 'competitor', required: false })
  @ApiQuery({ name: 'metric', required: false, enum: ['social', 'content', 'campaigns', 'pricing'] })
  @ApiResponse({ status: 200, description: 'Competitor analysis retrieved successfully' })
  @Roles('admin', 'marketing_manager', 'marketing_specialist', 'viewer')
  async getCompetitorAnalysis(
    @Query('competitor') competitor?: string,
    @Query('metric') metric?: string,
  ) {
    try {
      this.logger.log('Fetching competitor intelligence');
      
      const analysis = await this.competitorService.getCompetitorAnalysis({
        competitor,
        metric,
        includeMarketShare: true,
        includeTrends: true,
      });
      
      return {
        success: true,
        data: {
          competitors: analysis.competitors,
          marketShare: analysis.marketShare,
          benchmarking: analysis.benchmarks,
          opportunities: analysis.opportunities,
          threats: analysis.threats,
          recommendations: analysis.strategicRecommendations,
        },
        message: 'Competitor analysis retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error fetching competitor analysis:', error);
      throw new HttpException('Failed to fetch competitor analysis', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== CUSTOMER JOURNEY ===================

  @Get('journey/analysis')
  @ApiOperation({ summary: 'Get customer journey analytics' })
  @ApiQuery({ name: 'segment', required: false })
  @ApiQuery({ name: 'timeframe', required: false, enum: ['30d', '90d', '1y'] })
  @ApiResponse({ status: 200, description: 'Customer journey analysis retrieved successfully' })
  @Roles('admin', 'marketing_manager', 'marketing_specialist', 'viewer')
  async getCustomerJourneyAnalysis(
    @Query('segment') segment?: string,
    @Query('timeframe') timeframe: string = '90d',
  ) {
    try {
      this.logger.log('Fetching customer journey analysis');
      
      const journeyAnalysis = await this.journeyService.analyzeCustomerJourney({
        segment,
        timeframe,
        includeTouchpoints: true,
        includeConversionPaths: true,
      });
      
      return {
        success: true,
        data: {
          segments: journeyAnalysis.segments,
          touchpoints: journeyAnalysis.touchpoints,
          conversionPaths: journeyAnalysis.conversionPaths,
          dropoffPoints: journeyAnalysis.dropoffAnalysis,
          recommendations: journeyAnalysis.optimizationRecommendations,
          attribution: journeyAnalysis.attributionModel,
        },
        message: 'Customer journey analysis retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error fetching journey analysis:', error);
      throw new HttpException('Failed to fetch journey analysis', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== MARKETING ANALYTICS ===================

  @Get('analytics/overview')
  @ApiOperation({ summary: 'Get comprehensive marketing analytics overview' })
  @ApiQuery({ name: 'period', required: false, enum: ['7d', '30d', '90d', '1y'] })
  @ApiResponse({ status: 200, description: 'Marketing analytics overview retrieved successfully' })
  @Roles('admin', 'marketing_manager', 'marketing_specialist', 'viewer')
  async getMarketingOverview(@Query('period') period: string = '30d') {
    try {
      this.logger.log(`Fetching marketing overview for period: ${period}`);
      
      const attribution = await this.attributionService.getOverallAttribution({ period });
      
      return {
        success: true,
        data: {
          period,
          overview: {
            totalCampaigns: 12,
            activeCampaigns: 8,
            totalBudget: 500000,
            totalSpent: 285000,
            totalLeads: 1245,
            qualifiedLeads: 524,
            costPerLead: 228.90,
            roi: 185.5,
          },
          channelPerformance: attribution.channelMetrics,
          campaignPerformance: attribution.campaignMetrics,
          leadQuality: attribution.leadQualityMetrics,
          attribution: attribution.attributionModel,
          trends: attribution.trends,
          recommendations: attribution.optimizationSuggestions,
        },
        message: 'Marketing analytics overview retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error fetching marketing overview:', error);
      throw new HttpException('Failed to fetch marketing overview', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
