import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getRestaurantsByUser, upsertRestaurant, deleteRestaurant, RestaurantDocument } from '../cosmos.js';

// Simple user ID extraction (in production, use proper auth like Azure AD B2C)
function getUserId(req: HttpRequest): string {
  // Check for user ID in header (for authenticated requests)
  const userId = req.headers.get('x-user-id');
  if (userId) return userId;

  // For demo purposes, use a default user
  // In production, integrate with Azure AD B2C or similar
  return 'demo-user';
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
