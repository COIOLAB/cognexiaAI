import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
} from 'typeorm';
import { IsString, IsBoolean, IsOptional, IsEnum, IsDate, IsUUID, IsNumber } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { User } from './user.entity';

export enum BlockchainNetwork {
  ETHEREUM = 'ethereum',
  BITCOIN = 'bitcoin',
  POLYGON = 'polygon',
  BINANCE_SMART_CHAIN = 'binance_smart_chain',
  SOLANA = 'solana',
  CARDANO = 'cardano',
  POLKADOT = 'polkadot',
  AVALANCHE = 'avalanche',
  CHAINLINK = 'chainlink',
  HYPERLEDGER = 'hyperledger',
  PRIVATE = 'private',
}

export enum IdentityStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  REVOKED = 'revoked',
  COMPROMISED = 'compromised',
  SUSPENDED = 'suspended',
}

export enum CredentialType {
  DID = 'did', // Decentralized Identifier
  VC = 'vc',   // Verifiable Credential
  NFT = 'nft', // Non-Fungible Token
  CERTIFICATE = 'certificate',
  ATTESTATION = 'attestation',
  PROOF = 'proof',
  SIGNATURE = 'signature',
}

@Entity('blockchain_identities')
@Index(['userId'])
@Index(['blockchainAddress'])
@Index(['network'])
@Index(['status'])
@Index(['credentialType'])
@Index(['isPrimary'])
@Index(['createdAt'])
export class BlockchainIdentity {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @Column({ type: 'uuid' })
  @IsUUID()
  userId: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @IsString()
  blockchainAddress: string;

  @Column({ type: 'enum', enum: BlockchainNetwork })
  @IsEnum(BlockchainNetwork)
  network: BlockchainNetwork;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  networkId?: string; // Chain ID or network identifier

  @Column({ type: 'enum', enum: IdentityStatus, default: IdentityStatus.PENDING })
  @IsEnum(IdentityStatus)
  status: IdentityStatus;

  @Column({ type: 'enum', enum: CredentialType, default: CredentialType.DID })
  @IsEnum(CredentialType)
  credentialType: CredentialType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  did?: string; // Decentralized Identifier

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  didDocument?: string; // DID Document (JSON)

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  publicKey?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  keyType?: string; // RSA, ECDSA, Ed25519, etc.

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  keySize?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  privateKeyRef?: string; // Reference to encrypted private key

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isPrimary: boolean; // Primary blockchain identity

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isVerified: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isSelfSovereign: boolean; // Self-sovereign identity

  // Verifiable Credentials
  @Column({ type: 'jsonb', nullable: true })
  verifiableCredentials?: Record<string, any>[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  credentialIssuer?: string;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  credentialIssuedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  credentialExpiresAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  credentialHash?: string;

  // Smart Contract Integration
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  smartContractAddress?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  contractVersion?: string;

  @Column({ type: 'jsonb', nullable: true })
  contractAbi?: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  tokenId?: string; // For NFT-based identities

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  tokenStandard?: string; // ERC-721, ERC-1155, etc.

  // Transaction History
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  creationTxHash?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  lastTxHash?: string;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  transactionCount: number;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  lastTransactionAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  transactionHistory?: Record<string, any>[];

  // Attestations and Proofs
  @Column({ type: 'jsonb', nullable: true })
  attestations?: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  proofs?: Record<string, any>[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  merkleRoot?: string;

  @Column({ type: 'jsonb', nullable: true })
  merkleProof?: Record<string, any>;

  // Zero-Knowledge Proofs
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  supportsZKProofs: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  zkProtocol?: string; // zk-SNARKs, zk-STARKs, etc.

  @Column({ type: 'jsonb', nullable: true })
  zkProofData?: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  commitmentHash?: string;

  // Multi-Signature Support
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isMultiSig: boolean;

  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsNumber()
  requiredSignatures?: number;

  @Column({ type: 'jsonb', nullable: true })
  signatories?: string[]; // Array of addresses

  @Column({ type: 'jsonb', nullable: true })
  pendingSignatures?: Record<string, any>[];

  // Governance and Staking
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  hasGovernanceRights: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  stakingAmount?: string; // Amount staked (as string for precision)

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  stakingRewards?: string;

  @Column({ type: 'jsonb', nullable: true })
  governanceVotes?: Record<string, any>[];

  // Reputation and Trust
  @Column({ type: 'float', default: 0 })
  @IsNumber()
  reputationScore: number;

  @Column({ type: 'float', default: 0 })
  @IsNumber()
  trustScore: number;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  endorsementCount: number;

  @Column({ type: 'jsonb', nullable: true })
  endorsements?: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  socialConnections?: Record<string, any>[];

  // Privacy Features
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isPrivate: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  supportsSelectiveDisclosure: boolean;

  @Column({ type: 'jsonb', nullable: true })
  disclosureRules?: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  privacyPreferences?: string;

  // Interoperability
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isCrossChain: boolean;

  @Column({ type: 'jsonb', nullable: true })
  connectedChains?: string[];

  @Column({ type: 'jsonb', nullable: true })
  bridgeProtocols?: Record<string, any>[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  universalResolver?: string;

  // Compliance and Regulations
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  complianceLevel?: string;

  @Column({ type: 'jsonb', nullable: true })
  regulatoryData?: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isKYCCompliant: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isAMLCompliant: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  jurisdiction?: string;

  // Usage Statistics
  @Column({ type: 'int', default: 0 })
  @IsNumber()
  usageCount: number;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  lastUsedAt?: Date;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  authenticationCount: number;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  lastAuthenticationAt?: Date;

  // Recovery and Backup
  @Column({ type: 'jsonb', nullable: true })
  recoveryMethods?: Record<string, any>[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  socialRecovery?: string;

  @Column({ type: 'jsonb', nullable: true })
  backupKeys?: string[];

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  hasBackup: boolean;

  // Additional Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  alias?: string; // Human-readable name

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string; // IPFS hash or URL

  // Timestamps
  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;

  @DeleteDateColumn()
  @IsOptional()
  @IsDate()
  deletedAt?: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.blockchainIdentities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Computed Properties
  get isExpired(): boolean {
    return this.credentialExpiresAt && this.credentialExpiresAt < new Date();
  }

  get isValid(): boolean {
    return this.isActive && 
           this.isVerified && 
           !this.isExpired && 
           this.status === IdentityStatus.ACTIVE;
  }

  get shortAddress(): string {
    return `${this.blockchainAddress.slice(0, 6)}...${this.blockchainAddress.slice(-4)}`;
  }

  get networkDisplayName(): string {
    return this.network.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  get hasAdvancedFeatures(): boolean {
    return this.supportsZKProofs || 
           this.isMultiSig || 
           this.isCrossChain || 
           this.supportsSelectiveDisclosure;
  }

  // Methods
  @BeforeInsert()
  async beforeInsert() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }

  verify(txHash?: string): void {
    this.isVerified = true;
    this.status = IdentityStatus.VERIFIED;
    if (txHash) {
      this.creationTxHash = txHash;
    }
  }

  activate(): void {
    if (this.isVerified) {
      this.status = IdentityStatus.ACTIVE;
      this.isActive = true;
    }
  }

  deactivate(): void {
    this.status = IdentityStatus.INACTIVE;
    this.isActive = false;
  }

  revoke(reason?: string): void {
    this.status = IdentityStatus.REVOKED;
    this.isActive = false;
    this.isVerified = false;
    
    if (reason) {
      this.metadata = {
        ...this.metadata,
        revocationReason: reason,
        revokedAt: new Date(),
      };
    }
  }

  suspend(reason?: string): void {
    this.status = IdentityStatus.SUSPENDED;
    this.isActive = false;
    
    if (reason) {
      this.metadata = {
        ...this.metadata,
        suspensionReason: reason,
        suspendedAt: new Date(),
      };
    }
  }

  compromise(): void {
    this.status = IdentityStatus.COMPROMISED;
    this.isActive = false;
    this.isVerified = false;
    
    this.metadata = {
      ...this.metadata,
      compromisedAt: new Date(),
      requiresNewKey: true,
    };
  }

  addCredential(credential: Record<string, any>): void {
    if (!this.verifiableCredentials) {
      this.verifiableCredentials = [];
    }
    
    this.verifiableCredentials.push({
      ...credential,
      addedAt: new Date(),
      id: uuidv4(),
    });
  }

  removeCredential(credentialId: string): void {
    if (this.verifiableCredentials) {
      this.verifiableCredentials = this.verifiableCredentials.filter(
        cred => cred.id !== credentialId
      );
    }
  }

  addAttestation(issuer: string, claim: Record<string, any>): void {
    if (!this.attestations) {
      this.attestations = [];
    }
    
    this.attestations.push({
      id: uuidv4(),
      issuer,
      claim,
      issuedAt: new Date(),
      isValid: true,
    });
  }

  addProof(proofType: string, proofData: Record<string, any>): void {
    if (!this.proofs) {
      this.proofs = [];
    }
    
    this.proofs.push({
      id: uuidv4(),
      type: proofType,
      data: proofData,
      createdAt: new Date(),
    });
  }

  recordTransaction(txHash: string, type: string, data?: Record<string, any>): void {
    this.transactionCount += 1;
    this.lastTxHash = txHash;
    this.lastTransactionAt = new Date();
    
    if (!this.transactionHistory) {
      this.transactionHistory = [];
    }
    
    this.transactionHistory.unshift({
      hash: txHash,
      type,
      timestamp: new Date(),
      data,
    });
    
    // Keep only last 100 transactions
    if (this.transactionHistory.length > 100) {
      this.transactionHistory = this.transactionHistory.slice(0, 100);
    }
  }

  recordAuthentication(): void {
    this.authenticationCount += 1;
    this.lastAuthenticationAt = new Date();
    this.usageCount += 1;
    this.lastUsedAt = new Date();
  }

  enableMultiSig(signatories: string[], requiredSigs: number): void {
    this.isMultiSig = true;
    this.signatories = signatories;
    this.requiredSignatures = requiredSigs;
    this.pendingSignatures = [];
  }

  disableMultiSig(): void {
    this.isMultiSig = false;
    this.signatories = null;
    this.requiredSignatures = null;
    this.pendingSignatures = null;
  }

  enableZKProofs(protocol: string, proofData: Record<string, any>): void {
    this.supportsZKProofs = true;
    this.zkProtocol = protocol;
    this.zkProofData = proofData;
  }

  addEndorsement(endorser: string, endorsementData: Record<string, any>): void {
    if (!this.endorsements) {
      this.endorsements = [];
    }
    
    this.endorsements.push({
      id: uuidv4(),
      endorser,
      data: endorsementData,
      timestamp: new Date(),
    });
    
    this.endorsementCount += 1;
    this.updateReputationScore();
  }

  updateReputationScore(): void {
    // Simple reputation calculation based on endorsements and usage
    let score = 0;
    
    score += Math.min(this.endorsementCount * 5, 50); // Max 50 from endorsements
    score += Math.min(this.authenticationCount * 0.1, 30); // Max 30 from usage
    score += this.isVerified ? 20 : 0; // 20 for verification
    
    this.reputationScore = Math.min(score, 100);
  }

  updateTrustScore(score: number): void {
    this.trustScore = Math.max(0, Math.min(100, score));
  }

  enableCrossChain(chains: string[], protocols: Record<string, any>[]): void {
    this.isCrossChain = true;
    this.connectedChains = chains;
    this.bridgeProtocols = protocols;
  }

  setRecoveryMethods(methods: Record<string, any>[]): void {
    this.recoveryMethods = methods;
    this.hasBackup = true;
  }

  updateMetadata(data: Record<string, any>): void {
    this.metadata = {
      ...this.metadata,
      ...data,
      lastUpdated: new Date(),
    };
  }

  generateQRCode(): string {
    return JSON.stringify({
      did: this.did,
      address: this.blockchainAddress,
      network: this.network,
      type: this.credentialType,
    });
  }

  exportPortableIdentity(): Record<string, any> {
    return {
      id: this.id,
      did: this.did,
      blockchainAddress: this.blockchainAddress,
      network: this.network,
      credentialType: this.credentialType,
      publicKey: this.publicKey,
      verifiableCredentials: this.verifiableCredentials,
      attestations: this.attestations,
      proofs: this.proofs,
      reputationScore: this.reputationScore,
      isVerified: this.isVerified,
      createdAt: this.createdAt,
    };
  }

  toJSON() {
    const { privateKeyRef, zkProofData, ...result } = this;
    return {
      ...result,
      isExpired: this.isExpired,
      isValid: this.isValid,
      shortAddress: this.shortAddress,
      networkDisplayName: this.networkDisplayName,
      hasAdvancedFeatures: this.hasAdvancedFeatures,
    };
  }
}
