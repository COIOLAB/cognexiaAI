import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageProviderInterface } from './storage-provider.factory';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class SupabaseStorageProvider implements StorageProviderInterface {
  private readonly logger = new Logger(SupabaseStorageProvider.name);
  private readonly supabase: SupabaseClient;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase URL and Service Key must be configured');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    this.bucketName = this.configService.get<string>('SUPABASE_STORAGE_BUCKET', 'files');
    
    // Ensure bucket exists
    this.initializeBucket().catch(error => {
      this.logger.error('Failed to initialize Supabase bucket', error);
    });
  }

  /**
   * Upload file to Supabase Storage
   */
  async uploadFile(
    key: string,
    filePath: string,
    options: {
      mimeType?: string;
      metadata?: Record<string, any>;
      cacheControl?: string;
      upsert?: boolean;
    } = {}
  ): Promise<{
    url?: string;
    key: string;
    size?: number;
    etag?: string;
    lastModified?: Date;
  }> {
    try {
      // Read file buffer
      const fileBuffer = await fs.readFile(filePath);
      const stats = await fs.stat(filePath);

      // Prepare upload options
      const uploadOptions: any = {
        cacheControl: options.cacheControl || '3600',
        upsert: options.upsert || false,
      };

      if (options.mimeType) {
        uploadOptions.contentType = options.mimeType;
      }

      if (options.metadata) {
        uploadOptions.metadata = options.metadata;
      }

      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(key, fileBuffer, uploadOptions);

      if (error) {
        this.logger.error(`Failed to upload file ${key}:`, error);
        throw new InternalServerErrorException(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: publicData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(key);

      return {
        url: publicData.publicUrl,
        key: data.path,
        size: stats.size,
        etag: data.id, // Using file ID as etag equivalent
        lastModified: new Date(),
      };

    } catch (error) {
      this.logger.error(`Upload error for file ${key}:`, error);
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Download file from Supabase Storage
   */
  async downloadFile(key: string, downloadPath: string): Promise<void> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .download(key);

      if (error) {
        this.logger.error(`Failed to download file ${key}:`, error);
        throw new BadRequestException(`Download failed: ${error.message}`);
      }

      if (!data) {
        throw new BadRequestException(`File not found: ${key}`);
      }

      // Ensure directory exists
      const dir = path.dirname(downloadPath);
      await fs.mkdir(dir, { recursive: true });

      // Convert blob to buffer and write to file
      const buffer = await data.arrayBuffer();
      await fs.writeFile(downloadPath, Buffer.from(buffer));

      this.logger.log(`File downloaded successfully: ${key} -> ${downloadPath}`);

    } catch (error) {
      this.logger.error(`Download error for file ${key}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to download file: ${error.message}`);
    }
  }

  /**
   * Delete file from Supabase Storage
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([key]);

      if (error) {
        this.logger.error(`Failed to delete file ${key}:`, error);
        throw new BadRequestException(`Delete failed: ${error.message}`);
      }

      this.logger.log(`File deleted successfully: ${key}`);

    } catch (error) {
      this.logger.error(`Delete error for file ${key}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(key: string): Promise<{
    exists: boolean;
    size?: number;
    lastModified?: Date;
    etag?: string;
    metadata?: Record<string, any>;
  }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .list(path.dirname(key) || '', {
          search: path.basename(key),
        });

      if (error) {
        this.logger.error(`Failed to get file info ${key}:`, error);
        return { exists: false };
      }

      const fileInfo = data?.find(file => file.name === path.basename(key));
      
      if (!fileInfo) {
        return { exists: false };
      }

      return {
        exists: true,
        size: fileInfo.metadata?.size,
        lastModified: fileInfo.updated_at ? new Date(fileInfo.updated_at) : undefined,
        etag: fileInfo.id,
        metadata: fileInfo.metadata,
      };

    } catch (error) {
      this.logger.error(`Get file info error for ${key}:`, error);
      return { exists: false };
    }
  }

  /**
   * Get presigned URL for upload or download
   */
  async getPresignedUrl(
    key: string,
    expiresIn: number,
    operation: 'upload' | 'download'
  ): Promise<string> {
    try {
      if (operation === 'upload') {
        const { data, error } = await this.supabase.storage
          .from(this.bucketName)
          .createSignedUploadUrl(key);

        if (error) {
          throw new BadRequestException(`Failed to create upload URL: ${error.message}`);
        }

        return data.signedUrl;

      } else {
        const { data, error } = await this.supabase.storage
          .from(this.bucketName)
          .createSignedUrl(key, expiresIn);

        if (error) {
          throw new BadRequestException(`Failed to create download URL: ${error.message}`);
        }

        return data.signedUrl;
      }

    } catch (error) {
      this.logger.error(`Presigned URL error for ${key}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  /**
   * Copy file within Supabase Storage
   */
  async copyFile(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .copy(sourceKey, destinationKey);

      if (error) {
        this.logger.error(`Failed to copy file ${sourceKey} -> ${destinationKey}:`, error);
        throw new BadRequestException(`Copy failed: ${error.message}`);
      }

      this.logger.log(`File copied successfully: ${sourceKey} -> ${destinationKey}`);

    } catch (error) {
      this.logger.error(`Copy error: ${sourceKey} -> ${destinationKey}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to copy file: ${error.message}`);
    }
  }

  /**
   * Move file within Supabase Storage
   */
  async moveFile(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .move(sourceKey, destinationKey);

      if (error) {
        this.logger.error(`Failed to move file ${sourceKey} -> ${destinationKey}:`, error);
        throw new BadRequestException(`Move failed: ${error.message}`);
      }

      this.logger.log(`File moved successfully: ${sourceKey} -> ${destinationKey}`);

    } catch (error) {
      this.logger.error(`Move error: ${sourceKey} -> ${destinationKey}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to move file: ${error.message}`);
    }
  }

  /**
   * List files in Supabase Storage
   */
  async listFiles(
    prefix?: string,
    options: {
      limit?: number;
      offset?: number;
      sortBy?: 'name' | 'created_at' | 'updated_at';
      sortOrder?: 'asc' | 'desc';
    } = {}
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
  }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .list(prefix || '', {
          limit: options.limit || 100,
          offset: options.offset || 0,
          sortBy: { column: options.sortBy || 'name', order: options.sortOrder || 'asc' },
        });

      if (error) {
        this.logger.error(`Failed to list files with prefix ${prefix}:`, error);
        throw new BadRequestException(`List failed: ${error.message}`);
      }

      const files = (data || []).map(file => ({
        name: file.name,
        key: prefix ? `${prefix}/${file.name}` : file.name,
        size: file.metadata?.size || 0,
        lastModified: file.updated_at ? new Date(file.updated_at) : new Date(),
        metadata: file.metadata,
      }));

      const hasMore = data?.length === (options.limit || 100);
      const nextOffset = hasMore ? (options.offset || 0) + (options.limit || 100) : undefined;

      return {
        files,
        hasMore,
        nextOffset,
      };

    } catch (error) {
      this.logger.error(`List files error with prefix ${prefix}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to list files: ${error.message}`);
    }
  }

  /**
   * Create folder (Supabase doesn't have explicit folders, so this creates a placeholder)
   */
  async createFolder(folderPath: string): Promise<void> {
    try {
      // Create a placeholder file to represent the folder
      const placeholderKey = `${folderPath.replace(/\/$/, '')}/.keep`;
      const placeholderContent = Buffer.from('');

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(placeholderKey, placeholderContent, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        this.logger.error(`Failed to create folder ${folderPath}:`, error);
        throw new BadRequestException(`Create folder failed: ${error.message}`);
      }

      this.logger.log(`Folder created successfully: ${folderPath}`);

    } catch (error) {
      this.logger.error(`Create folder error: ${folderPath}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to create folder: ${error.message}`);
    }
  }

  /**
   * Delete folder and all its contents
   */
  async deleteFolder(folderPath: string): Promise<void> {
    try {
      const { files } = await this.listFiles(folderPath);
      
      if (files.length === 0) {
        return;
      }

      const fileKeys = files.map(file => file.key);
      
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove(fileKeys);

      if (error) {
        this.logger.error(`Failed to delete folder ${folderPath}:`, error);
        throw new BadRequestException(`Delete folder failed: ${error.message}`);
      }

      this.logger.log(`Folder deleted successfully: ${folderPath} (${files.length} files)`);

    } catch (error) {
      this.logger.error(`Delete folder error: ${folderPath}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to delete folder: ${error.message}`);
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    availableSpace?: number;
    usedSpace: number;
  }> {
    try {
      // Note: Supabase doesn't provide direct storage stats API
      // This implementation lists all files to calculate stats
      const { files } = await this.listFiles('', { limit: 10000 });
      
      const totalFiles = files.length;
      const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);

      return {
        totalFiles,
        totalSize,
        usedSpace: totalSize,
        // availableSpace not available from Supabase API
      };

    } catch (error) {
      this.logger.error('Failed to get storage stats:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        usedSpace: 0,
      };
    }
  }

  /**
   * Health check for Supabase Storage
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      // Test connection by listing files with limit 1
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .list('', { limit: 1 });

      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          healthy: false,
          responseTime,
          error: error.message,
        };
      }

      return {
        healthy: true,
        responseTime,
      };

    } catch (error) {
      return {
        healthy: false,
        responseTime: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  /**
   * Initialize bucket (create if doesn't exist)
   */
  private async initializeBucket(): Promise<void> {
    try {
      // Check if bucket exists
      const { data, error } = await this.supabase.storage.getBucket(this.bucketName);
      
      if (error && error.message.includes('not found')) {
        // Create bucket if it doesn't exist
        const { error: createError } = await this.supabase.storage.createBucket(this.bucketName, {
          public: true,
          allowedMimeTypes: undefined, // Allow all types
          fileSizeLimit: 1024 * 1024 * 100, // 100MB limit
        });

        if (createError) {
          this.logger.error(`Failed to create bucket ${this.bucketName}:`, createError);
          throw new Error(`Bucket creation failed: ${createError.message}`);
        }

        this.logger.log(`Bucket created successfully: ${this.bucketName}`);
      } else if (error) {
        this.logger.error(`Failed to check bucket ${this.bucketName}:`, error);
        throw new Error(`Bucket check failed: ${error.message}`);
      } else {
        this.logger.log(`Bucket exists: ${this.bucketName}`);
      }

    } catch (error) {
      this.logger.error('Bucket initialization failed:', error);
      throw error;
    }
  }
}
