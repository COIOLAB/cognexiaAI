import { AlertStatus } from './StockOptimizationTypes';

export interface StockAlertContext {
  contextId: string;
  stockId: string;
  triggeredBy: string;
  data: any;
  metrics: any[];
  thresholds: any[];
  analysis: any;
  timestamp: Date;
}

export interface AlertImpact {
  impactId: string;
  severity: string;
  scope: string;
  metrics: any[];
  costs: any;
  risks: any[];
  urgency: string;
}

export interface AlertRecommendation {
  recommendationId: string;
  type: string;
  description: string;
  priority: string;
  impact: any;
  cost: any;
  timeline: any;
  dependencies: any[];
}

export interface AlertAction {
  actionId: string;
  type: string;
  description: string;
  assignee: string;
  priority: string;
  deadline: Date;
  status: string;
  progress: number;
}

export interface AlertEscalation {
  escalationId: string;
  level: string;
  protocol: any;
  conditions: any[];
  contacts: string[];
  timeline: any[];
  status: string;
}

export interface AlertRecipient {
  recipientId: string;
  type: string;
  name: string;
  role: string;
  contact: any;
  preferences: any;
  acknowledgment?: any;
}

export interface NotificationChannel {
  channelId: string;
  type: string;
  name: string;
  config: any;
  status: string;
  metrics: any;
}

export interface AlertAcknowledgment {
  acknowledgmentId: string;
  by: string;
  role: string;
  timestamp: Date;
  notes: string;
  action: string;
}

export interface AlertResolution {
  resolutionId: string;
  by: string;
  timestamp: Date;
  solution: string;
  verification: any;
  effectiveness: any;
  feedback: any[];
}

export interface AlertPerformance {
  performanceId: string;
  responseTime: number;
  resolutionTime: number;
  effectiveness: number;
  metrics: any[];
  analysis: any;
}

export interface AlertLearning {
  learningId: string;
  insights: any[];
  patterns: any[];
  improvements: any[];
  recommendations: any[];
}

export interface AlertCollaboration {
  collaborationId: string;
  participants: string[];
  discussions: any[];
  decisions: any[];
  interactions: any[];
  outcomes: any;
}

export interface AlertHistory {
  historyId: string;
  alertId: string;
  type: string;
  actor: string;
  action: string;
  timestamp: Date;
  details: any;
  state: any;
}
