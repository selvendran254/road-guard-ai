import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import { ambulances, ambulanceRequests, notifications } from '../../store';
import { newId, now, haversineKm } from '../../utils/helpers';

const router = Router();

router.get('/nearby', (req, res) => {
  const lat = parseFloat(req.query.lat as string) || 13.0827;
  const lng = parseFloat(req.query.lng as string) || 80.2707;

  const nearby = ambulances
    .map((a) => ({ ...a, distanceKm: haversineKm(lat, lng, a.lat, a.lng), etaMinutes: Math.ceil(haversineKm(lat, lng, a.lat, a.lng) * 4) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  res.json({ ambulances: nearby });
});

router.post('/request', requireAuth, (req: AuthRequest, res) => {
  const { lat, lng, emergencyId } = req.body;
  const session = req.session!;

  const nearest = [...ambulances]
    .filter((a) => a.status === 'available')
    .sort((a, b) => haversineKm(lat, lng, a.lat, a.lng) - haversineKm(lat, lng, b.lat, b.lng))[0];

  const request = {
    id: newId('amb-req'),
    sessionId: session.sessionId,
    emergencyId,
    ambulanceId: nearest?.id,
    status: 'accepted' as const,
    lat: lat || 13.0827,
    lng: lng || 80.2707,
    eta: nearest ? Math.ceil(haversineKm(lat, lng, nearest.lat, nearest.lng) * 4) : 10,
    createdAt: now(),
  };

  ambulanceRequests.set(request.id, request);

  if (nearest) {
    nearest.status = 'en_route';
  }

  notifications.push({
    id: newId('notif'),
    sessionId: session.sessionId,
    title: 'Ambulance Dispatched',
    body: `ETA approximately ${request.eta} minutes`,
    type: 'ambulance',
    read: false,
    createdAt: now(),
  });

  res.json({ success: true, request });
});

router.get('/status/:requestId', requireAuth, (req, res) => {
  const request = ambulanceRequests.get(String(req.params.requestId));
  if (!request) return res.status(404).json({ error: 'Request not found' });

  const ambulance = request.ambulanceId ? ambulances.find((a) => a.id === request.ambulanceId) : null;

  res.json({ request, ambulance, liveLocation: ambulance ? { lat: ambulance.lat, lng: ambulance.lng } : null });
});

export default router;
