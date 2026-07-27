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
    { id: 'toVisit' as const, label: 'To Visit', icon: MapPin, count: toVisitList.length },
    { id: 'favorites' as const, label: 'Favorites', icon: Heart, count: favoritesList.length },
    { id: 'map' as const, label: 'Explore', icon: Map, count: null },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/70 bg-white/85 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto px-4 pt-3 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-base">
              🍽️
            </div>
            <div>
              <h1 className="text-[15px] sm:text-base font-semibold tracking-tight text-gray-900 leading-none">
                WishBite
              </h1>
              <p className="text-[11px] text-gray-500 mt-0.5">Your personal food list</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onChangeCityClick}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              title="Change default city"
            >
              <MapPin className="w-3.5 h-3.5 text-primary-500" />
              <span className="max-w-24 truncate">{defaultCity ?? 'Set city'}</span>
            </button>

            <a
              href="/.auth/logout?post_logout_redirect_uri=/"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </a>
          </div>
        </div>

        <nav className="grid grid-cols-3 rounded-2xl bg-gray-100/90 p-1 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs sm:text-sm font-medium
                    transition-all duration-200 ease-in-out
                    ${
                      isActive
                        ? 'bg-white text-primary-700 shadow-sm'
                        : 'text-gray-600 hover:bg-white/70 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
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
    </header>
  );
}
