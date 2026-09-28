import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

const STATUSES = ['reported', 'reviewing', 'verified', 'response', 'resolved'];

interface Incident {
  id: string;
  type?: string;
  status: string;
  description?: string;
  createdAt: string;
  sessionId?: string;
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const load = () => {
    Promise.all([api.getEmergencies(), api.getHazards()]).then(([emg, haz]) => {
      const all: Incident[] = [
        ...(emg.emergencies as Incident[]).map((e) => ({ ...e, type: e.type || 'emergency' })),
        ...(haz.hazards as Incident[]),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setIncidents(all);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await api.updateIncidentStatus(id, status);
    load();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Incident Management</h2>
      <p className="text-slate-400 mb-4">Pipeline: Reported → Reviewing → Verified → Response → Resolved</p>
      <div className="space-y-3">
        {incidents.map((inc) => (
          <div key={inc.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex justify-between items-center">
            <div>
              <Link to={`/incidents/${inc.id}`} className="font-medium text-red-400 hover:underline">
                {inc.id}
              </Link>
              <p className="text-sm text-slate-400">{inc.type || inc.description || 'Incident'} — {new Date(inc.createdAt).toLocaleString()}</p>
            </div>
            <select
              value={inc.status}
              onChange={(e) => updateStatus(inc.id, e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        ))}
        {incidents.length === 0 && <p className="text-slate-500">No incidents yet</p>}
      </div>
    </div>
  );
}
