import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/analytics', cors: true })
export class AnalyticsWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  broadcastMetric(metric: any) {
    this.server.emit('metric:update', metric);
  }

  sendAlert(alert: any, recipients: string[]) {
    recipients.forEach(userId => {
      this.server.to(userId).emit('alert:new', alert);
    });
  }
}
