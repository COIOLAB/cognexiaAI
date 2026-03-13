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
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';

@ApiTags('CRM - Customer Relationship Management')
@Controller('crm')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CRMController {
  private readonly logger = new Logger(CRMController.name);

  constructor() {}

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
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('segment') segment?: string,
    @Query('region') region?: string,
    @Query('industry') industry?: string,
    @Query('status') status?: string,
  ) {
    try {
      return {
        success: true,
        data: {
          customers: [
            {
              id: 'CUST-001',
              customerCode: 'C-2024-001',
              companyName: 'TechCorp Industries',
              customerType: 'b2b',
              industry: 'technology',
              size: 'enterprise',
              status: 'active' as any,
              primaryContact: {
                firstName: 'John',
                lastName: 'Smith',
                title: 'Chief Technology Officer',
                email: 'john.smith@techcorp.com',
                phone: '+1-555-0123',
                linkedin: 'https://linkedin.com/in/johnsmith'
              },
              address: {
                street: '123 Tech Avenue',
                city: 'San Francisco',
                state: 'CA',
                country: 'USA',
                zipCode: '94105',
                region: 'North America'
              },
              demographics: {
                foundedYear: 2010,
                employeeCount: 5000,
                annualRevenue: 500000000,
                website: 'https://techcorp.com',
                taxId: 'US-123456789'
              },
              preferences: {
                language: 'en',
                currency: 'USD',
                timezone: 'America/Los_Angeles',
                communicationChannels: ['email', 'phone', 'linkedin'],
                marketingOptIn: true
              },
              salesMetrics: {
                totalRevenue: 2500000,
                lastOrderDate: '2024-02-10',
                lastOrderValue: 150000,
                averageOrderValue: 85000,
                orderFrequency: 'monthly',
                paymentTerms: 'NET30',
                creditLimit: 500000,
                outstandingBalance: 75000
              },
              relationshipMetrics: {
                customerSince: '2022-03-15',
                loyaltyScore: 8.5,
                satisfactionScore: 9.2,
                npsScore: 8,
                lastInteractionDate: '2024-02-15',
                interactionFrequency: 'weekly',
                preferredSalesRep: 'Sarah Johnson'
              },
              segmentation: {
                segment: 'enterprise',
                tier: 'platinum',
                riskLevel: 'low',
                growthPotential: 'high',
                competitiveThreats: ['CompetitorA', 'CompetitorB']
              },
              socialMedia: {
                linkedin: 'https://linkedin.com/company/techcorp',
                twitter: '@TechCorp',
                facebook: 'TechCorpOfficial',
                youtube: 'TechCorpChannel'
              },
              tags: ['technology', 'enterprise', 'high-value', 'strategic']
            },
            {
              id: 'CUST-002',
              customerCode: 'C-2024-002',
              companyName: 'Global Manufacturing Ltd',
              customerType: 'b2b',
              industry: 'manufacturing',
              size: 'large',
              status: 'active' as any,
              primaryContact: {
                firstName: 'Maria',
                lastName: 'Rodriguez',
                title: 'VP Operations',
                email: 'maria.rodriguez@globalmfg.com',
                phone: '+44-20-7123-4567'
              },
              address: {
                street: '45 Industrial Park',
                city: 'London',
                country: 'UK',
                zipCode: 'SW1A 1AA',
                region: 'Europe'
              },
              demographics: {
                foundedYear: 1985,
                employeeCount: 2500,
                annualRevenue: 250000000,
                website: 'https://globalmfg.com'
              },
              preferences: {
                language: 'en-GB',
                currency: 'GBP',
                timezone: 'Europe/London',
                communicationChannels: ['email', 'phone']
              },
              salesMetrics: {
                totalRevenue: 1800000,
                lastOrderDate: '2024-02-12',
                averageOrderValue: 65000,
                paymentTerms: 'NET45'
              },
              relationshipMetrics: {
                customerSince: '2021-08-20',
                loyaltyScore: 7.8,
                satisfactionScore: 8.5,
                npsScore: 7
              },
              segmentation: {
                segment: 'large_enterprise',
                tier: 'gold',
                riskLevel: 'medium',
                growthPotential: 'medium'
              }
            }
          ],
          pagination: {
            currentPage: page || 1,
            totalPages: 1,
            totalItems: 2,
            itemsPerPage: limit || 20
          },
          summary: {
            totalCustomers: 1547,
            b2bCustomers: 892,
            b2cCustomers: 655,
            activeCustomers: 1423,
            inactiveCustomers: 124,
            avgLifetimeValue: 125000,
            avgSatisfactionScore: 8.7
          }
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
  @ApiResponse({ status: 200, description: 'Leads retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'marketing')
  async getAllLeads(
    @Query('status') status?: string,
    @Query('source') source?: string,
    @Query('score') score?: number,
  ) {
    try {
      return {
        success: true,
        data: {
          leads: [
            {
              id: 'LEAD-001',
              leadNumber: 'L-2024-001',
              status: 'qualified',
              source: 'website_form',
              score: 85,
              grade: 'A',
              contact: {
                firstName: 'David',
                lastName: 'Chen',
                title: 'Operations Manager',
                email: 'david.chen@innovation-inc.com',
                phone: '+1-555-0789',
                company: 'Innovation Inc'
              },
              demographics: {
                industry: 'technology',
                companySize: 'medium',
                annualRevenue: 50000000,
                location: 'Seattle, WA, USA',
                employeeCount: 500
              },
              behaviorData: {
                websiteVisits: 15,
                pageViews: 47,
                emailOpens: 8,
                emailClicks: 3,
                formSubmissions: 2,
                contentDownloads: 5,
                demoRequests: 1
              },
              leadScoring: {
                demographicScore: 40,
                behaviorScore: 35,
                engagementScore: 10,
                totalScore: 85,
                lastUpdated: '2024-02-16T10:30:00Z'
              },
              qualification: {
                budget: 'qualified',
                authority: 'qualified',
                need: 'qualified',
                timeline: 'qualified',
                bantScore: 100,
                qualifiedBy: 'AI_SYSTEM',
                qualifiedDate: '2024-02-15'
              },
              assignedTo: 'Sarah Johnson',
              salesStage: 'discovery',
              nextAction: {
                type: 'demo_call',
                scheduledDate: '2024-02-20T14:00:00Z',
                description: 'Product demonstration call'
              },
              createdAt: '2024-02-10T09:15:00Z',
              lastContactDate: '2024-02-15T16:30:00Z',
              estimatedValue: 125000,
              probability: 75,
              expectedCloseDate: '2024-03-15'
            },
            {
              id: 'LEAD-002',
              leadNumber: 'L-2024-002',
              status: 'new',
              source: 'linkedin_campaign',
              score: 45,
              grade: 'C',
              contact: {
                firstName: 'Emily',
                lastName: 'Watson',
                title: 'Procurement Director',
                email: 'emily.watson@globalcorp.com',
                phone: '+44-20-7890-1234',
                company: 'Global Corp'
              },
              demographics: {
                industry: 'manufacturing',
                companySize: 'large',
                annualRevenue: 200000000,
                location: 'Manchester, UK',
                employeeCount: 2000
              },
              behaviorData: {
                websiteVisits: 3,
                pageViews: 8,
                emailOpens: 2,
                socialInteractions: 5
              },
              leadScoring: {
                demographicScore: 30,
                behaviorScore: 10,
                engagementScore: 5,
                totalScore: 45
              },
              qualification: {
                budget: 'unknown',
                authority: 'qualified',
                need: 'investigating',
                timeline: 'unknown',
                bantScore: 50
              },
              assignedTo: 'Michael Brown',
              salesStage: 'prospecting',
              createdAt: '2024-02-14T11:20:00Z',
              estimatedValue: 75000,
              probability: 25
            }
          ],
          summary: {
            totalLeads: 1247,
            newLeads: 156,
            qualifiedLeads: 324,
            convertedLeads: 89,
            avgScore: 62.5,
            avgConversionTime: 18.5,
            topSources: [
              { source: 'website_form', count: 345, conversion: 22.5 },
              { source: 'linkedin_campaign', count: 289, conversion: 18.2 },
              { source: 'google_ads', count: 234, conversion: 15.8 },
              { source: 'referral', count: 189, conversion: 35.4 }
            ]
          }
        },
        message: 'Leads retrieved successfully'
      };
    } catch (error) {
      this.logger.error('Error getting leads:', error);
      throw new HttpException('Failed to retrieve leads', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('leads')
  @ApiOperation({ 
    summary: 'Create new lead',
    description: 'Create a new lead with automatic scoring and qualification'
  })
  @ApiResponse({ status: 201, description: 'Lead created successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'marketing')
  async createLead(@Body() createLeadDto: any) {
    try {
      const leadScore = this.calculateLeadScore(createLeadDto);
      const qualification = this.qualifyLead(createLeadDto, leadScore);
      
      return {
        success: true,
        data: {
          id: 'lead-' + Date.now(),
          leadNumber: 'L-2024-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
          ...createLeadDto,
          score: leadScore,
          qualification: qualification,
          status: 'new',
          createdAt: new Date(),
          assignedTo: this.assignLead(createLeadDto)
        },
        message: 'Lead created successfully'
      };
    } catch (error) {
      this.logger.error('Error creating lead:', error);
      throw new HttpException('Failed to create lead', HttpStatus.INTERNAL_SERVER_ERROR);
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
}
