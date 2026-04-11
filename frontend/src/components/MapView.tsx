import { useRef, useCallback, useState, useEffect } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl';
import { MapPin, Plus, Heart } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useStore, useFilteredRestaurants } from '../store';
import { CATEGORIES, type Category, type SavedRestaurant } from '../types';
import { SearchBar } from './SearchBar';
import { FilterBar } from './FilterBar';
import { Modal } from './Modal';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface SelectedPlace {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  categories: Category[];
}

export function MapView() {
  const mapRef = useRef<any>(null);
  const { mapView, setMapView, addToList, savedRestaurants } = useStore();
  const filteredRestaurants = useFilteredRestaurants();

  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [popupRestaurant, setPopupRestaurant] = useState<SavedRestaurant | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  // Check if place is already saved
  const isPlaceSaved = useCallback(
    (id: string) => savedRestaurants.some((r) => r.id === id),
    [savedRestaurants]
  );

  const handleSearchSelect = (result: any) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [result.longitude, result.latitude],
        zoom: 16,
        duration: 1500,
      });
    }

    setSelectedPlace({
      id: result.id,
      name: result.name,
      address: result.address,
      city: result.city || 'Unknown',
      latitude: result.latitude,
      longitude: result.longitude,
      categories: result.categories.length > 0 ? result.categories : ['lunch'],
    });
    setSelectedCategories(result.categories.length > 0 ? result.categories : ['lunch']);
  };

  const handleAddToList = (listType: 'toVisit' | 'favorite') => {
    if (!selectedPlace) return;

    addToList({
      ...selectedPlace,
      categories: selectedCategories.length > 0 ? selectedCategories : ['lunch'],
      listType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setShowAddModal(false);
    setSelectedPlace(null);
    setSelectedCategories([]);
  };

  const toggleCategory = (cat: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const getCategoryColor = (categories: Category[]) => {
    if (categories.length === 0) return '#6b7280';
    const cat = CATEGORIES.find((c) => c.value === categories[0]);
    return cat?.color || '#6b7280';
  };

  // Keyboard shortcut for geolocation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'l' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        // Trigger geolocation
        const geolocateButton = document.querySelector('.mapboxgl-ctrl-geolocate') as HTMLButtonElement;
        geolocateButton?.click();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <div className="text-4xl mb-4">🗺️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Map Configuration Needed</h2>
          <p className="text-gray-600">
            Please add your Mapbox access token to the <code className="bg-gray-100 px-1 rounded">.env</code> file:
          </p>
          <code className="block bg-gray-100 p-3 rounded-lg mt-3 text-sm text-left">
            VITE_MAPBOX_TOKEN=your_token_here
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Search & Filters */}
      <div className="p-4 bg-white border-b border-gray-200">
        <SearchBar onSelectResult={handleSearchSelect} />
      </div>
      <FilterBar />

      {/* Map */}
      <div className="flex-1 relative">
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={mapView}
          onMove={(evt) => setMapView(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/light-v11"
          style={{ width: '100%', height: '100%' }}
          attributionControl={false}
        >
          <NavigationControl position="bottom-right" />
          <GeolocateControl
            position="bottom-right"
            trackUserLocation
            showUserHeading
            onGeolocate={(e) => {
              setMapView({
                longitude: e.coords.longitude,
                latitude: e.coords.latitude,
                zoom: 14,
              });
            }}
          />

          {/* Saved Restaurant Markers */}
          {filteredRestaurants.map((restaurant) => (
            <Marker
              key={restaurant.id}
              longitude={restaurant.longitude}
              latitude={restaurant.latitude}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setPopupRestaurant(restaurant);
                setSelectedPlace(null);
              }}
            >
              <div
                className={`
                  p-2 rounded-full cursor-pointer transform hover:scale-110 transition-transform
                  shadow-lg border-2 border-white
                  ${restaurant.listType === 'favorite' ? 'ring-2 ring-red-400 ring-offset-1' : ''}
                `}
                style={{ backgroundColor: getCategoryColor(restaurant.categories) }}
              >
                {restaurant.listType === 'favorite' ? (
                  <Heart className="w-4 h-4 text-white fill-current" />
                ) : (
                  <MapPin className="w-4 h-4 text-white" />
                )}
              </div>
            </Marker>
          ))}

          {/* Selected Place Marker */}
          {selectedPlace && !isPlaceSaved(selectedPlace.id) && (
            <Marker
              longitude={selectedPlace.longitude}
              latitude={selectedPlace.latitude}
              anchor="bottom"
            >
              <div
                className="p-2 rounded-full bg-primary-500 shadow-lg border-2 border-white
                           animate-bounce cursor-pointer"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="w-5 h-5 text-white" />
              </div>
            </Marker>
          )}

          {/* Restaurant Popup */}
          {popupRestaurant && (
            <Popup
              longitude={popupRestaurant.longitude}
              latitude={popupRestaurant.latitude}
              anchor="bottom"
              onClose={() => setPopupRestaurant(null)}
              closeOnClick={false}
              offset={25}
            >
              <div className="p-4 min-w-[220px]">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{popupRestaurant.name}</h3>
                  {popupRestaurant.listType === 'favorite' && (
                    <Heart className="w-4 h-4 text-red-500 fill-current flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-3">{popupRestaurant.city}</p>
                <div className="flex flex-wrap gap-1">
                  {popupRestaurant.categories.map((cat) => {
                    const info = CATEGORIES.find((c) => c.value === cat);
                    return info ? (
                      <span
                        key={cat}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${info.color}20`, color: info.color }}
                      >
                        {info.emoji} {info.label}
                      </span>
                    ) : null;
                  })}
                </div>
                {popupRestaurant.personalNotes && (
                  <p className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600 italic">
                    "{popupRestaurant.personalNotes}"
                  </p>
                )}
              </div>
            </Popup>
          )}
        </Map>

        {/* Selected Place Card */}
        {selectedPlace && !isPlaceSaved(selectedPlace.id) && (
          <div className="absolute bottom-6 left-4 right-4 mx-auto max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedPlace.name}</h3>
                  <p className="text-sm text-gray-500">{selectedPlace.address}</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex-shrink-0 bg-primary-500 hover:bg-primary-600 text-white
                             px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2
                             transition-colors shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add to List Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Save Restaurant"
        size="md"
      >
        {selectedPlace && (
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{selectedPlace.name}</h3>
              <p className="text-gray-500">{selectedPlace.address}</p>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.value);
                  return (
                    <button
                      key={cat.value}
                      onClick={() => toggleCategory(cat.value)}
                      className={`
                        flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium
                        transition-all duration-200 border
                        ${
                          isSelected
                            ? 'text-white border-transparent shadow-md'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }
                      `}
                      style={isSelected ? { backgroundColor: cat.color } : undefined}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleAddToList('toVisit')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3
                           bg-primary-500 hover:bg-primary-600 text-white rounded-xl
                           font-medium transition-colors shadow-md"
              >
                <MapPin className="w-5 h-5" />
                Add to Visit List
              </button>
              <button
                onClick={() => handleAddToList('favorite')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3
                           bg-red-500 hover:bg-red-600 text-white rounded-xl
                           font-medium transition-colors shadow-md"
              >
                <Heart className="w-5 h-5" />
                Add to Favorites
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
