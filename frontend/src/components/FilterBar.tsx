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

  return (
    <div className="bg-white border-b border-gray-100 py-2 px-4 space-y-2">
      {/* Row 1: City + Meal types */}
      <div className="flex items-center gap-3">
        {/* City Filter — kept outside the scrollable track so its dropdown isn't clipped */}
        <div ref={cityDropdownRef} className="relative flex-shrink-0">
          <button
            onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
              border transition-all duration-200
              ${
                filters.city
                  ? 'bg-primary-50 border-primary-200 text-primary-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            📍 {filters.city || 'All Cities'}
            <ChevronDown className="w-4 h-4" />
          </button>

          {cityDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                <button
                  onClick={() => {
                    setFilters({ city: '' });
                    setCityDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 ${
                    !filters.city ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                  }`}
                >
                  All Cities
                </button>
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setFilters({ city });
                      setCityDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 ${
                      filters.city === city ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category Pills — scrollable track */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 pb-1">
        {CATEGORIES.filter(c => c.group === 'meal').map((cat) => {
          const isActive = filters.categories.includes(cat.value);
          return (
            <button
              key={cat.value}
              onClick={() => toggleCategory(cat.value)}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium
                transition-all duration-200 flex-shrink-0
                ${
                  isActive
                    ? 'text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              style={isActive ? { backgroundColor: cat.color } : undefined}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
                       text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
        </div>{/* end scrollable track */}
      </div>

      {/* Row 2: Occasion filters */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        <span className="text-xs font-medium text-gray-400 flex-shrink-0">Occasion</span>
        {CATEGORIES.filter(c => c.group === 'occasion').map((cat) => {
          const isActive = filters.categories.includes(cat.value);
          return (
            <button
              key={cat.value}
              onClick={() => toggleCategory(cat.value)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                transition-all duration-200 flex-shrink-0
                ${isActive ? 'text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              `}
              style={isActive ? { backgroundColor: cat.color } : undefined}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
