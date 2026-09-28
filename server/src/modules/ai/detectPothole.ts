/** Stub — swap with real model later */

export function detectPothole(_frame?: unknown, gps?: { lat: number; lng: number }) {
  const possiblePothole = Math.random() > 0.6;
  const confidence = 0.5 + Math.random() * 0.4;

  return {
    possiblePothole,
    confidence: Math.round(confidence * 100) / 100,
    location: gps || { lat: 13.0827 + (Math.random() - 0.5) * 0.01, lng: 80.2707 + (Math.random() - 0.5) * 0.01 },
    disclaimer: 'Possible pothole detection — not guaranteed',
  };
}
