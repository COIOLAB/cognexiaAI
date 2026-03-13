/**
 * CRM Module - Comprehensive Validation DTOs
 * Industry 5.0 ERP - Advanced CRM Data Validation
 */

import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDate,
  IsBoolean,
  IsArray,
  IsObject,
  ValidateNested,
  IsUUID,
  IsPositive,
  IsEmail,
  Min,
  Max,
  Length,
  Matches,
  ArrayMinSize,
  ArrayMaxSize,
  IsNotEmpty,
  IsDecimal,
  IsUrl,
  IsPhoneNumber,
  IsIn,
  IsJSON,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Enums for CRM Domain
export enum CustomerTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
}

export enum LeadSource {
  WEBSITE = 'WEBSITE',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  EMAIL_CAMPAIGN = 'EMAIL_CAMPAIGN',
  REFERRAL = 'REFERRAL',
  COLD_CALL = 'COLD_CALL',
  TRADE_SHOW = 'TRADE_SHOW',
  PARTNER = 'PARTNER',
  ADVERTISEMENT = 'ADVERTISEMENT',
  OTHER = 'OTHER',
}

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST',
  DISQUALIFIED = 'DISQUALIFIED',
}

export enum OpportunityStage {
  PROSPECTING = 'PROSPECTING',
  QUALIFICATION = 'QUALIFICATION',
  NEEDS_ANALYSIS = 'NEEDS_ANALYSIS',
  VALUE_PROPOSITION = 'VALUE_PROPOSITION',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
}

export enum InteractionType {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  MEETING = 'MEETING',
  DEMO = 'DEMO',
  PROPOSAL = 'PROPOSAL',
  SUPPORT = 'SUPPORT',
  SOCIAL = 'SOCIAL',
  CHAT = 'CHAT',
  WEBINAR = 'WEBINAR',
}

export enum CustomerSegment {
  ENTERPRISE = 'ENTERPRISE',
  MID_MARKET = 'MID_MARKET',
  SMB = 'SMB',
  STARTUP = 'STARTUP',
  NONPROFIT = 'NONPROFIT',
  GOVERNMENT = 'GOVERNMENT',
  EDUCATION = 'EDUCATION',
}

export enum CommunicationChannel {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  SMS = 'SMS',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  CHAT = 'CHAT',
  VIDEO_CALL = 'VIDEO_CALL',
  IN_PERSON = 'IN_PERSON',
  MAIL = 'MAIL',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// Address DTO
export class AddressDto {
  @ApiProperty({ description: 'Street address line 1', maxLength: 100 })
  @IsString({ message: 'Street 1 must be a string' })
  @IsNotEmpty({ message: 'Street 1 cannot be empty' })
  @Length(1, 100, { message: 'Street 1 must be between 1 and 100 characters' })
  street1: string;

  @ApiPropertyOptional({ description: 'Street address line 2', maxLength: 100 })
  @IsOptional()
  @IsString({ message: 'Street 2 must be a string' })
  @Length(0, 100, { message: 'Street 2 cannot exceed 100 characters' })
  street2?: string;

  @ApiProperty({ description: 'City', maxLength: 50 })
  @IsString({ message: 'City must be a string' })
  @IsNotEmpty({ message: 'City cannot be empty' })
  @Length(1, 50, { message: 'City must be between 1 and 50 characters' })
  city: string;

  @ApiProperty({ description: 'State/Province', maxLength: 50 })
  @IsString({ message: 'State must be a string' })
  @IsNotEmpty({ message: 'State cannot be empty' })
  @Length(1, 50, { message: 'State must be between 1 and 50 characters' })
  state: string;

  @ApiProperty({ description: 'Postal/ZIP code', maxLength: 20 })
  @IsString({ message: 'Postal code must be a string' })
  @IsNotEmpty({ message: 'Postal code cannot be empty' })
  @Length(1, 20, { message: 'Postal code must be between 1 and 20 characters' })
  @Matches(/^[A-Za-z0-9\s-]+$/, { message: 'Invalid postal code format' })
  postalCode: string;

  @ApiProperty({ description: 'Country code (ISO 3166)', maxLength: 3 })
  @IsString({ message: 'Country must be a string' })
  @IsNotEmpty({ message: 'Country cannot be empty' })
  @Length(2, 3, { message: 'Country must be 2 or 3 characters' })
  @Matches(/^[A-Z]{2,3}$/, { message: 'Country must be uppercase ISO code' })
  country: string;
}

// Customer DTOs
export class CreateCustomerDto {
  @ApiProperty({ description: 'Customer company name', maxLength: 100 })
  @IsString({ message: 'Company name must be a string' })
  @IsNotEmpty({ message: 'Company name cannot be empty' })
  @Length(2, 100, { message: 'Company name must be between 2 and 100 characters' })
  companyName: string;

  @ApiProperty({ description: 'Primary contact first name', maxLength: 50 })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name cannot be empty' })
  @Length(1, 50, { message: 'First name must be between 1 and 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'First name contains invalid characters' })
  firstName: string;

  @ApiProperty({ description: 'Primary contact last name', maxLength: 50 })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name cannot be empty' })
  @Length(1, 50, { message: 'Last name must be between 1 and 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'Last name contains invalid characters' })
  lastName: string;

  @ApiProperty({ description: 'Primary email address' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email: string;

  @ApiPropertyOptional({ description: 'Primary phone number' })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Invalid phone number format' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Company website URL' })
  @IsOptional()
  @IsUrl({}, { message: 'Invalid website URL format' })
  website?: string;

  @ApiProperty({ enum: CustomerTier, description: 'Customer tier level' })
  @IsEnum(CustomerTier, { message: 'Invalid customer tier' })
  tier: CustomerTier;

  @ApiProperty({ enum: CustomerSegment, description: 'Customer segment' })
  @IsEnum(CustomerSegment, { message: 'Invalid customer segment' })
  segment: CustomerSegment;

  @ApiProperty({ type: AddressDto, description: 'Company address' })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiPropertyOptional({ description: 'Company size (number of employees)', minimum: 1 })
  @IsOptional()
  @IsNumber({}, { message: 'Company size must be a valid number' })
  @IsPositive({ message: 'Company size must be positive' })
  @Min(1, { message: 'Company size must be at least 1' })
  companySize?: number;

  @ApiPropertyOptional({ description: 'Annual revenue', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Annual revenue must be a valid decimal' })
  @Min(0, { message: 'Annual revenue cannot be negative' })
  annualRevenue?: number;

  @ApiPropertyOptional({ description: 'Industry/vertical', maxLength: 100 })
  @IsOptional()
  @IsString({ message: 'Industry must be a string' })
  @Length(0, 100, { message: 'Industry cannot exceed 100 characters' })
  industry?: string;

  @ApiPropertyOptional({ description: 'Customer notes', maxLength: 1000 })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @Length(0, 1000, { message: 'Notes cannot exceed 1000 characters' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Preferred communication channel', enum: CommunicationChannel })
  @IsOptional()
  @IsEnum(CommunicationChannel, { message: 'Invalid communication channel' })
  preferredCommunicationChannel?: CommunicationChannel;

  @ApiPropertyOptional({ description: 'Customer tags', maxItems: 10 })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @ArrayMaxSize(10, { message: 'Cannot have more than 10 tags' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Custom fields as JSON object' })
  @IsOptional()
  @IsObject({ message: 'Custom fields must be an object' })
  customFields?: Record<string, any>;
}

export class UpdateCustomerDto {
  @ApiPropertyOptional({ description: 'Customer company name', maxLength: 100 })
  @IsOptional()
  @IsString({ message: 'Company name must be a string' })
  @Length(2, 100, { message: 'Company name must be between 2 and 100 characters' })
  companyName?: string;

  @ApiPropertyOptional({ description: 'Primary contact first name', maxLength: 50 })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @Length(1, 50, { message: 'First name must be between 1 and 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'First name contains invalid characters' })
  firstName?: string;

  @ApiPropertyOptional({ description: 'Primary contact last name', maxLength: 50 })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @Length(1, 50, { message: 'Last name must be between 1 and 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'Last name contains invalid characters' })
  lastName?: string;

  @ApiPropertyOptional({ description: 'Primary email address' })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ApiPropertyOptional({ description: 'Primary phone number' })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Invalid phone number format' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Company website URL' })
  @IsOptional()
  @IsUrl({}, { message: 'Invalid website URL format' })
  website?: string;

  @ApiPropertyOptional({ enum: CustomerTier, description: 'Customer tier level' })
  @IsOptional()
  @IsEnum(CustomerTier, { message: 'Invalid customer tier' })
  tier?: CustomerTier;

  @ApiPropertyOptional({ enum: CustomerSegment, description: 'Customer segment' })
  @IsOptional()
  @IsEnum(CustomerSegment, { message: 'Invalid customer segment' })
  segment?: CustomerSegment;

  @ApiPropertyOptional({ type: AddressDto, description: 'Company address' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional({ description: 'Company size (number of employees)', minimum: 1 })
  @IsOptional()
  @IsNumber({}, { message: 'Company size must be a valid number' })
  @IsPositive({ message: 'Company size must be positive' })
  companySize?: number;

  @ApiPropertyOptional({ description: 'Annual revenue', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Annual revenue must be a valid decimal' })
  @Min(0, { message: 'Annual revenue cannot be negative' })
  annualRevenue?: number;

  @ApiPropertyOptional({ description: 'Customer notes', maxLength: 1000 })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @Length(0, 1000, { message: 'Notes cannot exceed 1000 characters' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Customer tags', maxItems: 10 })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @ArrayMaxSize(10, { message: 'Cannot have more than 10 tags' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];
}

// Lead DTOs
export class CreateLeadDto {
  @ApiProperty({ description: 'Lead first name', maxLength: 50 })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name cannot be empty' })
  @Length(1, 50, { message: 'First name must be between 1 and 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'First name contains invalid characters' })
  firstName: string;

  @ApiProperty({ description: 'Lead last name', maxLength: 50 })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name cannot be empty' })
  @Length(1, 50, { message: 'Last name must be between 1 and 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'Last name contains invalid characters' })
  lastName: string;

  @ApiProperty({ description: 'Lead email address' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email: string;

  @ApiPropertyOptional({ description: 'Lead phone number' })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Invalid phone number format' })
  phone?: string;

  @ApiProperty({ description: 'Company name', maxLength: 100 })
  @IsString({ message: 'Company name must be a string' })
  @IsNotEmpty({ message: 'Company name cannot be empty' })
  @Length(1, 100, { message: 'Company name must be between 1 and 100 characters' })
  company: string;

  @ApiPropertyOptional({ description: 'Job title', maxLength: 100 })
  @IsOptional()
  @IsString({ message: 'Job title must be a string' })
  @Length(0, 100, { message: 'Job title cannot exceed 100 characters' })
  jobTitle?: string;

  @ApiProperty({ enum: LeadSource, description: 'How the lead was acquired' })
  @IsEnum(LeadSource, { message: 'Invalid lead source' })
  source: LeadSource;

  @ApiProperty({ enum: LeadStatus, description: 'Current lead status', default: LeadStatus.NEW })
  @IsEnum(LeadStatus, { message: 'Invalid lead status' })
  status: LeadStatus = LeadStatus.NEW;

  @ApiPropertyOptional({ description: 'Lead score (0-100)', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber({}, { message: 'Lead score must be a valid number' })
  @Min(0, { message: 'Lead score cannot be negative' })
  @Max(100, { message: 'Lead score cannot exceed 100' })
  score?: number;

  @ApiPropertyOptional({ description: 'Estimated deal value', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Deal value must be a valid decimal' })
  @Min(0, { message: 'Deal value cannot be negative' })
  estimatedValue?: number;

  @ApiPropertyOptional({ description: 'Expected close date' })
  @IsOptional()
  @IsDate({ message: 'Expected close date must be a valid date' })
  @Type(() => Date)
  expectedCloseDate?: Date;

  @ApiPropertyOptional({ description: 'Lead notes', maxLength: 1000 })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @Length(0, 1000, { message: 'Notes cannot exceed 1000 characters' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Assigned sales representative ID' })
  @IsOptional()
  @IsString({ message: 'Assigned to must be a string' })
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Lead tags', maxItems: 10 })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @ArrayMaxSize(10, { message: 'Cannot have more than 10 tags' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Lead qualification criteria' })
  @IsOptional()
  @IsObject({ message: 'Qualification criteria must be an object' })
  qualificationCriteria?: {
    budget?: number;
    authority?: boolean;
    need?: string;
    timeline?: string;
  };
}

export class UpdateLeadDto {
  @ApiPropertyOptional({ description: 'Lead first name', maxLength: 50 })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @Length(1, 50, { message: 'First name must be between 1 and 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'First name contains invalid characters' })
  firstName?: string;

  @ApiPropertyOptional({ description: 'Lead last name', maxLength: 50 })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @Length(1, 50, { message: 'Last name must be between 1 and 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'Last name contains invalid characters' })
  lastName?: string;

  @ApiPropertyOptional({ description: 'Lead email address' })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ApiPropertyOptional({ description: 'Lead phone number' })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Invalid phone number format' })
  phone?: string;

  @ApiPropertyOptional({ enum: LeadStatus, description: 'Current lead status' })
  @IsOptional()
  @IsEnum(LeadStatus, { message: 'Invalid lead status' })
  status?: LeadStatus;

  @ApiPropertyOptional({ description: 'Lead score (0-100)', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber({}, { message: 'Lead score must be a valid number' })
  @Min(0, { message: 'Lead score cannot be negative' })
  @Max(100, { message: 'Lead score cannot exceed 100' })
  score?: number;

  @ApiPropertyOptional({ description: 'Estimated deal value', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Deal value must be a valid decimal' })
  @Min(0, { message: 'Deal value cannot be negative' })
  estimatedValue?: number;

  @ApiPropertyOptional({ description: 'Expected close date' })
  @IsOptional()
  @IsDate({ message: 'Expected close date must be a valid date' })
  @Type(() => Date)
  expectedCloseDate?: Date;

  @ApiPropertyOptional({ description: 'Lead notes', maxLength: 1000 })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @Length(0, 1000, { message: 'Notes cannot exceed 1000 characters' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Assigned sales representative ID' })
  @IsOptional()
  @IsString({ message: 'Assigned to must be a string' })
  assignedTo?: string;
}

// Opportunity DTOs
export class CreateOpportunityDto {
  @ApiProperty({ description: 'Opportunity name', maxLength: 100 })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  name: string;

  @ApiProperty({ description: 'Associated customer ID' })
  @IsString({ message: 'Customer ID must be a string' })
  @IsNotEmpty({ message: 'Customer ID cannot be empty' })
  customerId: string;

  @ApiProperty({ description: 'Opportunity value', minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Value must be a valid decimal' })
  @Min(0, { message: 'Value cannot be negative' })
  value: number;

  @ApiProperty({ enum: OpportunityStage, description: 'Current opportunity stage' })
  @IsEnum(OpportunityStage, { message: 'Invalid opportunity stage' })
  stage: OpportunityStage;

  @ApiProperty({ description: 'Probability of closing (0-100)', minimum: 0, maximum: 100 })
  @IsNumber({}, { message: 'Probability must be a valid number' })
  @Min(0, { message: 'Probability cannot be negative' })
  @Max(100, { message: 'Probability cannot exceed 100' })
  probability: number;

  @ApiProperty({ description: 'Expected close date' })
  @IsDate({ message: 'Expected close date must be a valid date' })
  @Type(() => Date)
  expectedCloseDate: Date;

  @ApiPropertyOptional({ description: 'Opportunity description', maxLength: 500 })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Length(0, 500, { message: 'Description cannot exceed 500 characters' })
  description?: string;

  @ApiPropertyOptional({ description: 'Assigned sales representative ID' })
  @IsOptional()
  @IsString({ message: 'Owner ID must be a string' })
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Competitor information', maxLength: 200 })
  @IsOptional()
  @IsString({ message: 'Competitors must be a string' })
  @Length(0, 200, { message: 'Competitors cannot exceed 200 characters' })
  competitors?: string;

  @ApiPropertyOptional({ description: 'Next steps', maxLength: 300 })
  @IsOptional()
  @IsString({ message: 'Next steps must be a string' })
  @Length(0, 300, { message: 'Next steps cannot exceed 300 characters' })
  nextSteps?: string;

  @ApiPropertyOptional({ description: 'Products/services involved' })
  @IsOptional()
  @IsArray({ message: 'Products must be an array' })
  @IsString({ each: true, message: 'Each product must be a string' })
  products?: string[];

  @ApiPropertyOptional({ description: 'Opportunity tags', maxItems: 10 })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @ArrayMaxSize(10, { message: 'Cannot have more than 10 tags' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];
}

export class UpdateOpportunityDto {
  @ApiPropertyOptional({ description: 'Opportunity name', maxLength: 100 })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  name?: string;

  @ApiPropertyOptional({ description: 'Opportunity value', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Value must be a valid decimal' })
  @Min(0, { message: 'Value cannot be negative' })
  value?: number;

  @ApiPropertyOptional({ enum: OpportunityStage, description: 'Current opportunity stage' })
  @IsOptional()
  @IsEnum(OpportunityStage, { message: 'Invalid opportunity stage' })
  stage?: OpportunityStage;

  @ApiPropertyOptional({ description: 'Probability of closing (0-100)', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber({}, { message: 'Probability must be a valid number' })
  @Min(0, { message: 'Probability cannot be negative' })
  @Max(100, { message: 'Probability cannot exceed 100' })
  probability?: number;

  @ApiPropertyOptional({ description: 'Expected close date' })
  @IsOptional()
  @IsDate({ message: 'Expected close date must be a valid date' })
  @Type(() => Date)
  expectedCloseDate?: Date;

  @ApiPropertyOptional({ description: 'Opportunity description', maxLength: 500 })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Length(0, 500, { message: 'Description cannot exceed 500 characters' })
  description?: string;

  @ApiPropertyOptional({ description: 'Next steps', maxLength: 300 })
  @IsOptional()
  @IsString({ message: 'Next steps must be a string' })
  @Length(0, 300, { message: 'Next steps cannot exceed 300 characters' })
  nextSteps?: string;
}

// Interaction DTOs
export class CreateInteractionDto {
  @ApiProperty({ description: 'Customer or lead ID this interaction relates to' })
  @IsString({ message: 'Contact ID must be a string' })
  @IsNotEmpty({ message: 'Contact ID cannot be empty' })
  contactId: string;

  @ApiProperty({ enum: InteractionType, description: 'Type of interaction' })
  @IsEnum(InteractionType, { message: 'Invalid interaction type' })
  type: InteractionType;

  @ApiProperty({ description: 'Subject/title of interaction', maxLength: 200 })
  @IsString({ message: 'Subject must be a string' })
  @IsNotEmpty({ message: 'Subject cannot be empty' })
  @Length(1, 200, { message: 'Subject must be between 1 and 200 characters' })
  subject: string;

  @ApiProperty({ description: 'Detailed description of interaction', maxLength: 2000 })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @Length(1, 2000, { message: 'Description must be between 1 and 2000 characters' })
  description: string;

  @ApiPropertyOptional({ description: 'Duration in minutes', minimum: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'Duration must be a valid number' })
  @Min(0, { message: 'Duration cannot be negative' })
  durationMinutes?: number;

  @ApiPropertyOptional({ description: 'Date and time of interaction' })
  @IsOptional()
  @IsDate({ message: 'Interaction date must be a valid date' })
  @Type(() => Date)
  interactionDate?: Date;

  @ApiPropertyOptional({ description: 'Staff member who handled the interaction' })
  @IsOptional()
  @IsString({ message: 'Staff member ID must be a string' })
  staffMemberId?: string;

  @ApiPropertyOptional({ description: 'Follow-up required' })
  @IsOptional()
  @IsBoolean({ message: 'Follow-up required must be a boolean' })
  followUpRequired?: boolean;

  @ApiPropertyOptional({ description: 'Follow-up date if required' })
  @IsOptional()
  @IsDate({ message: 'Follow-up date must be a valid date' })
  @Type(() => Date)
  followUpDate?: Date;

  @ApiPropertyOptional({ description: 'Interaction outcome/result', maxLength: 500 })
  @IsOptional()
  @IsString({ message: 'Outcome must be a string' })
  @Length(0, 500, { message: 'Outcome cannot exceed 500 characters' })
  outcome?: string;

  @ApiPropertyOptional({ description: 'Attachments/documents related to interaction' })
  @IsOptional()
  @IsArray({ message: 'Attachments must be an array' })
  @IsString({ each: true, message: 'Each attachment must be a string' })
  attachments?: string[];
}

// Contact DTOs
export class CreateContactDto {
  @ApiProperty({ description: 'Contact first name', maxLength: 50 })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name cannot be empty' })
  @Length(1, 50, { message: 'First name must be between 1 and 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'First name contains invalid characters' })
  firstName: string;

  @ApiProperty({ description: 'Contact last name', maxLength: 50 })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name cannot be empty' })
  @Length(1, 50, { message: 'Last name must be between 1 and 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'Last name contains invalid characters' })
  lastName: string;

  @ApiProperty({ description: 'Contact email address' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email: string;

  @ApiPropertyOptional({ description: 'Contact phone number' })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Invalid phone number format' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Job title', maxLength: 100 })
  @IsOptional()
  @IsString({ message: 'Job title must be a string' })
  @Length(0, 100, { message: 'Job title cannot exceed 100 characters' })
  jobTitle?: string;

  @ApiPropertyOptional({ description: 'Department', maxLength: 100 })
  @IsOptional()
  @IsString({ message: 'Department must be a string' })
  @Length(0, 100, { message: 'Department cannot exceed 100 characters' })
  department?: string;

  @ApiProperty({ description: 'Associated customer ID' })
  @IsString({ message: 'Customer ID must be a string' })
  @IsNotEmpty({ message: 'Customer ID cannot be empty' })
  customerId: string;

  @ApiPropertyOptional({ description: 'Primary contact for customer' })
  @IsOptional()
  @IsBoolean({ message: 'Is primary must be a boolean' })
  isPrimary?: boolean;

  @ApiPropertyOptional({ description: 'Contact notes', maxLength: 1000 })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @Length(0, 1000, { message: 'Notes cannot exceed 1000 characters' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Preferred communication channel', enum: CommunicationChannel })
  @IsOptional()
  @IsEnum(CommunicationChannel, { message: 'Invalid communication channel' })
  preferredChannel?: CommunicationChannel;
}

// Search and Filter DTOs
export class CustomerSearchDto {
  @ApiPropertyOptional({ description: 'Search by company name (partial match)' })
  @IsOptional()
  @IsString({ message: 'Company name search must be a string' })
  @Length(1, 100, { message: 'Company name search must be between 1 and 100 characters' })
  companyName?: string;

  @ApiPropertyOptional({ description: 'Search by contact name (partial match)' })
  @IsOptional()
  @IsString({ message: 'Contact name search must be a string' })
  @Length(1, 100, { message: 'Contact name search must be between 1 and 100 characters' })
  contactName?: string;

  @ApiPropertyOptional({ description: 'Search by email (partial match)' })
  @IsOptional()
  @IsString({ message: 'Email search must be a string' })
  email?: string;

  @ApiPropertyOptional({ enum: CustomerTier, description: 'Filter by customer tier' })
  @IsOptional()
  @IsEnum(CustomerTier, { message: 'Invalid customer tier' })
  tier?: CustomerTier;

  @ApiPropertyOptional({ enum: CustomerSegment, description: 'Filter by customer segment' })
  @IsOptional()
  @IsEnum(CustomerSegment, { message: 'Invalid customer segment' })
  segment?: CustomerSegment;

  @ApiPropertyOptional({ description: 'Filter by industry' })
  @IsOptional()
  @IsString({ message: 'Industry must be a string' })
  industry?: string;

  @ApiPropertyOptional({ description: 'Minimum annual revenue' })
  @IsOptional()
  @IsNumber({}, { message: 'Min revenue must be a valid number' })
  @Min(0, { message: 'Min revenue cannot be negative' })
  minAnnualRevenue?: number;

  @ApiPropertyOptional({ description: 'Maximum annual revenue' })
  @IsOptional()
  @IsNumber({}, { message: 'Max revenue must be a valid number' })
  @Min(0, { message: 'Max revenue cannot be negative' })
  maxAnnualRevenue?: number;

  @ApiPropertyOptional({ description: 'Minimum company size' })
  @IsOptional()
  @IsNumber({}, { message: 'Min company size must be a valid number' })
  @Min(1, { message: 'Min company size must be at least 1' })
  minCompanySize?: number;

  @ApiPropertyOptional({ description: 'Maximum company size' })
  @IsOptional()
  @IsNumber({}, { message: 'Max company size must be a valid number' })
  @Min(1, { message: 'Max company size must be at least 1' })
  maxCompanySize?: number;

  @ApiPropertyOptional({ description: 'Filter by tags' })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];
}

export class LeadSearchDto {
  @ApiPropertyOptional({ description: 'Search by name (partial match)' })
  @IsOptional()
  @IsString({ message: 'Name search must be a string' })
  @Length(1, 100, { message: 'Name search must be between 1 and 100 characters' })
  name?: string;

  @ApiPropertyOptional({ description: 'Search by email (partial match)' })
  @IsOptional()
  @IsString({ message: 'Email search must be a string' })
  email?: string;

  @ApiPropertyOptional({ description: 'Search by company (partial match)' })
  @IsOptional()
  @IsString({ message: 'Company search must be a string' })
  company?: string;

  @ApiPropertyOptional({ enum: LeadStatus, description: 'Filter by lead status' })
  @IsOptional()
  @IsEnum(LeadStatus, { message: 'Invalid lead status' })
  status?: LeadStatus;

  @ApiPropertyOptional({ enum: LeadSource, description: 'Filter by lead source' })
  @IsOptional()
  @IsEnum(LeadSource, { message: 'Invalid lead source' })
  source?: LeadSource;

  @ApiPropertyOptional({ description: 'Minimum lead score' })
  @IsOptional()
  @IsNumber({}, { message: 'Min score must be a valid number' })
  @Min(0, { message: 'Min score cannot be negative' })
  @Max(100, { message: 'Min score cannot exceed 100' })
  minScore?: number;

  @ApiPropertyOptional({ description: 'Maximum lead score' })
  @IsOptional()
  @IsNumber({}, { message: 'Max score must be a valid number' })
  @Min(0, { message: 'Max score cannot be negative' })
  @Max(100, { message: 'Max score cannot exceed 100' })
  maxScore?: number;

  @ApiPropertyOptional({ description: 'Filter by assigned sales rep' })
  @IsOptional()
  @IsString({ message: 'Assigned to must be a string' })
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Created from date' })
  @IsOptional()
  @IsDate({ message: 'Created from must be a valid date' })
  @Type(() => Date)
  createdFrom?: Date;

  @ApiPropertyOptional({ description: 'Created to date' })
  @IsOptional()
  @IsDate({ message: 'Created to must be a valid date' })
  @Type(() => Date)
  createdTo?: Date;
}

export class OpportunitySearchDto {
  @ApiPropertyOptional({ description: 'Search by opportunity name (partial match)' })
  @IsOptional()
  @IsString({ message: 'Name search must be a string' })
  @Length(1, 100, { message: 'Name search must be between 1 and 100 characters' })
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by customer ID' })
  @IsOptional()
  @IsString({ message: 'Customer ID must be a string' })
  customerId?: string;

  @ApiPropertyOptional({ enum: OpportunityStage, description: 'Filter by stage' })
  @IsOptional()
  @IsEnum(OpportunityStage, { message: 'Invalid opportunity stage' })
  stage?: OpportunityStage;

  @ApiPropertyOptional({ description: 'Minimum opportunity value' })
  @IsOptional()
  @IsNumber({}, { message: 'Min value must be a valid number' })
  @Min(0, { message: 'Min value cannot be negative' })
  minValue?: number;

  @ApiPropertyOptional({ description: 'Maximum opportunity value' })
  @IsOptional()
  @IsNumber({}, { message: 'Max value must be a valid number' })
  @Min(0, { message: 'Max value cannot be negative' })
  maxValue?: number;

  @ApiPropertyOptional({ description: 'Expected close date from' })
  @IsOptional()
  @IsDate({ message: 'Close date from must be a valid date' })
  @Type(() => Date)
  expectedCloseFrom?: Date;

  @ApiPropertyOptional({ description: 'Expected close date to' })
  @IsOptional()
  @IsDate({ message: 'Close date to must be a valid date' })
  @Type(() => Date)
  expectedCloseTo?: Date;

  @ApiPropertyOptional({ description: 'Filter by opportunity owner' })
  @IsOptional()
  @IsString({ message: 'Owner ID must be a string' })
  ownerId?: string;
}

// Bulk Operations DTOs
export class BulkLeadAssignmentDto {
  @ApiProperty({ description: 'Array of lead IDs to assign' })
  @IsArray({ message: 'Lead IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one lead ID is required' })
  @ArrayMaxSize(100, { message: 'Cannot assign more than 100 leads at once' })
  @IsString({ each: true, message: 'Each lead ID must be a string' })
  leadIds: string[];

  @ApiProperty({ description: 'Sales representative ID to assign leads to' })
  @IsString({ message: 'Assigned to must be a string' })
  @IsNotEmpty({ message: 'Assigned to cannot be empty' })
  assignedTo: string;

  @ApiPropertyOptional({ description: 'Assignment notes', maxLength: 500 })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @Length(0, 500, { message: 'Notes cannot exceed 500 characters' })
  notes?: string;
}

export class BulkLeadStatusUpdateDto {
  @ApiProperty({ description: 'Array of lead IDs to update' })
  @IsArray({ message: 'Lead IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one lead ID is required' })
  @ArrayMaxSize(100, { message: 'Cannot update more than 100 leads at once' })
  @IsString({ each: true, message: 'Each lead ID must be a string' })
  leadIds: string[];

  @ApiProperty({ enum: LeadStatus, description: 'New status for all leads' })
  @IsEnum(LeadStatus, { message: 'Invalid lead status' })
  status: LeadStatus;

  @ApiPropertyOptional({ description: 'Status change reason', maxLength: 500 })
  @IsOptional()
  @IsString({ message: 'Reason must be a string' })
  @Length(0, 500, { message: 'Reason cannot exceed 500 characters' })
  reason?: string;
}

export class BulkCustomerTagUpdateDto {
  @ApiProperty({ description: 'Array of customer IDs to update' })
  @IsArray({ message: 'Customer IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one customer ID is required' })
  @ArrayMaxSize(100, { message: 'Cannot update more than 100 customers at once' })
  @IsString({ each: true, message: 'Each customer ID must be a string' })
  customerIds: string[];

  @ApiProperty({ description: 'Tags to add', maxItems: 10 })
  @IsArray({ message: 'Tags to add must be an array' })
  @ArrayMaxSize(10, { message: 'Cannot add more than 10 tags' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tagsToAdd: string[];

  @ApiPropertyOptional({ description: 'Tags to remove', maxItems: 10 })
  @IsOptional()
  @IsArray({ message: 'Tags to remove must be an array' })
  @ArrayMaxSize(10, { message: 'Cannot remove more than 10 tags' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tagsToRemove?: string[];
}

// AI and Analytics DTOs
export class CustomerAnalyticsRequestDto {
  @ApiPropertyOptional({ description: 'Date range start for analytics' })
  @IsOptional()
  @IsDate({ message: 'Date from must be a valid date' })
  @Type(() => Date)
  dateFrom?: Date;

  @ApiPropertyOptional({ description: 'Date range end for analytics' })
  @IsOptional()
  @IsDate({ message: 'Date to must be a valid date' })
  @Type(() => Date)
  dateTo?: Date;

  @ApiPropertyOptional({ description: 'Customer segments to include' })
  @IsOptional()
  @IsArray({ message: 'Segments must be an array' })
  @IsEnum(CustomerSegment, { each: true, message: 'Each segment must be valid' })
  segments?: CustomerSegment[];

  @ApiPropertyOptional({ description: 'Metrics to include in analytics' })
  @IsOptional()
  @IsArray({ message: 'Metrics must be an array' })
  @IsString({ each: true, message: 'Each metric must be a string' })
  @IsIn(['engagement', 'satisfaction', 'retention', 'lifetime_value', 'churn_risk'], 
    { each: true, message: 'Invalid metric specified' })
  metrics?: string[];
}

export class AIConversationRequestDto {
  @ApiProperty({ description: 'Customer ID for AI conversation' })
  @IsString({ message: 'Customer ID must be a string' })
  @IsNotEmpty({ message: 'Customer ID cannot be empty' })
  customerId: string;

  @ApiProperty({ description: 'Conversation message', maxLength: 1000 })
  @IsString({ message: 'Message must be a string' })
  @IsNotEmpty({ message: 'Message cannot be empty' })
  @Length(1, 1000, { message: 'Message must be between 1 and 1000 characters' })
  message: string;

  @ApiProperty({ enum: CommunicationChannel, description: 'Communication channel' })
  @IsEnum(CommunicationChannel, { message: 'Invalid communication channel' })
  channel: CommunicationChannel;

  @ApiPropertyOptional({ description: 'Conversation context' })
  @IsOptional()
  @IsObject({ message: 'Context must be an object' })
  context?: Record<string, any>;
}

// Pagination DTO
export class PaginationDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Page must be a valid number' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a valid number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsString({ message: 'Sort field must be a string' })
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsIn(['ASC', 'DESC'], { message: 'Sort order must be ASC or DESC' })
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

// Response DTOs for API documentation
export class CRMApiResponseDto<T> {
  @ApiProperty({ description: 'Indicates if the request was successful' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiPropertyOptional({ description: 'Response data' })
  data?: T;

  @ApiPropertyOptional({ description: 'Error details (if any)' })
  errors?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  metadata?: any;
}

export class CRMPaginatedResponseDto<T> {
  @ApiProperty({ description: 'Array of data items' })
  items: T[];

  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  pages: number;

  @ApiProperty({ description: 'Indicates if there is a next page' })
  hasNext: boolean;

  @ApiProperty({ description: 'Indicates if there is a previous page' })
  hasPrev: boolean;
}
