import React, { useState, useMemo } from 'react';
import { useBoutique } from '../context/BoutiqueContext';
import { ServiceItem } from '../types';
import {
  Clock,
  CheckCircle,
  MessageCircle,
  User,
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Eye,
  Scissors,
  Layers,
  X,
} from 'lucide-react';

const NailIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3h6v4H9z" />
    <path d="M10 7v3a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V7" />
    <path d="M8 12h8a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z" />
    <circle cx="12" cy="16" r="1.5" fill="currentColor" />
  </svg>
);

const LashIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M3 7.5L1.5 5.5" />
    <path d="M7 4.5L6 2" />
    <path d="M12 3.5V1" />
    <path d="M17 4.5l1-2.5" />
    <path d="M21 7.5l1.5-2" />
  </svg>
);

const HairIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

const getCategoryIcon = (category?: string, className = "w-4 h-4") => {
  switch (category?.toLowerCase()) {
    case 'nails':
      return <NailIcon className={className} />;
    case 'lashes':
      return <LashIcon className={className} />;
    case 'hair':
      return <HairIcon className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};

export const BookingSection: React.FC = () => {
  const {
    services,
    calendarSlots,
    createAppointment,
    removeAppointment,
    settings,
    selectedServiceForBooking,
    appointments,
  } = useBoutique();

  // Collapsible Treatment Selection Menu
  const [isTreatmentMenuOpen, setIsTreatmentMenuOpen] = useState<boolean>(false);
  const [isItineraryOpen, setIsItineraryOpen] = useState<boolean>(false);

  // Category Filter for Treatments
  const [activeCategory, setActiveCategory] = useState<'all' | 'nails' | 'lashes' | 'hair'>('all');

  // Filtered Services List from Admin State
  const filteredServices = useMemo(() => {
    const list = services || [];
    if (activeCategory === 'all') return list;
    return list.filter((s) => s.category === activeCategory);
  }, [services, activeCategory]);

  // Selected Service
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    (services && services[0]?.id) || ''
  );

  React.useEffect(() => {
    if (selectedServiceForBooking?.id) {
      setSelectedServiceId(selectedServiceForBooking.id);
      if (selectedServiceForBooking.category) {
        setActiveCategory(selectedServiceForBooking.category as any);
      }
    }
  }, [selectedServiceForBooking]);

  const selectedService = useMemo(() => {
    const list = services || [];
    return list.find((s) => s.id === selectedServiceId) || list[0] || null;
  }, [services, selectedServiceId]);

  // Calendar Month State (defaults to November 2026)
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date(2026, 10, 1));

  const prevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  const formatDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const monthDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const startingDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // 0: Mon, 6: Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      days.push(dateObj);
    }
    return days;
  }, [currentMonthDate]);

  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const [selectedDate, setSelectedDate] = useState<string>('2026-11-12');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('02:30 PM');

  const activeSlots = useMemo(() => {
    return (calendarSlots || []).filter((s) => s.is_available !== false);
  }, [calendarSlots]);

  React.useEffect(() => {
    if (activeSlots.length > 0 && !activeSlots.some((s) => s.time === selectedTimeSlot)) {
      setSelectedTimeSlot(activeSlots[0].time);
    }
  }, [activeSlots, selectedTimeSlot]);

  // Form Fields
  const [clientName, setClientName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Status State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Formatted Selected Date Label
  const selectedDateLabel = useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // Submission Handler
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !selectedService) {
      setErrorMessage('Please enter your name.');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);

    const waWindow = window.open('', '_blank');

    try {
      const appointment = await createAppointment({
        client_name: clientName.trim(),
        client_phone: 'WhatsApp Direct',
        service_id: selectedService.id,
        service_title: selectedService.title,
        category: selectedService.category,
        date: selectedDate,
        time_slot: selectedTimeSlot,
        notes: notes.trim(),
      });

      setConfirmedBooking(appointment);
      setIsItineraryOpen(true);

      // Scroll to My Bookings section
      const itinerarySection = document.getElementById('my-bookings-section');
      if (itinerarySection) {
        itinerarySection.scrollIntoView({ behavior: 'smooth' });
      }

      // WhatsApp deep link format
      const cleanNumber = settings.whatsapp_number.replace(/[^0-9]/g, '');
      const sym = settings.currency_symbol || 'MWK';
      const waText =
        `✨ *MT MANSION APPOINTMENT REQUEST* ✨\n\n` +
        `👤 *Client:* ${appointment.client_name}\n` +
        `💅 *Treatment:* ${appointment.service_title} (${sym} ${selectedService.price ? selectedService.price.toLocaleString() : 0})\n` +
        `📅 *Date:* ${appointment.date}\n` +
        `⏰ *Time:* ${appointment.time_slot}\n` +
        (appointment.notes ? `📝 *Notes:* ${appointment.notes}\n` : '') +
        `🔖 *Ref:* ${appointment.id}\n\n` +
        `Please confirm my booking slot. Thank you!`;

      const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(waText)}`;
      if (waWindow) {
        waWindow.location.href = waUrl;
      } else {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Booking submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section 
      id="booking" 
      className="text-white py-16 lg:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-16 transition-colors duration-300"
      style={{ backgroundColor: settings.booking_bg_color || '#5b0827' }}
    >
      <div className="max-w-6xl mx-auto">
        
        {/* Simple Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-[0.25em] uppercase text-rose-300">
            Fast Boutique Reservation
          </span>
          <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal text-white mt-2">
            Make a Booking
          </h2>
          <p className="mt-3 text-sm text-rose-100/80 font-light">
            Select your desired treatment, choose a date on the boutique calendar, and confirm your request instantly on WhatsApp.
          </p>
        </div>

        {confirmedBooking ? (
          /* Simplified Confirmation Card */
          <div 
            className="max-w-xl mx-auto rounded-3xl p-8 border border-rose-400/30 shadow-2xl text-center space-y-6 animate-in fade-in"
            style={{ backgroundColor: settings.booking_card_bg_color || '#2E1222' }}
          >
            <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-rose-300" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-rose-300">
                Booking Ref #{confirmedBooking.id}
              </span>
              <h3 className="font-editorial text-3xl text-white mt-1">
                Appointment Requested!
              </h3>
              <p className="text-rose-100/90 text-sm mt-2">
                We've reserved <strong className="text-white">{confirmedBooking.service_title}</strong> for you on <strong className="text-white">{confirmedBooking.date}</strong> at <strong className="text-white">{confirmedBooking.time_slot}</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  const cleanNumber = settings.whatsapp_number.replace(/[^0-9]/g, '');
                  const waText = `Hello MT Mansion! Inquiring about booking ref ${confirmedBooking.id} for ${confirmedBooking.service_title}.`;
                  window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(waText)}`, '_blank');
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open WhatsApp ↗</span>
              </button>
              <button
                onClick={() => {
                  setConfirmedBooking(null);
                  setClientName('');
                  setNotes('');
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-white/20 hover:bg-white/10 text-white text-xs transition-colors"
              >
                Book Another
              </button>
            </div>
          </div>
        ) : (
          /* Streamlined 2-Column Booking Layout with Visual Calendar */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Calendar Date Selection first, then Treatment Selection */}
            <div 
              className="lg:col-span-7 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6 transition-colors duration-300"
              style={{ backgroundColor: settings.booking_card_bg_color || '#2E1222' }}
            >
              
              {/* Step 1: The Visual Calendar & Time Slots */}
              <div className="space-y-4">
                
                {/* Calendar Month Header & Controls */}
                <div className="pb-2 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-rose-300" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-200">
                      1. SELECT DATE
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-editorial font-medium text-white tracking-wide">
                      {monthName}
                    </span>
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                      aria-label="Previous Month"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                      aria-label="Next Month"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Weekday Column Headers */}
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-mono text-rose-300/70 uppercase">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5 p-2 rounded-2xl bg-black/30 border border-white/10">
                  {monthDays.map((d, index) => {
                    if (!d) {
                      return <div key={`empty-${index}`} className="h-9 sm:h-10" />;
                    }
                    const dateKey = formatDateKey(d);
                    const isSelected = selectedDate === dateKey;
                    const isPast = d < new Date(2026, 10, 5); // disable past demo dates

                    return (
                      <button
                        key={dateKey}
                        type="button"
                        disabled={isPast}
                        onClick={() => setSelectedDate(dateKey)}
                        className={`h-9 sm:h-10 rounded-xl flex flex-col items-center justify-center font-mono text-xs sm:text-sm transition-all ${
                          isSelected
                            ? 'bg-[#C45266] text-white font-bold shadow-lg scale-105 ring-2 ring-white/60'
                            : isPast
                            ? 'text-white/20 cursor-not-allowed'
                            : 'text-rose-100 hover:bg-white/15 hover:text-white'
                        }`}
                      >
                        <span>{d.getDate()}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Time Slot Selection */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-rose-300 mb-2 font-medium">
                    <span>Available Slots on {selectedDateLabel}:</span>
                    <span className="text-white font-bold">{selectedTimeSlot}</span>
                  </div>

                  {activeSlots.length === 0 ? (
                    <div className="py-5 px-4 rounded-2xl bg-black/30 border border-white/10 text-center text-xs text-rose-200/70">
                      No online slots currently open for this date. Please message us on WhatsApp for personal scheduling.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {activeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => setSelectedTimeSlot(slot.time)}
                          className={`py-2 px-2.5 rounded-xl font-mono text-xs border text-center transition-all ${
                            selectedTimeSlot === slot.time
                              ? 'bg-[#C45266] text-white border-white font-bold shadow'
                              : 'bg-black/25 border-white/10 text-rose-200 hover:border-rose-400/40'
                          }`}
                          style={{ fontFamily: 'Verdana, sans-serif' }}
                        >
                          <Clock className="w-3 h-3 inline mr-1 opacity-70" />
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Step 2: Treatment Selection Header */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-200">
                      2. Select Treatment
                    </h3>
                    <span className="text-[11px] text-rose-300/70">
                      Choose your preferred beauty service
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsTreatmentMenuOpen(!isTreatmentMenuOpen)}
                    className="px-3.5 py-1.5 rounded-full bg-[#C45266] hover:bg-[#b04356] text-white text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>{isTreatmentMenuOpen ? 'Hide Menu' : 'Browse Treatments'}</span>
                    {isTreatmentMenuOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Selected Treatment Display Card (Clickable) */}
                <div
                  onClick={() => setIsTreatmentMenuOpen(!isTreatmentMenuOpen)}
                  className="p-3.5 sm:p-4 rounded-2xl bg-black/40 hover:bg-black/55 border border-white/20 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-md"
                  title="Click to view all treatments"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#C45266] text-white flex items-center justify-center shrink-0 shadow">
                      {getCategoryIcon(selectedService?.category, "w-5 h-5 text-rose-200")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-rose-300 font-semibold">
                          Chosen Treatment
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-white truncate mt-0.5 group-hover:text-rose-200 transition-colors">
                        {selectedService ? selectedService.title : 'Choose a treatment'}
                      </h4>
                      <div className="text-xs text-rose-200/90 font-mono mt-0.5 flex flex-wrap items-center gap-x-2">
                        {selectedService ? (
                          <>
                            <span className="font-bold text-white">{settings.currency_symbol || 'MWK'} {selectedService.price ? selectedService.price.toLocaleString() : 0}</span>
                            <span className="opacity-40">·</span>
                            <span>{selectedService.duration_min} mins</span>
                            {selectedService.description && (
                              <>
                                <span className="opacity-40">·</span>
                                <span className="font-sans text-rose-100/70 truncate max-w-[180px] sm:max-w-xs">
                                  {selectedService.description}
                                </span>
                              </>
                            )}
                          </>
                        ) : (
                          <span>Click to view and select from boutique menu</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10 shrink-0">
                    {selectedService && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedServiceId('');
                          setIsTreatmentMenuOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-black/40 hover:bg-red-950/60 text-rose-300 hover:text-red-200 text-xs font-medium border border-white/10 transition-all flex items-center gap-1"
                        title="Clear selected treatment"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Deselect</span>
                      </button>
                    )}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 group-hover:bg-white/20 text-rose-200 text-xs font-medium transition-all">
                      <span>{isTreatmentMenuOpen ? 'Close' : 'Change'}</span>
                      {isTreatmentMenuOpen ? (
                        <ChevronUp className="w-4 h-4 text-rose-300" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-rose-300" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Collapsible Treatments Menu - Shows on click */}
                {isTreatmentMenuOpen && (
                  <div className="space-y-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-200 border-t border-white/10 pt-4">
                    {/* Category Filter Pills with Distinct Icons for Nails, Lashes, Hair */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                      {[
                        { id: 'all', label: 'All Treatments', icon: <Layers className="w-3.5 h-3.5" /> },
                        { id: 'nails', label: 'Nails', icon: <NailIcon className="w-3.5 h-3.5 text-rose-300" /> },
                        { id: 'lashes', label: 'Lashes', icon: <LashIcon className="w-3.5 h-3.5 text-rose-300" /> },
                        { id: 'hair', label: 'Wig Installation', icon: <HairIcon className="w-3.5 h-3.5 text-rose-300" /> },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setActiveCategory(cat.id as any)}
                          className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-all ${
                            activeCategory === cat.id
                              ? 'bg-[#C45266] text-white font-semibold shadow ring-2 ring-white/20'
                              : 'bg-black/30 text-rose-200/80 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {cat.icon}
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Treatments Selection List */}
                    <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                      {filteredServices.length === 0 ? (
                        <div className="py-8 text-center text-rose-300/60 text-xs">
                          No treatments currently listed in this category.
                        </div>
                      ) : (
                        filteredServices.map((service) => {
                          const isSelected = selectedService?.id === service.id;
                          return (
                            <button
                              key={service.id}
                              type="button"
                              onClick={() => {
                                setSelectedServiceId(service.id);
                                setIsTreatmentMenuOpen(false); // Collapses menu to show chosen treatment!
                              }}
                              className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                isSelected
                                  ? 'bg-[#C45266] border-white text-white shadow-md ring-2 ring-white/30'
                                  : 'bg-black/25 border-white/10 text-rose-100 hover:border-rose-400/40 hover:bg-black/35'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-black/40 text-rose-300'}`}>
                                  {getCategoryIcon(service.category, "w-4 h-4")}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-sm text-white truncate">
                                      {service.title}
                                    </h4>
                                    {service.is_popular && (
                                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/20 text-white font-sans shrink-0">
                                        Popular
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-rose-100/70 truncate mt-0.5 font-light">
                                    {service.description || `${service.duration_min} mins treatment`}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <div className="text-right font-mono">
                                  <span className="text-sm font-bold text-white">{settings.currency_symbol || 'MWK'} {service.price ? service.price.toLocaleString() : 0}</span>
                                  <span className="block text-[10px] text-rose-200 opacity-80">{service.duration_min}m</span>
                                </div>
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                    isSelected
                                      ? 'bg-white text-[#C45266] border-white'
                                      : 'border-white/30 bg-transparent'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3.5 h-3.5" />}
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Reservation Details & WhatsApp Request */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#b43859] to-[#701932] rounded-3xl p-8 border border-white/20 shadow-2xl backdrop-blur-sm space-y-6">
              
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-100">
                  3. Your Details
                </h3>
                <p className="text-xs text-rose-200/70 mt-1">
                  We'll prepare your request and open WhatsApp directly with all details filled in.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-900/40 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-rose-200 mb-1 font-medium">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-neutral-600" />
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Sophia Vance"
                      className="w-full bg-[#fff7f7] text-[#000000] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder-neutral-500 focus:outline-none focus:border-rose-400"
                    />
                  </div>
                </div>



                <div>
                  <label className="block text-xs uppercase tracking-wider text-rose-200 mb-1 font-medium">
                    Styling Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Soft almond shape, French chrome line..."
                    className="w-full bg-[#fffcfc] text-[#000000] border border-white/15 rounded-xl px-4 py-2.5 text-xs placeholder-neutral-500 focus:outline-none focus:border-rose-400"
                  />
                </div>

                {/* Live Selection Summary */}
                {selectedService && (
                  <div className="p-4 rounded-2xl bg-[#3f0622] border border-white/10 text-xs space-y-2">
                    <div className="flex justify-between text-rose-200">
                      <span className="uppercase tracking-widest text-[9px] opacity-60">Service</span>
                      <span className="text-white font-medium">{selectedService.title}</span>
                    </div>
                    <div className="flex justify-between text-rose-200">
                      <span className="uppercase tracking-widest text-[9px] opacity-60">Schedule</span>
                      <span className="text-white">{selectedDateLabel} @ {selectedTimeSlot}</span>
                    </div>
                    <div className="flex justify-between text-rose-200 pt-2 border-t border-white/5">
                      <span className="uppercase tracking-widest text-[9px] opacity-60 font-bold">Total Fee</span>
                      <span className="text-white font-bold text-sm">{settings.currency_symbol || 'MWK'} {selectedService.price ? selectedService.price.toLocaleString() : 0}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-full bg-[#5ac452] hover:bg-[#4ea847] text-white font-medium text-sm tracking-wide transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
                >
                  <MessageCircle className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                  <span>{isSubmitting ? 'Securing Slot...' : 'Request via WhatsApp ↗'}</span>
                </button>
              </form>

              {/* Step 4: My Bookings */}
              {appointments.length > 0 && (
                <div id="my-bookings-section" className="pt-6 border-t border-white/10">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-200 mb-4">
                    4. My Bookings
                  </h3>
                  <div className="space-y-3">
                    {appointments.slice(0, 2).map((apt) => (
                      <div key={apt.id} className="p-4 rounded-2xl bg-[#3f0622] border border-white/10 text-xs text-rose-200 relative group">
                        <div className="flex justify-between font-medium text-white mb-1 pr-6">
                          <span>{apt.service_title}</span>
                          <button
                            onClick={() => removeAppointment(apt.id)}
                            className="absolute top-4 right-4 text-rose-300 hover:text-white transition-colors"
                            title="Delete booking"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="opacity-80">
                          {apt.date} at {apt.time_slot}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </section>
  );
};
