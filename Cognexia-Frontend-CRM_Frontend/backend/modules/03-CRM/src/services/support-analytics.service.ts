import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportAnalytics } from '../entities/support-analytics.entity';

@Injectable()
export class SupportAnalyticsService {
  constructor(
    @InjectRepository(SupportAnalytics)
    private analyticsRepository: Repository<SupportAnalytics>,
  ) {}

  async getDailySummary(date?: Date): Promise<SupportAnalytics[]> {
    const query = this.analyticsRepository.createQueryBuilder('sa');
    
    if (date) {
      query.where('sa.date = :date', { date });
    } else {
      const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      query.where('sa.date >= :date', { date: last30Days });
    }
    
    return await query.orderBy('sa.date', 'DESC').getMany();
  }

  async getOverview(): Promise<any> {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const data = await this.analyticsRepository
      .createQueryBuilder('sa')
      .where('sa.date >= :date', { date: last30Days })
      .getMany();

    return {
      total_tickets: data.reduce((sum, d) => sum + d.total_tickets, 0),
      avg_first_response: data.reduce((sum, d) => sum + (d.avg_first_response_time_minutes || 0), 0) / data.length || 0,
      avg_resolution_time: data.reduce((sum, d) => sum + (d.avg_resolution_time_minutes || 0), 0) / data.length || 0,
      avg_csat: data.reduce((sum, d) => sum + Number(d.csat_score || 0), 0) / data.length || 0,
      tickets_created: data.reduce((sum, d) => sum + d.tickets_created, 0),
      tickets_resolved: data.reduce((sum, d) => sum + d.tickets_resolved, 0),
    };
  }

  async getSentimentTrends(): Promise<any> {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const data = await this.analyticsRepository
      .createQueryBuilder('sa')
      .where('sa.date >= :date', { date: last30Days })
      .orderBy('sa.date', 'ASC')
      .getMany();

    return data.map(d => ({
      date: d.date,
      sentiment: d.sentiment_breakdown,
    }));
  }

  async getTeamPerformance(): Promise<any> {
    return {
      agents: [
        { name: 'Agent 1', tickets_resolved: 120, avg_resolution_time: 45, csat: 4.5 },
        { name: 'Agent 2', tickets_resolved: 100, avg_resolution_time: 52, csat: 4.3 },
        { name: 'Agent 3', tickets_resolved: 95, avg_resolution_time: 38, csat: 4.7 },
      ],
    };
  }
}
