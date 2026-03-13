import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BillOfMaterials, BOMStatus } from '../entities/BillOfMaterials';
import { BOMComponent } from '../entities/BOMComponent';

// ========================================================================================
// BILL OF MATERIALS SERVICE
// ========================================================================================
// Core service for managing BOMs, component relationships, and material planning
// Handles BOM versioning, costing, and material requirement planning (MRP)
// ========================================================================================

@Injectable()
export class BillOfMaterialsService {
  private readonly logger = new Logger(BillOfMaterialsService.name);

  constructor(
    @InjectRepository(BillOfMaterials)
    private readonly bomRepository: Repository<BillOfMaterials>,
    @InjectRepository(BOMComponent)
    private readonly bomComponentRepository: Repository<BOMComponent>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger.log('Bill of Materials Service initialized');
  }

  // ========================================================================================
  // CRUD OPERATIONS
  // ========================================================================================

  async create(bomData: Partial<BillOfMaterials>): Promise<BillOfMaterials> {
    this.logger.log('Creating new Bill of Materials');
    
    const bom = this.bomRepository.create({
      ...bomData,
      status: BOMStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedBOM = await this.bomRepository.save(bom);
    
    this.eventEmitter.emit('bom.created', savedBOM);
    return savedBOM;
  }

  async findAll(): Promise<BillOfMaterials[]> {
    return this.bomRepository.find({
      relations: ['components'],
      order: { createdAt: 'DESC' }
    });
  }

  async findById(id: string): Promise<BillOfMaterials> {
    const bom = await this.bomRepository.findOne({
      where: { id },
      relations: ['components']
    });

    if (!bom) {
      throw new NotFoundException(`Bill of Materials with ID ${id} not found`);
    }

    return bom;
  }

  async findByProductSku(productSku: string): Promise<BillOfMaterials[]> {
    return this.bomRepository.find({
      where: { productSku },
      relations: ['components'],
      order: { version: 'DESC' }
    });
  }

  async findActiveByProductSku(productSku: string): Promise<BillOfMaterials> {
    const bom = await this.bomRepository.findOne({
      where: { 
        productSku, 
        status: BOMStatus.ACTIVE 
      },
      relations: ['components']
    });

    if (!bom) {
      throw new NotFoundException(`Active BOM for product ${productSku} not found`);
    }

    return bom;
  }

  async update(id: string, updateData: Partial<BillOfMaterials>): Promise<BillOfMaterials> {
    const bom = await this.findById(id);
    
    Object.assign(bom, updateData);
    bom.updatedAt = new Date();
    
    const updatedBOM = await this.bomRepository.save(bom);
    
    this.eventEmitter.emit('bom.updated', updatedBOM);
    return updatedBOM;
  }

  async delete(id: string): Promise<void> {
    const bom = await this.findById(id);
    
    if (bom.status === BOMStatus.ACTIVE) {
      throw new Error('Cannot delete an active BOM. Please deactivate first.');
    }

    await this.bomRepository.remove(bom);
    
    this.eventEmitter.emit('bom.deleted', { id });
    this.logger.log(`BOM ${id} deleted`);
  }

  // ========================================================================================
  // BOM LIFECYCLE MANAGEMENT
  // ========================================================================================

  async activateBOM(id: string): Promise<BillOfMaterials> {
    this.logger.log(`Activating BOM: ${id}`);
    
    const bom = await this.findById(id);
    
    if (bom.status === BOMStatus.ACTIVE) {
      throw new Error('BOM is already active');
    }

    // Deactivate other versions of the same product
    await this.bomRepository.update(
      { productSku: bom.productSku, status: BOMStatus.ACTIVE },
      { status: BOMStatus.ARCHIVED }
    );

    bom.status = BOMStatus.ACTIVE;
    bom.updatedAt = new Date();
    
    const updatedBOM = await this.bomRepository.save(bom);
    this.eventEmitter.emit('bom.activated', updatedBOM);
    
    return updatedBOM;
  }

  async deactivateBOM(id: string): Promise<BillOfMaterials> {
    this.logger.log(`Deactivating BOM: ${id}`);
    
    const bom = await this.findById(id);
    
    bom.status = BOMStatus.ARCHIVED;
    bom.updatedAt = new Date();
    
    const updatedBOM = await this.bomRepository.save(bom);
    this.eventEmitter.emit('bom.deactivated', updatedBOM);
    
    return updatedBOM;
  }

  async createNewVersion(id: string, versionData: Partial<BillOfMaterials>): Promise<BillOfMaterials> {
    this.logger.log(`Creating new version of BOM: ${id}`);
    
    const originalBOM = await this.findById(id);
    
    const newVersion = this.bomRepository.create({
      ...originalBOM,
      id: undefined, // Let TypeORM generate new ID
      version: originalBOM.version + 1,
      status: BOMStatus.DRAFT,
      ...versionData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedNewVersion = await this.bomRepository.save(newVersion);
    
    // Copy components to new version
    if (originalBOM.components) {
      for (const component of originalBOM.components) {
        const newComponent = this.bomComponentRepository.create({
          ...component,
          id: undefined,
          bomId: savedNewVersion.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await this.bomComponentRepository.save(newComponent);
      }
    }

    const fullNewVersion = await this.findById(savedNewVersion.id);
    this.eventEmitter.emit('bom.version.created', fullNewVersion);
    
    return fullNewVersion;
  }

  // ========================================================================================
  // COMPONENT MANAGEMENT
  // ========================================================================================

  async addComponent(bomId: string, componentData: Partial<BOMComponent>): Promise<BOMComponent> {
    this.logger.log(`Adding component to BOM: ${bomId}`);
    
    const bom = await this.findById(bomId);
    
    if (bom.status === BOMStatus.ACTIVE) {
      throw new Error('Cannot modify an active BOM. Please create a new version.');
    }

    const component = this.bomComponentRepository.create({
      ...componentData,
      bomId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedComponent = await this.bomComponentRepository.save(component);
    
    // Update BOM total cost
    await this.recalculateBOMCost(bomId);
    
    this.eventEmitter.emit('bom.component.added', { bomId, component: savedComponent });
    return savedComponent;
  }

  async updateComponent(componentId: string, updateData: Partial<BOMComponent>): Promise<BOMComponent> {
    const component = await this.bomComponentRepository.findOne({
      where: { id: componentId }
    });

    if (!component) {
      throw new NotFoundException(`BOM Component with ID ${componentId} not found`);
    }

    Object.assign(component, updateData);
    component.updatedAt = new Date();
    
    const updatedComponent = await this.bomComponentRepository.save(component);
    
    // Update BOM total cost
    await this.recalculateBOMCost(component.bomId);
    
    this.eventEmitter.emit('bom.component.updated', updatedComponent);
    return updatedComponent;
  }

  async removeComponent(componentId: string): Promise<void> {
    const component = await this.bomComponentRepository.findOne({
      where: { id: componentId }
    });

    if (!component) {
      throw new NotFoundException(`BOM Component with ID ${componentId} not found`);
    }

    const bomId = component.bomId;
    await this.bomComponentRepository.remove(component);
    
    // Update BOM total cost
    await this.recalculateBOMCost(bomId);
    
    this.eventEmitter.emit('bom.component.removed', { componentId, bomId });
    this.logger.log(`BOM Component ${componentId} removed`);
  }

  // ========================================================================================
  // COSTING AND ANALYSIS
  // ========================================================================================

  async calculateBOMCost(id: string): Promise<any> {
    const bom = await this.findById(id);
    
    let totalMaterialCost = 0;
    let totalLaborCost = 0;
    let totalOverheadCost = 0;

    if (bom.components) {
      for (const component of bom.components) {
        const componentCost = (component.unitCost || 0) * component.quantity;
        totalMaterialCost += componentCost;
      }
    }

    // Mock labor and overhead calculations
    totalLaborCost = totalMaterialCost * 0.3; // 30% of material cost
    totalOverheadCost = totalMaterialCost * 0.2; // 20% of material cost

    const totalCost = totalMaterialCost + totalLaborCost + totalOverheadCost;

    return {
      bomId: id,
      productSku: bom.productSku,
      costBreakdown: {
        materialCost: Math.round(totalMaterialCost * 100) / 100,
        laborCost: Math.round(totalLaborCost * 100) / 100,
        overheadCost: Math.round(totalOverheadCost * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
      },
      costPerUnit: Math.round((totalCost / (bom.baseQuantity || 1)) * 100) / 100,
      calculatedAt: new Date(),
    };
  }

  private async recalculateBOMCost(bomId: string): Promise<void> {
    const costData = await this.calculateBOMCost(bomId);
    
    await this.bomRepository.update(bomId, {
      totalCost: costData.costBreakdown.totalCost,
      costPerUnit: costData.costPerUnit,
      updatedAt: new Date(),
    });
  }

  async compareBOMCosts(bomIds: string[]): Promise<any> {
    const comparisons = [];
    
    for (const bomId of bomIds) {
      const costData = await this.calculateBOMCost(bomId);
      const bom = await this.findById(bomId);
      
      comparisons.push({
        bomId,
        productSku: bom.productSku,
        version: bom.version,
        costData: costData.costBreakdown,
        costPerUnit: costData.costPerUnit,
      });
    }

    return {
      comparisons,
      analysis: this.analyzeCostDifferences(comparisons),
      generatedAt: new Date(),
    };
  }

  private analyzeCostDifferences(comparisons: any[]): any {
    if (comparisons.length < 2) return { message: 'Need at least 2 BOMs to compare' };

    const costs = comparisons.map(c => c.costData.totalCost);
    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);
    const avgCost = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;

    return {
      lowestCost: { value: minCost, bom: comparisons.find(c => c.costData.totalCost === minCost) },
      highestCost: { value: maxCost, bom: comparisons.find(c => c.costData.totalCost === maxCost) },
      averageCost: Math.round(avgCost * 100) / 100,
      costVariance: Math.round((maxCost - minCost) * 100) / 100,
      variancePercentage: Math.round(((maxCost - minCost) / avgCost) * 10000) / 100,
    };
  }

  // ========================================================================================
  // MATERIAL REQUIREMENTS PLANNING (MRP)
  // ========================================================================================

  async calculateMaterialRequirements(productionOrders: any[]): Promise<any> {
    this.logger.log('Calculating material requirements for production orders');
    
    const materialRequirements = new Map<string, any>();

    for (const order of productionOrders) {
      try {
        const bom = await this.findActiveByProductSku(order.productSku);
        
        if (bom.components) {
          for (const component of bom.components) {
            const totalRequired = component.quantity * order.plannedQuantity;
            const materialKey = component.materialSku;
            
            if (materialRequirements.has(materialKey)) {
              const existing = materialRequirements.get(materialKey);
              existing.totalRequired += totalRequired;
              existing.orders.push(order.id);
            } else {
              materialRequirements.set(materialKey, {
                materialSku: component.materialSku,
                materialName: component.materialName,
                unit: component.unit,
                totalRequired,
                unitCost: component.unitCost,
                totalCost: totalRequired * (component.unitCost || 0),
                orders: [order.id],
                suppliers: component.preferredSuppliers || [],
                leadTime: component.leadTimeDays || 0,
              });
            }
          }
        }
      } catch (error) {
        this.logger.warn(`No active BOM found for product ${order.productSku}`);
      }
    }

    const requirements = Array.from(materialRequirements.values());
    const totalCost = requirements.reduce((sum, req) => sum + req.totalCost, 0);

    return {
      planningId: `mrp-${Date.now()}`,
      productionOrders: productionOrders.map(o => o.id),
      materialRequirements: requirements,
      summary: {
        totalMaterials: requirements.length,
        totalCost: Math.round(totalCost * 100) / 100,
        uniqueSuppliers: this.getUniqueSuppliers(requirements),
        criticalMaterials: requirements.filter(r => r.leadTime > 14), // More than 2 weeks
      },
      generatedAt: new Date(),
    };
  }

  private getUniqueSuppliers(requirements: any[]): string[] {
    const suppliers = new Set<string>();
    
    requirements.forEach(req => {
      req.suppliers.forEach((supplier: string) => suppliers.add(supplier));
    });
    
    return Array.from(suppliers);
  }

  async validateBOM(id: string): Promise<any> {
    const bom = await this.findById(id);
    const validationErrors: string[] = [];
    const warnings: string[] = [];

    // Basic validations
    if (!bom.components || bom.components.length === 0) {
      validationErrors.push('BOM must have at least one component');
    }

    if (bom.baseQuantity <= 0) {
      validationErrors.push('Base quantity must be greater than zero');
    }

    // Component validations
    if (bom.components) {
      bom.components.forEach((component, index) => {
        if (component.quantity <= 0) {
          validationErrors.push(`Component ${index + 1}: Quantity must be greater than zero`);
        }

        if (!component.materialSku || component.materialSku.trim() === '') {
          validationErrors.push(`Component ${index + 1}: Material SKU is required`);
        }

        if (!component.unitCost || component.unitCost <= 0) {
          warnings.push(`Component ${index + 1}: Unit cost not specified or zero`);
        }

        if (!component.preferredSuppliers || component.preferredSuppliers.length === 0) {
          warnings.push(`Component ${index + 1}: No preferred suppliers specified`);
        }
      });
    }

    // Circular dependency check
    if (await this.hasCircularDependency(bom)) {
      validationErrors.push('Circular dependency detected in BOM structure');
    }

    return {
      bomId: id,
      valid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: warnings,
      validatedAt: new Date(),
    };
  }

  private async hasCircularDependency(bom: BillOfMaterials, visited: Set<string> = new Set()): Promise<boolean> {
    if (visited.has(bom.productSku)) {
      return true; // Circular dependency found
    }

    visited.add(bom.productSku);

    if (bom.components) {
      for (const component of bom.components) {
        try {
          const componentBOM = await this.findActiveByProductSku(component.materialSku);
          if (await this.hasCircularDependency(componentBOM, new Set(visited))) {
            return true;
          }
        } catch (error) {
          // Component doesn't have a BOM, which is fine
        }
      }
    }

    return false;
  }

  // ========================================================================================
  // REPORTING AND ANALYTICS
  // ========================================================================================

  async getBOMAnalytics(): Promise<any> {
    const totalBOMs = await this.bomRepository.count();
    const activeBOMs = await this.bomRepository.count({ where: { status: BOMStatus.ACTIVE } });
    const draftBOMs = await this.bomRepository.count({ where: { status: BOMStatus.DRAFT } });
    
    const complexBOMs = await this.bomRepository
      .createQueryBuilder('bom')
      .leftJoin('bom.components', 'component')
      .select('bom.id', 'bomId')
      .addSelect('COUNT(component.id)', 'componentCount')
      .groupBy('bom.id')
      .having('COUNT(component.id) > 10')
      .getRawMany();

    return {
      summary: {
        totalBOMs,
        activeBOMs,
        draftBOMs,
        archivedBOMs: totalBOMs - activeBOMs - draftBOMs,
        complexBOMs: complexBOMs.length,
      },
      trends: {
        createdLastMonth: await this.getBOMsCreatedInPeriod(30),
        modifiedLastWeek: await this.getBOMsModifiedInPeriod(7),
      },
      topProducts: await this.getTopProductsByCost(),
      generatedAt: new Date(),
    };
  }

  private async getBOMsCreatedInPeriod(days: number): Promise<number> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.bomRepository.count({
      where: {
        createdAt: {
          $gte: cutoffDate
        } as any
      }
    });
  }

  private async getBOMsModifiedInPeriod(days: number): Promise<number> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.bomRepository.count({
      where: {
        updatedAt: {
          $gte: cutoffDate
        } as any
      }
    });
  }

  private async getTopProductsByCost(): Promise<any[]> {
    const boms = await this.bomRepository.find({
      where: { status: BOMStatus.ACTIVE },
      order: { totalCost: 'DESC' },
      take: 10,
    });

    return boms.map(bom => ({
      productSku: bom.productSku,
      productName: bom.productName,
      totalCost: bom.totalCost,
      costPerUnit: bom.costPerUnit,
    }));
  }
}
