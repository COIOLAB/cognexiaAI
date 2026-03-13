import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';

export enum PlanStatus {
  DRAFT = 'draft',
  OPTIMIZING = 'optimizing',
  OPTIMIZED = 'optimized',
  APPROVED = 'approved',
  ACTIVE = 'active',
  NEEDS_REVISION = 'needs_revision',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PlanType {
  MASTER = 'master',
  DETAILED = 'detailed',
  OPERATIONAL = 'operational'
}

export enum SchedulingObjective {
  MINIMIZE_MAKESPAN = 'minimize_makespan',
  MINIMIZE_TARDINESS = 'minimize_tardiness',
  MAXIMIZE_UTILIZATION = 'maximize_utilization',
  MINIMIZE_COST = 'minimize_cost',
  MAXIMIZE_THROUGHPUT = 'maximize_throughput',
  BALANCE_WORKLOAD = 'balance_workload',
  MINIMIZE_INVENTORY = 'minimize_inventory'
}

export enum OptimizationAlgorithm {
  GENETIC_ALGORITHM = 'genetic_algorithm',
  SIMULATED_ANNEALING = 'simulated_annealing',
  PARTICLE_SWARM = 'particle_swarm',
  ANT_COLONY = 'ant_colony',
  TABU_SEARCH = 'tabu_search',
  LINEAR_PROGRAMMING = 'linear_programming',
  CONSTRAINT_PROGRAMMING = 'constraint_programming',
  REINFORCEMENT_LEARNING = 'reinforcement_learning'
}

@Entity('production_plans')
@Index(['planName'])
@Index(['status'])
@Index(['planType'])
@Index(['effectiveDate'])
@Index(['createdAt'])
export class ProductionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  planName: string;

  @Column({ 
    type: 'enum', 
    enum: PlanType,
    default: PlanType.DETAILED
  })
  planType: PlanType;

  @Column({ 
    type: 'enum', 
    enum: PlanStatus,
    default: PlanStatus.DRAFT
  })
  status: PlanStatus;

  @Column({ type: 'int' })
  planHorizon: number; // in days

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiryDate: Date;

  // Objectives stored as JSON
  @Column({ type: 'json' })
  objectives: Array<{
    type: SchedulingObjective;
    weight: number;
    target?: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;

  // Constraints stored as JSON
  @Column({ type: 'json', nullable: true })
  constraints: Array<{
    constraintType: string;
    description: string;
    isHard: boolean;
    penalty?: number;
    parameters: Record<string, any>;
  }>;

  // Production schedules stored as JSON
  @Column({ type: 'json', nullable: true })
  schedules: Array<{
    scheduleId: string;
    resourceId: string;
    resourceName: string;
    assignments: Array<{
      orderId: string;
      operationId: string;
      startTime: Date;
      endTime: Date;
      duration: number;
      priority: number;
    }>;
    utilization: {
      overall: number;
      planned: number;
      actual?: number;
    };
    bottlenecks: Array<{
      resourceId: string;
      resourceName: string;
      severity: number;
      impact: number;
      affectedOrders: string[];
      suggestions: Array<{
        type: string;
        description: string;
        estimatedImpact: number;
      }>;
    }>;
  }>;

  // Key Performance Indicators
  @Column({ type: 'json', nullable: true })
  kpis: Array<{
    id: string;
    kpiName: string;
    category: 'efficiency' | 'delivery' | 'utilization' | 'quality' | 'cost';
    currentValue: number;
    targetValue: number;
    unit: string;
    trend: 'improving' | 'stable' | 'declining';
    benchmark: number;
    calculationMethod: string;
    updateFrequency: string;
    historicalData: Array<{
      timestamp: Date;
      value: number;
    }>;
  }>;

  // Optimization results stored as JSON
  @Column({ type: 'json', nullable: true })
  optimizationResults: Array<{
    algorithmUsed: OptimizationAlgorithm;
    executionTime: number;
    bestSolution: {
      objectiveValue: number;
      schedule: any[];
      resourceUtilization: Record<string, number>;
      makespan: number;
      totalCost: number;
    };
    alternativeSolutions: Array<{
      objectiveValue: number;
      description: string;
      tradeoffs: string[];
    }>;
    convergenceData: Array<{
      iteration: number;
      bestValue: number;
      averageValue: number;
    }>;
    recommendedActions: Array<{
      type: string;
      description: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
      estimatedImpact: string;
    }>;
  }>;

  // Demand forecasts used in planning
  @Column({ type: 'json', nullable: true })
  demandForecasts: Array<{
    productId: string;
    productName: string;
    forecastedDemand: Array<{
      date: Date;
      quantity: number;
      confidence: number;
    }>;
    accuracy: number;
    method: string;
  }>;

  // Approvals workflow
  @Column({ type: 'json', nullable: true })
  approvals: Array<{
    approvalId: string;
    approverId: string;
    approverName: string;
    approvalDate: Date;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
    level: number;
  }>;

  // Revision history
  @Column({ type: 'json', nullable: true })
  revisions: Array<{
    revisionNumber: number;
    revisorId: string;
    revisionDate: Date;
    reason: string;
    changes: Array<{
      changeType: string;
      description: string;
      oldValue: any;
      newValue: any;
      affectedEntities: string[];
    }>;
    impact: {
      scheduleChanges: number;
      resourceReallocation: number;
      deliveryDateChanges: number;
      costImpact: number;
      riskAssessment: 'Low' | 'Medium' | 'High' | 'Critical';
    };
  }>;

  // Plan metadata
  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ type: 'json', nullable: true })
  metadata: {
    department?: string;
    facility?: string;
    productLines?: string[];
    customerSegments?: string[];
    marketConditions?: string;
    seasonality?: {
      hasSeasonal: boolean;
      patterns?: string[];
    };
    riskFactors?: Array<{
      factor: string;
      likelihood: number;
      impact: number;
      mitigation: string;
    }>;
  };

  // Audit trail
  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastOptimizedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextReviewDate: Date;

  // AI and Advanced Analytics
  @Column({ type: 'json', nullable: true })
  aiInsights: {
    bottleneckPrediction: Array<{
      resourceId: string;
      probability: number;
      timeframe: string;
      severity: number;
      preventiveMeasures: string[];
    }>;
    demandPatterns: Array<{
      productId: string;
      pattern: 'seasonal' | 'trending' | 'cyclical' | 'irregular';
      strength: number;
      description: string;
    }>;
    optimizationSuggestions: Array<{
      type: 'resource_reallocation' | 'schedule_adjustment' | 'capacity_planning';
      priority: number;
      description: string;
      estimatedImprovement: number;
      implementationEffort: 'low' | 'medium' | 'high';
    }>;
    riskAnalysis: {
      overallRiskScore: number;
      riskFactors: Array<{
        category: 'demand' | 'capacity' | 'supply' | 'quality' | 'external';
        description: string;
        probability: number;
        impact: number;
        mitigationStrategies: string[];
      }>;
    };
  };

  // Advanced KPI Calculations
  calculateOverallEfficiency(): number {
    if (!this.kpis || this.kpis.length === 0) return 0;
    
    const efficiencyKPIs = this.kpis.filter(kpi => kpi.category === 'efficiency');
    if (efficiencyKPIs.length === 0) return 0;
    
    return efficiencyKPIs.reduce((sum, kpi) => sum + kpi.currentValue, 0) / efficiencyKPIs.length;
  }

  calculateResourceUtilization(): number {
    if (!this.schedules || this.schedules.length === 0) return 0;
    
    return this.schedules.reduce((sum, schedule) => sum + schedule.utilization.overall, 0) / this.schedules.length;
  }

  getBottleneckCount(): number {
    if (!this.schedules) return 0;
    
    return this.schedules.reduce((count, schedule) => 
      count + schedule.bottlenecks.filter(b => b.severity > 7).length, 0
    );
  }

  getCriticalPath(): Array<{operationId: string, duration: number, slack: number}> {
    // This would implement critical path method calculation
    // For now, return mock data
    return [];
  }

  getScheduleAdherence(): number {
    // Calculate schedule adherence based on actual vs planned
    if (!this.kpis) return 0;
    
    const adherenceKPI = this.kpis.find(kpi => kpi.kpiName.includes('Schedule Adherence'));
    return adherenceKPI ? adherenceKPI.currentValue : 0;
  }

  // Risk Assessment Methods
  assessPlanRisk(): {
    riskScore: number;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    primaryRisks: string[];
  } {
    let riskScore = 0;
    const risks: string[] = [];

    // Check bottlenecks
    const bottleneckCount = this.getBottleneckCount();
    if (bottleneckCount > 0) {
      riskScore += bottleneckCount * 15;
      risks.push(`${bottleneckCount} critical bottlenecks detected`);
    }

    // Check resource utilization
    const utilization = this.calculateResourceUtilization();
    if (utilization > 90) {
      riskScore += 20;
      risks.push('High resource utilization risk');
    } else if (utilization < 60) {
      riskScore += 10;
      risks.push('Underutilized resources');
    }

    // Check schedule adherence
    const adherence = this.getScheduleAdherence();
    if (adherence < 85) {
      riskScore += (90 - adherence);
      risks.push('Poor schedule adherence');
    }

    // Determine risk level
    let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    if (riskScore >= 70) riskLevel = 'Critical';
    else if (riskScore >= 50) riskLevel = 'High';
    else if (riskScore >= 30) riskLevel = 'Medium';
    else riskLevel = 'Low';

    return {
      riskScore: Math.min(riskScore, 100),
      riskLevel,
      primaryRisks: risks
    };
  }

  // Plan Validation Methods
  validatePlanConstraints(): {
    isValid: boolean;
    violations: Array<{
      constraint: string;
      severity: 'warning' | 'error';
      description: string;
      affectedEntities: string[];
    }>;
  } {
    const violations: Array<{
      constraint: string;
      severity: 'warning' | 'error';
      description: string;
      affectedEntities: string[];
    }> = [];

    // Validate capacity constraints
    if (this.schedules) {
      this.schedules.forEach(schedule => {
        if (schedule.utilization.overall > 1.0) {
          violations.push({
            constraint: 'capacity_constraint',
            severity: 'error',
            description: `Resource ${schedule.resourceName} is over-allocated (${(schedule.utilization.overall * 100).toFixed(1)}%)`,
            affectedEntities: [schedule.resourceId]
          });
        }
      });
    }

    // Validate time constraints
    // Implementation would check for deadline violations, etc.

    return {
      isValid: violations.filter(v => v.severity === 'error').length === 0,
      violations
    };
  }
}
