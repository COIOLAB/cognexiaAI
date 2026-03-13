import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Between, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventBusService } from '@industry5/shared';
import { IoTDevice, DeviceType, DeviceStatus } from '../entities/iot-device.entity';
import { Gateway, GatewayType, GatewayStatus } from '../entities/gateway.entity';
import { DeviceAlert, AlertType, AlertSeverity } from '../entities/device-alert.entity';
import { DeviceCommand, CommandType, CommandStatus } from '../entities/device-command.entity';
import { SensorReading } from '../entities/sensor-reading.entity';
import { CreateDeviceDto, UpdateDeviceDto } from '../dto/device.dto';
import { CreateGatewayDto, UpdateGatewayDto } from '../dto/gateway.dto';
import { SensorReadingDto } from '../dto/sensor-reading.dto';
import { CommandExecutionDto } from '../dto/command.dto';
import { Cron } from '@nestjs/schedule';

export interface IoTDashboardStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  healthyDevices: number;
  criticalDevices: number;
  totalGateways: number;
  activeGateways: number;
  totalDataToday: number; // MB
  alertsToday: number;
  commandsExecutedToday: number;
  aiPredictionsToday: number;
  quantumProcessingToday: number;
  edgeComputingTasks: number;
}

export interface DeviceHealthReport {
  deviceId: string;
  deviceName: string;
  overallHealth: string;
  batteryLevel?: number;
  signalStrength?: number;
  lastSeen: Date;
  issues: string[];
  recommendations: string[];
  predictedFailureDate?: Date;
  maintenanceScore: number;
}

export interface EdgeAnalyticsResult {
  deviceId: string;
  analysisType: string;
  result: any;
  confidence: number;
  processedAt: Date;
  processingTime: number;
}

@Injectable()
export class IoTService {
  private readonly logger = new Logger(IoTService.name);

  constructor(
    @InjectRepository(IoTDevice)
    private deviceRepository: Repository<IoTDevice>,
    @InjectRepository(Gateway)
    private gatewayRepository: Repository<Gateway>,
    @InjectRepository(DeviceAlert)
    private alertRepository: Repository<DeviceAlert>,
    @InjectRepository(DeviceCommand)
    private commandRepository: Repository<DeviceCommand>,
    @InjectRepository(SensorReading)
    private sensorReadingRepository: Repository<SensorReading>,
    private configService: ConfigService,
    private eventBus: EventBusService
  ) {
    this.logger.log('IoT Service initialized with Industry 5.0 capabilities');
  }

  // ========== Device Management ==========

  async getDevices(filters?: {
    type?: DeviceType;
    status?: DeviceStatus;
    location?: string;
    gatewayId?: string;
    hasAI?: boolean;
    hasQuantum?: boolean;
    page?: number;
    limit?: number;
  }): Promise<IoTDevice[]> {
    const queryBuilder = this.deviceRepository.createQueryBuilder('device')
      .leftJoinAndSelect('device.gateway', 'gateway');

    if (filters) {
      if (filters.type) {
        queryBuilder.andWhere('device.type = :type', { type: filters.type });
      }
      if (filters.status) {
        queryBuilder.andWhere('device.status = :status', { status: filters.status });
      }
      if (filters.location) {
        queryBuilder.andWhere('device.location ILIKE :location', { location: `%${filters.location}%` });
      }
      if (filters.gatewayId) {
        queryBuilder.andWhere('device.gatewayId = :gatewayId', { gatewayId: filters.gatewayId });
      }
      if (filters.hasAI !== undefined) {
        queryBuilder.andWhere('device.capabilities->>"hasAI" = :hasAI', { hasAI: filters.hasAI.toString() });
      }
      if (filters.hasQuantum !== undefined) {
        queryBuilder.andWhere('device.capabilities->>"hasQuantumSensing" = :hasQuantum', { hasQuantum: filters.hasQuantum.toString() });
      }
    }

    if (filters?.page && filters?.limit) {
      queryBuilder.skip((filters.page - 1) * filters.limit).take(filters.limit);
    }

    const devices = await queryBuilder.getMany();
    
    // Emit analytics event
    await this.eventBus.emitAnalytics('iot-service', {
      action: 'devices_retrieved',
      count: devices.length,
      filters
    });

    return devices;
  }

  async getDeviceById(id: string): Promise<IoTDevice> {
    const device = await this.deviceRepository.findOne({
      where: { id },
      relations: ['gateway', 'alerts', 'commands']
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    // Update last seen if device is being accessed
    device.updateLastSeen();
    await this.deviceRepository.save(device);

    return device;
  }

  async createDevice(createDeviceDto: CreateDeviceDto): Promise<IoTDevice> {
    // Validate gateway if specified
    if (createDeviceDto.gatewayId) {
      const gateway = await this.gatewayRepository.findOne({
        where: { id: createDeviceDto.gatewayId }
      });
      
      if (!gateway) {
        throw new BadRequestException(`Gateway with ID ${createDeviceDto.gatewayId} not found`);
      }
      
      if (!gateway.canAcceptNewDevice()) {
        throw new BadRequestException('Gateway cannot accept new devices');
      }
    }

    const device = this.deviceRepository.create({
      ...createDeviceDto,
      // Set default capabilities if not provided
      capabilities: {
        hasAI: false,
        hasEdgeComputing: false,
        hasQuantumSensing: false,
        hasBlockchainWallet: false,
        supportsMachineLearning: false,
        hasComputerVision: false,
        hasNaturalLanguageProcessing: false,
        hasDigitalTwin: false,
        canLearn: false,
        hasAutonomousMode: false,
        ...createDeviceDto.capabilities
      },
      // Set default security configuration
      securityConfiguration: {
        encryption: {
          algorithm: 'AES-256-GCM',
          keyLength: 256,
          quantumResistant: false
        },
        authentication: {
          method: 'certificate',
          certificateAuth: true,
          biometricAuth: false,
          blockchainAuth: false
        },
        networkSecurity: {
          vpnEnabled: true,
          firewallEnabled: true,
          intrusionDetection: true,
          zeroTrustEnabled: false
        },
        ...createDeviceDto.securityConfiguration
      }
    });

    const savedDevice = await this.deviceRepository.save(device);

    // Update gateway device count
    if (savedDevice.gatewayId) {
      await this.updateGatewayDeviceCount(savedDevice.gatewayId, 1);
    }

    // Emit device creation event
    await this.eventBus.emitIoTDeviceEvent(savedDevice.id, {
      action: 'device_created',
      deviceType: savedDevice.type,
      location: savedDevice.location
    });

    this.logger.log(`Created new IoT device: ${savedDevice.name} (${savedDevice.id})`);
    return savedDevice;
  }

  async updateDevice(id: string, updateDeviceDto: UpdateDeviceDto): Promise<IoTDevice> {
    const device = await this.getDeviceById(id);
    
    // Handle gateway change
    const oldGatewayId = device.gatewayId;
    if (updateDeviceDto.gatewayId && updateDeviceDto.gatewayId !== oldGatewayId) {
      const newGateway = await this.gatewayRepository.findOne({
        where: { id: updateDeviceDto.gatewayId }
      });
      
      if (!newGateway?.canAcceptNewDevice()) {
        throw new BadRequestException('New gateway cannot accept devices');
      }
    }

    Object.assign(device, updateDeviceDto);
    const updatedDevice = await this.deviceRepository.save(device);

    // Update gateway device counts
    if (oldGatewayId && oldGatewayId !== updatedDevice.gatewayId) {
      await this.updateGatewayDeviceCount(oldGatewayId, -1);
    }
    if (updatedDevice.gatewayId && updatedDevice.gatewayId !== oldGatewayId) {
      await this.updateGatewayDeviceCount(updatedDevice.gatewayId, 1);
    }

    await this.eventBus.emitIoTDeviceEvent(updatedDevice.id, {
      action: 'device_updated',
      changes: Object.keys(updateDeviceDto)
    });

    return updatedDevice;
  }

  async deleteDevice(id: string): Promise<void> {
    const device = await this.getDeviceById(id);
    
    // Update gateway device count
    if (device.gatewayId) {
      await this.updateGatewayDeviceCount(device.gatewayId, -1);
    }

    await this.deviceRepository.remove(device);

    await this.eventBus.emitIoTDeviceEvent(id, {
      action: 'device_deleted',
      deviceName: device.name
    });

    this.logger.log(`Deleted IoT device: ${device.name} (${id})`);
  }

  // ========== Gateway Management ==========

  async getGateways(filters?: {
    type?: GatewayType;
    status?: GatewayStatus;
    location?: string;
    hasAI?: boolean;
    hasQuantum?: boolean;
  }): Promise<Gateway[]> {
    const queryBuilder = this.gatewayRepository.createQueryBuilder('gateway')
      .leftJoinAndSelect('gateway.devices', 'devices');

    if (filters) {
      if (filters.type) {
        queryBuilder.andWhere('gateway.type = :type', { type: filters.type });
      }
      if (filters.status) {
        queryBuilder.andWhere('gateway.status = :status', { status: filters.status });
      }
      if (filters.location) {
        queryBuilder.andWhere('gateway.location ILIKE :location', { location: `%${filters.location}%` });
      }
      if (filters.hasAI !== undefined) {
        queryBuilder.andWhere('gateway.hasAICapabilities = :hasAI', { hasAI: filters.hasAI });
      }
      if (filters.hasQuantum !== undefined) {
        queryBuilder.andWhere('gateway.hasQuantumCapabilities = :hasQuantum', { hasQuantum: filters.hasQuantum });
      }
    }

    return queryBuilder.getMany();
  }

  async createGateway(createGatewayDto: CreateGatewayDto): Promise<Gateway> {
    const gateway = this.gatewayRepository.create({
      ...createGatewayDto,
      // Set default edge capabilities
      edgeCapabilities: {
        hasAIProcessing: false,
        hasMLInference: false,
        hasDataPreprocessing: true,
        hasRealTimeAnalytics: false,
        hasLocalStorage: true,
        hasComputeOffloading: false,
        maxConcurrentTasks: 10,
        processingPower: 1000000, // 1 MFLOPS default
        storageCapacity: 32, // 32GB default
        memoryCapacity: 8, // 8GB default
        ...createGatewayDto.edgeCapabilities
      },
      // Set default network configuration
      networkConfig: {
        maxDevices: 100,
        supportedProtocols: ['MQTT', 'CoAP', 'HTTP'],
        dataRateLimit: 100, // 100 Mbps
        latencyOptimized: false,
        qosLevels: ['0', '1', '2'],
        loadBalancingEnabled: false,
        networkTopology: 'star',
        ...createGatewayDto.networkConfig
      }
    });

    const savedGateway = await this.gatewayRepository.save(gateway);

    await this.eventBus.emitIoTGatewayEvent(savedGateway.id, {
      action: 'gateway_created',
      gatewayType: savedGateway.type,
      location: savedGateway.location
    });

    this.logger.log(`Created new IoT gateway: ${savedGateway.name} (${savedGateway.id})`);
    return savedGateway;
  }

  // ========== Sensor Data Management ==========

  async getSensorReadings(filters: {
    deviceId?: string;
    sensorType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    includeAIAnalysis?: boolean;
  }): Promise<SensorReading[]> {
    const queryBuilder = this.sensorReadingRepository.createQueryBuilder('reading')
      .leftJoinAndSelect('reading.device', 'device')
      .orderBy('reading.timestamp', 'DESC');

    if (filters.deviceId) {
      queryBuilder.andWhere('reading.deviceId = :deviceId', { deviceId: filters.deviceId });
    }
    if (filters.sensorType) {
      queryBuilder.andWhere('reading.sensorType = :sensorType', { sensorType: filters.sensorType });
    }
    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('reading.timestamp BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate
      });
    }
    if (filters.includeAIAnalysis === false) {
      queryBuilder.andWhere('reading.aiAnalysis IS NULL');
    }
    if (filters.limit) {
      queryBuilder.take(filters.limit);
    }

    return queryBuilder.getMany();
  }

  async recordReading(sensorReadingDto: SensorReadingDto): Promise<SensorReading> {
    // Validate device exists and is active
    const device = await this.deviceRepository.findOne({
      where: { id: sensorReadingDto.deviceId, isActive: true }
    });

    if (!device) {
      throw new BadRequestException('Device not found or inactive');
    }

    const reading = this.sensorReadingRepository.create(sensorReadingDto);
    const savedReading = await this.sensorReadingRepository.save(reading);

    // Update device statistics
    device.recordDataPoint();
    await this.deviceRepository.save(device);

    // Process reading with AI if device has AI capabilities
    if (device.hasAICapabilities()) {
      this.processReadingWithAI(savedReading);
    }

    // Check for anomalies and create alerts if necessary
    await this.checkForAnomalies(savedReading);

    // Emit real-time data event
    await this.eventBus.emitIoTDataEvent(device.id, {
      sensorType: savedReading.sensorType,
      value: savedReading.value,
      unit: savedReading.unit,
      timestamp: savedReading.timestamp
    });

    return savedReading;
  }

  // ========== Command Execution ==========

  async executeCommand(commandDto: CommandExecutionDto): Promise<DeviceCommand> {
    const device = await this.getDeviceById(commandDto.deviceId);
    
    if (!device.isOnline()) {
      throw new BadRequestException('Device is not online');
    }

    const command = this.commandRepository.create({
      ...commandDto,
      status: CommandStatus.PENDING
    });

    const savedCommand = await this.commandRepository.save(command);

    // Queue command for execution
    await this.queueCommandForExecution(savedCommand);

    await this.eventBus.emitIoTCommandEvent(device.id, {
      commandType: savedCommand.commandType,
      commandId: savedCommand.id,
      priority: savedCommand.priority
    });

    return savedCommand;
  }

  async getDeviceCommands(deviceId: string, status?: CommandStatus): Promise<DeviceCommand[]> {
    const query: any = { deviceId };
    if (status) {
      query.status = status;
    }

    return this.commandRepository.find({
      where: query,
      order: { createdAt: 'DESC' }
    });
  }

  // ========== Alert Management ==========

  async getAlerts(filters: {
    deviceId?: string;
    alertType?: AlertType;
    severity?: AlertSeverity;
    startDate?: Date;
    endDate?: Date;
    isResolved?: boolean;
  }): Promise<DeviceAlert[]> {
    const queryBuilder = this.alertRepository.createQueryBuilder('alert')
      .leftJoinAndSelect('alert.device', 'device')
      .orderBy('alert.createdAt', 'DESC');

    if (filters.deviceId) {
      queryBuilder.andWhere('alert.deviceId = :deviceId', { deviceId: filters.deviceId });
    }
    if (filters.alertType) {
      queryBuilder.andWhere('alert.alertType = :alertType', { alertType: filters.alertType });
    }
    if (filters.severity) {
      queryBuilder.andWhere('alert.severity = :severity', { severity: filters.severity });
    }
    if (filters.isResolved !== undefined) {
      queryBuilder.andWhere('alert.isResolved = :isResolved', { isResolved: filters.isResolved });
    }
    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('alert.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate
      });
    }

    return queryBuilder.getMany();
  }

  // ========== Analytics and Insights ==========

  async getDashboardStats(): Promise<IoTDashboardStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [devices, gateways, alerts, commands, readings] = await Promise.all([
      this.deviceRepository.find(),
      this.gatewayRepository.find(),
      this.alertRepository.count({ where: { createdAt: Between(today, tomorrow) } }),
      this.commandRepository.count({ 
        where: { 
          completedAt: Between(today, tomorrow),
          status: CommandStatus.COMPLETED
        }
      }),
      this.sensorReadingRepository.count({ where: { createdAt: Between(today, tomorrow) } })
    ]);

    const onlineDevices = devices.filter(d => d.isOnline()).length;
    const healthyDevices = devices.filter(d => d.isHealthy()).length;
    const criticalDevices = devices.filter(d => d.getDeviceHealth().overall === 'critical').length;
    const activeGateways = gateways.filter(g => g.isOnline()).length;

    // Calculate total data processed today (approximate)
    const totalDataToday = devices.reduce((sum, device) => sum + (device.dataPointsCollected * 0.001), 0);
    const aiPredictionsToday = devices.filter(d => d.hasAICapabilities()).length * 10; // Approximation
    const quantumProcessingToday = devices.filter(d => d.hasQuantumCapabilities()).length * 5; // Approximation
    const edgeComputingTasks = gateways.filter(g => g.supportsEdgeComputing).length * 20; // Approximation

    return {
      totalDevices: devices.length,
      onlineDevices,
      offlineDevices: devices.length - onlineDevices,
      healthyDevices,
      criticalDevices,
      totalGateways: gateways.length,
      activeGateways,
      totalDataToday,
      alertsToday: alerts,
      commandsExecutedToday: commands,
      aiPredictionsToday,
      quantumProcessingToday,
      edgeComputingTasks
    };
  }

  async getDeviceHealthReport(deviceId: string): Promise<DeviceHealthReport> {
    const device = await this.getDeviceById(deviceId);
    const health = device.getDeviceHealth();
    const recentAlerts = await this.alertRepository.find({
      where: { deviceId, isResolved: false },
      take: 5,
      order: { createdAt: 'DESC' }
    });

    const issues = recentAlerts.map(alert => alert.message);
    const recommendations = this.generateRecommendations(device, health);
    const predictedFailureDate = await this.predictDeviceFailure(device);
    const maintenanceScore = this.calculateMaintenanceScore(device, health);

    return {
      deviceId: device.id,
      deviceName: device.name,
      overallHealth: health.overall,
      batteryLevel: device.batteryLevel,
      signalStrength: device.signalStrength,
      lastSeen: device.lastSeen!,
      issues,
      recommendations,
      predictedFailureDate,
      maintenanceScore
    };
  }

  // ========== AI and Machine Learning ==========

  private async processReadingWithAI(reading: SensorReading): Promise<void> {
    try {
      // Simulate AI processing
      const aiAnalysis = {
        confidence: 0.85 + Math.random() * 0.15,
        anomalyScore: Math.random() * 0.3,
        predictedValue: reading.value * (0.95 + Math.random() * 0.1),
        classification: reading.value > 50 ? 'high' : 'normal',
        modelVersion: 'v1.2.0',
        processingTime: 15 + Math.random() * 10,
        features: {
          trend: Math.random() - 0.5,
          volatility: Math.random() * 0.2,
          correlation: Math.random()
        }
      };

      reading.markAsAIProcessed(aiAnalysis);
      await this.sensorReadingRepository.save(reading);

      this.logger.debug(`AI processed reading ${reading.id} with confidence ${aiAnalysis.confidence}`);
    } catch (error) {
      this.logger.error(`Failed to process reading ${reading.id} with AI:`, error);
    }
  }

  private async checkForAnomalies(reading: SensorReading): Promise<void> {
    // Simple anomaly detection logic
    const recentReadings = await this.sensorReadingRepository.find({
      where: {
        deviceId: reading.deviceId,
        sensorType: reading.sensorType
      },
      order: { timestamp: 'DESC' },
      take: 10
    });

    if (recentReadings.length < 5) return; // Not enough data

    const values = recentReadings.map(r => r.value);
    const mean = values.reduce((a, b) => a + b) / values.length;
    const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);
    const threshold = 2.5; // 2.5 standard deviations

    if (Math.abs(reading.value - mean) > threshold * stdDev) {
      reading.markAsAnomaly('Statistical anomaly detected');
      await this.sensorReadingRepository.save(reading);

      // Create alert
      await this.createAlert(reading.deviceId, AlertType.ANOMALY_DETECTED, {
        message: `Anomalous ${reading.sensorType} reading: ${reading.value} ${reading.unit}`,
        severity: AlertSeverity.HIGH,
        data: { reading: reading.id, deviation: Math.abs(reading.value - mean) / stdDev }
      });
    }
  }

  // ========== Private Helper Methods ==========

  private async queueCommandForExecution(command: DeviceCommand): Promise<void> {
    // Simulate command queuing and execution
    setTimeout(async () => {
      try {
        command.markAsStarted();
        await this.commandRepository.save(command);

        // Simulate command execution time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        const result = {
          success: Math.random() > 0.1, // 90% success rate
          data: { response: 'Command executed successfully' },
          executionTime: 1000 + Math.random() * 2000,
          resourcesUsed: {
            cpu: Math.random() * 20,
            memory: Math.random() * 50,
            network: Math.random() * 10
          }
        };

        if (result.success) {
          command.markAsCompleted(result);
        } else {
          command.markAsFailed('Execution failed');
        }

        await this.commandRepository.save(command);

        // Update device statistics
        const device = await this.deviceRepository.findOne({ where: { id: command.deviceId } });
        if (device) {
          device.executeCommand();
          await this.deviceRepository.save(device);
        }
      } catch (error) {
        command.markAsFailed(error.message);
        await this.commandRepository.save(command);
      }
    }, 100); // Small delay to simulate queuing
  }

  private async updateGatewayDeviceCount(gatewayId: string, delta: number): Promise<void> {
    const gateway = await this.gatewayRepository.findOne({ where: { id: gatewayId } });
    if (gateway) {
      if (delta > 0) {
        gateway.addDevice();
      } else {
        gateway.removeDevice();
      }
      await this.gatewayRepository.save(gateway);
    }
  }

  private async createAlert(deviceId: string, alertType: AlertType, alertData: any): Promise<DeviceAlert> {
    const alert = this.alertRepository.create({
      deviceId,
      alertType,
      ...alertData
    });

    const savedAlert = await this.alertRepository.save(alert);

    // Update device alert count
    const device = await this.deviceRepository.findOne({ where: { id: deviceId } });
    if (device) {
      device.generateAlert();
      await this.deviceRepository.save(device);
    }

    await this.eventBus.emitAlert(deviceId, {
      alertType,
      severity: alertData.severity,
      message: alertData.message
    });

    return savedAlert;
  }

  private generateRecommendations(device: IoTDevice, health: any): string[] {
    const recommendations: string[] = [];

    if (device.hasLowBattery()) {
      recommendations.push('Replace or recharge battery');
    }
    if (device.hasWeakSignal()) {
      recommendations.push('Check network connectivity or move closer to gateway');
    }
    if (device.needsMaintenance()) {
      recommendations.push('Schedule preventive maintenance');
    }
    if (health.overall === 'poor' || health.overall === 'critical') {
      recommendations.push('Perform comprehensive device diagnostics');
    }
    if (!device.isOnline()) {
      recommendations.push('Investigate device connectivity issues');
    }

    return recommendations;
  }

  private async predictDeviceFailure(device: IoTDevice): Promise<Date | undefined> {
    // Simplified failure prediction based on device health factors
    const health = device.getDeviceHealth();
    
    if (health.overall === 'critical') {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    } else if (health.overall === 'poor') {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    } else if (health.overall === 'fair') {
      return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
    }

    return undefined; // No failure predicted
  }

  private calculateMaintenanceScore(device: IoTDevice, health: any): number {
    let score = 100;

    if (device.hasLowBattery()) score -= 20;
    if (device.hasWeakSignal()) score -= 15;
    if (device.needsMaintenance()) score -= 25;
    if (health.overall === 'poor') score -= 20;
    if (health.overall === 'critical') score -= 40;
    if (!device.isOnline()) score -= 30;

    return Math.max(0, score);
  }

  // ========== Scheduled Tasks ==========

  @Cron('0 */5 * * * *') // Every 5 minutes
  private async performHealthChecks(): Promise<void> {
    try {
      const devices = await this.deviceRepository.find({ where: { isActive: true } });
      
      for (const device of devices) {
        // Check if device hasn't been seen recently
        if (device.lastSeen && (Date.now() - device.lastSeen.getTime()) > 10 * 60 * 1000) { // 10 minutes
          if (device.status !== DeviceStatus.OFFLINE) {
            device.status = DeviceStatus.OFFLINE;
            await this.deviceRepository.save(device);
            
            await this.createAlert(device.id, AlertType.DEVICE_OFFLINE, {
              message: `Device ${device.name} went offline`,
              severity: AlertSeverity.HIGH
            });
          }
        }
        
        // Check device health
        const health = device.getDeviceHealth();
        if (health.overall === 'critical' || health.overall === 'poor') {
          await this.createAlert(device.id, AlertType.HEALTH_DEGRADED, {
            message: `Device ${device.name} health is ${health.overall}`,
            severity: health.overall === 'critical' ? AlertSeverity.CRITICAL : AlertSeverity.MEDIUM,
            data: health.factors
          });
        }
      }
      
      this.logger.debug(`Performed health checks for ${devices.length} devices`);
    } catch (error) {
      this.logger.error('Failed to perform scheduled health checks:', error);
    }
  }

  @Cron('0 0 2 * * *') // Daily at 2 AM
  private async performDailyMaintenance(): Promise<void> {
    try {
      // Clean up old sensor readings (keep last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const deleteResult = await this.sensorReadingRepository
        .createQueryBuilder()
        .delete()
        .where('timestamp < :date', { date: thirtyDaysAgo })
        .execute();
      
      this.logger.log(`Cleaned up ${deleteResult.affected} old sensor readings`);
      
      // Update gateway performance metrics
      const gateways = await this.gatewayRepository.find({ where: { isActive: true } });
      for (const gateway of gateways) {
        // Calculate and update daily metrics
        gateway.updatePerformanceMetrics({
          dataProcessedToday: gateway.totalDataProcessed,
          messagesProcessedToday: gateway.totalMessagesProcessed,
          uptime: gateway.isOnline() ? 100 : 0,
          errorRate: gateway.errorCount > 0 ? (gateway.errorCount / gateway.totalMessagesProcessed) * 100 : 0,
          averageLatency: gateway.averageLatency,
          throughput: gateway.totalMessagesProcessed / (24 * 60 * 60), // per second
          cpuUsage: gateway.cpuUsage || 0,
          memoryUsage: gateway.memoryUsage || 0,
          storageUsage: gateway.storageUsage || 0,
          networkUsage: gateway.networkUsage || 0
        });
        
        await this.gatewayRepository.save(gateway);
      }
      
      this.logger.log('Completed daily maintenance tasks');
    } catch (error) {
      this.logger.error('Failed to perform daily maintenance:', error);
    }
  }

  // ========== Configuration Methods ==========

  async getConfigurations(): Promise<any> {
    return {
      aiProcessingEnabled: this.configService.get('iot.ai.enabled', true),
      quantumProcessingEnabled: this.configService.get('iot.quantum.enabled', false),
      edgeComputingEnabled: this.configService.get('iot.edge.enabled', true),
      blockchainIntegrationEnabled: this.configService.get('iot.blockchain.enabled', false),
      maxDevicesPerGateway: this.configService.get('iot.gateway.maxDevices', 100),
      dataRetentionDays: this.configService.get('iot.dataRetention.days', 30),
      alertThresholds: {
        batteryLow: this.configService.get('iot.alerts.batteryLow', 20),
        signalWeak: this.configService.get('iot.alerts.signalWeak', 30),
        responseTimeHigh: this.configService.get('iot.alerts.responseTimeHigh', 5000)
      }
    };
  }
}
