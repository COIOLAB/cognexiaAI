// Industry 5.0 ERP Backend - Supply Chain Module
// SupplierNetwork Entity - Advanced supplier network management with AI-powered relationship optimization
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { SupplierPerformance } from './SupplierPerformance';
import { LogisticsShipment } from './LogisticsShipment';
import { TraceabilityRecord } from './TraceabilityRecord';

export enum SupplierType {
  MANUFACTURER = 'manufacturer',
  DISTRIBUTOR = 'distributor',
  WHOLESALER = 'wholesaler',
  SERVICE_PROVIDER = 'service_provider',
  RAW_MATERIAL_SUPPLIER = 'raw_material_supplier',
  COMPONENT_SUPPLIER = 'component_supplier',
  PACKAGING_SUPPLIER = 'packaging_supplier',
  LOGISTICS_PROVIDER = 'logistics_provider',
  TECHNOLOGY_PARTNER = 'technology_partner'
}

export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING_APPROVAL = 'pending_approval',
  SUSPENDED = 'suspended',
  BLACKLISTED = 'blacklisted',
  PREFERRED = 'preferred',
  STRATEGIC = 'strategic',
  UNDER_REVIEW = 'under_review'
}

export enum SupplierTier {
  TIER_1 = 'tier_1', // Direct suppliers
  TIER_2 = 'tier_2', // Suppliers to tier 1 suppliers
  TIER_3 = 'tier_3', // Suppliers to tier 2 suppliers
  TIER_N = 'tier_n'   // Extended supply chain
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

@Entity('supplier_networks')
@Index(['supplierCode'])
@Index(['type', 'status'])
@Index(['country', 'region'])
@Index(['tier', 'riskLevel'])
export class SupplierNetwork {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  @Index()
  supplierCode: string;

  @Column({ length: 255 })
  companyName: string;

  @Column({ length: 255, nullable: true })
  legalName: string;

  @Column({ length: 100, nullable: true })
  brandName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: SupplierType,
    default: SupplierType.MANUFACTURER
  })
  type: SupplierType;

  @Column({
    type: 'enum',
    enum: SupplierStatus,
    default: SupplierStatus.PENDING_APPROVAL
  })
  status: SupplierStatus;

  @Column({
    type: 'enum',
    enum: SupplierTier,
    default: SupplierTier.TIER_1
  })
  tier: SupplierTier;

  @Column({
    type: 'enum',
    enum: RiskLevel,
    default: RiskLevel.MEDIUM
  })
  riskLevel: RiskLevel;

  // Company Information
  @Column({ length: 50, nullable: true })
  taxId: string;

  @Column({ length: 50, nullable: true })
  dunsNumber: string;

  @Column({ length: 100, nullable: true })
  website: string;

  @Column({ type: 'date', nullable: true })
  establishedDate: Date;

  @Column({ type: 'int', nullable: true })
  employeeCount: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  annualRevenue: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  // Location Information
  @Column({ type: 'json' })
  addresses: {
    type: 'headquarters' | 'manufacturing' | 'warehouse' | 'office' | 'billing';
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isPrimary: boolean;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  }[];

  @Column({ length: 100 })
  country: string;

  @Column({ length: 100, nullable: true })
  region: string;

  @Column({ length: 50, nullable: true })
  timeZone: string;

  // Contact Information
  @Column({ type: 'json' })
  contacts: {
    type: 'primary' | 'sales' | 'procurement' | 'technical' | 'quality' | 'finance' | 'shipping';
    name: string;
    title: string;
    email: string;
    phone: string;
    mobile?: string;
    isPrimary: boolean;
  }[];

  // Financial Information
  @Column({ type: 'json', nullable: true })
  financialProfile: {
    creditRating?: string;
    creditLimit?: number;
    paymentTerms?: string;
    preferredCurrency?: string;
    bankReferences?: {
      bankName: string;
      accountNumber: string;
      swiftCode?: string;
    }[];
    dAndBRating?: string;
    financialStability?: 'excellent' | 'good' | 'fair' | 'poor';
    insuranceCoverage?: {
      type: string;
      amount: number;
      expiryDate: Date;
    }[];
  };

  // Capabilities and Services
  @Column({ type: 'json' })
  capabilities: {
    categories: string[];
    products: string[];
    services: string[];
    certifications: string[];
    qualityStandards: string[];
    manufacturingProcesses: string[];
    capacity: {
      dailyOutput?: number;
      monthlyOutput?: number;
      unit: string;
    };
    leadTimes: {
      standard: number;
      expedited?: number;
      unit: 'days' | 'weeks';
    };
    minimumOrderQuantity?: number;
    maximumOrderQuantity?: number;
  };

  // Quality and Compliance
  @Column({ type: 'json', nullable: true })
  qualityProfile: {
    certifications: {
      name: string;
      issuingBody: string;
      issueDate: Date;
      expiryDate: Date;
      certificateNumber: string;
    }[];
    auditHistory: {
      auditType: string;
      auditor: string;
      auditDate: Date;
      score: number;
      findings: string[];
      corrective_actions: string[];
    }[];
    defectRate?: number;
    qualityScore?: number;
    complianceStatus: 'compliant' | 'non_compliant' | 'under_review';
    nonComplianceIssues?: string[];
  };

  // Sustainability and ESG
  @Column({ type: 'json', nullable: true })
  sustainabilityProfile: {
    esgScore?: number;
    carbonFootprint?: number;
    sustainabilityCertifications?: string[];
    environmentalPolicies?: string[];
    laborPractices?: string[];
    ethicalSourcing?: boolean;
    conflictMinerals?: 'compliant' | 'non_compliant' | 'unknown';
    diversitySupplier?: boolean;
    renewableEnergyUsage?: number;
    wasteReductionPrograms?: string[];
    sustainabilityGoals?: {
      goal: string;
      targetDate: Date;
      progress: number;
    }[];
  };

  // Risk Assessment
  @Column({ type: 'json', nullable: true })
  riskAssessment: {
    geopoliticalRisk?: number;
    financialRisk?: number;
    operationalRisk?: number;
    cybersecurityRisk?: number;
    reputationalRisk?: number;
    concentrationRisk?: number;
    naturalDisasterRisk?: number;
    riskFactors?: string[];
    mitigation_strategies?: string[];
    lastAssessmentDate?: Date;
    nextReviewDate?: Date;
    riskTrend?: 'increasing' | 'stable' | 'decreasing';
  };

  // Performance Metrics
  @Column({ type: 'json', nullable: true })
  performanceMetrics: {
    onTimeDeliveryRate?: number;
    qualityRating?: number;
    responsiveness?: number;
    costCompetitiveness?: number;
    innovation?: number;
    overallScore?: number;
    benchmarkPercentile?: number;
    trends?: {
      metric: string;
      trend: 'improving' | 'stable' | 'declining';
      changePercent: number;
    }[];
  };

  // Technology Integration
  @Column({ type: 'json', nullable: true })
  technologyProfile: {
    ediCapability?: boolean;
    apiIntegration?: boolean;
    blockchainEnabled?: boolean;
    iotDevices?: number;
    digitalMaturity?: 'basic' | 'intermediate' | 'advanced' | 'leading';
    systemsUsed?: string[];
    dataExchangeFormats?: string[];
    cybersecurityRating?: string;
    digitalCertificates?: {
      type: string;
      issuer: string;
      expiryDate: Date;
    }[];
  };

  // Relationship Management
  @Column({ type: 'json', nullable: true })
  relationshipData: {
    partnershipType?: 'transactional' | 'collaborative' | 'strategic';
    relationshipStart?: Date;
    contractEndDate?: Date;
    spendVolume?: {
      annual: number;
      monthly_average: number;
      percentage_of_category: number;
    };
    categoryImportance?: 'critical' | 'important' | 'standard';
    exclusivity?: boolean;
    longTermAgreement?: boolean;
    jointDevelopmentProjects?: string[];
    keyMilestones?: {
      milestone: string;
      date: Date;
      status: 'completed' | 'in_progress' | 'planned';
    }[];
  };

  // AI Insights and Analytics
  @Column({ type: 'json', nullable: true })
  aiInsights: {
    riskPrediction?: {
      riskLevel: RiskLevel;
      confidence: number;
      factors: string[];
      recommendation: string;
    };
    performanceForecast?: {
      expectedRating: number;
      trendDirection: 'up' | 'down' | 'stable';
      confidence: number;
    };
    recommendedActions?: string[];
    competitiveAnalysis?: {
      marketPosition: string;
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
    };
    pricingOptimization?: {
      currentCost: number;
      optimizedCost: number;
      savingsPotential: number;
    };
  };

  // Supplier Network Relationships
  @ManyToMany(() => SupplierNetwork)
  @JoinTable({
    name: 'supplier_network_relationships',
    joinColumn: { name: 'supplier_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'related_supplier_id', referencedColumnName: 'id' }
  })
  relatedSuppliers: SupplierNetwork[];

  // Performance History
  @OneToMany(() => SupplierPerformance, performance => performance.supplier)
  performanceHistory: SupplierPerformance[];

  @OneToMany(() => LogisticsShipment, shipment => shipment.supplier)
  shipments: LogisticsShipment[];

  @OneToMany(() => TraceabilityRecord, record => record.supplier)
  traceabilityRecords: TraceabilityRecord[];

  // Audit fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 100, nullable: true })
  createdBy: string;

  @Column({ length: 100, nullable: true })
  updatedBy: string;

  // Business Methods
  isPrimarySupplier(): boolean {
    return this.status === SupplierStatus.PREFERRED || 
           this.status === SupplierStatus.STRATEGIC;
  }

  isActive(): boolean {
    return this.status === SupplierStatus.ACTIVE ||
           this.status === SupplierStatus.PREFERRED ||
           this.status === SupplierStatus.STRATEGIC;
  }

  isHighRisk(): boolean {
    return this.riskLevel === RiskLevel.HIGH || 
           this.riskLevel === RiskLevel.CRITICAL;
  }

  getOverallScore(): number {
    if (!this.performanceMetrics?.overallScore) return 0;
    return this.performanceMetrics.overallScore;
  }

  getPrimaryContact(): SupplierNetwork['contacts'][0] | null {
    return this.contacts.find(contact => contact.isPrimary) || 
           this.contacts.find(contact => contact.type === 'primary') || 
           this.contacts[0] || null;
  }

  getPrimaryAddress(): SupplierNetwork['addresses'][0] | null {
    return this.addresses.find(addr => addr.isPrimary) ||
           this.addresses.find(addr => addr.type === 'headquarters') ||
           this.addresses[0] || null;
  }

  calculateRiskScore(): number {
    if (!this.riskAssessment) return 50; // Default medium risk

    const weights = {
      geopoliticalRisk: 0.15,
      financialRisk: 0.25,
      operationalRisk: 0.20,
      cybersecurityRisk: 0.15,
      reputationalRisk: 0.10,
      concentrationRisk: 0.10,
      naturalDisasterRisk: 0.05
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([key, weight]) => {
      const riskValue = this.riskAssessment?.[key as keyof typeof weights];
      if (typeof riskValue === 'number') {
        totalScore += riskValue * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? totalScore / totalWeight : 50;
  }

  getCapacityUtilization(currentOrders: number): number {
    const maxCapacity = this.capabilities?.capacity?.monthlyOutput || 1;
    return (currentOrders / maxCapacity) * 100;
  }

  canFulfillOrder(quantity: number): boolean {
    const minOrder = this.capabilities?.minimumOrderQuantity || 0;
    const maxOrder = this.capabilities?.maximumOrderQuantity || Infinity;
    return quantity >= minOrder && quantity <= maxOrder && this.isActive();
  }

  estimateLeadTime(expedited: boolean = false): number {
    if (!this.capabilities?.leadTimes) return 30; // Default 30 days

    const leadTime = expedited && this.capabilities.leadTimes.expedited
      ? this.capabilities.leadTimes.expedited
      : this.capabilities.leadTimes.standard;

    return this.capabilities.leadTimes.unit === 'weeks' ? leadTime * 7 : leadTime;
  }

  updatePerformanceMetrics(metrics: Partial<SupplierNetwork['performanceMetrics']>): void {
    this.performanceMetrics = { ...this.performanceMetrics, ...metrics };
  }

  addAuditRecord(auditRecord: SupplierNetwork['qualityProfile']['auditHistory'][0]): void {
    if (!this.qualityProfile) {
      this.qualityProfile = { 
        certifications: [], 
        auditHistory: [], 
        complianceStatus: 'under_review' 
      };
    }
    this.qualityProfile.auditHistory = this.qualityProfile.auditHistory || [];
    this.qualityProfile.auditHistory.push(auditRecord);
  }

  isDigitallyIntegrated(): boolean {
    return this.technologyProfile?.ediCapability || 
           this.technologyProfile?.apiIntegration || 
           false;
  }

  getRelationshipDuration(): number {
    if (!this.relationshipData?.relationshipStart) return 0;
    
    const today = new Date();
    const startDate = new Date(this.relationshipData.relationshipStart);
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Days
  }

  isCertified(certification: string): boolean {
    return this.qualityProfile?.certifications?.some(cert => 
      cert.name.toLowerCase().includes(certification.toLowerCase())
    ) || false;
  }

  getSustainabilityRating(): 'excellent' | 'good' | 'fair' | 'poor' {
    const score = this.sustainabilityProfile?.esgScore || 0;
    
    if (score >= 80) return 'excellent';
    if (score >= 65) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  }

  requiresReview(): boolean {
    const lastAssessment = this.riskAssessment?.lastAssessmentDate;
    if (!lastAssessment) return true;

    const daysSinceAssessment = Math.floor(
      (new Date().getTime() - new Date(lastAssessment).getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceAssessment > 90; // Review every 3 months
  }
}
