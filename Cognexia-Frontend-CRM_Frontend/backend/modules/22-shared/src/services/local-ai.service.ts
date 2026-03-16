import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// TensorFlow is optional - will use fallback for Windows compatibility
let tf: any = null;
try {
  tf = require('@tensorflow/tfjs-node');
} catch (e) {
  // TensorFlow not available - will use fallback methods
}
import * as natural from 'natural';
import * as sentiment from 'sentiment';
import * as path from 'path';
import * as fs from 'fs';

export interface TextAnalysisResult {
  sentiment: {
    score: number;
    comparative: number;
    tokens: string[];
    words: string[];
    positive: string[];
    negative: string[];
  };
  keywords: string[];
  language: string;
  readability: {
    score: number;
    level: string;
  };
  classification?: {
    category: string;
    confidence: number;
  };
}

export interface PredictionResult {
  prediction: number | number[];
  confidence: number;
  metadata?: Record<string, any>;
}

export interface DataInsight {
  trend: 'increasing' | 'decreasing' | 'stable';
  forecast: number[];
  anomalies: Array<{ index: number; value: number; severity: number }>;
  patterns: string[];
  recommendations: string[];
}

@Injectable()
export class LocalAIService implements OnModuleInit {
  private readonly logger = new Logger(LocalAIService.name);
  private readonly sentimentAnalyzer: sentiment;
  private readonly stemmer: natural.PorterStemmer;
  private readonly tokenizer: natural.WordTokenizer;
  private models: Map<string, tf.LayersModel> = new Map();
  private readonly modelsPath: string;
  
  // Pre-trained classification categories
  private readonly textCategories = [
    'technical', 'business', 'finance', 'operations', 'support',
    'marketing', 'sales', 'hr', 'quality', 'maintenance',
    'inventory', 'procurement', 'production', 'planning'
  ];

  constructor(private readonly configService: ConfigService) {
    this.sentimentAnalyzer = new sentiment();
    this.stemmer = natural.PorterStemmer;
    this.tokenizer = new natural.WordTokenizer();
    this.modelsPath = this.configService.get<string>('AI_LOCAL_MODELS_PATH', './ai-models');
    
    // Configure TensorFlow.js backend if available
    if (tf) {
      try {
        tf.enableProdMode();
      } catch (e) {
        this.logger.warn('TensorFlow not available, using fallback AI methods');
      }
    }
  }

  async onModuleInit() {
    this.logger.log('Initializing Local AI Service...');
    await this.initializeModels();
    this.logger.log('Local AI Service initialized successfully');
  }

  /**
   * Initialize AI models
   */
  private async initializeModels(): Promise<void> {
    const modelsDir = path.resolve(process.cwd(), this.modelsPath);
    
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }

    // Create simple models for demonstration
    await this.createSimpleModels();
  }

  /**
   * Analyze text for sentiment, keywords, and classification
   */
  async analyzeText(text: string): Promise<TextAnalysisResult> {
    try {
      // Sentiment analysis
      const sentimentResult = this.sentimentAnalyzer.analyze(text);
      
      // Extract keywords using TF-IDF
      const keywords = this.extractKeywords(text);
      
      // Language detection (simplified)
      const language = this.detectLanguage(text);
      
      // Readability score
      const readability = this.calculateReadability(text);
      
      // Text classification
      const classification = await this.classifyText(text);
      
      return {
        sentiment: sentimentResult,
        keywords,
        language,
        readability,
        classification,
      };
    } catch (error) {
      this.logger.error('Error analyzing text:', error);
      throw new Error('Failed to analyze text');
    }
  }

  /**
   * Predict numerical values based on historical data
   */
  async predictValues(data: number[], horizon = 5): Promise<PredictionResult> {
    try {
      if (data.length < 3) {
        throw new Error('Insufficient data for prediction');
      }

      // Simple linear regression for demonstration
      const predictions = this.performLinearRegression(data, horizon);
      
      // Calculate confidence based on data variance
      const variance = this.calculateVariance(data);
      const confidence = Math.max(0.1, Math.min(0.9, 1 - (variance / Math.max(...data))));
      
      return {
        prediction: predictions,
        confidence,
        metadata: {
          method: 'linear_regression',
          dataPoints: data.length,
          variance: variance,
        },
      };
    } catch (error) {
      this.logger.error('Error predicting values:', error);
      throw new Error('Failed to predict values');
    }
  }

  /**
   * Analyze data patterns and generate insights
   */
  async analyzeDataInsights(data: number[], labels?: string[]): Promise<DataInsight> {
    try {
      // Trend analysis
      const trend = this.analyzeTrend(data);
      
      // Forecast next values
      const forecastResult = await this.predictValues(data, 5);
      const forecast = Array.isArray(forecastResult.prediction) 
        ? forecastResult.prediction 
        : [forecastResult.prediction];
      
      // Anomaly detection
      const anomalies = this.detectAnomalies(data);
      
      // Pattern recognition
      const patterns = this.identifyPatterns(data);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(trend, anomalies, patterns);
      
      return {
        trend,
        forecast,
        anomalies,
        patterns,
        recommendations,
      };
    } catch (error) {
      this.logger.error('Error analyzing data insights:', error);
      throw new Error('Failed to analyze data insights');
    }
  }

  /**
   * Generate smart recommendations based on data
   */
  async generateRecommendations(context: string, data: Record<string, any>): Promise<string[]> {
    const recommendations: string[] = [];
    
    // Context-based recommendations
    switch (context.toLowerCase()) {
      case 'inventory':
        recommendations.push(...this.generateInventoryRecommendations(data));
        break;
      case 'production':
        recommendations.push(...this.generateProductionRecommendations(data));
        break;
      case 'quality':
        recommendations.push(...this.generateQualityRecommendations(data));
        break;
      case 'maintenance':
        recommendations.push(...this.generateMaintenanceRecommendations(data));
        break;
      default:
        recommendations.push(...this.generateGeneralRecommendations(data));
    }
    
    return recommendations;
  }

  /**
   * Perform semantic similarity analysis
   */
  async calculateSimilarity(text1: string, text2: string): Promise<number> {
    try {
      const tokens1 = this.tokenizer.tokenize(text1.toLowerCase());
      const tokens2 = this.tokenizer.tokenize(text2.toLowerCase());
      
      if (!tokens1 || !tokens2) return 0;
      
      // Calculate Jaccard similarity
      const set1 = new Set(tokens1);
      const set2 = new Set(tokens2);
      
      const intersection = new Set([...set1].filter(x => set2.has(x)));
      const union = new Set([...set1, ...set2]);
      
      return intersection.size / union.size;
    } catch (error) {
      this.logger.error('Error calculating similarity:', error);
      return 0;
    }
  }

  /**
   * Extract key phrases from text
   */
  extractKeyPhrases(text: string, maxPhrases = 5): string[] {
    try {
      const sentences = text.split(/[.!?]+/);
      const phrases: { phrase: string; score: number }[] = [];
      
      for (const sentence of sentences) {
        const tokens = this.tokenizer.tokenize(sentence.toLowerCase());
        if (!tokens) continue;
        
        // Extract n-grams (2-3 words)
        for (let n = 2; n <= 3; n++) {
          for (let i = 0; i <= tokens.length - n; i++) {
            const phrase = tokens.slice(i, i + n).join(' ');
            const score = this.calculatePhraseScore(phrase, text);
            phrases.push({ phrase, score });
          }
        }
      }
      
      return phrases
        .sort((a, b) => b.score - a.score)
        .slice(0, maxPhrases)
        .map(p => p.phrase);
    } catch (error) {
      this.logger.error('Error extracting key phrases:', error);
      return [];
    }
  }

  /**
   * Classify customer feedback/tickets
   */
  async classifyFeedback(text: string): Promise<{ category: string; priority: string; confidence: number }> {
    try {
      const analysis = await this.analyzeText(text);
      
      // Determine category based on keywords
      let category = 'general';
      if (text.toLowerCase().includes('bug') || text.toLowerCase().includes('error')) {
        category = 'technical';
      } else if (text.toLowerCase().includes('feature') || text.toLowerCase().includes('improvement')) {
        category = 'enhancement';
      } else if (text.toLowerCase().includes('billing') || text.toLowerCase().includes('payment')) {
        category = 'billing';
      }
      
      // Determine priority based on sentiment and urgency keywords
      let priority = 'medium';
      const urgentWords = ['urgent', 'critical', 'immediately', 'asap', 'emergency'];
      const hasUrgentWords = urgentWords.some(word => text.toLowerCase().includes(word));
      
      if (analysis.sentiment.score < -2 || hasUrgentWords) {
        priority = 'high';
      } else if (analysis.sentiment.score > 2) {
        priority = 'low';
      }
      
      return {
        category,
        priority,
        confidence: Math.abs(analysis.sentiment.comparative) + 0.5,
      };
    } catch (error) {
      this.logger.error('Error classifying feedback:', error);
      return { category: 'general', priority: 'medium', confidence: 0.5 };
    }
  }

  // Private helper methods

  private async createSimpleModels(): Promise<void> {
    // Create a simple sequential model for demonstration
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [1], units: 10, activation: 'relu' }),
        tf.layers.dense({ units: 5, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'linear' })
      ]
    });
    
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });
    
    this.models.set('regression', model);
    this.logger.log('Created simple regression model');
  }

  private extractKeywords(text: string, maxKeywords = 10): string[] {
    try {
      const tokens = this.tokenizer.tokenize(text.toLowerCase());
      if (!tokens) return [];
      
      // Remove stop words and short words
      const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but']);
      const filteredTokens = tokens
        .filter(token => !stopWords.has(token) && token.length > 2)
        .map(token => this.stemmer.stem(token));
      
      // Calculate word frequency
      const frequency: Record<string, number> = {};
      filteredTokens.forEach(token => {
        frequency[token] = (frequency[token] || 0) + 1;
      });
      
      // Return top keywords
      return Object.entries(frequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, maxKeywords)
        .map(([word]) => word);
    } catch (error) {
      this.logger.error('Error extracting keywords:', error);
      return [];
    }
  }

  private detectLanguage(text: string): string {
    // Simplified language detection (English by default)
    const commonEnglishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    
    if (!tokens) return 'unknown';
    
    const englishWordCount = tokens.filter(token => commonEnglishWords.includes(token)).length;
    const ratio = englishWordCount / tokens.length;
    
    return ratio > 0.1 ? 'en' : 'unknown';
  }

  private calculateReadability(text: string): { score: number; level: string } {
    // Simplified Flesch Reading Ease calculation
    const sentences = text.split(/[.!?]+/).length;
    const words = this.tokenizer.tokenize(text)?.length || 0;
    const syllables = this.countSyllables(text);
    
    if (sentences === 0 || words === 0) {
      return { score: 0, level: 'Unknown' };
    }
    
    const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
    
    let level = 'College';
    if (score >= 90) level = 'Very Easy';
    else if (score >= 80) level = 'Easy';
    else if (score >= 70) level = 'Fairly Easy';
    else if (score >= 60) level = 'Standard';
    else if (score >= 50) level = 'Fairly Difficult';
    else if (score >= 30) level = 'Difficult';
    else level = 'Very Difficult';
    
    return { score: Math.max(0, Math.min(100, score)), level };
  }

  private countSyllables(text: string): number {
    const words = this.tokenizer.tokenize(text.toLowerCase()) || [];
    return words.reduce((total, word) => {
      const syllableCount = word.match(/[aeiouy]+/g)?.length || 1;
      return total + syllableCount;
    }, 0);
  }

  private async classifyText(text: string): Promise<{ category: string; confidence: number }> {
    const tokens = this.tokenizer.tokenize(text.toLowerCase()) || [];
    
    // Simple keyword-based classification
    const categoryScores: Record<string, number> = {};
    
    for (const category of this.textCategories) {
      categoryScores[category] = 0;
      
      // Check for category-specific keywords
      const keywords = this.getCategoryKeywords(category);
      for (const keyword of keywords) {
        if (tokens.includes(keyword)) {
          categoryScores[category] += 1;
        }
      }
    }
    
    const bestCategory = Object.entries(categoryScores)
      .sort(([, a], [, b]) => b - a)[0];
    
    return {
      category: bestCategory[0] || 'general',
      confidence: Math.min(0.9, bestCategory[1] / 10 + 0.1),
    };
  }

  private getCategoryKeywords(category: string): string[] {
    const keywords: Record<string, string[]> = {
      technical: ['system', 'software', 'code', 'bug', 'error', 'api', 'database'],
      business: ['revenue', 'profit', 'strategy', 'market', 'customer', 'business'],
      finance: ['budget', 'cost', 'expense', 'invoice', 'payment', 'financial'],
      operations: ['process', 'workflow', 'procedure', 'operation', 'efficiency'],
      support: ['help', 'issue', 'problem', 'question', 'support', 'assistance'],
      marketing: ['campaign', 'promotion', 'advertising', 'brand', 'marketing'],
      sales: ['deal', 'prospect', 'lead', 'quote', 'sales', 'revenue'],
      hr: ['employee', 'staff', 'training', 'recruitment', 'performance'],
      quality: ['quality', 'defect', 'inspection', 'standard', 'compliance'],
      maintenance: ['repair', 'maintenance', 'equipment', 'service', 'breakdown'],
      inventory: ['stock', 'inventory', 'warehouse', 'supply', 'shortage'],
      procurement: ['purchase', 'supplier', 'vendor', 'procurement', 'sourcing'],
      production: ['manufacturing', 'production', 'assembly', 'factory'],
      planning: ['schedule', 'plan', 'forecast', 'timeline', 'resource']
    };
    
    return keywords[category] || [];
  }

  private performLinearRegression(data: number[], horizon: number): number[] {
    const n = data.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = data.reduce((a, b) => a + b, 0);
    const sumXY = data.reduce((sum, y, x) => sum + (x + 1) * y, 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const predictions: number[] = [];
    for (let i = 1; i <= horizon; i++) {
      predictions.push(slope * (n + i) + intercept);
    }
    
    return predictions;
  }

  private calculateVariance(data: number[]): number {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const squaredDiffs = data.map(x => Math.pow(x - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / data.length;
  }

  private analyzeTrend(data: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (data.length < 2) return 'stable';
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (Math.abs(change) < 0.05) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
  }

  private detectAnomalies(data: number[]): Array<{ index: number; value: number; severity: number }> {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const std = Math.sqrt(this.calculateVariance(data));
    
    const anomalies: Array<{ index: number; value: number; severity: number }> = [];
    
    data.forEach((value, index) => {
      const zScore = Math.abs((value - mean) / std);
      if (zScore > 2) {
        anomalies.push({
          index,
          value,
          severity: Math.min(1, zScore / 4)
        });
      }
    });
    
    return anomalies;
  }

  private identifyPatterns(data: number[]): string[] {
    const patterns: string[] = [];
    
    // Check for cyclical patterns
    if (this.hasCyclicalPattern(data)) {
      patterns.push('cyclical');
    }
    
    // Check for seasonal patterns
    if (this.hasSeasonalPattern(data)) {
      patterns.push('seasonal');
    }
    
    // Check for step changes
    if (this.hasStepChanges(data)) {
      patterns.push('step_change');
    }
    
    return patterns;
  }

  private hasCyclicalPattern(data: number[]): boolean {
    // Simplified cyclical detection
    return data.length > 6 && this.calculateVariance(data) > 0;
  }

  private hasSeasonalPattern(data: number[]): boolean {
    // Check for repeating patterns (simplified)
    return data.length >= 12;
  }

  private hasStepChanges(data: number[]): boolean {
    // Check for sudden changes in level
    for (let i = 1; i < data.length; i++) {
      const change = Math.abs(data[i] - data[i - 1]);
      const avgChange = data.slice(0, i).reduce((a, b, idx, arr) => 
        idx > 0 ? a + Math.abs(arr[idx] - arr[idx - 1]) : a, 0
      ) / Math.max(1, i - 1);
      
      if (change > avgChange * 3) {
        return true;
      }
    }
    return false;
  }

  private generateRecommendations(
    trend: string,
    anomalies: Array<{ index: number; value: number; severity: number }>,
    patterns: string[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (trend === 'increasing') {
      recommendations.push('Consider scaling resources to handle growing demand');
    } else if (trend === 'decreasing') {
      recommendations.push('Investigate causes of declining performance');
      recommendations.push('Consider process improvements or resource reallocation');
    }
    
    if (anomalies.length > 0) {
      recommendations.push('Monitor anomalous values and investigate root causes');
      if (anomalies.some(a => a.severity > 0.7)) {
        recommendations.push('High-severity anomalies detected - immediate attention required');
      }
    }
    
    if (patterns.includes('cyclical')) {
      recommendations.push('Plan for cyclical variations in demand/performance');
    }
    
    if (patterns.includes('seasonal')) {
      recommendations.push('Implement seasonal forecasting and resource planning');
    }
    
    return recommendations;
  }

  private generateInventoryRecommendations(data: Record<string, any>): string[] {
    const recommendations: string[] = [];
    
    if (data.stockLevel && data.stockLevel < data.reorderPoint) {
      recommendations.push('Stock level below reorder point - initiate procurement');
    }
    
    if (data.turnoverRate && data.turnoverRate < 4) {
      recommendations.push('Low inventory turnover detected - consider demand planning review');
    }
    
    return recommendations;
  }

  private generateProductionRecommendations(data: Record<string, any>): string[] {
    const recommendations: string[] = [];
    
    if (data.efficiency && data.efficiency < 0.8) {
      recommendations.push('Production efficiency below target - investigate bottlenecks');
    }
    
    if (data.defectRate && data.defectRate > 0.05) {
      recommendations.push('High defect rate detected - review quality control processes');
    }
    
    return recommendations;
  }

  private generateQualityRecommendations(data: Record<string, any>): string[] {
    const recommendations: string[] = [];
    
    if (data.qualityScore && data.qualityScore < 85) {
      recommendations.push('Quality score below standard - implement corrective actions');
    }
    
    return recommendations;
  }

  private generateMaintenanceRecommendations(data: Record<string, any>): string[] {
    const recommendations: string[] = [];
    
    if (data.mtbf && data.mtbf < data.targetMTBF) {
      recommendations.push('Mean time between failures below target - review maintenance schedule');
    }
    
    return recommendations;
  }

  private generateGeneralRecommendations(data: Record<string, any>): string[] {
    return [
      'Monitor key performance indicators regularly',
      'Consider implementing automated alerts for threshold breaches',
      'Review and optimize current processes based on data insights'
    ];
  }

  private calculatePhraseScore(phrase: string, text: string): number {
    const frequency = (text.match(new RegExp(phrase, 'gi')) || []).length;
    const uniqueness = 1 / (phrase.split(' ').length);
    return frequency * uniqueness;
  }
}
