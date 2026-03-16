import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DigitalTwin } from './digital-twin.entity';

export enum SimulationType {
  PREDICTIVE_MAINTENANCE = 'predictive_maintenance',
  PROCESS_OPTIMIZATION = 'process_optimization',
  WHAT_IF_ANALYSIS = 'what_if_analysis',
  FAILURE_ANALYSIS = 'failure_analysis',
  CAPACITY_PLANNING = 'capacity_planning',
  ENERGY_OPTIMIZATION = 'energy_optimization',
  QUALITY_PREDICTION = 'quality_prediction',
  SUPPLY_CHAIN = 'supply_chain',
  SAFETY_ANALYSIS = 'safety_analysis',
  STRESS_TESTING = 'stress_testing',
  PRODUCTION_SCHEDULING = 'production_scheduling',
  RISK_ASSESSMENT = 'risk_assessment',
}

export enum SimulationStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
}

export enum SimulationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ComputeType {
  CLASSICAL = 'classical',
  QUANTUM = 'quantum',
  HYBRID = 'hybrid',
  GPU_ACCELERATED = 'gpu_accelerated',
  DISTRIBUTED = 'distributed',
  EDGE_COMPUTING = 'edge_computing',
}

@Entity('digital_twin_simulations')
@Index(['twinId'])
@Index(['simulationType'])
@Index(['status'])
@Index(['priority'])
@Index(['createdAt'])
export class DigitalTwinSimulation {
  @ApiProperty({ description: 'Simulation UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Simulation name' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Simulation description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Type of simulation', enum: SimulationType })
  @Column({ type: 'enum', enum: SimulationType })
  simulationType: SimulationType;

  @ApiProperty({ description: 'Current simulation status', enum: SimulationStatus })
  @Column({ type: 'enum', enum: SimulationStatus, default: SimulationStatus.QUEUED })
  status: SimulationStatus;

  @ApiProperty({ description: 'Simulation priority', enum: SimulationPriority })
  @Column({ type: 'enum', enum: SimulationPriority, default: SimulationPriority.MEDIUM })
  priority: SimulationPriority;

  @ApiProperty({ description: 'Compute type used for simulation', enum: ComputeType })
  @Column({ type: 'enum', enum: ComputeType, default: ComputeType.CLASSICAL })
  computeType: ComputeType;

  // Related Digital Twin
  @ApiProperty({ description: 'Associated digital twin ID' })
  @Column({ name: 'twin_id' })
  twinId: string;

  @ManyToOne(() => DigitalTwin, (digitalTwin) => digitalTwin.simulations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'twin_id' })
  digitalTwin: DigitalTwin;

  // Simulation Configuration
  @ApiProperty({ description: 'Simulation parameters and configuration', type: 'object' })
  @Column({ type: 'jsonb' })
  configuration: {
    timeHorizon: number; // in hours
    timeStep: number; // in seconds
    accuracy: 'low' | 'medium' | 'high' | 'ultra';
    modelComplexity: 'simple' | 'moderate' | 'complex' | 'ultra_complex';
    enableUncertainty: boolean;
    monteCarloRuns?: number;
    confidenceLevel?: number;
    parallelization: boolean;
    realTimeData: boolean;
    historicalDataRange?: {
      start: string;
      end: string;
    };
    variables: Array<{
      name: string;
      type: 'input' | 'output' | 'state';
      range?: { min: number; max: number };
      distribution?: string;
      constraints?: Record<string, any>;
    }>;
    objectives: Array<{
      name: string;
      type: 'minimize' | 'maximize' | 'target';
      weight: number;
      target?: number;
      tolerance?: number;
    }>;
    constraints: Array<{
      name: string;
      expression: string;
      type: 'equality' | 'inequality';
      bounds?: { lower?: number; upper?: number };
    }>;
  };

  // Scenario Definition
  @ApiProperty({ description: 'Simulation scenario parameters', type: 'object' })
  @Column({ type: 'jsonb' })
  scenario: {
    name: string;
    baseline: Record<string, any>;
    variations: Array<{
      name: string;
      description: string;
      parameters: Record<string, any>;
      probability?: number;
    }>;
    externalFactors: Array<{
      factor: string;
      impact: 'low' | 'medium' | 'high';
      variability: number;
      correlation?: Record<string, number>;
    }>;
    businessRules: Array<{
      rule: string;
      condition: string;
      action: string;
      priority: number;
    }>;
    kpis: Array<{
      name: string;
      formula: string;
      target: number;
      threshold: { warning: number; critical: number };
    }>;
  };

  // Execution Details
  @ApiProperty({ description: 'Simulation execution information', type: 'object' })
  @Column({ type: 'jsonb', nullable: true })
  execution?: {
    startedAt?: string;
    completedAt?: string;
    duration?: number; // in seconds
    progress: number; // 0-100
    currentPhase?: string;
    estimatedTimeRemaining?: number;
    resourceUtilization: {
      cpu?: number;
      memory?: number;
      gpu?: number;
      disk?: number;
      network?: number;
    };
    computeResources: {
      nodes?: number;
      cores?: number;
      qubits?: number; // for quantum simulations
      gpuCards?: number;
      memoryGB?: number;
    };
    errors?: Array<{
      timestamp: string;
      severity: 'warning' | 'error' | 'critical';
      code: string;
      message: string;
      context?: Record<string, any>;
    }>;
    warnings?: Array<{
      timestamp: string;
      type: string;
      message: string;
    }>;
  };

  // Results and Outputs
  @ApiProperty({ description: 'Simulation results and analysis', type: 'object' })
  @Column({ type: 'jsonb', nullable: true })
  results?: {
    summary: {
      objectiveValues: Record<string, number>;
      keyMetrics: Record<string, any>;
      convergenceStatus: 'converged' | 'not_converged' | 'partially_converged';
      accuracyAchieved: number;
      qualityScore: number;
    };
    timeSeries?: Array<{
      timestamp: string;
      values: Record<string, number>;
    }>;
    optimization?: {
      optimalParameters: Record<string, any>;
      improvementPercent: number;
      sensitivityAnalysis: Record<string, number>;
      robustness: number;
    };
    predictions?: Array<{
      variable: string;
      forecast: Array<{
        time: string;
        value: number;
        confidence?: number;
        upperBound?: number;
        lowerBound?: number;
      }>;
      accuracy: number;
    }>;
    anomalies?: Array<{
      timestamp: string;
      variable: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      likelihood: number;
      impact: number;
    }>;
    recommendations?: Array<{
      type: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
      impact: number;
      effort: number;
      roi: number;
      implementationSteps: string[];
    }>;
    riskAssessment?: {
      overallRisk: 'low' | 'medium' | 'high' | 'critical';
      riskFactors: Array<{
        factor: string;
        probability: number;
        impact: number;
        riskLevel: string;
        mitigation: string;
      }>;
      probabilityDistribution: Record<string, number>;
    };
    comparisons?: Array<{
      scenario: string;
      metrics: Record<string, number>;
      improvements: Record<string, number>;
      tradeoffs: Record<string, any>;
    }>;
  };

  // Model Information
  @ApiProperty({ description: 'Simulation model details', type: 'object' })
  @Column({ type: 'jsonb' })
  modelInfo: {
    type: string;
    version: string;
    framework: string;
    algorithms: string[];
    complexity: number;
    validationStatus: 'validated' | 'pending' | 'failed';
    calibrationDate?: string;
    accuracy?: number;
    confidence?: number;
    limitations: string[];
    assumptions: string[];
    dataRequirements: Array<{
      dataset: string;
      required: boolean;
      frequency: string;
      quality: 'low' | 'medium' | 'high';
    }>;
    performance: {
      computationTime?: number;
      memoryUsage?: number;
      scalability?: 'low' | 'medium' | 'high';
      reliability?: number;
    };
  };

  // Quantum-Specific Information (if applicable)
  @ApiProperty({ description: 'Quantum simulation details', type: 'object' })
  @Column({ type: 'jsonb', nullable: true })
  quantumInfo?: {
    processor: string;
    qubits: number;
    gateCount: number;
    circuitDepth: number;
    errorRate: number;
    coherenceTime: number;
    algorithms: string[];
    entanglementMeasure?: number;
    quantumAdvantage?: boolean;
    classicalComparison?: {
      speedup: number;
      accuracyImprovement: number;
      memoryReduction: number;
    };
  };

  // Validation and Quality
  @ApiProperty({ description: 'Simulation validation metrics', type: 'object' })
  @Column({ type: 'jsonb', nullable: true })
  validation?: {
    dataQuality: {
      completeness: number;
      accuracy: number;
      consistency: number;
      timeliness: number;
    };
    modelValidation: {
      statisticalTests: Record<string, any>;
      crossValidation: number;
      holdoutValidation: number;
      residualAnalysis: Record<string, any>;
    };
    resultValidation: {
      sanityChecks: boolean;
      boundaryConditions: boolean;
      physicalConstraints: boolean;
      businessLogic: boolean;
    };
    uncertainty: {
      parameterUncertainty: Record<string, number>;
      modelUncertainty: number;
      dataUncertainty: number;
      propagatedUncertainty: Record<string, number>;
    };
  };

  // Cost and Resource Tracking
  @ApiProperty({ description: 'Simulation cost and resource information', type: 'object' })
  @Column({ type: 'jsonb', nullable: true })
  costInfo?: {
    estimatedCost: number;
    actualCost?: number;
    currency: string;
    breakdown: {
      compute?: number;
      storage?: number;
      network?: number;
      licensing?: number;
      personnel?: number;
    };
    resourceHours: {
      cpuHours?: number;
      gpuHours?: number;
      quantumHours?: number;
      storageGB?: number;
    };
    costEfficiency: {
      costPerResult: number;
      costPerAccuracy: number;
      resourceUtilizationRate: number;
    };
  };

  @ApiProperty({ description: 'Simulation tags' })
  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @ApiProperty({ description: 'Custom metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Internal notes' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Record creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({ description: 'Created by user' })
  @Column({ name: 'created_by', length: 255 })
  createdBy: string;

  @ApiProperty({ description: 'Last updated by user' })
  @Column({ name: 'updated_by', length: 255 })
  updatedBy: string;

  // Methods
  isCompleted(): boolean {
    return this.status === SimulationStatus.COMPLETED;
  }

  isRunning(): boolean {
    return this.status === SimulationStatus.RUNNING;
  }

  isFailed(): boolean {
    return this.status === SimulationStatus.FAILED;
  }

  getProgress(): number {
    return this.execution?.progress || 0;
  }

  getDuration(): number {
    return this.execution?.duration || 0;
  }

  getEstimatedTimeRemaining(): number {
    return this.execution?.estimatedTimeRemaining || 0;
  }

  hasQuantumAdvantage(): boolean {
    return this.quantumInfo?.quantumAdvantage === true;
  }

  getAccuracy(): number {
    return this.results?.summary.accuracyAchieved || 0;
  }

  getQualityScore(): number {
    return this.results?.summary.qualityScore || 0;
  }

  getCriticalAnomalies(): any[] {
    if (!this.results?.anomalies) return [];
    return this.results.anomalies.filter(a => a.severity === 'critical');
  }

  getHighPriorityRecommendations(): any[] {
    if (!this.results?.recommendations) return [];
    return this.results.recommendations.filter(r => r.priority === 'high');
  }

  getROI(): number {
    if (!this.results?.recommendations) return 0;
    return this.results.recommendations.reduce((total, rec) => total + rec.roi, 0) / this.results.recommendations.length;
  }

  getRiskLevel(): string {
    return this.results?.riskAssessment?.overallRisk || 'unknown';
  }

  getConvergenceStatus(): string {
    return this.results?.summary.convergenceStatus || 'unknown';
  }

  updateProgress(progress: number, phase?: string): void {
    if (!this.execution) {
      this.execution = {
        progress: 0,
        resourceUtilization: {},
        computeResources: {},
      };
    }
    
    this.execution.progress = Math.min(100, Math.max(0, progress));
    if (phase) {
      this.execution.currentPhase = phase;
    }
  }

  addError(severity: 'warning' | 'error' | 'critical', code: string, message: string, context?: Record<string, any>): void {
    if (!this.execution) {
      this.execution = {
        progress: 0,
        resourceUtilization: {},
        computeResources: {},
      };
    }
    
    if (!this.execution.errors) {
      this.execution.errors = [];
    }
    
    this.execution.errors.push({
      timestamp: new Date().toISOString(),
      severity,
      code,
      message,
      context,
    });
  }

  addRecommendation(type: string, description: string, priority: 'low' | 'medium' | 'high', impact: number, effort: number, roi: number, steps: string[]): void {
    if (!this.results) {
      this.results = {
        summary: {
          objectiveValues: {},
          keyMetrics: {},
          convergenceStatus: 'not_converged',
          accuracyAchieved: 0,
          qualityScore: 0,
        },
      };
    }
    
    if (!this.results.recommendations) {
      this.results.recommendations = [];
    }
    
    this.results.recommendations.push({
      type,
      description,
      priority,
      impact,
      effort,
      roi,
      implementationSteps: steps,
    });
  }

  calculateCostEfficiency(): Record<string, number> {
    if (!this.costInfo || !this.results) {
      return { costPerResult: 0, costPerAccuracy: 0, resourceUtilizationRate: 0 };
    }
    
    const actualCost = this.costInfo.actualCost || this.costInfo.estimatedCost;
    const accuracy = this.results.summary.accuracyAchieved || 1;
    const resultCount = Object.keys(this.results.summary.keyMetrics).length || 1;
    
    return {
      costPerResult: actualCost / resultCount,
      costPerAccuracy: actualCost / accuracy,
      resourceUtilizationRate: this.execution?.resourceUtilization.cpu || 0,
    };
  }

  getExecutionSummary(): Record<string, any> {
    return {
      status: this.status,
      progress: this.getProgress(),
      duration: this.getDuration(),
      accuracy: this.getAccuracy(),
      quality: this.getQualityScore(),
      risks: this.getRiskLevel(),
      recommendations: this.results?.recommendations?.length || 0,
      anomalies: this.results?.anomalies?.length || 0,
      convergence: this.getConvergenceStatus(),
    };
  }

  isHighPriority(): boolean {
    return this.priority === SimulationPriority.HIGH || this.priority === SimulationPriority.URGENT;
  }

  requiresAttention(): boolean {
    return (
      this.isFailed() ||
      this.getCriticalAnomalies().length > 0 ||
      this.getRiskLevel() === 'critical' ||
      (this.isRunning() && this.execution?.errors?.some(e => e.severity === 'critical'))
    );
  }

  getSimulationTypeCategory(): string {
    const categories = {
      [SimulationType.PREDICTIVE_MAINTENANCE]: 'Maintenance',
      [SimulationType.PROCESS_OPTIMIZATION]: 'Optimization',
      [SimulationType.WHAT_IF_ANALYSIS]: 'Analysis',
      [SimulationType.FAILURE_ANALYSIS]: 'Analysis',
      [SimulationType.CAPACITY_PLANNING]: 'Planning',
      [SimulationType.ENERGY_OPTIMIZATION]: 'Optimization',
      [SimulationType.QUALITY_PREDICTION]: 'Quality',
      [SimulationType.SUPPLY_CHAIN]: 'Supply Chain',
      [SimulationType.SAFETY_ANALYSIS]: 'Safety',
      [SimulationType.STRESS_TESTING]: 'Testing',
      [SimulationType.PRODUCTION_SCHEDULING]: 'Planning',
      [SimulationType.RISK_ASSESSMENT]: 'Risk',
    };
    
    return categories[this.simulationType] || 'Other';
  }
}
