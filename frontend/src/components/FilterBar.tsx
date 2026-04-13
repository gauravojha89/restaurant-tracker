import { X, ChevronDown } from 'lucide-react';
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

  // Emoji-only when inactive → expands to emoji + label when active (Apple Maps style)
  const Pill = ({ cat }: { cat: typeof CATEGORIES[0] }) => {
    const isActive = filters.categories.includes(cat.value);
    return (
      <button
        onClick={() => toggleCategory(cat.value)}
        className="flex items-center gap-1 rounded-full flex-shrink-0 transition-all duration-200 active:scale-95"
        style={isActive
          ? { backgroundColor: cat.color, color: '#fff', padding: '5px 10px 5px 7px' }
          : { backgroundColor: 'rgba(0,0,0,0.07)', color: '#1c1c1e', padding: '5px 8px' }
        }
      >
        <span className="text-base leading-none">{cat.emoji}</span>
        {isActive && (
          <span className="text-xs font-semibold whitespace-nowrap">{cat.label}</span>
        )}
      </button>
    );
  };

  // Horizontal scroll strip: pinned label left, pills scroll right with fade edge
  const Strip = ({
    group, label, labelColor, bgColor,
  }: {
    group: 'meal' | 'occasion' | 'drinks'; label: string; labelColor: string; bgColor: string;
  }) => (
    <div className="flex items-center" style={{ backgroundColor: bgColor }}>
      {/* Pinned label */}
      <div className="flex-shrink-0 pl-4 pr-3 py-2.5 flex items-center" style={{ backgroundColor: bgColor }}>
        <span className="text-[11px] font-semibold uppercase tracking-widest select-none"
          style={{ color: labelColor }}>{label}</span>
      </div>
      {/* Separator */}
      <div className="w-px h-4 flex-shrink-0" style={{ backgroundColor: `${labelColor}30` }} />
      {/* Scrollable pills */}
      <div
        className="flex items-center gap-2 overflow-x-auto py-2.5 pl-3 pr-6 flex-1"
        style={{
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
          maskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
        } as React.CSSProperties}
      >
        {CATEGORIES.filter(c => c.group === group).map(cat => <Pill key={cat.value} cat={cat} />)}
      </div>
    </div>
  );

  const CityRow = () => (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100">
      <div ref={cityDropdownRef} className="relative flex-shrink-0">
        <button
          onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            filters.city
              ? 'text-white'
              : 'text-gray-700'
          }`}
          style={filters.city
            ? { backgroundColor: '#0ea5e9' }
            : { backgroundColor: 'rgba(0,0,0,0.06)' }
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
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 transition-colors active:scale-95"
          style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
          <X className="w-3 h-3" /> Clear
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-white border-b border-gray-100 divide-y divide-gray-100">
      <CityRow />
      <Strip group="meal"     label="Meal"     labelColor="#92694a" bgColor="#fdf8f3" />
      <Strip group="drinks"   label="Drinks"   labelColor="#92400e" bgColor="#fffbeb" />
      <Strip group="occasion" label="Occasion" labelColor="#5b5b8a" bgColor="#f3f3fa" />
    </div>
  );
}
