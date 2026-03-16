import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';

interface ConnectedClient {
  id: string;
  socket: Socket;
  user?: { id: string; email?: string; tenantId?: string };
  subscriptions: Set<string>;
  lastActivity: Date;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
  namespace: '/telephony',
  transports: ['websocket', 'polling'],
})
export class TelephonyWebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TelephonyWebSocketGateway.name);
  private connected: Map<string, ConnectedClient> = new Map();

  constructor(private jwtService: JwtService, private events: EventEmitter2) {}

  async handleConnection(client: Socket) {
    try {
      const token = (client.handshake.auth as any)?.token || (client.handshake.query as any)?.token;
      let user: any = undefined;
      if (token) {
        try {
          const decoded = this.jwtService.verify(String(token));
          user = {
            id: decoded.sub || decoded.userId || decoded.id,
            email: decoded.email,
            tenantId: decoded.tenantId,
          };
        } catch (e) {
          this.logger.warn('Invalid JWT on telephony websocket connection');
        }
      }

      this.connected.set(client.id, {
        id: client.id,
        socket: client,
        user,
        subscriptions: new Set(),
        lastActivity: new Date(),
      });

      client.emit('connected', {
        timestamp: new Date().toISOString(),
        user: user ? { id: user.id, email: user.email, tenantId: user.tenantId } : null,
      });

      this.logger.log(`Client connected ${client.id}${user?.email ? ' (' + user.email + ')' : ''}`);
    } catch (err) {
      this.logger.error('telephony websocket connection error', err as any);
      client.emit('error', { message: 'connection_failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connected.delete(client.id);
    this.logger.log(`Client disconnected ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, payload: { channels?: string[] }) {
    const cc = this.connected.get(client.id);
    if (!cc) return;
    const channels = payload?.channels || [];
    for (const ch of channels) cc.subscriptions.add(ch);
    client.emit('subscribed', { channels, timestamp: new Date().toISOString() });
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, payload: { channels?: string[] }) {
    const cc = this.connected.get(client.id);
    if (!cc) return;
    const channels = payload?.channels || [];
    for (const ch of channels) cc.subscriptions.delete(ch);
    client.emit('unsubscribed', { channels, timestamp: new Date().toISOString() });
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    const cc = this.connected.get(client.id);
    if (cc) cc.lastActivity = new Date();
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  // ===== Event Forwarders =====
  // Emit compact events to clients; frontend invalidates caches on these

  @OnEvent('telephony.call.created')
  onCallCreated(payload: any) {
    this.broadcast('call.created', payload);
  }

  @OnEvent('telephony.call.updated')
  onCallUpdated(payload: any) {
    this.broadcast('call.updated', payload);
  }

  @OnEvent('telephony.call.ended')
  onCallEnded(payload: any) {
    this.broadcast('call.ended', payload);
  }

  @OnEvent('telephony.queue.updated')
  onQueueUpdated(payload: any) {
    this.broadcast('queue.updated', payload);
  }

  private broadcast(event: string, data: any) {
    // Optionally: route by tenant/channel if provided
    this.server.emit(event, { event, data, timestamp: new Date().toISOString() });
  }
}
