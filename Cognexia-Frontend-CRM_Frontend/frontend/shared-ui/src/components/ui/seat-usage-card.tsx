import { Card } from './card';
import { Button } from './button';
import { Progress } from './progress';
import { Badge } from './badge';
import { Users, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { cn } from '../../theme/utils';

export interface SeatUsageCardProps {
  currentUsers: number;
  maxUsers: number;
  className?: string;
  onUpgrade?: () => void;
  showUpgradeButton?: boolean;
  variant?: 'default' | 'compact';
}

export function SeatUsageCard({
  currentUsers,
  maxUsers,
  className,
  onUpgrade,
  showUpgradeButton = true,
  variant = 'default',
}: SeatUsageCardProps) {
  const usagePercentage = Math.round((currentUsers / maxUsers) * 100);
  const seatsRemaining = maxUsers - currentUsers;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = currentUsers >= maxUsers;

  // Status
  const getStatus = () => {
    if (isAtLimit) return { text: 'At Limit', color: 'red', icon: AlertTriangle };
    if (isNearLimit) return { text: 'Near Limit', color: 'yellow', icon: AlertTriangle };
    return { text: 'Available', color: 'green', icon: CheckCircle };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">User Seats</span>
            <span className="text-sm text-gray-600">
              {currentUsers} / {maxUsers}
            </span>
          </div>
          <Progress
            value={usagePercentage}
            className={cn(
              'h-2',
              isAtLimit && '[&>div]:bg-red-600',
              isNearLimit && !isAtLimit && '[&>div]:bg-yellow-600'
            )}
          />
        </div>
        {isNearLimit && showUpgradeButton && onUpgrade && (
          <Button size="sm" variant="outline" onClick={onUpgrade} className="whitespace-nowrap">
            <TrendingUp className="w-4 h-4 mr-1" />
            Upgrade
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">User Seats</h3>
            <p className="text-sm text-gray-500">Team member capacity</p>
          </div>
        </div>
        <Badge
          className={cn(
            status.color === 'red' && 'bg-red-100 text-red-800 hover:bg-red-100',
            status.color === 'green' && 'bg-green-100 text-green-800 hover:bg-green-100',
            status.color === 'yellow' && 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
          )}
        >
          <StatusIcon className="w-3 h-3 mr-1" />
          {status.text}
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Usage Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-indigo-600">{currentUsers}</div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-400">{seatsRemaining}</div>
            <div className="text-xs text-gray-500">Available</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{maxUsers}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Capacity</span>
            <span className="text-sm font-semibold text-gray-900">{usagePercentage}%</span>
          </div>
          <Progress
            value={usagePercentage}
            className={cn(
              'h-3',
              isAtLimit && '[&>div]:bg-red-600',
              isNearLimit && !isAtLimit && '[&>div]:bg-yellow-600'
            )}
          />
        </div>

        {/* Warning Message */}
        {isAtLimit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Seat limit reached</p>
                <p className="text-xs text-red-600 mt-1">
                  You've reached your maximum user capacity. Upgrade your plan to add more team
                  members.
                </p>
              </div>
            </div>
          </div>
        )}

        {isNearLimit && !isAtLimit && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Approaching seat limit</p>
                <p className="text-xs text-yellow-600 mt-1">
                  Only {seatsRemaining} seat{seatsRemaining !== 1 && 's'} remaining. Consider
                  upgrading to add more users.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Button */}
        {isNearLimit && showUpgradeButton && onUpgrade && (
          <Button onClick={onUpgrade} className="w-full bg-indigo-600 hover:bg-indigo-700">
            <TrendingUp className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
        )}

        {/* Info */}
        {!isNearLimit && (
          <p className="text-xs text-gray-500 text-center">
            You have plenty of seats available for your team
          </p>
        )}
      </div>
    </Card>
  );
}
