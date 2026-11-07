import React, { useState } from 'react';
import { useBoutique } from '../context/BoutiqueContext';
import { Menu, X, Settings, Sparkles, Calendar, Camera } from 'lucide-react';
import { getImageStyleAndClasses } from '../lib/imageStyle';

export const Navbar: React.FC = () => {
  const { openBookingForService, openAdmin, isAdmin, settings, imageSlots } = useBoutique();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logoStyle = getImageStyleAndClasses('logo_url', imageSlots.configs, 'auto', 'object-contain');

  return (
    <header 
      className="sticky top-0 z-40 text-white shadow-sm border-b border-rose-300/20 backdrop-blur-md transition-colors duration-300"
      style={{ backgroundColor: settings.navbar_bg_color || '#000000' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        
        {/* Desktop Logo (Left Corner) */}
        <div className={`hidden md:flex items-center shrink-0 h-16 w-32 ${logoStyle.containerClasses}`}>
          <img 
            src={imageSlots.logo_url} 
            alt="MT Mansion Logo" 
            className={logoStyle.combinedClasses}
            style={logoStyle.style}
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Mobile Logo (Centered) */}
        <div className={`flex md:hidden absolute left-1/2 -translate-x-1/2 h-14 w-28 items-center justify-center ${logoStyle.containerClasses}`}>
          <img 
            src={imageSlots.logo_url} 
            alt="MT Mansion Logo" 
            className={logoStyle.combinedClasses}
            style={logoStyle.style}
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Desktop Nav Links matching Figma (centered) */}
        <nav className="hidden md:flex items-center gap-4 text-sm font-medium tracking-wide text-white">
          <a
            href="#services"
            className="group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full hover:bg-white/10 text-white transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-white/15 group-hover:bg-[#C45266] flex items-center justify-center transition-all shadow-sm shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-medium tracking-wide text-sm">The Services</span>
          </a>
          <a
            href="#booking"
            className="group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full hover:bg-white/10 text-white transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-white/15 group-hover:bg-[#C45266] flex items-center justify-center transition-all shadow-sm shrink-0">
              <Calendar className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-medium tracking-wide text-sm">Your Visit</span>
          </a>
          <a
            href="#experiences"
            className="group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full hover:bg-white/10 text-white transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-white/15 group-hover:bg-[#C45266] flex items-center justify-center transition-all shadow-sm shrink-0">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-medium tracking-wide text-sm">Experiences</span>
          </a>
        </nav>

        {/* Right Action Zone */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Settings Trigger (Icon Only) */}
          <button
            onClick={openAdmin}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm border border-white/10 hover:scale-105 active:scale-95"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 text-white" />
          </button>

          {/* Primary CTA Book an appointment matching Figma */}
          <button
            onClick={() => openBookingForService()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#240F1B] text-white hover:bg-[#1A0A13] text-sm font-medium tracking-wide transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] border border-white/10"
          >
            <span>Book an appointment</span>
            <span className="text-xs">↗</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => openBookingForService()}
            className="px-3.5 py-1.5 rounded-full bg-[#240F1B] text-xs font-medium text-white"
          >
            Book ↗
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden border-t border-rose-400/30 px-6 py-6 flex flex-col gap-4 text-white transition-colors"
          style={{ backgroundColor: settings.navbar_bg_color || '#000000', color: settings.navbar_text_color || '#ea297e' }}
        >
          <div className="flex justify-center mb-4">
            <img 
              src={imageSlots.logo_url} 
              alt="MT Mansion Logo" 
              className="h-28 w-auto object-contain"
            />
          </div>
          <a
            href="#services"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium text-white hover:text-rose-100 py-1.5 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-white/15 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span>The Services</span>
          </a>
          <a
            href="#booking"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium text-white hover:text-rose-100 py-1.5 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-white/15 text-white flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span>Your Visit</span>
          </a>
          <a
            href="#experiences"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium text-white hover:text-rose-100 py-1.5 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-white/15 text-white flex items-center justify-center shrink-0">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span>Experiences</span>
          </a>

          <div className="pt-4 border-t border-white/20 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openBookingForService();
              }}
              className="w-full py-3 rounded-full bg-[#240F1B] text-white font-medium text-center text-sm shadow-sm"
            >
              Book an appointment ↗
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openAdmin();
              }}
              className="w-full py-2.5 rounded-full bg-black/20 text-rose-100 font-medium text-center text-xs flex items-center justify-center gap-2"
            >
              <Settings className="w-3.5 h-3.5 text-white" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
