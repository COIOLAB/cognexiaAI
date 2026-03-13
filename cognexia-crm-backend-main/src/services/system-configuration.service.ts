import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfiguration } from '../entities/system-configuration.entity';
import { FeatureFlag } from '../entities/feature-flag.entity';

@Injectable()
export class SystemConfigurationService {
  constructor(
    @InjectRepository(SystemConfiguration)
    private configRepository: Repository<SystemConfiguration>,
    @InjectRepository(FeatureFlag)
    private featureFlagRepository: Repository<FeatureFlag>,
  ) {}

  async getAllConfigs() {
    return this.configRepository.find({ order: { category: 'ASC', key: 'ASC' } });
  }

  async getConfig(key: string) {
    return this.configRepository.findOne({ where: { key } });
  }

  async updateConfig(key: string, value: string) {
    await this.configRepository.update({ key }, { value });
    return this.configRepository.findOne({ where: { key } });
  }

  async getAllFeatureFlags() {
    return this.featureFlagRepository.find({ order: { name: 'ASC' } });
  }

  async updateFeatureFlag(id: string, enabled: boolean, rolloutPercentage?: number) {
    const update: any = { enabled };
    if (rolloutPercentage !== undefined) update.rolloutPercentage = rolloutPercentage;
    await this.featureFlagRepository.update({ id }, update);
    return this.featureFlagRepository.findOne({ where: { id } });
  }

  async isFeatureEnabled(featureName: string, organizationId?: string): Promise<boolean> {
    const flag = await this.featureFlagRepository.findOne({ where: { name: featureName } });
    if (!flag || !flag.enabled) return false;
    
    if (flag.targetOrganizations && flag.targetOrganizations.length > 0) {
      if (!organizationId) return false;
      return flag.targetOrganizations.includes(organizationId);
    }

    return Math.random() * 100 < flag.rolloutPercentage;
  }
}
