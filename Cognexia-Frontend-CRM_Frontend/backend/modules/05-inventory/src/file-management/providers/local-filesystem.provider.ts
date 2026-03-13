import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageProviderInterface } from './storage-provider.factory';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class LocalFileSystemProvider implements StorageProviderInterface {
  private readonly logger = new Logger(LocalFileSystemProvider.name);
  private readonly basePath: string;
  private readonly publicUrl?: string;

  constructor(private configService: ConfigService) {
    this.basePath = this.configService.get<string>('LOCAL_STORAGE_PATH', './storage');
    this.publicUrl = this.configService.get<string>('LOCAL_STORAGE_PUBLIC_URL');
    
    // Ensure base directory exists
    this.initializeStorage().catch(error => {
      this.logger.error('Failed to initialize local storage', error);
    });
  }

  /**
   * Upload file to local filesystem
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
      const targetPath = path.join(this.basePath, key);
      const targetDir = path.dirname(targetPath);
      
      // Ensure directory exists
      await fs.mkdir(targetDir, { recursive: true });
      
      // Check if file exists and upsert is false
      if (!options.upsert) {
        try {
          await fs.access(targetPath);
          throw new BadRequestException(`File already exists: ${key}`);
        } catch (error) {
          // File doesn't exist, continue with upload
          if (error.code !== 'ENOENT') {
            throw error;
          }
        }
      }

      // Copy file to target location
      await fs.copyFile(filePath, targetPath);
      
      // Get file stats
      const stats = await fs.stat(targetPath);
      
      // Generate ETag (file hash)
      const fileBuffer = await fs.readFile(targetPath);
      const etag = crypto.createHash('md5').update(fileBuffer).digest('hex');
      
      // Store metadata if provided
      if (options.metadata) {
        await this.storeMetadata(key, {
          ...options.metadata,
          mimeType: options.mimeType,
          cacheControl: options.cacheControl,
        });
      }

      const url = this.publicUrl ? `${this.publicUrl}/${key}` : undefined;

      return {
        url,
        key,
        size: stats.size,
        etag,
        lastModified: stats.mtime,
      };

    } catch (error) {
      this.logger.error(`Upload error for file ${key}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Download file from local filesystem
   */
  async downloadFile(key: string, downloadPath: string): Promise<void> {
    try {
      const sourcePath = path.join(this.basePath, key);
      
      // Check if source file exists
      try {
        await fs.access(sourcePath);
      } catch (error) {
        throw new BadRequestException(`File not found: ${key}`);
      }

      // Ensure download directory exists
      const downloadDir = path.dirname(downloadPath);
      await fs.mkdir(downloadDir, { recursive: true });

      // Copy file to download location
      await fs.copyFile(sourcePath, downloadPath);
      
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
   * Delete file from local filesystem
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const filePath = path.join(this.basePath, key);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (error) {
        throw new BadRequestException(`File not found: ${key}`);
      }

      // Delete file
      await fs.unlink(filePath);
      
      // Delete metadata if exists
      await this.deleteMetadata(key);
      
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
      const filePath = path.join(this.basePath, key);
      
      try {
        const stats = await fs.stat(filePath);
        
        // Generate ETag
        const fileBuffer = await fs.readFile(filePath);
        const etag = crypto.createHash('md5').update(fileBuffer).digest('hex');
        
        // Load metadata
        const metadata = await this.loadMetadata(key);

        return {
          exists: true,
          size: stats.size,
          lastModified: stats.mtime,
          etag,
          metadata,
        };

      } catch (error) {
        if (error.code === 'ENOENT') {
          return { exists: false };
        }
        throw error;
      }

    } catch (error) {
      this.logger.error(`Get file info error for ${key}:`, error);
      return { exists: false };
    }
  }

  /**
   * Get presigned URL (not applicable for local filesystem, returns file path)
   */
  async getPresignedUrl(
    key: string,
    expiresIn: number,
    operation: 'upload' | 'download'
  ): Promise<string> {
    try {
      if (this.publicUrl) {
        return `${this.publicUrl}/${key}`;
      }
      
      // Return file path if no public URL is configured
      return path.join(this.basePath, key);

    } catch (error) {
      this.logger.error(`Presigned URL error for ${key}:`, error);
      throw new InternalServerErrorException(`Failed to generate URL: ${error.message}`);
    }
  }

  /**
   * Copy file within local filesystem
   */
  async copyFile(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      const sourcePath = path.join(this.basePath, sourceKey);
      const destinationPath = path.join(this.basePath, destinationKey);
      const destinationDir = path.dirname(destinationPath);
      
      // Check if source file exists
      try {
        await fs.access(sourcePath);
      } catch (error) {
        throw new BadRequestException(`Source file not found: ${sourceKey}`);
      }

      // Ensure destination directory exists
      await fs.mkdir(destinationDir, { recursive: true });

      // Copy file
      await fs.copyFile(sourcePath, destinationPath);
      
      // Copy metadata
      const metadata = await this.loadMetadata(sourceKey);
      if (metadata) {
        await this.storeMetadata(destinationKey, metadata);
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
   * Move file within local filesystem
   */
  async moveFile(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      const sourcePath = path.join(this.basePath, sourceKey);
      const destinationPath = path.join(this.basePath, destinationKey);
      const destinationDir = path.dirname(destinationPath);
      
      // Check if source file exists
      try {
        await fs.access(sourcePath);
      } catch (error) {
        throw new BadRequestException(`Source file not found: ${sourceKey}`);
      }

      // Ensure destination directory exists
      await fs.mkdir(destinationDir, { recursive: true });

      // Move file
      await fs.rename(sourcePath, destinationPath);
      
      // Move metadata
      const metadata = await this.loadMetadata(sourceKey);
      if (metadata) {
        await this.storeMetadata(destinationKey, metadata);
        await this.deleteMetadata(sourceKey);
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
   * List files in local filesystem
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
      const searchPath = prefix ? path.join(this.basePath, prefix) : this.basePath;
      const files = await this.walkDirectory(searchPath, prefix);
      
      // Sort files
      const sortBy = options.sortBy || 'name';
      const sortOrder = options.sortOrder || 'asc';
      
      files.sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'created_at':
          case 'updated_at':
            comparison = a.lastModified.getTime() - b.lastModified.getTime();
            break;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });

      // Apply pagination
      const offset = options.offset || 0;
      const limit = options.limit || 100;
      const paginatedFiles = files.slice(offset, offset + limit);
      const hasMore = files.length > offset + limit;
      const nextOffset = hasMore ? offset + limit : undefined;

      return {
        files: paginatedFiles,
        hasMore,
        nextOffset,
      };

    } catch (error) {
      this.logger.error(`List files error with prefix ${prefix}:`, error);
      throw new InternalServerErrorException(`Failed to list files: ${error.message}`);
    }
  }

  /**
   * Create folder in local filesystem
   */
  async createFolder(folderPath: string): Promise<void> {
    try {
      const fullPath = path.join(this.basePath, folderPath);
      await fs.mkdir(fullPath, { recursive: true });
      
      this.logger.log(`Folder created successfully: ${folderPath}`);

    } catch (error) {
      this.logger.error(`Create folder error: ${folderPath}:`, error);
      throw new InternalServerErrorException(`Failed to create folder: ${error.message}`);
    }
  }

  /**
   * Delete folder and all its contents
   */
  async deleteFolder(folderPath: string): Promise<void> {
    try {
      const fullPath = path.join(this.basePath, folderPath);
      
      // Check if folder exists
      try {
        await fs.access(fullPath);
      } catch (error) {
        throw new BadRequestException(`Folder not found: ${folderPath}`);
      }

      // Delete folder recursively
      await fs.rm(fullPath, { recursive: true, force: true });
      
      this.logger.log(`Folder deleted successfully: ${folderPath}`);

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
      const files = await this.walkDirectory(this.basePath);
      
      const totalFiles = files.length;
      const usedSpace = files.reduce((sum, file) => sum + file.size, 0);

      // Get available space (Unix/Linux only)
      let availableSpace: number | undefined;
      try {
        const stats = await fs.statfs(this.basePath);
        availableSpace = stats.bavail * stats.bsize;
      } catch (error) {
        // statfs not available on all platforms
        this.logger.warn('Unable to get available space:', error.message);
      }

      return {
        totalFiles,
        totalSize: usedSpace,
        usedSpace,
        availableSpace,
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
   * Health check for local filesystem
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      // Test by accessing base directory
      await fs.access(this.basePath);
      
      const responseTime = Date.now() - startTime;
      
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
   * Initialize local storage
   */
  private async initializeStorage(): Promise<void> {
    try {
      await fs.mkdir(this.basePath, { recursive: true });
      await fs.mkdir(path.join(this.basePath, '.metadata'), { recursive: true });
      
      this.logger.log(`Local storage initialized: ${this.basePath}`);

    } catch (error) {
      this.logger.error('Local storage initialization failed:', error);
      throw error;
    }
  }

  /**
   * Walk directory recursively
   */
  private async walkDirectory(
    dirPath: string,
    prefix?: string
  ): Promise<Array<{
    name: string;
    key: string;
    size: number;
    lastModified: Date;
    metadata?: Record<string, any>;
  }>> {
    const results: Array<{
      name: string;
      key: string;
      size: number;
      lastModified: Date;
      metadata?: Record<string, any>;
    }> = [];

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(this.basePath, fullPath);
        
        // Skip metadata directory
        if (relativePath.startsWith('.metadata')) {
          continue;
        }

        if (entry.isFile()) {
          const stats = await fs.stat(fullPath);
          const metadata = await this.loadMetadata(relativePath);
          
          results.push({
            name: entry.name,
            key: relativePath.replace(/\\/g, '/'), // Normalize path separators
            size: stats.size,
            lastModified: stats.mtime,
            metadata,
          });
          
        } else if (entry.isDirectory()) {
          const subResults = await this.walkDirectory(fullPath, prefix);
          results.push(...subResults);
        }
      }

    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.logger.error(`Error walking directory ${dirPath}:`, error);
      }
    }

    return results;
  }

  /**
   * Store metadata for a file
   */
  private async storeMetadata(key: string, metadata: Record<string, any>): Promise<void> {
    try {
      const metadataPath = this.getMetadataPath(key);
      const metadataDir = path.dirname(metadataPath);
      
      await fs.mkdir(metadataDir, { recursive: true });
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    } catch (error) {
      this.logger.warn(`Failed to store metadata for ${key}:`, error);
    }
  }

  /**
   * Load metadata for a file
   */
  private async loadMetadata(key: string): Promise<Record<string, any> | undefined> {
    try {
      const metadataPath = this.getMetadataPath(key);
      const metadataContent = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(metadataContent);

    } catch (error) {
      // Metadata file doesn't exist or is invalid
      return undefined;
    }
  }

  /**
   * Delete metadata for a file
   */
  private async deleteMetadata(key: string): Promise<void> {
    try {
      const metadataPath = this.getMetadataPath(key);
      await fs.unlink(metadataPath);

    } catch (error) {
      // Metadata file doesn't exist
    }
  }

  /**
   * Get metadata file path for a key
   */
  private getMetadataPath(key: string): string {
    const metadataKey = key.replace(/[/\\]/g, '_') + '.json';
    return path.join(this.basePath, '.metadata', metadataKey);
  }
}
