import {
  IsString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  IsObject,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType } from '../entities/activity.entity';

export class CreateActivityDto {
  @ApiProperty({ description: 'Activity type', enum: ActivityType })
  @IsEnum(ActivityType)
  activityType: ActivityType;

  @ApiProperty({ description: 'Activity title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Activity description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Related entity ID' })
  @IsOptional()
  @IsUUID()
  relatedToId?: string;

  @ApiPropertyOptional({ description: 'Related entity type' })
  @IsOptional()
  @IsString()
  relatedToType?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CreateNoteDto {
  @ApiProperty({ description: 'Note content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Related entity ID' })
  @IsOptional()
  @IsUUID()
  relatedToId?: string;

  @ApiPropertyOptional({ description: 'Related entity type' })
  @IsOptional()
  @IsString()
  relatedToType?: string;

  @ApiPropertyOptional({ description: 'Is pinned' })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}

export class ActivityQueryDto {
  @ApiPropertyOptional({ description: 'Filter by activity type', enum: ActivityType })
  @IsOptional()
  @IsEnum(ActivityType)
  activityType?: ActivityType;

  @ApiPropertyOptional({ description: 'Filter by related entity' })
  @IsOptional()
  @IsUUID()
  relatedToId?: string;

  @ApiPropertyOptional({ description: 'Filter by related entity type' })
  @IsOptional()
  @IsString()
  relatedToType?: string;

  @ApiPropertyOptional({ description: 'Filter by performer' })
  @IsOptional()
  @IsUUID()
  performedBy?: string;
}
