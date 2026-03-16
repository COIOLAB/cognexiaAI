import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Call, CallDirection, CallStatus } from '../entities/call.entity';
import { CallAnalyticsQuery, CallAnalyticsResponse } from '../dto/telephony.dto';

@Injectable()
export class CallAnalyticsService {
  constructor(
    @InjectRepository(Call)
    private readonly callRepo: Repository<Call>,
  ) {}

  async getAnalytics(tenantId: string, query: CallAnalyticsQuery): Promise<CallAnalyticsResponse> {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    const queryBuilder = this.callRepo
      .createQueryBuilder('call')
      .where('call.tenantId = :tenantId', { tenantId })
      .andWhere('call.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });

    if (query.agentId) {
      queryBuilder.andWhere('call.agentId = :agentId', { agentId: query.agentId });
    }

    if (query.queueId) {
      queryBuilder.andWhere('call.queueId = :queueId', { queueId: query.queueId });
    }

    const calls = await queryBuilder.getMany();

    // Basic metrics
    const totalCalls = calls.length;
    const inboundCalls = calls.filter(c => c.direction === CallDirection.INBOUND).length;
    const outboundCalls = calls.filter(c => c.direction === CallDirection.OUTBOUND).length;
    const answeredCalls = calls.filter(c => c.status === CallStatus.COMPLETED && c.answerTime).length;
    const missedCalls = calls.filter(c => c.status === CallStatus.MISSED || c.status === CallStatus.NO_ANSWER).length;

    // Duration metrics
    const totalDuration = calls.reduce((sum, c) => sum + (c.duration || 0), 0);
    const totalTalkTime = calls.reduce((sum, c) => sum + (c.talkDuration || 0), 0);
    const totalWaitTime = calls.reduce((sum, c) => sum + c.waitTime, 0);

    const averageDuration = totalCalls > 0 ? Math.floor(totalDuration / totalCalls) : 0;
    const averageTalkTime = totalCalls > 0 ? Math.floor(totalTalkTime / totalCalls) : 0;
    const averageWaitTime = totalCalls > 0 ? Math.floor(totalWaitTime / totalCalls) : 0;

    // Group by logic
    let callsByDay: Record<string, number> | undefined;
    let callsByAgent: Record<string, number> | undefined;
    let callsByQueue: Record<string, number> | undefined;

    if (query.groupBy === 'day') {
      callsByDay = this.groupCallsByDay(calls);
    } else if (query.groupBy === 'agent') {
      callsByAgent = this.groupCallsByAgent(calls);
    } else if (query.groupBy === 'queue') {
      callsByQueue = this.groupCallsByQueue(calls);
    }

    // Quality metrics
    const callsWithQuality = calls.filter(c => c.audioQuality !== null && c.audioQuality !== undefined);
    const averageAudioQuality = callsWithQuality.length > 0
      ? callsWithQuality.reduce((sum, c) => sum + (c.audioQuality || 0), 0) / callsWithQuality.length
      : 0;

    const callsWithGoodQuality = calls.filter(c => (c.audioQuality || 0) >= 3.5).length;
    const callsWithPoorQuality = calls.filter(c => (c.audioQuality || 0) < 2.5).length;

    // Disposition breakdown
    const dispositionBreakdown: Record<string, number> = {};
    calls.forEach(call => {
      if (call.disposition) {
        dispositionBreakdown[call.disposition] = (dispositionBreakdown[call.disposition] || 0) + 1;
      }
    });

    return {
      totalCalls,
      inboundCalls,
      outboundCalls,
      answeredCalls,
      missedCalls,
      averageDuration,
      averageTalkTime,
      averageWaitTime,
      totalDuration,
      callsByDay,
      callsByAgent,
      callsByQueue,
      qualityMetrics: {
        averageAudioQuality,
        callsWithGoodQuality,
        callsWithPoorQuality,
      },
      dispositionBreakdown,
    };
  }

  private groupCallsByDay(calls: Call[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    calls.forEach(call => {
      const day = call.createdAt.toISOString().split('T')[0];
      grouped[day] = (grouped[day] || 0) + 1;
    });
    return grouped;
  }

  private groupCallsByAgent(calls: Call[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    calls.forEach(call => {
      if (call.agentId) {
        grouped[call.agentId] = (grouped[call.agentId] || 0) + 1;
      }
    });
    return grouped;
  }

  private groupCallsByQueue(calls: Call[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    calls.forEach(call => {
      if (call.queueId) {
        grouped[call.queueId] = (grouped[call.queueId] || 0) + 1;
      }
    });
    return grouped;
  }

  async getAgentPerformance(tenantId: string, agentId: string, startDate?: Date, endDate?: Date): Promise<{
    totalCalls: number;
    averageCallDuration: number;
    averageHandleTime: number;
    answeredCalls: number;
    missedCalls: number;
    answerRate: number;
  }> {
    const query = this.callRepo
      .createQueryBuilder('call')
      .where('call.tenantId = :tenantId', { tenantId })
      .andWhere('call.agentId = :agentId', { agentId });

    if (startDate) {
      query.andWhere('call.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('call.createdAt <= :endDate', { endDate });
    }

    const calls = await query.getMany();

    const totalCalls = calls.length;
    const answeredCalls = calls.filter(c => c.status === CallStatus.COMPLETED && c.answerTime).length;
    const missedCalls = calls.filter(c => c.status === CallStatus.MISSED || c.status === CallStatus.NO_ANSWER).length;

    const totalDuration = calls.reduce((sum, c) => sum + (c.duration || 0), 0);
    const totalHandleTime = calls.reduce((sum, c) => sum + (c.talkDuration || 0) + (c.holdDuration || 0), 0);

    return {
      totalCalls,
      averageCallDuration: totalCalls > 0 ? Math.floor(totalDuration / totalCalls) : 0,
      averageHandleTime: totalCalls > 0 ? Math.floor(totalHandleTime / totalCalls) : 0,
      answeredCalls,
      missedCalls,
      answerRate: totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0,
    };
  }

  async getCallTrends(tenantId: string, days: number = 30): Promise<{
    trends: Array<{
      date: string;
      totalCalls: number;
      answeredCalls: number;
      averageDuration: number;
    }>;
  }> {
    const parsedDays = Number(days);
    const safeDays = Number.isFinite(parsedDays) && parsedDays > 0 ? parsedDays : 30;
    const startDate = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    const calls = await this.callRepo.find({
      where: {
        tenantId,
        createdAt: Between(startDate, endDate),
      },
    });

    const grouped = new Map<string, Call[]>();
    calls.forEach(call => {
      const day = call.createdAt.toISOString().split('T')[0];
      if (!grouped.has(day)) {
        grouped.set(day, []);
      }
      grouped.get(day)!.push(call);
    });

    const trends = Array.from(grouped.entries()).map(([date, dayCalls]) => ({
      date,
      totalCalls: dayCalls.length,
      answeredCalls: dayCalls.filter(c => c.status === CallStatus.COMPLETED && c.answerTime).length,
      averageDuration: dayCalls.length > 0
        ? Math.floor(dayCalls.reduce((sum, c) => sum + (c.duration || 0), 0) / dayCalls.length)
        : 0,
    }));

    return { trends };
  }
}
