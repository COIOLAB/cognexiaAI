'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Users, Crown, Infinity, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface QuickTierManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  organizationName: string;
  currentTier?: string;
  onUpdate?: () => void;
}

export function QuickTierManagerDialog({
  open,
  onOpenChange,
  organizationId,
  organizationName,
  currentTier = 'basic',
  onUpdate,
}: QuickTierManagerDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState(currentTier);

  const tiers = [
    {
      id: 'basic',
      name: 'Basic',
      icon: Users,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      maxUsers: 1,
      description: 'Single user access',
      features: ['Basic CRM', 'Document Storage (1GB)', 'Mobile App'],
    },
    {
      id: 'premium',
      name: 'Premium',
      icon: Crown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      maxUsers: 10,
      description: 'Up to 10 users',
      features: ['Everything in Basic', 'Advanced Reporting', 'Email Campaigns', 'API Access'],
    },
    {
      id: 'advanced',
      name: 'Advanced',
      icon: Infinity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      maxUsers: null,
      description: 'Unlimited users',
      features: ['Everything in Premium', 'Custom Workflows', 'Advanced Security', 'White Label', 'Priority Support'],
    },
  ];

  const updateTier = async (tier: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'}/user-tiers/organization/${organizationId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({ tier, enabled: true }),
        }
      );

      if (!response.ok) throw new Error('Failed to update tier');

      const result = await response.json();
      setSelectedTier(tier);
      toast.success(`Organization upgraded to ${tier.toUpperCase()} tier`);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating tier:', error);
      toast.error('Failed to update tier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage User Tier</DialogTitle>
          <DialogDescription>
            Configure user limits and features for {organizationName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              const isSelected = selectedTier === tier.id;
              const isCurrentTier = currentTier === tier.id;

              return (
                <div
                  key={tier.id}
                  className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => !loading && setSelectedTier(tier.id)}
                >
                  {isCurrentTier && (
                    <Badge className="absolute -top-2 -right-2">
                      Current
                    </Badge>
                  )}

                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`w-16 h-16 ${tier.bgColor} rounded-full flex items-center justify-center`}>
                      <Icon className={`h-8 w-8 ${tier.color}`} />
                    </div>

                    <div>
                      <h3 className="font-bold text-lg">{tier.name}</h3>
                      <p className="text-sm text-gray-500">{tier.description}</p>
                    </div>

                    <div className="text-2xl font-bold">
                      {tier.maxUsers === null ? '∞' : tier.maxUsers}
                      <span className="text-sm font-normal text-gray-500"> users</span>
                    </div>

                    <div className="w-full">
                      <div className="text-xs text-gray-600 font-semibold mb-2">
                        Features:
                      </div>
                      <ul className="text-xs space-y-1 text-left">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              Current tier: <Badge>{currentTier.toUpperCase()}</Badge>
              {selectedTier !== currentTier && (
                <>
                  {' → '}
                  <Badge className="bg-blue-500">
                    {selectedTier.toUpperCase()}
                  </Badge>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => updateTier(selectedTier)}
                disabled={loading || selectedTier === currentTier}
              >
                {loading ? 'Updating...' : 'Update Tier'}
              </Button>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Changing the tier will automatically adjust the user limits and available features. Existing users will retain access.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
