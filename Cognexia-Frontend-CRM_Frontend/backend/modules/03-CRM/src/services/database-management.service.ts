import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DatabaseQuery } from '../entities/database-query.entity';
import { ExecuteQueryDto } from '../dto/database-management.dto';

@Injectable()
export class DatabaseManagementService {
  constructor(
    @InjectRepository(DatabaseQuery)
    private queryLogRepository: Repository<DatabaseQuery>,
    private dataSource: DataSource,
  ) {}

  async executeQuery(dto: ExecuteQueryDto, userId: string): Promise<any> {
    const startTime = Date.now();
    const queryType = this.determineQueryType(dto.query_text);
    
    // Security check - block dangerous operations
    if (this.isDangerousQuery(dto.query_text) && !dto.requires_approval) {
      throw new Error('This query requires approval');
    }

    let results: any;
    let success = true;
    let errorMessage: string | undefined;
    let rowsAffected: number | undefined;

    try {
      results = await this.dataSource.query(dto.query_text);
      rowsAffected = Array.isArray(results) ? results.length : 1;
    } catch (error) {
      success = false;
      errorMessage = error.message;
    }

    const executionTime = Date.now() - startTime;

    // Log the query
    const log = this.queryLogRepository.create({
      executed_by: userId,
      query_type: queryType as any,
      query_text: dto.query_text,
      affected_tables: this.extractTables(dto.query_text),
      rows_affected: rowsAffected,
      execution_time_ms: executionTime,
      status: success ? 'success' : 'failed',
      error_message: errorMessage,
      executed_at: new Date(),
    });

    await this.queryLogRepository.save(log);

    return {
      results,
      execution_time_ms: executionTime,
      rows_affected: rowsAffected,
      success,
      error: errorMessage,
    };
  }

  async getQueryHistory(userId?: string): Promise<DatabaseQuery[]> {
    const query = this.queryLogRepository.createQueryBuilder('dq');
    
    if (userId) {
      query.where('dq.executed_by = :userId', { userId });
    }
    
    return await query.orderBy('dq.executed_at', 'DESC').limit(100).getMany();
  }

  async validateQuery(queryText: string): Promise<{ valid: boolean; message: string }> {
    if (this.isDangerousQuery(queryText)) {
      return { valid: false, message: 'Query contains potentially dangerous operations' };
    }

    try {
      await this.dataSource.query(`EXPLAIN ${queryText}`);
      return { valid: true, message: 'Query is valid' };
    } catch (error) {
      return { valid: false, message: error.message };
    }
  }

  async getTableSchema(tableName: string): Promise<any> {
    const columns = await this.dataSource.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);

    return { table_name: tableName, columns };
  }

  private determineQueryType(query: string): string {
    const upper = query.trim().toUpperCase();
    if (upper.startsWith('SELECT')) return 'select';
    if (upper.startsWith('INSERT')) return 'insert';
    if (upper.startsWith('UPDATE')) return 'update';
    if (upper.startsWith('DELETE')) return 'delete';
    return 'other';
  }

  private isDangerousQuery(query: string): boolean {
    const dangerous = ['DROP', 'TRUNCATE', 'ALTER TABLE', 'GRANT', 'REVOKE'];
    const upper = query.toUpperCase();
    return dangerous.some(keyword => upper.includes(keyword));
  }

  private extractTables(query: string): string[] {
    // Simplified table extraction
    const matches = query.match(/FROM\s+(\w+)|JOIN\s+(\w+)|UPDATE\s+(\w+)|INTO\s+(\w+)/gi);
    if (!matches) return [];
    
    return [...new Set(matches.map(m => m.split(/\s+/).pop()).filter(Boolean))];
  }
}
