import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { OrganizationHealthScore, RiskLevel } from '../entities/organization-health.entity';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  GetHealthScoresQueryDto,
  OrganizationHealthDto,
  HealthSummaryDto,
  InactiveOrganizationDto,
} from '../dto/organization-health.dto';

@Injectable()
export class OrganizationHealthService {
  private readonly logger = new Logger(OrganizationHealthService.name);

  constructor(
    @InjectRepository(OrganizationHealthScore)
    private healthRepository: Repository<OrganizationHealthScore>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getHealthScores(query: GetHealthScoresQueryDto): Promise<OrganizationHealthDto[]> {
    const where: any = {};

    if (query.riskLevel) {
      where.riskLevel = query.riskLevel;
    }

    if (query.minHealthScore !== undefined) {
      where.healthScore = Between(query.minHealthScore, query.maxHealthScore || 100);
    }

    if (query.minDaysSinceLogin !== undefined) {
      where.daysSinceLastLogin = LessThan(query.minDaysSinceLogin);
    }

    const scores = await this.healthRepository.find({
      where,
      relations: ['organization'],
      order: { healthScore: 'ASC' },
      take: 100,
    });

    return scores.map(score => ({
      id: score.id,
      organizationId: score.organizationId,
      organizationName: score.organization?.name || 'Unknown',
      healthScore: score.healthScore,
      riskLevel: score.riskLevel,
      indicators: {
        lastLoginDays: score.daysSinceLastLogin,
        ticketVolume: score.ticketVolume,
        userEngagement: score.userEngagement,
        featureAdoption: Number(score.featureAdoption),
        failedPayments: score.failedPayments,
        activeUsers: score.activeUsers,
      },
      recommendations: score.recommendations || [],
      lastCalculatedAt: score.lastCalculatedAt,
    }));
  }

  async getHealthSummary(): Promise<HealthSummaryDto> {
    const allScores = await this.healthRepository.find();

    const totalOrganizations = allScores.length;
    const healthyOrganizations = allScores.filter(s => s.healthScore >= 70).length;
    const atRiskOrganizations = allScores.filter(s => s.healthScore < 50).length;
    const criticalOrganizations = allScores.filter(s => s.healthScore < 30).length;

    const averageHealthScore = totalOrganizations > 0
      ? allScores.reduce((sum, s) => sum + s.healthScore, 0) / totalOrganizations
      : 0;

    const riskDistribution = {
      low: allScores.filter(s => s.riskLevel === RiskLevel.LOW).length,
      medium: allScores.filter(s => s.riskLevel === RiskLevel.MEDIUM).length,
      high: allScores.filter(s => s.riskLevel === RiskLevel.HIGH).length,
      critical: allScores.filter(s => s.riskLevel === RiskLevel.CRITICAL).length,
    };

    // Aggregate top issues
    const issueMap = new Map<string, number>();
    allScores.forEach(score => {
      if (score.daysSinceLastLogin > 30) issueMap.set('Inactive (30+ days)', (issueMap.get('Inactive (30+ days)') || 0) + 1);
      if (score.ticketVolume > 10) issueMap.set('High support load', (issueMap.get('High support load') || 0) + 1);
      if (score.userEngagement < 30) issueMap.set('Low engagement', (issueMap.get('Low engagement') || 0) + 1);
      if (score.failedPayments > 0) issueMap.set('Payment issues', (issueMap.get('Payment issues') || 0) + 1);
    });

    const topIssues = Array.from(issueMap.entries())
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalOrganizations,
      healthyOrganizations,
      atRiskOrganizations,
      criticalOrganizations,
      averageHealthScore: Number(averageHealthScore.toFixed(2)),
      riskDistribution,
      topIssues,
    };
  }

  async getInactiveOrganizations(): Promise<InactiveOrganizationDto[]> {
    const inactiveScores = await this.healthRepository.find({
      where: {
        daysSinceLastLogin: LessThan(30),
      },
      relations: ['organization'],
      order: { daysSinceLastLogin: 'DESC' },
      take: 50,
    });

    const tierPricing = { basic: 29, premium: 99, advanced: 299 };

    return inactiveScores.map(score => ({
      id: score.organizationId,
      name: score.organization?.name || 'Unknown',
      daysSinceLastLogin: score.daysSinceLastLogin,
      lastLoginDate: new Date(Date.now() - score.daysSinceLastLogin * 24 * 60 * 60 * 1000),
      tier: score.organization?.userTierConfig?.activeTier || 'basic',
      monthlyRevenue: tierPricing[score.organization?.userTierConfig?.activeTier || 'basic'],
      contactEmail: score.organization?.email || 'N/A',
    }));
  }

  async calculateHealthScore(organizationId: string): Promise<OrganizationHealthScore> {
    this.logger.log(`Calculating health score for organization: ${organizationId}`);

    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    // Get users for this organization
    const users = await this.userRepository.find({
      where: { organizationId },
    });

    const activeUsers = users.filter(u => u.isActive).length;

    // Calculate metrics (mock data - in production, query actual data)
    const daysSinceLastLogin = Math.floor(Math.random() * 60);
    const ticketVolume = Math.floor(Math.random() * 20);
    const userEngagement = Math.floor(Math.random() * 100);
    const featureAdoption = Math.random() * 100;
    const failedPayments = Math.floor(Math.random() * 3);
    const apiErrorRate = Math.random() * 10;

    // Calculate individual indicators (0-100 scale)
    const loginActivity = Math.max(0, 100 - (daysSinceLastLogin * 2));
    const supportLoad = Math.max(0, 100 - (ticketVolume * 5));
    const engagement = userEngagement;
    const adoption = featureAdoption;
    const payment = Math.max(0, 100 - (failedPayments * 20));

    // Weighted average for health score
    const healthScore = Math.round(
      loginActivity * 0.25 +
      supportLoad * 0.15 +
      engagement * 0.25 +
      adoption * 0.20 +
      payment * 0.15
    );

    // Determine risk level
    let riskLevel: RiskLevel;
    if (healthScore >= 70) riskLevel = RiskLevel.LOW;
    else if (healthScore >= 50) riskLevel = RiskLevel.MEDIUM;
    else if (healthScore >= 30) riskLevel = RiskLevel.HIGH;
    else riskLevel = RiskLevel.CRITICAL;

    // Generate recommendations
    const recommendations: string[] = [];
    if (daysSinceLastLogin > 14) recommendations.push('Send re-engagement email - no login in 14+ days');
    if (ticketVolume > 10) recommendations.push('High support load - consider dedicated account manager');
    if (userEngagement < 40) recommendations.push('Low engagement - schedule onboarding review');
    if (featureAdoption < 30) recommendations.push('Low feature adoption - send feature tutorial emails');
    if (failedPayments > 0) recommendations.push('Payment issue detected - contact billing department');

    // Save or update health score
    let healthRecord = await this.healthRepository.findOne({
      where: { organizationId },
    });

    if (!healthRecord) {
      healthRecord = new OrganizationHealthScore();
      healthRecord.organizationId = organizationId;
    }

    healthRecord.healthScore = healthScore;
    healthRecord.riskLevel = riskLevel;
    healthRecord.daysSinceLastLogin = daysSinceLastLogin;
    healthRecord.ticketVolume = ticketVolume;
    healthRecord.userEngagement = userEngagement;
    healthRecord.featureAdoption = featureAdoption;
    healthRecord.failedPayments = failedPayments;
    healthRecord.activeUsers = activeUsers;
    healthRecord.apiErrorRate = apiErrorRate;
    healthRecord.indicators = {
      loginActivity,
      supportLoad,
      engagement,
      adoption,
      payment,
    };
    healthRecord.recommendations = recommendations;
    healthRecord.lastCalculatedAt = new Date();

    return this.healthRepository.save(healthRecord);
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async recalculateAllHealthScores() {
    this.logger.log('Starting daily health score recalculation...');

    const organizations = await this.organizationRepository.find({
      where: { status: 'active' as any },
    });

    for (const org of organizations) {
      try {
        await this.calculateHealthScore(org.id);
      } catch (error) {
        this.logger.error(`Failed to calculate health for org ${org.id}: ${error.message}`);
      }
    }

    this.logger.log(`Completed health score calculation for ${organizations.length} organizations`);
  }
}
