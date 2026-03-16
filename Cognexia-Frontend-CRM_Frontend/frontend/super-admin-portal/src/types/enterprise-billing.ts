export type BillingType = 'payment_gateway' | 'enterprise_agreement';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue';

export type EnterprisePaymentMethod =
  | 'bank_transfer'
  | 'check'
  | 'wire'
  | 'cash'
  | 'other';

export interface EnterpriseAgreement {
  contractNumber: string;
  contractStartDate: string;
  contractEndDate: string;
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  agreedAmount: number;
  currency: string;
  paymentTerms: string;
  contractDocument?: string;
  notes?: string;
}

export interface BillingConfig {
  billingType: BillingType;
  enterpriseAgreement?: EnterpriseAgreement;
  requiresApproval: boolean;
  approvalStatus?: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  manualBillingEnabled: boolean;
}

export interface EnterprisePayment {
  id: string;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
    email: string;
  };
  contractNumber?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: EnterprisePaymentMethod;
  paymentReference?: string;
  paymentProofUrl?: string;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  organizationId: string;
  contractNumber?: string;
  invoiceNumber: string;
  invoiceDate: string | Date;
  dueDate: string | Date;
  amountDue: number;
  currency?: string;
  paymentMethod?: EnterprisePaymentMethod;
  paymentReference?: string;
  notes?: string;
}

export interface ApprovePaymentRequest {
  paymentProofUrl?: string;
  notes?: string;
}

export interface MarkPaidRequest {
  amountPaid: number;
  paymentProofUrl?: string;
  paymentReference?: string;
  notes?: string;
}

export interface RejectRequest {
  reason: string;
}

export interface PaymentFilters {
  organizationId?: string;
  paymentStatus?: PaymentStatus;
  approvalStatus?: ApprovalStatus;
  page?: number;
  limit?: number;
}

export interface PaymentStats {
  totalPayments: number;
  pendingApprovals: number;
  overduePayments: number;
  totalRevenue: number;
  gatewayRevenue: number;
  enterpriseRevenue: number;
}
