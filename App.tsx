
import React, { useState, useEffect } from 'react';
import { BookingEngine } from './components/BookingEngine';
import { AdminDashboard } from './components/AdminDashboard';
import { Settings, Vehicle, Booking } from './types';
import { INITIAL_SETTINGS, INITIAL_VEHICLES } from './constants';
import { ShieldCheck, Car } from 'lucide-react';

const App: React.FC = () => {
  // Detecta se estamos explicitamente no modo admin via URL (?admin=true ou #admin)
  const queryParams = new URLSearchParams(window.location.search);
  const isUrlAdmin = queryParams.get('admin') === 'true' || window.location.hash === '#admin';
  
  // Estado para alternar entre visualizações (apenas visível se permitido)
  const [isAdmin, setIsAdmin] = useState(isUrlAdmin);
  
  // Permite mostrar o botão de alternância apenas se estivermos no domínio original 
  // ou se o parâmetro admin estiver presente.
  const showAdminToggle = isUrlAdmin || !window.frameElement;

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('transfer_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('transfer_vehicles');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('transfer_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('transfer_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('transfer_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('transfer_bookings', JSON.stringify(bookings));
  }, [bookings]);

  return (
    <div className="min-h-screen bg-white relative">
      {/* Botão Admin só aparece para o proprietário, nunca dentro do Iframe do cliente */}
      {showAdminToggle && (
        <div className="fixed top-4 left-4 z-[100]">
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-2xl hover:bg-black transition-all text-xs font-bold border border-white/10"
          >
            {isAdmin ? (
              <><Car className="w-3.5 h-3.5" /> Ver Motor (Preview)</>
            ) : (
              <><ShieldCheck className="w-3.5 h-3.5" /> Dashboard Gestão</>
            )}
          </button>
        </div>
      )}

      <main>
        {isAdmin ? (
          <AdminDashboard
            settings={settings}
            onSettingsUpdate={setSettings}
            vehicles={vehicles}
            onVehiclesUpdate={setVehicles}
            bookings={bookings}
          />
        ) : (
          <div className="animate-in fade-in duration-700">
            <BookingEngine
              settings={settings}
              vehicles={vehicles}
              isMapsLoaded={true}
              onNewBooking={(b) => setBookings([b, ...bookings])}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
