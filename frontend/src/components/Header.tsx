import { Map, Heart, MapPin } from 'lucide-react';
import { useStore, useToVisitList, useFavoritesList } from '../store';

export function Header() {
  const { activeTab, setActiveTab } = useStore();
  const toVisitList = useToVisitList();
  const favoritesList = useFavoritesList();

  const tabs = [
    { id: 'toVisit' as const, label: 'To Visit', icon: MapPin, count: toVisitList.length },
    { id: 'favorites' as const, label: 'Favorites', icon: Heart, count: favoritesList.length },
    { id: 'map' as const, label: 'Explore', icon: Map, count: null },
  ];

  const tabColors: Record<(typeof tabs)[number]['id'], {
    active: string;
    inactive: string;
    badgeActive: string;
    badgeInactive: string;
  }> = {
    toVisit: {
      active: 'bg-sky-100 text-sky-800 shadow-sm',
      inactive: 'text-sky-700/80 bg-sky-50/60 hover:bg-sky-100/80',
      badgeActive: 'bg-sky-200 text-sky-800',
      badgeInactive: 'bg-sky-100 text-sky-700',
    },
    favorites: {
      active: 'bg-rose-100 text-rose-800 shadow-sm',
      inactive: 'text-rose-700/80 bg-rose-50/60 hover:bg-rose-100/80',
      badgeActive: 'bg-rose-200 text-rose-800',
      badgeInactive: 'bg-rose-100 text-rose-700',
    },
    map: {
      active: 'bg-emerald-100 text-emerald-800 shadow-sm',
      inactive: 'text-emerald-700/80 bg-emerald-50/60 hover:bg-emerald-100/80',
      badgeActive: 'bg-emerald-200 text-emerald-800',
      badgeInactive: 'bg-emerald-100 text-emerald-700',
    },
  };

  return (
    <header className="sticky top-0 z-50 border-b border-primary-100/70 bg-white/90 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto px-4 pt-3 pb-3">
        <div className="mb-2.5">
          <div className="relative overflow-hidden rounded-2xl border border-slate-700/70 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 px-3 py-2.5 shadow-md">
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-cyan-300/20" />
            <div className="absolute -left-6 -bottom-7 h-16 w-16 rounded-full bg-primary-300/20" />
            <div className="relative flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-cyan-300 to-primary-300 text-slate-900 flex items-center justify-center text-base shadow-sm">
                🍽️
              </div>
              <div className="min-w-0">
                <h1 className="text-[15px] sm:text-base font-semibold tracking-tight text-white leading-none truncate">
                  WishBite
                </h1>
                <p className="text-[11px] text-cyan-100/90 mt-0.5 truncate">Your personal food list</p>
              </div>
            </div>
          </div>
        </div>
        <nav className="grid grid-cols-3 rounded-2xl bg-gray-100/90 p-1 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const colors = tabColors[tab.id];

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs sm:text-sm font-medium
                    transition-all duration-200 ease-in-out
                    ${isActive ? colors.active : colors.inactive}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== null && tab.count > 0 && (
                    <span
                      className={`
                        text-xs px-1.5 py-0.5 rounded-full font-medium
                        ${isActive ? colors.badgeActive : colors.badgeInactive}
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
