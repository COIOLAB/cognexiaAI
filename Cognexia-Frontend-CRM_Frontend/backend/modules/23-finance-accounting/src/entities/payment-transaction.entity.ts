/**
 * Payment Transaction Entity
 * 
 * Comprehensive payment transaction tracking for all payment types
 * with fraud detection, compliance monitoring, and audit trails.
 * 
 * @version 3.0.0
 * @compliance SOX, GAAP, IFRS, SOC2, ISO27001, PCI-DSS
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { JournalEntry } from './journal-entry.entity';
import * as crypto from 'crypto';

export enum PaymentType {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  ACH = 'ACH',
  WIRE_TRANSFER = 'WIRE_TRANSFER',
  CHECK = 'CHECK',
  CASH = 'CASH',
  CRYPTO = 'CRYPTO',
  BANK_TRANSFER = 'BANK_TRANSFER',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
  MONEY_ORDER = 'MONEY_ORDER',
  GIFT_CARD = 'GIFT_CARD',
  STORE_CREDIT = 'STORE_CREDIT',
}

export enum PaymentMethod {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  AMEX = 'AMEX',
  DISCOVER = 'DISCOVER',
  PAYPAL = 'PAYPAL',
  APPLE_PAY = 'APPLE_PAY',
  GOOGLE_PAY = 'GOOGLE_PAY',
  VENMO = 'VENMO',
  ZELLE = 'ZELLE',
  STRIPE = 'STRIPE',
  SQUARE = 'SQUARE',
  BITCOIN = 'BITCOIN',
  ETHEREUM = 'ETHEREUM',
  OTHER = 'OTHER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  SETTLED = 'SETTLED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  DISPUTED = 'DISPUTED',
  CHARGEBACK = 'CHARGEBACK',
  VOIDED = 'VOIDED',
}

export enum TransactionDirection {
  INBOUND = 'INBOUND',   // Money coming in
  OUTBOUND = 'OUTBOUND', // Money going out
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  FLAGGED = 'FLAGGED',
  CLEARED = 'CLEARED',
}

@Entity('payment_transactions')
@Index(['transactionDate', 'status'])
@Index(['paymentType', 'paymentMethod'])
@Index(['direction', 'amount'])
@Index(['merchantId', 'customerId'])
@Index(['riskLevel', 'complianceStatus'])
@Index(['referenceNumber', 'externalTransactionId'])
export class PaymentTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  @Index()
  transactionNumber: string;

  @Column({ length: 100, nullable: true })
  externalTransactionId: string;

  @Column({ length: 100, nullable: true })
  referenceNumber: string;

  @Column({
    type: 'enum',
    enum: PaymentType,
  })
  paymentType: PaymentType;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: TransactionDirection,
  })
  direction: TransactionDirection;

  @Column({ type: 'timestamp' })
  @Index()
  transactionDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  settledDate: Date;

  // Amount details
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  @Index()
  amount: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 1.0 })
  exchangeRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  baseCurrencyAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  feeAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  netAmount: number;

  // Party information
  @Column({ length: 100, nullable: true })
  @Index()
  merchantId: string;

  @Column({ length: 200, nullable: true })
  merchantName: string;

  @Column({ length: 20, nullable: true })
  merchantCategoryCode: string;

  @Column({ length: 100, nullable: true })
  @Index()
  customerId: string;

  @Column({ length: 200, nullable: true })
  customerName: string;

  @Column({ length: 100, nullable: true })
  customerEmail: string;

  @Column({ length: 20, nullable: true })
  customerPhone: string;

  // Payment instrument details (PCI-DSS compliant)
  @Column({ length: 20, nullable: true })
  maskedCardNumber: string; // Only last 4 digits

  @Column({ length: 10, nullable: true })
  cardExpiryDate: string; // MM/YY format

  @Column({ length: 50, nullable: true })
  cardholderName: string;

  @Column({ length: 100, nullable: true })
  bankAccountMask: string; // Masked account number

  @Column({ length: 20, nullable: true })
  routingNumber: string;

  @Column({ length: 100, nullable: true })
  bankName: string;

  @Column({ length: 200, nullable: true })
  digitalWalletId: string;

  @Column({ length: 100, nullable: true })
  checkNumber: string;

  // Address information
  @Column({ type: 'jsonb', nullable: true })
  billingAddress: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  shippingAddress: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  // Transaction context
  @Column({ length: 100, nullable: true })
  orderId: string;

  @Column({ length: 100, nullable: true })
  invoiceId: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  itemDetails: {
    itemId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    category?: string;
    sku?: string;
  }[];

  // Processing details
  @Column({ length: 100, nullable: true })
  processorName: string;

  @Column({ length: 100, nullable: true })
  processorTransactionId: string;

  @Column({ length: 20, nullable: true })
  authorizationCode: string;

  @Column({ length: 10, nullable: true })
  responseCode: string;

  @Column({ length: 200, nullable: true })
  responseMessage: string;

  @Column({ length: 50, nullable: true })
  batchId: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  processingFeeRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  processingFeeAmount: number;

  // Risk and fraud detection
  @Column({
    type: 'enum',
    enum: RiskLevel,
    default: RiskLevel.LOW,
  })
  riskLevel: RiskLevel;

  @Column({ type: 'int', default: 0 })
  riskScore: number;

  @Column({ type: 'jsonb', nullable: true })
  fraudIndicators: {
    velocityCheck: boolean;
    geoLocationMismatch: boolean;
    deviceFingerprinting: boolean;
    behaviorAnalysis: boolean;
    blacklistMatch: boolean;
    avsFailure: boolean;
    cvvFailure: boolean;
    unusualAmount: boolean;
    suspiciousPattern: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  fraudAnalysis: {
    ipAddress: string;
    deviceId: string;
    userAgent: string;
    geolocation: {
      country: string;
      region: string;
      city: string;
      latitude: number;
      longitude: number;
    };
    velocityChecks: {
      transactionsLast24h: number;
      amountLast24h: number;
      transactionsLastHour: number;
    };
    deviceFingerprint: {
      browserFingerprint: string;
      screenResolution: string;
      timezone: string;
      language: string;
    };
  };

  // Compliance and regulatory
  @Column({
    type: 'enum',
    enum: ComplianceStatus,
    default: ComplianceStatus.COMPLIANT,
  })
  complianceStatus: ComplianceStatus;

  @Column({ type: 'jsonb', nullable: true })
  complianceChecks: {
    amlScreening: boolean;
    sanctionScreening: boolean;
    pepScreening: boolean;
    kycVerification: boolean;
    pciCompliance: boolean;
    gdprCompliance: boolean;
    regulatoryReporting: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  regulatoryData: {
    transactionPurpose: string;
    beneficiaryDetails?: {
      name: string;
      address: string;
      accountNumber: string;
      swiftCode?: string;
    };
    originatorDetails?: {
      name: string;
      address: string;
      accountNumber: string;
    };
    reportingRequirements: string[];
    ctrRequired: boolean; // Currency Transaction Report
    sarFiled: boolean; // Suspicious Activity Report
  };

  // Settlement and reconciliation
  @Column({ type: 'timestamp', nullable: true })
  expectedSettlementDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualSettlementDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  settledAmount: number;

  @Column({ type: 'boolean', default: false })
  isReconciled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  reconciledDate: Date;

  @Column({ length: 50, nullable: true })
  reconciledBy: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  reconciliationVariance: number;

  // Refunds and adjustments
  @Column({ type: 'uuid', nullable: true })
  originalTransactionId: string;

  @Column({ type: 'uuid', nullable: true })
  refundTransactionId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  refundedAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  remainingRefundableAmount: number;

  @Column({ type: 'text', nullable: true })
  refundReason: string;

  @Column({ type: 'boolean', default: false })
  isPartialRefund: boolean;

  // Chargeback and dispute information
  @Column({ type: 'uuid', nullable: true })
  chargebackId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  chargebackAmount: number;

  @Column({ type: 'text', nullable: true })
  chargebackReason: string;

  @Column({ type: 'timestamp', nullable: true })
  chargebackDate: Date;

  @Column({ length: 20, nullable: true })
  chargebackReasonCode: string;

  @Column({ type: 'boolean', default: false })
  disputeResolved: boolean;

  // Cash flow optimization
  @Column({ type: 'jsonb', nullable: true })
  cashFlowData: {
    expectedClearingDays: number;
    actualClearingDays?: number;
    holdPeriod: number;
    availabilityDate: Date;
    floatDays: number;
    interestImpact: number;
  };

  // Performance metrics
  @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true })
  processingTimeMs: number;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastRetryDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  performanceMetrics: {
    authorizationTime: number;
    captureTime: number;
    settlementTime: number;
    totalProcessingTime: number;
    networkLatency: number;
  };

  // AI insights and recommendations
  @Column({ type: 'jsonb', nullable: true })
  aiInsights: {
    riskPrediction: {
      fraudProbability: number;
      chargebackProbability: number;
      successProbability: number;
    };
    customerAnalysis: {
      lifetimeValue: number;
      riskProfile: string;
      paymentPreferences: string[];
      behaviorPattern: string;
    };
    recommendations: {
      preferredPaymentMethod: string;
      optimalProcessingRoute: string;
      suggestedFraudChecks: string[];
      cashFlowOptimization: string[];
    };
    anomalyDetection: {
      isAnomaly: boolean;
      anomalyType: string[];
      confidenceScore: number;
    };
  };

  // Custom fields and metadata
  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    tags?: string[];
    notes?: string;
    category?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    source?: string;
    channel?: string;
    campaign?: string;
    affiliateId?: string;
  };

  // Relationships
  @ManyToOne(() => JournalEntry, { nullable: true })
  @JoinColumn({ name: 'journalEntryId' })
  journalEntry: JournalEntry;

  @Column({ type: 'uuid', nullable: true })
  journalEntryId: string;

  // Audit trail
  @Column({ length: 50 })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ length: 50, nullable: true })
  updatedBy: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  auditTrail: {
    statusChanges: {
      timestamp: string;
      oldStatus: string;
      newStatus: string;
      reason?: string;
      userId: string;
    }[];
    fraudChecks: {
      timestamp: string;
      checkType: string;
      result: string;
      score?: number;
      details: string;
    }[];
    refunds: {
      timestamp: string;
      amount: number;
      reason: string;
      processedBy: string;
      refundId: string;
    }[];
    disputes: {
      timestamp: string;
      type: 'CHARGEBACK' | 'DISPUTE' | 'INQUIRY';
      amount: number;
      reason: string;
      status: string;
      evidence?: string[];
    }[];
  };

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'varchar', length: 64 })
  dataIntegrityHash: string;

  // Hooks for automatic calculations
  @BeforeInsert()
  generateTransactionNumber() {
    if (!this.transactionNumber) {
      const date = new Date();
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const timestamp = Date.now().toString().slice(-6);
      this.transactionNumber = `TXN${year}${month}${day}${timestamp}`;
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  calculateDerivedFields() {
    // Calculate net amount
    this.netAmount = this.amount - this.feeAmount - this.taxAmount + this.discountAmount;
    
    // Calculate base currency amount
    if (this.exchangeRate !== 1.0) {
      this.baseCurrencyAmount = this.amount * this.exchangeRate;
    } else {
      this.baseCurrencyAmount = this.amount;
    }
    
    // Calculate remaining refundable amount
    this.remainingRefundableAmount = this.amount - this.refundedAmount;
    
    // Calculate processing fee if rate is provided
    if (this.processingFeeRate && this.processingFeeRate > 0) {
      this.processingFeeAmount = this.amount * this.processingFeeRate;
    }
    
    // Update cash flow data
    if (this.cashFlowData && this.actualSettlementDate && this.transactionDate) {
      const timeDiff = this.actualSettlementDate.getTime() - this.transactionDate.getTime();
      this.cashFlowData.actualClearingDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  calculateRiskScore() {
    let score = 0;
    
    // Amount-based risk
    if (this.amount > 10000) score += 20;
    else if (this.amount > 5000) score += 15;
    else if (this.amount > 1000) score += 10;
    
    // Payment type risk
    switch (this.paymentType) {
      case PaymentType.CRYPTO:
        score += 25;
        break;
      case PaymentType.WIRE_TRANSFER:
        score += 15;
        break;
      case PaymentType.CREDIT_CARD:
        score += 10;
        break;
      case PaymentType.CASH:
        score += 20;
        break;
    }
    
    // Fraud indicators
    if (this.fraudIndicators) {
      Object.values(this.fraudIndicators).forEach(indicator => {
        if (indicator) score += 5;
      });
    }
    
    // Velocity checks
    if (this.fraudAnalysis?.velocityChecks) {
      const { transactionsLast24h, amountLast24h } = this.fraudAnalysis.velocityChecks;
      if (transactionsLast24h > 10) score += 15;
      if (amountLast24h > 50000) score += 20;
    }
    
    // Geolocation mismatch
    if (this.fraudIndicators?.geoLocationMismatch) score += 15;
    
    // Previous chargebacks or disputes
    if (this.chargebackId) score += 30;
    
    // Compliance issues
    if (this.complianceStatus === ComplianceStatus.FLAGGED) score += 25;
    else if (this.complianceStatus === ComplianceStatus.UNDER_REVIEW) score += 15;
    
    this.riskScore = Math.min(score, 100); // Cap at 100
    
    // Set risk level based on score
    if (this.riskScore >= 80) this.riskLevel = RiskLevel.CRITICAL;
    else if (this.riskScore >= 60) this.riskLevel = RiskLevel.HIGH;
    else if (this.riskScore >= 30) this.riskLevel = RiskLevel.MEDIUM;
    else this.riskLevel = RiskLevel.LOW;
  }

  @BeforeInsert()
  @BeforeUpdate()
  generateDataIntegrityHash() {
    const data = {
      transactionNumber: this.transactionNumber,
      amount: this.amount,
      currency: this.currency,
      paymentType: this.paymentType,
      status: this.status,
      direction: this.direction,
      transactionDate: this.transactionDate,
      customerId: this.customerId,
      merchantId: this.merchantId,
      version: this.version,
    };
    
    this.dataIntegrityHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  // Computed properties
  get isInbound(): boolean {
    return this.direction === TransactionDirection.INBOUND;
  }

  get isOutbound(): boolean {
    return this.direction === TransactionDirection.OUTBOUND;
  }

  get isCompleted(): boolean {
    return [PaymentStatus.COMPLETED, PaymentStatus.SETTLED].includes(this.status);
  }

  get isFailed(): boolean {
    return [PaymentStatus.FAILED, PaymentStatus.DECLINED, PaymentStatus.CANCELLED].includes(this.status);
  }

  get isRefunded(): boolean {
    return [PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED].includes(this.status);
  }

  get isDisputed(): boolean {
    return [PaymentStatus.DISPUTED, PaymentStatus.CHARGEBACK].includes(this.status);
  }

  get canBeRefunded(): boolean {
    return this.isCompleted && this.remainingRefundableAmount > 0;
  }

  get isHighRisk(): boolean {
    return [RiskLevel.HIGH, RiskLevel.CRITICAL].includes(this.riskLevel);
  }

  get requiresManualReview(): boolean {
    return this.isHighRisk || this.complianceStatus === ComplianceStatus.FLAGGED;
  }

  get isSettled(): boolean {
    return this.status === PaymentStatus.SETTLED && this.settledDate !== null;
  }

  get settlementDelay(): number {
    if (!this.expectedSettlementDate || !this.actualSettlementDate) return 0;
    const expected = this.expectedSettlementDate.getTime();
    const actual = this.actualSettlementDate.getTime();
    return Math.floor((actual - expected) / (1000 * 60 * 60 * 24)); // Days
  }

  get processingEfficiency(): 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' {
    if (!this.processingTimeMs) return 'AVERAGE';
    
    if (this.processingTimeMs < 1000) return 'EXCELLENT';
    if (this.processingTimeMs < 3000) return 'GOOD';
    if (this.processingTimeMs < 10000) return 'AVERAGE';
    return 'POOR';
  }

  get fraudRiskLevel(): 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' {
    const fraudScore = this.aiInsights?.riskPrediction?.fraudProbability || 0;
    
    if (fraudScore < 0.1) return 'VERY_LOW';
    if (fraudScore < 0.3) return 'LOW';
    if (fraudScore < 0.6) return 'MEDIUM';
    if (fraudScore < 0.8) return 'HIGH';
    return 'VERY_HIGH';
  }

  get customerRiskProfile(): string {
    return this.aiInsights?.customerAnalysis?.riskProfile || 'UNKNOWN';
  }

  get lifetimeValue(): number {
    return this.aiInsights?.customerAnalysis?.lifetimeValue || 0;
  }

  get isAnomaly(): boolean {
    return this.aiInsights?.anomalyDetection?.isAnomaly || false;
  }

  get complianceGrade(): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (!this.complianceChecks) return 'F';
    
    const checks = Object.values(this.complianceChecks);
    const passed = checks.filter(check => check).length;
    const total = checks.length;
    const score = total > 0 ? (passed / total) * 100 : 0;
    
    if (score >= 95) return 'A';
    if (score >= 90) return 'B';
    if (score >= 80) return 'C';
    if (score >= 70) return 'D';
    return 'F';
  }
}
