 'use client';

 import { useParams, useRouter } from 'next/navigation';
 import { ArrowLeft, Trash2 } from 'lucide-react';
 import { PageHeader } from '@/components/PageHeader';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Button } from '@/components/ui/button';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { useDeleteDocument, useGetDocument, useGetDocumentVersions } from '@/hooks/useDocuments';

 export default function DocumentDetailPage() {
   const params = useParams();
   const router = useRouter();
   const documentId = params.id as string;
   const { data: document, isLoading } = useGetDocument(documentId);
   const { data: versions } = useGetDocumentVersions(documentId);
   const deleteDocument = useDeleteDocument();

   if (isLoading) {
     return <div className="text-muted-foreground">Loading document...</div>;
   }

   if (!document) {
     return <div className="text-muted-foreground">Document not found.</div>;
   }

   return (
     <div className="space-y-6">
       <PageHeader
         title={document.name}
         subtitle={document.fileName}
         actions={
           <div className="flex flex-wrap gap-2">
             <Button variant="outline" onClick={() => router.back()}>
               <ArrowLeft className="mr-2 h-4 w-4" />
               Back
             </Button>
             <Button
               variant="destructive"
               onClick={() => {
                 if (confirm(`Delete ${document.name}? This action cannot be undone.`)) {
                   deleteDocument.mutate(documentId, {
                     onSuccess: () => router.push('/documents'),
                   });
                 }
               }}
               disabled={deleteDocument.isPending}
             >
               <Trash2 className="mr-2 h-4 w-4" />
               Delete
             </Button>
           </div>
         }
       />

       <div className="grid gap-4 md:grid-cols-3">
         <Card>
           <CardHeader>
             <CardTitle className="text-sm">Type</CardTitle>
           </CardHeader>
           <CardContent>
             <Badge variant="outline">{document.documentType}</Badge>
           </CardContent>
         </Card>
         <Card>
           <CardHeader>
             <CardTitle className="text-sm">Status</CardTitle>
           </CardHeader>
           <CardContent>
             <Badge variant="outline">{document.status}</Badge>
           </CardContent>
         </Card>
         <Card>
           <CardHeader>
             <CardTitle className="text-sm">Version</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">v{document.currentVersion}</div>
           </CardContent>
         </Card>
       </div>

       <Card>
         <CardHeader>
           <CardTitle>Metadata</CardTitle>
         </CardHeader>
         <CardContent className="grid gap-3 md:grid-cols-2">
           <div>
             <div className="text-sm text-muted-foreground">Size</div>
             <div className="font-medium">{Math.round(document.fileSize / 1024)} KB</div>
           </div>
           <div>
             <div className="text-sm text-muted-foreground">Uploaded By</div>
             <div className="font-medium">{document.uploadedByName || document.uploadedById}</div>
           </div>
           <div>
             <div className="text-sm text-muted-foreground">Created</div>
             <div className="font-medium">{new Date(document.createdAt).toLocaleString()}</div>
           </div>
           <div>
             <div className="text-sm text-muted-foreground">Last Updated</div>
             <div className="font-medium">{new Date(document.updatedAt).toLocaleString()}</div>
           </div>
         </CardContent>
       </Card>

       <Card>
         <CardHeader>
           <CardTitle>Versions</CardTitle>
         </CardHeader>
         <CardContent>
           {Array.isArray(versions) && versions.length ? (
             <div className="rounded-md border bg-background">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Version</TableHead>
                     <TableHead>File Name</TableHead>
                     <TableHead>Uploaded By</TableHead>
                     <TableHead>Created</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {versions.map((version: any) => (
                     <TableRow key={version.id}>
                       <TableCell>v{version.version}</TableCell>
                       <TableCell>{version.fileName}</TableCell>
                       <TableCell>{version.uploadedByName || version.uploadedById}</TableCell>
                       <TableCell>{new Date(version.createdAt).toLocaleString()}</TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </div>
           ) : (
             <div className="text-sm text-muted-foreground">No previous versions.</div>
           )}
         </CardContent>
       </Card>
     </div>
   );
 }
