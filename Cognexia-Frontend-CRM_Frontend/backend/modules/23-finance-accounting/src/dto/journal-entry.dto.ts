/**
 * Industry 5.0 ERP Backend - Finance & Accounting Module
 * Journal Entry Data Transfer Objects
 * 
 * Complete DTOs for journal entry operations with validation
 * 
 * @author AI Assistant - Industry 5.0 Pioneer
 * @version 3.0.0
 * @date 2024-08-22
 * @compliance SOX, GAAP, IFRS
 */

import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
  IsUUID,
  ValidateNested,
  Min,
  Max,
  Length,
  IsNotEmpty,
  IsInt,
  ArrayMinSize,
  ArrayMaxSize,
  IsDateString,
  Matches,
  IsIn,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// Re-export enums from general-ledger.dto to avoid conflicts
export {
  EntryType,
  PostingStatus,
  DocumentType,
  BalanceType,
  AccountType
} from './general-ledger.dto';

// Re-export DTOs from general-ledger.dto to avoid conflicts
export {
  SourceDocumentDto,
  DimensionDto,
  TaxInformationDto,
  ApprovalHistoryDto,
  ApprovalWorkflowDto,
  AIValidationDto,
  AuditTrailDto,
  JournalLineDto,
  CreateJournalEntryDto,
  UpdateJournalEntryDto,
  JournalEntryResponseDto,
  JournalEntryQueryDto,
  BulkJournalEntryOperationDto,
  JournalEntryValidationDto
} from './general-ledger.dto';

// Additional Journal Entry specific DTOs

export class JournalEntryFilterDto {
  @ApiPropertyOptional({ description: 'Filter by reference number' })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ description: 'Filter by description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Minimum amount filter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({ description: 'Maximum amount filter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAmount?: number;
}

export class JournalEntryReversalDto {
  @ApiProperty({ description: 'Journal entry ID to reverse' })
  @IsUUID()
  entryId: string;

  @ApiProperty({ description: 'Reversal reason' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  reversalReason: string;

  @ApiProperty({ description: 'Reversal date' })
  @IsDateString()
  reversalDate: string;

  @ApiPropertyOptional({ description: 'Automatic posting' })
  @IsOptional()
  @IsBoolean()
  autoPost?: boolean = true;
}

export class RecurringJournalEntryDto {
  @ApiProperty({ description: 'Base journal entry template data' })
  @IsObject()
  templateEntry: Record<string, any>;

  @ApiProperty({ description: 'Recurrence frequency' })
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'])
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';

  @ApiProperty({ description: 'Start date for recurring entries' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ description: 'End date for recurring entries' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Number of occurrences' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  occurrences?: number;

  @ApiPropertyOptional({ description: 'Auto-post recurring entries' })
  @IsOptional()
  @IsBoolean()
  autoPost?: boolean = false;
}
