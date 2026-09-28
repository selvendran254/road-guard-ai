import { useEffect, useState } from 'react';
import { api } from '../lib/api';

function ListPage({ title, fetchFn, renderItem }: {
  title: string;
  fetchFn: () => Promise<Record<string, unknown[]>>;
  renderItem: (item: Record<string, unknown>) => React.ReactNode;
}) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    fetchFn().then((data) => {
      const key = Object.keys(data)[0];
      setItems(data[key] as Record<string, unknown>[]);
    });
  }, [fetchFn]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id as string} className="bg-slate-800 rounded p-4 border border-slate-700">
            {renderItem(item)}
          </div>
        ))}
        {items.length === 0 && <p className="text-slate-500">No items</p>}
      </div>
    </div>
  );
}

export function HazardsPage() {
  return (
    <ListPage
      title="Road Hazards"
      fetchFn={api.getHazards}
      renderItem={(h) => (
        <>
          <p className="font-medium">{h.type as string} — {h.status as string}</p>
          <p className="text-sm text-slate-400">{h.description as string}</p>
          <p className="text-xs text-slate-500">{new Date(h.createdAt as string).toLocaleString()}</p>
        </>
      )}
    />
  );
}

export function AmbulancesPage() {
  return (
    <ListPage
      title="Ambulances — Live Tracking"
      fetchFn={api.getAmbulances}
      renderItem={(a) => (
        <>
          <p className="font-medium">{a.name as string}</p>
          <p className="text-sm text-slate-400">Status: {a.status as string} | Lat: {a.lat as number}, Lng: {a.lng as number}</p>
        </>
      )}
    />
  );
}

export function HospitalsPage() {
  return (
    <ListPage
      title="Hospitals"
      fetchFn={api.getHospitals}
      renderItem={(h) => (
        <>
          <p className="font-medium">{h.name as string}</p>
          <p className="text-sm text-slate-400">{h.phone as string} | Beds: {h.bedsAvailable as number}</p>
        </>
      )}
    />
  );
}

export function BloodRequestsPage() {
  return (
    <ListPage
      title="Blood Requests"
      fetchFn={api.getBloodRequests}
      renderItem={(b) => (
        <>
          <p className="font-medium">{b.bloodGroup as string} — {b.units as number} unit(s)</p>
          <p className="text-sm text-slate-400">Status: {b.status as string}</p>
        </>
      )}
    />
  );
}
