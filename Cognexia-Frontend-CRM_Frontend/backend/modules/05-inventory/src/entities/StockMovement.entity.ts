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
import { IsNotEmpty, Min, IsOptional } from 'class-validator';
import { InventoryItem } from './InventoryItem.entity';
import { InventoryLocation } from './InventoryLocation.entity';

export enum MovementType {
  RECEIPT = 'receipt',
  ISSUE = 'issue',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  RETURN = 'return',
  SCRAP = 'scrap',
  CYCLE_COUNT = 'cycle_count',
  PHYSICAL_COUNT = 'physical_count',
  PRODUCTION_RECEIPT = 'production_receipt',
  PRODUCTION_ISSUE = 'production_issue',
  SALES_ISSUE = 'sales_issue',
  PURCHASE_RECEIPT = 'purchase_receipt',
  INTERCOMPANY_TRANSFER = 'intercompany_transfer',
  RESERVATION = 'reservation',
  RESERVATION_RELEASE = 'reservation_release',
  DAMAGE = 'damage',
  THEFT = 'theft',
  EXPIRY = 'expiry',
  QUALITY_HOLD = 'quality_hold',
  QUALITY_RELEASE = 'quality_release',
  REWORK = 'rework',
  CONSIGNMENT_RECEIPT = 'consignment_receipt',
  CONSIGNMENT_RETURN = 'consignment_return',
}

export enum MovementStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled',
  REVERSED = 'reversed',
  ON_HOLD = 'on_hold',
  REJECTED = 'rejected',
}

export enum MovementDirection {
  IN = 'in',
  OUT = 'out',
  NEUTRAL = 'neutral',
}

@Entity('stock_movements')
@Index(['inventoryItemId', 'movementType'])
@Index(['movementDate', 'status'])
@Index(['fromLocationId', 'toLocationId'])
@Index(['referenceType', 'referenceNumber'])
@Index(['createdAt', 'updatedAt'])
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, nullable: true })
  movementNumber: string;

  @Column('uuid')
  inventoryItemId: string;

  @Column({
    type: 'enum',
    enum: MovementType,
  })
  @IsNotEmpty()
  movementType: MovementType;

  @Column({
    type: 'enum',
    enum: MovementStatus,
    default: MovementStatus.PENDING,
  })
  status: MovementStatus;

  @Column({
    type: 'enum',
    enum: MovementDirection,
  })
  @IsNotEmpty()
  direction: MovementDirection;

  // Quantity and Cost Information
  @Column({ type: 'decimal', precision: 15, scale: 3 })
  @IsNotEmpty()
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  @Min(0)
  unitCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @Min(0)
  totalCost: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  // Location Information
  @Column('uuid', { nullable: true })
  fromLocationId: string;

  @Column('uuid', { nullable: true })
  toLocationId: string;

  @Column({ length: 100, nullable: true })
  fromBin: string;

  @Column({ length: 100, nullable: true })
  toBin: string;

  // Timing Information
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  movementDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  executionDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  approvalDate: Date;

  // Reference Information
  @Column({ length: 100, nullable: true })
  referenceType: string; // PO, SO, WO, etc.

  @Column({ length: 100, nullable: true })
  referenceNumber: string;

  @Column({ length: 100, nullable: true })
  referenceLineNumber: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  // Batch and Serial Tracking
  @Column({ length: 100, nullable: true })
  batchNumber: string;

  @Column({ length: 100, nullable: true })
  serialNumber: string;

  @Column({ length: 100, nullable: true })
  lotNumber: string;

  @Column({ type: 'timestamp', nullable: true })
  expiryDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  manufacturingDate: Date;

  // Quality Information
  @Column({ default: false })
  qualityInspectionRequired: boolean;

  @Column({ length: 100, nullable: true })
  qualityStatus: string;

  @Column({ length: 255, nullable: true })
  qualityInspector: string;

  @Column({ type: 'timestamp', nullable: true })
  qualityInspectionDate: Date;

  @Column({ type: 'json', nullable: true })
  qualityResults: Array<{
    parameter: string;
    value: string;
    unit: string;
    result: 'pass' | 'fail' | 'marginal';
    notes: string;
  }>;

  // Approval Workflow
  @Column({ type: 'json', nullable: true })
  approvalWorkflow: Array<{
    level: number;
    approver: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp: Date;
    comments: string;
  }>;

  @Column({ length: 50, nullable: true })
  requiredApprovalLevel: string;

  @Column({ length: 50, nullable: true })
  currentApprovalLevel: string;

  // Physical Movement Details
  @Column({ type: 'json', nullable: true })
  physicalMovementDetails: {
    handledBy: string;
    equipmentUsed: string;
    containerType: string;
    containerNumber: string;
    palletNumber: string;
    truckNumber: string;
    driverName: string;
    transportCompany: string;
    vehicleLicensePlate: string;
  };

  // Digital Tracking and IoT
  @Column({ type: 'json', nullable: true })
  digitalTracking: {
    rfidTagsRead: string[];
    barcodeScanned: string;
    gpsCoordinates: {
      latitude: number;
      longitude: number;
      timestamp: Date;
    };
    temperatureLog: Array<{
      temperature: number;
      timestamp: Date;
      sensorId: string;
    }>;
    humidityLog: Array<{
      humidity: number;
      timestamp: Date;
      sensorId: string;
    }>;
  };

  // AI-Enhanced Analytics
  @Column({ type: 'json', nullable: true })
  aiAnalytics: {
    movementPrediction: {
      predictedDuration: number; // minutes
      confidenceLevel: number;
      factors: string[];
    };
    anomalyDetection: {
      isAnomalous: boolean;
      anomalyScore: number;
      anomalyReason: string[];
    };
    costAnalysis: {
      estimatedCost: number;
      actualCost: number;
      variance: number;
      costDrivers: string[];
    };
    efficiencyMetrics: {
      processingTime: number;
      handlingTime: number;
      waitTime: number;
      travelTime: number;
      efficiency: number;
    };
  };

  // Integration with External Systems
  @Column({ type: 'json', nullable: true })
  externalSystemIntegration: {
    erpTransactionId: string;
    wmsTransactionId: string;
    rfidSystemId: string;
    blockchainTransactionHash: string;
    syncStatus: 'pending' | 'synced' | 'failed';
    lastSyncTimestamp: Date;
  };

  // Financial Impact
  @Column({ type: 'json', nullable: true })
  financialImpact: {
    inventoryValue: number;
    cogsImpact: number;
    writeOffAmount: number;
    insuranceClaim: number;
    taxImplications: {
      taxableAmount: number;
      taxRate: number;
      taxAmount: number;
    };
  };

  // Environmental Impact
  @Column({ type: 'json', nullable: true })
  environmentalImpact: {
    carbonFootprint: number;
    energyConsumption: number;
    wasteGenerated: number;
    recyclabilityScore: number;
    sustainabilityRating: number;
  };

  // Exception Handling
  @Column({ type: 'json', nullable: true })
  exceptions: Array<{
    exceptionId: string;
    type: 'quantity_mismatch' | 'location_error' | 'damage' | 'quality_issue' | 'system_error';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    detectedAt: Date;
    resolvedAt: Date;
    resolution: string;
    resolutionBy: string;
  }>;

  // Performance Metrics
  @Column({ type: 'json', nullable: true })
  performanceMetrics: {
    plannedVsActualTime: number;
    accuracy: number;
    handlingEfficiency: number;
    costEfficiency: number;
    qualityScore: number;
    customerSatisfactionImpact: number;
  };

  // Regulatory and Compliance
  @Column({ type: 'json', nullable: true })
  complianceData: {
    regulatoryRequirements: string[];
    complianceStatus: 'compliant' | 'non_compliant' | 'pending';
    auditTrail: Array<{
      auditor: string;
      timestamp: Date;
      findings: string[];
      recommendations: string[];
    }>;
    certifications: string[];
  };

  // Chain of Custody
  @Column({ type: 'json', nullable: true })
  chainOfCustody: Array<{
    custodian: string;
    receivedAt: Date;
    releasedAt: Date;
    condition: string;
    digitalSignature: string;
    witnesses: string[];
  }>;

  // Related Movements
  @Column('uuid', { nullable: true })
  parentMovementId: string;

  @Column('uuid', { nullable: true })
  reversalMovementId: string;

  @Column({ type: 'json', nullable: true })
  childMovementIds: string[];

  @Column({ default: false })
  isReversed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  reversalDate: Date;

  @Column({ length: 255, nullable: true })
  reversalReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 50, nullable: true })
  createdBy: string;

  @Column({ length: 50, nullable: true })
  executedBy: string;

  @Column({ length: 50, nullable: true })
  approvedBy: string;

  @Column({ length: 50, nullable: true })
  updatedBy: string;

  // Relationships
  @ManyToOne(() => InventoryItem, (item) => item.stockMovements)
  @JoinColumn({ name: 'inventoryItemId' })
  inventoryItem: InventoryItem;

  @ManyToOne(() => InventoryLocation, { nullable: true })
  @JoinColumn({ name: 'fromLocationId' })
  fromLocation: InventoryLocation;

  @ManyToOne(() => InventoryLocation, { nullable: true })
  @JoinColumn({ name: 'toLocationId' })
  toLocation: InventoryLocation;

  @ManyToOne(() => StockMovement, { nullable: true })
  @JoinColumn({ name: 'parentMovementId' })
  parentMovement: StockMovement;

  @ManyToOne(() => StockMovement, { nullable: true })
  @JoinColumn({ name: 'reversalMovementId' })
  reversalMovement: StockMovement;

  // Computed Properties
  get isInbound(): boolean {
    return this.direction === MovementDirection.IN;
  }

  get isOutbound(): boolean {
    return this.direction === MovementDirection.OUT;
  }

  get signedQuantity(): number {
    return this.direction === MovementDirection.IN ? this.quantity : -this.quantity;
  }

  get isPending(): boolean {
    return this.status === MovementStatus.PENDING;
  }

  get isExecuted(): boolean {
    return this.status === MovementStatus.EXECUTED;
  }

  get requiresApproval(): boolean {
    return !!this.requiredApprovalLevel && this.status === MovementStatus.PENDING;
  }

  get hasExceptions(): boolean {
    return !!(this.exceptions && this.exceptions.length > 0);
  }

  get hasUnresolvedExceptions(): boolean {
    return !!(this.exceptions && this.exceptions.some(e => !e.resolvedAt));
  }

  get processingDuration(): number {
    if (!this.executionDate) return 0;
    return this.executionDate.getTime() - this.createdAt.getTime();
  }

  get isOverdue(): boolean {
    if (!this.scheduledDate || this.status === MovementStatus.EXECUTED) return false;
    return new Date() > this.scheduledDate;
  }

  // Methods
  updateStatus(newStatus: MovementStatus, updatedBy: string, reason?: string): void {
    this.status = newStatus;
    this.updatedBy = updatedBy;
    
    if (newStatus === MovementStatus.EXECUTED) {
      this.executionDate = new Date();
      this.executedBy = updatedBy;
    }
    
    if (reason && this.comments) {
      this.comments += `\n${new Date().toISOString()}: Status changed to ${newStatus} by ${updatedBy}. Reason: ${reason}`;
    }
  }

  addApprovalStep(approver: string, status: 'approved' | 'rejected', comments?: string): void {
    if (!this.approvalWorkflow) {
      this.approvalWorkflow = [];
    }
    
    this.approvalWorkflow.push({
      level: this.approvalWorkflow.length + 1,
      approver,
      status,
      timestamp: new Date(),
      comments: comments || '',
    });
    
    if (status === 'approved') {
      this.approvedBy = approver;
      this.approvalDate = new Date();
    }
  }

  addException(
    type: 'quantity_mismatch' | 'location_error' | 'damage' | 'quality_issue' | 'system_error',
    severity: 'low' | 'medium' | 'high' | 'critical',
    description: string
  ): void {
    if (!this.exceptions) {
      this.exceptions = [];
    }
    
    this.exceptions.push({
      exceptionId: `EX-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      severity,
      description,
      detectedAt: new Date(),
      resolvedAt: null,
      resolution: '',
      resolutionBy: '',
    });
  }

  resolveException(exceptionId: string, resolution: string, resolvedBy: string): void {
    if (!this.exceptions) return;
    
    const exception = this.exceptions.find(e => e.exceptionId === exceptionId);
    if (exception) {
      exception.resolvedAt = new Date();
      exception.resolution = resolution;
      exception.resolutionBy = resolvedBy;
    }
  }

  addQualityResult(parameter: string, value: string, unit: string, result: 'pass' | 'fail' | 'marginal', notes?: string): void {
    if (!this.qualityResults) {
      this.qualityResults = [];
    }
    
    this.qualityResults.push({
      parameter,
      value,
      unit,
      result,
      notes: notes || '',
    });
  }

  calculateTotalCost(): void {
    this.totalCost = this.quantity * this.unitCost;
  }

  generateMovementNumber(): string {
    const typePrefix = this.movementType.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-8);
    this.movementNumber = `${typePrefix}-${timestamp}`;
    return this.movementNumber;
  }

  reverse(reversalReason: string, reversedBy: string): StockMovement {
    // Create a reversal movement
    const reversalMovement = new StockMovement();
    
    // Copy basic properties but reverse the direction and quantities
    reversalMovement.inventoryItemId = this.inventoryItemId;
    reversalMovement.movementType = this.movementType;
    reversalMovement.direction = this.direction === MovementDirection.IN ? MovementDirection.OUT : MovementDirection.IN;
    reversalMovement.quantity = this.quantity;
    reversalMovement.unitCost = this.unitCost;
    reversalMovement.totalCost = this.totalCost;
    
    // Swap locations
    reversalMovement.fromLocationId = this.toLocationId;
    reversalMovement.toLocationId = this.fromLocationId;
    reversalMovement.fromBin = this.toBin;
    reversalMovement.toBin = this.fromBin;
    
    // Set reversal properties
    reversalMovement.parentMovementId = this.id;
    reversalMovement.reason = reversalReason;
    reversalMovement.createdBy = reversedBy;
    
    // Mark this movement as reversed
    this.isReversed = true;
    this.reversalDate = new Date();
    this.reversalReason = reversalReason;
    this.reversalMovementId = reversalMovement.id;
    
    return reversalMovement;
  }

  addToChainOfCustody(custodian: string, condition: string, witnesses: string[] = []): void {
    if (!this.chainOfCustody) {
      this.chainOfCustody = [];
    }
    
    // Release from previous custodian
    if (this.chainOfCustody.length > 0) {
      const lastCustody = this.chainOfCustody[this.chainOfCustody.length - 1];
      if (!lastCustody.releasedAt) {
        lastCustody.releasedAt = new Date();
      }
    }
    
    // Add new custodian
    this.chainOfCustody.push({
      custodian,
      receivedAt: new Date(),
      releasedAt: null,
      condition,
      digitalSignature: `SIG-${Date.now()}-${custodian}`,
      witnesses,
    });
  }
}
