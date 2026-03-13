import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { MulterModule } from '@nestjs/platform-express';

// Services
import { FileManagementService } from './services/file-management.service';
import { FileUploadService } from './services/file-upload.service';
import { FileValidationService } from './services/file-validation.service';
import { VirusScanningService } from './services/virus-scanning.service';
import { FileVersioningService } from './services/file-versioning.service';
import { FileCompressionService } from './services/file-compression.service';
import { FileEncryptionService } from './services/file-encryption.service';
import { FileThumbnailService } from './services/file-thumbnail.service';
import { FileAnalyticsService } from './services/file-analytics.service';
import { FileAuditService } from './services/file-audit.service';
import { FileCleanupService } from './services/file-cleanup.service';

// Storage Providers
import { StorageProviderFactory } from './providers/storage-provider.factory';
import { AWSS3Provider } from './providers/aws-s3.provider';
import { AzureBlobProvider } from './providers/azure-blob.provider';
import { GoogleCloudProvider } from './providers/google-cloud.provider';
import { LocalFileSystemProvider } from './providers/local-filesystem.provider';
import { MinIOProvider } from './providers/minio.provider';

// Controllers
import { FileUploadController } from './controllers/file-upload.controller';
import { FileManagementController } from './controllers/file-management.controller';
import { FileDownloadController } from './controllers/file-download.controller';

// Entities
import { FileRecord } from './entities/file-record.entity';
import { FileVersion } from './entities/file-version.entity';
import { FilePermission } from './entities/file-permission.entity';
import { FileAuditLog } from './entities/file-audit-log.entity';
import { FileMetadata } from './entities/file-metadata.entity';
import { FileShare } from './entities/file-share.entity';
import { FileTag } from './entities/file-tag.entity';

// Processors
import { FileProcessingProcessor } from './processors/file-processing.processor';
import { VirusScanProcessor } from './processors/virus-scan.processor';
import { ThumbnailProcessor } from './processors/thumbnail.processor';
import { CompressionProcessor } from './processors/compression.processor';
import { EncryptionProcessor } from './processors/encryption.processor';

// Guards and Interceptors
import { FileAccessGuard } from './guards/file-access.guard';
import { FileUploadInterceptor } from './interceptors/file-upload.interceptor';
import { FileSizeInterceptor } from './interceptors/file-size.interceptor';
import { FileTypeInterceptor } from './interceptors/file-type.interceptor';

// Validators
import { FileValidator } from './validators/file.validator';
import { ImageValidator } from './validators/image.validator';
import { DocumentValidator } from './validators/document.validator';
import { VideoValidator } from './validators/video.validator';
import { AudioValidator } from './validators/audio.validator';

// Event Listeners
import { FileEventListener } from './listeners/file-event.listener';

// Utilities
import { FileUtilsService } from './utils/file-utils.service';
import { MimeTypeService } from './utils/mime-type.service';
import { FileHashService } from './utils/file-hash.service';

@Module({
  imports: [
    ConfigModule,
    EventEmitterModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      FileRecord,
      FileVersion,
      FilePermission,
      FileAuditLog,
      FileMetadata,
      FileShare,
      FileTag,
    ]),
    BullModule.registerQueue(
      { name: 'file-processing' },
      { name: 'virus-scanning' },
      { name: 'thumbnail-generation' },
      { name: 'file-compression' },
      { name: 'file-encryption' },
      { name: 'file-cleanup' },
    ),
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: './uploads/temp',
        limits: {
          fileSize: 500 * 1024 * 1024, // 500MB
          files: 10,
        },
      }),
    }),
  ],
  controllers: [
    FileUploadController,
    FileManagementController,
    FileDownloadController,
  ],
  providers: [
    // Core Services
    FileManagementService,
    FileUploadService,
    FileValidationService,
    VirusScanningService,
    FileVersioningService,
    FileCompressionService,
    FileEncryptionService,
    FileThumbnailService,
    FileAnalyticsService,
    FileAuditService,
    FileCleanupService,

    // Storage Providers
    StorageProviderFactory,
    AWSS3Provider,
    AzureBlobProvider,
    GoogleCloudProvider,
    LocalFileSystemProvider,
    MinIOProvider,

    // Queue Processors
    FileProcessingProcessor,
    VirusScanProcessor,
    ThumbnailProcessor,
    CompressionProcessor,
    EncryptionProcessor,

    // Guards and Interceptors
    FileAccessGuard,
    FileUploadInterceptor,
    FileSizeInterceptor,
    FileTypeInterceptor,

    // Validators
    FileValidator,
    ImageValidator,
    DocumentValidator,
    VideoValidator,
    AudioValidator,

    // Event Listeners
    FileEventListener,

    // Utilities
    FileUtilsService,
    MimeTypeService,
    FileHashService,
  ],
  exports: [
    FileManagementService,
    FileUploadService,
    FileValidationService,
    VirusScanningService,
    FileVersioningService,
    FileCompressionService,
    FileEncryptionService,
    FileThumbnailService,
    FileAnalyticsService,
    StorageProviderFactory,
    FileUtilsService,
  ],
})
export class FileManagementModule {}
