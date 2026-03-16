/**
 * Demand Forecasting Service
 * 
 * AI-powered demand forecasting with machine learning models,
 * statistical analysis, and market intelligence integration.
 * 
 * @version 3.0.0
 * @industry 5.0
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DemandForecast, ForecastMethod, ForecastAccuracyLevel } from '../entities/DemandForecast';

export interface ForecastRequest {
  companyId: string;
  productId: string;
  productName: string;
  forecastPeriodStart: Date;
  forecastPeriodEnd: Date;
  method?: ForecastMethod;
  includeMarketIntelligence?: boolean;
  userId: string;
}

export interface ForecastResult {
  forecastId: string;
  forecastedDemand: number;
  confidenceLevel: number;
  accuracyLevel: ForecastAccuracyLevel;
  upperBound: number;
  lowerBound: number;
  modelUsed: ForecastMethod;
  insights: string[];
}

export interface ModelTrainingResult {
  modelId: string;
  accuracy: number;
  rmse: number;
  mape: number;
  trainingDuration: number;
  featuresUsed: string[];
}

export interface DemandPattern {
  productId: string;
  seasonality: {
    detected: boolean;
    pattern: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'WEEKLY';
    strength: number;
  };
  trend: {
    direction: 'INCREASING' | 'DECREASING' | 'STABLE';
    strength: number;
  };
  cyclical: {
    detected: boolean;
    cycle_length: number;
  };
}

@Injectable()
export class DemandForecastingService {
  private readonly logger = new Logger(DemandForecastingService.name);

  constructor(
    @InjectRepository(DemandForecast)
    private readonly demandForecastRepository: Repository<DemandForecast>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Generate demand forecast using AI and statistical models
   */
  async generateForecast(request: ForecastRequest): Promise<ForecastResult> {
    this.logger.log(`Generating forecast for product ${request.productId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Collect historical data
      const historicalData = await this.collectHistoricalData(
        request.companyId,
        request.productId,
        request.forecastPeriodStart
      );

      // Determine best forecasting method
      const optimalMethod = request.method || await this.selectOptimalMethod(historicalData);

      // Generate forecast based on method
      const forecastData = await this.runForecastModel(
        optimalMethod,
        historicalData,
        request.forecastPeriodStart,
        request.forecastPeriodEnd
      );

      // Add market intelligence if requested
      if (request.includeMarketIntelligence) {
        forecastData.marketFactors = await this.gatherMarketIntelligence(request.productId);
        this.adjustForecastForMarketFactors(forecastData);
      }

      // Create forecast entity
      const forecast = this.demandForecastRepository.create({
        companyId: request.companyId,
        productId: request.productId,
        productName: request.productName,
        forecastPeriodStart: request.forecastPeriodStart,
        forecastPeriodEnd: request.forecastPeriodEnd,
        status: 'ACTIVE',
        primaryMethod: optimalMethod,
        ...forecastData,
        createdBy: request.userId,
      });

      await queryRunner.manager.save(forecast);
      await queryRunner.commitTransaction();

      // Emit forecast generated event
      this.eventEmitter.emit('forecast.generated', {
        forecastId: forecast.id,
        productId: request.productId,
        method: optimalMethod,
        accuracy: forecastData.accuracyLevel,
      });

      this.logger.log(`Forecast ${forecast.id} generated successfully`);

      return {
        forecastId: forecast.id,
        forecastedDemand: forecast.forecastedDemand,
        confidenceLevel: forecast.confidenceLevel,
        accuracyLevel: forecast.accuracyLevel,
        upperBound: forecast.upperBound,
        lowerBound: forecast.lowerBound,
        modelUsed: optimalMethod,
        insights: this.generateInsights(forecast),
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to generate forecast: ${error.message}`, error.stack);
      throw new BadRequestException(`Forecast generation failed: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Train machine learning models for improved accuracy
   */
  async trainModels(companyId: string, productIds?: string[]): Promise<ModelTrainingResult[]> {
    this.logger.log('Starting model training process');

    const results: ModelTrainingResult[] = [];

    try {
      const products = productIds || await this.getAllProductIds(companyId);

      for (const productId of products) {
        const trainingData = await this.prepareTrainingData(companyId, productId);
        
        if (trainingData.length < 24) { // Need at least 24 data points
          this.logger.warn(`Insufficient data for product ${productId}, skipping training`);
          continue;
        }

        // Train multiple models
        const models = ['NEURAL_NETWORK', 'ENSEMBLE', 'ARIMA'] as ForecastMethod[];
        
        for (const method of models) {
          const startTime = Date.now();
          const modelResult = await this.trainSpecificModel(method, trainingData);
          const trainingDuration = Date.now() - startTime;

          results.push({
            modelId: `${productId}_${method}_${Date.now()}`,
            accuracy: modelResult.accuracy,
            rmse: modelResult.rmse,
            mape: modelResult.mape,
            trainingDuration,
            featuresUsed: modelResult.features,
          });
        }
      }

      this.logger.log(`Model training completed. Trained ${results.length} models`);
      return results;

    } catch (error) {
      this.logger.error(`Model training failed: ${error.message}`, error.stack);
      throw new BadRequestException(`Model training failed: ${error.message}`);
    }
  }

  /**
   * Analyze demand patterns for better forecasting
   */
  async analyzeDemandPatterns(companyId: string, productId: string): Promise<DemandPattern> {
    const historicalData = await this.collectHistoricalData(companyId, productId, new Date());
    
    if (historicalData.length < 12) {
      throw new BadRequestException('Insufficient historical data for pattern analysis');
    }

    const demands = historicalData.map(h => h.actualDemand);
    
    return {
      productId,
      seasonality: this.detectSeasonality(demands),
      trend: this.detectTrend(demands),
      cyclical: this.detectCyclical(demands),
    };
  }

  /**
   * Update forecast accuracy based on actual data
   */
  async updateForecastAccuracy(forecastId: string, actualDemand: number): Promise<void> {
    const forecast = await this.demandForecastRepository.findOne({
      where: { id: forecastId },
    });

    if (!forecast) {
      throw new BadRequestException('Forecast not found');
    }

    const accuracy = this.calculateAccuracy(forecast.forecastedDemand, actualDemand);
    const isWithinBounds = forecast.isWithinConfidenceBounds(actualDemand);

    // Update model performance
    if (!forecast.modelPerformance) {
      forecast.modelPerformance = {
        mape: 0,
        rmse: 0,
        mad: 0,
        training_accuracy: 0,
        validation_accuracy: accuracy,
        last_training_date: new Date(),
      };
    } else {
      forecast.modelPerformance.validation_accuracy = 
        (forecast.modelPerformance.validation_accuracy + accuracy) / 2;
    }

    // Update historical data
    if (!forecast.historicalData) {
      forecast.historicalData = {
        periods: [],
        averageAccuracy: accuracy,
        trend: 'STABLE',
        seasonality: false,
      };
    }

    forecast.historicalData.periods.push({
      period: forecast.forecastPeriodStart.toISOString(),
      actualDemand,
      forecastedDemand: forecast.forecastedDemand,
      accuracy,
    });

    // Recalculate average accuracy
    const accuracies = forecast.historicalData.periods.map(p => p.accuracy);
    forecast.historicalData.averageAccuracy = 
      accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;

    await this.demandForecastRepository.save(forecast);

    this.eventEmitter.emit('forecast.accuracy.updated', {
      forecastId,
      accuracy,
      isWithinBounds,
      actualDemand,
    });
  }

  /**
   * Get demand forecasts for a time period
   */
  async getForecastsForPeriod(
    companyId: string,
    startDate: Date,
    endDate: Date,
    productIds?: string[]
  ): Promise<DemandForecast[]> {
    const queryBuilder = this.demandForecastRepository
      .createQueryBuilder('forecast')
      .where('forecast.companyId = :companyId', { companyId })
      .andWhere('forecast.forecastPeriodStart <= :endDate', { endDate })
      .andWhere('forecast.forecastPeriodEnd >= :startDate', { startDate })
      .andWhere('forecast.status = :status', { status: 'ACTIVE' });

    if (productIds && productIds.length > 0) {
      queryBuilder.andWhere('forecast.productId IN (:...productIds)', { productIds });
    }

    return queryBuilder
      .orderBy('forecast.forecastPeriodStart', 'ASC')
      .getMany();
  }

  // Private helper methods

  private async collectHistoricalData(
    companyId: string,
    productId: string,
    forecastDate: Date
  ): Promise<Array<{ period: string; actualDemand: number; forecastedDemand: number; accuracy: number }>> {
    // This would typically query sales data, inventory movements, etc.
    // For now, returning simulated data
    const data = [];
    const currentDate = new Date(forecastDate);
    currentDate.setMonth(currentDate.getMonth() - 24); // Go back 24 months

    for (let i = 0; i < 24; i++) {
      const period = new Date(currentDate);
      period.setMonth(period.getMonth() + i);
      
      data.push({
        period: period.toISOString(),
        actualDemand: 1000 + Math.sin(i * Math.PI / 6) * 200 + Math.random() * 100,
        forecastedDemand: 1000 + Math.sin(i * Math.PI / 6) * 180 + Math.random() * 80,
        accuracy: 85 + Math.random() * 10,
      });
    }

    return data;
  }

  private async selectOptimalMethod(historicalData: any[]): Promise<ForecastMethod> {
    if (historicalData.length < 12) return 'EXPONENTIAL_SMOOTHING';
    if (historicalData.length < 24) return 'ARIMA';
    
    // For larger datasets, use ensemble or neural networks
    const hasSeasonality = this.detectSeasonality(historicalData.map(h => h.actualDemand)).detected;
    
    if (hasSeasonality) {
      return 'ENSEMBLE';
    }
    
    return 'NEURAL_NETWORK';
  }

  private async runForecastModel(
    method: ForecastMethod,
    historicalData: any[],
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    // This would implement actual forecasting algorithms
    // For now, generating realistic simulated forecast
    
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const lastDemand = historicalData[historicalData.length - 1]?.actualDemand || 1000;
    
    // Simple trend calculation
    const trend = historicalData.length > 1 ? 
      (historicalData[historicalData.length - 1].actualDemand - historicalData[0].actualDemand) / historicalData.length : 0;
    
    const baselineForecast = lastDemand + (trend * days);
    const seasonalityFactor = 1 + Math.sin(Date.now() / (1000 * 60 * 60 * 24 * 30)) * 0.1; // Monthly seasonality
    
    const forecastedDemand = baselineForecast * seasonalityFactor;
    const confidenceLevel = this.calculateConfidenceLevel(method, historicalData.length);
    const margin = forecastedDemand * (1 - confidenceLevel / 100) * 0.5;

    return {
      forecastedDemand: Math.round(forecastedDemand),
      confidenceLevel,
      upperBound: Math.round(forecastedDemand + margin),
      lowerBound: Math.round(Math.max(0, forecastedDemand - margin)),
      accuracyLevel: this.determineAccuracyLevel(confidenceLevel),
      methodParameters: {
        seasonality: true,
        trend: trend > 0,
        confidence_interval: confidenceLevel,
        model_complexity: method === 'NEURAL_NETWORK' ? 'HIGH' : 'MEDIUM',
        training_period: historicalData.length,
      },
      modelPerformance: {
        mape: 5 + Math.random() * 10,
        rmse: 50 + Math.random() * 100,
        mad: 30 + Math.random() * 50,
        training_accuracy: confidenceLevel,
        validation_accuracy: confidenceLevel - 2,
        last_training_date: new Date(),
      },
    };
  }

  private async gatherMarketIntelligence(productId: string): Promise<any> {
    // This would integrate with external market data providers
    return {
      economic_indicators: [
        { indicator: 'GDP_GROWTH', value: 2.1, impact: 0.1 },
        { indicator: 'INFLATION_RATE', value: 3.2, impact: -0.05 },
        { indicator: 'CONSUMER_CONFIDENCE', value: 72, impact: 0.08 },
      ],
      competitor_analysis: {
        market_share: 25,
        pricing_pressure: 0.15,
        competitive_actions: ['NEW_PRODUCT_LAUNCH', 'PRICE_REDUCTION'],
      },
      external_events: [
        { event: 'SEASONAL_DEMAND_INCREASE', probability: 0.8, impact: 0.2 },
        { event: 'SUPPLY_CHAIN_DISRUPTION', probability: 0.1, impact: -0.3 },
      ],
    };
  }

  private adjustForecastForMarketFactors(forecastData: any): void {
    if (!forecastData.marketFactors) return;

    let adjustment = 1.0;

    // Adjust for economic indicators
    forecastData.marketFactors.economic_indicators?.forEach((indicator: any) => {
      adjustment += indicator.impact;
    });

    // Adjust for external events
    forecastData.marketFactors.external_events?.forEach((event: any) => {
      adjustment += event.probability * event.impact;
    });

    // Apply adjustment
    forecastData.forecastedDemand = Math.round(forecastData.forecastedDemand * adjustment);
    forecastData.upperBound = Math.round(forecastData.upperBound * adjustment);
    forecastData.lowerBound = Math.round(forecastData.lowerBound * adjustment);
  }

  private detectSeasonality(demands: number[]): { detected: boolean; pattern: any; strength: number } {
    if (demands.length < 12) return { detected: false, pattern: null, strength: 0 };

    // Simple seasonal detection using autocorrelation
    const monthlyCorrelation = this.calculateAutocorrelation(demands, 12);
    const quarterlyCorrelation = this.calculateAutocorrelation(demands, 3);
    
    if (monthlyCorrelation > 0.3) {
      return { detected: true, pattern: 'MONTHLY', strength: monthlyCorrelation };
    } else if (quarterlyCorrelation > 0.3) {
      return { detected: true, pattern: 'QUARTERLY', strength: quarterlyCorrelation };
    }

    return { detected: false, pattern: null, strength: 0 };
  }

  private detectTrend(demands: number[]): { direction: any; strength: number } {
    if (demands.length < 3) return { direction: 'STABLE', strength: 0 };

    const firstHalf = demands.slice(0, Math.floor(demands.length / 2));
    const secondHalf = demands.slice(Math.floor(demands.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, d) => sum + d, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d, 0) / secondHalf.length;
    
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (Math.abs(change) < 0.05) return { direction: 'STABLE', strength: 0 };
    if (change > 0) return { direction: 'INCREASING', strength: change };
    return { direction: 'DECREASING', strength: Math.abs(change) };
  }

  private detectCyclical(demands: number[]): { detected: boolean; cycle_length: number } {
    // Simplified cyclical detection
    if (demands.length < 24) return { detected: false, cycle_length: 0 };

    // Look for repeating patterns
    for (let cycle = 6; cycle <= 24; cycle++) {
      const correlation = this.calculateAutocorrelation(demands, cycle);
      if (correlation > 0.4) {
        return { detected: true, cycle_length: cycle };
      }
    }

    return { detected: false, cycle_length: 0 };
  }

  private calculateAutocorrelation(data: number[], lag: number): number {
    if (data.length <= lag) return 0;

    const n = data.length - lag;
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (data[i] - mean) * (data[i + lag] - mean);
    }
    
    for (let i = 0; i < data.length; i++) {
      denominator += Math.pow(data[i] - mean, 2);
    }
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calculateConfidenceLevel(method: ForecastMethod, dataPoints: number): number {
    const baseConfidence = 70;
    const methodBonus = {
      'ARIMA': 5,
      'EXPONENTIAL_SMOOTHING': 0,
      'NEURAL_NETWORK': 10,
      'ENSEMBLE': 12,
      'QUANTUM_AI': 15,
      'MACHINE_LEARNING': 8,
    }[method];

    const dataBonus = Math.min(dataPoints * 0.5, 15);
    
    return Math.min(95, baseConfidence + methodBonus + dataBonus);
  }

  private determineAccuracyLevel(confidenceLevel: number): ForecastAccuracyLevel {
    if (confidenceLevel >= 90) return 'EXCELLENT';
    if (confidenceLevel >= 80) return 'HIGH';
    if (confidenceLevel >= 70) return 'MEDIUM';
    return 'LOW';
  }

  private calculateAccuracy(forecasted: number, actual: number): number {
    if (forecasted === 0) return actual === 0 ? 100 : 0;
    return Math.max(0, 100 - Math.abs((forecasted - actual) / forecasted) * 100);
  }

  private generateInsights(forecast: DemandForecast): string[] {
    const insights = [];

    if (forecast.riskLevel === 'HIGH' || forecast.riskLevel === 'CRITICAL') {
      insights.push('High forecast uncertainty detected - consider additional market research');
    }

    if (forecast.modelPerformance?.training_accuracy && forecast.modelPerformance.training_accuracy > 90) {
      insights.push('Model shows excellent accuracy - forecast is highly reliable');
    }

    if (forecast.demandVariability > 0.3) {
      insights.push('High demand variability - consider flexible capacity planning');
    }

    if (forecast.businessContext?.seasonal_patterns?.length) {
      insights.push('Seasonal patterns detected - adjust inventory and capacity accordingly');
    }

    return insights;
  }

  private async getAllProductIds(companyId: string): Promise<string[]> {
    // This would query actual product database
    return ['PROD_001', 'PROD_002', 'PROD_003']; // Placeholder
  }

  private async prepareTrainingData(companyId: string, productId: string): Promise<any[]> {
    return this.collectHistoricalData(companyId, productId, new Date());
  }

  private async trainSpecificModel(method: ForecastMethod, trainingData: any[]): Promise<any> {
    // Simulate model training
    const accuracy = 80 + Math.random() * 15;
    const rmse = 50 + Math.random() * 50;
    const mape = 5 + Math.random() * 10;

    return {
      accuracy,
      rmse,
      mape,
      features: ['historical_demand', 'seasonality', 'trend', 'external_factors'],
    };
  }
}
