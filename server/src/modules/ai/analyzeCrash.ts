/** Stub — swap with real sensor fusion model later */

export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

export interface GyroscopeData {
  x: number;
  y: number;
  z: number;
}

export interface GpsData {
  lat: number;
  lng: number;
  speed?: number;
}

export function analyzeCrash(
  accelerometer?: AccelerometerData,
  gyroscope?: GyroscopeData,
  gps?: GpsData
) {
  let crashScore = 0;

  if (accelerometer) {
    const magnitude = Math.sqrt(accelerometer.x ** 2 + accelerometer.y ** 2 + accelerometer.z ** 2);
    if (magnitude > 25) crashScore += 0.5;
    else if (magnitude > 15) crashScore += 0.3;
  }

  if (gyroscope) {
    const rotMagnitude = Math.sqrt(gyroscope.x ** 2 + gyroscope.y ** 2 + gyroscope.z ** 2);
    if (rotMagnitude > 5) crashScore += 0.3;
  }

  if (gps?.speed && gps.speed > 60) crashScore += 0.1;

  // Random factor for demo when no strong sensor signal
  if (crashScore < 0.3) crashScore = Math.random() * 0.5;

  const possibleCrash = crashScore > 0.45;

  return {
    possibleCrash,
    confidence: Math.round(Math.min(crashScore, 0.95) * 100) / 100,
    disclaimer: 'Possible crash detection — never guaranteed. Always confirm manually.',
  };
}
