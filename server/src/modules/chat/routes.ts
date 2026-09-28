import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import { requireAuthority } from '../../middleware/auth';
import { chatMessages, emergencies } from '../../store';
import { newId, now } from '../../utils/helpers';

const router = Router();

router.get('/:emergencyId', requireAuth, (req: AuthRequest, res) => {
  const emergency = emergencies.get(String(req.params.emergencyId));
  if (!emergency || emergency.sessionId !== req.session!.sessionId) {
    return res.status(404).json({ error: 'Emergency not found' });
  }
  const messages = chatMessages
    .filter((m) => m.emergencyId === emergency.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  res.json({ messages });
});

router.post('/:emergencyId/send', requireAuth, (req: AuthRequest, res) => {
  const emergency = emergencies.get(String(req.params.emergencyId));
  if (!emergency || emergency.sessionId !== req.session!.sessionId) {
    return res.status(404).json({ error: 'Emergency not found' });
  }
  const { message } = req.body;
  const msg = {
    id: newId('chat'),
    emergencyId: emergency.id,
    sender: 'user' as const,
    senderName: (req.session!.profile.name as string) || 'User',
    message,
    createdAt: now(),
  };
  chatMessages.push(msg);

  const io = req.app.get('io');
  io?.emit('chat:new', msg);
  io?.to('authority').emit('chat:new', msg);

  setTimeout(() => {
    const reply = {
      id: newId('chat'),
      emergencyId: emergency.id,
      sender: 'operator' as const,
      senderName: 'Control Room',
      message: 'We have received your message. Help is on the way. Stay calm.',
      createdAt: now(),
    };
    chatMessages.push(reply);
    io?.emit('chat:new', reply);
  }, 2000);

  res.json({ success: true, message: msg });
});

router.post('/authority/:emergencyId/reply', requireAuthority, (req: AuthRequest, res) => {
  const emergency = emergencies.get(String(req.params.emergencyId));
  if (!emergency) return res.status(404).json({ error: 'Emergency not found' });

  const msg = {
    id: newId('chat'),
    emergencyId: emergency.id,
    sender: 'operator' as const,
    senderName: req.authority?.username || 'Operator',
    message: req.body.message,
    createdAt: now(),
  };
  chatMessages.push(msg);

  const io = req.app.get('io');
  io?.emit('chat:new', msg);
  io?.to(`user:${emergency.sessionId}`).emit('chat:new', msg);

  res.json({ success: true, message: msg });
});

export default router;
