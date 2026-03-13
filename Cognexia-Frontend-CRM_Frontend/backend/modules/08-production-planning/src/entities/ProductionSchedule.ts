/**
 * Production Schedule Entity
 * 
 * Represents detailed production scheduling with advanced sequencing,
 * resource allocation, and Industry 5.0 AI-powered optimization.
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

export type ScheduleStatus = 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'EXECUTING' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
export type ScheduleType = 'MASTER' | 'DETAILED' | 'CAPACITY' | 'SEQUENCE' | 'EMERGENCY';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EMERGENCY';
export type OptimizationGoal = 'MINIMIZE_COST' | 'MINIMIZE_TIME' | 'MAXIMIZE_THROUGHPUT' | 'MINIMIZE_INVENTORY' | 'BALANCED';

@Entity('production_schedules')
@Index(['companyId', 'schedulePeriodStart', 'schedulePeriodEnd'])
@Index(['status', 'priority'])
@Index(['productionPlanId'])
@Index(['createdAt'])
export class ProductionSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  companyId: string;

  @Column({ type: 'varchar', length: 50 })
  productionPlanId: string;

  @Column({ type: 'varchar', length: 255 })
  scheduleName: string;

  @Column({ type: 'enum', enum: ['MASTER', 'DETAILED', 'CAPACITY', 'SEQUENCE', 'EMERGENCY'] })
  scheduleType: ScheduleType;

  @Column({ type: 'date' })
  schedulePeriodStart: Date;

  @Column({ type: 'date' })
  schedulePeriodEnd: Date;

  @Column({ type: 'enum', enum: ['DRAFT', 'APPROVED', 'ACTIVE', 'EXECUTING', 'COMPLETED', 'CANCELLED', 'ON_HOLD'] })
  status: ScheduleStatus;

  @Column({ type: 'enum', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'EMERGENCY'] })
  priority: PriorityLevel;

  @Column({ type: 'enum', enum: ['MINIMIZE_COST', 'MINIMIZE_TIME', 'MAXIMIZE_THROUGHPUT', 'MINIMIZE_INVENTORY', 'BALANCED'] })
  optimizationGoal: OptimizationGoal;

  // Schedule Configuration
  @Column({ type: 'json', nullable: true })
  scheduleConfiguration: {
    planning_horizon_days: number;
    bucket_size_hours: number;
    freeze_period_days: number;
    scheduling_algorithm: string;
    constraint_handling: 'STRICT' | 'FLEXIBLE' | 'ADAPTIVE';
    optimization_weight: {
      time: number;
      cost: number;
      quality: number;
      flexibility: number;
    };
  };

  // Production Orders and Jobs
  @Column({ type: 'json', nullable: true })
  productionJobs: Array<{
    job_id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit: string;
    priority: PriorityLevel;
    due_date: Date;
    estimated_duration: number;
    setup_time: number;
    processing_time: number;
    resource_requirements: Array<{
      resource_id: string;
      resource_type: string;
      quantity: number;
      duration: number;
    }>;
  }>;

  // Resource Assignments
  @Column({ type: 'json', nullable: true })
  resourceAssignments: Array<{
    assignment_id: string;
    resource_id: string;
    resource_name: string;
    resource_type: string;
    assigned_jobs: string[];
    capacity_utilization: number;
    available_hours: number;
    assigned_hours: number;
    efficiency_factor: number;
    shift_assignments: Array<{
      shift_id: string;
      start_time: Date;
      end_time: Date;
      capacity: number;
    }>;
  }>;

  // Sequence and Dependencies
  @Column({ type: 'json', nullable: true })
  productionSequence: Array<{
    sequence_number: number;
    job_id: string;
    operation_id: string;
    operation_name: string;
    scheduled_start: Date;
    scheduled_end: Date;
    actual_start?: Date;
    actual_end?: Date;
    status: string;
    dependencies: string[];
    critical_path: boolean;
    float_time: number;
  }>;

  // Constraints and Rules
  @Column({ type: 'json', nullable: true })
  constraints: {
    resource_constraints: Array<{
      resource_id: string;
      constraint_type: string;
      constraint_value: number;
      enforcement_level: 'HARD' | 'SOFT';
    }>;
    temporal_constraints: Array<{
      constraint_type: 'BEFORE' | 'AFTER' | 'SAME_TIME' | 'NOT_SAME_TIME';
      job_a: string;
      job_b: string;
      time_offset?: number;
    }>;
    business_rules: Array<{
      rule_id: string;
      rule_description: string;
      rule_type: string;
      affected_jobs: string[];
      priority: number;
    }>;
  };

  // Performance Metrics
  @Column({ type: 'json', nullable: true })
  performanceMetrics: {
    schedule_efficiency: number;
    resource_utilization: number;
    on_time_delivery: number;
    total_makespan: number;
    setup_time_percentage: number;
    idle_time_percentage: number;
    throughput: number;
    cycle_time_variance: number;
    cost_efficiency: number;
  };

  // AI Optimization Results
  @Column({ type: 'json', nullable: true })
  aiOptimizationResults: {
    algorithm_used: string;
    optimization_score: number;
    iteration_count: number;
    optimization_time_ms: number;
    improvements: Array<{
      metric: string;
      before_value: number;
      after_value: number;
      improvement_percentage: number;
    }>;
    recommendations: Array<{
      type: string;
      description: string;
      expected_benefit: number;
      implementation_effort: string;
    }>;
  };

  // Scheduling Analytics
  @Column({ type: 'json', nullable: true })
  schedulingAnalytics: {
    bottleneck_analysis: Array<{
      resource_id: string;
      utilization: number;
      impact_score: number;
      recommended_action: string;
    }>;
    critical_path_analysis: {
      total_duration: number;
      critical_jobs: string[];
      slack_analysis: Array<{
        job_id: string;
        total_float: number;
        free_float: number;
      }>;
    };
    what_if_scenarios: Array<{
      scenario_name: string;
      scenario_description: string;
      results: {
        makespan: number;
        cost: number;
        utilization: number;
      };
    }>;
  };

  // Risk Assessment
  @Column({ type: 'json', nullable: true })
  riskAssessment: {
    schedule_risks: Array<{
      risk_type: string;
      probability: number;
      impact: number;
      affected_jobs: string[];
      mitigation_plan: string;
    }>;
    resource_risks: Array<{
      resource_id: string;
      risk_description: string;
      probability: number;
      contingency_plan: string;
    }>;
    overall_risk_score: number;
    confidence_level: number;
  };

  // Execution Tracking
  @Column({ type: 'json', nullable: true })
  executionTracking: {
    started_jobs: string[];
    completed_jobs: string[];
    delayed_jobs: Array<{
      job_id: string;
      planned_start: Date;
      actual_start: Date;
      delay_reason: string;
      impact_assessment: string;
    }>;
    real_time_updates: Array<{
      timestamp: Date;
      job_id: string;
      status_update: string;
      progress_percentage: number;
      estimated_completion: Date;
    }>;
  };

  // Change Management
  @Column({ type: 'json', nullable: true })
  changeHistory: Array<{
    change_id: string;
    change_date: Date;
    change_type: string;
    changed_by: string;
    change_description: string;
    affected_jobs: string[];
    impact_analysis: {
      time_impact: number;
      cost_impact: number;
      resource_impact: string;
    };
    approval_status: string;
  }>;

  // Integration Data
  @Column({ type: 'json', nullable: true })
  integrationData: {
    erp_schedule_id: string;
    mes_schedule_id: string;
    wms_schedule_id: string;
    last_sync: Date;
    sync_status: string;
    external_constraints: Array<{
      source_system: string;
      constraint_data: any;
    }>;
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
  get totalJobs(): number {
    return this.productionJobs?.length || 0;
  }

  get completedJobs(): number {
    return this.executionTracking?.completed_jobs?.length || 0;
  }

  get scheduleProgress(): number {
    return this.totalJobs > 0 ? (this.completedJobs / this.totalJobs) * 100 : 0;
  }

  get isOnSchedule(): boolean {
    const now = new Date();
    const totalDuration = this.schedulePeriodEnd.getTime() - this.schedulePeriodStart.getTime();
    const elapsed = now.getTime() - this.schedulePeriodStart.getTime();
    const expectedProgress = (elapsed / totalDuration) * 100;
    
    return this.scheduleProgress >= (expectedProgress * 0.9); // 10% tolerance
  }

  get averageResourceUtilization(): number {
    if (!this.resourceAssignments?.length) return 0;
    
    const totalUtilization = this.resourceAssignments.reduce(
      (sum, assignment) => sum + assignment.capacity_utilization, 0
    );
    
    return totalUtilization / this.resourceAssignments.length;
  }

  get criticalPathDuration(): number {
    return this.schedulingAnalytics?.critical_path_analysis?.total_duration || 0;
  }

  get scheduleEfficiency(): number {
    return this.performanceMetrics?.schedule_efficiency || 0;
  }

  get riskLevel(): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const riskScore = this.riskAssessment?.overall_risk_score || 0;
    
    if (riskScore >= 0.8) return 'CRITICAL';
    if (riskScore >= 0.6) return 'HIGH';
    if (riskScore >= 0.3) return 'MEDIUM';
    return 'LOW';
  }

  // Business Methods
  addProductionJob(job: any): boolean {
    if (!this.productionJobs) {
      this.productionJobs = [];
    }

    // Validate job data
    if (!job.job_id || !job.product_id || !job.quantity || !job.due_date) {
      return false;
    }

    // Check for duplicate job IDs
    const existingJob = this.productionJobs.find(j => j.job_id === job.job_id);
    if (existingJob) {
      return false;
    }

    this.productionJobs.push(job);
    return true;
  }

  removeProductionJob(jobId: string): boolean {
    if (!this.productionJobs) return false;

    const initialLength = this.productionJobs.length;
    this.productionJobs = this.productionJobs.filter(job => job.job_id !== jobId);
    
    return this.productionJobs.length < initialLength;
  }

  updateJobStatus(jobId: string, status: string, progress?: number): boolean {
    const job = this.productionJobs?.find(j => j.job_id === jobId);
    if (!job) return false;

    // Update execution tracking
    if (!this.executionTracking) {
      this.executionTracking = {
        started_jobs: [],
        completed_jobs: [],
        delayed_jobs: [],
        real_time_updates: [],
      };
    }

    // Add real-time update
    this.executionTracking.real_time_updates.push({
      timestamp: new Date(),
      job_id: jobId,
      status_update: status,
      progress_percentage: progress || 0,
      estimated_completion: new Date(), // Would calculate based on progress
    });

    // Update status-specific tracking
    if (status === 'STARTED' && !this.executionTracking.started_jobs.includes(jobId)) {
      this.executionTracking.started_jobs.push(jobId);
    } else if (status === 'COMPLETED' && !this.executionTracking.completed_jobs.includes(jobId)) {
      this.executionTracking.completed_jobs.push(jobId);
    }

    return true;
  }

  assignResourceToJob(resourceId: string, jobId: string, duration: number): boolean {
    if (!this.resourceAssignments) {
      this.resourceAssignments = [];
    }

    let assignment = this.resourceAssignments.find(a => a.resource_id === resourceId);
    
    if (!assignment) {
      assignment = {
        assignment_id: `${resourceId}_${Date.now()}`,
        resource_id: resourceId,
        resource_name: `Resource-${resourceId}`,
        resource_type: 'MACHINE', // Default type
        assigned_jobs: [],
        capacity_utilization: 0,
        available_hours: 24 * 7, // Default weekly hours
        assigned_hours: 0,
        efficiency_factor: 1.0,
        shift_assignments: [],
      };
      this.resourceAssignments.push(assignment);
    }

    if (!assignment.assigned_jobs.includes(jobId)) {
      assignment.assigned_jobs.push(jobId);
      assignment.assigned_hours += duration;
      assignment.capacity_utilization = (assignment.assigned_hours / assignment.available_hours) * 100;
    }

    return true;
  }

  calculateScheduleMetrics(): void {
    if (!this.productionJobs || !this.resourceAssignments) return;

    const totalJobs = this.productionJobs.length;
    const completedJobs = this.executionTracking?.completed_jobs?.length || 0;
    const totalResourceHours = this.resourceAssignments.reduce((sum, r) => sum + r.assigned_hours, 0);
    const totalAvailableHours = this.resourceAssignments.reduce((sum, r) => sum + r.available_hours, 0);

    this.performanceMetrics = {
      schedule_efficiency: totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0,
      resource_utilization: totalAvailableHours > 0 ? (totalResourceHours / totalAvailableHours) * 100 : 0,
      on_time_delivery: this.calculateOnTimeDelivery(),
      total_makespan: this.calculateMakespan(),
      setup_time_percentage: this.calculateSetupTimePercentage(),
      idle_time_percentage: this.calculateIdleTimePercentage(),
      throughput: this.calculateThroughput(),
      cycle_time_variance: this.calculateCycleTimeVariance(),
      cost_efficiency: this.calculateCostEfficiency(),
    };
  }

  optimizeSchedule(): void {
    // Placeholder for AI optimization logic
    this.aiOptimizationResults = {
      algorithm_used: 'GENETIC_ALGORITHM',
      optimization_score: 85 + Math.random() * 10,
      iteration_count: 100,
      optimization_time_ms: 5000,
      improvements: [
        {
          metric: 'makespan',
          before_value: 100,
          after_value: 85,
          improvement_percentage: 15,
        },
        {
          metric: 'resource_utilization',
          before_value: 70,
          after_value: 85,
          improvement_percentage: 21.4,
        },
      ],
      recommendations: [
        {
          type: 'RESOURCE_REALLOCATION',
          description: 'Reallocate Resource-A from Job-1 to Job-3 for better utilization',
          expected_benefit: 12.5,
          implementation_effort: 'LOW',
        },
      ],
    };
  }

  // Private helper methods
  private calculateOnTimeDelivery(): number {
    if (!this.productionJobs) return 0;

    const completedOnTime = this.productionJobs.filter(job => {
      const completionTime = this.executionTracking?.real_time_updates
        ?.find(update => update.job_id === job.job_id && update.status_update === 'COMPLETED')
        ?.timestamp;
      
      return completionTime && completionTime <= job.due_date;
    }).length;

    return this.productionJobs.length > 0 ? (completedOnTime / this.productionJobs.length) * 100 : 0;
  }

  private calculateMakespan(): number {
    if (!this.productionSequence) return 0;
    
    const endTimes = this.productionSequence.map(seq => 
      seq.actual_end || seq.scheduled_end
    ).map(date => date.getTime());
    
    const startTimes = this.productionSequence.map(seq => 
      seq.actual_start || seq.scheduled_start
    ).map(date => date.getTime());

    return endTimes.length > 0 && startTimes.length > 0 
      ? (Math.max(...endTimes) - Math.min(...startTimes)) / (1000 * 60 * 60) // Convert to hours
      : 0;
  }

  private calculateSetupTimePercentage(): number {
    if (!this.productionJobs) return 0;
    
    const totalSetupTime = this.productionJobs.reduce((sum, job) => sum + (job.setup_time || 0), 0);
    const totalProcessingTime = this.productionJobs.reduce((sum, job) => sum + (job.processing_time || 0), 0);
    const totalTime = totalSetupTime + totalProcessingTime;
    
    return totalTime > 0 ? (totalSetupTime / totalTime) * 100 : 0;
  }

  private calculateIdleTimePercentage(): number {
    if (!this.resourceAssignments) return 0;
    
    const totalIdle = this.resourceAssignments.reduce((sum, resource) => 
      sum + (resource.available_hours - resource.assigned_hours), 0
    );
    const totalAvailable = this.resourceAssignments.reduce((sum, resource) => 
      sum + resource.available_hours, 0
    );
    
    return totalAvailable > 0 ? (totalIdle / totalAvailable) * 100 : 0;
  }

  private calculateThroughput(): number {
    if (!this.productionJobs || !this.executionTracking) return 0;
    
    const completedJobs = this.executionTracking.completed_jobs.length;
    const scheduleHours = this.calculateMakespan();
    
    return scheduleHours > 0 ? completedJobs / scheduleHours : 0;
  }

  private calculateCycleTimeVariance(): number {
    // Simplified calculation - in reality would analyze actual vs planned cycle times
    return Math.random() * 20; // Placeholder
  }

  private calculateCostEfficiency(): number {
    // Simplified calculation - would factor in actual costs vs planned costs
    return 80 + Math.random() * 15; // Placeholder
  }
}
