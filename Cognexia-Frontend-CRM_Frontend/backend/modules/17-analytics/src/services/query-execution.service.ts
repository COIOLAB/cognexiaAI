import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { BaseAnalyticsService } from './base-analytics.service';
import { DataSourceService } from './data-source.service';
import {
  AnalyticsQuery,
  QueryExecution,
  AnalyticsDataSource,
  ProcessingStatus,
  AnalyticsType,
} from '../entities';
import {
  CreateAnalyticsQueryDto,
  UpdateAnalyticsQueryDto,
  AnalyticsQueryDto,
  ExecuteQueryDto,
  QueryExecutionResultDto,
  AnalyticsApiResponse,
  PaginatedAnalyticsResponse,
} from '../dto';

/**
 * Query Execution Service
 * Handles query parsing, optimization, execution, caching, and monitoring
 */
@Injectable()
export class QueryExecutionService extends BaseAnalyticsService {
  private readonly queryCache = new Map<string, any>();
  private readonly executionCache = new Map<string, any>();
  private readonly optimizationCache = new Map<string, any>();
  private readonly activeExecutions = new Map<string, Promise<any>>();

  constructor(
    entityManager: EntityManager,
    @InjectRepository(AnalyticsQuery)
    private readonly queryRepository: Repository<AnalyticsQuery>,
    @InjectRepository(QueryExecution)
    private readonly executionRepository: Repository<QueryExecution>,
    @InjectRepository(AnalyticsDataSource)
    private readonly dataSourceRepository: Repository<AnalyticsDataSource>,
    private readonly dataSourceService: DataSourceService
  ) {
    super(entityManager);
  }

  /**
   * Create a new analytics query
   */
  async createQuery(
    createQueryDto: CreateAnalyticsQueryDto,
    userId: string
  ): Promise<AnalyticsApiResponse<AnalyticsQueryDto>> {
    try {
      this.logOperation('CREATE_QUERY', 'AnalyticsQuery');

      // Validate DTO
      const validatedDto = await this.validateDto(createQueryDto, CreateAnalyticsQueryDto);

      // Verify data source exists
      const dataSource = await this.dataSourceRepository.findOne({
        where: { id: validatedDto.dataSourceId },
      });

      if (!dataSource) {
        throw new NotFoundException(
          `Data source with ID ${validatedDto.dataSourceId} not found`
        );
      }

      // Parse and validate query
      const parsedQuery = await this.parseQuery(validatedDto.query, dataSource.type);
      if (!parsedQuery.isValid) {
        throw new BadRequestException(`Invalid query: ${parsedQuery.errors.join(', ')}`);
      }

      // Optimize query
      const optimizedQuery = await this.optimizeQuery(validatedDto.query, dataSource);

      // Create query entity
      const query = this.queryRepository.create({
        ...validatedDto,
        dataSource,
        createdBy: userId,
        originalQuery: validatedDto.query,
        optimizedQuery: optimizedQuery.query,
        metadata: {
          ...validatedDto.metadata,
          parsing: parsedQuery,
          optimization: optimizedQuery.metadata,
        },
        isActive: validatedDto.isActive ?? true,
        version: 1,
      });

      const savedQuery = await this.queryRepository.save(query);

      const queryDto = await this.mapQueryToDto(savedQuery);

      this.logOperation('CREATE_QUERY_SUCCESS', 'AnalyticsQuery', savedQuery.id);

      return this.createResponse(
        queryDto,
        'Analytics query created successfully',
        { optimization: optimizedQuery.metadata }
      );
    } catch (error) {
      this.handleError(error, 'CREATE_QUERY');
    }
  }

  /**
   * Execute a query
   */
  async executeQuery(
    queryId: string,
    executeQueryDto: ExecuteQueryDto,
    userId: string
  ): Promise<AnalyticsApiResponse<QueryExecutionResultDto>> {
    try {
      this.logOperation('EXECUTE_QUERY', 'QueryExecution', queryId);

      const query = await this.queryRepository.findOne({
        where: { id: queryId },
        relations: ['dataSource'],
      });

      if (!query) {
        throw new NotFoundException(`Query with ID ${queryId} not found`);
      }

      // Check if query is already executing
      if (this.activeExecutions.has(queryId)) {
        const executionResult = await this.activeExecutions.get(queryId);
        return this.createResponse(
          executionResult,
          'Query execution result (from active execution)'
        );
      }

      // Check cache first
      const cacheKey = this.generateQueryCacheKey(queryId, executeQueryDto);
      if (this.executionCache.has(cacheKey) && !executeQueryDto.refreshCache) {
        const cachedResult = this.executionCache.get(cacheKey);
        return this.createResponse(
          cachedResult,
          'Query execution result (cached)'
        );
      }

      // Create execution record
      const execution = this.executionRepository.create({
        query,
        executedBy: userId,
        status: ProcessingStatus.PROCESSING,
        parameters: executeQueryDto.parameters || {},
        startTime: new Date(),
        cacheKey,
      });

      const savedExecution = await this.executionRepository.save(execution);

      // Execute query asynchronously
      const executionPromise = this.performQueryExecution(savedExecution, executeQueryDto);
      this.activeExecutions.set(queryId, executionPromise);

      try {
        const result = await executionPromise;
        
        // Update execution record
        await this.updateExecutionRecord(savedExecution.id, ProcessingStatus.COMPLETED, result);

        // Cache result
        if (executeQueryDto.cacheDuration && executeQueryDto.cacheDuration > 0) {
          this.cacheExecutionResult(cacheKey, result, executeQueryDto.cacheDuration);
        }

        this.logOperation('EXECUTE_QUERY_SUCCESS', 'QueryExecution', savedExecution.id);

        return this.createResponse(
          result,
          'Query executed successfully'
        );
      } catch (error) {
        await this.updateExecutionRecord(savedExecution.id, ProcessingStatus.FAILED, null, error.message);
        throw error;
      } finally {
        this.activeExecutions.delete(queryId);
      }
    } catch (error) {
      this.handleError(error, 'EXECUTE_QUERY');
    }
  }

  /**
   * Get query by ID
   */
  async getQueryById(queryId: string): Promise<AnalyticsApiResponse<AnalyticsQueryDto>> {
    try {
      this.logOperation('GET_QUERY_BY_ID', 'AnalyticsQuery', queryId);

      const query = await this.queryRepository.findOne({
        where: { id: queryId },
        relations: ['dataSource'],
      });

      if (!query) {
        throw new NotFoundException(`Query with ID ${queryId} not found`);
      }

      const queryDto = await this.mapQueryToDto(query);

      return this.createResponse(
        queryDto,
        'Query retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_QUERY_BY_ID');
    }
  }

  /**
   * Get all queries with pagination
   */
  async getQueries(
    page: number = 1,
    limit: number = 10,
    filters: Record<string, any> = {}
  ): Promise<AnalyticsApiResponse<PaginatedAnalyticsResponse<AnalyticsQueryDto>>> {
    try {
      this.logOperation('GET_QUERIES', 'AnalyticsQuery');

      const queryBuilder = this.queryRepository
        .createQueryBuilder('query')
        .leftJoinAndSelect('query.dataSource', 'dataSource')
        .select();

      // Apply filters
      this.applyFilters(queryBuilder, filters, 'query');

      // Apply pagination
      this.applyPagination(queryBuilder, page, limit);

      // Apply sorting
      this.applySorting(queryBuilder, 'query.createdAt', 'DESC');

      const [queries, total] = await queryBuilder.getManyAndCount();

      const queryDtos = await Promise.all(
        queries.map((query) => this.mapQueryToDto(query))
      );

      const paginatedResponse = this.createPaginatedResponse(
        queryDtos,
        total,
        page,
        limit,
        filters
      );

      return this.createResponse(
        paginatedResponse,
        'Queries retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_QUERIES');
    }
  }

  /**
   * Update a query
   */
  async updateQuery(
    queryId: string,
    updateQueryDto: UpdateAnalyticsQueryDto,
    userId: string
  ): Promise<AnalyticsApiResponse<AnalyticsQueryDto>> {
    try {
      this.logOperation('UPDATE_QUERY', 'AnalyticsQuery', queryId);

      const query = await this.queryRepository.findOne({
        where: { id: queryId },
        relations: ['dataSource'],
      });

      if (!query) {
        throw new NotFoundException(`Query with ID ${queryId} not found`);
      }

      // Validate DTO
      const validatedDto = await this.validateDto(updateQueryDto, UpdateAnalyticsQueryDto);

      // If query text is being updated, reparse and optimize
      if (validatedDto.query && validatedDto.query !== query.originalQuery) {
        const parsedQuery = await this.parseQuery(validatedDto.query, query.dataSource.type);
        if (!parsedQuery.isValid) {
          throw new BadRequestException(`Invalid query: ${parsedQuery.errors.join(', ')}`);
        }

        const optimizedQuery = await this.optimizeQuery(validatedDto.query, query.dataSource);
        
        validatedDto.originalQuery = validatedDto.query;
        validatedDto.optimizedQuery = optimizedQuery.query;
        validatedDto.metadata = {
          ...validatedDto.metadata,
          parsing: parsedQuery,
          optimization: optimizedQuery.metadata,
        };
      }

      // Update query
      Object.assign(query, {
        ...validatedDto,
        version: query.version + 1,
        updatedAt: new Date(),
        lastModifiedBy: userId,
      });

      const updatedQuery = await this.queryRepository.save(query);

      // Clear cache for this query
      this.clearQueryCache(queryId);

      const queryDto = await this.mapQueryToDto(updatedQuery);

      this.logOperation('UPDATE_QUERY_SUCCESS', 'AnalyticsQuery', queryId);

      return this.createResponse(
        queryDto,
        'Query updated successfully'
      );
    } catch (error) {
      this.handleError(error, 'UPDATE_QUERY');
    }
  }

  /**
   * Delete a query
   */
  async deleteQuery(queryId: string): Promise<AnalyticsApiResponse<void>> {
    try {
      this.logOperation('DELETE_QUERY', 'AnalyticsQuery', queryId);

      const query = await this.queryRepository.findOne({
        where: { id: queryId },
      });

      if (!query) {
        throw new NotFoundException(`Query with ID ${queryId} not found`);
      }

      // Clear cache
      this.clearQueryCache(queryId);

      // Cancel any active executions
      if (this.activeExecutions.has(queryId)) {
        // In a real implementation, you would cancel the promise
        this.activeExecutions.delete(queryId);
      }

      // Soft delete
      await this.queryRepository.softRemove(query);

      this.logOperation('DELETE_QUERY_SUCCESS', 'AnalyticsQuery', queryId);

      return this.createResponse(
        undefined,
        'Query deleted successfully'
      );
    } catch (error) {
      this.handleError(error, 'DELETE_QUERY');
    }
  }

  /**
   * Get query execution history
   */
  async getQueryExecutionHistory(
    queryId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<AnalyticsApiResponse<PaginatedAnalyticsResponse<any>>> {
    try {
      this.logOperation('GET_QUERY_EXECUTION_HISTORY', 'QueryExecution');

      const queryBuilder = this.executionRepository
        .createQueryBuilder('execution')
        .leftJoinAndSelect('execution.query', 'query')
        .where('execution.queryId = :queryId', { queryId })
        .select();

      // Apply pagination
      this.applyPagination(queryBuilder, page, limit);

      // Apply sorting
      this.applySorting(queryBuilder, 'execution.startTime', 'DESC');

      const [executions, total] = await queryBuilder.getManyAndCount();

      const executionDtos = executions.map(execution => ({
        id: execution.id,
        status: execution.status,
        startTime: execution.startTime,
        endTime: execution.endTime,
        duration: execution.duration,
        rowsReturned: execution.rowsReturned,
        parameters: execution.parameters,
        error: execution.error,
        executedBy: execution.executedBy,
      }));

      const paginatedResponse = this.createPaginatedResponse(
        executionDtos,
        total,
        page,
        limit
      );

      return this.createResponse(
        paginatedResponse,
        'Query execution history retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_QUERY_EXECUTION_HISTORY');
    }
  }

  /**
   * Get query performance metrics
   */
  async getQueryPerformanceMetrics(queryId: string): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('GET_QUERY_PERFORMANCE_METRICS', 'QueryExecution');

      const executions = await this.executionRepository.find({
        where: { query: { id: queryId } },
        order: { startTime: 'DESC' },
        take: 100, // Last 100 executions
      });

      if (executions.length === 0) {
        return this.createResponse(
          { message: 'No execution history found for this query' },
          'No performance data available'
        );
      }

      const completedExecutions = executions.filter(e => e.status === ProcessingStatus.COMPLETED);
      const failedExecutions = executions.filter(e => e.status === ProcessingStatus.FAILED);

      const durations = completedExecutions
        .map(e => e.duration)
        .filter(d => d !== null && d !== undefined);

      const metrics = {
        totalExecutions: executions.length,
        completedExecutions: completedExecutions.length,
        failedExecutions: failedExecutions.length,
        successRate: executions.length > 0 ? (completedExecutions.length / executions.length) * 100 : 0,
        performance: durations.length > 0 ? {
          averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
          minDuration: Math.min(...durations),
          maxDuration: Math.max(...durations),
          medianDuration: this.calculateMedian(durations),
        } : null,
        recentTrend: this.calculatePerformanceTrend(completedExecutions.slice(0, 20)),
        frequentErrors: this.getFrequentErrors(failedExecutions),
        totalRowsReturned: completedExecutions.reduce((sum, e) => sum + (e.rowsReturned || 0), 0),
        avgRowsReturned: completedExecutions.length > 0 ?
          completedExecutions.reduce((sum, e) => sum + (e.rowsReturned || 0), 0) / completedExecutions.length : 0,
        lastExecuted: executions[0]?.startTime,
        optimizationSuggestions: await this.generateOptimizationSuggestions(queryId, metrics),
      };

      return this.createResponse(
        metrics,
        'Query performance metrics retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_QUERY_PERFORMANCE_METRICS');
    }
  }

  /**
   * Explain query execution plan
   */
  async explainQuery(queryId: string): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('EXPLAIN_QUERY', 'AnalyticsQuery', queryId);

      const query = await this.queryRepository.findOne({
        where: { id: queryId },
        relations: ['dataSource'],
      });

      if (!query) {
        throw new NotFoundException(`Query with ID ${queryId} not found`);
      }

      const executionPlan = await this.generateExecutionPlan(query);

      return this.createResponse(
        executionPlan,
        'Query execution plan generated successfully'
      );
    } catch (error) {
      this.handleError(error, 'EXPLAIN_QUERY');
    }
  }

  /**
   * Parse query and validate syntax
   */
  private async parseQuery(query: string, dataSourceType: any): Promise<any> {
    try {
      // This would implement actual query parsing based on data source type
      // For now, it's a mock implementation
      const tokens = query.toLowerCase().split(/\s+/);
      const isValid = tokens.includes('select') || tokens.includes('from') || query.trim().length > 0;
      
      return {
        isValid,
        errors: isValid ? [] : ['Query must contain valid SQL or query syntax'],
        tokens,
        estimatedComplexity: this.estimateQueryComplexity(query),
        tables: this.extractTables(query),
        columns: this.extractColumns(query),
        conditions: this.extractConditions(query),
        joins: this.extractJoins(query),
        aggregations: this.extractAggregations(query),
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [error.message],
        tokens: [],
        estimatedComplexity: 'unknown',
      };
    }
  }

  /**
   * Optimize query for better performance
   */
  private async optimizeQuery(query: string, dataSource: AnalyticsDataSource): Promise<any> {
    try {
      // Check cache for optimization
      const cacheKey = this.generateCacheKey('optimize', dataSource.id, query);
      if (this.optimizationCache.has(cacheKey)) {
        return this.optimizationCache.get(cacheKey);
      }

      // Mock query optimization
      let optimizedQuery = query;
      const optimizations = [];
      
      // Add LIMIT if not present for large result sets
      if (!query.toLowerCase().includes('limit') && !query.toLowerCase().includes('top')) {
        optimizedQuery += ' LIMIT 1000';
        optimizations.push('Added LIMIT clause to prevent large result sets');
      }

      // Suggest indexes for WHERE clauses
      const whereConditions = this.extractConditions(query);
      if (whereConditions.length > 0) {
        optimizations.push(`Consider indexes on: ${whereConditions.join(', ')}`);
      }

      const result = {
        query: optimizedQuery,
        metadata: {
          optimizations,
          originalLength: query.length,
          optimizedLength: optimizedQuery.length,
          estimatedPerformanceGain: Math.random() * 30 + 10, // Mock 10-40% gain
          recommendedIndexes: whereConditions,
        },
      };

      // Cache the optimization
      this.optimizationCache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      this.logger.error('Query optimization failed:', error);
      return {
        query,
        metadata: {
          optimizations: ['Optimization failed'],
          error: error.message,
        },
      };
    }
  }

  /**
   * Perform actual query execution
   */
  private async performQueryExecution(
    execution: QueryExecution,
    executeQueryDto: ExecuteQueryDto
  ): Promise<QueryExecutionResultDto> {
    const startTime = Date.now();
    
    try {
      // This would implement actual query execution based on data source type
      // For now, it's a mock implementation
      
      const queryToExecute = execution.query.optimizedQuery || execution.query.originalQuery;
      
      // Simulate query execution time
      const executionTime = Math.random() * 2000 + 500; // 500ms to 2.5s
      await new Promise(resolve => setTimeout(resolve, executionTime));
      
      // Generate mock result data
      const mockData = this.generateMockQueryResult(queryToExecute);
      
      const duration = Date.now() - startTime;
      
      return {
        executionId: execution.id,
        queryId: execution.query.id,
        status: ProcessingStatus.COMPLETED,
        data: mockData.data,
        columns: mockData.columns,
        totalRows: mockData.totalRows,
        returnedRows: mockData.returnedRows,
        duration,
        startTime: execution.startTime,
        endTime: new Date(),
        metadata: {
          dataSourceType: execution.query.dataSource.type,
          optimizationsApplied: execution.query.metadata?.optimization?.optimizations || [],
          cacheHit: false,
          executionPlan: mockData.executionPlan,
        },
        statistics: {
          rowsScanned: mockData.totalRows,
          rowsFiltered: mockData.totalRows - mockData.returnedRows,
          bytesProcessed: mockData.returnedRows * 100, // Mock bytes
          cpuTime: duration * 0.8,
          ioTime: duration * 0.2,
        },
      };
    } catch (error) {
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }

  /**
   * Generate mock query result data
   */
  private generateMockQueryResult(query: string): any {
    const columns = ['id', 'name', 'category', 'value', 'timestamp'];
    const totalRows = Math.floor(Math.random() * 10000) + 100;
    const returnedRows = Math.min(totalRows, 1000); // Assuming LIMIT was applied
    
    const data = [];
    for (let i = 0; i < returnedRows; i++) {
      data.push({
        id: i + 1,
        name: `Item ${i + 1}`,
        category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        value: Math.round(Math.random() * 1000 * 100) / 100,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    }

    return {
      data,
      columns: columns.map(col => ({
        name: col,
        type: col === 'id' ? 'integer' : col === 'value' ? 'decimal' : col === 'timestamp' ? 'datetime' : 'string',
      })),
      totalRows,
      returnedRows,
      executionPlan: {
        steps: [
          { step: 1, operation: 'TABLE_SCAN', table: 'main_table', cost: 100, rows: totalRows },
          { step: 2, operation: 'FILTER', condition: 'WHERE clause', cost: 50, rows: returnedRows },
          { step: 3, operation: 'PROJECTION', columns: columns.length, cost: 10, rows: returnedRows },
        ],
        totalCost: 160,
        estimatedTime: '1.2s',
      },
    };
  }

  /**
   * Update execution record with results
   */
  private async updateExecutionRecord(
    executionId: string,
    status: ProcessingStatus,
    result?: any,
    error?: string
  ): Promise<void> {
    try {
      const execution = await this.executionRepository.findOne({
        where: { id: executionId },
      });

      if (execution) {
        execution.status = status;
        execution.endTime = new Date();
        execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
        
        if (result) {
          execution.rowsReturned = result.returnedRows;
          execution.result = result;
        }
        
        if (error) {
          execution.error = error;
        }

        await this.executionRepository.save(execution);
      }
    } catch (updateError) {
      this.logger.error('Failed to update execution record:', updateError);
    }
  }

  /**
   * Generate cache key for query execution
   */
  private generateQueryCacheKey(queryId: string, executeQueryDto: ExecuteQueryDto): string {
    const params = JSON.stringify(executeQueryDto.parameters || {});
    return this.generateCacheKey('query_execution', queryId, params);
  }

  /**
   * Cache execution result
   */
  private cacheExecutionResult(cacheKey: string, result: any, durationSeconds: number): void {
    this.executionCache.set(cacheKey, result);
    
    // Set expiration
    setTimeout(() => {
      this.executionCache.delete(cacheKey);
    }, durationSeconds * 1000);
  }

  /**
   * Clear query-related cache
   */
  private clearQueryCache(queryId: string): void {
    const keysToDelete = [];
    for (const key of this.executionCache.keys()) {
      if (key.includes(queryId)) {
        keysToDelete.push(key);
      }
    }
    for (const key of keysToDelete) {
      this.executionCache.delete(key);
    }
  }

  /**
   * Estimate query complexity
   */
  private estimateQueryComplexity(query: string): string {
    const lowerQuery = query.toLowerCase();
    let complexity = 0;
    
    if (lowerQuery.includes('join')) complexity += 2;
    if (lowerQuery.includes('subquery') || lowerQuery.includes('exists')) complexity += 3;
    if (lowerQuery.includes('group by')) complexity += 1;
    if (lowerQuery.includes('order by')) complexity += 1;
    if ((lowerQuery.match(/select/g) || []).length > 1) complexity += 2;
    
    if (complexity <= 1) return 'low';
    if (complexity <= 3) return 'medium';
    return 'high';
  }

  /**
   * Extract table names from query
   */
  private extractTables(query: string): string[] {
    const fromMatch = query.match(/from\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi);
    const joinMatches = query.match(/join\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi);
    
    const tables = [];
    if (fromMatch) tables.push(...fromMatch.map(match => match.split(/\s+/)[1]));
    if (joinMatches) tables.push(...joinMatches.map(match => match.split(/\s+/)[1]));
    
    return [...new Set(tables)];
  }

  /**
   * Extract column names from query
   */
  private extractColumns(query: string): string[] {
    const selectMatch = query.match(/select\s+(.*?)\s+from/i);
    if (!selectMatch) return [];
    
    const columnsString = selectMatch[1];
    if (columnsString.trim() === '*') return ['*'];
    
    return columnsString.split(',').map(col => col.trim().split(/\s+/)[0]);
  }

  /**
   * Extract WHERE conditions from query
   */
  private extractConditions(query: string): string[] {
    const whereMatch = query.match(/where\s+(.*?)(?:\s+group\s+by|\s+order\s+by|\s+limit|$)/i);
    if (!whereMatch) return [];
    
    const conditions = whereMatch[1];
    return conditions.split(/\s+and\s+|\s+or\s+/i)
      .map(condition => condition.trim().split(/\s*[=<>!]+\s*/)[0].trim());
  }

  /**
   * Extract JOIN information from query
   */
  private extractJoins(query: string): string[] {
    const joinMatches = query.match(/(inner|left|right|full)?\s*join\s+[a-zA-Z_][a-zA-Z0-9_]*\s+on\s+.*?(?=\s+(?:inner|left|right|full)?\s*join|\s+where|\s+group\s+by|\s+order\s+by|$)/gi);
    return joinMatches || [];
  }

  /**
   * Extract aggregation functions from query
   */
  private extractAggregations(query: string): string[] {
    const aggMatches = query.match(/(count|sum|avg|min|max|stddev)\s*\(/gi);
    return aggMatches ? aggMatches.map(match => match.toLowerCase()) : [];
  }

  /**
   * Calculate median duration
   */
  private calculateMedian(durations: number[]): number {
    const sorted = durations.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  /**
   * Calculate performance trend
   */
  private calculatePerformanceTrend(executions: QueryExecution[]): string {
    if (executions.length < 2) return 'insufficient_data';
    
    const recentAvg = executions.slice(0, 5).reduce((sum, e) => sum + (e.duration || 0), 0) / 5;
    const olderAvg = executions.slice(-5).reduce((sum, e) => sum + (e.duration || 0), 0) / 5;
    
    if (recentAvg < olderAvg * 0.9) return 'improving';
    if (recentAvg > olderAvg * 1.1) return 'degrading';
    return 'stable';
  }

  /**
   * Get frequent errors from failed executions
   */
  private getFrequentErrors(failedExecutions: QueryExecution[]): Array<{ error: string; count: number }> {
    const errorCounts = new Map<string, number>();
    
    failedExecutions.forEach(execution => {
      if (execution.error) {
        const count = errorCounts.get(execution.error) || 0;
        errorCounts.set(execution.error, count + 1);
      }
    });
    
    return Array.from(errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Generate optimization suggestions
   */
  private async generateOptimizationSuggestions(queryId: string, metrics: any): Promise<string[]> {
    const suggestions = [];
    
    if (metrics.performance && metrics.performance.averageDuration > 5000) {
      suggestions.push('Query execution time is high. Consider adding appropriate indexes.');
    }
    
    if (metrics.successRate < 90) {
      suggestions.push('Query has a low success rate. Review error patterns and query logic.');
    }
    
    if (metrics.avgRowsReturned > 10000) {
      suggestions.push('Query returns a large number of rows. Consider adding pagination or more specific filters.');
    }
    
    if (metrics.recentTrend === 'degrading') {
      suggestions.push('Query performance is degrading over time. Review data growth and index effectiveness.');
    }
    
    return suggestions;
  }

  /**
   * Generate execution plan
   */
  private async generateExecutionPlan(query: AnalyticsQuery): Promise<any> {
    // Mock execution plan generation
    return {
      queryId: query.id,
      estimatedCost: Math.floor(Math.random() * 1000) + 100,
      estimatedRows: Math.floor(Math.random() * 10000) + 1000,
      estimatedTime: `${(Math.random() * 5 + 0.5).toFixed(1)}s`,
      operations: [
        {
          id: 1,
          operation: 'Seq Scan',
          table: 'main_table',
          cost: '0.00..100.00',
          rows: 1000,
          width: 32,
        },
        {
          id: 2,
          operation: 'Hash',
          table: null,
          cost: '22.50..22.50',
          rows: 1000,
          width: 32,
        },
        {
          id: 3,
          operation: 'Hash Join',
          table: null,
          cost: '47.75..72.25',
          rows: 500,
          width: 64,
        },
      ],
      optimizations: query.metadata?.optimization?.optimizations || [],
      warnings: [],
      recommendations: [
        'Consider creating an index on frequently filtered columns',
        'Review JOIN order for optimal performance',
      ],
    };
  }

  /**
   * Map query entity to DTO
   */
  private async mapQueryToDto(query: AnalyticsQuery): Promise<AnalyticsQueryDto> {
    return {
      id: query.id,
      name: query.name,
      description: query.description,
      type: query.type,
      dataSourceId: query.dataSource.id,
      dataSource: {
        id: query.dataSource.id,
        name: query.dataSource.name,
        type: query.dataSource.type,
      },
      query: query.originalQuery,
      optimizedQuery: query.optimizedQuery,
      parameters: query.parameters,
      metadata: query.metadata,
      isActive: query.isActive,
      version: query.version,
      createdBy: query.createdBy,
      createdAt: query.createdAt,
      updatedAt: query.updatedAt,
      lastModifiedBy: query.lastModifiedBy,
    };
  }
}
