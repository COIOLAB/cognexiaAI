import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DigitalTwinSimulation } from './digital-twin-simulation.entity';

export enum TwinType {
  EQUIPMENT = 'equipment',
  PROCESS = 'process',
  FACILITY = 'facility',
  PRODUCT = 'product',
  SUPPLY_CHAIN = 'supply_chain',
  PRODUCTION_LINE = 'production_line',
  QUALITY_SYSTEM = 'quality_system',
  ENERGY_SYSTEM = 'energy_system',
  SAFETY_SYSTEM = 'safety_system',
  COMPOSITE = 'composite',
}

export enum TwinStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SYNCHRONIZING = 'synchronizing',
  SIMULATING = 'simulating',
  ERROR = 'error',
  MAINTENANCE = 'maintenance',
}

export enum SynchronizationMode {
  REAL_TIME = 'real_time',
  BATCH = 'batch',
  ON_DEMAND = 'on_demand',
  SCHEDULED = 'scheduled',
  EVENT_DRIVEN = 'event_driven',
}

export enum IndustryType {
  AUTOMOTIVE = 'automotive',
  AEROSPACE = 'aerospace',
  PHARMACEUTICALS = 'pharmaceuticals',
  CHEMICALS = 'chemicals',
  STEEL = 'steel',
  OIL_GAS = 'oil_gas',
  FOOD_BEVERAGE = 'food_beverage',
  ELECTRONICS = 'electronics',
  TEXTILE = 'textile',
  DEFENSE = 'defense',
  ENERGY = 'energy',
  MINING = 'mining',
}

@Entity('digital_twins')
@Index(['twinId'], { unique: true })
@Index(['twinType'])
@Index(['status'])
@Index(['industryType'])
@Index(['physicalAssetId'])
export class DigitalTwin {
  @ApiProperty({ description: 'Digital Twin UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Unique twin identifier' })
  @Column({ unique: true, length: 100 })
  twinId: string;

  @ApiProperty({ description: 'Digital twin name' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Twin description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Type of digital twin', enum: TwinType })
  @Column({ type: 'enum', enum: TwinType })
  twinType: TwinType;

  @ApiProperty({ description: 'Current status', enum: TwinStatus })
  @Column({ type: 'enum', enum: TwinStatus, default: TwinStatus.INACTIVE })
  status: TwinStatus;

  @ApiProperty({ description: 'Industry type', enum: IndustryType })
  @Column({ type: 'enum', enum: IndustryType })
  industryType: IndustryType;

  @ApiProperty({ description: 'Physical asset identifier' })
  @Column({ length: 255 })
  physicalAssetId: string;

  @ApiProperty({ description: 'Physical asset location' })
  @Column({ type: 'jsonb' })
  physicalLocation: {
    facility: string;
    building?: string;
    floor?: string;
    zone?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
      elevation?: number;
    };
    address?: {
      street: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    };
  };

  // Twin Configuration
  @ApiProperty({ description: 'Digital twin configuration', type: 'object' })
  @Column({ type: 'jsonb' })
  configuration: {
    syncMode: SynchronizationMode;
    updateFrequency: number; // in seconds
    dataRetentionPeriod: number; // in days
    simulationEnabled: boolean;
    aiAnalyticsEnabled: boolean;
    predictiveMaintenance: boolean;
    qualityMonitoring: boolean;
    energyOptimization: boolean;
    safetyMonitoring: boolean;
    complianceTracking: boolean;
    quantumOptimization?: boolean;
  };

  // Physical Asset Specifications
  @ApiProperty({ description: 'Physical asset specifications', type: 'object' })
  @Column({ type: 'jsonb' })
  physicalSpecs: {
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    yearManufactured?: number;
    capacity?: Record<string, any>;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
      weight?: number;
      unit: string;
    };
    operatingConditions?: {
      temperature?: { min: number; max: number; unit: string };
      pressure?: { min: number; max: number; unit: string };
      humidity?: { min: number; max: number };
      vibration?: Record<string, any>;
      environment?: string[];
    };
    technicalSpecs?: Record<string, any>;
  };

  // Real-time Data Schema
  @ApiProperty({ description: 'Current real-time data', type: 'object' })
  @Column({ type: 'jsonb' })
  currentData: {
    timestamp: string;
    sensorData: Record<string, any>;
    performanceMetrics: {
      efficiency: number;
      throughput?: number;
      quality?: number;
      availability?: number;
      oee?: number; // Overall Equipment Effectiveness
    };
    operationalData: {
      status: string;
      temperature?: number;
      pressure?: number;
      vibration?: number;
      speed?: number;
      power?: number;
      energy?: number;
      production?: Record<string, any>;
    };
    qualityData?: {
      defectRate?: number;
      qualityScore?: number;
      inspectionResults?: Record<string, any>;
      compliance?: Record<string, boolean>;
    };
    maintenanceData?: {
      lastMaintenance?: string;
      nextMaintenance?: string;
      healthScore?: number;
      predictedFailure?: string;
      remainingUsefulLife?: number;
    };
  };

  // Historical Data Storage
  @ApiProperty({ description: 'Historical data summary', type: 'object' })
  @Column({ type: 'jsonb' })
  historicalSummary: {
    dataPoints: number;
    timeRange: {
      start: string;
      end: string;
    };
    averages: Record<string, number>;
    trends: Record<string, any>;
    anomalies: Array<{
      timestamp: string;
      type: string;
      severity: string;
      description: string;
    }>;
    patterns: Record<string, any>;
  };

  // AI & Analytics
  @ApiProperty({ description: 'AI-powered insights', type: 'object' })
  @Column({ type: 'jsonb', nullable: true })
  aiInsights?: {
    predictions: Array<{
      type: string;
      prediction: any;
      confidence: number;
      timeHorizon: string;
      createdAt: string;
    }>;
    anomalies: Array<{
      detected: string;
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      probability: number;
      recommendation: string;
    }>;
    optimizations: Array<{
      area: string;
      recommendation: string;
      potentialImprovement: number;
      implementationComplexity: 'low' | 'medium' | 'high';
      estimatedROI: number;
    }>;
    patterns: Array<{
      name: string;
      description: string;
      frequency: string;
      impact: string;
    }>;
  };

  // Simulation Capabilities
  @ApiProperty({ description: 'Simulation configuration', type: 'object' })
  @Column({ type: 'jsonb', nullable: true })
  simulationConfig?: {
    enabled: boolean;
    models: Array<{
      type: string;
      name: string;
      version: string;
      accuracy: number;
      lastCalibrated: string;
    }>;
    scenarios: Array<{
      name: string;
      description: string;
      parameters: Record<string, any>;
      lastRun: string;
      results?: Record<string, any>;
    }>;
    quantumSimulation?: {
      enabled: boolean;
      processor: string;
      algorithms: string[];
      performance: Record<string, number>;
    };
  };

  // Integration Points
  @ApiProperty({ description: 'System integrations', type: 'object' })
  @Column({ type: 'jsonb' })
  integrations: {
    iotPlatform?: {
      provider: string;
      endpoint: string;
      deviceIds: string[];
      protocols: string[];
    };
    erpSystem?: {
      system: string;
      modules: string[];
      syncStatus: string;
    };
    mes?: {
      system: string;
      workOrders: boolean;
      quality: boolean;
      maintenance: boolean;
    };
    scada?: {
      system: string;
      tags: string[];
      realTime: boolean;
    };
    plc?: Array<{
      type: string;
      address: string;
      protocol: string;
      tags: string[];
    }>;
    cloudPlatforms?: string[];
    apiEndpoints?: string[];
  };

  // Compliance & Security
  @ApiProperty({ description: 'Compliance and security settings', type: 'object' })
  @Column({ type: 'jsonb' })
  compliance: {
    standards: string[]; // ISO 9001, ISO 27001, IEC 62443, etc.
    certifications: string[];
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
    encryptionLevel: string;
    accessControls: Record<string, string[]>;
    auditTrail: boolean;
    dataResidency: string[];
    privacyCompliance: string[]; // GDPR, CCPA, etc.
  };

  // Performance Metrics
  @ApiProperty({ description: 'Twin performance metrics', type: 'object' })
  @Column({ type: 'jsonb' })
  performance: {
    syncAccuracy: number;
    latency: number; // milliseconds
    dataCompleteness: number;
    modelAccuracy: number;
    availability: number;
    reliability: number;
    lastSyncTime: string;
    errorRate: number;
    processingTime: number;
  };

  @ApiProperty({ description: 'Twin metadata and tags' })
  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @ApiProperty({ description: 'Custom fields for industry-specific data' })
  @Column({ type: 'jsonb', nullable: true })
  customFields?: Record<string, any>;

  @ApiProperty({ description: 'Internal notes and documentation' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Record creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({ description: 'Created by user' })
  @Column({ name: 'created_by', length: 255 })
  createdBy: string;

  @ApiProperty({ description: 'Last updated by user' })
  @Column({ name: 'updated_by', length: 255 })
  updatedBy: string;

  // Relationships
  @OneToMany(() => DigitalTwinSimulation, (simulation) => simulation.digitalTwin)
  simulations: DigitalTwinSimulation[];

  // Methods
  isHealthy(): boolean {
    return (
      this.status === TwinStatus.ACTIVE &&
      this.performance.syncAccuracy > 90 &&
      this.performance.availability > 95 &&
      this.performance.errorRate < 0.01
    );
  }

  getOverallEffectiveness(): number {
    const oee = this.currentData.performanceMetrics.oee || 0;
    const quality = this.currentData.performanceMetrics.quality || 0;
    const availability = this.currentData.performanceMetrics.availability || 0;
    const efficiency = this.currentData.performanceMetrics.efficiency || 0;

    return (oee + quality + availability + efficiency) / 4;
  }

  requiresAttention(): boolean {
    if (!this.isHealthy()) return true;
    
    const hasHighSeverityAnomalies = this.aiInsights?.anomalies?.some(
      a => a.severity === 'high' || a.severity === 'critical'
    ) || false;

    const lowPerformance = this.currentData.performanceMetrics.efficiency < 70;
    
    return hasHighSeverityAnomalies || lowPerformance;
  }

  getNextMaintenanceDate(): Date | null {
    if (!this.currentData.maintenanceData?.nextMaintenance) return null;
    return new Date(this.currentData.maintenanceData.nextMaintenance);
  }

  getPredictedFailureDate(): Date | null {
    if (!this.currentData.maintenanceData?.predictedFailure) return null;
    return new Date(this.currentData.maintenanceData.predictedFailure);
  }

  getHealthScore(): number {
    if (!this.currentData.maintenanceData?.healthScore) return 50; // default middle score
    return this.currentData.maintenanceData.healthScore;
  }

  isRealTimeSync(): boolean {
    return this.configuration.syncMode === SynchronizationMode.REAL_TIME;
  }

  getLatestAnomalies(count: number = 5): any[] {
    if (!this.historicalSummary?.anomalies) return [];
    
    return this.historicalSummary.anomalies
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, count);
  }

  getOptimizationOpportunities(): any[] {
    if (!this.aiInsights?.optimizations) return [];
    
    return this.aiInsights.optimizations
      .sort((a, b) => b.estimatedROI - a.estimatedROI)
      .filter(opt => opt.estimatedROI > 0);
  }

  hasQuantumCapabilities(): boolean {
    return this.configuration.quantumOptimization === true ||
           this.simulationConfig?.quantumSimulation?.enabled === true;
  }

  calculateUptime(): number {
    // This would calculate uptime based on historical data
    // For now, return based on availability metric
    return this.performance.availability || 0;
  }

  getComplianceStatus(): { compliant: boolean; issues: string[] } {
    // This would check compliance against various standards
    const issues: string[] = [];
    
    if (this.performance.syncAccuracy < 95) {
      issues.push('Sync accuracy below compliance threshold');
    }
    
    if (this.performance.availability < 99) {
      issues.push('Availability below required uptime');
    }
    
    return {
      compliant: issues.length === 0,
      issues,
    };
  }

  getEnergyEfficiency(): number {
    if (!this.currentData.operationalData.energy || !this.currentData.operationalData.production) {
      return 0;
    }
    
    const energyConsumed = this.currentData.operationalData.energy;
    const outputProduced = this.currentData.performanceMetrics.throughput || 1;
    
    return outputProduced / energyConsumed;
  }

  updateCurrentData(newData: Partial<any>): void {
    this.currentData = {
      ...this.currentData,
      ...newData,
      timestamp: new Date().toISOString(),
    };
  }

  addAnomalyDetection(anomaly: any): void {
    if (!this.aiInsights) {
      this.aiInsights = { predictions: [], anomalies: [], optimizations: [], patterns: [] };
    }
    
    this.aiInsights.anomalies.push({
      ...anomaly,
      detected: new Date().toISOString(),
    });
  }

  getIndustrySpecificMetrics(): Record<string, any> {
    switch (this.industryType) {
      case IndustryType.AUTOMOTIVE:
        return {
          cycleTime: this.currentData.operationalData.production?.cycleTime,
          defectPPM: this.currentData.qualityData?.defectRate * 1000000,
          toolWear: this.currentData.maintenanceData?.healthScore,
        };
      
      case IndustryType.PHARMACEUTICALS:
        return {
          batchYield: this.currentData.qualityData?.qualityScore,
          contaminationLevel: this.currentData.qualityData?.inspectionResults?.contamination,
          complianceScore: this.currentData.qualityData?.compliance,
        };
      
      case IndustryType.CHEMICALS:
        return {
          reactionEfficiency: this.currentData.performanceMetrics.efficiency,
          safetyScore: this.currentData.operationalData.production?.safety,
          environmentalImpact: this.customFields?.environmentalMetrics,
        };
      
      default:
        return {};
    }
  }
}
