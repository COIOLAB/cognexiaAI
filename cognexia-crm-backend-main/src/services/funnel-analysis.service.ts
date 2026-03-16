import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Deal } from '../entities/deal.entity';
import { PipelineStage } from '../entities/pipeline-stage.entity';
import { FunnelAnalysisDto } from '../dto/report.dto';

export interface FunnelStageData {
  stageId: string;
  stageName: string;
  count: number;
  value: number;
  conversionRate: number; // Percentage from previous stage
  dropOffRate: number; // Percentage lost from previous stage
  averageTimeInStage: number; // Days
}

@Injectable()
export class FunnelAnalysisService {
  constructor(
    @InjectRepository(Deal)
    private dealRepository: Repository<Deal>,
    @InjectRepository(PipelineStage)
    private stageRepository: Repository<PipelineStage>,
  ) {}

  private getTenantColumn(repo: Repository<any>): 'tenantId' | 'organizationId' | null {
    const columns = repo.metadata.columns.map((column) => column.propertyName);
    if (columns.includes('tenantId')) {
      return 'tenantId';
    }
    if (columns.includes('organizationId')) {
      return 'organizationId';
    }
    return null;
  }

  async analyzeFunnel(tenantId: string, dto: FunnelAnalysisDto): Promise<FunnelStageData[]> {
    const stages = await this.stageRepository.find({
      where: {},
      order: { order: 'ASC' },
    });

    // Filter by requested stages if provided
    const requestedStages = dto.stages?.length
      ? stages.filter((s) => dto.stages.includes(s.id))
      : stages;

    const result: FunnelStageData[] = [];
    let previousCount = 0;

    for (let i = 0; i < requestedStages.length; i++) {
      const stage = requestedStages[i];

      // Build query
      const queryBuilder = this.dealRepository
        .createQueryBuilder('deal')
        .where('deal.tenantId = :tenantId', { tenantId })
        .andWhere('deal.stage = :stageName', { stageName: stage.name });

      // Apply date filters
      if (dto.startDate && dto.endDate) {
        queryBuilder.andWhere('deal.createdAt BETWEEN :startDate AND :endDate', {
          startDate: dto.startDate,
          endDate: dto.endDate,
        });
      }

      // Get count and sum
      const count = await queryBuilder.getCount();
      const sumResult = await queryBuilder
        .select('SUM(deal.value)', 'total')
        .getRawOne();
      const value = parseFloat(sumResult?.total || '0');

      // Calculate average time in stage
      const avgTimeResult = await queryBuilder
        .select('AVG(EXTRACT(EPOCH FROM (deal.updatedAt - deal.createdAt)) / 86400)', 'avgDays')
        .getRawOne();
      const averageTimeInStage = parseFloat(avgTimeResult?.avgDays || '0');

      // Calculate conversion and drop-off rates
      let conversionRate = 100;
      let dropOffRate = 0;

      if (i > 0) {
        conversionRate = previousCount > 0 ? (count / previousCount) * 100 : 0;
        dropOffRate = 100 - conversionRate;
      }

      result.push({
        stageId: stage.id,
        stageName: stage.name,
        count,
        value,
        conversionRate: Math.round(conversionRate * 100) / 100,
        dropOffRate: Math.round(dropOffRate * 100) / 100,
        averageTimeInStage: Math.round(averageTimeInStage * 100) / 100,
      });

      previousCount = count;
    }

    return result;
  }

  async getConversionMetrics(tenantId: string, startDate?: string, endDate?: string) {
    const queryBuilder = this.dealRepository.createQueryBuilder('deal');
    const tenantColumn = this.getTenantColumn(this.dealRepository);
    if (tenantColumn) {
      queryBuilder.where(`deal.${tenantColumn} = :tenantId`, { tenantId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('deal.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const totalDeals = await queryBuilder.getCount();
    const wonDeals = await queryBuilder.andWhere('deal.stage = :stage', { stage: 'won' }).getCount();
    const lostDeals = await queryBuilder
      .andWhere('deal.stage = :stage', { stage: 'lost' })
      .getCount();

    const avgDealValueQuery = this.dealRepository
      .createQueryBuilder('deal')
      .andWhere('deal.stage = :stage', { stage: 'won' })
      .select('AVG(deal.value)', 'avg');
    if (tenantColumn) {
      avgDealValueQuery.where(`deal.${tenantColumn} = :tenantId`, { tenantId });
    }
    const avgDealValueResult = await avgDealValueQuery.getRawOne();

    const avgSalesCycleQuery = this.dealRepository
      .createQueryBuilder('deal')
      .andWhere('deal.stage = :stage', { stage: 'won' })
      .select('AVG(EXTRACT(EPOCH FROM (deal.actualCloseDate - deal.createdAt)) / 86400)', 'avgDays');
    if (tenantColumn) {
      avgSalesCycleQuery.where(`deal.${tenantColumn} = :tenantId`, { tenantId });
    }
    const avgSalesCycleResult = await avgSalesCycleQuery.getRawOne();

    return {
      totalDeals,
      wonDeals,
      lostDeals,
      winRate: totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0,
      lossRate: totalDeals > 0 ? (lostDeals / totalDeals) * 100 : 0,
      averageDealValue: parseFloat(avgDealValueResult?.avg || '0'),
      averageSalesCycle: parseFloat(avgSalesCycleResult?.avgDays || '0'),
    };
  }

  async getBottlenecks(tenantId: string): Promise<any[]> {
    const tenantColumn = this.getTenantColumn(this.dealRepository);
    // Find stages with high drop-off rates or long durations
    const stages = await this.stageRepository.find({
      where: {},
      order: { order: 'ASC' },
    });

    const bottlenecks = [];

    for (const stage of stages) {
      const avgTimeQuery = this.dealRepository
        .createQueryBuilder('deal')
        .andWhere('deal.stage = :stageName', { stageName: stage.name })
        .select('AVG(EXTRACT(EPOCH FROM (deal.updatedAt - deal.createdAt)) / 86400)', 'avgDays');
      if (tenantColumn) {
        avgTimeQuery.where(`deal.${tenantColumn} = :tenantId`, { tenantId });
      }
      const avgTimeResult = await avgTimeQuery.getRawOne();

      const avgDays = parseFloat(avgTimeResult?.avgDays || '0');

      // Consider bottleneck if average time > 7 days
      if (avgDays > 7) {
        const count = await this.dealRepository.count({
          where: { stage: stage.name as any },
        });

        bottlenecks.push({
          stageId: stage.id,
          stageName: stage.name,
          averageTimeInStage: Math.round(avgDays * 100) / 100,
          currentDealsCount: count,
          severity: avgDays > 14 ? 'high' : avgDays > 7 ? 'medium' : 'low',
        });
      }
    }

    return bottlenecks.sort((a, b) => b.averageTimeInStage - a.averageTimeInStage);
  }
}
