import { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useMapboxSearch } from '../hooks/useMapboxSearch';
import { useStore } from '../store';
import type { Category } from '../types';

interface SearchResult {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  categories: string[];
}

interface SearchBarProps {
  onSelectResult?: (result: SearchResult) => void;
}

export function SearchBar({ onSelectResult }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { search, isLoading } = useMapboxSearch();
  const { mapView, setMapView } = useStore();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        const searchResults = await search(query, [mapView.longitude, mapView.latitude]);
        setResults(searchResults);
        setIsOpen(searchResults.length > 0);
        setSelectedIndex(-1);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, search, mapView.longitude, mapView.latitude]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelectResult(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    // Map Mapbox categories to our categories
    const mappedCategories = mapMapboxCategories(result.categories);

    setMapView({
      longitude: result.longitude,
      latitude: result.latitude,
      zoom: 16,
    });

    if (onSelectResult) {
      onSelectResult({ ...result, categories: mappedCategories as any });
    }

    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const mapMapboxCategories = (mapboxCategories: string[]): Category[] => {
    const categoryMap: Record<string, Category> = {
      cafe: 'coffee',
      coffee: 'coffee',
      'coffee shop': 'coffee',
      bakery: 'desserts',
      dessert: 'desserts',
      'ice cream': 'desserts',
      breakfast: 'breakfast',
      brunch: 'brunch',
      restaurant: 'dinner',
      food: 'lunch',
      bar: 'dinner',
      pizza: 'dinner',
      sushi: 'dinner',
      'fast food': 'lunch',
      diner: 'lunch',
    };

    const matched = new Set<Category>();
    mapboxCategories.forEach((cat) => {
      const lower = cat.toLowerCase().trim();
      if (categoryMap[lower]) {
        matched.add(categoryMap[lower]);
      }
    });

    return matched.size > 0 ? Array.from(matched) : ['lunch'];
  };

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search restaurants, cafes, bars..."
          className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl
                     text-gray-900 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     shadow-sm transition-shadow hover:shadow-md"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        )}
        {!isLoading && query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50"
        >
          <div className="max-h-80 overflow-y-auto">
            {results.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleSelectResult(result)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                           flex items-start gap-3 ${
                             selectedIndex === index ? 'bg-primary-50' : ''
                           }`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm">📍</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{result.name}</p>
                  <p className="text-sm text-gray-500 truncate">{result.address}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
