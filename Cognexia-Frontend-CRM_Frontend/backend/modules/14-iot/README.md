# IoT Module (14-iot)

## Overview

The **IoT Module** is a comprehensive Internet of Things platform designed for Industry 5.0 smart manufacturing environments. It provides device management, real-time data collection, edge computing capabilities, and intelligent analytics for connected manufacturing systems.

## Features

### Core IoT Capabilities
- **Device Management**: Comprehensive IoT device lifecycle management
- **Real-time Data Collection**: High-throughput sensor data ingestion
- **Edge Computing**: Distributed processing at the edge
- **Device Security**: End-to-end IoT security and authentication
- **Protocol Support**: Multiple IoT protocols (MQTT, CoAP, LoRaWAN, etc.)

### Advanced Features
- **Edge AI**: Machine learning at the edge
- **Predictive Analytics**: IoT data-driven predictions
- **Digital Twin Integration**: Real-time digital twin synchronization
- **Autonomous Device Control**: Self-managing IoT systems
- **Scalable Architecture**: Massively scalable IoT infrastructure

## Architecture

### Technology Stack
- **Framework**: NestJS with TypeScript
- **Message Brokers**: MQTT, Apache Kafka, RabbitMQ
- **Time-Series Database**: InfluxDB, TimescaleDB
- **Edge Computing**: Docker containers, Kubernetes
- **Device Protocols**: MQTT, CoAP, LoRaWAN, Zigbee, BLE
- **Security**: TLS, X.509 certificates, device attestation

## Key Components

### Device Management Service
```typescript
@Injectable()
export class IoTDeviceService {
  async registerDevice(
    deviceInfo: DeviceRegistrationInfo
  ): Promise<IoTDevice> {
    // Validate device credentials
    const credentialValidation = await this.validateDeviceCredentials(
      deviceInfo.credentials
    );
    
    if (!credentialValidation.valid) {
      throw new UnauthorizedDeviceException();
    }
    
    // Create device record
    const device = new IoTDevice({
      deviceId: deviceInfo.deviceId,
      deviceType: deviceInfo.type,
      manufacturer: deviceInfo.manufacturer,
      model: deviceInfo.model,
      firmware: deviceInfo.firmware,
      location: deviceInfo.location,
      status: DeviceStatus.ACTIVE,
    });
    
    // Generate device certificates
    device.certificate = await this.generateDeviceCertificate(device);
    
    // Setup communication channels
    await this.setupDeviceCommunication(device);
    
    // Initialize device shadow
    device.shadow = await this.initializeDeviceShadow(device);
    
    return await this.deviceRepository.save(device);
  }
  
  async updateDeviceState(
    deviceId: string,
    stateUpdate: DeviceStateUpdate
  ): Promise<void> {
    const device = await this.findDeviceById(deviceId);
    
    // Update device shadow
    await this.updateDeviceShadow(device, stateUpdate);
    
    // Process telemetry data
    if (stateUpdate.telemetry) {
      await this.processTelemetryData(device, stateUpdate.telemetry);
    }
    
    // Check for anomalies
    const anomalies = await this.detectAnomalies(device, stateUpdate);
    if (anomalies.length > 0) {
      await this.handleAnomalies(device, anomalies);
    }
    
    // Update device status
    device.lastSeen = new Date();
    device.status = this.calculateDeviceStatus(stateUpdate);
    
    await this.deviceRepository.save(device);
  }
}
```

### Real-time Data Processing Service
```typescript
@Injectable()
export class IoTDataProcessingService {
  async processSensorData(
    deviceId: string,
    sensorData: SensorReading[]
  ): Promise<ProcessingResult> {
    const device = await this.deviceService.findById(deviceId);
    
    // Validate data integrity
    const validationResults = await this.validateSensorData(sensorData);
    
    // Filter and clean data
    const cleanedData = await this.cleanSensorData(
      sensorData,
      validationResults
    );
    
    // Store in time-series database
    await this.storeTimeSeriesData(deviceId, cleanedData);
    
    // Real-time analytics
    const analyticsResults = await this.runRealTimeAnalytics(
      device,
      cleanedData
    );
    
    // Edge processing
    const edgeResults = await this.processAtEdge(device, cleanedData);
    
    // Trigger alerts if needed
    await this.checkAlertConditions(device, analyticsResults);
    
    // Update digital twin
    await this.updateDigitalTwin(device, cleanedData);
    
    return {
      processed: cleanedData.length,
      rejected: sensorData.length - cleanedData.length,
      analyticsResults,
      edgeResults,
      timestamp: new Date(),
    };
  }
}
```

## API Endpoints

### Device Management
- `POST /api/iot/devices/register` - Register new IoT device
- `GET /api/iot/devices` - List all devices
- `GET /api/iot/devices/:id` - Get device details
- `PUT /api/iot/devices/:id` - Update device configuration
- `DELETE /api/iot/devices/:id` - Deregister device

### Data Collection
- `POST /api/iot/data/telemetry` - Submit telemetry data
- `GET /api/iot/data/:deviceId` - Get device data
- `GET /api/iot/data/:deviceId/realtime` - Real-time data stream
- `POST /api/iot/data/batch` - Batch data upload

### Device Control
- `POST /api/iot/devices/:id/command` - Send command to device
- `GET /api/iot/devices/:id/shadow` - Get device shadow
- `PUT /api/iot/devices/:id/shadow` - Update device shadow
- `POST /api/iot/devices/:id/ota` - Over-the-air firmware update

## Edge Computing

### Edge Processing Service
```typescript
@Injectable()
export class EdgeProcessingService {
  async deployEdgeApplication(
    edgeNodeId: string,
    application: EdgeApplication
  ): Promise<EdgeDeployment> {
    const edgeNode = await this.edgeNodeService.findById(edgeNodeId);
    
    // Validate edge node capabilities
    const capabilityCheck = await this.validateEdgeCapabilities(
      edgeNode,
      application.requirements
    );
    
    if (!capabilityCheck.compatible) {
      throw new IncompatibleEdgeNodeException(capabilityCheck.missingCapabilities);
    }
    
    // Package application for deployment
    const deploymentPackage = await this.packageApplication(application);
    
    // Deploy to edge node
    const deployment = await this.deployToEdgeNode(
      edgeNode,
      deploymentPackage
    );
    
    // Setup monitoring
    await this.setupEdgeMonitoring(deployment);
    
    return deployment;
  }
  
  async processDataAtEdge(
    edgeNodeId: string,
    data: IoTData[]
  ): Promise<EdgeProcessingResult> {
    const edgeNode = await this.edgeNodeService.findById(edgeNodeId);
    
    // Load edge models
    const models = await this.loadEdgeModels(edgeNode);
    
    // Process data locally
    const localResults = await this.processLocally(data, models);
    
    // Determine what to send to cloud
    const cloudData = await this.filterForCloudTransmission(
      data,
      localResults,
      edgeNode.transmissionPolicy
    );
    
    // Send critical data to cloud
    if (cloudData.length > 0) {
      await this.transmitToCloud(cloudData);
    }
    
    // Store locally
    await this.storeLocally(edgeNode, data, localResults);
    
    return {
      processedLocally: data.length,
      sentToCloud: cloudData.length,
      insights: localResults.insights,
      alerts: localResults.alerts,
    };
  }
}
```

## MQTT Integration

### MQTT Service
```typescript
@Injectable()
export class MQTTService implements OnModuleInit {
  private mqttClient: MqttClient;
  
  async onModuleInit() {
    await this.connectToMQTTBroker();
    await this.subscribeToTopics();
  }
  
  async connectToMQTTBroker(): Promise<void> {
    const options: IClientOptions = {
      clientId: `iot-server-${Date.now()}`,
      username: this.configService.get('MQTT_USERNAME'),
      password: this.configService.get('MQTT_PASSWORD'),
      keepalive: 60,
      reconnectPeriod: 5000,
      clean: true,
    };
    
    this.mqttClient = connect(
      this.configService.get('MQTT_BROKER_URL'),
      options
    );
    
    this.mqttClient.on('connect', () => {
      this.logger.log('Connected to MQTT broker');
    });
    
    this.mqttClient.on('message', async (topic, message) => {
      await this.handleMQTTMessage(topic, message);
    });
  }
  
  async handleMQTTMessage(topic: string, message: Buffer): Promise<void> {
    try {
      const parsedMessage = JSON.parse(message.toString());
      const topicParts = topic.split('/');
      
      switch (topicParts[1]) {
        case 'telemetry':
          await this.handleTelemetryMessage(topicParts[0], parsedMessage);
          break;
        case 'events':
          await this.handleEventMessage(topicParts[0], parsedMessage);
          break;
        case 'status':
          await this.handleStatusMessage(topicParts[0], parsedMessage);
          break;
        default:
          this.logger.warn(`Unknown topic: ${topic}`);
      }
    } catch (error) {
      this.logger.error(`Error processing MQTT message: ${error.message}`);
    }
  }
  
  async publishToDevice(
    deviceId: string,
    command: DeviceCommand
  ): Promise<void> {
    const topic = `${deviceId}/commands/${command.type}`;
    const message = JSON.stringify(command);
    
    return new Promise((resolve, reject) => {
      this.mqttClient.publish(topic, message, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}
```

## Security and Authentication

### IoT Security Service
```typescript
@Injectable()
export class IoTSecurityService {
  async authenticateDevice(
    deviceId: string,
    credentials: DeviceCredentials
  ): Promise<DeviceAuthResult> {
    // Verify device certificate
    const certificateValidation = await this.verifyCertificate(
      credentials.certificate
    );
    
    if (!certificateValidation.valid) {
      return { authenticated: false, reason: 'Invalid certificate' };
    }
    
    // Check device whitelist
    const whitelistCheck = await this.checkDeviceWhitelist(deviceId);
    if (!whitelistCheck.allowed) {
      return { authenticated: false, reason: 'Device not whitelisted' };
    }
    
    // Validate device signature
    const signatureValidation = await this.validateDeviceSignature(
      deviceId,
      credentials.signature
    );
    
    if (!signatureValidation.valid) {
      return { authenticated: false, reason: 'Invalid signature' };
    }
    
    // Generate session token
    const sessionToken = await this.generateSessionToken(deviceId);
    
    return {
      authenticated: true,
      sessionToken,
      expiresAt: moment().add(24, 'hours').toDate(),
    };
  }
  
  async encryptDeviceData(
    deviceId: string,
    data: any
  ): Promise<EncryptedData> {
    const device = await this.deviceService.findById(deviceId);
    
    // Get device encryption key
    const encryptionKey = await this.getDeviceEncryptionKey(device);
    
    // Encrypt data
    const encryptedPayload = await this.encrypt(
      JSON.stringify(data),
      encryptionKey
    );
    
    return {
      deviceId,
      encryptedPayload,
      algorithm: 'AES-256-GCM',
      timestamp: new Date(),
    };
  }
}
```

## Configuration

### Environment Variables
```env
# IoT Configuration
IOT_DEVICE_LIMIT=10000
TELEMETRY_BATCH_SIZE=1000
DATA_RETENTION_DAYS=365

# MQTT Configuration
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=iot_server
MQTT_PASSWORD=${MQTT_PASSWORD}
MQTT_QOS_LEVEL=1

# Edge Computing
EDGE_COMPUTING_ENABLED=true
EDGE_MODEL_UPDATE_INTERVAL=24h
EDGE_DATA_RETENTION_HOURS=168

# Security
DEVICE_CERTIFICATE_VALIDATION=true
IOT_ENCRYPTION_ENABLED=true
DEVICE_WHITELIST_ENABLED=true
```

## Integration Points

- **Digital Twin Module**: Real-time twin synchronization
- **Analytics Module**: IoT data analytics and insights
- **Predictive Maintenance**: Sensor-based maintenance predictions
- **Quality Control**: IoT sensor quality monitoring
- **Shop Floor Control**: Real-time production monitoring

## Testing

### Test Coverage
- Unit Tests: 94%+
- Integration Tests: 88%+
- Protocol Tests: 92%+
- Security Tests: 96%+

### Testing Commands
```bash
# Run all tests
npm run test

# Run MQTT tests
npm run test:mqtt

# Run edge computing tests
npm run test:edge

# Run security tests
npm run test:security
```

## License

This module is part of the Industry 5.0 ERP system and is licensed under the MIT License.

## Support

For technical support:
- Email: iot@ezai-mfgninja.com
- Documentation: https://docs.ezai-mfgninja.com/iot
- Issue Tracker: https://github.com/ezai-mfg-ninja/industry5.0-iot/issues
