import { useFilteredRestaurants } from '../store';
import { RestaurantCard } from './RestaurantCard';
import { FilterBar } from './FilterBar';
import { Heart, MapPin } from 'lucide-react';

interface RestaurantListProps {
  listType: 'toVisit' | 'favorite';
}

export function RestaurantList({ listType }: RestaurantListProps) {
  const restaurants = useFilteredRestaurants(listType);

  const EmptyState = () => (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          {listType === 'toVisit' ? (
            <MapPin className="w-8 h-8 text-gray-400" />
          ) : (
            <Heart className="w-8 h-8 text-gray-400" />
          )}
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {listType === 'toVisit' ? 'No places to visit yet' : 'No favorites yet'}
        </h2>
        <p className="text-gray-500">
          {listType === 'toVisit'
            ? 'Search for restaurants on the map and add them to your list!'
            : 'Visit places from your list and mark them as favorites!'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <FilterBar />

      {restaurants.length === 0 ? (
        // Check if we have any restaurants at all (before filter)
        <EmptyState />
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Stats */}
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-sm text-gray-500">
                {restaurants.length} {restaurants.length === 1 ? 'place' : 'places'}
              </span>
            </div>

            {/* Restaurant Cards */}
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
