import { CosmosClient, Database, Container } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';

let client: CosmosClient | null = null;
let database: Database | null = null;
let container: Container | null = null;

/**
 * Get Cosmos DB client using Managed Identity (secure by design)
 * Falls back to connection string for local development
 */
export async function getCosmosContainer(): Promise<Container> {
  if (container) return container;

  const endpoint = process.env.COSMOS_ENDPOINT;
  const databaseId = process.env.COSMOS_DATABASE || 'restauranttracker';
  const containerId = process.env.COSMOS_CONTAINER || 'restaurants';

  if (!endpoint) {
    throw new Error('COSMOS_ENDPOINT environment variable is required');
  }

  // Use Managed Identity (DefaultAzureCredential)
  // In Azure, this automatically uses the Function App's managed identity
  // Locally, it uses Azure CLI credentials or other configured credentials
  const credential = new DefaultAzureCredential();

  client = new CosmosClient({
    endpoint,
    aadCredentials: credential,
  });

  database = client.database(databaseId);
  container = database.container(containerId);

  return container;
}

/**
 * Restaurant document interface
 */
export interface RestaurantDocument {
  id: string;
  partitionKey: string; // userId
  userId: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  categories: string[];
  listType: 'toVisit' | 'favorite';
  personalRating?: number;
  personalNotes?: string;
  savedAt: string;
  visitedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create or update a restaurant document
 */
export async function upsertRestaurant(
  restaurant: RestaurantDocument
): Promise<RestaurantDocument> {
  const container = await getCosmosContainer();
  const { resource } = await container.items.upsert<RestaurantDocument>(restaurant);
  if (!resource) {
    throw new Error('Failed to upsert restaurant');
  }
  return resource;
}

/**
 * Get all restaurants for a user
 */
export async function getRestaurantsByUser(
  userId: string
): Promise<RestaurantDocument[]> {
  const container = await getCosmosContainer();
  const { resources } = await container.items
    .query({
      query: 'SELECT * FROM c WHERE c.userId = @userId',
      parameters: [{ name: '@userId', value: userId }],
    })
    .fetchAll();
  return resources as RestaurantDocument[];
}

/**
 * Delete a restaurant
 */
export async function deleteRestaurant(
  id: string,
  userId: string
): Promise<void> {
  const container = await getCosmosContainer();
  await container.item(id, userId).delete();
}
