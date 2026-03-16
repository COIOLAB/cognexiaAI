'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/data-table';
import { useGetSequences, useCreateSequence, useDeleteSequence, useActivateSequence, usePauseSequence, useEnrollLead, useGetOverallStats } from '@/hooks/useSequences';
import { Play, Pause, Trash2, MoreVertical, Plus, Users, TrendingUp, Target, Clock } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Sequence } from '@/services/sequence.api';

export default function SequencesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null);
  const [newSequence, setNewSequence] = useState({
    name: '',
    description: '',
    steps: [
      { order: 0, type: 'EMAIL' as const, delayDays: 0, delayHours: 0, subject: '', content: '' },
    ],
  });

  const { data: sequences = [], isLoading } = useGetSequences();
  const { data: stats } = useGetOverallStats();
  const createSequence = useCreateSequence();
  const deleteSequence = useDeleteSequence();
  const activateSequence = useActivateSequence();
  const pauseSequence = usePauseSequence();
  const enrollLead = useEnrollLead();

  const handleCreateSequence = async () => {
    await createSequence.mutateAsync(newSequence);
    setIsCreateOpen(false);
    setNewSequence({
      name: '',
      description: '',
      steps: [{ order: 0, type: 'EMAIL', delayDays: 0, delayHours: 0, subject: '', content: '' }],
    });
  };

  const handleAddStep = () => {
    setNewSequence({
      ...newSequence,
      steps: [
        ...newSequence.steps,
        { order: newSequence.steps.length, type: 'EMAIL', delayDays: 1, delayHours: 0, subject: '', content: '' },
      ],
    });
  };

  const columns: ColumnDef<Sequence>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.description}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
          ACTIVE: 'default',
          PAUSED: 'secondary',
          DRAFT: 'outline',
          ARCHIVED: 'outline',
        };
        return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'enrollmentCount',
      header: 'Enrollments',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.enrollmentCount || 0}</span>
        </div>
      ),
    },
    {
      accessorKey: 'completionRate',
      header: 'Completion Rate',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.completionRate || 0}%</span>
        </div>
      ),
    },
    {
      accessorKey: 'steps',
      header: 'Steps',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.steps?.length || 0} steps</span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const sequence = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sequence.status === 'ACTIVE' ? (
                <DropdownMenuItem onClick={() => pauseSequence.mutate(sequence.id)}>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => activateSequence.mutate(sequence.id)}>
                  <Play className="h-4 w-4 mr-2" />
                  Activate
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {
                  setSelectedSequence(sequence);
                  setIsEnrollOpen(true);
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                Enroll Lead
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deleteSequence.mutate(sequence.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Sequences</h1>
          <p className="text-muted-foreground">Automate your sales outreach with sequences</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Sequence
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Sales Sequence</DialogTitle>
              <DialogDescription>Define your automated outreach sequence</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Sequence Name</Label>
                <Input
                  id="name"
                  value={newSequence.name}
                  onChange={(e) => setNewSequence({ ...newSequence, name: e.target.value })}
                  placeholder="New Lead Nurture Sequence"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newSequence.description}
                  onChange={(e) => setNewSequence({ ...newSequence, description: e.target.value })}
                  placeholder="Describe the purpose of this sequence..."
                  rows={2}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Sequence Steps</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddStep}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Step
                  </Button>
                </div>
                {newSequence.steps.map((step, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Step {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select
                            value={step.type}
                            onValueChange={(value: any) => {
                              const newSteps = [...newSequence.steps];
                              newSteps[index] = { ...step, type: value };
                              setNewSequence({ ...newSequence, steps: newSteps });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EMAIL">Email</SelectItem>
                              <SelectItem value="TASK">Task</SelectItem>
                              <SelectItem value="CALL">Call</SelectItem>
                              <SelectItem value="WAIT">Wait</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Delay (days)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={step.delayDays}
                            onChange={(e) => {
                              const newSteps = [...newSequence.steps];
                              newSteps[index] = { ...step, delayDays: parseInt(e.target.value) || 0 };
                              setNewSequence({ ...newSequence, steps: newSteps });
                            }}
                          />
                        </div>
                      </div>
                      {step.type === 'EMAIL' && (
                        <>
                          <div className="space-y-2">
                            <Label>Email Subject</Label>
                            <Input
                              value={step.subject || ''}
                              onChange={(e) => {
                                const newSteps = [...newSequence.steps];
                                newSteps[index] = { ...step, subject: e.target.value };
                                setNewSequence({ ...newSequence, steps: newSteps });
                              }}
                              placeholder="Subject line..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email Content</Label>
                            <Textarea
                              value={step.content || ''}
                              onChange={(e) => {
                                const newSteps = [...newSequence.steps];
                                newSteps[index] = { ...step, content: e.target.value };
                                setNewSequence({ ...newSequence, steps: newSteps });
                              }}
                              placeholder="Email body..."
                              rows={3}
                            />
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSequence} disabled={!newSequence.name || createSequence.isPending}>
                Create Sequence
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sequences</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sequences.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sequences</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sequences.filter((s) => s.status === 'ACTIVE').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sequences.reduce((sum, s) => sum + (s.enrollmentCount || 0), 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sequences.length > 0
                  ? Math.round(
                      sequences.reduce((sum, s) => sum + (s.completionRate || 0), 0) / sequences.length
                    )
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Sequences</CardTitle>
          <CardDescription>Manage your automated sales sequences</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={sequences} />
        </CardContent>
      </Card>

      <Dialog open={isEnrollOpen} onOpenChange={setIsEnrollOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll Lead in Sequence</DialogTitle>
            <DialogDescription>
              Enroll a lead in {selectedSequence?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="leadId">Lead ID</Label>
              <Input id="leadId" placeholder="Enter lead ID..." />
            </div>
            <p className="text-sm text-muted-foreground">
              The lead will automatically progress through the sequence steps based on the defined delays.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEnrollOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Implement enrollment logic
                setIsEnrollOpen(false);
              }}
            >
              Enroll Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
