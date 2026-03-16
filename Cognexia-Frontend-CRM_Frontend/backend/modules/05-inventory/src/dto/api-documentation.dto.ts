import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, IsArray, ValidateNested, IsDateString, IsUUID, Min, Max, IsEmail, IsUrl, Matches } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Base Response DTOs
export class ApiResponseDto<T = any> {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  @IsBoolean()
  success: boolean;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  @IsNumber()
  statusCode: number;

  @ApiProperty({
    description: 'Response message',
    example: 'Request processed successfully',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Response data',
    required: false,
  })
  data?: T;

  @ApiPropertyOptional({
    description: 'Error details if request failed',
    type: 'object',
  })
  error?: {
    code: string;
    message: string;
    details?: any;
  };

  @ApiProperty({
    description: 'Request timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDateString()
  timestamp: string;

  @ApiProperty({
    description: 'Request ID for tracking',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  requestId: string;
}

export class PaginationDto {
  @ApiProperty({
    description: 'Page number',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit: number = 20;
}

export class PaginatedResponseDto<T> extends ApiResponseDto<T[]> {
  @ApiProperty({
    description: 'Pagination metadata',
    type: 'object',
  })
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Authentication DTOs
export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@industry5.0.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123!',
    minLength: 8,
  })
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number, and special character',
  })
  password: string;

  @ApiPropertyOptional({
    description: 'Multi-factor authentication token',
    example: '123456',
  })
  @IsOptional()
  @IsString()
  mfaToken?: string;

  @ApiProperty({
    description: 'Device fingerprint for security',
    example: 'fp_abc123def456',
  })
  @IsString()
  deviceFingerprint: string;

  @ApiPropertyOptional({
    description: 'Remember this device',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  rememberDevice?: boolean;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token for getting new access tokens',
    example: 'rt_abc123def456ghi789',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'User information',
    type: 'object',
  })
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    permissions: string[];
  };

  @ApiProperty({
    description: 'Session information',
    type: 'object',
  })
  session: {
    id: string;
    expiresAt: string;
    deviceTrusted: boolean;
    locationTrusted: boolean;
    riskScore: number;
  };

  @ApiPropertyOptional({
    description: 'MFA required flag',
    default: false,
  })
  mfaRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Available MFA methods',
    type: [String],
    example: ['totp', 'sms', 'email'],
  })
  mfaMethods?: string[];
}

// Inventory DTOs
export class CreateInventoryItemDto {
  @ApiProperty({
    description: 'Item name',
    example: 'Industrial Sensor XR-2000',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Item description',
    example: 'High-precision temperature and humidity sensor for industrial use',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Item SKU (Stock Keeping Unit)',
    example: 'XR-2000-TH-001',
  })
  @IsString()
  sku: string;

  @ApiProperty({
    description: 'Item barcode',
    example: '1234567890123',
  })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({
    description: 'Item category',
    example: 'Sensors',
  })
  @IsString()
  category: string;

  @ApiPropertyOptional({
    description: 'Item subcategory',
    example: 'Temperature Sensors',
  })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiProperty({
    description: 'Current quantity in stock',
    minimum: 0,
    example: 100,
  })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({
    description: 'Unit of measurement',
    example: 'pieces',
    enum: ['pieces', 'kg', 'liters', 'meters', 'boxes', 'pallets'],
  })
  @IsEnum(['pieces', 'kg', 'liters', 'meters', 'boxes', 'pallets'])
  unit: string;

  @ApiProperty({
    description: 'Unit cost',
    minimum: 0,
    example: 299.99,
  })
  @IsNumber()
  @Min(0)
  unitCost: number;

  @ApiProperty({
    description: 'Item location ID',
    example: 'LOC-001-A-01',
  })
  @IsString()
  locationId: string;

  @ApiPropertyOptional({
    description: 'Minimum stock level for reorder alerts',
    minimum: 0,
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minStockLevel?: number;

  @ApiPropertyOptional({
    description: 'Maximum stock level',
    minimum: 0,
    example: 500,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStockLevel?: number;

  @ApiPropertyOptional({
    description: 'Supplier information',
    example: 'ACME Industrial Supplies',
  })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiPropertyOptional({
    description: 'Item tags for better organization',
    type: [String],
    example: ['iot', 'sensor', 'temperature'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Additional metadata',
    type: 'object',
    example: {
      serialNumbers: ['SN001', 'SN002'],
      warranty: '2 years',
      specifications: {
        operatingTemp: '-20°C to +60°C',
        accuracy: '±0.1°C',
      },
    },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class InventoryItemResponseDto {
  @ApiProperty({
    description: 'Item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Item name',
    example: 'Industrial Sensor XR-2000',
  })
  name: string;

  @ApiProperty({
    description: 'Item description',
    example: 'High-precision temperature and humidity sensor',
  })
  description: string;

  @ApiProperty({
    description: 'Item SKU',
    example: 'XR-2000-TH-001',
  })
  sku: string;

  @ApiProperty({
    description: 'Current quantity',
    example: 100,
  })
  quantity: number;

  @ApiProperty({
    description: 'Available quantity (excluding reserved)',
    example: 85,
  })
  availableQuantity: number;

  @ApiProperty({
    description: 'Reserved quantity',
    example: 15,
  })
  reservedQuantity: number;

  @ApiProperty({
    description: 'Unit cost',
    example: 299.99,
  })
  unitCost: number;

  @ApiProperty({
    description: 'Total value',
    example: 29999.00,
  })
  totalValue: number;

  @ApiProperty({
    description: 'Item location',
    type: 'object',
  })
  location: {
    id: string;
    name: string;
    code: string;
    warehouse: string;
  };

  @ApiProperty({
    description: 'Stock status',
    enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'],
    example: 'in_stock',
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Last stock movement',
    type: 'object',
  })
  lastMovement?: {
    type: 'inbound' | 'outbound' | 'adjustment' | 'transfer';
    quantity: number;
    date: string;
    reference: string;
  };

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T15:45:00Z',
  })
  updatedAt: string;

  @ApiPropertyOptional({
    description: 'AI-powered analytics',
    type: 'object',
  })
  analytics?: {
    demandForecast: number;
    turnoverRate: number;
    seasonalityIndex: number;
    recommendedOrderQuantity: number;
    predictedStockout: string;
  };
}

// Analytics DTOs
export class InventoryAnalyticsDto {
  @ApiPropertyOptional({
    description: 'Analysis period',
    enum: ['day', 'week', 'month', 'quarter', 'year'],
    default: 'month',
    example: 'month',
  })
  @IsOptional()
  @IsEnum(['day', 'week', 'month', 'quarter', 'year'])
  period?: string;

  @ApiPropertyOptional({
    description: 'Start date for analysis',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for analysis',
    example: '2024-01-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Categories to include in analysis',
    type: [String],
    example: ['Sensors', 'Actuators'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({
    description: 'Locations to include in analysis',
    type: [String],
    example: ['WH-001', 'WH-002'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locations?: string[];
}

export class AnalyticsResponseDto {
  @ApiProperty({
    description: 'Summary statistics',
    type: 'object',
  })
  summary: {
    totalItems: number;
    totalValue: number;
    totalQuantity: number;
    lowStockItems: number;
    outOfStockItems: number;
    turnoverRate: number;
    fillRate: number;
  };

  @ApiProperty({
    description: 'Trends over time',
    type: 'object',
  })
  trends: {
    period: string;
    data: Array<{
      date: string;
      inbound: number;
      outbound: number;
      adjustments: number;
      value: number;
    }>;
  };

  @ApiProperty({
    description: 'Category breakdown',
    type: [Object],
  })
  categoryBreakdown: Array<{
    category: string;
    itemCount: number;
    totalQuantity: number;
    totalValue: number;
    percentageOfTotal: number;
  }>;

  @ApiProperty({
    description: 'Location performance',
    type: [Object],
  })
  locationPerformance: Array<{
    locationId: string;
    locationName: string;
    itemCount: number;
    utilization: number;
    accuracy: number;
    turnover: number;
  }>;

  @ApiPropertyOptional({
    description: 'AI predictions and insights',
    type: 'object',
  })
  aiInsights?: {
    demandForecast: Array<{
      period: string;
      predictedDemand: number;
      confidence: number;
    }>;
    stockOptimization: Array<{
      itemId: string;
      currentStock: number;
      recommendedStock: number;
      reasoning: string;
    }>;
    anomalies: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      affectedItems: string[];
    }>;
  };
}

// Blockchain DTOs
export class BlockchainTrackingDto {
  @ApiProperty({
    description: 'Item ID to track',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  itemId: string;

  @ApiProperty({
    description: 'Transaction type',
    enum: ['manufacture', 'ship', 'receive', 'transfer', 'consume'],
    example: 'receive',
  })
  @IsEnum(['manufacture', 'ship', 'receive', 'transfer', 'consume'])
  transactionType: string;

  @ApiProperty({
    description: 'Quantity involved in transaction',
    minimum: 1,
    example: 50,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Source location or entity',
    example: 'SUPPLIER-ACME-INDUSTRIAL',
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    description: 'Destination location or entity',
    example: 'WH-001-A-01',
  })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for blockchain record',
    type: 'object',
    example: {
      batchNumber: 'BATCH-2024-001',
      qualityCertificate: 'QC-2024-001',
      temperature: '25°C',
      humidity: '45%',
    },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class BlockchainResponseDto {
  @ApiProperty({
    description: 'Blockchain transaction hash',
    example: '0x1234567890abcdef...',
  })
  transactionHash: string;

  @ApiProperty({
    description: 'Block number',
    example: 12345678,
  })
  blockNumber: number;

  @ApiProperty({
    description: 'Transaction timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Gas used for transaction',
    example: 21000,
  })
  gasUsed: number;

  @ApiProperty({
    description: 'Transaction status',
    enum: ['pending', 'confirmed', 'failed'],
    example: 'confirmed',
  })
  status: string;

  @ApiProperty({
    description: 'Item tracking information',
    type: 'object',
  })
  trackingInfo: {
    itemId: string;
    currentLocation: string;
    totalTransactions: number;
    lastUpdate: string;
  };
}

// Health Check DTOs
export class HealthCheckDto {
  @ApiProperty({
    description: 'Overall system status',
    enum: ['healthy', 'degraded', 'unhealthy'],
    example: 'healthy',
  })
  status: string;

  @ApiProperty({
    description: 'System uptime in seconds',
    example: 86400,
  })
  uptime: number;

  @ApiProperty({
    description: 'Service dependencies status',
    type: 'object',
  })
  dependencies: {
    database: { status: string; responseTime: number };
    cache: { status: string; responseTime: number };
    blockchain: { status: string; responseTime: number };
    storage: { status: string; responseTime: number };
    messaging: { status: string; responseTime: number };
  };

  @ApiProperty({
    description: 'System metrics',
    type: 'object',
  })
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    activeConnections: number;
    requestsPerSecond: number;
  };

  @ApiProperty({
    description: 'Timestamp of health check',
    example: '2024-01-15T10:30:00Z',
  })
  timestamp: string;
}
