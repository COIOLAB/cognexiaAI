// Industry 5.0 ERP Backend - Procurement Module
// SupplierPerformanceMetric Entity - Comprehensive vendor performance tracking with AI-powered analytics
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Vendor } from './vendor.entity';
import { ProcurementCategory } from './procurement-category.entity';

export enum MetricType {
  DELIVERY = 'delivery',
  QUALITY = 'quality',
  COST = 'cost',
  SERVICE = 'service',
  INNOVATION = 'innovation',
  SUSTAINABILITY = 'sustainability',
  COMPLIANCE = 'compliance',
  OVERALL = 'overall'
}

export enum MetricPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually'
}

export enum TrendDirection {
  IMPROVING = 'improving',
  STABLE = 'stable',
  DECLINING = 'declining'
}

@Entity('supplier_performance_metrics')
@Index(['vendorId', 'metricType'])
@Index(['measurementDate', 'metricPeriod'])
@Index(['categoryId', 'metricType'])
export class SupplierPerformanceMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Vendor and Category References
  @Column({ type: 'uuid' })
  vendorId: string;

  @ManyToOne(() => Vendor, vendor => vendor.performanceHistory)
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @Column({ type: 'uuid', nullable: true })
  categoryId: string;

  @ManyToOne(() => ProcurementCategory, category => category.lineItems)
  @JoinColumn({ name: 'categoryId' })
  category: ProcurementCategory;

  // Metric Information
  @Column({
    type: 'enum',
    enum: MetricType
  })
  metricType: MetricType;

  @Column({
    type: 'enum',
    enum: MetricPeriod
  })
  metricPeriod: MetricPeriod;

  @Column({ type: 'date' })
  measurementDate: Date;

  @Column({ type: 'date' })
  periodStartDate: Date;

  @Column({ type: 'date' })
  periodEndDate: Date;

  // Performance Scores (0-100 scale)
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  overallScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  deliveryScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  qualityScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  costScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  serviceScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  innovationScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  sustainabilityScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  complianceScore: number;

  // Detailed Metrics
  @Column({ type: 'json' })
  deliveryMetrics: {
    onTimeDeliveryRate: number;          // Percentage of on-time deliveries
    leadTimeAccuracy: number;            // Accuracy of promised lead times
    fillRate: number;                    // Percentage of complete orders
    damageRate: number;                  // Percentage of damaged goods
    earlyDeliveryRate: number;           // Percentage of early deliveries
    averageLeadTime: number;             // Average lead time in days
    leadTimeVariance: number;            // Variance in lead times
  };

  @Column({ type: 'json' })
  qualityMetrics: {
    defectRate: number;                  // Defects per million opportunities
    returnRate: number;                  // Percentage of returns
    acceptanceRate: number;              // First-pass acceptance rate
    qualityAuditScore: number;           // Latest quality audit score
    certificationCompliance: number;     // Certification compliance rate
    correctiveActionsOpen: number;       // Number of open corrective actions
    customerComplaints: number;          // Number of quality complaints
  };

  @Column({ type: 'json' })
  costMetrics: {
    competitiveness: number;             // Price competitiveness vs market
    priceStability: number;              // Price stability score
    costSavingsAchieved: number;         // Cost savings delivered
    totalCostOfOwnership: number;        // Total cost including all factors
    invoiceAccuracy: number;             // Invoice accuracy percentage
    paymentTermsCompliance: number;      // Payment terms compliance
    costVariance: number;                // Variance from quoted costs
  };

  @Column({ type: 'json' })
  serviceMetrics: {
    responsiveness: number;              // Response time to inquiries
    technicalSupport: number;            // Technical support quality
    problemResolution: number;           // Problem resolution effectiveness
    communicationEffectiveness: number;  // Communication quality
    orderProcessingTime: number;         // Order processing efficiency
    documentationQuality: number;        // Documentation completeness
    customerServiceRating: number;       // Overall customer service rating
  };

  @Column({ type: 'json', nullable: true })
  innovationMetrics: {
    innovationIndex: number;             // Innovation capability score
    newProductIntroductions: number;     // Number of new products introduced
    technologyAdoption: number;          // Technology adoption rate
    collaborationLevel: number;          // Collaboration effectiveness
    rdInvestment: number;                // R&D investment percentage
    patentsGenerated: number;            // Number of patents/innovations
    processImprovements: number;         // Process improvement suggestions
  };

  @Column({ type: 'json', nullable: true })
  sustainabilityMetrics: {
    esgScore: number;                    // Environmental, Social, Governance score
    carbonFootprint: number;            // Carbon footprint assessment
    wasteReduction: number;              // Waste reduction achievements
    energyEfficiency: number;            // Energy efficiency improvements
    socialResponsibility: number;        // Social responsibility score
    ethicalSourcing: number;             // Ethical sourcing compliance
    sustainabilityReporting: number;     // Sustainability reporting quality
  };

  @Column({ type: 'json', nullable: true })
  complianceMetrics: {
    regulatoryCompliance: number;        // Regulatory compliance score
    contractCompliance: number;         // Contract terms compliance
    safetyCompliance: number;            // Safety standards compliance
    securityCompliance: number;         // Security requirements compliance
    dataProtectionCompliance: number;   // Data protection compliance
    auditFindings: number;               // Number of audit findings
    correctionTimeliness: number;       // Timely correction of issues
  };

  // Volume and Value Context
  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  totalOrderValue: number;

  @Column({ type: 'int', default: 0 })
  totalOrders: number;

  @Column({ type: 'int', default: 0 })
  totalLineItems: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  totalQuantity: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  // Benchmarking
  @Column({ type: 'json', nullable: true })
  benchmarkData: {
    industryAverage: number;             // Industry average for this metric
    categoryAverage: number;             // Category average for this metric
    topPerformerScore: number;           // Top performer score in category
    percentileRanking: number;           // Percentile ranking (0-100)
    benchmarkSource: string;             // Source of benchmark data
    benchmarkDate: Date;                 // Date of benchmark data
  };

  // Trends and Analysis
  @Column({
    type: 'enum',
    enum: TrendDirection,
    default: TrendDirection.STABLE
  })
  trendDirection: TrendDirection;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  trendPercentage: number; // Percentage change from previous period

  @Column({ type: 'json', nullable: true })
  trendAnalysis: {
    shortTermTrend: TrendDirection;      // Last 3 periods
    longTermTrend: TrendDirection;       // Last 12 periods
    volatility: number;                  // Volatility index
    seasonalityFactor: number;           // Seasonality factor
    movingAverage: number;               // 3-period moving average
    standardDeviation: number;           // Performance standard deviation
  };

  // Improvement Tracking
  @Column({ type: 'json', nullable: true })
  improvementActions: {
    action: string;
    targetScore: number;
    targetDate: Date;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
    actualScore?: number;
    completionDate?: Date;
    effectiveness?: number;
  }[];

  // AI Analytics
  @Column({ type: 'json', nullable: true })
  aiAnalytics: {
    predictedNextScore: number;          // AI predicted next period score
    predictionConfidence: number;        // Confidence in prediction (0-100)
    riskFactors: string[];               // Identified risk factors
    improvementOpportunities: string[];  // AI-identified opportunities
    anomalyDetected: boolean;            // Whether anomaly was detected
    anomalyDescription?: string;         // Description of anomaly
    recommendedActions: string[];        // AI-recommended actions
    correlationFactors: {                // Factors correlated with performance
      factor: string;
      correlation: number;
      impact: 'positive' | 'negative';
    }[];
  };

  // Comments and Notes
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  improvementPlan: string;

  @Column({ type: 'text', nullable: true })
  criticalIssues: string;

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
  getPerformanceRating(): 'poor' | 'fair' | 'good' | 'excellent' {
    if (this.overallScore >= 90) return 'excellent';
    if (this.overallScore >= 75) return 'good';
    if (this.overallScore >= 60) return 'fair';
    return 'poor';
  }

  isImproving(): boolean {
    return this.trendDirection === TrendDirection.IMPROVING;
  }

  isDeclining(): boolean {
    return this.trendDirection === TrendDirection.DECLINING;
  }

  isAboveAverage(): boolean {
    return this.benchmarkData?.industryAverage 
      ? this.overallScore > this.benchmarkData.industryAverage 
      : false;
  }

  getPercentileRanking(): number {
    return this.benchmarkData?.percentileRanking || 0;
  }

  isTopPerformer(): boolean {
    return this.getPercentileRanking() >= 90;
  }

  requiresAttention(): boolean {
    return this.overallScore < 60 || this.isDeclining();
  }

  hasAnomalyDetected(): boolean {
    return this.aiAnalytics?.anomalyDetected || false;
  }

  getStrongestArea(): string {
    const scores = {
      delivery: this.deliveryScore,
      quality: this.qualityScore,
      cost: this.costScore,
      service: this.serviceScore,
      innovation: this.innovationScore,
      sustainability: this.sustainabilityScore,
      compliance: this.complianceScore
    };

    let maxArea = 'delivery';
    let maxScore = 0;

    Object.entries(scores).forEach(([area, score]) => {
      if (score && score > maxScore) {
        maxScore = score;
        maxArea = area;
      }
    });

    return maxArea;
  }

  getWeakestArea(): string {
    const scores = {
      delivery: this.deliveryScore,
      quality: this.qualityScore,
      cost: this.costScore,
      service: this.serviceScore,
      innovation: this.innovationScore,
      sustainability: this.sustainabilityScore,
      compliance: this.complianceScore
    };

    let minArea = 'delivery';
    let minScore = 100;

    Object.entries(scores).forEach(([area, score]) => {
      if (score && score < minScore) {
        minScore = score;
        minArea = area;
      }
    });

    return minArea;
  }

  calculateTrendPercentage(previousScore: number): number {
    if (previousScore === 0) return 0;
    return ((this.overallScore - previousScore) / previousScore) * 100;
  }

  updateTrendDirection(previousScore: number): void {
    const changeThreshold = 2; // 2% threshold for trend detection
    const change = this.calculateTrendPercentage(previousScore);

    if (change > changeThreshold) {
      this.trendDirection = TrendDirection.IMPROVING;
    } else if (change < -changeThreshold) {
      this.trendDirection = TrendDirection.DECLINING;
    } else {
      this.trendDirection = TrendDirection.STABLE;
    }

    this.trendPercentage = Math.abs(change);
  }

  addImprovementAction(action: SupplierPerformanceMetric['improvementActions'][0]): void {
    if (!this.improvementActions) this.improvementActions = [];
    this.improvementActions.push(action);
  }

  completeImprovementAction(actionIndex: number, actualScore: number): void {
    if (this.improvementActions && this.improvementActions[actionIndex]) {
      const action = this.improvementActions[actionIndex];
      action.status = 'completed';
      action.completionDate = new Date();
      action.actualScore = actualScore;
      action.effectiveness = ((actualScore - this.overallScore) / (action.targetScore - this.overallScore)) * 100;
    }
  }

  updateAIAnalytics(analytics: Partial<SupplierPerformanceMetric['aiAnalytics']>): void {
    this.aiAnalytics = { ...this.aiAnalytics, ...analytics };
  }

  updateBenchmarkData(benchmark: Partial<SupplierPerformanceMetric['benchmarkData']>): void {
    this.benchmarkData = { ...this.benchmarkData, ...benchmark };
  }

  getAIPredictedScore(): number {
    return this.aiAnalytics?.predictedNextScore || this.overallScore;
  }

  getPredictionConfidence(): number {
    return this.aiAnalytics?.predictionConfidence || 0;
  }

  getRecommendedActions(): string[] {
    return this.aiAnalytics?.recommendedActions || [];
  }

  getRiskFactors(): string[] {
    return this.aiAnalytics?.riskFactors || [];
  }

  getImprovementOpportunities(): string[] {
    return this.aiAnalytics?.improvementOpportunities || [];
  }

  getVolatilityIndex(): number {
    return this.trendAnalysis?.volatility || 0;
  }

  getMovingAverage(): number {
    return this.trendAnalysis?.movingAverage || this.overallScore;
  }

  isVolatile(): boolean {
    return this.getVolatilityIndex() > 15; // 15% volatility threshold
  }

  getAverageOrderValue(): number {
    return this.totalOrders > 0 ? this.totalOrderValue / this.totalOrders : 0;
  }

  getOrderFrequency(): number {
    // Orders per month (approximate)
    const periodDays = Math.ceil(
      (this.periodEndDate.getTime() - this.periodStartDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const periodMonths = periodDays / 30;
    return periodMonths > 0 ? this.totalOrders / periodMonths : 0;
  }

  needsImprovementPlan(): boolean {
    return this.overallScore < 70 || this.isDeclining() || this.hasAnomalyDetected();
  }

  isStrategicSupplier(): boolean {
    return this.totalOrderValue > 1000000 || this.getPercentileRanking() >= 80;
  }
}
