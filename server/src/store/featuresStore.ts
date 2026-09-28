export type GamificationProfile = {
  points: number;
  level: number;
  badges: string[];
  rank: number;
  cityRank: number;
};

export type ParkingSpot = {
  id: string;
  sessionId: string;
  lat: number;
  lng: number;
  note: string;
  savedAt: string;
};

export type MaintenanceReminder = {
  id: string;
  sessionId: string;
  type: string;
  dueDate: string;
  vehicleReg: string;
  notified: boolean;
};

export type InsuranceClaim = {
  id: string;
  sessionId: string;
  incidentDate: string;
  description: string;
  status: 'draft' | 'submitted' | 'processing';
  createdAt: string;
};

export type FirReport = {
  id: string;
  sessionId: string;
  location: string;
  description: string;
  status: 'draft' | 'filed';
  createdAt: string;
};

export type BloodDonor = {
  id: string;
  sessionId: string;
  name: string;
  bloodGroup: string;
  lat: number;
  lng: number;
  available: boolean;
};

export type WitnessReport = {
  id: string;
  sessionId: string;
  description: string;
  lat: number;
  lng: number;
  createdAt: string;
};

export type LiveShareSession = {
  id: string;
  sessionId: string;
  shareCode: string;
  lat: number;
  lng: number;
  updatedAt: string;
  active: boolean;
};

export type DriverProfile = {
  id: string;
  sessionId: string;
  name: string;
  licenseNo: string;
};

export type AuditLog = {
  id: string;
  sessionId: string;
  action: string;
  timestamp: string;
};

export const gamification = new Map<string, GamificationProfile>();
export const parkingSpots = new Map<string, ParkingSpot>();
export const maintenanceReminders: MaintenanceReminder[] = [];
export const insuranceClaims: InsuranceClaim[] = [];
export const firReports: FirReport[] = [];
export const bloodDonors: BloodDonor[] = [
  { id: 'bd-1', sessionId: 'demo', name: 'Raj Kumar', bloodGroup: 'O+', lat: 13.07, lng: 80.26, available: true },
  { id: 'bd-2', sessionId: 'demo', name: 'Priya S', bloodGroup: 'A+', lat: 13.05, lng: 80.24, available: true },
];
export const witnessReports: WitnessReport[] = [];
export const liveShareSessions = new Map<string, LiveShareSession>();
export const driverProfiles = new Map<string, DriverProfile[]>();
export const auditLogs: AuditLog[] = [];
export const organDonorRegistry = new Map<string, { registered: boolean; registeredAt?: string }>();
export const medicineReminders = new Map<string, { medicine: string; time: string; enabled: boolean }[]>();
export const referralCodes = new Map<string, { code: string; referrals: number; rewards: number }>();
export const sessionDevices = new Map<string, { deviceId: string; lastActive: string }[]>();
export const cachedRoutes = new Map<string, { from: string; to: string; waypoints: { lat: number; lng: number }[] }>();

export const evStations = [
  { id: 'ev-1', name: 'Tata Power EV - Adyar', lat: 13.006, lng: 80.257, slots: 4 },
  { id: 'ev-2', name: 'Ather Grid - OMR', lat: 12.946, lng: 80.246, slots: 2 },
  { id: 'ev-3', name: 'ChargeZone - Velachery', lat: 12.976, lng: 80.221, slots: 6 },
];

export const fuelStations = [
  { id: 'fs-1', name: 'Indian Oil - T Nagar', lat: 13.042, lng: 80.234, price: 102.5 },
  { id: 'fs-2', name: 'HP - Anna Salai', lat: 13.060, lng: 80.265, price: 103.2 },
  { id: 'fs-3', name: 'BPCL - OMR', lat: 12.950, lng: 80.243, price: 101.8 },
];

export const tollPlazas = [
  { id: 'tp-1', name: 'Chennai Outer Ring Toll', lat: 13.120, lng: 80.180, fee: 85 },
  { id: 'tp-2', name: 'ECR Toll Plaza', lat: 12.850, lng: 80.250, fee: 45 },
];

export const speedCameras = [
  { id: 'sc-1', name: 'Anna Salai Speed Camera', lat: 13.058, lng: 80.262, limit: 40 },
  { id: 'sc-2', name: 'OMR Speed Camera', lat: 12.948, lng: 80.244, limit: 60 },
  { id: 'sc-3', name: 'Mount Road Camera', lat: 13.070, lng: 80.270, limit: 50 },
];

export const leaderboard = [
  { rank: 1, name: 'Arun M', points: 2450, city: 'Chennai' },
  { rank: 2, name: 'Deepa K', points: 2180, city: 'Chennai' },
  { rank: 3, name: 'Vikram S', points: 1920, city: 'Chennai' },
  { rank: 4, name: 'You', points: 850, city: 'Chennai' },
  { rank: 5, name: 'Karthik R', points: 780, city: 'Chennai' },
];

export function defaultGamification(): GamificationProfile {
  return { points: 850, level: 5, badges: ['First SOS', 'Safe Driver', 'Hazard Reporter'], rank: 4, cityRank: 127 };
}

export function logAudit(sessionId: string, action: string) {
  auditLogs.push({ id: `audit-${Date.now()}`, sessionId, action, timestamp: new Date().toISOString() });
}
