import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Product, ProductStatus } from '../entities/product.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async checkStock(productId: string, quantity: number, tenantId: string): Promise<boolean> {
    const product = await this.productRepository.findOne({
      where: { id: productId, tenantId },
    });

    if (!product || !product.trackInventory) {
      return true; // If not tracking, always available
    }

    const available = product.quantityInStock - product.quantityReserved;
    return available >= quantity;
  }

  async reserveStock(productId: string, quantity: number, tenantId: string): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId, tenantId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (!product.trackInventory) {
      return; // No need to reserve if not tracking
    }

    const available = product.quantityInStock - product.quantityReserved;
    if (available < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    await this.productRepository.increment({ id: productId }, 'quantityReserved', quantity);

    // Update status if out of stock
    if (available - quantity <= 0) {
      await this.productRepository.update({ id: productId }, { status: ProductStatus.OUT_OF_STOCK });
    }
  }

  async releaseStock(productId: string, quantity: number, tenantId: string): Promise<void> {
    await this.productRepository.decrement({ id: productId }, 'quantityReserved', quantity);
  }

  async decrementStock(productId: string, quantity: number, tenantId: string): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId, tenantId },
    });

    if (!product || !product.trackInventory) {
      return;
    }

    await this.productRepository.decrement({ id: productId }, 'quantityInStock', quantity);
    await this.productRepository.decrement({ id: productId }, 'quantityReserved', quantity);

    // Check if out of stock
    const updated = await this.productRepository.findOne({ where: { id: productId } });
    if (updated && updated.quantityInStock - updated.quantityReserved <= 0) {
      await this.productRepository.update({ id: productId }, { status: ProductStatus.OUT_OF_STOCK });
    }
  }

  async incrementStock(productId: string, quantity: number, tenantId: string): Promise<void> {
    await this.productRepository.increment({ id: productId }, 'quantityInStock', quantity);

    // Reactivate if was out of stock
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (product && product.status === ProductStatus.OUT_OF_STOCK && product.quantityInStock > 0) {
      await this.productRepository.update({ id: productId }, { status: ProductStatus.ACTIVE });
    }
  }

  async getLowStockProducts(tenantId: string): Promise<Product[]> {
    const products = await this.productRepository.find({
      where: { tenantId, trackInventory: true },
    });

    return products.filter(p => {
      const available = p.quantityInStock - p.quantityReserved;
      return available <= p.lowStockThreshold;
    });
  }

  async getOutOfStockProducts(tenantId: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { tenantId, status: ProductStatus.OUT_OF_STOCK },
    });
  }

  async getInventoryReport(tenantId: string): Promise<any> {
    const products = await this.productRepository.find({
      where: { tenantId, trackInventory: true },
    });

    const totalProducts = products.length;
    const lowStock = products.filter(p => p.quantityInStock - p.quantityReserved <= p.lowStockThreshold).length;
    const outOfStock = products.filter(p => p.quantityInStock - p.quantityReserved <= 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.quantityInStock * Number(p.basePrice)), 0);

    return {
      totalProducts,
      lowStockCount: lowStock,
      outOfStockCount: outOfStock,
      totalInventoryValue: totalValue,
      lowStockProducts: products.filter(p => p.quantityInStock - p.quantityReserved <= p.lowStockThreshold),
    };
  }
}
