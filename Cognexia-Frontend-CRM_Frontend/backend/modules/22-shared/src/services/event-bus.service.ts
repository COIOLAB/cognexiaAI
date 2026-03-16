import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

// Event types for Industry 5.0 system
export enum Industry5EventType {
  // User and Authentication Events
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  
  // Manufacturing Events
  PRODUCTION_STARTED = 'manufacturing.production.started',
  PRODUCTION_COMPLETED = 'manufacturing.production.completed',
  PRODUCTION_STOPPED = 'manufacturing.production.stopped',
  QUALITY_CHECK_COMPLETED = 'manufacturing.quality.check.completed',
  EQUIPMENT_STATUS_CHANGED = 'manufacturing.equipment.status.changed',
  
  // IoT and Sensor Events
  SENSOR_DATA_RECEIVED = 'iot.sensor.data.received',
  DEVICE_CONNECTED = 'iot.device.connected',
  DEVICE_DISCONNECTED = 'iot.device.disconnected',
  DEVICE_ERROR = 'iot.device.error',
  THRESHOLD_EXCEEDED = 'iot.threshold.exceeded',
  
  // Inventory Events
  STOCK_LEVEL_LOW = 'inventory.stock.level.low',
  ITEM_RECEIVED = 'inventory.item.received',
  ITEM_ISSUED = 'inventory.item.issued',
  INVENTORY_UPDATED = 'inventory.updated',
  
  // Maintenance Events
  MAINTENANCE_SCHEDULED = 'maintenance.scheduled',
  MAINTENANCE_STARTED = 'maintenance.started',
  MAINTENANCE_COMPLETED = 'maintenance.completed',
  EQUIPMENT_FAILURE = 'maintenance.equipment.failure',
  PREDICTIVE_ALERT = 'maintenance.predictive.alert',
  
  // AI and Analytics Events
  MODEL_TRAINED = 'ai.model.trained',
  PREDICTION_GENERATED = 'ai.prediction.generated',
  ANOMALY_DETECTED = 'ai.anomaly.detected',
  INSIGHT_GENERATED = 'ai.insight.generated',
  
  // Blockchain Events
  TRANSACTION_CREATED = 'blockchain.transaction.created',
  TRANSACTION_CONFIRMED = 'blockchain.transaction.confirmed',
  SMART_CONTRACT_EXECUTED = 'blockchain.smart_contract.executed',
  IDENTITY_VERIFIED = 'blockchain.identity.verified',
  
  // Quantum Events
  QUANTUM_COMPUTATION_STARTED = 'quantum.computation.started',
  QUANTUM_COMPUTATION_COMPLETED = 'quantum.computation.completed',
  QUANTUM_KEY_GENERATED = 'quantum.key.generated',
  QUANTUM_ENCRYPTION_APPLIED = 'quantum.encryption.applied',
  
  // System Events
  SYSTEM_STARTUP = 'system.startup',
  SYSTEM_SHUTDOWN = 'system.shutdown',
  HEALTH_CHECK_COMPLETED = 'system.health_check.completed',
  BACKUP_COMPLETED = 'system.backup.completed',
  ERROR_OCCURRED = 'system.error.occurred',
  
  // Business Process Events
  ORDER_CREATED = 'business.order.created',
  ORDER_PROCESSED = 'business.order.processed',
  WORKFLOW_STARTED = 'business.workflow.started',
  WORKFLOW_COMPLETED = 'business.workflow.completed',
  APPROVAL_REQUESTED = 'business.approval.requested',
}

export interface Industry5Event {
  id: string;
  type: Industry5EventType;
  source: string; // Module that emitted the event
  timestamp: Date;
  data: any;
  metadata?: Record<string, any>;
  correlationId?: string;
  userId?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  retryCount?: number;
  expiresAt?: Date;
}

export interface EventSubscriptionOptions {
  filter?: (event: Industry5Event) => boolean;
  transform?: (event: Industry5Event) => any;
  maxRetries?: number;
  retryDelay?: number;
  persistent?: boolean;
}

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);
  private readonly eventStream = new Subject<Industry5Event>();
  private readonly eventHistory = new BehaviorSubject<Industry5Event[]>([]);
  private readonly subscriptions = new Map<string, Observable<Industry5Event>>();
  private readonly eventMetrics = new Map<Industry5EventType, {
    count: number;
    lastEmitted: Date;
    avgProcessingTime: number;
  }>();

  constructor(private eventEmitter: EventEmitter2) {}

  /**
   * Emit an event to the system
   */
  async emit<T = any>(
    type: Industry5EventType,
    data: T,
    options?: {
      source?: string;
      correlationId?: string;
      userId?: string;
      priority?: 'low' | 'medium' | 'high' | 'critical';
      metadata?: Record<string, any>;
      expiresAt?: Date;
    }
  ): Promise<string> {
    const eventId = this.generateEventId();
    const event: Industry5Event = {
      id: eventId,
      type,
      source: options?.source || 'unknown',
      timestamp: new Date(),
      data,
      metadata: options?.metadata,
      correlationId: options?.correlationId,
      userId: options?.userId,
      priority: options?.priority || 'medium',
      retryCount: 0,
      expiresAt: options?.expiresAt,
    };

    try {
      // Emit to NestJS EventEmitter for local handlers
      await this.eventEmitter.emitAsync(type, event);

      // Emit to RxJS stream for reactive handlers
      this.eventStream.next(event);

      // Update event history (keep last 1000 events)
      const currentHistory = this.eventHistory.value;
      const newHistory = [event, ...currentHistory].slice(0, 1000);
      this.eventHistory.next(newHistory);

      // Update metrics
      this.updateEventMetrics(type);

      this.logger.debug(`Event emitted: ${type} (${eventId})`);
      return eventId;
    } catch (error) {
      this.logger.error(`Failed to emit event ${type}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to events of a specific type
   */
  on<T = any>(
    eventType: Industry5EventType,
    options?: EventSubscriptionOptions
  ): Observable<Industry5Event<T>> {
    const subscriptionKey = `${eventType}_${Date.now()}`;
    
    let subscription = this.eventStream.pipe(
      filter(event => event.type === eventType)
    );

    if (options?.filter) {
      subscription = subscription.pipe(filter(options.filter));
    }

    if (options?.transform) {
      subscription = subscription.pipe(map(options.transform));
    }

    this.subscriptions.set(subscriptionKey, subscription);
    return subscription;
  }

  /**
   * Subscribe to multiple event types
   */
  onAny(
    eventTypes: Industry5EventType[],
    options?: EventSubscriptionOptions
  ): Observable<Industry5Event> {
    let subscription = this.eventStream.pipe(
      filter(event => eventTypes.includes(event.type))
    );

    if (options?.filter) {
      subscription = subscription.pipe(filter(options.filter));
    }

    if (options?.transform) {
      subscription = subscription.pipe(map(options.transform));
    }

    return subscription;
  }

  /**
   * Subscribe to all events
   */
  onAll(options?: EventSubscriptionOptions): Observable<Industry5Event> {
    let subscription = this.eventStream.asObservable();

    if (options?.filter) {
      subscription = subscription.pipe(filter(options.filter));
    }

    if (options?.transform) {
      subscription = subscription.pipe(map(options.transform));
    }

    return subscription;
  }

  /**
   * Get event history
   */
  getEventHistory(
    limit: number = 100,
    filter?: (event: Industry5Event) => boolean
  ): Industry5Event[] {
    const history = this.eventHistory.value;
    const filteredHistory = filter ? history.filter(filter) : history;
    return filteredHistory.slice(0, limit);
  }

  /**
   * Get events by correlation ID
   */
  getEventsByCorrelationId(correlationId: string): Industry5Event[] {
    return this.eventHistory.value.filter(
      event => event.correlationId === correlationId
    );
  }

  /**
   * Get events by user ID
   */
  getEventsByUserId(userId: string): Industry5Event[] {
    return this.eventHistory.value.filter(
      event => event.userId === userId
    );
  }

  /**
   * Get event metrics
   */
  getEventMetrics(): Map<Industry5EventType, {
    count: number;
    lastEmitted: Date;
    avgProcessingTime: number;
  }> {
    return new Map(this.eventMetrics);
  }

  /**
   * Clear event history
   */
  clearEventHistory(): void {
    this.eventHistory.next([]);
    this.logger.debug('Event history cleared');
  }

  /**
   * Emit system startup event
   */
  async emitSystemStartup(source: string): Promise<void> {
    await this.emit(Industry5EventType.SYSTEM_STARTUP, {
      source,
      startupTime: new Date(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    }, { source });
  }

  /**
   * Emit system shutdown event
   */
  async emitSystemShutdown(source: string): Promise<void> {
    await this.emit(Industry5EventType.SYSTEM_SHUTDOWN, {
      source,
      shutdownTime: new Date(),
      graceful: true,
    }, { source });
  }

  /**
   * Emit health check event
   */
  async emitHealthCheck(
    source: string,
    healthData: Record<string, any>
  ): Promise<void> {
    await this.emit(Industry5EventType.HEALTH_CHECK_COMPLETED, {
      source,
      ...healthData,
    }, { source });
  }

  /**
   * Emit error event
   */
  async emitError(
    source: string,
    error: Error,
    context?: Record<string, any>
  ): Promise<void> {
    await this.emit(Industry5EventType.ERROR_OCCURRED, {
      source,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
    }, { 
      source,
      priority: 'high',
    });
  }

  /**
   * Create a correlation ID for tracking related events
   */
  createCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateEventMetrics(eventType: Industry5EventType): void {
    const current = this.eventMetrics.get(eventType) || {
      count: 0,
      lastEmitted: new Date(),
      avgProcessingTime: 0,
    };

    this.eventMetrics.set(eventType, {
      count: current.count + 1,
      lastEmitted: new Date(),
      avgProcessingTime: current.avgProcessingTime, // Would be calculated with actual processing time
    });
  }

  // Convenience methods for common events
  async emitUserLogin(userId: string, data: any): Promise<string> {
    return this.emit(Industry5EventType.USER_LOGIN, data, {
      source: 'auth-service',
      userId,
      priority: 'medium',
    });
  }

  async emitProductionEvent(
    type: Industry5EventType.PRODUCTION_STARTED | Industry5EventType.PRODUCTION_COMPLETED | Industry5EventType.PRODUCTION_STOPPED,
    data: any,
    userId?: string
  ): Promise<string> {
    return this.emit(type, data, {
      source: 'manufacturing-service',
      userId,
      priority: 'high',
    });
  }

  async emitIoTEvent(
    type: Industry5EventType,
    deviceId: string,
    data: any
  ): Promise<string> {
    return this.emit(type, { deviceId, ...data }, {
      source: 'iot-service',
      priority: 'medium',
      metadata: { deviceId },
    });
  }

  async emitMaintenanceAlert(
    type: Industry5EventType,
    equipmentId: string,
    data: any
  ): Promise<string> {
    return this.emit(type, { equipmentId, ...data }, {
      source: 'maintenance-service',
      priority: 'high',
      metadata: { equipmentId },
    });
  }

  async emitAIInsight(data: any, modelId?: string): Promise<string> {
    return this.emit(Industry5EventType.INSIGHT_GENERATED, data, {
      source: 'ai-service',
      priority: 'medium',
      metadata: { modelId },
    });
  }

  async emitBlockchainTransaction(transactionId: string, data: any): Promise<string> {
    return this.emit(Industry5EventType.TRANSACTION_CREATED, data, {
      source: 'blockchain-service',
      priority: 'medium',
      metadata: { transactionId },
    });
  }
}
