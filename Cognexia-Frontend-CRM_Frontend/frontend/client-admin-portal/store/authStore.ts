import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import { User, Organization, AuthState } from '@/types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      organization: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { accessToken, user } = response.data;

          // Map backend user to frontend user format
          const mappedUser = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            userType: user.userType,
            organizationId: user.organizationId,
            roles: user.roles || [],
            permissions: [],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Fetch organization if organizationId exists
          let organization = null;
          if (user.organizationId) {
            try {
              const orgResponse = await api.get(`/organization/${user.organizationId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
              });
              organization = orgResponse.data;
            } catch (error) {
              console.error('Failed to fetch organization:', error);
            }
          }

          set({
            user: mappedUser,
            organization,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
          });

          if (typeof window !== 'undefined') {
            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(mappedUser));
            if (organization) {
              localStorage.setItem('organization', JSON.stringify(organization));
            }
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          organization: null,
          token: null,
          isAuthenticated: false,
        });

        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('organization');
        }
      },

      updateUser: (user: User) => {
        set({ user });
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
        }
      },

      updateOrganization: (organization: Organization) => {
        set({ organization });
        if (typeof window !== 'undefined') {
          localStorage.setItem('organization', JSON.stringify(organization));
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        organization: state.organization,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
