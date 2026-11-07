import React, { useRef } from 'react';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBoutique } from '../context/BoutiqueContext';

export const ExperiencesSection: React.FC = () => {
  const { openBookingForService, imageSlots, settings } = useBoutique();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 360;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const galleryImages = imageSlots.experience_gallery || [];

  return (
    <section 
      id="experiences" 
      className="text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8 scroll-mt-16 border-t border-rose-300/20 transition-colors duration-300"
      style={{ backgroundColor: settings.experiences_bg_color || '#180711' }}
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-[0.25em] uppercase text-rose-200">
            Client Gallery
          </span>
          <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal text-white mt-3">
            Your Experiences
          </h2>
        </div>

        {/* Customer Gallery with Scroll Controls */}
        <div className="relative group">
          {galleryImages.length > 2 && (
            <div className="hidden sm:flex items-center justify-end gap-2 mb-4">
              <button
                type="button"
                onClick={() => scroll('left')}
                className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-rose-100 transition-all hover:scale-105 active:scale-95 shadow-md"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-rose-100 transition-all hover:scale-105 active:scale-95 shadow-md"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-rose-300/40 scrollbar-track-black/10 snap-x snap-mandatory scroll-smooth"
          >
            {galleryImages.map((img, i) => (
              <div
                key={i}
                className="flex-none w-72 sm:w-80 h-96 rounded-3xl overflow-hidden shadow-2xl snap-start bg-black/25 shrink-0 border border-white/10 transition-transform duration-300 hover:scale-[1.02]"
              >
                <img
                  src={img}
                  alt={`Client Experience ${i + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom invitation */}
        <div className="mt-12 text-center">
          <button
            onClick={() => openBookingForService()}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#240F1B] text-white hover:bg-[#1A0A13] text-sm font-medium tracking-wide shadow-xl transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-rose-300" />
            <span>Experience MT Mansion Yourself ↗</span>
          </button>
        </div>

      </div>
    </section>
  );
};
