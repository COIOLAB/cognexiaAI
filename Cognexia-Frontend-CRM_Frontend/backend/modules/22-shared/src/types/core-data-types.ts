export interface MaintenanceOperation {
  id: string;
  equipmentId: string;
  operationType: MaintenanceOperationType;
  status: MaintenanceStatus;
  scheduledDate: Date;
  completedDate?: Date;
  priority: MaintenancePriority;
  description: string;
  requiredSkills: string[];
  estimatedDuration: number;
  actualDuration?: number;
  cost?: number;
  technician?: string;
  workOrderId: string;
  parentOperationId?: string;
  subOperations?: MaintenanceOperation[];
  parts?: MaintenancePart[];
  procedures?: MaintenanceProcedure[];
  qualityChecks?: QualityCheck[];
  safety: SafetyRequirements;
  metadata: Record<string, any>;
}

export interface EquipmentData {
  id: string;
  name: string;
  type: EquipmentType;
  model: string;
  manufacturer: string;
  serialNumber: string;
  installationDate: Date;
  lastMaintenanceDate?: Date;
  nextScheduledMaintenance?: Date;
  location: EquipmentLocation;
  status: EquipmentStatus;
  operatingHours: number;
  specifications: EquipmentSpecifications;
  sensors: SensorConfiguration[];
  maintenanceHistory: MaintenanceRecord[];
  warrantInfo: WarrantyInfo;
  criticality: CriticalityLevel;
  digitalTwinId?: string;
  blockchain: BlockchainRecord;
  aiModelAssignment?: string;
  condition: EquipmentCondition;
}

export interface IoTSensorStream {
  sensorId: string;
  equipmentId: string;
  sensorType: SensorType;
  dataType: SensorDataType;
  frequency: number;
  lastReading: SensorReading;
  thresholds: SensorThresholds;
  status: SensorStatus;
  calibrationDate: Date;
  nextCalibrationDate: Date;
  accuracy: number;
  reliability: number;
  location: SensorLocation;
  metadata: Record<string, any>;
}

export interface MaintenanceDashboard {
  id: string;
  userId: string;
  name: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  filters: DashboardFilters;
  autoRefresh: boolean;
  refreshInterval: number;
  permissions: DashboardPermissions;
  created: Date;
  updated: Date;
  analytics: DashboardAnalytics;
}

export interface AIMaintenanceModel {
  id: string;
  name: string;
  type: AIModelType;
  version: string;
  description: string;
  inputFeatures: ModelFeature[];
  outputTargets: ModelTarget[];
  accuracy: ModelAccuracy;
  trainingData: TrainingDataset;
  deploymentStatus: ModelDeploymentStatus;
  lastTrained: Date;
  performanceMetrics: ModelPerformanceMetrics;
  hyperparameters: ModelHyperparameters;
  architecture: ModelArchitecture;
  quantumEnhanced: boolean;
  blockchainVerified: boolean;
}

// Supporting enums and types
export enum MaintenanceOperationType {
  PREVENTIVE = 'preventive',
  PREDICTIVE = 'predictive',
  CORRECTIVE = 'corrective',
  EMERGENCY = 'emergency',
  CONDITION_BASED = 'condition_based',
  AUTONOMOUS = 'autonomous',
  QUANTUM_OPTIMIZED = 'quantum_optimized'
}

export enum MaintenanceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DELAYED = 'delayed',
  ON_HOLD = 'on_hold'
}

export enum MaintenancePriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  ROUTINE = 'routine'
}

export enum EquipmentType {
  PRODUCTION_LINE = 'production_line',
  CONVEYOR = 'conveyor',
  ROBOT = 'robot',
  SENSOR = 'sensor',
  PUMP = 'pump',
  MOTOR = 'motor',
  HEAT_EXCHANGER = 'heat_exchanger',
  COMPRESSOR = 'compressor',
  GENERATOR = 'generator',
  TRANSFORMER = 'transformer'
}

export enum EquipmentStatus {
  OPERATIONAL = 'operational',
  MAINTENANCE = 'maintenance',
  FAILED = 'failed',
  IDLE = 'idle',
  DECOMMISSIONED = 'decommissioned'
}

export enum SensorType {
  TEMPERATURE = 'temperature',
  PRESSURE = 'pressure',
  VIBRATION = 'vibration',
  ACOUSTIC = 'acoustic',
  FLOW = 'flow',
  LEVEL = 'level',
  PH = 'ph',
  CONDUCTIVITY = 'conductivity',
  OPTICAL = 'optical',
  MAGNETIC = 'magnetic',
  ULTRASONIC = 'ultrasonic',
  HYPERSPECTRAL = 'hyperspectral',
  QUANTUM = 'quantum'
}

export enum SensorDataType {
  NUMERIC = 'numeric',
  BOOLEAN = 'boolean',
  STRING = 'string',
  ARRAY = 'array',
  OBJECT = 'object',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video'
}

export enum SensorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
  CALIBRATING = 'calibrating'
}

export enum AIModelType {
  NEURAL_NETWORK = 'neural_network',
  RANDOM_FOREST = 'random_forest',
  SVM = 'svm',
  LINEAR_REGRESSION = 'linear_regression',
  DEEP_LEARNING = 'deep_learning',
  QUANTUM_ML = 'quantum_ml',
  HYBRID_CLASSICAL_QUANTUM = 'hybrid_classical_quantum',
  GENETIC_ALGORITHM = 'genetic_algorithm',
  FUZZY_LOGIC = 'fuzzy_logic',
  EXPERT_SYSTEM = 'expert_system'
}

export enum CriticalityLevel {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

// Supporting interfaces
export interface MaintenancePart {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  cost: number;
  supplier: string;
  leadTime: number;
  inStock: number;
}

export interface MaintenanceProcedure {
  id: string;
  name: string;
  steps: ProcedureStep[];
  estimatedTime: number;
  safetyNotes: string[];
  tools: string[];
  skills: string[];
}

export interface ProcedureStep {
  stepNumber: number;
  description: string;
  expectedTime: number;
  hazards: string[];
  checkpoints: string[];
}

export interface QualityCheck {
  id: string;
  name: string;
  criteria: string;
  expectedValue: any;
  actualValue?: any;
  passed?: boolean;
  inspector: string;
  timestamp: Date;
}

export interface SafetyRequirements {
  lockout: boolean;
  tagout: boolean;
  ppe: string[];
  permits: string[];
  hazardLevel: number;
  emergencyContacts: string[];
}

export interface EquipmentLocation {
  plant: string;
  building: string;
  floor: string;
  area: string;
  coordinates: {
    x: number;
    y: number;
    z?: number;
  };
  gps?: {
    latitude: number;
    longitude: number;
  };
}

export interface EquipmentSpecifications {
  power: number;
  voltage: number;
  current: number;
  frequency: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  weight: number;
  operatingTemperature: {
    min: number;
    max: number;
  };
  operatingPressure: {
    min: number;
    max: number;
  };
}

export interface SensorConfiguration {
  sensorId: string;
  mountLocation: string;
  samplingRate: number;
  dataFormat: string;
  communicationProtocol: string;
}

export interface MaintenanceRecord {
  date: Date;
  type: MaintenanceOperationType;
  description: string;
  cost: number;
  technician: string;
  duration: number;
  outcome: string;
}

export interface WarrantyInfo {
  startDate: Date;
  endDate: Date;
  provider: string;
  coverage: string[];
  terms: string;
}

export interface BlockchainRecord {
  transactionId: string;
  blockHash: string;
  timestamp: Date;
  verified: boolean;
}

export interface EquipmentCondition {
  overall: number; // 0-100
  mechanical: number;
  electrical: number;
  thermal: number;
  vibration: number;
  lastAssessed: Date;
  assessor: string;
  notes: string;
}

export interface SensorReading {
  value: any;
  timestamp: Date;
  quality: number; // 0-100
  status: string;
  metadata?: Record<string, any>;
}

export interface SensorThresholds {
  min?: number;
  max?: number;
  warning: {
    min?: number;
    max?: number;
  };
  critical: {
    min?: number;
    max?: number;
  };
}

export interface SensorLocation {
  equipment: string;
  position: string;
  orientation: string;
  accessibility: string;
}

// Dashboard types
export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  configuration: Record<string, any>;
  dataSource: string;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gridSize: number;
  responsive: boolean;
}

export interface DashboardFilters {
  timeRange: {
    start: Date;
    end: Date;
  };
  equipment: string[];
  location: string[];
  status: string[];
  priority: string[];
}

export interface DashboardPermissions {
  view: string[];
  edit: string[];
  share: string[];
}

export interface DashboardAnalytics {
  views: number;
  lastViewed: Date;
  avgViewDuration: number;
  interactionRate: number;
}

// AI Model types
export interface ModelFeature {
  name: string;
  type: string;
  importance: number;
  preprocessor?: string;
}

export interface ModelTarget {
  name: string;
  type: string;
  unit?: string;
  range?: { min: number; max: number };
}

export interface ModelAccuracy {
  training: number;
  validation: number;
  test: number;
  crossValidation: number;
}

export interface TrainingDataset {
  size: number;
  features: number;
  timeRange: {
    start: Date;
    end: Date;
  };
  quality: number;
  source: string;
}

export enum ModelDeploymentStatus {
  TRAINING = 'training',
  VALIDATING = 'validating',
  DEPLOYED = 'deployed',
  RETIRED = 'retired',
  ERROR = 'error'
}

export interface ModelPerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  roc: number;
  mae: number;
  rmse: number;
  responseTime: number;
}

export interface ModelHyperparameters {
  learningRate: number;
  epochs: number;
  batchSize: number;
  layers?: number;
  neurons?: number[];
  dropout?: number;
  regularization?: number;
}

export interface ModelArchitecture {
  type: string;
  layers: LayerConfiguration[];
  optimizer: string;
  lossFunction: string;
  metrics: string[];
}

export interface LayerConfiguration {
  type: string;
  neurons: number;
  activation: string;
  dropout?: number;
  regularization?: string;
}
