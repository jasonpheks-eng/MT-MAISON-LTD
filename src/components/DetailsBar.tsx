import React from 'react';
import { useBoutique } from '../context/BoutiqueContext';

export const DetailsBar: React.FC = () => {
  const { settings } = useBoutique();
  const items = [
    'CONSIDERED DETAILS',
    'YOUR STYLE, YOUR SET',
    'A LITTLE EVERYDAY LUXURY',
    'BEAUTIFULLY YOU',
  ];

  return (
    <div 
      className="py-4 px-4 sm:px-6 lg:px-8 border-y border-rose-900/40 select-none transition-colors duration-300"
      style={{ 
        backgroundColor: settings.details_bg_color || '#501D2C',
        color: settings.details_text_color || '#E5B8C0'
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-3 gap-x-6 text-xs sm:text-sm font-medium tracking-[0.25em] uppercase">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <span className="hover:text-white transition-colors cursor-default whitespace-nowrap">
              {item}
            </span>
            {index < items.length - 1 && (
              <span className="hidden sm:inline text-rose-400/40 select-none" aria-hidden="true">
                ·
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
