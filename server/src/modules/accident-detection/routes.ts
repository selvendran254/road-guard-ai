import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import { analyzeCrash } from '../ai/analyzeCrash';
import { emergencies, notifications } from '../../store';
import { newId, now, checkSosThrottle } from '../../utils/helpers';
import type { Emergency } from '../../types';

const router = Router();

// Stub interface for future wearable integration
export interface WearableSignal {
  heartRate?: number;
  fallDetected?: boolean;
  source: 'watch' | 'phone';
}

router.post('/analyze', requireAuth, (req: AuthRequest, res) => {
  const { accelerometer, gyroscope, gps, wearable, confirmed } = req.body;
  const session = req.session!;

  const crashResult = analyzeCrash(accelerometer, gyroscope, gps);

  // Wearable hook — not implemented, just acknowledged
  const wearableSignal: WearableSignal | undefined = wearable
    ? { ...wearable, source: wearable.source || 'watch' }
    : undefined;

  if (!crashResult.possibleCrash) {
    return res.json({
      possibleCrash: false,
      confidence: crashResult.confidence,
      message: 'No possible crash detected',
      wearableAcknowledged: !!wearableSignal,
    });
  }

  if (!confirmed) {
    return res.json({
      possibleCrash: true,
      confidence: crashResult.confidence,
      message: 'Possible accident detected — please confirm or cancel within countdown',
      requiresConfirmation: true,
      wearableAcknowledged: !!wearableSignal,
    });
  }

  if (!checkSosThrottle(session.sessionId)) {
    return res.status(429).json({ error: 'Too many emergency triggers. Please wait.' });
  }

  const location = gps || session.location || { lat: 13.0827, lng: 80.2707 };
  const emergency: Emergency = {
    id: newId('emg'),
    sessionId: session.sessionId,
    type: 'accident_detected',
    status: 'dispatched',
    lat: location.lat,
    lng: location.lng,
    contactsNotified: session.emergencyContacts.map((c) => c.name),
    ambulanceEta: 6,
    createdAt: now(),
    updatedAt: now(),
    timeline: [
      { event: 'Possible accident detected via sensor fusion', timestamp: now() },
      { event: 'User confirmed after countdown — no response would have triggered dispatch', timestamp: now() },
      { event: 'Emergency dispatch initiated', timestamp: now() },
    ],
  };

  emergencies.set(emergency.id, emergency);

  notifications.push({
    id: newId('notif'),
    sessionId: session.sessionId,
    title: 'Possible Accident — Help Dispatched',
    body: 'Emergency services have been notified based on possible crash detection.',
    type: 'accident',
    read: false,
    createdAt: now(),
  });

  const io = req.app.get('io');
  io?.emit('emergency:new', emergency);

  res.json({
    possibleCrash: true,
    confidence: crashResult.confidence,
    emergency,
    message: 'Possible accident confirmed — emergency flow triggered',
  });
});

export default router;
