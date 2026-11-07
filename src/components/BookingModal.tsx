import React, { useState, useEffect, useMemo } from 'react';
import { useBoutique } from '../context/BoutiqueContext';
import { ServiceItem } from '../types';
import { X, ArrowRight, ArrowDown, Sparkles } from 'lucide-react';

export const BookingModal: React.FC = () => {
  const {
    isBookingModalOpen,
    closeBooking,
    selectedServiceForBooking,
    openBookingForService,
    services,
    settings,
    appointments,
  } = useBoutique();

  const [activeCategory, setActiveCategory] = useState<'all' | 'nails' | 'lashes' | 'hair'>('all');
  const [activeView, setActiveView] = useState<'treatments' | 'bookings'>('treatments');

  useEffect(() => {
    if (selectedServiceForBooking?.category) {
      setActiveCategory(selectedServiceForBooking.category as any);
    } else {
      setActiveCategory('all');
    }
  }, [selectedServiceForBooking, isBookingModalOpen]);

  const filteredServices = useMemo(() => {
    const list = services || [];
    if (activeCategory === 'all') return list;
    return list.filter((s) => s.category === activeCategory);
  }, [services, activeCategory]);

  if (!isBookingModalOpen) return null;

  const sym = settings.currency_symbol || 'MWK';
  const defaultService = services[0];

  const handleSelect = (service: ServiceItem) => {
    openBookingForService(service);
    closeBooking();
    const el = document.getElementById('booking');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeBooking}
    >
      <div 
        className="relative w-full max-w-lg bg-[#200A18] text-white rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header - Simple & Elegant */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex flex-col gap-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-editorial text-2xl text-white tracking-wide">
                {activeView === 'treatments' ? 'Treatments' : 'My Bookings'}
              </h3>
              <p className="text-xs text-rose-200/60 mt-0.5">
                {activeView === 'treatments' ? 'Select a service to book' : 'Your requested appointments'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView(activeView === 'treatments' ? 'bookings' : 'treatments')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  activeView === 'bookings'
                    ? 'bg-[#C45266] text-white border-[#C45266]'
                    : 'bg-white/5 text-rose-200/60 border-white/10 hover:text-white'
                }`}
              >
                {activeView === 'treatments' ? 'My Bookings' : 'View Services'}
              </button>
              <button
                onClick={closeBooking}
                className="p-1.5 text-rose-200/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {activeView === 'treatments' && (
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 self-start">
              {[
                { id: 'all', label: 'All' },
                { id: 'nails', label: 'Nails' },
                { id: 'lashes', label: 'Lashes' },
                { id: 'hair', label: 'Wig Installation' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeCategory === tab.id
                      ? 'bg-[#C45266] text-white'
                      : 'text-rose-200/60 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {activeView === 'treatments' ? (
            /* Scrollable Treatments List */
            filteredServices.length === 0 ? (
              <div className="py-8 text-center text-rose-200/50 text-xs">
                No services found.
              </div>
            ) : (
              filteredServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleSelect(service)}
                  className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-medium text-white group-hover:text-rose-200 transition-colors">
                        {service.title}
                      </h4>
                      {service.is_popular && (
                        <span className="text-[10px] text-rose-300">✦</span>
                      )}
                    </div>
                    <div className="text-xs text-rose-200/60 mt-0.5 flex items-center gap-2">
                      <span>{service.duration_min} mins</span>
                      <span>·</span>
                      <span className="text-white font-medium">
                        {sym} {service.price ? service.price.toLocaleString() : 0}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(service);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-[#C45266] hover:bg-[#b04356] text-white text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <span>Book</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              ))
            )
          ) : (
            /* My Bookings / Itinerary View */
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {appointments && appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.slice(0, 3).map((apt) => (
                    <div key={apt.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                        <Sparkles className="w-3 h-3 text-rose-300" />
                      </div>
                      
                      <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                        <div className="w-8 h-8 rounded-lg bg-[#C45266] flex items-center justify-center shrink-0 shadow-inner">
                          {apt.category === 'nails' ? (
                            <ArrowDown className="w-4 h-4 text-white" />
                          ) : apt.category === 'lashes' ? (
                            <Sparkles className="w-4 h-4 text-white" />
                          ) : (
                            <ArrowDown className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-mono text-rose-300 font-bold tracking-tighter">Confirmed Slot</span>
                          <h4 className="text-sm font-medium text-white truncate">{apt.service_title}</h4>
                        </div>
                      </div>

                      <div className="space-y-2 text-[11px] text-rose-100/80 font-mono">
                        <div className="flex justify-between items-center">
                          <span className="text-rose-200/40 uppercase text-[9px] tracking-widest">Date</span>
                          <span className="text-white">{apt.date}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-rose-200/40 uppercase text-[9px] tracking-widest">Time</span>
                          <span className="text-white">{apt.time_slot}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-rose-200/40 uppercase text-[9px] tracking-widest">Fee</span>
                          <span className="text-white font-bold">{settings.currency_symbol || 'MWK'} {services.find(s => s.id === apt.service_id)?.price?.toLocaleString() || '35,000'}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                          <span className="text-rose-200/40 uppercase text-[9px] tracking-widest font-bold">Ref No.</span>
                          <span className="text-rose-300">#{apt.id.slice(-6)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const cleanNumber = settings.whatsapp_number.replace(/[^0-9]/g, '');
                          const waText = `Hello MT Mansion! Following up on my booking ref #${apt.id.slice(-6)} for ${apt.service_title}.`;
                          window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(waText)}`, '_blank');
                        }}
                        className="w-full py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-[10px] font-medium transition-all border border-emerald-500/20 mt-1"
                      >
                        Message Staff on WhatsApp
                      </button>
                    </div>
                  ))}
                  <p className="text-center text-[10px] text-rose-200/40 mt-4">
                    Showing your {appointments.length > 3 ? '3 most recent requests' : 'active requests'}.
                  </p>
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto opacity-20">
                    <ArrowDown className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-rose-200/40 px-8">
                    You haven't requested any treatments in this session yet.
                  </p>
                  <button
                    onClick={() => setActiveView('treatments')}
                    className="text-[10px] text-rose-300 hover:text-white underline underline-offset-4 transition-colors"
                  >
                    Browse the menu
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-white/5 bg-black/30 flex items-center justify-between text-xs text-rose-200/60 shrink-0">
          <span>{activeView === 'treatments' ? `${filteredServices.length} treatments` : '1 active request'}</span>
          <button
            type="button"
            onClick={closeBooking}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-[10px] transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
          >
            <span>Close Menu</span>
            <ArrowDown className="w-3 h-3" />
          </button>
        </div>

      </div>
    </div>
  );
};
