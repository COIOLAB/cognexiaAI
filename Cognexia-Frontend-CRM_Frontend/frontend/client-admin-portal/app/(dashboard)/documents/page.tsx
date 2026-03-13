'use client';

import { useRef, useState } from 'react';
import { Upload, FileText, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useGetDocuments, useUploadDocument } from '@/hooks/useDocuments';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DocumentType, DocumentStatus } from '@/types/api.types';
import type { Document } from '@/types/api.types';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/PageHeader';

export default function DocumentsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { data: documents, isLoading } = useGetDocuments();
  const uploadDocument = useUploadDocument();

  const columns: ColumnDef<Document>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-sm text-muted-foreground">{row.original.fileName}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'documentType',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.documentType}</Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={
              status === DocumentStatus.APPROVED
                ? 'default'
                : status === DocumentStatus.DRAFT
                ? 'secondary'
                : 'outline'
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'currentVersion',
      header: 'Version',
      cell: ({ row }) => <span>v{row.original.currentVersion}</span>,
    },
    {
      accessorKey: 'fileSize',
      header: 'Size',
      cell: ({ row }) => {
        const sizeKB = Math.round(row.original.fileSize / 1024);
        return <span>{sizeKB} KB</span>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild>
          <a href={`/documents/${row.original.id}`}>View</a>
        </Button>
      ),
    },
  ];

  const filteredDocuments = documents?.filter((doc) => {
    if (typeFilter !== 'all' && doc.documentType !== typeFilter) return false;
    if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
    if (search && !doc.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: documents?.length || 0,
    approved: documents?.filter(d => d.status === DocumentStatus.APPROVED).length || 0,
    draft: documents?.filter(d => d.status === DocumentStatus.DRAFT).length || 0,
    signed: documents?.filter(d => d.status === DocumentStatus.SIGNED).length || 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        subtitle="Manage your document library"
        actions={
          <>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadDocument.isPending}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploadDocument.isPending ? 'Uploading...' : 'Upload Document'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;

                uploadDocument.mutate(
                  {
                    file,
                    name: file.name,
                    documentType: DocumentType.OTHER,
                  },
                  {
                    onSuccess: () => toast.success('Document uploaded'),
                    onError: (error: any) =>
                      toast.error(error?.response?.data?.message || 'Upload failed'),
                  },
                );
                event.target.value = '';
              }}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.signed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="md:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={DocumentType.CONTRACT}>Contract</SelectItem>
                <SelectItem value={DocumentType.PROPOSAL}>Proposal</SelectItem>
                <SelectItem value={DocumentType.INVOICE}>Invoice</SelectItem>
                <SelectItem value={DocumentType.QUOTE}>Quote</SelectItem>
                <SelectItem value={DocumentType.AGREEMENT}>Agreement</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={DocumentStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={DocumentStatus.IN_REVIEW}>In Review</SelectItem>
                <SelectItem value={DocumentStatus.APPROVED}>Approved</SelectItem>
                <SelectItem value={DocumentStatus.SIGNED}>Signed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredDocuments || []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
