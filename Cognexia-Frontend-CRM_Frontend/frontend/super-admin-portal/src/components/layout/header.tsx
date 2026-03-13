'use client';

import { LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useLogout } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/utils';

export function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <header className="flex h-16 items-center justify-between border-b-2 border-blue-200 dark:border-blue-800 bg-white/95 backdrop-blur-lg dark:bg-gray-950/95 px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Welcome back, {user ? `${user.firstName} ${user.lastName}` : 'Admin'}
        </h2>
        <div className="hidden lg:flex items-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full shadow-sm">CMMI Level 5</span>
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">ISO 27001</span>
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">SOC 2 Type II</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium shadow-md">
            {getInitials(user ? `${user.firstName} ${user.lastName}` : null)}
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900 dark:text-gray-100">{user ? `${user.firstName} ${user.lastName}` : 'Admin'}</p>
            <p className="text-gray-500 dark:text-gray-400">{user?.email || 'admin@example.com'}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
