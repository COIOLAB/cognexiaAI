import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import { AuthSession } from './entities/auth-session.entity';
import { User } from '../rbac/entities/User.entity';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface TokenPayload {
  sub: string; // User ID
  email: string;
  sessionId: string;
  roles: string[];
  permissions: string[];
  clearance: string[];
  classification: string;
  deviceId?: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  jti: string; // JWT ID for tracking
}

export interface RefreshTokenData {
  tokenId: string;
  userId: string;
  sessionId: string;
  deviceFingerprint: string;
  expiresAt: Date;
  isRevoked: boolean;
  revokedAt?: Date;
  revokedReason?: string;
  lastUsed?: Date;
  useCount: number;
  ipAddress: string;
  userAgent: string;
}

export interface TokenValidationResult {
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
  requiresRenewal?: boolean;
  riskScore?: number;
  violations?: string[];
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly refreshTokens = new Map<string, RefreshTokenData>();
  private readonly revokedTokens = new Set<string>();
  
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(AuthSession)
    private readonly sessionRepository: Repository<AuthSession>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    // Initialize token cleanup job
    this.startTokenCleanupJob();
  }

  /**
   * Generate FIPS-compliant JWT token pair
   */
  async generateTokenPair(user: User, session: AuthSession, roles: string[], permissions: string[]): Promise<TokenPair> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const jti = crypto.randomUUID();
      
      // Create access token payload
      const accessTokenPayload: TokenPayload = {
        sub: user.id,
        email: user.email,
        sessionId: session.sessionId,
        roles,
        permissions,
        clearance: session.compliance.clearanceRequired,
        classification: session.compliance.classification,
        deviceId: session.deviceFingerprint,
        iat: now,
        exp: now + this.getAccessTokenExpiry(),
        iss: this.configService.get('JWT_ISSUER', 'Industry5.0-InventoryModule'),
        aud: this.configService.get('JWT_AUDIENCE', 'inventory-management'),
        jti,
      };

      // Generate access token with FIPS-compliant algorithm
      const accessToken = await this.jwtService.signAsync(accessTokenPayload, {
        algorithm: 'RS256', // FIPS 140-2 approved
        keyid: 'fips-signing-key-2024',
        header: {
          alg: 'RS256',
          typ: 'JWT',
          kid: 'fips-signing-key-2024',
        },
      });

      // Generate refresh token
      const refreshToken = this.generateRefreshToken(user.id, session.sessionId, session.deviceFingerprint, session.ipAddress, session.userAgent);

      // Store refresh token data
      await this.storeRefreshToken(refreshToken);

      // Emit token issued event
      this.eventEmitter.emit('token.issued', {
        userId: user.id,
        sessionId: session.sessionId,
        tokenId: jti,
        tokenType: 'access',
        expiresAt: new Date(accessTokenPayload.exp * 1000),
        deviceFingerprint: session.deviceFingerprint,
        ipAddress: session.ipAddress,
      });

      return {
        accessToken,
        refreshToken: refreshToken.tokenId,
        expiresIn: this.getAccessTokenExpiry(),
        tokenType: 'Bearer',
      };

    } catch (error) {
      this.logger.error('Token generation failed', error);
      throw new Error('Failed to generate authentication tokens');
    }
  }

  /**
   * Validate JWT access token with security checks
   */
  async validateAccessToken(token: string, context?: {
    ipAddress?: string;
    userAgent?: string;
    deviceFingerprint?: string;
  }): Promise<TokenValidationResult> {
    try {
      // Check if token is revoked
      if (this.isTokenRevoked(token)) {
        return {
          valid: false,
          error: 'Token has been revoked',
        };
      }

      // Verify token signature and claims
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        algorithms: ['RS256'],
        issuer: this.configService.get('JWT_ISSUER'),
        audience: this.configService.get('JWT_AUDIENCE'),
        clockTolerance: 30, // 30 seconds tolerance
      });

      // Additional security validations
      const validationResult = await this.performSecurityValidation(payload, context);
      if (!validationResult.valid) {
        return validationResult;
      }

      // Check session validity
      const session = await this.sessionRepository.findOne({
        where: { sessionId: payload.sessionId, active: true },
      });

      if (!session) {
        return {
          valid: false,
          error: 'Associated session not found or inactive',
        };
      }

      if (session.isExpired() || session.isIdle()) {
        return {
          valid: false,
          error: 'Session has expired or is idle',
          requiresRenewal: true,
        };
      }

      // Update session activity
      session.updateActivity();
      await this.sessionRepository.save(session);

      return {
        valid: true,
        payload,
        riskScore: session.monitoring.riskScore,
        requiresRenewal: session.requiresRenewal(),
      };

    } catch (error) {
      this.logger.warn('Token validation failed', { error: error.message });
      
      if (error.name === 'TokenExpiredError') {
        return {
          valid: false,
          error: 'Token has expired',
          requiresRenewal: true,
        };
      }

      return {
        valid: false,
        error: 'Invalid token',
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshTokenId: string, context: {
    ipAddress: string;
    userAgent: string;
    deviceFingerprint: string;
  }): Promise<TokenPair> {
    try {
      const refreshTokenData = this.refreshTokens.get(refreshTokenId);
      
      if (!refreshTokenData || refreshTokenData.isRevoked) {
        throw new UnauthorizedException('Invalid or revoked refresh token');
      }

      if (new Date() > refreshTokenData.expiresAt) {
        this.refreshTokens.delete(refreshTokenId);
        throw new UnauthorizedException('Refresh token has expired');
      }

      // Security validation for refresh token usage
      if (refreshTokenData.deviceFingerprint !== context.deviceFingerprint) {
        // Potential token theft - revoke all tokens for this session
        await this.revokeAllSessionTokens(refreshTokenData.sessionId, 'Device fingerprint mismatch');
        throw new UnauthorizedException('Device fingerprint validation failed');
      }

      // Get associated session
      const session = await this.sessionRepository.findOne({
        where: { sessionId: refreshTokenData.sessionId, active: true },
        relations: ['user'],
      });

      if (!session) {
        throw new UnauthorizedException('Associated session not found');
      }

      // Update refresh token usage
      refreshTokenData.lastUsed = new Date();
      refreshTokenData.useCount++;
      this.refreshTokens.set(refreshTokenId, refreshTokenData);

      // Get user roles and permissions (simplified - should be from RBAC service)
      const roles = ['user']; // TODO: Get from RBAC service
      const permissions = []; // TODO: Get from RBAC service

      // Generate new token pair
      const newTokenPair = await this.generateTokenPair(session.user, session, roles, permissions);

      // Emit token refreshed event
      this.eventEmitter.emit('token.refreshed', {
        userId: session.userId,
        sessionId: session.sessionId,
        oldRefreshToken: refreshTokenId,
        newRefreshToken: newTokenPair.refreshToken,
        ipAddress: context.ipAddress,
        deviceFingerprint: context.deviceFingerprint,
      });

      return newTokenPair;

    } catch (error) {
      this.logger.error('Token refresh failed', error);
      throw error;
    }
  }

  /**
   * Revoke token(s)
   */
  async revokeToken(tokenId: string, reason?: string): Promise<void> {
    try {
      // Add to revoked tokens list
      this.revokedTokens.add(tokenId);

      // If it's a refresh token, mark as revoked
      const refreshTokenData = this.refreshTokens.get(tokenId);
      if (refreshTokenData) {
        refreshTokenData.isRevoked = true;
        refreshTokenData.revokedAt = new Date();
        refreshTokenData.revokedReason = reason || 'Manual revocation';
        this.refreshTokens.set(tokenId, refreshTokenData);
      }

      // Emit token revoked event
      this.eventEmitter.emit('token.revoked', {
        tokenId,
        reason,
        timestamp: new Date(),
      });

      this.logger.log(`Token revoked: ${tokenId}, reason: ${reason}`);

    } catch (error) {
      this.logger.error('Token revocation failed', error);
      throw error;
    }
  }

  /**
   * Revoke all tokens for a session
   */
  async revokeAllSessionTokens(sessionId: string, reason?: string): Promise<void> {
    try {
      // Find and revoke all refresh tokens for this session
      for (const [tokenId, tokenData] of this.refreshTokens.entries()) {
        if (tokenData.sessionId === sessionId && !tokenData.isRevoked) {
          await this.revokeToken(tokenId, reason);
        }
      }

      this.logger.log(`All tokens revoked for session: ${sessionId}, reason: ${reason}`);

    } catch (error) {
      this.logger.error('Session token revocation failed', error);
      throw error;
    }
  }

  /**
   * Clean up expired and revoked tokens
   */
  async cleanupTokens(): Promise<void> {
    try {
      const now = new Date();
      let cleanedCount = 0;

      // Cleanup refresh tokens
      for (const [tokenId, tokenData] of this.refreshTokens.entries()) {
        if (tokenData.isRevoked || now > tokenData.expiresAt) {
          this.refreshTokens.delete(tokenId);
          cleanedCount++;
        }
      }

      // Cleanup revoked tokens list (keep for 24 hours)
      // In production, this should be stored in a database with TTL

      this.logger.log(`Cleaned up ${cleanedCount} expired/revoked tokens`);

    } catch (error) {
      this.logger.error('Token cleanup failed', error);
    }
  }

  // Private helper methods
  private generateRefreshToken(userId: string, sessionId: string, deviceFingerprint: string, ipAddress: string, userAgent: string): RefreshTokenData {
    const tokenId = crypto.randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + this.getRefreshTokenExpiry() * 1000);

    return {
      tokenId,
      userId,
      sessionId,
      deviceFingerprint,
      expiresAt,
      isRevoked: false,
      useCount: 0,
      ipAddress,
      userAgent,
    };
  }

  private async storeRefreshToken(refreshToken: RefreshTokenData): Promise<void> {
    this.refreshTokens.set(refreshToken.tokenId, refreshToken);
    
    // In production, store in database with proper indexing
    // await this.refreshTokenRepository.save(refreshToken);
  }

  private isTokenRevoked(token: string): boolean {
    try {
      // Extract JTI from token without verifying signature
      const payload = this.jwtService.decode(token) as any;
      return payload?.jti ? this.revokedTokens.has(payload.jti) : false;
    } catch {
      return false;
    }
  }

  private async performSecurityValidation(payload: TokenPayload, context?: {
    ipAddress?: string;
    userAgent?: string;
    deviceFingerprint?: string;
  }): Promise<TokenValidationResult> {
    const violations: string[] = [];

    // Validate token age
    const tokenAge = Date.now() / 1000 - payload.iat;
    const maxTokenAge = this.configService.get<number>('MAX_TOKEN_AGE', 86400); // 24 hours
    
    if (tokenAge > maxTokenAge) {
      violations.push('Token too old');
    }

    // Validate device fingerprint if provided
    if (context?.deviceFingerprint && payload.deviceId && payload.deviceId !== context.deviceFingerprint) {
      violations.push('Device fingerprint mismatch');
    }

    // Calculate risk score based on violations
    const riskScore = violations.length * 25;

    return {
      valid: violations.length === 0,
      violations: violations.length > 0 ? violations : undefined,
      riskScore,
      error: violations.length > 0 ? violations.join(', ') : undefined,
    };
  }

  private getAccessTokenExpiry(): number {
    return this.configService.get<number>('ACCESS_TOKEN_EXPIRY', 900); // 15 minutes
  }

  private getRefreshTokenExpiry(): number {
    return this.configService.get<number>('REFRESH_TOKEN_EXPIRY', 604800); // 7 days
  }

  private startTokenCleanupJob(): void {
    // Run cleanup every hour
    setInterval(async () => {
      await this.cleanupTokens();
    }, 60 * 60 * 1000);
  }
}
