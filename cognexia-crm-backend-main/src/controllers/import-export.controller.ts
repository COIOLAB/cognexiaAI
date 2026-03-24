import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  Res,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { ImportService } from '../services/import.service';
import { ExportService } from '../services/export.service';
import { CreateImportDto, CreateExportDto, ImportTemplateDto } from '../dto/import-export.dto';
import { ImportType } from '../entities/import-job.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';
import * as path from 'path';
import * as fs from 'fs';

@ApiTags('Import/Export')
@Controller('import-export')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ImportExportController {
  constructor(
    private readonly importService: ImportService,
    private readonly exportService: ExportService,
  ) {}

  /**
   * Upload and create import job
   */
  @Post('import')
  @ApiOperation({ summary: 'Import data from CSV/Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        importType: { type: 'string', enum: Object.values(ImportType) },
        mapping: { type: 'object' },
        skipDuplicates: { type: 'boolean' },
        updateExisting: { type: 'boolean' },
        validateOnly: { type: 'boolean' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `import-${uniqueSuffix}${path.extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(csv|xlsx|xls)$/)) {
          return cb(new Error('Only CSV and Excel files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async importData(
    @UploadedFile() file: Express.Multer.File,
    @Body() createImportDto: CreateImportDto,
    @Req() req: any,
  ) {
    const organizationId = req.user.organizationId;
    const userId = req.user.id;
    const isDev = process.env.NODE_ENV !== 'production';

    if (!file && isDev) {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const mockPath = path.join(uploadsDir, 'mock-import.csv');
      if (!fs.existsSync(mockPath)) {
        fs.writeFileSync(mockPath, 'email,firstName,lastName\n');
      }
      file = {
        originalname: 'mock-import.csv',
        path: mockPath,
      } as Express.Multer.File;
    }

    if (!file) {
      throw new BadRequestException('Import file is required');
    }

    // Create import job
    const job = await this.importService.createImportJob(
      organizationId,
      userId,
      createImportDto.importType || ImportType.CUSTOMER,
      file.originalname,
      file.path,
      {
        skipDuplicates: createImportDto.skipDuplicates,
        updateExisting: createImportDto.updateExisting,
        validateOnly: createImportDto.validateOnly,
      },
      createImportDto.mapping,
    );

    // Process async
    this.importService.processImportJob(job.id).catch(console.error);

    return {
      jobId: job.id,
      status: job.status,
      message: 'Import job created successfully',
    };
  }

  /**
   * Get import job status
   */
  @Get('import/:jobId')
  @ApiOperation({ summary: 'Get import job status' })
  async getImportStatus(@Param('jobId') jobId: string) {
    const job = await this.importService.getImportJob(jobId);
    
    return {
      id: job.id,
      status: job.status,
      totalRows: job.total_rows,
      processedRows: job.processed_rows,
      successfulRows: job.successful_rows,
      failedRows: job.failed_rows,
      errors: job.errors,
      createdAt: job.created_at,
      completedAt: job.completed_at,
    };
  }

  /**
   * List import jobs
   */
  @Get('import')
  @ApiOperation({ summary: 'List import jobs' })
  async listImportJobs(@Req() req: any) {
    const organizationId = req.user.organizationId;
    return this.importService.listImportJobs(organizationId);
  }

  /**
   * Download import template
   */
  @Post('import/template')
  @ApiOperation({ summary: 'Download import template' })
  async downloadTemplate(@Body() dto: ImportTemplateDto, @Res() res: Response) {
    const template = await this.importService.generateTemplate(dto.importType);
    
    // Convert to CSV
    const csv = template.map(row => row.join(',')).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${dto.importType}_template.csv`);
    res.send(csv);
  }

  /**
   * Create export job
   */
  @Post('export')
  @ApiOperation({ summary: 'Export data to CSV/Excel/PDF' })
  async exportData(@Body() createExportDto: CreateExportDto, @Req() req: any) {
    const organizationId = req.user.organizationId;
    const userId = req.user.id;

    // Create export job
    const job = await this.exportService.createExportJob(
      organizationId,
      userId,
      createExportDto.exportType,
      createExportDto.format,
      createExportDto.filters,
      createExportDto.columns,
    );

    // Process async
    this.exportService.processExportJob(job.id).catch(console.error);

    return {
      jobId: job.id,
      status: job.status,
      message: 'Export job created successfully',
    };
  }

  /**
   * Get export job status
   */
  @Get('export/:jobId')
  @ApiOperation({ summary: 'Get export job status' })
  async getExportStatus(@Param('jobId') jobId: string) {
    const job = await this.exportService.getExportJob(jobId);
    
    return {
      id: job.id,
      status: job.status,
      format: job.format,
      totalRecords: job.total_records,
      fileName: job.file_name,
      fileSize: job.file_size,
      createdAt: job.created_at,
      completedAt: job.completed_at,
      expiresAt: job.expires_at,
    };
  }

  /**
   * Download export file
   */
  @Get('export/:jobId/download')
  @ApiOperation({ summary: 'Download export file' })
  async downloadExport(@Param('jobId') jobId: string, @Res() res: Response) {
    const { filePath, fileName, mimeType } = await this.exportService.getExportFile(jobId);
    
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  /**
   * List export jobs
   */
  @Get('export')
  @ApiOperation({ summary: 'List export jobs' })
  async listExportJobs(@Req() req: any) {
    const organizationId = req.user.organizationId;
    return this.exportService.listExportJobs(organizationId);
  }
}
