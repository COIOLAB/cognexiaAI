import { Controller, Get, UseGuards, Param, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards';
import { Roles } from '../decorators/roles.decorator';
import { GetOrganization } from '../decorators/organization.decorator';
import { MetricsService } from '../services/metrics.service';
import { AnalyticsService } from '../services/analytics.service';

/**
 * Monitoring & Analytics Controller
 * 
 * Provides endpoints for:
 * - Prometheus metrics export
 * - Health checks
 * - System metrics
 * - Business analytics
 */

@ApiTags('Monitoring & Analytics')
@Controller('monitoring')
export class MonitoringController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  /**
   * Prometheus metrics endpoint
   * Public endpoint for Prometheus scraping
   */
  @Get('metrics')
  @Header('Content-Type', 'text/plain')
  @ApiOperation({ summary: 'Get Prometheus metrics' })
  @ApiResponse({ status: 200, description: 'Metrics in Prometheus format' })
  async getMetrics() {
    return this.metricsService.getPrometheusMetrics();
  }

  /**
   * Health check endpoint
   * Public endpoint for load balancer health checks
   */
  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service health status' })
  async healthCheck() {
    return this.metricsService.getHealthStatus();
  }

  /**
   * Detailed health status
   */
  @Get('health/detailed')
  @UseGuards(JwtAuthGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detailed health check' })
  @ApiResponse({ status: 200, description: 'Detailed health status' })
  async detailedHealth() {
    const health = await this.metricsService.getHealthStatus();
    const system = this.metricsService.getSystemMetrics();

    return {
      ...health,
      system,
    };
  }

  /**
   * Dashboard metrics
   */
  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard metrics' })
  @ApiResponse({ status: 200, description: 'Dashboard metrics' })
  async getDashboardMetrics() {
    return this.metricsService.getDashboardMetrics();
  }

  /**
   * System metrics
   */
  @Get('system')
  @UseGuards(JwtAuthGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get system metrics' })
  @ApiResponse({ status: 200, description: 'System metrics' })
  getSystemMetrics() {
    return this.metricsService.getSystemMetrics();
  }

  /**
   * Business metrics
   */
  @Get('business')
  @UseGuards(JwtAuthGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get business metrics' })
  @ApiResponse({ status: 200, description: 'Business metrics' })
  async getBusinessMetrics() {
    return this.metricsService.getBusinessMetrics();
  }

  /**
   * Organization-specific metrics
   */
  @Get('organization/:id')
  @UseGuards(JwtAuthGuard)
  @Roles('super_admin', 'client_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get organization metrics' })
  @ApiResponse({ status: 200, description: 'Organization metrics' })
  async getOrganizationMetrics(@Param('id') organizationId: string) {
    return this.metricsService.getOrganizationMetrics(organizationId);
  }

  /**
   * Current organization metrics
   */
  @Get('organization')
  @UseGuards(JwtAuthGuard)
  @Roles('client_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current organization metrics' })
  @ApiResponse({ status: 200, description: 'Organization metrics' })
  async getCurrentOrganizationMetrics(@GetOrganization() organizationId: string) {
    return this.metricsService.getOrganizationMetrics(organizationId);
  }

  /**
   * Comprehensive CRM analytics (all entities, services, features)
   */
  @Get('analytics/comprehensive')
  @UseGuards(JwtAuthGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get comprehensive CRM analytics covering all features' })
  @ApiResponse({ status: 200, description: 'Complete system analytics' })
  async getComprehensiveAnalytics() {
    return this.analyticsService.getComprehensiveAnalytics();
  }

  /**
   * Organization comprehensive analytics
   */
  @Get('analytics/organization/:id')
  @UseGuards(JwtAuthGuard)
  @Roles('super_admin', 'client_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get organization comprehensive analytics' })
  @ApiResponse({ status: 200, description: 'Organization analytics' })
  async getOrganizationAnalytics(@Param('id') organizationId: string) {
    return this.analyticsService.getComprehensiveAnalytics(organizationId);
  }

  /**
   * Feature usage statistics
   */
  @Get('analytics/features')
  @UseGuards(JwtAuthGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get feature usage statistics' })
  @ApiResponse({ status: 200, description: 'Feature usage data' })
  async getFeatureUsage(@GetOrganization() organizationId?: string) {
    return this.analyticsService.getFeatureUsage(organizationId);
  }
}
