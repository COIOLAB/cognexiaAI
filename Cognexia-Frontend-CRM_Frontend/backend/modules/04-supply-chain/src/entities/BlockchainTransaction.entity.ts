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
import { IsNotEmpty, IsHash } from 'class-validator';
import { ProcurementOrder } from './ProcurementOrder.entity';

export enum TransactionType {
  ORDER_CREATED = 'order_created',
  ORDER_APPROVED = 'order_approved',
  ORDER_SENT = 'order_sent',
  ORDER_ACKNOWLEDGED = 'order_acknowledged',
  PRODUCTION_STARTED = 'production_started',
  QUALITY_VERIFIED = 'quality_verified',
  SHIPMENT_INITIATED = 'shipment_initiated',
  DELIVERY_CONFIRMED = 'delivery_confirmed',
  PAYMENT_PROCESSED = 'payment_processed',
  CONTRACT_EXECUTED = 'contract_executed',
  COMPLIANCE_VERIFIED = 'compliance_verified',
  SUSTAINABILITY_TRACKED = 'sustainability_tracked',
}

export enum BlockchainNetwork {
  ETHEREUM = 'ethereum',
  POLYGON = 'polygon',
  BINANCE_SMART_CHAIN = 'binance_smart_chain',
  HYPERLEDGER_FABRIC = 'hyperledger_fabric',
  CORDA = 'corda',
  PRIVATE_NETWORK = 'private_network',
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  REVERTED = 'reverted',
}

@Entity('blockchain_transactions')
@Index(['transactionHash'], { unique: true })
@Index(['blockNumber', 'network'])
@Index(['type', 'status'])
@Index(['procurementOrderId'])
@Index(['createdAt'])
export class BlockchainTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 66 })
  @IsHash('sha256')
  transactionHash: string;

  @Column({
    type: 'enum',
    enum: BlockchainNetwork,
    default: BlockchainNetwork.ETHEREUM,
  })
  network: BlockchainNetwork;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  @IsNotEmpty()
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  // Blockchain Technical Details
  @Column({ type: 'bigint', nullable: true })
  blockNumber: number;

  @Column({ length: 66, nullable: true })
  blockHash: string;

  @Column({ type: 'int', nullable: true })
  transactionIndex: number;

  @Column({ length: 42 })
  @IsNotEmpty()
  fromAddress: string;

  @Column({ length: 42 })
  @IsNotEmpty()
  toAddress: string;

  @Column({ type: 'decimal', precision: 30, scale: 0, nullable: true })
  value: string; // Wei amount

  @Column({ type: 'decimal', precision: 30, scale: 0, nullable: true })
  gasUsed: string;

  @Column({ type: 'decimal', precision: 30, scale: 0, nullable: true })
  gasPrice: string;

  @Column({ type: 'decimal', precision: 15, scale: 8, nullable: true })
  transactionFee: number; // In native currency

  @Column({ type: 'int', default: 0 })
  confirmations: number;

  // Smart Contract Information
  @Column({ length: 42, nullable: true })
  contractAddress: string;

  @Column({ type: 'text', nullable: true })
  inputData: string;

  @Column({ type: 'json', nullable: true })
  logs: Array<{
    address: string;
    topics: string[];
    data: string;
    blockNumber: number;
    transactionHash: string;
    logIndex: number;
  }>;

  @Column({ type: 'json', nullable: true })
  decodedEvents: Array<{
    eventName: string;
    parameters: Record<string, any>;
    signature: string;
  }>;

  // Business Context
  @Column('uuid', { nullable: true })
  procurementOrderId: string;

  @Column({ type: 'json', nullable: true })
  businessData: {
    orderId?: string;
    supplierId?: string;
    itemCodes?: string[];
    milestone?: string;
    metadata?: Record<string, any>;
  };

  // Digital Signature and Verification
  @Column({ type: 'json', nullable: true })
  digitalSignatures: Array<{
    signatory: string;
    publicKey: string;
    signature: string;
    algorithm: string;
    timestamp: Date;
  }>;

  @Column({ type: 'json', nullable: true })
  verificationProofs: Array<{
    type: 'merkle_proof' | 'zero_knowledge_proof' | 'timestamp_proof';
    proof: string;
    verifier: string;
    timestamp: Date;
  }>;

  // Immutable Data Payload
  @Column({ type: 'json' })
  payload: {
    version: string;
    timestamp: Date;
    businessEvent: string;
    participants: string[];
    data: Record<string, any>;
    previousHash?: string;
    merkleRoot?: string;
  };

  // IPFS Integration
  @Column({ length: 100, nullable: true })
  ipfsHash: string; // For storing large documents off-chain

  @Column({ type: 'json', nullable: true })
  ipfsMetadata: {
    fileName: string;
    fileSize: number;
    contentType: string;
    uploadTimestamp: Date;
  };

  // Compliance and Audit
  @Column({ type: 'json', nullable: true })
  complianceData: {
    regulations: string[];
    certifications: string[];
    auditTrail: Array<{
      auditor: string;
      timestamp: Date;
      result: 'pass' | 'fail';
      notes: string;
    }>;
  };

  // Performance Metrics
  @Column({ type: 'timestamp', nullable: true })
  initiatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt: Date;

  @Column({ type: 'int', nullable: true })
  processingTimeMs: number;

  // Error Handling
  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'json', nullable: true })
  retryAttempts: Array<{
    attempt: number;
    timestamp: Date;
    error: string;
    gasPrice: string;
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
  @ManyToOne(() => ProcurementOrder, (order) => order.blockchainTransactions, { nullable: true })
  @JoinColumn({ name: 'procurementOrderId' })
  procurementOrder: ProcurementOrder;

  // Computed Properties
  get isConfirmed(): boolean {
    return this.status === TransactionStatus.CONFIRMED && this.confirmations >= 6;
  }

  get explorerUrl(): string {
    const baseUrls = {
      [BlockchainNetwork.ETHEREUM]: 'https://etherscan.io/tx/',
      [BlockchainNetwork.POLYGON]: 'https://polygonscan.com/tx/',
      [BlockchainNetwork.BINANCE_SMART_CHAIN]: 'https://bscscan.com/tx/',
    };
    
    const baseUrl = baseUrls[this.network];
    return baseUrl ? `${baseUrl}${this.transactionHash}` : '';
  }

  get transactionCostUSD(): number {
    // This would integrate with price feeds to convert gas cost to USD
    return 0; // Placeholder
  }

  // Methods
  updateStatus(newStatus: TransactionStatus, updatedBy?: string): void {
    this.status = newStatus;
    this.updatedBy = updatedBy || 'system';
    
    if (newStatus === TransactionStatus.CONFIRMED && !this.confirmedAt) {
      this.confirmedAt = new Date();
      this.processingTimeMs = this.confirmedAt.getTime() - (this.initiatedAt?.getTime() || this.createdAt.getTime());
    }
  }

  addVerificationProof(proof: any): void {
    if (!this.verificationProofs) {
      this.verificationProofs = [];
    }
    this.verificationProofs.push(proof);
  }

  addDigitalSignature(signature: any): void {
    if (!this.digitalSignatures) {
      this.digitalSignatures = [];
    }
    this.digitalSignatures.push(signature);
  }

  calculateDataHash(): string {
    // Calculate SHA-256 hash of the payload for integrity verification
    const crypto = require('crypto');
    const dataString = JSON.stringify(this.payload);
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  validateIntegrity(): boolean {
    // Verify that the payload hasn't been tampered with
    const currentHash = this.calculateDataHash();
    return this.payload.merkleRoot ? currentHash === this.payload.merkleRoot : true;
  }
}
