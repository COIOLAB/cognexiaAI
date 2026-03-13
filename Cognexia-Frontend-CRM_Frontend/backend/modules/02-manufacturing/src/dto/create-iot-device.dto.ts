import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject, IsBoolean, IsNumber, IsArray, ValidateNested, Min, Max, IsDateString, IsIP, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DeviceType {
  SENSOR = 'sensor',
  ACTUATOR = 'actuator',
  GATEWAY = 'gateway',
  CONTROLLER = 'controller',
  EDGE_DEVICE = 'edge_device',
  SMART_METER = 'smart_meter',
  CAMERA = 'camera',
  RFID_READER = 'rfid_reader',
  BARCODE_SCANNER = 'barcode_scanner',
  HMI_PANEL = 'hmi_panel',
  ROBOT = 'robot',
  CONVEYOR = 'conveyor',
  MACHINE_MONITOR = 'machine_monitor',
  ENVIRONMENTAL_MONITOR = 'environmental_monitor',
  SAFETY_DEVICE = 'safety_device'
}

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
  UNKNOWN = 'unknown',
  CALIBRATING = 'calibrating',
  UPDATING = 'updating'
}

export enum ConnectivityType {
  ETHERNET = 'ethernet',
  WIFI = 'wifi',
  BLUETOOTH = 'bluetooth',
  ZIGBEE = 'zigbee',
  LORA = 'lora',
  CELLULAR = 'cellular',
  MODBUS = 'modbus',
  PROFINET = 'profinet',
  ETHERNET_IP = 'ethernet_ip',
  OPCUA = 'opcua',
  MQTT = 'mqtt',
  SERIAL = 'serial'
}

export enum Protocol {
  HTTP = 'http',
  HTTPS = 'https',
  MQTT = 'mqtt',
  COAP = 'coap',
  WEBSOCKET = 'websocket',
  MODBUS_TCP = 'modbus_tcp',
  MODBUS_RTU = 'modbus_rtu',
  OPCUA = 'opcua',
  BACNET = 'bacnet',
  SNMP = 'snmp',
  CUSTOM = 'custom'
}

class SensorSpecification {
  @ApiProperty({ description: 'Sensor type' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Measurement range' })
  @IsObject()
  range: { min: number; max: number; unit: string };

  @ApiProperty({ description: 'Accuracy percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  accuracy: number;

  @ApiProperty({ description: 'Resolution' })
  @IsNumber()
  @Min(0)
  resolution: number;

  @ApiPropertyOptional({ description: 'Response time in milliseconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  responseTime?: number;

  @ApiPropertyOptional({ description: 'Sampling rate in Hz' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  samplingRate?: number;

  @ApiPropertyOptional({ description: 'Operating temperature range' })
  @IsOptional()
  @IsObject()
  temperatureRange?: { min: number; max: number };

  @ApiPropertyOptional({ description: 'Calibration interval in days' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  calibrationInterval?: number;
}

class NetworkConfiguration {
  @ApiPropertyOptional({ description: 'IP address' })
  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'Subnet mask' })
  @IsOptional()
  @IsIP()
  subnetMask?: string;

  @ApiPropertyOptional({ description: 'Gateway IP' })
  @IsOptional()
  @IsIP()
  gateway?: string;

  @ApiPropertyOptional({ description: 'DNS server' })
  @IsOptional()
  @IsIP()
  dnsServer?: string;

  @ApiPropertyOptional({ description: 'MAC address' })
  @IsOptional()
  @IsString()
  macAddress?: string;

  @ApiPropertyOptional({ description: 'Network port' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(65535)
  port?: number;

  @ApiPropertyOptional({ description: 'DHCP enabled' })
  @IsOptional()
  @IsBoolean()
  dhcpEnabled?: boolean;

  @ApiPropertyOptional({ description: 'SSL/TLS enabled' })
  @IsOptional()
  @IsBoolean()
  sslEnabled?: boolean;
}

class SecurityConfiguration {
  @ApiPropertyOptional({ description: 'Authentication required' })
  @IsOptional()
  @IsBoolean()
  authenticationRequired?: boolean;

  @ApiPropertyOptional({ description: 'Encryption enabled' })
  @IsOptional()
  @IsBoolean()
  encryptionEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Encryption method' })
  @IsOptional()
  @IsString()
  encryptionMethod?: string;

  @ApiPropertyOptional({ description: 'Certificate thumbprint' })
  @IsOptional()
  @IsString()
  certificateThumbprint?: string;

  @ApiPropertyOptional({ description: 'API key' })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({ description: 'Security level (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  securityLevel?: number;
}

class PowerConfiguration {
  @ApiPropertyOptional({ description: 'Power source type' })
  @IsOptional()
  @IsString()
  powerSource?: string;

  @ApiPropertyOptional({ description: 'Power consumption in watts' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  powerConsumption?: number;

  @ApiPropertyOptional({ description: 'Battery capacity in mAh' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  batteryCapacity?: number;

  @ApiPropertyOptional({ description: 'Battery voltage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  batteryVoltage?: number;

  @ApiPropertyOptional({ description: 'Low battery threshold percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  lowBatteryThreshold?: number;

  @ApiPropertyOptional({ description: 'Power saving mode enabled' })
  @IsOptional()
  @IsBoolean()
  powerSavingEnabled?: boolean;
}

export class CreateIoTDeviceDto {
  @ApiProperty({ description: 'Device identifier (unique)' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ description: 'Device name' })
  @IsString()
  @IsNotEmpty()
  deviceName: string;

  @ApiProperty({ 
    description: 'Device type',
    enum: DeviceType
  })
  @IsEnum(DeviceType)
  deviceType: DeviceType;

  @ApiPropertyOptional({ description: 'Device description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Manufacturer name' })
  @IsString()
  @IsNotEmpty()
  manufacturer: string;

  @ApiProperty({ description: 'Device model' })
  @IsString()
  @IsNotEmpty()
  model: string;

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

  @ApiProperty({ 
    description: 'Device status',
    enum: DeviceStatus
  })
  @IsEnum(DeviceStatus)
  status: DeviceStatus;

  @ApiPropertyOptional({ description: 'Device location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Installation date' })
  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @ApiPropertyOptional({ description: 'Associated work center ID' })
  @IsOptional()
  @IsString()
  workCenterId?: string;

  @ApiPropertyOptional({ description: 'Associated production line ID' })
  @IsOptional()
  @IsString()
  productionLineId?: string;

  @ApiPropertyOptional({ description: 'Associated equipment ID' })
  @IsOptional()
  @IsString()
  equipmentId?: string;

  @ApiProperty({ 
    description: 'Connectivity type',
    enum: ConnectivityType
  })
  @IsEnum(ConnectivityType)
  connectivityType: ConnectivityType;

  @ApiProperty({ 
    description: 'Communication protocol',
    enum: Protocol
  })
  @IsEnum(Protocol)
  protocol: Protocol;

  @ApiPropertyOptional({ description: 'Network configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => NetworkConfiguration)
  networkConfig?: NetworkConfiguration;

  @ApiPropertyOptional({ description: 'Security configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => SecurityConfiguration)
  securityConfig?: SecurityConfiguration;

  @ApiPropertyOptional({ description: 'Power configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PowerConfiguration)
  powerConfig?: PowerConfiguration;

  @ApiPropertyOptional({ 
    description: 'Sensor specifications',
    type: [SensorSpecification]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SensorSpecification)
  sensorSpecs?: SensorSpecification[];

  @ApiPropertyOptional({ description: 'Data collection frequency in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  dataCollectionFrequency?: number;

  @ApiPropertyOptional({ description: 'Data transmission frequency in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  dataTransmissionFrequency?: number;

  @ApiPropertyOptional({ description: 'Data retention period in days' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  dataRetentionDays?: number;

  @ApiPropertyOptional({ description: 'Alert thresholds' })
  @IsOptional()
  @IsObject()
  alertThresholds?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Maintenance schedule' })
  @IsOptional()
  @IsObject()
  maintenanceSchedule?: {
    nextMaintenance?: string;
    maintenanceInterval?: number;
    lastMaintenance?: string;
  };

  @ApiPropertyOptional({ description: 'Device tags for categorization' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Device groups' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deviceGroups?: string[];

  @ApiPropertyOptional({ description: 'Edge computing capabilities' })
  @IsOptional()
  @IsBoolean()
  edgeCapabilities?: boolean;

  @ApiPropertyOptional({ description: 'AI/ML processing capabilities' })
  @IsOptional()
  @IsBoolean()
  aiCapabilities?: boolean;

  @ApiPropertyOptional({ description: 'Real-time processing enabled' })
  @IsOptional()
  @IsBoolean()
  realTimeProcessing?: boolean;

  @ApiPropertyOptional({ description: 'Quality of Service level' })
  @IsOptional()
  @IsString()
  qosLevel?: string;

  @ApiPropertyOptional({ description: 'Device documentation URL' })
  @IsOptional()
  @IsUrl()
  documentationUrl?: string;

  @ApiPropertyOptional({ description: 'Support contact' })
  @IsOptional()
  @IsString()
  supportContact?: string;

  @ApiPropertyOptional({ description: 'Warranty expiration date' })
  @IsOptional()
  @IsDateString()
  warrantyExpiration?: string;

  @ApiPropertyOptional({ description: 'Device cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deviceCost?: number;

  @ApiPropertyOptional({ description: 'Annual maintenance cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  annualMaintenanceCost?: number;

  @ApiPropertyOptional({ description: 'Is device critical for operations' })
  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;

  @ApiPropertyOptional({ description: 'Device redundancy' })
  @IsOptional()
  @IsString()
  redundancy?: string;

  @ApiPropertyOptional({ description: 'Backup device IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  backupDevices?: string[];

  @ApiPropertyOptional({ description: 'Device metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
