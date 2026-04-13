import { useState } from 'react';
import { Heart, MapPin, Star, Trash2, ExternalLink, Edit2, Check, X } from 'lucide-react';
import type { SavedRestaurant, Category } from '../types';
import { CATEGORIES } from '../types';
import { useStore } from '../store';
import { Modal } from './Modal';

interface RestaurantCardProps {
  restaurant: SavedRestaurant;
  compact?: boolean;
}

export function RestaurantCard({ restaurant, compact = false }: RestaurantCardProps) {
  const { removeFromList, moveToFavorites, updateNotes, updateCategories, setMapView, setActiveTab } = useStore();
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingCategories, setIsEditingCategories] = useState(false);
  const [notes, setNotes] = useState(restaurant.personalNotes || '');
  const [rating, setRating] = useState(restaurant.personalRating || 0);
  const [editedCategories, setEditedCategories] = useState<Category[]>(restaurant.categories);

  const getCategoryInfo = (category: Category) =>
    CATEGORIES.find((c) => c.value === category);

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
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.13)] hover:-translate-y-1 transition-all duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {restaurant.name}
                </h3>
                {restaurant.listType === 'favorite' && (
                  <Heart className="w-4 h-4 text-red-500 fill-current flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {restaurant.address}
              </p>
            </div>

            {/* Personal Rating */}
            {restaurant.listType === 'favorite' && restaurant.personalRating && (
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < restaurant.personalRating!
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="mt-2">
            {isEditingCategories ? (
              <div>
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-400 mb-1.5">Meal Type</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.filter(c => c.group === 'meal').map((cat) => {
                      const active = editedCategories.includes(cat.value);
                      return (
                        <button
                          key={cat.value}
                          onClick={() =>
                            setEditedCategories((prev) =>
                              active ? prev.filter((c) => c !== cat.value) : [...prev, cat.value]
                            )
                          }
                          className="text-xs font-medium px-2.5 py-1 rounded-full border transition-all"
                          style={active ? { backgroundColor: `${cat.color}20`, color: cat.color, borderColor: cat.color } : { borderColor: '#e5e7eb', color: '#6b7280' }}
                        >
                          {cat.emoji} {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1.5">Occasion</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.filter(c => c.group === 'occasion').map((cat) => {
                      const active = editedCategories.includes(cat.value);
                      return (
                        <button
                          key={cat.value}
                          onClick={() =>
                            setEditedCategories((prev) =>
                              active ? prev.filter((c) => c !== cat.value) : [...prev, cat.value]
                            )
                          }
                          className="text-xs font-medium px-2.5 py-1 rounded-full border transition-all"
                          style={active ? { backgroundColor: `${cat.color}20`, color: cat.color, borderColor: cat.color } : { borderColor: '#e5e7eb', color: '#6b7280' }}
                        >
                          {cat.emoji} {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => { setEditedCategories(restaurant.categories); setIsEditingCategories(false); }} className="p-1.5 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                  <button onClick={() => { updateCategories(restaurant.id, editedCategories); setIsEditingCategories(false); }} className="p-1.5 text-primary-500 hover:text-primary-600"><Check className="w-4 h-4" /></button>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 group">
                {(() => {
                  const mealCats = restaurant.categories.filter(cat => CATEGORIES.find(c => c.value === cat)?.group === 'meal');
                  const occasionCats = restaurant.categories.filter(cat => CATEGORIES.find(c => c.value === cat)?.group === 'occasion');
                  return (
                    <>
                      {mealCats.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {mealCats.map((cat) => {
                            const info = getCategoryInfo(cat);
                            return info ? (
                              <span key={cat} className="text-xs font-medium px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: `${info.color}15`, color: info.color }}>
                                {info.emoji} {info.label}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                      {occasionCats.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1 border-t border-gray-100">
                          {occasionCats.map((cat) => {
                            const info = getCategoryInfo(cat);
                            return info ? (
                              <span key={cat} className="text-xs font-medium px-2 py-0.5 rounded-full border"
                                style={{ backgroundColor: `${info.color}10`, color: info.color, borderColor: `${info.color}40` }}>
                                {info.emoji} {info.label}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </>
                  );
                })()}
                <button
                  onClick={() => { setEditedCategories(restaurant.categories); setIsEditingCategories(true); }}
                  className="p-1 text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Edit categories"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          {(restaurant.personalNotes || isEditingNotes) && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              {isEditingNotes ? (
                <div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your notes..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => {
                        setNotes(restaurant.personalNotes || '');
                        setIsEditingNotes(false);
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      className="p-1.5 text-primary-500 hover:text-primary-600"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-gray-600 italic">"{restaurant.personalNotes}"</p>
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Add notes button if no notes */}
          {!restaurant.personalNotes && !isEditingNotes && (
            <button
              onClick={() => setIsEditingNotes(true)}
              className="mt-2 text-xs text-gray-300 hover:text-gray-500 flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Add notes
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleViewOnMap}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium
                         text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MapPin className="w-4 h-4" />
              View
            </button>
            <button
              onClick={openInMaps}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium
                         text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Maps
            </button>
          </div>

          <div className="flex items-center gap-2">
            {restaurant.listType === 'toVisit' && (
              <button
                onClick={() => setShowMoveModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium
                           text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Heart className="w-4 h-4" />
                Visited!
              </button>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove"
            >
              <Trash2 className="w-4 h-4" />
            </button>
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
