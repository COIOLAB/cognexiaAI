// Industry 5.0 ERP Backend - Supply Chain Module
// InventoryTransaction Entity - Comprehensive inventory transaction tracking with blockchain integration
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { InventoryItem } from './InventoryItem';
import { Warehouse } from './Warehouse';
import { SupplierNetwork } from './SupplierNetwork';

export enum TransactionType {
  RECEIPT = 'receipt',                    // Goods received from supplier
  ISSUE = 'issue',                       // Goods issued for production/sale
  TRANSFER_IN = 'transfer_in',           // Transfer from another location
  TRANSFER_OUT = 'transfer_out',         // Transfer to another location
  ADJUSTMENT_POSITIVE = 'adjustment_positive', // Positive inventory adjustment
  ADJUSTMENT_NEGATIVE = 'adjustment_negative', // Negative inventory adjustment
  PRODUCTION_RECEIPT = 'production_receipt',   // Finished goods from production
  PRODUCTION_ISSUE = 'production_issue',       // Raw materials to production
  RETURN_FROM_CUSTOMER = 'return_from_customer', // Customer return
  RETURN_TO_SUPPLIER = 'return_to_supplier',     // Return to supplier
  DAMAGE_WRITE_OFF = 'damage_write_off',         // Damaged goods write-off
  EXPIRY_WRITE_OFF = 'expiry_write_off',         // Expired goods write-off
  CYCLE_COUNT = 'cycle_count',                   // Cycle count adjustment
  PHYSICAL_COUNT = 'physical_count',             // Physical inventory count
  REVALUATION = 'revaluation',                   // Cost revaluation
  QUARANTINE_IN = 'quarantine_in',               // Move to quarantine
  QUARANTINE_OUT = 'quarantine_out'              // Release from quarantine
}

export enum TransactionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
  REVERSED = 'reversed'
}

export enum TransactionReason {
  PROCUREMENT = 'procurement',
  SALES_ORDER = 'sales_order',
  PRODUCTION_ORDER = 'production_order',
  MAINTENANCE = 'maintenance',
  QUALITY_CONTROL = 'quality_control',
  CYCLE_COUNT = 'cycle_count',
  DAMAGE = 'damage',
  EXPIRY = 'expiry',
  THEFT = 'theft',
  LOSS = 'loss',
  CUSTOMER_RETURN = 'customer_return',
  SUPPLIER_RETURN = 'supplier_return',
  LOCATION_TRANSFER = 'location_transfer',
  REBALANCING = 'rebalancing',
  CORRECTION = 'correction',
  OTHER = 'other'
}

@Entity('inventory_transactions')
@Index(['transactionDate'])
@Index(['inventoryItemId', 'transactionType'])
@Index(['warehouseId', 'transactionDate'])
@Index(['status', 'type'])
@Index(['referenceNumber'])
export class InventoryTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @Index()
  transactionNumber: string;

  @Column({
    type: 'enum',
    enum: TransactionType
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING
  })
  status: TransactionStatus;

  @Column({
    type: 'enum',
    enum: TransactionReason,
    default: TransactionReason.OTHER
  })
  reason: TransactionReason;

  // Item and Location References
  @Column({ type: 'uuid' })
  inventoryItemId: string;

  @ManyToOne(() => InventoryItem, item => item.transactions)
  @JoinColumn({ name: 'inventoryItemId' })
  inventoryItem: InventoryItem;

  @Column({ type: 'uuid' })
  warehouseId: string;

  @ManyToOne(() => Warehouse, warehouse => warehouse.operations)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  // Location Details
  @Column({ length: 50, nullable: true })
  fromLocation: string;

  @Column({ length: 50, nullable: true })
  toLocation: string;

  @Column({ length: 50, nullable: true })
  zone: string;

  @Column({ length: 50, nullable: true })
  aisle: string;

  @Column({ length: 50, nullable: true })
  rack: string;

  @Column({ length: 50, nullable: true })
  shelf: string;

  @Column({ length: 50, nullable: true })
  bin: string;

  // Transaction Quantities
  @Column({ type: 'decimal', precision: 12, scale: 3 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  quantityBefore: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  quantityAfter: number;

  @Column({ length: 20 })
  unit: string;

  // Financial Information
  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  unitCost: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  totalCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  averageCostBefore: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  averageCostAfter: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  // Reference Information
  @Column({ length: 100, nullable: true })
  referenceNumber: string;

  @Column({ length: 50, nullable: true })
  referenceType: string; // PO, SO, WO, etc.

  @Column({ type: 'uuid', nullable: true })
  referenceId: string;

  @Column({ type: 'uuid', nullable: true })
  supplierId: string;

  @ManyToOne(() => SupplierNetwork, supplier => supplier.shipments)
  @JoinColumn({ name: 'supplierId' })
  supplier: SupplierNetwork;

  // Transaction Details
  @Column({ type: 'timestamp' })
  transactionDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  expectedDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedDate: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Quality Information
  @Column({ type: 'json', nullable: true })
  qualityData: {
    inspectionRequired?: boolean;
    inspectionStatus?: 'pending' | 'passed' | 'failed' | 'quarantined';
    qualityGrade?: string;
    defectCount?: number;
    defectType?: string[];
    qualityScore?: number;
    inspector?: string;
    inspectionDate?: Date;
    qualityNotes?: string;
    certifications?: string[];
  };

  // Lot and Serial Tracking
  @Column({ type: 'json', nullable: true })
  trackingData: {
    lotNumber?: string;
    serialNumbers?: string[];
    batchNumber?: string;
    expirationDate?: Date;
    manufacturingDate?: Date;
    countryOfOrigin?: string;
    traceabilityCode?: string;
  };

  // IoT and Technology Integration
  @Column({ type: 'json', nullable: true })
  iotData: {
    rfidReads?: {
      tagId: string;
      timestamp: Date;
      location: string;
      signalStrength?: number;
    }[];
    barcodeScans?: {
      barcode: string;
      timestamp: Date;
      scanner: string;
      location: string;
    }[];
    sensorReadings?: {
      sensorId: string;
      timestamp: Date;
      temperature?: number;
      humidity?: number;
      location?: string;
    }[];
    gpsCoordinates?: {
      latitude: number;
      longitude: number;
      timestamp: Date;
      accuracy?: number;
    }[];
  };

  // Blockchain and Security
  @Column({ type: 'json', nullable: true })
  blockchainData: {
    transactionHash?: string;
    blockNumber?: number;
    blockchainNetwork?: string;
    smartContractAddress?: string;
    gasUsed?: number;
    digitalSignature?: string;
    immutableRecord?: boolean;
    verificationStatus?: 'verified' | 'pending' | 'failed';
  };

  // User and System Information
  @Column({ length: 100 })
  performedBy: string;

  @Column({ length: 100, nullable: true })
  authorizedBy: string;

  @Column({ length: 50, nullable: true })
  deviceId: string;

  @Column({ length: 100, nullable: true })
  workstation: string;

  @Column({ length: 50, nullable: true })
  applicationName: string;

  @Column({ length: 20, nullable: true })
  applicationVersion: string;

  // Reversal Information
  @Column({ type: 'uuid', nullable: true })
  reversedTransactionId: string;

  @Column({ type: 'uuid', nullable: true })
  reversalTransactionId: string;

  @Column({ type: 'timestamp', nullable: true })
  reversalDate: Date;

  @Column({ length: 100, nullable: true })
  reversedBy: string;

  @Column({ type: 'text', nullable: true })
  reversalReason: string;

  // Workflow and Approval
  @Column({ type: 'json', nullable: true })
  approvalData: {
    requiresApproval?: boolean;
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    approvedDate?: Date;
    approvalComments?: string;
    approvalWorkflow?: string;
    approvalLevel?: number;
  };

  // AI and Analytics
  @Column({ type: 'json', nullable: true })
  aiAnalytics: {
    anomalyDetected?: boolean;
    anomalyScore?: number;
    anomalyType?: string[];
    riskScore?: number;
    fraudProbability?: number;
    recommendedActions?: string[];
    patternMatching?: {
      similarTransactions: number;
      averageQuantity: number;
      averageCost: number;
      frequency: string;
    };
    forecastImpact?: {
      demandImpact: number;
      inventoryImpact: number;
      costImpact: number;
    };
  };

  // Audit fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Business Methods
  isCompleted(): boolean {
    return this.status === TransactionStatus.COMPLETED;
  }

  isPending(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  canBeReversed(): boolean {
    return this.isCompleted() && 
           !this.reversedTransactionId && 
           this.type !== TransactionType.PHYSICAL_COUNT;
  }

  isReceiptType(): boolean {
    return [
      TransactionType.RECEIPT,
      TransactionType.TRANSFER_IN,
      TransactionType.ADJUSTMENT_POSITIVE,
      TransactionType.PRODUCTION_RECEIPT,
      TransactionType.RETURN_FROM_CUSTOMER,
      TransactionType.QUARANTINE_OUT
    ].includes(this.type);
  }

  isIssueType(): boolean {
    return [
      TransactionType.ISSUE,
      TransactionType.TRANSFER_OUT,
      TransactionType.ADJUSTMENT_NEGATIVE,
      TransactionType.PRODUCTION_ISSUE,
      TransactionType.RETURN_TO_SUPPLIER,
      TransactionType.DAMAGE_WRITE_OFF,
      TransactionType.EXPIRY_WRITE_OFF,
      TransactionType.QUARANTINE_IN
    ].includes(this.type);
  }

  calculateQuantityChange(): number {
    return this.isReceiptType() ? Math.abs(this.quantity) : -Math.abs(this.quantity);
  }

  calculateValueChange(): number {
    const quantityChange = this.calculateQuantityChange();
    return quantityChange * this.unitCost;
  }

  requiresQualityInspection(): boolean {
    return this.qualityData?.inspectionRequired || false;
  }

  isQualityApproved(): boolean {
    return this.qualityData?.inspectionStatus === 'passed';
  }

  hasBlockchainVerification(): boolean {
    return this.blockchainData?.verificationStatus === 'verified';
  }

  requiresApproval(): boolean {
    return this.approvalData?.requiresApproval || false;
  }

  isApproved(): boolean {
    return this.approvalData?.approvalStatus === 'approved';
  }

  getLocationPath(): string {
    const parts = [this.zone, this.aisle, this.rack, this.shelf, this.bin].filter(Boolean);
    return parts.length > 0 ? parts.join('-') : 'UNKNOWN';
  }

  getDaysSinceTransaction(): number {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - this.transactionDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isOverdue(): boolean {
    if (!this.expectedDate || this.isCompleted()) return false;
    return new Date() > this.expectedDate;
  }

  hasAnomalyDetected(): boolean {
    return this.aiAnalytics?.anomalyDetected || false;
  }

  getRiskLevel(): 'low' | 'medium' | 'high' | 'critical' {
    const riskScore = this.aiAnalytics?.riskScore || 0;
    
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  updateStatus(status: TransactionStatus, updatedBy: string): void {
    this.status = status;
    this.updatedAt = new Date();
    
    if (status === TransactionStatus.COMPLETED) {
      this.completedDate = new Date();
    }
  }

  addQualityData(qualityData: Partial<InventoryTransaction['qualityData']>): void {
    this.qualityData = { ...this.qualityData, ...qualityData };
  }

  addIoTReading(type: string, data: any): void {
    if (!this.iotData) this.iotData = {};
    
    switch (type) {
      case 'rfid':
        this.iotData.rfidReads = this.iotData.rfidReads || [];
        this.iotData.rfidReads.push(data);
        break;
      case 'barcode':
        this.iotData.barcodeScans = this.iotData.barcodeScans || [];
        this.iotData.barcodeScans.push(data);
        break;
      case 'sensor':
        this.iotData.sensorReadings = this.iotData.sensorReadings || [];
        this.iotData.sensorReadings.push(data);
        break;
      case 'gps':
        this.iotData.gpsCoordinates = this.iotData.gpsCoordinates || [];
        this.iotData.gpsCoordinates.push(data);
        break;
    }
  }

  setBlockchainVerification(transactionHash: string, blockNumber: number): void {
    this.blockchainData = {
      ...this.blockchainData,
      transactionHash,
      blockNumber,
      verificationStatus: 'verified',
      immutableRecord: true
    };
  }

  approve(approvedBy: string, comments?: string): void {
    this.approvalData = {
      ...this.approvalData,
      approvalStatus: 'approved',
      approvedBy,
      approvedDate: new Date(),
      approvalComments: comments
    };
  }

  reject(rejectedBy: string, reason: string): void {
    this.approvalData = {
      ...this.approvalData,
      approvalStatus: 'rejected',
      approvedBy: rejectedBy,
      approvedDate: new Date(),
      approvalComments: reason
    };
    this.status = TransactionStatus.CANCELLED;
  }
}
