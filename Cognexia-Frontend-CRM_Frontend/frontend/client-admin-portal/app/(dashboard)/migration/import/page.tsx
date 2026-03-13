'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useImportCSV, useImportExcel } from '@/hooks/useMigration';
import Link from 'next/link';

const TARGET_ENTITIES = [
  { value: 'customer', label: 'Customers' },
  { value: 'lead', label: 'Leads' },
  { value: 'contact', label: 'Contacts' },
  { value: 'opportunity', label: 'Opportunities' },
  { value: 'product', label: 'Products' },
  { value: 'account', label: 'Accounts' },
];

export default function MigrationImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [targetEntity, setTargetEntity] = useState('');
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [validateOnly, setValidateOnly] = useState(false);

  const importCSV = useImportCSV();
  const importExcel = useImportExcel();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!file || !targetEntity) return;

    const options = {
      skipDuplicates,
      updateExisting,
      validateOnly,
    };

    try {
      const isCSV = file.name.endsWith('.csv');
      if (isCSV) {
        await importCSV.mutateAsync({ file, targetEntity, options });
      } else {
        await importExcel.mutateAsync({ file, targetEntity, options });
      }
      router.push('/migration');
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/migration">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Import Data</h1>
          <p className="text-muted-foreground">
            Upload CSV or Excel files to import data
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            {step > 1 ? <Check className="h-4 w-4" /> : '1'}
          </div>
          <span className="text-sm font-medium">Upload File</span>
        </div>
        <div className="h-px w-12 bg-gray-300" />
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            {step > 2 ? <Check className="h-4 w-4" /> : '2'}
          </div>
          <span className="text-sm font-medium">Configure</span>
        </div>
        <div className="h-px w-12 bg-gray-300" />
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            3
          </div>
          <span className="text-sm font-medium">Review & Import</span>
        </div>
      </div>

      {/* Step 1: File Upload */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select File to Import</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-accent"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload CSV or Excel File</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click to browse or drag and drop your file here
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: .csv, .xlsx, .xls (Max 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {file && (
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-accent">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setFile(null)}>
                  Remove
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Configuration */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Configure Import Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Target Entity *</Label>
              <Select value={targetEntity} onValueChange={setTargetEntity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_ENTITIES.map((entity) => (
                    <SelectItem key={entity.value} value={entity.value}>
                      {entity.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Import Options</h3>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="skipDuplicates"
                  checked={skipDuplicates}
                  onCheckedChange={(checked) => setSkipDuplicates(checked as boolean)}
                />
                <Label htmlFor="skipDuplicates" className="cursor-pointer">
                  Skip duplicate records
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="updateExisting"
                  checked={updateExisting}
                  onCheckedChange={(checked) => setUpdateExisting(checked as boolean)}
                />
                <Label htmlFor="updateExisting" className="cursor-pointer">
                  Update existing records
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="validateOnly"
                  checked={validateOnly}
                  onCheckedChange={(checked) => setValidateOnly(checked as boolean)}
                />
                <Label htmlFor="validateOnly" className="cursor-pointer">
                  Validate only (do not import)
                </Label>
              </div>
            </div>

            {file && (
              <div className="rounded-lg border p-4 bg-accent">
                <h3 className="font-medium mb-2">Selected File</h3>
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!targetEntity || importCSV.isPending || importExcel.isPending}
              >
                {importCSV.isPending || importExcel.isPending ? 'Starting Import...' : 'Start Import'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
