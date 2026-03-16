import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, SelectQueryBuilder } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { 
  AnalyticsApiResponse, 
  PaginatedAnalyticsResponse, 
  PaginationMetadata 
} from '../dto';
import { ProcessingStatus, DataQuality } from '../entities';

/**
 * Base Analytics Service
 * Provides common functionality for all analytics services
 */
@Injectable()
export abstract class BaseAnalyticsService {
  protected readonly logger = new Logger(this.constructor.name);
  
  constructor(protected readonly entityManager: EntityManager) {}

  /**
   * Create a standardized API response
   */
  protected createResponse<T>(
    data: T,
    message?: string,
    metadata?: any
  ): AnalyticsApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date(),
      metadata: {
        processingTime: this.getProcessingTime(),
        version: '1.0.0',
        requestId: this.generateRequestId(),
        ...metadata,
      },
    };
  }

  /**
   * Create an error response
   */
  protected createErrorResponse(
    message: string,
    errors?: Array<{ field?: string; message: string; code?: string }>
  ): AnalyticsApiResponse<null> {
    return {
      success: false,
      data: null,
      message,
      timestamp: new Date(),
      errors,
    };
  }

  /**
   * Create a paginated response
   */
  protected createPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    filters?: Record<string, any>,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC'
  ): PaginatedAnalyticsResponse<T> {
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      filters,
      sortBy,
      sortOrder,
      metadata: {
        processingTime: this.getProcessingTime(),
        requestId: this.generateRequestId(),
      },
    };
  }

  /**
   * Validate DTO with detailed error messages
   */
  protected async validateDto<T extends object>(
    dto: any,
    dtoClass: new () => T
  ): Promise<T> {
    const transformedDto = plainToClass(dtoClass, dto);
    const errors = await validate(transformedDto);

    if (errors.length > 0) {
      const errorMessages = this.formatValidationErrors(errors);
      this.logger.error('Validation failed', errorMessages);
      throw new BadRequestException({
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    return transformedDto;
  }

  /**
   * Format validation errors into readable format
   */
  private formatValidationErrors(errors: ValidationError[]): Array<{
    field: string;
    message: string;
    code: string;
  }> {
    const formattedErrors: Array<{
      field: string;
      message: string;
      code: string;
    }> = [];

    errors.forEach((error) => {
      if (error.constraints) {
        Object.entries(error.constraints).forEach(([code, message]) => {
          formattedErrors.push({
            field: error.property,
            message,
            code,
          });
        });
      }

      if (error.children && error.children.length > 0) {
        const childErrors = this.formatValidationErrors(error.children);
        formattedErrors.push(...childErrors.map(e => ({
          ...e,
          field: `${error.property}.${e.field}`,
        })));
      }
    });

    return formattedErrors;
  }

  /**
   * Execute database operation with transaction support
   */
  protected async executeWithTransaction<T>(
    operation: (entityManager: EntityManager) => Promise<T>
  ): Promise<T> {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await operation(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Transaction failed', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Apply pagination to query builder
   */
  protected applyPagination<T>(
    queryBuilder: SelectQueryBuilder<T>,
    page: number = 1,
    limit: number = 10
  ): SelectQueryBuilder<T> {
    const offset = (page - 1) * limit;
    return queryBuilder.skip(offset).take(limit);
  }

  /**
   * Apply sorting to query builder
   */
  protected applySorting<T>(
    queryBuilder: SelectQueryBuilder<T>,
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' = 'ASC'
  ): SelectQueryBuilder<T> {
    if (sortBy) {
      queryBuilder.orderBy(sortBy, sortOrder);
    }
    return queryBuilder;
  }

  /**
   * Apply filters to query builder
   */
  protected applyFilters<T>(
    queryBuilder: SelectQueryBuilder<T>,
    filters: Record<string, any> = {},
    alias: string = 'entity'
  ): SelectQueryBuilder<T> {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string') {
          queryBuilder.andWhere(`${alias}.${key} ILIKE :${key}`, {
            [key]: `%${value}%`,
          });
        } else if (Array.isArray(value)) {
          queryBuilder.andWhere(`${alias}.${key} IN (:...${key})`, {
            [key]: value,
          });
        } else {
          queryBuilder.andWhere(`${alias}.${key} = :${key}`, {
            [key]: value,
          });
        }
      }
    });
    return queryBuilder;
  }

  /**
   * Handle errors with logging and standardized response
   */
  protected handleError(
    error: any,
    context: string,
    customMessage?: string
  ): never {
    this.logger.error(`Error in ${context}:`, error);
    
    if (error instanceof BadRequestException) {
      throw error;
    }
    
    const message = customMessage || `Failed to ${context.toLowerCase()}`;
    throw new InternalServerErrorException(message);
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get processing time (placeholder - should be implemented with actual timing)
   */
  private getProcessingTime(): number {
    // This would be implemented with actual request timing
    return Math.round(Math.random() * 100);
  }

  /**
   * Log analytics operation
   */
  protected logOperation(
    operation: string,
    entityType: string,
    entityId?: string,
    metadata?: Record<string, any>
  ): void {
    this.logger.log(`Analytics Operation: ${operation}`, {
      operation,
      entityType,
      entityId,
      timestamp: new Date().toISOString(),
      metadata,
    });
  }

  /**
   * Validate business rules
   */
  protected validateBusinessRules(rules: Array<() => boolean | Promise<boolean>>): Promise<void> {
    return Promise.all(
      rules.map(async (rule, index) => {
        const result = await rule();
        if (!result) {
          throw new BadRequestException(`Business rule validation failed at index ${index}`);
        }
      })
    ).then(() => void 0);
  }

  /**
   * Sanitize data for security
   */
  protected sanitizeData<T extends Record<string, any>>(data: T): T {
    const sanitized = { ...data };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'secret', 'key', 'token'];
    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        delete sanitized[field];
      }
    });

    // Sanitize string values
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitized[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .trim();
      }
    });

    return sanitized;
  }

  /**
   * Cache key generator
   */
  protected generateCacheKey(prefix: string, ...params: (string | number)[]): string {
    return `analytics:${prefix}:${params.join(':')}`;
  }

  /**
   * Data quality assessment
   */
  protected assessDataQuality(data: any[]): DataQuality {
    if (!data || data.length === 0) {
      return DataQuality.POOR;
    }

    const totalRecords = data.length;
    let qualityScore = 0;

    // Check for null/undefined values
    const nullCount = data.reduce((count, record) => {
      const nullFields = Object.values(record).filter(value => value === null || value === undefined).length;
      return count + nullFields;
    }, 0);

    const totalFields = data.length > 0 ? Object.keys(data[0]).length * totalRecords : 0;
    const completenessRatio = totalFields > 0 ? (totalFields - nullCount) / totalFields : 0;
    qualityScore += completenessRatio * 40; // 40% weight for completeness

    // Check for duplicates
    const uniqueRecords = new Set(data.map(record => JSON.stringify(record))).size;
    const uniquenessRatio = uniqueRecords / totalRecords;
    qualityScore += uniquenessRatio * 30; // 30% weight for uniqueness

    // Check for consistency (basic validation)
    let consistentRecords = 0;
    data.forEach(record => {
      let isConsistent = true;
      Object.entries(record).forEach(([key, value]) => {
        if (key.toLowerCase().includes('email') && typeof value === 'string' && value.includes('@')) {
          // Basic email validation
        } else if (key.toLowerCase().includes('date') && value && !isNaN(Date.parse(value))) {
          // Basic date validation
        } else if (typeof value === 'number' && isNaN(value)) {
          isConsistent = false;
        }
      });
      if (isConsistent) consistentRecords++;
    });

    const consistencyRatio = consistentRecords / totalRecords;
    qualityScore += consistencyRatio * 30; // 30% weight for consistency

    // Determine quality level
    if (qualityScore >= 80) return DataQuality.HIGH;
    if (qualityScore >= 60) return DataQuality.MEDIUM;
    if (qualityScore >= 40) return DataQuality.LOW;
    return DataQuality.POOR;
  }

  /**
   * Processing status tracker
   */
  protected async updateProcessingStatus(
    entityId: string,
    status: ProcessingStatus,
    message?: string,
    progress?: number
  ): Promise<void> {
    this.logger.log(`Processing Status Update: ${entityId} - ${status}`, {
      entityId,
      status,
      message,
      progress,
      timestamp: new Date().toISOString(),
    });

    // This would typically update a status tracking entity
    // Implementation would depend on specific entity structure
  }

  /**
   * Performance monitoring
   */
  protected async measurePerformance<T>(
    operation: string,
    asyncFunction: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const startTime = Date.now();
    
    try {
      const result = await asyncFunction();
      const duration = Date.now() - startTime;
      
      this.logger.log(`Performance: ${operation} completed in ${duration}ms`);
      
      return { result, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Performance: ${operation} failed after ${duration}ms`, error);
      throw error;
    }
  }

  /**
   * Batch processing helper
   */
  protected async processBatch<T, R>(
    items: T[],
    batchSize: number,
    processor: (batch: T[]) => Promise<R[]>,
    onProgress?: (processed: number, total: number) => void
  ): Promise<R[]> {
    const results: R[] = [];
    const total = items.length;
    let processed = 0;

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await processor(batch);
      results.push(...batchResults);
      
      processed += batch.length;
      if (onProgress) {
        onProgress(processed, total);
      }
      
      this.logger.log(`Batch processing: ${processed}/${total} items processed`);
    }

    return results;
  }
}
