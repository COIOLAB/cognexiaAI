import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { BaseAnalyticsService } from './base-analytics.service';
import { DatasetService } from './dataset.service';
import {
  MLModel,
  MLPrediction,
  AnalyticsDataset,
  ModelType,
  ProcessingStatus,
} from '../entities';
import {
  CreateMLModelDto,
  UpdateMLModelDto,
  MLModelDto,
  TrainMLModelDto,
  CreateMLPredictionDto,
  MLPredictionDto,
  AnalyticsApiResponse,
  PaginatedAnalyticsResponse,
} from '../dto';

/**
 * Machine Learning Service
 * Handles ML model lifecycle, training, prediction, evaluation, and MLOps
 */
@Injectable()
export class MLService extends BaseAnalyticsService {
  private readonly modelCache = new Map<string, any>();
  private readonly predictionCache = new Map<string, any>();
  private readonly trainingJobs = new Map<string, Promise<any>>();
  private readonly modelRegistry = new Map<string, any>();

  constructor(
    entityManager: EntityManager,
    @InjectRepository(MLModel)
    private readonly modelRepository: Repository<MLModel>,
    @InjectRepository(MLPrediction)
    private readonly predictionRepository: Repository<MLPrediction>,
    @InjectRepository(AnalyticsDataset)
    private readonly datasetRepository: Repository<AnalyticsDataset>,
    private readonly datasetService: DatasetService
  ) {
    super(entityManager);
  }

  /**
   * Create a new ML model
   */
  async createModel(
    createModelDto: CreateMLModelDto,
    userId: string
  ): Promise<AnalyticsApiResponse<MLModelDto>> {
    try {
      this.logOperation('CREATE_ML_MODEL', 'MLModel');

      // Validate DTO
      const validatedDto = await this.validateDto(createModelDto, CreateMLModelDto);

      // Verify training dataset exists if specified
      if (validatedDto.trainingDatasetId) {
        const dataset = await this.datasetRepository.findOne({
          where: { id: validatedDto.trainingDatasetId },
        });

        if (!dataset) {
          throw new NotFoundException(
            `Training dataset with ID ${validatedDto.trainingDatasetId} not found`
          );
        }
      }

      // Create model entity
      const model = this.modelRepository.create({
        ...validatedDto,
        createdBy: userId,
        status: ProcessingStatus.PENDING,
        version: '1.0.0',
        isActive: validatedDto.isActive ?? true,
        hyperparameters: validatedDto.hyperparameters || this.getDefaultHyperparameters(validatedDto.type),
        configuration: {
          ...this.getDefaultConfiguration(validatedDto.type),
          ...validatedDto.configuration,
        },
      });

      const savedModel = await this.modelRepository.save(model);

      // Register model in registry
      await this.registerModel(savedModel);

      const modelDto = await this.mapModelToDto(savedModel);

      this.logOperation('CREATE_ML_MODEL_SUCCESS', 'MLModel', savedModel.id);

      return this.createResponse(
        modelDto,
        'ML model created successfully',
        { autoTrainingAvailable: true }
      );
    } catch (error) {
      this.handleError(error, 'CREATE_ML_MODEL');
    }
  }

  /**
   * Train ML model
   */
  async trainModel(
    modelId: string,
    trainModelDto: TrainMLModelDto,
    userId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('TRAIN_ML_MODEL', 'MLModel', modelId);

      const model = await this.modelRepository.findOne({
        where: { id: modelId },
        relations: ['trainingDataset', 'validationDataset'],
      });

      if (!model) {
        throw new NotFoundException(`ML model with ID ${modelId} not found`);
      }

      // Check if training is already in progress
      if (this.trainingJobs.has(modelId)) {
        return this.createResponse(
          { status: 'training_in_progress', modelId },
          'Model training is already in progress'
        );
      }

      // Validate training data
      const trainingDataset = model.trainingDataset || 
        (trainModelDto.trainingDatasetId ? 
          await this.datasetRepository.findOne({ where: { id: trainModelDto.trainingDatasetId } }) : 
          null);

      if (!trainingDataset) {
        throw new BadRequestException('Training dataset is required for model training');
      }

      // Update model status
      model.status = ProcessingStatus.PROCESSING;
      model.lastTrainedAt = new Date();
      model.lastTrainedBy = userId;
      
      // Update hyperparameters if provided
      if (trainModelDto.hyperparameters) {
        model.hyperparameters = { ...model.hyperparameters, ...trainModelDto.hyperparameters };
      }

      await this.modelRepository.save(model);

      // Start training job asynchronously
      const trainingPromise = this.performModelTraining(model, trainingDataset, trainModelDto);
      this.trainingJobs.set(modelId, trainingPromise);

      // Don't await the training, return immediately
      trainingPromise
        .then(result => {
          this.handleTrainingCompletion(modelId, result);
        })
        .catch(error => {
          this.handleTrainingFailure(modelId, error);
        })
        .finally(() => {
          this.trainingJobs.delete(modelId);
        });

      this.logOperation('TRAIN_ML_MODEL_STARTED', 'MLModel', modelId);

      return this.createResponse(
        {
          modelId,
          status: 'training_started',
          estimatedDuration: this.estimateTrainingDuration(model.type, trainingDataset),
          trainingJobId: `job_${Date.now()}`,
        },
        'Model training started successfully'
      );
    } catch (error) {
      this.handleError(error, 'TRAIN_ML_MODEL');
    }
  }

  /**
   * Make predictions using ML model
   */
  async predict(
    modelId: string,
    predictionDto: CreateMLPredictionDto,
    userId: string
  ): Promise<AnalyticsApiResponse<MLPredictionDto>> {
    try {
      this.logOperation('ML_PREDICT', 'MLPrediction', modelId);

      const model = await this.modelRepository.findOne({
        where: { id: modelId },
      });

      if (!model) {
        throw new NotFoundException(`ML model with ID ${modelId} not found`);
      }

      if (model.status !== ProcessingStatus.COMPLETED) {
        throw new BadRequestException('Model must be trained before making predictions');
      }

      // Validate DTO
      const validatedDto = await this.validateDto(predictionDto, CreateMLPredictionDto);

      // Check prediction cache
      const cacheKey = this.generatePredictionCacheKey(modelId, validatedDto.inputData);
      if (this.predictionCache.has(cacheKey) && !validatedDto.refreshCache) {
        const cachedPrediction = this.predictionCache.get(cacheKey);
        return this.createResponse(
          cachedPrediction,
          'Prediction result (cached)'
        );
      }

      // Perform prediction
      const predictionResult = await this.performPrediction(model, validatedDto);

      // Create prediction record
      const prediction = this.predictionRepository.create({
        model,
        inputData: validatedDto.inputData,
        outputData: predictionResult.predictions,
        confidence: predictionResult.confidence,
        metadata: predictionResult.metadata,
        executedBy: userId,
        executedAt: new Date(),
      });

      const savedPrediction = await this.predictionRepository.save(prediction);

      // Cache prediction result
      const predictionDto = await this.mapPredictionToDto(savedPrediction);
      this.predictionCache.set(cacheKey, predictionDto);

      this.logOperation('ML_PREDICT_SUCCESS', 'MLPrediction', savedPrediction.id);

      return this.createResponse(
        predictionDto,
        'Prediction completed successfully'
      );
    } catch (error) {
      this.handleError(error, 'ML_PREDICT');
    }
  }

  /**
   * Get model performance metrics
   */
  async getModelMetrics(modelId: string): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('GET_MODEL_METRICS', 'MLModel', modelId);

      const model = await this.modelRepository.findOne({
        where: { id: modelId },
      });

      if (!model) {
        throw new NotFoundException(`ML model with ID ${modelId} not found`);
      }

      const metrics = await this.calculateModelMetrics(model);

      return this.createResponse(
        metrics,
        'Model metrics retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_MODEL_METRICS');
    }
  }

  /**
   * Evaluate model performance
   */
  async evaluateModel(
    modelId: string,
    evaluationDatasetId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('EVALUATE_MODEL', 'MLModel', modelId);

      const model = await this.modelRepository.findOne({
        where: { id: modelId },
      });

      if (!model) {
        throw new NotFoundException(`ML model with ID ${modelId} not found`);
      }

      const evaluationDataset = await this.datasetRepository.findOne({
        where: { id: evaluationDatasetId },
      });

      if (!evaluationDataset) {
        throw new NotFoundException(`Evaluation dataset with ID ${evaluationDatasetId} not found`);
      }

      const evaluation = await this.performModelEvaluation(model, evaluationDataset);

      // Update model with evaluation results
      model.evaluation = evaluation;
      model.accuracy = evaluation.accuracy;
      await this.modelRepository.save(model);

      return this.createResponse(
        evaluation,
        'Model evaluation completed successfully'
      );
    } catch (error) {
      this.handleError(error, 'EVALUATE_MODEL');
    }
  }

  /**
   * Deploy model to production
   */
  async deployModel(
    modelId: string,
    deploymentConfig: any,
    userId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('DEPLOY_MODEL', 'MLModel', modelId);

      const model = await this.modelRepository.findOne({
        where: { id: modelId },
      });

      if (!model) {
        throw new NotFoundException(`ML model with ID ${modelId} not found`);
      }

      if (model.status !== ProcessingStatus.COMPLETED) {
        throw new BadRequestException('Only trained models can be deployed');
      }

      // Perform deployment
      const deployment = await this.performModelDeployment(model, deploymentConfig);

      // Update model deployment status
      model.deploymentStatus = 'deployed';
      model.deploymentConfig = deploymentConfig;
      model.deployedAt = new Date();
      model.deployedBy = userId;
      
      await this.modelRepository.save(model);

      this.logOperation('DEPLOY_MODEL_SUCCESS', 'MLModel', modelId);

      return this.createResponse(
        deployment,
        'Model deployed successfully'
      );
    } catch (error) {
      this.handleError(error, 'DEPLOY_MODEL');
    }
  }

  /**
   * Get model versions and lineage
   */
  async getModelLineage(modelId: string): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('GET_MODEL_LINEAGE', 'MLModel', modelId);

      const model = await this.modelRepository.findOne({
        where: { id: modelId },
        relations: ['trainingDataset', 'validationDataset'],
      });

      if (!model) {
        throw new NotFoundException(`ML model with ID ${modelId} not found`);
      }

      const lineage = await this.buildModelLineage(model);

      return this.createResponse(
        lineage,
        'Model lineage retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_MODEL_LINEAGE');
    }
  }

  /**
   * AutoML - Automated model selection and training
   */
  async autoML(
    datasetId: string,
    targetColumn: string,
    problemType: 'classification' | 'regression',
    userId: string
  ): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('AUTO_ML', 'MLModel');

      const dataset = await this.datasetRepository.findOne({
        where: { id: datasetId },
      });

      if (!dataset) {
        throw new NotFoundException(`Dataset with ID ${datasetId} not found`);
      }

      // Analyze dataset and recommend models
      const recommendations = await this.analyzeDatasetForAutoML(dataset, targetColumn, problemType);

      // Create and train multiple models
      const autoMLResults = await this.performAutoML(dataset, targetColumn, problemType, recommendations, userId);

      return this.createResponse(
        autoMLResults,
        'AutoML process completed successfully'
      );
    } catch (error) {
      this.handleError(error, 'AUTO_ML');
    }
  }

  /**
   * Monitor model performance in production
   */
  async monitorModel(modelId: string): Promise<AnalyticsApiResponse<any>> {
    try {
      this.logOperation('MONITOR_MODEL', 'MLModel', modelId);

      const model = await this.modelRepository.findOne({
        where: { id: modelId },
      });

      if (!model) {
        throw new NotFoundException(`ML model with ID ${modelId} not found`);
      }

      const monitoring = await this.getModelMonitoringData(model);

      return this.createResponse(
        monitoring,
        'Model monitoring data retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'MONITOR_MODEL');
    }
  }

  /**
   * Get all models with pagination
   */
  async getModels(
    page: number = 1,
    limit: number = 10,
    filters: Record<string, any> = {}
  ): Promise<AnalyticsApiResponse<PaginatedAnalyticsResponse<MLModelDto>>> {
    try {
      this.logOperation('GET_ML_MODELS', 'MLModel');

      const queryBuilder = this.modelRepository
        .createQueryBuilder('model')
        .leftJoinAndSelect('model.trainingDataset', 'trainingDataset')
        .leftJoinAndSelect('model.validationDataset', 'validationDataset')
        .select();

      // Apply filters
      this.applyFilters(queryBuilder, filters, 'model');

      // Apply pagination
      this.applyPagination(queryBuilder, page, limit);

      // Apply sorting
      this.applySorting(queryBuilder, 'model.createdAt', 'DESC');

      const [models, total] = await queryBuilder.getManyAndCount();

      const modelDtos = await Promise.all(
        models.map((model) => this.mapModelToDto(model))
      );

      const paginatedResponse = this.createPaginatedResponse(
        modelDtos,
        total,
        page,
        limit,
        filters
      );

      return this.createResponse(
        paginatedResponse,
        'ML models retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_ML_MODELS');
    }
  }

  /**
   * Get model by ID
   */
  async getModelById(modelId: string): Promise<AnalyticsApiResponse<MLModelDto>> {
    try {
      this.logOperation('GET_ML_MODEL_BY_ID', 'MLModel', modelId);

      const model = await this.modelRepository.findOne({
        where: { id: modelId },
        relations: ['trainingDataset', 'validationDataset'],
      });

      if (!model) {
        throw new NotFoundException(`ML model with ID ${modelId} not found`);
      }

      const modelDto = await this.mapModelToDto(model);

      return this.createResponse(
        modelDto,
        'ML model retrieved successfully'
      );
    } catch (error) {
      this.handleError(error, 'GET_ML_MODEL_BY_ID');
    }
  }

  /**
   * Perform model training
   */
  private async performModelTraining(
    model: MLModel,
    dataset: AnalyticsDataset,
    trainConfig: TrainMLModelDto
  ): Promise<any> {
    const startTime = Date.now();

    try {
      // Mock training process - in real implementation, this would:
      // 1. Load and prepare data from dataset
      // 2. Split data into train/validation sets
      // 3. Apply preprocessing
      // 4. Train the model with specified hyperparameters
      // 5. Validate and save the trained model

      // Simulate training time
      const trainingDuration = this.estimateTrainingDuration(model.type, dataset) * 1000;
      await new Promise(resolve => setTimeout(resolve, Math.min(trainingDuration, 5000))); // Cap at 5s for demo

      // Mock training results
      const trainingResults = {
        accuracy: 0.85 + Math.random() * 0.1, // 85-95% accuracy
        loss: Math.random() * 0.3, // 0-30% loss
        epochs: trainConfig.epochs || 100,
        trainingTime: Date.now() - startTime,
        validationAccuracy: 0.82 + Math.random() * 0.08,
        validationLoss: Math.random() * 0.35,
        metrics: this.generateTrainingMetrics(model.type),
        modelSize: Math.floor(Math.random() * 50 + 10), // 10-60 MB
        artifacts: {
          modelFile: `models/${model.id}/model.pkl`,
          metricsFile: `models/${model.id}/metrics.json`,
          configFile: `models/${model.id}/config.json`,
        },
      };

      return trainingResults;
    } catch (error) {
      throw new Error(`Training failed: ${error.message}`);
    }
  }

  /**
   * Perform prediction
   */
  private async performPrediction(model: MLModel, predictionDto: CreateMLPredictionDto): Promise<any> {
    // Mock prediction - in real implementation, this would:
    // 1. Load the trained model
    // 2. Preprocess input data
    // 3. Make predictions
    // 4. Post-process results

    const inputData = predictionDto.inputData;
    const predictions = [];
    const confidences = [];

    // Generate mock predictions based on model type
    for (let i = 0; i < (Array.isArray(inputData) ? inputData.length : 1); i++) {
      switch (model.type) {
        case ModelType.CLASSIFICATION:
          predictions.push(['Class A', 'Class B', 'Class C'][Math.floor(Math.random() * 3)]);
          confidences.push(0.7 + Math.random() * 0.3);
          break;
        case ModelType.REGRESSION:
          predictions.push(Math.random() * 1000);
          confidences.push(0.8 + Math.random() * 0.2);
          break;
        case ModelType.TIME_SERIES:
          predictions.push(Array.from({ length: 10 }, () => Math.random() * 100));
          confidences.push(0.75 + Math.random() * 0.25);
          break;
        default:
          predictions.push(Math.random());
          confidences.push(0.8);
      }
    }

    return {
      predictions: predictions.length === 1 ? predictions[0] : predictions,
      confidence: confidences.length === 1 ? confidences[0] : confidences,
      metadata: {
        modelVersion: model.version,
        predictionTime: Date.now(),
        inputShape: Array.isArray(inputData) ? inputData.length : 1,
        processingTime: Math.random() * 100 + 10, // 10-110ms
      },
    };
  }

  /**
   * Calculate model metrics
   */
  private async calculateModelMetrics(model: MLModel): Promise<any> {
    // Get recent predictions for metrics calculation
    const recentPredictions = await this.predictionRepository.find({
      where: { model: { id: model.id } },
      order: { executedAt: 'DESC' },
      take: 1000,
    });

    return {
      totalPredictions: recentPredictions.length,
      averageConfidence: recentPredictions.reduce((sum, p) => sum + (p.confidence || 0), 0) / recentPredictions.length || 0,
      predictionsToday: recentPredictions.filter(p => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return p.executedAt >= today;
      }).length,
      accuracy: model.accuracy || 0,
      lastPrediction: recentPredictions[0]?.executedAt,
      modelSize: `${Math.floor(Math.random() * 50 + 10)} MB`,
      trainingTime: model.trainingTime || Math.floor(Math.random() * 3600 + 300), // seconds
      deploymentStatus: model.deploymentStatus || 'not_deployed',
      version: model.version,
      performance: {
        latency: `${Math.floor(Math.random() * 50 + 10)}ms`,
        throughput: `${Math.floor(Math.random() * 1000 + 100)} predictions/sec`,
        memoryUsage: `${Math.floor(Math.random() * 500 + 100)} MB`,
        cpuUsage: `${Math.floor(Math.random() * 30 + 5)}%`,
      },
    };
  }

  /**
   * Perform model evaluation
   */
  private async performModelEvaluation(model: MLModel, evaluationDataset: AnalyticsDataset): Promise<any> {
    // Mock evaluation - in real implementation, this would:
    // 1. Load evaluation dataset
    // 2. Make predictions on evaluation data
    // 3. Compare predictions with ground truth
    // 4. Calculate various metrics

    const evaluation = {
      accuracy: 0.82 + Math.random() * 0.15,
      precision: 0.80 + Math.random() * 0.18,
      recall: 0.78 + Math.random() * 0.20,
      f1Score: 0.79 + Math.random() * 0.19,
      auc: 0.85 + Math.random() * 0.12,
      confusionMatrix: model.type === ModelType.CLASSIFICATION ? [
        [85, 12, 3],
        [8, 92, 5],
        [7, 6, 87]
      ] : null,
      rSquared: model.type === ModelType.REGRESSION ? 0.75 + Math.random() * 0.20 : null,
      meanAbsoluteError: model.type === ModelType.REGRESSION ? Math.random() * 10 : null,
      rootMeanSquareError: model.type === ModelType.REGRESSION ? Math.random() * 15 : null,
      evaluatedAt: new Date(),
      evaluationDatasetId: evaluationDataset.id,
      sampleSize: Math.floor(Math.random() * 1000 + 500),
      metrics: this.generateEvaluationMetrics(model.type),
    };

    return evaluation;
  }

  /**
   * Generate default hyperparameters
   */
  private getDefaultHyperparameters(modelType: ModelType): Record<string, any> {
    const defaults = {
      [ModelType.CLASSIFICATION]: {
        learningRate: 0.001,
        batchSize: 32,
        epochs: 100,
        regularization: 0.01,
      },
      [ModelType.REGRESSION]: {
        learningRate: 0.01,
        batchSize: 64,
        epochs: 50,
        regularization: 0.001,
      },
      [ModelType.CLUSTERING]: {
        k: 5,
        maxIterations: 100,
        tolerance: 0.0001,
      },
      [ModelType.TIME_SERIES]: {
        windowSize: 24,
        horizonSize: 12,
        seasonality: 'auto',
        trendSmoothening: 0.1,
      },
    };

    return defaults[modelType] || {};
  }

  /**
   * Generate default configuration
   */
  private getDefaultConfiguration(modelType: ModelType): Record<string, any> {
    return {
      framework: 'tensorflow',
      version: '2.8.0',
      preprocessing: {
        standardization: true,
        normalization: false,
        featureSelection: 'auto',
      },
      validation: {
        method: 'k-fold',
        folds: 5,
        stratified: modelType === ModelType.CLASSIFICATION,
      },
      earlyStoppingï: {
        enabled: true,
        patience: 10,
        minDelta: 0.001,
      },
    };
  }

  /**
   * Estimate training duration
   */
  private estimateTrainingDuration(modelType: ModelType, dataset: AnalyticsDataset): number {
    // Return duration in seconds (for demo, we'll use small values)
    const baseDuration = {
      [ModelType.CLASSIFICATION]: 2,
      [ModelType.REGRESSION]: 1.5,
      [ModelType.CLUSTERING]: 1,
      [ModelType.TIME_SERIES]: 3,
    };

    return baseDuration[modelType] || 2;
  }

  /**
   * Generate training metrics based on model type
   */
  private generateTrainingMetrics(modelType: ModelType): Record<string, any> {
    const baseMetrics = {
      trainingLoss: Array.from({ length: 10 }, (_, i) => Math.max(0.1, 1 - i * 0.08 + Math.random() * 0.1)),
      validationLoss: Array.from({ length: 10 }, (_, i) => Math.max(0.15, 1.1 - i * 0.07 + Math.random() * 0.15)),
    };

    switch (modelType) {
      case ModelType.CLASSIFICATION:
        return {
          ...baseMetrics,
          trainingAccuracy: Array.from({ length: 10 }, (_, i) => Math.min(0.98, 0.5 + i * 0.04 + Math.random() * 0.02)),
          validationAccuracy: Array.from({ length: 10 }, (_, i) => Math.min(0.95, 0.45 + i * 0.04 + Math.random() * 0.03)),
        };
      case ModelType.REGRESSION:
        return {
          ...baseMetrics,
          r2Score: Array.from({ length: 10 }, (_, i) => Math.min(0.95, 0.3 + i * 0.06 + Math.random() * 0.05)),
          mae: Array.from({ length: 10 }, (_, i) => Math.max(0.1, 10 - i * 0.8 + Math.random() * 1)),
        };
      default:
        return baseMetrics;
    }
  }

  /**
   * Generate evaluation metrics
   */
  private generateEvaluationMetrics(modelType: ModelType): Record<string, any> {
    const base = {
      processingTime: Math.random() * 1000 + 500,
      memoryUsage: Math.random() * 1000 + 200,
    };

    switch (modelType) {
      case ModelType.CLASSIFICATION:
        return {
          ...base,
          classificationReport: {
            'Class A': { precision: 0.85, recall: 0.82, f1Score: 0.83 },
            'Class B': { precision: 0.88, recall: 0.91, f1Score: 0.89 },
            'Class C': { precision: 0.79, recall: 0.76, f1Score: 0.77 },
          },
        };
      case ModelType.REGRESSION:
        return {
          ...base,
          residualStats: {
            mean: Math.random() * 0.1 - 0.05,
            std: Math.random() * 0.5 + 0.1,
            skewness: Math.random() * 0.4 - 0.2,
          },
        };
      default:
        return base;
    }
  }

  /**
   * Register model in registry
   */
  private async registerModel(model: MLModel): Promise<void> {
    this.modelRegistry.set(model.id, {
      id: model.id,
      name: model.name,
      type: model.type,
      version: model.version,
      status: model.status,
      registeredAt: new Date(),
    });
  }

  /**
   * Handle training completion
   */
  private async handleTrainingCompletion(modelId: string, results: any): Promise<void> {
    try {
      const model = await this.modelRepository.findOne({ where: { id: modelId } });
      if (model) {
        model.status = ProcessingStatus.COMPLETED;
        model.accuracy = results.accuracy;
        model.trainingResults = results;
        model.trainingTime = results.trainingTime;
        await this.modelRepository.save(model);
        
        this.logOperation('TRAINING_COMPLETED', 'MLModel', modelId);
      }
    } catch (error) {
      this.logger.error(`Failed to update model after training completion: ${error.message}`);
    }
  }

  /**
   * Handle training failure
   */
  private async handleTrainingFailure(modelId: string, error: any): Promise<void> {
    try {
      const model = await this.modelRepository.findOne({ where: { id: modelId } });
      if (model) {
        model.status = ProcessingStatus.FAILED;
        model.trainingError = error.message;
        await this.modelRepository.save(model);
        
        this.logOperation('TRAINING_FAILED', 'MLModel', modelId);
      }
    } catch (updateError) {
      this.logger.error(`Failed to update model after training failure: ${updateError.message}`);
    }
  }

  /**
   * Perform model deployment
   */
  private async performModelDeployment(model: MLModel, deploymentConfig: any): Promise<any> {
    // Mock deployment process
    return {
      deploymentId: `deploy_${Date.now()}`,
      endpoint: `https://api.example.com/models/${model.id}/predict`,
      status: 'active',
      replicas: deploymentConfig.replicas || 2,
      resources: {
        cpu: deploymentConfig.cpu || '500m',
        memory: deploymentConfig.memory || '1Gi',
      },
      scaling: {
        minReplicas: deploymentConfig.minReplicas || 1,
        maxReplicas: deploymentConfig.maxReplicas || 10,
        targetCPU: deploymentConfig.targetCPU || 70,
      },
      deployedAt: new Date(),
    };
  }

  /**
   * Build model lineage
   */
  private async buildModelLineage(model: MLModel): Promise<any> {
    return {
      modelId: model.id,
      version: model.version,
      parentModels: [], // Models this was derived from
      childModels: [], // Models derived from this
      datasets: {
        training: model.trainingDataset ? {
          id: model.trainingDataset.id,
          name: model.trainingDataset.name,
          version: model.trainingDataset.version,
        } : null,
        validation: model.validationDataset ? {
          id: model.validationDataset.id,
          name: model.validationDataset.name,
          version: model.validationDataset.version,
        } : null,
      },
      experiments: [], // Related experiments
      artifacts: [
        { type: 'model', path: `models/${model.id}/model.pkl` },
        { type: 'config', path: `models/${model.id}/config.json` },
        { type: 'metrics', path: `models/${model.id}/metrics.json` },
      ],
      lineageGraph: {
        nodes: [
          { id: model.id, type: 'model', name: model.name },
        ],
        edges: [],
      },
    };
  }

  /**
   * Analyze dataset for AutoML
   */
  private async analyzeDatasetForAutoML(
    dataset: AnalyticsDataset,
    targetColumn: string,
    problemType: string
  ): Promise<any> {
    // Mock analysis for AutoML recommendations
    return {
      datasetAnalysis: {
        rows: 10000,
        columns: 15,
        targetColumn,
        problemType,
        classBalance: problemType === 'classification' ? 'balanced' : null,
        missingValues: 0.02, // 2% missing
        outliers: 0.05, // 5% outliers
      },
      recommendedModels: [
        {
          modelType: ModelType.CLASSIFICATION,
          algorithm: 'Random Forest',
          priority: 1,
          estimatedAccuracy: 0.87,
          trainingTime: '5 minutes',
        },
        {
          modelType: ModelType.CLASSIFICATION,
          algorithm: 'Gradient Boosting',
          priority: 2,
          estimatedAccuracy: 0.85,
          trainingTime: '8 minutes',
        },
        {
          modelType: ModelType.CLASSIFICATION,
          algorithm: 'Neural Network',
          priority: 3,
          estimatedAccuracy: 0.83,
          trainingTime: '15 minutes',
        },
      ],
      preprocessing: [
        'standard_scaling',
        'handle_missing_values',
        'outlier_detection',
        'feature_selection',
      ],
    };
  }

  /**
   * Perform AutoML
   */
  private async performAutoML(
    dataset: AnalyticsDataset,
    targetColumn: string,
    problemType: string,
    recommendations: any,
    userId: string
  ): Promise<any> {
    // Mock AutoML process that would:
    // 1. Create multiple models based on recommendations
    // 2. Train them in parallel
    // 3. Compare performance
    // 4. Select best model

    const autoMLModels = [];
    
    for (const rec of recommendations.recommendedModels.slice(0, 3)) {
      const model = await this.createModel({
        name: `AutoML ${rec.algorithm} - ${dataset.name}`,
        description: `Auto-generated ${rec.algorithm} model`,
        type: rec.modelType,
        trainingDatasetId: dataset.id,
        hyperparameters: this.getDefaultHyperparameters(rec.modelType),
        configuration: { ...this.getDefaultConfiguration(rec.modelType), autoML: true },
      }, userId);

      autoMLModels.push({
        model: model.data,
        recommendation: rec,
      });
    }

    return {
      experimentId: `automl_${Date.now()}`,
      dataset: {
        id: dataset.id,
        name: dataset.name,
      },
      problemType,
      targetColumn,
      modelsCreated: autoMLModels.length,
      models: autoMLModels,
      bestModel: autoMLModels[0]?.model, // First one as "best"
      recommendations: recommendations,
      status: 'completed',
      completedAt: new Date(),
    };
  }

  /**
   * Get model monitoring data
   */
  private async getModelMonitoringData(model: MLModel): Promise<any> {
    const recentPredictions = await this.predictionRepository.find({
      where: { model: { id: model.id } },
      order: { executedAt: 'DESC' },
      take: 100,
    });

    return {
      modelId: model.id,
      deploymentStatus: model.deploymentStatus,
      health: 'healthy',
      uptime: '99.9%',
      requestVolume: {
        total: recentPredictions.length,
        last24h: recentPredictions.filter(p => {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          return p.executedAt >= yesterday;
        }).length,
        trend: 'increasing',
      },
      performance: {
        averageLatency: Math.floor(Math.random() * 50 + 10),
        p95Latency: Math.floor(Math.random() * 100 + 50),
        errorRate: Math.random() * 0.01, // 0-1%
        throughput: Math.floor(Math.random() * 1000 + 100),
      },
      dataQuality: {
        score: 0.92 + Math.random() * 0.05,
        issues: [
          'Some features showing slight drift',
          'Missing values in 0.1% of requests',
        ],
      },
      modelDrift: {
        detected: false,
        lastCheck: new Date(),
        driftScore: Math.random() * 0.1,
        threshold: 0.05,
      },
      alerts: [
        {
          level: 'warning',
          message: 'Latency increased by 15% in last hour',
          timestamp: new Date(),
        },
      ],
    };
  }

  /**
   * Generate prediction cache key
   */
  private generatePredictionCacheKey(modelId: string, inputData: any): string {
    const dataHash = JSON.stringify(inputData);
    return this.generateCacheKey('prediction', modelId, dataHash);
  }

  /**
   * Map model entity to DTO
   */
  private async mapModelToDto(model: MLModel): Promise<MLModelDto> {
    return {
      id: model.id,
      name: model.name,
      description: model.description,
      type: model.type,
      status: model.status,
      version: model.version,
      trainingDatasetId: model.trainingDataset?.id,
      validationDatasetId: model.validationDataset?.id,
      hyperparameters: model.hyperparameters,
      configuration: model.configuration,
      accuracy: model.accuracy,
      trainingResults: model.trainingResults,
      evaluation: model.evaluation,
      deploymentStatus: model.deploymentStatus,
      deploymentConfig: model.deploymentConfig,
      isActive: model.isActive,
      createdBy: model.createdBy,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      lastTrainedAt: model.lastTrainedAt,
      lastTrainedBy: model.lastTrainedBy,
      deployedAt: model.deployedAt,
      deployedBy: model.deployedBy,
    };
  }

  /**
   * Map prediction entity to DTO
   */
  private async mapPredictionToDto(prediction: MLPrediction): Promise<MLPredictionDto> {
    return {
      id: prediction.id,
      modelId: prediction.model.id,
      inputData: prediction.inputData,
      outputData: prediction.outputData,
      confidence: prediction.confidence,
      metadata: prediction.metadata,
      executedBy: prediction.executedBy,
      executedAt: prediction.executedAt,
    };
  }
}
