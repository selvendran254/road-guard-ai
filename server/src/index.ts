import express from 'express';
import cors from 'cors';
import http from 'http';
import { setupSockets } from './sockets';

import authRoutes from './modules/auth/routes';
import profileRoutes from './modules/profile/routes';
import profileAliases from './modules/profile/aliases';
import emergencyRoutes from './modules/emergency/routes';
import accidentRoutes from './modules/accident-detection/routes';
import hazardRoutes from './modules/hazards/routes';
import locationRoutes from './modules/location/routes';
import ambulanceRoutes from './modules/ambulance/routes';
import hospitalRoutes from './modules/hospital/routes';
import bloodBankRoutes from './modules/blood-bank/routes';
import notificationRoutes from './modules/notifications/routes';
import authorityRoutes from './modules/authority/routes';
import aiRoutes from './modules/ai/routes';
import weatherRoutes from './modules/weather/routes';
import tripRoutes from './modules/trips/routes';
import chatRoutes from './modules/chat/routes';
import geofenceRoutes from './modules/geofence/routes';
import wearableRoutes from './modules/wearable/routes';
import medicalQrRoutes from './modules/medical-qr/routes';
import communityRoutes from './modules/community/routes';
import firstAidRoutes from './modules/first-aid/routes';
import featuresRoutes from './modules/features/routes';

const app = express();
const server = http.createServer(app);
const io = setupSockets(server);
app.set('io', io);

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'RoadGuard AI Backend', storage: 'in-memory (resets on restart)' });
});

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/', profileAliases);
app.use('/emergency', emergencyRoutes);
app.use('/accident', accidentRoutes);
app.use('/hazards', hazardRoutes);
app.use('/location', locationRoutes);
app.use('/route', locationRoutes);
app.use('/ambulances', ambulanceRoutes);
app.use('/ambulance', ambulanceRoutes);
app.use('/hospitals', hospitalRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/blood-banks', bloodBankRoutes);
app.use('/blood-request', bloodBankRoutes);
app.use('/notifications', notificationRoutes);
app.use('/authority', authorityRoutes);
app.use('/ai', aiRoutes);
app.use('/weather', weatherRoutes);
app.use('/trips', tripRoutes);
app.use('/chat', chatRoutes);
app.use('/geofence', geofenceRoutes);
app.use('/wearable', wearableRoutes);
app.use('/medical-qr', medicalQrRoutes);
app.use('/community', communityRoutes);
app.use('/first-aid', firstAidRoutes);
app.use('/features', featuresRoutes);

app.get('/api-docs', (_req, res) => {
  res.json({
    service: 'RoadGuard AI API',
    version: '1.1.0',
    endpoints: {
      auth: ['POST /auth/signup', 'POST /auth/login', 'POST /auth/verify-otp', 'POST /auth/logout', 'GET /auth/session'],
      emergency: ['POST /emergency/sos', 'POST /emergency/cancel', 'GET /emergency/active/:sessionId'],
      hazards: ['POST /hazards/report', 'GET /hazards/nearby', 'POST /hazards/:id/confirm'],
      weather: ['GET /weather/current?lat&lng'],
      trips: ['POST /trips/start', 'POST /trips/update', 'POST /trips/end', 'GET /trips/history/:sessionId'],
      chat: ['GET /chat/:emergencyId', 'POST /chat/:emergencyId/send'],
      geofence: ['GET /geofence/check?lat&lng', 'GET /geofence/black-spots'],
      wearable: ['POST /wearable/connect', 'GET /wearable/status', 'POST /wearable/signal'],
      medicalQr: ['GET /medical-qr/generate'],
      authority: ['GET /authority/analytics', 'GET /authority/sms-logs', 'GET /authority/analytics/export'],
    },
  });
});

server.listen(PORT, () => {
  console.log(`RoadGuard AI server running on http://localhost:${PORT}`);
  console.log('Storage: in-memory only — data resets on restart');
});

export default app;
