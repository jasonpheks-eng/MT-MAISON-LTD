import React, { useState } from 'react';
import { useBoutique } from '../context/BoutiqueContext';
import { ArrowUpRight } from 'lucide-react';
import { getImageStyleAndClasses } from '../lib/imageStyle';

export const ServicesShowcase: React.FC = () => {
  const { imageSlots, openBookingForService, services, settings } = useBoutique();
  const [activeCategory, setActiveCategory] = useState<'all' | 'nails' | 'lashes' | 'hair'>('all');

  const categories = [
    {
      id: 'nails',
      slotKey: 'service_nails',
      title: 'Nails',
      subtitle: 'Sculpted Gel & Bespoke Art',
      image: imageSlots.service_nails,
      serviceId: 'nails-art',
    },
    {
      id: 'lashes',
      slotKey: 'service_lashes',
      title: 'Lashes',
      subtitle: 'Silk Extensions & Lash Lift',
      image: imageSlots.service_lashes,
      serviceId: 'lashes-classic',
    },
    {
      id: 'hair',
      slotKey: 'service_hair',
      title: 'Wig Installation',
      subtitle: 'Custom Melt & Precision Styling',
      image: imageSlots.service_hair,
      serviceId: 'hair-blowout',
    },
  ];

  const handleCardClick = (catId: string) => {
    const matchedService = services.find((s) => s.category === catId);
    openBookingForService(matchedService);
  };

  return (
    <section 
      id="services" 
      className="text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-rose-950/40 scroll-mt-16 transition-colors duration-300"
      style={{ backgroundColor: settings.services_bg_color || '#501D2C' }}
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal tracking-wide text-white mt-2">
              OUR SERVICES
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs sm:text-sm text-rose-200/80 font-light">
          </div>
        </div>

        {/* 3 Large Showcase Cards matching Figma */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat) => {
            const cardImgStyle = getImageStyleAndClasses(cat.slotKey, imageSlots.configs, 'aspect-[4/3]', 'object-cover');
            return (
              <div
                key={cat.id}
                onClick={() => handleCardClick(cat.id)}
                className="group cursor-pointer flex flex-col"
              >
                <div 
                  className={`relative ${cardImgStyle.aspectClass} rounded-2xl overflow-hidden shadow-xl border border-white/10 transition-colors duration-300`}
                  style={{ backgroundColor: settings.services_card_bg_color || '#3B1622' }}
                >
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className={`${cardImgStyle.combinedClasses} group-hover:scale-105 transition-transform duration-700`}
                    style={cardImgStyle.style}
                    referrerPolicy="no-referrer"
                  />
                
                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#501D2C] transition-all">
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              {/* Title & Arrow matching Figma */}
              <div className="mt-5 flex items-baseline justify-between">
                <div>
                  <h3 className="font-editorial text-3xl sm:text-4xl italic text-white group-hover:text-rose-200 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-rose-300/80 tracking-wider uppercase mt-1">
                    {cat.subtitle}
                  </p>
                </div>
                <span className="text-xl text-rose-300 group-hover:text-white transition-colors">
                  ↗
                </span>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
};
