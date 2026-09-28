# RoadGuard AI

AI-powered road safety and emergency response platform with **no persistent database**. All state lives in backend memory and resets on server restart (intentional).

## Monorepo Structure

```
roadguard-ai/
├── apps/
│   ├── mobile/       # Expo React Native (TypeScript)
│   └── dashboard/    # Authority web dashboard (React + Vite + Tailwind)
├── server/           # Express + TypeScript + Socket.IO
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- For mobile: Expo Go app on your phone, or Android/iOS emulator

### 1. Install dependencies

```bash
npm install
```

### 2. Start the backend

```bash
npm run dev:server
```

Server runs at **http://localhost:3001**

### 3. Start the authority dashboard

```bash
npm run dev:dashboard
```

Dashboard at **http://localhost:5173**

- Login: `admin` / `admin123` (or `operator` / `operator123`)

### 4. Start the mobile app

```bash
npm run dev:mobile
```

Set API URL for physical devices (replace with your machine IP):

```bash
# apps/mobile/.env
EXPO_PUBLIC_API_URL=http://192.168.x.x:3001
```

**Demo OTP:** `123456` for all phone numbers

## Features

### Mobile App
- Auth: Splash → Onboarding → Login/Signup → OTP
- Home dashboard with SOS, quick actions, live location
- Profile, vehicles (multi-vehicle), emergency contacts, medical profile (consent-gated)
- Manual SOS with countdown + confirmation + voice TTS alert
- Automatic accident detection (sensor fusion, mock)
- Road safety camera with AI overlay badges (mock)
- Hazard reporting, smart map, ambulance/hospital/blood bank flows
- Green corridor route (display only — no real signal control)
- Notifications, settings (EN/TA/HI), help guide
- Offline SOS queue (AsyncStorage retry)
- **NEW:** Weather & road condition alerts
- **NEW:** Geofence alerts (school zone, construction, black spots)
- **NEW:** Safe route map with polyline
- **NEW:** Trip history + safety score + badges
- **NEW:** Community hazard verification (3 confirms = verified)
- **NEW:** Emergency SMS to contacts (demo log)
- **NEW:** Operator chat during emergency
- **NEW:** Voice SOS commands (demo)
- **NEW:** Smart wearable connect + fall detection
- **NEW:** Medical QR ID (consent-gated)
- **NEW:** Accident black spots map
- **NEW:** Full dark mode theme support

### Authority Dashboard
- Live dashboard with counts + analytics
- Live map (Leaflet + Socket.IO)
- Incident pipeline: Reported → Reviewing → Verified → Response → Resolved
- Emergencies, hazards, ambulances, hospitals, blood requests
- Incident detail + JSON/PDF export
- **NEW:** SMS logs viewer
- **NEW:** Black spots heatmap page
- **NEW:** Analytics CSV export
- **NEW:** API docs at `/api-docs`

### Backend
- All API endpoints from spec (in-memory)
- Socket.IO events: `hazard:new`, `emergency:new`, `emergency:status-changed`, `ambulance:location`, `incident:status-changed`, `notification:new`
- Mock AI modules in `server/src/modules/ai/` (swappable for real models)
- SOS anti-spam throttle (3 attempts per 60s)

## Architecture Notes

- **No database** — Maps/arrays in `server/src/store/`
- All AI outputs labeled **"possible"** — never guaranteed
- Medical data requires explicit user consent
- Green corridor is **display-only**

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:server` | Start backend with hot reload |
| `npm run dev:dashboard` | Start web dashboard |
| `npm run dev:mobile` | Start Expo dev server |
| `npm run build:server` | Compile backend TypeScript |
| `npm run build:dashboard` | Build dashboard for production |

## Mobile Assets

Add Expo assets to `apps/mobile/assets/`:
- `icon.png` (1024×1024)
- `splash.png`
- `adaptive-icon.png`

Or run `npx expo prebuild` after adding assets.

## License

Portfolio / demo project — not for production emergency use without proper certification and persistence layer.
