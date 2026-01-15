
import React, { useState } from 'react';
import { Settings as SettingsIcon, Car, List, Code, Save, Plus, Trash2, Key, DollarSign, Map, MapPin, Copy, CheckCircle2, Clock, CreditCard, AlertTriangle, ExternalLink, ShieldAlert, Globe, Menu, X, ArrowRight, Edit3, Image as ImageIcon, Users, Github } from 'lucide-react';
import { Settings, Vehicle, Booking } from '../types';

interface Props {
  settings: Settings;
  onSettingsUpdate: (s: Settings) => void;
  vehicles: Vehicle[];
  onVehiclesUpdate: (v: Vehicle[]) => void;
  bookings: Booking[];
}

export const AdminDashboard: React.FC<Props> = ({ settings, onSettingsUpdate, vehicles, onVehiclesUpdate, bookings }) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'fleet' | 'settings' | 'iframe'>('bookings');
  const [tempSettings, setTempSettings] = useState(settings);
  const [showCopied, setShowCopied] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);

  const handleSaveSettings = () => {
    onSettingsUpdate(tempSettings);
    alert('Definições atualizadas com sucesso!');
  };

  const handleDeleteVehicle = (id: string) => {
    if (confirm('Tem a certeza que deseja remover este veículo?')) {
      onVehiclesUpdate(vehicles.filter(v => v.id !== id));
    }
  };

  const handleSaveVehicle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const vehicleData: Partial<Vehicle> = {
      name: formData.get('name') as string,
      type: formData.get('type') as any,
      minCapacity: parseInt(formData.get('minCapacity') as string),
      capacity: parseInt(formData.get('capacity') as string),
      luggage: parseInt(formData.get('luggage') as string),
      basePrice: parseFloat(formData.get('basePrice') as string),
      pricePerKm: parseFloat(formData.get('pricePerKm') as string),
      image: formData.get('image') as string,
    };

    if (editingVehicle) {
      onVehiclesUpdate(vehicles.map(v => v.id === editingVehicle.id ? { ...v, ...vehicleData } as Vehicle : v));
    } else {
      const newVehicle: Vehicle = {
        id: Math.random().toString(36).substr(2, 9),
        ...vehicleData
      } as Vehicle;
      onVehiclesUpdate([...vehicles, newVehicle]);
    }
    setEditingVehicle(null);
    setIsAddingVehicle(false);
  };

  // Garante que o iframe aponte para a URL base sem parâmetros de admin
  const baseUrl = window.location.origin + window.location.pathname;
  const iframeCode = `<iframe \n  src="${baseUrl}" \n  width="100%" \n  height="800px" \n  frameborder="0" \n  style="border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">\n</iframe>`;

  const menuItems = [
    { id: 'bookings', label: 'Reservas', icon: List },
    { id: 'fleet', label: 'Frota', icon: Car },
    { id: 'settings', label: 'Definições', icon: SettingsIcon },
    { id: 'iframe', label: 'Plugin Iframe', icon: Code },
  ];

  const handleTabChange = (id: any) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#fafafa] overflow-hidden relative">
      <button 
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-[60] bg-slate-900 text-white p-4 rounded-full shadow-2xl"
      >
        <Menu className="w-6 h-6" />
      </button>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-[70] lg:hidden backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col p-6 z-[80] transition-transform duration-300 lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1.5 rounded-lg shadow-sm">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">TransferGo</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 hover:bg-slate-50 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map(item => (
            <button 
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === item.id ? 'bg-slate-50 text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-slate-900' : ''}`} /> {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-2">
          <a 
            href="https://github.com/aorubrotlucas-a11y/transfergo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
          >
            <Github className="w-3 h-3" /> Ver Código GitHub
          </a>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hidden lg:block">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Plugin Engine v3.5</span>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 shrink-0">
           <h2 className="text-base font-bold text-slate-800 capitalize tracking-tight">{activeTab}</h2>
           <div className="flex items-center gap-4">
              <span className="hidden md:block text-[10px] font-bold text-slate-300 uppercase tracking-widest">Painel Administrativo</span>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {activeTab === 'bookings' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 {[
                   { label: 'Total Reservas', val: bookings.length, icon: List },
                   { label: 'Faturação Total', val: bookings.reduce((a,b) => a + b.totalPrice, 0).toFixed(2) + '€', icon: DollarSign },
                   { label: 'Veículos Ativos', val: vehicles.length, icon: Car },
                   { label: 'Ticket Médio', val: bookings.length ? (bookings.reduce((a,b) => a + b.totalPrice, 0) / bookings.length).toFixed(1) + '€' : '0€', icon: CreditCard },
                 ].map((card, i) => (
                   <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] group hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.label}</p>
                        <card.icon className="w-4 h-4 text-slate-200" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{card.val}</h3>
                   </div>
                 ))}
              </div>

              <div className="bg-white rounded-xl shadow-[0_2px_15_rgba(0,0,0,0.03)] border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID / Data</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliente</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rota</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bookings.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-300 italic font-medium text-sm">Nenhuma reserva disponível.</td></tr>
                      ) : (
                        bookings.map(b => (
                          <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-5">
                              <div className="font-bold text-slate-900 text-sm">#{b.id}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase">{b.createdAt.split('T')[0]}</div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="font-bold text-slate-800 text-sm">{b.customer.name}</div>
                              <div className="text-[10px] text-slate-400">{b.customer.phone}</div>
                            </td>
                            <td className="px-6 py-5">
                               <div className="text-[11px] font-bold text-slate-600 flex items-center gap-2">
                                  <span className="truncate max-w-[120px]">{b.pickupLocation.split(',')[0]}</span>
                                  <ArrowRight className="w-3 h-3 text-slate-300" />
                                  <span className="truncate max-w-[120px]">{b.destination.split(',')[0]}</span>
                               </div>
                               <div className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">{b.pickupDate} @ {b.pickupTime}</div>
                            </td>
                            <td className="px-6 py-5">
                               <div className="font-bold text-slate-900 text-sm">{b.totalPrice.toFixed(2)}€</div>
                               <div className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">{b.paymentMethod}</div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-wider">
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fleet' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Gestão de Veículos</h3>
                    <p className="text-xs text-slate-500 font-medium">Configure a sua frota, ocupação e preços.</p>
                  </div>
                  <button 
                    onClick={() => setIsAddingVehicle(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-black transition-all shadow-lg shadow-slate-200"
                  >
                    <Plus className="w-4 h-4" /> NOVO VEÍCULO
                  </button>
               </div>

               {(isAddingVehicle || editingVehicle) && (
                 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
                    <form 
                      onSubmit={handleSaveVehicle}
                      className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95"
                    >
                       <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                          <h4 className="font-bold text-lg">{editingVehicle ? 'Editar Veículo' : 'Adicionar Veículo'}</h4>
                          <button type="button" onClick={() => { setEditingVehicle(null); setIsAddingVehicle(false); }}><X className="w-6 h-6 text-slate-400" /></button>
                       </div>
                       <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome do Veículo</label>
                                <input name="name" required defaultValue={editingVehicle?.name} placeholder="Ex: Mercedes V-Class" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-slate-300" />
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tipo de Frota</label>
                                <select name="type" defaultValue={editingVehicle?.type || 'Sedan'} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none">
                                   <option value="Sedan">Sedan</option>
                                   <option value="Van">Van</option>
                                   <option value="Luxury">Luxury</option>
                                   <option value="Minibus">Minibus</option>
                                </select>
                             </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ocupação Mínima</label>
                                <input name="minCapacity" type="number" required defaultValue={editingVehicle?.minCapacity || 1} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm" />
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ocupação Máxima</label>
                                <input name="capacity" type="number" required defaultValue={editingVehicle?.capacity} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm" />
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Capacidade Bagagem</label>
                                <input name="luggage" type="number" required defaultValue={editingVehicle?.luggage} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm" />
                             </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Preço Base (€)</label>
                                <input name="basePrice" type="number" step="0.01" required defaultValue={editingVehicle?.basePrice} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm" />
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Preço por KM (€)</label>
                                <input name="pricePerKm" type="number" step="0.01" required defaultValue={editingVehicle?.pricePerKm} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm" />
                             </div>
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">URL da Imagem</label>
                             <input name="image" required defaultValue={editingVehicle?.image} placeholder="https://..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm" />
                          </div>
                       </div>
                       <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                          <button type="button" onClick={() => { setEditingVehicle(null); setIsAddingVehicle(false); }} className="px-6 py-3 text-sm font-bold text-slate-400 uppercase tracking-widest">Cancelar</button>
                          <button type="submit" className="px-10 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200">GUARDAR VEÍCULO</button>
                       </div>
                    </form>
                 </div>
               )}

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {vehicles.map(v => (
                    <div key={v.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col md:flex-row group transition-all hover:shadow-xl hover:border-slate-300">
                       <div className="md:w-1/3 relative h-48 md:h-auto overflow-hidden">
                          <img src={v.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={v.name} />
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-bold text-slate-600 uppercase">
                             {v.type}
                          </div>
                       </div>
                       <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-4">
                               <h4 className="font-bold text-slate-900 text-lg">{v.name}</h4>
                               <div className="flex gap-2">
                                  <button onClick={() => setEditingVehicle(v)} className="p-2 text-slate-400 hover:text-blue-500 transition-colors bg-slate-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                                  <button onClick={() => handleDeleteVehicle(v.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                               </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                               <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Capacidade</p>
                                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                                     <Users className="w-3.5 h-3.5" /> {v.minCapacity}-{v.capacity} PAX
                                  </div>
                               </div>
                               <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Preço Base</p>
                                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                                     <DollarSign className="w-3.5 h-3.5" /> {v.basePrice.toFixed(2)}€
                                  </div>
                               </div>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                             <div className="text-[10px] font-bold text-slate-400 uppercase">Preço / KM</div>
                             <div className="text-sm font-black text-slate-900">{v.pricePerKm.toFixed(2)}€</div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-start gap-4">
                 <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200">
                    <ShieldAlert className="w-5 h-5 text-slate-900" />
                 </div>
                 <div>
                    <h3 className="text-base font-bold tracking-tight text-slate-900 mb-1">Segurança e Pagamentos</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      Configure as suas chaves de API para processamento de pagamentos seguro via Stripe.
                    </p>
                 </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 space-y-8 shadow-sm">
                 <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Stripe Secret/Public Key</label>
                       <div className="relative">
                          <input 
                            type="password" 
                            placeholder="pk_test_..."
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:border-slate-400 transition-all text-sm" 
                            value={tempSettings.stripeApiKey} 
                            onChange={e => setTempSettings({...tempSettings, stripeApiKey: e.target.value})} 
                          />
                          <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Moeda Ativa</label>
                       <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:border-slate-400 transition-all appearance-none text-sm" value={tempSettings.currency} onChange={e => setTempSettings({...tempSettings, currency: e.target.value})}>
                          <option value="EUR">Euro (€)</option>
                          <option value="USD">Dólar ($)</option>
                          <option value="GBP">Libra (£)</option>
                       </select>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Taxa Base Global (€)</label>
                       <input 
                          type="number" 
                          step="0.01"
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:border-slate-400 transition-all text-sm" 
                          value={tempSettings.defaultPricePerKm} 
                          onChange={e => setTempSettings({...tempSettings, defaultPricePerKm: parseFloat(e.target.value)})} 
                        />
                    </div>
                 </div>

                 <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Última atualização: Hoje</p>
                    <button onClick={handleSaveSettings} className="bg-slate-900 text-white px-10 py-4 rounded-xl font-bold shadow-xl hover:bg-black transition-all active:scale-[0.98]">
                       GUARDAR ALTERAÇÕES
                    </button>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'iframe' && (
            <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-2">
               <div className="bg-white p-6 md:p-10 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="p-3 bg-slate-900 rounded-xl text-white">
                        <Code className="w-6 h-6" />
                     </div>
                     <div>
                        <h3 className="text-xl font-bold mb-1">Plugin de Integração</h3>
                        <p className="text-xs text-slate-400 font-medium">Use este código para embutir o motor de reservas no seu site principal.</p>
                     </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute -top-3 right-4 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest z-10 shadow-sm">Pronto a Copiar</div>
                    <pre className="bg-slate-900 text-slate-300 p-8 rounded-2xl font-mono text-[10px] md:text-xs overflow-x-auto leading-relaxed shadow-lg border border-slate-800">
                      {iframeCode}
                    </pre>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(iframeCode);
                        setShowCopied(true);
                        setTimeout(() => setShowCopied(false), 2000);
                      }}
                      className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl transition-all border border-white/5"
                    >
                      {showCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="mt-12 space-y-4">
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3">
                        <ExternalLink className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                           <p className="text-xs font-bold text-slate-700 mb-1">Link de Admin Direto</p>
                           <p className="text-[10px] text-slate-500 leading-relaxed break-all">
                              Para gerir as reservas, use sempre o link: <br/>
                              <code className="bg-slate-200 px-1 rounded">{baseUrl}?admin=true</code>
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
