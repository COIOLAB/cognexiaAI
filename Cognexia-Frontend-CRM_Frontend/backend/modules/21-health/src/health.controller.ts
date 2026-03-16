import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './services/health.service';

/**
 * Health Check Controller
 * Provides system health monitoring endpoints
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Basic health check',
    description: 'Returns basic system health status'
  })
  @ApiResponse({ status: 200, description: 'System is healthy' })
  @ApiResponse({ status: 503, description: 'System is unhealthy' })
  async check() {
    try {
      const healthData = await this.healthService.getDetailedHealthStatus();
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        ...healthData
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  @Get('detailed')
  @ApiOperation({ 
    summary: 'Detailed health check',
    description: 'Returns comprehensive system health information including all modules'
  })
  @ApiResponse({ status: 200, description: 'Detailed health information retrieved' })
  async detailed() {
    try {
      const [detailedHealth, moduleHealth, externalServices] = await Promise.all([
        this.healthService.getDetailedHealthStatus(),
        this.healthService.getModuleHealthStatus(),
        this.healthService.checkExternalServices()
      ]);

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        system: detailedHealth,
        modules: moduleHealth,
        externalServices,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  @Get('ready')
  @ApiOperation({ 
    summary: 'Readiness probe',
    description: 'Kubernetes readiness probe endpoint'
  })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  @ApiResponse({ status: 503, description: 'Application is not ready' })
  async ready() {
    try {
      // Check if all critical services are ready
      const moduleHealth = await this.healthService.getModuleHealthStatus();
      
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        modules: moduleHealth.modules,
        totalModules: moduleHealth.totalModules,
        healthyModules: moduleHealth.healthyModules
      };
    } catch (error) {
      throw new Error('Application not ready');
    }
  }

  @Get('live')
  @ApiOperation({ 
    summary: 'Liveness probe',
    description: 'Kubernetes liveness probe endpoint'
  })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  async live() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      pid: process.pid
    };
  }

  @Get('metrics')
  @ApiOperation({ 
    summary: 'System metrics',
    description: 'Returns system performance metrics'
  })
  @ApiResponse({ status: 200, description: 'System metrics retrieved' })
  async metrics() {
    try {
      const systemMetrics = await this.healthService.getSystemMetrics();
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        metrics: systemMetrics
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  @Get('comprehensive')
  @ApiOperation({ 
    summary: 'Comprehensive health check',
    description: 'Performs comprehensive health check including IoT, AI, and Blockchain systems'
  })
  @ApiResponse({ status: 200, description: 'Comprehensive health check completed' })
  async comprehensive() {
    try {
      const comprehensiveHealth = await this.healthService.performComprehensiveHealthCheck();
      
      return {
        status: 'ok',
        timestamp: comprehensiveHealth.timestamp,
        overall: comprehensiveHealth.overall,
        checks: comprehensiveHealth.checks,
        summary: comprehensiveHealth.summary
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
