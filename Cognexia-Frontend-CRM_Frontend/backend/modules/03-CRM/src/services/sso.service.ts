import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';

export enum SSOProvider {
  GOOGLE = 'google',
  AZURE_AD = 'azure_ad',
  OKTA = 'okta',
  SAML = 'saml',
}

export interface SSOConfig {
  provider: SSOProvider;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  domain?: string; // For Azure AD, Okta
  tenantId?: string; // For Azure AD
  issuer?: string; // For SAML
  entryPoint?: string; // For SAML
  certificate?: string; // For SAML
  metadata?: Record<string, any>;
}

export interface SSOUserProfile {
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  provider: SSOProvider;
  providerId: string;
  avatar?: string;
  metadata?: Record<string, any>;
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface GoogleProfile {
  email: string;
  given_name: string;
  family_name: string;
  name: string;
  id: string;
  picture?: string;
  [key: string]: any;
}

interface AzureADTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface AzureADProfile {
  mail?: string;
  userPrincipalName: string;
  givenName: string;
  surname: string;
  displayName: string;
  id: string;
  [key: string]: any;
}

interface OktaTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface OktaProfile {
  email: string;
  given_name: string;
  family_name: string;
  name: string;
  sub: string;
  [key: string]: any;
}

@Injectable()
export class SSOService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Initiate SSO login flow
   */
  async initiateLogin(provider: SSOProvider, config: SSOConfig): Promise<string> {
    switch (provider) {
      case SSOProvider.GOOGLE:
        return this.initiateGoogleLogin(config);
      case SSOProvider.AZURE_AD:
        return this.initiateAzureADLogin(config);
      case SSOProvider.OKTA:
        return this.initiateOktaLogin(config);
      default:
        throw new BadRequestException(`Unsupported SSO provider: ${provider}`);
    }
  }

  /**
   * Handle SSO callback and create/login user
   */
  async handleCallback(
    provider: SSOProvider,
    profile: SSOUserProfile,
    organizationId: string,
  ): Promise<{ user: User; accessToken: string }> {
    // Find or create user
    let user = await this.userRepository.findOne({
      where: { email: profile.email },
    });

    if (!user) {
      // Create new user from SSO profile
      const newUser = this.userRepository.create({
        email: profile.email,
        firstName: profile.firstName || profile.displayName?.split(' ')[0] || '',
        lastName: profile.lastName || profile.displayName?.split(' ')[1] || '',
        passwordHash: '', // No password for SSO users
        ssoProvider: provider,
        ssoProviderId: profile.providerId,
        isEmailVerified: true, // SSO emails are pre-verified
        organizationId,
      });

      user = await this.userRepository.save(newUser);
    } else {
      // Update SSO info if user exists
      user.ssoProvider = provider;
      user.ssoProviderId = profile.providerId;
      await this.userRepository.save(user);
    }

    // Generate JWT token
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      tenantId: organizationId,
      ssoProvider: provider,
    });

    return { user, accessToken };
  }

  /**
   * Google OAuth2 Login
   */
  private initiateGoogleLogin(config: SSOConfig): string {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange Google OAuth code for user profile
   */
  async exchangeGoogleCode(code: string, config: SSOConfig): Promise<SSOUserProfile> {
    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: config.redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokens = await tokenResponse.json() as GoogleTokenResponse;
      if (!tokens.access_token) {
        throw new UnauthorizedException('Failed to exchange Google code');
      }

      // Fetch user profile
      const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      const profile = await profileResponse.json() as GoogleProfile;

      return {
        email: profile.email,
        firstName: profile.given_name,
        lastName: profile.family_name,
        displayName: profile.name,
        provider: SSOProvider.GOOGLE,
        providerId: profile.id,
        avatar: profile.picture,
        metadata: profile,
      };
    } catch (error) {
      throw new UnauthorizedException(`Google OAuth failed: ${error.message}`);
    }
  }

  /**
   * Azure AD SAML Login
   */
  private initiateAzureADLogin(config: SSOConfig): string {
    const params = new URLSearchParams({
      client_id: config.clientId,
      response_type: 'code',
      redirect_uri: config.redirectUri,
      response_mode: 'query',
      scope: 'openid email profile',
      state: this.generateState(),
    });

    const tenantId = config.tenantId || 'common';
    return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  /**
   * Exchange Azure AD code for user profile
   */
  async exchangeAzureADCode(code: string, config: SSOConfig): Promise<SSOUserProfile> {
    try {
      const tenantId = config.tenantId || 'common';

      // Exchange code for access token
      const tokenResponse = await fetch(
        `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret!,
            code,
            redirect_uri: config.redirectUri,
            grant_type: 'authorization_code',
            scope: 'openid email profile',
          }),
        },
      );

      const tokens = await tokenResponse.json() as AzureADTokenResponse;
      if (!tokens.access_token) {
        throw new UnauthorizedException('Failed to exchange Azure AD code');
      }

      // Fetch user profile
      const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      const profile = await profileResponse.json() as AzureADProfile;

      return {
        email: profile.mail || profile.userPrincipalName,
        firstName: profile.givenName,
        lastName: profile.surname,
        displayName: profile.displayName,
        provider: SSOProvider.AZURE_AD,
        providerId: profile.id,
        metadata: profile,
      };
    } catch (error) {
      throw new UnauthorizedException(`Azure AD OAuth failed: ${error.message}`);
    }
  }

  /**
   * Okta Login
   */
  private initiateOktaLogin(config: SSOConfig): string {
    if (!config.domain) {
      throw new BadRequestException('Okta domain is required');
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      response_type: 'code',
      redirect_uri: config.redirectUri,
      scope: 'openid email profile',
      state: this.generateState(),
    });

    return `https://${config.domain}/oauth2/v1/authorize?${params.toString()}`;
  }

  /**
   * Exchange Okta code for user profile
   */
  async exchangeOktaCode(code: string, config: SSOConfig): Promise<SSOUserProfile> {
    try {
      if (!config.domain) {
        throw new BadRequestException('Okta domain is required');
      }

      // Exchange code for access token
      const tokenResponse = await fetch(`https://${config.domain}/oauth2/v1/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret!,
          code,
          redirect_uri: config.redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokens = await tokenResponse.json() as OktaTokenResponse;
      if (!tokens.access_token) {
        throw new UnauthorizedException('Failed to exchange Okta code');
      }

      // Fetch user profile
      const profileResponse = await fetch(`https://${config.domain}/oauth2/v1/userinfo`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      const profile = await profileResponse.json() as OktaProfile;

      return {
        email: profile.email,
        firstName: profile.given_name,
        lastName: profile.family_name,
        displayName: profile.name,
        provider: SSOProvider.OKTA,
        providerId: profile.sub,
        metadata: profile,
      };
    } catch (error) {
      throw new UnauthorizedException(`Okta OAuth failed: ${error.message}`);
    }
  }

  /**
   * Verify SSO token
   */
  async verifySSOToken(provider: SSOProvider, token: string, config: SSOConfig): Promise<boolean> {
    try {
      switch (provider) {
        case SSOProvider.GOOGLE:
          return this.verifyGoogleToken(token);
        case SSOProvider.AZURE_AD:
          return this.verifyAzureADToken(token, config);
        case SSOProvider.OKTA:
          return this.verifyOktaToken(token, config);
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify Google ID token
   */
  private async verifyGoogleToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
      const data = await response.json() as { email?: string };
      return !!data.email;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify Azure AD token
   */
  private async verifyAzureADToken(token: string, config: SSOConfig): Promise<boolean> {
    // In production, verify JWT signature using Azure AD public keys
    // For now, simple validation
    try {
      const decoded = this.jwtService.decode(token);
      return !!decoded;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify Okta token
   */
  private async verifyOktaToken(token: string, config: SSOConfig): Promise<boolean> {
    // In production, verify JWT signature using Okta public keys
    try {
      const decoded = this.jwtService.decode(token);
      return !!decoded;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate random state for OAuth flow
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * Link SSO account to existing user
   */
  async linkSSOAccount(
    userId: string,
    provider: SSOProvider,
    providerId: string,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.ssoProvider = provider;
    user.ssoProviderId = providerId;
    return this.userRepository.save(user);
  }

  /**
   * Unlink SSO account
   */
  async unlinkSSOAccount(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.ssoProvider = null;
    user.ssoProviderId = null;
    return this.userRepository.save(user);
  }
}
