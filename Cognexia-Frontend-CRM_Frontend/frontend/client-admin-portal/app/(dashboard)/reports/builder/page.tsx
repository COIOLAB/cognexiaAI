'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateReport } from '@/hooks/useReports';
import { ChartType, ReportType } from '@/types/api.types';
import { PageHeader } from '@/components/PageHeader';

export default function ReportBuilderPage() {
  const router = useRouter();
  const createReport = useCreateReport();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [reportType, setReportType] = useState<ReportType>(ReportType.SALES);
  const [chartType, setChartType] = useState<ChartType>(ChartType.BAR);
  const [entity, setEntity] = useState('crm_opportunities');
  const [columns, setColumns] = useState('name,stage,value,probability');
  const [groupBy, setGroupBy] = useState('');
  const [orderByField, setOrderByField] = useState('createdAt');
  const [orderByDirection, setOrderByDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [limit, setLimit] = useState('100');
  const [isPublic, setIsPublic] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const isFormValid = Boolean(name.trim() && columns.trim());

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error('Report name is required');
      return;
    }

    const parsedColumns = columns
      .split(',')
      .map((col) => col.trim())
      .filter(Boolean);

    if (!parsedColumns.length) {
      toast.error('Please provide at least one column');
      return;
    }

    createReport.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        reportType,
        chartType,
        isPublic,
        isFavorite,
        config: {
          entity,
          columns: parsedColumns,
          groupBy: groupBy.trim() || undefined,
          orderBy: orderByField
            ? { field: orderByField, direction: orderByDirection }
            : undefined,
          limit: limit ? Number(limit) : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success('Report created');
          router.push('/reports');
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report Builder"
        subtitle="Create custom reports"
        actions={
          <Button variant="outline" asChild>
            <Link href="/reports">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Custom Report Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Report Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sales Pipeline" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this report shows"
                  rows={3}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Report Type</label>
                  <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ReportType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Chart Type</label>
                  <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ChartType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox checked={isPublic} onCheckedChange={(val) => setIsPublic(Boolean(val))} />
                <span className="text-sm">Make report public</span>
                <Checkbox checked={isFavorite} onCheckedChange={(val) => setIsFavorite(Boolean(val))} />
                <span className="text-sm">Mark as favorite</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Entity</label>
                <Input value={entity} onChange={(e) => setEntity(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Columns (comma separated)</label>
                <Input value={columns} onChange={(e) => setColumns(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Group By</label>
                <Input value={groupBy} onChange={(e) => setGroupBy(e.target.value)} placeholder="stage" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Order By Field</label>
                  <Input
                    value={orderByField}
                    onChange={(e) => setOrderByField(e.target.value)}
                    placeholder="createdAt"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Order Direction</label>
                  <Select
                    value={orderByDirection}
                    onValueChange={(value) => setOrderByDirection(value as 'ASC' | 'DESC')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ASC">ASC</SelectItem>
                      <SelectItem value="DESC">DESC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Limit</label>
                <Input value={limit} onChange={(e) => setLimit(e.target.value)} type="number" min="1" />
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" asChild>
              <Link href="/reports">Cancel</Link>
            </Button>
            <Button onClick={handleCreate} disabled={createReport.isPending || !isFormValid}>
              {createReport.isPending ? 'Creating...' : 'Create Report'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
