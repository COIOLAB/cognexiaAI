import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Call, CallStatus, CallDisposition, CallDirection } from '../entities/call.entity';
import { InitiateCallDto, UpdateCallDto, CallSearchDto, TransferCallDto } from '../dto/telephony.dto';

@Injectable()
export class CallService {
  constructor(
    @InjectRepository(Call)
    private readonly callRepo: Repository<Call>,
  ) {}

  // ============ CRUD Operations ============

  async initiateCall(tenantId: string, dto: InitiateCallDto): Promise<Call> {
    const call = this.callRepo.create({
      ...dto,
      tenantId,
      callSid: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      direction: dto.fromNumber.includes('+') ? CallDirection.OUTBOUND : CallDirection.INBOUND,
      status: CallStatus.INITIATED,
      startTime: new Date(),
    });

    return this.callRepo.save(call);
  }

  async findCallById(id: string, tenantId: string): Promise<Call> {
    try {
      const call = await this.callRepo.findOne({
        where: { id, tenantId },
        relations: ['customer', 'lead', 'agent', 'recordings'],
      });

      return call || null;
    } catch (error) {
      return null;
    }
  }

  async findCallByCallSid(callSid: string, tenantId: string): Promise<Call> {
    try {
      const call = await this.callRepo.findOne({
        where: { callSid, tenantId },
        relations: ['customer', 'lead', 'agent', 'recordings'],
      });

      return call || null;
    } catch (error) {
      return null;
    }
  }

  async updateCall(id: string, tenantId: string, dto: UpdateCallDto): Promise<Call> {
    const call = await this.findCallById(id, tenantId);

    Object.assign(call, dto);

    // Auto-calculate durations if status is completed
    if (dto.status === CallStatus.COMPLETED && !dto.duration) {
      if (call.startTime && call.endTime) {
        call.duration = Math.floor((call.endTime.getTime() - call.startTime.getTime()) / 1000);
      }
    }

    return this.callRepo.save(call);
  }

  async deleteCall(id: string, tenantId: string): Promise<void> {
    const result = await this.callRepo.delete({ id, tenantId });
    if (result.affected === 0) {
      throw new NotFoundException('Call not found');
    }
  }

  // ============ Call Actions ============

  async answerCall(id: string, tenantId: string, agentId: string): Promise<Call> {
    const call = await this.findCallById(id, tenantId);
    
    call.status = CallStatus.IN_PROGRESS;
    call.answerTime = new Date();
    call.agentId = agentId;

    if (call.startTime && call.answerTime) {
      call.ringDuration = Math.floor((call.answerTime.getTime() - call.startTime.getTime()) / 1000);
    }

    return this.callRepo.save(call);
  }

  async hangupCall(id: string, tenantId: string, disposition?: CallDisposition): Promise<Call> {
    const call = await this.findCallById(id, tenantId);
    
    call.status = CallStatus.COMPLETED;
    call.endTime = new Date();
    
    if (disposition) {
      call.disposition = disposition;
    }

    // Calculate total duration
    if (call.startTime && call.endTime) {
      call.duration = Math.floor((call.endTime.getTime() - call.startTime.getTime()) / 1000);
    }

    // Calculate talk duration (from answer to end)
    if (call.answerTime && call.endTime) {
      call.talkDuration = Math.floor((call.endTime.getTime() - call.answerTime.getTime()) / 1000);
    }

    return this.callRepo.save(call);
  }

  async holdCall(id: string, tenantId: string): Promise<Call> {
    const call = await this.findCallById(id, tenantId);
    call.status = CallStatus.ON_HOLD;
    return this.callRepo.save(call);
  }

  async resumeCall(id: string, tenantId: string): Promise<Call> {
    const call = await this.findCallById(id, tenantId);
    
    if (call.status === CallStatus.ON_HOLD) {
      call.status = CallStatus.IN_PROGRESS;
    }

    return this.callRepo.save(call);
  }

  async transferCall(id: string, tenantId: string, dto: TransferCallDto): Promise<Call> {
    const call = await this.findCallById(id, tenantId);
    
    call.isTransferred = true;
    call.transferredTo = dto.transferTo;
    
    if (dto.notes) {
      call.notes = (call.notes || '') + `\nTransfer: ${dto.notes}`;
    }

    return this.callRepo.save(call);
  }

  async markAsMissed(id: string, tenantId: string): Promise<Call> {
    const call = await this.findCallById(id, tenantId);
    call.status = CallStatus.MISSED;
    call.disposition = CallDisposition.NOT_ANSWERED;
    call.endTime = new Date();
    return this.callRepo.save(call);
  }

  // ============ Search & Query ============

  async searchCalls(tenantId: string, dto: CallSearchDto): Promise<{ calls: Call[]; total: number; page: number; limit: number }> {
    try {
      const page = dto.page || 1;
      const limit = dto.limit || 20;
      const skip = (page - 1) * limit;

      const query = this.callRepo
        .createQueryBuilder('call')
        .where('call.tenantId = :tenantId', { tenantId })
        .leftJoinAndSelect('call.customer', 'customer')
        .leftJoinAndSelect('call.lead', 'lead')
        .leftJoinAndSelect('call.agent', 'agent');

      // Filters
      if (dto.direction) {
        query.andWhere('call.direction = :direction', { direction: dto.direction });
      }

      if (dto.status) {
        query.andWhere('call.status = :status', { status: dto.status });
      }

      if (dto.phoneNumber) {
        query.andWhere('(call.fromNumber LIKE :phoneNumber OR call.toNumber LIKE :phoneNumber)', {
          phoneNumber: `%${dto.phoneNumber}%`,
        });
      }

      if (dto.customerId) {
        query.andWhere('call.customerId = :customerId', { customerId: dto.customerId });
      }

      if (dto.leadId) {
        query.andWhere('call.leadId = :leadId', { leadId: dto.leadId });
      }

      if (dto.agentId) {
        query.andWhere('call.agentId = :agentId', { agentId: dto.agentId });
      }

      if (dto.startDate) {
        query.andWhere('call.createdAt >= :startDate', { startDate: new Date(dto.startDate) });
      }

      if (dto.endDate) {
        query.andWhere('call.createdAt <= :endDate', { endDate: new Date(dto.endDate) });
      }

      // Pagination
      query.skip(skip).take(limit).orderBy('call.createdAt', 'DESC');

      const [calls, total] = await query.getManyAndCount();

      return {
        calls: calls || [],
        total: total || 0,
        page,
        limit,
      };
    } catch (error) {
      return {
        calls: [],
        total: 0,
        page: dto.page || 1,
        limit: dto.limit || 20,
      };
    }
  }

  async getRecentCalls(tenantId: string, limit: number = 10): Promise<Call[]> {
    try {
      const calls = await this.callRepo.find({
        where: { tenantId },
        relations: ['customer', 'lead', 'agent'],
        order: { createdAt: 'DESC' },
        take: limit,
      });
      return calls || [];
    } catch (error) {
      return [];
    }
  }

  async getMissedCalls(tenantId: string, agentId?: string): Promise<Call[]> {
    const where: any = {
      tenantId,
      status: In([CallStatus.MISSED, CallStatus.NO_ANSWER]),
    };

    if (agentId) {
      where.agentId = agentId;
    }

    return this.callRepo.find({
      where,
      relations: ['customer', 'lead'],
      order: { createdAt: 'DESC' },
    });
  }

  async getCallsByCustomer(customerId: string, tenantId: string): Promise<Call[]> {
    return this.callRepo.find({
      where: { customerId, tenantId },
      relations: ['agent', 'recordings'],
      order: { createdAt: 'DESC' },
    });
  }

  async getCallsByAgent(agentId: string, tenantId: string, startDate?: Date, endDate?: Date): Promise<Call[]> {
    const where: any = { agentId, tenantId };

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    return this.callRepo.find({
      where,
      relations: ['customer', 'lead'],
      order: { createdAt: 'DESC' },
    });
  }

  // ============ Statistics ============

  async getCallStatistics(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    total: number;
    inbound: number;
    outbound: number;
    answered: number;
    missed: number;
    averageDuration: number;
    averageTalkTime: number;
  }> {
    try {
      const query = this.callRepo
        .createQueryBuilder('call')
        .where('call.tenantId = :tenantId', { tenantId });

      if (startDate) {
        query.andWhere('call.createdAt >= :startDate', { startDate });
      }

      if (endDate) {
        query.andWhere('call.createdAt <= :endDate', { endDate });
      }

      const calls = await query.getMany();

      const total = calls.length;
      const inbound = calls.filter(c => c.direction === CallDirection.INBOUND).length;
      const outbound = calls.filter(c => c.direction === CallDirection.OUTBOUND).length;
      const answered = calls.filter(c => c.status === CallStatus.COMPLETED && c.answerTime).length;
      const missed = calls.filter(c => c.status === CallStatus.MISSED || c.status === CallStatus.NO_ANSWER).length;

      const totalDuration = calls.reduce((sum, c) => sum + (c.duration || 0), 0);
      const totalTalkTime = calls.reduce((sum, c) => sum + (c.talkDuration || 0), 0);

      return {
        total,
        inbound,
        outbound,
        answered,
        missed,
        averageDuration: total > 0 ? Math.floor(totalDuration / total) : 0,
        averageTalkTime: total > 0 ? Math.floor(totalTalkTime / total) : 0,
      };
    } catch (error) {
      return {
        total: 0,
        inbound: 0,
        outbound: 0,
        answered: 0,
        missed: 0,
        averageDuration: 0,
        averageTalkTime: 0,
      };
    }
  }

  // ============ Bulk Operations ============

  async bulkUpdateDisposition(
    callIds: string[],
    tenantId: string,
    disposition: CallDisposition,
  ): Promise<void> {
    await this.callRepo.update(
      { id: In(callIds), tenantId },
      { disposition },
    );
  }

  async bulkUpdateTags(callIds: string[], tenantId: string, tags: string[]): Promise<void> {
    const calls = await this.callRepo.find({
      where: { id: In(callIds), tenantId },
    });

    for (const call of calls) {
      call.tags = [...new Set([...(call.tags || []), ...tags])];
      await this.callRepo.save(call);
    }
  }
}
