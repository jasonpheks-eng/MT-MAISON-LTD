export interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  service_id: string;
  service_title: string;
  category: 'nails' | 'lashes' | 'hair';
  date: string; // YYYY-MM-DD
  time_slot: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}

export interface BoutiqueSettings {
  whatsapp_number: string;
  boutique_name: string;
  tagline: string;
  address: string;
  city_region: string;
  opening_hours: string;
  instagram_url: string;
  tiktok_url: string;
  pinterest_url: string;
  whatsapp_default_message: string;
  supabase_url: string;
  supabase_anon_key: string;
  currency_symbol: string;
  currency_code: string;
  hero_bg_color: string;
  hero_accent_color?: string;
  navbar_bg_color?: string;
  navbar_text_color?: string;
  details_bg_color?: string;
  details_text_color?: string;
  services_bg_color?: string;
  services_card_bg_color?: string;
  booking_bg_color?: string;
  booking_card_bg_color?: string;
  booking_accent_color?: string;
  about_bg_color?: string;
  about_text_color?: string;
  experiences_bg_color?: string;
  footer_bg_color?: string;
  footer_text_color?: string;
  ceo_google_email?: string;
  calendar_sync_enabled?: boolean;
  calendar_reminder_min?: number;
}

export type ImageBorderStyle =
  | 'none'
  | 'soft-translucent'
  | 'blend-in'
  | 'ambient-glow'
  | 'glass-card';

export type ImageCornerStyle = 'rounded' | 'pill' | 'full' | 'sharp';

export interface SingleImageConfig {
  aspectRatio?: '4/5' | '1/1' | '4/3' | '16/9' | '3/4' | 'auto';
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  objectFit?: 'cover' | 'contain' | 'fill';
  flipH?: boolean;
  flipV?: boolean;
  removeBg?: boolean;
  borderStyle?: ImageBorderStyle;
  cornerStyle?: ImageCornerStyle;
  scale?: number;
}

export interface ImageSlots {
  logo_url: string;
  hero_image: string;
  services_feature: string;
  service_nails: string;
  service_lashes: string;
  service_hair: string;
  about_image: string;
  hero_secondary_image: string;
  experience_gallery: string[];
  configs?: Record<string, SingleImageConfig>;
}

export interface ServiceItem {
  id: string;
  category: 'nails' | 'lashes' | 'hair';
  number: string;
  title: string;
  description: string;
  price: number;
  duration_min: number;
  is_active: boolean;
  is_popular?: boolean;
}

export interface CalendarTimeSlot {
  time: string;
  period: 'morning' | 'afternoon' | 'evening';
  is_available: boolean;
}

export interface RealtimeMessage {
  type:
    | 'APPOINTMENT_CREATED'
    | 'APPOINTMENT_UPDATED'
    | 'SETTINGS_UPDATED'
    | 'IMAGES_UPDATED'
    | 'SERVICES_UPDATED'
    | 'SLOTS_UPDATED'
    | 'INIT_STATE';
  data: any;
  timestamp: number;
}
