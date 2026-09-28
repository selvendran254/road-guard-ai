import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { detectVehicle } from './detectVehicle';
import { detectCollisionRisk } from './detectCollisionRisk';
import { detectHelmet } from './detectHelmet';
import { detectDrowsiness } from './detectDrowsiness';
import { detectPothole } from './detectPothole';
import { detectObstacle } from './detectObstacle';

const router = Router();

router.post('/detect/vehicle', requireAuth, (req, res) => {
  res.json(detectVehicle(req.body.frame));
});

router.post('/detect/collision-risk', requireAuth, (req, res) => {
  res.json(detectCollisionRisk(req.body.frame, req.body.sensorData));
});

router.post('/detect/helmet', requireAuth, (req, res) => {
  res.json(detectHelmet(req.body.frame));
});

router.post('/detect/drowsiness', requireAuth, (req, res) => {
  res.json(detectDrowsiness(req.body.frame));
});

router.post('/detect/pothole', requireAuth, (req, res) => {
  res.json(detectPothole(req.body.frame, req.body.gps));
});

router.post('/detect/obstacle', requireAuth, (req, res) => {
  res.json(detectObstacle(req.body.frame));
});

router.post('/analyze-all', requireAuth, (req, res) => {
  const { frame, sensorData, gps } = req.body;
  res.json({
    vehicle: detectVehicle(frame),
    collisionRisk: detectCollisionRisk(frame, sensorData),
    helmet: detectHelmet(frame),
    drowsiness: detectDrowsiness(frame),
    pothole: detectPothole(frame, gps),
    obstacle: detectObstacle(frame),
  });
});

export default router;
