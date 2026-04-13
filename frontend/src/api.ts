import type { SavedRestaurant } from './types';

export async function fetchRestaurants(): Promise<SavedRestaurant[]> {
  const res = await fetch('/api/restaurants');
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const docs = await res.json() as Record<string, unknown>[];
  // Strip Cosmos-internal fields so it matches SavedRestaurant
  return docs.map(({ partitionKey: _pk, userId: _uid, ...r }) => r as unknown as SavedRestaurant);
}

export async function upsertRestaurant(r: SavedRestaurant): Promise<void> {
  const res = await fetch('/api/restaurants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(r),
  });
  if (!res.ok) throw new Error(`Failed to save: ${res.status}`);
}

export async function deleteRestaurantApi(id: string): Promise<void> {
  const res = await fetch(`/api/restaurants/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete: ${res.status}`);
}
