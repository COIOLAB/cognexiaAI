// Industry 5.0 ERP Backend - Procurement Module
// Vendor Entity - Advanced vendor management with AI-powered performance analytics and risk assessment
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { Contract } from './contract.entity';
import { SupplierPerformanceMetric } from './supplier-performance-metric.entity';

export enum VendorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SUSPENDED = 'suspended',
  BLACKLISTED = 'blacklisted',
  PREFERRED = 'preferred',
  STRATEGIC = 'strategic',
  UNDER_REVIEW = 'under_review'
}

export enum VendorType {
  MANUFACTURER = 'manufacturer',
  DISTRIBUTOR = 'distributor',
  RESELLER = 'reseller',
  SERVICE_PROVIDER = 'service_provider',
  CONSULTANT = 'consultant',
  CONTRACTOR = 'contractor',
  BROKER = 'broker',
  AGENT = 'agent'
}

export enum VendorSize {
  MICRO = 'micro',           // < 10 employees
  SMALL = 'small',           // 10-49 employees
  MEDIUM = 'medium',         // 50-249 employees
  LARGE = 'large',           // 250-999 employees
  ENTERPRISE = 'enterprise'   // 1000+ employees
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum QualificationStatus {
  NOT_QUALIFIED = 'not_qualified',
  UNDER_QUALIFICATION = 'under_qualification',
  QUALIFIED = 'qualified',
  DISQUALIFIED = 'disqualified',
  EXPIRED = 'expired'
}

@Entity('vendors')
@Index(['vendorCode'])
@Index(['companyName', 'status'])
@Index(['type', 'size'])
@Index(['country', 'region'])
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  @Index()
  vendorCode: string;

  // Company Information
  @Column({ length: 255 })
  companyName: string;

  @Column({ length: 255, nullable: true })
  legalName: string;

  @Column({ length: 100, nullable: true })
  tradeName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: VendorType,
    default: VendorType.MANUFACTURER
  })
  type: VendorType;

  @Column({
    type: 'enum',
    enum: VendorStatus,
    default: VendorStatus.PENDING_APPROVAL
  })
  status: VendorStatus;

  @Column({
    type: 'enum',
    enum: VendorSize,
    default: VendorSize.MEDIUM
  })
  size: VendorSize;

  // Registration and Legal Information
  @Column({ length: 100, nullable: true })
  registrationNumber: string;

  @Column({ length: 100, nullable: true })
  taxId: string;

  @Column({ length: 100, nullable: true })
  vatNumber: string;

  @Column({ length: 100, nullable: true })
  dunsNumber: string;

  @Column({ type: 'date', nullable: true })
  incorporationDate: Date;

  @Column({ length: 100, nullable: true })
  legalStructure: string; // Corporation, LLC, Partnership, etc.

  // Contact Information
  @Column({ type: 'json' })
  addresses: {
    type: 'headquarters' | 'billing' | 'shipping' | 'branch' | 'warehouse';
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

  @Column({ type: 'json' })
  contacts: {
    type: 'primary' | 'sales' | 'technical' | 'financial' | 'legal' | 'support';
    name: string;
    title: string;
    email: string;
    phone: string;
    mobile?: string;
    isPrimary: boolean;
    department?: string;
  }[];

  @Column({ length: 100, nullable: true })
  website: string;

  // Financial Information
  @Column({ type: 'json', nullable: true })
  financialProfile: {
    annualRevenue?: number;
    employeeCount?: number;
    creditRating?: string;
    financialStrength?: 'weak' | 'fair' | 'good' | 'strong' | 'excellent';
    paymentTerms?: string;
    preferredCurrency?: string;
    bankingInformation?: {
      bankName: string;
      accountNumber: string;
      routingNumber?: string;
      swiftCode?: string;
      iban?: string;
    }[];
    insuranceCoverage?: {
      type: string;
      provider: string;
      amount: number;
      expiryDate: Date;
    }[];
    bondingCapacity?: number;
  };

  // Capabilities and Services
  @Column({ type: 'json' })
  capabilities: {
    categories: string[];
    products: string[];
    services: string[];
    industries: string[];
    geographicCoverage: string[];
    capacity: {
      dailyOutput?: number;
      monthlyOutput?: number;
      annualRevenue?: number;
      unit?: string;
    };
    certifications: string[];
    qualityStandards: string[];
    specializations: string[];
    equipmentAndFacilities: string[];
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
      scope?: string;
    }[];
    qualityManagementSystem?: string;
    auditHistory: {
      auditType: string;
      auditor: string;
      auditDate: Date;
      score: number;
      findings: string[];
      correctiveActions: string[];
      followUpDate?: Date;
    }[];
    complianceStatus: 'compliant' | 'non_compliant' | 'under_review';
    nonComplianceIssues?: string[];
    improvementPlan?: string;
  };

  // Performance Metrics
  @Column({ type: 'json', nullable: true })
  performanceMetrics: {
    overall: {
      score: number;
      rating: 'poor' | 'fair' | 'good' | 'excellent';
      trend: 'improving' | 'stable' | 'declining';
    };
    delivery: {
      onTimeDeliveryRate: number;
      leadTimeAccuracy: number;
      fillRate: number;
      damageRate: number;
    };
    quality: {
      qualityScore: number;
      defectRate: number;
      returnRate: number;
      customerSatisfaction: number;
    };
    cost: {
      competitiveness: number;
      priceStability: number;
      costSavingsAchieved: number;
      totalCostOfOwnership: number;
    };
    service: {
      responsiveness: number;
      technicalSupport: number;
      problemResolution: number;
      communicationEffectiveness: number;
    };
    innovation: {
      innovationIndex: number;
      newProductIntroductions: number;
      technologyAdoption: number;
      collaborationLevel: number;
    };
  };

  // Risk Assessment
  @Column({ type: 'json', nullable: true })
  riskAssessment: {
    overallRiskLevel: RiskLevel;
    riskFactors: {
      financial: {
        level: RiskLevel;
        factors: string[];
        mitigation: string[];
      };
      operational: {
        level: RiskLevel;
        factors: string[];
        mitigation: string[];
      };
      geopolitical: {
        level: RiskLevel;
        factors: string[];
        mitigation: string[];
      };
      cybersecurity: {
        level: RiskLevel;
        factors: string[];
        mitigation: string[];
      };
      environmental: {
        level: RiskLevel;
        factors: string[];
        mitigation: string[];
      };
      reputational: {
        level: RiskLevel;
        factors: string[];
        mitigation: string[];
      };
    };
    businessContinuityPlan: boolean;
    contingencySuppliers: string[];
    lastAssessmentDate: Date;
    nextReviewDate: Date;
    assessedBy: string;
  };

  // Sustainability and ESG
  @Column({ type: 'json', nullable: true })
  sustainabilityProfile: {
    esgScore?: number;
    sustainabilityRating?: 'poor' | 'fair' | 'good' | 'excellent';
    environmentalCertifications?: string[];
    carbonFootprint?: number;
    renewableEnergyUsage?: number;
    wasteManagement?: string[];
    socialResponsibility?: {
      diversityPrograms: boolean;
      laborPractices: string;
      communityInvolvement: string[];
      ethicalSourcing: boolean;
    };
    governance?: {
      ethicsPolicy: boolean;
      antiCorruptionPolicy: boolean;
      transparencyIndex: number;
      boardDiversity: number;
    };
    sustainabilityGoals?: {
      goal: string;
      targetDate: Date;
      progress: number;
      status: 'planned' | 'in_progress' | 'achieved';
    }[];
  };

  // Technology Integration
  @Column({ type: 'json', nullable: true })
  technologyProfile: {
    ediCapability: boolean;
    apiIntegration: boolean;
    eCommercePortal: boolean;
    digitalCatalog: boolean;
    blockchainEnabled: boolean;
    iotCapabilities: boolean;
    cloudSolutions: string[];
    cybersecurityMeasures: string[];
    digitalMaturityLevel: 'basic' | 'intermediate' | 'advanced' | 'leader';
    systemsUsed: string[];
    dataExchangeFormats: string[];
    lastTechnologyAudit: Date;
  };

  // Vendor Qualification
  @Column({
    type: 'enum',
    enum: QualificationStatus,
    default: QualificationStatus.NOT_QUALIFIED
  })
  qualificationStatus: QualificationStatus;

  @Column({ type: 'json', nullable: true })
  qualificationDetails: {
    qualificationDate?: Date;
    expiryDate?: Date;
    qualifiedBy?: string;
    qualificationCriteria?: {
      criterion: string;
      score: number;
      maxScore: number;
      passed: boolean;
    }[];
    requiredDocuments?: {
      document: string;
      submitted: boolean;
      reviewStatus: 'pending' | 'approved' | 'rejected';
      submissionDate?: Date;
    }[];
    onSiteVisit?: {
      conducted: boolean;
      visitDate?: Date;
      visitedBy?: string[];
      findings?: string[];
      recommendations?: string[];
    };
    requalificationDue?: Date;
  };

  // Business Relationship
  @Column({ type: 'json', nullable: true })
  businessRelationship: {
    relationshipStart: Date;
    relationshipType: 'transactional' | 'preferred' | 'strategic_partner';
    spendVolume: {
      annual: number;
      monthly_average: number;
      percentage_of_total: number;
    };
    contractsActive: number;
    exclusiveAgreements: string[];
    keyMilestones: {
      milestone: string;
      date: Date;
      status: 'completed' | 'in_progress' | 'planned';
    }[];
    jointProjects: string[];
    issuesAndDisputes: {
      issue: string;
      date: Date;
      status: 'open' | 'resolved' | 'escalated';
      resolution?: string;
    }[];
  };

  // AI Analytics and Insights
  @Column({ type: 'json', nullable: true })
  aiAnalytics: {
    performancePrediction: {
      predictedScore: number;
      confidence: number;
      trendDirection: 'up' | 'down' | 'stable';
      factors: string[];
    };
    riskPrediction: {
      predictedRiskLevel: RiskLevel;
      confidence: number;
      riskFactors: string[];
      recommendation: string;
    };
    spendOptimization: {
      potentialSavings: number;
      optimizationOpportunities: string[];
      recommendedActions: string[];
    };
    competitiveAnalysis: {
      marketPosition: string;
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    relationshipHealth: {
      healthScore: number;
      strengthFactors: string[];
      riskFactors: string[];
      recommendations: string[];
    };
  };

  // Relationships
  @OneToMany(() => PurchaseOrder, purchaseOrder => purchaseOrder.vendor)
  purchaseOrders: PurchaseOrder[];

  @OneToMany(() => Contract, contract => contract.vendor)
  contracts: Contract[];

  @OneToMany(() => SupplierPerformanceMetric, metric => metric.vendor)
  performanceHistory: SupplierPerformanceMetric[];

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
  isActive(): boolean {
    return [VendorStatus.ACTIVE, VendorStatus.PREFERRED, VendorStatus.STRATEGIC].includes(this.status);
  }

  isPreferred(): boolean {
    return this.status === VendorStatus.PREFERRED || this.status === VendorStatus.STRATEGIC;
  }

  isQualified(): boolean {
    return this.qualificationStatus === QualificationStatus.QUALIFIED;
  }

  isHighRisk(): boolean {
    return this.riskAssessment?.overallRiskLevel === RiskLevel.HIGH ||
           this.riskAssessment?.overallRiskLevel === RiskLevel.CRITICAL;
  }

  getOverallPerformanceScore(): number {
    return this.performanceMetrics?.overall?.score || 0;
  }

  getPerformanceRating(): 'poor' | 'fair' | 'good' | 'excellent' {
    return this.performanceMetrics?.overall?.rating || 'fair';
  }

  getOnTimeDeliveryRate(): number {
    return this.performanceMetrics?.delivery?.onTimeDeliveryRate || 0;
  }

  getQualityScore(): number {
    return this.performanceMetrics?.quality?.qualityScore || 0;
  }

  getPrimaryContact(): Vendor['contacts'][0] | null {
    return this.contacts.find(contact => contact.isPrimary) ||
           this.contacts.find(contact => contact.type === 'primary') ||
           this.contacts[0] || null;
  }

  getPrimaryAddress(): Vendor['addresses'][0] | null {
    return this.addresses.find(addr => addr.isPrimary) ||
           this.addresses.find(addr => addr.type === 'headquarters') ||
           this.addresses[0] || null;
  }

  calculateRiskScore(): number {
    if (!this.riskAssessment?.riskFactors) return 50; // Default medium risk

    const weights = {
      financial: 0.25,
      operational: 0.20,
      geopolitical: 0.15,
      cybersecurity: 0.15,
      environmental: 0.15,
      reputational: 0.10
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([category, weight]) => {
      const riskCategory = this.riskAssessment.riskFactors[category as keyof typeof this.riskAssessment.riskFactors];
      if (riskCategory) {
        const levelScore = this.getRiskLevelScore(riskCategory.level);
        totalScore += levelScore * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? totalScore / totalWeight : 50;
  }

  private getRiskLevelScore(level: RiskLevel): number {
    switch (level) {
      case RiskLevel.LOW: return 25;
      case RiskLevel.MEDIUM: return 50;
      case RiskLevel.HIGH: return 75;
      case RiskLevel.CRITICAL: return 100;
      default: return 50;
    }
  }

  isQualificationExpiring(daysThreshold: number = 30): boolean {
    if (!this.qualificationDetails?.expiryDate) return false;
    
    const today = new Date();
    const daysUntilExpiry = Math.floor(
      (this.qualificationDetails.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysUntilExpiry <= daysThreshold && daysUntilExpiry >= 0;
  }

  requiresRequalification(): boolean {
    if (!this.qualificationDetails?.requalificationDue) return false;
    return new Date() >= this.qualificationDetails.requalificationDue;
  }

  hasActiveCertification(certificationName: string): boolean {
    if (!this.qualityProfile?.certifications) return false;
    
    return this.qualityProfile.certifications.some(cert => 
      cert.name.toLowerCase().includes(certificationName.toLowerCase()) &&
      new Date() <= cert.expiryDate
    );
  }

  getExpiringCertifications(daysThreshold: number = 90): any[] {
    if (!this.qualityProfile?.certifications) return [];
    
    const today = new Date();
    return this.qualityProfile.certifications.filter(cert => {
      const daysUntilExpiry = Math.floor(
        (cert.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= daysThreshold && daysUntilExpiry >= 0;
    });
  }

  updatePerformanceMetrics(metrics: Partial<Vendor['performanceMetrics']>): void {
    this.performanceMetrics = { ...this.performanceMetrics, ...metrics };
  }

  updateRiskAssessment(assessment: Partial<Vendor['riskAssessment']>): void {
    this.riskAssessment = { ...this.riskAssessment, ...assessment };
  }

  updateAIAnalytics(analytics: Partial<Vendor['aiAnalytics']>): void {
    this.aiAnalytics = { ...this.aiAnalytics, ...analytics };
  }

  addContact(contact: Vendor['contacts'][0]): void {
    if (!this.contacts) this.contacts = [];
    
    // If this is marked as primary, remove primary flag from others
    if (contact.isPrimary) {
      this.contacts.forEach(c => c.isPrimary = false);
    }
    
    this.contacts.push(contact);
  }

  removeContact(email: string): void {
    if (!this.contacts) return;
    this.contacts = this.contacts.filter(contact => contact.email !== email);
  }

  addAddress(address: Vendor['addresses'][0]): void {
    if (!this.addresses) this.addresses = [];
    
    // If this is marked as primary, remove primary flag from others
    if (address.isPrimary) {
      this.addresses.forEach(addr => addr.isPrimary = false);
    }
    
    this.addresses.push(address);
  }

  approveVendor(approvedBy: string): void {
    this.status = VendorStatus.APPROVED;
    this.updatedBy = approvedBy;
    this.updatedAt = new Date();
  }

  suspendVendor(reason: string, suspendedBy: string): void {
    this.status = VendorStatus.SUSPENDED;
    this.updatedBy = suspendedBy;
    this.updatedAt = new Date();
    
    // Could add suspension reason to a notes field or audit log
  }

  blacklistVendor(reason: string, blacklistedBy: string): void {
    this.status = VendorStatus.BLACKLISTED;
    this.updatedBy = blacklistedBy;
    this.updatedAt = new Date();
    
    // Could add blacklist reason to a notes field or audit log
  }

  promoteToPreferred(promotedBy: string): void {
    this.status = VendorStatus.PREFERRED;
    this.updatedBy = promotedBy;
    this.updatedAt = new Date();
  }

  promoteToStrategic(promotedBy: string): void {
    this.status = VendorStatus.STRATEGIC;
    this.updatedBy = promotedBy;
    this.updatedAt = new Date();
  }

  getRelationshipDuration(): number {
    if (!this.businessRelationship?.relationshipStart) return 0;
    
    const today = new Date();
    const startDate = new Date(this.businessRelationship.relationshipStart);
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Days
  }

  getAnnualSpend(): number {
    return this.businessRelationship?.spendVolume?.annual || 0;
  }

  getSustainabilityRating(): 'poor' | 'fair' | 'good' | 'excellent' {
    return this.sustainabilityProfile?.sustainabilityRating || 'fair';
  }

  getESGScore(): number {
    return this.sustainabilityProfile?.esgScore || 0;
  }

  isDigitallyIntegrated(): boolean {
    return this.technologyProfile?.ediCapability || 
           this.technologyProfile?.apiIntegration ||
           this.technologyProfile?.eCommercePortal || false;
  }

  getDigitalMaturityLevel(): 'basic' | 'intermediate' | 'advanced' | 'leader' {
    return this.technologyProfile?.digitalMaturityLevel || 'basic';
  }
}
