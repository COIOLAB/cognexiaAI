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

  const { data: config } = useBillingConfig(organizationId);
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
