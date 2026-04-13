import { useRef, useState, useEffect, useCallback } from 'react';
import * as atlas from 'azure-maps-control';
import 'azure-maps-control/dist/atlas.min.css';
import { Plus, Heart, MapPin } from 'lucide-react';
import { useStore, useFilteredRestaurants } from '../store';
import { CATEGORIES, type Category, type SavedRestaurant } from '../types';
import { SearchBar } from './SearchBar';
import { FilterBar } from './FilterBar';
import { Modal } from './Modal';

const AZURE_MAPS_KEY = import.meta.env.VITE_AZURE_MAPS_KEY || '';

interface SelectedPlace {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  categories: Category[];
}

// ─────────────────────────────────────────────
// Helper: category colour
// ─────────────────────────────────────────────
function getCategoryColor(categories: Category[]): string {
  if (!categories.length) return '#6b7280';
  const cat = CATEGORIES.find((c) => c.value === categories[0]);
  return cat?.color ?? '#6b7280';
}

// ─────────────────────────────────────────────
// Helper: marker HTML string
// ─────────────────────────────────────────────
function markerHtml(color: string, isFavorite: boolean, isNew = false): string {
  const icon = isFavorite ? '❤️' : isNew ? '＋' : '📍';
  const ring = isFavorite
    ? `outline: 2px solid #fca5a5; outline-offset: 2px;`
    : isNew
    ? `animation: pulse 1.4s ease-in-out infinite;`
    : '';
  return `<div style="
    width:36px;height:36px;border-radius:50%;
    background:${color};border:3px solid white;
    box-shadow:0 4px 14px rgba(0,0,0,.25);
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;font-size:15px;${ring}
  ">${icon}</div>`;
}

// ─────────────────────────────────────────────
// Helper: popup HTML for a saved restaurant
// ─────────────────────────────────────────────
function restaurantPopupHtml(r: SavedRestaurant): string {
  const chips = r.categories.map((cat) => {
    const info = CATEGORIES.find((c) => c.value === cat);
    return info
      ? `<span style="font-size:11px;padding:2px 8px;border-radius:20px;
          background:${info.color}20;color:${info.color};
          font-weight:600;">${info.emoji} ${info.label}</span>`
      : '';
  }).join('');

  const notes = r.personalNotes
    ? `<p style="font-size:12px;color:#8e8e93;font-style:italic;
        margin:10px 0 0;padding-top:10px;border-top:1px solid #3a3a3c;">
        "${r.personalNotes}"</p>`
    : '';

  return `
    <div style="padding:16px;min-width:220px;font-family:system-ui,sans-serif;box-sizing:border-box;background:#1c1c1e;border-radius:12px;">
      <div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:6px;">
        <strong style="font-size:15px;color:#f0f0f0;flex:1;">${r.name}</strong>
        ${r.listType === 'favorite' ? '<span style="flex-shrink:0;">❤️</span>' : ''}
      </div>
      <p style="font-size:12px;color:#8e8e93;margin:0 0 10px;">📍 ${r.city}</p>
      <div style="display:flex;flex-wrap:wrap;gap:4px;">${chips}</div>
      ${notes}
    </div>`;
}

// ─────────────────────────────────────────────
// Map component
// ─────────────────────────────────────────────
export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<atlas.Map | null>(null);
  const popupRef = useRef<atlas.Popup | null>(null);
  const savedMarkersRef = useRef<Map<string, atlas.HtmlMarker>>(new Map());
  const selectedMarkerRef = useRef<atlas.HtmlMarker | null>(null);
  const isProgrammaticMove = useRef(false);
  const lastSyncedView = useRef({ longitude: 0, latitude: 0, zoom: 0 });
  const markerClickedRef = useRef(false); // prevent map-click from firing after marker click

  const { mapView, setMapView, addToList, savedRestaurants } = useStore();
  const filteredRestaurants = useFilteredRestaurants();

  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [mapReady, setMapReady] = useState(false);

  const isAlreadySaved = useCallback(
    (id: string) => savedRestaurants.some((r) => r.id === id),
    [savedRestaurants]
  );

  // ── 1. Initialise map once ───────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current || !AZURE_MAPS_KEY) return;

    const map = new atlas.Map(containerRef.current, {
      center: [mapView.longitude, mapView.latitude],
      zoom: mapView.zoom,
      language: 'en-US',
      authOptions: {
        authType: atlas.AuthenticationType.subscriptionKey,
        subscriptionKey: AZURE_MAPS_KEY,
      },
      style: 'grayscale_dark',
      showFeedbackLink: false,
      showLogo: false,
    });

    map.controls.add(
      [new atlas.control.ZoomControl({ zoomDelta: 1, style: atlas.ControlStyle.dark })],
      { position: atlas.ControlPosition.BottomRight }
    );

    const popup = new atlas.Popup({ closeButton: true, pixelOffset: [0, -10] });
    map.popups.add(popup);
    popupRef.current = popup;

    map.events.add('ready', () => {
      lastSyncedView.current = {
        longitude: mapView.longitude,
        latitude: mapView.latitude,
        zoom: mapView.zoom,
      };
      setMapReady(true);
    });

    map.events.add('moveend', () => {
      if (isProgrammaticMove.current) {
        isProgrammaticMove.current = false;
        return;
      }
      const cam = map.getCamera();
      const center = cam.center as [number, number];
      const zoom = cam.zoom as number;
      lastSyncedView.current = { longitude: center[0], latitude: center[1], zoom };
      setMapView({ longitude: center[0], latitude: center[1], zoom });
    });

    // Close popup when clicking blank map (skip if a marker was just clicked)
    map.events.add('click', () => {
      if (markerClickedRef.current) {
        markerClickedRef.current = false;
        return;
      }
      popup.close();
      setSelectedPlace(null);
    });

    mapRef.current = map;

    const markersMap = savedMarkersRef.current;
    return () => {
      map.dispose();
      mapRef.current = null;
      popupRef.current = null;
      markersMap.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — init once

  // ── 2. Fly to location when store view changes externally ──
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const { longitude, latitude, zoom } = mapView;
    const prev = lastSyncedView.current;
    const diff = Math.abs(longitude - prev.longitude) + Math.abs(latitude - prev.latitude);
    if (diff > 0.0002 || Math.abs(zoom - prev.zoom) > 0.5) {
      isProgrammaticMove.current = true;
      lastSyncedView.current = { longitude, latitude, zoom };
      mapRef.current.setCamera({ center: [longitude, latitude], zoom, type: 'fly', duration: 1200 });
    }
  }, [mapView, mapReady]);

  // ── 3. Sync saved restaurant markers ────────
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const map = mapRef.current;
    const current = savedMarkersRef.current;

    // Remove markers no longer in filteredRestaurants
    const filteredIds = new Set(filteredRestaurants.map((r) => r.id));
    for (const [id, marker] of current) {
      if (!filteredIds.has(id)) {
        map.markers.remove(marker);
        current.delete(id);
      }
    }

    // Add / update markers
    for (const restaurant of filteredRestaurants) {
      const existing = current.get(restaurant.id);
      if (existing) {
        // Update HTML in case listType changed
        existing.setOptions({ htmlContent: markerHtml(getCategoryColor(restaurant.categories), restaurant.listType === 'favorite') });
      } else {
        const marker = new atlas.HtmlMarker({
          position: [restaurant.longitude, restaurant.latitude],
          htmlContent: markerHtml(getCategoryColor(restaurant.categories), restaurant.listType === 'favorite'),
          anchor: 'bottom',
        });

        map.events.add('click', marker, () => {
          markerClickedRef.current = true;
          popupRef.current?.setOptions({
            position: [restaurant.longitude, restaurant.latitude],
            content: restaurantPopupHtml(restaurant),
          });
          popupRef.current?.open(map);
          setSelectedPlace(null);
        });

        map.markers.add(marker);
        current.set(restaurant.id, marker);
      }
    }
  }, [filteredRestaurants, mapReady]);

  // ── 4. Handle selected place (search result) marker ──
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const map = mapRef.current;

    // Remove previous temp marker
    if (selectedMarkerRef.current) {
      map.markers.remove(selectedMarkerRef.current);
      selectedMarkerRef.current = null;
    }

    if (selectedPlace && !isAlreadySaved(selectedPlace.id)) {
      const marker = new atlas.HtmlMarker({
        position: [selectedPlace.longitude, selectedPlace.latitude],
        htmlContent: markerHtml('#0ea5e9', false, true),
        anchor: 'bottom',
      });
      map.events.add('click', marker, () => {
        markerClickedRef.current = true;
        setShowAddModal(true);
      });
      map.markers.add(marker);
      selectedMarkerRef.current = marker;
    }
  }, [selectedPlace, isAlreadySaved, mapReady]);

  // ── Search result handler ────────────────────
  function handleSearchSelect(result: SelectedPlace) {
    if (!mapRef.current) return;
    setSelectedPlace(result);
    setSelectedCategories(result.categories);
    isProgrammaticMove.current = true;
    lastSyncedView.current = { longitude: result.longitude, latitude: result.latitude, zoom: 16 };
    mapRef.current.setCamera({
      center: [result.longitude, result.latitude],
      zoom: 16,
      type: 'fly',
      duration: 1200,
    });
    popupRef.current?.close();
  }

  function handleAddToList(listType: 'toVisit' | 'favorite') {
    if (!selectedPlace) return;
    addToList({
      ...selectedPlace,
      categories: selectedCategories.length > 0 ? selectedCategories : ['dinner'],
      listType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setShowAddModal(false);
    setSelectedPlace(null);
    setSelectedCategories([]);
  }

  function toggleCategory(cat: Category) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  // ── No key configured state ──────────────────
  if (!AZURE_MAPS_KEY) {
    return (
        <div className="flex-1 flex items-center justify-center bg-[#111111]">
        <div className="text-center p-8 bg-[#1c1c1e] rounded-2xl shadow-lg max-w-md">
          <div className="text-4xl mb-4">🗺️</div>
          <h2 className="text-xl font-semibold text-white mb-2">Azure Maps Key Needed</h2>
          <p className="text-gray-400 mb-3">Add your Azure Maps key to the <code className="bg-[#2c2c2e] px-1 rounded text-gray-300">.env</code> file:</p>
          <code className="block bg-[#2c2c2e] p-3 rounded-lg text-sm text-left text-gray-300">VITE_AZURE_MAPS_KEY=your_key_here</code>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Search bar */}
      <div className="p-4 bg-[#1c1c1e] border-b border-[#3a3a3c]">
        <SearchBar onSelectResult={handleSearchSelect} />
      </div>
      <FilterBar />

      {/* Map container — capped height on desktop, flex on mobile */}
      <div className="flex-1 md:flex-none md:h-[52vh] relative">
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

        {/* CSS for pulse animation */}
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 4px 14px rgba(0,0,0,.25); }
            50% { transform: scale(1.15); box-shadow: 0 6px 20px rgba(14,165,233,.5); }
          }
        `}</style>

        {/* Selected place card */}
        {selectedPlace && !isAlreadySaved(selectedPlace.id) && (
          <div className="absolute bottom-6 left-4 right-4 mx-auto max-w-md pointer-events-none">
            <div className="bg-[#1c1c1e] rounded-2xl shadow-2xl p-4 border border-[#3a3a3c] pointer-events-auto">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-white truncate">{selectedPlace.name}</h3>
                  <p className="text-sm text-gray-400 truncate">{selectedPlace.address}</p>
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

      {/* Add to list modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Save Restaurant" size="md">
        {selectedPlace && (
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold text-white text-lg">{selectedPlace.name}</h3>
              <p className="text-gray-400 text-sm">{selectedPlace.address}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Meal Type</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {CATEGORIES.filter(c => c.group === 'meal').map((cat) => {
                  const isSelected = selectedCategories.includes(cat.value);
                  return (
                    <button
                      key={cat.value}
                      onClick={() => toggleCategory(cat.value)}
                      className={`
                        flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium
                        transition-all duration-200 border
                        ${isSelected ? 'text-white border-transparent shadow-md' : 'bg-[#2c2c2e] border-[#3a3a3c] text-gray-300 hover:bg-[#3a3a3c]'}
                      `}
                      style={isSelected ? { backgroundColor: cat.color } : undefined}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Drinks</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {CATEGORIES.filter(c => c.group === 'drinks').map((cat) => {
                  const isSelected = selectedCategories.includes(cat.value);
                  return (
                    <button
                      key={cat.value}
                      onClick={() => toggleCategory(cat.value)}
                      className={`
                        flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium
                        transition-all duration-200 border
                        ${isSelected ? 'text-white border-transparent shadow-md' : 'bg-[#2c2c2e] border-[#3a3a3c] text-gray-300 hover:bg-[#3a3a3c]'}
                      `}
                      style={isSelected ? { backgroundColor: cat.color } : undefined}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Occasion</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.filter(c => c.group === 'occasion').map((cat) => {
                  const isSelected = selectedCategories.includes(cat.value);
                  return (
                    <button
                      key={cat.value}
                      onClick={() => toggleCategory(cat.value)}
                      className={`
                        flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium
                        transition-all duration-200 border
                        ${isSelected ? 'text-white border-transparent shadow-md' : 'bg-[#2c2c2e] border-[#3a3a3c] text-gray-300 hover:bg-[#3a3a3c]'}
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

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleAddToList('toVisit')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3
                           bg-primary-500 hover:bg-primary-600 text-white rounded-xl
                           font-medium transition-colors shadow-md"
              >
                <MapPin className="w-5 h-5" />
                To Visit List
              </button>
              <button
                onClick={() => handleAddToList('favorite')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3
                           bg-red-500 hover:bg-red-600 text-white rounded-xl
                           font-medium transition-colors shadow-md"
              >
                <Heart className="w-5 h-5" />
                Favorites
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
