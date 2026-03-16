'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useEnterprisePayments,
  useApprovePayment,
  useRejectPayment,
  useDeletePayment,
} from '@/hooks/use-enterprise-billing';
import { useOrganizations } from '@/hooks/use-organizations';
import {
  EnterprisePayment,
  PaymentStatus,
  ApprovalStatus,
} from '@/types/enterprise-billing';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Plus,
  FileDown,
  MoreVertical,
  CheckCircle,
  XCircle,
  DollarSign,
  Trash2,
  Eye,
} from 'lucide-react';
import { exportEnterprisePaymentsToPDF, exportEnterprisePaymentsToExcel, exportEnterprisePaymentsToWord, exportEnterprisePaymentsToCSV } from '@/lib/enterprise-export-utils';
import { RecordPaymentDialog } from '@/components/billing/record-payment-dialog';
import { PaymentApprovalDialog } from '@/components/billing/payment-approval-dialog';
import { toast } from 'react-hot-toast';

export default function EnterprisePaymentsPage() {
  const [filters, setFilters] = useState({
    organizationId: 'all',
    paymentStatus: 'all' as PaymentStatus | 'all',
    approvalStatus: 'all' as ApprovalStatus | 'all',
    page: 1,
    limit: 50,
  });
  
  const [selectedPayment, setSelectedPayment] = useState<EnterprisePayment | null>(null);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Convert filters with 'all' to undefined for the API call
  const apiFilters = filters.organizationId !== 'all' || filters.paymentStatus !== 'all' || filters.approvalStatus !== 'all'
    ? {
        ...filters,
        organizationId: filters.organizationId !== 'all' ? filters.organizationId : undefined,
        paymentStatus: filters.paymentStatus !== 'all' ? (filters.paymentStatus as PaymentStatus) : undefined,
        approvalStatus: filters.approvalStatus !== 'all' ? (filters.approvalStatus as ApprovalStatus) : undefined,
      }
    : undefined;

  const { data: payments, isLoading } = useEnterprisePayments(apiFilters);
  const { data: organizations } = useOrganizations({ limit: 1000 });
  const approveMutation = useApprovePayment();
  const rejectMutation = useRejectPayment();
  const deleteMutation = useDeletePayment();

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalStatusColor = (status: ApprovalStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = async (payment: EnterprisePayment) => {
    setSelectedPayment(payment);
    setShowApprovalDialog(true);
    setRejecting(false);
  };

  const handleReject = async (payment: EnterprisePayment) => {
    setSelectedPayment(payment);
    setShowApprovalDialog(true);
    setRejecting(true);
  };

  const handleDelete = async (paymentId: string) => {
    if (confirm('Are you sure you want to delete this payment record?')) {
      deleteMutation.mutate(paymentId);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'word' | 'csv') => {
    if (!payments?.data || payments.data.length === 0) {
      toast.error('No payments to export');
      return;
    }

    setExporting(true);
    try {
      const orgName = filters.organizationId
        ? organizations?.data.find((o) => o.id === filters.organizationId)?.name || 'All'
        : 'All';

      switch (format) {
        case 'pdf':
          await exportEnterprisePaymentsToPDF(payments.data, orgName);
          break;
        case 'excel':
          await exportEnterprisePaymentsToExcel(payments.data, orgName);
          break;
        case 'word':
          await exportEnterprisePaymentsToWord(payments.data, orgName);
          break;
        case 'csv':
          await exportEnterprisePaymentsToCSV(payments.data, orgName);
          break;
      }
      toast.success(`Payments exported to ${format.toUpperCase()} successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export payments');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Payments</h1>
          <p className="text-gray-500">Manage manual enterprise payment records and approvals</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={exporting || isLoading}>
                <FileDown className="h-4 w-4 mr-2" />
                {exporting ? 'Exporting...' : 'Export'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('word')}>
                Export as Word
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setShowRecordDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Organization</label>
              <Select
                value={filters.organizationId}
                onValueChange={(value) =>
                  setFilters({ ...filters, organizationId: value, page: 1 })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Organizations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {organizations?.data.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Payment Status</label>
              <Select
                value={filters.paymentStatus}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    paymentStatus: value as PaymentStatus | 'all',
                    page: 1,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Approval Status</label>
              <Select
                value={filters.approvalStatus}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    approvalStatus: value as ApprovalStatus | 'all',
                    page: 1,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Approvals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Approvals</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    organizationId: 'all',
                    paymentStatus: 'all',
                    approvalStatus: 'all',
                    page: 1,
                    limit: 50,
                  })
                }
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Payment Records {payments?.total ? `(${payments.total})` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : payments?.data.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No payment records found</p>
              <p className="text-sm mt-2">Create your first payment record to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Organization</th>
                    <th className="text-left py-3 px-4 font-medium">Invoice</th>
                    <th className="text-left py-3 px-4 font-medium">Due Date</th>
                    <th className="text-right py-3 px-4 font-medium">Amount Due</th>
                    <th className="text-right py-3 px-4 font-medium">Amount Paid</th>
                    <th className="text-center py-3 px-4 font-medium">Payment Status</th>
                    <th className="text-center py-3 px-4 font-medium">Approval</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments?.data.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{payment.organization?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">
                          {payment.contractNumber || 'No contract'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{payment.invoiceNumber}</div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(payment.invoiceDate), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className={
                            new Date(payment.dueDate) < new Date() &&
                            payment.paymentStatus !== 'paid'
                              ? 'text-red-600 font-medium'
                              : ''
                          }
                        >
                          {format(new Date(payment.dueDate), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(payment.amountDue)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(payment.amountPaid)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getPaymentStatusColor(payment.paymentStatus)}>
                          {payment.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getApprovalStatusColor(payment.approvalStatus)}>
                          {payment.approvalStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPayment(payment);
                                setShowApprovalDialog(true);
                                setRejecting(false);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {payment.approvalStatus === 'pending' && (
                              <>
                                <DropdownMenuItem onClick={() => handleApprove(payment)}>
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReject(payment)}>
                                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {payment.paymentStatus !== 'paid' && (
                              <DropdownMenuItem
                                onClick={() => handleDelete(payment.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <RecordPaymentDialog open={showRecordDialog} onOpenChange={setShowRecordDialog} />
      <PaymentApprovalDialog
        open={showApprovalDialog}
        onOpenChange={setShowApprovalDialog}
        payment={selectedPayment}
        rejecting={rejecting}
      />
    </div>
  );
}
