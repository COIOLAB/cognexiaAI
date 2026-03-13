// Manufacturing domain types and interfaces

export interface MaintenanceSchedule {
  id: string;
  equipmentId: string;
  taskType: string;
  frequency: string;
  nextDueDate: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedDuration: number;
  assignedTechnician?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleAdjustmentRequest {
  scheduleId: string;
  currentSchedule: MaintenanceSchedule;
  disruptionIndicators: Array<{
    type: string;
    severity: number;
    expectedImpact: string;
  }>;
  proposedAdjustments: Array<{
    field: string;
    currentValue: any;
    proposedValue: any;
  }>;
}

export interface MaintenancePerformanceRequest {
  equipmentIds: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
  metricsToAnalyze: string[];
  trendingParameters: Array<{
    parameter: string;
    threshold: number;
    direction: 'INCREASING' | 'DECREASING' | 'STABLE';
  }>;
  optimizationGoals: Array<{
    goal: string;
    priority: number;
    target: number;
  }>;
}

export interface WorkOrderManagementRequest {
  requestType: 'CREATE' | 'UPDATE' | 'PRIORITIZE' | 'SCHEDULE';
  maintenanceRequests: Array<{
    id?: string;
    equipmentId: string;
    taskType: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    requestedBy: string;
    requestedDate: Date;
  }>;
}

export interface QualityMetrics {
  id: string;
  metricName: string;
  value: number;
  unit: string;
  threshold: {
    min?: number;
    max?: number;
    target?: number;
  };
  status: 'PASS' | 'FAIL' | 'WARNING';
  timestamp: Date;
}

export interface ProductionMetrics {
  throughput: number;
  efficiency: number;
  quality: number;
  oee: number; // Overall Equipment Effectiveness
  cycleTime: number;
  downtime: number;
  yield: number;
}

export interface EquipmentStatus {
  id: string;
  equipmentId: string;
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'DOWN' | 'IDLE';
  currentOperation?: string;
  utilizationRate: number;
  performanceMetrics: ProductionMetrics;
  lastMaintenanceDate: Date;
  nextMaintenanceDate: Date;
  alerts: Array<{
    level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
    message: string;
    timestamp: Date;
  }>;
}

export interface ManufacturingProcessStep {
  id: string;
  stepNumber: number;
  stepName: string;
  description: string;
  estimatedDuration: number;
  requiredSkills: string[];
  qualityChecks: QualityMetrics[];
  dependencies: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'FAILED';
}

export interface PredictiveAnalytics {
  id: string;
  equipmentId: string;
  predictionType: 'FAILURE' | 'MAINTENANCE' | 'PERFORMANCE' | 'QUALITY';
  confidence: number;
  timeframe: {
    start: Date;
    end: Date;
  };
  recommendations: Array<{
    action: string;
    priority: number;
    estimatedCost: number;
    expectedBenefit: string;
  }>;
  dataSource: string;
  modelVersion: string;
  createdAt: Date;
}

export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',
  PREDICTIVE = 'PREDICTIVE',
  CORRECTIVE = 'CORRECTIVE',
  EMERGENCY = 'EMERGENCY',
  ROUTINE = 'ROUTINE'
}

export enum EquipmentType {
  MACHINE = 'MACHINE',
  TOOL = 'TOOL',
  CONVEYOR = 'CONVEYOR',
  ROBOT = 'ROBOT',
  SENSOR = 'SENSOR',
  CONTROL_SYSTEM = 'CONTROL_SYSTEM'
}

export enum ProductionOrderStatus {
  DRAFT = 'DRAFT',
  PLANNED = 'PLANNED',
  RELEASED = 'RELEASED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD'
}

export enum QualityStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  PENDING = 'PENDING',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED'
}

// Utility types for manufacturing operations
export type TimeSpan = {
  start: Date;
  end: Date;
  duration: number; // in milliseconds
};

export type PerformanceThreshold = {
  metric: string;
  minValue?: number;
  maxValue?: number;
  targetValue?: number;
  unit: string;
};

export type MaintenanceWindow = {
  id: string;
  startTime: Date;
  endTime: Date;
  type: MaintenanceType;
  equipmentIds: string[];
  description: string;
  plannedBy: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
};

// Additional types for equipment maintenance
export interface EquipmentHealth {
  id: string;
  equipmentId: string;
  healthScore: number;
  indicators: Array<{
    name: string;
    value: number;
    status: 'GOOD' | 'WARNING' | 'CRITICAL';
    threshold: number;
  }>;
  lastAssessment: Date;
  predictedFailureDate?: Date;
}

export interface PredictiveMaintenance {
  id: string;
  equipmentId: string;
  predictionModel: string;
  predictedIssues: Array<{
    component: string;
    issueType: string;
    probability: number;
    timeToFailure: number;
    recommendedAction: string;
  }>;
  confidence: number;
  createdAt: Date;
}

export interface ConditionMonitoring {
  id: string;
  equipmentId: string;
  sensors: Array<{
    sensorId: string;
    type: string;
    value: number;
    unit: string;
    normalRange: { min: number; max: number };
    status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  }>;
  timestamp: Date;
}

export interface MaintenanceOptimization {
  id: string;
  scheduleId: string;
  optimizationStrategy: 'COST_MINIMIZE' | 'DOWNTIME_MINIMIZE' | 'RESOURCE_OPTIMIZE';
  originalSchedule: MaintenanceSchedule[];
  optimizedSchedule: MaintenanceSchedule[];
  expectedBenefits: {
    costReduction: number;
    downtimeReduction: number;
    resourceUtilization: number;
  };
}

export interface MaintenanceMetrics {
  id: string;
  period: { start: Date; end: Date };
  metrics: {
    mtbf: number; // Mean Time Between Failures
    mttr: number; // Mean Time To Repair
    availability: number;
    reliability: number;
    totalMaintenanceCost: number;
    preventiveMaintenanceRatio: number;
  };
}

export interface AIOptimization {
  id: string;
  type: 'PREDICTIVE_MAINTENANCE' | 'SCHEDULE_OPTIMIZATION' | 'RESOURCE_ALLOCATION';
  algorithm: string;
  parameters: Record<string, any>;
  results: Record<string, any>;
  confidence: number;
  executedAt: Date;
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE'
}
