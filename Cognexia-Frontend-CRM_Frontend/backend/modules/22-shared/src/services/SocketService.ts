import { Server } from 'socket.io';
import { logger } from '../utils/logger';

export class SocketService {
  private static io: Server;

  static initialize(io: Server): void {
    this.io = io;
    
    io.on('connection', (socket) => {
      logger.info(`Socket connected: ${socket.id}`);
      
      // Handle production planning events
      socket.on('join-planning-room', (planId: string) => {
        socket.join(`plan_${planId}`);
        logger.info(`Socket ${socket.id} joined planning room: ${planId}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  static emitPlanUpdate(planId: string, data: any): void {
    if (this.io) {
      this.io.to(`plan_${planId}`).emit('plan-updated', data);
    }
  }

  static emitAlert(alert: any): void {
    if (this.io) {
      this.io.emit('production-alert', alert);
    }
  }
}
