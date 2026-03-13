import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ABTest, ABTestStatus } from '../entities/ab-test.entity';

@Injectable()
export class ABTestingService {
  constructor(
    @InjectRepository(ABTest)
    private testRepository: Repository<ABTest>,
  ) {}

  async getAllTests() {
    return this.testRepository.find({ order: { createdAt: 'DESC' } });
  }

  async createTest(data: any) {
    const test = this.testRepository.create(data as any);
    return this.testRepository.save(test);
  }

  async startTest(id: string) {
    await this.testRepository.update({ id }, { status: ABTestStatus.RUNNING, startedAt: new Date() });
    return this.testRepository.findOne({ where: { id } });
  }

  async getTestResults(id: string) {
    const test = await this.testRepository.findOne({ where: { id } });
    if (!test) throw new Error('Test not found');

    // Mock results
    return {
      testId: id,
      status: test.status,
      variants: test.variants.map(v => ({
        id: v.id,
        name: v.name,
        conversions: Math.floor(Math.random() * 1000),
        conversionRate: Math.random() * 10,
        confidence: Math.random() * 100,
      })),
      winner: test.variants[0].id,
      significance: 95,
    };
  }
}
