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
import { ProductionOrder } from './ProductionOrder';

export enum AnalyticsType {
  REAL_TIME = 'real_time',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum MetricCategory {
  PRODUCTION = 'production',
  QUALITY = 'quality',
  EFFICIENCY = 'efficiency',
  UTILIZATION = 'utilization',
  DOWNTIME = 'downtime',
  COST = 'cost',
  ENVIRONMENTAL = 'environmental',
  SAFETY = 'safety',
}

@Entity('manufacturing_analytics')
@Index(['analyticsType'])
@Index(['metricCategory'])
@Index(['measurementDate'])
@Index(['workCenterId'])
@Index(['productionLineId'])
export class ManufacturingAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  analyticsCode: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: AnalyticsType,
    default: AnalyticsType.HOURLY,
  })
  analyticsType: AnalyticsType;

  @Column({
    type: 'enum',
    enum: MetricCategory,
    default: MetricCategory.PRODUCTION,
  })
  metricCategory: MetricCategory;

  @Column({ type: 'timestamp' })
  measurementDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  periodStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  periodEnd: Date;

  // Production Metrics
  @Column({ type: 'jsonb', nullable: true })
  productionMetrics: {
    unitsProduced: number;
    targetUnits: number;
    productionRate: number; // units per hour
    throughput: number;
    cycleTimes: number[];
    averageCycleTime: number;
    firstPassYield: number; // percentage
    totalYield: number; // percentage
  };

  // Quality Metrics
  @Column({ type: 'jsonb', nullable: true })
  qualityMetrics: {
    defectRate: number; // percentage
    defectCount: number;
    reworkRate: number; // percentage
    scrapRate: number; // percentage
    inspectionResults: object[];
    qualityScore: number; // 0-100
    customerComplaints: number;
    returnRate: number; // percentage
  };

  // Efficiency Metrics
  @Column({ type: 'jsonb', nullable: true })
  efficiencyMetrics: {
    overallEquipmentEffectiveness: number; // OEE percentage
    availability: number; // percentage
    performance: number; // percentage
    quality: number; // percentage
    laborEfficiency: number; // percentage
    materialEfficiency: number; // percentage
    energyEfficiency: number; // kWh per unit
  };

  // Utilization Metrics
  @Column({ type: 'jsonb', nullable: true })
  utilizationMetrics: {
    equipmentUtilization: number; // percentage
    laborUtilization: number; // percentage
    capacityUtilization: number; // percentage
    plannedUtilization: number; // percentage
    actualUtilization: number; // percentage
    utilizationVariance: number; // percentage
  };

  // Downtime Analysis
  @Column({ type: 'jsonb', nullable: true })
  downtimeAnalysis: {
    totalDowntime: number; // minutes
    plannedDowntime: number; // minutes
    unplannedDowntime: number; // minutes
    maintenanceDowntime: number; // minutes
    setupDowntime: number; // minutes
    breakdownDowntime: number; // minutes
    downtimeReasons: object[];
    mtbf: number; // Mean Time Between Failures (hours)
    mttr: number; // Mean Time To Repair (hours)
  };

  // Cost Analysis
  @Column({ type: 'jsonb', nullable: true })
  costAnalysis: {
    laborCost: number;
    materialCost: number;
    energyCost: number;
    maintenanceCost: number;
    qualityCost: number;
    totalCost: number;
    costPerUnit: number;
    targetCostPerUnit: number;
    costVariance: number; // percentage
  };

  // Environmental Metrics
  @Column({ type: 'jsonb', nullable: true })
  environmentalMetrics: {
    energyConsumption: number; // kWh
    waterUsage: number; // liters
    wasteGeneration: number; // kg
    carbonFootprint: number; // kg CO2
    recyclingRate: number; // percentage
    sustainabilityScore: number; // 0-100
    emissionReduction: number; // percentage
  };

  // Safety Metrics
  @Column({ type: 'jsonb', nullable: true })
  safetyMetrics: {
    incidentCount: number;
    nearMissCount: number;
    lostTimeInjuries: number;
    safetyScore: number; // 0-100
    complianceRate: number; // percentage
    trainingHours: number;
    auditResults: object[];
  };

  // Performance Trends
  @Column({ type: 'jsonb', nullable: true })
  performanceTrends: {
    productionTrend: string; // increasing, decreasing, stable
    qualityTrend: string;
    efficiencyTrend: string;
    costTrend: string;
    trendAnalysis: object[];
    forecastData: object[];
    seasonalPatterns: object[];
  };

  // Comparative Analysis
  @Column({ type: 'jsonb', nullable: true })
  comparativeAnalysis: {
    vsTarget: object;
    vsPreviousPeriod: object;
    vsIndustryBenchmark: object;
    vsBestPractice: object;
    improvementOpportunities: string[];
  };

  // AI Insights
  @Column({ type: 'jsonb', nullable: true })
  aiInsights: {
    anomalies: object[];
    patterns: object[];
    predictions: object[];
    recommendations: string[];
    confidenceLevel: number; // percentage
    modelAccuracy: number; // percentage
  };

  // KPI Dashboard Data
  @Column({ type: 'jsonb', nullable: true })
  kpiData: {
    primaryKPIs: object[];
    secondaryKPIs: object[];
    alertThresholds: object[];
    currentStatus: object[];
    targetValues: object[];
  };

  // Statistical Analysis
  @Column({ type: 'jsonb', nullable: true })
  statisticalAnalysis: {
    mean: number;
    median: number;
    standardDeviation: number;
    variance: number;
    correlations: object[];
    distributions: object[];
    outliers: object[];
  };

  // Benchmarking Data
  @Column({ type: 'jsonb', nullable: true })
  benchmarkingData: {
    industryAverage: object;
    topQuartile: object;
    worldClass: object;
    competitorData: object[];
    gapAnalysis: object[];
    improvementTargets: object[];
  };

  // Real-time Monitoring
  @Column({ type: 'boolean', default: false })
  isRealTime: boolean;

  @Column({ type: 'jsonb', nullable: true })
  realTimeData: {
    lastUpdate: Date;
    updateFrequency: number; // seconds
    dataPoints: object[];
    alerts: object[];
    notifications: object[];
  };

  // Data Quality
  @Column({ type: 'jsonb', nullable: true })
  dataQuality: {
    completeness: number; // percentage
    accuracy: number; // percentage
    timeliness: number; // percentage
    consistency: number; // percentage
    validationRules: object[];
    dataSource: string;
  };

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

  @Column({ nullable: true })
  productionOrderId: string;

  @ManyToOne(() => ProductionOrder)
  @JoinColumn({ name: 'productionOrderId' })
  productionOrder: ProductionOrder;

  // Audit fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 100, nullable: true })
  createdBy: string;

  @Column({ length: 100, nullable: true })
  updatedBy: string;

  // Methods
  calculateOEE(): number {
    if (!this.efficiencyMetrics) return 0;
    
    const availability = this.efficiencyMetrics.availability || 0;
    const performance = this.efficiencyMetrics.performance || 0;
    const quality = this.efficiencyMetrics.quality || 0;
    
    return (availability * performance * quality) / 10000; // Convert to percentage
  }

  getProductionVariance(): number {
    if (!this.productionMetrics) return 0;
    
    const actual = this.productionMetrics.unitsProduced || 0;
    const target = this.productionMetrics.targetUnits || 0;
    
    if (target === 0) return 0;
    return ((actual - target) / target) * 100;
  }

  getCostVariance(): number {
    if (!this.costAnalysis) return 0;
    
    const actual = this.costAnalysis.costPerUnit || 0;
    const target = this.costAnalysis.targetCostPerUnit || 0;
    
    if (target === 0) return 0;
    return ((actual - target) / target) * 100;
  }

  getOverallPerformanceScore(): number {
    const scores = [];
    
    if (this.efficiencyMetrics?.overallEquipmentEffectiveness) {
      scores.push(this.efficiencyMetrics.overallEquipmentEffectiveness);
    }
    
    if (this.qualityMetrics?.qualityScore) {
      scores.push(this.qualityMetrics.qualityScore);
    }
    
    if (this.safetyMetrics?.safetyScore) {
      scores.push(this.safetyMetrics.safetyScore);
    }
    
    if (this.environmentalMetrics?.sustainabilityScore) {
      scores.push(this.environmentalMetrics.sustainabilityScore);
    }
    
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  }

  identifyTopIssues(): string[] {
    const issues: string[] = [];
    
    // Check quality issues
    if (this.qualityMetrics?.defectRate && this.qualityMetrics.defectRate > 5) {
      issues.push('High defect rate detected');
    }
    
    // Check efficiency issues
    if (this.efficiencyMetrics?.overallEquipmentEffectiveness && 
        this.efficiencyMetrics.overallEquipmentEffectiveness < 70) {
      issues.push('Low OEE performance');
    }
    
    // Check downtime issues
    if (this.downtimeAnalysis?.unplannedDowntime && 
        this.downtimeAnalysis.unplannedDowntime > 60) {
      issues.push('Excessive unplanned downtime');
    }
    
    // Check cost issues
    const costVariance = this.getCostVariance();
    if (costVariance > 10) {
      issues.push('Cost variance exceeds acceptable limits');
    }
    
    // Check production issues
    const productionVariance = this.getProductionVariance();
    if (productionVariance < -10) {
      issues.push('Production below target');
    }
    
    return issues;
  }

  generateActionItems(): string[] {
    const actions: string[] = [];
    const issues = this.identifyTopIssues();
    
    if (issues.includes('High defect rate detected')) {
      actions.push('Review quality control procedures');
      actions.push('Investigate root causes of defects');
      actions.push('Enhance operator training');
    }
    
    if (issues.includes('Low OEE performance')) {
      actions.push('Analyze equipment utilization');
      actions.push('Optimize maintenance schedules');
      actions.push('Review setup procedures');
    }
    
    if (issues.includes('Excessive unplanned downtime')) {
      actions.push('Implement predictive maintenance');
      actions.push('Review spare parts inventory');
      actions.push('Enhance operator training on equipment care');
    }
    
    return actions;
  }

  validateData(): string[] {
    const errors: string[] = [];
    
    if (!this.measurementDate) {
      errors.push('Measurement date is required');
    }
    
    if (this.productionMetrics?.unitsProduced && this.productionMetrics.unitsProduced < 0) {
      errors.push('Units produced cannot be negative');
    }
    
    if (this.qualityMetrics?.defectRate && 
        (this.qualityMetrics.defectRate < 0 || this.qualityMetrics.defectRate > 100)) {
      errors.push('Defect rate must be between 0 and 100');
    }
    
    if (this.efficiencyMetrics?.overallEquipmentEffectiveness &&
        (this.efficiencyMetrics.overallEquipmentEffectiveness < 0 || 
         this.efficiencyMetrics.overallEquipmentEffectiveness > 100)) {
      errors.push('OEE must be between 0 and 100');
    }
    
    return errors;
  }

  generateSummaryReport(): object {
    return {
      analyticsCode: this.analyticsCode,
      name: this.name,
      period: {
        start: this.periodStart,
        end: this.periodEnd,
        type: this.analyticsType,
      },
      overallScore: this.getOverallPerformanceScore(),
      oee: this.calculateOEE(),
      productionVariance: this.getProductionVariance(),
      costVariance: this.getCostVariance(),
      topIssues: this.identifyTopIssues(),
      actionItems: this.generateActionItems(),
      keyMetrics: {
        production: this.productionMetrics,
        quality: this.qualityMetrics,
        efficiency: this.efficiencyMetrics,
        cost: this.costAnalysis,
      },
      trends: this.performanceTrends,
      benchmarks: this.benchmarkingData,
    };
  }

  compareWithBenchmark(benchmarkType: string): object {
    if (!this.benchmarkingData) return {};
    
    const benchmark = (this.benchmarkingData as any)[benchmarkType];
    if (!benchmark) return {};
    
    return {
      current: this.getOverallPerformanceScore(),
      benchmark: benchmark.score || 0,
      gap: (benchmark.score || 0) - this.getOverallPerformanceScore(),
      percentile: this.calculatePercentile(benchmarkType),
      recommendations: this.generateBenchmarkRecommendations(benchmarkType),
    };
  }

  private calculatePercentile(benchmarkType: string): number {
    // Simplified percentile calculation
    const currentScore = this.getOverallPerformanceScore();
    
    if (currentScore >= 90) return 95;
    if (currentScore >= 80) return 80;
    if (currentScore >= 70) return 65;
    if (currentScore >= 60) return 50;
    return 25;
  }

  private generateBenchmarkRecommendations(benchmarkType: string): string[] {
    const recommendations: string[] = [];
    const gap = this.compareWithBenchmark(benchmarkType);
    
    if ((gap as any).gap > 10) {
      recommendations.push('Implement lean manufacturing principles');
      recommendations.push('Enhance automation capabilities');
      recommendations.push('Optimize production scheduling');
      recommendations.push('Improve quality management systems');
    }
    
    return recommendations;
  }

  updateRealTimeData(newData: object): void {
    this.realTimeData = {
      lastUpdate: new Date(),
      updateFrequency: this.realTimeData?.updateFrequency || 60,
      dataPoints: [...(this.realTimeData?.dataPoints || []), newData],
      alerts: this.realTimeData?.alerts || [],
      notifications: this.realTimeData?.notifications || [],
    };
    
    this.isRealTime = true;
  }

  archiveData(): void {
    // Mark data for archival
    this.updatedAt = new Date();
    // In practice, this would move data to an archive table
  }
}
