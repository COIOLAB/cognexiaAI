'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { recommendationApi } from '@/services/recommendation.api';
import { PageHeader } from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function RecommendationsPage() {
  const [productId, setProductId] = useState('');
  const [limit, setLimit] = useState('5');
  const [runQuery, setRunQuery] = useState(false);

  const recommendationsQuery = useQuery({
    queryKey: ['recommendations', productId, limit],
    queryFn: () => recommendationApi.getRecommendations(productId, Number(limit) || 5),
    enabled: runQuery && !!productId,
  });

  const bundleQuery = useQuery({
    queryKey: ['recommendations', 'bundles', productId],
    queryFn: () => recommendationApi.getFrequentlyBoughtTogether(productId),
    enabled: runQuery && !!productId,
  });

  const upsellQuery = useQuery({
    queryKey: ['recommendations', 'upsell', productId],
    queryFn: () => recommendationApi.getUpsell(productId),
    enabled: runQuery && !!productId,
  });

  const FieldLabel = ({ label, tooltip }: { label: string; tooltip?: string }) => (
    <div className="flex items-center gap-2 text-sm font-medium">
      <span>{label}</span>
      {tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help rounded-full border px-1 text-[10px] text-muted-foreground">?</span>
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );

  const renderList = (items: any[]) => {
    if (!items || items.length === 0) {
      return <div className="text-sm text-muted-foreground">No results yet.</div>;
    }
    return (
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item: any, index: number) => (
              <TableRow key={item.id || item.productId || index}>
                <TableCell className="font-medium">
                  {item.name || item.title || item.productName || item.id || 'Item'}
                </TableCell>
                <TableCell>{item.score ?? item.rank ?? '—'}</TableCell>
                <TableCell className="text-muted-foreground">
                  {item.reason || item.category || item.type || '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <PageHeader
          title="Recommendations"
          subtitle="Product recommendations and upsell insights."
          actions={
            <Button variant="outline" onClick={() => setRunQuery(true)} disabled={!productId}>
              Refresh
            </Button>
          }
        />

      <Card>
        <CardHeader>
          <CardTitle>Lookup Product</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <FieldLabel label="Product ID" tooltip="Required to fetch recommendations." />
            <Input value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="product-uuid" />
          </div>
          <div className="w-32">
            <FieldLabel label="Limit" tooltip="Max recommendations to return." />
            <Input value={limit} onChange={(e) => setLimit(e.target.value)} type="number" min="1" />
          </div>
          <Button onClick={() => setRunQuery(true)} disabled={!productId}>
            Fetch
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {recommendationsQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            ) : (
              renderList(recommendationsQuery.data ?? [])
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Frequently Bought Together</CardTitle>
          </CardHeader>
          <CardContent>
            {bundleQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            ) : (
              renderList(bundleQuery.data ?? [])
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upsell Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            {upsellQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            ) : (
              renderList(Array.isArray(upsellQuery.data) ? upsellQuery.data : [upsellQuery.data].filter(Boolean))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  </TooltipProvider>
  );
}
