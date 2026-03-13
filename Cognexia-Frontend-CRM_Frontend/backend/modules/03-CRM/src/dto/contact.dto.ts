import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsUrl,
  IsNotEmpty,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ContactType, ContactStatus, ContactRole } from '../entities/contact.entity';

// Nested DTOs
export class WorkAddressDto {
  @ApiProperty({ description: 'Street address', minLength: 1, maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @IsNotEmpty()
  street: string;

  @ApiPropertyOptional({ description: 'Suite/Office number' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  suite?: string;

  @ApiProperty({ description: 'City', minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({ description: 'State/Province' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiProperty({ description: 'Country', minLength: 2, maxLength: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  country: string;

  @ApiProperty({ description: 'Postal/ZIP code', minLength: 1, maxLength: 20 })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  @IsNotEmpty()
  zipCode: string;
}

export class ContactEducationDto {
  @ApiPropertyOptional({ description: 'Degree/certification' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  degree?: string;

  @ApiPropertyOptional({ description: 'Institution name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  institution?: string;

  @ApiPropertyOptional({ description: 'Graduation year', minimum: 1950 })
  @IsOptional()
  @IsNumber()
  @Min(1950)
  @Max(new Date().getFullYear() + 10)
  graduationYear?: number;

  @ApiPropertyOptional({ description: 'Field of study' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fieldOfStudy?: string;

  @ApiPropertyOptional({ description: 'Certifications', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];
}

export class CommunicationPreferencesDto {
  @ApiProperty({ description: 'Preferred communication channel' })
  @IsString()
  @IsNotEmpty()
  preferredChannel: 'email' | 'phone' | 'linkedin' | 'video_call' | 'text';

  @ApiProperty({ description: 'Preferred contact time' })
  @IsString()
  @IsNotEmpty()
  preferredTime: string;

  @ApiProperty({ description: 'Timezone' })
  @IsString()
  @IsNotEmpty()
  timezone: string;

  @ApiProperty({ description: 'Contact frequency preference' })
  @IsString()
  @IsNotEmpty()
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';

  @ApiProperty({ description: 'Preferred language' })
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiProperty({ description: 'Do not call flag' })
  @IsBoolean()
  doNotCall: boolean;

  @ApiProperty({ description: 'Email opt-out flag' })
  @IsBoolean()
  emailOptOut: boolean;
}

// Main Contact DTOs
export class CreateContactDto {
  @ApiProperty({ description: 'Contact type', enum: ContactType })
  @IsEnum(ContactType)
  type: ContactType;

  @ApiProperty({ description: 'First name', minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name', minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ description: 'Middle name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  middleName?: string;

  @ApiProperty({ description: 'Job title', minLength: 1, maxLength: 150 })
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Department' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({ description: 'Contact role', enum: ContactRole })
  @IsOptional()
  @IsEnum(ContactRole)
  role?: ContactRole;

  @ApiPropertyOptional({ description: 'Seniority level' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  seniorityLevel?: string;

  @ApiProperty({ description: 'Primary email address', format: 'email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ description: 'Secondary email address', format: 'email' })
  @IsOptional()
  @IsEmail()
  secondaryEmail?: string;

  @ApiPropertyOptional({ description: 'Work phone number' })
  @IsOptional()
  @IsString()
  workPhone?: string;

  @ApiPropertyOptional({ description: 'Mobile phone number' })
  @IsOptional()
  @IsString()
  mobilePhone?: string;

  @ApiPropertyOptional({ description: 'Work address', type: WorkAddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkAddressDto)
  workAddress?: WorkAddressDto;

  @ApiPropertyOptional({ description: 'Years of experience', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  yearsOfExperience?: number;

  @ApiPropertyOptional({ description: 'Education background', type: ContactEducationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactEducationDto)
  education?: ContactEducationDto;

  @ApiPropertyOptional({ description: 'Skills and expertise', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ description: 'Decision making influence (1-10)', minimum: 1, maximum: 10 })
  @IsNumber()
  @Min(1)
  @Max(10)
  influence: number = 5;

  @ApiProperty({ description: 'Budget authority flag' })
  @IsBoolean()
  budgetAuthority: boolean = false;

  @ApiProperty({ description: 'Technical authority flag' })
  @IsBoolean()
  technicalAuthority: boolean = false;

  @ApiProperty({ description: 'Communication preferences', type: CommunicationPreferencesDto })
  @ValidateNested()
  @Type(() => CommunicationPreferencesDto)
  communicationPrefs: CommunicationPreferencesDto;

  @ApiPropertyOptional({ description: 'Birth date' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ description: 'Anniversary date' })
  @IsOptional()
  @IsDateString()
  anniversary?: string;

  @ApiPropertyOptional({ description: 'Contact tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Internal notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Associated customer ID' })
  @IsString()
  @IsNotEmpty()
  customerId: string;
}

export class UpdateContactDto extends PartialType(CreateContactDto) {
  @ApiPropertyOptional({ description: 'Associated customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;
}

export class ContactQueryDto {
  @ApiPropertyOptional({ description: 'Filter by contact type', enum: ContactType })
  @IsOptional()
  @IsEnum(ContactType)
  type?: ContactType;

  @ApiPropertyOptional({ description: 'Filter by contact status', enum: ContactStatus })
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @ApiPropertyOptional({ description: 'Filter by customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Search by name or email' })
  @IsOptional()
  @IsString()
  search?: string;

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
