'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Brain, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/PageHeader';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { llmApi } from '@/services/llm.api';
import { quantumApi } from '@/services/quantum.api';
import { holographicApi } from '@/services/holographic.api';
import { arvrApi } from '@/services/arvr.api';
import { realTimeApi } from '@/services/realTime.api';

const contentTypes = ['marketing', 'sales', 'support', 'product'] as const;
const projectionTypes = ['VOLUMETRIC', 'LIGHT_FIELD', 'HOLOGRAPHIC_DISPLAY', 'MIXED_REALITY'] as const;
const showroomTypes = ['VR', 'AR', 'MIXED_REALITY'] as const;

const renderDataTable = (data: any) => {
  if (!data) {
    return <div className="text-sm text-muted-foreground">No data yet.</div>;
  }
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <div className="text-sm text-muted-foreground">No results.</div>;
    }
    const first = data[0];
    if (first && typeof first === 'object') {
      const keys = Object.keys(first).slice(0, 6);
      return (
        <div className="rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                {keys.map((key) => (
                  <TableHead key={key}>{key}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 10).map((row, index) => (
                <TableRow key={row?.id || index}>
                  {keys.map((key) => (
                    <TableCell key={key}>{String(row?.[key] ?? '—')}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }
    return (
      <div className="space-y-2 text-sm">
        {data.slice(0, 10).map((item, index) => (
          <div key={index} className="rounded border px-2 py-1">
            {String(item)}
          </div>
        ))}
      </div>
    );
  }
  if (typeof data === 'object') {
    const entries = Object.entries(data);
    if (!entries.length) {
      return <div className="text-sm text-muted-foreground">No data yet.</div>;
    }
    return (
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.slice(0, 10).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell className="font-medium">{key}</TableCell>
                <TableCell>
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
  return <div className="text-sm">{String(data)}</div>;
};

export default function AIPage() {
  const [prompt, setPrompt] = useState('Write a campaign tagline for summer sale.');
  const [contentType, setContentType] = useState<(typeof contentTypes)[number]>('marketing');
  const [llmResult, setLlmResult] = useState<any>(null);

  const [chatTitle, setChatTitle] = useState('Conversational AI Session');
  const [conversationId, setConversationId] = useState('');
  const [chatMessage, setChatMessage] = useState('Hello! Summarize our latest activity.');
  const [chatResult, setChatResult] = useState<any>(null);

  const [customerId, setCustomerId] = useState('');
  const [quantumResult, setQuantumResult] = useState<any>(null);

  const [projectionName, setProjectionName] = useState('Product Showcase');
  const [projectionType, setProjectionType] = useState<(typeof projectionTypes)[number]>('VOLUMETRIC');
  const [sessionName, setSessionName] = useState('Spatial Demo');
  const [sessionId, setSessionId] = useState('');

  const [showroomName, setShowroomName] = useState('Immersive Showroom');
  const [showroomType, setShowroomType] = useState<(typeof showroomTypes)[number]>('VR');

  const [alertName, setAlertName] = useState('Traffic Spike');
  const [alertThreshold, setAlertThreshold] = useState('90');
  const [alertCondition, setAlertCondition] = useState('value > threshold');

  const modelsQuery = useQuery({
    queryKey: ['ai', 'llm', 'models'],
    queryFn: () => llmApi.getModels(),
  });

  const generateContentMutation = useMutation({
    mutationFn: (payload: { prompt: string; contentType?: string }) =>
      llmApi.generateContent(payload),
    onSuccess: (data) => {
      toast.success('Content generated');
      setLlmResult(data);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to generate content');
    },
  });

  const startChatMutation = useMutation({
    mutationFn: (payload: { title?: string }) => llmApi.startChat(payload),
    onSuccess: (data) => {
      toast.success('Chat session started');
      if (data?.id) {
        setConversationId(data.id);
      }
      setChatResult(data);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to start chat');
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (payload: { conversationId: string; message: string }) =>
      llmApi.sendMessage(payload.conversationId, { message: payload.message }),
    onSuccess: (data) => {
      toast.success('Message sent');
      setChatResult(data);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send message');
    },
  });

  const quantumAction = useMutation({
    mutationFn: async (action: string) => {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }
      if (action === 'profile') {
        return quantumApi.generateProfile(customerId);
      }
      if (action === 'entanglement') {
        return quantumApi.getEntanglement(customerId);
      }
      if (action === 'consciousness') {
        return quantumApi.simulateConsciousness(customerId);
      }
      if (action === 'behavior') {
        return quantumApi.predictBehavior(customerId);
      }
      return quantumApi.emotionalResonance(customerId);
    },
    onSuccess: (data) => {
      setQuantumResult(data);
    },
    onError: (error: any) => {
      toast.error(error?.message || error?.response?.data?.message || 'Quantum request failed');
    },
  });

  const createProjectionMutation = useMutation({
    mutationFn: (payload: { name: string; projectionType: string }) =>
      holographicApi.createProjection(payload),
    onSuccess: () => toast.success('Projection created'),
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || 'Failed to create projection'),
  });

  const createSessionMutation = useMutation({
    mutationFn: (payload: { sessionName: string; participantIds: string[] }) =>
      holographicApi.createSession(payload),
    onSuccess: (data) => {
      toast.success('Session created');
      setSessionId(data?.id || '');
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || 'Failed to create session'),
  });

  const sessionQuery = useQuery({
    queryKey: ['ai', 'holographic', 'session', sessionId],
    queryFn: () => holographicApi.getSession(sessionId),
    enabled: !!sessionId,
  });

  const sessionAnalyticsQuery = useQuery({
    queryKey: ['ai', 'holographic', 'session', sessionId, 'analytics'],
    queryFn: () => holographicApi.getSessionAnalytics(sessionId),
    enabled: !!sessionId,
  });

  const showroomsQuery = useQuery({
    queryKey: ['ai', 'arvr', 'showrooms'],
    queryFn: () => arvrApi.listShowrooms(),
  });

  const arvrAnalyticsQuery = useQuery({
    queryKey: ['ai', 'arvr', 'analytics'],
    queryFn: () => arvrApi.getAnalytics(),
  });

  const createShowroomMutation = useMutation({
    mutationFn: (payload: { name: string; experienceType: string }) =>
      arvrApi.createShowroom(payload),
    onSuccess: () => {
      toast.success('Showroom created');
      showroomsQuery.refetch();
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || 'Failed to create showroom'),
  });

  const liveMetricsQuery = useQuery({
    queryKey: ['ai', 'real-time', 'metrics'],
    queryFn: () => realTimeApi.getLiveMetrics(),
  });

  const alertsQuery = useQuery({
    queryKey: ['ai', 'real-time', 'alerts'],
    queryFn: () => realTimeApi.getAlerts(),
  });

  const createAlertMutation = useMutation({
    mutationFn: (payload: { name: string; threshold: number; condition: string }) =>
      realTimeApi.createAlert(payload),
    onSuccess: () => {
      toast.success('Alert created');
      alertsQuery.refetch();
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || 'Failed to create alert'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Lab"
        subtitle="Simple tools to run AI features. Fill the fields and click the action."
        icon={<Brain className="h-7 w-7 text-primary" />}
        actions={
          <Button variant="outline" onClick={() => modelsQuery.refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh Models
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center justify-between">
              <span>Content Generator</span>
              <Button variant="ghost" size="icon" onClick={() => modelsQuery.refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Generate marketing, sales, support, or product copy.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Generated Content</label>
              <Textarea
                value={
                  generateContentMutation.isPending
                    ? 'Generating...'
                    : (llmResult?.generatedText || '').toString()
                }
                readOnly
                rows={4}
                placeholder="Your generated content will appear here."
              />
            </div>
            <div className="grid gap-3">
              <div>
                <label className="text-sm font-medium">Prompt</label>
                <Textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Content Type</label>
                <Select value={contentType} onValueChange={(value) => setContentType(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={() => generateContentMutation.mutate({ prompt, contentType })}
              disabled={generateContentMutation.isPending}
            >
              {generateContentMutation.isPending ? 'Generating...' : 'Generate Content'}
            </Button>
            <details className="rounded-lg border bg-muted p-3 text-xs">
              <summary className="cursor-pointer font-medium">Advanced details</summary>
              <div className="mt-2 space-y-2">
              <div className="space-y-2">
                <div className="text-sm font-medium">Models</div>
                {modelsQuery.isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                  </div>
                ) : (
                  renderDataTable(modelsQuery.data)
                )}
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Result</div>
                {generateContentMutation.isPending ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                  </div>
                ) : (
                  renderDataTable(llmResult)
                )}
              </div>
              </div>
            </details>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>AI Chat Assistant</CardTitle>
            <p className="text-sm text-muted-foreground">Start a chat session and send a message.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Chat Title</label>
              <Input value={chatTitle} onChange={(event) => setChatTitle(event.target.value)} />
            </div>
            <Button
              onClick={() => startChatMutation.mutate({ title: chatTitle })}
              disabled={startChatMutation.isPending}
            >
              {startChatMutation.isPending ? 'Starting...' : 'Start Chat'}
            </Button>
            <div>
              <label className="text-sm font-medium">Conversation ID</label>
              <Input
                value={conversationId}
                onChange={(event) => setConversationId(event.target.value)}
                placeholder="Will auto-fill after starting chat"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea value={chatMessage} onChange={(event) => setChatMessage(event.target.value)} rows={2} />
            </div>
            <Button
              onClick={() => {
                if (!conversationId) {
                  toast.error('Conversation ID is required');
                  return;
                }
                sendMessageMutation.mutate({ conversationId, message: chatMessage });
              }}
              disabled={sendMessageMutation.isPending || !conversationId}
            >
              {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
            </Button>
            <details className="rounded-lg border bg-muted p-3 text-xs">
              <summary className="cursor-pointer font-medium">Latest response</summary>
              <div className="mt-2">
                {renderDataTable(chatResult)}
              </div>
            </details>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Quantum Insights</CardTitle>
            <p className="text-sm text-muted-foreground">Enter a customer ID and run an analysis.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Customer ID</label>
              <Input
                value={customerId}
                onChange={(event) => setCustomerId(event.target.value)}
                placeholder="Customer UUID"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => quantumAction.mutate('profile')}>Profile</Button>
              <Button onClick={() => quantumAction.mutate('entanglement')}>Entanglement</Button>
              <Button onClick={() => quantumAction.mutate('consciousness')}>Consciousness</Button>
              <Button onClick={() => quantumAction.mutate('behavior')}>Behavior</Button>
              <Button onClick={() => quantumAction.mutate('emotional')}>Emotional</Button>
            </div>
            <details className="rounded-lg border bg-muted p-3 text-xs">
              <summary className="cursor-pointer font-medium">Result</summary>
              <div className="mt-2">
                {renderDataTable(quantumResult)}
              </div>
            </details>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Holographic Experience</CardTitle>
            <p className="text-sm text-muted-foreground">Create a projection and start a session.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div>
                <label className="text-sm font-medium">Projection Name</label>
                <Input value={projectionName} onChange={(event) => setProjectionName(event.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Projection Type</label>
                <Select value={projectionType} onValueChange={(value) => setProjectionType(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectionTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() =>
                  createProjectionMutation.mutate({ name: projectionName, projectionType })
                }
                disabled={createProjectionMutation.isPending}
              >
                {createProjectionMutation.isPending ? 'Creating...' : 'Create Projection'}
              </Button>
            </div>
            <div className="border-t pt-4 space-y-3">
              <label className="text-sm font-medium">Session Name</label>
              <Input value={sessionName} onChange={(event) => setSessionName(event.target.value)} />
              <Button
                onClick={() => createSessionMutation.mutate({ sessionName, participantIds: [] })}
                disabled={createSessionMutation.isPending}
              >
                {createSessionMutation.isPending ? 'Creating...' : 'Start Session'}
              </Button>
              <label className="text-sm font-medium">Session ID</label>
              <Input
                value={sessionId}
                onChange={(event) => setSessionId(event.target.value)}
                placeholder="Auto-filled after start"
              />
              <details className="rounded-lg border bg-muted p-3 text-xs">
                <summary className="cursor-pointer font-medium">Session Details</summary>
                <div className="mt-2 space-y-2">
                  <div className="text-sm font-medium">Session</div>
                  {sessionQuery.isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-5/6" />
                    </div>
                  ) : (
                    renderDataTable(sessionQuery.data)
                  )}
                </div>
                <div className="mt-2 space-y-2">
                  <div className="text-sm font-medium">Analytics</div>
                  {sessionAnalyticsQuery.isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-5/6" />
                    </div>
                  ) : (
                    renderDataTable(sessionAnalyticsQuery.data)
                  )}
                </div>
              </details>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>AR/VR Showrooms</CardTitle>
            <p className="text-sm text-muted-foreground">Create and review immersive showrooms.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <label className="text-sm font-medium">Showroom Name</label>
              <Input value={showroomName} onChange={(event) => setShowroomName(event.target.value)} />
              <label className="text-sm font-medium">Experience Type</label>
              <Select value={showroomType} onValueChange={(value) => setShowroomType(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {showroomTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() =>
                  createShowroomMutation.mutate({ name: showroomName, experienceType: showroomType })
                }
                disabled={createShowroomMutation.isPending}
              >
                {createShowroomMutation.isPending ? 'Creating...' : 'Create Showroom'}
              </Button>
            </div>
            <details className="rounded-lg border bg-muted p-3 text-xs">
              <summary className="cursor-pointer font-medium">
                Showrooms ({showroomsQuery.data?.length ?? 0})
              </summary>
              <div className="mt-2">
                {showroomsQuery.isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                  </div>
                ) : (
                  renderDataTable(showroomsQuery.data)
                )}
              </div>
            </details>
            <details className="rounded-lg border bg-muted p-3 text-xs">
              <summary className="cursor-pointer font-medium">Analytics</summary>
              <div className="mt-2">
                {arvrAnalyticsQuery.isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                  </div>
                ) : (
                  renderDataTable(arvrAnalyticsQuery.data)
                )}
              </div>
            </details>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Real-time Alerts</CardTitle>
            <p className="text-sm text-muted-foreground">
              Create monitoring alerts and review live metrics.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <label className="text-sm font-medium">Alert Name</label>
              <Input value={alertName} onChange={(event) => setAlertName(event.target.value)} />
              <label className="text-sm font-medium">Threshold</label>
              <Input
                value={alertThreshold}
                onChange={(event) => setAlertThreshold(event.target.value)}
                type="number"
              />
              <label className="text-sm font-medium">Condition</label>
              <Input value={alertCondition} onChange={(event) => setAlertCondition(event.target.value)} />
              <Button
                onClick={() =>
                  createAlertMutation.mutate({
                    name: alertName,
                    threshold: Number(alertThreshold || 0),
                    condition: alertCondition,
                  })
                }
                disabled={createAlertMutation.isPending}
              >
                {createAlertMutation.isPending ? 'Creating...' : 'Create Alert'}
              </Button>
            </div>
            <details className="rounded-lg border bg-muted p-3 text-xs">
              <summary className="cursor-pointer font-medium">Live Metrics</summary>
              <div className="mt-2">
                {liveMetricsQuery.isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                  </div>
                ) : (
                  renderDataTable(liveMetricsQuery.data)
                )}
              </div>
            </details>
            <details className="rounded-lg border bg-muted p-3 text-xs">
              <summary className="cursor-pointer font-medium">
                Alerts ({alertsQuery.data?.length ?? 0})
              </summary>
              <div className="mt-2">
                {alertsQuery.isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                  </div>
                ) : (
                  renderDataTable(alertsQuery.data)
                )}
              </div>
            </details>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
