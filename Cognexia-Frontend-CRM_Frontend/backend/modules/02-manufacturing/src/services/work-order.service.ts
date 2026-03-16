import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WorkOrder, WorkOrderStatus } from '../entities/WorkOrder';

@Injectable()
export class WorkOrderService {
  private readonly logger = new Logger(WorkOrderService.name);

  constructor(
    @InjectRepository(WorkOrder)
    private readonly workOrderRepository: Repository<WorkOrder>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger.log('Work Order Service initialized');
  }

  async create(workOrderData: Partial<WorkOrder>): Promise<WorkOrder> {
    this.logger.log('Creating new work order');
    
    const workOrder = this.workOrderRepository.create({
      ...workOrderData,
      status: WorkOrderStatus.CREATED,
    });

    const savedWorkOrder = await this.workOrderRepository.save(workOrder);
    this.eventEmitter.emit('work-order.created', savedWorkOrder);
    
    return savedWorkOrder;
  }

  async findAll(): Promise<WorkOrder[]> {
    return this.workOrderRepository.find({
      relations: ['productionOrder', 'workCenter', 'operationLogs'],
      order: { scheduledStartTime: 'ASC' }
    });
  }

  async findById(id: string): Promise<WorkOrder> {
    const workOrder = await this.workOrderRepository.findOne({
      where: { id },
      relations: ['productionOrder', 'workCenter', 'operationLogs']
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order with ID ${id} not found`);
    }

    return workOrder;
  }

  async update(id: string, updateData: Partial<WorkOrder>): Promise<WorkOrder> {
    const workOrder = await this.findById(id);
    Object.assign(workOrder, updateData);
    
    const updatedWorkOrder = await this.workOrderRepository.save(workOrder);
    this.eventEmitter.emit('work-order.updated', updatedWorkOrder);
    
    return updatedWorkOrder;
  }

  async delete(id: string): Promise<void> {
    const workOrder = await this.findById(id);
    await this.workOrderRepository.remove(workOrder);
    
    this.eventEmitter.emit('work-order.deleted', { id });
    this.logger.log(`Work order ${id} deleted`);
  }

  async startWorkOrder(id: string): Promise<WorkOrder> {
    const workOrder = await this.findById(id);
    workOrder.status = WorkOrderStatus.IN_PROGRESS;
    workOrder.actualStartTime = new Date();
    
    const updatedWorkOrder = await this.workOrderRepository.save(workOrder);
    this.eventEmitter.emit('work-order.started', updatedWorkOrder);
    
    return updatedWorkOrder;
  }

  async completeWorkOrder(id: string, completionData: any): Promise<WorkOrder> {
    const workOrder = await this.findById(id);
    workOrder.status = WorkOrderStatus.COMPLETED;
    workOrder.actualEndTime = new Date();
    workOrder.completedQuantity = completionData.completedQuantity || workOrder.plannedQuantity;
    
    const updatedWorkOrder = await this.workOrderRepository.save(workOrder);
    this.eventEmitter.emit('work-order.completed', updatedWorkOrder);
    
    return updatedWorkOrder;
  }
}
