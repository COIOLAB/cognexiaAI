'use client';

 import { useRouter, useSearchParams } from 'next/navigation';
 import { ArrowLeft } from 'lucide-react';
 import { PageHeader } from '@/components/PageHeader';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { useGetDashboard } from '@/hooks/useDashboards';

 export default function DashboardPreviewPage() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const dashboardId = searchParams.get('id') || '';
   const { data: dashboard, isLoading } = useGetDashboard(dashboardId);

   if (!dashboardId) {
     return (
       <div className="space-y-4">
         <PageHeader
           title="Dashboard Preview"
           subtitle="Select a dashboard to preview."
           actions={
             <Button variant="outline" onClick={() => router.push('/dashboards')}>
               <ArrowLeft className="mr-2 h-4 w-4" />
               Back to Dashboards
             </Button>
           }
         />
         <div className="text-sm text-muted-foreground">
           No dashboard selected. Choose a dashboard from the list.
         </div>
       </div>
     );
   }

   if (isLoading) {
     return <div className="text-muted-foreground">Loading dashboard...</div>;
   }

   if (!dashboard) {
     return <div className="text-muted-foreground">Dashboard not found.</div>;
   }

   return (
     <div className="space-y-6">
       <PageHeader
         title={dashboard.name}
         subtitle={dashboard.description || 'Dashboard preview'}
         actions={
           <Button variant="outline" onClick={() => router.back()}>
             <ArrowLeft className="mr-2 h-4 w-4" />
             Back
           </Button>
         }
       />

       <Card>
         <CardHeader>
           <CardTitle>Widgets</CardTitle>
         </CardHeader>
         <CardContent className="space-y-3">
           {dashboard.widgets && dashboard.widgets.length ? (
             dashboard.widgets.map((widget: any) => (
               <div key={widget.id} className="rounded-lg border p-3">
                 <div className="font-medium">{widget.title || 'Widget'}</div>
                 <div className="text-xs text-muted-foreground">
                   {widget.type} {widget.chartType ? `· ${widget.chartType}` : ''}
                 </div>
               </div>
             ))
           ) : (
             <div className="text-sm text-muted-foreground">No widgets configured.</div>
           )}
         </CardContent>
       </Card>
     </div>
   );
 }
