import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import { emergencies, sessions, notifications, chatMessages } from '../../store';
import { newId, now, checkSosThrottle } from '../../utils/helpers';
import { sendEmergencySms } from '../../utils/sms';
import type { Emergency } from '../../types';

const router = Router();

function getActiveEmergency(sessionId: string): Emergency | undefined {
  return [...emergencies.values()].find(
    (e) => e.sessionId === sessionId && !['resolved', 'cancelled'].includes(e.status)
  );
}

router.post('/sos', requireAuth, (req: AuthRequest, res) => {
  const session = req.session!;
  const { lat, lng, confirmed } = req.body;

  if (!confirmed) {
    return res.status(400).json({ error: 'SOS requires countdown confirmation (confirmed: true)' });
  }

  if (!checkSosThrottle(session.sessionId)) {
    return res.status(429).json({ error: 'Too many SOS attempts. Please wait before trying again.' });
  }

  const existing = getActiveEmergency(session.sessionId);
  if (existing) {
    return res.json({ emergency: existing, message: 'Emergency already active' });
  }

  const location = session.location || { lat: lat || 13.0827, lng: lng || 80.2707 };
  const contactsNotified = session.emergencyContacts.map((c) => c.name);

  const emergency: Emergency = {
    id: newId('emg'),
    sessionId: session.sessionId,
    type: 'manual_sos',
    status: 'dispatched',
    lat: lat ?? location.lat,
    lng: lng ?? location.lng,
    contactsNotified,
    ambulanceEta: 8,
    createdAt: now(),
    updatedAt: now(),
    timeline: [
      { event: 'Manual SOS triggered after countdown confirmation', timestamp: now() },
      { event: 'Emergency contacts notified', timestamp: now() },
      { event: 'Nearest ambulance dispatched', timestamp: now() },
    ],
  };

  emergencies.set(emergency.id, emergency);

  const smsSent = sendEmergencySms(
    session.sessionId,
    emergency.id,
    session.emergencyContacts,
    emergency.lat,
    emergency.lng,
    (session.profile.name as string) || session.phone
  );
  emergency.timeline.push({ event: `SMS sent to ${smsSent.length} emergency contact(s)`, timestamp: now() });

  chatMessages.push({
    id: newId('chat'),
    emergencyId: emergency.id,
    sender: 'system',
    senderName: 'RoadGuard AI',
    message: 'Emergency activated. An operator will connect shortly. Stay calm.',
    createdAt: now(),
  });

  notifications.push({
    id: newId('notif'),
    sessionId: session.sessionId,
    title: 'Emergency Dispatched',
    body: 'Your SOS has been sent. Help is on the way.',
    type: 'emergency',
    read: false,
    createdAt: now(),
  });

  const io = req.app.get('io');
  io?.emit('emergency:new', emergency);

  res.json({ success: true, emergency, smsSent: smsSent.length });
});

router.post('/cancel', requireAuth, (req: AuthRequest, res) => {
  const session = req.session!;
  const { emergencyId, confirmed } = req.body;

  if (!confirmed) {
    return res.status(400).json({ error: 'Cancellation requires re-confirmation (confirmed: true)' });
  }

  const emergency = emergencies.get(emergencyId) || getActiveEmergency(session.sessionId);
  if (!emergency || emergency.sessionId !== session.sessionId) {
    return res.status(404).json({ error: 'No active emergency found' });
  }

  emergency.status = 'cancelled';
  emergency.updatedAt = now();
  emergency.timeline.push({ event: 'Emergency cancelled by user', timestamp: now() });

  const io = req.app.get('io');
  io?.emit('emergency:status-changed', emergency);

  res.json({ success: true, emergency });
});

router.get('/status/:sessionId', requireAuth, (req: AuthRequest, res) => {
  const emergency = getActiveEmergency(String(req.params.sessionId));
  res.json({ emergency: emergency || null });
});

router.get('/active/:sessionId', requireAuth, (req: AuthRequest, res) => {
  const emergency = getActiveEmergency(String(req.params.sessionId));
  if (!emergency) return res.json({ active: false });

  const session = sessions.get(emergency.sessionId);
  res.json({
    active: true,
    emergency,
    dispatchStatus: emergency.status,
    ambulanceEta: emergency.ambulanceEta,
    contactsNotified: emergency.contactsNotified,
    hospitalName: emergency.hospitalId ? 'Apollo Hospital' : undefined,
  });
});

export default router;
