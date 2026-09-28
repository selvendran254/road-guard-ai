/** Stub — swap with real model later */

const OBSTACLE_TYPES = ['debris', 'animal', 'construction', 'fallen_tree', 'unknown'];

export function detectObstacle(_frame?: unknown) {
  const possibleObstacle = Math.random() > 0.55;
  const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];

  return {
    possibleObstacle,
    type: possibleObstacle ? type : null,
    confidence: Math.round((0.5 + Math.random() * 0.45) * 100) / 100,
    location: { x: 0.3 + Math.random() * 0.4, y: 0.4 + Math.random() * 0.3 },
    disclaimer: 'Possible obstacle detection — not guaranteed',
  };
}
