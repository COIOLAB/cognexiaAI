'use client';

import { useGetContracts } from '@/hooks/useDocuments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function ContractsPage() {
  const { data: contracts, isLoading } = useGetContracts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contracts</h1>
          <p className="text-muted-foreground">
            Track active agreements and renewals
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Contract
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Contracts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading contracts...</div>
          ) : contracts && contracts.length > 0 ? (
            contracts.map((contract) => (
              <div key={contract.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium">{contract.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {contract.contractNumber} · {contract.customerName || 'Customer'}
                  </div>
                </div>
                <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                  {contract.status}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">No contracts found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
