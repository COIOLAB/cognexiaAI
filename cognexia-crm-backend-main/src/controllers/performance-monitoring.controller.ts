import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';
import { PerformanceMonitoringService } from '../services/performance-monitoring.service';

@ApiTags('Performance Monitoring')
@Controller('performance')
// @UseGuards(JwtAuthGuard, RBACGuard)
@ApiBearerAuth()
export class PerformanceMonitoringController {
  constructor(private readonly service: PerformanceMonitoringService) {}

  @Get('dashboard')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get performance dashboard' })
  async getDashboard() {
    return await this.service.getDashboardMetrics();
  }

  @Get('endpoints')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get endpoint performance' })
  async getEndpointPerformance() {
    return await this.service.getEndpointPerformance();
  }

  @Get('system-health')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get system health' })
  async getSystemHealth() {
    return await this.service.getSystemHealth();
  }

  @Post('record')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Record performance metric' })
  async recordMetric(
    @Body('name') name: string,
    @Body('value') value: number,
    @Body('type') type: string,
    @Body('tags') tags?: Record<string, string>,
  ) {
    return await this.service.recordMetric(name, value, type, tags);
  }
}
