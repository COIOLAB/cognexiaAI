export enum SubscriptionPlanType {
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  BUSINESS = 'BUSINESS',
  ENTERPRISE = 'ENTERPRISE',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  TRIAL = 'TRIAL',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
  PAST_DUE = 'PAST_DUE',
}

export enum BillingInterval {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: SubscriptionPlanType;
  description?: string;
  price: number;
  billingInterval: BillingInterval;
  features: string[];
  maxUsers: number;
  maxStorage: number;
  maxApiCalls: number;
  isActive: boolean;
  trialDays: number;
  stripePriceId?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Subscription {
  id: string;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
  };
  planId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: Date | string;
  currentPeriodEnd: Date | string;
  trialStart?: Date | string;
  trialEnd?: Date | string;
  canceledAt?: Date | string;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreatePlanRequest {
  name: string;
  type: SubscriptionPlanType;
  description?: string;
  price: number;
  billingInterval: BillingInterval;
  features: string[];
  maxUsers: number;
  maxStorage: number;
  maxApiCalls: number;
  trialDays: number;
  stripePriceId?: string;
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  price?: number;
  features?: string[];
  maxUsers?: number;
  maxStorage?: number;
  maxApiCalls?: number;
  isActive?: boolean;
}

export interface Transaction {
  id: string;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
  };
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  type: 'CHARGE' | 'REFUND' | 'SUBSCRIPTION' | 'INVOICE';
  description?: string;
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
  metadata?: Record<string, any>;
  createdAt: Date | string;
}

export interface BillingMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  averageRevenuePerUser: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  refundedAmount: number;
}
