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
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          {label}
          {selected.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 font-semibold">{selected.length}</span>
          )}
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="max-h-64 overflow-y-auto p-2">
              {CATEGORIES.filter((c) => c.group === group).map((cat) => {
                const active = filters.categories.includes(cat.value);
                return (
                  <button
                    key={cat.value}
                    onClick={() => toggleCategory(cat.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                      active ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-700'
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
    <div ref={containerRef} className="bg-slate-200/70 border-b border-slate-300/70 px-3 py-2.5">
      <div className="flex items-center gap-1.5 px-1 mb-2">
        <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Filters</span>
      </div>

      <div className="flex items-center gap-1.5 pb-1">
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setOpenMenu(openMenu === 'city' ? null : 'city')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filters.city
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            📍 <span className="max-w-16 sm:max-w-24 truncate">{filters.city || 'All Cities'}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {openMenu === 'city' && (
            <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="max-h-64 overflow-y-auto p-2">
                <button
                  onClick={() => {
                    setFilters({ city: '' });
                    setOpenMenu(null);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-left text-sm hover:bg-gray-50 ${
                    !filters.city ? 'text-primary-700 bg-primary-50' : 'text-gray-700'
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
                    className={`w-full px-3 py-2 rounded-xl text-left text-sm hover:bg-gray-50 ${
                      filters.city === city ? 'text-primary-700 bg-primary-50' : 'text-gray-700'
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
            className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-gray-500 border border-gray-200 bg-white hover:bg-gray-50"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
