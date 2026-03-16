import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TwinType, TwinStatus } from '../entities/DigitalTwin';

export class DigitalTwinResponseDto {
  @ApiProperty({ description: 'Digital twin unique identifier' })
  id: string;

  @ApiProperty({ description: 'Digital twin code' })
  twinCode: string;

  @ApiProperty({ description: 'Digital twin name' })
  twinName: string;

  @ApiPropertyOptional({ description: 'Digital twin description' })
  description?: string;

  @ApiProperty({ description: 'Digital twin type', enum: TwinType })
  type: TwinType;

  @ApiProperty({ description: 'Digital twin status', enum: TwinStatus })
  status: TwinStatus;

  @ApiPropertyOptional({ description: 'Physical asset information' })
  physicalAsset?: {
    assetId: string;
    assetType: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    specifications: object;
    location: object;
    installation: object;
  };

  @ApiPropertyOptional({ description: 'Digital model configuration' })
  digitalModel?: {
    modelType: string;
    modelFiles: string[];
    geometry: object;
    materials: object[];
    physics: object;
    boundaries: object;
    constraints: object[];
  };

  @ApiPropertyOptional({ description: 'Data sources configuration' })
  dataSources?: {
    sensors: object[];
    systems: string[];
    databases: string[];
    apis: string[];
    files: string[];
    streams: object[];
    frequency: number;
    protocols: string[];
  };

  @ApiPropertyOptional({ description: 'Real-time synchronization settings' })
  realTimeSync?: {
    enabled: boolean;
    interval: number;
    accuracy: number;
    lastSync: Date;
  };

  @ApiPropertyOptional({ description: 'AI integration configuration' })
  aiIntegration?: {
    enabled: boolean;
    models: string[];
    algorithms: string[];
    training: object;
    inference: object;
  };

  @ApiPropertyOptional({ description: 'Performance metrics' })
  performance?: {
    latency: number;
    throughput: number;
    accuracy: number;
    reliability: number;
  };

  @ApiPropertyOptional({ description: 'Accuracy percentage' })
  accuracy?: number;

  @ApiPropertyOptional({ description: 'Simulation parameters' })
  simulationParameters?: object;

  @ApiPropertyOptional({ description: 'Physics models' })
  physicsModels?: object;

  @ApiPropertyOptional({ description: 'Analytics configuration' })
  analytics?: object;

  @ApiPropertyOptional({ description: 'Digital thread information' })
  digitalThread?: object;

  @ApiPropertyOptional({ description: 'Lifecycle information' })
  lifecycle?: object;

  @ApiPropertyOptional({ description: 'Resource management settings' })
  resourceManagement?: object;

  @ApiPropertyOptional({ description: 'Quantum computing enabled flag' })
  quantumComputingEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Blockchain enabled flag' })
  blockchainEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Cybersecurity settings' })
  cybersecuritySettings?: object;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}