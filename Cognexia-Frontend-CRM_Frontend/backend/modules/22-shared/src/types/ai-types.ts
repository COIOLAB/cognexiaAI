// ===========================================
// AI AND MACHINE LEARNING TYPES
// Industry 5.0 ERP Backend System
// ===========================================

// AI Engine placeholder types - these would be implemented with proper AI models
export interface NeuralNetworkConfig {
  layers: number[];
  activation: string;
  learningRate: number;
  epochs: number;
  batchSize: number;
}

export interface MachineLearningModel {
  modelId: string;
  algorithm: string;
  features: string[];
  target: string;
  accuracy: number;
  trainedAt: Date;
  parameters: Record<string, any>;
}

export interface PredictionResult {
  predictionId: string;
  modelUsed: string;
  inputFeatures: Record<string, any>;
  prediction: any;
  confidence: number;
  timestamp: Date;
}

export interface TrainingData {
  datasetId: string;
  features: Record<string, any>[];
  labels: any[];
  size: number;
  quality: number;
  lastUpdated: Date;
}

export interface ModelPerformance {
  modelId: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rmse?: number;
  mae?: number;
  evaluatedAt: Date;
}
