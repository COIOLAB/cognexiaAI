import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { InteractionType, InteractionDirection, InteractionOutcome } from '../entities/customer-interaction.entity';

// Nested DTOs
export class InteractionParticipantDto {
  @ApiProperty({ description: 'Participant name', minLength: 1, maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Participant role', minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsNotEmpty()
  role: string;

  @ApiProperty({ description: 'Participant type' })
  @IsString()
  @IsNotEmpty()
  type: 'internal' | 'customer';
}

// Main Interaction DTOs
export class CreateInteractionDto {
  @ApiProperty({ description: 'Interaction type', enum: InteractionType })
  @IsEnum(InteractionType)
  type: InteractionType;

  @ApiProperty({ description: 'Interaction direction', enum: InteractionDirection })
  @IsEnum(InteractionDirection)
  direction: InteractionDirection;

  @ApiProperty({ description: 'Interaction subject', minLength: 1, maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Detailed description of the interaction' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Interaction date and time' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional({ description: 'Duration in minutes', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @ApiProperty({ description: 'Interaction outcome', enum: InteractionOutcome })
  @IsEnum(InteractionOutcome)
  outcome: InteractionOutcome;

  @ApiPropertyOptional({ description: 'Next action required', minLength: 1, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  nextAction?: string;

  @ApiPropertyOptional({ description: 'Location of interaction' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({ description: 'Participants in interaction', type: [InteractionParticipantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InteractionParticipantDto)
  participants?: InteractionParticipantDto[];

  @ApiPropertyOptional({ description: 'Attached files/documents', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional({ description: 'Interaction tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Detailed notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Associated customer ID' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiPropertyOptional({ description: 'Associated contact ID' })
  @IsOptional()
  @IsString()
  contactId?: string;
}

export class UpdateInteractionDto extends PartialType(CreateInteractionDto) {
  @ApiPropertyOptional({ description: 'Associated customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;
}

export class InteractionQueryDto {
  @ApiPropertyOptional({ description: 'Filter by customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Filter by contact ID' })
  @IsOptional()
  @IsString()
  contactId?: string;

  @ApiPropertyOptional({ description: 'Filter by interaction type', enum: InteractionType })
  @IsOptional()
  @IsEnum(InteractionType)
  type?: InteractionType;

  @ApiPropertyOptional({ description: 'Filter by interaction direction', enum: InteractionDirection })
  @IsOptional()
  @IsEnum(InteractionDirection)
  direction?: InteractionDirection;

  @ApiPropertyOptional({ description: 'Filter by interaction outcome', enum: InteractionOutcome })
  @IsOptional()
  @IsEnum(InteractionOutcome)
  outcome?: InteractionOutcome;

  @ApiPropertyOptional({ description: 'Filter interactions from date' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Filter interactions to date' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Page number for pagination', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
