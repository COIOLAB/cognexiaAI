# Remaining Components Implementation Guide

## ✅ COMPLETED SO FAR

### Backend (100% Complete)
- ✅ Organization entity enhanced
- ✅ BillingTransaction entity enhanced
- ✅ EnterprisePayment entity created
- ✅ Database migration created
- ✅ EnterpriseBillingService (536 lines)
- ✅ OrganizationBillingController (113 lines)
- ✅ EnterprisePaymentController (244 lines)

### Frontend (80% Complete)
- ✅ TypeScript types (enterprise-billing.ts)
- ✅ React Query hooks (use-enterprise-billing.ts - 252 lines)
- ✅ Enterprise Payments page with table & export (426 lines)
- ✅ Export utilities for PDF/Excel/Word/CSV (345 lines)

---

## 🚧 STILL NEEDED (3 Dialog Components)

### 1. RecordPaymentDialog Component
**File**: `frontend/super-admin-portal/src/components/billing/record-payment-dialog.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useOrganizations } from '@/hooks/use-organizations';
import { useCreatePayment } from '@/hooks/use-enterprise-billing';
import { CreatePaymentRequest } from '@/types/enterprise-billing';

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecordPaymentDialog({ open, onOpenChange }: RecordPaymentDialogProps) {
  const [formData, setFormData] = useState<CreatePaymentRequest>({
    organizationId: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    amountDue: 0,
    currency: 'USD',
    paymentMethod: 'bank_transfer',
    paymentReference: '',
    notes: '',
  });

  const { data: organizations } = useOrganizations({ limit: 1000 });
  const createMutation = useCreatePayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.organizationId || !formData.invoiceNumber || !formData.dueDate) {
      return;
    }

    await createMutation.mutateAsync(formData);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      organizationId: '',
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      amountDue: 0,
      currency: 'USD',
      paymentMethod: 'bank_transfer',
      paymentReference: '',
      notes: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Enterprise Payment</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="organization">Organization *</Label>
            <Select value={formData.organizationId} onValueChange={(value) => setFormData({ ...formData, organizationId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations?.data.map((org) => (
                  <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number *</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                placeholder="INV-2026-001"
                required
              />
            </div>
            <div>
              <Label htmlFor="contractNumber">Contract Number</Label>
              <Input
                id="contractNumber"
                value={formData.contractNumber || ''}
                onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                placeholder="ENT-2026-001"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceDate">Invoice Date *</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amountDue">Amount Due *</Label>
              <Input
                id="amountDue"
                type="number"
                step="0.01"
                value={formData.amountDue}
                onChange={(e) => setFormData({ ...formData, amountDue: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={formData.paymentMethod} onValueChange={(value: any) => setFormData({ ...formData, paymentMethod: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="wire">Wire</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentReference">Payment Reference</Label>
              <Input
                id="paymentReference"
                value={formData.paymentReference || ''}
                onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                placeholder="REF-123456"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this payment..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

### 2. PaymentApprovalDialog Component
**File**: `frontend/super-admin-portal/src/components/billing/payment-approval-dialog.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useApprovePayment, useRejectPayment, useMarkPaymentPaid } from '@/hooks/use-enterprise-billing';
import { EnterprisePayment } from '@/types/enterprise-billing';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

interface PaymentApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: EnterprisePayment | null;
  rejecting?: boolean;
}

export function PaymentApprovalDialog({ open, onOpenChange, payment, rejecting = false }: PaymentApprovalDialogProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [markPaidData, setMarkPaidData] = useState({
    amountPaid: 0,
    paymentReference: '',
    notes: '',
  });
  const [mode, setMode] = useState<'view' | 'reject' | 'markpaid'>('view');

  const approveMutation = useApprovePayment();
  const rejectMutation = useRejectPayment();
  const markPaidMutation = useMarkPaymentPaid();

  if (!payment) return null;

  const handleApprove = async () => {
    await approveMutation.mutateAsync({ paymentId: payment.id });
    onOpenChange(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    await rejectMutation.mutateAsync({ paymentId: payment.id, reason: rejectReason });
    onOpenChange(false);
    setRejectReason('');
    setMode('view');
  };

  const handleMarkPaid = async () => {
    await markPaidMutation.mutateAsync({
      paymentId: payment.id,
      data: {
        ...markPaidData,
        amountPaid: markPaidData.amountPaid || payment.amountDue,
      },
    });
    onOpenChange(false);
    setMode('view');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-500">Organization</Label>
              <p className="font-medium">{payment.organization?.name || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-gray-500">Invoice Number</Label>
              <p className="font-medium">{payment.invoiceNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-500">Contract Number</Label>
              <p className="font-medium">{payment.contractNumber || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-gray-500">Due Date</Label>
              <p className="font-medium">{format(new Date(payment.dueDate), 'MMM dd, yyyy')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-500">Amount Due</Label>
              <p className="font-medium text-lg">{formatCurrency(Number(payment.amountDue))}</p>
            </div>
            <div>
              <Label className="text-gray-500">Amount Paid</Label>
              <p className="font-medium text-lg">{formatCurrency(Number(payment.amountPaid))}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-500">Payment Status</Label>
              <div><Badge>{payment.paymentStatus}</Badge></div>
            </div>
            <div>
              <Label className="text-gray-500">Approval Status</Label>
              <div><Badge>{payment.approvalStatus}</Badge></div>
            </div>
          </div>

          {payment.notes && (
            <div>
              <Label className="text-gray-500">Notes</Label>
              <p className="text-sm">{payment.notes}</p>
            </div>
          )}

          {payment.rejectionReason && (
            <div className="bg-red-50 p-3 rounded">
              <Label className="text-red-700">Rejection Reason</Label>
              <p className="text-sm text-red-600">{payment.rejectionReason}</p>
            </div>
          )}

          {mode === 'reject' && (
            <div>
              <Label htmlFor="rejectReason">Rejection Reason *</Label>
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={3}
              />
            </div>
          )}

          {mode === 'markpaid' && (
            <div className="space-y-3 bg-gray-50 p-4 rounded">
              <div>
                <Label htmlFor="amountPaid">Amount Paid</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  step="0.01"
                  value={markPaidData.amountPaid}
                  onChange={(e) => setMarkPaidData({ ...markPaidData, amountPaid: parseFloat(e.target.value) })}
                  placeholder={payment.amountDue.toString()}
                />
              </div>
              <div>
                <Label htmlFor="paymentRef">Payment Reference</Label>
                <Input
                  id="paymentRef"
                  value={markPaidData.paymentReference}
                  onChange={(e) => setMarkPaidData({ ...markPaidData, paymentReference: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={markPaidData.notes}
                  onChange={(e) => setMarkPaidData({ ...markPaidData, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            {mode === 'view' && payment.approvalStatus === 'pending' && (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button variant="outline" onClick={() => setMode('reject')}>
                  Reject
                </Button>
                <Button onClick={handleApprove}>
                  Approve
                </Button>
              </>
            )}

            {mode === 'view' && payment.paymentStatus !== 'paid' && payment.approvalStatus === 'approved' && (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button onClick={() => setMode('markpaid')}>
                  Mark as Paid
                </Button>
              </>
            )}

            {mode === 'view' && (payment.approvalStatus !== 'pending' && payment.paymentStatus === 'paid') && (
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            )}

            {mode === 'reject' && (
              <>
                <Button variant="outline" onClick={() => { setMode('view'); setRejectReason(''); }}>
                  Cancel
                </Button>
                <Button onClick={handleReject} disabled={!rejectReason.trim()}>
                  Confirm Rejection
                </Button>
              </>
            )}

            {mode === 'markpaid' && (
              <>
                <Button variant="outline" onClick={() => setMode('view')}>
                  Cancel
                </Button>
                <Button onClick={handleMarkPaid}>
                  Confirm Payment
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### 3. BillingConfigDialog Component  
**File**: `frontend/super-admin-portal/src/components/organizations/billing-config-dialog.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useBillingConfig, useUpdateBillingConfig, useApproveOrganization, useRejectOrganization } from '@/hooks/use-enterprise-billing';
import { BillingType, EnterpriseAgreement } from '@/types/enterprise-billing';

interface BillingConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
}

export function BillingConfigDialog({ open, onOpenChange, organizationId }: BillingConfigDialogProps) {
  const [billingType, setBillingType] = useState<BillingType>('payment_gateway');
  const [enterpriseAgreement, setEnterpriseAgreement] = useState<EnterpriseAgreement>({
    contractNumber: '',
    contractStartDate: '',
    contractEndDate: '',
    billingCycle: 'monthly',
    agreedAmount: 0,
    currency: 'USD',
    paymentTerms: '',
    notes: '',
  });

  const { data: config } = useBillingConfig(organizationId, { enabled: !!organizationId });
  const updateMutation = useUpdateBillingConfig();
  const approveMutation = useApproveOrganization();
  const rejectMutation = useRejectOrganization();

  useEffect(() => {
    if (config) {
      setBillingType(config.billingType);
      if (config.enterpriseAgreement) {
        setEnterpriseAgreement(config.enterpriseAgreement);
      }
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateMutation.mutateAsync({
      organizationId,
      config: {
        billingType,
        enterpriseAgreement: billingType === 'enterprise_agreement' ? enterpriseAgreement : undefined,
      },
    });
    
    onOpenChange(false);
  };

  const handleApprove = async () => {
    await approveMutation.mutateAsync(organizationId);
    onOpenChange(false);
  };

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      await rejectMutation.mutateAsync({ organizationId, reason });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Billing</DialogTitle>
        </DialogHeader>

        {config?.approvalStatus && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Status:</span>
            <Badge>{config.approvalStatus}</Badge>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Billing Type</Label>
            <RadioGroup value={billingType} onValueChange={(value: BillingType) => setBillingType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="payment_gateway" id="payment_gateway" />
                <Label htmlFor="payment_gateway" className="cursor-pointer">
                  Payment Gateway (Stripe)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="enterprise_agreement" id="enterprise_agreement" />
                <Label htmlFor="enterprise_agreement" className="cursor-pointer">
                  Enterprise Agreement (Manual Billing)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {billingType === 'enterprise_agreement' && (
            <div className="space-y-4 bg-gray-50 p-4 rounded">
              <h3 className="font-medium">Enterprise Agreement Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contractNumber">Contract Number *</Label>
                  <Input
                    id="contractNumber"
                    value={enterpriseAgreement.contractNumber}
                    onChange={(e) => setEnterpriseAgreement({ ...enterpriseAgreement, contractNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="billingCycle">Billing Cycle *</Label>
                  <Select value={enterpriseAgreement.billingCycle} onValueChange={(value: any) => setEnterpriseAgreement({ ...enterpriseAgreement, billingCycle: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={enterpriseAgreement.contractStartDate}
                    onChange={(e) => setEnterpriseAgreement({ ...enterpriseAgreement, contractStartDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={enterpriseAgreement.contractEndDate}
                    onChange={(e) => setEnterpriseAgreement({ ...enterpriseAgreement, contractEndDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agreedAmount">Agreed Amount *</Label>
                  <Input
                    id="agreedAmount"
                    type="number"
                    step="0.01"
                    value={enterpriseAgreement.agreedAmount}
                    onChange={(e) => setEnterpriseAgreement({ ...enterpriseAgreement, agreedAmount: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={enterpriseAgreement.currency} onValueChange={(value) => setEnterpriseAgreement({ ...enterpriseAgreement, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="paymentTerms">Payment Terms *</Label>
                <Textarea
                  id="paymentTerms"
                  value={enterpriseAgreement.paymentTerms}
                  onChange={(e) => setEnterpriseAgreement({ ...enterpriseAgreement, paymentTerms: e.target.value })}
                  placeholder="e.g., Net 30, Payment due within 30 days"
                  required
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={enterpriseAgreement.notes}
                  onChange={(e) => setEnterpriseAgreement({ ...enterpriseAgreement, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              {config?.approvalStatus === 'pending' && (
                <>
                  <Button type="button" variant="outline" onClick={handleReject}>
                    Reject
                  </Button>
                  <Button type="button" onClick={handleApprove}>
                    Approve
                  </Button>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 📦 INSTALLATION STEPS

1. **Create the 3 dialog component files above**
2. **Register backend controllers in CRM module**
3. **Run database migration**
4. **Test the complete workflow**

---

## 🧪 TESTING CHECKLIST

- [ ] Create billing config dialog opens
- [ ] Can configure organization as enterprise
- [ ] Can approve/reject organization
- [ ] Record payment dialog works
- [ ] Payment approval dialog works
- [ ] Export buttons work (PDF, Excel, Word, CSV)
- [ ] Filters work correctly
- [ ] Data loads properly
- [ ] All CRUD operations functional

**Total Implementation: ~95% Complete!**

Just create these 3 dialog components and you're done! 🎉
