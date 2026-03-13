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
import { IsNotEmpty, Min, Max } from 'class-validator';
import { Supplier } from './Supplier.entity';

export enum MetricType {
  QUALITY = 'quality',
  DELIVERY = 'delivery',
  SERVICE = 'service',
  COST = 'cost',
  SUSTAINABILITY = 'sustainability',
  COMPLIANCE = 'compliance',
  INNOVATION = 'innovation',
  RESPONSIVENESS = 'responsiveness',
}

export enum MetricPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

@Entity('supplier_performance_metrics')
@Index(['supplierId', 'metricType', 'period'])
@Index(['measurementDate'])
@Index(['score', 'metricType'])
@Index(['createdAt', 'updatedAt'])
export class SupplierPerformanceMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  supplierId: string;

  @Column({
    type: 'enum',
    enum: MetricType,
  })
  @IsNotEmpty()
  metricType: MetricType;

  @Column({
    type: 'enum',
    enum: MetricPeriod,
  })
  @IsNotEmpty()
  period: MetricPeriod;

  @Column({ type: 'date' })
  measurementDate: Date;

  @Column({ length: 200 })
  @IsNotEmpty()
  metricName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Core Performance Score
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  @Min(0)
  @Max(100)
  score: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @Min(0)
  @Max(100)
  targetScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @Min(0)
  @Max(100)
  benchmarkScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  previousScore: number;

  // Detailed Metrics by Category
  @Column({ type: 'json', nullable: true })
  qualityMetrics: {
    defectRate: number;
    firstPassYield: number;
    customerComplaints: number;
    warrantyReturns: number;
    qualityCertificationStatus: string;
    inspectionResults: Array<{
      date: Date;
      result: 'pass' | 'fail';
      score: number;
      defectsFound: number;
    }>;
  };

  @Column({ type: 'json', nullable: true })
  deliveryMetrics: {
    onTimeDeliveryRate: number;
    earlyDeliveryRate: number;
    lateDeliveryRate: number;
    averageDeliveryTime: number; // days
    deliveryVariability: number;
    orderFulfillmentRate: number;
    deliveryAccuracy: number;
    shippingDamageRate: number;
  };

  @Column({ type: 'json', nullable: true })
  serviceMetrics: {
    responseTime: number; // hours
    issueResolutionTime: number; // hours
    customerSatisfactionScore: number;
    technicalSupportRating: number;
    communicationEffectiveness: number;
    proactiveNotifications: number;
    escalationRate: number;
  };

  @Column({ type: 'json', nullable: true })
  costMetrics: {
    priceCompetitiveness: number;
    costReductionAchieved: number;
    totalCostOfOwnership: number;
    priceVariance: number;
    currencyStability: number;
    paymentTermsCompliance: number;
    invoiceAccuracy: number;
  };

  @Column({ type: 'json', nullable: true })
  sustainabilityMetrics: {
    carbonFootprintReduction: number;
    energyEfficiencyImprovement: number;
    wasteReduction: number;
    recyclableContentIncrease: number;
    sustainabilityCertifications: string[];
    environmentalIncidents: number;
    socialResponsibilityScore: number;
  };

  @Column({ type: 'json', nullable: true })
  complianceMetrics: {
    regulatoryComplianceRate: number;
    auditFindings: number;
    correctiveActionsCompleted: number;
    certificationStatus: string[];
    documentationCompleteness: number;
    policyAdherenceScore: number;
    ethicsViolations: number;
  };

  @Column({ type: 'json', nullable: true })
  innovationMetrics: {
    newProductsIntroduced: number;
    processImprovements: number;
    costSavingIdeas: number;
    technologyAdoption: number;
    digitalTransformationScore: number;
    intellectualPropertyContributions: number;
    collaborativeProjects: number;
  };

  @Column({ type: 'json', nullable: true })
  responsivenessMetrics: {
    changeRequestResponseTime: number; // hours
    emergencyResponseTime: number; // hours
    marketAdaptability: number;
    scalabilityDemonstrated: number;
    flexibilityScore: number;
    crisisManagementEffectiveness: number;
    continuityPlanExecution: number;
  };

  // AI-Enhanced Analytics
  @Column({ type: 'json', nullable: true })
  aiAnalytics: {
    performanceTrend: 'improving' | 'stable' | 'declining';
    predictedNextPeriodScore: number;
    confidenceLevel: number;
    keyPerformanceDrivers: Array<{
      driver: string;
      impact: number;
      trend: string;
    }>;
    anomalyDetection: Array<{
      metric: string;
      expected: number;
      actual: number;
      deviation: number;
      significance: 'low' | 'medium' | 'high';
    }>;
    benchmarkAnalysis: {
      industryPercentile: number;
      peerComparison: Array<{
        peer: string;
        score: number;
        gap: number;
      }>;
    };
    improvementRecommendations: Array<{
      area: string;
      currentScore: number;
      targetScore: number;
      actions: string[];
      timeline: string;
      expectedImpact: number;
    }>;
  };

  // Comparative Analysis
  @Column({ type: 'json', nullable: true })
  comparativeMetrics: {
    industryAverage: number;
    topPerformerScore: number;
    worstPerformerScore: number;
    quartileRanking: 1 | 2 | 3 | 4;
    percentileRanking: number;
    improvementOpportunity: number;
  };

  // Supporting Data
  @Column({ type: 'json', nullable: true })
  dataPoints: Array<{
    metric: string;
    value: number;
    unit: string;
    source: string;
    timestamp: Date;
  }>;

  @Column({ type: 'json', nullable: true })
  evidenceFiles: Array<{
    fileName: string;
    fileType: string;
    url: string;
    uploadedAt: Date;
    description: string;
  }>;

  // Scoring Methodology
  @Column({ type: 'json', nullable: true })
  scoringCriteria: {
    weightings: Record<string, number>;
    formula: string;
    normalizationMethod: string;
    benchmarkSource: string;
  };

  // Action Plans and Improvements
  @Column({ type: 'json', nullable: true })
  improvementActions: Array<{
    actionId: string;
    description: string;
    targetMetric: string;
    targetImprovement: number;
    dueDate: Date;
    responsible: string;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
    actualImprovement?: number;
    completedDate?: Date;
  }>;

  @Column({ type: 'json', nullable: true })
  correctiveActions: Array<{
    issueDescription: string;
    rootCause: string;
    correctiveAction: string;
    preventiveAction: string;
    responsible: string;
    dueDate: Date;
    status: 'open' | 'in_progress' | 'completed';
    effectiveness: number;
  }>;

  // Risk Factors
  @Column({ type: 'json', nullable: true })
  riskFactors: Array<{
    factor: string;
    impact: 'low' | 'medium' | 'high';
    probability: 'low' | 'medium' | 'high';
    mitigationPlan: string;
  }>;

  // Stakeholder Feedback
  @Column({ type: 'json', nullable: true })
  stakeholderFeedback: Array<{
    stakeholder: string;
    role: string;
    rating: number;
    comments: string;
    submittedAt: Date;
  }>;

  // External Assessments
  @Column({ type: 'json', nullable: true })
  externalAssessments: Array<{
    assessor: string;
    assessmentType: string;
    score: number;
    findings: string[];
    recommendations: string[];
    assessmentDate: Date;
    validUntil: Date;
  }>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 50, nullable: true })
  measuredBy: string;

  @Column({ length: 50, nullable: true })
  approvedBy: string;

  @Column({ length: 50, nullable: true })
  updatedBy: string;

  // Relationships
  @ManyToOne(() => Supplier, (supplier) => supplier.performanceMetrics)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  // Computed Properties
  get performanceGrade(): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
    if (this.score >= 95) return 'A+';
    if (this.score >= 90) return 'A';
    if (this.score >= 85) return 'B+';
    if (this.score >= 80) return 'B';
    if (this.score >= 75) return 'C+';
    if (this.score >= 70) return 'C';
    if (this.score >= 60) return 'D';
    return 'F';
  }

  get targetAchievement(): number {
    return this.targetScore ? (this.score / this.targetScore) * 100 : 0;
  }

  get improvementFromPrevious(): number {
    return this.previousScore ? this.score - this.previousScore : 0;
  }

  get improvementPercentage(): number {
    return this.previousScore ? ((this.score - this.previousScore) / this.previousScore) * 100 : 0;
  }

  get isImproving(): boolean {
    return this.improvementFromPrevious > 0;
  }

  get benchmarkGap(): number {
    return this.benchmarkScore ? this.score - this.benchmarkScore : 0;
  }

  get riskLevel(): 'low' | 'medium' | 'high' | 'critical' {
    if (this.score >= 85) return 'low';
    if (this.score >= 70) return 'medium';
    if (this.score >= 50) return 'high';
    return 'critical';
  }

  // Methods
  calculateOverallScore(weightings?: Record<string, number>): void {
    const defaultWeightings = {
      quality: 0.25,
      delivery: 0.25,
      service: 0.20,
      cost: 0.15,
      sustainability: 0.10,
      compliance: 0.05,
    };

    const weights = weightings || defaultWeightings;
    let totalScore = 0;
    let totalWeight = 0;

    if (this.qualityMetrics && weights.quality) {
      totalScore += this.calculateQualityScore() * weights.quality;
      totalWeight += weights.quality;
    }

    if (this.deliveryMetrics && weights.delivery) {
      totalScore += this.calculateDeliveryScore() * weights.delivery;
      totalWeight += weights.delivery;
    }

    if (this.serviceMetrics && weights.service) {
      totalScore += this.calculateServiceScore() * weights.service;
      totalWeight += weights.service;
    }

    if (this.costMetrics && weights.cost) {
      totalScore += this.calculateCostScore() * weights.cost;
      totalWeight += weights.cost;
    }

    if (totalWeight > 0) {
      this.score = totalScore / totalWeight;
    }
  }

  private calculateQualityScore(): number {
    if (!this.qualityMetrics) return 0;
    
    const defectScore = Math.max(0, 100 - (this.qualityMetrics.defectRate || 0) * 10);
    const yieldScore = this.qualityMetrics.firstPassYield || 0;
    const complaintScore = Math.max(0, 100 - (this.qualityMetrics.customerComplaints || 0) * 5);
    
    return (defectScore + yieldScore + complaintScore) / 3;
  }

  private calculateDeliveryScore(): number {
    if (!this.deliveryMetrics) return 0;
    
    const onTimeScore = this.deliveryMetrics.onTimeDeliveryRate || 0;
    const fulfillmentScore = this.deliveryMetrics.orderFulfillmentRate || 0;
    const accuracyScore = this.deliveryMetrics.deliveryAccuracy || 0;
    
    return (onTimeScore + fulfillmentScore + accuracyScore) / 3;
  }

  private calculateServiceScore(): number {
    if (!this.serviceMetrics) return 0;
    
    const responseScore = Math.max(0, 100 - (this.serviceMetrics.responseTime || 0) / 2);
    const satisfactionScore = this.serviceMetrics.customerSatisfactionScore || 0;
    const communicationScore = this.serviceMetrics.communicationEffectiveness || 0;
    
    return (responseScore + satisfactionScore + communicationScore) / 3;
  }

  private calculateCostScore(): number {
    if (!this.costMetrics) return 0;
    
    const competitivenessScore = this.costMetrics.priceCompetitiveness || 0;
    const reductionScore = Math.min(100, (this.costMetrics.costReductionAchieved || 0) * 10);
    const varianceScore = Math.max(0, 100 - Math.abs(this.costMetrics.priceVariance || 0) * 2);
    
    return (competitivenessScore + reductionScore + varianceScore) / 3;
  }

  addImprovementAction(action: any): void {
    if (!this.improvementActions) {
      this.improvementActions = [];
    }
    action.actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.improvementActions.push(action);
  }

  updateImprovementAction(actionId: string, updates: Partial<any>): void {
    const action = this.improvementActions?.find(a => a.actionId === actionId);
    if (action) {
      Object.assign(action, updates);
    }
  }

  addCorrectiveAction(action: any): void {
    if (!this.correctiveActions) {
      this.correctiveActions = [];
    }
    this.correctiveActions.push(action);
  }

  addStakeholderFeedback(feedback: any): void {
    if (!this.stakeholderFeedback) {
      this.stakeholderFeedback = [];
    }
    feedback.submittedAt = new Date();
    this.stakeholderFeedback.push(feedback);
  }

  isOutperformingBenchmark(): boolean {
    return this.benchmarkScore ? this.score > this.benchmarkScore : false;
  }

  getImprovementPriority(): 'low' | 'medium' | 'high' | 'critical' {
    const targetGap = this.targetScore ? this.targetScore - this.score : 0;
    
    if (targetGap <= 5) return 'low';
    if (targetGap <= 15) return 'medium';
    if (targetGap <= 25) return 'high';
    return 'critical';
  }
}
