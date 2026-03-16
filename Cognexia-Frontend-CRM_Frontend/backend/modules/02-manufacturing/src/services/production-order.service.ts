import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProductionOrder, ProductionOrderStatus } from '../entities/ProductionOrder';

@Injectable()
export class ProductionOrderService {
  private readonly logger = new Logger(ProductionOrderService.name);

  constructor(
    @InjectRepository(ProductionOrder)
    private readonly productionOrderRepository: Repository<ProductionOrder>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger.log('Production Order Service initialized');
  }

  async create(orderData: Partial<ProductionOrder>): Promise<ProductionOrder> {
    this.logger.log('Creating new production order');
    
    const order = this.productionOrderRepository.create({
      ...orderData,
      status: ProductionOrderStatus.CREATED,
    });

    const savedOrder = await this.productionOrderRepository.save(order);
    this.eventEmitter.emit('production-order.created', savedOrder);
    
    return savedOrder;
  }

  async findAll(): Promise<ProductionOrder[]> {
    return this.productionOrderRepository.find({
      relations: ['workOrders', 'productionLine'],
      order: { createdAt: 'DESC' }
    });
  }

  async findById(id: string): Promise<ProductionOrder> {
    const order = await this.productionOrderRepository.findOne({
      where: { id },
      relations: ['workOrders', 'productionLine']
    });

    if (!order) {
      throw new NotFoundException(`Production order with ID ${id} not found`);
    }

    return order;
  }

  async update(id: string, updateData: Partial<ProductionOrder>): Promise<ProductionOrder> {
    const order = await this.findById(id);
    Object.assign(order, updateData);
    
    const updatedOrder = await this.productionOrderRepository.save(order);
    this.eventEmitter.emit('production-order.updated', updatedOrder);
    
    return updatedOrder;
  }

  async delete(id: string): Promise<void> {
    const order = await this.findById(id);
    await this.productionOrderRepository.remove(order);
    
    this.eventEmitter.emit('production-order.deleted', { id });
    this.logger.log(`Production order ${id} deleted`);
  }

  async startOrder(id: string): Promise<ProductionOrder> {
    const order = await this.findById(id);
    order.status = ProductionOrderStatus.IN_PROGRESS;
    order.actualStartTime = new Date();
    
    const updatedOrder = await this.productionOrderRepository.save(order);
    this.eventEmitter.emit('production-order.started', updatedOrder);
    
    return updatedOrder;
  }

  async completeOrder(id: string): Promise<ProductionOrder> {
    const order = await this.findById(id);
    order.status = ProductionOrderStatus.COMPLETED;
    order.actualEndTime = new Date();
    
    const updatedOrder = await this.productionOrderRepository.save(order);
    this.eventEmitter.emit('production-order.completed', updatedOrder);
    
    return updatedOrder;
  }
}
