'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ListOrdered, Clock, Plus, BarChart2 } from 'lucide-react';
import { useCreateQueue, useGetQueueStats, useGetQueues, useUpdateQueue } from '@/hooks/useCalls';
import { useTelephonyLive } from '@/hooks/useTelephonyLive';
import { PageHeader } from '@/components/PageHeader';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QueueStrategy } from '@/types/api.types';
import { toast } from 'sonner';

export default function CallQueuesPage() {
  const { data: queues = [], isLoading } = useGetQueues();
  const createQueue = useCreateQueue();
  const updateQueue = useUpdateQueue();
  const [createOpen, setCreateOpen] = useState(false);
  const [editQueueId, setEditQueueId] = useState<string | null>(null);
  const [statsQueueId, setStatsQueueId] = useState<string | null>(null);
  const { data: statsData } = useGetQueueStats(statsQueueId || '');
  const editQueue = useMemo(
    () => queues.find((queue) => queue.id === editQueueId) || null,
    [queues, editQueueId],
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [routingStrategy, setRoutingStrategy] = useState<QueueStrategy>(QueueStrategy.ROUND_ROBIN);
  const [priority, setPriority] = useState('1');
  const [maxQueueSize, setMaxQueueSize] = useState('50');
  const [maxWaitTime, setMaxWaitTime] = useState('300');
  const [requiredSkills, setRequiredSkills] = useState('');
  useTelephonyLive();

  const resetForm = () => {
    setName('');
    setDescription('');
    setPhoneNumber('');
    setRoutingStrategy(QueueStrategy.ROUND_ROBIN);
    setPriority('1');
    setMaxQueueSize('50');
    setMaxWaitTime('300');
    setRequiredSkills('');
  };

  const openEdit = (queue: any) => {
    setEditQueueId(queue.id);
    setName(queue.name || '');
    setDescription(queue.description || '');
    setPhoneNumber(queue.phoneNumber || '');
    setRoutingStrategy(queue.routingStrategy || QueueStrategy.ROUND_ROBIN);
    setPriority(String(queue.priority ?? 1));
    setMaxQueueSize(String(queue.maxQueueSize ?? 50));
    setMaxWaitTime(String(queue.maxWaitTime ?? 300));
    setRequiredSkills(queue.requiredSkills?.join(', ') || '');
  };

  const isFormValid = Boolean(name.trim() && phoneNumber.trim());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Call Queues"
        subtitle="Manage call queues and routing"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Queue
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queues</CardTitle>
            <ListOrdered className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queues.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls in Queue</CardTitle>
            <ListOrdered className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {queues.reduce((sum, q) => sum + (q.currentQueueSize || 0), 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Service Level</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {queues.length > 0
                ? (
                    Math.round(
                      (queues.reduce((sum, q) => sum + (q.serviceLevelPercentage || 0), 0) / queues.length) * 10
                    ) / 10
                  )
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {queues.length > 0
                ? Math.round(
                    queues.reduce((sum, q) => sum + (q.averageWaitTime || 0), 0) / queues.length
                  )
                : 0}s
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">Loading queues...</CardContent>
          </Card>
        ) : queues.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">No queues found</CardContent>
          </Card>
        ) : (
          queues.map((queue) => (
            <Card key={queue.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{queue.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{queue.description}</p>
                  </div>
                  <Badge variant={queue.isActive ? 'default' : 'secondary'}>
                    {queue.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-5">
                  <div>
                    <div className="text-sm text-muted-foreground">Calls in Queue</div>
                    <div className="text-2xl font-bold">{queue.currentQueueSize || 0}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Avg Wait Time</div>
                    <div className="text-2xl font-bold">{queue.averageWaitTime || 0}s</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Service Level</div>
                    <div className="text-2xl font-bold">{queue.serviceLevelPercentage || 0}%</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Routing Strategy</div>
                    <Badge variant="outline" className="mt-1">
                      {queue.routingStrategy}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(queue)}>Edit</Button>
                    <Button variant="outline" size="sm" onClick={() => setStatsQueueId(queue.id)}>
                      <BarChart2 className="mr-2 h-4 w-4" />
                      Stats
                    </Button>
                  </div>
                </div>

                {queue.maxQueueSize && (
                  <div className="mt-4">
                    <div className="text-sm text-muted-foreground mb-2">
                      Queue Capacity: {queue.currentQueueSize || 0} / {queue.maxQueueSize}
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${Math.min(
                            ((queue.currentQueueSize || 0) / queue.maxQueueSize) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Queue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Queue Name</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Support Queue" />
            </div>
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <Input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="+1 555 0100" />
            </div>
            <div>
              <label className="text-sm font-medium">Routing Strategy</label>
              <Select value={routingStrategy} onValueChange={(value) => setRoutingStrategy(value as QueueStrategy)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(QueueStrategy).map((value) => (
                    <SelectItem key={value} value={value}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Input type="number" value={priority} onChange={(event) => setPriority(event.target.value)} min="1" />
              </div>
              <div>
                <label className="text-sm font-medium">Max Queue Size</label>
                <Input type="number" value={maxQueueSize} onChange={(event) => setMaxQueueSize(event.target.value)} min="1" />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Max Wait Time (sec)</label>
                <Input type="number" value={maxWaitTime} onChange={(event) => setMaxWaitTime(event.target.value)} min="30" />
              </div>
              <div>
                <label className="text-sm font-medium">Required Skills</label>
                <Input value={requiredSkills} onChange={(event) => setRequiredSkills(event.target.value)} placeholder="billing, onboarding" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Queue for priority calls" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!isFormValid) return;
                createQueue.mutate(
                  {
                    name: name.trim(),
                    description: description || undefined,
                    phoneNumber: phoneNumber.trim(),
                    routingStrategy,
                    priority: Number(priority),
                    maxQueueSize: Number(maxQueueSize),
                    maxWaitTime: Number(maxWaitTime),
                    requiredSkills: requiredSkills.split(',').map((skill) => skill.trim()).filter(Boolean),
                  },
                  {
                    onSuccess: () => {
                      toast.success('Queue created');
                      setCreateOpen(false);
                      resetForm();
                    },
                  },
                );
              }}
              disabled={!isFormValid || createQueue.isPending}
            >
              {createQueue.isPending ? 'Creating...' : 'Create Queue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editQueueId)} onOpenChange={(open) => !open && setEditQueueId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Queue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Queue Name</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <Input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Routing Strategy</label>
              <Select value={routingStrategy} onValueChange={(value) => setRoutingStrategy(value as QueueStrategy)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(QueueStrategy).map((value) => (
                    <SelectItem key={value} value={value}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Input type="number" value={priority} onChange={(event) => setPriority(event.target.value)} min="1" />
              </div>
              <div>
                <label className="text-sm font-medium">Max Queue Size</label>
                <Input type="number" value={maxQueueSize} onChange={(event) => setMaxQueueSize(event.target.value)} min="1" />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Max Wait Time (sec)</label>
                <Input type="number" value={maxWaitTime} onChange={(event) => setMaxWaitTime(event.target.value)} min="30" />
              </div>
              <div>
                <label className="text-sm font-medium">Required Skills</label>
                <Input value={requiredSkills} onChange={(event) => setRequiredSkills(event.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditQueueId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!editQueueId || !isFormValid) return;
                updateQueue.mutate(
                  {
                    id: editQueueId,
                    data: {
                      name: name.trim(),
                      description: description || undefined,
                      phoneNumber: phoneNumber.trim(),
                      routingStrategy,
                      priority: Number(priority),
                      maxQueueSize: Number(maxQueueSize),
                      maxWaitTime: Number(maxWaitTime),
                      requiredSkills: requiredSkills.split(',').map((skill) => skill.trim()).filter(Boolean),
                    },
                  },
                  {
                    onSuccess: () => {
                      toast.success('Queue updated');
                      setEditQueueId(null);
                      resetForm();
                    },
                  },
                );
              }}
              disabled={!isFormValid || updateQueue.isPending}
            >
              {updateQueue.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(statsQueueId)} onOpenChange={(open) => !open && setStatsQueueId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Queue Stats</DialogTitle>
          </DialogHeader>
          {statsQueueId ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Current Queue Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsData?.currentQueueSize ?? 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Avg Wait Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsData?.averageWaitTime ?? 0}s</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Agents Available</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsData?.agentsAvailable ?? 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Calls Handled Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsData?.callsHandledToday ?? 0}</div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No stats available.</div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatsQueueId(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
