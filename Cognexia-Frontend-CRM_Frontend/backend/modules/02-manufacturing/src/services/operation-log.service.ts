import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OperationLog, OperationLogType, OperationStatus } from '../entities/OperationLog';

@Injectable()
export class OperationLogService {
  private readonly logger = new Logger(OperationLogService.name);

  constructor(
    @InjectRepository(OperationLog)
    private readonly operationLogRepository: Repository<OperationLog>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger.log('Operation Log Service initialized');
  }

  async create(logData: Partial<OperationLog>): Promise<OperationLog> {
    const log = this.operationLogRepository.create({
      ...logData,
      timestamp: new Date(),
    });

    const savedLog = await this.operationLogRepository.save(log);
    this.eventEmitter.emit('operation-log.created', savedLog);
    
    return savedLog;
  }

  async findAll(): Promise<OperationLog[]> {
    return this.operationLogRepository.find({
      relations: ['workOrder', 'workCenter'],
      order: { timestamp: 'DESC' }
    });
  }

  async findById(id: string): Promise<OperationLog> {
    const log = await this.operationLogRepository.findOne({
      where: { id },
      relations: ['workOrder', 'workCenter']
    });

    if (!log) {
      throw new NotFoundException(`Operation log with ID ${id} not found`);
    }

    return log;
  }

  async findByWorkOrder(workOrderId: string): Promise<OperationLog[]> {
    return this.operationLogRepository.find({
      where: { workOrderId },
      relations: ['workCenter'],
      order: { timestamp: 'ASC' }
    });
  }

  async findByWorkCenter(workCenterId: string): Promise<OperationLog[]> {
    return this.operationLogRepository.find({
      where: { workCenterId },
      relations: ['workOrder'],
      order: { timestamp: 'DESC' }
    });
  }

  async logOperation(
    workOrderId: string,
    operationType: OperationLogType,
    operationData: Partial<OperationLog>
  ): Promise<OperationLog> {
    const log = await this.create({
      workOrderId,
      logType: operationType,
      status: OperationStatus.STARTED,
      ...operationData,
    });

    return log;
  }

  async completeOperation(logId: string, completionData: any): Promise<OperationLog> {
    const log = await this.findById(logId);
    
    log.status = OperationStatus.COMPLETED;
    log.endTime = new Date();
    log.duration = completionData.duration;
    log.quantityProduced = completionData.quantityProduced;
    log.yieldPercentage = completionData.yieldPercentage;

    const updatedLog = await this.operationLogRepository.save(log);
    this.eventEmitter.emit('operation.completed', updatedLog);
    
    return updatedLog;
  }
}
