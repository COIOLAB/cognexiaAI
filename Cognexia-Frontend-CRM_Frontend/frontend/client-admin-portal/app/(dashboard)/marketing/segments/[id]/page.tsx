'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, RefreshCw, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDeleteSegment, useGetSegment, useRefreshSegment, useSegmentSize, useUpdateSegment } from '@/hooks/useMarketingSegments';
import { marketingSegmentApi } from '@/services/marketingSegment.api';
import { SegmentType } from '@/types/api.types';
import { toast } from 'sonner';

export default function SegmentDetailPage() {
  const params = useParams();
  const segmentId = params.id as string;
  const { data } = useGetSegment(segmentId);
  const { data: sizeData } = useSegmentSize(segmentId);
  const updateSegment = useUpdateSegment();
  const deleteSegment = useDeleteSegment();
  const refreshSegment = useRefreshSegment();

  const segment = (data as any)?.data ?? data;
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (segment) {
      setName(segment.name || '');
      setIsActive(Boolean(segment.isActive));
    }
  }, [segment]);

  const criteria = Array.isArray(segment?.criteria) ? segment.criteria : [];
  const segmentSize = sizeData?.data?.size ?? sizeData?.size ?? segment?.size ?? 0;
  const isFormValid = Boolean(name.trim());

  if (!segment) {
    return <div className="text-muted-foreground">Segment not found.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Segment Details"
        subtitle={segment ? segment.name : `Segment #${segmentId}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/marketing/segments">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => refreshSegment.mutate(segmentId)}
              disabled={refreshSegment.isPending}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {refreshSegment.isPending ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const blob = await marketingSegmentApi.exportSegment(segmentId, 'csv');
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `segment-${segmentId}.csv`;
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  window.URL.revokeObjectURL(url);
                  toast.success('Export downloaded');
                } catch (error) {
                  toast.error('Failed to export segment');
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('Delete this segment?')) {
                  deleteSegment.mutate(segmentId);
                }
              }}
              disabled={deleteSegment.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Segment Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{segmentSize}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="capitalize">
              {(segment?.type || SegmentType.STATIC).toString().replace('_', ' ')}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Segment Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Segment Name</label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div>
              <div className="text-sm font-medium">Active</div>
              <div className="text-xs text-muted-foreground">Enable this segment for campaigns.</div>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() =>
                updateSegment.mutate({
                  id: segmentId,
                  data: {
                    name: name.trim(),
                    isActive,
                  },
                })
              }
              disabled={!isFormValid || updateSegment.isPending}
            >
              {updateSegment.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Segment Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          {criteria.length ? (
            <div className="rounded-md border bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {criteria.map((criterion: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{criterion.field}</TableCell>
                      <TableCell>{criterion.operator}</TableCell>
                      <TableCell>
                        {typeof criterion.value === 'object'
                          ? JSON.stringify(criterion.value)
                          : String(criterion.value)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No criteria defined yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
