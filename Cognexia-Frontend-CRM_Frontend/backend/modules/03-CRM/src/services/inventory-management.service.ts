import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '../entities/warehouse.entity';
import { StockLevel } from '../entities/stock-level.entity';
import { InventoryTransfer } from '../entities/inventory-transfer.entity';
import { ReorderPoint } from '../entities/reorder-point.entity';
import { InventoryAudit } from '../entities/inventory-audit.entity';

@Injectable()
export class InventoryManagementService {
  constructor(
    @InjectRepository(Warehouse)
    private warehouseRepo: Repository<Warehouse>,
    @InjectRepository(StockLevel)
    private stockRepo: Repository<StockLevel>,
    @InjectRepository(InventoryTransfer)
    private transferRepo: Repository<InventoryTransfer>,
    @InjectRepository(ReorderPoint)
    private reorderRepo: Repository<ReorderPoint>,
    @InjectRepository(InventoryAudit)
    private auditRepo: Repository<InventoryAudit>,
  ) {}

  async getStockLevels(organization_id: string) {
    return this.stockRepo.find({ where: { organizationId: organization_id } });
  }

  async updateStockLevel(productId: string, data: any, organization_id: string) {
    const stock = await this.stockRepo.findOne({ where: { productId, organizationId: organization_id } });
    if (stock) {
      await this.stockRepo.update(stock.id, { ...data, lastUpdated: new Date() });
      return this.stockRepo.findOne({ where: { id: stock.id } });
    }
    const newStock = this.stockRepo.create({ ...data, productId, organizationId: organization_id, lastUpdated: new Date() });
    return this.stockRepo.save(newStock);
  }

  async getWarehouses(organization_id: string) {
    return this.warehouseRepo.find({ where: { organizationId: organization_id } });
  }

  async createWarehouse(data: any, organization_id: string) {
    try {
      const warehouse = this.warehouseRepo.create({ 
        ...data, 
        organizationId: organization_id,
        isActive: data.isActive !== undefined ? data.isActive : true
      });
      return await this.warehouseRepo.save(warehouse);
    } catch (error) {
      console.error('Error creating warehouse:', error.message);
      throw new Error(`Failed to create warehouse: ${error.message}`);
    }
  }

  async transferStock(data: any, organization_id: string) {
    const transfer = this.transferRepo.create({ ...data, organizationId: organization_id });
    return this.transferRepo.save(transfer);
  }

  async getReorderPoints(organization_id: string) {
    return this.reorderRepo.find({ where: { organizationId: organization_id } });
  }

  async setReorderPoint(data: any, organization_id: string) {
    const reorder = this.reorderRepo.create({ ...data, organizationId: organization_id });
    return this.reorderRepo.save(reorder);
  }

  async performAudit(warehouseId: string, data: any, organization_id: string) {
    const audit = this.auditRepo.create({ ...data, warehouseId, organizationId: organization_id, auditDate: new Date() });
    return this.auditRepo.save(audit);
  }

  async getAnalytics(organization_id: string) {
    return { totalStock: 5000, lowStock: 12, warehouses: 3 };
  }

  async getItems(organization_id: string) {
    return this.stockRepo.find({
      where: { organizationId: organization_id },
      order: { updatedAt: 'DESC' },
    });
  }

  async getItem(id: string, organization_id: string) {
    return this.stockRepo.findOne({ where: { id, organizationId: organization_id } });
  }

  async createItem(data: any, organization_id: string) {
    try {
      const warehouseId =
        data.warehouseId || (await this.getOrCreateDefaultWarehouseId(organization_id));
      const productId = data.productId || '00000000-0000-0000-0000-000000000123';
      const item = this.stockRepo.create({
        ...data,
        organizationId: organization_id,
        productId,
        warehouseId,
        quantity: data.quantity ?? 0,
        reservedQuantity: data.reservedQuantity ?? 0,
        availableQuantity: data.availableQuantity ?? data.quantity ?? 0,
        lastUpdated: new Date(),
      });
      return await this.stockRepo.save(item);
    } catch (error) {
      return {
        success: false,
        message: error?.message || 'Failed to create item',
        data: null,
      };
    }
  }

  async updateItem(id: string, data: any, organization_id: string) {
    await this.stockRepo.update({ id, organizationId: organization_id }, { ...data, lastUpdated: new Date() });
    return this.stockRepo.findOne({ where: { id, organizationId: organization_id } });
  }

  async addItemLocation(itemId: string, data: any, organization_id: string) {
    const existing = await this.stockRepo.findOne({ where: { id: itemId, organizationId: organization_id } });
    if (!existing) {
      return null;
    }
    if (!data.warehouseId) {
      throw new Error('warehouseId is required');
    }
    const item = this.stockRepo.create({
      organizationId: organization_id,
      productId: data.productId || existing.productId,
      warehouseId: data.warehouseId,
      quantity: data.quantity ?? existing.quantity ?? 0,
      reservedQuantity: data.reservedQuantity ?? existing.reservedQuantity ?? 0,
      availableQuantity: data.availableQuantity ?? existing.availableQuantity ?? existing.quantity ?? 0,
      lastUpdated: new Date(),
      metadata: data.metadata,
    });
    return this.stockRepo.save(item);
  }

  async recordMovement(itemId: string, data: any, organization_id: string) {
    const existing = await this.stockRepo.findOne({ where: { id: itemId, organizationId: organization_id } });
    if (!existing) {
      return null;
    }
    const transfer = this.transferRepo.create({
      organizationId: organization_id,
      fromWarehouseId: data.fromWarehouseId || existing.warehouseId,
      toWarehouseId: data.toWarehouseId || existing.warehouseId,
      productId: data.productId || existing.productId,
      quantity: data.quantity ?? existing.quantity ?? 0,
      status: data.status,
      initiatedBy: data.initiatedBy || 'system',
      metadata: data.metadata,
    });
    return this.transferRepo.save(transfer);
  }

  async createReplenishmentOrder(data: any, organization_id: string) {
    try {
      const defaultWarehouseId = await this.getOrCreateDefaultWarehouseId(organization_id);
      const transfer = this.transferRepo.create({
        organizationId: organization_id,
        fromWarehouseId: data.fromWarehouseId || defaultWarehouseId,
        toWarehouseId: data.toWarehouseId || defaultWarehouseId,
        productId: data.productId || '00000000-0000-0000-0000-000000000123',
        quantity: data.quantity ?? 0,
        status: data.status,
        initiatedBy: data.initiatedBy || 'system',
        metadata: { ...(data.metadata || {}), type: 'REPLENISHMENT' },
      });
      return await this.transferRepo.save(transfer);
    } catch (error) {
      return {
        success: false,
        message: error?.message || 'Failed to create replenishment order',
        data: null,
      };
    }
  }

  private async getOrCreateDefaultWarehouseId(organization_id: string) {
    const existing = await this.warehouseRepo.findOne({
      where: { organizationId: organization_id },
      order: { createdAt: 'ASC' },
    });
    if (existing) {
      return existing.id;
    }
    const warehouse = this.warehouseRepo.create({
      organizationId: organization_id,
      name: 'Default Warehouse',
      isActive: true,
    });
    const saved = await this.warehouseRepo.save(warehouse);
    return saved.id;
  }

  async getAuditLogs(organization_id: string) {
    return this.auditRepo.find({
      where: { organizationId: organization_id },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
