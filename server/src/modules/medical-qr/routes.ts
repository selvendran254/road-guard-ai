import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth';

const router = Router();

router.get('/generate', requireAuth, (req: AuthRequest, res) => {
  const session = req.session!;
  if (!session.medicalProfile.consentGiven && !session.settings.shareHealth) {
    return res.status(403).json({ error: 'Medical QR requires health data consent' });
  }

  const qrData = {
    type: 'roadguard_medical_id',
    sessionId: session.sessionId,
    name: session.profile.name || 'Unknown',
    bloodGroup: session.medicalProfile.bloodGroup,
    allergies: session.medicalProfile.allergies,
    medications: session.medicalProfile.medications,
    emergencyPhone: session.phone,
    generatedAt: new Date().toISOString(),
    disclaimer: 'Scan for emergency medical info — session only, consent-gated',
  };

  res.json({
    qrPayload: JSON.stringify(qrData),
    display: qrData,
  });
});

export default router;
