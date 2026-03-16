'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCreateSegment, useGetSegments, useSegmentStats } from '@/hooks/useMarketingSegments';
import { PageHeader } from '@/components/PageHeader';
import { KpiCard } from '@/components/KpiCard';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

export default function SegmentsPage() {
  const { data: segmentsData, isLoading } = useGetSegments();
  const { data: statsData } = useSegmentStats();
  const createSegment = useCreateSegment();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const stats = statsData?.data || {
    totalSegments: 0,
    activeSegments: 0,
    totalContacts: 0,
  };

  const segments = segmentsData?.data?.segments || segmentsData?.data || [];

  const isFormValid = Boolean(name.trim());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audience Segments"
        subtitle="Create targeted segments for campaigns."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Segment
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard title="Total Segments" value={stats.totalSegments || 0} />
        <KpiCard title="Active Segments" value={stats.activeSegments || 0} />
        <KpiCard title="Total Contacts" value={stats.totalContacts || 0} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Segments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading segments...</div>
          ) : segments.length > 0 ? (
            segments.map((segment: any) => (
              <Link
                key={segment.id}
                href={`/marketing/segments/${segment.id}`}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
              >
                <div>
                  <div className="font-medium">{segment.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {segment.description || 'Segment'}
                  </div>
                </div>
                <Badge variant={segment.isActive ? 'default' : 'secondary'}>
                  {segment.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No segments found.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Segment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Segment Name</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Enterprise accounts" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!isFormValid) return;
                createSegment.mutate(
                  {
                    name: name.trim(),
                    type: 'static' as any,
                    criteria: [],
                  },
                  {
                    onSuccess: () => {
                      setOpen(false);
                      setName('');
                      setDescription('');
                    },
                  },
                );
              }}
              disabled={createSegment.isPending || !isFormValid}
            >
              {createSegment.isPending ? 'Creating...' : 'Create Segment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
