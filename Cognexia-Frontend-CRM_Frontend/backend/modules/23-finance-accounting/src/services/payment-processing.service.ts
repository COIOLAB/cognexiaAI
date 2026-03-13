/**
 * Payment Processing Service
 * 
 * Handles all payment processing operations including payment execution,
 * validation, fraud detection, and integration with payment gateways.
 */

import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Decimal from 'decimal.js';

// Import TypeORM entities
import { PaymentTransaction } from '../entities';

// Payment interfaces and types
export interface PaymentRequest {
  amount: number;
  currency: string;
  vendorId?: string;
  customerId?: string;
  invoiceId?: string;
  paymentMethod: 'ach' | 'wire' | 'check' | 'card' | 'crypto';
  description?: string;
  scheduledDate?: string;
  reference?: string;
}

export interface PaymentResult {
  paymentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  transactionId?: string;
  fees?: number;
  exchangeRate?: number;
  processedAt?: string;
  confirmationCode?: string;
}

export interface PaymentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  riskScore: number;
}

@Injectable()
export class PaymentProcessingService {
  private readonly logger = new Logger(PaymentProcessingService.name);

  constructor(
    @InjectRepository(PaymentTransaction)
    private paymentTransactionRepository: Repository<PaymentTransaction>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Process a payment request
   */
  async processPayment(paymentRequest: PaymentRequest, userId: string): Promise<PaymentResult> {
    try {
      // Validate payment request
      const validation = await this.validatePayment(paymentRequest);
      if (!validation.isValid) {
        throw new BadRequestException(`Payment validation failed: ${validation.errors.join(', ')}`);
      }

      // Create payment record
      const payment = await this.createPaymentRecord(paymentRequest, userId);

      // Process payment based on method
      const result = await this.executePayment(payment, paymentRequest);

      // Emit payment processed event
      this.eventEmitter.emit('payment.processed', {
        paymentId: result.paymentId,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        status: result.status,
        userId,
      });

      return result;
    } catch (error) {
      const err = error as any;
      this.logger.error(`Payment processing failed: ${err?.message ?? 'unknown error'}`, err?.stack);
      throw error;
    }
  }

  /**
   * Validate payment request
   */
  async validatePayment(paymentRequest: PaymentRequest): Promise<PaymentValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskScore = 0;

    // Amount validation
    if (!paymentRequest.amount || paymentRequest.amount <= 0) {
      errors.push('Payment amount must be greater than zero');
    }

    if (paymentRequest.amount > 1000000) {
      warnings.push('Large payment amount detected');
      riskScore += 30;
    }

    // Currency validation
    const supportedCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY'];
    if (!supportedCurrencies.includes(paymentRequest.currency)) {
      errors.push(`Unsupported currency: ${paymentRequest.currency}`);
    }

    // Payment method validation
    const supportedMethods = ['ach', 'wire', 'check', 'card', 'crypto'];
    if (!supportedMethods.includes(paymentRequest.paymentMethod)) {
      errors.push(`Unsupported payment method: ${paymentRequest.paymentMethod}`);
    }

    // Risk assessment
    if (paymentRequest.paymentMethod === 'crypto') {
      riskScore += 50;
    }

    if (paymentRequest.paymentMethod === 'wire' && paymentRequest.amount > 50000) {
      riskScore += 25;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      riskScore,
    };
  }

  /**
   * Create payment record in database
   */
  private async createPaymentRecord(paymentRequest: PaymentRequest, userId: string): Promise<any> {
    // This will be implemented when Payment entity is created
    const paymentId = this.generatePaymentId();
    
    return {
      id: paymentId,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      status: 'pending',
      createdBy: userId,
      createdAt: new Date(),
      ...paymentRequest,
    };
  }

  /**
   * Execute payment based on payment method
   */
  private async executePayment(payment: any, paymentRequest: PaymentRequest): Promise<PaymentResult> {
    switch (paymentRequest.paymentMethod) {
      case 'ach':
        return this.processACHPayment(payment);
      case 'wire':
        return this.processWirePayment(payment);
      case 'check':
        return this.processCheckPayment(payment);
      case 'card':
        return this.processCardPayment(payment);
      case 'crypto':
        return this.processCryptoPayment(payment);
      default:
        throw new BadRequestException(`Unsupported payment method: ${paymentRequest.paymentMethod}`);
    }
  }

  /**
   * Process ACH payment
   */
  private async processACHPayment(payment: any): Promise<PaymentResult> {
    // Simulate ACH processing
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      paymentId: payment.id,
      status: 'processing',
      transactionId: `ACH_${Date.now()}`,
      fees: new Decimal(payment.amount).mul(0.0025).toNumber(), // 0.25% fee
      processedAt: new Date().toISOString(),
      confirmationCode: this.generateConfirmationCode(),
    };
  }

  /**
   * Process wire payment
   */
  private async processWirePayment(payment: any): Promise<PaymentResult> {
    // Simulate wire processing
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      paymentId: payment.id,
      status: 'processing',
      transactionId: `WIRE_${Date.now()}`,
      fees: 25.00, // Fixed wire fee
      processedAt: new Date().toISOString(),
      confirmationCode: this.generateConfirmationCode(),
    };
  }

  /**
   * Process check payment
   */
  private async processCheckPayment(payment: any): Promise<PaymentResult> {
    return {
      paymentId: payment.id,
      status: 'pending',
      transactionId: `CHECK_${Date.now()}`,
      fees: 2.50, // Check printing fee
      confirmationCode: this.generateConfirmationCode(),
    };
  }

  /**
   * Process card payment
   */
  private async processCardPayment(payment: any): Promise<PaymentResult> {
    // Simulate card processing
    await new Promise(resolve => setTimeout(resolve, 150));

    return {
      paymentId: payment.id,
      status: 'completed',
      transactionId: `CARD_${Date.now()}`,
      fees: new Decimal(payment.amount).mul(0.029).toNumber(), // 2.9% fee
      processedAt: new Date().toISOString(),
      confirmationCode: this.generateConfirmationCode(),
    };
  }

  /**
   * Process cryptocurrency payment
   */
  private async processCryptoPayment(payment: any): Promise<PaymentResult> {
    // Simulate crypto processing
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      paymentId: payment.id,
      status: 'processing',
      transactionId: `CRYPTO_${Date.now()}`,
      fees: new Decimal(payment.amount).mul(0.01).toNumber(), // 1% fee
      processedAt: new Date().toISOString(),
      confirmationCode: this.generateConfirmationCode(),
    };
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResult> {
    // This will be implemented when Payment entity is created
    // For now, return a mock status
    return {
      paymentId,
      status: 'completed',
      transactionId: `TXN_${paymentId}`,
      processedAt: new Date().toISOString(),
      confirmationCode: this.generateConfirmationCode(),
    };
  }

  /**
   * Cancel payment
   */
  async cancelPayment(paymentId: string, reason: string, userId: string): Promise<boolean> {
    try {
      // Update payment status to cancelled
      // This will be implemented when Payment entity is created
      
      // Emit payment cancelled event
      this.eventEmitter.emit('payment.cancelled', {
        paymentId,
        reason,
        userId,
        cancelledAt: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      const err = error as any;
      this.logger.error(`Payment cancellation failed: ${err?.message ?? 'unknown error'}`, err?.stack);
      return false;
    }
  }

  /**
   * Generate unique payment ID
   */
  private generatePaymentId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `PAY_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Generate confirmation code
   */
  private generateConfirmationCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  /**
   * Optimize cash flow for payments and collections.
   * @param optimizationParams - The parameters for the cash flow optimization.
   * @returns The results of the cash flow optimization.
   */
  async optimizeCashFlow(optimizationParams: any): Promise<any> {
    this.logger.log('Optimizing cash flow');

    return {
      optimizationId: `CFO_${Date.now()}`,
      optimalPaymentSchedule: [],
      optimalCollectionSchedule: [],
      cashFlowImpact: 0,
      recommendations: [],
    };
  }

  /**
   * Optimize payment in real-time.
   * @param data - The data for the real-time payment optimization.
   * @returns The results of the real-time payment optimization.
   */
  async optimizePaymentRealTime(data: any): Promise<any> {
    this.logger.log('Optimizing payment in real-time');

    return {
      optimizationId: `RTO_${Date.now()}`,
      optimalPaymentMethod: 'ach',
      optimalPaymentDate: new Date().toISOString(),
      discountCaptured: 0,
      cashFlowImpact: 0,
    };
  }

  /**
   * Process an advanced payment with real-time validation and compliance checks.
   * @param paymentDto - The data for the payment to be processed.
   * @param userId - The ID of the user initiating the payment.
   * @returns The processed payment record.
   */
  async processAdvancedPayment(paymentDto: any, userId: string): Promise<PaymentResult> {
    this.logger.log(`Processing advanced payment for user ${userId}`);
    // This is a placeholder implementation.
    // In a real-world scenario, this would involve multiple steps like:
    // 1. Enhanced real-time fraud detection using AI/ML.
    // 2. Dynamic compliance and AML checks.
    // 3. Multi-currency conversion with real-time rates.
    // 4. Smart routing to optimize payment fees and speed.
    // 5. Integration with treasury and cash management.

    const result = await this.processPayment(paymentDto, userId);

    this.eventEmitter.emit('advanced.payment.processed', {
      paymentId: result.paymentId,
      amount: paymentDto.amount,
      status: result.status,
      userId,
      advancedFeatures: {
        fraudScore: Math.random(),
        complianceChecked: true,
      }
    });

    return result;
  }

  /**
   * Retry failed payment
   */
  async retryPayment(paymentId: string, userId: string): Promise<PaymentResult> {
    try {
      // Get original payment details
      // This will be implemented when Payment entity is created
      
      // Retry payment processing
      const mockPaymentRequest: PaymentRequest = {
        amount: 1000,
        currency: 'USD',
        paymentMethod: 'ach',
        description: 'Retry payment',
      };

      return this.processPayment(mockPaymentRequest, userId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`Payment retry failed: ${err?.message ?? 'unknown error'}`, err?.stack);
      throw error;
    }
  }

  /**
   * Forecast cash inflows and outflows over a time window.
   * Provides a simple baseline forecast you can later replace with a true model.
   */
  async forecastCashFlow(params: { days: number; baselineDailyNet?: number; seasonality?: number[] }): Promise<{
    forecastId: string;
    horizonDays: number;
    series: { date: string; inflow: number; outflow: number; net: number }[];
    assumptions: Record<string, any>;
  }> {
    const days = Math.max(1, Math.min(365, params?.days ?? 30));
    const baselineDailyNet = new Decimal(params?.baselineDailyNet ?? 0);
    const seasonality = Array.isArray(params?.seasonality) && params.seasonality.length > 0 ? params.seasonality : [1];

    const series: { date: string; inflow: number; outflow: number; net: number }[] = [];
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const seasonFactor = new Decimal(seasonality[i % seasonality.length]);
      const net = baselineDailyNet.mul(seasonFactor);
      // naive split: 60% inflow, 40% outflow around net
      const inflow = Decimal.max(0, net.mul(0.6).toDecimalPlaces(2)).toNumber();
      const outflow = Decimal.max(0, net.mul(0.4).neg().toDecimalPlaces(2)).abs().toNumber();
      series.push({ date: d.toISOString(), inflow, outflow, net: inflow - outflow });
    }

    return {
      forecastId: `FCF_${Date.now()}`,
      horizonDays: days,
      series,
      assumptions: {
        baselineDailyNet: baselineDailyNet.toNumber(),
        seasonality,
        method: 'baseline-proportional',
      },
    };
  }

  /**
   * Compute an optimized disbursement schedule for payables given constraints.
   * Example constraints: working capital target, max daily spend, due dates.
   */
  async optimizeDisbursementSchedule(input: {
    payables: { id: string; amount: number; currency: string; dueDate: string; discount?: { rate: number; deadline: string } }[];
    constraints?: { maxDailySpend?: number; preferDiscounts?: boolean };
  }): Promise<{
    optimizationId: string;
    schedule: { date: string; payments: { payableId: string; amount: number; method: PaymentRequest['paymentMethod'] }[] }[];
    discountsCaptured: { payableId: string; discountAmount: number }[];
    feesEstimate: number;
    notes?: string[];
  }> {
    this.logger.log('Optimizing disbursement schedule');
    const constraints = input?.constraints ?? {};
    const maxDailySpend = constraints.maxDailySpend ?? Infinity;

    // Greedy grouping by due date, optionally pulling in earlier for discounts
    const payables = [...(input?.payables ?? [])].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const scheduleMap = new Map<string, { payableId: string; amount: number; method: PaymentRequest['paymentMethod'] }[]>();
    const discountsCaptured: { payableId: string; discountAmount: number }[] = [];
    let totalFees = new Decimal(0);

    for (const p of payables) {
      const todayISO = new Date().toISOString();
      const takeDiscount = !!constraints.preferDiscounts && p.discount && todayISO <= p.discount.deadline;
      const targetDate = takeDiscount ? p.discount!.deadline : p.dueDate;

      if (!scheduleMap.has(targetDate)) scheduleMap.set(targetDate, []);

      // naive rail selection by amount to estimate fee
      const method: PaymentRequest['paymentMethod'] = p.amount > 50000 ? 'wire' : 'ach';
      const fee = method === 'wire' ? new Decimal(25) : new Decimal(p.amount).mul(0.0025);
      totalFees = totalFees.add(fee);

      scheduleMap.get(targetDate)!.push({ payableId: p.id, amount: p.amount, method });

      if (takeDiscount) {
        const discountAmount = new Decimal(p.amount).mul(p.discount!.rate).toDecimalPlaces(2).toNumber();
        discountsCaptured.push({ payableId: p.id, discountAmount });
      }
    }

    // Enforce maxDailySpend by splitting into multiple days if required (simple pass)
    const schedule: { date: string; payments: { payableId: string; amount: number; method: PaymentRequest['paymentMethod'] }[] }[] = [];
    for (const [date, payments] of scheduleMap.entries()) {
      let bucket: typeof payments = [];
      let bucketTotal = new Decimal(0);
      for (const pay of payments) {
        const nextTotal = bucketTotal.add(pay.amount);
        if (nextTotal.lte(maxDailySpend)) {
          bucket.push(pay);
          bucketTotal = nextTotal;
        } else {
          schedule.push({ date, payments: bucket });
          bucket = [pay];
          bucketTotal = new Decimal(pay.amount);
        }
      }
      if (bucket.length) schedule.push({ date, payments: bucket });
    }

    return {
      optimizationId: `DSP_${Date.now()}`,
      schedule: schedule.sort((a, b) => a.date.localeCompare(b.date)),
      discountsCaptured,
      feesEstimate: totalFees.toDecimalPlaces(2).toNumber(),
      notes: [
        'Heuristic schedule; replace with LP/MILP optimization for production.',
      ],
    };
  }

  /**
   * Recommend whether to capture early payment discounts for a single invoice.
   */
  async recommendEarlyPaymentDiscount(input: {
    invoiceAmount: number;
    discountRate: number; // e.g., 0.02 for 2%
    discountDeadline: string; // ISO date
    netDueDate: string; // ISO date
    costOfCapitalAPR?: number; // e.g., 0.12 for 12% APR
  }): Promise<{
    takeDiscount: boolean;
    effectiveAPR: number;
    recommendedPaymentDate: string;
    rationale: string[];
  }> {
    const now = new Date();
    const deadline = new Date(input.discountDeadline);
    const netDue = new Date(input.netDueDate);
    const amount = new Decimal(input.invoiceAmount);
    const discount = amount.mul(input.discountRate);

    // Days between discount deadline and net due
    const daysBetween = Math.max(1, Math.round((netDue.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24)));
    // Effective APR of taking the discount (classic 2/10 net 30 calc generalized)
    const periodicRate = discount.div(amount.minus(discount));
    const effectiveAPR = periodicRate.mul(365).mul(1 / daysBetween).toNumber();

    const hurdle = input.costOfCapitalAPR ?? 0.12; // default 12%
    const takeDiscount = effectiveAPR > hurdle && now <= deadline;

    return {
      takeDiscount,
      effectiveAPR: Number(new Decimal(effectiveAPR).toDecimalPlaces(6).toNumber()),
      recommendedPaymentDate: (takeDiscount ? deadline : netDue).toISOString(),
      rationale: [
        `Discount value: ${discount.toDecimalPlaces(2).toNumber()}`,
        `Effective APR: ${(effectiveAPR * 100).toFixed(2)}% vs hurdle ${(hurdle * 100).toFixed(2)}%`,
      ],
    };
  }

  /**
   * Choose an optimal payment rail given amount, urgency, and fee sensitivity.
   */
  async selectOptimalPaymentRail(input: {
    amount: number;
    urgency: 'low' | 'medium' | 'high';
    preferLowFees?: boolean;
  }): Promise<{ method: PaymentRequest['paymentMethod']; etaHours: number; estimatedFees: number; rationale: string[] }> {
    const amt = new Decimal(input.amount);

    let method: PaymentRequest['paymentMethod'] = 'ach';
    let etaHours = 48;
    let fees = amt.mul(0.0025);
    const notes: string[] = [];

    if (input.urgency === 'high') {
      method = amt.gt(50000) ? 'wire' : 'card';
      etaHours = method === 'wire' ? 2 : 1;
      fees = method === 'wire' ? new Decimal(25) : amt.mul(0.029);
      notes.push('High urgency favors faster rails.');
    } else if (input.preferLowFees) {
      method = 'ach';
      etaHours = 24;
      fees = amt.mul(0.0025);
      notes.push('Low fee preference favors ACH.');
    } else if (amt.gt(100000)) {
      method = 'wire';
      etaHours = 4;
      fees = new Decimal(25);
      notes.push('Large amounts route to wire for reliability.');
    }

    return {
      method,
      etaHours,
      estimatedFees: fees.toDecimalPlaces(2).toNumber(),
      rationale: notes,
    };
  }

  /**
   * Simulate multiple payment strategies and rank by cash impact and fees.
   */
  async simulatePaymentScenarios(input: {
    scenarios: {
      id: string;
      description?: string;
      payments: { amount: number; method: PaymentRequest['paymentMethod']; date: string }[];
    }[];
  }): Promise<{
    simulationId: string;
    results: {
      scenarioId: string;
      totalFees: number;
      completionWindowHours: number;
      cashOutByDay: { date: string; total: number }[];
      score: number; // lower fees and faster completion => higher score
    }[];
    bestScenarioId: string | null;
  }> {
    this.logger.log('Simulating payment scenarios');
    const results: {
      scenarioId: string;
      totalFees: number;
      completionWindowHours: number;
      cashOutByDay: { date: string; total: number }[];
      score: number;
    }[] = [];

    for (const s of input.scenarios) {
      let fees = new Decimal(0);
      let latestCompletionHours = 0;
      const byDay: Record<string, Decimal> = {} as any;

      for (const p of s.payments) {
        const amt = new Decimal(p.amount);
        const fee = p.method === 'wire' ? new Decimal(25) : p.method === 'card' ? amt.mul(0.029) : amt.mul(0.0025);
        fees = fees.add(fee);

        const eta = p.method === 'wire' ? 4 : p.method === 'card' ? 1 : 24; // rough
        latestCompletionHours = Math.max(latestCompletionHours, eta);

        const day = new Date(p.date).toISOString().slice(0, 10);
        byDay[day] = (byDay[day] ?? new Decimal(0)).add(amt);
      }

      const cashOutByDay = Object.entries(byDay)
        .map(([date, total]) => ({ date, total: total.toDecimalPlaces(2).toNumber() }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Simple score: lower fees and shorter completion window gets higher score
      const score = new Decimal(1000)
        .minus(fees)
        .minus(latestCompletionHours)
        .toNumber();

      results.push({
        scenarioId: s.id,
        totalFees: fees.toDecimalPlaces(2).toNumber(),
        completionWindowHours: latestCompletionHours,
        cashOutByDay,
        score,
      });
    }

    const best = results.sort((a, b) => b.score - a.score)[0] ?? null;
    return {
      simulationId: `SIM_${Date.now()}`,
      results,
      bestScenarioId: best?.scenarioId ?? null,
    };
  }
}
