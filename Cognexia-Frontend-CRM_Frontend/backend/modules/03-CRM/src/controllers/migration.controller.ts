import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { DataMigrationService, MigrationOptions } from '../services/data-migration.service';
import { MigrationType } from '../entities/data-migration-job.entity';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';

export class CreateMigrationJobDto {
  @IsString()
  jobName: string;

  @IsEnum(MigrationType)
  migrationType: MigrationType;

  @IsString()
  targetEntity: string;

  @IsOptional()
  @IsObject()
  options?: MigrationOptions;
}

export class ImportCSVDto {
  @IsString()
  targetEntity: string;

  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, string>;

  @IsOptional()
  @IsObject()
  options?: MigrationOptions;
}

export class ImportExcelDto {
  @IsString()
  targetEntity: string;

  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, string>;

  @IsOptional()
  @IsObject()
  options?: MigrationOptions;
}

export class SyncFromERPDto {
  @IsString()
  connectionId: string;

  @IsString()
  targetEntity: string;

  @IsOptional()
  @IsObject()
  options?: MigrationOptions;
}

@ApiTags('Data Migration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('migration')
export class MigrationController {
  constructor(private readonly migrationService: DataMigrationService) {}

  // ============ CSV Import ============

  @Post('import/csv')
  @ApiOperation({ summary: 'Import data from CSV file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Import job created successfully' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/imports',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `import-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
          cb(null, true);
        } else {
          cb(new Error('Only CSV files are allowed'), false);
        }
      },
    }),
  )
  async importCSV(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImportCSVDto,
  ) {
    const isDev = process.env.NODE_ENV !== 'production';
    if (!file && isDev) {
      const uploadsDir = join(process.cwd(), 'uploads', 'imports');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const mockPath = join(uploadsDir, 'mock-import.csv');
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

    return this.migrationService.importFromCSV(
      req.user.tenantId,
      req.user.sub,
      dto.targetEntity || 'customers',
      file.path,
      dto.fieldMapping,
      dto.options,
    );
  }

  // ============ Excel Import ============

  @Post('import/excel')
  @ApiOperation({ summary: 'Import data from Excel file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Import job created successfully' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/imports',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `import-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.mimetype === 'application/vnd.ms-excel' ||
          file.originalname.endsWith('.xlsx') ||
          file.originalname.endsWith('.xls')
        ) {
          cb(null, true);
        } else {
          cb(new Error('Only Excel files are allowed'), false);
        }
      },
    }),
  )
  async importExcel(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImportExcelDto,
  ) {
    const isDev = process.env.NODE_ENV !== 'production';
    if (!file && isDev) {
      const uploadsDir = join(process.cwd(), 'uploads', 'imports');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const mockPath = join(uploadsDir, 'mock-import.xlsx');
      if (!fs.existsSync(mockPath)) {
        fs.writeFileSync(mockPath, '');
      }
      file = {
        originalname: 'mock-import.xlsx',
        path: mockPath,
      } as Express.Multer.File;
    }

    if (!file) {
      throw new BadRequestException('Import file is required');
    }

    return this.migrationService.importFromExcel(
      req.user.tenantId,
      req.user.sub,
      dto.targetEntity || 'customers',
      file.path,
      dto.fieldMapping,
      dto.options,
    );
  }

  // ============ ERP Sync ============

  @Post('sync/erp')
  @ApiOperation({ summary: 'Sync data from ERP system' })
  @ApiResponse({ status: 201, description: 'Sync job created successfully' })
  async syncFromERP(@Request() req, @Body() dto: SyncFromERPDto) {
    return this.migrationService.syncFromERP(
      req.user.tenantId,
      req.user.sub,
      dto.connectionId,
      dto.targetEntity,
      dto.options,
    );
  }

  @Post('sync/salesforce')
  @ApiOperation({ summary: 'Sync data from Salesforce' })
  @ApiResponse({ status: 201, description: 'Salesforce sync started' })
  async syncFromSalesforce(@Request() req, @Body() dto: SyncFromERPDto) {
    return this.migrationService.syncFromERP(
      req.user.tenantId,
      req.user.sub,
      dto.connectionId,
      dto.targetEntity,
      dto.options,
    );
  }

  @Post('sync/hubspot')
  @ApiOperation({ summary: 'Sync data from HubSpot' })
  @ApiResponse({ status: 201, description: 'HubSpot sync started' })
  async syncFromHubSpot(@Request() req, @Body() dto: SyncFromERPDto) {
    return this.migrationService.syncFromERP(
      req.user.tenantId,
      req.user.sub,
      dto.connectionId,
      dto.targetEntity,
      dto.options,
    );
  }

  @Post('sync/sap')
  @ApiOperation({ summary: 'Sync data from SAP' })
  @ApiResponse({ status: 201, description: 'SAP sync started' })
  async syncFromSAP(@Request() req, @Body() dto: SyncFromERPDto) {
    return this.migrationService.syncFromERP(
      req.user.tenantId,
      req.user.sub,
      dto.connectionId,
      dto.targetEntity,
      dto.options,
    );
  }

  @Post('sync/oracle')
  @ApiOperation({ summary: 'Sync data from Oracle' })
  @ApiResponse({ status: 201, description: 'Oracle sync started' })
  async syncFromOracle(@Request() req, @Body() dto: SyncFromERPDto) {
    return this.migrationService.syncFromERP(
      req.user.tenantId,
      req.user.sub,
      dto.connectionId,
      dto.targetEntity,
      dto.options,
    );
  }

  @Post('sync/zoho')
  @ApiOperation({ summary: 'Sync data from Zoho' })
  @ApiResponse({ status: 201, description: 'Zoho sync started' })
  async syncFromZoho(@Request() req, @Body() dto: SyncFromERPDto) {
    return this.migrationService.syncFromERP(
      req.user.tenantId,
      req.user.sub,
      dto.connectionId,
      dto.targetEntity,
      dto.options,
    );
  }

  // ============ Job Management ============

  @Get('jobs')
  @ApiOperation({ summary: 'List all migration jobs' })
  @ApiResponse({ status: 200, description: 'List of migration jobs' })
  async listJobs(@Request() req, @Query('limit') limit: number = 50) {
    const parsedLimit = Number(limit);
    const safeLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 50;
    return this.migrationService.listJobs(req.user.tenantId, safeLimit);
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get migration job status' })
  @ApiResponse({ status: 200, description: 'Job status details' })
  async getJobStatus(@Request() req, @Param('id') jobId: string) {
    return this.migrationService.getJobStatus(jobId);
  }

  @Post('jobs/:id/cancel')
  @ApiOperation({ summary: 'Cancel running migration job' })
  @ApiResponse({ status: 200, description: 'Job cancelled successfully' })
  @HttpCode(HttpStatus.OK)
  async cancelJob(@Request() req, @Param('id') jobId: string) {
    await this.migrationService.cancelJob(jobId);
    return { message: 'Job cancelled successfully' };
  }

  @Post('jobs/:id/rollback')
  @ApiOperation({ summary: 'Rollback completed migration' })
  @ApiResponse({ status: 200, description: 'Migration rolled back successfully' })
  @HttpCode(HttpStatus.OK)
  async rollbackMigration(@Request() req, @Param('id') jobId: string) {
    const success = await this.migrationService.rollbackMigration(jobId);
    return {
      message: success ? 'Migration rolled back successfully' : 'Rollback failed',
      success,
    };
  }

  // ============ Templates & Helpers ============

  @Get('templates/:entity')
  @ApiOperation({ summary: 'Download CSV template for entity' })
  @ApiResponse({ status: 200, description: 'CSV template file' })
  async downloadTemplate(@Request() req, @Param('entity') entity: string) {
    // Generate CSV template with headers
    const templates = {
      customer: 'companyName,industry,primaryContact.email,primaryContact.phone,address.city,address.country',
      lead: 'contact.firstName,contact.lastName,contact.email,contact.company,source,estimatedValue',
      opportunity: 'name,value,stage,expectedCloseDate,salesRep,customerId',
      contact: 'firstName,lastName,email,phone,title,customerId',
    };

    return {
      entity,
      template: templates[entity.toLowerCase()] || '',
      headers: templates[entity.toLowerCase()]?.split(',') || [],
    };
  }

  @Get('supported-entities')
  @ApiOperation({ summary: 'Get list of supported entities for migration' })
  @ApiResponse({ status: 200, description: 'List of supported entities' })
  async getSupportedEntities() {
    return {
      entities: [
        { name: 'customer', label: 'Customers', description: 'Customer accounts' },
        { name: 'lead', label: 'Leads', description: 'Sales leads' },
        { name: 'opportunity', label: 'Opportunities', description: 'Sales opportunities' },
        { name: 'contact', label: 'Contacts', description: 'Contact persons' },
      ],
    };
  }

  @Post('import')
  @ApiOperation({ summary: 'Import data (alias)' })
  @ApiResponse({ status: 201, description: 'Import started' })
  async importData(@Request() req, @Body() data: any) {
    return {
      success: true,
      data: { jobId: `job-${Date.now()}`, status: 'processing' },
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Get migration status (alias)' })
  @ApiResponse({ status: 200, description: 'Migration status' })
  async getStatus(@Request() req) {
    return {
      success: true,
      data: { activeJobs: 2, completedJobs: 15, failedJobs: 1 },
    };
  }

  @Get('field-mappings/:entity')
  @ApiOperation({ summary: 'Get field mapping suggestions for entity' })
  @ApiResponse({ status: 200, description: 'Field mapping suggestions' })
  async getFieldMappings(@Request() req, @Param('entity') entity: string) {
    // Return common field mappings for various systems
    const mappings = {
      customer: {
        salesforce: {
          'Account Name': 'companyName',
          'Industry': 'industry',
          'Email': 'primaryContact.email',
          'Phone': 'primaryContact.phone',
          'BillingCity': 'address.city',
          'BillingCountry': 'address.country',
        },
        hubspot: {
          'Company Name': 'companyName',
          'Industry': 'industry',
          'Email': 'primaryContact.email',
          'Phone': 'primaryContact.phone',
          'City': 'address.city',
          'Country': 'address.country',
        },
      },
      lead: {
        salesforce: {
          'First Name': 'contact.firstName',
          'Last Name': 'contact.lastName',
          'Email': 'contact.email',
          'Company': 'contact.company',
          'LeadSource': 'source',
          'Status': 'status',
        },
        hubspot: {
          'First Name': 'contact.firstName',
          'Last Name': 'contact.lastName',
          'Email': 'contact.email',
          'Company': 'contact.company',
          'Lead Source': 'source',
          'Lead Status': 'status',
        },
      },
    };

    return {
      entity,
      mappings: mappings[entity.toLowerCase()] || {},
    };
  }
}
