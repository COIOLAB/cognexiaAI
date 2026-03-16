import { injectable } from 'inversify';
import * as mqtt from 'mqtt';
import { EventEmitter } from 'events';

interface IoTDevice {
  deviceId: string;
  type: 'sensor' | 'camera' | 'rfid_reader' | 'conveyor' | 'robot' | 'door' | 'light';
  name: string;
  location: {
    warehouseId: string;
    zoneId: string;
    x?: number;
    y?: number;
    z?: number;
  };
  status: 'online' | 'offline' | 'maintenance' | 'error';
  lastSeen: Date;
  configuration: Record<string, any>;
  firmware: {
    version: string;
    lastUpdate: Date;
  };
  metrics: {
    uptime: number;
    batteryLevel?: number;
    signalStrength?: number;
  };
}

interface SensorReading {
  sensorId: string;
  timestamp: Date;
  value: number;
  unit: string;
  type: 'temperature' | 'humidity' | 'motion' | 'weight' | 'vibration' | 'light';
  quality: 'good' | 'fair' | 'poor';
}

interface AutomationRule {
  id: string;
  name: string;
  warehouseId: string;
  zoneId?: string;
  trigger: {
    type: 'sensor' | 'time' | 'inventory' | 'manual';
    condition: string;
    threshold?: number;
    schedule?: string;
  };
  actions: Array<{
    type: 'notification' | 'device_control' | 'inventory_move' | 'alert';
    parameters: Record<string, any>;
  }>;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastTriggered?: Date;
  triggerCount: number;
}

interface RFIDReadEvent {
  readerId: string;
  tagId: string;
  rssi: number;
  timestamp: Date;
  location?: {
    warehouseId: string;
    zoneId: string;
    coordinates?: { x: number; y: number };
  };
}

@injectable()
export class AdvancedIoTIntegrationService extends EventEmitter {
  private mqttClient: mqtt.MqttClient | null = null;
  private devices: Map<string, IoTDevice> = new Map();
  private sensorData: Map<string, SensorReading[]> = new Map();
  private automationRules: Map<string, AutomationRule> = new Map();
  private alertThresholds: Map<string, Record<string, any>> = new Map();
  private connected = false;

  // Device type configurations
  private deviceConfigurations = {
    temperature_sensor: {
      dataTypes: ['temperature'],
      units: ['celsius', 'fahrenheit'],
      alertTypes: ['high_temp', 'low_temp', 'rapid_change']
    },
    humidity_sensor: {
      dataTypes: ['humidity'],
      units: ['percentage'],
      alertTypes: ['high_humidity', 'low_humidity']
    },
    rfid_reader: {
      dataTypes: ['tag_read', 'proximity'],
      units: ['count', 'distance_cm'],
      alertTypes: ['unauthorized_access', 'missing_tag']
    },
    weight_sensor: {
      dataTypes: ['weight', 'load'],
      units: ['kg', 'lbs'],
      alertTypes: ['overload', 'underload', 'imbalance']
    },
    motion_detector: {
      dataTypes: ['motion', 'occupancy'],
      units: ['boolean', 'count'],
      alertTypes: ['unauthorized_movement', 'area_breach']
    }
  };

  constructor() {
    super();
    this.initializeIoTSystem();
  }

  /**
   * Initialize IoT system with MQTT connection and device discovery
   */
  private async initializeIoTSystem(): Promise<void> {
    try {
      await this.connectToMQTTBroker();
      await this.loadAutomationRules();
      this.startDataProcessing();
      console.log('Advanced IoT Integration Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize IoT system:', error);
      throw error;
    }
  }

  /**
   * Connect to MQTT broker for IoT communication
   */
  private async connectToMQTTBroker(): Promise<void> {
    const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
    
    const options: mqtt.IClientOptions = {
      clientId: `supply_chain_iot_${Date.now()}`,
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    };

    this.mqttClient = mqtt.connect(brokerUrl, options);

    return new Promise((resolve, reject) => {
      this.mqttClient!.on('connect', () => {
        console.log('Connected to MQTT broker for IoT integration');
        this.connected = true;
        this.subscribeToIoTTopics();
        resolve();
      });

      this.mqttClient!.on('error', (error) => {
        console.error('MQTT connection error:', error);
        this.connected = false;
        reject(error);
      });

      this.mqttClient!.on('message', (topic, message) => {
        this.handleMQTTMessage(topic, message);
      });

      this.mqttClient!.on('close', () => {
        console.warn('MQTT connection closed');
        this.connected = false;
      });
    });
  }

  /**
   * Subscribe to IoT topics for different device types
   */
  private subscribeToIoTTopics(): void {
    const topics = [
      'warehouse/+/sensors/+/data',      // Sensor data
      'warehouse/+/devices/+/status',    // Device status
      'warehouse/+/rfid/+/reads',        // RFID reads
      'warehouse/+/cameras/+/alerts',    // Camera alerts
      'warehouse/+/automation/+/events', // Automation events
      'warehouse/+/emergency/alerts',    // Emergency alerts
      'supply-chain/+/inventory/+/updates', // Inventory updates
    ];

    topics.forEach(topic => {
      this.mqttClient!.subscribe(topic, (error) => {
        if (error) {
          console.error(`Failed to subscribe to topic ${topic}:`, error);
        } else {
          console.log(`Subscribed to IoT topic: ${topic}`);
        }
      });
    });
  }

  /**
   * Handle incoming MQTT messages from IoT devices
   */
  private async handleMQTTMessage(topic: string, message: Buffer): Promise<void> {
    try {
      const data = JSON.parse(message.toString());
      const topicParts = topic.split('/');
      
      if (topicParts.length < 4) return;
      
      const warehouseId = topicParts[1];
      const messageType = topicParts[2];
      const deviceId = topicParts[3];
      const dataType = topicParts[4];

      // Update device last seen timestamp
      const deviceKey = `${warehouseId}:${deviceId}`;
      if (this.devices.has(deviceKey)) {
        const device = this.devices.get(deviceKey)!;
        device.lastSeen = new Date();
        device.status = 'online';
      }

      switch (messageType) {
        case 'sensors':
          await this.processSensorData(warehouseId, deviceId, dataType, data);
          break;
        case 'devices':
          await this.processDeviceStatus(warehouseId, deviceId, dataType, data);
          break;
        case 'rfid':
          await this.processRFIDRead(warehouseId, deviceId, data);
          break;
        case 'cameras':
          await this.processCameraAlert(warehouseId, deviceId, data);
          break;
        case 'automation':
          await this.processAutomationEvent(warehouseId, deviceId, data);
          break;
        case 'emergency':
          await this.processEmergencyAlert(warehouseId, data);
          break;
      }

    } catch (error) {
      console.error('Error processing MQTT message:', error);
    }
  }

  /**
   * Process sensor data and trigger analytics
   */
  private async processSensorData(warehouseId: string, sensorId: string, dataType: string, data: any): Promise<void> {
    const sensorKey = `${warehouseId}:${sensorId}`;
    
    const sensorReading: SensorReading = {
      sensorId,
      timestamp: new Date(data.timestamp || Date.now()),
      value: data.value,
      unit: data.unit,
      type: dataType as any,
      quality: data.quality || 'good'
    };

    // Store sensor data
    if (!this.sensorData.has(sensorKey)) {
      this.sensorData.set(sensorKey, []);
    }
    
    const readings = this.sensorData.get(sensorKey)!;
    readings.push(sensorReading);
    
    // Keep only last 1000 readings per sensor
    if (readings.length > 1000) {
      readings.shift();
    }

    // Check for threshold violations and alerts
    await this.checkSensorAlerts(warehouseId, sensorId, sensorReading);
    
    // Trigger automation rules
    await this.evaluateAutomationRules(warehouseId, sensorId, sensorReading);
    
    // Emit event for real-time updates
    this.emit('sensorData', {
      warehouseId,
      sensorId,
      reading: sensorReading
    });

    // Advanced analytics integration
    await this.analyzeSensorTrends(sensorKey, readings);
  }

  /**
   * Process device status updates
   */
  private async processDeviceStatus(warehouseId: string, deviceId: string, statusType: string, data: any): Promise<void> {
    const deviceKey = `${warehouseId}:${deviceId}`;
    
    if (this.devices.has(deviceKey)) {
      const device = this.devices.get(deviceKey)!;
      device.status = data.status;
      device.lastSeen = new Date();
      
      if (data.batteryLevel !== undefined) {
        device.metrics.batteryLevel = data.batteryLevel;
      }
      
      if (data.signalStrength !== undefined) {
        device.metrics.signalStrength = data.signalStrength;
      }

      // Check for device-specific alerts
      await this.checkDeviceHealth(device);
    }

    this.emit('deviceStatus', {
      warehouseId,
      deviceId,
      status: data.status,
      timestamp: new Date()
    });
  }

  /**
   * Process RFID tag reads for inventory tracking
   */
  private async processRFIDRead(warehouseId: string, readerId: string, data: any): Promise<void> {
    const rfidEvent: RFIDReadEvent = {
      readerId,
      tagId: data.tagId,
      rssi: data.rssi,
      timestamp: new Date(data.timestamp || Date.now()),
      location: {
        warehouseId,
        zoneId: data.zoneId,
        coordinates: data.coordinates
      }
    };

    // Emit RFID read event for inventory tracking
    this.emit('rfidRead', rfidEvent);

    // Trigger inventory location updates
    await this.updateInventoryLocation(rfidEvent);

    console.log(`RFID read: Tag ${data.tagId} at reader ${readerId}`);
  }

  /**
   * Process camera alerts and computer vision events
   */
  private async processCameraAlert(warehouseId: string, cameraId: string, data: any): Promise<void> {
    const { alertType, confidence, bbox, metadata } = data;
    
    this.emit('cameraAlert', {
      warehouseId,
      cameraId,
      alertType,
      confidence,
      bbox,
      metadata,
      timestamp: new Date()
    });

    // High confidence alerts trigger immediate actions
    if (confidence > 0.8) {
      await this.triggerHighPriorityAlert(warehouseId, cameraId, alertType, data);
    }
  }

  /**
   * Process automation events and execute rules
   */
  private async processAutomationEvent(warehouseId: string, deviceId: string, data: any): Promise<void> {
    const { eventType, ruleId, parameters } = data;
    
    if (this.automationRules.has(ruleId)) {
      const rule = this.automationRules.get(ruleId)!;
      await this.executeAutomationActions(warehouseId, rule, parameters);
      
      // Update rule statistics
      rule.lastTriggered = new Date();
      rule.triggerCount++;
    }

    this.emit('automationEvent', {
      warehouseId,
      deviceId,
      eventType,
      ruleId,
      parameters,
      timestamp: new Date()
    });
  }

  /**
   * Process emergency alerts with highest priority
   */
  private async processEmergencyAlert(warehouseId: string, data: any): Promise<void> {
    const { alertType, level, message, location } = data;
    
    // Emit high-priority emergency event
    this.emit('emergencyAlert', {
      warehouseId,
      alertType,
      level,
      message,
      location,
      timestamp: new Date()
    });

    // Trigger emergency protocols
    await this.activateEmergencyProtocols(warehouseId, alertType, data);
    
    console.error(`EMERGENCY ALERT: ${alertType} in warehouse ${warehouseId} - ${message}`);
  }

  /**
   * Check sensor readings against configured thresholds
   */
  private async checkSensorAlerts(warehouseId: string, sensorId: string, reading: SensorReading): Promise<void> {
    const thresholdKey = `${warehouseId}:${sensorId}`;
    const thresholds = this.alertThresholds.get(thresholdKey);
    
    if (!thresholds) return;

    const threshold = thresholds[reading.type];
    if (!threshold) return;

    let alertTriggered = false;
    let alertType = '';
    let alertMessage = '';

    // Check value thresholds
    if (threshold.max !== undefined && reading.value > threshold.max) {
      alertTriggered = true;
      alertType = `high_${reading.type}`;
      alertMessage = `${reading.type} reading ${reading.value} ${reading.unit} exceeds maximum threshold ${threshold.max}`;
    } else if (threshold.min !== undefined && reading.value < threshold.min) {
      alertTriggered = true;
      alertType = `low_${reading.type}`;
      alertMessage = `${reading.type} reading ${reading.value} ${reading.unit} below minimum threshold ${threshold.min}`;
    }

    // Check rate of change
    if (threshold.changeRate && !alertTriggered) {
      const history = this.sensorData.get(thresholdKey);
      if (history && history.length > 1) {
        const previousReading = history[history.length - 2];
        const timeDiff = (reading.timestamp.getTime() - previousReading.timestamp.getTime()) / 1000;
        const valueChange = Math.abs(reading.value - previousReading.value);
        const changeRate = valueChange / timeDiff;
        
        if (changeRate > threshold.changeRate) {
          alertTriggered = true;
          alertType = `rapid_${reading.type}_change`;
          alertMessage = `Rapid ${reading.type} change detected: ${changeRate.toFixed(2)} ${reading.unit}/second`;
        }
      }
    }

    if (alertTriggered) {
      await this.createSensorAlert(warehouseId, sensorId, alertType, alertMessage, reading);
    }
  }

  /**
   * Execute automation rule actions
   */
  private async executeAutomationActions(warehouseId: string, rule: AutomationRule, parameters: any): Promise<void> {
    for (const action of rule.actions) {
      try {
        switch (action.type) {
          case 'notification':
            await this.sendNotification(warehouseId, action.parameters, parameters);
            break;
          case 'device_control':
            await this.controlDevice(warehouseId, action.parameters, parameters);
            break;
          case 'inventory_move':
            await this.triggerInventoryMove(warehouseId, action.parameters, parameters);
            break;
          case 'alert':
            await this.createAutomationAlert(warehouseId, action.parameters, parameters);
            break;
        }
      } catch (error) {
        console.error(`Error executing automation action ${action.type}:`, error);
      }
    }
  }

  /**
   * Analyze sensor trends and patterns
   */
  private async analyzeSensorTrends(sensorKey: string, readings: SensorReading[]): Promise<void> {
    if (readings.length < 10) return;

    const values = readings.slice(-50).map(r => r.value); // Last 50 readings
    
    // Calculate trend
    const trend = this.calculateTrend(values);
    
    // Detect anomalies
    const anomaly = this.detectAnomalies(values);
    
    // Calculate statistics
    const stats = {
      mean: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      trend,
      anomaly
    };

    this.emit('sensorAnalytics', {
      sensorKey,
      stats,
      readings: readings.slice(-10) // Last 10 readings
    });
  }

  /**
   * Calculate trend direction and strength
   */
  private calculateTrend(values: number[]): { direction: 'up' | 'down' | 'stable'; strength: number } {
    if (values.length < 2) return { direction: 'stable', strength: 0 };
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + (i * val), 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) || 0;
    
    return {
      direction: slope > 0.1 ? 'up' : slope < -0.1 ? 'down' : 'stable',
      strength: Math.abs(slope)
    };
  }

  /**
   * Detect anomalies in sensor data
   */
  private detectAnomalies(values: number[]): { isAnomaly: boolean; score: number } {
    if (values.length < 5) return { isAnomaly: false, score: 0 };
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    const lastValue = values[values.length - 1];
    const zScore = stdDev > 0 ? Math.abs(lastValue - mean) / stdDev : 0;
    
    return {
      isAnomaly: zScore > 2, // 2 standard deviations
      score: zScore
    };
  }

  /**
   * Register a new IoT device
   */
  public async registerDevice(device: Omit<IoTDevice, 'lastSeen' | 'metrics'>): Promise<void> {
    const deviceKey = `${device.location.warehouseId}:${device.deviceId}`;
    
    const fullDevice: IoTDevice = {
      ...device,
      lastSeen: new Date(),
      metrics: {
        uptime: 0,
        batteryLevel: 100,
        signalStrength: 100
      }
    };

    this.devices.set(deviceKey, fullDevice);
    
    // Subscribe to device-specific topics
    const topics = [
      `warehouse/${device.location.warehouseId}/devices/${device.deviceId}/+`,
      `warehouse/${device.location.warehouseId}/sensors/${device.deviceId}/+`
    ];

    topics.forEach(topic => {
      this.mqttClient?.subscribe(topic);
    });

    this.emit('deviceRegistered', fullDevice);
    console.log(`IoT device registered: ${device.deviceId} (${device.type})`);
  }

  /**
   * Create automation rule
   */
  public async createAutomationRule(rule: Omit<AutomationRule, 'id' | 'triggerCount' | 'lastTriggered'>): Promise<string> {
    const ruleId = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullRule: AutomationRule = {
      ...rule,
      id: ruleId,
      triggerCount: 0
    };

    this.automationRules.set(ruleId, fullRule);
    
    console.log(`Automation rule created: ${rule.name} (${ruleId})`);
    return ruleId;
  }

  /**
   * Control IoT device remotely
   */
  public async controlDevice(warehouseId: string, deviceId: string, command: string, parameters?: any): Promise<void> {
    if (!this.mqttClient || !this.connected) {
      throw new Error('MQTT client not connected');
    }

    const topic = `warehouse/${warehouseId}/devices/${deviceId}/commands`;
    const message = JSON.stringify({
      command,
      parameters,
      timestamp: new Date().toISOString(),
      source: 'supply-chain-service'
    });

    this.mqttClient.publish(topic, message);
    console.log(`Device command sent: ${command} to ${deviceId}`);
  }

  /**
   * Get device status and metrics
   */
  public getDeviceStatus(warehouseId: string, deviceId: string): IoTDevice | null {
    const deviceKey = `${warehouseId}:${deviceId}`;
    return this.devices.get(deviceKey) || null;
  }

  /**
   * Get sensor data history
   */
  public getSensorHistory(warehouseId: string, sensorId: string, limit: number = 100): SensorReading[] {
    const sensorKey = `${warehouseId}:${sensorId}`;
    const readings = this.sensorData.get(sensorKey);
    return readings ? readings.slice(-limit) : [];
  }

  /**
   * Get all devices in a warehouse
   */
  public getWarehouseDevices(warehouseId: string): IoTDevice[] {
    const devices: IoTDevice[] = [];
    
    for (const [key, device] of this.devices.entries()) {
      if (key.startsWith(`${warehouseId}:`)) {
        devices.push(device);
      }
    }
    
    return devices;
  }

  /**
   * Get automation rules for a warehouse
   */
  public getWarehouseAutomationRules(warehouseId: string): AutomationRule[] {
    const rules: AutomationRule[] = [];
    
    for (const rule of this.automationRules.values()) {
      if (rule.warehouseId === warehouseId) {
        rules.push(rule);
      }
    }
    
    return rules;
  }

  /**
   * Check if IoT system is connected
   */
  public isConnected(): boolean {
    return this.connected;
  }

  // Private helper methods
  private async loadAutomationRules(): Promise<void> {
    // In a real implementation, load from database
    console.log('Loading automation rules from database...');
  }

  private startDataProcessing(): void {
    // Start periodic data processing
    setInterval(() => {
      this.processPeriodicTasks();
    }, 60000); // Every minute
  }

  private async processPeriodicTasks(): Promise<void> {
    // Check device health
    await this.performDeviceHealthCheck();
    
    // Clean old sensor data
    this.cleanOldSensorData();
    
    // Update device metrics
    this.updateDeviceMetrics();
  }

  private async performDeviceHealthCheck(): Promise<void> {
    const now = new Date();
    const offlineThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [key, device] of this.devices.entries()) {
      const timeSinceLastSeen = now.getTime() - device.lastSeen.getTime();
      
      if (timeSinceLastSeen > offlineThreshold && device.status !== 'offline') {
        device.status = 'offline';
        await this.createDeviceAlert(device, 'device_timeout', 
          `Device ${device.deviceId} has not responded for ${Math.round(timeSinceLastSeen / 60000)} minutes`);
      }
    }
  }

  private cleanOldSensorData(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    
    for (const [key, readings] of this.sensorData.entries()) {
      const filteredReadings = readings.filter(r => r.timestamp.getTime() > cutoffTime);
      this.sensorData.set(key, filteredReadings);
    }
  }

  private updateDeviceMetrics(): void {
    for (const device of this.devices.values()) {
      if (device.status === 'online') {
        device.metrics.uptime += 1; // Increment uptime counter
      }
    }
  }

  private async createSensorAlert(warehouseId: string, sensorId: string, alertType: string, message: string, reading: SensorReading): Promise<void> {
    this.emit('sensorAlert', {
      warehouseId,
      sensorId,
      alertType,
      message,
      reading,
      timestamp: new Date()
    });
  }

  private async createDeviceAlert(device: IoTDevice, alertType: string, message: string): Promise<void> {
    this.emit('deviceAlert', {
      warehouseId: device.location.warehouseId,
      deviceId: device.deviceId,
      alertType,
      message,
      timestamp: new Date()
    });
  }

  private async checkDeviceHealth(device: IoTDevice): Promise<void> {
    // Check battery level
    if (device.metrics.batteryLevel && device.metrics.batteryLevel < 20) {
      await this.createDeviceAlert(device, 'low_battery', 
        `Device ${device.deviceId} has low battery: ${device.metrics.batteryLevel}%`);
    }

    // Check signal strength
    if (device.metrics.signalStrength && device.metrics.signalStrength < 30) {
      await this.createDeviceAlert(device, 'low_signal', 
        `Device ${device.deviceId} has low signal strength: ${device.metrics.signalStrength}%`);
    }
  }

  private async updateInventoryLocation(rfidEvent: RFIDReadEvent): Promise<void> {
    // Emit event for inventory service to handle location updates
    this.emit('inventoryLocationUpdate', rfidEvent);
  }

  private async triggerHighPriorityAlert(warehouseId: string, cameraId: string, alertType: string, data: any): Promise<void> {
    // Implement high priority alert handling
    console.log(`HIGH PRIORITY ALERT: ${alertType} from camera ${cameraId} in warehouse ${warehouseId}`);
  }

  private async activateEmergencyProtocols(warehouseId: string, alertType: string, data: any): Promise<void> {
    // Implement emergency protocol activation
    console.log(`ACTIVATING EMERGENCY PROTOCOLS: ${alertType} in warehouse ${warehouseId}`);
  }

  private async sendNotification(warehouseId: string, actionParams: any, triggerParams: any): Promise<void> {
    // Implement notification sending
    console.log(`Sending notification for warehouse ${warehouseId}`);
  }

  private async triggerInventoryMove(warehouseId: string, actionParams: any, triggerParams: any): Promise<void> {
    // Implement inventory move trigger
    this.emit('inventoryMoveTriggered', { warehouseId, actionParams, triggerParams });
  }

  private async createAutomationAlert(warehouseId: string, actionParams: any, triggerParams: any): Promise<void> {
    // Implement automation alert creation
    this.emit('automationAlert', { warehouseId, actionParams, triggerParams });
  }

  private async evaluateAutomationRules(warehouseId: string, sensorId: string, reading: SensorReading): Promise<void> {
    for (const rule of this.automationRules.values()) {
      if (rule.warehouseId === warehouseId && rule.enabled && rule.trigger.type === 'sensor') {
        if (this.evaluateRuleCondition(rule, reading)) {
          await this.executeAutomationActions(warehouseId, rule, { sensorId, reading });
        }
      }
    }
  }

  private evaluateRuleCondition(rule: AutomationRule, reading: SensorReading): boolean {
    const { condition, threshold } = rule.trigger;
    
    if (!threshold) return false;
    
    switch (condition) {
      case 'greater_than':
        return reading.value > threshold;
      case 'less_than':
        return reading.value < threshold;
      case 'equals':
        return reading.value === threshold;
      default:
        return false;
    }
  }
}

export default AdvancedIoTIntegrationService;
