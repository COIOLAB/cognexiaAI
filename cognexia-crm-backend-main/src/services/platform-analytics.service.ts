import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PlatformAnalyticsSnapshot } from '../entities/platform-analytics.entity';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { GetAnalyticsDto, PlatformOverviewDto, GrowthTrendDto, UsageMetricsDto, AnalyticsPeriod } from '../dto/analytics-dashboard.dto';

@Injectable()
export class PlatformAnalyticsService {
  private readonly logger = new Logger(PlatformAnalyticsService.name);

  constructor(
    @InjectRepository(PlatformAnalyticsSnapshot)
    private analyticsRepository: Repository<PlatformAnalyticsSnapshot>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async getPlatformOverview(): Promise<PlatformOverviewDto> {
    const latestSnapshot = await this.analyticsRepository.findOne({
      where: {},
      order: { snapshotDate: 'DESC' },
    });

    const allSnapshots = await this.analyticsRepository.find({
      where: {},
      order: { snapshotDate: 'DESC' },
      take: 2,
    });
    const previousSnapshot = allSnapshots[1] || null;

    const currentData = latestSnapshot || await this.generateCurrentSnapshot();
    const previousData = previousSnapshot;

    const userGrowthPercentage = previousData
      ? ((currentData.totalActiveUsers - previousData.totalActiveUsers) / previousData.totalActiveUsers) * 100
      : 0;

    const orgGrowthPercentage = previousData
      ? ((currentData.totalOrganizations - previousData.totalOrganizations) / previousData.totalOrganizations) * 100
      : 0;

    return {
      totalActiveUsers: currentData.totalActiveUsers,
      totalOrganizations: currentData.totalOrganizations,
      mrr: Number(currentData.mrr),
      arr: Number(currentData.arr),
      churnRate: Number(currentData.churnRate),
      userGrowthPercentage: Number(userGrowthPercentage.toFixed(2)),
      organizationGrowthPercentage: Number(orgGrowthPercentage.toFixed(2)),
      organizationsByTier: currentData.organizationsByTier || { basic: 0, premium: 0, advanced: 0 },
      activeSessions: currentData.activeSessions,
      apiCallsCount: Number(currentData.apiCallsCount),
      avgApiResponseTime: currentData.avgApiResponseTime,
      totalStorageUsageGB: Number(currentData.totalStorageUsageGB),
    };
  }

  async getGrowthTrends(dto: GetAnalyticsDto): Promise<GrowthTrendDto[]> {
    const { startDate, endDate, period } = dto;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const snapshots = await this.analyticsRepository.find({
      where: {
        snapshotDate: Between(start, end),
      },
      order: { snapshotDate: 'ASC' },
    });

    return snapshots.map(snapshot => ({
      date: snapshot.snapshotDate.toISOString().split('T')[0],
      users: snapshot.totalActiveUsers,
      organizations: snapshot.totalOrganizations,
      revenue: Number(snapshot.mrr),
    }));
  }

  async getUsageMetrics(): Promise<UsageMetricsDto> {
    // Mock data - in production, this would query actual session/activity logs
    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: Math.floor(Math.random() * 1000) + 100,
    }));

    const peakUsageHour = hourlyDistribution.reduce((max, curr) =>
      curr.count > max.count ? curr : max
    ).hour;

    return {
      peakUsageHour,
      avgDailyActiveUsers: 5000,
      avgSessionDuration: 1800, // 30 minutes in seconds
      hourlyDistribution,
    };
  }

  async captureSnapshot(): Promise<PlatformAnalyticsSnapshot> {
    this.logger.log('Capturing platform analytics snapshot...');

    const snapshot = await this.generateCurrentSnapshot();
    const saved = await this.analyticsRepository.save(snapshot);

    this.logger.log(`Snapshot captured with ID: ${saved.id}`);
    return saved;
  }

  private async generateCurrentSnapshot(): Promise<PlatformAnalyticsSnapshot> {
    const totalActiveUsers = await this.userRepository.count({ where: { isActive: true } });
    const totalOrganizations = await this.organizationRepository.count({ where: { status: 'active' as any } });

    // Count by tier
    const organizations = await this.organizationRepository.find({
      where: { status: 'active' as any },
    });

    const organizationsByTier = organizations.reduce(
      (acc, org) => {
        const activeTier = org.userTierConfig?.activeTier || 'basic';
        acc[activeTier] = (acc[activeTier] || 0) + 1;
        return acc;
      },
      { basic: 0, premium: 0, advanced: 0 }
    );

    // Calculate MRR based on tier distribution
    const tierPricing = { basic: 29, premium: 99, advanced: 299 };
    const mrr = Object.entries(organizationsByTier).reduce(
      (sum, [tier, count]) => sum + count * tierPricing[tier],
      0
    );

    const snapshot = new PlatformAnalyticsSnapshot();
    snapshot.snapshotDate = new Date();
    snapshot.totalActiveUsers = totalActiveUsers;
    snapshot.totalOrganizations = totalOrganizations;
    snapshot.newUsers = 0; // Would be calculated from recent users
    snapshot.newOrganizations = 0; // Would be calculated from recent orgs
    snapshot.mrr = mrr;
    snapshot.arr = mrr * 12;
    snapshot.churnRate = 2.5; // Mock value
    snapshot.organizationsByTier = organizationsByTier;
    snapshot.apiCallsCount = Math.floor(Math.random() * 1000000);
    snapshot.avgApiResponseTime = Math.floor(Math.random() * 200) + 50;
    snapshot.databaseMetrics = {
      avgQueryTime: Math.floor(Math.random() * 50) + 10,
      activeConnections: Math.floor(Math.random() * 100) + 20,
      slowQueries: Math.floor(Math.random() * 10),
    };
    snapshot.totalStorageUsageGB = Math.random() * 1000;
    snapshot.activeSessions = Math.floor(Math.random() * 500) + 100;

    return snapshot;
  }

  async getRevenueBreakdown() {
    const organizations = await this.organizationRepository.find({
      where: { status: 'active' } as any,
    });

    const tierPricing = { basic: 29, premium: 99, advanced: 299 };

    const breakdown = organizations.reduce((acc, org) => {
      const tier = org.userTierConfig?.activeTier || 'basic';
      if (!acc[tier]) {
        acc[tier] = { count: 0, revenue: 0 };
      }
      acc[tier].count++;
      acc[tier].revenue += tierPricing[tier];
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    return breakdown;
  }
}
