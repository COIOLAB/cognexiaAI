import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface ActivityEvent {
  id: string;
  organizationId: string;
  organizationName: string;
  userId: string;
  userName: string;
  action: string;
  category: string;
  label: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

@WebSocketGateway({
  cors: {
    origin: '*', // In production, specify allowed origins
  },
  namespace: '/analytics',
})
export class AnalyticsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('AnalyticsGateway');
  private connectedClients = new Map<string, { socket: Socket; organizationId?: string }>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, { socket: client });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: { organizationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      clientInfo.organizationId = data.organizationId;
      this.connectedClients.set(client.id, clientInfo);
      this.logger.log(`Client ${client.id} subscribed to org: ${data.organizationId}`);
    }
    
    return { status: 'subscribed', organizationId: data.organizationId };
  }

  /**
   * Broadcast activity event to all subscribed clients
   * Call this from the analytics controller when new activity is received
   */
  broadcastActivity(activity: ActivityEvent) {
    this.connectedClients.forEach((clientInfo, clientId) => {
      // Send to clients subscribed to this org or to 'all'
      if (
        clientInfo.organizationId === 'all' ||
        clientInfo.organizationId === activity.organizationId
      ) {
        clientInfo.socket.emit('activity', activity);
      }
    });
  }

  /**
   * Broadcast usage statistics update
   */
  broadcastUsageUpdate(organizationId: string, stats: any) {
    this.connectedClients.forEach((clientInfo) => {
      if (
        clientInfo.organizationId === 'all' ||
        clientInfo.organizationId === organizationId
      ) {
        clientInfo.socket.emit('usage-update', {
          organizationId,
          stats,
          timestamp: new Date().toISOString(),
        });
      }
    });
  }

  /**
   * Broadcast feature update
   */
  broadcastFeatureUpdate(organizationId: string, featureKey: string, enabled: boolean) {
    this.connectedClients.forEach((clientInfo) => {
      if (clientInfo.organizationId === organizationId) {
        clientInfo.socket.emit('feature-update', {
          featureKey,
          enabled,
          timestamp: new Date().toISOString(),
        });
      }
    });
  }

  /**
   * Broadcast tier update
   */
  broadcastTierUpdate(organizationId: string, newTier: string) {
    this.connectedClients.forEach((clientInfo) => {
      if (clientInfo.organizationId === organizationId) {
        clientInfo.socket.emit('tier-update', {
          tier: newTier,
          timestamp: new Date().toISOString(),
        });
      }
    });
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Get clients for specific organization
   */
  getOrganizationClientsCount(organizationId: string): number {
    let count = 0;
    this.connectedClients.forEach((clientInfo) => {
      if (clientInfo.organizationId === organizationId) {
        count++;
      }
    });
    return count;
  }
}
