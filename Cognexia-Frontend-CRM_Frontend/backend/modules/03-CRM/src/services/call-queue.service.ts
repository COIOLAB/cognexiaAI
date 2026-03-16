import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallQueue, QueueStrategy } from '../entities/call-queue.entity';
import { User } from '../entities/user.entity';
import { CreateQueueDto, UpdateQueueDto } from '../dto/telephony.dto';

@Injectable()
export class CallQueueService {
  constructor(
    @InjectRepository(CallQueue)
    private readonly queueRepo: Repository<CallQueue>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createQueue(tenantId: string, dto: CreateQueueDto): Promise<CallQueue> {
    const queue = this.queueRepo.create({
      ...dto,
      tenantId,
    });

    if (dto.agentIds && dto.agentIds.length > 0) {
      queue.agents = await this.userRepo.findByIds(dto.agentIds);
    }

    return this.queueRepo.save(queue);
  }

  async findQueueById(id: string, tenantId: string): Promise<CallQueue> {
    const queue = await this.queueRepo.findOne({
      where: { id, tenantId },
      relations: ['agents'],
    });

    if (!queue) {
      throw new NotFoundException('Queue not found');
    }

    return queue;
  }

  async findAllQueues(tenantId: string): Promise<CallQueue[]> {
    return this.queueRepo.find({
      where: { tenantId },
      relations: ['agents'],
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  async updateQueue(id: string, tenantId: string, dto: UpdateQueueDto): Promise<CallQueue> {
    const queue = await this.findQueueById(id, tenantId);
    Object.assign(queue, dto);
    return this.queueRepo.save(queue);
  }

  async deleteQueue(id: string, tenantId: string): Promise<void> {
    const result = await this.queueRepo.delete({ id, tenantId });
    if (result.affected === 0) {
      throw new NotFoundException('Queue not found');
    }
  }

  async addAgentsToQueue(id: string, tenantId: string, agentIds: string[]): Promise<CallQueue> {
    const queue = await this.findQueueById(id, tenantId);
    const agents = await this.userRepo.findByIds(agentIds);

    if (!queue.agents) {
      queue.agents = [];
    }

    queue.agents = [...queue.agents, ...agents];
    return this.queueRepo.save(queue);
  }

  async removeAgentFromQueue(id: string, tenantId: string, agentId: string): Promise<CallQueue> {
    const queue = await this.findQueueById(id, tenantId);
    queue.agents = queue.agents.filter(agent => agent.id !== agentId);
    return this.queueRepo.save(queue);
  }

  async getAvailableQueues(tenantId: string): Promise<CallQueue[]> {
    return this.queueRepo.find({
      where: { tenantId, isActive: true },
      relations: ['agents'],
    });
  }

  async updateQueueStats(id: string, tenantId: string, stats: Partial<CallQueue>): Promise<void> {
    await this.queueRepo.update({ id, tenantId }, stats);
  }

  async getQueueStatistics(id: string, tenantId: string): Promise<{
    queue: CallQueue;
    stats: {
      abandonmentRate: number;
      serviceLevel: number;
      averageWaitTime: number;
      averageHandleTime: number;
      activeAgents: number;
    };
  }> {
    const queue = await this.findQueueById(id, tenantId);

    return {
      queue,
      stats: {
        abandonmentRate: queue.abandonmentRate,
        serviceLevel: queue.serviceLevelPercentage,
        averageWaitTime: queue.averageWaitTime,
        averageHandleTime: queue.averageHandleTime,
        activeAgents: queue.agents?.length || 0,
      },
    };
  }

  async getNextAvailableAgent(queueId: string, tenantId: string): Promise<User | null> {
    const queue = await this.findQueueById(queueId, tenantId);

    if (!queue.agents || queue.agents.length === 0) {
      return null;
    }

    // Simple round-robin for now
    // In production, would track agent availability and use strategy
    return queue.agents[0];
  }
}
