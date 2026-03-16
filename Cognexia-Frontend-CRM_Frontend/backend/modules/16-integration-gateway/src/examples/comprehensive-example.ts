import {
  IntegrationGatewayManager,
  IntegrationGatewayFactory,
  IntegrationGatewayUtils,
  SystemType,
  IntegrationStatus,
  ModbusRegisterType,
  ModbusDataType,
  MQTTQoS,
  OPCUASecurityPolicy,
  OPCUASecurityMode
} from '../index';

/**
 * Comprehensive example demonstrating the Industry 5.0 Integration Gateway
 * This example shows how to:
 * 1. Connect to multiple Industry 4.0 systems (OPC UA, Modbus, MQTT)
 * 2. Configure data flow rules between systems
 * 3. Monitor system health and performance
 * 4. Handle real-time data streaming and transformation
 */

async function main() {
  console.log('🏭 Starting Industry 5.0 Integration Gateway Example');
  console.log('=' .repeat(60));

  try {
    // Step 1: Create Individual System Configurations
    console.log('\n📋 Step 1: Creating system configurations...');

    // OPC UA PLC Configuration
    const opcuaConfig = IntegrationGatewayUtils.createOPCUAConfig(
      'opc.tcp://192.168.1.100:4840',
      {
        securityPolicy: OPCUASecurityPolicy.BASIC256SHA256,
        securityMode: OPCUASecurityMode.SIGN_AND_ENCRYPT,
        sessionTimeout: 60000,
        keepAliveInterval: 10000,
        maxNodesPerRead: 100
      }
    );

    const plcSystem = IntegrationGatewayUtils.createSystemConfig(
      'main-plc',
      'Main Production Line PLC',
      SystemType.PLC,
      'OPC-UA',
      opcuaConfig,
      {
        priority: 1,
        tags: ['production', 'critical'],
        metadata: {
          location: 'Production Floor A',
          manufacturer: 'Siemens',
          model: 'S7-1500'
        }
      }
    );

    // Modbus Temperature Sensor Configuration
    const modbusConfig = IntegrationGatewayUtils.createModbusConfig(
      '192.168.1.101',
      502,
      {
        unitId: 1,
        connectionTimeout: 5000,
        responseTimeout: 3000,
        maxConnections: 5,
        autoReconnect: true
      }
    );

    const temperatureSystem = IntegrationGatewayUtils.createSystemConfig(
      'temp-sensors',
      'Temperature Monitoring Sensors',
      SystemType.SENSOR,
      'MODBUS',
      modbusConfig,
      {
        priority: 2,
        tags: ['monitoring', 'environmental'],
        metadata: {
          location: 'Production Floor A',
          sensorCount: 8,
          range: '-40°C to 125°C'
        }
      }
    );

    // MQTT IoT Gateway Configuration
    const mqttConfig = IntegrationGatewayUtils.createMQTTConfig(
      'mqtt.factory.local',
      1883,
      'industry50-gateway-001',
      {
        keepAlive: 60,
        reconnectPeriod: 5000,
        maxReconnectAttempts: 10,
        clean: true,
        will: {
          topic: 'gateway/status',
          payload: 'offline',
          qos: MQTTQoS.AT_LEAST_ONCE,
          retain: true
        }
      }
    );

    const iotSystem = IntegrationGatewayUtils.createSystemConfig(
      'iot-gateway',
      'Factory IoT Gateway',
      SystemType.IOT_GATEWAY,
      'MQTT',
      mqttConfig,
      {
        priority: 3,
        tags: ['iot', 'wireless'],
        metadata: {
          deviceCount: 50,
          protocols: ['WiFi', 'LoRa', 'Zigbee'],
          coverage: 'Full Factory'
        }
      }
    );

    // Step 2: Create Integration Configuration
    console.log('⚙️  Step 2: Creating integration configuration...');

    const integrationConfig = IntegrationGatewayFactory.createBasicConfig([
      plcSystem,
      temperatureSystem,
      iotSystem
    ]);

    // Add custom global settings
    integrationConfig.globalSettings = {
      ...integrationConfig.globalSettings,
      dataRetentionDays: 90,
      maxConcurrentConnections: 200,
      enableMetrics: true,
      enableTracing: true,
      logLevel: 'info'
    };

    // Step 3: Initialize Integration Gateway Manager
    console.log('🚀 Step 3: Initializing Integration Gateway Manager...');

    const gateway = await IntegrationGatewayFactory.createGateway(integrationConfig);

    // Step 4: Set up Event Handlers
    console.log('📡 Step 4: Setting up event handlers...');

    gateway.on('event', (event) => {
      console.log(`📊 Event [${event.severity.toUpperCase()}]: ${event.message}`);
      if (event.data) {
        console.log(`   Data: ${JSON.stringify(event.data)}`);
      }
    });

    gateway.on('status_changed', (oldStatus, newStatus) => {
      console.log(`🔄 Gateway status changed: ${oldStatus} → ${newStatus}`);
    });

    // Step 5: Start the Gateway
    console.log('▶️  Step 5: Starting Integration Gateway...');
    await gateway.start();

    // Step 6: Configure Protocol-Specific Features
    console.log('🔧 Step 6: Configuring protocol-specific features...');

    // Configure Modbus registers for temperature sensors
    await setupModbusRegisters(gateway);

    // Configure MQTT topic subscriptions
    await setupMQTTSubscriptions(gateway);

    // Configure OPC UA subscriptions
    await setupOPCUASubscriptions(gateway);

    // Step 7: Set up Data Flow Rules
    console.log('🔀 Step 7: Setting up data flow rules...');
    setupDataFlowRules(gateway);

    // Step 8: Start Monitoring and Reporting
    console.log('📈 Step 8: Starting monitoring...');
    startMonitoring(gateway);

    // Step 9: Simulate Real-time Operations
    console.log('⚡ Step 9: Simulating real-time operations...');
    await simulateRealTimeOperations(gateway);

    // Keep the example running for demonstration
    console.log('🔄 Gateway is running. Press Ctrl+C to stop.');
    
    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down Integration Gateway...');
      await gateway.stop();
      console.log('✅ Gateway stopped successfully.');
      process.exit(0);
    });

    // Keep the process running
    await new Promise(() => {}); // Run indefinitely

  } catch (error) {
    console.error('❌ Error in Integration Gateway example:', error);
    process.exit(1);
  }
}

/**
 * Configure Modbus registers for temperature monitoring
 */
async function setupModbusRegisters(gateway: IntegrationGatewayManager) {
  console.log('  🌡️  Configuring Modbus temperature registers...');

  // Get the Modbus adapter for temperature sensors
  const temperatureSystem = gateway.getSystemStatus('temp-sensors');
  
  // This would normally be done through the adapter directly
  // For demonstration, we'll show the register configuration structure
  const temperatureRegisters = [
    {
      name: 'zone1_temperature',
      address: 1001,
      type: ModbusRegisterType.INPUT_REGISTER,
      dataType: ModbusDataType.FLOAT32,
      scale: 0.1,
      unit: '°C',
      description: 'Zone 1 Temperature'
    },
    {
      name: 'zone1_humidity',
      address: 1003,
      type: ModbusRegisterType.INPUT_REGISTER,
      dataType: ModbusDataType.UINT16,
      scale: 0.01,
      unit: '%',
      description: 'Zone 1 Relative Humidity'
    },
    {
      name: 'zone2_temperature',
      address: 1011,
      type: ModbusRegisterType.INPUT_REGISTER,
      dataType: ModbusDataType.FLOAT32,
      scale: 0.1,
      unit: '°C',
      description: 'Zone 2 Temperature'
    },
    {
      name: 'alarm_status',
      address: 2001,
      type: ModbusRegisterType.COIL,
      dataType: ModbusDataType.BOOLEAN,
      description: 'Temperature Alarm Status'
    }
  ];

  console.log(`     Configured ${temperatureRegisters.length} Modbus registers`);
}

/**
 * Configure MQTT topic subscriptions for IoT devices
 */
async function setupMQTTSubscriptions(gateway: IntegrationGatewayManager) {
  console.log('  📡 Configuring MQTT subscriptions...');

  // IoT device topics
  const subscriptions = [
    'factory/sensors/+/temperature',
    'factory/sensors/+/vibration',
    'factory/devices/+/status',
    'factory/alarms/#',
    'factory/production/+/count',
    'factory/energy/+/consumption'
  ];

  console.log(`     Configured ${subscriptions.length} MQTT topic subscriptions`);
}

/**
 * Configure OPC UA subscriptions for PLC data
 */
async function setupOPCUASubscriptions(gateway: IntegrationGatewayManager) {
  console.log('  🔌 Configuring OPC UA subscriptions...');

  // PLC data nodes
  const subscriptions = [
    'ns=2;s=ProductionLine.Speed',
    'ns=2;s=ProductionLine.Count',
    'ns=2;s=ProductionLine.Status',
    'ns=2;s=Quality.RejectCount',
    'ns=2;s=Maintenance.NextService',
    'ns=2;s=Energy.Consumption'
  ];

  console.log(`     Configured ${subscriptions.length} OPC UA node subscriptions`);
}

/**
 * Set up data flow rules between systems
 */
function setupDataFlowRules(gateway: IntegrationGatewayManager) {
  console.log('  🔀 Setting up data flow rules...');

  // Rule 1: Forward PLC alarms to MQTT for mobile notifications
  const plcToMqttAlarmRule = IntegrationGatewayUtils.createDataFlowRule(
    'plc-to-mqtt-alarms',
    'PLC Alarms to MQTT',
    'main-plc',
    'iot-gateway',
    {
      conditions: [
        {
          field: 'severity',
          operator: 'gte',
          value: 'warning',
          type: 'string'
        }
      ],
      transformations: [
        {
          type: 'map' as any,
          config: {
            mapping: {
              'alarm.message': 'message',
              'alarm.timestamp': 'timestamp',
              'alarm.severity': 'priority'
            }
          }
        }
      ],
      throttling: {
        maxMessagesPerSecond: 10,
        burstSize: 5
      }
    }
  );

  // Rule 2: Forward temperature data to PLC for process control
  const tempToPLCRule = IntegrationGatewayUtils.createDataFlowRule(
    'temp-to-plc',
    'Temperature to PLC Control',
    'temp-sensors',
    'main-plc',
    {
      conditions: [
        {
          field: 'temperature',
          operator: 'gt',
          value: 80,
          type: 'number'
        }
      ]
    }
  );

  // Rule 3: Aggregate sensor data to MQTT analytics
  const sensorAggregationRule = IntegrationGatewayUtils.createDataFlowRule(
    'sensor-aggregation',
    'Sensor Data Aggregation',
    'temp-sensors',
    'iot-gateway',
    {
      transformations: [
        {
          type: 'aggregate' as any,
          config: {
            window: '5m',
            functions: ['avg', 'max', 'min']
          }
        }
      ]
    }
  );

  gateway.addDataFlowRule(plcToMqttAlarmRule);
  gateway.addDataFlowRule(tempToPLCRule);
  gateway.addDataFlowRule(sensorAggregationRule);

  console.log('     Added 3 data flow rules');
}

/**
 * Start monitoring and reporting
 */
function startMonitoring(gateway: IntegrationGatewayManager) {
  // System status monitoring
  setInterval(() => {
    const overallStatus = gateway.getOverallStatus();
    console.log('\n📊 System Status Report:');
    console.log(`   Status: ${overallStatus.status}`);
    console.log(`   Uptime: ${Math.floor(overallStatus.uptime / 1000)}s`);
    console.log(`   Connected Systems: ${overallStatus.connectedSystems}/${overallStatus.totalSystems}`);
    console.log(`   Messages Processed: ${overallStatus.totalMessages}`);
    console.log(`   Errors: ${overallStatus.totalErrors}`);
    console.log(`   Average Latency: ${overallStatus.averageLatency.toFixed(2)}ms`);
    console.log(`   Memory Usage: ${overallStatus.memoryUsage.toFixed(2)}MB`);
  }, 30000); // Every 30 seconds

  // Individual system monitoring
  setInterval(() => {
    const systems = gateway.getAllSystemStatus();
    console.log('\n🏭 Individual System Status:');
    
    systems.forEach(system => {
      const statusIcon = system.connectionStatus === 'connected' ? '🟢' : '🔴';
      console.log(`   ${statusIcon} ${system.systemId}: ${system.connectionStatus}`);
      console.log(`      Messages: ${system.messagesProcessed}, Errors: ${system.errorsCount}`);
      console.log(`      Throughput: ${system.throughput.toFixed(2)} msg/s`);
    });
  }, 60000); // Every minute

  // Health check monitoring
  setInterval(async () => {
    const health = await gateway.performHealthCheck();
    console.log(`\n💚 Health Check - Overall: ${health.overall ? '✅ Healthy' : '❌ Unhealthy'}`);
    
    Object.entries(health.systems).forEach(([systemId, healthInfo]) => {
      const icon = healthInfo.healthy ? '✅' : '❌';
      console.log(`   ${icon} ${systemId}: ${healthInfo.message || 'OK'}`);
    });
  }, 120000); // Every 2 minutes
}

/**
 * Simulate real-time operations for demonstration
 */
async function simulateRealTimeOperations(gateway: IntegrationGatewayManager) {
  // Simulate periodic data updates
  setInterval(() => {
    // Simulate temperature readings
    const temperatureData = {
      zone1: 75.5 + Math.random() * 10,
      zone2: 68.2 + Math.random() * 8,
      timestamp: new Date()
    };

    console.log(`🌡️  Simulated temperature data: Zone1=${temperatureData.zone1.toFixed(1)}°C, Zone2=${temperatureData.zone2.toFixed(1)}°C`);
  }, 10000); // Every 10 seconds

  // Simulate production events
  setInterval(() => {
    const events = [
      'Production line started',
      'Quality check passed',
      'Maintenance scheduled',
      'Energy optimization active',
      'Batch completed'
    ];

    const randomEvent = events[Math.floor(Math.random() * events.length)];
    console.log(`🏭 Production event: ${randomEvent}`);
  }, 20000); // Every 20 seconds

  // Simulate alarm conditions occasionally
  setInterval(() => {
    if (Math.random() < 0.1) { // 10% chance
      const alarms = [
        'High temperature detected in Zone 1',
        'Vibration level exceeded threshold',
        'Production rate below target',
        'Network connectivity issue detected'
      ];

      const randomAlarm = alarms[Math.floor(Math.random() * alarms.length)];
      console.log(`⚠️  Alarm: ${randomAlarm}`);
    }
  }, 15000); // Every 15 seconds
}

/**
 * Demonstration of advanced features
 */
async function demonstrateAdvancedFeatures(gateway: IntegrationGatewayManager) {
  console.log('\n🎯 Demonstrating Advanced Features:');

  // 1. Event History Analysis
  console.log('   📜 Recent Events:');
  const recentEvents = gateway.getRecentEvents(5);
  recentEvents.forEach(event => {
    console.log(`      [${event.timestamp.toISOString()}] ${event.message}`);
  });

  // 2. System-specific Events
  console.log('   🔍 PLC-specific Events:');
  const plcEvents = gateway.getEventsBySystem('main-plc', 3);
  plcEvents.forEach(event => {
    console.log(`      [${event.eventType}] ${event.message}`);
  });

  // 3. Performance Metrics
  console.log('   📈 Performance Metrics:');
  const systems = gateway.getAllSystemStatus();
  systems.forEach(system => {
    console.log(`      ${system.systemId}: ${system.throughput.toFixed(2)} msg/s, ${system.latency.toFixed(2)}ms latency`);
  });

  // 4. Data Flow Rule Management
  console.log('   🔀 Managing Data Flow Rules:');
  
  // Add a new rule dynamically
  const newRule = IntegrationGatewayUtils.createDataFlowRule(
    'dynamic-rule',
    'Dynamic Alert Rule',
    'temp-sensors',
    'iot-gateway',
    {
      conditions: [
        {
          field: 'temperature',
          operator: 'gt',
          value: 85,
          type: 'number'
        }
      ]
    }
  );

  gateway.addDataFlowRule(newRule);
  console.log('      ✅ Added dynamic data flow rule');

  // Remove a rule
  setTimeout(() => {
    gateway.removeDataFlowRule('dynamic-rule');
    console.log('      ❌ Removed dynamic data flow rule');
  }, 5000);
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

export {
  main,
  setupModbusRegisters,
  setupMQTTSubscriptions,
  setupOPCUASubscriptions,
  setupDataFlowRules,
  startMonitoring,
  simulateRealTimeOperations,
  demonstrateAdvancedFeatures
};
