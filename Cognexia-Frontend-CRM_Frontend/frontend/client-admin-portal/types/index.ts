export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'super_admin' | 'org_admin' | 'org_user';
  organizationId?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isActive: boolean;
  roles?: string[];
  permissions?: string[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  size?: string;
  address?: Address;
  logo?: string;
  subscriptionTier: 'free' | 'starter' | 'professional' | 'enterprise';
  subscriptionStatus: 'trial' | 'active' | 'past_due' | 'canceled' | 'suspended';
  billingCycle?: 'monthly' | 'annual';
  billingEmail?: string;
  maxUsers: number;
  maxStorage: number;
  currentUserCount: number;
  currentStorageUsage: number;
  features?: string[];
  customSettings?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Subscription {
  id: string;
  organizationId: string;
  planId: string;
  planName: string;
  tier: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'trial' | 'active' | 'past_due' | 'canceled' | 'suspended';
  billingCycle: 'monthly' | 'annual';
  amount: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BillingTransaction {
  id: string;
  organizationId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  type: 'subscription' | 'upgrade' | 'downgrade' | 'addon' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  paymentMethod?: string;
  failureReason?: string;
  transactionDate: string;
  createdAt: string;
}

export interface UsageMetric {
  id: string;
  organizationId: string;
  metricType: 'api_calls' | 'storage' | 'users' | 'documents' | 'webhooks';
  value: number;
  unit: string;
  period: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

export interface Webhook {
  id: string;
  organizationId: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  headers?: Record<string, string>;
  retryPolicy?: {
    maxRetries: number;
    retryDelay: number;
  };
  lastTriggeredAt?: string;
  failureCount: number;
  successCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventType: string;
  payload: Record<string, any>;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  responseCode?: number;
  responseBody?: string;
  errorMessage?: string;
  attemptCount: number;
  nextRetryAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  organizationId: string;
  name: string;
  key: string;
  prefix: string;
  permissions: string[];
  expiresAt?: string;
  lastUsedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  organization: Organization | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  updateOrganization: (org: Organization) => void;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalApiCalls: number;
  storageUsed: number;
  webhooksActive: number;
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: 'user_created' | 'user_updated' | 'webhook_triggered' | 'api_call' | 'subscription_changed';
  description: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
