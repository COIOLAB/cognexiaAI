'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCreateSLA, useDeleteSLA, useGetSLAPolicies, useSLAMetrics } from '@/hooks/useSLA';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { KpiCard } from '@/components/KpiCard';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SLAPriorityLevel } from '@/types/api.types';

export default function SLAManagementPage() {
  const { data: policies } = useGetSLAPolicies();
  const { data: metrics } = useSLAMetrics();
  const createSLA = useCreateSLA();
  const deleteSLA = useDeleteSLA();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<SLAPriorityLevel>(SLAPriorityLevel.MEDIUM);
  const [firstResponseTime, setFirstResponseTime] = useState('60');
  const [resolutionTime, setResolutionTime] = useState('480');
  const [businessHoursOnly, setBusinessHoursOnly] = useState(true);

  const isFormValid = Boolean(name.trim() && firstResponseTime && resolutionTime);

  return (
    <div className="space-y-6">
      <PageHeader
        title="SLA Management"
        subtitle="Define response targets and compliance rules."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New SLA Policy
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard title="Total Tickets" value={metrics?.totalTickets || 0} />
        <KpiCard
          title="Compliant"
          value={<span className="text-green-600">{metrics?.compliantTickets || 0}</span>}
        />
        <KpiCard
          title="Violated"
          value={<span className="text-red-600">{metrics?.violatedTickets || 0}</span>}
        />
        <KpiCard title="Compliance Rate" value={`${metrics?.complianceRate?.toFixed(1) || '0.0'}%`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SLA Policies</CardTitle>
        </CardHeader>
        <CardContent>
          {policies?.data?.length ? (
            <div className="rounded-md border bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>First Response</TableHead>
                    <TableHead>Resolution</TableHead>
                    <TableHead>Business Hours</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.data.map((policy: any) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-medium">{policy.name}</TableCell>
                      <TableCell className="capitalize">{policy.priority}</TableCell>
                      <TableCell>{policy.firstResponseTime}m</TableCell>
                      <TableCell>{policy.resolutionTime}m</TableCell>
                      <TableCell>{policy.businessHoursOnly ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSLA.mutate(policy.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No SLA policies yet.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create SLA Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Policy Name</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Critical response SLA" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Priority response SLA" />
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select value={priority} onValueChange={(value) => setPriority(value as SLAPriorityLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(SLAPriorityLevel).map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">First Response (min)</label>
                <Input value={firstResponseTime} onChange={(event) => setFirstResponseTime(event.target.value)} type="number" min="1" />
              </div>
              <div>
                <label className="text-sm font-medium">Resolution (min)</label>
                <Input value={resolutionTime} onChange={(event) => setResolutionTime(event.target.value)} type="number" min="1" />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div>
                <div className="text-sm font-medium">Business Hours Only</div>
                <div className="text-xs text-muted-foreground">Enforce SLA during business hours.</div>
              </div>
              <Switch checked={businessHoursOnly} onCheckedChange={setBusinessHoursOnly} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!isFormValid) return;
                createSLA.mutate(
                  {
                    name: name.trim(),
                    description: description || undefined,
                    priority,
                    firstResponseTime: Number(firstResponseTime),
                    resolutionTime: Number(resolutionTime),
                    businessHoursOnly,
                  },
                  {
                    onSuccess: () => {
                      setOpen(false);
                      setName('');
                      setDescription('');
                      setFirstResponseTime('60');
                      setResolutionTime('480');
                      setBusinessHoursOnly(true);
                    },
                  },
                );
              }}
              disabled={createSLA.isPending || !isFormValid}
            >
              {createSLA.isPending ? 'Creating...' : 'Create Policy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
