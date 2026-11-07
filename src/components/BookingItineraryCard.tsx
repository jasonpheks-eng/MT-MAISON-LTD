import React from 'react';
import { useBoutique } from '../context/BoutiqueContext';
import { Calendar, Clock, Sparkles, X, ChevronRight } from 'lucide-react';

export const BookingItineraryCard: React.FC = () => {
  const { services, settings, openBookingForService } = useBoutique();
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return (
    <button
      onClick={() => setIsVisible(true)}
      className="fixed bottom-6 right-6 z-40 bg-[#C45266] text-white p-3.5 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center justify-center border border-white/20 cursor-pointer"
      title="View Booking Itinerary"
      aria-label="View Booking Itinerary"
    >
      <Sparkles className="w-5 h-5 text-rose-100 animate-pulse" />
    </button>
  );

  const sym = settings.currency_symbol || 'MWK';
  const defaultService = services[0];

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-xs w-full bg-[#270E1D]/95 backdrop-blur-md text-white rounded-2xl border border-rose-400/30 shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#C45266] text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-rose-300 font-semibold">
              Your Itinerary
            </span>
            <h5 className="text-xs font-editorial text-white">MT Mansion</h5>
          </div>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="p-1 rounded-full text-rose-200/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Minimize"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="py-3 space-y-2 text-xs">
        <div className="flex items-center justify-between text-rose-100">
          <span className="text-rose-300/80 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Treatment:
          </span>
          <span className="font-medium text-white truncate max-w-[150px]">
            {defaultService ? defaultService.title : 'Bespoke Styling'}
          </span>
        </div>

        <div className="flex items-center justify-between text-rose-100">
          <span className="text-rose-300/80 flex items-center gap-1.5">
            <Calendar className="w-3 h-3" /> Date:
          </span>
          <span className="font-mono text-white">Nov 12, 2026</span>
        </div>

        <div className="flex items-center justify-between text-rose-100">
          <span className="text-rose-300/80 flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> Slot:
          </span>
          <span className="font-mono text-white">02:30 PM</span>
        </div>
      </div>

      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
        <span className="font-mono font-bold text-white text-xs">
          {sym} {defaultService?.price ? defaultService.price.toLocaleString() : '35,000'}
        </span>

        <button
          onClick={() => {
            const el = document.getElementById('booking');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              openBookingForService();
            }
          }}
          className="px-3 py-1.5 rounded-xl bg-[#C45266] hover:bg-[#b04356] text-white text-xs font-medium transition-all flex items-center gap-1 shadow cursor-pointer"
        >
          <span>Complete</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
