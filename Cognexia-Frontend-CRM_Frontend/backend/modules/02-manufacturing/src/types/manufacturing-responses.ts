export interface CollaborativeResponse {
  responseId: string;
  naturalLanguageResponse: string;
  confidence: number;
  actionableRecommendations: string[];
  visualResponses: any[];
}

export interface ConversationalSession {
  sessionId: string;
  startTime: Date;
  status: 'ACTIVE' | 'COMPLETED' | 'ERROR';
  context: Record<string, any>;
  history: ConversationHistory[];
}

export interface ConversationHistory {
  timestamp: Date;
  type: 'USER' | 'SYSTEM';
  message: string;
  metadata?: Record<string, any>;
}

export interface ExpertiseCaptureResult {
  captureId: string;
  expertiseType: string;
  capturedKnowledge: Record<string, any>;
  validationScore: number;
  status: 'VALIDATED' | 'PENDING_VALIDATION' | 'REJECTED';
}

export interface EdgeComputingResult {
  resultId: string;
  edgeNodeId: string;
  processingTime: string;
  decisionOutputs: string[];
  latency: number;
}

export interface FederatedLearningResult {
  roundId: string;
  participatingNodes: string[];
  modelAccuracy: number;
  convergenceStatus: 'CONVERGED' | 'IN_PROGRESS' | 'FAILED';
  metrics: {
    loss: number;
    accuracy: number;
    roundDuration: string;
  };
}

export interface EdgeComputingAnalytics {
  timestamp: Date;
  metrics: {
    averageLatency: number;
    throughput: number;
    resourceUtilization: number;
    errorRate: number;
    activeNodes: number;
  };
  nodeStatuses: Record<string, {
    status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
    lastHeartbeat: Date;
    performance: {
      cpu: number;
      memory: number;
      storage: number;
    };
  }>;
}

export interface ZeroTrustSecurityResult {
  resultId: string;
  accessDecision: 'GRANTED' | 'DENIED';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  continuousMonitoring: boolean;
  quantumSafety: boolean;
}

export interface ThreatDetectionResult {
  detectionId: string;
  detectedThreats: Array<{
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    timestamp: Date;
    affectedSystems: string[];
    remediation: string[];
  }>;
  systemStatus: 'SECURE' | 'AT_RISK' | 'COMPROMISED';
}

export interface CybersecurityAnalytics {
  timestamp: Date;
  overallSecurityScore: number;
  metrics: {
    threatsDetected: number;
    threatsBlocked: number;
    averageResponseTime: string;
    vulnerabilities: {
      high: number;
      medium: number;
      low: number;
    };
  };
  securityPosture: 'STRONG' | 'MODERATE' | 'WEAK';
  recommendations: string[];
}

export interface MetaverseExperienceResult {
  sessionId: string;
  experienceType: string;
  immersionLevel: string;
  participantsCount: number;
  realTimeDataStreams: number;
}

export interface ARMaintenanceResult {
  sessionId: string;
  taskType: string;
  completionStatus: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  metrics: {
    accuracy: number;
    completionTime: string;
    userConfidence: number;
  };
}

export interface VRTrainingResult {
  trainingId: string;
  type: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  performance: {
    score: number;
    completionTime: string;
    skillMastery: number;
  };
}

export interface MetaverseARVRAnalytics {
  timestamp: Date;
  experienceMetrics: {
    activeUsers: number;
    averageSessionDuration: string;
    userSatisfaction: number;
  };
  arMetrics: {
    tasksCompleted: number;
    averageAccuracy: number;
    devicePerformance: number;
  };
  vrMetrics: {
    trainingSessionsCompleted: number;
    skillRetention: number;
    immersionQuality: number;
  };
}
