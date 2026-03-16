// Industry 5.0 ERP Backend - Manufacturing Module
// OperationLog Entity - Comprehensive operation logging for all manufacturing industries
// Supports: Oil & Gas, FMCG, Defence, Aircraft, Naval, Chemicals, Automotive, Pharma, etc.
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { WorkOrder } from './WorkOrder';
import { WorkCenter } from './WorkCenter';

export enum OperationLogType {
  PRODUCTION = 'production',
  QUALITY_CHECK = 'quality_check',
  SETUP = 'setup',
  BREAKDOWN = 'breakdown',
  MAINTENANCE = 'maintenance',
  CALIBRATION = 'calibration',
  MATERIAL_CONSUMPTION = 'material_consumption',
  OPERATOR_ACTION = 'operator_action',
  SYSTEM_EVENT = 'system_event',
  SAFETY_EVENT = 'safety_event',
  ENVIRONMENTAL_EVENT = 'environmental_event',
  COMPLIANCE_CHECK = 'compliance_check',
  PROCESS_DEVIATION = 'process_deviation',
}

export enum OperationStatus {
  STARTED = 'started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  STOPPED = 'stopped',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export enum IndustryType {
  OIL_GAS = 'oil_gas',
  FMCG = 'fmcg',
  DEFENCE = 'defence',
  AIRCRAFT = 'aircraft',
  NAVAL = 'naval',
  CHEMICALS = 'chemicals',
  AUTOMOTIVE = 'automotive',
  PHARMACEUTICALS = 'pharmaceuticals',
  ELECTRONICS = 'electronics',
  TEXTILES = 'textiles',
  STEEL = 'steel',
  MINING = 'mining',
  FOOD_BEVERAGE = 'food_beverage',
  PLASTICS = 'plastics',
  PAPER = 'paper',
  CEMENT = 'cement',
  ENERGY = 'energy',
  GENERAL = 'general',
}

@Entity('operation_logs')
@Index(['timestamp'])
@Index(['workOrderId'])
@Index(['workCenterId'])
@Index(['logType'])
@Index(['status'])
@Index(['industryType'])
@Index(['operatorId'])
export class OperationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  timestamp: Date;

  // Operation Classification
  @Column({
    type: 'enum',
    enum: OperationLogType,
    default: OperationLogType.PRODUCTION,
  })
  @Index()
  logType: OperationLogType;

  @Column({
    type: 'enum',
    enum: OperationStatus,
    default: OperationStatus.IN_PROGRESS,
  })
  @Index()
  status: OperationStatus;

  @Column({
    type: 'enum',
    enum: IndustryType,
    default: IndustryType.GENERAL,
  })
  @Index()
  industryType: IndustryType;

  // References
  @Column({ type: 'uuid', nullable: true })
  @Index()
  workOrderId: string;

  @ManyToOne(() => WorkOrder, (workOrder) => workOrder.operationLogs)
  @JoinColumn({ name: 'workOrderId' })
  workOrder: WorkOrder;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  workCenterId: string;

  @ManyToOne(() => WorkCenter, (workCenter) => workCenter.operationLogs)
  @JoinColumn({ name: 'workCenterId' })
  workCenter: WorkCenter;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  operatorId: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  operatorName: string;

  // Operation Details
  @Column({ type: 'varchar', length: 100 })
  operationCode: string;

  @Column({ type: 'varchar', length: 200 })
  operationName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'integer', default: 1 })
  sequenceStep: number;

  // Timing Information
  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  duration: number; // in minutes

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  plannedDuration: number; // in minutes

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  efficiency: number; // percentage

  // Quantity and Production Data
  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  quantityProcessed: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  quantityProduced: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  quantityRejected: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  quantityRework: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  yieldPercentage: number;

  // Process Parameters (Industry-Specific)
  @Column({ type: 'jsonb', nullable: true })
  processParameters: {
    // Oil & Gas specific
    pressure?: number; // psi/bar
    temperature?: number; // °C/°F
    flowRate?: number; // bbl/hr, m³/hr
    viscosity?: number; // cP
    density?: number; // kg/m³
    h2sContent?: number; // ppm
    waterCut?: number; // percentage
    
    // Chemical specific
    ph?: number;
    concentration?: number; // mol/L, %
    reactorPressure?: number;
    catalystLevel?: number;
    purityLevel?: number; // percentage
    
    // FMCG/Food specific
    batchSize?: number;
    mixingTime?: number; // minutes
    cookingTemp?: number; // °C
    moisture?: number; // percentage
    shelfLife?: number; // days
    
    // Defence/Aircraft/Naval specific
    torqueValue?: number; // Nm
    compressionRatio?: number;
    surfaceFinish?: number; // Ra
    materialGrade?: string;
    heatTreatment?: string;
    ndt?: boolean; // Non-destructive testing
    
    // Pharmaceutical specific
    apiContent?: number; // mg
    dissolution?: number; // percentage
    sterility?: boolean;
    endotoxin?: number; // EU/mL
    bioburden?: number; // CFU/g
    
    // Electronics specific
    resistance?: number; // Ohms
    capacitance?: number; // pF/µF
    voltage?: number; // V
    current?: number; // A
    frequency?: number; // Hz
    
    // Textile specific
    tensileStrength?: number; // N
    threadCount?: number;
    colorFastness?: number;
    shrinkage?: number; // percentage
    
    // General parameters
    speed?: number; // rpm, m/min
    force?: number; // N, kN
    vibration?: number; // mm/s
    noise?: number; // dB
    humidity?: number; // percentage
    power?: number; // kW
    energy?: number; // kWh
  };

  // Quality and Compliance Data
  @Column({ type: 'jsonb', nullable: true })
  qualityMetrics: {
    inspectionResults: {
      parameter: string;
      specification: string;
      actual: string;
      result: string; // pass/fail/warning
      inspector: string;
      timestamp: Date;
    }[];
    defects: {
      type: string;
      severity: string;
      location: string;
      cause: string;
      action: string;
    }[];
    compliance: {
      standard: string; // ISO, ASTM, FDA, DOD, etc.
      requirement: string;
      status: string;
      certificate: string;
      expiry: Date;
    }[];
  };

  // Material Consumption (Industry-Specific)
  @Column({ type: 'jsonb', nullable: true })
  materialConsumption: {
    materials: {
      materialId: string;
      materialCode: string;
      materialName: string;
      batchLot: string;
      quantity: number;
      unit: string;
      cost: number;
      supplier: string;
      expiryDate?: Date;
      
      // Industry-specific material properties
      grade?: string; // Steel grade, Chemical grade
      specification?: string; // AISI, ASTM, AMS, etc.
      composition?: Record<string, number>; // Chemical composition
      certifications?: string[]; // Material certificates
      hazardClass?: string; // Chemical hazard classification
      flashPoint?: number; // °C (for chemicals)
      meltingPoint?: number; // °C (for metals)
    }[];
    waste: {
      type: string;
      quantity: number;
      unit: string;
      disposal: string;
      cost: number;
      environmental: boolean;
    }[];
  };

  // Equipment and Tool Usage
  @Column({ type: 'jsonb', nullable: true })
  equipmentData: {
    equipment: {
      equipmentId: string;
      equipmentCode: string;
      equipmentName: string;
      status: string;
      runTime: number; // minutes
      cycles: number;
      temperature: number;
      pressure: number;
      efficiency: number;
      maintenance: {
        lastService: Date;
        nextService: Date;
        condition: string;
      };
    }[];
    tools: {
      toolId: string;
      toolCode: string;
      toolName: string;
      usageTime: number; // minutes
      wearLevel: number; // percentage
      calibrationDue: Date;
    }[];
  };

  // Environmental and Safety Data
  @Column({ type: 'jsonb', nullable: true })
  environmentalData: {
    emissions: {
      co2: number; // kg
      nox: number; // kg
      sox: number; // kg
      particulates: number; // kg
      voc: number; // kg (Volatile Organic Compounds)
    };
    waste: {
      solid: number; // kg
      liquid: number; // liters
      hazardous: number; // kg
      recycled: number; // kg
    };
    energy: {
      electricity: number; // kWh
      gas: number; // m³
      steam: number; // kg
      compressedAir: number; // m³
      water: number; // liters
    };
    safety: {
      incidents: {
        type: string;
        severity: string;
        description: string;
        action: string;
        resolved: boolean;
      }[];
      ppe: string[]; // Personal Protective Equipment used
      hazards: string[]; // Identified hazards
    };
  };

  // Industry 5.0 Digital Features
  @Column({ type: 'jsonb', nullable: true })
  digitalTwinData: {
    twinId: string;
    syncTimestamp: Date;
    virtualParameters: Record<string, any>;
    predictions: {
      quality: number;
      efficiency: number;
      failure: number;
      maintenance: Date;
    };
    recommendations: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  aiInsights: {
    anomalies: {
      parameter: string;
      expected: number;
      actual: number;
      deviation: number;
      severity: string;
      recommendation: string;
    }[];
    optimization: {
      parameter: string;
      currentValue: number;
      recommendedValue: number;
      benefit: string;
      confidence: number;
    }[];
    predictions: {
      type: string; // quality, failure, efficiency
      value: number;
      confidence: number;
      timeHorizon: string;
    }[];
  };

  @Column({ type: 'jsonb', nullable: true })
  iotData: {
    sensors: {
      sensorId: string;
      type: string;
      value: number;
      unit: string;
      status: string;
      timestamp: Date;
      calibrated: boolean;
    }[];
    actuators: {
      actuatorId: string;
      type: string;
      command: string;
      response: string;
      timestamp: Date;
    }[];
    connectivity: {
      protocol: string; // MQTT, OPC-UA, Modbus, etc.
      latency: number; // ms
      reliability: number; // percentage
    };
  };

  // Human Factors and Ergonomics
  @Column({ type: 'jsonb', nullable: true })
  humanFactors: {
    operator: {
      fatigue: number; // 1-10 scale
      skill: string;
      experience: number; // years
      training: string[];
      certifications: string[];
    };
    ergonomics: {
      workload: string; // light, moderate, heavy
      posture: string;
      repetition: number;
      environment: string;
    };
    collaboration: {
      humanRobot: boolean;
      aiAssistance: boolean;
      teamwork: boolean;
      communication: string;
    };
  };

  // Regulatory and Compliance (Industry-Specific)
  @Column({ type: 'jsonb', nullable: true })
  regulatoryData: {
    // Oil & Gas
    api?: string; // American Petroleum Institute
    asme?: string; // American Society of Mechanical Engineers
    
    // Defence/Aircraft/Naval
    milSpec?: string; // Military Specification
    nadcap?: boolean; // National Aerospace and Defense Contractors
    itar?: boolean; // International Traffic in Arms Regulations
    
    // Pharmaceuticals
    fda?: string; // FDA regulations
    gmp?: boolean; // Good Manufacturing Practice
    ich?: string; // International Conference on Harmonisation
    
    // Food & Beverage
    haccp?: boolean; // Hazard Analysis Critical Control Points
    fsis?: boolean; // Food Safety and Inspection Service
    brc?: string; // British Retail Consortium
    
    // Chemicals
    reach?: boolean; // Registration, Evaluation, Authorisation of Chemicals
    osha?: boolean; // Occupational Safety and Health Administration
    epa?: string; // Environmental Protection Agency
    
    // General
    iso?: string[]; // ISO standards
    astm?: string[]; // ASTM standards
    ansi?: string[]; // American National Standards Institute
    iec?: string[]; // International Electrotechnical Commission
    
    compliance: {
      standard: string;
      status: string;
      auditor: string;
      auditDate: Date;
      certificate: string;
      expiry: Date;
      findings: string[];
    }[];
  };

  // Cost and Economics
  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  operationCost: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  materialCost: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  laborCost: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  energyCost: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  maintenanceCost: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  // Notes and Comments
  @Column({ type: 'text', nullable: true })
  operatorNotes: string;

  @Column({ type: 'text', nullable: true })
  supervisorNotes: string;

  @Column({ type: 'text', nullable: true })
  systemNotes: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments: {
    type: string; // image, document, video
    fileName: string;
    filePath: string;
    description: string;
    uploadedBy: string;
    uploadedAt: Date;
  }[];

  // Alert and Notification Data
  @Column({ type: 'jsonb', nullable: true })
  alerts: {
    alertId: string;
    type: string; // warning, critical, info
    message: string;
    acknowledged: boolean;
    acknowledgedBy: string;
    acknowledgedAt: Date;
    resolved: boolean;
    resolvedBy: string;
    resolvedAt: Date;
  }[];

  // Audit Fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  // Business Logic Methods
  getDurationInMinutes(): number {
    if (!this.startTime || !this.endTime) return 0;
    return (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60);
  }

  isCompleted(): boolean {
    return this.status === OperationStatus.COMPLETED;
  }

  hasQualityIssues(): boolean {
    return this.qualityMetrics?.defects?.length > 0 || false;
  }

  isWithinTolerance(): boolean {
    if (!this.qualityMetrics?.inspectionResults) return true;
    return this.qualityMetrics.inspectionResults.every(result => result.result === 'pass');
  }

  getEfficiencyRating(): string {
    if (!this.efficiency) return 'Unknown';
    if (this.efficiency >= 95) return 'Excellent';
    if (this.efficiency >= 85) return 'Good';
    if (this.efficiency >= 75) return 'Average';
    if (this.efficiency >= 65) return 'Below Average';
    return 'Poor';
  }

  getEnvironmentalImpact(): number {
    if (!this.environmentalData) return 0;
    
    const emissions = this.environmentalData.emissions;
    const totalEmissions = (emissions?.co2 || 0) + (emissions?.nox || 0) + 
                          (emissions?.sox || 0) + (emissions?.particulates || 0);
    
    return totalEmissions;
  }

  getCarbonFootprint(): number {
    return this.environmentalData?.emissions?.co2 || 0;
  }

  hasAnomalies(): boolean {
    return this.aiInsights?.anomalies?.length > 0 || false;
  }

  getCriticalAnomalies(): any[] {
    if (!this.aiInsights?.anomalies) return [];
    return this.aiInsights.anomalies.filter(a => a.severity === 'critical');
  }

  isComplianceValid(): boolean {
    if (!this.regulatoryData?.compliance) return true;
    return this.regulatoryData.compliance.every(c => 
      c.status === 'valid' && new Date(c.expiry) > new Date()
    );
  }

  getIndustrySpecificMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    switch (this.industryType) {
      case IndustryType.OIL_GAS:
        metrics.pressure = this.processParameters?.pressure;
        metrics.temperature = this.processParameters?.temperature;
        metrics.flowRate = this.processParameters?.flowRate;
        metrics.h2sContent = this.processParameters?.h2sContent;
        break;
        
      case IndustryType.CHEMICALS:
        metrics.ph = this.processParameters?.ph;
        metrics.concentration = this.processParameters?.concentration;
        metrics.purityLevel = this.processParameters?.purityLevel;
        break;
        
      case IndustryType.PHARMACEUTICALS:
        metrics.apiContent = this.processParameters?.apiContent;
        metrics.sterility = this.processParameters?.sterility;
        metrics.endotoxin = this.processParameters?.endotoxin;
        break;
        
      case IndustryType.DEFENCE:
      case IndustryType.AIRCRAFT:
      case IndustryType.NAVAL:
        metrics.torqueValue = this.processParameters?.torqueValue;
        metrics.surfaceFinish = this.processParameters?.surfaceFinish;
        metrics.ndt = this.processParameters?.ndt;
        break;
        
      default:
        metrics.speed = this.processParameters?.speed;
        metrics.temperature = this.processParameters?.temperature;
        metrics.pressure = this.processParameters?.pressure;
    }
    
    return metrics;
  }

  calculateOEE(): number {
    if (!this.duration || !this.plannedDuration || !this.yieldPercentage) return 0;
    
    const availability = Math.min(1, this.duration / this.plannedDuration);
    const performance = this.efficiency / 100;
    const quality = this.yieldPercentage / 100;
    
    return availability * performance * quality * 100;
  }

  getTotalCost(): number {
    return (this.operationCost || 0) + 
           (this.materialCost || 0) + 
           (this.laborCost || 0) + 
           (this.energyCost || 0) + 
           (this.maintenanceCost || 0);
  }

  getUnresolvedAlerts(): any[] {
    if (!this.alerts) return [];
    return this.alerts.filter(alert => !alert.resolved);
  }

  getCriticalAlerts(): any[] {
    if (!this.alerts) return [];
    return this.alerts.filter(alert => alert.type === 'critical' && !alert.resolved);
  }

  validateLog(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.operationCode) {
      errors.push('Operation code is required');
    }

    if (!this.operationName) {
      errors.push('Operation name is required');
    }

    if (this.startTime && this.endTime && this.startTime >= this.endTime) {
      errors.push('Start time must be before end time');
    }

    if (this.quantityProcessed && this.quantityProcessed < 0) {
      errors.push('Quantity processed cannot be negative');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
