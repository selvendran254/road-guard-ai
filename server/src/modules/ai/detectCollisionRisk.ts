/** Stub — swap with real model later */

export interface SensorData {
  speed?: number;
  acceleration?: number;
  heading?: number;
}

export function detectCollisionRisk(_frame?: unknown, sensorData?: SensorData) {
  const baseRisk = Math.random() * 0.4;
  const speedFactor = sensorData?.speed ? Math.min(sensorData.speed / 120, 0.3) : 0;
  const riskScore = Math.min(baseRisk + speedFactor, 0.95);

  return {
    possibleCollisionRisk: riskScore > 0.5,
    riskScore: Math.round(riskScore * 100) / 100,
    level: riskScore > 0.7 ? 'high' : riskScore > 0.4 ? 'medium' : 'low',
    disclaimer: 'Possible collision risk — not guaranteed detection',
  };
}
