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
import { WorkCenter } from './WorkCenter';
import { ProductionLine } from './ProductionLine';

export enum InsightType {
  PREDICTION = 'prediction',
  OPTIMIZATION = 'optimization',
  ANOMALY_DETECTION = 'anomaly_detection',
  PATTERN_RECOGNITION = 'pattern_recognition',
  RECOMMENDATION = 'recommendation',
  FORECAST = 'forecast',
  CLASSIFICATION = 'classification',
  CLUSTERING = 'clustering',
}

export enum InsightPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  URGENT = 'urgent',
}

export enum InsightStatus {
  GENERATED = 'generated',
  REVIEWED = 'reviewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  IMPLEMENTED = 'implemented',
  ARCHIVED = 'archived',
}

@Entity('ai_insights')
@Index(['insightType'])
@Index(['priority'])
@Index(['status'])
@Index(['generatedAt'])
@Index(['workCenterId'])
@Index(['productionLineId'])
export class AIInsight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  insightCode: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: InsightType,
    default: InsightType.RECOMMENDATION,
  })
  insightType: InsightType;

  @Column({
    type: 'enum',
    enum: InsightPriority,
    default: InsightPriority.MEDIUM,
  })
  priority: InsightPriority;

  @Column({
    type: 'enum',
    enum: InsightStatus,
    default: InsightStatus.GENERATED,
  })
  status: InsightStatus;

  @Column({ type: 'timestamp' })
  generatedAt: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  confidenceScore: number; // 0-100

  @Column({ length: 100 })
  aiModel: string;

  @Column({ length: 50 })
  modelVersion: string;

  // AI Model Details
  @Column({ type: 'jsonb', nullable: true })
  modelDetails: {
    algorithm: string;
    parameters: object;
    trainingData: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };

  // Data Sources
  @Column({ type: 'jsonb', nullable: true })
  dataSources: {
    sensors: string[];
    systems: string[];
    databases: string[];
    apis: string[];
    files: string[];
  };

  // Input Data
  @Column({ type: 'jsonb', nullable: true })
  inputData: {
    features: object[];
    values: object[];
    timeRange: object;
    sampleSize: number;
    dataQuality: number;
  };

  // Insight Content
  @Column({ type: 'jsonb', nullable: true })
  insightContent: {
    findings: string[];
    patterns: object[];
    anomalies: object[];
    trends: object[];
    correlations: object[];
    predictions: object[];
  };

  // Recommendations
  @Column({ type: 'jsonb', nullable: true })
  recommendations: {
    actions: string[];
    priorities: object[];
    timeline: object[];
    resources: object[];
    expectedImpact: object;
    riskLevel: string;
  };

  // Predictions and Forecasts
  @Column({ type: 'jsonb', nullable: true })
  predictions: {
    targetVariable: string;
    predictedValue: number;
    confidenceInterval: object;
    forecastHorizon: number;
    uncertainty: number;
    factors: object[];
  };

  // Impact Assessment
  @Column({ type: 'jsonb', nullable: true })
  impactAssessment: {
    potential: object;
    financial: object;
    operational: object;
    quality: object;
    efficiency: object;
    sustainability: object;
  };

  // Validation and Testing
  @Column({ type: 'jsonb', nullable: true })
  validation: {
    testResults: object[];
    crossValidation: object;
    realWorldValidation: object;
    feedbackLoop: boolean;
    accuracyMetrics: object;
  };

  // Implementation Details
  @Column({ type: 'jsonb', nullable: true })
  implementation: {
    status: string;
    startDate: Date;
    completionDate: Date;
    assignedTo: string[];
    progress: number;
    challenges: string[];
    results: object;
  };

  // Feedback and Learning
  @Column({ type: 'jsonb', nullable: true })
  feedback: {
    userRating: number; // 1-5
    effectiveness: number; // 1-5
    usability: number; // 1-5
    comments: string[];
    improvements: string[];
    lessonsLearned: string[];
  };

  // Context Information
  @Column({ type: 'jsonb', nullable: true })
  context: {
    businessContext: string;
    operationalContext: string;
    technicalContext: string;
    constraints: object[];
    assumptions: string[];
  };

  // Related Insights
  @Column({ type: 'jsonb', nullable: true })
  relatedInsights: {
    dependencies: string[];
    conflicting: string[];
    supporting: string[];
    sequence: number;
  };

  // Visualization Data
  @Column({ type: 'jsonb', nullable: true })
  visualizationData: {
    charts: object[];
    graphs: object[];
    dashboards: string[];
    reports: string[];
    images: string[];
  };

  // Alerts and Notifications
  @Column({ type: 'jsonb', nullable: true })
  alerts: {
    threshold: object;
    triggers: object[];
    recipients: string[];
    methods: string[];
    frequency: string;
  };

  // Performance Tracking
  @Column({ type: 'jsonb', nullable: true })
  performance: {
    processingTime: number; // milliseconds
    dataProcessed: number; // MB
    resourceUsage: object;
    efficiency: number;
    scalability: object;
  };

  // Compliance and Ethics
  @Column({ type: 'jsonb', nullable: true })
  compliance: {
    ethicalConsiderations: string[];
    biasAssessment: object;
    fairness: object;
    transparency: number;
    explainability: number;
    auditTrail: object[];
  };

  // Integration Information
  @Column({ type: 'jsonb', nullable: true })
  integration: {
    systems: string[];
    apis: string[];
    webhooks: string[];
    eventTriggers: object[];
    automationRules: object[];
  };

  // Expiry and Refresh
  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastRefreshed: Date;

  @Column({ type: 'int', default: 24 })
  refreshFrequencyHours: number;

  @Column({ type: 'boolean', default: true })
  autoRefresh: boolean;

  // Relationships
  @Column({ nullable: true })
  workCenterId: string;

  @ManyToOne(() => WorkCenter)
  @JoinColumn({ name: 'workCenterId' })
  workCenter: WorkCenter;

  @Column({ nullable: true })
  productionLineId: string;

  @ManyToOne(() => ProductionLine)
  @JoinColumn({ name: 'productionLineId' })
  productionLine: ProductionLine;

  // Audit fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 100, nullable: true })
  createdBy: string;

  @Column({ length: 100, nullable: true })
  updatedBy: string;

  @Column({ length: 100, nullable: true })
  reviewedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  // Methods
  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  needsRefresh(): boolean {
    if (!this.autoRefresh) return false;
    if (!this.lastRefreshed) return true;
    
    const refreshInterval = this.refreshFrequencyHours * 60 * 60 * 1000; // Convert to milliseconds
    const nextRefreshTime = new Date(this.lastRefreshed.getTime() + refreshInterval);
    
    return new Date() > nextRefreshTime;
  }

  calculateAge(): number {
    return (new Date().getTime() - this.generatedAt.getTime()) / (1000 * 60 * 60); // hours
  }

  isHighPriority(): boolean {
    return this.priority === InsightPriority.CRITICAL || 
           this.priority === InsightPriority.URGENT ||
           this.priority === InsightPriority.HIGH;
  }

  getRelevanceScore(): number {
    // Calculate relevance based on confidence, age, and priority
    let score = this.confidenceScore || 0;
    
    // Reduce score based on age
    const age = this.calculateAge();
    const ageReduction = Math.min(age / 24, 0.5); // Max 50% reduction after 24 hours
    score = score * (1 - ageReduction);
    
    // Boost score based on priority
    const priorityMultiplier = {
      [InsightPriority.LOW]: 0.8,
      [InsightPriority.MEDIUM]: 1.0,
      [InsightPriority.HIGH]: 1.2,
      [InsightPriority.CRITICAL]: 1.5,
      [InsightPriority.URGENT]: 1.8,
    };
    
    score = score * (priorityMultiplier[this.priority] || 1.0);
    
    return Math.min(score, 100);
  }

  updateStatus(newStatus: InsightStatus, userId?: string): void {
    this.status = newStatus;
    
    if (newStatus === InsightStatus.REVIEWED && userId) {
      this.reviewedBy = userId;
      this.reviewedAt = new Date();
    }
    
    if (newStatus === InsightStatus.IMPLEMENTED) {
      this.implementation = {
        ...this.implementation,
        completionDate: new Date(),
        progress: 100,
      };
    }
    
    if (userId) {
      this.updatedBy = userId;
    }
  }

  addFeedback(rating: number, comments: string, userId?: string): void {
    this.feedback = {
      ...this.feedback,
      userRating: rating,
      comments: [...(this.feedback?.comments || []), comments],
    };
    
    if (userId) {
      this.updatedBy = userId;
    }
  }

  generateActionPlan(): object {
    if (!this.recommendations) return {};
    
    return {
      title: this.title,
      priority: this.priority,
      actions: this.recommendations.actions || [],
      timeline: this.recommendations.timeline || {},
      resources: this.recommendations.resources || {},
      expectedImpact: this.impactAssessment?.potential || {},
      risks: this.recommendations.riskLevel || 'medium',
      success_metrics: this.extractSuccessMetrics(),
    };
  }

  private extractSuccessMetrics(): string[] {
    const metrics: string[] = [];
    
    if (this.insightType === InsightType.OPTIMIZATION) {
      metrics.push('Efficiency improvement');
      metrics.push('Cost reduction');
      metrics.push('Quality enhancement');
    }
    
    if (this.insightType === InsightType.PREDICTION) {
      metrics.push('Prediction accuracy');
      metrics.push('Early warning effectiveness');
      metrics.push('Decision support quality');
    }
    
    if (this.insightType === InsightType.ANOMALY_DETECTION) {
      metrics.push('False positive rate');
      metrics.push('Detection accuracy');
      metrics.push('Response time improvement');
    }
    
    return metrics;
  }

  validateInsight(): string[] {
    const errors: string[] = [];
    
    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }
    
    if (!this.description || this.description.trim().length === 0) {
      errors.push('Description is required');
    }
    
    if (this.confidenceScore < 0 || this.confidenceScore > 100) {
      errors.push('Confidence score must be between 0 and 100');
    }
    
    if (!this.aiModel || this.aiModel.trim().length === 0) {
      errors.push('AI model information is required');
    }
    
    if (this.confidenceScore < 50 && this.priority === InsightPriority.CRITICAL) {
      errors.push('Low confidence insights cannot have critical priority');
    }
    
    return errors;
  }

  generateSummary(): object {
    return {
      insightCode: this.insightCode,
      title: this.title,
      type: this.insightType,
      priority: this.priority,
      status: this.status,
      confidence: this.confidenceScore,
      relevance: this.getRelevanceScore(),
      age: this.calculateAge(),
      model: this.aiModel,
      keyFindings: this.insightContent?.findings?.slice(0, 3) || [],
      topRecommendations: this.recommendations?.actions?.slice(0, 3) || [],
      expectedImpact: this.impactAssessment?.potential || {},
      actionRequired: this.isHighPriority(),
      expired: this.isExpired(),
      needsRefresh: this.needsRefresh(),
    };
  }

  archive(): void {
    this.status = InsightStatus.ARCHIVED;
    this.updatedAt = new Date();
  }

  refresh(): void {
    this.lastRefreshed = new Date();
    // In practice, this would trigger the AI model to regenerate the insight
  }

  clone(): Partial<AIInsight> {
    return {
      title: `${this.title} (Copy)`,
      description: this.description,
      insightType: this.insightType,
      priority: this.priority,
      aiModel: this.aiModel,
      modelVersion: this.modelVersion,
      workCenterId: this.workCenterId,
      productionLineId: this.productionLineId,
      status: InsightStatus.GENERATED,
    };
  }
}
