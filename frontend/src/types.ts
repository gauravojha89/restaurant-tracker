export type Category = 'breakfast' | 'brunch' | 'lunch' | 'dinner' | 'coffee' | 'desserts' | 'everyday' | 'date-night' | 'celebration' | 'bar';

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

export const CATEGORIES: { value: Category; label: string; emoji: string; color: string; group: 'meal' | 'occasion' | 'drinks' }[] = [
  // — Meal types —
  { value: 'breakfast', label: 'Breakfast', emoji: '🍳', color: '#f59e0b', group: 'meal' },
  { value: 'brunch', label: 'Brunch', emoji: '🥂', color: '#ec4899', group: 'meal' },
  { value: 'lunch', label: 'Lunch', emoji: '🥗', color: '#22c55e', group: 'meal' },
  { value: 'dinner', label: 'Dinner', emoji: '🍽️', color: '#8b5cf6', group: 'meal' },
  { value: 'desserts', label: 'Desserts', emoji: '🍰', color: '#f472b6', group: 'meal' },
  // — Drinks —
  { value: 'coffee', label: 'Coffee', emoji: '☕', color: '#78716c', group: 'drinks' },
  { value: 'bar', label: 'Bar', emoji: '🍻', color: '#d97706', group: 'drinks' },
  // — Occasions —
  { value: 'everyday', label: 'Casual', emoji: '🍴', color: '#0ea5e9', group: 'occasion' },
  { value: 'date-night', label: 'Date', emoji: '🌹', color: '#be185d', group: 'occasion' },
  { value: 'celebration', label: 'Célébration', emoji: '🎊', color: '#7c3aed', group: 'occasion' },
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
