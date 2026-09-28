import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import { bloodBanks, bloodRequests, notifications } from '../../store';
import { newId, now, haversineKm } from '../../utils/helpers';

const router = Router();

router.get('/nearby', (req, res) => {
  const lat = parseFloat(req.query.lat as string) || 13.0827;
  const lng = parseFloat(req.query.lng as string) || 80.2707;
  const group = req.query.group as string;

  let nearby = bloodBanks.map((b) => ({
    ...b,
    distanceKm: haversineKm(lat, lng, b.lat, b.lng),
  }));

  if (group) {
    nearby = nearby.filter((b) => b.groups.includes(group));
  }

  nearby.sort((a, b) => a.distanceKm - b.distanceKm);
  res.json({ bloodBanks: nearby });
});

router.post('/', requireAuth, (req: AuthRequest, res) => {
  const { bloodGroup, units, lat, lng } = req.body;
  const session = req.session!;

  const request = {
    id: newId('blood'),
    sessionId: session.sessionId,
    bloodGroup: bloodGroup || 'O+',
    units: units || 1,
    lat: lat || session.location?.lat || 13.0827,
    lng: lng || session.location?.lng || 80.2707,
    status: 'pending' as const,
    createdAt: now(),
  };

  bloodRequests.push(request);

  notifications.push({
    id: newId('notif'),
    sessionId: session.sessionId,
    title: 'Blood Request Submitted',
    body: `Request for ${request.bloodGroup} blood is being processed.`,
    type: 'blood',
    read: false,
    createdAt: now(),
  });

  const io = req.app.get('io');
  io?.emit('blood-request:new', request);

  res.json({ success: true, request });
});

export default router;
