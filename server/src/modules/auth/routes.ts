import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { sessions, tokenToSessionId, defaultSettings } from '../../store';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import { now } from '../../utils/helpers';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'roadguard-dev-secret-change-in-prod';

router.post('/signup', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number required' });

  const sessionId = uuidv4();
  const otp = '123456'; // Mock OTP for demo
  const token = jwt.sign({ sessionId, phone }, JWT_SECRET, { expiresIn: '24h' });

  const session = {
    sessionId,
    phone,
    token,
    otp,
    otpVerified: false,
    profile: {},
    vehicles: [],
    emergencyContacts: [],
    medicalProfile: { consentGiven: false },
    settings: defaultSettings(),
    reportsSubmitted: 0,
    safetyScore: 85,
    totalTrips: 0,
    badges: [],
    createdAt: now(),
  };

  sessions.set(sessionId, session);
  tokenToSessionId.set(token, sessionId);

  res.json({ token, sessionId, message: 'OTP sent (demo: 123456)', otp: '123456' });
});

router.post('/login', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number required' });

  let existing = [...sessions.values()].find((s) => s.phone === phone);
  if (existing) {
    const otp = '123456';
    existing.otp = otp;
    existing.otpVerified = false;
    res.json({ token: existing.token, sessionId: existing.sessionId, message: 'OTP sent (demo: 123456)', otp: '123456' });
    return;
  }

  const sessionId = uuidv4();
  const otp = '123456';
  const token = jwt.sign({ sessionId, phone }, JWT_SECRET, { expiresIn: '24h' });

  const session = {
    sessionId,
    phone,
    token,
    otp,
    otpVerified: false,
    profile: {},
    vehicles: [],
    emergencyContacts: [],
    medicalProfile: { consentGiven: false },
    settings: defaultSettings(),
    reportsSubmitted: 0,
    safetyScore: 85,
    totalTrips: 0,
    badges: [],
    createdAt: now(),
  };

  sessions.set(sessionId, session);
  tokenToSessionId.set(token, sessionId);

  res.json({ token, sessionId, message: 'OTP sent (demo: 123456)', otp: '123456' });
});

router.post('/verify-otp', (req, res) => {
  const { token, otp } = req.body;
  if (!token || !otp) return res.status(400).json({ error: 'Token and OTP required' });

  const sessionId = tokenToSessionId.get(token);
  if (!sessionId) return res.status(401).json({ error: 'Invalid token' });

  const session = sessions.get(sessionId);
  if (!session) return res.status(401).json({ error: 'Session not found' });

  if (otp !== session.otp && otp !== '123456') {
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  session.otpVerified = true;
  res.json({ success: true, session: { sessionId: session.sessionId, phone: session.phone, profile: session.profile } });
});

router.post('/logout', requireAuth, (req: AuthRequest, res) => {
  const session = req.session!;
  tokenToSessionId.delete(session.token);
  sessions.delete(session.sessionId);
  res.json({ success: true, message: 'Session destroyed' });
});

router.get('/session', requireAuth, (req: AuthRequest, res) => {
  const s = req.session!;
  res.json({
    sessionId: s.sessionId,
    phone: s.phone,
    otpVerified: s.otpVerified,
    profile: s.profile,
    vehicles: s.vehicles,
    emergencyContacts: s.emergencyContacts,
    medicalProfile: s.medicalProfile,
    settings: s.settings,
    reportsSubmitted: s.reportsSubmitted,
    safetyScore: s.safetyScore ?? 85,
    totalTrips: s.totalTrips ?? 0,
    badges: s.badges ?? [],
    location: s.location,
  });
});

export default router;
