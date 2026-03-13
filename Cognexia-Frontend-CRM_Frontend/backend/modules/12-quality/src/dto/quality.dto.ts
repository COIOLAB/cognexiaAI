// Industry 5.0 ERP Backend - Quality Management Module
// Quality DTOs - Data Transfer Objects for comprehensive quality management operations
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
  IsUUID,
  IsDate,
  ValidateNested,
  Min,
  Max,
  Length,
  IsNotEmpty,
  IsInt,
  ArrayMinSize,
  ArrayMaxSize,
  IsDateString,
  IsEmail,
  IsPositive,
  ArrayNotEmpty,
  IsDecimal,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// ============== ENUMS ==============

export enum InspectionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum InspectionType {
  INCOMING = 'incoming',
  IN_PROCESS = 'in_process',
  FINAL = 'final',
  AUDIT = 'audit',
  CALIBRATION = 'calibration',
  COMPLIANCE = 'compliance',
  STATISTICAL = 'statistical',
  VISUAL = 'visual',
  FUNCTIONAL = 'functional',
  DIMENSIONAL = 'dimensional'
}

export enum InspectionResult {
  PASS = 'pass',
  FAIL = 'fail',
  CONDITIONAL_PASS = 'conditional_pass',
  PENDING = 'pending',
  REWORK_REQUIRED = 'rework_required',
  SCRAP = 'scrap'
}

export enum QualityStandard {
  ISO_9001 = 'iso_9001',
  ISO_14001 = 'iso_14001',
  ISO_45001 = 'iso_45001',
  TS_16949 = 'ts_16949',
  AS_9100 = 'as_9100',
  FDA_GMP = 'fda_gmp',
  FDA_21CFR = 'fda_21cfr',
  ICH_Q7 = 'ich_q7',
  REACH = 'reach',
  ROHS = 'rohs',
  CE_MARKING = 'ce_marking',
  UL_LISTING = 'ul_listing'
}

export enum DefectSeverity {
  MINOR = 'minor',
  MAJOR = 'major',
  CRITICAL = 'critical',
  COSMETIC = 'cosmetic'
}

export enum DefectCategory {
  DIMENSIONAL = 'dimensional',
  SURFACE_FINISH = 'surface_finish',
  MATERIAL = 'material',
  ASSEMBLY = 'assembly',
  FUNCTIONAL = 'functional',
  APPEARANCE = 'appearance',
  PACKAGING = 'packaging',
  DOCUMENTATION = 'documentation'
}

export enum CorrectiveActionStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  IMPLEMENTED = 'implemented',
  VERIFIED = 'verified',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

export enum QualityPlanStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  REVISION = 'revision',
  OBSOLETE = 'obsolete',
  WITHDRAWN = 'withdrawn'
}

export enum SampleType {
  SINGLE = 'single',
  BATCH = 'batch',
  STATISTICAL = 'statistical',
  CONTINUOUS = 'continuous'
}

// ============== BASE DTOs ==============

export class QualityMeasurementDto {
  @ApiProperty({ description: 'Measurement parameter name' })
  @IsString()
  @IsNotEmpty()
  parameter: string;

  @ApiProperty({ description: 'Measured value' })
  @IsNumber()
  value: number;

  @ApiProperty({ description: 'Unit of measurement' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ description: 'Specification limits and target' })
  @IsObject()
  @ValidateNested()
  @Type(() => SpecificationDto)
  specification: SpecificationDto;

  @ApiProperty({ description: 'Whether measurement passed specification' })
  @IsBoolean()
  passed: boolean;

  @ApiPropertyOptional({ description: 'Measurement timestamp' })
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @ApiPropertyOptional({ description: 'Measurement method or instrument' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({ description: 'Operator/inspector ID' })
  @IsOptional()
  @IsString()
  operatorId?: string;
}

export class SpecificationDto {
  @ApiPropertyOptional({ description: 'Minimum acceptable value' })
  @IsOptional()
  @IsNumber()
  min?: number;

  @ApiPropertyOptional({ description: 'Maximum acceptable value' })
  @IsOptional()
  @IsNumber()
  max?: number;

  @ApiPropertyOptional({ description: 'Target/nominal value' })
  @IsOptional()
  @IsNumber()
  target?: number;

  @ApiPropertyOptional({ description: 'Tolerance range (+/-)' })
  @IsOptional()
  @IsNumber()
  tolerance?: number;

  @ApiPropertyOptional({ description: 'Upper control limit for SPC' })
  @IsOptional()
  @IsNumber()
  ucl?: number;

  @ApiPropertyOptional({ description: 'Lower control limit for SPC' })
  @IsOptional()
  @IsNumber()
  lcl?: number;
}

export class QualityDefectDto {
  @ApiProperty({ description: 'Defect category', enum: DefectCategory })
  @IsEnum(DefectCategory)
  category: DefectCategory;

  @ApiProperty({ description: 'Defect severity', enum: DefectSeverity })
  @IsEnum(DefectSeverity)
  severity: DefectSeverity;

  @ApiProperty({ description: 'Defect description' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  description: string;

  @ApiPropertyOptional({ description: 'Defect location or position' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Root cause analysis' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  rootCause?: string;

  @ApiPropertyOptional({ description: 'Quantity affected' })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantityAffected?: number;

  @ApiPropertyOptional({ description: 'Detection method' })
  @IsOptional()
  @IsString()
  detectionMethod?: string;

  @ApiPropertyOptional({ description: 'Photo/image URLs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class CorrectiveActionDto {
  @ApiProperty({ description: 'Corrective action description' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  action: string;

  @ApiProperty({ description: 'Person assigned to the action' })
  @IsString()
  @IsNotEmpty()
  assignedTo: string;

  @ApiProperty({ description: 'Due date for completion', type: String, format: 'date' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ description: 'Action status', enum: CorrectiveActionStatus })
  @IsEnum(CorrectiveActionStatus)
  status: CorrectiveActionStatus;

  @ApiPropertyOptional({ description: 'Action priority level' })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  priority?: 'low' | 'medium' | 'high' | 'critical';

  @ApiPropertyOptional({ description: 'Implementation notes' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Verification required' })
  @IsOptional()
  @IsBoolean()
  requiresVerification?: boolean;
}

export class QualityComplianceDto {
  @ApiProperty({ description: 'Applicable quality standards', type: [String] })
  @IsArray()
  @IsEnum(QualityStandard, { each: true })
  standards: QualityStandard[];

  @ApiPropertyOptional({ description: 'Regulatory requirements', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regulations?: string[];

  @ApiPropertyOptional({ description: 'Required certifications', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiPropertyOptional({ description: 'Compliance notes' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}

export class QualityAttachmentDto {
  @ApiProperty({ description: 'File name' })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({ description: 'File URL or path' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ description: 'File type/MIME type' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsOptional()
  @IsInt()
  @Min(0)
  size?: number;

  @ApiPropertyOptional({ description: 'Upload date', type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  uploadedAt?: string;

  @ApiPropertyOptional({ description: 'Uploaded by user ID' })
  @IsOptional()
  @IsString()
  uploadedBy?: string;
}

// ============== QUALITY INSPECTION DTOs ==============

export class CreateQualityInspectionDto {
  @ApiProperty({ description: 'Inspection type', enum: InspectionType })
  @IsEnum(InspectionType)
  type: InspectionType;

  @ApiProperty({ description: 'Work center ID where inspection takes place' })
  @IsString()
  @IsNotEmpty()
  workCenterId: string;

  @ApiProperty({ description: 'Inspector user ID' })
  @IsString()
  @IsNotEmpty()
  inspectorId: string;

  @ApiProperty({ description: 'Scheduled inspection date', type: String, format: 'date-time' })
  @IsDateString()
  scheduledDate: string;

  @ApiPropertyOptional({ description: 'Production order ID' })
  @IsOptional()
  @IsString()
  productionOrderId?: string;

  @ApiPropertyOptional({ description: 'Batch or lot number' })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiPropertyOptional({ description: 'Product code being inspected' })
  @IsOptional()
  @IsString()
  productCode?: string;

  @ApiPropertyOptional({ description: 'Quality plan ID to follow' })
  @IsOptional()
  @IsString()
  qualityPlanId?: string;

  @ApiPropertyOptional({ description: 'Inspection parameters and criteria' })
  @IsOptional()
  @IsObject()
  inspectionParameters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Sample information' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SampleInfoDto)
  sampleInfo?: SampleInfoDto;

  @ApiPropertyOptional({ description: 'Compliance requirements' })
  @IsOptional()
  @ValidateNested()
  @Type(() => QualityComplianceDto)
  compliance?: QualityComplianceDto;

  @ApiPropertyOptional({ description: 'Industry-specific data' })
  @IsOptional()
  @IsObject()
  industrySpecific?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Special instructions' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  specialInstructions?: string;
}

export class SampleInfoDto {
  @ApiProperty({ description: 'Sample type', enum: SampleType })
  @IsEnum(SampleType)
  type: SampleType;

  @ApiProperty({ description: 'Sample size or quantity' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Sampling method used' })
  @IsOptional()
  @IsString()
  samplingMethod?: string;

  @ApiPropertyOptional({ description: 'Sample identification' })
  @IsOptional()
  @IsString()
  sampleId?: string;

  @ApiPropertyOptional({ description: 'Sample location or source' })
  @IsOptional()
  @IsString()
  location?: string;
}

export class UpdateQualityInspectionDto extends PartialType(CreateQualityInspectionDto) {
  @ApiPropertyOptional({ description: 'Inspection status', enum: InspectionStatus })
  @IsOptional()
  @IsEnum(InspectionStatus)
  status?: InspectionStatus;

  @ApiPropertyOptional({ description: 'Actual start date', type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  actualStartDate?: string;

  @ApiPropertyOptional({ description: 'Actual end date', type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  actualEndDate?: string;

  @ApiPropertyOptional({ description: 'Test results data' })
  @IsOptional()
  @IsObject()
  testResults?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Quality measurements', type: [QualityMeasurementDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualityMeasurementDto)
  measurements?: QualityMeasurementDto[];

  @ApiPropertyOptional({ description: 'Overall quality score (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore?: number;

  @ApiPropertyOptional({ description: 'Inspector notes' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Failure reason if applicable' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  failureReason?: string;
}

export class CompleteInspectionDto {
  @ApiProperty({ description: 'Inspection result', enum: InspectionResult })
  @IsEnum(InspectionResult)
  result: InspectionResult;

  @ApiPropertyOptional({ description: 'Quality measurements', type: [QualityMeasurementDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualityMeasurementDto)
  measurements?: QualityMeasurementDto[];

  @ApiPropertyOptional({ description: 'Overall quality score (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore?: number;

  @ApiPropertyOptional({ description: 'Defects found', type: [QualityDefectDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualityDefectDto)
  defects?: QualityDefectDto[];

  @ApiPropertyOptional({ description: 'Corrective actions', type: [CorrectiveActionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CorrectiveActionDto)
  correctiveActions?: CorrectiveActionDto[];

  @ApiPropertyOptional({ description: 'Inspection notes' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Test result attachments', type: [QualityAttachmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualityAttachmentDto)
  attachments?: QualityAttachmentDto[];

  @ApiPropertyOptional({ description: 'Requires re-inspection' })
  @IsOptional()
  @IsBoolean()
  requiresReInspection?: boolean;

  @ApiPropertyOptional({ description: 'Re-inspection reason' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  reInspectionReason?: string;
}

export class QualityInspectionQueryDto {
  @ApiPropertyOptional({ description: 'Inspection status filter', enum: InspectionStatus })
  @IsOptional()
  @IsEnum(InspectionStatus)
  status?: InspectionStatus;

  @ApiPropertyOptional({ description: 'Inspection type filter', enum: InspectionType })
  @IsOptional()
  @IsEnum(InspectionType)
  type?: InspectionType;

  @ApiPropertyOptional({ description: 'Work center ID filter' })
  @IsOptional()
  @IsString()
  workCenterId?: string;

  @ApiPropertyOptional({ description: 'Inspector ID filter' })
  @IsOptional()
  @IsString()
  inspectorId?: string;

  @ApiPropertyOptional({ description: 'Production order ID filter' })
  @IsOptional()
  @IsString()
  productionOrderId?: string;

  @ApiPropertyOptional({ description: 'Product code filter' })
  @IsOptional()
  @IsString()
  productCode?: string;

  @ApiPropertyOptional({ description: 'Start date filter', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date filter', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Minimum quality score filter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  minQualityScore?: number;

  @ApiPropertyOptional({ description: 'Failed inspections only' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  failedOnly?: boolean;

  @ApiPropertyOptional({ description: 'Search by inspection number' })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

// ============== QUALITY PLAN DTOs ==============

export class CreateQualityPlanDto {
  @ApiProperty({ description: 'Quality plan name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiProperty({ description: 'Plan version' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  version: string;

  @ApiPropertyOptional({ description: 'Plan description' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiProperty({ description: 'Product or part number' })
  @IsString()
  @IsNotEmpty()
  productCode: string;

  @ApiPropertyOptional({ description: 'Customer requirements' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  customerRequirements?: string;

  @ApiProperty({ description: 'Inspection steps and criteria' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InspectionStepDto)
  inspectionSteps: InspectionStepDto[];

  @ApiPropertyOptional({ description: 'Compliance requirements' })
  @IsOptional()
  @ValidateNested()
  @Type(() => QualityComplianceDto)
  compliance?: QualityComplianceDto;

  @ApiPropertyOptional({ description: 'Effective from date', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @ApiPropertyOptional({ description: 'Review date', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  reviewDate?: string;

  @ApiPropertyOptional({ description: 'Approval required' })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;
}

export class InspectionStepDto {
  @ApiProperty({ description: 'Step sequence number' })
  @IsInt()
  @Min(1)
  stepNumber: number;

  @ApiProperty({ description: 'Step description' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  description: string;

  @ApiProperty({ description: 'Inspection method' })
  @IsString()
  @IsNotEmpty()
  method: string;

  @ApiPropertyOptional({ description: 'Required equipment or tools' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredEquipment?: string[];

  @ApiPropertyOptional({ description: 'Measurement specifications', type: [SpecificationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecificationDto)
  specifications?: SpecificationDto[];

  @ApiPropertyOptional({ description: 'Sample size required' })
  @IsOptional()
  @IsInt()
  @Min(1)
  sampleSize?: number;

  @ApiPropertyOptional({ description: 'Critical step flag' })
  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;

  @ApiPropertyOptional({ description: 'Documentation required' })
  @IsOptional()
  @IsBoolean()
  requiresDocumentation?: boolean;
}

export class UpdateQualityPlanDto extends PartialType(CreateQualityPlanDto) {
  @ApiPropertyOptional({ description: 'Plan status', enum: QualityPlanStatus })
  @IsOptional()
  @IsEnum(QualityPlanStatus)
  status?: QualityPlanStatus;

  @ApiPropertyOptional({ description: 'Approval date', type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  approvedAt?: string;

  @ApiPropertyOptional({ description: 'Approved by user ID' })
  @IsOptional()
  @IsString()
  approvedBy?: string;
}

// ============== QUALITY ANALYTICS DTOs ==============

export class QualityAnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'Time range for analysis' })
  @IsOptional()
  @IsEnum(['24h', '7d', '30d', '90d', '365d'])
  timeRange?: '24h' | '7d' | '30d' | '90d' | '365d';

  @ApiPropertyOptional({ description: 'Start date for custom range', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for custom range', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Work center filter' })
  @IsOptional()
  @IsString()
  workCenterId?: string;

  @ApiPropertyOptional({ description: 'Product code filter' })
  @IsOptional()
  @IsString()
  productCode?: string;

  @ApiPropertyOptional({ description: 'Inspector filter' })
  @IsOptional()
  @IsString()
  inspectorId?: string;

  @ApiPropertyOptional({ description: 'Include trend analysis' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeTrends?: boolean;

  @ApiPropertyOptional({ description: 'Include SPC analysis' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeSPC?: boolean;

  @ApiPropertyOptional({ description: 'Industry type for benchmarking' })
  @IsOptional()
  @IsString()
  industryType?: string;
}

// ============== QUALITY CERTIFICATE DTOs ==============

export class CreateQualityCertificateDto {
  @ApiProperty({ description: 'Certificate number' })
  @IsString()
  @IsNotEmpty()
  certificateNumber: string;

  @ApiProperty({ description: 'Certificate type' })
  @IsString()
  @IsNotEmpty()
  certificateType: string;

  @ApiPropertyOptional({ description: 'Related inspection ID' })
  @IsOptional()
  @IsString()
  inspectionId?: string;

  @ApiPropertyOptional({ description: 'Product/batch covered' })
  @IsOptional()
  @IsString()
  productBatch?: string;

  @ApiPropertyOptional({ description: 'Customer information' })
  @IsOptional()
  @IsObject()
  customerInfo?: {
    name: string;
    address: string;
    contact: string;
  };

  @ApiPropertyOptional({ description: 'Certificate validity period (days)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650) // Max 10 years
  validityDays?: number;

  @ApiPropertyOptional({ description: 'Digital signature required' })
  @IsOptional()
  @IsBoolean()
  requiresDigitalSignature?: boolean;
}

// ============== NON-CONFORMANCE DTOs ==============

export class CreateNonConformanceDto {
  @ApiProperty({ description: 'Non-conformance title' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  title: string;

  @ApiProperty({ description: 'Detailed description' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 2000)
  description: string;

  @ApiPropertyOptional({ description: 'Related inspection ID' })
  @IsOptional()
  @IsString()
  inspectionId?: string;

  @ApiPropertyOptional({ description: 'Source of non-conformance' })
  @IsOptional()
  @IsEnum(['internal_audit', 'customer_complaint', 'supplier_issue', 'process_deviation'])
  source?: 'internal_audit' | 'customer_complaint' | 'supplier_issue' | 'process_deviation';

  @ApiPropertyOptional({ description: 'Severity level', enum: DefectSeverity })
  @IsOptional()
  @IsEnum(DefectSeverity)
  severity?: DefectSeverity;

  @ApiPropertyOptional({ description: 'Root cause analysis' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  rootCause?: string;

  @ApiPropertyOptional({ description: 'Corrective actions', type: [CorrectiveActionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CorrectiveActionDto)
  correctiveActions?: CorrectiveActionDto[];

  @ApiPropertyOptional({ description: 'Preventive actions', type: [CorrectiveActionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CorrectiveActionDto)
  preventiveActions?: CorrectiveActionDto[];
}

// ============== SUPPLIER QUALITY DTOs ==============

export class SupplierQualityAssessmentDto {
  @ApiProperty({ description: 'Supplier ID' })
  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @ApiProperty({ description: 'Assessment period start', type: String, format: 'date' })
  @IsDateString()
  periodStart: string;

  @ApiProperty({ description: 'Assessment period end', type: String, format: 'date' })
  @IsDateString()
  periodEnd: string;

  @ApiPropertyOptional({ description: 'Quality score (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore?: number;

  @ApiPropertyOptional({ description: 'On-time delivery percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  onTimeDelivery?: number;

  @ApiPropertyOptional({ description: 'Defect rate (PPM)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defectRatePPM?: number;

  @ApiPropertyOptional({ description: 'Certification status' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiPropertyOptional({ description: 'Audit findings' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AuditFindingDto)
  auditFindings?: AuditFindingDto[];
}

export class AuditFindingDto {
  @ApiProperty({ description: 'Finding category' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: 'Finding description' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  description: string;

  @ApiProperty({ description: 'Severity level', enum: DefectSeverity })
  @IsEnum(DefectSeverity)
  severity: DefectSeverity;

  @ApiPropertyOptional({ description: 'Finding status' })
  @IsOptional()
  @IsEnum(['open', 'addressed', 'closed'])
  status?: 'open' | 'addressed' | 'closed';

  @ApiPropertyOptional({ description: 'Due date for resolution', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

// ============== RESPONSE DTOs ==============

export class QualityInspectionResponseDto {
  @ApiProperty({ description: 'Inspection ID' })
  id: string;

  @ApiProperty({ description: 'Inspection number' })
  inspectionNumber: string;

  @ApiProperty({ description: 'Inspection type', enum: InspectionType })
  type: InspectionType;

  @ApiProperty({ description: 'Current status', enum: InspectionStatus })
  status: InspectionStatus;

  @ApiPropertyOptional({ description: 'Inspection result', enum: InspectionResult })
  result?: InspectionResult;

  @ApiProperty({ description: 'Work center name' })
  workCenter: string;

  @ApiProperty({ description: 'Inspector name' })
  inspector: string;

  @ApiPropertyOptional({ description: 'Quality score (0-100)' })
  qualityScore?: number;

  @ApiProperty({ description: 'Scheduled date', type: String, format: 'date-time' })
  scheduledDate: string;

  @ApiPropertyOptional({ description: 'Completion date', type: String, format: 'date-time' })
  completedDate?: string;

  @ApiPropertyOptional({ description: 'Number of defects found' })
  defectCount?: number;

  @ApiProperty({ description: 'Creation date', type: String, format: 'date-time' })
  createdAt: string;
}

export class QualityDashboardDto {
  @ApiProperty({ description: 'Total inspections in period' })
  totalInspections: number;

  @ApiProperty({ description: 'Passed inspections count' })
  passedInspections: number;

  @ApiProperty({ description: 'Failed inspections count' })
  failedInspections: number;

  @ApiProperty({ description: 'Overall pass rate percentage' })
  passRate: number;

  @ApiProperty({ description: 'Average quality score' })
  averageQualityScore: number;

  @ApiProperty({ description: 'Defect rate (per thousand)' })
  defectRate: number;

  @ApiProperty({ description: 'First pass yield percentage' })
  firstPassYield: number;

  @ApiProperty({ description: 'Cost of quality' })
  costOfQuality: number;

  @ApiProperty({ description: 'Top defect categories' })
  topDefects: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;

  @ApiProperty({ description: 'Quality trends over time' })
  trends: {
    labels: string[];
    passRate: number[];
    qualityScore: number[];
    defectRate: number[];
  };

  @ApiProperty({ description: 'Active alerts count' })
  alerts: {
    critical: number;
    warning: number;
    info: number;
  };
}

// ============== BULK OPERATIONS DTOs ==============

export class BulkInspectionOperationDto {
  @ApiProperty({ description: 'Inspection IDs to operate on', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsString({ each: true })
  inspectionIds: string[];

  @ApiProperty({ description: 'Operation type' })
  @IsEnum(['approve', 'reject', 'cancel', 'reassign', 'reschedule'])
  operation: 'approve' | 'reject' | 'cancel' | 'reassign' | 'reschedule';

  @ApiPropertyOptional({ description: 'Operation parameters' })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Reason for bulk operation' })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  reason?: string;
}
