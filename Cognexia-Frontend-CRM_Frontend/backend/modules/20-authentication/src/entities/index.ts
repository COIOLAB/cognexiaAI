/**
 * Authentication Module Entities Index
 * Exports all authentication-related entities for the Industry 5.0 platform
 */

// Core authentication entities
export * from './user.entity';
export * from './role.entity';
export * from './permission.entity';
export * from './user-session.entity';
export * from './login-attempt.entity';
export * from './password-reset.entity';

// Multi-factor authentication
export * from './two-factor-auth.entity';

// OAuth and third-party authentication
export * from './oauth-provider.entity';

// Security and audit
export * from './security-audit.entity';

// Industry 5.0 advanced authentication features
export * from './biometric-auth.entity';
export * from './blockchain-identity.entity';
export * from './quantum-keypair.entity';

// Export enums for convenience
export {
  UserStatus,
  SecurityLevel as UserSecurityLevel,
  AuthenticationMethod,
} from './user.entity';

export {
  RoleType,
  RoleLevel,
} from './role.entity';

export {
  PermissionScope,
  PermissionType,
} from './permission.entity';

export {
  TwoFactorMethod,
  TwoFactorStatus,
} from './two-factor-auth.entity';

export {
  OAuthProviderType,
  OAuthStatus,
} from './oauth-provider.entity';

export {
  SecurityEventType,
  SecurityRiskLevel,
  SecurityAction,
} from './security-audit.entity';

export {
  BiometricType,
  BiometricStatus,
  BiometricQuality,
} from './biometric-auth.entity';

export {
  BlockchainNetwork,
  IdentityStatus,
  CredentialType,
} from './blockchain-identity.entity';

export {
  QuantumAlgorithm,
  KeyStatus,
  KeyUsage,
  SecurityLevel as QuantumSecurityLevel,
} from './quantum-keypair.entity';
