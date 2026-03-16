import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation } from '../entities/recommendation.entity';
import { CreateRecommendationDto, UpdateRecommendationStatusDto } from '../dto/ai-predictive.dto';

@Injectable()
export class RecommendationEngineService {
  constructor(
    @InjectRepository(Recommendation)
    private recommendationRepository: Repository<Recommendation>,
  ) { }

  async getRecommendations(organizationId?: string): Promise<Recommendation[]> {
    const query = this.recommendationRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.organization', 'org');

    if (organizationId) {
      query.where('r.organizationId = :orgId', { orgId: organizationId });
    }

    return await query
      .orderBy('r.priority', 'DESC')
      .addOrderBy('r.confidence_score', 'DESC')
      .getMany();
  }

  async createRecommendation(dto: CreateRecommendationDto): Promise<Recommendation> {
    const recommendation = this.recommendationRepository.create(dto as any);
    return await this.recommendationRepository.save(recommendation) as any;
  }

  async updateStatus(id: string, dto: UpdateRecommendationStatusDto): Promise<Recommendation> {
    await this.recommendationRepository.update(id, {
      status: dto.status as any,
      dismissed_reason: dto.dismissed_reason,
      completed_at: dto.status === 'completed' ? new Date() : undefined,
    });
    return await this.recommendationRepository.findOne({ where: { id } });
  }

  async generateRecommendations(organizationId: string): Promise<Recommendation[]> {
    // AI recommendation generation logic would go here
    const recommendations = [
      {
        organizationId: organizationId,
        recommendation_type: 'feature_adoption',
        title: 'Enable Advanced Reporting',
        description: 'Your team would benefit from our advanced reporting features',
        priority: 'high',
        confidence_score: 85,
        action_items: ['Schedule demo', 'Enable trial access'],
      },
      {
        organizationId: organizationId,
        recommendation_type: 'upsell',
        title: 'Upgrade to Premium Tier',
        description: 'Based on usage patterns, Premium tier would be more cost-effective',
        priority: 'medium',
        confidence_score: 78,
        action_items: ['Review pricing comparison', 'Schedule upgrade call'],
      },
    ];

    const created = [];
    for (const rec of recommendations) {
      const recommendation = this.recommendationRepository.create(rec as any);
      created.push(await this.recommendationRepository.save(recommendation));
    }

    return created;
  }

  async getStats(): Promise<any> {
    const all = await this.recommendationRepository.find();

    return {
      total: all.length,
      pending: all.filter(r => r.status === 'pending').length,
      accepted: all.filter(r => r.status === 'accepted').length,
      completed: all.filter(r => r.status === 'completed').length,
      dismissed: all.filter(r => r.status === 'dismissed').length,
      acceptance_rate: (all.filter(r => r.status === 'accepted' || r.status === 'completed').length / all.length * 100) || 0,
    };
  }


  /**
   * Get frequently bought together products
   */
  async getFrequentlyBoughtTogether(productId: string, organizationId?: string): Promise<any[]> {
    // Mock implementation
    return [];
  }

  /**
   * Get upsell products
   */
  async getUpsellProducts(productId: string, organizationId?: string): Promise<any[]> {
    // Mock implementation
    return [];
  }
}
