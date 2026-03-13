// Industry 5.0 ERP Backend - Supply Chain Module
// InventoryItem Entity - Advanced inventory management with IoT integration and AI optimization
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
import { Warehouse } from './Warehouse';
import { InventoryTransaction } from './InventoryTransaction';
import { LogisticsShipment } from './LogisticsShipment';

export enum InventoryItemStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  ALLOCATED = 'allocated',
  IN_TRANSIT = 'in_transit',
  DAMAGED = 'damaged',
  EXPIRED = 'expired',
  QUARANTINED = 'quarantined',
  BACKORDERED = 'backordered'
}

export enum InventoryClassification {
  RAW_MATERIAL = 'raw_material',
  WORK_IN_PROGRESS = 'work_in_progress',
  FINISHED_GOODS = 'finished_goods',
  MAINTENANCE_SUPPLIES = 'maintenance_supplies',
  PACKAGING_MATERIAL = 'packaging_material',
  CONSUMABLES = 'consumables',
  SPARE_PARTS = 'spare_parts',
  TOOLS_EQUIPMENT = 'tools_equipment'
}

export enum ABCClassification {
  A = 'A', // High value items (80% of value, 20% of items)
  B = 'B', // Medium value items (15% of value, 30% of items)  
  C = 'C'  // Low value items (5% of value, 50% of items)
}

@Entity('inventory_items')
@Index(['sku'])
@Index(['warehouseId', 'status'])
@Index(['classification', 'abcClassification'])
@Index(['lastMovementDate'])
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @Index()
  sku: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: InventoryClassification,
    default: InventoryClassification.RAW_MATERIAL
  })
  classification: InventoryClassification;

  @Column({
    type: 'enum',
    enum: ABCClassification,
    default: ABCClassification.C
  })
  abcClassification: ABCClassification;

  // Quantity Management
  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  currentQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  reservedQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  allocatedQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  availableQuantity: number;

  @Column({ length: 20 })
  unit: string; // kg, pcs, liters, meters, etc.

  // Location and Storage
  @Column({ type: 'uuid' })
  warehouseId: string;

  @ManyToOne(() => Warehouse, warehouse => warehouse.inventoryItems)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

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

  @Column({ length: 100, nullable: true })
  locationCode: string;

  // Financial Information
  @Column({ type: 'decimal', precision: 15, scale: 4 })
  unitCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  averageCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  standardCost: number;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  totalValue: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  // Inventory Control Parameters
  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  minimumStock: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  maximumStock: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  reorderPoint: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  reorderQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  safetyStock: number;

  @Column({ type: 'int', default: 30 })
  leadTimeDays: number;

  // Product Specifications
  @Column({ type: 'json', nullable: true })
  specifications: {
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
      unit: string;
    };
    volume?: number;
    color?: string;
    material?: string;
    grade?: string;
    model?: string;
    brand?: string;
    manufacturer?: string;
    countryOfOrigin?: string;
  };

  // Quality and Compliance
  @Column({
    type: 'enum',
    enum: InventoryItemStatus,
    default: InventoryItemStatus.AVAILABLE
  })
  status: InventoryItemStatus;

  @Column({ type: 'date', nullable: true })
  expirationDate: Date;

  @Column({ type: 'date', nullable: true })
  manufacturingDate: Date;

  @Column({ type: 'int', nullable: true })
  shelfLifeDays: number;

  @Column({ type: 'json', nullable: true })
  qualityMetrics: {
    grade?: string;
    purityPercentage?: number;
    defectRate?: number;
    qualityScore?: number;
    certifications?: string[];
    inspectionDate?: Date;
    inspectedBy?: string;
    qualityNotes?: string;
  };

  // IoT and Smart Tracking
  @Column({ type: 'json', nullable: true })
  iotData: {
    rfidTag?: string;
    nfcTag?: string;
    barcodes?: string[];
    qrCodes?: string[];
    sensorIds?: string[];
    trackingDevices?: string[];
    lastSensorReading?: Date;
    environmentalConditions?: {
      temperature?: number;
      humidity?: number;
      pressure?: number;
      lightExposure?: number;
    };
  };

  // AI and Analytics
  @Column({ type: 'json', nullable: true })
  aiInsights: {
    demandForecast?: {
      nextWeek: number;
      nextMonth: number;
      nextQuarter: number;
      confidence: number;
    };
    seasonalityPattern?: string;
    trendAnalysis?: string;
    recommendedActions?: string[];
    riskAssessment?: {
      stockoutRisk: number;
      obsolescenceRisk: number;
      qualityRisk: number;
    };
    optimizedReorderPoint?: number;
    predictiveMaintenanceAlert?: boolean;
  };

  // Movement Tracking
  @Column({ type: 'timestamp', nullable: true })
  lastMovementDate: Date;

  @Column({ length: 100, nullable: true })
  lastMovementType: string; // receipt, issue, transfer, adjustment

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  totalMovementsThisMonth: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  turnoverRate: number; // Annual turnover rate

  @Column({ type: 'int', default: 0 })
  daysSinceLastMovement: number;

  // Supplier Information
  @Column({ type: 'uuid', nullable: true })
  primarySupplierId: string;

  @Column({ type: 'json', nullable: true })
  supplierInfo: {
    alternativeSuppliers?: string[];
    leadTimes?: { [supplierId: string]: number };
    prices?: { [supplierId: string]: number };
    qualityRatings?: { [supplierId: string]: number };
    lastPurchaseDate?: Date;
    preferredSupplier?: string;
  };

  // Sustainability and ESG
  @Column({ type: 'json', nullable: true })
  sustainabilityMetrics: {
    carbonFootprint?: number;
    recyclabilityScore?: number;
    sustainabilityRating?: string;
    environmentalCertifications?: string[];
    responsibleSourcing?: boolean;
    circularEconomyScore?: number;
  };

  // Relationships
  @OneToMany(() => InventoryTransaction, transaction => transaction.inventoryItem)
  transactions: InventoryTransaction[];

  @OneToMany(() => LogisticsShipment, shipment => shipment.inventoryItem)
  shipments: LogisticsShipment[];

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
  calculateAvailableQuantity(): number {
    return Math.max(0, this.currentQuantity - this.reservedQuantity - this.allocatedQuantity);
  }

  isLowStock(): boolean {
    return this.availableQuantity <= this.minimumStock;
  }

  isReorderPointReached(): boolean {
    return this.availableQuantity <= this.reorderPoint;
  }

  isExpiringSoon(daysThreshold: number = 30): boolean {
    if (!this.expirationDate) return false;
    const today = new Date();
    const daysDiff = Math.floor((this.expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= daysThreshold && daysDiff >= 0;
  }

  isExpired(): boolean {
    if (!this.expirationDate) return false;
    return new Date() > this.expirationDate;
  }

  calculateTotalValue(): number {
    return this.currentQuantity * this.averageCost;
  }

  getDaysInStock(): number {
    if (!this.lastMovementDate) return 0;
    const today = new Date();
    return Math.floor((today.getTime() - this.lastMovementDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  getLocationFullPath(): string {
    const parts = [this.zone, this.aisle, this.rack, this.shelf, this.bin].filter(Boolean);
    return parts.length > 0 ? parts.join('-') : (this.locationCode || 'UNKNOWN');
  }

  updateAIInsights(insights: Partial<InventoryItem['aiInsights']>): void {
    this.aiInsights = { ...this.aiInsights, ...insights };
  }

  recordMovement(type: string, quantity: number): void {
    this.lastMovementType = type;
    this.lastMovementDate = new Date();
    this.daysSinceLastMovement = 0;
    this.totalMovementsThisMonth += Math.abs(quantity);
  }

  calculateOptimalReorderQuantity(): number {
    // Economic Order Quantity (EOQ) calculation
    // Considering AI insights if available
    if (this.aiInsights?.optimizedReorderPoint) {
      return this.aiInsights.optimizedReorderPoint;
    }
    return this.reorderQuantity || (this.maximumStock - this.minimumStock);
  }

  getStockStatus(): 'CRITICAL' | 'LOW' | 'NORMAL' | 'HIGH' | 'EXCESS' {
    const available = this.availableQuantity;
    
    if (available <= 0) return 'CRITICAL';
    if (available <= this.minimumStock) return 'LOW';
    if (available >= this.maximumStock) return 'EXCESS';
    if (available >= (this.maximumStock * 0.8)) return 'HIGH';
    return 'NORMAL';
  }

  canFulfillOrder(requestedQuantity: number): boolean {
    return this.availableQuantity >= requestedQuantity && 
           this.status === InventoryItemStatus.AVAILABLE;
  }
}
