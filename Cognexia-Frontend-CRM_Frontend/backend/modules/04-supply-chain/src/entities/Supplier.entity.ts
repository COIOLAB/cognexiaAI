import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { IsEmail, IsPhoneNumber, IsUrl, IsNotEmpty, IsOptional } from 'class-validator';
import { ProcurementOrder } from './ProcurementOrder.entity';
import { SupplierPerformanceMetric } from './SupplierPerformanceMetric.entity';
import { SupplyChainRiskAssessment } from './SupplyChainRiskAssessment.entity';
import { BlockchainTransaction } from './BlockchainTransaction.entity';

export enum SupplierTier {
  TIER_1 = 'tier_1',
  TIER_2 = 'tier_2',
  TIER_3 = 'tier_3',
  STRATEGIC = 'strategic',
  PREFERRED = 'preferred',
  APPROVED = 'approved',
  PROBATION = 'probation',
}

export enum SupplierType {
  MANUFACTURER = 'manufacturer',
  DISTRIBUTOR = 'distributor',
  SERVICE_PROVIDER = 'service_provider',
  RAW_MATERIAL = 'raw_material',
  LOGISTICS = 'logistics',
  TECHNOLOGY = 'technology',
  CONSULTANT = 'consultant',
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  UNDER_REVIEW = 'under_review',
  PROBATION = 'probation',
  SUSPENDED = 'suspended',
  BLACKLISTED = 'blacklisted',
}

@Entity('suppliers')
@Index(['supplierCode'], { unique: true })
@Index(['email'], { unique: true })
@Index(['tier', 'type', 'status'])
@Index(['createdAt', 'updatedAt'])
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  @IsNotEmpty()
  supplierCode: string;

  @Column({ length: 200 })
  @IsNotEmpty()
  name: string;

  @Column({ length: 100, nullable: true })
  @IsOptional()
  legalName: string;

  @Column({
    type: 'enum',
    enum: SupplierTier,
    default: SupplierTier.APPROVED,
  })
  tier: SupplierTier;

  @Column({
    type: 'enum',
    enum: SupplierType,
    default: SupplierType.MANUFACTURER,
  })
  type: SupplierType;

  @Column({ default: true })
  isActive: boolean;

  // Contact Information
  @Column({ unique: true, length: 100 })
  @IsEmail()
  email: string;

  @Column({ length: 20, nullable: true })
  @IsOptional()
  @IsPhoneNumber()
  phone: string;

  @Column({ length: 20, nullable: true })
  @IsOptional()
  @IsPhoneNumber()
  alternatePhone: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsUrl()
  website: string;

  // Address Information
  @Column({ type: 'text' })
  @IsNotEmpty()
  address: string;

  @Column({ length: 100 })
  @IsNotEmpty()
  city: string;

  @Column({ length: 50 })
  @IsNotEmpty()
  state: string;

  @Column({ length: 20 })
  @IsNotEmpty()
  zipCode: string;

  @Column({ length: 50 })
  @IsNotEmpty()
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  // Financial Information
  @Column({ length: 50, nullable: true })
  taxId: string;

  @Column({ length: 50, nullable: true })
  dunsNumber: string;

  @Column({
    type: 'enum',
    enum: ['net_15', 'net_30', 'net_45', 'net_60', 'immediate'],
    default: 'net_30',
  })
  paymentTerms: string;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  creditLimit: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountRate: number;

  // Performance Metrics
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  qualityRating: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  deliveryRating: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  serviceRating: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  overallRating: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  costCompetitiveness: number;

  @Column({ type: 'int', default: 0 })
  onTimeDeliveryPercentage: number;

  // Compliance and Certifications
  @Column({
    type: 'enum',
    enum: ComplianceStatus,
    default: ComplianceStatus.UNDER_REVIEW,
  })
  complianceStatus: ComplianceStatus;

  @Column({ type: 'json', nullable: true })
  certifications: Array<{
    name: string;
    issuedBy: string;
    issuedDate: Date;
    expiryDate: Date;
    certificateNumber: string;
    status: 'active' | 'expired' | 'suspended';
  }>;

  @Column({ type: 'json', nullable: true })
  complianceChecklist: Array<{
    requirement: string;
    status: 'compliant' | 'non_compliant' | 'pending';
    lastChecked: Date;
    notes: string;
  }>;

  // Capabilities and Capacity
  @Column({ type: 'json', nullable: true })
  capabilities: Array<{
    category: string;
    subcategory: string;
    description: string;
    capacity: number;
    unit: string;
    leadTime: number;
  }>;

  @Column({ type: 'json', nullable: true })
  productCategories: string[];

  @Column({ type: 'json', nullable: true })
  serviceOfferings: string[];

  @Column({ type: 'int', nullable: true })
  maximumOrderValue: number;

  @Column({ type: 'int', nullable: true })
  minimumOrderValue: number;

  // AI-Enhanced Analytics
  @Column({ type: 'json', nullable: true })
  aiAnalytics: {
    riskScore: number;
    riskFactors: string[];
    performanceTrends: {
      quality: number[];
      delivery: number[];
      cost: number[];
      service: number[];
    };
    predictedPerformance: {
      nextQuarter: {
        quality: number;
        delivery: number;
        cost: number;
        service: number;
      };
    };
    recommendations: Array<{
      type: 'improvement' | 'risk_mitigation' | 'optimization';
      priority: 'high' | 'medium' | 'low';
      description: string;
      impact: string;
    }>;
  };

  // Blockchain Integration
  @Column({ type: 'json', nullable: true })
  blockchainProfile: {
    walletAddress: string;
    digitalIdentity: string;
    smartContractAddress: string;
    verificationStatus: 'verified' | 'pending' | 'failed';
    lastSyncTimestamp: Date;
  };

  // IoT Integration
  @Column({ type: 'json', nullable: true })
  iotDevices: Array<{
    deviceId: string;
    deviceType: string;
    location: string;
    status: 'active' | 'inactive' | 'maintenance';
    lastDataReceived: Date;
  }>;

  // Sustainability Metrics
  @Column({ type: 'json', nullable: true })
  sustainabilityMetrics: {
    carbonFootprint: number;
    wasteReduction: number;
    energyEfficiency: number;
    sustainabilityScore: number;
    certifications: string[];
    goals: Array<{
      metric: string;
      target: number;
      currentValue: number;
      targetDate: Date;
    }>;
  };

  // Contact Persons
  @Column({ type: 'json', nullable: true })
  contactPersons: Array<{
    name: string;
    title: string;
    email: string;
    phone: string;
    department: string;
    isPrimary: boolean;
  }>;

  // Emergency Contacts
  @Column({ type: 'json', nullable: true })
  emergencyContacts: Array<{
    name: string;
    role: string;
    phone: string;
    email: string;
    availability: string;
  }>;

  // Integration Settings
  @Column({ type: 'json', nullable: true })
  integrationSettings: {
    ediEnabled: boolean;
    apiEndpoint: string;
    dataExchangeFormat: 'json' | 'xml' | 'csv';
    syncFrequency: string;
    lastSyncTimestamp: Date;
  };

  // Audit Trail
  @Column({ type: 'json', nullable: true })
  auditTrail: Array<{
    action: string;
    performedBy: string;
    timestamp: Date;
    changes: Record<string, any>;
    reason: string;
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
  @OneToMany(() => ProcurementOrder, (order) => order.supplier)
  procurementOrders: ProcurementOrder[];

  @OneToMany(() => SupplierPerformanceMetric, (metric) => metric.supplier)
  performanceMetrics: SupplierPerformanceMetric[];

  @OneToMany(() => SupplyChainRiskAssessment, (risk) => risk.supplier)
  riskAssessments: SupplyChainRiskAssessment[];

  @ManyToMany(() => BlockchainTransaction)
  @JoinTable()
  blockchainTransactions: BlockchainTransaction[];

  // Computed Properties
  get fullAddress(): string {
    return `${this.address}, ${this.city}, ${this.state} ${this.zipCode}, ${this.country}`;
  }

  get isHighPerforming(): boolean {
    return this.overallRating >= 4.5 && this.onTimeDeliveryPercentage >= 95;
  }

  get riskLevel(): 'low' | 'medium' | 'high' | 'critical' {
    const riskScore = this.aiAnalytics?.riskScore || 0;
    if (riskScore <= 2) return 'low';
    if (riskScore <= 5) return 'medium';
    if (riskScore <= 8) return 'high';
    return 'critical';
  }

  // Methods
  updateRating(quality: number, delivery: number, service: number): void {
    this.qualityRating = quality;
    this.deliveryRating = delivery;
    this.serviceRating = service;
    this.overallRating = (quality + delivery + service) / 3;
  }

  addCertification(certification: any): void {
    if (!this.certifications) {
      this.certifications = [];
    }
    this.certifications.push(certification);
  }

  updateComplianceStatus(status: ComplianceStatus, reason?: string): void {
    this.complianceStatus = status;
    if (reason && this.auditTrail) {
      this.auditTrail.push({
        action: 'compliance_status_update',
        performedBy: 'system',
        timestamp: new Date(),
        changes: { complianceStatus: status },
        reason,
      });
    }
  }
}
