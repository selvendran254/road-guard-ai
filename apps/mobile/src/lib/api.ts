import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

async function getToken() {
  return AsyncStorage.getItem('auth_token');
}

export async function request<T>(path: string, options: RequestInit = {}, auth = true): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) };
  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  signup: (phone: string) => request<{ token: string; sessionId: string; otp: string }>('/auth/signup', { method: 'POST', body: JSON.stringify({ phone }) }, false),
  login: (phone: string) => request<{ token: string; sessionId: string; otp: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ phone }) }, false),
  verifyOtp: (token: string, otp: string) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ token, otp }) }, false),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getSession: () => request<Record<string, unknown>>('/auth/session'),
  updateProfile: (data: Record<string, unknown>) => request('/profile/update', { method: 'POST', body: JSON.stringify(data) }),
  updateVehicle: (data: Record<string, unknown>) => request('/profile/vehicle/update', { method: 'POST', body: JSON.stringify(data) }),
  addContact: (data: Record<string, unknown>) => request('/profile/emergency-contacts/add', { method: 'POST', body: JSON.stringify(data) }),
  getContacts: () => request<{ contacts: unknown[] }>('/profile/emergency-contacts'),
  deleteContact: (id: string) => request(`/profile/emergency-contacts/${id}`, { method: 'DELETE' }),
  updateMedical: (data: Record<string, unknown>) => request('/profile/medical-profile/update', { method: 'POST', body: JSON.stringify(data) }),
  updateSettings: (data: Record<string, unknown>) => request('/profile/settings/update', { method: 'POST', body: JSON.stringify(data) }),
  triggerSos: (data: Record<string, unknown>) => request('/emergency/sos', { method: 'POST', body: JSON.stringify(data) }),
  cancelEmergency: (data: Record<string, unknown>) => request('/emergency/cancel', { method: 'POST', body: JSON.stringify(data) }),
  getEmergencyActive: (sessionId: string) => request(`/emergency/active/${sessionId}`),
  analyzeAccident: (data: Record<string, unknown>) => request('/accident/analyze', { method: 'POST', body: JSON.stringify(data) }),
  reportHazard: (data: Record<string, unknown>) => request('/hazards/report', { method: 'POST', body: JSON.stringify(data) }),
  getNearbyHazards: (lat: number, lng: number) => request(`/hazards/nearby?lat=${lat}&lng=${lng}`, {}, false),
  getMyHazards: (sessionId: string) => request(`/hazards/mine/${sessionId}`),
  updateLocation: (lat: number, lng: number) => request('/location/update', { method: 'POST', body: JSON.stringify({ lat, lng }) }),
  getSafeRoute: (from: string, to: string) => request(`/location/route/safe?from=${from}&to=${to}`, {}, false),
  getEmergencyRoute: (from: string, to: string) => request(`/location/route/emergency?from=${from}&to=${to}`, {}, false),
  getNearbyAmbulances: (lat: number, lng: number) => request(`/ambulances/nearby?lat=${lat}&lng=${lng}`, {}, false),
  requestAmbulance: (data: Record<string, unknown>) => request('/ambulance/request', { method: 'POST', body: JSON.stringify(data) }),
  getAmbulanceStatus: (id: string) => request(`/ambulance/status/${id}`),
  getNearbyHospitals: (lat: number, lng: number) => request(`/hospitals/nearby?lat=${lat}&lng=${lng}`, {}, false),
  sendPreAlert: (hospitalId: string) => request('/hospital/pre-alert', { method: 'POST', body: JSON.stringify({ hospitalId }) }),
  getNearbyBloodBanks: (lat: number, lng: number, group?: string) =>
    request(`/blood-banks/nearby?lat=${lat}&lng=${lng}${group ? `&group=${group}` : ''}`, {}, false),
  requestBlood: (data: Record<string, unknown>) => request('/blood-request', { method: 'POST', body: JSON.stringify(data) }),
  getNotifications: (sessionId: string) => request(`/notifications/${sessionId}`),
  markNotificationRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  analyzeAll: (data: Record<string, unknown>) => request('/ai/analyze-all', { method: 'POST', body: JSON.stringify(data) }),
  getWeather: (lat: number, lng: number) => request(`/weather/current?lat=${lat}&lng=${lng}`, {}, false),
  startTrip: () => request('/trips/start', { method: 'POST' }),
  updateTrip: (data: Record<string, unknown>) => request('/trips/update', { method: 'POST', body: JSON.stringify(data) }),
  endTrip: () => request('/trips/end', { method: 'POST' }),
  getTripHistory: (sessionId: string) => request(`/trips/history/${sessionId}`),
  getActiveTrip: () => request('/trips/active'),
  confirmHazard: (id: string) => request(`/hazards/${id}/confirm`, { method: 'POST' }),
  getChatMessages: (emergencyId: string) => request(`/chat/${emergencyId}`),
  sendChatMessage: (emergencyId: string, message: string) =>
    request(`/chat/${emergencyId}/send`, { method: 'POST', body: JSON.stringify({ message }) }),
  checkGeofence: (lat: number, lng: number) => request(`/geofence/check?lat=${lat}&lng=${lng}`, {}, false),
  getBlackSpots: () => request('/geofence/black-spots', {}, false),
  connectWearable: (deviceName: string) => request('/wearable/connect', { method: 'POST', body: JSON.stringify({ deviceName }) }),
  disconnectWearable: () => request('/wearable/disconnect', { method: 'POST' }),
  getWearableStatus: () => request('/wearable/status'),
  sendWearableSignal: (data: Record<string, unknown>) => request('/wearable/signal', { method: 'POST', body: JSON.stringify(data) }),
  generateMedicalQr: () => request('/medical-qr/generate'),
  getNearbyResponders: (lat: number, lng: number) =>
    request(`/community/responders/nearby?lat=${lat}&lng=${lng}`),
  getFamilyShareLink: () => request('/community/family-share', { method: 'POST' }),
  getFirstAidGuides: (lang: string) => request(`/first-aid/guides?lang=${lang}`, {}, false),
  featureRequest: (path: string, method: 'GET' | 'POST' = 'GET', body?: Record<string, unknown>) =>
    request(path, { method, ...(body ? { body: JSON.stringify(body) } : {}) }),
  getFeatureCatalog: () => request<{ totalFeatures: number; categories: string[] }>('/features/catalog'),
};
