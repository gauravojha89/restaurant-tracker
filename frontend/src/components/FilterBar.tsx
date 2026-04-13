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
          : { backgroundColor: '#3a3a3c', color: '#e5e5ea', padding: '5px 8px' }
        }
      >
        <span className="text-base leading-none">{cat.emoji}</span>
        {isActive && (
          <span className="text-xs font-semibold whitespace-nowrap">{cat.label}</span>
        )}
      </button>
    );
  };

  // Pill-shaped rounded card: label pinned left, pills scroll right
  const Strip = ({
    group, label, labelColor, bgColor,
  }: {
    group: 'meal' | 'occasion' | 'drinks'; label: string; labelColor: string; bgColor: string;
  }) => (
    <div className="flex items-center rounded-2xl overflow-hidden mx-2" style={{ backgroundColor: bgColor }}>
      {/* Pinned label */}
      <div className="flex-shrink-0 pl-4 pr-3 py-2.5 flex items-center">
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
    <div className="flex items-center gap-2 px-3 py-2">
      <div ref={cityDropdownRef} className="relative flex-shrink-0">
        <button
          onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            filters.city
              ? 'text-white'
              : 'text-[#e5e5ea]'
          }`}
          style={filters.city
            ? { backgroundColor: '#0ea5e9' }
            : { backgroundColor: '#3a3a3c' }
          }
        >
          📍 {filters.city || 'All Cities'}
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        {cityDropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-[#1c1c1e] border border-[#3a3a3c] rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              <button onClick={() => { setFilters({ city: '' }); setCityDropdownOpen(false); }}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-[#2c2c2e] ${!filters.city ? 'text-primary-400 font-medium' : 'text-[#e5e5ea]'}`}>
                All Cities
              </button>
              {cities.map(city => (
                <button key={city} onClick={() => { setFilters({ city }); setCityDropdownOpen(false); }}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-[#2c2c2e] ${filters.city === city ? 'text-primary-400 font-medium' : 'text-[#e5e5ea]'}`}>
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {hasFilters && (
        <button onClick={clearFilters}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[#aeaeb2] transition-colors active:scale-95"
          style={{ backgroundColor: '#3a3a3c' }}>
          <X className="w-3 h-3" /> Clear
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-[#111111] border-b border-[#2c2c2e] flex flex-col gap-1.5 pb-2">
      <CityRow />
      <Strip group="meal"     label="Meal"     labelColor="#d4956a" bgColor="#1e1810" />
      <Strip group="drinks"   label="Drinks"   labelColor="#fbbf24" bgColor="#1e1700" />
      <Strip group="occasion" label="Occasion" labelColor="#9999cc" bgColor="#18182a" />
    </div>
  );
}
