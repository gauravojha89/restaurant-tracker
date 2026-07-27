import { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { geocodeAddress } from '../hooks/useAzureMapsSearch';
import { useStore } from '../store';

interface CityPickerModalProps {
  onDone: () => void;
  title?: string;
}

export function CityPickerModal({ onDone, title = 'Set your home address' }: CityPickerModalProps) {
  const { setDefaultCity, setMapView } = useStore();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    const trimmed = input.trim();
    if (!trimmed) { setError('Please enter your home address.'); return; }
    setLoading(true);
    setError('');
    const result = await geocodeAddress(trimmed);
    setLoading(false);
    if (!result) { setError('Could not find that address. Try adding street + city.'); return; }

    // Keep city filters working while using precise home coordinates for distance.
    setDefaultCity(result.city || result.label, { latitude: result.latitude, longitude: result.longitude });
    setMapView({ latitude: result.latitude, longitude: result.longitude, zoom: 12 });
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="glass-surface rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="text-4xl mb-3">📍</div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>
        <p className="text-sm text-gray-500 mb-6">
          We will use this once to calculate distance from home.
        </p>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          placeholder="e.g. 123 Main St, Atlanta"
          autoFocus
          className="w-full px-4 py-3 glass-pill border-white/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
        />
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-medium py-3 rounded-xl transition-colors mt-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
          {loading ? 'Finding…' : 'Set home address'}
        </button>
      </div>
    </div>
  );
}
