import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';

export default function ChatPage() {
  const [emergencies, setEmergencies] = useState<{ id: string; type: string; status: string }[]>([]);
  const [selected, setSelected] = useState('');
  const [messages, setMessages] = useState<{ id: string; senderName: string; message: string; createdAt: string }[]>([]);
  const [reply, setReply] = useState('');

  useEffect(() => {
    api.getEmergencies().then((r) => {
      const active = (r.emergencies as typeof emergencies).filter((e) => !['resolved', 'cancelled'].includes(e.status));
      setEmergencies(active);
      if (active[0]) setSelected(active[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    api.getChatMessages(selected).then((r) => setMessages((r as { messages: typeof messages }).messages || []));
    const socket = getSocket();
    const refresh = () => api.getChatMessages(selected).then((r) => setMessages((r as { messages: typeof messages }).messages || []));
    socket.on('chat:new', refresh);
    return () => { socket.off('chat:new', refresh); };
  }, [selected]);

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    await api.sendChatReply(selected, reply.trim());
    setReply('');
    const r = await api.getChatMessages(selected);
    setMessages((r as { messages: typeof messages }).messages || []);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Emergency Chat</h2>
      <div className="flex gap-4 mb-4 flex-wrap">
        {emergencies.map((e) => (
          <button
            key={e.id}
            onClick={() => setSelected(e.id)}
            className={`px-3 py-2 rounded text-sm ${selected === e.id ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            {e.id} ({e.type})
          </button>
        ))}
        {emergencies.length === 0 && <p className="text-slate-500">No active emergencies</p>}
      </div>
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 h-80 overflow-y-auto mb-4">
        {messages.map((m) => (
          <div key={m.id} className="mb-3">
            <p className="text-xs text-slate-400">{m.senderName} — {new Date(m.createdAt).toLocaleTimeString()}</p>
            <p className="text-slate-200">{m.message}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Reply to citizen..."
          onKeyDown={(e) => e.key === 'Enter' && sendReply()}
        />
        <button onClick={sendReply} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">Send</button>
      </div>
    </div>
  );
}
