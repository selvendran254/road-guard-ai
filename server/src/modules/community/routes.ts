import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import { sessions } from '../../store';
import { haversineKm } from '../../utils/helpers';

const router = Router();

router.get('/responders/nearby', requireAuth, (req: AuthRequest, res) => {
  const lat = parseFloat(req.query.lat as string) || 13.0827;
  const lng = parseFloat(req.query.lng as string) || 80.2707;

  const responders = [...sessions.values()]
    .filter((s) => s.sessionId !== req.session!.sessionId && s.location && s.settings.shareLocation)
    .map((s) => ({
      sessionId: s.sessionId.slice(0, 8),
      name: s.profile.name || 'Community Member',
      lat: s.location!.lat,
      lng: s.location!.lng,
      distanceKm: haversineKm(lat, lng, s.location!.lat, s.location!.lng),
      badge: s.badges.includes('safe_driver') ? 'verified_driver' : 'citizen',
    }))
    .filter((r) => r.distanceKm <= 5)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  res.json({ responders, disclaimer: 'Community responders — not certified emergency personnel' });
});

router.post('/family-share', requireAuth, (req: AuthRequest, res) => {
  const session = req.session!;
  if (!session.settings.shareLocation) {
    return res.status(403).json({ error: 'Location sharing must be enabled' });
  }
  const loc = session.location || { lat: 13.0827, lng: 80.2707 };
  const shareLink = `https://maps.google.com/?q=${loc.lat},${loc.lng}`;
  res.json({
    success: true,
    shareLink,
    message: 'Share this link with family — live location (session only, updates on app open)',
    expiresOnRestart: true,
  });
});

export default router;
