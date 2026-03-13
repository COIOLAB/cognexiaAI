import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Clock, AlertCircle, Circle } from 'lucide-react';

export type StatusType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'pending'
  | 'active'
  | 'inactive'
  | 'default';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<
  StatusType,
  {
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ReactNode;
    className: string;
  }
> = {
  success: {
    variant: 'default',
    icon: <CheckCircle className="h-3 w-3" />,
    className: 'bg-green-500 hover:bg-green-600 text-white',
  },
  error: {
    variant: 'destructive',
    icon: <XCircle className="h-3 w-3" />,
    className: '',
  },
  warning: {
    variant: 'outline',
    icon: <AlertCircle className="h-3 w-3" />,
    className: 'border-yellow-600 text-yellow-600',
  },
  info: {
    variant: 'secondary',
    icon: <AlertCircle className="h-3 w-3" />,
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  },
  pending: {
    variant: 'secondary',
    icon: <Clock className="h-3 w-3" />,
    className: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  },
  active: {
    variant: 'default',
    icon: <CheckCircle className="h-3 w-3" />,
    className: 'bg-green-500 hover:bg-green-600 text-white',
  },
  inactive: {
    variant: 'secondary',
    icon: <Circle className="h-3 w-3" />,
    className: '',
  },
  default: {
    variant: 'default',
    icon: <Circle className="h-3 w-3" />,
    className: '',
  },
};

export function StatusBadge({
  status,
  label,
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const statusKey = (status.toLowerCase() as StatusType) || 'default';
  const config = statusConfig[statusKey] || statusConfig.default;
  const displayLabel = label || status.replace(/_/g, ' ');

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'capitalize flex items-center gap-1.5',
        config.className,
        className
      )}
    >
      {showIcon && config.icon}
      {displayLabel}
    </Badge>
  );
}
