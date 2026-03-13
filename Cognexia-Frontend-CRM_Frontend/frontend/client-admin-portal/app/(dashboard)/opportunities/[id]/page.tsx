'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  TrendingUp,
  User,
  Building,
  Package,
  Target,
  Edit,
  Trash2,
} from 'lucide-react';
import { useOpportunity, useUpdateOpportunityStage, useDeleteOpportunity } from '@/hooks/useOpportunities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { OpportunityStage, OpportunityStatus } from '@/types/api.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const stageStyles: Record<OpportunityStage, string> = {
  [OpportunityStage.PROSPECTING]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [OpportunityStage.QUALIFICATION]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  [OpportunityStage.PROPOSAL]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [OpportunityStage.NEGOTIATION]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  [OpportunityStage.CLOSED_WON]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [OpportunityStage.CLOSED_LOST]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const stageOrder = [
  OpportunityStage.PROSPECTING,
  OpportunityStage.QUALIFICATION,
  OpportunityStage.PROPOSAL,
  OpportunityStage.NEGOTIATION,
  OpportunityStage.CLOSED_WON,
  OpportunityStage.CLOSED_LOST,
];

export default function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useOpportunity(id);
  const updateStageMutation = useUpdateOpportunityStage();
  const deleteMutation = useDeleteOpportunity();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading opportunity details...</div>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-600">Opportunity not found</p>
      </div>
    );
  }

  const opportunity = data.data;
  const currentStageIndex = stageOrder.indexOf(opportunity.stage);

  const handleStageChange = (newStage: OpportunityStage) => {
    updateStageMutation.mutate({ id, stage: newStage });
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${opportunity.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          router.push('/opportunities');
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{opportunity.name}</h1>
            <p className="text-muted-foreground mt-1">{opportunity.opportunityCode}</p>
          </div>
          <Badge className={stageStyles[opportunity.stage]} variant="secondary">
            {opportunity.stage.replace(/_/g, ' ')}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={opportunity.stage} onValueChange={(val) => handleStageChange(val as OpportunityStage)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Change stage" />
            </SelectTrigger>
            <SelectContent>
              {stageOrder.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => router.push(`/opportunities/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stage Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Sales Pipeline Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={(currentStageIndex / (stageOrder.length - 1)) * 100} className="h-2" />
            <div className="grid grid-cols-6 gap-2">
              {stageOrder.map((stage, index) => (
                <div
                  key={stage}
                  className={`text-center text-xs ${
                    index <= currentStageIndex
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {stage.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Deal Value Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Deal Value
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Amount</div>
              <div className="text-2xl font-bold">
                ${Number(opportunity.amount ?? 0).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Probability</div>
              <div className="text-xl font-semibold">
                {Number(opportunity.probability ?? 0)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Weighted Value</div>
              <div className="text-lg font-medium text-blue-600">
                ${Number(opportunity.weightedValue ?? 0).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Expected Close Date</div>
              <div className="font-medium">
                {new Date(opportunity.expectedCloseDate).toLocaleDateString()}
              </div>
            </div>
            {opportunity.actualCloseDate && (
              <div>
                <div className="text-sm text-muted-foreground">Actual Close Date</div>
                <div className="font-medium">
                  {new Date(opportunity.actualCloseDate).toLocaleDateString()}
                </div>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground">Created</div>
              <div className="font-medium">
                {new Date(opportunity.createdAt).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Customer ID</div>
              <div className="font-medium">{opportunity.customerId}</div>
            </div>
            {opportunity.contactId && (
              <div>
                <div className="text-sm text-muted-foreground">Contact ID</div>
                <div className="font-medium">{opportunity.contactId}</div>
              </div>
            )}
            {opportunity.assignedTo && (
              <div>
                <div className="text-sm text-muted-foreground">Assigned To</div>
                <div className="font-medium">{opportunity.assignedTo}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Name</div>
                  <div className="mt-1">{opportunity.name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Stage</div>
                  <div className="mt-1">
                    <Badge className={stageStyles[opportunity.stage]} variant="secondary">
                      {opportunity.stage.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <div className="mt-1">
                    <Badge variant={opportunity.status === OpportunityStatus.WON ? 'default' : 'secondary'}>
                      {opportunity.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Amount</div>
                  <div className="mt-1 font-semibold">
                    ${Number(opportunity.amount ?? 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Probability</div>
                  <div className="mt-1">{Number(opportunity.probability ?? 0)}%</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Weighted Value</div>
                  <div className="mt-1 text-blue-600 font-medium">
                    ${Number(opportunity.weightedValue ?? 0).toLocaleString()}
                  </div>
                </div>
              </div>
              {opportunity.description && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Description</div>
                    <p className="text-sm">{opportunity.description}</p>
                  </div>
                </>
              )}
              {opportunity.lostReason && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Lost Reason</div>
                    <p className="text-sm text-red-600">{opportunity.lostReason}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              {opportunity.products && opportunity.products.length > 0 ? (
                <ul className="space-y-2">
                  {opportunity.products.map((product, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                      <span>{product}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No products added yet.</p>
              )}
            </CardContent>
          </Card>

          {opportunity.competitors && opportunity.competitors.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Competitors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {opportunity.competitors.map((competitor, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full bg-orange-600" />
                      <span>{competitor}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">No activities recorded yet.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Notes & Comments</CardTitle>
            </CardHeader>
            <CardContent>
              {opportunity.notes ? (
                <p className="text-sm">{opportunity.notes}</p>
              ) : (
                <p className="text-muted-foreground text-sm">No notes added yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
