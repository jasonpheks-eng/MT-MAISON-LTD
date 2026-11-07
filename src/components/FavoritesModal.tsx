import React from 'react';
import { useBoutique } from '../context/BoutiqueContext';
import { Heart, X, ArrowUpRight, Clock, Sparkles } from 'lucide-react';

export const FavoritesModal: React.FC = () => {
  const {
    isFavoritesOpen,
    closeFavorites,
    favoriteServiceIds,
    toggleFavorite,
    services,
    settings,
    openBookingForService,
  } = useBoutique();

  if (!isFavoritesOpen) return null;

  const safeServices = services || [];
  const favoriteServices = safeServices.filter((s) => favoriteServiceIds.includes(s.id));
  const sym = settings.currency_symbol || 'MWK';

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#240F1B] text-white rounded-3xl border border-rose-400/30 shadow-2xl overflow-hidden p-6 max-h-[85vh] flex flex-col space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
            <h3 className="font-editorial text-2xl text-white">Your Saved Favorites</h3>
          </div>
          <button
            onClick={closeFavorites}
            className="p-2 text-rose-300 hover:text-white bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {favoriteServices.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 opacity-60" />
              </div>
              <p className="text-rose-200/80 text-sm">
                No saved treatments yet.
              </p>
              <p className="text-xs text-rose-200/50 max-w-xs mx-auto">
                Tap the heart icon on any treatment to add it to your wishlist for fast repeat bookings.
              </p>
            </div>
          ) : (
            favoriteServices.map((service) => (
              <div
                key={service.id}
                className="p-4 rounded-2xl bg-black/30 border border-white/10 hover:border-rose-400/40 transition-all flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-rose-300 font-semibold px-2 py-0.5 rounded-full bg-rose-950/60 border border-rose-800/40">
                      {service.category}
                    </span>
                    <h4 className="font-semibold text-sm text-white truncate">
                      {service.title}
                    </h4>
                  </div>
                  <p className="text-xs text-rose-100/70 font-light truncate">
                    {service.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-white">
                      {sym} {service.price ? service.price.toLocaleString() : 0}
                    </span>
                    <span className="block text-[10px] text-rose-300/70">
                      <Clock className="w-2.5 h-2.5 inline mr-0.5" />
                      {service.duration_min}m
                    </span>
                  </div>

                  <button
                    onClick={() => toggleFavorite(service.id)}
                    className="p-2 rounded-full text-rose-400 hover:text-rose-200 transition-colors"
                    title="Remove from saved"
                  >
                    <Heart className="w-4 h-4 fill-rose-400" />
                  </button>

                  <button
                    onClick={() => {
                      closeFavorites();
                      openBookingForService(service);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#C45266] hover:bg-[#b04356] text-white text-xs font-medium flex items-center gap-1 shadow-md transition-all"
                  >
                    <span>Book Now</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
