import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { requireAuthority, AuthRequest } from '../../middleware/auth';
import {
  authoritySessions,
  emergencies,
  hazards,
  ambulances,
  hospitals,
  bloodRequests,
  sessions,
  smsLogs,
  blackSpots,
  chatMessages,
  trips,
} from '../../store';
import { now } from '../../utils/helpers';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'roadguard-dev-secret-change-in-prod';

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
    authoritySessions.set(token, { token, username, role: 'admin', createdAt: now() });
    return res.json({ token, username, role: 'admin' });
  }
  if (username === 'operator' && password === 'operator123') {
    const token = jwt.sign({ username, role: 'operator' }, JWT_SECRET, { expiresIn: '8h' });
    authoritySessions.set(token, { token, username, role: 'operator', createdAt: now() });
    return res.json({ token, username, role: 'operator' });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

router.get('/emergencies', requireAuthority, (_req, res) => {
  const all = [...emergencies.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ emergencies: all, activeCount: all.filter((e) => !['resolved', 'cancelled'].includes(e.status)).length });
});

router.get('/hazards', requireAuthority, (_req, res) => {
  res.json({ hazards: [...hazards].reverse() });
});

router.get('/ambulances', requireAuthority, (_req, res) => {
  res.json({ ambulances });
});

router.get('/hospitals', requireAuthority, (_req, res) => {
  res.json({ hospitals });
});

router.get('/blood-requests', requireAuthority, (_req, res) => {
  res.json({ bloodRequests: [...bloodRequests].reverse() });
});

router.patch('/incident/:id/status', requireAuthority, (req: AuthRequest, res) => {
  const { status } = req.body;
  const validStatuses = ['reported', 'reviewing', 'verified', 'response', 'resolved'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const incidentId = String(req.params.id);
  const hazard = hazards.find((h) => h.id === incidentId);
  if (hazard) {
    hazard.status = status;
    const io = req.app.get('io');
    io?.emit('incident:status-changed', { id: hazard.id, status, type: 'hazard' });
    return res.json({ success: true, incident: hazard });
  }

  const emergency = emergencies.get(incidentId);
  if (emergency) {
    if (status === 'resolved') emergency.status = 'resolved';
    emergency.updatedAt = now();
    emergency.timeline.push({ event: `Status changed to ${status} by authority`, timestamp: now() });
    const io = req.app.get('io');
    io?.emit('incident:status-changed', { id: emergency.id, status, type: 'emergency' });
    io?.emit('emergency:status-changed', emergency);
    return res.json({ success: true, incident: emergency });
  }

  res.status(404).json({ error: 'Incident not found' });
});

router.get('/analytics', requireAuthority, (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const hazardsToday = hazards.filter((h) => h.createdAt.startsWith(today)).length;
  const statusBreakdown = hazards.reduce(
    (acc, h) => {
      acc[h.status] = (acc[h.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const activeEmergencies = [...emergencies.values()].filter((e) => !['resolved', 'cancelled'].includes(e.status));

  res.json({
    hazardsReportedToday: hazardsToday,
    avgAmbulanceResponseTimeMinutes: 7.5,
    incidentStatusBreakdown: statusBreakdown,
    activeEmergencies: activeEmergencies.length,
    activeUsers: sessions.size,
    totalHazards: hazards.length,
  });
});

router.get('/chat/:emergencyId', requireAuthority, (req, res) => {
  const messages = chatMessages
    .filter((m) => m.emergencyId === String(req.params.emergencyId))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  res.json({ messages });
});

router.post('/chat/:emergencyId/reply', requireAuthority, (req: AuthRequest, res) => {
  const emergency = emergencies.get(String(req.params.emergencyId));
  if (!emergency) return res.status(404).json({ error: 'Emergency not found' });

  const msg = {
    id: `chat-${Date.now()}`,
    emergencyId: emergency.id,
    sender: 'operator' as const,
    senderName: req.authority?.username || 'Operator',
    message: req.body.message,
    createdAt: now(),
  };
  chatMessages.push(msg);

  const io = req.app.get('io');
  io?.emit('chat:new', msg);

  res.json({ success: true, message: msg });
});

router.get('/sms-logs', requireAuthority, (_req, res) => {
  res.json({ smsLogs: [...smsLogs].reverse() });
});

router.get('/black-spots', requireAuthority, (_req, res) => {
  res.json({ blackSpots });
});

router.get('/analytics/export', requireAuthority, (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const rows = [
    ['Metric', 'Value'],
    ['Hazards Today', String(hazards.filter((h) => h.createdAt.startsWith(today)).length)],
    ['Total Hazards', String(hazards.length)],
    ['Active Emergencies', String([...emergencies.values()].filter((e) => !['resolved', 'cancelled'].includes(e.status)).length)],
    ['Active Users', String(sessions.size)],
    ['Total Trips', String(trips.length)],
    ['SMS Sent', String(smsLogs.length)],
    ['Avg Response (min)', '7.5'],
  ];
  const csv = rows.map((r) => r.join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="roadguard-analytics.csv"');
  res.send(csv);
});

router.get('/incident/:id/export', requireAuthority, (req, res) => {
  const incidentId = String(req.params.id);
  const hazard = hazards.find((h) => h.id === incidentId);
  const emergency = emergencies.get(incidentId);

  const incident = hazard || emergency;
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  const timeline = 'timeline' in incident ? incident.timeline : [{ event: 'Reported', timestamp: incident.createdAt }];

  const pdfContent = {
    title: `RoadGuard AI Incident Report — ${incident.id}`,
    generatedAt: now(),
    incident,
    timeline,
    disclaimer: 'Generated on-the-fly from in-memory data. No persistent database.',
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="incident-${incident.id}.json"`);
  res.json(pdfContent);
});

export default router;
