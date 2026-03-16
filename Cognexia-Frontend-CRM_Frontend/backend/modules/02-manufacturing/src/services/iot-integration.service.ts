/**
 * Manufacturing Module - IoT Integration Service
 * Industry 5.0 ERP - Advanced IoT Device Management and Data Collection
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

interface IoTDevice {
  id: string;
  name: string;
  type: 'SENSOR' | 'ACTUATOR' | 'CONTROLLER' | 'GATEWAY' | 'CAMERA' | 'RFID_READER';
  category: 'TEMPERATURE' | 'PRESSURE' | 'VIBRATION' | 'POWER' | 'FLOW' | 'POSITION' | 'QUALITY' | 'SAFETY';
  workCenterId: string;
  location: {
    x: number;
    y: number;
    z: number;
    description: string;
  };
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'ERROR' | 'CALIBRATING';
  protocol: 'MQTT' | 'MODBUS' | 'OPC_UA' | 'HTTP' | 'COAP' | 'ZIGBEE' | 'LORA';
  configuration: {
    endpoint: string;
    pollInterval: number; // milliseconds
    threshold?: {
      min: number;
      max: number;
      unit: string;
    };
    calibration?: {
      offset: number;
      scale: number;
      lastCalibrated: Date;
    };
  };
  lastSeen: Date;
  metadata: Record<string, any>;
}

interface IoTReading {
  deviceId: string;
  timestamp: Date;
  value: number | string | boolean | object;
  unit?: string;
  quality: 'GOOD' | 'BAD' | 'UNCERTAIN' | 'STALE';
  tags: Record<string, string>;
}

interface IoTAlert {
  id: string;
  deviceId: string;
  type: 'THRESHOLD_EXCEEDED' | 'DEVICE_OFFLINE' | 'SENSOR_MALFUNCTION' | 'SAFETY_VIOLATION' | 'MAINTENANCE_DUE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  value?: any;
  threshold?: any;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

interface EdgeComputingNode {
  id: string;
  name: string;
  location: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  capabilities: string[];
  connectedDevices: string[];
  processingLoad: number; // percentage
  lastHeartbeat: Date;
}

interface DigitalTwinUpdate {
  assetId: string;
  properties: Record<string, any>;
  timestamp: Date;
  source: 'IoT' | 'MANUAL' | 'SIMULATION' | 'AI_PREDICTION';
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class IoTIntegrationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IoTIntegrationService.name);
  
  @WebSocketServer()
  private server: Server;

  private devices: Map<string, IoTDevice> = new Map();
  private readings: Map<string, IoTReading[]> = new Map();
  private alerts: Map<string, IoTAlert> = new Map();
  private edgeNodes: Map<string, EdgeComputingNode> = new Map();
  
  // Connection pools for different protocols
  private mqttClient: any;
  private opcUaSession: any;
  private modbusConnections: Map<string, any> = new Map();

  constructor(private eventEmitter: EventEmitter2) {}

  async onModuleInit() {
    this.logger.log('Initializing IoT Integration Service...');
    await this.initializeConnections();
    await this.loadDeviceConfigurations();
    await this.startDeviceDiscovery();
    this.logger.log('IoT Integration Service initialized successfully');
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down IoT Integration Service...');
    await this.closeConnections();
  }

  /**
   * Register a new IoT device in the system
   */
  async registerDevice(deviceConfig: Partial<IoTDevice>): Promise<IoTDevice> {
    const device: IoTDevice = {
      id: deviceConfig.id || `device_${Date.now()}`,
      name: deviceConfig.name || 'Unknown Device',
      type: deviceConfig.type || 'SENSOR',
      category: deviceConfig.category || 'TEMPERATURE',
      workCenterId: deviceConfig.workCenterId || 'default',
      location: deviceConfig.location || { x: 0, y: 0, z: 0, description: 'Unknown' },
      status: 'OFFLINE',
      protocol: deviceConfig.protocol || 'MQTT',
      configuration: {
        endpoint: deviceConfig.configuration?.endpoint || '',
        pollInterval: deviceConfig.configuration?.pollInterval || 5000,
        ...deviceConfig.configuration,
      },
      lastSeen: new Date(),
      metadata: deviceConfig.metadata || {},
    };

    this.devices.set(device.id, device);
    this.readings.set(device.id, []);

    // Initialize connection based on protocol
    await this.initializeDeviceConnection(device);

    this.logger.log(`Device registered: ${device.name} (${device.id})`);
    
    // Emit device registration event
    this.eventEmitter.emit('device.registered', device);
    this.broadcastDeviceUpdate(device);

    return device;
  }

  /**
   * Get real-time data from a specific device
   */
  async getDeviceData(deviceId: string, timeRange?: { start: Date; end: Date }): Promise<IoTReading[]> {
    const readings = this.readings.get(deviceId) || [];
    
    if (!timeRange) {
      return readings.slice(-100); // Return last 100 readings
    }

    return readings.filter(
      reading => reading.timestamp >= timeRange.start && reading.timestamp <= timeRange.end
    );
  }

  /**
   * Send command to an actuator device
   */
  async sendCommand(deviceId: string, command: string, parameters?: any): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    if (device.type !== 'ACTUATOR' && device.type !== 'CONTROLLER') {
      throw new Error(`Device ${deviceId} does not support commands`);
    }

    this.logger.log(`Sending command to device ${deviceId}: ${command}`, parameters);

    try {
      // Send command based on device protocol
      switch (device.protocol) {
        case 'MQTT':
          await this.sendMqttCommand(device, command, parameters);
          break;
        case 'OPC_UA':
          await this.sendOpcUaCommand(device, command, parameters);
          break;
        case 'MODBUS':
          await this.sendModbusCommand(device, command, parameters);
          break;
        default:
          throw new Error(`Protocol ${device.protocol} not supported for commands`);
      }

      // Log command execution
      this.eventEmitter.emit('command.executed', {
        deviceId,
        command,
        parameters,
        timestamp: new Date(),
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to send command to device ${deviceId}:`, error);
      return false;
    }
  }

  /**
   * Get device status and health information
   */
  getDeviceStatus(deviceId: string): {
    device: IoTDevice;
    health: {
      isOnline: boolean;
      lastSeen: Date;
      connectionQuality: 'EXCELLENT' | 'GOOD' | 'POOR' | 'CRITICAL';
      dataQuality: number; // percentage
      alertCount: number;
    };
    latestReading?: IoTReading;
  } | null {
    const device = this.devices.get(deviceId);
    if (!device) return null;

    const readings = this.readings.get(deviceId) || [];
    const latestReading = readings[readings.length - 1];
    const deviceAlerts = Array.from(this.alerts.values()).filter(
      alert => alert.deviceId === deviceId && !alert.acknowledged
    );

    const timeSinceLastSeen = Date.now() - device.lastSeen.getTime();
    let connectionQuality: 'EXCELLENT' | 'GOOD' | 'POOR' | 'CRITICAL' = 'EXCELLENT';
    
    if (timeSinceLastSeen > 300000) connectionQuality = 'CRITICAL'; // 5 minutes
    else if (timeSinceLastSeen > 60000) connectionQuality = 'POOR'; // 1 minute
    else if (timeSinceLastSeen > 30000) connectionQuality = 'GOOD'; // 30 seconds

    // Calculate data quality based on recent readings quality
    const recentReadings = readings.slice(-20);
    const goodReadings = recentReadings.filter(r => r.quality === 'GOOD').length;
    const dataQuality = recentReadings.length > 0 ? (goodReadings / recentReadings.length) * 100 : 0;

    return {
      device,
      health: {
        isOnline: device.status === 'ONLINE',
        lastSeen: device.lastSeen,
        connectionQuality,
        dataQuality,
        alertCount: deviceAlerts.length,
      },
      latestReading,
    };
  }

  /**
   * Automated device monitoring and health checking
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async monitorDeviceHealth() {
    const now = new Date();
    const offlineThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [deviceId, device] of this.devices) {
      const timeSinceLastSeen = now.getTime() - device.lastSeen.getTime();
      
      if (timeSinceLastSeen > offlineThreshold && device.status !== 'OFFLINE') {
        // Mark device as offline
        device.status = 'OFFLINE';
        
        await this.createAlert({
          deviceId,
          type: 'DEVICE_OFFLINE',
          severity: 'HIGH',
          message: `Device ${device.name} has gone offline`,
          timestamp: now,
        });

        this.broadcastDeviceUpdate(device);
      }

      // Check for sensor malfunctions
      const recentReadings = (this.readings.get(deviceId) || []).slice(-10);
      if (recentReadings.length >= 5) {
        const badReadings = recentReadings.filter(r => r.quality === 'BAD' || r.quality === 'UNCERTAIN').length;
        if (badReadings / recentReadings.length > 0.5) {
          await this.createAlert({
            deviceId,
            type: 'SENSOR_MALFUNCTION',
            severity: 'HIGH',
            message: `Device ${device.name} is producing poor quality data`,
            timestamp: now,
          });
        }
      }
    }
  }

  /**
   * Process incoming IoT data and apply business logic
   */
  async processIncomingData(deviceId: string, rawValue: any, timestamp: Date = new Date()): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) {
      this.logger.warn(`Received data from unknown device: ${deviceId}`);
      return;
    }

    // Update device last seen
    device.lastSeen = timestamp;
    if (device.status === 'OFFLINE') {
      device.status = 'ONLINE';
      this.broadcastDeviceUpdate(device);
    }

    // Apply calibration if configured
    let processedValue = rawValue;
    if (device.configuration.calibration && typeof rawValue === 'number') {
      processedValue = (rawValue * device.configuration.calibration.scale) + device.configuration.calibration.offset;
    }

    // Determine data quality
    let quality: 'GOOD' | 'BAD' | 'UNCERTAIN' | 'STALE' = 'GOOD';
    if (device.configuration.threshold) {
      const numValue = Number(processedValue);
      if (numValue < device.configuration.threshold.min || numValue > device.configuration.threshold.max) {
        quality = 'UNCERTAIN';
      }
    }

    const reading: IoTReading = {
      deviceId,
      timestamp,
      value: processedValue,
      unit: device.configuration.threshold?.unit,
      quality,
      tags: {
        workCenter: device.workCenterId,
        category: device.category,
        location: device.location.description,
      },
    };

    // Store reading
    const readings = this.readings.get(deviceId) || [];
    readings.push(reading);
    
    // Keep only last 1000 readings per device
    if (readings.length > 1000) {
      readings.splice(0, readings.length - 1000);
    }
    
    this.readings.set(deviceId, readings);

    // Check thresholds and create alerts
    await this.checkThresholds(device, reading);

    // Broadcast real-time data
    this.server.emit('iot:data', {
      deviceId,
      reading,
    });

    // Emit event for other services
    this.eventEmitter.emit('iot.data.received', {
      device,
      reading,
    });

    // Update digital twin
    await this.updateDigitalTwin(device, reading);
  }

  /**
   * Edge computing capabilities for real-time processing
   */
  async processAtEdge(nodeId: string, data: any[]): Promise<any> {
    const edgeNode = this.edgeNodes.get(nodeId);
    if (!edgeNode) {
      throw new Error(`Edge node ${nodeId} not found`);
    }

    this.logger.log(`Processing ${data.length} data points at edge node ${nodeId}`);

    // Simulate edge processing (filtering, aggregation, anomaly detection)
    const processedData = {
      timestamp: new Date(),
      nodeId,
      summary: {
        count: data.length,
        average: data.reduce((sum, item) => sum + (item.value || 0), 0) / data.length,
        min: Math.min(...data.map(item => item.value || 0)),
        max: Math.max(...data.map(item => item.value || 0)),
      },
      anomalies: data.filter(item => this.detectAnomalyAtEdge(item)),
      aggregatedMetrics: this.calculateEdgeMetrics(data),
    };

    // Update edge node processing load
    edgeNode.processingLoad = Math.min(edgeNode.processingLoad + 5, 100);
    edgeNode.lastHeartbeat = new Date();

    return processedData;
  }

  /**
   * Manage device configurations and firmware updates
   */
  async updateDeviceConfiguration(deviceId: string, config: Partial<IoTDevice['configuration']>): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    const oldConfig = { ...device.configuration };
    device.configuration = { ...device.configuration, ...config };

    this.logger.log(`Updated configuration for device ${deviceId}`);

    // Send configuration update to device
    try {
      await this.sendCommand(deviceId, 'UPDATE_CONFIG', config);
      
      this.eventEmitter.emit('device.config.updated', {
        deviceId,
        oldConfig,
        newConfig: device.configuration,
      });

      return true;
    } catch (error) {
      // Rollback configuration
      device.configuration = oldConfig;
      this.logger.error(`Failed to update device configuration:`, error);
      return false;
    }
  }

  // Private helper methods
  private async initializeConnections(): Promise<void> {
    // Initialize MQTT client
    try {
      // Mock MQTT client initialization
      this.mqttClient = {
        connected: true,
        subscribe: (topic: string) => this.logger.log(`Subscribed to MQTT topic: ${topic}`),
        publish: (topic: string, message: string) => this.logger.log(`Published to MQTT: ${topic}`),
      };
    } catch (error) {
      this.logger.error('Failed to initialize MQTT client:', error);
    }

    // Initialize OPC UA session
    try {
      this.opcUaSession = {
        connected: true,
        readVariableValue: () => Promise.resolve({ value: Math.random() * 100 }),
        writeVariable: () => Promise.resolve(true),
      };
    } catch (error) {
      this.logger.error('Failed to initialize OPC UA session:', error);
    }
  }

  private async closeConnections(): Promise<void> {
    // Close all protocol connections
    if (this.mqttClient) {
      this.mqttClient = null;
    }
    
    if (this.opcUaSession) {
      this.opcUaSession = null;
    }
    
    for (const [id, connection] of this.modbusConnections) {
      // Close modbus connection
      this.modbusConnections.delete(id);
    }
  }

  private async loadDeviceConfigurations(): Promise<void> {
    // Load device configurations from database or configuration files
    const mockDevices: Partial<IoTDevice>[] = [
      {
        id: 'temp_001',
        name: 'Temperature Sensor - Assembly Line 1',
        type: 'SENSOR',
        category: 'TEMPERATURE',
        workCenterId: 'WC001',
        protocol: 'MQTT',
        configuration: {
          endpoint: 'mqtt://iot-broker:1883/sensors/temperature/001',
          pollInterval: 5000,
          threshold: { min: 18, max: 25, unit: '°C' },
        },
      },
      {
        id: 'pressure_001',
        name: 'Pressure Sensor - Hydraulic System',
        type: 'SENSOR',
        category: 'PRESSURE',
        workCenterId: 'WC002',
        protocol: 'OPC_UA',
        configuration: {
          endpoint: 'opc.tcp://plc-server:4840',
          pollInterval: 1000,
          threshold: { min: 5, max: 15, unit: 'bar' },
        },
      },
    ];

    for (const deviceConfig of mockDevices) {
      await this.registerDevice(deviceConfig);
    }
  }

  private async startDeviceDiscovery(): Promise<void> {
    this.logger.log('Starting IoT device discovery...');
    
    // Simulate device discovery process
    setTimeout(async () => {
      const discoveredDevice = {
        id: 'vibration_001',
        name: 'Vibration Sensor - Motor 1',
        type: 'SENSOR' as const,
        category: 'VIBRATION' as const,
        workCenterId: 'WC001',
        protocol: 'MODBUS' as const,
        configuration: {
          endpoint: 'modbus://192.168.1.100:502',
          pollInterval: 2000,
          threshold: { min: 0, max: 10, unit: 'mm/s' },
        },
      };
      
      await this.registerDevice(discoveredDevice);
      this.logger.log('Discovered new device via auto-discovery');
    }, 10000);
  }

  private async initializeDeviceConnection(device: IoTDevice): Promise<void> {
    switch (device.protocol) {
      case 'MQTT':
        if (this.mqttClient) {
          this.mqttClient.subscribe(device.configuration.endpoint);
        }
        break;
      case 'OPC_UA':
        // Initialize OPC UA subscription
        break;
      case 'MODBUS':
        // Initialize Modbus connection
        break;
    }

    device.status = 'ONLINE';
    this.simulateDataCollection(device); // Start data simulation
  }

  private simulateDataCollection(device: IoTDevice): void {
    const interval = setInterval(async () => {
      if (!this.devices.has(device.id)) {
        clearInterval(interval);
        return;
      }

      // Generate simulated sensor data based on device category
      let value: number;
      switch (device.category) {
        case 'TEMPERATURE':
          value = 20 + Math.random() * 10 + Math.sin(Date.now() / 60000) * 3;
          break;
        case 'PRESSURE':
          value = 10 + Math.random() * 5 + Math.sin(Date.now() / 30000) * 2;
          break;
        case 'VIBRATION':
          value = Math.random() * 8 + Math.sin(Date.now() / 10000) * 1;
          break;
        default:
          value = Math.random() * 100;
      }

      await this.processIncomingData(device.id, value);
    }, device.configuration.pollInterval);
  }

  private async checkThresholds(device: IoTDevice, reading: IoTReading): Promise<void> {
    if (!device.configuration.threshold || typeof reading.value !== 'number') {
      return;
    }

    const { min, max, unit } = device.configuration.threshold;
    const value = reading.value;

    if (value < min || value > max) {
      await this.createAlert({
        deviceId: device.id,
        type: 'THRESHOLD_EXCEEDED',
        severity: value < min * 0.5 || value > max * 1.5 ? 'CRITICAL' : 'HIGH',
        message: `${device.name} reading ${value}${unit || ''} is outside threshold [${min}-${max}]`,
        value,
        threshold: { min, max, unit },
        timestamp: reading.timestamp,
      });
    }
  }

  private async createAlert(alertData: Omit<IoTAlert, 'id' | 'acknowledged'>): Promise<void> {
    const alert: IoTAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      acknowledged: false,
      ...alertData,
    };

    this.alerts.set(alert.id, alert);
    
    this.logger.warn(`IoT Alert: ${alert.message}`, {
      deviceId: alert.deviceId,
      severity: alert.severity,
      type: alert.type,
    });

    // Broadcast alert
    this.server.emit('iot:alert', alert);
    this.eventEmitter.emit('iot.alert.created', alert);
  }

  private broadcastDeviceUpdate(device: IoTDevice): void {
    this.server.emit('iot:device:update', device);
  }

  private async sendMqttCommand(device: IoTDevice, command: string, parameters: any): Promise<void> {
    const commandTopic = device.configuration.endpoint.replace('/sensors/', '/commands/');
    const payload = JSON.stringify({ command, parameters, timestamp: new Date() });
    
    if (this.mqttClient) {
      this.mqttClient.publish(commandTopic, payload);
    }
  }

  private async sendOpcUaCommand(device: IoTDevice, command: string, parameters: any): Promise<void> {
    if (this.opcUaSession) {
      await this.opcUaSession.writeVariable(`${device.id}.${command}`, parameters);
    }
  }

  private async sendModbusCommand(device: IoTDevice, command: string, parameters: any): Promise<void> {
    // Implement Modbus command sending
    this.logger.log(`Sending Modbus command: ${command} to ${device.configuration.endpoint}`);
  }

  private async updateDigitalTwin(device: IoTDevice, reading: IoTReading): Promise<void> {
    const digitalTwinUpdate: DigitalTwinUpdate = {
      assetId: device.workCenterId,
      properties: {
        [`${device.category.toLowerCase()}`]: reading.value,
        [`${device.id}_status`]: device.status,
        [`${device.id}_quality`]: reading.quality,
      },
      timestamp: reading.timestamp,
      source: 'IoT',
    };

    this.eventEmitter.emit('digital.twin.update', digitalTwinUpdate);
  }

  private detectAnomalyAtEdge(dataPoint: any): boolean {
    // Simple anomaly detection logic
    const value = Number(dataPoint.value);
    return value > 1000 || value < -1000 || isNaN(value);
  }

  private calculateEdgeMetrics(data: any[]): any {
    return {
      throughput: data.length,
      latency: Math.random() * 10,
      errorRate: data.filter(item => this.detectAnomalyAtEdge(item)).length / data.length,
      processingTime: Math.random() * 100,
    };
  }
}
