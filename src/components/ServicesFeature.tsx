import React from 'react';
import { useBoutique } from '../context/BoutiqueContext';
import { ArrowUpRight } from 'lucide-react';

export const ServicesFeature: React.FC = () => {
  const { services, openBookingForService, settings } = useBoutique();

  const safeServices = services || [];
  // Pick nail services or fallback to first 4 services
  const nailServices = safeServices.filter((s) => s.category === 'nails');
  const displayServices = nailServices.length >= 4 ? nailServices.slice(0, 4) : safeServices.slice(0, 4);

  return (
    <section id="services" className="relative bg-[#C45266] text-white overflow-hidden scroll-mt-16">
      <div className="max-w-5xl mx-auto px-6 sm:px-12 lg:px-16 py-16 lg:py-24">
        <div>
            <span className="text-xs font-semibold tracking-[0.25em] uppercase text-rose-200">
              The Services
            </span>

            <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.12] mt-4 mb-10 text-white">
              Your nails. <br />
              <span className="italic font-light">Your kind of beautiful.</span>
            </h2>

            {/* Service Items List */}
            <div className="divide-y divide-white/20 border-t border-b border-white/20">
              {displayServices.map((service, index) => {
                const numberStr = service.number || `0${index + 1}`;
                return (
                  <div
                    key={service.id}
                    onClick={() => openBookingForService(service)}
                    className="py-6 group cursor-pointer transition-all hover:bg-white/5 px-2 -mx-2 rounded-lg"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="flex items-baseline gap-4 sm:gap-6">
                        <span className="text-xs sm:text-sm font-mono text-rose-200 font-light select-none">
                          {numberStr}
                        </span>
                        <div>
                          <h3 className="text-lg sm:text-xl font-medium tracking-wide group-hover:text-rose-100 transition-colors flex items-center gap-2">
                            <span>{service.title}</span>
                            {service.is_popular && (
                              <span className="inline-flex items-center text-[10px] font-sans uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/20 text-white">
                                Popular
                              </span>
                            )}
                          </h3>
                          <p className="text-xs sm:text-sm text-rose-100/90 font-light mt-1.5 max-w-xl leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="text-sm font-mono font-medium">{settings.currency_symbol || 'MWK'} {service.price ? service.price.toLocaleString() : '0'}</span>
                          <span className="block text-[11px] text-rose-200 font-mono">
                            {service.duration_min} min
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-[#C45266] transition-all">
                          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        {/* Bottom Clarification Note */}
        <div className="pt-8 text-xs sm:text-sm text-rose-100/80 font-light leading-relaxed">
          Not sure what to choose? Share your ideas when you enquire. Service options, timing and pricing can be confirmed before booking.
        </div>
      </div>
    </section>
  );
};
