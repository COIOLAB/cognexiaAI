import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan, PlanType, BillingInterval } from '../entities/subscription-plan.entity';
import { Organization, SubscriptionStatus } from '../entities/organization.entity';
import { User, UserType } from '../entities/user.entity';
import { AuditLog, AuditAction, AuditEntityType } from '../entities/audit-log.entity';

export interface CreatePlanDto {
  name: string;
  planType: PlanType;
  description?: string;
  price: number;
  currency?: string;
  billingInterval?: BillingInterval;
  includedUsers: number;
  pricePerAdditionalUser?: number;
  maxUsers?: number;
  storageLimit?: number;
  apiCallsPerMonth?: number;
  features: string[];
  featureFlags?: Record<string, boolean>;
  trialDays?: number;
  isPopular?: boolean;
}

export interface UpdatePlanDto {
  name?: string;
  description?: string;
  price?: number;
  includedUsers?: number;
  pricePerAdditionalUser?: number;
  maxUsers?: number;
  storageLimit?: number;
  apiCallsPerMonth?: number;
  features?: string[];
  featureFlags?: Record<string, boolean>;
  trialDays?: number;
  isPopular?: boolean;
  isActive?: boolean;
}

export interface ChangePlanDto {
  newPlanId: string;
  billingInterval?: BillingInterval;
}

/**
 * Subscription Management Service
 * Handles subscription plans, lifecycle, and upgrades/downgrades
 */
@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private planRepository: Repository<SubscriptionPlan>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Create Subscription Plan
   * Super admin only
   */
  async createPlan(dto: CreatePlanDto, createdBy: User): Promise<SubscriptionPlan> {
    if (createdBy.userType !== UserType.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can create subscription plans');
    }

    // Check if plan type already exists
    const existingPlan = await this.planRepository.findOne({
      where: { planType: dto.planType },
    });

    if (existingPlan) {
      throw new BadRequestException(`Plan type ${dto.planType} already exists`);
    }

    const plan = this.planRepository.create({
      name: dto.name,
      planType: dto.planType,
      description: dto.description,
      price: dto.price,
      currency: dto.currency || 'USD',
      billingInterval: dto.billingInterval || BillingInterval.MONTHLY,
      includedUsers: dto.includedUsers,
      pricePerAdditionalUser: dto.pricePerAdditionalUser || 0,
      maxUsers: dto.maxUsers,
      storageLimit: dto.storageLimit,
      apiCallsPerMonth: dto.apiCallsPerMonth,
      features: dto.features,
      featureFlags: dto.featureFlags,
      trialDays: dto.trialDays || 14,
      isPopular: dto.isPopular || false,
      isActive: true,
    });

    const savedPlan = await this.planRepository.save(plan);

    // Create audit log
    const auditLog = this.auditLogRepository.create({
      organization_id: '',
      user_id: createdBy.id,
      action: AuditAction.CREATE,
      entity_type: AuditEntityType.ORGANIZATION,
      entity_id: savedPlan.id,
      description: `Subscription plan created: ${savedPlan.name}`,
    } as any);
    await this.auditLogRepository.save(auditLog);

    return savedPlan;
  }

  /**
   * List All Plans
   * Public - anyone can view available plans
   */
  async listPlans(includeInactive: boolean = false): Promise<SubscriptionPlan[]> {
    const where: any = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    return this.planRepository.find({
      where,
      order: { sortOrder: 'ASC', price: 'ASC' },
    });
  }

  /**
   * Get Plan by ID
   */
  async getPlanById(planId: string): Promise<SubscriptionPlan> {
    const plan = await this.planRepository.findOne({ where: { id: planId } });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    return plan;
  }

  /**
   * Get Plan by Type
   */
  async getPlanByType(planType: PlanType): Promise<SubscriptionPlan> {
    const plan = await this.planRepository.findOne({ where: { planType } });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    return plan;
  }

  /**
   * Update Plan
   * Super admin only
   */
  async updatePlan(
    planId: string,
    dto: UpdatePlanDto,
    updatedBy: User,
  ): Promise<SubscriptionPlan> {
    if (updatedBy.userType !== UserType.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can update subscription plans');
    }

    const plan = await this.getPlanById(planId);

    // Track changes
    const changes: any = { before: {}, after: {} };

    // Update fields
    if (dto.name) {
      changes.before.name = plan.name;
      plan.name = dto.name;
      changes.after.name = dto.name;
    }

    if (dto.description !== undefined) {
      plan.description = dto.description;
    }

    if (dto.price !== undefined) {
      changes.before.price = plan.price;
      plan.price = dto.price;
      changes.after.price = dto.price;
    }

    if (dto.includedUsers !== undefined) {
      changes.before.includedUsers = plan.includedUsers;
      plan.includedUsers = dto.includedUsers;
      changes.after.includedUsers = dto.includedUsers;
    }

    if (dto.pricePerAdditionalUser !== undefined) {
      plan.pricePerAdditionalUser = dto.pricePerAdditionalUser;
    }

    if (dto.maxUsers !== undefined) {
      plan.maxUsers = dto.maxUsers;
    }

    if (dto.storageLimit !== undefined) {
      plan.storageLimit = dto.storageLimit;
    }

    if (dto.apiCallsPerMonth !== undefined) {
      plan.apiCallsPerMonth = dto.apiCallsPerMonth;
    }

    if (dto.features) {
      plan.features = dto.features;
    }

    if (dto.featureFlags) {
      plan.featureFlags = { ...plan.featureFlags, ...dto.featureFlags };
    }

    if (dto.trialDays !== undefined) {
      plan.trialDays = dto.trialDays;
    }

    if (dto.isPopular !== undefined) {
      plan.isPopular = dto.isPopular;
    }

    if (dto.isActive !== undefined) {
      plan.isActive = dto.isActive;
    }

    const updatedPlan = await this.planRepository.save(plan);

    // Create audit log
    await this.createAuditLog(
      '',
      updatedBy.id,
      AuditAction.UPDATE,
      AuditEntityType.ORGANIZATION,
      plan.id,
      `Subscription plan updated: ${plan.name}`,
      undefined,
      undefined,
      false,
      changes,
    );

    return updatedPlan;
  }

  /**
   * Get Organization Subscription
   */
  async getOrganizationSubscription(organization_id: string): Promise<{
    organization: Organization;
    currentPlan: SubscriptionPlan | null;
    usage: {
      currentUsers: number;
      maxUsers: number;
      usagePercentage: number;
      additionalUsersNeeded: number;
    };
  }> {
    const organization = await this.organizationRepository.findOne({
      where: { id: organization_id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    let currentPlan: SubscriptionPlan | null = null;
    if (organization.subscriptionPlanId) {
      currentPlan = await this.planRepository.findOne({
        where: { id: organization.subscriptionPlanId },
      });
    }

    const currentUsers = await this.userRepository.count({
      where: { organizationId: organization_id, isActive: true },
    });

    const additionalUsersNeeded = Math.max(0, currentUsers - organization.maxUsers);
    const usagePercentage = (currentUsers / organization.maxUsers) * 100;

    return {
      organization,
      currentPlan,
      usage: {
        currentUsers,
        maxUsers: organization.maxUsers,
        usagePercentage,
        additionalUsersNeeded,
      },
    };
  }

  /**
   * Change Subscription Plan (Upgrade/Downgrade)
   */
  async changePlan(
    organization_id: string,
    dto: ChangePlanDto,
    changedBy: User,
  ): Promise<{
    organization: Organization;
    oldPlan: SubscriptionPlan | null;
    newPlan: SubscriptionPlan;
    proratedAmount?: number;
  }> {
    // Verify permissions
    if (
      changedBy.userType !== UserType.SUPER_ADMIN &&
      changedBy.userType !== UserType.ORG_ADMIN
    ) {
      throw new ForbiddenException('Only admins can change subscription plans');
    }

    if (changedBy.userType !== UserType.SUPER_ADMIN && changedBy.organizationId !== organization_id) {
      throw new ForbiddenException('Cannot change plan for other organizations');
    }

    const organization = await this.organizationRepository.findOne({
      where: { id: organization_id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Get current plan
    let oldPlan: SubscriptionPlan | null = null;
    if (organization.subscriptionPlanId) {
      oldPlan = await this.planRepository.findOne({
        where: { id: organization.subscriptionPlanId },
      });
    }

    // Get new plan
    const newPlan = await this.getPlanById(dto.newPlanId);

    if (!newPlan.isActive) {
      throw new BadRequestException('Selected plan is not available');
    }

    // Check if new plan can accommodate current users
    const currentUserCount = await this.userRepository.count({
      where: { organizationId: organization_id, isActive: true },
    });

    if (newPlan.maxUsers && currentUserCount > newPlan.maxUsers) {
      throw new BadRequestException(
        `New plan supports maximum ${newPlan.maxUsers} users, but you have ${currentUserCount} active users. Please deactivate users before downgrading.`
      );
    }

    // Calculate prorated amount (if upgrading mid-cycle)
    let proratedAmount: number | undefined;
    if (oldPlan && organization.nextBillingDate) {
      const daysRemaining = Math.ceil(
        (organization.nextBillingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalDaysInCycle = 30; // Simplified - should use actual billing cycle

      if (newPlan.price > oldPlan.price) {
        // Upgrade - charge prorated difference
        const priceDifference = newPlan.price - oldPlan.price;
        proratedAmount = (priceDifference / totalDaysInCycle) * daysRemaining;
      }
    }

    // Update organization
    organization.subscriptionPlanId = newPlan.id;
    organization.maxUsers = newPlan.includedUsers;
    organization.monthlyRevenue = newPlan.price;

    // If moving from trial to paid
    if (organization.subscriptionStatus === SubscriptionStatus.TRIAL) {
      organization.subscriptionStatus = SubscriptionStatus.ACTIVE;
      organization.subscriptionStartDate = new Date();
      
      // Set billing dates
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      organization.nextBillingDate = nextBillingDate;
    }

    await this.organizationRepository.save(organization);

    // Create audit log
    const description = oldPlan
      ? `Subscription changed from ${oldPlan.name} to ${newPlan.name}`
      : `Subscription started with ${newPlan.name}`;

    await this.createAuditLog(
      organization_id,
      changedBy.id,
      AuditAction.UPDATE,
      AuditEntityType.ORGANIZATION,
      organization_id,
      description,
      undefined,
      undefined,
      false,
      {
        before: { planId: oldPlan?.id, planName: oldPlan?.name },
        after: { planId: newPlan.id, planName: newPlan.name },
        proratedAmount,
      },
    );

    return {
      organization,
      oldPlan,
      newPlan,
      proratedAmount,
    };
  }

  /**
   * Cancel Subscription
   */
  async cancelSubscription(
    organization_id: string,
    reason: string,
    cancelledBy: User,
  ): Promise<Organization> {
    // Verify permissions
    if (
      cancelledBy.userType !== UserType.SUPER_ADMIN &&
      cancelledBy.userType !== UserType.ORG_ADMIN
    ) {
      throw new ForbiddenException('Only admins can cancel subscriptions');
    }

    if (cancelledBy.userType !== UserType.SUPER_ADMIN && cancelledBy.organizationId !== organization_id) {
      throw new ForbiddenException('Cannot cancel subscription for other organizations');
    }

    const organization = await this.organizationRepository.findOne({
      where: { id: organization_id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (organization.subscriptionStatus === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException('Subscription is already cancelled');
    }

    // Update subscription status
    organization.subscriptionStatus = SubscriptionStatus.CANCELLED;
    organization.subscriptionEndDate = new Date();
    organization.metadata = {
      ...organization.metadata,
      cancellationReason: reason,
      cancelledAt: new Date().toISOString(),
      cancelledBy: cancelledBy.id,
    };

    await this.organizationRepository.save(organization);

    // Create audit log
    await this.createAuditLog(
      organization_id,
      cancelledBy.id,
      AuditAction.UPDATE,
      AuditEntityType.ORGANIZATION,
      organization_id,
      `Subscription cancelled: ${reason}`,
      undefined,
      undefined,
      true,
    );

    return organization;
  }

  /**
   * Reactivate Subscription
   */
  async reactivateSubscription(
    organization_id: string,
    planId: string,
    reactivatedBy: User,
  ): Promise<Organization> {
    // Verify permissions (typically super admin)
    if (reactivatedBy.userType !== UserType.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can reactivate subscriptions');
    }

    const organization = await this.organizationRepository.findOne({
      where: { id: organization_id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const plan = await this.getPlanById(planId);

    // Update subscription
    organization.subscriptionPlanId = plan.id;
    organization.subscriptionStatus = SubscriptionStatus.ACTIVE;
    organization.subscriptionStartDate = new Date();
    organization.subscriptionEndDate = null;
    organization.maxUsers = plan.includedUsers;
    organization.monthlyRevenue = plan.price;

    // Set next billing date
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    organization.nextBillingDate = nextBillingDate;

    // Clear cancellation metadata
    if (organization.metadata) {
      delete organization.metadata.cancellationReason;
      delete organization.metadata.cancelledAt;
      delete organization.metadata.cancelledBy;
    }

    await this.organizationRepository.save(organization);

    // Create audit log
    await this.createAuditLog(
      organization_id,
      reactivatedBy.id,
      AuditAction.UPDATE,
      AuditEntityType.ORGANIZATION,
      organization_id,
      `Subscription reactivated with plan: ${plan.name}`,
      undefined,
      undefined,
      true,
    );

    return organization;
  }

  /**
   * Get Plan Comparison Matrix
   */
  async getPlanComparison(): Promise<{
    plans: SubscriptionPlan[];
    features: {
      feature: string;
      starter: boolean;
      professional: boolean;
      business: boolean;
      enterprise: boolean;
    }[];
  }> {
    const plans = await this.listPlans(false);

    // Build feature comparison matrix
    const allFeatures = new Set<string>();
    plans.forEach(plan => {
      plan.features.forEach(feature => allFeatures.add(feature));
    });

    const features = Array.from(allFeatures).map(feature => {
      const comparison: any = { feature };
      
      plans.forEach(plan => {
        comparison[plan.planType] = plan.features.includes(feature);
      });

      return comparison;
    });

    return { plans, features };
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
      organization_id: organization_id || 'system',
      user_id: user_id,
      action,
      entity_type: entity_type,
      entity_id: entity_id,
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
