import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerSuccessMilestone } from '../entities/customer-success-milestone.entity';
import { CreateMilestoneDto, UpdateMilestoneDto } from '../dto/customer-success.dto';

@Injectable()
export class CustomerSuccessService {
  constructor(
    @InjectRepository(CustomerSuccessMilestone)
    private milestoneRepository: Repository<CustomerSuccessMilestone>,
  ) { }

  async getMilestones(organizationId?: string): Promise<CustomerSuccessMilestone[]> {
    const query = this.milestoneRepository
      .createQueryBuilder('csm')
      .leftJoinAndSelect('csm.organization', 'org');

    if (organizationId) {
      query.where('csm.organizationId = :orgId', { orgId: organizationId });
    }

    return await query.orderBy('csm.target_date', 'ASC').getMany();
  }

  async createMilestone(dto: CreateMilestoneDto): Promise<CustomerSuccessMilestone> {
    const milestone = this.milestoneRepository.create(dto as any);
    return await this.milestoneRepository.save(milestone) as any;
  }

  async updateMilestone(id: string, dto: UpdateMilestoneDto): Promise<CustomerSuccessMilestone> {
    const updates: any = { ...dto };

    if (dto.status === 'completed') {
      updates.completed_at = new Date();
      updates.completion_percentage = 100;
    }

    await this.milestoneRepository.update(id, updates);
    return await this.milestoneRepository.findOne({ where: { id } });
  }

  async getProgressOverview(): Promise<any> {
    const all = await this.milestoneRepository.find();

    return {
      total: all.length,
      by_status: {
        pending: all.filter(m => m.status === 'pending').length,
        in_progress: all.filter(m => m.status === 'in_progress').length,
        completed: all.filter(m => m.status === 'completed').length,
        blocked: all.filter(m => m.status === 'blocked').length,
      },
      by_type: {
        onboarding: all.filter(m => m.milestone_type === 'onboarding').length,
        activation: all.filter(m => m.milestone_type === 'activation').length,
        first_value: all.filter(m => m.milestone_type === 'first_value').length,
        expansion: all.filter(m => m.milestone_type === 'expansion').length,
        advocacy: all.filter(m => m.milestone_type === 'advocacy').length,
      },
      completion_rate: (all.filter(m => m.status === 'completed').length / all.length * 100) || 0,
    };
  }
}
