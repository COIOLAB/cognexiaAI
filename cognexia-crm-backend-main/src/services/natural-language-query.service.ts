import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NaturalLanguageQuery } from '../entities/natural-language-query.entity';
import { NaturalLanguageQueryDto } from '../dto/database-management.dto';

@Injectable()
export class NaturalLanguageQueryService {
  constructor(
    @InjectRepository(NaturalLanguageQuery)
    private queryRepository: Repository<NaturalLanguageQuery>,
    private dataSource: DataSource,
  ) {}

  async executeQuery(dto: NaturalLanguageQueryDto, userId: string): Promise<NaturalLanguageQuery> {
    const startTime = Date.now();
    
    // Translate natural language to SQL (simplified for demo)
    const sql = this.translateToSQL(dto.query_text);
    const interpretation = this.interpretQuery(dto.query_text);

    let results: any;
    let success = true;
    let errorMessage: string | undefined;
    let resultCount = 0;

    try {
      // Execute the generated SQL
      results = await this.dataSource.query(sql);
      resultCount = Array.isArray(results) ? results.length : 1;
    } catch (error) {
      success = false;
      errorMessage = error.message;
      results = null;
    }

    const executionTime = Date.now() - startTime;

    const query = this.queryRepository.create({
      user_id: userId,
      query_text: dto.query_text,
      generated_sql: sql,
      query_interpretation: interpretation,
      results,
      result_count: resultCount,
      execution_time_ms: executionTime,
      success,
      error_message: errorMessage,
      query_type: (dto.query_type || 'query') as any,
    });

    const saved = await this.queryRepository.save(query);
    return saved;
  }

  async getQueryHistory(userId: string): Promise<NaturalLanguageQuery[]> {
    return await this.queryRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: 50,
    });
  }

  async getSuggestedQueries(): Promise<string[]> {
    return [
      'Show me organizations with declining usage',
      'List all users who haven\'t logged in for 30 days',
      'What is the total revenue by tier this month?',
      'Show me the top 10 most active organizations',
      'List all failed payments in the last week',
    ];
  }

  private translateToSQL(naturalQuery: string): string {
    // Simplified NLP to SQL translation
    const lower = naturalQuery.toLowerCase();
    
    if (lower.includes('organizations') && lower.includes('declining')) {
      return 'SELECT * FROM organizations WHERE status = \'active\' ORDER BY last_activity_at ASC LIMIT 10';
    }
    
    if (lower.includes('users') && lower.includes('logged in')) {
      return 'SELECT * FROM users WHERE last_login_at < NOW() - INTERVAL \'30 days\' LIMIT 10';
    }
    
    if (lower.includes('revenue') && lower.includes('tier')) {
      return 'SELECT tier, SUM(mrr) as total_revenue FROM organizations GROUP BY tier';
    }
    
    // Default safe query
    return 'SELECT COUNT(*) as total FROM organizations';
  }

  private interpretQuery(naturalQuery: string): string {
    return `Interpreting: "${naturalQuery}" - Generated SQL query to retrieve requested data`;
  }
}
