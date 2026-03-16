'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Copy, Send, Trash2, PencilLine, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  useDeleteTemplate,
  useDuplicateTemplate,
  useGetTemplate,
  useTemplateUsage,
  useTestTemplate,
  useUpdateTemplate,
} from '@/hooks/useEmailTemplates';
import { TemplateCategory } from '@/types/api.types';

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;
  const { data, isLoading } = useGetTemplate(templateId);
  const { data: usageData } = useTemplateUsage(templateId);
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const duplicateTemplate = useDuplicateTemplate();
  const testTemplate = useTestTemplate();

  const template = (data as any)?.data ?? data;
  const usage = (usageData as any)?.data ?? usageData;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<TemplateCategory>(TemplateCategory.NEWSLETTER);
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (template && !isEditing) {
      setName(template.name || '');
      setCategory(template.category || TemplateCategory.NEWSLETTER);
      setSubject(template.subject || '');
      setBodyHtml(template.bodyHtml || '');
      setBodyText(template.bodyText || '');
      setIsActive(Boolean(template.isActive));
    }
  }, [template, isEditing]);

  const variables = Array.isArray(template?.variables) ? template.variables : [];
  const isFormValid = Boolean(name.trim() && subject.trim() && bodyHtml.trim());

  if (isLoading) {
    return <div className="text-muted-foreground">Loading template...</div>;
  }

  if (!template) {
    return <div className="text-muted-foreground">Template not found.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Template Details"
        subtitle={template.name}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/marketing/templates">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <PencilLine className="mr-2 h-4 w-4" />
                Edit
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setName(template.name || '');
                  setCategory(template.category || TemplateCategory.NEWSLETTER);
                  setSubject(template.subject || '');
                  setBodyHtml(template.bodyHtml || '');
                  setBodyText(template.bodyText || '');
                  setIsActive(Boolean(template.isActive));
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => duplicateTemplate.mutate(templateId)}
              disabled={duplicateTemplate.isPending}
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('Delete this template?')) {
                  deleteTemplate.mutate(templateId, {
                    onSuccess: () => router.push('/marketing/templates'),
                  });
                }
              }}
              disabled={deleteTemplate.isPending}
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
            <CardTitle className="text-sm">Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{template.category}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? 'Active' : 'Draft'}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Usage Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{template.usageCount ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Template Name</label>
            <Input value={name} onChange={(event) => setName(event.target.value)} readOnly={!isEditing} />
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as TemplateCategory)}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(TemplateCategory).map((value) => (
                  <SelectItem key={value} value={value}>
                    {value.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Subject</label>
            <Input value={subject} onChange={(event) => setSubject(event.target.value)} readOnly={!isEditing} />
          </div>
          <div>
            <label className="text-sm font-medium">Body HTML</label>
            <Textarea
              value={bodyHtml}
              onChange={(event) => setBodyHtml(event.target.value)}
              rows={6}
              readOnly={!isEditing}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Body Text</label>
            <Textarea
              value={bodyText}
              onChange={(event) => setBodyText(event.target.value)}
              rows={4}
              readOnly={!isEditing}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div>
              <div className="text-sm font-medium">Active</div>
              <div className="text-xs text-muted-foreground">Enable this template for campaigns.</div>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} disabled={!isEditing} />
          </div>
          {isEditing && (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setName(template.name || '');
                  setCategory(template.category || TemplateCategory.NEWSLETTER);
                  setSubject(template.subject || '');
                  setBodyHtml(template.bodyHtml || '');
                  setBodyText(template.bodyText || '');
                  setIsActive(Boolean(template.isActive));
                }}
              >
                Discard
              </Button>
              <Button
                onClick={() =>
                  updateTemplate.mutate(
                    {
                      id: templateId,
                      data: {
                        name: name.trim(),
                        category,
                        subject: subject.trim(),
                        bodyHtml,
                        bodyText: bodyText || undefined,
                        isActive,
                      },
                    },
                    {
                      onSuccess: () => {
                        setIsEditing(false);
                      },
                    }
                  )
                }
                disabled={!isFormValid || updateTemplate.isPending}
              >
                {updateTemplate.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Template Variables</CardTitle>
        </CardHeader>
        <CardContent>
          {variables.length ? (
            <div className="rounded-md border bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variables.map((variable: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{variable.name}</TableCell>
                      <TableCell>{variable.type}</TableCell>
                      <TableCell>{variable.defaultValue ?? '—'}</TableCell>
                      <TableCell>{variable.description ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No variables detected.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Template</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            value={testEmail}
            onChange={(event) => setTestEmail(event.target.value)}
            placeholder="test@example.com"
          />
          <Button
            onClick={() => testEmail && testTemplate.mutate({ id: templateId, email: testEmail })}
            disabled={!testEmail || testTemplate.isPending}
          >
            <Send className="mr-2 h-4 w-4" />
            {testTemplate.isPending ? 'Sending...' : 'Send Test'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(usage) && usage.length ? (
            <div className="rounded-md border bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Opened</TableHead>
                    <TableHead>Last Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usage.map((row: any, index: number) => (
                    <TableRow key={row.id || index}>
                      <TableCell className="font-medium">{row.campaignName || row.name || 'Campaign'}</TableCell>
                      <TableCell>{row.sent ?? '—'}</TableCell>
                      <TableCell>{row.opened ?? '—'}</TableCell>
                      <TableCell>{row.lastUsed || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No usage history yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
