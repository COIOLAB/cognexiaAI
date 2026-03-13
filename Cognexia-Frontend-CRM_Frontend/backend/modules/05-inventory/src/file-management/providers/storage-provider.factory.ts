import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageProvider } from '../entities/file-record.entity';
import { SupabaseStorageProvider } from './supabase-storage.provider';
import { LocalFileSystemProvider } from './local-filesystem.provider';

export interface StorageProviderInterface {
  uploadFile(
    key: string,
    filePath: string,
    options?: {
      mimeType?: string;
      metadata?: Record<string, any>;
      cacheControl?: string;
      upsert?: boolean;
    }
  ): Promise<{
    url?: string;
    key: string;
    size?: number;
    etag?: string;
    lastModified?: Date;
  }>;

  downloadFile(key: string, downloadPath: string): Promise<void>;

  deleteFile(key: string): Promise<void>;

  getFileInfo(key: string): Promise<{
    exists: boolean;
    size?: number;
    lastModified?: Date;
    etag?: string;
    metadata?: Record<string, any>;
  }>;

  getPresignedUrl(
    key: string,
    expiresIn: number,
    operation: 'upload' | 'download'
  ): Promise<string>;

  copyFile(sourceKey: string, destinationKey: string): Promise<void>;

  moveFile(sourceKey: string, destinationKey: string): Promise<void>;

  listFiles(
    prefix?: string,
    options?: {
      limit?: number;
      offset?: number;
      sortBy?: 'name' | 'created_at' | 'updated_at';
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<{
    files: Array<{
      name: string;
      key: string;
      size: number;
      lastModified: Date;
      metadata?: Record<string, any>;
    }>;
    hasMore: boolean;
    nextOffset?: number;
  }>;

  createFolder(folderPath: string): Promise<void>;

  deleteFolder(folderPath: string): Promise<void>;

  getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    availableSpace?: number;
    usedSpace: number;
  }>;

  healthCheck(): Promise<{
    healthy: boolean;
    responseTime: number;
    error?: string;
  }>;
}

@Injectable()
export class StorageProviderFactory {
  private readonly logger = new Logger(StorageProviderFactory.name);
  private readonly providers = new Map<StorageProvider, StorageProviderInterface>();

  constructor(
    private configService: ConfigService,
    private supabaseProvider: SupabaseStorageProvider,
    private localProvider: LocalFileSystemProvider,
  ) {
    this.initializeProviders();
  }

  /**
   * Get storage provider instance
   */
  getProvider(provider: StorageProvider): StorageProviderInterface {
    const providerInstance = this.providers.get(provider);
    
    if (!providerInstance) {
      throw new BadRequestException(`Unsupported storage provider: ${provider}`);
    }

    return providerInstance;
  }

  /**
   * Get default storage provider
   */
  getDefaultProvider(): StorageProviderInterface {
    const defaultProvider = this.configService.get<StorageProvider>(
      'DEFAULT_STORAGE_PROVIDER',
      StorageProvider.SUPABASE // Changed default to Supabase
    );

    return this.getProvider(defaultProvider);
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): StorageProvider[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Test provider connectivity
   */
  async testProvider(provider: StorageProvider): Promise<{
    provider: StorageProvider;
    healthy: boolean;
    responseTime: number;
    error?: string;
  }> {
    try {
      const providerInstance = this.getProvider(provider);
      const healthCheck = await providerInstance.healthCheck();

      return {
        provider,
        healthy: healthCheck.healthy,
        responseTime: healthCheck.responseTime,
        error: healthCheck.error,
      };

    } catch (error) {
      this.logger.error(`Provider test failed for ${provider}`, error);
      return {
        provider,
        healthy: false,
        responseTime: 0,
        error: error.message,
      };
    }
  }

  /**
   * Test all providers
   */
  async testAllProviders(): Promise<Array<{
    provider: StorageProvider;
    healthy: boolean;
    responseTime: number;
    error?: string;
  }>> {
    const results = [];
    
    for (const provider of this.getAvailableProviders()) {
      const result = await this.testProvider(provider);
      results.push(result);
    }

    return results;
  }

  /**
   * Get provider configuration
   */
  getProviderConfig(provider: StorageProvider): any {
    switch (provider) {
      case StorageProvider.SUPABASE:
        return {
          url: this.configService.get('SUPABASE_URL'),
          bucket: this.configService.get('SUPABASE_STORAGE_BUCKET', 'files'),
          publicUrl: this.configService.get('SUPABASE_PUBLIC_URL'),
        };

      case StorageProvider.LOCAL_FILESYSTEM:
        return {
          basePath: this.configService.get('LOCAL_STORAGE_PATH', './storage'),
          publicUrl: this.configService.get('LOCAL_STORAGE_PUBLIC_URL'),
        };

      default:
        return {};
    }
  }

  /**
   * Migrate files between providers
   */
  async migrateFiles(
    sourceProvider: StorageProvider,
    targetProvider: StorageProvider,
    options: {
      prefix?: string;
      batchSize?: number;
      deleteAfterMigration?: boolean;
      dryRun?: boolean;
    } = {}
  ): Promise<{
    totalFiles: number;
    migratedFiles: number;
    failedFiles: number;
    errors: Array<{ file: string; error: string }>;
  }> {
    const result = {
      totalFiles: 0,
      migratedFiles: 0,
      failedFiles: 0,
      errors: [] as Array<{ file: string; error: string }>,
    };

    try {
      const sourceProviderInstance = this.getProvider(sourceProvider);
      const targetProviderInstance = this.getProvider(targetProvider);

      // List files from source provider
      const { files } = await sourceProviderInstance.listFiles(options.prefix);
      result.totalFiles = files.length;

      this.logger.log(
        `Starting migration of ${files.length} files from ${sourceProvider} to ${targetProvider}`
      );

      const batchSize = options.batchSize || 10;
      
      // Process files in batches
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (file) => {
            try {
              if (!options.dryRun) {
                // Download from source
                const tempPath = `/tmp/${file.name}`;
                await sourceProviderInstance.downloadFile(file.key, tempPath);

                // Upload to target
                await targetProviderInstance.uploadFile(file.key, tempPath);

                // Delete from source if requested
                if (options.deleteAfterMigration) {
                  await sourceProviderInstance.deleteFile(file.key);
                }

                // Cleanup temp file
                await this.cleanupTempFile(tempPath);
              }

              result.migratedFiles++;
              
            } catch (error) {
              result.failedFiles++;
              result.errors.push({
                file: file.key,
                error: error.message,
              });
              this.logger.error(`Failed to migrate file ${file.key}`, error);
            }
          })
        );
      }

      this.logger.log(
        `Migration completed: ${result.migratedFiles}/${result.totalFiles} files migrated`
      );

      return result;

    } catch (error) {
      this.logger.error('File migration failed', error);
      throw error;
    }
  }

  private initializeProviders(): void {
    try {
      // Initialize Supabase provider (primary)
      this.providers.set(StorageProvider.SUPABASE, this.supabaseProvider);
      this.logger.log('Supabase storage provider initialized');

      // Initialize local filesystem provider (fallback)
      this.providers.set(StorageProvider.LOCAL_FILESYSTEM, this.localProvider);
      this.logger.log('Local filesystem storage provider initialized');

      this.logger.log(`Initialized ${this.providers.size} storage providers`);

    } catch (error) {
      this.logger.error('Failed to initialize storage providers', error);
      throw error;
    }
  }

  private async cleanupTempFile(filePath: string): Promise<void> {
    try {
      const fs = await import('fs/promises');
      await fs.unlink(filePath);
    } catch (error) {
      this.logger.warn(`Failed to cleanup temp file: ${filePath}`, error);
    }
  }
}

// Add new enum value for Supabase
export enum StorageProvider {
  SUPABASE = 'supabase',
  AWS_S3 = 'aws_s3',
  AZURE_BLOB = 'azure_blob',
  GOOGLE_CLOUD = 'google_cloud',
  LOCAL_FILESYSTEM = 'local_filesystem',
  MINIO = 'minio',
  HYBRID = 'hybrid',
}
