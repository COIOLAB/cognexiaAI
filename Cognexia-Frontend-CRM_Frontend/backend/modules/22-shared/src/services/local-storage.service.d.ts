import { ConfigService } from '@nestjs/config';
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
    resize?: {
        width?: number;
        height?: number;
    };
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
    thumbnail?: boolean;
}
export declare class LocalStorageService {
    private readonly configService;
    private readonly logger;
    private readonly basePath;
    private readonly paths;
    constructor(configService: ConfigService);
    private initializeDirectories;
    /**
     * Store a file in the local storage system
     */
    storeFile(buffer: Buffer, originalName: string, mimetype: string, category?: FileMetadata['category'], options?: ImageProcessingOptions): Promise<FileMetadata>;
    /**
     * Retrieve a file from local storage
     */
    getFile(filePath: string): Promise<Buffer>;
    /**
     * Get file metadata
     */
    getFileMetadata(filePath: string): Promise<{
        size: number;
        exists: boolean;
    }>;
    /**
     * Delete a file from local storage
     */
    deleteFile(filePath: string): Promise<boolean>;
    /**
     * Process images with Sharp
     */
    private processImage;
    /**
     * Create thumbnail for images
     */
    private createThumbnail;
    /**
     * Get thumbnail path
     */
    getThumbnailPath(originalPath: string): string;
    /**
     * Store text content as file
     */
    storeTextContent(content: string, filename: string, category?: FileMetadata['category']): Promise<FileMetadata>;
    /**
     * Store JSON data as file
     */
    storeJsonContent(data: any, filename: string, category?: FileMetadata['category']): Promise<FileMetadata>;
    /**
     * Get file URL for serving
     */
    getFileUrl(filePath: string): string;
    /**
     * Get thumbnail URL
     */
    getThumbnailUrl(filePath: string): string;
    /**
     * List files in a category
     */
    listFiles(category: FileMetadata['category']): Promise<string[]>;
    /**
     * Get storage statistics
     */
    getStorageStats(): Promise<Record<string, {
        count: number;
        totalSize: number;
    }>>;
    /**
     * Format file size for human reading
     */
    private formatFileSize;
    /**
     * Clean up old files (backup retention)
     */
    cleanupOldFiles(category: FileMetadata['category'], retentionDays: number): Promise<number>;
}
//# sourceMappingURL=local-storage.service.d.ts.map