import React from 'react';
import { useBoutique } from '../context/BoutiqueContext';
import { Instagram, MessageCircle, MapPin, Phone } from 'lucide-react';
import { getImageStyleAndClasses } from '../lib/imageStyle';

export const Footer: React.FC = () => {
  const { settings, imageSlots } = useBoutique();
  const logoStyle = getImageStyleAndClasses('logo_url', imageSlots.configs, 'auto', 'object-contain');

  return (
    <footer 
      className="border-t border-rose-950 py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300"
      style={{ 
        backgroundColor: '#000000',
        color: settings.footer_text_color || '#FBF8F6'
      }}
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-6">
        
        {/* Brand Logo (Centered) */}
        <div className={`h-16 w-40 flex items-center justify-center mx-auto ${logoStyle.containerClasses}`}>
          <img
            src={imageSlots.logo_url || '/assets/aistudio/Black_and_White_Minimalist_Initials_Logo__1__19e0d52a.jpg'}
            alt="MT Mansion Logo"
            className={logoStyle.combinedClasses}
            style={logoStyle.style}
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Location & Phone */}
        <p className="text-xs text-rose-200/80 flex flex-wrap items-center justify-center gap-4 font-light">
          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-400" /> {settings.address}, {settings.city_region}</span>
          <span>·</span>
          <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-rose-400" /> {settings.whatsapp_number}</span>
        </p>

        {/* Socials */}
        <div className="flex items-center gap-4 pt-2">
          <a
            href={settings.instagram_url}
            target="_blank"
            rel="noreferrer"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#C45266] flex items-center justify-center text-white transition-all shadow"
            aria-label="Instagram"
          >
            <Instagram className="w-4 h-4" />
          </a>

          <a
            href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-emerald-600 flex items-center justify-center text-white transition-all shadow"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>

        {/* Copyright */}
        <div className="w-full pt-8 mt-4 border-t border-white/10 text-xs text-rose-200/50">
          <p>© 2026 MT Mansion. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};
