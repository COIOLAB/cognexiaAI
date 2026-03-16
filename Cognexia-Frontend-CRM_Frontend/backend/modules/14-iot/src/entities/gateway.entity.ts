import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import { IoTDevice, ConnectivityType, SecurityLevel } from './iot-device.entity';

export enum GatewayType {
  EDGE_GATEWAY = 'edge_gateway',
  INDUSTRIAL_GATEWAY = 'industrial_gateway',
  CELLULAR_GATEWAY = 'cellular_gateway',
  WIFI_GATEWAY = 'wifi_gateway',
  SATELLITE_GATEWAY = 'satellite_gateway',
  MESH_GATEWAY = 'mesh_gateway',
  QUANTUM_GATEWAY = 'quantum_gateway',
  AI_GATEWAY = 'ai_gateway',
  BLOCKCHAIN_GATEWAY = 'blockchain_gateway'
}

export enum GatewayStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
  OVERLOADED = 'overloaded',
  DEGRADED = 'degraded',
  UPDATING = 'updating'
}

export interface EdgeComputingCapabilities {
  hasAIProcessing: boolean;
  hasMLInference: boolean;
  hasDataPreprocessing: boolean;
  hasRealTimeAnalytics: boolean;
  hasLocalStorage: boolean;
  hasComputeOffloading: boolean;
  maxConcurrentTasks: number;
  processingPower: number; // FLOPS
  storageCapacity: number; // GB
  memoryCapacity: number; // GB
}

export interface SecurityFeatures {
  encryptionSupported: string[]; // Supported encryption algorithms
  authenticationMethods: string[]; // Supported auth methods
  hasFirewall: boolean;
  hasIntrusionDetection: boolean;
  hasVPN: boolean;
  hasSecureBootLoader: boolean;
  hasTrustedPlatformModule: boolean;
  hasQuantumSafeEncryption: boolean;
  certificateAuthority?: string;
}

export interface NetworkConfiguration {
  maxDevices: number;
  supportedProtocols: string[]; // MQTT, CoAP, LoRaWAN, etc.
  dataRateLimit: number; // Mbps
  latencyOptimized: boolean;
  qosLevels: string[];
  loadBalancingEnabled: boolean;
  networkTopology: 'star' | 'mesh' | 'tree' | 'hybrid';
}

export interface PerformanceMetrics {
  dataProcessedToday: number; // MB
  messagesProcessedToday: number;
  averageLatency: number; // milliseconds
  throughput: number; // messages per second
  errorRate: number; // percentage
  uptime: number; // percentage over last 24h
  cpuUsage: number; // percentage
  memoryUsage: number; // percentage
  storageUsage: number; // percentage
  networkUsage: number; // percentage
}

@Entity('gateways')
@Index(['type', 'status'])
@Index(['location', 'status'])
@Index(['isActive'])
export class Gateway {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  @Index()
  name: string;

  @Column({
    type: 'enum',
    enum: GatewayType,
    default: GatewayType.EDGE_GATEWAY
  })
  @Index()
  type: GatewayType;

  @Column({
    type: 'enum',
    enum: GatewayStatus,
    default: GatewayStatus.OFFLINE
  })
  @Index()
  status: GatewayStatus;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column({ length: 255, nullable: true })
  @Index()
  location?: string;

  @Column({ length: 255, nullable: true })
  facility?: string;

  @Column({ length: 255, nullable: true })
  department?: string;

  // Network Information
  @Column({ length: 45, nullable: true })
  ipAddress?: string;

  @Column({ length: 17, unique: true })
  macAddress: string;

  @Column({ nullable: true })
  hostname?: string;

  @Column({ type: 'int', nullable: true })
  port?: number;

  @Column({
    type: 'enum',
    enum: ConnectivityType,
    array: true,
    default: [ConnectivityType.WIFI, ConnectivityType.ETHERNET]
  })
  supportedConnectivity: ConnectivityType[];

  // Device Information
  @Column({ nullable: true })
  firmwareVersion?: string;

  @Column({ nullable: true })
  hardwareRevision?: string;

  @Column({ nullable: true })
  serialNumber?: string;

  @Column({ nullable: true })
  manufacturerName?: string;

  @Column({ nullable: true })
  modelNumber?: string;

  @Column({
    type: 'enum',
    enum: SecurityLevel,
    default: SecurityLevel.HIGH
  })
  securityLevel: SecurityLevel;

  // Industry 5.0 Advanced Features
  @Column({ type: 'jsonb' })
  edgeCapabilities: EdgeComputingCapabilities;

  @Column({ type: 'jsonb' })
  securityFeatures: SecurityFeatures;

  @Column({ type: 'jsonb' })
  networkConfig: NetworkConfiguration;

  @Column({ type: 'jsonb', nullable: true })
  performanceMetrics?: PerformanceMetrics;

  // Operational Data
  @Column({ type: 'timestamp', nullable: true })
  lastSeen?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastHealthCheck?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastMaintenanceDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextMaintenanceDate?: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  cpuUsage?: number; // Percentage

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  memoryUsage?: number; // Percentage

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  storageUsage?: number; // Percentage

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  networkUsage?: number; // Percentage

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperature?: number; // Celsius

  @Column({ type: 'int', default: 0 })
  connectedDevicesCount: number;

  @Column({ type: 'int', default: 0 })
  totalDataProcessed: number; // MB

  @Column({ type: 'int', default: 0 })
  totalMessagesProcessed: number;

  @Column({ type: 'int', default: 0 })
  errorCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  averageLatency: number; // milliseconds

  // Location and Environment
  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude?: number;

  @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true })
  altitude?: number;

  // Configuration and Metadata
  @Column({ type: 'jsonb', nullable: true })
  configuration?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];

  // Flags
  @Column({ default: true })
  @Index()
  isActive: boolean;

  @Column({ default: false })
  isRedundant: boolean; // Has backup gateway

  @Column({ default: false })
  isLoadBalancer: boolean;

  @Column({ default: false })
  hasAICapabilities: boolean;

  @Column({ default: false })
  hasQuantumCapabilities: boolean;

  @Column({ default: false })
  hasBlockchainCapabilities: boolean;

  @Column({ default: false })
  supportsEdgeComputing: boolean;

  @Column({ default: false })
  isSimulated: boolean;

  // Relationships
  @OneToMany(() => IoTDevice, device => device.gateway)
  devices: IoTDevice[];

  // Backup/Redundancy
  @Column({ nullable: true })
  primaryGatewayId?: string; // If this is a backup gateway

  @Column({ type: 'text', array: true, nullable: true })
  backupGatewayIds?: string[]; // Backup gateways for this one

  // Audit fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true })
  updatedBy?: string;

  // Lifecycle methods
  @BeforeInsert()
  @BeforeUpdate()
  updateTimestamps() {
    if (this.status === GatewayStatus.ONLINE) {
      this.lastSeen = new Date();
    }
    this.lastHealthCheck = new Date();
  }

  // Helper methods
  isOnline(): boolean {
    return this.status === GatewayStatus.ONLINE;
  }

  isHealthy(): boolean {
    return [GatewayStatus.ONLINE, GatewayStatus.UPDATING].includes(this.status);
  }

  needsMaintenance(): boolean {
    if (!this.nextMaintenanceDate) return false;
    return new Date() >= this.nextMaintenanceDate;
  }

  isOverloaded(): boolean {
    return this.status === GatewayStatus.OVERLOADED ||
           (this.cpuUsage && this.cpuUsage > 90) ||
           (this.memoryUsage && this.memoryUsage > 90) ||
           (this.connectedDevicesCount >= this.networkConfig.maxDevices);
  }

  hasHighLatency(): boolean {
    return this.averageLatency > 1000; // > 1 second
  }

  hasHighErrorRate(): boolean {
    if (!this.performanceMetrics) return false;
    return this.performanceMetrics.errorRate > 5; // > 5%
  }

  canAcceptNewDevice(): boolean {
    return this.isOnline() && 
           !this.isOverloaded() &&
           this.connectedDevicesCount < this.networkConfig.maxDevices;
  }

  getCapacityUtilization(): number {
    return (this.connectedDevicesCount / this.networkConfig.maxDevices) * 100;
  }

  getGatewayHealth(): {
    overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    factors: Record<string, any>;
  } {
    const factors = {
      connectivity: this.isOnline(),
      cpu: this.cpuUsage || 0,
      memory: this.memoryUsage || 0,
      storage: this.storageUsage || 0,
      capacity: this.getCapacityUtilization(),
      latency: this.averageLatency,
      errorRate: this.performanceMetrics?.errorRate || 0,
      uptime: this.performanceMetrics?.uptime || 0,
      temperature: this.temperature || 25,
      maintenance: !this.needsMaintenance()
    };

    let healthScore = 0;
    
    // Connectivity (20 points)
    if (factors.connectivity) healthScore += 20;
    
    // Resource usage (30 points total)
    if (factors.cpu < 70) healthScore += 10;
    else if (factors.cpu < 85) healthScore += 5;
    
    if (factors.memory < 70) healthScore += 10;
    else if (factors.memory < 85) healthScore += 5;
    
    if (factors.storage < 80) healthScore += 10;
    else if (factors.storage < 90) healthScore += 5;
    
    // Performance (25 points total)
    if (factors.capacity < 80) healthScore += 10;
    else if (factors.capacity < 90) healthScore += 5;
    
    if (factors.latency < 500) healthScore += 10;
    else if (factors.latency < 1000) healthScore += 5;
    
    if (factors.errorRate < 1) healthScore += 5;
    
    // Uptime and maintenance (25 points total)
    if (factors.uptime > 99) healthScore += 15;
    else if (factors.uptime > 95) healthScore += 10;
    else if (factors.uptime > 90) healthScore += 5;
    
    if (factors.maintenance) healthScore += 10;

    let overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    if (healthScore >= 90) overall = 'excellent';
    else if (healthScore >= 75) overall = 'good';
    else if (healthScore >= 60) overall = 'fair';
    else if (healthScore >= 40) overall = 'poor';
    else overall = 'critical';

    return { overall, factors };
  }

  updatePerformanceMetrics(metrics: Partial<PerformanceMetrics>): void {
    this.performanceMetrics = {
      ...this.performanceMetrics,
      ...metrics
    } as PerformanceMetrics;
  }

  addDevice(): void {
    this.connectedDevicesCount++;
  }

  removeDevice(): void {
    if (this.connectedDevicesCount > 0) {
      this.connectedDevicesCount--;
    }
  }

  updateLastSeen(): void {
    this.lastSeen = new Date();
    if (this.status === GatewayStatus.OFFLINE) {
      this.status = GatewayStatus.ONLINE;
    }
  }

  processMessage(): void {
    this.totalMessagesProcessed++;
  }

  processData(sizeInMB: number): void {
    this.totalDataProcessed += sizeInMB;
  }

  recordError(): void {
    this.errorCount++;
  }

  updateResourceUsage(cpu: number, memory: number, storage: number, network: number): void {
    this.cpuUsage = cpu;
    this.memoryUsage = memory;
    this.storageUsage = storage;
    this.networkUsage = network;

    // Check for overload condition
    if (cpu > 95 || memory > 95 || this.connectedDevicesCount >= this.networkConfig.maxDevices) {
      this.status = GatewayStatus.OVERLOADED;
    } else if (this.status === GatewayStatus.OVERLOADED && cpu < 80 && memory < 80) {
      this.status = GatewayStatus.ONLINE;
    }
  }

  getNetworkProtocols(): string[] {
    return this.networkConfig.supportedProtocols || [];
  }

  supportsProtocol(protocol: string): boolean {
    return this.getNetworkProtocols().includes(protocol);
  }

  hasEdgeAI(): boolean {
    return this.hasAICapabilities && this.edgeCapabilities?.hasAIProcessing;
  }

  hasQuantumSecurity(): boolean {
    return this.hasQuantumCapabilities && this.securityFeatures?.hasQuantumSafeEncryption;
  }

  canProcessAtEdge(): boolean {
    return this.supportsEdgeComputing && this.edgeCapabilities?.hasDataPreprocessing;
  }

  serialize(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      location: this.location,
      connectedDevices: this.connectedDevicesCount,
      maxDevices: this.networkConfig?.maxDevices,
      cpuUsage: this.cpuUsage,
      memoryUsage: this.memoryUsage,
      averageLatency: this.averageLatency,
      isActive: this.isActive,
      lastSeen: this.lastSeen,
      health: this.getGatewayHealth()
    };
  }
}
