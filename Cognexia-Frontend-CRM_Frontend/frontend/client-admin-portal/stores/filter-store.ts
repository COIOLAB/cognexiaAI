import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface FilterValue {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'between';
  value: any;
}

export interface SavedFilter {
  id: string;
  name: string;
  entity: string; // 'customers', 'leads', 'opportunities', etc.
  filters: FilterValue[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  createdAt: string;
  isDefault?: boolean;
}

interface FilterState {
  // Active filters per entity
  activeFilters: Record<string, FilterValue[]>;
  // Saved filters
  savedFilters: SavedFilter[];
  // Active sort per entity
  activeSort: Record<string, { sortBy: string; sortOrder: 'asc' | 'desc' }>;
  // Search queries per entity
  searchQueries: Record<string, string>;
}

interface FilterActions {
  // Active filters
  setActiveFilters: (entity: string, filters: FilterValue[]) => void;
  addFilter: (entity: string, filter: FilterValue) => void;
  removeFilter: (entity: string, field: string) => void;
  clearFilters: (entity: string) => void;
  
  // Saved filters
  saveFilter: (filter: Omit<SavedFilter, 'id' | 'createdAt'>) => void;
  updateSavedFilter: (id: string, updates: Partial<SavedFilter>) => void;
  deleteSavedFilter: (id: string) => void;
  applySavedFilter: (id: string) => void;
  setDefaultFilter: (entity: string, filterId: string) => void;
  
  // Sort
  setSort: (entity: string, sortBy: string, sortOrder: 'asc' | 'desc') => void;
  clearSort: (entity: string) => void;
  
  // Search
  setSearchQuery: (entity: string, query: string) => void;
  clearSearchQuery: (entity: string) => void;
  
  // Reset all
  resetAll: () => void;
}

type FilterStore = FilterState & FilterActions;

const initialState: FilterState = {
  activeFilters: {},
  savedFilters: [],
  activeSort: {},
  searchQueries: {},
};

export const useFilterStore = create<FilterStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Active filters
      setActiveFilters: (entity, filters) =>
        set((state) => ({
          activeFilters: { ...state.activeFilters, [entity]: filters },
        })),

      addFilter: (entity, filter) =>
        set((state) => ({
          activeFilters: {
            ...state.activeFilters,
            [entity]: [...(state.activeFilters[entity] || []), filter],
          },
        })),

      removeFilter: (entity, field) =>
        set((state) => ({
          activeFilters: {
            ...state.activeFilters,
            [entity]: (state.activeFilters[entity] || []).filter(
              (f) => f.field !== field
            ),
          },
        })),

      clearFilters: (entity) =>
        set((state) => ({
          activeFilters: { ...state.activeFilters, [entity]: [] },
        })),

      // Saved filters
      saveFilter: (filter) =>
        set((state) => ({
          savedFilters: [
            ...state.savedFilters,
            {
              ...filter,
              id: `filter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateSavedFilter: (id, updates) =>
        set((state) => ({
          savedFilters: state.savedFilters.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        })),

      deleteSavedFilter: (id) =>
        set((state) => ({
          savedFilters: state.savedFilters.filter((f) => f.id !== id),
        })),

      applySavedFilter: (id) => {
        const filter = get().savedFilters.find((f) => f.id === id);
        if (filter) {
          set((state) => ({
            activeFilters: {
              ...state.activeFilters,
              [filter.entity]: filter.filters,
            },
            activeSort: filter.sortBy
              ? {
                  ...state.activeSort,
                  [filter.entity]: {
                    sortBy: filter.sortBy,
                    sortOrder: filter.sortOrder || 'asc',
                  },
                }
              : state.activeSort,
          }));
        }
      },

      setDefaultFilter: (entity, filterId) =>
        set((state) => ({
          savedFilters: state.savedFilters.map((f) =>
            f.entity === entity
              ? { ...f, isDefault: f.id === filterId }
              : f
          ),
        })),

      // Sort
      setSort: (entity, sortBy, sortOrder) =>
        set((state) => ({
          activeSort: {
            ...state.activeSort,
            [entity]: { sortBy, sortOrder },
          },
        })),

      clearSort: (entity) =>
        set((state) => {
          const { [entity]: _, ...rest } = state.activeSort;
          return { activeSort: rest };
        }),

      // Search
      setSearchQuery: (entity, query) =>
        set((state) => ({
          searchQueries: { ...state.searchQueries, [entity]: query },
        })),

      clearSearchQuery: (entity) =>
        set((state) => {
          const { [entity]: _, ...rest } = state.searchQueries;
          return { searchQueries: rest };
        }),

      // Reset
      resetAll: () => set(initialState),
    }),
    {
      name: 'filter-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        savedFilters: state.savedFilters,
        // Don't persist active filters and searches - they should be fresh on reload
      }),
    }
  )
);
