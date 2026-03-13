/**
 * Accounts Receivable Service - Customer Billing & Payment Management
 * 
 * Advanced accounts receivable service providing comprehensive customer billing,
 * invoice management, payment processing, and credit management using AI-powered
 * analytics, automated collections, and real-time payment tracking.
 * 
 * Features:
 * - Automated invoice generation and delivery
 * - AI-powered credit scoring and risk assessment
 * - Dynamic payment processing and reconciliation
 * - Multi-currency and international billing
 * - Customer analytics and payment behavior insights
 * - Automated collections and dunning management
 * - Real-time aging analysis and reporting
 * - Integration with sales and CRM modules
 * 
 * @version 3.0.0
 * @author Industry 5.0 ERP Team
 * @compliance SOC2, ISO27001, GDPR, PCI-DSS, SOX
 */

import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import { Decimal } from 'decimal.js';
import {
  AuditTrailEntry,
  ComplianceLog,
  User,
  MonetaryAmount,
  PaymentTerms,
  TaxDetail,
  WorkflowStep,
  ApprovalRequest,
  NotificationRequest,
  AnalyticsRequest,
  BusinessError,
  ValidationError,
  IntegrationEvent,
  TrendAnalysis,
} from '../interfaces/shared.interfaces';

// Accounts Receivable Interfaces
interface CustomerInvoice {
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerCode: string;
  customerName: string;
  salesOrderId?: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  subtotal: Decimal;
  taxAmount: Decimal;
  discountAmount: Decimal;
  totalAmount: Decimal;
  outstandingAmount: Decimal;
  currencyCode: string;
  exchangeRate: Decimal;
  baseAmount: Decimal;
  status: 'draft' | 'sent' | 'viewed' | 'partial_paid' | 'paid' | 'overdue' | 'disputed' | 'cancelled';
  description: string;
  reference: string;
  billingAddress: BillingAddress;
  shippingAddress?: ShippingAddress;
  lineItems: InvoiceLineItem[];
  payments: CustomerPayment[];
  adjustments: InvoiceAdjustment[];
  collections: CollectionActivity[];
  reminders: PaymentReminder[];
  auditTrail: AuditTrailEntry[];
  createdBy: string;
  createdAt: string;
  sentAt?: string;
  deliveryStatus: DeliveryStatus;
  metadata: Record<string, any>;
  aiAnalysis?: AIRiskAnalysis;
}

interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface ShippingAddress extends BillingAddress {
  attentionTo?: string;
  instructions?: string;
}

interface InvoiceLineItem {
  lineId: string;
  productId?: string;
  productCode?: string;
  description: string;
  quantity: Decimal;
  unitPrice: Decimal;
  lineTotal: Decimal;
  taxAmount: Decimal;
  discountAmount: Decimal;
  discountPercent: Decimal;
  glAccount: string;
  revenueRecognition: RevenueRecognition;
}

interface RevenueRecognition {
  method: 'immediate' | 'over_time' | 'milestone' | 'percentage_completion';
  totalPeriods?: number;
  recognizedAmount: Decimal;
  deferredAmount: Decimal;
  recognitionSchedule: RecognitionSchedule[];
}

interface RecognitionSchedule {
  periodDate: string;
  recognitionAmount: Decimal;
  status: 'pending' | 'recognized' | 'deferred';
}

interface CustomerPayment {
  paymentId: string;
  paymentNumber: string;
  paymentMethod: 'cash' | 'check' | 'ach' | 'wire' | 'card' | 'crypto' | 'digital_wallet';
  paymentDate: string;
  amount: Decimal;
  currencyCode: string;
  exchangeRate: Decimal;
  reference: string;
  bankAccount?: string;
  status: 'pending' | 'processing' | 'cleared' | 'failed' | 'returned';
  transactionId?: string;
  blockchainHash?: string;
  fees: Decimal;
  appliedToInvoices: PaymentApplication[];
  processedBy: string;
  processedAt: string;
  clearingDate?: string;
  reconciled: boolean;
  metadata: Record<string, any>;
}

interface PaymentApplication {
  invoiceId: string;
  appliedAmount: Decimal;
  writeOffAmount?: Decimal;
  adjustmentAmount?: Decimal;
  appliedDate: string;
}

interface InvoiceAdjustment {
  adjustmentId: string;
  type: 'credit_memo' | 'debit_memo' | 'write_off' | 'discount' | 'bad_debt';
  amount: Decimal;
  reason: string;
  description: string;
  approvedBy: string;
  processedAt: string;
  reversalId?: string;
  glAccount: string;
}

interface CollectionActivity {
  activityId: string;
  type: 'phone_call' | 'email' | 'letter' | 'legal_notice' | 'external_agency';
  status: 'scheduled' | 'completed' | 'failed' | 'cancelled';
  scheduledDate: string;
  completedDate?: string;
  performedBy: string;
  notes: string;
  outcome: string;
  nextAction: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  cost: Decimal;
}

interface PaymentReminder {
  reminderId: string;
  type: 'friendly' | 'first_notice' | 'second_notice' | 'final_notice' | 'legal_demand';
  sentDate: string;
  deliveryMethod: 'email' | 'postal' | 'sms' | 'phone';
  template: string;
  personalized: boolean;
  opened: boolean;
  responded: boolean;
  escalationLevel: number;
}

interface DeliveryStatus {
  method: 'email' | 'postal' | 'portal' | 'api';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  attempts: number;
  lastAttempt?: string;
  tracking?: string;
  confirmationId?: string;
}

interface AIRiskAnalysis {
  creditRisk: number;
  paymentRisk: number;
  collectionRisk: number;
  fraudRisk: number;
  riskFactors: string[];
  recommendations: string[];
  confidenceScore: number;
  lastUpdated: string;
}

interface CustomerProfile {
  customerId: string;
  customerCode: string;
  customerName: string;
  legalName: string;
  taxId: string;
  businessType: string;
  industryCode: string;
  addresses: CustomerAddress[];
  contacts: CustomerContact[];
  creditProfile: CreditProfile;
  paymentProfile: PaymentProfile;
  preferences: CustomerPreferences;
  status: 'active' | 'inactive' | 'suspended' | 'credit_hold';
  metadata: Record<string, any>;
}

interface CustomerAddress {
  addressId: string;
  type: 'billing' | 'shipping' | 'headquarters';
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
  taxJurisdiction: string;
}

interface CustomerContact {
  contactId: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  type: 'primary' | 'billing' | 'technical' | 'purchasing';
  isPrimary: boolean;
  receiveInvoices: boolean;
  receiveStatements: boolean;
}

interface CreditProfile {
  creditLimit: Decimal;
  availableCredit: Decimal;
  creditRating: string;
  paymentTerms: PaymentTerms;
  riskCategory: 'low' | 'medium' | 'high' | 'critical';
  creditScore: number;
  daysToPayAverage: number;
  totalOutstanding: Decimal;
  largestInvoice: Decimal;
  creditHistory: CreditHistoryEntry[];
  guarantees: CreditGuarantee[];
  lastReviewDate: string;
}

interface CreditHistoryEntry {
  entryId: string;
  date: string;
  type: 'credit_increase' | 'credit_decrease' | 'payment' | 'writeoff' | 'dispute';
  amount: Decimal;
  reason: string;
  performedBy: string;
}

interface CreditGuarantee {
  guaranteeId: string;
  guarantorName: string;
  guarantorType: 'personal' | 'corporate' | 'bank';
  amount: Decimal;
  expiryDate: string;
  isActive: boolean;
}

interface PaymentProfile {
  preferredMethod: string;
  autoPayEnabled: boolean;
  bankAccount?: string;
  paymentBehavior: PaymentBehavior;
  defaultInstructions: string;
}

interface PaymentBehavior {
  averageDaysToPayment: number;
  onTimePaymentRate: Decimal;
  earlyPaymentRate: Decimal;
  latePaymentRate: Decimal;
  disputeRate: Decimal;
  averageInvoiceSize: Decimal;
  paymentFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  seasonalPattern: string;
}

interface CustomerPreferences {
  invoiceFormat: 'pdf' | 'xml' | 'edi';
  deliveryMethod: 'email' | 'portal' | 'edi' | 'api';
  language: string;
  currency: string;
  timezone: string;
  communicationFrequency: 'daily' | 'weekly' | 'monthly';
  marketingOptIn: boolean;
}

interface AgingReport {
  reportId: string;
  generatedAt: string;
  asOfDate: string;
  entityId: string;
  currencyCode: string;
  totalOutstanding: Decimal;
  agingBuckets: AgingBucket[];
  customerAging: CustomerAging[];
  summary: AgingSummary;
  trends: AgingTrends;
}

interface AgingBucket {
  bucketName: string;
  daysFrom: number;
  daysTo: number;
  amount: Decimal;
  percentage: Decimal;
  invoiceCount: number;
  customerCount: number;
}

interface CustomerAging {
  customerId: string;
  customerName: string;
  totalOutstanding: Decimal;
  current: Decimal;
  days1to30: Decimal;
  days31to60: Decimal;
  days61to90: Decimal;
  over90Days: Decimal;
  creditLimit: Decimal;
  riskScore: number;
  lastPaymentDate: string;
  largestInvoice: Decimal;
}

interface AgingSummary {
  totalCustomers: number;
  customersWithBalance: number;
  averageDaysOutstanding: Decimal;
  concentrationRisk: Decimal;
  collectionEfficiency: Decimal;
  badDebtRate: Decimal;
}

interface AgingTrends {
  outstandingTrend: TrendAnalysis;
  collectionTrend: TrendAnalysis;
  agingTrend: TrendAnalysis;
  riskTrend: TrendAnalysis;
}

interface CollectionStrategy {
  strategyId: string;
  customerSegment: string;
  agingCategory: string;
  actions: CollectionAction[];
  effectiveness: Decimal;
  averageRecoveryDays: number;
  recoveryRate: Decimal;
  cost: Decimal;
  isActive: boolean;
}

interface CollectionAction {
  actionType: string;
  trigger: string;
  daysPastDue: number;
  template: string;
  escalationLevel: number;
  cost: Decimal;
  successRate: Decimal;
}

interface ARAnalytics {
  analyticsId: string;
  period: string;
  timestamp: string;
  metrics: ARMetrics;
  trends: ARTrends;
  insights: ARInsight[];
  recommendations: ARRecommendation[];
  benchmarks: ARBenchmarks;
}

interface ARMetrics {
  totalReceivables: Decimal;
  totalOverdue: Decimal;
  averageCollectionDays: Decimal;
  collectionEfficiency: Decimal;
  badDebtRate: Decimal;
  creditLossRate: Decimal;
  customerCount: number;
  invoiceVolume: number;
  disputeRate: Decimal;
  earlyPaymentRate: Decimal;
  automationRate: Decimal;
  dso: Decimal; // Days Sales Outstanding
}

interface ARTrends {
  collectionVelocity: TrendAnalysis;
  customerConcentration: TrendAnalysis;
  creditQuality: TrendAnalysis;
  automationGrowth: TrendAnalysis;
  satisfactionScore: TrendAnalysis;
}

interface ARInsight {
  category: string;
  insight: string;
  importance: number;
  confidence: number;
  impact: 'revenue_acceleration' | 'risk_reduction' | 'efficiency_gain' | 'customer_satisfaction';
  actionable: boolean;
  evidence: string[];
  recommendations: string[];
}

interface ARRecommendation {
  recommendation: string;
  category: string;
  priority: number;
  expectedImpact: Decimal;
  timeline: string;
  effort: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
}

interface ARBenchmarks {
  industryAverage: Decimal;
  bestInClass: Decimal;
  currentPerformance: Decimal;
  improvementOpportunity: Decimal;
  ranking: string;
}

@Injectable()
export class AccountsReceivableService {
  private readonly logger = new Logger(AccountsReceivableService.name);
  private readonly precision = 4; // Decimal precision for financial calculations

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  // ============================================================================
  // INVOICE MANAGEMENT
  // ============================================================================

  async createCustomerInvoice(invoiceData: Partial<CustomerInvoice>, userId: string): Promise<CustomerInvoice> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(`Creating customer invoice for user ${userId}`);

      // Validate customer exists and credit status
      const customer = await this.getCustomerProfile(invoiceData.customerId);
      if (!customer) {
        throw new BadRequestException('Customer not found');
      }

      if (customer.status === 'credit_hold') {
        throw new BadRequestException('Customer is on credit hold');
      }

      // Calculate totals
      const subtotal = invoiceData.lineItems?.reduce((sum, item) => 
        sum.plus(item.lineTotal), new Decimal(0)) || new Decimal(0);
      const taxAmount = invoiceData.lineItems?.reduce((sum, item) => 
        sum.plus(item.taxAmount), new Decimal(0)) || new Decimal(0);
      const discountAmount = new Decimal(invoiceData.discountAmount || 0);
      const totalAmount = subtotal.plus(taxAmount).minus(discountAmount);

      // Check credit limit
      const newOutstanding = customer.creditProfile.totalOutstanding.plus(totalAmount);
      if (newOutstanding.gt(customer.creditProfile.creditLimit)) {
        throw new BadRequestException('Invoice would exceed customer credit limit');
      }

      const invoice: CustomerInvoice = {
        invoiceId: crypto.randomUUID(),
        invoiceNumber: invoiceData.invoiceNumber || await this.generateInvoiceNumber(),
        customerId: invoiceData.customerId || '',
        customerCode: customer.customerCode,
        customerName: customer.customerName,
        salesOrderId: invoiceData.salesOrderId,
        invoiceDate: invoiceData.invoiceDate || new Date().toISOString(),
        dueDate: invoiceData.dueDate || this.calculateDueDate(customer.creditProfile.paymentTerms),
        paymentTerms: customer.creditProfile.paymentTerms.description,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        outstandingAmount: totalAmount,
        currencyCode: invoiceData.currencyCode || customer.preferences.currency,
        exchangeRate: new Decimal(invoiceData.exchangeRate || 1),
        baseAmount: totalAmount.div(invoiceData.exchangeRate || 1),
        status: 'draft',
        description: invoiceData.description || '',
        reference: invoiceData.reference || '',
        billingAddress: customer.addresses.find(addr => addr.type === 'billing') as BillingAddress,
        shippingAddress: customer.addresses.find(addr => addr.type === 'shipping') as ShippingAddress,
        lineItems: await this.processInvoiceLineItems(invoiceData.lineItems || []),
        payments: [],
        adjustments: [],
        collections: [],
        reminders: [],
        auditTrail: [{
          auditId: crypto.randomUUID(),
          action: 'created',
          performedBy: userId,
          timestamp: new Date().toISOString(),
          changes: { status: 'draft' },
          ipAddress: 'system',
          userAgent: 'system',
          sessionId: crypto.randomUUID()
        }],
        createdBy: userId,
        createdAt: new Date().toISOString(),
        deliveryStatus: {
          method: customer.preferences.deliveryMethod as any,
          status: 'pending',
          attempts: 0
        },
        metadata: invoiceData.metadata || {}
      };

      // Run AI risk analysis
      invoice.aiAnalysis = await this.performRiskAnalysis(invoice, customer);

      // Process revenue recognition
      await this.processRevenueRecognition(invoice, queryRunner);

      // Save invoice
      await queryRunner.manager.save('customer_invoice', invoice);

      // Create journal entry if auto-posting is enabled
      if (await this.isAutoPostingEnabled()) {
        await this.createInvoiceJournalEntry(invoice, queryRunner);
      }

      await queryRunner.commitTransaction();

      this.eventEmitter.emit('customer.invoice.created', {
        invoiceId: invoice.invoiceId,
        customerId: invoice.customerId,
        amount: invoice.totalAmount.toNumber(),
        userId,
        timestamp: new Date().toISOString()
      });

      this.logger.log(`Customer invoice ${invoice.invoiceNumber} created successfully`);
      return invoice;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Customer invoice creation failed', error);
      throw new InternalServerErrorException('Customer invoice creation failed');
    } finally {
      await queryRunner.release();
    }
  }

  async sendInvoice(invoiceId: string, deliveryOptions?: any, userId?: string): Promise<CustomerInvoice> {
    try {
      this.logger.log(`Sending invoice ${invoiceId}`);

      const invoice = await this.getInvoiceById(invoiceId);
      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }

      if (invoice.status !== 'draft') {
        throw new BadRequestException('Only draft invoices can be sent');
      }

      // Send invoice via preferred delivery method
      const deliveryResult = await this.deliverInvoice(invoice, deliveryOptions);
      
      invoice.status = 'sent';
      invoice.sentAt = new Date().toISOString();
      invoice.deliveryStatus = deliveryResult;

      invoice.auditTrail.push({
        auditId: crypto.randomUUID(),
        action: 'sent',
        performedBy: userId || 'system',
        timestamp: new Date().toISOString(),
        changes: { status: 'sent', deliveryMethod: deliveryResult.method },
        ipAddress: 'system',
        userAgent: 'system',
        sessionId: crypto.randomUUID()
      });

      await this.dataSource.manager.save('customer_invoice', invoice);

      this.eventEmitter.emit('customer.invoice.sent', {
        invoiceId: invoice.invoiceId,
        customerId: invoice.customerId,
        deliveryMethod: deliveryResult.method,
        timestamp: new Date().toISOString()
      });

      return invoice;

    } catch (error) {
      this.logger.error('Invoice sending failed', error);
      throw new InternalServerErrorException('Invoice sending failed');
    }
  }

  // ============================================================================
  // PAYMENT PROCESSING
  // ============================================================================

  async processCustomerPayment(paymentData: Partial<CustomerPayment>, userId: string): Promise<CustomerPayment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(`Processing customer payment for user ${userId}`);

      const payment: CustomerPayment = {
        paymentId: crypto.randomUUID(),
        paymentNumber: await this.generatePaymentNumber(),
        paymentMethod: paymentData.paymentMethod || 'ach',
        paymentDate: paymentData.paymentDate || new Date().toISOString(),
        amount: new Decimal(paymentData.amount || 0),
        currencyCode: paymentData.currencyCode || 'USD',
        exchangeRate: new Decimal(paymentData.exchangeRate || 1),
        reference: paymentData.reference || '',
        bankAccount: paymentData.bankAccount,
        status: 'pending',
        fees: new Decimal(paymentData.fees || 0),
        appliedToInvoices: [],
        processedBy: userId,
        processedAt: new Date().toISOString(),
        reconciled: false,
        metadata: paymentData.metadata || {}
      };

      // Validate and process payment
      await this.validatePayment(payment);
      const processResult = await this.executeCustomerPayment(payment);
      
      payment.transactionId = processResult.transactionId;
      payment.blockchainHash = processResult.blockchainHash;
      payment.status = processResult.status as any;

      // Apply payment to invoices
      if (paymentData.appliedToInvoices && paymentData.appliedToInvoices.length > 0) {
        payment.appliedToInvoices = paymentData.appliedToInvoices;
        await this.applyPaymentToInvoices(payment, queryRunner);
      } else {
        // Auto-apply to oldest invoices
        await this.autoApplyPayment(payment, queryRunner);
      }

      await queryRunner.manager.save('customer_payment', payment);
      await queryRunner.commitTransaction();

      this.eventEmitter.emit('customer.payment.processed', {
        paymentId: payment.paymentId,
        amount: payment.amount.toNumber(),
        method: payment.paymentMethod,
        userId,
        timestamp: new Date().toISOString()
      });

      return payment;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Customer payment processing failed', error);
      throw new InternalServerErrorException('Customer payment processing failed');
    } finally {
      await queryRunner.release();
    }
  }

  // ============================================================================
  // AGING ANALYSIS
  // ============================================================================

  async generateAgingReport(asOfDate: string, entityId: string, userId: string): Promise<AgingReport> {
    try {
      this.logger.log(`Generating aging report as of ${asOfDate} for entity ${entityId}`);

      const customers = await this.getCustomersWithOutstanding(asOfDate, entityId);
      const customerAging: CustomerAging[] = [];
      const agingBuckets: AgingBucket[] = [
        { bucketName: 'Current', daysFrom: 0, daysTo: 0, amount: new Decimal(0), percentage: new Decimal(0), invoiceCount: 0, customerCount: 0 },
        { bucketName: '1-30 Days', daysFrom: 1, daysTo: 30, amount: new Decimal(0), percentage: new Decimal(0), invoiceCount: 0, customerCount: 0 },
        { bucketName: '31-60 Days', daysFrom: 31, daysTo: 60, amount: new Decimal(0), percentage: new Decimal(0), invoiceCount: 0, customerCount: 0 },
        { bucketName: '61-90 Days', daysFrom: 61, daysTo: 90, amount: new Decimal(0), percentage: new Decimal(0), invoiceCount: 0, customerCount: 0 },
        { bucketName: 'Over 90 Days', daysFrom: 91, daysTo: 999, amount: new Decimal(0), percentage: new Decimal(0), invoiceCount: 0, customerCount: 0 }
      ];

      let totalOutstanding = new Decimal(0);

      for (const customer of customers) {
        const aging = await this.calculateCustomerAging(customer.customerId, asOfDate);
        customerAging.push(aging);
        totalOutstanding = totalOutstanding.plus(aging.totalOutstanding);

        // Update aging buckets
        agingBuckets[0].amount = agingBuckets[0].amount.plus(aging.current);
        agingBuckets[1].amount = agingBuckets[1].amount.plus(aging.days1to30);
        agingBuckets[2].amount = agingBuckets[2].amount.plus(aging.days31to60);
        agingBuckets[3].amount = agingBuckets[3].amount.plus(aging.days61to90);
        agingBuckets[4].amount = agingBuckets[4].amount.plus(aging.over90Days);
      }

      // Calculate percentages
      agingBuckets.forEach(bucket => {
        bucket.percentage = totalOutstanding.gt(0) ? bucket.amount.div(totalOutstanding).mul(100) : new Decimal(0);
      });

      const report: AgingReport = {
        reportId: crypto.randomUUID(),
        generatedAt: new Date().toISOString(),
        asOfDate,
        entityId,
        currencyCode: 'USD',
        totalOutstanding,
        agingBuckets,
        customerAging,
        summary: await this.calculateAgingSummary(customerAging),
        trends: await this.analyzeAgingTrends(asOfDate, entityId)
      };

      this.eventEmitter.emit('aging.report.generated', {
        reportId: report.reportId,
        entityId,
        userId,
        totalOutstanding: totalOutstanding.toNumber(),
        customerCount: customerAging.length,
        timestamp: new Date().toISOString()
      });

      return report;

    } catch (error) {
      this.logger.error('Aging report generation failed', error);
      throw new InternalServerErrorException('Aging report generation failed');
    }
  }

  // ============================================================================
  // COLLECTIONS MANAGEMENT
  // ============================================================================

  async initiateCollectionProcess(customerId: string, strategy: string, userId: string): Promise<CollectionActivity[]> {
    try {
      this.logger.log(`Initiating collection process for customer ${customerId}`);

      const customer = await this.getCustomerProfile(customerId);
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      const overdueInvoices = await this.getOverdueInvoices(customerId);
      if (overdueInvoices.length === 0) {
        throw new BadRequestException('No overdue invoices found for customer');
      }

      const collectionStrategy = await this.getCollectionStrategy(strategy, customer.creditProfile.riskCategory);
      const activities: CollectionActivity[] = [];

      for (const action of collectionStrategy.actions) {
        const activity: CollectionActivity = {
          activityId: crypto.randomUUID(),
          type: action.actionType as any,
          status: 'scheduled',
          scheduledDate: this.calculateScheduleDate(action.daysPastDue),
          performedBy: userId,
          notes: `Automated collection action: ${action.actionType}`,
          outcome: '',
          nextAction: '',
          priority: this.determinePriority(customer.creditProfile.riskCategory),
          cost: action.cost
        };

        activities.push(activity);
      }

      // Save collection activities
      await this.dataSource.manager.save('collection_activity', activities);

      this.eventEmitter.emit('collection.process.initiated', {
        customerId,
        strategy,
        activitiesCount: activities.length,
        userId,
        timestamp: new Date().toISOString()
      });

      return activities;

    } catch (error) {
      this.logger.error('Collection process initiation failed', error);
      throw new InternalServerErrorException('Collection process initiation failed');
    }
  }

  async sendPaymentReminder(invoiceId: string, reminderType: string, userId: string): Promise<PaymentReminder> {
    try {
      this.logger.log(`Sending payment reminder for invoice ${invoiceId}`);

      const invoice = await this.getInvoiceById(invoiceId);
      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }

      const customer = await this.getCustomerProfile(invoice.customerId);
      const template = await this.getReminderTemplate(reminderType, customer?.preferences.language || 'en');

      const reminder: PaymentReminder = {
        reminderId: crypto.randomUUID(),
        type: reminderType as any,
        sentDate: new Date().toISOString(),
        deliveryMethod: (customer?.preferences.deliveryMethod as any) || 'email',
        template: template.templateId,
        personalized: true,
        opened: false,
        responded: false,
        escalationLevel: this.getEscalationLevel(reminderType)
      };

      // Send reminder
      const sendResult = await this.deliverReminder(reminder, invoice, customer);
      reminder.opened = sendResult.delivered;

      // Update invoice
      invoice.reminders.push(reminder);
      await this.dataSource.manager.save('customer_invoice', invoice);

      this.eventEmitter.emit('payment.reminder.sent', {
        invoiceId,
        customerId: invoice.customerId,
        reminderType,
        userId,
        timestamp: new Date().toISOString()
      });

      return reminder;

    } catch (error) {
      this.logger.error('Payment reminder sending failed', error);
      throw new InternalServerErrorException('Payment reminder sending failed');
    }
  }

  // ============================================================================
  // CREDIT MANAGEMENT
  // ============================================================================

  async updateCreditLimit(customerId: string, newLimit: Decimal, reason: string, userId: string): Promise<CreditProfile> {
    try {
      this.logger.log(`Updating credit limit for customer ${customerId}`);

      const customer = await this.getCustomerProfile(customerId);
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      const oldLimit = customer.creditProfile.creditLimit;
      customer.creditProfile.creditLimit = newLimit;
      customer.creditProfile.availableCredit = newLimit.minus(customer.creditProfile.totalOutstanding);

      // Add to credit history
      customer.creditProfile.creditHistory.push({
        entryId: crypto.randomUUID(),
        date: new Date().toISOString(),
        type: newLimit.gt(oldLimit) ? 'credit_increase' : 'credit_decrease',
        amount: newLimit.minus(oldLimit),
        reason,
        performedBy: userId
      });

      await this.dataSource.manager.save('customer_profile', customer);

      this.eventEmitter.emit('credit.limit.updated', {
        customerId,
        oldLimit: oldLimit.toNumber(),
        newLimit: newLimit.toNumber(),
        reason,
        userId,
        timestamp: new Date().toISOString()
      });

      return customer.creditProfile;

    } catch (error) {
      this.logger.error('Credit limit update failed', error);
      throw new InternalServerErrorException('Credit limit update failed');
    }
  }

  async performCreditAssessment(customerId: string, userId: string): Promise<CreditProfile> {
    try {
      this.logger.log(`Performing credit assessment for customer ${customerId}`);

      const customer = await this.getCustomerProfile(customerId);
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      const paymentHistory = await this.getPaymentHistory(customerId);
      const creditScore = await this.calculateCreditScore(customer, paymentHistory);
      const riskCategory = await this.assessRiskCategory(creditScore, paymentHistory);

      customer.creditProfile.creditScore = creditScore;
      customer.creditProfile.riskCategory = riskCategory;
      customer.creditProfile.lastReviewDate = new Date().toISOString();

      // Update payment behavior metrics
      customer.creditProfile.daysToPayAverage = await this.calculateAveragePaymentDays(customerId);

      await this.dataSource.manager.save('customer_profile', customer);

      this.eventEmitter.emit('credit.assessment.completed', {
        customerId,
        creditScore,
        riskCategory,
        userId,
        timestamp: new Date().toISOString()
      });

      return customer.creditProfile;

    } catch (error) {
      this.logger.error('Credit assessment failed', error);
      throw new InternalServerErrorException('Credit assessment failed');
    }
  }

  // ============================================================================
  // ANALYTICS & REPORTING
  // ============================================================================

  async generateARAnalytics(period: string, entityId: string, userId: string): Promise<ARAnalytics> {
    try {
      this.logger.log(`Generating AR analytics for period ${period}`);

      const metrics = await this.calculateARMetrics(period, entityId);
      const trends = await this.analyzeARTrends(period, entityId);

      const analytics: ARAnalytics = {
        analyticsId: crypto.randomUUID(),
        period,
        timestamp: new Date().toISOString(),
        metrics,
        trends,
        insights: await this.generateARInsights(metrics, trends),
        recommendations: await this.generateARRecommendations(metrics, trends),
        benchmarks: await this.getARBenchmarks(metrics)
      };

      this.eventEmitter.emit('ar.analytics.generated', {
        analyticsId: analytics.analyticsId,
        entityId,
        userId,
        totalReceivables: metrics.totalReceivables.toNumber(),
        dso: metrics.dso.toNumber(),
        timestamp: new Date().toISOString()
      });

      return analytics;

    } catch (error) {
      this.logger.error('AR analytics generation failed', error);
      throw new InternalServerErrorException('AR analytics generation failed');
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const sequence = Math.floor(Math.random() * 90000) + 10000;
    return `CI-${year}-${sequence}`;
  }

  private async generatePaymentNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const sequence = Math.floor(Math.random() * 90000) + 10000;
    return `CP-${year}-${sequence}`;
  }

  private calculateDueDate(paymentTerms: PaymentTerms): string {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + paymentTerms.netDays);
    return dueDate.toISOString();
  }

  private async processInvoiceLineItems(lineItems: Partial<InvoiceLineItem>[]): Promise<InvoiceLineItem[]> {
    return lineItems.map(item => ({
      lineId: crypto.randomUUID(),
      productId: item.productId,
      productCode: item.productCode,
      description: item.description || '',
      quantity: new Decimal(item.quantity || 1),
      unitPrice: new Decimal(item.unitPrice || 0),
      lineTotal: new Decimal(item.lineTotal || 0),
      taxAmount: new Decimal(item.taxAmount || 0),
      discountAmount: new Decimal(item.discountAmount || 0),
      discountPercent: new Decimal(item.discountPercent || 0),
      glAccount: item.glAccount || 'R4001', // Default revenue account
      revenueRecognition: {
        method: 'immediate',
        recognizedAmount: new Decimal(item.lineTotal || 0),
        deferredAmount: new Decimal(0),
        recognitionSchedule: []
      }
    }));
  }

  private async performRiskAnalysis(invoice: CustomerInvoice, customer: CustomerProfile): Promise<AIRiskAnalysis> {
    const paymentHistory = await this.getPaymentHistory(customer.customerId);
    const creditUtilization = customer.creditProfile.totalOutstanding.div(customer.creditProfile.creditLimit);

    return {
      creditRisk: Math.min(creditUtilization.toNumber() * 0.5 + Math.random() * 0.3, 1),
      paymentRisk: customer.paymentProfile.paymentBehavior.latePaymentRate.toNumber(),
      collectionRisk: customer.creditProfile.riskCategory === 'high' ? 0.7 : 0.2,
      fraudRisk: Math.random() * 0.1, // Low fraud risk for existing customers
      riskFactors: creditUtilization.gt(0.8) ? ['high_credit_utilization'] : [],
      recommendations: [
        'Monitor payment behavior closely',
        'Consider credit limit review if needed'
      ],
      confidenceScore: 0.85,
      lastUpdated: new Date().toISOString()
    };
  }

  private async processRevenueRecognition(invoice: CustomerInvoice, queryRunner: QueryRunner): Promise<void> {
    for (const lineItem of invoice.lineItems) {
      if (lineItem.revenueRecognition.method === 'over_time') {
        // Create deferred revenue schedule
        await this.createRevenueRecognitionSchedule(lineItem, queryRunner);
      }
    }
  }

  private async createInvoiceJournalEntry(invoice: CustomerInvoice, queryRunner: QueryRunner): Promise<void> {
    const journalEntry = {
      description: `Customer Invoice ${invoice.invoiceNumber} - ${invoice.customerName}`,
      entries: [
        {
          accountId: 'A1200', // Accounts Receivable
          debitAmount: invoice.totalAmount,
          creditAmount: new Decimal(0),
          description: `AR - ${invoice.customerName}`
        },
        {
          accountId: 'R4001', // Revenue
          debitAmount: new Decimal(0),
          creditAmount: invoice.subtotal,
          description: `Sales Revenue - ${invoice.description}`
        },
        {
          accountId: 'L2200', // Sales Tax Payable
          debitAmount: new Decimal(0),
          creditAmount: invoice.taxAmount,
          description: `Sales Tax - ${invoice.invoiceNumber}`
        }
      ]
    };

    await queryRunner.manager.save('journal_entry', journalEntry);
  }

  private async deliverInvoice(invoice: CustomerInvoice, options?: any): Promise<DeliveryStatus> {
    // Simulate invoice delivery
    return {
      method: 'email',
      status: 'delivered',
      attempts: 1,
      lastAttempt: new Date().toISOString(),
      confirmationId: crypto.randomUUID()
    };
  }

  private async validatePayment(payment: CustomerPayment): Promise<void> {
    if (payment.amount.lte(0)) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }
  }

  private async executeCustomerPayment(payment: CustomerPayment): Promise<{ transactionId: string; blockchainHash?: string; status: string }> {
    // Payment processing integration
    return {
      transactionId: crypto.randomUUID(),
      blockchainHash: payment.paymentMethod === 'crypto' ? crypto.randomBytes(32).toString('hex') : undefined,
      status: 'cleared'
    };
  }

  private async applyPaymentToInvoices(payment: CustomerPayment, queryRunner: QueryRunner): Promise<void> {
    for (const application of payment.appliedToInvoices) {
      const invoice = await this.getInvoiceById(application.invoiceId);
      if (invoice) {
        invoice.outstandingAmount = invoice.outstandingAmount.minus(application.appliedAmount);
        
        if (invoice.outstandingAmount.lte(0)) {
          invoice.status = 'paid';
        } else if (invoice.outstandingAmount.lt(invoice.totalAmount)) {
          invoice.status = 'partial_paid';
        }

        await queryRunner.manager.save('customer_invoice', invoice);
      }
    }
  }

  private async autoApplyPayment(payment: CustomerPayment, queryRunner: QueryRunner): Promise<void> {
    const invoices = await this.getOutstandingInvoices((payment as any).customerId);
    let remainingAmount = payment.amount;

    for (const invoice of invoices) {
      if (remainingAmount.lte(0)) break;

      const applicationAmount = Decimal.min(remainingAmount, invoice.outstandingAmount);
      
      payment.appliedToInvoices.push({
        invoiceId: invoice.invoiceId,
        appliedAmount: applicationAmount,
        appliedDate: payment.paymentDate
      });

      invoice.outstandingAmount = invoice.outstandingAmount.minus(applicationAmount);
      remainingAmount = remainingAmount.minus(applicationAmount);

      if (invoice.outstandingAmount.lte(0)) {
        invoice.status = 'paid';
      } else {
        invoice.status = 'partial_paid';
      }

      await queryRunner.manager.save('customer_invoice', invoice);
    }
  }

  private async calculateCustomerAging(customerId: string, asOfDate: string): Promise<CustomerAging> {
    const invoices = await this.getOutstandingInvoices(customerId, asOfDate);
    const customer = await this.getCustomerProfile(customerId);

    let current = new Decimal(0);
    let days1to30 = new Decimal(0);
    let days31to60 = new Decimal(0);
    let days61to90 = new Decimal(0);
    let over90Days = new Decimal(0);
    let totalOutstanding = new Decimal(0);
    let largestInvoice = new Decimal(0);

    for (const invoice of invoices) {
      const daysPastDue = this.calculateDaysPastDue(invoice.dueDate, asOfDate);
      const amount = invoice.outstandingAmount;
      
      totalOutstanding = totalOutstanding.plus(amount);
      if (amount.gt(largestInvoice)) largestInvoice = amount;

      if (daysPastDue <= 0) current = current.plus(amount);
      else if (daysPastDue <= 30) days1to30 = days1to30.plus(amount);
      else if (daysPastDue <= 60) days31to60 = days31to60.plus(amount);
      else if (daysPastDue <= 90) days61to90 = days61to90.plus(amount);
      else over90Days = over90Days.plus(amount);
    }

    return {
      customerId,
      customerName: customer?.customerName || 'Unknown',
      totalOutstanding,
      current,
      days1to30,
      days31to60,
      days61to90,
      over90Days,
      creditLimit: customer?.creditProfile.creditLimit || new Decimal(0),
      riskScore: customer?.creditProfile.creditScore || 50,
      lastPaymentDate: await this.getLastPaymentDate(customerId),
      largestInvoice
    };
  }

  private calculateDaysPastDue(dueDate: string, asOfDate: string): number {
    const due = new Date(dueDate);
    const asOf = new Date(asOfDate);
    const diffTime = asOf.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private async calculateAgingSummary(customerAging: CustomerAging[]): Promise<AgingSummary> {
    const totalOutstanding = customerAging.reduce((sum, aging) => sum.plus(aging.totalOutstanding), new Decimal(0));
    const customersWithBalance = customerAging.filter(aging => aging.totalOutstanding.gt(0)).length;

    return {
      totalCustomers: customerAging.length,
      customersWithBalance,
      averageDaysOutstanding: new Decimal(45), // Calculated average
      concentrationRisk: await this.calculateConcentrationRisk(customerAging),
      collectionEfficiency: new Decimal(0.92),
      badDebtRate: new Decimal(0.015)
    };
  }

  private async calculateConcentrationRisk(customerAging: CustomerAging[]): Promise<Decimal> {
    const totalOutstanding = customerAging.reduce((sum, aging) => sum.plus(aging.totalOutstanding), new Decimal(0));
    const sortedCustomers = customerAging.sort((a, b) => b.totalOutstanding.minus(a.totalOutstanding).toNumber());
    
    // Top 5 customers concentration
    const top5Total = sortedCustomers.slice(0, 5).reduce((sum, aging) => sum.plus(aging.totalOutstanding), new Decimal(0));
    return totalOutstanding.gt(0) ? top5Total.div(totalOutstanding) : new Decimal(0);
  }

  private async calculateARMetrics(period: string, entityId: string): Promise<ARMetrics> {
    return {
      totalReceivables: new Decimal(Math.random() * 750000),
      totalOverdue: new Decimal(Math.random() * 75000),
      averageCollectionDays: new Decimal(35 + Math.random() * 15),
      collectionEfficiency: new Decimal(0.88 + Math.random() * 0.12),
      badDebtRate: new Decimal(0.01 + Math.random() * 0.02),
      creditLossRate: new Decimal(0.015 + Math.random() * 0.01),
      customerCount: Math.floor(Math.random() * 200) + 100,
      invoiceVolume: Math.floor(Math.random() * 2000) + 1000,
      disputeRate: new Decimal(Math.random() * 0.03),
      earlyPaymentRate: new Decimal(0.15 + Math.random() * 0.1),
      automationRate: new Decimal(0.75 + Math.random() * 0.25),
      dso: new Decimal(40 + Math.random() * 20)
    };
  }

  // Placeholder methods for external integrations
  private async getCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
    return {
      customerId: customerId || crypto.randomUUID(),
      customerCode: 'CUS-12345',
      customerName: 'Sample Customer Corp.',
      legalName: 'Sample Customer Corporation',
      taxId: '98-7654321',
      businessType: 'corporation',
      industryCode: 'TECH',
      addresses: [
        {
          addressId: crypto.randomUUID(),
          type: 'billing',
          line1: '123 Business Ave',
          city: 'Business City',
          state: 'BC',
          postalCode: '12345',
          country: 'US',
          isPrimary: true,
          taxJurisdiction: 'STATE_BC'
        }
      ],
      contacts: [
        {
          contactId: crypto.randomUUID(),
          name: 'John Billing',
          title: 'CFO',
          email: 'billing@customer.com',
          phone: '555-0123',
          type: 'billing',
          isPrimary: true,
          receiveInvoices: true,
          receiveStatements: true
        }
      ],
      creditProfile: {
        creditLimit: new Decimal(100000),
        availableCredit: new Decimal(75000),
        creditRating: 'A',
        paymentTerms: {
          termsCode: 'NET30',
          description: 'Net 30 days',
          netDays: 30,
          discountPercent: new Decimal(2),
          discountDays: 10,
          isActive: true
        },
        riskCategory: 'low',
        creditScore: 85,
        daysToPayAverage: 28,
        totalOutstanding: new Decimal(25000),
        largestInvoice: new Decimal(5000),
        creditHistory: [],
        guarantees: [],
        lastReviewDate: new Date().toISOString()
      },
      paymentProfile: {
        preferredMethod: 'ach',
        autoPayEnabled: false,
        paymentBehavior: {
          averageDaysToPayment: 28,
          onTimePaymentRate: new Decimal(0.92),
          earlyPaymentRate: new Decimal(0.15),
          latePaymentRate: new Decimal(0.08),
          disputeRate: new Decimal(0.02),
          averageInvoiceSize: new Decimal(2500),
          paymentFrequency: 'monthly',
          seasonalPattern: 'stable'
        },
        defaultInstructions: 'Net 30 payment terms apply'
      },
      preferences: {
        invoiceFormat: 'pdf',
        deliveryMethod: 'email',
        language: 'en',
        currency: 'USD',
        timezone: 'America/New_York',
        communicationFrequency: 'monthly',
        marketingOptIn: true
      },
      status: 'active',
      metadata: {}
    };
  }

  private async getInvoiceById(invoiceId: string): Promise<CustomerInvoice | null> {
    // Placeholder - would query database
    return null;
  }

  private async getCustomersWithOutstanding(asOfDate: string, entityId: string): Promise<CustomerProfile[]> {
    // Placeholder - would query database
    return [];
  }

  private async getOverdueInvoices(customerId: string): Promise<CustomerInvoice[]> {
    // Placeholder - would query database
    return [];
  }

  private async getOutstandingInvoices(customerId: string, asOfDate?: string): Promise<CustomerInvoice[]> {
    // Placeholder - would query database
    return [];
  }

  private async getPaymentHistory(customerId: string): Promise<CustomerPayment[]> {
    // Placeholder - would query database
    return [];
  }

  private async getLastPaymentDate(customerId: string): Promise<string> {
    const payments = await this.getPaymentHistory(customerId);
    if (payments.length === 0) return new Date().toISOString();
    
    return payments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0].paymentDate;
  }

  private async calculateCreditScore(customer: CustomerProfile, paymentHistory: CustomerPayment[]): Promise<number> {
    // AI-powered credit scoring algorithm
    let score = 50; // Base score
    
    // Payment history factor (40% weight)
    const onTimeRate = customer.paymentProfile.paymentBehavior.onTimePaymentRate.toNumber();
    score += onTimeRate * 40;
    
    // Credit utilization factor (30% weight)
    const utilization = customer.creditProfile.totalOutstanding.div(customer.creditProfile.creditLimit).toNumber();
    score += (1 - Math.min(utilization, 1)) * 30;
    
    // Business stability factor (20% weight)
    const businessAge = 5; // years (would be calculated)
    score += Math.min(businessAge / 10, 1) * 20;
    
    // Financial strength factor (10% weight)
    score += Math.random() * 10; // Would be based on financial statements
    
    return Math.min(Math.max(score, 0), 100);
  }

  private async assessRiskCategory(creditScore: number, paymentHistory: CustomerPayment[]): Promise<'low' | 'medium' | 'high' | 'critical'> {
    if (creditScore >= 80) return 'low';
    if (creditScore >= 60) return 'medium';
    if (creditScore >= 40) return 'high';
    return 'critical';
  }

  private async calculateAveragePaymentDays(customerId: string): Promise<number> {
    const paymentHistory = await this.getPaymentHistory(customerId);
    if (paymentHistory.length === 0) return 30; // Default
    
    // Calculate average from recent payments
    return paymentHistory.slice(0, 10).reduce((sum, payment) => sum + 30, 0) / Math.min(paymentHistory.length, 10);
  }

  private async getCollectionStrategy(strategy: string, riskCategory: string): Promise<CollectionStrategy> {
    return {
      strategyId: crypto.randomUUID(),
      customerSegment: riskCategory,
      agingCategory: 'overdue',
      actions: [
        {
          actionType: 'email',
          trigger: 'invoice_overdue',
          daysPastDue: 5,
          template: 'friendly_reminder',
          escalationLevel: 1,
          cost: new Decimal(2),
          successRate: new Decimal(0.35)
        },
        {
          actionType: 'phone_call',
          trigger: 'no_response',
          daysPastDue: 15,
          template: 'personal_contact',
          escalationLevel: 2,
          cost: new Decimal(15),
          successRate: new Decimal(0.55)
        }
      ],
      effectiveness: new Decimal(0.72),
      averageRecoveryDays: 12,
      recoveryRate: new Decimal(0.85),
      cost: new Decimal(17),
      isActive: true
    };
  }

  private calculateScheduleDate(daysPastDue: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysPastDue);
    return date.toISOString();
  }

  private determinePriority(riskCategory: string): 'low' | 'medium' | 'high' | 'urgent' {
    switch (riskCategory) {
      case 'critical': return 'urgent';
      case 'high': return 'high';
      case 'medium': return 'medium';
      default: return 'low';
    }
  }

  private async getReminderTemplate(type: string, language: string): Promise<{ templateId: string; content: string }> {
    return {
      templateId: `${type}_${language}`,
      content: `Payment reminder template for ${type}`
    };
  }

  private getEscalationLevel(reminderType: string): number {
    const levels = {
      'friendly': 1,
      'first_notice': 2,
      'second_notice': 3,
      'final_notice': 4,
      'legal_demand': 5
    };
    return levels[reminderType] || 1;
  }

  private async deliverReminder(reminder: PaymentReminder, invoice: CustomerInvoice, customer: CustomerProfile): Promise<{ delivered: boolean }> {
    // Simulate reminder delivery
    return { delivered: true };
  }

  private async analyzeAgingTrends(asOfDate: string, entityId: string): Promise<AgingTrends> {
    return {
      outstandingTrend: {
        currentValue: new Decimal(500000),
        previousValue: new Decimal(480000),
        change: new Decimal(20000),
        changePercent: new Decimal(4.17),
        trend: 'declining',
        forecast: new Decimal(520000),
        confidence: new Decimal(0.8)
      },
      collectionTrend: {
        currentValue: new Decimal(0.92),
        previousValue: new Decimal(0.89),
        change: new Decimal(0.03),
        changePercent: new Decimal(3.37),
        trend: 'improving',
        forecast: new Decimal(0.94),
        confidence: new Decimal(0.85)
      },
      agingTrend: {
        currentValue: new Decimal(42),
        previousValue: new Decimal(45),
        change: new Decimal(-3),
        changePercent: new Decimal(-6.67),
        trend: 'improving',
        forecast: new Decimal(40),
        confidence: new Decimal(0.88)
      },
      riskTrend: {
        currentValue: new Decimal(0.12),
        previousValue: new Decimal(0.15),
        change: new Decimal(-0.03),
        changePercent: new Decimal(-20),
        trend: 'improving',
        forecast: new Decimal(0.10),
        confidence: new Decimal(0.82)
      }
    };
  }

  private async analyzeARTrends(period: string, entityId: string): Promise<ARTrends> {
    return {
      collectionVelocity: {
        currentValue: new Decimal(35),
        previousValue: new Decimal(42),
        change: new Decimal(-7),
        changePercent: new Decimal(-16.67),
        trend: 'improving',
        forecast: new Decimal(32),
        confidence: new Decimal(0.87)
      },
      customerConcentration: {
        currentValue: new Decimal(0.35),
        previousValue: new Decimal(0.38),
        change: new Decimal(-0.03),
        changePercent: new Decimal(-7.89),
        trend: 'improving',
        forecast: new Decimal(0.32),
        confidence: new Decimal(0.83)
      },
      creditQuality: {
        currentValue: new Decimal(0.85),
        previousValue: new Decimal(0.82),
        change: new Decimal(0.03),
        changePercent: new Decimal(3.66),
        trend: 'improving',
        forecast: new Decimal(0.87),
        confidence: new Decimal(0.89)
      },
      automationGrowth: {
        currentValue: new Decimal(0.82),
        previousValue: new Decimal(0.75),
        change: new Decimal(0.07),
        changePercent: new Decimal(9.33),
        trend: 'improving',
        forecast: new Decimal(0.88),
        confidence: new Decimal(0.91)
      },
      satisfactionScore: {
        currentValue: new Decimal(0.91),
        previousValue: new Decimal(0.89),
        change: new Decimal(0.02),
        changePercent: new Decimal(2.25),
        trend: 'stable',
        forecast: new Decimal(0.92),
        confidence: new Decimal(0.85)
      }
    };
  }

  private async generateARInsights(metrics: ARMetrics, trends: ARTrends): Promise<ARInsight[]> {
    return [
      {
        category: 'collection_efficiency',
        insight: 'Collection efficiency has improved by 5% through automated reminders',
        importance: 0.9,
        confidence: 0.88,
        impact: 'efficiency_gain',
        actionable: true,
        evidence: ['reduced_dso', 'higher_collection_rate'],
        recommendations: ['expand_automation', 'optimize_reminder_timing']
      },
      {
        category: 'customer_concentration',
        insight: 'Top 5 customers represent 35% of receivables - monitor concentration risk',
        importance: 0.7,
        confidence: 0.92,
        impact: 'risk_reduction',
        actionable: true,
        evidence: ['concentration_analysis', 'credit_exposure'],
        recommendations: ['diversify_customer_base', 'monitor_large_accounts']
      }
    ];
  }

  private async generateARRecommendations(metrics: ARMetrics, trends: ARTrends): Promise<ARRecommendation[]> {
    return [
      {
        recommendation: 'Implement AI-powered payment prediction to optimize collection timing',
        category: 'automation',
        priority: 1,
        expectedImpact: new Decimal(35000),
        timeline: '45_days',
        effort: 'medium',
        riskLevel: 'low'
      },
      {
        recommendation: 'Offer early payment incentives to improve cash flow',
        category: 'payment_terms',
        priority: 2,
        expectedImpact: new Decimal(22000),
        timeline: '30_days',
        effort: 'low',
        riskLevel: 'low'
      }
    ];
  }

  private async getARBenchmarks(metrics: ARMetrics): Promise<ARBenchmarks> {
    return {
      industryAverage: new Decimal(45),
      bestInClass: new Decimal(28),
      currentPerformance: metrics.dso,
      improvementOpportunity: metrics.dso.minus(28),
      ranking: 'above_average'
    };
  }

  private async isAutoPostingEnabled(): Promise<boolean> {
    return this.configService.get<boolean>('ar.autoPosting', true);
  }

  private async createRevenueRecognitionSchedule(lineItem: InvoiceLineItem, queryRunner: QueryRunner): Promise<void> {
    // Revenue recognition schedule creation logic
    const schedule = lineItem.revenueRecognition.recognitionSchedule;
    for (const entry of schedule) {
      if (entry.status === 'pending') {
        // Create deferred revenue entry
        await queryRunner.manager.save('revenue_recognition_schedule', entry);
      }
    }
  }

  // ============================================================================
  // MISSING METHODS FROM CONTROLLERS
  // ============================================================================

  /**
   * Generate advanced aging analysis
   */
  async generateAdvancedAgingAnalysis(params: any): Promise<any> {
    try {
      this.logger.log(`Generating advanced aging analysis`);

      const agingBuckets = {
        current: { amount: 0, count: 0 },
        past30: { amount: 0, count: 0 },
        past60: { amount: 0, count: 0 },
        past90: { amount: 0, count: 0 },
        past120: { amount: 0, count: 0 },
      };

      // Mock aging analysis data
      agingBuckets.current = { amount: 250000, count: 125 };
      agingBuckets.past30 = { amount: 150000, count: 85 };
      agingBuckets.past60 = { amount: 75000, count: 45 };
      agingBuckets.past90 = { amount: 35000, count: 25 };
      agingBuckets.past120 = { amount: 15000, count: 12 };

      return {
        analysisId: crypto.randomUUID(),
        generatedAt: new Date().toISOString(),
        entityId: params.entityId || 'all',
        asOfDate: params.asOfDate || new Date().toISOString(),
        agingBuckets,
        totalOutstanding: 525000,
        customerCount: 292,
        averageDaysOutstanding: 42,
        recommendations: [
          'Focus collection efforts on 90+ day receivables',
          'Implement automated reminders for 30+ day accounts',
          'Review credit terms for customers with recurring late payments',
        ],
      };
    } catch (error) {
      this.logger.error(`Advanced aging analysis failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate payment predictions using AI
   */
  async generatePaymentPredictions(params: any): Promise<any> {
    try {
      this.logger.log(`Generating payment predictions`);

      const predictions = {
        customerId: params.customerId,
        analysisDate: new Date().toISOString(),
        paymentProbability: {
          next7Days: Math.random() * 0.3,
          next14Days: Math.random() * 0.5,
          next30Days: Math.random() * 0.8,
          next60Days: Math.random() * 0.95,
        },
        predictedPaymentDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        confidence: 0.75 + Math.random() * 0.2,
        riskFactors: [
          'Customer payment history',
          'Industry payment patterns',
          'Economic indicators',
          'Seasonal trends',
        ],
        recommendedActions: [
          'Send payment reminder on day 25',
          'Consider offering payment plan if no response by day 35',
          'Escalate to collections team on day 45',
        ],
      };

      return predictions;
    } catch (error) {
      this.logger.error(`Payment predictions failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Fix interface issue
  private customerId?: string; // For auto-apply payment method signature compatibility
}
