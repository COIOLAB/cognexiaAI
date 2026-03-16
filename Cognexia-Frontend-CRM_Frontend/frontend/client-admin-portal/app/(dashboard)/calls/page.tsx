'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneIncoming, PhoneOutgoing, Clock, Search } from 'lucide-react';
import { useGetCalls } from '@/hooks/useCalls';
import { useTelephonyLive } from '@/hooks/useTelephonyLive';
import { CallStatus, CallDirection, type Call } from '@/types/api.types';
import { format } from 'date-fns';
import ClickToCall from '@/components/ClickToCall';

export default function CallsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDialer, setShowDialer] = useState(false);
  
  const { data: callsData, isLoading } = useGetCalls();
  const calls: Call[] = Array.isArray(callsData)
    ? callsData
    : (callsData as any)?.data || (callsData as any)?.calls || [];
  useTelephonyLive();

  const filteredCalls = calls.filter((call) => {
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
    const matchesDirection = directionFilter === 'all' || call.direction === directionFilter;
    const matchesSearch = !searchQuery || 
      call.toNumber?.includes(searchQuery) ||
      call.fromNumber?.includes(searchQuery) ||
      call.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesDirection && matchesSearch;
  });

  const totalCalls = calls.length;
  const answeredCalls = calls.filter(c => c.status === CallStatus.IN_PROGRESS || c.status === CallStatus.COMPLETED).length;
  const missedCalls = calls.filter(c => c.status === CallStatus.MISSED).length;
  const avgDuration = calls.length > 0 
    ? Math.round(calls.reduce((sum, c) => sum + (c.duration || 0), 0) / calls.length)
    : 0;

  const getStatusBadge = (status: CallStatus) => {
    const variants: Record<CallStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      [CallStatus.INITIATED]: 'secondary',
      [CallStatus.RINGING]: 'secondary',
      [CallStatus.IN_PROGRESS]: 'default',
      [CallStatus.COMPLETED]: 'default',
      [CallStatus.BUSY]: 'destructive',
      [CallStatus.NO_ANSWER]: 'destructive',
      [CallStatus.FAILED]: 'destructive',
      [CallStatus.MISSED]: 'destructive',
      [CallStatus.ON_HOLD]: 'secondary',
      [CallStatus.VOICEMAIL]: 'outline',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const columns = [
    {
      accessorKey: 'direction',
      header: 'Direction',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {row.original.direction === CallDirection.INBOUND ? (
            <PhoneIncoming className="h-4 w-4 text-green-500" />
          ) : (
            <PhoneOutgoing className="h-4 w-4 text-blue-500" />
          )}
          <span className="capitalize">{row.original.direction?.toLowerCase()}</span>
        </div>
      ),
    },
    {
      accessorKey: 'phoneNumber',
      header: 'Phone',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.phoneNumber}</div>
          {row.original.customerName && (
            <div className="text-sm text-muted-foreground">{row.original.customerName}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'startTime',
      header: 'Time',
      cell: ({ row }: any) => row.original.startTime 
        ? format(new Date(row.original.startTime), 'MMM dd, HH:mm')
        : 'N/A',
    },
    {
      accessorKey: 'duration',
      header: 'Duration',
      cell: ({ row }: any) => {
        const duration = row.original.duration || 0;
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      },
    },
    {
      accessorKey: 'disposition',
      header: 'Disposition',
      cell: ({ row }: any) => row.original.disposition || 'N/A',
    },
    {
      id: 'contactNumber',
      header: 'Phone Number',
      cell: ({ row }: any) => row.original.toNumber || row.original.fromNumber,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/calls/${row.original.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Call Center</h1>
          <p className="text-muted-foreground">Manage and monitor your calls</p>
        </div>
        <Button onClick={() => setShowDialer((v) => !v)}>
          <Phone className="mr-2 h-4 w-4" />
          {showDialer ? 'Hide Dialer' : 'New Call'}
        </Button>
      </div>

      {showDialer && (
        <ClickToCall className="border" />
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalls}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Answered</CardTitle>
            <PhoneIncoming className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{answeredCalls}</div>
            <p className="text-xs text-muted-foreground">
              {totalCalls > 0 ? Math.round((answeredCalls / totalCalls) * 100) : 0}% answer rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missed</CardTitle>
            <PhoneOutgoing className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missedCalls}</div>
            <p className="text-xs text-muted-foreground">
              {totalCalls > 0 ? Math.round((missedCalls / totalCalls) * 100) : 0}% missed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(avgDuration / 60)}:{(avgDuration % 60).toString().padStart(2, '0')}
            </div>
            <p className="text-xs text-muted-foreground">Minutes</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by phone or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.values(CallStatus).map((status) => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={directionFilter} onValueChange={setDirectionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Direction</SelectItem>
            <SelectItem value={CallDirection.INBOUND}>Inbound</SelectItem>
            <SelectItem value={CallDirection.OUTBOUND}>Outbound</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={filteredCalls}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
