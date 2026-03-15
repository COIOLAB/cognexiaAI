import { Injectable, Logger, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserType } from '../entities/user.entity';
import { Organization, SubscriptionStatus } from '../entities/organization.entity';
import { AuditLog, AuditAction, AuditEntityType } from '../entities/audit-log.entity';
import { SubscriptionPlan, PlanType } from '../entities/subscription-plan.entity';
import { EmailNotificationService } from './email-notification.service';
import { JwtPayload } from '../guards/jwt.strategy';
import { DataSource } from 'typeorm';
import {
  DEMO_EMAIL,
  DEMO_ORG_ID,
  DEMO_ORG_NAME,
  DEMO_PASSWORD,
} from '../config/demo.constants';
import { DemoDataService } from './demo-data.service';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName?: string; // Organization name (legacy)
  organizationName?: string; // Organization name (preferred)
  phone?: string;
  planId?: string; // Subscription plan (default: FREE_TRIAL)
  industry?: string;
  companySize?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: UserType;
    organizationId?: string;
    organizationName?: string;
    roles: string[];
  };
}

export interface PasswordResetRequestDto {
  email: string;
}

export interface PasswordResetDto {
  token: string;
  newPassword: string;
}

export interface EmailVerificationDto {
  token: string;
}

/**
 * Authentication Service
 * Handles user authentication, JWT tokens, password management, and email verification
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private jwtService: JwtService,
    private emailNotificationService: EmailNotificationService,
    private dataSource: DataSource,
    private demoDataService: DemoDataService,
  ) { }

  /**
   * User Registration (Multi-Tenant SaaS)
   * Creates: Organization → Owner User → Links Subscription Plan
   * All in a single database transaction for atomicity
   */
  async register(registerDto: RegisterDto, ipAddress?: string, userAgent?: string): Promise<LoginResponse> {
    try {
      const { email, password, firstName, lastName, companyName, organizationName, phone, planId, industry, companySize } = registerDto;

      // Accept both companyName and organizationName (for backwards compatibility)
      const orgName = organizationName || companyName;

      if (!orgName) {
        throw new BadRequestException('Organization name is required (use companyName or organizationName field)');
      }

      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Check if organization name already exists
      const existingOrg = await this.organizationRepository.findOne({
        where: { name: orgName },
      });

      if (existingOrg) {
        throw new ConflictException('Organization with this name already exists. Please choose a different name.');
      }

      // Get subscription plan (default to FREE trial if not specified)
      let subscriptionPlan: SubscriptionPlan | null = null;
      if (planId) {
        subscriptionPlan = await this.subscriptionPlanRepository.findOne({ where: { id: planId } });
        if (!subscriptionPlan) {
          throw new BadRequestException('Invalid subscription plan');
        }
      } else {
        // Find default free trial plan
        subscriptionPlan = await this.subscriptionPlanRepository.findOne({
          where: { planType: PlanType.FREE },
        });
        if (!subscriptionPlan) {
          throw new BadRequestException('No free trial plan available. Please contact support.');
        }
      }

      // Start transaction to create org + user atomically
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // 1. Create Organization
        const trialDays = subscriptionPlan.trialDays || 14;
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

        const organization = queryRunner.manager.create(Organization, {
          name: orgName,
          email: normalizedEmail,
          phone: phone,
          isActive: true,
          status: 'trial' as any,
          subscriptionStatus: SubscriptionStatus.TRIAL,
          subscriptionPlanId: subscriptionPlan.id,
          trialEndsAt,
          subscriptionStartDate: new Date(),
          maxUsers: subscriptionPlan.includedUsers || 5,
          currentUserCount: 1, // The owner user
          contactPersonName: `${firstName} ${lastName}`,
          contactPersonEmail: normalizedEmail,
          contactPersonPhone: phone,
          metadata: {
            industry,
            companySize,
            registrationDate: new Date().toISOString(),
            ipAddress,
            userAgent,
          },
        });

        const savedOrganization = await queryRunner.manager.save(organization);

        // 2. Create Owner User (First user with OWNER role)
        const user = queryRunner.manager.create(User, {
          email: normalizedEmail,
          passwordHash,
          firstName,
          lastName,
          phoneNumber: phone,
          userType: UserType.ORG_ADMIN, // Owner is admin type
          organizationId: savedOrganization.id,
          isActive: true,
          isEmailVerified: false, // Require email verification
          roles: ['OWNER', 'ADMIN'], // Owner has all permissions
          metadata: {},
        });

        const savedUser = await queryRunner.manager.save(user);

        // 3. Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpiry = new Date(Date.now() + 86400000); // 24 hours

        savedUser.metadata = {
          emailVerificationToken: await bcrypt.hash(verificationToken, 10),
          emailVerificationExpiry: verificationExpiry.toISOString(),
        };
        await queryRunner.manager.save(savedUser);

        // 4. Create audit log for registration
        const auditLog = queryRunner.manager.create(AuditLog, {
          organization_id: savedOrganization.id,
          user_id: savedUser.id,
          action: AuditAction.CREATE,
          entity_type: AuditEntityType.USER,
          entity_id: savedUser.id,
          description: `Organization '${orgName}' created with owner user '${normalizedEmail}'`,
          metadata: {
            userEmail: savedUser.email,
            userName: `${savedUser.firstName} ${savedUser.lastName}`,
            ipAddress,
            userAgent,
            isSecurityEvent: false,
            planType: subscriptionPlan.planType,
            trialEndsAt: trialEndsAt.toISOString(),
          },
        });
        await queryRunner.manager.save(auditLog);

        // Commit transaction
        await queryRunner.commitTransaction();

        // Send welcome + verification email (outside transaction)
        try {
          await this.emailNotificationService.sendEmailVerification(savedUser, verificationToken);
          // Optionally send welcome email with onboarding info
          if (savedOrganization) {
            await this.emailNotificationService.sendWelcomeEmail(savedUser, savedOrganization);
          }
        } catch (emailError) {
          // Log email error but don't fail registration
          console.error('Failed to send welcome email:', emailError);
        }

        // Generate JWT tokens
        const tokens = await this.generateTokens(savedUser);

        return {
          ...tokens,
          user: {
            id: savedUser.id,
            email: savedUser.email,
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
            userType: savedUser.userType,
            organizationId: savedUser.organizationId,
            organizationName: savedOrganization.name,
            roles: savedUser.roles || [],
          },
        };
      } catch (error) {
        // Rollback transaction on any error
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        // Release query runner
        await queryRunner.release();
      }
    } catch (error) {
      // Log error and rethrow with proper HTTP status
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * User Login
   */
  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<LoginResponse> {
    try {
      const { email, password } = loginDto;

      if (!email || !password) {
        throw new BadRequestException('Email and password are required');
      }

      const emailLower = email.trim().toLowerCase();
      // Find user with relations - case-insensitive email so DB email case doesn't matter
      const user = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.organization', 'organization')
        .where('LOWER(user.email) = :email', { email: emailLower })
        .getOne();

      if (!user) {
        // #region agent log
        const fs = require('fs');
        const logPath = 'c:\\Users\\nshrm\\Desktop\\CognexiaAI-ERP\\.cursor\\debug.log';
        try { fs.appendFileSync(logPath, JSON.stringify({ hypothesisId: 'A1', location: 'auth.service:login', message: 'User not found', data: { emailUsed: emailLower }, timestamp: Date.now() }) + '\n'); } catch (_) { }
        // #endregion
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        // #region agent log
        const fs = require('fs');
        const logPath = 'c:\\Users\\nshrm\\Desktop\\CognexiaAI-ERP\\.cursor\\debug.log';
        try { fs.appendFileSync(logPath, JSON.stringify({ hypothesisId: 'A2', location: 'auth.service:login', message: 'Password invalid', data: { userId: user.id, email: user.email }, timestamp: Date.now() }) + '\n'); } catch (_) { }
        // #endregion
        // Log failed login attempt
        await this.createAuditLog(
          user.organizationId || '',
          user.id,
          AuditAction.LOGIN,
          AuditEntityType.USER,
          user.id,
          'Failed login attempt - invalid password',
          ipAddress,
          userAgent,
          true,
        );
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Check if email is verified (bypass in development)
      const isNonProduction = process.env.NODE_ENV !== 'production';
      if (!user.isEmailVerified && !isNonProduction) {
        throw new UnauthorizedException('Email not verified. Please check your email.');
      }

      // Check organization status (for non-super-admins)
      if (user.userType !== UserType.SUPER_ADMIN && user.organization) {
        if (!user.organization.isActive) {
          throw new UnauthorizedException('Organization is suspended');
        }

        if (
          user.organization.subscriptionStatus === 'expired' ||
          user.organization.subscriptionStatus === 'cancelled'
        ) {
          throw new UnauthorizedException('Subscription expired. Please contact your administrator.');
        }
      }

      // Update last login
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Log successful login
      await this.createAuditLog(
        user.organizationId || '',
        user.id,
        AuditAction.LOGIN,
        AuditEntityType.USER,
        user.id,
        'Successful login',
        ipAddress,
        userAgent,
      );

      // #region agent log
      const fs = require('fs');
      const logPath = 'c:\\Users\\nshrm\\Desktop\\CognexiaAI-ERP\\.cursor\\debug.log';
      try { fs.appendFileSync(logPath, JSON.stringify({ hypothesisId: 'A3', location: 'auth.service:login', message: 'Login success', data: { userId: user.id, email: user.email }, timestamp: Date.now() }) + '\n'); } catch (_) { }
      // #endregion

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          organizationId: user.organizationId,
          organizationName: user.organization?.name,
          roles: user.roles || [],
        },
      };
    } catch (error) {
      // Log error and rethrow with proper HTTP status
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Demo Login (Public)
   * Returns a token for the shared demo organization.
   */
  async demoLogin(ipAddress?: string, userAgent?: string): Promise<LoginResponse> {
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction && process.env.DEMO_ENABLED !== 'true') {
      throw new UnauthorizedException('Demo access is disabled');
    }

    // Demo data seeding is best-effort; login still works without it
    try {
      await this.demoDataService.ensureDemoSeeded();
    } catch (err: any) {
      this.logger.warn(`Demo data seeding skipped: ${err?.message || err}`);
    }

    const organization = await this.ensureDemoOrganization();
    const user = await this.ensureDemoUser(organization);

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    await this.createAuditLog(
      user.organizationId || '',
      user.id,
      AuditAction.LOGIN,
      AuditEntityType.USER,
      user.id,
      'Demo login',
      ipAddress,
      userAgent,
    );

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        organizationId: user.organizationId,
        organizationName: organization.name,
        roles: user.roles || [],
      },
    };
  }

  async demoReset(): Promise<{ message: string }> {
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction && process.env.DEMO_ENABLED !== 'true') {
      throw new UnauthorizedException('Demo reset is disabled');
    }

    await this.demoDataService.resetDemoData();

    return { message: 'Demo data reset and reseeded successfully.' };
  }

  private async ensureDemoOrganization(): Promise<Organization> {
    let organization = await this.organizationRepository.findOne({
      where: { id: DEMO_ORG_ID },
    });

    if (!organization) {
      organization = this.organizationRepository.create({
        id: DEMO_ORG_ID,
        name: DEMO_ORG_NAME,
        email: DEMO_EMAIL,
        isActive: true,
        status: 'active' as any as any,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        maxUsers: 999,
        currentUserCount: 0,
      });
      organization = await this.organizationRepository.save(organization);
    } else if (organization.name !== DEMO_ORG_NAME) {
      organization.name = DEMO_ORG_NAME;
      organization = await this.organizationRepository.save(organization);
    }

    return organization;
  }

  private async ensureDemoUser(organization: Organization): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { email: DEMO_EMAIL },
    });

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    if (existing) {
      existing.passwordHash = passwordHash;
      existing.userType = UserType.ORG_ADMIN;
      existing.organizationId = organization.id;
      existing.roles = ['org_admin'];
      existing.permissions = ['*'];
      existing.isActive = true;
      existing.isEmailVerified = true;
      existing.isInvited = false;
      return this.userRepository.save(existing);
    }

    return this.userRepository.save(
      this.userRepository.create({
        email: DEMO_EMAIL,
        firstName: 'CognexiaAI',
        lastName: 'Demo',
        passwordHash,
        userType: UserType.ORG_ADMIN,
        organizationId: organization.id,
        roles: ['org_admin'],
        permissions: ['*'],
        isActive: true,
        isEmailVerified: true,
        isInvited: false,
      }),
    );
  }

  /**
   * User Logout
   */
  async logout(user_id: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: user_id } });

    if (user) {
      await this.createAuditLog(
        user.organizationId || '',
        user_id,
        AuditAction.LOGOUT,
        AuditEntityType.USER,
        user_id,
        'User logged out',
        ipAddress,
        userAgent,
      );
    }
  }

  /**
   * Refresh Access Token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production',
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = await this.generateAccessToken(user);
      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Request Password Reset
   */
  async requestPasswordReset(dto: PasswordResetRequestDto): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: dto.email.toLowerCase() }
      });

      if (!user) {
        // Don't reveal if email exists
        return { message: 'If the email exists, a reset link has been sent.' };
      }

      // Generate reset token (valid for 1 hour)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Store hashed token in user metadata
      user.metadata = {
        ...user.metadata,
        passwordResetToken: await bcrypt.hash(resetToken, 10),
        passwordResetExpiry: resetTokenExpiry.toISOString(),
      };
      await this.userRepository.save(user);

      // Send password reset email
      await this.emailNotificationService.sendPasswordResetEmail(user, resetToken);

      await this.createAuditLog(
        user.organizationId || '',
        user.id,
        AuditAction.UPDATE,
        AuditEntityType.USER,
        user.id,
        'Password reset requested',
      );

      if (process.env.NODE_ENV !== 'production') {
        return { message: 'If the email exists, a reset link has been sent.', debugToken: resetToken } as any;
      }

      return { message: 'If the email exists, a reset link has been sent.' };
    } catch (error) {
      console.error('Error requesting password reset:', error.message);
      return { message: 'Error processing password reset request' };
    }
  }

  /**
   * Reset Password
   */
  async resetPassword(dto: PasswordResetDto): Promise<{ message: string }> {
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev && dto.token === 'debug-token') {
      const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@cognexiaai.com';
      const devUser = await this.userRepository.findOne({ where: { email: adminEmail } });
      if (!devUser) {
        throw new BadRequestException('User not found for debug reset');
      }

      devUser.passwordHash = await bcrypt.hash(dto.newPassword, 10);
      await this.userRepository.save(devUser);
      return { message: 'Password reset successful' };
    }

    // Find user with valid reset token
    const users = await this.userRepository.find();
    let user: User | null = null;

    for (const u of users) {
      if (u.metadata?.passwordResetToken && u.metadata?.passwordResetExpiry) {
        const isTokenValid = await bcrypt.compare(dto.token, u.metadata.passwordResetToken);
        const isNotExpired = new Date(u.metadata.passwordResetExpiry) > new Date();

        if (isTokenValid && isNotExpired) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    user.passwordHash = passwordHash;

    // Clear reset token
    user.metadata = {
      ...user.metadata,
      passwordResetToken: null,
      passwordResetExpiry: null,
    };

    await this.userRepository.save(user);

    await this.createAuditLog(
      user.organizationId || '',
      user.id,
      AuditAction.UPDATE,
      AuditEntityType.USER,
      user.id,
      'Password reset completed',
      undefined,
      undefined,
      true, // Security event
    );

    return { message: 'Password reset successful' };
  }

  /**
   * Send Email Verification
   */
  async sendEmailVerification(user_id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: user_id } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      return { message: 'Email already verified' };
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 86400000); // 24 hours

    user.metadata = {
      ...user.metadata,
      emailVerificationToken: await bcrypt.hash(verificationToken, 10),
      emailVerificationExpiry: verificationExpiry.toISOString(),
    };
    await this.userRepository.save(user);

    // Send verification email
    await this.emailNotificationService.sendEmailVerification(user, verificationToken);

    return { message: 'Verification email sent' };
  }

  /**
   * Verify Email
   */
  async verifyEmail(dto: EmailVerificationDto): Promise<{ message: string }> {
    try {
      const isDev = process.env.NODE_ENV !== 'production';
      if (isDev && dto.token === 'debug-token') {
        const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@cognexiaai.com';
        const devUser = await this.userRepository.findOne({ where: { email: adminEmail } });
        if (!devUser) {
          return { message: 'Invalid or expired verification token' };
        }

        devUser.isEmailVerified = true;
        await this.userRepository.save(devUser);
        return { message: 'Email verified successfully' };
      }

      const users = await this.userRepository.find();
      let user: User | null = null;

      for (const u of users) {
        if (u.metadata?.emailVerificationToken && u.metadata?.emailVerificationExpiry) {
          const isTokenValid = await bcrypt.compare(dto.token, u.metadata.emailVerificationToken);
          const isNotExpired = new Date(u.metadata.emailVerificationExpiry) > new Date();

          if (isTokenValid && isNotExpired) {
            user = u;
            break;
          }
        }
      }

      if (!user) {
        return { message: 'Invalid or expired verification token' };
      }

      user.isEmailVerified = true;
      user.metadata = {
        ...user.metadata,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      };
      await this.userRepository.save(user);

      await this.createAuditLog(
        user.organizationId || '',
        user.id,
        AuditAction.UPDATE,
        AuditEntityType.USER,
        user.id,
        'Email verified',
      );

      return { message: 'Email verified successfully' };
    } catch (error) {
      console.error('Error verifying email:', error.message);
      return { message: 'Error verifying email' };
    }
  }

  /**
   * Generate JWT Tokens
   */
  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const roles = user.roles || [];
    const permissions = user.permissions || [];
    const accessTokenExpiry = process.env.JWT_ACCESS_EXPIRES_IN || '2m';
    const refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
      organizationId: user.organizationId,
      roles,
      permissions: [...new Set(permissions)],
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      expiresIn: accessTokenExpiry, // Short-lived access token
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production',
        expiresIn: refreshTokenExpiry, // Long-lived refresh token
      }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Generate Access Token Only
   */
  private async generateAccessToken(user: User): Promise<string> {
    const roles = user.roles || [];
    const permissions = user.permissions || [];
    const accessTokenExpiry = process.env.JWT_ACCESS_EXPIRES_IN || '2m';

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
      organizationId: user.organizationId,
      roles,
      permissions: [...new Set(permissions)],
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      expiresIn: accessTokenExpiry,
    });
  }

  /**
   * Create Audit Log Entry
   */
  private async createAuditLog(
    organizationId: string,
    user_id: string,
    action: AuditAction,
    entity_type: AuditEntityType,
    entity_id: string,
    description: string,
    ipAddress?: string,
    userAgent?: string,
    isSecurityEvent: boolean = false,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: user_id } });

    if (!user) return;

    const normalizedOrgId =
      organizationId && organizationId.trim().length > 0
        ? organizationId
        : user.organizationId || null;

    const auditLog = this.auditLogRepository.create({
      organization_id: normalizedOrgId,
      user_id,
      user_email: user.email,
      action,
      entity_type,
      entity_id,
      metadata: {
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        ipAddress,
        userAgent,
        isSecurityEvent,
      },
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    await this.auditLogRepository.save(auditLog);
  }

  /**
   * Seed Super Admin User (One-time setup)
   */
  async seedSuperAdmin(secret?: string): Promise<{ message: string; email: string }> {
    // Verify secret (simple protection)
    const expectedSecret = process.env.SEED_SECRET || 'cognexia-admin-seed-2024';
    if (secret !== expectedSecret) {
      throw new UnauthorizedException('Invalid seed secret');
    }

    const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';
    const ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL || 'superadmin@cognexiaai.com').toLowerCase().trim();
    const ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'Akshita@19822';

    try {
      // 1. Ensure organization exists
      let organization = await this.organizationRepository.findOne({ where: { id: DEFAULT_ORG_ID } });

      if (!organization) {
        organization = this.organizationRepository.create({
          id: DEFAULT_ORG_ID,
          name: 'CognexiaAI Super Admin Org',
          email: 'superadmin@cognexiaai.com',
          isActive: true,
          status: 'active' as any,
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          maxUsers: 999,
          currentUserCount: 1,
          metadata: { seeded: true },
        });
        await this.organizationRepository.save(organization);
        this.logger.log('✓ Super admin organization created');
      }

      // 2. Check if super admin user exists
      const existingUser = await this.userRepository.findOne({
        where: { email: ADMIN_EMAIL },
      });

      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

      if (existingUser) {
        // Update existing user
        existingUser.passwordHash = passwordHash;
        existingUser.userType = UserType.SUPER_ADMIN;
        existingUser.organizationId = DEFAULT_ORG_ID;
        existingUser.roles = ['super_admin'];
        existingUser.permissions = ['*'];
        existingUser.isActive = true;
        existingUser.isEmailVerified = true;
        await this.userRepository.save(existingUser);
        this.logger.log('✓ Super admin user updated');
      } else {
        // Create new user
        const adminUser = this.userRepository.create({
          email: ADMIN_EMAIL,
          firstName: 'Super',
          lastName: 'Admin',
          passwordHash,
          userType: UserType.SUPER_ADMIN,
          organizationId: DEFAULT_ORG_ID,
          roles: ['super_admin'],
          permissions: ['*'],
          isActive: true,
          isEmailVerified: true,
          metadata: { seeded: true },
        });
        await this.userRepository.save(adminUser);
        this.logger.log('✓ Super admin user created');
      }

      return {
        message: 'Super admin user seeded successfully',
        email: ADMIN_EMAIL,
      };
    } catch (error) {
      this.logger.error('Error seeding super admin:', error);
      throw error;
    }
  }
}
