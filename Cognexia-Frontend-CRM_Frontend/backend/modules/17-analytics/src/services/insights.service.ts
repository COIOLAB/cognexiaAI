import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { BaseAnalyticsService } from './base-analytics.service';
import { AdvancedAnalyticsService } from './advanced-analytics.service';
import { AnomalyDetectionService } from './anomaly-detection.service';
import { DatasetService } from './dataset.service';
import { MLService } from './ml.service';
import {
  AnalyticsDataSource,
  AnalyticsDataset,
  AnalyticsDashboard,
  ProcessingStatus,
} from '../entities';
import {
  InsightGenerationConfigDto,
  InsightDto,
  AnalyticsApiResponse,
  InsightRecommendationDto,
  InsightTemplateDto,
} from '../dto';

/**
 * Insights Service
 * Provides automated insight generation, explanations, and recommendations
 */
@Injectable()
export class InsightsService extends BaseAnalyticsService {
  private readonly insightCache = new Map<string, any>();
  private readonly insightTemplates = new Map<string, any>();
  private readonly userPreferences = new Map<string, any>();
  private readonly insightHistory = new Map<string, any[]>();
  private readonly recommendationEngine = new Map<string, any>();

  constructor(
    entityManager: EntityManager,
    @InjectRepository(AnalyticsDataSource)
    private readonly dataSourceRepository: Repository<AnalyticsDataSource>,
    @InjectRepository(AnalyticsDataset)
    private readonly datasetRepository: Repository<AnalyticsDataset>,
    @InjectRepository(AnalyticsDashboard)
    private readonly dashboardRepository: Repository<AnalyticsDashboard>,
    private readonly advancedAnalyticsService: AdvancedAnalyticsService,
    private readonly anomalyDetectionService: AnomalyDetectionService,
    private readonly datasetService: DatasetService,
    private readonly mlService: MLService
  ) {
    super(entityManager);
    this.initializeInsightTemplates();
  }

  /**
   * Generate insights automatically from data
   */
  async generateInsights(
    configDto: InsightGenerationConfigDto,
    userId: string
  ): Promise<AnalyticsApiResponse<InsightDto[]>> {
    try {
      this.logOperation('GENERATE_INSIGHTS', 'InsightGeneration');

      // Validate DTO
      const validatedDto = await this.validateDto(configDto, InsightGenerationConfigDto);

      // Check cache first
      const cacheKey = this.generateCacheKey(validatedDto, userId);
      const cachedInsights = this.insightCache.get(cacheKey);
      if (cachedInsights && !validatedDto.forceRefresh) {
        return this.createResponse(cachedInsights, 'Insights retrieved from cache');
      }

      // Get data for analysis
      const analysisData = await this.getAnalysisData(validatedDto);

      // Generate insights using various methods
      const insights: InsightDto[] = [];

      // Statistical insights
      if (validatedDto.includeStatistical !== false) {
        const statisticalInsights = await this.generateStatisticalInsights(
          analysisData,
          validatedDto
        );
        insights.push(...statisticalInsights);
      }

      // Trend insights
      if (validatedDto.includeTrends !== false) {
        const trendInsights = await this.generateTrendInsights(
          analysisData,
          validatedDto
        );
        insights.push(...trendInsights);
      }

      // Anomaly insights
      if (validatedDto.includeAnomalies !== false) {
        const anomalyInsights = await this.generateAnomalyInsights(
          analysisData,
          validatedDto,
          userId
        );
        insights.push(...anomalyInsights);
      }

      // Correlation insights
      if (validatedDto.includeCorrelations !== false) {
        const correlationInsights = await this.generateCorrelationInsights(
          analysisData,
          validatedDto
        );
        insights.push(...correlationInsights);
      }

      // Pattern insights
      if (validatedDto.includePatterns !== false) {
        const patternInsights = await this.generatePatternInsights(
          analysisData,
          validatedDto
        );
        insights.push(...patternInsights);
      }

      // Forecast insights
      if (validatedDto.includeForecasts !== false) {
        const forecastInsights = await this.generateForecastInsights(
          analysisData,
          validatedDto,
          userId
        );
        insights.push(...forecastInsights);
      }

      // Sort insights by importance/confidence
      insights.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));

      // Limit results if specified
      const limitedInsights = validatedDto.maxInsights 
        ? insights.slice(0, validatedDto.maxInsights)
        : insights;

      // Cache results
      this.insightCache.set(cacheKey, limitedInsights);

      // Store in history
      this.storeInsightHistory(userId, limitedInsights);

      this.logOperation('GENERATE_INSIGHTS_SUCCESS', 'InsightGeneration');

      return this.createResponse(
        limitedInsights,
        `Generated ${limitedInsights.length} insights from the data`
      );
    } catch (error) {
      this.handleError(error, 'GENERATE_INSIGHTS');
    }
  }

  /**
   * Get insight explanations
   */
  async getInsightExplanation(
    insightId: string,
    userId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('GET_INSIGHT_EXPLANATION', 'InsightExplanation', insightId);

      // Find insight in history
      const insight = await this.findInsightById(insightId, userId);
      if (!insight) {
        throw new NotFoundException(`Insight with ID ${insightId} not found`);
      }

      // Generate detailed explanation
      const explanation = await this.generateDetailedExplanation(insight);

      this.logOperation('GET_INSIGHT_EXPLANATION_SUCCESS', 'InsightExplanation', insightId);

      return this.createResponse(
        explanation,
        'Insight explanation generated successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_INSIGHT_EXPLANATION');
    }
  }

  /**
   * Generate recommendations based on insights
   */
  async generateRecommendations(
    insightIds: string[],
    userId: string
  ): Promise<AnalyticsApiResponse<InsightRecommendationDto[]>> {
    try {
      this.logOperation('GENERATE_RECOMMENDATIONS', 'InsightRecommendation');

      const recommendations: InsightRecommendationDto[] = [];

      for (const insightId of insightIds) {
        const insight = await this.findInsightById(insightId, userId);
        if (!insight) continue;

        const insightRecommendations = await this.generateInsightRecommendations(
          insight,
          userId
        );
        recommendations.push(...insightRecommendations);
      }

      // Remove duplicates and rank recommendations
      const uniqueRecommendations = this.deduplicateRecommendations(recommendations);
      uniqueRecommendations.sort((a, b) => b.priority - a.priority);

      this.logOperation('GENERATE_RECOMMENDATIONS_SUCCESS', 'InsightRecommendation');

      return this.createResponse(
        uniqueRecommendations,
        `Generated ${uniqueRecommendations.length} recommendations`
      );
    } catch (error) {
      this.handleError(error, 'GENERATE_RECOMMENDATIONS');
    }
  }

  /**
   * Get insight history for user
   */
  async getInsightHistory(
    userId: string,
    limit: number = 50
  ): Promise<AnalyticsApiResponse<InsightDto[]>> {
    try {
      this.logOperation('GET_INSIGHT_HISTORY', 'InsightHistory', userId);

      const history = this.insightHistory.get(userId) || [];
      const limitedHistory = history
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);

      this.logOperation('GET_INSIGHT_HISTORY_SUCCESS', 'InsightHistory', userId);

      return this.createResponse(
        limitedHistory,
        `Retrieved ${limitedHistory.length} insights from history`
      );
    } catch (error) {
      this.handleError(error, 'GET_INSIGHT_HISTORY');
    }
  }

  /**
   * Create custom insight template
   */
  async createInsightTemplate(
    templateDto: InsightTemplateDto,
    userId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('CREATE_INSIGHT_TEMPLATE', 'InsightTemplate');

      // Validate DTO
      const validatedDto = await this.validateDto(templateDto, InsightTemplateDto);

      const template = {
        id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: validatedDto.name,
        description: validatedDto.description,
        type: validatedDto.type,
        query: validatedDto.query,
        conditions: validatedDto.conditions,
        outputFormat: validatedDto.outputFormat,
        priority: validatedDto.priority || 5,
        enabled: validatedDto.enabled !== false,
        createdBy: userId,
        createdAt: new Date(),
      };

      this.insightTemplates.set(template.id, template);

      this.logOperation('CREATE_INSIGHT_TEMPLATE_SUCCESS', 'InsightTemplate', template.id);

      return this.createResponse(
        {
          templateId: template.id,
          name: template.name,
          type: template.type,
          enabled: template.enabled,
        },
        'Insight template created successfully'
      );
    } catch (error) {
      this.handleError(error, 'CREATE_INSIGHT_TEMPLATE');
    }
  }

  /**
   * Get insight summary dashboard
   */
  async getInsightSummary(
    userId: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('GET_INSIGHT_SUMMARY', 'InsightSummary', userId);

      const history = this.insightHistory.get(userId) || [];
      
      // Filter by time range if provided
      let filteredHistory = history;
      if (timeRange) {
        filteredHistory = history.filter(insight => 
          insight.createdAt >= timeRange.start && insight.createdAt <= timeRange.end
        );
      }

      const summary = {
        totalInsights: filteredHistory.length,
        insightTypes: this.calculateInsightTypeDistribution(filteredHistory),
        confidenceDistribution: this.calculateConfidenceDistribution(filteredHistory),
        topCategories: this.calculateTopCategories(filteredHistory),
        trendAnalysis: this.calculateInsightTrends(filteredHistory),
        actionableInsights: filteredHistory.filter(i => i.actionable).length,
        averageConfidence: this.calculateAverageConfidence(filteredHistory),
        recentInsights: filteredHistory
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5),
        recommendationsSummary: await this.getRecommendationsSummary(userId),
      };

      this.logOperation('GET_INSIGHT_SUMMARY_SUCCESS', 'InsightSummary', userId);

      return this.createResponse(
        summary,
        'Insight summary retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_INSIGHT_SUMMARY');
    }
  }

  /**
   * Update user insight preferences
   */
  async updateInsightPreferences(
    preferences: Record<string, any>,
    userId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('UPDATE_INSIGHT_PREFERENCES', 'InsightPreferences', userId);

      // Merge with existing preferences
      const currentPreferences = this.userPreferences.get(userId) || {};
      const updatedPreferences = {
        ...currentPreferences,
        ...preferences,
        updatedAt: new Date(),
      };

      this.userPreferences.set(userId, updatedPreferences);

      this.logOperation('UPDATE_INSIGHT_PREFERENCES_SUCCESS', 'InsightPreferences', userId);

      return this.createResponse(
        updatedPreferences,
        'Insight preferences updated successfully'
      );
    } catch (error) {
      this.handleError(error, 'UPDATE_INSIGHT_PREFERENCES');
    }
  }

  /**
   * Search insights by query
   */
  async searchInsights(
    query: string,
    userId: string,
    limit: number = 20
  ): Promise<AnalyticsApiResponse<InsightDto[]>> {
    try {
      this.logOperation('SEARCH_INSIGHTS', 'InsightSearch', userId);

      const history = this.insightHistory.get(userId) || [];
      const queryLower = query.toLowerCase();

      // Simple text search across insight properties
      const matchingInsights = history.filter(insight =>
        insight.title.toLowerCase().includes(queryLower) ||
        insight.description.toLowerCase().includes(queryLower) ||
        insight.category?.toLowerCase().includes(queryLower) ||
        insight.type.toLowerCase().includes(queryLower)
      );

      // Sort by relevance and limit results
      const limitedResults = matchingInsights
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, limit);

      this.logOperation('SEARCH_INSIGHTS_SUCCESS', 'InsightSearch', userId);

      return this.createResponse(
        limitedResults,
        `Found ${limitedResults.length} insights matching the query`
      );
    } catch (error) {
      this.handleError(error, 'SEARCH_INSIGHTS');
    }
  }

  /**
   * Initialize default insight templates
   */
  private initializeInsightTemplates(): void {
    const defaultTemplates = [
      {
        id: 'trend_detection',
        name: 'Trend Detection',
        description: 'Detects upward, downward, or stable trends in time series data',
        type: 'trend',
        priority: 8,
        enabled: true,
      },
      {
        id: 'outlier_detection',
        name: 'Outlier Detection',
        description: 'Identifies statistical outliers and anomalies in data',
        type: 'anomaly',
        priority: 9,
        enabled: true,
      },
      {
        id: 'correlation_analysis',
        name: 'Correlation Analysis',
        description: 'Finds strong correlations between variables',
        type: 'correlation',
        priority: 7,
        enabled: true,
      },
      {
        id: 'performance_summary',
        name: 'Performance Summary',
        description: 'Summarizes key performance indicators and metrics',
        type: 'statistical',
        priority: 6,
        enabled: true,
      },
    ];

    defaultTemplates.forEach(template => {
      this.insightTemplates.set(template.id, {
        ...template,
        createdAt: new Date(),
        createdBy: 'system',
      });
    });
  }

  /**
   * Get analysis data based on configuration
   */
  private async getAnalysisData(config: InsightGenerationConfigDto): Promise<any[]> {
    if (config.datasetId) {
      const datasetData = await this.datasetService.getDatasetPreview(
        config.datasetId,
        'system',
        config.sampleSize || 1000
      );
      return datasetData.data;
    } else if (config.data) {
      return config.data;
    } else {
      throw new BadRequestException('Either datasetId or data must be provided');
    }
  }

  /**
   * Generate statistical insights
   */
  private async generateStatisticalInsights(
    data: any[],
    config: InsightGenerationConfigDto
  ): Promise<InsightDto[]> {
    const insights: InsightDto[] = [];
    const numericFields = this.getNumericFields(data);

    for (const field of numericFields) {
      const values = data.map(row => parseFloat(row[field])).filter(val => !isNaN(val));
      if (values.length === 0) continue;

      const stats = this.calculateBasicStatistics(values);
      
      // Generate insights based on statistical properties
      if (stats.coefficient_of_variation > 0.5) {
        insights.push({
          id: `stat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'statistical',
          category: 'variability',
          title: `High Variability in ${field}`,
          description: `The ${field} shows high variability (CV: ${(stats.coefficient_of_variation * 100).toFixed(1)}%), indicating inconsistent values across the dataset.`,
          confidence: 0.8,
          importance: this.calculateImportance(stats.coefficient_of_variation, 'variability'),
          actionable: true,
          data: { field, statistics: stats },
          createdAt: new Date(),
          recommendations: [
            'Investigate the source of variability',
            'Consider data normalization or standardization',
            'Look for potential data quality issues'
          ],
        });
      }

      if (Math.abs(stats.skewness) > 1) {
        insights.push({
          id: `stat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'statistical',
          category: 'distribution',
          title: `${stats.skewness > 0 ? 'Right' : 'Left'} Skewed Distribution in ${field}`,
          description: `The ${field} distribution is ${stats.skewness > 0 ? 'right' : 'left'} skewed (skewness: ${stats.skewness.toFixed(2)}), indicating asymmetric data distribution.`,
          confidence: 0.75,
          importance: this.calculateImportance(Math.abs(stats.skewness), 'skewness'),
          actionable: true,
          data: { field, statistics: stats },
          createdAt: new Date(),
          recommendations: [
            'Consider data transformation (log, square root, etc.)',
            'Use appropriate statistical methods for skewed data',
            'Validate data collection processes'
          ],
        });
      }
    }

    return insights;
  }

  /**
   * Generate trend insights
   */
  private async generateTrendInsights(
    data: any[],
    config: InsightGenerationConfigDto
  ): Promise<InsightDto[]> {
    const insights: InsightDto[] = [];
    
    if (!config.timeField) return insights;

    const timeField = config.timeField;
    const numericFields = this.getNumericFields(data);

    for (const field of numericFields) {
      // Sort data by time
      const timeSeriesData = data
        .filter(row => row[timeField] && !isNaN(parseFloat(row[field])))
        .sort((a, b) => new Date(a[timeField]).getTime() - new Date(b[timeField]).getTime())
        .map(row => ({
          time: new Date(row[timeField]),
          value: parseFloat(row[field])
        }));

      if (timeSeriesData.length < 5) continue;

      // Calculate trend
      const trend = this.calculateTrend(timeSeriesData);
      
      if (Math.abs(trend.slope) > 0.1) {
        insights.push({
          id: `trend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'trend',
          category: 'temporal',
          title: `${trend.slope > 0 ? 'Increasing' : 'Decreasing'} Trend in ${field}`,
          description: `${field} shows a ${trend.slope > 0 ? 'positive' : 'negative'} trend over time with a slope of ${trend.slope.toFixed(4)} (R² = ${trend.r_squared.toFixed(3)}).`,
          confidence: Math.min(trend.r_squared + 0.2, 0.95),
          importance: this.calculateImportance(trend.r_squared, 'trend'),
          actionable: true,
          data: { field, trend, timeSeriesData: timeSeriesData.slice(-10) },
          createdAt: new Date(),
          recommendations: trend.slope > 0 ? [
            'Monitor continued growth',
            'Plan for capacity requirements',
            'Identify growth drivers'
          ] : [
            'Investigate decline causes',
            'Implement corrective measures',
            'Monitor critical thresholds'
          ],
        });
      }
    }

    return insights;
  }

  /**
   * Generate anomaly insights
   */
  private async generateAnomalyInsights(
    data: any[],
    config: InsightGenerationConfigDto,
    userId: string
  ): Promise<InsightDto[]> {
    const insights: InsightDto[] = [];

    try {
      // Use anomaly detection service
      const anomalyResults = await this.anomalyDetectionService.detectAnomalies(
        {
          data,
          threshold: config.anomalyThreshold || 3,
          features: this.getNumericFields(data),
        },
        userId
      );

      const anomalies = anomalyResults.data;
      if (anomalies.length > 0) {
        // Group anomalies by severity
        const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
        const highAnomalies = anomalies.filter(a => a.severity === 'high');

        if (criticalAnomalies.length > 0) {
          insights.push({
            id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'anomaly',
            category: 'data_quality',
            title: `Critical Anomalies Detected`,
            description: `Found ${criticalAnomalies.length} critical anomalies that require immediate attention. These represent significant deviations from normal patterns.`,
            confidence: 0.9,
            importance: 10,
            actionable: true,
            data: { anomalies: criticalAnomalies },
            createdAt: new Date(),
            recommendations: [
              'Investigate critical anomalies immediately',
              'Check data sources for issues',
              'Validate business processes',
              'Consider alerting relevant teams'
            ],
          });
        }

        if (highAnomalies.length > 0) {
          insights.push({
            id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'anomaly',
            category: 'monitoring',
            title: `High Severity Anomalies Present`,
            description: `Detected ${highAnomalies.length} high-severity anomalies indicating potential issues or unusual patterns in the data.`,
            confidence: 0.8,
            importance: 8,
            actionable: true,
            data: { anomalies: highAnomalies },
            createdAt: new Date(),
            recommendations: [
              'Review high-severity anomalies',
              'Analyze patterns for root causes',
              'Update monitoring thresholds if needed'
            ],
          });
        }
      }
    } catch (error) {
      this.logger.warn('Failed to generate anomaly insights:', error.message);
    }

    return insights;
  }

  /**
   * Generate correlation insights
   */
  private async generateCorrelationInsights(
    data: any[],
    config: InsightGenerationConfigDto
  ): Promise<InsightDto[]> {
    const insights: InsightDto[] = [];
    const numericFields = this.getNumericFields(data);

    if (numericFields.length < 2) return insights;

    // Calculate correlations between all numeric field pairs
    for (let i = 0; i < numericFields.length; i++) {
      for (let j = i + 1; j < numericFields.length; j++) {
        const field1 = numericFields[i];
        const field2 = numericFields[j];
        
        const correlation = this.calculateCorrelation(data, field1, field2);
        
        if (Math.abs(correlation) > 0.7) {
          insights.push({
            id: `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'correlation',
            category: 'relationships',
            title: `${correlation > 0 ? 'Strong Positive' : 'Strong Negative'} Correlation: ${field1} & ${field2}`,
            description: `${field1} and ${field2} show a ${correlation > 0 ? 'strong positive' : 'strong negative'} correlation (r = ${correlation.toFixed(3)}), suggesting a significant relationship.`,
            confidence: Math.min(Math.abs(correlation) + 0.1, 0.95),
            importance: this.calculateImportance(Math.abs(correlation), 'correlation'),
            actionable: true,
            data: { field1, field2, correlation },
            createdAt: new Date(),
            recommendations: [
              'Explore the causal relationship',
              'Consider using one variable to predict the other',
              'Investigate underlying business connections',
              'Use correlation for feature selection in ML models'
            ],
          });
        }
      }
    }

    return insights;
  }

  /**
   * Generate pattern insights
   */
  private async generatePatternInsights(
    data: any[],
    config: InsightGenerationConfigDto
  ): Promise<InsightDto[]> {
    const insights: InsightDto[] = [];

    // Detect repeating patterns in categorical data
    const categoricalFields = this.getCategoricalFields(data);
    
    for (const field of categoricalFields) {
      const valueFrequency = this.calculateValueFrequency(data, field);
      const totalCount = data.length;
      
      // Find dominant categories
      const dominantCategories = Object.entries(valueFrequency)
        .filter(([_, count]) => (count as number) / totalCount > 0.5)
        .map(([value, count]) => ({ value, count: count as number, percentage: ((count as number) / totalCount * 100) }));

      if (dominantCategories.length > 0) {
        const dominant = dominantCategories[0];
        insights.push({
          id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'pattern',
          category: 'distribution',
          title: `Dominant Pattern in ${field}`,
          description: `The value "${dominant.value}" dominates ${field} with ${dominant.percentage.toFixed(1)}% of all records, indicating a strong pattern or potential data skew.`,
          confidence: 0.85,
          importance: this.calculateImportance(dominant.percentage / 100, 'dominance'),
          actionable: true,
          data: { field, dominantCategories, valueFrequency },
          createdAt: new Date(),
          recommendations: [
            'Verify if this distribution is expected',
            'Check for data collection bias',
            'Consider stratified sampling if needed',
            'Adjust analysis methods for imbalanced data'
          ],
        });
      }
    }

    return insights;
  }

  /**
   * Generate forecast insights
   */
  private async generateForecastInsights(
    data: any[],
    config: InsightGenerationConfigDto,
    userId: string
  ): Promise<InsightDto[]> {
    const insights: InsightDto[] = [];

    if (!config.timeField || !config.forecastHorizon) return insights;

    const numericFields = this.getNumericFields(data);

    for (const field of numericFields.slice(0, 3)) { // Limit to prevent too many forecasts
      try {
        // Use advanced analytics service for forecasting
        const forecastResult = await this.advancedAnalyticsService.performTimeSeriesAnalysis(
          {
            datasetId: config.datasetId,
            timeColumn: config.timeField,
            valueColumns: [field],
            analysisType: 'forecast',
            forecastHorizon: config.forecastHorizon,
          },
          userId
        );

        if (forecastResult.success && forecastResult.data.forecasts) {
          const forecast = forecastResult.data.forecasts[field];
          const trend = forecast.trend;
          const seasonality = forecast.seasonality;

          insights.push({
            id: `forecast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'forecast',
            category: 'prediction',
            title: `${field} Forecast: ${trend > 0 ? 'Growth' : trend < 0 ? 'Decline' : 'Stable'} Expected`,
            description: `Based on historical patterns, ${field} is forecast to ${trend > 0 ? 'increase' : trend < 0 ? 'decrease' : 'remain stable'} over the next ${config.forecastHorizon} periods${seasonality ? ' with seasonal patterns' : ''}.`,
            confidence: forecast.confidence || 0.7,
            importance: this.calculateImportance(Math.abs(trend), 'forecast'),
            actionable: true,
            data: { field, forecast, trend, seasonality },
            createdAt: new Date(),
            recommendations: trend > 0 ? [
              'Plan for increased capacity',
              'Prepare resources for growth',
              'Monitor forecast accuracy'
            ] : trend < 0 ? [
              'Investigate decline factors',
              'Develop mitigation strategies',
              'Consider intervention measures'
            ] : [
              'Maintain current operations',
              'Monitor for unexpected changes',
              'Update forecast regularly'
            ],
          });
        }
      } catch (error) {
        this.logger.warn(`Failed to generate forecast insight for ${field}:`, error.message);
      }
    }

    return insights;
  }

  /**
   * Generate detailed explanation for an insight
   */
  private async generateDetailedExplanation(insight: InsightDto): Promise<any> {
    return {
      insightId: insight.id,
      title: insight.title,
      detailedDescription: this.expandDescription(insight),
      methodology: this.getMethodologyExplanation(insight.type),
      dataPoints: insight.data,
      statisticalDetails: this.getStatisticalDetails(insight),
      businessImplications: this.getBusinessImplications(insight),
      technicalNotes: this.getTechnicalNotes(insight),
      confidence: insight.confidence,
      limitations: this.getLimitations(insight),
      nextSteps: insight.recommendations || [],
      relatedInsights: this.findRelatedInsights(insight),
    };
  }

  /**
   * Generate recommendations for a specific insight
   */
  private async generateInsightRecommendations(
    insight: InsightDto,
    userId: string
  ): Promise<InsightRecommendationDto[]> {
    const recommendations: InsightRecommendationDto[] = [];

    // Generate recommendations based on insight type and content
    switch (insight.type) {
      case 'anomaly':
        recommendations.push({
          id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'investigation',
          title: 'Investigate Anomaly Root Cause',
          description: 'Perform detailed root cause analysis to understand the source of the anomaly',
          priority: 9,
          effort: 'medium',
          impact: 'high',
          category: 'data_quality',
          actions: [
            'Review data collection processes',
            'Check for system issues during anomaly timeframe',
            'Validate data transformations',
          ],
          estimatedTimeToComplete: '2-4 hours',
        });
        break;

      case 'trend':
        const trendSlope = insight.data?.trend?.slope || 0;
        recommendations.push({
          id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'monitoring',
          title: `Monitor ${trendSlope > 0 ? 'Growth' : 'Decline'} Trend`,
          description: `Set up monitoring and alerts for the ${trendSlope > 0 ? 'increasing' : 'decreasing'} trend in ${insight.data?.field}`,
          priority: 7,
          effort: 'low',
          impact: 'medium',
          category: 'monitoring',
          actions: [
            'Create dashboard for trend monitoring',
            'Set up threshold alerts',
            'Schedule regular reviews',
          ],
          estimatedTimeToComplete: '1-2 hours',
        });
        break;

      case 'correlation':
        recommendations.push({
          id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'analysis',
          title: 'Explore Causal Relationship',
          description: 'Investigate whether the correlation indicates a causal relationship',
          priority: 6,
          effort: 'high',
          impact: 'medium',
          category: 'analysis',
          actions: [
            'Conduct controlled experiments',
            'Analyze temporal sequences',
            'Consider confounding variables',
          ],
          estimatedTimeToComplete: '1-2 days',
        });
        break;
    }

    return recommendations;
  }

  /**
   * Helper methods for insight generation
   */
  private getNumericFields(data: any[]): string[] {
    if (data.length === 0) return [];
    const firstRow = data[0];
    return Object.keys(firstRow).filter(key => 
      !isNaN(parseFloat(firstRow[key])) && isFinite(firstRow[key])
    );
  }

  private getCategoricalFields(data: any[]): string[] {
    if (data.length === 0) return [];
    const firstRow = data[0];
    return Object.keys(firstRow).filter(key => 
      isNaN(parseFloat(firstRow[key])) || !isFinite(firstRow[key])
    );
  }

  private calculateBasicStatistics(values: number[]): any {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate skewness
    const skewness = values.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) / values.length;
    
    return {
      mean,
      median: this.calculateMedian(values),
      mode: this.calculateMode(values),
      variance,
      stdDev,
      min: Math.min(...values),
      max: Math.max(...values),
      skewness,
      coefficient_of_variation: stdDev / Math.abs(mean),
      count: values.length,
    };
  }

  private calculateMedian(values: number[]): number {
    const sorted = values.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  private calculateMode(values: number[]): number {
    const frequency = {};
    values.forEach(val => frequency[val] = (frequency[val] || 0) + 1);
    return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
  }

  private calculateTrend(timeSeriesData: { time: Date; value: number }[]): any {
    const n = timeSeriesData.length;
    const xValues = timeSeriesData.map((_, i) => i);
    const yValues = timeSeriesData.map(d => d.value);
    
    const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
    const yMean = yValues.reduce((sum, y) => sum + y, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
      denominator += Math.pow(xValues[i] - xMean, 2);
    }
    
    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;
    
    // Calculate R-squared
    const yPredicted = xValues.map(x => slope * x + intercept);
    const ssRes = yValues.reduce((sum, y, i) => sum + Math.pow(y - yPredicted[i], 2), 0);
    const ssTot = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const r_squared = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;
    
    return { slope, intercept, r_squared };
  }

  private calculateCorrelation(data: any[], field1: string, field2: string): number {
    const pairs = data
      .map(row => ({ x: parseFloat(row[field1]), y: parseFloat(row[field2]) }))
      .filter(pair => !isNaN(pair.x) && !isNaN(pair.y));
    
    if (pairs.length < 2) return 0;
    
    const n = pairs.length;
    const xMean = pairs.reduce((sum, pair) => sum + pair.x, 0) / n;
    const yMean = pairs.reduce((sum, pair) => sum + pair.y, 0) / n;
    
    let numerator = 0;
    let xDenominator = 0;
    let yDenominator = 0;
    
    for (const pair of pairs) {
      const xDiff = pair.x - xMean;
      const yDiff = pair.y - yMean;
      numerator += xDiff * yDiff;
      xDenominator += xDiff * xDiff;
      yDenominator += yDiff * yDiff;
    }
    
    const denominator = Math.sqrt(xDenominator * yDenominator);
    return denominator !== 0 ? numerator / denominator : 0;
  }

  private calculateValueFrequency(data: any[], field: string): Record<string, number> {
    const frequency = {};
    data.forEach(row => {
      const value = row[field];
      if (value !== undefined && value !== null) {
        frequency[value] = (frequency[value] || 0) + 1;
      }
    });
    return frequency;
  }

  private calculateImportance(value: number, type: string): number {
    // Scale importance from 1-10 based on value and type
    switch (type) {
      case 'variability':
        return Math.min(value * 10, 10);
      case 'skewness':
        return Math.min(Math.abs(value) * 5, 10);
      case 'trend':
        return Math.min(value * 15, 10);
      case 'correlation':
        return Math.min(Math.abs(value) * 12, 10);
      case 'dominance':
        return Math.min(value * 8, 10);
      case 'forecast':
        return Math.min(Math.abs(value) * 10, 10);
      default:
        return 5;
    }
  }

  // Additional helper methods for explanations and analysis
  private expandDescription(insight: InsightDto): string {
    // This would generate more detailed explanations based on insight type
    return `${insight.description} This insight was generated through ${insight.type} analysis with a confidence level of ${(insight.confidence * 100).toFixed(1)}%.`;
  }

  private getMethodologyExplanation(type: string): string {
    const methodologies = {
      statistical: 'Statistical analysis using descriptive statistics, variance analysis, and distribution testing.',
      trend: 'Time series trend analysis using linear regression and statistical significance testing.',
      anomaly: 'Anomaly detection using statistical outlier detection and machine learning algorithms.',
      correlation: 'Pearson correlation coefficient calculation with significance testing.',
      pattern: 'Pattern recognition through frequency analysis and distribution examination.',
      forecast: 'Time series forecasting using trend decomposition and predictive modeling.',
    };
    return methodologies[type] || 'Advanced analytics methodology';
  }

  private getStatisticalDetails(insight: InsightDto): any {
    return {
      confidence: insight.confidence,
      sampleSize: insight.data?.count || 'N/A',
      methodology: this.getMethodologyExplanation(insight.type),
      assumptions: this.getAssumptions(insight.type),
    };
  }

  private getBusinessImplications(insight: InsightDto): string[] {
    // Generate business implications based on insight type
    const implications = {
      anomaly: ['Data quality issues may exist', 'Business processes may need review', 'System monitoring required'],
      trend: ['Future planning implications', 'Resource allocation considerations', 'Performance monitoring needed'],
      correlation: ['Potential causal relationships to explore', 'Optimization opportunities', 'Risk factors to consider'],
    };
    return implications[insight.type] || ['Business impact assessment needed'];
  }

  private getTechnicalNotes(insight: InsightDto): string[] {
    return [
      `Analysis performed on ${new Date().toISOString()}`,
      `Confidence level: ${(insight.confidence * 100).toFixed(1)}%`,
      `Data quality: ${this.assessDataQuality(insight)}`,
    ];
  }

  private getLimitations(insight: InsightDto): string[] {
    return [
      'Based on available data at analysis time',
      'Correlation does not imply causation',
      'Results may change with additional data',
      'External factors not considered in analysis',
    ];
  }

  private getAssumptions(type: string): string[] {
    const assumptions = {
      statistical: ['Normal distribution assumed where applicable', 'Independent observations'],
      trend: ['Linear relationship assumed', 'Consistent time intervals'],
      correlation: ['Linear relationship', 'Normal distribution of variables'],
    };
    return assumptions[type] || ['Standard statistical assumptions apply'];
  }

  private assessDataQuality(insight: InsightDto): string {
    // Simple data quality assessment
    const confidence = insight.confidence;
    if (confidence > 0.8) return 'High';
    if (confidence > 0.6) return 'Medium';
    return 'Low';
  }

  private findRelatedInsights(insight: InsightDto): any[] {
    // This would find related insights from history
    return [];
  }

  private generateCacheKey(config: InsightGenerationConfigDto, userId: string): string {
    return `insights_${userId}_${JSON.stringify(config).replace(/\s/g, '')}`;
  }

  private findInsightById(insightId: string, userId: string): InsightDto | null {
    const history = this.insightHistory.get(userId) || [];
    return history.find(insight => insight.id === insightId) || null;
  }

  private storeInsightHistory(userId: string, insights: InsightDto[]): void {
    let history = this.insightHistory.get(userId) || [];
    history.push(...insights);
    
    // Keep only last 1000 insights
    if (history.length > 1000) {
      history = history.slice(-1000);
    }
    
    this.insightHistory.set(userId, history);
  }

  private deduplicateRecommendations(recommendations: InsightRecommendationDto[]): InsightRecommendationDto[] {
    const seen = new Set();
    return recommendations.filter(rec => {
      const key = `${rec.type}_${rec.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private calculateInsightTypeDistribution(insights: InsightDto[]): Record<string, number> {
    const distribution = {};
    insights.forEach(insight => {
      distribution[insight.type] = (distribution[insight.type] || 0) + 1;
    });
    return distribution;
  }

  private calculateConfidenceDistribution(insights: InsightDto[]): any {
    const ranges = { high: 0, medium: 0, low: 0 };
    insights.forEach(insight => {
      if (insight.confidence >= 0.8) ranges.high++;
      else if (insight.confidence >= 0.6) ranges.medium++;
      else ranges.low++;
    });
    return ranges;
  }

  private calculateTopCategories(insights: InsightDto[]): any[] {
    const categories = {};
    insights.forEach(insight => {
      if (insight.category) {
        categories[insight.category] = (categories[insight.category] || 0) + 1;
      }
    });
    
    return Object.entries(categories)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));
  }

  private calculateInsightTrends(insights: InsightDto[]): any {
    const now = new Date();
    const last24h = insights.filter(i => now.getTime() - i.createdAt.getTime() < 24 * 60 * 60 * 1000);
    const last7d = insights.filter(i => now.getTime() - i.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000);
    
    return {
      last24h: last24h.length,
      last7d: last7d.length,
      trend: last7d.length > last24h.length * 7 ? 'increasing' : 'decreasing',
    };
  }

  private calculateAverageConfidence(insights: InsightDto[]): number {
    if (insights.length === 0) return 0;
    const totalConfidence = insights.reduce((sum, insight) => sum + insight.confidence, 0);
    return totalConfidence / insights.length;
  }

  private async getRecommendationsSummary(userId: string): Promise<any> {
    return {
      totalRecommendations: 0,
      highPriority: 0,
      completed: 0,
      pending: 0,
    };
  }
}
