/**
 * TypeScript Types
 * Matching backend entities and DTOs from backend/modules/03-CRM
 */

// ============================================
// Core Entity Types
// ============================================

export enum UserType {
  SUPER_ADMIN = 'super_admin',
  ORG_ADMIN = 'org_admin',
  ORG_USER = 'org_user',
}

export enum OrganizationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  TRIAL = 'trial',
}

export enum BillingInterval {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

// ============================================
// User
// ============================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  organizationId?: string;
  organizationName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  roles: string[];
  permissions?: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType?: UserType;
  organizationId?: string;
  phoneNumber?: string;
  roles?: string[];
}

// ============================================
// Organization
// ============================================

export interface Organization {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  logoUrl?: string;
  status: OrganizationStatus;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlanId?: string;
  subscriptionPlan?: SubscriptionPlan;
  isActive: boolean;
  trialEndsAt?: string | Date;
  maxUsers: number;
  currentUserCount: number;
  monthlyRevenue: number;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  accountId?: string;
  country?: string;
  industry?: string;
  accountType?: string;
  accountOwner?: string;
  accountStatus?: string;
  createdDate?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  nextBillingDate?: string | Date;
  settings?: Record<string, any>;
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateOrganizationRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  subscriptionPlanId?: string;
  trialDays?: number;
  accountId?: string;
  country?: string;
  industry?: string;
  accountType?: string;
  accountOwner?: string;
  accountStatus?: string;
  createdDate?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  logoUrl?: string;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  accountId?: string;
  country?: string;
  industry?: string;
  accountType?: string;
  accountOwner?: string;
  accountStatus?: string;
  createdDate?: string;
  settings?: Record<string, any>;
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
  };
}

// ============================================
// Subscription Plan
// ============================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingInterval: BillingInterval;
  includedUsers: number;
  trialDays: number;
  features: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateSubscriptionPlanRequest {
  name: string;
  price: number;
  billingInterval: BillingInterval;
  includedUsers: number;
  trialDays: number;
  features: string[];
}

// ============================================
// Billing Transaction
// ============================================

export interface BillingTransaction {
  id: string;
  organizationId: string;
  organization?: Organization;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description?: string;
  invoiceUrl?: string;
  stripePaymentIntentId?: string;
  metadata?: Record<string, any>;
  paidAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateBillingTransactionRequest {
  organizationId: string;
  amount: number;
  currency?: string;
  description?: string;
}

// ============================================
// Usage Metrics
// ============================================

export interface UsageMetric {
  id: string;
  organizationId: string;
  metricType: string;
  value: number;
  unit: string;
  timestamp: string | Date;
  metadata?: Record<string, any>;
}

export interface UsageStats {
  apiCalls: number;
  storageUsed: number;
  emailsSent: number;
  activeUsers: number;
  quotaLimits: {
    apiCalls: number;
    storage: number;
    emails: number;
    users: number;
  };
}

// ============================================
// Dashboard Metrics
// ============================================

export interface PlatformMetrics {
  totalOrganizations: number;
  activeOrganizations: number;
  trialOrganizations: number;
  suspendedOrganizations: number;
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  averageRevenuePerUser: number;
  revenueThisMonth: number;
  growthRate: number;
  churnRate: number;
}

export interface OrganizationMetrics {
  totalUsers: number;
  activeUsers: number;
  apiCallsToday: number;
  storageUsed: number;
  subscriptionStatus: string;
  daysUntilRenewal: number;
  currentBillAmount: number;
}

// ============================================
// Webhook
// ============================================

export interface Webhook {
  id: string;
  organizationId: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  lastTriggeredAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateWebhookRequest {
  url: string;
  events: string[];
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  payload: Record<string, any>;
  responseStatus?: number;
  responseBody?: string;
  success: boolean;
  createdAt: string | Date;
}

// ============================================
// Audit Log
// ============================================

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import',
  SUSPEND = 'suspend',
  ACTIVATE = 'activate',
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  user?: User;
  action: AuditAction;
  entityType: string;
  entityId: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string | Date;
}

// ============================================
// Filter and Query Types
// ============================================

export interface OrganizationFilters {
  status?: OrganizationStatus;
  subscriptionStatus?: SubscriptionStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UserFilters {
  userType?: UserType;
  organizationId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BillingFilters {
  organizationId?: string;
  status?: PaymentStatus;
  startDate?: string | Date;
  endDate?: string | Date;
  page?: number;
  limit?: number;
}

export interface UsageFilters {
  organizationId?: string;
  metricType?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  page?: number;
  limit?: number;
}

// ============================================
// Response Types
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: any;
}

// ============================================
// Onboarding
// ============================================

export enum OnboardingStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum OnboardingType {
  ORGANIZATION = 'organization',
  USER = 'user',
  FEATURE = 'feature',
}

export enum OnboardingStepType {
  WELCOME = 'welcome',
  PROFILE_SETUP = 'profile_setup',
  TEAM_INVITE = 'team_invite',
  INTEGRATION_SETUP = 'integration_setup',
  FEATURE_TOUR = 'feature_tour',
  FIRST_PROJECT = 'first_project',
  COMPLETED = 'completed',
}

export interface OnboardingStep {
  id: string;
  type: OnboardingStepType;
  title: string;
  description: string;
  isCompleted: boolean;
  isSkipped: boolean;
  order: number;
  metadata?: Record<string, any>;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  order: number;
  rewardCredits?: number;
}

export interface OnboardingSession {
  id: string;
  type: OnboardingType;
  status: OnboardingStatus;
  organizationId: string;
  userId?: string;
  steps: OnboardingStep[];
  currentStepIndex: number;
  completedSteps: number;
  totalSteps: number;
  progressPercentage: number;
  checklist: ChecklistItem[];
  industry?: string;
  companySize?: string;
  primaryUseCase?: string;
  startedAt?: string | Date;
  completedAt?: string | Date;
  lastActivityAt?: string | Date;
  timeSpentMinutes: number;
  sessionCount: number;
  showTips: boolean;
  sendReminders: boolean;
  autoAdvance: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface StartOnboardingRequest {
  type: OnboardingType;
  industry?: string;
  companySize?: string;
  primaryUseCase?: string;
  interestedFeatures?: string[];
  userResponses?: Record<string, any>;
}

export interface CompleteStepRequest {
  stepType: OnboardingStepType;
  metadata?: Record<string, any>;
  timeSpentMinutes?: number;
}

export interface SkipStepRequest {
  stepType: OnboardingStepType;
  reason?: string;
}

export interface UpdateProgressRequest {
  currentStepIndex?: number;
  timeSpentMinutes?: number;
  metadata?: Record<string, any>;
}

export interface CompleteChecklistItemRequest {
  itemId: string;
  notes?: string;
}

export interface RequestHelpRequest {
  stepType?: OnboardingStepType;
  message?: string;
  contactPreference?: string;
}

export interface SubmitFeedbackRequest {
  rating: number; // 1-5
  comments?: string;
  liked?: string;
  improvement?: string;
}

export interface ClaimRewardRequest {
  rewardType: string;
  metadata?: Record<string, any>;
}
