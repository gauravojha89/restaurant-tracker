import { Map, Heart, MapPin } from 'lucide-react';
import { useStore, useToVisitList, useFavoritesList } from '../store';

export function Header() {
  const { activeTab, setActiveTab } = useStore();
  const toVisitList = useToVisitList();
  const favoritesList = useFavoritesList();

  const tabs = [
    { id: 'map' as const, label: 'Explore', icon: Map, count: null },
    { id: 'favorites' as const, label: 'Favorites', icon: Heart, count: favoritesList.length },
    { id: 'toVisit' as const, label: 'To Visit', icon: MapPin, count: toVisitList.length },
  ];

  const tabColors: Record<(typeof tabs)[number]['id'], {
    active: string;
    inactive: string;
    badgeActive: string;
    badgeInactive: string;
  }> = {
    toVisit: {
      active: 'text-sky-100 border border-sky-300/30 bg-gradient-to-r from-sky-500/30 to-cyan-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]',
      inactive: 'text-sky-100/85 glass-pill hover:bg-white/10',
      badgeActive: 'bg-sky-300/30 text-sky-100',
      badgeInactive: 'bg-slate-800/70 text-sky-200',
    },
    favorites: {
      active: 'text-rose-100 border border-rose-300/30 bg-gradient-to-r from-rose-500/30 to-pink-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]',
      inactive: 'text-rose-100/85 glass-pill hover:bg-white/10',
      badgeActive: 'bg-rose-300/30 text-rose-100',
      badgeInactive: 'bg-slate-800/70 text-rose-200',
    },
    map: {
      active: 'text-emerald-100 border border-emerald-300/30 bg-gradient-to-r from-emerald-500/30 to-teal-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]',
      inactive: 'text-emerald-100/85 glass-pill hover:bg-white/10',
      badgeActive: 'bg-emerald-300/30 text-emerald-100',
      badgeInactive: 'bg-slate-800/70 text-emerald-200',
    },
  };

  return (
    <header className="sticky top-0 z-50 border-b glass-divider bg-slate-950/45 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto px-4 pt-3 pb-3">
        <div className="mb-2.5">
          <div className="glass-surface relative overflow-hidden rounded-2xl px-3 py-2.5">
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-cyan-400/25" />
            <div className="absolute -left-6 -bottom-7 h-16 w-16 rounded-full bg-blue-400/20" />
            <div className="relative flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-cyan-500/35 to-sky-500/30 text-cyan-100 flex items-center justify-center text-base border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                🍽️
              </div>
              <div className="min-w-0">
                <h1 className="text-[15px] sm:text-base font-semibold tracking-tight text-slate-100 leading-none truncate">
                  WishBite
                </h1>
                <p className="text-[11px] text-slate-300 mt-0.5 truncate">Your personal food list</p>
              </div>
            </div>
          </div>
        </div>
        <nav className="grid grid-cols-3 rounded-2xl glass-surface p-1 gap-1">
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
