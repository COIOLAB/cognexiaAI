/**
 * Capacity Plan Entity
 * 
 * Represents production capacity planning with resource allocation,
 * bottleneck analysis, and Industry 5.0 adaptive capacity management.
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

export type CapacityType = 'MACHINE' | 'LABOR' | 'FACILITY' | 'TOOLING' | 'MIXED';
export type CapacityStatus = 'DRAFT' | 'ACTIVE' | 'OVERLOADED' | 'UNDERUTILIZED' | 'OPTIMAL';
export type LoadingStrategy = 'LEVEL' | 'CHASE' | 'HYBRID' | 'AI_OPTIMIZED';

@Entity('capacity_plans')
@Index(['companyId', 'planningPeriodStart', 'planningPeriodEnd'])
@Index(['resourceId', 'status'])
@Index(['createdAt'])
export class CapacityPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  companyId: string;

  @Column({ type: 'varchar', length: 50 })
  resourceId: string;

  @Column({ type: 'varchar', length: 255 })
  resourceName: string;

  @Column({ type: 'enum', enum: ['MACHINE', 'LABOR', 'FACILITY', 'TOOLING', 'MIXED'] })
  capacityType: CapacityType;

  @Column({ type: 'date' })
  planningPeriodStart: Date;

  @Column({ type: 'date' })
  planningPeriodEnd: Date;

  @Column({ type: 'enum', enum: ['DRAFT', 'ACTIVE', 'OVERLOADED', 'UNDERUTILIZED', 'OPTIMAL'] })
  status: CapacityStatus;

  // Capacity Specifications
  @Column({ type: 'decimal', precision: 15, scale: 4 })
  maxCapacity: number;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  availableCapacity: number;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  allocatedCapacity: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  bufferCapacity: number;

  @Column({ type: 'varchar', length: 50 })
  capacityUnit: string; // hours, units, kilograms, etc.

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  utilizationTarget: number; // Target utilization percentage

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  currentUtilization: number;

  // Capacity Loading Strategy
  @Column({ type: 'enum', enum: ['LEVEL', 'CHASE', 'HYBRID', 'AI_OPTIMIZED'] })
  loadingStrategy: LoadingStrategy;

  @Column({ type: 'json', nullable: true })
  loadingParameters: {
    smoothing_factor?: number;
    demand_variability_threshold?: number;
    cost_optimization_weight?: number;
    service_level_target?: number;
  };

  // Scheduling and Shifts
  @Column({ type: 'json', nullable: true })
  shiftConfiguration: {
    shifts: Array<{
      shift_name: string;
      start_time: string;
      end_time: string;
      capacity_multiplier: number;
      days_of_week: string[];
    }>;
    overtime_rules: {
      max_overtime_hours: number;
      overtime_multiplier: number;
      approval_required: boolean;
    };
  };

  // Capacity Constraints
  @Column({ type: 'json', nullable: true })
  constraints: {
    maintenance_windows: Array<{
      start_time: Date;
      end_time: Date;
      impact_percentage: number;
      description: string;
    }>;
    skills_requirements: Array<{
      skill: string;
      required_level: number;
      available_workforce: number;
    }>;
    equipment_limitations: Array<{
      limitation_type: string;
      impact: number;
      mitigation: string;
    }>;
  };

  // Bottleneck Analysis
  @Column({ type: 'json', nullable: true })
  bottleneckAnalysis: {
    is_bottleneck: boolean;
    bottleneck_score: number;
    upstream_dependencies: string[];
    downstream_impacts: string[];
    improvement_opportunities: Array<{
      opportunity: string;
      potential_gain: number;
      investment_required: number;
      implementation_time: number;
    }>;
  };

  // Performance Metrics
  @Column({ type: 'json', nullable: true })
  performanceMetrics: {
    efficiency: number;
    productivity: number;
    oee: number; // Overall Equipment Effectiveness
    availability: number;
    quality_rate: number;
    throughput: number;
    cycle_time: number;
    setup_time: number;
  };

  // AI and ML Integration
  @Column({ type: 'json', nullable: true })
  aiOptimization: {
    model_version: string;
    last_optimization: Date;
    optimization_score: number;
    recommendations: Array<{
      type: string;
      description: string;
      expected_improvement: number;
      confidence: number;
    }>;
    predictive_insights: Array<{
      insight: string;
      probability: number;
      impact: string;
    }>;
  };

  // Financial Impact
  @Column({ type: 'json', nullable: true })
  financialImpact: {
    capacity_cost: number;
    utilization_cost: number;
    overtime_cost: number;
    opportunity_cost: number;
    total_cost: number;
    cost_per_unit: number;
    roi_metrics: {
      capacity_roi: number;
      payback_period: number;
    };
  };

  // Risk Assessment
  @Column({ type: 'json', nullable: true })
  riskAssessment: {
    capacity_risks: Array<{
      risk_type: string;
      probability: number;
      impact: number;
      mitigation_plan: string;
    }>;
    demand_variability_risk: number;
    supply_risk: number;
    technical_risk: number;
    overall_risk_score: number;
  };

  // Scenario Analysis
  @Column({ type: 'json', nullable: true })
  scenarioAnalysis: {
    base_case: {
      utilization: number;
      cost: number;
      service_level: number;
    };
    optimistic: {
      utilization: number;
      cost: number;
      service_level: number;
    };
    pessimistic: {
      utilization: number;
      cost: number;
      service_level: number;
    };
    recommended_scenario: string;
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

  // Integration Metadata
  @Column({ type: 'json', nullable: true })
  integrationData: {
    erp_reference: string;
    mrp_reference: string;
    wms_reference: string;
    last_sync: Date;
    sync_status: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  // Computed Properties
  get utilizationPercentage(): number {
    return (this.allocatedCapacity / this.availableCapacity) * 100;
  }

  get remainingCapacity(): number {
    return this.availableCapacity - this.allocatedCapacity;
  }

  get isOverloaded(): boolean {
    return this.utilizationPercentage > this.utilizationTarget;
  }

  get isUnderUtilized(): boolean {
    return this.utilizationPercentage < (this.utilizationTarget * 0.8);
  }

  get capacityEfficiency(): number {
    return this.performanceMetrics?.efficiency || 0;
  }

  get bottleneckScore(): number {
    return this.bottleneckAnalysis?.bottleneck_score || 0;
  }

  get riskLevel(): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const riskScore = this.riskAssessment?.overall_risk_score || 0;
    
    if (riskScore >= 0.8) return 'CRITICAL';
    if (riskScore >= 0.6) return 'HIGH';
    if (riskScore >= 0.3) return 'MEDIUM';
    return 'LOW';
  }

  // Business Methods
  canAllocateCapacity(requestedCapacity: number): boolean {
    return this.remainingCapacity >= requestedCapacity;
  }

  allocateCapacity(amount: number): boolean {
    if (this.canAllocateCapacity(amount)) {
      this.allocatedCapacity += amount;
      this.updateStatus();
      return true;
    }
    return false;
  }

  releaseCapacity(amount: number): void {
    this.allocatedCapacity = Math.max(0, this.allocatedCapacity - amount);
    this.updateStatus();
  }

  updateStatus(): void {
    const utilization = this.utilizationPercentage;
    
    if (utilization > this.utilizationTarget * 1.1) {
      this.status = 'OVERLOADED';
    } else if (utilization < this.utilizationTarget * 0.8) {
      this.status = 'UNDERUTILIZED';
    } else {
      this.status = 'OPTIMAL';
    }
  }

  calculateOEE(): number {
    const metrics = this.performanceMetrics;
    if (!metrics) return 0;
    
    return (metrics.availability / 100) * 
           (metrics.quality_rate / 100) * 
           (metrics.efficiency / 100) * 100;
  }

  getCapacityForecast(days: number): Array<{ date: Date; availableCapacity: number; forecastedLoad: number }> {
    // Placeholder for capacity forecasting logic
    const forecast = [];
    const currentDate = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date,
        availableCapacity: this.availableCapacity,
        forecastedLoad: this.allocatedCapacity * (0.8 + Math.random() * 0.4), // Simulated forecast
      });
    }
    
    return forecast;
  }
}
