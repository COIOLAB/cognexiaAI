import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, interval, Subject } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { MessageEvent } from '@nestjs/common';
import { DigitalTwin, TwinType, TwinStatus, SimulationMode } from '../entities/DigitalTwin';
import { CreateDigitalTwinDto } from '../dto/create-digital-twin.dto';
import { UpdateDigitalTwinDto } from '../dto/update-digital-twin.dto';
import { DigitalTwinResponseDto } from '../dto/digital-twin-response.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class DigitalTwinService {
  private readonly logger = new Logger(DigitalTwinService.name);
  private readonly realTimeDataStreams = new Map<string, Subject<any>>();

  constructor(
    @InjectRepository(DigitalTwin)
    private readonly digitalTwinRepository: Repository<DigitalTwin>,
  ) {}

  async create(createDigitalTwinDto: CreateDigitalTwinDto): Promise<DigitalTwinResponseDto> {
    this.logger.log(`Creating digital twin: ${createDigitalTwinDto.twinCode}`);

    // Check if digital twin code already exists
    const existingTwin = await this.digitalTwinRepository.findOne({
      where: { twinCode: createDigitalTwinDto.twinCode },
    });

    if (existingTwin) {
      throw new ConflictException('Digital twin code already exists');
    }

    const digitalTwin = this.digitalTwinRepository.create(createDigitalTwinDto);
    const savedTwin = await this.digitalTwinRepository.save(digitalTwin);

    this.logger.log(`Digital twin created successfully: ${savedTwin.id}`);
    return this.mapToResponseDto(savedTwin);
  }

  async findAll(
    paginationDto: PaginationDto,
    filters: { search?: string; status?: string; type?: string },
  ): Promise<{ data: DigitalTwinResponseDto[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.digitalTwinRepository.createQueryBuilder('digitalTwin');

    // Apply filters
    if (filters.search) {
      queryBuilder.andWhere(
        '(digitalTwin.twinCode ILIKE :search OR digitalTwin.twinName ILIKE :search OR digitalTwin.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.status) {
      queryBuilder.andWhere('digitalTwin.status = :status', { status: filters.status });
    }

    if (filters.type) {
      queryBuilder.andWhere('digitalTwin.type = :type', { type: filters.type });
    }

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    // Order by creation date
    queryBuilder.orderBy('digitalTwin.createdAt', 'DESC');

    const [digitalTwins, total] = await queryBuilder.getManyAndCount();

    const data = digitalTwins.map(twin => this.mapToResponseDto(twin));

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<DigitalTwinResponseDto> {
    this.logger.log(`Retrieving digital twin: ${id}`);

    const digitalTwin = await this.digitalTwinRepository.findOne({
      where: { id },
    });

    if (!digitalTwin) {
      throw new NotFoundException('Digital twin not found');
    }

    return this.mapToResponseDto(digitalTwin);
  }

  async update(id: string, updateDigitalTwinDto: UpdateDigitalTwinDto): Promise<DigitalTwinResponseDto> {
    this.logger.log(`Updating digital twin: ${id}`);

    const digitalTwin = await this.digitalTwinRepository.findOne({ where: { id } });

    if (!digitalTwin) {
      throw new NotFoundException('Digital twin not found');
    }

    // Check if new code conflicts with existing digital twin
    if (updateDigitalTwinDto.twinCode && updateDigitalTwinDto.twinCode !== digitalTwin.twinCode) {
      const existingTwin = await this.digitalTwinRepository.findOne({
        where: { twinCode: updateDigitalTwinDto.twinCode },
      });

      if (existingTwin) {
        throw new ConflictException('Digital twin code already exists');
      }
    }

    Object.assign(digitalTwin, updateDigitalTwinDto);
    const updatedTwin = await this.digitalTwinRepository.save(digitalTwin);

    this.logger.log(`Digital twin updated successfully: ${id}`);
    return this.mapToResponseDto(updatedTwin);
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Deleting digital twin: ${id}`);

    const digitalTwin = await this.digitalTwinRepository.findOne({ where: { id } });

    if (!digitalTwin) {
      throw new NotFoundException('Digital twin not found');
    }

    // Stop any running simulations
    if (digitalTwin.status === TwinStatus.RUNNING) {
      await this.stopSimulation(id);
    }

    // Soft delete
    digitalTwin.status = TwinStatus.DECOMMISSIONED;
    await this.digitalTwinRepository.save(digitalTwin);

    // Clean up real-time streams
    this.cleanupRealTimeStream(id);

    this.logger.log(`Digital twin deleted successfully: ${id}`);
  }

  async startSimulation(id: string, simulationParams?: any): Promise<any> {
    this.logger.log(`Starting simulation for digital twin: ${id}`);

    const digitalTwin = await this.digitalTwinRepository.findOne({ where: { id } });

    if (!digitalTwin) {
      throw new NotFoundException('Digital twin not found');
    }

    if (digitalTwin.status === TwinStatus.RUNNING) {
      throw new ConflictException('Simulation is already running');
    }

    // Start simulation
    const simulationResult = digitalTwin.startSimulation(simulationParams);

    // Update status
    digitalTwin.status = TwinStatus.RUNNING;
    await this.digitalTwinRepository.save(digitalTwin);

    // Initialize real-time data stream
    this.initializeRealTimeStream(id);

    this.logger.log(`Simulation started successfully for digital twin: ${id}`);
    return simulationResult;
  }

  async stopSimulation(id: string): Promise<any> {
    this.logger.log(`Stopping simulation for digital twin: ${id}`);

    const digitalTwin = await this.digitalTwinRepository.findOne({ where: { id } });

    if (!digitalTwin) {
      throw new NotFoundException('Digital twin not found');
    }

    if (digitalTwin.status !== TwinStatus.RUNNING) {
      throw new ConflictException('No simulation is currently running');
    }

    // Stop simulation
    const stopResult = digitalTwin.stopSimulation();

    // Update status
    digitalTwin.status = TwinStatus.IDLE;
    await this.digitalTwinRepository.save(digitalTwin);

    // Stop real-time data stream
    this.cleanupRealTimeStream(id);

    this.logger.log(`Simulation stopped successfully for digital twin: ${id}`);
    return stopResult;
  }

  async synchronize(id: string): Promise<any> {
    this.logger.log(`Synchronizing digital twin: ${id}`);

    const digitalTwin = await this.digitalTwinRepository.findOne({ where: { id } });

    if (!digitalTwin) {
      throw new NotFoundException('Digital twin not found');
    }

    // Perform synchronization
    const syncResult = digitalTwin.synchronizeWithPhysical();

    // Update last sync time
    digitalTwin.realTimeSync.lastSyncTime = new Date();
    await this.digitalTwinRepository.save(digitalTwin);

    this.logger.log(`Synchronization completed for digital twin: ${id}`);
    return syncResult;
  }

  getRealTimeDataStream(id: string): Observable<MessageEvent> {
    this.logger.log(`Starting real-time data stream for digital twin: ${id}`);

    if (!this.realTimeDataStreams.has(id)) {
      this.initializeRealTimeStream(id);
    }

    const subject = this.realTimeDataStreams.get(id);

    return subject.asObservable().pipe(
      map(data => ({
        data: JSON.stringify(data),
        type: 'digital-twin-data',
        id: `${Date.now()}`,
      } as MessageEvent)),
      share(),
    );
  }

  async runPrediction(id: string, predictionParams: any): Promise<any> {
    this.logger.log(`Running prediction for digital twin: ${id}`);

    const digitalTwin = await this.digitalTwinRepository.findOne({ where: { id } });

    if (!digitalTwin) {
      throw new NotFoundException('Digital twin not found');
    }

    // Run AI prediction
    const predictionResult = digitalTwin.runPrediction(predictionParams);

    this.logger.log(`Prediction completed for digital twin: ${id}`);
    return predictionResult;
  }

  async runOptimization(id: string, optimizationParams: any): Promise<any> {
    this.logger.log(`Running optimization for digital twin: ${id}`);

    const digitalTwin = await this.digitalTwinRepository.findOne({ where: { id } });

    if (!digitalTwin) {
      throw new NotFoundException('Digital twin not found');
    }

    // Run optimization
    const optimizationResult = digitalTwin.runOptimization(optimizationParams);

    this.logger.log(`Optimization completed for digital twin: ${id}`);
    return optimizationResult;
  }

  async getAnalytics(id: string, period: string = 'weekly'): Promise<any> {
    this.logger.log(`Retrieving analytics for digital twin: ${id}`);

    const digitalTwin = await this.digitalTwinRepository.findOne({ where: { id } });

    if (!digitalTwin) {
      throw new NotFoundException('Digital twin not found');
    }

    const analytics = {
      twinId: id,
      period,
      performance: digitalTwin.performance,
      accuracy: digitalTwin.accuracy,
      utilizationMetrics: this.calculateUtilizationMetrics(digitalTwin),
      predictionAccuracy: this.calculatePredictionAccuracy(digitalTwin),
      simulationStats: this.getSimulationStatistics(digitalTwin),
      resourceUsage: this.calculateResourceUsage(digitalTwin),
      trends: this.calculateAnalyticsTrends(digitalTwin, period),
    };

    return analytics;
  }

  async enableQuantumComputing(id: string): Promise<any> {
    this.logger.log(`Enabling quantum computing for digital twin: ${id}`);

    const digitalTwin = await this.digitalTwinRepository.findOne({ where: { id } });

    if (!digitalTwin) {
      throw new NotFoundException('Digital twin not found');
    }

    // Enable quantum computing
    const quantumResult = digitalTwin.enableQuantumComputing();

    await this.digitalTwinRepository.save(digitalTwin);

    this.logger.log(`Quantum computing enabled for digital twin: ${id}`);
    return quantumResult;
  }

  async enableBlockchain(id: string): Promise<any> {
    this.logger.log(`Enabling blockchain for digital twin: ${id}`);

    const digitalTwin = await this.digitalTwinRepository.findOne({ where: { id } });

    if (!digitalTwin) {
      throw new NotFoundException('Digital twin not found');
    }

    // Enable blockchain
    const blockchainResult = digitalTwin.enableBlockchain();

    await this.digitalTwinRepository.save(digitalTwin);

    this.logger.log(`Blockchain enabled for digital twin: ${id}`);
    return blockchainResult;
  }

  async getHealthStatus(id: string): Promise<any> {
    this.logger.log(`Retrieving health status for digital twin: ${id}`);

    const digitalTwin = await this.digitalTwinRepository.findOne({ where: { id } });

    if (!digitalTwin) {
      throw new NotFoundException('Digital twin not found');
    }

    const healthStatus = {
      twinId: id,
      status: digitalTwin.status,
      lastSync: digitalTwin.realTimeSync?.lastSyncTime,
      performance: digitalTwin.performance,
      accuracy: digitalTwin.accuracy,
      resourceUtilization: this.calculateResourceUsage(digitalTwin),
      systemHealth: {
        cpu: this.generateMockSystemMetric(85),
        memory: this.generateMockSystemMetric(72),
        storage: this.generateMockSystemMetric(45),
        network: this.generateMockSystemMetric(90),
      },
      anomalies: this.detectAnomalies(digitalTwin),
      recommendations: this.generateHealthRecommendations(digitalTwin),
    };

    return healthStatus;
  }

  async runScenarioAnalysis(id: string, scenarioParams: any): Promise<any> {
    this.logger.log(`Running scenario analysis for digital twin: ${id}`);

    const digitalTwin = await this.digitalTwinRepository.findOne({ where: { id } });

    if (!digitalTwin) {
      throw new NotFoundException('Digital twin not found');
    }

    // Run scenario analysis
    const scenarioResult = digitalTwin.runScenarioAnalysis(scenarioParams);

    this.logger.log(`Scenario analysis completed for digital twin: ${id}`);
    return scenarioResult;
  }

  async getDigitalThread(id: string): Promise<any> {
    this.logger.log(`Retrieving digital thread for digital twin: ${id}`);

    const digitalTwin = await this.digitalTwinRepository.findOne({ where: { id } });

    if (!digitalTwin) {
      throw new NotFoundException('Digital twin not found');
    }

    const digitalThread = {
      twinId: id,
      threadData: digitalTwin.digitalThread,
      lifecycle: digitalTwin.lifecycle,
      traceability: this.generateTraceabilityData(digitalTwin),
      dependencies: this.mapDependencies(digitalTwin),
      version: digitalTwin.version,
      changelog: this.getChangeLog(digitalTwin),
    };

    return digitalThread;
  }

  async runSecurityValidation(id: string): Promise<any> {
    this.logger.log(`Running security validation for digital twin: ${id}`);

    const digitalTwin = await this.digitalTwinRepository.findOne({ where: { id } });

    if (!digitalTwin) {
      throw new NotFoundException('Digital twin not found');
    }

    // Run security validation
    const securityResult = digitalTwin.validateSecurity();

    this.logger.log(`Security validation completed for digital twin: ${id}`);
    return securityResult;
  }

  async generateReport(id: string, reportParams: any): Promise<any> {
    this.logger.log(`Generating report for digital twin: ${id}`);

    const digitalTwin = await this.digitalTwinRepository.findOne({ where: { id } });

    if (!digitalTwin) {
      throw new NotFoundException('Digital twin not found');
    }

    // Generate comprehensive report
    const report = digitalTwin.generateReport(reportParams);

    this.logger.log(`Report generated for digital twin: ${id}`);
    return report;
  }

  async clone(id: string, cloneData: { newCode: string; newName: string }): Promise<DigitalTwinResponseDto> {
    this.logger.log(`Cloning digital twin: ${id}`);

    const sourceDigitalTwin = await this.digitalTwinRepository.findOne({ where: { id } });

    if (!sourceDigitalTwin) {
      throw new NotFoundException('Source digital twin not found');
    }

    // Check if new code already exists
    const existingTwin = await this.digitalTwinRepository.findOne({
      where: { twinCode: cloneData.newCode },
    });

    if (existingTwin) {
      throw new ConflictException('Digital twin code already exists');
    }

    const clonedData = sourceDigitalTwin.clone(cloneData.newCode);
    clonedData.twinName = cloneData.newName;

    const clonedTwin = this.digitalTwinRepository.create(clonedData);
    const savedClone = await this.digitalTwinRepository.save(clonedTwin);

    this.logger.log(`Digital twin cloned successfully: ${savedClone.id}`);
    return this.mapToResponseDto(savedClone);
  }

  async getPerformanceMetrics(id: string, startDate?: string, endDate?: string): Promise<any> {
    this.logger.log(`Retrieving performance metrics for digital twin: ${id}`);

    const digitalTwin = await this.digitalTwinRepository.findOne({ where: { id } });

    if (!digitalTwin) {
      throw new NotFoundException('Digital twin not found');
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const performanceMetrics = {
      twinId: id,
      period: { startDate: start, endDate: end },
      performance: digitalTwin.performance,
      accuracy: digitalTwin.accuracy,
      throughput: this.calculateThroughput(digitalTwin),
      latency: this.calculateLatency(digitalTwin),
      reliability: this.calculateReliability(digitalTwin),
      scalability: this.calculateScalability(digitalTwin),
      trends: this.calculatePerformanceTrends(digitalTwin, start, end),
    };

    return performanceMetrics;
  }

  async updateDigitalModel(id: string, modelData: any): Promise<any> {
    this.logger.log(`Updating digital model for digital twin: ${id}`);

    const digitalTwin = await this.digitalTwinRepository.findOne({ where: { id } });

    if (!digitalTwin) {
      throw new NotFoundException('Digital twin not found');
    }

    // Update digital model
    const updateResult = digitalTwin.updateDigitalModel(modelData);

    // Save changes
    await this.digitalTwinRepository.save(digitalTwin);

    this.logger.log(`Digital model updated for digital twin: ${id}`);
    return updateResult;
  }

  private initializeRealTimeStream(id: string): void {
    if (this.realTimeDataStreams.has(id)) {
      return;
    }

    const subject = new Subject<any>();
    this.realTimeDataStreams.set(id, subject);

    // Simulate real-time data
    const subscription = interval(1000).subscribe(() => {
      const data = this.generateRealTimeData(id);
      subject.next(data);
    });

    // Store subscription for cleanup
    subject['subscription'] = subscription;
  }

  private cleanupRealTimeStream(id: string): void {
    const subject = this.realTimeDataStreams.get(id);
    if (subject) {
      if (subject['subscription']) {
        subject['subscription'].unsubscribe();
      }
      subject.complete();
      this.realTimeDataStreams.delete(id);
    }
  }

  private generateRealTimeData(id: string): any {
    return {
      twinId: id,
      timestamp: new Date(),
      data: {
        temperature: 20 + Math.random() * 10,
        pressure: 100 + Math.random() * 50,
        vibration: Math.random() * 5,
        efficiency: 0.85 + Math.random() * 0.1,
        throughput: 100 + Math.random() * 20,
        quality: 0.95 + Math.random() * 0.05,
        energy: 50 + Math.random() * 30,
      },
    };
  }

  private mapToResponseDto(digitalTwin: DigitalTwin): DigitalTwinResponseDto {
    return {
      id: digitalTwin.id,
      twinCode: digitalTwin.twinCode,
      twinName: digitalTwin.twinName,
      description: digitalTwin.description,
      type: digitalTwin.type,
      status: digitalTwin.status,
      physicalAsset: digitalTwin.physicalAsset,
      digitalModel: digitalTwin.digitalModel,
      dataSources: digitalTwin.dataSources,
      realTimeSync: digitalTwin.realTimeSync,
      aiIntegration: digitalTwin.aiIntegration,
      performance: digitalTwin.performance,
      accuracy: digitalTwin.accuracy,
      simulationParameters: digitalTwin.simulationParameters,
      physicsModels: digitalTwin.physicsModels,
      analytics: digitalTwin.analytics,
      digitalThread: digitalTwin.digitalThread,
      lifecycle: digitalTwin.lifecycle,
      resourceManagement: digitalTwin.resourceManagement,
      quantumComputingEnabled: digitalTwin.quantumComputingEnabled,
      blockchainEnabled: digitalTwin.blockchainEnabled,
      cybersecuritySettings: digitalTwin.cybersecuritySettings,
      createdAt: digitalTwin.createdAt,
      updatedAt: digitalTwin.updatedAt,
    };
  }

  // Helper methods for calculations
  private calculateUtilizationMetrics(digitalTwin: DigitalTwin): any {
    return {
      cpu: 75 + Math.random() * 20,
      memory: 60 + Math.random() * 25,
      storage: 40 + Math.random() * 30,
      network: 80 + Math.random() * 15,
    };
  }

  private calculatePredictionAccuracy(digitalTwin: DigitalTwin): number {
    return digitalTwin.accuracy || 0.92 + Math.random() * 0.05;
  }

  private getSimulationStatistics(digitalTwin: DigitalTwin): any {
    return {
      totalRuns: 150 + Math.floor(Math.random() * 100),
      averageRuntime: 120 + Math.random() * 60,
      successRate: 0.95 + Math.random() * 0.04,
      lastRun: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
    };
  }

  private calculateResourceUsage(digitalTwin: DigitalTwin): any {
    return {
      computational: 70 + Math.random() * 20,
      storage: 45 + Math.random() * 30,
      bandwidth: 85 + Math.random() * 10,
      energy: 60 + Math.random() * 25,
    };
  }

  private calculateAnalyticsTrends(digitalTwin: DigitalTwin, period: string): any {
    return {
      performance: 'improving',
      accuracy: 'stable',
      efficiency: 'improving',
      utilization: 'stable',
    };
  }

  private generateMockSystemMetric(base: number): any {
    return {
      current: base + Math.random() * 10 - 5,
      average: base,
      peak: base + 10 + Math.random() * 5,
      trend: Math.random() > 0.5 ? 'improving' : 'stable',
    };
  }

  private detectAnomalies(digitalTwin: DigitalTwin): any[] {
    const anomalies = [];
    if (Math.random() > 0.8) {
      anomalies.push({
        type: 'performance_degradation',
        severity: 'medium',
        description: 'Performance has decreased by 5% over the last hour',
        timestamp: new Date(),
      });
    }
    return anomalies;
  }

  private generateHealthRecommendations(digitalTwin: DigitalTwin): string[] {
    return [
      'Consider optimizing simulation parameters for better performance',
      'Regular synchronization with physical asset recommended',
      'Monitor resource utilization trends',
    ];
  }

  private generateTraceabilityData(digitalTwin: DigitalTwin): any {
    return {
      origin: 'Manufacturing Line A',
      created: digitalTwin.createdAt,
      modifications: [],
      dependencies: [],
      dataLineage: [],
    };
  }

  private mapDependencies(digitalTwin: DigitalTwin): any[] {
    return [
      { type: 'physical_asset', id: 'PA-001', name: 'Production Line 1' },
      { type: 'data_source', id: 'DS-001', name: 'Sensor Network' },
      { type: 'ai_model', id: 'AI-001', name: 'Predictive Model' },
    ];
  }

  private getChangeLog(digitalTwin: DigitalTwin): any[] {
    return [
      {
        version: '1.0.0',
        date: digitalTwin.createdAt,
        changes: ['Initial creation'],
        author: 'System',
      },
    ];
  }

  private calculateThroughput(digitalTwin: DigitalTwin): number {
    return 100 + Math.random() * 50; // Simulations per hour
  }

  private calculateLatency(digitalTwin: DigitalTwin): number {
    return 50 + Math.random() * 30; // Milliseconds
  }

  private calculateReliability(digitalTwin: DigitalTwin): number {
    return 0.98 + Math.random() * 0.02; // Percentage
  }

  private calculateScalability(digitalTwin: DigitalTwin): any {
    return {
      current: 100,
      maximum: 1000,
      utilization: 0.1 + Math.random() * 0.3,
    };
  }

  private calculatePerformanceTrends(digitalTwin: DigitalTwin, startDate: Date, endDate: Date): any[] {
    const trends = [];
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      trends.push({
        date,
        performance: 0.85 + Math.random() * 0.1,
        accuracy: 0.90 + Math.random() * 0.08,
        throughput: 90 + Math.random() * 20,
        latency: 40 + Math.random() * 20,
      });
    }

    return trends;
  }
}
