import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChurnPrediction } from '../entities/churn-prediction.entity';
import { RevenueForecast } from '../entities/revenue-forecast.entity';
import { CreateChurnPredictionDto, CreateRevenueForecastDto, ChurnPredictionQueryDto } from '../dto/ai-predictive.dto';

@Injectable()
export class PredictiveAnalyticsService {
  constructor(
    @InjectRepository(ChurnPrediction)
    private churnRepository: Repository<ChurnPrediction>,
    @InjectRepository(RevenueForecast)
    private forecastRepository: Repository<RevenueForecast>,
  ) {}

  async getChurnPredictions(filters?: ChurnPredictionQueryDto): Promise<ChurnPrediction[]> {
    const query = this.churnRepository
      .createQueryBuilder('cp')
      .leftJoinAndSelect('cp.organization', 'org');
    
    if (filters?.organization_id) {
      query.andWhere('cp.organization_id = :orgId', { orgId: filters.organization_id });
    }
    
    if (filters?.risk_level) {
      query.andWhere('cp.churn_risk_level = :level', { level: filters.risk_level });
    }

    if (filters?.min_probability) {
      query.andWhere('cp.churn_probability >= :min', { min: filters.min_probability });
    }
    
    return await query.orderBy('cp.prediction_date', 'DESC').limit(100).getMany();
  }

  async predictChurn(organizationId: string): Promise<ChurnPrediction> {
    // AI prediction logic would go here
    // For now, creating a sample prediction
    const prediction = this.churnRepository.create({
      organization_id: organizationId,
      prediction_date: new Date(),
      churn_probability: Math.random() * 100,
      churn_risk_level: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      model_version: 'v1.0.0',
      confidence_score: 75 + Math.random() * 20,
      risk_factors: [
        { factor: 'Declining usage', impact: 0.4, description: 'Usage down 30% this month' },
        { factor: 'Reduced engagement', impact: 0.35, description: 'Last active 15 days ago' },
      ],
      retention_recommendations: [
        'Schedule proactive check-in call',
        'Offer personalized training session',
        'Review feature adoption gaps',
      ],
    });
    
    return await this.churnRepository.save(prediction) as any;
  }

  async getRevenueForecast(type: string, months: number = 6): Promise<RevenueForecast[]> {
    return await this.forecastRepository
      .createQueryBuilder('rf')
      .where('rf.forecast_type = :type', { type })
      .andWhere('rf.forecast_date >= CURRENT_DATE')
      .orderBy('rf.forecast_date', 'ASC')
      .limit(months)
      .getMany();
  }

  async createForecast(dto: CreateRevenueForecastDto): Promise<RevenueForecast> {
    const forecast = this.forecastRepository.create({
      ...dto,
      model_version: 'v1.0.0',
    } as any);
    return await this.forecastRepository.save(forecast) as any;
  }

  async getChurnSummary(): Promise<any> {
    const predictions = await this.churnRepository.find({
      order: { prediction_date: 'DESC' },
      take: 100,
    });

    const highRisk = predictions.filter(p => p.churn_risk_level === 'high' || p.churn_risk_level === 'critical').length;
    const mediumRisk = predictions.filter(p => p.churn_risk_level === 'medium').length;
    const lowRisk = predictions.filter(p => p.churn_risk_level === 'low').length;

    return {
      total: predictions.length,
      high_risk: highRisk,
      medium_risk: mediumRisk,
      low_risk: lowRisk,
      avg_probability: predictions.reduce((sum, p) => sum + Number(p.churn_probability), 0) / predictions.length || 0,
    };
  }
}
