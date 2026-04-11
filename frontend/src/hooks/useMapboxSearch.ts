import { useCallback, useState } from 'react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface SearchResult {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  categories: string[];
}

interface UseMapboxSearchResult {
  search: (query: string, proximity?: [number, number]) => Promise<SearchResult[]>;
  isLoading: boolean;
  error: string | null;
}

export function useMapboxSearch(): UseMapboxSearchResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (query: string, proximity?: [number, number]): Promise<SearchResult[]> => {
      if (!query.trim()) return [];
      if (!MAPBOX_TOKEN) {
        setError('Mapbox token not configured');
        return [];
      }

      setIsLoading(true);
      setError(null);

      try {
        const proximityParam = proximity
          ? `&proximity=${proximity[0]},${proximity[1]}`
          : '';

        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?access_token=${MAPBOX_TOKEN}&types=poi&limit=10${proximityParam}`
        );

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();

        const results: SearchResult[] = data.features.map((feature: any) => {
          const context = feature.context || [];
          const cityContext = context.find(
            (c: any) => c.id.startsWith('place') || c.id.startsWith('locality')
          );

          return {
            id: feature.id,
            name: feature.text,
            address: feature.place_name,
            city: cityContext?.text || '',
            latitude: feature.center[1],
            longitude: feature.center[0],
            categories: feature.properties?.category?.split(',') || [],
          };
        });

        return results;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { search, isLoading, error };
}

export function useReverseGeocode() {
  const getCity = useCallback(
    async (longitude: number, latitude: number): Promise<string | null> => {
      if (!MAPBOX_TOKEN) return null;

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&types=place`
        );

        if (!response.ok) return null;

        const data = await response.json();
        return data.features[0]?.text || null;
      } catch {
        return null;
      }
    },
    []
  );

  return { getCity };
}
