/**
 * Resource Plan Entity
 * 
 * Represents comprehensive resource planning including materials,
 * equipment, labor, and tooling with AI-powered optimization.
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

export type ResourceType = 'MATERIAL' | 'EQUIPMENT' | 'LABOR' | 'TOOLING' | 'FACILITY' | 'ENERGY';
export type AllocationStatus = 'PLANNED' | 'ALLOCATED' | 'IN_USE' | 'COMPLETED' | 'RELEASED';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EMERGENCY';

@Entity('resource_plans')
@Index(['companyId', 'planningPeriodStart', 'planningPeriodEnd'])
@Index(['resourceType', 'status'])
@Index(['productionPlanId'])
@Index(['createdAt'])
export class ResourcePlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  companyId: string;

  @Column({ type: 'varchar', length: 50 })
  productionPlanId: string;

  @Column({ type: 'varchar', length: 50 })
  resourceId: string;

  @Column({ type: 'varchar', length: 255 })
  resourceName: string;

  @Column({ type: 'enum', enum: ['MATERIAL', 'EQUIPMENT', 'LABOR', 'TOOLING', 'FACILITY', 'ENERGY'] })
  resourceType: ResourceType;

  @Column({ type: 'date' })
  planningPeriodStart: Date;

  @Column({ type: 'date' })
  planningPeriodEnd: Date;

  @Column({ type: 'enum', enum: ['PLANNED', 'ALLOCATED', 'IN_USE', 'COMPLETED', 'RELEASED'] })
  status: AllocationStatus;

  @Column({ type: 'enum', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'EMERGENCY'] })
  priority: PriorityLevel;

  // Resource Requirements
  @Column({ type: 'decimal', precision: 15, scale: 4 })
  requiredQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  allocatedQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  consumedQuantity: number;

  @Column({ type: 'varchar', length: 50 })
  unit: string;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  safetyStock: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  reorderPoint: number;

  // Scheduling Information
  @Column({ type: 'timestamp' })
  requiredDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  allocatedDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualEndDate: Date;

  @Column({ type: 'integer', nullable: true })
  leadTimeHours: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  setupTimeHours: number;

  // Cost Information
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unitCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  actualCost: number;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  // Supplier and Source Information
  @Column({ type: 'varchar', length: 50, nullable: true })
  supplierId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  supplierName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sourceLocation: string;

  @Column({ type: 'json', nullable: true })
  supplierMetrics: {
    reliability_score: number;
    quality_score: number;
    delivery_performance: number;
    cost_competitiveness: number;
    sustainability_score: number;
  };

  // Constraints and Dependencies
  @Column({ type: 'json', nullable: true })
  constraints: {
    availability_windows: Array<{
      start_time: Date;
      end_time: Date;
      availability_percentage: number;
    }>;
    skills_required: Array<{
      skill: string;
      level: number;
      certification_required: boolean;
    }>;
    equipment_dependencies: string[];
    material_compatibility: string[];
    environmental_requirements: Array<{
      parameter: string;
      min_value: number;
      max_value: number;
      unit: string;
    }>;
  };

  // Alternative Resources
  @Column({ type: 'json', nullable: true })
  alternatives: Array<{
    resource_id: string;
    resource_name: string;
    substitution_ratio: number;
    cost_difference: number;
    quality_impact: number;
    availability: string;
  }>;

  // Performance Tracking
  @Column({ type: 'json', nullable: true })
  performanceMetrics: {
    utilization_rate: number;
    efficiency_rate: number;
    quality_yield: number;
    downtime_percentage: number;
    maintenance_score: number;
    productivity_index: number;
  };

  // AI Optimization
  @Column({ type: 'json', nullable: true })
  aiOptimization: {
    optimization_algorithm: string;
    last_optimization_date: Date;
    optimization_score: number;
    resource_recommendations: Array<{
      recommendation_type: string;
      description: string;
      expected_savings: number;
      implementation_effort: string;
    }>;
    predictive_maintenance: {
      next_maintenance_date: Date;
      failure_probability: number;
      recommended_actions: string[];
    };
  };

  // Sustainability Metrics
  @Column({ type: 'json', nullable: true })
  sustainabilityMetrics: {
    carbon_footprint: number;
    energy_consumption: number;
    water_usage: number;
    waste_generation: number;
    recyclability_score: number;
    sustainability_rating: string;
  };

  // Quality Requirements
  @Column({ type: 'json', nullable: true })
  qualityRequirements: {
    specifications: Array<{
      parameter: string;
      target_value: number;
      tolerance: number;
      unit: string;
      test_method: string;
    }>;
    certification_requirements: string[];
    inspection_points: Array<{
      point: string;
      frequency: string;
      criteria: string;
    }>;
  };

  // Risk Assessment
  @Column({ type: 'json', nullable: true })
  riskAssessment: {
    supply_risk: number;
    quality_risk: number;
    cost_risk: number;
    schedule_risk: number;
    overall_risk_score: number;
    mitigation_strategies: Array<{
      risk_type: string;
      strategy: string;
      effectiveness: number;
    }>;
  };

  // Allocation History
  @Column({ type: 'json', nullable: true })
  allocationHistory: Array<{
    date: Date;
    action: string;
    quantity: number;
    user_id: string;
    reason: string;
    previous_allocation: number;
    new_allocation: number;
  }>;

  // Integration Data
  @Column({ type: 'json', nullable: true })
  integrationData: {
    erp_reference: string;
    mrp_reference: string;
    wms_reference: string;
    procurement_reference: string;
    last_sync: Date;
    sync_status: string;
  };

  @Column({ type: 'varchar', length: 50 })
  createdBy: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  // Computed Properties
  get allocationPercentage(): number {
    return (this.allocatedQuantity / this.requiredQuantity) * 100;
  }

  get utilizationPercentage(): number {
    if (!this.consumedQuantity) return 0;
    return (this.consumedQuantity / this.allocatedQuantity) * 100;
  }

  get remainingQuantity(): number {
    return this.requiredQuantity - (this.consumedQuantity || 0);
  }

  get isFullyAllocated(): boolean {
    return this.allocatedQuantity >= this.requiredQuantity;
  }

  get isOverallocated(): boolean {
    return this.allocatedQuantity > this.requiredQuantity;
  }

  get costVariance(): number {
    if (!this.actualCost) return 0;
    return ((this.actualCost - this.totalCost) / this.totalCost) * 100;
  }

  get riskLevel(): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const riskScore = this.riskAssessment?.overall_risk_score || 0;
    
    if (riskScore >= 0.8) return 'CRITICAL';
    if (riskScore >= 0.6) return 'HIGH';
    if (riskScore >= 0.3) return 'MEDIUM';
    return 'LOW';
  }

  get isOverdue(): boolean {
    return this.requiredDate < new Date() && this.status !== 'COMPLETED';
  }

  // Business Methods
  allocateResource(quantity: number, userId: string, reason?: string): boolean {
    if (quantity <= 0) return false;

    const newAllocation = this.allocatedQuantity + quantity;
    if (newAllocation > this.requiredQuantity * 1.1) { // Allow 10% overallocation
      return false;
    }

    this.addAllocationHistory('ALLOCATE', quantity, userId, reason || 'Resource allocation');
    this.allocatedQuantity = newAllocation;
    this.updateStatus();
    
    return true;
  }

  releaseResource(quantity: number, userId: string, reason?: string): boolean {
    if (quantity <= 0 || quantity > this.allocatedQuantity) return false;

    this.addAllocationHistory('RELEASE', -quantity, userId, reason || 'Resource release');
    this.allocatedQuantity -= quantity;
    this.updateStatus();
    
    return true;
  }

  consumeResource(quantity: number, userId: string): boolean {
    if (quantity <= 0 || (this.consumedQuantity || 0) + quantity > this.allocatedQuantity) {
      return false;
    }

    this.consumedQuantity = (this.consumedQuantity || 0) + quantity;
    this.addAllocationHistory('CONSUME', quantity, userId, 'Resource consumption');
    this.updateStatus();
    
    return true;
  }

  private updateStatus(): void {
    if (this.allocatedQuantity === 0) {
      this.status = 'PLANNED';
    } else if (this.consumedQuantity && this.consumedQuantity >= this.allocatedQuantity) {
      this.status = 'COMPLETED';
    } else if (this.consumedQuantity && this.consumedQuantity > 0) {
      this.status = 'IN_USE';
    } else {
      this.status = 'ALLOCATED';
    }
  }

  private addAllocationHistory(action: string, quantity: number, userId: string, reason: string): void {
    if (!this.allocationHistory) {
      this.allocationHistory = [];
    }

    this.allocationHistory.push({
      date: new Date(),
      action,
      quantity,
      user_id: userId,
      reason,
      previous_allocation: this.allocatedQuantity,
      new_allocation: this.allocatedQuantity + (action === 'ALLOCATE' ? quantity : -quantity),
    });
  }

  calculateResourceEfficiency(): number {
    const metrics = this.performanceMetrics;
    if (!metrics) return 0;

    return (metrics.utilization_rate * 0.3) +
           (metrics.efficiency_rate * 0.3) +
           (metrics.quality_yield * 0.2) +
           ((100 - metrics.downtime_percentage) * 0.2);
  }

  getAvailableAlternatives(): Array<any> {
    return this.alternatives?.filter(alt => alt.availability === 'AVAILABLE') || [];
  }

  requiresMaintenance(): boolean {
    const predictive = this.aiOptimization?.predictive_maintenance;
    if (!predictive) return false;
    
    return predictive.failure_probability > 0.7 || 
           predictive.next_maintenance_date <= new Date();
  }
}
