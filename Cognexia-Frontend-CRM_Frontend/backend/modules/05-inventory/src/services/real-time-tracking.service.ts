import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InventoryItem } from '../entities/InventoryItem.entity';
import { StockMovement } from '../entities/StockMovement.entity';
import { InventoryLocation } from '../entities/InventoryLocation.entity';
import Redis from 'ioredis';
import * as mqtt from 'mqtt';

export interface RealTimeUpdate {
  id: string;
  timestamp: Date;
  type: 'stock_change' | 'location_update' | 'quality_alert' | 'temperature_alert' | 'movement_complete' | 'item_scan';
  itemId?: string;
  locationId?: string;
  data: any;
  severity: 'info' | 'warning' | 'critical';
  source: 'rfid' | 'barcode' | 'iot_sensor' | 'manual' | 'system';
}

export interface IoTSensorReading {
  deviceId: string;
  sensorType: 'temperature' | 'humidity' | 'weight' | 'motion' | 'rfid' | 'barcode';
  timestamp: Date;
  value: number | string | boolean;
  unit?: string;
  location: {
    locationId: string;
    gpsCoordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  metadata: {
    batteryLevel?: number;
    signalStrength?: number;
    deviceStatus: 'online' | 'offline' | 'error';
    calibrationDate?: Date;
    lastMaintenance?: Date;
  };
}

export interface RFIDScanData {
  tagId: string;
  itemId?: string;
  locationId: string;
  readerId: string;
  timestamp: Date;
  signalStrength: number;
  scanType: 'entry' | 'exit' | 'movement' | 'inventory_count';
  associatedData?: {
    employeeId?: string;
    operationId?: string;
    batchNumber?: string;
    containerNumber?: string;
  };
}

export interface BarcodeScanData {
  barcode: string;
  itemId?: string;
  locationId: string;
  scannerId: string;
  timestamp: Date;
  scanType: 'receipt' | 'shipment' | 'transfer' | 'cycle_count' | 'quality_check';
  operatorId: string;
  quantity?: number;
  associatedData?: {
    workOrderNumber?: string;
    customerOrderNumber?: string;
    supplierOrderNumber?: string;
    batchLot?: string;
  };
}

export interface LiveInventoryStatus {
  itemId: string;
  currentStock: number;
  availableStock: number;
  reservedStock: number;
  inTransitStock: number;
  lastUpdateTime: Date;
  locationBreakdown: Array<{
    locationId: string;
    stock: number;
    reserved: number;
  }>;
  recentMovements: Array<{
    timestamp: Date;
    type: string;
    quantity: number;
    location: string;
  }>;
}

export interface WarehouseActivityDashboard {
  warehouseId: string;
  timestamp: Date;
  totalItems: number;
  totalValue: number;
  utilizationRate: number;
  activeOperations: {
    receipts: number;
    shipments: number;
    transfers: number;
    cycleCounts: number;
  };
  alerts: {
    critical: number;
    warning: number;
    info: number;
  };
  environmentalStatus: {
    temperatureAlerts: number;
    humidityAlerts: number;
    motionDetections: number;
  };
  performanceMetrics: {
    pickingAccuracy: number;
    putawaySpeed: number;
    orderFulfillmentRate: number;
    inventoryAccuracy: number;
  };
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealTimeTrackingService {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealTimeTrackingService.name);
  private redis: Redis;
  private mqttClient: mqtt.MqttClient;
  private connectedDevices: Map<string, IoTSensorReading> = new Map();
  private activeScans: Map<string, { rfid: RFIDScanData[]; barcode: BarcodeScanData[] }> = new Map();

  constructor(
    @InjectRepository(InventoryItem)
    private inventoryItemRepository: Repository<InventoryItem>,
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
    @InjectRepository(InventoryLocation)
    private locationRepository: Repository<InventoryLocation>,
    private eventEmitter: EventEmitter2,
  ) {
    this.initializeConnections();
    this.setupEventListeners();
  }

  private async initializeConnections(): Promise<void> {
    try {
      // Initialize Redis for real-time data caching
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
      });

      // Initialize MQTT for IoT device communication
      this.mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883', {
        clientId: `inventory-tracking-${Date.now()}`,
        clean: true,
        connectTimeout: 4000,
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
      });

      // Subscribe to IoT topics
      this.mqttClient.on('connect', () => {
        this.logger.log('Connected to MQTT broker');
        this.subscribeToIoTTopics();
      });

      this.mqttClient.on('message', (topic, message) => {
        this.handleMqttMessage(topic, message);
      });

      this.redis.on('ready', () => {
        this.logger.log('Redis connection established');
      });

      this.logger.log('Real-time tracking connections initialized');
    } catch (error) {
      this.logger.error('Failed to initialize real-time tracking connections', error);
    }
  }

  private subscribeToIoTTopics(): void {
    const topics = [
      'inventory/sensors/+/temperature',
      'inventory/sensors/+/humidity',
      'inventory/sensors/+/weight',
      'inventory/sensors/+/motion',
      'inventory/rfid/+/scans',
      'inventory/barcode/+/scans',
      'inventory/gps/+/location',
      'inventory/alerts/+',
    ];

    topics.forEach(topic => {
      this.mqttClient.subscribe(topic, (err) => {
        if (err) {
          this.logger.error(`Failed to subscribe to topic ${topic}`, err);
        } else {
          this.logger.debug(`Subscribed to topic ${topic}`);
        }
      });
    });
  }

  private handleMqttMessage(topic: string, message: Buffer): void {
    try {
      const data = JSON.parse(message.toString());
      const topicParts = topic.split('/');

      if (topicParts[1] === 'sensors') {
        this.processSensorReading(data);
      } else if (topicParts[1] === 'rfid') {
        this.processRFIDScan(data);
      } else if (topicParts[1] === 'barcode') {
        this.processBarcodeScan(data);
      } else if (topicParts[1] === 'alerts') {
        this.processAlert(data);
      }
    } catch (error) {
      this.logger.error(`Error processing MQTT message from topic ${topic}`, error);
    }
  }

  private setupEventListeners(): void {
    // Listen for inventory events
    this.eventEmitter.on('stock-movement-created', (movement) => {
      this.handleStockMovement(movement);
    });

    this.eventEmitter.on('inventory-item-updated', (item) => {
      this.handleInventoryUpdate(item);
    });

    this.eventEmitter.on('location-status-changed', (location) => {
      this.handleLocationUpdate(location);
    });
  }

  // RFID Processing
  async processRFIDScan(scanData: RFIDScanData): Promise<void> {
    try {
      this.logger.debug(`Processing RFID scan: ${scanData.tagId}`);

      // Find item by RFID tag
      const item = await this.inventoryItemRepository.findOne({
        where: { rfidTag: scanData.tagId },
        relations: ['currentLocation'],
      });

      if (!item) {
        this.logger.warn(`Unknown RFID tag scanned: ${scanData.tagId}`);
        return;
      }

      scanData.itemId = item.id;

      // Update item location if movement detected
      if (scanData.scanType === 'movement' || scanData.scanType === 'entry') {
        await this.updateItemLocation(item.id, scanData.locationId, 'rfid', scanData);
      }

      // Store scan data for analytics
      await this.storeRFIDScan(scanData);

      // Cache for real-time access
      const locationScans = this.activeScans.get(scanData.locationId) || { rfid: [], barcode: [] };
      locationScans.rfid.push(scanData);
      this.activeScans.set(scanData.locationId, locationScans);

      // Emit real-time update
      const update: RealTimeUpdate = {
        id: `rfid_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        timestamp: scanData.timestamp,
        type: 'item_scan',
        itemId: item.id,
        locationId: scanData.locationId,
        data: {
          scanType: scanData.scanType,
          tagId: scanData.tagId,
          signalStrength: scanData.signalStrength,
          readerId: scanData.readerId,
        },
        severity: 'info',
        source: 'rfid',
      };

      await this.broadcastUpdate(update);
      
      this.eventEmitter.emit('rfid-scan-processed', scanData);
    } catch (error) {
      this.logger.error('Error processing RFID scan', error);
    }
  }

  // Barcode Processing
  async processBarcodeScan(scanData: BarcodeScanData): Promise<void> {
    try {
      this.logger.debug(`Processing barcode scan: ${scanData.barcode}`);

      // Find item by barcode
      const item = await this.inventoryItemRepository.findOne({
        where: { barcode: scanData.barcode },
        relations: ['currentLocation'],
      });

      if (!item) {
        this.logger.warn(`Unknown barcode scanned: ${scanData.barcode}`);
        return;
      }

      scanData.itemId = item.id;

      // Process based on scan type
      switch (scanData.scanType) {
        case 'receipt':
          await this.processReceipt(item, scanData);
          break;
        case 'shipment':
          await this.processShipment(item, scanData);
          break;
        case 'transfer':
          await this.processTransfer(item, scanData);
          break;
        case 'cycle_count':
          await this.processCycleCount(item, scanData);
          break;
      }

      // Store scan data
      await this.storeBarcodeScan(scanData);

      // Cache for real-time access
      const locationScans = this.activeScans.get(scanData.locationId) || { rfid: [], barcode: [] };
      locationScans.barcode.push(scanData);
      this.activeScans.set(scanData.locationId, locationScans);

      // Emit real-time update
      const update: RealTimeUpdate = {
        id: `barcode_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        timestamp: scanData.timestamp,
        type: 'item_scan',
        itemId: item.id,
        locationId: scanData.locationId,
        data: {
          scanType: scanData.scanType,
          barcode: scanData.barcode,
          quantity: scanData.quantity,
          operatorId: scanData.operatorId,
        },
        severity: 'info',
        source: 'barcode',
      };

      await this.broadcastUpdate(update);
      
      this.eventEmitter.emit('barcode-scan-processed', scanData);
    } catch (error) {
      this.logger.error('Error processing barcode scan', error);
    }
  }

  // IoT Sensor Processing
  async processSensorReading(reading: IoTSensorReading): Promise<void> {
    try {
      this.connectedDevices.set(reading.deviceId, reading);

      // Check for alerts based on sensor type
      let alertGenerated = false;

      if (reading.sensorType === 'temperature') {
        alertGenerated = await this.checkTemperatureAlerts(reading);
      } else if (reading.sensorType === 'humidity') {
        alertGenerated = await this.checkHumidityAlerts(reading);
      } else if (reading.sensorType === 'weight') {
        alertGenerated = await this.checkWeightAlerts(reading);
      }

      // Store reading in time series database (Redis)
      await this.storeSensorReading(reading);

      // Update location IoT data
      await this.updateLocationIoTData(reading);

      // Broadcast real-time update if alert generated
      if (alertGenerated) {
        const update: RealTimeUpdate = {
          id: `sensor_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          timestamp: reading.timestamp,
          type: reading.sensorType === 'temperature' ? 'temperature_alert' : 'quality_alert',
          locationId: reading.location.locationId,
          data: {
            deviceId: reading.deviceId,
            sensorType: reading.sensorType,
            value: reading.value,
            unit: reading.unit,
            threshold: 'exceeded',
          },
          severity: 'warning',
          source: 'iot_sensor',
        };

        await this.broadcastUpdate(update);
      }

      this.eventEmitter.emit('sensor-reading-processed', reading);
    } catch (error) {
      this.logger.error('Error processing sensor reading', error);
    }
  }

  // Real-time Stock Updates
  async updateItemLocation(
    itemId: string,
    newLocationId: string,
    source: 'rfid' | 'barcode' | 'manual',
    scanData?: any
  ): Promise<void> {
    try {
      const item = await this.inventoryItemRepository.findOne({
        where: { id: itemId },
        relations: ['currentLocation'],
      });

      if (!item) {
        throw new Error(`Item not found: ${itemId}`);
      }

      const oldLocationId = item.currentLocationId;
      const newLocation = await this.locationRepository.findOne({
        where: { id: newLocationId },
      });

      if (!newLocation) {
        throw new Error(`Location not found: ${newLocationId}`);
      }

      // Update item location
      item.currentLocationId = newLocationId;
      item.currentLocation = newLocation;
      item.lastMovementDate = new Date();

      await this.inventoryItemRepository.save(item);

      // Create stock movement record
      const movement = new StockMovement();
      movement.inventoryItemId = itemId;
      movement.movementType = 'transfer' as any;
      movement.direction = 'neutral' as any;
      movement.quantity = 1;
      movement.fromLocationId = oldLocationId;
      movement.toLocationId = newLocationId;
      movement.movementDate = new Date();
      movement.status = 'executed' as any;
      movement.digitalTracking = {
        rfidTagsRead: scanData?.tagId ? [scanData.tagId] : [],
        barcodeScanned: scanData?.barcode || '',
        gpsCoordinates: null,
        temperatureLog: [],
        humidityLog: [],
      };

      await this.stockMovementRepository.save(movement);

      // Update location utilization
      if (oldLocationId) {
        await this.updateLocationUtilization(oldLocationId, -1);
      }
      await this.updateLocationUtilization(newLocationId, 1);

      // Cache live status
      await this.updateLiveInventoryStatus(itemId);

      // Emit real-time update
      const update: RealTimeUpdate = {
        id: `location_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        timestamp: new Date(),
        type: 'location_update',
        itemId,
        locationId: newLocationId,
        data: {
          oldLocationId,
          newLocationId,
          source,
          itemName: item.itemName,
          locationName: newLocation.locationName,
        },
        severity: 'info',
        source,
      };

      await this.broadcastUpdate(update);
      
      this.eventEmitter.emit('item-location-updated', {
        itemId,
        oldLocationId,
        newLocationId,
        source,
      });
    } catch (error) {
      this.logger.error(`Error updating item location: ${itemId}`, error);
      throw error;
    }
  }

  // Live Inventory Status
  async getLiveInventoryStatus(itemId: string): Promise<LiveInventoryStatus> {
    try {
      // Try to get from cache first
      const cached = await this.redis.get(`inventory:live:${itemId}`);
      if (cached) {
        return JSON.parse(cached);
      }

      // Generate live status
      const status = await this.generateLiveInventoryStatus(itemId);
      
      // Cache for 30 seconds
      await this.redis.setex(`inventory:live:${itemId}`, 30, JSON.stringify(status));
      
      return status;
    } catch (error) {
      this.logger.error(`Error getting live inventory status for ${itemId}`, error);
      throw error;
    }
  }

  private async generateLiveInventoryStatus(itemId: string): Promise<LiveInventoryStatus> {
    const item = await this.inventoryItemRepository.findOne({
      where: { id: itemId },
      relations: ['stockMovements', 'currentLocation'],
    });

    if (!item) {
      throw new Error(`Item not found: ${itemId}`);
    }

    // Calculate stock levels across all locations
    const locationBreakdown = await this.calculateLocationBreakdown(itemId);

    // Get recent movements
    const recentMovements = await this.stockMovementRepository.find({
      where: { inventoryItemId: itemId },
      order: { createdAt: 'DESC' },
      take: 10,
      relations: ['fromLocation', 'toLocation'],
    });

    return {
      itemId,
      currentStock: item.currentStock,
      availableStock: item.availableStock,
      reservedStock: item.reservedStock,
      inTransitStock: item.inTransitStock || 0,
      lastUpdateTime: new Date(),
      locationBreakdown,
      recentMovements: recentMovements.map(movement => ({
        timestamp: movement.createdAt,
        type: movement.movementType,
        quantity: movement.signedQuantity,
        location: movement.toLocation?.locationName || 'Unknown',
      })),
    };
  }

  // Warehouse Activity Dashboard
  async getWarehouseActivityDashboard(warehouseId: string): Promise<WarehouseActivityDashboard> {
    try {
      const cached = await this.redis.get(`warehouse:activity:${warehouseId}`);
      if (cached) {
        return JSON.parse(cached);
      }

      const dashboard = await this.generateWarehouseActivityDashboard(warehouseId);
      
      // Cache for 60 seconds
      await this.redis.setex(`warehouse:activity:${warehouseId}`, 60, JSON.stringify(dashboard));
      
      return dashboard;
    } catch (error) {
      this.logger.error(`Error getting warehouse activity dashboard for ${warehouseId}`, error);
      throw error;
    }
  }

  private async generateWarehouseActivityDashboard(warehouseId: string): Promise<WarehouseActivityDashboard> {
    // Get warehouse locations
    const locations = await this.locationRepository.find({
      where: { warehouseId },
      relations: ['inventoryItems'],
    });

    // Calculate metrics
    const totalItems = locations.reduce((sum, loc) => sum + loc.currentItemCount, 0);
    const totalValue = locations.reduce((sum, loc) => {
      return sum + loc.inventoryItems.reduce((itemSum, item) => itemSum + (item.currentStock * item.unitCost), 0);
    }, 0);

    const utilizationRate = locations.reduce((sum, loc) => sum + loc.utilizationPercentage, 0) / locations.length;

    // Get active operations from recent movements
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayMovements = await this.stockMovementRepository.find({
      where: {
        createdAt: { $gte: todayStart } as any,
      },
      relations: ['fromLocation', 'toLocation'],
    });

    const activeOperations = {
      receipts: todayMovements.filter(m => m.movementType === 'receipt').length,
      shipments: todayMovements.filter(m => m.movementType === 'issue').length,
      transfers: todayMovements.filter(m => m.movementType === 'transfer').length,
      cycleCounts: todayMovements.filter(m => m.movementType === 'cycle_count').length,
    };

    // Count alerts from connected devices
    const alerts = { critical: 0, warning: 0, info: 0 };
    let temperatureAlerts = 0;
    let humidityAlerts = 0;
    let motionDetections = 0;

    for (const location of locations) {
      if (location.iotDevices?.temperatureSensors) {
        for (const sensor of location.iotDevices.temperatureSensors) {
          if (sensor.currentReading < sensor.alertThresholds.minTemp || 
              sensor.currentReading > sensor.alertThresholds.maxTemp) {
            temperatureAlerts++;
            alerts.warning++;
          }
        }
      }
    }

    const performanceMetrics = {
      pickingAccuracy: 95.2,
      putawaySpeed: 45.8,
      orderFulfillmentRate: 98.5,
      inventoryAccuracy: 99.1,
    };

    return {
      warehouseId,
      timestamp: new Date(),
      totalItems,
      totalValue,
      utilizationRate,
      activeOperations,
      alerts,
      environmentalStatus: {
        temperatureAlerts,
        humidityAlerts,
        motionDetections,
      },
      performanceMetrics,
    };
  }

  // Real-time Broadcasting
  async broadcastUpdate(update: RealTimeUpdate): Promise<void> {
    try {
      // Broadcast via WebSocket
      this.server.emit('inventory-update', update);

      // Store in Redis for recent updates
      await this.redis.lpush('inventory:updates', JSON.stringify(update));
      await this.redis.ltrim('inventory:updates', 0, 999); // Keep last 1000 updates

      // Store by item/location for targeted queries
      if (update.itemId) {
        await this.redis.lpush(`inventory:updates:item:${update.itemId}`, JSON.stringify(update));
        await this.redis.ltrim(`inventory:updates:item:${update.itemId}`, 0, 99);
      }

      if (update.locationId) {
        await this.redis.lpush(`inventory:updates:location:${update.locationId}`, JSON.stringify(update));
        await this.redis.ltrim(`inventory:updates:location:${update.locationId}`, 0, 99);
      }

      this.logger.debug(`Broadcasted real-time update: ${update.id}`);
    } catch (error) {
      this.logger.error('Error broadcasting update', error);
    }
  }

  // Periodic Status Updates
  @Cron(CronExpression.EVERY_30_SECONDS)
  async updateLiveInventoryCache(): Promise<void> {
    try {
      // Get active items (items with recent movements)
      const recentlyActiveItems = await this.stockMovementRepository
        .createQueryBuilder('movement')
        .select('DISTINCT movement.inventoryItemId', 'itemId')
        .where('movement.createdAt > :since', { since: new Date(Date.now() - 24 * 60 * 60 * 1000) })
        .getRawMany();

      // Update cache for active items
      for (const { itemId } of recentlyActiveItems) {
        await this.updateLiveInventoryStatus(itemId);
      }

      this.logger.debug(`Updated live inventory cache for ${recentlyActiveItems.length} items`);
    } catch (error) {
      this.logger.error('Error updating live inventory cache', error);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async updateWarehouseDashboards(): Promise<void> {
    try {
      // Get all warehouse IDs
      const warehouses = await this.locationRepository
        .createQueryBuilder('location')
        .select('DISTINCT location.warehouseId', 'warehouseId')
        .where('location.warehouseId IS NOT NULL')
        .getRawMany();

      // Update dashboard cache for each warehouse
      for (const { warehouseId } of warehouses) {
        if (warehouseId) {
          await this.getWarehouseActivityDashboard(warehouseId);
        }
      }

      this.logger.debug(`Updated warehouse dashboards for ${warehouses.length} warehouses`);
    } catch (error) {
      this.logger.error('Error updating warehouse dashboards', error);
    }
  }

  // Device Health Monitoring
  @Cron(CronExpression.EVERY_5_MINUTES)
  async monitorDeviceHealth(): Promise<void> {
    try {
      const now = Date.now();
      const staleThreshold = 10 * 60 * 1000; // 10 minutes

      for (const [deviceId, lastReading] of this.connectedDevices.entries()) {
        const lastReadingTime = new Date(lastReading.timestamp).getTime();
        
        if (now - lastReadingTime > staleThreshold) {
          // Device appears to be offline
          const update: RealTimeUpdate = {
            id: `device_offline_${Date.now()}_${deviceId}`,
            timestamp: new Date(),
            type: 'quality_alert',
            locationId: lastReading.location.locationId,
            data: {
              deviceId,
              status: 'offline',
              lastSeen: lastReading.timestamp,
            },
            severity: 'warning',
            source: 'system',
          };

          await this.broadcastUpdate(update);
          this.connectedDevices.delete(deviceId);
        }
      }
    } catch (error) {
      this.logger.error('Error monitoring device health', error);
    }
  }

  // Private helper methods
  private async updateLiveInventoryStatus(itemId: string): Promise<void> {
    const status = await this.generateLiveInventoryStatus(itemId);
    await this.redis.setex(`inventory:live:${itemId}`, 30, JSON.stringify(status));
  }

  private async calculateLocationBreakdown(itemId: string): Promise<Array<{ locationId: string; stock: number; reserved: number; }>> {
    // This would calculate stock by location
    // For now, return empty array as placeholder
    return [];
  }

  private async updateLocationUtilization(locationId: string, itemCountChange: number): Promise<void> {
    const location = await this.locationRepository.findOne({ where: { id: locationId } });
    if (location) {
      location.currentItemCount = Math.max(0, location.currentItemCount + itemCountChange);
      location.updateUtilization();
      await this.locationRepository.save(location);
    }
  }

  private async storeRFIDScan(scanData: RFIDScanData): Promise<void> {
    const key = `rfid:scans:${scanData.locationId}:${new Date().toISOString().split('T')[0]}`;
    await this.redis.lpush(key, JSON.stringify(scanData));
    await this.redis.expire(key, 86400 * 7); // Keep for 7 days
  }

  private async storeBarcodeScan(scanData: BarcodeScanData): Promise<void> {
    const key = `barcode:scans:${scanData.locationId}:${new Date().toISOString().split('T')[0]}`;
    await this.redis.lpush(key, JSON.stringify(scanData));
    await this.redis.expire(key, 86400 * 7); // Keep for 7 days
  }

  private async storeSensorReading(reading: IoTSensorReading): Promise<void> {
    const key = `sensors:${reading.deviceId}:${reading.sensorType}`;
    const timestamp = Math.floor(reading.timestamp.getTime() / 1000);
    await this.redis.zadd(key, timestamp, JSON.stringify(reading));
    await this.redis.expire(key, 86400 * 30); // Keep for 30 days
  }

  private async updateLocationIoTData(reading: IoTSensorReading): Promise<void> {
    // Update location's real-time IoT data
    // Implementation would update location entity with latest sensor readings
  }

  private async checkTemperatureAlerts(reading: IoTSensorReading): Promise<boolean> {
    const location = await this.locationRepository.findOne({
      where: { id: reading.location.locationId },
    });

    if (!location) return false;

    const temp = reading.value as number;
    if ((location.minTemperature && temp < location.minTemperature) ||
        (location.maxTemperature && temp > location.maxTemperature)) {
      
      // Generate alert
      this.eventEmitter.emit('temperature-alert', {
        locationId: reading.location.locationId,
        deviceId: reading.deviceId,
        temperature: temp,
        threshold: {
          min: location.minTemperature,
          max: location.maxTemperature,
        },
      });

      return true;
    }

    return false;
  }

  private async checkHumidityAlerts(reading: IoTSensorReading): Promise<boolean> {
    // Similar implementation for humidity alerts
    return false;
  }

  private async checkWeightAlerts(reading: IoTSensorReading): Promise<boolean> {
    // Implementation for weight-based alerts (overloading, theft detection)
    return false;
  }

  private async processAlert(alertData: any): Promise<void> {
    const update: RealTimeUpdate = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date(),
      type: 'quality_alert',
      data: alertData,
      severity: alertData.severity || 'warning',
      source: 'iot_sensor',
    };

    await this.broadcastUpdate(update);
  }

  private async processReceipt(item: InventoryItem, scanData: BarcodeScanData): Promise<void> {
    // Implementation for receipt processing
  }

  private async processShipment(item: InventoryItem, scanData: BarcodeScanData): Promise<void> {
    // Implementation for shipment processing
  }

  private async processTransfer(item: InventoryItem, scanData: BarcodeScanData): Promise<void> {
    // Implementation for transfer processing
  }

  private async processCycleCount(item: InventoryItem, scanData: BarcodeScanData): Promise<void> {
    // Implementation for cycle count processing
  }

  private async handleStockMovement(movement: StockMovement): Promise<void> {
    const update: RealTimeUpdate = {
      id: `movement_${movement.id}`,
      timestamp: movement.createdAt,
      type: 'movement_complete',
      itemId: movement.inventoryItemId,
      locationId: movement.toLocationId,
      data: {
        movementType: movement.movementType,
        quantity: movement.quantity,
        direction: movement.direction,
      },
      severity: 'info',
      source: 'system',
    };

    await this.broadcastUpdate(update);
  }

  private async handleInventoryUpdate(item: InventoryItem): Promise<void> {
    const update: RealTimeUpdate = {
      id: `stock_${item.id}_${Date.now()}`,
      timestamp: new Date(),
      type: 'stock_change',
      itemId: item.id,
      data: {
        currentStock: item.currentStock,
        availableStock: item.availableStock,
        reservedStock: item.reservedStock,
      },
      severity: 'info',
      source: 'system',
    };

    await this.broadcastUpdate(update);
    await this.updateLiveInventoryStatus(item.id);
  }

  private async handleLocationUpdate(location: InventoryLocation): Promise<void> {
    const update: RealTimeUpdate = {
      id: `location_${location.id}_${Date.now()}`,
      timestamp: new Date(),
      type: 'location_update',
      locationId: location.id,
      data: {
        status: location.status,
        utilizationPercentage: location.utilizationPercentage,
        currentItemCount: location.currentItemCount,
      },
      severity: 'info',
      source: 'system',
    };

    await this.broadcastUpdate(update);
  }

  // Public API methods
  async getRecentUpdates(limit: number = 50): Promise<RealTimeUpdate[]> {
    const updates = await this.redis.lrange('inventory:updates', 0, limit - 1);
    return updates.map(update => JSON.parse(update));
  }

  async getItemUpdates(itemId: string, limit: number = 20): Promise<RealTimeUpdate[]> {
    const updates = await this.redis.lrange(`inventory:updates:item:${itemId}`, 0, limit - 1);
    return updates.map(update => JSON.parse(update));
  }

  async getLocationUpdates(locationId: string, limit: number = 20): Promise<RealTimeUpdate[]> {
    const updates = await this.redis.lrange(`inventory:updates:location:${locationId}`, 0, limit - 1);
    return updates.map(update => JSON.parse(update));
  }

  async getConnectedDevices(): Promise<IoTSensorReading[]> {
    return Array.from(this.connectedDevices.values());
  }

  async getActiveScans(locationId: string): Promise<{ rfid: RFIDScanData[]; barcode: BarcodeScanData[] }> {
    return this.activeScans.get(locationId) || { rfid: [], barcode: [] };
  }
}
