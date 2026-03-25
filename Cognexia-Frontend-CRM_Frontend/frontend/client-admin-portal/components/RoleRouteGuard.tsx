'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { canAccessPath } from '@/lib/rbac';
import { Button } from '@/components/ui/button';

export function RoleRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  if (canAccessPath(pathname, user)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-semibold">Access Restricted</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            You do not have permission to view this page with your current role.
          </p>
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/customers">Open Allowed Module</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
