import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Customer } from '../entities/customer.entity';
import { Lead } from '../entities/lead.entity';
import { Opportunity, OpportunityStage } from '../entities/opportunity.entity';
import { CustomerInteraction } from '../entities/customer-interaction.entity';
import { MarketingCampaign, CampaignType } from '../entities/marketing-campaign.entity';
import { AICustomerIntelligenceService } from './AICustomerIntelligenceService';
import { QuantumPersonalizationEngine } from './QuantumPersonalizationEngine';
import { LLMService } from './llm.service';

// --- Simplified Interfaces for Real Implementation ---

export interface MarketAnalysisScope {
  industry: string;
  region?: string;
  segment?: string;
}

export interface CompetitorAnalysisScope {
  focus: string; // e.g., 'global', 'specific_competitor'
  competitors?: string[];
}

export interface MarketTrendPredictionResult {
  predictionId: string;
  analysisScope: MarketAnalysisScope;
  predictionHorizon: number;
  
  // Real Data Aggregations
  salesTrend: Array<{ period: string; revenue: number; dealCount: number }>;
  topProducts: Array<{ product: string; revenue: number; quantity: number }>;
  winRateTrend: Array<{ period: string; winRate: number }>;
  
  // AI Generated Insights
  executiveSummary: string;
  emergingTrends: string[];
  strategicRecommendations: string[];
  
  generatedAt: Date;
}

export interface CompetitiveIntelligenceResult {
  intelligenceId: string;
  scope: CompetitorAnalysisScope;
  
  // Real Data Aggregations
  competitorStats: Array<{
    competitor: string;
    wins: number;
    losses: number;
    winRate: number;
    commonLossFactors: string[];
  }>;
  
  // AI Generated Insights
  swotAnalysis: string; // Textual SWOT analysis
  marketPositioning: string;
  
  generatedAt: Date;
}

@Injectable()
export class AdvancedPredictiveAnalyticsService {
  private readonly logger = new Logger(AdvancedPredictiveAnalyticsService.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    
    @InjectRepository(Opportunity)
    private readonly opportunityRepository: Repository<Opportunity>,
    
    @InjectRepository(CustomerInteraction)
    private readonly interactionRepository: Repository<CustomerInteraction>,

    @InjectRepository(MarketingCampaign)
    private readonly campaignRepository: Repository<MarketingCampaign>,
    
    private readonly aiIntelligenceService: AICustomerIntelligenceService,
    private readonly quantumPersonalizationEngine: QuantumPersonalizationEngine,
    private readonly llmService: LLMService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  /**
   * Predict campaign performance using historical data and LLM
   */
  async predictCampaignPerformance(params: {
    campaignType: CampaignType;
    budget: number;
    targetAudience: number;
    content: any;
    objectives: any;
  }): Promise<any> {
    try {
      // 1. Fetch historical campaigns of same type
      const historicalCampaigns = await this.campaignRepository.find({
        where: { type: params.campaignType },
        order: { createdAt: 'DESC' },
        take: 5
      });

      const historicalPerformance = historicalCampaigns.map(c => ({
        budget: c.budget,
        metrics: c.metrics,
        roi: typeof c.metrics?.roi === 'number' ? c.metrics.roi : 0
      }));

      // 2. Generate Prediction using LLM
      const prompt = `
        Predict the performance of a new marketing campaign.
        
        New Campaign Details:
        - Type: ${params.campaignType}
        - Budget: ${params.budget}
        - Target Audience Size: ${params.targetAudience}
        - Objectives: ${JSON.stringify(params.objectives)}
        
        Historical Benchmarks (Last 5 similar campaigns):
        ${JSON.stringify(historicalPerformance)}
        
        Estimate:
        1. Predicted Reach
        2. Predicted Conversions
        3. Predicted ROI
        4. Confidence Score (0-1)
        
        Return JSON with keys: "predictedReach", "predictedConversions", "predictedROI", "confidence".
      `;

      const completion = await this.llmService.generateCompletion(prompt);
      const jsonMatch = completion.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error("Failed to parse LLM prediction");

    } catch (error) {
      this.logger.error(`Campaign prediction failed: ${error.message}`);
      // Fallback
      return {
        predictedReach: params.targetAudience * 0.2,
        predictedConversions: params.targetAudience * 0.02,
        predictedROI: 1.5,
        confidence: 0.5
      };
    }
  }

  /**
   * Predict comprehensive market trends using internal sales data and LLM analysis
   */
  async predictMarketTrends(
    analysisScope: MarketAnalysisScope,
    predictionHorizon: number = 12 // months
  ): Promise<MarketTrendPredictionResult> {
    try {
      this.logger.log(`Predicting market trends for scope: ${analysisScope.industry}`);

      // 1. Gather Historical Data (Last 12 months for baseline)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12);

      const opportunities = await this.opportunityRepository.find({
        where: {
          expectedCloseDate: Between(startDate, endDate)
        }
      });

      // 2. Aggregate Sales Trends (Monthly)
      const salesTrendMap = new Map<string, { revenue: number; dealCount: number }>();
      const winRateMap = new Map<string, { won: number; total: number }>();

      opportunities.forEach(op => {
        const date = new Date(op.expectedCloseDate); // Or actualCloseDate if available
        const period = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        // Sales Trend
        if (op.stage === OpportunityStage.WON) {
          const current = salesTrendMap.get(period) || { revenue: 0, dealCount: 0 };
          salesTrendMap.set(period, {
            revenue: current.revenue + Number(op.value),
            dealCount: current.dealCount + 1
          });
        }

        // Win Rate Trend
        const currentWin = winRateMap.get(period) || { won: 0, total: 0 };
        currentWin.total += 1;
        if (op.stage === OpportunityStage.WON) {
          currentWin.won += 1;
        }
        winRateMap.set(period, currentWin);
      });

      const salesTrend = Array.from(salesTrendMap.entries())
        .map(([period, data]) => ({ period, ...data }))
        .sort((a, b) => a.period.localeCompare(b.period));

      const winRateTrend = Array.from(winRateMap.entries())
        .map(([period, data]) => ({ 
          period, 
          winRate: data.total > 0 ? (data.won / data.total) * 100 : 0 
        }))
        .sort((a, b) => a.period.localeCompare(b.period));

      // 3. Aggregate Top Products
      const productMap = new Map<string, { revenue: number; quantity: number }>();
      opportunities.forEach(op => {
        if (op.stage === OpportunityStage.WON && op.products?.items) {
          op.products.items.forEach(item => {
            const current = productMap.get(item.productName) || { revenue: 0, quantity: 0 };
            productMap.set(item.productName, {
              revenue: current.revenue + (item.totalPrice || 0),
              quantity: current.quantity + (item.quantity || 0)
            });
          });
        }
      });

      const topProducts = Array.from(productMap.entries())
        .map(([product, data]) => ({ product, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10); // Top 10

      // 4. Generate AI Insights using LLM
      const prompt = `
        Analyze the following internal sales data for the ${analysisScope.industry} industry context.
        
        Sales Trend (Last 12 Months):
        ${JSON.stringify(salesTrend)}

        Top Performing Products:
        ${JSON.stringify(topProducts)}

        Win Rate Trend:
        ${JSON.stringify(winRateTrend)}

        Based on this data, provide:
        1. An Executive Summary of the market performance.
        2. 3-5 Emerging Trends you detect from the product and sales velocity.
        3. 3-5 Strategic Recommendations for the next ${predictionHorizon} months.

        Return the response as a valid JSON object with keys: "executiveSummary" (string), "emergingTrends" (string array), "strategicRecommendations" (string array).
      `;

      let aiInsights = {
        executiveSummary: "Analysis unavailable.",
        emergingTrends: [],
        strategicRecommendations: []
      };

      try {
        const completion = await this.llmService.generateCompletion(prompt);
        // Attempt to extract JSON from potentially chatty response
        const jsonMatch = completion.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiInsights = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        this.logger.warn(`Failed to generate AI insights: ${e.message}`);
      }

      const result: MarketTrendPredictionResult = {
        predictionId: crypto.randomUUID(),
        analysisScope,
        predictionHorizon,
        salesTrend,
        topProducts,
        winRateTrend,
        executiveSummary: aiInsights.executiveSummary,
        emergingTrends: aiInsights.emergingTrends || [],
        strategicRecommendations: aiInsights.strategicRecommendations || [],
        generatedAt: new Date(),
      };

      // Emit prediction event
      this.eventEmitter.emit('market.trends.predicted', {
        predictionId: result.predictionId,
        result,
        timestamp: new Date(),
      });

      return result;

    } catch (error) {
      this.logger.error(`Error predicting market trends: ${error.message}`);
      throw error;
    }
  }

  /**
   * Advanced competitive intelligence analysis using Win/Loss data
   */
  async analyzeCompetitiveIntelligence(
    competitorScope: CompetitorAnalysisScope
  ): Promise<CompetitiveIntelligenceResult> {
    try {
      this.logger.log(`Analyzing competitive intelligence for: ${competitorScope.focus}`);

      // 1. Fetch Closed Opportunities (Won/Lost)
      const closedOps = await this.opportunityRepository.find({
        where: [
          { stage: OpportunityStage.WON },
          { stage: OpportunityStage.LOST }
        ]
      });

      // 2. Aggregate Competitor Stats
      const competitorStatsMap = new Map<string, { 
        wins: number; 
        losses: number; 
        lossFactors: Map<string, number> 
      }>();

      closedOps.forEach(op => {
        // Check competitive info
        const competitors = op.competitive?.mainCompetitors || [];
        
        // If we lost, and we know who we lost to (assuming it's in mainCompetitors for now, 
        // ideally we'd have a 'lostTo' field, but we'll use mainCompetitors as proxy for involved competitors)
        // For accurate analysis, we really need to know WHO won if we lost. 
        // Let's assume the first competitor in 'mainCompetitors' is the primary rival on this deal.
        
        if (competitors.length > 0) {
          const primaryRival = competitors[0];
          const stats = competitorStatsMap.get(primaryRival) || { wins: 0, losses: 0, lossFactors: new Map() };

          if (op.stage === OpportunityStage.WON) {
            stats.wins += 1;
          } else if (op.stage === OpportunityStage.LOST) {
            stats.losses += 1;
            // Aggregate loss factors
            op.competitive?.loseFactors?.forEach(factor => {
              stats.lossFactors.set(factor, (stats.lossFactors.get(factor) || 0) + 1);
            });
          }
          competitorStatsMap.set(primaryRival, stats);
        }
      });

      const competitorStats = Array.from(competitorStatsMap.entries())
        .map(([competitor, data]) => ({
          competitor,
          wins: data.wins,
          losses: data.losses,
          winRate: (data.wins + data.losses) > 0 ? (data.wins / (data.wins + data.losses)) * 100 : 0,
          commonLossFactors: Array.from(data.lossFactors.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([factor]) => factor)
        }))
        .sort((a, b) => b.losses - a.losses); // Focus on who we lose to most

      // 3. Generate AI Insights (SWOT)
      const prompt = `
        Analyze the following competitive win/loss data:
        ${JSON.stringify(competitorStats)}

        Perform a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) regarding our position against these competitors.
        Also provide a brief "Market Positioning" statement.

        Return JSON with keys: "swotAnalysis" (string, formatted text), "marketPositioning" (string).
      `;

      let aiInsights = {
        swotAnalysis: "Analysis unavailable.",
        marketPositioning: "Unavailable."
      };

      try {
        const completion = await this.llmService.generateCompletion(prompt);
        const jsonMatch = completion.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiInsights = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        this.logger.warn(`Failed to generate competitive insights: ${e.message}`);
      }

      const result: CompetitiveIntelligenceResult = {
        intelligenceId: crypto.randomUUID(),
        scope: competitorScope,
        competitorStats,
        swotAnalysis: aiInsights.swotAnalysis,
        marketPositioning: aiInsights.marketPositioning,
        generatedAt: new Date(),
      };

      return result;

    } catch (error) {
      this.logger.error(`Error analyzing competitive intelligence: ${error.message}`);
      throw error;
    }
  }
}
