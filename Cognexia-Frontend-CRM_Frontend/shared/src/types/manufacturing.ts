// Manufacturing Industry 5.0 Types

import { BaseEntity } from './core';

export enum ManufacturingProcessType {
  DISCRETE = 'DISCRETE',
  CONTINUOUS = 'CONTINUOUS',
  BATCH = 'BATCH',
  HYBRID = 'HYBRID'
}

export enum EquipmentStatus {
  OPERATIONAL = 'OPERATIONAL',
  MAINTENANCE = 'MAINTENANCE',
  BREAKDOWN = 'BREAKDOWN',
  IDLE = 'IDLE',
  SETUP = 'SETUP'
}

export enum QualityStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  REWORK = 'REWORK',
  PENDING = 'PENDING'
}

export enum ProductionOrderStatus {
  PLANNED = 'PLANNED',
  RELEASED = 'RELEASED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD'
}

export interface ProductionLine extends BaseEntity {
  name: string;
  code: string;
  processType: ManufacturingProcessType;
  capacity: number;
  currentLoad: number;
  efficiency: number;
  oee: number; // Overall Equipment Effectiveness
  equipment: Equipment[];
  workstations: Workstation[];
  isActive: boolean;
}

export interface Equipment extends BaseEntity {
  name: string;
  code: string;
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  status: EquipmentStatus;
  location: string;
  specifications: Record<string, any>;
  sensors: IoTSensor[];
  maintenanceSchedule: MaintenanceSchedule[];
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  operatingHours: number;
  energyConsumption: number;
}

export interface IoTSensor extends BaseEntity {
  equipmentId: string;
  sensorType: string;
  sensorId: string;
  location: string;
  dataType: 'temperature' | 'pressure' | 'vibration' | 'humidity' | 'speed' | 'custom';
  unit: string;
  minValue?: number;
  maxValue?: number;
  alertThreshold?: number;
  calibrationDate?: Date;
  nextCalibration?: Date;
  isOnline: boolean;
}

export interface SensorReading {
  sensorId: string;
  timestamp: Date;
  value: number;
  quality: 'good' | 'bad' | 'uncertain';
  alarms?: SensorAlarm[];
}

export interface SensorAlarm {
  type: 'high' | 'low' | 'deviation' | 'offline';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
}

export interface Workstation extends BaseEntity {
  name: string;
  code: string;
  productionLineId: string;
  sequence: number;
  operations: Operation[];
  currentOperation?: string;
  workers: Worker[];
  tools: Tool[];
  cycleTime: number;
  setupTime: number;
}

export interface Operation extends BaseEntity {
  name: string;
  code: string;
  description: string;
  workstationId: string;
  standardTime: number;
  instructions: string[];
  qualityChecks: QualityCheck[];
  materials: MaterialConsumption[];
  tools: string[];
  skillRequirements: SkillRequirement[];
}

export interface Worker extends BaseEntity {
  employeeId: string;
  firstName: string;
  lastName: string;
  skills: Skill[];
  certifications: Certification[];
  currentWorkstation?: string;
  shift: Shift;
  productivity: number;
  safetyRating: number;
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  certifiedDate?: Date;
  expiryDate?: Date;
}

export interface Certification {
  name: string;
  issuedBy: string;
  issuedDate: Date;
  expiryDate?: Date;
  certificateNumber: string;
}

export interface Shift {
  name: string;
  startTime: string;
  endTime: string;
  days: string[];
}

export interface ProductionOrder extends BaseEntity {
  orderNumber: string;
  productId: string;
  quantity: number;
  producedQuantity: number;
  status: ProductionOrderStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  productionLineId: string;
  bomId: string; // Bill of Materials
  routingId: string;
  customerOrderId?: string;
  specialInstructions?: string;
}

export interface BillOfMaterials extends BaseEntity {
  bomNumber: string;
  productId: string;
  version: string;
  effectiveDate: Date;
  expiryDate?: Date;
  components: BOMComponent[];
  totalCost: number;
  isActive: boolean;
}

export interface BOMComponent {
  materialId: string;
  quantity: number;
  unit: string;
  scrapFactor: number;
  position: string;
  alternatives?: string[];
}

export interface Material extends BaseEntity {
  materialNumber: string;
  name: string;
  description: string;
  type: 'raw' | 'semi-finished' | 'finished' | 'consumable';
  category: string;
  unit: string;
  standardCost: number;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  supplier: string;
  leadTime: number;
  shelfLife?: number;
  storageConditions?: string;
  hazardousClassification?: string;
}

export interface QualityCheck extends BaseEntity {
  name: string;
  description: string;
  type: 'dimensional' | 'visual' | 'functional' | 'chemical' | 'electrical';
  method: string;
  specification: QualitySpecification;
  frequency: 'each' | 'sample' | 'periodic';
  sampleSize?: number;
  tools: string[];
  inspector?: string;
}

export interface QualitySpecification {
  target: number;
  upperLimit: number;
  lowerLimit: number;
  unit: string;
  tolerance: number;
}

export interface QualityInspection extends BaseEntity {
  productionOrderId: string;
  operationId: string;
  inspectorId: string;
  inspectionDate: Date;
  checks: QualityCheckResult[];
  overallStatus: QualityStatus;
  defects: Defect[];
  correctedQuantity?: number;
  rejectedQuantity?: number;
  reworkInstructions?: string;
}

export interface QualityCheckResult {
  checkId: string;
  result: number | string | boolean;
  status: QualityStatus;
  notes?: string;
}

export interface Defect {
  type: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  quantity: number;
  rootCause?: string;
  correctedBy?: string;
}

export interface MaintenanceSchedule extends BaseEntity {
  equipmentId: string;
  type: 'preventive' | 'predictive' | 'corrective' | 'emergency';
  description: string;
  frequency: string; // e.g., "weekly", "monthly", "500 hours"
  estimatedDuration: number;
  nextDueDate: Date;
  tasks: MaintenanceTask[];
  spareParts: SparePart[];
  technicians: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface MaintenanceTask {
  name: string;
  description: string;
  estimatedTime: number;
  tools: string[];
  skills: string[];
  safetyRequirements: string[];
}

export interface SparePart {
  partNumber: string;
  name: string;
  quantity: number;
  cost: number;
  supplier: string;
  leadTime: number;
}

export interface MaintenanceOrder extends BaseEntity {
  orderNumber: string;
  equipmentId: string;
  type: 'preventive' | 'predictive' | 'corrective' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  description: string;
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  assignedTechnicians: string[];
  estimatedCost: number;
  actualCost?: number;
  workLog: MaintenanceWorkLog[];
}

export interface MaintenanceWorkLog {
  technicianId: string;
  startTime: Date;
  endTime: Date;
  description: string;
  partsUsed: SparePart[];
  hoursWorked: number;
  issues?: string;
  recommendations?: string;
}

export interface PredictiveMaintenanceAlert extends BaseEntity {
  equipmentId: string;
  algorithmUsed: string;
  alertType: 'anomaly' | 'degradation' | 'failure_prediction';
  severity: 'info' | 'warning' | 'critical';
  predictedFailureDate?: Date;
  confidence: number;
  description: string;
  recommendedActions: string[];
  dataPoints: any[];
  acknowledged: boolean;
  acknowledgedBy?: string;
}

export interface Tool extends BaseEntity {
  toolNumber: string;
  name: string;
  type: string;
  location: string;
  status: 'available' | 'in-use' | 'maintenance' | 'retired';
  currentUser?: string;
  calibrationRequired: boolean;
  lastCalibration?: Date;
  nextCalibration?: Date;
  specifications: Record<string, any>;
}

export interface MaterialConsumption {
  materialId: string;
  quantity: number;
  unit: string;
  cost: number;
  wastage: number;
  batchNumber?: string;
  expiryDate?: Date;
}

export interface SkillRequirement {
  skill: string;
  requiredLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  mandatory: boolean;
  certification?: string;
}

// Analytics and Reporting Types
export interface ProductionMetrics {
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  throughput: number;
  cycleTime: number;
  downtime: number;
  scrapRate: number;
  reworkRate: number;
  energyEfficiency: number;
}

export interface KPI {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  period: string;
  category: 'production' | 'quality' | 'efficiency' | 'cost' | 'safety';
}
