'use client';

import { useState } from 'react';
import { useUsers } from '@/hooks/use-users';
import { useOrganizations } from '@/hooks/use-organizations';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Download, FileDown, FileSpreadsheet, FileText, File } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { exportToPDF, exportToExcel, exportToWord, exportToCSV, fetchAllUsersForExport } from '@/lib/export-utils';
import { toast } from 'react-hot-toast';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [organizationId, setOrganizationId] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  
  const { data, isLoading } = useUsers({
    page,
    limit: 20,
    search,
    organizationId: organizationId !== 'all' ? organizationId : undefined,
  });

  const { data: organizations } = useOrganizations({ limit: 1000 });

  const handleExport = async (format: 'pdf' | 'excel' | 'word' | 'csv') => {
    setIsExporting(true);
    try {
      toast.loading('Preparing export...');
      
      // Fetch all users for export
      const allUsers = await fetchAllUsersForExport(
        apiClient,
        organizationId,
        search
      );

      if (allUsers.length === 0) {
        toast.error('No users to export');
        setIsExporting(false);
        return;
      }

      const selectedOrg = organizations?.data.find((org) => org.id === organizationId);
      const exportOptions = {
        organizationName: organizationId === 'all' ? undefined : selectedOrg?.name,
        organizationId: organizationId === 'all' ? undefined : organizationId,
        totalUsers: allUsers.length,
        exportedBy: 'Super Admin',
      };

      toast.dismiss();

      switch (format) {
        case 'pdf':
          await exportToPDF(allUsers, exportOptions);
          toast.success('PDF exported successfully');
          break;
        case 'excel':
          await exportToExcel(allUsers, exportOptions);
          toast.success('Excel exported successfully');
          break;
        case 'word':
          await exportToWord(allUsers, exportOptions);
          toast.success('Word exported successfully');
          break;
        case 'csv':
          await exportToCSV(allUsers, exportOptions);
          toast.success('CSV exported successfully');
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export users');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-500">Manage all users across the platform</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={isExporting || isLoading} className="gap-2">
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export Users'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Export Format</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer">
              <FileText className="h-4 w-4 mr-2 text-red-600" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel')} className="cursor-pointer">
              <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
              Export as Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('word')} className="cursor-pointer">
              <File className="h-4 w-4 mr-2 text-blue-600" />
              Export as Word
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer">
              <FileDown className="h-4 w-4 mr-2 text-gray-600" />
              Export as CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={organizationId} onValueChange={setOrganizationId}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Filter by organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Organizations</SelectItem>
            {organizations?.data.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{user.userType}</Badge>
                </TableCell>
                <TableCell>{user.organizationName || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={(user as any).isActive ? 'success' : 'secondary'}>
                    {(user as any).isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {data.data.length} of {data.total} users
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!data.hasPrevious}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={!data.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

