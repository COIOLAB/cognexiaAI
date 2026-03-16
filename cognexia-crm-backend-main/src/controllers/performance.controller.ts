import { Controller, Get, Post, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DatabaseOptimizationService } from '../services/database-optimization.service';
import { PerformanceInterceptor } from '../interceptors/performance.interceptor';
import { JwtAuthGuard } from '../guards';
import { Roles } from '../decorators/roles.decorator';

/**
 * Performance Monitoring Controller
 * 
 * Admin-only endpoints for:
 * - Query performance analysis
 * - Index recommendations
 * - Connection pool stats
 * - Request performance metrics
 */

@ApiTags('Performance & Optimization')
@ApiBearerAuth()
@Controller('performance')
@UseGuards(JwtAuthGuard)
export class PerformanceController {
  constructor(
    private readonly dbOptimizationService: DatabaseOptimizationService,
    private readonly performanceInterceptor: PerformanceInterceptor,
  ) {}

  /**
   * Get database performance metrics
   */
  @Get('metrics')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get database performance metrics' })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved' })
  async getMetrics() {
    return this.dbOptimizationService.getPerformanceMetrics();
  }

  /**
   * Get slow queries report
   */
  @Get('slow-queries')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get slow queries report' })
  @ApiResponse({ status: 200, description: 'Slow queries retrieved' })
  getSlowQueries(@Query('context') context?: string) {
    return this.dbOptimizationService.getSlowQueriesReport(context);
  }

  /**
   * Clear slow query cache
   */
  @Delete('slow-queries')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Clear slow query cache' })
  @ApiResponse({ status: 200, description: 'Slow query cache cleared' })
  clearSlowQueries() {
    this.dbOptimizationService.clearSlowQueryCache();
    return { message: 'Slow query cache cleared' };
  }

  /**
   * Get index recommendations for entity
   */
  @Get('index-recommendations/:entity')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get index recommendations for entity' })
  @ApiResponse({ status: 200, description: 'Index recommendations retrieved' })
  async getIndexRecommendations(@Param('entity') entity: string) {
    return this.dbOptimizationService.getIndexRecommendations(entity);
  }

  /**
   * Create recommended indexes (dry run by default)
   */
  @Post('create-indexes/:entity')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Create recommended indexes for entity' })
  @ApiResponse({ status: 200, description: 'Indexes created or dry run completed' })
  async createIndexes(
    @Param('entity') entity: string,
    @Query('dryRun') dryRun: string = 'true',
  ) {
    const isDryRun = dryRun === 'true';
    const queries = await this.dbOptimizationService.createRecommendedIndexes(entity, isDryRun);
    
    return {
      dryRun: isDryRun,
      entity,
      queries,
      message: isDryRun 
        ? 'Dry run completed - no indexes were created' 
        : `Created ${queries.length} indexes`,
    };
  }

  /**
   * Get connection pool statistics
   */
  @Get('connection-pool')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get connection pool statistics' })
  @ApiResponse({ status: 200, description: 'Connection pool stats retrieved' })
  getConnectionPoolStats() {
    return this.dbOptimizationService.getConnectionPoolStats();
  }

  /**
   * Get table sizes
   */
  @Get('table-sizes')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get table sizes' })
  @ApiResponse({ status: 200, description: 'Table sizes retrieved' })
  async getTableSizes() {
    return this.dbOptimizationService.getTableSizes();
  }

  /**
   * Analyze specific table
   */
  @Post('analyze/:table')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Run ANALYZE on specific table' })
  @ApiResponse({ status: 200, description: 'Table analyzed' })
  async analyzeTable(@Param('table') table: string) {
    await this.dbOptimizationService.analyzeTable(table);
    return { message: `Table ${table} analyzed successfully` };
  }

  /**
   * Run VACUUM ANALYZE (maintenance)
   */
  @Post('vacuum-analyze')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Run VACUUM ANALYZE on database' })
  @ApiResponse({ status: 200, description: 'VACUUM ANALYZE completed' })
  async vacuumAnalyze() {
    await this.dbOptimizationService.vacuumAnalyze();
    return { message: 'VACUUM ANALYZE completed successfully' };
  }

  /**
   * Get request performance metrics
   */
  @Get('requests')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get request performance metrics' })
  @ApiResponse({ status: 200, description: 'Request metrics retrieved' })
  getRequestMetrics() {
    return {
      metrics: this.performanceInterceptor.getMetrics(),
      averageResponseTimes: Array.from(
        this.performanceInterceptor.getAverageResponseTime().entries()
      ).map(([path, stats]) => ({ path, ...stats })),
    };
  }

  /**
   * Get slow requests
   */
  @Get('requests/slow')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get slow requests' })
  @ApiResponse({ status: 200, description: 'Slow requests retrieved' })
  getSlowRequests() {
    return this.performanceInterceptor.getSlowRequests();
  }

  /**
   * Clear request metrics
   */
  @Delete('requests')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Clear request performance metrics' })
  @ApiResponse({ status: 200, description: 'Request metrics cleared' })
  clearRequestMetrics() {
    this.performanceInterceptor.clearMetrics();
    return { message: 'Request metrics cleared' };
  }

  /**
   * Set slow query threshold
   */
  @Post('slow-query-threshold')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Set slow query threshold (milliseconds)' })
  @ApiResponse({ status: 200, description: 'Threshold updated' })
  setSlowQueryThreshold(@Query('ms') milliseconds: number) {
    this.dbOptimizationService.setSlowQueryThreshold(milliseconds);
    return { 
      message: `Slow query threshold set to ${milliseconds}ms`,
      threshold: milliseconds,
    };
  }
}
