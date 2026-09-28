/** Stub — swap with real model later */

export function detectDrowsiness(_frame?: unknown) {
  const possibleDrowsiness = Math.random() > 0.75;
  const confidence = 0.5 + Math.random() * 0.45;

  return {
    possibleDrowsiness,
    confidence: Math.round(confidence * 100) / 100,
    disclaimer: 'Possible drowsiness detection — not guaranteed',
  };
}
