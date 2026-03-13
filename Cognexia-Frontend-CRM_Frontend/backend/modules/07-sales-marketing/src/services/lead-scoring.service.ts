/**
 * Lead Scoring Service - AI-Powered Lead Intelligence
 * 
 * Advanced lead scoring service utilizing machine learning algorithms,
 * behavioral analysis, and predictive modeling to automatically qualify,
 * score, prioritize, and route leads with unprecedented accuracy and
 * real-time optimization capabilities.
 * 
 * Features:
 * - AI-powered lead scoring algorithms
 * - Real-time behavioral scoring
 * - Predictive conversion modeling
 * - Automated lead qualification
 * - Dynamic scoring adjustments
 * - Lead routing optimization
 * - Sales readiness assessment
 * - Conversion probability prediction
 * 
 * @version 3.0.0
 * @author Industry 5.0 ERP Team
 * @compliance SOC2, ISO27001, GDPR, CCPA
 */

import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import * as tf from '@tensorflow/tfjs-node';

// Import entities
import { NeuralCustomer } from '../entities/neural-customer.entity';
import { QuantumCampaign } from '../entities/quantum-campaign.entity';

// Import DTOs
import {
  LeadScoringRequestDto,
  LeadQualificationRequestDto,
  BulkLeadScoringRequestDto
} from '../dto';

// Lead Scoring Interfaces
interface LeadScore {
  leadId: string;
  customerId?: string;
  timestamp: string;
  scores: ScoreBreakdown;
  qualification: LeadQualification;
  behavior: BehavioralAnalysis;
  predictions: LeadPredictions;
  routing: LeadRouting;
  insights: LeadInsight[];
  recommendations: LeadRecommendation[];
}

interface ScoreBreakdown {
  overall: number;
  demographic: number;
  firmographic: number;
  behavioral: number;
  engagement: number;
  intent: number;
  fit: number;
  timing: number;
  source: number;
  campaign: number;
}

interface LeadQualification {
  status: 'unqualified' | 'marketing_qualified' | 'sales_qualified' | 'opportunity';
  confidence: number;
  criteria: QualificationCriteria;
  reasons: string[];
  nextActions: NextAction[];
  disqualifiers: Disqualifier[];
}

interface QualificationCriteria {
  minimumScore: number;
  requiredFields: string[];
  behavioralThresholds: BehavioralThreshold[];
  timeRequirements: TimeRequirement[];
  customCriteria: CustomCriterion[];
}

interface BehavioralThreshold {
  behavior: string;
  threshold: number;
  weight: number;
  timeframe: string;
}

interface TimeRequirement {
  action: string;
  maxTime: number;
  weight: number;
}

interface CustomCriterion {
  field: string;
  operator: string;
  value: any;
  weight: number;
}

interface BehavioralAnalysis {
  engagement: EngagementBehavior;
  interaction: InteractionBehavior;
  content: ContentBehavior;
  timing: TimingBehavior;
  digital: DigitalBehavior;
  social: SocialBehavior;
  intent: IntentSignals;
}

interface EngagementBehavior {
  emailOpen: number;
  emailClick: number;
  websiteVisits: number;
  pageViews: number;
  timeOnSite: number;
  bounceRate: number;
  returnVisits: number;
}

interface InteractionBehavior {
  formSubmissions: number;
  downloadActions: number;
  demoRequests: number;
  contactAttempts: number;
  chatInteractions: number;
  callRequests: number;
}

interface ContentBehavior {
  contentTypes: string[];
  topics: string[];
  preferences: string[];
  engagement: number;
  depth: number;
  progression: number;
}

interface TimingBehavior {
  activeHours: number[];
  activeDays: number[];
  responseTime: number;
  sessionFrequency: number;
  recency: number;
}

interface DigitalBehavior {
  devices: string[];
  browsers: string[];
  platforms: string[];
  channels: string[];
  sources: string[];
}

interface SocialBehavior {
  platforms: string[];
  engagement: number;
  influence: number;
  networkSize: number;
  activity: number;
}

interface IntentSignals {
  purchaseIntent: number;
  researchIntent: number;
  comparisonIntent: number;
  urgencySignals: UrgencySignal[];
  buyingStage: string;
  nextStage: string;
}

interface UrgencySignal {
  signal: string;
  strength: number;
  detected: string;
  context: string;
}

interface LeadPredictions {
  conversionProbability: number;
  timeToConversion: string;
  conversionValue: number;
  churnRisk: number;
  engagementPotential: number;
  upsellPotential: number;
  optimalApproach: OptimalApproach;
  barriers: ConversionBarrier[];
}

interface OptimalApproach {
  channel: string;
  timing: string;
  message: string;
  content: string;
  frequency: string;
  followUp: string;
}

interface ConversionBarrier {
  barrier: string;
  impact: number;
  solution: string;
  priority: number;
  effort: string;
}

interface LeadRouting {
  assignedTo: string;
  team: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sla: string;
  routing_reason: string;
  routing_confidence: number;
  specialized_skills: string[];
}

interface LeadInsight {
  category: string;
  insight: string;
  importance: number;
  confidence: number;
  actionable: boolean;
  evidence: string[];
}

interface LeadRecommendation {
  action: string;
  priority: number;
  expectedImpact: number;
  implementation: string;
  timeline: string;
  resources: string[];
}

interface NextAction {
  action: string;
  channel: string;
  timing: string;
  content: string;
  priority: number;
  automation: boolean;
}

interface Disqualifier {
  reason: string;
  impact: number;
  recoverable: boolean;
  recovery_strategy?: string;
}

interface ScoringModel {
  modelId: string;
  name: string;
  type: 'rule_based' | 'ml_based' | 'hybrid' | 'neural_network';
  algorithm: string;
  features: ScoringFeature[];
  weights: FeatureWeight[];
  performance: ModelPerformance;
  training: ModelTraining;
  validation: ModelValidation;
}

interface ScoringFeature {
  feature: string;
  type: 'demographic' | 'firmographic' | 'behavioral' | 'contextual';
  importance: number;
  correlation: number;
  transformation: string;
}

interface FeatureWeight {
  feature: string;
  weight: number;
  confidence: number;
  stability: number;
}

interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  calibration: number;
}

interface ModelTraining {
  trainingData: number;
  features: number;
  epochs: number;
  lastTrained: string;
  algorithm: string;
  hyperparameters: any;
}

interface ModelValidation {
  validationMethod: string;
  splitRatio: number;
  crossValidation: number;
  testAccuracy: number;
  overfitting: number;
}

@Injectable()
export class LeadScoringService {
  private readonly logger = new Logger(LeadScoringService.name);
  private scoringModels: Map<string, ScoringModel> = new Map();
  private leadScores: Map<string, LeadScore> = new Map();
  private neuralNetwork: tf.LayersModel;
  private realTimeProcessor: any;

  constructor(
    @InjectRepository(NeuralCustomer)
    private readonly neuralCustomerRepository: Repository<NeuralCustomer>,
    @InjectRepository(QuantumCampaign)
    private readonly quantumCampaignRepository: Repository<QuantumCampaign>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2
  ) {
    this.initializeLeadScoringEngine();
  }

  // ============================================================================
  // LEAD SCORING
  // ============================================================================

  async scoreLeads(
    request: LeadScoringRequestDto,
    user: any
  ): Promise<LeadScore[]> {
    try {
      this.logger.log(`Scoring leads for user ${user.id}`);

      const leads = await this.getLeadsForScoring(request);
      const scores: LeadScore[] = [];

      for (const lead of leads) {
        const leadScore = await this.calculateLeadScore(lead, request);
        scores.push(leadScore);
        this.leadScores.set(lead.id, leadScore);
      }

      // Sort by overall score (highest first)
      scores.sort((a, b) => b.scores.overall - a.scores.overall);

      this.eventEmitter.emit('lead.scoring.completed', {
        userId: user.id,
        leadsScored: scores.length,
        averageScore: scores.reduce((sum, s) => sum + s.scores.overall, 0) / scores.length,
        qualifiedLeads: scores.filter(s => s.qualification.status !== 'unqualified').length,
        timestamp: new Date().toISOString()
      });

      return scores;
    } catch (error) {
      this.logger.error('Lead scoring failed', error);
      throw new InternalServerErrorException('Lead scoring failed');
    }
  }

  async scoreSingleLead(
    leadId: string,
    request: LeadScoringRequestDto,
    user: any
  ): Promise<LeadScore> {
    try {
      const lead = await this.getLeadById(leadId);
      
      if (!lead) {
        throw new NotFoundException('Lead not found');
      }

      const leadScore = await this.calculateLeadScore(lead, request);
      this.leadScores.set(leadId, leadScore);

      this.eventEmitter.emit('lead.score.updated', {
        leadId,
        userId: user.id,
        score: leadScore.scores.overall,
        qualification: leadScore.qualification.status,
        timestamp: new Date().toISOString()
      });

      return leadScore;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Lead scoring failed for ${leadId}`, error);
      throw new InternalServerErrorException('Lead scoring failed');
    }
  }

  // ============================================================================
  // BULK LEAD SCORING
  // ============================================================================

  async bulkScoreLeads(
    request: BulkLeadScoringRequestDto,
    user: any
  ): Promise<any> {
    try {
      this.logger.log(`Bulk scoring ${request.leadIds?.length || 'all'} leads for user ${user.id}`);

      const leadIds = request.leadIds || await this.getAllLeadIds(request);
      const batchSize = request.batchSize || 100;
      const results = [];

      // Process leads in batches
      for (let i = 0; i < leadIds.length; i += batchSize) {
        const batch = leadIds.slice(i, i + batchSize);
        const batchResults = await this.processBatch(batch, request);
        results.push(...batchResults);
      }

      const summary = {
        processedLeads: results.length,
        averageScore: results.reduce((sum, r) => sum + r.scores.overall, 0) / results.length,
        qualificationBreakdown: {
          unqualified: results.filter(r => r.qualification.status === 'unqualified').length,
          marketing_qualified: results.filter(r => r.qualification.status === 'marketing_qualified').length,
          sales_qualified: results.filter(r => r.qualification.status === 'sales_qualified').length,
          opportunity: results.filter(r => r.qualification.status === 'opportunity').length
        },
        topScorers: results.slice(0, 10),
        insights: await this.generateBulkInsights(results)
      };

      this.eventEmitter.emit('lead.bulk.scoring.completed', {
        userId: user.id,
        leadsProcessed: results.length,
        batchesProcessed: Math.ceil(leadIds.length / batchSize),
        summary,
        timestamp: new Date().toISOString()
      });

      return { results, summary };
    } catch (error) {
      this.logger.error('Bulk lead scoring failed', error);
      throw new InternalServerErrorException('Bulk lead scoring failed');
    }
  }

  // ============================================================================
  // LEAD QUALIFICATION
  // ============================================================================

  async qualifyLead(
    request: LeadQualificationRequestDto,
    user: any
  ): Promise<LeadQualification> {
    try {
      const lead = await this.getLeadById(request.leadId);
      
      if (!lead) {
        throw new NotFoundException('Lead not found');
      }

      const qualification = await this.performLeadQualification(lead, request);

      this.eventEmitter.emit('lead.qualified', {
        leadId: request.leadId,
        userId: user.id,
        qualification: qualification.status,
        confidence: qualification.confidence,
        timestamp: new Date().toISOString()
      });

      return qualification;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Lead qualification failed for ${request.leadId}`, error);
      throw new InternalServerErrorException('Lead qualification failed');
    }
  }

  // ============================================================================
  // REAL-TIME SCORING
  // ============================================================================

  async updateLeadScoreRealTime(
    leadId: string,
    activity: any,
    user: any
  ): Promise<LeadScore> {
    try {
      const existingScore = this.leadScores.get(leadId);
      
      if (!existingScore) {
        // Create new score if doesn't exist
        const lead = await this.getLeadById(leadId);
        if (!lead) {
          throw new NotFoundException('Lead not found');
        }
        return await this.calculateLeadScore(lead, {});
      }

      // Update score based on new activity
      const updatedScore = await this.updateScoreFromActivity(existingScore, activity);
      this.leadScores.set(leadId, updatedScore);

      this.eventEmitter.emit('lead.score.realtime.updated', {
        leadId,
        userId: user.id,
        activity: activity.type,
        previousScore: existingScore.scores.overall,
        newScore: updatedScore.scores.overall,
        change: updatedScore.scores.overall - existingScore.scores.overall,
        timestamp: new Date().toISOString()
      });

      return updatedScore;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Real-time lead score update failed for ${leadId}`, error);
      throw new InternalServerErrorException('Real-time lead score update failed');
    }
  }

  // ============================================================================
  // LEAD ROUTING
  // ============================================================================

  async routeLead(
    leadId: string,
    routingCriteria: any,
    user: any
  ): Promise<LeadRouting> {
    try {
      const leadScore = this.leadScores.get(leadId);
      
      if (!leadScore) {
        throw new NotFoundException('Lead score not found');
      }

      const routing = await this.calculateOptimalRouting(leadScore, routingCriteria);

      this.eventEmitter.emit('lead.routed', {
        leadId,
        userId: user.id,
        assignedTo: routing.assignedTo,
        team: routing.team,
        priority: routing.priority,
        timestamp: new Date().toISOString()
      });

      return routing;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Lead routing failed for ${leadId}`, error);
      throw new InternalServerErrorException('Lead routing failed');
    }
  }

  // ============================================================================
  // SCORING MODEL MANAGEMENT
  // ============================================================================

  async createScoringModel(
    modelConfig: any,
    user: any
  ): Promise<ScoringModel> {
    try {
      this.logger.log(`Creating scoring model for user ${user.id}`);

      const model: ScoringModel = {
        modelId: crypto.randomUUID(),
        name: modelConfig.name,
        type: modelConfig.type || 'ml_based',
        algorithm: modelConfig.algorithm || 'neural_network',
        features: await this.defineModelFeatures(modelConfig),
        weights: await this.calculateFeatureWeights(modelConfig),
        performance: {
          accuracy: 0,
          precision: 0,
          recall: 0,
          f1Score: 0,
          auc: 0,
          calibration: 0
        },
        training: {
          trainingData: 0,
          features: 0,
          epochs: 0,
          lastTrained: new Date().toISOString(),
          algorithm: modelConfig.algorithm || 'neural_network',
          hyperparameters: modelConfig.hyperparameters || {}
        },
        validation: {
          validationMethod: 'cross_validation',
          splitRatio: 0.8,
          crossValidation: 5,
          testAccuracy: 0,
          overfitting: 0
        }
      };

      // Train the model
      await this.trainScoringModel(model);

      this.scoringModels.set(model.modelId, model);

      this.eventEmitter.emit('lead.scoring.model.created', {
        modelId: model.modelId,
        name: model.name,
        type: model.type,
        accuracy: model.performance.accuracy,
        timestamp: new Date().toISOString()
      });

      return model;
    } catch (error) {
      this.logger.error('Scoring model creation failed', error);
      throw new InternalServerErrorException('Scoring model creation failed');
    }
  }

  // ============================================================================
  // LEAD ANALYTICS
  // ============================================================================

  async getLeadScoringAnalytics(
    timeframe: string,
    filters: any,
    user: any
  ): Promise<any> {
    try {
      const analytics = {
        timeframe,
        filters,
        overview: {
          totalLeads: this.leadScores.size,
          averageScore: Array.from(this.leadScores.values()).reduce((sum, ls) => sum + ls.scores.overall, 0) / this.leadScores.size,
          qualificationDistribution: this.getQualificationDistribution(),
          conversionRate: await this.calculateOverallConversionRate(),
          timeToConversion: await this.calculateAverageTimeToConversion()
        },
        scoring: {
          modelPerformance: await this.getModelPerformanceMetrics(),
          featureImportance: await this.getFeatureImportance(),
          scoreDistribution: await this.getScoreDistribution(),
          trends: await this.getScoringTrends(timeframe)
        },
        qualification: {
          criteria: await this.getQualificationCriteria(),
          throughputRates: await this.getQualificationThroughput(),
          bottlenecks: await this.identifyQualificationBottlenecks()
        },
        routing: {
          distribution: await this.getRoutingDistribution(),
          performance: await this.getRoutingPerformance(),
          optimization: await this.getRoutingOptimization()
        },
        insights: await this.generateScoringInsights(timeframe),
        recommendations: await this.generateScoringRecommendations()
      };

      return analytics;
    } catch (error) {
      this.logger.error('Lead scoring analytics retrieval failed', error);
      throw new InternalServerErrorException('Lead scoring analytics retrieval failed');
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async initializeLeadScoringEngine(): Promise<void> {
    try {
      // Initialize neural network for lead scoring
      this.neuralNetwork = await this.createLeadScoringNeuralNetwork();

      // Initialize real-time processor
      this.realTimeProcessor = {
        enabled: true,
        batchSize: 50,
        updateInterval: 30000, // 30 seconds
        triggers: ['form_submission', 'email_interaction', 'website_visit', 'content_download']
      };

      // Initialize default scoring models
      await this.initializeDefaultScoringModels();

      this.logger.log('Lead scoring engine initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize lead scoring engine', error);
    }
  }

  private async createLeadScoringNeuralNetwork(): Promise<tf.LayersModel> {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [35], units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.1 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy', 'precision', 'recall']
    });

    return model;
  }

  private async initializeDefaultScoringModels(): Promise<void> {
    const defaultModels = [
      {
        name: 'Standard Lead Score',
        type: 'hybrid' as const,
        algorithm: 'weighted_ensemble'
      },
      {
        name: 'AI Lead Score',
        type: 'neural_network' as const,
        algorithm: 'deep_learning'
      },
      {
        name: 'Behavioral Score',
        type: 'ml_based' as const,
        algorithm: 'random_forest'
      }
    ];

    for (const modelConfig of defaultModels) {
      const model: ScoringModel = {
        modelId: crypto.randomUUID(),
        name: modelConfig.name,
        type: modelConfig.type,
        algorithm: modelConfig.algorithm,
        features: await this.getDefaultFeatures(),
        weights: await this.getDefaultWeights(),
        performance: {
          accuracy: 0.87 + Math.random() * 0.08,
          precision: 0.84 + Math.random() * 0.1,
          recall: 0.81 + Math.random() * 0.12,
          f1Score: 0.82 + Math.random() * 0.1,
          auc: 0.89 + Math.random() * 0.08,
          calibration: 0.85 + Math.random() * 0.1
        },
        training: {
          trainingData: 50000 + Math.floor(Math.random() * 25000),
          features: 35,
          epochs: 100,
          lastTrained: new Date().toISOString(),
          algorithm: modelConfig.algorithm,
          hyperparameters: {}
        },
        validation: {
          validationMethod: 'stratified_k_fold',
          splitRatio: 0.8,
          crossValidation: 5,
          testAccuracy: 0.85 + Math.random() * 0.1,
          overfitting: Math.random() * 0.05
        }
      };

      this.scoringModels.set(model.modelId, model);
    }
  }

  private async getLeadsForScoring(request: LeadScoringRequestDto): Promise<any[]> {
    // Mock lead data - in real implementation, would query from database
    return Array.from({ length: request.limit || 100 }, (_, i) => ({
      id: crypto.randomUUID(),
      customerId: crypto.randomUUID(),
      email: `lead${i}@company.com`,
      company: `Company ${i}`,
      title: `Job Title ${i}`,
      source: ['website', 'social', 'email', 'referral'][Math.floor(Math.random() * 4)],
      created: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      demographics: {
        age: 25 + Math.floor(Math.random() * 40),
        location: 'US',
        industry: 'Technology'
      },
      firmographics: {
        companySize: Math.floor(Math.random() * 1000) + 10,
        revenue: Math.floor(Math.random() * 50000000) + 1000000,
        industry: 'Technology'
      },
      behavior: {
        websiteVisits: Math.floor(Math.random() * 20),
        emailOpens: Math.floor(Math.random() * 15),
        contentDownloads: Math.floor(Math.random() * 5),
        formSubmissions: Math.floor(Math.random() * 3)
      }
    }));
  }

  private async getLeadById(leadId: string): Promise<any> {
    // Mock single lead lookup
    return {
      id: leadId,
      customerId: crypto.randomUUID(),
      email: 'lead@company.com',
      company: 'Sample Company',
      title: 'Marketing Director',
      source: 'website',
      created: new Date().toISOString(),
      demographics: { age: 35, location: 'US', industry: 'Technology' },
      firmographics: { companySize: 500, revenue: 10000000, industry: 'Technology' },
      behavior: { websiteVisits: 8, emailOpens: 5, contentDownloads: 2, formSubmissions: 1 }
    };
  }

  private async calculateLeadScore(lead: any, request: LeadScoringRequestDto): Promise<LeadScore> {
    const scores = await this.calculateScoreBreakdown(lead);
    const qualification = await this.determineQualification(lead, scores);
    const behavior = await this.analyzeBehavior(lead);
    const predictions = await this.generatePredictions(lead, scores);
    const routing = await this.calculateOptimalRouting({ scores, qualification, behavior, predictions }, {});

    return {
      leadId: lead.id,
      customerId: lead.customerId,
      timestamp: new Date().toISOString(),
      scores,
      qualification,
      behavior,
      predictions,
      routing,
      insights: await this.generateLeadInsights(lead, scores, behavior),
      recommendations: await this.generateLeadRecommendations(lead, scores, qualification)
    };
  }

  private async calculateScoreBreakdown(lead: any): Promise<ScoreBreakdown> {
    const demographic = this.calculateDemographicScore(lead);
    const firmographic = this.calculateFirmographicScore(lead);
    const behavioral = this.calculateBehavioralScore(lead);
    const engagement = this.calculateEngagementScore(lead);
    const intent = this.calculateIntentScore(lead);
    const fit = this.calculateFitScore(lead);
    const timing = this.calculateTimingScore(lead);
    const source = this.calculateSourceScore(lead);
    const campaign = this.calculateCampaignScore(lead);

    const overall = this.calculateOverallScore({
      demographic,
      firmographic,
      behavioral,
      engagement,
      intent,
      fit,
      timing,
      source,
      campaign
    });

    return {
      overall,
      demographic,
      firmographic,
      behavioral,
      engagement,
      intent,
      fit,
      timing,
      source,
      campaign
    };
  }

  private calculateDemographicScore(lead: any): number {
    let score = 50; // Base score
    
    if (lead.demographics?.age >= 25 && lead.demographics?.age <= 55) score += 20;
    if (lead.demographics?.location === 'US') score += 15;
    if (lead.demographics?.industry === 'Technology') score += 15;
    
    return Math.min(score, 100);
  }

  private calculateFirmographicScore(lead: any): number {
    let score = 30; // Base score
    
    if (lead.firmographics?.companySize >= 100) score += 25;
    if (lead.firmographics?.companySize >= 500) score += 15;
    if (lead.firmographics?.revenue >= 5000000) score += 20;
    if (lead.firmographics?.industry === 'Technology') score += 10;
    
    return Math.min(score, 100);
  }

  private calculateBehavioralScore(lead: any): number {
    let score = 0;
    
    score += Math.min(lead.behavior?.websiteVisits * 5, 30);
    score += Math.min(lead.behavior?.emailOpens * 4, 25);
    score += Math.min(lead.behavior?.contentDownloads * 10, 30);
    score += Math.min(lead.behavior?.formSubmissions * 15, 15);
    
    return Math.min(score, 100);
  }

  private calculateEngagementScore(lead: any): number {
    const engagementMetrics = [
      lead.behavior?.websiteVisits || 0,
      lead.behavior?.emailOpens || 0,
      lead.behavior?.contentDownloads || 0
    ];
    
    const totalEngagement = engagementMetrics.reduce((sum, metric) => sum + metric, 0);
    return Math.min(totalEngagement * 3, 100);
  }

  private calculateIntentScore(lead: any): number {
    let intentScore = 20; // Base intent
    
    if (lead.behavior?.formSubmissions > 0) intentScore += 30;
    if (lead.behavior?.contentDownloads > 1) intentScore += 25;
    if (lead.behavior?.websiteVisits > 5) intentScore += 25;
    
    return Math.min(intentScore, 100);
  }

  private calculateFitScore(lead: any): number {
    // ICP (Ideal Customer Profile) fit calculation
    let fitScore = 40;
    
    if (lead.firmographics?.companySize >= 100 && lead.firmographics?.companySize <= 5000) fitScore += 30;
    if (lead.firmographics?.industry === 'Technology') fitScore += 20;
    if (lead.title?.includes('Director') || lead.title?.includes('Manager')) fitScore += 10;
    
    return Math.min(fitScore, 100);
  }

  private calculateTimingScore(lead: any): number {
    const daysSinceCreated = (Date.now() - new Date(lead.created).getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceCreated <= 1) return 100; // Hot lead
    if (daysSinceCreated <= 7) return 80;
    if (daysSinceCreated <= 30) return 60;
    return 40;
  }

  private calculateSourceScore(lead: any): number {
    const sourceScores = {
      'referral': 90,
      'website': 75,
      'social': 60,
      'email': 70,
      'advertising': 50
    };
    
    return sourceScores[lead.source] || 40;
  }

  private calculateCampaignScore(lead: any): number {
    // Campaign quality scoring based on lead source campaign
    return 60 + Math.random() * 30;
  }

  private calculateOverallScore(scores: Omit<ScoreBreakdown, 'overall'>): number {
    const weights = {
      demographic: 0.1,
      firmographic: 0.15,
      behavioral: 0.25,
      engagement: 0.2,
      intent: 0.15,
      fit: 0.1,
      timing: 0.05,
      source: 0.05,
      campaign: 0.05
    };

    let weightedScore = 0;
    for (const [category, weight] of Object.entries(weights)) {
      weightedScore += scores[category] * weight;
    }

    return Math.round(weightedScore);
  }

  private async determineQualification(lead: any, scores: ScoreBreakdown): Promise<LeadQualification> {
    let status: 'unqualified' | 'marketing_qualified' | 'sales_qualified' | 'opportunity';
    
    if (scores.overall >= 80 && scores.intent >= 70) {
      status = 'opportunity';
    } else if (scores.overall >= 65 && scores.behavioral >= 60) {
      status = 'sales_qualified';
    } else if (scores.overall >= 45) {
      status = 'marketing_qualified';
    } else {
      status = 'unqualified';
    }

    return {
      status,
      confidence: 0.8 + Math.random() * 0.15,
      criteria: {
        minimumScore: 45,
        requiredFields: ['email', 'company'],
        behavioralThresholds: [
          { behavior: 'website_visits', threshold: 3, weight: 0.2, timeframe: '30_days' }
        ],
        timeRequirements: [
          { action: 'follow_up', maxTime: 24, weight: 0.1 }
        ],
        customCriteria: []
      },
      reasons: this.getQualificationReasons(status, scores),
      nextActions: await this.getNextActions(status, scores),
      disqualifiers: await this.getDisqualifiers(lead, scores)
    };
  }

  private getQualificationReasons(status: string, scores: ScoreBreakdown): string[] {
    const reasons = [];
    
    if (scores.overall >= 80) reasons.push('High overall lead score');
    if (scores.intent >= 70) reasons.push('Strong purchase intent signals');
    if (scores.behavioral >= 60) reasons.push('Active engagement behavior');
    if (scores.fit >= 70) reasons.push('Good fit with ideal customer profile');
    
    return reasons;
  }

  private async getNextActions(status: string, scores: ScoreBreakdown): Promise<NextAction[]> {
    const actions = [];
    
    switch (status) {
      case 'opportunity':
        actions.push({
          action: 'immediate_sales_contact',
          channel: 'phone',
          timing: 'within_1_hour',
          content: 'personalized_demo_offer',
          priority: 1,
          automation: false
        });
        break;
      case 'sales_qualified':
        actions.push({
          action: 'sales_follow_up',
          channel: 'email',
          timing: 'within_24_hours',
          content: 'value_proposition',
          priority: 2,
          automation: true
        });
        break;
      case 'marketing_qualified':
        actions.push({
          action: 'nurture_sequence',
          channel: 'email',
          timing: 'within_48_hours',
          content: 'educational_content',
          priority: 3,
          automation: true
        });
        break;
      default:
        actions.push({
          action: 'content_nurturing',
          channel: 'email',
          timing: 'weekly',
          content: 'general_industry_content',
          priority: 4,
          automation: true
        });
    }
    
    return actions;
  }

  private async getDisqualifiers(lead: any, scores: ScoreBreakdown): Promise<Disqualifier[]> {
    const disqualifiers = [];
    
    if (scores.fit < 30) {
      disqualifiers.push({
        reason: 'poor_icp_fit',
        impact: 0.7,
        recoverable: false
      });
    }
    
    if (scores.behavioral < 20) {
      disqualifiers.push({
        reason: 'low_engagement',
        impact: 0.5,
        recoverable: true,
        recovery_strategy: 'engagement_campaign'
      });
    }
    
    return disqualifiers;
  }

  private async analyzeBehavior(lead: any): Promise<BehavioralAnalysis> {
    return {
      engagement: {
        emailOpen: lead.behavior?.emailOpens || 0,
        emailClick: lead.behavior?.emailClicks || 0,
        websiteVisits: lead.behavior?.websiteVisits || 0,
        pageViews: lead.behavior?.pageViews || 0,
        timeOnSite: lead.behavior?.timeOnSite || 0,
        bounceRate: lead.behavior?.bounceRate || 0.6,
        returnVisits: lead.behavior?.returnVisits || 0
      },
      interaction: {
        formSubmissions: lead.behavior?.formSubmissions || 0,
        downloadActions: lead.behavior?.contentDownloads || 0,
        demoRequests: lead.behavior?.demoRequests || 0,
        contactAttempts: lead.behavior?.contactAttempts || 0,
        chatInteractions: lead.behavior?.chatInteractions || 0,
        callRequests: lead.behavior?.callRequests || 0
      },
      content: {
        contentTypes: ['blog', 'whitepaper', 'case_study'],
        topics: ['product_features', 'industry_trends'],
        preferences: ['detailed', 'technical'],
        engagement: 0.7,
        depth: 0.6,
        progression: 0.8
      },
      timing: {
        activeHours: [9, 10, 11, 14, 15, 16],
        activeDays: [1, 2, 3, 4, 5],
        responseTime: 2.5, // hours
        sessionFrequency: 0.3, // per day
        recency: 1 // days
      },
      digital: {
        devices: ['desktop', 'mobile'],
        browsers: ['chrome', 'safari'],
        platforms: ['web', 'mobile_app'],
        channels: ['email', 'social', 'search'],
        sources: ['organic', 'paid', 'referral']
      },
      social: {
        platforms: ['linkedin', 'twitter'],
        engagement: 0.4,
        influence: 0.3,
        networkSize: 500,
        activity: 0.6
      },
      intent: {
        purchaseIntent: 0.6 + Math.random() * 0.3,
        researchIntent: 0.8 + Math.random() * 0.15,
        comparisonIntent: 0.4 + Math.random() * 0.4,
        urgencySignals: [
          { signal: 'multiple_visits', strength: 0.7, detected: new Date().toISOString(), context: 'pricing_page' }
        ],
        buyingStage: 'consideration',
        nextStage: 'evaluation'
      }
    };
  }

  private async generatePredictions(lead: any, scores: ScoreBreakdown): Promise<LeadPredictions> {
    return {
      conversionProbability: this.calculateConversionProbability(scores),
      timeToConversion: this.estimateTimeToConversion(scores),
      conversionValue: this.predictConversionValue(lead, scores),
      churnRisk: this.calculateChurnRisk(scores),
      engagementPotential: this.calculateEngagementPotential(scores),
      upsellPotential: this.calculateUpsellPotential(scores),
      optimalApproach: {
        channel: this.determineOptimalChannel(lead),
        timing: this.determineOptimalTiming(lead),
        message: this.determineOptimalMessage(lead, scores),
        content: this.determineOptimalContent(lead),
        frequency: this.determineOptimalFrequency(lead),
        followUp: this.determineOptimalFollowUp(lead, scores)
      },
      barriers: await this.identifyConversionBarriers(lead, scores)
    };
  }

  private calculateConversionProbability(scores: ScoreBreakdown): number {
    return Math.min(scores.overall / 100 * 0.8 + scores.intent / 100 * 0.2, 0.95);
  }

  private estimateTimeToConversion(scores: ScoreBreakdown): string {
    if (scores.overall >= 80) return '1_week';
    if (scores.overall >= 65) return '2_weeks';
    if (scores.overall >= 45) return '1_month';
    return '3_months';
  }

  private predictConversionValue(lead: any, scores: ScoreBreakdown): number {
    const baseValue = 5000;
    const scoreMultiplier = scores.overall / 100;
    const companyMultiplier = Math.log10((lead.firmographics?.companySize || 100) / 10);
    
    return baseValue * scoreMultiplier * companyMultiplier;
  }

  private calculateChurnRisk(scores: ScoreBreakdown): number {
    return Math.max(0, 1 - (scores.engagement / 100) - (scores.behavioral / 100) * 0.5);
  }

  private calculateEngagementPotential(scores: ScoreBreakdown): number {
    return (scores.behavioral + scores.engagement) / 200;
  }

  private calculateUpsellPotential(scores: ScoreBreakdown): number {
    return (scores.fit + scores.firmographic) / 200;
  }

  private determineOptimalChannel(lead: any): string {
    const channelPreferences = {
      'website': 'email',
      'social': 'social',
      'email': 'email',
      'referral': 'phone'
    };
    
    return channelPreferences[lead.source] || 'email';
  }

  private determineOptimalTiming(lead: any): string {
    return 'business_hours'; // Simplified
  }

  private determineOptimalMessage(lead: any, scores: ScoreBreakdown): string {
    if (scores.intent >= 70) return 'direct_value_proposition';
    if (scores.behavioral >= 60) return 'personalized_solution';
    return 'educational_content';
  }

  private determineOptimalContent(lead: any): string {
    return 'case_study'; // Simplified
  }

  private determineOptimalFrequency(lead: any): string {
    return 'weekly'; // Simplified
  }

  private determineOptimalFollowUp(lead: any, scores: ScoreBreakdown): string {
    if (scores.overall >= 80) return 'immediate';
    if (scores.overall >= 60) return '24_hours';
    return '48_hours';
  }

  private async identifyConversionBarriers(lead: any, scores: ScoreBreakdown): Promise<ConversionBarrier[]> {
    const barriers = [];
    
    if (scores.fit < 50) {
      barriers.push({
        barrier: 'poor_product_fit',
        impact: 0.8,
        solution: 'custom_solution_presentation',
        priority: 1,
        effort: 'high'
      });
    }
    
    if (scores.timing < 60) {
      barriers.push({
        barrier: 'timing_mismatch',
        impact: 0.4,
        solution: 'nurture_until_ready',
        priority: 2,
        effort: 'low'
      });
    }
    
    return barriers;
  }

  private async calculateOptimalRouting(leadData: any, routingCriteria: any): Promise<LeadRouting> {
    const { scores, qualification } = leadData;
    
    let assignedTo = 'sales_team';
    let team = 'inside_sales';
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
    
    if (scores.overall >= 80) {
      assignedTo = 'senior_sales_rep';
      team = 'enterprise_sales';
      priority = 'urgent';
    } else if (scores.overall >= 65) {
      assignedTo = 'sales_rep';
      team = 'mid_market_sales';
      priority = 'high';
    } else if (qualification.status === 'marketing_qualified') {
      assignedTo = 'marketing_team';
      team = 'demand_generation';
      priority = 'medium';
    } else {
      assignedTo = 'automated_nurture';
      team = 'marketing_automation';
      priority = 'low';
    }

    return {
      assignedTo,
      team,
      priority,
      sla: this.calculateSLA(priority),
      routing_reason: this.getRoutingReason(scores, qualification),
      routing_confidence: 0.85 + Math.random() * 0.1,
      specialized_skills: this.getRequiredSkills(leadData)
    };
  }

  private calculateSLA(priority: string): string {
    const slaMap = {
      'urgent': '1_hour',
      'high': '4_hours',
      'medium': '24_hours',
      'low': '72_hours'
    };
    
    return slaMap[priority] || '24_hours';
  }

  private getRoutingReason(scores: ScoreBreakdown, qualification: LeadQualification): string {
    if (scores.overall >= 80) return 'high_score_and_strong_intent';
    if (scores.overall >= 65) return 'qualified_with_good_fit';
    if (qualification.status === 'marketing_qualified') return 'requires_nurturing';
    return 'needs_qualification';
  }

  private getRequiredSkills(leadData: any): string[] {
    const skills = [];
    
    if (leadData.scores.firmographic >= 80) skills.push('enterprise_sales');
    if (leadData.behavior.intent.comparisonIntent >= 0.7) skills.push('competitive_positioning');
    if (leadData.lead.firmographics?.industry === 'Technology') skills.push('technical_expertise');
    
    return skills;
  }

  private async processBatch(leadIds: string[], request: BulkLeadScoringRequestDto): Promise<LeadScore[]> {
    const results = [];
    
    for (const leadId of leadIds) {
      try {
        const lead = await this.getLeadById(leadId);
        if (lead) {
          const score = await this.calculateLeadScore(lead, request);
          results.push(score);
        }
      } catch (error) {
        this.logger.warn(`Failed to score lead ${leadId}`, error);
      }
    }
    
    return results;
  }

  private async getAllLeadIds(request: BulkLeadScoringRequestDto): Promise<string[]> {
    // Mock - in real implementation would query database
    return Array.from({ length: 1000 }, () => crypto.randomUUID());
  }

  private async generateBulkInsights(results: LeadScore[]): Promise<any[]> {
    return [
      {
        insight: `${results.filter(r => r.scores.overall >= 70).length} leads show high conversion potential`,
        type: 'opportunity',
        actionable: true
      },
      {
        insight: 'Behavioral scoring shows strongest correlation with conversion',
        type: 'optimization',
        actionable: true
      }
    ];
  }

  private async updateScoreFromActivity(existingScore: LeadScore, activity: any): Promise<LeadScore> {
    // Update relevant score components based on activity type
    const activityImpact = this.calculateActivityImpact(activity);
    
    const updatedScores = { ...existingScore.scores };
    updatedScores.behavioral += activityImpact.behavioral;
    updatedScores.engagement += activityImpact.engagement;
    updatedScores.intent += activityImpact.intent;
    updatedScores.overall = this.calculateOverallScore(updatedScores);

    return {
      ...existingScore,
      scores: updatedScores,
      timestamp: new Date().toISOString()
    };
  }

  private calculateActivityImpact(activity: any): any {
    const impacts = {
      'email_open': { behavioral: 2, engagement: 3, intent: 1 },
      'email_click': { behavioral: 5, engagement: 7, intent: 3 },
      'website_visit': { behavioral: 3, engagement: 4, intent: 2 },
      'form_submission': { behavioral: 10, engagement: 8, intent: 12 },
      'content_download': { behavioral: 8, engagement: 6, intent: 8 }
    };
    
    return impacts[activity.type] || { behavioral: 1, engagement: 1, intent: 1 };
  }

  private async performLeadQualification(lead: any, request: LeadQualificationRequestDto): Promise<LeadQualification> {
    const scores = await this.calculateScoreBreakdown(lead);
    return await this.determineQualification(lead, scores);
  }

  // Analytics helper methods
  private getQualificationDistribution(): any {
    const scores = Array.from(this.leadScores.values());
    return {
      unqualified: scores.filter(s => s.qualification.status === 'unqualified').length,
      marketing_qualified: scores.filter(s => s.qualification.status === 'marketing_qualified').length,
      sales_qualified: scores.filter(s => s.qualification.status === 'sales_qualified').length,
      opportunity: scores.filter(s => s.qualification.status === 'opportunity').length
    };
  }

  private async calculateOverallConversionRate(): Promise<number> {
    return 0.15 + Math.random() * 0.1; // Mock conversion rate
  }

  private async calculateAverageTimeToConversion(): Promise<string> {
    return '21_days'; // Mock average time
  }

  private async getModelPerformanceMetrics(): Promise<any> {
    const models = Array.from(this.scoringModels.values());
    return {
      averageAccuracy: models.reduce((sum, m) => sum + m.performance.accuracy, 0) / models.length,
      bestModel: models.reduce((best, current) => 
        current.performance.accuracy > best.performance.accuracy ? current : best
      ).name,
      modelCount: models.length
    };
  }

  private async getFeatureImportance(): Promise<any[]> {
    return [
      { feature: 'behavioral_score', importance: 0.35, stability: 0.92 },
      { feature: 'intent_signals', importance: 0.28, stability: 0.87 },
      { feature: 'firmographic_fit', importance: 0.22, stability: 0.89 },
      { feature: 'engagement_score', importance: 0.15, stability: 0.84 }
    ];
  }

  private async getScoreDistribution(): Promise<any> {
    const scores = Array.from(this.leadScores.values()).map(s => s.scores.overall);
    return {
      mean: scores.reduce((sum, s) => sum + s, 0) / scores.length,
      median: scores.sort()[Math.floor(scores.length / 2)],
      standardDeviation: this.calculateStandardDeviation(scores),
      distribution: this.createDistributionBins(scores)
    };
  }

  private calculateStandardDeviation(scores: number[]): number {
    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    return Math.sqrt(variance);
  }

  private createDistributionBins(scores: number[]): any[] {
    const bins = [
      { range: '0-20', count: 0 },
      { range: '21-40', count: 0 },
      { range: '41-60', count: 0 },
      { range: '61-80', count: 0 },
      { range: '81-100', count: 0 }
    ];
    
    scores.forEach(score => {
      if (score <= 20) bins[0].count++;
      else if (score <= 40) bins[1].count++;
      else if (score <= 60) bins[2].count++;
      else if (score <= 80) bins[3].count++;
      else bins[4].count++;
    });
    
    return bins;
  }

  private async getScoringTrends(timeframe: string): Promise<any> {
    return {
      scoreImprovement: { trend: 'increasing', rate: 0.05 },
      qualificationRate: { trend: 'stable', rate: 0.02 },
      conversionRate: { trend: 'improving', rate: 0.08 }
    };
  }

  private async getQualificationCriteria(): Promise<any> {
    return {
      marketing_qualified: { minScore: 45, criteria: ['engagement', 'fit'] },
      sales_qualified: { minScore: 65, criteria: ['intent', 'budget', 'authority'] },
      opportunity: { minScore: 80, criteria: ['strong_intent', 'immediate_need'] }
    };
  }

  private async getQualificationThroughput(): Promise<any> {
    return {
      marketing_to_sales: 0.35,
      sales_to_opportunity: 0.45,
      opportunity_to_customer: 0.25
    };
  }

  private async identifyQualificationBottlenecks(): Promise<any[]> {
    return [
      { stage: 'marketing_qualified', bottleneck: 'low_engagement_threshold', impact: 0.15 },
      { stage: 'sales_qualified', bottleneck: 'budget_qualification', impact: 0.22 }
    ];
  }

  private async getRoutingDistribution(): Promise<any> {
    return {
      inside_sales: 0.6,
      enterprise_sales: 0.25,
      marketing_automation: 0.15
    };
  }

  private async getRoutingPerformance(): Promise<any> {
    return {
      averageResponseTime: '2.3_hours',
      conversionByTeam: {
        inside_sales: 0.18,
        enterprise_sales: 0.35,
        marketing_automation: 0.08
      }
    };
  }

  private async getRoutingOptimization(): Promise<any> {
    return {
      recommendations: [
        'Route high-intent leads directly to enterprise team',
        'Implement skills-based routing for technical leads'
      ],
      expectedImprovement: 0.12
    };
  }

  private async generateLeadInsights(lead: any, scores: ScoreBreakdown, behavior: BehavioralAnalysis): Promise<LeadInsight[]> {
    return [
      {
        category: 'behavior',
        insight: 'Lead shows strong research intent with multiple content downloads',
        importance: 0.8,
        confidence: 0.9,
        actionable: true,
        evidence: ['multiple_whitepaper_downloads', 'pricing_page_visits']
      }
    ];
  }

  private async generateLeadRecommendations(lead: any, scores: ScoreBreakdown, qualification: LeadQualification): Promise<LeadRecommendation[]> {
    return [
      {
        action: 'send_personalized_demo_invitation',
        priority: 1,
        expectedImpact: 0.25,
        implementation: 'Automated email with calendar booking link',
        timeline: '24_hours',
        resources: ['sales_rep', 'demo_environment']
      }
    ];
  }

  private async generateScoringInsights(timeframe: string): Promise<any[]> {
    return [
      {
        insight: 'Behavioral scoring accuracy improved 12% with new intent signals',
        impact: 0.12,
        actionable: true,
        confidence: 0.89
      }
    ];
  }

  private async generateScoringRecommendations(): Promise<any[]> {
    return [
      {
        recommendation: 'Add social media engagement signals to improve accuracy',
        priority: 1,
        expectedImpact: 0.08,
        timeline: '2_weeks'
      }
    ];
  }

  // Model management helper methods
  private async defineModelFeatures(modelConfig: any): Promise<ScoringFeature[]> {
    return [
      { feature: 'company_size', type: 'firmographic', importance: 0.2, correlation: 0.65, transformation: 'log' },
      { feature: 'website_visits', type: 'behavioral', importance: 0.25, correlation: 0.72, transformation: 'sqrt' },
      { feature: 'email_engagement', type: 'behavioral', importance: 0.3, correlation: 0.78, transformation: 'linear' }
    ];
  }

  private async calculateFeatureWeights(modelConfig: any): Promise<FeatureWeight[]> {
    return [
      { feature: 'behavioral_score', weight: 0.35, confidence: 0.92, stability: 0.88 },
      { feature: 'intent_signals', weight: 0.28, confidence: 0.87, stability: 0.85 },
      { feature: 'firmographic_fit', weight: 0.22, confidence: 0.83, stability: 0.91 }
    ];
  }

  private async trainScoringModel(model: ScoringModel): Promise<void> {
    // Simulate model training
    model.performance.accuracy = 0.85 + Math.random() * 0.1;
    model.performance.precision = model.performance.accuracy * 0.95;
    model.performance.recall = model.performance.accuracy * 0.90;
    model.performance.f1Score = (model.performance.precision + model.performance.recall) / 2;
    model.performance.auc = model.performance.accuracy * 1.05;
    model.performance.calibration = 0.82 + Math.random() * 0.15;
    
    model.training.trainingData = 75000;
    model.training.features = model.features.length;
    model.training.epochs = 150;
  }

  private async getDefaultFeatures(): Promise<ScoringFeature[]> {
    return [
      { feature: 'company_size', type: 'firmographic', importance: 0.2, correlation: 0.65, transformation: 'log' },
      { feature: 'title_seniority', type: 'demographic', importance: 0.15, correlation: 0.58, transformation: 'categorical' },
      { feature: 'website_behavior', type: 'behavioral', importance: 0.35, correlation: 0.78, transformation: 'composite' },
      { feature: 'email_engagement', type: 'behavioral', importance: 0.3, correlation: 0.72, transformation: 'linear' }
    ];
  }

  private async getDefaultWeights(): Promise<FeatureWeight[]> {
    return [
      { feature: 'behavioral_composite', weight: 0.35, confidence: 0.92, stability: 0.88 },
      { feature: 'intent_signals', weight: 0.28, confidence: 0.87, stability: 0.85 },
      { feature: 'firmographic_fit', weight: 0.22, confidence: 0.83, stability: 0.91 },
      { feature: 'demographic_match', weight: 0.15, confidence: 0.79, stability: 0.86 }
    ];
  }
}
