import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deployment } from '../entities/deployment.entity';
import { CreateDeploymentDto, UpdateDeploymentDto } from '../dto/developer-portal.dto';

@Injectable()
export class ReleaseManagementService {
  constructor(
    @InjectRepository(Deployment)
    private deploymentRepository: Repository<Deployment>,
  ) {}

  async createDeployment(dto: CreateDeploymentDto, userId: string): Promise<Deployment> {
    const deployment = this.deploymentRepository.create({
      deploymentNumber: `DEP-${Date.now()}`,
      environment: (dto as any).environment || 'staging',
      version: (dto as any).version || '1.0.0',
      deployedBy: userId,
      deployedAt: new Date(),
      status: 'pending' as any,
    } as any);

    return await this.deploymentRepository.save(deployment) as any;
  }

  async getDeployments(environment?: string): Promise<Deployment[]> {
    const query = this.deploymentRepository.createQueryBuilder('dep');
    
    if (environment) {
      query.where('dep.environment = :env', { env: environment });
    }
    
    return await query.orderBy('dep.deployed_at', 'DESC').limit(50).getMany();
  }

  async updateDeployment(id: string, dto: UpdateDeploymentDto): Promise<Deployment> {
    const updates: any = { ...dto };
    
    if (dto.status === 'completed') {
      updates.completed_at = new Date();
    }

    await this.deploymentRepository.update(id, updates);
    return await this.deploymentRepository.findOne({ where: { id } });
  }

  async rollback(deploymentId: string): Promise<Deployment> {
    await this.deploymentRepository.update(deploymentId, {
      status: 'rolled_back',
      completed_at: new Date(),
    });
    
    return await this.deploymentRepository.findOne({ where: { id: deploymentId } });
  }

  async getStats(): Promise<any> {
    const all = await this.deploymentRepository.find({
      order: { deployed_at: 'DESC' },
      take: 100,
    });

    const completed = all.filter(d => d.status === 'completed');
    
    return {
      total: all.length,
      by_environment: {
        production: all.filter(d => d.environment === 'production').length,
        staging: all.filter(d => d.environment === 'staging').length,
        development: all.filter(d => d.environment === 'development').length,
      },
      by_status: {
        completed: completed.length,
        failed: all.filter(d => d.status === 'failed').length,
        rolled_back: all.filter(d => d.status === 'rolled_back').length,
        in_progress: all.filter(d => d.status === 'in_progress').length,
      },
      success_rate: (completed.length / all.length * 100) || 0,
      avg_duration: completed.reduce((sum, d) => sum + (d.duration_seconds || 0), 0) / completed.length || 0,
    };
  }
}
