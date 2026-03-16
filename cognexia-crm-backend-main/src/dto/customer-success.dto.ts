import { IsUUID, IsString, IsEnum, IsDateString, IsOptional, IsNumber, IsArray, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMilestoneDto {
  @ApiProperty()
  @IsUUID()
  organizationId: string;

  @ApiProperty({ enum: ['onboarding', 'activation', 'first_value', 'expansion', 'advocacy'] })
  @IsEnum(['onboarding', 'activation', 'first_value', 'expansion', 'advocacy'])
  milestone_type: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  target_date?: string;
}

export class UpdateMilestoneDto {
  @ApiProperty({ enum: ['pending', 'in_progress', 'completed', 'blocked', 'skipped'], required: false })
  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed', 'blocked', 'skipped'])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  completion_percentage?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  assigned_csm?: string;
}

export class MilestoneQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed', 'blocked', 'skipped'])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['onboarding', 'activation', 'first_value', 'expansion', 'advocacy'])
  milestone_type?: string;
}
