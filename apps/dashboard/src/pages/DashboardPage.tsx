import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import LiveMap from '../components/LiveMap';
import { getSocket } from '../lib/socket';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    activeEmergencies: 0,
    totalHazards: 0,
    ambulances: 0,
    hospitals: 0,
    bloodRequests: 0,
    hazardsToday: 0,
    avgResponse: 0,
  });
  const [mapMarkers, setMapMarkers] = useState<{ id: string; lat: number; lng: number; label: string; type: string }[]>([]);

  const load = async () => {
    const [emg, haz, amb, hosp, blood, analytics] = await Promise.all([
      api.getEmergencies(),
      api.getHazards(),
      api.getAmbulances(),
      api.getHospitals(),
      api.getBloodRequests(),
      api.getAnalytics(),
    ]);

    setStats({
      activeEmergencies: emg.activeCount,
      totalHazards: (haz.hazards as unknown[]).length,
      ambulances: (amb.ambulances as unknown[]).length,
      hospitals: (hosp.hospitals as unknown[]).length,
      bloodRequests: (blood.bloodRequests as unknown[]).length,
      hazardsToday: (analytics.hazardsReportedToday as number) || 0,
      avgResponse: (analytics.avgAmbulanceResponseTimeMinutes as number) || 0,
    });

    const markers = [
      ...(emg.emergencies as { id: string; lat: number; lng: number; type: string; status: string }[])
        .filter((e) => !['resolved', 'cancelled'].includes(e.status))
        .map((e) => ({ id: e.id, lat: e.lat, lng: e.lng, label: `Emergency: ${e.type}`, type: 'emergency' })),
      ...(haz.hazards as { id: string; lat: number; lng: number; type: string }[]).map((h) => ({
        id: h.id,
        lat: h.lat,
        lng: h.lng,
        label: `Hazard: ${h.type}`,
        type: 'hazard',
      })),
      ...(amb.ambulances as { id: string; lat: number; lng: number; name: string }[]).map((a) => ({
        id: a.id,
        lat: a.lat,
        lng: a.lng,
        label: a.name,
        type: 'ambulance',
      })),
    ];
    setMapMarkers(markers);
  };

  useEffect(() => {
    load();
    const socket = getSocket();
    socket.on('emergency:new', load);
    socket.on('hazard:new', load);
    socket.on('emergency:status-changed', load);
    return () => {
      socket.off('emergency:new', load);
      socket.off('hazard:new', load);
      socket.off('emergency:status-changed', load);
    };
  }, []);

  const cards = [
    { label: 'Active Emergencies', value: stats.activeEmergencies, color: 'text-red-400' },
    { label: 'Road Hazards', value: stats.totalHazards, color: 'text-yellow-400' },
    { label: 'Ambulances', value: stats.ambulances, color: 'text-blue-400' },
    { label: 'Hospitals', value: stats.hospitals, color: 'text-green-400' },
    { label: 'Blood Requests', value: stats.bloodRequests, color: 'text-pink-400' },
    { label: 'Hazards Today', value: stats.hazardsToday, color: 'text-orange-400' },
    { label: 'Avg Response (min)', value: stats.avgResponse, color: 'text-cyan-400' },
  ];

  const exportCsv = async () => {
    const csv = await api.exportAnalyticsCsv();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roadguard-analytics.csv';
    a.click();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Live Dashboard</h2>
        <button onClick={exportCsv} className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600 text-sm">
          Export Analytics CSV
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-slate-400">{c.label}</p>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>
      <h3 className="text-lg font-semibold mb-3">Live Map</h3>
      <LiveMap markers={mapMarkers} height="500px" />
    </div>
  );
}
