import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User, UserType } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { Role } from '../entities/role.entity';
import { AuditLog, AuditAction, AuditEntityType } from '../entities/audit-log.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export interface InviteUserDto {
  email: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  roleIds?: string[];
  phoneNumber?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  organizationId?: string;
  phoneNumber?: string;
  roles?: string[];
  permissions?: string[];
}

export interface AcceptInvitationDto {
  token: string;
  password: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roleIds?: string[];
  userType?: UserType;
  organizationId?: string;
  permissions?: string[];
  preferences?: Record<string, any>;
}

export interface BulkUserOperation {
  userIds: string[];
  operation: 'activate' | 'deactivate' | 'delete';
}

export interface UserListFilter {
  userType?: UserType;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * User Management Service
 * Handles user invitations, team management, and seat limit validation
 */
@Injectable()
export class UserManagementService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  // Set user tier service via setter injection to avoid circular dependency
  private userTierService: any;

  setUserTierService(service: any) {
    this.userTierService = service;
  }

  /**
   * Create User directly (Super Admin or Org Admin)
   */
  async createUser(
    dto: CreateUserDto,
    createdBy: User,
  ): Promise<User> {
    if (createdBy.userType === UserType.ORG_USER) {
      throw new ForbiddenException('Only admins can create users');
    }

    if (createdBy.userType !== UserType.SUPER_ADMIN) {
      if (!createdBy.organizationId || createdBy.organizationId !== dto.organizationId) {
        throw new ForbiddenException('Cannot create users for other organizations');
      }
    }

    const email = dto.email.toLowerCase();
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    let organization: Organization | null = null;
    if (dto.organizationId) {
      organization = await this.organizationRepository.findOne({
        where: { id: dto.organizationId },
      });
      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      // Check user tier limits (skip for super admins)
      if (dto.userType !== UserType.SUPER_ADMIN && this.userTierService) {
        await this.userTierService.validateUserAddition(dto.organizationId);
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      userType: dto.userType,
      organizationId: dto.organizationId,
      roles: dto.roles || [],
      permissions: dto.permissions || [],
      passwordHash,
      isActive: true,
      isEmailVerified: true,
      isInvited: false,
    } as any);

    const savedUser = await this.userRepository.save(user) as any;

    if (organization) {
      organization.currentUserCount = await this.userRepository.count({
        where: { organizationId: organization.id, isActive: true },
      });
      await this.organizationRepository.save(organization);
    }

    await this.createAuditLog(
      savedUser.organizationId || '',
      createdBy.id,
      AuditAction.CREATE,
      AuditEntityType.USER,
      savedUser.id,
      `User created: ${savedUser.email}`,
    );

    return savedUser;
  }

  /**
   * Invite User to Organization
   * Validates seat limits before creating invitation
   */
  async inviteUser(
    organization_id: string,
    dto: InviteUserDto,
    invitedBy: User,
  ): Promise<{ user: User; invitationUrl: string }> {
    // Verify inviter permissions
    if (invitedBy.userType === UserType.ORG_USER) {
      throw new ForbiddenException('Only admins can invite users');
    }

    if (invitedBy.userType !== UserType.SUPER_ADMIN && invitedBy.organizationId !== organization_id) {
      throw new ForbiddenException('Cannot invite users to other organizations');
    }

    // Get organization
    const organization = await this.organizationRepository.findOne({
      where: { id: organization_id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check seat limit using user tier service (super admins excluded)
    if (dto.userType !== UserType.SUPER_ADMIN) {
      if (this.userTierService) {
        await this.userTierService.validateUserAddition(organization_id);
      } else {
        // Fallback to basic check
        const currentUserCount = await this.userRepository.count({
          where: { organizationId: organization_id, isActive: true },
        });

        if (currentUserCount >= organization.maxUsers) {
          throw new BadRequestException(
            `User limit reached (${organization.maxUsers} users). Please upgrade your plan.`
          );
        }
      }
    }

    // Check if email already exists in organization
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase(), organizationId: organization_id },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists in organization');
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationExpiry = new Date();
    invitationExpiry.setDate(invitationExpiry.getDate() + 7); // 7 days

    // Create user with pending invitation
    const user = this.userRepository.create({
      email: dto.email.toLowerCase(),
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      userType: dto.userType,
      organizationId: organization_id,
      isInvited: true,
      invitedAt: new Date(),
      invitationToken: await bcrypt.hash(invitationToken, 10),
      isActive: false,
      isEmailVerified: false,
      passwordHash: '', // Set on invitation acceptance
    });

    const savedUser = await this.userRepository.save(user);

    // Assign roles if provided (store as role IDs in roles array)
    if (dto.roleIds && dto.roleIds.length > 0) {
      savedUser.roles = dto.roleIds;
      await this.userRepository.save(savedUser);
    }

    // Update organization user count
    organization.currentUserCount = await this.userRepository.count({
      where: { organizationId: organization_id, isActive: true },
    });
    await this.organizationRepository.save(organization);

    // Create audit log
    await this.createAuditLog(
      organization_id,
      invitedBy.id,
      AuditAction.CREATE,
      AuditEntityType.USER,
      savedUser.id,
      `User invited: ${savedUser.email}`,
    );

    // Generate invitation URL with environment variable
    const frontendUrl = process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    const invitationUrl = `${frontendUrl}/invite/accept?token=${invitationToken}`;

    return { user: savedUser, invitationUrl };
  }

  /**
   * Accept Invitation
   * User sets password and activates account
   */
  async acceptInvitation(dto: AcceptInvitationDto): Promise<{ message: string; user: User }> {
    // Find user with valid invitation token
    const users = await this.userRepository.find({
      where: { isInvited: true, isActive: false },
    });

    let user: User | null = null;

    for (const u of users) {
      if (u.invitationToken) {
        const isTokenValid = await bcrypt.compare(dto.token, u.invitationToken);
        if (isTokenValid) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      throw new BadRequestException('Invalid or expired invitation token');
    }

    // Set password
    user.passwordHash = await bcrypt.hash(dto.password, 10);
    user.isActive = true;
    user.isEmailVerified = true;
    user.invitationAcceptedAt = new Date();
    user.invitationToken = null;

    await this.userRepository.save(user);

    // Update organization user count
    const organization = await this.organizationRepository.findOne({
      where: { id: user.organizationId },
    });

    if (organization) {
      organization.currentUserCount = await this.userRepository.count({
        where: { organizationId: user.organizationId, isActive: true },
      });
      await this.organizationRepository.save(organization);
    }

    // Create audit log
    await this.createAuditLog(
      user.organizationId || '',
      user.id,
      AuditAction.UPDATE,
      AuditEntityType.USER,
      user.id,
      'User accepted invitation and activated account',
    );

    return { message: 'Invitation accepted successfully', user };
  }

  /**
   * List Organization Users
   */
  async listUsers(
    organization_id: string,
    filter: UserListFilter,
    requestingUser: User,
  ): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    // Verify permissions
    if (requestingUser.userType !== UserType.SUPER_ADMIN && requestingUser.organizationId !== organization_id) {
      throw new ForbiddenException('Cannot view users from other organizations');
    }

    const page = filter.page || 1;
    const limit = filter.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization')
      .where('user.organizationId = :organizationId', { organizationId: organization_id });

    // Apply filters
    if (filter.userType) {
      queryBuilder.andWhere('user.userType = :userType', { userType: filter.userType });
    }

    if (filter.isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive: filter.isActive });
    }

    // Search filter
    if (filter.search) {
      queryBuilder.andWhere(
        '(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${filter.search}%` },
      );
    }

    // Pagination
    queryBuilder.skip(skip).take(limit);

    // Order by
    queryBuilder.orderBy('user.createdAt', 'DESC');

    const [users, total] = await queryBuilder.getManyAndCount();

    return { users, total, page, limit };
  }

  /**
   * List All Users (Super Admin)
   */
  async listAllUsers(
    filter: UserListFilter & { organizationId?: string },
    requestingUser: User,
  ): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    if (requestingUser.userType !== UserType.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can list all users');
    }

    const page = filter.page || 1;
    const limit = filter.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization');

    if (filter.organizationId) {
      queryBuilder.andWhere('user.organizationId = :organizationId', {
        organization_id: filter.organizationId,
      });
    }

    if (filter.userType) {
      queryBuilder.andWhere('user.userType = :userType', { userType: filter.userType });
    }

    if (filter.isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive: filter.isActive });
    }

    if (filter.search) {
      queryBuilder.andWhere(
        '(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${filter.search}%` },
      );
    }

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('user.createdAt', 'DESC');

    const [users, total] = await queryBuilder.getManyAndCount();

    return { users, total, page, limit };
  }

  /**
   * Get User by ID
   */
  async findById(user_id: string, requestingUser: User): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: user_id },
      relations: ['organization'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify permissions
    if (
      requestingUser.userType !== UserType.SUPER_ADMIN &&
      requestingUser.organizationId !== user.organizationId
    ) {
      throw new ForbiddenException('Cannot view users from other organizations');
    }

    return user;
  }

  /**
   * Update User
   */
  async updateUser(
    user_id: string,
    dto: UpdateUserDto,
    updatedBy: User,
  ): Promise<User> {
    const user = await this.findById(user_id, updatedBy);

    // Verify permissions
    if (updatedBy.userType === UserType.ORG_USER) {
      throw new ForbiddenException('Only admins can update users');
    }

    if (updatedBy.userType !== UserType.SUPER_ADMIN && updatedBy.organizationId !== user.organizationId) {
      throw new ForbiddenException('Cannot update users from other organizations');
    }

    // Track changes
    const changes: any = { before: {}, after: {} };

    // Update fields
    if (dto.firstName) {
      changes.before.firstName = user.firstName;
      user.firstName = dto.firstName;
      changes.after.firstName = dto.firstName;
    }

    if (dto.lastName) {
      changes.before.lastName = user.lastName;
      user.lastName = dto.lastName;
      changes.after.lastName = dto.lastName;
    }

    if (dto.phoneNumber !== undefined) {
      user.phoneNumber = dto.phoneNumber;
    }

    if (dto.userType && updatedBy.userType === UserType.SUPER_ADMIN) {
      changes.before.userType = user.userType;
      user.userType = dto.userType;
      changes.after.userType = dto.userType;
    }

    if (dto.organizationId !== undefined && updatedBy.userType === UserType.SUPER_ADMIN) {
      if (dto.organizationId) {
        const org = await this.organizationRepository.findOne({
          where: { id: dto.organizationId },
        });
        if (!org) {
          throw new NotFoundException('Organization not found');
        }
      }

      changes.before.organizationId = user.organizationId;
      user.organizationId = dto.organizationId;
      changes.after.organizationId = dto.organizationId;
    }

    // Update roles (store as role IDs in roles array)
    if (dto.roleIds) {
      user.roles = dto.roleIds;
    }

    if (dto.permissions) {
      user.permissions = dto.permissions;
    }

    if (dto.preferences) {
      user.preferences = { ...(user.preferences || {}), ...dto.preferences };
    }

    const updatedUser = await this.userRepository.save(user);

    if (dto.organizationId !== undefined) {
      if (changes.before.organizationId) {
        const prevOrg = await this.organizationRepository.findOne({
          where: { id: changes.before.organizationId },
        });
        if (prevOrg) {
          prevOrg.currentUserCount = await this.userRepository.count({
            where: { organizationId: prevOrg.id, isActive: true },
          });
          await this.organizationRepository.save(prevOrg);
        }
      }

      if (user.organizationId) {
        const nextOrg = await this.organizationRepository.findOne({
          where: { id: user.organizationId },
        });
        if (nextOrg) {
          nextOrg.currentUserCount = await this.userRepository.count({
            where: { organizationId: nextOrg.id, isActive: true },
          });
          await this.organizationRepository.save(nextOrg);
        }
      }
    }

    // Create audit log
    await this.createAuditLog(
      user.organizationId || '',
      updatedBy.id,
      AuditAction.UPDATE,
      AuditEntityType.USER,
      user.id,
      `User updated: ${user.email}`,
      undefined,
      undefined,
      false,
      changes,
    );

    return updatedUser;
  }

  /**
   * Change user password
   */
  async changePassword(
    user_id: string,
    currentPassword: string,
    newPassword: string,
    requestingUser: User,
  ): Promise<User> {
    const user = await this.findById(user_id, requestingUser);

    if (requestingUser.userType !== UserType.SUPER_ADMIN && requestingUser.id !== user_id) {
      throw new ForbiddenException('Cannot change another user password');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    return this.userRepository.save(user);
  }

  /**
   * Deactivate User
   */
  async deactivateUser(user_id: string, deactivatedBy: User): Promise<User> {
    const user = await this.findById(user_id, deactivatedBy);

    // Verify permissions
    if (deactivatedBy.userType === UserType.ORG_USER) {
      throw new ForbiddenException('Only admins can deactivate users');
    }

    if (!user.isActive) {
      throw new BadRequestException('User is already deactivated');
    }

    user.isActive = false;

    await this.userRepository.save(user);

    // Update organization user count
    if (user.organizationId) {
      const organization = await this.organizationRepository.findOne({
        where: { id: user.organizationId },
      });

      if (organization) {
        organization.currentUserCount = await this.userRepository.count({
          where: { organizationId: user.organizationId, isActive: true },
        });
        await this.organizationRepository.save(organization);
      }
    }

    // Create audit log
    await this.createAuditLog(
      user.organizationId || '',
      deactivatedBy.id,
      AuditAction.UPDATE,
      AuditEntityType.USER,
      user.id,
      `User deactivated: ${user.email}`,
      undefined,
      undefined,
      true,
    );

    return user;
  }

  /**
   * Reactivate User
   */
  async reactivateUser(user_id: string, reactivatedBy: User): Promise<User> {
    const user = await this.findById(user_id, reactivatedBy);

    // Verify permissions
    if (reactivatedBy.userType === UserType.ORG_USER) {
      throw new ForbiddenException('Only admins can reactivate users');
    }

    if (user.isActive) {
      throw new BadRequestException('User is already active');
    }

    // Check seat limit
    if (user.organizationId && user.userType !== UserType.SUPER_ADMIN) {
      const organization = await this.organizationRepository.findOne({
        where: { id: user.organizationId },
      });

      if (organization) {
        const currentUserCount = await this.userRepository.count({
          where: { organizationId: user.organizationId, isActive: true },
        });

        if (currentUserCount >= organization.maxUsers) {
          throw new BadRequestException(
            `User limit reached (${organization.maxUsers} users). Please upgrade your plan.`
          );
        }
      }
    }

    user.isActive = true;

    await this.userRepository.save(user);

    // Update organization user count
    if (user.organizationId) {
      const organization = await this.organizationRepository.findOne({
        where: { id: user.organizationId },
      });

      if (organization) {
        organization.currentUserCount = await this.userRepository.count({
          where: { organizationId: user.organizationId, isActive: true },
        });
        await this.organizationRepository.save(organization);
      }
    }

    // Create audit log
    await this.createAuditLog(
      user.organizationId || '',
      reactivatedBy.id,
      AuditAction.UPDATE,
      AuditEntityType.USER,
      user.id,
      `User reactivated: ${user.email}`,
    );

    return user;
  }

  /**
   * Bulk User Operations
   */
  async bulkOperation(
    organization_id: string,
    operation: BulkUserOperation,
    performedBy: User,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    // Verify permissions
    if (performedBy.userType === UserType.ORG_USER) {
      throw new ForbiddenException('Only admins can perform bulk operations');
    }

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const userId of operation.userIds) {
      try {
        switch (operation.operation) {
          case 'activate':
            await this.reactivateUser(userId, performedBy);
            success++;
            break;
          case 'deactivate':
            await this.deactivateUser(userId, performedBy);
            success++;
            break;
          case 'delete':
            // Soft delete - deactivate user
            await this.deactivateUser(userId, performedBy);
            success++;
            break;
        }
      } catch (error: any) {
        failed++;
        errors.push(`User ${userId}: ${error.message}`);
      }
    }

    // Create audit log
    await this.createAuditLog(
      organization_id,
      performedBy.id,
      AuditAction.UPDATE,
      AuditEntityType.USER,
      organization_id,
      `Bulk operation ${operation.operation}: ${success} succeeded, ${failed} failed`,
    );

    return { success, failed, errors };
  }

  /**
   * Get User Activity Summary
   */
  async getUserActivity(user_id: string, requestingUser: User): Promise<any> {
    const user = await this.findById(user_id, requestingUser);

    // Get audit logs for user
    const recentActivity = await this.auditLogRepository.find({
      where: { user_id: user_id },
      order: { created_at: 'DESC' },
      take: 20,
    });

    return {
      user_id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      userType: user.userType,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      invitedAt: user.invitedAt,
      invitationAcceptedAt: user.invitationAcceptedAt,
      recentActivity: recentActivity.map(log => ({
        action: log.action,
        entity_type: log.entity_type,
        description: (log as any).description || '',
        timestamp: log.created_at,
      })),
    };
  }

  /**
   * Create Audit Log Entry
   */
  private async createAuditLog(
    organization_id: string,
    user_id: string,
    action: AuditAction,
    entity_type: AuditEntityType,
    entity_id: string,
    description: string,
    ipAddress?: string,
    userAgent?: string,
    isSecurityEvent: boolean = false,
    changes?: any,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: user_id } });

    if (!user) return;

    const auditLog = this.auditLogRepository.create({
      organization_id,
      user_id,
      action,
      entity_type,
      entity_id,
      description,
      metadata: {
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        changes,
        ipAddress: ipAddress,
        userAgent,
        isSecurityEvent,
      },
    } as any);

    await this.auditLogRepository.save(auditLog);
  }
}
