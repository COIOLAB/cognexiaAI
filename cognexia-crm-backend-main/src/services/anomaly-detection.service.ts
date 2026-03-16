import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnomalyDetection } from '../entities/anomaly-detection.entity';

@Injectable()
export class AnomalyDetectionService {
  constructor(
    @InjectRepository(AnomalyDetection)
    private anomalyRepository: Repository<AnomalyDetection>,
  ) {}

  async getAnomalies(filters?: any): Promise<AnomalyDetection[]> {
    const query = this.anomalyRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.organization', 'org');
    
    if (filters?.status) {
      query.where('a.status = :status', { status: filters.status });
    }

    if (filters?.severity) {
      query.andWhere('a.severity = :severity', { severity: filters.severity });
    }

    if (filters?.anomaly_type) {
      query.andWhere('a.anomaly_type = :type', { type: filters.anomaly_type });
    }
    
    return await query
      .orderBy('a.detected_at', 'DESC')
      .limit(100)
      .getMany();
  }

  async detectAnomalies(): Promise<AnomalyDetection[]> {
    // Real anomaly detection logic would go here
    // For demo purposes, creating sample anomalies
    const detected = [];
    
    const sampleAnomaly = this.anomalyRepository.create({
      anomaly_type: 'usage_spike',
      severity: 'medium',
      title: 'Unusual API Usage Spike Detected',
      description: 'API calls increased by 300% in the last hour',
      metric_name: 'api_calls_per_hour',
      expected_value: 1000,
      actual_value: 4000,
      deviation_percentage: 300,
      detected_at: new Date(),
      context_data: {
        timeframe: 'last_hour',
        previous_avg: 1000,
      },
    });

    detected.push(await this.anomalyRepository.save(sampleAnomaly));
    return detected;
  }

  async resolveAnomaly(id: string, resolution: string, userId: string): Promise<AnomalyDetection> {
    await this.anomalyRepository.update(id, {
      status: 'resolved',
      resolution_action: resolution,
      resolved_at: new Date(),
      resolved_by: userId,
    });
    return await this.anomalyRepository.findOne({ where: { id } });
  }

  async getDashboard(): Promise<any> {
    const all = await this.anomalyRepository.find({
      order: { detected_at: 'DESC' },
      take: 100,
    });

    return {
      total: all.length,
      by_severity: {
        critical: all.filter(a => a.severity === 'critical').length,
        high: all.filter(a => a.severity === 'high').length,
        medium: all.filter(a => a.severity === 'medium').length,
        low: all.filter(a => a.severity === 'low').length,
      },
      unresolved: all.filter(a => a.status === 'detected' || a.status === 'investigating').length,
      recent: all.slice(0, 10),
    };
  }
}
