import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type { SavedRestaurant, SearchFilters, MapViewState } from './types';

interface AppState {
  // Map state
  mapView: MapViewState;
  setMapView: (view: Partial<MapViewState>) => void;

  // Saved restaurants
  savedRestaurants: SavedRestaurant[];
  addToList: (restaurant: Omit<SavedRestaurant, 'savedAt'>) => void;
  removeFromList: (id: string) => void;
  moveToFavorites: (id: string, personalRating?: number, personalNotes?: string) => void;
  updateNotes: (id: string, notes: string) => void;

  // Search & Filters
  filters: SearchFilters;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;

  // UI State
  activeTab: 'map' | 'toVisit' | 'favorites';
  setActiveTab: (tab: 'map' | 'toVisit' | 'favorites') => void;
  selectedRestaurantId: string | null;
  setSelectedRestaurantId: (id: string | null) => void;

  // Cities (derived from saved restaurants + default)
  cities: string[];
  addCity: (city: string) => void;
}

const DEFAULT_MAP_VIEW: MapViewState = {
  longitude: -122.4194,
  latitude: 37.7749,
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
      
      addToList: (restaurant) =>
        set((state) => {
          // Check if already exists
          const exists = state.savedRestaurants.find((r) => r.id === restaurant.id);
          if (exists) return state;

          const newRestaurant: SavedRestaurant = {
            ...restaurant,
            savedAt: new Date().toISOString(),
          };
          
          // Add city if new
          if (!state.cities.includes(restaurant.city)) {
            return {
              savedRestaurants: [...state.savedRestaurants, newRestaurant],
              cities: [...state.cities, restaurant.city],
            };
          }
          
          return { savedRestaurants: [...state.savedRestaurants, newRestaurant] };
        }),

      removeFromList: (id) =>
        set((state) => ({
          savedRestaurants: state.savedRestaurants.filter((r) => r.id !== id),
        })),

      moveToFavorites: (id, personalRating, personalNotes) =>
        set((state) => ({
          savedRestaurants: state.savedRestaurants.map((r) =>
            r.id === id
              ? {
                  ...r,
                  listType: 'favorite' as const,
                  visitedAt: new Date().toISOString(),
                  personalRating,
                  personalNotes: personalNotes || r.personalNotes,
                }
              : r
          ),
        })),

      updateNotes: (id, notes) =>
        set((state) => ({
          savedRestaurants: state.savedRestaurants.map((r) =>
            r.id === id ? { ...r, personalNotes: notes } : r
          ),
        })),

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

      // Cities
      cities: ['San Francisco', 'New York', 'Los Angeles'],
      addCity: (city) =>
        set((state) => ({
          cities: state.cities.includes(city)
            ? state.cities
            : [...state.cities, city],
        })),
    }),
    {
      name: 'restaurant-tracker-storage',
      partialize: (state) => ({
        savedRestaurants: state.savedRestaurants,
        cities: state.cities,
        mapView: state.mapView,
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
