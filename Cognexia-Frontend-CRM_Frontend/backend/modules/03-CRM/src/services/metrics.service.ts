import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { Customer } from '../entities/customer.entity';
import { Lead } from '../entities/lead.entity';
import { Opportunity, OpportunityStage } from '../entities/opportunity.entity';

/**
 * Metrics Service for Prometheus Export
 * 
 * Provides application metrics in Prometheus format:
 * - Business metrics (organizations, users, revenue)
 * - System metrics (requests, errors, latency)
 * - Custom metrics (conversions, engagement)
 */

export interface Metric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  help: string;
  value: number | Record<string, number>;
  labels?: Record<string, string>;
}

export interface SystemMetrics {
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
  process: {
    pid: number;
    uptime: number;
  };
}

export interface BusinessMetrics {
  totalOrganizations: number;
  activeOrganizations: number;
  totalUsers: number;
  activeUsers: number;
  totalCustomers: number;
  totalLeads: number;
  totalOpportunities: number;
  totalRevenue: number;
  conversionRate: number;
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private readonly startTime = Date.now();
  
  // Metrics counters
  private requestCount = 0;
  private errorCount = 0;
  private requestDurations: number[] = [];

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    @InjectRepository(Opportunity)
    private readonly opportunityRepo: Repository<Opportunity>,
  ) {}

  /**
   * Get all metrics in Prometheus format
   */
  async getPrometheusMetrics(): Promise<string> {
    const metrics: string[] = [];

    // System metrics
    const systemMetrics = this.getSystemMetrics();
    metrics.push(this.formatMetric({
      name: 'app_uptime_seconds',
      type: 'gauge',
      help: 'Application uptime in seconds',
      value: systemMetrics.uptime,
    }));

    metrics.push(this.formatMetric({
      name: 'app_memory_used_bytes',
      type: 'gauge',
      help: 'Memory used by application in bytes',
      value: systemMetrics.memory.used,
    }));

    metrics.push(this.formatMetric({
      name: 'app_memory_percentage',
      type: 'gauge',
      help: 'Memory usage percentage',
      value: systemMetrics.memory.percentage,
    }));

    // Business metrics
    const businessMetrics = await this.getBusinessMetrics();
    
    metrics.push(this.formatMetric({
      name: 'crm_organizations_total',
      type: 'gauge',
      help: 'Total number of organizations',
      value: businessMetrics.totalOrganizations,
    }));

    metrics.push(this.formatMetric({
      name: 'crm_organizations_active',
      type: 'gauge',
      help: 'Number of active organizations',
      value: businessMetrics.activeOrganizations,
    }));

    metrics.push(this.formatMetric({
      name: 'crm_users_total',
      type: 'gauge',
      help: 'Total number of users',
      value: businessMetrics.totalUsers,
    }));

    metrics.push(this.formatMetric({
      name: 'crm_users_active',
      type: 'gauge',
      help: 'Number of active users',
      value: businessMetrics.activeUsers,
    }));

    metrics.push(this.formatMetric({
      name: 'crm_customers_total',
      type: 'gauge',
      help: 'Total number of customers',
      value: businessMetrics.totalCustomers,
    }));

    metrics.push(this.formatMetric({
      name: 'crm_leads_total',
      type: 'gauge',
      help: 'Total number of leads',
      value: businessMetrics.totalLeads,
    }));

    metrics.push(this.formatMetric({
      name: 'crm_opportunities_total',
      type: 'gauge',
      help: 'Total number of opportunities',
      value: businessMetrics.totalOpportunities,
    }));

    metrics.push(this.formatMetric({
      name: 'crm_revenue_total',
      type: 'gauge',
      help: 'Total revenue from opportunities',
      value: businessMetrics.totalRevenue,
    }));

    metrics.push(this.formatMetric({
      name: 'crm_conversion_rate',
      type: 'gauge',
      help: 'Lead to customer conversion rate',
      value: businessMetrics.conversionRate,
    }));

    // Request metrics
    metrics.push(this.formatMetric({
      name: 'http_requests_total',
      type: 'counter',
      help: 'Total HTTP requests',
      value: this.requestCount,
    }));

    metrics.push(this.formatMetric({
      name: 'http_errors_total',
      type: 'counter',
      help: 'Total HTTP errors',
      value: this.errorCount,
    }));

    if (this.requestDurations.length > 0) {
      const avgDuration = this.requestDurations.reduce((a, b) => a + b, 0) / this.requestDurations.length;
      metrics.push(this.formatMetric({
        name: 'http_request_duration_seconds',
        type: 'summary',
        help: 'HTTP request duration in seconds',
        value: avgDuration / 1000,
      }));
    }

    return metrics.join('\n');
  }

  /**
   * Get system metrics
   */
  getSystemMetrics(): SystemMetrics {
    const memUsage = process.memoryUsage();
    const uptime = (Date.now() - this.startTime) / 1000;

    return {
      uptime,
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
      },
      cpu: {
        usage: process.cpuUsage().user / 1000000, // Convert to seconds
      },
      process: {
        pid: process.pid,
        uptime: process.uptime(),
      },
    };
  }

  /**
   * Get business metrics
   */
  async getBusinessMetrics(): Promise<BusinessMetrics> {
    try {
      const [
        totalOrganizations,
        activeOrganizations,
        totalUsers,
        activeUsers,
        totalCustomers,
        totalLeads,
        totalOpportunities,
      ] = await Promise.all([
        this.organizationRepo.count(),
        this.organizationRepo.count({ where: { isActive: true } as any }),
        this.userRepo.count(),
        this.userRepo.count({ where: { isActive: true } as any }),
        this.customerRepo.count(),
        this.leadRepo.count(),
        this.opportunityRepo.count(),
      ]);

      // Calculate total revenue
      const opportunities = await this.opportunityRepo.find({
        select: ['value'],
        where: { stage: 'closed_won' } as any,
      });
      const totalRevenue = opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);

      // Calculate conversion rate
      const convertedLeads = await this.customerRepo.count();
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      return {
        totalOrganizations,
        activeOrganizations,
        totalUsers,
        activeUsers,
        totalCustomers,
        totalLeads,
        totalOpportunities,
        totalRevenue,
        conversionRate,
      };
    } catch (error) {
      this.logger.error(`Failed to get business metrics: ${error.message}`);
      return {
        totalOrganizations: 0,
        activeOrganizations: 0,
        totalUsers: 0,
        activeUsers: 0,
        totalCustomers: 0,
        totalLeads: 0,
        totalOpportunities: 0,
        totalRevenue: 0,
        conversionRate: 0,
      };
    }
  }

  /**
   * Format metric for Prometheus
   */
  private formatMetric(metric: Metric): string {
    const lines: string[] = [];

    // Help text
    lines.push(`# HELP ${metric.name} ${metric.help}`);
    
    // Type
    lines.push(`# TYPE ${metric.name} ${metric.type}`);
    
    // Value
    if (typeof metric.value === 'number') {
      const labelsStr = metric.labels 
        ? `{${Object.entries(metric.labels).map(([k, v]) => `${k}="${v}"`).join(',')}}`
        : '';
      lines.push(`${metric.name}${labelsStr} ${metric.value}`);
    } else {
      // Multiple values with labels
      for (const [label, value] of Object.entries(metric.value)) {
        lines.push(`${metric.name}{label="${label}"} ${value}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Increment request counter
   */
  incrementRequests(): void {
    this.requestCount++;
  }

  /**
   * Increment error counter
   */
  incrementErrors(): void {
    this.errorCount++;
  }

  /**
   * Record request duration
   */
  recordRequestDuration(duration: number): void {
    this.requestDurations.push(duration);
    
    // Keep only last 1000 durations
    if (this.requestDurations.length > 1000) {
      this.requestDurations.shift();
    }
  }

  /**
   * Get health check status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'unhealthy';
    checks: Record<string, boolean>;
    timestamp: string;
  }> {
    const checks: Record<string, boolean> = {};

    // Check database connection
    try {
      await this.organizationRepo.count();
      checks.database = true;
    } catch (error) {
      checks.database = false;
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    checks.memory = (memUsage.heapUsed / memUsage.heapTotal) < 0.9; // Less than 90%

    // Overall status
    const status = Object.values(checks).every(check => check) ? 'healthy' : 'unhealthy';

    return {
      status,
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get detailed metrics for dashboard
   */
  async getDashboardMetrics(): Promise<{
    system: SystemMetrics;
    business: BusinessMetrics;
    requests: {
      total: number;
      errors: number;
      errorRate: number;
      avgDuration: number;
    };
  }> {
    const system = this.getSystemMetrics();
    const business = await this.getBusinessMetrics();
    
    const avgDuration = this.requestDurations.length > 0
      ? this.requestDurations.reduce((a, b) => a + b, 0) / this.requestDurations.length
      : 0;

    const errorRate = this.requestCount > 0
      ? (this.errorCount / this.requestCount) * 100
      : 0;

    return {
      system,
      business,
      requests: {
        total: this.requestCount,
        errors: this.errorCount,
        errorRate,
        avgDuration,
      },
    };
  }

  /**
   * Get organization-specific metrics
   */
  async getOrganizationMetrics(organizationId: string): Promise<{
    users: number;
    customers: number;
    leads: number;
    opportunities: number;
    revenue: number;
    conversionRate: number;
  }> {
    try {
      const [users, customers, leads, opportunities] = await Promise.all([
        this.userRepo.count({ where: this.getTenantWhere(this.userRepo, organizationId) as any }),
        this.customerRepo.count({ where: this.getTenantWhere(this.customerRepo, organizationId) as any }),
        this.leadRepo.count({ where: this.getTenantWhere(this.leadRepo, organizationId) as any }),
        this.opportunityRepo.count({ where: this.getTenantWhere(this.opportunityRepo, organizationId) as any }),
      ]);

      // Calculate revenue
      const orgOpportunities = await this.opportunityRepo.find({
        where: {
          ...this.getTenantWhere(this.opportunityRepo, organizationId),
          stage: OpportunityStage.WON as any,
        } as any,
        select: ['value'],
      });
      const revenue = orgOpportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);

      // Calculate conversion rate
      const conversionRate = leads > 0 ? (customers / leads) * 100 : 0;

      return {
        users,
        customers,
        leads,
        opportunities,
        revenue,
        conversionRate,
      };
    } catch (error) {
      this.logger.error(`Failed to get org metrics: ${error.message}`);
      throw error;
    }
  }

  private getTenantWhere(repo: Repository<any>, organizationId: string): Record<string, any> {
    const columns = repo.metadata.columns.map((column) => column.propertyName);
    if (columns.includes('organizationId')) {
      return { organizationId };
    }
    if (columns.includes('tenantId')) {
      return { tenantId: organizationId };
    }
    return {};
  }

  /**
   * Reset metrics (for testing)
   */
  reset(): void {
    this.requestCount = 0;
    this.errorCount = 0;
    this.requestDurations = [];
  }
}
