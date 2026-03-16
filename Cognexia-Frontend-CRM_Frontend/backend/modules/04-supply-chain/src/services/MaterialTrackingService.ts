import { EventEmitter } from 'events';
import { logger } from '../../../utils/logger';

// Industry 5.0 Material Tracking Core Interfaces
export interface Material {
  materialId: string;
  materialCode: string;
  materialName: string;
  description: string;
  materialType: MaterialType;
  category: MaterialCategory;
  classification: MaterialClassification;
  specifications: MaterialSpecification;
  sustainability: MaterialSustainability;
  traceability: MaterialTraceability;
  qualityAttributes: QualityAttribute[];
  compliance: ComplianceInfo;
  lifecycle: MaterialLifecycle;
  digitalTwin: MaterialDigitalTwin;
  status: MaterialStatus;
  createdAt: Date;
  lastUpdated: Date;
}

export enum MaterialType {
  RAW_MATERIAL = 'raw_material',
  SEMI_FINISHED = 'semi_finished',
  FINISHED_GOODS = 'finished_goods',
  COMPONENT = 'component',
  ASSEMBLY = 'assembly',
  CONSUMABLE = 'consumable',
  PACKAGING = 'packaging',
  WASTE = 'waste',
  RECYCLED = 'recycled',
  BIO_BASED = 'bio_based'
}

export enum MaterialCategory {
  METALS = 'metals',
  PLASTICS = 'plastics',
  TEXTILES = 'textiles',
  CHEMICALS = 'chemicals',
  ELECTRONICS = 'electronics',
  CERAMICS = 'ceramics',
  COMPOSITES = 'composites',
  BIOMATERIALS = 'biomaterials',
  NANOMATERIALS = 'nanomaterials',
  SMART_MATERIALS = 'smart_materials'
}

export enum MaterialClassification {
  STRATEGIC = 'strategic',
  CRITICAL = 'critical',
  STANDARD = 'standard',
  COMMODITY = 'commodity',
  HAZARDOUS = 'hazardous',
  CONTROLLED = 'controlled',
  SUSTAINABLE = 'sustainable',
  EXPERIMENTAL = 'experimental'
}

export interface MaterialBatch {
  batchId: string;
  batchNumber: string;
  materialId: string;
  supplier: SupplierInfo;
  productionInfo: ProductionInfo;
  quantity: BatchQuantity;
  qualityData: BatchQualityData;
  trackingData: BatchTrackingData;
  location: LocationInfo;
  movements: MaterialMovement[];
  transformations: MaterialTransformation[];
  consumption: MaterialConsumption[];
  sustainability: BatchSustainability;
  alerts: MaterialAlert[];
  status: BatchStatus;
  createdAt: Date;
  lastUpdated: Date;
}

export interface ProductionInfo {
  productionDate: Date;
  productionFacility: string;
  productionLine: string;
  productionBatch: string;
  processParameters: ProcessParameter[];
  qualityChecks: QualityCheck[];
  operatorInfo: OperatorInfo;
  equipmentUsed: EquipmentInfo[];
  environmentalConditions: EnvironmentalCondition[];
}

export interface BatchQuantity {
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  consumedQuantity: number;
  wasteQuantity: number;
  unit: string;
  weight: number;
  volume: number;
  density: number;
}

export interface MaterialMovement {
  movementId: string;
  movementType: MovementType;
  fromLocation: LocationInfo;
  toLocation: LocationInfo;
  quantity: number;
  timestamp: Date;
  operator: OperatorInfo;
  transportMethod: TransportMethod;
  documentReference: string;
  conditions: TransportCondition[];
  tracking: MovementTracking;
  cost: MovementCost;
  sustainability: MovementSustainability;
}

export enum MovementType {
  RECEIPT = 'receipt',
  ISSUE = 'issue',
  TRANSFER = 'transfer',
  RETURN = 'return',
  ADJUSTMENT = 'adjustment',
  SCRAP = 'scrap',
  REWORK = 'rework',
  QUARANTINE = 'quarantine',
  RELEASE = 'release',
  DISPOSAL = 'disposal'
}

export interface MaterialTransformation {
  transformationId: string;
  transformationType: TransformationType;
  inputMaterials: TransformationInput[];
  outputMaterials: TransformationOutput[];
  process: ProcessInfo;
  timestamp: Date;
  operator: OperatorInfo;
  equipment: EquipmentInfo[];
  parameters: ProcessParameter[];
  qualityData: TransformationQuality;
  efficiency: TransformationEfficiency;
  sustainability: TransformationSustainability;
  aiInsights: AITransformationInsight[];
}

export enum TransformationType {
  MANUFACTURING = 'manufacturing',
  ASSEMBLY = 'assembly',
  PROCESSING = 'processing',
  MIXING = 'mixing',
  CUTTING = 'cutting',
  FORMING = 'forming',
  COATING = 'coating',
  PACKAGING = 'packaging',
  RECYCLING = 'recycling',
  UPCYCLING = 'upcycling'
}

export interface MaterialConsumption {
  consumptionId: string;
  consumptionType: ConsumptionType;
  quantity: number;
  timestamp: Date;
  consumer: ConsumerInfo;
  purpose: string;
  workOrder: string;
  efficiency: ConsumptionEfficiency;
  waste: WasteInfo;
  sustainability: ConsumptionSustainability;
}

export enum ConsumptionType {
  PRODUCTION = 'production',
  MAINTENANCE = 'maintenance',
  QUALITY_CONTROL = 'quality_control',
  RESEARCH = 'research',
  SAMPLE = 'sample',
  CALIBRATION = 'calibration',
  WASTE = 'waste',
  OBSOLETE = 'obsolete'
}

export interface LocationInfo {
  locationId: string;
  locationName: string;
  locationType: LocationType;
  facility: string;
  warehouse: string;
  zone: string;
  aisle: string;
  shelf: string;
  bin: string;
  coordinates: Coordinates;
  capacity: LocationCapacity;
  conditions: StorageCondition[];
  restrictions: LocationRestriction[];
  sensors: LocationSensor[];
}

export enum LocationType {
  RECEIVING = 'receiving',
  STORAGE = 'storage',
  PRODUCTION = 'production',
  QUALITY_CONTROL = 'quality_control',
  SHIPPING = 'shipping',
  QUARANTINE = 'quarantine',
  REWORK = 'rework',
  WASTE = 'waste',
  ARCHIVE = 'archive',
  VIRTUAL = 'virtual'
}

export interface Coordinates {
  x: number;
  y: number;
  z: number;
  latitude?: number;
  longitude?: number;
  altitude?: number;
}

export interface TrackingTechnology {
  technologyId: string;
  technologyType: TrackingTechnologyType;
  identifier: string;
  status: TechnologyStatus;
  readRange: number;
  accuracy: number;
  batteryLevel?: number;
  lastRead: Date;
  readHistory: TrackingRead[];
  configuration: TechnologyConfiguration;
}

export enum TrackingTechnologyType {
  RFID = 'rfid',
  NFC = 'nfc',
  BARCODE = 'barcode',
  QR_CODE = 'qr_code',
  BLUETOOTH = 'bluetooth',
  GPS = 'gps',
  IOT_SENSOR = 'iot_sensor',
  BLOCKCHAIN = 'blockchain',
  DIGITAL_WATERMARK = 'digital_watermark',
  BIOMETRIC = 'biometric'
}

export interface MaterialAlert {
  alertId: string;
  alertType: AlertType;
  severity: AlertSeverity;
  message: string;
  source: string;
  timestamp: Date;
  materialId: string;
  batchId?: string;
  locationId?: string;
  conditions: AlertCondition[];
  actions: AlertAction[];
  status: AlertStatus;
  acknowledgment: AlertAcknowledgment;
  resolution: AlertResolution;
}

export enum AlertType {
  EXPIRY = 'expiry',
  LOW_STOCK = 'low_stock',
  QUALITY_ISSUE = 'quality_issue',
  TEMPERATURE_DEVIATION = 'temperature_deviation',
  LOCATION_MISMATCH = 'location_mismatch',
  UNAUTHORIZED_MOVEMENT = 'unauthorized_movement',
  CONTAMINATION = 'contamination',
  DAMAGE = 'damage',
  RECALL = 'recall',
  COMPLIANCE_VIOLATION = 'compliance_violation'
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

export interface MaterialSustainability {
  sustainabilityScore: number;
  carbonFootprint: CarbonFootprint;
  lifecycle: SustainabilityLifecycle;
  certifications: SustainabilityCertification[];
  recycling: RecyclingInfo;
  biodegradability: BiodegradabilityInfo;
  toxicity: ToxicityInfo;
  energyContent: EnergyContent;
  waterFootprint: WaterFootprint;
  socialImpact: SocialImpact;
  circularityIndicators: CircularityIndicator[];
}

export interface CarbonFootprint {
  embodiedCarbon: number; // kg CO2 equivalent
  transportCarbon: number;
  processingCarbon: number;
  totalCarbon: number;
  carbonIntensity: number; // kg CO2/kg material
  scope1Emissions: number;
  scope2Emissions: number;
  scope3Emissions: number;
  offsetCredits: number;
  netCarbon: number;
}

export interface MaterialTraceability {
  traceabilityId: string;
  origin: MaterialOrigin;
  supplyChain: SupplyChainTrace[];
  certifications: TraceabilityCertification[];
  documentation: TraceabilityDocument[];
  blockchain: BlockchainTrace;
  verification: TraceabilityVerification;
  transparency: TransparencyLevel;
}

export interface MaterialOrigin {
  source: string;
  country: string;
  region: string;
  facility: string;
  extractionDate: Date;
  extractionMethod: string;
  geologicalInfo: GeologicalInfo;
  environmentalImpact: EnvironmentalImpact;
  socialContext: SocialContext;
  legalCompliance: LegalCompliance;
}

export interface MaterialLifecycle {
  stage: LifecycleStage;
  phases: LifecyclePhase[];
  durability: DurabilityInfo;
  degradation: DegradationInfo;
  endOfLife: EndOfLifeInfo;
  circularPath: CircularPath[];
  impacts: LifecycleImpact[];
  optimization: LifecycleOptimization;
}

export enum LifecycleStage {
  EXTRACTION = 'extraction',
  PROCESSING = 'processing',
  MANUFACTURING = 'manufacturing',
  DISTRIBUTION = 'distribution',
  USE = 'use',
  MAINTENANCE = 'maintenance',
  END_OF_LIFE = 'end_of_life',
  DISPOSAL = 'disposal',
  RECYCLING = 'recycling'
}

export interface MaterialDigitalTwin {
  twinId: string;
  enabled: boolean;
  accuracy: number;
  lastSync: Date;
  syncFrequency: number;
  modelType: DigitalTwinModelType;
  sensors: TwinSensor[];
  simulations: TwinSimulation[];
  predictions: TwinPrediction[];
  optimization: TwinOptimization;
  insights: TwinInsight[];
}

export enum DigitalTwinModelType {
  PHYSICAL = 'physical',
  BEHAVIORAL = 'behavioral',
  PREDICTIVE = 'predictive',
  HYBRID = 'hybrid'
}

export enum MaterialStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
  UNDER_REVIEW = 'under_review',
  QUARANTINED = 'quarantined',
  RECALLED = 'recalled',
  OBSOLETE = 'obsolete'
}

export enum BatchStatus {
  RECEIVED = 'received',
  INSPECTED = 'inspected',
  APPROVED = 'approved',
  QUARANTINED = 'quarantined',
  REJECTED = 'rejected',
  IN_USE = 'in_use',
  CONSUMED = 'consumed',
  EXPIRED = 'expired',
  DISPOSED = 'disposed'
}

export interface MaterialFlowAnalytics {
  flowId: string;
  analysisDate: Date;
  materialId: string;
  flowPattern: FlowPattern;
  velocityMetrics: VelocityMetric[];
  bottlenecks: FlowBottleneck[];
  efficiency: FlowEfficiency;
  waste: FlowWaste;
  sustainability: FlowSustainability;
  optimization: FlowOptimization;
  predictions: FlowPrediction[];
  recommendations: FlowRecommendation[];
}

export interface FlowPattern {
  patternType: FlowPatternType;
  frequency: number;
  seasonality: SeasonalPattern[];
  trends: FlowTrend[];
  anomalies: FlowAnomaly[];
  cycles: FlowCycle[];
}

export enum FlowPatternType {
  LINEAR = 'linear',
  CYCLICAL = 'cyclical',
  SEASONAL = 'seasonal',
  IRREGULAR = 'irregular',
  BATCH = 'batch',
  CONTINUOUS = 'continuous'
}

export class MaterialTrackingService extends EventEmitter {
  private materials: Map<string, Material> = new Map();
  private batches: Map<string, MaterialBatch> = new Map();
  private locations: Map<string, LocationInfo> = new Map();
  private trackingDevices: Map<string, TrackingTechnology> = new Map();
  private flowAnalyzer: MaterialFlowAnalyzer;
  private sustainabilityAnalyzer: MaterialSustainabilityAnalyzer;
  private aiPredictionEngine: MaterialAIPredictionEngine;
  private blockchainManager: MaterialBlockchainManager;
  private alertManager: MaterialAlertManager;
  private digitalTwinManager: MaterialDigitalTwinManager;
  private monitoringInterval: number = 30000; // 30 seconds
  private monitoringTimer?: NodeJS.Timeout;

  constructor() {
    super();
    this.initializeMaterialTrackingService();
  }

  private initializeMaterialTrackingService(): void {
    logger.info('Initializing Industry 5.0 Material Tracking Service');

    // Initialize AI and analytics components
    this.flowAnalyzer = new MaterialFlowAnalyzer();
    this.sustainabilityAnalyzer = new MaterialSustainabilityAnalyzer();
    this.aiPredictionEngine = new MaterialAIPredictionEngine();
    this.blockchainManager = new MaterialBlockchainManager();
    this.alertManager = new MaterialAlertManager();
    this.digitalTwinManager = new MaterialDigitalTwinManager();

    // Start real-time monitoring
    this.startMaterialMonitoring();
  }

  // Material Management
  public async registerMaterial(materialData: Partial<Material>): Promise<Material> {
    try {
      const material: Material = {
        materialId: materialData.materialId || `MAT-${Date.now()}`,
        materialCode: materialData.materialCode || await this.generateMaterialCode(materialData.materialType!, materialData.category!),
        materialName: materialData.materialName || 'Unknown Material',
        description: materialData.description || '',
        materialType: materialData.materialType!,
        category: materialData.category!,
        classification: materialData.classification || MaterialClassification.STANDARD,
        specifications: materialData.specifications || await this.createDefaultSpecifications(materialData),
        sustainability: materialData.sustainability || await this.initializeSustainabilityProfile(materialData),
        traceability: materialData.traceability || await this.initializeTraceability(materialData),
        qualityAttributes: materialData.qualityAttributes || [],
        compliance: materialData.compliance || await this.initializeCompliance(materialData),
        lifecycle: materialData.lifecycle || await this.initializeLifecycle(materialData),
        digitalTwin: materialData.digitalTwin || await this.createDigitalTwin(materialData),
        status: MaterialStatus.ACTIVE,
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      this.materials.set(material.materialId, material);

      // Initialize blockchain record
      await this.blockchainManager.createMaterialRecord(material);

      // Set up sustainability monitoring
      await this.sustainabilityAnalyzer.initializeMaterialMonitoring(material);

      logger.info(`Material ${material.materialId} registered successfully`);
      this.emit('material_registered', material);

      return material;

    } catch (error) {
      logger.error('Failed to register material:', error);
      throw error;
    }
  }

  // Batch Creation and Management
  public async createMaterialBatch(batchData: Partial<MaterialBatch>): Promise<MaterialBatch> {
    const material = this.materials.get(batchData.materialId!);
    if (!material) {
      throw new Error(`Material ${batchData.materialId} not found`);
    }

    try {
      const batch: MaterialBatch = {
        batchId: batchData.batchId || `BATCH-${Date.now()}`,
        batchNumber: batchData.batchNumber || await this.generateBatchNumber(batchData.materialId!),
        materialId: batchData.materialId!,
        supplier: batchData.supplier!,
        productionInfo: batchData.productionInfo!,
        quantity: batchData.quantity!,
        qualityData: batchData.qualityData || await this.initializeBatchQuality(batchData),
        trackingData: await this.initializeBatchTracking(batchData),
        location: batchData.location!,
        movements: [],
        transformations: [],
        consumption: [],
        sustainability: await this.analyzeBatchSustainability(batchData, material),
        alerts: [],
        status: BatchStatus.RECEIVED,
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      this.batches.set(batch.batchId, batch);

      // Create blockchain entry for batch
      await this.blockchainManager.createBatchRecord(batch, material);

      // Initialize AI monitoring
      await this.aiPredictionEngine.initializeBatchMonitoring(batch);

      // Create digital twin if enabled
      if (material.digitalTwin.enabled) {
        await this.digitalTwinManager.createBatchTwin(batch, material);
      }

      // Generate tracking technologies
      await this.assignTrackingTechnologies(batch);

      logger.info(`Material batch ${batch.batchId} created successfully`);
      this.emit('batch_created', batch);

      return batch;

    } catch (error) {
      logger.error('Failed to create material batch:', error);
      throw error;
    }
  }

  // Real-time Material Movement Tracking
  public async recordMaterialMovement(movementData: Partial<MaterialMovement>): Promise<MaterialMovement> {
    const batch = this.batches.get(movementData.fromLocation?.locationId || movementData.toLocation?.locationId || '');
    if (!batch) {
      // Find batch by scanning all batches - more comprehensive search needed
      const foundBatch = await this.findBatchForMovement(movementData);
      if (!foundBatch) {
        throw new Error('No batch found for material movement');
      }
    }

    try {
      const movement: MaterialMovement = {
        movementId: `MOV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        movementType: movementData.movementType!,
        fromLocation: movementData.fromLocation!,
        toLocation: movementData.toLocation!,
        quantity: movementData.quantity!,
        timestamp: new Date(),
        operator: movementData.operator!,
        transportMethod: movementData.transportMethod!,
        documentReference: movementData.documentReference || '',
        conditions: movementData.conditions || [],
        tracking: await this.captureMovementTracking(movementData),
        cost: await this.calculateMovementCost(movementData),
        sustainability: await this.assessMovementSustainability(movementData)
      };

      // Update batch location and quantities
      await this.updateBatchFromMovement(movement);

      // Record in blockchain
      await this.blockchainManager.recordMovement(movement);

      // AI analysis of movement patterns
      await this.aiPredictionEngine.analyzeMovementPattern(movement);

      // Check for alerts
      await this.checkMovementAlerts(movement);

      // Update digital twin
      await this.digitalTwinManager.updateFromMovement(movement);

      logger.info(`Material movement ${movement.movementId} recorded successfully`);
      this.emit('material_moved', movement);

      return movement;

    } catch (error) {
      logger.error('Failed to record material movement:', error);
      throw error;
    }
  }

  // Material Transformation Tracking
  public async recordMaterialTransformation(transformationData: Partial<MaterialTransformation>): Promise<MaterialTransformation> {
    try {
      const transformation: MaterialTransformation = {
        transformationId: `TRANS-${Date.now()}`,
        transformationType: transformationData.transformationType!,
        inputMaterials: transformationData.inputMaterials!,
        outputMaterials: transformationData.outputMaterials!,
        process: transformationData.process!,
        timestamp: new Date(),
        operator: transformationData.operator!,
        equipment: transformationData.equipment || [],
        parameters: transformationData.parameters || [],
        qualityData: transformationData.qualityData || await this.captureTransformationQuality(transformationData),
        efficiency: await this.calculateTransformationEfficiency(transformationData),
        sustainability: await this.assessTransformationSustainability(transformationData),
        aiInsights: await this.aiPredictionEngine.generateTransformationInsights(transformationData)
      };

      // Update input batches
      for (const input of transformation.inputMaterials) {
        const batch = this.batches.get(input.batchId);
        if (batch) {
          batch.transformations.push(transformation);
          batch.quantity.consumedQuantity += input.quantity;
          batch.quantity.availableQuantity -= input.quantity;
        }
      }

      // Create output batches if needed
      for (const output of transformation.outputMaterials) {
        if (output.createNewBatch) {
          await this.createTransformationOutputBatch(output, transformation);
        }
      }

      // Record in blockchain
      await this.blockchainManager.recordTransformation(transformation);

      // Update sustainability metrics
      await this.sustainabilityAnalyzer.updateFromTransformation(transformation);

      logger.info(`Material transformation ${transformation.transformationId} recorded successfully`);
      this.emit('material_transformed', transformation);

      return transformation;

    } catch (error) {
      logger.error('Failed to record material transformation:', error);
      throw error;
    }
  }

  // AI-Powered Material Flow Analysis
  public async analyzeMaterialFlow(materialId: string, timeRange?: DateRange): Promise<MaterialFlowAnalytics> {
    const material = this.materials.get(materialId);
    if (!material) {
      throw new Error(`Material ${materialId} not found`);
    }

    try {
      const analytics = await this.flowAnalyzer.analyzeFlow(material, timeRange);

      // AI-enhanced insights
      const aiInsights = await this.aiPredictionEngine.generateFlowInsights(analytics);
      analytics.recommendations.push(...aiInsights.recommendations);
      analytics.predictions.push(...aiInsights.predictions);

      // Sustainability flow analysis
      const sustainabilityAnalysis = await this.sustainabilityAnalyzer.analyzeFlow(analytics);
      analytics.sustainability = sustainabilityAnalysis;

      this.emit('flow_analysis_completed', { materialId, analytics });

      return analytics;

    } catch (error) {
      logger.error(`Failed to analyze material flow for ${materialId}:`, error);
      throw error;
    }
  }

  // Sustainability Impact Tracking
  public async trackSustainabilityImpact(batchId: string): Promise<SustainabilityImpactReport> {
    const batch = this.batches.get(batchId);
    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }

    try {
      const report = await this.sustainabilityAnalyzer.generateImpactReport(batch);

      // Update batch sustainability metrics
      batch.sustainability = await this.sustainabilityAnalyzer.updateBatchMetrics(batch, report);

      // AI-powered optimization recommendations
      const optimizations = await this.aiPredictionEngine.generateSustainabilityOptimizations(batch, report);
      report.optimizations = optimizations;

      this.emit('sustainability_impact_tracked', { batchId, report });

      return report;

    } catch (error) {
      logger.error(`Failed to track sustainability impact for batch ${batchId}:`, error);
      throw error;
    }
  }

  // Intelligent Material Demand Prediction
  public async predictMaterialDemand(
    materialId: string, 
    forecastHorizon: number
  ): Promise<MaterialDemandForecast> {
    const material = this.materials.get(materialId);
    if (!material) {
      throw new Error(`Material ${materialId} not found`);
    }

    try {
      // AI-powered demand forecasting
      const forecast = await this.aiPredictionEngine.predictDemand(material, forecastHorizon);

      // Consider sustainability factors
      const sustainabilityFactors = await this.sustainabilityAnalyzer.getDemandFactors(material);
      forecast.sustainabilityConsiderations = sustainabilityFactors;

      // Market intelligence integration
      const marketFactors = await this.getMarketFactors(material);
      forecast.marketFactors = marketFactors;

      this.emit('demand_forecast_generated', { materialId, forecast });

      return forecast;

    } catch (error) {
      logger.error(`Failed to predict material demand for ${materialId}:`, error);
      throw error;
    }
  }

  // Material Quality Monitoring
  public async monitorMaterialQuality(batchId: string): Promise<QualityMonitoringResult> {
    const batch = this.batches.get(batchId);
    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }

    try {
      // Real-time quality monitoring
      const qualityResult = await this.performQualityAnalysis(batch);

      // AI-powered quality prediction
      const qualityPrediction = await this.aiPredictionEngine.predictQualityDegradation(batch);
      qualityResult.predictions = qualityPrediction;

      // Update batch quality data
      batch.qualityData = await this.updateBatchQualityData(batch, qualityResult);

      // Check for quality alerts
      await this.alertManager.checkQualityAlerts(batch, qualityResult);

      this.emit('quality_monitored', { batchId, result: qualityResult });

      return qualityResult;

    } catch (error) {
      logger.error(`Failed to monitor material quality for batch ${batchId}:`, error);
      throw error;
    }
  }

  // Blockchain-based Material Provenance
  public async getMaterialProvenance(batchId: string): Promise<MaterialProvenance> {
    const batch = this.batches.get(batchId);
    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }

    try {
      const provenance = await this.blockchainManager.getFullProvenance(batch);

      // AI-enhanced provenance verification
      const verification = await this.aiPredictionEngine.verifyProvenance(provenance);
      provenance.verification = verification;

      this.emit('provenance_retrieved', { batchId, provenance });

      return provenance;

    } catch (error) {
      logger.error(`Failed to get material provenance for batch ${batchId}:`, error);
      throw error;
    }
  }

  // Real-time Dashboard and Analytics
  public async getMaterialTrackingDashboard(): Promise<MaterialTrackingDashboard> {
    try {
      const allMaterials = Array.from(this.materials.values());
      const allBatches = Array.from(this.batches.values());

      return {
        totalMaterials: allMaterials.length,
        activeBatches: allBatches.filter(b => b.status === BatchStatus.IN_USE).length,
        materialsByType: this.groupMaterialsByType(allMaterials),
        batchesByStatus: this.groupBatchesByStatus(allBatches),
        locationUtilization: await this.calculateLocationUtilization(),
        movementStats: await this.calculateMovementStatistics(),
        sustainabilityMetrics: await this.calculateSustainabilityMetrics(allBatches),
        qualityMetrics: await this.calculateQualityMetrics(allBatches),
        flowAnalytics: await this.calculateFlowAnalytics(allBatches),
        alerts: await this.alertManager.getActiveAlerts(),
        predictions: await this.aiPredictionEngine.getSystemPredictions(),
        optimization: await this.getOptimizationOpportunities(),
        traceabilityStatus: await this.getTraceabilityStatus(allBatches),
        digitalTwinStatus: await this.digitalTwinManager.getSystemStatus(),
        timestamp: new Date()
      };

    } catch (error) {
      logger.error('Failed to generate material tracking dashboard:', error);
      throw error;
    }
  }

  // Search and Query
  public async searchMaterials(criteria: MaterialSearchCriteria): Promise<Material[]> {
    try {
      let results = Array.from(this.materials.values());

      // Apply filters
      if (criteria.materialType) {
        results = results.filter(m => m.materialType === criteria.materialType);
      }

      if (criteria.category) {
        results = results.filter(m => m.category === criteria.category);
      }

      if (criteria.classification) {
        results = results.filter(m => m.classification === criteria.classification);
      }

      if (criteria.sustainabilityScore) {
        results = results.filter(m => 
          m.sustainability.sustainabilityScore >= criteria.sustainabilityScore!
        );
      }

      if (criteria.location) {
        const batchesInLocation = Array.from(this.batches.values())
          .filter(b => b.location.locationName === criteria.location);
        const materialIds = new Set(batchesInLocation.map(b => b.materialId));
        results = results.filter(m => materialIds.has(m.materialId));
      }

      // Apply sorting
      if (criteria.sortBy) {
        results = this.sortMaterials(results, criteria.sortBy, criteria.sortOrder || 'desc');
      }

      // Apply pagination
      if (criteria.limit) {
        const offset = criteria.offset || 0;
        results = results.slice(offset, offset + criteria.limit);
      }

      return results;

    } catch (error) {
      logger.error('Failed to search materials:', error);
      throw error;
    }
  }

  public async trackMaterialsByRFID(rfidTag: string): Promise<MaterialBatch[]> {
    try {
      const batches = Array.from(this.batches.values()).filter(batch =>
        batch.trackingData.technologies.some(tech =>
          tech.technologyType === TrackingTechnologyType.RFID &&
          tech.identifier === rfidTag
        )
      );

      // Update last read time
      for (const batch of batches) {
        const rfidTech = batch.trackingData.technologies.find(tech =>
          tech.technologyType === TrackingTechnologyType.RFID &&
          tech.identifier === rfidTag
        );
        if (rfidTech) {
          rfidTech.lastRead = new Date();
        }
      }

      this.emit('materials_tracked_by_rfid', { rfidTag, batches });

      return batches;

    } catch (error) {
      logger.error(`Failed to track materials by RFID ${rfidTag}:`, error);
      throw error;
    }
  }

  // Private helper methods
  private startMaterialMonitoring(): void {
    this.monitoringTimer = setInterval(async () => {
      await this.performMonitoringCycle();
    }, this.monitoringInterval);

    logger.info('Material tracking monitoring started');
  }

  private async performMonitoringCycle(): Promise<void> {
    for (const [batchId, batch] of this.batches) {
      try {
        // Monitor location sensors
        await this.monitorLocationSensors(batch);

        // Check expiry dates
        await this.checkExpiryAlerts(batch);

        // Monitor quality degradation
        await this.monitorQualityDegradation(batch);

        // Update sustainability metrics
        await this.updateSustainabilityTracking(batch);

        // Check digital twin synchronization
        await this.digitalTwinManager.syncBatchTwin(batch);

      } catch (error) {
        logger.error(`Error in monitoring cycle for batch ${batchId}:`, error);
      }
    }

    // System-wide analytics
    await this.performSystemAnalytics();
  }

  // Additional helper methods would be implemented here...
  private async generateMaterialCode(type: MaterialType, category: MaterialCategory): Promise<string> {
    return `${type.toUpperCase().substr(0, 3)}-${category.toUpperCase().substr(0, 3)}-${Date.now().toString().substr(-6)}`;
  }
  private async createDefaultSpecifications(data: Partial<Material>): Promise<MaterialSpecification> { return {} as MaterialSpecification; }
  private async initializeSustainabilityProfile(data: Partial<Material>): Promise<MaterialSustainability> { return {} as MaterialSustainability; }
  private async initializeTraceability(data: Partial<Material>): Promise<MaterialTraceability> { return {} as MaterialTraceability; }
  private async initializeCompliance(data: Partial<Material>): Promise<ComplianceInfo> { return {} as ComplianceInfo; }
  private async initializeLifecycle(data: Partial<Material>): Promise<MaterialLifecycle> { return {} as MaterialLifecycle; }
  private async createDigitalTwin(data: Partial<Material>): Promise<MaterialDigitalTwin> { return {} as MaterialDigitalTwin; }
}

// Supporting interfaces and classes
interface MaterialSearchCriteria {
  materialType?: MaterialType;
  category?: MaterialCategory;
  classification?: MaterialClassification;
  sustainabilityScore?: number;
  location?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface MaterialTrackingDashboard {
  totalMaterials: number;
  activeBatches: number;
  materialsByType: Record<string, number>;
  batchesByStatus: Record<string, number>;
  locationUtilization: LocationUtilization[];
  movementStats: MovementStatistics;
  sustainabilityMetrics: SustainabilityMetrics;
  qualityMetrics: QualityMetrics;
  flowAnalytics: FlowAnalytics;
  alerts: MaterialAlert[];
  predictions: SystemPrediction[];
  optimization: OptimizationOpportunity[];
  traceabilityStatus: TraceabilityStatus;
  digitalTwinStatus: DigitalTwinSystemStatus;
  timestamp: Date;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Supporting classes
class MaterialFlowAnalyzer {
  async analyzeFlow(material: Material, timeRange?: DateRange): Promise<MaterialFlowAnalytics> {
    return {} as MaterialFlowAnalytics;
  }
}

class MaterialSustainabilityAnalyzer {
  async initializeMaterialMonitoring(material: Material): Promise<void> { /* Implementation */ }
  async analyzeBatchSustainability(batchData: Partial<MaterialBatch>, material: Material): Promise<BatchSustainability> { return {} as BatchSustainability; }
  async generateImpactReport(batch: MaterialBatch): Promise<SustainabilityImpactReport> { return {} as SustainabilityImpactReport; }
  async updateBatchMetrics(batch: MaterialBatch, report: SustainabilityImpactReport): Promise<BatchSustainability> { return {} as BatchSustainability; }
  async getDemandFactors(material: Material): Promise<any> { return {}; }
  async analyzeFlow(analytics: MaterialFlowAnalytics): Promise<FlowSustainability> { return {} as FlowSustainability; }
  async updateFromTransformation(transformation: MaterialTransformation): Promise<void> { /* Implementation */ }
}

class MaterialAIPredictionEngine {
  async initializeBatchMonitoring(batch: MaterialBatch): Promise<void> { /* Implementation */ }
  async analyzeMovementPattern(movement: MaterialMovement): Promise<void> { /* Implementation */ }
  async generateTransformationInsights(transformationData: Partial<MaterialTransformation>): Promise<AITransformationInsight[]> { return []; }
  async generateFlowInsights(analytics: MaterialFlowAnalytics): Promise<any> { return { recommendations: [], predictions: [] }; }
  async predictDemand(material: Material, horizon: number): Promise<MaterialDemandForecast> { return {} as MaterialDemandForecast; }
  async predictQualityDegradation(batch: MaterialBatch): Promise<QualityPrediction[]> { return []; }
  async verifyProvenance(provenance: MaterialProvenance): Promise<ProvenanceVerification> { return {} as ProvenanceVerification; }
  async generateSustainabilityOptimizations(batch: MaterialBatch, report: SustainabilityImpactReport): Promise<SustainabilityOptimization[]> { return []; }
  async getSystemPredictions(): Promise<SystemPrediction[]> { return []; }
}

class MaterialBlockchainManager {
  async createMaterialRecord(material: Material): Promise<void> { /* Implementation */ }
  async createBatchRecord(batch: MaterialBatch, material: Material): Promise<void> { /* Implementation */ }
  async recordMovement(movement: MaterialMovement): Promise<void> { /* Implementation */ }
  async recordTransformation(transformation: MaterialTransformation): Promise<void> { /* Implementation */ }
  async getFullProvenance(batch: MaterialBatch): Promise<MaterialProvenance> { return {} as MaterialProvenance; }
}

class MaterialAlertManager {
  async checkQualityAlerts(batch: MaterialBatch, result: QualityMonitoringResult): Promise<void> { /* Implementation */ }
  async getActiveAlerts(): Promise<MaterialAlert[]> { return []; }
}

class MaterialDigitalTwinManager {
  async createBatchTwin(batch: MaterialBatch, material: Material): Promise<void> { /* Implementation */ }
  async updateFromMovement(movement: MaterialMovement): Promise<void> { /* Implementation */ }
  async syncBatchTwin(batch: MaterialBatch): Promise<void> { /* Implementation */ }
  async getSystemStatus(): Promise<DigitalTwinSystemStatus> { return {} as DigitalTwinSystemStatus; }
}

export {
  MaterialTrackingService,
  MaterialType,
  MaterialCategory,
  MaterialClassification,
  MovementType,
  TransformationType,
  ConsumptionType,
  LocationType,
  TrackingTechnologyType,
  AlertType,
  MaterialStatus,
  BatchStatus
};
