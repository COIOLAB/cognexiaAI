'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Download, Calendar, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetReport, useRunReport } from '@/hooks/useReports';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = params.id as string;

  const { data: report, isLoading } = useGetReport(reportId);
  const runReport = useRunReport(reportId);
  const [result, setResult] = useState<any | null>(null);

  if (isLoading) return <div>Loading...</div>;
  if (!report) return <div>Report not found</div>;

  const resultData = result?.data ?? result;
  const resultEntries = resultData && !Array.isArray(resultData) ? Object.entries(resultData) : [];
  const resultRows = Array.isArray(resultData) ? resultData : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={report.name}
        subtitle={report.description}
        actions={
          <>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/reports">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                runReport.mutate(undefined, {
                  onSuccess: (data) => setResult(data),
                })
              }
              disabled={runReport.isPending}
            >
              <Play className="mr-2 h-4 w-4" />
              {runReport.isPending ? 'Running...' : 'Run'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (!result) return;
                const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `report-${report.id}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
              }}
              disabled={!result}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" asChild>
              <Link href="/reports/schedules">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule
              </Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Report Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          {runReport.isPending ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Execution time: {result.executionTime ?? 'n/a'} ms
              </div>
              {Array.isArray(resultRows) && resultRows.length > 0 ? (
                <div className="rounded-md border bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(resultRows[0] || {}).slice(0, 6).map((key) => (
                          <TableHead key={key}>{key}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resultRows.slice(0, 20).map((row: any, index: number) => (
                        <TableRow key={row.id || index}>
                          {Object.keys(resultRows[0] || {}).slice(0, 6).map((key) => (
                            <TableCell key={key}>{String(row?.[key] ?? '—')}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : resultEntries.length > 0 ? (
                <div className="rounded-md border bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resultEntries.map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium">{key}</TableCell>
                          <TableCell>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No data returned.</div>
              )}
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">
                Run the report to view {report.chartType} data.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
