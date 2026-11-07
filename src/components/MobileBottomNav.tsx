import React, { useState, useEffect } from 'react';
import { useBoutique } from '../context/BoutiqueContext';
import { Home, Search, Plus, Heart, User } from 'lucide-react';
import { motion } from 'motion/react';

export const MobileBottomNav: React.FC = () => {
  const {
    openBookingForService,
    openSearch,
    openFavorites,
    favoriteServiceIds,
    openAdmin,
  } = useBoutique();

  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'add' | 'favorites' | 'profile'>('home');

  // Sync active tab with scroll section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const aboutSection = document.getElementById('about');
      const bookingSection = document.getElementById('booking');

      if (aboutSection && scrollPos >= aboutSection.offsetTop - 300 && scrollPos < (bookingSection?.offsetTop || 99999)) {
        setActiveTab('profile');
      } else if (scrollPos < 400) {
        setActiveTab('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabClick = (tabKey: 'home' | 'search' | 'add' | 'favorites' | 'profile') => {
    setActiveTab(tabKey);

    switch (tabKey) {
      case 'home':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'search':
        openSearch();
        break;
      case 'add':
        openBookingForService();
        break;
      case 'favorites':
        openFavorites();
        break;
      case 'profile': {
        const aboutEl = document.getElementById('about');
        if (aboutEl) {
          aboutEl.scrollIntoView({ behavior: 'smooth' });
        } else {
          openAdmin('appointments');
        }
        break;
      }
      default:
        break;
    }
  };

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-3 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-[440px] z-40"
    >
      <div className="relative bg-[#1A0A13]/90 backdrop-blur-2xl border border-white/15 shadow-2xl rounded-3xl p-1.5 flex items-center justify-between">
        
        {/* Tab 1: Home */}
        <button
          onClick={() => handleTabClick('home')}
          className="relative flex-1 flex flex-col items-center justify-center py-1.5 text-center group cursor-pointer"
        >
          {activeTab === 'home' && (
            <>
              <motion.div
                layoutId="activeTabTopBar"
                className="absolute top-0 w-8 h-1 rounded-full bg-[#C45266] shadow-[0_0_10px_#C45266]"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white/10 rounded-2xl -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            </>
          )}
          <Home
            size={24}
            className={`transition-colors duration-200 ${
              activeTab === 'home' ? 'text-rose-300 scale-105' : 'text-white/60 group-hover:text-white'
            }`}
          />
          <span
            className={`text-[10px] font-medium tracking-tight mt-0.5 transition-colors ${
              activeTab === 'home' ? 'text-rose-200 font-semibold' : 'text-white/50'
            }`}
          >
            Home
          </span>
        </button>

        {/* Tab 2: Search */}
        <button
          onClick={() => handleTabClick('search')}
          className="relative flex-1 flex flex-col items-center justify-center py-1.5 text-center group cursor-pointer"
        >
          {activeTab === 'search' && (
            <>
              <motion.div
                layoutId="activeTabTopBar"
                className="absolute top-0 w-8 h-1 rounded-full bg-[#C45266] shadow-[0_0_10px_#C45266]"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white/10 rounded-2xl -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            </>
          )}
          <Search
            size={24}
            className={`transition-colors duration-200 ${
              activeTab === 'search' ? 'text-rose-300 scale-105' : 'text-white/60 group-hover:text-white'
            }`}
          />
          <span
            className={`text-[10px] font-medium tracking-tight mt-0.5 transition-colors ${
              activeTab === 'search' ? 'text-rose-200 font-semibold' : 'text-white/50'
            }`}
          >
            Search
          </span>
        </button>

        {/* Tab 3: Add (+) Floating Primary Action Button */}
        <button
          onClick={() => handleTabClick('add')}
          className="relative flex-1 flex flex-col items-center justify-center py-0 group cursor-pointer"
          title="Book Appointment"
        >
          <div className="w-12 h-12 rounded-full bg-[#C45266] text-white flex items-center justify-center shadow-lg shadow-[#C45266]/50 -translate-y-3.5 border-2 border-[#1A0A13] group-active:scale-95 transition-all">
            <Plus size={24} className="stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-medium text-rose-200 tracking-tight -mt-2">
            Book
          </span>
        </button>

        {/* Tab 4: Favorites */}
        <button
          onClick={() => handleTabClick('favorites')}
          className="relative flex-1 flex flex-col items-center justify-center py-1.5 text-center group cursor-pointer"
        >
          {activeTab === 'favorites' && (
            <>
              <motion.div
                layoutId="activeTabTopBar"
                className="absolute top-0 w-8 h-1 rounded-full bg-[#C45266] shadow-[0_0_10px_#C45266]"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white/10 rounded-2xl -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            </>
          )}
          <div className="relative">
            <Heart
              size={24}
              className={`transition-colors duration-200 ${
                activeTab === 'favorites' ? 'text-rose-300 scale-105 fill-rose-300/30' : 'text-white/60 group-hover:text-white'
              }`}
            />
            {favoriteServiceIds.length > 0 && (
              <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-[#C45266] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-[#1A0A13]">
                {favoriteServiceIds.length}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] font-medium tracking-tight mt-0.5 transition-colors ${
              activeTab === 'favorites' ? 'text-rose-200 font-semibold' : 'text-white/50'
            }`}
          >
            Favorites
          </span>
        </button>

        {/* Tab 5: Profile / CEO */}
        <button
          onClick={() => handleTabClick('profile')}
          className="relative flex-1 flex flex-col items-center justify-center py-1.5 text-center group cursor-pointer"
        >
          {activeTab === 'profile' && (
            <>
              <motion.div
                layoutId="activeTabTopBar"
                className="absolute top-0 w-8 h-1 rounded-full bg-[#C45266] shadow-[0_0_10px_#C45266]"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white/10 rounded-2xl -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            </>
          )}
          <User
            size={24}
            className={`transition-colors duration-200 ${
              activeTab === 'profile' ? 'text-rose-300 scale-105' : 'text-white/60 group-hover:text-white'
            }`}
          />
          <span
            className={`text-[10px] font-medium tracking-tight mt-0.5 transition-colors ${
              activeTab === 'profile' ? 'text-rose-200 font-semibold' : 'text-white/50'
            }`}
          >
            Profile
          </span>
        </button>

      </div>
    </nav>
  );
};
