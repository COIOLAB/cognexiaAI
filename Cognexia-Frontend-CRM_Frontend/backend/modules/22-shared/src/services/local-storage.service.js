"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LocalStorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sharp = __importStar(require("sharp"));
const uuid_1 = require("uuid");
const util_1 = require("util");
const writeFile = (0, util_1.promisify)(fs.writeFile);
const readFile = (0, util_1.promisify)(fs.readFile);
const unlink = (0, util_1.promisify)(fs.unlink);
const mkdir = (0, util_1.promisify)(fs.mkdir);
const access = (0, util_1.promisify)(fs.access);
let LocalStorageService = LocalStorageService_1 = class LocalStorageService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(LocalStorageService_1.name);
        this.basePath = process.cwd();
        this.paths = {
            uploads: this.configService.get('FILE_UPLOAD_PATH', './storage/uploads'),
            documents: this.configService.get('FILE_DOCUMENTS_PATH', './storage/documents'),
            images: this.configService.get('FILE_IMAGES_PATH', './storage/images'),
            reports: this.configService.get('FILE_REPORTS_PATH', './storage/reports'),
            backups: this.configService.get('FILE_BACKUPS_PATH', './storage/backups'),
        };
        this.initializeDirectories();
    }
    async initializeDirectories() {
        for (const [category, relativePath] of Object.entries(this.paths)) {
            const fullPath = path.resolve(this.basePath, relativePath);
            try {
                await access(fullPath);
            }
            catch {
                await mkdir(fullPath, { recursive: true });
                this.logger.log(`Created directory: ${fullPath}`);
            }
        }
    }
    /**
     * Store a file in the local storage system
     */
    async storeFile(buffer, originalName, mimetype, category = 'upload', options) {
        const id = (0, uuid_1.v4)();
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
        const metadata = {
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
        if (mimetype.startsWith('image/') && this.configService.get('IMAGE_RESIZE_ENABLED', true)) {
            await this.createThumbnail(processedBuffer, relativePath, id, ext);
        }
        this.logger.log(`File stored successfully: ${filename} (${this.formatFileSize(metadata.size)})`);
        return metadata;
    }
    /**
     * Retrieve a file from local storage
     */
    async getFile(filePath) {
        const fullPath = path.resolve(this.basePath, filePath);
        return await readFile(fullPath);
    }
    /**
     * Get file metadata
     */
    async getFileMetadata(filePath) {
        const fullPath = path.resolve(this.basePath, filePath);
        try {
            const stats = await fs.promises.stat(fullPath);
            return { size: stats.size, exists: true };
        }
        catch {
            return { size: 0, exists: false };
        }
    }
    /**
     * Delete a file from local storage
     */
    async deleteFile(filePath) {
        try {
            const fullPath = path.resolve(this.basePath, filePath);
            await unlink(fullPath);
            // Also delete thumbnail if exists
            const thumbnailPath = this.getThumbnailPath(filePath);
            try {
                const thumbnailFullPath = path.resolve(this.basePath, thumbnailPath);
                await unlink(thumbnailFullPath);
            }
            catch {
                // Thumbnail might not exist, ignore
            }
            this.logger.log(`File deleted successfully: ${filePath}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to delete file: ${filePath}`, error);
            return false;
        }
    }
    /**
     * Process images with Sharp
     */
    async processImage(buffer, options) {
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
    async createThumbnail(buffer, relativePath, id, ext) {
        try {
            const thumbnailSize = this.configService.get('IMAGE_THUMBNAIL_SIZE', 200);
            const quality = this.configService.get('IMAGE_QUALITY', 85);
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
        }
        catch (error) {
            this.logger.error(`Failed to create thumbnail for ${id}`, error);
        }
    }
    /**
     * Get thumbnail path
     */
    getThumbnailPath(originalPath) {
        const dir = path.dirname(originalPath);
        const basename = path.basename(originalPath, path.extname(originalPath));
        return path.join(dir, `${basename}_thumb.jpg`);
    }
    /**
     * Store text content as file
     */
    async storeTextContent(content, filename, category = 'document') {
        const buffer = Buffer.from(content, 'utf8');
        return await this.storeFile(buffer, filename, 'text/plain', category);
    }
    /**
     * Store JSON data as file
     */
    async storeJsonContent(data, filename, category = 'document') {
        const content = JSON.stringify(data, null, 2);
        const buffer = Buffer.from(content, 'utf8');
        return await this.storeFile(buffer, filename, 'application/json', category);
    }
    /**
     * Get file URL for serving
     */
    getFileUrl(filePath) {
        const baseUrl = this.configService.get('BASE_URL', 'http://localhost:3000');
        return `${baseUrl}/api/v1/files/${encodeURIComponent(filePath)}`;
    }
    /**
     * Get thumbnail URL
     */
    getThumbnailUrl(filePath) {
        const thumbnailPath = this.getThumbnailPath(filePath);
        return this.getFileUrl(thumbnailPath);
    }
    /**
     * List files in a category
     */
    async listFiles(category) {
        const categoryPath = path.resolve(this.basePath, this.paths[category]);
        try {
            const files = await fs.promises.readdir(categoryPath);
            return files.filter(file => !file.endsWith('_thumb.jpg')); // Exclude thumbnails
        }
        catch {
            return [];
        }
    }
    /**
     * Get storage statistics
     */
    async getStorageStats() {
        const stats = {};
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
            }
            catch {
                stats[category] = { count: 0, totalSize: 0 };
            }
        }
        return stats;
    }
    /**
     * Format file size for human reading
     */
    formatFileSize(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    /**
     * Clean up old files (backup retention)
     */
    async cleanupOldFiles(category, retentionDays) {
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
        }
        catch (error) {
            this.logger.error(`Failed to cleanup old files in ${category}`, error);
            return 0;
        }
    }
};
exports.LocalStorageService = LocalStorageService;
exports.LocalStorageService = LocalStorageService = LocalStorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LocalStorageService);
//# sourceMappingURL=local-storage.service.js.map