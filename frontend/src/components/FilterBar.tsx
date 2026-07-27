import { X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { CATEGORIES, type Category } from '../types';

type MenuType = 'city' | 'meal' | 'sweets' | 'drinks' | 'occasion' | null;

export function FilterBar() {
  const { filters, setFilters, clearFilters, cities } = useStore();
  const [openMenu, setOpenMenu] = useState<MenuType>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasFilters = filters.categories.length > 0 || filters.city;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCategory = (category: Category) => {
    const current = filters.categories;
    setFilters({
      categories: current.includes(category)
        ? current.filter((c) => c !== category)
        : [...current, category],
    });
  };

  const CategoryMenu = ({ group, label }: { group: 'meal' | 'sweets' | 'drinks' | 'occasion'; label: string }) => {
    const selected = CATEGORIES.filter((c) => c.group === group && filters.categories.includes(c.value));
    const isOpen = openMenu === group;

    return (
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setOpenMenu(isOpen ? null : group)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            selected.length > 0
              ? 'bg-primary-500/90 text-white border-primary-400/90'
              : 'glass-pill text-slate-100 border-white/25 hover:bg-white/10'
          }`}
        >
          {label}
          {selected.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 font-semibold">{selected.length}</span>
          )}
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-56 glass-surface rounded-2xl z-[80] overflow-hidden">
            <div className="max-h-64 overflow-y-auto p-2">
              {CATEGORIES.filter((c) => c.group === group).map((cat) => {
                const active = filters.categories.includes(cat.value);
                return (
                  <button
                    key={cat.value}
                    onClick={() => toggleCategory(cat.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                      active ? 'bg-primary-500/30 text-primary-100' : 'hover:bg-white/10 text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </span>
                    {active && <span className="text-xs font-semibold">Selected</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative z-40 px-2 py-2 overflow-visible">
      <div className="flex items-center gap-1.5 px-1 mb-2">
        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">Filters</span>
      </div>

      <div className="flex items-center gap-1.5 pb-1">
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setOpenMenu(openMenu === 'city' ? null : 'city')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filters.city
                ? 'bg-primary-500/90 text-white border-primary-400/90'
                : 'glass-pill text-slate-100 border-white/25 hover:bg-white/10'
            }`}
          >
            📍 <span className="max-w-16 sm:max-w-24 truncate">{filters.city || 'All Cities'}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {openMenu === 'city' && (
            <div className="absolute top-full left-0 mt-2 w-52 glass-surface rounded-2xl z-[80] overflow-hidden">
              <div className="max-h-64 overflow-y-auto p-2">
                <button
                  onClick={() => {
                    setFilters({ city: '' });
                    setOpenMenu(null);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-left text-sm hover:bg-white/55 ${
                    !filters.city ? 'text-primary-100 bg-primary-500/30' : 'text-slate-200'
                  }`}
                >
                  All Cities
                </button>
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setFilters({ city });
                      setOpenMenu(null);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left text-sm hover:bg-white/55 ${
                      filters.city === city ? 'text-primary-100 bg-primary-500/30' : 'text-slate-200'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <CategoryMenu group="meal" label="Meal" />
        <CategoryMenu group="sweets" label="Sweets" />
        <CategoryMenu group="drinks" label="Drinks" />
        <CategoryMenu group="occasion" label="Occasion" />

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-slate-200 border border-white/25 glass-pill hover:bg-white/10"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
