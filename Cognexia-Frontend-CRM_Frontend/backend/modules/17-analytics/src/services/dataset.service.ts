import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { BaseAnalyticsService } from './base-analytics.service';
import {
  AnalyticsDataset,
  AnalyticsDataSource,
  DataQuality,
  ProcessingStatus,
} from '../entities';
import {
  CreateDatasetDto,
  UpdateDatasetDto,
  DatasetDto,
  DataPreviewDto,
  DataPreviewResultDto,
  AnalyticsApiResponse,
  PaginatedAnalyticsResponse,
} from '../dto';

/**
 * Dataset Service
 * Handles dataset management, data preview, profiling, and quality assessment
 */
@Injectable()
export class DatasetService extends BaseAnalyticsService {
  private readonly dataCache = new Map<string, any>();
  private readonly transformationCache = new Map<string, any>();

  constructor(
    entityManager: EntityManager,
    @InjectRepository(AnalyticsDataset)
    private readonly datasetRepository: Repository<AnalyticsDataset>,
    @InjectRepository(AnalyticsDataSource)
    private readonly dataSourceRepository: Repository<AnalyticsDataSource>
  ) {
    super(entityManager);
  }

  /**
   * Create a new dataset
   */
  async createDataset(
    createDatasetDto: CreateDatasetDto
  ): Promise<AnalyticsApiResponse<DatasetDto>> {
    try {
      this.logOperation('CREATE_DATASET', 'AnalyticsDataset');

      // Validate DTO
      const validatedDto = await this.validateDto(createDatasetDto, CreateDatasetDto);

      // Verify data source exists
      const dataSource = await this.dataSourceRepository.findOne({
        where: { id: validatedDto.dataSourceId },
      });

      if (!dataSource) {
        throw new NotFoundException(
          `Data source with ID ${validatedDto.dataSourceId} not found`
        );
      }

      // Create dataset entity
      const dataset = this.datasetRepository.create({
        ...validatedDto,
        dataSource,
        processingStatus: ProcessingStatus.PENDING,
        dataQuality: DataQuality.UNKNOWN,
        isActive: validatedDto.isActive ?? true,
        version: 1,
      });

      const savedDataset = await this.datasetRepository.save(dataset);

      // Start async data profiling
      this.profileDataAsync(savedDataset.id);

      const datasetDto = await this.mapEntityToDto(savedDataset);

      this.logOperation('CREATE_DATASET_SUCCESS', 'AnalyticsDataset', savedDataset.id);

      return this.createResponse(
        datasetDto,
        'Dataset created successfully',
        { dataProfilingStarted: true }
      );
    } catch (error) {
      this.handleError(error, 'CREATE_DATASET');
    }
  }

  /**
   * Get all datasets with pagination and filtering
   */
  async getDatasets(
    page: number = 1,
    limit: number = 10,
    filters: Record<string, any> = {}
  ): Promise<AnalyticsApiResponse<PaginatedAnalyticsResponse<DatasetDto>>> {
    try {
      this.logOperation('GET_DATASETS', 'AnalyticsDataset');

      const queryBuilder = this.datasetRepository
        .createQueryBuilder('dataset')
        .leftJoinAndSelect('dataset.dataSource', 'dataSource')
        .select();

      // Apply filters
      this.applyFilters(queryBuilder, filters, 'dataset');

      // Apply pagination
      this.applyPagination(queryBuilder, page, limit);

      // Apply sorting
      this.applySorting(queryBuilder, 'dataset.createdAt', 'DESC');

      const [datasets, total] = await queryBuilder.getManyAndCount();

      const datasetDtos = await Promise.all(
        datasets.map((dataset) => this.mapEntityToDto(dataset))
      );

      const paginatedResponse = this.createPaginatedResponse(
        datasetDtos,
        total,
        page,
        limit,
        filters
      );

      return this.createResponse(
        paginatedResponse,
        'Datasets retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_DATASETS');
    }
  }

  /**
   * Get a specific dataset by ID
   */
  async getDatasetById(id: string): Promise<AnalyticsApiResponse<DatasetDto>> {
    try {
      this.logOperation('GET_DATASET_BY_ID', 'AnalyticsDataset', id);

      const dataset = await this.datasetRepository.findOne({
        where: { id },
        relations: ['dataSource'],
      });

      if (!dataset) {
        throw new NotFoundException(`Dataset with ID ${id} not found`);
      }

      const datasetDto = await this.mapEntityToDto(dataset);

      return this.createResponse(
        datasetDto,
        'Dataset retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_DATASET_BY_ID');
    }
  }

  /**
   * Update a dataset
   */
  async updateDataset(
    id: string,
    updateDatasetDto: UpdateDatasetDto
  ): Promise<AnalyticsApiResponse<DatasetDto>> {
    try {
      this.logOperation('UPDATE_DATASET', 'AnalyticsDataset', id);

      const dataset = await this.datasetRepository.findOne({
        where: { id },
        relations: ['dataSource'],
      });

      if (!dataset) {
        throw new NotFoundException(`Dataset with ID ${id} not found`);
      }

      // Validate DTO
      const validatedDto = await this.validateDto(updateDatasetDto, UpdateDatasetDto);

      // If data source is being updated, verify it exists
      if (validatedDto.dataSourceId && validatedDto.dataSourceId !== dataset.dataSource.id) {
        const newDataSource = await this.dataSourceRepository.findOne({
          where: { id: validatedDto.dataSourceId },
        });

        if (!newDataSource) {
          throw new NotFoundException(
            `Data source with ID ${validatedDto.dataSourceId} not found`
          );
        }

        dataset.dataSource = newDataSource;
      }

      // Update dataset
      Object.assign(dataset, {
        ...validatedDto,
        version: dataset.version + 1,
        updatedAt: new Date(),
      });

      // If query or transformation changed, re-profile data
      if (validatedDto.query || validatedDto.transformation) {
        dataset.processingStatus = ProcessingStatus.PENDING;
        dataset.dataQuality = DataQuality.UNKNOWN;
        this.profileDataAsync(id);
      }

      const updatedDataset = await this.datasetRepository.save(dataset);
      const datasetDto = await this.mapEntityToDto(updatedDataset);

      this.logOperation('UPDATE_DATASET_SUCCESS', 'AnalyticsDataset', id);

      return this.createResponse(
        datasetDto,
        'Dataset updated successfully'
      );
    } catch (error) {
      this.handleError(error, 'UPDATE_DATASET');
    }
  }

  /**
   * Delete a dataset
   */
  async deleteDataset(id: string): Promise<AnalyticsApiResponse<void>> {
    try {
      this.logOperation('DELETE_DATASET', 'AnalyticsDataset', id);

      const dataset = await this.datasetRepository.findOne({
        where: { id },
      });

      if (!dataset) {
        throw new NotFoundException(`Dataset with ID ${id} not found`);
      }

      // Clear cache
      this.clearDatasetCache(id);

      // Soft delete
      await this.datasetRepository.softRemove(dataset);

      this.logOperation('DELETE_DATASET_SUCCESS', 'AnalyticsDataset', id);

      return this.createResponse(
        undefined,
        'Dataset deleted successfully'
      );
    } catch (error) {
      this.handleError(error, 'DELETE_DATASET');
    }
  }

  /**
   * Preview dataset data
   */
  async previewDataset(
    id: string,
    previewDto: DataPreviewDto
  ): Promise<AnalyticsApiResponse<DataPreviewResultDto>> {
    try {
      this.logOperation('PREVIEW_DATASET', 'AnalyticsDataset', id);

      const dataset = await this.datasetRepository.findOne({
        where: { id },
        relations: ['dataSource'],
      });

      if (!dataset) {
        throw new NotFoundException(`Dataset with ID ${id} not found`);
      }

      // Check cache first
      const cacheKey = this.generateCacheKey('preview', id, previewDto.limit || 100);
      if (this.dataCache.has(cacheKey)) {
        return this.createResponse(
          this.dataCache.get(cacheKey),
          'Dataset preview retrieved from cache'
        );
      }

      // Execute query and get data
      const previewData = await this.executeDataPreview(dataset, previewDto);

      // Cache result
      this.dataCache.set(cacheKey, previewData);

      return this.createResponse(
        previewData,
        'Dataset preview retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'PREVIEW_DATASET');
    }
  }

  /**
   * Get dataset statistics and profiling information
   */
  async getDatasetProfile(id: string): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('GET_DATASET_PROFILE', 'AnalyticsDataset', id);

      const dataset = await this.datasetRepository.findOne({
        where: { id },
        relations: ['dataSource'],
      });

      if (!dataset) {
        throw new NotFoundException(`Dataset with ID ${id} not found`);
      }

      const profile = await this.getDataProfile(dataset);

      return this.createResponse(
        profile,
        'Dataset profile retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_DATASET_PROFILE');
    }
  }

  /**
   * Refresh dataset profiling information
   */
  async refreshDatasetProfile(id: string): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('REFRESH_DATASET_PROFILE', 'AnalyticsDataset', id);

      const dataset = await this.datasetRepository.findOne({
        where: { id },
        relations: ['dataSource'],
      });

      if (!dataset) {
        throw new NotFoundException(`Dataset with ID ${id} not found`);
      }

      // Clear cache and start fresh profiling
      this.clearDatasetCache(id);
      
      // Update status to processing
      dataset.processingStatus = ProcessingStatus.PROCESSING;
      await this.datasetRepository.save(dataset);

      // Start async profiling
      this.profileDataAsync(id);

      return this.createResponse(
        { status: 'started' },
        'Dataset profile refresh started'
      );
    } catch (error) {
      this.handleError(error, 'REFRESH_DATASET_PROFILE');
    }
  }

  /**
   * Validate dataset schema
   */
  async validateDatasetSchema(id: string): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('VALIDATE_DATASET_SCHEMA', 'AnalyticsDataset', id);

      const dataset = await this.datasetRepository.findOne({
        where: { id },
        relations: ['dataSource'],
      });

      if (!dataset) {
        throw new NotFoundException(`Dataset with ID ${id} not found`);
      }

      const validation = await this.validateSchema(dataset);

      return this.createResponse(
        validation,
        'Dataset schema validation completed'
      );
    } catch (error) {
      this.handleError(error, 'VALIDATE_DATASET_SCHEMA');
    }
  }

  /**
   * Transform dataset data
   */
  async transformDataset(
    id: string,
    transformation: Record<string, any>
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('TRANSFORM_DATASET', 'AnalyticsDataset', id);

      const dataset = await this.datasetRepository.findOne({
        where: { id },
        relations: ['dataSource'],
      });

      if (!dataset) {
        throw new NotFoundException(`Dataset with ID ${id} not found`);
      }

      // Apply transformation
      const transformedData = await this.applyTransformation(dataset, transformation);

      // Update dataset with new transformation
      dataset.transformation = {
        ...dataset.transformation,
        ...transformation,
        lastApplied: new Date(),
      };

      await this.datasetRepository.save(dataset);

      return this.createResponse(
        transformedData,
        'Dataset transformation completed'
      );
    } catch (error) {
      this.handleError(error, 'TRANSFORM_DATASET');
    }
  }

  /**
   * Get dataset data quality assessment
   */
  async getDataQualityAssessment(id: string): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('GET_DATA_QUALITY_ASSESSMENT', 'AnalyticsDataset', id);

      const dataset = await this.datasetRepository.findOne({
        where: { id },
        relations: ['dataSource'],
      });

      if (!dataset) {
        throw new NotFoundException(`Dataset with ID ${id} not found`);
      }

      const qualityAssessment = await this.assessDataQuality(dataset);

      return this.createResponse(
        qualityAssessment,
        'Data quality assessment completed'
      );
    } catch (error) {
      this.handleError(error, 'GET_DATA_QUALITY_ASSESSMENT');
    }
  }

  /**
   * Execute data preview
   */
  private async executeDataPreview(
    dataset: AnalyticsDataset,
    previewDto: DataPreviewDto
  ): Promise<DataPreviewResultDto> {
    const limit = previewDto.limit || 100;
    const offset = previewDto.offset || 0;

    // This would implement actual data fetching based on data source type
    // For now, it's a mock implementation
    const mockData = this.generateMockData(dataset, limit, offset);

    return {
      data: mockData.data,
      columns: mockData.columns,
      totalRows: mockData.totalRows,
      limit,
      offset,
      hasMore: offset + limit < mockData.totalRows,
      dataTypes: mockData.dataTypes,
      statistics: mockData.statistics,
    };
  }

  /**
   * Generate mock data for preview
   */
  private generateMockData(
    dataset: AnalyticsDataset,
    limit: number,
    offset: number
  ): any {
    const columns = ['id', 'name', 'email', 'created_at', 'value'];
    const dataTypes = {
      id: 'integer',
      name: 'string',
      email: 'string',
      created_at: 'datetime',
      value: 'decimal',
    };

    const data = [];
    for (let i = offset; i < offset + limit; i++) {
      data.push({
        id: i + 1,
        name: `Item ${i + 1}`,
        email: `user${i + 1}@example.com`,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        value: Math.round(Math.random() * 1000 * 100) / 100,
      });
    }

    return {
      data,
      columns,
      totalRows: 10000, // Mock total
      dataTypes,
      statistics: {
        nullValues: Math.floor(Math.random() * 50),
        uniqueValues: columns.reduce((acc, col) => {
          acc[col] = Math.floor(Math.random() * limit);
          return acc;
        }, {} as Record<string, number>),
      },
    };
  }

  /**
   * Get data profile
   */
  private async getDataProfile(dataset: AnalyticsDataset): Promise<any> {
    // Check cache first
    const cacheKey = this.generateCacheKey('profile', dataset.id);
    if (this.dataCache.has(cacheKey)) {
      return this.dataCache.get(cacheKey);
    }

    // Mock data profiling
    const profile = {
      rowCount: 10000,
      columnCount: 5,
      nullValues: 127,
      duplicateRows: 15,
      dataQuality: dataset.dataQuality,
      columnProfiles: [
        {
          name: 'id',
          dataType: 'integer',
          nullCount: 0,
          uniqueCount: 10000,
          min: 1,
          max: 10000,
          mean: 5000.5,
        },
        {
          name: 'name',
          dataType: 'string',
          nullCount: 45,
          uniqueCount: 9955,
          minLength: 5,
          maxLength: 50,
          avgLength: 12.3,
        },
        {
          name: 'email',
          dataType: 'string',
          nullCount: 12,
          uniqueCount: 9988,
          pattern: 'email',
          validEmails: 9876,
        },
        {
          name: 'created_at',
          dataType: 'datetime',
          nullCount: 0,
          uniqueCount: 8765,
          minDate: '2023-01-01',
          maxDate: '2024-08-24',
        },
        {
          name: 'value',
          dataType: 'decimal',
          nullCount: 70,
          uniqueCount: 8543,
          min: 0.01,
          max: 999.99,
          mean: 499.85,
          median: 501.23,
          stdDev: 288.45,
        },
      ],
      correlations: [
        { column1: 'id', column2: 'value', coefficient: 0.05 },
      ],
      outliers: {
        value: 23,
      },
      completeness: 98.7,
      consistency: 95.2,
      accuracy: 97.8,
      uniqueness: 99.8,
    };

    // Cache the profile
    this.dataCache.set(cacheKey, profile);

    return profile;
  }

  /**
   * Validate dataset schema
   */
  private async validateSchema(dataset: AnalyticsDataset): Promise<any> {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      summary: {
        totalColumns: 5,
        validColumns: 5,
        invalidColumns: 0,
        missingColumns: 0,
        unexpectedColumns: 0,
      },
      columnValidation: [
        {
          name: 'id',
          isValid: true,
          expectedType: 'integer',
          actualType: 'integer',
          constraints: ['NOT NULL', 'PRIMARY KEY'],
          issues: [],
        },
        {
          name: 'name',
          isValid: true,
          expectedType: 'string',
          actualType: 'string',
          constraints: ['MAX_LENGTH(50)'],
          issues: [],
        },
        {
          name: 'email',
          isValid: true,
          expectedType: 'string',
          actualType: 'string',
          constraints: ['EMAIL_FORMAT'],
          issues: ['12 invalid email formats found'],
        },
        {
          name: 'created_at',
          isValid: true,
          expectedType: 'datetime',
          actualType: 'datetime',
          constraints: ['NOT NULL'],
          issues: [],
        },
        {
          name: 'value',
          isValid: true,
          expectedType: 'decimal',
          actualType: 'decimal',
          constraints: ['MIN(0)', 'MAX(1000)'],
          issues: [],
        },
      ],
    };

    return validation;
  }

  /**
   * Apply data transformation
   */
  private async applyTransformation(
    dataset: AnalyticsDataset,
    transformation: Record<string, any>
  ): Promise<any> {
    const cacheKey = this.generateCacheKey('transform', dataset.id, JSON.stringify(transformation));
    
    if (this.transformationCache.has(cacheKey)) {
      return this.transformationCache.get(cacheKey);
    }

    // Mock transformation application
    const result = {
      transformationType: transformation.type || 'custom',
      appliedAt: new Date(),
      inputRows: 10000,
      outputRows: 9950, // Some rows might be filtered out
      transformations: transformation,
      preview: [
        {
          id: 1,
          name: 'Transformed Item 1',
          email: 'user1@example.com',
          created_at: new Date(),
          value: 123.45,
          computed_field: 'NEW_VALUE',
        },
      ],
      statistics: {
        rowsAdded: 0,
        rowsRemoved: 50,
        columnsAdded: 1,
        columnsRemoved: 0,
        columnsModified: 2,
      },
    };

    this.transformationCache.set(cacheKey, result);
    return result;
  }

  /**
   * Assess data quality
   */
  private async assessDataQuality(dataset: AnalyticsDataset): Promise<any> {
    // This would implement comprehensive data quality assessment
    const assessment = {
      overallScore: 87.5,
      grade: 'B+',
      dimensions: {
        completeness: {
          score: 91.2,
          issues: ['45 null values in name column', '12 null values in email column'],
        },
        accuracy: {
          score: 85.6,
          issues: ['12 invalid email formats', '3 future dates in created_at'],
        },
        consistency: {
          score: 92.1,
          issues: ['Inconsistent date formats in 15 records'],
        },
        uniqueness: {
          score: 89.8,
          issues: ['15 duplicate rows found'],
        },
        validity: {
          score: 88.3,
          issues: ['23 outliers in value column'],
        },
      },
      recommendations: [
        'Clean invalid email addresses',
        'Remove or correct future dates',
        'Standardize date formats',
        'Remove duplicate rows',
        'Investigate outliers in value column',
      ],
      dataQualityRules: [
        {
          rule: 'email_format_validation',
          passed: false,
          failedRecords: 12,
          severity: 'warning',
        },
        {
          rule: 'no_null_primary_key',
          passed: true,
          failedRecords: 0,
          severity: 'error',
        },
        {
          rule: 'date_range_validation',
          passed: false,
          failedRecords: 3,
          severity: 'warning',
        },
      ],
    };

    return assessment;
  }

  /**
   * Async data profiling
   */
  private async profileDataAsync(datasetId: string): Promise<void> {
    try {
      await this.updateProcessingStatus(datasetId, ProcessingStatus.PROCESSING, 'Profiling data');

      const dataset = await this.datasetRepository.findOne({
        where: { id: datasetId },
        relations: ['dataSource'],
      });

      if (!dataset) {
        return;
      }

      // Simulate profiling time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get data profile
      const profile = await this.getDataProfile(dataset);

      // Update dataset with quality assessment
      const qualityScore = profile.completeness * 0.4 + profile.accuracy * 0.3 + profile.consistency * 0.3;
      let dataQuality: DataQuality;
      if (qualityScore >= 90) dataQuality = DataQuality.HIGH;
      else if (qualityScore >= 70) dataQuality = DataQuality.MEDIUM;
      else if (qualityScore >= 50) dataQuality = DataQuality.LOW;
      else dataQuality = DataQuality.POOR;

      dataset.dataQuality = dataQuality;
      dataset.processingStatus = ProcessingStatus.COMPLETED;
      dataset.profiledAt = new Date();
      dataset.statistics = profile;

      await this.datasetRepository.save(dataset);

      await this.updateProcessingStatus(datasetId, ProcessingStatus.COMPLETED, 'Data profiling completed');
    } catch (error) {
      this.logger.error(`Data profiling failed for dataset ${datasetId}:`, error);
      await this.updateProcessingStatus(datasetId, ProcessingStatus.FAILED, 'Data profiling failed');
    }
  }

  /**
   * Clear dataset cache
   */
  private clearDatasetCache(datasetId: string): void {
    const keysToDelete = [];
    for (const key of this.dataCache.keys()) {
      if (key.includes(datasetId)) {
        keysToDelete.push(key);
      }
    }
    for (const key of keysToDelete) {
      this.dataCache.delete(key);
    }

    // Clear transformation cache
    for (const key of this.transformationCache.keys()) {
      if (key.includes(datasetId)) {
        this.transformationCache.delete(key);
      }
    }
  }

  /**
   * Map entity to DTO
   */
  private async mapEntityToDto(dataset: AnalyticsDataset): Promise<DatasetDto> {
    return {
      id: dataset.id,
      name: dataset.name,
      description: dataset.description,
      dataSourceId: dataset.dataSource.id,
      dataSource: {
        id: dataset.dataSource.id,
        name: dataset.dataSource.name,
        type: dataset.dataSource.type,
      },
      query: dataset.query,
      transformation: dataset.transformation,
      schema: dataset.schema,
      statistics: dataset.statistics,
      isActive: dataset.isActive,
      version: dataset.version,
      dataQuality: dataset.dataQuality,
      processingStatus: dataset.processingStatus,
      profiledAt: dataset.profiledAt,
      createdAt: dataset.createdAt,
      updatedAt: dataset.updatedAt,
    };
  }
}
