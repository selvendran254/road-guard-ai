import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import { sessions } from '../../store';

const vehicleRouter = Router();
const contactsRouter = Router();
const medicalRouter = Router();

vehicleRouter.post('/update', requireAuth, (req: AuthRequest, res) => {
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

contactsRouter.post('/add', requireAuth, (req: AuthRequest, res) => {
  const { name, phone, relationship } = req.body;
  const session = sessions.get(req.session!.sessionId)!;
  const contact = { id: `ec-${Date.now()}`, name, phone, relationship };
  session.emergencyContacts.push(contact);
  res.json({ success: true, contact, contacts: session.emergencyContacts });
});

contactsRouter.get('/', requireAuth, (req: AuthRequest, res) => {
  res.json({ contacts: req.session!.emergencyContacts });
});

contactsRouter.delete('/:id', requireAuth, (req: AuthRequest, res) => {
  const session = sessions.get(req.session!.sessionId)!;
  session.emergencyContacts = session.emergencyContacts.filter((c) => c.id !== req.params.id);
  res.json({ success: true, contacts: session.emergencyContacts });
});

medicalRouter.post('/update', requireAuth, (req: AuthRequest, res) => {
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

const router = Router();
router.use('/vehicle', vehicleRouter);
router.use('/emergency-contacts', contactsRouter);
router.use('/medical-profile', medicalRouter);

export default router;
