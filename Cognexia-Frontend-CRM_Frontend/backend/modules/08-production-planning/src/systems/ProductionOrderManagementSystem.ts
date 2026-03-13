import { logger } from '../../../utils/logger';
import { CacheService } from '../../../services/CacheService';
import { SocketService } from '../../../services/SocketService';

export interface ProductionOrder {
  orderId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  productVersion: string;
  quantity: number;
  priority: OrderPriority;
  status: OrderStatus;
  customerInfo: CustomerInfo;
  orderDates: OrderDates;
  operations: OrderOperation[];
  batches: ProductionBatch[];
  lots: ProductionLot[];
  qualityRequirements: QualityRequirement[];
  materialRequirements: OrderMaterialRequirement[];
  resourceAllocations: OrderResourceAllocation[];
  traceabilityData: TraceabilityRecord[];
  complianceRequirements: ComplianceRequirement[];
  customFields: Record<string, any>;
  metadata: OrderMetadata;
}

export interface OrderPriority {
  level: 'low' | 'normal' | 'high' | 'urgent' | 'emergency';
  score: number; // 1-100
  reasoning: string;
  escalationRules: EscalationRule[];
}

export interface EscalationRule {
  condition: string;
  action: string;
  threshold: number;
  notificationTargets: string[];
  automaticExecution: boolean;
}

export interface OrderStatus {
  currentStatus: 'draft' | 'planned' | 'released' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  statusHistory: StatusHistoryEntry[];
  nextMilestones: Milestone[];
  blockers: OrderBlocker[];
  progressPercentage: number;
  estimatedCompletion: Date;
  actualCompletion?: Date;
}

export interface StatusHistoryEntry {
  status: string;
  timestamp: Date;
  changedBy: string;
  reason: string;
  duration?: number; // time spent in previous status (minutes)
  notes?: string;
}

export interface Milestone {
  milestoneId: string;
  name: string;
  description: string;
  targetDate: Date;
  dependencies: string[];
  criticalPath: boolean;
  completed: boolean;
  completedDate?: Date;
}

export interface OrderBlocker {
  blockerId: string;
  type: 'material_shortage' | 'resource_unavailable' | 'quality_issue' | 'approval_pending' | 'technical_issue';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  blockedSince: Date;
  estimatedResolution: Date;
  resolutionActions: ResolutionAction[];
  assignedTo: string;
}

export interface ResolutionAction {
  actionId: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
  priority: number;
}

export interface CustomerInfo {
  customerId: string;
  customerName: string;
  customerType: 'internal' | 'external' | 'oem' | 'distributor';
  priority: 'standard' | 'preferred' | 'vip';
  contactInfo: ContactInfo;
  specialRequirements: string[];
  qualityStandards: string[];
}

export interface ContactInfo {
  primaryContact: string;
  email: string;
  phone: string;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface OrderDates {
  orderDate: Date;
  requestedDate: Date;
  promisedDate: Date;
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  leadTime: number; // days
  bufferTime: number; // days
}

export interface OrderOperation {
  operationId: string;
  operationNumber: number;
  operationName: string;
  operationType: string;
  description: string;
  workCenter: string;
  standardTime: OperationTime;
  actualTime?: OperationTime;
  status: OperationStatus;
  dependencies: string[];
  qualityChecks: QualityCheck[];
  instructions: OperationInstruction[];
  toolsRequired: ToolRequirement[];
  skillsRequired: SkillRequirement[];
  safetyRequirements: SafetyRequirement[];
  documentReferences: DocumentReference[];
}

export interface OperationTime {
  setupTime: number; // minutes
  runTime: number; // minutes per unit
  teardownTime: number; // minutes
  queueTime: number; // minutes
  totalTime: number; // minutes
}

export interface OperationStatus {
  status: 'not_started' | 'setup' | 'running' | 'quality_check' | 'completed' | 'on_hold' | 'rework';
  startTime?: Date;
  endTime?: Date;
  operatorId?: string;
  machineId?: string;
  progressPercentage: number;
  qualityResults?: QualityResult[];
  issues: OperationIssue[];
}

export interface OperationIssue {
  issueId: string;
  type: string;
  description: string;
  severity: string;
  reportedBy: string;
  timestamp: Date;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface ProductionBatch {
  batchId: string;
  batchNumber: string;
  quantity: number;
  status: BatchStatus;
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  lots: string[]; // References to ProductionLot IDs
  qualityData: BatchQualityData;
  traceabilityData: BatchTraceabilityData;
  yield: YieldData;
  environmentalData: EnvironmentalData;
  complianceData: ComplianceData;
}

export interface BatchStatus {
  status: 'planned' | 'in_progress' | 'quality_hold' | 'completed' | 'rejected' | 'rework';
  completedQuantity: number;
  rejectedQuantity: number;
  reworkQuantity: number;
  scrapQuantity: number;
  progressPercentage: number;
}

export interface ProductionLot {
  lotId: string;
  lotNumber: string;
  batchId: string;
  quantity: number;
  serialNumbers?: string[];
  status: LotStatus;
  genealogy: LotGenealogy;
  qualityData: LotQualityData;
  traceabilityData: LotTraceabilityData;
  storageLocation: string;
  expiryDate?: Date;
  holdReason?: string;
  releaseDate?: Date;
  shippingData?: ShippingData;
}

export interface LotStatus {
  status: 'in_production' | 'quality_pending' | 'approved' | 'quarantine' | 'rejected' | 'shipped' | 'returned';
  lastUpdated: Date;
  updatedBy: string;
  notes?: string;
}

export interface LotGenealogy {
  parentLots: string[];
  childLots: string[];
  rawMaterials: RawMaterialUsage[];
  components: ComponentUsage[];
  processParameters: ProcessParameter[];
}

export interface RawMaterialUsage {
  materialId: string;
  materialCode: string;
  lotNumber: string;
  supplier: string;
  quantityUsed: number;
  unit: string;
  receivedDate: Date;
  expiryDate?: Date;
  qualityStatus: string;
}

export interface ComponentUsage {
  componentId: string;
  componentCode: string;
  serialNumber?: string;
  supplier: string;
  quantityUsed: number;
  installationDate: Date;
  warranty?: WarrantyInfo;
}

export interface WarrantyInfo {
  warrantyPeriod: number; // months
  warrantyStartDate: Date;
  warrantyEndDate: Date;
  warrantyTerms: string;
}

export interface ProcessParameter {
  parameterId: string;
  parameterName: string;
  value: number;
  unit: string;
  specification: ParameterSpecification;
  timestamp: Date;
  operatorId: string;
  machineId: string;
}

export interface ParameterSpecification {
  target: number;
  upperLimit: number;
  lowerLimit: number;
  tolerance: number;
  criticalParameter: boolean;
}

export interface BatchQualityData {
  qualityPlan: string;
  inspectionResults: InspectionResult[];
  testResults: TestResult[];
  certificationsObtained: Certification[];
  qualityScore: number;
  conformanceStatus: 'conforming' | 'non_conforming' | 'conditional';
  nonConformances: NonConformance[];
}

export interface InspectionResult {
  inspectionId: string;
  inspectionType: string;
  inspector: string;
  inspectionDate: Date;
  results: InspectionMeasurement[];
  overallResult: 'pass' | 'fail' | 'conditional';
  comments?: string;
}

export interface InspectionMeasurement {
  characteristic: string;
  measuredValue: number;
  specification: number;
  tolerance: number;
  unit: string;
  result: 'pass' | 'fail';
  deviation?: number;
}

export interface TestResult {
  testId: string;
  testType: string;
  testMethod: string;
  testDate: Date;
  operator: string;
  equipment: string;
  results: TestMeasurement[];
  conclusion: string;
  certificateNumber?: string;
}

export interface TestMeasurement {
  parameter: string;
  value: number;
  unit: string;
  specification: string;
  result: 'pass' | 'fail';
  uncertainty?: number;
}

export interface Certification {
  certificateId: string;
  certificateType: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate?: Date;
  scope: string;
  certificateNumber: string;
  status: 'valid' | 'expired' | 'suspended' | 'revoked';
}

export interface NonConformance {
  ncId: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  rootCause: string;
  correctiveActions: CorrectiveAction[];
  preventiveActions: PreventiveAction[];
  status: 'open' | 'in_progress' | 'closed' | 'verified';
}

export interface CorrectiveAction {
  actionId: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'verified';
  effectivenessCheck?: EffectivenessCheck;
}

export interface PreventiveAction {
  actionId: string;
  description: string;
  assignedTo: string;
  implementationDate: Date;
  status: 'planned' | 'implemented' | 'verified';
  scope: string;
}

export interface EffectivenessCheck {
  checkDate: Date;
  checkedBy: string;
  effective: boolean;
  comments: string;
  followUpRequired: boolean;
}

export interface BatchTraceabilityData {
  productionDate: Date;
  productionShift: string;
  productionLine: string;
  operators: OperatorInfo[];
  equipmentUsed: EquipmentUsage[];
  environmentalConditions: EnvironmentalCondition[];
  processDeviations: ProcessDeviation[];
}

export interface OperatorInfo {
  operatorId: string;
  operatorName: string;
  shift: string;
  certifications: string[];
  role: string;
  startTime: Date;
  endTime: Date;
}

export interface EquipmentUsage {
  equipmentId: string;
  equipmentType: string;
  utilizationTime: number;
  maintenanceStatus: string;
  calibrationStatus: string;
  lastCalibrationDate: Date;
  nextCalibrationDate: Date;
}

export interface EnvironmentalCondition {
  parameter: string;
  value: number;
  unit: string;
  timestamp: Date;
  acceptable: boolean;
  specification?: number;
  deviation?: number;
}

export interface ProcessDeviation {
  deviationId: string;
  type: string;
  description: string;
  impact: string;
  startTime: Date;
  endTime: Date;
  correctionAction: string;
  approvedBy: string;
}

export interface YieldData {
  plannedYield: number;
  actualYield: number;
  yieldVariance: number;
  firstPassYield: number;
  scrapRate: number;
  reworkRate: number;
  yieldLossReasons: YieldLossReason[];
}

export interface YieldLossReason {
  reason: string;
  category: string;
  quantityLost: number;
  costImpact: number;
  preventable: boolean;
  correctionAction?: string;
}

export interface EnvironmentalData {
  energyConsumption: number;
  waterUsage: number;
  wasteGenerated: number;
  emissions: EmissionData[];
  recyclingData: RecyclingData;
  sustainabilityScore: number;
}

export interface EmissionData {
  emissionType: string;
  quantity: number;
  unit: string;
  calculationMethod: string;
}

export interface RecyclingData {
  recyclableWaste: number;
  recycledContent: number;
  recyclingRate: number;
}

export interface ComplianceData {
  regulatoryRequirements: RegulatoryRequirement[];
  auditTrails: AuditTrail[];
  documentationStatus: DocumentationStatus;
  complianceScore: number;
}

export interface RegulatoryRequirement {
  requirementId: string;
  regulation: string;
  authority: string;
  description: string;
  complianceStatus: 'compliant' | 'non_compliant' | 'not_applicable';
  evidenceDocuments: string[];
  lastAssessment: Date;
  nextAssessment: Date;
}

export interface AuditTrail {
  eventId: string;
  eventType: string;
  timestamp: Date;
  userId: string;
  description: string;
  dataChanged: Record<string, any>;
  ipAddress: string;
  sessionId: string;
}

export interface DocumentationStatus {
  requiredDocuments: RequiredDocument[];
  completionPercentage: number;
  missingDocuments: string[];
  expiringDocuments: ExpiringDocument[];
}

export interface RequiredDocument {
  documentId: string;
  documentType: string;
  description: string;
  required: boolean;
  status: 'missing' | 'draft' | 'approved' | 'expired';
  lastUpdated?: Date;
  approver?: string;
}

export interface ExpiringDocument {
  documentId: string;
  documentType: string;
  expiryDate: Date;
  daysUntilExpiry: number;
  renewalRequired: boolean;
}

// Supporting interfaces continued...
export interface LotQualityData {
  qualityChecks: QualityCheck[];
  qualityScore: number;
  defectRate: number;
  qualityTrend: 'improving' | 'stable' | 'declining';
}

export interface LotTraceabilityData {
  componentTraceability: ComponentTraceability[];
  processTraceability: ProcessTraceability[];
  operatorTraceability: OperatorTraceability[];
}

export interface ComponentTraceability {
  componentId: string;
  serialNumber?: string;
  supplier: string;
  receivedDate: Date;
  inspectionResults: string;
  storageConditions: string;
}

export interface ProcessTraceability {
  processStep: string;
  timestamp: Date;
  parameters: Record<string, number>;
  operator: string;
  equipment: string;
  result: string;
}

export interface OperatorTraceability {
  operatorId: string;
  action: string;
  timestamp: Date;
  workstation: string;
  qualifications: string[];
}

export interface ShippingData {
  shipmentId: string;
  shipmentDate: Date;
  carrier: string;
  trackingNumber: string;
  destination: Address;
  packagingDetails: PackagingDetail[];
  specialInstructions: string[];
}

export interface PackagingDetail {
  packageType: string;
  quantity: number;
  weight: number;
  dimensions: Dimensions;
  handlingInstructions: string[];
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: string;
}

// Additional supporting interfaces
export interface QualityRequirement {
  requirementId: string;
  parameter: string;
  specification: string;
  testMethod: string;
  acceptance: string;
  critical: boolean;
}

export interface QualityCheck {
  checkId: string;
  checkType: string;
  frequency: string;
  inspector: string;
  equipment?: string;
  result?: QualityResult;
}

export interface QualityResult {
  result: 'pass' | 'fail' | 'conditional';
  measurements: Measurement[];
  comments?: string;
  timestamp: Date;
  inspector: string;
}

export interface Measurement {
  parameter: string;
  value: number;
  unit: string;
  specification: number;
  tolerance: number;
  result: 'pass' | 'fail';
}

export interface OrderMaterialRequirement {
  materialId: string;
  materialCode: string;
  description: string;
  quantityRequired: number;
  quantityAllocated: number;
  quantityConsumed: number;
  unit: string;
  reservationDate: Date;
  requiredDate: Date;
  supplier?: string;
  lotNumbers: string[];
}

export interface OrderResourceAllocation {
  resourceId: string;
  resourceType: 'machine' | 'workstation' | 'tool' | 'operator';
  allocationStart: Date;
  allocationEnd: Date;
  utilizationRate: number;
  efficiency: number;
  cost: number;
}

export interface TraceabilityRecord {
  recordId: string;
  recordType: string;
  timestamp: Date;
  data: Record<string, any>;
  relatedEntities: string[];
  digitallySigned: boolean;
  signature?: DigitalSignature;
}

export interface DigitalSignature {
  signatureId: string;
  signedBy: string;
  signatureDate: Date;
  algorithm: string;
  hash: string;
  certificateId: string;
}

export interface ComplianceRequirement {
  requirementId: string;
  standard: string;
  description: string;
  mandatory: boolean;
  status: 'compliant' | 'non_compliant' | 'pending';
  evidenceRequired: string[];
  lastAssessment?: Date;
  nextAssessment: Date;
}

export interface OrderMetadata {
  createdBy: string;
  createdAt: Date;
  lastModifiedBy: string;
  lastModifiedAt: Date;
  version: number;
  tags: string[];
  category: string;
  businessUnit: string;
  costCenter: string;
  project?: string;
  contract?: string;
}

// Remaining supporting interfaces
interface OperationInstruction {
  instructionId: string;
  instructionType: 'work' | 'safety' | 'quality' | 'setup';
  title: string;
  content: string;
  mediaAttachments: MediaAttachment[];
  language: string;
  version: string;
}

interface MediaAttachment {
  attachmentId: string;
  fileName: string;
  fileType: string;
  url: string;
  description?: string;
}

interface ToolRequirement {
  toolId: string;
  toolType: string;
  description: string;
  quantity: number;
  calibrationRequired: boolean;
  lastCalibrationDate?: Date;
}

interface SkillRequirement {
  skillId: string;
  skillName: string;
  requiredLevel: number;
  certificationRequired: boolean;
  alternativeSkills?: string[];
}

interface SafetyRequirement {
  requirementId: string;
  hazardType: string;
  protectionRequired: string[];
  safetyProcedure: string;
  emergencyResponse: string;
}

interface DocumentReference {
  documentId: string;
  documentType: string;
  title: string;
  version: string;
  url: string;
  required: boolean;
}

export class ProductionOrderManagementSystem {
  private orderStore: Map<string, ProductionOrder> = new Map();
  private batchStore: Map<string, ProductionBatch> = new Map();
  private lotStore: Map<string, ProductionLot> = new Map();
  private traceabilityEngine: TraceabilityEngine;
  private qualityEngine: QualityEngine;
  private complianceEngine: ComplianceEngine;

  constructor() {
    this.traceabilityEngine = new TraceabilityEngine();
    this.qualityEngine = new QualityEngine();
    this.complianceEngine = new ComplianceEngine();
    this.initializeSystem();
  }

  private initializeSystem(): void {
    logger.info('Initializing Production Order Management System...');
    // Initialize real-time monitoring
    this.startRealTimeMonitoring();
    logger.info('Production Order Management System initialized');
  }

  private startRealTimeMonitoring(): void {
    // Monitor order status changes every 30 seconds
    setInterval(async () => {
      await this.processStatusUpdates();
      await this.checkMilestones();
      await this.updateKPIs();
    }, 30000);
  }

  public async createProductionOrder(orderData: Partial<ProductionOrder>): Promise<ProductionOrder> {
    try {
      const orderId = `PO_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      const productionOrder: ProductionOrder = {
        orderId,
        orderNumber: orderData.orderNumber || this.generateOrderNumber(),
        productId: orderData.productId!,
        productName: orderData.productName!,
        productVersion: orderData.productVersion || '1.0',
        quantity: orderData.quantity!,
        priority: orderData.priority || { level: 'normal', score: 50, reasoning: 'Standard priority', escalationRules: [] },
        status: {
          currentStatus: 'draft',
          statusHistory: [{
            status: 'draft',
            timestamp: new Date(),
            changedBy: orderData.metadata?.createdBy || 'system',
            reason: 'Order created'
          }],
          nextMilestones: [],
          blockers: [],
          progressPercentage: 0,
          estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days
        },
        customerInfo: orderData.customerInfo!,
        orderDates: orderData.orderDates || this.generateDefaultDates(),
        operations: orderData.operations || [],
        batches: [],
        lots: [],
        qualityRequirements: orderData.qualityRequirements || [],
        materialRequirements: orderData.materialRequirements || [],
        resourceAllocations: orderData.resourceAllocations || [],
        traceabilityData: [],
        complianceRequirements: orderData.complianceRequirements || [],
        customFields: orderData.customFields || {},
        metadata: {
          createdBy: orderData.metadata?.createdBy || 'system',
          createdAt: new Date(),
          lastModifiedBy: orderData.metadata?.createdBy || 'system',
          lastModifiedAt: new Date(),
          version: 1,
          tags: orderData.metadata?.tags || [],
          category: orderData.metadata?.category || 'production',
          businessUnit: orderData.metadata?.businessUnit || 'manufacturing',
          costCenter: orderData.metadata?.costCenter || 'default'
        }
      };

      // Store the order
      this.orderStore.set(orderId, productionOrder);

      // Cache for persistence
      await CacheService.set(`production_order_${orderId}`, productionOrder, 86400);

      // Initialize traceability
      await this.traceabilityEngine.initializeOrderTraceability(productionOrder);

      // Emit real-time event
      SocketService.emitPlanUpdate('production_order_created', productionOrder);

      logger.info(`Production order created: ${orderId}`);
      return productionOrder;

    } catch (error) {
      logger.error('Error creating production order:', error);
      throw error;
    }
  }

  public async updateOrderStatus(
    orderId: string, 
    newStatus: string, 
    reason: string, 
    changedBy: string
  ): Promise<ProductionOrder> {
    try {
      const order = await this.getProductionOrder(orderId);
      if (!order) {
        throw new Error(`Production order ${orderId} not found`);
      }

      const previousStatus = order.status.currentStatus;
      const statusDuration = Date.now() - order.status.statusHistory[order.status.statusHistory.length - 1].timestamp.getTime();

      // Update status history
      order.status.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        changedBy,
        reason,
        duration: Math.round(statusDuration / 60000) // Convert to minutes
      });

      order.status.currentStatus = newStatus as any;
      order.metadata.lastModifiedBy = changedBy;
      order.metadata.lastModifiedAt = new Date();
      order.metadata.version++;

      // Update progress percentage based on status
      order.status.progressPercentage = this.calculateProgressPercentage(newStatus);

      // Create traceability record
      await this.traceabilityEngine.recordStatusChange(order, previousStatus, newStatus, changedBy, reason);

      // Update storage
      this.orderStore.set(orderId, order);
      await CacheService.set(`production_order_${orderId}`, order, 86400);

      // Emit real-time event
      SocketService.emitPlanUpdate('production_order_status_updated', {
        orderId,
        previousStatus,
        newStatus,
        timestamp: new Date(),
        changedBy
      });

      logger.info(`Production order ${orderId} status updated: ${previousStatus} -> ${newStatus}`);
      return order;

    } catch (error) {
      logger.error(`Error updating order status for ${orderId}:`, error);
      throw error;
    }
  }

  public async createProductionBatch(
    orderId: string, 
    batchData: Partial<ProductionBatch>
  ): Promise<ProductionBatch> {
    try {
      const order = await this.getProductionOrder(orderId);
      if (!order) {
        throw new Error(`Production order ${orderId} not found`);
      }

      const batchId = `BATCH_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      const batch: ProductionBatch = {
        batchId,
        batchNumber: batchData.batchNumber || this.generateBatchNumber(orderId),
        quantity: batchData.quantity!,
        status: {
          status: 'planned',
          completedQuantity: 0,
          rejectedQuantity: 0,
          reworkQuantity: 0,
          scrapQuantity: 0,
          progressPercentage: 0
        },
        plannedStartDate: batchData.plannedStartDate || new Date(),
        plannedEndDate: batchData.plannedEndDate || new Date(Date.now() + 24 * 60 * 60 * 1000),
        lots: [],
        qualityData: {
          qualityPlan: batchData.qualityData?.qualityPlan || 'standard',
          inspectionResults: [],
          testResults: [],
          certificationsObtained: [],
          qualityScore: 0,
          conformanceStatus: 'conforming',
          nonConformances: []
        },
        traceabilityData: {
          productionDate: new Date(),
          productionShift: this.getCurrentShift(),
          productionLine: batchData.traceabilityData?.productionLine || 'default',
          operators: [],
          equipmentUsed: [],
          environmentalConditions: [],
          processDeviations: []
        },
        yield: {
          plannedYield: 95, // Default 95% yield
          actualYield: 0,
          yieldVariance: 0,
          firstPassYield: 0,
          scrapRate: 0,
          reworkRate: 0,
          yieldLossReasons: []
        },
        environmentalData: {
          energyConsumption: 0,
          waterUsage: 0,
          wasteGenerated: 0,
          emissions: [],
          recyclingData: {
            recyclableWaste: 0,
            recycledContent: 0,
            recyclingRate: 0
          },
          sustainabilityScore: 0
        },
        complianceData: {
          regulatoryRequirements: [],
          auditTrails: [],
          documentationStatus: {
            requiredDocuments: [],
            completionPercentage: 0,
            missingDocuments: [],
            expiringDocuments: []
          },
          complianceScore: 0
        }
      };

      // Store the batch
      this.batchStore.set(batchId, batch);
      order.batches.push(batch);

      // Update order
      this.orderStore.set(orderId, order);
      await CacheService.set(`production_order_${orderId}`, order, 86400);
      await CacheService.set(`production_batch_${batchId}`, batch, 86400);

      // Initialize quality plan
      await this.qualityEngine.initializeBatchQualityPlan(batch, order);

      // Emit real-time event
      SocketService.emitPlanUpdate('production_batch_created', batch);

      logger.info(`Production batch created: ${batchId} for order ${orderId}`);
      return batch;

    } catch (error) {
      logger.error(`Error creating production batch for order ${orderId}:`, error);
      throw error;
    }
  }

  public async createProductionLot(
    batchId: string,
    lotData: Partial<ProductionLot>
  ): Promise<ProductionLot> {
    try {
      const batch = this.batchStore.get(batchId);
      if (!batch) {
        throw new Error(`Production batch ${batchId} not found`);
      }

      const lotId = `LOT_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      const lot: ProductionLot = {
        lotId,
        lotNumber: lotData.lotNumber || this.generateLotNumber(batchId),
        batchId,
        quantity: lotData.quantity!,
        serialNumbers: lotData.serialNumbers || [],
        status: {
          status: 'in_production',
          lastUpdated: new Date(),
          updatedBy: 'system'
        },
        genealogy: {
          parentLots: lotData.genealogy?.parentLots || [],
          childLots: [],
          rawMaterials: [],
          components: [],
          processParameters: []
        },
        qualityData: {
          qualityChecks: [],
          qualityScore: 0,
          defectRate: 0,
          qualityTrend: 'stable'
        },
        traceabilityData: {
          componentTraceability: [],
          processTraceability: [],
          operatorTraceability: []
        },
        storageLocation: lotData.storageLocation || 'production_floor',
        expiryDate: lotData.expiryDate
      };

      // Store the lot
      this.lotStore.set(lotId, lot);
      batch.lots.push(lotId);

      // Update batch
      this.batchStore.set(batchId, batch);
      await CacheService.set(`production_batch_${batchId}`, batch, 86400);
      await CacheService.set(`production_lot_${lotId}`, lot, 86400);

      // Initialize lot traceability
      await this.traceabilityEngine.initializeLotTraceability(lot, batch);

      // Emit real-time event
      SocketService.emitPlanUpdate('production_lot_created', lot);

      logger.info(`Production lot created: ${lotId} for batch ${batchId}`);
      return lot;

    } catch (error) {
      logger.error(`Error creating production lot for batch ${batchId}:`, error);
      throw error;
    }
  }

  public async recordQualityCheck(
    entityId: string,
    entityType: 'order' | 'batch' | 'lot',
    qualityCheck: QualityCheck,
    result: QualityResult
  ): Promise<void> {
    try {
      const updatedCheck = { ...qualityCheck, result };

      switch (entityType) {
        case 'batch':
          const batch = this.batchStore.get(entityId);
          if (batch) {
            batch.qualityData.inspectionResults.push({
              inspectionId: qualityCheck.checkId,
              inspectionType: qualityCheck.checkType,
              inspector: result.inspector,
              inspectionDate: result.timestamp,
              results: result.measurements.map(m => ({
                characteristic: m.parameter,
                measuredValue: m.value,
                specification: m.specification,
                tolerance: m.tolerance,
                unit: m.unit,
                result: m.result,
                deviation: m.value - m.specification
              })),
              overallResult: result.result,
              comments: result.comments
            });
            
            // Update quality score
            batch.qualityData.qualityScore = this.calculateQualityScore(batch.qualityData);
            
            this.batchStore.set(entityId, batch);
            await CacheService.set(`production_batch_${entityId}`, batch, 86400);
          }
          break;
          
        case 'lot':
          const lot = this.lotStore.get(entityId);
          if (lot) {
            lot.qualityData.qualityChecks.push(updatedCheck);
            lot.qualityData.qualityScore = this.calculateLotQualityScore(lot.qualityData);
            
            this.lotStore.set(entityId, lot);
            await CacheService.set(`production_lot_${entityId}`, lot, 86400);
          }
          break;
      }

      // Record traceability
      await this.traceabilityEngine.recordQualityCheck(entityId, entityType, updatedCheck);

      // Check for quality issues
      if (result.result === 'fail') {
        await this.handleQualityFailure(entityId, entityType, qualityCheck, result);
      }

      // Emit real-time event
      SocketService.emitPlanUpdate('quality_check_recorded', {
        entityId,
        entityType,
        checkId: qualityCheck.checkId,
        result: result.result,
        timestamp: new Date()
      });

      logger.info(`Quality check recorded for ${entityType} ${entityId}: ${result.result}`);

    } catch (error) {
      logger.error(`Error recording quality check for ${entityType} ${entityId}:`, error);
      throw error;
    }
  }

  // Helper methods
  private async getProductionOrder(orderId: string): Promise<ProductionOrder | null> {
    let order = this.orderStore.get(orderId);
    if (!order) {
      order = await CacheService.get(`production_order_${orderId}`);
      if (order) {
        this.orderStore.set(orderId, order);
      }
    }
    return order || null;
  }

  private generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const sequence = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `PO${year}${month}${sequence}`;
  }

  private generateBatchNumber(orderId: string): string {
    const orderSuffix = orderId.slice(-6);
    const timestamp = Date.now().toString().slice(-6);
    return `B${orderSuffix}${timestamp}`;
  }

  private generateLotNumber(batchId: string): string {
    const batchSuffix = batchId.slice(-6);
    const timestamp = Date.now().toString().slice(-6);
    return `L${batchSuffix}${timestamp}`;
  }

  private generateDefaultDates(): OrderDates {
    const now = new Date();
    const requestedDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const promisedDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    return {
      orderDate: now,
      requestedDate,
      promisedDate,
      plannedStartDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      plannedEndDate: promisedDate,
      leadTime: 14,
      bufferTime: 2
    };
  }

  private getCurrentShift(): string {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return 'morning';
    if (hour >= 14 && hour < 22) return 'afternoon';
    return 'night';
  }

  private calculateProgressPercentage(status: string): number {
    const progressMap: Record<string, number> = {
      'draft': 0,
      'planned': 10,
      'released': 20,
      'in_progress': 50,
      'on_hold': 50,
      'completed': 100,
      'cancelled': 0
    };
    return progressMap[status] || 0;
  }

  private calculateQualityScore(qualityData: BatchQualityData): number {
    if (qualityData.inspectionResults.length === 0) return 0;
    
    const passedInspections = qualityData.inspectionResults.filter(r => r.overallResult === 'pass').length;
    return Math.round((passedInspections / qualityData.inspectionResults.length) * 100);
  }

  private calculateLotQualityScore(qualityData: LotQualityData): number {
    if (qualityData.qualityChecks.length === 0) return 0;
    
    const passedChecks = qualityData.qualityChecks.filter(c => c.result?.result === 'pass').length;
    return Math.round((passedChecks / qualityData.qualityChecks.length) * 100);
  }

  private async handleQualityFailure(
    entityId: string,
    entityType: string,
    qualityCheck: QualityCheck,
    result: QualityResult
  ): Promise<void> {
    // Log quality failure
    logger.warn(`Quality failure detected for ${entityType} ${entityId}: ${qualityCheck.checkType}`);
    
    // Create non-conformance record
    const nonConformance: NonConformance = {
      ncId: `NC_${Date.now()}`,
      description: `Quality check failure: ${qualityCheck.checkType}`,
      severity: 'major',
      rootCause: 'Under investigation',
      correctiveActions: [],
      preventiveActions: [],
      status: 'open'
    };
    
    // Emit alert
    SocketService.emitPlanUpdate('quality_failure_detected', {
      entityId,
      entityType,
      checkId: qualityCheck.checkId,
      nonConformance,
      timestamp: new Date()
    });
  }

  // Additional helper methods (simplified implementations)
  private async processStatusUpdates(): Promise<void> {
    // Process pending status updates from shop floor terminals
  }

  private async checkMilestones(): Promise<void> {
    // Check if any milestones are due or overdue
  }

  private async updateKPIs(): Promise<void> {
    // Update production KPIs
  }
}

// Supporting classes (simplified implementations)
class TraceabilityEngine {
  async initializeOrderTraceability(order: ProductionOrder): Promise<void> {
    logger.info(`Initializing traceability for order ${order.orderId}`);
  }

  async recordStatusChange(order: ProductionOrder, oldStatus: string, newStatus: string, changedBy: string, reason: string): Promise<void> {
    logger.info(`Recording status change for order ${order.orderId}: ${oldStatus} -> ${newStatus}`);
  }

  async initializeLotTraceability(lot: ProductionLot, batch: ProductionBatch): Promise<void> {
    logger.info(`Initializing traceability for lot ${lot.lotId}`);
  }

  async recordQualityCheck(entityId: string, entityType: string, qualityCheck: QualityCheck): Promise<void> {
    logger.info(`Recording quality check traceability for ${entityType} ${entityId}`);
  }
}

class QualityEngine {
  async initializeBatchQualityPlan(batch: ProductionBatch, order: ProductionOrder): Promise<void> {
    logger.info(`Initializing quality plan for batch ${batch.batchId}`);
  }
}

class ComplianceEngine {
  async validateCompliance(entity: any, requirements: ComplianceRequirement[]): Promise<boolean> {
    logger.info('Validating compliance requirements');
    return true;
  }
}
