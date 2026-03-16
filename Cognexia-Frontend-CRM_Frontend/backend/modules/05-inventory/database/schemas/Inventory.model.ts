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
  BeforeInsert
} from 'typeorm';
import { IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, IsObject, IsArray } from 'class-validator';
import { Organization } from '../core/Organization.model';
import { User } from '../core/User.model';

// Enums
export enum ItemType {
  RAW_MATERIAL = 'raw_material',
  COMPONENT = 'component',
  FINISHED_GOOD = 'finished_good',
  WORK_IN_PROGRESS = 'work_in_progress',
  CONSUMABLE = 'consumable',
  TOOL = 'tool',
  SPARE_PART = 'spare_part',
  PACKAGING = 'packaging'
}

export enum ItemStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
  OBSOLETE = 'obsolete',
  PENDING_APPROVAL = 'pending_approval'
}

export enum StockStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  QUARANTINE = 'quarantine',
  DAMAGED = 'damaged',
  EXPIRED = 'expired',
  ON_HOLD = 'on_hold'
}

export enum TransactionType {
  RECEIPT = 'receipt',
  ISSUE = 'issue',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
  RETURN = 'return',
  SCRAP = 'scrap',
  CONSUMPTION = 'consumption',
  PRODUCTION = 'production'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REVERSED = 'reversed'
}

export enum UnitType {
  PIECE = 'piece',
  KG = 'kg',
  GRAM = 'gram',
  LITER = 'liter',
  METER = 'meter',
  BOX = 'box',
  ROLL = 'roll',
  SHEET = 'sheet'
}

export enum ValuationMethod {
  FIFO = 'fifo',
  LIFO = 'lifo',
  AVERAGE = 'average',
  STANDARD = 'standard',
  SPECIFIC = 'specific'
}

export enum CountType {
  CYCLE_COUNT = 'cycle_count',
  PHYSICAL_COUNT = 'physical_count',
  SPOT_CHECK = 'spot_check',
  ANNUAL_COUNT = 'annual_count'
}

export enum CountStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  APPROVED = 'approved',
  CANCELLED = 'cancelled'
}

/**
 * Item Entity
 * Represents items/products in the inventory system
 */
@Entity('items')
@Index(['organizationId', 'status'])
@Index(['itemType'])
@Index(['itemCode'], { unique: true })
@Index(['category'])
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @IsNotEmpty()
  itemCode: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ 
    type: 'enum', 
    enum: ItemType,
    default: ItemType.RAW_MATERIAL
  })
  @IsEnum(ItemType)
  itemType: ItemType;

  @Column({ 
    type: 'enum', 
    enum: ItemStatus,
    default: ItemStatus.ACTIVE
  })
  @IsEnum(ItemStatus)
  status: ItemStatus;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  category: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  subcategory: string;

  // Basic Properties
  @Column({ type: 'varchar', length: 255, nullable: true })
  manufacturer: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  brand: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  model: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  partNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serialNumber: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  barcodeType: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  barcode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  rfidTag: string;

  // Units and Measurements
  @Column({ 
    type: 'enum', 
    enum: UnitType,
    default: UnitType.PIECE
  })
  @IsEnum(UnitType)
  baseUnit: UnitType;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  alternativeUnits: any[];

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  weight: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  weightUnit: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  volume: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  volumeUnit: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  dimensions: string; // "L x W x H"

  // Cost and Valuation
  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  standardCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  averageCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  lastCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  sellingPrice: number;

  @Column({ 
    type: 'enum', 
    enum: ValuationMethod,
    default: ValuationMethod.AVERAGE
  })
  @IsEnum(ValuationMethod)
  valuationMethod: ValuationMethod;

  // Inventory Control
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

  @Column({ type: 'int', default: 0 })
  leadTimeDays: number;

  // Quality Control
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  qualityControlRequired: boolean;

  @Column({ type: 'int', nullable: true })
  shelfLifeDays: number;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  lotControlled: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  serialControlled: boolean;

  // Storage Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  defaultLocation: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  storageRequirements: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  storageTemperature: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  storageHumidity: number;

  // Supplier Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  preferredSupplier: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  approvedSuppliers: string[];

  // Classification
  @Column({ type: 'varchar', length: 10, nullable: true })
  abcClassification: string; // A, B, C

  @Column({ type: 'varchar', length: 10, nullable: true })
  xyzClassification: string; // X, Y, Z

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  criticalItem: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  hazardousMaterial: boolean;

  // Specifications
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  specifications: any;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  customFields: any[];

  // Documentation
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  attachments: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  images: any[];

  // Smart Inventory
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  aiDemandForecastEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  iotMonitoringEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  demandForecast: any;

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @OneToMany(() => Stock, stock => stock.item)
  stocks: Stock[];

  @OneToMany(() => InventoryTransaction, transaction => transaction.item)
  transactions: InventoryTransaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Lifecycle hooks
  @BeforeInsert()
  generateItemCode() {
    if (!this.itemCode) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      this.itemCode = `ITM-${timestamp}-${random}`;
    }
  }

  // Business Logic Methods
  calculateCurrentStock(): number {
    if (!this.stocks) return 0;
    return this.stocks.reduce((total, stock) => {
      if (stock.status === StockStatus.AVAILABLE) {
        return total + stock.quantityOnHand;
      }
      return total;
    }, 0);
  }

  calculateTotalValue(): number {
    if (!this.stocks) return 0;
    return this.stocks.reduce((total, stock) => {
      return total + (stock.quantityOnHand * stock.unitCost);
    }, 0);
  }

  isReorderNeeded(): boolean {
    const currentStock = this.calculateCurrentStock();
    return currentStock <= this.reorderPoint;
  }

  isLowStock(): boolean {
    const currentStock = this.calculateCurrentStock();
    return currentStock <= this.minimumStock;
  }

  isOverstock(): boolean {
    const currentStock = this.calculateCurrentStock();
    return currentStock >= this.maximumStock;
  }

  calculateTurnoverRate(periodsInYear: number = 12): number {
    // This would need cost of goods sold data
    const avgInventoryValue = this.calculateTotalValue();
    if (avgInventoryValue === 0) return 0;
    
    // Placeholder calculation - would need actual COGS
    const estimatedCOGS = avgInventoryValue * 4; // Assuming 4x turnover
    return estimatedCOGS / avgInventoryValue;
  }

  getLeadTimeVariance(): number {
    // This would calculate based on historical data
    return this.leadTimeDays * 0.1; // 10% variance
  }

  isExpired(): boolean {
    if (!this.expiryDate) return false;
    return new Date() > this.expiryDate;
  }

  isNearExpiry(daysAhead: number = 30): boolean {
    if (!this.expiryDate) return false;
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() + daysAhead);
    return this.expiryDate <= checkDate;
  }

  updateAverageCost(newCost: number, quantity: number): void {
    const currentStock = this.calculateCurrentStock();
    const currentValue = currentStock * this.averageCost;
    const newValue = quantity * newCost;
    const totalQuantity = currentStock + quantity;
    
    if (totalQuantity > 0) {
      this.averageCost = (currentValue + newValue) / totalQuantity;
    }
  }
}

/**
 * Stock Entity
 * Represents physical stock at specific locations
 */
@Entity('stocks')
@Index(['organizationId', 'itemId'])
@Index(['location'])
@Index(['status'])
@Index(['lotNumber'])
export class Stock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  location: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  warehouse: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  zone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  aisle: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  shelf: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bin: string;

  @Column({ 
    type: 'enum', 
    enum: StockStatus,
    default: StockStatus.AVAILABLE
  })
  @IsEnum(StockStatus)
  status: StockStatus;

  // Quantity Information
  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  quantityOnHand: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  quantityReserved: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  quantityAvailable: number; // On hand - Reserved

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  quantityOnOrder: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  quantityAllocated: number;

  // Lot and Serial Tracking
  @Column({ type: 'varchar', length: 100, nullable: true })
  lotNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serialNumber: string;

  @Column({ type: 'date', nullable: true })
  lotExpiryDate: Date;

  @Column({ type: 'date', nullable: true })
  manufacturingDate: Date;

  @Column({ type: 'date', nullable: true })
  receivedDate: Date;

  // Cost Information
  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  unitCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  totalValue: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  costingLot: string; // For FIFO/LIFO tracking

  // Quality Information
  @Column({ type: 'varchar', length: 50, nullable: true })
  qualityStatus: string; // 'passed', 'failed', 'pending', 'quarantine'

  @Column({ type: 'date', nullable: true })
  lastQualityCheck: Date;

  @Column({ type: 'text', nullable: true })
  qualityNotes: string;

  // Physical Properties
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  weight: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  volume: number;

  // Supplier Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  supplierName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  supplierLot: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  purchaseOrderNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  receiptNumber: string;

  // Environmental Conditions
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  storageTemperature: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  storageHumidity: number;

  @Column({ type: 'timestamp', nullable: true })
  lastEnvironmentCheck: Date;

  // Cycle Count
  @Column({ type: 'date', nullable: true })
  lastCycleCount: Date;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  lastCountedQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  countVariance: number;

  // IoT Integration
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  iotMonitored: boolean;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  sensorData: any;

  @Column({ type: 'timestamp', nullable: true })
  lastSensorUpdate: Date;

  // Documentation
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  customFields: any[];

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid' })
  itemId: string;

  @ManyToOne(() => Item, item => item.stocks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId' })
  item: Item;

  @OneToMany(() => InventoryTransaction, transaction => transaction.stock)
  transactions: InventoryTransaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Business Logic Methods
  updateQuantityAvailable(): void {
    this.quantityAvailable = Math.max(0, this.quantityOnHand - this.quantityReserved);
  }

  updateTotalValue(): void {
    this.totalValue = this.quantityOnHand * this.unitCost;
  }

  adjustQuantity(adjustment: number, reason: string): void {
    this.quantityOnHand = Math.max(0, this.quantityOnHand + adjustment);
    this.updateQuantityAvailable();
    this.updateTotalValue();
    this.notes = (this.notes || '') + `\nAdjustment: ${adjustment} - ${reason} - ${new Date().toISOString()}`;
  }

  reserveQuantity(quantity: number): boolean {
    if (this.quantityAvailable >= quantity) {
      this.quantityReserved += quantity;
      this.updateQuantityAvailable();
      return true;
    }
    return false;
  }

  releaseReservation(quantity: number): void {
    this.quantityReserved = Math.max(0, this.quantityReserved - quantity);
    this.updateQuantityAvailable();
  }

  issueStock(quantity: number): boolean {
    if (this.quantityOnHand >= quantity) {
      this.quantityOnHand -= quantity;
      this.quantityReserved = Math.max(0, this.quantityReserved - quantity);
      this.updateQuantityAvailable();
      this.updateTotalValue();
      return true;
    }
    return false;
  }

  receiveStock(quantity: number, unitCost: number): void {
    // Update cost using weighted average
    const currentValue = this.quantityOnHand * this.unitCost;
    const newValue = quantity * unitCost;
    const totalQuantity = this.quantityOnHand + quantity;
    
    if (totalQuantity > 0) {
      this.unitCost = (currentValue + newValue) / totalQuantity;
    }
    
    this.quantityOnHand += quantity;
    this.updateQuantityAvailable();
    this.updateTotalValue();
    this.receivedDate = new Date();
  }

  isExpired(): boolean {
    if (!this.lotExpiryDate) return false;
    return new Date() > this.lotExpiryDate;
  }

  isNearExpiry(daysAhead: number = 30): boolean {
    if (!this.lotExpiryDate) return false;
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() + daysAhead);
    return this.lotExpiryDate <= checkDate;
  }

  calculateAge(): number {
    if (!this.receivedDate) return 0;
    const today = new Date();
    const received = new Date(this.receivedDate);
    const diffTime = today.getTime() - received.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  needsCycleCount(frequencyDays: number = 90): boolean {
    if (!this.lastCycleCount) return true;
    const daysSinceCount = this.calculateDaysSinceLastCount();
    return daysSinceCount >= frequencyDays;
  }

  calculateDaysSinceLastCount(): number {
    if (!this.lastCycleCount) return 999;
    const today = new Date();
    const lastCount = new Date(this.lastCycleCount);
    const diffTime = today.getTime() - lastCount.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  updateSensorData(data: any): void {
    this.sensorData = data;
    this.lastSensorUpdate = new Date();
    
    // Update environmental conditions if available
    if (data.temperature) {
      this.storageTemperature = data.temperature;
    }
    if (data.humidity) {
      this.storageHumidity = data.humidity;
    }
    
    this.lastEnvironmentCheck = new Date();
  }
}

/**
 * Inventory Transaction Entity
 * Records all inventory movements and changes
 */
@Entity('inventory_transactions')
@Index(['organizationId', 'transactionDate'])
@Index(['transactionType', 'status'])
@Index(['itemId'])
@Index(['stockId'])
@Index(['referenceNumber'])
export class InventoryTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  transactionNumber: string;

  @Column({ 
    type: 'enum', 
    enum: TransactionType,
    default: TransactionType.ADJUSTMENT
  })
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @Column({ 
    type: 'enum', 
    enum: TransactionStatus,
    default: TransactionStatus.PENDING
  })
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @Column({ type: 'timestamp' })
  transactionDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referenceType: string; // 'purchase_order', 'sales_order', 'work_order', 'transfer_order'

  // Quantity Information
  @Column({ type: 'decimal', precision: 10, scale: 3 })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  unitCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  totalValue: number;

  // Location Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  fromLocation: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  toLocation: string;

  // Lot and Serial Information
  @Column({ type: 'varchar', length: 100, nullable: true })
  lotNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serialNumber: string;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  // Reason and Documentation
  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  reasonCode: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  attachments: any[];

  // User Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  performedBy: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvalDate: Date;

  // System Information
  @Column({ type: 'varchar', length: 100, nullable: true })
  sourceSystem: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  batchId: string; // For grouping related transactions

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  systemGenerated: boolean;

  // Reversal Information
  @Column({ type: 'uuid', nullable: true })
  originalTransactionId: string;

  @Column({ type: 'uuid', nullable: true })
  reversalTransactionId: string;

  @Column({ type: 'timestamp', nullable: true })
  reversalDate: Date;

  @Column({ type: 'text', nullable: true })
  reversalReason: string;

  // Integration
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  integrationData: any;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  syncedToERP: boolean;

  @Column({ type: 'timestamp', nullable: true })
  erpSyncDate: Date;

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid' })
  itemId: string;

  @ManyToOne(() => Item, item => item.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId' })
  item: Item;

  @Column({ type: 'uuid', nullable: true })
  stockId: string;

  @ManyToOne(() => Stock, stock => stock.transactions, { nullable: true })
  @JoinColumn({ name: 'stockId' })
  stock: Stock;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Lifecycle hooks
  @BeforeInsert()
  generateTransactionNumber() {
    if (!this.transactionNumber) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      this.transactionNumber = `TXN-${timestamp}-${random}`;
    }
  }

  // Business Logic Methods
  calculateTotalValue(): void {
    this.totalValue = Math.abs(this.quantity) * this.unitCost;
  }

  approve(approver: User): void {
    if (this.status === TransactionStatus.PENDING) {
      this.status = TransactionStatus.COMPLETED;
      this.approvedBy = approver.name;
      this.approvalDate = new Date();
    }
  }

  cancel(reason: string): void {
    if (this.status === TransactionStatus.PENDING) {
      this.status = TransactionStatus.CANCELLED;
      this.notes = (this.notes || '') + `\nCancelled: ${reason} - ${new Date().toISOString()}`;
    }
  }

  reverse(reason: string, reversingUser: User): InventoryTransaction {
    if (this.status !== TransactionStatus.COMPLETED) {
      throw new Error('Only completed transactions can be reversed');
    }

    const reversalTransaction = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    reversalTransaction.id = undefined;
    reversalTransaction.transactionNumber = undefined; // Will be auto-generated
    reversalTransaction.quantity = -this.quantity;
    reversalTransaction.transactionDate = new Date();
    reversalTransaction.originalTransactionId = this.id;
    reversalTransaction.reasonCode = 'REVERSAL';
    reversalTransaction.notes = `Reversal of ${this.transactionNumber}: ${reason}`;
    reversalTransaction.performedBy = reversingUser.name;
    reversalTransaction.createdById = reversingUser.id;

    // Update original transaction
    this.status = TransactionStatus.REVERSED;
    this.reversalDate = new Date();
    this.reversalReason = reason;

    return reversalTransaction;
  }

  isReversible(): boolean {
    return this.status === TransactionStatus.COMPLETED && 
           !this.reversalTransactionId;
  }

  getMovementDirection(): 'in' | 'out' | 'transfer' {
    switch (this.transactionType) {
      case TransactionType.RECEIPT:
      case TransactionType.RETURN:
      case TransactionType.PRODUCTION:
        return 'in';
      case TransactionType.ISSUE:
      case TransactionType.CONSUMPTION:
      case TransactionType.SCRAP:
        return 'out';
      case TransactionType.TRANSFER:
        return 'transfer';
      default:
        return this.quantity > 0 ? 'in' : 'out';
    }
  }

  requiresApproval(): boolean {
    // Define business rules for approval requirements
    return Math.abs(this.totalValue) > 1000 || 
           this.transactionType === TransactionType.ADJUSTMENT ||
           this.transactionType === TransactionType.SCRAP;
  }
}

/**
 * Cycle Count Entity
 * Represents physical inventory counts and audits
 */
@Entity('cycle_counts')
@Index(['organizationId', 'status'])
@Index(['countType'])
@Index(['countNumber'], { unique: true })
@Index(['scheduledDate'])
export class CycleCount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  countNumber: string;

  @Column({ 
    type: 'enum', 
    enum: CountType,
    default: CountType.CYCLE_COUNT
  })
  @IsEnum(CountType)
  countType: CountType;

  @Column({ 
    type: 'enum', 
    enum: CountStatus,
    default: CountStatus.PLANNED
  })
  @IsEnum(CountStatus)
  status: CountStatus;

  @Column({ type: 'date' })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  countArea: string; // Specific area being counted

  // Count Details
  @Column({ type: 'int', default: 0 })
  totalItems: number;

  @Column({ type: 'int', default: 0 })
  itemsCounted: number;

  @Column({ type: 'int', default: 0 })
  itemsWithVariance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalVarianceValue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  accuracyPercentage: number;

  // Team Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  countTeam: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  counters: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  supervisor: string;

  // Selection Criteria
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  selectionCriteria: any;

  @Column({ type: 'varchar', length: 100, nullable: true })
  abcClass: string;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  fastMovingItems: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  negativeStockItems: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  highValueItems: boolean;

  // Documentation
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  attachments: any[];

  // System Information
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  systemGenerated: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  countMethod: string; // 'manual', 'barcode', 'rfid', 'voice'

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  blindCount: boolean; // Count without seeing system quantities

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @OneToMany(() => CycleCountItem, item => item.cycleCount, { cascade: true })
  countItems: CycleCountItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Lifecycle hooks
  @BeforeInsert()
  generateCountNumber() {
    if (!this.countNumber) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      this.countNumber = `CC-${timestamp}-${random}`;
    }
  }

  // Business Logic Methods
  start(): void {
    if (this.status === CountStatus.PLANNED) {
      this.status = CountStatus.IN_PROGRESS;
      this.startTime = new Date();
    }
  }

  complete(): void {
    if (this.status === CountStatus.IN_PROGRESS) {
      this.status = CountStatus.COMPLETED;
      this.endTime = new Date();
      this.calculateSummary();
    }
  }

  calculateSummary(): void {
    if (this.countItems) {
      this.totalItems = this.countItems.length;
      this.itemsCounted = this.countItems.filter(item => item.countedQuantity !== null).length;
      this.itemsWithVariance = this.countItems.filter(item => Math.abs(item.variance) > 0.001).length;
      this.totalVarianceValue = this.countItems.reduce((sum, item) => sum + item.varianceValue, 0);
      this.accuracyPercentage = this.totalItems > 0 ? 
        ((this.totalItems - this.itemsWithVariance) / this.totalItems) * 100 : 100;
    }
  }

  approve(): void {
    if (this.status === CountStatus.COMPLETED) {
      this.status = CountStatus.APPROVED;
      // Generate adjustment transactions for variances
      this.generateAdjustments();
    }
  }

  cancel(reason: string): void {
    if (this.status === CountStatus.PLANNED || this.status === CountStatus.IN_PROGRESS) {
      this.status = CountStatus.CANCELLED;
      this.notes = (this.notes || '') + `\nCancelled: ${reason} - ${new Date().toISOString()}`;
    }
  }

  generateAdjustments(): void {
    // This would generate inventory adjustment transactions
    // for items with variances to correct the system quantities
    this.countItems?.forEach(item => {
      if (Math.abs(item.variance) > 0.001) {
        // Generate adjustment transaction
        // This would be implemented in a service layer
      }
    });
  }

  getCompletionPercentage(): number {
    if (this.totalItems === 0) return 100;
    return (this.itemsCounted / this.totalItems) * 100;
  }

  getDuration(): number {
    if (!this.startTime) return 0;
    const endTime = this.endTime || new Date();
    return (endTime.getTime() - this.startTime.getTime()) / (1000 * 60 * 60); // hours
  }
}

/**
 * Cycle Count Item Entity
 * Represents individual items being counted
 */
@Entity('cycle_count_items')
@Index(['cycleCountId'])
@Index(['itemId'])
@Index(['stockId'])
export class CycleCountItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lotNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serialNumber: string;

  // System Information
  @Column({ type: 'decimal', precision: 10, scale: 3 })
  systemQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  systemUnitCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  systemValue: number;

  // Count Information
  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  countedQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  variance: number; // Counted - System

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  varianceValue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  variancePercentage: number;

  // Count Details
  @Column({ type: 'timestamp', nullable: true })
  countedTime: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  countedBy: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  countMethod: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Status
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  counted: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  hasVariance: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  recounted: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  adjustmentCreated: boolean;

  // Recount Information
  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  recountQuantity: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  recountBy: string;

  @Column({ type: 'timestamp', nullable: true })
  recountTime: Date;

  @Column({ type: 'text', nullable: true })
  recountNotes: string;

  // Relationships
  @Column({ type: 'uuid' })
  cycleCountId: string;

  @ManyToOne(() => CycleCount, count => count.countItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cycleCountId' })
  cycleCount: CycleCount;

  @Column({ type: 'uuid' })
  itemId: string;

  @ManyToOne(() => Item, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId' })
  item: Item;

  @Column({ type: 'uuid' })
  stockId: string;

  @ManyToOne(() => Stock, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stockId' })
  stock: Stock;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Business Logic Methods
  updateCount(countedQuantity: number, countedBy: string, method: string = 'manual'): void {
    this.countedQuantity = countedQuantity;
    this.countedBy = countedBy;
    this.countMethod = method;
    this.countedTime = new Date();
    this.counted = true;
    
    this.calculateVariance();
  }

  calculateVariance(): void {
    if (this.countedQuantity !== null) {
      this.variance = this.countedQuantity - this.systemQuantity;
      this.varianceValue = this.variance * this.systemUnitCost;
      this.variancePercentage = this.systemQuantity !== 0 ? 
        (this.variance / this.systemQuantity) * 100 : 0;
      this.hasVariance = Math.abs(this.variance) > 0.001;
    }
  }

  needsRecount(tolerancePercentage: number = 5): boolean {
    return this.hasVariance && 
           Math.abs(this.variancePercentage) > tolerancePercentage && 
           !this.recounted;
  }

  updateRecount(recountQuantity: number, recountBy: string): void {
    this.recountQuantity = recountQuantity;
    this.recountBy = recountBy;
    this.recountTime = new Date();
    this.recounted = true;
    
    // Update counted quantity with recount
    this.countedQuantity = recountQuantity;
    this.calculateVariance();
  }

  isSignificantVariance(thresholdValue: number = 100): boolean {
    return Math.abs(this.varianceValue) > thresholdValue;
  }

  getVarianceCategory(): string {
    const absPercentage = Math.abs(this.variancePercentage);
    if (absPercentage === 0) return 'No Variance';
    if (absPercentage <= 2) return 'Minor Variance';
    if (absPercentage <= 5) return 'Moderate Variance';
    if (absPercentage <= 10) return 'Significant Variance';
    return 'Major Variance';
  }
}

/**
 * Inventory Metrics Entity
 * Stores aggregated inventory KPIs and analytics
 */
@Entity('inventory_metrics')
@Index(['organizationId', 'metricDate'])
@Index(['metricType'])
@Index(['period'])
export class InventoryMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  metricDate: Date;

  @Column({ type: 'varchar', length: 50 })
  metricType: string; // 'turnover', 'accuracy', 'fill_rate', 'carrying_cost'

  @Column({ type: 'varchar', length: 50, default: 'monthly' })
  period: string; // 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  metricValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  targetValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  previousValue: number;

  // Inventory Levels
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  averageInventoryValue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  endingInventoryValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  averageInventoryQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  endingInventoryQuantity: number;

  // Turnover Metrics
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  costOfGoodsSold: number;

  @Column({ type: 'decimal', precision: 8, scale: 4, default: 0 })
  turnoverRate: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  daysOfSupply: number;

  // Accuracy Metrics
  @Column({ type: 'int', default: 0 })
  totalCountedItems: number;

  @Column({ type: 'int', default: 0 })
  accurateItems: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  accuracyPercentage: number;

  // Service Level
  @Column({ type: 'int', default: 0 })
  totalDemandEvents: number;

  @Column({ type: 'int', default: 0 })
  successfulFulfillments: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  fillRate: number;

  @Column({ type: 'int', default: 0 })
  stockoutEvents: number;

  // Cost Metrics
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  carryingCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  orderingCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  stockoutCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  obsolescenceCost: number;

  // Movement Metrics
  @Column({ type: 'int', default: 0 })
  totalTransactions: number;

  @Column({ type: 'int', default: 0 })
  receipts: number;

  @Column({ type: 'int', default: 0 })
  issues: number;

  @Column({ type: 'int', default: 0 })
  adjustments: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  totalMovementQuantity: number;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  additionalMetrics: any;

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Business Logic Methods
  calculateTurnoverRate(): number {
    if (this.averageInventoryValue === 0) return 0;
    this.turnoverRate = this.costOfGoodsSold / this.averageInventoryValue;
    return this.turnoverRate;
  }

  calculateDaysOfSupply(): number {
    if (this.turnoverRate === 0) return 0;
    this.daysOfSupply = 365 / this.turnoverRate;
    return this.daysOfSupply;
  }

  calculateAccuracyPercentage(): number {
    if (this.totalCountedItems === 0) return 100;
    this.accuracyPercentage = (this.accurateItems / this.totalCountedItems) * 100;
    return this.accuracyPercentage;
  }

  calculateFillRate(): number {
    if (this.totalDemandEvents === 0) return 100;
    this.fillRate = (this.successfulFulfillments / this.totalDemandEvents) * 100;
    return this.fillRate;
  }

  calculateTotalCost(): number {
    return this.carryingCost + this.orderingCost + this.stockoutCost + this.obsolescenceCost;
  }

  isTargetMet(): boolean {
    if (!this.targetValue) return false;
    
    // For metrics like accuracy and fill rate, higher is better
    if (this.metricType.includes('accuracy') || this.metricType.includes('fill_rate')) {
      return this.metricValue >= this.targetValue;
    }
    
    // For metrics like carrying cost and days of supply, lower is better
    if (this.metricType.includes('cost') || this.metricType.includes('days')) {
      return this.metricValue <= this.targetValue;
    }
    
    // Default: higher is better
    return this.metricValue >= this.targetValue;
  }

  calculateTrend(): string {
    if (!this.previousValue) return 'neutral';
    
    const change = this.metricValue - this.previousValue;
    const percentChange = Math.abs(change / this.previousValue) * 100;
    
    if (percentChange < 1) return 'stable';
    
    // For metrics where higher is better
    if (this.metricType.includes('accuracy') || 
        this.metricType.includes('fill_rate') || 
        this.metricType.includes('turnover')) {
      return change > 0 ? 'improving' : 'declining';
    }
    
    // For metrics where lower is better
    if (this.metricType.includes('cost') || this.metricType.includes('days')) {
      return change < 0 ? 'improving' : 'declining';
    }
    
    return 'neutral';
  }

  getPerformanceStatus(): string {
    if (this.isTargetMet()) {
      return 'On Target';
    } else {
      const variance = this.targetValue ? 
        Math.abs((this.metricValue - this.targetValue) / this.targetValue) * 100 : 0;
      
      if (variance <= 5) return 'Near Target';
      if (variance <= 15) return 'Below Target';
      return 'Significantly Below Target';
    }
  }
}
