import { Router } from 'express';
import { blackSpots, geofenceZones } from '../../store';
import { haversineKm } from '../../utils/helpers';

const router = Router();

router.get('/black-spots', (_req, res) => {
  res.json({ blackSpots });
});

router.get('/zones', (_req, res) => {
  res.json({ zones: geofenceZones });
});

router.get('/check', (req, res) => {
  const lat = parseFloat(req.query.lat as string) || 13.0827;
  const lng = parseFloat(req.query.lng as string) || 80.2707;

  const alerts = geofenceZones
    .map((z) => {
      const distM = haversineKm(lat, lng, z.lat, z.lng) * 1000;
      return { ...z, distanceM: Math.round(distM), inside: distM <= z.radiusM };
    })
    .filter((z) => z.inside);

  const nearbyBlackSpots = blackSpots
    .map((b) => ({ ...b, distanceKm: haversineKm(lat, lng, b.lat, b.lng) }))
    .filter((b) => b.distanceKm * 1000 <= b.radiusM)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  res.json({ alerts, nearbyBlackSpots, hasAlerts: alerts.length > 0 || nearbyBlackSpots.length > 0 });
});

export default router;
