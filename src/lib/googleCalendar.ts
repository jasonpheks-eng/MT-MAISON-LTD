import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Appointment } from '../types';

let app: any;
let auth: any;
let provider: GoogleAuthProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/calendar.events');
} catch (err) {
  console.warn('Firebase / Google Auth initialization warning:', err);
}

let cachedAccessToken: string | null = null;

export const authenticateCEOForCalendar = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (!auth || !provider) {
    throw new Error('Google Auth not initialized');
  }
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve Google Calendar access token');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (err: any) {
    console.error('CEO Calendar authentication error:', err);
    throw err;
  }
};

export const getCachedCalendarToken = (): string | null => {
  return cachedAccessToken;
};

export const syncAppointmentToGoogleCalendar = async (
  appointment: Appointment,
  accessToken?: string | null,
  reminderMinutes: number = 30
): Promise<boolean> => {
  const token = accessToken || cachedAccessToken;
  if (!token) {
    console.warn('No Google Calendar access token available. Skipping calendar sync.');
    return false;
  }

  try {
    const [year, month, day] = appointment.date.split('-').map(Number);
    
    let hours = 14;
    let minutes = 30;
    try {
      const match = appointment.time_slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        const ampm = match[3].toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
      }
    } catch (tErr) {
      console.warn('Error parsing time slot:', tErr);
    }

    const startDate = new Date(year, month - 1, day, hours, minutes, 0);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const eventPayload = {
      summary: `MT Mansion: ${appointment.service_title} - ${appointment.client_name}`,
      description: `Boutique Appointment Request\n\nClient: ${appointment.client_name}\nTreatment: ${appointment.service_title}\nDate: ${appointment.date}\nTime: ${appointment.time_slot}\n${appointment.notes ? `Notes: ${appointment.notes}\n` : ''}Ref: ${appointment.id}`,
      start: {
        dateTime: startDate.toISOString(),
      },
      end: {
        dateTime: endDate.toISOString(),
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: reminderMinutes },
          { method: 'email', minutes: reminderMinutes }
        ],
      },
    };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    });

    if (!res.ok) {
      const errData = await res.json();
      console.error('Google Calendar API error response:', errData);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to sync appointment to Google Calendar:', err);
    return false;
  }
};
