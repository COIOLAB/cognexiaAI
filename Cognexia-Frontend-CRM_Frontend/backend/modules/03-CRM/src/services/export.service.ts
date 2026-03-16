import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import * as xlsx from 'xlsx';
import * as PDFDocument from 'pdfkit';
import { ExportJob, ExportStatus, ExportFormat } from '../entities/export-job.entity';
import { Customer } from '../entities/customer.entity';
import { Lead } from '../entities/lead.entity';
import { Contact } from '../entities/contact.entity';
import { Opportunity } from '../entities/opportunity.entity';
import { logError } from '../utils/logger.util';

@Injectable()
export class ExportService {
  private readonly exportDir = path.join(process.cwd(), 'exports');

  constructor(
    @InjectRepository(ExportJob)
    private exportJobRepo: Repository<ExportJob>,
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
    @InjectRepository(Lead)
    private leadRepo: Repository<Lead>,
    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,
    @InjectRepository(Opportunity)
    private opportunityRepo: Repository<Opportunity>,
  ) {
    // Ensure export directory exists
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
  }

  /**
   * Create export job
   */
  async createExportJob(
    organizationId: string,
    userId: string,
    exportType: string,
    format: ExportFormat,
    filters?: any,
    columns?: string[],
  ): Promise<ExportJob> {
    const job = this.exportJobRepo.create({
      organization_id: organizationId,
      user_id: userId,
      export_type: exportType,
      format,
      filters: filters || {},
      columns,
      status: ExportStatus.PENDING,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return this.exportJobRepo.save(job);
  }

  /**
   * Process export job
   */
  async processExportJob(jobId: string): Promise<void> {
    const job = await this.exportJobRepo.findOne({ where: { id: jobId } });
    if (!job) throw new Error('Export job not found');

    try {
      job.status = ExportStatus.PROCESSING;
      await this.exportJobRepo.save(job);

      // Fetch data
      const data = await this.fetchData(
        job.export_type,
        job.organization_id,
        job.filters,
        job.columns,
      );

      job.total_records = data.length;

      // Generate file
      const fileName = `${job.export_type}_${Date.now()}.${this.getFileExtension(job.format)}`;
      const filePath = path.join(this.exportDir, fileName);

      await this.generateFile(data, job.format, filePath, job.columns);

      // Get file size
      const stats = fs.statSync(filePath);
      
      job.file_name = fileName;
      job.file_path = filePath;
      job.file_size = stats.size;
      job.status = ExportStatus.COMPLETED;
      job.completed_at = new Date();

      await this.exportJobRepo.save(job);
    } catch (error) {
      logError('Export job failed', error.stack, 'ExportService');
      job.status = ExportStatus.FAILED;
      job.error_message = error.message;
      await this.exportJobRepo.save(job);
    }
  }

  /**
   * Fetch data to export
   */
  private async fetchData(
    exportType: string,
    organizationId: string,
    filters: any,
    columns?: string[],
  ): Promise<any[]> {
    const where = { organization_id: organizationId, ...filters };
    const select = columns?.length 
      ? columns.reduce((acc, col) => ({ ...acc, [col]: true }), {}) 
      : undefined;

    switch (exportType.toLowerCase()) {
      case 'customer':
        return this.customerRepo.find({ where, select });
      case 'lead':
        return this.leadRepo.find({ where, select });
      case 'contact':
        return this.contactRepo.find({ where, select });
      case 'opportunity':
        return this.opportunityRepo.find({ where, select });
      default:
        throw new Error(`Unsupported export type: ${exportType}`);
    }
  }

  /**
   * Generate export file
   */
  private async generateFile(
    data: any[],
    format: ExportFormat,
    filePath: string,
    columns?: string[],
  ): Promise<void> {
    switch (format) {
      case ExportFormat.CSV:
        await this.generateCSV(data, filePath, columns);
        break;
      case ExportFormat.EXCEL:
        await this.generateExcel(data, filePath, columns);
        break;
      case ExportFormat.PDF:
        await this.generatePDF(data, filePath, columns);
        break;
      case ExportFormat.JSON:
        await this.generateJSON(data, filePath);
        break;
      default:
        throw new Error('Unsupported export format');
    }
  }

  /**
   * Generate CSV file
   */
  private async generateCSV(data: any[], filePath: string, columns?: string[]): Promise<void> {
    if (data.length === 0) {
      fs.writeFileSync(filePath, '');
      return;
    }

    const headers = columns || Object.keys(data[0]);
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: headers.map(key => ({ id: key, title: key })),
    });

    await csvWriter.writeRecords(data);
  }

  /**
   * Generate Excel file
   */
  private async generateExcel(data: any[], filePath: string, columns?: string[]): Promise<void> {
    const filteredData = columns
      ? data.map(row => {
          const filtered = {};
          columns.forEach(col => {
            if (row[col] !== undefined) filtered[col] = row[col];
          });
          return filtered;
        })
      : data;

    const worksheet = xlsx.utils.json_to_sheet(filteredData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Export');
    xlsx.writeFile(workbook, filePath);
  }

  /**
   * Generate PDF file
   */
  private async generatePDF(data: any[], filePath: string, columns?: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Title
      doc.fontSize(20).text('Export Data', { align: 'center' });
      doc.moveDown();

      // Table
      if (data.length > 0) {
        const headers = columns || Object.keys(data[0]);
        
        // Header row
        doc.fontSize(10).font('Helvetica-Bold');
        let x = 50;
        headers.forEach(header => {
          doc.text(header, x, doc.y, { width: 100, continued: true });
          x += 100;
        });
        doc.moveDown();

        // Data rows
        doc.font('Helvetica');
        data.forEach(row => {
          x = 50;
          headers.forEach(header => {
            const value = row[header]?.toString() || '';
            doc.text(value.substring(0, 20), x, doc.y, { width: 100, continued: true });
            x += 100;
          });
          doc.moveDown(0.5);
        });
      }

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }

  /**
   * Generate JSON file
   */
  private async generateJSON(data: any[], filePath: string): Promise<void> {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  /**
   * Get file extension for format
   */
  private getFileExtension(format: ExportFormat): string {
    const extensions = {
      [ExportFormat.CSV]: 'csv',
      [ExportFormat.EXCEL]: 'xlsx',
      [ExportFormat.PDF]: 'pdf',
      [ExportFormat.JSON]: 'json',
    };
    return extensions[format];
  }

  /**
   * Get export job
   */
  async getExportJob(jobId: string): Promise<ExportJob> {
    return this.exportJobRepo.findOne({ where: { id: jobId } });
  }

  /**
   * Download export file
   */
  async getExportFile(jobId: string): Promise<{ filePath: string; fileName: string; mimeType: string }> {
    const job = await this.getExportJob(jobId);
    if (!job || job.status !== ExportStatus.COMPLETED) {
      throw new Error('Export not ready');
    }

    const mimeTypes = {
      csv: 'text/csv',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pdf: 'application/pdf',
      json: 'application/json',
    };

    const ext = this.getFileExtension(job.format);

    return {
      filePath: job.file_path,
      fileName: job.file_name,
      mimeType: mimeTypes[ext],
    };
  }

  /**
   * List export jobs
   */
  async listExportJobs(organizationId: string, limit: number = 50): Promise<ExportJob[]> {
    return this.exportJobRepo.find({
      where: { organization_id: organizationId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * Clean up expired exports
   */
  async cleanupExpiredExports(): Promise<void> {
    const expiredJobs = await this.exportJobRepo.find({
      where: { status: ExportStatus.COMPLETED },
    });

    const now = new Date();
    for (const job of expiredJobs) {
      if (job.expires_at && job.expires_at < now) {
        // Delete file
        if (job.file_path && fs.existsSync(job.file_path)) {
          fs.unlinkSync(job.file_path);
        }
        // Delete job record
        await this.exportJobRepo.remove(job);
      }
    }
  }
}
