import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal } from '../entities/deal.entity';
import { AnalyticsSnapshot } from '../entities/analytics-snapshot.entity';
import { RevenueForecastDto } from '../dto/report.dto';

export interface ForecastPeriod {
  period: string; // e.g., "2024-02"
  predicted: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

@Injectable()
export class RevenueForecastingService {
  constructor(
    @InjectRepository(Deal)
    private dealRepository: Repository<Deal>,
    @InjectRepository(AnalyticsSnapshot)
    private snapshotRepository: Repository<AnalyticsSnapshot>,
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

  async forecastRevenue(tenantId: string, dto: RevenueForecastDto): Promise<ForecastPeriod[]> {
    const months = dto.months || 6;
    const includeSeasonal = dto.includeSeasonal !== false;
    const confidenceInterval = dto.confidenceInterval || 0.95;

    // Get historical revenue data (last 12 months minimum)
    const historicalData = await this.getHistoricalRevenue(tenantId, 12);

    if (historicalData.length < 3) {
      return [];
    }

    // Calculate trend using linear regression
    const trend = this.calculateTrend(historicalData);

    // Calculate seasonal factors if requested
    const seasonalFactors = includeSeasonal
      ? this.calculateSeasonalFactors(historicalData)
      : null;

    // Generate forecasts
    const forecasts: ForecastPeriod[] = [];
    const lastDate = new Date(historicalData[historicalData.length - 1].period);

    for (let i = 1; i <= months; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setMonth(forecastDate.getMonth() + i);
      const period = this.formatPeriod(forecastDate);

      // Base prediction from trend
      const basePrediction = trend.slope * (historicalData.length + i) + trend.intercept;

      // Apply seasonal adjustment
      let predicted = basePrediction;
      if (seasonalFactors) {
        const monthIndex = forecastDate.getMonth();
        predicted *= seasonalFactors[monthIndex];
      }

      // Calculate confidence bounds
      const standardError = this.calculateStandardError(historicalData, trend);
      const zScore = this.getZScore(confidenceInterval);
      const margin = zScore * standardError * Math.sqrt(1 + 1 / historicalData.length);

      forecasts.push({
        period,
        predicted: Math.max(0, Math.round(predicted * 100) / 100),
        lowerBound: Math.max(0, Math.round((predicted - margin) * 100) / 100),
        upperBound: Math.round((predicted + margin) * 100) / 100,
        confidence: confidenceInterval * 100,
      });
    }

    return forecasts;
  }

  private async getHistoricalRevenue(
    tenantId: string,
    months: number,
  ): Promise<{ period: string; revenue: number }[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Try to get from analytics snapshots first
    const snapshots = await this.snapshotRepository
      .createQueryBuilder('snapshot')
      .where('snapshot.tenantId = :tenantId', { tenantId })
      .andWhere('snapshot.snapshotType = :type', { type: 'monthly' })
      .andWhere('snapshot.snapshotDate >= :startDate', { startDate })
      .orderBy('snapshot.snapshotDate', 'ASC')
      .getMany();

    if (snapshots.length >= 3) {
      return snapshots.map((s) => ({
        period: this.formatPeriod(s.snapshotDate),
        revenue: s.metrics.totalRevenue || 0,
      }));
    }

    // Fallback: calculate from deals
    const dealsQuery = this.dealRepository
      .createQueryBuilder('deal')
      .andWhere('deal.stage = :stage', { stage: 'won' })
      .andWhere('deal.actualCloseDate >= :startDate', { startDate })
      .andWhere('deal.actualCloseDate <= :endDate', { endDate })
      .orderBy('deal.actualCloseDate', 'ASC');

    const tenantColumn = this.getTenantColumn(this.dealRepository);
    if (tenantColumn) {
      dealsQuery.andWhere(`deal.${tenantColumn} = :tenantId`, { tenantId });
    }

    const deals = await dealsQuery.getMany();

    // Group by month
    const revenueByMonth = new Map<string, number>();
    for (const deal of deals) {
      const period = this.formatPeriod((deal as any).actualCloseDate || deal.createdAt);
      const current = revenueByMonth.get(period) || 0;
      revenueByMonth.set(period, current + deal.value);
    }

    return Array.from(revenueByMonth.entries())
      .map(([period, revenue]) => ({ period, revenue }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  private calculateTrend(data: { period: string; revenue: number }[]): {
    slope: number;
    intercept: number;
  } {
    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    data.forEach((point, index) => {
      const x = index + 1;
      const y = point.revenue;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  private calculateSeasonalFactors(data: { period: string; revenue: number }[]): number[] {
    // Calculate average revenue for each month
    const monthlyRevenue = new Array(12).fill(0);
    const monthlyCounts = new Array(12).fill(0);

    data.forEach((point) => {
      const date = new Date(point.period);
      const month = date.getMonth();
      monthlyRevenue[month] += point.revenue;
      monthlyCounts[month]++;
    });

    // Calculate average per month
    const monthlyAverages = monthlyRevenue.map((total, i) =>
      monthlyCounts[i] > 0 ? total / monthlyCounts[i] : 0,
    );

    // Calculate overall average
    const overallAverage = monthlyAverages.reduce((a, b) => a + b, 0) / 12;

    // Calculate seasonal factors (ratio to average)
    return monthlyAverages.map((avg) =>
      overallAverage > 0 ? avg / overallAverage : 1,
    );
  }

  private calculateStandardError(
    data: { period: string; revenue: number }[],
    trend: { slope: number; intercept: number },
  ): number {
    const n = data.length;
    let sumSquaredErrors = 0;

    data.forEach((point, index) => {
      const predicted = trend.slope * (index + 1) + trend.intercept;
      const error = point.revenue - predicted;
      sumSquaredErrors += error * error;
    });

    return Math.sqrt(sumSquaredErrors / (n - 2));
  }

  private getZScore(confidenceLevel: number): number {
    // Common z-scores for confidence intervals
    const zScores = {
      0.90: 1.645,
      0.95: 1.96,
      0.99: 2.576,
    };

    return zScores[confidenceLevel] || 1.96;
  }

  private formatPeriod(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  async getPipelineForecast(tenantId: string): Promise<any> {
    // Forecast based on current pipeline
    const dealsQuery = this.dealRepository
      .createQueryBuilder('deal')
      .andWhere('deal.stage NOT IN (:...stages)', { stages: ['won', 'lost'] });

    const pipelineTenantColumn = this.getTenantColumn(this.dealRepository);
    if (pipelineTenantColumn) {
      dealsQuery.andWhere(`deal.${pipelineTenantColumn} = :tenantId`, { tenantId });
    }

    const deals = await dealsQuery.getMany();

    let weightedValue = 0;
    const dealsByStage = new Map<string, { count: number; value: number }>();

    for (const deal of deals) {
      // Apply probability weight (could be from stage.probability)
      const probability = this.getDefaultProbability(deal.stage);
      weightedValue += deal.value * probability;

      const current = dealsByStage.get(deal.stage) || { count: 0, value: 0 };
      dealsByStage.set(deal.stage, {
        count: current.count + 1,
        value: current.value + deal.value,
      });
    }

    return {
      totalPipelineValue: deals.reduce((sum, d) => sum + d.value, 0),
      weightedForecast: Math.round(weightedValue * 100) / 100,
      dealCount: deals.length,
      byStage: Array.from(dealsByStage.entries()).map(([stage, data]) => ({
        stage,
        ...data,
      })),
    };
  }

  private getDefaultProbability(stage: string): number {
    // Default probabilities by stage
    const probabilities = {
      prospect: 0.1,
      qualified: 0.25,
      proposal: 0.5,
      negotiation: 0.75,
      won: 1.0,
      lost: 0.0,
    };

    return probabilities[stage.toLowerCase()] || 0.3;
  }
}
