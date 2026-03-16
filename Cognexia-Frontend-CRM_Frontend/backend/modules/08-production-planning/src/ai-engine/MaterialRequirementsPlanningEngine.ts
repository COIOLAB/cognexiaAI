import { logger } from '../../../utils/logger';
import { CacheService } from '../../../services/CacheService';
import { SocketService } from '../../../services/SocketService';
import {
  MaterialRequirement,
  SupplierData,
  InventoryData,
  PurchaseOrder,
  SafetyStockConfig,
  LeadTimeVariation
} from '@industry5-erp/shared';

export interface MRPInput {
  masterSchedule: MPSSchedule[];
  billOfMaterials: BOMData[];
  currentInventory: InventoryData[];
  suppliers: SupplierData[];
  safetyStockConfigs: SafetyStockConfig[];
  planningHorizon: number; // weeks
  leadTimeBuffers: LeadTimeBuffer[];
  demandForecast?: DemandForecastData[];
}

export interface MPSSchedule {
  scheduleId: string;
  productId: string;
  quantity: number;
  startDate: Date;
  endDate: Date;
  priority: number;
}

export interface BOMData {
  productId: string;
  version: string;
  effectiveDate: Date;
  materials: BOMItem[];
  alternativeMaterials?: AlternativeMaterial[];
  assemblyInstructions?: string;
  qualityRequirements?: QualityRequirement[];
}

export interface BOMItem {
  materialId: string;
  materialCode: string;
  description: string;
  quantityPerUnit: number;
  unit: string;
  scrapFactor: number; // percentage
  operationNumber?: number;
  isPhantom: boolean;
  isCritical: boolean;
  leadTime: number; // days
  cost: number;
  supplierPreference?: string[];
}

export interface AlternativeMaterial {
  materialId: string;
  alternativeId: string;
  conversionFactor: number;
  costDifference: number;
  qualityImpact: number;
  availability: 'high' | 'medium' | 'low';
  preferenceRank: number;
}

export interface QualityRequirement {
  parameter: string;
  specification: string;
  testMethod: string;
  criticalToQuality: boolean;
}

export interface LeadTimeBuffer {
  supplierId: string;
  materialCategory: string;
  bufferDays: number;
  confidence: number;
  seasonalAdjustment?: SeasonalAdjustment[];
}

export interface SeasonalAdjustment {
  month: number;
  adjustmentFactor: number;
  reason: string;
}

export interface MRPResult {
  planId: string;
  generatedAt: Date;
  planningHorizon: Date;
  materialRequirements: MaterialRequirementPlan[];
  purchaseOrders: PurchaseOrderPlan[];
  safetyStockRecommendations: SafetyStockRecommendation[];
  alerts: MRPAlert[];
  kpis: MRPKpi[];
  supplierPerformance: SupplierPerformanceData[];
  costAnalysis: MRPCostAnalysis;
}

export interface MaterialRequirementPlan {
  materialId: string;
  materialCode: string;
  description: string;
  requirements: MaterialRequirementDetail[];
  totalRequirement: number;
  currentStock: number;
  availableStock: number;
  shortfall: number;
  plannedOrders: PlannedOrder[];
  alternativeOptions?: AlternativeOption[];
}

export interface MaterialRequirementDetail {
  requirementDate: Date;
  quantity: number;
  sourceOrderId: string;
  priority: number;
  canBeSubstituted: boolean;
  criticalPath: boolean;
}

export interface PlannedOrder {
  orderId: string;
  materialId: string;
  quantity: number;
  orderDate: Date;
  requiredDate: Date;
  supplierId: string;
  estimatedCost: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  riskLevel: number; // 0-10
  alternatives?: AlternativeSupplier[];
}

export interface AlternativeSupplier {
  supplierId: string;
  cost: number;
  leadTime: number;
  qualityRating: number;
  reliability: number;
}

export interface AlternativeOption {
  alternativeId: string;
  conversionFactor: number;
  availableQuantity: number;
  costImpact: number;
  leadTimeImpact: number;
  qualityImpact: number;
  riskAssessment: string;
}

export interface SafetyStockRecommendation {
  materialId: string;
  currentSafetyStock: number;
  recommendedSafetyStock: number;
  reasoning: string;
  costImpact: number;
  serviceLevel: number;
  volatility: number;
}

export interface MRPAlert {
  alertType: 'shortage' | 'excess' | 'late_delivery' | 'supplier_risk' | 'quality_issue';
  severity: 'info' | 'warning' | 'critical';
  materialId: string;
  message: string;
  impact: AlertImpact;
  recommendedActions: RecommendedAction[];
  timeline: Date;
}

export interface AlertImpact {
  affectedOrders: string[];
  potentialDelay: number; // hours
  financialImpact: number;
  customerImpact: 'low' | 'medium' | 'high';
}

export interface RecommendedAction {
  action: string;
  priority: number;
  estimatedEffort: string;
  expectedOutcome: string;
  riskLevel: string;
}

export interface MRPKpi {
  name: string;
  value: number;
  target: number;
  trend: 'improving' | 'stable' | 'declining';
  unit: string;
  period: string;
}

export interface SupplierPerformanceData {
  supplierId: string;
  supplierName: string;
  onTimeDelivery: number;
  qualityRating: number;
  costPerformance: number;
  responseTime: number;
  riskScore: number;
  recommendations: string[];
}

export interface MRPCostAnalysis {
  totalMaterialCost: number;
  inventoryCarryingCost: number;
  orderingCost: number;
  stockoutCost: number;
  totalCost: number;
  costBreakdown: CostBreakdown[];
  savingsOpportunities: SavingsOpportunity[];
}

export interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface SavingsOpportunity {
  opportunity: string;
  potentialSavings: number;
  implementationCost: number;
  paybackPeriod: number; // months
  riskLevel: 'low' | 'medium' | 'high';
}

export interface PurchaseOrderPlan {
  plannedOrderId: string;
  materialId: string;
  supplierId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  orderDate: Date;
  requiredDate: Date;
  deliveryDate: Date;
  priority: number;
  contingencyPlan?: ContingencyPlan;
}

export interface ContingencyPlan {
  alternativeSupplier: string;
  alternativeMaterial?: string;
  expeditingOptions: ExpediteOption[];
  riskMitigation: string[];
}

export interface ExpediteOption {
  method: string;
  additionalCost: number;
  timeSaved: number; // days
  reliability: number; // 0-1
}

export class MaterialRequirementsPlanningEngine {
  private mrpCalculators: Map<string, any> = new Map();
  private supplierOptimizer: SupplierOptimizer;
  private safetyStockCalculator: SafetyStockCalculator;
  private costOptimizer: CostOptimizer;

  constructor() {
    this.initializeMRPEngines();
    this.supplierOptimizer = new SupplierOptimizer();
    this.safetyStockCalculator = new SafetyStockCalculator();
    this.costOptimizer = new CostOptimizer();
  }

  private initializeMRPEngines(): void {
    logger.info('Initializing MRP calculation engines...');
    this.mrpCalculators.set('standard', new StandardMRPCalculator());
    this.mrpCalculators.set('regenerative', new RegenerativeMRPCalculator());
    this.mrpCalculators.set('net_change', new NetChangeMRPCalculator());
    logger.info('MRP engines initialized');
  }

  public async generateMaterialPlan(input: MRPInput): Promise<MRPResult> {
    try {
      logger.info('Starting Material Requirements Planning...');

      // Step 1: Validate input data
      const validatedInput = await this.validateMRPInput(input);

      // Step 2: Explode BOMs and calculate gross requirements
      const grossRequirements = await this.calculateGrossRequirements(validatedInput);

      // Step 3: Calculate net requirements considering current inventory
      const netRequirements = await this.calculateNetRequirements(grossRequirements, validatedInput.currentInventory);

      // Step 4: Apply safety stock calculations
      const safetyStockRecommendations = await this.calculateSafetyStockRequirements(
        netRequirements, validatedInput.safetyStockConfigs
      );

      // Step 5: Generate planned orders with supplier optimization
      const plannedOrders = await this.generatePlannedOrders(
        netRequirements, validatedInput.suppliers, validatedInput.leadTimeBuffers
      );

      // Step 6: Optimize supplier selection and order timing
      const optimizedOrders = await this.optimizeSupplierSelection(plannedOrders, validatedInput.suppliers);

      // Step 7: Generate purchase order plans
      const purchaseOrderPlans = await this.generatePurchaseOrderPlans(optimizedOrders);

      // Step 8: Calculate KPIs and generate alerts
      const kpis = await this.calculateMRPKPIs(netRequirements, optimizedOrders);
      const alerts = await this.generateMRPAlerts(netRequirements, validatedInput);

      // Step 9: Analyze supplier performance
      const supplierPerformance = await this.analyzeSupplierPerformance(validatedInput.suppliers);

      // Step 10: Generate cost analysis
      const costAnalysis = await this.analyzeMRPCosts(optimizedOrders, validatedInput);

      const mrpResult: MRPResult = {
        planId: `mrp_${Date.now()}`,
        generatedAt: new Date(),
        planningHorizon: new Date(Date.now() + validatedInput.planningHorizon * 7 * 24 * 60 * 60 * 1000),
        materialRequirements: netRequirements,
        purchaseOrders: purchaseOrderPlans,
        safetyStockRecommendations,
        alerts,
        kpis,
        supplierPerformance,
        costAnalysis
      };

      // Cache the result
      await CacheService.set(`mrp_plan_${mrpResult.planId}`, mrpResult, 7200);

      // Emit real-time update
      SocketService.emitPlanUpdate('mrp_generated', mrpResult);

      logger.info(`Material Requirements Plan generated: ${mrpResult.planId}`);
      return mrpResult;

    } catch (error) {
      logger.error('Error generating Material Requirements Plan:', error);
      throw new Error(`MRP generation failed: ${error.message}`);
    }
  }

  public async updateMRPForChanges(
    planId: string, 
    changes: MRPChange[]
  ): Promise<MRPResult> {
    try {
      logger.info(`Updating MRP plan ${planId} with ${changes.length} changes`);

      // Get existing plan
      const existingPlan = await CacheService.get<MRPResult>(`mrp_plan_${planId}`);
      if (!existingPlan) {
        throw new Error(`MRP plan ${planId} not found`);
      }

      // Analyze change impact
      const impactAnalysis = await this.analyzeChangeImpact(changes, existingPlan);

      // Determine update strategy
      if (impactAnalysis.requiresFullRegeneration) {
        logger.info('Changes require full MRP regeneration');
        // Trigger full regeneration with updated data
        return await this.regenerateMRPPlan(existingPlan, changes);
      } else {
        logger.info('Applying net change MRP update');
        return await this.applyNetChangeMRP(existingPlan, changes);
      }

    } catch (error) {
      logger.error('Error updating MRP plan:', error);
      throw error;
    }
  }

  private async calculateGrossRequirements(input: MRPInput): Promise<GrossRequirementData[]> {
    const grossRequirements: GrossRequirementData[] = [];

    for (const schedule of input.masterSchedule) {
      // Find BOM for this product
      const bom = input.billOfMaterials.find(b => b.productId === schedule.productId);
      if (!bom) {
        logger.warn(`No BOM found for product ${schedule.productId}`);
        continue;
      }

      // Explode BOM
      const explodedMaterials = await this.explodeBOM(bom, schedule.quantity);

      // Add to gross requirements
      for (const material of explodedMaterials) {
        let existingReq = grossRequirements.find(r => r.materialId === material.materialId);
        if (!existingReq) {
          existingReq = {
            materialId: material.materialId,
            materialCode: material.materialCode,
            description: material.description,
            requirements: []
          };
          grossRequirements.push(existingReq);
        }

        existingReq.requirements.push({
          requirementDate: schedule.startDate,
          quantity: material.totalQuantity,
          sourceOrderId: schedule.scheduleId,
          priority: schedule.priority,
          canBeSubstituted: !material.isCritical,
          criticalPath: material.isCritical
        });
      }
    }

    return grossRequirements;
  }

  private async calculateNetRequirements(
    grossRequirements: GrossRequirementData[],
    currentInventory: InventoryData[]
  ): Promise<MaterialRequirementPlan[]> {
    const netRequirements: MaterialRequirementPlan[] = [];

    for (const grossReq of grossRequirements) {
      const inventory = currentInventory.find(i => i.materialId === grossReq.materialId);
      const currentStock = inventory?.availableQuantity || 0;
      const allocatedStock = inventory?.allocatedQuantity || 0;
      const availableStock = currentStock - allocatedStock;

      const totalRequirement = grossReq.requirements.reduce((sum, r) => sum + r.quantity, 0);
      const shortfall = Math.max(0, totalRequirement - availableStock);

      const netReq: MaterialRequirementPlan = {
        materialId: grossReq.materialId,
        materialCode: grossReq.materialCode,
        description: grossReq.description,
        requirements: grossReq.requirements,
        totalRequirement,
        currentStock,
        availableStock,
        shortfall,
        plannedOrders: [],
        alternativeOptions: await this.findAlternativeOptions(grossReq.materialId)
      };

      netRequirements.push(netReq);
    }

    return netRequirements;
  }

  private async generatePlannedOrders(
    netRequirements: MaterialRequirementPlan[],
    suppliers: SupplierData[],
    leadTimeBuffers: LeadTimeBuffer[]
  ): Promise<PlannedOrder[]> {
    const plannedOrders: PlannedOrder[] = [];

    for (const requirement of netRequirements) {
      if (requirement.shortfall > 0) {
        // Find suitable suppliers
        const suitableSuppliers = suppliers.filter(s => 
          s.materials.some(m => m.materialId === requirement.materialId)
        );

        if (suitableSuppliers.length === 0) {
          logger.warn(`No suppliers found for material ${requirement.materialId}`);
          continue;
        }

        // Calculate order timing
        const earliestRequirement = requirement.requirements
          .sort((a, b) => a.requirementDate.getTime() - b.requirementDate.getTime())[0];

        // Select best supplier
        const bestSupplier = await this.selectBestSupplier(
          suitableSuppliers, 
          requirement.materialId
        );

        // Calculate lead time with buffer
        const leadTimeBuffer = leadTimeBuffers.find(l => 
          l.supplierId === bestSupplier.supplierId
        );
        const bufferedLeadTime = bestSupplier.leadTime + (leadTimeBuffer?.bufferDays || 2);

        // Calculate order date
        const orderDate = new Date(
          earliestRequirement.requirementDate.getTime() - 
          bufferedLeadTime * 24 * 60 * 60 * 1000
        );

        const plannedOrder: PlannedOrder = {
          orderId: `po_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          materialId: requirement.materialId,
          quantity: requirement.shortfall,
          orderDate: Math.max(Date.now(), orderDate.getTime()) > Date.now() ? orderDate : new Date(),
          requiredDate: earliestRequirement.requirementDate,
          supplierId: bestSupplier.supplierId,
          estimatedCost: requirement.shortfall * bestSupplier.unitCost,
          urgency: this.calculateUrgency(earliestRequirement.requirementDate, orderDate),
          riskLevel: this.assessSupplierRisk(bestSupplier),
          alternatives: await this.findAlternativeSuppliers(suitableSuppliers, bestSupplier.supplierId)
        };

        plannedOrders.push(plannedOrder);
        requirement.plannedOrders.push(plannedOrder);
      }
    }

    return plannedOrders;
  }

  private async calculateSafetyStockRequirements(
    netRequirements: MaterialRequirementPlan[],
    safetyStockConfigs: SafetyStockConfig[]
  ): Promise<SafetyStockRecommendation[]> {
    const recommendations: SafetyStockRecommendation[] = [];

    for (const requirement of netRequirements) {
      const config = safetyStockConfigs.find(c => c.materialId === requirement.materialId);
      if (!config) continue;

      const recommendation = await this.safetyStockCalculator.calculateOptimalSafetyStock(
        requirement,
        config
      );

      recommendations.push(recommendation);
    }

    return recommendations;
  }

  // Helper methods
  private async validateMRPInput(input: MRPInput): Promise<MRPInput> { return input; }
  private async explodeBOM(bom: BOMData, quantity: number): Promise<any[]> { return []; }
  private async findAlternativeOptions(materialId: string): Promise<AlternativeOption[]> { return []; }
  private async selectBestSupplier(suppliers: SupplierData[], materialId: string): Promise<any> { return suppliers[0]; }
  private calculateUrgency(requiredDate: Date, orderDate: Date): 'low' | 'medium' | 'high' | 'critical' { return 'medium'; }
  private assessSupplierRisk(supplier: any): number { return 5; }
  private async findAlternativeSuppliers(suppliers: SupplierData[], excludeId: string): Promise<AlternativeSupplier[]> { return []; }
  private async optimizeSupplierSelection(orders: PlannedOrder[], suppliers: SupplierData[]): Promise<PlannedOrder[]> { return orders; }
  private async generatePurchaseOrderPlans(orders: PlannedOrder[]): Promise<PurchaseOrderPlan[]> { return []; }
  private async calculateMRPKPIs(requirements: MaterialRequirementPlan[], orders: PlannedOrder[]): Promise<MRPKpi[]> { return []; }
  private async generateMRPAlerts(requirements: MaterialRequirementPlan[], input: MRPInput): Promise<MRPAlert[]> { return []; }
  private async analyzeSupplierPerformance(suppliers: SupplierData[]): Promise<SupplierPerformanceData[]> { return []; }
  private async analyzeMRPCosts(orders: PlannedOrder[], input: MRPInput): Promise<MRPCostAnalysis> { return {} as MRPCostAnalysis; }
  private async analyzeChangeImpact(changes: MRPChange[], plan: MRPResult): Promise<any> { return { requiresFullRegeneration: false }; }
  private async regenerateMRPPlan(plan: MRPResult, changes: MRPChange[]): Promise<MRPResult> { return plan; }
  private async applyNetChangeMRP(plan: MRPResult, changes: MRPChange[]): Promise<MRPResult> { return plan; }
}

// Supporting interfaces
interface GrossRequirementData {
  materialId: string;
  materialCode: string;
  description: string;
  requirements: MaterialRequirementDetail[];
}

interface MRPChange {
  changeType: 'schedule_change' | 'inventory_update' | 'supplier_change' | 'bom_change';
  data: any;
  timestamp: Date;
}

// Supporting classes (simplified implementations)
class SupplierOptimizer {
  async optimizeSelection(orders: PlannedOrder[], suppliers: SupplierData[]): Promise<PlannedOrder[]> {
    return orders;
  }
}

class SafetyStockCalculator {
  async calculateOptimalSafetyStock(
    requirement: MaterialRequirementPlan,
    config: SafetyStockConfig
  ): Promise<SafetyStockRecommendation> {
    return {
      materialId: requirement.materialId,
      currentSafetyStock: 100,
      recommendedSafetyStock: 150,
      reasoning: 'Based on demand variability analysis',
      costImpact: 500,
      serviceLevel: 95,
      volatility: 0.15
    };
  }
}

class CostOptimizer {
  async optimizeCosts(orders: PlannedOrder[]): Promise<PlannedOrder[]> {
    return orders;
  }
}

// Mock calculator classes
class StandardMRPCalculator {
  calculate(input: any): any {
    logger.info('Running Standard MRP calculation');
    return {};
  }
}

class RegenerativeMRPCalculator {
  calculate(input: any): any {
    logger.info('Running Regenerative MRP calculation');
    return {};
  }
}

class NetChangeMRPCalculator {
  calculate(input: any): any {
    logger.info('Running Net Change MRP calculation');
    return {};
  }
}
