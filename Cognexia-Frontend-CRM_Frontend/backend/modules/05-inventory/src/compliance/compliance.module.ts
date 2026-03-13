import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

// Services
import { AuditLoggingService } from './audit-logging.service';
import { ComplianceMonitoringService } from './compliance-monitoring.service';

// Entities
import { InventoryItem } from '../entities/InventoryItem.entity';
import { StockMovement } from '../entities/StockMovement.entity';
import { InventoryLocation } from '../entities/InventoryLocation.entity';

@Module({
  imports: [
    ConfigModule,
    EventEmitterModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      InventoryItem,
      StockMovement,
      InventoryLocation,
    ]),
  ],
  providers: [
    AuditLoggingService,
    ComplianceMonitoringService,
    {
      provide: 'COMPLIANCE_CONFIG',
      useFactory: (configService: ConfigService) => ({
        // Audit Configuration
        audit: {
          enabled: configService.get<boolean>('AUDIT_ENABLED', true),
          level: configService.get<string>('AUDIT_LEVEL', 'comprehensive'),
          tamperProtection: configService.get<boolean>('AUDIT_TAMPER_PROTECTION', true),
          realTimeMonitoring: configService.get<boolean>('AUDIT_REAL_TIME', true),
          encryptionEnabled: configService.get<boolean>('AUDIT_ENCRYPTION', true),
          batchProcessing: {
            enabled: configService.get<boolean>('AUDIT_BATCH_ENABLED', true),
            batchSize: configService.get<number>('AUDIT_BATCH_SIZE', 100),
            flushInterval: configService.get<number>('AUDIT_FLUSH_INTERVAL', 30),
          },
          retention: {
            defaultPeriod: configService.get<number>('AUDIT_RETENTION_DAYS', 2555), // 7 years
            maxPeriod: configService.get<number>('AUDIT_MAX_RETENTION_DAYS', 3650), // 10 years
            archiveEnabled: configService.get<boolean>('AUDIT_ARCHIVE_ENABLED', true),
            archiveLocation: configService.get<string>('AUDIT_ARCHIVE_LOCATION', 's3'),
          },
          alerting: {
            enabled: configService.get<boolean>('AUDIT_ALERTING_ENABLED', true),
            criticalEvents: configService.get<string>('AUDIT_CRITICAL_EVENTS', 'security,compliance,data_breach').split(','),
            notificationChannels: configService.get<string>('AUDIT_NOTIFICATION_CHANNELS', 'email,sms,webhook').split(','),
          },
          storage: {
            primary: configService.get<string>('AUDIT_PRIMARY_STORAGE', 'database'),
            backup: configService.get<string>('AUDIT_BACKUP_STORAGE', 'file'),
            encryption: configService.get<boolean>('AUDIT_STORAGE_ENCRYPTION', true),
            compression: configService.get<boolean>('AUDIT_STORAGE_COMPRESSION', false),
            partitioning: configService.get<string>('AUDIT_PARTITIONING', 'daily'),
          },
        },

        // Compliance Frameworks
        frameworks: {
          sox: {
            enabled: configService.get<boolean>('SOX_COMPLIANCE', true),
            strictMode: configService.get<boolean>('SOX_STRICT_MODE', true),
            reportingEnabled: configService.get<boolean>('SOX_REPORTING_ENABLED', true),
            quarterlyReports: configService.get<boolean>('SOX_QUARTERLY_REPORTS', true),
            annualAssessment: configService.get<boolean>('SOX_ANNUAL_ASSESSMENT', true),
          },
          gdpr: {
            enabled: configService.get<boolean>('GDPR_COMPLIANCE', true),
            dataProcessingTracking: configService.get<boolean>('GDPR_DATA_PROCESSING_TRACKING', true),
            consentManagement: configService.get<boolean>('GDPR_CONSENT_MANAGEMENT', true),
            dataSubjectRights: configService.get<boolean>('GDPR_DATA_SUBJECT_RIGHTS', true),
            breachNotification: configService.get<boolean>('GDPR_BREACH_NOTIFICATION', true),
            dataProtectionOfficer: configService.get<string>('GDPR_DPO_CONTACT', ''),
          },
          hipaa: {
            enabled: configService.get<boolean>('HIPAA_COMPLIANCE', false),
            phiTracking: configService.get<boolean>('HIPAA_PHI_TRACKING', false),
            accessControls: configService.get<boolean>('HIPAA_ACCESS_CONTROLS', false),
            auditLogs: configService.get<boolean>('HIPAA_AUDIT_LOGS', false),
            riskAssessment: configService.get<boolean>('HIPAA_RISK_ASSESSMENT', false),
          },
          pciDss: {
            enabled: configService.get<boolean>('PCI_DSS_COMPLIANCE', false),
            cardDataTracking: configService.get<boolean>('PCI_CARD_DATA_TRACKING', false),
            networkSecurity: configService.get<boolean>('PCI_NETWORK_SECURITY', false),
            accessControls: configService.get<boolean>('PCI_ACCESS_CONTROLS', false),
            regularTesting: configService.get<boolean>('PCI_REGULAR_TESTING', false),
          },
          iso27001: {
            enabled: configService.get<boolean>('ISO27001_COMPLIANCE', true),
            informationSecurity: configService.get<boolean>('ISO27001_INFO_SECURITY', true),
            riskManagement: configService.get<boolean>('ISO27001_RISK_MANAGEMENT', true),
            continuousImprovement: configService.get<boolean>('ISO27001_CONTINUOUS_IMPROVEMENT', true),
            managementReview: configService.get<boolean>('ISO27001_MANAGEMENT_REVIEW', true),
          },
        },

        // Reporting Configuration
        reporting: {
          automated: configService.get<boolean>('AUTOMATED_REPORTING', true),
          schedules: {
            daily: configService.get<boolean>('DAILY_REPORTS', true),
            weekly: configService.get<boolean>('WEEKLY_REPORTS', true),
            monthly: configService.get<boolean>('MONTHLY_REPORTS', true),
            quarterly: configService.get<boolean>('QUARTERLY_REPORTS', true),
            annual: configService.get<boolean>('ANNUAL_REPORTS', true),
          },
          distribution: {
            email: {
              enabled: configService.get<boolean>('EMAIL_REPORTS', true),
              recipients: configService.get<string>('REPORT_EMAIL_RECIPIENTS', '').split(',').filter(Boolean),
              templates: configService.get<string>('REPORT_EMAIL_TEMPLATES', 'standard'),
            },
            dashboard: {
              enabled: configService.get<boolean>('DASHBOARD_REPORTS', true),
              realTime: configService.get<boolean>('REAL_TIME_DASHBOARD', true),
              alerts: configService.get<boolean>('DASHBOARD_ALERTS', true),
            },
            api: {
              enabled: configService.get<boolean>('API_REPORTS', true),
              webhooks: configService.get<string>('REPORT_WEBHOOKS', '').split(',').filter(Boolean),
              authentication: configService.get<boolean>('API_REPORT_AUTH', true),
            },
          },
          formats: {
            pdf: configService.get<boolean>('PDF_REPORTS', true),
            excel: configService.get<boolean>('EXCEL_REPORTS', true),
            json: configService.get<boolean>('JSON_REPORTS', true),
            xml: configService.get<boolean>('XML_REPORTS', false),
          },
        },

        // Violation Management
        violations: {
          automaticDetection: configService.get<boolean>('AUTO_VIOLATION_DETECTION', true),
          realTimeAlerting: configService.get<boolean>('REAL_TIME_VIOLATION_ALERTS', true),
          escalationEnabled: configService.get<boolean>('VIOLATION_ESCALATION', true),
          remediationTracking: configService.get<boolean>('REMEDIATION_TRACKING', true),
          workflowIntegration: configService.get<boolean>('VIOLATION_WORKFLOW_INTEGRATION', false),
          thresholds: {
            low: configService.get<number>('LOW_VIOLATION_THRESHOLD', 10),
            medium: configService.get<number>('MEDIUM_VIOLATION_THRESHOLD', 5),
            high: configService.get<number>('HIGH_VIOLATION_THRESHOLD', 2),
            critical: configService.get<number>('CRITICAL_VIOLATION_THRESHOLD', 1),
          },
        },

        // Integration Settings
        integrations: {
          siem: {
            enabled: configService.get<boolean>('SIEM_INTEGRATION', false),
            provider: configService.get<string>('SIEM_PROVIDER', ''),
            endpoint: configService.get<string>('SIEM_ENDPOINT', ''),
            authentication: configService.get<string>('SIEM_AUTH_TYPE', 'api_key'),
          },
          grc: {
            enabled: configService.get<boolean>('GRC_INTEGRATION', false),
            provider: configService.get<string>('GRC_PROVIDER', ''),
            endpoint: configService.get<string>('GRC_ENDPOINT', ''),
            syncFrequency: configService.get<string>('GRC_SYNC_FREQUENCY', 'hourly'),
          },
          ticketing: {
            enabled: configService.get<boolean>('TICKETING_INTEGRATION', false),
            provider: configService.get<string>('TICKETING_PROVIDER', 'jira'),
            endpoint: configService.get<string>('TICKETING_ENDPOINT', ''),
            autoCreateTickets: configService.get<boolean>('AUTO_CREATE_TICKETS', false),
          },
        },

        // Performance Settings
        performance: {
          caching: {
            enabled: configService.get<boolean>('COMPLIANCE_CACHING', true),
            ttl: configService.get<number>('COMPLIANCE_CACHE_TTL', 300), // 5 minutes
            maxSize: configService.get<number>('COMPLIANCE_CACHE_SIZE', 1000),
          },
          batching: {
            enabled: configService.get<boolean>('COMPLIANCE_BATCHING', true),
            batchSize: configService.get<number>('COMPLIANCE_BATCH_SIZE', 100),
            flushInterval: configService.get<number>('COMPLIANCE_FLUSH_INTERVAL', 60), // 1 minute
          },
          optimization: {
            asyncProcessing: configService.get<boolean>('ASYNC_COMPLIANCE_PROCESSING', true),
            backgroundJobs: configService.get<boolean>('BACKGROUND_COMPLIANCE_JOBS', true),
            queuePriority: configService.get<string>('COMPLIANCE_QUEUE_PRIORITY', 'high'),
          },
        },

        // Security Settings
        security: {
          dataEncryption: {
            atRest: configService.get<boolean>('COMPLIANCE_DATA_ENCRYPTION_AT_REST', true),
            inTransit: configService.get<boolean>('COMPLIANCE_DATA_ENCRYPTION_IN_TRANSIT', true),
            algorithm: configService.get<string>('COMPLIANCE_ENCRYPTION_ALGORITHM', 'AES-256-GCM'),
          },
          accessControl: {
            rbacEnabled: configService.get<boolean>('COMPLIANCE_RBAC', true),
            mfaRequired: configService.get<boolean>('COMPLIANCE_MFA_REQUIRED', true),
            sessionTimeout: configService.get<number>('COMPLIANCE_SESSION_TIMEOUT', 1800), // 30 minutes
            auditAccess: configService.get<boolean>('COMPLIANCE_AUDIT_ACCESS', true),
          },
          dataRetention: {
            enforceRetention: configService.get<boolean>('ENFORCE_DATA_RETENTION', true),
            autoArchive: configService.get<boolean>('AUTO_ARCHIVE_DATA', true),
            secureDelete: configService.get<boolean>('SECURE_DATA_DELETION', true),
            retentionPolicies: {
              audit: configService.get<number>('AUDIT_RETENTION_DAYS', 2555), // 7 years
              compliance: configService.get<number>('COMPLIANCE_RETENTION_DAYS', 2555), // 7 years
              violations: configService.get<number>('VIOLATION_RETENTION_DAYS', 3650), // 10 years
              reports: configService.get<number>('REPORT_RETENTION_DAYS', 2555), // 7 years
            },
          },
        },

        // Monitoring and Alerting
        monitoring: {
          healthChecks: {
            enabled: configService.get<boolean>('COMPLIANCE_HEALTH_CHECKS', true),
            interval: configService.get<number>('HEALTH_CHECK_INTERVAL', 60), // 1 minute
            endpoints: ['audit', 'compliance', 'reporting', 'violations'],
          },
          metrics: {
            enabled: configService.get<boolean>('COMPLIANCE_METRICS', true),
            prometheus: configService.get<boolean>('PROMETHEUS_METRICS', false),
            customMetrics: configService.get<boolean>('CUSTOM_COMPLIANCE_METRICS', true),
          },
          alerting: {
            enabled: configService.get<boolean>('COMPLIANCE_ALERTING', true),
            channels: ['email', 'slack', 'webhook'],
            thresholds: {
              complianceScore: configService.get<number>('COMPLIANCE_SCORE_THRESHOLD', 90),
              violationRate: configService.get<number>('VIOLATION_RATE_THRESHOLD', 5),
              systemHealth: configService.get<number>('SYSTEM_HEALTH_THRESHOLD', 95),
            },
          },
        },
      }),
      inject: [ConfigService],
    },
    {
      provide: 'AUDIT_EVENT_HANDLERS',
      useFactory: () => ({
        // Define event handlers for different audit events
        'inventory.item.created': 'handleInventoryItemCreated',
        'inventory.item.updated': 'handleInventoryItemUpdated',
        'inventory.item.deleted': 'handleInventoryItemDeleted',
        'inventory.movement': 'handleInventoryMovement',
        'user.login': 'handleUserLogin',
        'user.logout': 'handleUserLogout',
        'security.access_denied': 'handleSecurityAccessDenied',
        'data.export': 'handleDataExport',
        'system.configuration.changed': 'handleSystemConfigurationChanged',
        'financial.transaction': 'handleFinancialTransaction',
        'privacy.data_accessed': 'handlePrivacyDataAccessed',
        'compliance.violation': 'handleComplianceViolation',
      }),
    },
    {
      provide: 'COMPLIANCE_RULES',
      useFactory: () => ({
        // Define compliance rules for automated monitoring
        sox: [
          {
            rule: 'financial_data_access',
            description: 'Monitor access to financial data',
            trigger: 'data.access',
            conditions: ['resource.type === "financial_record"'],
            actions: ['log_audit_event', 'check_authorization'],
          },
          {
            rule: 'system_changes',
            description: 'Monitor system configuration changes',
            trigger: 'system.configuration.changed',
            conditions: ['actor.type === "user"'],
            actions: ['log_audit_event', 'require_approval'],
          },
        ],
        gdpr: [
          {
            rule: 'personal_data_processing',
            description: 'Monitor personal data processing activities',
            trigger: 'data.access',
            conditions: ['compliance.personalDataProcessed === true'],
            actions: ['log_audit_event', 'verify_legal_basis', 'track_consent'],
          },
          {
            rule: 'data_breach_detection',
            description: 'Detect potential data breaches',
            trigger: 'security.access_denied',
            conditions: ['severity === "high" || severity === "critical"'],
            actions: ['log_audit_event', 'trigger_breach_notification', 'escalate'],
          },
        ],
        iso27001: [
          {
            rule: 'information_security_events',
            description: 'Monitor information security events',
            trigger: 'security.*',
            conditions: ['result.status === "failure"'],
            actions: ['log_audit_event', 'assess_risk', 'initiate_response'],
          },
        ],
      }),
    },
  ],
  exports: [
    AuditLoggingService,
    ComplianceMonitoringService,
    'COMPLIANCE_CONFIG',
    'AUDIT_EVENT_HANDLERS',
    'COMPLIANCE_RULES',
  ],
})
export class ComplianceModule {
  constructor(
    private readonly auditService: AuditLoggingService,
    private readonly complianceService: ComplianceMonitoringService
  ) {
    this.initializeComplianceModule();
  }

  private async initializeComplianceModule(): Promise<void> {
    try {
      console.log('📋 Initializing Compliance & Audit Framework');
      
      // Perform initial compliance assessment
      await this.performInitialAssessment();
      
      console.log('✅ Compliance & Audit Framework initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Compliance Module:', error);
      throw error;
    }
  }

  private async performInitialAssessment(): Promise<void> {
    try {
      // Log module initialization
      await this.auditService.logAuditEvent({
        category: 'system',
        action: 'compliance_module_initialization',
        resource: {
          type: 'system',
          id: 'compliance_module',
          name: 'Compliance & Audit Framework',
        },
        actor: {
          type: 'system',
          id: 'system_startup',
        },
        details: {
          operation: 'execute',
          description: 'Compliance and audit framework initialization',
        },
        result: {
          status: 'success',
        },
        compliance: {
          frameworks: ['SOX', 'GDPR', 'ISO27001'],
          requiresRetention: true,
          retentionPeriod: 2555,
          personalDataProcessed: false,
          financialDataInvolved: false,
          crossBorderTransfer: false,
          consentRequired: false,
        },
      });

      // Perform initial compliance monitoring
      const complianceMetrics = await this.complianceService.monitorCompliance();
      
      console.log(`📊 Initial Compliance Assessment:`);
      console.log(`   Overall Compliance Score: ${complianceMetrics.overall.complianceScore.toFixed(1)}%`);
      console.log(`   Frameworks Tracked: ${complianceMetrics.overall.frameworksTracked}`);
      console.log(`   Active Violations: ${complianceMetrics.overall.activeViolations}`);
      console.log(`   Controls Implemented: ${complianceMetrics.overall.controlsImplemented}/${complianceMetrics.overall.totalControls}`);

      // Verify audit integrity
      const integrityCheck = await this.auditService.verifyAuditIntegrity();
      console.log(`🔒 Audit Trail Integrity: ${integrityCheck.verified ? 'VERIFIED' : 'COMPROMISED'}`);
      
      if (!integrityCheck.verified && integrityCheck.integrityViolations.length > 0) {
        console.warn(`⚠️  Integrity violations detected: ${integrityCheck.integrityViolations.length}`);
      }

    } catch (error) {
      console.error('Failed to perform initial compliance assessment:', error);
      
      // Log the failure
      await this.auditService.logAuditEvent({
        category: 'system',
        action: 'compliance_assessment_failure',
        resource: {
          type: 'system',
          id: 'compliance_module',
        },
        actor: {
          type: 'system',
          id: 'system_startup',
        },
        details: {
          operation: 'execute',
          description: 'Initial compliance assessment failed',
        },
        result: {
          status: 'failure',
          message: error.message,
        },
        compliance: {
          frameworks: ['SOX', 'GDPR', 'ISO27001'],
          requiresRetention: true,
          retentionPeriod: 2555,
          personalDataProcessed: false,
          financialDataInvolved: false,
          crossBorderTransfer: false,
          consentRequired: false,
        },
      });
      
      throw error;
    }
  }
}
