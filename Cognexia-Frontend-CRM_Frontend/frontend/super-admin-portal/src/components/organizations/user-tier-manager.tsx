'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Users, Crown, Infinity, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export enum UserTier {
  BASIC = 'basic',
  PREMIUM = 'premium',
  ADVANCED = 'advanced',
}

interface TierConfig {
  enabled: boolean;
  maxUsers: number | null;
}

interface UserTierAllocation {
  organizationId: string;
  activeTier: UserTier;
  tierConfig: {
    basic: TierConfig;
    premium: TierConfig;
    advanced: TierConfig;
  };
  currentUserCount: number;
  maxAllowedUsers: number | null;
  canAddUsers: boolean;
}

interface UserTierManagerProps {
  organizationId: string;
  organizationName: string;
  initialAllocation?: UserTierAllocation;
  onUpdate?: () => void;
}

export function UserTierManager({
  organizationId,
  organizationName,
  initialAllocation,
  onUpdate,
}: UserTierManagerProps) {
  const [loading, setLoading] = useState(false);
  const [allocation, setAllocation] = useState<UserTierAllocation | null>(initialAllocation || null);
  const [basicEnabled, setBasicEnabled] = useState(initialAllocation?.tierConfig?.basic?.enabled || false);
  const [premiumEnabled, setPremiumEnabled] = useState(initialAllocation?.tierConfig?.premium?.enabled || false);
  const [advancedEnabled, setAdvancedEnabled] = useState(initialAllocation?.tierConfig?.advanced?.enabled || false);

  // Load allocation on mount
  useEffect(() => {
    if (!allocation && !initialAllocation) {
      loadAllocation();
    }
  }, [organizationId]);

  const loadAllocation = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1';
      const response = await fetch(`${apiBase}/user-tiers/organization/${organizationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to load tier allocation, status:', response.status);
        throw new Error('Failed to load tier allocation');
      }

      const data = await response.json();
      console.log('Loaded tier allocation:', data);
      setAllocation(data);
      setBasicEnabled(data.tierConfig?.basic?.enabled || false);
      setPremiumEnabled(data.tierConfig?.premium?.enabled || false);
      setAdvancedEnabled(data.tierConfig?.advanced?.enabled || false);
    } catch (error) {
      console.error('Error loading allocation:', error);
      toast.error('Failed to load tier allocation');
    }
  };

  const updateTier = async (tier: UserTier, enabled: boolean) => {
    setLoading(true);
    try {
      // For Advanced tier, set maxUsers to 100 when enabling
      const payload: any = { tier, enabled };
      if (tier === UserTier.ADVANCED && enabled) {
        payload.customMaxUsers = 100;
      }

      console.log('Updating tier:', payload);

      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1';
      const response = await fetch(`${apiBase}/user-tiers/organization/${organizationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update tier');
      }

      const result = await response.json();
      console.log('Update result:', result);
      
      setAllocation(result.allocation);
      
      // Update switch states from the returned allocation
      if (result.allocation) {
        setBasicEnabled(result.allocation.tierConfig?.basic?.enabled || false);
        setPremiumEnabled(result.allocation.tierConfig?.premium?.enabled || false);
        setAdvancedEnabled(result.allocation.tierConfig?.advanced?.enabled || false);
      }
      
      toast.success(result.message || 'Tier updated successfully');
      onUpdate?.();
    } catch (error: any) {
      console.error('Error updating tier:', error);
      toast.error(error.message || 'Failed to update tier');
      
      // Revert state on error
      if (tier === UserTier.BASIC) setBasicEnabled(!enabled);
      if (tier === UserTier.PREMIUM) setPremiumEnabled(!enabled);
      if (tier === UserTier.ADVANCED) setAdvancedEnabled(!enabled);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching data
  if (!allocation && !initialAllocation) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2 text-gray-500">Loading tier information...</p>
      </div>
    );
  }

  const activeTier = allocation?.activeTier || UserTier.BASIC;
  const currentUsers = allocation?.currentUserCount || 0;
  const maxUsers = allocation?.maxAllowedUsers;
  const canAddUsers = allocation?.canAddUsers !== false;

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>User Allocation Status</CardTitle>
          <CardDescription>
            Current user limits for {organizationName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Active Plan</p>
              <div className="flex items-center gap-2">
                <Badge className="text-lg px-3 py-1">
                  {activeTier.toUpperCase()}
                </Badge>
                {activeTier === UserTier.ADVANCED && (
                  <Infinity className="h-5 w-5 text-blue-600" />
                )}
              </div>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-sm text-gray-500">Users</p>
              <p className="text-2xl font-bold">
                {currentUsers} / {maxUsers === null ? '∞' : maxUsers}
              </p>
              {canAddUsers ? (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  Can add users
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Limit reached
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier Management */}
      <Card>
        <CardHeader>
          <CardTitle>Manage User Tiers</CardTitle>
          <CardDescription>
            Enable or disable user tiers for this organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Tier */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Basic</h3>
                <p className="text-sm text-gray-500">1 User</p>
              </div>
            </div>
            <Switch
              checked={basicEnabled}
              onCheckedChange={(checked) => {
                setBasicEnabled(checked);
                updateTier(UserTier.BASIC, checked);
              }}
              disabled={loading}
            />
          </div>

          {/* Premium Tier */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Premium</h3>
                <p className="text-sm text-gray-500">Up to 10 Users</p>
              </div>
            </div>
            <Switch
              checked={premiumEnabled}
              onCheckedChange={(checked) => {
                setPremiumEnabled(checked);
                updateTier(UserTier.PREMIUM, checked);
              }}
              disabled={loading}
            />
          </div>

          {/* Advanced Tier */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Infinity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Advanced</h3>
                <p className="text-sm text-gray-500">Up to 100 Users</p>
              </div>
            </div>
            <Switch
              checked={advancedEnabled}
              onCheckedChange={(checked) => {
                setAdvancedEnabled(checked);
                updateTier(UserTier.ADVANCED, checked);
              }}
              disabled={loading}
            />
          </div>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Only one tier can be active at a time. Priority: Advanced &gt; Premium &gt; Basic
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
