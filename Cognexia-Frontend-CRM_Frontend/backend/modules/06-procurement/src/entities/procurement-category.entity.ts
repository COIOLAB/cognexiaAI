// Industry 5.0 ERP Backend - Procurement Module
// ProcurementCategory Entity - Advanced procurement category management with AI analytics and spend optimization
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { PurchaseRequisition } from './purchase-requisition.entity';
import { LineItem } from './line-item.entity';

export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UNDER_REVIEW = 'under_review',
  RESTRICTED = 'restricted',
  DEPRECATED = 'deprecated'
}

export enum CategoryType {
  DIRECT = 'direct',           // Direct materials for production
  INDIRECT = 'indirect',       // Indirect materials and services
  SERVICES = 'services',       // Professional services
  CAPITAL = 'capital',         // Capital equipment and assets
  MRO = 'mro',                // Maintenance, Repair, Operations
  IT = 'it',                  // Information Technology
  FACILITIES = 'facilities',   // Facilities and real estate
  MARKETING = 'marketing',     // Marketing and advertising
  HR = 'hr',                  // Human Resources
  LEGAL = 'legal'             // Legal services
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum StrategicImportance {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  STRATEGIC = 'strategic'
}

@Entity('procurement_categories')
@Index(['categoryCode'])
@Index(['name', 'type'])
@Index(['status', 'strategicImportance'])
@Index(['parentCategoryId'])
export class ProcurementCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  @Index()
  categoryCode: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: CategoryType,
    default: CategoryType.INDIRECT
  })
  type: CategoryType;

  @Column({
    type: 'enum',
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE
  })
  status: CategoryStatus;

  // Hierarchy Management
  @Column({ type: 'uuid', nullable: true })
  parentCategoryId: string;

  @ManyToOne(() => ProcurementCategory, category => category.subcategories)
  @JoinColumn({ name: 'parentCategoryId' })
  parentCategory: ProcurementCategory;

  @OneToMany(() => ProcurementCategory, category => category.parentCategory)
  subcategories: ProcurementCategory[];

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ length: 500, nullable: true })
  hierarchyPath: string; // e.g., "Root > IT > Hardware > Servers"

  // Strategic Classification
  @Column({
    type: 'enum',
    enum: StrategicImportance,
    default: StrategicImportance.MEDIUM
  })
  strategicImportance: StrategicImportance;

  @Column({
    type: 'enum',
    enum: RiskLevel,
    default: RiskLevel.MEDIUM
  })
  riskLevel: RiskLevel;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 50 })
  complexityScore: number; // 0-100 scale

  // Financial Information
  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  totalAnnualSpend: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  budgetAllocated: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  budgetUtilized: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  averageOrderValue: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  // Sourcing Strategy
  @Column({ type: 'json', nullable: true })
  sourcingStrategy: {
    preferredStrategy: 'single_source' | 'dual_source' | 'multi_source' | 'competitive_bidding';
    minimumSuppliers: number;
    maximumSuppliers: number;
    evaluationCriteria: {
      criterion: string;
      weight: number;
      description: string;
    }[];
    contractDuration: {
      min: number;
      max: number;
      preferred: number;
      unit: 'months' | 'years';
    };
    renewalStrategy: string;
  };

  // Compliance and Requirements
  @Column({ type: 'json', nullable: true })
  complianceRequirements: {
    regulations: string[];
    certifications: string[];
    licenses: string[];
    auditRequirements: string[];
    documentationRequired: string[];
    approvalWorkflow: {
      level: number;
      role: string;
      threshold: number;
    }[];
  };

  // Quality Standards
  @Column({ type: 'json', nullable: true })
  qualityStandards: {
    standards: string[];
    inspectionRequired: boolean;
    testingRequired: boolean;
    qualityMetrics: {
      metric: string;
      target: number;
      unit: string;
      tolerance: number;
    }[];
    supplierQualification: {
      required: boolean;
      criteria: string[];
      validityPeriod: number;
    };
  };

  // Supplier Management
  @Column({ type: 'json', nullable: true })
  supplierManagement: {
    totalSuppliers: number;
    activeSuppliers: number;
    preferredSuppliers: string[];
    blacklistedSuppliers: string[];
    supplierDiversityTarget: number;
    localSourcingPreference: boolean;
    sustainabilityRequirements: string[];
    performanceMetrics: {
      onTimeDelivery: number;
      qualityRating: number;
      costCompetitiveness: number;
      responsiveness: number;
    };
  };

  // Risk Assessment
  @Column({ type: 'json', nullable: true })
  riskAssessment: {
    supplyRisk: {
      level: RiskLevel;
      factors: string[];
      mitigation: string[];
    };
    marketRisk: {
      level: RiskLevel;
      volatility: number;
      trends: string[];
      priceFluctuationRange: { min: number; max: number };
    };
    geopoliticalRisk: {
      level: RiskLevel;
      affectedRegions: string[];
      impactDescription: string;
    };
    environmentalRisk: {
      level: RiskLevel;
      sustainabilityImpact: string;
      carbonFootprint: number;
    };
    lastAssessmentDate: Date;
    nextReviewDate: Date;
  };

  // Market Intelligence
  @Column({ type: 'json', nullable: true })
  marketIntelligence: {
    marketSize: number;
    growthRate: number;
    keyPlayers: {
      name: string;
      marketShare: number;
      strengths: string[];
      weaknesses: string[];
    }[];
    pricingTrends: {
      period: string;
      trend: 'rising' | 'stable' | 'falling';
      percentageChange: number;
      drivingFactors: string[];
    }[];
    innovationTrends: string[];
    benchmarkPrices: {
      product: string;
      price: number;
      source: string;
      date: Date;
    }[];
    lastUpdated: Date;
  };

  // Performance Metrics
  @Column({ type: 'json', nullable: true })
  performanceMetrics: {
    spendManagement: {
      savingsAchieved: number;
      savingsTarget: number;
      costAvoidance: number;
      spendCompliance: number;
    };
    operational: {
      averageProcurementCycleTime: number;
      orderAccuracy: number;
      invoiceAccuracy: number;
      contractCompliance: number;
    };
    supplier: {
      onTimeDeliveryRate: number;
      qualityRating: number;
      supplierSatisfaction: number;
      supplierDiversityRatio: number;
    };
    sustainability: {
      sustainableSpendPercentage: number;
      carbonReduction: number;
      localSourcingPercentage: number;
      circularEconomyInitiatives: number;
    };
  };

  // AI Analytics and Insights
  @Column({ type: 'json', nullable: true })
  aiAnalytics: {
    spendOptimization: {
      potentialSavings: number;
      optimizationOpportunities: string[];
      recommendedActions: string[];
      confidence: number;
    };
    demandForecasting: {
      nextQuarterDemand: number;
      seasonalityFactors: { month: number; factor: number }[];
      trendAnalysis: string;
      accuracy: number;
    };
    supplierRecommendations: {
      suppliers: {
        supplierId: string;
        score: number;
        reasons: string[];
        riskFactors: string[];
      }[];
      diversificationRecommendations: string[];
    };
    priceAnalytics: {
      currentMarketPrice: number;
      priceVariance: number;
      benchmarkPosition: string;
      priceProjection: {
        nextMonth: number;
        nextQuarter: number;
        confidence: number;
      };
    };
    riskPrediction: {
      riskScore: number;
      criticalFactors: string[];
      mitigation: string[];
      impactAssessment: string;
    };
  };

  // Workflow Configuration
  @Column({ type: 'json', nullable: true })
  workflowConfiguration: {
    approvalThresholds: {
      threshold: number;
      approverRole: string;
      parallel: boolean;
    }[];
    mandatoryFields: string[];
    automaticApprovalRules: {
      condition: string;
      value: any;
      action: string;
    }[];
    escalationRules: {
      timeframe: number;
      escalateTo: string;
      conditions: string[];
    }[];
  };

  // Integration and External Systems
  @Column({ type: 'json', nullable: true })
  integrationSettings: {
    erpIntegration: {
      enabled: boolean;
      accountCode: string;
      syncFrequency: string;
      lastSync: Date;
    };
    supplierPortals: {
      portalId: string;
      categoryMapping: string;
      enabled: boolean;
    }[];
    marketDataFeeds: {
      provider: string;
      feedType: string;
      updateFrequency: string;
      lastUpdate: Date;
    }[];
  };

  // Business Rules and Policies
  @Column({ type: 'json', nullable: true })
  businessRules: {
    minimumOrderValue: number;
    maximumOrderValue: number;
    bulkDiscountThresholds: {
      quantity: number;
      discount: number;
    }[];
    mandatoryCompetitiveBidding: boolean;
    competitiveBiddingThreshold: number;
    emergencyProcurementRules: {
      allowEmergencyProcurement: boolean;
      maxEmergencyValue: number;
      approvalRequired: boolean;
      justificationRequired: boolean;
    };
    contractRequirements: {
      minimumContractValue: number;
      standardTerms: string[];
      mandatoryClauses: string[];
    };
  };

  // Relationships
  @OneToMany(() => PurchaseRequisition, requisition => requisition.category)
  requisitions: PurchaseRequisition[];

  @OneToMany(() => LineItem, lineItem => lineItem.category)
  lineItems: LineItem[];

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
    return this.status === CategoryStatus.ACTIVE;
  }

  isRestricted(): boolean {
    return this.status === CategoryStatus.RESTRICTED;
  }

  isHighRisk(): boolean {
    return this.riskLevel === RiskLevel.HIGH || this.riskLevel === RiskLevel.CRITICAL;
  }

  isStrategic(): boolean {
    return this.strategicImportance === StrategicImportance.STRATEGIC ||
           this.strategicImportance === StrategicImportance.HIGH;
  }

  getBudgetUtilizationPercentage(): number {
    if (this.budgetAllocated === 0) return 0;
    return Math.round((this.budgetUtilized / this.budgetAllocated) * 100);
  }

  getRemainingBudget(): number {
    return Math.max(0, this.budgetAllocated - this.budgetUtilized);
  }

  isOverBudget(): boolean {
    return this.budgetUtilized > this.budgetAllocated;
  }

  getSpendVariance(): number {
    return this.budgetUtilized - this.budgetAllocated;
  }

  calculateSavingsAchieved(): number {
    return this.performanceMetrics?.spendManagement?.savingsAchieved || 0;
  }

  getSavingsPercentage(): number {
    if (this.totalAnnualSpend === 0) return 0;
    const savings = this.calculateSavingsAchieved();
    return Math.round((savings / this.totalAnnualSpend) * 100);
  }

  requiresApproval(amount: number): boolean {
    if (!this.workflowConfiguration?.approvalThresholds) return false;
    return this.workflowConfiguration.approvalThresholds.some(
      threshold => amount >= threshold.threshold
    );
  }

  getApprovalThreshold(amount: number): any {
    if (!this.workflowConfiguration?.approvalThresholds) return null;
    return this.workflowConfiguration.approvalThresholds
      .filter(threshold => amount >= threshold.threshold)
      .sort((a, b) => b.threshold - a.threshold)[0] || null;
  }

  requiresCompetitiveBidding(amount: number): boolean {
    if (!this.businessRules?.competitiveBiddingThreshold) return false;
    return amount >= this.businessRules.competitiveBiddingThreshold;
  }

  isEmergencyProcurementAllowed(amount: number): boolean {
    const rules = this.businessRules?.emergencyProcurementRules;
    if (!rules?.allowEmergencyProcurement) return false;
    return amount <= (rules.maxEmergencyValue || Infinity);
  }

  getPreferredSuppliers(): string[] {
    return this.supplierManagement?.preferredSuppliers || [];
  }

  isSupplierBlacklisted(supplierId: string): boolean {
    return this.supplierManagement?.blacklistedSuppliers?.includes(supplierId) || false;
  }

  getMarketTrend(): 'rising' | 'stable' | 'falling' | 'unknown' {
    const latestTrend = this.marketIntelligence?.pricingTrends?.[0];
    return latestTrend?.trend || 'unknown';
  }

  getPriceVolatility(): number {
    return this.riskAssessment?.marketRisk?.volatility || 0;
  }

  getComplexityLevel(): 'low' | 'medium' | 'high' | 'very_high' {
    const score = this.complexityScore;
    if (score <= 25) return 'low';
    if (score <= 50) return 'medium';
    if (score <= 75) return 'high';
    return 'very_high';
  }

  updatePerformanceMetrics(metrics: Partial<ProcurementCategory['performanceMetrics']>): void {
    this.performanceMetrics = { ...this.performanceMetrics, ...metrics };
  }

  updateAIAnalytics(analytics: Partial<ProcurementCategory['aiAnalytics']>): void {
    this.aiAnalytics = { ...this.aiAnalytics, ...analytics };
  }

  updateMarketIntelligence(intelligence: Partial<ProcurementCategory['marketIntelligence']>): void {
    this.marketIntelligence = { ...this.marketIntelligence, ...intelligence };
  }

  addSubcategory(subcategoryId: string): void {
    // This would be handled by the relationship, but useful for validation
    if (!this.subcategories) this.subcategories = [];
  }

  getHierarchyLevel(): number {
    return this.level;
  }

  buildHierarchyPath(): string {
    // This would typically be built during save/update operations
    let path = this.name;
    if (this.parentCategory) {
      path = this.parentCategory.buildHierarchyPath() + ' > ' + this.name;
    }
    return path;
  }

  updateBudgetUtilization(amount: number): void {
    this.budgetUtilized += amount;
  }

  updateAnnualSpend(amount: number): void {
    this.totalAnnualSpend += amount;
  }

  getAISavingsOpportunity(): number {
    return this.aiAnalytics?.spendOptimization?.potentialSavings || 0;
  }

  getPredictedDemand(): number {
    return this.aiAnalytics?.demandForecasting?.nextQuarterDemand || 0;
  }

  getRiskScore(): number {
    return this.aiAnalytics?.riskPrediction?.riskScore || 0;
  }

  getSupplierRecommendations(): any[] {
    return this.aiAnalytics?.supplierRecommendations?.suppliers || [];
  }

  isMaintenanceRequired(): boolean {
    const lastAssessment = this.riskAssessment?.lastAssessmentDate;
    if (!lastAssessment) return true;
    
    const daysSinceAssessment = Math.floor(
      (new Date().getTime() - lastAssessment.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysSinceAssessment > 90; // Quarterly review
  }

  needsMarketIntelligenceUpdate(): boolean {
    const lastUpdate = this.marketIntelligence?.lastUpdated;
    if (!lastUpdate) return true;
    
    const daysSinceUpdate = Math.floor(
      (new Date().getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysSinceUpdate > 30; // Monthly update
  }
}
