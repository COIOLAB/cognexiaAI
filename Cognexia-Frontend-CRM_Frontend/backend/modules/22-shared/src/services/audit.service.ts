import { Injectable, Logger } from '@nestjs/common';
import { UUID } from 'crypto';

export interface AuditEntry {
  id?: UUID;
  entityType: string;
  entityId: string | UUID;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'LOGIN' | 'LOGOUT' | 'AUTONOMOUS_OPTIMIZE' | 'QUANTUM_ANALYSIS' | 'AI_RECOMMENDATION';
  userId: UUID | string; // Allow string for system users like 'quantum-ai-system'
  organizationId?: UUID;
  changes?: any;
  previousData?: any;
  metadata?: Record<string, any>;
  timestamp?: Date;
  ipAddress?: string;
  userAgent?: string;
  quantumSignature?: string; // Support quantum signatures for advanced audit trails
}

export interface AuditServiceInterface {
  log(entry: AuditEntry): Promise<void>;
  getAuditLog(entityType: string, entityId: string | UUID, limit?: number): Promise<AuditEntry[]>;
  getUserActivity(userId: UUID, limit?: number): Promise<AuditEntry[]>;
  getOrganizationActivity(organizationId: UUID, limit?: number): Promise<AuditEntry[]>;
}

@Injectable()
export class AuditService implements AuditServiceInterface {
  private readonly logger = new Logger(AuditService.name);
  private auditLog = new Map<string, AuditEntry[]>();

  async log(entry: AuditEntry): Promise<void> {
    try {
      const auditEntry: AuditEntry = {
        ...entry,
        id: crypto.randomUUID() as UUID,
        timestamp: new Date()
      };

      // Create composite key for entity audit trail
      const entityKey = `${entry.entityType}:${entry.entityId}`;
      
      if (!this.auditLog.has(entityKey)) {
        this.auditLog.set(entityKey, []);
      }
      
      const entityAudit = this.auditLog.get(entityKey)!;
      entityAudit.push(auditEntry);
      
      // Keep only the last 100 entries per entity
      if (entityAudit.length > 100) {
        entityAudit.shift();
      }

      // Also store user activity
      const userKey = `user:${entry.userId}`;
      if (!this.auditLog.has(userKey)) {
        this.auditLog.set(userKey, []);
      }
      
      const userAudit = this.auditLog.get(userKey)!;
      userAudit.push(auditEntry);
      
      // Keep only the last 1000 entries per user
      if (userAudit.length > 1000) {
        userAudit.shift();
      }

      // Store organization activity if provided
      if (entry.organizationId) {
        const orgKey = `org:${entry.organizationId}`;
        if (!this.auditLog.has(orgKey)) {
          this.auditLog.set(orgKey, []);
        }
        
        const orgAudit = this.auditLog.get(orgKey)!;
        orgAudit.push(auditEntry);
        
        // Keep only the last 10000 entries per organization
        if (orgAudit.length > 10000) {
          orgAudit.shift();
        }
      }

      this.logger.log(`Audit: ${entry.action} ${entry.entityType}:${entry.entityId} by user:${entry.userId}`);
    } catch (error) {
      this.logger.error(`Failed to log audit entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAuditLog(entityType: string, entityId: string | UUID, limit: number = 50): Promise<AuditEntry[]> {
    const key = `${entityType}:${entityId}`;
    const entries = this.auditLog.get(key) || [];
    
    return entries
      .slice(-limit) // Get last N entries
      .reverse(); // Most recent first
  }

  async getUserActivity(userId: UUID, limit: number = 100): Promise<AuditEntry[]> {
    const key = `user:${userId}`;
    const entries = this.auditLog.get(key) || [];
    
    return entries
      .slice(-limit)
      .reverse();
  }

  async getOrganizationActivity(organizationId: UUID, limit: number = 500): Promise<AuditEntry[]> {
    const key = `org:${organizationId}`;
    const entries = this.auditLog.get(key) || [];
    
    return entries
      .slice(-limit)
      .reverse();
  }

  // Get activity within date range
  async getActivityByDateRange(
    startDate: Date,
    endDate: Date,
    entityType?: string,
    userId?: UUID,
    organizationId?: UUID
  ): Promise<AuditEntry[]> {
    const allEntries: AuditEntry[] = [];
    
    for (const [key, entries] of this.auditLog.entries()) {
      if (userId && key !== `user:${userId}`) continue;
      if (organizationId && key !== `org:${organizationId}`) continue;
      if (entityType && !key.startsWith(entityType + ':')) continue;
      
      const filteredEntries = entries.filter(entry => {
        const timestamp = entry.timestamp || new Date();
        return timestamp >= startDate && timestamp <= endDate;
      });
      
      allEntries.push(...filteredEntries);
    }
    
    return allEntries
      .sort((a, b) => {
        const timeA = a.timestamp?.getTime() || 0;
        const timeB = b.timestamp?.getTime() || 0;
        return timeB - timeA; // Most recent first
      });
  }

  // Get statistics for reporting
  async getAuditStatistics(organizationId?: UUID): Promise<{
    totalEntries: number;
    entriesByAction: Record<string, number>;
    entriesByEntityType: Record<string, number>;
    activeUsers: number;
    lastActivity: Date | null;
  }> {
    let totalEntries = 0;
    const entriesByAction: Record<string, number> = {};
    const entriesByEntityType: Record<string, number> = {};
    const activeUsers = new Set<string>();
    let lastActivity: Date | null = null;

    for (const [key, entries] of this.auditLog.entries()) {
      // Filter by organization if specified
      const filteredEntries = organizationId 
        ? entries.filter(e => e.organizationId === organizationId)
        : entries;

      totalEntries += filteredEntries.length;

      for (const entry of filteredEntries) {
        // Count by action
        entriesByAction[entry.action] = (entriesByAction[entry.action] || 0) + 1;
        
        // Count by entity type
        entriesByEntityType[entry.entityType] = (entriesByEntityType[entry.entityType] || 0) + 1;
        
        // Track active users
        activeUsers.add(entry.userId);
        
        // Track last activity
        if (entry.timestamp && (!lastActivity || entry.timestamp > lastActivity)) {
          lastActivity = entry.timestamp;
        }
      }
    }

    return {
      totalEntries,
      entriesByAction,
      entriesByEntityType,
      activeUsers: activeUsers.size,
      lastActivity
    };
  }
}
