import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Appointment,
  BoutiqueSettings,
  ImageSlots,
  ServiceItem,
  CalendarTimeSlot,
  RealtimeMessage,
} from '../types';
import { syncAppointmentToGoogleCalendar, getCachedCalendarToken } from '../lib/googleCalendar';
import {
  defaultSettings,
  defaultImageSlots,
  defaultServices,
  defaultCalendarSlots,
  defaultAppointments,
} from '../data/initialData';

interface BoutiqueContextType {
  settings: BoutiqueSettings;
  imageSlots: ImageSlots;
  services: ServiceItem[];
  calendarSlots: CalendarTimeSlot[];
  appointments: Appointment[];
  isLoading: boolean;
  isConnected: boolean;
  isSupabaseActive: boolean;
  isAdmin: boolean;
  isAdminModalOpen: boolean;
  adminInitialTab: 'info' | 'colors' | 'images' | 'services' | 'slots' | 'supabase';
  isBookingModalOpen: boolean;
  selectedServiceForBooking: ServiceItem | null;
  isSearchOpen: boolean;
  isFavoritesOpen: boolean;
  favoriteServiceIds: string[];
  openSearch: () => void;
  closeSearch: () => void;
  openFavorites: () => void;
  closeFavorites: () => void;
  toggleFavorite: (serviceId: string) => void;
  canUndo: boolean;
  undoLastChange: () => Promise<boolean>;
  openBookingForService: (service?: ServiceItem) => void;
  closeBooking: () => void;
  openAdmin: (initialTab?: 'info' | 'colors' | 'images' | 'services' | 'slots' | 'supabase' | any) => void;
  closeAdmin: () => void;
  verifyPin: (pin: string) => Promise<boolean>;
  logoutAdmin: () => void;
  createAppointment: (data: Omit<Appointment, 'id' | 'status' | 'created_at'>) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  updateSettings: (newSettings: Partial<BoutiqueSettings>) => Promise<void>;
  updateImageSlots: (newSlots: Partial<ImageSlots>) => Promise<void>;
  updateServices: (newServices: ServiceItem[]) => Promise<void>;
  updateCalendarSlots: (newSlots: CalendarTimeSlot[]) => Promise<void>;
  testSupabase: (url: string, key: string) => Promise<{ success: boolean; message: string }>;
  sendWhatsAppDirect: (customText?: string) => void;
}

const BoutiqueContext = createContext<BoutiqueContextType | undefined>(undefined);

export const BoutiqueProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BoutiqueSettings>(() => {
    try {
      const local = localStorage.getItem('mt_settings_cache');
      return local ? { ...defaultSettings, ...JSON.parse(local) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });
  const [imageSlots, setImageSlots] = useState<ImageSlots>(() => {
    try {
      const local = localStorage.getItem('mt_imageslots_cache');
      return local ? { ...defaultImageSlots, ...JSON.parse(local) } : defaultImageSlots;
    } catch {
      return defaultImageSlots;
    }
  });
  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const local = localStorage.getItem('mt_services_cache');
      return local ? JSON.parse(local) : defaultServices;
    } catch {
      return defaultServices;
    }
  });
  const [calendarSlots, setCalendarSlots] = useState<CalendarTimeSlot[]>(() => {
    try {
      const local = localStorage.getItem('mt_slots_cache');
      return local ? JSON.parse(local) : defaultCalendarSlots;
    } catch {
      return defaultCalendarSlots;
    }
  });
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const local = localStorage.getItem('mt_appointments_cache');
      return local ? JSON.parse(local) : defaultAppointments;
    } catch {
      return defaultAppointments;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isSupabaseActive, setIsSupabaseActive] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('mt_admin_auth') === 'true';
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [adminInitialTab, setAdminInitialTab] = useState<
    'info' | 'colors' | 'images' | 'services' | 'slots' | 'supabase'
  >('info');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<ServiceItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState<boolean>(false);
  const [favoriteServiceIds, setFavoriteServiceIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mt_favorite_services');
      return saved ? JSON.parse(saved) : ['nails-essential', 'lashes-classic'];
    } catch {
      return ['nails-essential', 'lashes-classic'];
    }
  });

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);
  const openFavorites = () => setIsFavoritesOpen(true);
  const closeFavorites = () => setIsFavoritesOpen(false);

  const toggleFavorite = (serviceId: string) => {
    setFavoriteServiceIds((prev) => {
      const next = prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId];
      try {
        localStorage.setItem('mt_favorite_services', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Undo History Snapshot Stack
  const [historyStack, setHistoryStack] = useState<
    Array<{
      settings: BoutiqueSettings;
      imageSlots: ImageSlots;
      services: ServiceItem[];
      calendarSlots: CalendarTimeSlot[];
    }>
  >([]);

  const pushHistorySnapshot = useCallback(() => {
    setHistoryStack((prev) => [
      ...prev.slice(-15),
      { settings, imageSlots, services, calendarSlots },
    ]);
  }, [settings, imageSlots, services, calendarSlots]);

  // Client Supabase instance
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);

  // Initialize Supabase if credentials exist
  useEffect(() => {
    if (settings.supabase_url && settings.supabase_anon_key) {
      try {
        const client = createClient(settings.supabase_url, settings.supabase_anon_key);
        setSupabaseClient(client);
        setIsSupabaseActive(true);

        // Supabase Postgres changes listener
        const channel = client
          .channel('public:appointments')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'appointments' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newApt = payload.new as Appointment;
                setAppointments((prev) => {
                  if (prev.some((a) => a.id === newApt.id)) return prev;
                  return [newApt, ...prev];
                });
              } else if (payload.eventType === 'UPDATE') {
                const updatedApt = payload.new as Appointment;
                setAppointments((prev) =>
                  prev.map((a) => (a.id === updatedApt.id ? updatedApt : a))
                );
              }
            }
          )
          .subscribe();

        return () => {
          client.removeChannel(channel);
        };
      } catch (err) {
        console.warn('Supabase client initialization warning:', err);
        setIsSupabaseActive(false);
      }
    } else {
      setSupabaseClient(null);
      setIsSupabaseActive(false);
    }
  }, [settings.supabase_url, settings.supabase_anon_key]);

  // Initial Bootstrap from Server
  const fetchBootstrap = useCallback(async () => {
    try {
      const res = await fetch('/api/bootstrap');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSettings(json.data.settings);
          setImageSlots(json.data.imageSlots);
          setServices(json.data.services);
          setCalendarSlots(json.data.calendarSlots);
          setAppointments(json.data.appointments);
          try {
            localStorage.setItem('mt_settings_cache', JSON.stringify(json.data.settings));
            localStorage.setItem('mt_imageslots_cache', JSON.stringify(json.data.imageSlots));
            localStorage.setItem('mt_services_cache', JSON.stringify(json.data.services));
            localStorage.setItem('mt_slots_cache', JSON.stringify(json.data.calendarSlots));
            localStorage.setItem('mt_appointments_cache', JSON.stringify(json.data.appointments));
          } catch (e) {}
          if (json.hasSupabase) {
            setIsSupabaseActive(true);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching bootstrap data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBootstrap();
  }, [fetchBootstrap]);

  // WebSocket Connection for instant cross-tab real-time sync
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const msg: RealtimeMessage = JSON.parse(event.data);
            handleRealtimeMessage(msg);
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Try reconnecting after 3 seconds
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = () => {
          setIsConnected(false);
          ws?.close();
        };
      } catch (e) {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  // Handle incoming real-time messages
  const handleRealtimeMessage = (msg: RealtimeMessage) => {
    switch (msg.type) {
      case 'INIT_STATE':
        if (msg.data) {
          if (msg.data.settings) setSettings((prev) => ({ ...defaultSettings, ...prev, ...msg.data.settings }));
          if (msg.data.imageSlots) setImageSlots((prev) => ({ ...defaultImageSlots, ...prev, ...msg.data.imageSlots }));
          if (Array.isArray(msg.data.services)) setServices(msg.data.services);
          if (Array.isArray(msg.data.calendarSlots)) setCalendarSlots(msg.data.calendarSlots);
          if (Array.isArray(msg.data.appointments)) setAppointments(msg.data.appointments);
        }
        break;

      case 'APPOINTMENT_CREATED':
        if (msg.data && msg.data.id) {
          setAppointments((prev) => {
            if (prev.some((a) => a.id === msg.data.id)) return prev;
            return [msg.data, ...prev];
          });
        }
        break;

      case 'APPOINTMENT_UPDATED':
        if (msg.data && msg.data.id) {
          setAppointments((prev) =>
            prev.map((a) => (a.id === msg.data.id ? msg.data : a))
          );
        }
        break;

      case 'SETTINGS_UPDATED':
        if (msg.data) setSettings((prev) => ({ ...prev, ...msg.data }));
        break;

      case 'IMAGES_UPDATED':
        if (msg.data) setImageSlots((prev) => ({ ...prev, ...msg.data }));
        break;

      case 'SERVICES_UPDATED':
        if (Array.isArray(msg.data)) setServices(msg.data);
        break;

      case 'SLOTS_UPDATED':
        if (Array.isArray(msg.data)) setCalendarSlots(msg.data);
        break;

      default:
        break;
    }
  };

  // Actions
  const openBookingForService = (service?: ServiceItem) => {
    setSelectedServiceForBooking(service || services[0] || null);
    setIsBookingModalOpen(true);
  };

  const closeBooking = () => {
    setIsBookingModalOpen(false);
    setSelectedServiceForBooking(null);
  };

  const openAdmin = (initialTab?: unknown) => {
    if (typeof initialTab === 'string' && initialTab !== 'whatsapp') {
      setAdminInitialTab(initialTab as any);
    } else {
      setAdminInitialTab('info');
    }
    setIsAdminModalOpen(true);
  };

  const closeAdmin = () => {
    setIsAdminModalOpen(false);
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAdmin(true);
        sessionStorage.setItem('mt_admin_auth', 'true');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('mt_admin_auth');
  };

  const createAppointment = async (
    data: Omit<Appointment, 'id' | 'status' | 'created_at'>
  ): Promise<Appointment> => {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create appointment');
    }

    const json = await res.json();
    const createdApt = json.appointment;

    if (settings.calendar_sync_enabled !== false) {
      try {
        await syncAppointmentToGoogleCalendar(
          createdApt,
          getCachedCalendarToken(),
          settings.calendar_reminder_min || 30
        );
      } catch (calErr) {
        console.warn('Google Calendar sync warning:', calErr);
      }
    }

    return createdApt;
  };

  const updateAppointmentStatus = async (
    id: string,
    status: Appointment['status']
  ): Promise<void> => {
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      throw new Error('Failed to update status');
    }
  };

  const undoLastChange = async (): Promise<boolean> => {
    if (historyStack.length === 0) return false;
    const lastSnapshot = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));

    try {
      await Promise.all([
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lastSnapshot.settings),
        }),
        fetch('/api/image-slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lastSnapshot.imageSlots),
        }),
        fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ services: lastSnapshot.services }),
        }),
        fetch('/api/slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slots: lastSnapshot.calendarSlots }),
        }),
      ]);
      setSettings(lastSnapshot.settings);
      setImageSlots(lastSnapshot.imageSlots);
      setServices(lastSnapshot.services);
      setCalendarSlots(lastSnapshot.calendarSlots);
      return true;
    } catch {
      return false;
    }
  };

  const updateSettings = async (newSettings: Partial<BoutiqueSettings>): Promise<void> => {
    pushHistorySnapshot();
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });

    if (!res.ok) {
      throw new Error('Failed to update settings');
    }
    
    // Update local state immediately for better UX
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateImageSlots = async (newSlots: Partial<ImageSlots>): Promise<void> => {
    pushHistorySnapshot();
    const res = await fetch('/api/image-slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSlots),
    });

    if (!res.ok) {
      throw new Error('Failed to update image slots');
    }

    // Update local state immediately
    setImageSlots((prev) => ({ ...prev, ...newSlots }));
  };

  const updateServices = async (newServices: ServiceItem[]): Promise<void> => {
    pushHistorySnapshot();
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ services: newServices }),
    });

    if (!res.ok) {
      throw new Error('Failed to update services');
    }

    // Update local state immediately
    setServices(newServices);
  };

  const updateCalendarSlots = async (newSlots: CalendarTimeSlot[]): Promise<void> => {
    pushHistorySnapshot();
    const res = await fetch('/api/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slots: newSlots }),
    });

    if (!res.ok) {
      throw new Error('Failed to update calendar slots');
    }

    // Update local state immediately
    setCalendarSlots(newSlots);
  };

  const testSupabase = async (
    url: string,
    key: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await fetch('/api/test-supabase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, key }),
    });

    const json = await res.json();
    return {
      success: json.success,
      message: json.message || (json.success ? 'Connected' : 'Connection failed'),
    };
  };

  const sendWhatsAppDirect = (customText?: string) => {
    const cleanNumber = settings.whatsapp_number.replace(/[^0-9]/g, '');
    const message = customText || settings.whatsapp_default_message;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <BoutiqueContext.Provider
      value={{
        settings,
        imageSlots,
        services,
        calendarSlots,
        appointments,
        isLoading,
        isConnected,
        isSupabaseActive,
        isAdmin,
        isAdminModalOpen,
        adminInitialTab,
        isBookingModalOpen,
        selectedServiceForBooking,
        isSearchOpen,
        isFavoritesOpen,
        favoriteServiceIds,
        openSearch,
        closeSearch,
        openFavorites,
        closeFavorites,
        toggleFavorite,
        canUndo: historyStack.length > 0,
        undoLastChange,
        openBookingForService,
        closeBooking,
        openAdmin,
        closeAdmin,
        verifyPin,
        logoutAdmin,
        createAppointment,
        updateAppointmentStatus,
        updateSettings,
        updateImageSlots,
        updateServices,
        updateCalendarSlots,
        testSupabase,
        sendWhatsAppDirect,
      }}
    >
      {children}
    </BoutiqueContext.Provider>
  );
};

export const useBoutique = () => {
  const context = useContext(BoutiqueContext);
  if (!context) {
    throw new Error('useBoutique must be used within a BoutiqueProvider');
  }
  return context;
};
