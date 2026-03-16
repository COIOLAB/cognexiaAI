/**
 * Manufacturing Module - Comprehensive Validation DTOs
 * Industry 5.0 ERP - Advanced Manufacturing Data Validation
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
  IsJSON,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Enums for Manufacturing Domain
export enum WorkCenterType {
  ASSEMBLY = 'ASSEMBLY',
  MACHINING = 'MACHINING',
  WELDING = 'WELDING',
  PAINTING = 'PAINTING',
  QUALITY_CONTROL = 'QUALITY_CONTROL',
  PACKAGING = 'PACKAGING',
  TESTING = 'TESTING',
}

export enum ProductionOrderStatus {
  PLANNED = 'PLANNED',
  RELEASED = 'RELEASED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
}

export enum QualityStatus {
  PENDING = 'PENDING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  REJECTED = 'REJECTED',
  REWORK_REQUIRED = 'REWORK_REQUIRED',
}

export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE = 'CORRECTIVE',
  PREDICTIVE = 'PREDICTIVE',
  EMERGENCY = 'EMERGENCY',
}

export enum SafetyLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Location DTO
export class LocationDto {
  @ApiProperty({ description: 'X coordinate', minimum: -1000, maximum: 1000 })
  @IsNumber({}, { message: 'X coordinate must be a valid number' })
  @Min(-1000, { message: 'X coordinate must be at least -1000' })
  @Max(1000, { message: 'X coordinate must be at most 1000' })
  x: number;

  @ApiProperty({ description: 'Y coordinate', minimum: -1000, maximum: 1000 })
  @IsNumber({}, { message: 'Y coordinate must be a valid number' })
  @Min(-1000, { message: 'Y coordinate must be at least -1000' })
  @Max(1000, { message: 'Y coordinate must be at most 1000' })
  y: number;

  @ApiProperty({ description: 'Z coordinate', minimum: -100, maximum: 100 })
  @IsNumber({}, { message: 'Z coordinate must be a valid number' })
  @Min(-100, { message: 'Z coordinate must be at least -100' })
  @Max(100, { message: 'Z coordinate must be at most 100' })
  z: number;

  @ApiProperty({ description: 'Location description', maxLength: 200 })
  @IsString({ message: 'Description must be a string' })
  @Length(1, 200, { message: 'Description must be between 1 and 200 characters' })
  description: string;
}

// Work Center DTOs
export class CreateWorkCenterDto {
  @ApiProperty({ description: 'Work center name', maxLength: 100 })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  name: string;

  @ApiProperty({ description: 'Work center code', maxLength: 20 })
  @IsString({ message: 'Code must be a string' })
  @IsNotEmpty({ message: 'Code cannot be empty' })
  @Length(3, 20, { message: 'Code must be between 3 and 20 characters' })
  @Matches(/^[A-Z0-9_-]+$/, { message: 'Code must contain only uppercase letters, numbers, underscore and dash' })
  code: string;

  @ApiProperty({ enum: WorkCenterType, description: 'Type of work center' })
  @IsEnum(WorkCenterType, { message: 'Invalid work center type' })
  type: WorkCenterType;

  @ApiProperty({ description: 'Work center capacity per hour', minimum: 1 })
  @IsNumber({}, { message: 'Capacity must be a valid number' })
  @IsPositive({ message: 'Capacity must be positive' })
  @Min(1, { message: 'Capacity must be at least 1' })
  capacity: number;

  @ApiProperty({ type: LocationDto, description: 'Work center location' })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiPropertyOptional({ description: 'Work center description', maxLength: 500 })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Length(0, 500, { message: 'Description cannot exceed 500 characters' })
  description?: string;

  @ApiPropertyOptional({ description: 'Operating cost per hour', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Operating cost must be a valid decimal with max 2 decimal places' })
  @Min(0, { message: 'Operating cost cannot be negative' })
  operatingCostPerHour?: number;

  @ApiPropertyOptional({ description: 'Safety level', enum: SafetyLevel })
  @IsOptional()
  @IsEnum(SafetyLevel, { message: 'Invalid safety level' })
  safetyLevel?: SafetyLevel;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsOptional()
  @IsBoolean({ message: 'Active must be a boolean' })
  isActive?: boolean;
}

export class UpdateWorkCenterDto {
  @ApiPropertyOptional({ description: 'Work center name', maxLength: 100 })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  name?: string;

  @ApiPropertyOptional({ description: 'Work center capacity per hour', minimum: 1 })
  @IsOptional()
  @IsNumber({}, { message: 'Capacity must be a valid number' })
  @IsPositive({ message: 'Capacity must be positive' })
  @Min(1, { message: 'Capacity must be at least 1' })
  capacity?: number;

  @ApiPropertyOptional({ type: LocationDto, description: 'Work center location' })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @ApiPropertyOptional({ description: 'Work center description', maxLength: 500 })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Length(0, 500, { message: 'Description cannot exceed 500 characters' })
  description?: string;

  @ApiPropertyOptional({ description: 'Operating cost per hour', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Operating cost must be a valid decimal' })
  @Min(0, { message: 'Operating cost cannot be negative' })
  operatingCostPerHour?: number;

  @ApiPropertyOptional({ description: 'Safety level', enum: SafetyLevel })
  @IsOptional()
  @IsEnum(SafetyLevel, { message: 'Invalid safety level' })
  safetyLevel?: SafetyLevel;

  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean({ message: 'Active must be a boolean' })
  isActive?: boolean;
}

// Production Order DTOs
export class BillOfMaterialsItemDto {
  @ApiProperty({ description: 'Item/Component ID' })
  @IsString({ message: 'Item ID must be a string' })
  @IsNotEmpty({ message: 'Item ID cannot be empty' })
  itemId: string;

  @ApiProperty({ description: 'Required quantity', minimum: 0.001 })
  @IsNumber({ maxDecimalPlaces: 3 }, { message: 'Quantity must be a valid number with max 3 decimal places' })
  @Min(0.001, { message: 'Quantity must be greater than 0' })
  quantity: number;

  @ApiProperty({ description: 'Unit of measurement', maxLength: 10 })
  @IsString({ message: 'Unit must be a string' })
  @Length(1, 10, { message: 'Unit must be between 1 and 10 characters' })
  unit: string;

  @ApiPropertyOptional({ description: 'Scrap allowance percentage', minimum: 0, maximum: 50 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Scrap allowance must be a valid percentage' })
  @Min(0, { message: 'Scrap allowance cannot be negative' })
  @Max(50, { message: 'Scrap allowance cannot exceed 50%' })
  scrapAllowancePercent?: number;
}

export class ProductionStepDto {
  @ApiProperty({ description: 'Step sequence number', minimum: 1 })
  @IsNumber({}, { message: 'Sequence must be a valid number' })
  @IsPositive({ message: 'Sequence must be positive' })
  sequence: number;

  @ApiProperty({ description: 'Work center ID where step is performed' })
  @IsString({ message: 'Work center ID must be a string' })
  @IsNotEmpty({ message: 'Work center ID cannot be empty' })
  workCenterId: string;

  @ApiProperty({ description: 'Operation description', maxLength: 200 })
  @IsString({ message: 'Operation must be a string' })
  @Length(1, 200, { message: 'Operation must be between 1 and 200 characters' })
  operation: string;

  @ApiProperty({ description: 'Setup time in minutes', minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Setup time must be a valid number' })
  @Min(0, { message: 'Setup time cannot be negative' })
  setupTimeMinutes: number;

  @ApiProperty({ description: 'Runtime per unit in minutes', minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 3 }, { message: 'Runtime must be a valid number' })
  @Min(0.01, { message: 'Runtime must be at least 0.01 minutes' })
  runtimePerUnitMinutes: number;

  @ApiPropertyOptional({ description: 'Quality control required' })
  @IsOptional()
  @IsBoolean({ message: 'Quality control required must be a boolean' })
  qualityControlRequired?: boolean;

  @ApiPropertyOptional({ description: 'Safety requirements', maxLength: 300 })
  @IsOptional()
  @IsString({ message: 'Safety requirements must be a string' })
  @Length(0, 300, { message: 'Safety requirements cannot exceed 300 characters' })
  safetyRequirements?: string;
}

export class CreateProductionOrderDto {
  @ApiProperty({ description: 'Production order number', maxLength: 50 })
  @IsString({ message: 'Order number must be a string' })
  @IsNotEmpty({ message: 'Order number cannot be empty' })
  @Length(5, 50, { message: 'Order number must be between 5 and 50 characters' })
  @Matches(/^[A-Z0-9_-]+$/, { message: 'Order number can only contain uppercase letters, numbers, underscore and dash' })
  orderNumber: string;

  @ApiProperty({ description: 'Product ID to be manufactured' })
  @IsString({ message: 'Product ID must be a string' })
  @IsNotEmpty({ message: 'Product ID cannot be empty' })
  productId: string;

  @ApiProperty({ description: 'Quantity to manufacture', minimum: 1 })
  @IsNumber({}, { message: 'Quantity must be a valid number' })
  @IsPositive({ message: 'Quantity must be positive' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @ApiProperty({ description: 'Planned start date' })
  @IsDate({ message: 'Planned start date must be a valid date' })
  @Type(() => Date)
  plannedStartDate: Date;

  @ApiProperty({ description: 'Planned end date' })
  @IsDate({ message: 'Planned end date must be a valid date' })
  @Type(() => Date)
  plannedEndDate: Date;

  @ApiProperty({ description: 'Priority level', minimum: 1, maximum: 10 })
  @IsNumber({}, { message: 'Priority must be a valid number' })
  @Min(1, { message: 'Priority must be at least 1' })
  @Max(10, { message: 'Priority cannot exceed 10' })
  priority: number;

  @ApiProperty({ type: [BillOfMaterialsItemDto], description: 'Bill of materials' })
  @IsArray({ message: 'Bill of materials must be an array' })
  @ArrayMinSize(1, { message: 'At least one BOM item is required' })
  @ArrayMaxSize(100, { message: 'Cannot exceed 100 BOM items' })
  @ValidateNested({ each: true })
  @Type(() => BillOfMaterialsItemDto)
  billOfMaterials: BillOfMaterialsItemDto[];

  @ApiProperty({ type: [ProductionStepDto], description: 'Production routing steps' })
  @IsArray({ message: 'Production steps must be an array' })
  @ArrayMinSize(1, { message: 'At least one production step is required' })
  @ArrayMaxSize(50, { message: 'Cannot exceed 50 production steps' })
  @ValidateNested({ each: true })
  @Type(() => ProductionStepDto)
  productionSteps: ProductionStepDto[];

  @ApiPropertyOptional({ description: 'Customer order reference', maxLength: 100 })
  @IsOptional()
  @IsString({ message: 'Customer order reference must be a string' })
  @Length(0, 100, { message: 'Customer order reference cannot exceed 100 characters' })
  customerOrderReference?: string;

  @ApiPropertyOptional({ description: 'Special instructions', maxLength: 1000 })
  @IsOptional()
  @IsString({ message: 'Special instructions must be a string' })
  @Length(0, 1000, { message: 'Special instructions cannot exceed 1000 characters' })
  specialInstructions?: string;
}

export class UpdateProductionOrderStatusDto {
  @ApiProperty({ enum: ProductionOrderStatus, description: 'New production order status' })
  @IsEnum(ProductionOrderStatus, { message: 'Invalid production order status' })
  status: ProductionOrderStatus;

  @ApiPropertyOptional({ description: 'Status change notes', maxLength: 500 })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @Length(0, 500, { message: 'Notes cannot exceed 500 characters' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Actual start date (for IN_PROGRESS status)' })
  @IsOptional()
  @IsDate({ message: 'Actual start date must be a valid date' })
  @Type(() => Date)
  actualStartDate?: Date;

  @ApiPropertyOptional({ description: 'Actual end date (for COMPLETED status)' })
  @IsOptional()
  @IsDate({ message: 'Actual end date must be a valid date' })
  @Type(() => Date)
  actualEndDate?: Date;
}

// Quality Control DTOs
export class QualityCheckParameterDto {
  @ApiProperty({ description: 'Parameter name', maxLength: 100 })
  @IsString({ message: 'Parameter name must be a string' })
  @IsNotEmpty({ message: 'Parameter name cannot be empty' })
  @Length(2, 100, { message: 'Parameter name must be between 2 and 100 characters' })
  name: string;

  @ApiProperty({ description: 'Expected/target value' })
  @IsNumber({ maxDecimalPlaces: 6 }, { message: 'Target value must be a valid number' })
  targetValue: number;

  @ApiProperty({ description: 'Measured/actual value' })
  @IsNumber({ maxDecimalPlaces: 6 }, { message: 'Actual value must be a valid number' })
  actualValue: number;

  @ApiProperty({ description: 'Unit of measurement', maxLength: 20 })
  @IsString({ message: 'Unit must be a string' })
  @Length(1, 20, { message: 'Unit must be between 1 and 20 characters' })
  unit: string;

  @ApiProperty({ description: 'Lower tolerance limit' })
  @IsNumber({ maxDecimalPlaces: 6 }, { message: 'Lower limit must be a valid number' })
  lowerLimit: number;

  @ApiProperty({ description: 'Upper tolerance limit' })
  @IsNumber({ maxDecimalPlaces: 6 }, { message: 'Upper limit must be a valid number' })
  upperLimit: number;

  @ApiPropertyOptional({ description: 'Test method used', maxLength: 100 })
  @IsOptional()
  @IsString({ message: 'Test method must be a string' })
  @Length(0, 100, { message: 'Test method cannot exceed 100 characters' })
  testMethod?: string;
}

export class CreateQualityCheckDto {
  @ApiProperty({ description: 'Production order ID being checked' })
  @IsString({ message: 'Production order ID must be a string' })
  @IsNotEmpty({ message: 'Production order ID cannot be empty' })
  productionOrderId: string;

  @ApiProperty({ description: 'Work center where check is performed' })
  @IsString({ message: 'Work center ID must be a string' })
  @IsNotEmpty({ message: 'Work center ID cannot be empty' })
  workCenterId: string;

  @ApiProperty({ description: 'Inspector/operator ID' })
  @IsString({ message: 'Inspector ID must be a string' })
  @IsNotEmpty({ message: 'Inspector ID cannot be empty' })
  inspectorId: string;

  @ApiProperty({ description: 'Check type/name', maxLength: 100 })
  @IsString({ message: 'Check type must be a string' })
  @IsNotEmpty({ message: 'Check type cannot be empty' })
  @Length(2, 100, { message: 'Check type must be between 2 and 100 characters' })
  checkType: string;

  @ApiProperty({ type: [QualityCheckParameterDto], description: 'Quality parameters to check' })
  @IsArray({ message: 'Parameters must be an array' })
  @ArrayMinSize(1, { message: 'At least one parameter is required' })
  @ArrayMaxSize(50, { message: 'Cannot exceed 50 parameters' })
  @ValidateNested({ each: true })
  @Type(() => QualityCheckParameterDto)
  parameters: QualityCheckParameterDto[];

  @ApiPropertyOptional({ description: 'Sample size checked', minimum: 1 })
  @IsOptional()
  @IsNumber({}, { message: 'Sample size must be a valid number' })
  @IsPositive({ message: 'Sample size must be positive' })
  sampleSize?: number;

  @ApiPropertyOptional({ description: 'Additional notes', maxLength: 1000 })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @Length(0, 1000, { message: 'Notes cannot exceed 1000 characters' })
  notes?: string;
}

export class UpdateQualityCheckDto {
  @ApiProperty({ enum: QualityStatus, description: 'Quality check result' })
  @IsEnum(QualityStatus, { message: 'Invalid quality status' })
  status: QualityStatus;

  @ApiPropertyOptional({ description: 'Inspector comments', maxLength: 500 })
  @IsOptional()
  @IsString({ message: 'Comments must be a string' })
  @Length(0, 500, { message: 'Comments cannot exceed 500 characters' })
  comments?: string;

  @ApiPropertyOptional({ description: 'Corrective actions taken', maxLength: 1000 })
  @IsOptional()
  @IsString({ message: 'Corrective actions must be a string' })
  @Length(0, 1000, { message: 'Corrective actions cannot exceed 1000 characters' })
  correctiveActions?: string;
}

// Maintenance DTOs
export class CreateMaintenanceRequestDto {
  @ApiProperty({ description: 'Equipment/asset ID requiring maintenance' })
  @IsString({ message: 'Equipment ID must be a string' })
  @IsNotEmpty({ message: 'Equipment ID cannot be empty' })
  equipmentId: string;

  @ApiProperty({ description: 'Work center where equipment is located' })
  @IsString({ message: 'Work center ID must be a string' })
  @IsNotEmpty({ message: 'Work center ID cannot be empty' })
  workCenterId: string;

  @ApiProperty({ enum: MaintenanceType, description: 'Type of maintenance required' })
  @IsEnum(MaintenanceType, { message: 'Invalid maintenance type' })
  maintenanceType: MaintenanceType;

  @ApiProperty({ description: 'Brief description of issue/maintenance needed', maxLength: 200 })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @Length(10, 200, { message: 'Description must be between 10 and 200 characters' })
  description: string;

  @ApiProperty({ description: 'Priority level', minimum: 1, maximum: 5 })
  @IsNumber({}, { message: 'Priority must be a valid number' })
  @Min(1, { message: 'Priority must be at least 1' })
  @Max(5, { message: 'Priority cannot exceed 5' })
  priority: number;

  @ApiPropertyOptional({ description: 'Requested by (employee ID)' })
  @IsOptional()
  @IsString({ message: 'Requested by must be a string' })
  requestedBy?: string;

  @ApiPropertyOptional({ description: 'Preferred completion date' })
  @IsOptional()
  @IsDate({ message: 'Preferred date must be a valid date' })
  @Type(() => Date)
  preferredCompletionDate?: Date;

  @ApiPropertyOptional({ description: 'Detailed issue description', maxLength: 1000 })
  @IsOptional()
  @IsString({ message: 'Detailed description must be a string' })
  @Length(0, 1000, { message: 'Detailed description cannot exceed 1000 characters' })
  detailedDescription?: string;

  @ApiPropertyOptional({ description: 'Estimated downtime in hours', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Estimated downtime must be a valid number' })
  @Min(0, { message: 'Estimated downtime cannot be negative' })
  estimatedDowntimeHours?: number;
}

// IoT Integration DTOs
export class IoTThresholdDto {
  @ApiProperty({ description: 'Minimum threshold value' })
  @IsNumber({ maxDecimalPlaces: 6 }, { message: 'Minimum value must be a valid number' })
  min: number;

  @ApiProperty({ description: 'Maximum threshold value' })
  @IsNumber({ maxDecimalPlaces: 6 }, { message: 'Maximum value must be a valid number' })
  max: number;

  @ApiProperty({ description: 'Unit of measurement', maxLength: 20 })
  @IsString({ message: 'Unit must be a string' })
  @Length(1, 20, { message: 'Unit must be between 1 and 20 characters' })
  unit: string;
}

export class IoTDeviceConfigurationDto {
  @ApiProperty({ description: 'Device endpoint URL' })
  @IsString({ message: 'Endpoint must be a string' })
  @IsNotEmpty({ message: 'Endpoint cannot be empty' })
  @IsUrl({}, { message: 'Endpoint must be a valid URL' })
  endpoint: string;

  @ApiProperty({ description: 'Polling interval in milliseconds', minimum: 1000, maximum: 300000 })
  @IsNumber({}, { message: 'Poll interval must be a valid number' })
  @Min(1000, { message: 'Poll interval must be at least 1000ms' })
  @Max(300000, { message: 'Poll interval cannot exceed 300000ms (5 minutes)' })
  pollInterval: number;

  @ApiPropertyOptional({ type: IoTThresholdDto, description: 'Sensor threshold values' })
  @IsOptional()
  @ValidateNested()
  @Type(() => IoTThresholdDto)
  threshold?: IoTThresholdDto;
}

export class RegisterIoTDeviceDto {
  @ApiPropertyOptional({ description: 'Device ID (auto-generated if not provided)' })
  @IsOptional()
  @IsString({ message: 'Device ID must be a string' })
  @Length(3, 50, { message: 'Device ID must be between 3 and 50 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Device ID can only contain letters, numbers, underscore and dash' })
  id?: string;

  @ApiProperty({ description: 'Device name', maxLength: 100 })
  @IsString({ message: 'Device name must be a string' })
  @IsNotEmpty({ message: 'Device name cannot be empty' })
  @Length(2, 100, { message: 'Device name must be between 2 and 100 characters' })
  name: string;

  @ApiProperty({ description: 'Device type', enum: ['SENSOR', 'ACTUATOR', 'CONTROLLER', 'GATEWAY', 'CAMERA', 'RFID_READER'] })
  @IsEnum(['SENSOR', 'ACTUATOR', 'CONTROLLER', 'GATEWAY', 'CAMERA', 'RFID_READER'], { 
    message: 'Invalid device type' 
  })
  type: string;

  @ApiProperty({ description: 'Device category', enum: ['TEMPERATURE', 'PRESSURE', 'VIBRATION', 'POWER', 'FLOW', 'POSITION', 'QUALITY', 'SAFETY'] })
  @IsEnum(['TEMPERATURE', 'PRESSURE', 'VIBRATION', 'POWER', 'FLOW', 'POSITION', 'QUALITY', 'SAFETY'], {
    message: 'Invalid device category'
  })
  category: string;

  @ApiProperty({ description: 'Work center ID where device is installed' })
  @IsString({ message: 'Work center ID must be a string' })
  @IsNotEmpty({ message: 'Work center ID cannot be empty' })
  workCenterId: string;

  @ApiProperty({ type: LocationDto, description: 'Device physical location' })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ description: 'Communication protocol', enum: ['MQTT', 'MODBUS', 'OPC_UA', 'HTTP', 'COAP', 'ZIGBEE', 'LORA'] })
  @IsEnum(['MQTT', 'MODBUS', 'OPC_UA', 'HTTP', 'COAP', 'ZIGBEE', 'LORA'], {
    message: 'Invalid protocol'
  })
  protocol: string;

  @ApiProperty({ type: IoTDeviceConfigurationDto, description: 'Device configuration' })
  @ValidateNested()
  @Type(() => IoTDeviceConfigurationDto)
  configuration: IoTDeviceConfigurationDto;

  @ApiPropertyOptional({ description: 'Additional device metadata' })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: Record<string, any>;
}

// Search and Filter DTOs
export class WorkCenterSearchDto {
  @ApiPropertyOptional({ description: 'Search by name (partial match)' })
  @IsOptional()
  @IsString({ message: 'Name search must be a string' })
  @Length(1, 100, { message: 'Name search must be between 1 and 100 characters' })
  name?: string;

  @ApiPropertyOptional({ enum: WorkCenterType, description: 'Filter by work center type' })
  @IsOptional()
  @IsEnum(WorkCenterType, { message: 'Invalid work center type' })
  type?: WorkCenterType;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean({ message: 'Active filter must be a boolean' })
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Minimum capacity' })
  @IsOptional()
  @IsNumber({}, { message: 'Min capacity must be a valid number' })
  @Min(0, { message: 'Min capacity cannot be negative' })
  minCapacity?: number;

  @ApiPropertyOptional({ description: 'Maximum capacity' })
  @IsOptional()
  @IsNumber({}, { message: 'Max capacity must be a valid number' })
  @Min(0, { message: 'Max capacity cannot be negative' })
  maxCapacity?: number;
}

export class ProductionOrderSearchDto {
  @ApiPropertyOptional({ description: 'Search by order number (partial match)' })
  @IsOptional()
  @IsString({ message: 'Order number search must be a string' })
  @Length(1, 50, { message: 'Order number search must be between 1 and 50 characters' })
  orderNumber?: string;

  @ApiPropertyOptional({ enum: ProductionOrderStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(ProductionOrderStatus, { message: 'Invalid production order status' })
  status?: ProductionOrderStatus;

  @ApiPropertyOptional({ description: 'Filter by product ID' })
  @IsOptional()
  @IsString({ message: 'Product ID must be a string' })
  productId?: string;

  @ApiPropertyOptional({ description: 'Start date for planned start range' })
  @IsOptional()
  @IsDate({ message: 'Start date must be a valid date' })
  @Type(() => Date)
  plannedStartFrom?: Date;

  @ApiPropertyOptional({ description: 'End date for planned start range' })
  @IsOptional()
  @IsDate({ message: 'End date must be a valid date' })
  @Type(() => Date)
  plannedStartTo?: Date;

  @ApiPropertyOptional({ description: 'Minimum priority', minimum: 1, maximum: 10 })
  @IsOptional()
  @IsNumber({}, { message: 'Min priority must be a valid number' })
  @Min(1, { message: 'Min priority must be at least 1' })
  @Max(10, { message: 'Min priority cannot exceed 10' })
  minPriority?: number;
}

// Bulk Operations DTOs
export class BulkUpdateProductionOrderStatusDto {
  @ApiProperty({ description: 'Array of production order IDs to update' })
  @IsArray({ message: 'Order IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one order ID is required' })
  @ArrayMaxSize(100, { message: 'Cannot update more than 100 orders at once' })
  @IsString({ each: true, message: 'Each order ID must be a string' })
  orderIds: string[];

  @ApiProperty({ enum: ProductionOrderStatus, description: 'New status for all orders' })
  @IsEnum(ProductionOrderStatus, { message: 'Invalid production order status' })
  status: ProductionOrderStatus;

  @ApiPropertyOptional({ description: 'Bulk update notes', maxLength: 500 })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @Length(0, 500, { message: 'Notes cannot exceed 500 characters' })
  notes?: string;
}

export class BulkCreateQualityChecksDto {
  @ApiProperty({ description: 'Production orders to create quality checks for' })
  @IsArray({ message: 'Production order IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one production order is required' })
  @ArrayMaxSize(50, { message: 'Cannot create quality checks for more than 50 orders at once' })
  @IsString({ each: true, message: 'Each production order ID must be a string' })
  productionOrderIds: string[];

  @ApiProperty({ description: 'Check type for all quality checks', maxLength: 100 })
  @IsString({ message: 'Check type must be a string' })
  @IsNotEmpty({ message: 'Check type cannot be empty' })
  @Length(2, 100, { message: 'Check type must be between 2 and 100 characters' })
  checkType: string;

  @ApiProperty({ description: 'Inspector ID for all checks' })
  @IsString({ message: 'Inspector ID must be a string' })
  @IsNotEmpty({ message: 'Inspector ID cannot be empty' })
  inspectorId: string;
}

// Response DTOs for API documentation
export class ApiResponseDto<T> {
  @ApiProperty({ description: 'Indicates if the request was successful' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiPropertyOptional({ description: 'Response data' })
  data?: T;

  @ApiPropertyOptional({ description: 'Error details (if any)' })
  errors?: string[];
}

export class PaginatedResponseDto<T> {
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
}
