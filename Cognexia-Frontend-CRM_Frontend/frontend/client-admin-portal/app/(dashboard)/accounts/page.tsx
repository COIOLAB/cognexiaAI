'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, Download, Trash2, Building, DollarSign, TrendingUp, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Account, AccountType, AccountStatus } from '@/types/api.types';
import {
  useAccounts,
  useAccountStats,
  useDeleteAccount,
  useBulkDeleteAccounts,
  useExportAccounts,
} from '@/hooks/useAccounts';
import { createAccount, getAccounts } from '@/services/account.api';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const typeStyles: Record<AccountType, string> = {
  [AccountType.PROSPECT]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [AccountType.CUSTOMER]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [AccountType.PARTNER]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  [AccountType.COMPETITOR]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  [AccountType.VENDOR]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [AccountType.RESELLER]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
};

const statusStyles: Record<AccountStatus, string> = {
  [AccountStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [AccountStatus.INACTIVE]: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  [AccountStatus.POTENTIAL]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [AccountStatus.LOST]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  [AccountStatus.CHURNED]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
};

type ImportableAccountRow = Partial<Account> & {
  name: string;
  industry?: string;
  description?: string;
  phone?: string;
  parentAccountId?: string;
  accountNumber?: string;
  website?: string;
  type?: AccountType;
  status?: AccountStatus;
};

const accountTypeValues = new Set<string>(Object.values(AccountType));
const accountStatusValues = new Set<string>(Object.values(AccountStatus));

const normalizeValue = (value?: string | null) => (value ?? '').trim().toLowerCase();

const normalizeHeader = (header: string) =>
  header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const accountTemplateHeaders = [
  'account name',
  'description',
  'industry',
  'phone',
  'parent account id',
  'website',
];

const accountTemplateSampleRow = [
  'Acme Corporation',
  'Strategic enterprise account',
  'Technology',
  '+1 555 123 4567',
  'PARENT-001',
  'https://acme.example.com',
];

const splitCsvLine = (line: string) => {
  const values: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === ',' && !insideQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
};

const parseCsvContent = (content: string) => {
  const sanitizedContent = content.replace(/^\uFEFF/, '');
  const lines = sanitizedContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error('CSV file must include a header row and at least one data row.');
  }

  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  const accounts: ImportableAccountRow[] = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const values = splitCsvLine(lines[lineIndex]);
    const row: Record<string, string> = {};

    headers.forEach((header, headerIndex) => {
      row[header] = values[headerIndex]?.trim() ?? '';
    });

    const name = row.name || row.accountname;
    const description = row.description || row.accountdescription;
    const industry = row.industry;
    const phone = row.phone || row.phonenumber || row.mobile;
    const parentAccountId = row.parentaccountid || row.parentaccount || row.parentid;
    const accountNumber = row.accountnumber || row.accountno || row.account || row.accountid;
    const website = row.website || row.site || row.url;
    const rawType = (row.type || '').toLowerCase();
    const rawStatus = (row.status || '').toLowerCase();

    if (!name) {
      throw new Error(`Row ${lineIndex + 1} is missing the required field: account name.`);
    }

    if (website) {
      try {
        new URL(website);
      } catch {
        throw new Error(`Row ${lineIndex + 1} has an invalid website URL.`);
      }
    }

    if (rawType && !accountTypeValues.has(rawType)) {
      throw new Error(`Row ${lineIndex + 1} has an invalid type value: ${row.type}.`);
    }

    if (rawStatus && !accountStatusValues.has(rawStatus)) {
      throw new Error(`Row ${lineIndex + 1} has an invalid status value: ${row.status}.`);
    }

    accounts.push({
      accountNumber: accountNumber || undefined,
      name,
      description: description || undefined,
      industry: industry || undefined,
      phone: phone || undefined,
      parentAccountId: parentAccountId || undefined,
      parentAccount: parentAccountId || undefined,
      website: website || undefined,
      type: rawType ? (rawType as AccountType) : AccountType.PROSPECT,
      status: rawStatus ? (rawStatus as AccountStatus) : AccountStatus.POTENTIAL,
      details:
        description || phone
          ? {
              ...(description ? { description } : {}),
              ...(phone ? { phone } : {}),
            }
          : undefined,
    });
  }

  return accounts;
};

const buildBusinessDuplicateKey = (row: {
  name: string;
  industry?: string;
  website?: string;
  parentAccountId?: string;
}) =>
  [
    normalizeValue(row.name),
    normalizeValue(row.industry),
    normalizeValue(row.website),
    normalizeValue(row.parentAccountId),
  ].join('|');

const buildImportedAccountNumber = (rowIndex: number) =>
  `ACC-IMP-${Date.now()}-${rowIndex + 1}-${Math.floor(Math.random() * 1000)}`;

export default function AccountsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const resolvedType = typeFilter === 'all' ? undefined : (typeFilter as AccountType);
  const resolvedStatus = statusFilter === 'all' ? undefined : (statusFilter as AccountStatus);

  const { data, error, isPending } = useAccounts({
    page: 1,
    limit: 25,
    search: search || undefined,
    type: resolvedType,
    status: resolvedStatus,
  });

  const { data: stats } = useAccountStats();
  const deleteMutation = useDeleteAccount();
  const bulkDeleteMutation = useBulkDeleteAccounts();
  const exportMutation = useExportAccounts();

  const columns: ColumnDef<Account>[] = [
    {
      accessorKey: 'accountNumber',
      header: 'Account #',
      cell: ({ row }) => (
        <span className="font-medium text-blue-600 dark:text-blue-400">
          {row.original.accountNumber}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Account Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.industry}</div>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge className={typeStyles[row.original.type]} variant="secondary">
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={statusStyles[row.original.status]} variant="secondary">
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'revenue',
      header: 'Revenue',
      cell: ({ row }) => (
        <span className="font-semibold">
          ${(Number(row.original.revenue ?? 0) / 1000000).toFixed(1)}M
        </span>
      ),
    },
    {
      accessorKey: 'owner',
      header: 'Owner',
      cell: ({ row }) => row.original.owner,
    },
    {
      accessorKey: 'priorityScore',
      header: 'Priority',
      cell: ({ row }) => (
        <div className="flex items-center">
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                Number(row.original.priorityScore ?? 0) >= 75
                  ? 'bg-green-500'
                  : Number(row.original.priorityScore ?? 0) >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Number(row.original.priorityScore ?? 0)}%` }}
            />
          </div>
          <span className="ml-2 text-sm">{Number(row.original.priorityScore ?? 0)}</span>
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/accounts/${row.original.id}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => deleteMutation.mutate(row.original.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleBulkDelete = () => {
    if (selectedRows.length > 0) {
      bulkDeleteMutation.mutate(selectedRows);
      setSelectedRows([]);
    }
  };

  const handleExport = () => {
    exportMutation.mutate({
      type: resolvedType,
      status: resolvedStatus,
      search: search || undefined,
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const escapeCsvValue = (value: string) =>
      /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    const csv = [accountTemplateHeaders, accountTemplateSampleRow]
      .map((row) => row.map(escapeCsvValue).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = downloadUrl;
    link.download = 'accounts_import_template.csv';
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    const isCsvFile =
      file.type === 'text/csv' ||
      file.name.toLowerCase().endsWith('.csv') ||
      file.type === 'application/vnd.ms-excel';

    if (!isCsvFile) {
      toast.error('Only CSV files are allowed.');
      return;
    }

    setIsImporting(true);

    try {
      const content = await file.text();
      const parsedRows = parseCsvContent(content);
      const existingAccounts = await getAccounts({ page: 1, limit: 1000 });
      const usedAccountNumbers = new Set(
        (existingAccounts.data || [])
          .map((account) => account.accountNumber?.trim().toLowerCase())
          .filter(Boolean)
      );
      const usedBusinessKeys = new Set(
        (existingAccounts.data || []).map((account) =>
          buildBusinessDuplicateKey({
            name: account.name,
            industry: account.industry,
            website: account.website,
            parentAccountId: account.parentAccount,
          })
        )
      );
      const duplicateRows: number[] = [];

      const rows = parsedRows.flatMap((row, index) => {
        const businessKey = buildBusinessDuplicateKey(row);
        const providedAccountNumber = normalizeValue(row.accountNumber);

        if (
          usedBusinessKeys.has(businessKey) ||
          (providedAccountNumber && usedAccountNumbers.has(providedAccountNumber))
        ) {
          duplicateRows.push(index + 2);
          return [];
        }

        let nextAccountNumber = row.accountNumber?.trim();

        if (
          !nextAccountNumber ||
          usedAccountNumbers.has(nextAccountNumber.toLowerCase())
        ) {
          do {
            nextAccountNumber = buildImportedAccountNumber(index);
          } while (usedAccountNumbers.has(nextAccountNumber.toLowerCase()));
        }

        usedAccountNumbers.add(nextAccountNumber.toLowerCase());
        usedBusinessKeys.add(businessKey);

        return [{
          ...row,
          accountNumber: nextAccountNumber,
        }];
      });

      if (rows.length === 0) {
        toast.error(
          duplicateRows.length > 0
            ? `Import skipped. All CSV rows are duplicates. Duplicate row numbers: ${duplicateRows.join(', ')}.`
            : 'Import skipped. No valid accounts were found in the CSV file.'
        );
        return;
      }

      const results = await Promise.allSettled(rows.map((row) => createAccount(row)));
      const successCount = results.filter((result) => result.status === 'fulfilled').length;
      const failedResults = results.filter((result) => result.status === 'rejected');

      if (successCount > 0) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['accounts'] }),
          queryClient.invalidateQueries({ queryKey: ['accounts', 'stats'] }),
          queryClient.refetchQueries({ queryKey: ['accounts'] }),
          queryClient.refetchQueries({ queryKey: ['accounts', 'stats'] }),
        ]);
      }

      if (failedResults.length === 0) {
        const duplicateSummary =
          duplicateRows.length > 0
            ? ` ${duplicateRows.length} duplicate row${duplicateRows.length > 1 ? 's were' : ' was'} skipped.`
            : '';
        toast.success(
          `${successCount} account${successCount > 1 ? 's' : ''} imported successfully.${duplicateSummary}`
        );
        return;
      }

      const firstFailure = failedResults[0];
      const failureMessage =
        firstFailure.status === 'rejected' && firstFailure.reason instanceof Error
          ? firstFailure.reason.message
          : 'Some accounts could not be imported.';

      if (successCount > 0) {
        toast.error(
          `${successCount} account${successCount > 1 ? 's were' : ' was'} imported, ${failedResults.length} failed, ${duplicateRows.length} duplicate row${duplicateRows.length === 1 ? ' was' : 's were'} skipped. ${failureMessage}`
        );
        return;
      }

      toast.error(failureMessage);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import accounts.';
      toast.error(message);
    } finally {
      setIsImporting(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-600">Error loading accounts: {(error as Error)?.message}</p>
      </div>
    );
  }

  const accounts = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your business accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleImportFile}
          />
          <Button variant="outline" onClick={handleImportClick} disabled={isImporting}>
            <Upload className="h-4 w-4 mr-2" />
            {isImporting ? 'Importing...' : 'Import CSV'}
          </Button>
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button onClick={() => router.push('/accounts/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats?.data && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Number(stats.data.total ?? 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(Number(stats.data.totalRevenue ?? 0) / 1000000).toFixed(1)}M
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(Number(stats.data.averageRevenue ?? 0) / 1000).toFixed(0)}K
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(stats.data.averagePriorityScore ?? 0).toFixed(0)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-2 flex-1">
              <Input
                placeholder="Search accounts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.values(AccountType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.values(AccountStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(typeFilter !== 'all' || statusFilter !== 'all') && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setTypeFilter('all');
                    setStatusFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {selectedRows.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedRows.length})
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={accounts}
            isLoading={isPending}
            onRowClick={(row) => router.push(`/accounts/${row.id}`)}
            enableRowSelection
            onRowSelectionChange={(rows) => setSelectedRows(rows.map((row) => row.id))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
