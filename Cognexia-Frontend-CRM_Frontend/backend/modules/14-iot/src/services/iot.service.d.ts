import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventBusService } from '@industry5/shared';
import { IoTDevice, DeviceType, DeviceStatus } from '../entities/iot-device.entity';
import { Gateway, GatewayType, GatewayStatus } from '../entities/gateway.entity';
import { DeviceAlert, AlertType, AlertSeverity } from '../entities/device-alert.entity';
import { DeviceCommand, CommandStatus } from '../entities/device-command.entity';
import { SensorReading } from '../entities/sensor-reading.entity';
import { CreateDeviceDto, UpdateDeviceDto } from '../dto/device.dto';
import { CreateGatewayDto } from '../dto/gateway.dto';
import { SensorReadingDto } from '../dto/sensor-reading.dto';
import { CommandExecutionDto } from '../dto/command.dto';
export interface IoTDashboardStats {
    totalDevices: number;
    onlineDevices: number;
    offlineDevices: number;
    healthyDevices: number;
    criticalDevices: number;
    totalGateways: number;
    activeGateways: number;
    totalDataToday: number;
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
export declare class IoTService {
    private deviceRepository;
    private gatewayRepository;
    private alertRepository;
    private commandRepository;
    private sensorReadingRepository;
    private configService;
    private eventBus;
    private readonly logger;
    constructor(deviceRepository: Repository<IoTDevice>, gatewayRepository: Repository<Gateway>, alertRepository: Repository<DeviceAlert>, commandRepository: Repository<DeviceCommand>, sensorReadingRepository: Repository<SensorReading>, configService: ConfigService, eventBus: EventBusService);
    getDevices(filters?: {
        type?: DeviceType;
        status?: DeviceStatus;
        location?: string;
        gatewayId?: string;
        hasAI?: boolean;
        hasQuantum?: boolean;
        page?: number;
        limit?: number;
    }): Promise<IoTDevice[]>;
    getDeviceById(id: string): Promise<IoTDevice>;
    createDevice(createDeviceDto: CreateDeviceDto): Promise<IoTDevice>;
    updateDevice(id: string, updateDeviceDto: UpdateDeviceDto): Promise<IoTDevice>;
    deleteDevice(id: string): Promise<void>;
    getGateways(filters?: {
        type?: GatewayType;
        status?: GatewayStatus;
        location?: string;
        hasAI?: boolean;
        hasQuantum?: boolean;
    }): Promise<Gateway[]>;
    createGateway(createGatewayDto: CreateGatewayDto): Promise<Gateway>;
    getSensorReadings(filters: {
        deviceId?: string;
        sensorType?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        includeAIAnalysis?: boolean;
    }): Promise<SensorReading[]>;
    recordReading(sensorReadingDto: SensorReadingDto): Promise<SensorReading>;
    executeCommand(commandDto: CommandExecutionDto): Promise<DeviceCommand>;
    getDeviceCommands(deviceId: string, status?: CommandStatus): Promise<DeviceCommand[]>;
    getAlerts(filters: {
        deviceId?: string;
        alertType?: AlertType;
        severity?: AlertSeverity;
        startDate?: Date;
        endDate?: Date;
        isResolved?: boolean;
    }): Promise<DeviceAlert[]>;
    getDashboardStats(): Promise<IoTDashboardStats>;
    getDeviceHealthReport(deviceId: string): Promise<DeviceHealthReport>;
    private processReadingWithAI;
    private checkForAnomalies;
    private queueCommandForExecution;
    private updateGatewayDeviceCount;
    private createAlert;
    private generateRecommendations;
    private predictDeviceFailure;
    private calculateMaintenanceScore;
    private performHealthChecks;
    private performDailyMaintenance;
    getConfigurations(): Promise<any>;
}
//# sourceMappingURL=iot.service.d.ts.map