import { useEffect, useState } from 'react';
import { useStore } from './store';
import { Header } from './components/Header';
import { MapView } from './components/MapView';
import { RestaurantList } from './components/RestaurantList';
import { CityPickerModal } from './components/CityPickerModal';

function App() {
  const { activeTab, isLoaded, loadRestaurants, defaultCity } = useStore();
  const [showCityPicker, setShowCityPicker] = useState(false);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  // Show city picker once restaurants are loaded and no default city is set
  useEffect(() => {
    if (isLoaded && defaultCity === null) {
      setShowCityPicker(true);
    }
  }, [isLoaded, defaultCity]);

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-primary-500 rounded-full animate-spin" />
          <span className="text-sm">Loading your restaurants…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-b from-slate-300 via-slate-200 to-slate-100 p-2 sm:p-4">
      <div className="h-full max-w-5xl mx-auto rounded-[28px] border border-slate-300/90 bg-slate-50/92 shadow-[0_22px_56px_rgba(15,23,42,0.16)] backdrop-blur-sm overflow-hidden flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col overflow-auto min-h-0">
          {activeTab === 'map' && <MapView onChangeCityClick={() => setShowCityPicker(true)} />}
          {activeTab === 'toVisit' && <RestaurantList listType="toVisit" />}
          {activeTab === 'favorites' && <RestaurantList listType="favorite" />}
        </main>
      </div>
      {showCityPicker && (
        <CityPickerModal
          title={defaultCity ? 'Change your home address' : 'Set your home address'}
          onDone={() => setShowCityPicker(false)}
        />
      )}
    </div>
  );
}

export default App;
