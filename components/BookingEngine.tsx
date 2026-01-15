
import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, MapPin, Users, ChevronRight, Check, CreditCard, Banknote, Navigation, Info, AlertCircle, Loader2, Building2, PlaneTakeoff, AlertTriangle, ExternalLink, ShieldAlert, CheckCircle2, ArrowRight, Share2, Printer, Car, X, Map as MapIcon, Maximize2, Luggage } from 'lucide-react';
import { Settings, Vehicle, Booking, PaymentMethod } from '../types';

// Declare Leaflet global variable for TypeScript
declare var L: any;

interface LocationData {
  name: string;
  coords: [number, number] | null; // [lng, lat]
}

interface Props {
  settings: Settings;
  vehicles: Vehicle[];
  isMapsLoaded: boolean;
  onNewBooking: (booking: Booking) => void;
}

// Map Component using Leaflet
const RouteMap: React.FC<{ 
  pickup: LocationData; 
  dest: LocationData; 
  onLocationSelect: (coords: [number, number], name: string, type: 'pickup' | 'dropoff') => void 
}> = ({ pickup, dest, onLocationSelect }) => {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const routeLayer = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const [isReverseLoading, setIsReverseLoading] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([38.7223, -9.1393], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Handle map click for manual selection
    mapRef.current.on('click', async (e: any) => {
      const { lat, lng } = e.latlng;
      setIsReverseLoading(true);

      try {
        // Reverse geocoding using Photon
        const resp = await fetch(`https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`);
        const data = await resp.json();
        const feature = data.features?.[0];
        const name = feature 
          ? [feature.properties.name, feature.properties.city, feature.properties.country].filter(Boolean).join(', ')
          : `Localização (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

        // Create a custom popup content
        const popupContent = document.createElement('div');
        popupContent.className = 'p-2 space-y-2';
        popupContent.innerHTML = `
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">${name}</div>
          <div class="flex flex-col gap-1">
            <button id="set-pickup-btn" class="w-full text-left px-3 py-2 bg-emerald-500 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-600 transition-colors uppercase tracking-wider">Definir Pick-Up</button>
            <button id="set-dropoff-btn" class="w-full text-left px-3 py-2 bg-slate-800 text-white text-[10px] font-bold rounded-lg hover:bg-slate-900 transition-colors uppercase tracking-wider">Definir Drop-Off</button>
          </div>
        `;

        const popup = L.popup()
          .setLatLng(e.latlng)
          .setContent(popupContent)
          .openOn(mapRef.current);

        // Add event listeners to buttons inside popup
        setTimeout(() => {
          document.getElementById('set-pickup-btn')?.addEventListener('click', () => {
            onLocationSelect([lng, lat], name, 'pickup');
            mapRef.current.closePopup();
          });
          document.getElementById('set-dropoff-btn')?.addEventListener('click', () => {
            onLocationSelect([lng, lat], name, 'dropoff');
            mapRef.current.closePopup();
          });
        }, 0);

      } catch (err) {
        console.error("Reverse geocoding error:", err);
      } finally {
        setIsReverseLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing
    markers.current.forEach(m => m.remove());
    markers.current = [];
    if (routeLayer.current) routeLayer.current.remove();

    if (pickup.coords && dest.coords) {
      const p1 = L.latLng(pickup.coords[1], pickup.coords[0]);
      const p2 = L.latLng(dest.coords[1], dest.coords[0]);

      const m1 = L.marker(p1, {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: #10b981; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      }).addTo(mapRef.current);

      const m2 = L.marker(p2, {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: #ef4444; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      }).addTo(mapRef.current);

      markers.current = [m1, m2];

      fetch(`https://router.project-osrm.org/route/v1/driving/${pickup.coords[0]},${pickup.coords[1]};${dest.coords[0]},${dest.coords[1]}?overview=full&geometries=geojson`)
        .then(res => res.json())
        .then(data => {
          if (data.routes && data.routes[0]) {
            const coordinates = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
            routeLayer.current = L.polyline(coordinates, { color: '#334155', weight: 4, opacity: 0.6, dashArray: '5, 10' }).addTo(mapRef.current!);
            mapRef.current!.fitBounds(routeLayer.current.getBounds(), { padding: [60, 60] });
          }
        });
    } else if (pickup.coords) {
      const p = L.latLng(pickup.coords[1], pickup.coords[0]);
      mapRef.current.setView(p, 14);
      const m = L.marker(p, {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: #10b981; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      }).addTo(mapRef.current);
      markers.current = [m];
    }
  }, [pickup.coords, dest.coords]);

  const handleRecenter = () => {
    if (routeLayer.current) {
      mapRef.current.fitBounds(routeLayer.current.getBounds(), { padding: [60, 60] });
    } else if (pickup.coords) {
       mapRef.current.setView([pickup.coords[1], pickup.coords[0]], 14);
    }
  };

  return (
    <div className="relative w-full h-full group">
      <div ref={containerRef} className="w-full h-full bg-slate-50 min-h-[400px]" />
      
      {/* Recenter Button */}
      {(pickup.coords || dest.coords) && (
        <button 
          onClick={handleRecenter}
          className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md p-2 rounded-lg border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100"
          title="Recentrar Mapa"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      )}

      {/* Map Hint */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <Info className="w-3 h-3 text-slate-400" />
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Clique no mapa para definir locais</span>
        </div>
      </div>

      {/* Loading Overlay */}
      {isReverseLoading && (
        <div className="absolute inset-0 z-30 bg-white/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        </div>
      )}
    </div>
  );
};

const LocationAutocomplete: React.FC<{
  placeholder: string;
  value: string;
  onChange: (data: LocationData) => void;
  icon: React.ReactNode;
}> = ({ placeholder, value, onChange, icon }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (val: string) => {
    onChange({ name: val, coords: null });
    if (val.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&limit=5`);
      const data = await resp.json();
      setSuggestions(data.features || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Autocomplete error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (feature: any) => {
    const name = [feature.properties.name, feature.properties.city, feature.properties.country].filter(Boolean).join(', ');
    onChange({ name, coords: feature.geometry.coordinates });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl focus-within:border-slate-400 transition-colors shadow-sm">
        <div className="text-slate-400 shrink-0">{icon}</div>
        <input
          placeholder={placeholder}
          className="w-full text-slate-700 outline-none placeholder:text-slate-300 font-medium text-sm md:text-base bg-transparent"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
        />
        {loading && <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-[100] left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 max-h-[250px] overflow-y-auto">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(s)}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-start gap-3 transition-colors border-b border-slate-50 last:border-0"
            >
              <MapPin className="w-4 h-4 text-slate-300 mt-1 shrink-0" />
              <div className="flex-1">
                <div className="text-xs md:text-sm font-semibold text-slate-800 truncate">{s.properties.name}</div>
                <div className="text-[10px] md:text-[11px] text-slate-400 truncate">
                  {[s.properties.city, s.properties.country].filter(Boolean).join(', ')}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const BookingEngine: React.FC<Props> = ({ settings, vehicles, onNewBooking }) => {
  const [step, setStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastBookingId, setLastBookingId] = useState<string | null>(null);
  const [routeData, setRouteData] = useState<{ distance: number; duration: string }>({
    distance: 0,
    duration: '0m'
  });

  const [pickup, setPickup] = useState<LocationData>({ name: '', coords: null });
  const [dest, setDest] = useState<LocationData>({ name: '', coords: null });

  const [formData, setFormData] = useState({
    pickupDate: '',
    pickupTime: '',
    adults: 1,
    children: 0,
    selectedVehicleId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: '',
    flightDateTime: '',
    paymentMethod: PaymentMethod.CASH
  });

  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pickup.coords && dest.coords) {
      setIsCalculating(true);
      fetch(`https://router.project-osrm.org/route/v1/driving/${pickup.coords[0]},${pickup.coords[1]};${dest.coords[0]},${dest.coords[1]}?overview=false`)
        .then(res => res.json())
        .then(data => {
          if (data.routes && data.routes[0]) {
            const route = data.routes[0];
            setRouteData({
              distance: Math.round(route.distance / 1000),
              duration: `${Math.round(route.duration / 60)} mins`
            });
          }
        })
        .finally(() => setIsCalculating(false));
    }
  }, [pickup.coords, dest.coords]);

  const selectedVehicle = vehicles.find(v => v.id === formData.selectedVehicleId);
  const calculatePrice = (vehicle: Vehicle) => vehicle.basePrice + (routeData.distance * vehicle.pricePerKm);

  const steps = ['Itinerário', 'Veículo', 'Contactos', 'Confirmação'];

  const handleLocationSelect = (coords: [number, number], name: string, type: 'pickup' | 'dropoff') => {
    if (type === 'pickup') {
      setPickup({ coords, name });
    } else {
      setDest({ coords, name });
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else {
      const bookingId = Math.random().toString(36).substr(2, 6).toUpperCase();
      setLastBookingId(bookingId);
      onNewBooking({
        id: bookingId,
        ...formData,
        pickupLocation: pickup.name,
        destination: dest.name,
        passengers: { adults: formData.adults, children: formData.children },
        vehicleId: formData.selectedVehicleId,
        totalDistance: routeData.distance,
        totalDuration: 0,
        totalPrice: selectedVehicle ? calculatePrice(selectedVehicle) : 0,
        status: 'Pending',
        customer: { name: formData.customerName, email: formData.customerEmail, phone: formData.customerPhone, notes: formData.notes },
        createdAt: new Date().toISOString()
      } as any);
      setStep(5);
    }
  };

  const handleReset = () => {
    setFormData({
      pickupDate: '',
      pickupTime: '',
      adults: 1,
      children: 0,
      selectedVehicleId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      notes: '',
      flightDateTime: '',
      paymentMethod: PaymentMethod.CASH
    });
    setPickup({ name: '', coords: null });
    setDest({ name: '', coords: null });
    setStep(1);
    setLastBookingId(null);
  };

  const totalPassengers = formData.adults + formData.children;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
      {/* Progress Tracker - Neutral Style */}
      {step < 5 && (
        <div className="mb-10 flex justify-center items-center gap-2 md:gap-4 px-4 overflow-x-auto no-scrollbar">
          {steps.map((label, idx) => (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-2 shrink-0">
                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[11px] md:text-xs font-bold transition-all border ${
                  step > idx + 1 ? 'bg-slate-900 border-slate-900 text-white' :
                  step === idx + 1 ? 'bg-slate-100 border-slate-400 text-slate-900' : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {step > idx + 1 ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${step === idx + 1 ? 'text-slate-900' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
              {idx < steps.length - 1 && <div className="w-4 md:w-8 h-[1px] bg-slate-200" />}
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden transition-all duration-300">
        {step === 1 && (
          <div className="flex flex-col lg:flex-row min-h-[500px]">
            <div className="flex-1 p-6 md:p-10 lg:border-r border-slate-100 flex flex-col">
              <div className="mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-1">Agende o seu Transfer</h2>
                <p className="text-xs md:text-sm text-slate-500">Introduza os detalhes da sua viagem.</p>
              </div>

              <div className="space-y-6 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5" onClick={() => dateInputRef.current?.showPicker()}>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Data</label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <input ref={dateInputRef} type="date" className="bg-transparent outline-none w-full text-sm font-semibold text-slate-700 cursor-pointer" value={formData.pickupDate} onChange={e => setFormData({...formData, pickupDate: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-1.5" onClick={() => timeInputRef.current?.showPicker()}>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Hora</label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <input ref={timeInputRef} type="time" className="bg-transparent outline-none w-full text-sm font-semibold text-slate-700 cursor-pointer" value={formData.pickupTime} onChange={e => setFormData({...formData, pickupTime: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Pick-Up</label>
                    <LocationAutocomplete placeholder="De onde partimos?" value={pickup.name} onChange={setPickup} icon={<MapPin className="w-4 h-4" />} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Drop-Off</label>
                    <LocationAutocomplete placeholder="Para onde vamos?" value={dest.name} onChange={setDest} icon={<MapPin className="w-4 h-4" />} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">N.º Voo (Opcional)</label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl">
                      <PlaneTakeoff className="w-4 h-4 text-slate-400" />
                      <input type="text" placeholder="TP123" className="bg-transparent outline-none w-full text-sm font-semibold text-slate-700 uppercase" value={formData.flightDateTime} onChange={e => setFormData({...formData, flightDateTime: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Passageiros</label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl">
                      <Users className="w-4 h-4 text-slate-400" />
                      <select className="bg-transparent outline-none w-full text-sm font-semibold text-slate-700" value={formData.adults} onChange={e => setFormData({...formData, adults: parseInt(e.target.value)})}>
                        {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(n => <option key={n} value={n}>{n} PAX</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleNext} 
                disabled={isCalculating || !pickup.coords || !dest.coords || !formData.pickupDate || !formData.pickupTime}
                className="w-full mt-10 bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                {isCalculating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ESCOLHER VEÍCULO'}
              </button>
            </div>

            <div className="lg:flex-1 relative bg-slate-50 border-t lg:border-t-0 border-slate-100">
               <RouteMap pickup={pickup} dest={dest} onLocationSelect={handleLocationSelect} />
               {routeData.distance > 0 && (
                 <div className="absolute bottom-6 left-6 right-6 z-20">
                   <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-xl flex justify-between items-center animate-in slide-in-from-bottom-4 duration-500">
                     <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Percurso Estimado</p>
                       <p className="text-lg font-bold text-slate-900">{routeData.distance} km</p>
                     </div>
                     <div className="text-right">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Duração</p>
                       <p className="text-lg font-bold text-slate-900">{routeData.duration}</p>
                     </div>
                   </div>
                 </div>
               )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-6 md:p-10 animate-in fade-in slide-in-from-right-4">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Selecione a sua Frota</h2>
              <p className="text-sm text-slate-500">Exibindo veículos disponíveis para {totalPassengers} passageiros.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map(v => {
                const isAvailable = totalPassengers >= (v.minCapacity || 1) && totalPassengers <= v.capacity;
                
                return (
                  <div 
                    key={v.id} 
                    onClick={() => isAvailable && setFormData({...formData, selectedVehicleId: v.id})}
                    className={`group relative bg-white border transition-all duration-300 rounded-2xl cursor-pointer hover:shadow-xl ${
                      formData.selectedVehicleId === v.id ? 'border-slate-900 shadow-xl ring-4 ring-slate-50' : 
                      !isAvailable ? 'opacity-40 grayscale cursor-not-allowed border-slate-100' : 'border-slate-100'
                    }`}
                  >
                    <div className="h-44 overflow-hidden rounded-t-2xl relative">
                      <img src={v.image} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" alt={v.name} />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[9px] font-bold text-slate-600 border border-white/40">
                        {v.type}
                      </div>
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center p-4">
                           <div className="bg-white px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-900 flex items-center gap-1.5 shadow-xl">
                              <AlertCircle className="w-3.5 h-3.5" /> Lotação: {v.minCapacity || 1}-{v.capacity} PAX
                           </div>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-slate-900">{v.name}</h3>
                          <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400">
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Max. {v.capacity}</span>
                            <span className="flex items-center gap-1"><Luggage className="w-3 h-3" /> Max. {v.luggage}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-6">
                        <span className="text-2xl font-extrabold text-slate-900">{calculatePrice(v).toFixed(2)}€</span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${formData.selectedVehicleId === v.id ? 'bg-slate-900 text-white' : 'bg-slate-50 border border-slate-200 text-transparent'}`}>
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-50">
              <button onClick={() => setStep(1)} className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Voltar</button>
              <button 
                onClick={handleNext} 
                disabled={!formData.selectedVehicleId}
                className="bg-slate-900 text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:bg-black transition-all disabled:opacity-30"
              >
                CONTINUAR
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-6 md:p-10 max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-right-4">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Detalhes de Contacto</h2>
              <p className="text-sm text-slate-500">Precisamos destes dados para formalizar a reserva.</p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nome Completo</label>
                <input type="text" placeholder="Nome do passageiro principal" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl font-semibold text-slate-700 outline-none focus:border-slate-300 transition-all" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">E-mail</label>
                  <input type="email" placeholder="Para envio do voucher" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl font-semibold text-slate-700 outline-none focus:border-slate-300 transition-all" value={formData.customerEmail} onChange={e => setFormData({...formData, customerEmail: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Telemóvel</label>
                  <input type="tel" placeholder="+351 000 000 000" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl font-semibold text-slate-700 outline-none focus:border-slate-300 transition-all" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Notas Adicionais</label>
                <textarea rows={3} placeholder="Instruções para o motorista, cadeirinhas de bebé, etc..." className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl font-semibold text-slate-700 outline-none focus:border-slate-300 transition-all resize-none" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>
            </div>

            <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-50">
              <button onClick={() => setStep(2)} className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Voltar</button>
              <button onClick={handleNext} disabled={!formData.customerName || !formData.customerEmail || !formData.customerPhone} className="bg-slate-900 text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:bg-black transition-all disabled:opacity-30">
                PAGAMENTO
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="p-6 md:p-10 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-right-4">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Confirmar Reserva</h2>
              <p className="text-sm text-slate-500">Revise os detalhes e escolha o pagamento.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="bg-slate-50/50 p-6 md:p-8 rounded-2xl border border-slate-100 space-y-6">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Resumo da Viagem</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                       <div className="flex flex-col items-center gap-1 mt-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                          <div className="w-[1px] h-8 bg-slate-300" />
                          <div className="w-2.5 h-2.5 rounded-full border border-slate-900 bg-white" />
                       </div>
                       <div className="flex-1 space-y-4">
                         <div className="text-sm font-bold text-slate-800 line-clamp-1">{pickup.name}</div>
                         <div className="text-sm font-bold text-slate-800 line-clamp-1">{dest.name}</div>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/50">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Data e Hora</p>
                    <p className="text-sm font-bold text-slate-800">{formData.pickupDate} às {formData.pickupTime}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Veículo</p>
                    <p className="text-sm font-bold text-slate-800">{selectedVehicle?.name}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total a Pagar</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter mb-6">{selectedVehicle ? calculatePrice(selectedVehicle).toFixed(2) : '0.00'}€</p>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => setFormData({...formData, paymentMethod: PaymentMethod.CASH})}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${formData.paymentMethod === PaymentMethod.CASH ? 'border-slate-900 bg-slate-900 text-white shadow-md' : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Banknote className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Dinheiro no Local</span>
                      </div>
                      {formData.paymentMethod === PaymentMethod.CASH && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => setFormData({...formData, paymentMethod: PaymentMethod.STRIPE})}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${formData.paymentMethod === PaymentMethod.STRIPE ? 'border-slate-900 bg-slate-900 text-white shadow-md' : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Cartão Online (Stripe)</span>
                      </div>
                      {formData.paymentMethod === PaymentMethod.STRIPE && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleNext} 
                  className="w-full bg-slate-900 text-white py-5 rounded-xl font-bold text-lg shadow-xl shadow-slate-100 hover:bg-black transition-all active:scale-95"
                >
                  FINALIZAR RESERVA
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col items-center justify-center p-8 md:p-20 animate-in zoom-in-95 duration-700 min-h-[500px]">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-8">
               <Check className="w-10 h-10 text-slate-900 stroke-[3]" />
            </div>

            <div className="text-center space-y-3 max-w-lg mb-12">
               <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Reserva Confirmada</h2>
               <p className="text-slate-500 font-medium text-sm md:text-base">Agradecemos a sua preferência. Enviámos um voucher detalhado para o seu e-mail.</p>
               <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 mt-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {lastBookingId}</span>
               </div>
            </div>

            <div className="w-full max-w-md space-y-4">
               <button onClick={handleReset} className="w-full bg-slate-900 text-white py-5 rounded-xl font-bold shadow-lg hover:bg-black transition-all">
                  NOVA RESERVA
               </button>
               <div className="grid grid-cols-2 gap-3">
                 <button className="flex items-center justify-center gap-2 py-4 px-6 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 text-xs hover:bg-slate-50 transition-all">
                    <Printer className="w-3.5 h-3.5" /> PDF
                 </button>
                 <button className="flex items-center justify-center gap-2 py-4 px-6 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 text-xs hover:bg-slate-50 transition-all">
                    <Share2 className="w-3.5 h-3.5" /> PARTILHAR
                 </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
