import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function SmsLogsPage() {
  const [logs, setLogs] = useState<{ id: string; toName: string; toPhone: string; message: string; status: string; createdAt: string }[]>([]);

  useEffect(() => {
    api.getSmsLogs().then((r) => setLogs((r as { smsLogs: typeof logs }).smsLogs || []));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">SMS Logs (Demo)</h2>
      <p className="text-slate-400 mb-4">Emergency SMS sent to contacts on SOS trigger — mock delivery, no real SMS.</p>
      <div className="space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="bg-slate-800 rounded p-4 border border-slate-700">
            <p className="font-medium text-green-400">{log.toName} — {log.toPhone}</p>
            <p className="text-sm text-slate-300 mt-1">{log.message}</p>
            <p className="text-xs text-slate-500 mt-2">{log.status} | {new Date(log.createdAt).toLocaleString()}</p>
          </div>
        ))}
        {logs.length === 0 && <p className="text-slate-500">No SMS sent yet — trigger SOS from mobile app</p>}
      </div>
    </div>
  );
}
