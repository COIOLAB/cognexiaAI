'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  Calendar,
  CreditCard,
  AlertTriangle,
  Zap,
  Crown,
  Building2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api-client';

interface Organization {
  id: string;
  name: string;
  subscriptionStatus: string;
  subscriptionPlanId?: string;
  subscriptionPlan?: SubscriptionPlan;
  maxUsers: number;
  currentUserCount: number;
  trialEndsAt?: string;
  nextBillingDate?: string;
  monthlyRevenue: number;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingInterval: 'monthly' | 'yearly';
  includedUsers: number;
  trialDays: number;
  features: string[];
}

interface SeatUsage {
  currentUsers: number;
  maxUsers: number;
  availableSeats: number;
  usagePercentage: number;
  canAddUsers: boolean;
}

export default function SubscriptionPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  // Fetch organization details
  const { data: organization, isLoading: loadingOrg } = useQuery<Organization>({
    queryKey: ['organization'],
    queryFn: async () => {
      const organizationId = localStorage.getItem('organizationId');
      const response = await apiClient.get(`/organizations/${organizationId}`);
      return response.data;
    },
  });

  // Fetch available plans
  const { data: availablePlans, isLoading: loadingPlans } = useQuery<SubscriptionPlan[]>({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const response = await apiClient.get('/subscription-plans');
      return response.data;
    },
  });

  // Fetch seat usage
  const { data: seatUsage } = useQuery<SeatUsage>({
    queryKey: ['seat-usage'],
    queryFn: async () => {
      const organizationId = localStorage.getItem('organizationId');
      const response = await apiClient.get(`/organizations/${organizationId}/seat-usage`);
      return response.data;
    },
  });

  // Upgrade subscription mutation
  const upgradeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const organizationId = localStorage.getItem('organizationId');
      const response = await apiClient.post(`/organizations/${organizationId}/upgrade`, { planId });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Upgrade initiated',
        description: 'Your subscription upgrade has been initiated. Redirecting to payment...',
      });
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      queryClient.invalidateQueries({ queryKey: ['seat-usage'] });
      setUpgradeDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Upgrade failed',
        description: error.response?.data?.message || 'Failed to initiate upgrade',
        variant: 'destructive',
      });
    },
  });

  const handleUpgradeClick = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setUpgradeDialogOpen(true);
  };

  const confirmUpgrade = () => {
    if (selectedPlan) {
      upgradeMutation.mutate(selectedPlan.id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string; icon: any }> = {
      active: { variant: 'default', label: 'Active', icon: CheckCircle2 },
      trial: { variant: 'secondary', label: 'Trial', icon: Zap },
      past_due: { variant: 'destructive', label: 'Past Due', icon: AlertTriangle },
      cancelled: { variant: 'destructive', label: 'Cancelled', icon: XCircle },
      expired: { variant: 'destructive', label: 'Expired', icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.expired;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes('enterprise')) return Crown;
    if (planName.toLowerCase().includes('business')) return Building2;
    return Users;
  };

  if (loadingOrg || loadingPlans) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentPlan = organization?.subscriptionPlan;
  const isOnTrial = organization?.subscriptionStatus === 'trial';
  const trialDaysRemaining = organization?.trialEndsAt
    ? Math.ceil((new Date(organization.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CreditCard className="h-8 w-8" />
          Subscription & Billing
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription plan and billing information
        </p>
      </div>

      {/* Trial Warning */}
      {isOnTrial && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Trial Period:</strong> {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining.
            Upgrade to a paid plan to continue using all features after your trial ends.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </div>
            {getStatusBadge(organization?.subscriptionStatus || 'expired')}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentPlan ? (
            <>
              <div className="flex items-center gap-4">
                {(() => {
                  const PlanIcon = getPlanIcon(currentPlan.name);
                  return <PlanIcon className="h-12 w-12 text-primary" />;
                })()}
                <div>
                  <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
                  <p className="text-muted-foreground">
                    ${currentPlan.price}/{currentPlan.billingInterval}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    User Seats
                  </div>
                  <p className="text-2xl font-bold">
                    {Number(organization?.currentUserCount ?? 0)} / {Number(currentPlan.includedUsers ?? 0)}
                  </p>
                  {seatUsage && (
                    <Progress value={seatUsage.usagePercentage} className="h-2" />
                  )}
                </div>

                {organization?.nextBillingDate && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Next Billing Date
                    </div>
                    <p className="text-xl font-semibold">
                      {new Date(organization.nextBillingDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Monthly Revenue
                  </div>
                  <p className="text-2xl font-bold">
                    ${Number(organization?.monthlyRevenue ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Plan Features</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No active subscription plan. Please select a plan below to get started.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availablePlans?.map((plan) => {
            const PlanIcon = getPlanIcon(plan.name);
            const isCurrentPlan = plan.id === currentPlan?.id;

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  isCurrentPlan ? 'border-primary border-2' : ''
                } hover:shadow-lg transition-shadow`}
              >
                {isCurrentPlan && (
                  <div className="absolute top-4 right-4">
                    <Badge>Current Plan</Badge>
                  </div>
                )}
                <CardHeader>
                  <PlanIcon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.billingInterval}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Users</span>
                      <span className="font-semibold">{plan.includedUsers} seats</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Trial</span>
                      <span className="font-semibold">{plan.trialDays} days</span>
                    </div>
                  </div>
                  <Separator />
                  <ul className="space-y-2">
                    {plan.features.slice(0, 5).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 5 && (
                      <li className="text-sm text-muted-foreground">
                        +{plan.features.length - 5} more features
                      </li>
                    )}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleUpgradeClick(plan)}
                    disabled={isCurrentPlan}
                    variant={isCurrentPlan ? 'secondary' : 'default'}
                  >
                    {isCurrentPlan ? 'Current Plan' : 'Upgrade to this Plan'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Upgrade Confirmation Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Plan Upgrade</DialogTitle>
            <DialogDescription>
              You are about to upgrade to the {selectedPlan?.name} plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Plan:</span>
                <span>{selectedPlan?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Price:</span>
                <span>${selectedPlan?.price}/{selectedPlan?.billingInterval}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">User Seats:</span>
                <span>{selectedPlan?.includedUsers} users</span>
              </div>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You will be redirected to the payment page to complete the upgrade.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmUpgrade} disabled={upgradeMutation.isPending}>
              {upgradeMutation.isPending ? 'Processing...' : 'Confirm Upgrade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
