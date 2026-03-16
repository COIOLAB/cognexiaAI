'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Database, Building2, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

export default function OnboardingPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvData, setCsvData] = useState<any[]>([]);

  const { data: progress, isLoading } = useQuery({
    queryKey: ['onboarding', 'progress'],
    queryFn: () => onboardingAPI.getProgress(),
  });

  const bulkImportMutation = useMutation({
    mutationFn: (data: any[]) => onboardingAPI.bulkImport(data),
    onSuccess: (res) => {
      toast.success(`Imported ${res?.imported ?? 0} organizations. Failed: ${res?.failed ?? 0}`);
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setCsvData([]);
      if (res?.errors?.length) {
        res.errors.forEach((e: { row: number; error: string }) =>
          toast.error(`Row ${e.row}: ${e.error}`, { duration: 4000 })
        );
      }
    },
    onError: (e: any) => toast.error(e.message || 'Bulk import failed'),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (r) => {
        const rows = r.data?.filter((row: any) => Object.values(row).some(Boolean)) || [];
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
  );
}

