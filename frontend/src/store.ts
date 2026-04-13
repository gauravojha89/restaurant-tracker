import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type { SavedRestaurant, SearchFilters, MapViewState } from './types';
import { fetchRestaurants, upsertRestaurant, deleteRestaurantApi } from './api';

interface AppState {
  // Map state
  mapView: MapViewState;
  setMapView: (view: Partial<MapViewState>) => void;

  // Saved restaurants (cloud-backed)
  savedRestaurants: SavedRestaurant[];
  isLoaded: boolean;
  loadRestaurants: () => Promise<void>;
  addToList: (restaurant: Omit<SavedRestaurant, 'savedAt'>) => void;
  removeFromList: (id: string) => void;
  moveToFavorites: (id: string, personalRating?: number, personalNotes?: string) => void;
  updateNotes: (id: string, notes: string) => void;
  updateCategories: (id: string, categories: import('./types').Category[]) => void;

  // Search & Filters
  filters: SearchFilters;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;

  // UI State
  activeTab: 'map' | 'toVisit' | 'favorites';
  setActiveTab: (tab: 'map' | 'toVisit' | 'favorites') => void;
  selectedRestaurantId: string | null;
  setSelectedRestaurantId: (id: string | null) => void;

  // Default home city (null = not set yet → show picker)
  defaultCity: string | null;
  setDefaultCity: (city: string) => void;

  // Cities (derived from saved restaurants + default)
  cities: string[];
  addCity: (city: string) => void;
}

const DEFAULT_MAP_VIEW: MapViewState = {
  longitude: -84.3880,
  latitude: 33.7490,
  zoom: 12,
};

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  categories: [],
  city: '',
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Map state
      mapView: DEFAULT_MAP_VIEW,
      setMapView: (view) =>
        set((state) => ({ mapView: { ...state.mapView, ...view } })),

      // Saved restaurants
      savedRestaurants: [],
      isLoaded: false,

      loadRestaurants: async () => {
        try {
          const apiData = await fetchRestaurants();
          // One-time migration: if API is empty but localStorage has data, push it up
          if (apiData.length === 0) {
            const legacy = localStorage.getItem('restaurant-tracker-storage');
            if (legacy) {
              try {
                const parsed = JSON.parse(legacy) as { state?: { savedRestaurants?: SavedRestaurant[] } };
                const local: SavedRestaurant[] = parsed?.state?.savedRestaurants ?? [];
                if (local.length > 0) {
                  await Promise.all(local.map((r) => upsertRestaurant(r)));
                  set({ savedRestaurants: local, isLoaded: true });
                  set((state) => ({ cities: [...new Set(local.map((r) => r.city).filter(Boolean))] as string[], savedRestaurants: state.savedRestaurants }));
                  return;
                }
              } catch { /* ignore */ }
            }
          }
          const cities = [...new Set(apiData.map((r) => r.city).filter(Boolean))] as string[];
          set({ savedRestaurants: apiData, cities, isLoaded: true });
        } catch (e) {
          console.error('Failed to load restaurants from API', e);
          set({ isLoaded: true }); // unblock UI even on error
        }
      },

      addToList: (restaurant) => {
        const exists = useStore.getState().savedRestaurants.find((r) => r.id === restaurant.id);
        if (exists) return;
        const newRestaurant: SavedRestaurant = { ...restaurant, savedAt: new Date().toISOString() };
        set((state) => ({
          savedRestaurants: [...state.savedRestaurants, newRestaurant],
          cities: state.cities.includes(restaurant.city) ? state.cities : [...state.cities, restaurant.city],
        }));
        upsertRestaurant(newRestaurant).catch((e) => console.error('addToList sync failed', e));
      },

      removeFromList: (id) => {
        set((state) => ({ savedRestaurants: state.savedRestaurants.filter((r) => r.id !== id) }));
        deleteRestaurantApi(id).catch((e) => console.error('removeFromList sync failed', e));
      },

      moveToFavorites: (id, personalRating, personalNotes) => {
        let updated: SavedRestaurant | undefined;
        set((state) => {
          const next = state.savedRestaurants.map((r) => {
            if (r.id !== id) return r;
            updated = { ...r, listType: 'favorite' as const, visitedAt: new Date().toISOString(), personalRating, personalNotes: personalNotes || r.personalNotes };
            return updated;
          });
          return { savedRestaurants: next };
        });
        if (updated) upsertRestaurant(updated).catch((e) => console.error('moveToFavorites sync failed', e));
      },

      updateNotes: (id, notes) => {
        let updated: SavedRestaurant | undefined;
        set((state) => {
          const next = state.savedRestaurants.map((r) => { if (r.id !== id) return r; updated = { ...r, personalNotes: notes }; return updated; });
          return { savedRestaurants: next };
        });
        if (updated) upsertRestaurant(updated).catch((e) => console.error('updateNotes sync failed', e));
      },

      updateCategories: (id, categories) => {
        let updated: SavedRestaurant | undefined;
        set((state) => {
          const next = state.savedRestaurants.map((r) => { if (r.id !== id) return r; updated = { ...r, categories }; return updated; });
          return { savedRestaurants: next };
        });
        if (updated) upsertRestaurant(updated).catch((e) => console.error('updateCategories sync failed', e));
      },

      // Search & Filters
      filters: DEFAULT_FILTERS,
      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),
      clearFilters: () => set({ filters: DEFAULT_FILTERS }),

      // UI State
      activeTab: 'map',
      setActiveTab: (tab) => set({ activeTab: tab }),
      selectedRestaurantId: null,
      setSelectedRestaurantId: (id) => set({ selectedRestaurantId: id }),

      // Default city
      defaultCity: null,
      setDefaultCity: (city) => set({ defaultCity: city }),

      // Cities
      cities: [],
      addCity: (city) =>
        set((state) => ({
          cities: state.cities.includes(city)
            ? state.cities
            : [...state.cities, city],
        })),
    }),
    {
      name: 'restaurant-tracker-storage',
      version: 4,
      migrate: (persistedState): Partial<AppState> => {
        const s = persistedState as Partial<AppState>;
        return {
          mapView: s.mapView ?? DEFAULT_MAP_VIEW,
          activeTab: s.activeTab ?? 'map',
          defaultCity: s.defaultCity ?? null,
        };
      },
      partialize: (state) => ({
        mapView: state.mapView,
        activeTab: state.activeTab,
        defaultCity: state.defaultCity,
      }),
    }
  )
);

// Selectors — useShallow prevents "getSnapshot not cached" infinite loop in React 19
export const useToVisitList = () =>
  useStore(
    useShallow((state) => state.savedRestaurants.filter((r) => r.listType === 'toVisit'))
  );

export const useFavoritesList = () =>
  useStore(
    useShallow((state) => state.savedRestaurants.filter((r) => r.listType === 'favorite'))
  );

export const useFilteredRestaurants = (listType?: 'toVisit' | 'favorite') => {
  return useStore(
    useShallow((state) => {
      let restaurants = state.savedRestaurants;

      if (listType) {
        restaurants = restaurants.filter((r) => r.listType === listType);
      }

      const { query, categories, city } = state.filters;

      if (query) {
        const lowerQuery = query.toLowerCase();
        restaurants = restaurants.filter(
          (r) =>
            r.name.toLowerCase().includes(lowerQuery) ||
            r.address.toLowerCase().includes(lowerQuery)
        );
      }

      if (categories.length > 0) {
        restaurants = restaurants.filter((r) =>
          r.categories.some((c) => categories.includes(c))
        );
      }

      if (city) {
        restaurants = restaurants.filter(
          (r) => r.city.toLowerCase() === city.toLowerCase()
        );
      }

      return restaurants;
    })
  );
};
