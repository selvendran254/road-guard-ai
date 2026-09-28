/** Stub — swap with real TensorFlow.js / TFLite model later */

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
}

export function detectVehicle(_frame?: unknown): { vehicles: BoundingBox[]; disclaimer: string } {
  const count = Math.floor(Math.random() * 3) + 1;
  const vehicles: BoundingBox[] = Array.from({ length: count }, (_, i) => ({
    x: 0.1 + i * 0.2,
    y: 0.3 + Math.random() * 0.2,
    width: 0.15 + Math.random() * 0.1,
    height: 0.1 + Math.random() * 0.05,
    label: ['car', 'truck', 'motorcycle'][Math.floor(Math.random() * 3)],
    confidence: 0.6 + Math.random() * 0.35,
  }));

  return {
    vehicles,
    disclaimer: 'Possible vehicle detection — not guaranteed',
  };
}
