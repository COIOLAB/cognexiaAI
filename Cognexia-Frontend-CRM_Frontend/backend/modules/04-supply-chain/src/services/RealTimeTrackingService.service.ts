/**
 * Real-Time Supply Chain Tracking Service
 * Advanced IoT and Blockchain-Enabled Live Monitoring
 * Industry 5.0 ERP - Real-Time Supply Chain Visibility
 */

import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server } from 'socket.io';

// Interfaces and DTOs
export interface TrackingPoint {
  id: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    facility?: string;
    zone?: string;
  };
  status: 'in_transit' | 'at_facility' | 'loading' | 'unloading' | 'delayed' | 'delivered' | 'exception';
  metadata: {
    temperature?: number;
    humidity?: number;
    pressure?: number;
    shock?: number;
    vibration?: number;
    light?: number;
    battery?: number;
    signal?: number;
  };
  events: TrackingEvent[];
  blockchain: {
    transactionHash?: string;
    blockNumber?: number;
    verified: boolean;
  };
}

export interface TrackingEvent {
  id: string;
  timestamp: Date;
  type: 'departure' | 'arrival' | 'checkpoint' | 'exception' | 'alert' | 'milestone' | 'customs' | 'inspection';
  description: string;
  location: string;
  severity: 'info' | 'warning' | 'critical';
  source: 'gps' | 'rfid' | 'barcode' | 'manual' | 'iot_sensor' | 'carrier' | 'customs';
  verified: boolean;
}

export interface ShipmentTracking {
  shipmentId: string;
  trackingNumber: string;
  status: 'created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception' | 'cancelled';
  currentLocation: TrackingPoint;
  destination: {
    address: string;
    coordinates: { latitude: number; longitude: number };
    expectedArrival: Date;
  };
  journey: {
    origin: TrackingPoint;
    checkpoints: TrackingPoint[];
    currentPosition: TrackingPoint;
    destination: TrackingPoint;
    estimatedTimeToDestination: number;
    distanceRemaining: number;
    completionPercentage: number;
  };
  carrier: {
    name: string;
    vehicleId?: string;
    driverId?: string;
    contactInfo?: string;
  };
  cargo: {
    items: CargoItem[];
    totalWeight: number;
    totalVolume: number;
    specialHandling?: string[];
    temperatureRequirements?: { min: number; max: number };
  };
  timeline: TrackingEvent[];
  alerts: TrackingAlert[];
  iotData: IoTSensorReading[];
  blockchain: BlockchainRecord;
}

export interface CargoItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  weight: number;
  volume: number;
  value: number;
  serialNumbers?: string[];
  batchNumber?: string;
  expirationDate?: Date;
  specialRequirements?: string[];
}

export interface TrackingAlert {
  id: string;
  timestamp: Date;
  type: 'delay' | 'route_deviation' | 'temperature_breach' | 'damage' | 'theft' | 'customs_delay' | 'weather' | 'breakdown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  location: string;
  affectedItems?: string[];
  estimatedImpact: {
    deliveryDelay: number;
    additionalCost: number;
    riskLevel: number;
  };
  actionRequired: boolean;
  assignedTo?: string;
  resolvedAt?: Date;
  mitigationActions: string[];
}

export interface IoTSensorReading {
  sensorId: string;
  sensorType: 'temperature' | 'humidity' | 'pressure' | 'shock' | 'vibration' | 'gps' | 'light' | 'proximity';
  timestamp: Date;
  value: number;
  unit: string;
  threshold: { min?: number; max?: number };
  alert: boolean;
  calibrationDate: Date;
  batteryLevel: number;
  signalStrength: number;
  location?: { latitude: number; longitude: number };
}

export interface BlockchainRecord {
  transactionId: string;
  blockHash: string;
  blockNumber: number;
  timestamp: Date;
  events: {
    eventType: string;
    data: any;
    hash: string;
    previousHash: string;
  }[];
  verified: boolean;
  smartContractAddress?: string;
  gasUsed?: number;
  confirmations: number;
}

export interface InventoryTracking {
  itemId: string;
  sku: string;
  location: {
    warehouseId: string;
    zone: string;
    bin: string;
    shelf?: string;
    coordinates?: { x: number; y: number; z: number };
  };
  quantity: {
    onHand: number;
    reserved: number;
    available: number;
    damaged: number;
    expired: number;
  };
  movements: InventoryMovement[];
  lastMovement: Date;
  cycleCountDate: Date;
  alerts: string[];
  rfidTags: string[];
  serialNumbers: string[];
}

export interface InventoryMovement {
  id: string;
  timestamp: Date;
  type: 'inbound' | 'outbound' | 'transfer' | 'adjustment' | 'cycle_count' | 'return';
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  reason: string;
  userId: string;
  documentNumber?: string;
  verified: boolean;
}

export interface FleetTracking {
  vehicleId: string;
  vehicleType: 'truck' | 'van' | 'ship' | 'plane' | 'train';
  currentLocation: {
    latitude: number;
    longitude: number;
    address: string;
    speed: number;
    heading: number;
    altitude?: number;
  };
  status: 'idle' | 'en_route' | 'loading' | 'unloading' | 'maintenance' | 'breakdown';
  driver: {
    id: string;
    name: string;
    licenseNumber: string;
    contactNumber: string;
    hoursWorked: number;
    restBreakDue: Date;
  };
  cargo: {
    currentLoad: number;
    maxCapacity: number;
    utilizationPercentage: number;
    shipments: string[];
  };
  route: {
    planned: { latitude: number; longitude: number }[];
    actual: { latitude: number; longitude: number; timestamp: Date }[];
    deviations: RouteDeviation[];
    eta: Date;
    distanceRemaining: number;
  };
  telemetry: VehicleTelemetry;
  maintenance: {
    lastService: Date;
    nextService: Date;
    mileage: number;
    alerts: string[];
  };
}

export interface RouteDeviation {
  timestamp: Date;
  location: { latitude: number; longitude: number };
  deviation: number;
  reason?: string;
  approved: boolean;
}

export interface VehicleTelemetry {
  timestamp: Date;
  fuelLevel: number;
  engineTemperature: number;
  oilPressure: number;
  tiresPressure: number[];
  brakeSystem: number;
  batteryVoltage: number;
  emissions: number;
  engineHours: number;
  idleTime: number;
}

export interface RealTimeMetrics {
  totalShipments: {
    active: number;
    delivered: number;
    delayed: number;
    exceptions: number;
  };
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  customerSatisfactionScore: number;
  costPerShipment: number;
  carbonFootprint: number;
  alerts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  performanceKPIs: {
    fillRate: number;
    orderAccuracy: number;
    damageRate: number;
    inventoryTurnover: number;
  };
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class RealTimeTrackingService {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealTimeTrackingService.name);
  private trackingData: Map<string, ShipmentTracking> = new Map();
  private inventoryData: Map<string, InventoryTracking> = new Map();
  private fleetData: Map<string, FleetTracking> = new Map();
  private subscribers: Map<string, string[]> = new Map();

  constructor(
    private readonly eventEmitter: EventEmitter2
  ) {
    this.initializeRealTimeTracking();
  }

  /**
   * Initialize real-time tracking system
   */
  async initializeRealTimeTracking(): Promise<void> {
    this.logger.log('Initializing real-time tracking system');
    
    // Initialize mock data
    this.generateMockTrackingData();
    
    // Start real-time data streaming
    this.startDataStreaming();
    
    this.eventEmitter.emit('tracking.initialized', {
      timestamp: new Date(),
      shipmentsTracked: this.trackingData.size,
      inventoryItemsTracked: this.inventoryData.size,
      vehiclesTracked: this.fleetData.size
    });
  }

  /**
   * Track shipment in real-time
   */
  async trackShipment(shipmentId: string): Promise<ShipmentTracking | null> {
    const tracking = this.trackingData.get(shipmentId);
    
    if (!tracking) {
      this.logger.warn(`Shipment ${shipmentId} not found in tracking system`);
      return null;
    }

    // Update with latest real-time data
    await this.updateShipmentLocation(shipmentId);
    await this.updateIoTSensorData(shipmentId);
    await this.checkAlerts(shipmentId);

    return this.trackingData.get(shipmentId) || null;
  }

  /**
   * Get real-time location updates
   */
  async getLocationUpdates(shipmentId: string): Promise<TrackingPoint[]> {
    const tracking = this.trackingData.get(shipmentId);
    if (!tracking) return [];

    return [
      tracking.journey.origin,
      ...tracking.journey.checkpoints,
      tracking.journey.currentPosition
    ].filter(Boolean);
  }

  /**
   * Track inventory in real-time
   */
  async trackInventory(itemId: string): Promise<InventoryTracking | null> {
    const inventory = this.inventoryData.get(itemId);
    
    if (!inventory) {
      this.logger.warn(`Inventory item ${itemId} not found in tracking system`);
      return null;
    }

    // Update with latest RFID/sensor data
    await this.updateInventoryLocation(itemId);
    await this.checkInventoryAlerts(itemId);

    return this.inventoryData.get(itemId) || null;
  }

  /**
   * Track fleet vehicles in real-time
   */
  async trackVehicle(vehicleId: string): Promise<FleetTracking | null> {
    const vehicle = this.fleetData.get(vehicleId);
    
    if (!vehicle) {
      this.logger.warn(`Vehicle ${vehicleId} not found in tracking system`);
      return null;
    }

    // Update with latest GPS and telemetry data
    await this.updateVehicleLocation(vehicleId);
    await this.updateVehicleTelemetry(vehicleId);
    await this.checkVehicleAlerts(vehicleId);

    return this.fleetData.get(vehicleId) || null;
  }

  /**
   * Subscribe to real-time updates
   */
  @SubscribeMessage('subscribe')
  handleSubscription(client: any, payload: { type: string; ids: string[] }): void {
    const clientId = client.id;
    const subscriptionKey = `${payload.type}:${clientId}`;
    
    this.subscribers.set(subscriptionKey, payload.ids);
    
    this.logger.log(`Client ${clientId} subscribed to ${payload.type} updates for: ${payload.ids.join(', ')}`);
    
    client.emit('subscription_confirmed', {
      type: payload.type,
      ids: payload.ids,
      timestamp: new Date()
    });
  }

  /**
   * Unsubscribe from real-time updates
   */
  @SubscribeMessage('unsubscribe')
  handleUnsubscription(client: any, payload: { type: string }): void {
    const clientId = client.id;
    const subscriptionKey = `${payload.type}:${clientId}`;
    
    this.subscribers.delete(subscriptionKey);
    
    this.logger.log(`Client ${clientId} unsubscribed from ${payload.type} updates`);
    
    client.emit('unsubscription_confirmed', {
      type: payload.type,
      timestamp: new Date()
    });
  }

  /**
   * Get real-time metrics dashboard
   */
  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const shipmentStats = this.calculateShipmentStats();
    const performanceMetrics = this.calculatePerformanceMetrics();
    const alertStats = this.calculateAlertStats();

    return {
      totalShipments: shipmentStats,
      averageDeliveryTime: Math.random() * 48 + 24, // 24-72 hours
      onTimeDeliveryRate: Math.random() * 20 + 80, // 80-100%
      customerSatisfactionScore: Math.random() * 20 + 80, // 80-100%
      costPerShipment: Math.random() * 50 + 25, // $25-75
      carbonFootprint: Math.random() * 100 + 50, // kg CO2
      alerts: alertStats,
      performanceKPIs: performanceMetrics
    };
  }

  /**
   * Generate real-time reports
   */
  async generateRealTimeReport(parameters: {
    type: 'shipment' | 'inventory' | 'fleet' | 'performance';
    timeRange: { start: Date; end: Date };
    filters?: any;
  }): Promise<any> {
    this.logger.log(`Generating real-time report: ${parameters.type}`);

    const reportData = {
      id: `report-${Date.now()}`,
      type: parameters.type,
      generatedAt: new Date(),
      timeRange: parameters.timeRange,
      data: this.generateReportData(parameters.type),
      summary: {
        totalRecords: Math.floor(Math.random() * 1000) + 100,
        averageMetrics: this.generateAverageMetrics(),
        trends: this.generateTrends()
      }
    };

    // Emit report generated event
    this.eventEmitter.emit('report.generated', reportData);

    return reportData;
  }

  /**
   * IoT sensor data integration
   */
  async processIoTSensorData(sensorReading: IoTSensorReading): Promise<void> {
    this.logger.debug(`Processing IoT sensor data: ${sensorReading.sensorId}`);

    // Find associated shipment or inventory item
    const associatedShipment = this.findShipmentBySensor(sensorReading.sensorId);
    const associatedInventory = this.findInventoryBySensor(sensorReading.sensorId);

    if (associatedShipment) {
      const tracking = this.trackingData.get(associatedShipment);
      if (tracking) {
        tracking.iotData.push(sensorReading);

        // Check for threshold breaches
        if (sensorReading.alert) {
          await this.createAlert(associatedShipment, {
            type: this.mapSensorToAlertType(sensorReading.sensorType),
            severity: this.determineSeverity(sensorReading),
            message: `${sensorReading.sensorType} threshold breach: ${sensorReading.value} ${sensorReading.unit}`,
            location: 'IoT Sensor',
            timestamp: sensorReading.timestamp
          });
        }

        // Emit real-time update
        this.emitShipmentUpdate(associatedShipment, tracking);
      }
    }

    if (associatedInventory) {
      // Handle inventory sensor updates
      await this.updateInventoryFromSensor(associatedInventory, sensorReading);
    }
  }

  /**
   * Blockchain integration for immutable tracking
   */
  async recordToBlockchain(trackingEvent: TrackingEvent, entityId: string): Promise<BlockchainRecord> {
    this.logger.log(`Recording tracking event to blockchain: ${trackingEvent.id}`);

    // Mock blockchain recording
    const blockchainRecord: BlockchainRecord = {
      transactionId: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      blockHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      blockNumber: Math.floor(Math.random() * 1000000) + 100000,
      timestamp: new Date(),
      events: [{
        eventType: trackingEvent.type,
        data: trackingEvent,
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        previousHash: `0x${Math.random().toString(16).substr(2, 64)}`
      }],
      verified: true,
      smartContractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      gasUsed: Math.floor(Math.random() * 100000) + 21000,
      confirmations: 12
    };

    // Store blockchain record
    const tracking = this.trackingData.get(entityId);
    if (tracking) {
      tracking.blockchain = blockchainRecord;
    }

    // Emit blockchain event
    this.eventEmitter.emit('blockchain.recorded', {
      entityId,
      blockchainRecord,
      timestamp: new Date()
    });

    return blockchainRecord;
  }

  /**
   * Continuous real-time data updates
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async updateRealTimeData(): Promise<void> {
    try {
      // Update all shipments
      for (const [shipmentId, tracking] of this.trackingData.entries()) {
        if (tracking.status === 'in_transit') {
          await this.simulateLocationUpdate(shipmentId);
          await this.simulateIoTData(shipmentId);
        }
      }

      // Update fleet positions
      for (const [vehicleId, vehicle] of this.fleetData.entries()) {
        if (vehicle.status === 'en_route') {
          await this.simulateVehicleMovement(vehicleId);
        }
      }

      // Check for alerts
      await this.runAlertChecks();

      // Broadcast dashboard updates
      await this.broadcastDashboardUpdate();

    } catch (error) {
      this.logger.error('Error in real-time data update', error);
    }
  }

  /**
   * Alert monitoring and notification
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async monitorAlerts(): Promise<void> {
    try {
      for (const [shipmentId, tracking] of this.trackingData.entries()) {
        const newAlerts = await this.detectNewAlerts(shipmentId, tracking);
        
        for (const alert of newAlerts) {
          tracking.alerts.push(alert);
          
          // Emit alert event
          this.eventEmitter.emit('tracking.alert', {
            shipmentId,
            alert,
            timestamp: new Date()
          });
          
          // Send WebSocket notification
          this.server.emit('alert', { shipmentId, alert });
        }
      }
      
    } catch (error) {
      this.logger.error('Error in alert monitoring', error);
    }
  }

  // Private helper methods
  private async updateShipmentLocation(shipmentId: string): Promise<void> {
    const tracking = this.trackingData.get(shipmentId);
    if (!tracking) return;

    // Mock location update
    tracking.journey.currentPosition = {
      ...tracking.journey.currentPosition,
      location: {
        latitude: tracking.journey.currentPosition.location.latitude + (Math.random() - 0.5) * 0.01,
        longitude: tracking.journey.currentPosition.location.longitude + (Math.random() - 0.5) * 0.01,
        address: `Updated Location ${Date.now()}`
      },
      timestamp: new Date()
    };

    tracking.journey.estimatedTimeToDestination = Math.max(0, tracking.journey.estimatedTimeToDestination - 0.5);
    tracking.journey.completionPercentage = Math.min(100, tracking.journey.completionPercentage + 1);
  }

  private async updateIoTSensorData(shipmentId: string): Promise<void> {
    const tracking = this.trackingData.get(shipmentId);
    if (!tracking) return;

    // Mock IoT sensor reading
    const sensorReading: IoTSensorReading = {
      sensorId: `sensor-${shipmentId}`,
      sensorType: 'temperature',
      timestamp: new Date(),
      value: Math.random() * 30 + 15, // 15-45°C
      unit: '°C',
      threshold: { min: 2, max: 8 },
      alert: Math.random() > 0.9,
      calibrationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      batteryLevel: Math.random() * 100,
      signalStrength: Math.random() * 100
    };

    tracking.iotData.push(sensorReading);
  }

  private async checkAlerts(shipmentId: string): Promise<void> {
    const tracking = this.trackingData.get(shipmentId);
    if (!tracking) return;

    // Mock alert generation
    if (Math.random() > 0.95) {
      const alert: TrackingAlert = {
        id: `alert-${Date.now()}`,
        timestamp: new Date(),
        type: 'delay',
        severity: 'medium',
        message: 'Shipment experiencing minor delay due to traffic',
        location: tracking.journey.currentPosition.location.address || 'Unknown',
        estimatedImpact: {
          deliveryDelay: 2,
          additionalCost: 50,
          riskLevel: 0.3
        },
        actionRequired: false,
        mitigationActions: ['Monitor traffic conditions', 'Notify customer']
      };

      tracking.alerts.push(alert);
    }
  }

  private async updateInventoryLocation(itemId: string): Promise<void> {
    // Mock inventory location update
    const inventory = this.inventoryData.get(itemId);
    if (inventory) {
      inventory.lastMovement = new Date();
    }
  }

  private async checkInventoryAlerts(itemId: string): Promise<void> {
    // Mock inventory alert checking
    const inventory = this.inventoryData.get(itemId);
    if (inventory && Math.random() > 0.98) {
      inventory.alerts.push(`Low stock alert for ${itemId}`);
    }
  }

  private async updateVehicleLocation(vehicleId: string): Promise<void> {
    const vehicle = this.fleetData.get(vehicleId);
    if (!vehicle) return;

    // Mock vehicle location update
    vehicle.currentLocation = {
      ...vehicle.currentLocation,
      latitude: vehicle.currentLocation.latitude + (Math.random() - 0.5) * 0.001,
      longitude: vehicle.currentLocation.longitude + (Math.random() - 0.5) * 0.001,
      speed: Math.random() * 80 + 20,
      heading: Math.random() * 360
    };
  }

  private async updateVehicleTelemetry(vehicleId: string): Promise<void> {
    const vehicle = this.fleetData.get(vehicleId);
    if (!vehicle) return;

    // Mock telemetry update
    vehicle.telemetry = {
      timestamp: new Date(),
      fuelLevel: Math.random() * 100,
      engineTemperature: Math.random() * 50 + 80,
      oilPressure: Math.random() * 60 + 30,
      tiresPressure: Array.from({ length: 4 }, () => Math.random() * 50 + 30),
      brakeSystem: Math.random() * 100,
      batteryVoltage: Math.random() * 2 + 12,
      emissions: Math.random() * 100,
      engineHours: Math.random() * 10000,
      idleTime: Math.random() * 100
    };
  }

  private async checkVehicleAlerts(vehicleId: string): Promise<void> {
    const vehicle = this.fleetData.get(vehicleId);
    if (!vehicle) return;

    // Mock vehicle alert checking
    if (vehicle.telemetry.fuelLevel < 20) {
      vehicle.maintenance.alerts.push('Low fuel level');
    }
  }

  private startDataStreaming(): void {
    this.logger.log('Starting real-time data streaming');
    // Real-time streaming is handled by cron jobs and WebSocket events
  }

  private generateMockTrackingData(): void {
    // Generate mock shipment tracking data
    for (let i = 1; i <= 10; i++) {
      const shipmentId = `shipment-${i}`;
      const tracking: ShipmentTracking = {
        shipmentId,
        trackingNumber: `TRK${Date.now()}${i}`,
        status: 'in_transit',
        currentLocation: this.generateMockLocation(),
        destination: {
          address: `Destination ${i}`,
          coordinates: { latitude: Math.random() * 180 - 90, longitude: Math.random() * 360 - 180 },
          expectedArrival: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000)
        },
        journey: {
          origin: this.generateMockLocation(),
          checkpoints: [this.generateMockLocation(), this.generateMockLocation()],
          currentPosition: this.generateMockLocation(),
          destination: this.generateMockLocation(),
          estimatedTimeToDestination: Math.random() * 48,
          distanceRemaining: Math.random() * 500,
          completionPercentage: Math.random() * 100
        },
        carrier: {
          name: `Carrier ${i}`,
          vehicleId: `vehicle-${i}`,
          driverId: `driver-${i}`
        },
        cargo: {
          items: [this.generateMockCargoItem()],
          totalWeight: Math.random() * 1000,
          totalVolume: Math.random() * 100,
          specialHandling: ['fragile']
        },
        timeline: [this.generateMockEvent()],
        alerts: [],
        iotData: [],
        blockchain: this.generateMockBlockchainRecord()
      };

      this.trackingData.set(shipmentId, tracking);
    }

    // Generate mock inventory and fleet data
    this.generateMockInventoryData();
    this.generateMockFleetData();
  }

  private generateMockLocation(): TrackingPoint {
    return {
      id: `loc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      location: {
        latitude: Math.random() * 180 - 90,
        longitude: Math.random() * 360 - 180,
        address: `Mock Address ${Math.floor(Math.random() * 1000)}`
      },
      status: 'in_transit',
      metadata: {
        temperature: Math.random() * 30 + 15,
        humidity: Math.random() * 100
      },
      events: [],
      blockchain: {
        verified: true
      }
    };
  }

  private generateMockCargoItem(): CargoItem {
    return {
      id: `item-${Date.now()}`,
      sku: `SKU-${Math.floor(Math.random() * 10000)}`,
      name: `Product ${Math.floor(Math.random() * 100)}`,
      quantity: Math.floor(Math.random() * 100) + 1,
      weight: Math.random() * 50,
      volume: Math.random() * 10,
      value: Math.random() * 1000
    };
  }

  private generateMockEvent(): TrackingEvent {
    return {
      id: `event-${Date.now()}`,
      timestamp: new Date(),
      type: 'checkpoint',
      description: 'Package scanned at checkpoint',
      location: 'Checkpoint Alpha',
      severity: 'info',
      source: 'barcode',
      verified: true
    };
  }

  private generateMockBlockchainRecord(): BlockchainRecord {
    return {
      transactionId: `tx-${Date.now()}`,
      blockHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      blockNumber: Math.floor(Math.random() * 1000000),
      timestamp: new Date(),
      events: [],
      verified: true,
      confirmations: 12
    };
  }

  private generateMockInventoryData(): void {
    for (let i = 1; i <= 20; i++) {
      const itemId = `item-${i}`;
      const inventory: InventoryTracking = {
        itemId,
        sku: `SKU-${i}`,
        location: {
          warehouseId: `warehouse-${Math.floor(i / 5) + 1}`,
          zone: `Zone-${String.fromCharCode(65 + (i % 5))}`,
          bin: `Bin-${i}`
        },
        quantity: {
          onHand: Math.floor(Math.random() * 1000),
          reserved: Math.floor(Math.random() * 100),
          available: Math.floor(Math.random() * 900),
          damaged: Math.floor(Math.random() * 10),
          expired: Math.floor(Math.random() * 5)
        },
        movements: [],
        lastMovement: new Date(),
        cycleCountDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        alerts: [],
        rfidTags: [`RFID-${i}`],
        serialNumbers: [`SN-${i}`]
      };

      this.inventoryData.set(itemId, inventory);
    }
  }

  private generateMockFleetData(): void {
    for (let i = 1; i <= 5; i++) {
      const vehicleId = `vehicle-${i}`;
      const vehicle: FleetTracking = {
        vehicleId,
        vehicleType: 'truck',
        currentLocation: {
          latitude: Math.random() * 180 - 90,
          longitude: Math.random() * 360 - 180,
          address: `Vehicle Location ${i}`,
          speed: Math.random() * 80,
          heading: Math.random() * 360
        },
        status: 'en_route',
        driver: {
          id: `driver-${i}`,
          name: `Driver ${i}`,
          licenseNumber: `LIC-${i}`,
          contactNumber: `+1-555-${1000 + i}`,
          hoursWorked: Math.random() * 8,
          restBreakDue: new Date(Date.now() + Math.random() * 8 * 60 * 60 * 1000)
        },
        cargo: {
          currentLoad: Math.random() * 10000,
          maxCapacity: 15000,
          utilizationPercentage: Math.random() * 100,
          shipments: [`shipment-${i}`, `shipment-${i + 5}`]
        },
        route: {
          planned: [],
          actual: [],
          deviations: [],
          eta: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000),
          distanceRemaining: Math.random() * 500
        },
        telemetry: {
          timestamp: new Date(),
          fuelLevel: Math.random() * 100,
          engineTemperature: Math.random() * 50 + 80,
          oilPressure: Math.random() * 60 + 30,
          tiresPressure: Array.from({ length: 4 }, () => Math.random() * 50 + 30),
          brakeSystem: Math.random() * 100,
          batteryVoltage: Math.random() * 2 + 12,
          emissions: Math.random() * 100,
          engineHours: Math.random() * 10000,
          idleTime: Math.random() * 100
        },
        maintenance: {
          lastService: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          nextService: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
          mileage: Math.random() * 100000,
          alerts: []
        }
      };

      this.fleetData.set(vehicleId, vehicle);
    }
  }

  private calculateShipmentStats(): RealTimeMetrics['totalShipments'] {
    let active = 0, delivered = 0, delayed = 0, exceptions = 0;

    this.trackingData.forEach(tracking => {
      switch (tracking.status) {
        case 'in_transit': active++; break;
        case 'delivered': delivered++; break;
        case 'exception': exceptions++; break;
        default: active++;
      }
      
      if (tracking.alerts.some(alert => alert.type === 'delay')) {
        delayed++;
      }
    });

    return { active, delivered, delayed, exceptions };
  }

  private calculatePerformanceMetrics(): RealTimeMetrics['performanceKPIs'] {
    return {
      fillRate: Math.random() * 20 + 80, // 80-100%
      orderAccuracy: Math.random() * 10 + 90, // 90-100%
      damageRate: Math.random() * 5, // 0-5%
      inventoryTurnover: Math.random() * 12 + 6 // 6-18 times per year
    };
  }

  private calculateAlertStats(): RealTimeMetrics['alerts'] {
    let critical = 0, high = 0, medium = 0, low = 0;

    this.trackingData.forEach(tracking => {
      tracking.alerts.forEach(alert => {
        switch (alert.severity) {
          case 'critical': critical++; break;
          case 'high': high++; break;
          case 'medium': medium++; break;
          case 'low': low++; break;
        }
      });
    });

    return { critical, high, medium, low };
  }

  private generateReportData(type: string): any {
    // Mock report data generation
    return {
      type,
      records: Array.from({ length: 50 }, (_, i) => ({
        id: `record-${i}`,
        timestamp: new Date(),
        metrics: {
          value1: Math.random() * 100,
          value2: Math.random() * 1000,
          value3: Math.random() * 50
        }
      }))
    };
  }

  private generateAverageMetrics(): any {
    return {
      averageDeliveryTime: Math.random() * 48 + 24,
      averageCost: Math.random() * 50 + 25,
      averageAccuracy: Math.random() * 20 + 80
    };
  }

  private generateTrends(): any {
    return {
      deliveryTime: Array.from({ length: 7 }, () => Math.random() * 10 + 35),
      cost: Array.from({ length: 7 }, () => Math.random() * 20 + 30),
      accuracy: Array.from({ length: 7 }, () => Math.random() * 10 + 85)
    };
  }

  private findShipmentBySensor(sensorId: string): string | null {
    for (const [shipmentId, tracking] of this.trackingData.entries()) {
      if (tracking.iotData.some(data => data.sensorId === sensorId)) {
        return shipmentId;
      }
    }
    return null;
  }

  private findInventoryBySensor(sensorId: string): string | null {
    // Mock implementation
    return null;
  }

  private mapSensorToAlertType(sensorType: string): TrackingAlert['type'] {
    const mapping: Record<string, TrackingAlert['type']> = {
      temperature: 'temperature_breach',
      humidity: 'damage',
      shock: 'damage',
      gps: 'route_deviation'
    };
    return mapping[sensorType] || 'exception';
  }

  private determineSeverity(sensorReading: IoTSensorReading): TrackingAlert['severity'] {
    // Mock severity determination logic
    if (sensorReading.value > (sensorReading.threshold.max || 100) * 1.2) return 'critical';
    if (sensorReading.value > (sensorReading.threshold.max || 100)) return 'high';
    return 'medium';
  }

  private async createAlert(entityId: string, alertData: Partial<TrackingAlert>): Promise<void> {
    const alert: TrackingAlert = {
      id: `alert-${Date.now()}`,
      timestamp: new Date(),
      type: 'exception',
      severity: 'medium',
      message: '',
      location: '',
      estimatedImpact: { deliveryDelay: 0, additionalCost: 0, riskLevel: 0 },
      actionRequired: false,
      mitigationActions: [],
      ...alertData
    };

    const tracking = this.trackingData.get(entityId);
    if (tracking) {
      tracking.alerts.push(alert);
    }
  }

  private emitShipmentUpdate(shipmentId: string, tracking: ShipmentTracking): void {
    this.server.emit('shipment_update', { shipmentId, tracking, timestamp: new Date() });
  }

  private async updateInventoryFromSensor(inventoryId: string, sensorReading: IoTSensorReading): Promise<void> {
    // Mock inventory sensor update
    const inventory = this.inventoryData.get(inventoryId);
    if (inventory) {
      inventory.lastMovement = new Date();
    }
  }

  private async simulateLocationUpdate(shipmentId: string): Promise<void> {
    await this.updateShipmentLocation(shipmentId);
    const tracking = this.trackingData.get(shipmentId);
    if (tracking) {
      this.emitShipmentUpdate(shipmentId, tracking);
    }
  }

  private async simulateIoTData(shipmentId: string): Promise<void> {
    await this.updateIoTSensorData(shipmentId);
  }

  private async simulateVehicleMovement(vehicleId: string): Promise<void> {
    await this.updateVehicleLocation(vehicleId);
    const vehicle = this.fleetData.get(vehicleId);
    if (vehicle) {
      this.server.emit('vehicle_update', { vehicleId, vehicle, timestamp: new Date() });
    }
  }

  private async runAlertChecks(): Promise<void> {
    for (const [shipmentId] of this.trackingData.entries()) {
      await this.checkAlerts(shipmentId);
    }
  }

  private async broadcastDashboardUpdate(): Promise<void> {
    const metrics = await this.getRealTimeMetrics();
    this.server.emit('dashboard_update', { metrics, timestamp: new Date() });
  }

  private async detectNewAlerts(shipmentId: string, tracking: ShipmentTracking): Promise<TrackingAlert[]> {
    const alerts: TrackingAlert[] = [];

    // Mock new alert detection
    if (Math.random() > 0.99) {
      alerts.push({
        id: `alert-${Date.now()}`,
        timestamp: new Date(),
        type: 'delay',
        severity: 'medium',
        message: 'Minor delay detected',
        location: 'Current location',
        estimatedImpact: { deliveryDelay: 1, additionalCost: 25, riskLevel: 0.2 },
        actionRequired: false,
        mitigationActions: ['Monitor situation']
      });
    }

    return alerts;
  }
}
