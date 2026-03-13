import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Tree,
  TreeParent,
  TreeChildren,
} from 'typeorm';
import { IsNotEmpty, Min, Max, IsOptional } from 'class-validator';
import { InventoryItem } from './InventoryItem.entity';
import { StockMovement } from './StockMovement.entity';

export enum LocationType {
  WAREHOUSE = 'warehouse',
  ZONE = 'zone',
  AISLE = 'aisle',
  RACK = 'rack',
  SHELF = 'shelf',
  BIN = 'bin',
  PALLET = 'pallet',
  STAGING_AREA = 'staging_area',
  RECEIVING_DOCK = 'receiving_dock',
  SHIPPING_DOCK = 'shipping_dock',
  QUALITY_AREA = 'quality_area',
  QUARANTINE = 'quarantine',
  DAMAGE_AREA = 'damage_area',
  RETURNS_AREA = 'returns_area',
  CROSS_DOCK = 'cross_dock',
  COLD_STORAGE = 'cold_storage',
  HAZMAT_AREA = 'hazmat_area',
  OUTDOOR_YARD = 'outdoor_yard',
  VIRTUAL = 'virtual',
}

export enum LocationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  BLOCKED = 'blocked',
  DAMAGED = 'damaged',
  UNDER_CONSTRUCTION = 'under_construction',
  QUARANTINED = 'quarantined',
  RESERVED = 'reserved',
  FULL = 'full',
  OVERFLOWING = 'overflowing',
}

export enum StorageStrategy {
  FIFO = 'fifo', // First In, First Out
  LIFO = 'lifo', // Last In, First Out
  FEFO = 'fefo', // First Expired, First Out
  FAST_MOVING = 'fast_moving',
  SLOW_MOVING = 'slow_moving',
  RANDOM = 'random',
  DIRECTED = 'directed',
  ZONE_PICKING = 'zone_picking',
  BATCH_PICKING = 'batch_picking',
  WAVE_PICKING = 'wave_picking',
}

export enum EnvironmentControlType {
  AMBIENT = 'ambient',
  REFRIGERATED = 'refrigerated',
  FROZEN = 'frozen',
  TEMPERATURE_CONTROLLED = 'temperature_controlled',
  HUMIDITY_CONTROLLED = 'humidity_controlled',
  CLIMATE_CONTROLLED = 'climate_controlled',
  CLEANROOM = 'cleanroom',
  HAZARDOUS = 'hazardous',
  EXPLOSIVE_PROOF = 'explosive_proof',
}

@Entity('inventory_locations')
@Tree('closure-table')
@Index(['warehouseId', 'locationType'])
@Index(['locationCode', 'status'])
@Index(['parentId', 'sortOrder'])
@Index(['zone', 'aisle', 'rack', 'shelf', 'bin'])
@Index(['gpsLatitude', 'gpsLongitude'])
export class InventoryLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  @IsNotEmpty()
  locationCode: string;

  @Column({ length: 255 })
  @IsNotEmpty()
  locationName: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: LocationType,
  })
  @IsNotEmpty()
  locationType: LocationType;

  @Column({
    type: 'enum',
    enum: LocationStatus,
    default: LocationStatus.ACTIVE,
  })
  status: LocationStatus;

  // Hierarchical Structure
  @Column('uuid', { nullable: true })
  warehouseId: string;

  @Column('uuid', { nullable: true })
  parentId: string;

  @Column({ default: 0 })
  level: number;

  @Column({ length: 500, nullable: true })
  fullPath: string; // e.g., "WH01/ZONE-A/AISLE-01/RACK-05/SHELF-02/BIN-001"

  @Column({ default: 0 })
  sortOrder: number;

  // Physical Characteristics
  @Column({ length: 50, nullable: true })
  zone: string;

  @Column({ length: 50, nullable: true })
  aisle: string;

  @Column({ length: 50, nullable: true })
  rack: string;

  @Column({ length: 50, nullable: true })
  shelf: string;

  @Column({ length: 50, nullable: true })
  bin: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @Min(0)
  length: number; // in meters

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @Min(0)
  width: number; // in meters

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @Min(0)
  height: number; // in meters

  @Column({ type: 'decimal', precision: 15, scale: 3, nullable: true })
  @Min(0)
  volume: number; // cubic meters

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  @Min(0)
  maxWeight: number; // in kg

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  @Min(0)
  maxVolume: number; // cubic meters

  @Column({ default: 1 })
  @Min(1)
  maxItems: number;

  // Current Utilization
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @Min(0)
  currentWeight: number;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  @Min(0)
  currentVolume: number;

  @Column({ default: 0 })
  @Min(0)
  currentItemCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @Min(0)
  @Max(100)
  utilizationPercentage: number;

  // GPS and Physical Location
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  gpsLatitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  gpsLongitude: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  altitude: number; // in meters

  @Column({ length: 255, nullable: true })
  physicalAddress: string;

  @Column({ length: 100, nullable: true })
  building: string;

  @Column({ length: 50, nullable: true })
  floor: string;

  @Column({ length: 100, nullable: true })
  room: string;

  // Storage Configuration
  @Column({
    type: 'enum',
    enum: StorageStrategy,
    default: StorageStrategy.FIFO,
  })
  storageStrategy: StorageStrategy;

  @Column({ default: false })
  isBulkLocation: boolean;

  @Column({ default: false })
  isPickLocation: boolean;

  @Column({ default: false })
  isReceiveLocation: boolean;

  @Column({ default: false })
  isShipLocation: boolean;

  @Column({ default: false })
  isQualityLocation: boolean;

  @Column({ default: false })
  isDamageLocation: boolean;

  @Column({ default: false })
  isVirtualLocation: boolean;

  @Column({ default: false })
  allowMixedItems: boolean;

  @Column({ default: false })
  allowMixedLots: boolean;

  @Column({ default: false })
  requiresCycleCount: boolean;

  // Environment Control
  @Column({
    type: 'enum',
    enum: EnvironmentControlType,
    default: EnvironmentControlType.AMBIENT,
  })
  environmentControl: EnvironmentControlType;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  minTemperature: number; // Celsius

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  maxTemperature: number; // Celsius

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  minHumidity: number; // percentage

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  maxHumidity: number; // percentage

  // Safety and Compliance
  @Column({ type: 'json', nullable: true })
  safetyRequirements: {
    requiresProtectiveEquipment: boolean;
    restrictedAccess: boolean;
    hazardousClassification: string[];
    ventilationRequired: boolean;
    fireSuppressionType: string;
    emergencyExitAccess: boolean;
  };

  @Column({ type: 'json', nullable: true })
  complianceRequirements: {
    regulatoryStandards: string[];
    certifications: string[];
    inspectionRequired: boolean;
    lastInspectionDate: Date;
    nextInspectionDate: Date;
    auditFrequency: string;
  };

  // Access Control
  @Column({ type: 'json', nullable: true })
  accessControl: {
    securityLevel: 'low' | 'medium' | 'high' | 'maximum';
    authorizedPersonnel: string[];
    accessMethods: string[];
    requiresBadgeAccess: boolean;
    requiresBiometric: boolean;
    operatingHours: {
      startTime: string;
      endTime: string;
      daysOfWeek: string[];
    };
  };

  // IoT Integration
  @Column({ type: 'json', nullable: true })
  iotDevices: {
    temperatureSensors: Array<{
      deviceId: string;
      sensorType: string;
      currentReading: number;
      lastReadingTime: Date;
      alertThresholds: {
        minTemp: number;
        maxTemp: number;
      };
    }>;
    humiditySensors: Array<{
      deviceId: string;
      sensorType: string;
      currentReading: number;
      lastReadingTime: Date;
      alertThresholds: {
        minHumidity: number;
        maxHumidity: number;
      };
    }>;
    motionSensors: Array<{
      deviceId: string;
      sensorType: string;
      isActive: boolean;
      lastMotionDetected: Date;
      sensitivityLevel: number;
    }>;
    rfidReaders: Array<{
      deviceId: string;
      readerType: string;
      isActive: boolean;
      lastScan: Date;
      range: number;
    }>;
    cameras: Array<{
      deviceId: string;
      cameraType: string;
      isRecording: boolean;
      viewAngle: number;
      resolution: string;
    }>;
    weightSensors: Array<{
      deviceId: string;
      sensorType: string;
      currentWeight: number;
      maxCapacity: number;
      lastCalibrated: Date;
    }>;
  };

  // AI-Powered Optimization
  @Column({ type: 'json', nullable: true })
  aiOptimization: {
    utilizationPrediction: {
      predictedUtilization: number;
      confidenceLevel: number;
      predictionHorizon: number; // days
      factors: string[];
    };
    optimalLayout: {
      recommendedConfiguration: string;
      efficiencyGain: number;
      implementationCost: number;
      paybackPeriod: number;
    };
    pickingOptimization: {
      optimalPickPath: string[];
      estimatedPickTime: number;
      pickingEfficiency: number;
      congestionPrediction: number;
    };
    slottingOptimization: {
      recommendedItems: Array<{
        itemId: string;
        priority: number;
        reason: string[];
      }>;
      expectedPerformanceImprovement: number;
    };
  };

  // Performance Metrics
  @Column({ type: 'json', nullable: true })
  performanceMetrics: {
    pickingAccuracy: number;
    pickingSpeed: number; // picks per hour
    putawaySpeed: number; // putaways per hour
    cycleCountAccuracy: number;
    utilizationEfficiency: number;
    travelDistance: number; // average meters per pick
    dwellTime: number; // average hours items stay in location
    turnoverRate: number;
    damageRate: number;
    errorRate: number;
  };

  // Maintenance and Upkeep
  @Column({ type: 'json', nullable: true })
  maintenanceSchedule: {
    lastMaintenance: Date;
    nextScheduledMaintenance: Date;
    maintenanceFrequency: string;
    maintenanceType: string[];
    estimatedDowntime: number; // hours
    maintenanceCost: number;
    maintenanceNotes: string;
  };

  // Digital Twin Integration
  @Column({ type: 'json', nullable: true })
  digitalTwin: {
    twinId: string;
    simulationData: {
      virtualCoordinates: {
        x: number;
        y: number;
        z: number;
      };
      simulationAccuracy: number;
      lastSimulationRun: Date;
      simulationResults: Array<{
        scenario: string;
        outcome: string;
        metrics: Record<string, number>;
      }>;
    };
  };

  // Cost Tracking
  @Column({ type: 'json', nullable: true })
  costTracking: {
    operatingCost: number; // per month
    maintenanceCost: number; // per month
    energyCost: number; // per month
    laborCost: number; // per month
    depreciation: number; // per month
    roi: number;
    costPerCubicMeter: number;
    costPerItem: number;
  };

  // Analytics and Reporting
  @Column({ type: 'json', nullable: true })
  analytics: {
    dailyMetrics: Array<{
      date: Date;
      itemsReceived: number;
      itemsShipped: number;
      pickingActivities: number;
      putawayActivities: number;
      utilizationRate: number;
    }>;
    trendAnalysis: {
      utilizationTrend: 'increasing' | 'decreasing' | 'stable';
      activityTrend: 'increasing' | 'decreasing' | 'stable';
      efficiencyTrend: 'improving' | 'declining' | 'stable';
    };
    kpis: {
      availabilityPercentage: number;
      accuracyPercentage: number;
      productivityIndex: number;
      qualityScore: number;
    };
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 50, nullable: true })
  createdBy: string;

  @Column({ length: 50, nullable: true })
  updatedBy: string;

  // Tree Relationships
  @TreeParent()
  parent: InventoryLocation;

  @TreeChildren()
  children: InventoryLocation[];

  // Entity Relationships
  @OneToMany(() => InventoryItem, (item) => item.currentLocation)
  inventoryItems: InventoryItem[];

  @OneToMany(() => StockMovement, (movement) => movement.fromLocation)
  outgoingMovements: StockMovement[];

  @OneToMany(() => StockMovement, (movement) => movement.toLocation)
  incomingMovements: StockMovement[];

  // Computed Properties
  get isAtCapacity(): boolean {
    return this.utilizationPercentage >= 100;
  }

  get isNearCapacity(): boolean {
    return this.utilizationPercentage >= 85;
  }

  get hasSpaceAvailable(): boolean {
    return this.utilizationPercentage < 100 && this.status === LocationStatus.ACTIVE;
  }

  get isOperational(): boolean {
    return [LocationStatus.ACTIVE, LocationStatus.RESERVED].includes(this.status);
  }

  get requiresAttention(): boolean {
    return [
      LocationStatus.MAINTENANCE,
      LocationStatus.BLOCKED,
      LocationStatus.DAMAGED,
      LocationStatus.OVERFLOWING,
    ].includes(this.status);
  }

  get capacityUtilization(): {
    weight: number;
    volume: number;
    items: number;
  } {
    return {
      weight: this.maxWeight > 0 ? (this.currentWeight / this.maxWeight) * 100 : 0,
      volume: this.maxVolume > 0 ? (this.currentVolume / this.maxVolume) * 100 : 0,
      items: this.maxItems > 0 ? (this.currentItemCount / this.maxItems) * 100 : 0,
    };
  }

  get environmentStatus(): 'normal' | 'warning' | 'critical' {
    if (!this.iotDevices?.temperatureSensors?.length) return 'normal';
    
    for (const sensor of this.iotDevices.temperatureSensors) {
      if (
        sensor.currentReading < sensor.alertThresholds.minTemp ||
        sensor.currentReading > sensor.alertThresholds.maxTemp
      ) {
        return 'critical';
      }
    }
    return 'normal';
  }

  // Methods
  updateUtilization(): void {
    const weightUtilization = this.maxWeight > 0 ? (this.currentWeight / this.maxWeight) * 100 : 0;
    const volumeUtilization = this.maxVolume > 0 ? (this.currentVolume / this.maxVolume) * 100 : 0;
    const itemUtilization = this.maxItems > 0 ? (this.currentItemCount / this.maxItems) * 100 : 0;
    
    this.utilizationPercentage = Math.max(weightUtilization, volumeUtilization, itemUtilization);
  }

  canAccommodate(weight: number, volume: number): boolean {
    if (!this.hasSpaceAvailable) return false;
    
    const wouldExceedWeight = this.maxWeight > 0 && (this.currentWeight + weight) > this.maxWeight;
    const wouldExceedVolume = this.maxVolume > 0 && (this.currentVolume + volume) > this.maxVolume;
    const wouldExceedItems = this.currentItemCount >= this.maxItems;
    
    return !wouldExceedWeight && !wouldExceedVolume && !wouldExceedItems;
  }

  addItem(weight: number, volume: number): void {
    this.currentWeight += weight;
    this.currentVolume += volume;
    this.currentItemCount += 1;
    this.updateUtilization();
  }

  removeItem(weight: number, volume: number): void {
    this.currentWeight = Math.max(0, this.currentWeight - weight);
    this.currentVolume = Math.max(0, this.currentVolume - volume);
    this.currentItemCount = Math.max(0, this.currentItemCount - 1);
    this.updateUtilization();
  }

  generateLocationCode(): string {
    const parts = [];
    
    if (this.zone) parts.push(this.zone);
    if (this.aisle) parts.push(this.aisle);
    if (this.rack) parts.push(this.rack);
    if (this.shelf) parts.push(this.shelf);
    if (this.bin) parts.push(this.bin);
    
    this.locationCode = parts.join('-') || `LOC-${Date.now()}`;
    return this.locationCode;
  }

  updateFullPath(): void {
    const pathParts = [this.locationCode];
    let current = this.parent;
    
    while (current) {
      pathParts.unshift(current.locationCode);
      current = current.parent;
    }
    
    this.fullPath = pathParts.join('/');
  }

  calculateDistance(otherLocation: InventoryLocation): number {
    if (!this.gpsLatitude || !this.gpsLongitude || 
        !otherLocation.gpsLatitude || !otherLocation.gpsLongitude) {
      return 0;
    }
    
    const R = 6371e3; // Earth's radius in meters
    const φ1 = this.gpsLatitude * Math.PI / 180;
    const φ2 = otherLocation.gpsLatitude * Math.PI / 180;
    const Δφ = (otherLocation.gpsLatitude - this.gpsLatitude) * Math.PI / 180;
    const Δλ = (otherLocation.gpsLongitude - this.gpsLongitude) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // Distance in meters
  }

  isCompatibleWith(item: InventoryItem): boolean {
    // Check if location can store this type of item
    if (item.hazardousClassification && !this.safetyRequirements?.hazardousClassification?.includes(item.hazardousClassification)) {
      return false;
    }
    
    // Check temperature requirements
    if (item.storageTemperatureMin && this.minTemperature && item.storageTemperatureMin < this.minTemperature) {
      return false;
    }
    
    if (item.storageTemperatureMax && this.maxTemperature && item.storageTemperatureMax > this.maxTemperature) {
      return false;
    }
    
    // Check if mixed items are allowed
    if (!this.allowMixedItems && this.currentItemCount > 0) {
      return false;
    }
    
    return true;
  }

  scheduleMaintenanceAlert(): Date {
    if (this.maintenanceSchedule?.nextScheduledMaintenance) {
      const alertDate = new Date(this.maintenanceSchedule.nextScheduledMaintenance);
      alertDate.setDate(alertDate.getDate() - 7); // Alert 7 days before
      return alertDate;
    }
    return null;
  }

  generateQRCode(): string {
    const qrData = {
      locationId: this.id,
      locationCode: this.locationCode,
      locationType: this.locationType,
      fullPath: this.fullPath,
      timestamp: new Date().toISOString(),
    };
    
    return JSON.stringify(qrData);
  }

  getOptimalPickPath(targetLocations: InventoryLocation[]): InventoryLocation[] {
    // Simple implementation - in practice, this would use sophisticated routing algorithms
    return targetLocations.sort((a, b) => {
      const distanceA = this.calculateDistance(a);
      const distanceB = this.calculateDistance(b);
      return distanceA - distanceB;
    });
  }
}
