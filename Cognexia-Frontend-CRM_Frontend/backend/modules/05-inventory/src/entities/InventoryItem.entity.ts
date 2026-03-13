import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { IsNotEmpty, IsOptional, Min, Max } from 'class-validator';
import { StockMovement } from './StockMovement.entity';
import { InventoryLocation } from './InventoryLocation.entity';
import { StockAdjustment } from './StockAdjustment.entity';

export enum ItemType {
  RAW_MATERIAL = 'raw_material',
  COMPONENT = 'component',
  SUB_ASSEMBLY = 'sub_assembly',
  FINISHED_GOOD = 'finished_good',
  CONSUMABLE = 'consumable',
  TOOL = 'tool',
  SPARE_PART = 'spare_part',
  PACKAGING = 'packaging',
  MRO = 'mro', // Maintenance, Repair, Operations
  VIRTUAL = 'virtual',
  DIGITAL_ASSET = 'digital_asset',
}

export enum ItemStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
  OBSOLETE = 'obsolete',
  QUARANTINED = 'quarantined',
  BLOCKED = 'blocked',
  PENDING_APPROVAL = 'pending_approval',
}

export enum ABCClassification {
  A = 'A', // High value, high importance
  B = 'B', // Medium value, medium importance
  C = 'C', // Low value, low importance
  X = 'X', // Exceptional items
}

export enum VelocityClassification {
  FAST = 'fast',
  MEDIUM = 'medium',
  SLOW = 'slow',
  NON_MOVING = 'non_moving',
  DEAD = 'dead',
}

@Entity('inventory_items')
@Index(['itemCode'], { unique: true })
@Index(['barcode'], { unique: true })
@Index(['type', 'status'])
@Index(['abcClassification', 'velocityClassification'])
@Index(['reorderPoint', 'currentStock'])
@Index(['createdAt', 'updatedAt'])
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @IsNotEmpty()
  itemCode: string;

  @Column({ length: 255 })
  @IsNotEmpty()
  itemName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ItemType,
    default: ItemType.RAW_MATERIAL,
  })
  type: ItemType;

  @Column({
    type: 'enum',
    enum: ItemStatus,
    default: ItemStatus.ACTIVE,
  })
  status: ItemStatus;

  // Identification and Tracking
  @Column({ unique: true, length: 100, nullable: true })
  barcode: string;

  @Column({ length: 100, nullable: true })
  qrCode: string;

  @Column({ length: 100, nullable: true })
  rfidTag: string;

  @Column({ length: 100, nullable: true })
  serialNumber: string;

  @Column({ length: 100, nullable: true })
  lotNumber: string;

  @Column({ length: 100, nullable: true })
  batchNumber: string;

  // Category and Classification
  @Column({ length: 100, nullable: true })
  category: string;

  @Column({ length: 100, nullable: true })
  subcategory: string;

  @Column({ length: 100, nullable: true })
  brand: string;

  @Column({ length: 100, nullable: true })
  manufacturer: string;

  @Column({ length: 100, nullable: true })
  model: string;

  @Column({
    type: 'enum',
    enum: ABCClassification,
    default: ABCClassification.C,
  })
  abcClassification: ABCClassification;

  @Column({
    type: 'enum',
    enum: VelocityClassification,
    default: VelocityClassification.MEDIUM,
  })
  velocityClassification: VelocityClassification;

  // Physical Characteristics
  @Column({ length: 50, nullable: true })
  unitOfMeasure: string;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  weight: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  length: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  width: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  height: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  volume: number;

  @Column({ length: 50, nullable: true })
  color: string;

  @Column({ length: 100, nullable: true })
  material: string;

  // Stock Levels and Control
  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  @Min(0)
  currentStock: number;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  @Min(0)
  availableStock: number;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  @Min(0)
  reservedStock: number;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  @Min(0)
  onOrderStock: number;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  @Min(0)
  safetyStock: number;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  @Min(0)
  reorderPoint: number;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  @Min(0)
  reorderQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 3, nullable: true })
  @Min(0)
  maximumStock: number;

  @Column({ type: 'decimal', precision: 15, scale: 3, nullable: true })
  @Min(0)
  minimumStock: number;

  // Costing Information
  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  @Min(0)
  unitCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  @Min(0)
  averageCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  @Min(0)
  standardCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  @Min(0)
  lastPurchaseCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  @Min(0)
  sellingPrice: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  // Lead Time and Supplier Information
  @Column({ type: 'int', nullable: true })
  @Min(0)
  leadTimeDays: number;

  @Column({ length: 255, nullable: true })
  primarySupplier: string;

  @Column({ type: 'json', nullable: true })
  alternativeSuppliers: Array<{
    supplierId: string;
    supplierName: string;
    supplierPartNumber: string;
    leadTime: number;
    cost: number;
    isPreferred: boolean;
    reliability: number;
  }>;

  // Quality and Compliance
  @Column({ type: 'json', nullable: true })
  qualityStandards: Array<{
    standard: string;
    version: string;
    certificationDate: Date;
    expiryDate: Date;
    certifyingBody: string;
  }>;

  @Column({ type: 'json', nullable: true })
  complianceRequirements: Array<{
    regulation: string;
    requirement: string;
    status: 'compliant' | 'non_compliant' | 'pending';
    lastAudit: Date;
    nextAudit: Date;
  }>;

  @Column({ default: false })
  isHazardous: boolean;

  @Column({ type: 'json', nullable: true })
  hazardousInfo: {
    unNumber: string;
    hazardClass: string;
    packingGroup: string;
    properShippingName: string;
    specialHandling: string[];
    storageRequirements: string[];
  };

  // Expiry and Shelf Life
  @Column({ default: false })
  hasExpiry: boolean;

  @Column({ type: 'int', nullable: true })
  shelfLifeDays: number;

  @Column({ type: 'timestamp', nullable: true })
  expiryDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastReceiptDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastIssueDate: Date;

  // Storage Requirements
  @Column({ type: 'json', nullable: true })
  storageRequirements: {
    temperatureMin: number;
    temperatureMax: number;
    humidityMin: number;
    humidityMax: number;
    lightSensitive: boolean;
    stackable: boolean;
    maxStackHeight: number;
    specialRequirements: string[];
  };

  // AI-Enhanced Analytics
  @Column({ type: 'json', nullable: true })
  aiAnalytics: {
    demandForecast: {
      nextMonth: number;
      nextQuarter: number;
      confidence: number;
      seasonalityFactor: number;
      trendDirection: 'increasing' | 'decreasing' | 'stable';
    };
    optimizationSuggestions: Array<{
      type: 'reorder_point' | 'safety_stock' | 'economic_order_quantity';
      currentValue: number;
      suggestedValue: number;
      reason: string;
      potentialSaving: number;
    }>;
    riskAssessment: {
      stockoutRisk: number;
      excessInventoryRisk: number;
      obsolescenceRisk: number;
      supplierRisk: number;
      overallRisk: 'low' | 'medium' | 'high' | 'critical';
    };
    performanceMetrics: {
      turnoverRatio: number;
      fillRate: number;
      stockoutOccurrences: number;
      averageDaysOnHand: number;
      carryCost: number;
    };
  };

  // IoT and Sensor Integration
  @Column({ type: 'json', nullable: true })
  iotDevices: Array<{
    deviceId: string;
    deviceType: 'rfid_reader' | 'weight_sensor' | 'temperature_sensor' | 'humidity_sensor' | 'barcode_scanner';
    location: string;
    lastReading: {
      value: any;
      timestamp: Date;
      unit: string;
    };
    alerts: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      message: string;
      timestamp: Date;
    }>;
  }>;

  // Cycle Counting and Physical Inventory
  @Column({ type: 'json', nullable: true })
  cycleCounting: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
    lastCountDate: Date;
    nextCountDate: Date;
    countedQuantity: number;
    systemQuantity: number;
    variance: number;
    countAccuracy: number;
    counterId: string;
  };

  // Reservations and Allocations
  @Column({ type: 'json', nullable: true })
  reservations: Array<{
    reservationId: string;
    orderNumber: string;
    customerId: string;
    reservedQuantity: number;
    reservationDate: Date;
    requiredDate: Date;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'active' | 'expired' | 'fulfilled' | 'cancelled';
  }>;

  // Movement History Summary
  @Column({ type: 'json', nullable: true })
  movementSummary: {
    lastMovementDate: Date;
    totalReceipts: number;
    totalIssues: number;
    totalAdjustments: number;
    averageMovementVolume: number;
    frequentMovementTypes: string[];
  };

  // Seasonal and Trend Analysis
  @Column({ type: 'json', nullable: true })
  seasonalAnalysis: {
    peakSeason: string;
    lowSeason: string;
    seasonalityIndex: number[];
    yearOverYearGrowth: number;
    trendAnalysis: {
      shortTerm: 'up' | 'down' | 'stable';
      longTerm: 'up' | 'down' | 'stable';
      confidence: number;
    };
  };

  // Digital Twin Integration
  @Column({ type: 'json', nullable: true })
  digitalTwin: {
    modelId: string;
    simulationResults: {
      optimalStock: number;
      predictedDemand: number;
      recommendedReorderPoint: number;
      costOptimization: number;
    };
    lastUpdateDate: Date;
    accuracy: number;
  };

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 50, nullable: true })
  createdBy: string;

  @Column({ length: 50, nullable: true })
  updatedBy: string;

  // Relationships
  @OneToMany(() => StockMovement, (movement) => movement.inventoryItem)
  stockMovements: StockMovement[];

  @OneToMany(() => StockAdjustment, (adjustment) => adjustment.inventoryItem)
  stockAdjustments: StockAdjustment[];

  @ManyToMany(() => InventoryLocation)
  @JoinTable()
  locations: InventoryLocation[];

  // Computed Properties
  get totalValue(): number {
    return this.currentStock * this.unitCost;
  }

  get isLowStock(): boolean {
    return this.currentStock <= this.reorderPoint;
  }

  get stockoutRisk(): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = this.currentStock / this.reorderPoint;
    if (ratio <= 0.1) return 'critical';
    if (ratio <= 0.5) return 'high';
    if (ratio <= 0.8) return 'medium';
    return 'low';
  }

  get daysOfSupply(): number {
    const dailyUsage = this.aiAnalytics?.demandForecast?.nextMonth / 30 || 1;
    return this.currentStock / dailyUsage;
  }

  get inventoryTurnover(): number {
    return this.aiAnalytics?.performanceMetrics?.turnoverRatio || 0;
  }

  get isExpired(): boolean {
    if (!this.hasExpiry || !this.expiryDate) return false;
    return new Date() > this.expiryDate;
  }

  get isNearExpiry(): boolean {
    if (!this.hasExpiry || !this.expiryDate) return false;
    const daysToExpiry = Math.ceil(
      (this.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysToExpiry <= 30; // Consider near expiry if within 30 days
  }

  // Methods
  updateStock(quantity: number, movementType: string, reason?: string): void {
    this.currentStock += quantity;
    this.availableStock = Math.max(0, this.currentStock - this.reservedStock);
    
    if (this.movementSummary) {
      this.movementSummary.lastMovementDate = new Date();
      if (quantity > 0) {
        this.movementSummary.totalReceipts += quantity;
      } else {
        this.movementSummary.totalIssues += Math.abs(quantity);
      }
    }
  }

  reserveStock(quantity: number, reservationId: string, orderNumber: string): boolean {
    if (this.availableStock >= quantity) {
      this.reservedStock += quantity;
      this.availableStock -= quantity;
      
      if (!this.reservations) {
        this.reservations = [];
      }
      
      this.reservations.push({
        reservationId,
        orderNumber,
        customerId: 'unknown',
        reservedQuantity: quantity,
        reservationDate: new Date(),
        requiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
        priority: 'medium',
        status: 'active',
      });
      
      return true;
    }
    return false;
  }

  releaseReservation(reservationId: string): void {
    if (!this.reservations) return;
    
    const reservation = this.reservations.find(r => r.reservationId === reservationId);
    if (reservation && reservation.status === 'active') {
      this.reservedStock -= reservation.reservedQuantity;
      this.availableStock += reservation.reservedQuantity;
      reservation.status = 'cancelled';
    }
  }

  calculateReorderPoint(demandRate: number, leadTime: number, serviceLevel: number = 0.95): void {
    // Safety stock calculation using statistical approach
    const demandVariability = 0.2; // Assume 20% demand variability
    const leadTimeVariability = 0.1; // Assume 10% lead time variability
    const zScore = this.getZScore(serviceLevel);
    
    const averageDemandDuringLeadTime = demandRate * leadTime;
    const varianceOfDemandDuringLeadTime = 
      (leadTime * Math.pow(demandRate * demandVariability, 2)) +
      (Math.pow(demandRate, 2) * Math.pow(leadTime * leadTimeVariability, 2));
    
    const safetyStock = zScore * Math.sqrt(varianceOfDemandDuringLeadTime);
    
    this.safetyStock = safetyStock;
    this.reorderPoint = averageDemandDuringLeadTime + safetyStock;
  }

  private getZScore(serviceLevel: number): number {
    // Z-score lookup for common service levels
    const zScores: { [key: number]: number } = {
      0.90: 1.28,
      0.95: 1.65,
      0.97: 1.88,
      0.99: 2.33,
      0.995: 2.58,
    };
    return zScores[serviceLevel] || 1.65;
  }

  calculateABCClassification(annualUsage: number, unitCost: number): void {
    const annualValue = annualUsage * unitCost;
    
    // This would typically use Pareto analysis across all items
    // For now, using simplified thresholds
    if (annualValue >= 100000) {
      this.abcClassification = ABCClassification.A;
    } else if (annualValue >= 10000) {
      this.abcClassification = ABCClassification.B;
    } else {
      this.abcClassification = ABCClassification.C;
    }
  }

  updateVelocityClassification(annualTurns: number): void {
    if (annualTurns >= 12) {
      this.velocityClassification = VelocityClassification.FAST;
    } else if (annualTurns >= 4) {
      this.velocityClassification = VelocityClassification.MEDIUM;
    } else if (annualTurns >= 1) {
      this.velocityClassification = VelocityClassification.SLOW;
    } else if (annualTurns > 0) {
      this.velocityClassification = VelocityClassification.NON_MOVING;
    } else {
      this.velocityClassification = VelocityClassification.DEAD;
    }
  }

  generateQRCode(): string {
    // Generate QR code data with comprehensive item information
    const qrData = {
      itemCode: this.itemCode,
      itemName: this.itemName,
      barcode: this.barcode,
      location: 'primary', // Would be actual location
      lastUpdated: new Date().toISOString(),
    };
    
    this.qrCode = Buffer.from(JSON.stringify(qrData)).toString('base64');
    return this.qrCode;
  }
}
