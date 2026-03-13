/**
 * Demand Forecast Entity
 * 
 * Represents demand forecasting data with AI-powered predictions,
 * statistical models, and market intelligence integration.
 * 
 * @version 3.0.0
 * @industry 5.0
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';

export type ForecastMethod = 
  | 'ARIMA'
  | 'EXPONENTIAL_SMOOTHING'
  | 'NEURAL_NETWORK'
  | 'ENSEMBLE'
  | 'QUANTUM_AI'
  | 'MACHINE_LEARNING';

export type ForecastAccuracyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXCELLENT';

@Entity('demand_forecasts')
@Index(['productId', 'forecastPeriodStart', 'forecastPeriodEnd'])
@Index(['companyId', 'status'])
@Index(['createdAt'])
export class DemandForecast {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  companyId: string;

  @Column({ type: 'varchar', length: 50 })
  productId: string;

  @Column({ type: 'varchar', length: 255 })
  productName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  productCategory: string;

  @Column({ type: 'date' })
  forecastPeriodStart: Date;

  @Column({ type: 'date' })
  forecastPeriodEnd: Date;

  @Column({ type: 'enum', enum: ['DRAFT', 'ACTIVE', 'ARCHIVED', 'SUPERSEDED'] })
  status: string;

  // Forecast Methods and Models
  @Column({ type: 'enum', enum: ['ARIMA', 'EXPONENTIAL_SMOOTHING', 'NEURAL_NETWORK', 'ENSEMBLE', 'QUANTUM_AI', 'MACHINE_LEARNING'] })
  primaryMethod: ForecastMethod;

  @Column({ type: 'json', nullable: true })
  methodParameters: {
    seasonality?: boolean;
    trend?: boolean;
    confidence_interval?: number;
    model_complexity?: string;
    training_period?: number;
  };

  // Forecast Results
  @Column({ type: 'decimal', precision: 15, scale: 4 })
  forecastedDemand: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  upperBound: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  lowerBound: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  confidenceLevel: number;

  @Column({ type: 'enum', enum: ['LOW', 'MEDIUM', 'HIGH', 'EXCELLENT'] })
  accuracyLevel: ForecastAccuracyLevel;

  // Historical Analysis
  @Column({ type: 'json', nullable: true })
  historicalData: {
    periods: Array<{
      period: string;
      actualDemand: number;
      forecastedDemand: number;
      accuracy: number;
    }>;
    averageAccuracy: number;
    trend: string;
    seasonality: boolean;
  };

  // Market Intelligence
  @Column({ type: 'json', nullable: true })
  marketFactors: {
    economic_indicators?: Array<{
      indicator: string;
      value: number;
      impact: number;
    }>;
    competitor_analysis?: {
      market_share: number;
      pricing_pressure: number;
      competitive_actions: string[];
    };
    external_events?: Array<{
      event: string;
      probability: number;
      impact: number;
    }>;
  };

  // AI and ML Metrics
  @Column({ type: 'json', nullable: true })
  modelPerformance: {
    mape: number; // Mean Absolute Percentage Error
    rmse: number; // Root Mean Square Error
    mad: number;  // Mean Absolute Deviation
    training_accuracy: number;
    validation_accuracy: number;
    last_training_date: Date;
  };

  // Business Context
  @Column({ type: 'json', nullable: true })
  businessContext: {
    sales_targets?: number;
    marketing_campaigns?: Array<{
      name: string;
      start_date: Date;
      end_date: Date;
      expected_lift: number;
    }>;
    product_lifecycle_stage?: string;
    seasonal_patterns?: Array<{
      season: string;
      multiplier: number;
    }>;
  };

  // Risk Assessment
  @Column({ type: 'json', nullable: true })
  riskAssessment: {
    demand_volatility: number;
    supply_constraints: boolean;
    market_uncertainty: number;
    risk_factors: string[];
    mitigation_strategies: string[];
  };

  // Approval and Workflow
  @Column({ type: 'varchar', length: 50 })
  createdBy: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  approvalWorkflow: {
    steps: Array<{
      step: string;
      assignee: string;
      status: string;
      completed_at?: Date;
      comments?: string;
    }>;
  };

  // System Metadata
  @Column({ type: 'varchar', length: 50, nullable: true })
  sourceSystem: string;

  @Column({ type: 'json', nullable: true })
  integrationMetadata: {
    last_sync: Date;
    sync_status: string;
    external_references: Array<{
      system: string;
      reference_id: string;
    }>;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  // Computed Properties
  get forecastAccuracyScore(): number {
    return this.modelPerformance?.training_accuracy || 0;
  }

  get demandVariability(): number {
    if (!this.historicalData?.periods) return 0;
    
    const demands = this.historicalData.periods.map(p => p.actualDemand);
    const mean = demands.reduce((sum, d) => sum + d, 0) / demands.length;
    const variance = demands.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / demands.length;
    
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  get riskLevel(): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const riskScore = this.riskAssessment?.demand_volatility || 0;
    const accuracy = this.modelPerformance?.training_accuracy || 100;
    
    if (riskScore > 0.5 || accuracy < 70) return 'CRITICAL';
    if (riskScore > 0.3 || accuracy < 80) return 'HIGH';
    if (riskScore > 0.1 || accuracy < 90) return 'MEDIUM';
    return 'LOW';
  }

  // Business Methods
  isExpired(): boolean {
    return this.forecastPeriodEnd < new Date();
  }

  requiresUpdate(): boolean {
    const daysSinceUpdate = (new Date().getTime() - this.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate > 7; // Update if older than 7 days
  }

  isWithinConfidenceBounds(actualValue: number): boolean {
    if (!this.upperBound || !this.lowerBound) return true;
    return actualValue >= this.lowerBound && actualValue <= this.upperBound;
  }
}
