# RoadGuard AI — Project Workflow

## Project Overview

RoadGuard AI is an AI-powered road safety and emergency response platform built as an npm monorepo. It includes a mobile app (Expo React Native), an authority web dashboard (React + Vite), and an Express + TypeScript backend with Socket.IO for real-time updates.

All backend state is stored in memory and resets on server restart. This is intentional for the demo/portfolio build.

## Folder Structure

```
road-guard-ai/
├── apps/
│   ├── mobile/          # Expo React Native app (@roadguard/mobile)
│   └── dashboard/       # Authority web dashboard (@roadguard/dashboard)
├── server/              # Express + TypeScript + Socket.IO backend
├── docs/
│   └── PROJECT_WORKFLOW.md
├── package.json         # Root workspace config
└── README.md
```

## Architecture

| Layer | Stack | Default URL |
|-------|-------|-------------|
| Server | Express 4, TypeScript, Socket.IO, JWT | `http://localhost:3001` |
| Mobile | Expo 57, React Native, React Navigation | Expo dev server |
| Dashboard | React 18, Vite 6, Tailwind, Leaflet | `http://localhost:5173` |

**Monorepo:** npm workspaces — `"workspaces": ["apps/*", "server"]`

**Storage:** In-memory only (`server/src/store/`). No persistent database.

## Module Relationships

### Server (`server/src/`)

- **`modules/`** — Feature routes: auth, profile, emergency, hazards, location, ambulance, hospital, blood-bank, authority, ai, weather, trips, chat, geofence, wearable, medical-qr, community, first-aid, features
- **`store/`** — In-memory Maps and arrays for sessions, emergencies, hazards, etc.
- **`middleware/auth.ts`** — `requireAuth` (mobile), `requireAuthority` (dashboard)
- **`sockets/`** — Socket.IO setup, ambulance simulation, room joins

### Mobile (`apps/mobile/src/`)

- **`lib/api.ts`** — REST client (Bearer token from AsyncStorage)
- **`lib/offlineQueue.ts`** — Offline SOS queue
- **`context/`** — Auth and theme providers
- **`navigation/`** — Auth stack + main tabs
- **`screens/`** — 30+ feature screens

### Dashboard (`apps/dashboard/src/`)

- **`lib/api.ts`** — Authority REST client (localStorage token)
- **`lib/socket.ts`** — Socket.IO client (joins `authority` room)
- **`pages/`** — Dashboard, Map, Incidents, Hazards, Ambulances, etc.

## Request/Data Flow

```
Mobile App  ──REST/Socket.IO──►  Server  ◄──REST/Socket.IO──  Dashboard
                                    │
                              In-memory store
                                    │
                              Socket.IO events
                              (emergency:new, hazard:new, etc.)
```

1. Mobile signs up/logs in → JWT session stored in memory
2. SOS or hazard reports hit REST endpoints → stored in memory → Socket.IO broadcasts to dashboard
3. Authority logs in → manages incidents via REST + live map via Socket.IO
4. Offline mobile SOS requests queue in AsyncStorage and flush on reconnect

## Build Process

### Root scripts

| Script | Description |
|--------|-------------|
| `npm run dev:server` | Start backend with hot reload |
| `npm run dev:dashboard` | Start Vite dev server (port 5173) |
| `npm run dev:mobile` | Start Expo dev server |
| `npm run build:server` | Compile server TypeScript → `dist/` |
| `npm run build:dashboard` | Type-check + Vite production build |

### Per-workspace

- **Server:** `tsx watch` (dev), `tsc` (build), `node dist/index.js` (start)
- **Dashboard:** `vite` (dev), `tsc && vite build` (build)
- **Mobile:** `expo start` (dev), `expo run:android/ios` (native), EAS profiles in `eas.json`

**Prerequisites:** Node.js 18+, npm. For mobile: Expo Go or emulator.

## Deployment Flow

No automated deployment pipeline is configured. Typical manual flow:

1. `npm install` at repo root
2. Set environment variables (see below)
3. `npm run build:server` and `npm run build:dashboard`
4. Run server with `npm run start --workspace=server`
5. Serve dashboard `dist/` via static host or `vite preview`
6. Mobile: EAS build (`eas.json`) or local APK via `scripts/build-apk.ps1`

## Configuration

| Variable | Used by | Default |
|----------|---------|---------|
| `PORT` | Server | `3001` |
| `JWT_SECRET` | Server auth | Dev fallback in code |
| `EXPO_PUBLIC_API_URL` | Mobile | `http://localhost:3001` |
| `VITE_API_URL` | Dashboard | `http://localhost:3001` |

For physical devices, set `EXPO_PUBLIC_API_URL` to the machine's LAN IP (e.g. `http://192.168.x.x:3001`).

Dashboard dev server proxies `/api` → `http://localhost:3001`.

## Environment Variables

Create these locally (never commit `.env` files):

- **Server:** `PORT`, `JWT_SECRET`
- **Mobile (`apps/mobile/.env`):** `EXPO_PUBLIC_API_URL`
- **Dashboard:** `VITE_API_URL` (optional; defaults to localhost)

No `.env.example` file is checked in. See README for setup notes.

## External Dependencies

| Service | Status |
|---------|--------|
| Socket.IO | Active — real-time server ↔ clients |
| Leaflet / OpenStreetMap | Active — dashboard map tiles |
| JWT (jsonwebtoken) | Active — session tokens |
| Expo modules | Active — camera, location, sensors |
| OpenWeather API | Mock only |
| SMS gateway | Demo log only |
| AI/ML models | Stub implementations |

## APIs

- **Health:** `GET /health`
- **API docs:** `GET /api-docs` (JSON endpoint list)
- **Mobile:** Bearer JWT on protected routes under `/auth`, `/emergency`, `/hazards`, etc.
- **Dashboard:** Authority login at `/authority/login`, then Bearer token on `/authority/*`

Default dashboard credentials (demo): `admin` / `admin123`, `operator` / `operator123`

## Database

None. All server data lives in in-memory JavaScript structures. Client persistence:

- Mobile: AsyncStorage (auth token, offline SOS queue)
- Dashboard: localStorage (authority token, user, role)

## Error Handling

- **Server:** Route-level validation, JSON `{ error: string }`, HTTP 400/401/403/404/429
- **Clients:** Throw on non-OK responses; auth contexts clear tokens on session failure
- **Offline queue:** Per-item try/catch; failed items remain queued
- No global error handler, Sentry, or centralized logging service

## Security Notes

- Demo OTP hardcoded as `123456`
- Dashboard credentials are hardcoded for demo
- CORS and Socket.IO origin set to allow all (`*`)
- Android cleartext HTTP enabled for local dev
- Medical data requires explicit user consent (`403` if not given)
- SOS throttled: 3 attempts per 60 seconds per session
- **Not production-ready** for real emergency use without persistence, certification, and hardened auth

## Known Limitations

- No persistent database — state resets on server restart
- AI outputs are labeled "possible" — not guaranteed detections
- Emergency SMS is logged only, not sent
- Ambulance movement is simulated
- Green corridor is display-only
- Mobile asset placeholders may need to be added under `apps/mobile/assets/`

## Recent Changes

- Removed prebuilt APK (`RoadGuardAI.apk`) from version control; added `*.apk` to `.gitignore`
- Initial project workflow documentation created
- Repository prepared for GitHub push

## Changelog

| Date | Change |
|------|--------|
| 2026-09-28 | Removed `apps/mobile/RoadGuardAI.apk` from repo; ignore `*.apk` build outputs |
| 2026-09-28 | Created `docs/PROJECT_WORKFLOW.md`; initialized Git repo for GitHub |

## Last Updated

2026-09-28
