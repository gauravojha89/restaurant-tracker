import { Map, Heart, MapPin } from 'lucide-react';
import { useStore, useToVisitList, useFavoritesList } from '../store';

export function Header() {
  const { activeTab, setActiveTab } = useStore();
  const toVisitList = useToVisitList();
  const favoritesList = useFavoritesList();

  const tabs = [
    { id: 'map' as const, label: 'Explore', icon: Map, count: null },
    { id: 'toVisit' as const, label: 'To Visit', icon: MapPin, count: toVisitList.length },
    { id: 'favorites' as const, label: 'Favorites', icon: Heart, count: favoritesList.length },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <h1 className="text-xl font-semibold text-gray-900">
              Wish<span className="text-primary-500">Bite</span>
            </h1>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200 ease-in-out
                    ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.count !== null && tab.count > 0 && (
                    <span
                      className={`
                        text-xs px-1.5 py-0.5 rounded-full font-medium
                        ${
                          isActive
                            ? 'bg-primary-200 text-primary-800'
                            : 'bg-gray-200 text-gray-700'
                        }
                      `}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
