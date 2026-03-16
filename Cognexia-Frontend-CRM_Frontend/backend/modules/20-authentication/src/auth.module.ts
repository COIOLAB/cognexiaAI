import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';

// Entities
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserSession } from './entities/user-session.entity';
import { LoginAttempt } from './entities/login-attempt.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { TwoFactorAuth } from './entities/two-factor-auth.entity';
import { OAuthProvider } from './entities/oauth-provider.entity';
import { SecurityAudit } from './entities/security-audit.entity';
import { BiometricAuth } from './entities/biometric-auth.entity';
import { BlockchainIdentity } from './entities/blockchain-identity.entity';
import { QuantumKeyPair } from './entities/quantum-keypair.entity';

// Controllers
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { RoleController } from './controllers/role.controller';
import { SecurityController } from './controllers/security.controller';
import { BiometricController } from './controllers/biometric.controller';
import { BlockchainAuthController } from './controllers/blockchain-auth.controller';
import { QuantumAuthController } from './controllers/quantum-auth.controller';

// Services
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { RoleService } from './services/role.service';
import { JwtService as CustomJwtService } from './services/jwt.service';
import { PasswordService } from './services/password.service';
import { TwoFactorService } from './services/two-factor.service';
import { OauthService } from './services/oauth.service';
import { SecurityAuditService } from './services/security-audit.service';
import { BiometricAuthService } from './services/biometric-auth.service';
import { BlockchainAuthService } from './services/blockchain-auth.service';
import { QuantumAuthService } from './services/quantum-auth.service';
import { SessionManagementService } from './services/session-management.service';
import { RiskAssessmentService } from './services/risk-assessment.service';
import { AiSecurityService } from './services/ai-security.service';

// Strategies
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';
import { BiometricStrategy } from './strategies/biometric.strategy';
import { BlockchainStrategy } from './strategies/blockchain.strategy';
import { QuantumStrategy } from './strategies/quantum.strategy';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { TwoFactorGuard } from './guards/two-factor.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { BiometricGuard } from './guards/biometric.guard';
import { BlockchainGuard } from './guards/blockchain.guard';
import { QuantumGuard } from './guards/quantum.guard';
import { AiSecurityGuard } from './guards/ai-security.guard';

// Industry 5.0 Specific Services
import { DigitalIdentityService } from './services/digital-identity.service';
import { ZeroTrustService } from './services/zero-trust.service';
import { QuantumEncryptionService } from './services/quantum-encryption.service';
import { AiBehaviorAnalysisService } from './services/ai-behavior-analysis.service';
import { BlockchainIdentityService } from './services/blockchain-identity.service';
import { DecentralizedAuthService } from './services/decentralized-auth.service';

const logger = new Logger('AuthModule');

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // JWT Configuration with quantum-safe algorithms
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'industry5-jwt-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
          algorithm: 'RS512', // Quantum-resistant algorithm
          issuer: 'Industry5.0-ERP',
          audience: 'Industry5.0-Users',
        },
      }),
      inject: [ConfigService],
    }),

    // Database entities
    TypeOrmModule.forFeature([
      User,
      Role,
      Permission,
      UserSession,
      LoginAttempt,
      PasswordReset,
      TwoFactorAuth,
      OAuthProvider,
      SecurityAudit,
      BiometricAuth,
      BlockchainIdentity,
      QuantumKeyPair,
    ]),

    // Rate limiting for auth endpoints
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1 minute
        limit: 10, // 10 attempts per minute
      },
    ]),

    // Queue management for auth processes
    BullModule.registerQueue(
      { name: 'auth-queue' },
      { name: 'security-queue' },
      { name: 'notification-queue' }
    ),
  ],

  controllers: [
    AuthController,
    UserController,
    RoleController,
    SecurityController,
    BiometricController,
    BlockchainAuthController,
    QuantumAuthController,
  ],

  providers: [
    // Core Services
    AuthService,
    UserService,
    RoleService,
    CustomJwtService,
    PasswordService,
    TwoFactorService,
    OauthService,
    SecurityAuditService,
    SessionManagementService,
    RiskAssessmentService,

    // Industry 5.0 Advanced Services
    BiometricAuthService,
    BlockchainAuthService,
    QuantumAuthService,
    AiSecurityService,
    DigitalIdentityService,
    ZeroTrustService,
    QuantumEncryptionService,
    AiBehaviorAnalysisService,
    BlockchainIdentityService,
    DecentralizedAuthService,

    // Strategies
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
    MicrosoftStrategy,
    BiometricStrategy,
    BlockchainStrategy,
    QuantumStrategy,

    // Guards
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    TwoFactorGuard,
    RateLimitGuard,
    BiometricGuard,
    BlockchainGuard,
    QuantumGuard,
    AiSecurityGuard,
  ],

  exports: [
    // Export core services for use in other modules
    AuthService,
    UserService,
    RoleService,
    CustomJwtService,
    SecurityAuditService,
    SessionManagementService,
    
    // Export Industry 5.0 services
    BiometricAuthService,
    BlockchainAuthService,
    QuantumAuthService,
    AiSecurityService,
    DigitalIdentityService,
    ZeroTrustService,
    
    // Export guards for use in other modules
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    TwoFactorGuard,
    BiometricGuard,
    BlockchainGuard,
    QuantumGuard,
    AiSecurityGuard,
  ],
})
export class AuthModule {
  constructor() {
    logger.log('🔐 Industry 5.0 Authentication Module Initialized');
    logger.log('Features: JWT, 2FA, OAuth, Biometric, Blockchain, Quantum, AI Security');
    logger.log('Standards: Zero Trust, Quantum-Safe, Decentralized Identity');
  }
}
