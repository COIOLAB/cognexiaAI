'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Pause, Play, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  useDeleteForm,
  useDuplicateForm,
  useGetEmbedCode,
  useGetForm,
  useGetFormAnalytics,
  useGetFormSubmissions,
  usePauseForm,
  usePublishForm,
} from '@/hooks/useForms';

export default function FormDetailPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;
  const { data: form, isLoading } = useGetForm(formId);
  const { data: submissions = [] } = useGetFormSubmissions(formId);
  const { data: analytics } = useGetFormAnalytics(formId);
  const { data: embedCode } = useGetEmbedCode(formId);
  const publishForm = usePublishForm();
  const pauseForm = usePauseForm();
  const duplicateForm = useDuplicateForm();
  const deleteForm = useDeleteForm();

  if (isLoading) {
    return <div className="text-muted-foreground">Loading form...</div>;
  }

  if (!form) {
    return <div className="text-muted-foreground">Form not found.</div>;
  }

  const statusVariant =
    form.status === 'PUBLISHED' ? 'default' : form.status === 'PAUSED' ? 'secondary' : 'outline';

  return (
    <div className="space-y-6">
      <PageHeader
        title={form.name}
        subtitle={form.description || 'Lead capture form'}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {form.status === 'DRAFT' && (
              <Button variant="outline" onClick={() => publishForm.mutate(formId)}>
                <Play className="mr-2 h-4 w-4" />
                Publish
              </Button>
            )}
            {form.status === 'PUBLISHED' && (
              <Button variant="outline" onClick={() => pauseForm.mutate(formId)}>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
            )}
            <Button variant="outline" onClick={() => duplicateForm.mutate(formId)}>
              Duplicate
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('Delete this form?')) {
                  deleteForm.mutate(formId, {
                    onSuccess: () => router.push('/forms'),
                  });
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={statusVariant}>{form.status}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{form.viewCount ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{form.submissionCount ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(form.conversionRate ?? 0).toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="embed">Embed</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Fields</CardTitle>
            </CardHeader>
            <CardContent>
              {form.fields?.length ? (
                <div className="rounded-md border bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Label</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Required</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {form.fields.map((field) => (
                        <TableRow key={field.id}>
                          <TableCell className="font-medium">{field.label}</TableCell>
                          <TableCell>{field.type}</TableCell>
                          <TableCell>{field.name}</TableCell>
                          <TableCell>{field.required ? 'Yes' : 'No'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No fields configured.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(submissions) && submissions.length ? (
                <div className="rounded-md border bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Lead</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission: any) => (
                        <TableRow key={submission.id}>
                          <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
                          <TableCell>{submission.leadId || '—'}</TableCell>
                          <TableCell className="max-w-[360px] truncate">
                            {JSON.stringify(submission.data)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No submissions yet.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analytics ? (
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border p-3">
                    <div className="text-sm text-muted-foreground">Views</div>
                    <div className="text-xl font-semibold">{analytics.viewCount ?? form.viewCount ?? 0}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-sm text-muted-foreground">Submissions</div>
                    <div className="text-xl font-semibold">{analytics.submissionCount ?? form.submissionCount ?? 0}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-sm text-muted-foreground">Conversion</div>
                    <div className="text-xl font-semibold">
                      {(analytics.conversionRate ?? form.conversionRate ?? 0).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Analytics not available.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed">
          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea readOnly value={embedCode?.code || embedCode || ''} rows={8} />
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    const value = embedCode?.code || embedCode || '';
                    if (value) {
                      navigator.clipboard.writeText(value);
                    }
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Embed Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
