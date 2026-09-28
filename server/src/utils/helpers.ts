import { v4 as uuidv4 } from 'uuid';
import { sosThrottle } from '../store';

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function newId(prefix = ''): string {
  return prefix ? `${prefix}-${uuidv4().slice(0, 8)}` : uuidv4();
}

export function now(): string {
  return new Date().toISOString();
}

export function checkSosThrottle(sessionId: string, windowMs = 60000, maxAttempts = 3): boolean {
  const timestamps: number[] = sosThrottle.get(sessionId) || [];
  const nowTs = Date.now();
  const recent = timestamps.filter((t) => nowTs - t < windowMs);
  if (recent.length >= maxAttempts) return false;
  recent.push(nowTs);
  sosThrottle.set(sessionId, recent);
  return true;
}
