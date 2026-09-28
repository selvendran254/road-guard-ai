import { Router } from 'express';

const router = Router();

router.get('/current', (req, res) => {
  const lat = parseFloat(req.query.lat as string) || 13.0827;
  const lng = parseFloat(req.query.lng as string) || 80.2707;

  const conditions = ['clear', 'cloudy', 'rain', 'fog', 'storm'];
  const condition = conditions[Math.floor(Math.abs(lat * lng * 100) % conditions.length)];
  const tempC = 28 + Math.sin(lat) * 5;
  const windKph = 10 + Math.abs(lng - 80) * 2;
  const visibility = condition === 'fog' ? 'low' : condition === 'rain' ? 'moderate' : 'good';

  let roadCondition = 'good';
  let driveAlert = 'Road conditions appear normal.';
  if (condition === 'rain') {
    roadCondition = 'wet';
    driveAlert = 'Wet roads — reduce speed and increase following distance.';
  } else if (condition === 'fog') {
    roadCondition = 'poor_visibility';
    driveAlert = 'Fog alert — use low beam headlights and drive slowly.';
  } else if (condition === 'storm') {
    roadCondition = 'hazardous';
    driveAlert = 'Storm conditions — avoid travel if possible.';
  }

  res.json({
    lat,
    lng,
    condition,
    tempC: Math.round(tempC),
    windKph: Math.round(windKph),
    visibility,
    roadCondition,
    driveAlert,
    humidity: 65 + Math.round(Math.random() * 20),
    updatedAt: new Date().toISOString(),
    disclaimer: 'Mock weather data — integrate OpenWeather API for production',
  });
});

export default router;
