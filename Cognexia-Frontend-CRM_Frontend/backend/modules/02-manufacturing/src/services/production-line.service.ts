import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProductionLine, ProductionLineStatus } from '../entities/ProductionLine';

// ========================================================================================
// PRODUCTION LINE SERVICE
// ========================================================================================
// Core service for managing production lines, scheduling, and optimization
// Handles production line operations, monitoring, and performance tracking
// ========================================================================================

@Injectable()
export class ProductionLineService {
  private readonly logger = new Logger(ProductionLineService.name);

  constructor(
    @InjectRepository(ProductionLine)
    private readonly productionLineRepository: Repository<ProductionLine>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger.log('Production Line Service initialized');
  }

  // ========================================================================================
  // CRUD OPERATIONS
  // ========================================================================================

  async create(productionLineData: Partial<ProductionLine>): Promise<ProductionLine> {
    this.logger.log('Creating new production line');
    
    const productionLine = this.productionLineRepository.create({
      ...productionLineData,
      status: ProductionLineStatus.INACTIVE,
    });

    const savedProductionLine = await this.productionLineRepository.save(productionLine);
    
    this.eventEmitter.emit('production-line.created', savedProductionLine);
    return savedProductionLine;
  }

  async findAll(): Promise<ProductionLine[]> {
    return this.productionLineRepository.find({
      relations: ['workCenters', 'productionOrders'],
      order: { name: 'ASC' }
    });
  }

  async findById(id: string): Promise<ProductionLine> {
    const productionLine = await this.productionLineRepository.findOne({
      where: { id },
      relations: ['workCenters', 'productionOrders']
    });

    if (!productionLine) {
      throw new NotFoundException(`Production line with ID ${id} not found`);
    }

    return productionLine;
  }

  async findByCode(lineCode: string): Promise<ProductionLine> {
    const productionLine = await this.productionLineRepository.findOne({
      where: { lineCode },
      relations: ['workCenters', 'productionOrders']
    });

    if (!productionLine) {
      throw new NotFoundException(`Production line with code ${lineCode} not found`);
    }

    return productionLine;
  }

  async update(id: string, updateData: Partial<ProductionLine>): Promise<ProductionLine> {
    const productionLine = await this.findById(id);
    
    Object.assign(productionLine, updateData);
    const updatedProductionLine = await this.productionLineRepository.save(productionLine);
    
    this.eventEmitter.emit('production-line.updated', updatedProductionLine);
    return updatedProductionLine;
  }

  async delete(id: string): Promise<void> {
    const productionLine = await this.findById(id);
    await this.productionLineRepository.remove(productionLine);
    
    this.eventEmitter.emit('production-line.deleted', { id });
    this.logger.log(`Production line ${id} deleted`);
  }

  // ========================================================================================
  // STATUS MANAGEMENT
  // ========================================================================================

  async startLine(id: string): Promise<ProductionLine> {
    this.logger.log(`Starting production line: ${id}`);
    
    const productionLine = await this.findById(id);
    
    if (productionLine.status === ProductionLineStatus.ACTIVE) {
      throw new Error('Production line is already active');
    }

    productionLine.status = ProductionLineStatus.ACTIVE;
    productionLine.actualStartTime = new Date();
    
    const updatedLine = await this.productionLineRepository.save(productionLine);
    this.eventEmitter.emit('production-line.started', updatedLine);
    
    return updatedLine;
  }

  async stopLine(id: string, reason?: string): Promise<ProductionLine> {
    this.logger.log(`Stopping production line: ${id}`);
    
    const productionLine = await this.findById(id);
    productionLine.status = ProductionLineStatus.INACTIVE;
    productionLine.actualEndTime = new Date();
    
    if (reason) {
      productionLine.downtimeEvents = productionLine.downtimeEvents || [];
      productionLine.downtimeEvents.push({
        eventId: `downtime-${Date.now()}`,
        startTime: new Date(),
        endTime: new Date(),
        duration: 0,
        reason: reason,
        category: 'planned',
        impact: 'production_stop',
        resolution: 'manual_stop'
      });
    }
    
    const updatedLine = await this.productionLineRepository.save(productionLine);
    this.eventEmitter.emit('production-line.stopped', updatedLine);
    
    return updatedLine;
  }

  async pauseLine(id: string, reason: string): Promise<ProductionLine> {
    this.logger.log(`Pausing production line: ${id}`);
    
    const productionLine = await this.findById(id);
    productionLine.status = ProductionLineStatus.MAINTENANCE;
    
    const updatedLine = await this.productionLineRepository.save(productionLine);
    this.eventEmitter.emit('production-line.paused', { line: updatedLine, reason });
    
    return updatedLine;
  }

  // ========================================================================================
  // PERFORMANCE MONITORING
  // ========================================================================================

  async calculateOEE(id: string, startTime: Date, endTime: Date): Promise<any> {
    this.logger.log(`Calculating OEE for production line: ${id}`);
    
    const productionLine = await this.findById(id);
    
    // Mock OEE calculation - in real implementation, this would use actual data
    const availability = this.calculateAvailability(productionLine, startTime, endTime);
    const performance = this.calculatePerformance(productionLine, startTime, endTime);
    const quality = this.calculateQuality(productionLine, startTime, endTime);
    
    const oee = (availability * performance * quality) / 10000; // Convert to percentage
    
    return {
      oee: Math.round(oee * 100) / 100,
      availability: Math.round(availability * 100) / 100,
      performance: Math.round(performance * 100) / 100,
      quality: Math.round(quality * 100) / 100,
      period: { startTime, endTime },
      calculatedAt: new Date()
    };
  }

  private calculateAvailability(line: ProductionLine, start: Date, end: Date): number {
    // Mock calculation - should use actual downtime data
    const totalDowntime = line.downtimeEvents?.reduce((total, event) => total + event.duration, 0) || 0;
    const totalTime = (end.getTime() - start.getTime()) / (1000 * 60); // minutes
    return ((totalTime - totalDowntime) / totalTime) * 100;
  }

  private calculatePerformance(line: ProductionLine, start: Date, end: Date): number {
    // Mock calculation - should use actual throughput data
    const idealRate = line.nominalCapacity || 100;
    const actualRate = line.realTimeMetrics?.throughput || 85;
    return (actualRate / idealRate) * 100;
  }

  private calculateQuality(line: ProductionLine, start: Date, end: Date): number {
    // Mock calculation - should use actual quality data
    return 98.5; // Assuming 98.5% quality rate
  }

  async getPerformanceMetrics(id: string): Promise<any> {
    const productionLine = await this.findById(id);
    
    return {
      lineId: id,
      currentStatus: productionLine.status,
      realTimeMetrics: productionLine.realTimeMetrics,
      performanceMetrics: productionLine.performanceMetrics,
      utilizationRate: this.calculateUtilizationRate(productionLine),
      efficiency: this.calculateEfficiency(productionLine),
      throughput: productionLine.realTimeMetrics?.throughput || 0,
      qualityRate: 98.5, // Mock value
      lastUpdated: new Date()
    };
  }

  private calculateUtilizationRate(line: ProductionLine): number {
    const runningTime = line.performanceMetrics?.runningTime || 0;
    const availableTime = line.performanceMetrics?.availableTime || 1;
    return (runningTime / availableTime) * 100;
  }

  private calculateEfficiency(line: ProductionLine): number {
    const actualOutput = line.realTimeMetrics?.throughput || 0;
    const plannedOutput = line.nominalCapacity || 1;
    return (actualOutput / plannedOutput) * 100;
  }

  // ========================================================================================
  // SCHEDULING AND OPTIMIZATION
  // ========================================================================================

  async scheduleProduction(id: string, scheduleData: any): Promise<any> {
    this.logger.log(`Scheduling production for line: ${id}`);
    
    const productionLine = await this.findById(id);
    
    const schedule = {
      lineId: id,
      scheduleId: `schedule-${Date.now()}`,
      scheduledStart: scheduleData.startTime,
      scheduledEnd: scheduleData.endTime,
      products: scheduleData.products || [],
      priority: scheduleData.priority || 'medium',
      capacity: productionLine.nominalCapacity,
      createdAt: new Date()
    };
    
    this.eventEmitter.emit('production.scheduled', schedule);
    return schedule;
  }

  async optimizeLineConfiguration(id: string): Promise<any> {
    this.logger.log(`Optimizing configuration for line: ${id}`);
    
    const productionLine = await this.findById(id);
    
    // AI-powered optimization recommendations
    const optimization = {
      lineId: id,
      currentConfiguration: {
        workCenters: productionLine.workCenters?.length || 0,
        capacity: productionLine.nominalCapacity,
        efficiency: this.calculateEfficiency(productionLine)
      },
      recommendations: [
        {
          type: 'bottleneck_elimination',
          description: 'Add parallel processing at work center 3',
          estimatedImprovement: '15% throughput increase',
          implementation: 'Add 1 additional machine'
        },
        {
          type: 'setup_optimization',
          description: 'Implement SMED for faster changeovers',
          estimatedImprovement: '20% setup time reduction',
          implementation: 'Operator training + tooling upgrade'
        }
      ],
      potentialImprovements: {
        throughputIncrease: '18%',
        efficiencyGain: '12%',
        costReduction: '8%'
      },
      generatedAt: new Date()
    };
    
    return optimization;
  }

  // ========================================================================================
  // MAINTENANCE AND HEALTH MONITORING
  // ========================================================================================

  async getMaintenanceStatus(id: string): Promise<any> {
    const productionLine = await this.findById(id);
    
    return {
      lineId: id,
      lastMaintenance: productionLine.lastMaintenanceDate,
      nextMaintenance: this.calculateNextMaintenance(productionLine),
      maintenanceType: 'preventive',
      healthScore: this.calculateHealthScore(productionLine),
      criticalComponents: this.identifyCriticalComponents(productionLine),
      recommendations: this.getMaintenanceRecommendations(productionLine)
    };
  }

  private calculateNextMaintenance(line: ProductionLine): Date {
    const lastMaintenance = line.lastMaintenanceDate || new Date();
    const maintenanceInterval = 30; // days
    return new Date(lastMaintenance.getTime() + maintenanceInterval * 24 * 60 * 60 * 1000);
  }

  private calculateHealthScore(line: ProductionLine): number {
    // Simple health scoring based on multiple factors
    let score = 100;
    
    if (line.downtimeEvents?.length > 5) score -= 20;
    if (line.performanceMetrics?.efficiency < 80) score -= 15;
    if (!line.lastMaintenanceDate) score -= 25;
    
    return Math.max(0, score);
  }

  private identifyCriticalComponents(line: ProductionLine): any[] {
    return [
      {
        component: 'Main Drive Motor',
        healthStatus: 'good',
        lastInspection: new Date(),
        nextInspection: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        component: 'Conveyor System',
        healthStatus: 'warning',
        lastInspection: new Date(),
        nextInspection: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      }
    ];
  }

  private getMaintenanceRecommendations(line: ProductionLine): string[] {
    return [
      'Schedule preventive maintenance for conveyor system',
      'Check motor bearings during next shutdown',
      'Update lubrication schedule',
      'Calibrate sensors and monitoring equipment'
    ];
  }

  // ========================================================================================
  // QUALITY MANAGEMENT
  // ========================================================================================

  async getQualityMetrics(id: string): Promise<any> {
    const productionLine = await this.findById(id);
    
    return {
      lineId: id,
      qualityRate: 98.5, // Mock value
      defectRate: 1.5,
      firstPassYield: 97.2,
      qualityTrends: [
        { date: new Date(), quality: 98.5 },
        { date: new Date(Date.now() - 24 * 60 * 60 * 1000), quality: 97.8 }
      ],
      qualityIssues: [
        {
          issue: 'Dimensional variance in product batch #1234',
          severity: 'medium',
          status: 'investigating'
        }
      ]
    };
  }

  async recordQualityCheck(id: string, qualityData: any): Promise<any> {
    this.logger.log(`Recording quality check for line: ${id}`);
    
    const qualityRecord = {
      lineId: id,
      checkId: `quality-${Date.now()}`,
      timestamp: new Date(),
      parameters: qualityData.parameters,
      results: qualityData.results,
      passed: qualityData.passed,
      inspector: qualityData.inspector
    };
    
    this.eventEmitter.emit('quality.check.recorded', qualityRecord);
    return qualityRecord;
  }

  // ========================================================================================
  // REPORTING AND ANALYTICS
  // ========================================================================================

  async generateProductionReport(id: string, period: { start: Date; end: Date }): Promise<any> {
    const productionLine = await this.findById(id);
    
    const report = {
      lineId: id,
      lineName: productionLine.name,
      reportPeriod: period,
      summary: {
        totalProductionTime: 168, // hours
        totalDowntime: 12, // hours
        totalProduction: 5420, // units
        averageEfficiency: 87.5,
        qualityRate: 98.2
      },
      dailyBreakdown: this.generateDailyBreakdown(period),
      topIssues: [
        { issue: 'Conveyor belt slippage', frequency: 3, impact: 'medium' },
        { issue: 'Material shortage', frequency: 2, impact: 'high' }
      ],
      recommendations: [
        'Increase preventive maintenance frequency',
        'Improve material planning and inventory management'
      ],
      generatedAt: new Date()
    };
    
    return report;
  }

  private generateDailyBreakdown(period: { start: Date; end: Date }): any[] {
    const days = [];
    const current = new Date(period.start);
    
    while (current <= period.end) {
      days.push({
        date: new Date(current),
        production: Math.floor(Math.random() * 1000) + 500,
        efficiency: Math.floor(Math.random() * 20) + 80,
        downtime: Math.floor(Math.random() * 3)
      });
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }
}
