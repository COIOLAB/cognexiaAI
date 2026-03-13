'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { workflowApi } from '@/services/workflow.api';
import { PageHeader } from '@/components/PageHeader';

const conditionOperators = ['>=', '>', '<=', '<', '==', '!='] as const;

export default function WorkflowPage() {
  const [workflowName, setWorkflowName] = useState('Lead Qualification');
  const [workflowDescription, setWorkflowDescription] = useState('Auto-qualify incoming leads');
  const [triggerEvent, setTriggerEvent] = useState('lead.created');
  const [conditionField, setConditionField] = useState('score');
  const [conditionOperator, setConditionOperator] = useState<(typeof conditionOperators)[number]>('>=');
  const [conditionValue, setConditionValue] = useState('70');
  const [updateEntity, setUpdateEntity] = useState('lead');
  const [updateField, setUpdateField] = useState('status');
  const [updateValue, setUpdateValue] = useState('qualified');
  const [createdBy, setCreatedBy] = useState('system_user');

  const [executeId, setExecuteId] = useState('');
  const [triggerKey, setTriggerKey] = useState('');
  const [triggerValue, setTriggerValue] = useState('');
  const [triggerPairs, setTriggerPairs] = useState<Array<{ key: string; value: string }>>([]);

  const workflowsQuery = useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => workflowApi.create(body),
    onSuccess: () => {
      toast.success('Workflow created');
      workflowsQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create workflow');
    },
  });

  const executeMutation = useMutation({
    mutationFn: (body: { id: string; payload: any }) => workflowApi.execute(body.id, body.payload),
    onSuccess: () => {
      toast.success('Workflow executed');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to execute workflow');
    },
  });

  const workflowItems = (workflowsQuery.data?.data || []) as Array<{
    id?: string;
    name?: string;
    description?: string;
    trigger?: { event?: string };
    steps?: unknown[];
    createdAt?: string;
  }>;

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

  const isWorkflowNameMissing = !workflowName.trim();
  const isTriggerEventMissing = !triggerEvent.trim();
  const isUpdateEntityMissing = !updateEntity.trim();
  const isUpdateFieldMissing = !updateField.trim();

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <PageHeader
          title="Workflow Automation"
          subtitle="Create and run business workflows."
          actions={
            <Button variant="outline" onClick={() => workflowsQuery.refetch()}>
              Refresh Workflows
            </Button>
          }
        />

      <Card>
        <CardHeader>
          <CardTitle>Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          {workflowsQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
            </div>
          ) : workflowItems.length === 0 ? (
            <div className="text-sm text-muted-foreground">No workflows created yet.</div>
          ) : (
            <div className="rounded-md border bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Steps</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflowItems.map((workflow) => (
                    <TableRow key={workflow.id || workflow.name}>
                      <TableCell className="font-medium">{workflow.name || 'Untitled'}</TableCell>
                      <TableCell>{workflow.trigger?.event || '—'}</TableCell>
                      <TableCell>{workflow.steps?.length ?? 0}</TableCell>
                      <TableCell>{workflow.createdAt ? String(workflow.createdAt) : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel label="Workflow Name" tooltip="Human-readable name." />
              <Input
                value={workflowName}
                onChange={(event) => setWorkflowName(event.target.value)}
                aria-invalid={isWorkflowNameMissing}
              />
              {isWorkflowNameMissing && (
                <p className="text-xs text-destructive">Workflow name is required.</p>
              )}
            </div>
            <div className="space-y-2">
              <FieldLabel label="Created By" tooltip="Owner or system user." />
              <Input value={createdBy} onChange={(event) => setCreatedBy(event.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <FieldLabel label="Description" tooltip="Summary for the workflow." />
              <Textarea
                value={workflowDescription}
                onChange={(event) => setWorkflowDescription(event.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="text-sm font-medium text-muted-foreground">Trigger</div>
            <div className="space-y-2">
              <FieldLabel label="Event Name" tooltip="Event that starts the workflow." />
              <Input
                value={triggerEvent}
                onChange={(event) => setTriggerEvent(event.target.value)}
                aria-invalid={isTriggerEventMissing}
              />
              {isTriggerEventMissing && (
                <p className="text-xs text-destructive">Trigger event is required.</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="text-sm font-medium text-muted-foreground">Condition Step</div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <FieldLabel label="Field" tooltip="Field to evaluate." />
                <Input
                  value={conditionField}
                  onChange={(event) => setConditionField(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel label="Operator" tooltip="Comparison operator." />
                <Select value={conditionOperator} onValueChange={(value) => setConditionOperator(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionOperators.map((operator) => (
                      <SelectItem key={operator} value={operator}>
                        {operator}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <FieldLabel label="Value" tooltip="Threshold or comparison value." />
                <Input
                  value={conditionValue}
                  onChange={(event) => setConditionValue(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="text-sm font-medium text-muted-foreground">Update Step</div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <FieldLabel label="Entity" tooltip="Entity to update." />
                <Input
                  value={updateEntity}
                  onChange={(event) => setUpdateEntity(event.target.value)}
                  aria-invalid={isUpdateEntityMissing}
                />
                {isUpdateEntityMissing && (
                  <p className="text-xs text-destructive">Entity is required.</p>
                )}
              </div>
              <div className="space-y-2">
                <FieldLabel label="Field" tooltip="Field to change." />
                <Input
                  value={updateField}
                  onChange={(event) => setUpdateField(event.target.value)}
                  aria-invalid={isUpdateFieldMissing}
                />
                {isUpdateFieldMissing && (
                  <p className="text-xs text-destructive">Field is required.</p>
                )}
              </div>
              <div className="space-y-2">
                <FieldLabel label="Value" tooltip="New value to set." />
                <Input
                  value={updateValue}
                  onChange={(event) => setUpdateValue(event.target.value)}
                />
              </div>
            </div>
          </div>
          <Button
            onClick={() => {
              if (isWorkflowNameMissing || isTriggerEventMissing) {
                toast.error('Fill out the required fields');
                return;
              }
              createMutation.mutate({
                name: workflowName,
                description: workflowDescription,
                trigger: { event: triggerEvent },
                steps: [
                  {
                    type: 'condition',
                    config: {
                      field: conditionField,
                      operator: conditionOperator,
                      value: Number.isNaN(Number(conditionValue)) ? conditionValue : Number(conditionValue),
                    },
                  },
                  {
                    type: 'update',
                    config: { entity: updateEntity, fields: { [updateField]: updateValue } },
                  },
                ],
                created_by: createdBy,
              });
            }}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating...' : 'Create Workflow'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Execute Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <FieldLabel label="Workflow ID" tooltip="ID from the workflow list." />
            <Input
              placeholder="Workflow ID"
              value={executeId}
              onChange={(e) => setExecuteId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel label="Trigger Data" tooltip="Optional trigger payload." />
            <div className="grid gap-2 md:grid-cols-2">
              <Input
                placeholder="key"
                value={triggerKey}
                onChange={(event) => setTriggerKey(event.target.value)}
              />
              <Input
                placeholder="value"
                value={triggerValue}
                onChange={(event) => setTriggerValue(event.target.value)}
              />
              <Button
                variant="outline"
                onClick={() => {
                  if (!triggerKey) return;
                  setTriggerPairs((prev) => {
                    const next = prev.filter((item) => item.key !== triggerKey);
                    next.push({ key: triggerKey, value: triggerValue });
                    return next;
                  });
                  setTriggerKey('');
                  setTriggerValue('');
                }}
              >
                Add Trigger Data
              </Button>
            </div>
            {triggerPairs.length > 0 && (
              <div className="mt-2 space-y-2 text-xs">
                {triggerPairs.map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded border px-2 py-1">
                    <span>
                      {item.key}: {item.value}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setTriggerPairs((prev) => prev.filter((entry) => entry.key !== item.key))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button
            onClick={() => {
              const trigger_data = triggerPairs.reduce<Record<string, string>>((acc, pair) => {
                acc[pair.key] = pair.value;
                return acc;
              }, {});
              executeMutation.mutate({ id: executeId, payload: { trigger_data } });
            }}
            disabled={executeMutation.isPending || !executeId}
          >
            {executeMutation.isPending ? 'Running...' : 'Execute'}
          </Button>
        </CardContent>
      </Card>
    </div>
  </TooltipProvider>
  );
}
