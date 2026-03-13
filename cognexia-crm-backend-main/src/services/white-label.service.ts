import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhiteLabelConfig } from '../entities/white-label-config.entity';

@Injectable()
export class WhiteLabelService {
  constructor(
    @InjectRepository(WhiteLabelConfig)
    private configRepository: Repository<WhiteLabelConfig>,
  ) {}

  async getAllConfigs() {
    return this.configRepository.find({ order: { createdAt: 'DESC' } });
  }

  async getConfig(organizationId: string) {
    return this.configRepository.findOne({ where: { organizationId } });
  }

  async createOrUpdateConfig(organizationId: string, data: Partial<WhiteLabelConfig>) {
    let config = await this.configRepository.findOne({ where: { organizationId } });

    if (config) {
      await this.configRepository.update({ organizationId }, data);
      return this.configRepository.findOne({ where: { organizationId } });
    } else {
      config = this.configRepository.create({ organizationId, ...data });
      return this.configRepository.save(config);
    }
  }

  async deleteConfig(organizationId: string) {
    await this.configRepository.delete({ organizationId });
    return { success: true };
  }

  async getWhiteLabelStats() {
    const configs = await this.configRepository.find();
    
    return {
      totalConfigs: configs.length,
      withCustomDomain: configs.filter(c => c.customDomain).length,
      withSSO: configs.filter(c => c.ssoEnabled).length,
      withCustomBranding: configs.filter(c => c.logoUrl && c.colorScheme).length,
    };
  }
}
