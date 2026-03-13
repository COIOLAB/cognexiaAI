import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialCohort } from '../entities/financial-cohort.entity';

@Injectable()
export class AdvancedFinancialService {
  constructor(
    @InjectRepository(FinancialCohort)
    private cohortRepository: Repository<FinancialCohort>,
  ) {}

  async getCohortAnalysis(type?: string): Promise<FinancialCohort[]> {
    const query = this.cohortRepository.createQueryBuilder('fc');
    
    if (type) {
      query.where('fc.cohort_type = :type', { type });
    }
    
    return await query.orderBy('fc.cohort_month', 'DESC').getMany();
  }

  async calculateCohortMetrics(cohortMonth: Date, cohortType: string): Promise<FinancialCohort> {
    // In production, this would analyze actual customer data
    const cohort = this.cohortRepository.create({
      cohort_month: cohortMonth,
      cohort_type: cohortType as any,
      cohort_name: `${cohortType}-${cohortMonth.toISOString().slice(0, 7)}`,
      initial_customers: 100,
      current_customers: 85,
      initial_mrr: 50000,
      current_mrr: 68000,
      expansion_revenue: 20000,
      contraction_revenue: 2000,
      churned_revenue: 0,
      retention_rate: 85,
      ltv: 25000,
      cac: 5000,
    });

    return await this.cohortRepository.save(cohort);
  }

  async getRevenueWaterfall(period: string): Promise<any> {
    return {
      period,
      starting_mrr: 100000,
      new_business: 15000,
      expansion: 8000,
      contraction: -3000,
      churn: -5000,
      ending_mrr: 115000,
      net_new_mrr: 15000,
      growth_rate: 15,
    };
  }

  async getUnitEconomics(): Promise<any> {
    return {
      ltv: 25000,
      cac: 5000,
      ltv_cac_ratio: 5.0,
      payback_period_months: 12,
      gross_margin: 75,
      net_revenue_retention: 110,
    };
  }

  async getLTVBySegment(): Promise<any[]> {
    return [
      { segment: 'Enterprise', ltv: 50000, cac: 10000, ratio: 5.0 },
      { segment: 'Mid-Market', ltv: 25000, cac: 5000, ratio: 5.0 },
      { segment: 'SMB', ltv: 10000, cac: 2000, ratio: 5.0 },
    ];
  }
}
