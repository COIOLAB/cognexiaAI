// ===========================================
// ROBOTICS AND AUTOMATION TYPES
// Industry 5.0 ERP Backend System
// ===========================================

export interface RobotConfiguration {
  robotId: string;
  robotType: string;
  capabilities: string[];
  actuators: string[];
  sensors: string[];
  batteryLevel: number;
  status: string;
  location: { x: number; y: number; z: number };
}

export interface RobotTask {
  taskId: string;
  robotId: string;
  taskType: string;
  priority: number;
  parameters: Record<string, any>;
  scheduledTime: Date;
  estimatedDuration: number;
  status: string;
}

export interface SwarmConfiguration {
  swarmId: string;
  robotIds: string[];
  coordinationAlgorithm: string;
  communicationProtocol: string;
  formation: string;
  objectives: string[];
}

export interface AutonomousAgent {
  agentId: string;
  agentType: string;
  decisionEngine: string;
  learningAlgorithm: string;
  knowledgeBase: Record<string, any>;
  autonomyLevel: number;
}
