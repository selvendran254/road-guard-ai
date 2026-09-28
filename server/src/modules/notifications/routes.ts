import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import { notifications } from '../../store';
import { newId, now } from '../../utils/helpers';

const router = Router();

router.post('/send', requireAuth, (req: AuthRequest, res) => {
  const { title, body, type, targetSessionId } = req.body;
  const sessionId = targetSessionId || req.session!.sessionId;

  const notification = {
    id: newId('notif'),
    sessionId,
    title,
    body,
    type: type || 'general',
    read: false,
    createdAt: now(),
  };

  notifications.push(notification);

  const io = req.app.get('io');
  io?.emit('notification:new', notification);

  res.json({ success: true, notification });
});

router.get('/:sessionId', requireAuth, (req: AuthRequest, res) => {
  const mine = notifications
    .filter((n) => n.sessionId === req.params.sessionId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ notifications: mine, unreadCount: mine.filter((n) => !n.read).length });
});

router.patch('/:id/read', requireAuth, (req: AuthRequest, res) => {
  const notif = notifications.find((n) => n.id === req.params.id && n.sessionId === req.session!.sessionId);
  if (!notif) return res.status(404).json({ error: 'Notification not found' });
  notif.read = true;
  res.json({ success: true, notification: notif });
});

export default router;
