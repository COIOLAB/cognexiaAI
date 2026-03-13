# Authentication Module (20-authentication)

## Overview

The **Authentication Module** provides comprehensive identity and access management for the Industry 5.0 ERP system. It offers enterprise-grade authentication, authorization, single sign-on (SSO), multi-factor authentication (MFA), and user management capabilities designed for manufacturing environments.

## Features

### Core Authentication
- **Multi-Factor Authentication (MFA)**: TOTP, SMS, email, hardware tokens
- **Single Sign-On (SSO)**: SAML, OAuth2, OpenID Connect integration
- **Role-Based Access Control (RBAC)**: Granular permission management
- **Session Management**: Secure session handling and lifecycle
- **Password Policies**: Configurable password strength and rotation

### Advanced Security
- **Adaptive Authentication**: Risk-based authentication decisions
- **Device Trust**: Device fingerprinting and trust scoring
- **Behavioral Analytics**: User behavior monitoring and anomaly detection
- **Zero Trust Architecture**: Continuous verification and validation
- **API Key Management**: Secure API authentication for services

## Architecture

### Technology Stack
- **Framework**: NestJS with TypeScript
- **Authentication**: Passport.js, JWT, OAuth2, SAML
- **Database**: PostgreSQL with Redis for sessions
- **Security**: bcrypt, helmet, rate limiting
- **Monitoring**: Winston logging, metrics collection

## Key Components

### JWT Authentication Service
```typescript
@Injectable()
export class JwtAuthService {
  async generateTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
    };
    
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
    });
    
    const refreshToken = await this.generateRefreshToken(user.id);
    
    return { accessToken, refreshToken };
  }
}
```

### Multi-Factor Authentication
```typescript
@Injectable()
export class MfaService {
  async enableMFA(userId: string, method: MfaMethod): Promise<MfaSetup> {
    switch (method) {
      case MfaMethod.TOTP:
        return this.setupTOTP(userId);
      case MfaMethod.SMS:
        return this.setupSMS(userId);
      case MfaMethod.EMAIL:
        return this.setupEmail(userId);
      default:
        throw new BadRequestException('Unsupported MFA method');
    }
  }
  
  async verifyMFA(
    userId: string,
    code: string,
    method: MfaMethod
  ): Promise<boolean> {
    const user = await this.userService.findById(userId);
    
    switch (method) {
      case MfaMethod.TOTP:
        return this.verifyTOTP(user.mfaSecret, code);
      case MfaMethod.SMS:
        return this.verifySMS(userId, code);
      default:
        return false;
    }
  }
}
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### Multi-Factor Authentication
- `POST /api/auth/mfa/enable` - Enable MFA
- `POST /api/auth/mfa/verify` - Verify MFA token
- `POST /api/auth/mfa/disable` - Disable MFA
- `GET /api/auth/mfa/backup-codes` - Generate backup codes

### Single Sign-On
- `GET /api/auth/sso/saml/login` - SAML SSO login
- `POST /api/auth/sso/saml/callback` - SAML callback
- `GET /api/auth/sso/oauth2/login` - OAuth2 SSO login
- `GET /api/auth/sso/oauth2/callback` - OAuth2 callback

## Security Features

### Adaptive Authentication
```typescript
@Injectable()
export class AdaptiveAuthService {
  async assessRisk(loginAttempt: LoginAttempt): Promise<RiskAssessment> {
    const factors = await Promise.all([
      this.geoLocationRisk(loginAttempt),
      this.deviceTrustRisk(loginAttempt),
      this.behavioralRisk(loginAttempt),
      this.timePatternRisk(loginAttempt),
    ]);
    
    const overallRisk = this.calculateOverallRisk(factors);
    
    return {
      riskScore: overallRisk,
      factors,
      recommendation: this.getAuthRecommendation(overallRisk),
    };
  }
}
```

## Configuration

### Environment Variables
```env
# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# MFA Configuration
MFA_ISSUER=Industry5.0-ERP
SMS_PROVIDER=twilio
EMAIL_PROVIDER=sendgrid

# SSO Configuration
SAML_ENTRY_POINT=https://idp.company.com/saml
OAUTH2_CLIENT_ID=your-client-id
OAUTH2_CLIENT_SECRET=your-client-secret
```

## Integration Points

- **HR Module**: Employee identity synchronization
- **Manufacturing Module**: Role-based manufacturing access
- **Quality Module**: Quality inspector authentication
- **Analytics Module**: Dashboard access control
- **IoT Module**: Device authentication and authorization

## License

This module is part of the Industry 5.0 ERP system and is licensed under the MIT License.

## Support

For technical support:
- Email: authentication@ezai-mfgninja.com
- Documentation: https://docs.ezai-mfgninja.com/authentication
- Issue Tracker: https://github.com/ezai-mfg-ninja/industry5.0-authentication/issues
