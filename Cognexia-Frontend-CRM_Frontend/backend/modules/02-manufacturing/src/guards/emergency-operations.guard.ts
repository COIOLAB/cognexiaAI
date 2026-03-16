import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

export enum EmergencyOperationType {
  EMERGENCY_STOP = 'emergency_stop',
  SYSTEM_SHUTDOWN = 'system_shutdown',
  FIRE_SUPPRESSION = 'fire_suppression',
  GAS_LEAK_RESPONSE = 'gas_leak_response',
  EVACUATION = 'evacuation',
  CONTAINMENT = 'containment',
  SAFETY_OVERRIDE = 'safety_override',
  CRITICAL_ALARM_ACK = 'critical_alarm_ack',
  BYPASS_SAFETY = 'bypass_safety',
  FORCE_MAINTENANCE = 'force_maintenance'
}

export enum EmergencyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  CATASTROPHIC = 'catastrophic'
}

interface EmergencyConfig {
  maxEmergencyStopsPerHour: number;
  emergencyStopCooldownMs: number;
  requireDualApproval: boolean;
  allowedEmergencyRoles: string[];
  enableAuditLogging: boolean;
  enableNotifications: boolean;
  requireJustification: boolean;
  minimumJustificationLength: number;
}

interface EmergencyLog {
  timestamp: Date;
  userId: string;
  operationType: EmergencyOperationType;
  level: EmergencyLevel;
  justification?: string;
  approver?: string;
  duration?: number;
  resolved: boolean;
  resolvedAt?: Date;
  impact?: string;
}

const DEFAULT_EMERGENCY_CONFIG: EmergencyConfig = {
  maxEmergencyStopsPerHour: 3,
  emergencyStopCooldownMs: 300000, // 5 minutes
  requireDualApproval: true,
  allowedEmergencyRoles: [
    'super_admin',
    'plant_manager',
    'safety_manager',
    'production_manager',
    'maintenance_manager',
    'floor_supervisor',
    'emergency_coordinator'
  ],
  enableAuditLogging: true,
  enableNotifications: true,
  requireJustification: true,
  minimumJustificationLength: 20,
};

export const RequireEmergencyOperation = (
  operationType: EmergencyOperationType,
  level: EmergencyLevel = EmergencyLevel.HIGH
) =>
  Reflector.createDecorator<{ operationType: EmergencyOperationType; level: EmergencyLevel }>({
    operationType,
    level,
  });

@Injectable()
export class EmergencyOperationsGuard implements CanActivate {
  private readonly logger = new Logger(EmergencyOperationsGuard.name);
  private readonly config: EmergencyConfig;
  private readonly emergencyLog: Map<string, EmergencyLog[]> = new Map();
  private readonly emergencyStopLog: Map<string, number[]> = new Map();

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService
  ) {
    this.config = this.loadEmergencyConfiguration();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Check if this is an emergency operation
    const emergencyOperation = this.reflector.getAllAndOverride<{
      operationType: EmergencyOperationType;
      level: EmergencyLevel;
    }>('emergencyOperation', [context.getHandler(), context.getClass()]);

    if (!emergencyOperation) {
      return true; // Not an emergency operation, allow normal processing
    }

    const user = request['user'];
    if (!user) {
      throw new ForbiddenException('Authentication required for emergency operations');
    }

    // Validate emergency operation permissions
    await this.validateEmergencyPermissions(
      user,
      emergencyOperation.operationType,
      emergencyOperation.level
    );

    // Apply specific validation based on operation type
    await this.validateSpecificOperation(
      request,
      user,
      emergencyOperation.operationType,
      emergencyOperation.level
    );

    // Log the emergency operation
    await this.logEmergencyOperation(
      user,
      emergencyOperation.operationType,
      emergencyOperation.level,
      request
    );

    // Send notifications if enabled
    if (this.config.enableNotifications) {
      await this.sendEmergencyNotification(
        user,
        emergencyOperation.operationType,
        emergencyOperation.level
      );
    }

    this.logger.warn(
      `Emergency operation authorized: ${emergencyOperation.operationType} (${emergencyOperation.level}) by user ${user.sub}`
    );

    return true;
  }

  private async validateEmergencyPermissions(
    user: any,
    operationType: EmergencyOperationType,
    level: EmergencyLevel
  ): Promise<void> {
    // Check if user has emergency operation role
    const userRole = user.role;
    if (!this.config.allowedEmergencyRoles.includes(userRole)) {
      throw new ForbiddenException(
        `Role ${userRole} not authorized for emergency operations`
      );
    }

    // Additional permission checks based on operation type and level
    switch (operationType) {
      case EmergencyOperationType.EMERGENCY_STOP:
        // Most roles can perform emergency stops
        break;

      case EmergencyOperationType.SYSTEM_SHUTDOWN:
        if (!['super_admin', 'plant_manager', 'safety_manager'].includes(userRole)) {
          throw new ForbiddenException('Insufficient privileges for system shutdown');
        }
        break;

      case EmergencyOperationType.BYPASS_SAFETY:
        if (!['super_admin', 'safety_manager'].includes(userRole)) {
          throw new ForbiddenException('Insufficient privileges for safety bypass');
        }
        break;

      case EmergencyOperationType.FIRE_SUPPRESSION:
      case EmergencyOperationType.GAS_LEAK_RESPONSE:
      case EmergencyOperationType.EVACUATION:
        if (!['super_admin', 'plant_manager', 'safety_manager', 'emergency_coordinator'].includes(userRole)) {
          throw new ForbiddenException('Insufficient privileges for safety response operations');
        }
        break;

      default:
        // General emergency operations check
        break;
    }

    // Higher level operations require more privileges
    if (level === EmergencyLevel.CATASTROPHIC && !['super_admin', 'plant_manager'].includes(userRole)) {
      throw new ForbiddenException('Catastrophic level operations require highest privileges');
    }
  }

  private async validateSpecificOperation(
    request: Request,
    user: any,
    operationType: EmergencyOperationType,
    level: EmergencyLevel
  ): Promise<void> {
    const userId = user.sub;
    const now = Date.now();

    switch (operationType) {
      case EmergencyOperationType.EMERGENCY_STOP:
        await this.validateEmergencyStopLimits(userId, now);
        break;

      case EmergencyOperationType.BYPASS_SAFETY:
        await this.validateSafetyBypass(request, user, level);
        break;

      case EmergencyOperationType.SYSTEM_SHUTDOWN:
        await this.validateSystemShutdown(request, user, level);
        break;

      default:
        // Default validation for other operations
        await this.validateGeneralEmergencyOperation(request, user, operationType, level);
        break;
    }
  }

  private async validateEmergencyStopLimits(userId: string, now: number): Promise<void> {
    // Get user's emergency stop history for the last hour
    const userStops = this.emergencyStopLog.get(userId) || [];
    const hourAgo = now - 3600000; // 1 hour ago
    
    // Filter stops within the last hour
    const recentStops = userStops.filter(stopTime => stopTime > hourAgo);

    // Check if user exceeds maximum emergency stops per hour
    if (recentStops.length >= this.config.maxEmergencyStopsPerHour) {
      throw new ForbiddenException(
        `Maximum emergency stops per hour (${this.config.maxEmergencyStopsPerHour}) exceeded`
      );
    }

    // Check cooldown period since last emergency stop
    if (recentStops.length > 0) {
      const lastStop = Math.max(...recentStops);
      const timeSinceLastStop = now - lastStop;
      
      if (timeSinceLastStop < this.config.emergencyStopCooldownMs) {
        const remainingCooldown = Math.ceil(
          (this.config.emergencyStopCooldownMs - timeSinceLastStop) / 1000
        );
        throw new ForbiddenException(
          `Emergency stop cooldown active. Wait ${remainingCooldown} seconds`
        );
      }
    }

    // Add this emergency stop to the log
    userStops.push(now);
    this.emergencyStopLog.set(userId, userStops);
  }

  private async validateSafetyBypass(
    request: Request,
    user: any,
    level: EmergencyLevel
  ): Promise<void> {
    const body = request.body;

    // Safety bypass requires dual approval for high-level operations
    if (this.config.requireDualApproval && level >= EmergencyLevel.HIGH) {
      const approver = body.approver;
      if (!approver || approver === user.sub) {
        throw new BadRequestException('Safety bypass requires dual approval from different user');
      }

      // TODO: Validate approver permissions and authentication
      // This would typically involve checking if the approver has sufficient privileges
      // and has provided valid authentication/authorization
    }

    // Require detailed justification for safety bypasses
    if (this.config.requireJustification) {
      const justification = body.justification;
      if (!justification || justification.length < this.config.minimumJustificationLength) {
        throw new BadRequestException(
          `Safety bypass requires detailed justification (minimum ${this.config.minimumJustificationLength} characters)`
        );
      }
    }

    // Additional validation for specific safety systems
    const systemId = body.systemId;
    if (systemId && this.isCriticalSafetySystem(systemId)) {
      // Extra validation for critical safety systems
      const maintenanceWindow = body.maintenanceWindow;
      if (!maintenanceWindow || !this.isValidMaintenanceWindow(maintenanceWindow)) {
        throw new BadRequestException(
          'Critical safety system bypass requires valid maintenance window'
        );
      }
    }
  }

  private async validateSystemShutdown(
    request: Request,
    user: any,
    level: EmergencyLevel
  ): Promise<void> {
    const body = request.body;

    // System shutdown requires justification
    if (this.config.requireJustification) {
      const justification = body.justification;
      if (!justification || justification.length < this.config.minimumJustificationLength) {
        throw new BadRequestException('System shutdown requires detailed justification');
      }
    }

    // Validate shutdown scope
    const shutdownScope = body.shutdownScope;
    if (!shutdownScope) {
      throw new BadRequestException('Shutdown scope must be specified');
    }

    // Validate evacuation status for plant-wide shutdowns
    if (shutdownScope === 'plant' || shutdownScope === 'facility') {
      const evacuationConfirmed = body.evacuationConfirmed;
      if (!evacuationConfirmed) {
        throw new BadRequestException('Evacuation confirmation required for plant-wide shutdown');
      }
    }
  }

  private async validateGeneralEmergencyOperation(
    request: Request,
    user: any,
    operationType: EmergencyOperationType,
    level: EmergencyLevel
  ): Promise<void> {
    // General validation for emergency operations
    const body = request.body;

    // Require justification for medium and higher level operations
    if (this.config.requireJustification && level >= EmergencyLevel.MEDIUM) {
      const justification = body.justification;
      if (!justification || justification.length < this.config.minimumJustificationLength) {
        throw new BadRequestException(`${operationType} requires detailed justification`);
      }
    }

    // Validate emergency contact information
    const emergencyContact = body.emergencyContact;
    if (level >= EmergencyLevel.HIGH && !emergencyContact) {
      throw new BadRequestException('Emergency contact information required for high-level operations');
    }
  }

  private async logEmergencyOperation(
    user: any,
    operationType: EmergencyOperationType,
    level: EmergencyLevel,
    request: Request
  ): Promise<void> {
    if (!this.config.enableAuditLogging) {
      return;
    }

    const logEntry: EmergencyLog = {
      timestamp: new Date(),
      userId: user.sub,
      operationType,
      level,
      justification: request.body?.justification,
      approver: request.body?.approver,
      resolved: false,
    };

    const userLogs = this.emergencyLog.get(user.sub) || [];
    userLogs.push(logEntry);
    this.emergencyLog.set(user.sub, userLogs);

    // Log to system logger
    this.logger.warn(`Emergency operation logged`, {
      userId: user.sub,
      operationType,
      level,
      timestamp: logEntry.timestamp.toISOString(),
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });
  }

  private async sendEmergencyNotification(
    user: any,
    operationType: EmergencyOperationType,
    level: EmergencyLevel
  ): Promise<void> {
    // TODO: Implement emergency notification system
    // This would typically send notifications to:
    // - Plant management
    // - Safety team
    // - Emergency response team
    // - Regulatory authorities (for certain operations)
    
    this.logger.warn(`Emergency notification would be sent`, {
      userId: user.sub,
      operationType,
      level,
      timestamp: new Date().toISOString(),
    });
  }

  private isCriticalSafetySystem(systemId: string): boolean {
    // List of critical safety systems that require extra validation
    const criticalSystems = [
      'fire-suppression',
      'gas-detection',
      'emergency-ventilation',
      'safety-instrumented-system',
      'emergency-power',
      'containment-system',
    ];

    return criticalSystems.some(system => systemId.toLowerCase().includes(system));
  }

  private isValidMaintenanceWindow(maintenanceWindow: any): boolean {
    // Validate maintenance window structure and timing
    if (!maintenanceWindow || !maintenanceWindow.start || !maintenanceWindow.end) {
      return false;
    }

    const start = new Date(maintenanceWindow.start);
    const end = new Date(maintenanceWindow.end);
    const now = new Date();

    // Maintenance window should be in the future and reasonable duration
    const maxMaintenanceDuration = 24 * 60 * 60 * 1000; // 24 hours
    const duration = end.getTime() - start.getTime();

    return start > now && duration > 0 && duration <= maxMaintenanceDuration;
  }

  private loadEmergencyConfiguration(): EmergencyConfig {
    return {
      maxEmergencyStopsPerHour: this.configService.get<number>(
        'manufacturing.emergency.maxEmergencyStopsPerHour',
        DEFAULT_EMERGENCY_CONFIG.maxEmergencyStopsPerHour
      ),
      emergencyStopCooldownMs: this.configService.get<number>(
        'manufacturing.emergency.emergencyStopCooldownMs',
        DEFAULT_EMERGENCY_CONFIG.emergencyStopCooldownMs
      ),
      requireDualApproval: this.configService.get<boolean>(
        'manufacturing.emergency.requireDualApproval',
        DEFAULT_EMERGENCY_CONFIG.requireDualApproval
      ),
      allowedEmergencyRoles: this.configService.get<string[]>(
        'manufacturing.emergency.allowedEmergencyRoles',
        DEFAULT_EMERGENCY_CONFIG.allowedEmergencyRoles
      ),
      enableAuditLogging: this.configService.get<boolean>(
        'manufacturing.emergency.enableAuditLogging',
        DEFAULT_EMERGENCY_CONFIG.enableAuditLogging
      ),
      enableNotifications: this.configService.get<boolean>(
        'manufacturing.emergency.enableNotifications',
        DEFAULT_EMERGENCY_CONFIG.enableNotifications
      ),
      requireJustification: this.configService.get<boolean>(
        'manufacturing.emergency.requireJustification',
        DEFAULT_EMERGENCY_CONFIG.requireJustification
      ),
      minimumJustificationLength: this.configService.get<number>(
        'manufacturing.emergency.minimumJustificationLength',
        DEFAULT_EMERGENCY_CONFIG.minimumJustificationLength
      ),
    };
  }

  // Method to get emergency operations log for analysis
  getEmergencyLog(userId?: string): EmergencyLog[] {
    if (userId) {
      return this.emergencyLog.get(userId) || [];
    }

    // Return all emergency logs
    const allLogs: EmergencyLog[] = [];
    for (const userLogs of this.emergencyLog.values()) {
      allLogs.push(...userLogs);
    }

    return allLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Method to resolve emergency operation
  resolveEmergencyOperation(userId: string, operationType: EmergencyOperationType): boolean {
    const userLogs = this.emergencyLog.get(userId) || [];
    const openOperation = userLogs.find(
      log => log.operationType === operationType && !log.resolved
    );

    if (openOperation) {
      openOperation.resolved = true;
      openOperation.resolvedAt = new Date();
      openOperation.duration = openOperation.resolvedAt.getTime() - openOperation.timestamp.getTime();
      return true;
    }

    return false;
  }
}
