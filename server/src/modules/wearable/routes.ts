import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import { wearables, notifications } from '../../store';
import { newId, now } from '../../utils/helpers';

const router = Router();

router.post('/connect', requireAuth, (req: AuthRequest, res) => {
  const { deviceName } = req.body;
  const device = {
    sessionId: req.session!.sessionId,
    deviceName: deviceName || 'Smart Watch',
    connected: true,
    fallDetected: false,
    lastHeartRate: 72 + Math.round(Math.random() * 20),
    connectedAt: now(),
  };
  wearables.set(req.session!.sessionId, device);
  res.json({ success: true, device });
});

router.post('/disconnect', requireAuth, (req: AuthRequest, res) => {
  wearables.delete(req.session!.sessionId);
  res.json({ success: true });
});

router.get('/status', requireAuth, (req: AuthRequest, res) => {
  const device = wearables.get(req.session!.sessionId);
  res.json({ device: device || null, connected: !!device?.connected });
});

router.post('/signal', requireAuth, (req: AuthRequest, res) => {
  const { heartRate, fallDetected } = req.body;
  const device = wearables.get(req.session!.sessionId);
  if (!device) return res.status(404).json({ error: 'No wearable connected' });

  if (heartRate != null) device.lastHeartRate = heartRate;
  if (fallDetected != null) device.fallDetected = fallDetected;

  if (fallDetected) {
    notifications.push({
      id: newId('notif'),
      sessionId: req.session!.sessionId,
      title: 'Possible Fall Detected',
      body: 'Wearable detected a possible fall. Please confirm you are safe.',
      type: 'wearable',
      read: false,
      createdAt: now(),
    });
  }

  res.json({ success: true, device, possibleFall: !!fallDetected });
});

export default router;
