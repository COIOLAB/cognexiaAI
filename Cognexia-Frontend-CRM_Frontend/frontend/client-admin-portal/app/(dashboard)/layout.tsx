'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopNav />
          <main
            className={cn(
              'flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300',
              sidebarCollapsed ? 'ml-20' : 'ml-64'
            )}
          >
            <div className="container mx-auto p-6">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
