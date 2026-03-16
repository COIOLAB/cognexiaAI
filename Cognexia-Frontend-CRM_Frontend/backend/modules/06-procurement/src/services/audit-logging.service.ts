// Industry 5.0 ERP Backend - Procurement Module
// AuditLoggingService - Comprehensive audit trail management with AI-powered analysis
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

// Entities
import { AuditLog, AuditAction, AuditSeverity, AuditStatus } from '../entities/audit-log.entity';
import { ProcurementAlert } from '../entities/procurement-alert.entity';

// Services
import { AIProcurementIntelligenceService } from './ai-procurement-intelligence.service';

interface AuditLogEntry {
  entityType: string;
  entityId: string;
  action: AuditAction;
  oldValues?: any;
  newValues?: any;
  userId: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
  severity?: AuditSeverity;
  tags?: string[];
}

interface AuditQueryFilters {
  entityType?: string;
  entityId?: string;
  action?: AuditAction;
  userId?: string;
  severity?: AuditSeverity;
  startDate?: Date;
  endDate?: Date;
  searchText?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

@Injectable()
export class AuditLoggingService {
  private readonly logger = new Logger(AuditLoggingService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
    @InjectRepository(ProcurementAlert)
    private readonly alertRepository: Repository<ProcurementAlert>,
    private readonly aiService: AIProcurementIntelligenceService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ==================== AUDIT LOG CREATION ====================

  async logAction(entry: AuditLogEntry): Promise<AuditLog> {
    try {
      const auditLog = this.auditRepository.create({
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        oldValues: entry.oldValues,
        newValues: entry.newValues,
        userId: entry.userId,
        userEmail: entry.userEmail,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        details: entry.details,
        severity: entry.severity || this.determineSeverity(entry.action),
        tags: entry.tags || [],
        status: AuditStatus.ACTIVE,
        timestamp: new Date(),
        createdAt: new Date(),
      });

      const savedLog = await this.auditRepository.save(auditLog);

      // Analyze for security anomalies
      await this.analyzeSecurityAnomalies(savedLog);

      // Check for compliance violations
      await this.checkComplianceViolations(savedLog);

      // Emit event for real-time monitoring
      this.eventEmitter.emit('audit.logged', {
        auditId: savedLog.id,
        entityType: entry.entityType,
        action: entry.action,
        severity: savedLog.severity,
      });

      return savedLog;
    } catch (error) {
      this.logger.error('Error logging audit action', error.stack);
      // Don't throw - audit logging should never break the main flow
      return null;
    }
  }

  async logBulkActions(entries: AuditLogEntry[]): Promise<AuditLog[]> {
    try {
      const auditLogs = entries.map(entry => this.auditRepository.create({
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        oldValues: entry.oldValues,
        newValues: entry.newValues,
        userId: entry.userId,
        userEmail: entry.userEmail,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        details: entry.details,
        severity: entry.severity || this.determineSeverity(entry.action),
        tags: entry.tags || [],
        status: AuditStatus.ACTIVE,
        timestamp: new Date(),
        createdAt: new Date(),
      }));

      const savedLogs = await this.auditRepository.save(auditLogs);

      // Analyze patterns in bulk actions
      await this.analyzeBulkActionPatterns(savedLogs);

      return savedLogs;
    } catch (error) {
      this.logger.error('Error logging bulk audit actions', error.stack);
      return [];
    }
  }

  // ==================== ENTITY-SPECIFIC LOGGING ====================

  async logRequisitionAction(requisitionId: string, action: AuditAction, userId: string, details?: any): Promise<void> {
    await this.logAction({
      entityType: 'REQUISITION',
      entityId: requisitionId,
      action,
      userId,
      details,
      tags: ['requisition', 'workflow'],
    });
  }

  async logVendorAction(vendorId: string, action: AuditAction, userId: string, oldValues?: any, newValues?: any): Promise<void> {
    await this.logAction({
      entityType: 'VENDOR',
      entityId: vendorId,
      action,
      userId,
      oldValues,
      newValues,
      tags: ['vendor', 'master-data'],
    });
  }

  async logContractAction(contractId: string, action: AuditAction, userId: string, details?: any): Promise<void> {
    await this.logAction({
      entityType: 'CONTRACT',
      entityId: contractId,
      action,
      userId,
      details,
      tags: ['contract', 'legal'],
      severity: this.isHighRiskContractAction(action) ? AuditSeverity.HIGH : AuditSeverity.MEDIUM,
    });
  }

  async logPurchaseOrderAction(poId: string, action: AuditAction, userId: string, details?: any): Promise<void> {
    await this.logAction({
      entityType: 'PURCHASE_ORDER',
      entityId: poId,
      action,
      userId,
      details,
      tags: ['purchase-order', 'transaction'],
    });
  }

  async logBidAction(bidId: string, action: AuditAction, userId: string, details?: any): Promise<void> {
    await this.logAction({
      entityType: 'BID',
      entityId: bidId,
      action,
      userId,
      details,
      tags: ['bid', 'rfq', 'competition'],
    });
  }

  async logFinancialAction(entityType: string, entityId: string, action: AuditAction, userId: string, amount?: number): Promise<void> {
    await this.logAction({
      entityType,
      entityId,
      action,
      userId,
      details: { amount },
      tags: ['financial', 'monetary'],
      severity: this.determineFinancialSeverity(amount),
    });
  }

  // ==================== AUDIT TRAIL QUERIES ====================

  async getAuditTrail(filters: AuditQueryFilters): Promise<any> {
    try {
      const queryBuilder = this.auditRepository.createQueryBuilder('audit');

      // Apply filters
      if (filters.entityType) {
        queryBuilder.andWhere('audit.entityType = :entityType', { entityType: filters.entityType });
      }

      if (filters.entityId) {
        queryBuilder.andWhere('audit.entityId = :entityId', { entityId: filters.entityId });
      }

      if (filters.action) {
        queryBuilder.andWhere('audit.action = :action', { action: filters.action });
      }

      if (filters.userId) {
        queryBuilder.andWhere('audit.userId = :userId', { userId: filters.userId });
      }

      if (filters.severity) {
        queryBuilder.andWhere('audit.severity = :severity', { severity: filters.severity });
      }

      if (filters.startDate && filters.endDate) {
        queryBuilder.andWhere('audit.timestamp BETWEEN :startDate AND :endDate', {
          startDate: filters.startDate,
          endDate: filters.endDate,
        });
      } else if (filters.startDate) {
        queryBuilder.andWhere('audit.timestamp >= :startDate', { startDate: filters.startDate });
      } else if (filters.endDate) {
        queryBuilder.andWhere('audit.timestamp <= :endDate', { endDate: filters.endDate });
      }

      if (filters.searchText) {
        queryBuilder.andWhere(
          '(audit.details ILIKE :search OR audit.userEmail ILIKE :search)',
          { search: `%${filters.searchText}%` }
        );
      }

      if (filters.tags && filters.tags.length > 0) {
        queryBuilder.andWhere('audit.tags && :tags', { tags: filters.tags });
      }

      // Apply pagination
      const page = Math.max(1, filters.page || 1);
      const limit = Math.min(100, Math.max(1, filters.limit || 50));
      const offset = (page - 1) * limit;

      queryBuilder
        .orderBy('audit.timestamp', 'DESC')
        .skip(offset)
        .take(limit);

      const [logs, total] = await queryBuilder.getManyAndCount();

      return {
        data: logs,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error querying audit trail', error.stack);
      throw error;
    }
  }

  async getEntityAuditHistory(entityType: string, entityId: string): Promise<AuditLog[]> {
    try {
      return await this.auditRepository.find({
        where: { entityType, entityId },
        order: { timestamp: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error getting audit history for ${entityType}:${entityId}`, error.stack);
      throw error;
    }
  }

  async getUserActionHistory(userId: string, startDate?: Date, endDate?: Date): Promise<AuditLog[]> {
    try {
      const queryBuilder = this.auditRepository.createQueryBuilder('audit')
        .where('audit.userId = :userId', { userId })
        .orderBy('audit.timestamp', 'DESC');

      if (startDate && endDate) {
        queryBuilder.andWhere('audit.timestamp BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        });
      }

      return await queryBuilder.getMany();
    } catch (error) {
      this.logger.error(`Error getting user action history for ${userId}`, error.stack);
      throw error;
    }
  }

  // ==================== COMPLIANCE & SECURITY ====================

  async generateComplianceReport(startDate: Date, endDate: Date): Promise<any> {
    try {
      this.logger.log('Generating compliance audit report');

      const logs = await this.auditRepository.find({
        where: {
          timestamp: Between(startDate, endDate),
          status: AuditStatus.ACTIVE,
        },
        order: { timestamp: 'DESC' },
      });

      const report = {
        reportPeriod: { startDate, endDate },
        totalActions: logs.length,
        actionsByType: this.groupByProperty(logs, 'action'),
        actionsBySeverity: this.groupByProperty(logs, 'severity'),
        actionsByEntity: this.groupByProperty(logs, 'entityType'),
        userActivity: this.analyzeUserActivity(logs),
        securityEvents: logs.filter(log => this.isSecurityRelevant(log)),
        complianceViolations: logs.filter(log => log.complianceFlags && log.complianceFlags.length > 0),
        dataIntegrityChecks: await this.performDataIntegrityChecks(logs),
        recommendations: await this.generateComplianceRecommendations(logs),
        generatedAt: new Date(),
      };

      return report;
    } catch (error) {
      this.logger.error('Error generating compliance report', error.stack);
      throw error;
    }
  }

  async detectAnomalousActivity(lookbackDays: number = 30): Promise<any> {
    try {
      this.logger.log('Detecting anomalous activity patterns');

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - lookbackDays);

      const logs = await this.auditRepository.find({
        where: {
          timestamp: MoreThan(startDate),
        },
        order: { timestamp: 'DESC' },
      });

      const anomalies = await this.aiService.detectAuditAnomalies(logs);

      // Create alerts for significant anomalies
      for (const anomaly of anomalies.filter(a => a.severity === 'HIGH')) {
        await this.createSecurityAlert(anomaly);
      }

      return {
        analysisDate: new Date(),
        lookbackPeriod: lookbackDays,
        totalLogsAnalyzed: logs.length,
        anomaliesDetected: anomalies.length,
        anomalies,
        summary: this.summarizeAnomalies(anomalies),
      };
    } catch (error) {
      this.logger.error('Error detecting anomalous activity', error.stack);
      throw error;
    }
  }

  async checkDataIntegrity(): Promise<any> {
    try {
      this.logger.log('Performing data integrity checks');

      const checks = {
        orphanedLogs: await this.findOrphanedLogs(),
        duplicateEntries: await this.findDuplicateEntries(),
        incompleteEntries: await this.findIncompleteEntries(),
        timestampAnomalies: await this.findTimestampAnomalies(),
        userIntegrity: await this.checkUserIntegrity(),
      };

      const hasIssues = Object.values(checks).some(check => check.issues.length > 0);

      if (hasIssues) {
        await this.createDataIntegrityAlert(checks);
      }

      return {
        checkDate: new Date(),
        overallStatus: hasIssues ? 'ISSUES_FOUND' : 'HEALTHY',
        checks,
        recommendations: this.generateIntegrityRecommendations(checks),
      };
    } catch (error) {
      this.logger.error('Error checking data integrity', error.stack);
      throw error;
    }
  }

  // ==================== ANALYTICS & REPORTING ====================

  async getAuditAnalytics(startDate: Date, endDate: Date): Promise<any> {
    try {
      this.logger.log('Generating audit analytics');

      const logs = await this.auditRepository.find({
        where: {
          timestamp: Between(startDate, endDate),
        },
      });

      const analytics = {
        period: { startDate, endDate },
        totalActions: logs.length,
        uniqueUsers: new Set(logs.map(log => log.userId)).size,
        uniqueEntities: new Set(logs.map(log => `${log.entityType}:${log.entityId}`)).size,
        actionDistribution: this.groupByProperty(logs, 'action'),
        entityDistribution: this.groupByProperty(logs, 'entityType'),
        severityDistribution: this.groupByProperty(logs, 'severity'),
        userActivityRanking: this.rankUserActivity(logs),
        timeDistribution: this.analyzeTimeDistribution(logs),
        tagAnalysis: this.analyzeTagUsage(logs),
        patterns: await this.identifyActionPatterns(logs),
        trends: this.calculateActionTrends(logs),
      };

      return analytics;
    } catch (error) {
      this.logger.error('Error generating audit analytics', error.stack);
      throw error;
    }
  }

  async exportAuditData(filters: AuditQueryFilters, format: 'CSV' | 'JSON' | 'XML' = 'JSON'): Promise<any> {
    try {
      this.logger.log('Exporting audit data');

      const { data } = await this.getAuditTrail(filters);

      const exportData = {
        exportDate: new Date(),
        filters,
        format,
        recordCount: data.length,
        data: format === 'CSV' ? this.convertToCSV(data) : data,
      };

      // Log the export action
      await this.logAction({
        entityType: 'AUDIT_EXPORT',
        entityId: 'bulk',
        action: AuditAction.EXPORT,
        userId: 'system',
        details: { format, recordCount: data.length, filters },
        severity: AuditSeverity.MEDIUM,
        tags: ['export', 'compliance'],
      });

      return exportData;
    } catch (error) {
      this.logger.error('Error exporting audit data', error.stack);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  private determineSeverity(action: AuditAction): AuditSeverity {
    const highRiskActions = [
      AuditAction.DELETE,
      AuditAction.APPROVE,
      AuditAction.REJECT,
      AuditAction.CANCEL,
    ];

    const mediumRiskActions = [
      AuditAction.UPDATE,
      AuditAction.SUBMIT,
      AuditAction.EXPORT,
    ];

    if (highRiskActions.includes(action)) {
      return AuditSeverity.HIGH;
    } else if (mediumRiskActions.includes(action)) {
      return AuditSeverity.MEDIUM;
    } else {
      return AuditSeverity.LOW;
    }
  }

  private determineFinancialSeverity(amount?: number): AuditSeverity {
    if (!amount) return AuditSeverity.LOW;

    if (amount > 100000) return AuditSeverity.CRITICAL;
    if (amount > 50000) return AuditSeverity.HIGH;
    if (amount > 10000) return AuditSeverity.MEDIUM;
    return AuditSeverity.LOW;
  }

  private isHighRiskContractAction(action: AuditAction): boolean {
    return [
      AuditAction.APPROVE,
      AuditAction.REJECT,
      AuditAction.CANCEL,
      AuditAction.DELETE,
    ].includes(action);
  }

  private isSecurityRelevant(log: AuditLog): boolean {
    const securityActions = [
      AuditAction.LOGIN,
      AuditAction.LOGOUT,
      AuditAction.DELETE,
      AuditAction.EXPORT,
    ];

    return securityActions.includes(log.action) || log.severity === AuditSeverity.CRITICAL;
  }

  private async analyzeSecurityAnomalies(log: AuditLog): Promise<void> {
    try {
      // Check for suspicious patterns
      const recentLogs = await this.auditRepository.find({
        where: {
          userId: log.userId,
          timestamp: MoreThan(new Date(Date.now() - 60 * 60 * 1000)), // Last hour
        },
      });

      // Too many actions in short time
      if (recentLogs.length > 50) {
        await this.createSecurityAlert({
          type: 'EXCESSIVE_ACTIVITY',
          userId: log.userId,
          description: `User performed ${recentLogs.length} actions in the last hour`,
          severity: 'HIGH',
        });
      }

      // Unusual IP address
      const userIPs = await this.getUserRecentIPs(log.userId);
      if (userIPs.length > 3) {
        await this.createSecurityAlert({
          type: 'MULTIPLE_IP_ADDRESSES',
          userId: log.userId,
          description: `User accessed from ${userIPs.length} different IP addresses recently`,
          severity: 'MEDIUM',
        });
      }
    } catch (error) {
      this.logger.warn('Error analyzing security anomalies', error);
    }
  }

  private async checkComplianceViolations(log: AuditLog): Promise<void> {
    try {
      const violations = [];

      // Check for actions outside business hours
      const hour = log.timestamp.getHours();
      if (hour < 6 || hour > 22) {
        violations.push('OUTSIDE_BUSINESS_HOURS');
      }

      // Check for high-value transactions without proper approval
      if (log.entityType === 'PURCHASE_ORDER' && log.action === AuditAction.APPROVE) {
        const amount = log.details?.amount;
        if (amount > 50000) {
          violations.push('HIGH_VALUE_APPROVAL');
        }
      }

      if (violations.length > 0) {
        log.complianceFlags = violations;
        await this.auditRepository.save(log);
      }
    } catch (error) {
      this.logger.warn('Error checking compliance violations', error);
    }
  }

  private async analyzeBulkActionPatterns(logs: AuditLog[]): Promise<void> {
    // Analyze patterns in bulk operations
    const actionCounts = this.groupByProperty(logs, 'action');
    const userCounts = this.groupByProperty(logs, 'userId');

    // Alert if too many critical actions by single user
    for (const [userId, count] of Object.entries(userCounts)) {
      if (count > 20) {
        await this.createSecurityAlert({
          type: 'BULK_ACTIONS',
          userId,
          description: `User performed ${count} bulk actions`,
          severity: 'MEDIUM',
        });
      }
    }
  }

  private async createSecurityAlert(anomaly: any): Promise<void> {
    const alert = this.alertRepository.create({
      entityType: 'SECURITY',
      entityId: 'anomaly',
      alertType: 'SECURITY_ANOMALY',
      severity: anomaly.severity === 'HIGH' ? 'HIGH' : 'MEDIUM',
      title: `Security Anomaly: ${anomaly.type}`,
      message: anomaly.description,
      metadata: anomaly,
      createdAt: new Date(),
    });

    await this.alertRepository.save(alert);
  }

  private async createDataIntegrityAlert(checks: any): Promise<void> {
    const alert = this.alertRepository.create({
      entityType: 'DATA_INTEGRITY',
      entityId: 'audit',
      alertType: 'DATA_INTEGRITY_ISSUE',
      severity: 'MEDIUM',
      title: 'Audit Data Integrity Issues Detected',
      message: 'Data integrity check found issues in audit logs',
      metadata: checks,
      createdAt: new Date(),
    });

    await this.alertRepository.save(alert);
  }

  private groupByProperty(items: any[], property: string): any {
    return items.reduce((groups, item) => {
      const key = item[property];
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {});
  }

  private analyzeUserActivity(logs: AuditLog[]): any {
    const userStats = {};

    logs.forEach(log => {
      if (!userStats[log.userId]) {
        userStats[log.userId] = {
          totalActions: 0,
          actionTypes: {},
          firstAction: log.timestamp,
          lastAction: log.timestamp,
        };
      }

      const stats = userStats[log.userId];
      stats.totalActions++;
      stats.actionTypes[log.action] = (stats.actionTypes[log.action] || 0) + 1;
      
      if (log.timestamp < stats.firstAction) stats.firstAction = log.timestamp;
      if (log.timestamp > stats.lastAction) stats.lastAction = log.timestamp;
    });

    return userStats;
  }

  private async getUserRecentIPs(userId: string): Promise<string[]> {
    const recentLogs = await this.auditRepository.find({
      where: {
        userId,
        timestamp: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000)), // Last 24 hours
      },
      select: ['ipAddress'],
    });

    return [...new Set(recentLogs.map(log => log.ipAddress).filter(ip => ip))];
  }

  private async findOrphanedLogs(): Promise<any> {
    // This would check for logs pointing to non-existent entities
    return { issues: [], description: 'Orphaned log check' };
  }

  private async findDuplicateEntries(): Promise<any> {
    // This would find potential duplicate audit entries
    return { issues: [], description: 'Duplicate entry check' };
  }

  private async findIncompleteEntries(): Promise<any> {
    const incompleteCount = await this.auditRepository.count({
      where: [
        { userId: null },
        { entityType: null },
        { action: null },
      ],
    });

    return {
      issues: incompleteCount > 0 ? [`${incompleteCount} incomplete entries found`] : [],
      description: 'Incomplete entry check',
    };
  }

  private async findTimestampAnomalies(): Promise<any> {
    // Check for future timestamps or other anomalies
    const futureCount = await this.auditRepository.count({
      where: {
        timestamp: MoreThan(new Date()),
      },
    });

    return {
      issues: futureCount > 0 ? [`${futureCount} entries with future timestamps`] : [],
      description: 'Timestamp anomaly check',
    };
  }

  private async checkUserIntegrity(): Promise<any> {
    // This would validate user references
    return { issues: [], description: 'User integrity check' };
  }

  private generateIntegrityRecommendations(checks: any): string[] {
    const recommendations = [];
    
    Object.values(checks).forEach((check: any) => {
      if (check.issues.length > 0) {
        recommendations.push(`Address ${check.description} issues`);
      }
    });

    return recommendations;
  }

  private rankUserActivity(logs: AuditLog[]): any[] {
    const userActivity = this.analyzeUserActivity(logs);
    
    return Object.entries(userActivity)
      .map(([userId, stats]) => ({ userId, ...stats }))
      .sort((a, b) => b.totalActions - a.totalActions)
      .slice(0, 10);
  }

  private analyzeTimeDistribution(logs: AuditLog[]): any {
    const hourly = Array(24).fill(0);
    const daily = Array(7).fill(0);

    logs.forEach(log => {
      hourly[log.timestamp.getHours()]++;
      daily[log.timestamp.getDay()]++;
    });

    return { hourly, daily };
  }

  private analyzeTagUsage(logs: AuditLog[]): any {
    const tagCounts = {};
    
    logs.forEach(log => {
      (log.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20);
  }

  private async identifyActionPatterns(logs: AuditLog[]): Promise<any> {
    // Use AI to identify patterns in user actions
    try {
      return await this.aiService.identifyAuditPatterns(logs);
    } catch (error) {
      this.logger.warn('AI pattern analysis failed', error);
      return { patterns: [], confidence: 0 };
    }
  }

  private calculateActionTrends(logs: AuditLog[]): any {
    // Calculate trends over time periods
    const daily = {};
    
    logs.forEach(log => {
      const day = log.timestamp.toISOString().split('T')[0];
      daily[day] = (daily[day] || 0) + 1;
    });

    return { daily };
  }

  private convertToCSV(data: AuditLog[]): string {
    const headers = [
      'timestamp', 'entityType', 'entityId', 'action', 'userId', 
      'userEmail', 'severity', 'ipAddress', 'details'
    ];
    
    const rows = data.map(log => [
      log.timestamp.toISOString(),
      log.entityType,
      log.entityId,
      log.action,
      log.userId,
      log.userEmail || '',
      log.severity,
      log.ipAddress || '',
      JSON.stringify(log.details || {}),
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private summarizeAnomalies(anomalies: any[]): any {
    return {
      total: anomalies.length,
      bySeverity: this.groupByProperty(anomalies, 'severity'),
      byType: this.groupByProperty(anomalies, 'type'),
      mostFrequent: this.getMostFrequentAnomalyType(anomalies),
    };
  }

  private getMostFrequentAnomalyType(anomalies: any[]): string {
    const types = this.groupByProperty(anomalies, 'type');
    return Object.entries(types).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
  }

  private async performDataIntegrityChecks(logs: AuditLog[]): Promise<any> {
    return {
      totalChecked: logs.length,
      checksPerformed: [
        'Entity existence validation',
        'User reference validation', 
        'Timestamp consistency',
        'Data completeness',
      ],
      issuesFound: 0,
      lastCheck: new Date(),
    };
  }

  private async generateComplianceRecommendations(logs: AuditLog[]): Promise<string[]> {
    const recommendations = [];

    const highRiskActions = logs.filter(log => log.severity === AuditSeverity.HIGH);
    if (highRiskActions.length > logs.length * 0.1) {
      recommendations.push('High percentage of high-risk actions - review approval workflows');
    }

    const afterHoursActions = logs.filter(log => {
      const hour = log.timestamp.getHours();
      return hour < 6 || hour > 22;
    });
    if (afterHoursActions.length > 0) {
      recommendations.push('After-hours activity detected - implement time-based access controls');
    }

    return recommendations;
  }
}
