import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsObject, IsNumber, IsBoolean, MinLength, MaxLength, Min, Max } from 'class-validator';
import { TwinType, TwinStatus, SimulationMode, FidelityLevel } from '../entities/DigitalTwin';

export class CreateDigitalTwinDto {
  @ApiProperty({
    description: 'Unique code for the digital twin',
    example: 'DT-001',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  twinCode: string;

  @ApiProperty({
    description: 'Name of the digital twin',
    example: 'Production Line Alpha Digital Twin',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  twinName: string;

  @ApiPropertyOptional({
    description: 'Description of the digital twin',
    example: 'Digital twin for production line alpha with real-time simulation capabilities',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Type of digital twin',
    enum: TwinType,
    example: TwinType.PROCESS,
  })
  @IsEnum(TwinType)
  type: TwinType;

  @ApiPropertyOptional({
    description: 'Initial status of the digital twin',
    enum: TwinStatus,
    example: TwinStatus.IDLE,
    default: TwinStatus.IDLE,
  })
  @IsOptional()
  @IsEnum(TwinStatus)
  status?: TwinStatus;

  @ApiProperty({
    description: 'Physical asset information',
    example: {
      assetId: 'PA-001',
      assetName: 'Production Line Alpha',
      assetType: 'manufacturing_line',
      location: 'Building A, Floor 2',
      specifications: {
        capacity: 1000,
        dimensions: { length: 50, width: 10, height: 5 },
        weight: 25000
      }
    },
  })
  @IsObject()
  physicalAsset: object;

  @ApiProperty({
    description: 'Digital model configuration',
    example: {
      modelType: '3D_CAD',
      modelVersion: '1.0.0',
      modelUrl: 'https://models.company.com/production-line-alpha',
      geometryFile: 'production_line_alpha.step',
      behaviorModels: ['thermal', 'mechanical', 'electrical'],
      accuracy: 95.5
    },
  })
  @IsObject()
  digitalModel: object;

  @ApiPropertyOptional({
    description: 'Data sources configuration',
    example: {
      sensors: [
        { id: 'TEMP-001', type: 'temperature', location: 'zone_1' },
        { id: 'PRESS-001', type: 'pressure', location: 'zone_2' },
        { id: 'VIB-001', type: 'vibration', location: 'motor_1' }
      ],
      databases: ['production_db', 'quality_db'],
      apis: ['manufacturing_api', 'maintenance_api'],
      protocols: ['mqtt', 'opcua', 'modbus']
    },
  })
  @IsOptional()
  @IsObject()
  dataSources?: object;

  @ApiPropertyOptional({
    description: 'Real-time synchronization settings',
    example: {
      enabled: true,
      syncInterval: 1000,
      dataPoints: ['temperature', 'pressure', 'speed', 'quality'],
      syncMode: 'bidirectional',
      bufferSize: 10000
    },
  })
  @IsOptional()
  @IsObject()
  realTimeSync?: object;

  @ApiPropertyOptional({
    description: 'AI integration configuration',
    example: {
      enabled: true,
      models: [
        { name: 'predictive_maintenance', type: 'regression', accuracy: 92.5 },
        { name: 'quality_prediction', type: 'classification', accuracy: 89.0 },
        { name: 'optimization', type: 'reinforcement', performance: 85.5 }
      ],
      mlPlatform: 'tensorflow',
      trainingData: 'historical_production_data',
      retrainingSchedule: 'weekly'
    },
  })
  @IsOptional()
  @IsObject()
  aiIntegration?: object;

  @ApiPropertyOptional({
    description: 'Initial performance metrics',
    example: 85.5,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  performance?: number;

  @ApiPropertyOptional({
    description: 'Initial accuracy metrics',
    example: 92.3,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  accuracy?: number;

  @ApiPropertyOptional({
    description: 'Simulation parameters',
    example: {
      simulationMode: 'real_time',
      timeStep: 0.1,
      fidelityLevel: 'high',
      physicsEnabled: true,
      multiPhysics: ['thermal', 'mechanical'],
      solverType: 'finite_element',
      convergenceCriteria: 1e-6
    },
  })
  @IsOptional()
  @IsObject()
  simulationParameters?: object;

  @ApiPropertyOptional({
    description: 'Physics models configuration',
    example: {
      thermodynamics: {
        enabled: true,
        heatTransfer: true,
        fluidFlow: true,
        combustion: false
      },
      mechanics: {
        enabled: true,
        staticAnalysis: true,
        dynamicAnalysis: true,
        contactModeling: true
      },
      electromagnetics: {
        enabled: false,
        staticFields: false,
        dynamicFields: false
      }
    },
  })
  @IsOptional()
  @IsObject()
  physicsModels?: object;

  @ApiPropertyOptional({
    description: 'Analytics configuration',
    example: {
      kpis: ['oee', 'quality', 'throughput', 'energy_efficiency'],
      dashboards: ['operational', 'maintenance', 'quality'],
      reports: ['daily', 'weekly', 'monthly'],
      alerting: true,
      anomalyDetection: true
    },
  })
  @IsOptional()
  @IsObject()
  analytics?: object;

  @ApiPropertyOptional({
    description: 'Digital thread information',
    example: {
      enabled: true,
      lifecycle: 'design_to_disposal',
      traceability: true,
      versionControl: true,
      dataLineage: true,
      integration: ['plm', 'erp', 'mes']
    },
  })
  @IsOptional()
  @IsObject()
  digitalThread?: object;

  @ApiPropertyOptional({
    description: 'Lifecycle management',
    example: {
      stage: 'development',
      version: '1.0.0',
      maturityLevel: 'pilot',
      retirementDate: null,
      updateSchedule: 'monthly'
    },
  })
  @IsOptional()
  @IsObject()
  lifecycle?: object;

  @ApiPropertyOptional({
    description: 'Resource management settings',
    example: {
      computeResources: {
        cpu: '8 cores',
        memory: '32GB',
        storage: '1TB',
        gpu: 'NVIDIA RTX 4080'
      },
      cloudResources: {
        provider: 'aws',
        instanceType: 'c5.2xlarge',
        region: 'us-east-1'
      },
      scaling: {
        autoScaling: true,
        minInstances: 1,
        maxInstances: 5
      }
    },
  })
  @IsOptional()
  @IsObject()
  resourceManagement?: object;

  @ApiPropertyOptional({
    description: 'Enable quantum computing capabilities',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  quantumComputingEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Quantum computing configuration',
    example: {
      provider: 'IBM_Q',
      qubits: 127,
      gateFidelity: 99.9,
      coherenceTime: 100,
      algorithms: ['variational_quantum_eigensolver', 'quantum_approximate_optimization']
    },
  })
  @IsOptional()
  @IsObject()
  quantumComputing?: object;

  @ApiPropertyOptional({
    description: 'Enable blockchain capabilities',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  blockchainEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Blockchain configuration',
    example: {
      network: 'ethereum',
      consensus: 'proof_of_stake',
      smartContracts: true,
      dataIntegrity: true,
      auditTrail: true,
      tokenization: false
    },
  })
  @IsOptional()
  @IsObject()
  blockchain?: object;

  @ApiPropertyOptional({
    description: 'Cybersecurity settings',
    example: {
      encryption: 'AES-256',
      authentication: 'multi_factor',
      authorization: 'role_based',
      networkSecurity: 'zero_trust',
      dataPrivacy: true,
      complianceFramework: 'NIST'
    },
  })
  @IsOptional()
  @IsObject()
  cybersecuritySettings?: object;

  @ApiPropertyOptional({
    description: 'Edge computing configuration',
    example: {
      enabled: true,
      edgeNodes: 5,
      processingCapability: 'high',
      latencyRequirement: 10,
      dataProcessing: 'real_time'
    },
  })
  @IsOptional()
  @IsObject()
  edgeComputing?: object;

  @ApiPropertyOptional({
    description: 'Cloud computing integration',
    example: {
      provider: 'microsoft_azure',
      services: ['azure_iot', 'azure_ml', 'azure_digital_twins'],
      region: 'east_us',
      dataResidency: 'us',
      hybridCloud: true
    },
  })
  @IsOptional()
  @IsObject()
  cloudComputing?: object;

  @ApiPropertyOptional({
    description: 'User who is creating the digital twin',
    example: 'digital_twin_engineer',
  })
  @IsOptional()
  @IsString()
  createdBy?: string;
}
