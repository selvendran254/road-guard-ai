import { useEffect, useState } from 'react';
import LiveMap from '../components/LiveMap';
import { api } from '../lib/api';

export default function BlackSpotsPage() {
  const [spots, setSpots] = useState<{ id: string; name: string; lat: number; lng: number; accidentCount: number; severity: string }[]>([]);

  useEffect(() => {
    api.getBlackSpots().then((r) => setSpots((r as { blackSpots: typeof spots }).blackSpots || []));
  }, []);

  const markers = spots.map((s) => ({
    id: s.id,
    lat: s.lat,
    lng: s.lng,
    label: `${s.name} (${s.accidentCount} accidents)`,
    type: 'blackspot',
  }));

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Accident Black Spots</h2>
      <LiveMap markers={markers} height="400px" />
      <div className="grid md:grid-cols-2 gap-3 mt-4">
        {spots.map((s) => (
          <div key={s.id} className="bg-slate-800 rounded p-4 border border-slate-700">
            <p className="font-medium text-red-400">{s.name}</p>
            <p className="text-sm text-slate-400">{s.accidentCount} recorded accidents | {s.severity} severity</p>
          </div>
        ))}
      </div>
    </div>
  );
}
