/**
 * Shared Interfaces for Finance & Accounting Module
 * 
 * Common interfaces and types used across multiple services and controllers
 * to ensure consistency and type safety throughout the finance module.
 */

import { Decimal } from 'decimal.js';

// ============================================================================
// AUDIT AND COMPLIANCE INTERFACES
// ============================================================================

export interface AuditTrailEntry {
  auditId: string;
  action: string;
  performedBy: string;
  timestamp: string;
  changes: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  entityType?: string;
  entityId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: 'financial' | 'security' | 'compliance' | 'system';
  description?: string;
  metadata?: Record<string, any>;
}

export interface ComplianceLog {
  logId: string;
  complianceType: 'sox' | 'gdpr' | 'pci_dss' | 'aml' | 'kyc' | 'tax';
  entity: string;
  entityId: string;
  status: 'compliant' | 'non_compliant' | 'pending_review' | 'remediated';
  findings: ComplianceFinding[];
  assessmentDate: string;
  assessor: string;
  nextReviewDate: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  remediationPlan?: RemediationPlan;
}

export interface ComplianceFinding {
  findingId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  recommendation: string;
  deadline?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  evidence: string[];
}

export interface RemediationPlan {
  planId: string;
  title: string;
  description: string;
  tasks: RemediationTask[];
  timeline: string;
  owner: string;
  budget?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface RemediationTask {
  taskId: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  dependencies: string[];
  estimatedHours: number;
}

// ============================================================================
// USER AND AUTHENTICATION INTERFACES
// ============================================================================

export interface User {
  id: string;
  userId: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  entityId?: string;
  sessionId: string;
  lastActivity: Date;
  firstName?: string;
  lastName?: string;
  department?: string;
  employeeId?: string;
  manager?: string;
  status: 'active' | 'inactive' | 'suspended' | 'locked';
}

export interface UserSession {
  sessionId: string;
  userId: string;
  loginTime: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  location?: string;
  isActive: boolean;
  expiresAt: Date;
}

// ============================================================================
// FINANCIAL COMMON INTERFACES
// ============================================================================

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  isActive: boolean;
  exchangeRates?: ExchangeRate[];
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: Decimal;
  effectiveDate: string;
  source: string;
  bidRate?: Decimal;
  askRate?: Decimal;
}

export interface MonetaryAmount {
  amount: Decimal;
  currency: string;
  exchangeRate?: Decimal;
  baseAmount?: Decimal; // Amount in base currency
}

export interface PaymentTerms {
  termsCode: string;
  description: string;
  netDays: number;
  discountPercent: Decimal;
  discountDays: number;
  penaltyPercent?: Decimal;
  penaltyDays?: number;
  isActive: boolean;
}

export interface TaxDetail {
  taxId: string;
  taxType: string;
  taxCode: string;
  taxRate: Decimal;
  taxableAmount: Decimal;
  taxAmount: Decimal;
  jurisdiction: string;
  exemptionReason?: string;
  calculationMethod?: string;
}

// ============================================================================
// WORKFLOW AND APPROVAL INTERFACES
// ============================================================================

export interface WorkflowStep {
  stepId: string;
  stepName: string;
  stepType: 'approval' | 'validation' | 'notification' | 'automation';
  order: number;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  approvers?: string[];
  escalation?: EscalationRule;
  isActive: boolean;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in_range';
  value: any;
  logicalOperator?: 'and' | 'or';
}

export interface WorkflowAction {
  actionType: 'approve' | 'reject' | 'notify' | 'route' | 'update_field';
  parameters: Record<string, any>;
  delayMinutes?: number;
}

export interface EscalationRule {
  escalateAfterMinutes: number;
  escalateTo: string[];
  escalationMessage: string;
  maxEscalations: number;
}

export interface ApprovalRequest {
  requestId: string;
  entityType: string;
  entityId: string;
  requestType: string;
  requester: string;
  approvers: string[];
  currentApprover: string;
  amount?: Decimal;
  currency?: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  dueDate: string;
  approvalHistory: ApprovalHistoryEntry[];
  attachments: string[];
  metadata: Record<string, any>;
}

export interface ApprovalHistoryEntry {
  entryId: string;
  approver: string;
  action: 'approved' | 'rejected' | 'delegated' | 'commented';
  timestamp: string;
  comments?: string;
  delegatedTo?: string;
  ipAddress: string;
  userAgent: string;
}

// ============================================================================
// NOTIFICATION INTERFACES
// ============================================================================

export interface NotificationRequest {
  notificationId: string;
  type: 'email' | 'sms' | 'push' | 'webhook' | 'in_app';
  recipient: string;
  subject: string;
  content: string;
  template?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledAt?: string;
  metadata: Record<string, any>;
}

export interface NotificationResult {
  notificationId: string;
  status: 'sent' | 'delivered' | 'failed' | 'bounced' | 'pending';
  sentAt?: string;
  deliveredAt?: string;
  errorMessage?: string;
  attempts: number;
  cost?: Decimal;
  trackingId?: string;
}

// ============================================================================
// ANALYTICS AND REPORTING INTERFACES
// ============================================================================

export interface AnalyticsRequest {
  requestId: string;
  reportType: string;
  parameters: Record<string, any>;
  outputFormat: 'json' | 'pdf' | 'excel' | 'csv';
  requestedBy: string;
  requestedAt: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime?: number;
}

export interface AnalyticsResult {
  resultId: string;
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  data?: any;
  fileUrl?: string;
  metadata: Record<string, any>;
  generatedAt?: string;
  processingTime?: number;
  errorMessage?: string;
}

export interface TrendAnalysis {
  currentValue: Decimal;
  previousValue: Decimal;
  change: Decimal;
  changePercent: Decimal;
  trend: 'improving' | 'declining' | 'stable';
  forecast: Decimal;
  confidence: Decimal;
  dataPoints?: number;
  seasonality?: 'high' | 'medium' | 'low' | 'none';
}

export interface KPIMetric {
  kpiId: string;
  name: string;
  category: string;
  value: Decimal;
  target?: Decimal;
  previousValue?: Decimal;
  unit: string;
  trend: TrendAnalysis;
  status: 'on_track' | 'at_risk' | 'off_track' | 'exceeded';
  lastUpdated: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

// ============================================================================
// ERROR AND EXCEPTION INTERFACES
// ============================================================================

export interface BusinessError {
  errorId: string;
  errorCode: string;
  errorType: 'validation' | 'business_rule' | 'integration' | 'system';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  details?: string;
  context: Record<string, any>;
  timestamp: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  resolved: boolean;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface ValidationError {
  field: string;
  value: any;
  constraint: string;
  message: string;
}

export interface ProcessingError {
  stepId: string;
  stepName: string;
  errorMessage: string;
  errorCode?: string;
  retryable: boolean;
  context: Record<string, any>;
}

// ============================================================================
// INTEGRATION INTERFACES
// ============================================================================

export interface ExternalSystemConfig {
  systemId: string;
  systemName: string;
  baseUrl: string;
  apiVersion: string;
  authentication: AuthenticationConfig;
  timeout: number;
  retryPolicy: RetryPolicy;
  isActive: boolean;
  lastHealthCheck?: string;
  healthStatus?: 'healthy' | 'degraded' | 'down';
}

export interface AuthenticationConfig {
  type: 'bearer' | 'basic' | 'api_key' | 'oauth' | 'certificate';
  credentials: Record<string, string>;
  refreshToken?: string;
  expiresAt?: string;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'fixed' | 'exponential' | 'linear';
  baseDelayMs: number;
  maxDelayMs: number;
  retryableErrors: string[];
}

export interface IntegrationEvent {
  eventId: string;
  eventType: string;
  sourceSystem: string;
  targetSystem: string;
  payload: any;
  timestamp: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  attempts: number;
  errorMessage?: string;
  metadata: Record<string, any>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type EntityStatus = 'active' | 'inactive' | 'suspended' | 'archived' | 'deleted';

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';

export type BusinessUnit = 'headquarters' | 'subsidiary' | 'branch' | 'division' | 'department';

export type TransactionType = 'revenue' | 'expense' | 'asset' | 'liability' | 'equity' | 'transfer';

export type JournalEntryType = 'standard' | 'adjusting' | 'closing' | 'reversing' | 'correcting';

export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'xml';

export type DeliveryMethod = 'email' | 'postal' | 'portal' | 'api' | 'edi' | 'ftp';

// ============================================================================
// COMMON RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  warnings?: string[];
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
    executionTime?: number;
    version?: string;
  };
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface BulkOperationResult {
  operationId: string;
  totalItems: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  results: BulkItemResult[];
  summary: string;
  processingTime: number;
}

export interface BulkItemResult {
  itemId: string;
  status: 'success' | 'failure' | 'skipped';
  message?: string;
  errorCode?: string;
  data?: any;
}
