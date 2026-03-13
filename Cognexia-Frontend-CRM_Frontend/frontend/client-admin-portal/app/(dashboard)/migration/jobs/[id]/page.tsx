'use client';

 import { useParams, useRouter } from 'next/navigation';
 import { ArrowLeft, RotateCcw, XCircle } from 'lucide-react';
 import { PageHeader } from '@/components/PageHeader';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Button } from '@/components/ui/button';
 import { Progress } from '@/components/ui/progress';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import {
   useCancelMigrationJob,
   useGetMigrationJob,
   useRetryFailedRecords,
   useRollbackMigration,
 } from '@/hooks/useMigration';

 const statusVariant = (status?: string) => {
   if (status === 'COMPLETED') return 'default';
   if (status === 'FAILED') return 'destructive';
   if (status === 'PROCESSING') return 'secondary';
   return 'outline';
 };

 export default function MigrationJobDetailPage() {
   const params = useParams();
   const router = useRouter();
   const jobId = params.id as string;
   const { data: job, isLoading } = useGetMigrationJob(jobId);
   const cancelJob = useCancelMigrationJob();
   const retryFailed = useRetryFailedRecords();
   const rollbackJob = useRollbackMigration();

   if (isLoading) {
     return <div className="text-muted-foreground">Loading migration job...</div>;
   }

   if (!job) {
     return <div className="text-muted-foreground">Migration job not found.</div>;
   }

   const total = job.totalRecords || 0;
   const processed = job.processedRecords || 0;
   const progress = total > 0 ? Math.round((processed / total) * 100) : 0;
   const canCancel = job.status === 'PROCESSING' || job.status === 'PENDING';
   const hasFailed = (job.failedRecords || 0) > 0;
   const canRollback = job.status === 'COMPLETED';

   return (
     <div className="space-y-6">
       <PageHeader
         title={job.jobName}
         subtitle={`Target: ${job.targetEntity}`}
         actions={
           <div className="flex flex-wrap gap-2">
             <Button variant="outline" onClick={() => router.back()}>
               <ArrowLeft className="mr-2 h-4 w-4" />
               Back
             </Button>
             {canCancel && (
               <Button
                 variant="outline"
                 onClick={() => cancelJob.mutate(job.id)}
                 disabled={cancelJob.isPending}
               >
                 Cancel Job
               </Button>
             )}
             {hasFailed && (
               <Button
                 variant="outline"
                 onClick={() => retryFailed.mutate(job.id)}
                 disabled={retryFailed.isPending}
               >
                 <RotateCcw className="mr-2 h-4 w-4" />
                 Retry Failed
               </Button>
             )}
             {canRollback && (
               <Button
                 variant="destructive"
                 onClick={() => {
                   if (confirm('Rollback this migration?')) {
                     rollbackJob.mutate(job.id);
                   }
                 }}
                 disabled={rollbackJob.isPending}
               >
                 <XCircle className="mr-2 h-4 w-4" />
                 Rollback
               </Button>
             )}
           </div>
         }
       />

       <div className="grid gap-4 md:grid-cols-4">
         <Card>
           <CardHeader>
             <CardTitle className="text-sm">Status</CardTitle>
           </CardHeader>
           <CardContent>
             <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
           </CardContent>
         </Card>
         <Card>
           <CardHeader>
             <CardTitle className="text-sm">Processed</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{processed}</div>
           </CardContent>
         </Card>
         <Card>
           <CardHeader>
             <CardTitle className="text-sm">Successful</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{job.successfulRecords || 0}</div>
           </CardContent>
         </Card>
         <Card>
           <CardHeader>
             <CardTitle className="text-sm">Failed</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-red-600">{job.failedRecords || 0}</div>
           </CardContent>
         </Card>
       </div>

       <Card>
         <CardHeader>
           <CardTitle>Progress</CardTitle>
         </CardHeader>
         <CardContent className="space-y-2">
           <Progress value={progress} className="h-2" />
           <div className="text-sm text-muted-foreground">
             {processed} / {total} records processed
           </div>
         </CardContent>
       </Card>

       <Card>
         <CardHeader>
           <CardTitle>Errors</CardTitle>
         </CardHeader>
         <CardContent>
           {Array.isArray(job.errors) && job.errors.length ? (
             <div className="rounded-md border bg-background">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Row</TableHead>
                     <TableHead>Message</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {job.errors.map((error: any, index: number) => (
                     <TableRow key={error.row || index}>
                       <TableCell>{error.row ?? index + 1}</TableCell>
                       <TableCell>{error.message || error.error || 'Unknown error'}</TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </div>
           ) : (
             <div className="text-sm text-muted-foreground">No errors reported.</div>
           )}
         </CardContent>
       </Card>
     </div>
   );
 }
