'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customReportingAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { FileText, Play, Trash2 } from 'lucide-react';

export default function CustomReportsPage() {
  const queryClient = useQueryClient();

  const { data: reports } = useQuery({
    queryKey: ['custom-reports'],
    queryFn: () => customReportingAPI.getAllReports(),
  });

  const runReportMutation = useMutation({
    mutationFn: customReportingAPI.runReport,
    onSuccess: (data) => {
      toast.success('Report generated');
      console.log('Report data:', data);
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: customReportingAPI.deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-reports'] });
      toast.success('Report deleted');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Custom Reports</h1>
        <Button><FileText className="h-4 w-4 mr-2" />Create Report</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports?.map((report: any) => (
              <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{report.name}</p>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                  <p className="text-xs text-muted-foreground">Run {report.runCount} times</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => runReportMutation.mutate(report.id)}>
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteReportMutation.mutate(report.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

