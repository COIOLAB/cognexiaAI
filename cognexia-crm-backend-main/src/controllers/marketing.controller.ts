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
  ParseUUIDPipe,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';
import { MarketingService } from '../services/marketing.service';

import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CreateCustomerSegmentDto,
  EmailTemplateDto,
  UpdateEmailTemplateDto,
  SendEmailCampaignDto,
  MarketingAnalyticsRequestDto,
  CampaignStatus,
  CampaignType,
} from '../dto/marketing.dto';

@ApiTags('CRM - Marketing Management')
@Controller('crm/marketing')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MarketingController {
  private readonly logger = new Logger(MarketingController.name);

  constructor(private readonly marketingService: MarketingService) {}

  // ==================== CAMPAIGN MANAGEMENT ====================

  @Post('campaigns')
  @ApiOperation({
    summary: 'Create new marketing campaign',
    description: 'Create a comprehensive marketing campaign with targeting, content, and scheduling'
  })
  @ApiBody({ type: CreateCampaignDto })
  @ApiResponse({ status: 201, description: 'Campaign created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid campaign data' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist')
  async createCampaign(@Body() createCampaignDto: CreateCampaignDto, @Request() req) {
    try {
      const campaign = await this.marketingService.createCampaign(
        createCampaignDto,
        req.user?.id || req.user?.userId || 'system'
      );

      return {
        success: true,
        data: campaign,
        message: 'Marketing campaign created successfully',
      };
    } catch (error) {
      this.logger.error('Error creating marketing campaign:', error);
      throw new HttpException('Failed to create campaign', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('campaigns')
  @ApiOperation({
    summary: 'Get all marketing campaigns',
    description: 'Retrieve all marketing campaigns with filtering options'
  })
  @ApiQuery({ name: 'status', required: false, enum: CampaignStatus })
  @ApiQuery({ name: 'type', required: false, enum: CampaignType })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved successfully' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist', 'viewer')
  async getAllCampaigns(
    @Query('status') status?: CampaignStatus,
    @Query('type') type?: CampaignType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const campaigns = await this.marketingService.getAllCampaigns({
        status,
        type: type as string,
        startDate,
        endDate,
      });

      return {
        success: true,
        data: campaigns,
        message: 'Campaigns retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error retrieving campaigns:', error);
      throw new HttpException('Failed to retrieve campaigns', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('campaigns/:id')
  @ApiOperation({
    summary: 'Get campaign by ID',
    description: 'Retrieve detailed information about a specific campaign'
  })
  @ApiParam({ name: 'id', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'Campaign retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist', 'viewer')
  async getCampaignById(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const campaign = await this.marketingService.getCampaignById(id);

      return {
        success: true,
        data: campaign,
        message: 'Campaign retrieved successfully',
      };
    } catch (error) {
      this.logger.error(`Error retrieving campaign ${id}:`, error);
      throw new HttpException(error.message || 'Failed to retrieve campaign', HttpStatus.NOT_FOUND);
    }
  }

  @Put('campaigns/:id')
  @ApiOperation({
    summary: 'Update marketing campaign',
    description: 'Update campaign details, status, or configuration'
  })
  @ApiParam({ name: 'id', description: 'Campaign UUID' })
  @ApiBody({ type: UpdateCampaignDto })
  @ApiResponse({ status: 200, description: 'Campaign updated successfully' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist')
  async updateCampaign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @Request() req,
  ) {
    try {
      const campaign = await this.marketingService.updateCampaign(
        id,
        updateCampaignDto,
        req.user?.id || req.user?.userId || 'system'
      );

      return {
        success: true,
        data: campaign,
        message: 'Campaign updated successfully',
      };
    } catch (error) {
      this.logger.error(`Error updating campaign ${id}:`, error);
      throw new HttpException(error.message || 'Failed to update campaign', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('campaigns/:id')
  @ApiOperation({
    summary: 'Delete marketing campaign',
    description: 'Permanently delete a marketing campaign and its associated data'
  })
  @ApiParam({ name: 'id', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'Campaign deleted successfully' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @Roles('admin', 'manager', 'marketing_manager')
  async deleteCampaign(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.marketingService.deleteCampaign(id);

      return {
        success: true,
        message: 'Campaign deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Error deleting campaign ${id}:`, error);
      throw new HttpException(error.message || 'Failed to delete campaign', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('campaigns/:id/activate')
  @ApiOperation({
    summary: 'Activate marketing campaign',
    description: 'Manually activate a scheduled or draft campaign'
  })
  @ApiParam({ name: 'id', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'Campaign activated successfully' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist')
  async activateCampaign(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.marketingService.activateCampaign(id);

      return {
        success: true,
        message: 'Campaign activated successfully',
      };
    } catch (error) {
      this.logger.error(`Error activating campaign ${id}:`, error);
      throw new HttpException('Failed to activate campaign', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('campaigns/:id/roi')
  @ApiOperation({
    summary: 'Get campaign ROI',
    description: 'Calculate and retrieve return on investment for a campaign'
  })
  @ApiParam({ name: 'id', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'ROI calculated successfully' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist', 'viewer')
  async getCampaignROI(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const roi = await this.marketingService.getCampaignROI(id);

      return {
        success: true,
        data: { campaignId: id, roi },
        message: 'Campaign ROI calculated successfully',
      };
    } catch (error) {
      this.logger.error(`Error calculating ROI for campaign ${id}:`, error);
      throw new HttpException('Failed to calculate ROI', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== EMAIL TEMPLATES ====================

  @Post('templates')
  @ApiOperation({
    summary: 'Create email template',
    description: 'Create a reusable email template for marketing campaigns'
  })
  @ApiBody({ type: EmailTemplateDto })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist')
  async createEmailTemplate(@Body() templateDto: EmailTemplateDto, @Request() req) {
    try {
      const template = await this.marketingService.createEmailTemplate(
        templateDto,
        req.user?.id || req.user?.userId || 'system'
      );

      return {
        success: true,
        data: template,
        message: 'Email template created successfully',
      };
    } catch (error) {
      this.logger.error('Error creating email template:', error);
      throw new HttpException('Failed to create template', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('templates')
  @ApiOperation({
    summary: 'Get all email templates',
    description: 'Retrieve all available email templates with optional category filtering'
  })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist', 'viewer')
  async getAllEmailTemplates(
    @Query('category') category?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    try {
      const pagination = await this.marketingService.getAllEmailTemplates({
        category,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      });

      return {
        success: true,
        data: pagination,
        message: 'Email templates retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error retrieving templates:', error);
      throw new HttpException('Failed to retrieve templates', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('templates/stats')
  @ApiOperation({
    summary: 'Get email template statistics',
    description: 'Retrieve summary stats for email templates'
  })
  @ApiResponse({ status: 200, description: 'Template stats retrieved successfully' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist', 'viewer')
  async getTemplateStats() {
    try {
      const stats = await this.marketingService.getTemplateStats();
      return {
        success: true,
        data: stats,
        message: 'Template stats retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error retrieving template stats:', error);
      throw new HttpException('Failed to retrieve template stats', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('templates/:id')
  @ApiOperation({
    summary: 'Get email template by ID',
    description: 'Retrieve specific email template details'
  })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist', 'viewer')
  async getEmailTemplateById(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const template = await this.marketingService.getEmailTemplateById(id);

      return {
        success: true,
        data: template,
        message: 'Email template retrieved successfully',
      };
    } catch (error) {
      this.logger.error(`Error retrieving template ${id}:`, error);
      throw new HttpException(error.message || 'Failed to retrieve template', HttpStatus.NOT_FOUND);
    }
  }

  @Put('templates/:id')
  @ApiOperation({
    summary: 'Update email template',
    description: 'Update an existing email template'
  })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiBody({ type: UpdateEmailTemplateDto })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist')
  async updateEmailTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() templateDto: UpdateEmailTemplateDto,
    @Request() req,
  ) {
    try {
      const template = await this.marketingService.updateEmailTemplate(
        id,
        templateDto,
        req.user?.id || req.user?.userId || 'system'
      );

      return {
        success: true,
        data: template,
        message: 'Email template updated successfully',
      };
    } catch (error) {
      this.logger.error(`Error updating template ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to update template', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('templates/:id')
  @ApiOperation({
    summary: 'Delete email template',
    description: 'Remove an email template by ID'
  })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist')
  async deleteEmailTemplate(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.marketingService.deleteEmailTemplate(id);
      return {
        success: true,
        message: 'Email template deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Error deleting template ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to delete template', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('templates/:id/duplicate')
  @ApiOperation({
    summary: 'Duplicate email template',
    description: 'Create a copy of an existing email template'
  })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiResponse({ status: 201, description: 'Template duplicated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist')
  async duplicateEmailTemplate(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    try {
      const template = await this.marketingService.duplicateEmailTemplate(
        id,
        req.user?.id || req.user?.userId || 'system'
      );

      return {
        success: true,
        data: template,
        message: 'Email template duplicated successfully',
      };
    } catch (error) {
      this.logger.error(`Error duplicating template ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to duplicate template', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== CAMPAIGN EXECUTION ====================

  @Post('campaigns/send-email')
  @ApiOperation({
    summary: 'Send email campaign',
    description: 'Execute email campaign to target segments with specified template'
  })
  @ApiBody({ type: SendEmailCampaignDto })
  @ApiResponse({ status: 200, description: 'Email campaign sent successfully' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist')
  async sendEmailCampaign(@Body() sendEmailDto: SendEmailCampaignDto) {
    try {
      const result = await this.marketingService.sendEmailCampaign(sendEmailDto);

      return {
        success: true,
        data: result,
        message: 'Email campaign executed successfully',
      };
    } catch (error) {
      this.logger.error('Error sending email campaign:', error);
      throw new HttpException('Failed to send email campaign', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== CUSTOMER SEGMENTATION ====================

  @Get('segments')
  @ApiOperation({
    summary: 'Get all customer segments',
    description: 'Retrieve all available customer segments'
  })
  @ApiResponse({ status: 200, description: 'Segments retrieved successfully' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist', 'viewer')
  async getSegments() {
    try {
      const segments = await this.marketingService.listCustomerSegments();
      return {
        success: true,
        data: segments,
        message: 'Segments retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error retrieving segments:', error);
      throw new HttpException('Failed to retrieve segments', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('segments/stats')
  @ApiOperation({
    summary: 'Get segment statistics',
    description: 'Retrieve summary stats for customer segments'
  })
  @ApiResponse({ status: 200, description: 'Segment stats retrieved successfully' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist', 'viewer')
  async getSegmentStats() {
    try {
      const stats = await this.marketingService.getSegmentStats();
      return {
        success: true,
        data: stats,
        message: 'Segment stats retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error retrieving segment stats:', error);
      throw new HttpException('Failed to retrieve segment stats', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('segments/:id')
  @ApiOperation({
    summary: 'Get customer segment by ID',
    description: 'Retrieve a specific customer segment'
  })
  @ApiParam({ name: 'id', description: 'Segment UUID' })
  @ApiResponse({ status: 200, description: 'Segment retrieved successfully' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist', 'viewer', 'org_admin')
  async getSegmentById(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const segment = await this.marketingService.getCustomerSegment(id);
      if (!segment) {
        return { success: false, data: null, message: 'Segment not found' };
      }
      return {
        success: true,
        data: segment,
        message: 'Segment retrieved successfully',
      };
    } catch (error) {
      this.logger.error(`Error retrieving segment ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to retrieve segment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== CONTENT LIBRARY ====================

  @Get('content')
  @ApiOperation({
    summary: 'Get generated content',
    description: 'Retrieve marketing content assets for the organization'
  })
  @ApiQuery({ name: 'type', required: false })
  @ApiResponse({ status: 200, description: 'Content retrieved successfully' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist', 'viewer', 'org_admin')
  async getContent(@Request() req, @Query('type') type?: string) {
    try {
      const organizationId = req.user.organizationId || req.user.tenantId;
      if (!organizationId) {
        throw new HttpException('Organization context missing', HttpStatus.BAD_REQUEST);
      }
      const content = await this.marketingService.listGeneratedContent(organizationId, type);
      return {
        success: true,
        data: content,
        message: 'Content retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error retrieving content:', error);
      throw new HttpException('Failed to retrieve content', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('content')
  @ApiOperation({
    summary: 'Create generated content',
    description: 'Create a new content asset for the organization'
  })
  @ApiResponse({ status: 201, description: 'Content created successfully' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist', 'org_admin')
  async createContent(
    @Request() req,
    @Body()
    body: {
      contentType: string;
      prompt: string;
      generatedText: string;
      model?: string;
      metadata?: Record<string, any>;
    },
  ) {
    try {
      const organizationId = req.user.organizationId || req.user.tenantId;
      if (!organizationId) {
        throw new HttpException('Organization context missing', HttpStatus.BAD_REQUEST);
      }
      const payload = {
        contentType: body?.contentType || 'general',
        prompt: body?.prompt || 'Fixture content request',
        generatedText: body?.generatedText || 'Generated content placeholder',
        model: body?.model,
        metadata: body?.metadata,
      };
      const content = await this.marketingService.createGeneratedContent(organizationId, payload);
      return {
        success: true,
        data: content,
        message: 'Content created successfully',
      };
    } catch (error) {
      this.logger.error('Error creating content:', error);
      throw new HttpException('Failed to create content', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('segments')
  @ApiOperation({
    summary: 'Create customer segment',
    description: 'Create a new customer segment based on specific criteria'
  })
  @ApiBody({ type: CreateCustomerSegmentDto })
  @ApiResponse({ status: 201, description: 'Segment created successfully' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist')
  async createCustomerSegment(@Body() segmentDto: CreateCustomerSegmentDto, @Request() req) {
    try {
      const segment = await this.marketingService.createCustomerSegment(
        segmentDto,
        req.user?.id || req.user?.userId || 'system'
      );

      return {
        success: true,
        data: segment,
        message: 'Customer segment created successfully',
      };
    } catch (error) {
      this.logger.error('Error creating customer segment:', error);
      throw new HttpException('Failed to create segment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('segments/:id/recalculate')
  @ApiOperation({
    summary: 'Recalculate segment',
    description: 'Recalculate customer count and metrics for a segment'
  })
  @ApiParam({ name: 'id', description: 'Segment UUID' })
  @ApiResponse({ status: 200, description: 'Segment recalculated successfully' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist')
  async recalculateSegment(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.marketingService.recalculateSegment(id);

      return {
        success: true,
        message: 'Segment recalculated successfully',
      };
    } catch (error) {
      this.logger.error(`Error recalculating segment ${id}:`, error);
      throw new HttpException('Failed to recalculate segment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== ANALYTICS & INSIGHTS ====================

  @Post('analytics')
  @ApiOperation({
    summary: 'Get marketing analytics',
    description: 'Retrieve comprehensive marketing analytics and performance metrics'
  })
  @ApiBody({ type: MarketingAnalyticsRequestDto })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist', 'viewer')
  async getMarketingAnalytics(@Body() analyticsRequest: MarketingAnalyticsRequestDto) {
    try {
      const analytics = await this.marketingService.getMarketingAnalytics(analyticsRequest);

      return {
        success: true,
        data: analytics,
        message: 'Marketing analytics retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error retrieving marketing analytics:', error);
      throw new HttpException('Failed to retrieve analytics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('dashboard/overview')
  @ApiOperation({
    summary: 'Get marketing dashboard overview',
    description: 'Retrieve key marketing metrics and KPIs for dashboard display'
  })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist', 'viewer')
  async getMarketingDashboard() {
    try {
      // Mock dashboard data - in real implementation would aggregate from various sources
      const dashboardData = {
        activeCampaigns: 12,
        totalRevenue: 2750000,
        conversionRate: 3.2,
        customerAcquisitionCost: 125,
        customerLifetimeValue: 3850,
        emailOpenRate: 24.5,
        emailClickRate: 4.8,
        socialMediaEngagement: 1250,
        topPerformingCampaigns: [
          { id: '1', name: 'Q4 Product Launch', roi: 285.4 },
          { id: '2', name: 'Holiday Promotions', roi: 198.7 },
          { id: '3', name: 'Customer Retention', roi: 156.3 },
        ],
        recentActivity: [
          'Email campaign "Weekly Newsletter" sent to 5,432 subscribers',
          'New segment "High-Value Customers" created with 234 members',
          'Campaign "Flash Sale" achieved 15% conversion rate',
        ],
      };

      return {
        success: true,
        data: dashboardData,
        message: 'Marketing dashboard data retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error retrieving dashboard data:', error);
      throw new HttpException('Failed to retrieve dashboard', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== AI-POWERED FEATURES ====================

  @Get('ai/recommendations/:customerId')
  @ApiOperation({
    summary: 'Get AI personalized recommendations',
    description: 'Retrieve AI-powered personalized product/content recommendations for a customer'
  })
  @ApiParam({ name: 'customerId', description: 'Customer UUID' })
  @ApiResponse({ status: 200, description: 'Recommendations generated successfully' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist')
  async getPersonalizedRecommendations(@Param('customerId', ParseUUIDPipe) customerId: string) {
    try {
      const recommendations = await this.marketingService.getPersonalizedRecommendations(customerId);

      return {
        success: true,
        data: recommendations,
        message: 'Personalized recommendations generated successfully',
      };
    } catch (error) {
      this.logger.error(`Error getting recommendations for customer ${customerId}:`, error);
      throw new HttpException('Failed to generate recommendations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('ai/campaign-prediction/:campaignId')
  @ApiOperation({
    summary: 'Predict campaign performance',
    description: 'Use AI to predict campaign performance metrics and outcomes'
  })
  @ApiParam({ name: 'campaignId', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'Campaign prediction generated successfully' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist')
  async predictCampaignPerformance(@Param('campaignId', ParseUUIDPipe) campaignId: string) {
    try {
      const prediction = await this.marketingService.predictCampaignPerformance(campaignId);

      return {
        success: true,
        data: prediction,
        message: 'Campaign performance prediction generated successfully',
      };
    } catch (error) {
      this.logger.error(`Error predicting campaign performance ${campaignId}:`, error);
      throw new HttpException('Failed to generate prediction', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('ai/customer-clv/:customerId')
  @ApiOperation({
    summary: 'Get customer lifetime value',
    description: 'Calculate AI-powered customer lifetime value prediction'
  })
  @ApiParam({ name: 'customerId', description: 'Customer UUID' })
  @ApiResponse({ status: 200, description: 'CLV calculated successfully' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist', 'viewer')
  async getCustomerLifetimeValue(@Param('customerId', ParseUUIDPipe) customerId: string) {
    try {
      const clv = await this.marketingService.getCustomerLifetimeValue(customerId);

      return {
        success: true,
        data: { customerId, lifetimeValue: clv },
        message: 'Customer lifetime value calculated successfully',
      };
    } catch (error) {
      this.logger.error(`Error calculating CLV for customer ${customerId}:`, error);
      throw new HttpException('Failed to calculate CLV', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== REPORTING ====================

  @Get('reports/campaign-performance')
  @ApiOperation({
    summary: 'Generate campaign performance report',
    description: 'Generate comprehensive campaign performance report'
  })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'campaignIds', required: false, isArray: true })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  @Roles('admin', 'manager', 'marketing_manager', 'marketing_specialist', 'viewer')
  async generateCampaignPerformanceReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('campaignIds') campaignIds?: string | string[],
  ) {
    try {
      const normalizedCampaignIds = Array.isArray(campaignIds)
        ? campaignIds
        : campaignIds
          ? campaignIds.split(',').map((id) => id.trim()).filter(Boolean)
          : undefined;
      const analytics = await this.marketingService.getMarketingAnalytics({
        startDate,
        endDate,
        campaignIds: normalizedCampaignIds,
        metrics: ['impressions', 'clicks', 'conversions', 'revenue'],
        groupBy: 'campaign',
      });

      return {
        success: true,
        data: {
          reportPeriod: { startDate, endDate },
          analytics,
          generatedAt: new Date().toISOString(),
        },
        message: 'Campaign performance report generated successfully',
      };
    } catch (error) {
      this.logger.error('Error generating campaign performance report:', error);
      throw new HttpException('Failed to generate report', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
