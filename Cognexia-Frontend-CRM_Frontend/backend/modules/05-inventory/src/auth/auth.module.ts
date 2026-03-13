import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Services
import { AdvancedAuthService } from './advanced-auth.service';
import { TokenService } from './token.service';
import { SessionService } from './session.service';
import { MFAService } from './mfa.service';
import { BiometricAuthService } from './biometric-auth.service';
import { SmartCardAuthService } from './smart-card-auth.service';
import { OAuth2Service } from './oauth2.service';
import { DeviceTrustService } from './device-trust.service';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { MFAGuard } from './guards/mfa.guard';
import { DeviceTrustGuard } from './guards/device-trust.guard';
import { ZeroTrustGuard } from './guards/zero-trust.guard';
import { ComplianceGuard } from './guards/compliance.guard';

// Strategies
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';
import { SmartCardStrategy } from './strategies/smart-card.strategy';

// Entities
import { User } from '../rbac/entities/User.entity';
import { Role } from '../rbac/entities/Role.entity';
import { Permission } from '../rbac/entities/Permission.entity';
import { UserRole } from '../rbac/entities/UserRole.entity';
import { RolePermission } from '../rbac/entities/RolePermission.entity';
import { AuthSession } from './entities/auth-session.entity';
import { MFAConfiguration } from './entities/mfa-configuration.entity';
import { DeviceTrust } from './entities/device-trust.entity';
import { AuthAuditLog } from './entities/auth-audit-log.entity';

// Controllers
import { AuthController } from './auth.controller';
import { MFAController } from './mfa.controller';
import { SessionController } from './session.controller';

// RBAC
import { RBACService } from '../rbac/rbac.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
          algorithm: 'RS256', // FIPS-compliant algorithm
          issuer: 'Industry5.0-InventoryModule',
          audience: 'inventory-management',
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      Role,
      Permission,
      UserRole,
      RolePermission,
      AuthSession,
      MFAConfiguration,
      DeviceTrust,
      AuthAuditLog,
    ]),
    EventEmitterModule,
  ],
  controllers: [
    AuthController,
    MFAController,
    SessionController,
  ],
  providers: [
    // Services
    AdvancedAuthService,
    TokenService,
    SessionService,
    MFAService,
    BiometricAuthService,
    SmartCardAuthService,
    OAuth2Service,
    DeviceTrustService,
    RBACService,

    // Guards
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    MFAGuard,
    DeviceTrustGuard,
    ZeroTrustGuard,
    ComplianceGuard,

    // Strategies
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
    MicrosoftStrategy,
    SmartCardStrategy,
  ],
  exports: [
    AdvancedAuthService,
    TokenService,
    SessionService,
    MFAService,
    BiometricAuthService,
    SmartCardAuthService,
    OAuth2Service,
    DeviceTrustService,
    RBACService,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    MFAGuard,
    DeviceTrustGuard,
    ZeroTrustGuard,
    ComplianceGuard,
  ],
})
export class AuthModule {}
