# CEO Google Calendar Notifications & Account Sync

Real-time integration enabling the CEO to connect her designated Google Account via the Admin panel and automatically receive Google Calendar appointments and notifications whenever a client submits a booking request.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions govern how the CEO receives Google Calendar notifications:
> - **CEO Google Account Authorization**: The Admin Settings panel will feature a dedicated **"Google Calendar"** tab where the CEO can enter her specific Google email and authenticate via Google Sign-In with Calendar permissions (`https://www.googleapis.com/auth/calendar.events`).
> - **Automatic Calendar Event Creation**: When a visitor submits a booking request on the site, the app immediately dispatches a calendar event to the CEO's primary Google Calendar with the client's name, treatment details, scheduled date, and time slot.
> - **Pop-up Reminders**: Events will include a high-priority 30-minute pop-up reminder (plus Google Calendar mobile push notification) so the CEO is instantly alerted.
> - **Direct Calendar Link Fallback**: In addition to automatic API synchronization, booking submissions will generate a direct Google Calendar template link so appointments can also be added with a single click.

---

### 1. Overview & Core Concept

- **What It Does**: Connects the boutique's booking flow directly to the CEO's personal or business Google Calendar. When clients request a treatment online, an event is created on the CEO's Google Calendar with all appointment details and a 30-minute reminder.
- **Target Audience**: The boutique CEO / salon owner and salon staff managing the daily appointment schedule.
- **Key Value**: Eliminates missed bookings, ensures schedule visibility across all the CEO's devices (desktop, phone, smartwatch), and removes manual entry between WhatsApp and calendar.

---

### 2. User Experience & Visual Design

#### A. CEO Admin Configuration Flow
1. **Admin Panel Navigation**: In the Admin Modal (accessed via the header Settings icon), a new **"Google Calendar"** tab is introduced with a clean Google Calendar icon.
2. **Account Connection Section**:
   - CEO can enter her specific Google email address (e.g., `ceo@mtmansion.com`).
   - Official "Sign in with Google" button with real Google icon and standard Material typography.
   - Status badge displaying connection state: `Connected as [email]` with account avatar, or `Not Connected`.
   - "Test Calendar Notification" button that creates a sample calendar event to verify alerts on her phone/calendar.
3. **Notification Preferences**:
   - Default reminder: 30 minutes before appointment (configurable to 15m, 30m, 1 hour).
   - Event summary formatting preview: `MT Mansion: [Treatment] - [Client Name]`.

#### B. Client Booking Flow (Zero Friction)
1. Client selects date, time, and treatment, enters their name, and clicks "Request via WhatsApp".
2. In the background, the app creates the calendar event on the connected CEO Google Calendar via the Google Calendar API.
3. The confirmation screen confirms the appointment is requested and logged.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client-Side OAuth via Firebase Auth vs Server Redirect**:
  - *Chosen Approach*: Use client-side Firebase Auth with GoogleAuthProvider adding the `calendar.events` scope, caching the access token in memory.
  - *Why*: In preview environments, server-side redirect URIs cause `redirect_uri_mismatch` errors due to dynamic container hostnames. Client-side popup authentication is resilient and compliant with Google Workspace integration guidelines.
- **Decision 2: Admin-Specified CEO Account vs End-User Sign-in**:
  - *Chosen Approach*: Only the CEO / Admin signs in with Google to receive notifications. Site visitors do NOT need to sign in with Google—they simply enter their name and book.
  - *Why*: Requiring every client to sign in with Google would add friction to booking. Restricting Google Sign-In to the CEO in Admin matches the user's explicit request.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                      Admin Panel                       │
│  - CEO enters Google Account Email                     │
│  - Clicks "Sign in with Google" (Calendar Scope)       │
│  - Token cached & connection status verified           │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               Client Booking Submission                │
│  - Client picks Date, Time Slot, and Treatment         │
│  - Submits name + styling notes                        │
└───────────────────────────┬────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
   ┌──────────────────────┐   ┌──────────────────────────┐
   │ Google Calendar API  │   │  WhatsApp Direct Link    │
   │ - Creates Event      │   │  - Client opens chat     │
   │ - 30m popup reminder │   │  - Sends booking text    │
   │ - Syncs to CEO phone │   └──────────────────────────┘
   └──────────────────────┘
```

#### Entities & Schema Updates
- **`BoutiqueSettings`**:
  - `ceo_calendar_email: string` (The designated CEO Google account email)
  - `calendar_sync_enabled: boolean` (Toggle for calendar synchronization)
  - `calendar_reminder_minutes: number` (Default: 30 minutes)
- **API Call**:
  - `POST https://www.googleapis.com/calendar/v3/calendars/primary/events`
  - Body includes `summary`, `description`, `start` (dateTime with ISO format), `end`, `reminders` (popup 30 min).

---

### 5. Implementation Steps & Verification

1. **OAuth Setup**: Run `set_up_oauth` for Google Calendar events scope (`https://www.googleapis.com/auth/calendar.events`) and present connection card to user.
2. **Context & Settings**: Add `ceo_calendar_email`, `calendar_sync_enabled`, and `calendar_reminder_minutes` to `BoutiqueSettings` and backend bootstrap.
3. **Admin Tab**: Build the "Google Calendar" tab in `AdminModal.tsx` with CEO email input, "Sign in with Google" button, and connection test.
4. **Calendar Sync Service**: Create a client helper `syncAppointmentToGoogleCalendar(appointment, token, settings)` handling ISO date parsing, event payload creation, and error boundaries.
5. **Hook to Booking Submit**: Call calendar sync in `BookingSection.tsx` and `BookingModal.tsx` when clients confirm their booking.
6. **Verify & Test**: Run `compile_applet` and `lint_applet` to confirm clean compilation.
