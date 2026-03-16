import { Controller, Get, Param, Res, HttpStatus, HttpException, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { LocalStorageService, FileMetadata } from '../services/local-storage.service';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly storageService: LocalStorageService) {}

  @Get(':filePath(*)')
  @ApiOperation({ summary: 'Serve file from local storage' })
  @ApiResponse({ status: 200, description: 'File served successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async serveFile(@Param('filePath') filePath: string, @Res() res: Response) {
    try {
      const decodedPath = decodeURIComponent(filePath);
      const fileBuffer = await this.storageService.getFile(decodedPath);
      const metadata = await this.storageService.getFileMetadata(decodedPath);
      
      if (!metadata.exists) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }
      
      // Set appropriate headers
      res.setHeader('Content-Type', this.getContentType(decodedPath));
      res.setHeader('Content-Length', metadata.size);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      
      res.send(fileBuffer);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error serving file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file to local storage' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'File uploaded successfully', type: FileMetadata })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('category') category?: FileMetadata['category']
  ): Promise<FileMetadata> {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    return await this.storageService.storeFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      category || 'upload'
    );
  }

  @Get('stats/storage')
  @ApiOperation({ summary: 'Get storage statistics' })
  @ApiResponse({ status: 200, description: 'Storage stats retrieved successfully' })
  async getStorageStats() {
    return await this.storageService.getStorageStats();
  }

  @Get('list/:category')
  @ApiOperation({ summary: 'List files in a category' })
  @ApiResponse({ status: 200, description: 'Files listed successfully' })
  async listFiles(@Param('category') category: FileMetadata['category']) {
    return await this.storageService.listFiles(category);
  }

  private getContentType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    
    const contentTypes: Record<string, string> = {
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
}
