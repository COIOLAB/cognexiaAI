import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
} from 'typeorm';
import { IsString, IsBoolean, IsOptional, IsEnum, IsDate, IsUUID, IsUrl, IsEmail } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { User } from './user.entity';

export enum OAuthProviderType {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
  AZURE_AD = 'azure_ad',
  GITHUB = 'github',
  LINKEDIN = 'linkedin',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  OKTA = 'okta',
  SAML = 'saml',
  LDAP = 'ldap',
  CUSTOM = 'custom',
}

export enum OAuthStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
  PENDING = 'pending',
}

@Entity('oauth_providers')
@Index(['userId'])
@Index(['provider'])
@Index(['status'])
@Index(['externalId'])
@Index(['createdAt'])
export class OAuthProvider {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @Column({ type: 'uuid' })
  @IsUUID()
  userId: string;

  @Column({ type: 'enum', enum: OAuthProviderType })
  @IsEnum(OAuthProviderType)
  provider: OAuthProviderType;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  externalId: string; // Provider's user ID

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsEmail()
  externalEmail?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  externalUsername?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  displayName?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  accessToken?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  idToken?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  tokenType?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  @IsOptional()
  @IsString()
  scope?: string;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  accessTokenExpiresAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  refreshTokenExpiresAt?: Date;

  @Column({ type: 'enum', enum: OAuthStatus, default: OAuthStatus.ACTIVE })
  @IsEnum(OAuthStatus)
  status: OAuthStatus;

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isPrimary: boolean; // Primary OAuth provider

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsUrl()
  profileUrl?: string;

  @Column({ type: 'jsonb', nullable: true })
  profileData?: Record<string, any>; // Additional profile data from provider

  @Column({ type: 'jsonb', nullable: true })
  rawResponse?: Record<string, any>; // Raw OAuth response

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  lastSyncAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  lastUsedAt?: Date;

  // Security and compliance
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  tenantId?: string; // For Azure AD, Okta etc.

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  domainHint?: string;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  requiresMFA: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  authenticationMethod?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  authenticationStrength?: string;

  @Column({ type: 'jsonb', nullable: true })
  securityClaims?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  complianceData?: Record<string, any>;

  // Industry 5.0 features
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  supportsBlockchain: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  blockchainAddress?: string;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isQuantumSafe: boolean;

  @Column({ type: 'jsonb', nullable: true })
  quantumProperties?: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  supportsBiometric: boolean;

  @Column({ type: 'jsonb', nullable: true })
  biometricClaims?: Record<string, any>;

  // Audit and tracking
  @Column({ type: 'inet', nullable: true })
  @IsOptional()
  @IsString()
  createdIp?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Timestamps
  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;

  @DeleteDateColumn()
  @IsOptional()
  @IsDate()
  deletedAt?: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.oauthProviders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Computed Properties
  get isAccessTokenExpired(): boolean {
    return this.accessTokenExpiresAt && this.accessTokenExpiresAt < new Date();
  }

  get isRefreshTokenExpired(): boolean {
    return this.refreshTokenExpiresAt && this.refreshTokenExpiresAt < new Date();
  }

  get needsRefresh(): boolean {
    return this.isAccessTokenExpired && !this.isRefreshTokenExpired;
  }

  get isFullyExpired(): boolean {
    return this.isAccessTokenExpired && this.isRefreshTokenExpired;
  }

  get displayProviderName(): string {
    return this.provider.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // Methods
  @BeforeInsert()
  async beforeInsert() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }

  updateTokens(tokenData: {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    tokenType?: string;
    expiresIn?: number;
    scope?: string;
  }): void {
    if (tokenData.accessToken) {
      this.accessToken = tokenData.accessToken;
    }
    
    if (tokenData.refreshToken) {
      this.refreshToken = tokenData.refreshToken;
    }
    
    if (tokenData.idToken) {
      this.idToken = tokenData.idToken;
    }
    
    if (tokenData.tokenType) {
      this.tokenType = tokenData.tokenType;
    }
    
    if (tokenData.scope) {
      this.scope = tokenData.scope;
    }
    
    if (tokenData.expiresIn) {
      this.accessTokenExpiresAt = new Date(Date.now() + tokenData.expiresIn * 1000);
    }
    
    this.lastSyncAt = new Date();
    this.status = OAuthStatus.ACTIVE;
  }

  updateProfile(profileData: Record<string, any>): void {
    this.profileData = {
      ...this.profileData,
      ...profileData,
    };
    
    // Update common fields
    if (profileData.email) {
      this.externalEmail = profileData.email;
    }
    
    if (profileData.name || profileData.displayName) {
      this.displayName = profileData.name || profileData.displayName;
    }
    
    if (profileData.login || profileData.username) {
      this.externalUsername = profileData.login || profileData.username;
    }
    
    if (profileData.avatar_url || profileData.picture) {
      this.avatarUrl = profileData.avatar_url || profileData.picture;
    }
    
    if (profileData.html_url || profileData.profile) {
      this.profileUrl = profileData.html_url || profileData.profile;
    }
    
    this.lastSyncAt = new Date();
  }

  revoke(): void {
    this.status = OAuthStatus.REVOKED;
    this.isActive = false;
    this.accessToken = null;
    this.refreshToken = null;
    this.idToken = null;
  }

  activate(): void {
    this.status = OAuthStatus.ACTIVE;
    this.isActive = true;
  }

  deactivate(): void {
    this.status = OAuthStatus.INACTIVE;
    this.isActive = false;
  }

  markAsUsed(): void {
    this.lastUsedAt = new Date();
  }

  hasValidTokens(): boolean {
    return this.isActive && 
           this.status === OAuthStatus.ACTIVE && 
           (!this.isAccessTokenExpired || this.needsRefresh);
  }

  getScopes(): string[] {
    return this.scope ? this.scope.split(' ') : [];
  }

  hasScope(scope: string): boolean {
    return this.getScopes().includes(scope);
  }

  updateMetadata(data: Record<string, any>): void {
    this.metadata = {
      ...this.metadata,
      ...data,
      lastUpdated: new Date(),
    };
  }

  enableBlockchain(address: string): void {
    this.supportsBlockchain = true;
    this.blockchainAddress = address;
  }

  enableQuantumSafety(properties: Record<string, any>): void {
    this.isQuantumSafe = true;
    this.quantumProperties = properties;
  }

  enableBiometric(claims: Record<string, any>): void {
    this.supportsBiometric = true;
    this.biometricClaims = claims;
  }

  toJSON() {
    const { 
      accessToken, 
      refreshToken, 
      idToken, 
      rawResponse, 
      ...result 
    } = this;
    
    return {
      ...result,
      isAccessTokenExpired: this.isAccessTokenExpired,
      isRefreshTokenExpired: this.isRefreshTokenExpired,
      needsRefresh: this.needsRefresh,
      isFullyExpired: this.isFullyExpired,
      displayProviderName: this.displayProviderName,
      hasValidTokens: this.hasValidTokens(),
      scopes: this.getScopes(),
    };
  }
}
