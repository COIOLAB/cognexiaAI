import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SandboxEnvironment } from '../entities/sandbox-environment.entity';
import { CreateSandboxDto } from '../dto/developer-portal.dto';

@Injectable()
export class DeveloperPortalService {
  constructor(
    @InjectRepository(SandboxEnvironment)
    private sandboxRepository: Repository<SandboxEnvironment>,
  ) {}

  async createSandbox(dto: CreateSandboxDto): Promise<SandboxEnvironment> {
    const sandbox = this.sandboxRepository.create({
      ...dto,
      sandbox_url: `https://sandbox-${Date.now()}.example.com`,
      status: 'active' as any,
      expires_at: dto.expires_at ? new Date(dto.expires_at) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return await this.sandboxRepository.save(sandbox);
  }

  async getSandboxes(organizationId?: string): Promise<SandboxEnvironment[]> {
    const query = this.sandboxRepository
      .createQueryBuilder('sb')
      .leftJoinAndSelect('sb.organization', 'org');
    
    if (organizationId) {
      query.where('sb.organization_id = :orgId', { orgId: organizationId });
    }
    
    return await query.orderBy('sb.createdAt', 'DESC').getMany();
  }

  async seedData(sandboxId: string): Promise<SandboxEnvironment> {
    await this.sandboxRepository.update(sandboxId, {
      data_seed_status: 'seeding',
    });

    // Simulate seeding
    setTimeout(async () => {
      await this.sandboxRepository.update(sandboxId, {
        data_seed_status: 'completed',
      });
    }, 3000);

    return await this.sandboxRepository.findOne({ where: { id: sandboxId } });
  }

  async resetSandbox(id: string): Promise<SandboxEnvironment> {
    await this.sandboxRepository.update(id, {
      data_seed_status: 'none',
      storage_used_mb: 0,
      api_calls_count: 0,
      last_accessed_at: new Date(),
    });
    
    return await this.sandboxRepository.findOne({ where: { id } });
  }

  async getStats(): Promise<any> {
    const all = await this.sandboxRepository.find();
    
    return {
      total: all.length,
      active: all.filter(s => s.status === 'active').length,
      suspended: all.filter(s => s.status === 'suspended').length,
      total_api_calls: all.reduce((sum, s) => sum + s.api_calls_count, 0),
      total_storage_gb: all.reduce((sum, s) => sum + Number(s.storage_used_mb), 0) / 1024,
    };
  }
}
