import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/services/auth.api';
import { useAuthStore } from '@/stores/auth-store';
import { useTenantStore } from '@/stores/tenant-store';
import type { LoginRequest, RegisterRequest } from '@/types/api.types';
import toast from 'react-hot-toast';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuth, logout: logoutStore, user, isAuthenticated } = useAuthStore();
  const { setCurrentOrganization, clearTenant } = useTenantStore();

  const handleAuthSuccess = (data: { user: any; accessToken: string; refreshToken: string }) => {
    const authUser = {
      ...data.user,
      role: data.user.role || data.user.userType || 'org_user',
      permissions: data.user.permissions || [],
      organizationId: data.user.organizationId || '',
      organizationName: data.user.organizationName || '',
    };
    setAuth(authUser, data.accessToken, data.refreshToken);

    // Store tokens in localStorage for API calls
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('organizationId', authUser.organizationId || '');

    // Set organization context for non-super admins
    if (authUser.organizationId) {
      setCurrentOrganization({
        id: authUser.organizationId,
        name: authUser.organizationName || '',
        slug: authUser.organizationId,
        plan: 'pro',
        isActive: true,
      });
    }

    toast.success('Login successful!');

    // Role-based routing
    const isSuperAdmin =
      data.user.userType === 'SUPER_ADMIN' || data.user.roles?.includes('SUPER_ADMIN');

    if (isSuperAdmin) {
      const superAdminUrl = process.env.NEXT_PUBLIC_SUPER_ADMIN_PORTAL_URL || 'http://localhost:3001';
      window.location.href = `${superAdminUrl}/`;
    } else {
      router.push('/dashboard');
    }
  };

  // Login mutation with role-based routing
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => handleAuthSuccess(data),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });

  const demoLoginMutation = useMutation({
    mutationFn: () => authApi.demoLogin(),
    onSuccess: (data) => {
      toast.success('Demo ready!');
      handleAuthSuccess(data);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Demo login failed');
    },
  });

  const demoResetMutation = useMutation({
    mutationFn: () => authApi.demoReset(),
    onSuccess: (data) => {
      toast.success(data.message || 'Demo data refreshed');
      queryClient.invalidateQueries();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Demo reset failed');
    },
  });

  // Register mutation (always creates client org user, never super admin)
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (data) => {
      const authUser = {
        ...data.user,
        role: data.user.role || data.user.userType || 'org_user',
        permissions: data.user.permissions || [],
        organizationId: data.user.organizationId || '',
        organizationName: data.user.organizationName || '',
      };
      setAuth(authUser, data.accessToken, data.refreshToken);
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('organizationId', authUser.organizationId || '');
      
      setCurrentOrganization({
        id: data.user.organizationId,
        name: data.user.organizationName || '',
        slug: data.user.organizationId,
        plan: 'trial',
        isActive: true,
      });
      
      toast.success('Registration successful! Welcome to your new organization.');
      router.push('/dashboard'); // Always client portal for registrations
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logoutStore();
      clearTenant();
      queryClient.clear();
      
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('organizationId');
      
      toast.success('Logged out successfully');
      router.push('/login');
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: () => {
      toast.success('Password reset email sent!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.resetPassword(token, password),
    onSuccess: () => {
      toast.success('Password reset successful!');
      router.push('/login');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Password reset failed');
    },
  });

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    demoLogin: demoLoginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isDemoLoading: demoLoginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    resetDemo: demoResetMutation.mutate,
    isDemoResetting: demoResetMutation.isPending,
  };
}
