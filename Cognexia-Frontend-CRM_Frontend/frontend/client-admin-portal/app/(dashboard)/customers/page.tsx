'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import {
  Building2,
  Download,
  Plus,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DataTable,
  DataTableColumnHeader,
  DataTableRowActions,
} from '@/components/DataTable';
import {
  useCustomers,
  useCustomerStats,
  useDeleteCustomer,
  useBulkDeleteCustomers,
  useExportCustomers,
} from '@/hooks/useCustomers';
import type {
  Customer,
  CustomerFilters,
  CustomerSize,
  CustomerStatus,
  CustomerTier,
  CustomerType,
} from '@/types/api.types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  createImportedId,
  ensureCsvFile,
  normalizeCsvValue,
  parseCsvNumber,
  parseCsvText,
} from '@/lib/csv-import';

type CustomerRow = Customer & {
  isClientImported?: boolean;
};

const customerTypeValues = new Set<CustomerType>(['b2b', 'b2c', 'b2b2c']);
const customerSizeValues = new Set<CustomerSize>([
  'startup',
  'small_medium',
  'enterprise',
  'large_enterprise',
  'individual',
]);
const customerStatusValues = new Set<CustomerStatus>([
  'active',
  'inactive',
  'prospect',
  'churned',
  'suspended',
]);
const customerTierValues = new Set<CustomerTier>([
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
]);

const isImportedCustomer = (customer: CustomerRow) => customer.isClientImported === true;

const buildCustomerDuplicateKey = (customer: {
  companyName: string;
  primaryContact: { email?: string };
}) => `${normalizeCsvValue(customer.companyName)}|${normalizeCsvValue(customer.primaryContact.email)}`;

const customerTemplateHeaders = [
  'company name',
  'customer type',
  'industry',
  'size',
  'primary contact first name',
  'primary contact last name',
  'primary contact title',
  'primary contact email',
  'primary contact phone',
  'address street',
  'address city',
  'address state',
  'address zip code',
  'address country',
  'address region',
  'website',
  'annual revenue',
  'employee count',
  'total revenue',
  'segment',
  'tier',
  'account manager',
  'tags',
];

const customerTemplateSampleRow = [
  'Acme Corporation',
  'b2b',
  'Technology',
  'enterprise',
  'John',
  'Doe',
  'CEO',
  'john.doe@acme.com',
  '+1 555 123 4567',
  '123 Main Street',
  'San Francisco',
  'California',
  '94105',
  'United States',
  'North America',
  'https://acme.com',
  '2500000',
  '450',
  '250000',
  'strategic',
  'gold',
  'Sarah Johnson',
  'enterprise|priority',
];

export default function CustomersPage() {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedCustomers, setSelectedCustomers] = React.useState<CustomerRow[]>([]);
  const [importedCustomers, setImportedCustomers] = React.useState<CustomerRow[]>([]);
  const [isImporting, setIsImporting] = React.useState(false);
  const [filters] = React.useState<CustomerFilters>({
    page: 1,
    limit: 20,
  });

  const { data: customersData, isLoading } = useCustomers(filters);
  const { data: statsData } = useCustomerStats();
  const deleteMutation = useDeleteCustomer();
  const bulkDelete = useBulkDeleteCustomers();
  const exportMutation = useExportCustomers();

  const customers = React.useMemo<CustomerRow[]>(
    () => [...importedCustomers, ...(customersData?.data?.customers || [])],
    [customersData?.data?.customers, importedCustomers]
  );
  const stats = statsData?.data;
  const importedCustomerIds = React.useMemo(
    () => new Set(importedCustomers.map((customer) => customer.id)),
    [importedCustomers]
  );
  const importedActiveCustomers = importedCustomers.filter(
    (customer) => customer.status === 'active'
  ).length;
  const importedPlatinumCustomers = importedCustomers.filter(
    (customer) => customer.segmentation.tier === 'platinum'
  ).length;
  const importedRevenueTotal = importedCustomers.reduce(
    (sum, customer) => sum + Number(customer.salesMetrics.totalRevenue ?? 0),
    0
  );
  const combinedTotalCustomers = Number(stats?.totalCustomers ?? 0) + importedCustomers.length;
  const combinedActiveCustomers = Number(stats?.activeCustomers ?? 0) + importedActiveCustomers;
  const combinedAverageRevenue =
    combinedTotalCustomers > 0
      ? (Number(stats?.averageRevenue ?? 0) * Number(stats?.totalCustomers ?? 0) +
          importedRevenueTotal) /
        combinedTotalCustomers
      : 0;
  const combinedTopTierCustomers =
    Number(stats?.tierDistribution?.platinum ?? 0) + importedPlatinumCustomers;

  const columns: ColumnDef<CustomerRow>[] = [
    {
      accessorKey: 'customerCode',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.original.customerCode}</div>
      ),
    },
    {
      accessorKey: 'companyName',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Company Name" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <div>
            <span className="font-medium">{row.original.companyName}</span>
            {isImportedCustomer(row.original) && (
              <div className="text-xs text-muted-foreground">Imported from CSV</div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'customerType',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.customerType}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.original.status;
        const variant =
          status === 'active'
            ? 'default'
            : status === 'inactive'
            ? 'secondary'
            : status === 'prospect'
            ? 'outline'
            : 'destructive';

        return (
          <Badge variant={variant} className="capitalize">
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'industry',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Industry" />,
      cell: ({ row }) => <div className="capitalize">{row.original.industry}</div>,
    },
    {
      accessorKey: 'segmentation.tier',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tier" />,
      cell: ({ row }) => {
        const tier = row.original.segmentation.tier;
        return (
          <Badge
            variant="outline"
            className={`capitalize ${
              tier === 'platinum' || tier === 'diamond'
                ? 'border-yellow-600 text-yellow-600'
                : tier === 'gold'
                ? 'border-orange-600 text-orange-600'
                : ''
            }`}
          >
            {tier}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'salesMetrics.totalRevenue',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Revenue" />,
      cell: ({ row }) => {
        const revenue = row.original.salesMetrics.totalRevenue;
        return (
          <div className="font-medium">
            ${Number(revenue ?? 0).toLocaleString()}
          </div>
        );
      },
    },
    {
      accessorKey: 'relationshipMetrics.lastInteractionDate',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Last Contact" />,
      cell: ({ row }) => {
        const date = row.original.relationshipMetrics.lastInteractionDate;
        if (!date) return <span className="text-muted-foreground">Never</span>;
        return (
          <div className="text-sm">
            {format(new Date(date), 'MMM d, yyyy')}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions
          onView={() => router.push(`/customers/${row.original.id}`)}
          onEdit={() => router.push(`/customers/${row.original.id}/edit`)}
          onDelete={() => handleDeleteCustomer(row.original.id)}
        />
      ),
    },
  ];

  const handleDeleteCustomer = (id: string) => {
    const customer = customers.find((c) => c.id === id);
    if (confirm(`Are you sure you want to delete ${customer?.companyName || 'this customer'}? This action cannot be undone.`)) {
      if (importedCustomerIds.has(id)) {
        setImportedCustomers((currentCustomers) =>
          currentCustomers.filter((customer) => customer.id !== id)
        );
        setSelectedCustomers((currentCustomers) =>
          currentCustomers.filter((customer) => customer.id !== id)
        );
        toast.success('Imported customer removed');
        return;
      }

      deleteMutation.mutate(id);
    }
  };

  const handleBulkDelete = () => {
    if (selectedCustomers.length === 0) {
      toast.error('No customers selected');
      return;
    }

    if (
      confirm(
        `Are you sure you want to delete ${selectedCustomers.length} customer(s)? This action cannot be undone.`
      )
    ) {
      const localIds = selectedCustomers
        .filter((customer) => importedCustomerIds.has(customer.id))
        .map((customer) => customer.id);
      const serverIds = selectedCustomers
        .filter((customer) => !importedCustomerIds.has(customer.id))
        .map((customer) => customer.id);

      if (localIds.length > 0) {
        setImportedCustomers((currentCustomers) =>
          currentCustomers.filter((customer) => !localIds.includes(customer.id))
        );
      }

      if (serverIds.length > 0) {
        bulkDelete.mutate(serverIds, {
          onSuccess: () => {
            setSelectedCustomers([]);
          },
        });
      } else {
        setSelectedCustomers([]);
        toast.success(`${localIds.length} imported customer(s) removed`);
      }
    }
  };

  const handleExport = (format: 'csv' | 'excel' = 'csv') => {
    exportMutation.mutate({ filters, format });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const escapeCsvValue = (value: string) =>
      /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

    const csv = [customerTemplateHeaders, customerTemplateSampleRow]
      .map((row) => row.map(escapeCsvValue).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = downloadUrl;
    link.download = 'customers_import_template.csv';
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
        customers.map((customer) =>
          buildCustomerDuplicateKey({
            companyName: customer.companyName,
            primaryContact: customer.primaryContact,
          })
        )
      );

      const duplicateRows: number[] = [];
      const newCustomers: CustomerRow[] = [];

      parsedRows.forEach((row, index) => {
        const companyName = row.companyname || row.name;
        const contactEmail = row.primarycontactemail || row.email;

        if (!companyName || !contactEmail) {
          throw new Error(
            `Row ${index + 2} is missing required fields. Required columns: companyName, primaryContactEmail.`
          );
        }

        const customerKey = buildCustomerDuplicateKey({
          companyName,
          primaryContact: { email: contactEmail },
        });

        if (existingKeys.has(customerKey)) {
          duplicateRows.push(index + 2);
          return;
        }

        const customerType = normalizeCsvValue(row.customertype) as CustomerType;
        const customerSize = normalizeCsvValue(row.size) as CustomerSize;
        const customerStatus = normalizeCsvValue(row.status) as CustomerStatus;
        const customerTier = normalizeCsvValue(row.tier) as CustomerTier;
        const totalRevenue = parseCsvNumber(row.totalrevenue || row.revenue) ?? 0;

        const importedCustomer: CustomerRow = {
          id: createImportedId('customer', index),
          customerCode: row.customercode || `CUST-IMP-${Date.now()}-${index + 1}`,
          companyName,
          customerType: customerTypeValues.has(customerType) ? customerType : 'b2b',
          status: customerStatusValues.has(customerStatus) ? customerStatus : 'active',
          industry: row.industry || 'general',
          size: customerSizeValues.has(customerSize) ? customerSize : 'small_medium',
          primaryContact: {
            firstName: row.primarycontactfirstname || row.firstname || 'Primary',
            lastName: row.primarycontactlastname || row.lastname || 'Contact',
            title: row.primarycontacttitle || row.title || 'Contact',
            email: contactEmail,
            phone: row.primarycontactphone || row.phone || '',
            mobile: row.primarycontactmobile || undefined,
            linkedin: row.primarycontactlinkedin || undefined,
          },
          address: {
            street: row.addressstreet || row.street || '',
            city: row.addresscity || row.city || '',
            state: row.addressstate || row.state || undefined,
            country: row.addresscountry || row.country || 'Unknown',
            zipCode: row.addresszipcode || row.zipcode || '',
            region: row.addressregion || row.region || 'Unknown',
          },
          demographics: {
            annualRevenue: parseCsvNumber(row.annualrevenue),
            website: row.website || undefined,
            employeeCount: parseCsvNumber(row.employeecount),
          },
          preferences: {
            language: row.language || 'en',
            currency: row.currency || 'USD',
            timezone: row.timezone || 'UTC',
            communicationChannels: row.communicationchannels
              ? row.communicationchannels.split('|').map((item) => item.trim()).filter(Boolean)
              : ['email'],
            marketingOptIn: true,
            newsletterOptIn: false,
            eventInvitations: false,
            privacySettings: {
              dataSharing: false,
              analytics: true,
              marketing: false,
            },
          },
          salesMetrics: {
            totalRevenue,
            averageOrderValue: 0,
            paymentTerms: row.paymentterms || 'NET30',
          },
          relationshipMetrics: {
            customerSince: new Date().toISOString(),
            loyaltyScore: parseCsvNumber(row.loyaltyscore) ?? 0,
            satisfactionScore: parseCsvNumber(row.satisfactionscore) ?? 0,
            npsScore: parseCsvNumber(row.npsscore) ?? 0,
            lastInteractionDate: row.lastinteractiondate || undefined,
            accountManager: row.accountmanager || undefined,
          },
          segmentation: {
            segment: row.segment || 'general',
            tier: customerTierValues.has(customerTier) ? customerTier : 'bronze',
            riskLevel: 'low',
            growthPotential: 'medium',
          },
          tags: row.tags
            ? row.tags.split('|').map((tag) => tag.trim()).filter(Boolean)
            : [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isClientImported: true,
        };

        existingKeys.add(customerKey);
        newCustomers.push(importedCustomer);
      });

      if (newCustomers.length === 0) {
        toast.error(
          duplicateRows.length > 0
            ? `All CSV rows were duplicates. Duplicate row numbers: ${duplicateRows.join(', ')}.`
            : 'No valid customers were found in the CSV file.'
        );
        return;
      }

      setImportedCustomers((currentCustomers) => [...newCustomers, ...currentCustomers]);
      toast.success(
        `${newCustomers.length} customer${newCustomers.length > 1 ? 's' : ''} imported.${duplicateRows.length > 0 ? ` ${duplicateRows.length} duplicate row${duplicateRows.length > 1 ? 's were' : ' was'} skipped.` : ''}`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import customers.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer relationships and track interactions
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
          <Button variant="outline" size="sm" onClick={handleImportClick} disabled={isImporting}>
            <Upload className="mr-2 h-4 w-4" />
            {isImporting ? 'Importing...' : 'Import CSV'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => router.push('/customers/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {combinedTotalCustomers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {combinedActiveCustomers.toLocaleString()} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(stats.newThisMonth ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {Number(stats.churnRate ?? 0).toFixed(1)}% churn rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Revenue</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${Number(combinedAverageRevenue ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">per customer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Tier</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {combinedTopTierCustomers}
              </div>
              <p className="text-xs text-muted-foreground">platinum customers</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedCustomers.length > 0 && (
        <Card className="border-primary">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedCustomers.length} customer(s) selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkDelete.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCustomers([])}
            >
              Clear Selection
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>
            A list of all customers with their key metrics and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={customers}
            searchKey="companyName"
            searchPlaceholder="Search customers..."
            onRowClick={(customer) => {
              if (!isImportedCustomer(customer)) {
                router.push(`/customers/${customer.id}`);
              }
            }}
            enableRowSelection
            onRowSelectionChange={setSelectedCustomers}
            pageSize={filters.limit}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
