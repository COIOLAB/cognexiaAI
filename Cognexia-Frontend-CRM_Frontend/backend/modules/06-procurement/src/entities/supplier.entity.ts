import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  ManyToMany,
  JoinTable,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { IsEmail, IsOptional, IsEnum, IsJSON, IsArray, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { v4 as uuid } from 'uuid';

export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  UNDER_REVIEW = 'under_review',
  BLACKLISTED = 'blacklisted',
  PREFERRED = 'preferred',
  STRATEGIC = 'strategic',
}

export enum SupplierType {
  MANUFACTURER = 'manufacturer',
  DISTRIBUTOR = 'distributor',
  SERVICE_PROVIDER = 'service_provider',
  CONSULTANT = 'consultant',
  CONTRACTOR = 'contractor',
  LOGISTICS = 'logistics',
  TECHNOLOGY = 'technology',
  RAW_MATERIAL = 'raw_material',
}

export enum RiskLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ComplianceLevel {
  NON_COMPLIANT = 'non_compliant',
  PARTIALLY_COMPLIANT = 'partially_compliant',
  COMPLIANT = 'compliant',
  EXCEEDS_STANDARDS = 'exceeds_standards',
  BEST_IN_CLASS = 'best_in_class',
}

export interface AISupplierInsights {
  performancePrediction: {
    qualityScore: number;
    deliveryReliability: number;
    costEfficiency: number;
    innovationPotential: number;
  };
  marketPosition: {
    competitiveRanking: number;
    marketShare: number;
    growthTrend: number;
    disruptionRisk: number;
  };
  riskAnalysis: {
    financialStability: number;
    operationalRisk: number;
    geopoliticalRisk: number;
    cybersecurityRisk: number;
    sustainabilityRisk: number;
  };
  strategicRecommendations: string[];
  optimizationOpportunities: string[];
}

export interface SustainabilityMetrics {
  carbonFootprint: {
    scope1: number;
    scope2: number;
    scope3: number;
    totalCO2e: number;
  };
  environmentalScore: number;
  socialResponsibilityScore: number;
  governanceScore: number;
  overallESGScore: number;
  certifications: {
    iso14001: boolean;
    iso45001: boolean;
    bCorp: boolean;
    fairTrade: boolean;
    sustainabilityReporting: boolean;
  };
  circularEconomyMetrics: {
    wasteReduction: number;
    recyclingRate: number;
    renewableEnergyUsage: number;
    waterEfficiency: number;
  };
}

export interface PerformanceMetrics {
  qualityMetrics: {
    defectRate: number;
    returnRate: number;
    firstPassYield: number;
    customerSatisfaction: number;
  };
  deliveryMetrics: {
    onTimeDelivery: number;
    deliveryAccuracy: number;
    leadTimeVariance: number;
    fillRate: number;
  };
  costMetrics: {
    competitiveIndex: number;
    costTrend: number;
    paymentTermsScore: number;
    totalCostOfOwnership: number;
  };
  innovationMetrics: {
    rdInvestment: number;
    patentCount: number;
    newProductIntroduction: number;
    technologyAdoption: number;
  };
  responsiveness: {
    communicationScore: number;
    issueResolutionTime: number;
    flexibilityRating: number;
    collaborationLevel: number;
  };
}

export interface FinancialProfile {
  revenue: {
    annual: number;
    growth: number;
    stability: number;
  };
  profitability: {
    grossMargin: number;
    netMargin: number;
    ebitda: number;
  };
  liquidity: {
    currentRatio: number;
    quickRatio: number;
    cashFlow: number;
  };
  leverage: {
    debtToEquity: number;
    interestCoverage: number;
    workingCapital: number;
  };
  creditRating: {
    rating: string;
    score: number;
    outlook: string;
  };
  financialStability: number;
}

export interface GeographicPresence {
  headquarters: {
    country: string;
    region: string;
    city: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  facilities: Array<{
    type: string;
    country: string;
    region: string;
    city: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    capabilities: string[];
    capacity: number;
    certifications: string[];
  }>;
  serviceAreas: string[];
  logisticsNetwork: {
    distributionCenters: number;
    transportationFleet: number;
    lastMileCapability: boolean;
    crossBorderExperience: boolean;
  };
}

@Entity('suppliers')
@Index(['status', 'supplierType'])
@Index(['overallScore'], { where: 'overall_score IS NOT NULL' })
@Index(['riskLevel', 'complianceLevel'])
@Index(['sustainabilityScore'], { where: 'sustainability_score IS NOT NULL' })
@Index(['preferredSupplier', 'strategicSupplier'])
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  supplierCode: string;

  @Column({ length: 255 })
  @Index()
  companyName: string;

  @Column({ length: 255, nullable: true })
  legalName: string;

  @Column({ length: 100, nullable: true })
  dbaName: string;

  @Column({
    type: 'enum',
    enum: SupplierStatus,
    default: SupplierStatus.ACTIVE,
  })
  status: SupplierStatus;

  @Column({
    type: 'enum',
    enum: SupplierType,
  })
  supplierType: SupplierType;

  @Column('simple-array', { nullable: true })
  categories: string[];

  @Column('simple-array', { nullable: true })
  subCategories: string[];

  // Contact Information
  @Column({ length: 100, nullable: true })
  primaryContactName: string;

  @Column({ length: 100, nullable: true })
  primaryContactTitle: string;

  @Column({ length: 20, nullable: true })
  primaryContactPhone: string;

  @Column({ length: 255, nullable: true })
  @IsEmail()
  primaryContactEmail: string;

  @Column({ length: 500, nullable: true })
  website: string;

  // Address Information
  @Column({ length: 500, nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 50, nullable: true })
  state: string;

  @Column({ length: 20, nullable: true })
  postalCode: string;

  @Column({ length: 100, nullable: true })
  country: string;

  @Column({ length: 100, nullable: true })
  region: string;

  // Business Information
  @Column({ length: 50, nullable: true })
  taxId: string;

  @Column({ length: 50, nullable: true })
  dunsBradstreetNumber: string;

  @Column({ length: 50, nullable: true })
  cageCode: string;

  @Column('simple-array', { nullable: true })
  businessRegistrations: string[];

  @Column('simple-array', { nullable: true })
  licenses: string[];

  @Column('simple-array', { nullable: true })
  certifications: string[];

  @Column('simple-array', { nullable: true })
  industryStandards: string[];

  // Financial Information
  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  annualRevenue: number;

  @Column({ type: 'int', nullable: true })
  employeeCount: number;

  @Column({ length: 10, nullable: true })
  creditRating: string;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  @Min(0)
  @Max(100)
  financialStabilityScore: number;

  @Column({ type: 'jsonb', nullable: true })
  @IsJSON()
  financialProfile: FinancialProfile;

  // Performance Metrics
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  @Min(0)
  @Max(100)
  overallScore: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  @Min(0)
  @Max(100)
  qualityScore: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  @Min(0)
  @Max(100)
  deliveryScore: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  @Min(0)
  @Max(100)
  costCompetitivenessScore: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  @Min(0)
  @Max(100)
  innovationScore: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  @Min(0)
  @Max(100)
  sustainabilityScore: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  @Min(0)
  @Max(100)
  responsivenessScore: number;

  @Column({ type: 'jsonb', nullable: true })
  @IsJSON()
  performanceMetrics: PerformanceMetrics;

  // Risk Management
  @Column({
    type: 'enum',
    enum: RiskLevel,
    default: RiskLevel.MEDIUM,
  })
  riskLevel: RiskLevel;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  @Min(0)
  @Max(100)
  riskScore: number;

  @Column('simple-array', { nullable: true })
  riskFactors: string[];

  @Column('simple-array', { nullable: true })
  mitigationStrategies: string[];

  @Column({ type: 'timestamp', nullable: true })
  lastRiskAssessment: Date;

  // Compliance
  @Column({
    type: 'enum',
    enum: ComplianceLevel,
    default: ComplianceLevel.COMPLIANT,
  })
  complianceLevel: ComplianceLevel;

  @Column('simple-array', { nullable: true })
  complianceRequirements: string[];

  @Column({ type: 'timestamp', nullable: true })
  lastComplianceReview: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextComplianceReview: Date;

  // Sustainability
  @Column({ type: 'jsonb', nullable: true })
  @IsJSON()
  sustainabilityMetrics: SustainabilityMetrics;

  @Column('simple-array', { nullable: true })
  sustainabilityCertifications: string[];

  @Column({ type: 'boolean', default: false })
  diverseSupplier: boolean;

  @Column({ type: 'boolean', default: false })
  localSupplier: boolean;

  @Column({ type: 'boolean', default: false })
  minorityOwned: boolean;

  @Column({ type: 'boolean', default: false })
  womenOwned: boolean;

  @Column({ type: 'boolean', default: false })
  veteranOwned: boolean;

  @Column({ type: 'boolean', default: false })
  smallBusiness: boolean;

  // Strategic Classification
  @Column({ type: 'boolean', default: false })
  preferredSupplier: boolean;

  @Column({ type: 'boolean', default: false })
  strategicSupplier: boolean;

  @Column({ type: 'boolean', default: false })
  criticalSupplier: boolean;

  @Column({ type: 'boolean', default: false })
  singleSource: boolean;

  @Column({ type: 'boolean', default: false })
  approvedSupplier: boolean;

  // Geographic and Operational Information
  @Column({ type: 'jsonb', nullable: true })
  @IsJSON()
  geographicPresence: GeographicPresence;

  @Column('simple-array', { nullable: true })
  servicedRegions: string[];

  @Column('simple-array', { nullable: true })
  capabilities: string[];

  @Column('simple-array', { nullable: true })
  technologies: string[];

  @Column({ type: 'int', nullable: true })
  capacityUtilization: number;

  @Column({ type: 'int', nullable: true })
  leadTimeAverage: number;

  @Column({ type: 'int', nullable: true })
  minimumOrderQuantity: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  maximumOrderValue: number;

  // Payment Terms
  @Column({ type: 'int', default: 30 })
  standardPaymentTerms: number;

  @Column('simple-array', { nullable: true })
  acceptedPaymentMethods: string[];

  @Column({ length: 10, nullable: true })
  preferredCurrency: string;

  // Insurance and Banking
  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  insuranceCoverage: number;

  @Column({ type: 'timestamp', nullable: true })
  insuranceExpiry: Date;

  @Column('simple-array', { nullable: true })
  bankingReferences: string[];

  // AI-Driven Insights
  @Column({ type: 'jsonb', nullable: true })
  @IsJSON()
  aiInsights: AISupplierInsights;

  @Column({ type: 'timestamp', nullable: true })
  lastAIAnalysis: Date;

  @Column('simple-array', { nullable: true })
  aiRecommendations: string[];

  @Column('simple-array', { nullable: true })
  predictedTrends: string[];

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  @Min(0)
  @Max(100)
  aiConfidenceScore: number;

  // Relationship Management
  @Column({ length: 255, nullable: true })
  accountManager: string;

  @Column({ length: 255, nullable: true })
  relationshipType: string;

  @Column({ type: 'int', nullable: true })
  relationshipDuration: number;

  @Column('text', { nullable: true })
  relationshipNotes: string;

  @Column({ type: 'timestamp', nullable: true })
  lastContactDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextReviewDate: Date;

  // Contract Information
  @Column({ type: 'boolean', default: false })
  hasActiveContract: boolean;

  @Column({ type: 'timestamp', nullable: true })
  contractStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  contractEndDate: Date;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  contractValue: number;

  @Column('simple-array', { nullable: true })
  contractTerms: string[];

  // Performance History
  @Column({ type: 'int', default: 0 })
  totalOrders: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  totalSpend: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  averageOrderValue: number;

  @Column({ type: 'timestamp', nullable: true })
  lastOrderDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  firstOrderDate: Date;

  // System Fields
  @Column({ length: 255, nullable: true })
  createdBy: string;

  @Column({ length: 255, nullable: true })
  updatedBy: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column('text', { nullable: true })
  notes: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  @IsJSON()
  customFields: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  // Relationships would be defined here with other entities
  // Example:
  // @OneToMany(() => PurchaseOrder, purchaseOrder => purchaseOrder.supplier)
  // purchaseOrders: PurchaseOrder[];

  // @OneToMany(() => SupplierEvaluation, evaluation => evaluation.supplier)
  // evaluations: SupplierEvaluation[];

  @BeforeInsert()
  generateSupplierCode() {
    if (!this.supplierCode) {
      const prefix = this.supplierType ? this.supplierType.substring(0, 3).toUpperCase() : 'SUP';
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substring(2, 5).toUpperCase();
      this.supplierCode = `${prefix}-${timestamp}-${random}`;
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  calculateOverallScore() {
    const scores = [
      this.qualityScore,
      this.deliveryScore,
      this.costCompetitivenessScore,
      this.innovationScore,
      this.sustainabilityScore,
      this.responsivenessScore,
    ].filter(score => score !== null && score !== undefined);

    if (scores.length > 0) {
      this.overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  updateRiskLevel() {
    if (this.riskScore !== null && this.riskScore !== undefined) {
      if (this.riskScore <= 20) {
        this.riskLevel = RiskLevel.VERY_LOW;
      } else if (this.riskScore <= 40) {
        this.riskLevel = RiskLevel.LOW;
      } else if (this.riskScore <= 60) {
        this.riskLevel = RiskLevel.MEDIUM;
      } else if (this.riskScore <= 80) {
        this.riskLevel = RiskLevel.HIGH;
      } else {
        this.riskLevel = RiskLevel.CRITICAL;
      }
    }
  }

  // Helper Methods
  getSupplierSummary() {
    return {
      id: this.id,
      supplierCode: this.supplierCode,
      companyName: this.companyName,
      status: this.status,
      supplierType: this.supplierType,
      overallScore: this.overallScore,
      riskLevel: this.riskLevel,
      strategicSupplier: this.strategicSupplier,
      preferredSupplier: this.preferredSupplier,
      totalSpend: this.totalSpend,
      country: this.country,
      primaryContactEmail: this.primaryContactEmail,
      lastOrderDate: this.lastOrderDate,
    };
  }

  isHighPerforming(): boolean {
    return this.overallScore >= 80;
  }

  isLowRisk(): boolean {
    return this.riskLevel === RiskLevel.VERY_LOW || this.riskLevel === RiskLevel.LOW;
  }

  isSustainable(): boolean {
    return this.sustainabilityScore >= 70;
  }

  requiresReview(): boolean {
    const now = new Date();
    return !this.nextReviewDate || this.nextReviewDate <= now;
  }

  updatePerformanceMetrics(newMetrics: Partial<PerformanceMetrics>) {
    this.performanceMetrics = {
      ...this.performanceMetrics,
      ...newMetrics,
    };
  }

  addAIInsight(insights: Partial<AISupplierInsights>) {
    this.aiInsights = {
      ...this.aiInsights,
      ...insights,
    };
    this.lastAIAnalysis = new Date();
  }
}
