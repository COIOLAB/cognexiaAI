import { IsOptional, IsEnum, IsUUID, IsDateString, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { AuditAction, AuditEntityType } from '../entities/audit-log.entity';

export class AuditLogFilterDto {
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class CreateAuditLogDto {
  @IsUUID()
  organization_id: string;

  @IsUUID()
  user_id: string;

  @IsEnum(AuditAction)
  action: AuditAction;

  @IsString()
  entity_type: string;

  @IsUUID()
  entity_id: string;

  description: string;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  ipAddress?: string;

  @IsOptional()
  userAgent?: string;
}

export class ExportAuditLogsDto extends AuditLogFilterDto {
  @IsOptional()
  @IsEnum(['csv', 'json'])
  format?: 'csv' | 'json' = 'csv';
}
