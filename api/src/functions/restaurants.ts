import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getRestaurantsByUser, upsertRestaurant, deleteRestaurant, RestaurantDocument } from '../cosmos.js';

// Extract GitHub username from Azure SWA's injected auth header
function getUserId(req: HttpRequest): string {
  const principal = req.headers.get('x-ms-client-principal');
  if (principal) {
    try {
      const decoded = Buffer.from(principal, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded) as { userDetails?: string; userId?: string };
      const id = parsed.userDetails || parsed.userId;
      if (id) return id;
    } catch {
      // fall through
    }
  }
  return 'anonymous';
}

/**
 * GET /api/restaurants - Get all restaurants for the current user
 */
app.http('getRestaurants', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'restaurants',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const userId = getUserId(req);
      const restaurants = await getRestaurantsByUser(userId);

      return {
        status: 200,
        jsonBody: restaurants,
        headers: {
          'Content-Type': 'application/json',
        },
      };
    } catch (error) {
      context.error('Error fetching restaurants:', error);
      return {
        status: 500,
        jsonBody: { error: 'Failed to fetch restaurants' },
      };
    }
  },
});

/**
 * POST /api/restaurants - Create or update a restaurant
 */
app.http('upsertRestaurant', {
  methods: ['POST', 'PUT'],
  authLevel: 'anonymous',
  route: 'restaurants',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const userId = getUserId(req);
      const body = (await req.json()) as Partial<RestaurantDocument>;

      if (!body.id || !body.name) {
        return {
          status: 400,
          jsonBody: { error: 'Missing required fields: id, name' },
        };
      }

      const restaurant: RestaurantDocument = {
        id: body.id,
        partitionKey: userId,
        userId,
        name: body.name,
        address: body.address || '',
        city: body.city || '',
        latitude: body.latitude || 0,
        longitude: body.longitude || 0,
        categories: body.categories || [],
        listType: body.listType || 'toVisit',
        personalRating: body.personalRating,
        personalNotes: body.personalNotes,
        savedAt: body.savedAt || new Date().toISOString(),
        visitedAt: body.visitedAt,
        createdAt: body.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await upsertRestaurant(restaurant);

      return {
        status: 200,
        jsonBody: result,
        headers: {
          'Content-Type': 'application/json',
        },
      };
    } catch (error) {
      context.error('Error upserting restaurant:', error);
      return {
        status: 500,
        jsonBody: { error: 'Failed to save restaurant' },
      };
    }
  },
});

/**
 * DELETE /api/restaurants/:id - Delete a restaurant
 */
app.http('deleteRestaurant', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'restaurants/{id}',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const userId = getUserId(req);
      const id = req.params.id;

      if (!id) {
        return {
          status: 400,
          jsonBody: { error: 'Missing restaurant ID' },
        };
      }

      await deleteRestaurant(id, userId);

      return {
        status: 204,
      };
    } catch (error) {
      context.error('Error deleting restaurant:', error);
      return {
        status: 500,
        jsonBody: { error: 'Failed to delete restaurant' },
      };
    }
  },
});

/**
 * Health check endpoint
 */
app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'health',
  handler: async (): Promise<HttpResponseInit> => {
    return {
      status: 200,
      jsonBody: { status: 'healthy', timestamp: new Date().toISOString() },
    };
  },
});
