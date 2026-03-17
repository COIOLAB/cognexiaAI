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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { SegmentCriteria } from '@/types/api.types';

export default function SegmentsPage() {
  const { data: segmentsData, isLoading } = useGetSegments();
  const { data: statsData } = useSegmentStats();
  const createSegment = useCreateSegment();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState<SegmentCriteria>(SegmentCriteria.DEMOGRAPHIC);

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
            <div>
              <label className="text-sm font-medium">Criteria</label>
              <Select value={criteria} onValueChange={(value) => setCriteria(value as SegmentCriteria)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select criteria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SegmentCriteria.DEMOGRAPHIC}>Demographic</SelectItem>
                  <SelectItem value={SegmentCriteria.BEHAVIORAL}>Behavioral</SelectItem>
                  <SelectItem value={SegmentCriteria.GEOGRAPHIC}>Geographic</SelectItem>
                  <SelectItem value={SegmentCriteria.PSYCHOGRAPHIC}>Psychographic</SelectItem>
                  <SelectItem value={SegmentCriteria.TRANSACTIONAL}>Transactional</SelectItem>
                  <SelectItem value={SegmentCriteria.ENGAGEMENT}>Engagement</SelectItem>
                </SelectContent>
              </Select>
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
                    description: description.trim(),
                    criteria,
                    conditions: [],
                  },
                  {
                    onSuccess: () => {
                      setOpen(false);
                      setName('');
                      setDescription('');
                      setCriteria(SegmentCriteria.DEMOGRAPHIC);
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
