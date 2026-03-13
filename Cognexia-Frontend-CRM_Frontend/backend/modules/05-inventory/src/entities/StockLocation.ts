import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique
} from 'typeorm';
import { InventoryItem } from './InventoryItem';

@Entity('stock_locations')
@Index(['itemId'])
@Index(['locationCode'])
@Index(['quantity'])
@Unique(['itemId', 'locationCode'])
export class StockLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  itemId: string;

  @Column({ type: 'varchar', length: 100 })
  locationCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  locationName?: string;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  reservedQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  availableQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0, nullable: true })
  minQuantity?: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0, nullable: true })
  maxQuantity?: number;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  zone?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  aisle?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  shelf?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bin?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'json', nullable: true })
  coordinates?: {
    x?: number;
    y?: number;
    z?: number;
  };

  @Column({ type: 'varchar', length: 100, nullable: true })
  warehouseCode?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  warehouseName?: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  temperatureMin?: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  temperatureMax?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  humidityMin?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  humidityMax?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  createdBy?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  updatedBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastUpdated: Date;

  // Relationships
  @ManyToOne(() => InventoryItem, item => item.stockLocations, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'itemId' })
  item: InventoryItem;

  // Business Logic Methods
  updateAvailableQuantity(): void {
    this.availableQuantity = Math.max(0, this.quantity - this.reservedQuantity);
  }

  // Helper Methods
  hasStock(): boolean {
    return this.quantity > 0;
  }

  hasAvailableStock(): boolean {
    return this.availableQuantity > 0;
  }

  canFulfill(requestedQuantity: number): boolean {
    return this.availableQuantity >= requestedQuantity;
  }

  isAtMinLevel(): boolean {
    if (!this.minQuantity) return false;
    return this.quantity <= this.minQuantity;
  }

  isAtMaxLevel(): boolean {
    if (!this.maxQuantity) return false;
    return this.quantity >= this.maxQuantity;
  }

  getUtilizationPercentage(): number {
    if (!this.maxQuantity || this.maxQuantity === 0) return 0;
    return (this.quantity / this.maxQuantity) * 100;
  }

  getFullLocationCode(): string {
    const parts = [this.locationCode];
    
    if (this.zone) parts.push(this.zone);
    if (this.aisle) parts.push(this.aisle);
    if (this.shelf) parts.push(this.shelf);
    if (this.bin) parts.push(this.bin);
    
    return parts.join('-');
  }

  getLocationHierarchy(): string {
    const hierarchy = [];
    
    if (this.warehouseName) hierarchy.push(this.warehouseName);
    if (this.locationName) hierarchy.push(this.locationName);
    if (this.zone) hierarchy.push(`Zone: ${this.zone}`);
    if (this.aisle) hierarchy.push(`Aisle: ${this.aisle}`);
    if (this.shelf) hierarchy.push(`Shelf: ${this.shelf}`);
    if (this.bin) hierarchy.push(`Bin: ${this.bin}`);
    
    return hierarchy.join(' > ');
  }

  hasEnvironmentalControls(): boolean {
    return !!(this.temperatureMin || this.temperatureMax || this.humidityMin || this.humidityMax);
  }

  isEnvironmentSuitable(temperature?: number, humidity?: number): boolean {
    if (temperature !== undefined) {
      if (this.temperatureMin && temperature < this.temperatureMin) return false;
      if (this.temperatureMax && temperature > this.temperatureMax) return false;
    }
    
    if (humidity !== undefined) {
      if (this.humidityMin && humidity < this.humidityMin) return false;
      if (this.humidityMax && humidity > this.humidityMax) return false;
    }
    
    return true;
  }

  reserve(quantity: number): boolean {
    if (quantity > this.availableQuantity) return false;
    
    this.reservedQuantity += quantity;
    this.updateAvailableQuantity();
    return true;
  }

  unreserve(quantity: number): boolean {
    if (quantity > this.reservedQuantity) return false;
    
    this.reservedQuantity -= quantity;
    this.updateAvailableQuantity();
    return true;
  }

  adjustStock(quantity: number): void {
    this.quantity = Math.max(0, this.quantity + quantity);
    this.updateAvailableQuantity();
  }

  getStockStatus(): 'EMPTY' | 'LOW' | 'NORMAL' | 'HIGH' | 'FULL' {
    if (this.quantity === 0) return 'EMPTY';
    
    if (this.maxQuantity) {
      const utilization = this.getUtilizationPercentage();
      if (utilization >= 100) return 'FULL';
      if (utilization >= 80) return 'HIGH';
      if (utilization >= 20) return 'NORMAL';
    }
    
    if (this.isAtMinLevel()) return 'LOW';
    
    return 'NORMAL';
  }

  toJSON() {
    return {
      id: this.id,
      itemId: this.itemId,
      locationCode: this.locationCode,
      locationName: this.locationName,
      quantity: this.quantity,
      reservedQuantity: this.reservedQuantity,
      availableQuantity: this.availableQuantity,
      minQuantity: this.minQuantity,
      maxQuantity: this.maxQuantity,
      isDefault: this.isDefault,
      isActive: this.isActive,
      zone: this.zone,
      aisle: this.aisle,
      shelf: this.shelf,
      bin: this.bin,
      notes: this.notes,
      coordinates: this.coordinates,
      warehouseCode: this.warehouseCode,
      warehouseName: this.warehouseName,
      temperatureRange: this.temperatureMin || this.temperatureMax ? {
        min: this.temperatureMin,
        max: this.temperatureMax
      } : null,
      humidityRange: this.humidityMin || this.humidityMax ? {
        min: this.humidityMin,
        max: this.humidityMax
      } : null,
      fullLocationCode: this.getFullLocationCode(),
      locationHierarchy: this.getLocationHierarchy(),
      utilizationPercentage: this.getUtilizationPercentage(),
      stockStatus: this.getStockStatus(),
      hasStock: this.hasStock(),
      hasAvailableStock: this.hasAvailableStock(),
      hasEnvironmentalControls: this.hasEnvironmentalControls(),
      createdAt: this.createdAt,
      lastUpdated: this.lastUpdated
    };
  }
}
