'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface SeatUsage {
  currentUsers: number;
  maxUsers: number;
  availableSeats: number;
  usagePercentage: number;
  canAddUsers: boolean;
}

export function SeatsIndicator() {
  const router = useRouter();

  const { data: seatUsage, isLoading } = useQuery<SeatUsage>({
    queryKey: ['seat-usage'],
    queryFn: async () => {
      const organizationId = localStorage.getItem('organizationId');
      const response = await apiClient.get(`/organizations/${organizationId}/seat-usage`);
      return response.data;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading || !seatUsage) {
    return null;
  }

  const isNearLimit = seatUsage.usagePercentage >= 80;
  const isAtLimit = !seatUsage.canAddUsers;

  const getVariant = (): 'default' | 'destructive' | 'secondary' => {
    if (isAtLimit) return 'destructive';
    if (isNearLimit) return 'default';
    return 'secondary';
  };

  const getIcon = () => {
    if (isAtLimit) return <AlertTriangle className="h-3 w-3" />;
    if (isNearLimit) return <TrendingUp className="h-3 w-3" />;
    return <Users className="h-3 w-3" />;
  };

  const getMessage = () => {
    if (isAtLimit) {
      return 'Seat limit reached! Upgrade to add more users.';
    }
    if (isNearLimit) {
      return `${seatUsage.availableSeats} seat${seatUsage.availableSeats !== 1 ? 's' : ''} remaining. Consider upgrading.`;
    }
    return `${seatUsage.availableSeats} of ${seatUsage.maxUsers} seats available`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <Badge variant={getVariant()} className="flex items-center gap-1.5 px-3 py-1">
              {getIcon()}
              <span className="text-xs font-medium">
                {seatUsage.currentUsers}/{seatUsage.maxUsers}
              </span>
            </Badge>
            {(isAtLimit || isNearLimit) && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => router.push('/subscription')}
                className="h-7 text-xs"
              >
                Upgrade
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2">
            <p className="font-medium">Seat Usage</p>
            <div className="space-y-1 text-sm">
              <p>{getMessage()}</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isAtLimit
                      ? 'bg-red-500'
                      : isNearLimit
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(seatUsage.usagePercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
