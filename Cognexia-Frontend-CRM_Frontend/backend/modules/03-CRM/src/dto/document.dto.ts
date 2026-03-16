import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  IsNumber,
  IsDateString,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentType, DocumentStatus } from '../entities/document.entity';
import { SignatureStatus, SignatureProvider } from '../entities/document-signature.entity';
import { ContractType, ContractStatus, RenewalType } from '../entities/contract.entity';

export class UploadDocumentDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: {
    tags?: string[];
    category?: string;
    isConfidential?: boolean;
    accessLevel?: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sharedWith?: string[];
}

export class UpdateDocumentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: DocumentStatus })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sharedWith?: string[];
}

export class CreateDocumentVersionDto {
  @ApiProperty()
  @IsString()
  changeNote: string;
}

export class RequestSignatureDto {
  @ApiProperty()
  @IsString()
  documentId: string;

  @ApiProperty()
  @IsString()
  signerName: string;

  @ApiProperty()
  @IsString()
  signerEmail: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  signerRole?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  signingOrder?: number;

  @ApiPropertyOptional({ enum: SignatureProvider })
  @IsOptional()
  @IsEnum(SignatureProvider)
  provider?: SignatureProvider;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class SignDocumentDto {
  @ApiProperty()
  @IsString()
  signatureData: string; // Base64 encoded signature

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ipAddress?: string;
}

export class CreateContractDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ContractType })
  @IsEnum(ContractType)
  contractType: ContractType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  billingFrequency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  recurringAmount?: number;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ enum: RenewalType })
  @IsOptional()
  @IsEnum(RenewalType)
  renewalType?: RenewalType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  renewalNoticeDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  renewalTermMonths?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class UpdateContractDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: ContractStatus })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  billingFrequency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  recurringAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: RenewalType })
  @IsOptional()
  @IsEnum(RenewalType)
  renewalType?: RenewalType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  renewalNoticeDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class RenewContractDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  newStartDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  newEndDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  newValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  newRecurringAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
