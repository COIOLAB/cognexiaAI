import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RealTimeEvent } from '../entities/real-time-event.entity';
import { LiveMetric } from '../entities/live-metric.entity';
import { DashboardSubscription } from '../entities/dashboard-subscription.entity';
import { AlertRule } from '../entities/alert-rule.entity';

@Injectable()
export class RealTimeAnalyticsService {
  constructor(
    @InjectRepository(RealTimeEvent)
    private eventRepo: Repository<RealTimeEvent>,
    @InjectRepository(LiveMetric)
    private metricRepo: Repository<LiveMetric>,
    @InjectRepository(DashboardSubscription)
    private subscriptionRepo: Repository<DashboardSubscription>,
    @InjectRepository(AlertRule)
    private alertRepo: Repository<AlertRule>,
  ) {}

  async getLiveMetrics(organizationId: string) {
    return this.metricRepo.find({
      where: { organizationId },
      order: { timestamp: 'DESC' },
      take: 100,
    });
  }

  async publishEvent(data: any, organizationId: string) {
    try {
      const event = this.eventRepo.create({
        ...data,
        organizationId,
        eventType: data.eventType || 'CUSTOM_EVENT',
        payload: data.payload || data.data || {},
        timestamp: new Date(),
      });
      return await this.eventRepo.save(event);
    } catch (error) {
      console.error('Error publishing event:', error.message);
      throw new Error(`Failed to publish event: ${error.message}`);
    }
  }

  async getDashboardData(dashboardId: string, organizationId: string) {
    return {
      dashboardId,
      metrics: await this.getLiveMetrics(organizationId),
      lastUpdated: new Date(),
    };
  }

  async createAlert(data: any, organizationId: string) {
    try {
      const alert = this.alertRepo.create({ 
        ...data, 
        organizationId,
        name: data.name || 'Alert Rule',
        condition: data.condition || 'value > threshold',
        threshold: data.threshold || 0,
        recipients: data.recipients || [],
        isActive: data.isActive !== undefined ? data.isActive : true,
      });
      return await this.alertRepo.save(alert);
    } catch (error) {
      console.error('Error creating alert:', error.message);
      throw new Error(`Failed to create alert: ${error.message}`);
    }
  }

  async getAlerts(organizationId: string) {
    return this.alertRepo.find({ where: { organizationId } });
  }

  async updateAlert(id: string, data: any, organizationId: string) {
    try {
      await this.alertRepo.update({ id, organizationId }, data);
      return this.alertRepo.findOne({ where: { id, organizationId } });
    } catch (error) {
      console.error('Error updating alert:', error.message);
      return null;
    }
  }

  async getLiveCustomerActivity(organizationId: string) {
    return {
      activeUsers: 142,
      recentActivities: [],
      peakHour: '14:00',
    };
  }

  async getLiveConversions() {
    return {
      today: 24,
      thisHour: 3,
      conversionRate: 2.4,
    };
  }
}
