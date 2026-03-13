import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserType } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { PortalUser } from '../entities/portal-user.entity';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  userType?: UserType | string;
  organizationId?: string;
  roles?: string[];
  permissions?: string[];
  type?: string;
  tenantId?: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  userId?: string;
  sub?: string;
  email: string;
  userType: UserType;
  organizationId?: string;
  organization?: Organization;
  roles: string[];
  permissions: string[];
  isActive: boolean;
}

/**
 * JWT Strategy for Multi-Tenant Authentication
 * Validates JWT tokens and loads user context with organization
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(PortalUser)
    private portalUserRepository: Repository<PortalUser>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const { sub: userId, email, userType, organizationId, type, tenantId } = payload;

    if (type === 'portal' || userType === 'portal_user') {
      const portalUser = await this.portalUserRepository.findOne({
        where: { id: userId },
      });

      if (!portalUser || !portalUser.isActive) {
        throw new UnauthorizedException('User not found');
      }

      return {
        id: portalUser.id,
        userId: portalUser.id,
        sub: portalUser.id,
        email: portalUser.email,
        userType: UserType.ORG_USER,
        organizationId: portalUser.organizationId || portalUser.tenantId || tenantId,
        roles: [],
        permissions: [],
        isActive: portalUser.isActive,
      };
    }

    // Load user
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['organization'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // For org users, verify organization is active
    if (userType !== UserType.SUPER_ADMIN && organizationId) {
      const organization = await this.organizationRepository.findOne({
        where: { id: organizationId },
      });

      if (!organization) {
        throw new UnauthorizedException('Organization not found');
      }

      if (!organization.isActive) {
        throw new UnauthorizedException('Organization is suspended');
      }

      // Check subscription status
      if (
        organization.subscriptionStatus === 'expired' ||
        organization.subscriptionStatus === 'cancelled'
      ) {
        throw new UnauthorizedException('Subscription is inactive. Please renew.');
      }

      // Attach organization to user context
      user.organization = organization;
    }

    // Extract roles and permissions (stored as string arrays in user entity)
    const roles = user.roles || [];
    const permissions = user.permissions || [];

    return {
      id: user.id,
      userId: user.id,
      sub: user.id,
      email: user.email,
      userType: user.userType,
      organizationId: user.organizationId,
      organization: user.organization,
      roles,
      permissions: [...new Set(permissions)], // Remove duplicates
      isActive: user.isActive,
    };
  }
}
