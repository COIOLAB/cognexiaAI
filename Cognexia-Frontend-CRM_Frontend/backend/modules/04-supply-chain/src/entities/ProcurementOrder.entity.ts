import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { IsNotEmpty, IsPositive, Min, Max } from 'class-validator';
import { Supplier } from './Supplier.entity';
import { ProcurementOrderItem } from './ProcurementOrderItem.entity';
import { BlockchainTransaction } from './BlockchainTransaction.entity';

export enum OrderStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SENT_TO_SUPPLIER = 'sent_to_supplier',
  ACKNOWLEDGED = 'acknowledged',
  IN_PRODUCTION = 'in_production',
  READY_TO_SHIP = 'ready_to_ship',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  PARTIALLY_DELIVERED = 'partially_delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
  ON_HOLD = 'on_hold',
}

export enum OrderPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  EMERGENCY = 'emergency',
}

export enum DeliveryMethod {
  STANDARD = 'standard',
  EXPRESS = 'express',
  OVERNIGHT = 'overnight',
  SAME_DAY = 'same_day',
  PICKUP = 'pickup',
  DROP_SHIPPING = 'drop_shipping',
}

@Entity('procurement_orders')
@Index(['orderNumber'], { unique: true })
@Index(['status', 'priority'])
@Index(['requestedDeliveryDate', 'actualDeliveryDate'])
@Index(['supplierId', 'status'])
@Index(['createdAt', 'updatedAt'])
export class ProcurementOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @IsNotEmpty()
  orderNumber: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.DRAFT,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: OrderPriority,
    default: OrderPriority.NORMAL,
  })
  priority: OrderPriority;

  // Supplier Information
  @Column('uuid')
  supplierId: string;

  @Column({ length: 100, nullable: true })
  supplierOrderNumber: string;

  @Column({ length: 100, nullable: true })
  supplierQuoteNumber: string;

  // Financial Information
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @Min(0)
  subtotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @Min(0)
  taxAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @Min(0)
  shippingCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @Min(0)
  discountAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @Min(0)
  totalAmount: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 1 })
  @IsPositive()
  exchangeRate: number;

  // Delivery Information
  @Column({
    type: 'enum',
    enum: DeliveryMethod,
    default: DeliveryMethod.STANDARD,
  })
  deliveryMethod: DeliveryMethod;

  @Column({ type: 'timestamp', nullable: true })
  requestedDeliveryDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  promisedDeliveryDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualDeliveryDate: Date;

  @Column({ type: 'json', nullable: true })
  deliveryAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    contactPerson: string;
    contactPhone: string;
    instructions: string;
  };

  // Shipping and Tracking
  @Column({ type: 'json', nullable: true })
  shippingDetails: {
    carrier: string;
    service: string;
    trackingNumber: string;
    packageCount: number;
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    estimatedDelivery: Date;
    actualDelivery: Date;
  };

  // Terms and Conditions
  @Column({ type: 'text', nullable: true })
  paymentTerms: string;

  @Column({ type: 'text', nullable: true })
  deliveryTerms: string;

  @Column({ type: 'text', nullable: true })
  specialInstructions: string;

  @Column({ type: 'json', nullable: true })
  termsAndConditions: string[];

  // Quality and Inspection
  @Column({ default: false })
  requiresInspection: boolean;

  @Column({ type: 'json', nullable: true })
  qualityRequirements: Array<{
    parameter: string;
    requirement: string;
    testMethod: string;
    acceptanceCriteria: string;
  }>;

  @Column({ type: 'json', nullable: true })
  inspectionResults: Array<{
    parameter: string;
    actualValue: string;
    result: 'pass' | 'fail';
    inspector: string;
    inspectionDate: Date;
    notes: string;
  }>;

  // AI-Enhanced Features
  @Column({ type: 'json', nullable: true })
  aiOptimization: {
    recommendedSupplier: string;
    priceOptimization: {
      suggestedPrice: number;
      potentialSavings: number;
      marketBenchmark: number;
    };
    deliveryOptimization: {
      suggestedDeliveryDate: Date;
      alternativeOptions: Array<{
        deliveryDate: Date;
        cost: number;
        reliability: number;
      }>;
    };
    riskAssessment: {
      overallRisk: 'low' | 'medium' | 'high';
      riskFactors: string[];
      mitigationStrategies: string[];
    };
    demandForecast: {
      predictedDemand: number;
      confidenceLevel: number;
      seasonalFactors: number[];
    };
  };

  // Blockchain Integration
  @Column({ type: 'json', nullable: true })
  blockchainData: {
    transactionHash: string;
    smartContractAddress: string;
    blockNumber: number;
    confirmations: number;
    verificationStatus: 'verified' | 'pending' | 'failed';
    digitalSignature: string;
    timestampProof: Date;
  };

  // IoT Integration
  @Column({ type: 'json', nullable: true })
  iotTracking: Array<{
    deviceId: string;
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    timestamp: Date;
    conditions: {
      temperature: number;
      humidity: number;
      shock: number;
      tilt: number;
    };
    alerts: string[];
  }>;

  // Performance Metrics
  @Column({ type: 'json', nullable: true })
  performanceMetrics: {
    onTimeDelivery: boolean;
    qualityScore: number;
    costVariance: number;
    supplierRating: number;
    customerSatisfaction: number;
  };

  // Workflow and Approval
  @Column({ type: 'json', nullable: true })
  approvalWorkflow: Array<{
    step: number;
    approver: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp: Date;
    comments: string;
  }>;

  @Column({ length: 50, nullable: true })
  requestedBy: string;

  @Column({ length: 50, nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  // Communication History
  @Column({ type: 'json', nullable: true })
  communications: Array<{
    id: string;
    type: 'email' | 'call' | 'message' | 'system';
    direction: 'inbound' | 'outbound';
    from: string;
    to: string;
    subject: string;
    content: string;
    timestamp: Date;
    attachments: string[];
  }>;

  // Document Management
  @Column({ type: 'json', nullable: true })
  documents: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedBy: string;
    uploadedAt: Date;
    version: number;
  }>;

  // Environmental Impact
  @Column({ type: 'json', nullable: true })
  environmentalImpact: {
    carbonFootprint: number;
    recyclableContent: number;
    sustainabilityScore: number;
    wasteGenerated: number;
    energyConsumption: number;
  };

  // Emergency and Contingency
  @Column({ type: 'json', nullable: true })
  contingencyPlan: {
    alternativeSuppliers: string[];
    escalationProcedure: string[];
    emergencyContacts: Array<{
      name: string;
      role: string;
      phone: string;
      email: string;
    }>;
  };

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
  @ManyToOne(() => Supplier, (supplier) => supplier.procurementOrders)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @OneToMany(() => ProcurementOrderItem, (item) => item.procurementOrder)
  items: ProcurementOrderItem[];

  @OneToMany(() => BlockchainTransaction, (transaction) => transaction.procurementOrder)
  blockchainTransactions: BlockchainTransaction[];

  // Computed Properties
  get isOverdue(): boolean {
    if (!this.requestedDeliveryDate) return false;
    return new Date() > this.requestedDeliveryDate && this.status !== OrderStatus.COMPLETED;
  }

  get daysUntilDelivery(): number {
    if (!this.requestedDeliveryDate) return 0;
    const today = new Date();
    const deliveryDate = new Date(this.requestedDeliveryDate);
    const diffTime = deliveryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get completionPercentage(): number {
    const statusWeights = {
      [OrderStatus.DRAFT]: 0,
      [OrderStatus.PENDING_APPROVAL]: 10,
      [OrderStatus.APPROVED]: 20,
      [OrderStatus.SENT_TO_SUPPLIER]: 30,
      [OrderStatus.ACKNOWLEDGED]: 40,
      [OrderStatus.IN_PRODUCTION]: 50,
      [OrderStatus.READY_TO_SHIP]: 70,
      [OrderStatus.SHIPPED]: 80,
      [OrderStatus.IN_TRANSIT]: 85,
      [OrderStatus.DELIVERED]: 95,
      [OrderStatus.COMPLETED]: 100,
      [OrderStatus.CANCELLED]: 0,
      [OrderStatus.REJECTED]: 0,
    };
    return statusWeights[this.status] || 0;
  }

  // Methods
  updateStatus(newStatus: OrderStatus, updatedBy: string, notes?: string): void {
    const previousStatus = this.status;
    this.status = newStatus;
    this.updatedBy = updatedBy;
    
    // Add communication record for status change
    if (!this.communications) {
      this.communications = [];
    }
    
    this.communications.push({
      id: `status_change_${Date.now()}`,
      type: 'system',
      direction: 'outbound',
      from: 'system',
      to: updatedBy,
      subject: `Order ${this.orderNumber} Status Changed`,
      content: `Status changed from ${previousStatus} to ${newStatus}. ${notes || ''}`,
      timestamp: new Date(),
      attachments: [],
    });
  }

  calculateTotal(): void {
    this.totalAmount = this.subtotal + this.taxAmount + this.shippingCost - this.discountAmount;
  }

  addDocument(document: any): void {
    if (!this.documents) {
      this.documents = [];
    }
    this.documents.push(document);
  }

  isEditable(): boolean {
    return [OrderStatus.DRAFT, OrderStatus.PENDING_APPROVAL].includes(this.status);
  }
}
