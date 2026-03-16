import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
  IsUUID,
  IsIP,
  IsDateString,
  ValidateNested,
  Min,
  Max,
  IsNotEmpty,
  IsJSON,
  Matches,
  IsIn
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Enums
export enum DeviceType {
  SENSOR = 'sensor',
  ACTUATOR = 'actuator',
  GATEWAY = 'gateway',
  CONTROLLER = 'controller',
  DISPLAY = 'display',
  CAMERA = 'camera',
  RFID_READER = 'rfid_reader',
  BARCODE_SCANNER = 'barcode_scanner',
  ENVIRONMENTAL = 'environmental',
  MOTION = 'motion',
  PROXIMITY = 'proximity',
  VIBRATION = 'vibration',
  PRESSURE = 'pressure',
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  LIGHT = 'light',
  SOUND = 'sound',
  FLOW = 'flow',
  LEVEL = 'level',
  FORCE = 'force',
  TORQUE = 'torque',
  POSITION = 'position',
  SPEED = 'speed',
  ACCELERATION = 'acceleration',
  VOLTAGE = 'voltage',
  CURRENT = 'current',
  POWER = 'power',
  ENERGY = 'energy',
  OTHER = 'other'
}

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  WARNING = 'warning',
  MAINTENANCE = 'maintenance',
  CALIBRATING = 'calibrating',
  UNKNOWN = 'unknown'
}

export enum ConnectivityType {
  ETHERNET = 'ethernet',
  WIFI = 'wifi',
  BLUETOOTH = 'bluetooth',
  ZIGBEE = 'zigbee',
  LORA = 'lora',
  NB_IOT = 'nb_iot',
  LTE = 'lte',
  MODBUS_TCP = 'modbus_tcp',
  MODBUS_RTU = 'modbus_rtu',
  PROFINET = 'profinet',
  ETHERCAT = 'ethercat',
  CAN_BUS = 'can_bus',
  HART = 'hart',
  SERIAL = 'serial',
  USB = 'usb',
  OTHER = 'other'
}

export enum DataType {
  BOOLEAN = 'boolean',
  INTEGER = 'integer',
  FLOAT = 'float',
  STRING = 'string',
  JSON = 'json',
  BINARY = 'binary',
  TIMESTAMP = 'timestamp',
  COORDINATE = 'coordinate',
  ARRAY = 'array',
  OBJECT = 'object'
}

export enum AlertSeverity {
  INFO = 'info',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

// Base DTOs
export class DeviceLocationDto {
  @ApiProperty({ description: 'Building or facility name', example: 'Factory A' })
  @IsString()
  @IsNotEmpty()
  building: string;

  @ApiPropertyOptional({ description: 'Floor or level', example: 'Floor 2' })
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiPropertyOptional({ description: 'Zone or area', example: 'Production Line 1' })
  @IsOptional()
  @IsString()
  zone?: string;

  @ApiPropertyOptional({ description: 'GPS coordinates' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;

  @ApiPropertyOptional({ description: 'Additional location description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CoordinatesDto {
  @ApiProperty({ description: 'Latitude', example: 40.7128 })
  @IsNumber({ maxDecimalPlaces: 8 })
  latitude: number;

  @ApiProperty({ description: 'Longitude', example: -74.0060 })
  @IsNumber({ maxDecimalPlaces: 8 })
  longitude: number;

  @ApiPropertyOptional({ description: 'Altitude in meters', example: 10.5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  altitude?: number;
}

export class DeviceSpecsDto {
  @ApiPropertyOptional({ description: 'Operating voltage range', example: '12-24V DC' })
  @IsOptional()
  @IsString()
  voltage?: string;

  @ApiPropertyOptional({ description: 'Power consumption in watts', example: 5.5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  powerConsumption?: number;

  @ApiPropertyOptional({ description: 'Operating temperature range', example: '-20°C to 60°C' })
  @IsOptional()
  @IsString()
  temperatureRange?: string;

  @ApiPropertyOptional({ description: 'Humidity range', example: '10-95% RH' })
  @IsOptional()
  @IsString()
  humidityRange?: string;

  @ApiPropertyOptional({ description: 'IP protection rating', example: 'IP67' })
  @IsOptional()
  @IsString()
  @Matches(/^IP\d{2}$/)
  ipRating?: string;

  @ApiPropertyOptional({ description: 'Measurement range', example: '0-100°C' })
  @IsOptional()
  @IsString()
  measurementRange?: string;

  @ApiPropertyOptional({ description: 'Accuracy specification', example: '±0.1°C' })
  @IsOptional()
  @IsString()
  accuracy?: string;

  @ApiPropertyOptional({ description: 'Resolution', example: '0.01°C' })
  @IsOptional()
  @IsString()
  resolution?: string;

  @ApiPropertyOptional({ description: 'Response time', example: '1s' })
  @IsOptional()
  @IsString()
  responseTime?: string;

  @ApiPropertyOptional({ description: 'Additional specifications' })
  @IsOptional()
  @IsObject()
  additional?: Record<string, any>;
}

export class ConnectivityDto {
  @ApiProperty({ description: 'Connectivity type', enum: ConnectivityType })
  @IsEnum(ConnectivityType)
  type: ConnectivityType;

  @ApiPropertyOptional({ description: 'IP address for network devices' })
  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'Port number' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(65535)
  port?: number;

  @ApiPropertyOptional({ description: 'MAC address' })
  @IsOptional()
  @IsString()
  @Matches(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)
  macAddress?: string;

  @ApiPropertyOptional({ description: 'Network SSID for WiFi devices' })
  @IsOptional()
  @IsString()
  ssid?: string;

  @ApiPropertyOptional({ description: 'Signal strength in dBm' })
  @IsOptional()
  @IsNumber()
  @Max(0)
  signalStrength?: number;

  @ApiPropertyOptional({ description: 'Communication protocol' })
  @IsOptional()
  @IsString()
  protocol?: string;

  @ApiPropertyOptional({ description: 'Baud rate for serial connections' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  baudRate?: number;

  @ApiPropertyOptional({ description: 'Connection parameters' })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;
}

export class SensorDataPointDto {
  @ApiProperty({ description: 'Data point name/identifier', example: 'temperature' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Data type', enum: DataType })
  @IsEnum(DataType)
  dataType: DataType;

  @ApiProperty({ description: 'Current value' })
  value: any;

  @ApiPropertyOptional({ description: 'Unit of measurement', example: '°C' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ description: 'Timestamp of the reading' })
  @IsDateString()
  timestamp: Date;

  @ApiPropertyOptional({ description: 'Quality indicator (0-100)', example: 95 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  quality?: number;

  @ApiPropertyOptional({ description: 'Data source or origin' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class AlertRuleDto {
  @ApiProperty({ description: 'Rule name', example: 'High Temperature Alert' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Alert severity', enum: AlertSeverity })
  @IsEnum(AlertSeverity)
  severity: AlertSeverity;

  @ApiProperty({ description: 'Condition expression', example: 'temperature > 80' })
  @IsString()
  @IsNotEmpty()
  condition: string;

  @ApiPropertyOptional({ description: 'Alert message template' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Notification recipients' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];

  @ApiPropertyOptional({ description: 'Cooldown period in seconds', example: 300 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cooldownSeconds?: number;

  @ApiPropertyOptional({ description: 'Enable/disable rule' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

// Main DTOs
export class CreateIoTDeviceDto {
  @ApiProperty({ description: 'Device name', example: 'Temperature Sensor 001' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Device description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Device type', enum: DeviceType })
  @IsEnum(DeviceType)
  type: DeviceType;

  @ApiPropertyOptional({ description: 'Device manufacturer', example: 'Siemens' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({ description: 'Device model', example: 'SITRANS TF280' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ description: 'Serial number' })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({ description: 'Firmware version' })
  @IsOptional()
  @IsString()
  firmwareVersion?: string;

  @ApiPropertyOptional({ description: 'Hardware version' })
  @IsOptional()
  @IsString()
  hardwareVersion?: string;

  @ApiProperty({ description: 'Device location', type: DeviceLocationDto })
  @ValidateNested()
  @Type(() => DeviceLocationDto)
  location: DeviceLocationDto;

  @ApiPropertyOptional({ description: 'Device specifications', type: DeviceSpecsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceSpecsDto)
  specifications?: DeviceSpecsDto;

  @ApiProperty({ description: 'Connectivity information', type: ConnectivityDto })
  @ValidateNested()
  @Type(() => ConnectivityDto)
  connectivity: ConnectivityDto;

  @ApiPropertyOptional({ description: 'Supported data points' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SensorDataPointDto)
  dataPoints?: SensorDataPointDto[];

  @ApiPropertyOptional({ description: 'Alert rules', type: [AlertRuleDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlertRuleDto)
  alertRules?: AlertRuleDto[];

  @ApiPropertyOptional({ description: 'Polling interval in seconds', example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  pollingInterval?: number;

  @ApiPropertyOptional({ description: 'Data retention days', example: 90 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  dataRetentionDays?: number;

  @ApiPropertyOptional({ description: 'Device tags for categorization' })
  @IsOptional()
  @IsObject()
  tags?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Custom configuration parameters' })
  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Installation date' })
  @IsOptional()
  @IsDateString()
  installationDate?: Date;

  @ApiPropertyOptional({ description: 'Last maintenance date' })
  @IsOptional()
  @IsDateString()
  lastMaintenanceDate?: Date;

  @ApiPropertyOptional({ description: 'Next maintenance date' })
  @IsOptional()
  @IsDateString()
  nextMaintenanceDate?: Date;

  @ApiPropertyOptional({ description: 'Maintenance interval in days', example: 180 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maintenanceInterval?: number;

  @ApiPropertyOptional({ description: 'Device owner/responsible person' })
  @IsOptional()
  @IsString()
  owner?: string;

  @ApiPropertyOptional({ description: 'Enable/disable device' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class UpdateIoTDeviceDto extends PartialType(CreateIoTDeviceDto) {}

export class DeviceStatusUpdateDto {
  @ApiProperty({ description: 'New device status', enum: DeviceStatus })
  @IsEnum(DeviceStatus)
  status: DeviceStatus;

  @ApiPropertyOptional({ description: 'Status change reason' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Additional status information' })
  @IsOptional()
  @IsObject()
  statusInfo?: Record<string, any>;
}

export class SensorDataDto {
  @ApiProperty({ description: 'Device ID' })
  @IsUUID()
  deviceId: string;

  @ApiProperty({ description: 'Data points', type: [SensorDataPointDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SensorDataPointDto)
  dataPoints: SensorDataPointDto[];

  @ApiPropertyOptional({ description: 'Batch timestamp' })
  @IsOptional()
  @IsDateString()
  timestamp?: Date;

  @ApiPropertyOptional({ description: 'Data source identifier' })
  @IsOptional()
  @IsString()
  source?: string;
}

export class DeviceCommandDto {
  @ApiProperty({ description: 'Command name', example: 'set_threshold' })
  @IsString()
  @IsNotEmpty()
  command: string;

  @ApiPropertyOptional({ description: 'Command parameters' })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Command timeout in seconds', example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  timeoutSeconds?: number;

  @ApiPropertyOptional({ description: 'Command priority', example: 'high' })
  @IsOptional()
  @IsIn(['low', 'normal', 'high', 'critical'])
  priority?: string;
}

export class DeviceCalibrationDto {
  @ApiProperty({ description: 'Calibration type', example: 'zero_point' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({ description: 'Reference values for calibration' })
  @IsOptional()
  @IsObject()
  referenceValues?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Calibration parameters' })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Calibration notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class DeviceDiagnosticsDto {
  @ApiProperty({ description: 'Device ID' })
  @IsUUID()
  deviceId: string;

  @ApiPropertyOptional({ description: 'CPU usage percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  cpuUsage?: number;

  @ApiPropertyOptional({ description: 'Memory usage percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  memoryUsage?: number;

  @ApiPropertyOptional({ description: 'Storage usage percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  storageUsage?: number;

  @ApiPropertyOptional({ description: 'Network latency in milliseconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  networkLatency?: number;

  @ApiPropertyOptional({ description: 'Battery level percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  batteryLevel?: number;

  @ApiPropertyOptional({ description: 'Device temperature in Celsius' })
  @IsOptional()
  @IsNumber()
  deviceTemperature?: number;

  @ApiPropertyOptional({ description: 'Uptime in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  uptime?: number;

  @ApiPropertyOptional({ description: 'Error count since last reset' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  errorCount?: number;

  @ApiPropertyOptional({ description: 'Last error message' })
  @IsOptional()
  @IsString()
  lastError?: string;

  @ApiPropertyOptional({ description: 'Diagnostic timestamp' })
  @IsOptional()
  @IsDateString()
  timestamp?: Date;

  @ApiPropertyOptional({ description: 'Additional diagnostic data' })
  @IsOptional()
  @IsObject()
  additionalData?: Record<string, any>;
}

export class AlertDto {
  @ApiProperty({ description: 'Alert ID' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Device ID that triggered the alert' })
  @IsUUID()
  deviceId: string;

  @ApiProperty({ description: 'Alert rule name' })
  @IsString()
  ruleName: string;

  @ApiProperty({ description: 'Alert severity', enum: AlertSeverity })
  @IsEnum(AlertSeverity)
  severity: AlertSeverity;

  @ApiProperty({ description: 'Alert message' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Alert timestamp' })
  @IsDateString()
  timestamp: Date;

  @ApiPropertyOptional({ description: 'Data that triggered the alert' })
  @IsOptional()
  @IsObject()
  triggerData?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Alert status' })
  @IsOptional()
  @IsIn(['active', 'acknowledged', 'resolved'])
  status?: string;

  @ApiPropertyOptional({ description: 'Acknowledged by user' })
  @IsOptional()
  @IsString()
  acknowledgedBy?: string;

  @ApiPropertyOptional({ description: 'Acknowledgment timestamp' })
  @IsOptional()
  @IsDateString()
  acknowledgedAt?: Date;
}

export class DeviceQueryDto {
  @ApiPropertyOptional({ description: 'Filter by device type', enum: DeviceType })
  @IsOptional()
  @IsEnum(DeviceType)
  type?: DeviceType;

  @ApiPropertyOptional({ description: 'Filter by device status', enum: DeviceStatus })
  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;

  @ApiPropertyOptional({ description: 'Filter by manufacturer' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({ description: 'Filter by location building' })
  @IsOptional()
  @IsString()
  building?: string;

  @ApiPropertyOptional({ description: 'Filter by location zone' })
  @IsOptional()
  @IsString()
  zone?: string;

  @ApiPropertyOptional({ description: 'Filter by connectivity type', enum: ConnectivityType })
  @IsOptional()
  @IsEnum(ConnectivityType)
  connectivityType?: ConnectivityType;

  @ApiPropertyOptional({ description: 'Search term for name or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by enabled status' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Filter devices needing maintenance' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  needsMaintenance?: boolean;

  @ApiPropertyOptional({ description: 'Filter by tag key' })
  @IsOptional()
  @IsString()
  tagKey?: string;

  @ApiPropertyOptional({ description: 'Filter by tag value' })
  @IsOptional()
  @IsString()
  tagValue?: string;

  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', example: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort direction', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

export class SensorDataQueryDto {
  @ApiProperty({ description: 'Device ID' })
  @IsUUID()
  deviceId: string;

  @ApiPropertyOptional({ description: 'Data point name filter' })
  @IsOptional()
  @IsString()
  dataPoint?: string;

  @ApiPropertyOptional({ description: 'Start time for data range' })
  @IsOptional()
  @IsDateString()
  startTime?: Date;

  @ApiPropertyOptional({ description: 'End time for data range' })
  @IsOptional()
  @IsDateString()
  endTime?: Date;

  @ApiPropertyOptional({ description: 'Data aggregation interval (e.g., "1h", "15m")' })
  @IsOptional()
  @IsString()
  @Matches(/^\d+[smhd]$/)
  interval?: string;

  @ApiPropertyOptional({ description: 'Aggregation function', enum: ['avg', 'min', 'max', 'sum', 'count'] })
  @IsOptional()
  @IsIn(['avg', 'min', 'max', 'sum', 'count'])
  aggregation?: string;

  @ApiPropertyOptional({ description: 'Limit number of data points', example: 1000 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(10000)
  limit?: number = 1000;
}

// Response DTOs
export class IoTDeviceResponseDto {
  @ApiProperty({ description: 'Device ID' })
  id: string;

  @ApiProperty({ description: 'Device name' })
  name: string;

  @ApiPropertyOptional({ description: 'Device description' })
  description?: string;

  @ApiProperty({ description: 'Device type', enum: DeviceType })
  type: DeviceType;

  @ApiProperty({ description: 'Current status', enum: DeviceStatus })
  status: DeviceStatus;

  @ApiPropertyOptional({ description: 'Manufacturer' })
  manufacturer?: string;

  @ApiPropertyOptional({ description: 'Model' })
  model?: string;

  @ApiProperty({ description: 'Device location', type: DeviceLocationDto })
  location: DeviceLocationDto;

  @ApiProperty({ description: 'Connectivity information', type: ConnectivityDto })
  connectivity: ConnectivityDto;

  @ApiProperty({ description: 'Device enabled status' })
  enabled: boolean;

  @ApiProperty({ description: 'Last seen timestamp' })
  lastSeen: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class IoTDeviceListResponseDto {
  @ApiProperty({ description: 'List of IoT devices', type: [IoTDeviceResponseDto] })
  devices: IoTDeviceResponseDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total pages' })
  totalPages: number;
}

export class SensorDataResponseDto {
  @ApiProperty({ description: 'Device ID' })
  deviceId: string;

  @ApiProperty({ description: 'Data points', type: [SensorDataPointDto] })
  dataPoints: SensorDataPointDto[];

  @ApiProperty({ description: 'Response timestamp' })
  timestamp: Date;
}

export class DeviceStatisticsResponseDto {
  @ApiProperty({ description: 'Total device count' })
  totalDevices: number;

  @ApiProperty({ description: 'Online devices count' })
  onlineDevices: number;

  @ApiProperty({ description: 'Offline devices count' })
  offlineDevices: number;

  @ApiProperty({ description: 'Devices with errors count' })
  errorDevices: number;

  @ApiProperty({ description: 'Devices needing maintenance count' })
  maintenanceDevices: number;

  @ApiProperty({ description: 'Device type distribution' })
  typeDistribution: Record<string, number>;

  @ApiProperty({ description: 'Status distribution' })
  statusDistribution: Record<string, number>;

  @ApiProperty({ description: 'Connectivity distribution' })
  connectivityDistribution: Record<string, number>;
}
