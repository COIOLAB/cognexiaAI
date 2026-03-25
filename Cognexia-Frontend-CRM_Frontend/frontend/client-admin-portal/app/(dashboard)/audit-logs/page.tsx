'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  History, 
  Search, 
  Filter, 
  RefreshCw, 
  User, 
  Database, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { auditLogApi } from '@/services/auditLog.api';
import { PageHeader } from '@/components/PageHeader';
import { AuditLog } from '@/types/api.types';
import { useAuthStore } from '@/stores/auth-store';

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-700 border-green-200',
  update: 'bg-blue-100 text-blue-700 border-blue-200',
  delete: 'bg-red-100 text-red-700 border-red-200',
  login:  'bg-purple-100 text-purple-700 border-purple-200',
  logout: 'bg-slate-100 text-slate-700 border-slate-200',
  export: 'bg-amber-100 text-amber-700 border-amber-200',
  approve:'bg-teal-100 text-teal-700 border-teal-200',
  reject: 'bg-rose-100 text-rose-700 border-rose-200',
};

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  // get current org from auth
  const user = useAuthStore((s) => s.user);
  const organizationId = user?.organizationId;

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['audit-logs', organizationId, page, limit, actionFilter, entityFilter],
    queryFn: () =>
      auditLogApi.list({
        page,
        limit,
        organizationId,
        action: actionFilter === 'all' ? undefined : actionFilter,
        entityType: entityFilter === 'all' ? undefined : entityFilter,
      }),
    enabled: !!organizationId,
  });

  const logs: AuditLog[] = data?.data || [];
  const totalPages: number = data?.totalPages || 1;

  const badgeClass = (action: string) =>
    ACTION_COLORS[action?.toLowerCase()] ?? 'bg-slate-100 text-slate-700 border-slate-200';

  const formatDate = (d: string) => {
    try { return format(new Date(d), 'yyyy-MM-dd HH:mm:ss'); } catch { return d; }
  };

  const filterLogs = search
    ? logs.filter(
        (l) =>
          l.entity_type?.toLowerCase().includes(search.toLowerCase()) ||
          l.action?.toLowerCase().includes(search.toLowerCase()) ||
          l.metadata?.description?.toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        subtitle="Chronological record of all member actions and system events."
        actions={
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {/* Filters */}
      <Card className="border-blue-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Action</label>
              <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="All Actions" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="approve">Approve</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Entity Type</label>
              <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="All Entities" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="opportunity">Opportunity</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="sales-order">Sales Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quick Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by description or entity..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-blue-100 shadow-md overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead className="w-[160px]">Performed By</TableHead>
              <TableHead className="w-[110px]">Action</TableHead>
              <TableHead className="w-[120px]">Entity</TableHead>
              <TableHead>Description / Metadata Key</TableHead>
              <TableHead className="text-right w-[60px]">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filterLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <History className="h-10 w-10 mx-auto mb-2 text-gray-200" />
                  No audit logs found.
                </TableCell>
              </TableRow>
            ) : (
              filterLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="text-xs font-mono text-gray-500 whitespace-nowrap">
                    {formatDate(log.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium truncate max-w-[130px]">
                        {log.user_email || log.user_id?.split('-')[0] || 'System'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase font-bold py-0.5 ${badgeClass(log.action as string)}`}
                    >
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Database className="h-3 w-3 text-gray-400" />
                      <span className="text-xs font-medium capitalize">{log.entity_type || '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-700 truncate max-w-xs">
                    {log.metadata?.description || log.entity_id || '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto">
                        <DialogHeader className="border-b pb-3">
                          <DialogTitle className="flex items-center gap-2 text-base">
                            <Activity className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            Audit Log Details
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-1">
                          {/* Key fields grid */}
                          <div className="grid grid-cols-2 gap-2">
                            <InfoRow label="Action" value={log.action as string} highlight />
                            <InfoRow label="Status" value={log.status} />
                            <InfoRow label="Entity Type" value={log.entity_type} />
                            <InfoRow label="Entity ID" value={log.entity_id} truncate />
                            <InfoRow label="Performed By" value={log.user_email || log.user_id} truncate />
                            <InfoRow label="IP Address" value={log.ip_address} />
                            <InfoRow label="Timestamp" value={formatDate(log.created_at)} />
                            <InfoRow label="Log ID" value={log.id} truncate />
                          </div>

                          {/* Metadata */}
                          {log.metadata && (
                            <div className="rounded-lg border border-slate-700 bg-slate-950 overflow-hidden">
                              <div className="px-4 py-2 border-b border-slate-700 flex items-center gap-2">
                                <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Metadata</span>
                              </div>
                              <pre className="text-green-400 text-xs p-4 overflow-auto max-h-48 leading-relaxed whitespace-pre-wrap break-words">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          )}

                          {/* User Agent */}
                          {log.user_agent && (
                            <div className="rounded-lg bg-slate-50 border p-3">
                              <span className="text-gray-400 block text-[10px] uppercase font-bold mb-1">User Agent</span>
                              <p className="text-[10px] text-gray-500 break-all leading-relaxed">{log.user_agent}</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t">
          <p className="text-sm text-muted-foreground">
            {isLoading ? '—' : `${filterLogs.length} entries on this page`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="h-8 px-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold px-2">Page {page} of {totalPages}</span>
            <Button
              variant="outline" size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
              className="h-8 px-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function InfoRow({ label, value, highlight, truncate }: { 
  label: string; 
  value?: string | null; 
  highlight?: boolean;
  truncate?: boolean;
}) {
  return (
    <div className="rounded-lg bg-slate-50 border p-3">
      <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-1">{label}</span>
      <span className={`text-xs font-mono break-all ${highlight ? 'text-blue-700 font-semibold uppercase' : 'text-slate-700'} ${truncate ? 'block truncate' : ''}`}>
        {value ?? '—'}
      </span>
    </div>
  );
}
