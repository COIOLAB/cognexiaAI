'use client';

import { Plus, Eye, Copy, Play, Pause, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { useGetForms, useDeleteForm, usePublishForm, usePauseForm, useDuplicateForm } from '@/hooks/useForms';
import Link from 'next/link';
import { format } from 'date-fns';

export default function FormsPage() {
  const { data: forms, isLoading } = useGetForms();
  const deleteForm = useDeleteForm();
  const publishForm = usePublishForm();
  const pauseForm = usePauseForm();
  const duplicateForm = useDuplicateForm();

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-500',
    PUBLISHED: 'bg-green-500',
    PAUSED: 'bg-yellow-500',
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Form Name',
      cell: ({ row }: any) => (
        <div>
          <Link
            href={`/forms/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
          {row.original.description && (
            <p className="text-sm text-muted-foreground">
              {row.original.description}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge className={statusColors[row.original.status]}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'fields',
      header: 'Fields',
      cell: ({ row }: any) => row.original.fields?.length || 0,
    },
    {
      accessorKey: 'submissionCount',
      header: 'Submissions',
      cell: ({ row }: any) => row.original.submissionCount || 0,
    },
    {
      accessorKey: 'viewCount',
      header: 'Views',
      cell: ({ row }: any) => row.original.viewCount || 0,
    },
    {
      accessorKey: 'conversionRate',
      header: 'Conversion',
      cell: ({ row }: any) => {
        const rate = row.original.conversionRate || 0;
        return <span>{rate.toFixed(1)}%</span>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }: any) => format(new Date(row.original.createdAt), 'MMM dd, yyyy'),
    },
    {
      id: 'actions',
      cell: ({ row }: any) => (
        <div className="flex gap-1">
          {row.original.status === 'DRAFT' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => publishForm.mutate(row.original.id)}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          {row.original.status === 'PUBLISHED' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => pauseForm.mutate(row.original.id)}
            >
              <Pause className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => duplicateForm.mutate(row.original.id)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Delete this form?')) {
                deleteForm.mutate(row.original.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const stats = {
    total: forms?.length || 0,
    published: forms?.filter(f => f.status === 'PUBLISHED').length || 0,
    submissions: forms?.reduce((sum, f) => sum + (f.submissionCount || 0), 0) || 0,
    avgConversion: forms?.length
      ? (forms.reduce((sum, f) => sum + (f.conversionRate || 0), 0) / forms.length).toFixed(1)
      : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lead Capture Forms</h1>
          <p className="text-muted-foreground">
            Create and manage forms to capture leads from your website
          </p>
        </div>
        <Button asChild>
          <Link href="/forms/builder">
            <Plus className="mr-2 h-4 w-4" />
            Create Form
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.submissions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgConversion}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Forms</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={forms || []} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
