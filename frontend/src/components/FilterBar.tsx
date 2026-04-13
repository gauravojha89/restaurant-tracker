import { X, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { CATEGORIES, type Category } from '../types';

export function FilterBar() {
  const { filters, setFilters, clearFilters, cities } = useStore();
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  const hasFilters = filters.categories.length > 0 || filters.city;

  // Close dropdown on click outside
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
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    setFilters({ categories: updated });
  };

  const CategoryTile = ({ cat }: { cat: typeof CATEGORIES[0] }) => {
    const isActive = filters.categories.includes(cat.value);
    return (
      <button
        onClick={() => toggleCategory(cat.value)}
        className={`flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 border ${
          isActive ? 'shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }`}
        style={isActive ? { borderColor: cat.color, backgroundColor: `${cat.color}12` } : undefined}
      >
        <span className="w-5 h-5 rounded flex items-center justify-center text-xs flex-shrink-0"
          style={{ backgroundColor: `${cat.color}25` }}>
          {cat.emoji}
        </span>
        <span className="text-xs" style={isActive ? { color: cat.color } : { color: '#374151' }}>{cat.label}</span>
      </button>
    );
  };

  const CityDropdown = () => (
    <div ref={cityDropdownRef} className="relative flex-shrink-0">
      <button
        onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
          filters.city ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
        }`}
      >
        📍 {filters.city || 'All Cities'}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {cityDropdownOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            <button onClick={() => { setFilters({ city: '' }); setCityDropdownOpen(false); }}
              className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 ${!filters.city ? 'bg-primary-50 text-primary-700' : 'text-gray-700'}`}>
              All Cities
            </button>
            {cities.map((city) => (
              <button key={city} onClick={() => { setFilters({ city }); setCityDropdownOpen(false); }}
                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 ${filters.city === city ? 'bg-primary-50 text-primary-700' : 'text-gray-700'}`}>
                {city}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white border-b border-gray-100 px-4 py-2">

      {/* Desktop: all in one row */}
      <div className="hidden md:flex items-center gap-2 flex-wrap">
        <CityDropdown />
        <div className="w-px h-5 bg-gray-200 flex-shrink-0" />
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl flex-shrink-0" style={{ backgroundColor: '#fdf6ee' }}>
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#92694a' }}>Meal</span>
          {CATEGORIES.filter(c => c.group === 'meal').map(cat => <CategoryTile key={cat.value} cat={cat} />)}
        </div>
        <div className="w-px h-5 bg-gray-200 flex-shrink-0" />
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl flex-shrink-0" style={{ backgroundColor: '#f0f0f8' }}>
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#5b5b8a' }}>Occasion</span>
          {CATEGORIES.filter(c => c.group === 'occasion').map(cat => <CategoryTile key={cat.value} cat={cat} />)}
        </div>
        {hasFilters && (
          <button onClick={clearFilters}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Mobile: stacked rows with wrapping tiles */}
      <div className="flex flex-col gap-2 md:hidden">
        <div className="flex items-center gap-2">
          <CityDropdown />
          {hasFilters && (
            <button onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 items-center px-3 py-2 rounded-xl" style={{ backgroundColor: '#fdf6ee' }}>
          <span className="text-xs font-semibold uppercase tracking-wide flex-shrink-0" style={{ color: '#92694a' }}>Meal</span>
          {CATEGORIES.filter(c => c.group === 'meal').map(cat => <CategoryTile key={cat.value} cat={cat} />)}
        </div>
        <div className="flex flex-wrap gap-1.5 items-center px-3 py-2 rounded-xl" style={{ backgroundColor: '#f0f0f8' }}>
          <span className="text-xs font-semibold uppercase tracking-wide flex-shrink-0" style={{ color: '#5b5b8a' }}>Occasion</span>
          {CATEGORIES.filter(c => c.group === 'occasion').map(cat => <CategoryTile key={cat.value} cat={cat} />)}
        </div>
      </div>
    </div>
  );
}