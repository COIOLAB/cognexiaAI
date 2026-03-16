import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum MetricType {
  DEFECT_RATE = 'defect_rate',
  FIRST_PASS_YIELD = 'first_pass_yield',
  OVERALL_EQUIPMENT_EFFECTIVENESS = 'oee',
  PROCESS_CAPABILITY_INDEX = 'cpk',
  SIGMA_LEVEL = 'sigma_level',
  COST_OF_QUALITY = 'cost_of_quality',
  CUSTOMER_SATISFACTION = 'customer_satisfaction',
  ON_TIME_DELIVERY = 'on_time_delivery',
  SCRAP_RATE = 'scrap_rate',
  REWORK_RATE = 'rework_rate',
  INSPECTION_EFFICIENCY = 'inspection_efficiency',
  COMPLIANCE_SCORE = 'compliance_score',
  AUDIT_SCORE = 'audit_score',
  CORRECTIVE_ACTION_EFFECTIVENESS = 'capa_effectiveness',
  PREVENTIVE_ACTION_TIMELINESS = 'preventive_timeliness',
}

export enum TrendDirection {
  IMPROVING = 'improving',
  DECLINING = 'declining',
  STABLE = 'stable',
  VOLATILE = 'volatile',
}

@Entity('quality_metrics')
@Index(['metricType', 'workCenterId', 'measurementDate'])
@Index(['productCode', 'measurementDate'])
@Index(['measurementDate', 'isActive'])
export class QualityMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MetricType,
  })
  metricType: MetricType;

  @Column()
  metricName: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  workCenterId: string;

  @Column({ nullable: true })
  workCenterName: string;

  @Column({ nullable: true })
  productCode: string;

  @Column({ nullable: true })
  productName: string;

  @Column({ nullable: true })
  processId: string;

  @Column({ nullable: true })
  processName: string;

  @Column({ nullable: true })
  operationId: string;

  @Column({ nullable: true })
  operationName: string;

  @Column('decimal', { precision: 15, scale: 6 })
  value: number;

  @Column('decimal', { precision: 15, scale: 6, nullable: true })
  targetValue: number;

  @Column('decimal', { precision: 15, scale: 6, nullable: true })
  upperControlLimit: number;

  @Column('decimal', { precision: 15, scale: 6, nullable: true })
  lowerControlLimit: number;

  @Column('decimal', { precision: 15, scale: 6, nullable: true })
  upperSpecLimit: number;

  @Column('decimal', { precision: 15, scale: 6, nullable: true })
  lowerSpecLimit: number;

  @Column({ length: 20 })
  unitOfMeasure: string;

  @Column({ type: 'date' })
  measurementDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  measurementTimestamp: Date;

  @Column({ default: 'daily' })
  frequency: string;

  @Column('int', { nullable: true })
  sampleSize: number;

  @Column('decimal', { precision: 15, scale: 6, nullable: true })
  standardDeviation: number;

  @Column('decimal', { precision: 15, scale: 6, nullable: true })
  variance: number;

  @Column('decimal', { precision: 15, scale: 6, nullable: true })
  confidenceInterval: number;

  @Column({
    type: 'enum',
    enum: TrendDirection,
    nullable: true,
  })
  trendDirection: TrendDirection;

  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  trendSlope: number;

  @Column('decimal', { precision: 8, scale: 6, nullable: true })
  trendCorrelation: number;

  @Column({ default: false })
  isOutOfControl: boolean;

  @Column({ default: false })
  isOutOfSpec: boolean;

  @Column({ default: false })
  requiresAction: boolean;

  @Column('text', { nullable: true })
  actionRequired: string;

  @Column('json', { nullable: true })
  controlChartData: {
    points: Array<{
      date: Date;
      value: number;
      isOutOfControl: boolean;
      rule?: string;
    }>;
    violations: string[];
    patterns: string[];
  };

  @Column('json', { nullable: true })
  statisticalAnalysis: {
    mean: number;
    median: number;
    mode: number;
    range: number;
    standardDeviation: number;
    variance: number;
    skewness: number;
    kurtosis: number;
    histogram: Array<{
      bin: string;
      count: number;
      frequency: number;
    }>;
  };

  @Column('json', { nullable: true })
  processCapability: {
    cp: number;
    cpk: number;
    pp: number;
    ppk: number;
    cpm: number;
    sigmaLevel: number;
    defectsPerMillion: number;
  };

  @Column('json', { nullable: true })
  benchmarking: {
    industryAverage: number;
    bestInClass: number;
    competitorAverage: number;
    percentile: number;
    ranking: number;
  };

  @Column('json', { nullable: true })
  previousPeriod: {
    value: number;
    date: Date;
    change: number;
    changePercent: number;
  };

  @Column('json', { nullable: true })
  yearOverYear: {
    value: number;
    date: Date;
    change: number;
    changePercent: number;
  };

  @Column('json', { nullable: true })
  relatedMetrics: Array<{
    metricId: string;
    metricType: string;
    correlation: number;
    relationship: string;
  }>;

  @Column({ default: 'green' })
  performanceStatus: string;

  @Column('int', { default: 100 })
  qualityScore: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  costImpact: number;

  @Column({ length: 10, nullable: true })
  currency: string;

  @Column('json', { nullable: true })
  rootCauseAnalysis: {
    factors: Array<{
      factor: string;
      impact: number;
      probability: number;
      category: string;
    }>;
    recommendations: string[];
    actionPlan: Array<{
      action: string;
      priority: string;
      dueDate: Date;
      assignedTo: string;
    }>;
  };

  @Column({ nullable: true })
  shiftId: string;

  @Column({ nullable: true })
  shiftName: string;

  @Column({ nullable: true })
  operatorId: string;

  @Column({ nullable: true })
  operatorName: string;

  @Column({ nullable: true })
  equipmentId: string;

  @Column({ nullable: true })
  equipmentName: string;

  @Column('json', { nullable: true })
  environmentalConditions: {
    temperature: number;
    humidity: number;
    pressure: number;
    vibration: number;
    cleanliness: string;
    otherFactors: Record<string, any>;
  };

  @Column('json', { nullable: true })
  materialInformation: {
    batchNumber: string;
    lotNumber: string;
    supplier: string;
    materialGrade: string;
    receivedDate: Date;
    expirationDate: Date;
  };

  @Column({ default: false })
  isAutomated: boolean;

  @Column({ nullable: true })
  dataSource: string;

  @Column({ nullable: true })
  collectionMethod: string;

  @Column('json', { nullable: true })
  dataQuality: {
    completeness: number;
    accuracy: number;
    timeliness: number;
    consistency: number;
    validity: number;
    reliability: number;
  };

  @Column('json', { nullable: true })
  alerts: Array<{
    alertType: string;
    severity: string;
    message: string;
    triggeredAt: Date;
    acknowledged: boolean;
  }>;

  @Column('json', { nullable: true })
  aiInsights: {
    anomalyScore: number;
    predictions: Array<{
      horizon: string;
      predictedValue: number;
      confidence: number;
    }>;
    recommendations: string[];
    riskAssessment: {
      riskLevel: string;
      factors: string[];
      mitigation: string[];
    };
  };

  @Column('json', { nullable: true })
  complianceMapping: {
    standards: string[];
    requirements: string[];
    auditTrail: Array<{
      auditor: string;
      auditDate: Date;
      result: string;
      findings: string[];
    }>;
  };

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('json', { nullable: true })
  customAttributes: Record<string, any>;

  @Column('json', { nullable: true })
  industrySpecific: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;
}
