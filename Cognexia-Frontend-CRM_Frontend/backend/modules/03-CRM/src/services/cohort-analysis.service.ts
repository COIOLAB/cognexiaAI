import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { Deal } from '../entities/deal.entity';
import { CohortAnalysisDto } from '../dto/report.dto';

export interface CohortData {
  cohortPeriod: string; // e.g., "2024-01", "2024-W01"
  cohortSize: number;
  periods: { [key: string]: number }; // Period index to value
}

@Injectable()
export class CohortAnalysisService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Deal)
    private dealRepository: Repository<Deal>,
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

  async analyzeCohort(tenantId: string, dto: CohortAnalysisDto): Promise<CohortData[]> {
    const cohorts = await this.identifyCohorts(tenantId, dto);
    const result: CohortData[] = [];

    for (const cohort of cohorts) {
      const cohortData: CohortData = {
        cohortPeriod: cohort.period,
        cohortSize: cohort.customers.length,
        periods: {},
      };

      // Calculate metric for each period after cohort creation
      const periodsToShow = dto.periodsToShow || 12;
      for (let i = 0; i <= periodsToShow; i++) {
        const periodValue = await this.calculateCohortMetric(
          tenantId,
          cohort.customers,
          cohort.startDate,
          i,
          dto.metric,
          dto.cohortPeriod,
        );
        cohortData.periods[`period_${i}`] = periodValue;
      }

      result.push(cohortData);
    }

    return result;
  }

  private async identifyCohorts(tenantId: string, dto: CohortAnalysisDto) {
    const customerQuery = this.customerRepository
      .createQueryBuilder('customer')
      .andWhere('customer.createdAt BETWEEN :startDate AND :endDate', {
        startDate: dto.startDate,
        endDate: dto.endDate,
      })
      .orderBy('customer.createdAt', 'ASC');
    const customerTenantColumn = this.getTenantColumn(this.customerRepository);
    if (customerTenantColumn) {
      customerQuery.andWhere(`customer.${customerTenantColumn} = :tenantId`, { tenantId });
    }
    const customers = await customerQuery.getMany();

    // Group customers by cohort period
    const cohortMap = new Map<string, { period: string; startDate: Date; customers: Customer[] }>();

    for (const customer of customers) {
      const period = this.getPeriodKey(customer.createdAt, dto.cohortPeriod);
      if (!cohortMap.has(period)) {
        cohortMap.set(period, {
          period,
          startDate: this.getPeriodStartDate(customer.createdAt, dto.cohortPeriod),
          customers: [],
        });
      }
      cohortMap.get(period).customers.push(customer);
    }

    return Array.from(cohortMap.values());
  }

  private async calculateCohortMetric(
    tenantId: string,
    customers: Customer[],
    cohortStartDate: Date,
    periodOffset: number,
    metric: string,
    cohortPeriod: 'week' | 'month' | 'quarter',
  ): Promise<number> {
    const customerIds = customers.map((c) => c.id);
    if (customerIds.length === 0) return 0;

    // Calculate period boundaries
    const periodStart = this.addPeriods(cohortStartDate, periodOffset, cohortPeriod);
    const periodEnd = this.addPeriods(cohortStartDate, periodOffset + 1, cohortPeriod);

    switch (metric) {
      case 'retention':
        return this.calculateRetention(tenantId, customerIds, periodStart, periodEnd);

      case 'revenue':
        return this.calculateRevenue(tenantId, customerIds, periodStart, periodEnd);

      case 'orders':
        return this.calculateOrders(tenantId, customerIds, periodStart, periodEnd);

      case 'activeUsers':
        return this.calculateActiveUsers(tenantId, customerIds, periodStart, periodEnd);

      default:
        return 0;
    }
  }

  private async calculateRetention(
    tenantId: string,
    customerIds: string[],
    periodStart: Date,
    periodEnd: Date,
  ): Promise<number> {
    // Count customers who made at least one purchase in this period
    const activeCountQuery = this.dealRepository
      .createQueryBuilder('deal')
      .andWhere('deal.customerId IN (:...customerIds)', { customerIds })
      .andWhere('deal.createdAt BETWEEN :periodStart AND :periodEnd', {
        periodStart,
        periodEnd,
      })
      .select('COUNT(DISTINCT deal.customerId)', 'count');
    const dealTenantColumn = this.getTenantColumn(this.dealRepository);
    if (dealTenantColumn) {
      activeCountQuery.andWhere(`deal.${dealTenantColumn} = :tenantId`, { tenantId });
    }
    const activeCount = await activeCountQuery.getRawOne();

    const retainedCustomers = parseInt(activeCount?.count || '0');
    return customerIds.length > 0 ? (retainedCustomers / customerIds.length) * 100 : 0;
  }

  private async calculateRevenue(
    tenantId: string,
    customerIds: string[],
    periodStart: Date,
    periodEnd: Date,
  ): Promise<number> {
    const revenueQuery = this.dealRepository
      .createQueryBuilder('deal')
      .andWhere('deal.customerId IN (:...customerIds)', { customerIds })
      .andWhere('deal.createdAt BETWEEN :periodStart AND :periodEnd', {
        periodStart,
        periodEnd,
      })
      .andWhere('deal.stage = :stage', { stage: 'won' })
      .select('SUM(deal.value)', 'total');
    const dealTenantColumn = this.getTenantColumn(this.dealRepository);
    if (dealTenantColumn) {
      revenueQuery.andWhere(`deal.${dealTenantColumn} = :tenantId`, { tenantId });
    }
    const result = await revenueQuery.getRawOne();

    return parseFloat(result?.total || '0');
  }

  private async calculateOrders(
    tenantId: string,
    customerIds: string[],
    periodStart: Date,
    periodEnd: Date,
  ): Promise<number> {
    const orderQuery = this.dealRepository
      .createQueryBuilder('deal')
      .andWhere('deal.customerId IN (:...customerIds)', { customerIds })
      .andWhere('deal.createdAt BETWEEN :periodStart AND :periodEnd', {
        periodStart,
        periodEnd,
      })
      .andWhere('deal.stage = :stage', { stage: 'won' });
    const dealTenantColumn = this.getTenantColumn(this.dealRepository);
    if (dealTenantColumn) {
      orderQuery.andWhere(`deal.${dealTenantColumn} = :tenantId`, { tenantId });
    }
    const result = await orderQuery.getCount();

    return result;
  }

  private async calculateActiveUsers(
    tenantId: string,
    customerIds: string[],
    periodStart: Date,
    periodEnd: Date,
  ): Promise<number> {
    const activeUserQuery = this.customerRepository
      .createQueryBuilder('customer')
      .andWhere('customer.id IN (:...customerIds)', { customerIds })
      .andWhere('customer.lastActivityAt BETWEEN :periodStart AND :periodEnd', {
        periodStart,
        periodEnd,
      });
    const customerTenantColumn = this.getTenantColumn(this.customerRepository);
    if (customerTenantColumn) {
      activeUserQuery.andWhere(`customer.${customerTenantColumn} = :tenantId`, { tenantId });
    }
    const result = await activeUserQuery.getCount();

    return result;
  }

  private getPeriodKey(date: Date, period: 'week' | 'month' | 'quarter'): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    switch (period) {
      case 'week':
        const weekNumber = this.getWeekNumber(date);
        return `${year}-W${weekNumber.toString().padStart(2, '0')}`;

      case 'month':
        return `${year}-${month.toString().padStart(2, '0')}`;

      case 'quarter':
        const quarter = Math.floor((month - 1) / 3) + 1;
        return `${year}-Q${quarter}`;

      default:
        return `${year}-${month}`;
    }
  }

  private getPeriodStartDate(date: Date, period: 'week' | 'month' | 'quarter'): Date {
    const result = new Date(date);

    switch (period) {
      case 'week':
        const day = result.getDay();
        const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Monday
        return new Date(result.setDate(diff));

      case 'month':
        return new Date(result.getFullYear(), result.getMonth(), 1);

      case 'quarter':
        const quarter = Math.floor(result.getMonth() / 3);
        return new Date(result.getFullYear(), quarter * 3, 1);

      default:
        return result;
    }
  }

  private addPeriods(
    date: Date,
    count: number,
    period: 'week' | 'month' | 'quarter',
  ): Date {
    const result = new Date(date);

    switch (period) {
      case 'week':
        result.setDate(result.getDate() + count * 7);
        break;

      case 'month':
        result.setMonth(result.getMonth() + count);
        break;

      case 'quarter':
        result.setMonth(result.getMonth() + count * 3);
        break;
    }

    return result;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}
