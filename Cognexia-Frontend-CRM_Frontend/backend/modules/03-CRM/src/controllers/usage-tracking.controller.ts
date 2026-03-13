import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, UserTypes } from '../guards/roles.guard';
import { UserType } from '../entities/user.entity';
import { UsageTrackingService } from '../services/usage-tracking.service';
import { MetricType } from '../entities/usage-metric.entity';
import { GetOrganization } from '../decorators/organization.decorator';

/**
 * Usage Tracking Controller
 * Handles usage metrics, analytics, and quota management
 */
@Controller('usage')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsageTrackingController {
  constructor(private readonly usageTrackingService: UsageTrackingService) {}

  /**
   * Get Usage Overview
   * GET /usage
   */
  @Get()
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async getUsageOverview(@GetOrganization() organizationId?: string) {
    const summary = organizationId
      ? await this.usageTrackingService.getOrganizationSummary(organizationId)
      : null;
    return {
      success: true,
      data: {
        organizationId,
        summary,
        endpoints: [
          '/usage/stats/:organizationId',
          '/usage/daily/:organizationId',
          '/usage/quota/:organizationId',
          '/usage/summary/:organizationId',
          '/usage/top-endpoints/:organizationId',
          '/usage/active-users/:organizationId',
          '/usage/trends/:organizationId',
        ],
      },
    };
  }

  /**
   * Get Usage Statistics
   * GET /usage/stats/:organizationId
   */
  @Get('stats/:organizationId')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async getUsageStats(
    @Param('organizationId') organizationId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await this.usageTrackingService.getUsageStats(organizationId, start, end);

    return {
      message: 'Usage statistics retrieved successfully',
      data: stats,
    };
  }

  /**
   * Get Daily Usage Breakdown
   * GET /usage/daily/:organizationId
   */
  @Get('daily/:organizationId')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async getDailyUsage(
    @Param('organizationId') organizationId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const dailyUsage = await this.usageTrackingService.getDailyUsage(organizationId, start, end);

    return {
      message: 'Daily usage breakdown retrieved successfully',
      data: dailyUsage,
    };
  }

  /**
   * Get Resource Quota
   * GET /usage/quota/:organizationId
   */
  @Get('quota/:organizationId')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async getResourceQuota(@Param('organizationId') organizationId: string) {
    const quota = await this.usageTrackingService.getResourceQuota(organizationId);

    return {
      message: 'Resource quota retrieved successfully',
      data: quota,
    };
  }

  /**
   * Check Quota Exceeded
   * GET /usage/quota/:organizationId/check
   */
  @Get('quota/:organizationId/check')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async checkQuotaExceeded(
    @Param('organizationId') organizationId: string,
    @Query('metricType') metricType: MetricType,
  ) {
    const result = await this.usageTrackingService.checkQuotaExceeded(
      organizationId,
      metricType,
    );

    return {
      message: 'Quota check completed',
      data: result,
    };
  }

  /**
   * Get Top API Endpoints
   * GET /usage/top-endpoints/:organizationId
   */
  @Get('top-endpoints/:organizationId')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async getTopEndpoints(
    @Param('organizationId') organizationId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const topEndpoints = await this.usageTrackingService.getTopEndpoints(
      organizationId,
      start,
      end,
      limit,
    );

    return {
      message: 'Top API endpoints retrieved successfully',
      data: topEndpoints,
    };
  }

  /**
   * Get Active Users Count
   * GET /usage/active-users/:organizationId
   */
  @Get('active-users/:organizationId')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async getActiveUsersCount(
    @Param('organizationId') organizationId: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days?: number,
  ) {
    const activeUsers = await this.usageTrackingService.getActiveUsersCount(
      organizationId,
      days,
    );

    return {
      message: 'Active users count retrieved successfully',
      data: { activeUsers, period: `${days} days` },
    };
  }

  /**
   * Get Usage Trends
   * GET /usage/trends/:organizationId
   */
  @Get('trends/:organizationId')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async getUsageTrends(
    @Param('organizationId') organizationId: string,
    @Query('metricType') metricType: MetricType,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days?: number,
  ) {
    const trends = await this.usageTrackingService.getUsageTrends(
      organizationId,
      metricType,
      days,
    );

    return {
      message: 'Usage trends retrieved successfully',
      data: { metricType, trends },
    };
  }

  /**
   * Get Organization Usage Summary
   * GET /usage/summary/:organizationId
   */
  @Get('summary/:organizationId')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async getOrganizationSummary(@Param('organizationId') organizationId: string) {
    const summary = await this.usageTrackingService.getOrganizationSummary(organizationId);

    return {
      message: 'Organization usage summary retrieved successfully',
      data: summary,
    };
  }

  /**
   * Clean Up Old Metrics
   * POST /usage/cleanup
   */
  @Post('cleanup')
  @UserTypes(UserType.SUPER_ADMIN)
  async cleanupOldMetrics(
    @Query('retentionDays', new DefaultValuePipe(90), ParseIntPipe) retentionDays?: number,
  ) {
    const deleted = await this.usageTrackingService.cleanupOldMetrics(retentionDays);

    return {
      message: 'Old metrics cleaned up successfully',
      data: { deletedCount: deleted, retentionDays },
    };
  }

  /**
   * Track Manual Event
   * POST /usage/track/:organizationId
   */
  @Post('track/:organizationId')
  @UserTypes(UserType.SUPER_ADMIN)
  async trackManualEvent(
    @Param('organizationId') organizationId: string,
    @Query('userId') userId: string,
    @Query('eventType') eventType: string,
  ) {
    // This could be expanded to track custom events
    return {
      message: 'Event tracked successfully',
      data: { organizationId, userId, eventType },
    };
  }

  @Post('track')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN, UserType.ORG_USER)
  async trackEvent() {
    return {
      success: true,
      message: 'Event tracked successfully',
      timestamp: new Date(),
    };
  }

}
