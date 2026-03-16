import { logger } from '../../../utils/logger';
import { CacheService } from '../../../services/CacheService';
import { 
  DemandForecast, 
  ForecastMethod, 
  DemandPattern, 
  DemandForecastPoint,
  ModelMetrics,
  SeasonalityInfo,
  TrendInfo,
  ExternalFactor
} from '@industry5-erp/shared';

export interface ForecastingInput {
  productId: string;
  historicalData: HistoricalDataPoint[];
  forecastHorizon: number;
  method?: ForecastMethod;
  externalFactors?: ExternalFactor[];
  seasonalityPeriod?: number;
}

export interface HistoricalDataPoint {
  date: Date;
  demand: number;
  context?: Record<string, any>;
}

export interface ModelConfig {
  method: ForecastMethod;
  parameters: Record<string, any>;
  weights?: Record<string, number>;
}

export class DemandForecastingEngine {
  private models: Map<ForecastMethod, any> = new Map();
  private ensembleWeights: Record<ForecastMethod, number> = {
    [ForecastMethod.ARIMA]: 0.2,
    [ForecastMethod.EXPONENTIAL_SMOOTHING]: 0.15,
    [ForecastMethod.LINEAR_REGRESSION]: 0.1,
    [ForecastMethod.NEURAL_NETWORK]: 0.25,
    [ForecastMethod.RANDOM_FOREST]: 0.2,
    [ForecastMethod.LSTM]: 0.3,
    [ForecastMethod.PROPHET]: 0.25,
    [ForecastMethod.ENSEMBLE]: 1.0
  };

  constructor() {
    this.initializeModels();
  }

  private initializeModels(): void {
    // Initialize different forecasting models
    // In production, these would be actual ML models
    logger.info('Initializing demand forecasting models...');
    
    this.models.set(ForecastMethod.ARIMA, new ARIMAModel());
    this.models.set(ForecastMethod.EXPONENTIAL_SMOOTHING, new ExponentialSmoothingModel());
    this.models.set(ForecastMethod.LINEAR_REGRESSION, new LinearRegressionModel());
    this.models.set(ForecastMethod.NEURAL_NETWORK, new NeuralNetworkModel());
    this.models.set(ForecastMethod.RANDOM_FOREST, new RandomForestModel());
    this.models.set(ForecastMethod.LSTM, new LSTMModel());
    this.models.set(ForecastMethod.PROPHET, new ProphetModel());

    logger.info('Demand forecasting models initialized successfully');
  }

  public async generateForecast(input: ForecastingInput): Promise<DemandForecast> {
    try {
      logger.info(`Generating demand forecast for product ${input.productId}`);

      // Analyze historical data patterns
      const patterns = await this.analyzeDataPatterns(input.historicalData);
      
      // Select best forecasting method if not specified
      const method = input.method || await this.selectBestMethod(input.historicalData, patterns);
      
      // Generate forecast using selected method
      let forecasts: DemandForecastPoint[];
      let modelMetrics: ModelMetrics;

      if (method === ForecastMethod.ENSEMBLE) {
        const ensembleResult = await this.generateEnsembleForecast(input);
        forecasts = ensembleResult.forecasts;
        modelMetrics = ensembleResult.metrics;
      } else {
        const singleResult = await this.generateSingleModelForecast(input, method);
        forecasts = singleResult.forecasts;
        modelMetrics = singleResult.metrics;
      }

      // Create demand forecast object
      const demandForecast: DemandForecast = {
        id: `forecast_${input.productId}_${Date.now()}`,
        productId: input.productId,
        productName: await this.getProductName(input.productId),
        forecastHorizon: input.forecastHorizon,
        method,
        accuracy: modelMetrics.mape > 0 ? Math.max(0, 100 - modelMetrics.mape) : 85,
        confidence: this.calculateConfidence(modelMetrics),
        demandPattern: patterns.primaryPattern,
        seasonality: patterns.seasonality,
        trend: patterns.trend,
        forecasts,
        actualDemand: input.historicalData.map(point => ({
          date: point.date,
          actualDemand: point.demand,
          variance: 0
        })),
        modelMetrics,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'ai-engine',
        version: 1,
        isActive: true,
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next day
      };

      // Cache the forecast
      await CacheService.set(
        `demand_forecast_${input.productId}`, 
        demandForecast, 
        3600 // 1 hour TTL
      );

      logger.info(`Demand forecast generated successfully for product ${input.productId}`);
      return demandForecast;

    } catch (error) {
      logger.error('Error generating demand forecast:', error);
      throw new Error(`Failed to generate demand forecast: ${error.message}`);
    }
  }

  private async analyzeDataPatterns(data: HistoricalDataPoint[]): Promise<{
    primaryPattern: DemandPattern;
    seasonality?: SeasonalityInfo;
    trend?: TrendInfo;
    stationarity: number;
    volatility: number;
  }> {
    const values = data.map(point => point.demand);
    
    // Analyze trend
    const trend = this.analyzeTrend(values);
    
    // Analyze seasonality
    const seasonality = await this.analyzeSeasonality(data);
    
    // Determine primary pattern
    const primaryPattern = this.determinePrimaryPattern(trend, seasonality, values);
    
    // Calculate stationarity and volatility
    const stationarity = this.calculateStationarity(values);
    const volatility = this.calculateVolatility(values);

    return {
      primaryPattern,
      seasonality,
      trend,
      stationarity,
      volatility
    };
  }

  private analyzeTrend(values: number[]): TrendInfo {
    const n = values.length;
    if (n < 3) {
      return {
        hasTrend: false,
        trendDirection: 'stable',
        trendStrength: 0,
        changePoints: []
      };
    }

    // Simple linear regression for trend detection
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      const x = i - xMean;
      const y = values[i] - yMean;
      numerator += x * y;
      denominator += x * x;
    }
    
    const slope = denominator !== 0 ? numerator / denominator : 0;
    const trendStrength = Math.abs(slope) / yMean;
    
    // Detect change points (simplified)
    const changePoints: Date[] = [];
    
    return {
      hasTrend: trendStrength > 0.01,
      trendDirection: slope > 0.01 ? 'up' : slope < -0.01 ? 'down' : 'stable',
      trendStrength,
      changePoints
    };
  }

  private async analyzeSeasonality(data: HistoricalDataPoint[]): Promise<SeasonalityInfo | undefined> {
    if (data.length < 14) return undefined; // Need at least 2 weeks of data

    // Test for different seasonal periods (daily, weekly, monthly)
    const testPeriods = [7, 30, 365]; // week, month, year
    let bestPeriod = 0;
    let bestStrength = 0;
    let bestIndices: number[] = [];

    for (const period of testPeriods) {
      if (data.length >= period * 2) {
        const { strength, indices } = this.testSeasonalPeriod(data, period);
        if (strength > bestStrength) {
          bestStrength = strength;
          bestPeriod = period;
          bestIndices = indices;
        }
      }
    }

    if (bestStrength < 0.1) return undefined; // No significant seasonality

    return {
      hasSeasonality: true,
      seasonLength: bestPeriod,
      seasonalIndices: bestIndices,
      seasonalStrength: bestStrength
    };
  }

  private testSeasonalPeriod(data: HistoricalDataPoint[], period: number): {
    strength: number;
    indices: number[];
  } {
    const values = data.map(point => point.demand);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calculate seasonal indices
    const seasonalSums = new Array(period).fill(0);
    const seasonalCounts = new Array(period).fill(0);
    
    for (let i = 0; i < values.length; i++) {
      const seasonIndex = i % period;
      seasonalSums[seasonIndex] += values[i];
      seasonalCounts[seasonIndex]++;
    }
    
    const seasonalMeans = seasonalSums.map((sum, i) => 
      seasonalCounts[i] > 0 ? sum / seasonalCounts[i] : mean
    );
    
    const seasonalIndices = seasonalMeans.map(meanVal => meanVal / mean);
    
    // Calculate seasonal strength (coefficient of variation of seasonal indices)
    const indicesMean = seasonalIndices.reduce((sum, val) => sum + val, 0) / period;
    const indicesVariance = seasonalIndices.reduce((sum, val) => 
      sum + Math.pow(val - indicesMean, 2), 0
    ) / period;
    
    const strength = Math.sqrt(indicesVariance) / indicesMean;
    
    return { strength, indices: seasonalIndices };
  }

  private determinePrimaryPattern(
    trend: TrendInfo, 
    seasonality?: SeasonalityInfo, 
    values?: number[]
  ): DemandPattern {
    if (seasonality?.hasSeasonality) {
      if (trend.hasTrend) {
        return DemandPattern.SEASONAL;
      }
      return DemandPattern.SEASONAL;
    }
    
    if (trend.hasTrend) {
      return DemandPattern.TRENDING;
    }
    
    if (values) {
      const cv = this.calculateCoefficientOfVariation(values);
      if (cv > 0.5) {
        return DemandPattern.IRREGULAR;
      }
      if (cv > 0.3) {
        return DemandPattern.LUMPY;
      }
    }
    
    return DemandPattern.STEADY;
  }

  private calculateStationarity(values: number[]): number {
    // Simplified stationarity test using rolling mean variance
    const windowSize = Math.min(10, Math.floor(values.length / 3));
    if (windowSize < 3) return 1;
    
    const rollingMeans: number[] = [];
    for (let i = 0; i <= values.length - windowSize; i++) {
      const window = values.slice(i, i + windowSize);
      const mean = window.reduce((sum, val) => sum + val, 0) / windowSize;
      rollingMeans.push(mean);
    }
    
    const meanOfMeans = rollingMeans.reduce((sum, val) => sum + val, 0) / rollingMeans.length;
    const variance = rollingMeans.reduce((sum, val) => 
      sum + Math.pow(val - meanOfMeans, 2), 0
    ) / rollingMeans.length;
    
    // Return inverse of coefficient of variation (higher = more stationary)
    return meanOfMeans > 0 ? 1 / (Math.sqrt(variance) / meanOfMeans + 0.01) : 0;
  }

  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < values.length; i++) {
      if (values[i-1] !== 0) {
        returns.push((values[i] - values[i-1]) / values[i-1]);
      }
    }
    
    if (returns.length === 0) return 0;
    
    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => 
      sum + Math.pow(ret - meanReturn, 2), 0
    ) / returns.length;
    
    return Math.sqrt(variance);
  }

  private calculateCoefficientOfVariation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => 
      sum + Math.pow(val - mean, 2), 0
    ) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return mean > 0 ? stdDev / mean : 0;
  }

  private async selectBestMethod(
    data: HistoricalDataPoint[], 
    patterns: any
  ): Promise<ForecastMethod> {
    // Select best method based on data characteristics
    const dataSize = data.length;
    const { primaryPattern, stationarity, volatility } = patterns;

    if (dataSize < 10) {
      return ForecastMethod.EXPONENTIAL_SMOOTHING;
    }

    if (primaryPattern === DemandPattern.SEASONAL && dataSize > 30) {
      return ForecastMethod.PROPHET;
    }

    if (volatility > 0.3 && dataSize > 50) {
      return ForecastMethod.LSTM;
    }

    if (stationarity > 0.7 && dataSize > 20) {
      return ForecastMethod.ARIMA;
    }

    if (dataSize > 100) {
      return ForecastMethod.ENSEMBLE;
    }

    return ForecastMethod.NEURAL_NETWORK;
  }

  private async generateSingleModelForecast(
    input: ForecastingInput, 
    method: ForecastMethod
  ): Promise<{ forecasts: DemandForecastPoint[]; metrics: ModelMetrics }> {
    const model = this.models.get(method);
    if (!model) {
      throw new Error(`Model not found for method: ${method}`);
    }

    const result = await model.forecast(input);
    return result;
  }

  private async generateEnsembleForecast(
    input: ForecastingInput
  ): Promise<{ forecasts: DemandForecastPoint[]; metrics: ModelMetrics }> {
    const methods = [
      ForecastMethod.ARIMA,
      ForecastMethod.EXPONENTIAL_SMOOTHING,
      ForecastMethod.NEURAL_NETWORK,
      ForecastMethod.RANDOM_FOREST,
      ForecastMethod.LSTM,
      ForecastMethod.PROPHET
    ];

    const results = await Promise.all(
      methods.map(async method => {
        const model = this.models.get(method);
        if (model) {
          try {
            return await model.forecast(input);
          } catch (error) {
            logger.warn(`Error in ${method} forecasting:`, error);
            return null;
          }
        }
        return null;
      })
    );

    const validResults = results.filter(result => result !== null);
    if (validResults.length === 0) {
      throw new Error('All ensemble models failed');
    }

    // Combine forecasts using weighted average
    const ensembleForecasts = this.combineForecasts(validResults, methods);
    const ensembleMetrics = this.combineMetrics(validResults);

    return {
      forecasts: ensembleForecasts,
      metrics: ensembleMetrics
    };
  }

  private combineForecasts(
    results: Array<{ forecasts: DemandForecastPoint[] }>,
    methods: ForecastMethod[]
  ): DemandForecastPoint[] {
    if (results.length === 0) return [];

    const forecastLength = results[0].forecasts.length;
    const combinedForecasts: DemandForecastPoint[] = [];

    for (let i = 0; i < forecastLength; i++) {
      let weightedSum = 0;
      let weightSum = 0;
      let weightedLowerBound = 0;
      let weightedUpperBound = 0;
      let weightedConfidence = 0;

      for (let j = 0; j < results.length; j++) {
        if (results[j].forecasts[i]) {
          const weight = this.ensembleWeights[methods[j]] || 0.1;
          const forecast = results[j].forecasts[i];
          
          weightedSum += forecast.predictedDemand * weight;
          weightedLowerBound += forecast.lowerBound * weight;
          weightedUpperBound += forecast.upperBound * weight;
          weightedConfidence += forecast.confidence * weight;
          weightSum += weight;
        }
      }

      if (weightSum > 0) {
        combinedForecasts.push({
          date: results[0].forecasts[i].date,
          predictedDemand: weightedSum / weightSum,
          lowerBound: weightedLowerBound / weightSum,
          upperBound: weightedUpperBound / weightSum,
          confidence: weightedConfidence / weightSum
        });
      }
    }

    return combinedForecasts;
  }

  private combineMetrics(results: Array<{ metrics: ModelMetrics }>): ModelMetrics {
    const metrics = results.map(result => result.metrics);
    
    return {
      mae: metrics.reduce((sum, m) => sum + m.mae, 0) / metrics.length,
      mape: metrics.reduce((sum, m) => sum + m.mape, 0) / metrics.length,
      rmse: Math.sqrt(metrics.reduce((sum, m) => sum + m.rmse * m.rmse, 0) / metrics.length),
      r2: metrics.reduce((sum, m) => sum + m.r2, 0) / metrics.length,
      trainingPeriod: metrics[0].trainingPeriod,
      validationPeriod: metrics[0].validationPeriod
    };
  }

  private calculateConfidence(metrics: ModelMetrics): number {
    // Calculate confidence based on model performance
    const accuracyScore = metrics.mape > 0 ? Math.max(0, 100 - metrics.mape) / 100 : 0.85;
    const r2Score = Math.max(0, metrics.r2);
    
    return Math.min(100, (accuracyScore * 0.6 + r2Score * 0.4) * 100);
  }

  private async getProductName(productId: string): Promise<string> {
    // In production, this would query the product database
    return `Product_${productId}`;
  }

  public async updateForecastAccuracy(
    forecastId: string, 
    actualDemand: number, 
    date: Date
  ): Promise<void> {
    try {
      // Update forecast accuracy with actual demand data
      // This would involve retraining models with new data
      logger.info(`Updating forecast accuracy for ${forecastId} with actual demand: ${actualDemand}`);
      
      // Implementation would involve:
      // 1. Storing actual vs predicted data
      // 2. Calculating new accuracy metrics
      // 3. Triggering model retraining if accuracy drops
      // 4. Updating ensemble weights based on individual model performance
      
    } catch (error) {
      logger.error('Error updating forecast accuracy:', error);
      throw error;
    }
  }
}

// Mock model implementations (in production, these would be actual ML models)
class ARIMAModel {
  async forecast(input: ForecastingInput) {
    // Simplified ARIMA implementation
    return this.generateMockForecast(input, 'ARIMA');
  }

  private generateMockForecast(input: ForecastingInput, modelName: string) {
    const forecasts: DemandForecastPoint[] = [];
    const lastValue = input.historicalData[input.historicalData.length - 1]?.demand || 100;
    
    for (let i = 0; i < input.forecastHorizon; i++) {
      const baseValue = lastValue * (1 + Math.random() * 0.1 - 0.05); // ±5% variation
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      
      forecasts.push({
        date,
        predictedDemand: baseValue,
        lowerBound: baseValue * 0.8,
        upperBound: baseValue * 1.2,
        confidence: 80 + Math.random() * 15
      });
    }

    return {
      forecasts,
      metrics: {
        mae: 10 + Math.random() * 5,
        mape: 15 + Math.random() * 10,
        rmse: 12 + Math.random() * 8,
        r2: 0.7 + Math.random() * 0.2,
        trainingPeriod: {
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          endDate: new Date()
        }
      }
    };
  }
}

class ExponentialSmoothingModel {
  async forecast(input: ForecastingInput) {
    return this.generateMockForecast(input, 'Exponential Smoothing');
  }

  private generateMockForecast(input: ForecastingInput, modelName: string) {
    // Similar implementation as ARIMA but with different characteristics
    const forecasts: DemandForecastPoint[] = [];
    const values = input.historicalData.map(d => d.demand);
    const trend = values.length > 1 ? (values[values.length - 1] - values[0]) / values.length : 0;
    
    for (let i = 0; i < input.forecastHorizon; i++) {
      const baseValue = values[values.length - 1] + trend * (i + 1);
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      
      forecasts.push({
        date,
        predictedDemand: Math.max(0, baseValue),
        lowerBound: Math.max(0, baseValue * 0.85),
        upperBound: baseValue * 1.15,
        confidence: 75 + Math.random() * 20
      });
    }

    return {
      forecasts,
      metrics: {
        mae: 8 + Math.random() * 4,
        mape: 12 + Math.random() * 8,
        rmse: 10 + Math.random() * 6,
        r2: 0.75 + Math.random() * 0.15,
        trainingPeriod: {
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          endDate: new Date()
        }
      }
    };
  }
}

// Additional model classes would be implemented similarly
class LinearRegressionModel {
  async forecast(input: ForecastingInput) {
    return new ARIMAModel().generateMockForecast(input, 'Linear Regression');
  }
}

class NeuralNetworkModel {
  async forecast(input: ForecastingInput) {
    return new ARIMAModel().generateMockForecast(input, 'Neural Network');
  }
}

class RandomForestModel {
  async forecast(input: ForecastingInput) {
    return new ARIMAModel().generateMockForecast(input, 'Random Forest');
  }
}

class LSTMModel {
  async forecast(input: ForecastingInput) {
    return new ARIMAModel().generateMockForecast(input, 'LSTM');
  }
}

class ProphetModel {
  async forecast(input: ForecastingInput) {
    return new ARIMAModel().generateMockForecast(input, 'Prophet');
  }
}
