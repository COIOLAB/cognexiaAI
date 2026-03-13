import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';
import { SupportAnalyticsService } from '../services/support-analytics.service';

@ApiTags('Support Analytics')
@Controller('support-analytics')
// @UseGuards(JwtAuthGuard, RBACGuard)
@ApiBearerAuth()
export class SupportAnalyticsController {
  constructor(private readonly service: SupportAnalyticsService) {}

  @Get('daily-summary')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get daily support summary' })
  async getDailySummary(@Query('date') date?: string) {
    return await this.service.getDailySummary(date ? new Date(date) : undefined);
  }

  @Get('overview')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get support overview' })
  async getOverview() {
    return await this.service.getOverview();
  }

  @Get('sentiment-trends')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get sentiment trends' })
  async getSentimentTrends() {
    return await this.service.getSentimentTrends();
  }

  @Get('team-performance')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get team performance' })
  async getTeamPerformance() {
    return await this.service.getTeamPerformance();
  }
}
