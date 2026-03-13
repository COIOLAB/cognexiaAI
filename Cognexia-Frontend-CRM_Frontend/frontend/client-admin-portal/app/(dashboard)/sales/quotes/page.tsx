'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, Send, Download, Trash2, FileText } from 'lucide-react';
import { useQuotes, useQuoteStats, useDeleteQuote, useSendQuote, useBulkDeleteQuotes, useExportQuotes } from '@/hooks/useQuotes';
import { SalesQuote, QuoteStatus } from '@/types/api.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/PageHeader';
import { KpiCard } from '@/components/KpiCard';

const statusStyles: Record<QuoteStatus, string> = {
  [QuoteStatus.DRAFT]: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  [QuoteStatus.SENT]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [QuoteStatus.VIEWED]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  [QuoteStatus.ACCEPTED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [QuoteStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  [QuoteStatus.EXPIRED]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  [QuoteStatus.REVISED]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
};

export default function QuotesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<QuoteStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  
  const filters = {
    page,
    limit: 20,
    ...(status !== 'all' && { status }),
    ...(search && { search }),
  };

  const { data: quotesData, isLoading } = useQuotes(filters);
  const { data: statsData } = useQuoteStats();
  const deleteQuoteMutation = useDeleteQuote();
  const sendQuoteMutation = useSendQuote();
  const bulkDeleteMutation = useBulkDeleteQuotes();
  const exportQuotesMutation = useExportQuotes();

  const handleDelete = async (id: string) => {
    try {
      await deleteQuoteMutation.mutateAsync(id);
      toast({
        title: 'Success',
        description: 'Quote deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete quote',
        variant: 'destructive',
      });
    }
  };

  const handleSend = async (id: string) => {
    try {
      await sendQuoteMutation.mutateAsync(id);
      toast({
        title: 'Success',
        description: 'Quote sent to customer',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send quote',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportQuotesMutation.mutateAsync(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sales-quotes.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast({
        title: 'Export started',
        description: 'Quotes export downloaded',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export quotes',
        variant: 'destructive',
      });
    }
  };

  const columns: ColumnDef<SalesQuote>[] = [
    {
      accessorKey: 'quoteNumber',
      header: 'Quote #',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('quoteNumber')}</div>
      ),
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue('customerName')}</div>
          <div className="text-sm text-muted-foreground">{row.original.title}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as QuoteStatus;
        return (
          <Badge className={statusStyles[status]} variant="secondary">
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'validUntil',
      header: 'Valid Until',
      cell: ({ row }) => new Date(row.getValue('validUntil')).toLocaleDateString(),
    },
    {
      accessorKey: 'totals',
      header: 'Total',
      cell: ({ row }) => {
        const totals = row.getValue('totals') as { total: number };
        return (
          <div className="font-semibold">
            ${Number(totals?.total ?? 0).toLocaleString()}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const quote = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/sales/quotes/${quote.id}`)}>
                <FileText className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {quote.status === QuoteStatus.DRAFT && (
                <DropdownMenuItem onClick={() => handleSend(quote.id)}>
                  <Send className="mr-2 h-4 w-4" />
                  Send to Customer
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(quote.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const stats = statsData?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Quotes"
        subtitle="Manage and track your sales quotes"
        actions={
          <Button onClick={() => router.push('/sales/quotes/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Quote
          </Button>
        }
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-4">
          <KpiCard title="Total Quotes" value={Number(stats.totalQuotes ?? 0)} />
          <KpiCard
            title="Total Value"
            value={`$${(Number(stats.totalValue ?? 0) / 1000000).toFixed(2)}M`}
          />
          <KpiCard
            title="Acceptance Rate"
            value={`${Number(stats.acceptanceRate ?? 0).toFixed(1)}%`}
          />
          <KpiCard
            title="Expiring Soon"
            value={<span className="text-orange-600">{Number(stats.expiringCount ?? 0)}</span>}
          />
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search quotes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={status} onValueChange={(value) => setStatus(value as QuoteStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={QuoteStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={QuoteStatus.SENT}>Sent</SelectItem>
                <SelectItem value={QuoteStatus.VIEWED}>Viewed</SelectItem>
                <SelectItem value={QuoteStatus.ACCEPTED}>Accepted</SelectItem>
                <SelectItem value={QuoteStatus.REJECTED}>Rejected</SelectItem>
                <SelectItem value={QuoteStatus.EXPIRED}>Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport} disabled={exportQuotesMutation.isPending}>
              <Download className="mr-2 h-4 w-4" />
              {exportQuotesMutation.isPending ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={quotesData?.data || []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
