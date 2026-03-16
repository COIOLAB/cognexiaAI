import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like, Between } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

import {
  FileRecord,
  FileStatus,
  FileAccessLevel,
  FileCategory,
  StorageProvider,
  FileSecurityInfo,
  FileStorageInfo,
  FileProcessingInfo,
} from '../entities/file-record.entity';
import { FileVersion } from '../entities/file-version.entity';
import { FilePermission } from '../entities/file-permission.entity';
import { User } from '../../rbac/entities/User.entity';

import { FileUploadService } from './file-upload.service';
import { FileValidationService } from './file-validation.service';
import { VirusScanningService } from './virus-scanning.service';
import { FileVersioningService } from './file-versioning.service';
import { FileCompressionService } from './file-compression.service';
import { FileEncryptionService } from './file-encryption.service';
import { FileThumbnailService } from './file-thumbnail.service';
import { FileAnalyticsService } from './file-analytics.service';
import { FileAuditService } from './file-audit.service';
import { StorageProviderFactory } from '../providers/storage-provider.factory';
import { FileUtilsService } from '../utils/file-utils.service';

export interface CreateFileDto {
  fileName: string;
  mimeType: string;
  fileSize: number;
  category?: FileCategory;
  accessLevel?: FileAccessLevel;
  description?: string;
  keywords?: string[];
  expiresAt?: Date;
  parentFileId?: string;
  storageProvider?: StorageProvider;
  encrypt?: boolean;
  compress?: boolean;
  generateThumbnail?: boolean;
  extractText?: boolean;
}

export interface FileFilters {
  fileName?: string;
  category?: FileCategory[];
  status?: FileStatus[];
  accessLevel?: FileAccessLevel[];
  ownerId?: string;
  mimeType?: string[];
  keywords?: string[];
  minSize?: number;
  maxSize?: number;
  dateFrom?: Date;
  dateTo?: Date;
  isDeleted?: boolean;
  isArchived?: boolean;
  hasExpiration?: boolean;
}

export interface FileStats {
  totalFiles: number;
  totalSize: number;
  byCategory: Record<FileCategory, number>;
  byStatus: Record<FileStatus, number>;
  byAccessLevel: Record<FileAccessLevel, number>;
  averageFileSize: number;
  mostCommonMimeType: string;
  oldestFile: Date;
  newestFile: Date;
  totalDownloads: number;
  totalViews: number;
}

export interface BulkOperation {
  operation: 'move' | 'copy' | 'delete' | 'archive' | 'updateAccess' | 'addTags' | 'removeTags';
  fileIds: string[];
  parameters?: any;
}

@Injectable()
export class FileManagementService {
  private readonly logger = new Logger(FileManagementService.name);

  constructor(
    @InjectRepository(FileRecord)
    private fileRepository: Repository<FileRecord>,
    @InjectRepository(FileVersion)
    private versionRepository: Repository<FileVersion>,
    @InjectRepository(FilePermission)
    private permissionRepository: Repository<FilePermission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectQueue('file-processing') private processingQueue: Queue,
    @InjectQueue('virus-scanning') private virusScanQueue: Queue,
    @InjectQueue('thumbnail-generation') private thumbnailQueue: Queue,
    @InjectQueue('file-compression') private compressionQueue: Queue,
    @InjectQueue('file-encryption') private encryptionQueue: Queue,
    @InjectQueue('file-cleanup') private cleanupQueue: Queue,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private uploadService: FileUploadService,
    private validationService: FileValidationService,
    private virusScanningService: VirusScanningService,
    private versioningService: FileVersioningService,
    private compressionService: FileCompressionService,
    private encryptionService: FileEncryptionService,
    private thumbnailService: FileThumbnailService,
    private analyticsService: FileAnalyticsService,
    private auditService: FileAuditService,
    private storageProviderFactory: StorageProviderFactory,
    private fileUtils: FileUtilsService,
  ) {}

  /**
   * Create a new file record
   */
  async createFile(dto: CreateFileDto, ownerId: string, tempFilePath?: string): Promise<FileRecord> {
    try {
      // Validate file
      await this.validationService.validateFile(dto);

      // Check for duplicate files
      let fileHash: string;
      if (tempFilePath) {
        fileHash = await this.fileUtils.calculateFileHash(tempFilePath);
        const existingFile = await this.findByHash(fileHash, ownerId);
        if (existingFile) {
          this.logger.log(`Duplicate file detected: ${fileHash}`);
          // Optionally, return existing file or create a version
          return existingFile;
        }
      }

      // Create file record
      const file = new FileRecord();
      file.fileName = dto.fileName;
      file.originalFileName = dto.fileName;
      file.fileExtension = path.extname(dto.fileName).toLowerCase();
      file.mimeType = dto.mimeType;
      file.fileSize = dto.fileSize;
      file.fileHash = fileHash || crypto.randomUUID();
      file.category = dto.category || this.categorizeFile(dto.mimeType);
      file.status = FileStatus.UPLOADING;
      file.accessLevel = dto.accessLevel || FileAccessLevel.PRIVATE;
      file.ownerId = ownerId;
      file.description = dto.description;
      file.keywords = dto.keywords;
      file.expiresAt = dto.expiresAt;
      file.parentFileId = dto.parentFileId;

      // Initialize security info
      file.securityInfo = {
        encrypted: dto.encrypt || false,
        checksumMD5: '',
        checksumSHA256: fileHash || '',
        virusScanStatus: 'pending',
        complianceFlags: [],
      };

      // Initialize storage info
      const provider = dto.storageProvider || this.getDefaultStorageProvider();
      file.storageInfo = {
        provider,
        key: this.generateStorageKey(file),
        compression: dto.compress || false,
        backupLocations: [],
      };

      // Initialize processing info
      file.processingInfo = {
        thumbnailGenerated: false,
        previewGenerated: false,
        textExtracted: false,
        ocrProcessed: false,
        metadataExtracted: false,
        processingErrors: [],
      };

      // Save file record
      const savedFile = await this.fileRepository.save(file);

      // Upload file to storage if temp file provided
      if (tempFilePath) {
        await this.uploadToStorage(savedFile, tempFilePath);
      }

      // Queue processing tasks
      await this.queueProcessingTasks(savedFile, {
        virusScan: true,
        generateThumbnail: dto.generateThumbnail,
        extractText: dto.extractText,
        compress: dto.compress,
        encrypt: dto.encrypt,
      });

      // Emit event
      this.eventEmitter.emit('file.created', {
        file: savedFile,
        ownerId,
      });

      // Create audit log
      await this.auditService.logAction(
        savedFile.id,
        'created',
        { dto },
        ownerId
      );

      this.logger.log(`File created: ${savedFile.id}`);
      return savedFile;

    } catch (error) {
      this.logger.error('Failed to create file', error);
      throw error;
    }
  }

  /**
   * Get files with filtering and pagination
   */
  async findMany(
    filters: FileFilters = {},
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
    userId?: string
  ): Promise<{
    files: FileRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const queryBuilder = this.fileRepository.createQueryBuilder('file')
        .leftJoinAndSelect('file.owner', 'owner')
        .leftJoinAndSelect('file.permissions', 'permissions');

      // Apply security filters
      if (userId) {
        queryBuilder.andWhere(
          '(file.ownerId = :userId OR file.accessLevel = :publicAccess OR permissions.userId = :userId)',
          { userId, publicAccess: FileAccessLevel.PUBLIC }
        );
      }

      // Apply filters
      if (filters.fileName) {
        queryBuilder.andWhere('file.fileName ILIKE :fileName', {
          fileName: `%${filters.fileName}%`,
        });
      }

      if (filters.category?.length) {
        queryBuilder.andWhere('file.category IN (:...categories)', {
          categories: filters.category,
        });
      }

      if (filters.status?.length) {
        queryBuilder.andWhere('file.status IN (:...statuses)', {
          statuses: filters.status,
        });
      }

      if (filters.accessLevel?.length) {
        queryBuilder.andWhere('file.accessLevel IN (:...accessLevels)', {
          accessLevels: filters.accessLevel,
        });
      }

      if (filters.ownerId) {
        queryBuilder.andWhere('file.ownerId = :ownerId', {
          ownerId: filters.ownerId,
        });
      }

      if (filters.mimeType?.length) {
        queryBuilder.andWhere('file.mimeType IN (:...mimeTypes)', {
          mimeTypes: filters.mimeType,
        });
      }

      if (filters.keywords?.length) {
        queryBuilder.andWhere('file.keywords && :keywords', {
          keywords: filters.keywords,
        });
      }

      if (filters.minSize) {
        queryBuilder.andWhere('file.fileSize >= :minSize', {
          minSize: filters.minSize,
        });
      }

      if (filters.maxSize) {
        queryBuilder.andWhere('file.fileSize <= :maxSize', {
          maxSize: filters.maxSize,
        });
      }

      if (filters.dateFrom) {
        queryBuilder.andWhere('file.createdAt >= :dateFrom', {
          dateFrom: filters.dateFrom,
        });
      }

      if (filters.dateTo) {
        queryBuilder.andWhere('file.createdAt <= :dateTo', {
          dateTo: filters.dateTo,
        });
      }

      if (filters.isDeleted !== undefined) {
        queryBuilder.andWhere('file.isDeleted = :isDeleted', {
          isDeleted: filters.isDeleted,
        });
      }

      if (filters.isArchived !== undefined) {
        queryBuilder.andWhere('file.isArchived = :isArchived', {
          isArchived: filters.isArchived,
        });
      }

      if (filters.hasExpiration !== undefined) {
        if (filters.hasExpiration) {
          queryBuilder.andWhere('file.expiresAt IS NOT NULL');
        } else {
          queryBuilder.andWhere('file.expiresAt IS NULL');
        }
      }

      // Add sorting
      queryBuilder.orderBy(`file.${sortBy}`, sortOrder);

      // Add pagination
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);

      // Execute query
      const [files, total] = await queryBuilder.getManyAndCount();

      return {
        files,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };

    } catch (error) {
      this.logger.error('Failed to fetch files', error);
      throw error;
    }
  }

  /**
   * Get file by ID
   */
  async findById(id: string, userId?: string): Promise<FileRecord> {
    try {
      const file = await this.fileRepository.findOne({
        where: { id },
        relations: ['owner', 'permissions', 'versions', 'metadata', 'tags'],
      });

      if (!file) {
        throw new NotFoundException('File not found');
      }

      // Check permissions
      if (userId && !file.hasPermission(userId, 'read')) {
        throw new ForbiddenException('Access denied');
      }

      // Mark as accessed
      file.markAsAccessed();
      await this.fileRepository.save(file);

      return file;

    } catch (error) {
      this.logger.error(`Failed to fetch file ${id}`, error);
      throw error;
    }
  }

  /**
   * Update file metadata
   */
  async updateFile(
    id: string,
    updates: Partial<CreateFileDto>,
    userId: string
  ): Promise<FileRecord> {
    try {
      const file = await this.findById(id, userId);

      // Check permissions
      if (!file.hasPermission(userId, 'write')) {
        throw new ForbiddenException('Write access denied');
      }

      // Apply updates
      if (updates.fileName) file.fileName = updates.fileName;
      if (updates.category) file.category = updates.category;
      if (updates.accessLevel) file.accessLevel = updates.accessLevel;
      if (updates.description !== undefined) file.description = updates.description;
      if (updates.keywords) file.keywords = updates.keywords;
      if (updates.expiresAt !== undefined) file.expiresAt = updates.expiresAt;

      file.lastModifiedAt = new Date();

      const updatedFile = await this.fileRepository.save(file);

      // Emit event
      this.eventEmitter.emit('file.updated', {
        file: updatedFile,
        updates,
        userId,
      });

      // Create audit log
      await this.auditService.logAction(id, 'updated', { updates }, userId);

      return updatedFile;

    } catch (error) {
      this.logger.error(`Failed to update file ${id}`, error);
      throw error;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(id: string, userId: string, permanent = false): Promise<void> {
    try {
      const file = await this.findById(id, userId);

      // Check permissions
      if (!file.hasPermission(userId, 'delete')) {
        throw new ForbiddenException('Delete access denied');
      }

      if (permanent) {
        // Permanent deletion - remove from storage and database
        await this.deleteFromStorage(file);
        await this.fileRepository.remove(file);
      } else {
        // Soft deletion
        file.markAsDeleted(userId, 'User deletion');
        await this.fileRepository.save(file);
      }

      // Emit event
      this.eventEmitter.emit('file.deleted', {
        file,
        userId,
        permanent,
      });

      // Create audit log
      await this.auditService.logAction(id, permanent ? 'permanently_deleted' : 'deleted', {}, userId);

      this.logger.log(`File ${permanent ? 'permanently ' : ''}deleted: ${id}`);

    } catch (error) {
      this.logger.error(`Failed to delete file ${id}`, error);
      throw error;
    }
  }

  /**
   * Restore deleted file
   */
  async restoreFile(id: string, userId: string): Promise<FileRecord> {
    try {
      const file = await this.fileRepository.findOne({
        where: { id, isDeleted: true },
        relations: ['owner', 'permissions'],
      });

      if (!file) {
        throw new NotFoundException('Deleted file not found');
      }

      // Check permissions
      if (!file.hasPermission(userId, 'write')) {
        throw new ForbiddenException('Restore access denied');
      }

      file.isDeleted = false;
      file.status = FileStatus.AVAILABLE;
      file.deletedAt = null;
      file.deletedBy = null;
      file.deletionReason = null;

      const restoredFile = await this.fileRepository.save(file);

      // Emit event
      this.eventEmitter.emit('file.restored', {
        file: restoredFile,
        userId,
      });

      // Create audit log
      await this.auditService.logAction(id, 'restored', {}, userId);

      return restoredFile;

    } catch (error) {
      this.logger.error(`Failed to restore file ${id}`, error);
      throw error;
    }
  }

  /**
   * Get file download URL
   */
  async getDownloadUrl(
    id: string,
    userId: string,
    expiryMinutes = 60
  ): Promise<{ url: string; expiresAt: Date }> {
    try {
      const file = await this.findById(id, userId);

      // Check permissions
      if (!file.hasPermission(userId, 'read')) {
        throw new ForbiddenException('Download access denied');
      }

      // Get storage provider
      const provider = this.storageProviderFactory.getProvider(file.storageInfo.provider);

      // Generate presigned URL
      const url = await provider.getPresignedUrl(
        file.storageInfo.key,
        expiryMinutes * 60,
        'download'
      );

      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

      // Mark as downloaded
      file.markAsDownloaded();
      await this.fileRepository.save(file);

      // Create audit log
      await this.auditService.logAction(id, 'download_url_generated', {}, userId);

      return { url, expiresAt };

    } catch (error) {
      this.logger.error(`Failed to generate download URL for file ${id}`, error);
      throw error;
    }
  }

  /**
   * Perform bulk operations on files
   */
  async bulkOperation(
    operation: BulkOperation,
    userId: string
  ): Promise<{
    success: number;
    failed: number;
    errors: Array<{ fileId: string; error: string }>;
  }> {
    try {
      const result = {
        success: 0,
        failed: 0,
        errors: [] as Array<{ fileId: string; error: string }>,
      };

      for (const fileId of operation.fileIds) {
        try {
          switch (operation.operation) {
            case 'delete':
              await this.deleteFile(fileId, userId, operation.parameters?.permanent);
              break;
            case 'archive':
              await this.archiveFile(fileId, userId);
              break;
            case 'updateAccess':
              await this.updateAccessLevel(fileId, operation.parameters.accessLevel, userId);
              break;
            case 'addTags':
              await this.addTags(fileId, operation.parameters.tags, userId);
              break;
            case 'removeTags':
              await this.removeTags(fileId, operation.parameters.tags, userId);
              break;
            default:
              throw new Error(`Unsupported operation: ${operation.operation}`);
          }
          result.success++;
        } catch (error) {
          result.failed++;
          result.errors.push({
            fileId,
            error: error.message,
          });
        }
      }

      // Create audit log
      await this.auditService.logAction(
        null,
        'bulk_operation',
        { operation, result },
        userId
      );

      return result;

    } catch (error) {
      this.logger.error('Bulk operation failed', error);
      throw error;
    }
  }

  /**
   * Get file statistics
   */
  async getStats(filters: FileFilters = {}): Promise<FileStats> {
    try {
      return await this.analyticsService.getFileStats(filters);
    } catch (error) {
      this.logger.error('Failed to get file stats', error);
      throw error;
    }
  }

  /**
   * Search files using full-text search
   */
  async searchFiles(
    query: string,
    filters: FileFilters = {},
    userId?: string,
    page = 1,
    limit = 20
  ): Promise<{
    files: FileRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const searchFilters = {
        ...filters,
        fileName: query, // Simple implementation - could be enhanced with full-text search
      };

      return await this.findMany(searchFilters, page, limit, 'createdAt', 'DESC', userId);

    } catch (error) {
      this.logger.error('File search failed', error);
      throw error;
    }
  }

  /**
   * Cleanup expired and old files (scheduled task)
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupExpiredFiles(): Promise<void> {
    try {
      const now = new Date();
      
      // Find expired files
      const expiredFiles = await this.fileRepository.find({
        where: {
          expiresAt: Between(new Date(0), now),
          isDeleted: false,
        },
      });

      for (const file of expiredFiles) {
        file.status = FileStatus.EXPIRED;
        file.markAsDeleted('system', 'File expired');
        await this.fileRepository.save(file);
      }

      // Find old deleted files for permanent deletion
      const retentionDays = this.configService.get('FILE_RETENTION_DAYS', 30);
      const deletionCutoff = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);
      
      const oldDeletedFiles = await this.fileRepository.find({
        where: {
          isDeleted: true,
          deletedAt: Between(new Date(0), deletionCutoff),
        },
      });

      for (const file of oldDeletedFiles) {
        await this.deleteFromStorage(file);
        await this.fileRepository.remove(file);
      }

      this.logger.log(
        `Cleaned up ${expiredFiles.length} expired files and ${oldDeletedFiles.length} old deleted files`
      );

    } catch (error) {
      this.logger.error('Failed to cleanup expired files', error);
    }
  }

  // Private helper methods
  private async findByHash(hash: string, ownerId: string): Promise<FileRecord | null> {
    return await this.fileRepository.findOne({
      where: { fileHash: hash, ownerId, isDeleted: false },
    });
  }

  private categorizeFile(mimeType: string): FileCategory {
    if (mimeType.startsWith('image/')) return FileCategory.IMAGE;
    if (mimeType.startsWith('video/')) return FileCategory.VIDEO;
    if (mimeType.startsWith('audio/')) return FileCategory.AUDIO;
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
      return FileCategory.DOCUMENT;
    }
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) {
      return FileCategory.SPREADSHEET;
    }
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      return FileCategory.PRESENTATION;
    }
    if (mimeType.includes('zip') || mimeType.includes('archive')) {
      return FileCategory.ARCHIVE;
    }
    return FileCategory.OTHER;
  }

  private getDefaultStorageProvider(): StorageProvider {
    return this.configService.get('DEFAULT_STORAGE_PROVIDER', StorageProvider.LOCAL_FILESYSTEM);
  }

  private generateStorageKey(file: FileRecord): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `files/${year}/${month}/${day}/${file.id}/${file.fileName}`;
  }

  private async uploadToStorage(file: FileRecord, tempFilePath: string): Promise<void> {
    try {
      const provider = this.storageProviderFactory.getProvider(file.storageInfo.provider);
      
      const uploadResult = await provider.uploadFile(
        file.storageInfo.key,
        tempFilePath,
        {
          mimeType: file.mimeType,
          metadata: {
            originalFileName: file.originalFileName,
            fileId: file.id,
            ownerId: file.ownerId,
          },
        }
      );

      // Update file with upload result
      file.storageInfo = { ...file.storageInfo, ...uploadResult };
      file.status = FileStatus.PROCESSING;
      
      await this.fileRepository.save(file);

    } catch (error) {
      file.status = FileStatus.CORRUPTED;
      await this.fileRepository.save(file);
      throw error;
    }
  }

  private async deleteFromStorage(file: FileRecord): Promise<void> {
    try {
      const provider = this.storageProviderFactory.getProvider(file.storageInfo.provider);
      await provider.deleteFile(file.storageInfo.key);
    } catch (error) {
      this.logger.error(`Failed to delete file from storage: ${file.id}`, error);
    }
  }

  private async queueProcessingTasks(
    file: FileRecord,
    options: {
      virusScan?: boolean;
      generateThumbnail?: boolean;
      extractText?: boolean;
      compress?: boolean;
      encrypt?: boolean;
    }
  ): Promise<void> {
    const jobData = { fileId: file.id };

    // Queue virus scan (always required)
    if (options.virusScan) {
      await this.virusScanQueue.add('scan-file', jobData);
    }

    // Queue thumbnail generation
    if (options.generateThumbnail && file.canGenerateThumbnail()) {
      await this.thumbnailQueue.add('generate-thumbnail', jobData);
    }

    // Queue compression
    if (options.compress && file.canBeCompressed()) {
      await this.compressionQueue.add('compress-file', jobData);
    }

    // Queue encryption
    if (options.encrypt) {
      await this.encryptionQueue.add('encrypt-file', jobData);
    }

    // Queue general processing
    await this.processingQueue.add('process-file', jobData);
  }

  private async archiveFile(fileId: string, userId: string): Promise<void> {
    const file = await this.findById(fileId, userId);
    if (!file.hasPermission(userId, 'write')) {
      throw new ForbiddenException('Archive access denied');
    }

    file.isArchived = true;
    file.status = FileStatus.ARCHIVED;
    await this.fileRepository.save(file);
  }

  private async updateAccessLevel(
    fileId: string,
    accessLevel: FileAccessLevel,
    userId: string
  ): Promise<void> {
    const file = await this.findById(fileId, userId);
    if (!file.hasPermission(userId, 'write')) {
      throw new ForbiddenException('Access level update denied');
    }

    file.accessLevel = accessLevel;
    await this.fileRepository.save(file);
  }

  private async addTags(fileId: string, tags: string[], userId: string): Promise<void> {
    const file = await this.findById(fileId, userId);
    if (!file.hasPermission(userId, 'write')) {
      throw new ForbiddenException('Tag modification denied');
    }

    tags.forEach(tag => file.addTag(tag));
    await this.fileRepository.save(file);
  }

  private async removeTags(fileId: string, tags: string[], userId: string): Promise<void> {
    const file = await this.findById(fileId, userId);
    if (!file.hasPermission(userId, 'write')) {
      throw new ForbiddenException('Tag modification denied');
    }

    tags.forEach(tag => file.removeTag(tag));
    await this.fileRepository.save(file);
  }
}
