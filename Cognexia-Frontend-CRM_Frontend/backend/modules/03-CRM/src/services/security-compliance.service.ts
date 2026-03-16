import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { SecurityEvent, SecurityEventType, SecuritySeverity } from '../entities/security-event.entity';
import { ComplianceCheck, ComplianceStandard, ComplianceStatus } from '../entities/compliance-check.entity';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import {
  GetSecurityEventsDto,
  SecurityDashboardDto,
  ResolveSecurityEventDto,
  IPBlocklistDto,
  ComplianceReportDto,
  RunComplianceCheckDto,
  TwoFactorStatusDto,
} from '../dto/security-compliance.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SecurityComplianceService {
  private readonly logger = new Logger(SecurityComplianceService.name);
  private ipBlocklist: Map<string, { reason: string; expiresAt?: Date }> = new Map();

  constructor(
    @InjectRepository(SecurityEvent)
    private securityEventRepository: Repository<SecurityEvent>,
    @InjectRepository(ComplianceCheck)
    private complianceRepository: Repository<ComplianceCheck>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getSecurityDashboard(): Promise<SecurityDashboardDto> {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentEvents = await this.securityEventRepository.find({
      where: {
        createdAt: Between(last30Days, now),
      },
      relations: ['organization'],
      order: { createdAt: 'DESC' },
    });

    const totalEvents = recentEvents.length;
    const criticalEvents = recentEvents.filter(e => e.severity === SecuritySeverity.CRITICAL).length;
    const unresolvedEvents = recentEvents.filter(e => !e.resolved).length;
    const failedLoginAttempts = recentEvents.filter(e => e.eventType === SecurityEventType.FAILED_LOGIN).length;
    const blockedIPs = this.ipBlocklist.size;

    const eventsBySeverity = {
      low: recentEvents.filter(e => e.severity === SecuritySeverity.LOW).length,
      medium: recentEvents.filter(e => e.severity === SecuritySeverity.MEDIUM).length,
      high: recentEvents.filter(e => e.severity === SecuritySeverity.HIGH).length,
      critical: criticalEvents,
    };

    const recentTop10 = recentEvents.slice(0, 10).map(e => ({
      id: e.id,
      eventType: e.eventType,
      severity: e.severity,
      description: e.description,
      createdAt: e.createdAt,
    }));

    // Count events by type
    const threatCounts = new Map<string, number>();
    recentEvents.forEach(e => {
      threatCounts.set(e.eventType, (threatCounts.get(e.eventType) || 0) + 1);
    });

    const topThreats = Array.from(threatCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalEvents,
      criticalEvents,
      unresolvedEvents,
      failedLoginAttempts,
      blockedIPs,
      eventsBySeverity,
      recentEvents: recentTop10,
      topThreats,
    };
  }

  async getSecurityEvents(query: GetSecurityEventsDto): Promise<SecurityEvent[]> {
    const where: any = {};

    if (query.eventType) {
      where.eventType = query.eventType;
    }

    if (query.severity) {
      where.severity = query.severity;
    }

    if (query.organizationId) {
      where.organizationId = query.organizationId;
    }

    if (query.resolved !== undefined) {
      where.resolved = query.resolved;
    }

    if (query.startDate && query.endDate) {
      where.createdAt = Between(new Date(query.startDate), new Date(query.endDate));
    }

    return this.securityEventRepository.find({
      where,
      relations: ['organization', 'user'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async logSecurityEvent(
    eventType: SecurityEventType,
    severity: SecuritySeverity,
    description: string,
    details: {
      organizationId?: string;
      userId?: string;
      ipAddress: string;
      userAgent?: string;
      details?: Record<string, any>;
    }
  ): Promise<SecurityEvent> {
    const event = this.securityEventRepository.create({
      eventType,
      severity,
      description,
      organizationId: details.organizationId,
      userId: details.userId,
      ipAddress: details.ipAddress,
      userAgent: details.userAgent,
      details: details.details || {},
      resolved: false,
    });

    const saved = await this.securityEventRepository.save(event);

    // Auto-block IP if critical event
    if (severity === SecuritySeverity.CRITICAL) {
      this.blockIP({
        ipAddress: details.ipAddress,
        reason: `Auto-blocked due to critical security event: ${eventType}`,
      });
    }

    this.logger.warn(`Security event logged: ${eventType} (${severity}) - ${description}`);

    return saved;
  }

  async resolveSecurityEvent(dto: ResolveSecurityEventDto, resolvedBy: string): Promise<SecurityEvent> {
    const event = await this.securityEventRepository.findOne({
      where: { id: dto.eventId },
    });

    if (!event) {
      throw new Error('Security event not found');
    }

    event.resolved = true;
    event.resolvedAt = new Date();
    event.resolvedBy = resolvedBy;
    event.resolutionNotes = dto.resolutionNotes;

    return this.securityEventRepository.save(event);
  }

  blockIP(dto: IPBlocklistDto): void {
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : undefined;
    this.ipBlocklist.set(dto.ipAddress, {
      reason: dto.reason,
      expiresAt,
    });

    this.logger.log(`IP blocked: ${dto.ipAddress} - ${dto.reason}`);
  }

  unblockIP(ipAddress: string): void {
    this.ipBlocklist.delete(ipAddress);
    this.logger.log(`IP unblocked: ${ipAddress}`);
  }

  isIPBlocked(ipAddress: string): boolean {
    const block = this.ipBlocklist.get(ipAddress);
    if (!block) return false;

    if (block.expiresAt && block.expiresAt < new Date()) {
      this.ipBlocklist.delete(ipAddress);
      return false;
    }

    return true;
  }

  getBlockedIPs(): Array<{ ipAddress: string; reason: string; expiresAt?: Date }> {
    return Array.from(this.ipBlocklist.entries()).map(([ipAddress, data]) => ({
      ipAddress,
      ...data,
    }));
  }

  async getComplianceReport(organizationId?: string): Promise<ComplianceReportDto[]> {
    const organizations = organizationId
      ? [await this.organizationRepository.findOne({ where: { id: organizationId } })]
      : await this.organizationRepository.find({ where: { status: 'active' as any } });

    const reports: ComplianceReportDto[] = [];

    for (const org of organizations.filter(o => o)) {
      const checks = await this.complianceRepository.find({
        where: { organizationId: org.id },
        order: { checkDate: 'DESC' },
      });

      const standards = Object.values(ComplianceStandard).map(standard => {
        const lastCheck = checks.find(c => c.standard === standard);

        return {
          standard,
          status: lastCheck?.status || ComplianceStatus.UNKNOWN,
          lastCheckDate: lastCheck?.checkDate,
          score: lastCheck
            ? (lastCheck.results.passed / lastCheck.results.total) * 100
            : 0,
          passedChecks: lastCheck?.results.passed || 0,
          totalChecks: lastCheck?.results.total || 0,
        };
      });

      const overallCompliance =
        standards.reduce((sum, s) => sum + s.score, 0) / standards.length;

      const criticalIssues = checks.reduce(
        (sum, c) => sum + (c.results?.failed || 0),
        0
      );

      reports.push({
        organizationId: org.id,
        organizationName: org.name,
        standards,
        overallCompliance: Number(overallCompliance.toFixed(2)),
        criticalIssues,
      });
    }

    return reports;
  }

  async runComplianceCheck(dto: RunComplianceCheckDto): Promise<ComplianceCheck> {
    this.logger.log(`Running compliance check: ${dto.standard}`);

    // Mock compliance check - in production, run actual compliance tests
    const mockResults = {
      passed: Math.floor(Math.random() * 30) + 50,
      failed: Math.floor(Math.random() * 10),
      warnings: Math.floor(Math.random() * 15),
      total: 80,
      details: [
        { requirement: 'Data encryption at rest', status: 'passed', notes: '' },
        { requirement: 'Access control policies', status: 'passed', notes: '' },
        { requirement: 'Audit logging enabled', status: 'warning', notes: 'Incomplete logs' },
        { requirement: 'Password policies enforced', status: 'passed', notes: '' },
        { requirement: 'Data retention policy', status: 'failed', notes: 'No policy documented' },
      ],
    };

    const check = this.complianceRepository.create({
      organizationId: dto.organizationId,
      standard: dto.standard,
      status:
        mockResults.failed > 0
          ? ComplianceStatus.NON_COMPLIANT
          : ComplianceStatus.COMPLIANT,
      checkDate: new Date(),
      results: mockResults,
      nextCheckDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    });

    return this.complianceRepository.save(check);
  }

  async getTwoFactorStatus(): Promise<TwoFactorStatusDto> {
    const totalUsers = await this.userRepository.count({ where: { isActive: true } });
    const usersWithMFA = await this.userRepository.count({
      where: { isActive: true, mfaEnabled: true } as any,
    });

    const mfaAdoptionRate = totalUsers > 0 ? (usersWithMFA / totalUsers) * 100 : 0;

    // Mock organizations mandating MFA
    const organizationsMandatingMFA = 15;

    return {
      totalUsers,
      usersWithMFA,
      mfaAdoptionRate: Number(mfaAdoptionRate.toFixed(2)),
      organizationsMandatingMFA,
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredIPBlocks() {
    const now = new Date();
    let removed = 0;

    for (const [ip, block] of this.ipBlocklist.entries()) {
      if (block.expiresAt && block.expiresAt < now) {
        this.ipBlocklist.delete(ip);
        removed++;
      }
    }

    if (removed > 0) {
      this.logger.log(`Cleaned up ${removed} expired IP blocks`);
    }
  }
}
