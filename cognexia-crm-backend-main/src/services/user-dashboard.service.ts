import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, Not, LessThan } from 'typeorm';
import { Customer, CustomerStatus } from '../entities/customer.entity';
import { Lead } from '../entities/lead.entity';
import { Opportunity, OpportunityStage } from '../entities/opportunity.entity';
import { SupportTicket, TicketStatus } from '../entities/support-ticket.entity';
import { Dashboard, DashboardVisibility } from '../entities/dashboard.entity';
import { Organization } from '../entities/organization.entity';
import { MarketingCampaign, CampaignStatus } from '../entities/marketing-campaign.entity';
import { MarketingAnalytics } from '../entities/marketing-analytics.entity';
import { CustomerSegment } from '../entities/customer-segment.entity';
import { Task, TaskStatus } from '../entities/task.entity';
import { Document } from '../entities/document.entity';
import { Contract } from '../entities/contract.entity';
import { Product } from '../entities/product.entity';
import { Report } from '../entities/report.entity';
import { IVRMenu } from '../entities/ivr-menu.entity';
import { GeneratedContent } from '../entities/generated-content.entity';
import { Workflow } from '../entities/workflow.entity';

export interface UserDashboardMetrics {
  // Organization metrics
  total_customers: number;
  active_customers: number;
  total_leads: number;
  qualified_leads: number;
  total_opportunities: number;
  open_opportunities: number;

  // Support metrics
  open_tickets: number;
  pending_tickets: number;
  resolved_tickets_this_month: number;
  avg_resolution_time_hours: number;

  // Sales metrics
  total_pipeline_value: number;
  won_deals_this_month: number;
  lost_deals_this_month: number;
  conversion_rate: number;

  // Team metrics
  team_members: number;
  active_team_members: number;

  // Activity metrics
  activities_today: number;
  tasks_pending: number;
}

export interface SalesFunnel {
  stage: string;
  count: number;
  value: number;
  conversion_rate: number;
}

export interface RecentActivity {
  type: 'customer' | 'lead' | 'opportunity' | 'ticket' | 'task';
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  user: string;
}

export interface RevenueMetrics {
  mrr: number;
  arr: number;
  growth: number;
  churnRate: number;
  nrr: number;
  clv: number;
  cac: number;
  ltv_cac_ratio: number | null;
  trend: Array<{ month: string; value: number; growth: number }>;
  segments: Array<{ name: string; value: number; percent: number }>;
}

export interface TierAnalytics {
  kpis: Array<{ label: string; value: number; helper?: string }>;
  highlights: Array<{ label: string; value: number; helper?: string }>;
}

export interface MarketingSummary {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSpend: number;
  totalRevenue: number;
  roi: number;
  roiByCampaign: Array<{ campaignId: string; name: string; roi: number; revenue: number; spend: number }>;
  channelMix: Array<{ label: string; value: number }>;
}

export interface SupportSlaSummary {
  totalTickets: number;
  breachedTickets: number;
  breachRate: number;
  avgResolutionHours: number;
  byStatus: Record<string, number>;
}

@Injectable()
export class UserDashboardService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(Opportunity)
    private opportunityRepository: Repository<Opportunity>,
    @InjectRepository(SupportTicket)
    private ticketRepository: Repository<SupportTicket>,
    @InjectRepository(Dashboard)
    private dashboardRepository: Repository<Dashboard>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(MarketingCampaign)
    private campaignRepository: Repository<MarketingCampaign>,
    @InjectRepository(MarketingAnalytics)
    private analyticsRepository: Repository<MarketingAnalytics>,
    @InjectRepository(CustomerSegment)
    private segmentRepository: Repository<CustomerSegment>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(IVRMenu)
    private ivrMenuRepository: Repository<IVRMenu>,
    @InjectRepository(GeneratedContent)
    private generatedContentRepository: Repository<GeneratedContent>,
    @InjectRepository(Workflow)
    private workflowRepository: Repository<Workflow>,
  ) { }

  /**
   * Get user dashboard metrics for organization
   */
  async getUserMetrics(organizationId: string): Promise<UserDashboardMetrics> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalCustomers,
      activeCustomers,
      totalLeads,
      totalOpportunities,
      openOpportunities,
      openTickets,
      pendingTickets,
      resolvedTicketsThisMonth,
    ] = await Promise.all([
      this.customerRepository.count({
        where: this.getTenantWhere(this.customerRepository, organizationId) as any,
      }),
      this.customerRepository.count({
        where: {
          ...this.getTenantWhere(this.customerRepository, organizationId),
          status: CustomerStatus.ACTIVE,
        } as any,
      }),
      this.leadRepository.count({
        where: this.getTenantWhere(this.leadRepository, organizationId) as any,
      }),
      this.opportunityRepository.count({
        where: this.getTenantWhere(this.opportunityRepository, organizationId) as any,
      }),
      this.opportunityRepository.count({
        where: {
          ...this.getTenantWhere(this.opportunityRepository, organizationId),
          stage: Not(In([OpportunityStage.WON, OpportunityStage.LOST])) as any,
        } as any,
      }),
      this.ticketRepository.count({
        where: {
          ...this.getTenantWhere(this.ticketRepository, organizationId),
          status: TicketStatus.OPEN,
        } as any,
      }),
      this.ticketRepository.count({
        where: {
          ...this.getTenantWhere(this.ticketRepository, organizationId),
          status: TicketStatus.OPEN,
        } as any,
      }),
      this.ticketRepository.count({
        where: {
          ...this.getTenantWhere(this.ticketRepository, organizationId),
          status: TicketStatus.RESOLVED,
          resolved_at: Between(monthStart, now),
        } as any,
      }),
    ]);

    // Calculate pipeline value
    const opportunities = await this.opportunityRepository.find({
      where: this.getTenantWhere(this.opportunityRepository, organizationId) as any,
    });

    const totalPipelineValue = opportunities.reduce(
      (sum, opp) => sum + (opp.value || 0),
      0
    );

    return {
      total_customers: totalCustomers,
      active_customers: activeCustomers,
      total_leads: totalLeads,
      qualified_leads: 0, // Calculate based on score
      total_opportunities: totalOpportunities,
      open_opportunities: openOpportunities,

      open_tickets: openTickets,
      pending_tickets: pendingTickets,
      resolved_tickets_this_month: resolvedTicketsThisMonth,
      avg_resolution_time_hours: 0, // Calculate from ticket data

      total_pipeline_value: totalPipelineValue,
      won_deals_this_month: 0,
      lost_deals_this_month: 0,
      conversion_rate: 0,

      team_members: 0,
      active_team_members: 0,

      activities_today: 0,
      tasks_pending: 0,
    };
  }

  /**
   * Get sales funnel visualization
   */
  async getSalesFunnel(organizationId: string): Promise<SalesFunnel[]> {
    const opportunities = await this.opportunityRepository.find({
      where: this.getTenantWhere(this.opportunityRepository, organizationId) as any,
    });

    const stages = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON'];
    const funnel: SalesFunnel[] = [];

    stages.forEach((stage, index) => {
      const stageOpps = opportunities.filter(opp => opp.stage === stage);
      const count = stageOpps.length;
      const value = stageOpps.reduce((sum, opp) => sum + (opp.value || 0), 0);
      const conversion_rate = index > 0
        ? (count / opportunities.length) * 100
        : 100;

      funnel.push({ stage, count, value, conversion_rate });
    });

    return funnel;
  }

  /**
   * Get revenue metrics for organization
   */
  async getRevenueMetrics(organizationId: string): Promise<RevenueMetrics> {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    const opportunities = await this.opportunityRepository.find({
      where: this.getTenantWhere(this.opportunityRepository, organizationId) as any,
    });

    const totalCustomers = await this.customerRepository.count({
      where: this.getTenantWhere(this.customerRepository, organizationId) as any,
    });

    const mrr = Number(organization?.monthlyRevenue || 0);
    const arr = mrr * 12;
    const totalPipelineValue = opportunities.reduce((sum, opp) => sum + Number(opp.value || 0), 0);
    const clv = totalCustomers > 0 ? totalPipelineValue / totalCustomers : 0;
    const cac = 0;

    const now = new Date();
    const trend = Array.from({ length: 6 }).map((_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const month = date.toLocaleString('en-US', { month: 'short' });
      return { month, value: mrr, growth: 0 };
    });

    return {
      mrr,
      arr,
      growth: 0,
      churnRate: 0,
      nrr: 100,
      clv,
      cac,
      ltv_cac_ratio: cac > 0 ? Number((clv / cac).toFixed(2)) : null,
      trend,
      segments: [],
    };
  }

  /**
   * Get recent activities for organization
   */
  async getRecentActivities(
    organizationId: string,
    limit: number = 20
  ): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = [];

    // Get recent customers
    const customers = await this.customerRepository.find({
      where: this.getTenantWhere(this.customerRepository, organizationId) as any,
      order: { createdAt: 'DESC' } as any,
      take: 5,
    });

    customers.forEach(customer => {
      activities.push({
        type: 'customer',
        id: customer.id,
        title: `New customer: ${(customer as any).primaryContact?.name || customer.id}`,
        description: `Customer added to CRM`,
        timestamp: customer.createdAt,
        user: 'System',
      });
    });

    // Get recent tickets
    const tickets = await this.ticketRepository.find({
      where: this.getTenantWhere(this.ticketRepository, organizationId) as any,
      order: { createdAt: 'DESC' } as any,
      take: 5,
    });

    tickets.forEach(ticket => {
      activities.push({
        type: 'ticket',
        id: ticket.id,
        title: `Ticket: ${ticket.subject}`,
        description: `Status: ${ticket.status}`,
        timestamp: ticket.createdAt,
        user: ticket.submittedBy || 'System',
      });
    });

    // Sort by timestamp and limit
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getMarketingSummary(organizationId: string): Promise<MarketingSummary> {
    const campaigns = await this.campaignRepository.find({
      where: this.getTenantWhere(this.campaignRepository, organizationId) as any,
    });

    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter((campaign) => campaign.status === CampaignStatus.ACTIVE).length;
    const totalSpend = campaigns.reduce((sum, campaign) => sum + Number(campaign.spentAmount || 0), 0);

    const analytics = await this.analyticsRepository.find({
      where: this.getTenantWhere(this.analyticsRepository, organizationId) as any,
    });
    const totalRevenue = analytics.reduce((sum, event) => sum + Number(event.revenue || 0), 0);
    const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;

    const revenueByCampaign = analytics.reduce((acc, event) => {
      acc[event.campaignId] = (acc[event.campaignId] || 0) + Number(event.revenue || 0);
      return acc;
    }, {} as Record<string, number>);

    const roiByCampaign = campaigns
      .map((campaign) => {
        const revenue = revenueByCampaign[campaign.id] || 0;
        const spend = Number(campaign.spentAmount || 0);
        const campaignRoi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;
        return {
          campaignId: campaign.id,
          name: campaign.name,
          roi: Math.round(campaignRoi * 100) / 100,
          revenue,
          spend,
        };
      })
      .sort((a, b) => b.roi - a.roi);

    const channelMix = campaigns.reduce((acc, campaign) => {
      const key = campaign.type || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCampaigns,
      activeCampaigns,
      totalSpend,
      totalRevenue,
      roi: Math.round(roi * 100) / 100,
      roiByCampaign: roiByCampaign.slice(0, 6),
      channelMix: Object.entries(channelMix).map(([label, value]) => ({ label, value })),
    };
  }

  async getSupportSlaSummary(organizationId: string): Promise<SupportSlaSummary> {
    const now = new Date();
    const baseWhere = this.getTenantWhere(this.ticketRepository, organizationId) as any;

    const totalTickets = await this.ticketRepository.count({ where: baseWhere });
    const breachedTickets = await this.ticketRepository.count({
      where: {
        ...baseWhere,
        due_date: LessThan(now),
        status: In([
          TicketStatus.OPEN,
          TicketStatus.OPEN,
          TicketStatus.IN_PROGRESS,
          TicketStatus.OPEN,
          TicketStatus.OPEN,
        ]) as any,
      } as any,
    });

    const avgResolutionQuery = this.ticketRepository
      .createQueryBuilder('ticket')
      .select('AVG(EXTRACT(EPOCH FROM (ticket.resolvedAt - ticket.createdAt)))', 'avg')
      .where('ticket.resolvedAt IS NOT NULL');
    this.applyTenantFilter(avgResolutionQuery, 'ticket', baseWhere);
    const avgResolutionTime = await avgResolutionQuery.getRawOne();

    const byStatus = await Promise.all(
      Object.values(TicketStatus).map(async (status) => ({
        status,
        count: await this.ticketRepository.count({
          where: { ...baseWhere, status } as any,
        }),
      })),
    );

    return {
      totalTickets,
      breachedTickets,
      breachRate: totalTickets > 0 ? Math.round((breachedTickets / totalTickets) * 100) : 0,
      avgResolutionHours: avgResolutionTime?.avg ? Math.round((avgResolutionTime.avg / 3600) * 10) / 10 : 0,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item.count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  async getTierAnalytics(organizationId: string): Promise<{
    basic: TierAnalytics;
    premium: TierAnalytics;
    advanced: TierAnalytics;
  }> {
    const pipelineValueQuery = this.opportunityRepository
      .createQueryBuilder('opp')
      .select('SUM(opp.value)', 'sum')
      .where('1=1');
    this.applyTenantFilter(
      pipelineValueQuery,
      'opp',
      this.getTenantWhere(this.opportunityRepository, organizationId),
    );

    const [
      totalCustomers,
      totalLeads,
      totalOpportunities,
      openOpportunities,
      totalPipelineValue,
      totalProducts,
      totalReports,
      totalSegments,
      totalCampaigns,
      openTickets,
      totalTickets,
      totalDocuments,
      totalContracts,
      pendingTasks,
      ivrFlows,
      generatedContents,
      workflows,
    ] = await Promise.all([
      this.customerRepository.count({ where: this.getTenantWhere(this.customerRepository, organizationId) as any }),
      this.leadRepository.count({ where: this.getTenantWhere(this.leadRepository, organizationId) as any }),
      this.opportunityRepository.count({ where: this.getTenantWhere(this.opportunityRepository, organizationId) as any }),
      this.opportunityRepository.count({
        where: {
          ...this.getTenantWhere(this.opportunityRepository, organizationId),
          stage: Not(In([OpportunityStage.WON, OpportunityStage.LOST])) as any,
        } as any,
      }),
      pipelineValueQuery.getRawOne().then((res) => Number(res?.sum || 0)),
      this.productRepository.count({ where: this.getTenantWhere(this.productRepository, organizationId) as any }),
      this.reportRepository.count({ where: this.getTenantWhere(this.reportRepository, organizationId) as any }),
      this.segmentRepository.count({ where: this.getTenantWhere(this.segmentRepository, organizationId) as any }),
      this.campaignRepository.count({ where: this.getTenantWhere(this.campaignRepository, organizationId) as any }),
      this.ticketRepository.count({
        where: { ...this.getTenantWhere(this.ticketRepository, organizationId), status: TicketStatus.OPEN } as any,
      }),
      this.ticketRepository.count({ where: this.getTenantWhere(this.ticketRepository, organizationId) as any }),
      this.documentRepository.count({ where: this.getTenantWhere(this.documentRepository, organizationId) as any }),
      this.contractRepository.count({ where: this.getTenantWhere(this.contractRepository, organizationId) as any }),
      this.taskRepository.count({
        where: { ...this.getTenantWhere(this.taskRepository, organizationId), status: TaskStatus.TODO } as any,
      }),
      this.ivrMenuRepository.count({ where: this.getTenantWhere(this.ivrMenuRepository, organizationId) as any }),
      this.generatedContentRepository.count({
        where: this.getTenantWhere(this.generatedContentRepository, organizationId) as any,
      }),
      this.workflowRepository.count({ where: this.getTenantWhere(this.workflowRepository, organizationId) as any }),
    ]);

    return {
      basic: {
        kpis: [
          { label: 'Customers', value: totalCustomers },
          { label: 'Leads', value: totalLeads },
          { label: 'Open Opportunities', value: openOpportunities },
          { label: 'Products', value: totalProducts },
        ],
        highlights: [
          { label: 'Total Opportunities', value: totalOpportunities },
          { label: 'Pipeline Value', value: Math.round(totalPipelineValue) },
          { label: 'Reports', value: totalReports },
        ],
      },
      premium: {
        kpis: [
          { label: 'Campaigns', value: totalCampaigns },
          { label: 'Segments', value: totalSegments },
          { label: 'Open Tickets', value: openTickets },
          { label: 'Documents', value: totalDocuments },
        ],
        highlights: [
          { label: 'Total Tickets', value: totalTickets },
          { label: 'Contracts', value: totalContracts },
          { label: 'Tasks Pending', value: pendingTasks },
          { label: 'IVR Flows', value: ivrFlows },
        ],
      },
      advanced: {
        kpis: [
          { label: 'AI Contents', value: generatedContents },
          { label: 'Workflows', value: workflows },
        ],
        highlights: [
          { label: 'Automation Runs', value: 0 },
          { label: 'Predictive Alerts', value: 0 },
        ],
      },
    };
  }

  /**
   * Get user's custom dashboards
   */
  async getUserDashboards(userId: string): Promise<Dashboard[]> {
    return await this.dashboardRepository.find({
      where: { owner_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Create custom dashboard
   */
  async createDashboard(
    userId: string,
    name: string,
    widgets: any[]
  ): Promise<Dashboard> {
    const dashboard = this.dashboardRepository.create({
      name,
      owner_id: userId,
      widgets,
      visibility: DashboardVisibility.PRIVATE,
    } as any);

    return await this.dashboardRepository.save(dashboard) as unknown as Dashboard;
  }

  /**
   * Get dashboard by ID
   */
  async getDashboard(id: string, userId: string): Promise<Dashboard> {
    const dashboard = await this.dashboardRepository.findOne({
      where: { id, owner_id: userId },
    });

    if (dashboard) {
      dashboard.view_count += 1;
      dashboard.last_viewed_at = new Date();
      await this.dashboardRepository.save(dashboard);
    }

    return dashboard;
  }

  /**
   * Update dashboard
   */
  async updateDashboard(
    id: string,
    userId: string,
    updates: Partial<Dashboard>
  ): Promise<Dashboard> {
    const dashboard = await this.getDashboard(id, userId);

    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    Object.assign(dashboard, updates);
    return await this.dashboardRepository.save(dashboard);
  }

  /**
   * Delete dashboard
   */
  async deleteDashboard(id: string, userId: string): Promise<void> {
    await this.dashboardRepository.delete({ id, owner_id: userId });
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(organizationId: string, period: 'day' | 'week' | 'month' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    return {
      new_customers: await this.customerRepository.count({
        where: {
          ...this.getTenantWhere(this.customerRepository, organizationId),
          createdAt: Between(startDate, now),
        } as any,
      }),
      new_leads: await this.leadRepository.count({
        where: {
          ...this.getTenantWhere(this.leadRepository, organizationId),
          createdAt: Between(startDate, now),
        } as any,
      }),
      closed_deals: await this.opportunityRepository.count({
        where: {
          ...this.getTenantWhere(this.opportunityRepository, organizationId),
          stage: OpportunityStage.WON as any,
          updatedAt: Between(startDate, now),
        } as any,
      }),
      resolved_tickets: await this.ticketRepository.count({
        where: {
          ...this.getTenantWhere(this.ticketRepository, organizationId),
          status: TicketStatus.RESOLVED,
          resolved_at: Between(startDate, now),
        } as any,
      }),
    };
  }

  private getTenantWhere(repo: Repository<any>, organizationId: string): Record<string, any> {
    const columns = repo.metadata.columns.map((column) => column.propertyName);
    if (columns.includes('organizationId')) {
      return { organizationId };
    }
    if (columns.includes('organizationId')) {
      return { organizationId: organizationId };
    }
    if (columns.includes('tenantId')) {
      return { tenantId: organizationId };
    }
    if (columns.includes('tenant_id')) {
      return { tenant_id: organizationId };
    }
    return {};
  }

  private applyTenantFilter(
    qb: { andWhere: (query: string, params?: Record<string, any>) => any },
    alias: string,
    where: Record<string, any>,
  ) {
    Object.entries(where).forEach(([key, value]) => {
      qb.andWhere(`${alias}.${key} = :${key}`, { [key]: value });
    });
  }
}
