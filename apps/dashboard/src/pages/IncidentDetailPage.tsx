import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { api } from '../lib/api';

export default function IncidentDetailPage() {
  const { id } = useParams();
  const [incident, setIncident] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    Promise.all([api.getEmergencies(), api.getHazards()]).then(([emg, haz]) => {
      const found =
        (emg.emergencies as Record<string, unknown>[]).find((e) => e.id === id) ||
        (haz.hazards as Record<string, unknown>[]).find((h) => h.id === id);
      setIncident(found || null);
    });
  }, [id]);

  const handleExportJson = async () => {
    if (!id) return;
    const data = await api.exportIncident(id);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-${id}.json`;
    a.click();
  };

  const handleExportPdf = () => {
    if (!incident || !id) return;
    const timeline = (incident.timeline as { event: string; timestamp: string }[]) || [
      { event: 'Created', timestamp: incident.createdAt as string },
    ];

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('RoadGuard AI — Incident Report', 14, 20);
    doc.setFontSize(11);
    doc.text(`Incident ID: ${id}`, 14, 32);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 40);

    let y = 52;
    doc.setFontSize(13);
    doc.text('Timeline', 14, y);
    y += 8;
    doc.setFontSize(10);
    timeline.forEach((t) => {
      const line = `${new Date(t.timestamp).toLocaleString()} — ${t.event}`;
      doc.text(line.substring(0, 90), 14, y);
      y += 7;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    y += 8;
    doc.setFontSize(13);
    doc.text('Details', 14, y);
    y += 8;
    doc.setFontSize(9);
    const details = JSON.stringify(incident, null, 2).split('\n');
    details.forEach((line) => {
      doc.text(line.substring(0, 100), 14, y);
      y += 5;
      if (y > 280) { doc.addPage(); y = 20; }
    });

    doc.save(`incident-${id}-report.pdf`);
  };

  if (!incident) return <p className="text-slate-400">Loading or incident not found...</p>;

  const timeline = (incident.timeline as { event: string; timestamp: string }[]) || [
    { event: 'Created', timestamp: incident.createdAt as string },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Case Detail — {id}</h2>
        <div className="flex gap-2">
          <button onClick={handleExportPdf} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 text-sm">
            Export PDF
          </button>
          <button onClick={handleExportJson} className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600 text-sm">
            Export JSON
          </button>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="font-semibold mb-3">Details</h3>
          <pre className="text-sm text-slate-300 overflow-auto">{JSON.stringify(incident, null, 2)}</pre>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="font-semibold mb-3">Timeline</h3>
          <ul className="space-y-2">
            {timeline.map((t, i) => (
              <li key={i} className="text-sm border-l-2 border-red-500 pl-3">
                <span className="text-slate-400">{new Date(t.timestamp).toLocaleString()}</span>
                <p>{t.event}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
