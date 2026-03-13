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
