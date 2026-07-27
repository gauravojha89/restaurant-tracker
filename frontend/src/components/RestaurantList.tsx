import { useFilteredRestaurants } from '../store';
import { RestaurantCard } from './RestaurantCard';
import { FilterBar } from './FilterBar';
import { Heart, MapPin } from 'lucide-react';

interface RestaurantListProps {
  listType: 'toVisit' | 'favorite';
}

// Declared outside component to avoid "components created during render" React rules warning
function EmptyState({ listType }: { listType: 'toVisit' | 'favorite' }) {
  return (
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
}

export function RestaurantList({ listType }: RestaurantListProps) {
  const restaurants = useFilteredRestaurants(listType);

  return (
    <div className="flex-1 min-h-0 p-3 sm:p-4">
      <div className="h-full max-w-4xl mx-auto rounded-[24px] border border-slate-300/80 bg-slate-100/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_10px_28px_rgba(15,23,42,0.10)] overflow-hidden flex flex-col">
        <FilterBar />

        {restaurants.length === 0 ? (
          <EmptyState listType={listType} />
        ) : (
          <div className="flex-1 overflow-y-auto p-4 pb-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between px-1 mb-3">
                <span className="text-sm text-gray-600">
                  {restaurants.length} {restaurants.length === 1 ? 'place' : 'places'}
                </span>
              </div>
              <div className="space-y-2.5">
                {restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
