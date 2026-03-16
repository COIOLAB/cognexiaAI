'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building, Globe, Users, Target, TrendingUp, DollarSign } from 'lucide-react';
import {
  useAccount,
  useAccountHierarchy,
  useAccountCustomers,
  useAccountOpportunities,
  useDeleteAccount,
} from '@/hooks/useAccounts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AccountType, AccountStatus } from '@/types/api.types';

const typeStyles: Record<AccountType, string> = {
  [AccountType.PROSPECT]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [AccountType.CUSTOMER]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [AccountType.PARTNER]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  [AccountType.COMPETITOR]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  [AccountType.VENDOR]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [AccountType.RESELLER]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
};

const statusStyles: Record<AccountStatus, string> = {
  [AccountStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [AccountStatus.INACTIVE]: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  [AccountStatus.POTENTIAL]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [AccountStatus.LOST]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  [AccountStatus.CHURNED]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
};

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useAccount(id);
  const { data: hierarchy } = useAccountHierarchy(id);
  const { data: customers } = useAccountCustomers(id);
  const { data: opportunities } = useAccountOpportunities(id);
  const deleteAccount = useDeleteAccount();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading account details...</div>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-600">Account not found</p>
      </div>
    );
  }

  const account = data.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{account.name}</h1>
            <p className="text-muted-foreground mt-1">{account.accountNumber}</p>
          </div>
          <Badge className={typeStyles[account.type]} variant="secondary">
            {account.type}
          </Badge>
          <Badge className={statusStyles[account.status]} variant="secondary">
            {account.status}
          </Badge>
        </div>
        <Button onClick={() => router.push(`/accounts/${id}/edit`)}>
          Edit Account
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            if (confirm(`Delete ${account.name}? This action cannot be undone.`)) {
              deleteAccount.mutate(id, {
                onSuccess: () => router.push('/accounts'),
              });
            }
          }}
          disabled={deleteAccount.isPending}
        >
          Delete
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Revenue Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${(Number(account.revenue ?? 0) / 1000000).toFixed(2)}M
            </div>
            {account.details?.annualRevenue != null && (
              <p className="text-sm text-muted-foreground mt-1">
                Annual: ${(Number(account.details.annualRevenue ?? 0) / 1000000).toFixed(1)}M
              </p>
            )}
          </CardContent>
        </Card>

        {/* Priority Score Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Priority Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Number(account.priorityScore ?? 0)}</div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full ${
                  Number(account.priorityScore ?? 0) >= 75
                    ? 'bg-green-500'
                    : Number(account.priorityScore ?? 0) >= 50
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${Number(account.priorityScore ?? 0)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Team Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-muted-foreground">Owner</div>
                <div className="font-medium">{account.owner}</div>
              </div>
              {account.team.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground">Team Members</div>
                  <div className="font-medium">{account.team.length} members</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
          <TabsTrigger value="customers">Customers ({customers?.data?.length || 0})</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities ({opportunities?.data?.length || 0})</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Account Name</div>
                  <div className="mt-1">{account.name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Industry</div>
                  <div className="mt-1">{account.industry}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Type</div>
                  <div className="mt-1">
                    <Badge className={typeStyles[account.type]} variant="secondary">
                      {account.type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <div className="mt-1">
                    <Badge className={statusStyles[account.status]} variant="secondary">
                      {account.status}
                    </Badge>
                  </div>
                </div>
                {account.website && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Website</div>
                    <div className="mt-1 flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      <a
                        href={account.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {account.website}
                      </a>
                    </div>
                  </div>
                )}
                {account.parentAccount && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Parent Account</div>
                    <div className="mt-1">{account.parentAccount}</div>
                  </div>
                )}
              </div>

              {account.tags.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {account.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hierarchy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Account Hierarchy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hierarchy?.data?.parent && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Parent Account</div>
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium">{hierarchy.data.parent.name}</div>
                    <div className="text-sm text-muted-foreground">{hierarchy.data.parent.accountNumber}</div>
                  </div>
                </div>
              )}

              {hierarchy?.data?.children && hierarchy.data.children.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Child Accounts ({hierarchy.data.children.length})
                  </div>
                  <div className="space-y-2">
                    {hierarchy.data.children.map((child) => (
                      <div key={child.id} className="p-4 border rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => router.push(`/accounts/${child.id}`)}>
                        <div className="font-medium">{child.name}</div>
                        <div className="text-sm text-muted-foreground">{child.accountNumber} • {child.industry}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!hierarchy?.data?.parent && (!hierarchy?.data?.children || hierarchy.data.children.length === 0) && (
                <p className="text-muted-foreground text-sm">No hierarchy information available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customers</CardTitle>
            </CardHeader>
            <CardContent>
              {customers?.data && customers.data.length > 0 ? (
                <div className="space-y-2">
                  {customers.data.map((customer: Record<string, unknown>) => {
                    const name = String(customer.companyName ?? customer.name ?? '');
                    const code = String(customer.customerCode ?? '');
                    return (
                      <div
                        key={String(customer.id ?? customer.customerCode ?? customer.name ?? '')}
                        className="p-4 border rounded-lg"
                      >
                        <div className="font-medium">{name}</div>
                        <div className="text-sm text-muted-foreground">{code}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No customers found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {opportunities?.data && opportunities.data.length > 0 ? (
                <div className="space-y-2">
                  {opportunities.data.map((opportunity: Record<string, unknown>) => {
                    const name = String(opportunity.name ?? '');
                    const stage = String(opportunity.stage ?? '');
                    const amount = Number(opportunity.amount ?? 0);
                    return (
                      <div
                        key={String(opportunity.id ?? opportunity.name ?? '')}
                        className="p-4 border rounded-lg"
                      >
                        <div className="font-medium">{name}</div>
                        <div className="text-sm text-muted-foreground">
                          ${amount.toLocaleString()} • {stage}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No opportunities found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {account.details?.employees && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Employees</div>
                    <div className="mt-1">
                      {Number(account.details.employees ?? 0).toLocaleString()}
                    </div>
                  </div>
                )}
                {account.details?.territory && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Territory</div>
                    <div className="mt-1">{account.details.territory}</div>
                  </div>
                )}
                {account.details?.segment && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Segment</div>
                    <div className="mt-1">{account.details.segment}</div>
                  </div>
                )}
                {account.details?.tier && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Tier</div>
                    <div className="mt-1">{account.details.tier}</div>
                  </div>
                )}
              </div>

              {account.details?.description && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Description</div>
                    <p className="text-sm">{account.details.description}</p>
                  </div>
                </>
              )}

              <Separator />
              <div className="grid gap-4 md:grid-cols-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Created</div>
                  <div>{new Date(account.createdAt).toLocaleString()}</div>
                  <div className="text-muted-foreground text-xs mt-1">by {account.createdBy}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Last Updated</div>
                  <div>{new Date(account.updatedAt).toLocaleString()}</div>
                  <div className="text-muted-foreground text-xs mt-1">by {account.updatedBy}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
