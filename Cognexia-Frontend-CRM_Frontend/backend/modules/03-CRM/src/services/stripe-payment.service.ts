import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization, SubscriptionStatus } from '../entities/organization.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { BillingTransaction, TransactionType, TransactionStatus, PaymentMethod } from '../entities/billing-transaction.entity';
import { User } from '../entities/user.entity';
import { AuditLog, AuditAction, AuditEntityType } from '../entities/audit-log.entity';

import Stripe from 'stripe';

export interface CreateStripeCustomerDto {
  organization_id: string;
  email: string;
  name: string;
  phone?: string;
  address?: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export interface CreateSubscriptionDto {
  organization_id: string;
  planId: string;
  paymentMethodId: string;
  trialDays?: number;
}

export interface AddPaymentMethodDto {
  organization_id: string;
  paymentMethodId: string;
  setAsDefault?: boolean;
}

export interface ProcessPaymentDto {
  organization_id: string;
  amount: number;
  currency: string;
  description: string;
  paymentMethodId?: string;
}

/**
 * Stripe Payment Service
 * Handles Stripe integration for payments, subscriptions, and billing
 * 
 * NOTE: This is a mock implementation. To use real Stripe:
 * 1. npm install stripe @types/stripe
 * 2. Uncomment Stripe initialization
 * 3. Set STRIPE_SECRET_KEY in .env
 */
@Injectable()
export class StripePaymentService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(SubscriptionPlan)
    private planRepository: Repository<SubscriptionPlan>,
    @InjectRepository(BillingTransaction)
    private transactionRepository: Repository<BillingTransaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {
    // Initialize Stripe only if API key is provided
    const apiKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY;
    if (apiKey && apiKey !== 'false' && apiKey !== 'disabled') {
      this.stripe = new Stripe(apiKey, {
        apiVersion: '2025-12-15.clover',
        typescript: true,
      });
    } else {
      // Mock Stripe instance for development without API key
      this.stripe = null as any;
    }
  }

  /**
   * Check if Stripe is configured
   */
  private ensureStripeConfigured(): void {
    if (!this.stripe) {
      throw new BadRequestException(
        'Stripe is not configured. Please set STRIPE_SECRET_KEY or STRIPE_API_KEY in environment variables.',
      );
    }
  }

  private isStripeConfigured(): boolean {
    return !!this.stripe;
  }

  private buildMockId(prefix: string): string {
    return `${prefix}_mock_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }

  private isUuid(value?: string): boolean {
    if (!value) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  /**
   * Create Stripe Customer
   */
  async createCustomer(dto: CreateStripeCustomerDto): Promise<{
    customerId: string;
    organization: Organization;
  }> {
    if (!this.isStripeConfigured()) {
      const organization = await this.organizationRepository.findOne({
        where: { id: dto.organization_id },
      });
      if (!organization) {
        throw new NotFoundException('Organization not found');
      }
      if (!organization.stripeCustomerId) {
        organization.stripeCustomerId = this.buildMockId('cus');
        await this.organizationRepository.save(organization);
      }
      return { customerId: organization.stripeCustomerId, organization };
    }
    this.ensureStripeConfigured();
    const organization = await this.organizationRepository.findOne({
      where: { id: dto.organization_id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (organization.stripeCustomerId) {
      throw new BadRequestException('Organization already has a Stripe customer');
    }

    // Create Stripe customer
    const customer = await this.stripe.customers.create({
      email: dto.email,
      name: dto.name,
      phone: dto.phone,
      address: dto.address,
      metadata: {
        organization_id: dto.organization_id,
      },
    });

    const customerId = customer.id;

    organization.stripeCustomerId = customerId;
    await this.organizationRepository.save(organization);

    return { customerId, organization };
  }

  /**
   * Add Payment Method
   */
  async addPaymentMethod(dto: AddPaymentMethodDto): Promise<{ success: boolean }> {
    if (!this.isStripeConfigured()) {
      return { success: true };
    }
    this.ensureStripeConfigured();
    const organization = await this.organizationRepository.findOne({
      where: { id: dto.organization_id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (!organization.stripeCustomerId) {
      throw new BadRequestException('Organization does not have a Stripe customer');
    }

    // Attach payment method to customer
    await this.stripe.paymentMethods.attach(dto.paymentMethodId, {
      customer: organization.stripeCustomerId,
    });

    if (dto.setAsDefault) {
      await this.stripe.customers.update(organization.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: dto.paymentMethodId,
        },
      });
    }

    return { success: true };
  }

  /**
   * Create Stripe Subscription
   */
  async createSubscription(dto: CreateSubscriptionDto): Promise<{
    subscriptionId: string;
    organization: Organization;
  }> {
    if (!this.isStripeConfigured()) {
      const organization = await this.organizationRepository.findOne({
        where: { id: dto.organization_id },
      });
      if (!organization) {
        throw new NotFoundException('Organization not found');
      }
      organization.stripeSubscriptionId = organization.stripeSubscriptionId || this.buildMockId('sub');
      if (this.isUuid(dto.planId)) {
        organization.subscriptionPlanId = dto.planId;
      }
      organization.subscriptionStatus = SubscriptionStatus.ACTIVE;
      organization.subscriptionStartDate = new Date();
      await this.organizationRepository.save(organization);
      return { subscriptionId: organization.stripeSubscriptionId, organization };
    }
    this.ensureStripeConfigured();
    const organization = await this.organizationRepository.findOne({
      where: { id: dto.organization_id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (!organization.stripeCustomerId) {
      throw new BadRequestException('Organization must have a Stripe customer first');
    }

    const plan = await this.planRepository.findOne({ where: { id: dto.planId } });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    if (!plan.stripePriceId) {
      throw new BadRequestException('Plan does not have a Stripe price configured');
    }

    // Create Stripe subscription
    const subscription = await this.stripe.subscriptions.create({
      customer: organization.stripeCustomerId,
      items: [{ price: plan.stripePriceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: dto.trialDays || plan.trialDays,
      metadata: {
        organization_id: dto.organization_id,
        planId: dto.planId,
      },
    });

    const subscriptionId = subscription.id;

    // Update organization
    organization.stripeSubscriptionId = subscriptionId;
    organization.subscriptionPlanId = dto.planId;
    organization.subscriptionStatus = SubscriptionStatus.ACTIVE;
    organization.subscriptionStartDate = new Date();
    organization.maxUsers = plan.includedUsers;
    organization.monthlyRevenue = plan.price;

    // Set billing dates
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    organization.nextBillingDate = nextBillingDate;
    organization.lastBillingDate = new Date();

    await this.organizationRepository.save(organization);

    // Create billing transaction
    await this.createTransaction({
      organization_id: dto.organization_id,
      amount: plan.price,
      currency: plan.currency,
      transactionType: TransactionType.SUBSCRIPTION,
      description: `Subscription: ${plan.name}`,
      status: TransactionStatus.COMPLETED,
      paymentMethod: 'stripe',
      stripePaymentIntentId: `pi_mock_${Date.now()}`,
    });

    return { subscriptionId, organization };
  }

  /**
   * Update Subscription (Change Plan)
   */
  async updateSubscription(
    organization_id: string,
    newPlanId: string,
    prorate: boolean = true,
  ): Promise<{ success: boolean; proratedAmount?: number }> {
    if (!this.isStripeConfigured()) {
      const organization = await this.organizationRepository.findOne({
        where: { id: organization_id },
      });
      if (!organization) {
        throw new NotFoundException('Organization not found');
      }
      if (this.isUuid(newPlanId)) {
        organization.subscriptionPlanId = newPlanId;
      }
      await this.organizationRepository.save(organization);
      return { success: true, proratedAmount: 0 };
    }
    const organization = await this.organizationRepository.findOne({
      where: { id: organization_id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (!organization.stripeSubscriptionId) {
      throw new BadRequestException('Organization does not have an active subscription');
    }

    const newPlan = await this.planRepository.findOne({ where: { id: newPlanId } });

    if (!newPlan || !newPlan.stripePriceId) {
      throw new BadRequestException('Invalid plan');
    }

    const oldPlan = await this.planRepository.findOne({
      where: { id: organization.subscriptionPlanId },
    });

    // Update Stripe subscription
    const subscription = await this.stripe.subscriptions.retrieve(
      organization.stripeSubscriptionId
    );

    await this.stripe.subscriptions.update(organization.stripeSubscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPlan.stripePriceId,
      }],
      proration_behavior: prorate ? 'create_prorations' : 'none',
    });

    // Calculate prorated amount
    let proratedAmount: number | undefined;
    if (prorate && oldPlan && organization.nextBillingDate) {
      const daysRemaining = Math.ceil(
        (organization.nextBillingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalDaysInCycle = 30;

      if (newPlan.price > oldPlan.price) {
        const priceDifference = newPlan.price - oldPlan.price;
        proratedAmount = (priceDifference / totalDaysInCycle) * daysRemaining;

        // Create proration transaction
        await this.createTransaction({
          organization_id: organization_id,
          amount: proratedAmount,
          currency: newPlan.currency,
          transactionType: TransactionType.ADDON,
          description: `Plan upgrade proration: ${oldPlan.name} to ${newPlan.name}`,
          status: TransactionStatus.COMPLETED,
          paymentMethod: 'stripe',
        });
      }
    }

    // Update organization
    organization.subscriptionPlanId = newPlanId;
    organization.maxUsers = newPlan.includedUsers;
    organization.monthlyRevenue = newPlan.price;
    await this.organizationRepository.save(organization);

    return { success: true, proratedAmount };
  }

  /**
   * Cancel Subscription
   */
  async cancelSubscription(
    organization_id: string,
    cancelAtPeriodEnd: boolean = true,
  ): Promise<{ success: boolean }> {
    if (!this.isStripeConfigured()) {
      const organization = await this.organizationRepository.findOne({
        where: { id: organization_id },
      });
      if (!organization) {
        throw new NotFoundException('Organization not found');
      }
      organization.subscriptionStatus = SubscriptionStatus.CANCELLED;
      organization.subscriptionEndDate = new Date();
      await this.organizationRepository.save(organization);
      return { success: true };
    }
    const organization = await this.organizationRepository.findOne({
      where: { id: organization_id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (!organization.stripeSubscriptionId) {
      throw new BadRequestException('Organization does not have an active subscription');
    }

    // Cancel Stripe subscription
    if (cancelAtPeriodEnd) {
      await this.stripe.subscriptions.update(organization.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    } else {
      await this.stripe.subscriptions.cancel(organization.stripeSubscriptionId);
    }

    if (!cancelAtPeriodEnd) {
      organization.subscriptionStatus = SubscriptionStatus.CANCELLED;
      organization.subscriptionEndDate = new Date();
    }

    await this.organizationRepository.save(organization);

    return { success: true };
  }

  /**
   * Process One-Time Payment
   */
  async processPayment(dto: ProcessPaymentDto): Promise<{
    paymentIntentId: string;
    status: string;
  }> {
    if (!this.isStripeConfigured()) {
      const organization = await this.organizationRepository.findOne({
        where: { id: dto.organization_id },
      });
      if (!organization) {
        throw new NotFoundException('Organization not found');
      }
      if (!organization.stripeCustomerId) {
        organization.stripeCustomerId = this.buildMockId('cus');
        await this.organizationRepository.save(organization);
      }
      const paymentIntentId = this.buildMockId('pi');
      await this.createTransaction({
        organization_id: dto.organization_id,
        amount: dto.amount,
        currency: dto.currency,
        transactionType: TransactionType.ONE_TIME,
        description: dto.description,
        status: TransactionStatus.COMPLETED,
        paymentMethod: 'stripe',
        stripePaymentIntentId: paymentIntentId,
      });
      return { paymentIntentId, status: 'succeeded' };
    }
    const organization = await this.organizationRepository.findOne({
      where: { id: dto.organization_id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (!organization.stripeCustomerId) {
      throw new BadRequestException('Organization must have a Stripe customer first');
    }

    // Create payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(dto.amount * 100), // Convert to cents
      currency: dto.currency.toLowerCase(),
      customer: organization.stripeCustomerId,
      payment_method: dto.paymentMethodId,
      description: dto.description,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      metadata: {
        organization_id: dto.organization_id,
      },
    });

    const paymentIntentId = paymentIntent.id;
    const status = paymentIntent.status;

    // Create transaction
    await this.createTransaction({
      organization_id: dto.organization_id,
      amount: dto.amount,
      currency: dto.currency,
      transactionType: TransactionType.ONE_TIME,
      description: dto.description,
      status: TransactionStatus.COMPLETED,
      paymentMethod: 'stripe',
      stripePaymentIntentId: paymentIntentId,
    });

    return { paymentIntentId, status };
  }

  /**
   * Process Refund
   */
  async processRefund(
    transactionId: string,
    amount?: number,
    reason?: string,
  ): Promise<{ refundId: string; transaction: BillingTransaction }> {
    if (!this.isStripeConfigured()) {
      const refundId = this.buildMockId('refund');
      const transaction = await this.transactionRepository.findOne({
        where: { id: transactionId },
      });
      if (transaction) {
        transaction.status = TransactionStatus.REFUNDED;
        transaction.refundReason = reason;
        transaction.refundTransactionId = refundId;
        await this.transactionRepository.save(transaction);
      }
      return { refundId, transaction };
    }
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (!transaction.stripePaymentIntentId) {
      throw new BadRequestException('Transaction does not have a Stripe payment intent');
    }

    // Create refund
    const refund = await this.stripe.refunds.create({
      payment_intent: transaction.stripePaymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason as Stripe.RefundCreateParams.Reason,
    });

    const refundId = refund.id;

    // Create refund transaction
    const refundTransaction = await this.createTransaction({
      organization_id: transaction.organizationId,
      amount: -(amount || transaction.amount),
      currency: transaction.currency,
      transactionType: TransactionType.REFUND,
      description: `Refund: ${transaction.description}`,
      status: TransactionStatus.COMPLETED,
      paymentMethod: 'stripe',
      refundTransactionId: transaction.id,
      refundReason: reason,
    });

    // Update original transaction
    transaction.status = TransactionStatus.REFUNDED;
    transaction.refundTransactionId = refundTransaction.id;
    transaction.refundReason = reason;
    await this.transactionRepository.save(transaction);

    return { refundId, transaction };
  }

  /**
   * Handle Stripe Webhook
   */
  async handleWebhook(
    rawBody: string | Buffer,
    signature: string,
  ): Promise<{ received: boolean }> {
    if (!this.isStripeConfigured()) {
      return { received: true };
    }
    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || '',
      );
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    switch (event.type) {
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Webhook: Subscription Created
   */
  private async handleSubscriptionCreated(subscription: any): Promise<void> {
    const organizationId = subscription.metadata?.organizationId;
    if (!organizationId) return;

    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (organization) {
      organization.stripeSubscriptionId = subscription.id;
      organization.subscriptionStatus = SubscriptionStatus.ACTIVE;
      await this.organizationRepository.save(organization);
    }
  }

  /**
   * Webhook: Subscription Updated
   */
  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    const organization = await this.organizationRepository.findOne({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (organization) {
      // Update subscription status based on Stripe status
      if (subscription.status === 'active') {
        organization.subscriptionStatus = SubscriptionStatus.ACTIVE;
      } else if (subscription.status === 'past_due') {
        organization.subscriptionStatus = SubscriptionStatus.PAST_DUE;
      } else if (subscription.status === 'canceled') {
        organization.subscriptionStatus = SubscriptionStatus.CANCELLED;
      }

      await this.organizationRepository.save(organization);
    }
  }

  /**
   * Webhook: Subscription Deleted
   */
  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    const organization = await this.organizationRepository.findOne({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (organization) {
      organization.subscriptionStatus = SubscriptionStatus.CANCELLED;
      organization.subscriptionEndDate = new Date();
      await this.organizationRepository.save(organization);
    }
  }

  /**
   * Webhook: Invoice Payment Succeeded
   */
  private async handleInvoicePaymentSucceeded(invoice: any): Promise<void> {
    const organizationId = invoice.metadata?.organizationId;
    if (!organizationId) return;

    // Create successful transaction
    await this.createTransaction({
      organization_id: organizationId,
      amount: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency.toUpperCase(),
      transactionType: TransactionType.SUBSCRIPTION,
      description: `Invoice payment: ${invoice.number}`,
      status: TransactionStatus.COMPLETED,
      paymentMethod: 'stripe',
      stripeInvoiceId: invoice.id,
      stripePaymentIntentId: invoice.payment_intent,
      invoiceNumber: invoice.number,
      paidAt: new Date(invoice.status_transitions.paid_at * 1000),
    });

    // Update billing dates
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (organization) {
      organization.lastBillingDate = new Date();
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      organization.nextBillingDate = nextBillingDate;
      await this.organizationRepository.save(organization);
    }
  }

  /**
   * Webhook: Invoice Payment Failed
   */
  private async handleInvoicePaymentFailed(invoice: any): Promise<void> {
    const organizationId = invoice.metadata?.organizationId;
    if (!organizationId) return;

    // Create failed transaction
    await this.createTransaction({
      organization_id: organizationId,
      amount: invoice.amount_due / 100,
      currency: invoice.currency.toUpperCase(),
      transactionType: TransactionType.SUBSCRIPTION,
      description: `Invoice payment failed: ${invoice.number}`,
      status: TransactionStatus.FAILED,
      paymentMethod: 'stripe',
      stripeInvoiceId: invoice.id,
      invoiceNumber: invoice.number,
      failureReason: invoice.last_finalization_error?.message || 'Payment failed',
    });

    // Update organization status
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (organization) {
      organization.subscriptionStatus = SubscriptionStatus.PAST_DUE;
      await this.organizationRepository.save(organization);
    }
  }

  /**
   * Webhook: Payment Intent Succeeded
   */
  private async handlePaymentIntentSucceeded(paymentIntent: any): Promise<void> {
    // Payment intent succeeded - transaction likely already created
    console.log('Payment intent succeeded:', paymentIntent.id);
  }

  /**
   * Webhook: Payment Intent Failed
   */
  private async handlePaymentIntentFailed(paymentIntent: any): Promise<void> {
    const organizationId = paymentIntent.metadata?.organizationId;
    if (!organizationId) return;

    console.log('Payment intent failed:', paymentIntent.id, paymentIntent.last_payment_error);
  }

  /**
   * Create Billing Transaction
   */
  private async createTransaction(data: {
    organization_id: string;
    amount: number;
    currency: string;
    transactionType: TransactionType;
    description: string;
    status: TransactionStatus;
    paymentMethod: string;
    stripePaymentIntentId?: string;
    stripeInvoiceId?: string;
    stripeChargeId?: string;
    invoiceNumber?: string;
    paidAt?: Date;
    failureReason?: string;
    refundTransactionId?: string;
    refundReason?: string;
  }): Promise<BillingTransaction> {
    const transaction = this.transactionRepository.create({
      organizationId: data.organization_id,
      amount: data.amount,
      currency: data.currency,
      transactionType: data.transactionType,
      description: data.description,
      status: data.status,
      paymentMethod: data.paymentMethod,
      totalAmount: data.amount,
      stripePaymentIntentId: data.stripePaymentIntentId,
      invoiceNumber: data.invoiceNumber || `INV-${Date.now()}`,
      refundTransactionId: data.refundTransactionId,
      refundReason: data.refundReason,
      metadata: {
        stripeInvoiceId: data.stripeInvoiceId,
        stripeChargeId: data.stripeChargeId,
        paidAt: data.paidAt,
        failureReason: data.failureReason,
      },
    } as any);

    return await this.transactionRepository.save(transaction) as any;
  }
}
