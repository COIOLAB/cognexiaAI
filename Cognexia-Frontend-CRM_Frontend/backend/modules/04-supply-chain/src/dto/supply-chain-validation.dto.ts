/**
 * Supply Chain Module - Comprehensive Validation DTOs
 * Industry 5.0 ERP - Supply Chain Management Data Transfer Objects
 */

import {
  IsString,
  IsNumber,
  IsEmail,
  IsPhoneNumber,
  IsUrl,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsDateString,
  IsUUID,
  IsPositive,
  IsNotEmpty,
  Min,
  Max,
  Length,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  Matches,
  IsObject,
  IsDecimal,
  IsJSON,
  IsLatitude,
  IsLongitude
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ====== COMMON DTOs ======

export class AddressDto {
  @ApiProperty({ description: 'Street address line 1' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  street1: string;

  @ApiPropertyOptional({ description: 'Street address line 2' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  street2?: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  city: string;

  @ApiProperty({ description: 'State or province' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  state: string;

  @ApiProperty({ description: 'Postal or ZIP code' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  postalCode: string;

  @ApiProperty({ description: 'Country code (ISO 3166-1 alpha-2)' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 3)
  @Matches(/^[A-Z]{2,3}$/)
  country: string;

  @ApiPropertyOptional({ description: 'Latitude coordinate' })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude coordinate' })
  @IsOptional()
  @IsLongitude()
  longitude?: number;
}

export class ContactDto {
  @ApiProperty({ description: 'Contact person name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Phone number' })
  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ description: 'Job title' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  title?: string;

  @ApiPropertyOptional({ description: 'Department' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  department?: string;
}

export class ComplianceCertificationDto {
  @ApiProperty({ description: 'Certification type' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  type: string;

  @ApiProperty({ description: 'Certification number' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  certificationNumber: string;

  @ApiProperty({ description: 'Issuing authority' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  issuingAuthority: string;

  @ApiProperty({ description: 'Issue date' })
  @IsDateString()
  @IsNotEmpty()
  issueDate: string;

  @ApiProperty({ description: 'Expiration date' })
  @IsDateString()
  @IsNotEmpty()
  expirationDate: string;

  @ApiPropertyOptional({ description: 'Status of certification' })
  @IsOptional()
  @IsEnum(['active', 'expired', 'revoked', 'suspended'])
  status?: 'active' | 'expired' | 'revoked' | 'suspended';
}

// ====== SUPPLIER DTOs ======

export class CreateSupplierDto {
  @ApiProperty({ description: 'Supplier name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiProperty({ description: 'Supplier code/identifier' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  @Matches(/^[A-Z0-9-]+$/)
  supplierCode: string;

  @ApiProperty({ description: 'Supplier type' })
  @IsEnum(['manufacturer', 'distributor', 'wholesaler', 'service_provider', 'contractor'])
  @IsNotEmpty()
  supplierType: 'manufacturer' | 'distributor' | 'wholesaler' | 'service_provider' | 'contractor';

  @ApiProperty({ description: 'Supplier category' })
  @IsEnum(['strategic', 'preferred', 'approved', 'conditional', 'blocked'])
  @IsNotEmpty()
  category: 'strategic' | 'preferred' | 'approved' | 'conditional' | 'blocked';

  @ApiProperty({ description: 'Primary contact information', type: ContactDto })
  @ValidateNested()
  @Type(() => ContactDto)
  @IsNotEmpty()
  primaryContact: ContactDto;

  @ApiProperty({ description: 'Business address', type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
  address: AddressDto;

  @ApiPropertyOptional({ description: 'Tax identification number' })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  taxId?: string;

  @ApiPropertyOptional({ description: 'Business registration number' })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  businessRegistrationNumber?: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Annual revenue' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  annualRevenue?: number;

  @ApiPropertyOptional({ description: 'Number of employees' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  employeeCount?: number;

  @ApiPropertyOptional({ description: 'Payment terms in days' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(365)
  paymentTerms?: number;

  @ApiPropertyOptional({ description: 'Credit limit' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  creditLimit?: number;

  @ApiPropertyOptional({ description: 'Delivery lead time in days' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(365)
  leadTime?: number;

  @ApiPropertyOptional({ description: 'Quality rating (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  qualityRating?: number;

  @ApiPropertyOptional({ description: 'Delivery rating (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  deliveryRating?: number;

  @ApiPropertyOptional({ description: 'Service rating (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  serviceRating?: number;

  @ApiPropertyOptional({ description: 'Compliance certifications', type: [ComplianceCertificationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComplianceCertificationDto)
  certifications?: ComplianceCertificationDto[];

  @ApiPropertyOptional({ description: 'Product categories supplied' })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  productCategories?: string[];

  @ApiPropertyOptional({ description: 'Countries of operation' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Length(2, 3, { each: true })
  operatingCountries?: string[];

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Is supplier active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateSupplierDto {
  @ApiPropertyOptional({ description: 'Supplier name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name?: string;

  @ApiPropertyOptional({ description: 'Supplier category' })
  @IsOptional()
  @IsEnum(['strategic', 'preferred', 'approved', 'conditional', 'blocked'])
  category?: 'strategic' | 'preferred' | 'approved' | 'conditional' | 'blocked';

  @ApiPropertyOptional({ description: 'Primary contact information', type: ContactDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactDto)
  primaryContact?: ContactDto;

  @ApiPropertyOptional({ description: 'Business address', type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional({ description: 'Payment terms in days' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(365)
  paymentTerms?: number;

  @ApiPropertyOptional({ description: 'Credit limit' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  creditLimit?: number;

  @ApiPropertyOptional({ description: 'Quality rating (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  qualityRating?: number;

  @ApiPropertyOptional({ description: 'Delivery rating (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  deliveryRating?: number;

  @ApiPropertyOptional({ description: 'Service rating (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  serviceRating?: number;

  @ApiPropertyOptional({ description: 'Is supplier active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SupplierSearchDto {
  @ApiPropertyOptional({ description: 'Search term for supplier name or code' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  search?: string;

  @ApiPropertyOptional({ description: 'Supplier type filter' })
  @IsOptional()
  @IsEnum(['manufacturer', 'distributor', 'wholesaler', 'service_provider', 'contractor'])
  supplierType?: 'manufacturer' | 'distributor' | 'wholesaler' | 'service_provider' | 'contractor';

  @ApiPropertyOptional({ description: 'Supplier category filter' })
  @IsOptional()
  @IsEnum(['strategic', 'preferred', 'approved', 'conditional', 'blocked'])
  category?: 'strategic' | 'preferred' | 'approved' | 'conditional' | 'blocked';

  @ApiPropertyOptional({ description: 'Country filter' })
  @IsOptional()
  @IsString()
  @Length(2, 3)
  country?: string;

  @ApiPropertyOptional({ description: 'Minimum quality rating' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  minQualityRating?: number;

  @ApiPropertyOptional({ description: 'Only active suppliers' })
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

// ====== WAREHOUSE DTOs ======

export class CreateWarehouseDto {
  @ApiProperty({ description: 'Warehouse name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiProperty({ description: 'Warehouse code/identifier' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  @Matches(/^[A-Z0-9-]+$/)
  warehouseCode: string;

  @ApiProperty({ description: 'Warehouse type' })
  @IsEnum(['distribution_center', 'fulfillment_center', 'cross_dock', 'cold_storage', 'bonded'])
  @IsNotEmpty()
  warehouseType: 'distribution_center' | 'fulfillment_center' | 'cross_dock' | 'cold_storage' | 'bonded';

  @ApiProperty({ description: 'Warehouse address', type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
  address: AddressDto;

  @ApiProperty({ description: 'Manager contact information', type: ContactDto })
  @ValidateNested()
  @Type(() => ContactDto)
  @IsNotEmpty()
  manager: ContactDto;

  @ApiProperty({ description: 'Total storage capacity in cubic meters' })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  totalCapacity: number;

  @ApiPropertyOptional({ description: 'Number of loading docks' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  loadingDocks?: number;

  @ApiPropertyOptional({ description: 'Operating hours (JSON format)' })
  @IsOptional()
  @IsJSON()
  operatingHours?: string;

  @ApiPropertyOptional({ description: 'Temperature range minimum (Celsius)' })
  @IsOptional()
  @IsNumber()
  @Min(-50)
  @Max(50)
  temperatureMin?: number;

  @ApiPropertyOptional({ description: 'Temperature range maximum (Celsius)' })
  @IsOptional()
  @IsNumber()
  @Min(-50)
  @Max(50)
  temperatureMax?: number;

  @ApiPropertyOptional({ description: 'Humidity control available' })
  @IsOptional()
  @IsBoolean()
  hasHumidityControl?: boolean;

  @ApiPropertyOptional({ description: 'Security level' })
  @IsOptional()
  @IsEnum(['basic', 'standard', 'high', 'maximum'])
  securityLevel?: 'basic' | 'standard' | 'high' | 'maximum';

  @ApiPropertyOptional({ description: 'Automated systems available' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  automatedSystems?: string[];

  @ApiPropertyOptional({ description: 'Certifications and compliance' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComplianceCertificationDto)
  certifications?: ComplianceCertificationDto[];

  @ApiPropertyOptional({ description: 'Is warehouse active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateWarehouseDto {
  @ApiPropertyOptional({ description: 'Warehouse name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name?: string;

  @ApiPropertyOptional({ description: 'Manager contact information', type: ContactDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactDto)
  manager?: ContactDto;

  @ApiPropertyOptional({ description: 'Total storage capacity in cubic meters' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  totalCapacity?: number;

  @ApiPropertyOptional({ description: 'Operating hours (JSON format)' })
  @IsOptional()
  @IsJSON()
  operatingHours?: string;

  @ApiPropertyOptional({ description: 'Security level' })
  @IsOptional()
  @IsEnum(['basic', 'standard', 'high', 'maximum'])
  securityLevel?: 'basic' | 'standard' | 'high' | 'maximum';

  @ApiPropertyOptional({ description: 'Is warehouse active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ====== SHIPMENT DTOs ======

export class CargoItemDto {
  @ApiProperty({ description: 'Item SKU' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  sku: string;

  @ApiProperty({ description: 'Item name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ description: 'Weight per unit (kg)' })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  weight: number;

  @ApiProperty({ description: 'Volume per unit (cubic meters)' })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  volume: number;

  @ApiProperty({ description: 'Value per unit' })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  value: number;

  @ApiPropertyOptional({ description: 'Serial numbers' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serialNumbers?: string[];

  @ApiPropertyOptional({ description: 'Batch number' })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  batchNumber?: string;

  @ApiPropertyOptional({ description: 'Expiration date' })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiPropertyOptional({ description: 'Special handling requirements' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialRequirements?: string[];
}

export class CreateShipmentDto {
  @ApiProperty({ description: 'Origin warehouse ID' })
  @IsUUID()
  @IsNotEmpty()
  originWarehouseId: string;

  @ApiProperty({ description: 'Destination address', type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
  destinationAddress: AddressDto;

  @ApiProperty({ description: 'Recipient contact', type: ContactDto })
  @ValidateNested()
  @Type(() => ContactDto)
  @IsNotEmpty()
  recipient: ContactDto;

  @ApiProperty({ description: 'Shipment priority' })
  @IsEnum(['low', 'normal', 'high', 'urgent', 'critical'])
  @IsNotEmpty()
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'critical';

  @ApiProperty({ description: 'Service level' })
  @IsEnum(['standard', 'expedited', 'overnight', 'same_day'])
  @IsNotEmpty()
  serviceLevel: 'standard' | 'expedited' | 'overnight' | 'same_day';

  @ApiProperty({ description: 'Cargo items', type: [CargoItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CargoItemDto)
  @IsNotEmpty()
  items: CargoItemDto[];

  @ApiPropertyOptional({ description: 'Preferred carrier' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  preferredCarrier?: string;

  @ApiPropertyOptional({ description: 'Insurance required' })
  @IsOptional()
  @IsBoolean()
  insuranceRequired?: boolean;

  @ApiPropertyOptional({ description: 'Insurance value' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  insuranceValue?: number;

  @ApiPropertyOptional({ description: 'Special handling instructions' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialHandling?: string[];

  @ApiPropertyOptional({ description: 'Temperature requirements' })
  @IsOptional()
  @IsObject()
  temperatureRequirements?: { min: number; max: number };

  @ApiPropertyOptional({ description: 'Delivery deadline' })
  @IsOptional()
  @IsDateString()
  deliveryDeadline?: string;

  @ApiPropertyOptional({ description: 'Customer reference number' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  customerReference?: string;

  @ApiPropertyOptional({ description: 'Internal notes' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}

export class ShipmentSearchDto {
  @ApiPropertyOptional({ description: 'Shipment tracking number' })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  trackingNumber?: string;

  @ApiPropertyOptional({ description: 'Shipment status' })
  @IsOptional()
  @IsEnum(['created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception', 'cancelled'])
  status?: 'created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception' | 'cancelled';

  @ApiPropertyOptional({ description: 'Priority level' })
  @IsOptional()
  @IsEnum(['low', 'normal', 'high', 'urgent', 'critical'])
  priority?: 'low' | 'normal' | 'high' | 'urgent' | 'critical';

  @ApiPropertyOptional({ description: 'Origin warehouse ID' })
  @IsOptional()
  @IsUUID()
  originWarehouseId?: string;

  @ApiPropertyOptional({ description: 'Destination country' })
  @IsOptional()
  @IsString()
  @Length(2, 3)
  destinationCountry?: string;

  @ApiPropertyOptional({ description: 'Carrier name' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  carrier?: string;

  @ApiPropertyOptional({ description: 'Start date for search range' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for search range' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

// ====== INVENTORY DTOs ======

export class CreateInventoryItemDto {
  @ApiProperty({ description: 'Item SKU' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  @Matches(/^[A-Z0-9-]+$/)
  sku: string;

  @ApiProperty({ description: 'Item name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiProperty({ description: 'Item description' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  description: string;

  @ApiProperty({ description: 'Item category' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  category: string;

  @ApiProperty({ description: 'Unit of measure' })
  @IsEnum(['piece', 'kg', 'liter', 'meter', 'square_meter', 'cubic_meter', 'box', 'pallet'])
  @IsNotEmpty()
  unitOfMeasure: 'piece' | 'kg' | 'liter' | 'meter' | 'square_meter' | 'cubic_meter' | 'box' | 'pallet';

  @ApiProperty({ description: 'Weight per unit (kg)' })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  unitWeight: number;

  @ApiProperty({ description: 'Volume per unit (cubic meters)' })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  unitVolume: number;

  @ApiProperty({ description: 'Standard cost per unit' })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  standardCost: number;

  @ApiProperty({ description: 'Reorder point' })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  reorderPoint: number;

  @ApiProperty({ description: 'Maximum stock level' })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  maxStockLevel: number;

  @ApiPropertyOptional({ description: 'Minimum order quantity' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minOrderQuantity?: number;

  @ApiPropertyOptional({ description: 'Safety stock level' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  safetyStock?: number;

  @ApiPropertyOptional({ description: 'Lead time in days' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  leadTime?: number;

  @ApiPropertyOptional({ description: 'ABC classification' })
  @IsOptional()
  @IsEnum(['A', 'B', 'C'])
  abcClassification?: 'A' | 'B' | 'C';

  @ApiPropertyOptional({ description: 'Storage requirements' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  storageRequirements?: string[];

  @ApiPropertyOptional({ description: 'Shelf life in days' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shelfLife?: number;

  @ApiPropertyOptional({ description: 'Is item serialized' })
  @IsOptional()
  @IsBoolean()
  isSerialized?: boolean;

  @ApiPropertyOptional({ description: 'Is item active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class InventoryAdjustmentDto {
  @ApiProperty({ description: 'Inventory item SKU' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  sku: string;

  @ApiProperty({ description: 'Warehouse ID' })
  @IsUUID()
  @IsNotEmpty()
  warehouseId: string;

  @ApiProperty({ description: 'Adjustment type' })
  @IsEnum(['inbound', 'outbound', 'transfer', 'adjustment', 'cycle_count', 'damage', 'return'])
  @IsNotEmpty()
  adjustmentType: 'inbound' | 'outbound' | 'transfer' | 'adjustment' | 'cycle_count' | 'damage' | 'return';

  @ApiProperty({ description: 'Quantity change (positive for increase, negative for decrease)' })
  @IsNumber()
  @IsNotEmpty()
  quantityChange: number;

  @ApiProperty({ description: 'Reason for adjustment' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  reason: string;

  @ApiPropertyOptional({ description: 'Reference document number' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  referenceDocument?: string;

  @ApiPropertyOptional({ description: 'From location (for transfers)' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  fromLocation?: string;

  @ApiPropertyOptional({ description: 'To location (for transfers)' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  toLocation?: string;

  @ApiPropertyOptional({ description: 'Batch number' })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  batchNumber?: string;

  @ApiPropertyOptional({ description: 'Serial numbers' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serialNumbers?: string[];

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  notes?: string;
}

export class InventorySearchDto {
  @ApiPropertyOptional({ description: 'Search term for SKU or name' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  search?: string;

  @ApiPropertyOptional({ description: 'Category filter' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  category?: string;

  @ApiPropertyOptional({ description: 'Warehouse ID filter' })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional({ description: 'ABC classification filter' })
  @IsOptional()
  @IsEnum(['A', 'B', 'C'])
  abcClassification?: 'A' | 'B' | 'C';

  @ApiPropertyOptional({ description: 'Low stock items only' })
  @IsOptional()
  @IsBoolean()
  lowStockOnly?: boolean;

  @ApiPropertyOptional({ description: 'Out of stock items only' })
  @IsOptional()
  @IsBoolean()
  outOfStockOnly?: boolean;

  @ApiPropertyOptional({ description: 'Only active items' })
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

// ====== LOGISTICS DTOs ======

export class RouteOptimizationDto {
  @ApiProperty({ description: 'Origin coordinates' })
  @ValidateNested()
  @Type(() => Object)
  @IsNotEmpty()
  origin: { latitude: number; longitude: number };

  @ApiProperty({ description: 'Destination coordinates' })
  @ValidateNested()
  @Type(() => Object)
  @IsNotEmpty()
  destination: { latitude: number; longitude: number };

  @ApiPropertyOptional({ description: 'Waypoints' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  waypoints?: { latitude: number; longitude: number }[];

  @ApiPropertyOptional({ description: 'Vehicle type' })
  @IsOptional()
  @IsEnum(['truck', 'van', 'car', 'motorcycle'])
  vehicleType?: 'truck' | 'van' | 'car' | 'motorcycle';

  @ApiPropertyOptional({ description: 'Optimization objective' })
  @IsOptional()
  @IsEnum(['distance', 'time', 'fuel', 'cost'])
  optimizationObjective?: 'distance' | 'time' | 'fuel' | 'cost';

  @ApiPropertyOptional({ description: 'Avoid toll roads' })
  @IsOptional()
  @IsBoolean()
  avoidTolls?: boolean;

  @ApiPropertyOptional({ description: 'Avoid highways' })
  @IsOptional()
  @IsBoolean()
  avoidHighways?: boolean;

  @ApiPropertyOptional({ description: 'Maximum driving time in hours' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  maxDrivingTime?: number;
}

export class CreateCarrierDto {
  @ApiProperty({ description: 'Carrier name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiProperty({ description: 'Carrier code' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  @Matches(/^[A-Z0-9-]+$/)
  carrierCode: string;

  @ApiProperty({ description: 'Carrier type' })
  @IsEnum(['ltl', 'ftl', 'parcel', 'courier', 'freight_forwarder', 'postal'])
  @IsNotEmpty()
  carrierType: 'ltl' | 'ftl' | 'parcel' | 'courier' | 'freight_forwarder' | 'postal';

  @ApiProperty({ description: 'Primary contact', type: ContactDto })
  @ValidateNested()
  @Type(() => ContactDto)
  @IsNotEmpty()
  primaryContact: ContactDto;

  @ApiProperty({ description: 'Service areas (country codes)' })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Length(2, 3, { each: true })
  serviceAreas: string[];

  @ApiPropertyOptional({ description: 'API endpoint for tracking' })
  @IsOptional()
  @IsUrl()
  trackingApiUrl?: string;

  @ApiPropertyOptional({ description: 'Transit time in days' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(365)
  transitTime?: number;

  @ApiPropertyOptional({ description: 'Base rate per kg' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  baseRate?: number;

  @ApiPropertyOptional({ description: 'Insurance coverage available' })
  @IsOptional()
  @IsBoolean()
  hasInsurance?: boolean;

  @ApiPropertyOptional({ description: 'Signature required' })
  @IsOptional()
  @IsBoolean()
  signatureRequired?: boolean;

  @ApiPropertyOptional({ description: 'Performance rating (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  performanceRating?: number;

  @ApiPropertyOptional({ description: 'Is carrier active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

// ====== ANALYTICS AND REPORTING DTOs ======

export class AnalyticsQueryDto {
  @ApiProperty({ description: 'Report type' })
  @IsEnum(['inventory', 'shipment', 'supplier', 'warehouse', 'carrier', 'financial'])
  @IsNotEmpty()
  reportType: 'inventory' | 'shipment' | 'supplier' | 'warehouse' | 'carrier' | 'financial';

  @ApiProperty({ description: 'Date range start' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: 'Date range end' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({ description: 'Grouping period' })
  @IsOptional()
  @IsEnum(['day', 'week', 'month', 'quarter', 'year'])
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';

  @ApiPropertyOptional({ description: 'Metrics to include' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metrics?: string[];

  @ApiPropertyOptional({ description: 'Filters to apply (JSON format)' })
  @IsOptional()
  @IsJSON()
  filters?: string;

  @ApiPropertyOptional({ description: 'Include trends analysis' })
  @IsOptional()
  @IsBoolean()
  includeTrends?: boolean;

  @ApiPropertyOptional({ description: 'Include forecasting' })
  @IsOptional()
  @IsBoolean()
  includeForecast?: boolean;
}

export class KPITargetDto {
  @ApiProperty({ description: 'KPI metric name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  metric: string;

  @ApiProperty({ description: 'Target value' })
  @IsNumber()
  @IsNotEmpty()
  targetValue: number;

  @ApiProperty({ description: 'Unit of measurement' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  unit: string;

  @ApiPropertyOptional({ description: 'Target period' })
  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

  @ApiPropertyOptional({ description: 'Alert threshold percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  alertThreshold?: number;
}

// ====== PAGINATION AND COMMON RESPONSE DTOs ======

export class PaginationDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}

export class BulkOperationDto {
  @ApiProperty({ description: 'Entity IDs for bulk operation' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsUUID(undefined, { each: true })
  ids: string[];

  @ApiProperty({ description: 'Operation to perform' })
  @IsEnum(['activate', 'deactivate', 'delete', 'export', 'update_status'])
  @IsNotEmpty()
  operation: 'activate' | 'deactivate' | 'delete' | 'export' | 'update_status';

  @ApiPropertyOptional({ description: 'Additional parameters (JSON format)' })
  @IsOptional()
  @IsJSON()
  parameters?: string;
}
