import { useState } from 'react';
import { Heart, MapPin, Star, Trash2, ExternalLink, Edit2, Check, X, CheckCircle2, ChevronDown } from 'lucide-react';
import type { SavedRestaurant, Category } from '../types';
import { CATEGORIES } from '../types';
import { useStore } from '../store';
import { Modal } from './Modal';
import { distanceMiles, formatDistanceMiles } from '../utils/distance';

interface RestaurantCardProps {
  restaurant: SavedRestaurant;
  compact?: boolean;
}

export function RestaurantCard({ restaurant, compact = false }: RestaurantCardProps) {
  const { removeFromList, moveToFavorites, updateNotes, updateCategories, setMapView, setActiveTab, homeCoordinates } = useStore();
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingCategories, setIsEditingCategories] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState(restaurant.personalNotes || '');
  const [rating, setRating] = useState(restaurant.personalRating || 0);
  const [editedCategories, setEditedCategories] = useState<Category[]>(restaurant.categories);

  const getCategoryInfo = (category: Category) =>
    CATEGORIES.find((c) => c.value === category);

  const primaryCategory = restaurant.categories.length > 0
    ? CATEGORIES.find((c) => c.value === restaurant.categories[0])
    : null;

  const photoColor = primaryCategory?.color ?? '#94a3b8';

  const homeDistance = homeCoordinates
    ? formatDistanceMiles(
        distanceMiles(homeCoordinates, {
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
        })
      )
    : null;

  const handleViewOnMap = () => {
    setMapView({
      longitude: restaurant.longitude,
      latitude: restaurant.latitude,
      zoom: 16,
    });
    setActiveTab('map');
  };

  const handleMoveToFavorites = () => {
    moveToFavorites(restaurant.id, rating, notes);
    setShowMoveModal(false);
  };

  const handleSaveNotes = () => {
    updateNotes(restaurant.id, notes);
    setIsEditingNotes(false);
  };

  const openInMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}&query_place_id=${encodeURIComponent(restaurant.name)}`;
    window.open(url, '_blank');
  };

  const boardBackground = `linear-gradient(92deg, ${photoColor}f0 0%, ${photoColor}cf 82%, ${photoColor}bb 100%)`;

  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{restaurant.name}</h3>
            <p className="text-sm text-gray-500 truncate">{restaurant.city}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {restaurant.categories.map((cat) => {
                const info = getCategoryInfo(cat);
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
          </div>
          <button
            onClick={handleViewOnMap}
            className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
            title="View on map"
          >
            <MapPin className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="group/card relative"
      >
        <div className="absolute left-[-30px] top-[24px] h-[2px] w-8 bg-[#8c694d]" />

        <div className="absolute left-[10px] top-[8px] h-4 w-[2px] bg-[#9f754e]" />
        <div className="absolute left-[28px] top-[8px] h-4 w-[2px] bg-[#9f754e]" />
        <div className="absolute left-[8px] top-[5px] h-3.5 w-3.5 rounded-full border border-[#8a6647] bg-[#d0ab83] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]" />
        <div className="absolute left-[26px] top-[5px] h-3.5 w-3.5 rounded-full border border-[#8a6647] bg-[#d0ab83] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]" />

        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="relative w-full text-left rounded-[14px] px-3 py-2 pr-8 border border-[#8b6848]/35 shadow-[0_9px_18px_rgba(0,0,0,0.15)] transition-transform duration-200 hover:-translate-y-[1px]"
          style={{
            background: boardBackground,
            clipPath: 'polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%, 7% 50%)',
          }}
          aria-expanded={isExpanded}
        >
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0 2px, rgba(0,0,0,0.06) 2px 3px)' }} />

          <div className="relative flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-[13px] font-bold text-[#2f2012] leading-tight truncate">{restaurant.name}</h3>
              <p className="text-[10px] text-[#3d2d1d]/80 truncate">
                {homeDistance ? `${homeDistance} from home` : restaurant.city}
              </p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-[#3a2a19] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${isExpanded ? 'max-h-[680px] opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}
        >
          <div className="rounded-[14px] border border-[#e7decb] bg-[#fffdf8] shadow-[0_8px_18px_rgba(15,23,42,0.08)] p-2.5">
            <p className="text-[10px] text-gray-400 flex items-center gap-0.5 truncate mb-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {restaurant.address}
            </p>

            {restaurant.listType === 'favorite' && restaurant.personalRating && (
              <div className="flex items-center gap-0.5 mb-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-2.5 h-2.5 ${
                    i < restaurant.personalRating! ? 'text-yellow-400 fill-current' : 'text-gray-200'
                  }`} />
                ))}
              </div>
            )}

            {/* Categories editor (hidden until edit) */}
            {isEditingCategories && (
              <div className="mb-2 rounded-xl border border-gray-100 bg-gray-50 px-2.5 py-1.5">
                <div>
                  <div className="mb-2">
                    <p className="text-xs font-medium text-gray-400 mb-1">Meal Type</p>
                    <div className="flex flex-wrap gap-1">
                      {CATEGORIES.filter(c => c.group === 'meal').map((cat) => {
                        const active = editedCategories.includes(cat.value);
                        return (
                          <button key={cat.value}
                            onClick={() => setEditedCategories(prev => active ? prev.filter(c => c !== cat.value) : [...prev, cat.value])}
                            className="text-xs font-medium px-2 py-0.5 rounded-full border transition-all"
                            style={active ? { backgroundColor: `${cat.color}20`, color: cat.color, borderColor: cat.color } : { borderColor: '#e5e7eb', color: '#6b7280' }}>
                            {cat.emoji} {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mb-2">
                    <p className="text-xs font-medium text-gray-400 mb-1">Sweets</p>
                    <div className="flex flex-wrap gap-1">
                      {CATEGORIES.filter(c => c.group === 'sweets').map((cat) => {
                        const active = editedCategories.includes(cat.value);
                        return (
                          <button key={cat.value}
                            onClick={() => setEditedCategories(prev => active ? prev.filter(c => c !== cat.value) : [...prev, cat.value])}
                            className="text-xs font-medium px-2 py-0.5 rounded-full border transition-all"
                            style={active ? { backgroundColor: `${cat.color}20`, color: cat.color, borderColor: cat.color } : { borderColor: '#e5e7eb', color: '#6b7280' }}>
                            {cat.emoji} {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mb-2">
                    <p className="text-xs font-medium text-gray-400 mb-1">Drinks</p>
                    <div className="flex flex-wrap gap-1">
                      {CATEGORIES.filter(c => c.group === 'drinks').map((cat) => {
                        const active = editedCategories.includes(cat.value);
                        return (
                          <button key={cat.value}
                            onClick={() => setEditedCategories(prev => active ? prev.filter(c => c !== cat.value) : [...prev, cat.value])}
                            className="text-xs font-medium px-2 py-0.5 rounded-full border transition-all"
                            style={active ? { backgroundColor: `${cat.color}20`, color: cat.color, borderColor: cat.color } : { borderColor: '#e5e7eb', color: '#6b7280' }}>
                            {cat.emoji} {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mb-2">
                    <p className="text-xs font-medium text-gray-400 mb-1">Occasion</p>
                    <div className="flex flex-wrap gap-1">
                      {CATEGORIES.filter(c => c.group === 'occasion').map((cat) => {
                        const active = editedCategories.includes(cat.value);
                        return (
                          <button key={cat.value}
                            onClick={() => setEditedCategories(prev => active ? prev.filter(c => c !== cat.value) : [...prev, cat.value])}
                            className="text-xs font-medium px-2 py-0.5 rounded-full border transition-all"
                            style={active ? { backgroundColor: `${cat.color}20`, color: cat.color, borderColor: cat.color } : { borderColor: '#e5e7eb', color: '#6b7280' }}>
                            {cat.emoji} {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-1">
                    <button onClick={() => { setEditedCategories(restaurant.categories); setIsEditingCategories(false); }} className="p-1.5 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                    <button onClick={() => { updateCategories(restaurant.id, editedCategories); setIsEditingCategories(false); }} className="p-1.5 text-primary-500 hover:text-primary-600"><Check className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {(restaurant.personalNotes || isEditingNotes) && (
              <div className="mb-2 pt-2 border-t border-gray-100">
                {isEditingNotes ? (
                  <div>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)}
                      placeholder="Add your notes..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      rows={3} />
                    <div className="flex justify-end gap-2 mt-1">
                      <button onClick={() => { setNotes(restaurant.personalNotes || ''); setIsEditingNotes(false); }} className="p-1.5 text-gray-400"><X className="w-4 h-4" /></button>
                      <button onClick={handleSaveNotes} className="p-1.5 text-primary-500"><Check className="w-4 h-4" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] text-gray-500 italic">"{restaurant.personalNotes}"</p>
                    <button onClick={() => setIsEditingNotes(true)} className="p-1 text-gray-400 flex-shrink-0"><Edit2 className="w-3 h-3" /></button>
                  </div>
                )}
              </div>
            )}
            {!restaurant.personalNotes && !isEditingNotes && (
              <button onClick={() => setIsEditingNotes(true)}
                className="mb-2 text-xs text-gray-300 hover:text-gray-500 flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                <Edit2 className="w-3 h-3" /> Add note
              </button>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditedCategories(restaurant.categories);
                    setIsEditingCategories(true);
                  }}
                  className="p-1.5 text-gray-500 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
                  title="Edit categories"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button onClick={handleViewOnMap}
                  className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  title="View on map">
                  <MapPin className="w-3 h-3" />
                </button>
                <button onClick={openInMaps}
                  className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  title="Open in Google Maps">
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-1">
                {restaurant.listType === 'toVisit' && (
                  <button onClick={() => setShowMoveModal(true)}
                    className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                    title="Mark as visited">
                    <CheckCircle2 className="w-3 h-3" />
                  </button>
                )}
                <button onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  title="Remove">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Move to Favorites Modal */}
      <Modal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        title="Add to Favorites"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            How was <span className="font-medium text-gray-900">{restaurant.name}</span>?
          </p>

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you love about this place?"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowMoveModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleMoveToFavorites}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg
                         transition-colors flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-current" />
              Add to Favorites
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Remove Restaurant"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to remove{' '}
            <span className="font-medium text-gray-900">{restaurant.name}</span> from your list?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                removeFromList(restaurant.id);
                setShowDeleteConfirm(false);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
