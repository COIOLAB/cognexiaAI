'use client';

import { useState } from 'react';
import { Plus, Play } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetSchedules, useRunScheduleNow, useDeleteSchedule, useCreateSchedule } from '@/hooks/useReportSchedules';
import { useGetReports } from '@/hooks/useReports';
import type { ReportSchedule } from '@/types/api.types';
import { DeliveryFormat, ScheduleFrequency } from '@/types/api.types';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { PageHeader } from '@/components/PageHeader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function ReportSchedulesPage() {
  const { data: schedulesData, isLoading } = useGetSchedules();
  const { data: reportsData } = useGetReports();
  const runNow = useRunScheduleNow();
  const deleteSchedule = useDeleteSchedule();
  const createSchedule = useCreateSchedule();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [reportId, setReportId] = useState('');
  const [frequency, setFrequency] = useState<ScheduleFrequency>(ScheduleFrequency.WEEKLY);
  const [deliveryFormat, setDeliveryFormat] = useState<DeliveryFormat>(DeliveryFormat.PDF);
  const [recipients, setRecipients] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');

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

  const recipientsList = recipients
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const isFormValid = Boolean(name.trim() && reportId && recipientsList.length && scheduleTime);

  const columns: ColumnDef<ReportSchedule>[] = [
    {
      accessorKey: 'name',
      header: 'Schedule Name',
    },
    {
      accessorKey: 'frequency',
      header: 'Frequency',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.frequency}</Badge>
      ),
    },
    {
      accessorKey: 'format',
      header: 'Format',
      cell: ({ row }) => row.original.format.toUpperCase(),
    },
    {
      accessorKey: 'recipients',
      header: 'Recipients',
      cell: ({ row }) => row.original.recipients.length,
    },
    {
      accessorKey: 'nextRunAt',
      header: 'Next Run',
      cell: ({ row }) =>
        row.original.nextRunAt
          ? format(new Date(row.original.nextRunAt), 'MMM dd, h:mm a')
          : '-',
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => runNow.mutate(row.original.id)}
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Delete this schedule?')) {
                deleteSchedule.mutate(row.original.id);
              }
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <PageHeader
          title="Report Schedules"
          subtitle="Manage automated report delivery"
          actions={
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Schedule
            </Button>
          }
        />

      <Card>
        <CardHeader>
          <CardTitle>All Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={schedulesData?.data || []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <FieldLabel label="Schedule Name" tooltip="Friendly name for the schedule." />
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Weekly pipeline report" />
            </div>
            <div>
              <FieldLabel label="Report" tooltip="Select the report to deliver." />
              <Select value={reportId} onValueChange={setReportId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report" />
                </SelectTrigger>
                <SelectContent>
                  {reportsData?.data?.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      {report.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <FieldLabel label="Frequency" tooltip="How often to deliver." />
                <Select value={frequency} onValueChange={(value) => setFrequency(value as ScheduleFrequency)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ScheduleFrequency).map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel label="Format" tooltip="Delivery format." />
                <Select value={deliveryFormat} onValueChange={(value) => setDeliveryFormat(value as DeliveryFormat)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DeliveryFormat).map((value) => (
                      <SelectItem key={value} value={value}>
                        {value.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <FieldLabel label="Recipients" tooltip="Comma separated email addresses." />
              <Input
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="ops@example.com, finance@example.com"
              />
            </div>
            <div>
              <FieldLabel label="Schedule Time" tooltip="Time of day for delivery." />
              <Input value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} type="time" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!isFormValid) return;
                createSchedule.mutate(
                  {
                    name: name.trim(),
                    reportId,
                    frequency,
                    format: deliveryFormat,
                    recipients: recipientsList,
                    scheduleTime,
                  },
                  {
                    onSuccess: () => {
                      setOpen(false);
                      setName('');
                      setReportId('');
                      setRecipients('');
                    },
                  },
                );
              }}
              disabled={createSchedule.isPending || !isFormValid}
            >
              {createSchedule.isPending ? 'Creating...' : 'Create Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </TooltipProvider>
  );
}
