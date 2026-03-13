import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BlockchainTransaction, BlockchainNetwork } from './blockchain-transaction.entity';

export enum SupplyChainEventType {
  // Manufacturing Events
  MANUFACTURING_STARTED = 'manufacturing_started',
  MANUFACTURING_COMPLETED = 'manufacturing_completed',
  QUALITY_CONTROL = 'quality_control',
  BATCH_CREATED = 'batch_created',
  
  // Logistics Events
  SHIPMENT_CREATED = 'shipment_created',
  IN_TRANSIT = 'in_transit',
  CUSTOMS_CLEARANCE = 'customs_clearance',
  DELIVERED = 'delivered',
  RECEIVED = 'received',
  
  // Inventory Events
  INVENTORY_RECEIVED = 'inventory_received',
  INVENTORY_MOVED = 'inventory_moved',
  INVENTORY_COUNTED = 'inventory_counted',
  INVENTORY_ADJUSTMENT = 'inventory_adjustment',
  
  // Ownership Events
  OWNERSHIP_TRANSFER = 'ownership_transfer',
  SALE_COMPLETED = 'sale_completed',
  PURCHASE_ORDER = 'purchase_order',
  
  // Certification Events
  CERTIFICATION_ISSUED = 'certification_issued',
  CERTIFICATION_RENEWED = 'certification_renewed',
  CERTIFICATION_REVOKED = 'certification_revoked',
  
  // Compliance Events
  AUDIT_PERFORMED = 'audit_performed',
  COMPLIANCE_CHECK = 'compliance_check',
  REGULATORY_APPROVAL = 'regulatory_approval',
  
  // Lifecycle Events
  PRODUCT_ACTIVATED = 'product_activated',
  MAINTENANCE_PERFORMED = 'maintenance_performed',
  WARRANTY_CLAIM = 'warranty_claim',
  END_OF_LIFE = 'end_of_life',
  RECYCLING = 'recycling',
  
  // Custom Events
  CUSTOM_EVENT = 'custom_event',
}

export enum SupplyChainEventStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  RECORDED = 'recorded',
  VERIFIED = 'verified',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum SupplyChainEventPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
  URGENT = 'urgent',
}

@Entity('supply_chain_events')
@Index(['eventType', 'status'])
@Index(['inventoryItemId', 'eventType'])
@Index(['blockchainTransactionId'])
@Index(['eventTimestamp', 'eventType'])
@Index(['organizationId', 'eventType'])
export class SupplyChainEvent {
  @ApiProperty({ description: 'Unique identifier for the supply chain event' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: SupplyChainEventType, description: 'Type of supply chain event' })
  @Column({ 
    type: 'enum', 
    enum: SupplyChainEventType 
  })
  @Index()
  eventType: SupplyChainEventType;

  @ApiProperty({ description: 'Inventory item ID related to this event' })
  @Column({ type: 'uuid' })
  @Index()
  inventoryItemId: string;

  @ApiProperty({ description: 'Product SKU or identifier' })
  @Column({ type: 'varchar', length: 100 })
  @Index()
  productSku: string;

  @ApiProperty({ description: 'Product batch or lot number' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  batchNumber: string | null;

  @ApiProperty({ description: 'Serial number of the specific item' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  serialNumber: string | null;

  @ApiProperty({ description: 'Organization ID that initiated the event' })
  @Column({ type: 'uuid' })
  @Index()
  organizationId: string;

  @ApiProperty({ description: 'User ID who initiated the event' })
  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId: string | null;

  @ApiProperty({ enum: SupplyChainEventStatus, description: 'Status of the event' })
  @Column({ 
    type: 'enum', 
    enum: SupplyChainEventStatus,
    default: SupplyChainEventStatus.PENDING 
  })
  @Index()
  status: SupplyChainEventStatus;

  @ApiProperty({ enum: SupplyChainEventPriority, description: 'Priority level of the event' })
  @Column({ 
    type: 'enum', 
    enum: SupplyChainEventPriority,
    default: SupplyChainEventPriority.NORMAL 
  })
  priority: SupplyChainEventPriority;

  @ApiProperty({ description: 'Event title or summary' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({ description: 'Detailed description of the event' })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'When the actual event occurred' })
  @Column({ type: 'timestamptz' })
  @Index()
  eventTimestamp: Date;

  @ApiProperty({ description: 'Location where the event occurred' })
  @Column({ type: 'jsonb', nullable: true })
  location: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    facilityId?: string;
    warehouseId?: string;
    zone?: string;
  } | null;

  @ApiProperty({ description: 'Stakeholder information' })
  @Column({ type: 'jsonb', nullable: true })
  stakeholders: {
    initiator?: {
      id: string;
      name: string;
      role: string;
      organization: string;
    };
    participants?: Array<{
      id: string;
      name: string;
      role: string;
      organization: string;
    }>;
    witnesses?: Array<{
      id: string;
      name: string;
      role: string;
    }>;
    approvers?: Array<{
      id: string;
      name: string;
      role: string;
      approvedAt: string;
    }>;
  } | null;

  @ApiProperty({ description: 'Event-specific data' })
  @Column({ type: 'jsonb', nullable: true })
  eventData: {
    // Manufacturing data
    machineId?: string;
    operatorId?: string;
    productionLine?: string;
    shift?: string;
    
    // Quality data
    qualityScore?: number;
    inspectorId?: string;
    testResults?: Record<string, any>;
    defects?: string[];
    
    // Logistics data
    carrierId?: string;
    trackingNumber?: string;
    transportMode?: string;
    estimatedDelivery?: string;
    actualDelivery?: string;
    
    // Transaction data
    transactionAmount?: number;
    currency?: string;
    paymentMethod?: string;
    invoiceNumber?: string;
    
    // Certification data
    certificateId?: string;
    certifyingBody?: string;
    validUntil?: string;
    certificateType?: string;
    
    // Environmental data
    temperature?: number;
    humidity?: number;
    pressure?: number;
    environmentalConditions?: Record<string, any>;
    
    // Custom fields
    [key: string]: any;
  } | null;

  @ApiProperty({ description: 'Quantity involved in the event' })
  @Column({ type: 'decimal', precision: 15, scale: 3, nullable: true })
  quantity: number | null;

  @ApiProperty({ description: 'Unit of measurement' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  unit: string | null;

  @ApiProperty({ description: 'Previous event in the chain' })
  @Column({ type: 'uuid', nullable: true })
  @Index()
  previousEventId: string | null;

  @ApiProperty({ description: 'Next event in the chain' })
  @Column({ type: 'uuid', nullable: true })
  @Index()
  nextEventId: string | null;

  @ApiProperty({ description: 'Parent event (if this is a sub-event)' })
  @Column({ type: 'uuid', nullable: true })
  @Index()
  parentEventId: string | null;

  @ApiProperty({ description: 'Related blockchain transaction' })
  @Column({ type: 'uuid', nullable: true })
  @Index()
  blockchainTransactionId: string | null;

  @ApiProperty({ description: 'Blockchain network used' })
  @Column({ 
    type: 'enum', 
    enum: BlockchainNetwork,
    nullable: true 
  })
  blockchainNetwork: BlockchainNetwork | null;

  @ApiProperty({ description: 'Blockchain transaction hash' })
  @Column({ type: 'varchar', length: 66, nullable: true })
  @Index()
  transactionHash: string | null;

  @ApiProperty({ description: 'Smart contract address' })
  @Column({ type: 'varchar', length: 42, nullable: true })
  contractAddress: string | null;

  @ApiProperty({ description: 'Block number where event was recorded' })
  @Column({ type: 'bigint', nullable: true })
  @Index()
  blockNumber: bigint | null;

  @ApiProperty({ description: 'IPFS hash for additional data storage' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  ipfsHash: string | null;

  @ApiProperty({ description: 'Digital signatures for verification' })
  @Column({ type: 'jsonb', nullable: true })
  signatures: Array<{
    signerId: string;
    signerRole: string;
    signature: string;
    timestamp: string;
    publicKey?: string;
  }> | null;

  @ApiProperty({ description: 'Verification status and details' })
  @Column({ type: 'jsonb', nullable: true })
  verification: {
    isVerified?: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
    verificationMethod?: string;
    verificationScore?: number;
    verificationNotes?: string;
    evidenceHashes?: string[];
  } | null;

  @ApiProperty({ description: 'Compliance and regulatory information' })
  @Column({ type: 'jsonb', nullable: true })
  compliance: {
    regulations?: string[];
    certifications?: string[];
    auditTrail?: string[];
    complianceScore?: number;
    risks?: Array<{
      type: string;
      level: 'low' | 'medium' | 'high';
      description: string;
    }>;
  } | null;

  @ApiProperty({ description: 'Alert and notification settings' })
  @Column({ type: 'jsonb', nullable: true })
  notifications: {
    emailNotifications?: string[];
    smsNotifications?: string[];
    webhookUrls?: string[];
    slackChannels?: string[];
    notificationTriggers?: string[];
  } | null;

  @ApiProperty({ description: 'Attached files and documents' })
  @Column({ type: 'jsonb', nullable: true })
  attachments: Array<{
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    url: string;
    hash?: string;
    uploadedBy?: string;
    uploadedAt: string;
  }> | null;

  @ApiProperty({ description: 'External system references' })
  @Column({ type: 'jsonb', nullable: true })
  externalReferences: {
    erpSystemId?: string;
    wmsSystemId?: string;
    mesSystemId?: string;
    crmSystemId?: string;
    externalIds?: Record<string, string>;
    apiCallbacks?: string[];
  } | null;

  @ApiProperty({ description: 'Event processing metadata' })
  @Column({ type: 'jsonb', nullable: true })
  processingMetadata: {
    processingStartedAt?: string;
    processingCompletedAt?: string;
    processingDurationMs?: number;
    processingAttempts?: number;
    lastProcessingError?: string;
    retryScheduledAt?: string;
  } | null;

  @ApiProperty({ description: 'Event expiry time' })
  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @ApiProperty({ description: 'Event archival time' })
  @Column({ type: 'timestamptz', nullable: true })
  archivedAt: Date | null;

  @ApiProperty({ description: 'Record creation timestamp' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update timestamp' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => BlockchainTransaction, { nullable: true })
  @JoinColumn({ name: 'blockchainTransactionId' })
  blockchainTransaction?: BlockchainTransaction;

  // Helper methods
  isRecordedOnBlockchain(): boolean {
    return !!this.transactionHash && !!this.blockNumber;
  }

  isPending(): boolean {
    return this.status === SupplyChainEventStatus.PENDING;
  }

  isVerified(): boolean {
    return this.verification?.isVerified === true;
  }

  isCritical(): boolean {
    return this.priority === SupplyChainEventPriority.CRITICAL || 
           this.priority === SupplyChainEventPriority.URGENT;
  }

  addSignature(signerId: string, signerRole: string, signature: string, publicKey?: string): void {
    if (!this.signatures) {
      this.signatures = [];
    }
    
    this.signatures.push({
      signerId,
      signerRole,
      signature,
      timestamp: new Date().toISOString(),
      publicKey,
    });
  }

  addAttachment(
    id: string, 
    filename: string, 
    mimeType: string, 
    size: number, 
    url: string,
    uploadedBy?: string,
    hash?: string
  ): void {
    if (!this.attachments) {
      this.attachments = [];
    }
    
    this.attachments.push({
      id,
      filename,
      mimeType,
      size,
      url,
      hash,
      uploadedBy,
      uploadedAt: new Date().toISOString(),
    });
  }

  updateStatus(newStatus: SupplyChainEventStatus, notes?: string): void {
    this.status = newStatus;
    this.updatedAt = new Date();
    
    if (!this.processingMetadata) {
      this.processingMetadata = {};
    }
    
    switch (newStatus) {
      case SupplyChainEventStatus.PROCESSING:
        this.processingMetadata.processingStartedAt = new Date().toISOString();
        break;
      case SupplyChainEventStatus.RECORDED:
      case SupplyChainEventStatus.VERIFIED:
        this.processingMetadata.processingCompletedAt = new Date().toISOString();
        if (this.processingMetadata.processingStartedAt) {
          const startTime = new Date(this.processingMetadata.processingStartedAt).getTime();
          this.processingMetadata.processingDurationMs = Date.now() - startTime;
        }
        break;
      case SupplyChainEventStatus.FAILED:
        if (notes) {
          this.processingMetadata.lastProcessingError = notes;
        }
        break;
    }
  }

  markAsVerified(verifierId: string, method: string, score?: number, notes?: string): void {
    this.verification = {
      isVerified: true,
      verifiedBy: verifierId,
      verifiedAt: new Date().toISOString(),
      verificationMethod: method,
      verificationScore: score,
      verificationNotes: notes,
      evidenceHashes: this.attachments?.map(att => att.hash).filter(Boolean) || [],
    };
    
    if (this.status === SupplyChainEventStatus.RECORDED) {
      this.updateStatus(SupplyChainEventStatus.VERIFIED);
    }
  }

  addComplianceRisk(type: string, level: 'low' | 'medium' | 'high', description: string): void {
    if (!this.compliance) {
      this.compliance = { risks: [] };
    }
    if (!this.compliance.risks) {
      this.compliance.risks = [];
    }
    
    this.compliance.risks.push({ type, level, description });
  }

  linkToBlockchain(transactionHash: string, blockNumber: bigint, contractAddress?: string): void {
    this.transactionHash = transactionHash;
    this.blockNumber = blockNumber;
    this.contractAddress = contractAddress;
    this.updateStatus(SupplyChainEventStatus.RECORDED);
  }

  calculateComplianceScore(): number {
    if (!this.compliance) return 100;
    
    const risks = this.compliance.risks || [];
    let score = 100;
    
    risks.forEach(risk => {
      switch (risk.level) {
        case 'low':
          score -= 5;
          break;
        case 'medium':
          score -= 15;
          break;
        case 'high':
          score -= 30;
          break;
      }
    });
    
    return Math.max(0, score);
  }

  getEventChain(): { previous: string | null; next: string | null } {
    return {
      previous: this.previousEventId,
      next: this.nextEventId,
    };
  }

  getDurationSinceEvent(): number {
    return Date.now() - this.eventTimestamp.getTime();
  }

  isExpired(): boolean {
    return this.expiresAt ? this.expiresAt < new Date() : false;
  }
}
