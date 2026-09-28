import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import { hospitals, sessions } from '../../store';
import { haversineKm } from '../../utils/helpers';

const router = Router();

router.get('/nearby', (req, res) => {
  const lat = parseFloat(req.query.lat as string) || 13.0827;
  const lng = parseFloat(req.query.lng as string) || 80.2707;

  const nearby = hospitals
    .map((h) => ({ ...h, distanceKm: haversineKm(lat, lng, h.lat, h.lng) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  res.json({ hospitals: nearby });
});

router.post('/pre-alert', requireAuth, (req: AuthRequest, res) => {
  const { hospitalId } = req.body;
  const session = req.session!;
  const hospital = hospitals.find((h) => h.id === hospitalId);

  if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

  if (!session.settings.shareHealth && !session.medicalProfile.consentGiven) {
    return res.status(403).json({ error: 'Medical pre-alert requires health data consent' });
  }

  const preAlert = {
    hospitalId,
    hospitalName: hospital.name,
    patientName: session.profile.name || 'Unknown',
    bloodGroup: session.medicalProfile.bloodGroup,
    allergies: session.medicalProfile.allergies,
    medications: session.medicalProfile.medications,
    notes: session.medicalProfile.notes,
    sentAt: new Date().toISOString(),
    message: 'Pre-alert sent with user consent — display only, no real hospital integration',
  };

  res.json({ success: true, preAlert });
});

export default router;
