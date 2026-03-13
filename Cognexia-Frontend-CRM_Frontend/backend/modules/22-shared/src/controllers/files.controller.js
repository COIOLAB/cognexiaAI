"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const local_storage_service_1 = require("../services/local-storage.service");
let FilesController = class FilesController {
    constructor(storageService) {
        this.storageService = storageService;
    }
    async serveFile(filePath, res) {
        try {
            const decodedPath = decodeURIComponent(filePath);
            const fileBuffer = await this.storageService.getFile(decodedPath);
            const metadata = await this.storageService.getFileMetadata(decodedPath);
            if (!metadata.exists) {
                throw new common_1.HttpException('File not found', common_1.HttpStatus.NOT_FOUND);
            }
            // Set appropriate headers
            res.setHeader('Content-Type', this.getContentType(decodedPath));
            res.setHeader('Content-Length', metadata.size);
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
            res.send(fileBuffer);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error serving file', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async uploadFile(file, category) {
        if (!file) {
            throw new common_1.HttpException('No file provided', common_1.HttpStatus.BAD_REQUEST);
        }
        return await this.storageService.storeFile(file.buffer, file.originalname, file.mimetype, category || 'upload');
    }
    async getStorageStats() {
        return await this.storageService.getStorageStats();
    }
    async listFiles(category) {
        return await this.storageService.listFiles(category);
    }
    getContentType(filePath) {
        const ext = filePath.split('.').pop()?.toLowerCase();
        const contentTypes = {
            // Images
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
            webp: 'image/webp',
            svg: 'image/svg+xml',
            // Documents
            pdf: 'application/pdf',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            xls: 'application/vnd.ms-excel',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ppt: 'application/vnd.ms-powerpoint',
            pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            // Text
            txt: 'text/plain',
            csv: 'text/csv',
            json: 'application/json',
            xml: 'application/xml',
            html: 'text/html',
            css: 'text/css',
            js: 'application/javascript',
            // Archives
            zip: 'application/zip',
            rar: 'application/x-rar-compressed',
            '7z': 'application/x-7z-compressed',
            tar: 'application/x-tar',
            gz: 'application/gzip',
        };
        return contentTypes[ext || ''] || 'application/octet-stream';
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Get)(':filePath(*)'),
    (0, swagger_1.ApiOperation)({ summary: 'Serve file from local storage' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File served successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Param)('filePath')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "serveFile", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a file to local storage' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'File uploaded successfully', type: local_storage_service_1.FileMetadata }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)('stats/storage'),
    (0, swagger_1.ApiOperation)({ summary: 'Get storage statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Storage stats retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getStorageStats", null);
__decorate([
    (0, common_1.Get)('list/:category'),
    (0, swagger_1.ApiOperation)({ summary: 'List files in a category' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Files listed successfully' }),
    __param(0, (0, common_1.Param)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "listFiles", null);
exports.FilesController = FilesController = __decorate([
    (0, swagger_1.ApiTags)('Files'),
    (0, common_1.Controller)('files'),
    __metadata("design:paramtypes", [local_storage_service_1.LocalStorageService])
], FilesController);
//# sourceMappingURL=files.controller.js.map