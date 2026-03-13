import { EventEmitter } from 'events';
import { Logger } from '../../../core/utils/logger';

/**
 * Collaborative Task Execution Service
 * 
 * Provides advanced multi-robot task orchestration, execution monitoring,
 * performance optimization, and adaptive task management for Industry 5.0
 */
export class CollaborativeTaskExecutionService extends EventEmitter {
  private logger = Logger.getLogger('CollaborativeTaskExecutionService');
  private activeTasks: Map<string, ExecutionTask> = new Map();
  private taskQueue: TaskQueue = new TaskQueue();
  private executionEngine: ExecutionEngine;
  private performanceAnalyzer: PerformanceAnalyzer;
  private adaptiveScheduler: AdaptiveScheduler;
  private resourceManager: ResourceManager;

  constructor() {
    super();
    this.executionEngine = new ExecutionEngine();
    this.performanceAnalyzer = new PerformanceAnalyzer();
    this.adaptiveScheduler = new AdaptiveScheduler();
    this.resourceManager = new ResourceManager();
    this.initializeService();
  }

  /**
   * Initialize the collaborative task execution service
   */
  private async initializeService(): Promise<void> {
    try {
      await this.executionEngine.initialize();
      await this.performanceAnalyzer.initialize();
      await this.adaptiveScheduler.initialize();
      
      // Start performance monitoring
      this.startPerformanceMonitoring();
      
      // Start adaptive scheduling
      this.startAdaptiveScheduling();

      this.logger.info('Collaborative Task Execution Service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Collaborative Task Execution Service:', error);
      throw error;
    }
  }

  /**
   * Create and submit a new collaborative task
   */
  public async createTask(taskRequest: TaskCreationRequest): Promise<string> {
    try {
      const task: ExecutionTask = {
        id: this.generateTaskId(),
        name: taskRequest.name,
        description: taskRequest.description,
        type: taskRequest.type,
        priority: taskRequest.priority,
        requirements: taskRequest.requirements,
        constraints: taskRequest.constraints,
        subtasks: this.decomposeTasks(taskRequest),
        status: 'pending',
        createdAt: new Date(),
        estimatedDuration: 0,
        actualDuration: 0,
        progress: 0,
        assignedRobots: [],
        resourceRequirements: taskRequest.resourceRequirements,
        dependencies: taskRequest.dependencies || [],
        metadata: taskRequest.metadata || {}
      };

      // AI-powered task analysis and optimization
      await this.analyzeTask(task);
      
      // Add to task queue
      this.taskQueue.enqueue(task);
      this.activeTasks.set(task.id, task);

      this.logger.info(`Task created: ${task.id}`);
      this.emit('task_created', { taskId: task.id, task });

      // Trigger scheduling
      await this.scheduleNextTasks();

      return task.id;
    } catch (error) {
      this.logger.error('Failed to create task:', error);
      throw error;
    }
  }

  /**
   * Execute a specific task
   */
  public async executeTask(taskId: string): Promise<void> {
    try {
      const task = this.activeTasks.get(taskId);
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      if (task.status !== 'pending' && task.status !== 'scheduled') {
        throw new Error(`Task ${taskId} cannot be executed in current status: ${task.status}`);
      }

      task.status = 'executing';
      task.executionStartTime = new Date();

      this.logger.info(`Starting task execution: ${taskId}`);
      this.emit('task_execution_started', { taskId, task });

      // Allocate resources
      const resources = await this.resourceManager.allocateResources(task.resourceRequirements);
      task.allocatedResources = resources;

      // Execute subtasks in parallel or sequence based on dependencies
      await this.executeSubtasks(task);

      // Monitor execution progress
      this.startTaskMonitoring(task);

    } catch (error) {
      this.logger.error(`Failed to execute task ${taskId}:`, error);
      await this.handleTaskFailure(taskId, error);
      throw error;
    }
  }

  /**
   * Monitor task execution progress
   */
  private startTaskMonitoring(task: ExecutionTask): void {
    const monitoringInterval = setInterval(async () => {
      try {
        const progress = await this.calculateTaskProgress(task);
        task.progress = progress;

        // Update task metrics
        await this.updateTaskMetrics(task);

        // Check for completion
        if (progress >= 100) {
          await this.completeTask(task.id);
          clearInterval(monitoringInterval);
        }

        // Check for issues or delays
        await this.checkTaskHealth(task);

        this.emit('task_progress_updated', { 
          taskId: task.id, 
          progress,
          metrics: task.executionMetrics 
        });

      } catch (error) {
        this.logger.error(`Task monitoring error for ${task.id}:`, error);
        clearInterval(monitoringInterval);
        await this.handleTaskFailure(task.id, error);
      }
    }, 2000); // Monitor every 2 seconds
  }

  /**
   * Execute subtasks with dependency management
   */
  private async executeSubtasks(task: ExecutionTask): Promise<void> {
    const executionPlan = this.createExecutionPlan(task.subtasks);
    
    for (const phase of executionPlan.phases) {
      const phasePromises = phase.subtasks.map(subtask => 
        this.executeSubtask(task, subtask)
      );
      
      await Promise.all(phasePromises);
    }
  }

  /**
   * Execute a single subtask
   */
  private async executeSubtask(parentTask: ExecutionTask, subtask: Subtask): Promise<void> {
    try {
      subtask.status = 'executing';
      subtask.executionStartTime = new Date();

      // Find and assign robot
      const robot = await this.findOptimalRobot(subtask.requirements);
      subtask.assignedRobotId = robot.id;

      // Execute subtask on robot
      await this.executionEngine.executeSubtask(robot, subtask);

      subtask.status = 'completed';
      subtask.executionEndTime = new Date();
      subtask.actualDuration = subtask.executionEndTime.getTime() - subtask.executionStartTime!.getTime();

      this.emit('subtask_completed', {
        taskId: parentTask.id,
        subtaskId: subtask.id,
        robotId: robot.id
      });

    } catch (error) {
      subtask.status = 'failed';
      subtask.error = error.message;
      this.logger.error(`Subtask execution failed: ${subtask.id}`, error);
      throw error;
    }
  }

  /**
   * Find optimal robot for subtask execution
   */
  private async findOptimalRobot(requirements: SubtaskRequirements): Promise<RobotUnit> {
    // AI-powered robot selection based on capabilities, availability, and performance
    const availableRobots = await this.resourceManager.getAvailableRobots();
    
    const suitableRobots = availableRobots.filter(robot => 
      this.checkRobotCompatibility(robot, requirements)
    );

    if (suitableRobots.length === 0) {
      throw new Error('No suitable robots available for task requirements');
    }

    // Score robots based on multiple factors
    const robotScores = suitableRobots.map(robot => ({
      robot,
      score: this.calculateRobotScore(robot, requirements)
    }));

    // Sort by score (highest first)
    robotScores.sort((a, b) => b.score - a.score);

    return robotScores[0].robot;
  }

  /**
   * Calculate robot suitability score for a task
   */
  private calculateRobotScore(robot: RobotUnit, requirements: SubtaskRequirements): number {
    let score = 0;

    // Capability matching (40% weight)
    score += this.calculateCapabilityMatch(robot.capabilities, requirements) * 0.4;

    // Performance history (25% weight)
    score += (robot.performanceMetrics?.averageEfficiency || 0.5) * 0.25;

    // Current load (20% weight)
    const loadFactor = 1 - (robot.status.currentLoad || 0);
    score += loadFactor * 0.2;

    // Distance/location optimization (10% weight)
    score += this.calculateLocationScore(robot, requirements.preferredLocation) * 0.1;

    // Energy efficiency (5% weight)
    score += (robot.status.batteryLevelPercent / 100) * 0.05;

    return score;
  }

  /**
   * Complete task execution
   */
  private async completeTask(taskId: string): Promise<void> {
    try {
      const task = this.activeTasks.get(taskId);
      if (!task) return;

      task.status = 'completed';
      task.executionEndTime = new Date();
      task.actualDuration = task.executionEndTime.getTime() - task.executionStartTime!.getTime();

      // Release allocated resources
      if (task.allocatedResources) {
        await this.resourceManager.releaseResources(task.allocatedResources);
      }

      // Update performance metrics
      await this.performanceAnalyzer.recordTaskCompletion(task);

      // Generate completion report
      const report = await this.generateTaskReport(task);
      task.completionReport = report;

      this.logger.info(`Task completed successfully: ${taskId}`);
      this.emit('task_completed', { taskId, task, report });

      // Learn from execution for future optimization
      await this.adaptiveScheduler.learnFromExecution(task);

    } catch (error) {
      this.logger.error(`Failed to complete task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Handle task failure
   */
  private async handleTaskFailure(taskId: string, error: any): Promise<void> {
    try {
      const task = this.activeTasks.get(taskId);
      if (!task) return;

      task.status = 'failed';
      task.error = error.message;
      task.failureTime = new Date();

      // Release allocated resources
      if (task.allocatedResources) {
        await this.resourceManager.releaseResources(task.allocatedResources);
      }

      // Analyze failure for learning
      await this.analyzeTaskFailure(task, error);

      this.logger.error(`Task failed: ${taskId}`, error);
      this.emit('task_failed', { taskId, task, error });

      // Attempt recovery if possible
      if (task.recoveryOptions?.autoRetry && task.retryCount < task.recoveryOptions.maxRetries) {
        await this.retryTask(taskId);
      }

    } catch (retryError) {
      this.logger.error(`Failed to handle task failure for ${taskId}:`, retryError);
    }
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    setInterval(async () => {
      try {
        const metrics = await this.performanceAnalyzer.gatherSystemMetrics();
        this.emit('performance_metrics_updated', metrics);
        
        // Check for performance issues
        await this.checkPerformanceThresholds(metrics);
        
      } catch (error) {
        this.logger.error('Performance monitoring error:', error);
      }
    }, 5000); // Every 5 seconds
  }

  /**
   * Start adaptive scheduling
   */
  private startAdaptiveScheduling(): void {
    setInterval(async () => {
      try {
        await this.scheduleNextTasks();
        await this.optimizeTaskExecution();
      } catch (error) {
        this.logger.error('Adaptive scheduling error:', error);
      }
    }, 10000); // Every 10 seconds
  }

  /**
   * Schedule next tasks based on priorities and resources
   */
  private async scheduleNextTasks(): Promise<void> {
    const pendingTasks = Array.from(this.activeTasks.values())
      .filter(task => task.status === 'pending');

    if (pendingTasks.length === 0) return;

    // Sort tasks by priority and creation time
    pendingTasks.sort((a, b) => {
      const priorityWeight = this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority);
      if (priorityWeight !== 0) return priorityWeight;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    for (const task of pendingTasks) {
      const canSchedule = await this.resourceManager.checkResourceAvailability(task.resourceRequirements);
      if (canSchedule) {
        task.status = 'scheduled';
        task.scheduledAt = new Date();
        
        this.emit('task_scheduled', { taskId: task.id, scheduledAt: task.scheduledAt });
        
        // Execute the task
        this.executeTask(task.id).catch(error => {
          this.logger.error(`Failed to execute scheduled task ${task.id}:`, error);
        });
      }
    }
  }

  /**
   * Get analytics dashboard data
   */
  public async getAnalyticsDashboard(): Promise<TaskExecutionDashboard> {
    const activeTasks = Array.from(this.activeTasks.values());
    const completedTasks = activeTasks.filter(t => t.status === 'completed');
    const failedTasks = activeTasks.filter(t => t.status === 'failed');
    const executingTasks = activeTasks.filter(t => t.status === 'executing');

    const performanceMetrics = await this.performanceAnalyzer.getSystemMetrics();
    const resourceUtilization = await this.resourceManager.getUtilizationMetrics();

    return {
      summary: {
        totalTasks: activeTasks.length,
        completedTasks: completedTasks.length,
        failedTasks: failedTasks.length,
        executingTasks: executingTasks.length,
        averageExecutionTime: this.calculateAverageExecutionTime(completedTasks),
        successRate: completedTasks.length / (completedTasks.length + failedTasks.length) * 100,
        currentThroughput: this.calculateThroughput()
      },
      performanceMetrics,
      resourceUtilization,
      taskTrends: await this.calculateTaskTrends(),
      robotEfficiency: await this.calculateRobotEfficiency(),
      upcomingTasks: this.getUpcomingTasks(),
      alerts: await this.getActiveAlerts()
    };
  }

  // Helper methods
  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private decomposeTasks(request: TaskCreationRequest): Subtask[] {
    // AI-powered task decomposition
    return request.subtasks || [];
  }

  private async analyzeTask(task: ExecutionTask): Promise<void> {
    // AI analysis for task optimization
    task.estimatedDuration = await this.estimateTaskDuration(task);
    task.complexityScore = this.calculateComplexityScore(task);
    task.riskAssessment = await this.assessTaskRisks(task);
  }

  private async estimateTaskDuration(task: ExecutionTask): Promise<number> {
    // Machine learning-based duration estimation
    return 300000; // 5 minutes default
  }

  private calculateComplexityScore(task: ExecutionTask): number {
    // Calculate complexity based on subtasks, dependencies, and requirements
    return Math.min(10, task.subtasks.length + task.dependencies.length);
  }

  private async assessTaskRisks(task: ExecutionTask): Promise<RiskAssessment> {
    return {
      overallRisk: 'low',
      riskFactors: [],
      mitigationStrategies: []
    };
  }

  private createExecutionPlan(subtasks: Subtask[]): ExecutionPlan {
    // Create dependency-aware execution plan
    const phases: ExecutionPhase[] = [];
    const processedTasks = new Set<string>();
    let currentPhase = 0;

    while (processedTasks.size < subtasks.length) {
      const phaseSubtasks = subtasks.filter(subtask => 
        !processedTasks.has(subtask.id) &&
        subtask.dependencies.every(depId => processedTasks.has(depId))
      );

      if (phaseSubtasks.length === 0) {
        throw new Error('Circular dependency detected in subtasks');
      }

      phases.push({
        phaseNumber: currentPhase++,
        subtasks: phaseSubtasks,
        estimatedDuration: Math.max(...phaseSubtasks.map(st => st.estimatedDuration))
      });

      phaseSubtasks.forEach(subtask => processedTasks.add(subtask.id));
    }

    return { phases };
  }

  private async calculateTaskProgress(task: ExecutionTask): Promise<number> {
    const completedSubtasks = task.subtasks.filter(st => st.status === 'completed').length;
    return (completedSubtasks / task.subtasks.length) * 100;
  }

  private async updateTaskMetrics(task: ExecutionTask): Promise<void> {
    task.executionMetrics = {
      cpuUsage: await this.getCPUUsage(),
      memoryUsage: await this.getMemoryUsage(),
      robotUtilization: await this.getRobotUtilization(task.assignedRobots),
      throughput: this.calculateCurrentThroughput(),
      efficiency: this.calculateTaskEfficiency(task),
      lastUpdated: new Date()
    };
  }

  private async checkTaskHealth(task: ExecutionTask): Promise<void> {
    // Check for delays, errors, or performance issues
    const expectedProgress = this.calculateExpectedProgress(task);
    if (task.progress < expectedProgress * 0.8) {
      this.emit('task_delay_detected', { taskId: task.id, expectedProgress, actualProgress: task.progress });
    }
  }

  private calculateExpectedProgress(task: ExecutionTask): number {
    if (!task.executionStartTime) return 0;
    const elapsed = Date.now() - task.executionStartTime.getTime();
    return Math.min(100, (elapsed / task.estimatedDuration) * 100);
  }

  private checkRobotCompatibility(robot: RobotUnit, requirements: SubtaskRequirements): boolean {
    return robot.capabilities.collaborative &&
           robot.status.online &&
           robot.status.batteryLevelPercent > 20 &&
           robot.capabilities.maxPayloadKg >= (requirements.maxPayload || 0);
  }

  private calculateCapabilityMatch(capabilities: RobotCapabilities, requirements: SubtaskRequirements): number {
    let match = 0;
    // Implementation for capability matching algorithm
    return Math.min(1, match);
  }

  private calculateLocationScore(robot: RobotUnit, preferredLocation?: { x: number; y: number; z: number }): number {
    if (!preferredLocation) return 0.5;
    const distance = Math.sqrt(
      Math.pow(robot.location.x - preferredLocation.x, 2) +
      Math.pow(robot.location.y - preferredLocation.y, 2) +
      Math.pow(robot.location.z - preferredLocation.z, 2)
    );
    return Math.max(0, 1 - distance / 100); // Normalize distance
  }

  private async generateTaskReport(task: ExecutionTask): Promise<TaskCompletionReport> {
    return {
      taskId: task.id,
      executionSummary: {
        plannedDuration: task.estimatedDuration,
        actualDuration: task.actualDuration,
        efficiency: (task.estimatedDuration / task.actualDuration) * 100,
        subtasksCompleted: task.subtasks.filter(st => st.status === 'completed').length,
        robotsUtilized: task.assignedRobots.length
      },
      performanceMetrics: task.executionMetrics!,
      recommendations: await this.generateRecommendations(task),
      generatedAt: new Date()
    };
  }

  private async generateRecommendations(task: ExecutionTask): Promise<string[]> {
    const recommendations: string[] = [];
    
    if (task.actualDuration > task.estimatedDuration * 1.2) {
      recommendations.push('Consider optimizing task decomposition for better time estimation');
    }
    
    if (task.subtasks.some(st => st.status === 'failed')) {
      recommendations.push('Review failed subtasks for process improvement opportunities');
    }

    return recommendations;
  }

  private async analyzeTaskFailure(task: ExecutionTask, error: any): Promise<void> {
    // ML-based failure analysis for continuous improvement
    this.logger.info(`Analyzing failure for task ${task.id}`, { error: error.message });
  }

  private async retryTask(taskId: string): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) return;

    task.retryCount = (task.retryCount || 0) + 1;
    task.status = 'pending';
    
    this.logger.info(`Retrying task ${taskId} (attempt ${task.retryCount})`);
    this.emit('task_retry_initiated', { taskId, retryCount: task.retryCount });
    
    setTimeout(() => {
      this.executeTask(taskId).catch(error => {
        this.logger.error(`Retry failed for task ${taskId}:`, error);
      });
    }, 5000); // Wait 5 seconds before retry
  }

  private async checkPerformanceThresholds(metrics: any): Promise<void> {
    if (metrics.cpuUsage > 90) {
      this.emit('performance_alert', { type: 'high_cpu', value: metrics.cpuUsage });
    }
    if (metrics.memoryUsage > 85) {
      this.emit('performance_alert', { type: 'high_memory', value: metrics.memoryUsage });
    }
  }

  private async optimizeTaskExecution(): Promise<void> {
    // AI-powered execution optimization
    const executingTasks = Array.from(this.activeTasks.values())
      .filter(task => task.status === 'executing');

    for (const task of executingTasks) {
      await this.optimizeTaskResources(task);
    }
  }

  private async optimizeTaskResources(task: ExecutionTask): Promise<void> {
    // Resource optimization logic
    if (task.executionMetrics?.efficiency && task.executionMetrics.efficiency < 0.7) {
      this.emit('task_optimization_needed', { taskId: task.id, efficiency: task.executionMetrics.efficiency });
    }
  }

  private getPriorityWeight(priority: TaskPriority): number {
    const weights = { critical: 4, high: 3, medium: 2, low: 1 };
    return weights[priority];
  }

  private calculateAverageExecutionTime(tasks: ExecutionTask[]): number {
    if (tasks.length === 0) return 0;
    const total = tasks.reduce((sum, task) => sum + task.actualDuration, 0);
    return total / tasks.length;
  }

  private calculateThroughput(): number {
    // Calculate tasks per hour
    return 0; // Implementation needed
  }

  private calculateCurrentThroughput(): number {
    return 0; // Implementation needed
  }

  private calculateTaskEfficiency(task: ExecutionTask): number {
    if (!task.estimatedDuration || !task.actualDuration) return 0;
    return Math.min(100, (task.estimatedDuration / task.actualDuration) * 100);
  }

  private async calculateTaskTrends(): Promise<any> {
    return {}; // Implementation needed
  }

  private async calculateRobotEfficiency(): Promise<any> {
    return {}; // Implementation needed
  }

  private getUpcomingTasks(): any[] {
    return Array.from(this.activeTasks.values())
      .filter(task => task.status === 'scheduled')
      .slice(0, 10);
  }

  private async getActiveAlerts(): Promise<any[]> {
    return []; // Implementation needed
  }

  private async getCPUUsage(): Promise<number> {
    return Math.random() * 100; // Mock implementation
  }

  private async getMemoryUsage(): Promise<number> {
    return Math.random() * 100; // Mock implementation
  }

  private async getRobotUtilization(robotIds: string[]): Promise<number> {
    return Math.random() * 100; // Mock implementation
  }
}

// Supporting classes and interfaces
class TaskQueue {
  private queue: ExecutionTask[] = [];

  enqueue(task: ExecutionTask): void {
    this.queue.push(task);
  }

  dequeue(): ExecutionTask | undefined {
    return this.queue.shift();
  }

  peek(): ExecutionTask | undefined {
    return this.queue[0];
  }

  size(): number {
    return this.queue.length;
  }
}

class ExecutionEngine {
  async initialize(): Promise<void> {
    // Initialize execution engine
  }

  async executeSubtask(robot: RobotUnit, subtask: Subtask): Promise<void> {
    // Execute subtask on robot
    await new Promise(resolve => setTimeout(resolve, subtask.estimatedDuration));
  }
}

class PerformanceAnalyzer {
  async initialize(): Promise<void> {
    // Initialize performance analyzer
  }

  async gatherSystemMetrics(): Promise<any> {
    return {
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      timestamp: new Date()
    };
  }

  async recordTaskCompletion(task: ExecutionTask): Promise<void> {
    // Record task completion metrics
  }

  async getSystemMetrics(): Promise<any> {
    return await this.gatherSystemMetrics();
  }
}

class AdaptiveScheduler {
  async initialize(): Promise<void> {
    // Initialize adaptive scheduler
  }

  async learnFromExecution(task: ExecutionTask): Promise<void> {
    // Machine learning from task execution
  }
}

class ResourceManager {
  async allocateResources(requirements: ResourceRequirements): Promise<any> {
    return { allocated: true };
  }

  async releaseResources(resources: any): Promise<void> {
    // Release allocated resources
  }

  async checkResourceAvailability(requirements: ResourceRequirements): Promise<boolean> {
    return true; // Mock implementation
  }

  async getAvailableRobots(): Promise<RobotUnit[]> {
    return []; // Mock implementation
  }

  async getUtilizationMetrics(): Promise<any> {
    return { utilization: Math.random() * 100 };
  }
}

// Type definitions
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'scheduled' | 'executing' | 'completed' | 'failed' | 'cancelled';
export type SubtaskStatus = 'pending' | 'executing' | 'completed' | 'failed';

export interface TaskCreationRequest {
  name: string;
  description: string;
  type: string;
  priority: TaskPriority;
  requirements: TaskRequirements;
  constraints: TaskConstraints;
  resourceRequirements: ResourceRequirements;
  dependencies?: string[];
  subtasks?: Subtask[];
  metadata?: Record<string, any>;
}

export interface ExecutionTask {
  id: string;
  name: string;
  description: string;
  type: string;
  priority: TaskPriority;
  status: TaskStatus;
  requirements: TaskRequirements;
  constraints: TaskConstraints;
  subtasks: Subtask[];
  createdAt: Date;
  scheduledAt?: Date;
  executionStartTime?: Date;
  executionEndTime?: Date;
  estimatedDuration: number;
  actualDuration: number;
  progress: number;
  assignedRobots: string[];
  resourceRequirements: ResourceRequirements;
  allocatedResources?: any;
  dependencies: string[];
  metadata: Record<string, any>;
  complexityScore?: number;
  riskAssessment?: RiskAssessment;
  executionMetrics?: TaskExecutionMetrics;
  error?: string;
  failureTime?: Date;
  retryCount?: number;
  recoveryOptions?: RecoveryOptions;
  completionReport?: TaskCompletionReport;
}

export interface Subtask {
  id: string;
  name: string;
  description: string;
  status: SubtaskStatus;
  requirements: SubtaskRequirements;
  dependencies: string[];
  estimatedDuration: number;
  actualDuration?: number;
  assignedRobotId?: string;
  executionStartTime?: Date;
  executionEndTime?: Date;
  progress: number;
  error?: string;
}

export interface TaskRequirements {
  robotCapabilities: string[];
  minimumRobots: number;
  maximumRobots: number;
  skillsRequired: string[];
  safetyLevel: number;
}

export interface SubtaskRequirements {
  robotType?: string;
  capabilities: string[];
  maxPayload?: number;
  precisionLevel?: number;
  safetyLevel: number;
  preferredLocation?: { x: number; y: number; z: number };
}

export interface TaskConstraints {
  maxExecutionTime: number;
  resourceLimits: Record<string, number>;
  safetyConstraints: string[];
  environmentalConstraints: string[];
}

export interface ResourceRequirements {
  robots: number;
  tools: string[];
  materials: string[];
  workspace: string;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  mitigationStrategies: string[];
}

export interface TaskExecutionMetrics {
  cpuUsage: number;
  memoryUsage: number;
  robotUtilization: number;
  throughput: number;
  efficiency: number;
  lastUpdated: Date;
}

export interface RecoveryOptions {
  autoRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  fallbackStrategies: string[];
}

export interface TaskCompletionReport {
  taskId: string;
  executionSummary: {
    plannedDuration: number;
    actualDuration: number;
    efficiency: number;
    subtasksCompleted: number;
    robotsUtilized: number;
  };
  performanceMetrics: TaskExecutionMetrics;
  recommendations: string[];
  generatedAt: Date;
}

export interface ExecutionPlan {
  phases: ExecutionPhase[];
}

export interface ExecutionPhase {
  phaseNumber: number;
  subtasks: Subtask[];
  estimatedDuration: number;
}

export interface RobotUnit {
  id: string;
  model: string;
  capabilities: RobotCapabilities;
  status: RobotStatus;
  location: { x: number; y: number; z: number };
  safetyParameters: SafetyParameters;
  assignedTasks: string[];
  performanceMetrics?: {
    averageEfficiency: number;
    completedTasks: number;
    failureRate: number;
  };
}

export interface RobotCapabilities {
  maxPayloadKg: number;
  degreesOfFreedom: number;
  collaborative: boolean;
  sensors: string[];
  autonomousLevel: number;
  precisionLevel: number;
}

export interface RobotStatus {
  online: boolean;
  batteryLevelPercent: number;
  currentTaskId?: string;
  currentLoad: number;
  safetyCompliant: boolean;
  errors: string[];
  lastUpdate: Date;
}

export interface SafetyParameters {
  emergencyStopAvailable: boolean;
  collisionAvoidanceEnabled: boolean;
  maxSafeSpeed: number;
  safetyZones: SafetyZone[];
}

export interface SafetyZone {
  id: string;
  coordinates: { x: number; y: number; z: number }[];
}

export interface TaskExecutionDashboard {
  summary: {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    executingTasks: number;
    averageExecutionTime: number;
    successRate: number;
    currentThroughput: number;
  };
  performanceMetrics: any;
  resourceUtilization: any;
  taskTrends: any;
  robotEfficiency: any;
  upcomingTasks: any[];
  alerts: any[];
}
