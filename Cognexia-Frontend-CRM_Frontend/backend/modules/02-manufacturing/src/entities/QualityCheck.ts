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
import { RoutingOperation } from './RoutingOperation';

export enum QualityCheckStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  PASSED = 'passed',
  FAILED = 'failed',
  CONDITIONAL_PASS = 'conditional_pass',
  REWORK_REQUIRED = 'rework_required',
  CANCELLED = 'cancelled',
}

export enum QualityCheckType {
  INCOMING_INSPECTION = 'incoming_inspection',
  IN_PROCESS_INSPECTION = 'in_process_inspection',
  FINAL_INSPECTION = 'final_inspection',
  DIMENSIONAL_CHECK = 'dimensional_check',
  VISUAL_INSPECTION = 'visual_inspection',
  FUNCTIONAL_TEST = 'functional_test',
  MATERIAL_TEST = 'material_test',
  STATISTICAL_SAMPLING = 'statistical_sampling',
}

export enum InspectionMethod {
  MANUAL = 'manual',
  AUTOMATED = 'automated',
  SEMI_AUTOMATED = 'semi_automated',
  AI_VISION = 'ai_vision',
  SENSOR_BASED = 'sensor_based',
  STATISTICAL = 'statistical',
}

@Entity('quality_checks')
@Index(['workOrderId'])
@Index(['workCenterId'])
@Index(['status'])
@Index(['checkType'])
export class QualityCheck {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  checkNumber: string;

  @Column({ length: 255 })
  checkName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: QualityCheckType,
    default: QualityCheckType.IN_PROCESS_INSPECTION,
  })
  checkType: QualityCheckType;

  @Column({
    type: 'enum',
    enum: QualityCheckStatus,
    default: QualityCheckStatus.PENDING,
  })
  status: QualityCheckStatus;

  @Column({
    type: 'enum',
    enum: InspectionMethod,
    default: InspectionMethod.MANUAL,
  })
  inspectionMethod: InspectionMethod;

  // Timing
  @Column({ type: 'timestamp', nullable: true })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  inspectionTime: number; // minutes

  // Inspector Information
  @Column({ length: 100, nullable: true })
  inspectorId: string;

  @Column({ length: 255, nullable: true })
  inspectorName: string;

  @Column({ length: 100, nullable: true })
  inspectorCertification: string;

  // Sampling Information
  @Column({ type: 'int', default: 1 })
  sampleSize: number;

  @Column({ type: 'int', default: 1 })
  lotSize: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  samplingPercentage: number;

  @Column({ type: 'jsonb', nullable: true })
  samplingPlan: {
    plan: string;
    aql: number; // Acceptable Quality Level
    inspectionLevel: string;
    sampleCode: string;
    acceptanceNumber: number;
    rejectionNumber: number;
  };

  // Inspection Criteria
  @Column({ type: 'jsonb', nullable: true })
  inspectionCriteria: {
    specifications: object[];
    tolerances: object[];
    acceptanceCriteria: string[];
    rejectionCriteria: string[];
    measurementPoints: string[];
  };

  // Measurement Results
  @Column({ type: 'jsonb', nullable: true })
  measurementResults: {
    measurements: object[];
    dimensions: object[];
    characteristics: object[];
    defects: object[];
    observations: string[];
  };

  // Test Results
  @Column({ type: 'jsonb', nullable: true })
  testResults: {
    functionalTests: object[];
    materialTests: object[];
    performanceTests: object[];
    environmentalTests: object[];
    safetyTests: object[];
  };

  // Statistical Analysis
  @Column({ type: 'jsonb', nullable: true })
  statisticalData: {
    mean: number;
    standardDeviation: number;
    cpk: number; // Process Capability Index
    cp: number;  // Process Capability
    controlChartData: object[];
    trends: object[];
  };

  // AI Analysis Results
  @Column({ type: 'jsonb', nullable: true })
  aiAnalysis: {
    confidenceScore: number;
    anomalyDetection: object[];
    patternRecognition: object[];
    predictiveQuality: object;
    recommendations: string[];
  };

  // Overall Results
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  overallScore: number; // 0-100

  @Column({ type: 'int', default: 0 })
  defectCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  defectRate: number; // percentage

  @Column({ type: 'boolean', default: false })
  isConforming: boolean;

  // Defect Classification
  @Column({ type: 'jsonb', nullable: true })
  defectClassification: {
    critical: number;
    major: number;
    minor: number;
    cosmetic: number;
    defectTypes: string[];
    rootCauses: string[];
  };

  // Corrective Actions
  @Column({ type: 'jsonb', nullable: true })
  correctiveActions: {
    required: boolean;
    actions: string[];
    responsible: string[];
    dueDate: Date;
    status: string;
    effectiveness: string;
  };

  // Documentation
  @Column({ type: 'jsonb', nullable: true })
  documentation: {
    inspectionReport: string;
    photos: string[];
    videos: string[];
    certificates: string[];
    attachments: string[];
  };

  // Equipment and Tools
  @Column({ type: 'jsonb', nullable: true })
  equipmentUsed: {
    measurementDevices: string[];
    testEquipment: string[];
    software: string[];
    calibrationStatus: object[];
    accuracy: object[];
  };

  // Environmental Conditions
  @Column({ type: 'jsonb', nullable: true })
  environmentalConditions: {
    temperature: number;
    humidity: number;
    pressure: number;
    lighting: number;
    vibration: number;
  };

  // Cost Information
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  inspectionCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  nonConformanceCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  reworkCost: number;

  // Compliance and Standards
  @Column({ type: 'jsonb', nullable: true })
  complianceStandards: {
    standards: string[];
    certifications: string[];
    regulations: string[];
    auditTrail: object[];
  };

  // Digital Integration
  @Column({ type: 'boolean', default: false })
  isDigitallyIntegrated: boolean;

  @Column({ type: 'jsonb', nullable: true })
  digitalData: {
    barcodes: string[];
    qrCodes: string[];
    rfidTags: string[];
    digitalSignatures: string[];
    blockchain: object;
  };

  // Relationships
  @Column({ type: 'varchar' })
  workOrderId: string;

  @ManyToOne(() => WorkOrder, (workOrder) => workOrder.qualityChecks)
  @JoinColumn({ name: 'workOrderId' })
  workOrder: WorkOrder;

  @Column({ nullable: true })
  workCenterId: string;

  @ManyToOne(() => WorkCenter)
  @JoinColumn({ name: 'workCenterId' })
  workCenter: WorkCenter;

  @Column({ nullable: true })
  routingOperationId: string;

  @ManyToOne(() => RoutingOperation)
  @JoinColumn({ name: 'routingOperationId' })
  routingOperation: RoutingOperation;

  // Audit fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 100, nullable: true })
  createdBy: string;

  @Column({ length: 100, nullable: true })
  updatedBy: string;

  // Methods
  calculateInspectionDuration(): number {
    if (this.startedAt && this.completedAt) {
      return (this.completedAt.getTime() - this.startedAt.getTime()) / (1000 * 60); // minutes
    }
    return 0;
  }

  isOverdue(): boolean {
    if (!this.scheduledDate) return false;
    return new Date() > this.scheduledDate && this.status === QualityCheckStatus.PENDING;
  }

  calculatePassRate(): number {
    if (this.sampleSize === 0) return 0;
    const passedItems = this.sampleSize - this.defectCount;
    return (passedItems / this.sampleSize) * 100;
  }

  getQualityLevel(): string {
    const passRate = this.calculatePassRate();
    if (passRate >= 99) return 'excellent';
    if (passRate >= 95) return 'good';
    if (passRate >= 90) return 'acceptable';
    if (passRate >= 80) return 'marginal';
    return 'unacceptable';
  }

  requiresRework(): boolean {
    return this.status === QualityCheckStatus.FAILED || 
           this.status === QualityCheckStatus.REWORK_REQUIRED;
  }

  generateReport(): object {
    return {
      checkNumber: this.checkNumber,
      checkName: this.checkName,
      status: this.status,
      inspectionMethod: this.inspectionMethod,
      inspector: this.inspectorName,
      inspectionTime: this.calculateInspectionDuration(),
      sampleSize: this.sampleSize,
      defectCount: this.defectCount,
      defectRate: this.defectRate,
      passRate: this.calculatePassRate(),
      qualityLevel: this.getQualityLevel(),
      overallScore: this.overallScore,
      isConforming: this.isConforming,
      measurementResults: this.measurementResults,
      testResults: this.testResults,
      correctiveActions: this.correctiveActions,
      completedAt: this.completedAt,
    };
  }

  validateResults(): string[] {
    const errors: string[] = [];

    if ([QualityCheckStatus.PASSED, QualityCheckStatus.FAILED, QualityCheckStatus.CONDITIONAL_PASS].includes(this.status) && !this.completedAt) {
      errors.push('Completion date is required for completed inspections');
    }

    if (this.sampleSize <= 0) {
      errors.push('Sample size must be greater than 0');
    }

    if (this.defectCount > this.sampleSize) {
      errors.push('Defect count cannot exceed sample size');
    }

    if (this.overallScore && (this.overallScore < 0 || this.overallScore > 100)) {
      errors.push('Overall score must be between 0 and 100');
    }

    return errors;
  }

  updateStatus(newStatus: QualityCheckStatus, inspectorId?: string): void {
    this.status = newStatus;
    
    if (newStatus === QualityCheckStatus.IN_PROGRESS && !this.startedAt) {
      this.startedAt = new Date();
      if (inspectorId) {
        this.inspectorId = inspectorId;
      }
    }
    
    if ([QualityCheckStatus.PASSED, QualityCheckStatus.FAILED, 
         QualityCheckStatus.CONDITIONAL_PASS].includes(newStatus) && !this.completedAt) {
      this.completedAt = new Date();
      this.inspectionTime = this.calculateInspectionDuration();
    }
  }

  calculateCpk(): number {
    // Process Capability Index calculation
    if (!this.statisticalData || !this.inspectionCriteria) return 0;
    
    // This is a simplified calculation - in practice, you'd need actual specification limits
    const mean = this.statisticalData.mean || 0;
    const stdDev = this.statisticalData.standardDeviation || 1;
    const cp = this.statisticalData.cp || 1;
    
    // Cpk = min((USL - mean)/(3*σ), (mean - LSL)/(3*σ))
    // For now, return Cp as approximation
    return cp;
  }

  isCapable(): boolean {
    const cpk = this.calculateCpk();
    return cpk >= 1.33; // Industry standard for capable process
  }
}
