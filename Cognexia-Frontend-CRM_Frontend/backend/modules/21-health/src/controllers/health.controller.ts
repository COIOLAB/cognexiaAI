import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { 
  HealthCheckService, 
  TypeOrmHealthIndicator, 
  HealthCheck,
  MemoryHealthIndicator,
  DiskHealthIndicator
} from '@nestjs/terminus';
import { HealthService } from '../services/health.service';

@ApiTags('Health Checks')
@Controller('health')
export class HealthController {
  constructor(
    private healthCheckService: HealthCheckService,
    private typeOrmHealth: TypeOrmHealthIndicator,
    private memoryHealth: MemoryHealthIndicator,
    private diskHealth: DiskHealthIndicator,
    private healthService: HealthService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'General health check' })
  @ApiResponse({ status: 200, description: 'Health check results' })
  @HealthCheck()
  check() {
    return this.healthCheckService.check([
      () => this.typeOrmHealth.pingCheck('database'),
      () => this.memoryHealth.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memoryHealth.checkRSS('memory_rss', 150 * 1024 * 1024),
      () => this.diskHealth.checkStorage('storage', { 
        path: '/', 
        thresholdPercent: 0.9 
      }),
    ]);
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Detailed system health status' })
  @ApiResponse({ status: 200, description: 'Detailed health information' })
  async getDetailedHealth() {
    return this.healthService.getDetailedHealthStatus();
  }

  @Get('modules')
  @ApiOperation({ summary: 'Module health status' })
  @ApiResponse({ status: 200, description: 'Health status of all modules' })
  async getModuleHealth() {
    return this.healthService.getModuleHealthStatus();
  }

  @Get('database')
  @ApiOperation({ summary: 'Database health check' })
  @ApiResponse({ status: 200, description: 'Database health status' })
  @HealthCheck()
  checkDatabase() {
    return this.healthCheckService.check([
      () => this.typeOrmHealth.pingCheck('database'),
    ]);
  }

  @Get('memory')
  @ApiOperation({ summary: 'Memory health check' })
  @ApiResponse({ status: 200, description: 'Memory usage status' })
  @HealthCheck()
  checkMemory() {
    return this.healthCheckService.check([
      () => this.memoryHealth.checkHeap('memory_heap', 200 * 1024 * 1024),
      () => this.memoryHealth.checkRSS('memory_rss', 200 * 1024 * 1024),
    ]);
  }

  // Industry 5.0 Comprehensive Health Endpoints

  @Get('comprehensive')
  @ApiOperation({ 
    summary: 'Comprehensive Industry 5.0 health check',
    description: 'Performs comprehensive health check of all Industry 5.0 components including IoT devices, AI models, blockchain nodes, and quantum resources'
  })
  @ApiResponse({ status: 200, description: 'Comprehensive health check completed successfully' })
  async getComprehensiveHealth() {
    return this.healthService.performComprehensiveHealthCheck();
  }

  @Get('system')
  @ApiOperation({ 
    summary: 'System metrics',
    description: 'Returns detailed system metrics including memory, CPU, disk, and network information'
  })
  @ApiResponse({ status: 200, description: 'System metrics retrieved successfully' })
  async getSystemMetrics() {
    return this.healthService.getSystemMetrics();
  }

  @Get('external-services')
  @ApiOperation({ 
    summary: 'External services status',
    description: 'Returns health status of external services like Redis, AI providers, blockchain nodes, etc.'
  })
  @ApiResponse({ status: 200, description: 'External services status retrieved successfully' })
  async getExternalServices() {
    return this.healthService.checkExternalServices();
  }

  @Get('iot-devices')
  @ApiOperation({ 
    summary: 'IoT devices health',
    description: 'Returns health status of connected IoT devices including sensors, robots, and smart equipment'
  })
  @ApiResponse({ status: 200, description: 'IoT devices health status retrieved successfully' })
  async getIoTDevicesHealth() {
    return this.healthService.checkIoTDevices();
  }

  @Get('ai-models')
  @ApiOperation({ 
    summary: 'AI models health',
    description: 'Returns health status of deployed AI/ML models including predictive maintenance, quality control, and forecasting models'
  })
  @ApiResponse({ status: 200, description: 'AI models health status retrieved successfully' })
  async getAIModelsHealth() {
    return this.healthService.checkAIModels();
  }

  @Get('blockchain')
  @ApiOperation({ 
    summary: 'Blockchain nodes health',
    description: 'Returns health status of blockchain nodes used for supply chain traceability and smart contracts'
  })
  @ApiResponse({ status: 200, description: 'Blockchain nodes health status retrieved successfully' })
  async getBlockchainHealth() {
    return this.healthService.checkBlockchainNodes();
  }

  @Get('quantum')
  @ApiOperation({ 
    summary: 'Quantum computing resources health',
    description: 'Returns health status of quantum computing resources used for optimization and cryptography'
  })
  @ApiResponse({ status: 200, description: 'Quantum resources health status retrieved successfully' })
  async getQuantumHealth() {
    return this.healthService.checkQuantumResources();
  }

  @Get('history')
  @ApiOperation({ 
    summary: 'Health check history',
    description: 'Returns historical health check data for trend analysis and monitoring'
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Number of historical records to return (default: 100, max: 1000)' 
  })
  @ApiResponse({ status: 200, description: 'Health check history retrieved successfully' })
  async getHealthHistory(@Query('limit') limit?: number) {
    const historyLimit = limit ? Math.min(parseInt(limit.toString()), 1000) : 100;
    const history = this.healthService.getHealthHistory(historyLimit);
    
    return {
      history,
      metadata: {
        totalRecords: history.length,
        requestedLimit: historyLimit,
        timestamp: new Date().toISOString(),
        oldestRecord: history.length > 0 ? history[0].timestamp : null,
        newestRecord: history.length > 0 ? history[history.length - 1].timestamp : null,
      },
    };
  }
}
