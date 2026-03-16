'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Building, Calendar, CheckCircle, XCircle, RefreshCw, Target, Award, Edit, Trash2 } from 'lucide-react';
import { useLead, useLeadScore, useQualifyLead, useConvertLead, useDeleteLead } from '@/hooks/useLeads';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { LeadStatus } from '@/types/api.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import ClickToCall from '@/components/ClickToCall';

const statusStyles: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [LeadStatus.CONTACTED]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  [LeadStatus.QUALIFIED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [LeadStatus.UNQUALIFIED]: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  [LeadStatus.CONVERTED]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  [LeadStatus.LOST]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useLead(id);
  const { data: scoreData } = useLeadScore(id);
  const qualifyMutation = useQualifyLead();
  const convertMutation = useConvertLead();
  const deleteMutation = useDeleteLead();

  const [qualifyDialogOpen, setQualifyDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [qualifyData, setQualifyData] = useState({
    qualified: true,
    notes: '',
    budget: '',
    timeline: '',
  });
  const [convertData, setConvertData] = useState({
    createCustomer: true,
    createOpportunity: true,
  });

  // After delete succeeds, return to list
  if (deleteMutation.isSuccess) {
    router.push('/leads');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading lead details...</div>
      </div>
    );
  }

  if (!data?.data) {
    // If the lead was deleted or not found, bounce to list
    router.push('/leads');
    return null;
  }

  const lead = data.data;

  const handleQualify = () => {
    qualifyMutation.mutate(
      {
        id,
        data: {
          qualified: qualifyData.qualified,
          notes: qualifyData.notes || undefined,
          budget: qualifyData.budget ? Number(qualifyData.budget) : undefined,
          timeline: qualifyData.timeline || undefined,
        },
      },
      {
        onSuccess: () => {
          setQualifyDialogOpen(false);
          setQualifyData({ qualified: true, notes: '', budget: '', timeline: '' });
        },
      }
    );
  };

  const handleConvert = () => {
    convertMutation.mutate(
      { id, data: convertData },
      {
        onSuccess: () => {
          setConvertDialogOpen(false);
          router.push('/leads');
        },
      }
    );
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${lead.fullName}? This action cannot be undone.`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          router.push('/leads');
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
            <h1 className="text-3xl font-bold">{lead.fullName}</h1>
            <p className="text-muted-foreground mt-1">{lead.leadCode}</p>
          </div>
          <Badge className={statusStyles[lead.status]} variant="secondary">
            {lead.status}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          {lead.status !== LeadStatus.QUALIFIED && lead.status !== LeadStatus.CONVERTED && (
            <Button variant="outline" onClick={() => setQualifyDialogOpen(true)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Qualify Lead
            </Button>
          )}
          {lead.status === LeadStatus.QUALIFIED && (
            <Button onClick={() => setConvertDialogOpen(true)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Convert Lead
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push(`/leads/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Lead Score Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <Award className="h-4 w-4 mr-2" />
              Lead Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{Number(lead.score ?? 0)}</div>
            <Progress value={Number(lead.score ?? 0)} className="mb-4" />
            {scoreData?.data && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Engagement:</span>
                  <span className="font-medium">
                    {Number(scoreData.data.breakdown?.engagement ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Demographics:</span>
                  <span className="font-medium">
                    {Number(scoreData.data.breakdown?.demographics ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Behavior:</span>
                  <span className="font-medium">
                    {Number(scoreData.data.breakdown?.behavior ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Firmographics:</span>
                  <span className="font-medium">
                    {Number(scoreData.data.breakdown?.firmographics ?? 0)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{lead.email}</span>
              </div>
              {lead.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{lead.phone}</span>
                </div>
              )}
              {lead.company && (
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{lead.company}</span>
                </div>
              )}
              {lead.title && (
                <div className="flex items-start space-x-2">
                  <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{lead.title}</span>
                </div>
              )}
            </div>
            <ClickToCall defaultNumber={lead.phone || ''} />
          </CardContent>
        </Card>

        {/* Lead Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Lead Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Source</div>
              <div className="font-medium capitalize">{lead.source.replace(/_/g, ' ')}</div>
            </div>
            {lead.budget && (
              <div>
                <div className="text-sm text-muted-foreground">Budget</div>
                <div className="font-medium">
                  ${Number(lead.budget ?? 0).toLocaleString()}
                </div>
              </div>
            )}
            {lead.timeline && (
              <div>
                <div className="text-sm text-muted-foreground">Timeline</div>
                <div className="font-medium">{lead.timeline}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground">Created</div>
              <div className="font-medium">{new Date(lead.createdAt).toLocaleDateString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Full Name</div>
                  <div className="mt-1">{lead.fullName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Email</div>
                  <div className="mt-1">{lead.email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Phone</div>
                  <div className="mt-1">{lead.phone || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Company</div>
                  <div className="mt-1">{lead.company || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Title</div>
                  <div className="mt-1">{lead.title || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <div className="mt-1">
                    <Badge className={statusStyles[lead.status]} variant="secondary">
                      {lead.status}
                    </Badge>
                  </div>
                </div>
              </div>
              {lead.notes && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Notes</div>
                    <p className="text-sm">{lead.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
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
              <p className="text-muted-foreground text-sm">No notes added yet.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Qualify Dialog */}
      <Dialog open={qualifyDialogOpen} onOpenChange={setQualifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Qualify Lead</DialogTitle>
            <DialogDescription>
              Mark this lead as qualified or unqualified and add additional details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={qualifyData.qualified}
                onCheckedChange={(checked) =>
                  setQualifyData({ ...qualifyData, qualified: checked as boolean })
                }
              />
              <Label>Mark as Qualified</Label>
            </div>
            <div>
              <Label>Budget (Optional)</Label>
              <Input
                type="number"
                placeholder="Enter budget amount"
                value={qualifyData.budget}
                onChange={(e) => setQualifyData({ ...qualifyData, budget: e.target.value })}
              />
            </div>
            <div>
              <Label>Timeline (Optional)</Label>
              <Input
                placeholder="e.g. Q1 2026, 3 months"
                value={qualifyData.timeline}
                onChange={(e) => setQualifyData({ ...qualifyData, timeline: e.target.value })}
              />
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Add qualification notes..."
                value={qualifyData.notes}
                onChange={(e) => setQualifyData({ ...qualifyData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQualifyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleQualify}>Qualify Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert Dialog */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert Lead</DialogTitle>
            <DialogDescription>
              Convert this qualified lead into a customer and/or opportunity.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={convertData.createCustomer}
                onCheckedChange={(checked) =>
                  setConvertData({ ...convertData, createCustomer: checked as boolean })
                }
              />
              <Label>Create Customer</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={convertData.createOpportunity}
                onCheckedChange={(checked) =>
                  setConvertData({ ...convertData, createOpportunity: checked as boolean })
                }
              />
              <Label>Create Opportunity</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConvert}>Convert Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
