import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsObject,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ImportType } from '../entities/import-job.entity';
import { ExportFormat } from '../entities/export-job.entity';

export class CreateImportDto {
  @ApiProperty({ description: 'Import type', enum: ImportType })
  @IsEnum(ImportType)
  importType: ImportType;

  @ApiProperty({ description: 'File to import', type: 'string', format: 'binary' })
  file: any;

  @ApiPropertyOptional({ description: 'Column mapping (CSV column -> entity field)' })
  @IsOptional()
  @IsObject()
  mapping?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Skip duplicate records' })
  @IsOptional()
  @IsBoolean()
  skipDuplicates?: boolean = true;

  @ApiPropertyOptional({ description: 'Update existing records' })
  @IsOptional()
  @IsBoolean()
  updateExisting?: boolean = false;

  @ApiPropertyOptional({ description: 'Validation only (dry run)' })
  @IsOptional()
  @IsBoolean()
  validateOnly?: boolean = false;
}

export class ImportMappingDto {
  @ApiProperty({ description: 'CSV column name' })
  @IsString()
  csvColumn: string;

  @ApiProperty({ description: 'Entity field name' })
  @IsString()
  entityField: string;

  @ApiPropertyOptional({ description: 'Is required field' })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional({ description: 'Default value if empty' })
  @IsOptional()
  defaultValue?: any;
}

export class CreateExportDto {
  @ApiProperty({ description: 'Export type (entity name)' })
  @IsString()
  @IsNotEmpty()
  exportType: string;

  @ApiProperty({ description: 'Export format', enum: ExportFormat })
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @ApiPropertyOptional({ description: 'Filters to apply' })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Columns to export', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  columns?: string[];

  @ApiPropertyOptional({ description: 'Sort by field' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}

export class ImportTemplateDto {
  @ApiProperty({ description: 'Import type', enum: ImportType })
  @IsEnum(ImportType)
  importType: ImportType;

  @ApiPropertyOptional({ description: 'Include sample data' })
  @IsOptional()
  @IsBoolean()
  includeSamples?: boolean = false;
}

export class ImportValidationResultDto {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: Array<{
    row: number;
    field: string;
    error: string;
    value?: any;
  }>;
  warnings: Array<{
    row: number;
    message: string;
  }>;
}
