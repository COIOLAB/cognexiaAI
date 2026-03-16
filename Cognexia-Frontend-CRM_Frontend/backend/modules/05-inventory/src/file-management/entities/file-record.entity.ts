import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../rbac/entities/User.entity';
import { FileVersion } from './file-version.entity';
import { FilePermission } from './file-permission.entity';
import { FileMetadata } from './file-metadata.entity';
import { FileAuditLog } from './file-audit-log.entity';
import { FileShare } from './file-share.entity';
import { FileTag } from './file-tag.entity';

export enum FileStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  SCANNING = 'scanning',
  AVAILABLE = 'available',
  QUARANTINED = 'quarantined',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
  CORRUPTED = 'corrupted',
  EXPIRED = 'expired',
}

export enum FileAccessLevel {
  PUBLIC = 'public',
  PRIVATE = 'private',
  RESTRICTED = 'restricted',
  CONFIDENTIAL = 'confidential',
  SECRET = 'secret',
  TOP_SECRET = 'top_secret',
}

export enum FileCategory {
  DOCUMENT = 'document',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  ARCHIVE = 'archive',
  SPREADSHEET = 'spreadsheet',
  PRESENTATION = 'presentation',
  CODE = 'code',
  DATA = 'data',
  BACKUP = 'backup',
  TEMPLATE = 'template',
  REPORT = 'report',
  CERTIFICATE = 'certificate',
  OTHER = 'other',
}

export enum StorageProvider {
  AWS_S3 = 'aws_s3',
  AZURE_BLOB = 'azure_blob',
  GOOGLE_CLOUD = 'google_cloud',
  LOCAL_FILESYSTEM = 'local_filesystem',
  MINIO = 'minio',
  HYBRID = 'hybrid',
}

export interface FileSecurityInfo {
  encrypted: boolean;
  encryptionAlgorithm?: string;
  keyId?: string;
  digitalSignature?: string;
  checksumMD5: string;
  checksumSHA256: string;
  virusScanStatus: 'pending' | 'clean' | 'infected' | 'suspicious' | 'failed';
  virusScanDate?: Date;
  virusScanEngine?: string;
  quarantineReason?: string;
  dlpClassification?: string;
  complianceFlags: string[];
}

export interface FileStorageInfo {
  provider: StorageProvider;
  bucket?: string;
  container?: string;
  key: string;
  region?: string;
  storageClass?: string;
  redundancy?: string;
  compression: boolean;
  compressionRatio?: number;
  backupLocations: string[];
  cdnUrl?: string;
  presignedUrl?: string;
  presignedUrlExpiry?: Date;
}

export interface FileProcessingInfo {
  thumbnailGenerated: boolean;
  thumbnailUrl?: string;
  previewGenerated: boolean;
  previewUrl?: string;
  textExtracted: boolean;
  extractedText?: string;
  ocrProcessed: boolean;
  metadataExtracted: boolean;
  processedAt?: Date;
  processingDuration?: number;
  processingErrors: string[];
}

@Entity('file_records')
@Index(['ownerId'])
@Index(['fileName'])
@Index(['mimeType'])
@Index(['status'])
@Index(['category'])
@Index(['accessLevel'])
@Index(['createdAt'])
@Index(['fileHash'])
@Index(['parentFileId'])
export class FileRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileName: string;

  @Column()
  originalFileName: string;

  @Column()
  fileExtension: string;

  @Column()
  mimeType: string;

  @Column('bigint')
  fileSize: number;

  @Column()
  fileHash: string; // SHA-256 hash for deduplication

  @Column({
    type: 'enum',
    enum: FileCategory,
    default: FileCategory.OTHER,
  })
  category: FileCategory;

  @Column({
    type: 'enum',
    enum: FileStatus,
    default: FileStatus.UPLOADING,
  })
  status: FileStatus;

  @Column({
    type: 'enum',
    enum: FileAccessLevel,
    default: FileAccessLevel.PRIVATE,
  })
  accessLevel: FileAccessLevel;

  @Column()
  ownerId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ nullable: true })
  parentFileId?: string;

  @ManyToOne(() => FileRecord, { nullable: true })
  @JoinColumn({ name: 'parentFileId' })
  parentFile?: FileRecord;

  @OneToMany(() => FileRecord, file => file.parentFile)
  childFiles: FileRecord[];

  @Column({ type: 'json' })
  storageInfo: FileStorageInfo;

  @Column({ type: 'json' })
  securityInfo: FileSecurityInfo;

  @Column({ type: 'json' })
  processingInfo: FileProcessingInfo;

  @OneToMany(() => FileVersion, version => version.fileRecord, { cascade: true })
  versions: FileVersion[];

  @OneToOne(() => FileMetadata, metadata => metadata.fileRecord, { cascade: true })
  metadata: FileMetadata;

  @OneToMany(() => FilePermission, permission => permission.fileRecord, { cascade: true })
  permissions: FilePermission[];

  @OneToMany(() => FileAuditLog, auditLog => auditLog.fileRecord, { cascade: true })
  auditLogs: FileAuditLog[];

  @OneToMany(() => FileShare, share => share.fileRecord, { cascade: true })
  shares: FileShare[];

  @OneToMany(() => FileTag, tag => tag.fileRecord, { cascade: true })
  tags: FileTag[];

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column({ type: 'simple-array', nullable: true })
  keywords?: string[];

  @Column({ default: 1 })
  currentVersion: number;

  @Column({ default: 0 })
  downloadCount: number;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastAccessedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastModifiedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ default: false })
  isFavorite: boolean;

  @Column({ default: false })
  isArchived: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @Column({ nullable: true })
  deletedBy?: string;

  @Column({ nullable: true, type: 'text' })
  deletionReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  isImage(): boolean {
    return this.mimeType.startsWith('image/');
  }

  isVideo(): boolean {
    return this.mimeType.startsWith('video/');
  }

  isAudio(): boolean {
    return this.mimeType.startsWith('audio/');
  }

  isDocument(): boolean {
    const documentMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
      'application/rtf',
    ];
    return documentMimes.includes(this.mimeType);
  }

  isSpreadsheet(): boolean {
    const spreadsheetMimes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ];
    return spreadsheetMimes.includes(this.mimeType);
  }

  isArchive(): boolean {
    const archiveMimes = [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-tar',
      'application/gzip',
      'application/x-7z-compressed',
    ];
    return archiveMimes.includes(this.mimeType);
  }

  canBeCompressed(): boolean {
    // Don't compress already compressed formats
    return !this.isArchive() && 
           !this.mimeType.includes('compressed') &&
           this.fileSize > 1024; // Only compress files > 1KB
  }

  requiresVirusScan(): boolean {
    return this.securityInfo.virusScanStatus === 'pending' ||
           this.securityInfo.virusScanStatus === 'failed';
  }

  isQuarantined(): boolean {
    return this.status === FileStatus.QUARANTINED;
  }

  canGenerateThumbnail(): boolean {
    return this.isImage() || this.isVideo() || this.mimeType === 'application/pdf';
  }

  getFileSizeFormatted(): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (this.fileSize === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
    return Math.round((this.fileSize / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  getFileAge(): number {
    return Date.now() - this.createdAt.getTime();
  }

  getFileAgeDays(): number {
    return Math.floor(this.getFileAge() / (1000 * 60 * 60 * 24));
  }

  markAsAccessed(): void {
    this.lastAccessedAt = new Date();
    this.viewCount++;
  }

  markAsDownloaded(): void {
    this.downloadCount++;
    this.lastAccessedAt = new Date();
  }

  markAsDeleted(deletedBy: string, reason?: string): void {
    this.isDeleted = true;
    this.status = FileStatus.DELETED;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
    this.deletionReason = reason;
  }

  markAsQuarantined(reason: string): void {
    this.status = FileStatus.QUARANTINED;
    this.securityInfo.quarantineReason = reason;
  }

  updateSecurityInfo(info: Partial<FileSecurityInfo>): void {
    this.securityInfo = { ...this.securityInfo, ...info };
  }

  updateProcessingInfo(info: Partial<FileProcessingInfo>): void {
    this.processingInfo = { ...this.processingInfo, ...info };
  }

  addTag(tagName: string): void {
    if (!this.keywords) {
      this.keywords = [];
    }
    if (!this.keywords.includes(tagName)) {
      this.keywords.push(tagName);
    }
  }

  removeTag(tagName: string): void {
    if (this.keywords) {
      this.keywords = this.keywords.filter(tag => tag !== tagName);
    }
  }

  hasPermission(userId: string, permission: 'read' | 'write' | 'delete' | 'share'): boolean {
    // Owner has all permissions
    if (this.ownerId === userId) {
      return true;
    }

    // Check explicit permissions
    const userPermission = this.permissions?.find(p => p.userId === userId);
    if (userPermission) {
      switch (permission) {
        case 'read':
          return userPermission.canRead;
        case 'write':
          return userPermission.canWrite;
        case 'delete':
          return userPermission.canDelete;
        case 'share':
          return userPermission.canShare;
      }
    }

    // Check public access
    if (this.accessLevel === FileAccessLevel.PUBLIC && permission === 'read') {
      return true;
    }

    return false;
  }

  toResponseObject(includeSecureInfo = false): any {
    const response = {
      id: this.id,
      fileName: this.fileName,
      originalFileName: this.originalFileName,
      fileExtension: this.fileExtension,
      mimeType: this.mimeType,
      fileSize: this.fileSize,
      fileSizeFormatted: this.getFileSizeFormatted(),
      category: this.category,
      status: this.status,
      accessLevel: this.accessLevel,
      description: this.description,
      keywords: this.keywords,
      currentVersion: this.currentVersion,
      downloadCount: this.downloadCount,
      viewCount: this.viewCount,
      lastAccessedAt: this.lastAccessedAt,
      lastModifiedAt: this.lastModifiedAt,
      expiresAt: this.expiresAt,
      isPinned: this.isPinned,
      isFavorite: this.isFavorite,
      isArchived: this.isArchived,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      processingInfo: {
        thumbnailGenerated: this.processingInfo.thumbnailGenerated,
        thumbnailUrl: this.processingInfo.thumbnailUrl,
        previewGenerated: this.processingInfo.previewGenerated,
        previewUrl: this.processingInfo.previewUrl,
      },
      owner: this.owner ? {
        id: this.owner.id,
        firstName: this.owner.firstName,
        lastName: this.owner.lastName,
        email: this.owner.email,
      } : null,
    };

    if (includeSecureInfo) {
      response['securityInfo'] = this.securityInfo;
      response['storageInfo'] = this.storageInfo;
      response['fileHash'] = this.fileHash;
    }

    return response;
  }
}
