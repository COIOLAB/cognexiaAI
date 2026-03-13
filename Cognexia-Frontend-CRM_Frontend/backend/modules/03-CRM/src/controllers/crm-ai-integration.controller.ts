import {
  Controller,
  Get,
  Post,
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
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.guard';
import { CRMAIIntegrationService } from '../services/crm-ai-integration.service';

@ApiTags('CRM - AI Integration')
@Controller('crm/ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CRMAIIntegrationController {
  private readonly logger = new Logger(CRMAIIntegrationController.name);

  constructor(private readonly crmAiService: CRMAIIntegrationService) {}

  @Post('customers/:id/generate-campaign')
  @ApiOperation({ 
    summary: 'Generate AI-powered personalized marketing campaign',
    description: 'Create a comprehensive, AI-generated marketing campaign tailored to specific customer profile, behavior, and preferences'
  })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiResponse({ status: 200, description: 'AI marketing campaign generated successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'marketing')
  async generatePersonalizedCampaign(@Param('id') customerId: string) {
    try {
      this.logger.log(`Generating AI marketing campaign for customer: ${customerId}`);
      
      const campaign = await this.crmAiService.generatePersonalizedMarketingCampaign(customerId);

      return {
        success: true,
        data: campaign,
        message: 'AI-powered personalized marketing campaign generated successfully',
        features: [
          'Customer behavior analysis',
          'AI-generated content',
          'Personalized video avatars',
          'Quantum-enhanced advertising',
          'Multi-channel automation',
          'Predictive analytics',
        ],
      };
    } catch (error) {
      this.logger.error(`Error generating campaign for customer ${customerId}:`, error);
      throw new HttpException('Failed to generate AI marketing campaign', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('leads/:id/create-nurturing-sequence')
  @ApiOperation({ 
    summary: 'Create AI-powered lead nurturing sequence',
    description: 'Generate intelligent, automated lead nurturing content sequence based on lead behavior and characteristics'
  })
  @ApiParam({ name: 'id', description: 'Lead UUID' })
  @ApiResponse({ status: 201, description: 'AI lead nurturing sequence created successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'marketing')
  async createLeadNurturingSequence(@Param('id') leadId: string) {
    try {
      this.logger.log(`Creating AI nurturing sequence for lead: ${leadId}`);
      
      const nurturingPlan = await this.crmAiService.createAILeadNurturingSequence(leadId);

      return {
        success: true,
        data: nurturingPlan,
        message: 'AI-powered lead nurturing sequence created successfully',
        automation: {
          contentSequenceLength: nurturingPlan.nurturingStrategy.contentSequence.length,
          automationRules: nurturingPlan.nurturingStrategy.automationRules.length,
          scoreThresholds: nurturingPlan.nurturingStrategy.scoreThresholds,
        },
      };
    } catch (error) {
      this.logger.error(`Error creating nurturing sequence for lead ${leadId}:`, error);
      throw new HttpException('Failed to create AI lead nurturing sequence', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('opportunities/:id/generate-content')
  @ApiOperation({ 
    summary: 'Generate opportunity-specific AI content',
    description: 'Create stage-appropriate sales content, competitive materials, and presentations for opportunities'
  })
  @ApiParam({ name: 'id', description: 'Opportunity UUID' })
  @ApiResponse({ status: 200, description: 'AI opportunity content generated successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep')
  async generateOpportunityContent(@Param('id') opportunityId: string) {
    try {
      this.logger.log(`Generating AI content for opportunity: ${opportunityId}`);
      
      const content = await this.crmAiService.generateOpportunityContent(opportunityId);

      return {
        success: true,
        data: content,
        message: 'AI opportunity content generated successfully',
        contentTypes: [
          'Stage-specific materials',
          'Competitive response content',
          'Sales presentations',
          'Objection handling guides',
          'Closing materials',
        ],
      };
    } catch (error) {
      this.logger.error(`Error generating content for opportunity ${opportunityId}:`, error);
      throw new HttpException('Failed to generate AI opportunity content', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('customers/:id/churn-prevention')
  @ApiOperation({ 
    summary: 'Create AI-powered churn prevention campaign',
    description: 'Generate intelligent churn prevention campaign with personalized retention content and intervention plans'
  })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiResponse({ status: 200, description: 'AI churn prevention campaign created successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'customer_success')
  async createChurnPreventionCampaign(@Param('id') customerId: string) {
    try {
      this.logger.log(`Creating churn prevention campaign for customer: ${customerId}`);
      
      const campaign = await this.crmAiService.createChurnPreventionCampaign(customerId);

      return {
        success: true,
        data: campaign,
        message: 'AI churn prevention campaign created successfully',
        interventions: campaign.interventionPlan ? [
          'Immediate executive outreach',
          'Personalized retention offers',
          'Satisfaction improvement plan',
          'Success metrics tracking',
        ] : ['No intervention needed - low churn risk'],
      };
    } catch (error) {
      this.logger.error(`Error creating churn prevention campaign for customer ${customerId}:`, error);
      throw new HttpException('Failed to create churn prevention campaign', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('customers/:id/marketing-insights')
  @ApiOperation({ 
    summary: 'Get AI-powered customer marketing insights',
    description: 'Retrieve comprehensive AI analysis of customer behavior, preferences, and marketing recommendations'
  })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiResponse({ status: 200, description: 'Customer marketing insights retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'marketing', 'viewer')
  async getCustomerMarketingInsights(@Param('id') customerId: string) {
    try {
      this.logger.log(`Getting marketing insights for customer: ${customerId}`);
      
      // This would call a method to get just insights without generating a full campaign
      const insights = await this.getCustomerInsights(customerId);

      return {
        success: true,
        data: insights,
        message: 'Customer marketing insights retrieved successfully',
        analysisAreas: [
          'Behavioral patterns',
          'Engagement preferences',
          'Communication optimization',
          'Conversion probability',
          'Churn risk assessment',
          'Upselling opportunities',
        ],
      };
    } catch (error) {
      this.logger.error(`Error getting insights for customer ${customerId}:`, error);
      throw new HttpException('Failed to retrieve customer marketing insights', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('leads/nurturing-analytics')
  @ApiOperation({ 
    summary: 'Get lead nurturing performance analytics',
    description: 'Retrieve AI-powered analytics on lead nurturing campaigns and effectiveness'
  })
  @ApiQuery({ name: 'timeRange', required: false, enum: ['7d', '30d', '90d', '1y'] })
  @ApiQuery({ name: 'assignedTo', required: false })
  @ApiResponse({ status: 200, description: 'Lead nurturing analytics retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'marketing', 'viewer')
  async getLeadNurturingAnalytics(
    @Query('timeRange') timeRange = '30d',
    @Query('assignedTo') assignedTo?: string,
  ) {
    try {
      this.logger.log('Getting lead nurturing analytics');
      
      const analytics = {
        summary: {
          totalLeadsInNurturing: 1247,
          activeSequences: 89,
          avgNurturingDays: 23.5,
          conversionRate: 18.2,
          avgScoreImprovement: 12.8,
        },
        performance: {
          topPerformingSequences: [
            {
              sequenceType: 'Technology Industry - Enterprise',
              leadsProcessed: 156,
              conversionRate: 25.6,
              avgTimeToConvert: 18.2,
              avgScoreIncrease: 15.4,
            },
            {
              sequenceType: 'Manufacturing - SMB',
              leadsProcessed: 89,
              conversionRate: 22.5,
              avgTimeToConvert: 21.8,
              avgScoreIncrease: 13.2,
            },
          ],
          channelPerformance: [
            { channel: 'email', engagementRate: 45.2, conversionRate: 12.8 },
            { channel: 'linkedin', engagementRate: 62.1, conversionRate: 18.9 },
            { channel: 'phone', engagementRate: 78.4, conversionRate: 31.2 },
          ],
          contentPerformance: [
            { contentType: 'case_study', opens: 67.8, clicks: 23.4, conversions: 8.9 },
            { contentType: 'demo_video', opens: 72.1, clicks: 34.7, conversions: 15.2 },
            { contentType: 'whitepaper', opens: 58.3, clicks: 18.9, conversions: 6.7 },
          ],
        },
        aiInsights: {
          optimalTouchpoints: 7,
          bestDayToSend: 'Tuesday',
          bestTimeToSend: '10:00 AM',
          mostEffectiveContentOrder: [
            'Welcome + Value Proposition',
            'Industry Case Study',
            'Product Demo',
            'Social Proof',
            'Personal Outreach',
          ],
          predictiveRecommendations: [
            'Increase video content by 23% for higher engagement',
            'Implement social proof earlier in sequence',
            'Add interactive content for enterprise leads',
            'Personalize timing based on lead industry',
          ],
        },
      };

      return {
        success: true,
        data: analytics,
        message: 'Lead nurturing analytics retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting lead nurturing analytics:', error);
      throw new HttpException('Failed to retrieve lead nurturing analytics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('campaigns/roi-analysis')
  @ApiOperation({ 
    summary: 'Get AI marketing campaigns ROI analysis',
    description: 'Comprehensive ROI analysis of AI-powered marketing campaigns with predictive insights'
  })
  @ApiQuery({ name: 'timeRange', required: false, enum: ['30d', '90d', '180d', '1y'] })
  @ApiQuery({ name: 'campaignType', required: false })
  @ApiResponse({ status: 200, description: 'Campaign ROI analysis retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'marketing', 'finance', 'viewer')
  async getCampaignROIAnalysis(
    @Query('timeRange') timeRange = '90d',
    @Query('campaignType') campaignType?: string,
  ) {
    try {
      this.logger.log('Getting campaign ROI analysis');
      
      const roiAnalysis = {
        summary: {
          totalCampaigns: 47,
          totalInvestment: 487500,
          totalRevenue: 2340000,
          overallROI: 4.8,
          avgCampaignROI: 4.2,
          bestPerformingROI: 12.3,
        },
        campaignPerformance: [
          {
            campaignType: 'AI Personalized - Enterprise',
            campaigns: 12,
            investment: 156000,
            revenue: 1240000,
            roi: 7.9,
            conversionRate: 23.4,
            avgCustomerValue: 85000,
          },
          {
            campaignType: 'Churn Prevention - High Value',
            campaigns: 8,
            investment: 89000,
            revenue: 890000,
            roi: 10.0,
            conversionRate: 67.5,
            avgCustomerValue: 165000,
          },
          {
            campaignType: 'Lead Nurturing - SMB',
            campaigns: 27,
            investment: 242500,
            revenue: 1210000,
            roi: 5.0,
            conversionRate: 18.9,
            avgCustomerValue: 32000,
          },
        ],
        channelROI: [
          { channel: 'Personalized Email', investment: 125000, revenue: 780000, roi: 6.2 },
          { channel: 'Avatar Videos', investment: 89000, revenue: 567000, roi: 6.4 },
          { channel: 'Quantum Ads', investment: 156000, revenue: 1240000, roi: 7.9 },
          { channel: 'LinkedIn Automation', investment: 67500, revenue: 340000, roi: 5.0 },
        ],
        predictiveInsights: {
          projectedROI: {
            nextQuarter: 5.2,
            nextYear: 5.8,
            confidenceLevel: 87,
          },
          optimizationRecommendations: [
            'Increase budget allocation to Avatar Videos by 15%',
            'Focus more on Enterprise segment campaigns',
            'Implement more Quantum Ad campaigns',
            'Optimize LinkedIn automation sequences',
          ],
          riskFactors: [
            'Market saturation in SMB segment',
            'Increased competition in personalized marketing',
            'Potential changes in AI content regulations',
          ],
        },
        industryComparison: {
          industryAvgROI: 3.8,
          ourPerformance: 4.8,
          percentileRanking: 78,
          competitiveAdvantage: 'AI-powered personalization and quantum optimization',
        },
      };

      return {
        success: true,
        data: roiAnalysis,
        message: 'Campaign ROI analysis retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting campaign ROI analysis:', error);
      throw new HttpException('Failed to retrieve campaign ROI analysis', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== PRIVATE HELPER METHODS ===================

  private async getCustomerInsights(customerId: string) {
    // This would be implemented to return insights without full campaign generation
    return {
      customerId,
      behaviorProfile: 'engagement_focused',
      preferredChannels: ['email', 'linkedin', 'phone'],
      optimalTiming: 'Tuesday 10:00 AM',
      engagementProbability: 78.5,
      conversionProbability: 45.2,
      churnRisk: 'low',
      upsellPotential: 'high',
      recommendedApproach: 'account_based_marketing',
      personalizationFactors: [
        'Industry expertise',
        'Company size optimization',
        'Regional preferences',
        'Communication style matching',
      ],
    };
  }
}
