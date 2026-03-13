import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { User, UserType } from '../entities/user.entity';
import { AuditLog, AuditAction, AuditEntityType } from '../entities/audit-log.entity';
import {
  UserTier,
  TierConfiguration,
  UpdateUserTierDto,
  UserTierAllocationDto,
  UserAllocationResponse,
} from '../dto/user-tier.dto';

@Injectable()
export class UserTierService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) { }

  /**
   * Get default tier configuration
   */
  private getDefaultTierConfig(): TierConfiguration {
    return {
      basic: {
        enabled: false,
        maxUsers: 1,
      },
      premium: {
        enabled: false,
        maxUsers: 10,
      },
      advanced: {
        enabled: false,
        maxUsers: null, // unlimited
      },
    };
  }

  /**
   * Get max users for a tier
   */
  private getMaxUsersForTier(tier: UserTier, config: TierConfiguration): number | null {
    switch (tier) {
      case UserTier.BASIC:
        return config.basic.maxUsers;
      case UserTier.PREMIUM:
        return config.premium.maxUsers;
      case UserTier.ADVANCED:
        return config.advanced.maxUsers; // null = unlimited
      default:
        return 1;
    }
  }

  /**
   * Get active tier for organization
   */
  private getActiveTier(config: any): UserTier {
    if (!config) return UserTier.BASIC;

    // Priority: Advanced > Premium > Basic
    if (config.advanced?.enabled) return UserTier.ADVANCED;
    if (config.premium?.enabled) return UserTier.PREMIUM;
    if (config.basic?.enabled) return UserTier.BASIC;

    return UserTier.BASIC;
  }

  /**
   * Get user tier allocation for organization
   */
  async getUserTierAllocation(organizationId: string): Promise<UserTierAllocationDto> {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const tierConfig = organization.userTierConfig || this.getDefaultTierConfig();
    const activeTier = this.getActiveTier(tierConfig);
    const maxAllowedUsers = this.getMaxUsersForTier(activeTier, tierConfig);
    const currentUserCount = await this.userRepository.count({
      where: { organizationId: organizationId, isActive: true },
    });

    const canAddUsers = maxAllowedUsers === null || currentUserCount < maxAllowedUsers;

    return {
      organizationId: organizationId,
      activeTier,
      tierConfig,
      currentUserCount,
      maxAllowedUsers,
      canAddUsers,
    };
  }

  /**
   * Update user tier for organization (Super Admin only)
   */
  async updateUserTier(
    organizationId: string,
    dto: UpdateUserTierDto,
    performedBy: User,
  ): Promise<UserAllocationResponse> {
    // Verify super admin
    if (performedBy.userType !== UserType.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can manage user tiers');
    }

    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Get current config or default
    const currentConfig = organization.userTierConfig || this.getDefaultTierConfig();

    // Update the specific tier
    switch (dto.tier) {
      case UserTier.BASIC:
        currentConfig.basic.enabled = dto.enabled;
        if (dto.customMaxUsers) {
          currentConfig.basic.maxUsers = dto.customMaxUsers;
        }
        break;
      case UserTier.PREMIUM:
        currentConfig.premium.enabled = dto.enabled;
        if (dto.customMaxUsers) {
          currentConfig.premium.maxUsers = dto.customMaxUsers;
        }
        break;
      case UserTier.ADVANCED:
        currentConfig.advanced.enabled = dto.enabled;
        // Advanced is always unlimited, but can be customized
        if (dto.customMaxUsers !== undefined) {
          currentConfig.advanced.maxUsers = dto.customMaxUsers || null;
        }
        break;
    }

    // Update active tier and maxUsers based on enabled tiers
    const newActiveTier = this.getActiveTier(currentConfig);
    const newMaxUsers = this.getMaxUsersForTier(newActiveTier, currentConfig);

    (organization as any).userTierConfig = currentConfig;
    organization.maxUsers = newMaxUsers || 999999; // Set high number for unlimited

    await this.organizationRepository.save(organization);

    // Create audit log
    await this.auditLogRepository.save(
      this.auditLogRepository.create({
        organizationId: organizationId,
        user_id: performedBy.id,
        action: AuditAction.UPDATE,
        entity_type: AuditEntityType.ORGANIZATION,
        entity_id: organizationId,
        description: `Updated user tier: ${dto.tier} to ${dto.enabled ? 'enabled' : 'disabled'}`,
        metadata: {
          tier: dto.tier,
          enabled: dto.enabled,
          customMaxUsers: dto.customMaxUsers,
          newMaxUsers,
        },
      } as any),
    );

    const allocation = await this.getUserTierAllocation(organizationId);

    return {
      success: true,
      message: `User tier ${dto.tier} ${dto.enabled ? 'enabled' : 'disabled'} successfully`,
      allocation,
    };
  }

  /**
   * Check if organization can add more users
   */
  async canAddUser(organizationId: string): Promise<{ canAdd: boolean; reason?: string }> {
    const allocation = await this.getUserTierAllocation(organizationId);

    if (!allocation.canAddUsers) {
      const tierName = allocation.activeTier.toUpperCase();
      return {
        canAdd: false,
        reason: `User limit reached for ${tierName} tier (${allocation.currentUserCount}/${allocation.maxAllowedUsers}). Please upgrade to add more users.`,
      };
    }

    return { canAdd: true };
  }

  /**
   * Validate user addition before creation
   */
  async validateUserAddition(organizationId: string): Promise<void> {
    const check = await this.canAddUser(organizationId);

    if (!check.canAdd) {
      throw new BadRequestException(check.reason);
    }
  }

  /**
   * Initialize default tier for organization
   */
  async initializeDefaultTier(organizationId: string): Promise<void> {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (!organization.userTierConfig) {
      const defaultConfig = this.getDefaultTierConfig();
      // Enable basic tier by default
      defaultConfig.basic.enabled = true;

      (organization as any).userTierConfig = defaultConfig;
      organization.maxUsers = 1; // Basic tier default

      await this.organizationRepository.save(organization);
    }
  }

  /**
   * Get all organizations with their tier allocations (Super Admin)
   */
  async getAllOrganizationTiers(performedBy: User): Promise<UserTierAllocationDto[]> {
    if (performedBy.userType !== UserType.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can view all organization tiers');
    }

    const organizations = await this.organizationRepository.find({
      select: ['id', 'name', 'currentUserCount', 'maxUsers', 'userTierConfig'],
    });

    const allocations: UserTierAllocationDto[] = [];

    for (const org of organizations) {
      const allocation = await this.getUserTierAllocation(org.id);
      allocations.push(allocation);
    }

    return allocations;
  }
}
