// Industry 5.0 ERP Backend - Maintenance Management Module
// Maintenance DTOs - Data Transfer Objects for comprehensive maintenance operations
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

export enum WorkOrderType {
  PREVENTIVE = 'preventive',
  CORRECTIVE = 'corrective',
  PREDICTIVE = 'predictive',
  EMERGENCY = 'emergency',
  CALIBRATION = 'calibration',
  INSPECTION = 'inspection',
  UPGRADE = 'upgrade',
  BREAKDOWN = 'breakdown',
  ROUTINE = 'routine'
}

export enum WorkOrderStatus {
  CREATED = 'created',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REQUIRES_APPROVAL = 'requires_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

export enum EquipmentStatus {
  OPERATIONAL = 'operational',
  MAINTENANCE = 'maintenance',
  BREAKDOWN = 'breakdown',
  DECOMMISSIONED = 'decommissioned',
  IDLE = 'idle',
  TESTING = 'testing'
}

export enum Criticality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum MaintenanceType {
  PREVENTIVE = 'preventive',
  CORRECTIVE = 'corrective',
  PREDICTIVE = 'predictive',
  CONDITION_BASED = 'condition_based',
  RELIABILITY_CENTERED = 'reliability_centered'
}

export enum SensorType {
  TEMPERATURE = 'temperature',
  PRESSURE = 'pressure',
  VIBRATION = 'vibration',
  HUMIDITY = 'humidity',
  FLOW = 'flow',
  LEVEL = 'level',
  SPEED = 'speed',
  CURRENT = 'current',
  VOLTAGE = 'voltage',
  FORCE = 'force'
}

export enum SensorStatus {
  NORMAL = 'normal',
  WARNING = 'warning',
  CRITICAL = 'critical',
  OFFLINE = 'offline',
  ERROR = 'error'
}

export enum TechnicianSkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
  SPECIALIST = 'specialist'
}

export enum PartCondition {
  NEW = 'new',
  USED = 'used',
  REFURBISHED = 'refurbished',
  WORN = 'worn',
  DAMAGED = 'damaged'
}

// ============== BASE DTOs ==============

export class EquipmentSpecificationDto {
  @ApiPropertyOptional({ description: 'Maximum operating pressure' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPressure?: number;

  @ApiPropertyOptional({ description: 'Maximum operating temperature' })
  @IsOptional()
  @IsNumber()
  maxTemperature?: number;

  @ApiPropertyOptional({ description: 'Equipment capacity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  capacity?: number;

  @ApiPropertyOptional({ description: 'Power rating in kW' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  powerRating?: number;

  @ApiPropertyOptional({ description: 'Equipment dimensions' })
  @IsOptional()
  @IsObject()
  dimensions?: {
    length: number;
    width: number;
    height: number;
    weight?: number;
  };

  @ApiPropertyOptional({ description: 'Additional specifications' })
  @IsOptional()
  @IsObject()
  additionalSpecs?: Record<string, any>;
}

export class SensorReadingDto {
  @ApiProperty({ description: 'Sensor type', enum: SensorType })
  @IsEnum(SensorType)
  type: SensorType;

  @ApiProperty({ description: 'Sensor value' })
  @IsNumber()
  value: number;

  @ApiProperty({ description: 'Unit of measurement' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ description: 'Sensor status', enum: SensorStatus })
  @IsEnum(SensorStatus)
  status: SensorStatus;

  @ApiPropertyOptional({ description: 'Reading timestamp' })
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @ApiPropertyOptional({ description: 'Sensor ID' })
  @IsOptional()
  @IsString()
  sensorId?: string;

  @ApiPropertyOptional({ description: 'Threshold values' })
  @IsOptional()
  @IsObject()
  thresholds?: {
    min?: number;
    max?: number;
    warning?: number;
    critical?: number;
  };
}

export class MaintenanceMetricsDto {
  @ApiProperty({ description: 'Preventive maintenance percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  preventiveMaintenance: number;

  @ApiProperty({ description: 'Corrective maintenance percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  correctiveMaintenance: number;

  @ApiProperty({ description: 'Total maintenance cost' })
  @IsNumber()
  @Min(0)
  maintenanceCost: number;

  @ApiProperty({ description: 'Equipment availability rate percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  availabilityRate: number;

  @ApiPropertyOptional({ description: 'Mean Time Between Failures (hours)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  mtbf?: number;

  @ApiPropertyOptional({ description: 'Mean Time To Repair (hours)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  mttr?: number;

  @ApiPropertyOptional({ description: 'Overall Equipment Effectiveness' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  oee?: number;
}

export class SafetyRequirementsDto {
  @ApiPropertyOptional({ description: 'Lockout/Tagout required' })
  @IsOptional()
  @IsBoolean()
  lockoutTagout?: boolean;

  @ApiPropertyOptional({ description: 'Confined space entry' })
  @IsOptional()
  @IsBoolean()
  confinedSpace?: boolean;

  @ApiPropertyOptional({ description: 'Hot work required' })
  @IsOptional()
  @IsBoolean()
  hotWork?: boolean;

  @ApiPropertyOptional({ description: 'Electrical safety required' })
  @IsOptional()
  @IsBoolean()
  electricalSafety?: boolean;

  @ApiPropertyOptional({ description: 'Chemical hazards present' })
  @IsOptional()
  @IsBoolean()
  chemicalHazards?: boolean;

  @ApiPropertyOptional({ description: 'Required PPE', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  personalProtectiveEquipment?: string[];

  @ApiPropertyOptional({ description: 'Additional precautions', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalPrecautions?: string[];
}

export class ProcedureStepDto {
  @ApiProperty({ description: 'Step sequence number' })
  @IsInt()
  @Min(1)
  stepNumber: number;

  @ApiProperty({ description: 'Step description' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  description: string;

  @ApiPropertyOptional({ description: 'Estimated time (minutes)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedTime?: number;

  @ApiPropertyOptional({ description: 'Safety notes' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  safetyNotes?: string;

  @ApiPropertyOptional({ description: 'Required tools', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredTools?: string[];

  @ApiPropertyOptional({ description: 'Quality checkpoints', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  checkpoints?: string[];

  @ApiPropertyOptional({ description: 'Step completion required' })
  @IsOptional()
  @IsBoolean()
  completionRequired?: boolean;
}

export class AttachmentDto {
  @ApiProperty({ description: 'File name' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ description: 'File URL or path' })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty({ description: 'File type' })
  @IsEnum(['IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO'])
  fileType: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO';

  @ApiPropertyOptional({ description: 'File description' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({ description: 'Uploaded by user ID' })
  @IsOptional()
  @IsString()
  uploadedBy?: string;

  @ApiPropertyOptional({ description: 'Upload timestamp' })
  @IsOptional()
  @IsDateString()
  uploadedAt?: string;
}

// ============== EQUIPMENT DTOs ==============

export class CreateEquipmentDto {
  @ApiProperty({ description: 'Equipment code/identifier' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  equipmentCode: string;

  @ApiProperty({ description: 'Equipment name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiProperty({ description: 'Equipment type/category' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Work center ID' })
  @IsString()
  @IsNotEmpty()
  workCenterId: string;

  @ApiPropertyOptional({ description: 'Manufacturer name' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  manufacturer?: string;

  @ApiPropertyOptional({ description: 'Equipment model' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  model?: string;

  @ApiPropertyOptional({ description: 'Serial number' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  serialNumber?: string;

  @ApiPropertyOptional({ description: 'Installation date', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @ApiPropertyOptional({ description: 'Warranty expiry date', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  warrantyExpiry?: string;

  @ApiProperty({ description: 'Equipment criticality', enum: Criticality })
  @IsEnum(Criticality)
  criticality: Criticality;

  @ApiPropertyOptional({ description: 'Equipment specifications' })
  @IsOptional()
  @ValidateNested()
  @Type(() => EquipmentSpecificationDto)
  specifications?: EquipmentSpecificationDto;

  @ApiPropertyOptional({ description: 'Location details' })
  @IsOptional()
  @IsObject()
  location?: {
    building?: string;
    floor?: string;
    room?: string;
    coordinates?: { x: number; y: number; z?: number };
  };

  @ApiPropertyOptional({ description: 'Equipment description' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;
}

export class UpdateEquipmentDto extends PartialType(CreateEquipmentDto) {
  @ApiPropertyOptional({ description: 'Equipment status', enum: EquipmentStatus })
  @IsOptional()
  @IsEnum(EquipmentStatus)
  status?: EquipmentStatus;

  @ApiPropertyOptional({ description: 'Current utilization rate (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  utilizationRate?: number;

  @ApiPropertyOptional({ description: 'Next maintenance date', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  nextMaintenanceDate?: string;

  @ApiPropertyOptional({ description: 'Last maintenance date', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  lastMaintenanceDate?: string;

  @ApiPropertyOptional({ description: 'Current sensor readings', type: [SensorReadingDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SensorReadingDto)
  sensorReadings?: SensorReadingDto[];
}

export class EquipmentQueryDto {
  @ApiPropertyOptional({ description: 'Work center ID filter' })
  @IsOptional()
  @IsString()
  workCenterId?: string;

  @ApiPropertyOptional({ description: 'Equipment status filter', enum: EquipmentStatus })
  @IsOptional()
  @IsEnum(EquipmentStatus)
  status?: EquipmentStatus;

  @ApiPropertyOptional({ description: 'Equipment type filter' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Criticality filter', enum: Criticality })
  @IsOptional()
  @IsEnum(Criticality)
  criticality?: Criticality;

  @ApiPropertyOptional({ description: 'Manufacturer filter' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({ description: 'Due for maintenance flag' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  dueForMaintenance?: boolean;

  @ApiPropertyOptional({ description: 'Search by name or code' })
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

// ============== WORK ORDER DTOs ==============

export class CreateWorkOrderDto {
  @ApiProperty({ description: 'Work order title' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  title: string;

  @ApiProperty({ description: 'Work order description' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 2000)
  description: string;

  @ApiProperty({ description: 'Work order type', enum: WorkOrderType })
  @IsEnum(WorkOrderType)
  type: WorkOrderType;

  @ApiProperty({ description: 'Priority level', enum: Priority })
  @IsEnum(Priority)
  priority: Priority;

  @ApiProperty({ description: 'Equipment ID' })
  @IsString()
  @IsNotEmpty()
  equipmentId: string;

  @ApiPropertyOptional({ description: 'Assigned technician ID' })
  @IsOptional()
  @IsString()
  assignedTechnicianId?: string;

  @ApiPropertyOptional({ description: 'Scheduled start date', type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  scheduledStartDate?: string;

  @ApiPropertyOptional({ description: 'Scheduled end date', type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  scheduledEndDate?: string;

  @ApiPropertyOptional({ description: 'Estimated duration (minutes)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDuration?: number;

  @ApiPropertyOptional({ description: 'Estimated cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedCost?: number;

  @ApiPropertyOptional({ description: 'Required skills', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];

  @ApiPropertyOptional({ description: 'Required certifications', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredCertifications?: string[];

  @ApiPropertyOptional({ description: 'Required tools' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequiredToolDto)
  requiredTools?: RequiredToolDto[];

  @ApiPropertyOptional({ description: 'Safety requirements' })
  @IsOptional()
  @ValidateNested()
  @Type(() => SafetyRequirementsDto)
  safetyRequirements?: SafetyRequirementsDto;

  @ApiPropertyOptional({ description: 'Procedure steps', type: [ProcedureStepDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcedureStepDto)
  procedureSteps?: ProcedureStepDto[];

  @ApiPropertyOptional({ description: 'Special instructions' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  specialInstructions?: string;
}

export class RequiredToolDto {
  @ApiProperty({ description: 'Tool ID' })
  @IsString()
  @IsNotEmpty()
  toolId: string;

  @ApiProperty({ description: 'Tool name' })
  @IsString()
  @IsNotEmpty()
  toolName: string;

  @ApiProperty({ description: 'Required quantity' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Critical tool flag' })
  @IsBoolean()
  critical: boolean;
}

export class UpdateWorkOrderDto extends PartialType(CreateWorkOrderDto) {
  @ApiPropertyOptional({ description: 'Work order status', enum: WorkOrderStatus })
  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;

  @ApiPropertyOptional({ description: 'Actual start date', type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  actualStartDate?: string;

  @ApiPropertyOptional({ description: 'Actual end date', type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  actualEndDate?: string;

  @ApiPropertyOptional({ description: 'Actual duration (minutes)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  actualDuration?: number;

  @ApiPropertyOptional({ description: 'Actual cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualCost?: number;

  @ApiPropertyOptional({ description: 'Work completion notes' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  workCompletedNotes?: string;

  @ApiPropertyOptional({ description: 'Root cause analysis' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  rootCauseAnalysis?: string;
}

export class CompleteWorkOrderDto {
  @ApiProperty({ description: 'Work completion notes' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 2000)
  workCompletedNotes: string;

  @ApiPropertyOptional({ description: 'Completion checklist' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompletionChecklistDto)
  completionChecklist?: CompletionChecklistDto[];

  @ApiPropertyOptional({ description: 'Quality checks performed' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualityCheckDto)
  qualityChecks?: QualityCheckDto[];

  @ApiPropertyOptional({ description: 'Follow-up actions required' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FollowUpActionDto)
  followUpActions?: FollowUpActionDto[];

  @ApiPropertyOptional({ description: 'Root cause analysis' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  rootCauseAnalysis?: string;

  @ApiPropertyOptional({ description: 'Customer satisfaction score (1-10)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  customerSatisfactionScore?: number;

  @ApiPropertyOptional({ description: 'Attachments', type: [AttachmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}

export class CompletionChecklistDto {
  @ApiProperty({ description: 'Checklist item description' })
  @IsString()
  @IsNotEmpty()
  item: string;

  @ApiProperty({ description: 'Item completed flag' })
  @IsBoolean()
  completed: boolean;

  @ApiPropertyOptional({ description: 'Notes for the item' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Verified by user ID' })
  @IsOptional()
  @IsString()
  verifiedBy?: string;

  @ApiPropertyOptional({ description: 'Verification date', type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  verificationDate?: string;
}

export class QualityCheckDto {
  @ApiProperty({ description: 'Quality check name' })
  @IsString()
  @IsNotEmpty()
  checkName: string;

  @ApiProperty({ description: 'Check passed flag' })
  @IsBoolean()
  passed: boolean;

  @ApiPropertyOptional({ description: 'Measured value' })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional({ description: 'Unit of measurement' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: 'Check notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Checked by user ID' })
  @IsOptional()
  @IsString()
  checkedBy?: string;

  @ApiPropertyOptional({ description: 'Check date', type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  checkedAt?: string;
}

export class FollowUpActionDto {
  @ApiProperty({ description: 'Follow-up action description' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  action: string;

  @ApiProperty({ description: 'Assigned to user ID' })
  @IsString()
  @IsNotEmpty()
  assignedTo: string;

  @ApiProperty({ description: 'Due date', type: String, format: 'date' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ description: 'Action priority', enum: Priority })
  @IsEnum(Priority)
  priority: Priority;

  @ApiPropertyOptional({ description: 'Action status' })
  @IsOptional()
  @IsEnum(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export class WorkOrderQueryDto {
  @ApiPropertyOptional({ description: 'Work order status filter', enum: WorkOrderStatus })
  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;

  @ApiPropertyOptional({ description: 'Work order type filter', enum: WorkOrderType })
  @IsOptional()
  @IsEnum(WorkOrderType)
  type?: WorkOrderType;

  @ApiPropertyOptional({ description: 'Priority filter', enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ description: 'Equipment ID filter' })
  @IsOptional()
  @IsString()
  equipmentId?: string;

  @ApiPropertyOptional({ description: 'Assigned technician filter' })
  @IsOptional()
  @IsString()
  assignedTechnicianId?: string;

  @ApiPropertyOptional({ description: 'Due date filter (from)', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  dueDateFrom?: string;

  @ApiPropertyOptional({ description: 'Due date filter (to)', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  dueDateTo?: string;

  @ApiPropertyOptional({ description: 'Overdue work orders only' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  overdueOnly?: boolean;

  @ApiPropertyOptional({ description: 'Search by title or description' })
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

// ============== MAINTENANCE SCHEDULE DTOs ==============

export class CreateMaintenanceScheduleDto {
  @ApiProperty({ description: 'Equipment ID' })
  @IsString()
  @IsNotEmpty()
  equipmentId: string;

  @ApiProperty({ description: 'Schedule name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  scheduleName: string;

  @ApiProperty({ description: 'Maintenance type', enum: MaintenanceType })
  @IsEnum(MaintenanceType)
  maintenanceType: MaintenanceType;

  @ApiProperty({ description: 'Maintenance frequency (days)' })
  @IsInt()
  @Min(1)
  @Max(365)
  frequencyDays: number;

  @ApiPropertyOptional({ description: 'Schedule description' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Estimated duration (minutes)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDuration?: number;

  @ApiPropertyOptional({ description: 'Required skills', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];

  @ApiPropertyOptional({ description: 'Required parts' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequiredPartDto)
  requiredParts?: RequiredPartDto[];

  @ApiPropertyOptional({ description: 'Task procedures', type: [ProcedureStepDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcedureStepDto)
  procedures?: ProcedureStepDto[];

  @ApiPropertyOptional({ description: 'Auto-generate work orders' })
  @IsOptional()
  @IsBoolean()
  autoGenerate?: boolean;
}

export class RequiredPartDto {
  @ApiProperty({ description: 'Part ID' })
  @IsString()
  @IsNotEmpty()
  partId: string;

  @ApiProperty({ description: 'Part name' })
  @IsString()
  @IsNotEmpty()
  partName: string;

  @ApiProperty({ description: 'Required quantity' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Part condition', enum: PartCondition })
  @IsOptional()
  @IsEnum(PartCondition)
  condition?: PartCondition;

  @ApiPropertyOptional({ description: 'Estimated cost per unit' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedCost?: number;
}

export class UpdateMaintenanceScheduleDto extends PartialType(CreateMaintenanceScheduleDto) {
  @ApiPropertyOptional({ description: 'Schedule active flag' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Next due date', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  nextDueDate?: string;

  @ApiPropertyOptional({ description: 'Last performed date', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  lastPerformedDate?: string;
}

// ============== TECHNICIAN DTOs ==============

export class CreateTechnicianDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({ description: 'First name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  lastName: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Primary skills', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  primarySkills: string[];

  @ApiPropertyOptional({ description: 'Secondary skills', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondarySkills?: string[];

  @ApiProperty({ description: 'Skill level', enum: TechnicianSkillLevel })
  @IsEnum(TechnicianSkillLevel)
  skillLevel: TechnicianSkillLevel;

  @ApiPropertyOptional({ description: 'Certifications', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiPropertyOptional({ description: 'Work shift' })
  @IsOptional()
  @IsString()
  workShift?: string;

  @ApiPropertyOptional({ description: 'Maximum concurrent work orders' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxConcurrentWorkOrders?: number;
}

export class UpdateTechnicianDto extends PartialType(CreateTechnicianDto) {
  @ApiPropertyOptional({ description: 'Technician availability' })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ description: 'Current work orders count' })
  @IsOptional()
  @IsInt()
  @Min(0)
  currentWorkOrdersCount?: number;
}

// ============== SPARE PARTS DTOs ==============

export class CreateSparePartDto {
  @ApiProperty({ description: 'Part number' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  partNumber: string;

  @ApiProperty({ description: 'Part name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiPropertyOptional({ description: 'Part description' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Manufacturer' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({ description: 'Model number' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ description: 'Unit cost' })
  @IsNumber()
  @Min(0)
  unitCost: number;

  @ApiProperty({ description: 'Current stock quantity' })
  @IsInt()
  @Min(0)
  currentStock: number;

  @ApiProperty({ description: 'Minimum stock level' })
  @IsInt()
  @Min(0)
  minimumStock: number;

  @ApiPropertyOptional({ description: 'Maximum stock level' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maximumStock?: number;

  @ApiPropertyOptional({ description: 'Lead time (days)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  leadTimeDays?: number;

  @ApiPropertyOptional({ description: 'Preferred supplier ID' })
  @IsOptional()
  @IsString()
  preferredSupplierId?: string;

  @ApiPropertyOptional({ description: 'Storage location' })
  @IsOptional()
  @IsString()
  storageLocation?: string;

  @ApiPropertyOptional({ description: 'Compatible equipment IDs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  compatibleEquipmentIds?: string[];
}

export class UpdateSparePartDto extends PartialType(CreateSparePartDto) {
  @ApiPropertyOptional({ description: 'Part condition', enum: PartCondition })
  @IsOptional()
  @IsEnum(PartCondition)
  condition?: PartCondition;
}

// ============== PREDICTIVE MAINTENANCE DTOs ==============

export class PredictiveMaintenanceAnalysisDto {
  @ApiProperty({ description: 'Equipment ID for analysis' })
  @IsString()
  @IsNotEmpty()
  equipmentId: string;

  @ApiPropertyOptional({ description: 'Analysis period (days)' })
  @IsOptional()
  @IsInt()
  @Min(7)
  @Max(365)
  analysisPeriodDays?: number;

  @ApiPropertyOptional({ description: 'Prediction horizon (days)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  predictionHorizonDays?: number;

  @ApiPropertyOptional({ description: 'Include anomaly detection' })
  @IsOptional()
  @IsBoolean()
  includeAnomalyDetection?: boolean;

  @ApiPropertyOptional({ description: 'ML model to use' })
  @IsOptional()
  @IsString()
  mlModel?: string;

  @ApiPropertyOptional({ description: 'Confidence threshold' })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(1)
  confidenceThreshold?: number;
}

// ============== ANALYTICS DTOs ==============

export class MaintenanceAnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'Time range for analysis' })
  @IsOptional()
  @IsEnum(['7d', '30d', '90d', '365d'])
  timeRange?: '7d' | '30d' | '90d' | '365d';

  @ApiPropertyOptional({ description: 'Start date for custom range', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for custom range', type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Equipment type filter' })
  @IsOptional()
  @IsString()
  equipmentType?: string;

  @ApiPropertyOptional({ description: 'Work center filter' })
  @IsOptional()
  @IsString()
  workCenterId?: string;

  @ApiPropertyOptional({ description: 'Include cost analysis' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeCostAnalysis?: boolean;

  @ApiPropertyOptional({ description: 'Include KPI trends' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeKPITrends?: boolean;
}

// ============== RESPONSE DTOs ==============

export class WorkOrderResponseDto {
  @ApiProperty({ description: 'Work order ID' })
  id: string;

  @ApiProperty({ description: 'Work order number' })
  workOrderNumber: string;

  @ApiProperty({ description: 'Title' })
  title: string;

  @ApiProperty({ description: 'Type', enum: WorkOrderType })
  type: WorkOrderType;

  @ApiProperty({ description: 'Status', enum: WorkOrderStatus })
  status: WorkOrderStatus;

  @ApiProperty({ description: 'Priority', enum: Priority })
  priority: Priority;

  @ApiProperty({ description: 'Equipment name' })
  equipmentName: string;

  @ApiPropertyOptional({ description: 'Assigned technician name' })
  technicianName?: string;

  @ApiPropertyOptional({ description: 'Scheduled start date' })
  scheduledStartDate?: string;

  @ApiPropertyOptional({ description: 'Scheduled end date' })
  scheduledEndDate?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: string;

  @ApiProperty({ description: 'Last updated date' })
  updatedAt: string;
}

export class MaintenanceDashboardDto {
  @ApiProperty({ description: 'Active work orders count' })
  activeWorkOrders: number;

  @ApiProperty({ description: 'Overdue work orders count' })
  overdueWorkOrders: number;

  @ApiProperty({ description: 'Completed work orders this month' })
  completedThisMonth: number;

  @ApiProperty({ description: 'Equipment availability percentage' })
  equipmentAvailability: number;

  @ApiProperty({ description: 'Mean Time Between Failures' })
  mtbf: number;

  @ApiProperty({ description: 'Mean Time To Repair' })
  mttr: number;

  @ApiProperty({ description: 'Maintenance cost this month' })
  maintenanceCostThisMonth: number;

  @ApiProperty({ description: 'Preventive vs corrective ratio' })
  preventiveCorrective: {
    preventive: number;
    corrective: number;
  };

  @ApiProperty({ description: 'Top equipment needing attention' })
  topEquipmentIssues: Array<{
    equipmentName: string;
    issueCount: number;
    criticalityScore: number;
  }>;

  @ApiProperty({ description: 'Technician workload distribution' })
  technicianWorkload: Array<{
    technicianName: string;
    activeWorkOrders: number;
    utilizationRate: number;
  }>;
}

// ============== BULK OPERATIONS DTOs ==============

export class BulkWorkOrderOperationDto {
  @ApiProperty({ description: 'Work order IDs to operate on', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsString({ each: true })
  workOrderIds: string[];

  @ApiProperty({ description: 'Operation type' })
  @IsEnum(['assign', 'schedule', 'cancel', 'approve', 'priority_change'])
  operation: 'assign' | 'schedule' | 'cancel' | 'approve' | 'priority_change';

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
