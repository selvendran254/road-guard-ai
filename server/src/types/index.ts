export interface UserProfile {
  name?: string;
  age?: number;
  phone?: string;
  address?: string;
}

export interface Vehicle {
  id: string;
  number: string;
  type: string;
  model: string;
  isActive: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface MedicalProfile {
  bloodGroup?: string;
  allergies?: string;
  medications?: string;
  notes?: string;
  consentGiven: boolean;
}

export interface UserSettings {
  language: 'en' | 'ta' | 'hi';
  sosCountdownSeconds: number;
  autoAccidentResponse: boolean;
  shareLocation: boolean;
  shareHealth: boolean;
  shareCamera: boolean;
  shareEmergencyData: boolean;
  notificationsEnabled: boolean;
  darkMode: boolean;
  largeText: boolean;
  voiceCommands: boolean;
  geofenceAlerts: boolean;
  weatherAlerts: boolean;
}

export interface SessionData {
  sessionId: string;
  phone: string;
  token: string;
  otp?: string;
  otpVerified: boolean;
  profile: UserProfile;
  vehicles: Vehicle[];
  emergencyContacts: EmergencyContact[];
  medicalProfile: MedicalProfile;
  settings: UserSettings;
  location?: { lat: number; lng: number; updatedAt: string };
  reportsSubmitted: number;
  safetyScore: number;
  totalTrips: number;
  badges: string[];
  createdAt: string;
}

export interface Emergency {
  id: string;
  sessionId: string;
  type: 'manual_sos' | 'accident_detected';
  status: 'countdown' | 'active' | 'dispatched' | 'resolved' | 'cancelled';
  lat: number;
  lng: number;
  contactsNotified: string[];
  ambulanceId?: string;
  ambulanceEta?: number;
  hospitalId?: string;
  createdAt: string;
  updatedAt: string;
  timeline: { event: string; timestamp: string }[];
}

export interface Hazard {
  id: string;
  sessionId: string;
  type: string;
  description: string;
  lat: number;
  lng: number;
  photoUrl?: string;
  status: 'reported' | 'reviewing' | 'verified' | 'response' | 'resolved';
  confirmations: string[];
  createdAt: string;
}

export interface TripRecord {
  id: string;
  sessionId: string;
  startTime: string;
  endTime?: string;
  distanceKm: number;
  avgSpeed: number;
  harshBraking: number;
  aiWarnings: number;
  safetyScore: number;
  active: boolean;
}

export interface SmsLog {
  id: string;
  emergencyId?: string;
  sessionId: string;
  toPhone: string;
  toName: string;
  message: string;
  status: 'sent' | 'queued' | 'failed';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  emergencyId: string;
  sender: 'user' | 'operator' | 'system';
  senderName: string;
  message: string;
  createdAt: string;
}

export interface BlackSpot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  accidentCount: number;
  severity: 'low' | 'medium' | 'high';
  radiusM: number;
}

export interface GeofenceZone {
  id: string;
  name: string;
  type: 'school' | 'hospital' | 'blackspot' | 'construction';
  lat: number;
  lng: number;
  radiusM: number;
  alertMessage: string;
}

export interface WearableDevice {
  sessionId: string;
  deviceName: string;
  connected: boolean;
  lastHeartRate?: number;
  fallDetected: boolean;
  connectedAt?: string;
}

export interface Ambulance {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'available' | 'busy' | 'en_route';
  hospitalId?: string;
}

export interface AmbulanceRequest {
  id: string;
  sessionId: string;
  emergencyId?: string;
  ambulanceId?: string;
  status: 'pending' | 'accepted' | 'en_route' | 'arrived' | 'completed' | 'cancelled';
  lat: number;
  lng: number;
  destinationHospitalId?: string;
  eta?: number;
  createdAt: string;
}

export interface Hospital {
  id: string;
  name: string;
  lat: number;
  lng: number;
  phone: string;
  bedsAvailable: number;
}

export interface BloodBank {
  id: string;
  name: string;
  lat: number;
  lng: number;
  phone: string;
  groups: string[];
}

export interface BloodRequest {
  id: string;
  sessionId: string;
  bloodGroup: string;
  units: number;
  lat: number;
  lng: number;
  status: 'pending' | 'matched' | 'fulfilled' | 'cancelled';
  createdAt: string;
}

export interface Notification {
  id: string;
  sessionId: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface AuthoritySession {
  token: string;
  username: string;
  role: 'admin' | 'operator';
  createdAt: string;
}

export type IncidentStatus = Hazard['status'];
