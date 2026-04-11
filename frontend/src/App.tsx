import { useStore } from './store';
import { Header } from './components/Header';
import { MapView } from './components/MapView';
import { RestaurantList } from './components/RestaurantList';

function App() {
  const { activeTab } = useStore();

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'map' && <MapView />}
        {activeTab === 'toVisit' && <RestaurantList listType="toVisit" />}
        {activeTab === 'favorites' && <RestaurantList listType="favorite" />}
      </main>
    </div>
  );
}

export default App;
