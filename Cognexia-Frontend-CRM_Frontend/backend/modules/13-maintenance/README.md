# Maintenance Module (13-maintenance)

## Overview

The **Maintenance Module** is a comprehensive computerized maintenance management system (CMMS) designed for Industry 5.0 smart manufacturing. It provides predictive maintenance, preventive maintenance scheduling, asset management, and AI-powered maintenance optimization to maximize equipment uptime and reduce costs.

## Features

### Core Maintenance Management
- **Predictive Maintenance**: AI-powered failure prediction
- **Preventive Maintenance**: Scheduled maintenance planning
- **Corrective Maintenance**: Reactive maintenance management
- **Asset Management**: Complete asset lifecycle management
- **Work Order Management**: Digital maintenance work orders

### Advanced Capabilities
- **AI-Powered Analytics**: Machine learning for maintenance optimization
- **IoT Integration**: Real-time sensor-based monitoring
- **Digital Twin Integration**: Virtual asset maintenance modeling
- **Mobile Maintenance**: Mobile-first maintenance workflows
- **Autonomous Maintenance**: Self-managing maintenance systems

## Architecture

### Technology Stack
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL + InfluxDB for sensor data
- **AI/ML**: TensorFlow.js for predictive models
- **Mobile**: React Native mobile application
- **IoT Integration**: MQTT, OPC-UA protocols
- **Analytics**: Advanced statistical analysis

## Key Components

### Predictive Maintenance Service
```typescript
@Injectable()
export class PredictiveMaintenanceService {
  async predictFailure(
    assetId: string,
    sensorData: SensorReading[]
  ): Promise<FailurePrediction> {
    const asset = await this.assetService.findById(assetId);
    
    // Load predictive model for asset type
    const model = await this.loadPredictiveModel(asset.type);
    
    // Prepare sensor data features
    const features = await this.extractFeatures(sensorData, asset);
    
    // Run prediction
    const prediction = model.predict(features);
    
    // Calculate remaining useful life (RUL)
    const remainingLife = await this.calculateRUL(
      prediction,
      asset.operatingHours
    );
    
    // Determine maintenance priority
    const priority = this.calculateMaintenancePriority(
      remainingLife,
      asset.criticality
    );
    
    // Generate maintenance recommendations
    const recommendations = await this.generateRecommendations(
      asset,
      prediction,
      remainingLife
    );
    
    return {
      assetId,
      failureProbability: prediction.probability,
      remainingUsefulLife: remainingLife,
      priority,
      recommendations,
      confidence: prediction.confidence,
      nextCheckDate: this.calculateNextCheckDate(remainingLife),
      timestamp: new Date(),
    };
  }
}
```

### Work Order Management Service
```typescript
@Injectable()
export class WorkOrderService {
  async createMaintenanceWorkOrder(
    request: MaintenanceRequest
  ): Promise<WorkOrder> {
    // Validate maintenance request
    const validation = await this.validateMaintenanceRequest(request);
    
    if (!validation.valid) {
      throw new InvalidMaintenanceRequestException(validation.errors);
    }
    
    // Create work order
    const workOrder = new WorkOrder({
      type: request.type,
      priority: request.priority,
      assetId: request.assetId,
      description: request.description,
      estimatedDuration: request.estimatedDuration,
      requiredSkills: request.requiredSkills,
      requiredParts: request.requiredParts,
      status: WorkOrderStatus.OPEN,
    });
    
    // Schedule work order
    const scheduling = await this.scheduleWorkOrder(workOrder);
    workOrder.scheduledDate = scheduling.scheduledDate;
    workOrder.assignedTechnician = scheduling.technician;
    
    // Reserve required parts
    if (workOrder.requiredParts?.length > 0) {
      await this.reserveParts(workOrder.id, workOrder.requiredParts);
    }
    
    // Send notifications
    await this.notifyStakeholders(workOrder);
    
    return await this.workOrderRepository.save(workOrder);
  }
  
  async executeWorkOrder(
    workOrderId: string,
    executionData: WorkOrderExecution
  ): Promise<WorkOrderResult> {
    const workOrder = await this.findById(workOrderId);
    
    // Update work order status
    workOrder.status = WorkOrderStatus.IN_PROGRESS;
    workOrder.actualStartTime = new Date();
    
    // Record maintenance activities
    const activities = await this.recordActivities(
      workOrder,
      executionData.activities
    );
    
    // Update asset condition
    await this.updateAssetCondition(
      workOrder.assetId,
      executionData.assetCondition
    );
    
    // Consume parts
    if (executionData.partsUsed?.length > 0) {
      await this.consumeParts(workOrder.id, executionData.partsUsed);
    }
    
    // Complete work order
    workOrder.status = WorkOrderStatus.COMPLETED;
    workOrder.actualEndTime = new Date();
    workOrder.actualDuration = this.calculateDuration(
      workOrder.actualStartTime,
      workOrder.actualEndTime
    );
    
    // Generate completion report
    const completionReport = await this.generateCompletionReport(
      workOrder,
      activities
    );
    
    return {
      workOrder: await this.workOrderRepository.save(workOrder),
      activities,
      completionReport,
      nextMaintenanceDate: await this.calculateNextMaintenance(workOrder.assetId),
    };
  }
}
```

## API Endpoints

### Asset Management
- `GET /api/maintenance/assets` - List maintenance assets
- `POST /api/maintenance/assets` - Create asset record
- `GET /api/maintenance/assets/:id` - Get asset details
- `PUT /api/maintenance/assets/:id` - Update asset information
- `GET /api/maintenance/assets/:id/history` - Get maintenance history

### Work Order Management
- `POST /api/maintenance/work-orders` - Create work order
- `GET /api/maintenance/work-orders` - List work orders
- `PUT /api/maintenance/work-orders/:id/execute` - Execute work order
- `GET /api/maintenance/work-orders/:id/status` - Get work order status

### Predictive Maintenance
- `GET /api/maintenance/predictions` - Get failure predictions
- `POST /api/maintenance/predictions/analyze` - Analyze asset condition
- `GET /api/maintenance/assets/:id/rul` - Get remaining useful life
- `POST /api/maintenance/models/train` - Train predictive models

### Preventive Maintenance
- `GET /api/maintenance/schedules` - Get maintenance schedules
- `POST /api/maintenance/schedules` - Create maintenance schedule
- `PUT /api/maintenance/schedules/:id` - Update schedule
- `POST /api/maintenance/schedules/:id/execute` - Execute scheduled maintenance

## Configuration

### Environment Variables
```env
# Maintenance Configuration
PREDICTIVE_MAINTENANCE_ENABLED=true
PREVENTIVE_MAINTENANCE_ENABLED=true
MOBILE_APP_ENABLED=true
IOT_INTEGRATION_ENABLED=true

# AI/ML Configuration
FAILURE_PREDICTION_THRESHOLD=0.8
MODEL_UPDATE_INTERVAL=24h
RUL_CALCULATION_METHOD=regression

# Scheduling Configuration
MAINTENANCE_SCHEDULING_ALGORITHM=genetic
TECHNICIAN_UTILIZATION_TARGET=0.85
EMERGENCY_RESPONSE_TIME_MINUTES=30
```

## Integration Points

- **IoT Module**: Real-time sensor data for predictive maintenance
- **Shop Floor Control**: Equipment status integration
- **Inventory Module**: Spare parts management
- **Analytics Module**: Maintenance analytics and reporting
- **Digital Twin**: Virtual asset maintenance simulation

## License

This module is part of the Industry 5.0 ERP system and is licensed under the MIT License.

## Support

For technical support:
- Email: maintenance@ezai-mfgninja.com
- Documentation: https://docs.ezai-mfgninja.com/maintenance
- Issue Tracker: https://github.com/ezai-mfg-ninja/industry5.0-maintenance/issues
