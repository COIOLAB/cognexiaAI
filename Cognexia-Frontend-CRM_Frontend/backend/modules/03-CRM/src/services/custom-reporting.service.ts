import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomReport } from '../entities/custom-report.entity';

@Injectable()
export class CustomReportingService {
  constructor(
    @InjectRepository(CustomReport)
    private reportRepository: Repository<CustomReport>,
  ) {}

  async getAllReports() {
    return this.reportRepository.find({ order: { createdAt: 'DESC' } });
  }

  async createReport(data: any) {
    const report = this.reportRepository.create(data as any);
    return this.reportRepository.save(report);
  }

  async runReport(id: string) {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) throw new Error('Report not found');

    // Mock report execution
    report.runCount++;
    await this.reportRepository.save(report);

    return {
      reportId: id,
      data: [
        { metric: 'Total Revenue', value: 125000 },
        { metric: 'Active Users', value: 1250 },
        { metric: 'Churn Rate', value: 2.5 },
      ],
      generatedAt: new Date(),
    };
  }

  async deleteReport(id: string) {
    await this.reportRepository.delete({ id });
    return { success: true };
  }
}
