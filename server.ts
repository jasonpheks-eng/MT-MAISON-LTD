import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import {
  Appointment,
  BoutiqueSettings,
  ImageSlots,
  ServiceItem,
  CalendarTimeSlot,
  RealtimeMessage,
} from './src/types';

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Data Directory
const isVercel = Boolean(process.env.VERCEL);
const dataDir = isVercel ? path.resolve('/tmp', 'data') : path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const storeFilePath = path.join(dataDir, 'boutique_store.json');

// Default Initial Data matching Figma design
const defaultSettings: BoutiqueSettings = {
  whatsapp_number: '+1 (555) 382-9014',
  boutique_name: 'MT Mansion',
  tagline: 'Where Beauty Meets Elegance',
  address: '142 Luxury Lane, Suite 4B',
  city_region: 'Mayfair, London',
  opening_hours: 'Tue – Sat: 10:00 AM – 7:30 PM | Sun: 11:00 AM – 5:00 PM',
  currency_symbol: 'MWK',
  currency_code: 'MWK',
  instagram_url: 'https://instagram.com',
  tiktok_url: 'https://tiktok.com',
  pinterest_url: 'https://pinterest.com',
  whatsapp_default_message:
    'Hello MT Mansion! I would like to inquire about booking an appointment for bespoke beauty styling.',
  supabase_url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://hoeztqucwukrqelltlsm.supabase.co',
  supabase_anon_key: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_8DUKtlDn88mv3gnt9VujNA_faCE03Wk',
  hero_bg_color: '#701932',
  hero_accent_color: '#ea297e',
  navbar_bg_color: '#000000',
  navbar_text_color: '#ea297e',
  details_bg_color: '#501D2C',
  details_text_color: '#E5B8C0',
  services_bg_color: '#501D2C',
  services_card_bg_color: '#3B1622',
  booking_bg_color: '#5b0827',
  booking_card_bg_color: '#2E1222',
  booking_accent_color: '#C45266',
  about_bg_color: '#240F1B',
  about_text_color: '#FBF8F6',
  experiences_bg_color: '#180711',
  footer_bg_color: '#1A0A13',
  footer_text_color: '#FBF8F6',
  ceo_google_email: 'ceo@mtmansion.com',
  calendar_sync_enabled: true,
  calendar_reminder_min: 30,
};

const defaultImageSlots: ImageSlots = {
  logo_url: '/assets/aistudio/Black_and_White_Minimalist_Initials_Logo__1__19e0d52a.jpg',
  hero_image: '/assets/boutique/hero_hand_mt.png',
  services_feature: '/assets/boutique/services_polish_hands.png',
  service_nails: '/assets/boutique/service_nails.png',
  service_lashes: '/assets/boutique/service_lashes.png',
  service_hair: '/assets/boutique/service_hair.png',
  about_image: '/assets/boutique/about_applicators.png',
  hero_secondary_image: '/assets/boutique/hero_secondary.png',
  experience_gallery: [
    '/assets/boutique/experience_1.png',
    '/assets/boutique/experience_2.png',
    '/assets/boutique/experience_3.png'
  ],
};

const defaultServices: ServiceItem[] = [
  {
    id: 'nails-essential',
    category: 'nails',
    number: '01',
    title: 'The polished essential',
    description: 'A clean shape, considered colour and a glossy finish. Effortless, never ordinary.',
    price: 35000,
    duration_min: 50,
    is_active: true,
    is_popular: true,
  },
  {
    id: 'nails-length',
    category: 'nails',
    number: '02',
    title: 'Length & definition',
    description: 'Explore your preferred length and silhouette, from soft almond to a statement shape.',
    price: 50000,
    duration_min: 75,
    is_active: true,
  },
  {
    id: 'nails-art',
    category: 'nails',
    number: '03',
    title: 'Your signature nail art',
    description: 'Delicate details or a bolder mood. Bring your inspiration and let\'s talk design.',
    price: 65000,
    duration_min: 90,
    is_active: true,
    is_popular: true,
  },
  {
    id: 'nails-refresh',
    category: 'nails',
    number: '04',
    title: 'Refresh & removal',
    description: 'Ready for a change? Ask about the right refresh or removal for your current set.',
    price: 25000,
    duration_min: 40,
    is_active: true,
  },
  {
    id: 'lashes-classic',
    category: 'lashes',
    number: '05',
    title: 'Silk Lash Extensions',
    description: 'Feather-light individual silk lashes tailored to your eye curvature for natural volume.',
    price: 75000,
    duration_min: 80,
    is_active: true,
  },
  {
    id: 'hair-blowout',
    category: 'hair',
    number: '06',
    title: 'Wig Installation & Custom Styling',
    description: 'Bespoke lace customization, seamless skin melt, secure installation, and precision thermal styling for a flawless, natural silhouette.',
    price: 60000,
    duration_min: 70,
    is_active: true,
  },
];

const defaultCalendarSlots: CalendarTimeSlot[] = [
  { time: '10:00 AM', period: 'morning', is_available: true },
  { time: '11:30 AM', period: 'morning', is_available: true },
  { time: '01:00 PM', period: 'afternoon', is_available: true },
  { time: '02:30 PM', period: 'afternoon', is_available: true },
  { time: '04:00 PM', period: 'afternoon', is_available: true },
  { time: '05:30 PM', period: 'evening', is_available: true },
  { time: '07:00 PM', period: 'evening', is_available: true },
];

const defaultAppointments: Appointment[] = [
  {
    id: 'MT-89101',
    client_name: 'Elena Rostova',
    client_phone: '+44 7911 123456',
    client_email: 'elena.rostova@example.com',
    service_id: 'nails-art',
    service_title: 'Your signature nail art',
    category: 'nails',
    date: '2026-11-12',
    time_slot: '02:30 PM',
    notes: 'Pastel French with delicate chrome aura lines',
    status: 'confirmed',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'MT-89102',
    client_name: 'Camilla Dupont',
    client_phone: '+44 7911 654321',
    client_email: 'camilla.d@example.com',
    service_id: 'lashes-classic',
    service_title: 'Silk Lash Extensions',
    category: 'lashes',
    date: '2026-11-13',
    time_slot: '11:30 AM',
    notes: 'Natural cat-eye effect for an upcoming gala',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

interface BoutiqueStore {
  settings: BoutiqueSettings;
  imageSlots: ImageSlots;
  services: ServiceItem[];
  calendarSlots: CalendarTimeSlot[];
  appointments: Appointment[];
}

let store: BoutiqueStore = {
  settings: defaultSettings,
  imageSlots: defaultImageSlots,
  services: defaultServices,
  calendarSlots: defaultCalendarSlots,
  appointments: defaultAppointments,
};

// Load saved data if present
try {
  if (fs.existsSync(storeFilePath)) {
    const raw = fs.readFileSync(storeFilePath, 'utf-8');
    const parsed = JSON.parse(raw);
    store = {
      settings: { ...defaultSettings, ...(parsed.settings || {}) },
      imageSlots: { ...defaultImageSlots, ...(parsed.imageSlots || {}) },
      services: parsed.services?.length ? parsed.services : defaultServices,
      calendarSlots: parsed.calendarSlots?.length ? parsed.calendarSlots : defaultCalendarSlots,
      appointments: parsed.appointments || defaultAppointments,
    };
  }
} catch (err) {
  console.error('Error reading store file, using defaults:', err);
}

const persistStore = () => {
  try {
    fs.writeFileSync(storeFilePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting store:', err);
  }
};

// Supabase Client Management
let supabase: SupabaseClient | null = null;

const initSupabase = (url: string, key: string) => {
  if (url && key) {
    try {
      supabase = createClient(url, key);
      console.log('Connected to Supabase project:', url);
      // Listen for Postgres changes on appointments table if available
      try {
        const channel = supabase
          .channel('schema-db-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'appointments' },
            (payload) => {
              console.log('Supabase Postgres change detected:', payload.eventType);
              if (payload.eventType === 'INSERT' && payload.new) {
                const newApt = payload.new as Appointment;
                if (!store.appointments.some((a) => a.id === newApt.id)) {
                  store.appointments.unshift(newApt);
                  persistStore();
                  broadcast({
                    type: 'APPOINTMENT_CREATED',
                    data: newApt,
                    timestamp: Date.now(),
                  });
                }
              } else if (payload.eventType === 'UPDATE' && payload.new) {
                const updatedApt = payload.new as Appointment;
                store.appointments = store.appointments.map((a) =>
                  a.id === updatedApt.id ? updatedApt : a
                );
                persistStore();
                broadcast({
                  type: 'APPOINTMENT_UPDATED',
                  data: updatedApt,
                  timestamp: Date.now(),
                });
              }
            }
          )
          .subscribe();
      } catch (subErr) {
        console.warn('Supabase realtime channel subscription note:', subErr);
      }
    } catch (err) {
      console.error('Failed to create Supabase client:', err);
      supabase = null;
    }
  } else {
    supabase = null;
  }
};

if (store.settings.supabase_url && store.settings.supabase_anon_key) {
  initSupabase(store.settings.supabase_url, store.settings.supabase_anon_key);
}

// WebSocket Server for zero-refresh real-time sync across all client sessions
const wss = new WebSocketServer({ noServer: true });
const activeClients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  activeClients.add(ws);

  // Send initial bootstrap state on connect
  const initMsg: RealtimeMessage = {
    type: 'INIT_STATE',
    data: store,
    timestamp: Date.now(),
  };
  ws.send(JSON.stringify(initMsg));

  ws.on('close', () => {
    activeClients.delete(ws);
  });

  ws.on('error', (err) => {
    console.error('WebSocket client error:', err);
    activeClients.delete(ws);
  });
});

// Broadcast helper: delivers to all open client sessions instantly
const broadcast = (message: RealtimeMessage) => {
  const payload = JSON.stringify(message);
  for (const client of activeClients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
      } catch (err) {
        console.error('Error broadcasting to client:', err);
      }
    }
  }

  // Also notify any Server-Sent Events listeners
  sseListeners.forEach((res) => {
    try {
      res.write(`data: ${payload}\n\n`);
    } catch (e) {
      // client disconnected
    }
  });
};

// SSE Fallback listeners
const sseListeners = new Set<Response>();

// Handle HTTP upgrade to WebSocket
server.on('upgrade', (request, socket, head) => {
  if (request.url === '/ws' || request.url?.startsWith('/ws')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

// API Routes
app.get('/api/bootstrap', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: store,
    hasSupabase: Boolean(supabase),
  });
});

app.post('/api/verify-pin', (req: Request, res: Response) => {
  const { pin } = req.body;
  if (pin === '43214') {
    res.json({ success: true, message: 'Admin authenticated' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid Admin PIN' });
  }
});

app.post('/api/appointments', async (req: Request, res: Response) => {
  const { client_name, client_phone, client_email, service_id, date, time_slot, notes } = req.body;

  if (!client_name || !client_phone || !service_id || !date || !time_slot) {
    return res.status(400).json({ success: false, message: 'Missing required booking fields' });
  }

  const service = store.services.find((s) => s.id === service_id);
  const newAppointment: Appointment = {
    id: `MT-${Math.floor(10000 + Math.random() * 90000)}`,
    client_name,
    client_phone,
    client_email: client_email || '',
    service_id,
    service_title: service?.title || 'Bespoke Consultation',
    category: service?.category || 'nails',
    date,
    time_slot,
    notes: notes || '',
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  store.appointments.unshift(newAppointment);
  persistStore();

  // Try mirroring to Supabase if configured
  if (supabase) {
    try {
      await supabase.from('appointments').insert([newAppointment]);
    } catch (err) {
      console.warn('Note: Could not insert to Supabase table (table may not exist yet):', err);
    }
  }

  // Instant real-time broadcast to all browser sessions
  broadcast({
    type: 'APPOINTMENT_CREATED',
    data: newAppointment,
    timestamp: Date.now(),
  });

  res.json({ success: true, appointment: newAppointment });
});

app.patch('/api/appointments/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes, time_slot, date } = req.body;

  const index = store.appointments.findIndex((a) => a.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Appointment not found' });
  }

  const updated: Appointment = {
    ...store.appointments[index],
    ...(status ? { status } : {}),
    ...(notes !== undefined ? { notes } : {}),
    ...(time_slot ? { time_slot } : {}),
    ...(date ? { date } : {}),
  };

  store.appointments[index] = updated;
  persistStore();

  if (supabase) {
    try {
      await supabase.from('appointments').update(updated).eq('id', id);
    } catch (err) {
      console.warn('Supabase update note:', err);
    }
  }

  broadcast({
    type: 'APPOINTMENT_UPDATED',
    data: updated,
    timestamp: Date.now(),
  });

  res.json({ success: true, appointment: updated });
});

app.post('/api/settings', (req: Request, res: Response) => {
  const newSettings = req.body;
  store.settings = {
    ...store.settings,
    ...newSettings,
  };
  persistStore();

  if (newSettings.supabase_url !== undefined || newSettings.supabase_anon_key !== undefined) {
    initSupabase(store.settings.supabase_url, store.settings.supabase_anon_key);
  }

  broadcast({
    type: 'SETTINGS_UPDATED',
    data: store.settings,
    timestamp: Date.now(),
  });

  res.json({ success: true, settings: store.settings });
});

app.post('/api/image-slots', (req: Request, res: Response) => {
  const newImageSlots = req.body;
  store.imageSlots = {
    ...store.imageSlots,
    ...newImageSlots,
  };
  persistStore();

  broadcast({
    type: 'IMAGES_UPDATED',
    data: store.imageSlots,
    timestamp: Date.now(),
  });

  res.json({ success: true, imageSlots: store.imageSlots });
});

app.post('/api/services', (req: Request, res: Response) => {
  const { services } = req.body;
  if (Array.isArray(services)) {
    store.services = services;
    persistStore();

    broadcast({
      type: 'SERVICES_UPDATED',
      data: store.services,
      timestamp: Date.now(),
    });

    res.json({ success: true, services: store.services });
  } else {
    res.status(400).json({ success: false, message: 'Services array expected' });
  }
});

app.post('/api/slots', (req: Request, res: Response) => {
  const { slots } = req.body;
  if (Array.isArray(slots)) {
    store.calendarSlots = slots;
    persistStore();

    broadcast({
      type: 'SLOTS_UPDATED',
      data: store.calendarSlots,
      timestamp: Date.now(),
    });

    res.json({ success: true, slots: store.calendarSlots });
  } else {
    res.status(400).json({ success: false, message: 'Slots array expected' });
  }
});

// Test Supabase connection endpoint
app.post('/api/test-supabase', async (req: Request, res: Response) => {
  const { url, key } = req.body;
  if (!url || !key) {
    return res.status(400).json({ success: false, message: 'URL and Anon key required' });
  }

  try {
    const testClient = createClient(url, key);
    const { error } = await testClient.from('appointments').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return res.json({
        success: true,
        reachable: true,
        tableExists: false,
        message: `Connected to Supabase! Note: 'appointments' table does not exist yet (${error.message}). Realtime sync is active for other channels.`,
      });
    }
    return res.json({
      success: true,
      reachable: true,
      tableExists: true,
      message: 'Supabase connected successfully with Postgres changes listener active!',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      reachable: false,
      message: err.message || 'Failed to connect to Supabase project',
    });
  }
});

// SSE endpoint for fallback real-time streaming
app.get('/api/realtime-sse', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');
  sseListeners.add(res);

  req.on('close', () => {
    sseListeners.delete(res);
  });
});

// Vite Middleware integration in Dev / Static Serving in Prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`MT Mansion server running on http://localhost:${port}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
