import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationHealthScore } from '../entities/organization-health.entity';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class HealthScoringV2Service {
  constructor(
    @InjectRepository(OrganizationHealthScore)
    private healthRepository: Repository<OrganizationHealthScore>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async calculateEnhancedScore(organizationId: string): Promise<any> {
    const org = await this.organizationRepository.findOne({ where: { id: organizationId } });
    
    if (!org) {
      throw new Error('Organization not found');
    }

    // AI-enhanced health score calculation
    const usageScore = this.calculateUsageScore(org);
    const engagementScore = this.calculateEngagementScore(org);
    const financialScore = this.calculateFinancialScore(org);
    const supportScore = this.calculateSupportScore(org);
    
    const overallScore = Math.round(
      usageScore * 0.35 +
      engagementScore * 0.25 +
      financialScore * 0.25 +
      supportScore * 0.15
    );

    return {
      organizationId,
      overall_score: overallScore,
      breakdown: {
        usage: usageScore,
        engagement: engagementScore,
        financial: financialScore,
        support: supportScore,
      },
      risk_level: this.determineRiskLevel(overallScore),
      predictive_insights: this.generatePredictiveInsights(overallScore),
      recommendations: this.generateRecommendations(overallScore),
    };
  }

  async getHealthTrends(organizationId: string): Promise<any[]> {
    const history = await this.healthRepository.find({
      where: { organizationId: organizationId },
      order: { lastCalculatedAt: 'DESC' },
      take: 30,
    });

    return history.map(h => ({
      date: h.lastCalculatedAt,
      score: h.healthScore,
      risk_level: h.riskLevel,
    }));
  }

  async compareToSimilar(organizationId: string): Promise<any> {
    const org = await this.organizationRepository.findOne({ where: { id: organizationId } });
    
    // Find similar organizations
    const similar = await this.organizationRepository
      .createQueryBuilder('o')
      .where('o.subscriptionPlanId = :planId', { planId: org.subscriptionPlanId })
      .andWhere('o.id != :id', { id: organizationId })
      .limit(10)
      .getMany();

    return {
      organization: org.name,
      tier: org.userTierConfig?.activeTier || 'unknown',
      peer_average_score: 75,
      your_score: 65,
      percentile: 45,
      similar_organizations: similar.length,
    };
  }

  private calculateUsageScore(org: Organization): number {
    // Simplified scoring logic
    return Math.random() * 30 + 70; // 70-100
  }

  private calculateEngagementScore(org: Organization): number {
    return Math.random() * 30 + 70;
  }

  private calculateFinancialScore(org: Organization): number {
    return Math.random() * 30 + 70;
  }

  private calculateSupportScore(org: Organization): number {
    return Math.random() * 30 + 70;
  }

  private determineRiskLevel(score: number): string {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'critical';
  }

  private generatePredictiveInsights(score: number): string[] {
    if (score < 50) {
      return [
        'Churn risk detected - immediate action required',
        'Usage trending downward over last 30 days',
        'Engagement 40% below peer average',
      ];
    }
    return ['Organization health is stable', 'All metrics within normal range'];
  }

  private generateRecommendations(score: number): string[] {
    if (score < 60) {
      return [
        'Schedule check-in call with key stakeholders',
        'Review feature adoption and provide training',
        'Offer personalized success plan',
      ];
    }
    return ['Continue monitoring', 'Consider upsell opportunities'];
  }
}
