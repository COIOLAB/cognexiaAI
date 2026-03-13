import { Controller, Post, Get, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AnalyticsGateway } from '../gateways/analytics.gateway';

interface ActivityEvent {
  organizationId: string;
  userId: string;
  action: string;
  category: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp: string;
}

interface UsageStats {
  organizationId: string;
  userId: string;
  sessionDuration: number;
  pagesVisited: string[];
  featuresUsed: string[];
  activeUsers: number;
  storageUsed: number;
  apiCallsCount: number;
}

@ApiTags('Analytics & Telemetry')
@Controller('analytics')
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsTelemetryController {
  constructor(private readonly analyticsGateway: AnalyticsGateway) {}

  @Post('track')
  @ApiOperation({ summary: 'Track user activity from client portal' })
  async trackActivity(@Body() event: ActivityEvent) {
    // In a real implementation, this would:
    // 1. Validate the data
    // 2. Store in a time-series database (e.g., InfluxDB, TimescaleDB)
    // 3. Update real-time dashboards
    // 4. Trigger alerts if needed
    
    console.log('Activity tracked:', {
      org: event.organizationId,
      action: event.action,
      category: event.category,
      label: event.label,
      timestamp: event.timestamp,
    });

    // Store in database
    // await this.analyticsService.storeActivity(event);

    // Broadcast to connected WebSocket clients
    this.analyticsGateway.broadcastActivity({
      id: Math.random().toString(36).substring(7),
      organizationName: 'Unknown Org', // In real implementation, fetch from DB
      userName: 'Unknown User', // In real implementation, fetch from DB
      label: event.label ?? 'Unknown',
      ...event,
    });

    return {
      success: true,
      message: 'Activity tracked successfully',
    };
  }

  @Post('usage-stats')
  @ApiOperation({ summary: 'Receive usage statistics from client portal' })
  async receiveUsageStats(@Body() stats: UsageStats) {
    // In a real implementation, this would:
    // 1. Update organization usage metrics
    // 2. Check against limits (storage, API calls, etc.)
    // 3. Update billing if needed
    // 4. Update health scores
    
    console.log('Usage stats received:', {
      org: stats.organizationId,
      activeUsers: stats.activeUsers,
      storage: (stats.storageUsed / 1024 / 1024).toFixed(2) + ' MB',
      apiCalls: stats.apiCallsCount,
      sessionDuration: (stats.sessionDuration / 1000 / 60).toFixed(1) + ' minutes',
    });

    // Update database
    // await this.analyticsService.updateUsageStats(stats);

    return {
      success: true,
      message: 'Usage statistics received',
      warnings: this.checkUsageLimits(stats),
    };
  }

  private checkUsageLimits(stats: UsageStats): string[] {
    const warnings: string[] = [];

    // Check storage limits (example: 1GB for basic tier)
    const storageGB = stats.storageUsed / 1024 / 1024 / 1024;
    if (storageGB > 0.9) {
      warnings.push('Storage usage is at 90% of limit');
    }

    // Check API calls (example: 10,000 per day for premium tier)
    if (stats.apiCallsCount > 9000) {
      warnings.push('API calls approaching daily limit');
    }

    return warnings;
  }

  @Get('activities')
  @ApiOperation({ summary: 'Get activity feed' })
  async getActivities(
    @Query('organizationId') organizationId?: string,
    @Query('limit') limit: number = 50,
  ) {
    // In real implementation, fetch from database
    // For now, return mock activities
    
    const mockActivities = [
      {
        id: '1',
        organizationId: organizationId || '00000000-0000-0000-0000-000000000001',
        organizationName: 'CognexiaAI Fixture Org',
        userId: '123',
        userName: 'John Doe',
        action: 'viewed',
        category: 'navigation',
        label: 'Dashboard',
        timestamp: new Date(Date.now() - 120000).toISOString(),
      },
      {
        id: '2',
        organizationId: organizationId || '00000000-0000-0000-0000-000000000001',
        organizationName: 'CognexiaAI Fixture Org',
        userId: '123',
        userName: 'John Doe',
        action: 'uploaded',
        category: 'document',
        label: 'contract.pdf',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        metadata: { fileSize: 245678, fileType: 'application/pdf' },
      },
      {
        id: '3',
        organizationId: organizationId || '00000000-0000-0000-0000-000000000001',
        organizationName: 'CognexiaAI Fixture Org',
        userId: '456',
        userName: 'Jane Smith',
        action: 'accessed',
        category: 'feature',
        label: 'Advanced Reporting',
        timestamp: new Date(Date.now() - 600000).toISOString(),
      },
    ];

    return {
      activities: mockActivities,
      total: mockActivities.length,
    };
  }

  @Get('usage/:organizationId')
  @ApiOperation({ summary: 'Get usage analytics for organization' })
  async getUsageAnalytics(@Query('organizationId') organizationId: string) {
    // In real implementation, fetch from database and calculate metrics
    
    return {
      organizationId,
      activeUsers: 7,
      totalUsers: 10,
      storageUsed: 3.2 * 1024 * 1024 * 1024,
      storageLimit: 10 * 1024 * 1024 * 1024,
      apiCallsToday: 1247,
      apiCallsLimit: 10000,
      averageSessionDuration: 45 * 60 * 1000,
      featuresUsed: [
        { feature: 'Advanced Reporting', usageCount: 23, lastUsed: new Date().toISOString() },
        { feature: 'Email Campaigns', usageCount: 15, lastUsed: new Date().toISOString() },
        { feature: 'Calendar Sync', usageCount: 42, lastUsed: new Date().toISOString() },
      ],
      usageTrend: [
        { date: '2026-01-20', activeUsers: 5, apiCalls: 856, storageGB: 2.8 },
        { date: '2026-01-21', activeUsers: 6, apiCalls: 923, storageGB: 2.9 },
        { date: '2026-01-22', activeUsers: 8, apiCalls: 1134, storageGB: 3.0 },
        { date: '2026-01-23', activeUsers: 7, apiCalls: 1089, storageGB: 3.1 },
        { date: '2026-01-24', activeUsers: 9, apiCalls: 1456, storageGB: 3.15 },
        { date: '2026-01-25', activeUsers: 6, apiCalls: 978, storageGB: 3.18 },
        { date: '2026-01-26', activeUsers: 8, apiCalls: 1312, storageGB: 3.2 },
        { date: '2026-01-27', activeUsers: 7, apiCalls: 1247, storageGB: 3.2 },
      ],
    };
  }
}
