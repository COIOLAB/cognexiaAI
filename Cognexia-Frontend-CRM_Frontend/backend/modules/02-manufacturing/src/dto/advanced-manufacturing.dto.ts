import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, IsEnum, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// Enums for validation
export enum OptimizationType {
  SCHEDULING = 'scheduling',
  RESOURCE_ALLOCATION = 'resource_allocation',
  PROCESS_OPTIMIZATION = 'process_optimization',
  ENERGY_OPTIMIZATION = 'energy_optimization'
}

export enum BlockchainNetwork {
  ETHEREUM = 'ethereum',
  POLYGON = 'polygon',
  BINANCE_SMART_CHAIN = 'binance_smart_chain',
  HYPERLEDGER_FABRIC = 'hyperledger_fabric'
}

export enum InspectionType {
  DEFECT_DETECTION = 'defect_detection',
  DIMENSIONAL_ANALYSIS = 'dimensional_analysis',
  SURFACE_QUALITY = 'surface_quality',
  COLOR_MATCHING = 'color_matching',
  ASSEMBLY_VERIFICATION = 'assembly_verification'
}

export enum DeviceType {
  VR_HEADSET = 'vr_headset',
  AR_GLASSES = 'ar_glasses',
  MOBILE_DEVICE = 'mobile_device',
  TABLET = 'tablet',
  HOLOGRAPHIC_DISPLAY = 'holographic_display'
}

export enum PredictionType {
  EQUIPMENT_FAILURE = 'equipment_failure',
  DEMAND_FORECAST = 'demand_forecast',
  QUALITY_PREDICTION = 'quality_prediction',
  SUPPLY_CHAIN_DISRUPTION = 'supply_chain_disruption',
  MARKET_TREND = 'market_trend',
  ENERGY_OPTIMIZATION = 'energy_optimization'
}

// Base classes for complex nested objects
class BaseManufacturingContext {
  @ApiProperty({ example: 'facility_001' })
  @IsString()
  facilityId: string;

  @ApiProperty({ example: ['line_1', 'line_2'] })
  @IsArray()
  @IsString({ each: true })
  productionLines: string[];

  @ApiProperty({ example: ['system_a', 'system_b'] })
  @IsArray()
  @IsString({ each: true })
  equipmentSystems: string[];
}

class DataInput {
  @ApiProperty({ example: 'sensor_stream' })
  @IsString()
  dataType: string;

  @ApiProperty({ example: 'temperature_sensor_001' })
  @IsString()
  source: string;

  @ApiProperty({ example: 'json' })
  @IsString()
  format: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  samplingRate: number;
}

// 1. Quantum Optimization Request DTO
export class QuantumOptimizationRequestDto {
  @ApiProperty({
    description: 'Type of quantum optimization to perform',
    enum: OptimizationType,
    example: OptimizationType.SCHEDULING
  })
  @IsEnum(OptimizationType)
  optimizationType: OptimizationType;

  @ApiProperty({
    description: 'Manufacturing context for optimization',
    type: BaseManufacturingContext
  })
  @ValidateNested()
  @Type(() => BaseManufacturingContext)
  manufacturingContext: BaseManufacturingContext;

  @ApiProperty({
    description: 'Optimization parameters',
    example: { maxIterations: 1000, convergenceThreshold: 0.01 }
  })
  @IsOptional()
  optimizationParameters?: any;

  @ApiProperty({
    description: 'Use quantum annealing for optimization',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  useQuantumAnnealing?: boolean = true;

  @ApiProperty({
    description: 'Priority level for optimization',
    minimum: 1,
    maximum: 10,
    example: 8
  })
  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  priority?: number = 5;
}

// 2. Blockchain Traceability Request DTO
export class BlockchainTraceabilityRequestDto {
  @ApiProperty({
    description: 'Product ID to create traceability for',
    example: 'PROD-12345'
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Blockchain network to use',
    enum: BlockchainNetwork,
    example: BlockchainNetwork.ETHEREUM
  })
  @IsEnum(BlockchainNetwork)
  blockchainNetwork: BlockchainNetwork;

  @ApiProperty({
    description: 'Supply chain stages to track',
    example: ['raw_material', 'manufacturing', 'quality_control', 'packaging', 'shipping']
  })
  @IsArray()
  @IsString({ each: true })
  supplyChainStages: string[];

  @ApiProperty({
    description: 'Smart contract parameters',
    example: { autoExecuteQualityChecks: true, complianceValidation: true }
  })
  @IsOptional()
  smartContractParameters?: any;

  @ApiProperty({
    description: 'Enable IPFS storage for large data',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  enableIPFSStorage?: boolean = true;
}

// 3. Vision Quality Control Request DTO
export class VisionQualityControlRequestDto {
  @ApiProperty({
    description: 'Type of vision inspection',
    enum: InspectionType,
    example: InspectionType.DEFECT_DETECTION
  })
  @IsEnum(InspectionType)
  inspectionType: InspectionType;

  @ApiProperty({
    description: 'Product ID being inspected',
    example: 'PROD-67890'
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Image data sources',
    type: [DataInput]
  })
  @ValidateNested({ each: true })
  @Type(() => DataInput)
  @IsArray()
  imageData: DataInput[];

  @ApiProperty({
    description: 'Quality thresholds',
    example: { defectTolerance: 0.02, dimensionalAccuracy: 0.001 }
  })
  @IsOptional()
  qualityThresholds?: any;

  @ApiProperty({
    description: 'Enable real-time processing',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  realTimeProcessing?: boolean = true;

  @ApiProperty({
    description: 'AI model confidence threshold',
    minimum: 0.5,
    maximum: 1.0,
    example: 0.95
  })
  @IsNumber()
  @Min(0.5)
  @Max(1.0)
  @IsOptional()
  confidenceThreshold?: number = 0.95;
}

// 4. Autonomous Orchestration Request DTO
export class AutonomousOrchestrationRequestDto {
  @ApiProperty({
    description: 'Manufacturing context',
    type: BaseManufacturingContext
  })
  @ValidateNested()
  @Type(() => BaseManufacturingContext)
  manufacturingContext: BaseManufacturingContext;

  @ApiProperty({
    description: 'Orchestration objectives',
    example: ['maximize_throughput', 'minimize_waste', 'optimize_energy']
  })
  @IsArray()
  @IsString({ each: true })
  orchestrationObjectives: string[];

  @ApiProperty({
    description: 'Enable self-healing capabilities',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  enableSelfHealing?: boolean = true;

  @ApiProperty({
    description: 'Autonomous decision-making level',
    minimum: 1,
    maximum: 5,
    example: 4
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  autonomyLevel?: number = 3;

  @ApiProperty({
    description: 'Resource allocation constraints',
    example: { maxCpuUsage: 0.8, maxMemoryUsage: 0.9 }
  })
  @IsOptional()
  resourceConstraints?: any;
}

// 5. Sustainability Tracking Request DTO
export class SustainabilityTrackingRequestDto {
  @ApiProperty({
    description: 'Manufacturing context',
    type: BaseManufacturingContext
  })
  @ValidateNested()
  @Type(() => BaseManufacturingContext)
  manufacturingContext: BaseManufacturingContext;

  @ApiProperty({
    description: 'Sustainability metrics to track',
    example: ['carbon_footprint', 'energy_consumption', 'waste_generation', 'water_usage']
  })
  @IsArray()
  @IsString({ each: true })
  sustainabilityMetrics: string[];

  @ApiProperty({
    description: 'Reporting period',
    example: 'monthly'
  })
  @IsString()
  @IsOptional()
  reportingPeriod?: string = 'monthly';

  @ApiProperty({
    description: 'Enable circular economy analysis',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  enableCircularEconomyAnalysis?: boolean = true;

  @ApiProperty({
    description: 'ESG compliance frameworks',
    example: ['GRI', 'SASB', 'TCFD']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  esgFrameworks?: string[] = [];
}

// 6. Collaborative Intelligence Request DTO
export class CollaborativeIntelligenceRequestDto {
  @ApiProperty({
    description: 'Session ID for conversation continuity',
    example: 'session_12345'
  })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiProperty({
    description: 'User ID making the request',
    example: 'user_67890'
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'User role for context',
    example: 'operator'
  })
  @IsString()
  userRole: string;

  @ApiProperty({
    description: 'Natural language query',
    example: 'What is the current efficiency of production line 3?'
  })
  @IsString()
  query: string;

  @ApiProperty({
    description: 'Query language',
    example: 'en'
  })
  @IsString()
  @IsOptional()
  language?: string = 'en';

  @ApiProperty({
    description: 'Manufacturing context',
    type: BaseManufacturingContext
  })
  @ValidateNested()
  @Type(() => BaseManufacturingContext)
  context: BaseManufacturingContext;

  @ApiProperty({
    description: 'Enable multi-modal interaction',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  enableMultiModal?: boolean = false;
}

// 7. Edge Computing Request DTO
export class EdgeComputingRequestDto {
  @ApiProperty({
    description: 'Edge node ID for processing',
    example: 'edge_node_001'
  })
  @IsString()
  @IsOptional()
  edgeNodeId?: string;

  @ApiProperty({
    description: 'Type of edge computation',
    example: 'real_time_inference'
  })
  @IsString()
  computationType: string;

  @ApiProperty({
    description: 'Priority level',
    example: 'high'
  })
  @IsString()
  @IsOptional()
  priority?: string = 'medium';

  @ApiProperty({
    description: 'Data inputs for edge processing',
    type: [DataInput]
  })
  @ValidateNested({ each: true })
  @Type(() => DataInput)
  @IsArray()
  dataInputs: DataInput[];

  @ApiProperty({
    description: 'Latency requirements in milliseconds',
    minimum: 1,
    maximum: 1000,
    example: 50
  })
  @IsNumber()
  @Min(1)
  @Max(1000)
  @IsOptional()
  latencyRequirement?: number = 100;

  @ApiProperty({
    description: 'Manufacturing context',
    type: BaseManufacturingContext
  })
  @ValidateNested()
  @Type(() => BaseManufacturingContext)
  manufacturingContext: BaseManufacturingContext;
}

// 8. Zero Trust Security Request DTO
export class ZeroTrustSecurityRequestDto {
  @ApiProperty({
    description: 'Device ID requesting access',
    example: 'device_12345'
  })
  @IsString()
  deviceId: string;

  @ApiProperty({
    description: 'User ID requesting access',
    example: 'user_67890'
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Type of access requested',
    example: 'device_access'
  })
  @IsString()
  accessType: string;

  @ApiProperty({
    description: 'Requested resources',
    example: ['production_line_1', 'quality_control_system']
  })
  @IsArray()
  @IsString({ each: true })
  requestedResources: string[];

  @ApiProperty({
    description: 'Authentication data',
    example: { biometric: true, mfa: true, certificate: 'valid' }
  })
  authenticationData: any;

  @ApiProperty({
    description: 'Security context',
    example: { location: 'facility_001', time: 'business_hours', risk_level: 'low' }
  })
  securityContext: any;

  @ApiProperty({
    description: 'Enable continuous monitoring',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  enableContinuousMonitoring?: boolean = true;
}

// 9. Metaverse Experience Request DTO
export class MetaverseExperienceRequestDto {
  @ApiProperty({
    description: 'User ID creating the experience',
    example: 'user_12345'
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Type of metaverse experience',
    example: 'virtual_factory_tour'
  })
  @IsString()
  experienceType: string;

  @ApiProperty({
    description: 'Device type for the experience',
    enum: DeviceType,
    example: DeviceType.VR_HEADSET
  })
  @IsEnum(DeviceType)
  deviceType: DeviceType;

  @ApiProperty({
    description: 'Immersion level',
    example: 'full_vr'
  })
  @IsString()
  immersionLevel: string;

  @ApiProperty({
    description: 'Manufacturing context',
    type: BaseManufacturingContext
  })
  @ValidateNested()
  @Type(() => BaseManufacturingContext)
  manufacturingContext: BaseManufacturingContext;

  @ApiProperty({
    description: 'Number of participants',
    minimum: 1,
    maximum: 50,
    example: 5
  })
  @IsNumber()
  @Min(1)
  @Max(50)
  @IsOptional()
  participantCount?: number = 1;

  @ApiProperty({
    description: 'Enable haptic feedback',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  enableHapticFeedback?: boolean = false;
}

// 10. Predictive Analytics Request DTO
export class PredictiveAnalyticsRequestDto {
  @ApiProperty({
    description: 'Type of prediction to perform',
    enum: PredictionType,
    example: PredictionType.EQUIPMENT_FAILURE
  })
  @IsEnum(PredictionType)
  predictionType: PredictionType;

  @ApiProperty({
    description: 'Prediction time horizon',
    example: '7d'
  })
  @IsString()
  predictionHorizon: string;

  @ApiProperty({
    description: 'Confidence threshold for predictions',
    minimum: 0.8,
    maximum: 1.0,
    example: 0.95
  })
  @IsNumber()
  @Min(0.8)
  @Max(1.0)
  confidenceThreshold: number;

  @ApiProperty({
    description: 'Manufacturing context',
    type: BaseManufacturingContext
  })
  @ValidateNested()
  @Type(() => BaseManufacturingContext)
  manufacturingContext: BaseManufacturingContext;

  @ApiProperty({
    description: 'Data inputs for prediction',
    type: [DataInput]
  })
  @ValidateNested({ each: true })
  @Type(() => DataInput)
  @IsArray()
  dataInputs: DataInput[];

  @ApiProperty({
    description: 'Enable business impact analysis',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  enableBusinessImpactAnalysis?: boolean = true;

  @ApiProperty({
    description: 'Enable real-time processing',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  realTimeProcessing?: boolean = false;
}

// 11. Digital Prophet Request DTO
export class DigitalProphetRequestDto {
  @ApiProperty({
    description: 'Type of prophetic analysis',
    example: 'omniscient_forecasting'
  })
  @IsString()
  prophetType: string;

  @ApiProperty({
    description: 'Timeline scope for prophecy',
    example: 'long_term'
  })
  @IsString()
  timelineScope: string;

  @ApiProperty({
    description: 'Target prediction accuracy',
    minimum: 0.99,
    maximum: 1.0,
    example: 0.999
  })
  @IsNumber()
  @Min(0.99)
  @Max(1.0)
  predictionAccuracyTarget: number;

  @ApiProperty({
    description: 'Enable multiverse analysis',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  multiverseAnalysis?: boolean = false;

  @ApiProperty({
    description: 'Enable causal chain analysis',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  causalChainAnalysis?: boolean = false;

  @ApiProperty({
    description: 'Enable emergent pattern detection',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  emergentPatternDetection?: boolean = false;

  @ApiProperty({
    description: 'Enable black swan event prediction',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  blackSwanEventPrediction?: boolean = false;

  @ApiProperty({
    description: 'Manufacturing universe model parameters',
    example: { complexity: 'high', scope: 'global', depth: 'quantum' }
  })
  manufacturingUniverseModel: any;
}

// Response DTOs for documentation
export class BaseResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  data: any;

  @ApiProperty({ example: '2024-01-20T12:30:00Z' })
  @IsOptional()
  timestamp?: Date;
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Operation failed due to invalid input' })
  message: string;

  @ApiProperty({ example: 'VALIDATION_ERROR' })
  @IsOptional()
  errorCode?: string;

  @ApiProperty({ example: '2024-01-20T12:30:00Z' })
  timestamp: Date;
}
