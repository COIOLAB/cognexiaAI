'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Database, Building2, FileSpreadsheet, X, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

const CSV_COLUMNS = ['name', 'email', 'adminFirstName', 'adminLastName', 'phone', 'address', 'website'] as const;
const CSV_TEMPLATE_SAMPLE: OrgRow[] = [
  {
    name: 'Acme Corporation',
    email: 'admin@acme.com',
    adminFirstName: 'John',
    adminLastName: 'Doe',
    phone: '+1 555 123 4567',
    address: '123 Main Street, San Francisco, CA 94105',
    website: 'https://acme.com',
  },
];

type OrgRow = {
  name: string;
  email: string;
  adminFirstName: string;
  adminLastName: string;
  phone: string;
  address: string;
  website: string;
};

type OnboardingProgress = {
  totalOrganizations: number;
  completed: number;
  inProgress: number;
  avgTimeToComplete: number;
};

type BulkImportResponse = {
  imported?: number;
  failed?: number;
  errors?: Array<{
    row: number;
    error: string;
  }>;
};

function downloadAsCSV(rows: OrgRow[]) {
  const header = CSV_COLUMNS.join(',');
  const body = rows
    .map(row =>
      CSV_COLUMNS.map(col => `"${(row[col] || '').replace(/"/g, '""')}"`).join(',')
    )
    .join('\n');
  const csvContent = rows.length ? `${header}\n${body}\n` : `${header}\n`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'organizations_export.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadTemplateCSV() {
  const header = CSV_COLUMNS.join(',');
  const body = CSV_TEMPLATE_SAMPLE
    .map(row =>
      CSV_COLUMNS.map(col => `"${(row[col] || '').replace(/"/g, '""')}"`).join(',')
    )
    .join('\n');
  const csvContent = `${header}\n${body}\n`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'organizations_import_template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Modal Component ───────────────────────────────────────────────────────────
function OrgExportModal({ onClose }: { onClose: () => void }) {
  const { data: rows = [], isLoading, isError } = useQuery<OrgRow[]>({
    queryKey: ['onboarding', 'organizations-export'],
    queryFn: () => onboardingAPI.getOrganizationsExport(),
    staleTime: 60_000,
  });

  const HEADERS: { key: keyof OrgRow; label: string }[] = [
    { key: 'name',           label: 'Name' },
    { key: 'email',          label: 'Email *' },
    { key: 'adminFirstName', label: 'Admin First Name' },
    { key: 'adminLastName',  label: 'Admin Last Name' },
    { key: 'phone',          label: 'Phone' },
    { key: 'address',        label: 'Address' },
    { key: 'website',        label: 'Website' },
  ];

  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-background border rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Organizations Data</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live data from the database · {isLoading ? '…' : `${rows.length} record${rows.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => downloadAsCSV(rows)}
              disabled={isLoading || rows.length === 0}
            >
              <Download className="h-4 w-4 mr-1.5" />
              Download CSV
            </Button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">Fetching organizations…</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-destructive">
              <p className="font-medium">Failed to load data.</p>
              <p className="text-sm text-muted-foreground">Check your connection and try again.</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
              <FileSpreadsheet className="h-10 w-10 opacity-30" />
              <p className="text-sm">No organizations found in the database.</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-muted/60 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground text-xs w-8">#</th>
                    {HEADERS.map(h => (
                      <th key={h.key} className="px-3 py-2 text-left font-semibold text-muted-foreground text-xs whitespace-nowrap">
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2 text-muted-foreground text-xs">{i + 1}</td>
                      <td className="px-3 py-2 font-medium max-w-[180px] truncate" title={row.name}>{row.name || <span className="text-muted-foreground italic">—</span>}</td>
                      <td className="px-3 py-2 text-blue-600 max-w-[200px] truncate" title={row.email}>{row.email}</td>
                      <td className="px-3 py-2">{row.adminFirstName || <span className="text-muted-foreground italic">—</span>}</td>
                      <td className="px-3 py-2">{row.adminLastName || <span className="text-muted-foreground italic">—</span>}</td>
                      <td className="px-3 py-2 max-w-[140px] truncate" title={row.phone}>{row.phone || <span className="text-muted-foreground italic">—</span>}</td>
                      <td className="px-3 py-2 max-w-[200px] truncate" title={row.address}>{row.address || <span className="text-muted-foreground italic">—</span>}</td>
                      <td className="px-3 py-2 max-w-[160px] truncate">
                        {row.website
                          ? <a href={row.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline underline-offset-2 hover:text-blue-800 transition-colors">{row.website}</a>
                          : <span className="text-muted-foreground italic">—</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && rows.length > 0 && (
          <div className="px-6 py-3 border-t flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing all {rows.length} active organizations</span>
            <span>* email is required for import</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvData, setCsvData] = useState<OrgRow[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);

  const { data: progress, isLoading } = useQuery<OnboardingProgress>({
    queryKey: ['onboarding', 'progress'],
    queryFn: () => onboardingAPI.getProgress(),
  });

  const bulkImportMutation = useMutation<BulkImportResponse, Error, OrgRow[]>({
    mutationFn: (data) => onboardingAPI.bulkImport(data),
    onSuccess: (res) => {
      toast.success(`Imported ${res?.imported ?? 0} organizations. Failed: ${res?.failed ?? 0}`);
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setCsvData([]);
      if (res?.errors?.length) {
        res.errors.forEach((e) =>
          toast.error(`Row ${e.row}: ${e.error}`, { duration: 4000 })
        );
      }
    },
    onError: (e) => toast.error(e.message || 'Bulk import failed'),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (r: Papa.ParseResult<OrgRow>) => {
        const rows = r.data?.filter((row) => Object.values(row).some(Boolean)) || [];
        setCsvData(rows);
        toast.success(`Loaded ${rows.length} rows. Click Import to create organizations.`);
      },
      error: () => toast.error('Failed to parse CSV'),
    });
  };

  const handleBulkImport = () => {
    if (csvData.length === 0) {
      toast.error('Upload a CSV first');
      return;
    }
    bulkImportMutation.mutate(csvData);
  };

  return (
    <>
      {showExportModal && <OrgExportModal onClose={() => setShowExportModal(false)} />}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Organization Onboarding</h1>
          <Link href="/organizations">
            <Button variant="outline">
              <Building2 className="h-4 w-4 mr-2" />
              View Organizations
            </Button>
          </Link>
        </div>

        <p className="text-muted-foreground">
          Manage organization onboarding, bulk import from CSV, and data migration. Organizations created here appear in the Organizations list.
        </p>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Total Organizations</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{isLoading ? '...' : (progress?.totalOrganizations ?? 0)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Completed</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{progress?.completed ?? 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">In Progress</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-yellow-600">{progress?.inProgress ?? 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Avg Time</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{progress?.avgTimeToComplete ?? 7.5} days</div></CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Import Organizations</CardTitle>
              <CardDescription>Upload a CSV with columns: name, email (required), adminFirstName, adminLastName, phone, address, website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                className="w-full"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {csvData.length ? `CSV Loaded: ${csvData.length} rows` : 'Upload CSV'}
              </Button>
              <Button
                className="w-full"
                disabled={csvData.length === 0 || bulkImportMutation.isPending}
                onClick={handleBulkImport}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {bulkImportMutation.isPending ? 'Importing...' : 'Import Organizations'}
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={downloadTemplateCSV}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Fill the template manually, save it as CSV, then upload it here to import organizations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Migration</CardTitle>
              <CardDescription>Migrate from Salesforce, HubSpot, Zoho, or other CRMs</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/organizations">
                <Button className="w-full" variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Go to Organizations for Migration
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-2">
                Use the Data Migration section on each organization page for entity-level import/export.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
