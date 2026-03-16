import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { BaseAnalyticsService } from './base-analytics.service';
import { MLService } from './ml.service';
import { DatasetService } from './dataset.service';
import {
  AnalyticsDataSource,
  AnalyticsDataset,
  AnalyticsMLModel,
  ProcessingStatus,
} from '../entities';
import {
  AnomalyDetectionConfigDto,
  AnomalyResultDto,
  AnalyticsApiResponse,
  AnomalyModelDto,
  AnomalyAlertDto,
} from '../dto';

/**
 * Anomaly Detection Service
 * Provides ML-powered anomaly detection, alert generation, and root cause analysis
 */
@Injectable()
export class AnomalyDetectionService extends BaseAnalyticsService {
  private readonly anomalyModels = new Map<string, any>();
  private readonly activeDetectors = new Map<string, any>();
  private readonly alertRules = new Map<string, any[]>();
  private readonly anomalyHistory = new Map<string, any[]>();
  private readonly rootCauseCache = new Map<string, any>();

  constructor(
    entityManager: EntityManager,
    @InjectRepository(AnalyticsDataSource)
    private readonly dataSourceRepository: Repository<AnalyticsDataSource>,
    @InjectRepository(AnalyticsDataset)
    private readonly datasetRepository: Repository<AnalyticsDataset>,
    @InjectRepository(AnalyticsMLModel)
    private readonly mlModelRepository: Repository<AnalyticsMLModel>,
    private readonly mlService: MLService,
    private readonly datasetService: DatasetService
  ) {
    super(entityManager);
  }

  /**
   * Create anomaly detection model
   */
  async createAnomalyModel(
    modelDto: AnomalyModelDto,
    userId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('CREATE_ANOMALY_MODEL', 'AnomalyModel');

      // Validate DTO
      const validatedDto = await this.validateDto(modelDto, AnomalyModelDto);

      // Check if dataset exists
      const dataset = await this.datasetRepository.findOne({
        where: { id: validatedDto.datasetId },
      });

      if (!dataset) {
        throw new NotFoundException(`Dataset with ID ${validatedDto.datasetId} not found`);
      }

      // Create model configuration
      const modelConfig = {
        id: `anomaly_model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: validatedDto.name,
        description: validatedDto.description,
        dataset,
        algorithm: validatedDto.algorithm || 'isolation_forest',
        parameters: validatedDto.parameters || this.getDefaultModelParameters(validatedDto.algorithm || 'isolation_forest'),
        featureColumns: validatedDto.featureColumns,
        targetColumn: validatedDto.targetColumn,
        threshold: validatedDto.threshold || 0.1,
        trainingConfig: {
          validationSplit: 0.2,
          epochs: validatedDto.epochs || 100,
          batchSize: validatedDto.batchSize || 32,
        },
        status: 'created',
        createdBy: userId,
        createdAt: new Date(),
        performance: null,
      };

      // Store model configuration
      this.anomalyModels.set(modelConfig.id, modelConfig);

      this.logOperation('CREATE_ANOMALY_MODEL_SUCCESS', 'AnomalyModel', modelConfig.id);

      return this.createResponse(
        {
          modelId: modelConfig.id,
          name: modelConfig.name,
          algorithm: modelConfig.algorithm,
          status: modelConfig.status,
        },
        'Anomaly detection model created successfully'
      );
    } catch (error) {
      this.handleError(error, 'CREATE_ANOMALY_MODEL');
    }
  }

  /**
   * Train anomaly detection model
   */
  async trainAnomalyModel(
    modelId: string,
    userId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('TRAIN_ANOMALY_MODEL', 'AnomalyModel', modelId);

      const model = this.anomalyModels.get(modelId);
      if (!model) {
        throw new NotFoundException(`Anomaly model with ID ${modelId} not found`);
      }

      // Update status to training
      model.status = 'training';
      model.trainingStartedAt = new Date();

      // Get dataset data
      const datasetData = await this.datasetService.getDatasetPreview(
        model.dataset.id,
        userId,
        1000 // Get more data for training
      );

      // Prepare training data
      const trainingData = this.prepareTrainingData(
        datasetData.data,
        model.featureColumns,
        model.targetColumn
      );

      // Train model (mock implementation)
      const trainingResult = await this.performModelTraining(
        model.algorithm,
        trainingData,
        model.parameters,
        model.trainingConfig
      );

      // Update model with training results
      model.status = 'trained';
      model.trainingCompletedAt = new Date();
      model.performance = trainingResult.performance;
      model.modelArtifacts = trainingResult.artifacts;

      this.logOperation('TRAIN_ANOMALY_MODEL_SUCCESS', 'AnomalyModel', modelId);

      return this.createResponse(
        {
          modelId,
          status: model.status,
          performance: model.performance,
          trainingDuration: model.trainingCompletedAt.getTime() - model.trainingStartedAt.getTime(),
        },
        'Anomaly detection model trained successfully'
      );
    } catch (error) {
      this.handleError(error, 'TRAIN_ANOMALY_MODEL');
    }
  }

  /**
   * Deploy anomaly detection model
   */
  async deployAnomalyModel(
    modelId: string,
    userId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('DEPLOY_ANOMALY_MODEL', 'AnomalyModel', modelId);

      const model = this.anomalyModels.get(modelId);
      if (!model) {
        throw new NotFoundException(`Anomaly model with ID ${modelId} not found`);
      }

      if (model.status !== 'trained') {
        throw new BadRequestException('Model must be trained before deployment');
      }

      // Create active detector
      const detector = {
        id: modelId,
        model,
        isActive: true,
        deployedAt: new Date(),
        deployedBy: userId,
        detectionCount: 0,
        lastDetection: null,
        performance: {
          totalPredictions: 0,
          anomaliesDetected: 0,
          falsePositives: 0,
          falseNegatives: 0,
          accuracy: 0,
        },
      };

      this.activeDetectors.set(modelId, detector);

      // Update model status
      model.status = 'deployed';
      model.deployedAt = new Date();

      this.logOperation('DEPLOY_ANOMALY_MODEL_SUCCESS', 'AnomalyModel', modelId);

      return this.createResponse(
        {
          modelId,
          status: model.status,
          deployedAt: model.deployedAt,
        },
        'Anomaly detection model deployed successfully'
      );
    } catch (error) {
      this.handleError(error, 'DEPLOY_ANOMALY_MODEL');
    }
  }

  /**
   * Detect anomalies in data
   */
  async detectAnomalies(
    configDto: AnomalyDetectionConfigDto,
    userId: string
  ): Promise<AnalyticsApiResponse<AnomalyResultDto[]>> {
    try {
      this.logOperation('DETECT_ANOMALIES', 'AnomalyDetection');

      // Validate DTO
      const validatedDto = await this.validateDto(configDto, AnomalyDetectionConfigDto);

      // Get model if specified
      let detector = null;
      if (validatedDto.modelId) {
        detector = this.activeDetectors.get(validatedDto.modelId);
        if (!detector) {
          throw new NotFoundException(`Active detector with model ID ${validatedDto.modelId} not found`);
        }
      }

      // Get data for analysis
      const analysisData = await this.getAnalysisData(validatedDto);

      // Perform anomaly detection
      const anomalies = detector 
        ? await this.detectWithModel(detector, analysisData, validatedDto)
        : await this.detectWithStatisticalMethods(analysisData, validatedDto);

      // Store anomaly history
      this.storeAnomalyHistory(validatedDto.modelId || 'statistical', anomalies);

      // Generate alerts if configured
      if (validatedDto.generateAlerts) {
        await this.generateAnomalyAlerts(anomalies, validatedDto, userId);
      }

      this.logOperation('DETECT_ANOMALIES_SUCCESS', 'AnomalyDetection');

      return this.createResponse(
        anomalies,
        `Found ${anomalies.length} anomalies in the data`
      );
    } catch (error) {
      this.handleError(error, 'DETECT_ANOMALIES');
    }
  }

  /**
   * Get anomaly detection results
   */
  async getAnomalyResults(
    modelId?: string,
    limit: number = 100
  ): Promise<AnalyticsApiResponse<AnomalyResultDto[]>> {
    try {
      this.logOperation('GET_ANOMALY_RESULTS', 'AnomalyDetection', modelId);

      const detectorId = modelId || 'statistical';
      const history = this.anomalyHistory.get(detectorId) || [];

      // Sort by detection time (newest first) and limit results
      const results = history
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);

      this.logOperation('GET_ANOMALY_RESULTS_SUCCESS', 'AnomalyDetection', modelId);

      return this.createResponse(
        results,
        `Retrieved ${results.length} anomaly detection results`
      );
    } catch (error) {
      this.handleError(error, 'GET_ANOMALY_RESULTS');
    }
  }

  /**
   * Analyze root cause of anomaly
   */
  async analyzeRootCause(
    anomalyId: string,
    userId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('ANALYZE_ROOT_CAUSE', 'AnomalyAnalysis', anomalyId);

      // Check cache first
      const cachedAnalysis = this.rootCauseCache.get(anomalyId);
      if (cachedAnalysis) {
        return this.createResponse(cachedAnalysis, 'Root cause analysis retrieved from cache');
      }

      // Find anomaly in history
      const anomaly = this.findAnomalyById(anomalyId);
      if (!anomaly) {
        throw new NotFoundException(`Anomaly with ID ${anomalyId} not found`);
      }

      // Perform root cause analysis
      const rootCauseAnalysis = await this.performRootCauseAnalysis(anomaly);

      // Cache the analysis
      this.rootCauseCache.set(anomalyId, rootCauseAnalysis);

      this.logOperation('ANALYZE_ROOT_CAUSE_SUCCESS', 'AnomalyAnalysis', anomalyId);

      return this.createResponse(
        rootCauseAnalysis,
        'Root cause analysis completed successfully'
      );
    } catch (error) {
      this.handleError(error, 'ANALYZE_ROOT_CAUSE');
    }
  }

  /**
   * Configure anomaly alerts
   */
  async configureAnomalyAlerts(
    alertDto: AnomalyAlertDto,
    userId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('CONFIGURE_ANOMALY_ALERTS', 'AnomalyAlert');

      // Validate DTO
      const validatedDto = await this.validateDto(alertDto, AnomalyAlertDto);

      const alertConfig = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: validatedDto.name,
        description: validatedDto.description,
        modelId: validatedDto.modelId,
        triggers: validatedDto.triggers,
        channels: validatedDto.channels,
        recipients: validatedDto.recipients,
        enabled: validatedDto.enabled !== false,
        createdBy: userId,
        createdAt: new Date(),
      };

      // Get or create alert rules for model
      let rules = this.alertRules.get(validatedDto.modelId);
      if (!rules) {
        rules = [];
        this.alertRules.set(validatedDto.modelId, rules);
      }

      rules.push(alertConfig);

      this.logOperation('CONFIGURE_ANOMALY_ALERTS_SUCCESS', 'AnomalyAlert', alertConfig.id);

      return this.createResponse(
        {
          alertId: alertConfig.id,
          name: alertConfig.name,
          modelId: alertConfig.modelId,
          enabled: alertConfig.enabled,
        },
        'Anomaly alert configured successfully'
      );
    } catch (error) {
      this.handleError(error, 'CONFIGURE_ANOMALY_ALERTS');
    }
  }

  /**
   * Get anomaly model performance
   */
  async getModelPerformance(
    modelId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('GET_MODEL_PERFORMANCE', 'AnomalyModel', modelId);

      const model = this.anomalyModels.get(modelId);
      if (!model) {
        throw new NotFoundException(`Anomaly model with ID ${modelId} not found`);
      }

      const detector = this.activeDetectors.get(modelId);
      
      const performance = {
        modelId,
        name: model.name,
        algorithm: model.algorithm,
        status: model.status,
        trainingPerformance: model.performance,
        runtimePerformance: detector?.performance || null,
        deploymentInfo: detector ? {
          deployedAt: detector.deployedAt,
          deployedBy: detector.deployedBy,
          isActive: detector.isActive,
          detectionCount: detector.detectionCount,
          lastDetection: detector.lastDetection,
        } : null,
      };

      this.logOperation('GET_MODEL_PERFORMANCE_SUCCESS', 'AnomalyModel', modelId);

      return this.createResponse(
        performance,
        'Model performance retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_MODEL_PERFORMANCE');
    }
  }

  /**
   * Get anomaly statistics
   */
  async getAnomalyStatistics(
    modelId?: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('GET_ANOMALY_STATISTICS', 'AnomalyStatistics', modelId);

      const detectorId = modelId || 'statistical';
      const history = this.anomalyHistory.get(detectorId) || [];

      // Filter by time range if provided
      let filteredHistory = history;
      if (timeRange) {
        filteredHistory = history.filter(anomaly => 
          anomaly.timestamp >= timeRange.start && anomaly.timestamp <= timeRange.end
        );
      }

      // Calculate statistics
      const statistics = {
        totalAnomalies: filteredHistory.length,
        severityDistribution: this.calculateSeverityDistribution(filteredHistory),
        typeDistribution: this.calculateTypeDistribution(filteredHistory),
        timeSeriesData: this.calculateTimeSeriesData(filteredHistory),
        averageScore: this.calculateAverageScore(filteredHistory),
        detectionTrends: this.calculateDetectionTrends(filteredHistory),
        topFeatures: this.calculateTopAnomalyFeatures(filteredHistory),
        performanceMetrics: modelId ? this.calculatePerformanceMetrics(modelId) : null,
      };

      this.logOperation('GET_ANOMALY_STATISTICS_SUCCESS', 'AnomalyStatistics', modelId);

      return this.createResponse(
        statistics,
        'Anomaly statistics retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_ANOMALY_STATISTICS');
    }
  }

  /**
   * Get default model parameters for algorithm
   */
  private getDefaultModelParameters(algorithm: string): Record<string, any> {
    const defaults = {
      isolation_forest: {
        n_estimators: 100,
        contamination: 0.1,
        max_samples: 'auto',
        random_state: 42,
      },
      one_class_svm: {
        kernel: 'rbf',
        gamma: 'scale',
        nu: 0.1,
      },
      local_outlier_factor: {
        n_neighbors: 20,
        contamination: 0.1,
      },
      autoencoder: {
        hidden_layers: [64, 32, 16, 8, 16, 32, 64],
        activation: 'relu',
        learning_rate: 0.001,
        threshold_percentile: 95,
      },
      lstm_autoencoder: {
        sequence_length: 10,
        hidden_units: 50,
        learning_rate: 0.001,
        threshold_percentile: 95,
      },
    };

    return defaults[algorithm] || defaults.isolation_forest;
  }

  /**
   * Prepare training data
   */
  private prepareTrainingData(
    rawData: any[],
    featureColumns: string[],
    targetColumn?: string
  ): any {
    // In a real implementation, this would properly process and normalize the data
    return {
      features: rawData.map(row => featureColumns.map(col => row[col] || 0)),
      labels: targetColumn ? rawData.map(row => row[targetColumn]) : null,
      featureNames: featureColumns,
      sampleCount: rawData.length,
    };
  }

  /**
   * Perform model training (mock implementation)
   */
  private async performModelTraining(
    algorithm: string,
    trainingData: any,
    parameters: Record<string, any>,
    config: any
  ): Promise<any> {
    // Mock training process with realistic results
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate training time

    return {
      performance: {
        accuracy: Math.random() * 0.1 + 0.85, // 85-95%
        precision: Math.random() * 0.1 + 0.8, // 80-90%
        recall: Math.random() * 0.1 + 0.75, // 75-85%
        f1Score: Math.random() * 0.1 + 0.8, // 80-90%
        auc: Math.random() * 0.1 + 0.85, // 85-95%
      },
      artifacts: {
        modelSize: Math.floor(Math.random() * 50 + 10), // 10-60 MB
        trainingTime: Math.floor(Math.random() * 300 + 60), // 1-5 minutes
        featureImportance: trainingData.featureNames.map(name => ({
          feature: name,
          importance: Math.random(),
        })).sort((a, b) => b.importance - a.importance),
      },
    };
  }

  /**
   * Get analysis data based on configuration
   */
  private async getAnalysisData(config: AnomalyDetectionConfigDto): Promise<any[]> {
    if (config.datasetId) {
      // Get data from dataset
      const datasetData = await this.datasetService.getDatasetPreview(
        config.datasetId,
        'system',
        config.limit || 1000
      );
      return datasetData.data;
    } else if (config.data) {
      // Use provided data
      return config.data;
    } else {
      throw new BadRequestException('Either datasetId or data must be provided');
    }
  }

  /**
   * Detect anomalies using trained model
   */
  private async detectWithModel(
    detector: any,
    data: any[],
    config: AnomalyDetectionConfigDto
  ): Promise<AnomalyResultDto[]> {
    const anomalies: AnomalyResultDto[] = [];
    const model = detector.model;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Extract features
      const features = model.featureColumns.map(col => row[col] || 0);
      
      // Mock prediction - in reality this would use the trained model
      const anomalyScore = this.mockModelPrediction(features, model.algorithm);
      const isAnomaly = anomalyScore > model.threshold;

      if (isAnomaly) {
        anomalies.push({
          id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          dataPoint: row,
          score: anomalyScore,
          threshold: model.threshold,
          severity: this.calculateSeverity(anomalyScore),
          type: this.determineAnomalyType(features, model.featureColumns),
          features: model.featureColumns.reduce((acc, col, idx) => {
            acc[col] = features[idx];
            return acc;
          }, {}),
          timestamp: new Date(),
          modelId: model.id,
          confidence: Math.min(anomalyScore / model.threshold, 1.0),
          description: this.generateAnomalyDescription(anomalyScore, model.featureColumns),
        });
      }
    }

    // Update detector performance
    detector.performance.totalPredictions += data.length;
    detector.performance.anomaliesDetected += anomalies.length;
    detector.detectionCount += anomalies.length;
    detector.lastDetection = anomalies.length > 0 ? new Date() : detector.lastDetection;

    return anomalies;
  }

  /**
   * Detect anomalies using statistical methods
   */
  private async detectWithStatisticalMethods(
    data: any[],
    config: AnomalyDetectionConfigDto
  ): Promise<AnomalyResultDto[]> {
    const anomalies: AnomalyResultDto[] = [];
    const features = config.features || Object.keys(data[0] || {});

    for (const feature of features) {
      const values = data.map(row => parseFloat(row[feature])).filter(val => !isNaN(val));
      if (values.length === 0) continue;

      // Calculate statistical measures
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      const threshold = config.threshold || 3; // 3-sigma rule

      for (let i = 0; i < data.length; i++) {
        const value = parseFloat(data[i][feature]);
        if (isNaN(value)) continue;

        const zScore = Math.abs((value - mean) / stdDev);
        const isAnomaly = zScore > threshold;

        if (isAnomaly) {
          anomalies.push({
            id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            dataPoint: data[i],
            score: zScore,
            threshold,
            severity: this.calculateSeverityFromZScore(zScore),
            type: 'statistical_outlier',
            features: { [feature]: value },
            timestamp: new Date(),
            modelId: 'statistical',
            confidence: Math.min(zScore / threshold, 1.0),
            description: `Statistical outlier detected in ${feature} (z-score: ${zScore.toFixed(2)})`,
          });
        }
      }
    }

    return anomalies;
  }

  /**
   * Mock model prediction
   */
  private mockModelPrediction(features: number[], algorithm: string): number {
    // Generate realistic anomaly scores based on algorithm
    const baseScore = Math.random();
    
    switch (algorithm) {
      case 'isolation_forest':
        return baseScore > 0.9 ? 0.8 + Math.random() * 0.2 : Math.random() * 0.3;
      case 'one_class_svm':
        return baseScore > 0.85 ? 0.7 + Math.random() * 0.3 : Math.random() * 0.4;
      case 'autoencoder':
        return baseScore > 0.8 ? 0.6 + Math.random() * 0.4 : Math.random() * 0.5;
      default:
        return Math.random();
    }
  }

  /**
   * Calculate severity from anomaly score
   */
  private calculateSeverity(score: number): string {
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Calculate severity from z-score
   */
  private calculateSeverityFromZScore(zScore: number): string {
    if (zScore >= 4) return 'critical';
    if (zScore >= 3.5) return 'high';
    if (zScore >= 3) return 'medium';
    return 'low';
  }

  /**
   * Determine anomaly type based on features
   */
  private determineAnomalyType(features: number[], featureNames: string[]): string {
    // Simple heuristic to determine anomaly type
    const types = ['outlier', 'drift', 'spike', 'pattern_break', 'trend_change'];
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Generate anomaly description
   */
  private generateAnomalyDescription(score: number, features: string[]): string {
    const severity = this.calculateSeverity(score);
    return `${severity.charAt(0).toUpperCase() + severity.slice(1)} anomaly detected (score: ${score.toFixed(3)}) in features: ${features.join(', ')}`;
  }

  /**
   * Store anomaly history
   */
  private storeAnomalyHistory(detectorId: string, anomalies: AnomalyResultDto[]): void {
    let history = this.anomalyHistory.get(detectorId);
    if (!history) {
      history = [];
      this.anomalyHistory.set(detectorId, history);
    }

    history.push(...anomalies);

    // Keep only last 1000 anomalies
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }
  }

  /**
   * Generate anomaly alerts
   */
  private async generateAnomalyAlerts(
    anomalies: AnomalyResultDto[],
    config: AnomalyDetectionConfigDto,
    userId: string
  ): Promise<void> {
    const modelId = config.modelId || 'statistical';
    const alertRules = this.alertRules.get(modelId) || [];

    for (const anomaly of anomalies) {
      for (const rule of alertRules) {
        if (!rule.enabled) continue;

        const shouldAlert = this.evaluateAlertTriggers(anomaly, rule.triggers);
        if (shouldAlert) {
          await this.sendAlert(anomaly, rule);
        }
      }
    }
  }

  /**
   * Evaluate alert triggers
   */
  private evaluateAlertTriggers(anomaly: AnomalyResultDto, triggers: any): boolean {
    // Simple trigger evaluation - in reality this would be more sophisticated
    if (triggers.minSeverity) {
      const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
      if (severityLevels[anomaly.severity] < severityLevels[triggers.minSeverity]) {
        return false;
      }
    }

    if (triggers.minScore && anomaly.score < triggers.minScore) {
      return false;
    }

    return true;
  }

  /**
   * Send alert
   */
  private async sendAlert(anomaly: AnomalyResultDto, rule: any): Promise<void> {
    // Mock alert sending - in reality this would integrate with notification systems
    this.logger.log(`Sending alert for anomaly ${anomaly.id} via channels: ${rule.channels.join(', ')}`);
  }

  /**
   * Find anomaly by ID
   */
  private findAnomalyById(anomalyId: string): AnomalyResultDto | null {
    for (const history of this.anomalyHistory.values()) {
      const anomaly = history.find(a => a.id === anomalyId);
      if (anomaly) return anomaly;
    }
    return null;
  }

  /**
   * Perform root cause analysis
   */
  private async performRootCauseAnalysis(anomaly: AnomalyResultDto): Promise<any> {
    // Mock root cause analysis
    return {
      anomalyId: anomaly.id,
      primaryCauses: [
        {
          feature: Object.keys(anomaly.features)[0] || 'unknown',
          contribution: Math.random() * 0.5 + 0.3, // 30-80%
          description: 'Significant deviation from normal pattern',
        },
        {
          feature: 'temporal_pattern',
          contribution: Math.random() * 0.3 + 0.1, // 10-40%
          description: 'Unusual timing or sequence detected',
        },
      ],
      correlatedFeatures: Object.keys(anomaly.features).map(feature => ({
        feature,
        correlation: Math.random() * 0.6 + 0.2, // 20-80%
        impact: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
      })),
      similarAnomalies: this.findSimilarAnomalies(anomaly, 5),
      recommendations: [
        'Investigate data source for potential issues',
        'Check system logs for errors around the anomaly timestamp',
        'Validate data collection processes',
        'Consider adjusting detection thresholds if false positive',
      ],
      confidence: Math.random() * 0.3 + 0.6, // 60-90%
    };
  }

  /**
   * Find similar anomalies
   */
  private findSimilarAnomalies(targetAnomaly: AnomalyResultDto, limit: number): any[] {
    const similar = [];
    
    for (const history of this.anomalyHistory.values()) {
      for (const anomaly of history) {
        if (anomaly.id === targetAnomaly.id) continue;
        
        const similarity = this.calculateAnomalySimilarity(targetAnomaly, anomaly);
        if (similarity > 0.5) {
          similar.push({
            id: anomaly.id,
            similarity,
            timestamp: anomaly.timestamp,
            severity: anomaly.severity,
            type: anomaly.type,
          });
        }
      }
    }

    return similar
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Calculate anomaly similarity
   */
  private calculateAnomalySimilarity(anomaly1: AnomalyResultDto, anomaly2: AnomalyResultDto): number {
    // Simple similarity calculation based on type and severity
    let similarity = 0;
    
    if (anomaly1.type === anomaly2.type) similarity += 0.4;
    if (anomaly1.severity === anomaly2.severity) similarity += 0.3;
    
    // Feature similarity
    const features1 = Object.keys(anomaly1.features);
    const features2 = Object.keys(anomaly2.features);
    const commonFeatures = features1.filter(f => features2.includes(f));
    const featureSimilarity = commonFeatures.length / Math.max(features1.length, features2.length);
    similarity += featureSimilarity * 0.3;
    
    return similarity;
  }

  /**
   * Calculate severity distribution
   */
  private calculateSeverityDistribution(anomalies: AnomalyResultDto[]): Record<string, number> {
    const distribution = { low: 0, medium: 0, high: 0, critical: 0 };
    anomalies.forEach(anomaly => {
      distribution[anomaly.severity] = (distribution[anomaly.severity] || 0) + 1;
    });
    return distribution;
  }

  /**
   * Calculate type distribution
   */
  private calculateTypeDistribution(anomalies: AnomalyResultDto[]): Record<string, number> {
    const distribution = {};
    anomalies.forEach(anomaly => {
      distribution[anomaly.type] = (distribution[anomaly.type] || 0) + 1;
    });
    return distribution;
  }

  /**
   * Calculate time series data for anomalies
   */
  private calculateTimeSeriesData(anomalies: AnomalyResultDto[]): any[] {
    const grouped = {};
    
    anomalies.forEach(anomaly => {
      const date = anomaly.timestamp.toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }

  /**
   * Calculate average anomaly score
   */
  private calculateAverageScore(anomalies: AnomalyResultDto[]): number {
    if (anomalies.length === 0) return 0;
    const totalScore = anomalies.reduce((sum, anomaly) => sum + anomaly.score, 0);
    return totalScore / anomalies.length;
  }

  /**
   * Calculate detection trends
   */
  private calculateDetectionTrends(anomalies: AnomalyResultDto[]): any {
    const now = new Date();
    const last24h = anomalies.filter(a => now.getTime() - a.timestamp.getTime() < 24 * 60 * 60 * 1000);
    const last7d = anomalies.filter(a => now.getTime() - a.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000);
    const last30d = anomalies.filter(a => now.getTime() - a.timestamp.getTime() < 30 * 24 * 60 * 60 * 1000);

    return {
      last24h: last24h.length,
      last7d: last7d.length,
      last30d: last30d.length,
      trend: last7d.length > last24h.length * 7 ? 'increasing' : 'decreasing',
    };
  }

  /**
   * Calculate top anomaly features
   */
  private calculateTopAnomalyFeatures(anomalies: AnomalyResultDto[]): any[] {
    const featureCounts = {};
    
    anomalies.forEach(anomaly => {
      Object.keys(anomaly.features).forEach(feature => {
        featureCounts[feature] = (featureCounts[feature] || 0) + 1;
      });
    });

    return Object.entries(featureCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([feature, count]) => ({ feature, count }));
  }

  /**
   * Calculate performance metrics for model
   */
  private calculatePerformanceMetrics(modelId: string): any {
    const detector = this.activeDetectors.get(modelId);
    return detector?.performance || null;
  }
}
