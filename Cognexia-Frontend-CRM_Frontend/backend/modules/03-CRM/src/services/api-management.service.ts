import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { APIKey } from '../entities/api-key.entity';
import * as crypto from 'crypto';

@Injectable()
export class APIManagementService {
  constructor(
    @InjectRepository(APIKey)
    private apiKeyRepository: Repository<APIKey>,
  ) {}

  async getAllAPIKeys() {
    return this.apiKeyRepository.find({ order: { createdAt: 'DESC' } });
  }

  async createAPIKey(organizationId: string, name: string, permissions: string[], rateLimit: number) {
    const key = `ak_${crypto.randomBytes(32).toString('hex')}`;
    
    const apiKey = this.apiKeyRepository.create({
      organizationId,
      name,
      key,
      permissions,
      rateLimit,
    });

    return this.apiKeyRepository.save(apiKey);
  }

  async revokeAPIKey(id: string) {
    await this.apiKeyRepository.update({ id }, { isActive: false });
    return this.apiKeyRepository.findOne({ where: { id } });
  }

  async getAPIUsageStats() {
    const keys = await this.apiKeyRepository.find();
    
    return {
      totalKeys: keys.length,
      activeKeys: keys.filter(k => k.isActive).length,
      totalRequests: keys.reduce((sum, k) => sum + k.usageCount, 0),
      avgRateLimit: keys.reduce((sum, k) => sum + k.rateLimit, 0) / keys.length,
    };
  }

  async getEndpointAnalytics() {
    // Mock endpoint usage data
    return [
      { endpoint: '/api/users', calls: 15000, avgResponseTime: 120, errorRate: 0.5 },
      { endpoint: '/api/organizations', calls: 8500, avgResponseTime: 95, errorRate: 0.3 },
      { endpoint: '/api/contacts', calls: 12000, avgResponseTime: 150, errorRate: 1.2 },
      { endpoint: '/api/deals', calls: 6500, avgResponseTime: 180, errorRate: 0.8 },
    ];
  }
}
