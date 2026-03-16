import { IsString, IsEnum, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExecuteQueryDto {
  @ApiProperty()
  @IsString()
  query_text: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  requires_approval?: boolean;
}

export class CreateBackupDto {
  @ApiProperty({ enum: ['full', 'incremental', 'differential'] })
  @IsEnum(['full', 'incremental', 'differential'])
  backup_type: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RestoreBackupDto {
  @ApiProperty()
  @IsString()
  backup_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  verify_before_restore?: boolean;
}

export class NaturalLanguageQueryDto {
  @ApiProperty()
  @IsString()
  query_text: string;

  @ApiProperty({ enum: ['query', 'report', 'chart', 'export'], required: false })
  @IsOptional()
  @IsEnum(['query', 'report', 'chart', 'export'])
  query_type?: string;
}
