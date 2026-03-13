import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PlatformAnalyticsService } from '../services/platform-analytics.service';
import { GetAnalyticsDto, PlatformOverviewDto, GrowthTrendDto, UsageMetricsDto } from '../dto/analytics-dashboard.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('Platform Analytics')
@ApiBearerAuth()
@Controller('platform-analytics')
// @UseGuards(JwtAuthGuard, RBACGuard)
// @Roles('super_admin')
export class PlatformAnalyticsController {
  constructor(private readonly analyticsService: PlatformAnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get platform overview metrics' })
  @ApiResponse({ status: 200, description: 'Platform overview retrieved', type: PlatformOverviewDto })
  async getOverview(): Promise<PlatformOverviewDto> {
    return this.analyticsService.getPlatformOverview();
  }

  @Get('growth-trends')
  @ApiOperation({ summary: 'Get growth trends over time' })
  @ApiResponse({ status: 200, description: 'Growth trends retrieved', type: [GrowthTrendDto] })
  async getGrowthTrends(@Query() dto: GetAnalyticsDto): Promise<GrowthTrendDto[]> {
    return this.analyticsService.getGrowthTrends(dto);
  }

  @Get('usage-metrics')
  @ApiOperation({ summary: 'Get platform usage metrics' })
  @ApiResponse({ status: 200, description: 'Usage metrics retrieved', type: UsageMetricsDto })
  async getUsageMetrics(): Promise<UsageMetricsDto> {
    return this.analyticsService.getUsageMetrics();
  }

  @Get('revenue-breakdown')
  @ApiOperation({ summary: 'Get revenue breakdown by tier' })
  @ApiResponse({ status: 200, description: 'Revenue breakdown retrieved' })
  async getRevenueBreakdown() {
    return this.analyticsService.getRevenueBreakdown();
  }
}
