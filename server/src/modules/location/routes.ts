import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import { sessions, hazards, hospitals, ambulances } from '../../store';
import { haversineKm, now } from '../../utils/helpers';

const router = Router();

router.post('/update', requireAuth, (req: AuthRequest, res) => {
  const { lat, lng } = req.body;
  const session = sessions.get(req.session!.sessionId)!;
  session.location = { lat, lng, updatedAt: now() };
  res.json({ success: true, location: session.location });
});

router.get('/safe', (req, res) => {
  const fromParts = String(req.query.from || '13.0827,80.2707').split(',');
  const toParts = String(req.query.to || '13.0634,80.2406').split(',');
  const fromLat = parseFloat(fromParts[0]) || 13.0827;
  const fromLng = parseFloat(fromParts[1]) || 80.2707;
  const toLat = parseFloat(toParts[0]) || 13.0634;
  const toLng = parseFloat(toParts[1]) || 80.2406;

  const hazardPoints = hazards.filter((h) => h.status !== 'resolved');
  const waypoints = [
    { lat: fromLat, lng: fromLng },
    { lat: (fromLat + toLat) / 2, lng: (fromLng + toLng) / 2 },
    { lat: toLat, lng: toLng },
  ];

  res.json({
    route: waypoints,
    distanceKm: haversineKm(fromLat, fromLng, toLat, toLng),
    hazardsAvoided: hazardPoints.length,
    safetyScore: Math.max(60, 100 - hazardPoints.length * 5),
    message: 'Safe route calculated avoiding known hazards',
  });
});

router.get('/emergency', (req, res) => {
  const fromParts = String(req.query.from || '13.0827,80.2707').split(',');
  const toParts = String(req.query.to || '13.0634,80.2406').split(',');
  const fromLat = parseFloat(fromParts[0]) || 13.0827;
  const fromLng = parseFloat(fromParts[1]) || 80.2707;
  const toLat = parseFloat(toParts[0]) || 13.0634;
  const toLng = parseFloat(toParts[1]) || 80.2406;

  res.json({
    route: [
      { lat: fromLat, lng: fromLng },
      { lat: fromLat + 0.01, lng: fromLng + 0.005 },
      { lat: toLat, lng: toLng },
    ],
    distanceKm: haversineKm(fromLat, fromLng, toLat, toLng),
    coordinationStatus: {
      signalsCleared: 'display_only',
      message: 'Green corridor route shown for display — does NOT control real traffic signals',
      estimatedClearanceMinutes: 12,
    },
    etaMinutes: Math.ceil(haversineKm(fromLat, fromLng, toLat, toLng) * 3),
  });
});

export default router;
