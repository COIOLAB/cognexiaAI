'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Users, Crown, Infinity, TrendingUp } from 'lucide-react';

interface UserLimitStatusProps {
  organizationId: string;
}

interface UserAllocation {
  organizationId: string;
  activeTier: 'basic' | 'premium' | 'advanced';
  currentUserCount: number;
  maxAllowedUsers: number | null;
  canAddUsers: boolean;
}

export function UserLimitStatus({ organizationId }: UserLimitStatusProps) {
  const [allocation, setAllocation] = useState<UserAllocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllocation();
  }, [organizationId]);

  const loadAllocation = async () => {
    try {
      const response = await fetch(`/api/crm/user-tiers/organization/${organizationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load allocation');

      const data = await response.json();
      setAllocation(data);
    } catch (error) {
      console.error('Error loading allocation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!allocation) return null;

  const usagePercentage = allocation.maxAllowedUsers 
    ? (allocation.currentUserCount / allocation.maxAllowedUsers) * 100
    : 0;

  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = !allocation.canAddUsers;

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'basic':
        return <Users className="h-5 w-5 text-gray-600" />;
      case 'premium':
        return <Crown className="h-5 w-5 text-purple-600" />;
      case 'advanced':
        return <Infinity className="h-5 w-5 text-blue-600" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'bg-gray-100 text-gray-800';
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      case 'advanced':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <Card className={isAtLimit ? 'border-red-500' : isNearLimit ? 'border-yellow-500' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                {getTierIcon(allocation.activeTier)}
              </div>
              <div>
                <CardTitle className="text-lg">User Allocation</CardTitle>
                <CardDescription>
                  <Badge className={getTierColor(allocation.activeTier)}>
                    {allocation.activeTier.toUpperCase()} Plan
                  </Badge>
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {allocation.currentUserCount} / {allocation.maxAllowedUsers === null ? '∞' : allocation.maxAllowedUsers}
              </p>
              <p className="text-sm text-gray-500">users</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {allocation.maxAllowedUsers !== null && (
            <>
              <Progress value={usagePercentage} className="h-2" />
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{usagePercentage.toFixed(1)}% utilized</span>
                <span>
                  {allocation.maxAllowedUsers - allocation.currentUserCount} seats available
                </span>
              </div>
            </>
          )}

          {isAtLimit && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>User limit reached!</strong> You&apos;ve used all available user seats. Contact your administrator to upgrade your plan.
              </AlertDescription>
            </Alert>
          )}

          {isNearLimit && !isAtLimit && (
            <Alert className="border-yellow-500 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Approaching limit!</strong> You&apos;re using {usagePercentage.toFixed(0)}% of your user seats. Consider upgrading to add more team members.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      {(isNearLimit || isAtLimit) && allocation.activeTier !== 'advanced' && (
        <Card className="border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Upgrade Your Plan
            </CardTitle>
            <CardDescription>Get more users and unlock additional features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allocation.activeTier === 'basic' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Crown className="h-6 w-6 text-purple-600" />
                    <div>
                      <h4 className="font-semibold">Premium Plan</h4>
                      <p className="text-sm text-gray-500">Up to 10 users</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Learn More
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Infinity className="h-6 w-6 text-blue-600" />
                    <div>
                      <h4 className="font-semibold">Advanced Plan</h4>
                      <p className="text-sm text-gray-500">Unlimited users</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Learn More
                  </Button>
                </div>
              </div>
            )}

            {allocation.activeTier === 'premium' && (
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  <Infinity className="h-6 w-6 text-blue-600" />
                  <div>
                    <h4 className="font-semibold">Advanced Plan</h4>
                    <p className="text-sm text-gray-500">Unlimited users + premium features</p>
                  </div>
                </div>
                <Button size="sm">
                  Upgrade Now
                </Button>
              </div>
            )}

            <p className="text-sm text-gray-600 text-center">
              Contact your administrator or reach out to <a href="mailto:sales@cognexiaai.com" className="text-blue-600 hover:underline">sales@cognexiaai.com</a>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
