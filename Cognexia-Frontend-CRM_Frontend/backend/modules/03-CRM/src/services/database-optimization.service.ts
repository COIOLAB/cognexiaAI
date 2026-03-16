import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityTarget } from 'typeorm';

/**
 * Database Optimization Service
 * 
 * Provides tools for:
 * - Query performance analysis
 * - Index recommendations
 * - Connection pool monitoring
 * - Slow query detection
 */

export interface QueryAnalysis {
  query: string;
  executionTime: number;
  plan: any;
  recommendations: string[];
}

export interface IndexRecommendation {
  table: string;
  columns: string[];
  reason: string;
  estimatedImprovement: string;
}

export interface ConnectionPoolStats {
  active: number;
  idle: number;
  waiting: number;
  max: number;
}

@Injectable()
export class DatabaseOptimizationService {
  private readonly logger = new Logger(DatabaseOptimizationService.name);
  private slowQueryThreshold = 1000; // 1 second
  private slowQueries: Map<string, QueryAnalysis[]> = new Map();

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Analyze query performance using EXPLAIN
   */
  async analyzeQuery(query: string, parameters?: any[]): Promise<QueryAnalysis> {
    const startTime = Date.now();
    
    try {
      // Execute EXPLAIN query
      const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`;
      const result = await this.dataSource.query(explainQuery, parameters);
      
      const executionTime = Date.now() - startTime;
      const plan = result[0]?.['QUERY PLAN'] || result[0];
      
      const recommendations = this.generateRecommendations(plan, query);
      
      return {
        query,
        executionTime,
        plan,
        recommendations,
      };
    } catch (error) {
      this.logger.error(`Failed to analyze query: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate recommendations based on query plan
   */
  private generateRecommendations(plan: any, query: string): string[] {
    const recommendations: string[] = [];
    
    if (!plan) return recommendations;
    
    const planStr = JSON.stringify(plan).toLowerCase();
    
    // Check for sequential scans
    if (planStr.includes('seq scan')) {
      recommendations.push('Sequential scan detected - consider adding an index');
    }
    
    // Check for high cost
    if (plan['Total Cost'] && plan['Total Cost'] > 10000) {
      recommendations.push('High query cost detected - review query structure');
    }
    
    // Check for sort operations
    if (planStr.includes('sort')) {
      recommendations.push('Sort operation detected - consider adding index for ORDER BY columns');
    }
    
    // Check for nested loops with many rows
    if (planStr.includes('nested loop') && plan['Actual Rows'] > 1000) {
      recommendations.push('Large nested loop detected - consider using hash join or optimizing join conditions');
    }
    
    // Check for missing indexes on WHERE conditions
    if (query.toLowerCase().includes('where') && planStr.includes('seq scan')) {
      recommendations.push('WHERE clause without index - add index on filter columns');
    }
    
    return recommendations;
  }

  /**
   * Track slow query
   */
  trackSlowQuery(query: string, executionTime: number, context?: string): void {
    if (executionTime < this.slowQueryThreshold) return;
    
    const key = context || 'general';
    
    if (!this.slowQueries.has(key)) {
      this.slowQueries.set(key, []);
    }
    
    const queries = this.slowQueries.get(key);
    queries.push({
      query,
      executionTime,
      plan: null,
      recommendations: [],
    });
    
    // Keep only last 100 slow queries per context
    if (queries.length > 100) {
      queries.shift();
    }
    
    this.logger.warn(`Slow query detected (${executionTime}ms): ${query.substring(0, 100)}...`);
  }

  /**
   * Get slow queries report
   */
  getSlowQueriesReport(context?: string): QueryAnalysis[] {
    if (context) {
      return this.slowQueries.get(context) || [];
    }
    
    // Return all slow queries
    const allQueries: QueryAnalysis[] = [];
    this.slowQueries.forEach(queries => {
      allQueries.push(...queries);
    });
    
    // Sort by execution time descending
    return allQueries.sort((a, b) => b.executionTime - a.executionTime);
  }

  /**
   * Generate index recommendations for entity
   */
  async getIndexRecommendations(entityName: string): Promise<IndexRecommendation[]> {
    const recommendations: IndexRecommendation[] = [];
    
    try {
      const metadata = this.dataSource.getMetadata(entityName);
      const tableName = metadata.tableName;
      
      // Get existing indexes
      const indexes = await this.dataSource.query(`
        SELECT 
          indexname,
          indexdef
        FROM pg_indexes
        WHERE tablename = $1
      `, [tableName]);
      
      const existingIndexColumns = new Set(
        indexes.map(idx => idx.indexdef.match(/\((.*?)\)/)?.[1]).filter(Boolean)
      );
      
      // Check foreign key columns
      metadata.foreignKeys.forEach(fk => {
        const columns = fk.columnNames.join(', ');
        if (!existingIndexColumns.has(columns)) {
          recommendations.push({
            table: tableName,
            columns: fk.columnNames,
            reason: 'Foreign key without index',
            estimatedImprovement: 'High - speeds up joins and cascading operations',
          });
        }
      });
      
      // Check frequently filtered columns (from entity decorators)
      metadata.columns.forEach(column => {
        // Check if column might benefit from index
        const columnName = column.databaseName;
        
        // Skip if already indexed
        if (existingIndexColumns.has(columnName)) return;
        
        // Recommend index for commonly filtered types
        if (column.type === 'uuid' || column.type === 'varchar') {
          if (columnName.includes('status') || columnName.includes('type')) {
            recommendations.push({
              table: tableName,
              columns: [columnName],
              reason: 'Common filter column (status/type)',
              estimatedImprovement: 'Medium - speeds up WHERE clauses',
            });
          }
        }
        
        // Date columns often used in ranges
        if (column.type === 'timestamp' || column.type === 'date') {
          if (columnName.includes('created') || columnName.includes('updated')) {
            recommendations.push({
              table: tableName,
              columns: [columnName],
              reason: 'Date range queries',
              estimatedImprovement: 'Medium - speeds up date-based filtering and sorting',
            });
          }
        }
      });
      
    } catch (error) {
      this.logger.error(`Failed to generate index recommendations: ${error.message}`);
    }
    
    return recommendations;
  }

  /**
   * Get connection pool statistics
   */
  getConnectionPoolStats(): ConnectionPoolStats {
    const driver = this.dataSource.driver as any;
    
    // PostgreSQL connection pool stats
    if (driver.master && driver.master.pool) {
      const pool = driver.master.pool;
      return {
        active: pool.totalCount - pool.idleCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount || 0,
        max: pool.options.max || 10,
      };
    }
    
    return {
      active: 0,
      idle: 0,
      waiting: 0,
      max: 10,
    };
  }

  /**
   * Create missing indexes for entity
   */
  async createRecommendedIndexes(entityName: string, dryRun: boolean = true): Promise<string[]> {
    const recommendations = await this.getIndexRecommendations(entityName);
    const queries: string[] = [];
    
    for (const rec of recommendations) {
      const indexName = `idx_${rec.table}_${rec.columns.join('_')}`;
      const createIndexQuery = `
        CREATE INDEX CONCURRENTLY IF NOT EXISTS ${indexName}
        ON ${rec.table} (${rec.columns.join(', ')})
      `;
      
      queries.push(createIndexQuery);
      
      if (!dryRun) {
        try {
          await this.dataSource.query(createIndexQuery);
          this.logger.log(`Created index: ${indexName}`);
        } catch (error) {
          this.logger.error(`Failed to create index ${indexName}: ${error.message}`);
        }
      }
    }
    
    return queries;
  }

  /**
   * Analyze table statistics
   */
  async analyzeTable(tableName: string): Promise<void> {
    try {
      await this.dataSource.query(`ANALYZE ${tableName}`);
      this.logger.log(`Analyzed table: ${tableName}`);
    } catch (error) {
      this.logger.error(`Failed to analyze table ${tableName}: ${error.message}`);
    }
  }

  /**
   * Get table size information
   */
  async getTableSizes(): Promise<Array<{ table: string; size: string; rows: number }>> {
    try {
      const result = await this.dataSource.query(`
        SELECT
          schemaname || '.' || relname AS table,
          pg_size_pretty(pg_total_relation_size(schemaname || '.' || relname)) AS size,
          n_live_tup AS rows
        FROM pg_stat_user_tables
        ORDER BY pg_total_relation_size(schemaname || '.' || relname) DESC
        LIMIT 20
      `);
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to get table sizes: ${error.message}`);
      return [];
    }
  }

  /**
   * Vacuum analyze all tables (maintenance)
   */
  async vacuumAnalyze(): Promise<void> {
    try {
      await this.dataSource.query('VACUUM ANALYZE');
      this.logger.log('Completed VACUUM ANALYZE');
    } catch (error) {
      this.logger.error(`Failed to VACUUM ANALYZE: ${error.message}`);
    }
  }

  /**
   * Get database performance metrics
   */
  async getPerformanceMetrics(): Promise<{
    connectionPool: ConnectionPoolStats;
    slowQueries: number;
    tableSizes: Array<{ table: string; size: string; rows: number }>;
  }> {
    return {
      connectionPool: this.getConnectionPoolStats(),
      slowQueries: this.getSlowQueriesReport().length,
      tableSizes: await this.getTableSizes(),
    };
  }

  /**
   * Set slow query threshold (milliseconds)
   */
  setSlowQueryThreshold(milliseconds: number): void {
    this.slowQueryThreshold = milliseconds;
    this.logger.log(`Slow query threshold set to ${milliseconds}ms`);
  }

  /**
   * Clear slow query cache
   */
  clearSlowQueryCache(): void {
    this.slowQueries.clear();
    this.logger.log('Slow query cache cleared');
  }
}
