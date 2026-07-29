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
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/70 border border-white/20 flex items-center justify-center">
          {listType === 'toVisit' ? (
            <MapPin className="w-8 h-8 text-slate-300" />
          ) : (
            <Heart className="w-8 h-8 text-slate-300" />
          )}
        </div>
        <h2 className="text-xl font-semibold text-slate-100 mb-2">
          {listType === 'toVisit' ? 'No places to visit yet' : 'No favorites yet'}
        </h2>
        <p className="text-slate-300">
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
    <div className="flex-1 min-h-0 max-w-4xl mx-auto w-full px-3 sm:px-4 pb-4">
      <FilterBar />

      {restaurants.length === 0 ? (
        <EmptyState listType={listType} />
      ) : (
        <div className="flex-1 overflow-y-auto pt-3 pb-8 relative z-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between px-1 mb-3">
              <span className="text-sm text-slate-300">
                {restaurants.length} {restaurants.length === 1 ? 'place' : 'places'}
              </span>
            </div>
            <div className="space-y-1.5">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
