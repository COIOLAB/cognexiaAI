'use client';

import { useState } from 'react';
import { useGetSignatureStatus } from '@/hooks/useDocuments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';

export default function SignaturesPage() {
  const [documentId, setDocumentId] = useState('');
  const [runQuery, setRunQuery] = useState(false);
  const { data: signatures, isLoading } = useGetSignatureStatus(
    runQuery ? documentId : ''
  );

  const FieldLabel = ({ label, tooltip }: { label: string; tooltip?: string }) => (
    <div className="flex items-center gap-2 text-sm font-medium">
      <span>{label}</span>
      {tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help rounded-full border px-1 text-[10px] text-muted-foreground">?</span>
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );

  const signatureItems = Array.isArray(signatures) ? signatures : (signatures as any)?.data || [];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <PageHeader
          title="Signatures"
          subtitle="Track signature requests and status"
          actions={
            <div className="flex flex-wrap gap-2">
              {documentId && (
                <Button asChild variant="outline">
                  <Link href={`/documents/${documentId}`}>Open Document</Link>
                </Button>
              )}
              <Button variant="outline" onClick={() => setRunQuery(true)} disabled={!documentId}>
                Refresh
              </Button>
            </div>
          }
        />

      <Card>
        <CardHeader>
          <CardTitle>Lookup Signature Status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <FieldLabel label="Document ID" tooltip="Document to check signature status." />
            <Input
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              placeholder="document-id"
            />
          </div>
          <Button onClick={() => setRunQuery(true)} disabled={!documentId}>
            Fetch
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Signature Status</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
            </div>
          ) : signatureItems.length === 0 ? (
            <div className="text-sm text-muted-foreground">No signatures found.</div>
          ) : (
            <div className="rounded-md border bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Signer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signatureItems.map((item: any, index: number) => (
                    <TableRow key={item.id || index}>
                      <TableCell className="font-medium">
                        {item.signerName || item.signerEmail || item.signer || 'Signer'}
                      </TableCell>
                      <TableCell>{item.status || item.state || 'Unknown'}</TableCell>
                      <TableCell>{item.updatedAt || item.completedAt || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  </TooltipProvider>
  );
}
