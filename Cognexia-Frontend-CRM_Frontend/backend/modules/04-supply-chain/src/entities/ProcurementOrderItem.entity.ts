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
import { IsNotEmpty, IsPositive, Min } from 'class-validator';
import { ProcurementOrder } from './ProcurementOrder.entity';

export enum ItemStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PRODUCTION = 'in_production',
  READY_TO_SHIP = 'ready_to_ship',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  RECEIVED = 'received',
  INSPECTED = 'inspected',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Entity('procurement_order_items')
@Index(['procurementOrderId', 'lineNumber'])
@Index(['productCode', 'status'])
@Index(['requestedDeliveryDate'])
export class ProcurementOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  procurementOrderId: string;

  @Column({ type: 'int' })
  @IsPositive()
  lineNumber: number;

  @Column({ length: 100 })
  @IsNotEmpty()
  productCode: string;

  @Column({ length: 200 })
  @IsNotEmpty()
  productName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ItemStatus,
    default: ItemStatus.PENDING,
  })
  status: ItemStatus;

  // Quantity Information
  @Column({ type: 'decimal', precision: 15, scale: 3 })
  @IsPositive()
  orderedQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  @Min(0)
  receivedQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  @Min(0)
  acceptedQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  @Min(0)
  rejectedQuantity: number;

  @Column({ length: 20 })
  @IsNotEmpty()
  unit: string;

  // Pricing Information
  @Column({ type: 'decimal', precision: 15, scale: 4 })
  @IsPositive()
  unitPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  @Min(0)
  totalPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @Min(0)
  discountPercentage: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @Min(0)
  discountAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  @Min(0)
  netAmount: number;

  // Delivery Information
  @Column({ type: 'timestamp', nullable: true })
  requestedDeliveryDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  promisedDeliveryDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualDeliveryDate: Date;

  @Column({ type: 'int', nullable: true })
  leadTimeDays: number;

  // Product Specifications
  @Column({ type: 'json', nullable: true })
  specifications: Array<{
    parameter: string;
    value: string;
    unit: string;
    tolerance: string;
    criticalParameter: boolean;
  }>;

  @Column({ type: 'json', nullable: true })
  technicalDrawings: Array<{
    name: string;
    version: string;
    url: string;
    type: 'drawing' | 'specification' | 'datasheet';
  }>;

  // Quality Requirements
  @Column({ type: 'json', nullable: true })
  qualityStandards: Array<{
    standard: string;
    version: string;
    requirement: string;
    testMethod: string;
  }>;

  @Column({ type: 'json', nullable: true })
  inspectionCriteria: Array<{
    parameter: string;
    acceptanceLimit: string;
    testMethod: string;
    sampleSize: number;
  }>;

  // Material Information
  @Column({ length: 100, nullable: true })
  materialGrade: string;

  @Column({ type: 'json', nullable: true })
  materialCertificates: Array<{
    type: string;
    certificateNumber: string;
    issuedBy: string;
    issuedDate: Date;
    expiryDate: Date;
  }>;

  // Packaging Requirements
  @Column({ type: 'json', nullable: true })
  packagingRequirements: {
    packagingType: string;
    packagingMaterial: string;
    specialHandling: string[];
    labelingRequirements: string[];
    environmentalConditions: {
      temperatureRange: string;
      humidityRange: string;
      shockProtection: boolean;
    };
  };

  // Tracking and Traceability
  @Column({ type: 'json', nullable: true })
  batchLots: Array<{
    batchNumber: string;
    lotNumber: string;
    quantity: number;
    manufacturingDate: Date;
    expiryDate: Date;
    certificates: string[];
  }>;

  @Column({ type: 'json', nullable: true })
  serialNumbers: string[];

  // AI-Enhanced Features
  @Column({ type: 'json', nullable: true })
  aiInsights: {
    priceAnalysis: {
      marketPrice: number;
      priceDeviation: number;
      priceRecommendation: string;
    };
    qualityPrediction: {
      predictedQuality: number;
      riskFactors: string[];
      recommendedActions: string[];
    };
    deliveryForecast: {
      predictedDelivery: Date;
      confidenceLevel: number;
      riskFactors: string[];
    };
    demandPattern: {
      historicalUsage: number[];
      seasonalityFactor: number;
      forecastDemand: number;
    };
  };

  // Sustainability Information
  @Column({ type: 'json', nullable: true })
  sustainabilityData: {
    carbonFootprint: number;
    recyclableContent: number;
    recyclability: number;
    conflictMinerals: boolean;
    sustainabilityCertifications: string[];
  };

  // Compliance Information
  @Column({ type: 'json', nullable: true })
  complianceData: {
    regulatoryRequirements: string[];
    complianceStatus: 'compliant' | 'non_compliant' | 'pending';
    certifications: string[];
    restrictedSubstances: Array<{
      substance: string;
      limit: number;
      unit: string;
      actualValue: number;
    }>;
  };

  // Alternative Items
  @Column({ type: 'json', nullable: true })
  alternativeItems: Array<{
    productCode: string;
    productName: string;
    supplier: string;
    price: number;
    leadTime: number;
    availabilityScore: number;
  }>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 50, nullable: true })
  createdBy: string;

  @Column({ length: 50, nullable: true })
  updatedBy: string;

  // Relationships
  @ManyToOne(() => ProcurementOrder, (order) => order.items)
  @JoinColumn({ name: 'procurementOrderId' })
  procurementOrder: ProcurementOrder;

  // Computed Properties
  get remainingQuantity(): number {
    return this.orderedQuantity - this.receivedQuantity;
  }

  get isFullyReceived(): boolean {
    return this.receivedQuantity >= this.orderedQuantity;
  }

  get receivedPercentage(): number {
    return this.orderedQuantity > 0 ? (this.receivedQuantity / this.orderedQuantity) * 100 : 0;
  }

  get acceptanceRate(): number {
    return this.receivedQuantity > 0 ? (this.acceptedQuantity / this.receivedQuantity) * 100 : 0;
  }

  get isOverdue(): boolean {
    if (!this.requestedDeliveryDate) return false;
    return new Date() > this.requestedDeliveryDate && this.status !== ItemStatus.RECEIVED;
  }

  // Methods
  updateStatus(newStatus: ItemStatus, updatedBy: string): void {
    this.status = newStatus;
    this.updatedBy = updatedBy;
  }

  receiveQuantity(quantity: number, receivedBy: string): void {
    this.receivedQuantity += quantity;
    this.updatedBy = receivedBy;
    
    if (this.isFullyReceived) {
      this.status = ItemStatus.RECEIVED;
    }
  }

  acceptQuantity(quantity: number, acceptedBy: string): void {
    if (quantity <= this.receivedQuantity - this.acceptedQuantity) {
      this.acceptedQuantity += quantity;
      this.updatedBy = acceptedBy;
    }
  }

  rejectQuantity(quantity: number, rejectedBy: string, reason?: string): void {
    if (quantity <= this.receivedQuantity - this.acceptedQuantity - this.rejectedQuantity) {
      this.rejectedQuantity += quantity;
      this.updatedBy = rejectedBy;
      
      if (reason && this.notes) {
        this.notes += `\nRejection: ${quantity} units rejected by ${rejectedBy}. Reason: ${reason}`;
      }
    }
  }

  calculateTotalPrice(): void {
    this.totalPrice = this.orderedQuantity * this.unitPrice;
    this.discountAmount = this.totalPrice * (this.discountPercentage / 100);
    this.netAmount = this.totalPrice - this.discountAmount;
  }
}
