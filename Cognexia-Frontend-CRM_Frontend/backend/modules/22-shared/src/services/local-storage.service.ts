import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);

export interface FileMetadata {
  id: string;
  originalName: string;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  uploadedAt: Date;
  category: 'upload' | 'document' | 'image' | 'report' | 'backup';
}

export interface ImageProcessingOptions {
  resize?: { width?: number; height?: number };
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  thumbnail?: boolean;
}

@Injectable()
export class LocalStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly basePath: string;
  private readonly paths: Record<string, string>;

  constructor(private readonly configService: ConfigService) {
    this.basePath = process.cwd();
    this.paths = {
      uploads: this.configService.get<string>('FILE_UPLOAD_PATH', './storage/uploads'),
      documents: this.configService.get<string>('FILE_DOCUMENTS_PATH', './storage/documents'),
      images: this.configService.get<string>('FILE_IMAGES_PATH', './storage/images'),
      reports: this.configService.get<string>('FILE_REPORTS_PATH', './storage/reports'),
      backups: this.configService.get<string>('FILE_BACKUPS_PATH', './storage/backups'),
    };
    
    this.initializeDirectories();
  }

  private async initializeDirectories(): Promise<void> {
    for (const [category, relativePath] of Object.entries(this.paths)) {
      const fullPath = path.resolve(this.basePath, relativePath);
      try {
        await access(fullPath);
      } catch {
        await mkdir(fullPath, { recursive: true });
        this.logger.log(`Created directory: ${fullPath}`);
      }
    }
  }

  /**
   * Store a file in the local storage system
   */
  async storeFile(
    buffer: Buffer,
    originalName: string,
    mimetype: string,
    category: FileMetadata['category'] = 'upload',
    options?: ImageProcessingOptions
  ): Promise<FileMetadata> {
    const id = uuidv4();
    const ext = path.extname(originalName);
    const filename = `${id}${ext}`;
    const relativePath = this.paths[category];
    const fullPath = path.resolve(this.basePath, relativePath, filename);

    let processedBuffer = buffer;

    // Process images if needed
    if (mimetype.startsWith('image/') && options) {
      processedBuffer = await this.processImage(buffer, options);
    }

    await writeFile(fullPath, processedBuffer);

    const metadata: FileMetadata = {
      id,
      originalName,
      filename,
      path: path.join(relativePath, filename),
      size: processedBuffer.length,
      mimetype,
      uploadedAt: new Date(),
      category,
    };

    // Create thumbnail for images
    if (mimetype.startsWith('image/') && this.configService.get<boolean>('IMAGE_RESIZE_ENABLED', true)) {
      await this.createThumbnail(processedBuffer, relativePath, id, ext);
    }

    this.logger.log(`File stored successfully: ${filename} (${this.formatFileSize(metadata.size)})`);
    return metadata;
  }

  /**
   * Retrieve a file from local storage
   */
  async getFile(filePath: string): Promise<Buffer> {
    const fullPath = path.resolve(this.basePath, filePath);
    return await readFile(fullPath);
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(filePath: string): Promise<{ size: number; exists: boolean }> {
    const fullPath = path.resolve(this.basePath, filePath);
    try {
      const stats = await fs.promises.stat(fullPath);
      return { size: stats.size, exists: true };
    } catch {
      return { size: 0, exists: false };
    }
  }

  /**
   * Delete a file from local storage
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.resolve(this.basePath, filePath);
      await unlink(fullPath);
      
      // Also delete thumbnail if exists
      const thumbnailPath = this.getThumbnailPath(filePath);
      try {
        const thumbnailFullPath = path.resolve(this.basePath, thumbnailPath);
        await unlink(thumbnailFullPath);
      } catch {
        // Thumbnail might not exist, ignore
      }
      
      this.logger.log(`File deleted successfully: ${filePath}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete file: ${filePath}`, error);
      return false;
    }
  }

  /**
   * Process images with Sharp
   */
  private async processImage(buffer: Buffer, options: ImageProcessingOptions): Promise<Buffer> {
    let sharpInstance = sharp(buffer);

    if (options.resize) {
      sharpInstance = sharpInstance.resize(options.resize.width, options.resize.height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    if (options.quality) {
      sharpInstance = sharpInstance.jpeg({ quality: options.quality });
    }

    if (options.format) {
      switch (options.format) {
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg();
          break;
        case 'png':
          sharpInstance = sharpInstance.png();
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp();
          break;
      }
    }

    return await sharpInstance.toBuffer();
  }

  /**
   * Create thumbnail for images
   */
  private async createThumbnail(buffer: Buffer, relativePath: string, id: string, ext: string): Promise<void> {
    try {
      const thumbnailSize = this.configService.get<number>('IMAGE_THUMBNAIL_SIZE', 200);
      const quality = this.configService.get<number>('IMAGE_QUALITY', 85);
      
      const thumbnailBuffer = await sharp(buffer)
        .resize(thumbnailSize, thumbnailSize, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality })
        .toBuffer();

      const thumbnailFilename = `${id}_thumb.jpg`;
      const thumbnailPath = path.resolve(this.basePath, relativePath, thumbnailFilename);
      
      await writeFile(thumbnailPath, thumbnailBuffer);
      this.logger.debug(`Thumbnail created: ${thumbnailFilename}`);
    } catch (error) {
      this.logger.error(`Failed to create thumbnail for ${id}`, error);
    }
  }

  /**
   * Get thumbnail path
   */
  getThumbnailPath(originalPath: string): string {
    const dir = path.dirname(originalPath);
    const basename = path.basename(originalPath, path.extname(originalPath));
    return path.join(dir, `${basename}_thumb.jpg`);
  }

  /**
   * Store text content as file
   */
  async storeTextContent(
    content: string,
    filename: string,
    category: FileMetadata['category'] = 'document'
  ): Promise<FileMetadata> {
    const buffer = Buffer.from(content, 'utf8');
    return await this.storeFile(buffer, filename, 'text/plain', category);
  }

  /**
   * Store JSON data as file
   */
  async storeJsonContent(
    data: any,
    filename: string,
    category: FileMetadata['category'] = 'document'
  ): Promise<FileMetadata> {
    const content = JSON.stringify(data, null, 2);
    const buffer = Buffer.from(content, 'utf8');
    return await this.storeFile(buffer, filename, 'application/json', category);
  }

  /**
   * Get file URL for serving
   */
  getFileUrl(filePath: string): string {
    const baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3000');
    return `${baseUrl}/api/v1/files/${encodeURIComponent(filePath)}`;
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(filePath: string): string {
    const thumbnailPath = this.getThumbnailPath(filePath);
    return this.getFileUrl(thumbnailPath);
  }

  /**
   * List files in a category
   */
  async listFiles(category: FileMetadata['category']): Promise<string[]> {
    const categoryPath = path.resolve(this.basePath, this.paths[category]);
    try {
      const files = await fs.promises.readdir(categoryPath);
      return files.filter(file => !file.endsWith('_thumb.jpg')); // Exclude thumbnails
    } catch {
      return [];
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<Record<string, { count: number; totalSize: number }>> {
    const stats: Record<string, { count: number; totalSize: number }> = {};

    for (const [category, relativePath] of Object.entries(this.paths)) {
      const categoryPath = path.resolve(this.basePath, relativePath);
      try {
        const files = await fs.promises.readdir(categoryPath);
        let totalSize = 0;
        let count = 0;

        for (const file of files) {
          if (!file.endsWith('_thumb.jpg')) { // Exclude thumbnails from count
            const filePath = path.join(categoryPath, file);
            const stat = await fs.promises.stat(filePath);
            totalSize += stat.size;
            count++;
          }
        }

        stats[category] = { count, totalSize };
      } catch {
        stats[category] = { count: 0, totalSize: 0 };
      }
    }

    return stats;
  }

  /**
   * Format file size for human reading
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Clean up old files (backup retention)
   */
  async cleanupOldFiles(category: FileMetadata['category'], retentionDays: number): Promise<number> {
    const categoryPath = path.resolve(this.basePath, this.paths[category]);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    try {
      const files = await fs.promises.readdir(categoryPath);
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(categoryPath, file);
        const stat = await fs.promises.stat(filePath);
        
        if (stat.mtime < cutoffDate) {
          await unlink(filePath);
          deletedCount++;
          this.logger.debug(`Cleaned up old file: ${file}`);
        }
      }

      if (deletedCount > 0) {
        this.logger.log(`Cleaned up ${deletedCount} old files from ${category}`);
      }

      return deletedCount;
    } catch (error) {
      this.logger.error(`Failed to cleanup old files in ${category}`, error);
      return 0;
    }
  }
}
