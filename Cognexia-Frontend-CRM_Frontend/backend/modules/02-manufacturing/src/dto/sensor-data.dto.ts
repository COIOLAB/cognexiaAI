import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject, IsNumber, IsBoolean, IsDateString, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SensorDataType {
  TEMPERATURE = 'temperature',
  PRESSURE = 'pressure',
  HUMIDITY = 'humidity',
  VIBRATION = 'vibration',
  FLOW_RATE = 'flow_rate',
  LEVEL = 'level',
  PH = 'ph',
  CONDUCTIVITY = 'conductivity',
  SPEED = 'speed',
  TORQUE = 'torque',
  POWER = 'power',
  VOLTAGE = 'voltage',
  CURRENT = 'current',
  FREQUENCY = 'frequency',
  POSITION = 'position',
  FORCE = 'force',
  WEIGHT = 'weight',
  CONCENTRATION = 'concentration',
  DENSITY = 'density',
  VISCOSITY = 'viscosity',
  NOISE = 'noise',
  LIGHT = 'light',
  GAS_DETECTION = 'gas_detection',
  MOTION = 'motion',
  PROXIMITY = 'proximity',
  COUNT = 'count',
  QUALITY_MEASUREMENT = 'quality_measurement',
  ENERGY_CONSUMPTION = 'energy_consumption',
  CO2_EMISSIONS = 'co2_emissions',
  CUSTOM = 'custom'
}

export enum DataQuality {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  INVALID = 'invalid'
}

export enum AlertLevel {
  NONE = 'none',
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

class SensorReading {
  @ApiProperty({ description: 'Sensor reading value' })
  @IsNumber()
  value: number;

  @ApiProperty({ description: 'Unit of measurement' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ description: 'Timestamp of the reading' })
  @IsDateString()
  timestamp: string;

  @ApiPropertyOptional({ description: 'Reading quality indicator' })
  @IsOptional()
  @IsEnum(DataQuality)
  quality?: DataQuality;

  @ApiPropertyOptional({ description: 'Alert level based on thresholds' })
  @IsOptional()
  @IsEnum(AlertLevel)
  alertLevel?: AlertLevel;

  @ApiPropertyOptional({ description: 'Raw sensor value before processing' })
  @IsOptional()
  @IsNumber()
  rawValue?: number;

  @ApiPropertyOptional({ description: 'Calibrated value after correction' })
  @IsOptional()
  @IsNumber()
  calibratedValue?: number;

  @ApiPropertyOptional({ description: 'Statistical confidence level' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  confidence?: number;

  @ApiPropertyOptional({ description: 'Margin of error' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  marginOfError?: number;
}

class ProcessParameters {
  @ApiPropertyOptional({ description: 'Process temperature' })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional({ description: 'Process pressure' })
  @IsOptional()
  @IsNumber()
  pressure?: number;

  @ApiPropertyOptional({ description: 'Process flow rate' })
  @IsOptional()
  @IsNumber()
  flowRate?: number;

  @ApiPropertyOptional({ description: 'Process speed or RPM' })
  @IsOptional()
  @IsNumber()
  speed?: number;

  @ApiPropertyOptional({ description: 'Process setpoint values' })
  @IsOptional()
  @IsObject()
  setpoints?: Record<string, number>;

  @ApiPropertyOptional({ description: 'Control loop status' })
  @IsOptional()
  @IsBoolean()
  controlActive?: boolean;

  @ApiPropertyOptional({ description: 'Process phase or stage' })
  @IsOptional()
  @IsString()
  processPhase?: string;
}

class QualityMetrics {
  @ApiPropertyOptional({ description: 'Product quality score' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore?: number;

  @ApiPropertyOptional({ description: 'Defect rate percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defectRate?: number;

  @ApiPropertyOptional({ description: 'First pass yield percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  firstPassYield?: number;

  @ApiPropertyOptional({ description: 'Overall equipment effectiveness' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  oee?: number;

  @ApiPropertyOptional({ description: 'Quality measurements' })
  @IsOptional()
  @IsObject()
  measurements?: Record<string, number>;
}

export class SensorDataDto {
  @ApiProperty({ description: 'IoT device or sensor identifier' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ description: 'Sensor identifier within the device' })
  @IsString()
  @IsNotEmpty()
  sensorId: string;

  @ApiProperty({ description: 'Human-readable sensor name' })
  @IsString()
  @IsNotEmpty()
  sensorName: string;

  @ApiProperty({ 
    description: 'Type of sensor data',
    enum: SensorDataType
  })
  @IsEnum(SensorDataType)
  dataType: SensorDataType;

  @ApiProperty({ 
    description: 'Sensor readings',
    type: [SensorReading]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SensorReading)
  readings: SensorReading[];

  @ApiPropertyOptional({ description: 'Location or zone where sensor is installed' })
  @IsOptional()
  @IsString()
  location?: string;

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

  @ApiPropertyOptional({ description: 'Associated production order ID' })
  @IsOptional()
  @IsString()
  productionOrderId?: string;

  @ApiPropertyOptional({ description: 'Production batch or lot number' })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiPropertyOptional({ description: 'Process parameters' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProcessParameters)
  processParameters?: ProcessParameters;

  @ApiPropertyOptional({ description: 'Quality metrics' })
  @IsOptional()
  @ValidateNested()
  @Type(() => QualityMetrics)
  qualityMetrics?: QualityMetrics;

  @ApiPropertyOptional({ description: 'Alarm thresholds' })
  @IsOptional()
  @IsObject()
  thresholds?: {
    min?: number;
    max?: number;
    warningMin?: number;
    warningMax?: number;
    criticalMin?: number;
    criticalMax?: number;
  };

  @ApiPropertyOptional({ description: 'Data collection frequency in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  samplingRate?: number;

  @ApiPropertyOptional({ description: 'Data transmission frequency in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  transmissionInterval?: number;

  @ApiPropertyOptional({ description: 'Sensor calibration date' })
  @IsOptional()
  @IsDateString()
  lastCalibration?: string;

  @ApiPropertyOptional({ description: 'Next calibration due date' })
  @IsOptional()
  @IsDateString()
  nextCalibration?: string;

  @ApiPropertyOptional({ description: 'Sensor status' })
  @IsOptional()
  @IsString()
  sensorStatus?: string;

  @ApiPropertyOptional({ description: 'Communication status' })
  @IsOptional()
  @IsString()
  communicationStatus?: string;

  @ApiPropertyOptional({ description: 'Power level or battery status' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  powerLevel?: number;

  @ApiPropertyOptional({ description: 'Signal strength indicator' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  signalStrength?: number;

  @ApiPropertyOptional({ description: 'Environmental conditions' })
  @IsOptional()
  @IsObject()
  environmentalConditions?: {
    ambientTemperature?: number;
    humidity?: number;
    atmosphericPressure?: number;
    vibrationLevel?: number;
  };

  @ApiPropertyOptional({ description: 'Data processing algorithms applied' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  processingAlgorithms?: string[];

  @ApiPropertyOptional({ description: 'AI/ML model predictions' })
  @IsOptional()
  @IsObject()
  predictions?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Anomaly detection results' })
  @IsOptional()
  @IsObject()
  anomalies?: {
    detected: boolean;
    confidence: number;
    type: string;
    description?: string;
  };

  @ApiPropertyOptional({ description: 'Data tags for categorization' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Additional sensor metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
