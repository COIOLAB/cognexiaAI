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

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  DROPPED = 'dropped',
}

export enum TransactionType {
  SUPPLY_CHAIN_EVENT = 'supply_chain_event',
  ASSET_TRANSFER = 'asset_transfer',
  SMART_CONTRACT_DEPLOYMENT = 'smart_contract_deployment',
  SMART_CONTRACT_INTERACTION = 'smart_contract_interaction',
  TOKEN_MINT = 'token_mint',
  TOKEN_BURN = 'token_burn',
  AUDIT_LOG = 'audit_log',
  INVENTORY_UPDATE = 'inventory_update',
  QUALITY_VERIFICATION = 'quality_verification',
  OWNERSHIP_TRANSFER = 'ownership_transfer',
}

export enum BlockchainNetwork {
  ETHEREUM = 'ethereum',
  POLYGON = 'polygon',
  BINANCE_SMART_CHAIN = 'binance',
  AVALANCHE = 'avalanche',
  ARBITRUM = 'arbitrum',
  OPTIMISM = 'optimism',
  HARDHAT = 'hardhat',
  SEPOLIA = 'sepolia',
}

@Entity('blockchain_transactions')
@Index(['transactionHash'], { unique: true })
@Index(['blockNumber', 'network'])
@Index(['status', 'createdAt'])
@Index(['fromAddress', 'toAddress'])
@Index(['transactionType', 'network'])
export class BlockchainTransaction {
  @ApiProperty({ description: 'Unique identifier for the transaction record' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Blockchain transaction hash' })
  @Column({ type: 'varchar', length: 66, unique: true })
  @Index()
  transactionHash: string;

  @ApiProperty({ description: 'Block number where transaction was mined' })
  @Column({ type: 'bigint', nullable: true })
  @Index()
  blockNumber: bigint | null;

  @ApiProperty({ description: 'Block hash where transaction was mined' })
  @Column({ type: 'varchar', length: 66, nullable: true })
  blockHash: string | null;

  @ApiProperty({ description: 'Transaction index in the block' })
  @Column({ type: 'integer', nullable: true })
  transactionIndex: number | null;

  @ApiProperty({ enum: BlockchainNetwork, description: 'Blockchain network' })
  @Column({ 
    type: 'enum', 
    enum: BlockchainNetwork,
    default: BlockchainNetwork.ETHEREUM 
  })
  @Index()
  network: BlockchainNetwork;

  @ApiProperty({ description: 'Sender address' })
  @Column({ type: 'varchar', length: 42 })
  @Index()
  fromAddress: string;

  @ApiProperty({ description: 'Recipient address' })
  @Column({ type: 'varchar', length: 42 })
  @Index()
  toAddress: string;

  @ApiProperty({ description: 'Transaction value in wei (as string)' })
  @Column({ type: 'varchar', length: 78, default: '0' }) // Max uint256 length
  value: string;

  @ApiProperty({ description: 'Gas limit for the transaction' })
  @Column({ type: 'bigint' })
  gasLimit: bigint;

  @ApiProperty({ description: 'Gas price in wei (as string)' })
  @Column({ type: 'varchar', length: 78 })
  gasPrice: string;

  @ApiProperty({ description: 'Gas used by the transaction' })
  @Column({ type: 'bigint', nullable: true })
  gasUsed: bigint | null;

  @ApiProperty({ description: 'Effective gas price (EIP-1559)' })
  @Column({ type: 'varchar', length: 78, nullable: true })
  effectiveGasPrice: string | null;

  @ApiProperty({ description: 'Transaction nonce' })
  @Column({ type: 'bigint' })
  nonce: bigint;

  @ApiProperty({ description: 'Transaction input data' })
  @Column({ type: 'text', nullable: true })
  inputData: string | null;

  @ApiProperty({ enum: TransactionStatus, description: 'Transaction status' })
  @Column({ 
    type: 'enum', 
    enum: TransactionStatus,
    default: TransactionStatus.PENDING 
  })
  @Index()
  status: TransactionStatus;

  @ApiProperty({ enum: TransactionType, description: 'Type of transaction' })
  @Column({ 
    type: 'enum', 
    enum: TransactionType 
  })
  @Index()
  transactionType: TransactionType;

  @ApiProperty({ description: 'Number of confirmations received' })
  @Column({ type: 'integer', default: 0 })
  confirmations: number;

  @ApiProperty({ description: 'Required confirmations for finality' })
  @Column({ type: 'integer', default: 12 })
  requiredConfirmations: number;

  @ApiProperty({ description: 'Error message if transaction failed' })
  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @ApiProperty({ description: 'Error code if transaction failed' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  errorCode: string | null;

  @ApiProperty({ description: 'Transaction receipt logs' })
  @Column({ type: 'jsonb', nullable: true })
  logs: any[] | null;

  @ApiProperty({ description: 'Contract address if deployment transaction' })
  @Column({ type: 'varchar', length: 42, nullable: true })
  contractAddress: string | null;

  @ApiProperty({ description: 'Inventory item ID related to this transaction' })
  @Column({ type: 'uuid', nullable: true })
  @Index()
  inventoryItemId: string | null;

  @ApiProperty({ description: 'User ID who initiated the transaction' })
  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId: string | null;

  @ApiProperty({ description: 'Business context metadata' })
  @Column({ type: 'jsonb', nullable: true })
  businessContext: {
    operation?: string;
    description?: string;
    department?: string;
    costCenter?: string;
    project?: string;
    reference?: string;
    additionalData?: Record<string, any>;
  } | null;

  @ApiProperty({ description: 'Smart contract interaction details' })
  @Column({ type: 'jsonb', nullable: true })
  contractInteraction: {
    contractAddress?: string;
    methodName?: string;
    methodSignature?: string;
    parameters?: any[];
    returnValues?: any[];
    events?: any[];
  } | null;

  @ApiProperty({ description: 'Supply chain event details' })
  @Column({ type: 'jsonb', nullable: true })
  supplyChainContext: {
    eventType?: string;
    productId?: string;
    batchId?: string;
    location?: string;
    timestamp?: string;
    certifications?: string[];
    qualityMetrics?: Record<string, any>;
  } | null;

  @ApiProperty({ description: 'Fee calculation details' })
  @Column({ type: 'jsonb', nullable: true })
  feeDetails: {
    baseFee?: string;
    priorityFee?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    totalFee?: string;
    feeInUsd?: number;
  } | null;

  @ApiProperty({ description: 'Retry attempt information' })
  @Column({ type: 'jsonb', nullable: true })
  retryInfo: {
    attempts?: number;
    maxAttempts?: number;
    nextRetryAt?: string;
    escalationLevel?: number;
    originalTransactionHash?: string;
  } | null;

  @ApiProperty({ description: 'Compliance and audit information' })
  @Column({ type: 'jsonb', nullable: true })
  complianceInfo: {
    regulatoryFlags?: string[];
    complianceScore?: number;
    riskLevel?: 'low' | 'medium' | 'high';
    auditTrail?: string[];
    approvals?: {
      approverId: string;
      approvedAt: string;
      approvalType: string;
    }[];
  } | null;

  @ApiProperty({ description: 'Performance metrics' })
  @Column({ type: 'jsonb', nullable: true })
  performanceMetrics: {
    queueTimeMs?: number;
    processingTimeMs?: number;
    blockConfirmationTimeMs?: number;
    totalTimeMs?: number;
    networkCongestion?: 'low' | 'medium' | 'high';
  } | null;

  @ApiProperty({ description: 'External transaction references' })
  @Column({ type: 'jsonb', nullable: true })
  externalReferences: {
    crossChainTxIds?: string[];
    relatedTransactions?: string[];
    parentTransactionId?: string;
    childTransactionIds?: string[];
    bridgeTransactionId?: string;
  } | null;

  @ApiProperty({ description: 'Transaction scheduled time' })
  @Column({ type: 'timestamptz', nullable: true })
  scheduledAt: Date | null;

  @ApiProperty({ description: 'Transaction submitted to network time' })
  @Column({ type: 'timestamptz', nullable: true })
  submittedAt: Date | null;

  @ApiProperty({ description: 'Transaction confirmed time' })
  @Column({ type: 'timestamptz', nullable: true })
  confirmedAt: Date | null;

  @ApiProperty({ description: 'Transaction finalized time' })
  @Column({ type: 'timestamptz', nullable: true })
  finalizedAt: Date | null;

  @ApiProperty({ description: 'Last status check time' })
  @Column({ type: 'timestamptz', nullable: true })
  lastCheckedAt: Date | null;

  @ApiProperty({ description: 'Transaction expiry time' })
  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @ApiProperty({ description: 'Record creation timestamp' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update timestamp' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Helper methods
  isConfirmed(): boolean {
    return this.status === TransactionStatus.CONFIRMED && 
           this.confirmations >= this.requiredConfirmations;
  }

  isPending(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  isFailed(): boolean {
    return this.status === TransactionStatus.FAILED;
  }

  getEstimatedConfirmationTime(): Date | null {
    if (!this.submittedAt || this.isConfirmed()) {
      return null;
    }

    // Estimate based on network block times
    const blockTimes: Record<BlockchainNetwork, number> = {
      [BlockchainNetwork.ETHEREUM]: 13000,
      [BlockchainNetwork.POLYGON]: 2000,
      [BlockchainNetwork.BINANCE_SMART_CHAIN]: 3000,
      [BlockchainNetwork.AVALANCHE]: 2000,
      [BlockchainNetwork.ARBITRUM]: 1000,
      [BlockchainNetwork.OPTIMISM]: 2000,
      [BlockchainNetwork.HARDHAT]: 1000,
      [BlockchainNetwork.SEPOLIA]: 12000,
    };

    const blockTime = blockTimes[this.network] || 13000;
    const remainingConfirmations = this.requiredConfirmations - this.confirmations;
    const estimatedTimeMs = remainingConfirmations * blockTime;

    return new Date(Date.now() + estimatedTimeMs);
  }

  getTotalFeeInWei(): bigint {
    if (this.gasUsed && this.effectiveGasPrice) {
      return this.gasUsed * BigInt(this.effectiveGasPrice);
    }
    if (this.gasUsed && this.gasPrice) {
      return this.gasUsed * BigInt(this.gasPrice);
    }
    return BigInt(0);
  }

  getValueInEth(): string {
    const valueInWei = BigInt(this.value);
    const ethValue = valueInWei / BigInt(10 ** 18);
    return ethValue.toString();
  }

  updateStatus(
    newStatus: TransactionStatus, 
    additionalData: Partial<BlockchainTransaction> = {}
  ): void {
    this.status = newStatus;
    this.updatedAt = new Date();
    
    Object.assign(this, additionalData);

    // Set timestamps based on status
    switch (newStatus) {
      case TransactionStatus.PENDING:
        if (!this.submittedAt) {
          this.submittedAt = new Date();
        }
        break;
      case TransactionStatus.CONFIRMED:
        if (!this.confirmedAt) {
          this.confirmedAt = new Date();
        }
        break;
      case TransactionStatus.FAILED:
      case TransactionStatus.CANCELLED:
      case TransactionStatus.DROPPED:
        if (!this.finalizedAt) {
          this.finalizedAt = new Date();
        }
        break;
    }
  }

  addPerformanceMetric(metric: string, value: number): void {
    if (!this.performanceMetrics) {
      this.performanceMetrics = {};
    }
    this.performanceMetrics[metric] = value;
  }

  addComplianceFlag(flag: string): void {
    if (!this.complianceInfo) {
      this.complianceInfo = { regulatoryFlags: [] };
    }
    if (!this.complianceInfo.regulatoryFlags) {
      this.complianceInfo.regulatoryFlags = [];
    }
    if (!this.complianceInfo.regulatoryFlags.includes(flag)) {
      this.complianceInfo.regulatoryFlags.push(flag);
    }
  }

  addAuditTrail(entry: string): void {
    if (!this.complianceInfo) {
      this.complianceInfo = { auditTrail: [] };
    }
    if (!this.complianceInfo.auditTrail) {
      this.complianceInfo.auditTrail = [];
    }
    this.complianceInfo.auditTrail.push(`${new Date().toISOString()}: ${entry}`);
  }
}
