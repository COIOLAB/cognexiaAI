'use client';

import { useQuery } from '@tanstack/react-query';
import { invoicesAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus } from 'lucide-react';

export default function InvoicesPage() {
  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesAPI.getAll(),
  });

  const { data: stats } = useQuery({
    queryKey: ['invoices', 'stats'],
    queryFn: () => invoicesAPI.getStats(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold">Invoice Management</h1>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Invoice</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Total</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.total || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Paid</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{stats?.paid || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Pending</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.pending || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Outstanding</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">${stats?.outstanding_amount?.toLocaleString() || 0}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invoices?.map((invoice: any) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{invoice.invoice_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {invoice.organization?.name} • {new Date(invoice.invoice_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">${invoice.total_amount}</span>
                  <Badge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'error' : 'secondary'}>
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

