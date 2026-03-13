import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class FeatureUsageAnalyticsService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async getFeatureAdoptionRates() {
    // Mock data - in production, track actual feature usage
    return {
      features: [
        { name: 'CRM', adoptionRate: 95, totalUsers: 950, activeUsers: 902 },
        { name: 'Sales Pipeline', adoptionRate: 78, totalUsers: 950, activeUsers: 741 },
        { name: 'Email Campaigns', adoptionRate: 65, totalUsers: 950, activeUsers: 617 },
        { name: 'Analytics Dashboard', adoptionRate: 82, totalUsers: 950, activeUsers: 779 },
        { name: 'Automation', adoptionRate: 45, totalUsers: 950, activeUsers: 427 },
        { name: 'AI Insights', adoptionRate: 38, totalUsers: 950, activeUsers: 361 },
      ],
      leastUsedFeatures: [
        { name: 'Advanced Reporting', usage: 15 },
        { name: 'API Integration', usage: 22 },
        { name: 'Custom Workflows', usage: 28 },
      ],
    };
  }

  async getFeatureUsageByTier() {
    return {
      basic: { features: 10, avgUsageRate: 65 },
      premium: { features: 25, avgUsageRate: 78 },
      advanced: { features: 50, avgUsageRate: 85 },
    };
  }

  async getUserJourneyAnalytics() {
    return {
      averageTimeToFirstValue: 2.5, // days
      featureFunnel: [
        { step: 'Sign Up', users: 1000, dropoff: 0 },
        { step: 'First Login', users: 920, dropoff: 8 },
        { step: 'Profile Setup', users: 850, dropoff: 7.6 },
        { step: 'First Contact Added', users: 720, dropoff: 15.3 },
        { step: 'First Deal Created', users: 580, dropoff: 19.4 },
        { step: 'Regular Usage (7+ days)', users: 450, dropoff: 22.4 },
      ],
    };
  }
}
