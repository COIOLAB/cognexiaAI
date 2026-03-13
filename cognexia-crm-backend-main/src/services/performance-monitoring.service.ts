import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformanceMetric } from '../entities/performance-metric.entity';

@Injectable()
export class PerformanceMonitoringService {
  constructor(
    @InjectRepository(PerformanceMetric)
    private metricRepository: Repository<PerformanceMetric>,
  ) {}

  async recordMetric(
    name: string,
    value: number,
    type: string,
    tags?: Record<string, string>,
  ): Promise<PerformanceMetric> {
    const metric = this.metricRepository.create({
      metric_name: name,
      metric_type: type as any,
      metric_value: value,
      additional_tags: tags,
      recorded_at: new Date(),
    });
    return await this.metricRepository.save(metric);
  }

  async getDashboardMetrics(): Promise<any> {
    const last5min = new Date(Date.now() - 5 * 60 * 1000);
    
    const recentMetrics = await this.metricRepository
      .createQueryBuilder('pm')
      .where('pm.recorded_at >= :time', { time: last5min })
      .getMany();

    const apiMetrics = recentMetrics.filter(m => m.metric_type === 'api_response_time');
    const cpuMetrics = recentMetrics.filter(m => m.metric_type === 'cpu_usage');
    const memoryMetrics = recentMetrics.filter(m => m.metric_type === 'memory_usage');

    return {
      current_timestamp: new Date(),
      api_response_time: {
        avg: this.calculateAvg(apiMetrics.map(m => Number(m.metric_value))),
        p95: this.calculatePercentile(apiMetrics.map(m => Number(m.metric_value)), 95),
        p99: this.calculatePercentile(apiMetrics.map(m => Number(m.metric_value)), 99),
      },
      cpu_usage: {
        current: cpuMetrics[cpuMetrics.length - 1]?.metric_value || 0,
        avg: this.calculateAvg(cpuMetrics.map(m => Number(m.metric_value))),
      },
      memory_usage: {
        current: memoryMetrics[memoryMetrics.length - 1]?.metric_value || 0,
        avg: this.calculateAvg(memoryMetrics.map(m => Number(m.metric_value))),
      },
      total_requests: apiMetrics.length,
    };
  }

  async getEndpointPerformance(): Promise<any[]> {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const metrics = await this.metricRepository
      .createQueryBuilder('pm')
      .where('pm.metric_type = :type', { type: 'api_response_time' })
      .andWhere('pm.recorded_at >= :time', { time: last24h })
      .getMany();

    const byEndpoint = metrics.reduce((acc, metric) => {
      const endpoint = metric.endpoint || 'unknown';
      if (!acc[endpoint]) {
        acc[endpoint] = [];
      }
      acc[endpoint].push(Number(metric.metric_value));
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(byEndpoint).map(([endpoint, values]) => ({
      endpoint,
      calls: values.length,
      avg_response_time: this.calculateAvg(values),
      p95: this.calculatePercentile(values, 95),
      error_rate: 0, // Would calculate from actual error metrics
    }));
  }

  async getSystemHealth(): Promise<any> {
    const last1min = new Date(Date.now() - 60 * 1000);
    
    const metrics = await this.metricRepository
      .createQueryBuilder('pm')
      .where('pm.recorded_at >= :time', { time: last1min })
      .getMany();

    return {
      status: 'healthy',
      cpu: {
        usage: metrics.filter(m => m.metric_type === 'cpu_usage')[0]?.metric_value || 0,
        status: 'normal',
      },
      memory: {
        usage: metrics.filter(m => m.metric_type === 'memory_usage')[0]?.metric_value || 0,
        status: 'normal',
      },
      database: {
        avg_query_time: this.calculateAvg(
          metrics.filter(m => m.metric_type === 'database_query_time').map(m => Number(m.metric_value))
        ),
        status: 'normal',
      },
    };
  }

  private calculateAvg(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
}
