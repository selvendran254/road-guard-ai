import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import { getSessionByToken } from '../../store';
import {
  gamification, parkingSpots, maintenanceReminders, insuranceClaims, firReports,
  bloodDonors, witnessReports, liveShareSessions, driverProfiles, auditLogs,
  organDonorRegistry, medicineReminders, referralCodes, sessionDevices,
  evStations, fuelStations, tollPlazas, speedCameras, leaderboard,
  defaultGamification, logAudit, cachedRoutes,
} from '../../store/featuresStore';
import { smsLogs } from '../../store';
import { newId, now } from '../../utils/helpers';

const router = Router();

function sessionId(req: { headers: { authorization?: string } }) {
  const token = req.headers.authorization?.replace('Bearer ', '') || '';
  return getSessionByToken(token)?.sessionId || '';
}

// ─── Emergency ───
router.post('/emergency/call-112', requireAuth, (req, res) => {
  logAudit(sessionId(req), 'Called 112 emergency');
  res.json({ success: true, number: '112', message: 'Dial 112 — National Emergency Number (India ERSS)' });
});

router.post('/emergency/silent-sos', requireAuth, (req, res) => {
  logAudit(sessionId(req), 'Silent SOS triggered');
  res.json({ success: true, silent: true, message: 'Silent SOS activated — no alarm sound' });
});

router.post('/emergency/sos-media', requireAuth, (req, res) => {
  const { photoBase64, videoNote } = req.body;
  logAudit(sessionId(req), 'SOS with media attached');
  res.json({ success: true, mediaReceived: !!photoBase64, videoNote: videoNote || null });
});

router.post('/emergency/auto-dial-ambulance', requireAuth, (req, res) => {
  res.json({ success: true, dialing: '+91-108', message: 'Auto-dialing ambulance helpline 108' });
});

router.post('/emergency/panic-mode', requireAuth, (req, res) => {
  const { enabled } = req.body;
  logAudit(sessionId(req), enabled ? 'Panic mode ON' : 'Panic mode OFF');
  res.json({ success: true, panicMode: !!enabled, locationHidden: !!enabled });
});

router.get('/emergency/video-call/:emergencyId', requireAuth, (req, res) => {
  res.json({ roomId: `rg-${req.params.emergencyId}`, status: 'ready', type: 'webrtc-demo' });
});

// ─── Navigation ───
router.get('/navigation/turn-by-turn', requireAuth, (req, res) => {
  const { from, to } = req.query;
  const waypoints = [
    { lat: 13.08, lng: 80.27, instruction: 'Head north on Main Road' },
    { lat: 13.085, lng: 80.265, instruction: 'Turn right at signal' },
    { lat: 13.063, lng: 80.241, instruction: 'Arrive at destination' },
  ];
  cachedRoutes.set(`${from}-${to}`, { from: String(from), to: String(to), waypoints });
  res.json({ waypoints, distanceKm: 8.4, durationMin: 22, traffic: 'moderate' });
});

router.post('/navigation/live-share/start', requireAuth, (req, res) => {
  const sid = sessionId(req);
  const { lat, lng } = req.body;
  const shareCode = `RG${Date.now().toString(36).toUpperCase()}`;
  const session = { id: `ls-${Date.now()}`, sessionId: sid, shareCode, lat, lng, updatedAt: new Date().toISOString(), active: true };
  liveShareSessions.set(sid, session);
  res.json({ ...session, shareUrl: `https://roadguard.ai/live/${shareCode}`, googleMapsUrl: `https://maps.google.com/?q=${lat},${lng}` });
});

router.post('/navigation/live-share/update', requireAuth, (req, res) => {
  const sid = sessionId(req);
  const existing = liveShareSessions.get(sid);
  if (!existing) return res.status(404).json({ error: 'No active share session' });
  existing.lat = req.body.lat;
  existing.lng = req.body.lng;
  existing.updatedAt = new Date().toISOString();
  res.json(existing);
});

router.get('/navigation/live-share/:code', (req, res) => {
  const session = [...liveShareSessions.values()].find((s) => s.shareCode === req.params.code);
  if (!session) return res.status(404).json({ error: 'Share link expired' });
  res.json(session);
});

router.get('/navigation/offline-map/regions', requireAuth, (_req, res) => {
  res.json({ regions: [{ id: 'chennai', name: 'Chennai Metro', sizeMb: 45, downloaded: false }] });
});

router.post('/navigation/offline-map/download', requireAuth, (req, res) => {
  res.json({ success: true, region: req.body.regionId, status: 'downloaded', sizeMb: 45 });
});

router.get('/navigation/traffic-route', requireAuth, (req, res) => {
  const { from, to } = req.query;
  res.json({ from, to, durationMin: 18, normalDurationMin: 25, trafficDelayMin: 7, alternativeRoutes: 2 });
});

router.get('/navigation/speed-limit', requireAuth, (req, res) => {
  const { lat, lng } = req.query;
  const latN = Number(lat), lngN = Number(lng);
  const limit = 40 + Math.floor((latN * lngN * 1000) % 40);
  res.json({ speedLimit: limit, road: 'Urban Road', unit: 'km/h', lat: latN, lng: lngN });
});

router.get('/navigation/route-heatmap/:sessionId', requireAuth, (req, res) => {
  res.json({ points: Array.from({ length: 20 }, (_, i) => ({ lat: 13.08 + i * 0.002, lng: 80.27 - i * 0.001, trips: 5 - (i % 3) })) });
});

router.post('/navigation/parking/save', requireAuth, (req, res) => {
  const sid = sessionId(req);
  const spot = { id: `park-${Date.now()}`, sessionId: sid, lat: req.body.lat, lng: req.body.lng, note: req.body.note || '', savedAt: new Date().toISOString() };
  parkingSpots.set(sid, spot);
  logAudit(sid, 'Saved parking spot');
  res.json(spot);
});

router.get('/navigation/parking', requireAuth, (req, res) => {
  const spot = parkingSpots.get(sessionId(req));
  res.json({ spot: spot || null });
});

router.get('/navigation/ev-stations', requireAuth, (req, res) => {
  res.json({ stations: evStations });
});

// ─── AI & Safety ───
router.post('/ai/dashcam/start', requireAuth, (_req, res) => {
  res.json({ recording: true, sessionId: `dash-${Date.now()}`, storageUsedMb: 0 });
});

router.post('/ai/dashcam/stop', requireAuth, (_req, res) => {
  res.json({ recording: false, clipSaved: true, clipId: `clip-${Date.now()}` });
});

router.post('/ai/audio-crash-detect', requireAuth, (req, res) => {
  const detected = Math.random() > 0.85;
  res.json({ possibleCrash: detected, confidence: detected ? 0.78 : 0.12, label: detected ? 'possible impact sound' : 'normal' });
});

router.get('/ai/advisory', requireAuth, (_req, res) => {
  res.json({
    laneDeparture: Math.random() > 0.7,
    forwardCollision: Math.random() > 0.85,
    wrongWay: false,
    seatbelt: Math.random() > 0.6,
    redLightAhead: Math.random() > 0.75,
    motorcycleLean: Math.random() > 0.9,
  });
});

router.post('/ai/obd/connect', requireAuth, (_req, res) => {
  res.json({ connected: true, device: 'OBD-II Demo', speed: 45, rpm: 2200, fuel: 68 });
});

router.get('/ai/obd/data', requireAuth, (_req, res) => {
  res.json({ speed: 42 + Math.floor(Math.random() * 20), rpm: 2000 + Math.floor(Math.random() * 800), fuel: 65, engineTemp: 88 });
});

// ─── Community ───
router.get('/community/gamification', requireAuth, (req, res) => {
  const sid = sessionId(req);
  if (!gamification.has(sid)) gamification.set(sid, defaultGamification());
  res.json(gamification.get(sid));
});

router.post('/community/gamification/points', requireAuth, (req, res) => {
  const sid = sessionId(req);
  const profile = gamification.get(sid) || defaultGamification();
  profile.points += req.body.points || 10;
  profile.level = Math.floor(profile.points / 200) + 1;
  gamification.set(sid, profile);
  res.json(profile);
});

router.get('/community/leaderboard', requireAuth, (_req, res) => {
  res.json({ leaderboard, citySafetyScore: 72, yourCity: 'Chennai' });
});

router.get('/community/certified-responders', requireAuth, (_req, res) => {
  res.json({ responders: [
    { id: 'cr-1', name: 'Dr. Meera (Certified)', distance: 0.8, rating: 4.9, certified: true },
    { id: 'cr-2', name: 'Kumar (First Aid)', distance: 1.2, rating: 4.7, certified: true },
  ]});
});

router.get('/community/blood-donors', requireAuth, (req, res) => {
  const { group } = req.query;
  let donors = bloodDonors;
  if (group) donors = donors.filter((d) => d.bloodGroup === group);
  res.json({ donors });
});

router.post('/community/blood-donor/register', requireAuth, (req, res) => {
  const sid = sessionId(req);
  const donor = { id: `bd-${Date.now()}`, sessionId: sid, name: req.body.name, bloodGroup: req.body.bloodGroup, lat: req.body.lat, lng: req.body.lng, available: true };
  bloodDonors.push(donor);
  res.json(donor);
});

router.post('/community/witness-report', requireAuth, (req, res) => {
  const sid = sessionId(req);
  const report = { id: `wr-${Date.now()}`, sessionId: sid, description: req.body.description, lat: req.body.lat, lng: req.body.lng, createdAt: new Date().toISOString() };
  witnessReports.push(report);
  res.json(report);
});

router.get('/community/feed', requireAuth, (_req, res) => {
  res.json({ posts: [
    { id: 'p1', type: 'hazard', message: 'Pothole verified on OMR', time: '5m ago', upvotes: 12 },
    { id: 'p2', type: 'safety', message: 'School zone alert active in Adyar', time: '1h ago', upvotes: 8 },
    { id: 'p3', type: 'community', message: 'Blood O+ needed near T Nagar', time: '2h ago', upvotes: 24 },
  ]});
});

router.post('/community/referral', requireAuth, (req, res) => {
  const sid = sessionId(req);
  if (!referralCodes.has(sid)) referralCodes.set(sid, { code: `RG${sid.slice(0, 6).toUpperCase()}`, referrals: 0, rewards: 0 });
  const ref = referralCodes.get(sid)!;
  if (req.body.action === 'invite') ref.referrals += 1;
  res.json(ref);
});

// ─── Medical & Insurance ───
router.post('/medical/insurance-claim', requireAuth, (req, res) => {
  const sid = sessionId(req);
  const claim = { id: `ic-${Date.now()}`, sessionId: sid, incidentDate: req.body.incidentDate, description: req.body.description, status: 'submitted' as const, createdAt: new Date().toISOString() };
  insuranceClaims.push(claim);
  res.json(claim);
});

router.get('/medical/insurance-claims', requireAuth, (req, res) => {
  res.json({ claims: insuranceClaims.filter((c) => c.sessionId === sessionId(req)) });
});

router.post('/medical/fir-report', requireAuth, (req, res) => {
  const sid = sessionId(req);
  const fir = { id: `fir-${Date.now()}`, sessionId: sid, location: req.body.location, description: req.body.description, status: 'filed' as const, createdAt: new Date().toISOString() };
  firReports.push(fir);
  res.json(fir);
});

router.get('/medical/fir-reports', requireAuth, (req, res) => {
  res.json({ reports: firReports.filter((f) => f.sessionId === sessionId(req)) });
});

router.post('/medical/teleconsult/request', requireAuth, (_req, res) => {
  res.json({ sessionId: `tc-${Date.now()}`, doctor: 'Dr. Sharma', status: 'connecting', waitMin: 2 });
});

router.post('/medical/medicine-reminder', requireAuth, (req, res) => {
  const sid = sessionId(req);
  const list = medicineReminders.get(sid) || [];
  list.push({ medicine: req.body.medicine, time: req.body.time, enabled: true });
  medicineReminders.set(sid, list);
  res.json({ reminders: list });
});

router.get('/medical/medicine-reminders', requireAuth, (req, res) => {
  res.json({ reminders: medicineReminders.get(sessionId(req)) || [] });
});

router.post('/medical/organ-donor', requireAuth, (req, res) => {
  const sid = sessionId(req);
  organDonorRegistry.set(sid, { registered: true, registeredAt: new Date().toISOString() });
  res.json({ registered: true, message: 'Organ donor registration recorded' });
});

router.get('/medical/history-export', requireAuth, (req, res) => {
  const session = getSessionByToken(req.headers.authorization?.replace('Bearer ', '') || '');
  res.json({ pdfReady: true, data: { profile: session?.profile, medical: session?.medicalProfile, exportedAt: new Date().toISOString() } });
});

router.post('/medical/ambulance-payment', requireAuth, (req, res) => {
  res.json({ success: true, amount: req.body.amount || 1500, method: 'UPI Demo', transactionId: `TXN${Date.now()}` });
});

// ─── Vehicle & Fleet ───
router.post('/vehicle/driver/add', requireAuth, (req, res) => {
  const sid = sessionId(req);
  const list = driverProfiles.get(sid) || [];
  const driver = { id: `drv-${Date.now()}`, sessionId: sid, name: req.body.name, licenseNo: req.body.licenseNo };
  list.push(driver);
  driverProfiles.set(sid, list);
  res.json(driver);
});

router.get('/vehicle/drivers', requireAuth, (req, res) => {
  res.json({ drivers: driverProfiles.get(sessionId(req)) || [] });
});

router.post('/vehicle/maintenance', requireAuth, (req, res) => {
  const sid = sessionId(req);
  const reminder = { id: `mnt-${Date.now()}`, sessionId: sid, type: req.body.type, dueDate: req.body.dueDate, vehicleReg: req.body.vehicleReg, notified: false };
  maintenanceReminders.push(reminder);
  res.json(reminder);
});

router.get('/vehicle/maintenance', requireAuth, (req, res) => {
  res.json({ reminders: maintenanceReminders.filter((m) => m.sessionId === sessionId(req)) });
});

router.get('/vehicle/fuel-stations', requireAuth, (_req, res) => {
  res.json({ stations: fuelStations });
});

router.get('/vehicle/toll-plazas', requireAuth, (_req, res) => {
  res.json({ plazas: tollPlazas });
});

router.get('/vehicle/rc-insurance-expiry', requireAuth, (req, res) => {
  const session = getSessionByToken(req.headers.authorization?.replace('Bearer ', '') || '');
  const activeVehicle = session?.vehicles?.find((v) => v.isActive) || session?.vehicles?.[0];
  res.json({ registration: activeVehicle?.number || 'TN-01-AB-1234', rcExpiry: '2026-12-15', insuranceExpiry: '2026-06-20', alerts: ['Insurance expires in 9 months'] });
});

router.get('/vehicle/behavior-score', requireAuth, (req, res) => {
  res.json({ score: 82, harshBrakes: 2, overspeedEvents: 1, smoothDriving: 94, rank: 'Good Driver' });
});

router.get('/vehicle/fleet-status', requireAuth, (_req, res) => {
  res.json({ vehicles: [{ id: 'v1', reg: 'TN-01-AB-1234', status: 'active', driver: 'You', location: 'Chennai' }] });
});

// ─── Security ───
router.post('/security/2fa/enable', requireAuth, (req, res) => {
  res.json({ enabled: true, method: 'sms', backupCodes: ['ABC123', 'DEF456', 'GHI789'] });
});

router.post('/security/data-export', requireAuth, (req, res) => {
  const session = getSessionByToken(req.headers.authorization?.replace('Bearer ', '') || '');
  logAudit(sessionId(req), 'Data export requested');
  res.json({ exportId: `exp-${Date.now()}`, includes: ['profile', 'trips', 'emergencies', 'settings'], ready: true });
});

router.post('/security/delete-account', requireAuth, (req, res) => {
  logAudit(sessionId(req), 'Account deletion requested');
  res.json({ scheduled: true, deleteAfterDays: 30, message: 'Account will be deleted in 30 days' });
});

router.post('/security/logout-all', requireAuth, (req, res) => {
  const sid = sessionId(req);
  sessionDevices.set(sid, []);
  logAudit(sid, 'Logged out all devices');
  res.json({ success: true, devicesLoggedOut: 3 });
});

router.get('/security/audit-log', requireAuth, (req, res) => {
  res.json({ logs: auditLogs.filter((l) => l.sessionId === sessionId(req)).slice(-20) });
});

router.get('/security/sessions', requireAuth, (req, res) => {
  const sid = sessionId(req);
  res.json({ devices: sessionDevices.get(sid) || [
    { deviceId: 'This Phone', lastActive: new Date().toISOString() },
    { deviceId: 'Chrome Browser', lastActive: new Date(Date.now() - 86400000).toISOString() },
  ]});
});

// ─── Integrations ───
router.post('/integrations/whatsapp-alert', requireAuth, (req, res) => {
  const { message, phone } = req.body;
  smsLogs.push({
    id: newId('sms'), emergencyId: 'whatsapp', sessionId: sessionId(req),
    toPhone: phone || '+919999999999', toName: 'WhatsApp', message: `[WhatsApp Demo] ${message}`,
    status: 'sent', createdAt: now(),
  });
  res.json({ sent: true, channel: 'whatsapp-demo', message });
});

router.post('/integrations/telegram-sos', requireAuth, (req, res) => {
  res.json({ sent: true, bot: '@RoadGuardSOSBot', chatId: 'demo-chat', message: req.body.message });
});

router.post('/integrations/google-signin', requireAuth, (_req, res) => {
  res.json({ success: true, provider: 'google', email: 'user@gmail.com', linked: true });
});

router.post('/integrations/apple-signin', requireAuth, (_req, res) => {
  res.json({ success: true, provider: 'apple', linked: true });
});

router.post('/integrations/aadhaar-verify', requireAuth, (req, res) => {
  res.json({ verified: true, last4: req.body.aadhaar?.slice(-4) || 'XXXX', name: 'Verified User' });
});

router.post('/integrations/digilocker', requireAuth, (_req, res) => {
  res.json({ linked: true, documents: ['Medical Certificate', 'Driving License'] });
});

router.post('/integrations/upi-payment', requireAuth, (req, res) => {
  res.json({ success: true, upiId: 'roadguard@upi', amount: req.body.amount, txnId: `UPI${Date.now()}` });
});

router.post('/integrations/alexa-skill', requireAuth, (_req, res) => {
  res.json({ enabled: true, phrase: 'Alexa, ask RoadGuard to send SOS' });
});

// ─── Alerts ───
router.get('/alerts/speed-cameras', requireAuth, (req, res) => {
  res.json({ cameras: speedCameras });
});

router.get('/alerts/red-light', requireAuth, (_req, res) => {
  res.json({ alerts: [{ lat: 13.058, lng: 80.262, distance: 400, message: 'Red light camera ahead' }] });
});

router.get('/alerts/school-bus', requireAuth, (_req, res) => {
  res.json({ zones: [{ lat: 13.001, lng: 80.257, message: 'School bus stop — slow down', active: true }] });
});

router.get('/alerts/railway-crossing', requireAuth, (_req, res) => {
  res.json({ crossings: [{ lat: 13.075, lng: 80.285, name: 'Chennai Central Crossing', gateStatus: 'closed' }] });
});

// ─── Roadside ───
router.post('/roadside/assistance', requireAuth, (req, res) => {
  const { type } = req.body;
  res.json({ requestId: `rsa-${Date.now()}`, type, eta: 25, provider: 'RoadGuard Assist', status: 'dispatched' });
});

router.get('/roadside/assistance/types', requireAuth, (_req, res) => {
  res.json({ types: ['Tow Truck', 'Flat Tire', 'Fuel Delivery', 'Battery Jump', 'Lockout Help'] });
});

// ─── Feature catalog ───
router.get('/catalog', requireAuth, (_req, res) => {
  res.json({
    totalFeatures: 87,
    categories: ['Emergency', 'Navigation', 'AI & Safety', 'Community', 'Medical', 'Vehicle', 'Security', 'Integrations', 'Alerts', 'Roadside'],
    version: '2.0.0',
  });
});

export default router;
