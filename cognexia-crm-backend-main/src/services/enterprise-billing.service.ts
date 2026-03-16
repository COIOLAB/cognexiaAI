import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { EnterprisePayment, PaymentStatus, ApprovalStatus } from '../entities/enterprise-payment.entity';
import { BillingTransaction } from '../entities/billing-transaction.entity';
import { AuditLog, AuditAction, AuditEntityType } from '../entities/audit-log.entity';

export interface BillingConfigDto {
  billingType: 'payment_gateway' | 'enterprise_agreement';
  enterpriseAgreement?: {
    contractNumber: string;
    contractStartDate: string;
    contractEndDate: string;
    billingCycle: 'monthly' | 'quarterly' | 'annual';
    agreedAmount: number;
    currency: string;
    paymentTerms: string;
    contractDocument?: string;
    notes?: string;
  };
}

export interface CreatePaymentDto {
  organizationId: string;
  contractNumber?: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  amountDue: number;
  currency?: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
}

export interface ApprovePaymentDto {
  paymentProofUrl?: string;
  notes?: string;
}

function toAuditChanges(obj: Record<string, any>): { field: string; old_value: any; new_value: any }[] {
  return Object.entries(obj).map(([field, new_value]) => ({ field, old_value: null, new_value }));
}

@Injectable()
export class EnterpriseBillingService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(EnterprisePayment)
    private paymentRepository: Repository<EnterprisePayment>,
    @InjectRepository(BillingTransaction)
    private transactionRepository: Repository<BillingTransaction>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Configure billing type and enterprise agreement for an organization
   */
  async configureBilling(
    organizationId: string,
    config: BillingConfigDto,
    userId: string,
  ): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Update billing configuration
    organization.billingType = config.billingType;

    if (config.billingType === 'enterprise_agreement') {
      if (!config.enterpriseAgreement) {
        throw new BadRequestException('Enterprise agreement details are required');
      }

      organization.enterpriseAgreement = config.enterpriseAgreement;
      organization.requiresApproval = true;
      organization.approvalStatus = 'pending';
      organization.manualBillingEnabled = false;
    } else {
      organization.enterpriseAgreement = null;
      organization.requiresApproval = false;
      organization.approvalStatus = null;
      organization.manualBillingEnabled = false;
    }

    await this.organizationRepository.save(organization);

    await this.auditLogRepository.save({
      user_id: userId,
      action: AuditAction.UPDATE,
      entity_type: AuditEntityType.ORGANIZATION,
      entity_id: organizationId,
      changes: toAuditChanges({
        billingType: config.billingType,
        enterpriseAgreement: config.enterpriseAgreement,
      }),
      ip_address: null,
    });

    return organization;
  }

  /**
   * Get billing configuration for an organization
   */
  async getBillingConfig(organizationId: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  /**
   * Approve enterprise billing for an organization
   */
  async approveOrganization(
    organizationId: string,
    superAdminId: string,
  ): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (organization.billingType !== 'enterprise_agreement') {
      throw new BadRequestException('Organization is not configured for enterprise billing');
    }

    if (organization.approvalStatus === 'approved') {
      throw new BadRequestException('Organization is already approved');
    }

    organization.approvalStatus = 'approved';
    organization.approvedBy = superAdminId;
    organization.approvedAt = new Date();
    organization.manualBillingEnabled = true;

    await this.organizationRepository.save(organization);

    await this.auditLogRepository.save({
      user_id: superAdminId,
      action: AuditAction.APPROVE,
      entity_type: AuditEntityType.ORGANIZATION,
      entity_id: organizationId,
      changes: toAuditChanges({
        approvalStatus: 'approved',
        manualBillingEnabled: true,
      }),
      ip_address: null,
    });

    return organization;
  }

  /**
   * Reject enterprise billing for an organization
   */
  async rejectOrganization(
    organizationId: string,
    superAdminId: string,
    reason: string,
  ): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    organization.approvalStatus = 'rejected';
    organization.approvedBy = superAdminId;
    organization.approvedAt = new Date();
    organization.manualBillingEnabled = false;

    await this.organizationRepository.save(organization);

    await this.auditLogRepository.save({
      user_id: superAdminId,
      action: AuditAction.REJECT,
      entity_type: AuditEntityType.ORGANIZATION,
      entity_id: organizationId,
      changes: toAuditChanges({
        approvalStatus: 'rejected',
        rejectionReason: reason,
      }),
      ip_address: null,
    });

    return organization;
  }

  /**
   * Create a manual payment record
   */
  async createPaymentRecord(data: CreatePaymentDto, userId: string): Promise<EnterprisePayment> {
    // Verify organization exists and has enterprise billing enabled
    const organization = await this.organizationRepository.findOne({
      where: { id: data.organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (organization.billingType !== 'enterprise_agreement') {
      throw new BadRequestException('Organization is not configured for enterprise billing');
    }

    if (organization.approvalStatus !== 'approved') {
      throw new ForbiddenException('Organization enterprise billing is not approved');
    }

    // Create payment record
    const payment = this.paymentRepository.create({
      organizationId: data.organizationId,
      contractNumber: data.contractNumber || organization.enterpriseAgreement?.contractNumber,
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      amountDue: data.amountDue,
      amountPaid: 0,
      currency: data.currency || 'USD',
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: data.paymentMethod as any,
      paymentReference: data.paymentReference,
      approvalStatus: ApprovalStatus.PENDING,
      notes: data.notes,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    await this.auditLogRepository.save({
      user_id: userId,
      action: AuditAction.CREATE,
      entity_type: 'ENTERPRISE_PAYMENT',
      entity_id: savedPayment.id,
      changes: toAuditChanges(data as Record<string, any>),
      ip_address: null,
    });

    return savedPayment;
  }

  /**
   * Get all enterprise payments with filtering
   */
  async getPayments(filters: {
    organizationId?: string;
    paymentStatus?: PaymentStatus;
    approvalStatus?: ApprovalStatus;
    page?: number;
    limit?: number;
  }): Promise<{ data: EnterprisePayment[]; total: number }> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.organization', 'organization')
      .orderBy('payment.createdAt', 'DESC');

    if (filters.organizationId) {
      queryBuilder.andWhere('payment.organizationId = :organizationId', {
        organizationId: filters.organizationId,
      });
    }

    if (filters.paymentStatus) {
      queryBuilder.andWhere('payment.paymentStatus = :paymentStatus', {
        paymentStatus: filters.paymentStatus,
      });
    }

    if (filters.approvalStatus) {
      queryBuilder.andWhere('payment.approvalStatus = :approvalStatus', {
        approvalStatus: filters.approvalStatus,
      });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    return { data, total };
  }

  /**
   * Get a single payment by ID
   */
  async getPaymentById(paymentId: string): Promise<EnterprisePayment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['organization'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  /**
   * Approve a payment
   */
  async approvePayment(
    paymentId: string,
    superAdminId: string,
    data?: ApprovePaymentDto,
  ): Promise<EnterprisePayment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.approvalStatus === ApprovalStatus.APPROVED) {
      throw new BadRequestException('Payment is already approved');
    }

    payment.approvalStatus = ApprovalStatus.APPROVED;
    payment.approvedBy = superAdminId;
    payment.approvedAt = new Date();

    if (data?.paymentProofUrl) {
      payment.paymentProofUrl = data.paymentProofUrl;
    }

    if (data?.notes) {
      payment.notes = data.notes;
    }

    await this.paymentRepository.save(payment);

    // Create billing transaction
    await this.transactionRepository.save({
      organizationId: payment.organizationId,
      transactionType: 'one_time' as any,
      status: 'completed' as any,
      amount: payment.amountDue,
      currency: payment.currency,
      description: `Enterprise payment - Invoice ${payment.invoiceNumber}`,
      billingType: 'enterprise_manual',
      approvalStatus: 'approved',
      approvedBy: superAdminId,
      approvedAt: new Date(),
      invoiceNumber: payment.invoiceNumber,
      paymentReference: payment.paymentReference,
      dueDate: payment.dueDate,
      paidDate: new Date(),
    });

    await this.auditLogRepository.save({
      user_id: superAdminId,
      action: AuditAction.APPROVE,
      entity_type: 'ENTERPRISE_PAYMENT',
      entity_id: paymentId,
      changes: toAuditChanges({ approvalStatus: 'approved' }),
      ip_address: null,
    });

    return payment;
  }

  /**
   * Reject a payment
   */
  async rejectPayment(
    paymentId: string,
    superAdminId: string,
    reason: string,
  ): Promise<EnterprisePayment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.approvalStatus = ApprovalStatus.REJECTED;
    payment.approvedBy = superAdminId;
    payment.approvedAt = new Date();
    payment.rejectionReason = reason;

    await this.paymentRepository.save(payment);

    await this.auditLogRepository.save({
      user_id: superAdminId,
      action: AuditAction.REJECT,
      entity_type: 'ENTERPRISE_PAYMENT',
      entity_id: paymentId,
      changes: toAuditChanges({
        approvalStatus: 'rejected',
        rejectionReason: reason,
      }),
      ip_address: null,
    });

    return payment;
  }

  /**
   * Mark payment as paid
   */
  async markPaymentPaid(
    paymentId: string,
    userId: string,
    data: {
      amountPaid: number;
      paymentProofUrl?: string;
      paymentReference?: string;
      notes?: string;
    },
  ): Promise<EnterprisePayment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.amountPaid = data.amountPaid;
    payment.paymentProofUrl = data.paymentProofUrl || payment.paymentProofUrl;
    payment.paymentReference = data.paymentReference || payment.paymentReference;
    payment.notes = data.notes || payment.notes;

    // Update payment status
    if (payment.amountPaid >= payment.amountDue) {
      payment.paymentStatus = PaymentStatus.PAID;
    } else if (payment.amountPaid > 0) {
      payment.paymentStatus = PaymentStatus.PARTIAL;
    }

    await this.paymentRepository.save(payment);

    await this.auditLogRepository.save({
      user_id: userId,
      action: AuditAction.UPDATE,
      entity_type: 'ENTERPRISE_PAYMENT',
      entity_id: paymentId,
      changes: toAuditChanges({
        amountPaid: data.amountPaid,
        paymentStatus: payment.paymentStatus,
      }),
      ip_address: null,
    });

    return payment;
  }

  /**
   * Delete a payment record
   */
  async deletePayment(paymentId: string, userId: string): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Cannot delete a paid payment');
    }

    await this.paymentRepository.remove(payment);

    await this.auditLogRepository.save({
      user_id: userId,
      action: AuditAction.DELETE,
      entity_type: 'ENTERPRISE_PAYMENT',
      entity_id: paymentId,
      changes: toAuditChanges({ deleted: true }),
      ip_address: null,
    });
  }

  /**
   * Get pending approvals count
   */
  async getPendingApprovalsCount(): Promise<number> {
    return this.paymentRepository.count({
      where: { approvalStatus: ApprovalStatus.PENDING },
    });
  }

  /**
   * Check for overdue payments
   */
  async checkOverduePayments(): Promise<EnterprisePayment[]> {
    const now = new Date();
    
    const overduePayments = await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.dueDate < :now', { now })
      .andWhere('payment.paymentStatus != :paid', { paid: PaymentStatus.PAID })
      .getMany();

    // Update status to overdue
    for (const payment of overduePayments) {
      if (payment.paymentStatus !== PaymentStatus.OVERDUE) {
        payment.paymentStatus = PaymentStatus.OVERDUE;
        await this.paymentRepository.save(payment);
      }
    }

    return overduePayments;
  }
}
