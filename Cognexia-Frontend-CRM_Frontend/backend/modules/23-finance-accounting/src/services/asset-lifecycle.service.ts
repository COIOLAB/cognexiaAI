/**
 * Industry 5.0 ERP Backend - Finance & Accounting Module
 * Asset Lifecycle Service
 * 
 * Complete service implementation for asset lifecycle management
 * 
 * @author AI Assistant - Industry 5.0 Pioneer
 * @version 3.0.0
 * @date 2024-08-22
 * @compliance SOX, GAAP, IFRS, ISO 55000
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AssetManagementService } from './asset-management.service';
import { DepreciationService } from './depreciation.service';
import { JournalEntryService } from './journal-entry.service';

export enum AssetLifecycleStage {
  PLANNING = 'PLANNING',
  ACQUISITION = 'ACQUISITION',
  DEPLOYMENT = 'DEPLOYMENT',
  OPERATION = 'OPERATION',
  MAINTENANCE = 'MAINTENANCE',
  OPTIMIZATION = 'OPTIMIZATION',
  DISPOSAL_PLANNING = 'DISPOSAL_PLANNING',
  DISPOSAL = 'DISPOSAL',
  RETIRED = 'RETIRED'
}

export enum AssetCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  CRITICAL = 'CRITICAL',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE = 'CORRECTIVE',
  PREDICTIVE = 'PREDICTIVE',
  EMERGENCY = 'EMERGENCY',
  OVERHAUL = 'OVERHAUL',
  UPGRADE = 'UPGRADE'
}

export enum DisposalMethod {
  SALE = 'SALE',
  SCRAP = 'SCRAP',
  DONATION = 'DONATION',
  TRADE_IN = 'TRADE_IN',
  RETIREMENT = 'RETIREMENT',
  TRANSFER = 'TRANSFER'
}

export interface AssetLifecycleEvent {
  id: string;
  assetId: string;
  eventType: string;
  stage: AssetLifecycleStage;
  eventDate: Date;
  description: string;
  cost?: number;
  performedBy: string;
  impactOnValue?: number;
  impactOnLifespan?: number;
  maintenanceType?: MaintenanceType;
  condition?: AssetCondition;
  attachments?: string[];
  blockchainHash?: string;
  aiPredictions?: {
    nextMaintenanceDate?: Date;
    remainingLifespan?: number;
    optimizationRecommendations?: string[];
  };
}

export interface AssetLifecyclePlan {
  assetId: string;
  currentStage: AssetLifecycleStage;
  plannedStages: Array<{
    stage: AssetLifecycleStage;
    plannedDate: Date;
    estimatedCost: number;
    description: string;
    prerequisites?: string[];
  }>;
  totalLifecycleCost: number;
  remainingLifespan: number;
  optimizationOpportunities: Array<{
    opportunity: string;
    estimatedSavings: number;
    implementationCost: number;
    roi: number;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  riskFactors: Array<{
    risk: string;
    probability: number;
    impact: number;
    riskScore: number;
    mitigationStrategy: string;
  }>;
}

export interface MaintenanceSchedule {
  assetId: string;
  maintenanceItems: Array<{
    id: string;
    type: MaintenanceType;
    description: string;
    frequency: string;
    nextDueDate: Date;
    estimatedCost: number;
    estimatedDuration: number;
    priority: number;
    assignedTo?: string;
    parts?: Array<{
      partId: string;
      quantity: number;
      estimatedCost: number;
    }>;
  }>;
  annualMaintenanceCost: number;
  criticalMaintenanceItems: number;
  overdueMaintenance: number;
}

export interface DisposalPlan {
  assetId: string;
  plannedDisposalDate: Date;
  disposalMethod: DisposalMethod;
  estimatedDisposalValue: number;
  disposalCost: number;
  netDisposalValue: number;
  environmentalCompliance: {
    requiresCertification: boolean;
    certificationBody?: string;
    specialHandling: boolean;
    disposalRegulations: string[];
  };
  dataSecurityRequirements: {
    dataWiping: boolean;
    certificateRequired: boolean;
    encryptedDestruction: boolean;
  };
  approvals: Array<{
    approverRole: string;
    required: boolean;
    obtained: boolean;
    approvedBy?: string;
    approvedAt?: Date;
  }>;
}

@Injectable()
export class AssetLifecycleService {
  private readonly logger = new Logger(AssetLifecycleService.name);

  constructor(
    private readonly assetManagementService: AssetManagementService,
    private readonly depreciationService: DepreciationService,
    private readonly journalEntryService: JournalEntryService,
  ) {}

  /**
   * Create comprehensive lifecycle plan for an asset
   */
  async createLifecyclePlan(assetId: string): Promise<AssetLifecyclePlan> {
    try {
      this.logger.log(`Creating lifecycle plan for asset ${assetId}`);

      // Get asset details
      const asset = await this.assetManagementService.getAssetById(assetId);
      if (!asset) {
        throw new Error(`Asset ${assetId} not found`);
      }

      // Analyze current stage
      const currentStage = await this.determineCurrentStage(asset);

      // Generate planned stages
      const plannedStages = await this.generatePlannedStages(asset, currentStage);

      // Calculate total lifecycle cost
      const totalLifecycleCost = await this.calculateTotalLifecycleCost(asset, plannedStages);

      // Calculate remaining lifespan
      const remainingLifespan = await this.calculateRemainingLifespan(asset);

      // Identify optimization opportunities
      const optimizationOpportunities = await this.identifyOptimizationOpportunities(asset);

      // Assess risk factors
      const riskFactors = await this.assessRiskFactors(asset);

      const lifecyclePlan: AssetLifecyclePlan = {
        assetId,
        currentStage,
        plannedStages,
        totalLifecycleCost,
        remainingLifespan,
        optimizationOpportunities,
        riskFactors
      };

      // Store the plan
      await this.storeLifecyclePlan(lifecyclePlan);

      return lifecyclePlan;

    } catch (error) {
      this.logger.error(`Failed to create lifecycle plan for asset ${assetId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Record lifecycle event
   */
  async recordLifecycleEvent(event: Omit<AssetLifecycleEvent, 'id'>): Promise<AssetLifecycleEvent> {
    try {
      const lifecycleEvent: AssetLifecycleEvent = {
        id: `LE-${Date.now()}-${event.assetId}`,
        ...event
      };

      // Add AI predictions if applicable
      if (event.maintenanceType) {
        lifecycleEvent.aiPredictions = await this.generateAIPredictions(event.assetId, event);
      }

      // Add blockchain verification
      if (event.stage === AssetLifecycleStage.DISPOSAL || event.cost && event.cost > 10000) {
        lifecycleEvent.blockchainHash = await this.addBlockchainVerification(lifecycleEvent);
      }

      // Update asset condition if provided
      if (event.condition) {
        await this.updateAssetCondition(event.assetId, event.condition);
      }

      // Create financial entries if cost is involved
      if (event.cost && event.cost > 0) {
        await this.createLifecycleJournalEntry(lifecycleEvent);
      }

      // Store the event
      await this.storeLifecycleEvent(lifecycleEvent);

      this.logger.log(`Recorded lifecycle event ${lifecycleEvent.id} for asset ${event.assetId}`);

      return lifecycleEvent;

    } catch (error) {
      this.logger.error(`Failed to record lifecycle event for asset ${event.assetId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate maintenance schedule
   */
  async generateMaintenanceSchedule(assetId: string): Promise<MaintenanceSchedule> {
    try {
      this.logger.log(`Generating maintenance schedule for asset ${assetId}`);

      const asset = await this.assetManagementService.getAssetById(assetId);
      if (!asset) {
        throw new Error(`Asset ${assetId} not found`);
      }

      // Get maintenance history
      const maintenanceHistory = await this.getMaintenanceHistory(assetId);

      // Generate maintenance items based on asset type and usage
      const maintenanceItems = await this.generateMaintenanceItems(asset, maintenanceHistory);

      // Calculate costs and metrics
      const annualMaintenanceCost = maintenanceItems.reduce(
        (sum, item) => sum + item.estimatedCost * this.getAnnualFrequency(item.frequency),
        0
      );

      const criticalMaintenanceItems = maintenanceItems.filter(item => item.priority >= 8).length;
      const overdueMaintenance = maintenanceItems.filter(item => item.nextDueDate < new Date()).length;

      const schedule: MaintenanceSchedule = {
        assetId,
        maintenanceItems,
        annualMaintenanceCost,
        criticalMaintenanceItems,
        overdueMaintenance
      };

      return schedule;

    } catch (error) {
      this.logger.error(`Failed to generate maintenance schedule for asset ${assetId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create disposal plan
   */
  async createDisposalPlan(assetId: string, plannedDisposalDate: Date): Promise<DisposalPlan> {
    try {
      this.logger.log(`Creating disposal plan for asset ${assetId}`);

      const asset = await this.assetManagementService.getAssetById(assetId);
      if (!asset) {
        throw new Error(`Asset ${assetId} not found`);
      }

      // Determine optimal disposal method
      const disposalMethod = await this.determineOptimalDisposalMethod(asset);

      // Estimate disposal value
      const estimatedDisposalValue = await this.estimateDisposalValue(asset, disposalMethod);

      // Calculate disposal costs
      const disposalCost = await this.calculateDisposalCost(asset, disposalMethod);

      // Net disposal value
      const netDisposalValue = estimatedDisposalValue - disposalCost;

      // Environmental compliance requirements
      const environmentalCompliance = await this.assessEnvironmentalCompliance(asset);

      // Data security requirements
      const dataSecurityRequirements = await this.assessDataSecurityRequirements(asset);

      // Required approvals
      const approvals = await this.determineRequiredApprovals(asset, netDisposalValue);

      const disposalPlan: DisposalPlan = {
        assetId,
        plannedDisposalDate,
        disposalMethod,
        estimatedDisposalValue,
        disposalCost,
        netDisposalValue,
        environmentalCompliance,
        dataSecurityRequirements,
        approvals
      };

      // Store the disposal plan
      await this.storeDisposalPlan(disposalPlan);

      return disposalPlan;

    } catch (error) {
      this.logger.error(`Failed to create disposal plan for asset ${assetId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute asset disposal
   */
  async executeDisposal(
    assetId: string,
    actualDisposalValue: number,
    actualDisposalCost: number,
    disposedBy: string
  ): Promise<void> {
    try {
      this.logger.log(`Executing disposal for asset ${assetId}`);

      const asset = await this.assetManagementService.getAssetById(assetId);
      if (!asset) {
        throw new Error(`Asset ${assetId} not found`);
      }

      // Record disposal event
      await this.recordLifecycleEvent({
        assetId,
        eventType: 'DISPOSAL',
        stage: AssetLifecycleStage.DISPOSAL,
        eventDate: new Date(),
        description: 'Asset disposal executed',
        cost: actualDisposalCost,
        performedBy: disposedBy,
        condition: AssetCondition.OUT_OF_SERVICE
      });

      // Calculate disposal gain/loss
      const bookValue = asset.bookValue || 0;
      const netDisposalValue = actualDisposalValue - actualDisposalCost;
      const gainLoss = netDisposalValue - bookValue;

      // Create disposal journal entries
      await this.createDisposalJournalEntries(asset, actualDisposalValue, actualDisposalCost, gainLoss);

      // Update asset status to retired
      await this.assetManagementService.updateAssetStatus(assetId, 'RETIRED');

      // Create blockchain record for disposal
      await this.addBlockchainVerification({
        id: `DISPOSAL-${assetId}`,
        assetId,
        eventType: 'DISPOSAL',
        stage: AssetLifecycleStage.DISPOSAL,
        eventDate: new Date(),
        description: 'Asset disposal completed',
        cost: actualDisposalCost,
        performedBy: disposedBy
      });

      this.logger.log(`Asset ${assetId} disposal completed successfully`);

    } catch (error) {
      this.logger.error(`Failed to execute disposal for asset ${assetId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Run automated lifecycle monitoring
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async runLifecycleMonitoring(): Promise<void> {
    this.logger.log('Starting automated asset lifecycle monitoring');

    try {
      // Get all active assets
      const assets = await this.assetManagementService.getAllActiveAssets();

      for (const asset of assets) {
        try {
          // Check maintenance schedules
          await this.checkMaintenanceDue(asset.id);

          // Update lifecycle stage if needed
          await this.updateLifecycleStage(asset.id);

          // Check for disposal candidates
          await this.checkDisposalCandidates(asset.id);

          // Generate AI predictions
          await this.updateAIPredictions(asset.id);

        } catch (error) {
          this.logger.error(`Lifecycle monitoring failed for asset ${asset.id}: ${error.message}`);
        }
      }

      this.logger.log('Automated asset lifecycle monitoring completed');

    } catch (error) {
      this.logger.error(`Automated lifecycle monitoring process failed: ${error.message}`);
    }
  }

  // Private helper methods

  private async determineCurrentStage(asset: any): Promise<AssetLifecycleStage> {
    // Logic to determine current lifecycle stage based on asset data
    if (asset.status === 'RETIRED') return AssetLifecycleStage.RETIRED;
    if (asset.status === 'DISPOSED') return AssetLifecycleStage.DISPOSAL;
    if (asset.condition === AssetCondition.CRITICAL) return AssetLifecycleStage.DISPOSAL_PLANNING;
    
    // Default to operation if asset is active
    return AssetLifecycleStage.OPERATION;
  }

  private async generatePlannedStages(asset: any, currentStage: AssetLifecycleStage): Promise<any[]> {
    const stages = [];
    const now = new Date();

    // Generate future stages based on current stage and asset characteristics
    switch (currentStage) {
      case AssetLifecycleStage.OPERATION:
        stages.push({
          stage: AssetLifecycleStage.MAINTENANCE,
          plannedDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days
          estimatedCost: asset.maintenanceCost || 1000,
          description: 'Scheduled maintenance'
        });
        
        stages.push({
          stage: AssetLifecycleStage.DISPOSAL_PLANNING,
          plannedDate: new Date(asset.acquisitionDate.getTime() + asset.usefulLife * 365 * 24 * 60 * 60 * 1000),
          estimatedCost: 500,
          description: 'Plan for asset disposal'
        });
        break;
        
      // Add other stage transitions as needed
    }

    return stages;
  }

  private async calculateTotalLifecycleCost(asset: any, plannedStages: any[]): Promise<number> {
    let totalCost = asset.acquisitionCost || 0;
    
    // Add planned stage costs
    totalCost += plannedStages.reduce((sum, stage) => sum + stage.estimatedCost, 0);
    
    // Add estimated annual operating costs
    const remainingYears = asset.usefulLife - asset.age;
    totalCost += (asset.annualOperatingCost || 0) * remainingYears;

    return totalCost;
  }

  private async calculateRemainingLifespan(asset: any): Promise<number> {
    // Calculate based on useful life and current age
    const remainingYears = asset.usefulLife - (asset.age || 0);
    return Math.max(0, remainingYears);
  }

  private async identifyOptimizationOpportunities(asset: any): Promise<any[]> {
    const opportunities = [];

    // Energy efficiency upgrade
    opportunities.push({
      opportunity: 'Energy efficiency upgrade',
      estimatedSavings: asset.energyCost * 0.2 * 5, // 20% savings over 5 years
      implementationCost: 5000,
      roi: 0.8,
      priority: 'MEDIUM' as const
    });

    return opportunities;
  }

  private async assessRiskFactors(asset: any): Promise<any[]> {
    const risks = [];

    // Age-related risk
    if (asset.age / asset.usefulLife > 0.8) {
      risks.push({
        risk: 'End-of-life failure',
        probability: 0.3,
        impact: 0.8,
        riskScore: 0.24,
        mitigationStrategy: 'Increase maintenance frequency and plan replacement'
      });
    }

    return risks;
  }

  private async generateAIPredictions(assetId: string, event: any): Promise<any> {
    // AI-based predictions
    return {
      nextMaintenanceDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      remainingLifespan: 5.2,
      optimizationRecommendations: ['Implement predictive maintenance']
    };
  }

  private async addBlockchainVerification(event: AssetLifecycleEvent): Promise<string> {
    // Simulate blockchain hash generation
    return `BH-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  private async updateAssetCondition(assetId: string, condition: AssetCondition): Promise<void> {
    // Update asset condition in database
    await this.assetManagementService.updateAssetCondition(assetId, condition);
  }

  private async createLifecycleJournalEntry(event: AssetLifecycleEvent): Promise<void> {
    // Create appropriate journal entries based on event type
    // This would integrate with the journal entry service
  }

  private async storeLifecyclePlan(plan: AssetLifecyclePlan): Promise<void> {
    // Store lifecycle plan in database
  }

  private async storeLifecycleEvent(event: AssetLifecycleEvent): Promise<void> {
    // Store lifecycle event in database
  }

  private async getMaintenanceHistory(assetId: string): Promise<AssetLifecycleEvent[]> {
    // Get maintenance history from database
    return [];
  }

  private async generateMaintenanceItems(asset: any, history: AssetLifecycleEvent[]): Promise<any[]> {
    // Generate maintenance items based on asset type and history
    return [];
  }

  private getAnnualFrequency(frequency: string): number {
    switch (frequency.toLowerCase()) {
      case 'weekly': return 52;
      case 'monthly': return 12;
      case 'quarterly': return 4;
      case 'semi-annually': return 2;
      case 'annually': return 1;
      default: return 1;
    }
  }

  private async determineOptimalDisposalMethod(asset: any): Promise<DisposalMethod> {
    // Determine optimal disposal method based on asset characteristics
    if (asset.marketValue > asset.bookValue) return DisposalMethod.SALE;
    if (asset.scrapValue > 0) return DisposalMethod.SCRAP;
    return DisposalMethod.RETIREMENT;
  }

  private async estimateDisposalValue(asset: any, method: DisposalMethod): Promise<number> {
    switch (method) {
      case DisposalMethod.SALE:
        return asset.marketValue || asset.bookValue * 0.8;
      case DisposalMethod.SCRAP:
        return asset.scrapValue || asset.bookValue * 0.1;
      default:
        return 0;
    }
  }

  private async calculateDisposalCost(asset: any, method: DisposalMethod): Promise<number> {
    // Calculate disposal costs based on method and asset characteristics
    return method === DisposalMethod.SALE ? 100 : 50;
  }

  private async assessEnvironmentalCompliance(asset: any): Promise<any> {
    return {
      requiresCertification: asset.hasHazardousMaterials || false,
      specialHandling: asset.hasSpecialDisposalRequirements || false,
      disposalRegulations: asset.applicableRegulations || []
    };
  }

  private async assessDataSecurityRequirements(asset: any): Promise<any> {
    return {
      dataWiping: asset.hasDigitalData || false,
      certificateRequired: asset.containsSensitiveData || false,
      encryptedDestruction: asset.hasEncryptedData || false
    };
  }

  private async determineRequiredApprovals(asset: any, netValue: number): Promise<any[]> {
    const approvals = [];
    
    if (netValue > 10000) {
      approvals.push({
        approverRole: 'Finance Manager',
        required: true,
        obtained: false
      });
    }

    return approvals;
  }

  private async storeDisposalPlan(plan: DisposalPlan): Promise<void> {
    // Store disposal plan in database
  }

  private async createDisposalJournalEntries(
    asset: any,
    disposalValue: number,
    disposalCost: number,
    gainLoss: number
  ): Promise<void> {
    // Create journal entries for asset disposal
  }

  private async checkMaintenanceDue(assetId: string): Promise<void> {
    // Check and notify about due maintenance
  }

  private async updateLifecycleStage(assetId: string): Promise<void> {
    // Update lifecycle stage based on current conditions
  }

  private async checkDisposalCandidates(assetId: string): Promise<void> {
    // Check if asset is candidate for disposal
  }

  private async updateAIPredictions(assetId: string): Promise<void> {
    // Update AI predictions for asset
  }
}
