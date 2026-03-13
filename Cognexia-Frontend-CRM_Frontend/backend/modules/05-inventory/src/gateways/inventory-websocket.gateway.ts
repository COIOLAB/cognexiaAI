import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseGuards, UseInterceptors } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { RBACService } from '../rbac/rbac.service';
import { SupabaseService } from '../supabase/supabase.service';
import { User } from '../rbac/entities/User.entity';
import * as crypto from 'crypto';

interface ConnectedClient {
  id: string;
  socket: Socket;
  user: User;
  subscriptions: Set<string>;
  lastActivity: Date;
  metadata: {
    userAgent: string;
    ipAddress: string;
    location?: string;
    permissions: string[];
    roles: string[];
  };
}

interface SubscriptionRequest {
  channel: string;
  filters?: Record<string, any>;
  permissions?: string[];
  metadata?: Record<string, any>;
}

interface BroadcastMessage {
  event: string;
  channel: string;
  data: any;
  timestamp: Date;
  sender?: string;
  metadata?: Record<string, any>;
}

interface RealTimeAnalytics {
  activeConnections: number;
  totalMessages: number;
  subscriptionCounts: Record<string, number>;
  averageLatency: number;
  errorRate: number;
  bandwidthUsage: {
    inbound: number;
    outbound: number;
  };
  topChannels: Array<{ channel: string; count: number }>;
  connectionsByRole: Record<string, number>;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/inventory',
  transports: ['websocket', 'polling'],
})
export class InventoryWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(InventoryWebSocketGateway.name);
  private connectedClients: Map<string, ConnectedClient> = new Map();
  private channelSubscriptions: Map<string, Set<string>> = new Map(); // channel -> client IDs
  private analytics: RealTimeAnalytics;
  private messageQueue: BroadcastMessage[] = [];

  constructor(
    private jwtService: JwtService,
    private rbacService: RBACService,
    private supabaseService: SupabaseService,
    private eventEmitter: EventEmitter2,
  ) {
    this.initializeAnalytics();
  }

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    this.startPeriodicTasks();
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      
      if (!token) {
        client.emit('error', { message: 'Authentication token required' });
        client.disconnect();
        return;
      }

      // Verify JWT token
      const decoded = this.jwtService.verify(token);
      const user = await this.supabaseService.authenticateUser(token);

      if (!user) {
        client.emit('error', { message: 'Invalid authentication token' });
        client.disconnect();
        return;
      }

      // Get user roles and permissions
      const roles = await this.rbacService.getUserRoles(user.id);
      const permissions = await this.rbacService.getEffectivePermissions(roles);

      const connectedClient: ConnectedClient = {
        id: client.id,
        socket: client,
        user,
        subscriptions: new Set(),
        lastActivity: new Date(),
        metadata: {
          userAgent: client.handshake.headers['user-agent'] || 'unknown',
          ipAddress: client.handshake.address || 'unknown',
          permissions: permissions.map(p => `${p.resource}:${p.action}`),
          roles: roles.map(r => r.name),
        },
      };

      this.connectedClients.set(client.id, connectedClient);
      this.updateAnalytics('connection');

      // Send welcome message with user context
      client.emit('connected', {
        userId: user.id,
        permissions: connectedClient.metadata.permissions,
        roles: connectedClient.metadata.roles,
        serverTime: new Date().toISOString(),
      });

      this.logger.log(`Client connected: ${user.email} (${client.id})`);

      // Auto-subscribe to user-specific channels
      await this.autoSubscribeUserChannels(connectedClient);

    } catch (error) {
      this.logger.error('Error handling connection', error);
      client.emit('error', { message: 'Connection failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const connectedClient = this.connectedClients.get(client.id);
    if (connectedClient) {
      // Unsubscribe from all channels
      for (const channel of connectedClient.subscriptions) {
        this.unsubscribeFromChannel(client.id, channel);
      }

      this.connectedClients.delete(client.id);
      this.updateAnalytics('disconnection');

      this.logger.log(`Client disconnected: ${connectedClient.user.email} (${client.id})`);
    }
  }

  @SubscribeMessage('subscribe')
  async handleSubscription(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SubscriptionRequest,
  ) {
    try {
      const connectedClient = this.connectedClients.get(client.id);
      if (!connectedClient) {
        client.emit('error', { message: 'Client not authenticated' });
        return;
      }

      // Check permissions
      const canSubscribe = await this.checkSubscriptionPermissions(
        connectedClient,
        data.channel,
        data.permissions,
      );

      if (!canSubscribe) {
        client.emit('subscription_error', {
          channel: data.channel,
          message: 'Insufficient permissions',
        });
        return;
      }

      // Subscribe to channel
      await this.subscribeToChannel(client.id, data.channel, data.filters);

      client.emit('subscribed', {
        channel: data.channel,
        filters: data.filters,
        timestamp: new Date().toISOString(),
      });

      this.updateAnalytics('subscription');

    } catch (error) {
      this.logger.error('Error handling subscription', error);
      client.emit('subscription_error', {
        channel: data.channel,
        message: error.message,
      });
    }
  }

  @SubscribeMessage('unsubscribe')
  async handleUnsubscription(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channel: string },
  ) {
    try {
      await this.unsubscribeFromChannel(client.id, data.channel);

      client.emit('unsubscribed', {
        channel: data.channel,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error('Error handling unsubscription', error);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    const connectedClient = this.connectedClients.get(client.id);
    if (connectedClient) {
      connectedClient.lastActivity = new Date();
      client.emit('pong', { timestamp: new Date().toISOString() });
    }
  }

  @SubscribeMessage('get_analytics')
  async handleGetAnalytics(@ConnectedSocket() client: Socket) {
    const connectedClient = this.connectedClients.get(client.id);
    if (!connectedClient) return;

    // Check if user has analytics permissions
    const hasPermission = connectedClient.metadata.permissions.includes('analytics:read');
    if (!hasPermission) {
      client.emit('error', { message: 'Insufficient permissions for analytics' });
      return;
    }

    client.emit('analytics_data', this.analytics);
  }

  // Event Handlers for Real-time Updates
  @OnEvent('inventory.item.created')
  async handleInventoryItemCreated(payload: any) {
    await this.broadcast({
      event: 'inventory_item_created',
      channel: 'inventory_items',
      data: payload,
      timestamp: new Date(),
      metadata: { source: 'inventory_service' },
    });
  }

  @OnEvent('inventory.item.updated')
  async handleInventoryItemUpdated(payload: any) {
    await this.broadcast({
      event: 'inventory_item_updated',
      channel: 'inventory_items',
      data: payload,
      timestamp: new Date(),
      metadata: { source: 'inventory_service' },
    });
  }

  @OnEvent('inventory.item.deleted')
  async handleInventoryItemDeleted(payload: any) {
    await this.broadcast({
      event: 'inventory_item_deleted',
      channel: 'inventory_items',
      data: payload,
      timestamp: new Date(),
      metadata: { source: 'inventory_service' },
    });
  }

  @OnEvent('inventory.movement.created')
  async handleStockMovement(payload: any) {
    await this.broadcast({
      event: 'stock_movement',
      channel: 'stock_movements',
      data: payload,
      timestamp: new Date(),
      metadata: { source: 'inventory_service' },
    });

    // Also broadcast to item-specific channel
    if (payload.itemId) {
      await this.broadcast({
        event: 'item_movement',
        channel: `item_${payload.itemId}`,
        data: payload,
        timestamp: new Date(),
        metadata: { source: 'inventory_service' },
      });
    }
  }

  @OnEvent('inventory.location.changed')
  async handleLocationChanged(payload: any) {
    await this.broadcast({
      event: 'location_changed',
      channel: 'locations',
      data: payload,
      timestamp: new Date(),
      metadata: { source: 'inventory_service' },
    });
  }

  @OnEvent('inventory.threshold.violated')
  async handleThresholdViolated(payload: any) {
    await this.broadcast({
      event: 'threshold_violated',
      channel: 'alerts',
      data: payload,
      timestamp: new Date(),
      metadata: { source: 'inventory_service', priority: 'high' },
    });
  }

  @OnEvent('inventory.quality.alert')
  async handleQualityAlert(payload: any) {
    await this.broadcast({
      event: 'quality_alert',
      channel: 'quality_alerts',
      data: payload,
      timestamp: new Date(),
      metadata: { source: 'quality_service', priority: 'critical' },
    });
  }

  @OnEvent('robotics.robot.status_changed')
  async handleRobotStatusChanged(payload: any) {
    await this.broadcast({
      event: 'robot_status_changed',
      channel: 'robotics',
      data: payload,
      timestamp: new Date(),
      metadata: { source: 'robotics_service' },
    });
  }

  @OnEvent('robotics.task.assigned')
  async handleRobotTaskAssigned(payload: any) {
    await this.broadcast({
      event: 'robot_task_assigned',
      channel: 'robotics_tasks',
      data: payload,
      timestamp: new Date(),
      metadata: { source: 'robotics_service' },
    });
  }

  @OnEvent('analytics.report.generated')
  async handleReportGenerated(payload: any) {
    await this.broadcast({
      event: 'report_generated',
      channel: 'reports',
      data: payload,
      timestamp: new Date(),
      metadata: { source: 'analytics_service' },
    });
  }

  @OnEvent('security.incident.created')
  async handleSecurityIncident(payload: any) {
    await this.broadcast({
      event: 'security_incident',
      channel: 'security_alerts',
      data: payload,
      timestamp: new Date(),
      metadata: { source: 'security_service', priority: 'critical' },
    });
  }

  @OnEvent('supabase.inventory_items.insert')
  async handleSupabaseInventoryInsert(payload: any) {
    await this.broadcast({
      event: 'realtime_inventory_insert',
      channel: 'supabase_realtime',
      data: payload,
      timestamp: new Date(),
      metadata: { source: 'supabase' },
    });
  }

  @OnEvent('supabase.inventory_items.update')
  async handleSupabaseInventoryUpdate(payload: any) {
    await this.broadcast({
      event: 'realtime_inventory_update',
      channel: 'supabase_realtime',
      data: payload,
      timestamp: new Date(),
      metadata: { source: 'supabase' },
    });
  }

  // Public Methods
  async broadcast(message: BroadcastMessage): Promise<void> {
    try {
      const subscribers = this.channelSubscriptions.get(message.channel) || new Set();
      
      if (subscribers.size === 0) {
        // Queue message for later delivery if there are no current subscribers
        this.messageQueue.push(message);
        if (this.messageQueue.length > 1000) {
          this.messageQueue = this.messageQueue.slice(-1000); // Keep last 1000 messages
        }
        return;
      }

      let sentCount = 0;
      for (const clientId of subscribers) {
        const client = this.connectedClients.get(clientId);
        if (client) {
          client.socket.emit(message.event, {
            ...message.data,
            timestamp: message.timestamp,
            metadata: message.metadata,
          });
          sentCount++;
        }
      }

      this.updateAnalytics('broadcast', { sentCount, channel: message.channel });

      this.logger.debug(`Broadcasted ${message.event} to ${sentCount} clients in channel ${message.channel}`);

    } catch (error) {
      this.logger.error('Error broadcasting message', error);
    }
  }

  async broadcastToUser(userId: string, event: string, data: any): Promise<void> {
    const userClients = Array.from(this.connectedClients.values())
      .filter(client => client.user.id === userId);

    for (const client of userClients) {
      client.socket.emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async broadcastToRole(roleName: string, event: string, data: any): Promise<void> {
    const roleClients = Array.from(this.connectedClients.values())
      .filter(client => client.metadata.roles.includes(roleName));

    for (const client of roleClients) {
      client.socket.emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    }
  }

  getConnectedClients(): ConnectedClient[] {
    return Array.from(this.connectedClients.values());
  }

  getAnalytics(): RealTimeAnalytics {
    return this.analytics;
  }

  // Private Methods
  private async subscribeToChannel(clientId: string, channel: string, filters?: Record<string, any>): Promise<void> {
    const client = this.connectedClients.get(clientId);
    if (!client) return;

    // Add client to channel subscribers
    if (!this.channelSubscriptions.has(channel)) {
      this.channelSubscriptions.set(channel, new Set());
    }
    this.channelSubscriptions.get(channel).add(clientId);

    // Add channel to client subscriptions
    client.subscriptions.add(channel);

    // Send any queued messages for this channel
    const queuedMessages = this.messageQueue.filter(msg => msg.channel === channel);
    for (const message of queuedMessages.slice(-10)) { // Send last 10 messages
      client.socket.emit(message.event, {
        ...message.data,
        timestamp: message.timestamp,
        metadata: { ...message.metadata, queued: true },
      });
    }

    this.logger.debug(`Client ${clientId} subscribed to channel ${channel}`);
  }

  private async unsubscribeFromChannel(clientId: string, channel: string): Promise<void> {
    const client = this.connectedClients.get(clientId);
    if (client) {
      client.subscriptions.delete(channel);
    }

    const channelSubscribers = this.channelSubscriptions.get(channel);
    if (channelSubscribers) {
      channelSubscribers.delete(clientId);
      if (channelSubscribers.size === 0) {
        this.channelSubscriptions.delete(channel);
      }
    }

    this.logger.debug(`Client ${clientId} unsubscribed from channel ${channel}`);
  }

  private async checkSubscriptionPermissions(
    client: ConnectedClient,
    channel: string,
    requiredPermissions?: string[],
  ): Promise<boolean> {
    // Check basic permissions
    if (requiredPermissions) {
      for (const permission of requiredPermissions) {
        if (!client.metadata.permissions.includes(permission)) {
          return false;
        }
      }
    }

    // Channel-specific permission checks
    switch (channel) {
      case 'security_alerts':
        return client.metadata.permissions.includes('security:read');
      case 'analytics':
        return client.metadata.permissions.includes('analytics:read');
      case 'robotics':
        return client.metadata.permissions.includes('robotics:read');
      case 'quality_alerts':
        return client.metadata.permissions.includes('quality:read');
      default:
        return client.metadata.permissions.includes('inventory_items:read');
    }
  }

  private async autoSubscribeUserChannels(client: ConnectedClient): Promise<void> {
    const defaultChannels = [
      'inventory_items',
      'stock_movements',
      'locations',
      'alerts',
    ];

    // Subscribe to role-specific channels
    if (client.metadata.roles.includes('SuperAdmin') || client.metadata.roles.includes('InventoryManager')) {
      defaultChannels.push('analytics', 'reports');
    }

    if (client.metadata.roles.includes('QualityController')) {
      defaultChannels.push('quality_alerts');
    }

    if (client.metadata.roles.includes('WarehouseManager') || client.metadata.roles.includes('WarehouseOperator')) {
      defaultChannels.push('robotics', 'robotics_tasks');
    }

    if (client.metadata.roles.includes('Auditor')) {
      defaultChannels.push('security_alerts');
    }

    // Subscribe to user-specific channel
    defaultChannels.push(`user_${client.user.id}`);

    for (const channel of defaultChannels) {
      if (await this.checkSubscriptionPermissions(client, channel)) {
        await this.subscribeToChannel(client.id, channel);
      }
    }
  }

  private initializeAnalytics(): void {
    this.analytics = {
      activeConnections: 0,
      totalMessages: 0,
      subscriptionCounts: {},
      averageLatency: 0,
      errorRate: 0,
      bandwidthUsage: {
        inbound: 0,
        outbound: 0,
      },
      topChannels: [],
      connectionsByRole: {},
    };
  }

  private updateAnalytics(type: string, data?: any): void {
    switch (type) {
      case 'connection':
        this.analytics.activeConnections = this.connectedClients.size;
        break;
      case 'disconnection':
        this.analytics.activeConnections = this.connectedClients.size;
        break;
      case 'subscription':
        // Update subscription counts
        break;
      case 'broadcast':
        this.analytics.totalMessages++;
        if (data?.channel) {
          this.analytics.subscriptionCounts[data.channel] = 
            (this.analytics.subscriptionCounts[data.channel] || 0) + (data.sentCount || 1);
        }
        break;
    }

    // Update connections by role
    this.analytics.connectionsByRole = {};
    for (const client of this.connectedClients.values()) {
      for (const role of client.metadata.roles) {
        this.analytics.connectionsByRole[role] = (this.analytics.connectionsByRole[role] || 0) + 1;
      }
    }

    // Update top channels
    this.analytics.topChannels = Object.entries(this.analytics.subscriptionCounts)
      .map(([channel, count]) => ({ channel, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private startPeriodicTasks(): void {
    // Clean up stale connections every minute
    setInterval(() => {
      this.cleanupStaleConnections();
    }, 60 * 1000);

    // Update analytics every 30 seconds
    setInterval(() => {
      this.updatePeriodicAnalytics();
    }, 30 * 1000);

    // Cleanup message queue every 5 minutes
    setInterval(() => {
      this.cleanupMessageQueue();
    }, 5 * 60 * 1000);
  }

  private cleanupStaleConnections(): void {
    const now = new Date();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [clientId, client] of this.connectedClients) {
      const timeSinceActivity = now.getTime() - client.lastActivity.getTime();
      if (timeSinceActivity > staleThreshold) {
        this.logger.warn(`Disconnecting stale client: ${client.user.email} (${clientId})`);
        client.socket.disconnect();
        this.handleDisconnect(client.socket);
      }
    }
  }

  private updatePeriodicAnalytics(): void {
    // Calculate average latency, error rates, etc.
    // This is a placeholder - real implementation would track these metrics
  }

  private cleanupMessageQueue(): void {
    const now = new Date();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    this.messageQueue = this.messageQueue.filter(
      message => now.getTime() - message.timestamp.getTime() < maxAge
    );
  }
}
