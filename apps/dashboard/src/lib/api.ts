const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken() {
  return localStorage.getItem('authority_token') || '';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  login: (username: string, password: string) =>
    request<{ token: string; username: string; role: string }>('/authority/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  getEmergencies: () => request<{ emergencies: unknown[]; activeCount: number }>('/authority/emergencies'),
  getHazards: () => request<{ hazards: unknown[] }>('/authority/hazards'),
  getAmbulances: () => request<{ ambulances: unknown[] }>('/authority/ambulances'),
  getHospitals: () => request<{ hospitals: unknown[] }>('/authority/hospitals'),
  getBloodRequests: () => request<{ bloodRequests: unknown[] }>('/authority/blood-requests'),
  getAnalytics: () => request<Record<string, unknown>>('/authority/analytics'),
  updateIncidentStatus: (id: string, status: string) =>
    request('/authority/incident/' + id + '/status', { method: 'PATCH', body: JSON.stringify({ status }) }),
  exportIncident: (id: string) => request(`/authority/incident/${id}/export`),
  getSmsLogs: () => request<{ smsLogs: unknown[] }>('/authority/sms-logs'),
  getBlackSpots: () => request<{ blackSpots: unknown[] }>('/authority/black-spots'),
  getChatMessages: (emergencyId: string) => request<{ messages: unknown[] }>(`/authority/chat/${emergencyId}`),
  sendChatReply: (emergencyId: string, message: string) =>
    request(`/authority/chat/${emergencyId}/reply`, { method: 'POST', body: JSON.stringify({ message }) }),
  exportAnalyticsCsv: async () => {
    const res = await fetch(`${API_BASE}/authority/analytics/export`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.text();
  },
};
