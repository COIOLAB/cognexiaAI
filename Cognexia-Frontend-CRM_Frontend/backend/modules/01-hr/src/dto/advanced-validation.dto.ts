/**
 * HR Module - Advanced Validation DTOs
 * Industry 5.0 ERP - Comprehensive Data Validation
 */

import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDate,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  Max,
  Length,
  Matches,
  IsPhoneNumber,
  IsUUID,
  IsDecimal,
  ArrayMinSize,
  ArrayMaxSize,
  IsIn,
  IsPositive,
  IsNotEmpty,
  IsObject,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Enums
export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
  SUSPENDED = 'SUSPENDED'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY'
}

export enum PayrollFrequency {
  WEEKLY = 'WEEKLY',
  BI_WEEKLY = 'BI_WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY'
}

export enum PerformanceRating {
  EXCEEDS_EXPECTATIONS = 'EXCEEDS_EXPECTATIONS',
  MEETS_EXPECTATIONS = 'MEETS_EXPECTATIONS',
  NEEDS_IMPROVEMENT = 'NEEDS_IMPROVEMENT',
  UNSATISFACTORY = 'UNSATISFACTORY'
}

// Address DTO
export class AddressDto {
  @ApiProperty({ description: 'Street address' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  street: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  city: string;

  @ApiProperty({ description: 'State or Province' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  state: string;

  @ApiProperty({ description: 'ZIP or Postal Code' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9A-Za-z\s\-]{3,20}$/, { message: 'Invalid postal code format' })
  postalCode: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  country: string;
}

// Emergency Contact DTO
export class EmergencyContactDto {
  @ApiProperty({ description: 'Full name of emergency contact' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiProperty({ description: 'Relationship to employee' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  relationship: string;

  @ApiProperty({ description: 'Phone number' })
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}

// Employee Creation DTO
export class CreateEmployeeDto {
  @ApiProperty({ description: 'Employee ID (must be unique)' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  @Matches(/^[A-Za-z0-9\-_]+$/, { message: 'Employee ID can only contain letters, numbers, hyphens, and underscores' })
  employeeId: string;

  @ApiProperty({ description: 'First name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  @Matches(/^[a-zA-Z\s\-'\.]+$/, { message: 'First name can only contain letters, spaces, hyphens, apostrophes, and periods' })
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  @Matches(/^[a-zA-Z\s\-'\.]+$/, { message: 'Last name can only contain letters, spaces, hyphens, apostrophes, and periods' })
  lastName: string;

  @ApiPropertyOptional({ description: 'Middle name' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  middleName?: string;

  @ApiProperty({ description: 'Email address (must be unique)' })
  @IsEmail()
  @Length(5, 254)
  @Transform(({ value }) => value?.toLowerCase())
  email: string;

  @ApiProperty({ description: 'Phone number' })
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({ description: 'Date of birth', type: Date })
  @Type(() => Date)
  @IsDate()
  dateOfBirth: Date;

  @ApiProperty({ description: 'Gender', enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ description: 'Employee status', enum: EmployeeStatus })
  @IsEnum(EmployeeStatus)
  status: EmployeeStatus;

  @ApiProperty({ description: 'Hire date', type: Date })
  @Type(() => Date)
  @IsDate()
  hireDate: Date;

  @ApiProperty({ description: 'Department ID' })
  @IsUUID()
  departmentId: string;

  @ApiProperty({ description: 'Position ID' })
  @IsUUID()
  positionId: string;

  @ApiProperty({ description: 'Manager ID' })
  @IsOptional()
  @IsUUID()
  managerId?: string;

  @ApiProperty({ description: 'Home address' })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty({ description: 'Emergency contacts', type: [EmergencyContactDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => EmergencyContactDto)
  emergencyContacts: EmergencyContactDto[];

  @ApiPropertyOptional({ description: 'Additional employee data' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

// Payroll Creation DTO
export class CreatePayrollDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsUUID()
  employeeId: string;

  @ApiProperty({ description: 'Pay period start date', type: Date })
  @Type(() => Date)
  @IsDate()
  periodStart: Date;

  @ApiProperty({ description: 'Pay period end date', type: Date })
  @Type(() => Date)
  @IsDate()
  periodEnd: Date;

  @ApiProperty({ description: 'Base salary amount' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(0)
  @Max(10000000)
  baseSalary: number;

  @ApiPropertyOptional({ description: 'Overtime hours' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(80)
  overtimeHours?: number;

  @ApiPropertyOptional({ description: 'Overtime rate' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  overtimeRate?: number;

  @ApiPropertyOptional({ description: 'Bonus amount' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  bonusAmount?: number;

  @ApiPropertyOptional({ description: 'Commission amount' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  commissionAmount?: number;

  @ApiProperty({ description: 'Federal tax withholding' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  federalTax: number;

  @ApiProperty({ description: 'State tax withholding' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  stateTax: number;

  @ApiProperty({ description: 'Social Security tax' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  socialSecurityTax: number;

  @ApiProperty({ description: 'Medicare tax' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  medicareTax: number;

  @ApiPropertyOptional({ description: 'Other deductions' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeductionDto)
  deductions?: DeductionDto[];

  @ApiProperty({ description: 'Payroll frequency', enum: PayrollFrequency })
  @IsEnum(PayrollFrequency)
  frequency: PayrollFrequency;

  @ApiPropertyOptional({ description: 'Additional payroll metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

// Deduction DTO
export class DeductionDto {
  @ApiProperty({ description: 'Deduction type' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  type: string;

  @ApiProperty({ description: 'Deduction amount' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ description: 'Deduction description' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  description?: string;
}

// Performance Review DTO
export class CreatePerformanceReviewDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsUUID()
  employeeId: string;

  @ApiProperty({ description: 'Reviewer ID' })
  @IsUUID()
  reviewerId: string;

  @ApiProperty({ description: 'Review period start date', type: Date })
  @Type(() => Date)
  @IsDate()
  reviewPeriodStart: Date;

  @ApiProperty({ description: 'Review period end date', type: Date })
  @Type(() => Date)
  @IsDate()
  reviewPeriodEnd: Date;

  @ApiProperty({ description: 'Overall rating', enum: PerformanceRating })
  @IsEnum(PerformanceRating)
  overallRating: PerformanceRating;

  @ApiProperty({ description: 'Goals and objectives score' })
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(5)
  goalsScore: number;

  @ApiProperty({ description: 'Communication skills score' })
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(5)
  communicationScore: number;

  @ApiProperty({ description: 'Technical skills score' })
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(5)
  technicalScore: number;

  @ApiProperty({ description: 'Leadership score' })
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(5)
  leadershipScore: number;

  @ApiProperty({ description: 'Manager comments' })
  @IsString()
  @IsNotEmpty()
  @Length(10, 2000)
  managerComments: string;

  @ApiPropertyOptional({ description: 'Employee self-assessment' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  employeeSelfAssessment?: string;

  @ApiPropertyOptional({ description: 'Development goals' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  developmentGoals?: string[];

  @ApiPropertyOptional({ description: 'Action items' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  actionItems?: string[];

  @ApiPropertyOptional({ description: 'Review metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

// Query DTOs
export class EmployeeQueryDto {
  @ApiPropertyOptional({ description: 'Page number (1-based)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10000)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  search?: string;

  @ApiPropertyOptional({ description: 'Department ID filter' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Employee status filter', enum: EmployeeStatus })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiPropertyOptional({ description: 'Manager ID filter' })
  @IsOptional()
  @IsUUID()
  managerId?: string;

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsString()
  @IsIn(['firstName', 'lastName', 'email', 'hireDate', 'status'])
  sortBy?: string = 'lastName';

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

// Bulk Operation DTOs
export class BulkEmployeeOperationDto {
  @ApiProperty({ description: 'Employee IDs to process' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  @IsUUID(undefined, { each: true })
  employeeIds: string[];

  @ApiProperty({ description: 'Operation to perform' })
  @IsString()
  @IsIn(['activate', 'deactivate', 'terminate', 'update_department', 'update_manager'])
  operation: string;

  @ApiPropertyOptional({ description: 'Operation parameters' })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;
}

// Advanced Search DTO
export class AdvancedEmployeeSearchDto {
  @ApiPropertyOptional({ description: 'Hire date range start' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  hireDateFrom?: Date;

  @ApiPropertyOptional({ description: 'Hire date range end' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  hireDateTo?: Date;

  @ApiPropertyOptional({ description: 'Salary range minimum' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMin?: number;

  @ApiPropertyOptional({ description: 'Salary range maximum' })
  @IsOptional()
  @IsNumber()
  @Max(10000000)
  salaryMax?: number;

  @ApiPropertyOptional({ description: 'Skills required (any)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  skills?: string[];

  @ApiPropertyOptional({ description: 'Certifications' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  certifications?: string[];

  @ApiPropertyOptional({ description: 'Languages spoken' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  languages?: string[];

  @ApiPropertyOptional({ description: 'Performance rating minimum' })
  @IsOptional()
  @IsEnum(PerformanceRating)
  minPerformanceRating?: PerformanceRating;
}
