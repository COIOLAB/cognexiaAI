// Industry 5.0 ERP Backend - Supply Chain Module
// Warehouse Entity - Smart warehouse management with IoT integration and AI optimization
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { InventoryItem } from './InventoryItem';
import { WarehouseOperation } from './WarehouseOperation';
import { LogisticsShipment } from './LogisticsShipment';

export enum WarehouseType {
  DISTRIBUTION_CENTER = 'distribution_center',
  FULFILLMENT_CENTER = 'fulfillment_center',
  CROSS_DOCK = 'cross_dock',
  COLD_STORAGE = 'cold_storage',
  MANUFACTURING_WAREHOUSE = 'manufacturing_warehouse',
  RAW_MATERIALS = 'raw_materials',
  FINISHED_GOODS = 'finished_goods',
  RETURN_CENTER = 'return_center',
  AUTOMATED_STORAGE = 'automated_storage'
}

export enum WarehouseStatus {
  OPERATIONAL = 'operational',
  MAINTENANCE = 'maintenance',
  OFFLINE = 'offline',
  EMERGENCY = 'emergency',
  CAPACITY_FULL = 'capacity_full',
  LIMITED_OPERATIONS = 'limited_operations'
}

export enum AutomationLevel {
  MANUAL = 'manual',
  SEMI_AUTOMATED = 'semi_automated',
  FULLY_AUTOMATED = 'fully_automated',
  LIGHTS_OUT = 'lights_out' // Fully autonomous operations
}

@Entity('warehouses')
@Index(['code'])
@Index(['type', 'status'])
@Index(['city', 'country'])
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  @Index()
  code: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: WarehouseType,
    default: WarehouseType.DISTRIBUTION_CENTER
  })
  type: WarehouseType;

  @Column({
    type: 'enum',
    enum: WarehouseStatus,
    default: WarehouseStatus.OPERATIONAL
  })
  status: WarehouseStatus;

  @Column({
    type: 'enum',
    enum: AutomationLevel,
    default: AutomationLevel.MANUAL
  })
  automationLevel: AutomationLevel;

  // Location Information
  @Column({ length: 255 })
  address: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  state: string;

  @Column({ length: 20 })
  zipCode: string;

  @Column({ length: 100 })
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ length: 50, nullable: true })
  timeZone: string;

  // Physical Characteristics
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalArea: number; // in square meters

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  storageArea: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  officeArea: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  ceilingHeight: number; // in meters

  @Column({ type: 'int', default: 1 })
  numberOfFloors: number;

  @Column({ type: 'int', default: 1 })
  numberOfDocks: number;

  @Column({ type: 'json', nullable: true })
  facilityLayout: {
    zones?: {
      name: string;
      area: number;
      purpose: string;
      coordinates?: { x: number; y: number; width: number; height: number };
    }[];
    aisles?: number;
    racks?: number;
    shelves?: number;
    bins?: number;
    pickingAreas?: string[];
    packingAreas?: string[];
    stagingAreas?: string[];
    qualityControlAreas?: string[];
  };

  // Capacity Management
  @Column({ type: 'decimal', precision: 15, scale: 3 })
  maxCapacityVolume: number; // cubic meters

  @Column({ type: 'decimal', precision: 15, scale: 3 })
  currentCapacityUsed: number;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  maxCapacityWeight: number; // in kilograms

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  currentWeightUsed: number;

  @Column({ type: 'int' })
  maxSkuCount: number;

  @Column({ type: 'int' })
  currentSkuCount: number;

  // Environmental Controls
  @Column({ type: 'json', nullable: true })
  environmentalSpecs: {
    temperatureControl?: {
      min: number;
      max: number;
      current?: number;
      unit: string;
    };
    humidityControl?: {
      min: number;
      max: number;
      current?: number;
    };
    airPressure?: number;
    ventilation?: string;
    lighting?: {
      type: string;
      lumens: number;
      motionSensors: boolean;
    };
    fireSuppressionSystem?: string;
    securitySystems?: string[];
  };

  // Technology and Automation
  @Column({ type: 'json', nullable: true })
  technologyStack: {
    wms?: string; // Warehouse Management System
    wcs?: string; // Warehouse Control System
    iotDevices?: {
      sensors: number;
      readers: number;
      scanners: number;
      cameras: number;
    };
    robotics?: {
      agvs: number; // Automated Guided Vehicles
      asrsUnits: number; // Automated Storage and Retrieval Systems
      pickingRobots: number;
      sortingRobots: number;
      packingRobots: number;
    };
    automation?: {
      conveyorSystems: boolean;
      sortingSystems: boolean;
      packingMachines: number;
      labelingMachines: number;
    };
    aiSystems?: {
      inventoryOptimization: boolean;
      demandForecasting: boolean;
      routeOptimization: boolean;
      predictiveMaintenance: boolean;
    };
  };

  // Operational Metrics
  @Column({ type: 'json', nullable: true })
  operationalMetrics: {
    throughput?: {
      daily: number;
      weekly: number;
      monthly: number;
      unit: string;
    };
    pickingAccuracy?: number;
    orderFulfillmentTime?: number; // minutes
    shippingAccuracy?: number;
    laborProductivity?: number;
    equipmentUptime?: number;
    energyConsumption?: {
      daily: number;
      monthly: number;
      unit: string;
    };
    costPerOrder?: number;
    costPerSquareFoot?: number;
  };

  // Staffing Information
  @Column({ type: 'json', nullable: true })
  staffingInfo: {
    totalEmployees?: number;
    shifts?: {
      morning: number;
      afternoon: number;
      night: number;
      weekend: number;
    };
    departments?: {
      receiving: number;
      putAway: number;
      picking: number;
      packing: number;
      shipping: number;
      qualityControl: number;
      maintenance: number;
      supervision: number;
    };
    peakSeasonStaff?: number;
    temporaryStaff?: number;
  };

  // Compliance and Certifications
  @Column({ type: 'json', nullable: true })
  compliance: {
    certifications?: string[];
    licenses?: string[];
    inspections?: {
      type: string;
      date: Date;
      result: string;
      expiryDate?: Date;
    }[];
    safetyRating?: string;
    environmentalCompliance?: string[];
    qualityStandards?: string[];
    securityClearance?: string;
  };

  // Sustainability Metrics
  @Column({ type: 'json', nullable: true })
  sustainability: {
    energyEfficiencyRating?: string;
    renewableEnergyUsage?: number; // percentage
    wasteReduction?: number;
    carbonFootprint?: number;
    waterUsage?: number;
    recyclingPrograms?: string[];
    greenBuildingCertification?: string;
    sustainabilityScore?: number;
  };

  // Relationships
  @OneToMany(() => InventoryItem, inventoryItem => inventoryItem.warehouse)
  inventoryItems: InventoryItem[];

  @OneToMany(() => WarehouseOperation, operation => operation.warehouse)
  operations: WarehouseOperation[];

  @OneToMany(() => LogisticsShipment, shipment => shipment.originWarehouse)
  outgoingShipments: LogisticsShipment[];

  @OneToMany(() => LogisticsShipment, shipment => shipment.destinationWarehouse)
  incomingShipments: LogisticsShipment[];

  // Audit fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 100, nullable: true })
  createdBy: string;

  @Column({ length: 100, nullable: true })
  updatedBy: string;

  // Business Methods
  calculateUtilizationRate(): {
    volumeUtilization: number;
    weightUtilization: number;
    skuUtilization: number;
  } {
    return {
      volumeUtilization: (this.currentCapacityUsed / this.maxCapacityVolume) * 100,
      weightUtilization: (this.currentWeightUsed / this.maxCapacityWeight) * 100,
      skuUtilization: (this.currentSkuCount / this.maxSkuCount) * 100
    };
  }

  isAtCapacity(): boolean {
    const utilization = this.calculateUtilizationRate();
    return utilization.volumeUtilization >= 95 || 
           utilization.weightUtilization >= 95 || 
           utilization.skuUtilization >= 95;
  }

  canAccommodateItem(volume: number, weight: number): boolean {
    return (this.currentCapacityUsed + volume <= this.maxCapacityVolume * 0.95) &&
           (this.currentWeightUsed + weight <= this.maxCapacityWeight * 0.95) &&
           (this.currentSkuCount < this.maxSkuCount);
  }

  getAvailableCapacity(): {
    volumeAvailable: number;
    weightAvailable: number;
    skuSlotsAvailable: number;
  } {
    return {
      volumeAvailable: Math.max(0, this.maxCapacityVolume - this.currentCapacityUsed),
      weightAvailable: Math.max(0, this.maxCapacityWeight - this.currentWeightUsed),
      skuSlotsAvailable: Math.max(0, this.maxSkuCount - this.currentSkuCount)
    };
  }

  calculateEfficiencyScore(): number {
    if (!this.operationalMetrics) return 0;
    
    const metrics = this.operationalMetrics;
    let score = 0;
    let factors = 0;

    if (metrics.pickingAccuracy) {
      score += metrics.pickingAccuracy;
      factors++;
    }
    
    if (metrics.shippingAccuracy) {
      score += metrics.shippingAccuracy;
      factors++;
    }
    
    if (metrics.equipmentUptime) {
      score += metrics.equipmentUptime;
      factors++;
    }
    
    if (metrics.laborProductivity) {
      score += Math.min(100, metrics.laborProductivity);
      factors++;
    }

    return factors > 0 ? score / factors : 0;
  }

  isOperational(): boolean {
    return this.status === WarehouseStatus.OPERATIONAL;
  }

  requiresMaintenance(): boolean {
    return this.status === WarehouseStatus.MAINTENANCE ||
           (this.operationalMetrics?.equipmentUptime && this.operationalMetrics.equipmentUptime < 90);
  }

  getStorageZones(): string[] {
    if (!this.facilityLayout?.zones) return [];
    return this.facilityLayout.zones.map(zone => zone.name);
  }

  calculateDistanceFromLocation(lat: number, lng: number): number {
    if (!this.latitude || !this.longitude) return Infinity;
    
    // Haversine formula for calculating distance
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat - this.latitude);
    const dLng = this.toRadians(lng - this.longitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(this.latitude)) * Math.cos(this.toRadians(lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  updateOperationalMetrics(metrics: Partial<Warehouse['operationalMetrics']>): void {
    this.operationalMetrics = { ...this.operationalMetrics, ...metrics };
  }

  addCapacityUsed(volume: number, weight: number): void {
    this.currentCapacityUsed += volume;
    this.currentWeightUsed += weight;
    this.currentSkuCount += 1;
  }

  removeCapacityUsed(volume: number, weight: number): void {
    this.currentCapacityUsed = Math.max(0, this.currentCapacityUsed - volume);
    this.currentWeightUsed = Math.max(0, this.currentWeightUsed - weight);
    this.currentSkuCount = Math.max(0, this.currentSkuCount - 1);
  }

  getAutomationCapabilities(): string[] {
    const capabilities = [];
    
    if (this.automationLevel === AutomationLevel.LIGHTS_OUT) {
      capabilities.push('Fully Autonomous Operations');
    } else if (this.automationLevel === AutomationLevel.FULLY_AUTOMATED) {
      capabilities.push('Fully Automated');
    } else if (this.automationLevel === AutomationLevel.SEMI_AUTOMATED) {
      capabilities.push('Semi-Automated');
    }
    
    if (this.technologyStack?.robotics) {
      const robotics = this.technologyStack.robotics;
      if (robotics.agvs > 0) capabilities.push('AGV Systems');
      if (robotics.asrsUnits > 0) capabilities.push('AS/RS Systems');
      if (robotics.pickingRobots > 0) capabilities.push('Robotic Picking');
      if (robotics.sortingRobots > 0) capabilities.push('Automated Sorting');
    }
    
    if (this.technologyStack?.automation?.conveyorSystems) {
      capabilities.push('Conveyor Systems');
    }
    
    return capabilities;
  }
}
