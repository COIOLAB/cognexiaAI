import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { LoginRequest, LoginResponse } from '@/types/user';
import { toast } from 'react-hot-toast';

export const useLogin = () => {
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await apiClient.post<LoginResponse>('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      const { user, accessToken, refreshToken } = data;
      useAuthStore.getState().login(user, accessToken, refreshToken);
      toast.success('Login successful!');
      router.push('/');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  
  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
    },
    onSuccess: () => {
      logout();
      router.push('/login');
      toast.success('Logged out successfully');
    },
  });
};
