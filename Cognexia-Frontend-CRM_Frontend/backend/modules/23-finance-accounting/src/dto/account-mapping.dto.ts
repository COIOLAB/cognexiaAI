/**
 * Account Mapping DTOs - Data Transfer Objects
 * 
 * DTOs for account mapping, providing strongly typed data structures for API
 * requests and responses with validation and documentation.
 * 
 * @version 3.0.0
 * @author Industry 5.0 ERP Team
 * @compliance SOC2, ISO27001, GDPR, SOX
 */

import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Enum definitions for validation
export enum MappingType {
  ELIMINATION = 'ELIMINATION',
  RECLASSIFICATION = 'RECLASSIFICATION',
  TRANSLATION = 'TRANSLATION',
  CONSOLIDATION = 'CONSOLIDATION',
  CUSTOM = 'CUSTOM',
}

export class MappingRuleDto {
  // ... (Add properties for mapping rules)
}

export class DimensionMappingDto {
  // ... (Add properties for dimension mappings)
}

export class AIOptimizationDto {
  // ... (Add properties for AI optimization)
}

export class CreateAccountMappingDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  sourceAccountId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  targetAccountId: string;

  @ApiProperty({ enum: MappingType })
  @IsEnum(MappingType)
  mappingType: MappingType;

  @ApiProperty({ type: [MappingRuleDto] })
  @ValidateNested({ each: true })
  @Type(() => MappingRuleDto)
  mappingRules: MappingRuleDto[];

  @ApiProperty({ type: [DimensionMappingDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DimensionMappingDto)
  dimensions?: DimensionMappingDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AIOptimizationDto)
  aiOptimization?: AIOptimizationDto;
}

export class UpdateAccountMappingDto extends PartialType(CreateAccountMappingDto) {}

export class AccountMappingResponseDto extends CreateAccountMappingDto {
  @ApiProperty()
  @IsUUID()
  mappingId: string;
}

