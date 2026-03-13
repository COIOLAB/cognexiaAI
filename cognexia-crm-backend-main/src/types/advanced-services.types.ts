/**
 * Comprehensive Type Definitions for Advanced CRM Services
 * This file provides all necessary types for AI, Quantum, Holographic, and AR/VR services
 */

// ============================================
// Common Base Types
// ============================================
export type UUID = string;
export type Timestamp = Date | string;
export type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

// ============================================
// AI Customer Intelligence Types
// ============================================
export interface CustomerBehaviorPrediction {
  customerId: string;
  predictions: BehaviorPrediction[];
  confidence: number;
  generatedAt: Timestamp;
}

export interface BehaviorPrediction {
  behavior: string;
  probability: number;
  expectedDate?: Timestamp;
  factors: string[];
}

export interface CustomerInsightData {
  customerId: string;
  insights: Insight[];
  score: number;
  category: string;
}

export interface Insight {
  type: string;
  description: string;
  confidence: number;
  actionable: boolean;
  recommendations?: string[];
}

// ============================================
// Quantum Personalization Types
// ============================================
export interface QuantumPersonalization {
  customerId: string;
  quantumState: QuantumState;
  personalizationVectors: PersonalizationVector[];
  recommendations: PersonalizedRecommendation[];
}

export interface QuantumState {
  stateId: string;
  dimensions: number;
  coherence: number;
  entanglements: string[];
}

export interface PersonalizationVector {
  dimension: string;
  value: number;
  weight: number;
}

export interface PersonalizedRecommendation {
  id: string;
  type: string;
  content: JSONValue;
  relevance: number;
  timing: Timestamp;
}

// ============================================
// Holographic Experience Types
// ============================================
export interface HolographicExperience {
  sessionId: string;
  customerId: string;
  experienceType: string;
  holographicData: HolographicData;
  interactions: HolographicInteraction[];
}

export interface HolographicData {
  scene: string;
  objects: Holographic3DObject[];
  lighting: LightingConfig;
  audio: AudioConfig;
}

export interface Holographic3DObject {
  id: string;
  type: string;
  position: Vector3D;
  rotation: Vector3D;
  scale: Vector3D;
  metadata: JSONValue;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface LightingConfig {
  ambient: number;
  directional: DirectionalLight[];
}

export interface DirectionalLight {
  direction: Vector3D;
  intensity: number;
  color: string;
}

export interface AudioConfig {
  enabled: boolean;
  spatial: boolean;
  volume: number;
}

export interface HolographicInteraction {
  timestamp: Timestamp;
  type: string;
  target: string;
  data: JSONValue;
}

// ============================================
// AR/VR Sales Experience Types
// ============================================
export interface ARVRExperience {
  sessionId: string;
  experienceType: 'AR' | 'VR';
  environment: VirtualEnvironment;
  products: VirtualProduct[];
  interactions: VRInteraction[];
}

export interface VirtualEnvironment {
  id: string;
  name: string;
  type: string;
  assets: EnvironmentAsset[];
}

export interface EnvironmentAsset {
  id: string;
  type: string;
  url: string;
  position: Vector3D;
}

export interface VirtualProduct {
  productId: string;
  model3D: string;
  animations: Animation3D[];
  interactable: boolean;
}

export interface Animation3D {
  name: string;
  duration: number;
  loop: boolean;
}

export interface VRInteraction {
  timestamp: Timestamp;
  type: string;
  objectId: string;
  data: JSONValue;
}

// ============================================
// Predictive Analytics Types
// ============================================
export interface PredictiveModel {
  modelId: string;
  type: string;
  accuracy: number;
  lastTrained: Timestamp;
  features: string[];
}

export interface Prediction {
  target: string;
  value: number;
  confidence: number;
  range: PredictionRange;
}

export interface PredictionRange {
  min: number;
  max: number;
  median: number;
}

export interface AnalyticsResult {
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

// ============================================
// Journey Orchestration Types
// ============================================
export interface CustomerJourney {
  journeyId: string;
  customerId: string;
  stage: string;
  touchpoints: Touchpoint[];
  nextActions: RecommendedAction[];
}

export interface Touchpoint {
  id: string;
  type: string;
  channel: string;
  timestamp: Timestamp;
  outcome: string;
}

export interface RecommendedAction {
  action: string;
  priority: number;
  reasoning: string;
  expectedOutcome: string;
}

// ============================================
// Real-Time Analytics Types
// ============================================
export interface RealTimeMetrics {
  timestamp: Timestamp;
  metrics: Metric[];
  alerts: Alert[];
}

export interface Metric {
  name: string;
  value: number;
  unit: string;
  change: number;
}

export interface Alert {
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Timestamp;
  resolved: boolean;
}

// ============================================
// LLM Integration Types  
// ============================================
export interface LLMRequest {
  prompt: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  context?: JSONValue;
}

export interface LLMResponse {
  content: string;
  model: string;
  tokensUsed: number;
  finishReason: string;
}

export interface ConversationContext {
  conversationId: string;
  messages: ConversationMessage[];
  metadata: JSONValue;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Timestamp;
}

// ============================================
// MFA & Security Types
// ============================================
export interface MFAChallenge {
  challengeId: string;
  type: 'totp' | 'sms' | 'email' | 'biometric';
  expiresAt: Timestamp;
}

export interface MFAVerification {
  challengeId: string;
  code: string;
  verified: boolean;
}

// ============================================
// Integration Hub Types
// ============================================
export interface IntegrationConfig {
  integrationId: string;
  type: string;
  enabled: boolean;
  credentials: Record<string, string>;
  settings: JSONValue;
}

export interface SyncResult {
  integrationId: string;
  success: boolean;
  recordsSynced: number;
  errors: string[];
  timestamp: Timestamp;
}

// ============================================
// Workflow Types
// ============================================
export interface WorkflowDefinition {
  workflowId: string;
  name: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  active: boolean;
}

export interface WorkflowTrigger {
  type: string;
  conditions: JSONValue;
}

export interface WorkflowStep {
  stepId: string;
  type: string;
  action: string;
  parameters: JSONValue;
  nextStep?: string;
}

export interface WorkflowExecution {
  executionId: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Timestamp;
  completedAt?: Timestamp;
  output?: JSONValue;
}

// ============================================
// Export All Types
// ============================================
// export type * from './autonomous-journey-types'; // Not yet implemented
