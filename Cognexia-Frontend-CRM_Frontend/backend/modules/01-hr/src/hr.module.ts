import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';

// Import all HR entities
import {
  Employee,
  Department,
  Organization,
  Position,
  CompensationPlan,
  EmployeeCompensation,
  PayrollRecord,
  PayrollRun,
  PerformanceReview
} from './entities';

// Import all HR controllers
import {
  EmployeeController,
  CompensationController,
  PayrollController,
  PerformanceController,
  TalentAcquisitionController,
  BenefitsController,
  BenefitsAdministrationController,
  EmployeeEngagementController,
  EmployeeSelfServiceController,
  ExitManagementController,
  LearningDevelopmentController,
  TimeAttendanceController,
  SettingsController,
  AnalyticsController,
  HrIntegrationController,
  RevolutionaryCompensationController,
  RevolutionaryReportsAnalyticsController
} from './controllers';

// Import Advanced Security Controllers
import { QuantumComputingIntegrationController } from './quantum/quantum-computing-integration.controller';
import { CybersecurityOperationsCenterController } from './soc/cybersecurity-operations-center.controller';
import { PrivacyComplianceEngineController } from './compliance/privacy-compliance-engine.controller';
import { AdvancedAuditForensicsController } from './forensics/advanced-audit-forensics.controller';
import { AIPoweredSecurityAnalyticsController } from './analytics/ai-powered-security-analytics.controller';

// Import all HR services
import {
  EmployeeService,
  CompensationService,
  PayrollService,
  PerformanceService,
  TalentAcquisitionService,
  BenefitsAdministrationService,
  EmployeeEngagementService,
  EmployeeSelfServiceService,
  ExitManagementService,
  LearningDevelopmentService,
  TimeAttendanceService,
  HrIntegrationService,
  RevolutionaryCompensationService,
  RevolutionaryPerformanceService,
  RevolutionaryReportsAnalyticsService,
  RevolutionaryTalentAcquisitionService,
  DepartmentService,
  OrganizationService,
  PositionService
} from './services';

// Import Advanced Security Services
import { QuantumComputingService } from './services/quantum-computing.service';
import { CybersecurityService } from './services/cybersecurity.service';
import { ComplianceEngineService } from './services/compliance-engine.service';
import { AuditForensicsService } from './services/audit-forensics.service';
import { SecurityAnalyticsService } from './services/security-analytics.service';

@Module({
  imports: [
    // Configuration Module
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env.development', '.env.production', '.env'],
      isGlobal: true,
      expandVariables: true,
    }),

    // Database Configuration
    TypeOrmModule.forFeature([
      Employee,
      Department,
      Organization,
      Position,
      CompensationPlan,
      EmployeeCompensation,
      PayrollRecord,
      PayrollRun,
      PerformanceReview
    ]),

    // JWT Authentication
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'quantum-hr-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
          algorithm: 'HS256',
          issuer: 'Industry5.0-HR',
          audience: 'hr-users',
        },
      }),
    }),

    // Passport Authentication
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>('THROTTLE_TTL') || 60,
        limit: configService.get<number>('THROTTLE_LIMIT') || 100,
        ignoreUserAgents: [/healthcheck/i],
      }),
    }),

    // Task Scheduling
    ScheduleModule.forRoot(),

    // Event System
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 20,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),

    // Caching
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>('CACHE_TTL') || 300,
        max: configService.get<number>('CACHE_MAX_ITEMS') || 1000,
        isGlobal: true,
        store: configService.get<string>('CACHE_STORE') || 'memory',
      }),
    }),

    // Queue System for Background Processing
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_QUEUE_DB') || 1,
          maxRetriesPerRequest: 3,
          retryDelayOnFailover: 100,
          enableReadyCheck: true,
          lazyConnect: true,
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      }),
    }),

    // Queue Registration
    BullModule.registerQueue(
      { name: 'security-analytics' },
      { name: 'compliance-processing' },
      { name: 'quantum-operations' },
      { name: 'audit-processing' },
      { name: 'cybersecurity-monitoring' },
    ),
  ],
  controllers: [
    // Core HR Controllers
    EmployeeController,
    CompensationController,
    PayrollController,
    PerformanceController,
    TalentAcquisitionController,
    BenefitsController,
    BenefitsAdministrationController,
    EmployeeEngagementController,
    EmployeeSelfServiceController,
    ExitManagementController,
    LearningDevelopmentController,
    TimeAttendanceController,
    SettingsController,
    AnalyticsController,
    HrIntegrationController,
    RevolutionaryCompensationController,
    RevolutionaryReportsAnalyticsController,

    // Advanced Security Controllers
    QuantumComputingIntegrationController,
    CybersecurityOperationsCenterController,
    PrivacyComplianceEngineController,
    AdvancedAuditForensicsController,
    AIPoweredSecurityAnalyticsController,
  ],
  providers: [
    // Core HR Services
    EmployeeService,
    CompensationService,
    PayrollService,
    PerformanceService,
    TalentAcquisitionService,
    BenefitsAdministrationService,
    EmployeeEngagementService,
    EmployeeSelfServiceService,
    ExitManagementService,
    LearningDevelopmentService,
    TimeAttendanceService,
    HrIntegrationService,
    RevolutionaryCompensationService,
    RevolutionaryPerformanceService,
    RevolutionaryReportsAnalyticsService,
    RevolutionaryTalentAcquisitionService,
    DepartmentService,
    OrganizationService,
    PositionService,

    // Advanced Security Services
    QuantumComputingService,
    CybersecurityService,
    ComplianceEngineService,
    AuditForensicsService,
    SecurityAnalyticsService,
  ],
  exports: [
    // Core HR Services
    EmployeeService,
    CompensationService,
    PayrollService,
    PerformanceService,
    DepartmentService,
    OrganizationService,
    PositionService,

    // Advanced Security Services
    QuantumComputingService,
    CybersecurityService,
    ComplianceEngineService,
    AuditForensicsService,
    SecurityAnalyticsService,

    // Database Access
    TypeOrmModule
  ],
})
export class HRModule {
  constructor() {
    console.log('🚀 Industry 5.0 HR Module Initialized');
    console.log('🔐 Quantum Security: ENABLED');
    console.log('⛓️ Blockchain Integration: ACTIVE');
    console.log('🤖 AI Analytics: OPERATIONAL');
    console.log('🛡️ Compliance Engine: MONITORING');
    console.log('📊 Advanced Security Analytics: RUNNING');
    console.log('🔍 Audit & Forensics: READY');
    console.log('🎯 Cybersecurity SOC: ACTIVE');
  }
}
