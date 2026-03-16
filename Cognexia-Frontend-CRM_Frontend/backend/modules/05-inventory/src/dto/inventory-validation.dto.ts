/**
 * Comprehensive Inventory Validation DTOs
 * Industry 5.0 ERP - Advanced Inventory Management
 * Complete validation DTOs for all inventory operations with extensive decorators
 */

import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  IsArray,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsEmail,
  IsUrl,
  IsObject,
  ValidateNested,
  Min,
  Max,
  Length,
  Matches,
  ArrayMinSize,
  ArrayMaxSize,
  IsDecimal,
  IsPhoneNumber,
  IsLatitude,
  IsLongitude,
  IsJSON,
  IsPositive,
  IsIn,
  IsNotEmpty,
  IsAlpha,
  IsAlphanumeric,
  IsISO8601,
  IsMongoId
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// =============== ENUM DEFINITIONS ===============

export enum InventoryItemStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCONTINUED = 'DISCONTINUED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OVERSTOCKED = 'OVERSTOCKED',
  ON_ORDER = 'ON_ORDER',
  RESERVED = 'RESERVED',
  QUARANTINED = 'QUARANTINED',
  DAMAGED = 'DAMAGED'
}

export enum StockMovementType {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  CYCLE_COUNT = 'CYCLE_COUNT',
  RETURN = 'RETURN',
  DAMAGE = 'DAMAGE',
  EXPIRED = 'EXPIRED',
  PROMOTION = 'PROMOTION',
  CORRECTION = 'CORRECTION'
}

export enum LocationType {
  RECEIVING = 'RECEIVING',
  STORAGE = 'STORAGE',
  PICKING = 'PICKING',
  PACKING = 'PACKING',
  SHIPPING = 'SHIPPING',
  STAGING = 'STAGING',
  QUARANTINE = 'QUARANTINE',
  DAMAGED_GOODS = 'DAMAGED_GOODS',
  BULK = 'BULK',
  FAST_PICK = 'FAST_PICK'
}

export enum PriorityLevel {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL'
}

export enum AnalysisType {
  ABC_ANALYSIS = 'ABC_ANALYSIS',
  VELOCITY_ANALYSIS = 'VELOCITY_ANALYSIS',
  TURNOVER_ANALYSIS = 'TURNOVER_ANALYSIS',
  FORECAST_ACCURACY = 'FORECAST_ACCURACY',
  STOCKOUT_ANALYSIS = 'STOCKOUT_ANALYSIS',
  OVERSTOCK_ANALYSIS = 'OVERSTOCK_ANALYSIS',
  COST_ANALYSIS = 'COST_ANALYSIS',
  DEMAND_PATTERN = 'DEMAND_PATTERN'
}

export enum SensorType {
  TEMPERATURE = 'TEMPERATURE',
  HUMIDITY = 'HUMIDITY',
  WEIGHT = 'WEIGHT',
  MOTION = 'MOTION',
  DOOR = 'DOOR',
  LIGHT = 'LIGHT',
  PRESSURE = 'PRESSURE',
  VIBRATION = 'VIBRATION',
  AIR_QUALITY = 'AIR_QUALITY',
  PROXIMITY = 'PROXIMITY'
}

// =============== INVENTORY ITEM DTOs ===============

export class CreateInventoryItemDto {
  @ApiProperty({ description: 'Unique item identifier/SKU', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  @Matches(/^[A-Za-z0-9\-_]+$/, { message: 'SKU must contain only alphanumeric characters, hyphens, and underscores' })
  sku: string;

  @ApiProperty({ description: 'Item name/description', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: 'Detailed item description', maxLength: 2000 })
  @IsString()
  @IsOptional()
  @Length(0, 2000)
  description?: string;

  @ApiProperty({ description: 'Item category', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  category: string;

  @ApiProperty({ description: 'Item subcategory', maxLength: 100 })
  @IsString()
  @IsOptional()
  @Length(0, 100)
  subcategory?: string;

  @ApiProperty({ description: 'Unit of measurement', maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  @IsIn(['PIECE', 'KILOGRAM', 'GRAM', 'LITER', 'MILLILITER', 'METER', 'CENTIMETER', 'BOX', 'CASE', 'PALLET'])
  unitOfMeasure: string;

  @ApiProperty({ description: 'Cost per unit', minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Type(() => Number)
  unitCost: number;

  @ApiProperty({ description: 'Selling price per unit', minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Type(() => Number)
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Item barcode' })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{8,14}$/, { message: 'Barcode must be 8-14 digits' })
  barcode?: string;

  @ApiPropertyOptional({ description: 'RFID tag identifier' })
  @IsString()
  @IsOptional()
  @Matches(/^[A-Fa-f0-9]{6,24}$/, { message: 'RFID must be valid hexadecimal format' })
  rfidTag?: string;

  @ApiProperty({ description: 'Minimum stock level', minimum: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minStockLevel: number;

  @ApiProperty({ description: 'Maximum stock level', minimum: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxStockLevel: number;

  @ApiProperty({ description: 'Reorder point', minimum: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  reorderPoint: number;

  @ApiPropertyOptional({ description: 'Economic order quantity', minimum: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  economicOrderQuantity?: number;

  @ApiPropertyOptional({ description: 'Lead time in days', minimum: 0, maximum: 365 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(365)
  @Type(() => Number)
  leadTimeDays?: number;

  @ApiPropertyOptional({ description: 'Shelf life in days', minimum: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  shelfLifeDays?: number;

  @ApiPropertyOptional({ description: 'Item weight in kilograms', minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  weight?: number;

  @ApiPropertyOptional({ description: 'Item dimensions (LxWxH in cm)' })
  @IsString()
  @IsOptional()
  @Matches(/^\d+\.?\d*x\d+\.?\d*x\d+\.?\d*$/, { message: 'Dimensions must be in format LxWxH (e.g., 10.5x20x30)' })
  dimensions?: string;

  @ApiPropertyOptional({ description: 'Storage temperature range (min-max in Celsius)' })
  @IsString()
  @IsOptional()
  @Matches(/^-?\d+\.?\d*--?\d+\.?\d*$/, { message: 'Temperature range must be in format min-max (e.g., -18-25)' })
  temperatureRange?: string;

  @ApiProperty({ enum: InventoryItemStatus, description: 'Current item status' })
  @IsEnum(InventoryItemStatus)
  status: InventoryItemStatus;

  @ApiPropertyOptional({ description: 'Supplier identifier' })
  @IsString()
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ description: 'Manufacturer name', maxLength: 100 })
  @IsString()
  @IsOptional()
  @Length(0, 100)
  manufacturer?: string;

  @ApiPropertyOptional({ description: 'Brand name', maxLength: 100 })
  @IsString()
  @IsOptional()
  @Length(0, 100)
  brand?: string;

  @ApiPropertyOptional({ description: 'Model number', maxLength: 50 })
  @IsString()
  @IsOptional()
  @Length(0, 50)
  model?: string;

  @ApiPropertyOptional({ description: 'Additional metadata as JSON string' })
  @IsString()
  @IsOptional()
  @IsJSON()
  metadata?: string;

  @ApiPropertyOptional({ description: 'Item tags for categorization' })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @Length(1, 30, { each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Enable AI-powered demand forecasting' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  enableAIForecasting?: boolean;

  @ApiPropertyOptional({ description: 'Enable IoT tracking' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  enableIoTTracking?: boolean;
}

export class UpdateInventoryItemDto extends PartialType(CreateInventoryItemDto) {
  @ApiPropertyOptional({ description: 'Last updated timestamp' })
  @IsOptional()
  @IsDateString()
  lastUpdated?: string;
}

// =============== STOCK MOVEMENT DTOs ===============

export class CreateStockMovementDto {
  @ApiProperty({ description: 'Inventory item UUID' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  itemId: string;

  @ApiProperty({ description: 'Location UUID where movement occurs' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  locationId: string;

  @ApiProperty({ enum: StockMovementType, description: 'Type of stock movement' })
  @IsEnum(StockMovementType)
  movementType: StockMovementType;

  @ApiProperty({ description: 'Quantity moved (positive for inbound, negative for outbound)', minimum: -999999, maximum: 999999 })
  @IsNumber()
  @Min(-999999)
  @Max(999999)
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ description: 'Movement reference number', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  referenceNumber: string;

  @ApiPropertyOptional({ description: 'Notes about the movement', maxLength: 1000 })
  @IsString()
  @IsOptional()
  @Length(0, 1000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Cost per unit at time of movement' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  unitCost?: number;

  @ApiPropertyOptional({ description: 'User ID who performed the movement' })
  @IsString()
  @IsOptional()
  @IsUUID()
  performedBy?: string;

  @ApiPropertyOptional({ description: 'Source location UUID for transfers' })
  @IsString()
  @IsOptional()
  @IsUUID()
  sourceLocationId?: string;

  @ApiPropertyOptional({ description: 'Destination location UUID for transfers' })
  @IsString()
  @IsOptional()
  @IsUUID()
  destinationLocationId?: string;

  @ApiPropertyOptional({ description: 'Related order UUID' })
  @IsString()
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional({ description: 'Lot number for batch tracking', maxLength: 50 })
  @IsString()
  @IsOptional()
  @Length(0, 50)
  lotNumber?: string;

  @ApiPropertyOptional({ description: 'Expiration date for perishable items' })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiProperty({ enum: PriorityLevel, description: 'Movement priority level' })
  @IsEnum(PriorityLevel)
  priority: PriorityLevel;

  @ApiPropertyOptional({ description: 'Quality check result (0-100)' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  qualityScore?: number;

  @ApiPropertyOptional({ description: 'Temperature at time of movement' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(-50)
  @Max(100)
  @Type(() => Number)
  temperature?: number;

  @ApiPropertyOptional({ description: 'Humidity percentage at time of movement' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  humidity?: number;
}

// =============== LOCATION MANAGEMENT DTOs ===============

export class CreateLocationDto {
  @ApiProperty({ description: 'Location code/identifier', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  @Matches(/^[A-Za-z0-9\-_]+$/, { message: 'Location code must contain only alphanumeric characters, hyphens, and underscores' })
  locationCode: string;

  @ApiProperty({ description: 'Human-readable location name', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: 'Location description', maxLength: 500 })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  description?: string;

  @ApiProperty({ enum: LocationType, description: 'Type of location' })
  @IsEnum(LocationType)
  locationType: LocationType;

  @ApiProperty({ description: 'Warehouse UUID this location belongs to' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  warehouseId: string;

  @ApiPropertyOptional({ description: 'Parent location UUID for hierarchical structure' })
  @IsString()
  @IsOptional()
  @IsUUID()
  parentLocationId?: string;

  @ApiProperty({ description: 'Aisle identifier', maxLength: 10 })
  @IsString()
  @IsOptional()
  @Length(0, 10)
  aisle?: string;

  @ApiProperty({ description: 'Rack identifier', maxLength: 10 })
  @IsString()
  @IsOptional()
  @Length(0, 10)
  rack?: string;

  @ApiProperty({ description: 'Shelf identifier', maxLength: 10 })
  @IsString()
  @IsOptional()
  @Length(0, 10)
  shelf?: string;

  @ApiProperty({ description: 'Bin identifier', maxLength: 10 })
  @IsString()
  @IsOptional()
  @Length(0, 10)
  bin?: string;

  @ApiProperty({ description: 'Maximum capacity', minimum: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxCapacity: number;

  @ApiProperty({ description: 'Current utilization percentage', minimum: 0, maximum: 100 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @Type(() => Number)
  currentUtilization: number;

  @ApiPropertyOptional({ description: 'X coordinate in warehouse layout' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Type(() => Number)
  coordinateX?: number;

  @ApiPropertyOptional({ description: 'Y coordinate in warehouse layout' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Type(() => Number)
  coordinateY?: number;

  @ApiPropertyOptional({ description: 'Z coordinate (height level)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Type(() => Number)
  coordinateZ?: number;

  @ApiPropertyOptional({ description: 'Picking sequence order' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  pickingSequence?: number;

  @ApiPropertyOptional({ description: 'Access restrictions or special handling requirements' })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @Length(1, 50, { each: true })
  restrictions?: string[];

  @ApiPropertyOptional({ description: 'Temperature control settings' })
  @IsString()
  @IsOptional()
  @Matches(/^-?\d+\.?\d*--?\d+\.?\d*$/, { message: 'Temperature range must be in format min-max' })
  temperatureControl?: string;

  @ApiPropertyOptional({ description: 'Humidity control settings' })
  @IsString()
  @IsOptional()
  @Matches(/^\d+\.?\d*-\d+\.?\d*$/, { message: 'Humidity range must be in format min-max' })
  humidityControl?: string;

  @ApiPropertyOptional({ description: 'Location is active and available for use' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Enable automatic replenishment for this location' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  autoReplenishment?: boolean;
}

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}

// =============== IOT SENSOR DATA DTOs ===============

export class IoTSensorDataDto {
  @ApiProperty({ description: 'Unique sensor identifier' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  sensorId: string;

  @ApiProperty({ description: 'Device identifier' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  deviceId: string;

  @ApiProperty({ enum: SensorType, description: 'Type of sensor' })
  @IsEnum(SensorType)
  sensorType: SensorType;

  @ApiProperty({ description: 'Sensor reading value' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Type(() => Number)
  value: number;

  @ApiProperty({ description: 'Unit of measurement for the value' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  unit: string;

  @ApiProperty({ description: 'Timestamp of the reading' })
  @IsDateString()
  timestamp: string;

  @ApiPropertyOptional({ description: 'Location UUID where sensor is installed' })
  @IsString()
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @ApiPropertyOptional({ description: 'Item UUID being monitored (if applicable)' })
  @IsString()
  @IsOptional()
  @IsUUID()
  itemId?: string;

  @ApiPropertyOptional({ description: 'Battery level percentage (0-100)' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  batteryLevel?: number;

  @ApiPropertyOptional({ description: 'Signal strength percentage (0-100)' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  signalStrength?: number;

  @ApiPropertyOptional({ description: 'Calibration status' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isCalibrated?: boolean;

  @ApiPropertyOptional({ description: 'Sensor alert threshold values' })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  thresholds?: {
    min?: number;
    max?: number;
    critical?: number;
  };
}

// =============== RFID/BARCODE SCANNING DTOs ===============

export class RFIDScanDto {
  @ApiProperty({ description: 'RFID tag identifier' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Fa-f0-9]{6,24}$/, { message: 'RFID must be valid hexadecimal format' })
  rfidTag: string;

  @ApiProperty({ description: 'Scanner/reader identifier' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  readerId: string;

  @ApiProperty({ description: 'Location UUID where scan occurred' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  locationId: string;

  @ApiProperty({ description: 'Timestamp of the scan' })
  @IsDateString()
  scanTimestamp: string;

  @ApiPropertyOptional({ description: 'User UUID who performed the scan' })
  @IsString()
  @IsOptional()
  @IsUUID()
  scannedBy?: string;

  @ApiPropertyOptional({ description: 'Signal strength of the RFID read' })
  @IsNumber()
  @IsOptional()
  @Min(-100)
  @Max(0)
  @Type(() => Number)
  signalStrength?: number;

  @ApiPropertyOptional({ description: 'Scan operation type' })
  @IsString()
  @IsOptional()
  @IsIn(['CHECK_IN', 'CHECK_OUT', 'INVENTORY', 'VERIFICATION', 'MOVEMENT'])
  operation?: string;

  @ApiPropertyOptional({ description: 'Additional scan metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class BarcodeScanDto {
  @ApiProperty({ description: 'Barcode value' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9A-Za-z\-_]+$/, { message: 'Barcode must contain only alphanumeric characters, hyphens, and underscores' })
  barcode: string;

  @ApiProperty({ description: 'Scanner device identifier' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  scannerId: string;

  @ApiProperty({ description: 'Location UUID where scan occurred' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  locationId: string;

  @ApiProperty({ description: 'Timestamp of the scan' })
  @IsDateString()
  scanTimestamp: string;

  @ApiPropertyOptional({ description: 'User UUID who performed the scan' })
  @IsString()
  @IsOptional()
  @IsUUID()
  scannedBy?: string;

  @ApiPropertyOptional({ description: 'Scan quality score (0-100)' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  scanQuality?: number;

  @ApiPropertyOptional({ description: 'Quantity scanned (default: 1)' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(9999)
  @Type(() => Number)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Scan operation type' })
  @IsString()
  @IsOptional()
  @IsIn(['RECEIVE', 'SHIP', 'PICK', 'PUT_AWAY', 'CYCLE_COUNT', 'TRANSFER'])
  operation?: string;

  @ApiPropertyOptional({ description: 'Additional scan data' })
  @IsObject()
  @IsOptional()
  scanData?: Record<string, any>;
}

// =============== CYCLE COUNT DTOs ===============

export class CreateCycleCountDto {
  @ApiProperty({ description: 'Cycle count name/description', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: 'Warehouse UUID for the cycle count' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  warehouseId: string;

  @ApiProperty({ description: 'Scheduled start date' })
  @IsDateString()
  scheduledDate: string;

  @ApiPropertyOptional({ description: 'Expected completion date' })
  @IsDateString()
  @IsOptional()
  expectedCompletionDate?: string;

  @ApiProperty({ enum: PriorityLevel, description: 'Count priority level' })
  @IsEnum(PriorityLevel)
  priority: PriorityLevel;

  @ApiProperty({ description: 'User UUID responsible for the count' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  assignedTo: string;

  @ApiPropertyOptional({ description: 'Specific locations to count' })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(1000)
  @IsUUID('4', { each: true })
  locationIds?: string[];

  @ApiPropertyOptional({ description: 'Specific items to count' })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(1000)
  @IsUUID('4', { each: true })
  itemIds?: string[];

  @ApiPropertyOptional({ description: 'Item categories to include' })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @Length(1, 50, { each: true })
  categories?: string[];

  @ApiPropertyOptional({ description: 'Count methodology' })
  @IsString()
  @IsOptional()
  @IsIn(['FULL_COUNT', 'ABC_COUNT', 'SPOT_CHECK', 'BLIND_COUNT', 'TOLERANCE_CHECK'])
  countMethod?: string;

  @ApiPropertyOptional({ description: 'Acceptance tolerance percentage' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  tolerancePercentage?: number;

  @ApiPropertyOptional({ description: 'Special instructions for counters', maxLength: 1000 })
  @IsString()
  @IsOptional()
  @Length(0, 1000)
  instructions?: string;
}

export class CycleCountResultDto {
  @ApiProperty({ description: 'Cycle count UUID' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  cycleCountId: string;

  @ApiProperty({ description: 'Item UUID being counted' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  itemId: string;

  @ApiProperty({ description: 'Location UUID where count was performed' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  locationId: string;

  @ApiProperty({ description: 'System/book quantity' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  systemQuantity: number;

  @ApiProperty({ description: 'Physical/counted quantity' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  countedQuantity: number;

  @ApiProperty({ description: 'Variance (counted - system)' })
  @IsNumber()
  @Type(() => Number)
  variance: number;

  @ApiProperty({ description: 'User UUID who performed the count' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  countedBy: string;

  @ApiProperty({ description: 'Count timestamp' })
  @IsDateString()
  countTimestamp: string;

  @ApiPropertyOptional({ description: 'Count notes or observations', maxLength: 500 })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  notes?: string;

  @ApiPropertyOptional({ description: 'Count confidence level (0-100)' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  confidenceLevel?: number;

  @ApiPropertyOptional({ description: 'Lot numbers found during count' })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @Length(1, 50, { each: true })
  lotNumbers?: string[];
}

// =============== ANALYTICS AND REPORTING DTOs ===============

export class AnalyticsQueryDto {
  @ApiProperty({ enum: AnalysisType, description: 'Type of analysis to perform' })
  @IsEnum(AnalysisType)
  analysisType: AnalysisType;

  @ApiProperty({ description: 'Start date for analysis period' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date for analysis period' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Warehouse UUIDs to include' })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(20)
  @IsUUID('4', { each: true })
  warehouseIds?: string[];

  @ApiPropertyOptional({ description: 'Item categories to analyze' })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @Length(1, 50, { each: true })
  categories?: string[];

  @ApiPropertyOptional({ description: 'Specific item UUIDs to analyze' })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(1000)
  @IsUUID('4', { each: true })
  itemIds?: string[];

  @ApiPropertyOptional({ description: 'Group results by specified field' })
  @IsString()
  @IsOptional()
  @IsIn(['category', 'warehouse', 'supplier', 'month', 'week', 'day'])
  groupBy?: string;

  @ApiPropertyOptional({ description: 'Include detailed breakdown' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  includeDetails?: boolean;

  @ApiPropertyOptional({ description: 'Export format for results' })
  @IsString()
  @IsOptional()
  @IsIn(['JSON', 'CSV', 'EXCEL', 'PDF'])
  exportFormat?: string;

  @ApiPropertyOptional({ description: 'Additional filter criteria' })
  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;
}

// =============== AI FORECAST DTOs ===============

export class DemandForecastRequestDto {
  @ApiProperty({ description: 'Item UUID for forecast' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  itemId: string;

  @ApiProperty({ description: 'Forecast period in days', minimum: 1, maximum: 365 })
  @IsNumber()
  @Min(1)
  @Max(365)
  @Type(() => Number)
  forecastPeriodDays: number;

  @ApiPropertyOptional({ description: 'Confidence level for forecast (0-100)' })
  @IsNumber()
  @IsOptional()
  @Min(50)
  @Max(99)
  @Type(() => Number)
  confidenceLevel?: number;

  @ApiPropertyOptional({ description: 'Include seasonal adjustments' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  includeSeasonality?: boolean;

  @ApiPropertyOptional({ description: 'Include promotional impact' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  includePromotions?: boolean;

  @ApiPropertyOptional({ description: 'Include external factors' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  includeExternalFactors?: boolean;

  @ApiPropertyOptional({ description: 'Historical data period for training (days)' })
  @IsNumber()
  @IsOptional()
  @Min(30)
  @Max(1095)
  @Type(() => Number)
  historicalPeriodDays?: number;

  @ApiPropertyOptional({ description: 'Forecast model to use' })
  @IsString()
  @IsOptional()
  @IsIn(['ARIMA', 'LSTM', 'PROPHET', 'ENSEMBLE', 'AUTO_SELECT'])
  forecastModel?: string;
}

// =============== QUANTUM OPTIMIZATION DTOs ===============

export class QuantumOptimizationRequestDto {
  @ApiProperty({ description: 'Optimization objective' })
  @IsString()
  @IsNotEmpty()
  @IsIn(['MINIMIZE_COST', 'MAXIMIZE_EFFICIENCY', 'MINIMIZE_TRAVEL_TIME', 'OPTIMIZE_SPACE', 'BALANCE_WORKLOAD'])
  objective: string;

  @ApiProperty({ description: 'Warehouse UUID for optimization' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  warehouseId: string;

  @ApiPropertyOptional({ description: 'Constraint parameters' })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  constraints?: {
    maxIterations?: number;
    timeLimit?: number;
    accuracyThreshold?: number;
    resourceLimits?: Record<string, number>;
  };

  @ApiPropertyOptional({ description: 'Items to include in optimization' })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(1000)
  @IsUUID('4', { each: true })
  itemIds?: string[];

  @ApiPropertyOptional({ description: 'Priority weights for multi-objective optimization' })
  @IsObject()
  @IsOptional()
  priorityWeights?: Record<string, number>;

  @ApiPropertyOptional({ description: 'Use hybrid classical-quantum approach' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  useHybridApproach?: boolean;
}

// =============== BULK OPERATION DTOs ===============

export class BulkStockUpdateDto {
  @ApiProperty({ description: 'List of stock updates to perform' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => CreateStockMovementDto)
  stockMovements: CreateStockMovementDto[];

  @ApiPropertyOptional({ description: 'Batch reference identifier' })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  batchReference?: string;

  @ApiPropertyOptional({ description: 'Validate all before executing any' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  validateFirst?: boolean;

  @ApiPropertyOptional({ description: 'Continue processing on individual errors' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  continueOnError?: boolean;
}

export class BulkLocationUpdateDto {
  @ApiProperty({ description: 'List of location updates to perform' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => UpdateLocationDto)
  locationUpdates: Array<UpdateLocationDto & { locationId: string }>;

  @ApiPropertyOptional({ description: 'Batch reference identifier' })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  batchReference?: string;
}

// =============== RESPONSE DTOs ===============

export class ApiResponseDto<T = any> {
  @ApiProperty({ description: 'Operation success status' })
  @IsBoolean()
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Response data payload' })
  data?: T;

  @ApiPropertyOptional({ description: 'Error details if operation failed' })
  error?: string | object;

  @ApiPropertyOptional({ description: 'Response timestamp' })
  @IsDateString()
  timestamp?: string;
}

export class PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Page number (1-based)', minimum: 1, default: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10000)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 1000, default: 20 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort direction' })
  @IsString()
  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';

  @ApiPropertyOptional({ description: 'Search query string' })
  @IsString()
  @IsOptional()
  @Length(0, 200)
  search?: string;
}

export class PaginatedResponseDto<T = any> {
  @ApiProperty({ description: 'Data items for current page' })
  items: T[];

  @ApiProperty({ description: 'Total number of items' })
  @IsNumber()
  totalItems: number;

  @ApiProperty({ description: 'Total number of pages' })
  @IsNumber()
  totalPages: number;

  @ApiProperty({ description: 'Current page number' })
  @IsNumber()
  currentPage: number;

  @ApiProperty({ description: 'Items per page limit' })
  @IsNumber()
  limit: number;

  @ApiProperty({ description: 'Has next page' })
  @IsBoolean()
  hasNext: boolean;

  @ApiProperty({ description: 'Has previous page' })
  @IsBoolean()
  hasPrev: boolean;
}
