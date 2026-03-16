import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { BaseAnalyticsService } from './base-analytics.service';
import {
  AnalyticsDataSource,
  DataSourceType,
  ProcessingStatus,
} from '../entities';
import {
  CreateDataSourceDto,
  UpdateDataSourceDto,
  DataSourceDto,
  TestDataSourceConnectionDto,
  DataSourceConnectionResultDto,
  AnalyticsApiResponse,
  PaginatedAnalyticsResponse,
} from '../dto';

/**
 * Data Source Service
 * Handles data source connection management, testing, and operations
 */
@Injectable()
export class DataSourceService extends BaseAnalyticsService {
  private readonly connectionPool = new Map<string, any>();
  private readonly activeConnections = new Map<string, number>();

  constructor(
    entityManager: EntityManager,
    @InjectRepository(AnalyticsDataSource)
    private readonly dataSourceRepository: Repository<AnalyticsDataSource>
  ) {
    super(entityManager);
  }

  /**
   * Create a new data source
   */
  async createDataSource(
    createDataSourceDto: CreateDataSourceDto
  ): Promise<AnalyticsApiResponse<DataSourceDto>> {
    try {
      this.logOperation('CREATE_DATA_SOURCE', 'AnalyticsDataSource');

      // Validate DTO
      const validatedDto = await this.validateDto(createDataSourceDto, CreateDataSourceDto);

      // Sanitize configuration data
      const sanitizedConfig = this.sanitizeConfiguration(validatedDto.configuration);

      // Test connection before creating
      const connectionTest = await this.testConnection({
        type: validatedDto.type,
        configuration: sanitizedConfig,
      });

      if (!connectionTest.success) {
        throw new BadRequestException(
          `Connection test failed: ${connectionTest.message || 'Unknown error'}`
        );
      }

      // Create data source entity
      const dataSource = this.dataSourceRepository.create({
        ...validatedDto,
        configuration: sanitizedConfig,
        connectionStatus: ProcessingStatus.COMPLETED,
        lastTestedAt: new Date(),
        isActive: validatedDto.isActive ?? true,
        isRealTime: validatedDto.isRealTime ?? false,
        refreshInterval: validatedDto.refreshInterval ?? 300,
      });

      const savedDataSource = await this.dataSourceRepository.save(dataSource);

      // Discover schema if applicable
      if (this.supportsSchemaDiscovery(validatedDto.type)) {
        this.discoverSchemaAsync(savedDataSource.id);
      }

      const dataSourceDto = await this.mapEntityToDto(savedDataSource);

      this.logOperation(
        'CREATE_DATA_SOURCE_SUCCESS',
        'AnalyticsDataSource',
        savedDataSource.id
      );

      return this.createResponse(
        dataSourceDto,
        'Data source created successfully',
        { connectionTest }
      );
    } catch (error) {
      this.handleError(error, 'CREATE_DATA_SOURCE');
    }
  }

  /**
   * Get all data sources with pagination and filtering
   */
  async getDataSources(
    page: number = 1,
    limit: number = 10,
    filters: Record<string, any> = {}
  ): Promise<AnalyticsApiResponse<PaginatedAnalyticsResponse<DataSourceDto>>> {
    try {
      this.logOperation('GET_DATA_SOURCES', 'AnalyticsDataSource');

      const queryBuilder = this.dataSourceRepository
        .createQueryBuilder('dataSource')
        .select();

      // Apply filters
      this.applyFilters(queryBuilder, filters, 'dataSource');

      // Apply pagination
      this.applyPagination(queryBuilder, page, limit);

      // Apply sorting
      this.applySorting(queryBuilder, 'dataSource.createdAt', 'DESC');

      const [dataSources, total] = await queryBuilder.getManyAndCount();

      const dataSourceDtos = await Promise.all(
        dataSources.map((dataSource) => this.mapEntityToDto(dataSource))
      );

      const paginatedResponse = this.createPaginatedResponse(
        dataSourceDtos,
        total,
        page,
        limit,
        filters
      );

      return this.createResponse(
        paginatedResponse,
        'Data sources retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_DATA_SOURCES');
    }
  }

  /**
   * Get a specific data source by ID
   */
  async getDataSourceById(id: string): Promise<AnalyticsApiResponse<DataSourceDto>> {
    try {
      this.logOperation('GET_DATA_SOURCE_BY_ID', 'AnalyticsDataSource', id);

      const dataSource = await this.dataSourceRepository.findOne({
        where: { id },
      });

      if (!dataSource) {
        throw new NotFoundException(`Data source with ID ${id} not found`);
      }

      const dataSourceDto = await this.mapEntityToDto(dataSource);

      return this.createResponse(
        dataSourceDto,
        'Data source retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_DATA_SOURCE_BY_ID');
    }
  }

  /**
   * Update a data source
   */
  async updateDataSource(
    id: string,
    updateDataSourceDto: UpdateDataSourceDto
  ): Promise<AnalyticsApiResponse<DataSourceDto>> {
    try {
      this.logOperation('UPDATE_DATA_SOURCE', 'AnalyticsDataSource', id);

      const dataSource = await this.dataSourceRepository.findOne({
        where: { id },
      });

      if (!dataSource) {
        throw new NotFoundException(`Data source with ID ${id} not found`);
      }

      // Validate DTO
      const validatedDto = await this.validateDto(updateDataSourceDto, UpdateDataSourceDto);

      // If configuration is being updated, test the connection
      let connectionTest;
      if (validatedDto.configuration) {
        const sanitizedConfig = this.sanitizeConfiguration(validatedDto.configuration);
        connectionTest = await this.testConnection({
          type: dataSource.type,
          configuration: { ...dataSource.configuration, ...sanitizedConfig },
        });

        if (!connectionTest.success) {
          throw new BadRequestException(
            `Connection test failed: ${connectionTest.message || 'Unknown error'}`
          );
        }

        validatedDto.configuration = sanitizedConfig;
      }

      // Update data source
      Object.assign(dataSource, {
        ...validatedDto,
        lastTestedAt: connectionTest ? new Date() : dataSource.lastTestedAt,
        updatedAt: new Date(),
      });

      const updatedDataSource = await this.dataSourceRepository.save(dataSource);

      // Rediscover schema if configuration changed
      if (validatedDto.configuration && this.supportsSchemaDiscovery(dataSource.type)) {
        this.discoverSchemaAsync(id);
      }

      const dataSourceDto = await this.mapEntityToDto(updatedDataSource);

      this.logOperation('UPDATE_DATA_SOURCE_SUCCESS', 'AnalyticsDataSource', id);

      return this.createResponse(
        dataSourceDto,
        'Data source updated successfully',
        { connectionTest }
      );
    } catch (error) {
      this.handleError(error, 'UPDATE_DATA_SOURCE');
    }
  }

  /**
   * Delete a data source
   */
  async deleteDataSource(id: string): Promise<AnalyticsApiResponse<void>> {
    try {
      this.logOperation('DELETE_DATA_SOURCE', 'AnalyticsDataSource', id);

      const dataSource = await this.dataSourceRepository.findOne({
        where: { id },
      });

      if (!dataSource) {
        throw new NotFoundException(`Data source with ID ${id} not found`);
      }

      // Close any active connections
      await this.closeConnection(id);

      // Soft delete
      await this.dataSourceRepository.softRemove(dataSource);

      this.logOperation('DELETE_DATA_SOURCE_SUCCESS', 'AnalyticsDataSource', id);

      return this.createResponse(
        undefined,
        'Data source deleted successfully'
      );
    } catch (error) {
      this.handleError(error, 'DELETE_DATA_SOURCE');
    }
  }

  /**
   * Test data source connection
   */
  async testDataSourceConnection(
    testConnectionDto: TestDataSourceConnectionDto
  ): Promise<AnalyticsApiResponse<DataSourceConnectionResultDto>> {
    try {
      this.logOperation('TEST_CONNECTION', 'DataSourceConnection');

      const result = await this.testConnection(testConnectionDto);

      return this.createResponse(
        result,
        result.success ? 'Connection test successful' : 'Connection test failed'
      );
    } catch (error) {
      this.handleError(error, 'TEST_CONNECTION');
    }
  }

  /**
   * Get data source schema information
   */
  async getDataSourceSchema(id: string): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('GET_DATA_SOURCE_SCHEMA', 'AnalyticsDataSource', id);

      const dataSource = await this.dataSourceRepository.findOne({
        where: { id },
      });

      if (!dataSource) {
        throw new NotFoundException(`Data source with ID ${id} not found`);
      }

      const schema = await this.discoverSchema(dataSource);

      return this.createResponse(
        schema,
        'Schema retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_DATA_SOURCE_SCHEMA');
    }
  }

  /**
   * Refresh data source schema
   */
  async refreshDataSourceSchema(id: string): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('REFRESH_DATA_SOURCE_SCHEMA', 'AnalyticsDataSource', id);

      const dataSource = await this.dataSourceRepository.findOne({
        where: { id },
      });

      if (!dataSource) {
        throw new NotFoundException(`Data source with ID ${id} not found`);
      }

      const schema = await this.discoverSchema(dataSource);

      // Update data source with new schema
      dataSource.schema = schema;
      dataSource.updatedAt = new Date();
      await this.dataSourceRepository.save(dataSource);

      return this.createResponse(
        schema,
        'Schema refreshed successfully'
      );
    } catch (error) {
      this.handleError(error, 'REFRESH_DATA_SOURCE_SCHEMA');
    }
  }

  /**
   * Get active connection status for all data sources
   */
  async getConnectionStatus(): Promise<AnalyticsApiResponse<Record<string, any>>> {
    try {
      this.logOperation('GET_CONNECTION_STATUS', 'DataSourceConnection');

      const status = {
        totalDataSources: await this.dataSourceRepository.count(),
        activeConnections: this.activeConnections.size,
        connectionPool: Object.fromEntries(
          Array.from(this.activeConnections.entries()).map(([id, count]) => [
            id,
            { activeConnections: count, poolSize: this.getPoolSize(id) },
          ])
        ),
      };

      return this.createResponse(
        status,
        'Connection status retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_CONNECTION_STATUS');
    }
  }

  /**
   * Private method to test connection
   */
  private async testConnection(
    config: TestDataSourceConnectionDto
  ): Promise<DataSourceConnectionResultDto> {
    const startTime = Date.now();

    try {
      let connection;
      const sanitizedConfig = this.sanitizeConfiguration(config.configuration);

      switch (config.type) {
        case DataSourceType.DATABASE:
          connection = await this.testDatabaseConnection(sanitizedConfig);
          break;
        case DataSourceType.REST_API:
          connection = await this.testApiConnection(sanitizedConfig);
          break;
        case DataSourceType.FILE:
          connection = await this.testFileConnection(sanitizedConfig);
          break;
        case DataSourceType.STREAM:
          connection = await this.testStreamConnection(sanitizedConfig);
          break;
        case DataSourceType.CLOUD_STORAGE:
          connection = await this.testCloudStorageConnection(sanitizedConfig);
          break;
        default:
          throw new BadRequestException(`Unsupported data source type: ${config.type}`);
      }

      return {
        success: true,
        message: 'Connection successful',
        responseTime: Date.now() - startTime,
        metadata: connection.metadata,
      };
    } catch (error) {
      this.logger.error('Connection test failed:', error);
      return {
        success: false,
        message: error.message || 'Connection failed',
        responseTime: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  /**
   * Test database connection
   */
  private async testDatabaseConnection(config: any): Promise<any> {
    // This would implement actual database connection testing
    // For now, it's a mock implementation
    if (!config.host || !config.database) {
      throw new Error('Host and database are required for database connection');
    }

    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      success: true,
      metadata: {
        host: config.host,
        port: config.port || 5432,
        database: config.database,
        version: 'PostgreSQL 14.0', // Mock version
      },
    };
  }

  /**
   * Test API connection
   */
  private async testApiConnection(config: any): Promise<any> {
    if (!config.apiUrl) {
      throw new Error('API URL is required for REST API connection');
    }

    // This would implement actual HTTP request testing
    // For now, it's a mock implementation
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      success: true,
      metadata: {
        url: config.apiUrl,
        method: 'GET',
        statusCode: 200,
        headers: {
          'content-type': 'application/json',
        },
      },
    };
  }

  /**
   * Test file connection
   */
  private async testFileConnection(config: any): Promise<any> {
    if (!config.filePath) {
      throw new Error('File path is required for file connection');
    }

    // This would implement actual file system access testing
    // For now, it's a mock implementation
    await new Promise(resolve => setTimeout(resolve, 50));

    return {
      success: true,
      metadata: {
        path: config.filePath,
        size: 1024000, // Mock file size
        lastModified: new Date().toISOString(),
        type: 'text/csv',
      },
    };
  }

  /**
   * Test stream connection
   */
  private async testStreamConnection(config: any): Promise<any> {
    if (!config.streamUrl) {
      throw new Error('Stream URL is required for stream connection');
    }

    // This would implement actual stream connection testing
    // For now, it's a mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      success: true,
      metadata: {
        streamUrl: config.streamUrl,
        protocol: 'websocket',
        status: 'connected',
      },
    };
  }

  /**
   * Test cloud storage connection
   */
  private async testCloudStorageConnection(config: any): Promise<any> {
    if (!config.apiKey) {
      throw new Error('API key is required for cloud storage connection');
    }

    // This would implement actual cloud storage connection testing
    // For now, it's a mock implementation
    await new Promise(resolve => setTimeout(resolve, 400));

    return {
      success: true,
      metadata: {
        provider: 'aws-s3', // Mock provider
        region: 'us-east-1',
        bucket: config.bucket || 'default-bucket',
      },
    };
  }

  /**
   * Discover schema for data source
   */
  private async discoverSchema(dataSource: AnalyticsDataSource): Promise<any> {
    try {
      switch (dataSource.type) {
        case DataSourceType.DATABASE:
          return await this.discoverDatabaseSchema(dataSource.configuration);
        case DataSourceType.REST_API:
          return await this.discoverApiSchema(dataSource.configuration);
        case DataSourceType.FILE:
          return await this.discoverFileSchema(dataSource.configuration);
        default:
          return { message: 'Schema discovery not supported for this data source type' };
      }
    } catch (error) {
      this.logger.error('Schema discovery failed:', error);
      return { error: error.message };
    }
  }

  /**
   * Discover database schema
   */
  private async discoverDatabaseSchema(config: any): Promise<any> {
    // Mock database schema discovery
    return {
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'integer', nullable: false, primaryKey: true },
            { name: 'email', type: 'varchar', nullable: false },
            { name: 'created_at', type: 'timestamp', nullable: false },
          ],
        },
        {
          name: 'orders',
          columns: [
            { name: 'id', type: 'integer', nullable: false, primaryKey: true },
            { name: 'user_id', type: 'integer', nullable: false },
            { name: 'total', type: 'decimal', nullable: false },
            { name: 'created_at', type: 'timestamp', nullable: false },
          ],
        },
      ],
      relationships: [
        {
          from: 'orders.user_id',
          to: 'users.id',
          type: 'many-to-one',
        },
      ],
    };
  }

  /**
   * Discover API schema
   */
  private async discoverApiSchema(config: any): Promise<any> {
    // Mock API schema discovery
    return {
      endpoints: [
        {
          path: '/users',
          method: 'GET',
          parameters: [],
          response: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                email: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
        },
      ],
    };
  }

  /**
   * Discover file schema
   */
  private async discoverFileSchema(config: any): Promise<any> {
    // Mock file schema discovery
    return {
      format: 'csv',
      delimiter: ',',
      headers: true,
      columns: [
        { name: 'id', type: 'integer', index: 0 },
        { name: 'name', type: 'string', index: 1 },
        { name: 'email', type: 'string', index: 2 },
        { name: 'created_at', type: 'datetime', index: 3 },
      ],
      rows: 1000,
      size: '50KB',
    };
  }

  /**
   * Async schema discovery
   */
  private async discoverSchemaAsync(dataSourceId: string): Promise<void> {
    try {
      await this.updateProcessingStatus(dataSourceId, ProcessingStatus.PROCESSING, 'Discovering schema');

      const dataSource = await this.dataSourceRepository.findOne({
        where: { id: dataSourceId },
      });

      if (!dataSource) {
        return;
      }

      const schema = await this.discoverSchema(dataSource);

      dataSource.schema = schema;
      dataSource.updatedAt = new Date();
      await this.dataSourceRepository.save(dataSource);

      await this.updateProcessingStatus(dataSourceId, ProcessingStatus.COMPLETED, 'Schema discovery completed');
    } catch (error) {
      this.logger.error(`Schema discovery failed for data source ${dataSourceId}:`, error);
      await this.updateProcessingStatus(dataSourceId, ProcessingStatus.FAILED, 'Schema discovery failed');
    }
  }

  /**
   * Check if data source type supports schema discovery
   */
  private supportsSchemaDiscovery(type: DataSourceType): boolean {
    return [
      DataSourceType.DATABASE,
      DataSourceType.REST_API,
      DataSourceType.FILE,
    ].includes(type);
  }

  /**
   * Sanitize configuration data
   */
  private sanitizeConfiguration(config: any): any {
    return this.sanitizeData(config);
  }

  /**
   * Close connection for data source
   */
  private async closeConnection(dataSourceId: string): Promise<void> {
    if (this.connectionPool.has(dataSourceId)) {
      const connection = this.connectionPool.get(dataSourceId);
      // Close connection logic would be implemented here
      this.connectionPool.delete(dataSourceId);
      this.activeConnections.delete(dataSourceId);
      this.logger.log(`Closed connection for data source: ${dataSourceId}`);
    }
  }

  /**
   * Get connection pool size
   */
  private getPoolSize(dataSourceId: string): number {
    // This would return actual pool size
    return 5; // Mock pool size
  }

  /**
   * Map entity to DTO
   */
  private async mapEntityToDto(dataSource: AnalyticsDataSource): Promise<DataSourceDto> {
    return {
      id: dataSource.id,
      name: dataSource.name,
      description: dataSource.description,
      type: dataSource.type,
      configuration: this.sanitizeConfiguration(dataSource.configuration),
      schema: dataSource.schema,
      isActive: dataSource.isActive,
      isRealTime: dataSource.isRealTime,
      refreshInterval: dataSource.refreshInterval,
      connectionStatus: dataSource.connectionStatus,
      lastTestedAt: dataSource.lastTestedAt,
      createdAt: dataSource.createdAt,
      updatedAt: dataSource.updatedAt,
    };
  }
}
