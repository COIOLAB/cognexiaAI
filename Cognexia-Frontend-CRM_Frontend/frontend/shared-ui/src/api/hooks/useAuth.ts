/**
 * Auth React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../endpoints';

export const AUTH_KEYS = {
  profile: ['auth', 'profile'] as const,
};

/**
 * Get current user profile
 */
export const useProfile = () => {
  return useQuery({
    queryKey: AUTH_KEYS.profile,
    queryFn: authApi.getProfile,
    retry: false,
  });
};

/**
 * Login mutation
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Store tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // Update profile cache
      queryClient.setQueryData(AUTH_KEYS.profile, data.user);
    },
  });
};

/**
 * Register mutation
 */
export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
  });
};

/**
 * Logout mutation
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear all queries
      queryClient.clear();
    },
  });
};

/**
 * Forgot password mutation
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });
};

/**
 * Reset password mutation
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authApi.resetPassword(token, newPassword),
  });
};

/**
 * Verify email mutation
 */
export const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: () => {
      // Refetch profile to get updated isEmailVerified status
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile });
    },
  });
};

/**
 * Resend verification email mutation
 */
export const useResendVerification = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerification(email),
  });
};
