import React from 'react';
import { useBoutique } from '../context/BoutiqueContext';
import { Calendar, ArrowUpRight } from 'lucide-react';

export const Hero: React.FC = () => {
  const { openBookingForService, settings } = useBoutique();

  return (
    <section 
      className="relative text-white overflow-hidden transition-colors duration-500"
      style={{ 
        backgroundColor: settings.hero_bg_color || '#701932',
        marginTop: '-4px',
        marginRight: '-4px',
        paddingTop: '92px',
        paddingBottom: '72px',
        paddingLeft: '0px',
        paddingRight: '0px'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        
        {/* Editorial Headline & Narrative */}
        <div className="flex flex-col items-center space-y-6 lg:space-y-8 z-10">
          
          <h1 className="font-sans text-5xl sm:text-7xl lg:text-[88px] font-light leading-[1.05] tracking-tight text-white text-balance animate-in fade-in slide-in-from-bottom-5 duration-700">
            Where Beauty <br />
            <span 
              className="font-editorial italic font-normal transition-colors"
              style={{ color: settings.hero_accent_color || '#ea297e' }}
            >
              Meets Elegance
            </span>
          </h1>

          <p className="max-w-2xl text-lg sm:text-xl text-rose-100/70 font-normal leading-relaxed">
            Beautiful nails. A moment to yourself. Welcome to MT Mansion, where your
            next set is a little expression of who you are.
          </p>

          {/* Quick Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                const bookingElement = document.getElementById('booking');
                if (bookingElement) {
                  bookingElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                  openBookingForService();
                }
              }}
              className="group flex items-center gap-3 px-10 py-4 rounded-full bg-white text-[#000000] hover:bg-rose-50 text-base font-medium tracking-wide transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Calendar className="w-5 h-5" style={{ color: settings.hero_accent_color || '#ea297e' }} />
              <span>Make a Booking</span>
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" style={{ color: settings.hero_accent_color || '#ea297e' }} />
            </button>

            <a
              href="#services"
              className="px-8 py-4 rounded-full text-white hover:bg-white/10 text-base font-medium tracking-wide transition-colors"
            >
              Explore Services Menu
            </a>
          </div>


        </div>
      </div>
    </section>
  );
};
