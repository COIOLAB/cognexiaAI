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
  Req,
  Logger,
  HttpException,
  HttpStatus,
  NotFoundException,
  Header as SetHeader,
  Request,
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
import { RolesGuard, Roles } from '../guards/roles.guard';
import { CustomerService } from '../services/customer.service';
import { LeadService } from '../services/lead.service';
import { LeadSource, LeadStatus } from '../entities/lead.entity';
import { v4 as uuidv4, validate as isUuid } from 'uuid';

@ApiTags('CRM - Customer Relationship Management')
@Controller('crm')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CRMController {
  private readonly logger = new Logger(CRMController.name);

  constructor(
    private readonly customerService: CustomerService,
    private readonly leadService: LeadService,
  ) { }

  private resolveOrganizationId(req: any): string | undefined {
    const tenantHeader = req.headers?.['x-tenant-id'];
    const headerOrg = Array.isArray(tenantHeader) ? tenantHeader[0] : tenantHeader;
    return req.user?.organizationId || req.user?.tenantId || req.user?.orgId || headerOrg;
  }

  private formatCsv(rows: Array<Array<string | number | null | undefined>>): string {
    const escape = (value: string | number | null | undefined) => {
      if (value === null || value === undefined) return '';
      const text = String(value);
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    return rows.map((row) => row.map(escape).join(',')).join('\n');
  }

  // =================== CUSTOMER MANAGEMENT ===================

  @Get('customers')
  @ApiOperation({
    summary: 'Get all customers',
    description: 'Retrieve all customers with advanced filtering and segmentation'
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'segment', required: false, enum: ['b2b', 'b2c', 'enterprise', 'smb'] })
  @ApiQuery({ name: 'region', required: false })
  @ApiQuery({ name: 'industry', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'marketing', 'viewer')
  async getAllCustomers(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('segment') segment?: string,
    @Query('region') region?: string,
    @Query('industry') industry?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    try {
      const currentPage = Number(page) || 1;
      const itemsPerPage = Number(limit) || 20;
      const organizationId = req?.user?.organizationId || req?.user?.tenantId;
      const { data, total } = await this.customerService.findAll({
        page: currentPage,
        limit: itemsPerPage,
        search,
        organizationId,
      });

      return {
        success: true,
        data: {
          customers: data,
          pagination: {
            currentPage,
            totalPages: Math.ceil(total / itemsPerPage) || 0,
            totalItems: total,
            itemsPerPage,
          },
        },
        message: 'Customers retrieved successfully'
      };
    } catch (error) {
      this.logger.error('Error getting customers:', error);
      throw new HttpException('Failed to retrieve customers', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

 
  // =================== LEAD MANAGEMENT ===================

  @Get('leads')
  @ApiOperation({
    summary: 'Get all leads',
    description: 'Retrieve all leads with scoring and qualification status'
  })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'source', required: false })
  @ApiQuery({ name: 'score', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Leads retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'marketing')
  async getAllLeads(
    @Request() req,
    @Query('status') status?: string,
    @Query('source') source?: string,
    @Query('score') score?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('assignedTo') assignedTo?: string,
    @Query('search') search?: string,
  ) {
    try {
      const currentPage = Number(page) || 1;
      const itemsPerPage = Number(limit) || 10;
      const organizationId = req?.user?.organizationId || req?.user?.tenantId;
      const result = await this.leadService.findAll({
        page: currentPage,
        limit: itemsPerPage,
        status,
        source,
        minScore: score,
        assignedTo,
        search,
        organizationId,
      } as any);

      const mapped = result.data.map((lead) => this.mapLeadToDto(lead));

      return {
        success: true,
        data: mapped,
        total: result.total,
        page: currentPage,
        limit: itemsPerPage,
        totalPages: Math.ceil(result.total / itemsPerPage) || 0,
        message: 'Leads retrieved successfully'
      };
    } catch (error) {
      this.logger.error('Error getting leads:', error);
      throw new HttpException('Failed to retrieve leads', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('leads/stats')
  @ApiOperation({ summary: 'Get lead stats', description: 'Retrieve aggregated lead statistics' })
  @ApiResponse({ status: 200, description: 'Lead stats retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'marketing')
  async getLeadStats() {
    try {
      const stats = await this.leadService.getStats();
      return { success: true, data: stats, message: 'Lead stats retrieved successfully' };
    } catch (error) {
      this.logger.error('Error getting lead stats:', error);
      throw new HttpException('Failed to retrieve lead stats', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('leads/export')
  @SetHeader('Content-Type', 'text/csv')
  @SetHeader('Content-Disposition', 'attachment; filename=\"leads.csv\"')
  @ApiOperation({ summary: 'Export leads', description: 'Export leads to CSV' })
  @ApiResponse({ status: 200, description: 'Leads exported successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'marketing')
  async exportLeads(
    @Req() req,
    @Query('status') status?: string,
    @Query('source') source?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('score') score?: number,
    @Query('search') search?: string,
  ) {
    try {
      const organizationId = this.resolveOrganizationId(req);
      const leads = await this.leadService.exportLeads({
        status,
        source,
        assignedTo,
        minScore: score,
        search,
        organizationId,
        demoFallback: process.env.DEMO_ENABLED === 'true',
      });

      const headers = [
        'id',
        'leadNumber',
        'status',
        'source',
        'score',
        'firstName',
        'lastName',
        'email',
        'company',
        'createdAt',
      ];
      const rows = leads.map((lead) => [
        lead.id,
        (lead as any).leadNumber,
        lead.status,
        lead.source,
        lead.score,
        (lead as any)?.contact?.firstName,
        (lead as any)?.contact?.lastName,
        (lead as any)?.contact?.email,
        (lead as any)?.contact?.company,
        lead.createdAt instanceof Date ? lead.createdAt.toISOString() : lead.createdAt,
      ]);

      return this.formatCsv([headers, ...rows]);
    } catch (error) {
      this.logger.error('Error exporting leads:', error);
      throw new HttpException('Failed to export leads', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('leads/:id')
  @ApiOperation({ summary: 'Get lead by ID', description: 'Retrieve a specific lead' })
  @ApiParam({ name: 'id', description: 'Lead UUID' })
  @ApiResponse({ status: 200, description: 'Lead retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'marketing')
  async getLead(@Param('id') id: string) {
    try {
      if (!isUuid(id)) {
        throw new NotFoundException('Lead not found');
      }
      const lead = await this.leadService.findOne(id);
      return { success: true, data: this.mapLeadToDto(lead), message: 'Lead retrieved successfully' };
    } catch (error) {
      this.logger.error(`Error getting lead ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException('Failed to retrieve lead', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('leads/:id/score')
  @ApiOperation({ summary: 'Get lead score', description: 'Retrieve lead scoring breakdown' })
  @ApiParam({ name: 'id', description: 'Lead UUID' })
  @ApiResponse({ status: 200, description: 'Lead score retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'marketing')
  async getLeadScore(@Param('id') id: string) {
    try {
      const lead = await this.leadService.findOne(id);
      const scoring: any = lead.leadScoring || {};
      return {
        success: true,
        data: {
          totalScore: scoring.totalScore ?? lead.score ?? 0,
          breakdown: {
            engagement: scoring.engagementScore ?? 0,
            demographics: scoring.demographicScore ?? 0,
            behavior: scoring.behaviorScore ?? 0,
            firmographics: 0,
          },
        },
        message: 'Lead score retrieved successfully',
      };
    } catch (error) {
      this.logger.error(`Error getting lead score ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException('Failed to retrieve lead score', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('leads/:id')
  @ApiOperation({ summary: 'Update lead', description: 'Update an existing lead' })
  @ApiParam({ name: 'id', description: 'Lead UUID' })
  @ApiResponse({ status: 200, description: 'Lead updated successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'marketing')
  async updateLead(@Param('id') id: string, @Body() updateLeadDto: any, @Request() req) {
    try {
      const existing = await this.leadService.findOne(id);

      const normalizedContact = updateLeadDto.contact || {
        firstName: updateLeadDto.firstName ?? existing.contact?.firstName,
        lastName: updateLeadDto.lastName ?? existing.contact?.lastName,
        email: updateLeadDto.email ?? existing.contact?.email,
        phone: updateLeadDto.phone ?? existing.contact?.phone,
        company: updateLeadDto.company ?? existing.contact?.company,
        title: updateLeadDto.jobTitle ?? existing.contact?.title,
      };

      const demographics = updateLeadDto.demographics ?? existing.demographics ?? {
        industry: '',
        companySize: 'small',
        annualRevenue: 0,
        location: '',
        employeeCount: 0,
      };

      const behaviorData = updateLeadDto.behaviorData ?? existing.behaviorData ?? {
        websiteVisits: 0,
        pageViews: 0,
        emailOpens: 0,
        emailClicks: 0,
        formSubmissions: 0,
        contentDownloads: 0,
        demoRequests: 0,
        socialInteractions: 0,
      };

      const source = updateLeadDto.source
        ? this.normalizeLeadSource(updateLeadDto.source)
        : existing.source;

      const payload = {
        ...updateLeadDto,
        contact: normalizedContact,
        demographics,
        behaviorData,
        source,
        updatedBy: updateLeadDto.updatedBy || 'system_user',
        organizationId: updateLeadDto.organizationId || existing.organizationId || req?.user?.organizationId || req?.user?.tenantId,
      };

      const lead = await this.leadService.update(id, payload);

      return { success: true, data: this.mapLeadToDto(lead), message: 'Lead updated successfully' };
    } catch (error) {
      this.logger.error(`Error updating lead ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error?.message || 'Failed to update lead', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('leads/:id')
  @ApiOperation({ summary: 'Delete lead', description: 'Delete a lead by ID' })
  @ApiParam({ name: 'id', description: 'Lead UUID' })
  @ApiResponse({ status: 200, description: 'Lead deleted successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'marketing')
  async deleteLead(@Param('id') id: string) {
    try {
      await this.leadService.remove(id);
      return { success: true, message: 'Lead deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting lead ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error?.message || 'Failed to delete lead', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private mapLeadToDto(lead: any) {
    const contact = lead.contact || {};
    const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ').trim();
    return {
      id: lead.id,
      leadCode: lead.leadNumber,
      customerId: lead.customerId || lead.customer?.id || null,
      organizationId: lead.organizationId || lead.organization?.id || null,
      fullName: fullName || contact.email || '',
      email: contact.email || '',
      company: lead.company || contact.company || '',
      phone: contact.phone || '',
      status: lead.status,
      source: lead.source,
      score: lead.score ?? 0,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    };
  }
  @Post('leads')
  @ApiOperation({
    summary: 'Create new lead',
    description: 'Create a new lead with automatic scoring and qualification'
  })
  @ApiResponse({ status: 201, description: 'Lead created successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'marketing')
  async createLead(@Body() createLeadDto: any, @Request() req) {
    try {
      if (!createLeadDto.contact?.email && !createLeadDto.email) {
        throw new HttpException('Contact email is required', HttpStatus.BAD_REQUEST);
      }

      const normalizedContact = createLeadDto.contact || {
        firstName: createLeadDto.firstName,
        lastName: createLeadDto.lastName,
        email: createLeadDto.email,
        phone: createLeadDto.phone,
        company: createLeadDto.company,
        title: createLeadDto.jobTitle,
      };

      const demographics = createLeadDto.demographics ?? {
        industry: '',
        companySize: 'small',
        annualRevenue: 0,
        location: '',
        employeeCount: 0,
      };

      const behaviorData = createLeadDto.behaviorData ?? {
        websiteVisits: 0,
        pageViews: 0,
        emailOpens: 0,
        emailClicks: 0,
        formSubmissions: 0,
        contentDownloads: 0,
        demoRequests: 0,
        socialInteractions: 0,
      };

      const leadScore = this.calculateLeadScore(createLeadDto);
      const qualification = this.qualifyLead(createLeadDto, leadScore);
      const leadNumber = createLeadDto.leadNumber || `L-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
      const source = this.normalizeLeadSource(createLeadDto.source);

      const lead = await this.leadService.create({
        ...createLeadDto,
        contact: normalizedContact,
        demographics,
        behaviorData,
        leadNumber,
        source,
        status: createLeadDto.status || LeadStatus.NEW,
        createdBy: createLeadDto.createdBy || 'system_user',
        updatedBy: createLeadDto.updatedBy || 'system_user',
        organizationId: createLeadDto.organizationId || req?.user?.organizationId || req?.user?.tenantId,
        score: leadScore,
        leadScoring: {
          demographicScore: leadScore,
          behaviorScore: 0,
          engagementScore: 0,
          totalScore: leadScore,
          lastUpdated: new Date().toISOString(),
        },
        qualification,
        assignedTo: createLeadDto.assignedTo || this.assignLead(createLeadDto),
      });

      return {
        success: true,
        data: lead,
        message: 'Lead created successfully'
      };
    } catch (error) {
      this.logger.error('Error creating lead:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error?.message || 'Failed to create lead', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== SALES PIPELINE ===================

  @Get('pipeline')
  @ApiOperation({
    summary: 'Get sales pipeline',
    description: 'Retrieve sales pipeline with opportunities and forecasting'
  })
  @ApiQuery({ name: 'timeframe', required: false, enum: ['current_quarter', 'next_quarter', 'current_year'] })
  @ApiQuery({ name: 'salesRep', required: false })
  @ApiResponse({ status: 200, description: 'Sales pipeline retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer')
  async getSalesPipeline(
    @Query('timeframe') timeframe?: string,
    @Query('salesRep') salesRep?: string,
  ) {
    try {
      return {
        success: true,
        data: {
          summary: {
            totalValue: 12500000,
            weightedValue: 8750000,
            totalOpportunities: 147,
            avgDealSize: 85034,
            avgSalesCycle: 65,
            winRate: 68.2,
            forecastAccuracy: 89.5
          },
          stages: [
            {
              stage: 'prospecting',
              name: 'Prospecting',
              value: 2500000,
              opportunities: 45,
              avgProbability: 15,
              avgTimeInStage: 14,
              conversionRate: 75.5
            },
            {
              stage: 'qualification',
              name: 'Qualification',
              value: 1800000,
              opportunities: 28,
              avgProbability: 25,
              avgTimeInStage: 12,
              conversionRate: 82.1
            },
            {
              stage: 'proposal',
              name: 'Proposal',
              value: 2100000,
              opportunities: 22,
              avgProbability: 50,
              avgTimeInStage: 18,
              conversionRate: 65.4
            },
            {
              stage: 'negotiation',
              name: 'Negotiation',
              value: 1900000,
              opportunities: 18,
              avgProbability: 75,
              avgTimeInStage: 21,
              conversionRate: 78.9
            },
            {
              stage: 'closing',
              name: 'Closing',
              value: 4200000,
              opportunities: 34,
              avgProbability: 90,
              avgTimeInStage: 8,
              conversionRate: 92.3
            }
          ],
          opportunities: [
            {
              id: 'OPP-001',
              name: 'TechCorp Manufacturing System',
              account: 'TechCorp Industries',
              value: 350000,
              stage: 'proposal',
              probability: 65,
              expectedCloseDate: '2024-03-15',
              salesRep: 'Sarah Johnson',
              lastActivity: '2024-02-15',
              daysInStage: 12,
              nextSteps: 'Send proposal revision',
              competitiveThreats: ['CompetitorA']
            },
            {
              id: 'OPP-002',
              name: 'Global Manufacturing ERP',
              account: 'Global Manufacturing Ltd',
              value: 275000,
              stage: 'negotiation',
              probability: 80,
              expectedCloseDate: '2024-02-28',
              salesRep: 'Michael Brown',
              lastActivity: '2024-02-16',
              daysInStage: 8,
              nextSteps: 'Contract review meeting'
            }
          ],
          forecast: {
            currentQuarter: {
              target: 5000000,
              committed: 3200000,
              bestCase: 4800000,
              pipeline: 8750000,
              achievement: 89.2
            },
            nextQuarter: {
              target: 5500000,
              committed: 2100000,
              bestCase: 4200000,
              pipeline: 6800000
            }
          }
        },
        message: 'Sales pipeline retrieved successfully'
      };
    } catch (error) {
      this.logger.error('Error getting sales pipeline:', error);
      throw new HttpException('Failed to retrieve sales pipeline', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== CUSTOMER ANALYTICS ===================

  @Get('analytics/overview')
  @ApiOperation({
    summary: 'Get CRM analytics overview',
    description: 'Comprehensive CRM analytics and customer insights'
  })
  @ApiQuery({ name: 'timeRange', required: false, enum: ['7d', '30d', '90d', '1y'] })
  @ApiResponse({ status: 200, description: 'CRM analytics retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'marketing', 'viewer')
  async getCRMAnalytics(@Query('timeRange') timeRange?: string) {
    try {
      return {
        success: true,
        data: {
          overview: {
            totalCustomers: 1547,
            activeCustomers: 1423,
            newCustomers: 89,
            churnedCustomers: 12,
            customerRetentionRate: 94.2,
            avgCustomerLifetimeValue: 125000,
            avgCustomerAcquisitionCost: 2500,
            customerSatisfactionScore: 8.7,
            netPromoterScore: 68
          },
          customerSegments: {
            byType: [
              { segment: 'B2B Enterprise', count: 456, revenue: 15200000, avgValue: 33333 },
              { segment: 'B2B SMB', count: 436, revenue: 8900000, avgValue: 20412 },
              { segment: 'B2C Premium', count: 355, revenue: 5200000, avgValue: 14648 },
              { segment: 'B2C Standard', count: 300, revenue: 2100000, avgValue: 7000 }
            ],
            byRegion: [
              { region: 'North America', count: 654, revenue: 18500000, growth: 12.5 },
              { region: 'Europe', count: 489, revenue: 10200000, growth: 8.9 },
              { region: 'Asia Pacific', count: 304, revenue: 6800000, growth: 25.8 },
              { region: 'Latin America', count: 100, revenue: 1900000, growth: 18.2 }
            ],
            byIndustry: [
              { industry: 'Technology', count: 289, revenue: 12100000 },
              { industry: 'Manufacturing', count: 234, revenue: 9800000 },
              { industry: 'Healthcare', count: 189, revenue: 7200000 },
              { industry: 'Financial Services', count: 156, revenue: 5400000 }
            ]
          },
          salesPerformance: {
            totalRevenue: 31400000,
            avgDealSize: 85034,
            avgSalesCycle: 65,
            winRate: 68.2,
            quotaAttainment: 94.8,
            topPerformers: [
              { rep: 'Sarah Johnson', revenue: 2100000, deals: 28, winRate: 82.1 },
              { rep: 'Michael Brown', revenue: 1850000, deals: 24, winRate: 75.0 },
              { rep: 'Emily Davis', revenue: 1650000, deals: 22, winRate: 68.2 }
            ]
          },
          customerBehavior: {
            avgInteractionFrequency: 2.3, // per week
            preferredChannels: [
              { channel: 'email', percentage: 45.2 },
              { channel: 'phone', percentage: 28.9 },
              { channel: 'video_call', percentage: 18.7 },
              { channel: 'in_person', percentage: 7.2 }
            ],
            engagementTrends: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr'],
              emailEngagement: [65.2, 68.1, 72.3, 74.5],
              phoneEngagement: [78.9, 76.5, 79.2, 81.1],
              socialEngagement: [45.6, 52.3, 58.9, 62.1]
            }
          },
          predictiveInsights: {
            churnRisk: {
              high: 45,
              medium: 89,
              low: 1289
            },
            upsellOpportunity: {
              immediate: 78,
              short_term: 156,
              long_term: 234
            },
            marketingAttribution: [
              { channel: 'Content Marketing', revenue: 8900000, roi: 4.2 },
              { channel: 'LinkedIn Campaigns', revenue: 6200000, roi: 3.8 },
              { channel: 'Google Ads', revenue: 4500000, roi: 3.1 },
              { channel: 'Referrals', revenue: 7800000, roi: 12.5 }
            ]
          }
        },
        message: 'CRM analytics retrieved successfully'
      };
    } catch (error) {
      this.logger.error('Error getting CRM analytics:', error);
      throw new HttpException('Failed to retrieve CRM analytics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== CUSTOMER INTERACTIONS ===================

  @Get('customers/:id/interactions')
  @ApiOperation({
    summary: 'Get customer interaction history',
    description: 'Complete interaction timeline for a specific customer'
  })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiResponse({ status: 200, description: 'Customer interactions retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer')
  async getCustomerInteractions(@Param('id') id: string) {
    try {
      return {
        success: true,
        data: {
          interactions: [
            {
              id: 'INT-001',
              type: 'email',
              direction: 'outbound',
              subject: 'Product Demo Follow-up',
              description: 'Follow-up email after product demonstration',
              date: '2024-02-16T09:30:00Z',
              duration: null,
              outcome: 'positive',
              nextAction: 'Send proposal',
              participants: [
                { name: 'Sarah Johnson', role: 'sales_rep', type: 'internal' },
                { name: 'John Smith', role: 'decision_maker', type: 'customer' }
              ],
              attachments: ['demo_recording.mp4', 'feature_comparison.pdf'],
              tags: ['demo', 'follow-up', 'proposal']
            },
            {
              id: 'INT-002',
              type: 'phone_call',
              direction: 'inbound',
              subject: 'Technical Requirements Discussion',
              description: 'Customer called to discuss technical requirements',
              date: '2024-02-15T14:15:00Z',
              duration: 45,
              outcome: 'neutral',
              nextAction: 'Technical consultation meeting',
              participants: [
                { name: 'Michael Brown', role: 'technical_consultant', type: 'internal' },
                { name: 'David Wilson', role: 'it_manager', type: 'customer' }
              ],
              notes: 'Customer needs integration with existing SAP system',
              tags: ['technical', 'requirements', 'integration']
            },
            {
              id: 'INT-003',
              type: 'meeting',
              direction: 'mutual',
              subject: 'Product Demonstration',
              description: 'On-site product demonstration and Q&A session',
              date: '2024-02-12T10:00:00Z',
              duration: 120,
              outcome: 'positive',
              location: 'Customer office - San Francisco',
              participants: [
                { name: 'Sarah Johnson', role: 'sales_rep', type: 'internal' },
                { name: 'Tech Support Team', role: 'technical_support', type: 'internal' },
                { name: 'John Smith', role: 'decision_maker', type: 'customer' },
                { name: 'Mary Johnson', role: 'end_user', type: 'customer' }
              ],
              agenda: ['Product overview', 'Feature demonstration', 'Q&A session', 'Next steps'],
              outcomes: ['Positive feedback', 'Interest in premium features', 'Budget confirmation'],
              tags: ['demo', 'on-site', 'decision-maker']
            }
          ],
          summary: {
            totalInteractions: 47,
            lastInteraction: '2024-02-16T09:30:00Z',
            avgInteractionFrequency: 2.3,
            preferredChannel: 'email',
            engagementScore: 8.5,
            responseRate: 89.2,
            sentiment: 'positive'
          },
          communication_preferences: {
            channels: ['email', 'phone', 'video_call'],
            frequency: 'weekly',
            bestTimes: ['10:00-12:00', '14:00-16:00'],
            timezone: 'America/Los_Angeles',
            language: 'en-US'
          }
        },
        message: 'Customer interactions retrieved successfully'
      };
    } catch (error) {
      this.logger.error(`Error getting customer interactions ${id}:`, error);
      throw new HttpException('Failed to retrieve customer interactions', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== HELPER METHODS ===================

  private calculateLeadScore(leadData: any): number {
    let score = 0;

    // Demographic scoring
    if (leadData.company?.annualRevenue > 100000000) score += 30;
    else if (leadData.company?.annualRevenue > 10000000) score += 20;
    else if (leadData.company?.annualRevenue > 1000000) score += 10;

    if (leadData.company?.employeeCount > 1000) score += 20;
    else if (leadData.company?.employeeCount > 100) score += 15;
    else if (leadData.company?.employeeCount > 50) score += 10;

    // Behavioral scoring
    if (leadData.behavior?.websiteVisits > 10) score += 15;
    else if (leadData.behavior?.websiteVisits > 5) score += 10;
    else if (leadData.behavior?.websiteVisits > 1) score += 5;

    if (leadData.behavior?.formSubmissions > 2) score += 20;
    else if (leadData.behavior?.formSubmissions > 0) score += 10;

    return Math.min(score, 100);
  }

  private qualifyLead(leadData: any, score: number): any {
    return {
      budget: score > 70 ? 'qualified' : 'investigating',
      authority: leadData.contact?.title?.toLowerCase().includes('director') ||
        leadData.contact?.title?.toLowerCase().includes('manager') ? 'qualified' : 'unknown',
      need: score > 60 ? 'qualified' : 'investigating',
      timeline: score > 80 ? 'qualified' : 'unknown',
      bantScore: score,
      qualifiedBy: 'AI_SYSTEM',
      qualifiedDate: new Date().toISOString()
    };
  }

  private assignLead(leadData: any): string {
    // Simple round-robin assignment logic
    const salesReps = ['Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson'];
    const hash = leadData.contact?.email?.length || 0;
    return salesReps[hash % salesReps.length];
  }

  private normalizeLeadSource(source?: string): LeadSource {
    const normalized = (source || '').toLowerCase();
    switch (normalized) {
      case 'website':
      case 'website_form':
      case 'web':
        return LeadSource.WEBSITE_FORM;
      case 'linkedin':
      case 'linkedin_campaign':
        return LeadSource.LINKEDIN_CAMPAIGN;
      case 'google_ads':
      case 'google':
        return LeadSource.GOOGLE_ADS;
      case 'facebook':
      case 'facebook_ads':
        return LeadSource.FACEBOOK_ADS;
      case 'referral':
        return LeadSource.REFERRAL;
      case 'email':
      case 'email_campaign':
        return LeadSource.EMAIL_CAMPAIGN;
      case 'webinar':
        return LeadSource.WEBINAR;
      case 'trade_show':
      case 'tradeshow':
        return LeadSource.TRADE_SHOW;
      case 'cold_call':
      case 'coldcall':
        return LeadSource.COLD_CALL;
      case 'inbound_call':
      case 'inboundcall':
        return LeadSource.INBOUND_CALL;
      case 'content_marketing':
      case 'content':
        return LeadSource.CONTENT_MARKETING;
      case 'partner':
        return LeadSource.PARTNER;
      default:
        return LeadSource.OTHER;
    }
  }
}
