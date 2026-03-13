import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  plan: string;
  isActive: boolean;
}

interface TenantState {
  currentOrganization: Organization | null;
  availableOrganizations: Organization[];
}

interface TenantActions {
  setCurrentOrganization: (organization: Organization) => void;
  setAvailableOrganizations: (organizations: Organization[]) => void;
  switchOrganization: (organizationId: string) => void;
  clearTenant: () => void;
}

type TenantStore = TenantState & TenantActions;

export const useTenantStore = create<TenantStore>()(
  persist(
    (set) => ({
      currentOrganization: null,
      availableOrganizations: [],

      setCurrentOrganization: (organization) =>
        set({ currentOrganization: organization }),

      setAvailableOrganizations: (organizations) =>
        set({ availableOrganizations: organizations }),

      switchOrganization: (organizationId) =>
        set((state) => {
          const org = state.availableOrganizations.find(
            (o) => o.id === organizationId
          );
          return org ? { currentOrganization: org } : state;
        }),

      clearTenant: () =>
        set({ currentOrganization: null, availableOrganizations: [] }),
    }),
    {
      name: 'tenant-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
