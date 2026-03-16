import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { UsageMetric, MetricType, MetricInterval } from '../entities/usage-metric.entity';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';

export interface UsageStats {
  totalApiCalls: number;
  totalStorageGB: number;
  totalEmailsSent: number;
  totalUsers: number;
  averageResponseTime: number;
  peakHour: number;
  dateRange: { start: Date; end: Date };
}

export interface DailyUsage {
  date: string;
  apiCalls: number;
  storageGB: number;
  emailsSent: number;
}

export interface ResourceQuota {
  apiCallsLimit: number;
  apiCallsUsed: number;
  storageLimit: number;
  storageUsed: number;
  emailsLimit: number;
  emailsUsed: number;
  usersLimit: number;
  usersUsed: number;
}

/**
 * Usage Tracking Service
 * Monitors and tracks resource consumption across the platform
 */
@Injectable()
export class UsageTrackingService {
  private readonly logger = new Logger(UsageTrackingService.name);

  constructor(
    @InjectRepository(UsageMetric)
    private usageMetricRepository: Repository<UsageMetric>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Track API Call
   */
  async trackApiCall(
    organizationId: string,
    userId: string,
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
  ): Promise<void> {
    try {
      await this.usageMetricRepository.save({
        organizationId,
        metricType: MetricType.API_CALLS,
        interval: MetricInterval.HOURLY,
        value: 1,
        metadata: {
          endpoint,
          method,
          responseTime,
          statusCode,
          userId,
        },
        recordedAt: new Date(),
      });
    } catch (error) {
      this.logger.error('Failed to track API call', error);
    }
  }

  /**
   * Track Storage Usage
   */
  async trackStorageUsage(
    organizationId: string,
    storageBytes: number,
    resourceType: string,
  ): Promise<void> {
    try {
      const storageGB = storageBytes / (1024 * 1024 * 1024);

      await this.usageMetricRepository.save({
        organizationId,
        metricType: MetricType.STORAGE,
        interval: MetricInterval.DAILY,
        value: Math.round(storageGB * 100), // Store as MB * 100 for precision
        metadata: {
          resourceType,
          bytes: storageBytes,
          gb: storageGB,
        },
        recordedAt: new Date(),
      });
    } catch (error) {
      this.logger.error('Failed to track storage usage', error);
    }
  }

  /**
   * Track Email Sent
   */
  async trackEmailSent(
    organizationId: string,
    userId: string,
    emailType: string,
    recipient: string,
  ): Promise<void> {
    try {
      await this.usageMetricRepository.save({
        organizationId,
        metricType: MetricType.EMAIL_SENT,
        interval: MetricInterval.DAILY,
        value: 1,
        metadata: {
          emailType,
          recipient,
          userId,
        },
        recordedAt: new Date(),
      });
    } catch (error) {
      this.logger.error('Failed to track email sent', error);
    }
  }

  /**
   * Get Usage Statistics
   */
  async getUsageStats(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<UsageStats> {
    const metrics = await this.usageMetricRepository.find({
      where: {
        organizationId,
        recordedAt: Between(startDate, endDate),
      },
    });

    const apiCalls = metrics.filter(m => m.metricType === MetricType.API_CALLS);
    const storageMetrics = metrics.filter(m => m.metricType === MetricType.STORAGE);
    const emails = metrics.filter(m => m.metricType === MetricType.EMAIL_SENT);

    // Calculate average response time
    const responseTimes = apiCalls
      .map(m => m.metadata?.responseTime)
      .filter(rt => rt !== undefined);
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    // Find peak hour
    const hourCounts: { [hour: number]: number } = {};
    apiCalls.forEach(call => {
      const hour = new Date(call.recordedAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakHour = Object.keys(hourCounts).length > 0
      ? parseInt(Object.keys(hourCounts).reduce((a, b) => hourCounts[parseInt(a)] > hourCounts[parseInt(b)] ? a : b))
      : 0;

    const latestStorage = storageMetrics.length > 0
      ? storageMetrics[storageMetrics.length - 1].value / 100
      : 0;

    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    return {
      totalApiCalls: apiCalls.reduce((sum, m) => sum + m.value, 0),
      totalStorageGB: latestStorage,
      totalEmailsSent: emails.reduce((sum, m) => sum + m.value, 0),
      totalUsers: organization?.currentUserCount || 0,
      averageResponseTime: Math.round(averageResponseTime),
      peakHour,
      dateRange: { start: startDate, end: endDate },
    };
  }

  /**
   * Get Daily Usage Breakdown
   */
  async getDailyUsage(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DailyUsage[]> {
    const metrics = await this.usageMetricRepository.find({
      where: {
        organizationId,
        recordedAt: Between(startDate, endDate),
      },
    });

    const dailyMap: { [date: string]: DailyUsage } = {};

    metrics.forEach(metric => {
      const dateStr = metric.recordedAt.toISOString().split('T')[0];
      
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = {
          date: dateStr,
          apiCalls: 0,
          storageGB: 0,
          emailsSent: 0,
        };
      }

      switch (metric.metricType) {
        case MetricType.API_CALLS:
          dailyMap[dateStr].apiCalls += metric.value;
          break;
        case MetricType.STORAGE:
          dailyMap[dateStr].storageGB = metric.value / 100;
          break;
        case MetricType.EMAIL_SENT:
          dailyMap[dateStr].emailsSent += metric.value;
          break;
      }
    });

    return Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get Resource Quota Status
   */
  async getResourceQuota(organizationId: string): Promise<ResourceQuota> {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const metrics = await this.usageMetricRepository.find({
      where: {
        organizationId,
        recordedAt: MoreThan(startOfMonth),
      },
    });

    const apiCallsUsed = metrics
      .filter(m => m.metricType === MetricType.API_CALLS)
      .reduce((sum, m) => sum + m.value, 0);
    
    const emailsUsed = metrics
      .filter(m => m.metricType === MetricType.EMAIL_SENT)
      .reduce((sum, m) => sum + m.value, 0);
    
    const storageMetrics = metrics.filter(m => m.metricType === MetricType.STORAGE);
    const storageUsed = storageMetrics.length > 0
      ? storageMetrics[storageMetrics.length - 1].value / 100
      : 0;

    return {
      apiCallsLimit: 10000,
      apiCallsUsed,
      storageLimit: 10,
      storageUsed,
      emailsLimit: 1000,
      emailsUsed,
      usersLimit: organization.maxUsers,
      usersUsed: organization.currentUserCount,
    };
  }

  /**
   * Check if Organization Exceeded Quota
   */
  async checkQuotaExceeded(
    organizationId: string,
    metricType: MetricType,
  ): Promise<{ exceeded: boolean; usage: number; limit: number }> {
    const quota = await this.getResourceQuota(organizationId);

    let exceeded = false;
    let usage = 0;
    let limit = 0;

    switch (metricType) {
      case MetricType.API_CALLS:
        usage = quota.apiCallsUsed;
        limit = quota.apiCallsLimit;
        exceeded = usage >= limit;
        break;
      case MetricType.STORAGE:
        usage = quota.storageUsed;
        limit = quota.storageLimit;
        exceeded = usage >= limit;
        break;
      case MetricType.EMAIL_SENT:
        usage = quota.emailsUsed;
        limit = quota.emailsLimit;
        exceeded = usage >= limit;
        break;
    }

    return { exceeded, usage, limit };
  }

  /**
   * Get Top API Endpoints
   */
  async getTopEndpoints(
    organizationId: string,
    startDate: Date,
    endDate: Date,
    limit: number = 10,
  ): Promise<{ endpoint: string; calls: number; avgResponseTime: number }[]> {
    const metrics = await this.usageMetricRepository.find({
      where: {
        organizationId,
        metricType: MetricType.API_CALLS,
        recordedAt: Between(startDate, endDate),
      },
    });

    const endpointMap: {
      [endpoint: string]: { calls: number; totalResponseTime: number };
    } = {};

    metrics.forEach(metric => {
      const endpoint = metric.metadata?.endpoint || 'unknown';
      const responseTime = metric.metadata?.responseTime || 0;

      if (!endpointMap[endpoint]) {
        endpointMap[endpoint] = { calls: 0, totalResponseTime: 0 };
      }

      endpointMap[endpoint].calls += metric.value;
      endpointMap[endpoint].totalResponseTime += responseTime * metric.value;
    });

    return Object.entries(endpointMap)
      .map(([endpoint, data]) => ({
        endpoint,
        calls: data.calls,
        avgResponseTime: data.calls > 0 ? Math.round(data.totalResponseTime / data.calls) : 0,
      }))
      .sort((a, b) => b.calls - a.calls)
      .slice(0, limit);
  }

  /**
   * Get Active Users Count
   */
  async getActiveUsersCount(
    organizationId: string,
    days: number = 30,
  ): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await this.usageMetricRepository
      .createQueryBuilder('metric')
      .where('metric.organizationId = :organizationId', { organizationId })
      .andWhere('metric.recordedAt >= :startDate', { startDate })
      .andWhere('metric.metadata->>\'userId\' IS NOT NULL')
      .getMany();

    const uniqueUsers = new Set(metrics.map(m => m.metadata?.userId).filter(id => id));
    return uniqueUsers.size;
  }

  /**
   * Get Usage Trends
   */
  async getUsageTrends(
    organizationId: string,
    metricType: MetricType,
    days: number = 30,
  ): Promise<{ date: string; value: number }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await this.usageMetricRepository.find({
      where: {
        organizationId,
        metricType,
        recordedAt: MoreThan(startDate),
      },
      order: {
        recordedAt: 'ASC',
      },
    });

    const dailyMap: { [date: string]: number } = {};

    metrics.forEach(metric => {
      const dateStr = metric.recordedAt.toISOString().split('T')[0];
      dailyMap[dateStr] = (dailyMap[dateStr] || 0) + metric.value;
    });

    return Object.entries(dailyMap).map(([date, value]) => ({ date, value }));
  }

  /**
   * Clean Up Old Metrics
   */
  async cleanupOldMetrics(retentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.usageMetricRepository
      .createQueryBuilder()
      .delete()
      .where('recordedAt < :cutoffDate', { cutoffDate })
      .execute();

    this.logger.log(`Cleaned up ${result.affected} old usage metrics`);
    return result.affected || 0;
  }

  /**
   * Get Organization Usage Summary
   */
  async getOrganizationSummary(organizationId: string): Promise<{
    currentPeriod: UsageStats;
    previousPeriod: UsageStats;
    quota: ResourceQuota;
    trends: { [key: string]: { date: string; value: number }[] };
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [currentPeriod, previousPeriod, quota, apiTrends, storageTrends] = await Promise.all([
      this.getUsageStats(organizationId, startOfMonth, now),
      this.getUsageStats(organizationId, startOfLastMonth, endOfLastMonth),
      this.getResourceQuota(organizationId),
      this.getUsageTrends(organizationId, MetricType.API_CALLS, 30),
      this.getUsageTrends(organizationId, MetricType.STORAGE, 30),
    ]);

    return {
      currentPeriod,
      previousPeriod,
      quota,
      trends: {
        apiCalls: apiTrends,
        storage: storageTrends,
      },
    };
  }
}
