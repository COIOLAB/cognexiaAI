'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Edit,
  Mail,
  MapPin,
  Phone,
  Trash2,
  Globe,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useCustomer, useDeleteCustomer } from '@/hooks/useCustomers';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { CustomerActivitiesTab } from '@/components/customers/customer-activities-tab';
import { CustomerContactsTab } from '@/components/customers/customer-contacts-tab';
import { CustomerOpportunitiesTab } from '@/components/customers/customer-opportunities-tab';
import { useGetDocuments } from '@/hooks/useDocuments';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const { data, isLoading, error } = useCustomer(customerId);
  const deleteMutation = useDeleteCustomer();
  const { data: documentsData } = useGetDocuments();

  const customer = data?.data;
  const documents = (documentsData as any) || [];
  const customerDocuments = Array.isArray(documents)
    ? documents.filter(
        (doc: any) =>
          doc.entityId === customerId ||
          doc.entityType?.toLowerCase() === 'customer',
      )
    : [];

  const handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete ${customer?.companyName}? This action cannot be undone.`
      )
    ) {
      deleteMutation.mutate(customerId, {
        onSuccess: () => {
          router.push('/customers');
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold">Customer not found</h2>
        <Button onClick={() => router.push('/customers')}>Back to Customers</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{customer.companyName}</h1>
              <Badge
                variant={
                  customer.status === 'active'
                    ? 'default'
                    : customer.status === 'inactive'
                    ? 'secondary'
                    : customer.status === 'prospect'
                    ? 'outline'
                    : 'destructive'
                }
                className="capitalize"
              >
                {customer.status}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {customer.segmentation.tier}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Customer since {format(new Date(customer.relationshipMetrics.customerSince), 'MMMM yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/customers/${customerId}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Number(customer.salesMetrics?.totalRevenue ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg order: ${Number(customer.salesMetrics?.averageOrderValue ?? 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(customer.relationshipMetrics?.satisfactionScore ?? 0)}/10
            </div>
            <p className="text-xs text-muted-foreground">
              NPS: {Number(customer.relationshipMetrics?.npsScore ?? 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(customer.relationshipMetrics?.loyaltyScore ?? 0)}/10
            </div>
            <p className="text-xs text-muted-foreground">
              {customer.segmentation.riskLevel} risk
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Contact</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customer.relationshipMetrics.lastInteractionDate
                ? format(new Date(customer.relationshipMetrics.lastInteractionDate), 'd')
                : '—'}
            </div>
            <p className="text-xs text-muted-foreground">days ago</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Customer Code</p>
                    <p className="font-mono">{customer.customerCode}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <p className="capitalize">{customer.customerType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Industry</p>
                    <p className="capitalize">{customer.industry}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Company Size</p>
                    <p className="capitalize">{customer.size.replace('_', ' ')}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p>{customer.address.street}</p>
                      <p>
                        {customer.address.city}
                        {customer.address.state && `, ${customer.address.state}`}{' '}
                        {customer.address.zipCode}
                      </p>
                      <p>{customer.address.country}</p>
                    </div>
                  </div>

                  {customer.demographics.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={customer.demographics.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {customer.demographics.website}
                      </a>
                    </div>
                  )}
                </div>

                {customer.tags && customer.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {customer.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Primary Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Primary Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold">
                    {customer.primaryContact.firstName} {customer.primaryContact.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{customer.primaryContact.title}</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${customer.primaryContact.email}`}
                      className="text-sm hover:underline"
                    >
                      {customer.primaryContact.email}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${customer.primaryContact.phone}`}
                      className="text-sm hover:underline"
                    >
                      {customer.primaryContact.phone}
                    </a>
                  </div>

                  {customer.primaryContact.linkedin && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={customer.primaryContact.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Demographics */}
            {customer.demographics && (
              <Card>
                <CardHeader>
                  <CardTitle>Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {customer.demographics.foundedYear && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Founded</p>
                        <p>{customer.demographics.foundedYear}</p>
                      </div>
                    )}
                    {customer.demographics.employeeCount && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Employees</p>
                        <p>{Number(customer.demographics.employeeCount ?? 0).toLocaleString()}</p>
                      </div>
                    )}
                    {customer.demographics.annualRevenue && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Annual Revenue</p>
                        <p>${Number(customer.demographics.annualRevenue ?? 0).toLocaleString()}</p>
                      </div>
                    )}
                    {customer.demographics.taxId && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tax ID</p>
                        <p className="font-mono text-sm">{customer.demographics.taxId}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Segmentation */}
            <Card>
              <CardHeader>
                <CardTitle>Segmentation & Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Segment</p>
                    <p className="capitalize">{customer.segmentation.segment}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tier</p>
                    <Badge variant="outline" className="capitalize">
                      {customer.segmentation.tier}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                    <Badge
                      variant={
                        customer.segmentation.riskLevel === 'low'
                          ? 'default'
                          : customer.segmentation.riskLevel === 'high'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="capitalize"
                    >
                      {customer.segmentation.riskLevel}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Growth Potential</p>
                    <Badge variant="outline" className="capitalize">
                      {customer.segmentation.growthPotential.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contacts">
          <CustomerContactsTab customerId={customerId} />
        </TabsContent>

        <TabsContent value="opportunities">
          <CustomerOpportunitiesTab customerId={customerId} />
        </TabsContent>

        <TabsContent value="activities">
          <CustomerActivitiesTab customerId={customerId} />
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Contracts, invoices, and other documents</CardDescription>
            </CardHeader>
            <CardContent>
              {customerDocuments.length ? (
                <div className="rounded-md border bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Uploaded</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerDocuments.slice(0, 10).map((doc: any) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.name || doc.fileName}</TableCell>
                          <TableCell>{doc.documentType}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{doc.status}</Badge>
                          </TableCell>
                          <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No documents linked to this customer.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
