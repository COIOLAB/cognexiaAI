'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCreateTemplate, useGetTemplates, useTemplateStats } from '@/hooks/useEmailTemplates';
import { PageHeader } from '@/components/PageHeader';
import { KpiCard } from '@/components/KpiCard';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TemplateCategory } from '@/types/api.types';
import Link from 'next/link';

export default function TemplatesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: templatesData, isLoading, isFetching } = useGetTemplates({ page, limit });
  const { data: statsData } = useTemplateStats();
  const createTemplate = useCreateTemplate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TemplateCategory>(TemplateCategory.NEWSLETTER);
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [bodyText, setBodyText] = useState('');

  const stats = statsData?.data || {
    totalTemplates: 0,
    activeTemplates: 0,
    draftTemplates: 0,
  };

  const paginationPayload = templatesData?.data || {};
  const templates = Array.isArray(paginationPayload)
    ? paginationPayload
    : paginationPayload.templates || [];
  const total = paginationPayload.total ?? templates.length;
  const effectiveLimit = paginationPayload.limit || limit;
  const totalPages =
    paginationPayload.totalPages ||
    (effectiveLimit ? Math.max(1, Math.ceil(total / effectiveLimit)) : 1);
  const rangeStart = total === 0 ? 0 : (page - 1) * effectiveLimit + 1;
  const rangeEnd = Math.min(total, page * effectiveLimit);

  const isFormValid = Boolean(name.trim() && subject.trim() && bodyHtml.trim());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Templates"
        subtitle="Create and manage reusable email templates."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard title="Total Templates" value={stats.totalTemplates || 0} />
        <KpiCard title="Active" value={stats.activeTemplates || 0} />
        <KpiCard title="Draft" value={stats.draftTemplates || 0} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading templates...</div>
          ) : templates.length > 0 ? (
            templates.map((template: any) => (
              <Link
                key={template.id}
                href={`/marketing/templates/${template.id}`}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
              >
                <div>
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {template.subject || 'Template'}
                  </div>
                </div>
                <Badge variant={template.isActive ? 'default' : 'secondary'}>
                  {template.isActive ? 'Active' : 'Draft'}
                </Badge>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No templates found.</p>
          )}

          {templates.length > 0 && (
            <div className="flex flex-wrap items-center justify-between px-2 pt-2 text-sm text-muted-foreground">
              <div className="flex-1">
                {total > 0 && (
                  <span>
                    {rangeStart}–{rangeEnd} of {total}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Rows per page</p>
                  <Select
                    value={String(limit)}
                    onValueChange={(val) => {
                      const newLimit = Number(val) || 10;
                      setLimit(newLimit);
                      setPage(1);
                    }}
                    disabled={isFetching}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue placeholder={limit} />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[10, 20, 30, 40, 50].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                  Page {page} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || isFetching}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || isFetching}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Template Name</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Welcome email" />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={(value) => setCategory(value as TemplateCategory)}>
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
              <Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Welcome to CognexiaAI" />
            </div>
            <div>
              <label className="text-sm font-medium">Body HTML</label>
              <Textarea value={bodyHtml} onChange={(event) => setBodyHtml(event.target.value)} rows={4} />
            </div>
            <div>
              <label className="text-sm font-medium">Body Text (optional)</label>
              <Textarea value={bodyText} onChange={(event) => setBodyText(event.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!isFormValid) return;
                createTemplate.mutate(
                  {
                    name: name.trim(),
                    category,
                    subject: subject.trim(),
                    bodyHtml,
                    bodyText: bodyText || undefined,
                  },
                  {
                    onSuccess: () => {
                      setOpen(false);
                      setName('');
                      setSubject('');
                      setBodyHtml('');
                      setBodyText('');
                    },
                  },
                );
              }}
              disabled={createTemplate.isPending || !isFormValid}
            >
              {createTemplate.isPending ? 'Creating...' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
