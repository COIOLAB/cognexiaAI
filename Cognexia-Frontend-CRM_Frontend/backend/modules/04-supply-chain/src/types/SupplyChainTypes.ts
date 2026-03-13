/**
 * Industry 5.0 Supply Chain & Logistics Management Types
 * Comprehensive type definitions for advanced supply chain operations
 */

// === ENUMS ===

export enum FlowStatus {
  PLANNED = 'planned',
  ACTIVE = 'active',
  IN_TRANSIT = 'in_transit',
  DELAYED = 'delayed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXCEPTION = 'exception'
}

export enum NodeAutonomyLevel {
  MANUAL = 'manual',
  ASSISTED = 'assisted',
  SEMI_AUTONOMOUS = 'semi_autonomous',
  HIGHLY_AUTONOMOUS = 'highly_autonomous',
  FULLY_AUTONOMOUS = 'fully_autonomous'
}

export enum NodeOperationalStatus {
  OPERATIONAL = 'operational',
  MAINTENANCE = 'maintenance',
  OFFLINE = 'offline',
  ERROR = 'error',
  EMERGENCY = 'emergency'
}

export enum TransportationMode {
  GROUND = 'ground',
  AIR = 'air',
  SEA = 'sea',
  RAIL = 'rail',
  PIPELINE = 'pipeline',
  MULTIMODAL = 'multimodal',
  DRONE = 'drone',
  AUTONOMOUS = 'autonomous'
}

export enum DigitalTwinType {
  NETWORK = 'network',
  NODE = 'node',
  FLOW = 'flow',
  PRODUCT = 'product',
  PROCESS = 'process',
  FACILITY = 'facility'
}

export enum CollaborationType {
  DECISION_SUPPORT = 'decision_support',
  PLANNING = 'planning',
  OPTIMIZATION = 'optimization',
  RISK_ASSESSMENT = 'risk_assessment',
  INNOVATION = 'innovation',
  TRAINING = 'training'
}

// === CORE INTERFACES ===

export interface GeographicLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  address: string;
  country: string;
  region: string;
  timezone: string;
}

export interface NetworkConnection {
  connectionId: string;
  sourceNodeId: string;
  targetNodeId: string;
  connectionType: string;
  capacity: number;
  latency: number;
  reliability: number;
  cost: number;
  sustainability: ConnectionSustainability;
  status: string;
}

export interface NetworkDigitalTwin {
  twinId: string;
  networkId: string;
  models: DigitalTwinModel[];
  realTimeData: any;
  predictions: any[];
  optimizations: any[];
}

export interface NetworkIntelligence {
  aiModels: string[];
  capabilities: string[];
  insights: any[];
  predictions: any[];
  recommendations: any[];
}

export interface NetworkSustainability {
  carbonFootprint: number;
  energyEfficiency: number;
  wasteReduction: number;
  socialImpact: number;
  circularityScore: number;
}

export interface NetworkResilience {
  riskLevel: number;
  redundancy: number;
  adaptability: number;
  recoveryTime: number;
  vulnerabilities: string[];
}

export interface NetworkCollaboration {
  humanExperts: HumanExpert[];
  aiAgents: AIAgent[];
  decisionProcesses: CollaborativeProcess[];
  trustLevel: number;
}

export interface NetworkAutomation {
  automationLevel: number;
  autonomousSystems: string[];
  humanOversight: boolean;
  safetyMeasures: string[];
}

export interface NetworkCompliance {
  regulations: string[];
  certifications: string[];
  complianceScore: number;
  auditTrail: any[];
}

export interface NetworkPerformance {
  efficiency: number;
  throughput: number;
  costEffectiveness: number;
  serviceLevel: number;
  reliability: number;
}

export interface NetworkOptimization {
  currentOptimization: any;
  optimizationHistory: any[];
  improvementPotential: number;
  nextOptimization: Date;
}

// === NODE INTERFACES ===

export interface NodeCapability {
  capabilityId: string;
  name: string;
  type: string;
  capacity: number;
  efficiency: number;
  specializations: string[];
}

export interface NodeCapacity {
  totalCapacity: number;
  availableCapacity: number;
  utilizationRate: number;
  peakCapacity: number;
  expandability: number;
}

export interface NodeConnection {
  connectionId: string;
  targetNodeId: string;
  connectionType: string;
  capacity: number;
  latency: number;
  cost: number;
}

export interface NodeDigitalTwin {
  twinId: string;
  nodeId: string;
  realTimeData: any;
  simulations: any[];
  predictions: any[];
  optimizations: any[];
}

export interface NodeAISystem {
  systemId: string;
  aiType: string;
  capabilities: string[];
  performance: number;
  autonomyLevel: number;
}

export interface NodeSustainability {
  carbonFootprint: number;
  energyConsumption: number;
  wasteGeneration: number;
  renewableEnergyUsage: number;
  sustainabilityScore: number;
}

export interface NodePerformance {
  efficiency: number;
  throughput: number;
  quality: number;
  availability: number;
  reliability: number;
}

export interface NodeCompliance {
  regulations: string[];
  certifications: string[];
  complianceLevel: number;
  lastAudit: Date;
}

export interface NodeHumanResources {
  totalEmployees: number;
  skillLevels: any[];
  trainingPrograms: string[];
  safetyRecord: any;
  satisfaction: number;
}

// === FLOW INTERFACES ===

export interface FlowMaterial {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  value: number;
  specifications: any;
  sustainability: MaterialSustainability;
}

export interface FlowRoute {
  routeId: string;
  waypoints: Waypoint[];
  distance: number;
  estimatedDuration: number;
  cost: number;
  carbonFootprint: number;
  alternatives: AlternativeRoute[];
}

export interface FlowTimeline {
  plannedStart: Date;
  actualStart?: Date;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  milestones: Milestone[];
}

export interface FlowTracking {
  currentLocation: GeographicLocation;
  status: FlowStatus;
  progress: number;
  alerts: FlowAlert[];
  sensors: SensorData[];
}

export interface FlowOptimization {
  optimizationId: string;
  objectives: string[];
  constraints: string[];
  algorithm: string;
  results: any;
  improvements: any[];
}

export interface FlowSustainability {
  carbonEmissions: number;
  energyConsumption: number;
  environmentalImpact: number;
  socialBenefits: any[];
  circularityContribution: number;
}

export interface FlowAutomation {
  automationLevel: number;
  autonomousSystems: string[];
  aiDecisionPoints: any[];
  humanInterventionPoints: any[];
}

export interface FlowDigitalTwin {
  twinId: string;
  flowId: string;
  realTimeModel: any;
  simulations: FlowSimulation[];
  predictions: FlowPrediction[];
}

export interface FlowAIInsight {
  insightId: string;
  type: string;
  description: string;
  confidence: number;
  recommendation: string;
  impact: number;
}

export interface FlowHumanOversight {
  supervisorId: string;
  oversightLevel: string;
  interventionRights: string[];
  escalationProtocol: any;
  decisionAuthority: string[];
}

// === QUANTUM INTERFACES ===

export interface QuantumProcessor {
  processorId: string;
  qubits: number;
  coherenceTime: number;
  errorRate: number;
  gateTime: number;
  connectivity: any;
}

export interface QuantumAlgorithm {
  algorithmId: string;
  name: string;
  type: string;
  complexity: string;
  applications: string[];
  parameters: any;
}

export interface OptimizationProblemSpace {
  variables: number;
  constraints: number;
  objectives: string[];
  complexity: string;
  searchSpace: any;
}

export interface QuantumState {
  stateId: string;
  qubits: number[];
  amplitudes: number[];
  phase: number;
  entanglements: string[];
}

export interface QuantumEntanglement {
  entanglementId: string;
  qubits: number[];
  strength: number;
  type: string;
  applications: string[];
}

export interface QuantumSuperposition {
  superpositionId: string;
  states: QuantumState[];
  probabilities: number[];
  coherence: number;
}

export interface QuantumMeasurement {
  measurementId: string;
  qubit: number;
  result: number;
  probability: number;
  timestamp: Date;
}

export interface QuantumOptimizationResult {
  resultId: string;
  optimalSolution: any;
  confidence: number;
  executionTime: number;
  iterations: number;
  convergence: number;
}

export interface QuantumPerformance {
  executionTime: number;
  accuracy: number;
  efficiency: number;
  scalability: number;
  reliability: number;
}

export interface HumanQuantumInterpretation {
  interpreterId: string;
  interpretation: string;
  confidence: number;
  implications: string[];
  recommendations: string[];
}

// === BLOCKCHAIN INTERFACES ===

export interface BlockchainNetwork {
  networkId: string;
  networkType: string;
  consensus: string;
  nodes: number;
  throughput: number;
  latency: number;
}

export interface SupplyChainSmartContract {
  contractId: string;
  name: string;
  purpose: string;
  parties: string[];
  terms: any;
  automation: any[];
}

export interface SupplyChainTransaction {
  transactionId: string;
  blockNumber: number;
  timestamp: Date;
  parties: string[];
  value: number;
  data: any;
  hash: string;
}

export interface DigitalAsset {
  assetId: string;
  tokenId: string;
  owner: string;
  value: number;
  metadata: any;
  provenance: ProvenanceRecord[];
}

export interface ProvenanceRecord {
  recordId: string;
  timestamp: Date;
  action: string;
  actor: string;
  location: string;
  data: any;
  hash: string;
}

export interface BlockchainCompliance {
  regulations: string[];
  auditTrail: any[];
  complianceScore: number;
  violations: any[];
}

export interface ConsensusProtocol {
  type: string;
  parameters: any;
  validators: string[];
  performance: any;
}

export interface BlockchainSecurity {
  encryptionLevel: string;
  accessControls: any[];
  threatLevel: string;
  vulnerabilities: string[];
}

export interface BlockchainInteroperability {
  supportedNetworks: string[];
  bridges: any[];
  protocols: string[];
  compatibility: number;
}

export interface BlockchainGovernance {
  stakeholders: any[];
  votingMechanism: any;
  proposals: any[];
  decisions: any[];
}

export interface BlockchainSustainability {
  energyConsumption: number;
  carbonFootprint: number;
  efficiency: number;
  greenAlternatives: string[];
}

// === AI INTERFACES ===

export interface SupplyChainAIModel {
  modelId: string;
  name: string;
  type: string;
  accuracy: number;
  training: any;
  deployment: any;
}

export interface SupplyChainPrediction {
  predictionId: string;
  type: string;
  target: any;
  confidence: number;
  timeHorizon: number;
  accuracy: number;
}

export interface SupplyChainRecommendation {
  recommendationId: string;
  type: string;
  description: string;
  impact: any;
  confidence: number;
  implementation: any;
}

export interface SupplyChainAnomaly {
  anomalyId: string;
  type: string;
  severity: string;
  description: string;
  root_cause: string;
  mitigation: any;
}

export interface SupplyChainPattern {
  patternId: string;
  type: string;
  description: string;
  frequency: number;
  significance: number;
  applications: string[];
}

export interface SupplyChainInsight {
  insightId: string;
  category: string;
  description: string;
  value: number;
  actionable: boolean;
  recommendations: string[];
}

export interface ContinuousLearning {
  learningRate: number;
  adaptationSpeed: number;
  modelUpdates: any[];
  performanceImprovement: number;
}

export interface AdaptiveIntelligence {
  adaptationLevel: number;
  triggers: any[];
  responses: any[];
  learning: any;
}

export interface AIHumanCollaboration {
  collaborationLevel: number;
  interfaces: any[];
  feedback: any[];
  trust: number;
}

export interface AIEthicsFramework {
  principles: string[];
  guidelines: any[];
  monitoring: any;
  compliance: number;
}

export interface AIExplainability {
  explainabilityLevel: number;
  methods: string[];
  interpretations: any[];
  transparency: number;
}

export interface AIPerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  latency: number;
  throughput: number;
}

// === AUTONOMOUS SYSTEM INTERFACES ===

export interface AutonomousVehicle {
  vehicleId: string;
  type: string;
  autonomyLevel: number;
  capabilities: string[];
  sensors: any[];
  ai: any;
  performance: any;
}

export interface RoboticSystem {
  robotId: string;
  type: string;
  capabilities: string[];
  aiLevel: number;
  sensors: any[];
  actuators: any[];
  performance: any;
}

export interface LogisticsDrone {
  droneId: string;
  type: string;
  payload: number;
  range: number;
  autonomy: number;
  sensors: any[];
  performance: any;
}

export interface AutomatedFacility {
  facilityId: string;
  type: string;
  automationLevel: number;
  systems: any[];
  capabilities: string[];
  performance: any;
}

export interface AutonomousControlSystem {
  systemId: string;
  controlLevel: string;
  algorithms: any[];
  responses: any[];
  learning: any;
}

export interface AutonomousNavigation {
  navigationId: string;
  algorithms: any[];
  sensors: any[];
  accuracy: number;
  realTimeUpdates: boolean;
}

export interface InterAutonomousCoordination {
  coordinationId: string;
  participants: string[];
  protocols: any[];
  efficiency: number;
  reliability: number;
}

export interface HumanSupervisionSystem {
  systemId: string;
  supervisors: any[];
  interventionCapability: any;
  escalationProtocol: any;
  authority: any;
}

export interface AutonomousSafety {
  safetyLevel: string;
  protocols: any[];
  monitoring: any;
  emergencyResponse: any;
  failsafes: any[];
}

export interface AutonomousLearning {
  learningType: string;
  algorithms: any[];
  adaptationRate: number;
  improvement: any;
}

export interface AutonomousPerformance {
  efficiency: number;
  reliability: number;
  availability: number;
  accuracy: number;
  adaptability: number;
}

// === SUSTAINABILITY INTERFACES ===

export interface SustainabilityGoal {
  goalId: string;
  category: string;
  target: any;
  timeline: Date;
  progress: number;
  metrics: any[];
}

export interface CircularProcess {
  processId: string;
  type: string;
  inputs: any[];
  outputs: any[];
  waste: number;
  efficiency: number;
}

export interface CarbonOptimizationSystem {
  systemId: string;
  strategies: any[];
  targets: any[];
  monitoring: any;
  performance: any;
}

export interface RenewableEnergyIntegration {
  integrationId: string;
  sources: any[];
  capacity: number;
  utilization: number;
  benefits: any;
}

export interface WasteReductionSystem {
  systemId: string;
  strategies: any[];
  targets: any[];
  performance: any;
  innovations: any[];
}

export interface SocialImpactSystem {
  systemId: string;
  initiatives: any[];
  beneficiaries: any[];
  impact: any;
  measurement: any;
}

export interface LifecycleManagement {
  managementId: string;
  stages: any[];
  monitoring: any;
  optimization: any;
  reporting: any;
}

export interface SustainabilityReporting {
  reportId: string;
  standards: string[];
  metrics: any[];
  frequency: string;
  stakeholders: any[];
}

export interface SustainabilityCertification {
  certificationId: string;
  standard: string;
  issuer: string;
  validity: Date;
  scope: any;
}

export interface SustainabilityInnovation {
  innovationId: string;
  type: string;
  description: string;
  impact: any;
  implementation: any;
}

export interface SustainabilityCollaboration {
  collaborationId: string;
  partners: any[];
  initiatives: any[];
  outcomes: any;
  benefits: any;
}

// === SUPPORTING INTERFACES ===

export interface ConnectionSustainability {
  carbonFootprint: number;
  energyEfficiency: number;
  environmentalImpact: number;
}

export interface MaterialSustainability {
  recyclability: number;
  carbonFootprint: number;
  renewableContent: number;
  toxicity: number;
}

export interface Waypoint {
  waypointId: string;
  location: GeographicLocation;
  estimatedArrival: Date;
  activities: string[];
}

export interface AlternativeRoute {
  routeId: string;
  description: string;
  distance: number;
  duration: number;
  cost: number;
  carbonFootprint: number;
}

export interface Milestone {
  milestoneId: string;
  name: string;
  plannedDate: Date;
  actualDate?: Date;
  status: string;
}

export interface FlowAlert {
  alertId: string;
  type: string;
  severity: string;
  message: string;
  timestamp: Date;
}

export interface SensorData {
  sensorId: string;
  type: string;
  value: any;
  unit: string;
  timestamp: Date;
}

export interface FlowSimulation {
  simulationId: string;
  scenario: any;
  results: any;
  probability: number;
  timestamp: Date;
}

export interface FlowPrediction {
  predictionId: string;
  type: string;
  value: any;
  confidence: number;
  timeframe: number;
}

export interface HumanExpert {
  expertId: string;
  name: string;
  expertise: string[];
  experience: number;
  availability: boolean;
}

export interface AIAgent {
  agentId: string;
  type: string;
  capabilities: string[];
  autonomyLevel: number;
  performance: any;
}

export interface CollaborativeProcess {
  processId: string;
  participants: any[];
  stages: any[];
  decisions: any[];
  outcomes: any[];
}

export interface DigitalTwinModel {
  modelId: string;
  type: string;
  fidelity: string;
  updateFrequency: number;
  accuracy: number;
}

export interface ServiceStatus {
  coreServices: string;
  advancedSystems: string;
  quantumSystems: string;
  blockchainLedger: string;
  aiIntelligence: string;
  autonomousSystems: string;
}

export type SystemCapability = string;

// === DECISION CONTEXT INTERFACES ===

export interface SupplyChainDecisionContext {
  contextId: string;
  decisionType: string;
  stakeholders: any[];
  constraints: any[];
  objectives: any[];
  data: any;
  urgency: string;
  complexity: string;
  impact: string;
}

export interface CircularityGoal {
  goalId: string;
  category: string;
  target: number;
  timeline: Date;
  metrics: string[];
  priority: string;
}

// === OPTIMIZATION INTERFACES ===

export interface OptimizationObjective {
  objectiveId: string;
  name: string;
  type: string;
  weight: number;
  target: any;
  constraints: any[];
}

export interface NetworkConstraint {
  constraintId: string;
  type: string;
  description: string;
  parameters: any;
  severity: string;
}

export interface SustainabilityRequirement {
  requirementId: string;
  category: string;
  target: any;
  measurement: any;
  compliance: string;
}

export interface ResilienceRequirement {
  requirementId: string;
  type: string;
  level: string;
  metrics: any[];
  validation: any;
}

export interface SupplyChainNodeConfiguration {
  nodeId: string;
  nodeType: string;
  location: GeographicLocation;
  capacity: number;
  capabilities: string[];
  constraints: any[];
  requirements: any[];
}

export interface GlobalObjective {
  objectiveId: string;
  scope: string;
  target: any;
  weight: number;
  timeline: Date;
}

export interface GlobalConstraint {
  constraintId: string;
  scope: string;
  type: string;
  parameters: any;
  enforceability: string;
}

// === IOT AND EDGE COMPUTING ===

export interface IoTSensorNetwork {
  networkId: string;
  sensors: IoTSensor[];
  coverage: any;
  connectivity: any;
  dataflow: any;
  performance: any;
}

export interface IoTSensor {
  sensorId: string;
  type: string;
  location: GeographicLocation;
  capabilities: string[];
  data: any;
  status: string;
}

export interface EdgeComputingNode {
  nodeId: string;
  location: GeographicLocation;
  processing: any;
  storage: any;
  connectivity: any;
  applications: any[];
}

export interface DistributedIntelligence {
  intelligenceId: string;
  nodes: string[];
  algorithms: any[];
  coordination: any;
  performance: any;
}

// === ANALYTICS ENGINES ===

export interface PredictiveAnalyticsEngine {
  engineId: string;
  models: any[];
  predictions: any[];
  accuracy: number;
  performance: any;
}

export interface PrescriptiveAnalyticsEngine {
  engineId: string;
  algorithms: any[];
  recommendations: any[];
  optimization: any;
  performance: any;
}

export interface CognitiveAnalyticsEngine {
  engineId: string;
  cognition: any;
  learning: any;
  reasoning: any;
  performance: any;
}

// === MONITORING AND CONTROL ===

export interface RealTimeMonitoring {
  monitoringId: string;
  targets: any[];
  metrics: any[];
  alerts: any[];
  dashboards: any[];
}

export interface AutonomousControl {
  controlId: string;
  systems: any[];
  algorithms: any[];
  responses: any[];
  performance: any;
}

export interface HumanOversight {
  oversightId: string;
  supervisors: any[];
  authority: any[];
  interventions: any[];
  escalation: any;
}

// === MOLECULAR AND NANO INTERFACES ===

export interface MolecularLogisticsAnalyzer {
  analyzerId: string;
  capabilities: string[];
  analysis: any[];
  optimization: any[];
  performance: any;
}

export interface QuantumEntanglementOptimizer {
  optimizerId: string;
  entanglements: any[];
  optimization: any[];
  results: any[];
  performance: any;
}

export interface NanoLogisticsController {
  controllerId: string;
  nanoSystems: any[];
  control: any[];
  coordination: any;
  performance: any;
}

// === EXTENDED REALITY ===

export interface ARSupplyChainVisualization {
  visualizationId: string;
  displays: any[];
  interactions: any[];
  data: any;
  performance: any;
}

export interface VRLogisticsSimulation {
  simulationId: string;
  environments: any[];
  scenarios: any[];
  users: any[];
  performance: any;
}

export interface MRCollaborativeWorkspace {
  workspaceId: string;
  participants: any[];
  tools: any[];
  sessions: any[];
  performance: any;
}

export default {
  // Export all interfaces and types
  FlowStatus,
  NodeAutonomyLevel,
  NodeOperationalStatus,
  TransportationMode,
  DigitalTwinType,
  CollaborationType
};
