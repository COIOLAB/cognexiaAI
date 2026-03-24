'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, Download, Trash2, TrendingUp, DollarSign, Target, Upload } from 'lucide-react';
import { Opportunity, OpportunityStage, OpportunityStatus } from '@/types/api.types';
import {
  useOpportunities,
  useOpportunityStats,
  useDeleteOpportunity,
  useBulkDeleteOpportunities,
  useExportOpportunities,
} from '@/hooks/useOpportunities';
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
import { toast } from 'sonner';
import {
  createImportedId,
  ensureCsvFile,
  normalizeCsvValue,
  parseCsvDate,
  parseCsvNumber,
  parseCsvText,
} from '@/lib/csv-import';

const stageStyles: Record<OpportunityStage, string> = {
  [OpportunityStage.PROSPECTING]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [OpportunityStage.QUALIFICATION]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  [OpportunityStage.PROPOSAL]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [OpportunityStage.NEGOTIATION]: 'bg -orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  [OpportunityStage.CLOSED_WON]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [OpportunityStage.CLOSED_LOST]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

type OpportunityRow = Opportunity & {
  isClientImported?: boolean;
};

type OpportunityApiRow = Partial<OpportunityRow> & {
  value?: number | string;
  salesRep?: string;
  customer?: { id?: string } | undefined;
  products?: Array<string> | { items?: Array<{ productId?: string; productName?: string }> };
  competitive?: { mainCompetitors?: string[] };
  stage?: string;
  status?: string;
  expectedCloseDate?: string | Date;
  actualCloseDate?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

const normalizeOpportunityStage = (value: unknown): OpportunityStage => {
  switch (normalizeCsvValue(value)) {
    case OpportunityStage.QUALIFICATION:
      return OpportunityStage.QUALIFICATION;
    case OpportunityStage.PROPOSAL:
      return OpportunityStage.PROPOSAL;
    case OpportunityStage.NEGOTIATION:
    case 'closing':
      return OpportunityStage.NEGOTIATION;
    case OpportunityStage.CLOSED_WON:
    case 'won':
      return OpportunityStage.CLOSED_WON;
    case OpportunityStage.CLOSED_LOST:
    case 'lost':
      return OpportunityStage.CLOSED_LOST;
    case 'discovery':
      return OpportunityStage.QUALIFICATION;
    case OpportunityStage.PROSPECTING:
    default:
      return OpportunityStage.PROSPECTING;
  }
};

const normalizeOpportunityStatus = (
  stage: OpportunityStage,
  value: unknown
): OpportunityStatus => {
  const normalizedValue = normalizeCsvValue(value);

  if (normalizedValue === OpportunityStatus.WON) {
    return OpportunityStatus.WON;
  }

  if (normalizedValue === OpportunityStatus.LOST) {
    return OpportunityStatus.LOST;
  }

  if (stage === OpportunityStage.CLOSED_WON) {
    return OpportunityStatus.WON;
  }

  if (stage === OpportunityStage.CLOSED_LOST) {
    return OpportunityStatus.LOST;
  }

  return OpportunityStatus.OPEN;
};

const normalizeOpportunityRow = (opportunity: OpportunityApiRow): OpportunityRow => {
  const stage = normalizeOpportunityStage(opportunity.stage);
  const amount = Number(opportunity.amount ?? opportunity.value ?? 0);
  const probability = Number(opportunity.probability ?? 0);
  const weightedValue =
    opportunity.weightedValue !== undefined
      ? Number(opportunity.weightedValue)
      : Number(((amount * probability) / 100).toFixed(2));

  const rawProducts = opportunity.products;
  const productItems =
    rawProducts && !Array.isArray(rawProducts) && typeof rawProducts === 'object'
      ? (rawProducts as { items?: Array<{ productId?: string; productName?: string }> }).items
      : undefined;
  const productList = Array.isArray(rawProducts)
    ? rawProducts.filter((item): item is string => typeof item === 'string')
    : Array.isArray(productItems)
    ? productItems.map((item) => item.productName || item.productId || '').filter(Boolean)
    : [];

  const expectedCloseDate = parseCsvDate(opportunity.expectedCloseDate) || '';
  const actualCloseDate = parseCsvDate(opportunity.actualCloseDate);

  return {
    id: String(opportunity.id ?? opportunity.opportunityNumber ?? opportunity.name ?? ''),
    opportunityNumber:
      String(opportunity.opportunityNumber ?? opportunity.opportunityCode ?? opportunity.id ?? ''),
    opportunityCode:
      String(opportunity.opportunityCode ?? opportunity.opportunityNumber ?? opportunity.id ?? ''),
    name: opportunity.name || 'Untitled Opportunity',
    description: opportunity.description || undefined,
    stage,
    status: normalizeOpportunityStatus(stage, opportunity.status),
    amount,
    probability,
    weightedValue,
    expectedCloseDate,
    actualCloseDate,
    customerId: String(opportunity.customerId ?? opportunity.customer?.id ?? ''),
    customer: opportunity.customer,
    contactId: opportunity.contactId || undefined,
    assignedTo: opportunity.assignedTo || opportunity.salesRep || undefined,
    products: productList,
    competitors: opportunity.competitors || opportunity.competitive?.mainCompetitors || [],
    lostReason: opportunity.lostReason || undefined,
    notes: opportunity.notes || undefined,
    createdAt: parseCsvDate(opportunity.createdAt) || new Date().toISOString(),
    updatedAt: parseCsvDate(opportunity.updatedAt) || new Date().toISOString(),
    isClientImported: opportunity.isClientImported,
  };
};

const extractOpportunityRows = (payload: unknown): OpportunityRow[] => {
  const rawRows = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { opportunities?: unknown }).opportunities)
    ? (payload as { opportunities: OpportunityApiRow[] }).opportunities
    : [];

  return rawRows.map((row) => normalizeOpportunityRow(row as OpportunityApiRow));
};

const opportunityStageValues = new Set<OpportunityStage>(Object.values(OpportunityStage));

const opportunityStatusValues = new Set<OpportunityStatus>(Object.values(OpportunityStatus));

const isImportedOpportunity = (opportunity: OpportunityRow) => opportunity.isClientImported === true;

const opportunityTemplateHeaders = [
  'name',
  'description',
  'amount',
  'expected close date',
  'customer id',
  'contact id',
  'assigned to',
  'stage',
  'status',
  'probability',
  'products',
  'competitors',
  'actual close date',
  'lost reason',
  'notes',
];

const opportunityTemplateSampleRow = [
  'Q1 Enterprise Deal',
  'Expansion opportunity for enterprise licensing',
  '125000',
  '2026-06-30',
  'customer-uuid-001',
  'contact-uuid-001',
  'sales_rep_1',
  'qualification',
  'open',
  '65',
  'prod-1|prod-2',
  'Competitor A|Competitor B',
  '',
  '',
  'Customer requested proposal by end of month',
];

const buildOpportunityDuplicateKey = (opportunity: {
  name: string;
  customerId: string;
  amount: number;
  expectedCloseDate: string;
}) =>
  [
    normalizeCsvValue(opportunity.name),
    normalizeCsvValue(opportunity.customerId),
    Number(opportunity.amount || 0),
    normalizeCsvValue(opportunity.expectedCloseDate),
  ].join('|');

export default function OpportunitiesPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page] = useState(1);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<OpportunityStage | undefined>();
  const [statusFilter, setStatusFilter] = useState<OpportunityStatus | undefined>();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [importedOpportunities, setImportedOpportunities] = useState<OpportunityRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const { data, isLoading, error } = useOpportunities({
    page,
    limit: 25,
    search: search || undefined,
    stage: stageFilter,
    status: statusFilter,
  });

  const { data: stats } = useOpportunityStats();
  const deleteMutation = useDeleteOpportunity();
  const bulkDeleteMutation = useBulkDeleteOpportunities();
  const exportMutation = useExportOpportunities();
  const serverOpportunities = useMemo(
    () => extractOpportunityRows(data?.data),
    [data?.data]
  );
  const serverOpportunityTotal = Number(data?.total ?? serverOpportunities.length);
  const hasServerOpportunities = serverOpportunityTotal > 0 || serverOpportunities.length > 0;
  const importedOpportunityIds = useMemo(
    () => new Set(importedOpportunities.map((opportunity) => opportunity.id)),
    [importedOpportunities]
  );
  const filteredImportedOpportunities = useMemo(
    () =>
      importedOpportunities.filter((opportunity) => {
        if (stageFilter && opportunity.stage !== stageFilter) {
          return false;
        }

        if (statusFilter && opportunity.status !== statusFilter) {
          return false;
        }

        if (!search.trim()) {
          return true;
        }

        const searchValue = normalizeCsvValue(search);
        return [
          opportunity.name,
          opportunity.description,
          opportunity.opportunityNumber,
          opportunity.customerId,
        ].some((value) => normalizeCsvValue(value).includes(searchValue));
      }),
    [importedOpportunities, search, stageFilter, statusFilter]
  );
  const importedTotalAmount = importedOpportunities.reduce(
    (sum, opportunity) => sum + Number(opportunity.amount ?? 0),
    0
  );
  const importedWeightedAmount = importedOpportunities.reduce(
    (sum, opportunity) => sum + Number(opportunity.weightedValue ?? 0),
    0
  );
  const importedWonCount = importedOpportunities.filter(
    (opportunity) => opportunity.status === 'won'
  ).length;
  const baseOpportunityTotal = hasServerOpportunities ? serverOpportunityTotal : 0;
  const baseTotalValue = hasServerOpportunities ? Number(stats?.data?.totalValue ?? 0) : 0;
  const baseWeightedValue = hasServerOpportunities
    ? Number(stats?.data?.totalWeightedValue ?? 0)
    : 0;
  const baseWinRate = hasServerOpportunities ? Number(stats?.data?.winRate ?? 0) : 0;
  const combinedTotalOpportunities = baseOpportunityTotal + importedOpportunities.length;
  const combinedTotalValue = baseTotalValue + importedTotalAmount;
  const combinedWeightedValue = baseWeightedValue + importedWeightedAmount;
  const combinedWinRate =
    combinedTotalOpportunities > 0
      ? (((baseWinRate / 100) * baseOpportunityTotal + importedWonCount) /
          combinedTotalOpportunities) *
        100
      : 0;

  const columns: ColumnDef<OpportunityRow>[] = [
    {
      accessorKey: 'opportunityCode',
      header: 'Opportunity Code',
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {row.original.opportunityNumber}
          </span>
          {isImportedOpportunity(row.original) && (
            <div className="text-xs text-muted-foreground">Imported from CSV</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          {row.original.description && (
            <div className="text-sm text-muted-foreground truncate max-w-xs">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-semibold">
          ${(Number(row.original.amount ?? 0)).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'probability',
      header: 'Probability',
      cell: ({ row }) => <span>{row.original.probability}%</span>,
    },
    {
      accessorKey: 'weightedValue',
      header: 'Weighted Value',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          ${(Number(row.original.weightedValue ?? 0)).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'stage',
      header: 'Stage',
      cell: ({ row }) => (
        <Badge className={stageStyles[row.original.stage]} variant="secondary">
          {row.original.stage.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      accessorKey: 'expectedCloseDate',
      header: 'Expected Close',
      cell: ({ row }) =>
        row.original.expectedCloseDate
          ? new Date(row.original.expectedCloseDate).toLocaleDateString()
          : '-',
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
            <DropdownMenuItem onClick={() => router.push(`/opportunities/${row.original.id}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                if (importedOpportunityIds.has(row.original.id)) {
                  setImportedOpportunities((currentOpportunities) =>
                    currentOpportunities.filter((opportunity) => opportunity.id !== row.original.id)
                  );
                  setSelectedRows((currentRows) =>
                    currentRows.filter((id) => id !== row.original.id)
                  );
                  toast.success('Imported opportunity removed');
                  return;
                }

                deleteMutation.mutate(row.original.id);
              }}
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
      const localIds = selectedRows.filter((id) => importedOpportunityIds.has(id));
      const serverIds = selectedRows.filter((id) => !importedOpportunityIds.has(id));

      if (localIds.length > 0) {
        setImportedOpportunities((currentOpportunities) =>
          currentOpportunities.filter((opportunity) => !localIds.includes(opportunity.id))
        );
      }

      if (serverIds.length > 0) {
        bulkDeleteMutation.mutate(serverIds);
      } else {
        toast.success(`${localIds.length} imported opportunity(s) removed`);
      }

      setSelectedRows([]);
    }
  };

  const handleExport = () => {
    exportMutation.mutate({
      stage: stageFilter,
      status: statusFilter,
      search: search || undefined,
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const escapeCsvValue = (value: string) =>
      /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

    const csv = [opportunityTemplateHeaders, opportunityTemplateSampleRow]
      .map((row) => row.map(escapeCsvValue).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = downloadUrl;
    link.download = 'opportunities_import_template.csv';
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    try {
      ensureCsvFile(file);
      setIsImporting(true);

      const parsedRows = parseCsvText(await file.text());
      const existingKeys = new Set(
        serverOpportunities.concat(importedOpportunities).map((opportunity) =>
          buildOpportunityDuplicateKey({
            name: opportunity.name,
            customerId: opportunity.customerId,
            amount: Number(opportunity.amount ?? 0),
            expectedCloseDate: opportunity.expectedCloseDate,
          })
        )
      );
      const duplicateRows: number[] = [];
      const newOpportunities: OpportunityRow[] = [];

      parsedRows.forEach((row, index) => {
        const name = row.name;
        const amount = parseCsvNumber(row.amount);
        const expectedCloseDate = parseCsvDate(row.expectedclosedate || row.closeby || row.closedate);
        const customerId = row.customerid;

        if (!name || amount === undefined || !expectedCloseDate || !customerId) {
          throw new Error(
            `Row ${index + 2} is missing required fields. Required columns: name, amount, expectedCloseDate, customerId.`
          );
        }

        const duplicateKey = buildOpportunityDuplicateKey({
          name,
          customerId,
          amount,
          expectedCloseDate,
        });

        if (existingKeys.has(duplicateKey)) {
          duplicateRows.push(index + 2);
          return;
        }

        const stage = normalizeCsvValue(row.stage) as OpportunityStage;
        const status = normalizeCsvValue(row.status) as OpportunityStatus;
        const probability = parseCsvNumber(row.probability) ?? 10;
        const resolvedStage = opportunityStageValues.has(stage)
          ? stage
          : OpportunityStage.PROSPECTING;
        const resolvedStatus = opportunityStatusValues.has(status)
          ? status
          : resolvedStage === OpportunityStage.CLOSED_WON
          ? OpportunityStatus.WON
          : resolvedStage === OpportunityStage.CLOSED_LOST
          ? OpportunityStatus.LOST
          : OpportunityStatus.OPEN;

        existingKeys.add(duplicateKey);
        newOpportunities.push({
          id: createImportedId('opportunity', index),
          opportunityNumber: row.opportunitynumber || `OPP-IMP-${Date.now()}-${index + 1}`,
          opportunityCode: row.opportunitycode || `OPP-IMP-${index + 1}`,
          name,
          description: row.description || undefined,
          stage: resolvedStage,
          status: resolvedStatus,
          amount,
          probability,
          weightedValue: Number(((amount * probability) / 100).toFixed(2)),
          expectedCloseDate,
          actualCloseDate: parseCsvDate(row.actualclosedate),
          customerId,
          customer: undefined,
          contactId: row.contactid || undefined,
          assignedTo: row.assignedto || undefined,
          products: row.products ? row.products.split('|').map((item) => item.trim()).filter(Boolean) : [],
          competitors: row.competitors ? row.competitors.split('|').map((item) => item.trim()).filter(Boolean) : [],
          lostReason: row.lostreason || undefined,
          notes: row.notes || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isClientImported: true,
        });
      });

      if (newOpportunities.length === 0) {
        toast.error(
          duplicateRows.length > 0
            ? `All CSV rows were duplicates. Duplicate row numbers: ${duplicateRows.join(', ')}.`
            : 'No valid opportunities were found in the CSV file.'
        );
        return;
      }

      setImportedOpportunities((currentOpportunities) => [
        ...newOpportunities,
        ...currentOpportunities,
      ]);
      toast.success(
        `${newOpportunities.length} opportunit${newOpportunities.length > 1 ? 'ies' : 'y'} imported.${duplicateRows.length > 0 ? ` ${duplicateRows.length} duplicate row${duplicateRows.length > 1 ? 's were' : ' was'} skipped.` : ''}`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import opportunities.');
    } finally {
      setIsImporting(false);
    }
  };

  const opportunities = useMemo<OpportunityRow[]>(
    () => [...filteredImportedOpportunities, ...serverOpportunities],
    [filteredImportedOpportunities, serverOpportunities]
  );

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-600">
          Error loading opportunities: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opportunities</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your sales opportunities
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
          <Button onClick={() => router.push('/opportunities/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Opportunity
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats?.data && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{combinedTotalOpportunities}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(combinedTotalValue / 1000000).toFixed(1)}M
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weighted Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(combinedWeightedValue / 1000000).toFixed(1)}M
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{combinedWinRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-2 flex-1">
              <Input
                placeholder="Search opportunities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <Select
                value={stageFilter}
                onValueChange={(val) => setStageFilter(val as OpportunityStage)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {Object.values(OpportunityStage).map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(val) => setStatusFilter(val as OpportunityStatus)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.values(OpportunityStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(stageFilter || statusFilter) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStageFilter(undefined);
                    setStatusFilter(undefined);
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
            data={opportunities}
            isLoading={isLoading}
            onRowClick={(row) => {
              if (!isImportedOpportunity(row)) {
                router.push(`/opportunities/${row.id}`);
              }
            }}
            enableRowSelection
            onRowSelectionChange={(rows) => setSelectedRows(rows.map((row) => row.id))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
