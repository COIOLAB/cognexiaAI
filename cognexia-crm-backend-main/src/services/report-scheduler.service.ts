import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReportSchedule, ScheduleFrequency } from '../entities/report-schedule.entity';
import { ReportBuilderService } from './report-builder.service';
import { ExportService } from './export.service';
import { EmailSenderService } from './email-sender.service';
import { CreateReportScheduleDto, UpdateReportScheduleDto } from '../dto/report.dto';

@Injectable()
export class ReportSchedulerService {
  constructor(
    @InjectRepository(ReportSchedule)
    private scheduleRepository: Repository<ReportSchedule>,
    private reportBuilderService: ReportBuilderService,
    private exportService: ExportService,
    private emailSenderService: EmailSenderService,
  ) {}

  async createSchedule(
    tenantId: string,
    userId: string,
    dto: CreateReportScheduleDto,
  ): Promise<ReportSchedule> {
    const schedule = this.scheduleRepository.create({
      ...dto,
      tenantId,
      createdById: userId,
      nextRunAt: this.calculateNextRunTime(dto.frequency, dto.scheduleTime, dto.dayOfWeek, dto.dayOfMonth),
    });

    return this.scheduleRepository.save(schedule);
  }

  async findAll(tenantId: string): Promise<ReportSchedule[]> {
    return this.scheduleRepository.find({
      where: { tenantId },
      relations: ['report'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<ReportSchedule> {
    const whereClause: any = { id };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }
    const schedule = await this.scheduleRepository.findOne({
      where: whereClause,
      relations: ['report'],
    });

    if (!schedule) {
      throw new NotFoundException('Report schedule not found');
    }

    return schedule;
  }

  async updateSchedule(
    id: string,
    tenantId: string,
    dto: UpdateReportScheduleDto,
  ): Promise<ReportSchedule> {
    const schedule = await this.findOne(id, tenantId);

    Object.assign(schedule, dto);

    // Recalculate next run time if frequency or time changed
    if (dto.frequency || dto.scheduleTime || dto.dayOfWeek !== undefined || dto.dayOfMonth !== undefined) {
      schedule.nextRunAt = this.calculateNextRunTime(
        schedule.frequency,
        schedule.scheduleTime,
        schedule.dayOfWeek,
        schedule.dayOfMonth,
      );
    }

    return this.scheduleRepository.save(schedule);
  }

  async deleteSchedule(id: string, tenantId: string): Promise<void> {
    const whereClause: any = { id };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }
    const schedule = await this.scheduleRepository.findOne({ where: whereClause });
    if (!schedule) {
      return;
    }
    await this.scheduleRepository.remove(schedule);
  }

  async runScheduleNow(id: string, tenantId: string): Promise<void> {
    const schedule = await this.findOne(id, tenantId);
    await this.executeSchedule(schedule);
  }

  // Cron job to check and execute scheduled reports
  @Cron(CronExpression.EVERY_HOUR)
  async checkScheduledReports(): Promise<void> {
    const now = new Date();
    const dueSchedules = await this.scheduleRepository.find({
      where: {
        isActive: true,
        nextRunAt: LessThan(now),
      },
      relations: ['report'],
    });

    for (const schedule of dueSchedules) {
      try {
        await this.executeSchedule(schedule);
      } catch (error) {
        console.error(`Failed to execute schedule ${schedule.id}:`, error);
      }
    }
  }

  private async executeSchedule(schedule: ReportSchedule): Promise<void> {
    // Run the report
    const reportResult = await this.reportBuilderService.runReport(
      schedule.reportId,
      schedule.tenantId,
    );

    // Export to requested format
    let fileBuffer: Buffer;
    let fileName: string;
    let mimeType: string;

    switch (schedule.format) {
      case 'csv':
        const csvData = this.convertToCSV(reportResult.data);
        fileBuffer = Buffer.from(csvData, 'utf-8');
        fileName = `${schedule.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
        break;

      case 'excel':
        // Use export service for Excel
        fileBuffer = await (this.exportService as any).exportToExcel(
          reportResult.data,
          `${schedule.name} - ${new Date().toLocaleDateString()}`,
        );
        fileName = `${schedule.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;

      case 'pdf':
        // Use export service for PDF
        if (typeof (this.exportService as any).exportToPDF !== 'function') {
          const csvData = this.convertToCSV(reportResult.data);
          fileBuffer = Buffer.from(csvData, 'utf-8');
          fileName = `${schedule.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
        } else {
          fileBuffer = await (this.exportService as any).exportToPDF(
            reportResult.data,
            `${schedule.name} - ${new Date().toLocaleDateString()}`,
            reportResult.metadata,
          );
          fileName = `${schedule.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
          mimeType = 'application/pdf';
        }
        break;

      default:
        throw new Error(`Unsupported format: ${schedule.format}`);
    }

    const mailer = this.emailSenderService as any;
    if (typeof mailer.sendEmailWithAttachment === 'function') {
      await mailer.sendEmailWithAttachment({
        to: schedule.recipients,
        subject: `Scheduled Report: ${schedule.name}`,
        html: `
          <h2>${schedule.name}</h2>
          <p>Your scheduled report is ready.</p>
          <p><strong>Report Details:</strong></p>
          <ul>
            <li>Report: ${reportResult.metadata.reportName}</li>
            <li>Generated: ${new Date().toLocaleString()}</li>
            <li>Records: ${reportResult.metadata.totalCount}</li>
          </ul>
          <p>Please find the report attached.</p>
        `,
        attachments: [
          {
            filename: fileName,
            content: fileBuffer,
            contentType: mimeType,
          },
        ],
      });
    } else if (typeof mailer.sendEmail === 'function') {
      await mailer.sendEmail(
        schedule.tenantId,
        schedule.recipients.join(','),
        `Scheduled Report: ${schedule.name}`,
        `
          <h2>${schedule.name}</h2>
          <p>Your scheduled report is ready.</p>
          <p>Attachment delivery is unavailable in this environment.</p>
        `,
      );
    }

    // Update schedule
    await this.scheduleRepository.update(schedule.id, {
      lastRunAt: new Date(),
      nextRunAt: this.calculateNextRunTime(
        schedule.frequency,
        schedule.scheduleTime,
        schedule.dayOfWeek,
        schedule.dayOfMonth,
      ),
    });
  }

  private calculateNextRunTime(
    frequency: ScheduleFrequency,
    scheduleTime?: string,
    dayOfWeek?: number,
    dayOfMonth?: number,
  ): Date {
    const now = new Date();
    const next = new Date(now);

    // Parse schedule time (HH:MM:SS)
    if (scheduleTime) {
      const [hours, minutes, seconds] = scheduleTime.split(':').map(Number);
      next.setHours(hours, minutes, seconds || 0, 0);
    } else {
      next.setHours(9, 0, 0, 0); // Default to 9 AM
    }

    switch (frequency) {
      case ScheduleFrequency.DAILY:
        if (next <= now) {
          next.setDate(next.getDate() + 1);
        }
        break;

      case ScheduleFrequency.WEEKLY:
        const targetDay = dayOfWeek ?? 1; // Default to Monday
        const currentDay = next.getDay();
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0 || (daysToAdd === 0 && next <= now)) {
          daysToAdd += 7;
        }
        next.setDate(next.getDate() + daysToAdd);
        break;

      case ScheduleFrequency.MONTHLY:
        const targetDate = dayOfMonth ?? 1; // Default to 1st
        next.setDate(targetDate);
        if (next <= now) {
          next.setMonth(next.getMonth() + 1);
        }
        break;

      case ScheduleFrequency.QUARTERLY:
        const currentMonth = next.getMonth();
        const nextQuarterMonth = Math.ceil((currentMonth + 1) / 3) * 3;
        next.setMonth(nextQuarterMonth);
        next.setDate(dayOfMonth ?? 1);
        if (next <= now) {
          next.setMonth(next.getMonth() + 3);
        }
        break;
    }

    return next;
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers.map((header) => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        }).join(','),
      ),
    ];

    return csvRows.join('\n');
  }
}
