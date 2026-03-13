import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Between } from 'typeorm';
import { Organization, SubscriptionStatus } from '../entities/organization.entity';
import { User, UserType } from '../entities/user.entity';
import { BillingTransaction, TransactionStatus } from '../entities/billing-transaction.entity';
import { UsageMetric, MetricType } from '../entities/usage-metric.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';

export interface PlatformMetrics {
  totalOrganizations: number;
  activeOrganizations: number;
  trialOrganizations: number;
  suspendedOrganizations: number;
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerOrganization: number;
  churnRate: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  averageRevenuePerUser: number;
  revenueGrowth: number;
  refundRate: number;
  pendingRevenue: number;
}

export interface UsageMetrics {
  totalApiCalls: number;
  totalStorageGB: number;
  totalEmailsSent: number;
  averageResponseTime: number;
  errorRate: number;
}

export interface OrganizationHealth {
  organizationId: string;
  organizationName: string;
  status: string;
  subscriptionStatus: string;
  userCount: number;
  maxUsers: number;
  utilizationRate: number;
  lastActivity: Date;
  healthScore: number; // 0-100
  issues: string[];
}

/**
 * Admin Dashboard Service
 * Provides platform-wide metrics and insights for CognexiaAI super admins
 */
@Injectable()
export class AdminDashboardService {
  private readonly logger = new Logger(AdminDashboardService.name);

  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(BillingTransaction)
    private transactionRepository: Repository<BillingTransaction>,
    @InjectRepository(UsageMetric)
    private usageMetricRepository: Repository<UsageMetric>,
    @InjectRepository(SubscriptionPlan)
    private planRepository: Repository<SubscriptionPlan>,
  ) {}

  /**
   * Get Platform Metrics
   */
  async getPlatformMetrics(): Promise<PlatformMetrics> {
    const [
      totalOrgs,
      activeOrgs,
      trialOrgs,
      suspendedOrgs,
      totalUsers,
      activeUsers,
    ] = await Promise.all([
      this.organizationRepository.count(),
      this.organizationRepository.count({ where: { isActive: true, subscriptionStatus: SubscriptionStatus.ACTIVE } }),
      this.organizationRepository.count({ where: { subscriptionStatus: SubscriptionStatus.TRIAL } }),
      this.organizationRepository.count({ where: { isActive: false } }),
      this.userRepository.count(),
      this.userRepository.count({ where: { isActive: true } }),
    ]);

    // Calculate revenue metrics
    const organizations = await this.organizationRepository.find({ where: { isActive: true } });
    const totalRevenue = organizations.reduce((sum, org) => sum + org.monthlyRevenue, 0);
    const monthlyRecurringRevenue = totalRevenue;
    const averageRevenuePerOrganization = activeOrgs > 0 ? totalRevenue / activeOrgs : 0;

    // Calculate churn rate (simplified)
    const churnRate = totalOrgs > 0 ? (suspendedOrgs / totalOrgs) * 100 : 0;

    return {
      totalOrganizations: totalOrgs,
      activeOrganizations: activeOrgs,
      trialOrganizations: trialOrgs,
      suspendedOrganizations: suspendedOrgs,
      totalUsers,
      activeUsers,
      totalRevenue,
      monthlyRecurringRevenue,
      averageRevenuePerOrganization,
      churnRate,
    };
  }

  /**
   * Get Revenue Metrics
   */
  async getRevenueMetrics(startDate?: Date, endDate?: Date): Promise<RevenueMetrics> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const transactions = await this.transactionRepository.find({
      where: {
        createdAt: Between(start, end),
        status: TransactionStatus.COMPLETED,
      },
    });

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Get active subscriptions for MRR
    const activeOrgs = await this.organizationRepository.find({
      where: { isActive: true, subscriptionStatus: SubscriptionStatus.ACTIVE },
    });
    const monthlyRecurringRevenue = activeOrgs.reduce((sum, org) => sum + org.monthlyRevenue, 0);
    const annualRecurringRevenue = monthlyRecurringRevenue * 12;

    // Calculate ARPU
    const totalActiveUsers = activeOrgs.reduce((sum, org) => sum + org.currentUserCount, 0);
    const averageRevenuePerUser = totalActiveUsers > 0 ? monthlyRecurringRevenue / totalActiveUsers : 0;

    // Calculate growth
    const previousStart = new Date(start);
    previousStart.setMonth(previousStart.getMonth() - 1);
    const previousEnd = new Date(end);
    previousEnd.setMonth(previousEnd.getMonth() - 1);

    const previousTransactions = await this.transactionRepository.find({
      where: {
        createdAt: Between(previousStart, previousEnd),
        status: TransactionStatus.COMPLETED,
      },
    });
    const previousRevenue = previousTransactions.reduce((sum, t) => sum + t.amount, 0);
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Calculate refund rate
    const refunds = transactions.filter(t => t.amount < 0);
    const refundAmount = Math.abs(refunds.reduce((sum, t) => sum + t.amount, 0));
    const refundRate = totalRevenue > 0 ? (refundAmount / totalRevenue) * 100 : 0;

    // Pending revenue
    const pendingTransactions = await this.transactionRepository.find({
      where: { status: TransactionStatus.PENDING },
    });
    const pendingRevenue = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      totalRevenue,
      monthlyRecurringRevenue,
      annualRecurringRevenue,
      averageRevenuePerUser,
      revenueGrowth,
      refundRate,
      pendingRevenue,
    };
  }

  /**
   * Get Usage Metrics
   */
  async getUsageMetrics(startDate?: Date, endDate?: Date): Promise<UsageMetrics> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const metrics = await this.usageMetricRepository.find({
      where: {
        recordedAt: Between(start, end),
      },
    });

    const apiCalls = metrics.filter(m => m.metricType === MetricType.API_CALLS);
    const storage = metrics.filter(m => m.metricType === MetricType.STORAGE);
    const emails = metrics.filter(m => m.metricType === MetricType.EMAIL_SENT);

    const totalApiCalls = apiCalls.reduce((sum, m) => sum + m.value, 0);
    const totalEmailsSent = emails.reduce((sum, m) => sum + m.value, 0);
    const totalStorageGB = storage.length > 0 ? storage[storage.length - 1].value / 100 : 0;

    // Calculate average response time
    const responseTimes = apiCalls
      .map(m => m.metadata?.responseTime)
      .filter(rt => rt !== undefined);
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    // Calculate error rate
    const errorCalls = apiCalls.filter(m => m.metadata?.statusCode >= 400);
    const errorRate = totalApiCalls > 0 ? (errorCalls.length / totalApiCalls) * 100 : 0;

    return {
      totalApiCalls,
      totalStorageGB,
      totalEmailsSent,
      averageResponseTime: Math.round(averageResponseTime),
      errorRate,
    };
  }

  /**
   * Get Top Organizations by Revenue
   */
  async getTopOrganizations(limit: number = 10): Promise<{
    organizationId: string;
    organizationName: string;
    monthlyRevenue: number;
    userCount: number;
    planName: string;
  }[]> {
    const organizations = await this.organizationRepository
      .createQueryBuilder('org')
      .leftJoinAndSelect('org.subscriptionPlan', 'plan')
      .where('org.isActive = :isActive', { isActive: true })
      .orderBy('org.monthlyRevenue', 'DESC')
      .limit(limit)
      .getMany();

    return organizations.map(org => ({
      organizationId: org.id,
      organizationName: org.name,
      monthlyRevenue: org.monthlyRevenue,
      userCount: org.currentUserCount,
      planName: org.subscriptionPlanId || 'Unknown',
    }));
  }

  /**
   * Get Organization Health Status
   */
  async getOrganizationHealth(organizationId: string): Promise<OrganizationHealth> {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    const lastMetric = await this.usageMetricRepository.findOne({
      where: { organizationId },
      order: { recordedAt: 'DESC' },
    });

    const lastActivity = lastMetric?.recordedAt || organization.updatedAt;
    const utilizationRate = organization.maxUsers > 0
      ? (organization.currentUserCount / organization.maxUsers) * 100
      : 0;

    const issues: string[] = [];
    let healthScore = 100;

    if (!organization.isActive) {
      healthScore -= 50;
      issues.push('Organization is suspended');
    }

    if (organization.subscriptionStatus === SubscriptionStatus.PAST_DUE) {
      healthScore -= 30;
      issues.push('Payment past due');
    }

    if (utilizationRate >= 95) {
      healthScore -= 10;
      issues.push('Near user limit');
    }

    const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceActivity > 7) {
      healthScore -= 20;
      issues.push('No activity in 7+ days');
    }

    return {
      organizationId: organization.id,
      organizationName: organization.name,
      status: organization.isActive ? 'active' : 'suspended',
      subscriptionStatus: organization.subscriptionStatus,
      userCount: organization.currentUserCount,
      maxUsers: organization.maxUsers,
      utilizationRate,
      lastActivity,
      healthScore: Math.max(0, healthScore),
      issues,
    };
  }

  /**
   * Get Organizations at Risk
   */
  async getOrganizationsAtRisk(): Promise<OrganizationHealth[]> {
    const organizations = await this.organizationRepository.find({
      where: { isActive: true },
    });

    const healthChecks = await Promise.all(
      organizations.map(org => this.getOrganizationHealth(org.id))
    );

    return healthChecks
      .filter(health => health.healthScore < 70 || health.issues.length > 0)
      .sort((a, b) => a.healthScore - b.healthScore);
  }

  /**
   * Get Growth Statistics
   */
  async getGrowthStatistics(days: number = 30): Promise<{
    newOrganizations: number;
    newUsers: number;
    revenueGrowth: number;
    churnedOrganizations: number;
    conversionRate: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [newOrgs, newUsers, churned] = await Promise.all([
      this.organizationRepository.count({
        where: { createdAt: MoreThan(startDate) },
      }),
      this.userRepository.count({
        where: { createdAt: MoreThan(startDate) },
      }),
      this.organizationRepository.count({
        where: {
          isActive: false,
          updatedAt: MoreThan(startDate),
        },
      }),
    ]);

    const trialToActive = await this.organizationRepository
      .createQueryBuilder('org')
      .where('org.subscriptionStartDate > :startDate', { startDate })
      .andWhere('org.subscriptionStatus = :status', { status: SubscriptionStatus.ACTIVE })
      .getCount();

    const totalTrials = await this.organizationRepository.count({
      where: { subscriptionStatus: SubscriptionStatus.TRIAL },
    });

    const conversionRate = totalTrials > 0 ? (trialToActive / totalTrials) * 100 : 0;
    const revenueMetrics = await this.getRevenueMetrics();

    return {
      newOrganizations: newOrgs,
      newUsers,
      revenueGrowth: revenueMetrics.revenueGrowth,
      churnedOrganizations: churned,
      conversionRate,
    };
  }

  /**
   * Get System Health
   */
  async getSystemHealth(): Promise<{
    database: 'healthy' | 'degraded' | 'down';
    apiResponseTime: number;
    errorRate: number;
    activeConnections: number;
  }> {
    try {
      const start = Date.now();
      await this.organizationRepository.count();
      const dbResponseTime = Date.now() - start;

      const usageMetrics = await this.getUsageMetrics();

      return {
        database: dbResponseTime < 100 ? 'healthy' : dbResponseTime < 500 ? 'degraded' : 'down',
        apiResponseTime: usageMetrics.averageResponseTime,
        errorRate: usageMetrics.errorRate,
        activeConnections: await this.userRepository.count({ where: { isActive: true } }),
      };
    } catch (error) {
      this.logger.error('System health check failed', error);
      return {
        database: 'down',
        apiResponseTime: 0,
        errorRate: 100,
        activeConnections: 0,
      };
    }
  }

  /**
   * Get Subscription Plan Distribution
   */
  async getSubscriptionPlanDistribution(): Promise<{
    planName: string;
    organizationCount: number;
    revenue: number;
    percentage: number;
  }[]> {
    const plans = await this.planRepository.find();
    const organizations = await this.organizationRepository.find({ where: { isActive: true } });

    const totalOrgs = organizations.length;
    const distribution = plans.map(plan => {
      const orgsOnPlan = organizations.filter(org => org.subscriptionPlanId === plan.id);
      const revenue = orgsOnPlan.reduce((sum, org) => sum + org.monthlyRevenue, 0);
      const percentage = totalOrgs > 0 ? (orgsOnPlan.length / totalOrgs) * 100 : 0;

      return {
        planName: plan.name,
        organizationCount: orgsOnPlan.length,
        revenue,
        percentage,
      };
    });

    return distribution.sort((a, b) => b.organizationCount - a.organizationCount);
  }
}
