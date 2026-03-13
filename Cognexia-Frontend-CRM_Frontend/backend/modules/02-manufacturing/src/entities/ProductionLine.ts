// Industry 5.0 ERP Backend - Manufacturing Module
// ProductionLine Entity - Represents manufacturing production lines
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { WorkCenter } from './WorkCenter';
import { ProductionOrder } from './ProductionOrder';
import { ProductionSchedule } from './ProductionSchedule';

export enum ProductionLineStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  BREAKDOWN = 'breakdown',
  SETUP = 'setup',
  CHANGEOVER = 'changeover',
}

export enum ProductionLineType {
  ASSEMBLY = 'assembly',
  FABRICATION = 'fabrication',
  PACKAGING = 'packaging',
  TESTING = 'testing',
  MIXED = 'mixed',
  FLEXIBLE = 'flexible',
}

@Entity('production_lines')
@Index(['code'], { unique: true })
@Index(['status'])
@Index(['type'])
@Index(['facilityId'])
export class ProductionLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  code: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ProductionLineType,
    default: ProductionLineType.ASSEMBLY,
  })
  type: ProductionLineType;

  @Column({
    type: 'enum',
    enum: ProductionLineStatus,
    default: ProductionLineStatus.ACTIVE,
  })
  @Index()
  status: ProductionLineStatus;

  // Facility Information
  @Column({ type: 'uuid', nullable: true })
  facilityId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  building: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  floor: string;

  // Capacity and Performance Metrics
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  designCapacity: number; // units per hour

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentCapacity: number; // units per hour

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  efficiency: number; // percentage

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  utilization: number; // percentage

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  oee: number; // Overall Equipment Effectiveness

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cycleTime: number; // seconds per unit

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taktTime: number; // seconds per unit

  // Cost and Financial Metrics
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  setupCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  operatingCostPerHour: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  laborCostPerHour: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  overheadCostPerHour: number;

  // Production Capabilities
  @Column({ type: 'jsonb', nullable: true })
  productTypes: {
    id: string;
    name: string;
    sku: string;
    minQuantity: number;
    maxQuantity: number;
    setupTime: number;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  capabilities: {
    operation: string;
    capacity: number;
    quality: string;
    certificationRequired: boolean;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  qualityStandards: {
    standard: string;
    version: string;
    compliance: boolean;
    lastAudit: Date;
  }[];

  // Staffing and Resources
  @Column({ type: 'integer', default: 0 })
  requiredOperators: number;

  @Column({ type: 'integer', default: 0 })
  currentOperators: number;

  @Column({ type: 'jsonb', nullable: true })
  skillRequirements: {
    skill: string;
    level: string;
    certified: boolean;
    required: boolean;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  shiftConfiguration: {
    shift: string;
    startTime: string;
    endTime: string;
    operators: number;
    efficiency: number;
  }[];

  // Equipment and Technology
  @Column({ type: 'jsonb', nullable: true })
  equipment: {
    id: string;
    name: string;
    type: string;
    manufacturer: string;
    model: string;
    status: string;
    lastMaintenance: Date;
    nextMaintenance: Date;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  automationLevel: {
    level: string; // manual, semi-automated, fully-automated, autonomous
    percentage: number;
    robotics: boolean;
    aiIntegrated: boolean;
  };

  // Industry 5.0 Features
  @Column({ type: 'jsonb', nullable: true })
  iotSensors: {
    id: string;
    type: string;
    location: string;
    status: string;
    lastReading: {
      timestamp: Date;
      value: number;
      unit: string;
    };
    thresholds: {
      min: number;
      max: number;
      critical: number;
    };
  }[];

  @Column({ type: 'jsonb', nullable: true })
  aiAnalytics: {
    predictiveMaintenanceScore: number;
    qualityPrediction: number;
    efficiencyOptimization: number;
    anomalyDetection: {
      score: number;
      lastAnomaly: Date;
      type: string;
    };
    lastAnalysis: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  digitalTwin: {
    id: string;
    status: string;
    lastSync: Date;
    simulationRunning: boolean;
    predictiveModel: {
      accuracy: number;
      lastTrained: Date;
      version: string;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  sustainabilityMetrics: {
    energyConsumption: number; // kWh per unit
    carbonFootprint: number; // kg CO2 per unit
    wasteGeneration: number; // kg per unit
    waterUsage: number; // liters per unit
    recyclingRate: number; // percentage
  };

  // Human-AI Collaboration
  @Column({ type: 'jsonb', nullable: true })
  humanAiCollaboration: {
    enabled: boolean;
    aiAssistanceLevel: string; // advisory, collaborative, autonomous
    humanOverrideCapability: boolean;
    collaborativeRobots: {
      count: number;
      types: string[];
      safetyLevel: string;
    };
  };

  // Quality and Compliance
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  firstPassYield: number; // percentage

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  defectRate: number; // percentage

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  reworkRate: number; // percentage

  @Column({ type: 'jsonb', nullable: true })
  complianceRecords: {
    regulation: string;
    status: string;
    lastAudit: Date;
    nextAudit: Date;
    certificateNumber: string;
  }[];

  // Relationships
  @OneToMany(() => WorkCenter, (workCenter) => workCenter.productionLine)
  workCenters: WorkCenter[];

  @OneToMany(() => ProductionOrder, (order) => order.productionLine)
  productionOrders: ProductionOrder[];

  @OneToMany(() => ProductionSchedule, (schedule) => schedule.productionLine)
  productionSchedules: ProductionSchedule[];

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
  isOperational(): boolean {
    return this.status === ProductionLineStatus.ACTIVE;
  }

  isAvailable(): boolean {
    return (
      this.status === ProductionLineStatus.ACTIVE &&
      this.currentOperators >= this.requiredOperators
    );
  }

  calculateOEE(): number {
    // OEE = Availability × Performance × Quality
    const availability = this.utilization / 100;
    const performance = this.efficiency / 100;
    const quality = (100 - this.defectRate) / 100;
    return availability * performance * quality * 100;
  }

  getCurrentThroughput(): number {
    return this.currentCapacity * (this.efficiency / 100) * (this.utilization / 100);
  }

  canProduceProduct(productId: string): boolean {
    return this.productTypes?.some(p => p.id === productId) || false;
  }

  estimateProductionTime(productId: string, quantity: number): number {
    const product = this.productTypes?.find(p => p.id === productId);
    if (!product) return 0;
    
    const setupTime = product.setupTime || 0;
    const processingTime = (quantity / this.getCurrentThroughput()) * 60; // minutes
    return setupTime + processingTime;
  }

  calculateProductionCost(productId: string, quantity: number): number {
    const estimatedTime = this.estimateProductionTime(productId, quantity);
    const hours = estimatedTime / 60;
    
    return hours * (
      this.operatingCostPerHour + 
      this.laborCostPerHour + 
      this.overheadCostPerHour
    );
  }

  getCapacityUtilization(): number {
    return (this.currentCapacity / this.designCapacity) * 100;
  }

  isMaintenanceRequired(): boolean {
    return this.aiAnalytics?.predictiveMaintenanceScore > 0.7;
  }

  getEnergyEfficiencyRating(): string {
    const energyPerUnit = this.sustainabilityMetrics?.energyConsumption || 0;
    if (energyPerUnit < 1) return 'A';
    if (energyPerUnit < 2) return 'B';
    if (energyPerUnit < 3) return 'C';
    if (energyPerUnit < 4) return 'D';
    return 'E';
  }

  getSustainabilityScore(): number {
    const metrics = this.sustainabilityMetrics;
    if (!metrics) return 0;
    
    // Simple scoring algorithm (can be enhanced)
    const energyScore = Math.max(0, 100 - metrics.energyConsumption * 10);
    const wasteScore = Math.max(0, 100 - metrics.wasteGeneration * 20);
    const recyclingScore = metrics.recyclingRate;
    
    return (energyScore + wasteScore + recyclingScore) / 3;
  }
}
