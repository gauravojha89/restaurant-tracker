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
          <div className="relative overflow-hidden rounded-2xl px-3.5 py-3 border border-cyan-300/30 bg-gradient-to-r from-[#10213b] via-[#153451] to-[#115164] shadow-[0_12px_24px_rgba(0,0,0,0.34)]">
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-cyan-300/24" />
            <div className="absolute -left-6 -bottom-7 h-16 w-16 rounded-full bg-blue-300/20" />
            <div className="relative flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-300/55 to-sky-300/45 text-slate-900 flex items-center justify-center text-lg border border-cyan-100/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.62)]">
                🍽️
              </div>
              <div className="min-w-0">
                <h1 className="text-[20px] sm:text-[22px] font-bold tracking-[-0.02em] text-slate-50 leading-none truncate">
                  WishBite
                </h1>
                <p className="text-[12px] text-cyan-100/90 mt-0.5 truncate">your personal restaurant tracker</p>
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
