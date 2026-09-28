import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import { trips, sessions } from '../../store';
import { newId, now } from '../../utils/helpers';

const router = Router();

function calcSafetyScore(distanceKm: number, harshBraking: number, aiWarnings: number, avgSpeed: number) {
  let score = 100;
  score -= harshBraking * 8;
  score -= aiWarnings * 5;
  if (avgSpeed > 80) score -= 15;
  if (avgSpeed > 100) score -= 20;
  if (distanceKm > 50 && harshBraking === 0) score += 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

router.post('/start', requireAuth, (req: AuthRequest, res) => {
  const session = sessions.get(req.session!.sessionId)!;
  const active = trips.find((t) => t.sessionId === session.sessionId && t.active);
  if (active) return res.json({ trip: active, message: 'Trip already active' });

  const trip = {
    id: newId('trip'),
    sessionId: session.sessionId,
    startTime: now(),
    distanceKm: 0,
    avgSpeed: 0,
    harshBraking: 0,
    aiWarnings: 0,
    safetyScore: 100,
    active: true,
  };
  trips.push(trip);
  res.json({ success: true, trip });
});

router.post('/update', requireAuth, (req: AuthRequest, res) => {
  const { distanceKm, avgSpeed, harshBraking, aiWarnings } = req.body;
  const session = sessions.get(req.session!.sessionId)!;
  const trip = trips.find((t) => t.sessionId === session.sessionId && t.active);
  if (!trip) return res.status(404).json({ error: 'No active trip' });

  if (distanceKm != null) trip.distanceKm = distanceKm;
  if (avgSpeed != null) trip.avgSpeed = avgSpeed;
  if (harshBraking != null) trip.harshBraking += harshBraking;
  if (aiWarnings != null) trip.aiWarnings += aiWarnings;
  trip.safetyScore = calcSafetyScore(trip.distanceKm, trip.harshBraking, trip.aiWarnings, trip.avgSpeed);

  res.json({ success: true, trip });
});

router.post('/end', requireAuth, (req: AuthRequest, res) => {
  const session = sessions.get(req.session!.sessionId)!;
  const trip = trips.find((t) => t.sessionId === session.sessionId && t.active);
  if (!trip) return res.status(404).json({ error: 'No active trip' });

  trip.active = false;
  trip.endTime = now();
  trip.safetyScore = calcSafetyScore(trip.distanceKm, trip.harshBraking, trip.aiWarnings, trip.avgSpeed);

  session.totalTrips += 1;
  session.safetyScore = Math.round((session.safetyScore + trip.safetyScore) / 2);

  if (trip.safetyScore >= 90 && !session.badges.includes('safe_driver')) {
    session.badges.push('safe_driver');
  }
  if (session.totalTrips >= 5 && !session.badges.includes('regular_rider')) {
    session.badges.push('regular_rider');
  }

  res.json({ success: true, trip, safetyScore: session.safetyScore, badges: session.badges });
});

router.get('/history/:sessionId', requireAuth, (req: AuthRequest, res) => {
  const history = trips
    .filter((t) => t.sessionId === String(req.params.sessionId) && !t.active)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  const session = sessions.get(String(req.params.sessionId));
  res.json({
    trips: history,
    safetyScore: session?.safetyScore ?? 85,
    totalTrips: session?.totalTrips ?? 0,
    badges: session?.badges ?? [],
  });
});

router.get('/active', requireAuth, (req: AuthRequest, res) => {
  const trip = trips.find((t) => t.sessionId === req.session!.sessionId && t.active);
  res.json({ trip: trip || null });
});

export default router;
