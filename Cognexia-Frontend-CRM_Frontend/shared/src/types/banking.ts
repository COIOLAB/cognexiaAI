// Banking Industry 5.0 Types

import { BaseEntity } from './core';

export enum AccountType {
  SAVINGS = 'SAVINGS',
  CHECKING = 'CHECKING',
  CREDIT = 'CREDIT',
  LOAN = 'LOAN',
  INVESTMENT = 'INVESTMENT',
  BUSINESS = 'BUSINESS',
  TREASURY = 'TREASURY'
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER',
  PAYMENT = 'PAYMENT',
  INTEREST = 'INTEREST',
  FEE = 'FEE',
  ADJUSTMENT = 'ADJUSTMENT',
  LOAN_DISBURSEMENT = 'LOAN_DISBURSEMENT',
  LOAN_REPAYMENT = 'LOAN_REPAYMENT'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REVERSED = 'REVERSED',
  ON_HOLD = 'ON_HOLD'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH'
}

export enum LoanStatus {
  APPLIED = 'APPLIED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DISBURSED = 'DISBURSED',
  ACTIVE = 'ACTIVE',
  OVERDUE = 'OVERDUE',
  DEFAULTED = 'DEFAULTED',
  CLOSED = 'CLOSED'
}

export enum KYCStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export interface Customer extends BaseEntity {
  customerNumber: string;
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  kycStatus: KYCStatus;
  riskProfile: RiskProfile;
  accounts: Account[];
  creditScore: number;
  lastActivity: Date;
  relationshipManager?: string;
  preferredLanguage: string;
  communicationPreferences: CommunicationPreference[];
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  nationality: string;
  socialSecurityNumber?: string;
  taxId?: string;
  occupation: string;
  employer?: string;
  annualIncome: number;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
}

export interface ContactInfo {
  primaryPhone: string;
  secondaryPhone?: string;
  email: string;
  alternateEmail?: string;
  address: Address;
  mailingAddress?: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CommunicationPreference {
  channel: 'email' | 'sms' | 'phone' | 'mail' | 'mobile_app';
  purpose: 'marketing' | 'alerts' | 'statements' | 'support';
  enabled: boolean;
}

export interface Account extends BaseEntity {
  accountNumber: string;
  accountType: AccountType;
  customerId: string;
  balance: number;
  availableBalance: number;
  currency: string;
  status: 'active' | 'inactive' | 'frozen' | 'closed';
  openDate: Date;
  closeDate?: Date;
  interestRate: number;
  fees: AccountFee[];
  limits: AccountLimit[];
  statements: Statement[];
  branchId: string;
  relationshipManager?: string;
}

export interface AccountFee {
  type: 'monthly' | 'annual' | 'transaction' | 'maintenance' | 'overdraft';
  amount: number;
  currency: string;
  frequency: string;
  lastCharged?: Date;
  nextDue?: Date;
}

export interface AccountLimit {
  type: 'daily_withdrawal' | 'daily_transfer' | 'credit_limit' | 'overdraft_limit';
  amount: number;
  currency: string;
  effectiveDate: Date;
  expiryDate?: Date;
}

export interface Transaction extends BaseEntity {
  transactionId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  status: TransactionStatus;
  timestamp: Date;
  valueDate: Date;
  reference: string;
  counterparty?: Counterparty;
  fees: TransactionFee[];
  exchangeRate?: number;
  channel: 'branch' | 'atm' | 'online' | 'mobile' | 'phone' | 'automatic';
  location?: string;
  deviceInfo?: DeviceInfo;
  riskScore: number;
  flagged: boolean;
  flags: TransactionFlag[];
}

export interface Counterparty {
  name: string;
  accountNumber?: string;
  bankCode?: string;
  routingNumber?: string;
  address?: Address;
}

export interface TransactionFee {
  type: string;
  amount: number;
  currency: string;
  description: string;
}

export interface DeviceInfo {
  deviceId: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'atm';
  operatingSystem: string;
  ipAddress: string;
  location?: GeoLocation;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

export interface TransactionFlag {
  type: 'suspicious' | 'high_risk' | 'unusual_pattern' | 'compliance' | 'fraud';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdBy: 'system' | 'analyst';
  reviewed: boolean;
  reviewedBy?: string;
  reviewDate?: Date;
  action?: 'approved' | 'blocked' | 'investigated';
}

export interface Loan extends BaseEntity {
  loanNumber: string;
  customerId: string;
  type: 'personal' | 'home' | 'auto' | 'business' | 'education';
  amount: number;
  currency: string;
  interestRate: number;
  term: number; // in months
  status: LoanStatus;
  applicationDate: Date;
  approvalDate?: Date;
  disbursementDate?: Date;
  maturityDate?: Date;
  outstandingBalance: number;
  nextPaymentDate?: Date;
  nextPaymentAmount?: number;
  paymentSchedule: PaymentSchedule[];
  collateral?: Collateral[];
  guarantors?: Guarantor[];
  documents: LoanDocument[];
}

export interface PaymentSchedule {
  installmentNumber: number;
  dueDate: Date;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  paidDate?: Date;
  paidAmount?: number;
  status: 'pending' | 'paid' | 'partial' | 'overdue';
}

export interface Collateral {
  type: 'property' | 'vehicle' | 'deposit' | 'securities';
  description: string;
  valuationAmount: number;
  currency: string;
  valuationDate: Date;
  documents: string[];
}

export interface Guarantor {
  customerId?: string;
  name: string;
  relationship: string;
  contactInfo: ContactInfo;
  guaranteeAmount: number;
  currency: string;
}

export interface LoanDocument {
  type: string;
  name: string;
  documentPath: string;
  uploadDate: Date;
  verified: boolean;
  verifiedBy?: string;
  verificationDate?: Date;
}

export interface RiskProfile extends BaseEntity {
  customerId: string;
  riskLevel: RiskLevel;
  score: number;
  factors: RiskFactor[];
  lastAssessment: Date;
  nextReview: Date;
  assessedBy: string;
  amlStatus: 'clear' | 'watchlist' | 'blocked';
  sanctionStatus: 'clear' | 'match' | 'potential_match';
  pepStatus: 'no' | 'yes' | 'related';
}

export interface RiskFactor {
  factor: string;
  score: number;
  weight: number;
  description: string;
}

export interface Statement extends BaseEntity {
  accountId: string;
  statementNumber: string;
  periodStart: Date;
  periodEnd: Date;
  openingBalance: number;
  closingBalance: number;
  currency: string;
  transactions: Transaction[];
  fees: TransactionFee[];
  interest: number;
  generatedDate: Date;
  deliveryMethod: 'email' | 'mail' | 'online';
  delivered: boolean;
  deliveryDate?: Date;
}

export interface CreditCard extends BaseEntity {
  cardNumber: string;
  customerId: string;
  accountId: string;
  cardType: 'debit' | 'credit' | 'prepaid';
  brand: 'visa' | 'mastercard' | 'amex' | 'discover';
  status: 'active' | 'inactive' | 'blocked' | 'expired' | 'cancelled';
  issuedDate: Date;
  expiryDate: Date;
  cvv: string;
  creditLimit?: number;
  availableCredit?: number;
  billingCycle: number;
  rewards: RewardProgram;
  securitySettings: CardSecuritySettings;
}

export interface RewardProgram {
  programName: string;
  pointsBalance: number;
  cashbackRate: number;
  redemptionOptions: string[];
}

export interface CardSecuritySettings {
  pinSet: boolean;
  contactlessEnabled: boolean;
  onlineTransactionsEnabled: boolean;
  foreignTransactionsEnabled: boolean;
  atmWithdrawalsEnabled: boolean;
  spendingLimits: SpendingLimit[];
  alerts: CardAlert[];
}

export interface SpendingLimit {
  type: 'daily' | 'weekly' | 'monthly';
  amount: number;
  currency: string;
}

export interface CardAlert {
  type: 'transaction' | 'balance' | 'payment_due' | 'suspicious_activity';
  threshold?: number;
  enabled: boolean;
  channels: string[];
}

export interface Branch extends BaseEntity {
  branchCode: string;
  name: string;
  type: 'full_service' | 'limited_service' | 'atm_only';
  address: Address;
  contactInfo: ContactInfo;
  operatingHours: OperatingHours[];
  services: BranchService[];
  employees: Employee[];
  atms: ATM[];
  capacity: number;
  currentOccupancy: number;
}

export interface OperatingHours {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface BranchService {
  serviceName: string;
  available: boolean;
  waitTime: number;
  appointmentRequired: boolean;
}

export interface Employee extends BaseEntity {
  employeeId: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  branchId?: string;
  email: string;
  phone: string;
  hireDate: Date;
  isActive: boolean;
  permissions: string[];
  lastLogin?: Date;
}

export interface ATM extends BaseEntity {
  atmId: string;
  branchId?: string;
  location: Address;
  type: 'cash_only' | 'full_service';
  status: 'operational' | 'out_of_order' | 'maintenance';
  cashAvailable: boolean;
  services: ATMService[];
  lastMaintenance?: Date;
  nextMaintenance?: Date;
}

export interface ATMService {
  serviceName: string;
  available: boolean;
  fee: number;
}

// Compliance and Regulatory Types
export interface ComplianceReport extends BaseEntity {
  reportType: 'sar' | 'ctr' | 'kyc' | 'aml' | 'ofac';
  customerId?: string;
  transactionId?: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved';
  filingDate?: Date;
  reviewer?: string;
  regulatoryBody: string;
  content: any;
  attachments: string[];
}

export interface AMLAlert extends BaseEntity {
  alertId: string;
  customerId?: string;
  transactionId?: string;
  type: 'suspicious_activity' | 'pattern_matching' | 'threshold_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'open' | 'investigating' | 'closed' | 'escalated';
  assignedTo?: string;
  investigation: Investigation[];
  resolution?: string;
  closedDate?: Date;
}

export interface Investigation {
  investigatorId: string;
  timestamp: Date;
  action: string;
  notes: string;
  findings?: string;
}

// Analytics and Reporting
export interface CustomerSegment {
  segmentName: string;
  criteria: SegmentCriteria[];
  customers: string[];
  totalValue: number;
  averageBalance: number;
  profitability: number;
}

export interface SegmentCriteria {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'in';
  value: any;
}

export interface BankingKPI {
  name: string;
  value: number;
  target: number;
  unit: string;
  period: string;
  trend: 'up' | 'down' | 'stable';
  category: 'financial' | 'operational' | 'risk' | 'customer';
}

export interface PortfolioAnalysis {
  portfolioId: string;
  totalValue: number;
  currency: string;
  riskRating: RiskLevel;
  performanceMetrics: PerformanceMetric[];
  assetAllocation: AssetAllocation[];
  benchmarkComparison: BenchmarkComparison;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  period: string;
  benchmark?: number;
}

export interface AssetAllocation {
  assetClass: string;
  percentage: number;
  value: number;
  targetPercentage: number;
}

export interface BenchmarkComparison {
  benchmarkName: string;
  portfolioReturn: number;
  benchmarkReturn: number;
  outperformance: number;
  trackingError: number;
}
