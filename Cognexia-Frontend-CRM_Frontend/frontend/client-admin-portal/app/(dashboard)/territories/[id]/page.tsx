 'use client';

 import { useEffect, useState } from 'react';
 import { useParams, useRouter } from 'next/navigation';
 import Link from 'next/link';
 import { ArrowLeft, Trash2 } from 'lucide-react';
 import { PageHeader } from '@/components/PageHeader';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Switch } from '@/components/ui/switch';
 import { Badge } from '@/components/ui/badge';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { useDeleteTerritory, useGetTerritory, useUpdateTerritory } from '@/hooks/useTerritories';

 export default function TerritoryDetailPage() {
   const params = useParams();
   const router = useRouter();
   const territoryId = params.id as string;
   const { data, isLoading } = useGetTerritory(territoryId);
   const updateTerritory = useUpdateTerritory();
   const deleteTerritory = useDeleteTerritory();

   const territory = data as any;
   const [name, setName] = useState('');
   const [description, setDescription] = useState('');
   const [active, setActive] = useState(true);
   const [hasCapacityLimit, setHasCapacityLimit] = useState(false);
   const [maxLeadsPerUser, setMaxLeadsPerUser] = useState('50');

   useEffect(() => {
     if (territory) {
       setName(territory.name || '');
       setDescription(territory.description || '');
       setActive(Boolean(territory.active));
       setHasCapacityLimit(Boolean(territory.hasCapacityLimit));
       setMaxLeadsPerUser(String(territory.maxLeadsPerUser ?? 50));
     }
   }, [territory]);

   if (isLoading) {
     return <div className="text-muted-foreground">Loading territory...</div>;
   }

   if (!territory) {
     return <div className="text-muted-foreground">Territory not found.</div>;
   }

   const criteriaEntries = territory.criteria ? Object.entries(territory.criteria) : [];
   const isFormValid = Boolean(name.trim());

   return (
     <div className="space-y-6">
       <PageHeader
         title="Territory Details"
         subtitle={territory.name}
         actions={
           <div className="flex flex-wrap gap-2">
             <Button variant="outline" asChild>
               <Link href="/territories">
                 <ArrowLeft className="mr-2 h-4 w-4" />
                 Back
               </Link>
             </Button>
             <Button
               variant="destructive"
               onClick={() => {
                 if (confirm('Delete this territory?')) {
                   deleteTerritory.mutate(territoryId, {
                     onSuccess: () => router.push('/territories'),
                   });
                 }
               }}
               disabled={deleteTerritory.isPending}
             >
               <Trash2 className="mr-2 h-4 w-4" />
               Delete
             </Button>
           </div>
         }
       />

       <div className="grid gap-4 md:grid-cols-4">
         <Card>
           <CardHeader>
             <CardTitle className="text-sm">Status</CardTitle>
           </CardHeader>
           <CardContent>
             <Badge variant={active ? 'default' : 'secondary'}>
               {active ? 'Active' : 'Inactive'}
             </Badge>
           </CardContent>
         </Card>
         <Card>
           <CardHeader>
             <CardTitle className="text-sm">Leads Assigned</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{territory.totalLeadsAssigned ?? 0}</div>
           </CardContent>
         </Card>
         <Card>
           <CardHeader>
             <CardTitle className="text-sm">Active Leads</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{territory.activeLeads ?? 0}</div>
           </CardContent>
         </Card>
         <Card>
           <CardHeader>
             <CardTitle className="text-sm">Conversion Rate</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{(territory.conversionRate ?? 0).toFixed(1)}%</div>
           </CardContent>
         </Card>
       </div>

       <Card>
         <CardHeader>
           <CardTitle>Territory Settings</CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           <div>
             <label className="text-sm font-medium">Name</label>
             <Input value={name} onChange={(event) => setName(event.target.value)} />
           </div>
           <div>
             <label className="text-sm font-medium">Description</label>
             <Input value={description} onChange={(event) => setDescription(event.target.value)} />
           </div>
           <div className="flex items-center justify-between rounded-lg border px-3 py-2">
             <div>
               <div className="text-sm font-medium">Active</div>
               <div className="text-xs text-muted-foreground">Enable this territory.</div>
             </div>
             <Switch checked={active} onCheckedChange={setActive} />
           </div>
           <div className="flex items-center justify-between rounded-lg border px-3 py-2">
             <div>
               <div className="text-sm font-medium">Capacity Limit</div>
               <div className="text-xs text-muted-foreground">Limit max leads per user.</div>
             </div>
             <Switch checked={hasCapacityLimit} onCheckedChange={setHasCapacityLimit} />
           </div>
           {hasCapacityLimit && (
             <div>
               <label className="text-sm font-medium">Max Leads per User</label>
               <Input
                 type="number"
                 min="1"
                 value={maxLeadsPerUser}
                 onChange={(event) => setMaxLeadsPerUser(event.target.value)}
               />
             </div>
           )}
           <div className="flex justify-end">
             <Button
               onClick={() =>
                 updateTerritory.mutate({
                   id: territoryId,
                   dto: {
                     name: name.trim(),
                     description: description || undefined,
                     active,
                     hasCapacityLimit,
                     maxLeadsPerUser: hasCapacityLimit ? Number(maxLeadsPerUser) : undefined,
                   },
                 })
               }
               disabled={!isFormValid || updateTerritory.isPending}
             >
               {updateTerritory.isPending ? 'Saving...' : 'Save Changes'}
             </Button>
           </div>
         </CardContent>
       </Card>

       <Card>
         <CardHeader>
           <CardTitle>Territory Criteria</CardTitle>
         </CardHeader>
         <CardContent>
           {criteriaEntries.length ? (
             <div className="rounded-md border bg-background">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Field</TableHead>
                     <TableHead>Value</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {criteriaEntries.map(([key, value]) => (
                     <TableRow key={key}>
                       <TableCell className="font-medium">{key}</TableCell>
                       <TableCell>
                         {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </div>
           ) : (
             <div className="text-sm text-muted-foreground">No criteria defined.</div>
           )}
         </CardContent>
       </Card>
     </div>
   );
 }
