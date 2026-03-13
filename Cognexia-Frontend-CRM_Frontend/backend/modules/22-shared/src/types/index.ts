// ===========================================
// CORE MAINTENANCE TYPES AND INTERFACES
// Industry 5.0 ERP Backend System
// ===========================================

export * from './core-types';
export * from './ai-types';
export * from './iot-types';
export * from './blockchain-types';
export * from './quantum-types';
export * from './robotics-types';
export * from './environmental-types';
export * from './request-response-types';
export * from './core-data-types';
export * from './service-request-types';

// Core maintenance enums
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

export enum MaintenanceLevel {
  ROUTINE = 'routine',
  PREVENTIVE = 'preventive',
  PREDICTIVE = 'predictive',
  CORRECTIVE = 'corrective',
  EMERGENCY = 'emergency',
  OVERHAUL = 'overhaul'
}

export enum FailureSeverity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  MAJOR = 'major',
  CRITICAL = 'critical',
  CATASTROPHIC = 'catastrophic'
}

export enum MaintenanceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed',
  FAILED = 'failed'
}

// Core maintenance interfaces
export interface MaintenanceStrategy {
  id: string;
  name: string;
  description: string;
  type: MaintenanceLevel;
  priority: Priority;
  frequency: number; // in days
  estimatedDuration: number; // in hours
  requiredResources: string[];
  costEstimate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EquipmentAnalysis {
  equipmentId: string;
  analysisId: string;
  analysisType: string;
  healthScore: number;
  performanceMetrics: Record<string, number>;
  anomalies: Anomaly[];
  predictedFailures: PredictedFailure[];
  recommendedActions: RecommendedAction[];
  analysisTimestamp: Date;
}

export interface MaintenanceMetrics {
  id: string;
  equipmentId: string;
  mttr: number; // Mean Time To Repair
  mtbf: number; // Mean Time Between Failures
  availability: number;
  reliability: number;
  overallEffectiveness: number;
  costPerHour: number;
  energyConsumption: number;
  performanceIndex: number;
  timestamp: Date;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  equipmentId: string;
  maintenanceType: MaintenanceLevel;
  priority: Priority;
  status: MaintenanceStatus;
  assignedTo: string[];
  scheduledDate: Date;
  completionDate?: Date;
  estimatedDuration: number;
  actualDuration?: number;
  estimatedCost: number;
  actualCost?: number;
  requiredParts: RequiredPart[];
  requiredTools: RequiredTool[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceCompliance {
  complianceId: string;
  regulatoryFramework: string;
  complianceLevel: number;
  requirements: ComplianceRequirement[];
  auditTrail: AuditTrailEntry[];
  certifications: Certification[];
  lastAuditDate: Date;
  nextAuditDate: Date;
  complianceScore: number;
  riskLevel: string;
}

export interface MaintenanceOptimization {
  optimizationId: string;
  optimizationType: string;
  targetMetrics: string[];
  constraints: OptimizationConstraint[];
  objectives: OptimizationObjective[];
  solution: OptimizationSolution;
  implementationPlan: ImplementationStep[];
  expectedBenefits: ExpectedBenefit[];
  riskAssessment: RiskAssessment;
}

export interface AIMaintenanceInsights {
  insightId: string;
  insightType: string;
  confidence: number;
  description: string;
  impact: string;
  actionable: boolean;
  recommendedActions: string[];
  dataSource: string[];
  timestamp: Date;
  validUntil: Date;
}

// Supporting interfaces
export interface Anomaly {
  id: string;
  type: string;
  severity: FailureSeverity;
  description: string;
  detectedAt: Date;
  confidence: number;
  parameters: Record<string, any>;
}

export interface PredictedFailure {
  id: string;
  failureType: string;
  probability: number;
  timeToFailure: number; // in hours
  impactLevel: FailureSeverity;
  preventionCost: number;
  failureCost: number;
  confidence: number;
}

export interface RecommendedAction {
  id: string;
  action: string;
  priority: Priority;
  estimatedCost: number;
  estimatedTime: number;
  expectedBenefit: string;
  riskLevel: string;
}

export interface RequiredPart {
  partId: string;
  partName: string;
  quantity: number;
  unitCost: number;
  availability: boolean;
  supplier: string;
  leadTime: number;
}

export interface RequiredTool {
  toolId: string;
  toolName: string;
  isAvailable: boolean;
  location: string;
  calibrationDate?: Date;
}

export interface ComplianceRequirement {
  requirementId: string;
  framework: string;
  description: string;
  mandatory: boolean;
  compliant: boolean;
  evidence: string[];
  lastVerified: Date;
}

export interface AuditTrailEntry {
  entryId: string;
  timestamp: Date;
  userId: string;
  action: string;
  details: Record<string, any>;
  outcome: string;
}

export interface Certification {
  certificationId: string;
  name: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
  status: string;
  requirements: string[];
}

export interface OptimizationConstraint {
  constraintId: string;
  type: string;
  parameter: string;
  operator: string;
  value: number | string;
  weight: number;
}

export interface OptimizationObjective {
  objectiveId: string;
  name: string;
  type: 'minimize' | 'maximize';
  weight: number;
  target: number;
}

export interface OptimizationSolution {
  solutionId: string;
  parameters: Record<string, any>;
  objectiveValue: number;
  constraintViolations: string[];
  feasible: boolean;
  confidence: number;
}

export interface ImplementationStep {
  stepId: string;
  description: string;
  sequence: number;
  estimatedTime: number;
  requiredResources: string[];
  dependencies: string[];
}

export interface ExpectedBenefit {
  benefitId: string;
  type: string;
  description: string;
  quantifiedValue: number;
  unit: string;
  timeframe: string;
  confidence: number;
}

export interface RiskAssessment {
  assessmentId: string;
  riskLevel: string;
  riskFactors: RiskFactor[];
  mitigationStrategies: MitigationStrategy[];
  residualRisk: number;
  assessmentDate: Date;
}

export interface RiskFactor {
  factorId: string;
  name: string;
  probability: number;
  impact: number;
  riskScore: number;
  category: string;
}

export interface MitigationStrategy {
  strategyId: string;
  name: string;
  description: string;
  effectiveness: number;
  cost: number;
  implementationTime: number;
}
