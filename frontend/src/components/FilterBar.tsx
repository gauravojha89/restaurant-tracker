import { X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { CATEGORIES, type Category } from '../types';

export function FilterBar() {
  const { filters, setFilters, clearFilters, cities } = useStore();
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  const hasFilters = filters.categories.length > 0 || filters.city;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCategory = (category: Category) => {
    const current = filters.categories;
    setFilters({
      categories: current.includes(category)
        ? current.filter(c => c !== category)
        : [...current, category],
    });
  };

  // Keep all categories readable and tappable in a single horizontal row.
  const Pill = ({ cat }: { cat: typeof CATEGORIES[0] }) => {
    const isActive = filters.categories.includes(cat.value);
    return (
      <button
        onClick={() => toggleCategory(cat.value)}
        className="flex items-center gap-1 rounded-full flex-shrink-0 transition-all duration-200 active:scale-95 border px-3 py-1.5"
        style={isActive
          ? { backgroundColor: cat.color, color: '#fff', borderColor: cat.color }
          : { backgroundColor: '#fff', color: '#4b5563', borderColor: '#e5e7eb' }
        }
      >
        <span className="text-base leading-none">{cat.emoji}</span>
        <span className="text-xs font-semibold whitespace-nowrap">{cat.label}</span>
      </button>
    );
  };

  const Strip = ({ group, label }: { group: 'meal' | 'occasion' | 'drinks'; label: string }) => (
    <div className="rounded-2xl border border-gray-200 bg-white px-2 py-2">
      <div className="px-2 pb-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</span>
      </div>
      <div
        className="flex items-center gap-2 overflow-x-auto px-2 pb-1"
        style={{
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
        } as React.CSSProperties}
      >
        {CATEGORIES.filter(c => c.group === group).map(cat => <Pill key={cat.value} cat={cat} />)}
      </div>
    </div>
  );

  const CityRow = () => (
    <div className="flex items-center gap-2 px-1 pt-2 pb-1.5">
      <div ref={cityDropdownRef} className="relative flex-shrink-0">
        <button
          onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
            filters.city
              ? 'text-white border-transparent'
              : 'text-gray-700 border-gray-200'
          }`}
          style={filters.city
            ? { backgroundColor: '#0ea5e9' }
            : { backgroundColor: '#fff' }
          }
        >
          📍 {filters.city || 'All Cities'}
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        {cityDropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              <button onClick={() => { setFilters({ city: '' }); setCityDropdownOpen(false); }}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 ${!filters.city ? 'text-primary-600 font-medium' : 'text-gray-700'}`}>
                All Cities
              </button>
              {cities.map(city => (
                <button key={city} onClick={() => { setFilters({ city }); setCityDropdownOpen(false); }}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 ${filters.city === city ? 'text-primary-600 font-medium' : 'text-gray-700'}`}>
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {hasFilters && (
        <button onClick={clearFilters}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 transition-colors active:scale-95 border border-gray-200 bg-white">
          <X className="w-3 h-3" /> Clear
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 border-b border-gray-100 px-3 pb-3">
      <div className="flex items-center gap-1.5 px-1 pt-2">
        <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Filters</span>
      </div>
      <CityRow />
      <div className="flex flex-col gap-2">
        <Strip group="meal" label="Meal" />
        <Strip group="drinks" label="Drinks" />
        <Strip group="occasion" label="Occasion" />
      </div>
    </div>
  );
}
