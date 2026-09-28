import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import { sessions } from '../../store';

const router = Router();

router.post('/update', requireAuth, (req: AuthRequest, res) => {
  const { name, age, phone, address } = req.body;
  const session = sessions.get(req.session!.sessionId)!;
  session.profile = { ...session.profile, name, age, phone, address };
  res.json({ success: true, profile: session.profile });
});

router.post('/vehicle/update', requireAuth, (req: AuthRequest, res) => {
  const { id, number, type, model, setActive } = req.body;
  const session = sessions.get(req.session!.sessionId)!;

  if (id) {
    const vehicle = session.vehicles.find((v) => v.id === id);
    if (vehicle) {
      Object.assign(vehicle, { number, type, model });
      if (setActive) session.vehicles.forEach((v) => (v.isActive = v.id === id));
    }
  } else {
    const newId = `veh-${Date.now()}`;
    if (setActive !== false) session.vehicles.forEach((v) => (v.isActive = false));
    session.vehicles.push({
      id: newId,
      number: number || '',
      type: type || 'car',
      model: model || '',
      isActive: setActive !== false || session.vehicles.length === 0,
    });
  }
  res.json({ success: true, vehicles: session.vehicles });
});

router.get('/vehicles', requireAuth, (req: AuthRequest, res) => {
  res.json({ vehicles: req.session!.vehicles });
});

router.post('/emergency-contacts/add', requireAuth, (req: AuthRequest, res) => {
  const { name, phone, relationship } = req.body;
  const session = sessions.get(req.session!.sessionId)!;
  const contact = { id: `ec-${Date.now()}`, name, phone, relationship };
  session.emergencyContacts.push(contact);
  res.json({ success: true, contact, contacts: session.emergencyContacts });
});

router.get('/emergency-contacts', requireAuth, (req: AuthRequest, res) => {
  res.json({ contacts: req.session!.emergencyContacts });
});

router.delete('/emergency-contacts/:id', requireAuth, (req: AuthRequest, res) => {
  const session = sessions.get(req.session!.sessionId)!;
  session.emergencyContacts = session.emergencyContacts.filter((c) => c.id !== req.params.id);
  res.json({ success: true, contacts: session.emergencyContacts });
});

router.post('/medical-profile/update', requireAuth, (req: AuthRequest, res) => {
  const { bloodGroup, allergies, medications, notes, consentGiven } = req.body;
  const session = sessions.get(req.session!.sessionId)!;

  if (!consentGiven && !session.settings.shareHealth) {
    return res.status(403).json({ error: 'Medical profile requires explicit consent' });
  }

  session.medicalProfile = {
    bloodGroup,
    allergies,
    medications,
    notes,
    consentGiven: consentGiven ?? session.medicalProfile.consentGiven,
  };
  res.json({ success: true, medicalProfile: session.medicalProfile });
});

router.post('/settings/update', requireAuth, (req: AuthRequest, res) => {
  const session = sessions.get(req.session!.sessionId)!;
  session.settings = { ...session.settings, ...req.body };
  res.json({ success: true, settings: session.settings });
});

export default router;
