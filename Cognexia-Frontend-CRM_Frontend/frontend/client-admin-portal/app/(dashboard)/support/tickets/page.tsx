'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { useDeleteTicket, useGetTickets, useGetTicketStatistics } from '@/hooks/useSupportTickets';
import { ColumnDef } from '@tanstack/react-table';
import { SupportTicket } from '@/types/api.types';
import { formatDistanceToNow } from 'date-fns';
import { Plus, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/PageHeader';
import { KpiCard } from '@/components/KpiCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function SupportTicketsPage() {
  const { data: ticketsData, isLoading } = useGetTickets();
  const { data: stats } = useGetTicketStatistics();
  const deleteTicket = useDeleteTicket();

  const columns: ColumnDef<SupportTicket>[] = [
    {
      accessorKey: 'ticketNumber',
      header: 'Ticket #',
      cell: ({ row }) => (
        <Link href={`/support/tickets/${row.original.id}`} className="font-medium hover:underline">
          #{row.original.ticketNumber}
        </Link>
      ),
    },
    {
      accessorKey: 'subject',
      header: 'Subject',
      cell: ({ row }) => <div className="max-w-md truncate">{row.original.subject}</div>,
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.status.replace('_', ' ')}</Badge>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const priority = row.original.priority;
        return (
          <Badge
            variant={
              priority === 'critical' || priority === 'urgent'
                ? 'destructive'
                : priority === 'high'
                ? 'default'
                : 'secondary'
            }
          >
            {priority}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'assignedToName',
      header: 'Assigned To',
      cell: ({ row }) => row.original.assignedToName || 'Unassigned',
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true }),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/support/tickets/${row.original.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                if (confirm('Delete this ticket?')) {
                  deleteTicket.mutate(row.original.id);
                }
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Tickets"
        subtitle="Track and manage customer issues."
        actions={
          <Button asChild>
            <Link href="/support/new">
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard title="Total Tickets" value={stats?.total || 0} />
        <KpiCard title="Open" value={<span className="text-blue-600">{stats?.open || 0}</span>} />
        <KpiCard
          title="In Progress"
          value={<span className="text-orange-600">{stats?.inProgress || 0}</span>}
        />
        <KpiCard
          title="Avg Satisfaction"
          value={
            <span className="text-green-600">
              {stats?.avgSatisfactionRating?.toFixed(1) || '0.0'}/5
            </span>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {ticketsData?.data?.length === 0 ? (
            <div className="text-sm text-muted-foreground">No tickets yet.</div>
          ) : (
            <DataTable columns={columns} data={ticketsData?.data || []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
