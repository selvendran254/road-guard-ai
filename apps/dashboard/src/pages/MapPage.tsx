import { useEffect, useState } from 'react';
import LiveMap from '../components/LiveMap';
import { api } from '../lib/api';

export default function MapPage() {
  const [markers, setMarkers] = useState<{ id: string; lat: number; lng: number; label: string; type: string }[]>([]);

  useEffect(() => {
    Promise.all([api.getEmergencies(), api.getHazards(), api.getAmbulances(), api.getHospitals()]).then(
      ([emg, haz, amb, hosp]) => {
        setMarkers([
          ...(emg.emergencies as { id: string; lat: number; lng: number; type: string }[]).map((e) => ({
            id: e.id,
            lat: e.lat,
            lng: e.lng,
            label: `Emergency: ${e.type}`,
            type: 'emergency',
          })),
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
          ...(hosp.hospitals as { id: string; lat: number; lng: number; name: string }[]).map((h) => ({
            id: h.id,
            lat: h.lat,
            lng: h.lng,
            label: h.name,
            type: 'hospital',
          })),
        ]);
      }
    );
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Live Map</h2>
      <p className="text-slate-400 mb-4">Real-time markers via Socket.IO</p>
      <LiveMap markers={markers} height="calc(100vh - 180px)" />
    </div>
  );
}
