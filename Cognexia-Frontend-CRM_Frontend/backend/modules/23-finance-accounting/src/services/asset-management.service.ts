/**
 * Asset Management Service
 * 
 * Comprehensive asset management service handling fixed asset lifecycle,
 * depreciation calculations, asset tracking, maintenance scheduling,
 * and asset optimization with AI-powered analytics.
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Decimal from 'decimal.js';

// Asset interfaces and types
export interface AssetCreateRequest {
  assetName: string;
  assetType: 'building' | 'equipment' | 'vehicle' | 'furniture' | 'software' | 'intangible';
  assetCategory: string;
  purchasePrice: number;
  purchaseDate: string;
  usefulLife: number; // in years
  salvageValue: number;
  depreciationMethod: 'straight_line' | 'declining_balance' | 'units_of_production' | 'sum_of_years';
  location: string;
  department: string;
  responsibleEmployee: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  warrantyExpiration?: string;
  maintenanceSchedule?: MaintenanceSchedule;
}

export interface MaintenanceSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  lastMaintenance?: string;
  nextMaintenance: string;
  maintenanceType: 'preventive' | 'corrective' | 'predictive';
  estimatedCost: number;
}

export interface AssetValuation {
  assetId: string;
  currentValue: number;
  depreciatedValue: number;
  marketValue: number;
  replacementCost: number;
  valuationMethod: string;
  valuationDate: string;
  confidence: number;
}

export interface AssetTransfer {
  transferId: string;
  assetId: string;
  fromLocation: string;
  toLocation: string;
  fromDepartment: string;
  toDepartment: string;
  fromEmployee: string;
  toEmployee: string;
  transferDate: string;
  transferReason: string;
  approvedBy: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
}

@Injectable()
export class AssetManagementService {
  private readonly logger = new Logger(AssetManagementService.name);

  constructor(
    // Repositories will be added when entities are created
    // @InjectRepository(Asset) private assetRepository: Repository<Asset>,
    // @InjectRepository(AssetTransfer) private transferRepository: Repository<AssetTransfer>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new asset
   */
  async createAsset(assetData: AssetCreateRequest, userId: string): Promise<any> {
    try {
      // Validate asset data
      await this.validateAssetData(assetData);

      // Generate asset ID and tag
      const assetId = this.generateAssetId();
      const assetTag = this.generateAssetTag(assetData.assetType);

      // Create asset record
      const asset = {
        id: assetId,
        assetTag,
        ...assetData,
        status: 'active',
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to database (when entity is created)
      // await this.assetRepository.save(asset);

      // Calculate initial depreciation schedule
      const depreciationSchedule = await this.calculateDepreciationSchedule(asset);

      // Emit asset created event
      this.eventEmitter.emit('asset.created', {
        assetId,
        assetTag,
        assetType: assetData.assetType,
        purchasePrice: assetData.purchasePrice,
        userId,
      });

      return {
        ...asset,
        depreciationSchedule,
      };
    } catch (error) {
      this.logger.error(`Asset creation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Calculate depreciation for an asset
   */
  async calculateDepreciation(assetId: string, asOfDate?: string): Promise<any> {
    try {
      // Get asset details (when entity is created)
      const asset = await this.getAssetById(assetId);
      const calculationDate = asOfDate ? new Date(asOfDate) : new Date();

      // Calculate depreciation based on method
      let depreciationAmount = 0;
      let accumulatedDepreciation = 0;
      let bookValue = 0;

      switch (asset.depreciationMethod) {
        case 'straight_line':
          ({ depreciationAmount, accumulatedDepreciation, bookValue } = 
            this.calculateStraightLineDepreciation(asset, calculationDate));
          break;

        case 'declining_balance':
          ({ depreciationAmount, accumulatedDepreciation, bookValue } = 
            this.calculateDecliningBalanceDepreciation(asset, calculationDate));
          break;

        case 'units_of_production':
          ({ depreciationAmount, accumulatedDepreciation, bookValue } = 
            this.calculateUnitsOfProductionDepreciation(asset, calculationDate));
          break;

        case 'sum_of_years':
          ({ depreciationAmount, accumulatedDepreciation, bookValue } = 
            this.calculateSumOfYearsDepreciation(asset, calculationDate));
          break;

        default:
          throw new BadRequestException(`Unsupported depreciation method: ${asset.depreciationMethod}`);
      }

      return {
        assetId,
        asOfDate: calculationDate.toISOString(),
        depreciationMethod: asset.depreciationMethod,
        purchasePrice: asset.purchasePrice,
        currentDepreciation: depreciationAmount,
        accumulatedDepreciation,
        bookValue,
        remainingLife: this.calculateRemainingLife(asset, calculationDate),
        depreciationRate: this.calculateDepreciationRate(asset),
      };
    } catch (error) {
      this.logger.error(`Depreciation calculation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Transfer asset between locations/departments
   */
  async transferAsset(transferRequest: Partial<AssetTransfer>, userId: string): Promise<AssetTransfer> {
    try {
      // Validate transfer request
      await this.validateTransferRequest(transferRequest);

      const transfer: AssetTransfer = {
        transferId: this.generateTransferId(),
        assetId: transferRequest.assetId!,
        fromLocation: transferRequest.fromLocation!,
        toLocation: transferRequest.toLocation!,
        fromDepartment: transferRequest.fromDepartment!,
        toDepartment: transferRequest.toDepartment!,
        fromEmployee: transferRequest.fromEmployee!,
        toEmployee: transferRequest.toEmployee!,
        transferDate: transferRequest.transferDate || new Date().toISOString(),
        transferReason: transferRequest.transferReason!,
        approvedBy: userId,
        status: 'pending',
      };

      // Save transfer record (when entity is created)
      // await this.transferRepository.save(transfer);

      // Emit transfer initiated event
      this.eventEmitter.emit('asset.transfer.initiated', {
        transferId: transfer.transferId,
        assetId: transfer.assetId,
        fromLocation: transfer.fromLocation,
        toLocation: transfer.toLocation,
        userId,
      });

      return transfer;
    } catch (error) {
      this.logger.error(`Asset transfer failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get asset valuation
   */
  async getAssetValuation(assetId: string, valuationDate?: string): Promise<AssetValuation> {
    try {
      const asset = await this.getAssetById(assetId);
      const valDate = valuationDate ? new Date(valuationDate) : new Date();

      // Calculate current depreciated value
      const depreciation = await this.calculateDepreciation(assetId, valDate.toISOString());

      // Estimate market value (AI-powered in real implementation)
      const marketValue = await this.estimateMarketValue(asset);

      // Calculate replacement cost
      const replacementCost = await this.estimateReplacementCost(asset);

      return {
        assetId,
        currentValue: depreciation.bookValue,
        depreciatedValue: depreciation.bookValue,
        marketValue,
        replacementCost,
        valuationMethod: 'depreciated_cost_market_comparison',
        valuationDate: valDate.toISOString(),
        confidence: 0.85,
      };
    } catch (error) {
      this.logger.error(`Asset valuation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get asset by ID
   */
  private async getAssetById(assetId: string): Promise<any> {
    // Mock asset data - will be replaced with database query
    return {
      id: assetId,
      assetTag: 'AST-001',
      assetName: 'Manufacturing Equipment',
      assetType: 'equipment',
      purchasePrice: 100000,
      purchaseDate: '2023-01-01',
      usefulLife: 10,
      salvageValue: 10000,
      depreciationMethod: 'straight_line',
      location: 'Factory Floor 1',
      department: 'Manufacturing',
      status: 'active',
    };
  }

  /**
   * Calculate straight-line depreciation
   */
  private calculateStraightLineDepreciation(asset: any, asOfDate: Date): any {
    const purchaseDate = new Date(asset.purchaseDate);
    const yearsElapsed = (asOfDate.getTime() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    
    const annualDepreciation = (asset.purchasePrice - asset.salvageValue) / asset.usefulLife;
    const accumulatedDepreciation = Math.min(
      yearsElapsed * annualDepreciation,
      asset.purchasePrice - asset.salvageValue
    );
    const bookValue = asset.purchasePrice - accumulatedDepreciation;

    return {
      depreciationAmount: annualDepreciation,
      accumulatedDepreciation,
      bookValue: Math.max(bookValue, asset.salvageValue),
    };
  }

  /**
   * Calculate declining balance depreciation
   */
  private calculateDecliningBalanceDepreciation(asset: any, asOfDate: Date): any {
    const purchaseDate = new Date(asset.purchaseDate);
    const yearsElapsed = (asOfDate.getTime() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    
    const depreciationRate = 2 / asset.usefulLife; // Double declining balance
    let bookValue = asset.purchasePrice;
    
    for (let year = 0; year < Math.floor(yearsElapsed); year++) {
      const yearlyDepreciation = bookValue * depreciationRate;
      bookValue = Math.max(bookValue - yearlyDepreciation, asset.salvageValue);
    }

    const accumulatedDepreciation = asset.purchasePrice - bookValue;
    const currentYearDepreciation = bookValue * depreciationRate;

    return {
      depreciationAmount: currentYearDepreciation,
      accumulatedDepreciation,
      bookValue,
    };
  }

  /**
   * Calculate units of production depreciation
   */
  private calculateUnitsOfProductionDepreciation(asset: any, asOfDate: Date): any {
    // Mock calculation - would need actual production units data
    const expectedTotalUnits = asset.expectedTotalUnits || 100000;
    const unitsProducedToDate = asset.unitsProducedToDate || 25000;
    
    const depreciationPerUnit = (asset.purchasePrice - asset.salvageValue) / expectedTotalUnits;
    const accumulatedDepreciation = unitsProducedToDate * depreciationPerUnit;
    const bookValue = asset.purchasePrice - accumulatedDepreciation;

    return {
      depreciationAmount: depreciationPerUnit,
      accumulatedDepreciation,
      bookValue: Math.max(bookValue, asset.salvageValue),
    };
  }

  /**
   * Calculate sum of years digits depreciation
   */
  private calculateSumOfYearsDepreciation(asset: any, asOfDate: Date): any {
    const purchaseDate = new Date(asset.purchaseDate);
    const yearsElapsed = Math.floor((asOfDate.getTime() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    
    const sumOfYears = (asset.usefulLife * (asset.usefulLife + 1)) / 2;
    let accumulatedDepreciation = 0;

    for (let year = 1; year <= Math.min(yearsElapsed, asset.usefulLife); year++) {
      const remainingLife = asset.usefulLife - year + 1;
      const yearlyDepreciation = (asset.purchasePrice - asset.salvageValue) * (remainingLife / sumOfYears);
      accumulatedDepreciation += yearlyDepreciation;
    }

    const bookValue = asset.purchasePrice - accumulatedDepreciation;
    const currentYear = Math.min(yearsElapsed + 1, asset.usefulLife);
    const remainingLife = asset.usefulLife - currentYear + 1;
    const currentYearDepreciation = (asset.purchasePrice - asset.salvageValue) * (remainingLife / sumOfYears);

    return {
      depreciationAmount: currentYearDepreciation,
      accumulatedDepreciation,
      bookValue: Math.max(bookValue, asset.salvageValue),
    };
  }

  /**
   * Calculate depreciation schedule for asset lifecycle
   */
  private async calculateDepreciationSchedule(asset: any): Promise<any[]> {
    const schedule = [];
    const purchaseDate = new Date(asset.purchaseDate);

    for (let year = 1; year <= asset.usefulLife; year++) {
      const asOfDate = new Date(purchaseDate.getFullYear() + year, purchaseDate.getMonth(), purchaseDate.getDate());
      
      let depreciation;
      switch (asset.depreciationMethod) {
        case 'straight_line':
          depreciation = this.calculateStraightLineDepreciation(asset, asOfDate);
          break;
        case 'declining_balance':
          depreciation = this.calculateDecliningBalanceDepreciation(asset, asOfDate);
          break;
        default:
          depreciation = this.calculateStraightLineDepreciation(asset, asOfDate);
      }

      schedule.push({
        year,
        date: asOfDate.toISOString(),
        annualDepreciation: depreciation.depreciationAmount,
        accumulatedDepreciation: depreciation.accumulatedDepreciation,
        bookValue: depreciation.bookValue,
      });
    }

    return schedule;
  }

  /**
   * Calculate remaining useful life
   */
  private calculateRemainingLife(asset: any, asOfDate: Date): number {
    const purchaseDate = new Date(asset.purchaseDate);
    const yearsElapsed = (asOfDate.getTime() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return Math.max(0, asset.usefulLife - yearsElapsed);
  }

  /**
   * Calculate depreciation rate
   */
  private calculateDepreciationRate(asset: any): number {
    switch (asset.depreciationMethod) {
      case 'straight_line':
        return 1 / asset.usefulLife;
      case 'declining_balance':
        return 2 / asset.usefulLife;
      default:
        return 1 / asset.usefulLife;
    }
  }

  /**
   * Estimate market value using AI/ML (mock implementation)
   */
  private async estimateMarketValue(asset: any): Promise<number> {
    // Mock AI-powered market valuation
    const ageFactors = {
      'equipment': 0.85,
      'vehicle': 0.70,
      'building': 0.95,
      'software': 0.50,
      'furniture': 0.75,
    };

    const ageFactor = ageFactors[asset.assetType] || 0.80;
    const yearsOld = (Date.now() - new Date(asset.purchaseDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    const marketValue = asset.purchasePrice * Math.pow(ageFactor, yearsOld);

    return new Decimal(marketValue).toNumber();
  }

  /**
   * Estimate replacement cost
   */
  private async estimateReplacementCost(asset: any): Promise<number> {
    // Mock replacement cost calculation with inflation adjustment
    const inflationRate = 0.03; // 3% annual inflation
    const yearsOld = (Date.now() - new Date(asset.purchaseDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    const replacementCost = asset.purchasePrice * Math.pow(1 + inflationRate, yearsOld);

    return new Decimal(replacementCost).toNumber();
  }

  /**
   * Validate asset data
   */
  private async validateAssetData(assetData: AssetCreateRequest): Promise<void> {
    const errors: string[] = [];

    if (!assetData.assetName || assetData.assetName.trim().length === 0) {
      errors.push('Asset name is required');
    }

    if (!assetData.purchasePrice || assetData.purchasePrice <= 0) {
      errors.push('Purchase price must be greater than zero');
    }

    if (!assetData.usefulLife || assetData.usefulLife <= 0) {
      errors.push('Useful life must be greater than zero');
    }

    if (assetData.salvageValue < 0) {
      errors.push('Salvage value cannot be negative');
    }

    if (assetData.salvageValue >= assetData.purchasePrice) {
      errors.push('Salvage value must be less than purchase price');
    }

    if (errors.length > 0) {
      throw new BadRequestException(`Asset validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Validate transfer request
   */
  private async validateTransferRequest(transferRequest: Partial<AssetTransfer>): Promise<void> {
    const errors: string[] = [];

    if (!transferRequest.assetId) {
      errors.push('Asset ID is required');
    }

    if (!transferRequest.toLocation) {
      errors.push('Destination location is required');
    }

    if (!transferRequest.toDepartment) {
      errors.push('Destination department is required');
    }

    if (!transferRequest.toEmployee) {
      errors.push('Responsible employee is required');
    }

    if (errors.length > 0) {
      throw new BadRequestException(`Transfer validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Generate unique asset ID
   */
  private generateAssetId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `AST_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Generate asset tag
   */
  private generateAssetTag(assetType: string): string {
    const typePrefix = {
      'building': 'BLD',
      'equipment': 'EQP',
      'vehicle': 'VHC',
      'furniture': 'FRN',
      'software': 'SFW',
      'intangible': 'INT',
    };

    const prefix = typePrefix[assetType] || 'AST';
    const sequence = String(Date.now()).slice(-6);
    return `${prefix}-${sequence}`;
  }

  /**
   * Generate unique transfer ID
   */
  private generateTransferId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `TXF_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Get asset maintenance schedule
   */
  async getMaintenanceSchedule(assetId: string): Promise<MaintenanceSchedule[]> {
    try {
      // Mock maintenance schedule - will be replaced with database query
      return [
        {
          frequency: 'monthly',
          lastMaintenance: '2024-01-15',
          nextMaintenance: '2024-02-15',
          maintenanceType: 'preventive',
          estimatedCost: 500,
        },
        {
          frequency: 'quarterly',
          lastMaintenance: '2024-01-01',
          nextMaintenance: '2024-04-01',
          maintenanceType: 'predictive',
          estimatedCost: 2000,
        },
      ];
    } catch (error) {
      this.logger.error(`Failed to get maintenance schedule: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update asset status
   */
  async updateAssetStatus(
    assetId: string,
    status: 'active' | 'inactive' | 'disposed' | 'under_maintenance',
    reason: string,
    userId: string
  ): Promise<boolean> {
    try {
      // Update asset status in database (when entity is created)
      // const asset = await this.assetRepository.findOne({ where: { id: assetId } });
      // if (asset) {
      //   asset.status = status;
      //   asset.statusReason = reason;
      //   asset.updatedBy = userId;
      //   asset.updatedAt = new Date();
      //   await this.assetRepository.save(asset);
      // }

      // Emit status changed event
      this.eventEmitter.emit('asset.status.changed', {
        assetId,
        newStatus: status,
        reason,
        userId,
        timestamp: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      this.logger.error(`Asset status update failed: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Generate asset analytics
   */
  async generateAssetAnalytics(entityId?: string, period?: string): Promise<any> {
    try {
      return {
        period: period || 'current_year',
        entityId: entityId || 'all',
        totalAssets: 1250,
        totalValue: 25000000,
        totalDepreciation: 5000000,
        netBookValue: 20000000,
        assetsByType: {
          equipment: { count: 450, value: 12000000 },
          vehicles: { count: 85, value: 3500000 },
          buildings: { count: 15, value: 8000000 },
          furniture: { count: 650, value: 1200000 },
          software: { count: 50, value: 300000 },
        },
        maintenanceCosts: {
          planned: 250000,
          unplanned: 75000,
          total: 325000,
        },
        depreciationByMethod: {
          straight_line: 2800000,
          declining_balance: 1500000,
          units_of_production: 450000,
          sum_of_years: 250000,
        },
        recommendations: [
          'Consider replacing equipment older than 15 years',
          'Optimize maintenance schedules to reduce unplanned costs',
          'Review depreciation methods for software assets',
        ],
      };
    } catch (error) {
      this.logger.error(`Asset analytics generation failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
