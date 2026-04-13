export type Category = 'breakfast' | 'brunch' | 'lunch' | 'dinner' | 'coffee' | 'desserts' | 'everyday' | 'date-night' | 'celebration';

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  categories: Category[];
  rating?: number;
  priceLevel?: number;
  imageUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedRestaurant extends Restaurant {
  listType: 'toVisit' | 'favorite';
  savedAt: string;
  visitedAt?: string;
  personalRating?: number;
  personalNotes?: string;
}

export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

export interface SearchFilters {
  query: string;
  categories: Category[];
  city: string;
}

export const CATEGORIES: { value: Category; label: string; emoji: string; color: string }[] = [
  // — Meal types —
  { value: 'breakfast', label: 'Morning Table', emoji: '🌅', color: '#f59e0b' },
  { value: 'brunch', label: 'Brunch', emoji: '🥂', color: '#ec4899' },
  { value: 'lunch', label: 'Déjeuner', emoji: '🥗', color: '#22c55e' },
  { value: 'dinner', label: 'Dîner', emoji: '🍽️', color: '#8b5cf6' },
  { value: 'coffee', label: 'Café', emoji: '☕', color: '#78716c' },
  { value: 'desserts', label: 'Pâtisserie', emoji: '🍰', color: '#f472b6' },
  // — Occasions —
  { value: 'everyday', label: 'Everyday Haunt', emoji: '🏡', color: '#0ea5e9' },
  { value: 'date-night', label: 'Rendez-vous', emoji: '🕯️', color: '#be185d' },
  { value: 'celebration', label: 'Célébration', emoji: '🎊', color: '#7c3aed' },
];

export const SAMPLE_CITIES = [
  'San Francisco',
  'New York',
  'Los Angeles',
  'Chicago',
  'Seattle',
  'Austin',
  'Portland',
  'Denver',
  'Miami',
  'Boston',
];
