import { Router } from 'express';
import multer from 'multer';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import { hazards, sessions, notifications } from '../../store';
import { newId, now, haversineKm } from '../../utils/helpers';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/report', requireAuth, upload.single('photo'), (req: AuthRequest, res) => {
  const { type, description, lat, lng } = req.body;
  const session = req.session!;

  const hazard = {
    id: newId('hzd'),
    sessionId: session.sessionId,
    type: type || 'other',
    description: description || '',
    lat: parseFloat(lat) || session.location?.lat || 13.0827,
    lng: parseFloat(lng) || session.location?.lng || 80.2707,
    photoUrl: req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64').slice(0, 100)}...` : undefined,
    status: 'reported' as const,
    confirmations: [],
    createdAt: now(),
  };

  hazards.push(hazard);
  session.reportsSubmitted += 1;

  notifications.push({
    id: newId('notif'),
    sessionId: session.sessionId,
    title: 'Hazard Report Submitted',
    body: `Your ${type} report is under review.`,
    type: 'hazard',
    read: false,
    createdAt: now(),
  });

  const io = req.app.get('io');
  io?.emit('hazard:new', hazard);

  res.json({ success: true, hazard, reportsSubmitted: session.reportsSubmitted });
});

router.get('/nearby', (req, res) => {
  const lat = parseFloat(req.query.lat as string) || 13.0827;
  const lng = parseFloat(req.query.lng as string) || 80.2707;
  const radius = parseFloat(req.query.radius as string) || 10;

  const nearby = hazards
    .filter((h) => h.status !== 'resolved')
    .map((h) => ({ ...h, distanceKm: haversineKm(lat, lng, h.lat, h.lng) }))
    .filter((h) => h.distanceKm <= radius)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  res.json({ hazards: nearby });
});

router.get('/mine/:sessionId', requireAuth, (req: AuthRequest, res) => {
  const mine = hazards.filter((h) => h.sessionId === String(req.params.sessionId));
  res.json({ hazards: mine, reportsSubmitted: req.session!.reportsSubmitted });
});

router.post('/:id/confirm', requireAuth, (req: AuthRequest, res) => {
  const hazard = hazards.find((h) => h.id === String(req.params.id));
  if (!hazard) return res.status(404).json({ error: 'Hazard not found' });
  if (hazard.sessionId === req.session!.sessionId) {
    return res.status(400).json({ error: 'Cannot confirm your own report' });
  }
  if (hazard.confirmations.includes(req.session!.sessionId)) {
    return res.json({ success: true, hazard, message: 'Already confirmed' });
  }

  hazard.confirmations.push(req.session!.sessionId);
  if (hazard.confirmations.length >= 3 && hazard.status === 'reported') {
    hazard.status = 'verified';
  }

  notifications.push({
    id: newId('notif'),
    sessionId: hazard.sessionId,
    title: 'Hazard Confirmed',
    body: `A citizen confirmed your ${hazard.type} report (${hazard.confirmations.length} confirmations)`,
    type: 'hazard',
    read: false,
    createdAt: now(),
  });

  const io = req.app.get('io');
  io?.emit('hazard:confirmed', { id: hazard.id, confirmations: hazard.confirmations.length, status: hazard.status });

  res.json({ success: true, hazard, confirmationCount: hazard.confirmations.length });
});

export default router;
