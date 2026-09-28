import type {
  SessionData,
  Emergency,
  Hazard,
  Ambulance,
  AmbulanceRequest,
  Hospital,
  BloodBank,
  BloodRequest,
  Notification,
  AuthoritySession,
  TripRecord,
  SmsLog,
  ChatMessage,
  BlackSpot,
  GeofenceZone,
  WearableDevice,
} from '../types';

// TEMP: in-memory only, resets on restart — swap for persistence layer later if needed
export const sessions = new Map<string, SessionData>();

// TEMP: in-memory only, resets on restart — swap for persistence layer later if needed
export const tokenToSessionId = new Map<string, string>();

// TEMP: in-memory only, resets on restart — swap for persistence layer later if needed
export const emergencies = new Map<string, Emergency>();

// TEMP: in-memory only, resets on restart — swap for persistence layer later if needed
export const hazards: Hazard[] = [];

// TEMP: in-memory only, resets on restart — swap for persistence layer later if needed
export const ambulances: Ambulance[] = [
  { id: 'amb-1', name: 'Ambulance Alpha', lat: 13.0827, lng: 80.2707, status: 'available' },
  { id: 'amb-2', name: 'Ambulance Beta', lat: 13.0569, lng: 80.2421, status: 'available' },
  { id: 'amb-3', name: 'Ambulance Gamma', lat: 13.0108, lng: 80.2120, status: 'available' },
];

// TEMP: in-memory only, resets on restart — swap for persistence layer later if needed
export const ambulanceRequests = new Map<string, AmbulanceRequest>();

// TEMP: in-memory only, resets on restart — swap for persistence layer later if needed
export const hospitals: Hospital[] = [
  { id: 'hosp-1', name: 'Apollo Hospital', lat: 13.0634, lng: 80.2406, phone: '+91-44-28290200', bedsAvailable: 12 },
  { id: 'hosp-2', name: 'MIOT International', lat: 13.0339, lng: 80.1694, phone: '+91-44-42002200', bedsAvailable: 8 },
  { id: 'hosp-3', name: 'Government General Hospital', lat: 13.0878, lng: 80.2785, phone: '+91-44-25305000', bedsAvailable: 20 },
];

// TEMP: in-memory only, resets on restart — swap for persistence layer later if needed
export const bloodBanks: BloodBank[] = [
  { id: 'bb-1', name: 'Red Cross Blood Bank', lat: 13.0604, lng: 80.2496, phone: '+91-44-28554477', groups: ['A+', 'B+', 'O+', 'AB+', 'O-'] },
  { id: 'bb-2', name: 'JIPMER Blood Centre', lat: 13.0067, lng: 80.2206, phone: '+91-44-26165800', groups: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-'] },
];

// TEMP: in-memory only, resets on restart — swap for persistence layer later if needed
export const bloodRequests: BloodRequest[] = [];

// TEMP: in-memory only, resets on restart — swap for persistence layer later if needed
export const notifications: Notification[] = [];

// TEMP: in-memory only, resets on restart — swap for persistence layer later if needed
export const authoritySessions = new Map<string, AuthoritySession>();

// TEMP: in-memory only, resets on restart — swap for persistence layer later if needed
export const sosThrottle = new Map<string, number[]>();

// TEMP: in-memory only, resets on restart — swap for persistence layer later if needed
export const trips: TripRecord[] = [];

// TEMP: in-memory only, resets on restart — swap for persistence layer later if needed
export const smsLogs: SmsLog[] = [];

// TEMP: in-memory only, resets on restart — swap for persistence layer later if needed
export const chatMessages: ChatMessage[] = [];

// TEMP: in-memory only, resets on restart — swap for persistence layer later if needed
export const blackSpots: BlackSpot[] = [
  { id: 'bs-1', name: 'T Nagar Junction', lat: 13.0418, lng: 80.2341, accidentCount: 47, severity: 'high', radiusM: 500 },
  { id: 'bs-2', name: 'Anna Salai Flyover', lat: 13.0604, lng: 80.2646, accidentCount: 31, severity: 'high', radiusM: 400 },
  { id: 'bs-3', name: 'OMR Thoraipakkam', lat: 12.9458, lng: 80.2456, accidentCount: 22, severity: 'medium', radiusM: 600 },
  { id: 'bs-4', name: 'Poonamallee High Road', lat: 13.0751, lng: 80.2103, accidentCount: 18, severity: 'medium', radiusM: 450 },
];

// TEMP: in-memory only, resets on restart — swap for persistence layer later if needed
export const geofenceZones: GeofenceZone[] = [
  { id: 'gf-1', name: 'School Zone - Adyar', type: 'school', lat: 13.0012, lng: 80.2565, radiusM: 300, alertMessage: 'School zone — reduce speed to 25 km/h' },
  { id: 'gf-2', name: 'Construction - Velachery', type: 'construction', lat: 12.9758, lng: 80.2209, radiusM: 500, alertMessage: 'Road construction ahead — drive carefully' },
  { id: 'gf-3', name: 'Accident Black Spot', type: 'blackspot', lat: 13.0418, lng: 80.2341, radiusM: 500, alertMessage: 'High accident area — stay alert' },
];

// TEMP: in-memory only, resets on restart — swap for persistence layer later if needed
export const wearables = new Map<string, WearableDevice>();

export function getSessionByToken(token: string): SessionData | undefined {
  const sessionId = tokenToSessionId.get(token);
  if (!sessionId) return undefined;
  return sessions.get(sessionId);
}

export function defaultSettings() {
  return {
    language: 'en' as const,
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
