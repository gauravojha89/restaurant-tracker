import { useCallback, useState } from 'react';
import type { Category } from '../types';

const AZURE_MAPS_KEY = import.meta.env.VITE_AZURE_MAPS_KEY || '';

export interface AzureMapsSearchResult {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  categories: Category[];
}

interface UseAzureMapsSearchResult {
  search: (query: string, center?: [number, number]) => Promise<AzureMapsSearchResult[]>;
  isLoading: boolean;
  error: string | null;
}

const AZURE_CATEGORY_MAP: Record<string, Category> = {
  'coffee shop': 'coffee',
  cafe: 'coffee',
  coffeeshop: 'coffee',
  tea: 'coffee',
  bakery: 'desserts',
  'ice cream': 'desserts',
  dessert: 'desserts',
  patisserie: 'desserts',
  donut: 'desserts',
  breakfast: 'breakfast',
  brunch: 'brunch',
  'sandwich and more': 'lunch',
  pizza: 'dinner',
  bar: 'dinner',
  pub: 'dinner',
  restaurant: 'dinner',
  'asian restaurant': 'dinner',
  'italian restaurant': 'dinner',
  'mexican restaurant': 'dinner',
  'american restaurant': 'dinner',
  'mediterranean restaurant': 'dinner',
  'french restaurant': 'dinner',
  'japanese restaurant': 'dinner',
  sushi: 'dinner',
  'fast food': 'lunch',
  diner: 'lunch',
  buffet: 'lunch',
  bistro: 'dinner',
};

function mapAzureCategories(rawCategories: string[]): Category[] {
  const matched = new Set<Category>();
  for (const raw of rawCategories) {
    const lower = raw.toLowerCase().trim();
    if (AZURE_CATEGORY_MAP[lower]) {
      matched.add(AZURE_CATEGORY_MAP[lower]);
    }
    // Partial match fallback
    for (const [key, cat] of Object.entries(AZURE_CATEGORY_MAP)) {
      if (lower.includes(key) || key.includes(lower)) {
        matched.add(cat);
        break;
      }
    }
  }
  return matched.size > 0 ? [...matched] : ['dinner'];
}

export function useAzureMapsSearch(): UseAzureMapsSearchResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (
    query: string,
    center?: [number, number]
  ): Promise<AzureMapsSearchResult[]> => {
    if (!query.trim()) return [];
    if (!AZURE_MAPS_KEY) {
      setError('Azure Maps key not configured');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        'api-version': '1.0',
        query,
        'subscription-key': AZURE_MAPS_KEY,
        limit: '10',
        language: 'en-US',
      });

      if (center) {
        params.append('lat', center[1].toString());
        params.append('lon', center[0].toString());
        params.append('radius', '50000'); // 50 km radius
      }

      const response = await fetch(
        `https://atlas.microsoft.com/search/poi/json?${params}`
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.results?.length) return [];

      return data.results.map((r: any): AzureMapsSearchResult => ({
        id: r.id,
        name: r.poi?.name ?? r.address?.freeformAddress ?? 'Unknown',
        address: r.address?.freeformAddress ?? '',
        city:
          r.address?.municipality ??
          r.address?.localName ??
          r.address?.countrySubdivision ??
          '',
        latitude: r.position.lat,
        longitude: r.position.lon,
        categories: mapAzureCategories(r.poi?.categories ?? []),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { search, isLoading, error };
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  if (!AZURE_MAPS_KEY) return null;
  try {
    const params = new URLSearchParams({
      'api-version': '1.0',
      query: `${latitude},${longitude}`,
      'subscription-key': AZURE_MAPS_KEY,
    });
    const response = await fetch(
      `https://atlas.microsoft.com/search/address/reverse/json?${params}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return (
      data.addresses?.[0]?.address?.municipality ??
      data.addresses?.[0]?.address?.localName ??
      null
    );
  } catch {
    return null;
  }
}
