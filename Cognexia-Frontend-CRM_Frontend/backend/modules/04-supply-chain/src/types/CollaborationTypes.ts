import { StockCollaborationType } from './StockOptimizationTypes';

export interface StockCollaborationParticipant {
  participantId: string;
  type: string;
  role: string;
  permissions: string[];
  expertise: string[];
  availability: boolean;
  preferences: any;
}

export interface AIStockAgent {
  agentId: string;
  type: string;
  capabilities: string[];
  performance: any;
  learningStatus: any;
  interactions: any[];
}

export interface CollaborationSession {
  sessionId: string;
  type: string;
  participants: string[];
  startTime: Date;
  endTime?: Date;
  objectives: any[];
  outcomes: any[];
  activities: any[];
  metrics: any[];
}

export interface CollaborativeDecision {
  decisionId: string;
  type: string;
  context: any;
  participants: string[];
  options: any[];
  criteria: any[];
  evaluation: any;
  outcome: any;
  rationale: string[];
  timestamp: Date;
}

export interface CollaborativePlanning {
  planningId: string;
  scope: string;
  participants: string[];
  objectives: any[];
  constraints: any[];
  strategies: any[];
  timeline: any;
  resources: any[];
  risks: any[];
  outcomes: any[];
  status: string;
}

export interface CollaborativeForecasting {
  forecastingId: string;
  type: string;
  participants: string[];
  methods: any[];
  inputs: any[];
  assumptions: any[];
  scenarios: any[];
  results: any[];
  consensus: any;
  confidence: number;
}

export interface CollaborativeOptimization {
  optimizationId: string;
  type: string;
  participants: string[];
  objectives: any[];
  constraints: any[];
  solutions: any[];
  evaluation: any;
  consensus: any;
  implementation: any;
}

export interface CollaborativeReview {
  reviewId: string;
  type: string;
  participants: string[];
  subject: any;
  criteria: any[];
  feedback: any[];
  rating: number;
  recommendations: any[];
}

export interface CollaborativeApproval {
  approvalId: string;
  type: string;
  subject: any;
  approvers: string[];
  criteria: any[];
  status: string;
  comments: string[];
  timestamp: Date;
}

export interface CollaborationFeedback {
  feedbackId: string;
  type: string;
  sender: string;
  recipient: string;
  content: any;
  context: any;
  rating: number;
  timestamp: Date;
}

export interface CollaborationConsensus {
  consensusId: string;
  topic: string;
  participants: string[];
  positions: any[];
  discussions: any[];
  agreement: any;
  process: any;
  timestamp: Date;
}

export interface CollaborationConflict {
  conflictId: string;
  type: string;
  parties: string[];
  issue: any;
  impact: any;
  status: string;
  resolution?: any;
}

export interface ConflictResolution {
  resolutionId: string;
  conflictId: string;
  method: string;
  facilitator: string;
  process: any[];
  outcome: any;
  agreement: any;
  acceptance: any[];
}

export interface SharedKnowledge {
  knowledgeId: string;
  type: string;
  source: string;
  content: any;
  context: any;
  usage: any[];
  validation: any;
}

export interface CollaborativeLearning {
  learningId: string;
  participants: string[];
  objectives: any[];
  activities: any[];
  progress: any;
  assessment: any;
  outcomes: any[];
  feedback: any[];
}

export interface CollaborationTool {
  toolId: string;
  type: string;
  purpose: string;
  features: any[];
  access: any[];
  usage: any;
  performance: any;
}

export interface CollaborativeWorkspace {
  workspaceId: string;
  type: string;
  participants: string[];
  resources: any[];
  tools: any[];
  activities: any[];
  status: string;
}

export interface CollaborationCommunication {
  communicationId: string;
  type: string;
  channels: any[];
  participants: string[];
  messages: any[];
  attachments: any[];
  interactions: any[];
  effectiveness: any;
}

export interface CollaborationCoordination {
  coordinationId: string;
  type: string;
  participants: string[];
  mechanisms: any[];
  activities: any[];
  dependencies: any[];
  performance: any;
}

export interface CollaborationEffectiveness {
  effectivenessId: string;
  metrics: any[];
  evaluations: any[];
  analysis: any;
  trends: any[];
  improvements: any[];
}

export interface CollaborationSatisfaction {
  satisfactionId: string;
  participants: string[];
  metrics: any[];
  surveys: any[];
  feedback: any[];
  trends: any[];
  improvements: any[];
}

export interface CollaborationOutcome {
  outcomeId: string;
  type: string;
  participants: string[];
  objectives: any[];
  results: any;
  impact: any;
  evaluation: any;
  lessons: any[];
}
