// Industry 5.0 ERP Backend - Supply Chain Module
// LogisticsShipment Entity - Advanced shipment management with real-time tracking and IoT integration
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { InventoryItem } from './InventoryItem';
import { Warehouse } from './Warehouse';
import { SupplierNetwork } from './SupplierNetwork';

export enum ShipmentStatus {
  PLANNING = 'planning',
  SCHEDULED = 'scheduled',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED_DELIVERY = 'failed_delivery',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
  LOST = 'lost',
  DAMAGED = 'damaged'
}

export enum ShipmentType {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  TRANSFER = 'transfer',
  RETURN = 'return',
  EMERGENCY = 'emergency',
  EXPEDITED = 'expedited',
  CONSOLIDATED = 'consolidated',
  DIRECT = 'direct'
}

export enum ShipmentPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

export enum TransportMode {
  TRUCK = 'truck',
  AIR = 'air',
  OCEAN = 'ocean',
  RAIL = 'rail',
  MULTIMODAL = 'multimodal',
  DRONE = 'drone',
  PIPELINE = 'pipeline',
  COURIER = 'courier'
}

@Entity('logistics_shipments')
@Index(['shipmentNumber'])
@Index(['status', 'type'])
@Index(['scheduledPickupDate'])
@Index(['scheduledDeliveryDate'])
@Index(['carrierId'])
export class LogisticsShipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @Index()
  shipmentNumber: string;

  @Column({ length: 100, nullable: true })
  trackingNumber: string;

  @Column({
    type: 'enum',
    enum: ShipmentType,
    default: ShipmentType.OUTBOUND
  })
  type: ShipmentType;

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.PLANNING
  })
  status: ShipmentStatus;

  @Column({
    type: 'enum',
    enum: ShipmentPriority,
    default: ShipmentPriority.NORMAL
  })
  priority: ShipmentPriority;

  @Column({
    type: 'enum',
    enum: TransportMode,
    default: TransportMode.TRUCK
  })
  transportMode: TransportMode;

  // Item and Quantity Information
  @Column({ type: 'uuid', nullable: true })
  inventoryItemId: string;

  @ManyToOne(() => InventoryItem, item => item.shipments)
  @JoinColumn({ name: 'inventoryItemId' })
  inventoryItem: InventoryItem;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  quantity: number;

  @Column({ length: 20 })
  unit: string;

  // Origin and Destination
  @Column({ type: 'uuid', nullable: true })
  originWarehouseId: string;

  @ManyToOne(() => Warehouse, warehouse => warehouse.outgoingShipments)
  @JoinColumn({ name: 'originWarehouseId' })
  originWarehouse: Warehouse;

  @Column({ type: 'uuid', nullable: true })
  destinationWarehouseId: string;

  @ManyToOne(() => Warehouse, warehouse => warehouse.incomingShipments)
  @JoinColumn({ name: 'destinationWarehouseId' })
  destinationWarehouse: Warehouse;

  @Column({ type: 'json' })
  originAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    contactPerson?: string;
    contactPhone?: string;
    contactEmail?: string;
  };

  @Column({ type: 'json' })
  destinationAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    contactPerson?: string;
    contactPhone?: string;
    contactEmail?: string;
  };

  // Supplier/Customer Information
  @Column({ type: 'uuid', nullable: true })
  supplierId: string;

  @ManyToOne(() => SupplierNetwork, supplier => supplier.shipments)
  @JoinColumn({ name: 'supplierId' })
  supplier: SupplierNetwork;

  @Column({ type: 'uuid', nullable: true })
  customerId: string;

  // Carrier and Service Information
  @Column({ type: 'uuid' })
  carrierId: string;

  @Column({ length: 255 })
  carrierName: string;

  @Column({ length: 100, nullable: true })
  serviceLevel: string; // Standard, Express, Overnight, etc.

  @Column({ length: 50, nullable: true })
  driverName: string;

  @Column({ length: 20, nullable: true })
  driverPhone: string;

  @Column({ length: 50, nullable: true })
  vehicleId: string;

  @Column({ length: 20, nullable: true })
  vehiclePlateNumber: string;

  // Scheduling
  @Column({ type: 'timestamp', nullable: true })
  scheduledPickupDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualPickupDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduledDeliveryDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualDeliveryDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  estimatedDeliveryDate: Date;

  // Physical Characteristics
  @Column({ type: 'decimal', precision: 10, scale: 3 })
  weight: number;

  @Column({ type: 'json', nullable: true })
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
    volume?: number;
  };

  @Column({ type: 'int', default: 1 })
  packageCount: number;

  // Financial Information
  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  shippingCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  insuranceValue: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  declaredValue: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  // Route and Distance
  @Column({ type: 'json', nullable: true })
  routeInformation: {
    plannedRoute?: {
      distance: number;
      estimatedDuration: number;
      waypoints?: { latitude: number; longitude: number; name: string }[];
    };
    actualRoute?: {
      distance: number;
      actualDuration: number;
      waypoints?: { latitude: number; longitude: number; timestamp: Date }[];
    };
    optimizedRoute?: {
      distance: number;
      estimatedDuration: number;
      fuelEfficiency?: number;
      costOptimized?: boolean;
    };
  };

  // Real-time Tracking
  @Column({ type: 'json', nullable: true })
  trackingData: {
    currentLocation?: {
      latitude: number;
      longitude: number;
      address?: string;
      timestamp: Date;
    };
    trackingHistory?: {
      latitude: number;
      longitude: number;
      timestamp: Date;
      status: string;
      notes?: string;
    }[];
    lastUpdate?: Date;
    nextUpdate?: Date;
    trackingAccuracy?: number;
  };

  // IoT and Sensor Data
  @Column({ type: 'json', nullable: true })
  iotData: {
    sensorDevices?: {
      deviceId: string;
      deviceType: 'gps' | 'temperature' | 'humidity' | 'shock' | 'door' | 'fuel';
      batteryLevel?: number;
      lastReading?: Date;
    }[];
    environmentalData?: {
      temperature?: { value: number; timestamp: Date; unit: string }[];
      humidity?: { value: number; timestamp: Date; unit: string }[];
      pressure?: { value: number; timestamp: Date; unit: string }[];
      shockEvents?: { intensity: number; timestamp: Date; location?: string }[];
    };
    securityData?: {
      doorOpenings?: { timestamp: Date; location?: string; authorized: boolean }[];
      geofenceViolations?: { timestamp: Date; location: { lat: number; lng: number } }[];
      tamperAlerts?: { timestamp: Date; severity: string; description: string }[];
    };
  };

  // Documentation and Compliance
  @Column({ type: 'json', nullable: true })
  documents: {
    billOfLading?: string;
    packingList?: string;
    invoice?: string;
    customsDeclaration?: string;
    dangerousGoodsDeclaration?: string;
    deliveryReceipt?: string;
    proofOfDelivery?: string;
    customsClearance?: string;
  };

  @Column({ type: 'json', nullable: true })
  complianceData: {
    hazardousMaterials?: boolean;
    specialHandling?: string[];
    temperatureControlled?: boolean;
    customsRequired?: boolean;
    exportLicense?: string;
    importPermit?: string;
    certifications?: string[];
    regulations?: string[];
  };

  // Quality and Condition
  @Column({ type: 'json', nullable: true })
  qualityData: {
    conditionAtPickup?: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
    conditionAtDelivery?: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
    qualityChecks?: {
      checkType: string;
      result: string;
      timestamp: Date;
      inspector: string;
      notes?: string;
    }[];
    damageReports?: {
      reportId: string;
      damageType: string;
      severity: string;
      timestamp: Date;
      photos?: string[];
      description: string;
    }[];
  };

  // Delivery Information
  @Column({ type: 'json', nullable: true })
  deliveryData: {
    deliveryAttempts?: {
      attemptNumber: number;
      timestamp: Date;
      status: 'successful' | 'failed' | 'reschedule';
      reason?: string;
      nextAttempt?: Date;
    }[];
    deliveryInstructions?: string;
    signatureCaptured?: boolean;
    signatureImage?: string;
    receivedBy?: string;
    deliveryPhoto?: string;
    deliveryNotes?: string;
    customerRating?: number;
    customerFeedback?: string;
  };

  // AI Analytics and Optimization
  @Column({ type: 'json', nullable: true })
  aiAnalytics: {
    delayPrediction?: {
      probabilityOfDelay: number;
      expectedDelayHours: number;
      delayReasons: string[];
      confidence: number;
    };
    routeOptimization?: {
      fuelSavings: number;
      timeSavings: number;
      costSavings: number;
      carbonReduction: number;
    };
    riskAssessment?: {
      weatherRisk: number;
      trafficRisk: number;
      securityRisk: number;
      damageRisk: number;
      overallRisk: number;
    };
    performanceMetrics?: {
      onTimePerformance: number;
      costEfficiency: number;
      customerSatisfaction: number;
      carrierPerformance: number;
    };
  };

  // Special Instructions and Notes
  @Column({ type: 'text', nullable: true })
  specialInstructions: string;

  @Column({ type: 'text', nullable: true })
  pickupNotes: string;

  @Column({ type: 'text', nullable: true })
  deliveryNotes: string;

  @Column({ type: 'text', nullable: true })
  internalNotes: string;

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
  isInTransit(): boolean {
    return [
      ShipmentStatus.PICKED_UP,
      ShipmentStatus.IN_TRANSIT,
      ShipmentStatus.OUT_FOR_DELIVERY
    ].includes(this.status);
  }

  isDelivered(): boolean {
    return this.status === ShipmentStatus.DELIVERED;
  }

  isDelayed(): boolean {
    if (!this.scheduledDeliveryDate) return false;
    const now = new Date();
    return now > this.scheduledDeliveryDate && !this.isDelivered();
  }

  getDelayHours(): number {
    if (!this.isDelayed()) return 0;
    const now = new Date();
    const diffMs = now.getTime() - this.scheduledDeliveryDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60));
  }

  calculateTransitTime(): number | null {
    if (!this.actualPickupDate || !this.actualDeliveryDate) return null;
    const diffMs = this.actualDeliveryDate.getTime() - this.actualPickupDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60)); // Hours
  }

  getExpectedDeliveryTime(): Date | null {
    return this.estimatedDeliveryDate || this.scheduledDeliveryDate;
  }

  getCurrentLocation(): { latitude: number; longitude: number } | null {
    return this.trackingData?.currentLocation || null;
  }

  getDistanceToDestination(): number | null {
    const currentLoc = this.getCurrentLocation();
    const destCoords = this.destinationAddress?.coordinates;
    
    if (!currentLoc || !destCoords) return null;
    
    // Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(destCoords.latitude - currentLoc.latitude);
    const dLng = this.toRadians(destCoords.longitude - currentLoc.longitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(currentLoc.latitude)) * 
              Math.cos(this.toRadians(destCoords.latitude)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  hasTemperatureViolation(): boolean {
    if (!this.iotData?.environmentalData?.temperature) return false;
    
    // Check if any temperature reading is outside acceptable range
    // This would typically be based on product requirements
    return this.iotData.environmentalData.temperature.some(reading => 
      reading.value < -18 || reading.value > 25 // Example thresholds
    );
  }

  hasSecurityViolation(): boolean {
    const securityData = this.iotData?.securityData;
    return !!(securityData?.geofenceViolations?.length || 
              securityData?.tamperAlerts?.length ||
              securityData?.doorOpenings?.some(opening => !opening.authorized));
  }

  getDeliveryAttempts(): number {
    return this.deliveryData?.deliveryAttempts?.length || 0;
  }

  requiresSpecialHandling(): boolean {
    return !!(this.complianceData?.specialHandling?.length ||
              this.complianceData?.hazardousMaterials ||
              this.complianceData?.temperatureControlled);
  }

  isHighPriority(): boolean {
    return [ShipmentPriority.HIGH, ShipmentPriority.CRITICAL, ShipmentPriority.EMERGENCY]
      .includes(this.priority);
  }

  updateStatus(status: ShipmentStatus, updatedBy: string, notes?: string): void {
    this.status = status;
    this.updatedBy = updatedBy;
    
    // Update tracking history
    if (!this.trackingData) this.trackingData = {};
    if (!this.trackingData.trackingHistory) this.trackingData.trackingHistory = [];
    
    this.trackingData.trackingHistory.push({
      latitude: this.trackingData.currentLocation?.latitude || 0,
      longitude: this.trackingData.currentLocation?.longitude || 0,
      timestamp: new Date(),
      status,
      notes
    });

    // Set actual dates based on status
    switch (status) {
      case ShipmentStatus.PICKED_UP:
        if (!this.actualPickupDate) this.actualPickupDate = new Date();
        break;
      case ShipmentStatus.DELIVERED:
        if (!this.actualDeliveryDate) this.actualDeliveryDate = new Date();
        break;
    }
  }

  addTrackingUpdate(location: { latitude: number; longitude: number; address?: string }): void {
    if (!this.trackingData) this.trackingData = {};
    
    this.trackingData.currentLocation = {
      ...location,
      timestamp: new Date()
    };
    this.trackingData.lastUpdate = new Date();
  }

  addIoTReading(deviceType: string, reading: any): void {
    if (!this.iotData) this.iotData = {};
    if (!this.iotData.environmentalData) this.iotData.environmentalData = {};
    
    const timestamp = new Date();
    
    switch (deviceType) {
      case 'temperature':
        if (!this.iotData.environmentalData.temperature) {
          this.iotData.environmentalData.temperature = [];
        }
        this.iotData.environmentalData.temperature.push({
          value: reading.value,
          timestamp,
          unit: reading.unit || 'C'
        });
        break;
        
      case 'humidity':
        if (!this.iotData.environmentalData.humidity) {
          this.iotData.environmentalData.humidity = [];
        }
        this.iotData.environmentalData.humidity.push({
          value: reading.value,
          timestamp,
          unit: '%'
        });
        break;
        
      case 'shock':
        if (!this.iotData.environmentalData.shockEvents) {
          this.iotData.environmentalData.shockEvents = [];
        }
        this.iotData.environmentalData.shockEvents.push({
          intensity: reading.intensity,
          timestamp,
          location: reading.location
        });
        break;
    }
  }

  recordDeliveryAttempt(status: 'successful' | 'failed' | 'reschedule', reason?: string, nextAttempt?: Date): void {
    if (!this.deliveryData) this.deliveryData = {};
    if (!this.deliveryData.deliveryAttempts) this.deliveryData.deliveryAttempts = [];
    
    this.deliveryData.deliveryAttempts.push({
      attemptNumber: this.deliveryData.deliveryAttempts.length + 1,
      timestamp: new Date(),
      status,
      reason,
      nextAttempt
    });
  }

  calculateEstimatedDelivery(): Date | null {
    const currentLoc = this.getCurrentLocation();
    const destCoords = this.destinationAddress?.coordinates;
    
    if (!currentLoc || !destCoords) return null;
    
    const distance = this.getDistanceToDestination();
    if (!distance) return null;
    
    // Estimate based on transport mode (simplified calculation)
    let averageSpeed = 60; // km/h default for truck
    
    switch (this.transportMode) {
      case TransportMode.AIR:
        averageSpeed = 500;
        break;
      case TransportMode.OCEAN:
        averageSpeed = 30;
        break;
      case TransportMode.RAIL:
        averageSpeed = 80;
        break;
      case TransportMode.DRONE:
        averageSpeed = 100;
        break;
    }
    
    const estimatedHours = distance / averageSpeed;
    const now = new Date();
    return new Date(now.getTime() + (estimatedHours * 60 * 60 * 1000));
  }
}
