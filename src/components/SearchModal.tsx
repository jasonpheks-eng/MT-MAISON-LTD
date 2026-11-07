import React, { useState } from 'react';
import { useBoutique } from '../context/BoutiqueContext';
import { Search, X, Heart, Clock, ArrowUpRight, Sparkles } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    closeSearch,
    services,
    settings,
    openBookingForService,
    favoriteServiceIds,
    toggleFavorite,
  } = useBoutique();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'nails' | 'lashes' | 'hair'>('all');

  if (!isSearchOpen) return null;

  const safeServices = services || [];
  const filtered = safeServices.filter((s) => {
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const q = query.toLowerCase().trim();
    const matchesQ =
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q);
    return matchesCat && matchesQ;
  });

  const sym = settings.currency_symbol || 'MWK';

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#240F1B] text-white rounded-3xl border border-rose-400/30 shadow-2xl overflow-hidden p-6 max-h-[85vh] flex flex-col space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-rose-300" />
            <h3 className="font-editorial text-2xl text-white">Search Boutique Treatments</h3>
          </div>
          <button
            onClick={closeSearch}
            className="p-2 text-rose-300 hover:text-white bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-rose-300/60" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by treatment name, nail art, silk press, volume..."
              className="w-full bg-black/40 border border-white/20 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-rose-200/40 focus:outline-none focus:border-rose-400 font-sans"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-3.5 text-xs text-rose-300/60 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2">
            {(['all', 'nails', 'lashes', 'hair'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#C45266] text-white font-semibold shadow ring-2 ring-white/20'
                    : 'bg-white/10 text-rose-200 hover:bg-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-rose-300/60 text-xs">
              No treatments found for "{query}". Try searching for nails, lashes, or blowout!
            </div>
          ) : (
            filtered.map((service) => {
              const isFav = favoriteServiceIds.includes(service.id);
              return (
                <div
                  key={service.id}
                  className="p-4 rounded-2xl bg-black/30 border border-white/10 hover:border-rose-400/40 transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-rose-300 font-semibold px-2 py-0.5 rounded-full bg-rose-950/60 border border-rose-800/40">
                        {service.category}
                      </span>
                      <h4 className="font-semibold text-sm text-white group-hover:text-rose-200 transition-colors truncate">
                        {service.title}
                      </h4>
                      {service.is_popular && (
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/20 text-white">
                          Popular
                        </span>
                      )}
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
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                      title={isFav ? 'Remove from saved' : 'Save treatment'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isFav ? 'text-rose-400 fill-rose-400' : 'text-white/40 hover:text-white'
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => {
                        closeSearch();
                        openBookingForService(service);
                      }}
                      className="px-3 py-2 rounded-xl bg-[#C45266] hover:bg-[#b04356] text-white text-xs font-medium flex items-center gap-1 shadow-md transition-all"
                    >
                      <span>Book</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
