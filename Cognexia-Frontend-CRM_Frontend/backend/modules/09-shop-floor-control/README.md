# Shop Floor Control Module (09-shop-floor-control)

## Overview

The **Shop Floor Control Module** is a comprehensive manufacturing execution system (MES) designed for Industry 5.0 smart factories. It provides real-time shop floor monitoring, SCADA integration, production control, and manufacturing execution capabilities with AI-powered optimization and autonomous decision-making.

## Features

### Core Shop Floor Control
- **Manufacturing Execution System (MES)**: Complete MES functionality
- **SCADA Integration**: Real-time supervisory control and data acquisition
- **Production Tracking**: Real-time production monitoring and tracking
- **Work Order Management**: Digital work order processing and execution
- **Resource Management**: Equipment, labor, and material resource allocation

### Advanced Capabilities
- **Real-time Analytics**: Live production metrics and KPI monitoring
- **Predictive Control**: AI-powered production optimization
- **Digital Work Instructions**: Interactive digital work instructions
- **Quality Integration**: Inline quality control and monitoring
- **Autonomous Operations**: Self-optimizing production processes

## Architecture

### Technology Stack
- **Framework**: NestJS with TypeScript
- **Real-time Communication**: WebSockets, Server-Sent Events
- **Database**: PostgreSQL + InfluxDB for time-series data
- **Message Queuing**: Apache Kafka for real-time data streaming
- **SCADA Integration**: OPC-UA, Modbus, Ethernet/IP protocols
- **Visualization**: Real-time dashboards and HMI systems

## Key Components

### Production Control Service
```typescript
@Injectable()
export class ProductionControlService {
  async executeProductionOrder(
    orderId: string,
    workCenter: WorkCenter
  ): Promise<ProductionExecution> {
    // Get production order details
    const order = await this.productionOrderService.findById(orderId);
    
    // Verify resource availability
    const resourceCheck = await this.verifyResourceAvailability(
      order.requiredResources,
      workCenter
    );
    
    if (!resourceCheck.available) {
      throw new InsufficientResourcesException(resourceCheck.missingResources);
    }
    
    // Start production execution
    const execution = await this.startProduction(order, workCenter);
    
    // Initialize real-time monitoring
    await this.initiateRealTimeMonitoring(execution);
    
    return execution;
  }
}
```

### SCADA Integration Service
```typescript
@Injectable()
export class SCADAIntegrationService {
  async connectToSCADASystem(config: SCADAConfig): Promise<SCADAConnection> {
    const connection = new SCADAConnection(config);
    
    // Establish connection based on protocol
    switch (config.protocol) {
      case SCADAProtocol.OPC_UA:
        await this.connectOPCUA(connection, config);
        break;
      case SCADAProtocol.MODBUS:
        await this.connectModbus(connection, config);
        break;
      case SCADAProtocol.ETHERNET_IP:
        await this.connectEthernetIP(connection, config);
        break;
    }
    
    // Start data collection
    await this.startDataCollection(connection);
    
    return connection;
  }
  
  async readSCADAData(
    connection: SCADAConnection,
    tags: SCADATag[]
  ): Promise<SCADADataReading[]> {
    const readings: SCADADataReading[] = [];
    
    for (const tag of tags) {
      try {
        const value = await connection.readTag(tag.address);
        readings.push({
          tagId: tag.id,
          value,
          timestamp: new Date(),
          quality: 'GOOD',
        });
      } catch (error) {
        readings.push({
          tagId: tag.id,
          value: null,
          timestamp: new Date(),
          quality: 'BAD',
          error: error.message,
        });
      }
    }
    
    return readings;
  }
}
```

## API Endpoints

### Production Control
- `POST /api/shop-floor/production/start` - Start production order
- `PUT /api/shop-floor/production/:id/pause` - Pause production
- `PUT /api/shop-floor/production/:id/resume` - Resume production
- `POST /api/shop-floor/production/:id/complete` - Complete production
- `GET /api/shop-floor/production/status` - Get production status

### Work Order Management
- `GET /api/shop-floor/work-orders` - List active work orders
- `POST /api/shop-floor/work-orders` - Create work order
- `PUT /api/shop-floor/work-orders/:id` - Update work order
- `POST /api/shop-floor/work-orders/:id/assign` - Assign work order

### Real-time Data
- `GET /api/shop-floor/realtime/metrics` - Real-time production metrics
- `GET /api/shop-floor/realtime/equipment` - Equipment status
- `WebSocket /ws/shop-floor/realtime` - Real-time data stream
- `SSE /api/shop-floor/events` - Server-sent events

## Real-time Monitoring

### Production Metrics Dashboard
```typescript
@WebSocketGateway({
  namespace: 'shop-floor',
  cors: {
    origin: '*',
  },
})
export class ShopFloorGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  
  async handleConnection(client: Socket): Promise<void> {
    // Authenticate client
    const user = await this.authService.validateWebSocketClient(client);
    
    // Subscribe to production data
    await this.subscribeToProductionData(client, user);
  }
  
  @SubscribeMessage('request-production-metrics')
  async handleProductionMetrics(
    @ConnectedSocket() client: Socket,
    @MessageBody() request: MetricsRequest
  ): Promise<void> {
    const metrics = await this.metricsService.getRealTimeMetrics(
      request.workCenter,
      request.timeRange
    );
    
    client.emit('production-metrics', metrics);
  }
  
  // Broadcast real-time updates
  @Interval(1000) // Every second
  async broadcastRealTimeData(): Promise<void> {
    const productionData = await this.getLatestProductionData();
    this.server.emit('production-update', productionData);
  }
}
```

### Equipment Monitoring
```typescript
@Injectable()
export class EquipmentMonitoringService {
  async monitorEquipmentHealth(): Promise<EquipmentHealthReport> {
    const equipment = await this.equipmentService.findAll();
    const healthReports: EquipmentHealthStatus[] = [];
    
    for (const machine of equipment) {
      const sensorData = await this.scadaService.readMachineSensors(machine.id);
      const healthStatus = await this.analyzeEquipmentHealth(
        machine,
        sensorData
      );
      
      // Predict potential failures
      const failurePrediction = await this.predictFailure(
        machine,
        sensorData
      );
      
      healthReports.push({
        machineId: machine.id,
        status: healthStatus.overall,
        sensors: sensorData,
        prediction: failurePrediction,
        recommendations: healthStatus.recommendations,
      });
      
      // Trigger alerts for critical conditions
      if (healthStatus.overall === 'CRITICAL') {
        await this.alertService.sendCriticalAlert(machine, healthStatus);
      }
    }
    
    return {
      overallHealth: this.calculateOverallHealth(healthReports),
      equipmentStatus: healthReports,
      timestamp: new Date(),
    };
  }
}
```

## AI-Powered Features

### Production Optimization
```typescript
@Injectable()
export class ProductionOptimizationService {
  async optimizeProductionSchedule(
    workCenter: WorkCenter,
    orders: ProductionOrder[]
  ): Promise<OptimizedSchedule> {
    // Collect current production data
    const currentState = await this.getCurrentProductionState(workCenter);
    
    // Load AI optimization model
    const model = await this.loadOptimizationModel();
    
    // Prepare optimization parameters
    const parameters = {
      orders,
      resources: workCenter.resources,
      constraints: workCenter.constraints,
      objectives: ['minimize_makespan', 'maximize_utilization'],
    };
    
    // Run optimization algorithm
    const optimizedSchedule = await this.geneticAlgorithm.optimize(parameters);
    
    // Validate feasibility
    const feasibilityCheck = await this.validateScheduleFeasibility(
      optimizedSchedule
    );
    
    if (!feasibilityCheck.feasible) {
      // Apply constraint relaxation
      return await this.optimizeWithRelaxedConstraints(parameters);
    }
    
    return optimizedSchedule;
  }
}
```

## Integration Points

### Manufacturing Systems Integration
```typescript
interface ShopFloorIntegrations {
  // Core Manufacturing Modules
  productionPlanning: ProductionPlanningModule;
  quality: QualityModule;
  maintenance: MaintenanceModule;
  inventory: InventoryModule;
  
  // External Systems
  scada: SCADASystem[];
  plc: PLCSystem[];
  hmi: HMISystem[];
  robotics: RoboticsSystem[];
  
  // Data Sources
  sensors: SensorNetwork;
  cameras: VisionSystem;
  rfid: RFIDSystem;
  barcode: BarcodeSystem;
}
```

## Performance Metrics

### Key Performance Indicators (KPIs)
```typescript
interface ShopFloorKPIs {
  // Production Metrics
  overallEquipmentEffectiveness: number; // OEE
  throughput: number;
  cycleTime: Duration;
  taktTime: Duration;
  
  // Quality Metrics
  firstPassYield: number;
  defectRate: number;
  reworkRate: number;
  
  // Efficiency Metrics
  utilization: number;
  availability: number;
  performance: number;
  
  // Cost Metrics
  costPerUnit: number;
  laborEfficiency: number;
  energyConsumption: number;
}
```

### Real-time Analytics
```typescript
@Injectable()
export class ShopFloorAnalyticsService {
  async calculateOEE(
    equipmentId: string,
    timeRange: TimeRange
  ): Promise<OEECalculation> {
    const productionData = await this.getProductionData(equipmentId, timeRange);
    
    // Calculate Availability
    const plannedTime = timeRange.duration;
    const downtime = await this.calculateDowntime(equipmentId, timeRange);
    const availability = (plannedTime - downtime) / plannedTime;
    
    // Calculate Performance
    const actualProduction = productionData.unitsProduced;
    const theoreticalProduction = productionData.idealCycleTime * 
                                  productionData.operatingTime;
    const performance = actualProduction / theoreticalProduction;
    
    // Calculate Quality
    const goodUnits = productionData.unitsProduced - productionData.defectiveUnits;
    const quality = goodUnits / productionData.unitsProduced;
    
    const oee = availability * performance * quality;
    
    return {
      oee,
      availability,
      performance,
      quality,
      breakdown: {
        plannedTime,
        downtime,
        actualProduction,
        theoreticalProduction,
        goodUnits,
        defectiveUnits: productionData.defectiveUnits,
      },
    };
  }
}
```

## Configuration

### Environment Variables
```env
# Shop Floor Configuration
SHOP_FLOOR_MODE=production
REAL_TIME_UPDATES=true
OEE_CALCULATION_INTERVAL=300000

# SCADA Configuration
SCADA_PROTOCOL=OPC_UA
SCADA_ENDPOINT=opc.tcp://scada-server:4840
SCADA_POLLING_INTERVAL=1000

# Database Configuration
TIMESERIES_DB=influxdb
INFLUXDB_URL=http://influxdb:8086
INFLUXDB_BUCKET=shop_floor_data

# Kafka Configuration
KAFKA_BROKERS=kafka1:9092,kafka2:9092
KAFKA_TOPIC_PREFIX=shop_floor
```

## Security and Safety

### Safety Systems Integration
```typescript
@Injectable()
export class SafetySystemService {
  async checkSafetyConditions(
    operation: ShopFloorOperation
  ): Promise<SafetyAssessment> {
    const safetyChecks = await Promise.all([
      this.checkEmergencyStops(),
      this.checkSafetyBarriers(),
      this.checkPersonnelSafety(),
      this.checkEquipmentSafety(),
    ]);
    
    const overallSafety = safetyChecks.every(check => check.safe);
    
    if (!overallSafety) {
      await this.triggerSafetyShutdown(operation);
    }
    
    return {
      safe: overallSafety,
      checks: safetyChecks,
      timestamp: new Date(),
    };
  }
}
```

## Testing

### Test Coverage
- Unit Tests: 95%+
- Integration Tests: 90%+
- SCADA Tests: 85%+
- Real-time Tests: 88%+

### Testing Commands
```bash
# Run all tests
npm run test

# Run SCADA integration tests
npm run test:scada

# Run real-time communication tests
npm run test:realtime

# Performance tests
npm run test:performance
```

## Deployment

### Production Deployment
```bash
# Build application
npm run build

# Start production server
npm run start:prod

# Health check
curl http://localhost:3000/api/shop-floor/health
```

### Docker Configuration
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

## Monitoring and Alerting

### Alert Types
- **Equipment Failure**: Immediate notification
- **Production Delays**: Schedule impact alerts
- **Quality Issues**: Quality threshold breaches
- **Safety Violations**: Critical safety alerts
- **Performance Degradation**: Efficiency drop alerts

## License

This module is part of the Industry 5.0 ERP system and is licensed under the MIT License.

## Support

For technical support:
- Email: shop-floor-control@ezai-mfgninja.com
- Documentation: https://docs.ezai-mfgninja.com/shop-floor-control
- Issue Tracker: https://github.com/ezai-mfg-ninja/industry5.0-shop-floor-control/issues
