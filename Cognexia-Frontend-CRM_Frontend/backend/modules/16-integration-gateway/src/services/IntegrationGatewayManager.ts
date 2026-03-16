import { EventEmitter } from 'events';
import { logger } from '../../../utils/logger';
import { IntegrationGatewayService, IntegrationSystem, SystemType, ConnectionStatus, DataMapping, TransformationRule, DataFormat } from './IntegrationGatewayService';
import { OPCUAProtocolAdapter, OPCUAConnectionConfig } from '../protocols/OPCUAProtocolAdapter';
import { ModbusProtocolAdapter, ModbusConnectionConfig } from '../protocols/ModbusProtocolAdapter';
import { MQTTProtocolAdapter, MQTTConnectionConfig } from '../protocols/MQTTProtocolAdapter';

export interface IntegrationConfig {
  systems: IntegrationSystemConfig[];
  globalSettings: {
    dataRetentionDays: number;
    maxConcurrentConnections: number;
    defaultTimeout: number;
    enableMetrics: boolean;
    enableTracing: boolean;
    logLevel: string;
  };
  dataMappings: DataMapping[];
  transformationRules: TransformationRule[];
  securitySettings: {
    enableEncryption: boolean;
    certificatePath?: string;
    keyPath?: string;
    trustedCertificates: string[];
    allowedIPRanges: string[];
  };
}

export interface IntegrationSystemConfig {
  id: string;
  name: string;
  type: SystemType;
  protocol: 'OPC-UA' | 'MODBUS' | 'MQTT' | 'HTTP' | 'ETHERNET-IP';
  config: any; // Protocol-specific configuration
  enabled: boolean;
  priority: number;
  healthCheckInterval: number;
  autoReconnect: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface SystemMetrics {
  systemId: string;
  connectionStatus: ConnectionStatus;
  messagesProcessed: number;
  errorsCount: number;
  lastActivity: Date | null;
  uptime: number;
  throughput: number; // messages per second
  latency: number; // average response time in ms
  memoryUsage: number; // in MB
  customMetrics: Record<string, any>;
}

export interface IntegrationEvent {
  eventId: string;
  timestamp: Date;
  systemId: string;
  eventType: 'connection' | 'data' | 'error' | 'system' | 'security';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  data?: any;
  source: string;
  userId?: string;
}

export interface DataFlowRule {
  id: string;
  name: string;
  sourceSystemId: string;
  targetSystemId: string;
  dataMapping: DataMapping;
  enabled: boolean;
  priority: number;
  conditions: DataFlowCondition[];
  transformations: TransformationRule[];
  throttling?: {
    maxMessagesPerSecond: number;
    burstSize: number;
  };
  retry?: {
    maxAttempts: number;
    backoffMultiplier: number;
    maxDelay: number;
  };
}

export interface DataFlowCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'regex';
  value: any;
  type: 'number' | 'string' | 'boolean' | 'date';
}

export enum IntegrationStatus {
  STOPPED = 'stopped',
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  ERROR = 'error',
  MAINTENANCE = 'maintenance'
}

export class IntegrationGatewayManager extends EventEmitter {
  private gatewayService: IntegrationGatewayService;
  private adapters: Map<string, any> = new Map(); // Protocol adapters
  private systems: Map<string, IntegrationSystemConfig> = new Map();
  private dataFlowRules: Map<string, DataFlowRule> = new Map();
  private metrics: Map<string, SystemMetrics> = new Map();
  private events: IntegrationEvent[] = [];
  private status: IntegrationStatus = IntegrationStatus.STOPPED;
  private config?: IntegrationConfig;
  private metricsTimer?: NodeJS.Timeout;
  private healthCheckTimer?: NodeJS.Timeout;
  private startTime?: Date;
  private eventHistory: IntegrationEvent[] = [];
  private maxEventHistory: number = 10000;

  constructor() {
    super();
    this.gatewayService = new IntegrationGatewayService();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Gateway service events
    this.gatewayService.on('system_connected', (systemId: string) => {
      this.handleSystemConnected(systemId);
    });

    this.gatewayService.on('system_disconnected', (systemId: string) => {
      this.handleSystemDisconnected(systemId);
    });

    this.gatewayService.on('data_received', (data: any) => {
      this.handleDataReceived(data);
    });

    this.gatewayService.on('error', (error: any) => {
      this.handleError(error);
    });

    // Status changes
    this.on('status_changed', (oldStatus: IntegrationStatus, newStatus: IntegrationStatus) => {
      this.logEvent({
        eventType: 'system',
        severity: 'info',
        message: `Integration status changed from ${oldStatus} to ${newStatus}`,
        source: 'IntegrationGatewayManager'
      });
    });
  }

  public async initialize(config: IntegrationConfig): Promise<void> {
    try {
      logger.info('Initializing Integration Gateway Manager...');
      this.setStatus(IntegrationStatus.STARTING);

      this.config = config;
      
      // Initialize systems
      for (const systemConfig of config.systems) {
        await this.addSystem(systemConfig);
      }

      // Initialize data flow rules
      this.initializeDataFlowRules();

      // Start monitoring
      this.startMonitoring();

      this.setStatus(IntegrationStatus.RUNNING);
      this.startTime = new Date();

      logger.info(`Integration Gateway Manager initialized with ${config.systems.length} systems`);

    } catch (error) {
      this.setStatus(IntegrationStatus.ERROR);
      logger.error('Failed to initialize Integration Gateway Manager:', error);
      throw error;
    }
  }

  public async start(): Promise<void> {
    try {
      if (this.status !== IntegrationStatus.STOPPED && this.status !== IntegrationStatus.ERROR) {
        throw new Error(`Cannot start integration gateway in status: ${this.status}`);
      }

      logger.info('Starting Integration Gateway...');
      this.setStatus(IntegrationStatus.STARTING);

      // Start enabled systems
      const enabledSystems = Array.from(this.systems.values()).filter(s => s.enabled);
      
      for (const system of enabledSystems) {
        try {
          await this.startSystem(system.id);
        } catch (error) {
          logger.error(`Failed to start system ${system.id}:`, error);
          // Continue starting other systems
        }
      }

      // Start data flow processing
      this.startDataFlowProcessing();

      this.setStatus(IntegrationStatus.RUNNING);
      this.startTime = new Date();

      logger.info(`Integration Gateway started with ${enabledSystems.length} active systems`);

    } catch (error) {
      this.setStatus(IntegrationStatus.ERROR);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    try {
      logger.info('Stopping Integration Gateway...');
      this.setStatus(IntegrationStatus.STOPPING);

      // Stop monitoring
      this.stopMonitoring();

      // Stop all systems
      for (const systemId of this.systems.keys()) {
        try {
          await this.stopSystem(systemId);
        } catch (error) {
          logger.error(`Error stopping system ${systemId}:`, error);
        }
      }

      this.setStatus(IntegrationStatus.STOPPED);
      logger.info('Integration Gateway stopped');

    } catch (error) {
      this.setStatus(IntegrationStatus.ERROR);
      throw error;
    }
  }

  public async addSystem(config: IntegrationSystemConfig): Promise<void> {
    try {
      logger.info(`Adding system: ${config.name} (${config.type})`);

      // Create protocol adapter
      const adapter = await this.createProtocolAdapter(config);
      
      // Store system and adapter
      this.systems.set(config.id, config);
      this.adapters.set(config.id, adapter);

      // Initialize metrics
      this.metrics.set(config.id, {
        systemId: config.id,
        connectionStatus: ConnectionStatus.DISCONNECTED,
        messagesProcessed: 0,
        errorsCount: 0,
        lastActivity: null,
        uptime: 0,
        throughput: 0,
        latency: 0,
        memoryUsage: 0,
        customMetrics: {}
      });

      // Set up adapter event handlers
      this.setupAdapterEventHandlers(config.id, adapter);

      // Register with gateway service
      const integrationSystem: IntegrationSystem = {
        id: config.id,
        name: config.name,
        type: config.type,
        connectionConfig: config.config,
        dataMapping: [],
        transformationRules: [],
        enabled: config.enabled,
        healthCheckInterval: config.healthCheckInterval,
        capabilities: {
          supportsRealtimeData: true,
          supportsHistoricalData: true,
          supportsBidirectionalComm: true,
          supportsEvents: true,
          supportsAlarms: true,
          maxConnections: 10,
          supportedDataTypes: [DataFormat.JSON, DataFormat.XML, DataFormat.BINARY],
          securityFeatures: ['TLS', 'Authentication'],
          customCapabilities: {}
        },
        status: {
          connected: false,
          lastHeartbeat: new Date(),
          connectionQuality: 0,
          errors: [],
          performance: {
            responseTime: 0,
            throughput: 0,
            availability: 0
          }
        },
        metadata: config.metadata || {}
      };

      await this.gatewayService.connectSystem(integrationSystem);

      this.logEvent({
        eventType: 'system',
        severity: 'info',
        message: `System ${config.name} added successfully`,
        source: 'IntegrationGatewayManager',
        data: { systemId: config.id }
      });

    } catch (error) {
      logger.error(`Failed to add system ${config.name}:`, error);
      throw error;
    }
  }

  public async removeSystem(systemId: string): Promise<void> {
    try {
      const system = this.systems.get(systemId);
      if (!system) {
        throw new Error(`System ${systemId} not found`);
      }

      logger.info(`Removing system: ${system.name}`);

      // Stop system if running
      await this.stopSystem(systemId);

      // Disconnect from gateway service
      await this.gatewayService.disconnectSystem(systemId);

      // Remove from collections
      this.systems.delete(systemId);
      this.adapters.delete(systemId);
      this.metrics.delete(systemId);

      this.logEvent({
        eventType: 'system',
        severity: 'info',
        message: `System ${system.name} removed`,
        source: 'IntegrationGatewayManager',
        data: { systemId }
      });

    } catch (error) {
      logger.error(`Failed to remove system ${systemId}:`, error);
      throw error;
    }
  }

  public async startSystem(systemId: string): Promise<void> {
    try {
      const system = this.systems.get(systemId);
      const adapter = this.adapters.get(systemId);

      if (!system || !adapter) {
        throw new Error(`System ${systemId} not found`);
      }

      logger.info(`Starting system: ${system.name}`);

      // Connect adapter
      await adapter.connect();

      // Update metrics
      const metrics = this.metrics.get(systemId);
      if (metrics) {
        metrics.connectionStatus = ConnectionStatus.CONNECTED;
      }

      this.logEvent({
        eventType: 'connection',
        severity: 'info',
        message: `System ${system.name} started successfully`,
        source: 'IntegrationGatewayManager',
        data: { systemId }
      });

    } catch (error) {
      logger.error(`Failed to start system ${systemId}:`, error);
      
      // Update metrics
      const metrics = this.metrics.get(systemId);
      if (metrics) {
        metrics.connectionStatus = ConnectionStatus.ERROR;
        metrics.errorsCount++;
      }

      throw error;
    }
  }

  public async stopSystem(systemId: string): Promise<void> {
    try {
      const system = this.systems.get(systemId);
      const adapter = this.adapters.get(systemId);

      if (!system || !adapter) {
        throw new Error(`System ${systemId} not found`);
      }

      logger.info(`Stopping system: ${system.name}`);

      // Disconnect adapter
      await adapter.disconnect();

      // Update metrics
      const metrics = this.metrics.get(systemId);
      if (metrics) {
        metrics.connectionStatus = ConnectionStatus.DISCONNECTED;
      }

      this.logEvent({
        eventType: 'connection',
        severity: 'info',
        message: `System ${system.name} stopped`,
        source: 'IntegrationGatewayManager',
        data: { systemId }
      });

    } catch (error) {
      logger.error(`Failed to stop system ${systemId}:`, error);
      throw error;
    }
  }

  public addDataFlowRule(rule: DataFlowRule): void {
    this.dataFlowRules.set(rule.id, rule);
    
    logger.info(`Added data flow rule: ${rule.name}`);
    
    this.logEvent({
      eventType: 'system',
      severity: 'info',
      message: `Data flow rule ${rule.name} added`,
      source: 'IntegrationGatewayManager',
      data: { ruleId: rule.id }
    });
  }

  public removeDataFlowRule(ruleId: string): void {
    const rule = this.dataFlowRules.get(ruleId);
    if (rule) {
      this.dataFlowRules.delete(ruleId);
      
      logger.info(`Removed data flow rule: ${rule.name}`);
      
      this.logEvent({
        eventType: 'system',
        severity: 'info',
        message: `Data flow rule ${rule.name} removed`,
        source: 'IntegrationGatewayManager',
        data: { ruleId }
      });
    }
  }

  public getSystemStatus(systemId: string): SystemMetrics | undefined {
    return this.metrics.get(systemId);
  }

  public getAllSystemStatus(): SystemMetrics[] {
    return Array.from(this.metrics.values());
  }

  public getOverallStatus(): {
    status: IntegrationStatus;
    uptime: number;
    totalSystems: number;
    connectedSystems: number;
    totalMessages: number;
    totalErrors: number;
    averageLatency: number;
    memoryUsage: number;
  } {
    const connectedSystems = Array.from(this.metrics.values())
      .filter(m => m.connectionStatus === ConnectionStatus.CONNECTED).length;
    
    const totalMessages = Array.from(this.metrics.values())
      .reduce((sum, m) => sum + m.messagesProcessed, 0);
    
    const totalErrors = Array.from(this.metrics.values())
      .reduce((sum, m) => sum + m.errorsCount, 0);
    
    const averageLatency = Array.from(this.metrics.values())
      .reduce((sum, m) => sum + m.latency, 0) / this.metrics.size;

    const uptime = this.startTime ? Date.now() - this.startTime.getTime() : 0;

    return {
      status: this.status,
      uptime,
      totalSystems: this.systems.size,
      connectedSystems,
      totalMessages,
      totalErrors,
      averageLatency: averageLatency || 0,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024 // MB
    };
  }

  public getRecentEvents(limit: number = 100): IntegrationEvent[] {
    return this.eventHistory.slice(-limit);
  }

  public getEventsBySystem(systemId: string, limit: number = 100): IntegrationEvent[] {
    return this.eventHistory
      .filter(e => e.systemId === systemId)
      .slice(-limit);
  }

  public async performHealthCheck(): Promise<{
    overall: boolean;
    systems: { [systemId: string]: { healthy: boolean; message?: string; details?: any } }
  }> {
    const results: { [systemId: string]: any } = {};
    let overallHealthy = true;

    for (const [systemId, adapter] of this.adapters) {
      try {
        const health = await adapter.healthCheck();
        results[systemId] = health;
        
        if (!health.healthy) {
          overallHealthy = false;
        }
      } catch (error) {
        results[systemId] = {
          healthy: false,
          message: 'Health check failed',
          details: { error: error.message }
        };
        overallHealthy = false;
      }
    }

    return {
      overall: overallHealthy,
      systems: results
    };
  }

  private async createProtocolAdapter(config: IntegrationSystemConfig): Promise<any> {
    switch (config.protocol) {
      case 'OPC-UA':
        return new OPCUAProtocolAdapter(config.config as OPCUAConnectionConfig);
      
      case 'MODBUS':
        return new ModbusProtocolAdapter(config.config as ModbusConnectionConfig);
      
      case 'MQTT':
        return new MQTTProtocolAdapter(config.config as MQTTConnectionConfig);
      
      default:
        throw new Error(`Unsupported protocol: ${config.protocol}`);
    }
  }

  private setupAdapterEventHandlers(systemId: string, adapter: any): void {
    adapter.on('connected', () => {
      this.handleSystemConnected(systemId);
    });

    adapter.on('disconnected', () => {
      this.handleSystemDisconnected(systemId);
    });

    adapter.on('data_received', (data: any) => {
      this.handleDataReceived({ systemId, data });
    });

    adapter.on('error', (error: any) => {
      this.handleError({ systemId, error });
    });
  }

  private handleSystemConnected(systemId: string): void {
    const metrics = this.metrics.get(systemId);
    if (metrics) {
      metrics.connectionStatus = ConnectionStatus.CONNECTED;
    }

    const system = this.systems.get(systemId);
    this.logEvent({
      eventType: 'connection',
      severity: 'info',
      message: `System ${system?.name || systemId} connected`,
      source: 'IntegrationGatewayManager',
      systemId
    });
  }

  private handleSystemDisconnected(systemId: string): void {
    const metrics = this.metrics.get(systemId);
    if (metrics) {
      metrics.connectionStatus = ConnectionStatus.DISCONNECTED;
    }

    const system = this.systems.get(systemId);
    this.logEvent({
      eventType: 'connection',
      severity: 'warning',
      message: `System ${system?.name || systemId} disconnected`,
      source: 'IntegrationGatewayManager',
      systemId
    });
  }

  private handleDataReceived(data: any): void {
    const { systemId } = data;
    
    // Update metrics
    const metrics = this.metrics.get(systemId);
    if (metrics) {
      metrics.messagesProcessed++;
      metrics.lastActivity = new Date();
    }

    // Process data flow rules
    this.processDataFlowRules(data);
  }

  private handleError(errorData: any): void {
    const { systemId, error } = errorData;
    
    // Update metrics
    const metrics = this.metrics.get(systemId);
    if (metrics) {
      metrics.errorsCount++;
    }

    const system = this.systems.get(systemId);
    this.logEvent({
      eventType: 'error',
      severity: 'error',
      message: `Error in system ${system?.name || systemId}: ${error.message}`,
      source: 'IntegrationGatewayManager',
      systemId,
      data: { error: error.message }
    });
  }

  private setStatus(newStatus: IntegrationStatus): void {
    const oldStatus = this.status;
    this.status = newStatus;
    this.emit('status_changed', oldStatus, newStatus);
  }

  private logEvent(eventData: Omit<IntegrationEvent, 'eventId' | 'timestamp'>): void {
    const event: IntegrationEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      systemId: eventData.systemId || 'system',
      ...eventData
    };

    this.eventHistory.push(event);
    
    // Trim history if too large
    if (this.eventHistory.length > this.maxEventHistory) {
      this.eventHistory = this.eventHistory.slice(-this.maxEventHistory);
    }

    this.emit('event', event);
    
    // Log to console based on severity
    switch (event.severity) {
      case 'critical':
      case 'error':
        logger.error(event.message, event);
        break;
      case 'warning':
        logger.warn(event.message, event);
        break;
      default:
        logger.info(event.message, event);
    }
  }

  private startMonitoring(): void {
    // Start metrics collection
    this.metricsTimer = setInterval(() => {
      this.updateMetrics();
    }, 30000); // Every 30 seconds

    // Start health checks
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Every minute
  }

  private stopMonitoring(): void {
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = undefined;
    }

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }

  private updateMetrics(): void {
    for (const [systemId, adapter] of this.adapters) {
      const metrics = this.metrics.get(systemId);
      if (metrics && adapter.getStatistics) {
        const stats = adapter.getStatistics();
        
        // Update throughput (messages per second)
        const timeDiff = 30; // 30 seconds
        const messageDiff = stats.messagesReceived - (metrics.customMetrics.lastMessageCount || 0);
        metrics.throughput = messageDiff / timeDiff;
        metrics.customMetrics.lastMessageCount = stats.messagesReceived;
        
        // Update other metrics from adapter
        if (stats.uptime) {
          metrics.uptime = stats.uptime;
        }
        
        // Memory usage
        metrics.memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
      }
    }
  }

  private initializeDataFlowRules(): void {
    // Initialize any default data flow rules from config
    if (this.config?.dataMappings) {
      for (const mapping of this.config.dataMappings) {
        // Create basic data flow rules from mappings
        // This would be expanded based on requirements
      }
    }
  }

  private startDataFlowProcessing(): void {
    // Set up data flow rule processing
    // This would handle routing data between systems based on rules
  }

  private processDataFlowRules(data: any): void {
    // Process enabled data flow rules
    for (const rule of this.dataFlowRules.values()) {
      if (!rule.enabled || rule.sourceSystemId !== data.systemId) {
        continue;
      }

      try {
        // Check conditions
        if (!this.evaluateConditions(rule.conditions, data.data)) {
          continue;
        }

        // Apply transformations
        let transformedData = data.data;
        for (const transformation of rule.transformations) {
          transformedData = this.applyTransformation(transformation, transformedData);
        }

        // Send to target system
        this.sendDataToSystem(rule.targetSystemId, transformedData);

      } catch (error) {
        logger.error(`Error processing data flow rule ${rule.name}:`, error);
      }
    }
  }

  private evaluateConditions(conditions: DataFlowCondition[], data: any): boolean {
    return conditions.every(condition => {
      const fieldValue = this.getFieldValue(data, condition.field);
      return this.evaluateCondition(fieldValue, condition.operator, condition.value);
    });
  }

  private getFieldValue(data: any, field: string): any {
    // Support nested field access with dot notation
    return field.split('.').reduce((obj, key) => obj?.[key], data);
  }

  private evaluateCondition(fieldValue: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'eq': return fieldValue === expectedValue;
      case 'ne': return fieldValue !== expectedValue;
      case 'gt': return fieldValue > expectedValue;
      case 'gte': return fieldValue >= expectedValue;
      case 'lt': return fieldValue < expectedValue;
      case 'lte': return fieldValue <= expectedValue;
      case 'contains': return String(fieldValue).includes(String(expectedValue));
      case 'regex': return new RegExp(expectedValue).test(String(fieldValue));
      default: return false;
    }
  }

  private applyTransformation(transformation: TransformationRule, data: any): any {
    // Apply transformation based on rule
    // This is a simplified implementation
    return data;
  }

  private async sendDataToSystem(targetSystemId: string, data: any): Promise<void> {
    const adapter = this.adapters.get(targetSystemId);
    if (adapter && adapter.sendData) {
      try {
        await adapter.sendData(data);
      } catch (error) {
        logger.error(`Failed to send data to system ${targetSystemId}:`, error);
      }
    }
  }
}
