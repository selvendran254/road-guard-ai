/** Stub — swap with real model later */

export function detectHelmet(_frame?: unknown) {
  const helmetDetected = Math.random() > 0.35;
  const confidence = 0.55 + Math.random() * 0.4;

  return {
    possibleHelmetMissing: !helmetDetected,
    helmetDetected,
    confidence: Math.round(confidence * 100) / 100,
    disclaimer: 'Possible helmet detection — not guaranteed',
  };
}
