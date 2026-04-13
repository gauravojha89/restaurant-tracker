import { Map, Heart, MapPin, LogOut } from 'lucide-react';
import { useStore, useToVisitList, useFavoritesList } from '../store';

interface HeaderProps {
  onChangeCityClick: () => void;
}

export function Header({ onChangeCityClick }: HeaderProps) {
  const { activeTab, setActiveTab, defaultCity } = useStore();
  const toVisitList = useToVisitList();
  const favoritesList = useFavoritesList();

  const tabs = [
    { id: 'map' as const, label: 'Explore', icon: Map, count: null },
    { id: 'toVisit' as const, label: 'To Visit', icon: MapPin, count: toVisitList.length },
    { id: 'favorites' as const, label: 'Favorites', icon: Heart, count: favoritesList.length },
  ];

  return (
    <header className="bg-[#1c1c1e] border-b border-[#3a3a3c] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <h1 className="text-xl font-semibold text-white">
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

          {/* City indicator */}
          <button
            onClick={onChangeCityClick}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-200 hover:bg-[#2c2c2e] rounded-lg transition-colors"
            title="Change default city"
          >
            <MapPin className="w-3.5 h-3.5 text-primary-500" />
            {defaultCity ?? 'Set city'}
          </button>

          {/* Logout */}
          <a
            href="/.auth/logout?post_logout_redirect_uri=/"
            className="p-2 text-gray-500 hover:text-gray-300 hover:bg-[#2c2c2e] rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
