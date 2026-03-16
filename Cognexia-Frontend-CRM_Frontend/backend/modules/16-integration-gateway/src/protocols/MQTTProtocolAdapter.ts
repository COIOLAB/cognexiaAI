import { EventEmitter } from 'events';
import { logger } from '../../../utils/logger';
import { ConnectionConfig, DataFormat } from '../services/IntegrationGatewayService';

export interface MQTTConnectionConfig extends ConnectionConfig {
  brokerUrl: string;
  port: number;
  clientId: string;
  keepAlive?: number;
  connectTimeout?: number;
  reconnectPeriod?: number;
  protocolId?: string;
  protocolVersion?: number;
  clean?: boolean;
  encoding?: string;
  will?: MQTTWillMessage;
  rejectUnauthorized?: boolean;
  ca?: string | Buffer;
  cert?: string | Buffer;
  key?: string | Buffer;
  passphrase?: string;
  servername?: string;
  maxReconnectAttempts?: number;
  queueQoSZero?: boolean;
}

export interface MQTTWillMessage {
  topic: string;
  payload: string | Buffer;
  qos: MQTTQoS;
  retain: boolean;
}

export enum MQTTQoS {
  AT_MOST_ONCE = 0,
  AT_LEAST_ONCE = 1,
  EXACTLY_ONCE = 2
}

export interface MQTTSubscription {
  topic: string;
  qos: MQTTQoS;
  handler?: (topic: string, message: Buffer, packet: MQTTPacket) => void;
  enabled: boolean;
  subscribed: boolean;
  statistics: {
    messagesReceived: number;
    lastMessage: Date | null;
    errors: number;
  };
}

export interface MQTTPacket {
  cmd: string;
  messageId?: number;
  qos?: MQTTQoS;
  retain?: boolean;
  dup?: boolean;
  topic?: string;
  payload?: Buffer;
  properties?: any;
}

export interface MQTTPublishOptions {
  qos?: MQTTQoS;
  retain?: boolean;
  dup?: boolean;
  properties?: any;
}

export interface MQTTMessage {
  topic: string;
  payload: any;
  qos: MQTTQoS;
  retain: boolean;
  timestamp: Date;
  messageId?: number;
  properties?: any;
}

export interface MQTTTopicPattern {
  pattern: string;
  description?: string;
  dataFormat?: DataFormat;
  transformation?: (message: MQTTMessage) => any;
  validation?: (message: MQTTMessage) => boolean;
  enabled: boolean;
}

export interface MQTTDataMapping {
  sourceTopic: string;
  targetTopic: string;
  transformation: (data: any) => any;
  enabled: boolean;
  qos: MQTTQoS;
  retain: boolean;
}

export enum MQTTConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

export interface MQTTStatistics {
  messagesPublished: number;
  messagesReceived: number;
  bytesPublished: number;
  bytesReceived: number;
  subscriptions: number;
  errors: number;
  lastActivity: Date | null;
  uptime: number;
  reconnections: number;
}

export class MQTTProtocolAdapter extends EventEmitter {
  private config: MQTTConnectionConfig;
  private client: any; // MQTT client instance
  private subscriptions: Map<string, MQTTSubscription> = new Map();
  private topicPatterns: Map<string, MQTTTopicPattern> = new Map();
  private dataMappings: Map<string, MQTTDataMapping> = new Map();
  private connectionState: MQTTConnectionState = MQTTConnectionState.DISCONNECTED;
  private reconnectTimer?: NodeJS.Timeout;
  private healthCheckTimer?: NodeJS.Timeout;
  private connectionStartTime?: Date;
  private messageQueue: { topic: string; payload: any; options: MQTTPublishOptions }[] = [];
  private statistics: MQTTStatistics = {
    messagesPublished: 0,
    messagesReceived: 0,
    bytesPublished: 0,
    bytesReceived: 0,
    subscriptions: 0,
    errors: 0,
    lastActivity: null,
    uptime: 0,
    reconnections: 0
  };

  constructor(config: MQTTConnectionConfig) {
    super();
    this.config = config;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.on('connection_lost', () => {
      logger.warn('MQTT connection lost, attempting to reconnect...');
      this.connectionState = MQTTConnectionState.RECONNECTING;
      this.statistics.reconnections++;
      this.scheduleReconnect();
    });

    this.on('message_received', (message: MQTTMessage) => {
      this.statistics.messagesReceived++;
      this.statistics.bytesReceived += Buffer.byteLength(JSON.stringify(message.payload));
      this.statistics.lastActivity = new Date();
      
      // Update subscription statistics
      const subscription = this.findMatchingSubscription(message.topic);
      if (subscription) {
        subscription.statistics.messagesReceived++;
        subscription.statistics.lastMessage = new Date();
      }

      // Process topic patterns
      this.processTopicPatterns(message);
      
      // Process data mappings
      this.processDataMappings(message);
    });

    this.on('message_published', (topic: string, payload: any) => {
      this.statistics.messagesPublished++;
      this.statistics.bytesPublished += Buffer.byteLength(JSON.stringify(payload));
      this.statistics.lastActivity = new Date();
    });

    this.on('error', (error: any) => {
      logger.error('MQTT adapter error:', error);
      this.statistics.errors++;
    });
  }

  public async connect(): Promise<void> {
    try {
      logger.info(`Connecting to MQTT broker: ${this.config.brokerUrl}:${this.config.port}`);
      this.connectionState = MQTTConnectionState.CONNECTING;
      this.connectionStartTime = new Date();

      // Initialize MQTT client
      this.client = await this.createMQTTClient();
      
      // Set up client event handlers
      this.setupClientEventHandlers();
      
      // Establish connection
      await this.client.connect();
      
      this.connectionState = MQTTConnectionState.CONNECTED;
      
      // Restore subscriptions
      await this.restoreSubscriptions();
      
      // Process queued messages
      await this.processMessageQueue();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      logger.info('Successfully connected to MQTT broker');
      this.emit('connected');

    } catch (error) {
      this.connectionState = MQTTConnectionState.ERROR;
      logger.error('Failed to connect to MQTT broker:', error);
      this.emit('connection_error', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      logger.info('Disconnecting from MQTT broker...');
      
      // Stop health monitoring
      if (this.healthCheckTimer) {
        clearInterval(this.healthCheckTimer);
      }

      // Stop reconnect timer
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
      }

      // Unsubscribe from all topics
      await this.unsubscribeAll();

      // Disconnect client
      if (this.client) {
        await this.client.disconnect();
        this.client = null;
      }

      this.connectionState = MQTTConnectionState.DISCONNECTED;
      logger.info('Disconnected from MQTT broker');
      this.emit('disconnected');

    } catch (error) {
      logger.error('Error disconnecting from MQTT broker:', error);
      throw error;
    }
  }

  public async subscribe(topic: string, qos: MQTTQoS = MQTTQoS.AT_MOST_ONCE, handler?: (topic: string, message: Buffer, packet: MQTTPacket) => void): Promise<void> {
    try {
      const subscription: MQTTSubscription = {
        topic,
        qos,
        handler,
        enabled: true,
        subscribed: false,
        statistics: {
          messagesReceived: 0,
          lastMessage: null,
          errors: 0
        }
      };

      this.subscriptions.set(topic, subscription);

      if (this.connectionState === MQTTConnectionState.CONNECTED && this.client) {
        await this.client.subscribe(topic, { qos });
        subscription.subscribed = true;
        this.statistics.subscriptions++;
        logger.info(`Subscribed to MQTT topic: ${topic} (QoS: ${qos})`);
      }

      this.emit('subscription_added', { topic, qos });

    } catch (error) {
      logger.error(`Error subscribing to topic ${topic}:`, error);
      throw error;
    }
  }

  public async unsubscribe(topic: string): Promise<void> {
    try {
      const subscription = this.subscriptions.get(topic);
      if (!subscription) {
        throw new Error(`Subscription for topic ${topic} not found`);
      }

      if (this.connectionState === MQTTConnectionState.CONNECTED && this.client && subscription.subscribed) {
        await this.client.unsubscribe(topic);
        this.statistics.subscriptions--;
      }

      this.subscriptions.delete(topic);
      logger.info(`Unsubscribed from MQTT topic: ${topic}`);
      this.emit('subscription_removed', { topic });

    } catch (error) {
      logger.error(`Error unsubscribing from topic ${topic}:`, error);
      throw error;
    }
  }

  public async publish(topic: string, payload: any, options: MQTTPublishOptions = {}): Promise<void> {
    try {
      const publishOptions = {
        qos: options.qos || MQTTQoS.AT_MOST_ONCE,
        retain: options.retain || false,
        dup: options.dup || false,
        properties: options.properties
      };

      if (this.connectionState !== MQTTConnectionState.CONNECTED || !this.client) {
        // Queue message for later publishing
        this.messageQueue.push({ topic, payload, options: publishOptions });
        logger.warn(`MQTT not connected, queued message for topic: ${topic}`);
        return;
      }

      // Convert payload to buffer if needed
      let payloadBuffer: Buffer;
      if (Buffer.isBuffer(payload)) {
        payloadBuffer = payload;
      } else if (typeof payload === 'string') {
        payloadBuffer = Buffer.from(payload, 'utf8');
      } else {
        payloadBuffer = Buffer.from(JSON.stringify(payload), 'utf8');
      }

      await this.client.publish(topic, payloadBuffer, publishOptions);
      
      logger.debug(`Published message to MQTT topic: ${topic}`);
      this.emit('message_published', topic, payload);

    } catch (error) {
      logger.error(`Error publishing to topic ${topic}:`, error);
      this.emit('error', error);
      throw error;
    }
  }

  public addTopicPattern(pattern: string, config: Omit<MQTTTopicPattern, 'pattern'>): void {
    this.topicPatterns.set(pattern, { pattern, ...config });
    logger.info(`Added MQTT topic pattern: ${pattern}`);
  }

  public removeTopicPattern(pattern: string): void {
    this.topicPatterns.delete(pattern);
    logger.info(`Removed MQTT topic pattern: ${pattern}`);
  }

  public addDataMapping(mapping: MQTTDataMapping): void {
    this.dataMappings.set(mapping.sourceTopic, mapping);
    logger.info(`Added MQTT data mapping: ${mapping.sourceTopic} -> ${mapping.targetTopic}`);
  }

  public removeDataMapping(sourceTopic: string): void {
    this.dataMappings.delete(sourceTopic);
    logger.info(`Removed MQTT data mapping for: ${sourceTopic}`);
  }

  public getSubscriptions(): MQTTSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  public getTopicPatterns(): MQTTTopicPattern[] {
    return Array.from(this.topicPatterns.values());
  }

  public getDataMappings(): MQTTDataMapping[] {
    return Array.from(this.dataMappings.values());
  }

  public async healthCheck(): Promise<{ healthy: boolean; message?: string; details?: any }> {
    try {
      if (this.connectionState !== MQTTConnectionState.CONNECTED || !this.client) {
        return {
          healthy: false,
          message: 'MQTT client not connected',
          details: { 
            connectionState: this.connectionState,
            statistics: this.getStatistics()
          }
        };
      }

      // Update uptime
      if (this.connectionStartTime) {
        this.statistics.uptime = Date.now() - this.connectionStartTime.getTime();
      }

      return {
        healthy: true,
        message: 'MQTT connection healthy',
        details: {
          connectionState: this.connectionState,
          activeSubscriptions: Array.from(this.subscriptions.values()).filter(s => s.subscribed).length,
          queuedMessages: this.messageQueue.length,
          statistics: this.getStatistics()
        }
      };

    } catch (error) {
      return {
        healthy: false,
        message: 'MQTT health check failed',
        details: { error: error.message, statistics: this.getStatistics() }
      };
    }
  }

  public getConnectionInfo(): any {
    return {
      brokerUrl: this.config.brokerUrl,
      port: this.config.port,
      clientId: this.config.clientId,
      connectionState: this.connectionState,
      activeSubscriptions: Array.from(this.subscriptions.values()).filter(s => s.subscribed).length,
      topicPatterns: this.topicPatterns.size,
      dataMappings: this.dataMappings.size,
      queuedMessages: this.messageQueue.length,
      uptime: this.statistics.uptime
    };
  }

  public getStatistics(): MQTTStatistics {
    if (this.connectionStartTime) {
      this.statistics.uptime = Date.now() - this.connectionStartTime.getTime();
    }
    return { ...this.statistics };
  }

  public resetStatistics(): void {
    this.statistics = {
      messagesPublished: 0,
      messagesReceived: 0,
      bytesPublished: 0,
      bytesReceived: 0,
      subscriptions: this.statistics.subscriptions, // Keep current subscription count
      errors: 0,
      lastActivity: null,
      uptime: 0,
      reconnections: 0
    };
    this.connectionStartTime = new Date();
  }

  public clearMessageQueue(): void {
    this.messageQueue = [];
    logger.info('MQTT message queue cleared');
  }

  public enableTopicPattern(pattern: string): void {
    const topicPattern = this.topicPatterns.get(pattern);
    if (topicPattern) {
      topicPattern.enabled = true;
      logger.info(`Enabled MQTT topic pattern: ${pattern}`);
    }
  }

  public disableTopicPattern(pattern: string): void {
    const topicPattern = this.topicPatterns.get(pattern);
    if (topicPattern) {
      topicPattern.enabled = false;
      logger.info(`Disabled MQTT topic pattern: ${pattern}`);
    }
  }

  public enableDataMapping(sourceTopic: string): void {
    const mapping = this.dataMappings.get(sourceTopic);
    if (mapping) {
      mapping.enabled = true;
      logger.info(`Enabled MQTT data mapping: ${sourceTopic}`);
    }
  }

  public disableDataMapping(sourceTopic: string): void {
    const mapping = this.dataMappings.get(sourceTopic);
    if (mapping) {
      mapping.enabled = false;
      logger.info(`Disabled MQTT data mapping: ${sourceTopic}`);
    }
  }

  private async createMQTTClient(): Promise<any> {
    // Mock MQTT client creation
    // In real implementation, use mqtt library
    return {
      connect: async () => {
        logger.info(`Mock MQTT client connecting to ${this.config.brokerUrl}:${this.config.port}`);
      },
      disconnect: async () => {
        logger.info('Mock MQTT client disconnecting');
      },
      subscribe: async (topic: string, options: any) => {
        logger.info(`Mock MQTT client subscribing to ${topic}`);
      },
      unsubscribe: async (topic: string) => {
        logger.info(`Mock MQTT client unsubscribing from ${topic}`);
      },
      publish: async (topic: string, payload: Buffer, options: any) => {
        logger.debug(`Mock MQTT client publishing to ${topic}`);
        
        // Simulate message reception for testing
        setTimeout(() => {
          const message: MQTTMessage = {
            topic,
            payload: payload.toString(),
            qos: options.qos,
            retain: options.retain,
            timestamp: new Date(),
            properties: options.properties
          };
          this.emit('message_received', message);
        }, 10);
      },
      on: (event: string, handler: Function) => {
        // Mock event handlers
      },
      removeAllListeners: () => {
        // Mock cleanup
      }
    };
  }

  private setupClientEventHandlers(): void {
    if (!this.client) return;

    this.client.on('connect', () => {
      logger.info('MQTT client connected');
      this.connectionState = MQTTConnectionState.CONNECTED;
    });

    this.client.on('disconnect', () => {
      logger.warn('MQTT client disconnected');
      this.emit('connection_lost');
    });

    this.client.on('error', (error: any) => {
      logger.error('MQTT client error:', error);
      this.emit('error', error);
    });

    this.client.on('message', (topic: string, payload: Buffer, packet: MQTTPacket) => {
      try {
        const message: MQTTMessage = {
          topic,
          payload: this.parsePayload(payload),
          qos: packet.qos || MQTTQoS.AT_MOST_ONCE,
          retain: packet.retain || false,
          timestamp: new Date(),
          messageId: packet.messageId,
          properties: packet.properties
        };

        // Call subscription handler if exists
        const subscription = this.subscriptions.get(topic) || this.findMatchingSubscription(topic);
        if (subscription?.handler) {
          subscription.handler(topic, payload, packet);
        }

        this.emit('message_received', message);

      } catch (error) {
        logger.error(`Error processing MQTT message for topic ${topic}:`, error);
        this.emit('error', error);
      }
    });
  }

  private startHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(async () => {
      const health = await this.healthCheck();
      if (!health.healthy && this.connectionState === MQTTConnectionState.CONNECTED) {
        this.emit('connection_lost');
      }
    }, 30000); // Check every 30 seconds
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const maxAttempts = this.config.maxReconnectAttempts || Infinity;
    if (this.statistics.reconnections >= maxAttempts) {
      logger.error('Maximum reconnection attempts reached');
      this.connectionState = MQTTConnectionState.ERROR;
      return;
    }

    const delay = this.config.reconnectPeriod || 5000;
    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        logger.error('MQTT reconnection failed:', error);
        this.scheduleReconnect();
      }
    }, delay);
  }

  private async restoreSubscriptions(): Promise<void> {
    for (const subscription of this.subscriptions.values()) {
      if (subscription.enabled && !subscription.subscribed) {
        try {
          await this.client.subscribe(subscription.topic, { qos: subscription.qos });
          subscription.subscribed = true;
          this.statistics.subscriptions++;
          logger.info(`Restored subscription to: ${subscription.topic}`);
        } catch (error) {
          logger.error(`Failed to restore subscription to ${subscription.topic}:`, error);
          subscription.statistics.errors++;
        }
      }
    }
  }

  private async processMessageQueue(): Promise<void> {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        try {
          await this.publish(message.topic, message.payload, message.options);
        } catch (error) {
          logger.error('Error processing queued message:', error);
          // Re-queue the message for later processing
          this.messageQueue.unshift(message);
          break;
        }
      }
    }
  }

  private async unsubscribeAll(): Promise<void> {
    for (const [topic, subscription] of this.subscriptions) {
      if (subscription.subscribed && this.client) {
        try {
          await this.client.unsubscribe(topic);
          subscription.subscribed = false;
          this.statistics.subscriptions--;
        } catch (error) {
          logger.error(`Error unsubscribing from ${topic}:`, error);
        }
      }
    }
  }

  private findMatchingSubscription(topic: string): MQTTSubscription | undefined {
    // Exact match first
    if (this.subscriptions.has(topic)) {
      return this.subscriptions.get(topic);
    }

    // Wildcard matching
    for (const subscription of this.subscriptions.values()) {
      if (this.isTopicMatch(subscription.topic, topic)) {
        return subscription;
      }
    }

    return undefined;
  }

  private isTopicMatch(pattern: string, topic: string): boolean {
    // Simple MQTT wildcard matching
    // + matches single level, # matches multiple levels
    const patternParts = pattern.split('/');
    const topicParts = topic.split('/');

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      
      if (patternPart === '#') {
        return true; // # matches all remaining levels
      }
      
      if (i >= topicParts.length) {
        return false; // Topic has fewer levels than pattern
      }
      
      if (patternPart !== '+' && patternPart !== topicParts[i]) {
        return false; // No match and not a single-level wildcard
      }
    }

    return patternParts.length === topicParts.length;
  }

  private processTopicPatterns(message: MQTTMessage): void {
    for (const pattern of this.topicPatterns.values()) {
      if (!pattern.enabled) continue;

      if (this.isTopicMatch(pattern.pattern, message.topic)) {
        try {
          // Validate message if validator is provided
          if (pattern.validation && !pattern.validation(message)) {
            logger.warn(`Message validation failed for pattern ${pattern.pattern}`);
            continue;
          }

          // Transform message if transformer is provided
          let transformedData = message;
          if (pattern.transformation) {
            transformedData = pattern.transformation(message);
          }

          this.emit('pattern_matched', {
            pattern: pattern.pattern,
            originalMessage: message,
            transformedData
          });

        } catch (error) {
          logger.error(`Error processing topic pattern ${pattern.pattern}:`, error);
        }
      }
    }
  }

  private processDataMappings(message: MQTTMessage): void {
    const mapping = this.dataMappings.get(message.topic);
    if (mapping && mapping.enabled) {
      try {
        const transformedData = mapping.transformation(message.payload);
        
        // Publish transformed data to target topic
        this.publish(mapping.targetTopic, transformedData, {
          qos: mapping.qos,
          retain: mapping.retain
        });

        this.emit('data_mapped', {
          sourceTopic: message.topic,
          targetTopic: mapping.targetTopic,
          originalData: message.payload,
          transformedData
        });

      } catch (error) {
        logger.error(`Error processing data mapping for ${message.topic}:`, error);
      }
    }
  }

  private parsePayload(payload: Buffer): any {
    try {
      const payloadString = payload.toString('utf8');
      
      // Try to parse as JSON first
      try {
        return JSON.parse(payloadString);
      } catch {
        // Return as string if not valid JSON
        return payloadString;
      }
    } catch (error) {
      // Return raw buffer if string conversion fails
      return payload;
    }
  }
}
