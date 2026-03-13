import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

// Services
import { FIPSCryptoService } from './fips-crypto.service';
import { KeyManagementService } from './key-management.service';
import { SecurityComplianceService } from '../services/security-compliance.service';
import { FileEncryptionService } from '../file-management/services/file-encryption.service';

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
    FIPSCryptoService,
    KeyManagementService,
    SecurityComplianceService,
    FileEncryptionService,
    {
      provide: 'SECURITY_CONFIG',
      useFactory: (configService: ConfigService) => ({
        // Government-grade security configuration
        security: {
          level: configService.get<string>('SECURITY_LEVEL', 'HIGH'),
          classification: configService.get<string>('DATA_CLASSIFICATION', 'CONFIDENTIAL'),
          clearanceRequired: configService.get<boolean>('CLEARANCE_REQUIRED', true),
        },
        
        // FIPS 140-2 configuration
        fips: {
          enabled: configService.get<boolean>('FIPS_ENABLED', true),
          level: configService.get<number>('FIPS_LEVEL', 2),
          mode: configService.get<string>('FIPS_MODE', 'strict'),
          selfTestsEnabled: configService.get<boolean>('FIPS_SELF_TESTS', true),
          tamperDetectionEnabled: configService.get<boolean>('FIPS_TAMPER_DETECTION', true),
        },

        // Key Management configuration
        keyManagement: {
          hsmEnabled: configService.get<boolean>('HSM_ENABLED', false),
          hsmProvider: configService.get<string>('HSM_PROVIDER', 'software_hsm'),
          keyEscrowEnabled: configService.get<boolean>('KEY_ESCROW_ENABLED', true),
          automaticRotation: configService.get<boolean>('AUTO_KEY_ROTATION', true),
          rotationInterval: configService.get<number>('KEY_ROTATION_HOURS', 2160), // 3 months
        },

        // Compliance frameworks
        compliance: {
          frameworks: configService.get<string>('COMPLIANCE_FRAMEWORKS', 'FIPS-140-2,Common-Criteria,FedRAMP,SOX,GDPR,HIPAA').split(','),
          auditEnabled: configService.get<boolean>('AUDIT_ENABLED', true),
          auditRetentionDays: configService.get<number>('AUDIT_RETENTION_DAYS', 2555), // 7 years
          forensicsEnabled: configService.get<boolean>('FORENSICS_ENABLED', true),
        },

        // Encryption settings
        encryption: {
          atRest: {
            enabled: configService.get<boolean>('ENCRYPTION_AT_REST', true),
            algorithm: configService.get<string>('ENCRYPTION_AT_REST_ALGO', 'AES-256-GCM'),
            keyProvider: configService.get<string>('ENCRYPTION_KEY_PROVIDER', 'hsm'),
          },
          inTransit: {
            enabled: configService.get<boolean>('ENCRYPTION_IN_TRANSIT', true),
            protocol: configService.get<string>('ENCRYPTION_TRANSIT_PROTOCOL', 'TLS1.3'),
            cipherSuite: configService.get<string>('TLS_CIPHER_SUITE', 'ECDHE-ECDSA-AES256-GCM-SHA384'),
          },
          inProcessing: {
            enabled: configService.get<boolean>('ENCRYPTION_IN_PROCESSING', false),
            technique: configService.get<string>('PROCESSING_ENCRYPTION', 'homomorphic'),
          },
        },

        // Access control
        accessControl: {
          model: configService.get<string>('ACCESS_CONTROL_MODEL', 'RBAC'), // RBAC, ABAC, MAC
          mfaRequired: configService.get<boolean>('MFA_REQUIRED', true),
          biometricAuthEnabled: configService.get<boolean>('BIOMETRIC_AUTH', false),
          smartCardRequired: configService.get<boolean>('SMART_CARD_REQUIRED', false),
          sessionTimeout: configService.get<number>('SESSION_TIMEOUT_MINUTES', 30),
          maxConcurrentSessions: configService.get<number>('MAX_CONCURRENT_SESSIONS', 1),
        },

        // Network security
        network: {
          zeroTrustEnabled: configService.get<boolean>('ZERO_TRUST_ENABLED', true),
          networkSegmentation: configService.get<boolean>('NETWORK_SEGMENTATION', true),
          dpiEnabled: configService.get<boolean>('DEEP_PACKET_INSPECTION', true),
          ipsEnabled: configService.get<boolean>('INTRUSION_PREVENTION', true),
          allowedNetworks: configService.get<string>('ALLOWED_NETWORKS', '').split(',').filter(Boolean),
        },

        // Data Loss Prevention
        dlp: {
          enabled: configService.get<boolean>('DLP_ENABLED', true),
          dataClassificationEnabled: configService.get<boolean>('DATA_CLASSIFICATION', true),
          contentInspectionEnabled: configService.get<boolean>('CONTENT_INSPECTION', true),
          exfiltrationPrevention: configService.get<boolean>('EXFILTRATION_PREVENTION', true),
          watermarkingEnabled: configService.get<boolean>('DIGITAL_WATERMARKING', true),
        },

        // Incident Response
        incidentResponse: {
          enabled: configService.get<boolean>('INCIDENT_RESPONSE_ENABLED', true),
          automaticContainment: configService.get<boolean>('AUTO_CONTAINMENT', true),
          forensicsCollection: configService.get<boolean>('AUTO_FORENSICS', true),
          notificationEnabled: configService.get<boolean>('INCIDENT_NOTIFICATIONS', true),
          escalationEnabled: configService.get<boolean>('AUTO_ESCALATION', true),
        },

        // Monitoring and observability
        monitoring: {
          siemIntegration: configService.get<boolean>('SIEM_INTEGRATION', true),
          behavioralAnalysis: configService.get<boolean>('BEHAVIORAL_ANALYSIS', true),
          anomalyDetection: configService.get<boolean>('ANOMALY_DETECTION', true),
          threatIntelligence: configService.get<boolean>('THREAT_INTELLIGENCE', true),
          realTimeMonitoring: configService.get<boolean>('REAL_TIME_MONITORING', true),
        },

        // Backup and recovery
        backup: {
          enabled: configService.get<boolean>('BACKUP_ENABLED', true),
          encryption: configService.get<boolean>('BACKUP_ENCRYPTION', true),
          frequency: configService.get<string>('BACKUP_FREQUENCY', '6h'),
          retention: configService.get<number>('BACKUP_RETENTION_DAYS', 2555), // 7 years
          offSiteEnabled: configService.get<boolean>('OFFSITE_BACKUP', true),
          immutableBackups: configService.get<boolean>('IMMUTABLE_BACKUPS', true),
        },

        // Physical security integration
        physicalSecurity: {
          facilitySecurityEnabled: configService.get<boolean>('FACILITY_SECURITY', true),
          accessCardRequired: configService.get<boolean>('ACCESS_CARD_REQUIRED', true),
          biometricAccessEnabled: configService.get<boolean>('BIOMETRIC_ACCESS', false),
          mantrapEnabled: configService.get<boolean>('MANTRAP_ENABLED', false),
          surveillanceIntegration: configService.get<boolean>('SURVEILLANCE_INTEGRATION', true),
        },

        // Supply chain security
        supplyChain: {
          vendorVerificationEnabled: configService.get<boolean>('VENDOR_VERIFICATION', true),
          softwareCompositionAnalysis: configService.get<boolean>('SCA_ENABLED', true),
          codeSigningVerification: configService.get<boolean>('CODE_SIGNING_VERIFY', true),
          dependencyScanning: configService.get<boolean>('DEPENDENCY_SCANNING', true),
          vulnerabilityManagement: configService.get<boolean>('VULN_MANAGEMENT', true),
        },
      }),
      inject: [ConfigService],
    },
  ],
  exports: [
    FIPSCryptoService,
    KeyManagementService,
    SecurityComplianceService,
    FileEncryptionService,
    'SECURITY_CONFIG',
  ],
})
export class SecurityModule {
  constructor(
    private readonly fipsService: FIPSCryptoService,
    private readonly keyManagementService: KeyManagementService,
    private readonly complianceService: SecurityComplianceService
  ) {
    this.initializeSecurityModule();
  }

  private async initializeSecurityModule(): Promise<void> {
    try {
      console.log('🔒 Initializing Government-Grade Security Module');
      
      // Perform security initialization
      await this.performSecurityChecks();
      
      console.log('✅ Government-Grade Security Module initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Security Module:', error);
      throw error;
    }
  }

  private async performSecurityChecks(): Promise<void> {
    // Perform FIPS self-tests
    if (this.fipsService) {
      await this.fipsService.performSelfTests();
    }

    // Validate key management system
    if (this.keyManagementService) {
      await this.keyManagementService.getKeyMetrics();
    }

    // Check compliance status
    if (this.complianceService) {
      await this.complianceService.generateComplianceReport('FIPS-140-2', {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: new Date()
      });
    }
  }
}
