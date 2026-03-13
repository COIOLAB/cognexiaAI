'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Workflow, Plus, Trash2 } from 'lucide-react';
import { useCreateIVRFlow, useDeleteIVRFlow, useGetIVRFlows, useTestIVRFlow, useUpdateIVRFlow } from '@/hooks/useCalls';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';

export default function IVRBuilderPage() {
  const { data: flows = [], isLoading } = useGetIVRFlows();
  const createFlow = useCreateIVRFlow();
  const updateFlow = useUpdateIVRFlow();
  const deleteFlow = useDeleteIVRFlow();
  const testFlow = useTestIVRFlow();
  const [open, setOpen] = useState(false);
  const [editFlow, setEditFlow] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [greetingText, setGreetingText] = useState('');
  const [timeout, setTimeout] = useState('5');
  const [optionDigit, setOptionDigit] = useState('1');
  const [optionLabel, setOptionLabel] = useState('Sales');
  const [optionAction, setOptionAction] = useState('QUEUE');
  const [optionActionValue, setOptionActionValue] = useState('');

  useEffect(() => {
    if (editFlow) {
      setName(editFlow.name || '');
      setDescription(editFlow.description || '');
      setGreetingText(editFlow.greetingText || '');
      setTimeout(String(editFlow.timeout ?? 5));
      const option = editFlow.options?.[0];
      if (option) {
        setOptionDigit(option.digit);
        setOptionLabel(option.label);
        setOptionAction(option.action);
        setOptionActionValue(option.actionValue);
      }
    }
  }, [editFlow]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setGreetingText('');
    setTimeout('5');
    setOptionDigit('1');
    setOptionLabel('Sales');
    setOptionAction('QUEUE');
    setOptionActionValue('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="IVR Builder"
        subtitle="Design interactive voice response flows"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Flow
          </Button>
        }
      />

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">Loading flows...</CardContent>
          </Card>
        ) : flows.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Get Started with IVR</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <Workflow className="h-24 w-24 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Create your first IVR flow to route calls intelligently
                </p>
                <Button onClick={() => setOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Flow
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          flows.map((flow: any) => (
            <Card key={flow.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{flow.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditFlow(flow); setOpen(true); }}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        testFlow.mutate(flow.id, {
                          onSuccess: () => toast.success('IVR test initiated'),
                          onError: () => toast.error('Failed to test IVR'),
                        })
                      }
                      disabled={testFlow.isPending}
                    >
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this IVR flow?')) {
                          deleteFlow.mutate(flow.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{flow.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>IVR Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Menu Options</h3>
              <p className="text-sm text-muted-foreground">
                Create multi-level menus with custom prompts and routing
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Skill-Based Routing</h3>
              <p className="text-sm text-muted-foreground">
                Route calls to agents based on their skills and availability
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Business Hours</h3>
              <p className="text-sm text-muted-foreground">
                Configure different flows for business and after hours
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Voice Prompts</h3>
              <p className="text-sm text-muted-foreground">
                Upload custom audio files or use text-to-speech
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(next) => { if (!next) { setOpen(false); setEditFlow(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editFlow ? 'Edit IVR Flow' : 'Create IVR Flow'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Flow Name</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Greeting Text</label>
              <Input value={greetingText} onChange={(event) => setGreetingText(event.target.value)} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Timeout (sec)</label>
                <Input type="number" value={timeout} onChange={(event) => setTimeout(event.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Option Digit</label>
                <Input value={optionDigit} onChange={(event) => setOptionDigit(event.target.value)} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Option Label</label>
                <Input value={optionLabel} onChange={(event) => setOptionLabel(event.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Action</label>
                <Select value={optionAction} onValueChange={setOptionAction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['QUEUE', 'TRANSFER', 'VOICEMAIL', 'SUBMENU', 'HANGUP', 'GATHER_INPUT', 'PLAY_MESSAGE'].map((action) => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Action Value</label>
              <Input value={optionActionValue} onChange={(event) => setOptionActionValue(event.target.value)} placeholder="Queue ID, phone number, etc." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setEditFlow(null); resetForm(); }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!name.trim()) return;
                const payload = {
                  name: name.trim(),
                  description: description || undefined,
                  greetingText: greetingText || undefined,
                  timeout: Number(timeout),
                  options: [
                    {
                      digit: optionDigit,
                      label: optionLabel,
                      action: optionAction,
                      actionValue: optionActionValue,
                    },
                  ],
                };
                if (editFlow) {
                  updateFlow.mutate({ id: editFlow.id, data: payload }, { onSuccess: () => setOpen(false) });
                } else {
                  createFlow.mutate(payload, { onSuccess: () => setOpen(false) });
                }
              }}
              disabled={createFlow.isPending || updateFlow.isPending}
            >
              {editFlow ? 'Save Changes' : 'Create Flow'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
