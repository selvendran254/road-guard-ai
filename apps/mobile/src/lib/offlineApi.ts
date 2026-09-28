import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@roadguard/session';
const DATA_KEY = '@roadguard/data';
const PENDING_TOKEN_KEY = '@roadguard/pending_token';

type Session = {
  sessionId: string;
  phone: string;
  otpVerified: boolean;
  profile: Record<string, unknown>;
  vehicles: { id: string; number: string; type: string; model: string; isActive: boolean }[];
  emergencyContacts: { id: string; name: string; phone: string; relationship: string }[];
  medicalProfile: Record<string, unknown>;
  settings: Record<string, unknown>;
  reportsSubmitted: number;
  safetyScore: number;
  location?: { lat: number; lng: number };
};

type AppData = {
  hazards: { id: string; type: string; description: string; lat: number; lng: number; sessionId: string; confirmations: number; verified: boolean }[];
  emergencies: { id: string; sessionId: string; status: string; lat: number; lng: number; createdAt: string }[];
  notifications: { id: string; sessionId: string; title: string; body: string; read: boolean; createdAt: string }[];
  trips: { id: string; sessionId: string; startTime: string; endTime?: string; safetyScore: number; distanceKm: number }[];
  activeTripId: string | null;
  chat: Record<string, { id: string; sender: string; senderName: string; message: string; createdAt: string }[]>;
  wearable: { connected: boolean; deviceName: string; heartRate: number };
  featureExtras: Record<string, unknown>;
};

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function now() {
  return new Date().toISOString();
}

function defaultSettings() {
  return {
    language: 'en',
    sosCountdownSeconds: 5,
    autoAccidentResponse: true,
    shareLocation: true,
    shareHealth: false,
    shareCamera: false,
    shareEmergencyData: true,
    notificationsEnabled: true,
    darkMode: false,
    largeText: false,
    voiceCommands: false,
    geofenceAlerts: true,
    weatherAlerts: true,
  };
}

function defaultSession(phone: string): Session {
  return {
    sessionId: id('sess'),
    phone,
    otpVerified: false,
    profile: { name: '', age: '', phone, address: '' },
    vehicles: [],
    emergencyContacts: [],
    medicalProfile: { bloodGroup: '', allergies: '', conditions: '', medications: '', consentGiven: false },
    settings: defaultSettings(),
    reportsSubmitted: 0,
    safetyScore: 85,
    location: { lat: 13.0827, lng: 80.2707 },
  };
}

async function getSession(): Promise<Session | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

async function saveSession(session: Session) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

async function getData(): Promise<AppData> {
  const raw = await AsyncStorage.getItem(DATA_KEY);
  if (raw) return JSON.parse(raw);
  const initial: AppData = {
    hazards: [
      { id: 'h1', type: 'pothole', description: 'Large pothole near junction', lat: 13.081, lng: 80.268, sessionId: 'demo', confirmations: 2, verified: false },
      { id: 'h2', type: 'construction', description: 'Road work — slow down', lat: 13.085, lng: 80.275, sessionId: 'demo', confirmations: 3, verified: true },
    ],
    emergencies: [],
    notifications: [],
    trips: [],
    activeTripId: null,
    chat: {},
    wearable: { connected: false, deviceName: '', heartRate: 72 },
    featureExtras: {},
  };
  await AsyncStorage.setItem(DATA_KEY, JSON.stringify(initial));
  return initial;
}

async function saveData(data: AppData) {
  await AsyncStorage.setItem(DATA_KEY, JSON.stringify(data));
}

const SEED = {
  ambulances: [
    { id: 'amb-1', name: 'Ambulance Alpha', lat: 13.0827, lng: 80.2707, status: 'available' },
    { id: 'amb-2', name: 'Ambulance Beta', lat: 13.0569, lng: 80.2421, status: 'available' },
  ],
  hospitals: [
    { id: 'hosp-1', name: 'Apollo Hospital', lat: 13.0634, lng: 80.2406, phone: '+91-44-28290200', bedsAvailable: 12 },
    { id: 'hosp-2', name: 'MIOT International', lat: 13.0339, lng: 80.1694, phone: '+91-44-42002200', bedsAvailable: 8 },
  ],
  bloodBanks: [
    { id: 'bb-1', name: 'Red Cross Blood Bank', lat: 13.0604, lng: 80.2496, groups: ['A+', 'B+', 'O+'] },
  ],
  blackSpots: [
    { id: 'bs-1', name: 'T Nagar Junction', lat: 13.0418, lng: 80.2341, accidentCount: 47, severity: 'high' },
    { id: 'bs-2', name: 'Anna Salai Flyover', lat: 13.0604, lng: 80.2646, accidentCount: 31, severity: 'high' },
  ],
  geofenceZones: [
    { name: 'School Zone', alertMessage: 'School zone — reduce speed', type: 'school' },
    { name: 'Construction Zone', alertMessage: 'Construction ahead — drive carefully', type: 'construction' },
  ],
};

function route(from: string, to: string) {
  return {
    waypoints: [
      { lat: 13.08, lng: 80.27, instruction: 'Head north' },
      { lat: 13.07, lng: 80.26, instruction: 'Turn right' },
      { lat: 13.063, lng: 80.241, instruction: 'Arrive at destination' },
    ],
    from, to, distanceKm: 8.2, durationMin: 20, safetyScore: 82,
  };
}

export const offlineApi = {
  signup: async (phone: string) => {
    const session = defaultSession(phone);
    const token = id('tok');
    await saveSession(session);
    await AsyncStorage.setItem(PENDING_TOKEN_KEY, token);
    return { token, sessionId: session.sessionId, otp: '123456' };
  },
  login: async (phone: string) => offlineApi.signup(phone),
  verifyOtp: async (token: string, otp: string) => {
    if (otp !== '123456') throw new Error('Invalid OTP');
    const session = await getSession();
    if (!session) throw new Error('No session');
    session.otpVerified = true;
    await saveSession(session);
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.removeItem(PENDING_TOKEN_KEY);
    return { success: true, sessionId: session.sessionId };
  },
  logout: async () => {
    const session = await getSession();
    if (session) {
      session.otpVerified = false;
      await saveSession(session);
    }
    await AsyncStorage.removeItem('auth_token');
    return { success: true };
  },
  getSession: async () => {
    const session = await getSession();
    if (!session) throw new Error('Not authenticated');
    return session;
  },
  updateProfile: async (data: Record<string, unknown>) => {
    const session = await getSession();
    if (!session) throw new Error('Not authenticated');
    session.profile = { ...session.profile, ...data };
    await saveSession(session);
    return { success: true, profile: session.profile };
  },
  updateVehicle: async (data: Record<string, unknown>) => {
    const session = await getSession();
    if (!session) throw new Error('Not authenticated');
    if (data.id) {
      const v = session.vehicles.find((x) => x.id === data.id);
      if (v) Object.assign(v, data);
    } else {
      session.vehicles.push({
        id: id('veh'), number: String(data.number || ''), type: String(data.type || 'car'),
        model: String(data.model || ''), isActive: true,
      });
    }
    await saveSession(session);
    return { success: true, vehicles: session.vehicles };
  },
  addContact: async (data: Record<string, unknown>) => {
    const session = await getSession();
    if (!session) throw new Error('Not authenticated');
    session.emergencyContacts.push({
      id: id('ec'), name: String(data.name || ''), phone: String(data.phone || ''), relationship: String(data.relationship || ''),
    });
    await saveSession(session);
    return { success: true, contacts: session.emergencyContacts };
  },
  getContacts: async () => {
    const session = await getSession();
    return { contacts: session?.emergencyContacts || [] };
  },
  deleteContact: async (contactId: string) => {
    const session = await getSession();
    if (!session) throw new Error('Not authenticated');
    session.emergencyContacts = session.emergencyContacts.filter((c) => c.id !== contactId);
    await saveSession(session);
    return { success: true };
  },
  updateMedical: async (data: Record<string, unknown>) => {
    const session = await getSession();
    if (!session) throw new Error('Not authenticated');
    session.medicalProfile = { ...session.medicalProfile, ...data };
    await saveSession(session);
    return { success: true, medicalProfile: session.medicalProfile };
  },
  updateSettings: async (data: Record<string, unknown>) => {
    const session = await getSession();
    if (!session) throw new Error('Not authenticated');
    session.settings = { ...session.settings, ...data };
    await saveSession(session);
    return { success: true, settings: session.settings };
  },
  triggerSos: async (data: Record<string, unknown>) => {
    const session = await getSession();
    if (!session) throw new Error('Not authenticated');
    const d = await getData();
    const emergency = { id: id('emg'), sessionId: session.sessionId, status: 'active', lat: Number(data.lat) || 13.08, lng: Number(data.lng) || 80.27, createdAt: now() };
    d.emergencies.push(emergency);
    d.notifications.unshift({ id: id('n'), sessionId: session.sessionId, title: 'SOS Activated', body: 'Emergency services notified (offline demo)', read: false, createdAt: now() });
    await saveData(d);
    return { success: true, emergencyId: emergency.id, emergency, smsSent: session.emergencyContacts.length };
  },
  cancelEmergency: async (data: Record<string, unknown>) => {
    const d = await getData();
    const emg = d.emergencies.find((e) => e.id === data.emergencyId);
    if (emg) emg.status = 'cancelled';
    await saveData(d);
    return { success: true };
  },
  getEmergencyActive: async (sessionId: string) => {
    const d = await getData();
    const emergency = d.emergencies.find((e) => e.sessionId === sessionId && e.status === 'active');
    return { emergency: emergency || null, ambulanceEta: 8 };
  },
  analyzeAccident: async (data: Record<string, unknown>) => {
    const magnitude = Number(data.acceleration) || 0;
    return { possibleAccident: magnitude > 4, confidence: magnitude > 4 ? 0.75 : 0.1, label: magnitude > 4 ? 'possible' : 'normal' };
  },
  reportHazard: async (data: Record<string, unknown>) => {
    const session = await getSession();
    const d = await getData();
    const hazard = {
      id: id('hz'), type: String(data.type || 'other'), description: String(data.description || ''),
      lat: Number(data.lat), lng: Number(data.lng), sessionId: session?.sessionId || 'local',
      confirmations: 0, verified: false,
    };
    d.hazards.unshift(hazard);
    if (session) session.reportsSubmitted += 1;
    await saveData(d);
    if (session) await saveSession(session);
    return { success: true, hazard };
  },
  getNearbyHazards: async (_lat: number, _lng: number) => {
    const d = await getData();
    return { hazards: d.hazards };
  },
  getMyHazards: async (sessionId: string) => {
    const d = await getData();
    return { hazards: d.hazards.filter((h) => h.sessionId === sessionId) };
  },
  updateLocation: async (lat: number, lng: number) => {
    const session = await getSession();
    if (session) {
      session.location = { lat, lng };
      await saveSession(session);
    }
    return { success: true };
  },
  getSafeRoute: async (from: string, to: string) => route(from, to),
  getEmergencyRoute: async (from: string, to: string) => ({ ...route(from, to), priority: 'green-corridor' }),
  getNearbyAmbulances: async (_lat: number, _lng: number) => ({ ambulances: SEED.ambulances }),
  requestAmbulance: async () => ({ success: true, requestId: id('amb-req'), eta: 7 }),
  getAmbulanceStatus: async (ambId: string) => ({ id: ambId, status: 'en-route', eta: 6 }),
  getNearbyHospitals: async (_lat: number, _lng: number) => ({ hospitals: SEED.hospitals }),
  sendPreAlert: async (hospitalId: string) => ({ success: true, hospitalId, message: 'Pre-alert sent (offline demo)' }),
  getNearbyBloodBanks: async (_lat: number, _lng: number) => ({ bloodBanks: SEED.bloodBanks }),
  requestBlood: async (data: Record<string, unknown>) => ({ success: true, requestId: id('blood'), group: data.bloodGroup }),
  getNotifications: async (sessionId: string) => {
    const d = await getData();
    return { notifications: d.notifications.filter((n) => n.sessionId === sessionId) };
  },
  markNotificationRead: async (notifId: string) => {
    const d = await getData();
    const n = d.notifications.find((x) => x.id === notifId);
    if (n) n.read = true;
    await saveData(d);
    return { success: true };
  },
  analyzeAll: async () => ({
    helmet: { detected: Math.random() > 0.5, label: 'possible helmet' },
    drowsiness: { detected: Math.random() > 0.7, label: 'possible drowsiness' },
    pothole: { detected: Math.random() > 0.6, label: 'possible pothole' },
    collision: { detected: false, label: 'clear' },
    laneDeparture: { detected: false },
    trafficSign: { detected: true, sign: 'speed limit 40' },
  }),
  getWeather: async (lat: number, lng: number) => ({
    condition: 'Partly Cloudy', temp: 32, humidity: 68, windSpeed: 12,
    roadAlert: 'Road conditions good', lat, lng,
  }),
  startTrip: async () => {
    const session = await getSession();
    const d = await getData();
    const trip = { id: id('trip'), sessionId: session!.sessionId, startTime: now(), safetyScore: 85, distanceKm: 0 };
    d.trips.unshift(trip);
    d.activeTripId = trip.id;
    await saveData(d);
    return { trip };
  },
  updateTrip: async (data: Record<string, unknown>) => {
    const d = await getData();
    const trip = d.trips.find((t) => t.id === d.activeTripId);
    if (trip) trip.distanceKm = Number(data.distanceKm) || trip.distanceKm;
    await saveData(d);
    return { success: true };
  },
  endTrip: async () => {
    const d = await getData();
    const trip = d.trips.find((t) => t.id === d.activeTripId);
    if (trip) trip.endTime = now();
    d.activeTripId = null;
    await saveData(d);
    return { success: true, trip };
  },
  getTripHistory: async (sessionId: string) => {
    const d = await getData();
    return { trips: d.trips.filter((t) => t.sessionId === sessionId) };
  },
  getActiveTrip: async () => {
    const d = await getData();
    const trip = d.trips.find((t) => t.id === d.activeTripId);
    return { trip: trip || null };
  },
  confirmHazard: async (hazardId: string) => {
    const d = await getData();
    const h = d.hazards.find((x) => x.id === hazardId);
    if (h) {
      h.confirmations += 1;
      if (h.confirmations >= 3) h.verified = true;
    }
    await saveData(d);
    return { success: true, hazard: h };
  },
  getChatMessages: async (emergencyId: string) => {
    const d = await getData();
    if (!d.chat[emergencyId]) {
      d.chat[emergencyId] = [{ id: '1', sender: 'operator', senderName: 'Operator', message: 'Help is on the way. Stay calm.', createdAt: now() }];
      await saveData(d);
    }
    return { messages: d.chat[emergencyId] };
  },
  sendChatMessage: async (emergencyId: string, message: string) => {
    const d = await getData();
    if (!d.chat[emergencyId]) d.chat[emergencyId] = [];
    d.chat[emergencyId].push({ id: id('msg'), sender: 'user', senderName: 'You', message, createdAt: now() });
    setTimeout(async () => {
      const data = await getData();
      if (!data.chat[emergencyId]) return;
      data.chat[emergencyId].push({ id: id('msg'), sender: 'operator', senderName: 'Operator', message: 'Received. Ambulance ETA 8 min.', createdAt: now() });
      await saveData(data);
    }, 1500);
    await saveData(d);
    return { success: true };
  },
  checkGeofence: async (_lat: number, _lng: number) => ({
    hasAlerts: true,
    alerts: [{ alertMessage: SEED.geofenceZones[0].alertMessage, zone: SEED.geofenceZones[0].name }],
  }),
  getBlackSpots: async () => ({ blackSpots: SEED.blackSpots }),
  connectWearable: async (deviceName: string) => {
    const d = await getData();
    d.wearable = { connected: true, deviceName, heartRate: 72 };
    await saveData(d);
    return { connected: true, deviceName };
  },
  disconnectWearable: async () => {
    const d = await getData();
    d.wearable = { connected: false, deviceName: '', heartRate: 0 };
    await saveData(d);
    return { connected: false };
  },
  getWearableStatus: async () => {
    const d = await getData();
    return d.wearable;
  },
  sendWearableSignal: async (data: Record<string, unknown>) => ({
    received: true, signal: data.type, action: data.type === 'fall' ? 'SOS triggered' : 'logged',
  }),
  generateMedicalQr: async () => {
    const session = await getSession();
    const medical = session?.medicalProfile || {};
    if (!medical.consentGiven) throw new Error('Medical consent required');
    return { qrData: JSON.stringify({ name: session?.profile?.name, bloodGroup: medical.bloodGroup, allergies: medical.allergies }), expiresAt: now() };
  },
  getNearbyResponders: async (_lat: number, _lng: number) => ({
    responders: [
      { id: 'r1', name: 'Kumar (Nearby)', distance: 0.5, available: true },
      { id: 'r2', name: 'Priya (Nearby)', distance: 1.1, available: true },
    ],
  }),
  getFamilyShareLink: async () => {
    const session = await getSession();
    const loc = session?.location || { lat: 13.08, lng: 80.27 };
    return { shareUrl: `https://maps.google.com/?q=${loc.lat},${loc.lng}`, message: 'Track my location' };
  },
  getFirstAidGuides: async (lang: string) => ({
    guides: [
      { id: 'fa1', title: 'CPR', steps: ['Check responsiveness', 'Call 112', '30 chest compressions', '2 rescue breaths'], lang },
      { id: 'fa2', title: 'Bleeding', steps: ['Apply pressure', 'Elevate limb', 'Seek medical help'], lang },
    ],
  }),
  featureRequest: async (path: string, method: 'GET' | 'POST' = 'GET', body?: Record<string, unknown>) => {
    const d = await getData();
    const key = `${method}:${path}`;
    if (path.includes('/community/gamification') && method === 'GET') {
      return { points: 850, level: 5, badges: ['Safe Driver', 'Hazard Reporter'], rank: 4, cityRank: 127 };
    }
    if (path.includes('/community/leaderboard')) {
      return { leaderboard: [{ rank: 1, name: 'Arun M', points: 2450 }], citySafetyScore: 72, yourCity: 'Chennai' };
    }
    if (path.includes('/navigation/ev-stations')) return { stations: [{ id: 'ev1', name: 'EV Station Adyar', lat: 13.006, slots: 4 }] };
    if (path.includes('/vehicle/fuel-stations')) return { stations: [{ id: 'fs1', name: 'Indian Oil T Nagar', price: 102.5 }] };
    if (path.includes('/security/audit-log')) return { logs: [{ action: 'Login', timestamp: now() }] };
    if (method === 'POST') {
      d.featureExtras[key] = { ...(body || {}), savedAt: now() };
      await saveData(d);
      return { success: true, offline: true, path, ...body };
    }
    return { success: true, offline: true, path, data: d.featureExtras[key] || {} };
  },
  getFeatureCatalog: async () => ({ totalFeatures: 98, categories: ['Emergency', 'Navigation', 'Medical'], offline: true }),
};

export function isOfflineMode() {
  return process.env.EXPO_PUBLIC_OFFLINE_MODE === 'true';
}
